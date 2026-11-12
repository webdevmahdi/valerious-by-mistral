const TONES: { base: string; shade: string; detail: string }[] = [
  { base: '#cfc5b2', shade: '#b3a78e', detail: '#8f8470' },
  { base: '#c2b9a4', shade: '#a89d85', detail: '#857b66' },
  { base: '#b5ad9c', shade: '#9c937f', detail: '#7a7260' },
  { base: '#a9a294', shade: '#8f8878', detail: '#6f6a5b' },
  { base: '#9aa08c', shade: '#7f8672', detail: '#5f6656' },
  { base: '#a9927a', shade: '#8d7862', detail: '#6d5c49' },
  { base: '#8f8a79', shade: '#75705f', detail: '#575346' },
  { base: '#b0a390', shade: '#94866f', detail: '#726552' },
]

function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return h
}

const SILHOUETTES: Record<string, string> = {
  't-shirts': 'M70 55 L55 62 L38 95 L52 104 L60 92 L60 200 L140 200 L140 92 L148 104 L162 95 L145 62 L130 55 Q115 68 100 68 Q85 68 70 55 Z',
  shirts: 'M72 50 L56 58 L40 96 L54 105 L62 92 L58 205 L142 205 L138 92 L146 105 L160 96 L144 58 L128 50 L115 66 L100 78 L85 66 Z M100 78 L100 205',
  pants: 'M62 45 L138 45 L142 115 L132 210 L108 210 L100 130 L92 210 L68 210 L58 115 Z',
  hoodies: 'M68 62 L52 70 L36 104 L52 113 L60 100 L58 205 L142 205 L140 100 L148 113 L164 104 L148 70 L132 62 Q118 80 100 80 Q82 80 68 62 Z M78 150 L122 150 L122 185 L78 185 Z',
  jackets: 'M70 52 L54 60 L38 98 L52 107 L61 94 L58 208 L96 208 L100 120 L104 208 L142 208 L139 94 L148 107 L162 98 L146 60 L130 52 L115 70 L100 84 L85 70 Z',
}

interface ArtImageProps {
  seed: string
  category?: string
  variant?: number
  label?: string
  className?: string
  children?: React.ReactNode
}

export function ArtImage({ seed, category, variant = 0, label, className = '', children }: ArtImageProps) {
  const h = hashSeed(seed + variant)
  const tone = TONES[h % TONES.length]
  const gid = `g-${hashSeed(seed + variant + 'f')}`
  const path = category ? SILHOUETTES[category] : undefined

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: tone.base }} role="img" aria-label={label ?? 'Valerius editorial imagery'}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <filter id={gid}>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0" />
          </filter>
        </defs>
        <rect width="200" height="250" filter={`url(#${gid})`} />
        {path && (
          <path d={path} fill={tone.shade} stroke={tone.detail} strokeWidth="1.4" strokeLinejoin="round" transform="translate(0,6) scale(1)" opacity="0.85" />
        )}
        <line x1="0" y1={196} x2="200" y2={196} stroke={tone.detail} strokeWidth="0.6" opacity="0.5" />
      </svg>
      {children}
    </div>
  )
}
