import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Database from "better-sqlite3";
import { getDbPath } from "@/lib/db-config";

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

    const db = new Database(getDbPath());

    // Get the student profile ID
    const user: any = db.prepare(`
      SELECT sp.id as studentProfileId
      FROM User u
      LEFT JOIN StudentProfile sp ON u.id = sp.userId
      WHERE u.id = ?
    `).get(session.user.id);

    if (!user?.studentProfileId) {
      db.close();
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Insert portfolio item
    const portfolioId = `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const description = medium ? `Created with ${medium}` : null;

    // If sessionId provided, get the coaching session ID from database
    let coachingSessionDbId = null;
    if (sessionId) {
      const coachingSession: any = db.prepare(`
        SELECT id FROM CoachingSession WHERE sessionId = ?
      `).get(sessionId);
      coachingSessionDbId = coachingSession?.id || null;
    }

    db.prepare(`
      INSERT INTO PortfolioItem (id, title, description, imageUrl, studentProfileId, coachingSessionId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(portfolioId, title, description, imageData, user.studentProfileId, coachingSessionDbId);

    db.close();

    return NextResponse.json({
      success: true,
      portfolioId,
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

    const db = new Database(getDbPath());

    // Get portfolio items with coaching session data
    const portfolioItems = db.prepare(`
      SELECT
        p.*,
        cs.sessionId,
        cs.medium as sessionMedium,
        cs.artworkStatus,
        cs.estimatedTime,
        cs.currentStep,
        cs.totalSteps,
        cs.updatedAt as sessionUpdatedAt
      FROM PortfolioItem p
      INNER JOIN StudentProfile sp ON p.studentProfileId = sp.id
      LEFT JOIN CoachingSession cs ON p.coachingSessionId = cs.id
      WHERE sp.userId = ?
      ORDER BY p.createdAt DESC
    `).all(session.user.id);

    db.close();

    return NextResponse.json({ portfolioItems });
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

    const db = new Database(getDbPath());

    // Verify ownership and delete
    const result = db.prepare(`
      DELETE FROM PortfolioItem
      WHERE id = ? AND studentProfileId IN (
        SELECT id FROM StudentProfile WHERE userId = ?
      )
    `).run(portfolioId, session.user.id);

    db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: "Portfolio item not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting portfolio item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}
