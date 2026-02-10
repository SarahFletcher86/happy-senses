import { NextResponse } from 'next/server';
import type { NoteRequest, NoteResponse, VenueNote } from '@/lib/types';

// Simple ID generator (replace with nanoid or UUID when persistence is added)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// In-memory storage for notes (replace with database/persistence later)
const notesStore = new Map<string, VenueNote[]>();

export async function POST(request: Request): Promise<NextResponse<NoteResponse>> {
  try {
    const body: NoteRequest = await request.json();
    
    const { slug, displayName, noteText } = body;
    
    if (!slug || !noteText || noteText.trim().length === 0) {
      return NextResponse.json(
        { success: false, notes: [] },
        { status: 400 }
      );
    }
    
    // Get existing notes or initialize
    const existingNotes = notesStore.get(slug) || [];
    
    // Create new note
    const newNote: VenueNote = {
      id: generateId(),
      displayName: displayName?.trim() || 'Anonymous',
      noteText: noteText.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
    };
    
    // Add new note to the beginning
    const updatedNotes = [newNote, ...existingNotes];
    
    // Store updated notes
    notesStore.set(slug, updatedNotes);
    
    return NextResponse.json({
      success: true,
      notes: updatedNotes,
    });
  } catch (error) {
    console.error('Error processing note:', error);
    return NextResponse.json(
      { success: false, notes: [] },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return all notes (for debugging/development)
  return NextResponse.json({
    notes: Object.fromEntries(notesStore),
  });
}
