# TradeFlow — Intelligent Logistics & Freight Matching Platform

## Comprehensive Software Requirements Specification (SRS) & System Implementation Master Blueprint

---

## 1. Application Overview

### 1.1 Application Name

**TradeFlow** — Intelligent Logistics & Freight Matching Platform for Landlocked Ethiopia

### 1.2 Application Description

TradeFlow is a production-grade, two-sided SaaS marketplace connecting cargo owners (Shippers/Importers/Exporters) with freight carriers (Transporters/Drivers) along Ethiopia's primary trade corridor: **Djibouti Port → Modjo Dry Port → Regional Hubs → Final Destinations (Addis Ababa, Hawassa, Adama, Dire Dawa, Mekelle, Bahir Dar)**.

The platform complements the Ethiopian Shipping and Logistics Services Enterprise (ESLSE) systems by adding a coordination, transparency, and optimization layer across public and private logistics actors.

### 1.3 Core Value Proposition

- **Real-Time Shipment Tracking:** Live GPS tracking with AI-powered dynamic ETA prediction across the entire corridor.
- **Dynamic Pricing Engine:** Spot and contract pricing responsive to real-time fuel costs, corridor congestion, and supply/demand ratios.
- **Fuel-Scarcity & Security-Aware Route Optimization:** Route calculation minimizing distance, travel time, fuel cost, and security risk exposure.
- **Digital Customs Documentation:** Seamless upload, cross-document compliance validation, and clearance status tracking with the Customs Authority.
- **Mobile-Money Settlement & Dispute Resolution:** Integrated TeleBirr/mobile money settlement with automated platform commission deduction and dispute mediation tooling.

### 1.4 Definitions, Acronyms, and Abbreviations

| Term                        | Definition                                                                                                    |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **CVRP**              | Capacitated Vehicle Routing Problem — optimization formulation for fleet routing under capacity constraints. |
| **ETA**               | Estimated Time of Arrival.                                                                                    |
| **Freight Forwarder** | Intermediary arranging multi-party transport/customs on behalf of cargo owners.                               |
| **Modjo Dry Port**    | Ethiopia’s principal inland customs clearance and multi-modal container terminal.                            |
| **Spot Rate**         | Price for a one-off shipment negotiated/computed at the time of booking.                                      |
| **Contract Rate**     | Pre-negotiated recurring price locked between a shipper and transporter for a defined period.                 |
| **TMS**               | Transport Management System.                                                                                  |
| **ESLSE**             | Ethiopian Shipping and Logistics Services Enterprise.                                                         |
| **POD**               | Proof of Delivery (Digital signature, photo, and timestamp).                                                  |
| **TIN**               | Tax Identification Number (የግብር ከፋይ መለያ ቁጥር).                                                    |

### 1.5 References

- IEEE Std 830-1998 (Recommended Practice for Software Requirements Specifications)
- Ethiopian Customs Commission clearance procedure documentation
- Ethiopian Roads Authority road-condition reporting standards

### 1.6 Document Overview & Scope Boundaries

Sections follow standard SRS structure: Overall Description (§2), Page & Module Architecture (§3), Functional Requirements FR-01 to FR-10 (§4), Business Rules & Logic (§5), Exception & Boundary Conditions (§6), Non-Functional Requirements (§7), Data Model (§8), System Architecture (§9), Core Algorithm Specifications (§10), External Interfaces (§11), Acceptance Testing (§12), and Project Scope Boundaries (§13).

#### 1.6.1 Explicitly In-Scope (v1.0)

- Two-sided marketplace matching shippers and transporters.
- Real-time GPS tracking and dynamic ETA calculations.
- Dynamic spot and contract pricing engine.
- Route optimization with fuel station stock & security risk awareness.
- Digital customs documentation and automated validation.
- TeleBirr & mobile money payment initiation, reconciliation, an d dispute workflows.
- Multilingual support (Amharic & English core, Afaan Oromoo extended).

#### 1.6.2 Out of Scope for v1.0

- Bonded-warehouse internal inventory management.
- Vessel booking with international ocean shipping lines (assumed upstream).
- Complex customs duty calculation engines beyond document compliance validation.
- Multi-currency transactions (Ethiopian Birr - ETB only).
- Driver payroll management & vehicle maintenance scheduling.
- Automated insurance claim processing.

---

## 2. User Roles, Access Matrix & Demo Accounts

### 2.1 Role Definitions & Characteristics

