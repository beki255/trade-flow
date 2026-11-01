# 🚚 TradeFlow: Intelligent Ethio-Djibouti Trade Corridor Freight Logistics, Telematics & Digital Escrow Platform

**Comprehensive Final Project Documentation & Technical Report**  
*Software Development Training — Final Group Capstone Project*  
**Submission Date:** November 2026  
**Project Version:** v1.1.6 (Production Release)  

---

### 👥 Project Group Members & Credentials

| Student Full Name | Student ID | Academic Role / Submission Status | Key Contributions |
| :--- | :--- | :--- | :--- |
| **BEREKET SAHLEMARIAM** | `CTC-1041-26` | Capstone Group Member | Full-Stack Engineering, Mobile Telematics, Escrow Logic |
| **DAGNAW MEKASHA** | `CTC-1339-26` | Capstone Group Member | System Architecture, Database Schema, Backend Testing |
| **HAMELMAL BELAYNEH** | `CTC-1116-26` | Capstone Group Member | UI/UX Design System, Trilingual Localization, QA |

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

## 1. Project Objectives & Scope

### 1.1 Problem Statement
The Ethio-Djibouti corridor is Ethiopia's trade lifeline, yet it operates largely on paper manifests, cash brokerages, and uncoordinated truck dispatches. Key pain points include:
- **Financial Risk:** Shippers fear cargo loss; transporters fear non-payment or delayed settlements of 30–90 days.
- **Blind Transits:** Cargo owners cannot track shipments between Djibouti Port and inland dry ports (Modjo, Kaliti), causing theft and delayed assembly lines.
- **Customs Gridlock:** Border clearance at Galafi takes 24–72 hours due to paper dossier inspections.
- **Economic Inefficiency:** High empty backhaul percentages drive container transit rates to $3,200–$4,500 per trip.

### 1.2 Core Project Objectives
#### Primary Objectives:
1. **Eliminate Intermediary Brokerage Markups:** Connect cargo owners directly with commercial truck fleets.
2. **Guarantee Payment Security via Smart Escrow:** Lock freight payments in milestone-based digital escrow upon contract award, releasing funds automatically upon verifiable digital Proof-of-Delivery (e-POD).
3. **Automate Corridor Visibility & Telematics:** Deliver continuous GPS telemetry, dynamic ETA forecasting, and automated checkpoint geofencing across all 11 critical corridor hubs.
4. **Accelerate Customs Clearance:** Implement a single-window digital customs interface with QR-based digital transit passes to streamline border inspection.

#### Secondary Objectives:
- Guarantee linguistic inclusion for Ethiopian logistics operators by implementing complete translations in **Amharic (አማርኛ)** and **Afaan Oromoo**.
- Support low-connectivity offline operations for drivers operating in remote low-bandwidth desert regions.
- Optimize vehicle utilization through intelligent backhaul suggestions.

### 1.3 Project Scope
The TradeFlow platform spans an end-to-end multi-role web platform and a native mobile application tailored for drivers and fleet operators.

---

## 2. Requirements Specification

### 2.1 User Roles & Personas
| Role | Target Persona | Primary Responsibilities |
| :--- | :--- | :--- |
| **SHIPPER** | Commercial Importer / Exporter | Creates freight listings, deposits escrow payments, tracks corridor transit in real time, approves delivery e-PODs. |
| **TRANSPORTER** | Fleet Owner / Logistics Company | Registers trucks and drivers, browses open corridor loads, submits competitive bids, dispatches vehicles, tracks fleet earnings. |
| **DRIVER** | Commercial Heavy Truck Driver | Views assigned trips, performs GPS waypoint check-ins, broadcasts route delays/incidents, captures recipient e-signature and photos for e-POD. |
| **CUSTOMS OFFICER** | Ethiopian Customs Commission (ECC) Officer | Inspects digital consignment manifests, verifies declaration & packing lists, issues Green Line passes, scans QR codes at border gates. |
| **ADMINISTRATOR** | TradeFlow System Operator | Verifies carrier business licenses, monitors platform KPIs, manages dispute resolutions, and audits escrow balances. |

### 2.2 Functional Requirements (FR)
- **FR-01: Identity, Authentication & Role Verification**
  - Multi-tenant role-based access control (RBAC) with JWT tokens.
  - Organization verification: Shippers and Transporters upload business registrations and TINs.
- **FR-02: Freight Marketplace & Algorithmic Bidding**
  - Shippers publish freight tenders (origin, destination, cargo type, tonnage, target rate in ETB).
  - Transporters submit competitive bids with equipment specifications (Flatbed, Lowbed, Box, Tanker).
  - One-click bid acceptance automatically instantiates a legally binding freight consignment contract.
