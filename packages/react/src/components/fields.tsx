import { CLASS_PREFIX } from '@shared/constants'
import { useFormContext } from '../context/form-context'
import type { FormPartProps } from '../types'
import { FormField } from './field'
import { Slot } from './slot'

/** Wraps the fields. Without children it renders a `FormField` for every field. Gets `{ context }`. */
export const FormFields = ({ children }: FormPartProps) => {
  const context = useFormContext()

  return (
    <Slot
      className={`${CLASS_PREFIX}__fields`}
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