| Role                                    | Primary Device             | Technical Proficiency | Core Responsibilities                                                                                                                               |
| :-------------------------------------- | :------------------------- | :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shipper / Importer / Exporter** | Web App (Desktop/Tablet)   | Medium                | Post loads, review quotes & bids, track shipments live on map, upload customs documents, initiate TeleBirr payments, rate transporters.             |
| **Transporter / Owner-Operator**  | Mobile App (Android-first) | Low–Medium           | Manage fleet/vehicles, assign drivers, browse load boards, submit competitive bids, monitor earnings & fuel efficiency analytics.                   |
| **Driver**                        | Mobile App (Offline-ready) | Low                   | Execute trips, turn-by-turn navigation, waypoint check-ins, report geotagged incidents (road blockage, security, fuel outage), capture digital POD. |
| **Freight Forwarder**             | Web App (Desktop)          | Medium–High          | Consolidate multiple shippers' cargo, coordinate customs filings, monitor multi-modal transport.                                                    |
| **Customs Authority Staff**       | Web App (Desktop)          | Medium                | Review digital clearance queue, validate cross-document compliance, approve/reject clearances with official notes.                                  |
| **Platform Administrator**        | Web App (Admin Console)    | High                  | Verify business licenses & TINs, mediate payment disputes, monitor system health, audit logs, fraud detection.                                      |

### 2.2 Demo Accounts (Pre-configured for Testing & Evaluation)

| Role                        | Email                   | Username     | Password       | Target Platform & Route              |
| :-------------------------- | :---------------------- | :----------- | :------------- | :----------------------------------- |
| **Shipper**           | `dawit@miaoda.com`    | `dawit`    | `Demo1234!`  | Web App (`/shipper/dashboard`)     |
| **Freight Forwarder** | `sara@miaoda.com`     | `sara`     | `Demo1234!`  | Web App (`/forwarder/dashboard`)   |
| **Customs Staff**     | `kebede@miaoda.com`   | `kebede`   | `Demo1234!`  | Web App (`/customs/dashboard`)     |
| **Administrator**     | `admin@miaoda.com`    | `admin`    | `Admin2024!` | Web App (`/admin/dashboard`)       |
| **Transporter**       | `mulugeta@miaoda.com` | `mulugeta` | `Demo1234!`  | Mobile App (`/transporter/home`)   |
| **Driver**            | `driver@tradeflow.et` | `driver`   | `Demo1234!`  | Mobile App (`/driver/active-trip`) |

---

## 3. Page Structure & Functional Modules

### 3.1 Web Application Structure (Shipper, Forwarder, Customs, Admin)

```
TradeFlow Web Platform
├── Public Pages
│   ├── Landing Page (Hero, Features, Live Corridor Stats, CTA)
│   ├── Login / Registration (Multi-role selection)
│   └── Role Selection & Verification Status Notice
├── Shipper Portal
│   ├── Dashboard (Active Shipments Overview, Status Tiles, Quick Actions)
│   ├── Load Posting (Step-by-step cargo, dimensions, route, and budget)
│   ├── Bid Management (Compare quotes, transporter rankings, accept bid)
│   ├── Live Tracking Map (Real-time vehicle position, route, ETA & delay alerts)
│   ├── Customs Documents (Upload invoice, packing list, bill of lading, status)
│   ├── Payment History & TeleBirr Checkout (Invoice, receipt, dispute button)
│   └── Transporter Ratings & Reviews
├── Freight Forwarder Portal
│   ├── Multi-Shipper Dashboard (Consolidated view across multiple clients)
│   ├── Consolidated Load Management (Group LTL into FTL loads)
│   ├── Customs Coordination (Batch filing & clearance monitoring)
│   └── Multi-Modal Tracking (Port to Dry Port to Warehouse)
├── Customs Authority Portal
│   ├── Document Review Queue (Pending clearance submissions)
│   ├── Compliance Validation (Side-by-side document review & automated checks)
│   └── Clearance Status Management (Approve, Request Revision, Reject with notes)
└── Administrator Console
    ├── Verification Queue (Review submitted TIN, Trade Licenses, Fleet docs)
    ├── Dispute Resolution (Mediate shipper-transporter payment claims)
    ├── System Health Monitoring (Service uptime, API latency, active users)
    ├── Fraud Detection Dashboard (Suspicious bidding, duplicate accounts)
    └── Audit Logs (Pricing calculations, document approvals, transactions)
```

### 3.2 Mobile Application Structure (Transporter & Driver Only)

```
TradeFlow Mobile App (React Native Expo)
├── Authentication (Phone OTP / Biometric / Password)
├── Transporter Portal (Mobile-First)
│   ├── Fleet Status Overview (Vehicle tracking & driver availability)
│   ├── Load Board (Browse corridor freight, search, filter by cargo & rate)
│   ├── Quick Bid Submission (Set custom price, delivery window, proposal notes)
│   └── Earnings & Fuel Summary (Gross payout, fuel efficiency trends)
└── Driver Portal (Offline-First Architecture)
    ├── Active Trip Dashboard (Cargo overview, destination, emergency button)
    ├── Offline-Capable Turn-by-Turn Navigation (Fuel stops, toll gates, safe zones)
    ├── Waypoint Check-in (GPS location capture + photo timestamp)
    ├── Geotagged Incident Reporting (Accidents, road closures, fuel outages)
    └── Digital Proof-of-Delivery (Digital Signature canvas + Photo upload)
```

