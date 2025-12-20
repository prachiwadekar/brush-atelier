import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Decorative soft shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#D1E231]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#D1E231]/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#D1E231]/10 rounded-full blur-3xl"></div>

      <nav className="bg-black/80 backdrop-blur-md shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              {/* Palette logo */}
              <Image
                src="/palette-logo.svg"
                alt="Brush Atelier Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <span className="text-[#D1E231]">Brush</span>{" "}
                <span className="text-white">Atelier.ai</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="bg-[#D1E231] text-gray-900 px-6 py-2.5 rounded-full hover:bg-[#C5D629] transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-300 hover:text-white px-5 py-2.5 transition-colors font-medium rounded-full hover:bg-[#D1E231]/20"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-[#D1E231] text-gray-900 px-6 py-2.5 rounded-full hover:bg-[#C5D629] transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    Sign up free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10">
        <div className="text-center mb-20 relative">
          <div className="inline-block mb-6 px-6 py-3 bg-[#D1E231]/20 rounded-full shadow-md border border-[#D1E231]/30">
            <span className="text-[#D1E231] font-semibold text-base">✨ AI-Powered Art Coaching</span>
          </div>

          <h2 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Where Good Artists<br />
            <span className="text-[#D1E231]">Become Great</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Professional-level critiques. Personalized AI coaching.
          </p>

          <div className="flex items-center justify-center mb-12">
            <Link
              href="/auth/signup"
              className="bg-[#D1E231] text-gray-900 px-8 py-4 rounded-full hover:bg-[#C5D629] transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              Get started for free
            </Link>
          </div>

          {/* Ethos Image */}
          <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/ethos.png"
              alt="Brush Atelier - AI-Powered Art Coaching"
              width={1200}
              height={675}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Stop guessing. Start creating with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#D1E231] rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Your Inspiration</h3>
                  <p className="text-gray-700 text-base leading-relaxed">
                    Start with any artwork you love—upload an image or link from Instagram, Pinterest, or Google Images.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#D1E231] rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Receive a Personalized Coaching Plan</h3>
                  <p className="text-gray-700 text-base leading-relaxed">
                    BrushAtelier breaks down the piece and designs a guided, step-by-step plan tailored to your current skill level—so you know exactly how to approach the work.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#D1E231] rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Create. Get Critiqued. Improve.</h3>
                  <p className="text-gray-700 text-base leading-relaxed">
                    As you paint or draw, receive professional-level critiques that point out what's working, what isn't, and how to refine your technique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      <footer className="bg-black/60 backdrop-blur-sm border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <p className="text-center text-gray-400 font-medium">
            &copy; 2024 Brush Atelier.ai — All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
