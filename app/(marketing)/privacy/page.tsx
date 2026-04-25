import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">隐私政策</h1>
          <p className="text-gray-500 mb-8">最后更新：2026 年 4 月 25 日</p>

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed">
            <p>
              Codcompass（"我们"、"我们的"或"平台"）致力于保护您的隐私。本隐私政策说明我们如何收集、使用、存储和分享您的个人信息。
            </p>

            <h2>1. 我们收集的信息</h2>
            <h3>1.1 您直接提供的信息</h3>
            <ul>
              <li>账户信息：姓名、邮箱地址</li>
              <li>订阅信息：支付方式、账单地址</li>
              <li>联系信息：通过联系表单提交的消息</li>
            </ul>

            <h3>1.2 自动收集的信息</h3>
            <ul>
              <li>使用数据：页面访问、文章阅读时间、点击行为</li>
              <li>设备信息：浏览器类型、操作系统、IP 地址</li>
              <li>Cookies：用于身份验证、偏好设置和分析</li>
            </ul>

            <h2>2. 我们如何使用信息</h2>
            <ul>
              <li>提供和维护 Codcompass 服务</li>
              <li>处理您的订阅和付款</li>
              <li>发送服务通知和更新</li>
              <li>改善用户体验和内容质量</li>
              <li>防止欺诈和滥用</li>
            </ul>

            <h2>3. 信息分享</h2>
            <p>我们不会出售您的个人信息。仅在以下情况下分享：</p>
            <ul>
              <li><strong>服务提供商：</strong>与支付处理商（Lemon Squeezy）、云服务商（Vercel、Supabase）共享必要信息</li>
              <li><strong>法律要求：</strong>遵守法律义务或保护我们的权利</li>
              <li><strong>业务转移：</strong>在公司合并、收购时转移</li>
            </ul>

            <h2>4. 数据存储和安全</h2>
            <p>
              我们采用行业标准的安全措施保护您的数据，包括加密传输、访问控制和定期安全审计。数据存储在美国和欧盟的数据中心。
            </p>

            <h2>5. 您的权利</h2>
            <ul>
              <li><strong>访问：</strong>请求获取我们持有的您的个人信息副本</li>
              <li><strong>更正：</strong>要求更正不准确的个人信息</li>
              <li><strong>删除：</strong>要求删除您的个人信息（"被遗忘权"）</li>
              <li><strong>携带：</strong>以机器可读格式获取您的数据</li>
              <li><strong>反对：</strong>反对基于合法利益的处理</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              我们使用必要的 Cookies 进行身份验证和偏好设置。分析 Cookies（Google Analytics）帮助我们改善服务。您可以通过浏览器设置管理 Cookies。
            </p>

            <h2>7. GDPR 合规（欧盟用户）</h2>
            <p>
              作为欧盟用户，您享有 GDPR 赋予的权利。我们的数据处理基于：合同履行、合法利益、您的同意或法律义务。
            </p>

            <h2>8. CCPA 合规（加州用户）</h2>
            <p>
              作为加州居民，您有权知道我们收集的个人信息类别、来源、使用目的，以及拒绝出售的权利（我们不出售个人信息）。
            </p>

            <h2>9. 儿童隐私</h2>
            <p>
              Codcompass 不面向 13 岁以下儿童。如果我们发现无意中收集了儿童的个人信息，将立即删除。
            </p>

            <h2>10. 政策更新</h2>
            <p>
              我们可能会不时更新本隐私政策。重大变更将通过邮箱或网站通知通知您。
            </p>

            <h2>11. 联系我们</h2>
            <p>
              对本隐私政策有任何疑问，请通过 <a href="mailto:privacy@codcompass.com">privacy@codcompass.com</a> 联系我们。
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
