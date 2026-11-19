import { LOADING_MESSAGE, UPDATE_MESSAGE, UPDATING_MESSAGE } from '@shared/messages'
import { useFormContext } from '../context/form-context'
import type { FormPartProps } from '../types'
import { Slot } from './slot'

export const FormUpdate = ({ children }: FormPartProps) => {
  const context = useFormContext()

  if (!context.isUpdateMode) {
    return null
  }

  let label = UPDATE_MESSAGE
  if (context.isUpdating) {
    label = UPDATING_MESSAGE
  } else if (context.isReading) {
    label = LOADING_MESSAGE
  }

  return (
    <Slot
      className="shilp-form__update"
      scope={{ context }}
      children={children}
      fallback={() => {
        return (
          <button type="button" onClick={context.updateItem} disabled={context.isLoading}>
            {label}
          </button>
        )
      }}
    />
  )
}
