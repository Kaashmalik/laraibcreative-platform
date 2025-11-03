import "./globals.css"

export const metadata = {
  title: "Laraib Creative - Custom Tailoring & Fashion",
  description: "Premium custom tailoring services and ready-to-wear fashion",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
