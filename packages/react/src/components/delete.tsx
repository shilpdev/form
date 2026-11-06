import type { FormPartProps } from '../types'
import { ActionButton } from './action-button'

export const FormDelete = ({ children }: FormPartProps) => {
  return <ActionButton action="delete" children={children} />
}
