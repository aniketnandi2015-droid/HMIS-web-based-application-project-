# Software Requirements Specification

## PharmaAssist — AI-Augmented Point-of-Sale, Inventory and Analytics System for Retail Pharmacy

**Prepared for:** PGDM Internship / Applied Research Deliverable
**Reference standards:** IEEE 830-1998 (Wiegers template), ISO/IEC/IEEE 29148:2018
**Document version:** 2.1 (simplified, single-user scope; mobile-first web platform added)
**Status:** Draft for review

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | Draft | Initial SRS derived from problem statement and salesperson workflow analysis | — |
| 2.0 | Draft | Simplified to a single-user (salesperson-only) system: removed role-based access, removed payment processing/billing, replaced billing with transaction-history logging feeding a lightweight visual analytics view for supplier and revenue-leakage insight | — |
| 2.1 | Draft | Added a high-priority platform requirement: the system is delivered as a mobile-first, web-based application (FR-PLT-01 to FR-PLT-06, UI-05, NFR-USE-03, NFR-PERF-04); reconciled §2.1, §2.4, CON-03 and COM-01 with the browser-based delivery model | — |

---

## 1. Introduction

### 1.1 Purpose

This document specifies the requirements for **PharmaAssist**, a digital, AI-augmented system intended to replace the manual, paper- and memory-based workflow currently used by a counter salesperson in a small retail pharmacy store. The system is scoped for a single operator who handles the counter, the stock room, and supplier ordering — there is no separate manager or IT role. This SRS covers the first release: point-of-sale (POS) transaction handling, inventory and batch management, supplier and procurement records, transaction-history logging, and a lightweight visual analytics view highlighting supplier performance and revenue leakage. It is intended as a reference for development and as a basis for sign-off before design begins.

### 1.2 Document Conventions

- Functional requirements are identified as `FR-<subsystem>-<nn>`.
- Non-functional requirements are identified as `NFR-<attribute>-<nn>`.
- Constraints are identified as `CON-<nn>`; business rules as `BR-<nn>`; assumptions as `ASM-<nn>`; open items as `TBD-<nn>`.
- Priority is High (H), Medium (M), or Low (L). High-priority requirements are mandatory for the first release.
- The keyword **shall** denotes a mandatory, testable requirement. **Should** denotes a target that is not release-blocking. Neither word is used with any of the banned adjectives (*support, handle, manage, easy, robust, seamless, user-friendly, efficient*) without a measurable qualifier attached.
- Non-functional requirements follow the PLanguage pattern: `SCALE` (what is measured), `METER` (how it is measured), `MUST` (minimum acceptable), `PLAN` (target), `WISH` (aspirational).

### 1.3 Intended Audience and Reading Suggestions

- **Reviewers and academic evaluators**: Sections 1, 2, and 4 give the scope and functional core.
- **Development team / vendor**: Sections 3 and 4 (interfaces and functional requirements) and Section 5 (NFRs) are normative for build and test. Start with §4.0 (FR-PLT-01 to FR-PLT-06), the mobile-first web platform requirement that every other functional requirement is delivered through.
- **Store owner / operator**: Sections 2.2, 2.3, and Appendix B (insights view description) are most relevant.

### 1.4 Product Scope

PharmaAssist digitizes the counter-to-backroom workflow of a small retail pharmacy: recognizing a customer's drug requirement, checking stock and identifying substitutes, communicating price and discount, dispatching the drug against batch and lot records, and logging the transaction. It further layers light AI-augmented decision support on top of this transaction record: procurement recommendations, demand forecasting by drug and patient-visit type, cross-sell suggestions across OTC and prescription categories, supplier quality tracking, and one visual insights screen surfacing revenue leakage and inventory health.

**In scope for this release:**
- Delivery as a mobile-first, web-based application, installable to the phone home screen, used on a phone at the counter and on a tablet or desktop browser with no native app-store build (FR-PLT-01 to FR-PLT-06).
- Single-operator transaction workflow (drug identification, contraindication flag, stock check, substitute suggestion, pricing/discount, dispatch, stock update).
- Inventory and batch/lot management, including expiry tracking.
- Supplier and procurement records, including supplier-quality history.
- Transaction-history logging (item, quantity, price, discount, timestamp) — recorded as data only; no payment collection or settlement.
- A lightweight visual analytics view: sales/revenue trend, supplier performance, and revenue-leakage indicators, sized for one operator to scan in a few minutes, not a multi-tab enterprise dashboard.
- Demand forecasting and cross-sell suggestion, kept as simple, explainable outputs rather than a separate analytics workflow.

**Explicitly out of scope for this release:**
- Role-based access, multi-user login, or any manager/admin role — the system is built for exactly one operator.
- Payment processing of any kind: no UPI, net banking, card, or merchant-gateway integration. The system records that a transaction happened and its value; it does not collect, settle, or reconcile payment.
- E-prescription integration with external hospital or doctor systems.
- Direct integration with national health-data exchanges (e.g., ABDM) or insurance claim adjudication.
- Home delivery logistics and courier tracking.
- Multi-store/franchise consolidation (single-store, single-operator deployment only).
- Automated regulatory drug-scheduling classification beyond what is manually tagged at data entry.
- A full "analytics dashboard" in the enterprise sense — one consolidated, visual, at-a-glance screen is in scope; separate drill-down report modules are not.

### 1.5 References

- IEEE Std 830-1998, *IEEE Recommended Practice for Software Requirements Specifications*.
- ISO/IEC/IEEE 29148:2018, *Systems and software engineering — Life cycle processes — Requirements engineering*.
- Wiegers, K. & Beatty, J., *Software Requirements*, 3rd ed.
- Gilb, T., *Competitive Engineering* (PLanguage: SCALE/METER/MUST/PLAN/WISH).
- Internal problem statement: "Manual, paper-based pharmacy workflow — transition to digital, AI-augmented system" (source document for this SRS).

### 1.6 Overview

Section 2 gives the overall product context, actors, and constraints. Section 3 specifies external interfaces. Section 4 contains the functional requirements, beginning with the high-priority mobile-first web platform subsystem (§4.0) and continuing by subsystem, traced to the salesperson's real workflow and friction points. Section 5 specifies non-functional requirements in measurable form. Section 6 lists other requirements (legal, data, i18n). Appendices contain the glossary, the TBD list, and supporting diagrams.

---

## 2. Overall Description

### 2.1 Product Perspective

PharmaAssist is a new, self-contained system replacing an entirely manual (paper register and memory-based) workflow — there is no legacy digital system to migrate from, and no second user role to integrate with. It consists of two logical components, both used by the same single operator at different points in the day:

