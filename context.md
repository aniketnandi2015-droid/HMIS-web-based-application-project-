# PharmaAssist - Coding Agent Context

## 0. Document role

This file is the repository-level implementation context for coding agents working on PharmaAssist.

It converts the approved intent of the PharmaAssist SRS and SDD into an operational context for coding, debugging, testing, code review, CI/CD, GitHub, and Vercel deployment.

This file is not a replacement for the SRS or SDD.

- The **SRS** defines what the system shall do and the measurable quality requirements.
- The **SDD** defines how the system is logically designed, including BPMN, DFD, sequence flow, domains, data design, synchronization, UI/UX, and interface behavior.
- This file defines how a coding agent shall implement that design using the selected technology stack.
- Explicit user implementation decisions in the development brief override technology choices that were previously left open in the SDD, while business scope and requirements remain governed by the SRS.

Source baselines:
- `SRS(6).md`, PharmaAssist SRS v2.1
- `PharmaAssist_Software_Design_Document_with_Sequence_Diagram(1).docx`, PharmaAssist SDD v0.1
- As-Is and To-Be process maps referenced by the SDD
- Sequence flow and DFD design set referenced by the SDD

---

## 1. Product identity

**Product:** PharmaAssist

**Purpose:** A mobile-first, web-based pharmacy counter application for one salesperson/operator. It replaces a manual, paper- and memory-based workflow with a connected workflow for drug search, stock and batch verification, substitute identification, requirement and safety checking, pricing and discount calculation, dispatch, transaction-history logging, supplier procurement, and one operational Insights screen.

The SDD explicitly defines a single-operator product and a PWA/browser-first operating model. It also separates deterministic safety/reference checking from operational AI assistance.

Primary operator:
- Salesperson / pharmacy counter operator

External participants:
- Customer
- Supplier
- Drug reference source
- Notification provider

There is no second application-user role in the first release.

---

## 2. Normative source hierarchy

When information conflicts, use this order:

1. Explicit current user implementation constraints in the task.
2. SRS requirements, constraints, business rules, assumptions, and open items.
3. SDD architecture, domain design, data dictionary, interfaces, UI/UX, sequence flow, and traceability.
4. Existing code and tests, unless they contradict a higher-level source.
5. Agent inference.

Agents must not silently resolve a conflict. Record an ADR or issue when a decision changes behavior, architecture, data, or acceptance criteria.

Examples:
- The SDD leaves the frontend framework open. The development brief selects Node.js-based web development, Supabase backend, GitHub, and Vercel. These are implementation decisions for the build.
- The SRS remains the authority for requirements such as single-operator scope, no payment processing, mobile-first behavior, offline continuity, safety checking, and the measurable NFRs.
- Do not change an SRS requirement merely because a framework makes it inconvenient to implement.

---

## 3. Fixed implementation baseline

### 3.1 Frontend

Use a Node.js-based frontend stack:

- Node.js **20 LTS or newer supported LTS**
- TypeScript
- Next.js with React
- Responsive CSS using the selected project styling approach
- PWA support using a standards-compliant web manifest and service worker
- Browser APIs for camera and scanner fallback
- Supabase browser client for authenticated application data access

The browser executes React/TypeScript. Node.js is the development/build/server runtime for the web application.

### 3.2 Backend

Use Supabase as the backend platform:

- Supabase PostgreSQL as the authoritative operational data store
- Supabase Auth for the single operator login/session
- Row Level Security for data access boundaries
- PostgreSQL functions/RPC for atomic domain operations that require transaction integrity
- Supabase Edge Functions for server-side integrations or jobs where database RPC is not appropriate
- Supabase migrations as the schema source of truth
- Supabase seed data only for non-production development/test fixtures

Never expose the Supabase service-role key in browser code.

### 3.3 Hosting and delivery

- GitHub is the source-control repository.
- Vercel is the live application hosting/deployment target for the web frontend.
- Supabase hosts the backend data/auth/function layer.
- Production secrets must be stored in platform secret/environment-variable stores, never committed to Git.
- Vercel preview deployments are used for pull-request validation where available.

