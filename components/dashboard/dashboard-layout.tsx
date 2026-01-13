"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

interface DashboardLayoutProps {
  userName: string;
  activeView: "portfolio" | "new-artwork" | "critique";
  onViewChange: (view: "portfolio" | "new-artwork" | "critique") => void;
  onStartNewSession?: () => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ userName, activeView, onViewChange, onStartNewSession, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      {/* Top Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-[#1F2933]/10 fixed top-0 left-0 right-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              {/* Burger Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-[#1F2933] hover:text-[#2563EB] transition-colors p-2"
                aria-label="Toggle menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>

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
                <h1 className="text-lg sm:text-2xl font-bold hidden sm:block">
                  <span className="text-[#C2410C]">Brush</span>{" "}
                  <span className="text-[#1F2933]">Atelier</span>
                </h1>
              </Link>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* My Portfolio Button - Show on new-artwork page */}
              {activeView === "new-artwork" && (
                <button
                  onClick={() => {
                    if (onViewChange) {
                      onViewChange("portfolio");
                    }
                  }}
                  className="bg-white hover:bg-gray-50 text-[#2563EB] border-2 border-[#2563EB] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md"
                  aria-label="View Portfolio"
                >
                  <span className="hidden sm:inline">My Portfolio</span>
                  <span className="sm:hidden">Portfolio</span>
                </button>
              )}

              {/* Create New Button - Show on new-artwork and portfolio pages */}
              {(activeView === "new-artwork" || activeView === "portfolio") && (
                <button
                  onClick={() => {
                    if (onStartNewSession) {
                      onStartNewSession();
                    }
                  }}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md"
                  aria-label="Create New Art Session"
                >
                  <span className="hidden sm:inline">Create New</span>
                  <span className="sm:hidden">Create</span>
                </button>
              )}

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
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1F2933]/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 sm:w-72 bg-white/95 backdrop-blur-md border-r border-[#1F2933]/10 z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 sm:p-6">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-[#1F2933] mb-1">
              Welcome back, {userName}!
            </h2>
            <p className="text-[#1F2933]/60 text-xs sm:text-sm">
              Where Good Artists become Great
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 sm:space-y-2">
            <button
              onClick={() => {
                onViewChange("new-artwork");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeView === "new-artwork"
                  ? "bg-[#2563EB] text-white font-semibold"
                  : "text-[#1F2933]/70 hover:bg-[#2563EB]/10 hover:text-[#2563EB]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
              <span>Guided Session</span>
            </button>

            <button
              onClick={() => {
                onViewChange("portfolio");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeView === "portfolio"
                  ? "bg-[#2563EB] text-white font-semibold"
                  : "text-[#1F2933]/70 hover:bg-[#2563EB]/10 hover:text-[#2563EB]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span>My Portfolio</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-14 transition-all duration-300">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1920px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
