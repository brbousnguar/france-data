import '../../styles/globals.css'
import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Nantes Public Data Dashboard',
  description: 'France Public Data Lab — dashboards for Nantes'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="w-full flex-1 py-8 px-4">
            <div className="container container-max mx-auto">{children}</div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
