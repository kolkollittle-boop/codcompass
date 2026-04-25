'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const faqs = [
  {
    question: '如何注册 Codcompass 账户？',
    answer: '点击右上角 "Sign in" 按钮，然后选择 "Get Started" 创建免费账户。填写邮箱和密码即可完成注册。',
  },
  {
    question: '有哪些订阅计划？',
    answer: '我们提供 4 个计划：Free（免费）、Builder（$9.99/月）、Pro（$29.99/月）和 Enterprise（定制定价）。详见定价页面。',
  },
  {
    question: '如何取消订阅？',
    answer: '登录账户后，进入账户设置 → 订阅管理 → 取消订阅。取消后，您将在当前计费周期结束前继续访问付费内容。',
  },
  {
    question: '退款政策是什么？',
    answer: '我们提供 30 天无理由退款保证。如果您在订阅后 30 天内不满意，可以申请全额退款。',
  },
  {
    question: '内容更新频率？',
    answer: '我们每周更新技术文章，涵盖 React、TypeScript、Next.js、AI/ML 和 DevOps 等领域。',
  },
  {
    question: '可以在多个设备上使用吗？',
    answer: '可以！一个账户可以在最多 3 台设备上同时使用。',
  },
  {
    question: '如何联系支持团队？',
    answer: '通过 /contact 页面提交联系表单，或发送邮件至 support@codcompass.com。我们承诺在 24 小时内回复。',
  },
  {
    question: '是否支持 Google 登录？',
    answer: 'Google OAuth 登录功能即将推出，敬请期待。目前支持邮箱注册。',
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                帮助中心
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                常见问题解答和使用指南
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link href="/contact" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-bold text-gray-900 mb-2">联系我们</h3>
              <p className="text-sm text-gray-600">有问题？发送邮件或填写联系表单</p>
            </Link>
            <Link href="/pricing" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-gray-900 mb-2">定价方案</h3>
              <p className="text-sm text-gray-600">查看我们的订阅计划和功能</p>
            </Link>
            <Link href="/kb" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold text-gray-900 mb-2">知识库</h3>
              <p className="text-sm text-gray-600">浏览所有技术教程和文章</p>
            </Link>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">常见问题</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
