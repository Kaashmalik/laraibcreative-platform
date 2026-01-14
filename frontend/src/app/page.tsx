import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import WhatsAppButton from '@/components/customer/WhatsAppButton';
import HomePageClient from './(customer)/HomePageClient';

export const dynamic = 'force-dynamic';

/**
 * Root Homepage - Server Component
 * This serves the main / route with Header and Footer
 */
export default function RootHomePage() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1" role="main">
        <HomePageClient
          featuredProducts={[]}
          categories={[]}
        />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
