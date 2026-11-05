import type { FormPartProps } from '../types'
import { ActionButton } from './action-button'

/** Calls `archiveItem`. Gets `{ context }`. */
export const FormArchive = ({ children }: FormPartProps) => {
  return <ActionButton action="archive" children={children} />
}
