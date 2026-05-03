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
    return <div>Invalid locale</div>;
  }
  
  return (
    <div className="flex min-h-dvh min-h-screen flex-col bg-docs-bg text-docs-body">
      <Header locale={locale} />
      <main className="flex min-h-0 flex-1 flex-col" lang={locale === 'zh' ? 'zh-CN' : 'en'}>
        {children}
      </main>
      <Footer locale={locale} variant="docs" />
    </div>
  );
}