1. **Counter Screen** — the primary interface used at the point of sale; delivered as a mobile-first web application (FR-PLT-01) that runs in a browser on a smartphone, tablet, or desktop/POS terminal at the counter. Used continuously during customer transactions.
2. **Data, Records and Insights Layer** — a shared local/cloud database plus a lightweight analytics engine covering inventory, supplier records, transaction history, and the visual insights view. The same operator opens this from the same device, typically between customers or at day's end.

```
        +----------------------+           +-----------------------+
        |   Counter Screen      |<-------->|  Data, Records and     |
        |  (search, stock check, |          |  Insights Layer        |
        |   dispatch, cross-sell)|          |  (DB + light analytics)|
        +----------------------+           +-----------------------+
                                                      ^
                                                      |
                                            +-----------------------+
                                            | Supplier / procurement|
                                            | records               |
                                            +-----------------------+
```

### 2.2 Product Functions (Summary)

- Mobile-first web delivery: the full counter workflow and the insights view are usable on a phone browser, installable to the home screen, with no native app build (FR-PLT-01 to FR-PLT-06).
- Guided drug lookup by brand, generic/salt name, dosage, and quantity, with contraindication flags.
- Real-time stock check against exact match and ranked substitute suggestions.
- Price and discount display at point of sale.
- Dispatch confirmation that atomically updates stock quantity, batch, and lot number.
- Batch/lot and expiry tracking with near-expiry alerts.
- Supplier procurement records: lead time, order history, and a supplier-quality score.
- Transaction-history logging (no payment collection or settlement — see §1.4).
- Demand forecasting by drug and by patient-visit type (OTC walk-in vs. prescription-driven).
- Cross-sell suggestions spanning OTC and prescription drug categories.
- One lightweight visual insights screen: sales/revenue trend, supplier performance, fast/slow-moving stock, and revenue-leakage indicators.

### 2.3 User Class and Characteristics

| User class | Description | Frequency of use | Technical expertise |
|---|---|---|---|
| **Salesperson / Operator** | The single person who uses this system for everything: identifies the customer's drug need, checks stock, handles pricing and discount, dispatches and updates stock, records suppliers and orders, and checks the insights view. There is no separate manager, admin, or IT role in this release. | Continuous throughout the day | Low–moderate; assumes basic device literacy, no coding or query skill |

*Because there is only one user, this SRS does not specify role-based access control, login-based privilege separation, or multi-user account management (see CON-05). Every function in Section 4 is available to this one operator; the only access control needed is a single device-level login to keep the system from being open to anyone walking up to the counter.*

### 2.4 Operating Environment

- Counter Screen: a current evergreen browser (Chrome, Edge, Safari or Firefox, latest two major versions) on a smartphone (Android 10+ or iOS 15+, 360 px viewport width minimum), a tablet, or a Windows 10/11 desktop; touchscreen preferred; barcode/QR input via the device camera (FR-PLT-05) or a keyboard-wedge scanner peripheral (HW-01). No native application install is required (FR-PLT-01).
- Network: local Wi-Fi/LAN within the store premises; internet connectivity required for cloud-hosted data layer (see CON-02) and for supplier-side procurement notifications.
- Server-side: cloud-hosted application and database tier; specific hosting provider is a design decision, not specified here.
- The insights view (§4.5) is designed to open in the same browser session on the same single device — no separate manager workstation is assumed — and shall be legible on a phone-width screen (FR-PLT-02).

### 2.5 Design and Implementation Constraints

