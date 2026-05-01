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
      <div className="text-[11px] uppercase tracking-[0.18em] text-calmTeal font-sans font-medium mb-1" style={{ letterSpacing: '0.18em' }}>
        Quick Explore
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-2">
        {quickExploreLinks.map((link) => {
          let bg = 'bg-mint';
          if (link.label.includes('Park')) bg = 'bg-green-50';
          else if (link.label.includes('Museum')) bg = 'bg-iceBlue';
          else if (link.label.includes('Restaurant')) bg = 'bg-peach';
          else if (link.label.includes('Accessible')) bg = 'bg-mistGrey';
          else if (link.label.includes('Quiet')) bg = 'bg-butter';
          else if (link.label.includes('Staff')) bg = 'bg-calmTeal/10';
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium text-charcoal font-sans transition-all duration-200 ${bg} hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-calmTeal`}
              style={{ boxShadow: '0 1px 4px 0 rgba(62,198,183,0.06)' }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
