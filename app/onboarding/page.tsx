import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/onboarding/onboarding-form";
import Database from "better-sqlite3";
import { getDbPath } from "@/lib/db-config";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Use direct database connection to avoid Prisma adapter issues
  const db = new Database(getDbPath());

  const user: any = db.prepare(`
    SELECT u.*,
           ap.id as artistProfileId,
           sp.id as studentProfileId
    FROM User u
    LEFT JOIN ArtistProfile ap ON u.id = ap.userId
    LEFT JOIN StudentProfile sp ON u.id = sp.userId
    WHERE u.id = ?
  `).get(session.user.id);

  db.close();

  if (!user) {
    redirect("/auth/signin");
  }

  // Check if user has already completed onboarding
  if (user.artistProfileId || user.studentProfileId) {
    redirect("/dashboard");
  }

  // Reconstruct user object for compatibility
  const userWithProfiles = {
    ...user,
    artistProfile: user.artistProfileId ? { id: user.artistProfileId } : null,
    studentProfile: user.studentProfileId ? { id: user.studentProfileId } : null,
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
      {/* Decorative soft shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#D1E231]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#D1E231]/10 rounded-full blur-3xl"></div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#D1E231] mb-2">Complete Your Profile</h1>
          <p className="text-gray-300">Tell us a bit about yourself to get started</p>
        </div>

        <OnboardingForm user={userWithProfiles} />
      </div>
    </div>
  );
}
