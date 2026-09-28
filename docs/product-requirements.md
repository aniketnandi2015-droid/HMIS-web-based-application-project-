# Product requirements

## Purpose

HMIS gives independent pharmacies one place to monitor stock, prioritise expiry risk, and produce replenishment actions.

## First release

- Inventory list with medicine, batch, stock, reorder threshold, and expiry date.
- Rules that flag low stock and products expiring within 90 days.
- Replenishment list generation.
- Responsive browser experience for a pharmacy manager.

## Next milestones

1. Authentication and pharmacy-level access control.
2. Persistent inventory and supplier data backed by an API and database.
3. Sales ingestion and demand forecasting.
4. Audit trail, exports, alerting, and role-based reporting.

## Acceptance criteria

- A manager can identify products to reorder and expiry-risk products without calculation.
- Every change is validated by the automated test and build workflow before merge.
- The production dashboard is automatically published from `main`.
