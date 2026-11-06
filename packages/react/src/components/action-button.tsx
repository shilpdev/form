import type { FormAction, FormContext } from '@shared'
import { getActionLabel, isActionVisible } from '@shared/utils'
import { useFormContext } from '../context/form-context'
import type { FormPartProps } from '../types'
import { Slot } from './slot'

const ACTION_METHODS: Record<FormAction, keyof FormContext> = {
  create: 'createItem',
  update: 'updateItem',
  delete: 'deleteItem',
}

/** Shared by the three action buttons: they differ only in the action name. */
export function ActionButton({ action, children }: FormPartProps & { action: FormAction }) {
  const context = useFormContext()

  if (!isActionVisible(action, context)) {
    return null
  }

  const onClick = context[ACTION_METHODS[action]] as () => Promise<void>

  return (
    <Slot
      className={`shilp-form__${action}`}
      scope={{ context }}
      children={children}
      fallback={() => {
        return (
          <button type="button" onClick={onClick} disabled={context.isLoading}>
            {getActionLabel(action, context)}
          </button>
        )
      }}
    />
  )
}
