import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page.url()).toContain('/login');
        // Login page has main heading about personal finances
        await expect(page.locator('h1')).toContainText('finanzas');
    });

    // Note: To test successful login we need a seed user or mock auth.
    // For now we verify the protection mechanism.
});