---

## 4. Detailed Functional Requirements

### 4.1 FR-01: Multi-Role Onboarding & Verification (Critical)

#### 4.1.1 Registration Process

- Shippers and Transporters register with:
  - Business/legal identity: Trade license number, Tax Identification Number (TIN).
  - Contact information: Email, phone number, physical address.
  - Role selection during registration (`Shipper`, `Transporter`, `Freight Forwarder`, `Driver`).
- Transporters additionally submit:
  - Fleet details: Vehicle type (Flatbed, Box, Container, Tanker), payload capacity (weight/volume), fuel type.
  - Insurance documentation (Upload PDF/Image).
  - Roadworthiness certificate (Upload PDF/Image).

#### 4.1.2 Verification Workflow

- Verification status states: `Pending` → `Verified` → `Suspended`.
- Platform administrators review submitted documents in the verification queue.
- Verification status is clearly visible to users with guidance messaging.
- Audit trail captures all status transitions with timestamp and administrator ID.

#### 4.1.3 Rating System

- Post-trip bidirectional rating (1–5 stars + text review comments).
- Both shipper and transporter rate each other after shipment delivery.
- Average rating is prominently displayed on user profiles.
- Rating history is accessible for marketplace transparency.

#### 4.1.4 Access Control

- Unverified transporters cannot accept bookings or place bids.
- The system blocks the "Accept Load" action with an informative verification-status alert.
- Suspended accounts lose access to all transactional functions.

---

### 4.2 FR-02: AI-Powered Freight Matching & Bidding (Critical)

#### 4.2.1 Load Posting

- Shippers input load details:
  - Origin location (address + GPS coordinates).
  - Destination location (address + GPS coordinates).
  - Cargo type and description (e.g., Coffee Beans, Industrial Machinery, Textiles).
  - Weight (tons) and volume ($m^3$).
  - Required pickup date/time window.
  - Special handling requirements (e.g., Refrigerated, Fragile, Hazardous).

#### 4.2.2 Matching Engine

- System ranks eligible transporters by weighted utility score:
  - Cost ($w_1$)
  - Historical reliability / on-time delivery rate ($w_2$)
  - Fuel efficiency rating ($w_3$)
  - Proximity and current availability ($w_4$)
- Matching response time SLA: $< 1.0\text{ second}$ (P95).
- Top-ranked transporters are presented to the shipper with match score breakdowns.

#### 4.2.3 Booking Options

- **Option A (Instant Match):** Shipper accepts top-ranked match directly at the system-calculated spot rate.
- **Option B (Competitive Bidding):** Shipper opens the load to competitive bidding:
  - Shortlisted qualified transporters receive bid invitations.
  - Transporters submit bids with price (ETB) and proposed timeline.
  - Shipper reviews bids and selects the preferred transporter.

#### 4.2.4 Bid Management

- Transporters view available corridor loads on the interactive load board.
- Filter and search by origin/destination, cargo type, tonnage, and date range.
- Submit bids with custom pricing, pickup estimates, and notes.
- Receive instant acceptance or rejection notifications.

---

### 4.3 FR-03: Real-Time Shipment Tracking & ETA Prediction (Critical)

#### 4.3.1 GPS Position Tracking

- GPS position updates transmitted minimum every 5 minutes during transit.
- Position telemetry includes: latitude, longitude, timestamp, speed (km/h), heading, and fuel level.
- Offline queuing when connectivity is lost; automatic background sync upon reconnect.

#### 4.3.2 Live Tracking Map

- Interactive map interface showing:
  - Current vehicle position and animated truck icon.
  - Planned route line vs. completed route segments.
  - Waypoints along the Djibouti–Modjo–Addis Ababa corridor.
  - Fuel station stock indicators and flagged risk zones.
- Map updates with $< 5\text{ seconds}$ latency under normal connectivity.

#### 4.3.3 Dynamic ETA Calculation

- ETA recalculates dynamically using:
  - Live GPS position and current speed.
  - Historical corridor transit-time benchmarks.
  - Current weather conditions (rain, visibility).
  - Known congestion alerts at toll gates & dry ports.
  - Flagged security/conflict zones.
- ETA displayed with confidence interval (e.g., `ETA: 14:30 ± 20 mins`).

#### 4.3.4 Milestone Notifications

