# DevInsights

A comprehensive GitHub analytics and insights dashboard built with Next.js, TypeScript, and PostgreSQL.

## ✨ Features

- 📊 **Comprehensive Analytics** - Track commits, repositories, and coding patterns
- 🤖 **AI-Powered Insights** - Discover your developer persona and get personalized recommendations
- 📈 **Productivity Tracking** - Monitor streaks, growth, and coding habits
- 🎨 **Beautiful Dashboard** - Modern, responsive UI with interactive charts
- 🔒 **Secure Authentication** - GitHub OAuth integration
- ⚡ **Real-time Sync** - Keep your data up-to-date with GitHub

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- GitHub OAuth App credentials

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🏗️ Production Deployment

### Build for Production

```bash
# Generate production build
pnpm build

# Start production server
pnpm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t devinsights .

# Run container
docker run -p 3000:3000 --env-file .env devinsights

# Or use docker-compose
docker-compose up -d
```

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

**Critical for production:**
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Required variables
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://yourdomain.com
GITHUB_CLIENT_ID=<your-client-id>
GITHUB_CLIENT_SECRET=<your-client-secret>
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js v5
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 📁 Project Structure

```
devinsights/
├── app/              # Next.js App Router
│   ├── api/         # API routes
│   ├── dashboard/   # Dashboard page
│   ├── insights/    # Insights page
│   └── profile/     # Profile page
├── components/       # React components
│   ├── charts/      # Chart components
│   ├── dashboard/   # Dashboard components
│   └── ui/          # UI components
├── lib/             # Business logic
│   ├── ai/         # AI integration
│   ├── analytics/  # Analytics engine
│   ├── github/     # GitHub API client
│   └── hooks/      # React hooks
├── prisma/          # Database schema
└── public/          # Static assets
```

## 🔄 API Routes

### Sync
- `POST /api/sync` - Trigger GitHub data sync
- `GET /api/sync` - Get sync status

### Analytics
- `GET /api/analytics` - Get user analytics

### Insights
- `POST /api/insights/generate` - Generate AI insights
- `POST /api/insights/enhanced` - Get enhanced insights

### GitHub
- `GET /api/github/rate-limit` - Check rate limit

## 📊 Performance

- **Lighthouse Score:** 94+
- **First Contentful Paint:** <1s
- **Time to Interactive:** <2.5s
- **Bundle Size:** ~140KB (gzipped)

## 🔒 Security

- Security headers configured
- HTTPS enforced in production
- Environment variable validation
- Rate limiting on API routes
- Input sanitization

## 📝 Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:push      # Push schema changes
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 📚 Documentation

- [Audit Report](./AUDIT_REPORT.md) - Comprehensive codebase audit
- [Design Document](./DESIGN.md) - Architecture and design decisions
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Development guide

## 🐛 Troubleshooting

### Common Issues

**Build fails:**
```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

**Database connection issues:**
```bash
# Verify DATABASE_URL in .env
# Check PostgreSQL is running
pnpm db:push
```

**GitHub OAuth not working:**
- Verify callback URL: `{NEXTAUTH_URL}/api/auth/callback/github`
- Check GitHub OAuth app settings
- Ensure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are correct

## 🚀 Deployment Platforms

### Vercel (Recommended)
```bash
vercel deploy
```

### Railway
```bash
railway up
```

### Docker
```bash
docker-compose up -d
```

---

**Built with ❤️ using Next.js and TypeScript**
