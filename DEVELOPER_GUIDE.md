# Developer Guide - Flair Eco System

This guide provides an overview of the Flair Eco System architecture and development patterns.

## Architecture

Flair Eco System is built as a multi-tenant ecommerce platform where a single installation can host multiple independent storefronts.

### Routing

- **Root Route (`/`)**: Currently redirects to the sign-in page.
- **Tenant Routes (`/[companySlug]`)**: Dynamically handles storefronts. Each tenant has its own homepage, product catalog, cart, and admin dashboard under their unique slug.
- **API Routes (`/api`)**: Global API endpoints handling everything from authentication to payment webhooks.

### Multi-Tenancy

Data isolation is enforced at the database level. Most models include a `companyId`. When an admin logs in, their `companyId` is stored in their session, and all subsequent admin API calls use this ID to filter data.

## Key Technologies

- **Next.js 16**: App Router, Server Actions (where applicable), and API Routes.
- **NextAuth.js**: Authentication with Credentials provider.
- **Mongoose**: MongoDB object modeling.
- **Paystack**: Payment processing integration.
- **Cloudinary**: Image and media hosting.
- **Resend**: Transactional email service.
- **Tailwind CSS & shadcn/ui**: Modern, responsive UI components.

## Development Patterns

### API Error Handling

Standardized error responses should return a JSON object with `error` and optional `data` fields.

```typescript
return Response.json(
  { error: "Description of the error", data: null },
  { status: 400 }
)
```

### Authentication Guards

Use the `authOptions` with `getServerSession` in server components or the `useSession` hook in client components to protect routes.

## Scripts & Utilities

The `scripts/` directory contains various maintenance and debug scripts. Always run these with `node` or `tsx` from the project root.

- `scripts/fix-use-client.mjs`: Ensures client components have the "use client" directive.
- `scripts/debug-api.mjs`: Utility for testing API endpoints.
