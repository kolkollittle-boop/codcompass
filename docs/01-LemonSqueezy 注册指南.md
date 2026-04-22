# Lemon Squeezy 注册指南

> **适用对象**: 个人创作者/开发者（无需公司）
> 
> **目标**: 搭建海外订阅收费系统
> 
> **预计时间**: 2-3 小时完成注册 + 1-2 工作日审核

---

## 📋 目录

1. [注册前准备](#注册前准备)
2. [账户注册流程](#账户注册流程)
3. [身份验证](#身份验证)
4. [收款账户设置](#收款账户设置)
5. [创建订阅产品](#创建订阅产品)
6. [获取结账链接](#获取结账链接)
7. [网站集成](#网站集成)
8. [常见问题](#常见问题)

---

## 注册前准备

### 所需材料清单

| 材料 | 要求 | 示例 |
|------|------|------|
| **电子邮箱** | Gmail 推荐（海外服务兼容性好） | yourname@gmail.com |
| **身份证件** | 护照 或 身份证（彩色照片） | passport_photo.jpg |
| **收款账户** | PayPal 或 Wise 账户 | PayPal 邮箱 |
| **产品信息** | 产品名称、描述、价格 | CyberPunk KB - $29/月 |
| **网站 URL** | 可有可无，有更好 | https://cyberpunkkb.com |

### 提前注册这些账户

```
□ PayPal 账户
  └─ 访问：https://www.paypal.com
  └─ 选择：个人账户 (Personal Account)
  └─ 验证：绑定银行卡完成验证

或

□ Wise 账户（推荐，汇率更好）
  └─ 访问：https://wise.com
  └─ 选择：个人账户
  └─ 验证：上传身份证件
  └─ 获取：美元/欧元/英镑收款账户
```

---

## 账户注册流程

### Step 1: 访问官网

```
网址：https://www.lemonsqueezy.com
```

点击页面右上角 **"Start Selling"** 或 **"Sign Up"**

### Step 2: 选择账户类型

```
┌─────────────────────────────────────────────────────────────┐
│  Create your account                                        │
│                                                             │
│  ○ Business (公司有实体)                                    │
│  ● Creator (个人创作者) ← 选择这个                          │
│                                                             │
│  [Continue]                                                 │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: 填写基本信息

| 字段 | 填写内容 | 注意事项 |
|------|----------|----------|
| **Full Name** | 护照上的英文姓名 | 拼音，与护照一致 |
| **Email** | Gmail 邮箱 | 用于接收验证邮件 |
| **Password** | 强密码 | 至少 12 位，含大小写+数字 |
| **Country** | China (或你所在国家) | 如实填写 |
| **State/Province** | 所在省份 | 如 Guangdong |

```
┌─────────────────────────────────────────────────────────────┐
│  Account Details                                            │
│                                                             │
│  Full Name:          [Zhang San]                            │
│  Email:              [zhang.san@gmail.com]                  │
│  Password:           [•••••••••••••]                        │
│  Country:            [China ▼]                              │
│  State/Province:     [Guangdong ▼]                          │
│                                                             │
│  ☑ I agree to the Terms of Service and Privacy Policy       │
│                                                             │
│  [Create Account]                                           │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: 验证邮箱

```
1. 检查 Gmail 收件箱
2. 查找来自 Lemon Squeezy 的验证邮件
3. 点击邮件中的验证链接
4. 完成邮箱验证
```

**邮件标题**: `Verify your email - Lemon Squeezy`

---

## 身份验证

### Step 5: 完成卖家验证 (Seller Verification)

登录后，系统会引导你完成验证：

```
Dashboard → Settings → Seller Verification
```

### 需要提交的信息

#### 个人信息

| 字段 | 填写示例 |
|------|----------|
| **Legal First Name** | San |
| **Legal Last Name** | Zhang |
| **Date of Birth** | 1990-01-15 |
| **Address Line 1** | No. 123, Tianhe Road |
| **Address Line 2** | Apt 4B (可选) |
| **City** | Guangzhou |
| **Postal Code** | 510000 |
| **Phone Number** | +86 138 0000 0000 |

#### 身份证件上传

```
┌─────────────────────────────────────────────────────────────┐
│  Identity Verification                                      │
│                                                             │
│  Document Type:  [Passport ▼]  或  [National ID ▼]          │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │                 │  │                 │                  │
│  │   正面照片       │  │   反面照片       │                  │
│  │   (如有)        │  │   (如有)        │                  │
│  │                 │  │                 │                  │
│  │  [Upload]       │  │  [Upload]       │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  要求：                                                     │
│  • 彩色照片，清晰可读                                       │
│  • 四角完整，无反光                                         │
│  • JPG 或 PNG 格式，最大 5MB                                 │
└─────────────────────────────────────────────────────────────┘
```

**拍照技巧：**
- 放在白色背景上
- 光线充足，避免阴影
- 确保所有文字清晰可读
- 不要使用美颜/滤镜

### Step 6: 等待审核

```
提交后状态：
┌─────────────────────────────────────────────────────────────┐
│  Verification Status: Under Review                          │
│                                                             │
│  预计审核时间：1-2 个工作日                                   │
│  审核结果将通过邮件通知                                     │
└─────────────────────────────────────────────────────────────┘
```

**审核期间可以：**
- ✅ 创建产品
- ✅ 设计结账页面
- ✅ 测试集成

**审核通过后才能：**
- ✅ 接收真实付款
- ✅ 提现资金

---

## 收款账户设置

### Step 7: 配置 Payout 信息

```
Dashboard → Settings → Payouts
```

### 选项 A: PayPal（推荐新手）

```
┌─────────────────────────────────────────────────────────────┐
│  Payout Method: PayPal                                      │
│                                                             │
│  PayPal Email: [your-paypal@email.com]                     │
│                                                             │
│  [Save Changes]                                             │
└─────────────────────────────────────────────────────────────┘
```

**提现流程：**
```
Lemon Squeezy → PayPal → 绑定国内银行卡 → 人民币
                    ↓
              手动结汇入账
```

**到账时间：** 3-5 工作日

### 选项 B: Wise（推荐，汇率更好）

```
┌─────────────────────────────────────────────────────────────┐
│  Payout Method: Bank Transfer (Wise)                        │
│                                                             │
│  Account Holder Name: [Zhang San]                           │
│  Bank Name: [Wise Payments Ltd]                             │
│  Account Number: [12345678]                                 │
│  Routing Number: [XXXXX]                                    │
│  SWIFT/BIC: [TRWIBEB1XXX]                                   │
│                                                             │
│  [Save Changes]                                             │
└─────────────────────────────────────────────────────────────┘
```

**如何获取 Wise 账户信息：**
```
1. 登录 Wise.com
2. 点击 "Open a balance" → 选择 USD
3. 点击 "Get account details"
4. 复制 Account Number 和 Routing Number
5. 填入 Lemon Squeezy
```

**提现流程：**
```
Lemon Squeezy → Wise USD → Wise 结汇 → 国内银行卡
                                    ↓
                              支付宝/微信收款
```

**优势：**
- 汇率比 PayPal 好约 1-2%
- 可直接结汇到支付宝
- 到账更快（1-2 工作日）

### Payout 周期

```
┌─────────────────────────────────────────────────────────────┐
│  Payout Schedule                                            │
│                                                             │
│  • 每月 5 日 和 20 日 自动 payout                              │
│  • 最低提现金额：$50                                        │
│  • 首次 payout 需要账户余额达到 $100                         │
│                                                             │
│  示例：                                                     │
│  4 月 1 日 -4 月 15 日 的收入 → 4 月 20 日 payout                │
│  4 月 16 日 -4 月 30 日 的收入 → 5 月 5 日 payout                │
└─────────────────────────────────────────────────────────────┘
```

---

## 创建订阅产品

### Step 8: 创建 Store

```
Dashboard → Stores → Create Store
```

| 字段 | 填写建议 |
|------|----------|
| **Store Name** | CyberPunk Knowledge Base |
| **Store URL** | cyberpunkkb (会自动生成) |
| **Description** | AI-powered technical knowledge platform for developers |
| **Logo** | 上传 400x400px logo |
| **Brand Color** | #00FFFF (赛博朋克青) |

### Step 9: 创建订阅产品

```
Dashboard → Products → Create Product
```

#### 产品配置

```
┌─────────────────────────────────────────────────────────────┐
│  Product Details                                            │
│                                                             │
│  Name:              [CyberPunk KB - Builder]                │
│  Description:       [Monthly subscription for unlimited     │
│                      access to technical tutorials]         │
│                                                             │
│  Product Type:      ● Subscription (Recurring)              │
│                     ○ One-time                              │
│                                                             │
│  Pricing:                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Variant Name:    [Builder Plan]                     │   │
│  │  Price:           [$29.00]                           │   │
│  │  Billing Period:  [Monthly ▼]                        │   │
│  │                                                       │   │
│  │  ☑ Charge tax                                         │   │
│  │  ☑ Allow quantity selection                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Create Product]                                           │
└─────────────────────────────────────────────────────────────┘
```

### 创建三个套餐

| 套餐 | 名称 | 价格 | 描述 |
|------|------|------|------|
| **Builder** | CyberPunk KB - Builder | $29/月 | Unlimited access + code downloads |
| **Pro** | CyberPunk KB - Pro | $59/月 | Builder + video tutorials + source code |
| **Enterprise** | CyberPunk KB - Enterprise | $99/月 | Pro + 1v1 consultation + team license |

### 产品设置详情

```
┌─────────────────────────────────────────────────────────────┐
│  Subscription Settings                                      │
│                                                             │
│  Trial Period:  ☑ Enable free trial                        │
│                 [7] days (可选，建议先不开启)                │
│                                                             │
│  Billing Cycle:  ● Ongoing (持续订阅)                       │
│                 ○ Fixed periods (固定期数)                  │
│                                                             │
│  Cancellation:  ☑ Allow customers to cancel anytime         │
│                 ☑ Send cancellation confirmation email      │
│                                                             │
│  Dunning:       ☑ Enable retry for failed payments          │
│                 Retry attempts: [3]                         │
│                                                             │
│  [Save Settings]                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 获取结账链接

### Step 10: 获取产品链接

产品创建后，进入产品页面：

```
Dashboard → Products → [Your Product] → Checkout
```

### 结账链接格式

```
标准链接:
https://cyberpunkkb.lemonsqueezy.com/buy/builder-plan

带参数链接:
https://cyberpunkkb.lemonsqueezy.com/buy/builder-plan?embed=1

优惠券链接:
https://cyberpunkkb.lemonsqueezy.com/buy/builder-plan?discount=LAUNCH20
```

### 结账页面预览

```
┌─────────────────────────────────────────────────────────────┐
│  CyberPunk Knowledge Base                                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Builder Plan                            $29.00/mo  │   │
│  │                                                      │   │
│  │  ✓ Unlimited article access                          │   │
│  │  ✓ Download source code                              │   │
│  │  ✓ Discord community access                          │   │
│  │  ✓ Weekly newsletter                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Email: [________________]                                  │
│  Card:  [________________] [__/__] [___]                    │
│                                                             │
│  [Subscribe Now - $29.00]                                   │
│                                                             │
│  🔒 Secured by Lemon Squeezy                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 网站集成

### 方式 1: 简单链接（最快）

```html
<!-- 在产品页面添加购买按钮 -->
<a href="https://cyberpunkkb.lemonsqueezy.com/buy/builder-plan" 
   class="btn-primary">
   Subscribe Now - $29/mo
</a>

<style>
.btn-primary {
  display: inline-block;
  padding: 12px 24px;
  background: #00FFFF;
  color: #000;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}
</style>
```

### 方式 2: 嵌入式结账（推荐）

```html
<!-- 在产品页面嵌入 -->
<a href="https://cyberpunkkb.lemonsqueezy.com/buy/builder-plan" 
   class="lemonsqueezy-button"
   data-product="builder-plan">
   Subscribe Now - $29/mo
</a>

<!-- 加载 Lemon Squeezy 脚本 -->
<script src="https://assets.lemonsqueezy.com/lemon.js"></script>
```

**效果：** 点击后弹出结账模态框，用户无需离开网站

### 方式 3: Next.js 集成

```jsx
// components/SubscribeButton.jsx
import { useEffect } from 'react';

export default function SubscribeButton({ plan, price }) {
  useEffect(() => {
    // 加载 Lemon Squeezy 脚本
    const script = document.createElement('script');
    script.src = 'https://assets.lemonsqueezy.com/lemon.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <a
      href={`https://cyberpunkkb.lemonsqueezy.com/buy/${plan}`}
      className="lemonsqueezy-button"
      data-product={plan}
    >
      Subscribe - ${price}/mo
    </a>
  );
}

// 使用示例
<SubscribeButton plan="builder-plan" price="29" />
```

### 方式 4: API 集成（高级）

```javascript
// pages/api/create-subscription.js
export default async function handler(req, res) {
  const response = await fetch(
    'https://api.lemonsqueezy.com/v1/checkouts',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            product_id: process.env.LEMONSQUEEZY_PRODUCT_ID,
            variant_id: process.env.LEMONSQUEEZY_VARIANT_ID,
            checkout_data: {
              email: req.body.email,
            },
          },
        },
      }),
    }
  );

  const checkout = await response.json();
  res.status(200).json({ url: checkout.data.attributes.url });
}
```

---

## 常见问题

### Q1: 审核被拒绝怎么办？

**常见原因：**
- 身份证件照片不清晰
- 网站内容不完整
- 产品描述不清晰

**解决方案：**
1. 重新拍摄清晰的证件照片
2. 确保网站有完整的 About/Contact 页面
3. 详细填写产品描述

### Q2:  payout 多久到账？

```
Lemon Squeezy → PayPal: 1-2 工作日
PayPal → 国内银行卡：2-3 工作日

Lemon Squeezy → Wise: 1 工作日
Wise → 支付宝：即时
```

### Q3: 如何处理退款？

```
Dashboard → Orders → [Order] → Refund

• 可全额或部分退款
• 退款后订阅自动取消
• 退款金额 3-5 工作日退回用户
```

### Q4: 用户如何取消订阅？

```
用户端：
1. 点击订阅确认邮件中的 "Manage Subscription"
2. 或访问：https://cyberpunkkb.lemonsqueezy.com/orders/lookup
3. 输入邮箱查找订单
4. 点击 "Cancel Subscription"

自动处理，无需人工介入
```

### Q5: 支持优惠券吗？

```
Dashboard → Discounts → Create Discount

• 百分比折扣：20% OFF
• 固定金额：$10 OFF
• 限时优惠：设置有效期
• 限次数：前 100 名用户

优惠券链接：
https://cyberpunkkb.lemonsqueezy.com/buy/builder-plan?discount=LAUNCH20
```

### Q6: 如何查看收入报表？

```
Dashboard → Analytics

• 总收入 (Gross Revenue)
• 净收入 (Net Revenue)
• 退款金额 (Refunds)
• 订阅数 (Active Subscriptions)
• MRR (Monthly Recurring Revenue)

可导出 CSV 报表
```

### Q7: 支持中文界面吗？

```
Lemon Squeezy 结账页面支持多语言：
• 自动检测用户浏览器语言
• 支持英文、德文、法文、西班牙文等
• 中文支持有限（部分界面）

建议：结账页面保持英文（欧美用户为主）
```

### Q8: 税务如何处理？

```
Lemon Squeezy 作为 Merchant of Record:
✅ 自动计算并收取 VAT/销售税
✅ 自动申报和缴纳税款
✅ 提供税务报表

你只需要：
• 在 payout 时提供税务信息
• 年度报告个人收入
```

---

## 📝 检查清单

完成注册后，确认以下项目：

```
□ 账户注册完成
□ 邮箱验证通过
□ 身份验证提交
□ Payout 账户设置完成
□ Store 创建完成
□ 3 个订阅产品创建完成
□ 结账链接获取
□ 网站集成测试
□ 测试购买流程（可用 100% 优惠券）
□ 确认邮件通知正常
□ 确认 payout 信息正确
```

---

## 📞 获取帮助

### Lemon Squeezy 官方支持

- **帮助中心**: https://www.lemonsqueezy.com/help
- **邮件支持**: support@lemonsqueezy.com
- **响应时间**: 24-48 小时
- **在线聊天**: Dashboard 右下角

### 社区资源

- **Discord**: https://discord.gg/lemonsqueezy
- **Twitter**: @lemonsqueezy
- **YouTube**: Lemon Squeezy 官方频道

---

## 下一步

完成注册后：

1. ✅ 测试完整购买流程
2. ✅ 将结账链接集成到网站
3. ✅ 设置欢迎邮件自动化
4. ✅ 配置数据分析追踪
5. ✅ 准备上线发布

---

**文档版本**: v1.0
**最后更新**: 2026-04-21
**适用平台**: Lemon Squeezy
