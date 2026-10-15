import { test, expect } from '@playwright/test';

test.describe('Authentication Journeys', () => {
  test('login-success: User can sign in with valid credentials and receive JWT session', async ({ page }) => {
    test.info().annotations.push({
      type: 'description',
      description:
        'Customer can sign in with valid credentials. Upon success, JWT Bearer token is stored in localStorage, profile renders in header, and Sign In button disappears.',
    });

    await page.goto('/');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.getByLabel(/email/i).fill('customer@e-commerce-mock.com');
    await page.getByLabel(/password/i).fill('CustomerPass123!');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page.getByText('Customer Demo')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).not.toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('ecommerce_mock_auth_token'));
    expect(token).toBeTruthy();
  });
});
