import { LOADING_MESSAGE, UPDATE_MESSAGE, UPDATING_MESSAGE } from '@shared/messages'
import { useFormContext } from '../context/form-context'
import type { FormActionProps } from '../types'
import { Slot } from './slot'

export const FormUpdate = ({ children }: FormActionProps) => {
  const context = useFormContext()

  const run = () => {
    return context.runOperation('update')
  }

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
