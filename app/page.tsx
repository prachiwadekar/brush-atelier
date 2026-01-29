import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { HomeNav } from "@/components/home-nav";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="h-screen bg-[#FAF8F5] relative overflow-hidden flex flex-col">
      {/* Decorative soft shapes - terracotta and sage */}
      <div className="absolute top-16 right-10 w-60 h-60 bg-[#C4704F]/8 rounded-full blur-3xl"></div>
      <div className="absolute bottom-16 left-10 w-72 h-72 bg-[#7D8B73]/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#B8A99A]/15 rounded-full blur-3xl"></div>

      <HomeNav isAuthenticated={!!session?.user} />

      <main className="flex-1 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4 relative z-10">
        <div className="max-w-4xl mx-auto w-full">
          {/* Hero Content */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#3D3832] mb-3 leading-tight text-center tracking-tight">
              Turn a photo or memory into a painting <span className="text-[#C4704F]">you'll actually finish.</span>
            </h2>

            <Link
              href="/auth/signup"
              className="inline-block bg-[#C4704F] text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full hover:bg-[#A85A3D] transition-all shadow-sm hover:shadow-md font-semibold text-sm sm:text-base mt-1"
            >
              Start your first painting
            </Link>

            {/* Step-by-Step Visual Progression - 3 Examples */}
            <div className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
              <p className="text-[#6B635A] text-sm sm:text-base">
                No tutorials to scroll, no guessing. Just clear next steps, exactly when you need them.
              </p>

              {/* People you love - Top Row */}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#6B635A] uppercase tracking-wide mb-3">People you love</p>
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  {[
                    { step: 1, label: "Sketch" },
                    { step: 2, label: "First wash" },
                    { step: 3, label: "Focus area" },
                    { step: 4, label: "Final polish" }
                  ].map(({ step, label }) => (
                    <div key={step} className="relative group">
                      <div className="relative">
                        <Image
                          src={`/p${step}.png`}
                          alt={`Portrait progress step ${step}`}
                          width={160}
                          height={160}
                          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-xl object-cover shadow-lg border-2 border-white"
                        />
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[0.55rem] sm:text-xs text-[#6B635A] whitespace-nowrap">{label}</span>
                      </div>
                      {step < 4 && (
                        <div className="absolute top-1/2 -right-1.5 sm:-right-2 transform -translate-y-1/2 text-[#C4704F]/40 text-lg sm:text-xl font-bold z-10">
                          →
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Everyday moments & Places that matter - Second Row Side by Side */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 md:gap-14">
                {/* Everyday moments */}
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#6B635A] uppercase tracking-wide mb-2 text-center">Everyday moments</p>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="relative group">
                        <div className="relative">
                          <Image
                            src={`/bb${step}.png`}
                            alt={`Still life progress step ${step}`}
                            width={120}
                            height={120}
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-lg object-cover shadow-sm border-2 border-white"
                          />
                        </div>
                        {step < 4 && (
                          <div className="absolute top-1/2 -right-1 sm:-right-1.5 transform -translate-y-1/2 text-[#C4704F]/40 text-sm sm:text-base font-bold z-10">
                            →
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Places that matter */}
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#6B635A] uppercase tracking-wide mb-2 text-center">Places that matter</p>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="relative group">
                        <div className="relative">
                          <Image
                            src={`/ls${step}.png`}
                            alt={`Landscape progress step ${step}`}
                            width={120}
                            height={120}
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-lg object-cover shadow-sm border-2 border-white"
                          />
                        </div>
                        {step < 4 && (
                          <div className="absolute top-1/2 -right-1 sm:-right-1.5 transform -translate-y-1/2 text-[#C4704F]/40 text-sm sm:text-base font-bold z-10">
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

        </div>
      </main>

      {/* How It Works - 3 Steps */}
      <div className="bg-white/50 backdrop-blur-sm border-y border-[#E8E4DF] py-5 sm:py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
          <h3 className="text-base sm:text-lg font-bold text-[#3D3832] text-center mb-4">How it works</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#C4704F] text-white font-bold text-sm flex items-center justify-center">1</span>
              <span className="text-[#3D3832]/80 text-sm">Upload a photo or choose a memory</span>
            </div>
            <div className="hidden sm:block text-[#B8A99A] text-lg">→</div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#C4704F] text-white font-bold text-sm flex items-center justify-center">2</span>
              <span className="text-[#3D3832]/80 text-sm">Get step-by-step guidance from an AI coach or real artist</span>
            </div>
            <div className="hidden sm:block text-[#B8A99A] text-lg">→</div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#C4704F] text-white font-bold text-sm flex items-center justify-center">3</span>
              <span className="text-[#3D3832]/80 text-sm">Finish a painting you're proud of</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#3D3832]/5 backdrop-blur-sm border-t border-[#E8E4DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3">
          <p className="text-center text-[#6B635A] font-medium text-xs sm:text-sm">
            &copy; 2026 Brush Atelier — All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
