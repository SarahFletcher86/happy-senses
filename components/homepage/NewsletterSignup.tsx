'use client';

import { useState } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const beehiivFormId = process.env.NEXT_PUBLIC_BEEHIIV_INLINE_FORM_ID;

  if (submitted) {
    return (
      <section id="newsletter" className="bg-[var(--cream)] px-4 py-16 md:py-24 dark:bg-[#1A2024]">
        <div className="mx-auto max-w-[540px] text-center">
          <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(168,216,168,0.55)] dark:bg-[rgba(168,216,168,0.28)]">
            <svg className="h-7 w-7 text-[#3F7A3F] dark:text-[#B5DCB5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-[family-name:var(--font-fraunces)] text-[28px] font-semibold text-[var(--charcoal)] dark:text-[#F8F2E5]">
            You&rsquo;re in.
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--mid-gray)] dark:text-[#C8C0B2]">
            Check your inbox. Quiet Hours lands every Sunday morning.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="newsletter" className="bg-[var(--cream)] px-4 py-16 md:py-24 dark:bg-[#1A2024]">
      <div className="mx-auto max-w-[540px] text-center">
        <p className="mb-4 font-[family-name:var(--font-fraunces)] text-[16px] italic text-[var(--mid-gray)] dark:text-[#ADA590]">
          Quiet Hours
        </p>
        <p className="mb-1 text-[13px] font-medium uppercase tracking-[0.15em] text-[var(--mid-gray)] dark:text-[#9AA8A6]">
          · the weekly newsletter
        </p>

        <h2 className="mt-6 font-[family-name:var(--font-fraunces)] text-[32px] leading-[1.2] font-semibold text-[var(--charcoal)] md:text-[38px] dark:text-[#F8F2E5]">
          Have a calmer week, with one email.
        </h2>

        <p className="mt-4 text-[15px] leading-[1.7] text-[var(--mid-gray)] dark:text-[#C8C0B2]">
          A weekly email for neurodivergent and sensory-sensitive humans — one good ND story, fresh
          sensory-friendly venues, and one product worth knowing about. From someone who gets it.
        </p>

        <ul className="mt-6 space-y-2.5 text-left">
          <li className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-[var(--charcoal)] dark:text-[#F5EFE5]">
            <span className="mt-[3px] flex-shrink-0 text-[var(--gentle-green)] dark:text-[#B5DCB5]">—</span>
            <span>A neuro-affirming story — proof the world is bigger than we were told</span>
          </li>
          <li className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-[var(--charcoal)] dark:text-[#F5EFE5]">
            <span className="mt-[3px] flex-shrink-0 text-[var(--gentle-green)] dark:text-[#B5DCB5]">—</span>
            <span>The freshest sensory-friendly venues — added this week</span>
          </li>
          <li className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-[var(--charcoal)] dark:text-[#F5EFE5]">
            <span className="mt-[3px] flex-shrink-0 text-[var(--gentle-green)] dark:text-[#B5DCB5]">—</span>
            <span>One product worth knowing — when it&rsquo;s actually worth it</span>
          </li>
        </ul>

        {beehiivFormId ? (
          <div className="mt-8">
            <iframe
              src={`https://embeds.beehiiv.com/${beehiivFormId}`}
              data-test-id="beehiiv-embed"
              frameBorder="0"
              scrolling="no"
              className="mx-auto w-full max-w-[480px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--light-cream)] dark:border-[rgba(248,242,229,0.08)] dark:bg-[#1F2A2F]"
              style={{ height: '52px' }}
              title="Newsletter signup"
            />
          </div>
        ) : (
          <form
            action="https://app.beehiiv.com/p/subscribe"
            method="post"
            target="_blank"
            onSubmit={() => setSubmitted(true)}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full max-w-[320px] rounded-[999px] border border-[var(--border-subtle)] bg-[var(--light-cream)] px-5 text-[15px] text-[var(--charcoal)] placeholder:text-[var(--mid-gray)] focus:border-[var(--calm-teal)] focus:outline-none dark:border-[rgba(248,242,229,0.12)] dark:bg-[#1A2024] dark:text-[#F8F2E5] dark:placeholder:text-[#ADA590] dark:focus:border-[#6FCFCE]"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-[999px] border border-[var(--calm-teal)] bg-[var(--calm-teal)] px-7 text-[15px] font-semibold text-white transition hover:bg-[var(--calm-teal-deep)] dark:border-[#6FCFCE] dark:bg-[#6FCFCE] dark:text-[#141A20] dark:hover:bg-[#8FE0DF]"
            >
              Send me the weekly
            </button>
          </form>
        )}

        <p className="mt-4 text-[13px] text-[var(--mid-gray)] dark:text-[#ADA590]">
          Free. One email a week. Easy unsubscribe.
        </p>
      </div>
    </section>
  );
}
