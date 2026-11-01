# 🚚 TradeFlow: Intelligent Ethio-Djibouti Trade Corridor Freight Logistics, Telematics & Digital Escrow Platform

**Comprehensive Final Project Documentation & Technical Report**  
*Software Development Training — Final Group Capstone Project*  
**Submission Date:** November 2026  
**Project Version:** v1.1.6 (Production Release)  

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

---

## 1. Project Background & Corridor Context

The 910 km multi-modal transit corridor connecting the Port of Doraleh to the dry port inland container depots of Modjo and Kaliti channels over 95% of Ethiopia's inbound and outbound trade. TradeFlow eliminates manual paper brokerage, payment defaults, and border customs queues.

---

## 2. Requirements Specification & User Personas

The platform supports five operational personas: Shipper, Transporter, Driver, Customs Officer, and Administrator, governed by Functional Requirements FR-01 through FR-10 and rigorous Non-Functional Requirements.

---

## 3. System Architecture & Technology Stack

Built as a high-performance TypeScript monorepo with pnpm workspaces combining Next.js 14, React Native Expo SDK 52, Express.js, PostgreSQL Neon Serverless, and Prisma ORM.

---

## 4. Database Design & Prisma Schema

Normalized relational schema spanning User, Load, Bid, Shipment, CustomsClearance, Payment, IncidentReport, and Rating entities.

---

## 5. Digital Smart Escrow Protocol & Settlements

6-stage milestone escrow state machine securing 100% freight payments prior to vehicle dispatch with atomic `prisma.$transaction` releasing 95% net payout to transporters upon verified e-POD.

---

## 6. Corridor Telematics & GPS Geofencing

11 strategic waypoints from Kaliti to Doraleh Port verified via mathematical Haversine proximity calculations (15 km geofence radius) with offline AsyncStorage queue buffering for desert dead zones.

---

## 7. Single-Window Customs Transit Clearance

4-document digital dossier management (Declaration, Commercial Invoice, Packing List, Cargo Insurance) with automated Green Line routing and cryptographic dynamic QR transit passes.

---

## 8. Driver Mobile Application Engineering

React Native Expo SDK 52 mobile client with geofenced check-in workflows, crowdsourced route hazard broadcasting, and dual-factor electronic Proof of Delivery (capacitive signature canvas + cargo photo).

---

## 9. Transporter Fleet Management Portal

Fleet vehicle management, driver allocation, open load bidding engine, and real-time escrow wallet ledger.

---

## 10. Shipper & Customs Commission Web Portals

Shipper freight tender wizard, Leaflet GIS live corridor map, one-click e-POD approval, and ECC single-window border inspection console.

---

## 11. Trilingual Localization & Adaptive Theming

Complete instant language switching across English, Amharic, and Afaan Oromoo with synchronized high-contrast AMOLED dark mode.

---

## 12. Backend REST API Architecture

Node.js Express REST API controllers, comprehensive endpoints catalog, interactive Swagger OpenAPI specification (`/api/docs`), and health checks (`/api/health`).

---

## 13. Testing, Verification & Quality Assurance

Comprehensive test suite (TC-01 through TC-12) covering unit, integration, escrow settlement, and physical device testing across Samsung Galaxy A13, Tecno Spark 10, and Xiaomi Redmi Note 11.

---

## 14. Technical Challenges & Innovative Solutions

Resolving desert cellular dropouts via offline FIFO queueing, Samsung dark mode color inversion via dynamic factory hooks, and escrow concurrency race conditions via atomic database transactions.

---

## 15. Capstone Team Allocation & Evaluation

Detailed contribution allocation for Bereket Sahlemariam (`CTC-1041-26`), Dagnaw Mekasha (`CTC-1339-26`), and Hamelmal Belayneh (`CTC-1116-26`), along with academic endorsement and supervisor sign-off table.