export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="border-b border-mute bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm text-graphite">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl text-ink md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base text-graphite">{lede}</p>
      </div>
    </header>
  );
}
