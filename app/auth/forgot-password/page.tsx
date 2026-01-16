"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F2] relative overflow-hidden flex items-center justify-center px-4">
      {/* Decorative soft shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#2563EB]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#C2410C]/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="Brush Atelier Logo"
              width={32}
              height={32}
              className="w-8 h-8"
              key="logo-v2"
              unoptimized
            />
            <h1 className="text-3xl font-bold relative">
              <span className="text-[#C2410C]">Brush</span>{" "}
              <span className="text-[#1F2933]">Atelier</span>
              <span className="absolute -top-2 -right-12 bg-[#2563EB] text-white text-[0.5rem] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                BETA
              </span>
            </h1>
          </Link>

          {/* Feedback Banner */}
          <div className="mb-4">
            <div className="bg-red-500/80 px-4 py-2 rounded-lg shadow-sm">
              <p className="text-xs sm:text-sm text-white font-bold text-center">
                Your feedback means a lot—write to us at{' '}
                <a href="mailto:team.brushatelier@gmail.com" className="underline hover:text-white/90 transition-colors">
                  team.brushatelier@gmail.com
                </a>
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-[#1F2933]">Forgot Password?</h2>
          <p className="text-[#1F2933]/70 mt-2">
            {success
              ? "Check your email for reset instructions"
              : "Enter your email and we'll send you a reset link"
            }
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-lg">
          {success ? (
            <div className="text-center">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Success Message */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#1F2933] mb-3">Email Sent!</h3>
                <p className="text-[#1F2933]/80 mb-4">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-[#1F2933]/60 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  💡 The link will expire in 1 hour. Check your spam folder if you don't see it.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/auth/signin"
                  className="block w-full bg-[#2563EB] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1D4ED8] transition-all shadow-lg hover:shadow-xl text-center"
                >
                  Back to Sign In
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="block w-full bg-gray-100 text-[#1F2933] px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all text-center"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1D4ED8] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-semibold"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
