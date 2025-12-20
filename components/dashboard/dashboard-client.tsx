"use client";

import { useState } from "react";
import DashboardLayout from "./dashboard-layout";
import DashboardTabs from "./dashboard-tabs";

interface DashboardClientProps {
  userWithProfile: {
    name: string;
    studentProfile?: {
      id: string;
      skillLevel: string;
      interests: string;
      bio: string | null;
    } | null;
  };
}

export default function DashboardClient({ userWithProfile }: DashboardClientProps) {
  const [activeView, setActiveView] = useState<"portfolio" | "new-artwork">("portfolio");

  return (
    <DashboardLayout
      userName={userWithProfile.name}
      activeView={activeView}
      onViewChange={setActiveView}
    >
      <DashboardTabs
        userWithProfile={userWithProfile}
        activeView={activeView}
        onViewChange={setActiveView}
      />
    </DashboardLayout>
  );
}
