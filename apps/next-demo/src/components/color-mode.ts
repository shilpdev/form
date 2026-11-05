/*
 * Same behaviour as Nuxt's color mode: `system` until the user picks one, then `light` or `dark`
 * saved in localStorage. The `dark` class on <html> switches the colors in globals.css.
 */
export const COLOR_MODE_KEY = 'shilp-color-mode'

/** Runs in <head> before the page paints, so a dark page never flashes white. */
export const COLOR_MODE_SCRIPT = `(function(){try{var p=localStorage.getItem('${COLOR_MODE_KEY}')||'system';var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

export function toggleColorMode() {
  const isDark = !document.documentElement.classList.contains('dark')
  document.documentElement.classList.toggle('dark', isDark)
  try {
    localStorage.setItem(COLOR_MODE_KEY, isDark ? 'dark' : 'light')
  } catch {
    // Private mode or blocked storage: the choice lasts until the page reloads.
  }
}
