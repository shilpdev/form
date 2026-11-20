import type { Field } from '@shared'
import { getFieldNotFoundMessage } from '@shared/constants/messages'
import { getInputValue } from '@shared/utils'
import { FieldContextProvider } from '../context/field-context'
import { useFormContext } from '../context/form-context'
import type { FormFieldProps, ReactFieldScope } from '../types'
import { Slot } from './slot'

export const FormField = ({ name, children }: FormFieldProps) => {
  const context = useFormContext()

  const updateValue = (input: unknown) => {
    context.setFieldValue(name, getInputValue(input))
  }

  const getField = () => {
    const field = context.fields.find((item) => {
      return item.name === name
    })
    if (!field) {
      console.warn(getFieldNotFoundMessage(name))
      return null
    }
    return field
  }

  const getScope = (field: Field): ReactFieldScope => {
    const value = context.values[name]
    let inputValue: string | number | readonly string[] = ''
    if (typeof value === 'string' || typeof value === 'number' || Array.isArray(value)) {
      inputValue = value
    }
    return {
      context,
      field,
      name,
      label: field.label,
      value,
      error: context.fieldErrors[name] ?? null,
      updateValue,
      inputProps: { name, value: inputValue, onChange: updateValue },
    }
  }

  const field = getField()
  if (!field) {
    return null
  }
  const scope = getScope(field)

  return (
    <FieldContextProvider value={scope}>
      <Slot
        className="shilp-form__field"
        scope={scope}
        children={children}
        fallback={() => {
          return (
            <label>
              <span>{scope.label}</span>
              <input {...scope.inputProps} />
              {scope.error && <span className="shilp-form__field-error">{scope.error}</span>}
            </label>
          )
        }}
      />
    </FieldContextProvider>
  )
}
