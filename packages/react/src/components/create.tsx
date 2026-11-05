import type { FormPartProps } from '../types'
import { ActionButton } from './action-button'

/** Calls `createItem`. Gets `{ context }`. */
export const FormCreate = ({ children }: FormPartProps) => {
  return <ActionButton action="create" children={children} />
}
