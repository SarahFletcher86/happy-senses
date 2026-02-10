import { NextResponse } from 'next/server';
import type { VoteRequest, VoteResponse } from '@/lib/types';

// In-memory storage for votes (replace with database/persistence later)
// Using a Map to store vote counts per venue slug
const voteStore = new Map<string, { upvotes: number; downvotes: number }>();

export async function POST(request: Request): Promise<NextResponse<VoteResponse>> {
  try {
    const body: VoteRequest = await request.json();
    
    const { slug, direction } = body;
    
    if (!slug || !direction || (direction !== 'up' && direction !== 'down')) {
      return NextResponse.json(
        { success: false, upvotes: 0, downvotes: 0 },
        { status: 400 }
      );
    }
    
    // Get current vote counts or initialize
    const currentVotes = voteStore.get(slug) || { upvotes: 0, downvotes: 0 };
    
    // Update vote counts
    if (direction === 'up') {
      currentVotes.upvotes += 1;
    } else {
      currentVotes.downvotes += 1;
    }
    
    // Store updated counts
    voteStore.set(slug, currentVotes);
    
    return NextResponse.json({
      success: true,
      upvotes: currentVotes.upvotes,
      downvotes: currentVotes.downvotes,
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { success: false, upvotes: 0, downvotes: 0 },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return all vote counts (for debugging/development)
  return NextResponse.json({
    votes: Object.fromEntries(voteStore),
  });
}
