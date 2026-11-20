import { getErrorMessage } from '@shared/constants/messages'
import { useFormContext } from '../context/form-context'
import type { FormPartProps } from '../types'
import { Slot } from './slot'

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
