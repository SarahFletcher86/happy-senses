import { Check, Heart, Plus } from 'lucide-react';

const blocks = [
  {
    icon: Check,
    iconBg: 'bg-[rgba(168,216,168,0.55)] dark:bg-[rgba(168,216,168,0.28)]',
    iconColor: 'text-[#3F7A3F] dark:text-[#B5DCB5]',
    title: 'A tier system, not a rating.',
    body: (
      <>
        <strong>Tier 1 — Verified</strong> means someone like you went and it worked.{' '}
        <strong>Tier 2 — Likely</strong> means real sensory credentials or programming.{' '}
        <strong>Tier 3 — Help us verify</strong> means it might be a fit; tell us what you find.
      </>
    ),
  },
  {
    icon: Heart,
    iconBg: 'bg-[rgba(196,226,238,0.60)] dark:bg-[rgba(184,221,232,0.30)]',
    iconColor: 'text-[#2F6985] dark:text-[#C4E2EE]',
    title: 'Built by someone who lives it.',
    body: (
      <>
        I&rsquo;m Sarah — autistic, ADHD, single mom to a sweet autistic 7-year-old. I live in Belleville,
        so I know what it&rsquo;s like to be two hours from where the resources cluster. I reply to every
        email.
      </>
    ),
  },
  {
    icon: Plus,
    iconBg: 'bg-[rgba(248,196,176,0.55)] dark:bg-[rgba(244,168,146,0.28)]',
    iconColor: 'text-[#A24E2A] dark:text-[#F8C4B0]',
    title: 'Add a venue you love.',
    body: (
      <>
        Know a hairdresser, dentist, café, or library that just <em>gets it</em>? Tell us. Every submission
        gets reviewed by a human before it goes live. Community grows the directory.
      </>
    ),
  },
];

export function ValueBlocks() {
  return (
    <section className="bg-[var(--cream)] px-4 py-20 md:py-28 dark:bg-[#1A2024]">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-center text-[13px] font-semibold uppercase tracking-[0.15em] text-[var(--mid-gray)] dark:text-[#9AA8A6]">
          How this works
        </p>
        <h2 className="text-center font-[family-name:var(--font-fraunces)] text-[32px] leading-[1.2] font-semibold text-[var(--charcoal)] md:text-[38px] dark:text-[#F8F2E5]">
          Different kind of directory.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {blocks.map((block) => {
            const Icon = block.icon;
            return (
              <div
                key={block.title}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--cream)] p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(44,51,56,0.08)] dark:border-[rgba(248,242,229,0.08)] dark:bg-[#232C36] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
              >
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${block.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${block.iconColor}`} />
                </div>
                <h3 className="text-[18px] font-semibold leading-[1.3] text-[var(--charcoal)] dark:text-[#FBF5E5]">
                  {block.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-[var(--mid-gray)] dark:text-[#C8C0B2]">
                  {block.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
