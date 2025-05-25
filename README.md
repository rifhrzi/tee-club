# Teelite Club - Modern E-Commerce Platform

<div align="center">

![Teelite Club Logo](public/favicon.svg)

**A modern, full-stack e-commerce platform for premium t-shirt sales built with Next.js 14**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[Live Demo](https://teelite-club.vercel.app) • [Documentation](#documentation) • [API Reference](docs/API.md) • [Contributing](#contributing)

</div>

## 🌟 Overview

Teelite Club is a comprehensive e-commerce platform designed for selling premium t-shirts. Built with modern web technologies, it offers a seamless shopping experience with robust backend functionality, secure payment processing, and an intuitive admin dashboard.

### ✨ Key Features

- 🛍️ **Complete Product Catalog** - Browse and search through extensive product collections
- 🔍 **Product Variants** - Multiple sizes, colors, and styles with real-time stock management
- 🛒 **Smart Shopping Cart** - Persistent cart with local storage and user session sync
- 💳 **Secure Payments** - Integrated with Midtrans payment gateway
- 👤 **User Authentication** - Secure login/register with NextAuth.js
- 📱 **Responsive Design** - Mobile-first design with modern UI/UX
- ⚡ **Real-time Updates** - Live stock updates and order status tracking
- 🔐 **Admin Dashboard** - Complete product and order management
- 📊 **Analytics** - Sales tracking and inventory management
- 🧪 **Testing Suite** - Comprehensive unit and integration tests

### 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with middleware authentication
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT tokens
- **State Management**: Zustand for client-side state
- **Payments**: Midtrans payment gateway integration
- **Testing**: Jest with React Testing Library
- **Deployment**: Docker containerization support

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Midtrans** account for payment processing

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/tee-club.git
   cd tee-club
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/teelite"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # JWT Secrets
   JWT_ACCESS_SECRET="your-access-secret"
   JWT_REFRESH_SECRET="your-refresh-secret"

   # Midtrans Payment
   MIDTRANS_SERVER_KEY="your-server-key"
   MIDTRANS_CLIENT_KEY="your-client-key"

   # App Configuration
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

4. **Database setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate deploy

   # Seed the database
   npm run seed
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📁 Project Structure

```
teelite-club/
├── 📁 app/                     # Next.js App Router pages
│   ├── 📁 api/                 # API routes
│   │   ├── 📁 auth/            # Authentication endpoints
│   │   ├── 📁 products/        # Product management
│   │   ├── 📁 orders/          # Order processing
│   │   ├── 📁 checkout/        # Checkout process
│   │   ├── 📁 payment/         # Payment handling
│   │   └── 📁 admin/           # Admin API endpoints
│   ├── 📁 (pages)/             # Application pages
│   │   ├── 📄 page.tsx         # Homepage
│   │   ├── 📁 shop/            # Product catalog
│   │   ├── 📁 product/         # Product details
│   │   ├── 📁 cart/            # Shopping cart
│   │   ├── 📁 checkout/        # Checkout process
│   │   ├── 📁 orders/          # Order history
│   │   └── 📁 dashboard/       # User dashboard
│   ├── 📄 layout.tsx           # Root layout
│   └── 📄 globals.css          # Global styles
├── 📁 components/              # Reusable React components
│   ├── 📁 common/              # Shared components
│   ├── 📁 home/                # Homepage components
│   ├── 📁 dashboard/           # Dashboard components
│   └── 📁 payment/             # Payment components
├── 📁 lib/                     # Utility libraries
│   ├── 📄 auth.ts              # Authentication configuration
│   ├── 📄 db.ts                # Database connection
│   ├── 📄 payment.ts           # Payment processing
│   ├── 📄 validation.ts        # Input validation schemas
│   └── 📁 services/            # Business logic services
├── 📁 store/                   # State management
│   ├── 📄 cartStore.tsx        # Shopping cart state
│   └── 📄 types.ts             # Type definitions
├── 📁 hooks/                   # Custom React hooks
├── 📁 contexts/                # React contexts
├── 📁 utils/                   # Utility functions
├── 📁 types/                   # TypeScript type definitions
├── 📁 constants/               # Application constants
├── 📁 prisma/                  # Database schema and migrations
├── 📁 __tests__/               # Test suites
├── 📁 docs/                    # Documentation
└── 📁 public/                  # Static assets
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run type-check      # TypeScript type checking

# Database
npm run seed            # Seed database with sample data
npm run seed:admin      # Create admin user

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
npm run test:ci         # Run tests for CI/CD

# Utilities
npm run clean           # Clean build artifacts
```

### Docker Development

1. **Using Docker Compose**

   ```bash
   # Start all services (app + database)
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Stop services
   docker-compose down
   ```

2. **Manual Docker Build**

   ```bash
   # Build image
   docker build -t teelite-club .

   # Run container
   docker run -p 3000:3000 teelite-club
   ```

### Environment Variables

| Variable               | Description                  | Required | Default                 |
| ---------------------- | ---------------------------- | -------- | ----------------------- |
| `DATABASE_URL`         | PostgreSQL connection string | ✅       | -                       |
| `NEXTAUTH_URL`         | Application URL for NextAuth | ✅       | `http://localhost:3000` |
| `NEXTAUTH_SECRET`      | Secret for NextAuth JWT      | ✅       | -                       |
| `JWT_ACCESS_SECRET`    | JWT access token secret      | ✅       | -                       |
| `JWT_REFRESH_SECRET`   | JWT refresh token secret     | ✅       | -                       |
| `MIDTRANS_SERVER_KEY`  | Midtrans server key          | ✅       | -                       |
| `MIDTRANS_CLIENT_KEY`  | Midtrans client key          | ✅       | -                       |
| `NEXT_PUBLIC_BASE_URL` | Public base URL              | ✅       | `http://localhost:3000` |

## 📚 Documentation

- [API Reference](docs/API.md) - Complete API documentation
- [Architecture Guide](docs/ARCHITECTURE.md) - System architecture and design patterns
- [Developer Guide](docs/DEVELOPER.md) - Development setup and guidelines
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [Testing Guide](docs/TESTING.md) - Testing strategies and best practices

## 🧪 Testing

The project includes comprehensive testing with Jest and React Testing Library:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint and user flow testing
- **E2E Tests**: Complete user journey testing

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** automatically on push to main branch

### Docker Deployment

```bash
# Build production image
docker build -t teelite-club:latest .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  teelite-club:latest
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **TypeScript** for type safety
- **ESLint** and **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Jest** for testing
- **Husky** for pre-commit hooks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Midtrans](https://midtrans.com/) - Payment gateway for Indonesia

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/tee-club/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/tee-club/discussions)
- **Email**: [support@teeliteclub.com](mailto:support@teeliteclub.com)

---

<div align="center">

**[⬆ Back to Top](#teelite-club---modern-e-commerce-platform)**

Made with ❤️ by the Teelite Club Team

</div>
