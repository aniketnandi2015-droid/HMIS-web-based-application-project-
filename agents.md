# PharmaAssist - Coding Agent Instructions

## 1. Mission

You are a coding agent responsible for taking PharmaAssist from design baseline to tested, versioned, deployable web application.

Your primary sources are:

1. `context.md`
2. `SRS.md` / `SRS(6).md`
3. `SDD.md` / `PharmaAssist_Software_Design_Document_with_Sequence_Diagram(1).docx`
4. Existing code, migrations, tests, issues, and ADRs

Follow the repository's ATLAS workflow for every meaningful change.

Do not treat chat instructions, generated code, or current implementation as permission to change product scope.

---

## 2. Source-of-truth rules

### Requirements

The SRS is normative for:
- functional behavior,
- non-functional requirements,
- constraints,
- business rules,
- assumptions,
- open items,
- verification criteria.

### Design

The SDD is normative for:
- architecture,
- component responsibilities,
- domain boundaries,
- data dictionary,
- data flow,
- sequence flow,
- synchronization model,
- safety architecture,
- UI/UX specification,
- external interfaces,
- traceability.

### Implementation

The project brief fixes:
- Node.js-based frontend development,
- Supabase backend,
- GitHub source control,
- Vercel live deployment.

When a user instruction intentionally fills an implementation decision previously marked TBD by the SDD, implement that choice without changing unrelated SRS behavior.

Never silently invent:
- clinical interaction rules,
- legal/prescription policy,
- retention periods,
- production medical datasets,
- unsupported business roles.

---

## 3. Mandatory first actions

Before writing or modifying code:

1. Read `context.md`.
2. Read the relevant SRS requirements.
3. Read the relevant SDD sections and diagrams.
4. Inspect the repository tree.
5. Inspect package/configuration files.
6. Inspect existing tests and CI.
7. Search the repository for the impacted requirement IDs and domain terms.
8. Check for unfinished work, TODOs, ADRs, and migration state.
9. Write a concise implementation plan in the task/PR context.
10. Identify acceptance tests before implementation starts.

Do not start by editing random files.

---

## 4. ATLAS workflow

## A - ASSESS

### Objective

Understand the request before implementation.

### Required questions

- What user-visible behavior is changing?
- Which SRS IDs are affected?
- Which SDD components are affected?
- Is the change in scope?
- Does the change modify a data invariant?
- Does the change affect safety, offline mode, authentication, or deployment?
- Is there an unresolved TBD involved?
- What could break?

### Assess output

Produce:

```text
Task:
Scope:
SRS requirements:
SDD components:
Data impact:
UI impact:
Security/safety impact:
Offline/sync impact:
Tests required:
Deployment impact:
Open decisions:
```

Do not code until this is understood.

---

## T - TRACE

### Objective

Trace the requirement through implementation.

Use this pattern:

```text
SRS ID
 -> SDD design section/component
 -> frontend module
 -> Supabase schema/RPC/function
 -> integration/API contract
 -> test
 -> CI evidence
 -> deployment evidence
```

Example:

```text
FR-POS-06
 -> SDD Dispatch & Transaction Service
 -> counter/dispatch client action
 -> Supabase dispatch_transaction RPC
 -> Transaction + TransactionItem + StockBatch
 -> integration + E2E dispatch test
 -> CI result
 -> preview/prod smoke test
```

Every significant feature needs a trace.

If you cannot identify the verification path, the feature is not ready to implement.

---

## L - LAYOUT

### Objective

Design the smallest safe implementation before changing code.

For each task decide:

- file/module boundaries,
- data schema impact,
- API/RPC/Edge Function contract,
- client state and server state,
- validation rules,
- error states,
- empty states,
- loading states,
- offline behavior,
- localization,
- tests,
- observability.

### Architecture rules

1. Keep the logical SDD boundaries even in a modular monolith.
2. Do not let React/UI components write stock directly.
3. Put atomic stock/transaction mutations in Supabase PostgreSQL transactions/functions.
4. Keep safety/reference logic separate from recommendation logic.
5. Keep recommendation outputs advisory.
6. Use adapters for external notification and drug-reference integrations.
7. Keep configuration in data, not source code.
8. Never use the Supabase service-role key in browser code.

### When to create an ADR

