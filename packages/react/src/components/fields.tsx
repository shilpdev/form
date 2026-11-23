import { useFormContext } from '../context/form-context'
import type { FormPartProps } from '../types'
import { FormField } from './field'
import { Slot } from './slot'

export const FormFields = ({ children }: FormPartProps) => {
  const context = useFormContext()

  return (
    <Slot
      className="shilp-form__fields"
      scope={{ context }}
      children={children}
      fallback={() => {
        return context.fields.map((field) => {
          return <FormField key={field.name} name={field.name} />
        })
      }}
    />
  )
}
