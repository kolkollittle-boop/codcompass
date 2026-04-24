import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Codcompass</h3>
            <p className="mt-4 text-base text-gray-500">
              Premium knowledge base for developers and professionals.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/kb" className="text-base text-gray-500 hover:text-gray-900">
                  Knowledge Base
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-base text-gray-500 hover:text-gray-900">
                  Pricing
                </Link>
              </li>
              <li>
                <span className="text-base text-gray-400">Features</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <span className="text-base text-gray-400">About</span>
              </li>
              <li>
                <span className="text-base text-gray-400">Blog</span>
              </li>
              <li>
                <span className="text-base text-gray-400">Contact</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <span className="text-base text-gray-400">Privacy Policy</span>
              </li>
              <li>
                <span className="text-base text-gray-400">Terms of Service</span>
              </li>
              <li>
                <span className="text-base text-gray-400">Cookie Policy</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {/* Social media icons would go here */}
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} Codcompass. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}