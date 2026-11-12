import { useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const inputClass =
  'w-full border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-stone focus:border-ink focus:outline-none'

export function TextField({ label, error, hint, ...rest }: { label: string; error?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block text-stone">{label}</label>
      <input id={id} className={inputClass} aria-invalid={!!error} aria-describedby={hint ? `${id}-hint` : undefined} {...rest} />
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-stone">{hint}</p>}
      {error && <p className="mt-1 text-xs text-bronze" role="alert">{error}</p>}
    </div>
  )
}

export function SelectField({ label, error, children, ...rest }: { label: string; error?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block text-stone">{label}</label>
      <select id={id} className={inputClass} aria-invalid={!!error} {...rest}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-bronze" role="alert">{error}</p>}
    </div>
  )
}

export function TextArea({ label, error, ...rest }: { label: string; error?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block text-stone">{label}</label>
      <textarea id={id} className={`${inputClass} min-h-28`} aria-invalid={!!error} {...rest} />
      {error && <p className="mt-1 text-xs text-bronze" role="alert">{error}</p>}
    </div>
  )
}