### 3.4 Logical architecture preservation

The first implementation may be a modular monolith. It must preserve the logical service/domain boundaries defined by the SDD even when multiple modules are deployed together.

Preserve these logical boundaries:

- Authentication
- Search and matching
- Stock and batch
- Safety and requirement checks
- Pricing and discount
- Dispatch and transaction
- Procurement
- Analytics and recommendations
- Synchronization
- Notifications
- Operational database
- Insights read model

Do not create microservices merely for architectural appearance.

---

## 4. Non-negotiable scope controls

### In scope

- Mobile-first browser delivery and PWA installation
- Single-operator login
- Structured drug search by brand, generic/salt name, dosage, and form
- Camera or keyboard-wedge barcode/QR scanning
- Exact stock and batch/lot lookup
- Near-expiry and low-stock identification
- Ranked substitute recommendations
- Prescription-sighting capture where applicable
- Contraindication/reference-data checks before dispatch
- Price and discount calculation
- Atomic dispatch, stock decrement, and transaction-history logging
- No-match and unmet-demand capture
- Supplier records
- Purchase orders and purchase receipts
- Supplier lead-time and quality history
- Procurement recommendations
- Transaction history and optional receipt printing
- Demand forecasting with cold-start fallback
- Cross-sell suggestions
- One operational Insights screen
- Offline operation and synchronization
- CSV-equivalent export and drug-master import
- English plus at least one additional regional language
- Device/session security

### Explicitly out of scope

- Multiple application users
- Role-based access control or role hierarchy
- Manager/admin accounts
- Payment collection or payment gateways
- UPI/card/net-banking/payment-token processing
- External e-prescription integration
- ABDM or national health-data exchange
- Insurance claim adjudication
- Home delivery/courier tracking
- Multi-store consolidation
- Enterprise BI/reporting modules
- Supplier portal
- AI-generated clinical interaction/contraindication rules
- Automatic regulatory classification of drug schedules beyond configured master-data tagging

Do not introduce out-of-scope functionality unless the product owner explicitly changes the SRS scope.

---

## 5. Core design principles

1. **Requirement traceability**
   Every significant implementation element must map to at least one SRS requirement or an explicitly recorded technical decision.

2. **Single authoritative stock ledger**
   Stock quantity is written only through:
   - dispatch,
   - purchase receipt,
   - explicit operator stock adjustment.

   No UI component may directly mutate stock quantity.

3. **Atomic dispatch**
   Dispatch, stock decrement, transaction creation, transaction-item creation, and leakage flags must succeed or fail as one controlled operation.

4. **Safety separation**
   Contraindication and interaction checking uses a selected reference dataset and deterministic rules. Generative AI must not author clinical rules.

5. **Human decision remains in the loop**
   Recommendation features suggest. The operator decides. The application must not auto-dispatch a substitute, auto-add a cross-sell item, or auto-approve a procurement order.

6. **Offline continuity**
   The local device may operate from a cached read model and queued mutations. The central Supabase data layer remains authoritative after synchronization.

7. **No second source of truth**
   Local state is a cache/staging layer, not a competing authoritative database.

8. **Explainable assistance**
   Recommendations should expose useful operational basis such as stock state, demand history, co-purchase frequency, lead time, or supplier history.

9. **One-screen Insights**
   Insights is an operational screen, not a multi-tab enterprise dashboard.

10. **Config-driven master data**
    Routine drug, supplier, threshold, language, notification, and movement-band changes should be data/configuration changes, not code edits.

---

## 6. Requirements map

### 6.1 Platform

- `FR-PLT-01`: mobile-first browser delivery
- `FR-PLT-02`: responsive layout from 360 px through desktop
- `FR-PLT-03`: touch targets at least 44 x 44 CSS px with at least 8 px spacing
- `FR-PLT-04`: installable PWA and offline shell/cache
- `FR-PLT-05`: browser-camera barcode/QR scanning with manual or keyboard-wedge fallback
- `FR-PLT-06`: cross-browser/device capability detection and explicit fallback messaging

