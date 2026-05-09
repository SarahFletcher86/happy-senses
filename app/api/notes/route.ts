import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { addNote } from '@/lib/airtable';
import { getApprovedNotesBySlug, getVenueBySlug } from '@/lib/venues';
import type { NoteRequest, NoteResponse } from '@/lib/types';

export async function POST(request: Request): Promise<NextResponse<NoteResponse>> {
  try {
    const body: NoteRequest = await request.json();
    if (!body.slug || !body.note_text?.trim()) {
      return NextResponse.json(
        { success: false, notes: [], message: 'A venue and note are required.' },
        { status: 400 }
      );
    }

    const venue = await getVenueBySlug(body.slug);
    if (!venue?.recordId) {
      return NextResponse.json(
        {
          success: false,
          notes: [],
          message: 'Notes need Airtable credentials before they can be submitted.',
        },
        { status: 503 }
      );
    }

    await addNote(venue.recordId, body);
    revalidateTag(`venue:${body.slug}`, 'max');
    revalidateTag('venues', 'max');
    revalidateTag('notes', 'max');
    const notes = await getApprovedNotesBySlug(body.slug);
    return NextResponse.json({
      success: true,
      notes,
      message: 'Thanks. Your note was sent for moderation.',
    });
  } catch (error) {
    console.error('Error processing note', error);
    return NextResponse.json(
      { success: false, notes: [], message: 'We could not save that note right now.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ success: false, notes: [] }, { status: 400 });
  }

  const notes = await getApprovedNotesBySlug(slug);
  return NextResponse.json({ success: true, notes });
}
