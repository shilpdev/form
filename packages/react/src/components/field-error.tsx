import { FIELD_CONTEXT_OUTSIDE_FIELD_MESSAGE } from '@shared/constants/messages'
import { useFieldContext } from '../context/field-context'
import { useFormContext } from '../context/form-context'
import type { FormFieldErrorProps } from '../types'
import { Slot } from './slot'

export const FormFieldError = ({ name, children }: FormFieldErrorProps) => {
  const context = useFormContext()
  const fieldScope = useFieldContext()

  let error: string | null | undefined
  if (name) {
    error = context.fieldErrors[name]
  } else if (fieldScope) {
    error = fieldScope.error
  } else {
    throw new Error(FIELD_CONTEXT_OUTSIDE_FIELD_MESSAGE)
  }

  if (!error) {
    return null
  }

  return (
    <Slot
      className="shilp-form__field-error"
      scope={{ context, error }}
      children={children}
      fallback={() => {
        return error
      }}
    />
  )
}