- Automated notifications dispatched at key shipment milestones:
  1. `Departed Origin` (Djibouti Port / Regional Hub)
  2. `Arrived at Modjo Dry Port`
  3. `Cleared Customs Checkpoint`
  4. `Arrived at Final Destination`
- Delivery channels: In-app notification, Push (FCM), SMS fallback, and Email.

---

### 4.4 FR-04: Dynamic Pricing Engine (High)

#### 4.4.1 Spot Rate Calculation

- Spot rates computed using:
  - Base corridor distance rate ($ETB/km$).
  - Current demand-to-capacity ratio along the corridor.
  - Fuel cost index multiplier (diesel price fluctuations).
  - Corridor congestion and checkpoint delay surcharge.
- Rates refreshed minimum hourly.
- Pricing transparency: Full itemized cost breakdown displayed to users.

#### 4.4.2 Contract Rate Management

- Shippers may lock contract rates for defined multi-week/month periods.
- System automatically flags contract rates diverging materially ($> 20\%$) from prevailing spot rates.
- Renegotiation review workflow is triggered for flagged contracts.

#### 4.4.3 Pricing Audit Trail

- All price computations are logged with exact input parameters used.
- Audit log includes: timestamp, input variables, calculated rate, requester ID.
- Accessible for dispute resolution and compliance audits.

---

### 4.5 FR-05: Fuel & Security-Aware Route Optimization (High)

#### 4.5.1 Route Recommendation

- System recommends routes minimizing weighted cost of:
  - Distance ($km$)
  - Estimated travel time ($hrs$)
  - Fuel consumption ($liters$)
  - Risk exposure (proximity to security zones)
- Route calculation dynamically factors in:
  - Live fuel station stock levels along the highway.
  - Active conflict/security risk zones.
  - Road construction and surface condition data.

#### 4.5.2 Driver Incident Reporting

- Drivers report geotagged incidents directly from mobile/web app:
  - Accident
  - Checkpoint / Customs delay
  - Fuel station stockout
  - Road blockage / landslide
  - Security incident
- Incident reports capture: GPS location, timestamp, category, description, photo upload.
- Verified incident reports immediately update the corridor routing graph.

#### 4.5.3 Dynamic Rerouting

- System automatically proposes rerouting when a materially safer or faster path is detected.
- Rerouting proposal shows: new route polyline, time/cost delta, and specific reason.
- Requires driver or dispatcher confirmation before altering an active shipment route.

---

### 4.6 FR-06: Digital Customs Documentation (High)

#### 4.6.1 Document Upload

- Shippers upload key international trade clearance documents:
  - Commercial Invoice
  - Packing List
  - Bill of Lading (B/L)
  - Certificate of Origin
- Supported formats: PDF, JPEG, PNG.
- Metadata captured: document type, document number, issue date, issuing authority, declared value.

#### 4.6.2 Automated Pre-Submission Validation

- Pre-submission automated consistency checks:
  - Document completeness (all required mandatory fields present).
  - Cross-document consistency (e.g., cargo weight on Invoice matches Packing List and Bill of Lading).
  - File integrity and format compliance.
- Validation errors surfaced with actionable inline correction guidance.

#### 4.6.3 Clearance Status Workflow

- Status lifecycle: `Draft` → `Submitted` → `Under Review` → `Cleared` / `Rejected`.
- Customs Authority Staff review documents in a specialized verification queue.
- Customs Officers update clearance status with official stamps and review notes.
- Rejection reasons are immediately surfaced to the shipper/forwarder for resubmission.

---

### 4.7 FR-07: Fuel Consumption Analytics (High)

#### 4.7.1 Consumption Tracking

- Tracks estimated vs. actual fuel consumption per completed trip.
- Sources: GPS speed telematics and driver fuel purchase logs.
- Metrics computed: Total liters consumed, fuel cost ($ETB$), fuel efficiency ($km/L$).

#### 4.7.2 Efficiency Trends & Benchmarking

- Visualizes fuel efficiency trends per:
  - Individual vehicle and vehicle class.
  - Driver.
  - Route corridor segment.
  - Monthly time periods.
- Highlights efficiency outliers (positive savings vs. excessive consumption).

#### 4.7.3 Optimization Recommendations

- Generates data-driven optimization suggestions:
  - Driving behavior adjustments (speed limits, idling reduction).
  - Route alternatives with smoother elevation profiles.
  - Vehicle maintenance suggestions (tire pressure, engine service).

---

### 4.8 FR-08: Conflict Zone Alerts & Rerouting (Medium)

#### 4.8.1 Risk Zone Database

- Continuously maintained database of flagged security zones along trade corridors.
- Sourced from: Government security advisories, verified driver crowdsourcing, and authority reports.
- Risk severity levels: `Low` (Yellow), `Medium` (Orange), `High` (Red), `Critical` (Black).

