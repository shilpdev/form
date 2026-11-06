import type { FormPartProps } from '../types'
import { ActionButton } from './action-button'

export const FormUpdate = ({ children }: FormPartProps) => {
  return <ActionButton action="update" children={children} />
}
