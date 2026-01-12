import { auth } from "@/lib/auth";
import { FeedbackForm } from "@/components/feedback-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function FeedbackPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#2563EB] hover:text-[#1D4ED8] font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1F2933] mb-4">
            Co-create the future of this tool
          </h1>
          <p className="text-lg text-[#1F2933]/70 mb-6">
            Your feedback helps us build a better product for artists like you.
          </p>

          {/* Founder Note */}
          <div className="bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-lg p-4 mb-8">
            <p className="text-sm text-[#1F2933] leading-relaxed">
              <span className="font-semibold">Note:</span> You are directly emailing our founder. We're taking your feedback seriously to improve the product.
            </p>
          </div>
        </div>

        {/* Feedback Form */}
        <FeedbackForm userEmail={session?.user?.email || null} />
      </div>
    </div>
  );
}
