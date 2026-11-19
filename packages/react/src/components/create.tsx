import { CREATE_MESSAGE, CREATING_MESSAGE } from '@shared/messages'
import { useFormContext } from '../context/form-context'
import type { FormPartProps } from '../types'
import { Slot } from './slot'

export const FormCreate = ({ children }: FormPartProps) => {
  const context = useFormContext()

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
      scope={{ context }}
      children={children}
      fallback={() => {
        return (
          <button type="button" onClick={context.createItem} disabled={context.isLoading}>
            {label}
          </button>
        )
      }}
    />
  )
}