#### 4.8.2 Proactive Geofence Alerts

- Real-time alerts pushed to drivers and dispatchers approaching flagged zones (e.g., within 25 km).
- Alert includes: risk severity, description, verified timestamp, and recommended detour.

#### 4.8.3 Alternate Routing

- System calculates alternative bypass routes avoiding high-risk zones.
- Comparison matrix shows: distance delta, estimated delay, fuel difference, and safety rating.

---

### 4.9 FR-09: Transporter Performance Analytics (Medium)

#### 4.9.1 Performance Metrics

- Monthly aggregated KPIs per transporter:
  - On-time delivery rate ($\%$).
  - Incident rate (incidents per 100 trips).
  - Average fuel efficiency ($km/L$).
  - Customer satisfaction rating ($1.0 - 5.0$ stars).
  - Total trips completed & gross revenue earned ($ETB$).

#### 4.9.2 Benchmarking Dashboard

- Self-service dashboard allowing transporters to compare their performance against:
  - Anonymized corridor averages.
  - Top-tier 10% performers.
  - Their own historical trends.
- Visual charts: monthly trend lines, percentile gauges, and efficiency breakdowns.

---

### 4.10 FR-10: Payment & Settlement (Medium)

#### 4.10.1 Payment Initiation

- Shippers initiate payment upon shipment completion and valid proof-of-delivery (POD).
- Supported methods: **TeleBirr**, CBE Birr, and mobile money equivalents.
- Total amount: Agreed contract/spot rate $+$ approved accessorial charges $-$ penalties.

#### 4.10.2 Automated Reconciliation & Settlement

- Instant payment confirmation from payment provider webhooks.
- Settlement status: `Pending` → `Confirmed` → `Settled` / `Failed`.
- Automated transaction ledger reconciles payments against completed trip IDs.

#### 4.10.3 Platform Commission & Transporter Payout

- Configurable platform commission (e.g., 5.0%) automatically calculated and deducted.
- Automated payout scheduling to transporter mobile money wallets / bank accounts.
- Payout amount: $\text{Trip Earnings} - \text{Platform Commission} - \text{Withholding Deductions}$.

#### 4.10.4 Dispute Resolution Workflow

- Users can flag payment discrepancies or cargo damage via the dispute module.
- Dispute ticket captures: issue description, photo evidence, claimed amount, requested resolution.
- Routed to Platform Administrator console for review, mediation, escrow adjustment, or refund.

---

## 5. Business Rules & Logic

### 5.1 Verification & Access Control

- Unverified transporters cannot accept bookings or place bids.
- Suspended accounts lose access to all transactional functions.
- Verification status must be `Verified` for market participation.

### 5.2 Matching & Bidding

- Matching algorithm weights are configurable per shipper preference (e.g., cost-priority vs. speed-priority).
- Minimum 3 qualified transporters required to open competitive bidding.
- Bid validity period defaults to 24 hours (configurable).
- Shippers must accept or decline bids within the validity window.

### 5.3 Tracking & ETA

- GPS position updates required minimum every 5 minutes during active transit.
- ETA recalculation triggered by: GPS location update, verified incident report, route alteration, or checkpoint delay.
- Milestone notifications dispatched strictly once per milestone event per shipment.

### 5.4 Pricing Engine Rules

- Spot rates cannot be manually overridden by users (system computed).
- Contract rates require administrator approval if deviating $> 20\%$ from prevailing spot rates.
- All pricing inputs, intermediate factors, and timestamps are permanently logged for audit.

### 5.5 Route Optimization Rules

- Critical risk zones are automatically excluded from generated route recommendations.
- Drivers can override system route recommendations only with required written justification.
- Route changes during an active trip require explicit driver or dispatcher confirmation.

### 5.6 Customs Documentation Rules

- All 4 required documents (Invoice, Packing List, B/L, Certificate of Origin) must be uploaded before requesting customs review.
- Pre-submission validation checks must pass with zero critical errors before submission to Customs Authority queue.
- Rejected documents require resubmission with correction notes.

### 5.7 Payment & Settlement Rules

- Payment initiation requires shipment status `Delivered` and digital proof-of-delivery (signature + photo).
- Platform commission is deducted automatically from transporter payout.
- Disputed payments are held in escrow pending administrator resolution.

---

## 6. Exception & Boundary Conditions

