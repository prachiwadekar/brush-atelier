import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, password: true },
    });

    // Always return success to prevent email enumeration
    // but only send email if user exists with a password
    if (user && user.password) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Create reset URL
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

      // TODO: Send email with reset link
      // For now, log it to console in development
      if (process.env.NODE_ENV === "development") {
        console.log("\n==========================================");
        console.log("PASSWORD RESET REQUEST");
        console.log("==========================================");
        console.log(`User: ${user.name || user.email}`);
        console.log(`Email: ${user.email}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log(`Token expires: ${resetTokenExpiry.toISOString()}`);
        console.log("==========================================\n");
      }

      // In production, you would send an actual email here:
      // await sendPasswordResetEmail(user.email, user.name || 'there', resetUrl);
    } else if (user && !user.password) {
      // User exists but signed up with OAuth (no password)
      // Don't send reset email, but still return success
      console.log(`User ${email} tried to reset password but account is OAuth-only`);
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
