import type { FormAction, FormState } from './types'
import {
  CREATE_MESSAGE,
  CREATING_MESSAGE,
  DELETE_MESSAGE,
  DELETING_MESSAGE,
  UPDATE_MESSAGE,
  UPDATING_MESSAGE,
} from './messages'

type BooleanStateKey = {
  [Key in keyof FormState]-?: FormState[Key] extends boolean ? Key : never
}[keyof FormState]

/** Per button: the state flag set while it runs, and its idle and running text. */
export const ACTION_LABELS: Readonly<
  Record<FormAction, { flag: BooleanStateKey; idle: string; running: string }>
> = Object.freeze({
  create: { flag: 'isCreating', idle: CREATE_MESSAGE, running: CREATING_MESSAGE },
  update: { flag: 'isUpdating', idle: UPDATE_MESSAGE, running: UPDATING_MESSAGE },
  delete: { flag: 'isDeleting', idle: DELETE_MESSAGE, running: DELETING_MESSAGE },
})
