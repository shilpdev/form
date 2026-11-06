import { useFormContext } from '../context/form-context'
import type { FormFieldErrorProps } from '../types'
import { Slot } from './slot'

export const FormFieldError = ({ name, children }: FormFieldErrorProps) => {
  const context = useFormContext()
  const error = context.fieldErrors[name]

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
