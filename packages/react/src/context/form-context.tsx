import { createContext, useContext, type ReactNode } from 'react'
import type { FormContext, FormOptions } from '@shared'
import { CONTEXT_OUTSIDE_FORM_MESSAGE } from '@shared/messages'
import type { FormProviderProps } from '../types'

const FormContextValue = createContext<FormContext<unknown> | null>(null)
const FormOptionsValue = createContext<Partial<FormOptions<unknown>> | null>(null)

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

/** Sets the options once for every `Form` below it (the Vue plugin's `app.use(ShilpForm, options)`). */
export function FormProvider<Schema = unknown>({
  children,
  ...options
}: FormProviderProps<Schema>) {
  return (
    <FormOptionsValue.Provider value={options as Partial<FormOptions<unknown>>}>
      {children}
    </FormOptionsValue.Provider>
  )
}

/** The options of the nearest `FormProvider`, or `null` without one (the defaults apply). */
export function useFormOptions<Schema>(): Partial<FormOptions<Schema>> | null {
  return useContext(FormOptionsValue) as Partial<FormOptions<Schema>> | null
}
