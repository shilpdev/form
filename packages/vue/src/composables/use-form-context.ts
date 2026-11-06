import { inject } from 'vue'
import type { FormContext } from '@shared'
import { CONTEXT_OUTSIDE_FORM_MESSAGE } from '@shared/messages'

export function useFormContext<Schema = unknown>(): FormContext<Schema> {
  const context = inject<FormContext | undefined>('shilp-form-context', undefined)

  if (!context) {
    throw new Error(CONTEXT_OUTSIDE_FORM_MESSAGE)
  }

  return context as FormContext<Schema>
}
