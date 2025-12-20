import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Database from "better-sqlite3";
import { getDbPath } from "@/lib/db-config";

const DB_PATH = getDbPath();

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

    const db = new Database(DB_PATH);

    // Verify the session belongs to the user and update status
    const result = db.prepare(`
      UPDATE CoachingSession
      SET artworkStatus = 'COMPLETE', updatedAt = ?
      WHERE sessionId = ? AND userId = ?
    `).run(new Date().toISOString(), sessionId, session.user.id);

    db.close();

    if (result.changes === 0) {
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
