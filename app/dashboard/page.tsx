import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Database from "better-sqlite3";
import DashboardClient from "@/components/dashboard/dashboard-client";
import { getDbPath } from "@/lib/db-config";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Use direct database connection to avoid Prisma adapter issues
  const db = new Database(getDbPath());

  const user: any = db.prepare(`
    SELECT u.*,
           sp.id as studentProfileId, sp.skillLevel, sp.interests, sp.bio
    FROM User u
    LEFT JOIN StudentProfile sp ON u.id = sp.userId
    WHERE u.id = ?
  `).get(session.user.id);

  db.close();

  if (!user) {
    redirect("/auth/signin");
  }

  // Check if user has completed onboarding
  if (!user.studentProfileId) {
    redirect("/onboarding");
  }

  // Reconstruct profile object
  const userWithProfile = {
    ...user,
    studentProfile: user.studentProfileId ? {
      id: user.studentProfileId,
      skillLevel: user.skillLevel,
      interests: user.interests,
      bio: user.bio,
    } : null,
  };

  return <DashboardClient userWithProfile={userWithProfile} />;
}
