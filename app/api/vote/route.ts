import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { incrementVote } from '@/lib/airtable';
import { getVenueBySlug } from '@/lib/venues';
import type { VoteRequest, VoteResponse } from '@/lib/types';

export async function POST(request: Request): Promise<NextResponse<VoteResponse>> {
  try {
    const body: VoteRequest = await request.json();
    const type = body.type ?? body.direction;

    if (!body.slug || (type !== 'up' && type !== 'down')) {
      return NextResponse.json(
        { success: false, upvotes: 0, downvotes: 0 },
        { status: 400 }
      );
    }

    const venue = await getVenueBySlug(body.slug);
    if (!venue?.recordId) {
      return NextResponse.json(
        {
          success: true,
          upvotes: venue?.community_upvotes ?? 0,
          downvotes: venue?.community_downvotes ?? 0,
        },
        { status: venue ? 200 : 404 }
      );
    }

    const updated = await incrementVote(venue.recordId, type);
    revalidateTag(`venue:${body.slug}`, 'max');
    revalidateTag('venues', 'max');
    revalidateTag('featured-venues', 'max');
    revalidateTag('city-counts', 'max');
    return NextResponse.json({
      success: true,
      upvotes: updated.upvotes,
      downvotes: updated.downvotes,
    });
  } catch (error) {
    console.error('Error processing vote', error);
    return NextResponse.json(
      { success: false, upvotes: 0, downvotes: 0 },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const venue = await getVenueBySlug(slug);
  if (!venue) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    upvotes: venue.community_upvotes,
    downvotes: venue.community_downvotes,
  });
}
