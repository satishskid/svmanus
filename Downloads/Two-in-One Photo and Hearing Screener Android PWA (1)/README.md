# Health Screener PWA

A comprehensive Progressive Web Application (PWA) for vision and hearing screening with batch data management capabilities.

## 🚀 Features

- **Vision Screening Module**: Comprehensive vision testing tools
- **Hearing Screening Module**: Audio-based hearing assessment
- **Admin Dashboard**: Manage screening data and generate reports
- **Batch Data Management**: Handle multiple screening sessions efficiently
- **PWA Support**: Works offline and can be installed on devices
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Database**: Drizzle ORM with MySQL
- **Backend**: Express.js with tRPC
- **UI Components**: Headless UI, Lucide Icons, Sonner (toasts)
- **Charts**: Recharts
- **Testing**: Vitest, Playwright

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🔧 Development Scripts

```bash
# Development
pnpm dev                  # Start dev server on port 3000

# Building
pnpm build               # Build for production
pnpm preview             # Preview production build

# Code Quality
pnpm lint                # Run ESLint
pnpm lint:fix            # Fix ESLint errors
pnpm format              # Format code with Prettier
pnpm format:check        # Check code formatting
pnpm type-check          # Run TypeScript type checking

# Testing
pnpm test                # Run unit tests
pnpm test:coverage       # Run tests with coverage
pnpm test:e2e            # Run end-to-end tests

# Database
pnpm db:push             # Push schema changes to database
pnpm db:generate         # Generate migrations
pnpm db:studio           # Open Drizzle Studio
pnpm db:migrate          # Run migrations
pnpm db:seed             # Seed database

# Analysis
pnpm lighthouse          # Run Lighthouse audit
pnpm build:analyze       # Analyze bundle size
```

## 📁 Project Structure

```
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components
│   │   └── ErrorBoundary.tsx
│   ├── contexts/        # React contexts
│   │   └── ThemeContext.tsx
│   ├── pages/           # Page components
│   │   ├── Home.tsx
│   │   ├── VisionScreening.tsx
│   │   ├── HearingScreening.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── NotFound.tsx
│   ├── lib/             # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── hooks/           # Custom React hooks
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   ├── index.css        # Global styles
│   ├── db.ts            # Database configuration
│   ├── schema.ts        # Database schema
│   └── routers.ts       # tRPC routers
├── public/              # Static assets
├── dist/                # Production build output
└── index.html           # HTML template
```

## 🌐 Deployment

The project is configured for deployment on:
- **Netlify** (see `netlify.toml`)
- **Vercel** (see `vercel.json`)
- **GitHub Actions** (see `.github/workflows/`)

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_database_url
NODE_ENV=development
```

## 📱 PWA Features

- Offline support
- Install to home screen
- Push notifications (optional)
- Background sync

## 🧪 Testing

The project includes:
- Unit tests with Vitest
- E2E tests with Playwright
- Code coverage reporting

## 📄 License

MIT

## 👥 Author

Health Screener Team

## 🔗 Repository

https://github.com/satishskid/svmanus.git

## 🐛 Issues

https://github.com/satishskid/svmanus/issues

## 📋 Requirements

- Node.js >= 20.0.0
- pnpm >= 8.0.0
