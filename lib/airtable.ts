import Airtable from 'airtable';
import type { VenueNote } from './types';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_VENUES_TABLE_ID = process.env.AIRTABLE_VENUES_TABLE_ID;
const AIRTABLE_NOTES_TABLE_ID = process.env.AIRTABLE_NOTES_TABLE_ID;
const AIRTABLE_SUBMISSIONS_TABLE_ID = process.env.AIRTABLE_SUBMISSIONS_TABLE_ID;

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

interface NotePayload {
  note_text: string;
  submitter_name?: string;
  submitter_email?: string;
}

interface SubmissionPayload {
  venue_name: string;
  [key: string]: unknown;
}

function hasAirtableConfig(): boolean {
  return Boolean(
    process.env.AIRTABLE_PAT &&
      AIRTABLE_BASE_ID &&
      AIRTABLE_VENUES_TABLE_ID &&
      AIRTABLE_NOTES_TABLE_ID &&
      AIRTABLE_SUBMISSIONS_TABLE_ID
  );
}

function getBase() {
  if (!hasAirtableConfig()) {
    throw new Error('Airtable is not configured.');
  }

  return new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(AIRTABLE_BASE_ID!);
}

function quoteFormulaValue(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

async function selectAll(
  tableId: string,
  options: Airtable.SelectOptions<Record<string, unknown>>
): Promise<AirtableRecord[]> {
  const table = getBase()(tableId);
  const records = await table.select(options).all();

  return records.map((record) => ({
    id: record.id,
    fields: record.fields,
  }));
}

export function isAirtableConfigured(): boolean {
  return hasAirtableConfig();
}

export async function incrementVote(recordId: string, type: 'up' | 'down') {
  const table = getBase()(AIRTABLE_VENUES_TABLE_ID!);
  const fieldName = type === 'up' ? 'community_upvotes' : 'community_downvotes';

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await table.find(recordId);
    const currentValue = Number(current.get(fieldName) ?? 0);
    const updated = await table.update(recordId, {
      [fieldName]: currentValue + 1,
    });

    return {
      upvotes: Number(updated.get('community_upvotes') ?? 0),
      downvotes: Number(updated.get('community_downvotes') ?? 0),
    };
  }

  throw new Error('Unable to update vote count.');
}

export async function fetchApprovedNotes(recordId: string): Promise<VenueNote[]> {
  const notes = await selectAll(AIRTABLE_NOTES_TABLE_ID!, {
    filterByFormula: `AND({status}='Approved', FIND(${quoteFormulaValue(
      recordId
    )}, ARRAYJOIN({venue} & '')))`,
    sort: [{ field: 'Created', direction: 'desc' }],
  });

  return notes.map((note) => ({
    id: note.id,
    displayName: String(note.fields.submitter_name ?? 'Anonymous'),
    noteText: String(note.fields.note_text ?? ''),
    createdAt: String(note.fields.Created ?? note.fields.created_at ?? new Date(0).toISOString()),
    upvotes: Number(note.fields.upvotes ?? 0),
    downvotes: Number(note.fields.downvotes ?? 0),
  }));
}

export async function addNote(recordId: string, payload: NotePayload) {
  const base = getBase();
  const venue = await base(AIRTABLE_VENUES_TABLE_ID!).find(recordId);
  const venueName = String(venue.get('name') ?? 'venue');
  const submitter = payload.submitter_name?.trim() || 'anonymous';

  await base(AIRTABLE_NOTES_TABLE_ID!).create({
    note_summary: `Note from ${submitter} re ${venueName}`,
    status: 'Pending',
    note_text: payload.note_text.trim(),
    submitter_name: payload.submitter_name?.trim() || '',
    submitter_email: payload.submitter_email?.trim() || '',
    venue: [recordId],
  });

  const notesCount = Number(venue.get('community_notes_count') ?? 0);
  await base(AIRTABLE_VENUES_TABLE_ID!).update(recordId, {
    community_notes_count: notesCount + 1,
  });
}

export async function addSubmission(payload: SubmissionPayload) {
  const base = getBase();
  await base(AIRTABLE_SUBMISSIONS_TABLE_ID!).create({
    ...payload,
    venue_name: payload.venue_name,
  });
}
