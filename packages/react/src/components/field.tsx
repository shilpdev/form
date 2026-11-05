import { CLASS_PREFIX } from '@shared/constants'
import { getFieldNotFoundMessage } from '@shared/messages'
import { getInputValue } from '@shared/utils'
import { useFormContext } from '../context/form-context'
import type { FormFieldProps, ReactFieldScope } from '../types'
import { Slot } from './slot'

/** One field of the schema. Gets `{ context, field, name, label, value, error, updateValue, inputProps }`. */
export const FormField = ({ name, children }: FormFieldProps) => {
  const context = useFormContext()
  const field = context.fields.find((item) => {
    return item.name === name
  })

  if (!field) {
    console.warn(getFieldNotFoundMessage(name))
    return null
  }

  const value = context.values[name]
  const updateValue = (input: unknown) => {
    context.setValue(name, getInputValue(input))
  }

  let inputValue: string | number | readonly string[] = ''
  if (typeof value === 'string' || typeof value === 'number' || Array.isArray(value)) {
    inputValue = value
  }

  const scope: ReactFieldScope = {
    context,
    field,
    name,
    label: field.label,
    value,
    error: context.fieldErrors[name] ?? null,
    updateValue,
    inputProps: { name, value: inputValue, onChange: updateValue },
  }

  return (
    <Slot
      className={`${CLASS_PREFIX}__field`}
      scope={scope}
      children={children}
      fallback={() => {
        return (
          <label>
            <span>{scope.label}</span>
            <input {...scope.inputProps} />
            {scope.error && <span className={`${CLASS_PREFIX}__field-error`}>{scope.error}</span>}
          </label>
        )
      }}
    />
  )
}
