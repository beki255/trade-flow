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
│       └── src/context/      # LanguageContext (Pure Amharic 🇪🇹 & English 🌐)
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
- **100% Bilingual Localization**: Instant toggle between Pure Amharic (**አማርኛ**) and English (**English**).

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

## ⚡ Quick Start & Development Setup

### 1. Prerequisites
- **Node.js**: `v18.0+` or `v20.0+`
- **npm**: `v9.0+`
- **PostgreSQL Database** running locally on port `5432`

### 2. Environment Configuration

#### Backend (`services/api/.env`):
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tradeflow?schema=public"
JWT_SECRET="tradeflow_secret_key_2026"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### Web Frontend (`apps/web/.env`):
```env
VITE_API_URL="http://localhost:5000/api"
VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

---

## 🚀 Running the Project

### Option A: Launch All Services (Recommended)
From the project root:
```powershell
npm run dev:all
```
*Launches Backend API, Web Portal, and Mobile App simultaneously with unified logs.*

---

### Option B: Launch in Separate Terminal Windows

#### Terminal 1 — Backend REST & WebSocket API:
```powershell
npm run dev:api
```
- **API Server**: [http://localhost:5000](http://localhost:5000)
- **Interactive Swagger Docs**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

#### Terminal 2 — Enterprise Web Portal:
```powershell
npm run dev:web
```
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **Admin Console**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Shipper Portal**: [http://localhost:3000/shipper](http://localhost:3000/shipper)
- **Customs Portal**: [http://localhost:3000/customs](http://localhost:3000/customs)

#### Terminal 3 — Driver & Transporter Mobile App:
```powershell
npm run dev:mobile
```
- **Expo Metro Bundler**: [http://localhost:8081](http://localhost:8081)
- Press `w` to open in browser, or scan QR code via **Expo Go** on Android / iOS.

---

## 📑 Interactive Swagger API Documentation

TradeFlow comes pre-configured with full **OpenAPI 3.0** documentation and an interactive **Swagger UI**:

- 🔗 **Swagger UI Console**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- 🔗 **OpenAPI Schema (JSON)**: [http://localhost:5000/api/docs/json](http://localhost:5000/api/docs/json)

### Key Endpoints:
- `POST /api/auth/register` — Register business identity with TIN & trade licenses.
- `POST /api/auth/login` — Authenticate users with JWT session issuance.
- `GET /api/portal/verifications` — Retrieve pending KYC queue for organizations and drivers.
- `POST /api/portal/verify-user` — Update verification status (`VERIFIED`, `SUSPENDED`, `REJECTED`) with real-time socket emit.
- `GET /api/portal/drivers` — Fetch scoped drivers with license details and verification status.
- `POST /api/portal/drivers` — Register driver into PostgreSQL database in `PENDING` status.
- `GET /api/portal/vehicles` — Query fleet vehicles with GIT insurance & roadworthiness certificates.
- `POST /api/portal/dispatch` — Assign verified truck & verified driver to an accepted consignment.

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

## 🔒 Demo Credentials for Fast Evaluation

| Persona | Email / Identifier | Password | Role |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin@tradeflow.et` | `password123` | `ADMIN` |
| **Shipper** | `abebe@ethiopiancoffee.et` | `password123` | `SHIPPER` |
| **Freight Forwarder** | `dawit@mojofreight.et` | `password123` | `FORWARDER` |
| **Customs Inspector** | `customs.officer@erca.gov.et` | `password123` | `CUSTOMS_OFFICER` |
| **Transporter (Carrier)** | `mulugeta@miaoda.com` | `password123` | `TRANSPORTER` |
| **Commercial Driver** | `0999999999` | `Driver@123` | `DRIVER` |

---

## 📄 Compliance & Corridor Standards

- **Ethiopian Customs Commission (ECC)**: Single-Window ASYCUDA declaration pre-filing.
- **Federal Transport Authority (FTA)**: Commercial driver licensing & heavy vehicle roadworthiness certification.
- **National Bank of Ethiopia (NBE)**: Milestone escrow regulations via Telebirr & CBE digital financial services.
- **ESLSE Multi-Modal Hub**: Seamless coordination between Djibouti Sea Port, Galafi border post, and Modjo Dry Port.

---

*TradeFlow v2 Platform — Built for the Ethiopian Logistics Modernization Initiative. All rights reserved © 2026.*
