import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Locale, locales } from '@/lib/i18n';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as Locale;
  
  // Validate locale
  if (!locales.includes(locale)) {
    // This shouldn't happen due to middleware, but just in case
    return <div>Invalid locale</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow" lang={locale === 'zh' ? 'zh-CN' : 'en'}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
