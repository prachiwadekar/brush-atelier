import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Resume a coaching session
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Get the coaching session with chat history
    const coachingSession = await prisma.coachingSession.findFirst({
      where: {
        sessionId,
        userId: session.user.id,
      },
      include: {
        chatMessages: {
          select: {
            role: true,
            message: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!coachingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Parse the painting guide
    const storedGuide = JSON.parse(coachingSession.paintingGuide);

    // Extract the quick guide (supports both old and new format)
    const quickGuide = storedGuide.quickGuide || null;

    // Format chat history
    const chatHistory = coachingSession.chatMessages.map(msg => ({
      role: msg.role,
      message: msg.message
    }));

    return NextResponse.json({
      sessionId: coachingSession.sessionId,
      medium: coachingSession.medium,
      skillLevel: coachingSession.skillLevel,
      paintingGuide: quickGuide,
      estimatedTime: coachingSession.estimatedTime,
      artworkStatus: coachingSession.artworkStatus.toLowerCase().replace('_', '-'),
      currentStep: coachingSession.currentStep,
      totalSteps: coachingSession.totalSteps,
      chatHistory: chatHistory,
      imageUrl: coachingSession.imageUrl
    });
  } catch (error: any) {
    console.error("Error resuming session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resume session" },
      { status: 500 }
    );
  }
}
