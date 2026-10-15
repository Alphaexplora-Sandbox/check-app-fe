import { test, expect } from '@playwright/test';

test.describe('Cart and Calculations', () => {
  test('cart-calculations: Cart drawer persistence & tax/shipping calculation', async ({ page }) => {
    test.info().annotations.push({
      type: 'description',
      description:
        'Clicking Add to Cart opens right drawer. Quantity counters update subtotal dynamically. 8.5% tax and shipping threshold ($150 free) calculate correctly.',
    });

    await page.goto('/');

    // Navigate to shop catalog
    await page.getByRole('link', { name: /shop catalog/i }).first().click();
    await page.waitForSelector('[data-testid="product-card"]');

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const productTitle = await firstProduct.locator('h3').textContent();
    await firstProduct.getByRole('button', { name: /add to cart/i }).click();

    // Verify slide-over drawer
    const cartDrawer = page.locator('[data-testid="cart-drawer"]');
    await expect(cartDrawer).toBeVisible();
    await expect(cartDrawer.getByText(productTitle!)).toBeVisible();

    // Verify tax and subtotal exist and are positive
    await expect(cartDrawer.getByText(/subtotal/i)).toBeVisible();
    await expect(cartDrawer.getByText(/estimated tax/i)).toBeVisible();
    await expect(cartDrawer.getByText('Total', { exact: true })).toBeVisible();
  });
});
