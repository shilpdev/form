import { inject } from 'vue'
import type { FormContext } from '@shared'
import { CONTEXT_KEY } from '@shared/constants'
import { CONTEXT_OUTSIDE_FORM_MESSAGE } from '@shared/messages'

export function useFormContext<Schema = unknown>(): FormContext<Schema> {
  const context = inject<FormContext | undefined>(CONTEXT_KEY, undefined)

  if (!context) {
    throw new Error(CONTEXT_OUTSIDE_FORM_MESSAGE)
  }

  return context as FormContext<Schema>
}
