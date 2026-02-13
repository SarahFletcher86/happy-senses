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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/70 px-3.5 py-3 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300 dark:shadow-none">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Quick explore
        </span>
        {quickExploreLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800/90 dark:hover:text-white dark:focus-visible:ring-slate-700"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
