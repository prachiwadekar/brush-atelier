import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#FBF7F2] relative overflow-hidden">
      {/* Decorative soft shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#2563EB]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#C2410C]/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#2563EB]/10 rounded-full blur-3xl"></div>

      <nav className="bg-[#FBF7F2]/95 backdrop-blur-md shadow-sm relative z-10 border-b border-[#1F2933]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-3xl font-bold">
                <span className="text-[#C2410C]">Brush</span>{" "}
                <span className="text-[#1F2933]">Atelier</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="bg-[#2563EB] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg font-bold text-sm sm:text-base"
                >
                  My Session
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="bg-[#2563EB] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg font-bold text-sm sm:text-base whitespace-nowrap"
                  >
                    Try a Lesson
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="text-[#1F2933] hover:text-[#2563EB] px-3 py-2 sm:px-5 sm:py-2.5 transition-colors font-bold rounded-full hover:bg-[#2563EB]/10 text-sm sm:text-base"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Content */}
          <div className="text-center">
            {/* Prominent Logo */}
            <div className="mb-6 sm:mb-8 flex justify-center">
              <Image
                src="/logo.png"
                alt="Brush Atelier Logo"
                width={240}
                height={240}
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64"
                key="logo-hero"
                unoptimized
              />
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1F2933] mb-3 sm:mb-4 leading-tight text-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Make Art <span className="text-[#2563EB]">You're Proud Of</span>
            </h2>

            <p className="text-base sm:text-lg text-[#1F2933] mb-6 sm:mb-8 italic font-bold">
              Designed For Adult Learners & Returning Artists.
            </p>

            {/* How It Works - Compact */}
            <div className="space-y-3 sm:space-y-4 flex flex-col items-center">
              <div className="flex flex-col items-start gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#FBF7F2] border-2 border-[#2563EB] rounded-md flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#2563EB]">1</span>
                  </div>
                  <h4 className="font-bold text-[#1F2933] text-sm sm:text-base">Choose a reference</h4>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#FBF7F2] border-2 border-[#2563EB] rounded-md flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#2563EB]">2</span>
                  </div>
                  <h4 className="font-bold text-[#1F2933] text-sm sm:text-base">Get a personalized painting plan</h4>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#FBF7F2] border-2 border-[#2563EB] rounded-md flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#2563EB]">3</span>
                  </div>
                  <h4 className="font-bold text-[#1F2933] text-sm sm:text-base">Paint → Upload your work → Get feedback</h4>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-[#1F2933]/5 backdrop-blur-sm border-t border-[#1F2933]/10 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
          <p className="text-center text-[#1F2933]/60 font-medium text-xs sm:text-sm">
            &copy; 2026 Brush Atelier — All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
