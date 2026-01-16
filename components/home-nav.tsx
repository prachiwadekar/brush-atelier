'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

type HomeNavProps = {
  isAuthenticated: boolean;
};

export function HomeNav({ isAuthenticated }: HomeNavProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/', redirect: true });
  };

  return (
    <nav className="bg-[#FBF7F2]/95 backdrop-blur-md shadow-sm relative z-10 border-b border-[#1F2933]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="relative flex-shrink-0">
              <h1 className="text-xl sm:text-3xl font-bold">
                <span className="text-[#C2410C]">Brush</span>{" "}
                <span className="text-[#1F2933]">Atelier</span>
                {/* BETA Badge - More prominent */}
                <span className="absolute -top-1 sm:-top-2 -right-12 sm:-right-14 bg-[#2563EB] text-white text-[0.5rem] sm:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                  BETA
                </span>
              </h1>
            </Link>
          </div>

          {/* Center message - Hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="bg-red-500/80 px-4 py-2 rounded-lg shadow-sm">
              <p className="text-sm lg:text-base text-white font-bold text-center">
                Your feedback means a lot—write to us at{' '}
                <a href="mailto:team.brushatelier@gmail.com" className="underline hover:text-white/90 transition-colors">
                  team.brushatelier@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-[#2563EB] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg font-bold text-sm sm:text-base"
                >
                  My Session
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-[#1F2933] hover:text-[#2563EB] px-3 py-2 sm:px-5 sm:py-2.5 transition-colors font-bold rounded-full hover:bg-[#2563EB]/10 text-sm sm:text-base"
                >
                  Sign Out
                </button>
              </>
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
  );
}
