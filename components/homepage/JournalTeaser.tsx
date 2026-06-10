interface JournalPost {
  tag: string;
  title: string;
  excerpt: string;
  date: string;
}

const posts: JournalPost[] = [
  {
    tag: 'Guide · 6 min read',
    title: "10 sensory-friendly cafés in Toronto that won't overwhelm you",
    excerpt:
      'Where to find calm light, quiet corners, and staff who don’t blink when you ask about noise.',
    date: 'May 21, 2026',
  },
  {
    tag: 'Story · 4 min read',
    title: "The hairdresser who finally got my son's haircut right",
    excerpt:
      'The thing nobody tells you: it’s the ten minutes before the chair that matters more than the cut itself.',
    date: 'May 14, 2026',
  },
  {
    tag: 'Tool · 3 min read',
    title: 'Loop earplugs, one year in: what we actually wear them for',
    excerpt:
      'Not a sponsored review. A real account of which pairs we reach for, which we lost, and what’s worth it.',
    date: 'May 7, 2026',
  },
];

export function JournalTeaser() {
  return (
    <section className="bg-[var(--mint)] px-4 py-20 md:py-28 dark:bg-[#141A20]">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-center text-[13px] font-semibold uppercase tracking-[0.15em] text-[var(--mid-gray)] dark:text-[#9AA8A6]">
          From The Journal
        </p>
        <h2 className="text-center font-[family-name:var(--font-fraunces)] text-[32px] leading-[1.2] font-semibold text-[var(--charcoal)] md:text-[38px] dark:text-[#F8F2E5]">
          Deeper reads when you have time.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <a
              key={post.title}
              href="#"
              className="group flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--cream)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--calm-teal)] hover:shadow-[0_8px_24px_rgba(91,184,183,0.08)] dark:border-[rgba(248,242,229,0.08)] dark:bg-[#232C36] dark:hover:border-[#6FCFCE] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
            >
              <span className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--calm-teal)] dark:text-[#6FCFCE]">
                {post.tag}
              </span>
              <h3 className="text-[17px] font-bold leading-[1.35] text-[var(--charcoal)] transition group-hover:text-[var(--calm-teal)] dark:text-[#FBF5E5] dark:group-hover:text-[#6FCFCE]">
                {post.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[var(--mid-gray)] dark:text-[#C8C0B2]">
                {post.excerpt}
              </p>
              <p className="mt-auto pt-4 text-[13px] font-medium text-[var(--mid-gray)] dark:text-[#ADA590]">
                {post.date}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