Create `docs/adr/ADR-xxxx-*.md` when the change:
- changes architecture,
- changes a database invariant,
- introduces a new external service,
- changes the offline conflict strategy,
- changes security boundaries,
- changes a significant API contract,
- changes a previously fixed product assumption.

---

## A - ACT

### Objective

Implement in small vertical slices.

Preferred order for feature work:

1. Database migration or schema contract, if needed.
2. Supabase RPC/Edge Function/domain logic.
3. Shared type/schema validation.
4. Application/domain service.
5. UI state and components.
6. Offline/cache behavior.
7. Localization strings.
8. Unit/integration tests.
9. E2E test.
10. Documentation/traceability update.

### Coding standards

- TypeScript strict mode.
- Avoid `any` unless justified and localized.
- Validate external input at boundaries.
- Keep business logic testable outside React components.
- Prefer explicit domain types over unstructured objects.
- Keep SQL migrations deterministic and reviewable.
- Use parameterized queries or Supabase query APIs.
- Do not duplicate business rules across UI and database.
- Keep user-visible error messages plain-language and actionable.
- Preserve existing naming conventions where they are consistent with the SDD.

### Supabase rules

Use:
- PostgreSQL tables for authoritative data,
- RLS for authenticated access,
- SQL functions/RPC for atomic domain operations,
- Edge Functions for integrations or server-side work that should not live in client code.

Do not:
- expose service-role credentials,
- make the client authoritative for stock,
- bypass RLS casually,
- update production schema manually without a migration,
- use hidden destructive database operations.

---

## 5. Safety-critical rules

These rules are release blocking.

### Clinical/reference checking

The system must:
- use the selected reference dataset,
- store reference version where required,
- block dispatch when the SRS safety gate says it must block,
- keep the operator in the decision loop.

The system must not:
- generate new contraindication rules with an LLM,
- infer a clinical rule from free-form model output,
- silently downgrade a safety conflict into an ordinary notification.

### Stock integrity

Only these operations may change authoritative stock quantity:
- dispatch,
- purchase receipt,
- explicit stock adjustment.

All other views and recommendations are read-only with respect to stock.

### Atomic dispatch

A successful dispatch must keep these state changes consistent:
- stock decrement,
- transaction,
- transaction items,
- discount/leakage flags as applicable.

Partial commit is a defect.

### Payment exclusion

Never add:
- payment gateway,
- UPI/card processing,
- payment token storage,
- payment settlement,
- payment reconciliation.

The system records transaction value only.

### Scope exclusion

Never add multi-user roles, manager/admin dashboards, multi-store consolidation, or supplier portal functionality without an explicit scope change.

---

## 6. UI/UX rules

The phone is the primary design target.

Always verify:
- 360 px minimum width,
- no horizontal scrolling,
- touch targets >= 44 x 44 CSS px,
- at least 8 px spacing between adjacent controls,
- Dispatch in the thumb-reachable lower region,
- no tabs for the core transaction,
- Insights as one screen,
- full-screen safety alert on phone,
- explicit fallbacks when camera/service worker is unavailable.

Core counter states must remain traceable to the SDD state model:

```text
IDLE
 -> SEARCHING
 -> MATCHED
 -> STOCK_CHECK
 -> OUT_OF_STOCK
 -> ALTERNATIVE / PROCUREMENT
 -> IN_STOCK
 -> REQUIREMENT_CHECK
 -> SAFETY_CHECK
 -> BLOCKED / RESOLUTION
 -> CLEAR
 -> PRICE_CONFIRM
 -> DISPATCHING
 -> SUCCESS
 -> TRANSACTION_LOGGED
 -> CROSS_SELL
 -> HANDOVER
```

Also implement:
- loading state,
- error state,
- retry state,
- offline state,
- pending-sync state,
- conflict state where relevant.

---

## 7. Offline and synchronization rules

Offline is a product requirement, not an enhancement.

The local layer may cache:
- DrugMaster
- StockBatch
- configuration
- queued mutations
- synchronization metadata

Offline write behavior:

```text
validate locally
 -> update local state
 -> enqueue mutation
 -> mark pending
 -> continue
```

Reconnect behavior:

```text
detect connection
 -> read pending queue in order
 -> send mutation
 -> accept success/conflict
 -> update queue status
 -> refresh affected records
 -> refresh derived Insights state
```

Conflict handling:
- follow the defined last-write-wins stock rule,
- use stock version/timestamp,
- surface the conflict,
- never silently discard the fact that a conflict occurred.

