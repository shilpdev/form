import type { FormPartProps } from '../types'
import { ActionButton } from './action-button'

/** Calls `deleteItem`. Gets `{ context }`. */
export const FormDelete = ({ children }: FormPartProps) => {
  return <ActionButton action="delete" children={children} />
}