### 6.2 POS

- `FR-POS-01`: structured drug search
- `FR-POS-02`: contraindication flag before dispatch
- `FR-POS-03`: exact stock, batch, and expiry lookup
- `FR-POS-04`: substitute recommendation based on same generic/salt and strength, availability, and expiry eligibility
- `FR-POS-05`: unit price, discount, and extended price
- `FR-POS-06`: atomic dispatch and stock update
- `FR-POS-07`: no-match/no-stock path with unmet-demand logging
- `FR-POS-08`: discount exception/leakage flag, not approval gating
- `FR-POS-09`: side-effect and usage-direction reference

### 6.3 Inventory

- `FR-INV-01`: single authoritative stock ledger
- `FR-INV-02`: batch/lot and receipt fields
- `FR-INV-03`: barcode/QR-assisted stock-in and dispatch
- `FR-INV-04`: stock adjustment with reason code
- `FR-INV-05`: near-expiry rule and exclusion of expired stock from substitutes
- `FR-INV-06`: low-stock threshold

### 6.4 Procurement

- `FR-PROC-01`: procurement recommendation list
- `FR-PROC-02`: supplier and lead-time history
- `FR-PROC-03`: purchase order and receipt workflow
- `FR-PROC-04`: supplier quality scoring
- `FR-PROC-05`: low-stock notification

### 6.5 Transactions and analytics

- `FR-TXN-01`: transaction history
- `FR-TXN-02`: optional printed receipt
- `FR-TXN-03`: revenue-leakage flag
- `FR-ANL-01`: sales trend
- `FR-ANL-02`: demand forecast by drug and visit type
- `FR-ANL-03`: up to three cross-sell suggestions
- `FR-ANL-04`: fast/moderate/slow movement classification
- `FR-ANL-05`: supplier performance view
- `FR-ANL-06`: one-screen Insights view

### 6.6 Security and localization

- `FR-SEC-01`: one device/app-level operator login
- `FR-I18N-01`: English plus at least one regional language without rebuilding the application per language

---

## 7. Non-functional acceptance baseline

The agent must treat these as executable acceptance targets, not merely descriptive text.

### Performance

- `NFR-PERF-01`: drug search and stock response MUST be <= 3 s for 95% of 500 representative searches. PLAN <= 1.5 s.
- `NFR-PERF-02`: dispatch transaction MUST be <= 2 s for 99% of 500 transactions. PLAN <= 1 s.
- `NFR-PERF-03`: low-stock notification delivery MUST be <= 15 min. PLAN <= 5 min.
- `NFR-PERF-04`: mobile cold first-load LCP MUST be <= 4 s at 75th percentile, repeat launch <= 2 s, and INP for key interaction <= 200 ms at 75th percentile.

### Availability and degraded operation

- `NFR-AVL-01`: at least 99.0% usable transaction workflow during store operating minutes.
- `NFR-DEG-01`: SRS MUST is 2 hours of internet loss; PLAN is 4 hours; WISH is 8 hours. Test the MUST threshold and target the PLAN threshold when feasible.
- Offline conflicts use the stated last-write-wins strategy on the stock ledger and surface a conflict flag.

### Accuracy and reliability

- `NFR-ACC-01`: at least 98% stock-ledger agreement with sampled physical counts.
- `NFR-REL-01`: forecast MAPE MUST be no worse than 40% for eligible, non-cold-start drugs.

### Security

- `NFR-SEC-01`: 100% authentication/session exchanges encrypted; credentials salted and hashed; production security review before go-live.
- `NFR-SEC-02`: lock after 5 failed attempts for at least 15 minutes.

### Safety

- `NFR-SAFE-01`: 100% of dispatches attempt the contraindication check; at least 95% of known test conflicts are flagged at MUST level.
- `NFR-SAFE-02`: no hard alert ceiling; >15 alerts per 100 transactions triggers a tuning review.

### Usability

