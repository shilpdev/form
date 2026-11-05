import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AppHeader } from '@/components/app-header'
import { COLOR_MODE_SCRIPT } from '@/components/color-mode'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shilp Form',
  description: 'Manual testing playground for @shilp.dev/react-form',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // The color mode script sets the `dark` class before React hydrates.
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: COLOR_MODE_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* App Router root layout: the pages-router rule below does not apply. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400..700&family=Google+Sans+Code:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-default text-default">
        <AppHeader />
        <main className="min-h-[calc(100vh-4rem)]">
          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <Providers>{children}</Providers>
          </div>
        </main>
      </body>
    </html>
  )
}
