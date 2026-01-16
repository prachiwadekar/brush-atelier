import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/onboarding/onboarding-form";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen bg-[#FBF7F2] relative overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Decorative soft shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#2563EB]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#C2410C]/10 rounded-full blur-3xl"></div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Logo with BETA tag */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="Brush Atelier Logo"
              width={48}
              height={48}
              className="w-12 h-12"
              unoptimized
            />
            <h1 className="text-3xl font-bold relative">
              <span className="text-[#C2410C]">Brush</span>{" "}
              <span className="text-[#1F2933]">Atelier</span>
              <span className="absolute -top-2 -right-12 bg-[#2563EB] text-white text-[0.5rem] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                BETA
              </span>
            </h1>
          </Link>

          {/* Feedback Banner */}
          <div className="mb-6">
            <div className="bg-red-500/80 px-4 py-2 rounded-lg shadow-sm inline-block">
              <p className="text-xs sm:text-sm text-white font-bold text-center">
                Your feedback means a lot—write to us at{' '}
                <a href="mailto:team.brushatelier@gmail.com" className="underline hover:text-white/90 transition-colors">
                  team.brushatelier@gmail.com
                </a>
              </p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2933] mb-2">Complete Your Profile</h2>
          <p className="text-[#1F2933]/70">Just 2 quick steps to get started</p>
        </div>

        <OnboardingForm user={userWithProfiles} />
      </div>
    </div>
  );
}
