# DevInsights

A comprehensive GitHub analytics and insights dashboard built with Next.js, TypeScript, and PostgreSQL.

##  Quick Start

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

##  Production Deployment

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

##  Environment Variables

See .env.example for required environment variables.

**Critical for production:**
- Generate NEXTAUTH_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
- Set NEXTAUTH_URL to your production domain
- Use production GitHub OAuth credentials
- Enable database connection pooling

##  Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js v5
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Animations:** Framer Motion

##  License

MIT
