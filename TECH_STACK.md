# TradeFlow — System Tech Stack & Architecture Specification

## Production-Grade Monorepo (PERN Stack + TypeScript + Real-Time Telematics & Offline Support)

---

## 1. Selected Technology Stack Matrix

| ክፍል (Layer)                    | የመጨረሻው የተመረጠ ቴክኖሎጂ (Selected Technology)                          | ሚና እና ጥቅም (Role & Purpose)                                                                                                                                 |
| :-------------------------------- | :-------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Web Frontend**            | **React (Vite) + TypeScript + Tailwind CSS**                                | ለ**Shipper**, **Freight Forwarder**, **Customs Authority**, እና **Platform Admin** የተዘጋጀ የድህረ-ገጽ ፖርታል (Desktop/Tablet)። |
| **Mobile App**              | **React Native (Expo) + TypeScript**                                        | ለ**Driver (አሽከርካሪ)** እና ለ **Transporter (የጭነት አጓጓዥ/ባለቤት)** ብቻ የተዘጋጀ ራሱን የቻለ የሞባይል መተግበሪያ።              |
| **Mobile Local DB**         | **SQLite (Offline-First)**                                                  | በበረሃማ ቦታዎች ወይም ኔትወርክ በሌለበት የፍተሻ ጣቢያ Check-in እና የአደጋ ሪፖርት በስልክ ላይ መዝግቦ ለማቆየት።                              |
| **Backend API**             | **Node.js + Express.js + TypeScript**                                       | የቢዝነስ ህጎች፣ የ AI ማዛመጃ አልጎሪዝም፣ የዋጋ ማሰያ፣ የደህንነት RBAC እና የቴሌብር API።                                                         |
| **Primary Database & ORM**  | **PostgreSQL + PostGIS & Prisma (with `$queryRaw` / Spatial Extensions)** | የጭነት፣ የተጠቃሚዎች፣ የሰነዶች፣ የክፍያ እና የጂኦ-ስፓሻል (Corridor Coordinates/Polygons) ዳታቤዝ እና የዳታ ማስተዳደሪያ።                      |
| **Shared Types Package**    | **`packages/shared` (TypeScript Interfaces & Enums)**                     | ለ Web፣ Mobile እና Backend API አንድ አይነት የሆኑ የዳታ አይነቶች (Entities, DTOs, Enums) የያዘ የጋራ ፓኬጅ።                                          |
| **In-Memory Cache & Queue** | **Redis**                                                                   | ለተደጋጋሚ የዋጋ ጥያቄዎች Cache ማድረጊያ እና ለከፍተኛ የቴሌማቲክስ ጂፒኤስ ዳታ Message Queue።                                                      |
| **File / Document Storage** | **MinIO (S3-Compatible Object Storage)**                                    | የንግድ ፈቃድ፣ TIN፣ የጉምሩክ ሰነዶች (Invoice, B/L)፣ የዲጂታል ርክክብ ፊርማ (POD) እና ፎቶዎች።                                                     |
| **Realtime Engine**         | **Socket.io**                                                               | የቀጥታ የጂፒኤስ መኪና እንቅስቃሴ (Live Tracking Map) እና ፈጣን ማሳወቂያዎች (Milestone Notifications)።                                                |
| **External Integrations**   | **TeleBirr API, Customs ECC API, SMS Gateway, MinIO**                       | የሞባይል ገንዘብ ክፍያ፣ የጉምሩክ ሲስተም፣ እና ኔትወርክ በማይኖርበት ጊዜ የሚላክ የ SMS Gateway ማሳወቂያ።                                       |
| **Maps & Tracking UI**      | **Leaflet / Mapbox GL**                                                     | የጅቡቲ ➔ ሞጆ ➔ አዲስ አበባ ኮሪደር የቀጥታ ካርታ፣ የፍተሻ ጣቢያዎች፣ የነዳጅ ማደያዎች እና የጸጥታ ስጋት ቀጠናዎች።                          |
| **Corridor Seed Engine**    | **Prisma Seeding (`prisma/seed.ts`)**                                     | የኢትዮጵያ–ጅቡቲ መስመር የፍተሻ ጣቢያዎች (Waypoints)፣ ማደያዎች፣ እና 6ቱ Demo አካውንቶች መነሻ ዳታ።                                             |
| **Environment / Setup**     | **Docker Compose**                                                          | PostgreSQL (PostGIS), Redis, MinIO እና Node.js Backend በአንድ ላይ በቀላሉ ለማስነሳት።                                                                     |

---

## 2. Updated Monorepo Project Directory Structure

