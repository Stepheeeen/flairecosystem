# Setup Guide - Flair Eco System

Welcome to Flair Eco System, the luxury multi-tenant fashion platform. Follow these steps to get your development environment up and running.

## Prerequisites

- **Node.js**: Version 18 or later
- **Package Manager**: `npm`, `yarn`, or `pnpm`
- **MongoDB**: A running instance (local or Atlas)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vellion
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory. You can use the `.env.example` file as a template.

```bash
cp .env.example .env.local
```

Fill in the required variables:
- `MONGODB_URI`: Your MongoDB connection string.
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Your Paystack Public Key.
- `PAYSTACK_SECRET_KEY`: Your Paystack Secret Key.
- `NEXTAUTH_SECRET`: A secret string for NextAuth session encryption.
- `NEXTAUTH_URL`: `http://localhost:3000` for local development.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Initial User Setup

To access the admin features, you'll need to create a user and potentially promote them to an admin role. Check the `scripts/` directory for helpful utilities:
- `scripts/create-super-admin.mjs`: Create a super admin user.
- `scripts/promote-admin.js`: Promote an existing user to admin.

## Deployment

Flair Eco System is optimized for deployment on **Vercel**. When deploying, ensure all environment variables are correctly configured in the Vercel dashboard.
