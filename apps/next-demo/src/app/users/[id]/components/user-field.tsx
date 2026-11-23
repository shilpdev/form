import type { ReactNode } from 'react'

interface UserFieldProps {
  label: string
  error: string | null
  children: ReactNode
}

export function UserField({ label, error, children }: UserFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
    </label>
  )
}
