'use client'

import { Form, type FormProps } from '@shilp.dev/react-form'
import type { ZodObject } from 'zod'
import { formOptions } from '@/lib/form-options'

/** The app's `Form`: Zod options set once here, any of them can still be overridden by a prop. */
export function AppForm(props: FormProps<ZodObject>) {
  return <Form {...formOptions} {...props} />
}
