import type {
  FieldScope,
  FormContext,
  FieldPropsBase,
  FormPropsBase,
  FormScope,
  OperationPropsBase,
  OperationScope,
} from '@shared'
import type { ChangeEvent, ReactNode, Ref } from 'react'

type Children<Scope> = ReactNode | ((scope: Scope) => ReactNode)

export interface FormProps extends FormPropsBase {
  children?: Children<FormScope>
  /** React 19 ref-as-prop; exposes the form context as an imperative API. */
  ref?: Ref<FormContext>
}

export interface InputProps {
  name: string
  value: string | number | readonly string[]
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
}

export interface ReactFieldScope extends FieldScope {
  inputProps: InputProps
}

export interface FormFieldProps extends FieldPropsBase {
  children?: Children<ReactFieldScope>
}

export interface FormFieldErrorProps {
  /** Shows this field's error instead of the surrounding `FormField`'s. */
  name?: string
  children?: Children<FormFieldErrorScope>
}

export interface FormFieldErrorScope extends FormScope {
  error: string
}

export interface FormOperationProps extends OperationPropsBase {
  children?: Children<OperationScope>
}

/** Props of `FormCreate`, `FormUpdate` and `FormDelete`. */
export interface FormActionProps {
  children?: Children<OperationScope>
}

export interface FormPartProps {
  children?: Children<FormScope>
}

export interface SlotProps<Scope> {
  /** Wrapper class. Without it the content renders with no wrapper. */
  className?: string
  scope: Scope
  children?: Children<Scope>
  fallback: (scope: Scope) => ReactNode
}
