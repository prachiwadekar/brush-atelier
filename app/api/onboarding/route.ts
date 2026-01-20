import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Onboarding request body:", body);
    const { role, bio, specialization, hourlyRate, yearsOfExperience, interests, skillLevel, goal, coachingStyle } = body;

    // Update user role
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });

    if (role === "ARTIST") {
      const spec = Array.isArray(specialization) ? specialization.join(", ") : specialization;

      // Validate hourlyRate
      const parsedHourlyRate = parseFloat(hourlyRate);
      if (isNaN(parsedHourlyRate) || parsedHourlyRate < 0) {
        return NextResponse.json({ error: "Invalid hourly rate" }, { status: 400 });
      }

      // Validate yearsOfExperience if provided
      const parsedYears = yearsOfExperience ? parseInt(yearsOfExperience) : null;
      if (yearsOfExperience && (isNaN(parsedYears!) || parsedYears! < 0)) {
        return NextResponse.json({ error: "Invalid years of experience" }, { status: 400 });
      }

      await prisma.artistProfile.create({
        data: {
          userId: session.user.id,
          bio: bio || null,
          specialization: spec,
          hourlyRate: parsedHourlyRate,
          yearsOfExperience: parsedYears,
          verificationStatus: "PENDING",
          availableForMentorship: true,
        },
      });
    } else if (role === "STUDENT") {
      const ints = Array.isArray(interests) ? interests.join(", ") : interests;

      // Check if student profile already exists
      const existingProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
      });

      console.log("Existing profile check:", { userId: session.user.id, exists: !!existingProfile });

      const profileData = {
        bio: bio || null,
        interests: ints || "General Painting",
        skillLevel: skillLevel || null,
        goal: goal || null,
        coachingStyle: coachingStyle || null,
      };

      console.log("Profile data to save:", profileData);

      if (existingProfile) {
        // Update existing profile
        console.log("Updating existing profile");
        await prisma.studentProfile.update({
          where: { userId: session.user.id },
          data: profileData,
        });
      } else {
        // Create new profile
        console.log("Creating new profile");
        await prisma.studentProfile.create({
          data: {
            userId: session.user.id,
            ...profileData,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === "development"
      ? `${error.message || "Internal server error"}`
      : "Internal server error";

    return NextResponse.json({
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}
