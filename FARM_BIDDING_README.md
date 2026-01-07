# 🚜 Farm Bidding Platform

A modern web-based platform for farmers to request bids from retailers for farming operation inputs (seeds, chemicals, fertilizer, etc.) and for retailers to submit competitive bids and product recommendations.

## 🌟 Features

### For Farmers
- **Create Bid Requests**: Request quotes for farming inputs with quantity, unit, and detailed descriptions
- **View & Compare Bids**: See all submitted bids with pricing, delivery dates, and shipping costs
- **Product Recommendations**: Browse recommended chemicals and seeds from retailers
- **Contact Information**: Direct access to retailer phone numbers and business details

### For Retailers
- **Browse Bid Requests**: View all open bid requests from farmers
- **Submit Competitive Bids**: Provide pricing, delivery dates, shipping costs, and notes
- **Product Recommendations**: Proactively recommend products (chemicals and seeds) to farmers
- **Track Your Submissions**: Monitor all your bids and recommendations in one dashboard

### General Features
- **Two User Types**: Separate experiences for farmers and retailers
- **User Profiles**: Business name, location, phone number for easy contact
- **Mobile Responsive**: Access from your phone, tablet, or computer
- **Secure Authentication**: Username and password authentication
- **Modern UI**: Clean, easy-to-use interface built with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
npm install --legacy-peer-deps
```

2. **Set up the database**:
```bash
npx prisma generate
npx prisma db push
```

3. **Start the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to `http://localhost:3000`

## 📱 How to Use

### Getting Started

1. **Register an Account**
   - Click "Register" or navigate to `/login/register`
   - Select whether you're a Farmer or Retailer
   - Fill in your information:
     - Full name
     - Username (unique)
     - Business name
     - Email
     - Phone number
     - Location (City, State)
     - Password

2. **After Registration**
   - You'll be automatically logged in
   - Redirected to your dashboard based on your user type

### Farmer Workflow

1. **Dashboard** (`/dashboard`)
   - View all your bid requests
   - See how many bids each request has received
   - Quick access to create new requests

2. **Create Bid Request** (`/bid-requests/new`)
   - Product name (e.g., "Corn Seed", "Herbicide")
   - Quantity and unit (e.g., "1000 bags")
   - Optional description for specifications

3. **View Bid Request Details** (`/bid-requests/:id`)
   - See all submitted bids
   - Compare pricing, delivery dates, and shipping costs
   - View retailer contact information
   - Close bid request when ready

4. **Browse Product Recommendations** (`/recommendations`)
   - View chemicals and seeds recommended by retailers
   - See pricing, descriptions, and availability
   - Contact retailers directly

### Retailer Workflow

1. **Dashboard** (`/dashboard`)
   - Browse all open bid requests from farmers
   - See your submitted bids
   - View your product recommendations

2. **Submit a Bid** (`/bid-requests/:id`)
   - Click on any open bid request
   - Fill in your bid details:
     - Total price
     - Delivery date
     - Shipping cost (optional)
     - Notes (optional)
   - Submit bid

3. **Submit Product Recommendation** (`/recommendations/new`)
   - Choose product type (Chemical or Seed)
   - Provide product details:
     - Product name
     - Description
     - Price and unit
     - Available delivery date (optional)

## 🗄️ Database Schema

### Models

- **User**: Farmers and retailers with profile information
- **BidRequest**: Products farmers want bids for
- **Bid**: Retailer submissions for bid requests
- **ProductRecommendation**: Retailer product suggestions

## 🌐 Deployment

### Recommended: Railway.app

1. Push code to GitHub
2. Create account at [Railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Add PostgreSQL database
5. Update `prisma/schema.prisma` to use PostgreSQL
6. Deploy!

Detailed deployment instructions: See `SETUP.md`

### Other Options
- **Vercel**: Great for frontend (requires separate database)
- **Fly.io**: Full-stack deployment (original template support)

## 🔧 Tech Stack

- **Framework**: [Remix](https://remix.run) - Full-stack React framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: [Prisma](https://www.prisma.io)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Authentication**: Remix Auth
- **Validation**: Zod + Conform
- **Language**: TypeScript

## 📁 Project Structure

```
app/
├── models/               # Database models
│   ├── user.server.ts
│   ├── bidRequest.server.ts
│   ├── bid.server.ts
│   └── productRecommendation.server.ts
├── routes/               # Application pages
│   ├── _layout.dashboard.tsx
│   ├── _layout.bid-requests.new.tsx
│   ├── _layout.bid-requests.$id.tsx
│   ├── _layout.recommendations.tsx
│   ├── _layout.recommendations.new.tsx
│   └── _layout.login.register.tsx
├── services/             # Business logic
└── utils/                # Utilities

prisma/
└── schema.prisma         # Database schema
```

## 🔐 Environment Variables

Copy `.env.example` to `.env` and update:

```env
# Required
SESSION_SECRET="your-random-secret"
ENCRYPTION_SECRET="another-random-secret"
DATABASE_URL="file:./data.db?connection_limit=1"

# Optional
NODE_ENV="development"
DEV_HOST_URL="http://localhost:3000"
PROD_HOST_URL="https://your-domain.com"
```

## 🔮 Future Enhancements

Potential features to add:

- **Email Notifications**: Notify farmers when new bids arrive
- **Bid Expiration**: Auto-close requests after a deadline
- **Messaging System**: Direct chat between farmers and retailers
- **Document Uploads**: Attach product specs, quotes, or invoices
- **Analytics Dashboard**: Track bidding trends and savings
- **Mobile Apps**: Native iOS/Android apps
- **Integration API**: Connect with grain marketing or other farm management software

## 🔗 Integration with Other Apps

This platform is designed to work alongside other farming applications:

### Simple Integration
Add a link in your other app:
```html
<a href="https://your-bidding-platform.com">Manage Bids</a>
```

### Shared Authentication
Use the same database for both apps to share user accounts

### API Integration
Build custom APIs to share data between platforms

## 🛠️ Development Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# View database in browser
npx prisma studio

# Start dev server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

## 📞 Support

For questions or issues:
1. Check `SETUP.md` for detailed setup instructions
2. Review [Remix documentation](https://remix.run/docs)
3. Check [Prisma documentation](https://www.prisma.io/docs)

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built on the [Stripe Stack](https://github.com/dev-xo/stripe-stack) template by [@dev-xo](https://github.com/dev-xo)

---

**Happy Farming! 🌾**
