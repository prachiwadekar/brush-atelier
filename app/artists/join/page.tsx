'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Globe, CheckCircle2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function ArtistJoinPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitlistData, setWaitlistData] = useState<{
    waitlistPosition: number;
    totalArtists: number;
    name: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    instagramHandle: '',
    pinterestHandle: '',
    portfolioUrl: '',
    specialization: '',
    yearsExperience: '',
    offeringDescription: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/artist-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Already on waitlist
          setWaitlistData({
            waitlistPosition: data.waitlistPosition,
            totalArtists: data.totalArtists || 0,
            name: formData.name
          });
          setSubmitted(true);
        } else {
          setErrors({ general: data.error || 'Failed to submit application' });
        }
      } else {
        setWaitlistData({
          waitlistPosition: data.waitlistPosition,
          totalArtists: data.totalArtists,
          name: formData.name
        });
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (submitted && waitlistData) {
    return (
      <div className="min-h-screen bg-[#FBF7F2]">
        {/* Header */}
        <header className="bg-[#FBF7F2]/95 backdrop-blur-md shadow-sm border-b border-[#1F2933]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <Link href="/" className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity">
                <h1 className="text-xl sm:text-3xl font-bold relative">
                  <span className="text-[#C2410C]">Brush</span>{" "}
                  <span className="text-[#1F2933]">Atelier</span>
                  <span className="absolute -top-1 sm:-top-2 -right-12 sm:-right-14 bg-[#2563EB] text-white text-[0.5rem] sm:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                    BETA
                  </span>
                </h1>
              </Link>

              {/* Feedback Banner - Visible on tablet+ */}
              <div className="hidden md:block">
                <div className="bg-red-500/80 px-4 py-2 rounded-lg shadow-sm">
                  <p className="text-xs lg:text-sm text-white font-bold text-center">
                    Inviting your feedback at{' '}
                    <a href="mailto:team.brushatelier@gmail.com" className="underline hover:text-white/90 transition-colors">
                      team.brushatelier@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center p-4 py-12">
          <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Welcome to Brush Atelier!</CardTitle>
            <CardDescription className="text-lg mt-2">
              You're on the waitlist, {waitlistData.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                #{waitlistData.waitlistPosition}
              </div>
              <p className="text-gray-600">Your position on the waitlist</p>
              <p className="text-sm text-gray-500 mt-2">
                Out of {waitlistData.totalArtists} artists
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What happens next?</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>We'll review your application soon</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You'll receive an email with next steps and onboarding details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>We'll help you set up your profile and start earning from critiques</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => router.push('/')}
                className="w-full"
                size="lg"
              >
                Return to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      {/* Header */}
      <header className="bg-[#FBF7F2]/95 backdrop-blur-md shadow-sm border-b border-[#1F2933]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity">
              <h1 className="text-xl sm:text-3xl font-bold relative">
                <span className="text-[#C2410C]">Brush</span>{" "}
                <span className="text-[#1F2933]">Atelier</span>
                <span className="absolute -top-1 sm:-top-2 -right-12 sm:-right-14 bg-[#2563EB] text-white text-[0.5rem] sm:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                  BETA
                </span>
              </h1>
            </Link>

            {/* Feedback Banner - Visible on tablet+ */}
            <div className="hidden md:block">
              <div className="bg-red-500/80 px-4 py-2 rounded-lg shadow-sm">
                <p className="text-xs lg:text-sm text-white font-bold text-center">
                  Inviting your feedback at{' '}
                  <a href="mailto:team.brushatelier@gmail.com" className="underline hover:text-white/90 transition-colors">
                    team.brushatelier@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Brush Atelier Logo"
                width={120}
                height={120}
                className="w-24 h-24 sm:w-28 sm:h-28"
                unoptimized
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join Brush Atelier as a Coach
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get paid for sharing your expertise. Help aspiring artists improve their craft while earning income from personalized critiques and guidance.
            </p>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Artist Application</CardTitle>
            <CardDescription>
              Tell us about yourself and what you can offer. We'll get back to you soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.general}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagramHandle">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram Handle
                    </div>
                  </Label>
                  <Input
                    id="instagramHandle"
                    name="instagramHandle"
                    value={formData.instagramHandle}
                    onChange={handleChange}
                    placeholder="@yourhandle"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinterestHandle">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Pinterest Handle
                    </div>
                  </Label>
                  <Input
                    id="pinterestHandle"
                    name="pinterestHandle"
                    value={formData.pinterestHandle}
                    onChange={handleChange}
                    placeholder="@yourhandle"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio Website</Label>
                <Input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offeringDescription">
                  What can you offer? *
                </Label>
                <Textarea
                  id="offeringDescription"
                  name="offeringDescription"
                  value={formData.offeringDescription}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us about your teaching style, what you specialize in, what kind of critiques you can provide, and what makes you a great mentor. Be as detailed as you'd like!"
                  className="resize-none"
                />
                <p className="text-sm text-gray-500">
                  Share your teaching philosophy, expertise areas, and how you can help students improve.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Submitting...' : 'Join Waitlist'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                * Required fields
              </p>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
