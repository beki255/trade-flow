# 🚛 TradeFlow v2 — Intelligent Logistics & Freight Matching Platform

> **Accelerating Cross-Border Commerce along the Ethiopia-Djibouti Trade Corridor**  
> *(Djibouti Port ➔ Galafi / Dewele ➔ Mille ➔ Awash ➔ Modjo Dry Port ➔ Addis Ababa)*

[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](#)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](#)
[![Expo](https://img.shields.io/badge/Expo-SDK_52-000020?logo=expo)](#)
[![NodeJS](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs)](#)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma)](#)
[![Socket.io](https://img.shields.io/badge/Socket.IO-Real--Time-black?logo=socketdotio)](#)

---

## 📌 Executive Summary

**TradeFlow** is an enterprise-grade digital logistics, telematics, and freight-matching ecosystem designed specifically for the landlocked Ethiopian supply chain. It connects **Shippers**, **Freight Forwarders**, **Customs Officers**, **Transporters**, and **Authorized Commercial Drivers** into a unified, real-time corridor network with national digital payments (Telebirr / CBE Birr), ASYCUDA-compatible single-window compliance, and live GPS corridor tracking.

---

## 🏛️ System Architecture

```text
tradeflow-v2/ (Turborepo / npm Workspaces Monorepo)
├── services/
│   └── api/                  # Node.js Express REST & Real-Time Socket.IO Server
│       ├── prisma/           # PostgreSQL Schema & Seed Scripts (Prisma ORM)
│       ├── src/controllers/  # Auth, Portal, KYC Verification, Drivers, Telematics
│       ├── src/docs/         # OpenAPI 3.0 Specification & Swagger UI
│       └── src/routes/       # Express Route Modules
│
├── apps/
│   ├── web/                  # Enterprise Web Portal (Vite + React + Tailwind CSS)
│   │   ├── src/pages/        # Landing Page, Shipper, Forwarder, Customs, Admin
│   │   ├── src/modules/admin # User Verification Queue, Audit Trail, Disputes
│   │   ├── src/components/   # Animated Feature Cards, Interactive Topo Map, Nav
│   │   └── src/context/      # Database AuthContext & Bilingual Localization
│   │
│   └── mobile/               # Cross-Platform Driver & Transporter App (Expo SDK 52)
│       ├── src/screens/      # Onboarding Carousel, Login, Transporter Portal
│       ├── src/tabs/         # Overview, Fleet Vehicles, Drivers, Loads, Bids
│       ├── src/modals/       # Add Truck, Register Driver, Dispatch Modal
│       └── src/context/      # LanguageContext (Amharic & English Localization)
│
└── packages/
    └── shared/               # Shared TypeScript Types, Enums, Corridor Checkpoints
```

---

## 🌟 Key Features & Capabilities

### 1. 🌐 Modernized Landing Page & Interactive Corridor Map
- **Interactive Topographic Corridor Route Map**: Live SVG visualization depicting the 900km primary multimodal freight corridor from Djibouti Container Terminals to Modjo Dry Port and Addis Ababa.
- **Animated Glassmorphic Feature Cards**: High-performance Framer Motion cards with smooth hover lift (`-translate-y-2`), glowing ambient shadows, customized theme accents, and rich typography without clutter.
- **Compliance Trust Cards**: Direct alignment with the **Ethiopian Customs Commission (ECC)** Single Window, **ESLSE Multi-Modal Hub**, and **5-second Satellite GPS Telematics**.
- **100% Bilingual Localization**: Instant toggle between Amharic and English.

### 2. 🚚 Transporter Fleet & Driver Management (Mobile App)
- **Fleet Vehicles**: Register heavy commercial trucks with plate numbers, tonnage capacity, fuel type, **Goods in Transit (GIT) Cargo Insurance**, and **Federal Transport Authority (FTA) Roadworthiness** certification.
- **Authorized Driver Registration**: Transporters can add licensed heavy vehicle drivers (Full Name, Phone, License No, Grade 5/4, Corridor Experience, and Assigned Truck).
- **Direct Admin Verification Gate**: Drivers newly registered by transporters enter the Admin Verification Queue as `PENDING`. Drivers cannot be dispatched on active corridor shipments until officially verified by Platform Administrators.
- **Live Status Badges**: Drivers show distinct `⏳ PENDING` or `ACTIVE` indicators with instant real-time synchronization.

### 3. 🛡️ Admin Verification & Compliance Queue (Web Portal)
- **User KYC Inspection**: Review legal identities, TIN numbers, Commercial Trade Licenses, GIT Insurance policies, and FTA Roadworthiness certificates.
- **Dedicated Driver Inspection Modal**: Inspect commercial driver qualifications, years of experience, assigned fleet truck, and employing transporter.
- **Interactive Document Inspection & Download**: Clickable inspection of digital certificates with standard-compliant PDF generation and downloading.
- **Real-Time WebSocket Sync**: Changes in verification status broadcast instantly via Socket.IO, updating mobile badges and web dashboards without manual refresh.
- **Live Search & Role Filtering**: Filter users and drivers by status (`ALL`, `PENDING`, `VERIFIED`, `SUSPENDED`), role (`SHIPPER`, `TRANSPORTER`, `DRIVER`, etc.), or search by name, TIN, phone, or Driver License number.

### 4. 📦 Corridor Load Board & Instant Matching
- **Load Postings**: Shippers post import/export consignments with cargo weight, packaging type, budget in ETB, and required pickup timeline.
- **AI Instant Match & Spot Bidding**: Transporters receive direct algorithmic match requests or place competitive spot bids.
- **Telebirr & CBE Escrow Protection**: Milestone payment locks upon dispatch confirmation, with automated release upon verified delivery at destination dry ports.

---

## 📱 TradeFlow Mobile App (Driver & Transporter App — Expo SDK 52)

The TradeFlow Mobile Application (`apps/mobile`) is built on **React Native & Expo SDK 52**, designed specifically for heavy freight fleet operators and commercial truck drivers traversing the Ethiopia-Djibouti corridor.

### 🌟 Key Mobile Features & Workflows:

#### 1. 🚚 Transporter Fleet Portal:
- **Corridor Fleet Registration**: Onboard commercial heavy trucks with license plate, payload tonnage (15T-40T), fuel type, **Goods in Transit (GIT) Cargo Insurance**, and **Federal Transport Authority (FTA) Roadworthiness** certification.
- **Commercial Driver Management**: Register qualified drivers with Commercial Driver's License (CDL Grade 5/4), mobile contact, and assigned truck.
- **Mandatory Admin Verification Gate**: Newly added drivers immediately display an informative `⏳ PENDING` badge and are locked from dispatch until verified by the System Administrator in the Web Console.
- **Freight Exchange & Spot Bidding**: Inspect available cargo consignments from Addis Ababa, Modjo, and Djibouti, and submit competitive bids.
- **Corridor Dispatch Engine**: Assign verified vehicles and verified drivers to awarded consignments, instantly triggering live telematics tracking.

#### 2. 🚛 Commercial Driver Portal:
- **Active Journey Tracking**: Real-time corridor milestone tracking across key waypoints (*Addis Ababa ➔ Modjo Dry Port ➔ Awash Arba ➔ Semera Logistics Hub ➔ Galafi Border ➔ Port of Doraleh*).
- **Driver Duty Cycle Controller**: Drivers toggle between **"Start Trip"**, **"Driving / Resting"** (for mandatory rest periods, border queues, and weighbridge delays), and **"Arrive Destination"**.
- **Digital Proof of Delivery (POD)**: Capture recipient name and digital signature upon cargo delivery, triggering instant escrow settlement via Telebirr.
- **Offline-First Telematics Buffer**: Automatically queues GPS telemetry pings when traversing remote low-connectivity desert sections of the Afar corridor, synchronizing immediately when cellular connection is restored.

#### 3. 🌐 100% Bilingual Localization (Amharic & English):
- Instant in-app toggle between **Amharic** and **English** across all screens, modals, badges, and validation alerts.

---

### 📲 How to Run and Test the Mobile App:

#### Method A: Web Browser Preview (Zero Setup / Instant)
You do not need a physical phone or emulator to test the mobile app:
```powershell
npm run dev:mobile
```
*Once Metro Bundler starts, press **`w`** in the terminal to launch the mobile app in your web browser at [http://localhost:8081](http://localhost:8081).*

#### Method B: Physical Android / iOS Phone (Expo Go)
1. Download and install **Expo Go** from the **Google Play Store** or **Apple App Store**.
2. Connect your phone to the same local Wi-Fi network as your computer.
3. Start the bundler: `npm run dev:mobile`.
4. Scan the terminal's **QR Code** using your phone camera (iOS) or the Expo Go app (Android).

#### Method C: Remote Mobile Testing via Tunnel (Ethio Telecom / Safaricom)
If your phone is on cellular data or a different Wi-Fi network:
```powershell
npm run dev:mobile:tunnel
```
*Tunneling creates a secure cloud URL via ngrok/expo, allowing testing on physical phones anywhere across Ethiopia.*

---

## 🎭 User Personas & Dedicated Portals

| Role | Portal Path | Platform | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Shipper** | `/shipper` | Web | Post cargo loads, evaluate forwarder/transporter quotes, lock escrow |
| **Freight Forwarder** | `/forwarder` | Web | Multi-modal container bookings, customs declaration pre-filing |
| **Customs Officer** | `/customs` | Web | ASYCUDA risk assessment, inspection clearances, green lane approval |
| **Administrator** | `/admin` | Web | KYC Verification Queue, driver credential inspection, dispute mediation |
| **Transporter** | Mobile Portal | Mobile (Expo) | Fleet trucks, driver management, spot bidding, dispatch tracking |
| **Truck Driver** | Mobile Portal | Mobile App | Corridor checkpoint check-ins, trip status, electronic logs |

---

## ⚡ Quick Start & Development Setup (Docker-Powered)

Follow these quick steps to get TradeFlow up and running in minutes using **Docker Desktop**:

### 1. Prerequisites
- **Node.js**: `v18.0+` or `v20.0+`
- **npm**: `v9.0+`
- **Docker Desktop**: Installed and running locally

---

### 2. Install Dependencies & Launch Docker Infrastructure

```powershell
# 1. Install all monorepo dependencies
npm install

# 2. Spin up PostgreSQL 16 (PostGIS), Redis 7.2, MinIO S3, and Adminer
npm run docker:up
```
> 💡 *This starts the dedicated `tradeflow_postgres` database on port 5432 with pre-configured PostGIS corridor geospatial support. To stop containers later, simply run `npm run docker:down`.*

---

### 3. Initialize Database & Seed Demo Accounts

Once Docker is up, push the Prisma schema and seed the baseline accounts:
```powershell
# Push Prisma schema to PostgreSQL
npm run prisma:push

# Seed official System Admin and Customs Officer accounts
npm run prisma:seed
```

---

### 4. Launch the Applications

#### Option A: Launch All Services Simultaneously (Recommended)
```powershell
npm run dev:all
```
*Spins up Backend API, Web Portal, and Mobile Bundler in a single unified terminal.*

#### Option B: Launch in Separate Terminal Windows
* **Terminal 1 (Backend API)**: `npm run dev:api` ➔ [http://localhost:5000](http://localhost:5000)
* **Terminal 2 (Web Portal)**: `npm run dev:web` ➔ [http://localhost:3000](http://localhost:3000)
* **Terminal 3 (Mobile App)**: `npm run dev:mobile` ➔ [http://localhost:8081](http://localhost:8081)

---

### 5. Access Points & Portals

| Platform | Local URL | Primary Features |
| :--- | :--- | :--- |
| 🌐 **Enterprise Web Portal** | [http://localhost:3000](http://localhost:3000) | Landing page, Corridor Topo Map, Shipper, Forwarder, Customs, Admin |
| 📑 **Interactive Swagger API** | [http://localhost:5000/api/docs](http://localhost:5000/api/docs) | Complete 11-module OpenAPI 3.0 specification with live *Try-It-Out* |
| 📱 **Driver & Transporter App** | [http://localhost:8081](http://localhost:8081) | Expo Metro Bundler (Press `w` for web preview or scan QR in Expo Go) |
| 🖥️ **Adminer Database Console** | [http://localhost:8080](http://localhost:8080) | Visual PostgreSQL database table explorer (System: `PostgreSQL`, DB: `tradeflow_db`) |
| 🗄️ **Prisma Studio Explorer** | [http://localhost:5555](http://localhost:5555) | Run `npm run prisma:studio` for visual Prisma schema & record browsing |

---

## 📑 Interactive Swagger API Documentation

TradeFlow comes equipped with a comprehensive **OpenAPI 3.0** specification and interactive **Swagger UI** with live *Try-It-Out* capabilities:

- 🔗 **Interactive Swagger UI Console**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- 🔗 **Raw OpenAPI Specification (JSON)**: [http://localhost:5000/api/docs/json](http://localhost:5000/api/docs/json)

### Complete 11-Module API Coverage (48 Endpoints):

| Module Tag | Path Prefix | Key Endpoints & Capabilities |
| :--- | :--- | :--- |
| **System** | `/api/health` | Service health, PostgreSQL connectivity, corridor status |
| **Authentication** | `/api/auth` | Multi-persona registration, JWT login, Google OAuth 2.0, user directory |
| **Portal & Marketplace** | `/api/portal` | Loads, competitive RFQ bids, fleet trucks, drivers, verifications, audit logs, ratings |
| **AI Freight Matching** | `/api/matching` | Multi-attribute weighted utility ranking (Cost 35%, Rel 30%, Prox 20%, Fuel 15%) |
| **Telematics & Live Tracking** | `/api/tracking` | GPS telemetry ingestion, corridor waypoint geofencing, route polylines, dynamic ETA |
| **Dynamic Pricing** | `/api/pricing` | Itemized spot rates, fuel index surcharges, contract rate divergence monitor (>20%) |
| **Corridor Optimization** | `/api/optimization` | Multi-criteria route planning (Highway A-1 vs Southern Bypass), road hazard alerts |
| **Customs Clearance** | `/api/customs` | Automated pre-submission document validator, officer review queue, clearance ledger |
| **Payments & Escrow** | `/api/payments` | TeleBirr / CBE Birr escrow deposit, 5% platform fee, driver settlement, dispute arbitration |
| **Freight Forwarder** | `/api/forwarder` | Multi-shipper client portfolio, LTL cargo consolidation into 40ft containers, multimodal tracking |
| **Analytics & KPIs** | `/api/analytics` | Fleet fuel efficiency benchmarking (km/L), corridor driver eco-scores, transporter rankings |

---

## 🛠️ Database Management (Prisma ORM)

```powershell
# Push Prisma schema migrations to PostgreSQL
npm run prisma:push

# Launch Prisma Studio Web UI database explorer
npm run prisma:studio

# Seed demo users and initial corridor consignments
npm run prisma:seed
```

---

## 🔒 Seeded System Credentials (from `prisma/seed.ts`)

The database seeding script (`npm run prisma:seed`) initializes the official administrative and regulatory oversight authorities:

| Persona | Email / Identifier | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@miaoda.com` | `Admin2024!` | `ADMIN` | TradeFlow Platform Management & User KYC Verification Console |
| **Customs Officer** | `kebede@miaoda.com` | `Demo1234!` | `CUSTOMS_OFFICER` | Inspector Kebede Worku (Ethiopian Customs Commission ECC) |

> 💡 **Commercial Roles (Shipper, Transporter, Forwarder, Driver):**  
> Per system specification, commercial actors register directly via the **Registration Page** or **Mobile App**. Newly registered organizations and drivers enter the **Admin Verification Queue** (`/admin`) as `PENDING` and are verified in real time by the System Administrator upon reviewing their TIN, Trade License, GIT Insurance, Roadworthiness, or Commercial Driver's License (CDL).

---

## 📄 Compliance & Corridor Standards

- **Ethiopian Customs Commission (ECC)**: Single-Window ASYCUDA declaration pre-filing.
- **Federal Transport Authority (FTA)**: Commercial driver licensing & heavy vehicle roadworthiness certification.
- **National Bank of Ethiopia (NBE)**: Milestone escrow regulations via Telebirr & CBE digital financial services.
- **ESLSE Multi-Modal Hub**: Seamless coordination between Djibouti Sea Port, Galafi border post, and Modjo Dry Port.

---

*TradeFlow v2 Platform — Built for the Ethiopian Logistics Modernization Initiative. All rights reserved © 2026.*
