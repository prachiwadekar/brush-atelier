import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Endpoint to refresh the coaching session data (to get newly generated images)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const coachingSession = await prisma.coachingSession.findUnique({
      where: { sessionId },
      select: {
        paintingGuide: true,
      },
    });

    if (!coachingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const paintingGuide = JSON.parse(coachingSession.paintingGuide);

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
