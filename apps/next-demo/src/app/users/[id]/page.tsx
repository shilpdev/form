'use client'

import {
  Form,
  FormArchive,
  FormCreate,
  FormDelete,
  FormError,
  FormField,
  FormFields,
  FormUnarchive,
  FormUpdate,
  type FormState,
} from '@shilp.dev/react-form'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createUser, deleteUser, readUser, setArchived, updateUser } from '@/lib/users-api'
import { ROLES, userSchema } from '@/lib/user-schema'

const INPUT_CLASS = 'w-full rounded-md border border-accented bg-default px-3 py-2 text-highlighted'

export default function UserPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  // `+` in the URL is the "new user" id, which the default `resolveMode` treats as create mode.
  const itemId = decodeURIComponent(params.id)

  const create = async (state: FormState) => {
    const response = await createUser(state.values)
    router.push(`/users/${response.id}`)
    return response
  }

  const remove = async (state: FormState) => {
    const response = await deleteUser(state.itemId)
    router.push('/')
    return response
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-muted">
        ← All users
      </Link>

      <Form
        itemId={itemId}
        schema={userSchema}
        read={(state) => readUser(state.itemId)}
        create={create}
        update={(state) => updateUser(state.itemId, state.values)}
        delete={remove}
        archive={(state) => setArchived(state.itemId, true)}
        unarchive={(state) => setArchived(state.itemId, false)}
      >
        {({ context }) => {
          return (
            <div className="flex flex-col gap-6 rounded-lg border border-default bg-default p-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-highlighted">
                  {context.isCreateMode ? 'New user' : 'Edit user'}
                </h1>
                {context.isArchived && (
                  <span className="rounded bg-elevated px-2 py-0.5 text-xs">Archived</span>
                )}
                {context.isReading && <span className="text-sm text-muted">Loading...</span>}
              </div>

              <FormFields>
                <div className="flex flex-col gap-4">
                  <FormField name="name">
                    {({ label, error, inputProps }) => {
                      return (
                        <label className="flex flex-col gap-1">
                          <span className="text-sm font-medium">{label}</span>
                          <input {...inputProps} className={INPUT_CLASS} />
                          {error && (
                            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                          )}
                        </label>
                      )
                    }}
                  </FormField>
                  <FormField name="email">
                    {({ label, error, inputProps }) => {
                      return (
                        <label className="flex flex-col gap-1">
                          <span className="text-sm font-medium">{label}</span>
                          <input type="email" {...inputProps} className={INPUT_CLASS} />
                          {error && (
                            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                          )}
                        </label>
                      )
                    }}
                  </FormField>
                  <FormField name="role">
                    {({ label, error, inputProps }) => {
                      return (
                        <label className="flex flex-col gap-1">
                          <span className="text-sm font-medium">{label}</span>
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
                          {error && (
                            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                          )}
                        </label>
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
                <FormArchive />
                <FormUnarchive />
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
      </Form>
    </div>
  )
}
