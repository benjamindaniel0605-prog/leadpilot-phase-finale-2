import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeadPilot - Plateforme de Génération de Leads B2B',
  description: 'Générez, qualifiez et gérez vos leads B2B avec l\'IA et l\'automatisation des séquences d\'emails.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}


