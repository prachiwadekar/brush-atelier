"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

interface DashboardLayoutProps {
  userName: string;
  activeView: "portfolio" | "new-artwork" | "critique" | "skills";
  onViewChange: (view: "portfolio" | "new-artwork" | "critique" | "skills") => void;
  onStartNewSession?: () => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ userName, activeView, onViewChange, onStartNewSession, children }: DashboardLayoutProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      {/* Top Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-[#1F2933]/10 fixed top-0 left-0 right-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Top Row: Logo, Feedback Banner, User Menu */}
          <div className="flex justify-between items-center h-14 border-b border-[#1F2933]/10">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/logo.png"
                alt="Brush Atelier Logo"
                width={48}
                height={48}
                className="w-8 h-8 sm:w-12 sm:h-12"
                key="logo-v3"
                unoptimized
              />
              <h1 className="text-lg sm:text-2xl font-bold relative">
                <span className="text-[#C2410C]">Brush</span>{" "}
                <span className="text-[#1F2933]">Atelier</span>
                <span className="absolute -top-1 sm:-top-2 -right-10 sm:-right-12 bg-[#2563EB] text-white text-[0.4rem] sm:text-[0.5rem] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow-sm">
                  BETA
                </span>
              </h1>
            </Link>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Right Side: Feedback Banner + User Menu */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Feedback Banner */}
              <div className="hidden lg:block">
                <div className="px-4 py-2 border border-[#C2410C]/40 rounded-lg bg-[#C2410C]/5">
                  <p className="text-sm text-[#C2410C] font-medium">
                    Your feedback means a lot—write to us at{' '}
                    <a href="mailto:team.brushatelier@gmail.com" className="text-[#C2410C] hover:text-[#2563EB] transition-colors underline font-semibold">
                      team.brushatelier@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-1 sm:gap-2">
              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="text-[#1F2933]/60 hover:text-[#1F2933] transition-colors p-1.5 sm:p-2 active:bg-gray-100 rounded-lg"
                  aria-label="User menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserMenuOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#1F2933]/10 py-1 z-40">
                      <div className="px-4 py-2 border-b border-[#1F2933]/10">
                        <p className="text-sm font-medium text-[#1F2933]">{userName}</p>
                      </div>
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signOut({ redirect: false });
                          window.location.href = "/";
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-[#1F2933]/70 hover:bg-[#2563EB]/10 hover:text-[#2563EB] transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
              </div>
            </div>
          </div>

          {/* Second Row: Horizontal Navigation Tabs */}
          <div className="flex items-center justify-end gap-1 py-2 overflow-x-auto">
            {/* Create New Tab */}
            <button
              onClick={() => {
                if (onStartNewSession) {
                  onStartNewSession();
                }
                onViewChange("new-artwork");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeView === "new-artwork"
                  ? "bg-[#2563EB] text-white shadow-md"
                  : "text-[#1F2933]/70 hover:bg-[#2563EB]/10 hover:text-[#2563EB]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
              <span>Create New</span>
            </button>

            {/* Critiques Tab */}
            <button
              onClick={() => onViewChange("critique")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeView === "critique"
                  ? "bg-[#2563EB] text-white shadow-md"
                  : "text-[#1F2933]/70 hover:bg-[#2563EB]/10 hover:text-[#2563EB]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Critiques</span>
            </button>

            {/* My Portfolio Tab */}
            <button
              onClick={() => onViewChange("portfolio")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeView === "portfolio"
                  ? "bg-[#2563EB] text-white shadow-md"
                  : "text-[#1F2933]/70 hover:bg-[#2563EB]/10 hover:text-[#2563EB]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span>My Portfolio</span>
            </button>

            {/* Skills Tab */}
            <button
              onClick={() => onViewChange("skills")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeView === "skills"
                  ? "bg-[#2563EB] text-white shadow-md"
                  : "text-[#1F2933]/70 hover:bg-[#2563EB]/10 hover:text-[#2563EB]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span>Skills</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Adjusted for taller header */}
      <main className="pt-[7.5rem] transition-all duration-300">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1920px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
