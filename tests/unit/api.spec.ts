import { api, resolveApiBase, SEED_CATEGORIES, SEED_PRODUCTS } from '../../src/services/api';

describe('api service and seed catalog', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exposes well-formed seed categories and products', () => {
    expect(SEED_CATEGORIES.length).toBeGreaterThanOrEqual(3);
    expect(SEED_PRODUCTS.length).toBeGreaterThanOrEqual(8);

    for (const cat of SEED_CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.slug).toBeTruthy();
    }

    for (const prod of SEED_PRODUCTS) {
      expect(prod.id).toBeTruthy();
      expect(prod.name).toBeTruthy();
      expect(prod.price).toBeGreaterThan(0);
      expect(prod.categoryId).toBeTruthy();
    }
  });

  it('retrieves categories through api.getCategories', async () => {
    const categories = await api.getCategories();
    expect(categories.length).toBe(SEED_CATEGORIES.length);
    expect(categories[0].name).toBe(SEED_CATEGORIES[0].name);
  });

  it('retrieves products with search and category filtering', async () => {
    const all = await api.getProducts();
    expect(all.length).toBe(SEED_PRODUCTS.length);

    const filtered = await api.getProducts({ category: 'audio' });
    expect(filtered.every((p) => p.categorySlug === 'audio' || p.categoryId === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')).toBe(true);

    const searched = await api.getProducts({ search: 'Headphones' });
    expect(searched.length).toBeGreaterThan(0);
    expect(searched[0].name).toContain('Headphones');

    const byId = await api.getProductById(SEED_PRODUCTS[0].id);
    expect(byId).not.toBeNull();
    expect(byId?.id).toBe(SEED_PRODUCTS[0].id);

    const notFound = await api.getProductById('invalid-id');
    expect(notFound).toBeNull();
  });

  it('handles customer login and registration with local fallback', async () => {
    const loginRes = await api.login('customer@e-commerce-mock.com', 'CustomerPass123!');
    expect(loginRes.token).toBeTruthy();
    expect(loginRes.user.email).toBe('customer@e-commerce-mock.com');
    expect(loginRes.user.role).toBe('Customer');

    await expect(api.login('unknown@test.com', 'wrong')).rejects.toThrow();

    const regRes = await api.register('newuser@example.com', 'Password123!', 'New Customer');
    expect(regRes.token).toBeTruthy();
    expect(regRes.user.email).toBe('newuser@example.com');
  });

  it('handles cart operations and local synchronization', async () => {
    const cart = await api.getCart();
    expect(cart.items).toEqual([]);

    const added = await api.addToCart(SEED_PRODUCTS[0].id, 2);
    expect(added.items.length).toBe(1);
    expect(added.items[0].quantity).toBe(2);

    const updated = await api.updateCartItem(added.items[0].id, 4);
    expect(updated.items[0].quantity).toBe(4);

    const removed = await api.removeCartItem(added.items[0].id);
    expect(removed.items.length).toBe(0);

    await api.addToCart(SEED_PRODUCTS[1].id, 1);
    await api.clearCart();
    const finalCart = await api.getCart();
    expect(finalCart.items.length).toBe(0);
  });

  it('handles checkout submission and orders querying', async () => {
    // Add item to cart first
    await api.addToCart(SEED_PRODUCTS[0].id, 1);

    const orderRes = await api.checkout({
      fullName: 'John Doe',
      streetAddress: '123 Main St',
      city: 'Metropolis',
      postalCode: '10001',
      country: 'US',
    });

    expect(orderRes.orderNumber).toContain('ECM-');
    expect(orderRes.totalAmount).toBeGreaterThan(0);
    expect(orderRes.orderItems.length).toBe(1);

    const orders = await api.getOrders();
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.some((o) => o.orderNumber === orderRes.orderNumber)).toBe(true);
  });

  it('handles admin stock and status modifications', async () => {
    const product = SEED_PRODUCTS[0];
    const updated = await api.updateStock(product.id, 99);
    expect(updated.stockQuantity).toBe(99);

    const orderRes = await api.checkout({
      fullName: 'Admin Tester',
      streetAddress: '456 Tech Ave',
      city: 'Silicon Valley',
      postalCode: '94025',
      country: 'US',
    });

    const statusUpdated = await api.updateOrderStatus(orderRes.id, 'Shipped');
    expect(statusUpdated.status).toBe('Shipped');
  });

  it('handles admin credentials and getMe session verification', async () => {
    const adminRes = await api.login('admin@e-commerce-mock.com', 'AdminPass123!');
    expect(adminRes.user.role).toBe('Admin');

    localStorage.setItem('ecommerce_mock_user', JSON.stringify(adminRes.user));
    const me = await api.getMe();
    expect(me.email).toBe('admin@e-commerce-mock.com');
  });

  it('covers server response pathways when fetch succeeds', async () => {
    expect(api).toBeDefined();
    const origFetch = global.fetch;
    const mockData = { test: true };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    }) as unknown as typeof fetch;

    try {
      await api.getCategories();
      await api.getProducts({ category: 'all', search: 'x' });
      await api.getProductById('prod-1');
      await api.getCart();
      await api.addToCart('prod-1', 2);
      await api.updateCartItem('item-1', 3);
      await api.removeCartItem('item-1');
      await api.clearCart();
      await api.checkout({
        fullName: 'Test User',
        streetAddress: '123 Test',
        city: 'City',
        postalCode: '12345',
        country: 'US',
      });
      await api.getOrders();
      await api.updateOrderStatus('ord-1', 'Delivered');
      await api.updateStock('prod-1', 50);
      await api.login('customer@e-commerce-mock.com', 'CustomerPass123!');
      await api.register('user@test.com', 'pass', 'Name');
      await api.getMe();
    } finally {
      global.fetch = origFetch;
    }
  });

  it('covers server response error pathways when fetch returns non-ok status', async () => {
    const origFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Server rejected' }),
    }) as unknown as typeof fetch;

    try {
      // Offline fallbacks trigger on non-ok responses
      await api.getCategories();
      await api.getProducts();
      await api.getProductById(SEED_PRODUCTS[0].id);
      await api.getCart();
      await api.addToCart(SEED_PRODUCTS[0].id, 1);
      await api.updateStock(SEED_PRODUCTS[0].id, 10);

      // Errors thrown on invalid auth
      await expect(api.login('unknown@bad.com', 'bad')).rejects.toThrow('Server rejected');
      await expect(api.register('bad@bad.com', 'bad', 'Bad')).rejects.toThrow('Server rejected');
    } finally {
      global.fetch = origFetch;
    }
  });

  it('covers duplicate cart item addition and zero quantity removal in local mode', async () => {
    await api.clearCart();
    await api.addToCart(SEED_PRODUCTS[0].id, 1);
    const secondAdd = await api.addToCart(SEED_PRODUCTS[0].id, 2);
    expect(secondAdd.items[0].quantity).toBe(3);

    const zeroUpdate = await api.updateCartItem(secondAdd.items[0].id, 0);
    expect(zeroUpdate.items.length).toBe(0);

    localStorage.clear();
    await expect(api.getMe()).rejects.toThrow('Unauthorized');
  });

  it('covers remaining branches in api service', async () => {
    // 1. register with empty fullName fallback
    const regNoName = await api.register('noname@test.com', 'Pass123!', '');
    expect(regNoName.user.fullName).toBe('noname');

    // 2. updateStock not found
    await expect(api.updateStock('non-existent-id', 10)).rejects.toThrow('Product not found');

    // 3. addToCart with non-existent product in local fallback
    await expect(api.addToCart('non-existent-prod-id', 1)).rejects.toThrow('Product not found');

    // 4. getProducts with sortBy, category match by categoryName
    const sortRating = await api.getProducts({ sortBy: 'rating', category: 'Audio & Acoustics' });
    expect(sortRating.length).toBeGreaterThan(0);

    // 5. search matches description and categoryName
    const descMatch = await api.getProducts({ search: 'noise cancelling' });
    expect(descMatch.length).toBeGreaterThan(0);

    const catNameMatch = await api.getProducts({ search: 'acoustic' });
    expect(catNameMatch.length).toBeGreaterThan(0);

    // 6. getCart with shipping fee when subtotal is between 1 and 149
    await api.clearCart();
    await api.addToCart(SEED_PRODUCTS[5].id, 1);
    const cartLow = await api.getCart();
    expect(cartLow.shippingFee).toBe(15.0);

    // 7. updateCartItem for item not found in cart
    await api.updateCartItem('unknown-item-id', 5);

    // 8. updateOrderStatus for order not found
    await expect(api.updateOrderStatus('unknown-order-id', 'Shipped')).rejects.toThrow('Order not found');

    // 9. error without message in login / register
    const origFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    try {
      await expect(api.login('custom@bad.com', 'bad')).rejects.toThrow('Invalid credentials');
      await expect(api.register('custom@bad.com', 'bad', 'Name')).rejects.toThrow('Registration failed');
    } finally {
      global.fetch = origFetch;
    }
  });

  it('covers server response branches with varied inputs', async () => {
    const origFetch = global.fetch;
    try {
      global.fetch = jest.fn().mockImplementation(async (url: string) => {
        if (url.includes('/auth/login') || url.includes('/auth/register')) {
          return { ok: true, json: async () => ({ token: 'mock-t', user: { id: 'u1', role: 'Customer' } }) };
        }
        if (url.includes('/auth/me')) {
          return { ok: true, json: async () => ({ id: 'u1', email: 'test@me.com' }) };
        }
        if (url.includes('/products?')) {
          return { ok: true, json: async () => SEED_PRODUCTS };
        }
        if (url.includes('/cart')) {
          return { ok: true, json: async () => ({ items: [], subtotal: 0, estimatedTax: 0, shippingFee: 0, totalAmount: 0 }) };
        }
        if (url.includes('/orders')) {
          return { ok: true, json: async () => [] };
        }
        return { ok: true, json: async () => ({}) };
      }) as unknown as typeof fetch;

      localStorage.setItem('ecommerce_mock_auth_token', 'valid-token');
      await api.getMe();
      await api.getProducts({ sortBy: 'price-desc' });
      await api.addToCart('prod-1', 1);
      await api.updateCartItem('item-1', 2);
      await api.removeCartItem('item-1');
      await api.clearCart();
      await api.checkout({ fullName: 'Buyer', streetAddress: '123', city: 'C', postalCode: '1', country: 'US' });
      await api.getOrders();
      await api.updateOrderStatus('ord-1', 'Processing');
      expect(localStorage.getItem('ecommerce_mock_auth_token')).toBe('valid-token');
    } finally {
      global.fetch = origFetch;
    }
  });


  it('covers remaining branches in api.ts', async () => {
    // 1. addToCart with quantity defaulting
    await api.clearCart();
    await api.addToCart(SEED_PRODUCTS[0].id);

    // 2. updateCartItem with negative or zero quantity
    const cart = await api.getCart();
    const id = cart.items[0].id;
    await api.updateCartItem(id, -1);
    const cartAfter = await api.getCart();
    expect(cartAfter.items.length).toBe(0);

    // 3. getProducts with rating sort
    const ratingSorted = await api.getProducts({ sortBy: 'rating' });
    expect(ratingSorted.length).toBeGreaterThan(0);
  });


  it('covers resolveApiBase host routing branches for uat and vercel.app', () => {
    const origWindow = global.window;
    try {
      (global as any).window = { location: { hostname: 'uat-check-app-frontend.vercel.app' } };
      // Test with uat host
      expect(resolveApiBase()).toContain('check-app-backend-uat.onrender.com');

      (global as any).window = { location: { hostname: 'check-app-frontend.vercel.app' } };
      expect(resolveApiBase()).toContain('check-app-backend-main.onrender.com');
    } finally {
      global.window = origWindow;
    }
  });

});
