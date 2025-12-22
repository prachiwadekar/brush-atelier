"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

interface OnboardingFormProps {
  user: User | null;
}

export default function OnboardingForm({ user }: OnboardingFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    bio: "",
    interests: [] as string[],
    skillLevel: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "STUDENT", // Everyone is a student now
          ...formData,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What art styles interest you? (comma-separated)
        </label>
        <input
          required
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-gray-900"
          placeholder="e.g., Portrait Painting, Landscape, Abstract Art"
          onChange={(e) =>
            setFormData({
              ...formData,
              interests: e.target.value.split(",").map((s) => s.trim()),
            })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Skill Level</label>
        <select
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-gray-900"
          value={formData.skillLevel}
          onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
        >
          <option value="">Select your level</option>
          <option value="Beginner">Beginner - Just starting out</option>
          <option value="Intermediate">Intermediate - Have some experience</option>
          <option value="Advanced">Advanced - Experienced artist</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#2563EB] text-white px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 font-semibold shadow-lg"
      >
        {isSubmitting ? "Creating profile..." : "Start Your Journey"}
      </button>
    </form>
  );
}
