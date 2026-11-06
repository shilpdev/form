import type { ReactNode } from 'react'
import type { SlotProps } from '../types'

/*
 * Every form part takes a render function, plain nodes or nothing (the default UI), so that choice
 * is made once here.
 */
export function Slot<Scope>({ className, scope, children, fallback }: SlotProps<Scope>) {
  let content: ReactNode

  if (typeof children === 'function') {
    content = children(scope)
  } else if (children != null && children !== false) {
    content = children
  } else {
    content = fallback(scope)
  }

  if (className == null) {
    return <>{content}</>
  }

  return <div className={className}>{content}</div>
}
