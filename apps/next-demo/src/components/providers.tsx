'use client'

import { FormProvider } from '@shilp.dev/react-form'
import type { ReactNode } from 'react'
import { formOptions } from '@/lib/form-options'

/** Client boundary for the app-wide form options. */
export function Providers({ children }: { children: ReactNode }) {
  return <FormProvider {...formOptions}>{children}</FormProvider>
}
