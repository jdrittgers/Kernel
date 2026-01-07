# Farm Bidding Platform - Setup Guide

Welcome to your Farm Bidding Platform! This guide will help you get everything set up and running.

## What This Platform Does

This is a web-based bidding platform where:
- **Farmers** can create bid requests for farming inputs (seeds, chemicals, fertilizer, etc.)
- **Retailers** can submit competitive bids and product recommendations
- Everything is mobile-friendly so you can access it from your phone

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Set Up Database

Generate the Prisma client and create your database:

```bash
npx prisma generate
npx prisma db push
```

This will create a local SQLite database file at `prisma/data.db`.

### 3. Start the Development Server

```bash
npm run dev
```

Your app will be running at `http://localhost:3000`

## First Steps After Starting

1. **Register an Account**
   - Go to http://localhost:3000/login/register
   - Choose "Farmer" or "Retailer"
   - Fill in all required fields

2. **For Farmers:**
   - View your dashboard at `/dashboard`
   - Click "Create Bid Request" to request bids
   - View submitted bids on each request
   - Browse product recommendations from retailers

3. **For Retailers:**
   - View available bid requests at `/dashboard`
   - Click any bid request to submit your bid
   - Submit product recommendations for chemicals and seeds

## Deployment Options

### Option 1: Deploy to Vercel (Easiest for Frontend)

**Note:** Vercel works best with the frontend, but you'll need a separate database solution.

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. **Important:** You'll need to use a cloud database instead of SQLite:
   - Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   - Sign up for free PostgreSQL at:
     - [Supabase](https://supabase.com) - Free tier available
     - [Neon](https://neon.tech) - Free tier available
     - [Railway](https://railway.app) - Free tier available

4. Set your DATABASE_URL environment variable in Vercel dashboard

### Option 2: Deploy to Railway (Full Stack - Recommended)

Railway can host both your app and database for free/low cost.

1. Push your code to GitHub

2. Go to [Railway.app](https://railway.app)

3. Click "New Project" → "Deploy from GitHub repo"

4. Select your repository

5. Railway will auto-detect Remix and deploy it

6. Add a PostgreSQL database:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set DATABASE_URL

7. Update schema for PostgreSQL:
   - Change `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

8. Run migrations in Railway dashboard terminal:
```bash
npx prisma generate
npx prisma db push
```

### Option 3: Deploy to Fly.io

This template was originally built for Fly.io. Check the original docs in `README.md` for detailed Fly.io instructions.

## Environment Variables

Create a `.env` file with these variables:

```env
# Required
DATABASE_URL="file:./data.db?connection_limit=1"  # or PostgreSQL URL
SESSION_SECRET="your-random-secret-key-here"
ENCRYPTION_SECRET="another-random-secret-key"

# Optional
NODE_ENV="production"
DEV_HOST_URL="http://localhost:3000"
PROD_HOST_URL="https://your-domain.com"
```

**Generate secure secrets:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use this online: https://randomkeygen.com/
```

## Updating to PostgreSQL (For Production)

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Get a PostgreSQL database URL from:
   - Railway
   - Supabase
   - Neon
   - Heroku Postgres

3. Update your `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

4. Run migrations:
```bash
npx prisma generate
npx prisma db push
```

## Features Included

### For Farmers:
- ✅ Create bid requests for products/inputs
- ✅ View all submitted bids
- ✅ Compare bids side-by-side
- ✅ Browse retailer product recommendations
- ✅ See retailer contact information

### For Retailers:
- ✅ View all open bid requests
- ✅ Submit competitive bids (price, delivery date, shipping)
- ✅ Submit product recommendations (chemicals and seeds)
- ✅ Track your submitted bids
- ✅ Manage your recommendations

### General:
- ✅ User authentication (username/password)
- ✅ Mobile-responsive design
- ✅ Separate farmer and retailer dashboards
- ✅ User profiles with business info

## Future Integration with Your Grain Marketing App

Since you mentioned building this to integrate with another farming app, here are the options:

### Option 1: Simple Link Integration
Add a link in your grain marketing app that points to this bidding platform:
```html
<a href="https://your-bidding-platform.com">View Bid Requests</a>
```

### Option 2: Shared Authentication
Both apps can share the same user database:
- Use the same DATABASE_URL in both apps
- Users log in once and access both platforms

### Option 3: API Integration
This app can expose APIs that your other app can call:
- Get bid requests
- Submit bids programmatically
- Share data between platforms

## Troubleshooting

### "Prisma Client not generated"
Run:
```bash
npx prisma generate
```

### Database errors
Reset your database:
```bash
rm prisma/data.db
npx prisma db push
```

### Port already in use
Change the port in `package.json` or kill the process using port 3000

### Build errors about TypeScript versions
Use the `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

## Getting Help

- Check the original [Remix Docs](https://remix.run/docs)
- Check [Prisma Docs](https://www.prisma.io/docs) for database questions
- For deployment issues, check your hosting provider's docs

## Next Steps

1. ✅ Set up your local development environment
2. ✅ Create test accounts (one farmer, one retailer)
3. ✅ Test the full workflow:
   - Farmer creates bid request
   - Retailer submits bid
   - Farmer views bids
4. Choose a deployment platform
5. Set up production database
6. Deploy your app
7. Add custom domain (optional)

Good luck with your farm bidding platform! 🚜🌾
