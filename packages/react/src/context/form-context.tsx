import { createContext, useContext, type ReactNode } from 'react'
import type { FormContext } from '@shared'
import { CONTEXT_OUTSIDE_FORM_MESSAGE } from '@shared/messages'

const FormContextValue = createContext<FormContext<unknown> | null>(null)

export function FormContextProvider<Schema>({
  value,
  children,
}: {
  value: FormContext<Schema>
  children: ReactNode
}) {
  return (
    <FormContextValue.Provider value={value as FormContext<unknown>}>
      {children}
    </FormContextValue.Provider>
  )
}

export function useFormContext<Schema = unknown>(): FormContext<Schema> {
  const context = useContext(FormContextValue)
  if (!context) {
    throw new Error(CONTEXT_OUTSIDE_FORM_MESSAGE)
  }
  return context as FormContext<Schema>
}
