'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { signOut } from 'next-auth/react';

type HomeNavProps = {
  isAuthenticated: boolean;
};

export function HomeNav({ isAuthenticated }: HomeNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-[#FBF7F2]/95 backdrop-blur-md shadow-sm relative z-10 border-b border-[#1F2933]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-8 sm:gap-12">
            <Link href="/" className="relative">
              <h1 className="text-xl sm:text-3xl font-bold">
                <span className="text-[#C2410C]">Brush</span>{" "}
                <span className="text-[#1F2933]">Atelier</span>
                {/* BETA Badge - Superscript */}
                <span className="absolute -top-1 sm:-top-2 -right-10 sm:-right-12 text-[#2563EB] text-[0.5rem] sm:text-xs font-bold uppercase tracking-wider border border-[#2563EB] px-1 sm:px-1.5 py-0.5 rounded">
                  BETA
                </span>
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
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

            {/* Unified Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 text-[#1F2933] hover:text-[#2563EB] px-3 py-2 transition-colors font-bold rounded-full hover:bg-[#2563EB]/10 text-sm sm:text-base"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#1F2933]/10 py-2 z-50">
                  <Link
                    href="/about"
                    className="block px-4 py-2.5 text-[#1F2933] hover:bg-[#2563EB]/10 hover:text-[#2563EB] transition-colors text-sm font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    About Us
                  </Link>

                  <Link
                    href="/feedback"
                    className="block px-4 py-2.5 text-[#1F2933] hover:bg-[#2563EB]/10 hover:text-[#2563EB] transition-colors text-sm font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Help Shape Brush Atelier
                  </Link>

                  {isAuthenticated && (
                    <>
                      <div className="border-t border-[#1F2933]/10 my-2"></div>
                      <button
                        onClick={async () => {
                          setIsDropdownOpen(false);
                          await signOut({ callbackUrl: "/" });
                        }}
                        className="block w-full text-left px-4 py-2.5 text-[#1F2933] hover:bg-[#2563EB]/10 hover:text-[#2563EB] transition-colors text-sm font-medium"
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
