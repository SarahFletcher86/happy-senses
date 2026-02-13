import Link from 'next/link';

const quickExploreLinks = [
  { label: 'Top Restaurants', href: '/?category=Restaurant' },
  { label: 'Parks & Nature', href: '/?category=Park' },
  { label: 'Museums', href: '/?category=Museum' },
  { label: 'Pools & Splash Pads', href: '/?search=pool' },
  { label: 'Quiet Room Options', href: '/?quiet_room=true' },
  { label: 'Accessible', href: '/?accessible=true' },
  { label: 'Staff Trained', href: '/?staff_trained=true' },
];

export function QuickExploreBar() {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 mb-4 space-y-2">
      <div className="text-xs uppercase tracking-widest text-[color:var(--muted)] opacity-70">
        Quick explore
      </div>
      <div className="flex flex-wrap items-center gap-2.5 mt-2">
        {quickExploreLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full border border-[color:var(--border)] bg-white/70 px-3.5 py-1.5 text-sm font-medium text-[color:var(--text)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-[hsl(180_30%_70%)] hover:bg-white/90 hover:shadow-[0_2px_6px_rgba(15,23,42,0.06)] aria-[current=page]:border-[hsl(182_40%_70%)] aria-[current=page]:bg-[hsl(182_45%_94%)] dark:border-[color:var(--border)] dark:bg-[hsl(210_18%_12%)] dark:text-[color:var(--text)] dark:shadow-none dark:hover:bg-[hsl(210_18%_16%)] dark:hover:border-[hsl(210_12%_36%)] dark:aria-[current=page]:border-[hsl(182_40%_40%)] dark:aria-[current=page]:bg-[hsl(182_40%_18%)]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
