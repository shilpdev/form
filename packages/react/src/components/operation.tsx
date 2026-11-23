import { useFormContext } from '../context/form-context'
import type { FormOperationProps } from '../types'
import { Slot } from './slot'

export const FormOperation = ({ operation, children }: FormOperationProps) => {
  const context = useFormContext()

  const run = () => {
    return context.runOperation(operation)
  }

  return (
    <Slot
      className="shilp-form__operation"
      scope={{ context, run }}
      children={children}
      fallback={() => {
        return (
          <button type="button" onClick={run} disabled={context.isLoading}>
            {operation}
          </button>
        )
      }}
    />
  )
}
