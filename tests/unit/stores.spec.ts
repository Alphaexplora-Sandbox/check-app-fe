import { useAuthStore } from '../../src/stores/useAuthStore';
import { useCartStore } from '../../src/stores/useCartStore';
import { api, SEED_PRODUCTS } from '../../src/services/api';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, token: null, isLoading: false, error: null });
  });

  it('initializes with default state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoading).toBeFalsy();
    expect(state.error).toBeNull();
  });

  it('logs in successfully with demo customer credentials', async () => {
    await useAuthStore.getState().login('customer@e-commerce-mock.com', 'CustomerPass123!');

    const state = useAuthStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe('customer@e-commerce-mock.com');
    expect(state.user?.role).toBe('Customer');
    expect(state.token).toBeTruthy();
    expect(localStorage.getItem('ecommerce_mock_auth_token')).toBe(state.token);
  });

  it('fails login with invalid credentials', async () => {
    await expect(
      useAuthStore.getState().login('wrong@example.com', 'wrongpassword')
    ).rejects.toThrow();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error).toBeTruthy();
  });

  it('clears session on logout', async () => {
    await useAuthStore.getState().login('customer@e-commerce-mock.com', 'CustomerPass123!');
    expect(useAuthStore.getState().user).not.toBeNull();

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('ecommerce_mock_auth_token')).toBeNull();
  });

  it('restores existing session with initAuth', async () => {
    localStorage.setItem('ecommerce_mock_auth_token', 'mock_jwt_token');
    localStorage.setItem(
      'ecommerce_mock_user',
      JSON.stringify({
        id: '1',
        email: 'admin@e-commerce-mock.com',
        fullName: 'Admin Demo',
        role: 'Admin',
      })
    );

    useAuthStore.getState().initAuth();
    const state = useAuthStore.getState();
    expect(state.user?.role).toBe('Admin');
    expect(state.token).toBe('mock_jwt_token');
  });

  it('opens and closes auth modal', () => {
    expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
    useAuthStore.getState().openAuthModal();
    expect(useAuthStore.getState().isAuthModalOpen).toBe(true);
    useAuthStore.getState().closeAuthModal();
    expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
  });

  it('registers successfully with valid customer details', async () => {
    await useAuthStore.getState().register('newuser@example.com', 'SecurePass123!', 'New User');
    const state = useAuthStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe('newuser@example.com');
    expect(state.token).toBeTruthy();
    expect(state.isAuthModalOpen).toBe(false);
  });

  it('handles registration error gracefully', async () => {
    const registerSpy = jest.spyOn(api, 'register').mockRejectedValue(new Error('Email already registered'));

    await expect(
      useAuthStore.getState().register('bad@example.com', 'pass', 'Bad User')
    ).rejects.toThrow('Email already registered');

    expect(useAuthStore.getState().error).toBe('Email already registered');
    expect(useAuthStore.getState().isLoading).toBe(false);

    // Test non-Error exception
    registerSpy.mockRejectedValue('String rejection');
    await expect(useAuthStore.getState().register('bad@example.com', 'pass', 'Bad User')).rejects.toBe('String rejection');
    expect(useAuthStore.getState().error).toBe('Registration failed.');

    const loginSpy = jest.spyOn(api, 'login').mockRejectedValue('String login error');
    await expect(useAuthStore.getState().login('bad@example.com', 'pass')).rejects.toBe('String login error');
    expect(useAuthStore.getState().error).toBe('Login failed. Please check credentials.');

    registerSpy.mockRestore();
    loginSpy.mockRestore();
  });

  it('handles corrupted user in localStorage gracefully during initAuth', () => {
    localStorage.setItem('ecommerce_mock_auth_token', 'token-123');
    localStorage.setItem('ecommerce_mock_user', 'invalid-json{{{');

    useAuthStore.getState().initAuth();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('handles initAuth when no token exists or when user is absent', () => {
    localStorage.clear();
    useAuthStore.getState().initAuth();
    expect(useAuthStore.getState().token).toBeNull();

    localStorage.setItem('ecommerce_mock_auth_token', 'token-only');
    useAuthStore.getState().initAuth();
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({
      items: [],
      isOpen: false,
      isLoading: false,
      subtotal: 0,
      estimatedTax: 0,
      shippingFee: 15.0,
      totalAmount: 15.0,
    });
  });

  it('adds new product and calculates correct financial breakdown with standard shipping', () => {
    const product = SEED_PRODUCTS[0]; // Price: 299.00 or check product price
    useCartStore.getState().addItem(product, 1);

    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].productId).toBe(product.id);
    expect(state.items[0].quantity).toBe(1);
    expect(state.subtotal).toBe(product.price);

    // Over $150 unlocks free shipping
    if (product.price >= 150) {
      expect(state.shippingFee).toBe(0);
    } else {
      expect(state.shippingFee).toBe(15.0);
    }

    const expectedTax = Math.round(product.price * 0.085 * 100) / 100;
    expect(state.estimatedTax).toBe(expectedTax);
    expect(state.totalAmount).toBe(
      Math.round((product.price + expectedTax + state.shippingFee) * 100) / 100
    );
  });

  it('increments quantity when existing product is added again', () => {
    const product = SEED_PRODUCTS[1];
    useCartStore.getState().addItem(product, 1);
    useCartStore.getState().addItem(product, 2);

    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.subtotal).toBe(Math.round(product.price * 3 * 100) / 100);
  });

  it('updates item quantity and removes if quantity is set to 0', () => {
    const product = SEED_PRODUCTS[0];
    useCartStore.getState().addItem(product, 2);

    const itemId = useCartStore.getState().items[0].id;
    useCartStore.getState().updateItemQuantity(itemId, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);

    useCartStore.getState().updateItemQuantity(itemId, 0);
    expect(useCartStore.getState().items.length).toBe(0);
  });

  it('removes item by id and clears cart completely', () => {
    useCartStore.getState().addItem(SEED_PRODUCTS[0], 1);
    useCartStore.getState().addItem(SEED_PRODUCTS[1], 1);
    expect(useCartStore.getState().items.length).toBe(2);

    const firstItemId = useCartStore.getState().items[0].id;
    useCartStore.getState().removeItem(firstItemId);
    expect(useCartStore.getState().items.length).toBe(1);

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items.length).toBe(0);
    expect(useCartStore.getState().subtotal).toBe(0);
  });

  it('toggles, opens, and closes cart drawer', () => {
    expect(useCartStore.getState().isOpen).toBe(false);

    useCartStore.getState().openCart();
    expect(useCartStore.getState().isOpen).toBe(true);

    useCartStore.getState().closeCart();
    expect(useCartStore.getState().isOpen).toBe(false);

    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it('interacts with api backend when auth token exists', async () => {
    localStorage.setItem('ecommerce_mock_auth_token', 'test-cart-token');

    // fetchCart with token
    await useCartStore.getState().fetchCart();
    expect(useCartStore.getState().isLoading).toBe(false);

    // addItem with token
    await useCartStore.getState().addItem(SEED_PRODUCTS[0], 1);
    expect(useCartStore.getState().items.length).toBeGreaterThan(0);

    const itemId = useCartStore.getState().items[0].id;

    // updateItemQuantity with token
    await useCartStore.getState().updateItemQuantity(itemId, 3);

    // removeItem with token
    await useCartStore.getState().removeItem(itemId);

    // clearCart with token
    await useCartStore.getState().addItem(SEED_PRODUCTS[1], 1);
    await useCartStore.getState().clearCart();
    expect(useCartStore.getState().items.length).toBe(0);
  });

  it('covers cart item quantity update and removal fallback without token', async () => {
    localStorage.removeItem('ecommerce_mock_auth_token');
    await useCartStore.getState().addItem(SEED_PRODUCTS[0], 2);
    const id = useCartStore.getState().items[0].id;
    await useCartStore.getState().updateItemQuantity(id, 4);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
    await useCartStore.getState().updateItemQuantity(id, 0);
    expect(useCartStore.getState().items.length).toBe(0);

    // Remove fallback
    await useCartStore.getState().addItem(SEED_PRODUCTS[1], 1);
    const id2 = useCartStore.getState().items[0].id;
    await useCartStore.getState().removeItem(id2);
    expect(useCartStore.getState().items.length).toBe(0);
  });

});
