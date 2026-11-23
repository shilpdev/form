import { createContext, useContext, type ReactNode } from 'react'
import type { FormContext } from '@shared'
import { CONTEXT_OUTSIDE_FORM_MESSAGE } from '@shared/constants/messages'

const FormContextValue = createContext<FormContext | null>(null)

export function FormContextProvider({
  value,
  children,
}: {
  value: FormContext
  children: ReactNode
}) {
  return (
    <FormContextValue.Provider value={value as FormContext}>{children}</FormContextValue.Provider>
  )
}

export function useFormContext(): FormContext {
  const context = useContext(FormContextValue)
  if (!context) {
    throw new Error(CONTEXT_OUTSIDE_FORM_MESSAGE)
  }
  return context as FormContext
}
