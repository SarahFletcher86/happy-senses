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
      <div className="flex flex-wrap items-center gap-3 mt-2">
        {quickExploreLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-medium bg-white/70 backdrop-blur-sm border border-[hsl(210,18%,85%)] text-[hsl(210,30%,25%)] hover:bg-white hover:border-[hsl(180,30%,70%)] transition-all duration-200"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