- `NFR-USE-01`: at least 80% first-real-transaction unassisted success after walkthrough, measured on at least 5 new users.
- `NFR-USE-02`: one Insights screen, zero additional tabs, scannable in under 60 seconds at MUST level.
- `NFR-USE-03`: all listed phone tasks must be completable at 360 px width with touch; no more than 1 mis-tap on dispatch/discount per 50 transactions at MUST level.

### Maintainability

- `NFR-MAINT-01`: routine drug, supplier, and threshold changes must not require a code change. Bulk import is the PLAN-level expectation.

---

## 8. Key business rules

- `BR-01`: configurable reorder threshold, default 10 units or 7-day supply at trailing average velocity, whichever is greater.
- `BR-02`: default discount reference ceiling is 5% off list price. Above-ceiling discounts are recorded and flagged, not blocked.
- `BR-03`: near-expiry threshold defaults to 90 days and is configurable.
- `BR-04`: default demand forecast horizon is 7 days.
- `BR-05`: provisional forecast eligibility threshold is 30 transaction-days. Final value requires model validation.
- `BR-06`: fast/moderate/slow movement bands are configurable and tuned during pilot.
- `BR-07`: prescription-category drugs require recording of valid prescription sighting before dispatch, subject to jurisdiction-specific confirmation.
- `BR-08`: incidental customer personal data is retained only as needed for stated functions.
- `BR-09`: stock ledger and transaction log are retained for the applicable statutory period once jurisdiction is confirmed.

---

## 9. Data model baseline

Implement the SDD entities as relational Supabase tables or closely equivalent relational structures.

### Master and reference

`DrugMaster`
- `drugId`
- `brandName`
- `genericName`
- `strength`
- `dosageForm`
- `scheduleCategory`
- `listPrice`
- `dosageDirection`
- `commonSideEffects`
- `identifiers`
- `active`

`ContraindicationReference`
- `referenceId`
- `version`
- `drugKey`
- `conditionKey`
- `interactionType`
- `severity`
- `sourceDate`

Do not invent clinical rules inside application code.

### Inventory

`StockBatch`
- `stockBatchId`
- `drugId`
- `batchNumber`
- `lotNumber`
- `manufacturingDate`
- `expiryDate`
- `quantityOnHand`
- `reorderThreshold`
- `receivedFromSupplierId`
- `lastUpdatedAt`
- `stockVersion`

`StockAdjustment`
- `adjustmentId`
- `stockBatchId`
- `quantityDelta`
- `reasonCode`
- `createdAt`
- `source`

### Transactions

`Transaction`
- `transactionId`
- `timestamp`
- `totalValue`
- `totalDiscount`
- `visitType`
- `discountFlag`
- `quantityCorrectionFlag`
- `syncStatus`

`TransactionItem`
- `transactionItemId`
- `transactionId`
- `drugId`
- `stockBatchId`
- `quantity`
- `unitPrice`
- `discount`
- `extendedValue`

### Demand and recommendations

`UnmetDemand`
- `demandId`
- `requestedDrugText`
- `normalizedDrugKey`
- `timestamp`
- `reason`
- `fulfilled`

`DemandForecast`
- `forecastId`
- `drugId`
- `horizonDays`
- `visitType`
- `forecastUnits`
- `modelVersion`
- `generatedAt`
- `eligible`
- `fallbackReason`

`CrossSellSuggestion`
- `suggestionId`
- `sourceDrugId`
- `suggestedDrugId`
- `supportCount`
- `rank`
- `generatedAt`

### Supplier and procurement

`Supplier`
- `supplierId`
- `name`
- `contactDetails`
- `drugsSupplied`
- `configuredNotificationChannel`

`PurchaseOrder`
- `purchaseOrderId`
- `supplierId`
- `createdAt`
- `promisedLeadTimeDays`
- `status`

`PurchaseOrderItem`
- `poItemId`
- `purchaseOrderId`
- `drugId`
- `orderedQuantity`
- `receivedQuantity`

