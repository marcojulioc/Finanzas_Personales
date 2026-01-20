import { test, expect } from '@playwright/test';

test.describe('Transactions Page', () => {
    test('should redirect unauthenticated users to login from transactions page', async ({ page }) => {
        await page.goto('/transactions');
        await expect(page.url()).toContain('/login');
    });

    // Note: The following tests require authentication setup.
    // They are skipped until auth fixtures are configured.
    // To enable: set up a test user and authentication fixture.

    test.describe('Authenticated User', () => {
        test.skip('should display transactions page title', async ({ page }) => {
            // Requires auth fixture
            await page.goto('/transactions');
            await expect(page.locator('h1')).toContainText('Movimientos');
        });

        test.skip('should show filters section', async ({ page }) => {
            await page.goto('/transactions');
            await expect(page.getByPlaceholder('Buscar...')).toBeVisible();
            await expect(page.getByText('Todas las cuentas')).toBeVisible();
            await expect(page.getByText('Todos los tipos')).toBeVisible();
        });

        test.skip('should open new transaction form when clicking button', async ({ page }) => {
            await page.goto('/transactions');
            await page.getByRole('button', { name: /nuevo/i }).click();
            await expect(page.getByText('Nueva Transacción')).toBeVisible();
        });

        test.skip('should show transaction type tabs in form', async ({ page }) => {
            await page.goto('/transactions');
            await page.getByRole('button', { name: /nuevo/i }).click();
            await expect(page.getByRole('tab', { name: 'Gasto' })).toBeVisible();
            await expect(page.getByRole('tab', { name: 'Ingreso' })).toBeVisible();
            await expect(page.getByRole('tab', { name: 'Ajuste' })).toBeVisible();
        });

        test.skip('should close form when clicking cancel', async ({ page }) => {
            await page.goto('/transactions');
            await page.getByRole('button', { name: /nuevo/i }).click();
            await page.getByRole('button', { name: 'Cancelar' }).click();
            await expect(page.getByText('Nueva Transacción')).not.toBeVisible();
        });

        test.skip('should show validation errors for empty form submission', async ({ page }) => {
            await page.goto('/transactions');
            await page.getByRole('button', { name: /nuevo/i }).click();
            await page.getByRole('button', { name: 'Guardar' }).click();
            // Expect validation errors
            await expect(page.getByText(/cuenta es requerida/i)).toBeVisible();
        });

        test.skip('should filter transactions by type', async ({ page }) => {
            await page.goto('/transactions');
            await page.getByText('Todos los tipos').click();
            await page.getByRole('option', { name: 'Ingresos' }).click();
            // Verify URL or filtered results
            await expect(page.url()).toContain('type=INCOME');
        });

        test.skip('should search transactions', async ({ page }) => {
            await page.goto('/transactions');
            await page.getByPlaceholder('Buscar...').fill('test');
            // Wait for search debounce and results
            await page.waitForTimeout(500);
            // Verify search applied
        });

        test.skip('should clear filters', async ({ page }) => {
            await page.goto('/transactions?type=INCOME&search=test');
            await page.getByRole('button', { name: 'Limpiar' }).click();
            await expect(page.getByPlaceholder('Buscar...')).toHaveValue('');
        });

        test.skip('should navigate pagination', async ({ page }) => {
            await page.goto('/transactions');
            // Assuming there are multiple pages
            const nextButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-chevron-right') });
            if (await nextButton.isEnabled()) {
                await nextButton.click();
                await expect(page.url()).toContain('page=2');
            }
        });
    });
});

test.describe('Dashboard Page', () => {
    test('should redirect unauthenticated users to login from dashboard', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page.url()).toContain('/login');
    });

    test.describe('Authenticated User', () => {
        test.skip('should display dashboard stats cards', async ({ page }) => {
            await page.goto('/dashboard');
            await expect(page.getByText('Balance Total')).toBeVisible();
            await expect(page.getByText('Ingresos')).toBeVisible();
            await expect(page.getByText('Gastos')).toBeVisible();
            await expect(page.getByText('Ahorro')).toBeVisible();
        });

        test.skip('should display recent transactions section', async ({ page }) => {
            await page.goto('/dashboard');
            await expect(page.getByText('Movimientos Recientes')).toBeVisible();
        });

        test.skip('should display expenses by category section', async ({ page }) => {
            await page.goto('/dashboard');
            await expect(page.getByText('Gastos por Categoría')).toBeVisible();
        });

        test.skip('should navigate to transactions from recent transactions link', async ({ page }) => {
            await page.goto('/dashboard');
            await page.getByRole('link', { name: 'Ver Todo' }).click();
            await expect(page.url()).toContain('/transactions');
        });
    });
});

test.describe('Budgets Page', () => {
    test('should redirect unauthenticated users to login from budgets', async ({ page }) => {
        await page.goto('/budgets');
        await expect(page.url()).toContain('/login');
    });

    test.describe('Authenticated User', () => {
        test.skip('should display budgets page title', async ({ page }) => {
            await page.goto('/budgets');
            await expect(page.locator('h1')).toContainText('Presupuestos');
        });

        test.skip('should show month selector', async ({ page }) => {
            await page.goto('/budgets');
            // Check for month navigation buttons
            await expect(page.locator('button svg.lucide-chevron-left')).toBeVisible();
            await expect(page.locator('button svg.lucide-chevron-right')).toBeVisible();
        });

        test.skip('should open new budget form', async ({ page }) => {
            await page.goto('/budgets');
            await page.getByRole('button', { name: /nuevo/i }).click();
            await expect(page.getByText('Nuevo Presupuesto')).toBeVisible();
        });
    });
});
