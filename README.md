# 🚚 TradeFlow v1 — Intelligent Logistics, Telematics & Digital Escrow Platform

> **Accelerating Cross-Border Commerce along the Ethio-Djibouti Trade Corridor**  
> *(Port of Doraleh ➔ Galafi Border ➔ Semera ➔ Awash ➔ Modjo Dry Port ➔ Addis Ababa)*

[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](#)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=nextdotjs)](#)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](#)
[![Expo](https://img.shields.io/badge/Expo-SDK_58-000020?logo=expo)](#)
[![React Native](https://img.shields.io/badge/React_Native-0.84-61dafb?logo=react)](#)
[![NodeJS](https://img.shields.io/badge/Node.js-20_LTS-green?logo=nodedotjs)](#)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL_16-2D3748?logo=prisma)](#)
[![Socket.io](https://img.shields.io/badge/Socket.IO-Real--Time-black?logo=socketdotio)](#)
[![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20AM%20%7C%20OM-orange)](#)
[![Theme](https://img.shields.io/badge/Theme-Dark%20%7C%20Light-purple)](#)
[![Mobile APK](https://img.shields.io/badge/Android_APK-v1.1.5_Ready-success?logo=android)](#)

---

## 📢 Software Development Training — Project Submission & Live Links

| Deliverable Name | Platform / Type | Direct Access Link / URL |
| :--- | :--- | :--- |
| **GitHub Repository** | Source Code (Monorepo) | [https://github.com/beki255/trade-flow](https://github.com/beki255/trade-flow) |
| **Live Web Application** | Production Web Portal | [https://trade-flow-ukgu.vercel.app](https://trade-flow-ukgu.vercel.app) |
| **Backend REST API (Swagger Docs)** | Cloud Microservice | [https://tradeflow-api-7abs.onrender.com/api/docs](https://tradeflow-api-7abs.onrender.com/api/docs) |
| **API Health & Status** | Operational Status Check | [https://tradeflow-api-7abs.onrender.com/api/health](https://tradeflow-api-7abs.onrender.com/api/health) |
| **Mobile Android APK (v1.1.6)** | Standalone Installable APK | [Download TradeFlow v1.1.6 APK](https://expo.dev/artifacts/eas/s_fuNuQqeCoh1iD_uAtLD8ATz7XDYnuO9WwikUil4JI.apk) |
| **EAS Cloud Build Logs** | Expo CI/CD Build #5dbf3408 | [View Expo EAS Cloud Logs](https://expo.dev/accounts/bereket2553/projects/tradeflow-mobile/builds/5dbf3408-9ce5-4517-b42d-85e8580555b2) |
| **Project Documentation (PDF)** | Complete Technical Report | [Download Documentation PDF](docs/TradeFlow_Project_Documentation.pdf) |

### 👥 Project Group Members & Credentials

| Student Full Name | Student ID | Academic Role / Contribution |
| :--- | :--- | :--- |
| **BEREKET SAHLEMARIAM** | `CTC-1041-26` | Capstone Group Member — Full-Stack & Mobile Engineering |
| **DAGNAW MEKASHA** | `CTC-1339-26` | Capstone Group Member — System Architecture & Testing |
| **HAMELMAL BELAYNEH** | `CTC-1116-26` | Capstone Group Member — UI/UX Design & Documentation |

### 📱 Mobile Android APK — Instant Camera QR Code & Download

Scan this QR code with any smartphone camera to instantly download and install the standalone **TradeFlow Android App (v1.1.6)**:

<p align="center">
  <a href="https://expo.dev/artifacts/eas/s_fuNuQqeCoh1iD_uAtLD8ATz7XDYnuO9WwikUil4JI.apk">
    <img src="docs/tradeflow_v116_qr.png" alt="TradeFlow Android APK Download QR Code" width="180" />
  </a>
  <br />
  <a href="https://expo.dev/artifacts/eas/s_fuNuQqeCoh1iD_uAtLD8ATz7XDYnuO9WwikUil4JI.apk">
    <b>📲 Click Here to Download TradeFlow v1.1.6 APK Directly</b>
  </a>
</p>

---

## 📌 Executive Summary

**TradeFlow** is an enterprise-grade digital freight marketplace, real-time corridor telematics engine, and milestone-secured digital escrow platform engineered specifically for the **Ethio-Djibouti Trade Corridor**—a vital 900+ km lifeline carrying more than 95% of Ethiopia’s international import and export freight.

Historically, this critical supply chain artery has been constrained by fragmented manual freight brokerage, unvetted intermediaries charging 15–25% markups, zero in-transit cargo visibility, lengthy paper-based customs queues at Galafi border post, recurring payment defaults, and an alarming 42% empty backhaul rate.

TradeFlow unifies **Shippers**, **Freight Forwarders**, **Fleet Transporters**, **Commercial Truck Drivers**, and the **Ethiopian Customs Commission (ECC)** into an automated, transparent, and resilient digital network. Key innovations include:
1. **Dynamic Freight Matching & Spot Bidding:** Eliminates predatory middlemen through transparent pricing and direct shipper-carrier contracting.
2. **Digital Smart Escrow Vault:** Secures 100% of freight capital prior to vehicle dispatch and automatically releases carrier earnings upon verified electronic Proof-of-Delivery (e-POD).
3. **Driver Mobile App with Real-Time Telematics:** Native GPS tracking, Haversine geofenced waypoint check-ins (15 km radius), offline telemetry buffering, and crowdsourced hazard reporting.
4. **Single-Window Customs Clearance:** Digital trade dossiers, risk-tier routing (Green/Yellow/Red Line), and offline-capable cryptographic QR transit passes.
5. **Universal Inclusivity:** Full trilingual localization (**English, Amharic [አማርኛ], and Afaan Oromoo**) with synchronized adaptive **Dark Mode** and **Light Mode**.

---

## 1. 🎯 Project Objectives & Scope

### 1.1 Problem Statement
The Ethio-Djibouti corridor handles over 12 million tons of cargo annually between the Port of Doraleh and inland dry port terminals (Modjo, Kaliti, Semera). Despite its strategic importance, the corridor suffers from:
- **Brokerage Friction:** Informal spot brokers in Addis Ababa and Djibouti extract massive markups while offering zero legal accountability for cargo security.
- **Payment Insecurity:** Carriers endure 30–60 day payment delays, creating cash-flow crises. Conversely, shippers risk cargo abandonment when upfront deposits are remitted.
- **Border Bottlenecks:** Paper-based declarations cause multi-day queues at Galafi and Semera, triggering exorbitant demurrage penalties.
- **Blind Transit:** Cargo owners have no real-time telematics or reliable ETA forecasts once trucks navigate remote Afar desert stretches.

### 1.2 Project Objectives
- **Primary:**
  1. Build an open, transparent digital freight exchange connecting shippers and carriers directly.
  2. Implement a milestone-based digital escrow vault guaranteeing zero-risk payment settlements.
  3. Provide end-to-end corridor telematics with automated geofenced check-ins across 11 corridor waypoints.
  4. Streamline customs inspections via single-window document verification and dynamic QR passes.
- **Secondary:**
  - Ensure universal accessibility through native trilingual translations (English, Amharic, Afaan Oromoo).
  - Guarantee seamless operation on low-tier smartphones (e.g. Samsung Galaxy A13) with high-contrast UI and offline resilience.

### 1.3 Scope Boundaries
- **In Scope:** Multi-tenant Web Portal (Next.js), Native Android Mobile App (React Native/Expo), Backend REST API (Node/Express/TypeScript), PostgreSQL Relational Database (Prisma), WebSocket Telematics, and Smart Escrow simulations.
- **Out of Scope (Future):** Physical OBD-II hardware manufacturing and automated central bank multi-currency foreign exchange clearing.

---

## 2. 📋 Requirements Specification

### 2.1 User Roles & Stakeholder Boundaries
The platform enforces strict Role-Based Access Control (RBAC):

| Role | Target Persona | Primary Responsibilities |
| :--- | :--- | :--- |
| **`SHIPPER`** | Importers, Exporters, Manufacturers | Post cargo consignments, review quotes, fund digital escrow, track shipments live, approve e-POD. |
| **`TRANSPORTER`** | Fleet Owners, Logistics Companies | Register trucks and drivers, browse open loads, place competitive bids, dispatch fleet vehicles, manage earnings. |
| **`DRIVER`** | Commercial Heavy Truck Drivers | View assigned trips, perform GPS waypoint check-ins, broadcast route delays, capture recipient e-POD signature. |
| **`CUSTOMS_OFFICER`**| Ethiopian Customs Commission (ECC) | Review digital dossiers, issue Green Line passes, scan driver QR passes at checkpoints. |
| **`ADMIN`** | TradeFlow System Operator | Verify carrier TIN, trade licenses, GIT insurance, and roadworthiness documents; resolve disputes. |

### 2.2 Functional Requirements (FR Summary)
- **FR-01 (Authentication & Onboarding):** Multi-role registration with email OTP verification and document KYC uploads.
- **FR-02 (Corridor Load Management):** Consignment posting with cargo classification, tonnage, volume, and budget in ETB.
- **FR-03 (Dynamic Bidding Engine):** Transporter spot quote submission, price evaluation, and acceptance mechanics.
- **FR-04 (Smart Escrow Protocol):** Funds locked upon contract award; 95% released to carrier upon approved e-POD (5% platform fee).
- **FR-05 (Fleet Management & Dispatch):** Capacity-checked vehicle and driver assignment blocking overweight loads.
- **FR-06 (Driver Mobile Telematics):** Continuous GPS tracking, 15 km Haversine geofence proximity detection, and offline queue buffer.
- **FR-07 (Single-Window Customs):** Digital dossier verification, risk classification, and dynamic cryptographic QR transit pass.
- **FR-08 (Localization & Theming):** Instant switching across EN, AM, and OM; synchronized Dark/Light mode.

---

## 3. 💻 Technologies Used & Architecture Justification

```
+-----------------------------------------------------------------------------------+
|                              CLIENT TIER (APPLICATIONS)                           |
|                                                                                   |
|   Next.js 14 (React 18) Web Portal           Expo SDK 58 (React Native) Mobile    |
|   - Tailwind CSS / Lucide Icons              - Standalone Android APK (v1.1.5)    |
|   - Leaflet Geospatial Maps                  - Native Device GPS & Camera         |
|   - Trilingual i18n Engine                   - Offline Telemetry SQLite Buffer    |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS / WSS
                                          v
+-----------------------------------------------------------------------------------+
|                           APPLICATION SERVER & LOGIC TIER                         |
|                                                                                   |
|   Node.js & Express.js REST Microservices (TypeScript)                            |
|   - JWT Auth & Role-Based Access Control     - Smart Escrow State Machine         |
|   - Haversine Geofencing Engine              - Socket.IO Real-Time Gateway        |
+-----------------------------------------+-----------------------------------------+
                                          | Prisma ORM
                                          v
+-----------------------------------------------------------------------------------+
|                              DATA PERSISTENCE TIER                                |
|                                                                                   |
|   PostgreSQL 16 Relational Database                                               |
|   - 10 Relational Models with Cascading Foreign Keys, UUIDs & Indexes             |
+-----------------------------------------------------------------------------------+
```

### Monorepo Directory Layout:
```text
tradeflow/ (Turborepo / npm Workspaces Monorepo)
├── docs/                     # Project Documentation, Technical Report & PDF
│   ├── TradeFlow_Project_Documentation.md
│   ├── TradeFlow_Project_Documentation.html
│   └── TradeFlow_Project_Documentation.pdf
│
├── services/
│   └── api/                  # Node.js Express REST & Real-Time Socket.IO Server
│       ├── prisma/           # PostgreSQL Schema (10 Models) & Seed Scripts
│       ├── src/controllers/  # Auth, Portal, Escrow, Drivers, Telematics
│       └── src/routes/       # Express Route Modules
│
├── apps/
│   ├── web/                  # Enterprise Web Portal (Next.js 14 + Tailwind CSS)
│   │   ├── src/pages/        # Landing Page, Shipper, Transporter, Customs, Admin
│   │   └── src/context/      # Database AuthContext & Trilingual Localization
│   │
│   └── mobile/               # Cross-Platform Driver & Transporter App (Expo SDK 58)
│       ├── src/screens/      # Welcome, Login, Register, Driver & Transporter Portals
│       ├── src/tabs/         # Trip, Check-in, Incident, e-POD, Fleet, Loads, Bids
│       ├── src/modals/       # Dispatch Modal, Customs QR Pass, Profile, Ratings
│       └── src/context/      # ThemeContext (Dark/Light) & LanguageContext (EN/AM/OM)
│
└── packages/
    └── shared/               # Shared TypeScript Types, Enums, Corridor Waypoints
```

---

## 4. 🏛️ System Design & Database Schema

### 4.1 Relational Data Models (Prisma ORM)
The persistence layer comprises 10 tightly coupled models:
- **`User`**: Account credentials, RBAC role, company details, TIN, Trade License, and verification status.
- **`Vehicle`**: Commercial truck registration, tonnage/volume capacity, fuel type, and insurance certificates.
- **`DriverProfile`**: Commercial driver's license (CDL), assigned vehicle, experience, and safety rating.
- **`Load`**: Cargo consignment specifications, origin/destination coordinates, cargo type, and budget in ETB.
- **`Bid`**: Transporter quotes, pricing, and estimated transit times.
- **`Shipment`**: Active corridor transit mission linking load, vehicle, driver, and live GPS coordinates.
- **`CustomsClearance`**: Single-window trade dossier, Green Line risk assessment, and cryptographic QR seal.
- **`Payment`**: Digital smart escrow ledger tracking locked amounts, payment methods, and settlement payouts.
- **`IncidentReport`**: Real-time corridor delay reports with geotagged coordinates and evidence photos.
- **`Rating`**: Bidirectional review and scoring system between shippers and carriers.

### 4.2 End-to-End Consignment Lifecycle
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
   |                       |<-- 10. Waypoint GPS Check-ins (Semera, Galafi)-|
   |<-- 11. Live Tracking -|                                                |
   |                       |                                                |
   |                       |<-- 12. Submit Digital e-POD (Sign + Photo) ----|
   |<-- 13. Verify POD ----|                                                |
   |                       |                                                |
   |--- 14. Approve e-POD->| [Escrow Settled]                               |
   |                       |--- 15. Payout Released ----------------------->|
```

---

## 5. ⚙️ Implementation Highlights

### 5.1 Geofenced Checkpoint Verification Algorithm
Drivers cannot falsely report arrival at checkpoints. Proximity is evaluated using the Haversine formula against verified corridor coordinates:
```typescript
// Haversine Proximity Check (apps/mobile/src/screens/driver/tabs/CheckinTab.tsx)
const R = 6371; // Earth's radius in km
const dLat = (wpLat - liveLat) * (Math.PI / 180);
const dLon = (wpLng - liveLng) * (Math.PI / 180);
const a =
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(liveLat * (Math.PI / 180)) * Math.cos(wpLat * (Math.PI / 180)) *
  Math.sin(dLon / 2) * Math.sin(dLon / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
const distanceKm = Math.round(R * c);

// Unlocks checkpoint check-in only when within 15 km
const isWithinGeofence = distanceKm <= 15;
```

### 5.2 Milestone Smart Escrow State Machine
- **`PENDING`**: Consignment awarded; awaiting shipper escrow deposit.
- **`HELD_IN_ESCROW`**: Funds locked in platform vault. Vehicle dispatch is unlocked.
- **`CONFIRMED`**: Cargo delivered; recipient signs digital e-POD.
- **`SETTLED`**: 95% of gross freight fee paid out to carrier; 5% platform fee retained.

---

## 6. 🌟 Features & Portal Walkthrough

### 6.1 Shipper Web Portal
- Structured freight posting wizard with commodity classification and budget specifications.
- Transparent bidding comparison displaying carrier fleet safety scores and fleet specifications.
- Live corridor telematics view with breadcrumb route tracking and automated delay notifications.

### 6.2 Carrier / Transporter Portal (Web & Mobile)
- **Fleet Management**: Register heavy commercial trucks with tonnage capacity, fuel type, GIT cargo insurance, and roadworthiness certification.
- **Commercial Driver Management**: Register qualified drivers with Commercial Driver's License (Grade 5/4) and vehicle pairing.
- **Capacity-Aware Dispatch**: Automated validation blocking trucks with insufficient payload capacity.
- **Smart Escrow Earnings Ledger**: Real-time tracking of locked escrow balances and completed payouts.

### 6.3 Driver Mobile Portal (Android APK v1.1.5)
- **Trip Dashboard**: Essential telemetry displaying origin, destination, dynamic ETA, and current speed.
- **Location Check-In**: Geofence-verified check-in at Kaliti, Modjo, Awash, Semera, Galafi, and Doraleh.
- **Crowdsourced Incident Reporter**: Instant broadcast of road hazards (Accidents, Customs Delays, Roadblocks) with geotagging and photos.
- **Digital Customs QR Pass**: Offline-capable single-window clearance pass with ECC inspection seal.
- **Electronic Proof of Delivery (e-POD)**: Touchscreen customer signature capture and delivery verification camera snapshot.

### 6.4 Customs & Corridor Inspection Portal
- Manifest verification interface for border clearance officers.
- Instant QR scanning validating digital seal authenticity and consignment contents.

---

## 7. 🧪 Testing & Quality Assurance

### 7.1 Comprehensive Test Execution Matrix

| Test ID | Subsystem | Test Condition | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Authentication | Register user with email OTP | 6-digit OTP validated; user created with hashed password. | **PASS** |
| **TC-RBAC-02** | Security | Shipper invokes carrier fleet API | Server returns 403 Forbidden. Access blocked. | **PASS** |
| **TC-LOAD-03** | Freight Marketplace | Post consignment with cargo specs | Consignment saved and broadcasted to load board. | **PASS** |
| **TC-BID-04** | Freight Marketplace | Transporter submits quote on load | Bid logged; shipper notified in real time via WebSockets. | **PASS** |
| **TC-ESCROW-05**| Smart Escrow | Shipper deposits freight payment | Payment locked; status transitions to `HELD_IN_ESCROW`. | **PASS** |
| **TC-DISP-06** | Fleet Dispatch | Assign truck with capacity < weight| Dispatch blocked with capacity mismatch warning. | **PASS** |
| **TC-GEO-07** | Telematics | Proximity check at 12 km from Semera | Haversine detects distance <= 15 km; check-in unlocks. | **PASS** |
| **TC-CUST-08** | Customs Gateway | ECC Green Line pass generation | Cryptographic QR pass renders on driver mobile screen. | **PASS** |
| **TC-EPOD-09** | Delivery Payout | Recipient signs digital e-POD | e-POD saved; escrow releases 95% payout to carrier. | **PASS** |
| **TC-I18N-10** | Localization | Toggle language to AM and OM | 100% of UI strings translate instantly without reload. | **PASS** |
| **TC-THEME-11**| Theme Engine | Dark mode test on Samsung A13 | Zero unreadable text or inverted white cards observed. | **PASS** |
| **TC-BUILD-12**| Mobile CI/CD | Expo EAS Android preview build | Build succeeded; production APK v1.1.5 generated. | **PASS** |

---

## 8. ⚡ Quick Start & Local Development

### 8.1 Prerequisites
- **Node.js**: `v18.0+` or `v20.0+ LTS`
- **npm**: `v9.0+`
- **Docker Desktop**: Running locally

### 8.2 Installation & Database Initialization
```powershell
# 1. Clone repository & install dependencies
git clone https://github.com/beki255/trade-flow.git
cd trade-flow
npm install

# 2. Launch PostgreSQL 16 & Redis via Docker
npm run docker:up

# 3. Push Prisma schema & seed baseline accounts
npm run prisma:push
npm run prisma:seed
```

### 8.3 Launching the Applications
```powershell
# Option A: Launch all services simultaneously (API, Web, Mobile)
npm run dev:all

# Option B: Launch services in separate terminals
npm run dev:api     # Backend API  ➔ http://localhost:5000
npm run dev:web     # Web Portal   ➔ http://localhost:3000
npm run dev:mobile  # Mobile App   ➔ http://localhost:8081 (Press 'w' for web preview)
```

### 8.4 Seeded Administrative Credentials
| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@miaoda.com` | `Admin2024!` | TradeFlow Platform & KYC Verification Console |
| **Customs Officer** | `kebede@miaoda.com` | `Demo1234!` | Inspector Kebede Worku (Ethiopian Customs Commission) |

---

## 9. 🏁 Conclusion & Future Roadmap

**TradeFlow v1** demonstrates a transformative application of full-stack engineering to eliminate physical logistics bottlenecks along the Ethio-Djibouti Trade Corridor. By replacing fragmented manual brokerage with an automated freight exchange, securing carrier-shipper transactions via milestone-locked smart escrow, streaming low-latency device telematics, and expediting customs inspection through digital QR passes, the system dramatically reduces transit times, freight costs, and payment delays.

### Future Roadmap:
1. **IoT Hardware Telematics:** Direct integration with truck CAN-bus OBD-II dongles for automated fuel monitoring.
2. **Automated Number Plate Recognition (ANPR):** Edge AI camera deployment at Galafi border checkpoints for zero-stop verification.
3. **Multi-Currency Escrow:** Support for Ethiopian Birr (ETB), Djibouti Franc (DJF), and US Dollars (USD).
4. **Predictive AI Backhaul Matching:** Machine learning algorithms reducing empty return trips below 15%.

---

*TradeFlow v1 — Built for the Ethiopian Logistics Modernization Initiative. All rights reserved © 2026.*
