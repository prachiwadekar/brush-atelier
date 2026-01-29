import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { HomeNav } from "@/components/home-nav";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="h-screen bg-[#FAF8F5] relative overflow-hidden flex flex-col">
      {/* Decorative soft shapes - terracotta, sage, and lavender */}
      <div className="absolute top-16 right-10 w-60 h-60 bg-[#C4704F]/8 rounded-full blur-3xl"></div>
      <div className="absolute bottom-16 left-10 w-72 h-72 bg-[#7D8B73]/12 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-[#9B8EA8]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-[#B8A99A]/12 rounded-full blur-3xl"></div>

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

              {/* Step-by-step progression example */}
              <div>
                <div className="flex items-center justify-center gap-4 sm:gap-6">
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
                          width={180}
                          height={180}
                          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl object-cover shadow-lg border-2 border-white"
                        />
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[0.6rem] sm:text-xs text-[#9B8EA8] font-medium whitespace-nowrap">{label}</span>
                      </div>
                      {step < 4 && (
                        <div className="absolute top-1/2 -right-2 sm:-right-3 transform -translate-y-1/2 text-[#7D8B73]/50 text-xl sm:text-2xl font-bold z-10">
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
      </main>

      {/* How It Works - 3 Steps */}
      <div className="bg-white/50 backdrop-blur-sm border-y border-[#E8E4DF] py-5 sm:py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
          <h3 className="text-base sm:text-lg font-bold text-[#3D3832] text-center mb-4">How it works</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#9B8EA8] text-white font-bold text-sm flex items-center justify-center">1</span>
              <span className="text-[#3D3832]/80 text-sm">Upload a photo or choose a memory</span>
            </div>
            <div className="hidden sm:block text-[#B8A99A] text-lg">→</div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#7D8B73] text-white font-bold text-sm flex items-center justify-center">2</span>
              <span className="text-[#3D3832]/80 text-sm">Get step-by-step guidance from an AI coach</span>
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