`SupplierQualityEvent`
- `qualityEventId`
- `purchaseOrderId`
- `onTime`
- `quantityDiscrepancy`
- `qualityFlag`
- `evaluatedAt`

### Configuration and sync

`StoreConfiguration`
- `defaultLanguage`
- `reorderThresholdDefaults`
- `nearExpiryDays`
- `forecastHorizonDays`
- `forecastMinDataDays`
- `movementBands`
- `discountReferencePercent`
- `notificationChannel`

`NotificationEvent`
- `notificationId`
- `eventType`
- `payload`
- `createdAt`
- `deliveredAt`
- `deliveryStatus`

`SyncQueueItem`
- `queueId`
- `operationType`
- `entityId`
- `payload`
- `baseVersion`
- `createdAt`
- `status`

---

## 10. Backend integrity rules

### 10.1 Stock write policy

Never allow the browser to run an arbitrary `UPDATE stock_batch SET quantity_on_hand = ...`.

Expose narrowly scoped server-side operations such as:

- `dispatch_transaction(...)`
- `receive_purchase_order(...)`
- `apply_stock_adjustment(...)`

Use PostgreSQL transactions and appropriate row/version checks so that the operation either commits completely or rolls back.

### 10.2 Dispatch sequence

The server-side dispatch operation follows the SDD sequence:

1. Validate drug, batch, and quantity.
2. Re-check available quantity.
3. Verify prescription-sighting state where required.
4. Verify acceptable safety-check result.
5. Apply discount calculation and leakage flag logic.
6. Decrement stock.
7. Create transaction.
8. Create transaction items.
9. Record leakage flags.
10. Commit.
11. Return a user-readable success/failure result.

The client may prepare the request, but it must not be the authoritative implementation of the stock mutation.

### 10.3 Substitute ranking

Filter before ranking:
- Same generic/salt composition
- Same strength
- Active product
- Available stock
- Non-expired batch

Then rank using the operational criteria described in the SDD, including stock availability and expiry eligibility.

A substitute is always presented as a suggestion.

### 10.4 Forecasting

- Only forecast eligible drugs.
- Store forecast/model version.
- Use configured horizon.
- Use visit type.
- When the minimum data threshold is not met, use the reorder-threshold fallback rather than producing an unsupported forecast.

### 10.5 Cross-sell

- Derive from historical co-occurrence.
- Exclude inactive, expired, and unavailable items.
- Return at most three suggestions.
- Never auto-add the item.

### 10.6 Procurement

Recommendation inputs:
- low-stock signal
- unmet demand
- forecast signal

The SDD does not prescribe a fixed scoring formula. Any deterministic weighting introduced by implementation must be documented and configurable.

The operator creates/approves the purchase order.

---

## 11. Offline and synchronization model

The local offline layer contains:

- required DrugMaster cache
- current cached StockBatch data
- required configuration
- queued mutation records
- sync metadata

Offline mutation sequence:

1. Validate against locally cached rules/data.
2. Update local state optimistically.
3. Create a `SyncQueueItem`.
4. Mark transaction as pending.
5. Continue without waiting for the network.

Reconnection sequence:

1. Detect connection.
2. Read pending queue items in order.
3. Send mutations to the backend.
4. Apply success or conflict result.
5. Mark queue item.
6. Refresh affected local records.
7. Refresh derived Insights state when central processing completes.

Conflict policy:
- Last-write-wins on the stock ledger.
- Store version/timestamp.
- Flag conflicts in operational/Insights state.
- Never silently hide a stock conflict.

---

## 12. UI/UX contract

### S01 Login

- Single operator authentication
- Username/device identifier as configured
- Password/PIN as configured
- Invalid, locked, unsupported-device/browser states

### S02 Counter Search and Dispatch

One continuous task flow:
- Search
- Scan
- Results
- Stock state
- Price
- Nearest expiry
- Substitute action
- Requirement/prescription state
- Safety result
- Usage/side-effect reference
- Quantity
- Discount
- Dispatch

Phone mode remains one vertical workflow.

