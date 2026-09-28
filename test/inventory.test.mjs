import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryStatus } from '../public/app.js';

test('an item at its reorder threshold needs replenishment', () => {
  assert.equal(inventoryStatus({ onHand: 10, reorderAt: 10, expiry: '2027-01-01' }), 'Reorder');
});

test('an item expiring within 90 days takes priority', () => {
  assert.equal(inventoryStatus({ onHand: 50, reorderAt: 10, expiry: '2026-10-01' }), 'Expiry risk');
});
