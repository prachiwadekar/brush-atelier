import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: {
          where: { provider: "pinterest" },
        },
        artistProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const pinterestAccount = user.accounts[0];
    if (!pinterestAccount || !pinterestAccount.access_token) {
      return NextResponse.json(
        { error: "Pinterest account not connected" },
        { status: 400 }
      );
    }

    const profileId = user.artistProfile?.id || user.studentProfile?.id;
    if (!profileId) {
      return NextResponse.json(
        { error: "Profile not set up" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.pinterest.com/v5/pins?page_size=25`,
      {
        headers: {
          Authorization: `Bearer ${pinterestAccount.access_token}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Pinterest pins" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const pins = data.items || [];

    const importedItems = [];
    for (const pin of pins) {
      const portfolioItem = await prisma.portfolioItem.create({
        data: {
          title: pin.title || pin.description?.substring(0, 100) || "Untitled",
          description: pin.description || null,
          imageUrl: pin.media?.images?.["600x"]?.url || pin.media?.images?.original?.url,
          thumbnailUrl: pin.media?.images?.["236x"]?.url,
          artistProfileId: user.artistProfile?.id,
          studentProfileId: user.studentProfile?.id,
        },
      });
      importedItems.push(portfolioItem);
    }

    return NextResponse.json({
      success: true,
      imported: importedItems.length,
      items: importedItems,
    });
  } catch (error) {
    console.error("Pinterest import error:", error);
    return NextResponse.json(
      { error: "Failed to import from Pinterest" },
      { status: 500 }
    );
  }
}
