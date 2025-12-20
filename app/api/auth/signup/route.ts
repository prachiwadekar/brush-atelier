import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { randomBytes } from "crypto";
import { getDbPath } from "@/lib/db-config";

// Direct database connection
const db = new Database(getDbPath());

// Generate a CUID-like ID
function generateCuid() {
  return 'c' + randomBytes(12).toString('base64').replace(/[^a-z0-9]/gi, '').substring(0, 24);
}

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM User WHERE email = ?').get(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateCuid();
    const now = new Date().toISOString();
    const userName = name || email.split("@")[0];

    // Create user
    const insert = db.prepare(`
      INSERT INTO User (id, email, password, name, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(userId, email, hashedPassword, userName, 'STUDENT', now, now);

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: userId,
        email,
        name: userName,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
