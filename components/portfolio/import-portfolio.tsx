"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function ImportPortfolio() {
  const { data: session } = useSession();
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported?: number;
    error?: string;
  } | null>(null);

  const handleImport = async (platform: "instagram" | "pinterest") => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await fetch(`/api/portfolio/import/${platform}`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setImportResult({
          success: true,
          imported: data.imported,
        });
      } else {
        setImportResult({
          success: false,
          error: data.error || "Failed to import portfolio",
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: "An error occurred while importing",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const hasInstagram = (session?.user as any)?.accounts?.some(
    (acc: any) => acc.provider === "instagram"
  );
  const hasPinterest = (session?.user as any)?.accounts?.some(
    (acc: any) => acc.provider === "pinterest"
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Import from Social Media
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Quickly build your portfolio by importing your artwork from Instagram or Pinterest
      </p>

      <div className="space-y-3">
        {hasInstagram && (
          <button
            onClick={() => handleImport("instagram")}
            disabled={isImporting}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            {isImporting ? "Importing..." : "Import from Instagram"}
          </button>
        )}

        {hasPinterest && (
          <button
            onClick={() => handleImport("pinterest")}
            disabled={isImporting}
            className="w-full flex items-center justify-center gap-3 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
            </svg>
            {isImporting ? "Importing..." : "Import from Pinterest"}
          </button>
        )}

        {!hasInstagram && !hasPinterest && (
          <p className="text-gray-500 text-sm text-center py-4">
            Sign in with Instagram or Pinterest to import your portfolio
          </p>
        )}
      </div>

      {importResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            importResult.success
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {importResult.success ? (
            <p>
              Successfully imported {importResult.imported} item(s) to your portfolio!
            </p>
          ) : (
            <p>{importResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
