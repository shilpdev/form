import type {
  FieldScope,
  FormContext,
  FormFieldPropsBase,
  FormOptions,
  FormPropsBase,
  FormScope,
} from '@shared'
import type { ChangeEvent, ReactNode, Ref } from 'react'

type Children<Scope> = ReactNode | ((scope: Scope) => ReactNode)

export interface FormProps<Schema = unknown> extends FormPropsBase<Schema> {
  children?: Children<FormScope<Schema>>
  /** React 19 ref-as-prop; exposes the form context as an imperative API. */
  ref?: Ref<FormContext<Schema>>
}

/** App-wide options. Each one can still be overridden by the same prop on a `Form`. */
export interface FormProviderProps<Schema = unknown> extends Partial<FormOptions<Schema>> {
  children?: ReactNode
}

/** Spread on a native input: `<input {...inputProps} />`. */
export interface InputProps {
  name: string
  value: string | number | readonly string[]
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
}

/** `FieldScope` plus the React-only `inputProps`. */
export interface ReactFieldScope<Schema = unknown> extends FieldScope<Schema> {
  inputProps: InputProps
}

export interface FormFieldProps extends FormFieldPropsBase {
  children?: Children<ReactFieldScope>
}

export interface FormFieldErrorProps extends FormFieldPropsBase {
  children?: Children<FormFieldErrorScope>
}

export interface FormFieldErrorScope extends FormScope {
  error: string
}

/** Props of `FormFields`, `FormError` and every action button. */
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