| Scenario                                                     | System Behavior                                                                                                                        |
| :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| **GPS signal lost during transit**                     | Telematics cached locally on driver device; auto-synced upon reconnect; ETA uses last known position and historical corridor velocity. |
| **No qualified transporters available for load**       | Notify shipper immediately; suggest expanding search radius, increasing budget, or adjusting pickup window.                            |
| **Bid expires without shipper response**               | Bid status automatically changes to`Expired`; transporter notified; slot released.                                                   |
| **Driver reports incident in high-risk zone**          | Immediate high-priority alert to dispatcher and shipper; automated rerouting proposal generated.                                       |
| **Customs document validation fails**                  | Block submission; highlight conflicting fields across documents with inline correction advice.                                         |
| **Payment confirmation not received within 24 hours**  | Flag payment as`Pending Confirmation`; automated SMS/in-app reminder dispatched to shipper.                                          |
| **Transporter rating drops below 3.0 stars**           | Trigger automated performance review; flag account in Administrator Verification Queue for potential suspension.                       |
| **Fuel station reports out-of-stock**                  | Update corridor routing graph immediately; exclude station from recommended fueling stops.                                             |
| **Duplicate account detected**                         | Flag account for administrator review; suspend duplicate account pending TIN/license verification.                                     |
| **Mobile app offline for > 1 hour during active trip** | Alert dispatcher dashboard; initiate SMS milestone ping fallback.                                                                      |

---

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance

- Freight matching response time: $< 1.0\text{ second}$ (P95) for standard load postings.
- Tracking update latency: $< 5.0\text{ seconds}$ from device transmission to web dashboard display under normal connectivity.

### 7.2 Availability & Reliability

- 99.9% uptime SLA for core marketplace and tracking microservices.
- Offline queuing for driver check-ins and incident reports, automatically syncing upon reconnect with conflict resolution favoring the most-recent authoritative timestamp.

### 7.3 Scalability

- System designed to support 50,000+ active monthly shipments and 10,000+ peak concurrent users.
- Microservices architecture allowing independent auto-scaling of GPS ingestion and matching components.

### 7.4 Security & Compliance

- Role-Based Access Control (RBAC) across all endpoints and UI views.
- TLS 1.2+ encryption for all network traffic; AES-256 encryption for data at rest.
- Fraud-detection heuristics for suspicious bidding rings, duplicate accounts, and altered document uploads.
- Full tamper-evident audit logging for all pricing decisions, document clearances, and financial transactions.
- Compliance with Ethiopian Customs Commission data regulations and local data residency standards.

### 7.5 Usability & Multilingual Support

- Driver mobile interface optimized for one-handed, glance-based use while stationary; large touch targets, high contrast, and minimal text entry.
- Multilingual interface supporting **Amharic (አማርኛ)** and **English** natively, with architectural support for **Afaan Oromoo**.

---

## 8. High-Level Data Model & Retention

### 8.1 14 Core Entities

1. **User / Profile:** `id`, `role`, `fullName`, `companyName`, `email`, `phone`, `tin`, `tradeLicenseNo`, `verificationStatus` (`Pending`, `Verified`, `Suspended`), `ratingAvg`, `createdAt`.
2. **Shipper:** `id`, `userId`, `companyType`, `defaultPaymentMethod`, `contractRatesEnabled`.
3. **Transporter:** `id`, `userId`, `fleetSize`, `insuranceDocUri`, `roadworthinessDocUri`, `totalCompletedTrips`.
4. **Vehicle:** `id`, `transporterId`, `plateNumber`, `vehicleType` (`Flatbed`, `Container_Carrier`, `Tanker`, `Box_Truck`), `capacityWeightTons`, `capacityVolumeCbm`, `fuelType`, `telematicsDeviceId`.
5. **Driver:** `id`, `transporterId`, `assignedVehicleId`, `driverLicenseNo`, `licenseClass`, `phone`, `activeShipmentId`.
6. **Load:** `id`, `shipperId`, `originName`, `originLat`, `originLng`, `destName`, `destLat`, `destLng`, `cargoType`, `weightTons`, `volumeCbm`, `pickupWindowStart`, `pickupWindowEnd`, `targetPriceEtb`, `status` (`Open`, `Bidding`, `Booked`, `In_Transit`, `Delivered`, `Cancelled`).
7. **Bid:** `id`, `loadId`, `transporterId`, `bidAmountEtb`, `proposedPickupDate`, `proposedDeliveryDate`, `validityHours`, `notes`, `status` (`Pending`, `Accepted`, `Rejected`, `Expired`).
8. **Shipment:** `id`, `loadId`, `transporterId`, `driverId`, `vehicleId`, `agreedRateEtb`, `activeRouteId`, `customsStatus` (`Not_Required`, `Submitted`, `Under_Review`, `Cleared`, `Rejected`), `status` (`Assigned`, `Dispatched`, `At_Customs`, `Customs_Cleared`, `Out_For_Delivery`, `Delivered`), `podSignatureUri`, `podPhotoUri`, `podTimestamp`.
9. **TrackingEvent:** `id`, `shipmentId`, `latitude`, `longitude`, `speedKmh`, `heading`, `fuelLevelPct`, `eventTimestamp`, `source` (`Driver_App`, `OBD_Hardware`, `Offline_Sync`).
10. **Route:** `id`, `shipmentId`, `waypointsJson`, `totalDistanceKm`, `estimatedTransitHours`, `fuelStopsJson`, `securityRiskZonesJson`.
11. **PriceQuote:** `id`, `corridorId`, `baseRateEtb`, `demandRatio`, `fuelCostIndex`, `congestionSurchargeEtb`, `calculatedTotalEtb`, `floorBoundEtb`, `ceilingBoundEtb`, `timestamp`.
12. **CustomsDocument:** `id`, `shipmentId`, `docType` (`Commercial_Invoice`, `Packing_List`, `Bill_of_Lading`, `Certificate_of_Origin`), `fileUri`, `docNumber`, `issueDate`, `declaredValueEtb`, `validationStatus` (`Passed`, `Failed`), `validationErrorsJson`, `clearanceStatus` (`Draft`, `Submitted`, `Under_Review`, `Cleared`, `Rejected`), `customsOfficerNotes`.
13. **Payment:** `id`, `shipmentId`, `shipperId`, `transporterId`, `grossAmountEtb`, `commissionRatePct`, `platformCommissionEtb`, `netTransporterPayoutEtb`, `paymentProvider` (`TeleBirr`, `CBE_Birr`), `paymentRefNo`, `status` (`Pending`, `Confirmed`, `Disputed`, `Settled`).
14. **IncidentReport / Rating:** Geotagged incident logs (category, coordinates, severity, photo) and Bidirectional post-trip ratings (1-5 stars, feedback text).

