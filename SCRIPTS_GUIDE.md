# Utility Scripts Guide

This directory contains various utility scripts for database management, refactoring, and debugging.

## Authentication & User Management

### `create-super-admin.mjs`
Creates a brand new super admin user in the database.
- **Usage**: `node scripts/create-super-admin.mjs <name> <email> <password>`
- **Note**: Ensure `MONGODB_URI` is set in `.env.local`.

### `make-super-admin.mjs`
Promotes an existing user (by email) to the `super_admin` role.
- **Usage**: `node scripts/make-super-admin.mjs <user_email>`

### `promote-admin.js`
A CommonJS version of the promotion script that sets a user's role to `super_admin`.
- **Usage**: `node scripts/promote-admin.js <email>`

### `reset-password.mjs`
Resets the password for any user in the database.
- **Usage**: `node scripts/reset-password.mjs <email> <new_password>`

---

## Database Utilities

### `check-companies.mjs`
Lists all companies currently registered in the `companies` collection.
- **Usage**: `node scripts/check-companies.mjs`
- **Output**: Logs company slugs and their MongoDB IDs.

---

## Refactoring & Maintenance

### `rebrand.mjs`
Performs a global replacement of "Vellion" with "Flair Eco System" and updates domain references to `flairecosystem.com`.
- **Usage**: `node scripts/rebrand.mjs`

### `refactor-links.mjs`
Refactors hardcoded company slug links (e.g., `/${companySlug}/products`) to use the `getStoreUrl` utility.
- **Usage**: `node scripts/refactor-links.mjs`

### `fix-use-client.mjs`
Ensures the `"use client"` directive is positioned at the very top of specific frontend files to prevent Next.js compilation issues.
- **Usage**: `node scripts/fix-use-client.mjs`

### `fix-ts-errors.mjs`
Automatically patches common TypeScript serialization errors in API routes.
- **Usage**: `node scripts/fix-ts-errors.mjs`

### `refactor-errors.mjs`
Standardizes API error responses to ensure they always return a `data` field with the error details.
- **Usage**: `node scripts/refactor-errors.mjs`

---

## Debugging

### `test-api.mjs`
A simple script to test the `/api/products` endpoint via `axios`.
- **Usage**: `node scripts/test-api.mjs`

### `debug-api.mjs`
Tests the company-specific API endpoint (defaults to `vellion`).
- **Usage**: `node scripts/debug-api.mjs`
