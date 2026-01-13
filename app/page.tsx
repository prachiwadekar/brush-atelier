import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { HomeNav } from "@/components/home-nav";

export default async function HomePage() {
  const session = await auth();

  // Get artist count
  const artistCount = await prisma.artistWaitlist.count();

  return (
    <div className="min-h-screen bg-[#FBF7F2] relative overflow-hidden">
      {/* Decorative soft shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#2563EB]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#C2410C]/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#2563EB]/10 rounded-full blur-3xl"></div>

      <HomeNav isAuthenticated={!!session?.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Content */}
          <div className="text-center">
            {/* Prominent Logo */}
            <div className="mb-4 sm:mb-5 flex justify-center">
              <Image
                src="/logo.png"
                alt="Brush Atelier Logo"
                width={200}
                height={200}
                className="w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52"
                key="logo-hero"
                unoptimized
              />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1F2933] mb-4 sm:mb-6 leading-tight text-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Make Art <span className="text-[#2563EB]">You're Proud Of</span>
            </h2>

            {/* How It Works - Compact */}
            <div className="space-y-2 sm:space-y-3 flex flex-col items-center">
              <div className="flex flex-col items-start gap-2 sm:gap-3">
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
                  <h4 className="font-bold text-[#1F2933] text-sm sm:text-base">Paint → Upload your work → Get feedback → <span className="font-black text-[#2563EB]">Improve and Feel Proud!</span></h4>
                </div>
              </div>
            </div>
          </div>

          {/* Artist Call-to-Action */}
          <div className="mt-6 sm:mt-8">
            <div className="bg-gradient-to-br from-[#2563EB]/10 via-[#C2410C]/10 to-[#2563EB]/10 rounded-2xl p-5 sm:p-6 border border-[#2563EB]/20 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                    <Users className="h-5 w-5 text-[#2563EB]" />
                    <span className="text-sm font-semibold text-[#2563EB]">
                      {artistCount > 0 ? `${artistCount} artists` : 'Be the first'} on the waitlist
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">
                    Get paid helping others improve their art.
                  </h3>
                  <p className="text-black text-sm sm:text-base">
                    For professional artists
                  </p>
                </div>
                <Link
                  href="/artists/join"
                  className="bg-[#2563EB] text-white px-8 py-3 rounded-full hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg font-bold text-base whitespace-nowrap"
                >
                  Apply
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-[#1F2933]/5 backdrop-blur-sm border-t border-[#1F2933]/10 mt-6 sm:mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6">
          <p className="text-center text-[#1F2933]/60 font-medium text-xs sm:text-sm">
            &copy; 2026 Brush Atelier — All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
