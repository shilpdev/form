import { DELETE_MESSAGE, DELETING_MESSAGE, LOADING_MESSAGE } from '@shared/messages'
import { useFormContext } from '../context/form-context'
import type { FormActionProps } from '../types'
import { Slot } from './slot'

export const FormDelete = ({ children }: FormActionProps) => {
  const context = useFormContext()

  const run = () => {
    return context.runOperation('delete')
  }

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
      scope={{ context, run }}
      children={children}
      fallback={() => {
        return (
          <button type="button" onClick={run} disabled={context.isLoading}>
            {label}
          </button>
        )
      }}
    />
  )
}