### 8.2 Entity Relationships

- A `Load` receives many `Bid` records from `Transporter` entities; accepting a `Bid` creates a `Shipment`.
- A `Shipment` references a `Route`, a time-series stream of `TrackingEvent` records, one or more `CustomsDocument` records, and a `Payment`.
- A `Payment` links directly to a `Shipment` with commission deductions and dispute capabilities.
- `Rating` entities are bidirectional (`Shipper → Transporter` and `Transporter → Shipper`), linked to a completed `Shipment`.

### 8.3 Data Retention Policy

- Shipment, customs document, and payment financial records are retained for a minimum of **7 years** for statutory tax and regulatory audit compliance.
- High-frequency raw GPS telematics events are retained for **1 year**, after which they are aggregated into historical corridor performance benchmarks.

---

## 9. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. PRESENTATION LAYER                                                       │
│    • Web Dashboard (Shippers, Forwarders, Customs, Administrators)          │
│    • Mobile-Responsive / PWA App (Transporters & Offline Driver Interface)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. API & SECURITY GATEWAY                                                   │
│    • RESTful & GraphQL Gateways • RBAC Middleware • JWT Auth • Rate Limiter │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. APPLICATION SERVICES LAYER                                               │
│    • Onboarding & Verification Service   • AI Matching & Bidding Engine     │
│    • Real-Time Tracking & ETA Service    • Dynamic Pricing Engine           │
│    • Route Optimization (CVRP) Service   • Digital Customs Document Service │
│    • Payment & TeleBirr Settlement       • Notification & Push Service      │
│    • Fleet & Fuel Analytics Service      • Ratings & Performance Benchmark  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. DATA STORAGE LAYER                                                       │
│    • Transactional Database (PostgreSQL / SQLite / Prisma)                  │
│    • Time-Series Store (GPS telemetry, speed, fuel sensor logs)              │
│    • Object Storage (Clearance documents, POD signatures, incident photos)  │
│    • In-Memory Cache & Search Index (Fast load/transporter discovery)       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. ML & ANALYTICS LAYER                                                     │
│    • Gradient-Boosted ETA Prediction Model • Dynamic Pricing Multipliers     │
│    • Risk Zone Geofencing Engine • Fraud Detection Heuristics               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. INTEGRATION LAYER (Adapters & Gateways)                                  │
│    • Ethiopian Customs Commission • Ethiopian Roads Authority               │
│    • Telematics / MQTT Ingestion • TeleBirr / Mobile Money Webhooks        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Core Algorithm Specifications

### 10.1 Freight Matching Algorithm (Multi-Objective Utility Ranking)

When a shipper queries or posts a load, available qualified transporters are scored and ranked:

$$
\text{Score} = w_1 \cdot \text{Norm}(Cost) + w_2 \cdot Reliability + w_3 \cdot \text{Norm}(FuelEfficiency) + w_4 \cdot Proximity
$$

