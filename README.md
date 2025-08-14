# CarMarket - Car Dealership Platform

A comprehensive car dealership platform built with Next.js, featuring both sales and rental listings, user authentication, and advanced search capabilities.

## Features

### Core Functionality
- **Listing Management**: Create, edit, and manage both sales and rental listings
- **User Authentication**: NextAuth.js with Google/Facebook OAuth and email/password
- **Advanced Search**: Filter by make, model, price, location, and more
- **Image Management**: Multiple image uploads with preview functionality
- **Review System**: User reviews and ratings for listings
- **Favorites**: Save and manage favorite listings
- **Dashboard**: Comprehensive dealer dashboard with analytics

### Phase 5 Features (Latest)
- **Draft/Publish Workflow**: Save listings as drafts before publishing
- **Bulk Operations**: Manage multiple listings simultaneously
- **Enhanced Filtering**: Advanced filtering and sorting options
- **Responsive Design**: Mobile-first responsive interface
- **Performance Optimizations**: Optimized database queries and caching

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production recommended)
- **Authentication**: NextAuth.js
- **File Upload**: Custom file handling with UUID naming
- **Icons**: React Icons (Font Awesome)
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd CarDealership
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.production.example .env.local
# Edit .env.local with your actual values
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### GitHub Deployment

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Production Deployment (HostPinnacle)

1. **Build the application**:
```bash
npm run build
```

2. **Environment Setup**:
   - Copy `.env.production.example` to `.env.production`
   - Fill in all production values
   - Ensure `NEXTAUTH_URL` matches your domain

3. **Database Setup**:
   - Set up PostgreSQL database on HostPinnacle
   - Update `DATABASE_URL` in production environment
   - Run migrations: `npx prisma db push`

4. **File Upload Directory**:
   - Ensure `public/uploads/` directory exists and is writable
   - Consider using cloud storage (AWS S3, Cloudinary) for production

5. **Deploy Files**:
   - Upload all files except those in `.gitignore`
   - Ensure Node.js 18+ is available on the server
   - Run `npm install --production`
   - Run `npm run build`
   - Start with `npm start`

## Environment Variables

See `.env.production.example` for all required environment variables.

### Required Variables:
- `DATABASE_URL`: Database connection string
- `NEXTAUTH_URL`: Your domain URL
- `NEXTAUTH_SECRET`: Random secret for NextAuth
- `JWT_SECRET`: Secret for JWT tokens

### Optional Variables:
- OAuth provider credentials (Google, Facebook)
- Email server configuration
- SMS configuration (Twilio)
- AdSense configuration

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── listings/          # Listing pages
├── components/            # Reusable components
├── lib/                   # Utility libraries
├── prisma/               # Database schema
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Listings
- `GET /api/listings` - Get all listings
- `POST /api/listings/create` - Create new listing
- `GET /api/listings/[id]` - Get specific listing
- `PATCH /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing

### Rentals
- `GET /api/rental-listings` - Get rental listings
- `POST /api/listings/rental/create` - Create rental listing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.