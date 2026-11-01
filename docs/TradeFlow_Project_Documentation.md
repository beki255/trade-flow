# 🚚 TradeFlow: Intelligent Ethio-Djibouti Trade Corridor Freight Logistics, Telematics & Digital Escrow Platform

**Comprehensive Final Project Documentation & Technical Report**  
*Software Development Training — Final Group Capstone Project*  
**Submission Date:** November 2026  
**Project Version:** v1.1.5 (Production Release)  

---

## 🔗 Project Links & Live Deliverables

| Deliverable | Platform / Type | URL / Access Link |
| :--- | :--- | :--- |
| **GitHub Repository** | Source Code (Monorepo) | [https://github.com/beki255/trade-flow](https://github.com/beki255/trade-flow) |
| **Live Web Application** | Production Web Portal | [https://trade-flow-mu.vercel.app](https://trade-flow-mu.vercel.app) *(or https://tradeflow.et)* |
| **Backend REST API** | Cloud Microservice | [https://tradeflow-api-7abs.onrender.com](https://tradeflow-api-7abs.onrender.com) |
| **API Health & Metrics** | System Status | [https://tradeflow-api-7abs.onrender.com/health](https://tradeflow-api-7abs.onrender.com/health) |
| **Mobile Android APK** | Standalone Installable APK (v1.1.5) | [Download TradeFlow v1.1.5 APK](https://expo.dev/artifacts/eas/T1ZfHOLf-u_evYzO0aEfLD4MJtnN7FSQecclu_UrVAk.apk) |
| **EAS Cloud Build Logs** | Expo CI/CD Build #858790e9 | [Expo EAS Build Logs](https://expo.dev/accounts/bereket2553/projects/tradeflow-mobile/builds/858790e9-fae7-4531-b448-1df457864a6e) |

---

## 📑 Executive Summary

**TradeFlow** is a modern, cross-platform logistics orchestration, real-time corridor telematics, and digital smart escrow platform purpose-built for the critical **Ethio-Djibouti Trade Corridor**—a 900+ km lifeline carrying over 95% of Ethiopia’s import-export freight.

Historically, this corridor suffers from fragmented manual freight brokerage, exorbitant intermediary markups (15–25%), zero real-time in-transit visibility, frequent cross-border customs gridlocks at Galafi, severe payment defaults, and an alarming 42% empty backhaul rate.

TradeFlow resolves these systemic friction points by unifying shippers, freight forwarders, fleet transporters, truck drivers, and customs regulatory bodies into a secure, automated, and transparent digital ecosystem. The platform integrates:
1. **Intelligent Load Matching & Competitive Bidding Engine** that eliminates exploitative middlemen.
2. **Milestone-Driven Digital Smart Escrow System** securing 100% of freight payments prior to dispatch and releasing funds upon verified digital proof-of-delivery (e-POD).
3. **Driver Mobile App with Real-Time Telematics & Geofencing** providing automated waypoint check-ins, proximity alerts, and crowdsourced hazard/delay broadcasting.
4. **Single-Window Customs Transit Clearance** featuring digital document dossiers, risk-tier routing (Green/Yellow/Red Line), and cryptographic QR passes for instantaneous border verification.
5. **Universal Accessibility** through full trilingual localization (**English, Amharic, and Afaan Oromoo**) and synchronized dark/light theme engines across both Web and Mobile.

---

## 1. Project Objectives & Scope

### 1.1 Problem Statement
The Ethio-Djibouti logistics corridor handles more than 12 million tons of cargo annually between the Port of Doraleh (Djibouti) and inland dry ports (Modjo, Kaliti, Semera). Despite its economic gravity, the corridor faces severe logistical bottlenecks:
- **Brokerage Friction & Price Opacity:** Private truck owners rely on informal spot brokers in Addis Ababa and Djibouti who take large cuts without guaranteeing performance or payment safety.
- **Payment Insecurity & Liquidity Delays:** Transporters wait 30–60 days for freight settlements, while cargo owners risk driver abandonment or cargo pilferage once down payments are remitted.
- **Customs Verification Gridlock:** Paper-based transit documents cause multi-day queues at Galafi border post and Modjo Dry Port, incurring heavy demurrage penalties.
- **Blind Corridor Transit:** Shippers have no live tracking or estimated time of arrival (ETA) data once trucks enter remote Afar/Somali desert stretches.
- **Empty Return Trips (Backhaul Inefficiency):** Over 40% of container trucks return from Addis Ababa to Djibouti completely empty due to lack of return cargo visibility.

### 1.2 Project Objectives
#### Primary Objectives:
1. **Digitalize Freight Matching:** Provide an open digital marketplace connecting licensed shippers and carriers for direct spot and scheduled freight booking.
2. **Guarantee Payment Security via Smart Escrow:** Lock freight payments in milestone-based digital escrow upon contract award, releasing funds automatically upon verifiable digital Proof-of-Delivery (e-POD).
3. **Automate Corridor Visibility & Telematics:** Deliver continuous GPS telemetry, dynamic ETA forecasting, and automated checkpoint geofencing across all 11 critical corridor hubs.
4. **Accelerate Customs Clearance:** Implement a single-window digital customs interface with QR-based digital transit passes to streamline border inspection.

#### Secondary Objectives:
- Guarantee linguistic inclusion for Ethiopian logistics operators by implementing complete translations in **Amharic (አማርኛ)** and **Afaan Oromoo**.
- Support low-connectivity offline operations for drivers operating in remote low-bandwidth desert regions.
- Optimize vehicle utilization through intelligent backhaul suggestions.

### 1.3 Project Scope
- **In-Scope:**
  - Multi-tenant Web Application for Shippers, Carriers/Transporters, Customs Officers, and Admins.
  - Native Cross-Platform Mobile Application for Drivers and Transporters.
  - Microservices REST API, WebSocket Telemetry Engine, and Relational Database Schema.
  - Integrated Escrow settlement simulations (Telebirr, CBE Birr, Bank Transfer).
  - Geofence calculation and dynamic road distance algorithms.
- **Out-of-Scope (Future Enhancements):**
  - Physical hardware OBD-II hardware sensor dongle manufacturing.
  - Integration with legacy banking core banking mainframes (simulated via verified webhooks).
  - Cross-border maritime vessel scheduling.

---

## 2. Requirements Specification

### 2.1 User Roles & Stakeholder Personas
The system implements Role-Based Access Control (RBAC) with granular permission boundaries:

| Role | Key Persona | Primary Responsibilities |
| :--- | :--- | :--- |
| **SHIPPER** | Exporter / Importer / Manufacturer | Posts cargo loads, reviews transporter bids, funds digital escrow, tracks shipments live, confirms e-POD receipts, rates carriers. |
| **TRANSPORTER** | Fleet Owner / Logistics Company | Registers trucks and drivers, browses open corridor loads, submits competitive bids, dispatches vehicles, tracks fleet earnings. |
| **DRIVER** | Commercial Heavy Truck Driver | Views assigned trips, performs GPS waypoint check-ins, broadcasts route delays/incidents, captures recipient e-signature and photos for e-POD. |
| **CUSTOMS OFFICER** | Ethiopian Customs Commission (ECC) Officer | Inspects digital consignment manifests, verifies declaration & packing lists, issues Green Line passes, scans QR codes at border gates. |
| **ADMINISTRATOR** | TradeFlow System Operator | Verifies carrier business licenses, monitors platform KPIs, manages dispute resolutions, and audits escrow balances. |

### 2.2 Functional Requirements (FR)

- **FR-01: Identity, Authentication & Role Verification**
  - Multi-role registration with email OTP verification.
  - Carrier verification workflow: mandatory TIN, Trade License, Goods in Transit (GIT) Insurance, and Roadworthiness Certificate uploads.
  - Secure session management via signed JSON Web Tokens (JWT) and bcrypt password hashing.

- **FR-02: Load Posting & Corridor Freight Discovery**
  - Shippers can create structured freight postings specifying commodity, cargo type, net weight (Tons), volume (CBM), special handling, and target budget (ETB).
  - Dynamic corridor road distance calculation based on official Ethio-Djibouti highway segments (Addis Ababa, Modjo, Adama, Awash, Semera, Galafi, Djibouti Port).

- **FR-03: Competitive Bidding & Contract Awarding**
  - Transporters browse filtered load listings and submit binding bids with proposed rate per ton and transit timelines.
  - Shippers review bids with transparent transporter safety scores and acceptance/rejection mechanics.

- **FR-04: Digital Smart Escrow & Payment Settlement**
  - Milestone-based escrow pipeline: `PENDING` ➔ `HELD_IN_ESCROW` ➔ `CONFIRMED` ➔ `SETTLED`.
  - Transporters cannot dispatch vehicles until shipper escrow funding is secured.
  - Automated payout release upon e-POD completion and shipper sign-off.

- **FR-05: Fleet Management & Driver Dispatch**
  - Transporters manage vehicle inventory (Plate number, Vehicle type, Capacity in Tons/CBM, Fuel type, Telematics ID).
  - Transporters assign qualified drivers to specific trucks and dispatch them to accepted load contracts.
  - Automated vehicle capacity matching validation to prevent overweight load assignments.

- **FR-06: Driver Mobile Telematics & Waypoint Check-In**
  - Background live device GPS tracking streaming coordinates to the central server via WebSockets.
  - Proximity detection algorithm (Haversine formula) detecting when the driver is within 15 km of designated corridor checkpoints.
  - Offline telemetry buffer (NFR 7.2) allowing drivers to record check-ins and incident reports without active internet connectivity, automatically synchronizing upon reconnection.

- **FR-07: Single-Window Customs Transit Clearance**
  - Centralized digital dossier management (Customs Declaration, Commercial Invoice, Packing List, Cargo Insurance).
  - Algorithmic clearance classification: Green Line (Auto-cleared), Yellow Line (Document Review), Red Line (Physical Inspection).
  - Dynamic, cryptographically verifiable QR Pass generated on driver mobile app for instant gatekeeper clearance.

- **FR-08: Localization & Theming**
  - Seamless instant language switching between English, Amharic, and Afaan Oromoo across all components.
  - Universal theme engine with high-contrast Dark Mode and Light Mode synchronization.

### 2.3 Non-Functional Requirements (NFR)
- **NFR-01: Performance & Low-Latency:** API response times under 200ms for 95% of requests. Real-time GPS coordinates delivered via WebSockets with < 500ms broadcast latency.
- **NFR-02: Offline Resilience:** Mobile application telematics client queues up to 500 GPS pings and check-in records during network blackouts in desert sectors.
- **NFR-03: Security & Data Integrity:** Transport Layer Security (TLS 1.3), parameterized database queries via Prisma ORM preventing SQL injection, strict input sanitization, and SHA-256 digital document verification.
- **NFR-04: Scalability:** Stateless microservice architecture deployable in containerized clusters capable of handling 50,000 concurrent driver telematics sessions.
- **NFR-05: Usability & Mobile Ergonomics:** Strict adherence to mobile usability guidelines with high-contrast UI elements, large touch targets (>= 48px), and full accessibility on low-tier smartphones (e.g. Samsung Galaxy A13).

---

## 3. Technologies Used & Architecture Justification

```
+-------------------------------------------------------------------------+
|                           CLIENT APPLICATIONS                           |
|                                                                         |
|  +----------------------------------+  +-----------------------------+  |
|  |     Next.js 14 Web Portal        |  |  Expo React Native Mobile   |  |
|  | (Shipper, Transporter, Customs)  |  |   (Driver & Field Portal)   |  |
|  |   TypeScript - Tailwind CSS      |  | SDK 58 - Offline Telematics |  |
|  +----------------------------------+  +-----------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTPS / WSS (REST & WebSockets)
                                     v
+-------------------------------------------------------------------------+
|                        APPLICATION SERVER LAYER                         |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                     Node.js & Express.js API                      |  |
|  |  - Auth & RBAC (JWT / bcrypt)    - Smart Escrow Contract Engine   |  |
|  |  - Corridor Bidding Gateway      - Haversine Geofencing Service   |  |
|  |  - Customs Clearance Engine      - Socket.IO Real-Time Gateway    |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     | Prisma ORM (Type-Safe Client)
                                     v
+-------------------------------------------------------------------------+
|                           PERSISTENCE LAYER                             |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                     PostgreSQL Relational DB                      |  |
|  |  - Relational Integrity (Cascade / Indexes / Unique Constraints)  |  |
|  |  - 10 Core Relational Tables + JSON Telemetry Logs                |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

### 3.1 Technology Stack Matrix

| Layer | Technology | Version | Justification / Role |
| :--- | :--- | :--- | :--- |
| **Web Frontend** | Next.js / React | v14.2 / v18.3 | High-performance Server-Side Rendering (SSR) and Client-Side rendering for responsive desktop logistics management. |
| **Styling & Icons** | Tailwind CSS / Lucide | v3.4 | Utility-first responsive styling with zero runtime overhead; consistent design system. |
| **Mobile Frontend** | React Native / Expo | SDK 58 (RN 0.84) | Cross-platform native mobile experience with native hardware access (GPS, Camera, Document Picker) compiled to APK. |
| **Backend API** | Node.js / Express.js | v20 LTS | Non-blocking event-driven runtime ideal for high-throughput I/O telematics and REST endpoints. |
| **Type Safety** | TypeScript | v5.4 | End-to-end type safety eliminating runtime null-pointer and payload mismatch exceptions across client and server. |
| **Database & ORM** | PostgreSQL & Prisma | PG 16 / Prisma 5 | ACID-compliant relational storage ensuring zero-loss transactional consistency for freight escrow funds and load statuses. |
| **Real-Time Engine** | Socket.IO | v4.7 | Bidirectional WebSocket communication streaming live driver GPS coordinates, corridor alerts, and status changes. |
| **Mapping & GIS** | Leaflet / React-Leaflet | v1.9 | Open-source geospatial visualization of corridor waypoints, checkpoints, and route polylines. |
| **Mobile Build CI/CD**| Expo EAS Build | Cloud | Cloud-based automated build pipeline producing optimized standalone Android APKs and iOS binaries. |

---

## 4. System Design & Architecture

### 4.1 Entity-Relationship Model (ERD)
The relational schema comprises 10 tightly coupled models structured to enforce auditability:

```
+------------------+         1:N         +------------------+
|      User        |-------------------->|       Load       |
| (Shipper/Carrier)|                     | (Cargo & Budget) |
+------------------+                     +------------------+
         | 1:N                                     | 1:N
         |                                         v
         |                           +------------------+
         +-------------------------->|       Bid        |
         |                           | (Quote & Terms)  |
         | 1:N                       +------------------+
         v                                         | 1:1
+------------------+                               v
|     Vehicle      |<--------------------+------------------+
| (Truck Details)  |         1:N         |     Shipment     |
+------------------+                     | (Active Transit) |
         | 1:1                           +------------------+
         v                                  | 1:1      | 1:N
+------------------+                        |          v
|  DriverProfile   |                        |   +------------------+
| (License & Score)|                        |   |  IncidentReport  |
+------------------+                        |   | (Delays & GPS)   |
         | 1:N                              |   +------------------+
         v                                  v
+------------------+             +----------------------+
|      Rating      |             |   CustomsClearance   |
| (Reviews & Stars)|             | (Dossier & QR Pass)  |
+------------------+             +----------------------+
```

### 4.2 End-to-End Consignment Lifecycle Sequence
The sequence below illustrates the automated execution flow from initial load posting to final escrow disbursement:

```
Shipper              Platform API               Transporter              Driver
   |                       |                         |                      |
   |--- 1. Post Load ----->|                         |                      |
   |                       |--- 2. Broadcast Load -->|                      |
   |                       |                         |                      |
   |                       |<-- 3. Submit Bid -------|                      |
   |<-- 4. Review Bids ----|                         |                      |
   |                       |                         |                      |
   |--- 5. Accept Bid ---->|                         |                      |
   |--- 6. Fund Escrow --->| [Escrow Locked]         |                      |
   |                       |--- 7. Dispatch Notice ->|                      |
   |                       |                         |--- 8. Assign Truck ->|
   |                       |                         |                      |
   |                       |<-- 9. Start Trip ------------------------------|
   |                       |                                                |
   |                       |<-- 10. Waypoint GPS Check-ins (sem, gal, etc.)-|
   |<-- 11. Live Tracking -|                                                |
   |                       |                                                |
   |                       |<-- 12. Submit Digital e-POD (Sign + Photo) ----|
   |<-- 13. Verify POD ----|                                                |
   |                       |                                                |
   |--- 14. Approve e-POD->| [Escrow Settled]                               |
   |                       |--- 15. Payout Released ----------------------->|
```

---

## 5. Implementation Details & Core Modules

### 5.1 Module 1: Corridor Freight Matching & Distance Algorithm
The platform incorporates an accurate distance matrix mapping the authentic road transit segments between the Port of Doraleh and Addis Ababa dry port terminals:

```typescript
// Shared Corridor Road Segment Coordinates (apps/mobile/src/shared/corridor.ts)
export const CORRIDOR_WAYPOINTS = [
  { id: 'ADDIS_ABABA', name: 'Kaliti Inland Container Terminal', lat: 8.9060, lng: 38.7610, kmFromOrigin: 0 },
  { id: 'MODJO',       name: 'Modjo Dry Port & Logistics Hub',   lat: 8.5980, lng: 39.1240, kmFromOrigin: 74 },
  { id: 'ADAMA',       name: 'Adama Expressway Interchange',     lat: 8.5400, lng: 39.2700, kmFromOrigin: 98 },
  { id: 'AWASH',       name: 'Awash Arba Weighbridge Post',      lat: 8.9910, lng: 40.1650, kmFromOrigin: 228 },
  { id: 'SEMERA',      name: 'Semera Dry Port & Customs Center', lat: 11.7940, lng: 41.0080, kmFromOrigin: 588 },
  { id: 'GALAFI',      name: 'Galafi Border Control Post',       lat: 11.7160, lng: 41.8380, kmFromOrigin: 760 },
  { id: 'DJIBOUTI',    name: 'Societe de Gestion du Terminal',   lat: 11.5950, lng: 43.1480, kmFromOrigin: 880 }
];
```

The system computes road distances using a composite piecewise Haversine distance model along verified corridor waypoints rather than unrealistic straight-line vectors.

### 5.2 Module 2: Digital Smart Escrow Financial Vault
Payment security is enforced programmatically in `services/api/src/routes/portal.ts`:
- Shippers deposit funds via simulated Telebirr or CBE Birr gateways.
- Funds transition to `HELD_IN_ESCROW` status. The system locks the funds under a unique escrow transaction hash (`TB-TF-XXXXXX`).
- When the driver delivers the cargo, an electronic Proof of Delivery (e-POD) containing a recipient signature and geocoded delivery photo is uploaded.
- Upon shipper approval, the escrow releases 95% of the gross freight value directly to the transporter's wallet and retains a 5% platform service commission.

### 5.3 Module 3: Driver Telematics, Waypoint Check-In & Geofencing
To guarantee tamper-proof tracking without relying on expensive proprietary hardware:
1. The driver mobile application utilizes the phone's native GPS chip via `expo-location`.
2. As the driver navigates the corridor, the app continuously calculates the distance to the next upcoming checkpoint:
   $$	ext{Distance} = 2 R rcsin\left(\sqrt{\sin^2\left(rac{\Delta\phi}{2}ight) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(rac{\Delta\lambda}{2}ight)}ight)$$
3. When $	ext{Distance} \le 15	ext{ km}$, the system enables the **"Confirm Waypoint Check-In"** button and marks the arrival timestamp directly on the customs ledger.

### 5.4 Module 4: Single-Window Customs Clearance & QR Pass
- Shippers upload 4 mandatory digital trade documents: Customs Declaration, Commercial Invoice, Packing List, and Cargo Insurance.
- The Customs Officer portal reviews and assigns a clearance category:
  - **Green Line (Auto-Cleared):** Consignment pass issued immediately.
  - **Yellow Line:** Document inspection required.
  - **Red Line:** Physical inspection mandatory at Galafi or Semera.
- When cleared, the platform generates a signed cryptographic token rendered as a high-density QR Code inside the driver mobile app, allowing border agents to verify clearance in 3 seconds.

### 5.5 Module 5: Trilingual Localization & Universal Theming
The application supports **English (EN)**, **Amharic (AM - አማርኛ)**, and **Afaan Oromoo (OM)** across all screens via React Context and JSON translation dictionaries. The theme engine provides a synchronized Dark Mode (`#090E17`, `#0F172A`, `#1E293B`) and Light Mode (`#F1F5F9`, `#FFFFFF`), dynamically reacting to user selection or system settings.

---

## 6. System Features & Portal Walkthrough

### 6.1 Public Landing & Corridor Showcase
- Interactive corridor map with animated freight transit simulations.
- Instant Freight Rate Calculator allowing exporters to estimate spot pricing between Djibouti and inland hubs based on cargo tonnage and vehicle classification.

### 6.2 Shipper Management Portal
- Structured cargo posting wizard with specialized handling tags (Refrigerated, Hazardous, Fragile).
- Direct bid comparison dashboard displaying transporter ratings, safety scores, and fleet specifications.
- Live corridor telematics view with breadcrumb route tracking and automated delay notifications.

### 6.3 Carrier / Transporter Portal
- **Fleet Overview:** Inventory tracking of all trucks, maintenance documents, fuel types, and insurance validity.
- **Corridor Load Board:** Real-time stream of available consignments with filter chips (All Loads, Djibouti ➔ Addis, Addis ➔ Djibouti).
- **Dispatch Modal:** Capacity-checked assignment matching available trucks and drivers to awarded bids.
- **Earnings & Escrow Ledger:** Transparent tracking of locked escrow balances and completed payouts.

### 6.4 Driver Mobile Portal (React Native / Android)
- **Trip Dashboard:** Essential mission telemetry displaying origin, destination, dynamic ETA, and current transit status.
- **Location Check-In:** Geofence-verified checkpoint check-in with one-tap confirmation.
- **Incident Reporter:** Instant broadcast of route hazards (Accident, Customs Delay, Fuel Outage, Road Block) with live geotags and photo capture.
- **Customs QR Pass:** Offline-capable digital customs clearance pass with ECC inspection seal.
- **e-POD Receipt:** Touchscreen signature capture and delivery camera snapshot.

### 6.5 Customs Inspection Portal
- Manifest verification interface for border clearance officers.
- Instant QR scanning validating digital seal authenticity and consignment contents.

---

## 7. Testing & Quality Assurance

### 7.1 Testing Strategy
The platform was subjected to a comprehensive multi-tier quality assurance protocol:
1. **Unit Testing:** Validating core algorithmic utilities (Haversine distance calculation, freight rate calculation, input formatters, and authentication validation).
2. **Integration Testing:** Verifying database operations using Prisma with transactional rollbacks, ensuring foreign key constraints and cascade rules behave correctly.
3. **End-to-End API Testing:** Exercising RESTful endpoints and WebSocket events using Postman and automated test scripts.
4. **Physical Mobile Device Testing:** Deployed and verified on a physical **Samsung Galaxy A13 (SM-A137F)** running Android 13/14, testing native GPS accuracy, camera photo capture, responsive layouts, and Dark Mode contrast.

### 7.2 Test Cases & Execution Matrix

| Test ID | Module | Scenario / Objective | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Auth | User Registration with Email OTP | 6-digit verification code validated; user profile created. | **PASS** |
| **TC-02** | Auth | Role-Based Access Boundary | Shipper cannot access transporter fleet management endpoints (403 Forbidden). | **PASS** |
| **TC-03** | Loads | Create Consignment Posting | Load saved with valid coordinates, cargo type, and budget in ETB. | **PASS** |
| **TC-04** | Bidding | Transporter Bid Submission | Transporter submits price; shipper receives real-time bid notification. | **PASS** |
| **TC-05** | Escrow | Milestone Fund Locking | Freight payment locked in escrow; load status updates to `MATCHED`. | **PASS** |
| **TC-06** | Dispatch | Overweight Vehicle Assignment | System blocks truck assignment if capacity is less than cargo weight. | **PASS** |
| **TC-07** | Telematics | Haversine Distance Calculation | Accurate road distance computed between Kaliti and Doraleh (~880 km). | **PASS** |
| **TC-08** | Driver | Geofence Checkpoint Check-In | Button unlocks when GPS is within 15 km of Semera checkpoint. | **PASS** |
| **TC-09** | Driver | Duplicate Check-In Prevention | Driver cannot submit multiple check-ins for the same checkpoint. | **PASS** |
| **TC-10** | Incident | Route Delay Hazard Broadcast | Geotagged delay reported; corridor dispatcher notified instantly. | **PASS** |
| **TC-11** | Customs | Single-Window QR Pass Display | Driver app generates valid QR pass reflecting Green Line ECC clearance. | **PASS** |
| **TC-12** | e-POD | Digital Signature & Photo Capture | Driver signs and submits proof; escrow transitions to `SETTLED`. | **PASS** |
| **TC-13** | i18n | Trilingual Localization Switch | Instant interface translation between EN, AM, and OM without reload. | **PASS** |
| **TC-14** | Theme | Dark Mode High-Contrast Contrast | Zero unreadable text or inverted white cards across all mobile tabs. | **PASS** |
| **TC-15** | Mobile | Metro Android Bundle Export | `npx expo export --platform android` compiles 877 modules with 0 errors. | **PASS** |

---

## 8. Challenges Encountered & Solutions Applied

1. **Challenge: In-Transit Connectivity Blackouts in Afar Desert**
   - *Problem:* Cellular connectivity drops intermittently between Awash and Semera, causing lost driver telemetry.
   - *Solution:* Implemented an SQLite/AsyncStorage offline queue on the mobile app that buffers telemetry pings and check-in records, automatically syncing them via exponential backoff upon network reconnection.

2. **Challenge: Android OEM Dark Mode Inconsistencies**
   - *Problem:* Samsung Galaxy A13 forced background color overrides on static style sheets, producing white-on-white text in Fleet and Load tabs.
   - *Solution:* Re-architected all mobile styles into dynamic React hooks (`getDriverStyles`, `useTransporterStyles`) wrapped in `useMemo` that evaluate theme colors dynamically.

3. **Challenge: Brokerage Resistance & Shipper-Carrier Trust Deficit**
   - *Problem:* Shippers hesitated to advance freight fees to unverified private truck drivers.
   - *Solution:* Introduced the **Digital Smart Escrow** architecture where funds are never sent directly to drivers upfront, but held by the platform and released only upon cryptographically verified proof of delivery.

---

## 9. Conclusion & Future Roadmap

### 9.1 Conclusion
The **TradeFlow** project successfully demonstrates how modern full-stack web and mobile technologies can solve deep-seated physical supply chain challenges in developing trade corridors. By digitizing freight brokerage, securing milestone payments via digital escrow, streaming real-time telematics, and expediting customs through single-window QR passes, TradeFlow bridges the efficiency gap on the Ethio-Djibouti economic artery.

The system was designed, developed, tested, and packaged into production-ready artifacts including a live web application, RESTful microservices, and a standalone installable Android APK (v1.1.5).

### 9.2 Future Roadmap
1. **IoT OBD-II Hardware Telematics:** Direct integration with truck CAN-bus sensors to track fuel consumption, engine diagnostics, and driver fatigue in real time.
2. **Automated Number Plate Recognition (ANPR):** Edge AI camera deployment at Galafi and Modjo checkpoints to automatically scan truck plates and log transit timestamps.
3. **Multi-Currency Escrow Settlement:** Expanding the escrow payment gateway to support Ethiopian Birr (ETB), Djibouti Franc (DJF), and US Dollars (USD) with automated central bank foreign exchange clearing.
4. **AI-Powered Predictive Backhaul Freight Matching:** Machine learning algorithms predicting empty truck capacity and matching return agricultural exports to reduce empty backhauls below 15%.

---

## 10. Team Contributions & Acknowledgments

This project was developed through collaborative team effort as part of the Software Development Training Capstone. Every team member contributed across architecture, backend engineering, mobile app development, localization, and testing:
- **System Architecture & Cloud Infrastructure:** Microservices design, PostgreSQL schema modeling, Prisma ORM, and Render/Vercel deployment.
- **Backend API & Escrow Engine:** REST API endpoints, JWT authentication, Escrow contract logic, and Socket.IO WebSockets.
- **Mobile Application Development:** React Native Expo mobile app, offline telematics, GPS geofencing, QR scanner, and dark mode UI overhaul.
- **Localization & Quality Assurance:** Complete English, Amharic, and Afaan Oromoo translation files, unit testing, and physical device verification.

*TradeFlow — Empowering the Ethio-Djibouti Corridor with Smart Freight & Escrow.*
