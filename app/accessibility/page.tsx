import type { Metadata } from 'next';
import { SiteFooter } from '@/components/venues/SiteFooter';
import { SiteHeader } from '@/components/venues/SiteHeader';

export const metadata: Metadata = {
  title: 'Accessibility — Happy Senses',
  description:
    'Happy Senses is built for sensory-overwhelmed and neurodivergent humans. WCAG 2.1 Level AA minimum, with toggles for easier reading and dark mode.',
  openGraph: {
    title: 'Accessibility — Happy Senses',
    description: 'Built for sensory-overwhelmed and neurodivergent humans. WCAG 2.1 Level AA minimum.',
    images: ['/logo.png'],
  },
};

const builtInItems = [
  {
    label: 'Easier reading toggle',
    description:
      'switches body type to Lexend with increased line-height and letter-spacing for many dyslexic, ADHD, and low-vision readers.',
  },
  {
    label: 'Dark mode',
    description: 'can follow your system preference or be toggled manually for lower-glare reading.',
  },
  {
    label: 'Reduced motion respect',
    description: 'honours your OS preference so interface motion can stay calm or disappear entirely.',
  },
  {
    label: 'Keyboard navigation',
    description: 'supports keyboard-friendly movement across interactive elements throughout the directory.',
  },
  {
    label: 'Alt text',
    description: 'keeps meaningful alternative text on images so screen readers have useful context.',
  },
  {
    label: 'WCAG AA contrast',
    description: 'targets text-to-background contrast that meets or exceeds WCAG 2.1 Level AA minimums.',
  },
  {
    label: 'Skip links',
    description: 'let keyboard and assistive-technology users jump directly to the main content.',
  },
];

const inProgressItems = [
  'Voice navigation refinement',
  'Better mobile gesture alternatives',
  'More complete keyboard support in venue card filters',
];

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[var(--mint)] font-[family-name:var(--font-quicksand)] text-charcoal [body.easier-reading_&]:font-[family-name:var(--font-lexend)] [body.easier-reading_&]:leading-[1.65] [body.easier-reading_&]:tracking-[0.01em] dark:bg-[var(--dark-bg)] dark:text-dark-text-primary">
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-50 rounded-xl bg-[var(--cream)] px-4 py-3 text-sm font-semibold text-charcoal shadow-[0_2px_10px_rgba(44,51,56,0.03)] focus:not-sr-only dark:bg-[var(--dark-card)] dark:text-dark-text-heading"
      >
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="space-y-6 md:space-y-8">
          <section className="rounded-[32px] border border-[var(--border-subtle)] bg-[var(--cream)] px-6 py-10 text-center shadow-[0_2px_10px_rgba(44,51,56,0.03)] dark:border-[var(--dark-border)] dark:bg-[var(--dark-card)] md:px-10">
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-charcoal dark:text-dark-text-heading md:text-5xl">
              Accessibility
            </h1>
            <p className="mx-auto mt-5 max-w-[720px] text-lg leading-8 text-charcoal dark:text-dark-text-primary">
              Happy Senses is built for sensory-overwhelmed and neurodivergent humans. Accessibility
              isn&apos;t a feature we added, it&apos;s the product. We target WCAG 2.1 Level AA at minimum
              and aim higher where we can.
            </p>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <article className="rounded-[32px] border border-[var(--border-subtle)] bg-[var(--cream)] p-6 shadow-[0_2px_10px_rgba(44,51,56,0.03)] dark:border-[var(--dark-border)] dark:bg-[var(--dark-card)] md:p-8">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-charcoal dark:text-dark-text-heading">
                What we&apos;ve built in
              </h2>
              <ul className="mt-5 space-y-4 text-lg leading-8 text-charcoal dark:text-dark-text-primary">
                {builtInItems.map((item) => (
                  <li key={item.label} className="ml-5 list-disc pl-1">
                    <strong>{item.label}</strong>
                    {' — '}
                    {item.description}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[32px] border border-[var(--border-subtle)] bg-[var(--cream)] p-6 shadow-[0_2px_10px_rgba(44,51,56,0.03)] dark:border-[var(--dark-border)] dark:bg-[var(--dark-card)] md:p-8">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-charcoal dark:text-dark-text-heading">
                What we&apos;re still working on
              </h2>
              <ul className="mt-5 space-y-4 text-lg leading-8 text-charcoal dark:text-dark-text-primary">
                {inProgressItems.map((item) => (
                  <li key={item} className="ml-5 list-disc pl-1">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-8 pl-4 text-base italic leading-7 text-mid-gray dark:text-dark-text-muted">
                Note: these features are on the directory you&apos;re using right now. The blog at
                {' '}
                blog.happysenses.ca and our email newsletter inherit accessibility from their
                publishing platforms; feedback on those surfaces is welcome too.
              </p>
            </article>
          </section>

          <section className="rounded-[32px] border border-[var(--border-subtle)] bg-[var(--cream)] px-6 py-10 text-center shadow-[0_2px_10px_rgba(44,51,56,0.03)] dark:border-[var(--dark-border)] dark:bg-[var(--dark-card)] md:px-10">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-charcoal dark:text-dark-text-heading md:text-4xl">
              Something not working for you?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-charcoal dark:text-dark-text-primary">
              Please reach out by email at
              {' '}
              <a className="font-semibold underline underline-offset-4" href="mailto:sarah@happysenses.ca">
                sarah@happysenses.ca
              </a>
              {' '}
              and tell us how we can better meet your needs.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