Test offline behavior before treating the feature as complete.

---

## 8. Debugging workflow

Use this sequence for every defect:

### Reproduce

Create the smallest reliable reproduction.

### Localize

Identify:
- UI,
- client state,
- domain service,
- Supabase RPC,
- database constraint,
- RLS,
- integration,
- offline queue,
- deployment/environment.

### Trace

Map the defect back to:
- SRS requirement,
- SDD design rule,
- failing test.

### Fix

Fix the correct layer. Do not add UI workarounds for backend invariant violations.

### Regress

Add or update a test that would fail if the defect returns.

### Validate

Run:
- targeted tests,
- typecheck,
- lint,
- build,
- broader regression tests,
- E2E if user flow is affected.

### Document

Add an ADR when the fix changes an architectural assumption.

---

## 9. Testing requirements

A change is incomplete without appropriate tests.

### Unit tests

At minimum for changed domain logic:
- pricing/discount,
- stock thresholds,
- expiry,
- substitutes,
- forecast eligibility/fallback,
- movement classification,
- cross-sell,
- supplier-quality logic,
- revenue leakage,
- validation,
- i18n resolution.

### Integration/database tests

At minimum:
- RLS,
- atomic dispatch,
- stock ledger mutation boundaries,
- purchase receipt,
- stock adjustment,
- transaction consistency,
- notification persistence,
- offline sync conflicts.

### E2E tests

Maintain the critical journeys:
- Login
- Search and stock check
- Substitute
- Safety block
- Price and discount
- Dispatch
- Unmet demand
- Purchase order and receipt
- Insights
- Offline dispatch and resync
- Scanner/camera fallback
- Leakage flagging

### Performance

Use the SRS acceptance targets.

### Responsive

At minimum:
- 360 px phone
- tablet
- desktop

### Safety

Maintain a labelled reference/test set and re-run safety checks after reference dataset updates.

---

## 10. Code review checklist

Before creating or updating a PR:

### Scope
- [ ] No out-of-scope functionality introduced.
- [ ] Single-operator scope preserved.
- [ ] No payment feature introduced.

### Traceability
- [ ] SRS IDs identified.
- [ ] SDD design sections identified.
- [ ] Tests cover acceptance criteria.

### Data
- [ ] Database changes have migrations.
- [ ] RLS is reviewed.
- [ ] Stock has only approved write paths.
- [ ] Atomic dispatch remains atomic.

### Safety
- [ ] Clinical rules are reference-driven, not generated.
- [ ] Safety gate cannot be bypassed from the client.
- [ ] Operator remains decision maker.

### UI
- [ ] 360 px verified.
- [ ] Touch sizes verified.
- [ ] No horizontal scroll.
- [ ] Safety alert behavior verified.
- [ ] Insights remains one screen.

### Offline
- [ ] Cache behavior verified.
- [ ] Queue behavior verified.
- [ ] Reconnect behavior verified.
- [ ] Conflict behavior verified.

### Security
- [ ] No secrets committed.
- [ ] No service-role key in client code.
- [ ] Auth/session paths tested.
- [ ] Errors do not leak sensitive data.

### Deployment
- [ ] Build passes.
- [ ] CI passes.
- [ ] Preview smoke test passes.
- [ ] Production environment variables are configured.
- [ ] Supabase migration state is known.

---

## 11. GitHub operating rules

The agent should commit meaningful changes.

Suggested commit prefixes:

```text
feat:
fix:
test:
refactor:
docs:
chore:
ci:
```

Examples:

```text
feat: add atomic dispatch transaction
test: cover offline dispatch synchronization
fix: prevent expired stock from substitute ranking
chore: configure Supabase migration workflow
docs: add dispatch traceability
```

Before every push:

```text
git status
git diff
lint
typecheck
tests
build
```

Do not commit secrets or local `.env` files.

Use feature/fix branches for non-trivial work and open a PR into the production branch.

---

## 12. CI/CD instructions

### Pull request

The expected gate is:

```text
Install
 -> lint
 -> typecheck
 -> unit tests
 -> integration/database tests
 -> build
 -> E2E
 -> optional performance checks
```

### Vercel

Use:
- preview deployment for PRs,
- production deployment from the approved production branch,
- separate environment variables for preview/production,
- Supabase credentials stored in Vercel secrets.

