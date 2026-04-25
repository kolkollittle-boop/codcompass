import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">服务条款</h1>
          <p className="text-gray-500 mb-8">最后更新：2026 年 4 月 25 日</p>

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed">
            <p>
              欢迎使用 Codcompass（"平台"、"我们"、"我们的"）。本服务条款（"条款"） governs 您对 codcompass.com 网站及相关服务的访问和使用。
            </p>

            <h2>1. 接受条款</h2>
            <p>
              通过访问或使用 Codcompass，您同意受本条款约束。如果您不同意任何条款，请勿使用我们的服务。
            </p>

            <h2>2. 服务描述</h2>
            <p>
              Codcompass 提供技术教程、代码示例和专家洞察的订阅访问服务。我们提供免费和付费订阅计划。
            </p>

            <h2>3. 账户注册</h2>
            <ul>
              <li>您必须提供准确、完整的注册信息</li>
              <li>您有责任维护账户安全</li>
              <li>您必须年满 13 岁才能创建账户</li>
              <li>一个自然人只能创建一个账户</li>
            </ul>

            <h2>4. 订阅和付款</h2>
            <h3>4.1 订阅计划</h3>
            <p>我们提供以下订阅计划（详见 /pricing 页面）：</p>
            <ul>
              <li><strong>Free：</strong>免费，有限访问</li>
              <li><strong>Builder：</strong>$9.99/月 或 $79.99/年</li>
              <li><strong>Pro：</strong>$29.99/月 或 $249.99/年</li>
              <li><strong>Enterprise：</strong>定制定价</li>
            </ul>

            <h3>4.2 付款处理</h3>
            <p>
              所有付款通过 Lemon Squeezy 处理。您同意遵守 Lemon Squeezy 的付款条款。
            </p>

            <h3>4.3 退款政策</h3>
            <p>
              我们提供 30 天无理由退款保证。如果您在订阅后 30 天内不满意，可以申请全额退款。
            </p>

            <h3>4.4 取消订阅</h3>
            <p>
              您可以随时取消订阅。取消后，您将在当前计费周期结束前继续访问付费内容。
            </p>

            <h2>5. 知识产权</h2>
            <h3>5.1 我们的内容</h3>
            <p>
              Codcompass 上的所有内容（文章、代码示例、图像、商标）受版权、商标和其他知识产权法保护。未经我们明确许可，您不得复制、分发或创建衍生作品。
            </p>

            <h3>5.2 用户生成内容</h3>
            <p>
              如果您通过反馈、评论或贡献向我们提供内容，您授予我们非排他性、全球性、免版税的使用许可。
            </p>

            <h2>6. 用户行为</h2>
            <p>您同意不会：</p>
            <ul>
              <li>违反任何适用法律或法规</li>
              <li>侵犯他人的知识产权</li>
              <li>传播恶意软件或有害代码</li>
              <li>尝试破解、反向工程或绕过安全措施</li>
              <li>自动化抓取或爬取内容（除非明确允许）</li>
              <li>共享账户或订阅凭证</li>
              <li>将内容用于商业再分发</li>
            </ul>

            <h2>7. 免责声明</h2>
            <p>
              <strong>服务按"原样"提供，不提供任何明示或暗示的保证。</strong>我们不保证服务不会中断、及时、安全或无错误。
            </p>

            <h2>8. 责任限制</h2>
            <p>
              在任何情况下，Codcompass 及其团队不对任何间接、偶然、特殊、后果性或惩罚性损害承担责任，包括但不限于利润损失、数据损失或业务中断。
            </p>

            <h2>9.  indemnification</h2>
            <p>
              您同意赔偿并使 Codcompass 免受因您使用服务、违反本条款或侵犯任何第三方权利而引起的任何索赔、损害或费用。
            </p>

            <h2>10. 终止</h2>
            <p>
              我们可以出于任何原因（包括违反本条款）随时终止或暂停您的账户和访问权限。终止后，您使用服务的权利将立即停止。
            </p>

            <h2>11. 条款变更</h2>
            <p>
              我们可能会不时更新本条款。重大变更将通过邮箱或网站通知通知您。继续使用服务即表示接受更新后的条款。
            </p>

            <h2>12. 适用法律</h2>
            <p>
              本条款受美国法律管辖，不考虑其法律冲突规定。任何争议将在美国法院解决。
            </p>

            <h2>13. 联系我们</h2>
            <p>
              对本条款有任何疑问，请通过 <a href="mailto:legal@codcompass.com">legal@codcompass.com</a> 联系我们。
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
