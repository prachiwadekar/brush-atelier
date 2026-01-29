'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';

type HomeNavProps = {
  isAuthenticated: boolean;
};

export function HomeNav({ isAuthenticated }: HomeNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/', redirect: true });
  };

  return (
    <nav className="bg-[#FAF8F5]/95 backdrop-blur-md relative z-50 border-b border-[#E8E4DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-12 sm:h-14 gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Brush Atelier Logo"
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10"
                unoptimized
              />
              <h1 className="relative text-lg sm:text-xl font-bold">
                <span className="text-[#C2410C]">Brush</span>{" "}
                <span className="text-[#3D3832]">Atelier</span>
                {/* Beta Badge */}
                <span className="absolute -top-0.5 -right-7 sm:-right-8 bg-white border border-[#7D8B73] text-[#7D8B73] text-[0.45rem] sm:text-[0.5rem] font-bold px-1 py-0.5 rounded">
                  Beta
                </span>
              </h1>
            </Link>
            <span className="hidden md:block text-[#6B635A] text-[0.65rem] ml-6">Built by artists & AI practitioners</span>
          </div>

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-[#C4704F]/10 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-[#3D3832]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute right-4 sm:right-6 lg:right-12 top-10 sm:top-12 bg-white rounded-xl shadow-lg border border-[#E8E4DF] py-1.5 min-w-[180px] z-50">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="block bg-[#C4704F] text-white mx-1.5 px-3 py-2 rounded-lg transition-colors font-medium hover:bg-[#A85A3D] text-xs text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Continue Painting
                </Link>
                <div className="border-t border-[#E8E4DF] my-1.5"></div>
                <Link
                  href="/artists/join"
                  className="block text-[#3D3832] hover:text-[#C4704F] px-3 py-2 transition-colors font-medium hover:bg-[#C4704F]/5 text-xs"
                  onClick={() => setMenuOpen(false)}
                >
                  Become a Coach
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                  className="block w-full text-left text-[#3D3832] hover:text-[#C4704F] px-3 py-2 transition-colors font-medium hover:bg-[#C4704F]/5 text-xs"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block text-[#3D3832] hover:text-[#C4704F] px-3 py-2 transition-colors font-medium hover:bg-[#C4704F]/5 text-xs"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/artists/join"
                  className="block text-[#3D3832] hover:text-[#C4704F] px-3 py-2 transition-colors font-medium hover:bg-[#C4704F]/5 text-xs"
                  onClick={() => setMenuOpen(false)}
                >
                  Become a Coach
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
