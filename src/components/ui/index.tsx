import React from 'react'
import { cn } from '../../lib/utils'

// ── Button ─────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}
export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        {
          'bg-action text-white hover:bg-action-hover active:scale-[0.98]': variant === 'primary',
          'bg-surface-secondary text-ink hover:bg-border-subtle border border-border-subtle': variant === 'secondary',
          'text-ink hover:bg-surface-secondary': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          'text-xs px-3 h-7': size === 'sm',
          'text-sm px-4 h-9': size === 'md',
          'text-base px-5 h-11': size === 'lg',
        },
        className
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  )
}

// ── Input ──────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}
export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 h-10 rounded-lg border text-base text-ink bg-surface placeholder:text-ink-tertiary transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-action focus:border-action',
          error ? 'border-red-400 focus:ring-red-400' : 'border-border-strong',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-ink-secondary">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ── Textarea ───────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}
export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full px-3 py-2.5 rounded-lg border text-base text-ink bg-surface placeholder:text-ink-tertiary transition-colors resize-y min-h-[80px]',
          'focus:outline-none focus:ring-2 focus:ring-action focus:border-action',
          error ? 'border-red-400' : 'border-border-strong',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-ink-secondary">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ── Select ─────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}
export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full px-3 h-10 rounded-lg border text-base text-ink bg-surface transition-colors appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-action focus:border-action',
          error ? 'border-red-400' : 'border-border-strong',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}
export function Card({ padding = 'md', hover, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-border-subtle shadow-card',
        { 'cursor-pointer hover:shadow-card-hover transition-shadow': hover },
        { 'p-0': padding === 'none', 'p-4': padding === 'sm', 'p-5': padding === 'md', 'p-6': padding === 'lg' },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
}
export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
        variant === 'outline' && 'border border-current bg-transparent',
        className
      )}
    >
      {children}
    </span>
  )
}

// ── Avatar ─────────────────────────────────────────────────────
interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initials = (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div
      className={cn(
        'rounded-full bg-action/10 text-action font-semibold flex items-center justify-center flex-shrink-0',
        { 'w-6 h-6 text-2xs': size === 'sm', 'w-8 h-8 text-xs': size === 'md', 'w-10 h-10 text-sm': size === 'lg' },
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || ''} className="w-full h-full rounded-full object-cover" />
      ) : initials}
    </div>
  )
}

// ── Spinner ────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('animate-spin h-5 w-5 text-ink-secondary', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

// ── Empty State ────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="text-ink-tertiary mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-secondary max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  )
}

// ── Checkbox ───────────────────────────────────────────────────
interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}
export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <label className={cn('flex items-start gap-2.5 cursor-pointer', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-border-strong text-action focus:ring-action"
      />
      {label && <span className="text-sm text-ink leading-snug">{label}</span>}
    </label>
  )
}

// ── Section ────────────────────────────────────────────────────
interface SectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}
export function Section({ title, description, children, className, actions }: SectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          {description && <p className="text-sm text-ink-secondary mt-0.5">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

// ── Divider ────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-border-subtle', className)} />
}

// ── Tag ────────────────────────────────────────────────────────
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full', className)}>
      {children}
    </span>
  )
}
