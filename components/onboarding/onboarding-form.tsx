"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import Image from "next/image";

interface OnboardingFormProps {
  user: User | null;
}

export default function OnboardingForm({ user }: OnboardingFormProps) {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "STUDENT",
          goal: selectedGoals.join(", "),
          coachingStyle: selectedStyles.join(", "),
          interests: "General Painting",
          skillLevel: "Beginner",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Take user to their portfolio page (dashboard defaults to portfolio view)
        window.location.href = "/dashboard";
      } else {
        console.error("Onboarding error response:", data);
        alert(`Error: ${data.error || "Something went wrong. Please try again."}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const canProceedFromScreen1 = selectedGoals.length > 0;
  const canProceedFromScreen2 = selectedStyles.length > 0;

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 sm:p-12 rounded-3xl shadow-lg max-w-2xl w-full">
      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mb-8">
        <div className={`h-2 w-16 rounded-full ${currentScreen >= 1 ? 'bg-[#2563EB]' : 'bg-gray-200'}`} />
        <div className={`h-2 w-16 rounded-full ${currentScreen >= 2 ? 'bg-[#2563EB]' : 'bg-gray-200'}`} />
      </div>

      {/* Screen 1: What brings you here? */}
      {currentScreen === 1 && (
        <div className="text-center space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[#1F2933] mb-4">
            What brings you here today?
          </h2>
          <p className="text-xs text-[#1F2933]/60 mb-4">Select all that apply</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => toggleGoal("feedback")}
              className={`${
                selectedGoals.includes("feedback")
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#1F2933] border-2 border-gray-200"
              } hover:bg-[#1D4ED8] hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95`}
            >
              I want feedback
            </button>
            <button
              onClick={() => toggleGoal("learn")}
              className={`${
                selectedGoals.includes("learn")
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#1F2933] border-2 border-gray-200"
              } hover:bg-[#1D4ED8] hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95`}
            >
              I want to learn
            </button>
            <button
              onClick={() => toggleGoal("exploring")}
              className={`${
                selectedGoals.includes("exploring")
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#1F2933] border-2 border-gray-200"
              } hover:bg-[#1D4ED8] hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95`}
            >
              Just exploring
            </button>
          </div>
          <button
            onClick={() => setCurrentScreen(2)}
            disabled={!canProceedFromScreen1}
            className="mt-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Screen 2: How should I help you? */}
      {currentScreen === 2 && (
        <div className="text-center space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[#1F2933] mb-4">
            How should I help you?
          </h2>
          <p className="text-xs text-[#1F2933]/60 mb-4">Select all that apply</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => toggleStyle("gentle")}
              className={`${
                selectedStyles.includes("gentle")
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#1F2933] border-2 border-gray-200"
              } hover:bg-[#1D4ED8] hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95`}
            >
              Be gentle
            </button>
            <button
              onClick={() => toggleStyle("direct")}
              className={`${
                selectedStyles.includes("direct")
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#1F2933] border-2 border-gray-200"
              } hover:bg-[#1D4ED8] hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95`}
            >
              Be direct
            </button>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrentScreen(1)}
              className="text-[#1F2933]/60 hover:text-[#1F2933] text-sm font-medium px-4 py-2"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canProceedFromScreen2 || isSubmitting}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Setting up..." : "Complete"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
