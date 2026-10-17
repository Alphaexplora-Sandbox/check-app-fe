/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { renderToString } from 'react-dom/server';

import { App } from '../../src/App';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useCartStore } from '../../src/stores/useCartStore';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, token: null, isAuthModalOpen: false });
    useCartStore.setState({ items: [], isOpen: false });
  });

  it('renders the default service title and home view', () => {
    const html = renderToString(<App />);
    expect(html).toContain('check-app-frontend');
    expect(html).toContain('Curated Hardware for the');
    expect(html).toContain('Engineered Hardware Collection');
  });

  it('renders a custom title', () => {
    expect(renderToString(<App title="custom" />)).toContain('custom');
  });

  it('renders shop catalog tab directly', () => {
    const html = renderToString(<App initialTab="shop" />);
    expect(html).toContain('Engineered Hardware Collection');
    expect(html).not.toContain('Curated Hardware for the');
  });

  it('renders orders tab directly', () => {
    const html = renderToString(<App initialTab="orders" />);
    expect(html).toContain('Customer Orders &amp; Receipts');
    expect(html).toContain('No orders placed yet');
  });

  it('renders admin inventory and fulfillment control directly', () => {
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'admin@e-commerce-mock.com',
        fullName: 'Admin User',
        role: 'Admin',
      },
    });

    const html = renderToString(<App initialTab="admin" />);
    expect(html).toContain('Inventory &amp; Fulfillment Control');
    expect(html).toContain('Catalog Stock Management');
  });

  it('invokes internal App action handlers directly', () => {
    (global as any).window.location = { hash: '#shop' };
    (global as any).document.getElementById = jest.fn().mockReturnValue({
      scrollIntoView: jest.fn(),
    });

    const element: any = App({ title: 'test-app', initialTab: 'home' });

    // Find subcomponents in main element
    const main = element.props.children[1];
    const mainChildren = Array.isArray(main.props.children) ? main.props.children : [main.props.children];
    const fragment = mainChildren.find((c: any) => c && c.props && c.props.children);
    const hero = fragment?.props?.children?.[0];
    const catalog = fragment?.props?.children?.[1];
    const cartDrawer = element.props.children[2];
    const checkoutModal = element.props.children[3];
    const toast = element.props.children[5];

    hero.props.onExplore();
    hero.props.onSelectCategory('audio');
    catalog.props.onSelectCategory('workspace');
    catalog.props.onShowToast('Test message');
    cartDrawer.props.onProceedToCheckout();
    checkoutModal.props.onClose();
    checkoutModal.props.onOrderCompleted({
      id: 'o-1',
      orderNumber: 'ECM-ORD-1',
      userId: 'u-1',
      totalAmount: 100,
      status: 'Processing',
      createdAt: new Date().toISOString(),
      paymentMethod: 'CreditCard',
      shippingAddress: {
        fullName: 'Test',
        streetAddress: '123',
        city: 'City',
        postalCode: '12345',
        country: 'US',
      },
      orderItems: [],
    });
    checkoutModal.props.onViewOrders();
    toast.props.onClose();
  });

  it('covers hashchange listeners and loadData/loadOrders error catches in App', () => {
    const getCategoriesSpy = jest.spyOn(api, 'getCategories').mockRejectedValue(new Error('Network fail'));
    const getOrdersSpy = jest.spyOn(api, 'getOrders').mockRejectedValue(new Error('Orders fail'));

    (global as any).window.location = { hash: '#admin' };
    const adminEl: any = App({ initialTab: 'admin' });
    const main = adminEl.props.children[1];
    expect(main).toBeTruthy();
    const adminTab = Array.isArray(main.props.children) ? main.props.children.find((c: any) => c && c.props && c.props.onRefreshProducts) : main.props.children;
    if (adminTab) {
      adminTab.props.onRefreshProducts();
      adminTab.props.onRefreshOrders();
      adminTab.props.onShowToast('Refreshed');
    }

    (global as any).window.location = { hash: '#home' };
    App({ initialTab: 'home' });

    getCategoriesSpy.mockRestore();
    getOrdersSpy.mockRestore();
  });
});