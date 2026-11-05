import type { ReactNode } from 'react'
import type { SlotProps } from '../types'

/**
 * Resolves the "render-prop function / static children / default UI" choice that every form part
 * shares, and wraps the result in its BEM container.
 *
 * - `children` is a function  -> called with `scope`
 * - `children` is nodes       -> rendered as-is
 * - `children` is absent      -> `fallback(scope)`
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
