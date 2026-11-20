import { createContext, useContext, type ReactNode } from 'react'
import type { ReactFieldScope } from '../types'

const FieldContextValue = createContext<ReactFieldScope | null>(null)

export function FieldContextProvider({
  value,
  children,
}: {
  value: ReactFieldScope
  children: ReactNode
}) {
  return <FieldContextValue.Provider value={value}>{children}</FieldContextValue.Provider>
}

// `null` outside a `FormField`.
export function useFieldContext(): ReactFieldScope | null {
  return useContext(FieldContextValue)
}