- **$\text{Norm}(Cost)$:** $\frac{\text{Budget} - \text{EstimatedCost}}{\text{Budget}}$ (Normalized $0.0 - 1.0$)
- **$Reliability$:** $\text{Historical On-Time Rate} \times \frac{\text{Rating}}{5.0}$ ($0.0 - 1.0$)
- **$\text{Norm}(FuelEfficiency)$:** $\frac{\text{Actual } km/L}{\text{Corridor Benchmark } km/L}$ ($0.0 - 1.0$)
- **$Proximity$:** $1 - \min\left(1.0, \frac{\text{Distance to Origin } (km)}{150}\right)$
- Configurable weights: $w_1 = 0.35, w_2 = 0.30, w_3 = 0.15, w_4 = 0.20$ ($\sum w_i = 1.0$).
- Target Response Time: $< 1.0\text{ second}$ (P95).

### 10.2 Dynamic Pricing Engine Formula

The corridor spot price is computed dynamically:

$$
\text{SpotRate} = \left( \text{BaseCorridorRate} \times \frac{\text{CorridorDemand}}{\text{CorridorCapacity}} \times \text{FuelCostIndex} \right) + \text{CongestionSurcharge}
$$

- **Bounds Check:** Rate is clamped between $\text{FloorRate}$ (break-even operational cost) and $\text{CeilingRate}$ (regulatory price cap) to prevent extreme volatility.
- **Audit Logging:** Every computation records input factors, timestamps, and requester IDs.

### 10.3 ETA Prediction Model

Combines real-time telematics with historical segment transit data:

$$
\text{ETA} = T_{\text{current}} + \sum_{i=\text{remaining legs}} \left( \frac{d_i}{v_{\text{historical}, i} \cdot \mu_{\text{weather}} \cdot \mu_{\text{traffic}}} \right) + T_{\text{customs\_delay}}
$$

- Recomputed upon every GPS position update, reported incident, or route change.

### 10.4 Fuel & Security Route Optimization (Time-Dependent CVRP)

- Modeled as a time-dependent Capacitated Vehicle Routing Problem where edge traversal costs vary with fuel station stock, road conditions, and security risk levels.
- Solved with Large Neighborhood Search (LNS) metaheuristic for near-optimal routes in $< 3\text{ seconds}$.

---

## 11. External Interfaces

### 11.1 Software Interfaces

| Interface                                   | Protocol                    | Direction     | Data Exchanged                                                                               |
| :------------------------------------------ | :-------------------------- | :------------ | :------------------------------------------------------------------------------------------- |
| **Ethiopian Customs Commission**      | REST / Secure File Transfer | Bidirectional | Digital clearance documents (outbound), clearance status updates & digital stamps (inbound). |
| **Ethiopian Roads Authority**         | REST / Batch API            | Inbound       | Real-time road condition alerts, construction closures, landslide reports.                   |
| **Fleet GPS / Telematics Providers**  | REST / MQTT over TLS        | Inbound       | High-frequency vehicle coordinates, speed, heading, fuel sensor telemetry.                   |
| **Fuel Station Partner Network**      | REST API                    | Inbound       | Fuel availability, diesel stock levels, regional pump pricing.                               |
| **TeleBirr & Mobile Money Providers** | REST / Webhook              | Bidirectional | Payment initiation, OTP validation, settlement webhooks.                                     |

### 11.2 Communications Interfaces

- **Security:** TLS 1.2+ for all web and API traffic; MQTT over TLS for vehicle telematics.
- **Push & Alerts:** Firebase Cloud Messaging (FCM) / Apple Push Notifications (APNs) for mobile app; SMS gateway fallback for low-connectivity drivers.

---

## 12. Complete User Journey Acceptance Test

1. **Onboarding & Verification:** Shipper registers account with trade license and TIN (`dawit@miaoda.com`). Administrator verifies credentials in admin queue.
2. **Load Posting:** Shipper posts 25-ton coffee export load from Modjo Dry Port to Djibouti Port.
3. **Freight Matching:** AI Engine returns ranked list of qualified transporters in $< 1\text{s}$. Shipper accepts top match (`mulugeta@miaoda.com`).
4. **Digital Customs Filing:** Shipper uploads Commercial Invoice and Bill of Lading. Customs Officer (`kebede@miaoda.com`) validates and clears documents.
5. **Transit & Live Tracking:** Assigned driver departs origin. Live map updates GPS coordinates every 5 minutes with dynamic ETA.
6. **Milestones & Incident Handling:** Milestone alerts sent as truck clears checkpoints. Driver submits digital POD (signature + cargo photo) upon delivery.
7. **Payment Settlement:** Shipper initiates payment via TeleBirr. 5% platform commission deducted automatically; transporter receives net payout.
8. **Rating:** Both parties exchange 5-star ratings and feedback.
