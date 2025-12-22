import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/onboarding/onboarding-form";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      artistProfile: { select: { id: true } },
      studentProfile: { select: { id: true } },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Check if user has already completed onboarding
  if (user.artistProfile || user.studentProfile) {
    redirect("/dashboard");
  }

  // User object is already in the correct format with profiles
  const userWithProfiles = user;

  return (
    <div className="min-h-screen bg-[#FBF7F2] relative overflow-hidden flex items-center justify-center px-4">
      {/* Decorative soft shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#2563EB]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#C2410C]/10 rounded-full blur-3xl"></div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1F2933] mb-2">Complete Your Profile</h1>
          <p className="text-[#1F2933]/70">Tell us a bit about yourself to get started</p>
        </div>

        <OnboardingForm user={userWithProfiles} />
      </div>
    </div>
  );
}