### S03 Contraindication Alert

- Full-screen interrupt on phone
- Clear drug/conflict context
- Source/reference version when available
- No hidden bypass through navigation/back/refresh
- Dispatch remains gated until the SRS-defined safety state is resolved

### S04 Stock and Procurement

- Quantity
- Batches
- Expiry
- Reorder threshold
- Low-stock state
- Supplier history
- Create PO

### S05 Purchase Receipt

- Supplier
- PO
- Received quantity
- Batch/lot
- Manufacturing date
- Expiry
- Delivery timing
- Quality flag

### S06 Insights

One screen, no report tabs.

Core views:
- Sales trend
- Supplier performance
- Fast/moderate/slow stock
- Low stock
- Near expiry
- Revenue leakage
- Wastage value

Phone layout stacks the same cards vertically, urgent flags first.

### S07 Guided Walkthrough

1. Search/scan
2. Review stock
3. Verify alerts
4. Confirm price/quantity
5. Dispatch
6. Close transaction

### Accessibility/interaction

- Minimum 44 x 44 CSS px touch targets
- At least 8 px spacing between adjacent controls
- Dispatch in the thumb-reachable lower area
- No horizontal scroll
- Text labels remain visible where icons are used
- High-severity safety state must not rely on color alone
- Localized UI strings must be externalized
- Structured fields preferred over free-form entry

---

## 13. Integration boundaries

### Browser camera
Use standard browser camera APIs. If unavailable:
- manual code entry, or
- keyboard-wedge scanner

### Keyboard-wedge scanner
Treat scanner input as keyboard-compatible text and validate identifiers.

### ESC/POS printer
Print an itemized receipt from transaction data. Never transmit or store payment credentials/status.

### CSV import
The import pipeline must:
1. accept configured tabular schema,
2. validate required fields,
3. report row-level errors,
4. reject invalid mandatory values,
5. preview valid changes,
6. commit valid master records.

Final bulk-import schema remains a tracked TBD.

### CSV export
At minimum:
- Drug Master
- Transaction history
- Supplier records

### Notifications
Use a provider-neutral interface. Record:
- event creation
- delivery state
- retries for transient failure
- failed state for permanent failure

### Drug reference interface
Input:
- selected drug
- minimum required condition/age/prescription information

Output:
- conflict status
- severity
- reference version
- explanation/source metadata where available

The dataset is a dependency, not locally authored clinical knowledge.

---

## 14. Requirement-driven test strategy

The codebase must contain a test pyramid mapped to requirements.

### Unit tests

Cover:
- price and discount calculations
- reorder threshold calculations
- near-expiry logic
- movement classification
- forecast eligibility and cold-start fallback
- substitute eligibility/ranking
- cross-sell ranking
- supplier-quality score calculation
- leakage-flag rules
- input validation
- localization resource resolution

### Database/integration tests

Cover:
- stock write boundaries
- atomic dispatch
- purchase receipt stock increment
- stock adjustment with reason code
- transaction and transaction-item consistency
- RLS behavior
- lockout behavior
- notification event persistence
- sync conflict handling

### End-to-end tests

At minimum:
- Login -> search -> stock check -> safety check -> price -> dispatch -> transaction log
- No-match -> unmet demand
- No-stock -> substitute
- Prescription-tagged drug -> prescription gate
- Contraindication conflict -> blocked dispatch
- Dispatch -> stock decrement and transaction creation
- Purchase order -> receipt -> stock update
- Insights screen refresh
- Offline dispatch -> queued mutation -> reconnect -> sync
- Camera unavailable -> manual/scanner fallback
- Discount above ceiling -> leakage flag
- Near-expiry stock -> visibility and substitute exclusion

### Responsive/UI tests

Run at least:
- 360 px phone
- tablet breakpoint
- desktop breakpoint

Verify:
- no horizontal scroll
- 44 x 44 controls
- 8 px spacing
- one-screen core workflow
- Insights has no tabs
- phone safety alert is full-screen

### Performance tests

