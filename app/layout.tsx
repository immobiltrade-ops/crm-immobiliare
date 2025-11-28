import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CRM Immobiliare Pro',
  description: 'Sistema gestionale completo per agenzie immobiliari italiane',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
