import { test, expect } from '@playwright/test';

test.describe('E-Commerce Purchasing Journey', () => {
  test('e2e-order-flow: Customer adds item, proceeds through checkout, and verifies database order', async ({
    page,
  }) => {
    test.info().annotations.push({
      type: 'description',
      description:
        'Checkout form sends POST /api/v1/orders/checkout. Transaction creates orders and order_items rows, decrements product stock, and returns order number.',
    });

    await page.goto('/');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByLabel(/email/i).fill('customer@e-commerce-mock.com');
    await page.getByLabel(/password/i).fill('CustomerPass123!');
    await page.getByRole('button', { name: /log in/i }).click();

    await page.getByRole('link', { name: /shop catalog/i }).first().click();
    await page.waitForSelector('[data-testid="product-card"]');

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const productTitle = await firstProduct.locator('h3').textContent();
    await firstProduct.getByRole('button', { name: /add to cart/i }).click();

    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-drawer"]').getByText(productTitle!)).toBeVisible();

    await page.getByRole('button', { name: /proceed to checkout/i }).click();

    await page.getByLabel(/full name/i).fill('Jane Customer');
    await page.getByLabel(/street address/i).fill('742 Evergreen Terrace');
    await page.getByLabel(/city/i).fill('Springfield');
    await page.getByLabel(/postal code/i).fill('97477');

    await page.getByRole('button', { name: /pay & place order/i }).click();

    await expect(page.getByText(/order confirmed/i)).toBeVisible();
    const orderNumberText = await page.locator('[data-testid="confirmed-order-number"]').textContent();
    expect(orderNumberText).toContain('ECM-');

    await page.getByRole('button', { name: /view in orders tab/i }).click();
    await expect(page.getByText(orderNumberText!, { exact: true })).toBeVisible();
  });
});
