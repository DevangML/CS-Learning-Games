export const metadata = {
  title: 'SQL Mastery Quest',
  description: 'Interactive SQL learning platform with gamification',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}