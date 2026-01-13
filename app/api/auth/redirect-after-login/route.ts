import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Check if user has completed onboarding by checking for profiles
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        studentProfile: true,
        artistProfile: true,
      },
    });

    // If they don't have any profile yet, they're a new user
    const isNewUser = !user?.studentProfile && !user?.artistProfile;

    if (isNewUser) {
      // New user - send to onboarding
      return NextResponse.redirect(new URL("/onboarding", request.url));
    } else {
      // Existing user - send to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (error) {
    console.error("Error in redirect-after-login:", error);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}
