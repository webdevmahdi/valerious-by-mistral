export function Badge({ children, tone = 'ink' }: { children: React.ReactNode; tone?: 'ink' | 'bronze' | 'stone' }) {
  const tones = {
    ink: 'bg-ink text-bone',
    bronze: 'bg-bronze text-bone',
    stone: 'border border-line text-stone',
  }
  return <span className={`eyebrow inline-block px-2.5 py-1 ${tones[tone]}`}>{children}</span>
}
