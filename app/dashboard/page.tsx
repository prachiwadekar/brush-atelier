import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/dashboard-client";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      studentProfile: {
        select: {
          id: true,
          skillLevel: true,
          interests: true,
          bio: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Check if user has completed onboarding
  if (!user.studentProfile) {
    redirect("/onboarding");
  }

  // Format user object for compatibility with component
  const userWithProfile = {
    name: user.name || "",
    studentProfile: {
      id: user.studentProfile.id,
      skillLevel: user.studentProfile.skillLevel || "",
      interests: user.studentProfile.interests,
      bio: user.studentProfile.bio,
    },
  };

  return <DashboardClient userWithProfile={userWithProfile} />;
}
