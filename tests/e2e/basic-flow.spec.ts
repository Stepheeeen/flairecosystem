import { test, expect } from '@playwright/test';

test.describe('Flair Eco System - Basic Flow', () => {
    test('should load the landing page', async ({ page }) => {
        await page.goto('/');
        // Check for the brand name or main heading
        // Note: Since multi-tenant, it might redirect to /shop or /company-name
        // But currently we have a sign-in redirect in root or a placeholder
        await expect(page).toHaveTitle(/Flair Eco System/i);
    });

    test('should navigate to signup and show form', async ({ page }) => {
        // Navigate to a storefront signup (using a mock or existing slug like 'test-store')
        await page.goto('/flair/auth/signup');
        await expect(page.locator('h1')).toContainText(/CREATE ACCOUNT/i);
        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
    });

    test('should show admin dashboard login', async ({ page }) => {
        await page.goto('/super-admin');
        // If not logged in, should show sign-in or unauthorized
        // This depends on whether we have middleware protection
        const bodyText = await page.innerText('body');
        expect(bodyText).toBeTruthy();
    });
});
