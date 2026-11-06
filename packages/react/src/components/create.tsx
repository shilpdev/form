import type { FormPartProps } from '../types'
import { ActionButton } from './action-button'

export const FormCreate = ({ children }: FormPartProps) => {
  return <ActionButton action="create" children={children} />
}