Automate or script:
- 500 search operations
- 500 dispatch operations
- 100 low-stock notification events
- Lighthouse/mobile performance runs

### Safety tests

Maintain a labelled synthetic/reference test set for the selected drug-reference dataset. Every dataset update requires regression testing before release.

---

## 15. Debugging policy

When a bug is found:

1. Reproduce it with the smallest reliable test case.
2. Identify the requirement, design element, domain boundary, and data path involved.
3. Determine whether the defect is in UI, domain logic, synchronization, database constraints, integration, configuration, or deployment.
4. Add or improve a regression test before or together with the fix.
5. Fix the narrowest correct layer.
6. Re-run the impacted test set.
7. Re-run the full gate suite for release-blocking changes.
8. Record an ADR or issue if the fix changes an architectural assumption.

Do not patch symptoms in the UI when the real defect is an invalid backend/data invariant.

---

## 16. GitHub and branch policy

Recommended branch model:

- `main` = production-ready
- `develop` = optional integration branch if the team chooses to use one
- `feature/<short-name>` = feature work
- `fix/<short-name>` = bug fixes
- `chore/<short-name>` = tooling/documentation
- `refactor/<short-name>` = non-functional code changes

Preferred commit style:
- `feat: ...`
- `fix: ...`
- `test: ...`
- `refactor: ...`
- `docs: ...`
- `chore: ...`
- `ci: ...`

Every meaningful code change should be committed.

Never commit:
- `.env`
- service-role keys
- access tokens
- passwords
- private certificates
- production database dumps containing sensitive data

Before pushing:
- inspect `git diff`
- run formatting/lint
- run type checking
- run unit/integration tests relevant to the change
- run the release gate before merging to `main`

---

## 17. CI/CD policy

### Pull request gate

At minimum:

```text
install dependencies
-> lint
-> typecheck
-> unit tests
-> integration/database tests
-> build
-> E2E tests
-> optional Lighthouse/performance checks
```

A PR that fails a release-blocking check must not be treated as ready.

### Vercel deployment

Use:
- preview deployment for pull requests
- production deployment only from the approved production branch
- environment-specific Supabase URL/key variables
- production secrets only in Vercel environment settings

### Supabase migration policy

- Every schema change must be a migration.
- Never manually change production schema without capturing the change in source control.
- Review migration ordering and rollback implications before production execution.
- Test destructive migrations against non-production data first.

---

## 18. Deployment readiness checklist

Before declaring the application live:

- SRS high-priority requirements implemented
- SDD domain boundaries preserved
- No payment processing present
- No multi-user/RBAC implementation present
- Atomic dispatch verified
- Stock ledger single-write-path invariant verified
- Safety gate verified
- Selected drug-reference dataset documented
- Jurisdiction-specific TBD-03 resolved or explicitly blocked
- Bulk import schema finalized or explicitly deferred
- Offline MUST threshold tested
- Sync conflict tested
- 360 px UI tested
- Browser capability fallbacks tested
- Security checks completed
- Production environment variables configured
- Supabase migrations applied
- Vercel production deployment successful
- GitHub repository contains the final source and history
- Release commit/tag recorded
- Smoke test completed against the live URL

---

## 19. Open items that must not be invented

Track these explicitly:

- `TBD-01`: exact drug-interaction/contraindication reference dataset
- `TBD-02`: exact bulk drug-master import schema
- `TBD-03`: jurisdiction-specific prescription-sighting and statutory retention rules
- `TBD-04`: validated forecast data threshold
- `TBD-05`: tuned movement classification bands
- `TBD-06`: reference phone/device and performance test baseline

When an agent needs one of these to proceed:
- stop the affected decision,
- record the assumption,
- implement behind an adapter/config boundary where feasible,
- do not invent authoritative clinical/legal policy.

---

## 20. Repository target structure

Use the SDD logical module boundaries while adapting them to the chosen Node.js/Supabase implementation.

