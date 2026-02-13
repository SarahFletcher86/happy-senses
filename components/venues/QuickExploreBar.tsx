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
      <div className="text-xs uppercase tracking-widest text-muted-foreground/70">
        Quick explore
      </div>
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto py-1 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {quickExploreLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-sm text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow active:translate-y-0 active:border-teal-200 active:bg-teal-50 active:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-100 dark:border-slate-700/50 dark:bg-slate-900/40 dark:text-slate-200 dark:shadow-none dark:hover:bg-slate-900/60 dark:hover:border-slate-600/70 dark:active:border-teal-400/30 dark:active:bg-teal-500/10 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:shadow-none"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
