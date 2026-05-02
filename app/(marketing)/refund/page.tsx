import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '退款政策 - Codcompass',
  description: 'Codcompass 订阅退款说明与申请方式。',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-white mb-2">退款政策</h1>
          <p className="text-zinc-500 mb-8">最近更新：2026 年 5 月 2 日</p>

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-indigo-400 prose-li:text-zinc-300">
            <p>
              我们希望你在 Codcompass 的付费体验是清晰、可预期的。本页说明<strong>何时可以退款</strong>、<strong>如何申请</strong>，以及我们为<strong>防止滥用</strong>而设置的合理限制——这些限制仅适用于明显异常的情形，不会影响正常使用下的合理退款请求。
            </p>

            <h2>1. 七天无理由退款（首期付款）</h2>
            <p>
              对<strong>付费订阅的首期付款</strong>，我们提供<strong>自完成付款之日起 7 个自然日内</strong>的全额退款保障。若产品或服务未达到你的合理预期，可在该期限内联系我们申请退款。
            </p>
            <p>
              <strong>说明：</strong>上述「首期」指你在某一订阅档位（Builder / Pro）上的<strong>第一次成功扣款</strong>。若你曾在<strong>同一档位</strong>上完成过「购买 → 已退款」的完整流程，再次购买同一档位时，通常不再适用本条的「首次」保障——这是为了避免反复「试用—退款」对服务与其他用户造成影响。从 Builder 升级到 Pro 时，Pro 档位的首次付款仍可按本条在 7 日内申请退款。
            </p>

            <h2>2. 公平使用与退款次数</h2>
            <p>
              在正常使用前提下，我们会按本政策处理退款。为维持可持续运营，我们对<strong>明显滥用</strong>退款机制的行为保留限制权利，例如：同一账号在同一档位上<strong>多次</strong>「购买后立即退款」、或配合多账号套取内容访问等。
            </p>
            <p>
              对绝大多数用户而言，只要符合第 1 条的时间与档位说明，即<strong>无需担心「只能退一次」</strong>的误读——我们针对的是异常模式，而非正常的试用后决定离开。
            </p>

            <h2>3. 如何申请退款</h2>
            <p>
              请发送邮件至{' '}
              <a href="mailto:support@codcompass.com">support@codcompass.com</a>，建议在主题中注明「退款申请」。为加快处理，请尽量提供：
            </p>
            <ul>
              <li>注册 / 登录所用邮箱</li>
              <li>大致购买日期</li>
              <li>Paddle 付款收据中的订单号或 Transaction ID</li>
              <li>退款原因（选填，有助于我们改进产品）</li>
            </ul>
            <p>
              收到材料后，我们一般在 <strong>3–5 个工作日</strong>内完成审核并回复；通过后，款项将按支付渠道原路退回（具体到账时间取决于发卡行或支付机构，常见为 5–10 个工作日）。
            </p>

            <h2>4. 退款方式</h2>
            <p>
              退款将尽量通过<strong>原支付路径</strong>退回。若因渠道规则无法原路退回，我们会通过邮件与你协商可行方案。
            </p>

            <h2>5. 取消订阅与退款的区别</h2>
            <p>
              <strong>取消订阅</strong>：停止后续扣款；在当前计费周期结束前，你通常仍可继续使用已付费对应的功能（以产品内实际表现为准）。
            </p>
            <p>
              <strong>退款</strong>：在审核通过的前提下，退回相应款项；与退款对应的付费权益将按我们的技术能力尽快终止。两者不会自动等同——若你希望「既不退款又保留整期访问」，请选择<strong>仅取消续费</strong>而非退款。
            </p>

            <h2>6. 我们可能无法支持退款的情形（示例）</h2>
            <p>
              下列情形<strong>通常不符合</strong>退款条件，或需个案评估；我们不会在未沟通的情况下单方拒绝合理请求：
            </p>
            <ul>
              <li>已超过第 1 条所述 7 日时限；</li>
              <li>同一订阅档位在已退款后再次购买，又于短期内再次申请退款（需结合时间、使用记录等综合判断）；</li>
              <li>账号存在违反《服务条款》的行为，或存在明显欺诈、盗刷等风险；</li>
              <li>已获全额退款后，就同一笔交易再次要求退款。</li>
            </ul>
            <p>
              若你认为属于特殊情况，仍欢迎来信说明，我们会在合理范围内尽量给出解决方案。
            </p>

            <h2>7. 支付机构手续费</h2>
            <p>
              若支付服务商（如 Paddle）对退款收取<strong>不可退回</strong>的手续费，该部分可能从退款总额中扣除，具体以支付服务商的规则为准。我们会在处理时尽量说明。
            </p>

            <h2>8. 政策更新</h2>
            <p>
              我们可能不时修订本页内容；修订后将在本页更新「最近更新」日期。若修订对<strong>已购买用户</strong>产生实质影响，我们将通过合理方式（如站内或邮件）提示；你在修订后继续使用服务，即视为知晓更新后的条款。
            </p>

            <h2>9. 联系我们</h2>
            <p>
              对本政策有任何疑问，请邮件联系：{' '}
              <a href="mailto:support@codcompass.com">support@codcompass.com</a>。
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
