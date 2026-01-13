import Link from "next/link";
import Image from "next/image";
import { HomeNav } from "@/components/home-nav";
import { auth } from "@/lib/auth";

export default async function AboutPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#FBF7F2] relative overflow-hidden">
      {/* Decorative soft shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#2563EB]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#C2410C]/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#2563EB]/10 rounded-full blur-3xl"></div>

      <HomeNav isAuthenticated={!!session?.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="Brush Atelier Logo"
              width={120}
              height={120}
              className="w-24 h-24 sm:w-32 sm:h-32"
              unoptimized
            />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1F2933] mb-4">
              About <span className="text-[#2563EB]">Brush Atelier</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#1F2933]/80 max-w-2xl mx-auto">
              Your personal AI art coach, making painting accessible and enjoyable for everyone
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2933] mb-4">Our Mission</h2>
            <p className="text-[#1F2933]/80 text-base sm:text-lg leading-relaxed mb-4">
              Brush Atelier is an AI-powered art coaching platform designed specifically for adult learners and returning artists.
              We believe everyone deserves to create art they're proud of, regardless of their experience level.
            </p>
            <p className="text-[#1F2933]/80 text-base sm:text-lg leading-relaxed">
              Our platform provides personalized, step-by-step painting guidance that adapts to your skill level and artistic goals.
              Whether you're picking up a brush for the first time in years or starting fresh, we're here to support your creative journey.
            </p>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-[#2563EB]/10 via-[#C2410C]/10 to-[#2563EB]/10 rounded-3xl p-6 sm:p-8 border border-[#2563EB]/20 shadow-lg mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2933] mb-6">How It Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-[#1F2933] mb-2">Choose Your Reference</h3>
                  <p className="text-[#1F2933]/80">Select or upload an image you'd like to paint - anything from landscapes to portraits.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-[#1F2933] mb-2">Get Your Personalized Plan</h3>
                  <p className="text-[#1F2933]/80">Our AI analyzes your reference and creates a custom 10-12 step coaching plan tailored to your skill level.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2563EB] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-[#1F2933] mb-2">Paint, Upload, Improve</h3>
                  <p className="text-[#1F2933]/80">Follow the steps, upload your work-in-progress, get instant feedback, and watch your skills grow with each stroke.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2933] mb-4">Powered by AI</h2>
            <p className="text-[#1F2933]/80 text-base sm:text-lg leading-relaxed mb-4">
              Brush Atelier uses advanced AI technology to analyze your reference images and generate personalized coaching plans.
              Our hybrid AI system combines vision analysis with conversational teaching to provide guidance that feels natural and encouraging.
            </p>
            <p className="text-[#1F2933]/80 text-base sm:text-lg leading-relaxed">
              Each coaching plan includes detailed color mixing guides using only primary colors, common mistakes to avoid,
              and supportive feedback designed for adult learners who may be anxious about their artistic abilities.
            </p>
          </div>

          {/* For Artists Section */}
          <div className="bg-gradient-to-br from-[#C2410C]/10 to-[#2563EB]/10 rounded-3xl p-6 sm:p-8 border border-[#C2410C]/20 shadow-lg mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2933] mb-4">For Professional Artists</h2>
            <p className="text-[#1F2933]/80 text-base sm:text-lg leading-relaxed mb-6">
              We're building a marketplace where experienced artists can provide personalized feedback and earn income by helping others improve.
              Join our waitlist to be among the first to participate when we launch.
            </p>
            <Link
              href="/artists/join"
              className="inline-block bg-[#2563EB] text-white px-8 py-3 rounded-full hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg font-bold"
            >
              Apply to Join
            </Link>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2933] mb-6">
              Ready to Start Your Art Journey?
            </h2>
            <Link
              href="/auth/signup"
              className="inline-block bg-[#2563EB] text-white px-8 py-4 rounded-full hover:bg-[#1D4ED8] transition-all shadow-lg hover:shadow-xl font-bold text-lg"
            >
              Try Your First Lesson
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[#1F2933]/5 backdrop-blur-sm border-t border-[#1F2933]/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
          <p className="text-center text-[#1F2933]/60 font-medium text-sm">
            &copy; 2026 Brush Atelier — All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