```text
pharmaassist/
├─ app/
│  ├─ (auth)/
│  ├─ counter/
│  ├─ inventory/
│  ├─ procurement/
│  ├─ insights/
│  ├─ setup/
│  └─ api/
├─ components/
│  ├─ counter/
│  ├─ inventory/
│  ├─ procurement/
│  ├─ insights/
│  └─ shared/
├─ lib/
│  ├─ supabase/
│  ├─ domain/
│  │  ├─ authentication/
│  │  ├─ pos/
│  │  ├─ inventory/
│  │  ├─ safety/
│  │  ├─ procurement/
│  │  ├─ transactions/
│  │  ├─ analytics/
│  │  ├─ synchronization/
│  │  └─ notifications/
│  ├─ offline/
│  ├─ i18n/
│  └─ integrations/
├─ supabase/
│  ├─ migrations/
│  ├─ functions/
│  ├─ seed/
│  └─ tests/
├─ public/
│  ├─ icons/
│  └─ manifest/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  ├─ e2e/
│  ├─ performance/
│  ├─ safety/
│  ├─ offline/
│  └─ usability/
├─ docs/
│  ├─ SRS.md
│  ├─ SDD.md
│  ├─ context.md
│  ├─ agents.md
│  └─ adr/
├─ .github/
│  └─ workflows/
├─ package.json
├─ tsconfig.json
├─ next.config.*
└─ README.md
```

Keep the exact names flexible where framework conventions require variation, but preserve the logical boundaries.

---

## 21. ATLAS operating model used by this repository

ATLAS is the coding-agent operating loop for PharmaAssist:

### A - Assess

Before changing code:
- inspect repository structure,
- read SRS and SDD sections relevant to the task,
- inspect current implementation and tests,
- identify affected requirements,
- identify risks and unknowns,
- identify whether the requested change is in scope.

**Exit gate:** the agent can state what is changing, why, which requirements it satisfies, and what must not change.

### T - Trace

Build a trace from:
`Requirement -> SDD design -> module -> data contract -> UI/API -> test -> deployment evidence`

For every meaningful feature, list requirement IDs and acceptance tests.

**Exit gate:** no requirement is implemented without a corresponding verification path.

### L - Layout

Design the smallest implementation that preserves the SDD:
- module boundary,
- data model,
- API/RPC contract,
- state transitions,
- offline behavior if applicable,
- UI states,
- error states,
- tests.

Record non-trivial architecture changes as ADRs.

**Exit gate:** design is internally consistent and does not violate the single-ledger, safety, scope, or mobile-first constraints.

### A - Act

Implement incrementally:
- schema/migrations first when data contracts change,
- domain logic,
- backend transaction/RPC/function,
- UI,
- localization,
- offline behavior,
- tests,
- documentation.

Prefer small, reviewable commits.

**Exit gate:** changed code builds, typechecks, and targeted tests pass.

### S - Stabilize

Stabilize and prepare the release:
- reproduce and fix defects,
- run regression tests,
- run security checks,
- run responsive and offline checks,
- run performance gates,
- verify environment configuration,
- validate Supabase migrations,
- deploy preview,
- smoke-test preview,
- merge/push,
- deploy production,
- smoke-test live app,
- record release evidence.

**Exit gate:** release checklist passes and GitHub/Vercel state matches the intended release.

---

## 22. Agent memory and decision logging

Persist important project memory in repository files, not only in chat:

- `docs/adr/` for architecture decisions
- `docs/` for implementation notes and contracts
- Git history for change traceability
- tests as executable behavior
- migration files as database history

An agent must not depend on hidden conversational memory for critical project facts.

---

## 23. Final implementation rule

When in doubt, preserve these invariants:

```text
SRS scope
  -> SDD design
    -> ATLAS trace
      -> tested implementation
        -> GitHub history
          -> Vercel/Supabase deployment
```

The system must remain a single-operator, mobile-first, browser-based pharmacy operations application. Recommendations may assist decisions, but clinical safety checks remain deterministic and reference-driven, stock remains authoritative in the central ledger, and payment processing remains outside the system.
