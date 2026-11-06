import { getErrorMessage } from '@shared/messages'
import { useFormContext } from '../context/form-context'
import type { FormPartProps } from '../types'
import { Slot } from './slot'

/** The error of the last action, shown only when there is one. Gets `{ context }`. */
export const FormError = ({ children }: FormPartProps) => {
  const context = useFormContext()
  const { error } = context

  if (!error) {
    return null
  }

  return (
    <Slot
      className="shilp-form__error"
      scope={{ context }}
      children={children}
      fallback={() => {
        return <pre>{getErrorMessage(error)}</pre>
      }}
    />
  )
}