- **CON-01**: The system shall not require the salesperson to type free-form clinical notes during a transaction under normal operation; all mandatory fields shall be selectable from structured lists (drug master, dosage list, contraindication tags) to keep counter-side data entry within the time budget in NFR-PERF-01.
- **CON-02**: The system shall remain able to complete a dispense-and-log transaction (FR-POS-01 through FR-POS-06, FR-TXN-01) for at least 4 continuous hours of loss of internet connectivity, using locally cached drug-master and stock data, per NFR-DEG-01.
- **CON-03**: The system shall run on existing store hardware (the operator's own smartphone, or the counter terminal and barcode scanner already in use for the current manual process) through a web browser, without mandating new POS hardware purchase or a native app-store build for the first release.
- **CON-04**: Any drug-interaction or contraindication logic shall use a licensed or open drug-interaction reference dataset identified before design sign-off (see TBD-01); the system itself shall not originate clinical interaction rules.
- **CON-05**: The system shall not implement role-based access control, multiple user accounts, or privilege tiers. A single device-level login is sufficient; no requirement in this SRS shall assume a second user role exists.
- **CON-06**: The system shall not process, collect, or settle payment in any form (cash, card, UPI, net banking, or wallet). It shall record that a transaction occurred and its monetary value only, per FR-TXN-02; actual payment collection remains entirely outside the system, exactly as it happens today.

### 2.6 User Documentation

The release shall be accompanied by a one-page counter quick-reference card (laminated, for the physical counter) and an in-app guided walkthrough for first-time login. No separate manager handbook is required, since the operator is the only user.

### 2.7 Assumptions and Dependencies

- **ASM-01**: The pharmacy possesses, or will procure before go-live, a structured drug master (brand name, generic/salt name, strength, form, schedule/category) sufficient to seed the system; PharmaAssist does not itself compile this master data from scratch.
- **ASM-02**: At least one barcode or QR-coded identifier exists per drug packaging batch, or the store agrees to adopt one, to support the batch/lot scanning in FR-INV-03.
- **ASM-03**: Payment collection (cash, card, UPI, net banking) continues to happen entirely outside this system, exactly as it does today; the system never touches payment (see CON-06). It records only that a transaction happened and its value (FR-TXN-01).
- **ASM-04**: The operator is able to recognize or escalate (e.g., by phone to a pharmacist) any contraindication or prescription-drug dispense flagged by the system; the system supports this decision, it does not replace professional judgment.
- **ASM-05**: Historical sales data (even if currently only in paper registers) can be digitized or estimated for an initial period sufficient to seed the demand-forecasting model (see FR-ANL-02); cold-start behaviour without this data is addressed in FR-ANL-02's exception path.

- **ASM-06**: The operator owns, or will have access to, a smartphone or tablet with a rear camera, a current evergreen browser, and a mobile-data or Wi-Fi connection at the counter; the system does not supply devices. Where the operator's browser or device lacks a capability required by FR-PLT-04 or FR-PLT-05, the fallbacks named in those requirements apply (see TBD-06).

---

## 3. External Interface Requirements

### 3.1 User Interfaces

- **UI-01 Counter search-and-dispense screen**: single-screen workflow — search box (brand/generic/salt/dosage), result list showing stock status (exact match / substitute available / out of stock), price and discount fields, and a single "Dispatch" action. Designed so the full happy-path transaction (FR-POS-01 to FR-POS-06) can be completed without leaving this screen, addressing the friction point "delay in identifying choice of drug and selection."
- **UI-02 Contraindication alert**: a modal, high-visibility interrupt shown before dispatch is allowed to proceed, distinct in colour and sound/vibration from routine notifications, to counter the cognitive-load friction point without inducing alert fatigue (see NFR-SAFE-02).
- **UI-03 Insights screen**: one screen with a small number of charts — sales trend, fast/slow-moving stock, supplier performance, and revenue-leakage/wastage indicators (FR-ANL-06) — with no tabs or separate report modules (see Appendix B for the indicative layout).
- **UI-04 Language**: the counter screen labels and drug names shall be renderable in English and at least one regional language configurable per store (see FR-I18N-01).
- **UI-05 Mobile-first layout**: the counter search-and-dispense screen (UI-01), the contraindication alert (UI-02) and the insights screen (UI-03) shall be designed at phone width first (360 px minimum, portrait) and enhanced for tablet and desktop, per FR-PLT-01 and FR-PLT-02. On phone widths the two-column insights layout in Appendix B stacks into a single vertical column of the same cards, in the same priority order, with no tabs. The UI-02 alert shall render as a full-screen interrupt on phone widths so it cannot be missed or mis-tapped past.

### 3.2 Hardware Interfaces

- **HW-01**: The system shall accept input from a USB or Bluetooth barcode/QR scanner emulating keyboard-wedge input for batch/lot and product identification, as an alternative to the device-camera scanning of FR-PLT-05.
- **HW-02**: The system shall support a receipt printer (thermal, 2-inch or 3-inch roll, ESC/POS-compatible) for printing the itemized receipt described in FR-TXN-02.
- **HW-03**: No proprietary or single-vendor hardware dependency shall be introduced; standard keyboard-wedge and ESC/POS interfaces are the only hardware contracts.

### 3.3 Software Interfaces

- **SW-01**: The system shall expose a data-export interface (CSV or equivalent) for the drug master, transaction log, and supplier records, to support external audit, accounting software import, or future integration, without naming a specific accounting product in this release.
- **SW-02**: The system shall accept a bulk drug-master import in a defined tabular format (see TBD-02 for exact schema) to support initial data seeding under ASM-01.

### 3.4 Communications Interfaces

- **COM-01**: All communication between the browser-based Counter Screen and the Data, Records and Insights Layer shall occur over HTTPS (TLS 1.2 or higher). HTTPS is also a technical precondition for the service worker and camera access required by FR-PLT-04 and FR-PLT-05.
- **COM-02**: Where SMS or email notification is used (e.g., a low-stock alert, per FR-PROC-05), the system shall use a store-configurable notification channel rather than a hardcoded provider.

---

## 4. Functional Requirements

Requirements are grouped by subsystem, directly traced to the salesperson workflow and friction points named in the problem statement. Each requirement carries: ID, Title, Description, Priority, Rationale, Source, Depends-on, and Verification method.

### 4.0 Subsystem: Mobile-First Web Platform (PLT)

*Addresses: the single operator works on their feet, moving between the counter, the stock room and the supplier phone call, so the system must be usable on the phone already in their pocket, with nothing to install from an app store and no dedicated POS hardware. This subsystem is a high-priority, release-blocking foundation: every requirement in §4.1 to §4.6 is delivered through it.*

| ID | Title | Description | Priority | Rationale | Source | Depends-on | Verification |
|---|---|---|---|---|---|---|---|
| **FR-PLT-01** | **Mobile-first, web-based delivery** | The system shall be delivered as a web application accessed through a browser over HTTPS, designed mobile-first: the phone layout (portrait, 360 px width and up) shall be designed and built first, and tablet and desktop layouts shall be progressive enhancements of it. Every function in §4.1 to §4.6 shall be fully operable on a phone-width screen, and no function shall require a native app-store installation, a desktop-only browser feature, or a screen wider than 360 px. | **H** | Operator request. Meets the single operator where they already are (a phone), removes app-store and hardware dependency (CON-03), and keeps one codebase for phone, tablet and desktop. | Derived, per operator request | COM-01 | Test, Demo |
| FR-PLT-02 | Responsive layout across breakpoints | The system shall adapt its layout continuously between 360 px and 1920 px viewport width, with defined layout changes at no more than three breakpoints (phone, tablet, desktop). At every width, content shall be readable without horizontal scrolling, and the counter search-and-dispense flow (UI-01) and the insights screen (UI-03) shall remain single-screen at every width, stacking vertically on phone widths rather than being split into tabs. | H | Preserves the "one screen, no tabs" principle of UI-01, UI-03 and NFR-USE-02 on a small display. | Derived | FR-PLT-01, UI-01, UI-03 | Test |
| FR-PLT-03 | Touch-optimized counter interaction | On touch devices, every interactive control on the counter workflow shall have a tap target of at least 44 x 44 CSS px with at least 8 px spacing between adjacent targets. The primary "Dispatch" action shall sit within the thumb-reachable lower region of a phone screen. The full happy-path transaction (FR-POS-01 to FR-POS-06) shall be completable using touch input alone, without a physical keyboard or mouse. | H | The counter is a one-handed, standing, high-interruption environment; mis-taps on a dispatch or discount control cause stock and revenue errors. | Derived | FR-PLT-01, UI-01 | Test, Inspection |
| FR-PLT-04 | Installable web app (PWA) with offline shell | The system shall be installable to the device home screen from the browser (web app manifest with name, icons, and standalone display mode) and shall use a service worker to cache the application shell and the locally cached drug master and stock data required by NFR-DEG-01, so that the counter workflow launches and remains usable without internet connectivity. Transactions completed offline shall be queued and synchronized on reconnection under the conflict rule stated in NFR-DEG-01. | H | Delivers the offline dispensing behaviour required by CON-02 and NFR-DEG-01 through a browser-delivered app, and removes the need for an app-store build. | Derived | FR-PLT-01, NFR-DEG-01, CON-02 | Test |
| FR-PLT-05 | Device-camera barcode and QR scanning | The system shall allow the operator to scan a batch barcode or QR code using the phone or tablet rear camera from within the browser, populating the same product, batch and lot fields as FR-INV-03, after a one-time camera-permission grant. Where camera access is denied or unavailable, the system shall fall back to manual entry or a keyboard-wedge scanner (HW-01) without blocking the transaction. | H | A phone-based counter has no dedicated scanner; the camera replaces it, keeping FR-INV-03's reduction in manual keystroke entry (the most repeated friction point in the problem statement). | Derived | FR-INV-03, HW-01, ASM-02 | Test |
| FR-PLT-06 | Cross-browser and cross-device compatibility | The system shall function without loss of any High-priority requirement on the latest two major versions of Chrome, Edge, Safari (iOS and macOS) and Firefox, on Android 10+ and iOS 15+, and on Windows 10/11. Where a browser lacks a required capability (for example, camera access or service workers), the system shall detect this on load and display a plain-language message naming the missing capability and the fallback in use, rather than failing silently. | H | The operator's device and browser are not under the project's control; the platform requirement is only meaningful if it holds across the browsers a pharmacy operator will realistically use. | Derived | FR-PLT-01 | Test |

### 4.1 Subsystem: Point-of-Sale Transaction (POS)

*Addresses: "manual data entry at every step," "verifies drug/brand/dosage/quantity and identifies contraindications," "checks stock availability... or recommends a similar drug," "communicates price, discount, quantity," "dispatch and update stock."*

| ID | Title | Description | Priority | Rationale | Source | Depends-on | Verification |
|---|---|---|---|---|---|---|---|
| FR-POS-01 | Structured drug search | Given a customer request, the salesperson shall be able to search the drug master by brand name, generic/salt name, dosage, and form, and the system shall return matching results within the time bound of NFR-PERF-01. | H | Removes manual paper lookup; directly targets "delay in identifying choice of drug." | Problem statement | ASM-01 | Test |
| FR-POS-02 | Contraindication flag on selection | When a drug is selected and a customer profile (or a minimally entered age/condition flag) is available, the system shall check the selection against the contraindication reference (CON-04) and display UI-02 before allowing dispatch if a conflict is found. | H | Directly named step: "identifies contraindications." | Problem statement | FR-POS-01, CON-04 | Test |
| FR-POS-03 | Exact-match stock check | On drug selection, the system shall display current available quantity, batch number(s), and nearest expiry date for that drug at the counter within the time bound of NFR-PERF-01. | H | "Checks for stock availability of drugs for exact match." | Problem statement | FR-INV-01 | Test |
| FR-POS-04 | Substitute recommendation | If the exact-match quantity is zero or below the reorder threshold (BR-01), the system shall present a ranked list of substitute drugs sharing the same generic/salt composition and strength, ordered by in-stock quantity and nearest expiry first. | H | "Recommend a similar drug of choice" — resolves the core selection-delay friction point. | Problem statement | FR-POS-03 | Test |
| FR-POS-05 | Price and discount display | On drug selection, the system shall display unit price, any applicable discount (per BR-02), and the extended price for the entered quantity, before dispatch confirmation. | H | "Communicates the price of drugs, applicable discount and quantity"; removes cognitive burden of manual discount calculation. | Problem statement | FR-POS-01 | Test |
| FR-POS-06 | Dispatch and atomic stock update | On salesperson confirmation of dispatch, the system shall, in a single atomic transaction: (a) decrement stock quantity for the selected batch/lot, (b) record the batch and lot number against the transaction, and (c) create a transaction-history record per FR-TXN-01. | H | "If agreed, dispatch the drug and updates stock quantity, type and batch with lot number." Atomicity requirement directly targets "discrepancy between real update and manual record." | Problem statement | FR-POS-03, FR-INV-02 | Test |
| FR-POS-07 | No-match handling | If no exact match and no valid substitute exists in stock, the system shall inform the salesperson within the current screen and log the unmet demand against the requested drug for FR-ANL-02 and FR-PROC-01, without blocking the salesperson from starting a new search. | H | Exception path for stock-outs; also feeds procurement and forecasting so unmet demand is not lost, per "recording customer demand." | Problem statement | FR-POS-04 | Test |
| FR-POS-08 | Discount recorded, not gated | The system shall record whatever discount the salesperson applies against a transaction (per BR-02's default reference ceiling) and shall flag, for later review in the insights view (FR-ANL-04), any transaction where the discount exceeds that reference ceiling — without blocking or requiring an approval step, since there is no second person to approve it. | M | Keeps the revenue-leakage signal (from the original discount-authority idea) without inventing an approval workflow that a single-operator store has no one to run. | Derived, simplified per operator request | FR-POS-05, BR-02 | Test |
| FR-POS-09 | Side-effect and usage-direction reference | On drug selection, the system shall make available a one-tap reference panel showing standard dosage direction and common side effects, sourced from the drug master, without requiring the salesperson to recall this from memory. | M | "Cognitive load... in communicating side effects and direction of use." | Problem statement | FR-POS-01 | Demo |

### 4.2 Subsystem: Inventory and Batch Management (INV)

*Addresses: "ineffective stock management and discrepancy between real update and manual record," expiry/wastage visibility.*

| ID | Title | Description | Priority | Rationale | Source | Depends-on | Verification |
|---|---|---|---|---|---|---|---|
| FR-INV-01 | Real-time stock ledger | The system shall maintain a single authoritative stock ledger per drug/batch/lot, updated only through FR-POS-06 (dispatch), FR-PROC-03 (receipt), or an explicit operator stock-adjustment action (FR-INV-04), with no other write path. | H | Single-source-of-truth requirement to eliminate "discrepancy between real update and manual record." | Problem statement | — | Test |
| FR-INV-02 | Batch and lot recording | Every stock-in event shall require entry (manual or scanned) of batch number, lot number, manufacturing date, and expiry date before the received quantity is added to the stock ledger. | H | Supports FR-POS-06's batch/lot dispatch record and FR-INV-05 expiry tracking. | Problem statement | HW-01 | Test |
| FR-INV-03 | Barcode/QR-assisted stock-in and dispatch | Where a batch carries a barcode or QR code (ASM-02), the system shall accept scanner input to populate batch, lot, and product fields automatically, reducing manual keystroke entry. | H | "Manual data entry at every step" — the single most repeated friction point in the problem statement. | Problem statement | HW-01, ASM-02 | Test |
| FR-INV-04 | Stock adjustment with reason code | The system shall allow the operator to make a manual stock adjustment (e.g., after a physical count or a damage/expiry write-off), and shall require selection of a reason code (damage, expiry write-off, physical-count correction, other) for every adjustment. | H | Preserves ledger integrity while allowing for real-world discrepancy correction; reason code feeds the wastage view in FR-ANL-04. | Derived | FR-INV-01 | Test |
| FR-INV-05 | Near-expiry alert | The system shall flag any batch within a configurable threshold (default 90 days, per BR-03) of its expiry date on the insights view (FR-ANL-06) and shall exclude expired stock from the substitute-recommendation ranking in FR-POS-04. | H | Feeds "drug wastage and procurement decisions" analytics and prevents dispensing expired stock. | Problem statement | FR-INV-02 | Test |
| FR-INV-06 | Low-stock reorder threshold | The system shall flag any drug whose total available quantity falls below its configured reorder threshold (BR-01) on the insights view and shall make this flag available to FR-PROC-01. | H | "Ineffective decision making for supplier procurement" begins with not knowing what is low. | Problem statement | FR-INV-01 | Test |

### 4.3 Subsystem: Supplier and Procurement (PROC)

*Addresses: "ineffective decision making for supplier procurement, delay points, lead times," "incomplete record of quality of drugs from each supplier."*

| ID | Title | Description | Priority | Rationale | Source | Depends-on | Verification |
|---|---|---|---|---|---|---|---|
| FR-PROC-01 | Procurement recommendation list | The system shall generate a ranked reorder recommendation list, combining current low-stock flags (FR-INV-06), unmet-demand log (FR-POS-07), and forecasted demand (FR-ANL-02), and shall show this list to the operator at least once daily. | H | Directly resolves "ineffective decision making for supplier procurement." | Problem statement | FR-INV-06, FR-POS-07, FR-ANL-02 | Demo |
| FR-PROC-02 | Supplier record and lead-time history | The system shall maintain, per supplier, a record of contact details, drugs supplied, and historical lead time (order-to-receipt duration) per order. | H | "Delay points, lead times" cannot be managed without a recorded baseline. | Problem statement | — | Test |
| FR-PROC-03 | Purchase order and receipt recording | The operator shall be able to log a purchase order against a supplier and, on receipt, record actual received quantity, batch/lot detail (feeding FR-INV-02), and actual lead time achieved. | H | Closes the loop from recommendation to stock; actual lead time feeds FR-PROC-04. | Derived | FR-PROC-01, FR-PROC-02 | Test |
| FR-PROC-04 | Supplier quality scoring | For every purchase order receipt, the system shall record: on-time delivery (actual vs. promised lead time), quantity discrepancy (ordered vs. received), and a manually entered quality flag (damaged/expired-on-arrival/rejected-batch, if any), and shall compute a rolling supplier-quality score visible on the insights view. | H | "Incomplete record of quality of drugs from each supplier" — this is the first structured record the store will have. | Problem statement | FR-PROC-03 | Test |
| FR-PROC-05 | Low-stock notification | When a drug crosses its reorder threshold (FR-INV-06), the system shall notify the operator via the configured channel (COM-02) within the time bound of NFR-PERF-03. | M | Prevents reorder delay from simply not being noticed. | Derived | FR-INV-06, COM-02 | Test |

### 4.4 Subsystem: Transaction History (TXN)

*Addresses: "recording customer demand" and the data foundation for revenue-leakage visibility — deliberately excludes payment processing (see CON-06, ASM-03). This subsystem replaces a full billing module: it is a record, not a payment system.*

| ID | Title | Description | Priority | Rationale | Source | Depends-on | Verification |
|---|---|---|---|---|---|---|---|
| FR-TXN-01 | Transaction-history record | On dispatch (FR-POS-06), the system shall create a transaction-history entry containing: drug(s), quantity, unit price, discount applied, extended value, timestamp, and the batch/lot dispatched. | H | This is the single data source that everything in §4.5 (insights) and supplier scoring is built from. | Problem statement (derived from "dispatch and update stock") | FR-POS-06 | Test |
| FR-TXN-02 | Optional printed receipt | The operator shall be able to print a simple itemized receipt from a transaction-history record via HW-02, without the system tracking whether or how the customer paid. | M | A printed slip is still useful to hand a customer even though the system does not process payment. | Derived, simplified per operator request | FR-TXN-01, HW-02 | Test |
| FR-TXN-03 | Revenue-leakage flag | The system shall flag, on the insights view (FR-ANL-06), any transaction where the applied discount exceeds the reference ceiling (BR-02) or where the dispatched quantity was manually corrected after initial entry, as the two most common leakage patterns in a manual pharmacy workflow. | M | "No identification on revenue leakage" — kept as a flag on existing transaction data rather than a separate reconciliation module, since there is no payment data to reconcile against. | Problem statement | FR-TXN-01, FR-POS-08 | Test |

### 4.5 Subsystem: Insights View (ANL)

*Addresses: "not knowing drug sales analytics, demand forecasting," "no information on cross-selling," "analytics dashboard on stock piles for fast-selling and long-staying drugs," and the request for one visual, detailed-but-not-comprehensive screen that a single operator can actually use. This is one screen with a few charts, not a multi-module BI product — see NFR-USE-02.*

| ID | Title | Description | Priority | Rationale | Source | Depends-on | Verification |
|---|---|---|---|---|---|---|---|
| FR-ANL-01 | Sales trend chart | The system shall display a simple line or bar chart of total revenue and units sold over a selectable range (7/30/90 days), drawn from FR-TXN-01 data. | H | Baseline "drug sales analytics" the store currently has no visibility into, shown as a chart rather than a report the operator has to interpret. | Problem statement | FR-TXN-01 | Test |
| FR-ANL-02 | Demand forecasting by drug and visit type | The system shall produce a rolling forecast of expected demand per drug for the next reorder cycle (default 7 days, BR-04), segmented by patient-visit type (OTC walk-in vs. prescription-driven, as tagged at FR-POS-06), using historical transaction data. Where fewer than the minimum data points specified in BR-05 exist for a drug (cold start), the system shall fall back to the configured reorder threshold (BR-01) rather than produce an unsupported forecast. | H | "Demand forecasting based upon customer demand and types of patient visits," with an explicit exception path for new drugs or stores with limited history (ASM-05). | Problem statement | FR-TXN-01, ASM-05 | Test |
| FR-ANL-03 | Cross-sell suggestion at point of sale | On dispatch confirmation of a drug, the system shall suggest up to three commonly co-purchased items (OTC or prescription) drawn from historical co-occurrence in past transactions, displayed to the operator before the transaction is closed. | M | "No information on cross-selling of both OTC and prescription drugs." | Problem statement | FR-ANL-01 | Test |
| FR-ANL-04 | Fast-moving / slow-moving stock chart | The system shall present a simple ranked chart classifying every drug in stock as fast-moving, moderate, or slow-moving (BR-06) based on trailing sales velocity, and shall visually mark slow-moving stock nearing expiry (cross-referenced with FR-INV-05). | H | "Analytics dashboard on stock piles for fast-selling drug as well as long-staying drugs," kept to one chart rather than a drill-down report. | Problem statement | FR-ANL-01, FR-INV-05 | Test |
| FR-ANL-05 | Supplier performance chart | The system shall present a simple chart comparing suppliers on on-time delivery rate and quality-flag frequency (from FR-PROC-04), so the operator can see at a glance which suppliers are reliable. | H | "Incomplete record of quality of drugs from each supplier" — turns the recorded data into something visually scannable rather than a raw log. | Problem statement | FR-PROC-04 | Test |
| FR-ANL-06 | Single insights screen | The system shall present FR-ANL-01, FR-ANL-04, FR-ANL-05, FR-INV-05, FR-INV-06, FR-TXN-03, and a wastage-by-value figure (from FR-INV-04 reason codes) together on one screen, without tabs or separate report modules, refreshable on demand. | H | The operator asked for one visual screen — detailed enough to be useful for operational decisions (procurement, leakage, expiry) but not a comprehensive multi-module dashboard. | Derived, per operator request | FR-ANL-01, FR-ANL-04, FR-ANL-05, FR-INV-05, FR-INV-06, FR-TXN-03 | Demo |

### 4.6 Subsystem: Single-Operator Access (SEC)

| ID | Title | Description | Priority | Rationale | Source | Depends-on | Verification |
|---|---|---|---|---|---|---|---|
| FR-SEC-01 | Single device-level login | The system shall require one login (device- or app-level) before any function is accessible, but shall not implement separate user accounts, roles, or privilege tiers, per CON-05. | H | Keeps the counter secure without inventing multi-user infrastructure nobody will use. | Derived, simplified per operator request | CON-05 | Test |

---

## 5. Non-Functional Requirements

### 5.1 Performance

```
ID:     NFR-PERF-01
TAG:    CounterSearchLatency
GIST:   Speed of the drug search-and-stock-check response at the counter.
SCALE:  Time from salesperson submitting a search query to the result list
        (with stock status) being rendered on the Counter Screen.
METER:  Automated timing harness over 500 representative searches during
        acceptance testing, on the reference hardware specified in §2.4.
MUST:   No more than 3 seconds, 95% of the time.
PLAN:   No more than 1.5 seconds, 95% of the time.
WISH:   No more than 0.5 seconds, 95% of the time.
```

```
ID:     NFR-PERF-02
TAG:    DispatchTransactionTime
GIST:   Time to complete the atomic dispatch-and-stock-update transaction (FR-POS-06).
SCALE:  Time from salesperson confirming dispatch to the transaction-history
        record (FR-TXN-01) being created and the stock ledger reflecting
        the new quantity.
METER:  Automated timing harness, 500 transactions, during acceptance testing.
MUST:   No more than 2 seconds, 99% of the time.
PLAN:   No more than 1 second, 99% of the time.
WISH:   No more than 0.3 seconds, 99% of the time.
```

```
ID:     NFR-PERF-03
TAG:    LowStockNotificationLatency
GIST:   Delay between a drug crossing its reorder threshold and the
        operator being notified (FR-PROC-05).
SCALE:  Elapsed time between threshold-crossing event and notification
        delivery to the configured channel.
METER:  Logged timestamps compared across 100 simulated threshold-crossing
        events during testing.
MUST:   No more than 15 minutes.
PLAN:   No more than 5 minutes.
WISH:   Near real-time (under 1 minute).
```

```
ID:     NFR-PERF-04
TAG:    MobileFirstLoadAndInteraction
GIST:   Load and interaction speed of the web application on a mid-range
        phone over a mobile network, since FR-PLT-01 makes the phone the
        primary device.
SCALE:  (a) Largest Contentful Paint of the counter screen on a cold
        first load; (b) Largest Contentful Paint on a repeat launch of the
        installed app (FR-PLT-04); (c) Interaction to Next Paint for the
        search, select and dispatch controls.
METER:  Lighthouse and field-timing runs on the reference phone (Android
        mid-range, 4 GB RAM) over a throttled "Fast 4G" profile, 20 runs
        per measure, during acceptance testing.
MUST:   (a) No more than 4.0 s; (b) no more than 2.0 s; (c) no more than
        200 ms; each at the 75th percentile.
PLAN:   (a) No more than 2.5 s; (b) no more than 1.2 s; (c) no more than
        100 ms; each at the 75th percentile.
WISH:   (a) No more than 1.5 s; (b) no more than 0.8 s; (c) no more than
        50 ms; each at the 75th percentile.
```

### 5.2 Availability and Degraded Operation

```
ID:     NFR-AVL-01
TAG:    CounterTerminalAvailability
GIST:   Availability of the Counter Screen transaction workflow during
        store operating hours.
SCALE:  Percentage of store operating minutes per month in which FR-POS-01
        through FR-POS-06 are usable (locally, if not centrally, per
        NFR-DEG-01).
METER:  Application-level uptime log cross-checked against store operating
        hours, monthly report.
MUST:   99.0%
PLAN:   99.5%
WISH:   99.9%
```

```
ID:     NFR-DEG-01
TAG:    OfflineDispenseOperation
GIST:   Ability to continue dispensing and transaction logging during loss
        of internet connectivity (CON-02).
SCALE:  Maximum continuous duration of internet loss during which FR-POS-01,
        FR-POS-03, FR-POS-05, and FR-POS-06 remain fully operable using a
        locally cached copy of the drug master and stock ledger, with sync
        to the central Data, Records and Insights Layer on reconnection and
        a defined conflict-resolution rule (last-write-wins on stock
        ledger, flagged on the insights view if a conflicting decrement
        occurred).
METER:  Simulated network disconnection during acceptance testing.
MUST:   2 hours.
PLAN:   4 hours.
WISH:   8 hours (a full trading day).
```

### 5.3 Accuracy and Reliability

```
ID:     NFR-ACC-01
TAG:    StockLedgerAccuracy
GIST:   Correctness of the stock ledger relative to physical stock — this
        is a data-integrity property, and for expiry/dosage-adjacent data
        it is treated as a safety property (see NFR-SAFE-01), not merely a
        performance property.
SCALE:  Percentage agreement between system-recorded stock quantity and a
        physical count, per drug/batch, at scheduled audit.
METER:  Monthly physical stock audit against system ledger, sampled across
        at least 30 SKUs.
MUST:   98% agreement.
PLAN:   99.5% agreement.
WISH:   100% agreement.
```

```
ID:     NFR-REL-01
TAG:    ForecastAccuracy
GIST:   Accuracy of the demand forecast (FR-ANL-02) against actual
        subsequent demand.
SCALE:  Mean absolute percentage error (MAPE) between forecasted and
        actual units sold per drug over the forecast horizon (default
        7 days, BR-04), computed only for drugs meeting the minimum
        data-point threshold in BR-05 (i.e., excluding cold-start cases
        which fall back to BR-01 by design).
METER:  Rolling back-test comparing forecast to actual sales, evaluated
        monthly over the preceding quarter.
MUST:   MAPE no worse than 40%.
PLAN:   MAPE no worse than 25%.
WISH:   MAPE no worse than 15%.
```

### 5.4 Security

```
ID:     NFR-SEC-01
TAG:    CredentialAndSessionSecurity
GIST:   Protection of login credentials and session data in transit and at rest.
SCALE:  Percentage of authentication and session-data exchanges that are
        encrypted (per COM-01) and percentage of stored credentials that
        are salted-hashed rather than stored in plaintext.
METER:  Security review / penetration test report before go-live, and
        annually thereafter.
MUST:   100% of both.
PLAN:   100% of both, with zero critical findings in the penetration test.
WISH:   Independent third-party security certification.
```

```
ID:     NFR-SEC-02
TAG:    AccountLockout
GIST:   Resistance to credential-guessing at the single device-level login (FR-SEC-01).
SCALE:  Number of consecutive failed login attempts before the login is
        temporarily locked.
METER:  Test harness attempting repeated failed logins.
MUST:   Lock after 5 failed attempts, for at least 15 minutes.
PLAN:   Lock after 5 failed attempts, for 30 minutes.
WISH:   Adaptive lockout combined with anomaly detection.
```

### 5.5 Safety (Clinical Risk)

```
ID:     NFR-SAFE-01
TAG:    ContraindicationCheckCoverage
GIST:   Coverage of the contraindication check (FR-POS-02) against the
        reference dataset in CON-04 — an explicit clinical-safety
        property, distinct from ordinary functional correctness.
SCALE:  Percentage of dispense transactions for which a contraindication
        check was attempted before dispatch was permitted, and percentage
        of known reference-dataset conflicts correctly flagged in a test
        set.
METER:  Test-set evaluation against a labelled sample of known
        interactions/contraindications, run before go-live and after every
        reference-dataset update.
MUST:   100% of transactions attempt the check; at least 95% of known test
        conflicts flagged.
PLAN:   100% of transactions; at least 99% of known test conflicts flagged.
WISH:   100% of transactions; 100% of known test conflicts flagged, with
        documented residual-risk register for the remainder.
```

```
ID:     NFR-SAFE-02
TAG:    AlertFatigueLimit
GIST:   Rate of contraindication/interruptive alerts shown to a
        salesperson, to prevent the alert from being routinely dismissed
        without being read.
SCALE:  Number of interruptive alerts (UI-02) shown per 100 transactions
        during normal operation.
METER:  Application-level alert log, reviewed monthly; cross-referenced
        against the operator's own "alert seems excessive" feedback.
MUST:   No hard ceiling defined in this release (patient safety takes
        precedence over alert volume), but any rate above 15 per 100
        transactions triggers a mandatory reference-dataset tuning review
        (see TBD-01).
PLAN:   Rate stabilizes below 10 per 100 transactions after tuning.
WISH:   Below 5 per 100 transactions, with zero missed true positives.
```

### 5.6 Usability

```
ID:     NFR-USE-01
TAG:    CounterTaskCompletionWithoutTraining
GIST:   Learnability of the core counter workflow for a new salesperson.
SCALE:  Percentage of new salespersons able to complete a full
        search-to-dispatch transaction (FR-POS-01 through FR-POS-06)
        unassisted after the in-app guided walkthrough (§2.6), with no
        additional classroom training.
METER:  Observed task completion during pilot onboarding of at least 5
        new users.
MUST:   80% unassisted success on first real transaction.
PLAN:   90% unassisted success.
WISH:   95% unassisted success within their first shift.
```

```
ID:     NFR-USE-02
TAG:    InsightsScreenSimplicity
GIST:   How much the insights view (FR-ANL-06) resembles a single,
        scannable screen rather than a multi-module enterprise dashboard —
        a direct constraint from the "single salesperson, not an
        organizational management system" requirement.
SCALE:  Number of top-level screens/tabs required to see all of FR-ANL-01,
        FR-ANL-04, FR-ANL-05, FR-INV-05, FR-INV-06, and FR-TXN-03; and time
        for the operator to visually scan the full screen.
METER:  Design review at sign-off (screen/tab count); timed observation of
        the operator scanning the screen during pilot.
MUST:   1 screen, 0 additional tabs; scannable in under 60 seconds.
PLAN:   1 screen; scannable in under 30 seconds.
WISH:   1 screen; scannable in under 15 seconds, with the single most
        urgent item (e.g., a critical low-stock or expiry flag) visually
        prioritized at the top.
```

```
ID:     NFR-USE-03
TAG:    PhoneOnlyTaskCompletion
GIST:   Whether the full counter workflow can be completed on a phone alone,
        which is the core promise of FR-PLT-01.
SCALE:  Percentage of the High-priority counter tasks (FR-POS-01 to
        FR-POS-06, FR-INV-03 scan-based stock-in, and FR-ANL-06 insights
        scan) completed on a 360 px wide phone, using touch only, without
        a horizontal scroll, mis-tap on a dispatch or discount control, or
        fallback to a desktop.
METER:  Observed task-completion sessions during pilot onboarding of at
        least 5 operators, on their own phones, with a task checklist.
MUST:   100% of the listed tasks completable; no more than 1 mis-tap on a
        dispatch or discount control per 50 transactions.
PLAN:   100% completable; no more than 1 mis-tap per 100 transactions.
WISH:   100% completable; zero observed mis-taps across the pilot.
```

### 5.7 Maintainability and Portability

```
ID:     NFR-MAINT-01
TAG:    DrugMasterExtensibility
GIST:   Ease of adding a new drug, supplier, or reorder rule without a
        code change.
SCALE:  Whether adding a new drug/supplier/threshold requires only
        data entry through the application's settings screen (yes/no), verified by
        inspection of the change process.
METER:  Design review checklist item, verified before release sign-off.
MUST:   Yes — no code change required for routine master-data changes.
PLAN:   Same, plus bulk import support (SW-02).
WISH:   Same, plus a self-service supplier portal for lead-time updates.
```

---

## 6. Other Requirements

### 6.1 Legal and Regulatory

- **BR-07**: Prescription-category drugs (as tagged in the drug master) shall not be dispatched (FR-POS-06) without the salesperson recording that a valid prescription was sighted, consistent with applicable pharmacy regulation; the specific regulatory citation is a **TBD** (see TBD-03) pending confirmation of the store's operating jurisdiction.
- **BR-08**: Any customer personal data incidentally captured (e.g., a phone number given voluntarily) shall be retained only as long as needed for the stated functions of this system and shall not be used beyond them without further consent — treated here as a functional requirement, not merely a policy statement, per the health-domain consent principle. Since this system does not process payment (CON-06), no payment-related personal data is collected in the first place.

### 6.2 Database Requirements

- **BR-09**: The stock ledger (FR-INV-01) and the transaction log (FR-POS-06 outputs) shall be retained for a minimum of the applicable statutory record-retention period for pharmacy sales in the store's jurisdiction (see TBD-03).

### 6.3 Internationalization

- **FR-I18N-01**: The Counter Screen UI (UI-01, UI-02, UI-05) shall support display in English and at least one additional regional language, selectable per store at configuration time, without requiring a separate application build per language.

### 6.4 Business Rules

| ID | Rule |
|---|---|
| BR-01 | Reorder threshold per drug is configurable by the operator; if unset, defaults to 10 units or a 7-day supply at trailing average sales velocity, whichever is greater. |
| BR-02 | Default discount reference ceiling is 5% off list price; discounts above this are recorded and flagged for the operator's own review (FR-POS-08), not blocked, since there is no second person to approve them. |
| BR-03 | Near-expiry alert threshold defaults to 90 days before expiry; configurable per store. |
| BR-04 | Default demand-forecast horizon is 7 days, aligned to the store's typical reorder cycle. |
| BR-05 | Minimum historical data points required before a drug is eligible for forecasting (rather than falling back to BR-01) is 30 transaction-days; exact value subject to model validation (TBD-04). |
| BR-06 | Fast-moving / moderate / slow-moving classification bands (FR-ANL-04) are configurable per store category; default bands to be set during pilot tuning (TBD-05). |
| BR-07 | See §6.1. |
| BR-08 | See §6.1. |
| BR-09 | See §6.2. |

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| OTC | Over-the-counter drug; does not require a prescription. |
| Batch / Lot | A manufacturing-identified subset of a drug's stock, sharing a common manufacture and expiry date. |
| Contraindication | A condition or combination (drug, patient condition, or drug-drug interaction) under which a given drug should not be dispensed without further review. |
| Cross-sell | Recommending an additional, commonly co-purchased item alongside the primary drug being dispensed. |
| Cold start | The condition where insufficient historical data exists for a drug to support a statistically meaningful forecast. |
| Revenue leakage | Loss of expected revenue through unrecorded or excessive discounts or quantity mismatches between what was dispensed and what was logged. |
| Lead time | Elapsed time between a purchase order being placed with a supplier and the goods being received. |
| MAPE | Mean Absolute Percentage Error — a standard forecast-accuracy metric. |

## Appendix B: Insights View — Indicative Layout

One screen, no tabs, sized to be scanned in under a minute (NFR-USE-02):

```
+-----------------------------------------------------------------+
| PharmaAssist — Insights                          [7d 30d 90d]   |
+-----------------------------------------------------------------+
|  Sales trend (FR-ANL-01)         |  Supplier performance (FR-ANL-05)|
|  [line/bar chart: revenue,       |  [chart: on-time % and quality   |
|   units, over selected range]    |   flags per supplier]            |
+-----------------------------------------------------------------+
|  Fast / slow-moving stock (FR-ANL-04)  |  Flags & alerts                |
|  [ranked chart, slow-moving        |  - Low stock (FR-INV-06)         |
|   near-expiry items marked]        |  - Near-expiry (FR-INV-05)       |
|                                     |  - Revenue-leakage (FR-TXN-03)   |
|                                     |  - Wastage value (FR-INV-04)     |
+-----------------------------------------------------------------+
```
On a phone (360 px wide, FR-PLT-01, UI-05) the same cards stack into one vertical column, most urgent first, with no tabs:

```
+---------------------------+
| PharmaAssist   [7d|30d|90d]|
+---------------------------+
| Flags & alerts            |
|  Low stock . Near-expiry  |
|  Leakage . Wastage value  |
+---------------------------+
| Sales trend               |
+---------------------------+
| Fast / slow-moving stock  |
+---------------------------+
| Supplier performance      |
+---------------------------+
```

*(Full wireframe detail is a design-phase deliverable, not part of this SRS. The layouts above are illustrative only, to show that everything fits on one screen, at desktop and phone width, without drill-down tabs.)*

## Appendix C: Open Items (TBD List)

| ID | Open item | Why it is open | Who resolves it, and by when |
|---|---|---|---|
| TBD-01 | Which licensed or open drug-interaction/contraindication reference dataset will be used (CON-04, NFR-SAFE-01). | No dataset has yet been selected or licensed. | Store owner/operator, before design sign-off. |
| TBD-02 | Exact schema for bulk drug-master import (SW-02). | Depends on the format of the store's existing paper or spreadsheet records. | Development team, in consultation with store, during design phase. |
| TBD-03 | Applicable jurisdiction's statutory record-retention period and prescription-sighting requirement (BR-07, BR-09). | Depends on store location/jurisdiction, not yet confirmed in the source problem statement. | Store management / legal advisor, before go-live. |
| TBD-04 | Exact minimum data-point threshold for forecast eligibility (BR-05). | Requires model validation against real or pilot data; a provisional value (30 days) is given but not yet validated. | Development/data-science team, during pilot. |
| TBD-05 | Default fast/moderate/slow-moving classification bands (BR-06). | Depends on store's actual sales-velocity distribution, unknown until pilot data is collected. | Development team with manager input, during pilot tuning. |
| TBD-06 | Minimum supported phone specification and whether the reference phone for NFR-PERF-04 is the operator's own device (FR-PLT-06, ASM-06). | The operator's actual phone model, OS version and mobile-data plan are not stated in the source problem statement. | Store owner/operator, with development team, before design sign-off. |

## Appendix D: Traceability Note

Every functional requirement in Section 4 that is directly quoted or paraphrased from the source problem statement carries **"Problem statement"** in its Source column; requirements without a direct textual anchor in the problem statement but necessary to make those requirements implementable are marked **"Derived"**, so that a reviewer can distinguish elicited requirements from analyst-inferred ones. Requirements marked **"per operator request"** (including FR-PLT-01, the mobile-first web-based delivery requirement) come from an explicit instruction by the SRS owner rather than from the source problem statement.

---

*End of document.*
