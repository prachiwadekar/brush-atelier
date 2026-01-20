import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Endpoint to refresh the coaching session data (to get newly generated images)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Fetch session and verify ownership
    const coachingSession = await prisma.coachingSession.findUnique({
      where: { sessionId },
      select: {
        userId: true,
        paintingGuide: true,
      },
    });

    if (!coachingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify user owns this session
    if (coachingSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Safe JSON parsing
    let paintingGuide;
    try {
      paintingGuide = JSON.parse(coachingSession.paintingGuide);
    } catch {
      return NextResponse.json({ error: "Invalid session data" }, { status: 500 });
    }

    return NextResponse.json({
      painting_guide: paintingGuide,
    });
  } catch (error) {
    console.error("Error refreshing session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