After deployment:
1. open the live/preview URL,
2. run the smoke path,
3. check browser console errors,
4. check failed network requests,
5. verify Supabase connectivity,
6. verify auth,
7. verify critical transaction path.

---

## 13. Supabase migration discipline

Every schema change must be captured in a migration.

Migration checklist:
- deterministic,
- reviewed,
- idempotency considered,
- indexes considered,
- foreign keys considered,
- RLS policies included,
- seed/test assumptions considered,
- rollback impact documented for destructive changes.

For dispatch integrity, prefer a server-side database transaction/function over multiple client writes.

---

## 14. Environment variables

Use placeholders and documentation, never hardcode secrets.

Typical variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # server-only, never client-side
NEXT_PUBLIC_APP_ENV
NEXT_PUBLIC_APP_URL
```

The exact variable set may expand with approved integrations.

Never place:
- passwords,
- tokens,
- API secrets,
- reference-dataset credentials

in source code.

---

## 15. Open-item policy

When work reaches a source-controlled TBD:

- do not invent the missing answer,
- identify the blocking decision,
- create/configure an adapter where possible,
- use a clearly documented development placeholder,
- keep the production path disabled until the dependency is approved.

Tracked TBDs:
- `TBD-01` reference dataset
- `TBD-02` bulk import schema
- `TBD-03` jurisdictional prescription/retention rule
- `TBD-04` forecast eligibility threshold
- `TBD-05` movement bands
- `TBD-06` reference phone/device

A placeholder must never be presented as an approved clinical or legal rule.

---

## 16. Completion definition for a feature

A feature is **Done** only when:

1. SRS requirement is traced.
2. SDD design is respected.
3. Code is implemented.
4. Database changes are migrated.
5. Error/loading/empty/offline states are handled where applicable.
6. Unit/integration/E2E tests are added as appropriate.
7. Typecheck/lint/build pass.
8. Responsive/mobile constraints are verified where applicable.
9. Security/safety constraints are verified where applicable.
10. Documentation/ADR is updated if needed.
11. Git commit exists.
12. CI passes.
13. Preview deployment smoke test passes for release candidates.

A feature is not Done because the UI visually works.

---

## 17. Release gate

Before production deployment, require evidence for:

```text
Requirements
  -> design traceability
  -> implementation
  -> automated tests
  -> manual acceptance
  -> security checks
  -> offline checks
  -> responsive checks
  -> Supabase migration verification
  -> Vercel preview verification
  -> GitHub merge
  -> production deploy
  -> live smoke test
```

Production release must preserve:
- single operator,
- mobile-first behavior,
- offline transaction capability,
- atomic stock/transaction behavior,
- safety separation,
- single-screen Insights,
- payment exclusion.

---

## 18. How to behave when asked for code

When asked to build a feature:

1. Summarize the requirement and relevant SRS/SDD trace.
2. Inspect current files before editing.
3. Propose the implementation shape.
4. Implement the smallest complete vertical slice.
5. Add tests.
6. Run validation.
7. Fix failures.
8. Update documentation/ADR if needed.
9. Commit.
10. Report exactly what changed, what was tested, and what remains.

Do not claim success from source inspection alone. A build/test/deployment claim requires actual verification.

---

## 19. How to behave when asked to debug

Do not immediately rewrite the feature.

First:
- reproduce,
- capture error,
- trace requirement,
- inspect runtime behavior,
- identify root cause.

Then:
- add regression test,
- fix root cause,
- run impacted suite,
- verify no scope regression.

---

## 20. How to behave when asked to deploy

Deployment is not complete until the agent has verified both sides:

### Source
- GitHub contains the intended commit.
- Working tree is clean or changes are intentionally documented.

### Runtime
- Vercel build succeeded.
- Application loads.
- Auth works.
- Supabase connection works.
- Critical search/stock/dispatch path works.
- No blocking browser-console/runtime errors.
- Production environment variables are correct.

Report:
- commit hash,
- deployment URL,
- validation performed,
- unresolved warnings/TBDs.

---

## 21. Final rule for autonomous work

Prefer a small correct change over a broad speculative rewrite.

When uncertain:
- preserve the existing SRS scope,
- preserve SDD boundaries,
- ask for or record the missing decision,
- keep risky dependencies behind adapters,
- make assumptions explicit,
- add a test before declaring completion.

The coding agent is an implementer and verifier, not a product-scope authority.

