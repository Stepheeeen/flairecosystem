# Database Setup - Flair Eco System

Flair Eco System uses MongoDB for its data storage and Mongoose as an ODM (Object Data Modeling) library.

## Configuration

The database connection is managed in `lib/db.ts`. It uses a global cache to reuse the connection across Next.js API routes, preventing exhaustion of database connections.

### Connection String

Ensure your `MONGODB_URI` in `.env.local` follows this format:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/vellion?retryWrites=true&w=majority
```

## Data Models

The models are defined in `lib/models/`:

- **User**: Stores user profiles, authentication details, and roles (customer, admin, super_admin).
- **Company**: Represents a storefront tenant on the platform.
- **Product**: Catalog items belonging to a specific company.
- **Order**: Customer purchases, linked to a user and a company.
- **Review**: Product reviews from customers.
- **Notification**: In-app notifications for admins and customers.
- **PlatformSettings**: Global platform configurations (Super Admin only).

## Seeding Data

While there isn't a dedicated seed script yet, you can create your first company and products through the Admin Dashboard once you've set up an admin user.

## Multi-Tenancy Logic

Multi-tenancy is achieved by including a `companyId` (referencing the `Company` model) in the `User`, `Product`, `Order`, and `Notification` models. API routes must always filter by `companyId` to ensure data isolation.
