import { DELETE_MESSAGE, DELETING_MESSAGE, LOADING_MESSAGE } from '@shared/messages'
import { useFormContext } from '../context/form-context'
import type { FormPartProps } from '../types'
import { Slot } from './slot'

export const FormDelete = ({ children }: FormPartProps) => {
  const context = useFormContext()

  if (!(context.isUpdateMode && !context.isReading)) {
    return null
  }

  let label = DELETE_MESSAGE
  if (context.isDeleting) {
    label = DELETING_MESSAGE
  } else if (context.isReading) {
    label = LOADING_MESSAGE
  }

  return (
    <Slot
      className="shilp-form__delete"
      scope={{ context }}
      children={children}
      fallback={() => {
        return (
          <button type="button" onClick={context.deleteItem} disabled={context.isLoading}>
            {label}
          </button>
        )
      }}
    />
  )
}
