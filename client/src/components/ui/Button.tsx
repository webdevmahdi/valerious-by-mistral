import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'light'
type Size = 'sm' | 'md' | 'lg'

interface BaseProps {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 font-sans uppercase tracking-[0.18em] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-bone hover:bg-ink-soft',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-bone',
  ghost: 'text-ink underline-offset-4 hover:underline',
  light: 'bg-bone text-ink hover:bg-paper',
}

const sizes: Record<Size, string> = {
  sm: 'text-[11px] px-4 py-2',
  md: 'text-xs px-6 py-3',
  lg: 'text-xs px-8 py-4',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: BaseProps & { to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link to={to} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </Link>
  )
}
