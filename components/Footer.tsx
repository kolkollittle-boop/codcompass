import Link from 'next/link';

interface FooterProps {
  locale?: string;
}

const excludedPaths = [
  '/blog', '/pricing', '/about', '/contact', '/help',
  '/login', '/dashboard', '/admin', '/checkout',
  '/status', '/privacy', '/terms', '/refund',
];

const linkWithLocale = (locale: string, path: string) => {
  if (excludedPaths.some(ep => path.startsWith(ep))) return path;
  if (path.startsWith('/api/') || path.startsWith('/auth/')) return path;
  return `/${locale}${path}`;
};

export default function Footer({ locale = 'en' }: FooterProps) {
  const t = locale === 'zh' ? {
    description: '面向开发者和专业人士的优质知识库。',
    product: '产品',
    kb: '知识库',
    blog: '博客',
    pricing: '定价',
    checkout: '结账',
    help: '帮助中心',
    company: '公司',
    about: '关于',
    contact: '联系我们',
    status: '状态',
    legal: '法律',
    privacy: '隐私政策',
    terms: '服务条款',
    rights: '保留所有权利。',
  } : {
    description: 'Premium knowledge base for developers and professionals.',
    product: 'Product',
    kb: 'Knowledge Base',
    blog: 'Blog',
    pricing: 'Pricing',
    checkout: 'Checkout',
    help: 'Help Center',
    company: 'Company',
    about: 'About',
    contact: 'Contact',
    status: 'Status',
    legal: 'Legal',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    rights: 'All rights reserved.',
  };

  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Codcompass</h3>
            <p className="mt-4 text-base text-gray-500">
              {t.description}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t.product}</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href={linkWithLocale(locale, '/kb') as any} className="text-base text-gray-500 hover:text-gray-900">
                  {t.kb}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/blog') as any} className="text-base text-gray-500 hover:text-gray-900">
                  {t.blog}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/pricing') as any} className="text-base text-gray-500 hover:text-gray-900">
                  {t.pricing}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/checkout') as any} className="text-base text-gray-500 hover:text-gray-900">
                  {t.checkout}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/help') as any} className="text-base text-gray-500 hover:text-gray-900">
                  {t.help}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t.company}</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href={linkWithLocale(locale, '/about') as any} className="text-base text-gray-500 hover:text-gray-900">
                  {t.about}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/contact') as any} className="text-base text-gray-500 hover:text-gray-900">
                  {t.contact}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/status') as any} className="text-base text-gray-500 hover:text-gray-900">
                  {t.status}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t.legal}</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href={linkWithLocale(locale, '/privacy') as any} className="text-base text-gray-500 hover:text-gray-900">
                  {t.privacy}
                </Link>
              </li>
              <li>
                <Link href={linkWithLocale(locale, '/terms') as any} className="text-base text-gray-500 hover:text-gray-900">
                  {t.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {/* Social media icons would go here */}
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} Codcompass. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
