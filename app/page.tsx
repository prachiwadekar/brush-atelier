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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1F2933] mb-3 sm:mb-4 leading-tight text-center tracking-tight">
              Make Art <span className="text-[#2563EB]">You're Proud Of</span>
            </h2>

            <p className="text-[#1F2933]/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-4 sm:mb-6">
              Paint a memory that matters — <span className="font-semibold text-[#C2410C]">make art that's personal to you</span>
            </p>

            {/* Step-by-Step Visual Progression - 3 Examples */}
            <div className="mt-8 sm:mt-10 space-y-6 sm:space-y-8">
              <p className="text-[#1F2933]/70 text-sm sm:text-base font-medium">
                Your AI coach guides you through every brushstroke
              </p>

              {/* Portrait - Top Row */}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#1F2933]/50 uppercase tracking-wide mb-3">Portrait</p>
                <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="relative group">
                      <div className="relative">
                        <Image
                          src={`/p${step}.png`}
                          alt={`Portrait progress step ${step}`}
                          width={160}
                          height={160}
                          className="w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl object-cover shadow-lg border-2 border-white"
                        />
                      </div>
                      {step < 4 && (
                        <div className="absolute top-1/2 -right-1 sm:-right-1.5 md:-right-2.5 transform -translate-y-1/2 text-[#2563EB]/40 text-lg sm:text-xl font-bold z-10">
                          →
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Still Life & Landscape - Second Row Side by Side */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12">
                {/* Still Life */}
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#1F2933]/50 uppercase tracking-wide mb-3 text-center">Still Life</p>
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="relative group">
                        <div className="relative">
                          <Image
                            src={`/bb${step}.png`}
                            alt={`Still life progress step ${step}`}
                            width={120}
                            height={120}
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg object-cover shadow-md border-2 border-white"
                          />
                        </div>
                        {step < 4 && (
                          <div className="absolute top-1/2 -right-0.5 sm:-right-1 md:-right-2 transform -translate-y-1/2 text-[#2563EB]/40 text-sm sm:text-base font-bold z-10">
                            →
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Landscape */}
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#1F2933]/50 uppercase tracking-wide mb-3 text-center">Landscape</p>
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="relative group">
                        <div className="relative">
                          <Image
                            src={`/ls${step}.png`}
                            alt={`Landscape progress step ${step}`}
                            width={120}
                            height={120}
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg object-cover shadow-md border-2 border-white"
                          />
                        </div>
                        {step < 4 && (
                          <div className="absolute top-1/2 -right-0.5 sm:-right-1 md:-right-2 transform -translate-y-1/2 text-[#2563EB]/40 text-sm sm:text-base font-bold z-10">
                            →
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Artist Call-to-Action */}
          <div className="mt-6 sm:mt-8">
            <div className="bg-gradient-to-br from-[#2563EB]/10 via-[#C2410C]/10 to-[#2563EB]/10 rounded-xl p-4 sm:p-5 border border-[#2563EB]/20 shadow-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <Users className="h-4 w-4 text-[#2563EB]" />
                    <span className="text-sm sm:text-base font-semibold text-[#2563EB]">
                      {artistCount > 0 ? `${artistCount} artists` : 'Be the first'} on the waitlist
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-black mb-1">
                    Get paid helping others improve their art.
                  </h3>
                  <p className="text-black text-sm sm:text-base">
                    For professional artists — Sign up to Critique
                  </p>
                </div>
                <Link
                  href="/artists/join"
                  className="bg-[#2563EB] text-white px-6 py-2 rounded-full hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg font-bold text-sm whitespace-nowrap"
                >
                  Join Waitlist
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
