'use client'

import { Form, type FormProps } from '@shilp.dev/react-form'
import { formOptions } from '@/lib/form-options'

/** The app's `Form`: Zod options set once here, any of them can still be overridden by a prop. */
export function AppForm(props: FormProps) {
  return <Form {...formOptions} {...props} />
}