- **FR-03: Digital Smart Escrow Financial Engine**
  - Shippers fund consignment escrow via integrated Ethiopian payment gateways (Telebirr, CBE Birr mock/sandbox).
  - Automated fund locking upon contract creation.
  - Programmable milestone disbursements:
    - *Dispatch Milestone:* 0% disbursed, 100% held in escrow.
    - *Galafi Customs Clear:* Optional milestone notification.
    - *Final Delivery (e-POD Verification):* 95% disbursed to Transporter; 5% platform service commission deducted.
- **FR-04: Corridor Telematics & GPS Checkpoint Engine**
  - Live GPS ping stream from Driver mobile device.
  - Haversine geofence calculations verifying driver arrival within 15 km of corridor waypoints (Djibouti Port, Galafi, Semera, Awash, Modjo Dry Port, Kaliti Dry Port).
  - Automatic transit status updates and dynamic ETA calculation based on real-time segment speeds.
- **FR-05: Single-Window Customs Clearance System**
  - Centralized digital dossier management (Customs Declaration, Commercial Invoice, Packing List, Cargo Insurance).
  - Algorithmic clearance classification: Green Line (Auto-cleared), Yellow Line (Document Review), Red Line (Physical Inspection).
  - Dynamic, cryptographically verifiable QR Pass generated on driver mobile app for instant gatekeeper clearance.
- **FR-06: Digital Proof of Delivery (e-POD)**
  - Dual-factor electronic delivery confirmation: recipient capacitive touch signature + geotagged cargo photo snapshot.
  - Cryptographic timestamping and immutability lock triggering escrow release.
- **FR-07: Real-Time Incident Reporting & Corridor Alerts**
  - Drivers broadcast real-time route disruptions (road repairs, accidents, extreme weather, checkpoint congestion).
  - Interactive corridor incident markers with severity indicators and detours.
- **FR-08: Localization & Theming**
  - Seamless instant language switching between English, Amharic, and Afaan Oromoo across all components.
  - Universal theme engine with high-contrast Dark Mode and Light Mode synchronization.

---

## 3. Technologies Used & Architecture Justification

### 3.1 Technology Stack Summary
```
+---------------------------------------------------------------------------------+
|                                 TRADEFLOW CLIENTS                               |
|   Web App: Next.js 14 (App Router) + Tailwind CSS + Lucide Icons + Leaflet GIS  |
|   Mobile App: React Native Expo SDK 52 + expo-location + SQLite Offline Queue   |
+---------------------------------------------------------------------------------+
                                         |
                                         | REST APIs & WebSockets
                                         v
+---------------------------------------------------------------------------------+
|                                BACKEND SERVICES                                 |
|   API Server: Node.js + Express + TypeScript + Prisma ORM                       |
|   Authentication: JWT + bcrypt + RBAC Middleware                                |
|   Real-time Engine: Socket.IO (Corridor Telematics Pings & Status Broadcasts)   |
|   Database: PostgreSQL (Neon Cloud Serverless)                                  |
+---------------------------------------------------------------------------------+
                                         |
                                         | Cloud Deployments
                                         v
+---------------------------------------------------------------------------------+
|                            INFRASTRUCTURE & HOSTING                             |
|   Web Frontend: Vercel Global Edge Network                                      |
|   Backend REST API: Render Cloud Services (Frankfurt EU Region)                 |
|   Mobile Builds: Expo Application Services (EAS) Android Cloud Pipeline         |
+---------------------------------------------------------------------------------+
```

---

## 4. System Design & Database Architecture

### 4.1 Prisma Relational Data Model
The database architecture uses Prisma ORM on PostgreSQL with normalized relations:
- `User`: Accounts, credentials, roles, TIN, phone number, language preference.
- `Load`: Freight listings posted by shippers.
- `Bid`: Carrier proposals, pricing, transit commitments.
- `Shipment`: Active transit missions linking awarded bids, vehicles, drivers, and GPS coordinates.
- `CustomsClearance`: Electronic customs dossiers, clearance tiers, digital QR seals.
- `Payment`: Escrow ledger entries, amounts, payment gateway transaction IDs, release states.
- `IncidentReport`: Route incidents, delays, GPS coordinates, severity levels.
- `Rating`: Verified bidirectional performance reviews.

---

## 5. Implementation Details & Core Modules

