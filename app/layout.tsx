import '../styles/globals.css'
import React from 'react'

export const metadata = {
  title: 'Lynis Analyzer',
  description: 'Analyze Lynis reports with AI assistance'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 font-sans min-h-screen p-4 md:p-8">
        {children}
      </body>
    </html>
  )
}
