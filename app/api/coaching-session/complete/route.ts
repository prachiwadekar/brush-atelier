import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Mark a coaching session as complete
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Verify the session belongs to the user and update status
    const result = await prisma.coachingSession.updateMany({
      where: {
        sessionId,
        userId: session.user.id,
      },
      data: {
        artworkStatus: "COMPLETE",
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Session marked as complete"
    });
  } catch (error: any) {
    console.error("Error marking session as complete:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark session as complete" },
      { status: 500 }
    );
  }
}
