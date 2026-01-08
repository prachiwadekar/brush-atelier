import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Add a portfolio item
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const imageData = formData.get("imageData") as string; // base64 image data
    const medium = formData.get("medium") as string;
    const title = formData.get("title") as string || "Untitled Artwork";
    const sessionId = formData.get("sessionId") as string | null;

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    // Get the student profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        studentProfile: {
          select: { id: true },
        },
      },
    });

    if (!user?.studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const description = medium ? `Created with ${medium}` : null;

    // If sessionId provided, get the coaching session ID from database
    let coachingSessionDbId = null;
    if (sessionId) {
      const coachingSession = await prisma.coachingSession.findUnique({
        where: { sessionId },
        select: { id: true },
      });
      coachingSessionDbId = coachingSession?.id || null;
    }

    // Create portfolio item
    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        title,
        description,
        imageUrl: imageData,
        studentProfileId: user.studentProfile.id,
        coachingSessionId: coachingSessionDbId,
      },
    });

    return NextResponse.json({
      success: true,
      portfolioId: portfolioItem.id,
      message: "Added to portfolio successfully!"
    });
  } catch (error: any) {
    console.error("Error adding to portfolio:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add to portfolio" },
      { status: 500 }
    );
  }
}

// Get all portfolio items for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get portfolio items with coaching session data
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        studentProfile: {
          userId: session.user.id,
        },
      },
      include: {
        coachingSession: {
          select: {
            sessionId: true,
            medium: true,
            artworkStatus: true,
            estimatedTime: true,
            currentStep: true,
            totalSteps: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response to match the expected structure
    const formattedItems = portfolioItems.map(item => {
      console.log('Portfolio item:', {
        id: item.id,
        title: item.title,
        hasCoachingSession: !!item.coachingSession,
        coachingSessionId: item.coachingSessionId,
        sessionData: item.coachingSession ? {
          sessionId: item.coachingSession.sessionId,
          artworkStatus: item.coachingSession.artworkStatus,
          medium: item.coachingSession.medium
        } : null
      });

      return {
        ...item,
        sessionId: item.coachingSession?.sessionId,
        sessionMedium: item.coachingSession?.medium,
        artworkStatus: item.coachingSession?.artworkStatus?.toLowerCase().replace('_', '-'),
        estimatedTime: item.coachingSession?.estimatedTime,
        currentStep: item.coachingSession?.currentStep,
        totalSteps: item.coachingSession?.totalSteps,
        sessionUpdatedAt: item.coachingSession?.updatedAt,
        coachingSession: undefined, // Remove nested object to match flat structure
      };
    });

    console.log('Returning formatted items:', formattedItems.map(i => ({
      id: i.id,
      sessionId: i.sessionId,
      artworkStatus: i.artworkStatus
    })));

    return NextResponse.json({ portfolioItems: formattedItems });
  } catch (error: any) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

// Delete a portfolio item
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get("id");

    if (!portfolioId) {
      return NextResponse.json({ error: "Portfolio ID required" }, { status: 400 });
    }

    // First, get the portfolio item to check ownership and get the coaching session ID
    const portfolioItem = await prisma.portfolioItem.findFirst({
      where: {
        id: portfolioId,
        studentProfile: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        coachingSessionId: true,
      },
    });

    if (!portfolioItem) {
      return NextResponse.json({ error: "Portfolio item not found or unauthorized" }, { status: 404 });
    }

    // Delete the coaching session and its chat messages if it exists
    if (portfolioItem.coachingSessionId) {
      await prisma.coachingSession.delete({
        where: {
          id: portfolioItem.coachingSessionId,
        },
      });
    }

    // Delete the portfolio item
    await prisma.portfolioItem.delete({
      where: {
        id: portfolioId,
      },
    });

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting portfolio item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}
