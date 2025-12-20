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
          where: { provider: "instagram" },
        },
        artistProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const instagramAccount = user.accounts[0];
    if (!instagramAccount || !instagramAccount.access_token) {
      return NextResponse.json(
        { error: "Instagram account not connected" },
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
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${instagramAccount.access_token}`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Instagram media" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const mediaItems = data.data || [];

    const importedItems = [];
    for (const item of mediaItems.slice(0, 20)) {
      if (item.media_type === "IMAGE" || item.media_type === "CAROUSEL_ALBUM") {
        const portfolioItem = await prisma.portfolioItem.create({
          data: {
            title: item.caption?.substring(0, 100) || "Untitled",
            description: item.caption || null,
            imageUrl: item.media_url,
            thumbnailUrl: item.thumbnail_url || item.media_url,
            artistProfileId: user.artistProfile?.id,
            studentProfileId: user.studentProfile?.id,
          },
        });
        importedItems.push(portfolioItem);
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedItems.length,
      items: importedItems,
    });
  } catch (error) {
    console.error("Instagram import error:", error);
    return NextResponse.json(
      { error: "Failed to import from Instagram" },
      { status: 500 }
    );
  }
}