### 5.1 Haversine Corridor Geofencing Algorithm
```typescript
// Corridor Waypoint Proximity Check (apps/mobile/src/shared/corridor.ts)
export function calculateHaversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
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

### 5.2 Milestone Escrow State Machine
```
[DRAFT] --> [ESCROW_LOCKED] --> [IN_TRANSIT] --> [ARRIVED_DESTINATION] --> [POD_APPROVED] --> [ESCROW_RELEASED]
```

---

## 6. Features & User Portals

### 6.1 Shipper Portal
- Freight Listing Wizard with instant corridor distance and fair price estimation.
- Bid comparison matrix with transporter rating, fleet size, and insurance status.
- Real-time GPS corridor map with live truck coordinates and estimated arrival times.
- Automated e-POD review and one-click escrow settlement.

### 6.2 Transporter Portal
- Open loads marketplace with corridor origin/destination filters.
- Fleet management dashboard (truck plate numbers, trailer types, assigned drivers).
- Earnings analytics displaying locked escrow, pending releases, and total revenue in ETB.

### 6.3 Driver Mobile Application (React Native Expo)
- GPS geofenced checkpoint check-ins across 11 corridor waypoints.
- Digital Customs Transit Pass with high-contrast offline QR verification.
- Route hazard and congestion incident reporting with geotags.
- Electronic Proof of Delivery (e-POD) with capacitive signature capture and cargo camera snapshot.

### 6.4 Customs Officer Portal
- Single-Window digital customs document dossier viewer.
- Algorithmic risk classification: Green Line (auto-cleared), Yellow Line (documents review), Red Line (inspection).
- Digital transit pass generation and border gate QR scanning.

---

## 7. Testing & Quality Assurance

| Test ID | Module | Scenario Tested | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Auth | Multi-role registration & login | Valid JWT token & proper portal routing | **PASS** |
| **TC-02** | Marketplace | Freight listing creation & bid submission | Bid appears on shipper console in real-time | **PASS** |
| **TC-03** | Escrow | Payment locking upon bid acceptance | Escrow status transitions to `HELD` | **PASS** |
| **TC-04** | Telematics | GPS coordinate submission via mobile | Live map updates truck marker on corridor route | **PASS** |
| **TC-05** | Geofencing | Checkpoint arrival within 15 km | Automated waypoint check-in unlocks | **PASS** |
| **TC-06** | Customs | Single-window document submission | Green Line risk classification & QR seal generated | **PASS** |
| **TC-07** | e-POD | Digital signature & photo capture | Shipment marked `DELIVERED`, triggering escrow release | **PASS** |
| **TC-08** | Escrow | Payout execution upon e-POD approval | 95% credited to transporter, 5% platform fee retained | **PASS** |
| **TC-09** | i18n | Trilingual language toggle (EN/AM/OM) | Complete interface translates immediately | **PASS** |
| **TC-10** | Mobile | Standalone Android APK build (v1.1.6) | Installs & runs natively on Android physical devices | **PASS** |

---

## 8. Conclusion & Future Roadmap

The **TradeFlow** platform establishes an innovative technological foundation for cross-border logistics across the Ethio-Djibouti Trade Corridor. By replacing fragmented manual brokerage with an automated freight exchange, securing carrier-shipper transactions via milestone-locked smart escrow, streaming low-latency device telematics, and expediting customs inspection through digital QR passes, the system dramatically reduces transit times, freight costs, and payment delays.

All project requirements set forth by the Software Development Training program have been thoroughly fulfilled. The application has been verified across cloud staging environments and physical Android devices, resulting in production-ready web and mobile deliverables.

---

## 9. Capstone Project Team Credentials & Contributions

This project was engineered and delivered as an academic capstone project by the designated student group:

### 👥 Capstone Group Members

| Student Full Name | Student ID | Academic Role | Specialized Contributions |
| :--- | :--- | :--- | :--- |
| **BEREKET SAHLEMARIAM** | `CTC-1041-26` | Capstone Group Member | Full-Stack Engineering, Mobile Telematics, Escrow Smart Contract Logic & Cloud Deployment |
| **DAGNAW MEKASHA** | `CTC-1339-26` | Capstone Group Member | System Architecture, Database Schema Design, REST API Engineering & Automated Testing |
| **HAMELMAL BELAYNEH** | `CTC-1116-26` | Capstone Group Member | UI/UX Design System, Multi-Language Localization (Amharic & Afaan Oromoo), Documentation & QA |

### 🎓 Academic Capstone Endorsement
```
Project Title:        TradeFlow Intelligent Ethio-Djibouti Logistics & Escrow Platform
Academic Program:     Software Development Training — Final Capstone Project
Project Version:      v1.1.6 (Production Release)
Evaluation Date:      November 2026
Submission Status:    Official Group Capstone Project Submission
```

---
*TradeFlow — Empowering the Ethio-Djibouti Trade Corridor with Smart Logistics & Escrow.*
