'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, Mail, Instagram, Globe, Calendar, ExternalLink, Search } from 'lucide-react';

type Artist = {
  id: string;
  name: string;
  email: string;
  instagramHandle: string | null;
  pinterestHandle: string | null;
  portfolioUrl: string | null;
  specialization: string | null;
  yearsExperience: number | null;
  offeringDescription: string;
  waitlistPosition: number;
  status: string;
  notes: string | null;
  createdAt: string;
};

export default function ArtistWaitlistAdmin() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await fetch('/api/admin/artist-waitlist');
      if (response.ok) {
        const data = await response.json();
        setArtists(data.artists);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateArtistStatus = async (artistId: string, status: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/artist-waitlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId, status, notes })
      });

      if (response.ok) {
        fetchArtists();
        setSelectedArtist(null);
      }
    } catch (error) {
      console.error('Error updating artist:', error);
    }
  };

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = {
    PENDING: artists.filter(a => a.status === 'PENDING').length,
    CONTACTED: artists.filter(a => a.status === 'CONTACTED').length,
    APPROVED: artists.filter(a => a.status === 'APPROVED').length,
    REJECTED: artists.filter(a => a.status === 'REJECTED').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F2] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Artist Waitlist</h1>
          <p className="text-gray-600">Manage artist applications and onboarding</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Artists</p>
                  <p className="text-3xl font-bold">{artists.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold">{statusCounts.PENDING}</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">New</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Contacted</p>
                  <p className="text-3xl font-bold">{statusCounts.CONTACTED}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-3xl font-bold">{statusCounts.APPROVED}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Artist List */}
        <div className="space-y-4">
          {filteredArtists.map((artist) => (
            <Card key={artist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{artist.name}</CardTitle>
                      <Badge
                        className={
                          artist.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          artist.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                          artist.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {artist.status}
                      </Badge>
                      <span className="text-sm text-gray-500">#{artist.waitlistPosition}</span>
                    </div>
                    <CardDescription className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {artist.email}
                      </span>
                      {artist.instagramHandle && (
                        <span className="flex items-center gap-1">
                          <Instagram className="h-4 w-4" />
                          {artist.instagramHandle}
                        </span>
                      )}
                      {artist.portfolioUrl && (
                        <a
                          href={artist.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-blue-600"
                        >
                          <Globe className="h-4 w-4" />
                          Portfolio
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(artist.createdAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedArtist(selectedArtist?.id === artist.id ? null : artist)}
                  >
                    {selectedArtist?.id === artist.id ? 'Close' : 'View Details'}
                  </Button>
                </div>
              </CardHeader>

              {selectedArtist?.id === artist.id && (
                <CardContent className="border-t pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Specialization</h4>
                      <p className="text-gray-900">{artist.specialization || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Years of Experience</h4>
                      <p className="text-gray-900">{artist.yearsExperience || 'Not specified'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">What They Can Offer</h4>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {artist.offeringDescription}
                    </p>
                  </div>

                  {artist.notes && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Admin Notes</h4>
                      <p className="text-gray-900 whitespace-pre-wrap bg-blue-50 p-4 rounded-lg">
                        {artist.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button
                      onClick={() => updateArtistStatus(artist.id, 'CONTACTED')}
                      variant="outline"
                      size="sm"
                      disabled={artist.status === 'CONTACTED'}
                    >
                      Mark as Contacted
                    </Button>
                    <Button
                      onClick={() => updateArtistStatus(artist.id, 'APPROVED')}
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={artist.status === 'APPROVED'}
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateArtistStatus(artist.id, 'REJECTED')}
                      variant="destructive"
                      size="sm"
                      disabled={artist.status === 'REJECTED'}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {filteredArtists.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No artists found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
