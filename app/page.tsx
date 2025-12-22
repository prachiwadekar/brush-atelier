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
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              {/* Palette logo */}
              <Image
                src="/logo.png"
                alt="Brush Atelier Logo"
                width={64}
                height={64}
                className="w-16 h-16"
                key="logo-v2"
                unoptimized
              />
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <span className="text-[#C2410C]">Brush</span>{" "}
                <span className="text-[#1F2933]">Atelier</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="bg-[#2563EB] text-white px-6 py-2.5 rounded-full hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-[#1F2933] hover:text-[#2563EB] px-5 py-2.5 transition-colors font-bold rounded-full hover:bg-[#2563EB]/10"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-[#2563EB] text-white px-6 py-2.5 rounded-full hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg font-bold"
                  >
                    Get started for free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Hero Content */}
          <div className="text-left">
            <div className="inline-block mb-4 px-4 py-2 bg-[#C2410C] rounded-full shadow-md">
              <span className="text-white font-semibold text-sm">✨ AI-Powered Art Coaching</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1F2933] mb-4 leading-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Where Good Artists<br />
              <span className="text-[#2563EB]">Become Great</span>
            </h2>
            <p className="text-lg text-[#1F2933]/70 mb-8 leading-relaxed">
              Professional-level critiques. Personalized AI coaching.
            </p>

            {/* How It Works - Compact */}
            <div className="space-y-4">
              <h3 className="text-2xl font-extrabold text-[#1F2933] mb-3">How It Works</h3>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1F2933] text-sm mb-1">Choose Your Inspiration</h4>
                  <p className="text-[#1F2933]/70 text-sm">
                    Upload an artwork you'd like to recreate
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1F2933] text-sm mb-1">Receive a Personalized Coaching Plan</h4>
                  <p className="text-[#1F2933]/70 text-sm">
                    Get a step-by-step plan tailored to your current skill level.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1F2933] text-sm mb-1">Create. Get Critiqued. Improve.</h4>
                  <p className="text-[#1F2933]/70 text-sm">
                    Receive professional-level critiques that help you refine your technique.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/ethos.png"
              alt="Brush Atelier - AI-Powered Art Coaching"
              width={800}
              height={450}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </main>

      <footer className="bg-[#1F2933]/5 backdrop-blur-sm border-t border-[#1F2933]/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <p className="text-center text-[#1F2933]/60 font-medium">
            &copy; 2025 Brush Atelier — All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
