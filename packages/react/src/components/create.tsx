import { CREATE_MESSAGE, CREATING_MESSAGE } from '@shared/constants/messages'
import { useFormContext } from '../context/form-context'
import type { FormActionProps } from '../types'
import { Slot } from './slot'

export const FormCreate = ({ children }: FormActionProps) => {
  const context = useFormContext()

  const run = () => {
    return context.runOperation('create')
  }

  if (!context.isCreateMode) {
    return null
  }

  let label = CREATE_MESSAGE
  if (context.isCreating) {
    label = CREATING_MESSAGE
  }

  return (
    <Slot
      className="shilp-form__create"
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