```
tradeflow-v2/
├── apps/
│   ├── web/                    # React (Vite) + TypeScript + Tailwind CSS (Shipper, Forwarder, Customs, Admin)
│   │   ├── src/
│   │   │   ├── assets/         # Images, corridor maps, logos
│   │   │   ├── components/     # Reusable UI (Navbar, Sidebar, Modal, Tables, Badges, MapViewer)
│   │   │   ├── context/        # AuthContext, LanguageContext (Amharic/English), SocketContext
│   │   │   ├── hooks/          # useAuth, useTracking, useMatching, usePricing
│   │   │   ├── pages/          # Portals:
│   │   │   │   ├── shipper/    # Dashboard, PostLoad, Bids, Tracking, Customs, Payments
│   │   │   │   ├── forwarder/  # Consolidation, MultiShipper, CustomsTracking
│   │   │   │   ├── customs/    # ClearanceQueue, DocumentReview, Verification
│   │   │   │   └── admin/      # VerificationQueue, Disputes, SystemHealth, AuditLogs
│   │   │   ├── services/       # Axios API client, Leaflet map utilities
│   │   │   └── types/          # Frontend-specific types
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── mobile/                 # React Native (Expo) + TypeScript + SQLite (Driver & Transporter Only)
│       ├── src/
│       │   ├── screens/        # Driver Navigation, Offline Check-in, Incident Report, POD, Transporter Fleet/Bids
│       │   ├── database/       # SQLite offline sync queue & local database
│       │   └── services/       # Background GPS tracking & FCM Push
│       └── package.json
│
├── packages/
│   └── shared/                 # ⭐️ የጋራ Types, Enums, Interfaces እና Validation Schemas
│       ├── src/
│       │   ├── enums/          # UserRole, LoadStatus, ShipmentStatus, ClearanceStatus, RiskLevel
│       │   ├── interfaces/     # User, Vehicle, Load, Bid, Shipment, CustomsDoc, Payment, Route
│       │   └── algorithms/     # MatchingWeights, PricingFormulaConstants, ETAFactors
│       ├── package.json
│       └── tsconfig.json
│
├── services/
│   └── api/                    # Node.js + Express.js + TypeScript
│       ├── prisma/             # PostgreSQL Database Schema, Migrations & Corridor Seed Data
│       │   ├── schema.prisma   # 14 Core Entities with PostGIS types
│       │   └── seed.ts         # Preloaded Corridor Waypoints, Fuel Stations, Risk Zones, Demo Users
│       ├── src/
│       │   ├── controllers/    # Auth, Load, Bid, Shipment, Tracking, Customs, Payment, Admin
│       │   ├── middleware/     # AuthJWT, RBAC, RateLimiter, AuditLogger
│       │   ├── algorithms/     # FreightMatching, DynamicPricing, DynamicETA, RouteOptimizer(CVRP)
│       │   ├── realtime/       # Socket.io GPS telematics gateway
│       │   ├── integrations/   # TeleBirr, Customs API, SMS Gateway, MinIO Object Storage
│       │   └── server.ts       # Express app entry point
│       ├── package.json
│       └── tsconfig.json
│
├── docker-compose.yml          # Postgres + PostGIS, Redis, MinIO
├── REQUIREMENTS.md             # Master SRS specifications
└── TECH_STACK.md               # Architecture & Stack Reference
```

---

## 3. Implementation Workflow

1. **Step 1: Monorepo Foundation & Shared Packages**

   - Setup `packages/shared/` containing all Core TypeScript types, enums, and algorithm constants.
2. **Step 2: Backend Infrastructure & Corridor Database (services/api)**

   - Docker Compose setup (PostgreSQL + PostGIS, Redis, MinIO)
   - Prisma schema setup for all 14 Core Entities
   - Corridor Seeding Script (`seed.ts` for Djibouti–Modjo–Addis Ababa waypoints, fuel stations, risk zones, demo users)
   - Real-time Socket.io telematics gateway and core algorithms (Matching, Pricing, ETA, CVRP)
3. **Step 3: Web Frontend Architecture (apps/web)**

   - Setup React (Vite) + Tailwind CSS + Lucide Icons + Leaflet (Corridor Map Viewer)
   - Multi-role Auth Context & One-Click Demo Account Switcher
   - Bilingual Localization Engine (English & Amharic)
4. **Step 4: Sequential Module Execution according to REQUIREMENTS.md**

   - **4.1 FR-01: Multi-Role Onboarding & Verification** (4.1.1 ➔ 4.1.2 ➔ 4.1.3 ➔ 4.1.4)
   - **4.2 FR-02: Real-Time AI Freight Matching & Bidding** (4.2.1 ➔ 4.2.2 ➔ 4.2.3 ➔ 4.2.4)
   - **4.3 FR-03: Real-Time Shipment Tracking & ETA Prediction**
   - **4.4 FR-04: Dynamic Pricing Engine**
   - **4.5 FR-05: Fuel & Security-Aware Route Optimization**
   - **4.6 FR-06: Digital Customs Documentation**
   - **4.7 FR-07: Fuel Consumption Analytics**
   - **4.8 FR-08: Conflict Zone Alerts & Rerouting**
   - **4.9 FR-09: Transporter Performance Analytics**
   - **4.10 FR-10: Payment & Settlement (TeleBirr)**
