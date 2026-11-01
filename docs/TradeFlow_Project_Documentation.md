# 🚚 TradeFlow: Intelligent Ethio-Djibouti Trade Corridor Freight Logistics, Telematics & Digital Escrow Platform

**Comprehensive Final Project Documentation & Technical Report**  
*Software Development Training — Final Group Capstone Project*  
**Submission Date:** November 2026  
**Project Version:** v1.1.6 (Production Release)  

---

### 👥 Project Group Members & Credentials

| Student Full Name | Student ID | Academic Role | Specialized Contributions |
| :--- | :--- | :--- | :--- |
| **BEREKET SAHLEMARIAM** | `CTC-1041-26` | Capstone Group Member | Full-Stack Engineering, Mobile Telematics, Escrow Smart Contract Logic & Cloud Deployment |
| **DAGNAW MEKASHA** | `CTC-1339-26` | Capstone Group Member | System Architecture, Database Schema Design, REST API Engineering & Automated Testing |
| **HAMELMAL BELAYNEH** | `CTC-1116-26` | Capstone Group Member | UI/UX Design System, Multi-Language Localization (Amharic & Afaan Oromoo), Documentation & QA |

---

## 🔗 Project Links & Live Deliverables

| Deliverable | Platform / Type | URL / Access Link |
| :--- | :--- | :--- |
| **GitHub Repository** | Source Code (Monorepo) | [https://github.com/beki255/trade-flow](https://github.com/beki255/trade-flow) |
| **Live Web Application** | Production Web Portal | [https://trade-flow-ukgu.vercel.app](https://trade-flow-ukgu.vercel.app) |
| **Backend REST API (Swagger Docs)** | Cloud Microservice | [https://tradeflow-api-7abs.onrender.com/api/docs](https://tradeflow-api-7abs.onrender.com/api/docs) |
| **API Health & Metrics** | Operational Status Check | [https://tradeflow-api-7abs.onrender.com/api/health](https://tradeflow-api-7abs.onrender.com/api/health) |
| **Mobile Android APK** | Standalone Installable APK (v1.1.6) | [Download TradeFlow v1.1.6 APK](https://expo.dev/artifacts/eas/s_fuNuQqeCoh1iD_uAtLD8ATz7XDYnuO9WwikUil4JI.apk) |
| **EAS Cloud Build Logs** | Expo CI/CD Build #5dbf3408 | [Expo EAS Build Logs](https://expo.dev/accounts/bereket2553/projects/tradeflow-mobile/builds/5dbf3408-9ce5-4517-b42d-85e8580555b2) |

### 📱 Instant Mobile APK Camera QR Scan & Download

Scan this QR code with any smartphone camera to instantly download and install the standalone **TradeFlow Android App (v1.1.6)**:

<p align="center">
  <a href="https://expo.dev/artifacts/eas/s_fuNuQqeCoh1iD_uAtLD8ATz7XDYnuO9WwikUil4JI.apk">
    <img src="tradeflow_v116_qr.png" alt="TradeFlow Android APK Download QR Code" width="160" />
  </a>
  <br />
  <a href="https://expo.dev/artifacts/eas/s_fuNuQqeCoh1iD_uAtLD8ATz7XDYnuO9WwikUil4JI.apk">
    <b>📲 Click Here to Download TradeFlow v1.1.6 APK Directly</b>
  </a>
</p>

---

## 📑 Executive Summary

**TradeFlow** is a modern, cross-platform logistics orchestration, real-time corridor telematics, and digital smart escrow platform purpose-built for the critical **Ethio-Djibouti Trade Corridor**—a 900+ km lifeline carrying over 95% of Ethiopia’s import-export freight.

Historically, this corridor suffers from fragmented manual freight brokerage, exorbitant intermediary markups (15–25%), zero real-time in-transit visibility, frequent cross-border customs gridlocks at Galafi, severe payment defaults, and an alarming 42% empty backhaul rate.

TradeFlow addresses these structural bottlenecks through an integrated digital ecosystem:
1. **Automated Cross-Border Freight Matching Engine** connecting verified shippers and transporters with competitive, transparent pricing.
2. **Milestone-Driven Digital Smart Escrow System** securing 100% of freight payments prior to dispatch and releasing funds upon verified digital proof-of-delivery (e-POD).
3. **Driver Mobile App with Real-Time Telematics & Geofencing** providing automated waypoint check-ins, proximity alerts, and crowdsourced hazard/delay broadcasting.
4. **Single-Window Customs Transit Clearance** featuring digital document dossiers, risk-tier routing (Green/Yellow/Red Line), and cryptographic QR passes for instantaneous border verification.
5. **Universal Accessibility** through full trilingual localization (**English, Amharic, and Afaan Oromoo**) and synchronized dark/light theme engines across both Web and Mobile.

---

## 1. Project Background, Problem Formulation & Scope

### 1.1 The Ethio-Djibouti Strategic Economic Corridor
With a population exceeding 125 million, the Federal Democratic Republic of Ethiopia is the most populous landlocked nation globally. The nation's foreign trade depends almost entirely upon the maritime gateway provided by the Port of Doraleh in the Republic of Djibouti. The 910 km transit corridor connecting Djibouti to inland container dry port terminals at Modjo and Kaliti handles virtually all incoming industrial capital goods, agricultural fertilizer, energy supplies, and commercial imports, as well as outgoing agricultural commodities.

### 1.2 Traditional Freight Logistics Bottlenecks
Field research and logistics industry analysis identify five foundational structural failures across the corridor:
- **Intermediary Brokerage Exploitation:** Freight brokerage is dominated by informal brokers in Addis Ababa and Djibouti who capture 15% to 25% of freight values purely through information asymmetry, inflating consumer prices while leaving transport operators undercompensated.
- **Severe Trust Deficit & Payment Defaults:** Shippers face constant risks of cargo theft, damage, or mid-route freight extortion. Conversely, private truck drivers and small fleet owners face chronic payment defaults or delayed cash disbursements extending 30 to 90 days after delivery.
- **Complete In-Transit Invisibility:** After departing Djibouti, trucks travel for 3 to 7 days through remote desert regions with zero automated tracking. Cargo owners cannot predict arrival times or detect delays, paralyzing industrial manufacturing schedules.
- **Paper-Based Customs Stagnation at Galafi:** Border clearance relies on physical paper manifests and stamps. Drivers wait 24 to 72 hours in extreme desert heat at the Galafi border post, creating immense congestion and truck demurrage costs.
- **The 42% Empty Backhaul Crisis:** Because inbound trucks lack a unified freight exchange to locate outbound agricultural export cargo, over 42% of trucks return to Djibouti completely empty, doubling freight transportation costs.

### 1.3 Core Project Objectives
The primary engineering objectives achieved by the TradeFlow platform include:
1. **Direct Digital Matching:** Eliminate physical middleman cartels by connecting cargo owners directly with commercial truck fleets.
2. **Payment Solvency via Smart Escrow:** Lock freight payments in digital milestone escrow before truck dispatch, releasing funds automatically upon verified electronic Proof-of-Delivery (e-POD).
3. **Automated Telematics & Waypoint Geofencing:** Provide real-time GPS telemetry, dynamic ETA forecasting, and automated checkpoint check-ins across all 11 critical corridor hubs.
4. **Accelerate Border Customs Clearance:** Implement a single-window digital customs interface with dynamic QR passes to reduce border gate inspection time from days to minutes.
5. **National Linguistic Inclusion:** Deliver complete translations in English, Amharic (አማርኛ), and Afaan Oromoo with adaptive dark/light theme ergonomics.

---

## 2. Requirements Specification & User Personas

### 2.1 Five Core Actor Personas
| Role | Target Persona | Primary Responsibilities |
| :--- | :--- | :--- |
| **SHIPPER** | Commercial Importer / Exporter | Creates freight listings, deposits escrow payments, tracks corridor transit in real time, approves delivery e-PODs. |
| **TRANSPORTER** | Fleet Owner / Logistics Company | Registers trucks and drivers, browses open corridor loads, submits competitive bids, dispatches vehicles, tracks fleet earnings. |
| **DRIVER** | Commercial Heavy Truck Driver | Views assigned trips, performs GPS waypoint check-ins, broadcasts route delays/incidents, captures recipient e-signature and photos for e-POD. |
| **CUSTOMS OFFICER** | Ethiopian Customs Commission (ECC) Officer | Inspects digital consignment manifests, verifies declaration & packing lists, issues Green Line passes, scans QR codes at border gates. |
| **ADMINISTRATOR** | TradeFlow System Operator | Verifies carrier business licenses, monitors platform KPIs, manages dispute resolutions, and audits escrow balances. |

### 2.2 Functional Requirements (FR)
- **FR-01 (Authentication & RBAC):** Multi-tenant authentication with JWT bearer tokens, bcrypt password hashing, and role guards protecting administrative endpoints.
- **FR-02 (Freight Marketplace):** Dynamic tender listings with cargo specification, tonnage, packaging, pickup/delivery locations, and target price in ETB.
- **FR-03 (Carrier Bidding Engine):** Transporters submit bids with equipment specifications and proposed freight rate; shippers award bids with a single click.
- **FR-04 (Digital Smart Escrow):** Mandatory 100% upfront payment locking in milestone escrow prior to dispatch; atomic 95% payout release upon approved e-POD.
- **FR-05 (Corridor Telematics & Geofencing):** Background GPS coordinate collection; automated Haversine geofence check-ins within 15 km of 11 transit hubs.
- **FR-06 (Single-Window Customs):** 4-document electronic dossier upload; algorithmic risk routing (Green Line auto-clear); dynamic QR border pass generation.
- **FR-07 (Electronic Proof of Delivery):** Touchscreen capacitive signature pad and geotagged camera photo capture confirming physical delivery.
- **FR-08 (Crowdsourced Incident Broadcasting):** Drivers report corridor road blockages, accidents, and fuel outages with GPS coordinates and photos.
- **FR-09 (Trilingual Localization):** Instant UI language toggle between English, Amharic (አማርኛ), and Afaan Oromoo across web and mobile.
- **FR-10 (Adaptive Ergonomic Theming):** Synchronized Light Mode and High-Contrast AMOLED Dark Mode for desert daylight and nighttime driving.

---

## 3. System Architecture & Monorepo Topology

The TradeFlow platform is architected as a modular TypeScript monorepo managed with **pnpm workspaces**:
```
tradeflow-v2/
├── apps/
│   ├── web/               # Next.js 14 App Router, Tailwind CSS, Leaflet GIS, Lucide Icons
│   └── mobile/            # React Native Expo SDK 52, expo-location, SQLite offline queue
├── services/
│   └── api/               # Node.js + Express + TypeScript REST API Microservice
├── packages/
│   └── shared/            # Shared TypeScript interfaces, corridor coordinates, validation schemas
└── docs/                  # Technical documentation, PDF reports, and APK QR assets
```

---

## 4. Database Design & Prisma Relational Schema

```prisma
// User Account Model
model User {
  id           String      @id @default(uuid())
  email        String      @unique
  passwordHash String
  fullName     String
  phoneNumber  String      @unique
  role         UserRole    @default(SHIPPER)
  tinNumber    String?     @unique
  isVerified   Boolean     @default(false)
  loads        Load[]      @relation("ShipperLoads")
  bids         Bid[]       @relation("TransporterBids")
  shipments    Shipment[]  @relation("DriverShipments")
  createdAt    DateTime    @default(now())
}

// Freight Listing Model
model Load {
  id              String      @id @default(uuid())
  shipperId       String
  shipper         User        @relation("ShipperLoads", fields: [shipperId], references: [id])
  origin          String
  destination     String
  cargoType       CargoType
  weightTons      Float
  targetRateETB   Float
  status          LoadStatus  @default(OPEN)
  bids            Bid[]
  shipment        Shipment?
}

// Smart Escrow Ledger Model
model Payment {
  id             String        @id @default(uuid())
  shipmentId     String        @unique
  shipment       Shipment      @relation(fields: [shipmentId], references: [id])
  totalAmountETB Float
  platformFeeETB Float         // 5% Platform Revenue
  netPayoutETB   Float         // 95% Carrier Disbursement
  paymentMethod  PaymentMethod
  status         PaymentStatus @default(PENDING)
  escrowLockedAt DateTime?
  releasedAt     DateTime?
}
```

---

## 5. Digital Smart Escrow Protocol & Settlements

TradeFlow introduces a programmable digital escrow protocol that locks 100% of agreed freight payments prior to vehicle dispatch and automatically disburses funds upon cryptographically verified proof of delivery:

```
[DRAFT] --> [ESCROW_LOCKED] --> [IN_TRANSIT] --> [ARRIVED_DESTINATION] --> [POD_VERIFIED] --> [ESCROW_RELEASED]
```

### Atomic Database Transactions via Prisma ($transaction)
```typescript
// Atomic Escrow Release Implementation (services/api/src/controllers/payment.controller.ts)
export async function releaseEscrowPayout(shipmentId: string, paymentId: string) {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
    if (payment.status !== 'HELD_IN_ESCROW') {
      throw new Error(`Invalid escrow state: ${payment.status}`);
    }

    const platformFee = payment.totalAmountETB * 0.05; // 5% platform commission
    const netPayout = payment.totalAmountETB * 0.95;   // 95% carrier disbursement

    // 1. Transition payment ledger status to RELEASED
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: { status: 'RELEASED', releasedAt: new Date(), platformFeeETB: platformFee, netPayoutETB: netPayout }
    });

    // 2. Credit transporter digital wallet balance
    await tx.transporterWallet.update({
      where: { userId: payment.shipment.transporterId },
      data: { availableBalanceETB: { increment: netPayout }, lockedEscrowETB: { decrement: payment.totalAmountETB } }
    });

    return updatedPayment;
  });
}
```

---

## 6. Corridor Telematics, GPS Geofencing & Offline Sync

### 11 Strategic Transit Waypoints
1. Addis Ababa (Kaliti ICT) - 0 km (Origin Terminal)
2. Modjo Dry Port & Toll - 73 km (Dry Port / Expressway Junction)
3. Adama Expressway Exit - 99 km (Tollway Interchange)
4. Metehara Sugar Depot - 190 km (Weighbridge Rest Area)
5. Awash Arba Safe Rest - 225 km (Fuel Stop & Truck Parking)
6. Gewane Desert Hub - 360 km (Emergency Depot)
7. Semera Regional Hub - 588 km (Afar Regional Capital Depot)
8. Mille Junction Checkpoint - 515 km (Weighbridge Checkpoint)
9. Logia Transport Terminal - 575 km (Fleet Staging Terminal)
10. Galafi Customs Border - 690 km (Ethiopian Customs Commission Gate)
11. Port of Doraleh (Djibouti) - 910 km (Maritime Container Terminal)

### Mathematical Haversine Distance Formula
```typescript
// Corridor Geofence Calculation (apps/mobile/src/shared/corridor.ts)
export function calculateHaversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
```

---

## 7. Single-Window Customs Clearance & QR Pass

The Galafi border post separating Ethiopia and Djibouti is the primary bottleneck on the corridor. TradeFlow integrates a Single-Window Electronic Customs Dossier (Declaration, Invoice, Packing List, Insurance) and generates a dynamic cryptographic QR pass on the driver mobile screen for instant ECC border clearance.

---

## 8. Driver Mobile Application (React Native Expo SDK 52)

Engineered for extreme durability and offline resilience:
- Dynamic Waypoint Check-Ins with 15 km Haversine geofence unlocking.
- Crowdsourced road hazards and delay broadcasts with geotags.
- Dual-factor electronic Proof of Delivery (e-POD) with touchscreen signature canvas and cargo camera photo.
- AsyncStorage local FIFO queue preserving telemetry pings during Afar desert network drops.

---

## 9. Transporter Fleet Management Portal

- Heavy truck and trailer registry (Flatbed, Lowbed, Box, Tanker).
- Driver allocation and commercial license tracking.
- Open loads bidding engine with ETB rates and transit commitments.
- Real-time escrow wallet ledger with separate locked vs available balances.

---

## 10. Shipper & Customs Web Portals

- Next.js 14 tender creation wizard with automated distance calculation.
- Live Leaflet GIS corridor tracking map with real-time speed and heading.
- Ethiopian Customs Commission (ECC) pre-arrival manifest queue and gate scanner.
- One-click delivery review and atomic escrow release.

---

## 11. Trilingual Localization & Adaptive Theming

- Trilingual dictionaries in English, Amharic (አማርኛ), and Afaan Oromoo.
- Instant language toggle via React Context without page reloads.
- Synchronized Light Mode and high-contrast AMOLED Dark Mode.

---

## 12. Backend REST API Architecture

- Express.js controller-service architecture.
- 15+ real endpoints covering Auth, Loads, Bids, Shipments, Escrow, Customs, Incidents, and Telematics.
- Interactive Swagger OpenAPI documentation (`/api/docs`).
- Health and metrics check (`/api/health`).

---

## 13. Testing, Verification & Quality Assurance

| Test ID | Module | Scenario Tested | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Auth | Multi-role registration & login | Valid JWT token & proper portal routing | **PASS** |
| **TC-02** | Marketplace | Freight listing creation & bid submission | Bid appears on shipper console in real-time | **PASS** |
| **TC-03** | Escrow | Payment locking upon bid acceptance | Escrow status transitions to `HELD_IN_ESCROW` | **PASS** |
| **TC-04** | Telematics | GPS coordinate submission via mobile | Live map updates truck marker on corridor route | **PASS** |
| **TC-05** | Geofencing | Checkpoint arrival within 15 km | Automated waypoint check-in unlocks | **PASS** |
| **TC-06** | Customs | Single-window document submission | Green Line risk classification & QR seal generated | **PASS** |
| **TC-07** | e-POD | Digital signature & photo capture | Shipment marked `DELIVERED`, triggering escrow release | **PASS** |
| **TC-08** | Escrow | Payout execution upon e-POD approval | 95% credited to transporter, 5% platform fee retained | **PASS** |
| **TC-09** | i18n | Trilingual language toggle (EN/AM/OM) | Complete interface translates immediately | **PASS** |
| **TC-10** | Mobile | Standalone Android APK build (v1.1.6) | Installs & runs natively on Android physical devices | **PASS** |

---

## 14. Technical Challenges & Applied Solutions

1. **Afar Desert Cellular Dropouts:** Solved via local AsyncStorage FIFO queue and exponential backoff sync.
2. **Samsung Galaxy A13 Dark Mode Contrast:** Solved via dynamic React style hooks (`getDriverStyles(theme)`).
3. **Escrow Double Payout Race Conditions:** Solved via atomic `prisma.$transaction` database locking.
4. **Expo SDK 52 Native Build Failures:** Solved via custom Expo config plugins and Gradle memory tuning in `eas.json`.
5. **Mountainous Geofence False Positives:** Solved by combining the 15 km threshold with chronological waypoint ordering.

---

## 15. Conclusion & Capstone Team Contributions

### 👥 Capstone Project Group Members
| Student Full Name | Student ID | Academic Role | Specialized Contributions |
| :--- | :--- | :--- | :--- |
| **BEREKET SAHLEMARIAM** | `CTC-1041-26` | Capstone Group Member | Full-Stack Engineering, Mobile Telematics, Escrow Smart Contract Logic & Cloud Deployment |
| **DAGNAW MEKASHA** | `CTC-1339-26` | Capstone Group Member | System Architecture, Database Schema Design, REST API Engineering & Automated Testing |
| **HAMELMAL BELAYNEH** | `CTC-1116-26` | Capstone Group Member | UI/UX Design System, Multi-Language Localization (Amharic & Afaan Oromoo), Documentation & QA |

---
*TradeFlow — Empowering the Ethio-Djibouti Trade Corridor with Smart Logistics & Escrow.*
