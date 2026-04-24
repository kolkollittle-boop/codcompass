# Codcompass Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- Vercel account (free tier is sufficient)
- GitHub repository connected to Vercel
- Supabase project configured

### Step 1: Push to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin git@github.com:yourusername/cyberpunkkb.git

# Push the code
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js 15

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres?pgbouncer=true

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-random-secret-key
```

### Step 4: Deploy

1. Click "Deploy"
2. Vercel will build and deploy automatically
3. Your site will be live at `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## 🔧 Post-Deployment

### Run Database Seed

```bash
# SSH into Vercel or run locally with production env
npx tsx scripts/seed.ts
```

### Verify Supabase Connection

1. Check Supabase Dashboard → Table Editor
2. Verify tables are populated
3. Test article pages load correctly

### Set Up Monitoring

1. **Vercel Analytics**: Enable in Project Settings
2. **Supabase Logs**: Monitor database queries
3. **Error Tracking**: Consider Sentry or LogRocket

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database seeded with content
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic on Vercel)
- [ ] Analytics enabled
- [ ] Error tracking set up
- [ ] Performance optimized (images, fonts)
- [ ] SEO meta tags added
- [ ] Social media cards configured
- [ ] Sitemap generated
- [ ] Robots.txt configured

## 📊 Performance Optimization

### Image Optimization
```bash
npm install next-image
```

### Font Optimization
Next.js 15 automatically optimizes fonts. Configure in `next.config.js`:

```javascript
module.exports = {
  experimental: {
    optimizeFonts: true,
  },
}
```

### Caching Strategy
Configure revalidation for dynamic content:

```typescript
// Revalidate every hour
export const revalidate = 3600;
```

## 🔒 Security

### Supabase Row Level Security
Enable RLS on all tables:

```sql
ALTER TABLE "Article" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
```

### Rate Limiting
Configure in Vercel or use a middleware:

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

## 📈 Analytics

### Vercel Analytics
Enable in Project Settings → Analytics

### Google Analytics
Add to `app/layout.tsx`:

```typescript
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
```

## 🔄 CI/CD

### Automatic Deployments
- Push to `main` → Production deploy
- Push to `develop` → Preview deploy
- Pull requests → Preview deployments

### Environment-Specific Variables
- `Production`: Live environment variables
- `Preview`: Staging environment variables
- `Development`: Local environment variables

## 🆘 Troubleshooting

### Build Fails
1. Check environment variables
2. Verify Node.js version (18+)
3. Clear build cache in Vercel

### Database Connection Issues
1. Verify Supabase URL and keys
2. Check network restrictions
3. Ensure pgbouncer is enabled

### Performance Issues
1. Enable Vercel Edge Network
2. Optimize images
3. Use caching strategies

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Last Updated:** 2026-04-24
**Version:** 1.0
