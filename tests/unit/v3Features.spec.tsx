import React from 'react';
import { renderToString } from 'react-dom/server';
import { CheckoutModal } from '../../src/components/CheckoutModal';
import { OrdersTab } from '../../src/components/OrdersTab';
import { api } from '../../src/services/api';
import type { Order } from '../../src/types';

describe('Version 3 Features: Saved Cards & Order Tracking/Cancellation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders CheckoutModal with Version 3 Express Checkout badges', () => {
    const html = renderToString(
      <CheckoutModal
        isOpen={true}
        onClose={jest.fn()}
        onOrderCompleted={jest.fn()}
        onViewOrders={jest.fn()}
      />
    );

    expect(html).toContain('Version 3 Feature');
    expect(html).toContain('1-Click Fast Track');
    expect(html).toContain('Atomic Checkout &amp; Express Payment');
    expect(html).toContain('PCI-DSS tokenized sandbox encryption');
  });

  it('supports API saved payment methods management', async () => {
    const initialMethods = await api.getPaymentMethods();
    expect(Array.isArray(initialMethods)).toBe(true);
    expect(initialMethods.length).toBeGreaterThan(0);

    const newCard = await api.createPaymentMethod({
      cardHolderName: 'Test Cardholder',
      cardNumber: '4111222233334444',
      expiryMonth: '11',
      expiryYear: '2030',
      brand: 'Visa',
      isDefault: false,
    });

    expect(newCard.cardNumberMasked).toContain('4444');
    expect(newCard.cardHolderName).toBe('Test Cardholder');

    // Default card update
    const updated = await api.setDefaultPaymentMethod(newCard.id);
    expect(updated.isDefault).toBe(true);

    // Delete card
    await api.deletePaymentMethod(newCard.id);
    const afterDelete = await api.getPaymentMethods();
    expect(afterDelete.some((c) => c.id === newCard.id)).toBe(false);
  });

  it('renders OrdersTab with Version 3 filtering and milestone timeline', () => {
    const sampleOrder: Order = {
      id: 'ord-v3-001',
      userId: 'user-001',
      orderNumber: 'ECM-20261020-V301',
      totalAmount: 299.0,
      status: 'Processing',
      paymentMethod: 'saved_card',
      createdAt: new Date().toISOString(),
      orderItems: [
        {
          id: 'item-01',
          productId: 'prod-01',
          productName: 'Pro Wireless ANC Headphones',
          unitPrice: 299.0,
          quantity: 1,
          subtotal: 299.0,
        },
      ],
    };

    const html = renderToString(
      <OrdersTab orders={[sampleOrder]} onExplore={jest.fn()} />
    );

    expect(html).toContain('Version 3 Milestone');
    expect(html).toContain('ECM-20261020-V301');
    expect(html).toContain('Processing');
    expect(html).toContain('Track Milestone Timeline');
    expect(html).toContain('Cancel &amp; Refund Order');
  });

  it('handles customer self-service order cancellation and milestone tracking', async () => {
    const cancelledOrder = await api.cancelOrder('ord-mock-cancel-123', 'Customer changed mind');
    expect(cancelledOrder.status).toBe('Cancelled');

    const tracking = await api.trackOrder('ord-mock-cancel-123');
    expect(tracking.status).toBe('Cancelled');
    expect(tracking.milestones.some((m) => m.title === 'Order Cancelled')).toBe(true);
  });
});
