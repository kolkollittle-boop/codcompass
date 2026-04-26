# Codcompass - Codcompass Knowledge Base

A premium technical knowledge base built with Next.js 15, Supabase, and Lemon Squeezy.

## 🚀 Features

- **Next.js 15** - Latest React framework with App Router
- **Supabase** - PostgreSQL database with real-time capabilities
- **Lemon Squeezy** - Payment processing with global tax compliance
- **Authentication** - NextAuth.js with email/password and OAuth
- **Paywall** - Premium content with 30% free preview
- **Responsive** - Mobile-first design with Tailwind CSS
- **SEO** - Optimized for search engines
- **Performance** - Fast loading with static generation

## 📦 Tech Stack

- **Framework:** Next.js 15.3
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Payments:** Lemon Squeezy
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Lemon Squeezy account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cyberpunkkb.git
cd cyberpunkkb
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
```

4. **Run database migrations**
```bash
npx prisma generate
npx prisma db push
```

5. **Seed the database**
```bash
npx tsx scripts/seed.ts
```

6. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## 📁 Project Structure

```
cyberpunkkb/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Marketing pages (home, pricing)
│   ├── (kb)/               # Knowledge base pages
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # React components
├── lib/                    # Utility libraries
├── prisma/                 # Database schema
├── scripts/                # Utility scripts
├── docs/                   # Documentation
└── public/                 # Static assets
```

## 🗄️ Database Schema

### Core Tables
- **User** - User accounts and profiles
- **Article** - Technical articles and tutorials
- **Category** - Article categories
- **Tag** - Article tags
- **Subscription** - Payment subscriptions
- **Bookmark** - User bookmarks
- **ArticleView** - View tracking

### Relationships
- User → Subscriptions (1:N)
- Article → Categories (N:M)
- Article → Tags (N:M)
- User → Bookmarks (1:N)

## 🔐 Authentication

### Supported Providers
- Email/Password
- Google OAuth (configurable)
- GitHub OAuth (configurable)

### Session Management
- JWT-based sessions
- Automatic token refresh
- Secure cookie configuration

## 💳 Payments

### Lemon Squeezy Integration
- Subscription management
- Webhook handling
- Tax compliance
- Multi-currency support

### Plans
- **Free** - Access to 10% of articles
- **Builder** ($9.99/mo) - Full access, basic features
- **Pro** ($29/mo) - All features, team collaboration
- **Enterprise** ($49/mo) - Custom solutions

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

### Other Platforms
- **Netlify** - Supported
- **Railway** - Supported
- **AWS** - Supported with custom config

## 📊 Analytics

### Built-in Tracking
- Article views
- User engagement
- Conversion rates
- Revenue metrics

### Integration Options
- Vercel Analytics
- Google Analytics
- Plausible Analytics
- Mixpanel

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

## 📝 Scripts

### Development
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
```

### Database
```bash
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to database
npx prisma studio      # Open database GUI
npx tsx scripts/seed.ts # Seed database
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/cyberpunkkb/issues)
- **Discord:** [Join our community](#)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the database infrastructure
- Lemon Squeezy for payment processing
- Vercel for hosting

---

**Built with ❤️ by the Codcompass Team**

**Last Updated:** 2026-04-24
// Force redeploy
// Force redeploy 2
// Force redeploy 3
