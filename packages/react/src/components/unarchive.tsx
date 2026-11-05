import type { FormPartProps } from '../types'
import { ActionButton } from './action-button'

/** Calls `unarchiveItem`. Gets `{ context }`. */
export const FormUnarchive = ({ children }: FormPartProps) => {
  return <ActionButton action="unarchive" children={children} />
}
