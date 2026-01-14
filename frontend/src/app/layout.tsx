import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'LaraibCreative - Custom Ladies Suits & Designer Wear',
  description: 'Premium custom stitched ladies suits and designer wear in Pakistan',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <CartProvider>
            {children}
            <Toaster position="top-right" />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}