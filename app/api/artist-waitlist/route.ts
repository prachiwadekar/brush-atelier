import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Submit artist application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      instagramHandle,
      pinterestHandle,
      portfolioUrl,
      specialization,
      yearsExperience,
      offeringDescription
    } = body;

    // Validate required fields
    if (!name || !email || !offeringDescription) {
      return NextResponse.json(
        { error: 'Name, email, and offering description are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingArtist = await prisma.artistWaitlist.findUnique({
      where: { email }
    });

    if (existingArtist) {
      return NextResponse.json(
        {
          error: 'You have already joined the waitlist!',
          waitlistPosition: existingArtist.waitlistPosition
        },
        { status: 409 }
      );
    }

    // Get current max position to calculate next position
    const maxPosition = await prisma.artistWaitlist.aggregate({
      _max: {
        waitlistPosition: true
      }
    });

    const nextPosition = (maxPosition._max.waitlistPosition || 0) + 1;

    // Create waitlist entry
    const artist = await prisma.artistWaitlist.create({
      data: {
        name,
        email,
        instagramHandle: instagramHandle || null,
        pinterestHandle: pinterestHandle || null,
        portfolioUrl: portfolioUrl || null,
        specialization: specialization || null,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
        offeringDescription,
        waitlistPosition: nextPosition
      }
    });

    // Get total count for confirmation
    const totalArtists = await prisma.artistWaitlist.count();

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the artist waitlist!',
      waitlistPosition: artist.waitlistPosition,
      totalArtists,
      artist: {
        name: artist.name,
        email: artist.email,
        waitlistPosition: artist.waitlistPosition
      }
    });

  } catch (error) {
    console.error('Error adding artist to waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Get artist count for homepage
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    // If email provided, get specific artist position
    if (email) {
      const artist = await prisma.artistWaitlist.findUnique({
        where: { email },
        select: {
          name: true,
          email: true,
          waitlistPosition: true,
          status: true,
          createdAt: true
        }
      });

      if (!artist) {
        return NextResponse.json(
          { error: 'Not found on waitlist' },
          { status: 404 }
        );
      }

      const totalArtists = await prisma.artistWaitlist.count();

      return NextResponse.json({
        artist,
        totalArtists
      });
    }

    // Otherwise return total count
    const totalArtists = await prisma.artistWaitlist.count();

    return NextResponse.json({
      totalArtists
    });

  } catch (error) {
    console.error('Error fetching artist waitlist data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist data' },
      { status: 500 }
    );
  }
}
