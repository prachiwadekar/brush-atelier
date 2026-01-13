"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Determine error message based on error type
  const getErrorMessage = () => {
    switch (error) {
      case "OAuthAccountNotLinked":
        return {
          title: "Account Already Exists",
          message: "An account with this email already exists. Please sign in using your email and password instead of Google Sign-In.",
          suggestion: "If you'd like to use Google Sign-In, please contact support to link your accounts.",
        };
      case "AccessDenied":
        return {
          title: "Sign In Not Allowed",
          message: "This email is already registered with a password. Please use email and password to sign in.",
          suggestion: "You cannot use Google Sign-In for accounts created with email/password.",
        };
      case "Configuration":
        return {
          title: "Configuration Error",
          message: "There was a problem with the authentication configuration.",
          suggestion: "Please try again or contact support if the issue persists.",
        };
      default:
        return {
          title: "Authentication Error",
          message: "An unexpected error occurred during sign in.",
          suggestion: "Please try again or use a different sign-in method.",
        };
    }
  };

  const errorInfo = getErrorMessage();

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
            <h1 className="text-3xl font-bold">
              <span className="text-[#C2410C]">Brush</span>{" "}
              <span className="text-[#1F2933]">Atelier</span>
            </h1>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-lg">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-[#1F2933] mb-3">{errorInfo.title}</h2>
            <p className="text-[#1F2933]/80 mb-4">{errorInfo.message}</p>
            <p className="text-sm text-[#1F2933]/60 bg-blue-50 border border-blue-200 rounded-lg p-3">
              💡 {errorInfo.suggestion}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full bg-[#2563EB] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1D4ED8] transition-all shadow-lg hover:shadow-xl text-center"
            >
              Go to Sign In
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-100 text-[#1F2933] px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
