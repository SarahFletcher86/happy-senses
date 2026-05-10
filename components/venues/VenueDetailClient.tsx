'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { VenueNote } from '@/lib/types';

interface VenueDetailClientProps {
  slug: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialNotes: VenueNote[];
}

export function VenueDetailClient({
  slug,
  initialUpvotes,
  initialDownvotes,
  initialNotes,
}: VenueDetailClientProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [notes, setNotes] = useState(initialNotes);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [noteText, setNoteText] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleVote = async (type: 'up' | 'down') => {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, type }),
    });

    if (!response.ok) return;
    const data = await response.json();
    setUpvotes(data.upvotes);
    setDownvotes(data.downvotes);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          note_text: noteText,
          submitter_name: name,
          submitter_email: email,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message ?? 'We could not save that note right now.');
        return;
      }

      setNotes(data.notes);
      setNoteText('');
      setName('');
      setEmail('');
      setMessage(data.message ?? 'Thanks. Your note was sent for moderation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="detail-section rounded-[28px] border border-border-subtle bg-cream p-5 shadow-card dark:border-dark-border dark:bg-dark-card">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mid-gray dark:text-dark-text-muted">
          Did the rating match your experience?
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleVote('up')}
            className="inline-flex items-center gap-2 rounded-full bg-[rgba(168,216,168,0.22)] px-4 py-2 font-semibold text-[#3F7A3F] dark:bg-[rgba(168,216,168,0.12)] dark:text-[#B5DCB5]"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Yes · {upvotes}</span>
          </button>
          <button
            type="button"
            onClick={() => handleVote('down')}
            className="inline-flex items-center gap-2 rounded-full bg-[rgba(244,168,146,0.22)] px-4 py-2 font-semibold text-[#B25938] dark:bg-[rgba(244,168,146,0.12)] dark:text-[#F8C4B0]"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Not quite · {downvotes}</span>
          </button>
        </div>
      </div>

      <section className="detail-section rounded-[28px] border border-border-subtle bg-cream p-6 shadow-card dark:border-dark-border dark:bg-dark-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-charcoal dark:text-dark-text-heading">Community notes</h2>
            <p className="text-sm text-mid-gray dark:text-dark-text-muted">
              Approved experiences from families and visitors appear here.
            </p>
          </div>
          <span className="text-sm font-semibold text-mid-gray dark:text-dark-text-muted">
            {notes.length} approved note{notes.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {notes.length > 0 ? (
            notes.map((note) => (
              <article
                key={note.id}
                className="detail-subcard rounded-2xl border border-border-subtle bg-light-cream p-4 dark:border-dark-border dark:bg-dark-bg"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-charcoal dark:text-dark-text-heading">{note.displayName}</p>
                  <p className="text-xs text-mid-gray dark:text-dark-text-muted">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-7 text-charcoal dark:text-dark-text-primary">{note.noteText}</p>
              </article>
            ))
          ) : (
            <div className="detail-subcard rounded-2xl border border-dashed border-[rgba(44,51,56,0.14)] p-5 text-sm text-mid-gray dark:border-dark-border dark:text-dark-text-muted">
              No approved notes yet. You can be the first to share what the visit felt like.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-charcoal dark:text-dark-text-heading">
              Add your experience
            </label>
            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              required
              rows={5}
              className="search-input w-full rounded-2xl border border-border-subtle bg-light-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-calm-teal dark:border-dark-border dark:bg-dark-bg dark:text-dark-text-primary"
              placeholder="Share what felt calm, tricky, or especially helpful."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="search-input rounded-2xl border border-border-subtle bg-light-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-calm-teal dark:border-dark-border dark:bg-dark-bg dark:text-dark-text-primary"
              placeholder="Your name (optional)"
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="search-input rounded-2xl border border-border-subtle bg-light-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-calm-teal dark:border-dark-border dark:bg-dark-bg dark:text-dark-text-primary"
              placeholder="Email for moderation follow-up (optional)"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting || noteText.trim().length === 0}
              className="rounded-full bg-calm-teal px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Submit note'}
            </button>
            {message ? (
              <p className="text-sm text-mid-gray dark:text-dark-text-muted">{message}</p>
            ) : (
              <p className="text-sm text-mid-gray dark:text-dark-text-muted">
                Notes are reviewed before they appear publicly.
              </p>
            )}
          </div>
        </form>
      </section>
    </>
  );
}
