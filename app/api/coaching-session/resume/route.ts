import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Database from "better-sqlite3";
import { getDbPath } from "@/lib/db-config";

const DB_PATH = getDbPath();

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

    const db = new Database(DB_PATH);

    // Get the coaching session
    const coachingSession: any = db.prepare(`
      SELECT * FROM CoachingSession
      WHERE sessionId = ? AND userId = ?
    `).get(sessionId, session.user.id);

    if (!coachingSession) {
      db.close();
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get chat history
    const chatMessages: any[] = db.prepare(`
      SELECT role, message, createdAt
      FROM ChatMessage
      WHERE coachingSessionId = ?
      ORDER BY createdAt ASC
    `).all(coachingSession.id);

    db.close();

    // Parse the painting guide
    const storedGuide = JSON.parse(coachingSession.paintingGuide);

    // Extract the quick guide (supports both old and new format)
    const quickGuide = storedGuide.quickGuide || null;

    // Format chat history
    const chatHistory = chatMessages.map(msg => ({
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
