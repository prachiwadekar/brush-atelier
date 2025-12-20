import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Database from "better-sqlite3";
import { randomBytes } from "crypto";
import { getDbPath } from "@/lib/db-config";

// Generate a CUID-like ID
function generateCuid() {
  return 'c' + randomBytes(12).toString('base64').replace(/[^a-z0-9]/gi, '').substring(0, 24);
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, bio, specialization, hourlyRate, yearsOfExperience, interests, skillLevel } = body;

    const db = new Database(getDbPath());
    const now = new Date().toISOString();

    // Update user role
    db.prepare('UPDATE User SET role = ?, updatedAt = ? WHERE id = ?')
      .run(role, now, session.user.id);

    if (role === "ARTIST") {
      const profileId = generateCuid();
      const spec = Array.isArray(specialization) ? specialization.join(", ") : specialization;

      db.prepare(`
        INSERT INTO ArtistProfile (id, userId, bio, specialization, hourlyRate, yearsOfExperience, verificationStatus, availableForMentorship, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 1, ?, ?)
      `).run(
        profileId,
        session.user.id,
        bio || null,
        spec,
        parseFloat(hourlyRate),
        parseInt(yearsOfExperience) || null,
        now,
        now
      );
    } else if (role === "STUDENT") {
      const profileId = generateCuid();
      const ints = Array.isArray(interests) ? interests.join(", ") : interests;

      db.prepare(`
        INSERT INTO StudentProfile (id, userId, bio, interests, skillLevel, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        profileId,
        session.user.id,
        bio || null,
        ints,
        skillLevel || null,
        now,
        now
      );
    }

    db.close();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    console.error("Error message:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
