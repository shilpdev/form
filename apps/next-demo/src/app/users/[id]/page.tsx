'use client'

import {
  FormCreate,
  FormDelete,
  FormError,
  FormField,
  FormFields,
  FormUpdate,
  type OperationConfig,
  type OperationError,
  type OperationResponse,
} from '@shilp.dev/react-form'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AppForm } from '@/components/app-form'
import { UserField } from './components/user-field'
import { createUser, deleteUser, readUser, updateUser } from '@/lib/users-api'
import { ROLES, userSchema } from '@/lib/user-schema'

const INPUT_CLASS = 'w-full rounded-md border border-accented bg-default px-3 py-2 text-highlighted'


function onError(error: unknown): OperationError {
  const { name, message, errors } = error as {
    name?: string
    message?: string
    errors?: Record<string, string>
  }
  return {
    name: name ?? 'Error',
    message: message ?? 'Something went wrong. Please try again.',
    fieldErrors: errors ?? {},
  }
}

export default function UserPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  // `+` in the URL is the "new user" id, which `modeDetector` in `AppForm` treats as create mode.
  const itemId = decodeURIComponent(params.id)

  const readOperation: OperationConfig = {
    onError,
    handler: async (state): Promise<OperationResponse> => {
      const { id, name, email, role } = await readUser(state.itemId)
      return { values: { name, email, role }, id }
    },
  }

  const createOperation: OperationConfig = {
    schema: userSchema,
    onError,
    onSuccess: (state) => {
      router.push(`/users/${state.response!.id}`)
    },
    handler: async (state): Promise<OperationResponse> => {
      const { id, name, email, role } = await createUser(state.values)
      return { values: { name, email, role }, id }
    },
  }

  const updateOperation: OperationConfig = {
    schema: userSchema,
    onError,
    handler: async (state): Promise<OperationResponse> => {
      const { id, name, email, role } = await updateUser(state.itemId, state.values)
      return { values: { name, email, role }, id }
    },
  }

  const deleteOperation: OperationConfig = {
    onError,
    handler: async (state): Promise<OperationResponse> => {
      await deleteUser(state.itemId)
      router.push('/')
      return {}
    },
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-muted">
        ← All users
      </Link>

      <AppForm
        itemId={itemId}
        read={readOperation}
        create={createOperation}
        update={updateOperation}
        delete={deleteOperation}
      >
        {({ context }) => {
          return (
            <div className="flex flex-col gap-6 rounded-lg border border-default bg-default p-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-highlighted">
                  {context.isCreateMode ? 'New user' : 'Edit user'}
                </h1>
                {context.isReading && <span className="text-sm text-muted">Loading...</span>}
              </div>

              <FormFields>
                <div className="flex flex-col gap-4">
                  <FormField name="name">
                    {({ label, error, inputProps }) => {
                      return (
                        <UserField label={label} error={error}>
                          <input {...inputProps} className={INPUT_CLASS} />
                        </UserField>
                      )
                    }}
                  </FormField>
                  <FormField name="email">
                    {({ label, error, inputProps }) => {
                      return (
                        <UserField label={label} error={error}>
                          <input type="email" {...inputProps} className={INPUT_CLASS} />
                        </UserField>
                      )
                    }}
                  </FormField>
                  <FormField name="role">
                    {({ label, error, inputProps }) => {
                      return (
                        <UserField label={label} error={error}>
                          <select {...inputProps} className={INPUT_CLASS}>
                            <option value="">Select a role</option>
                            {ROLES.map((role) => {
                              return (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              )
                            })}
                          </select>
                        </UserField>
                      )
                    }}
                  </FormField>
                </div>
              </FormFields>

              <FormError>
                {({ context: { error } }) => {
                  return (
                    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                      {error?.message}
                    </p>
                  )
                }}
              </FormError>

              <div className="flex flex-wrap gap-2">
                <FormCreate />
                <FormUpdate />
                <FormDelete />
              </div>

              <pre className="overflow-auto rounded-md bg-elevated p-3 text-xs">
                {JSON.stringify(
                  { dirtyValues: context.dirtyValues, touched: context.touched },
                  null,
                  2,
                )}
              </pre>
            </div>
          )
        }}
      </AppForm>
    </div>
  )
}
