import { CLASS_PREFIX } from '@shared/constants'
import { useFormContext } from '../context/form-context'
import type { FormFieldErrorProps } from '../types'
import { Slot } from './slot'

/** The error message of one field, shown only when there is one. Gets `{ context, error }`. */
export const FormFieldError = ({ name, children }: FormFieldErrorProps) => {
  const context = useFormContext()
  const error = context.fieldErrors[name]

  if (!error) {
    return null
  }

  return (
    <Slot
      className={`${CLASS_PREFIX}__field-error`}
      scope={{ context, error }}
      children={children}
      fallback={() => {
        return error
      }}
    />
  )
}
