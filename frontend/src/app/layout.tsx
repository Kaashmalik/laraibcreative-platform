import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        backgroundColor: '#fafafa',
        color: '#333'
      }}>
        {children}
      </body>
    </html>
  );
}