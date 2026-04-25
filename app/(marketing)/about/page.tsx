import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                关于 Codcompass
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                为开发者提供高质量技术教程和专家洞察的知识库平台
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">我们的使命</h2>
              <p className="text-lg text-gray-600 mb-4">
                在信息爆炸的时代，开发者面临着海量但质量参差不齐的技术内容。Codcompass 致力于：
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>📚 精选高质量技术内容，拒绝信息噪音</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>💻 提供生产级代码示例，来自真实项目</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>🔄 每周更新最新框架、工具和最佳实践</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-indigo-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>🎯 专注 React、TypeScript、Next.js 等现代技术栈</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🧭</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Codcompass</h3>
                <p className="text-gray-600">Code + Compass = 开发者罗盘</p>
                <p className="text-gray-500 mt-2">为你的技术成长导航</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
                <div className="text-gray-600">技术文章</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">12</div>
                <div className="text-gray-600">技术主题</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">4.8</div>
                <div className="text-gray-600">平均评分</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">每周</div>
                <div className="text-gray-600">持续更新</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心团队</h2>
            <p className="text-lg text-gray-600">由开发者为开发者打造</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                👨‍💻
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">技术编辑</h3>
              <p className="text-gray-600">10 年前端开发经验，专注 React/TypeScript 生态</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                📝
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">内容策划</h3>
              <p className="text-gray-600">技术写作专家，擅长将复杂概念简化为易懂教程</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                🤖
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI 助手</h3>
              <p className="text-gray-600">贾维斯 (Jarvis) - 自动化内容采集和质量审核</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              准备好提升你的技术技能了吗？
            </h2>
            <p className="text-indigo-100 text-lg mb-8">
              加入 Codcompass，获取高质量技术教程和专家洞察
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-white text-indigo-600 font-medium px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              查看定价方案
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
