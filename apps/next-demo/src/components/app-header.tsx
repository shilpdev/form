'use client'

/*
 * Copy of the Nuxt demo header (Nuxt UI `UHeader`): title on the left, navigation in the middle,
 * color mode, GitHub and npm buttons on the right. Below `lg` the navigation moves into a
 * full-screen menu opened by the menu button, as in Nuxt UI. Class names match Nuxt UI's.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toggleColorMode } from './color-mode'
import { Icon } from './icon'

const TITLE = 'Shilp Form - React Demo'
const NAV_ITEMS = [{ label: 'Users', href: '/' }]
const GITHUB_URL = 'https://github.com/shilpdev/form'
const NPM_URL = 'https://www.npmjs.com/package/@shilp.dev/react-form'

const BUTTON_CLASS =
  'inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-default transition-colors hover:bg-elevated active:bg-elevated focus-visible:outline-3 outline-inverted/25'
const ICON_BUTTON_CLASS = `${BUTTON_CLASS} p-1.5`
const LABEL_BUTTON_CLASS = `${BUTTON_CLASS} px-2.5 py-1.5`

function NavigationMenu() {
  const pathname = usePathname()

  return (
    <nav className="relative flex items-center justify-between gap-1.5">
      <ul className="isolate flex min-w-0 items-center">
        {NAV_ITEMS.map(({ label, href }) => {
          let stateClass =
            'text-muted transition-colors before:transition-colors hover:text-highlighted hover:before:bg-elevated/50'
          if (pathname === href) {
            stateClass = 'text-primary before:bg-elevated'
          }
          return (
            <li key={href} className="min-w-0 py-2">
              <Link
                href={href}
                className={`group relative flex w-full items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium before:absolute before:inset-x-px before:inset-y-0 before:z-[-1] before:rounded-md focus:outline-none ${stateClass}`}
              >
                <span className="truncate">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function HeaderRow({
  isMenuOpen,
  onToggleMenu,
}: {
  isMenuOpen: boolean
  onToggleMenu: () => void
}) {
  return (
    <>
      <div className="flex items-center gap-1.5 lg:flex-1">
        <Link
          href="/"
          className="flex shrink-0 items-end gap-1.5 rounded-md text-xl font-bold text-highlighted focus-visible:outline-3 outline-primary/25"
        >
          {TITLE}
        </Link>
      </div>

      {!isMenuOpen && (
        <div className="hidden lg:flex">
          <NavigationMenu />
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5 lg:flex-1">
        <button
          type="button"
          className={ICON_BUTTON_CLASS}
          aria-label="Switch color mode"
          onClick={toggleColorMode}
        >
          <Icon name="sun" className="dark:hidden" />
          <Icon name="moon" className="hidden dark:block" />
        </button>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={LABEL_BUTTON_CLASS}
        >
          <Icon name="github" />
          <span className="truncate">GitHub</span>
        </a>
        <a
          href={NPM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="npm"
          className={ICON_BUTTON_CLASS}
        >
          <Icon name="npm" />
        </a>
        <button
          type="button"
          className={`${ICON_BUTTON_CLASS} lg:hidden`}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={onToggleMenu}
        >
          <Icon name={isMenuOpen ? 'x' : 'menu'} />
        </button>
      </div>
    </>
  )
}

export function AppHeader() {
  const pathname = usePathname()
  // The path the menu was opened on: navigating somewhere else closes it, like Nuxt UI.
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const isMenuOpen = menuPath === pathname

  const toggleMenu = () => {
    if (isMenuOpen) {
      setMenuPath(null)
    } else {
      setMenuPath(pathname)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 h-16 border-b border-default bg-default/75 backdrop-blur-sm">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <HeaderRow isMenuOpen={false} onToggleMenu={toggleMenu} />
        </div>
      </header>

      {isMenuOpen && (
        <div
          role="dialog"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col divide-y divide-default bg-default lg:hidden"
        >
          <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-4 sm:px-6">
            <HeaderRow isMenuOpen onToggleMenu={toggleMenu} />
          </div>
          <div className="overflow-y-auto p-4 sm:p-6" />
        </div>
      )}
    </>
  )
}
