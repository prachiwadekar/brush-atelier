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
    const { role, bio, specialization, hourlyRate, yearsOfExperience, interests, skillLevel } = body;

    // Update user role
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });

    if (role === "ARTIST") {
      const spec = Array.isArray(specialization) ? specialization.join(", ") : specialization;

      await prisma.artistProfile.create({
        data: {
          userId: session.user.id,
          bio: bio || null,
          specialization: spec,
          hourlyRate: parseFloat(hourlyRate),
          yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          verificationStatus: "PENDING",
          availableForMentorship: true,
        },
      });
    } else if (role === "STUDENT") {
      const ints = Array.isArray(interests) ? interests.join(", ") : interests;

      await prisma.studentProfile.create({
        data: {
          userId: session.user.id,
          bio: bio || null,
          interests: ints,
          skillLevel: skillLevel || null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    console.error("Error message:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
