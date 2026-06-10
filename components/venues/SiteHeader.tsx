'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { HappySensesLogo } from '@/components/HappySensesLogo';
import { ThemeControls } from './ThemeControls';

const navLinks = [
  { href: '/directory', label: 'Directory' },
  { href: 'https://blog.happysenses.ca', label: 'The Journal', external: true },
  { href: '/about', label: 'About' },
];

function NewsletterLink({ onClick }: { onClick?: () => void }) {
  return (
    <a
      href="/#newsletter"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-[999px] border border-[var(--calm-teal)] bg-[var(--calm-teal)] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[var(--calm-teal-deep)] dark:border-[var(--dark-cta-teal)] dark:bg-[var(--dark-cta-teal)] dark:text-[#141A20] dark:hover:bg-[#8FE0DF]"
    >
      Get the Newsletter
    </a>
  );
}

function PrimaryNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {navLinks.map((link) =>
        link.external ? (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer" onClick={onNavigate}>
            {link.label}
          </a>
        ) : (
          <Link key={link.href} href={link.href} onClick={onNavigate}>
            {link.label}
          </Link>
        )
      )}
    </>
  );
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  const closeMenu = () => {
    shouldRestoreFocusRef.current = true;
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const menu = mobileMenuRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () => Array.from(menu?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);

    window.requestAnimationFrame(() => {
      const [firstFocusable] = getFocusable();
      firstFocusable?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen || !shouldRestoreFocusRef.current) return;

    shouldRestoreFocusRef.current = false;
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--cream)] dark:border-[var(--dark-border)] dark:bg-[var(--dark-bg)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6 md:hidden">
        <Link href="/" className="flex items-center gap-3">
          <HappySensesLogo size={44} className="rounded-2xl" />
          <span className="font-[family-name:var(--font-fraunces)] text-[24px] font-semibold text-charcoal dark:text-dark-text-heading">Happy Senses</span>
        </Link>
        <button
          ref={menuButtonRef}
          type="button"
          aria-controls={mobileMenuId}
          aria-expanded={isMenuOpen}
          onClick={() => {
            if (isMenuOpen) {
              closeMenu();
            } else {
              setIsMenuOpen(true);
            }
          }}
          className="theme-toggle-pill inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-border-subtle bg-white text-charcoal dark:border-[#3A4A50] dark:bg-transparent dark:text-[#F2EBDD]"
        >
          <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
          {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      <div className="mx-auto hidden max-w-7xl grid-cols-[minmax(220px,1fr)_auto_minmax(320px,1fr)] items-center gap-x-8 px-4 py-6 md:grid">
        <Link href="/" className="flex items-center gap-4 justify-self-start">
          <HappySensesLogo size={56} className="rounded-2xl" />
          <span>
            <span className="block font-[family-name:var(--font-fraunces)] text-[28px] font-semibold text-charcoal dark:text-dark-text-heading">
              Happy Senses
            </span>
            <span className="block text-[13px] font-medium text-mid-gray dark:text-dark-text-muted">
              Sensory-friendly spaces for everyone
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="flex items-center justify-center gap-6 text-[15px] font-medium text-charcoal dark:text-dark-text-heading"
        >
          <PrimaryNav />
        </nav>

        <div className="flex items-center justify-end gap-3">
          <ThemeControls />
          <NewsletterLink />
        </div>
      </div>

      {isMenuOpen ? (
        <div
          id={mobileMenuId}
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="border-t border-[var(--border-subtle)] bg-[var(--cream)] px-4 py-5 shadow-[0_12px_30px_rgba(44,51,56,0.08)] dark:border-[var(--dark-border)] dark:bg-[var(--dark-card)] md:hidden"
        >
          <nav
            aria-label="Mobile primary"
            className="grid gap-4 text-lg font-medium text-charcoal dark:text-dark-text-heading"
          >
            <PrimaryNav onNavigate={closeMenu} />
          </nav>
          <div className="mt-6 grid gap-4">
            <ThemeControls />
            <NewsletterLink onClick={closeMenu} />
          </div>
        </div>
      ) : null}
    </header>
  );
}
