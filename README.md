# 🚛 TradeFlow v2 — Intelligent Logistics & Freight Matching Platform

> **Accelerating Cross-Border Commerce along the Ethiopia-Djibouti Trade Corridor**  
> *(Lake Abbe ➔ Galafi / Dewele ➔ Mojo Dry Port ➔ Addis Ababa)*

---

## 📌 Executive Summary

**TradeFlow** is an enterprise-grade, offline-first digital logistics and freight-matching ecosystem designed specifically for the landlocked Ethiopian supply chain. It connects **Shippers**, **Freight Forwarders**, **Customs Officers**, **Transporters**, and **Commercial Truck Drivers** into a unified real-time network with national digital payments (Telebirr / CBE Birr) and ASYCUDA-compatible digital customs clearance.

---

## 🏛️ System Architecture

```text
tradeflow-v2/ (Turborepo / npm Workspaces Monorepo)
├── services/
│   └── api/                  # Node.js Express REST & Real-Time Socket.IO API
│       ├── prisma/           # PostgreSQL Schema & Seed Scripts
│       ├── src/controllers/  # Auth, User Verification, Telematics Controllers
│       ├── src/docs/         # OpenAPI 3.0 Specification & Swagger UI
│       └── src/routes/       # Express Route Modules
│
├── apps/
│   ├── web/                  # Enterprise Desktop & Tablet Web Portal (Vite + React)
│   │   ├── src/pages/        # Shipper, Forwarder, Customs, and Admin Portals
│   │   ├── src/components/   # Auth Dialogs, Google OAuth 2.0, Dashboard Layouts
│   │   └── src/context/      # Database AuthContext & Locale State
│   │
│   └── mobile/               # Cross-Platform Driver & Transporter App (Expo SDK 52)
│       ├── src/screens/      # Welcome Onboarding Carousel, Login, Register, Portals
│       ├── src/components/   # 1:1 3D Isometric Highway & Route Vector Illustrations
│       └── src/context/      # LanguageContext (Amharic 🇪🇹 & English 🌐)
│
└── packages/
    └── shared/               # Shared TypeScript Types, Enums, Corridor Checkpoints
```

---

## 🎭 User Personas & Dedicated Portals

| Role | Portal Path | Platform | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Shipper** | `/shipper` | Web | Create load postings, compare forwarder bids, track cargo status |
| **Freight Forwarder** | `/forwarder` | Web | Multi-modal container booking, customs document pre-filing, fleet dispatch |
| **Customs Officer** | `/customs` | Web | ASYCUDA risk scoring, declaration review, digital inspection approvals |
| **Administrator** | `/admin` | Web | Corridor throughput analytics, TIN & commercial license verification |
| **Transporter** | Mobile Portal | Mobile / Web | Fleet telematics, trip management, Telebirr payment disbursements |
| **Truck Driver** | Mobile Portal | Mobile App | Offline GPS check-ins at corridor checkpoints, digital trip logs |

---

## ⚡ Quick Start & Development Setup

### 1. Prerequisites
- **Node.js**: `v18.0+` or `v20.0+`
- **npm**: `v9.0+`
- **PostgreSQL Database** (configured in `services/api/.env`)

### 2. Environment Setup

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

### Option A: Launch Everything with 1 Command (Recommended) 🔥
In your root terminal:
```powershell
npm run dev:all
```
*Automatically starts the Backend API, Web Portal, and Mobile App simultaneously with color-coded logs.*

---

### Option B: Launch in Separate Terminal Windows

#### Terminal 1 — Backend REST API & Swagger UI:
```powershell
npm run dev:api
```
- **API Server**: [http://localhost:5000](http://localhost:5000)
- **Interactive Swagger Docs**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

#### Terminal 2 — Enterprise Web Portal:
```powershell
npm run dev:web
```
- **Web App**: [http://localhost:3000](http://localhost:3000)

#### Terminal 3 — Driver & Transporter Mobile App:
```powershell
npm run dev:mobile
```
- **Expo DevTools**: Press `w` for Web View, or scan the QR code using **Expo Go** on Android / iOS.

---

## 📑 Interactive Swagger API Documentation

TradeFlow comes with full **OpenAPI 3.0** documentation and an interactive **Swagger UI** test console:

- 🔗 **Swagger UI**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- 🔗 **OpenAPI JSON**: [http://localhost:5000/api/docs/json](http://localhost:5000/api/docs/json)
- 🔗 **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Documented Endpoints:
- `POST /api/auth/register` — Register new verified accounts with exact TIN and company identity.
- `POST /api/auth/login` — Authenticate existing database users with JWT issuance.
- `POST /api/auth/google` — Google OAuth 2.0 token verification & upsert.
- `GET /api/auth/users` — Corridor user management directory.
- `GET /api/health` — System operational status and corridor heartbeat.

---

## 📱 Mobile Features & 1:1 Design Fidelity

- **1:1 Onboarding Vector Carousel**:
  - **Slide 1**: 3D Isometric Highway Ribbon with freight semi-truck driving on asphalt, Lake Abbe shoreline, Djibouti Flag, Ethiopian Flag, and Mojo Dry Port Pin.
  - **Slide 2**: 2D Corridor Route Map connecting Lake Abbe to Mojo Dry Port with primary & secondary routes.
  - **Slide 3**: Cross-Border Cargo highway with heavy truck and national flags.
- **Universal Graphics**: Dual-mode rendering supporting Web SVG and pure Native React Native Views on Android & iOS devices.
- **Adaptive Viewport**: 100% full-screen fit on mobile devices / Chrome DevTools and realistic smartphone shell on desktop displays.
- **Bilingual Localization**: 100% Pure Amharic (አማርኛ) and English language toggle.

---

## 🛠️ Database Management Commands

```powershell
# Push Prisma schema changes to PostgreSQL database
npm run prisma:push

# Reset database and re-seed demo personas
npm run prisma:reset
npm run prisma:seed

# Launch Prisma Studio Web UI database explorer
npm run prisma:studio
```

---

## 🔒 Demo Credentials for Fast Evaluation

| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Shipper** | `abebe@ethiopiancoffee.et` | `Password123!` | `SHIPPER` |
| **Freight Forwarder** | `dawit@mojofreight.et` | `Password123!` | `FREIGHT_FORWARDER` |
| **Customs Officer** | `customs.officer@erca.gov.et` | `Password123!` | `CUSTOMS_OFFICER` |
| **Administrator** | `admin@tradeflow.et` | `Password123!` | `ADMIN` |
| **Transporter** | `transporter@abyssinialogistics.et` | `Password123!` | `TRANSPORTER` |
| **Truck Driver** | `kebede.driver@gmail.com` | `Password123!` | `DRIVER` |

---

## 📄 License
TradeFlow Platform — Developed for the Ethiopian Logistics Modernization Initiative. All rights reserved.
