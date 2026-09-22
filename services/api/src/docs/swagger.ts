import { Request, Response } from 'express';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'TradeFlow API — Intelligent Logistics & Freight Matching',
    version: '1.0.0',
    description: `
**TradeFlow Backend REST & Realtime Telematics API**
Designed for the Ethiopia-Djibouti Trade Corridor (Lake Abbe ➔ Mojo Dry Port ➔ Addis Ababa).

### Features & Capabilities:
- 🔐 **Multi-Persona IAM & Security**: Role-based access for Shipper, Freight Forwarder, Customs Officer, Transporter, Driver, and Admin.
- 🌐 **Google OAuth 2.0 & JWT Sessions**.
- 🤖 **AI Matching Engine (4.2.2)**: Multi-attribute utility ranking with Cost (35%), Reliability (30%), Proximity (20%), and Fuel Efficiency (15%).
- 📍 **Offline-First Telematics & Live Tracking**: GPS telemetry batch ingestion, corridor waypoint geofencing, and dynamic ETA estimation.
- 💰 **Dynamic Corridor Pricing**: Itemized spot rates, fuel surcharges, and contract renegotiation divergence triggers (>20%).
- 🛡️ **Customs Clearance Dossiers**: Pre-submission automated document cross-validation and Single-Window officer approval workflow.
- 💳 **Escrow & National Digital Payments**: TeleBirr & CBE Birr escrow locks, 5% platform commission, and automated settlement.
- 📦 **Freight Forwarder Consolidation**: Multi-shipper portfolio management and LTL cargo high-cube container consolidation.
    `,
    contact: {
      name: 'TradeFlow Engineering Team',
      email: 'dev@tradeflow.et',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'System', description: 'Health checks and runtime status' },
    { name: 'Authentication', description: 'User registration, login, Google OAuth, and user management' },
    { name: 'Portal & Marketplace', description: 'Loads, bidding, fleet management, verification, audit logs, and customs provisioning' },
    { name: 'AI Freight Matching', description: 'AI-driven carrier selection and booking options (Instant Match vs Competitive Bidding)' },
    { name: 'Telematics & Live Tracking', description: 'GPS stream ingestion, corridor geofencing, checkpoint milestones, and live map feeds' },
    { name: 'Dynamic Pricing', description: 'Corridor spot rate calculator, fuel price adjustments, and contract rate divergence analysis' },
    { name: 'Corridor Optimization', description: 'Multi-criteria route planning, road risk scoring, and driver incident reporting' },
    { name: 'Customs Clearance', description: 'Single-Window regulatory dossier inspection, document validation, and border clearance' },
    { name: 'Payments & Escrow', description: 'TeleBirr escrow deposit, driver payout settlements, and dispute arbitration' },
    { name: 'Freight Forwarder', description: 'LTL cargo consolidation, multi-shipper management, and multi-modal transit tracking' },
    { name: 'Analytics & KPIs', description: 'Fleet fuel consumption benchmarking and transporter performance metrics' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_98a7sd6f54' },
          email: { type: 'string', example: 'admin@miaoda.com' },
          name: { type: 'string', example: 'TradeFlow System Administrator' },
          role: {
            type: 'string',
            enum: ['SHIPPER', 'FREIGHT_FORWARDER', 'CUSTOMS_OFFICER', 'TRANSPORTER', 'DRIVER', 'ADMIN'],
            example: 'ADMIN',
          },
          companyName: { type: 'string', example: 'TradeFlow Platform Management' },
          tinNumber: { type: 'string', example: 'TF-ADMIN-0001' },
          phoneNumber: { type: 'string', example: '+251900000001' },
          verificationStatus: {
            type: 'string',
            enum: ['PENDING', 'VERIFIED', 'REJECTED'],
            example: 'VERIFIED',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@miaoda.com' },
          password: { type: 'string', example: 'Admin2024!' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name', 'role'],
        properties: {
          email: { type: 'string', example: 'sara@redseaforwarders.et' },
          password: { type: 'string', example: 'SecurePass123!' },
          name: { type: 'string', example: 'Sara Haile' },
          role: {
            type: 'string',
            enum: ['SHIPPER', 'FREIGHT_FORWARDER', 'CUSTOMS_OFFICER', 'TRANSPORTER', 'DRIVER', 'ADMIN'],
            example: 'FREIGHT_FORWARDER',
          },
          companyName: { type: 'string', example: 'Red Sea Forwarding PLC' },
          tinNumber: { type: 'string', example: '0098472819' },
          phoneNumber: { type: 'string', example: '+251911002233' },
        },
      },
      GoogleAuthRequest: {
        type: 'object',
        required: ['credential'],
        properties: {
          credential: { type: 'string', description: 'Google ID Token from Google Sign-In' },
          role: { type: 'string', example: 'FREIGHT_FORWARDER' },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'OK' },
          service: { type: 'string', example: 'TradeFlow API' },
          timestamp: { type: 'string', example: '2026-09-23T01:45:00.000Z' },
          corridor: { type: 'string', example: 'Djibouti-Modjo-Addis Ababa' },
        },
      },
      PortalStats: {
        type: 'object',
        properties: {
          totalUsers: { type: 'integer', example: 12 },
          pendingVerifications: { type: 'integer', example: 2 },
          verifiedUsers: { type: 'integer', example: 10 },
          activeLoads: { type: 'integer', example: 6 },
          totalShipments: { type: 'integer', example: 8 },
          totalBids: { type: 'integer', example: 15 },
          systemHealth: { type: 'string', example: 'OPERATIONAL' },
          corridorStatus: { type: 'string', example: 'ACTIVE' },
        },
      },
      Load: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cld_8a9f7e1b-4d2c' },
          title: { type: 'string', example: 'Export Grade 1 Sidama Coffee Beans' },
          cargoType: { type: 'string', example: 'AGRICULTURAL_COFFEE' },
          cargoDescription: { type: 'string', example: '600 jute bags parchment coffee (19.2% moisture standard)' },
          weightTons: { type: 'number', example: 28.5 },
          volumeCbm: { type: 'number', example: 42.0 },
          originName: { type: 'string', example: 'Hawassa Industrial Park Coffee Warehouse' },
          destName: { type: 'string', example: 'Port of Doraleh Container Terminal (SGTD), Djibouti' },
          spotEstimatedPriceEtb: { type: 'number', example: 185000 },
          targetBudgetEtb: { type: 'number', example: 180000 },
          status: { type: 'string', example: 'OPEN' },
        },
      },
      CreateLoadRequest: {
        type: 'object',
        required: ['title', 'weightTons', 'origin', 'destination'],
        properties: {
          title: { type: 'string', example: 'Export Grade 1 Sidama Coffee Beans' },
          weightTons: { type: 'number', example: 28.5 },
          origin: { type: 'string', example: 'Addis Ababa Kaliti Logistics Hub' },
          destination: { type: 'string', example: 'Port of Doraleh (SGTD), Djibouti' },
          targetBudget: { type: 'number', example: 185000 },
          shipperEmail: { type: 'string', example: 'kebede@miaoda.com' },
        },
      },
      Vehicle: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'veh_01a2b3c4' },
          plateNumber: { type: 'string', example: 'ET-3-A48291' },
          vehicleType: { type: 'string', example: 'SEMI_TRAILER_HEAVY' },
          capacityTons: { type: 'number', example: 35.0 },
          fuelType: { type: 'string', example: 'DIESEL' },
          gpsUnitId: { type: 'string', example: 'GPS-ET-89102' },
          isAssigned: { type: 'boolean', example: true },
        },
      },
      CreateVehicleRequest: {
        type: 'object',
        required: ['plateNumber', 'vehicleType', 'capacityTons'],
        properties: {
          plateNumber: { type: 'string', example: 'ET-3-A48291' },
          vehicleType: { type: 'string', example: 'SEMI_TRAILER_HEAVY' },
          capacityTons: { type: 'number', example: 35.0 },
          fuelType: { type: 'string', example: 'DIESEL' },
          gpsUnitId: { type: 'string', example: 'GPS-ET-89102' },
        },
      },
      Driver: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'drv_9012abcd' },
          fullName: { type: 'string', example: 'Alazar Tesfaye' },
          phone: { type: 'string', example: '+251911334455' },
          licenseNumber: { type: 'string', example: 'DL-ET-2024-9988' },
          experienceYears: { type: 'integer', example: 7 },
          verificationStatus: { type: 'string', example: 'PENDING' },
          assignedVehiclePlate: { type: 'string', example: 'ET-3-A48291' },
        },
      },
      CreateDriverRequest: {
        type: 'object',
        required: ['fullName', 'email', 'phone', 'licenseNumber'],
        properties: {
          fullName: { type: 'string', example: 'Alazar Tesfaye' },
          email: { type: 'string', example: 'alazar@mojofreight.et' },
          phone: { type: 'string', example: '+251911334455' },
          licenseNumber: { type: 'string', example: 'DL-ET-2024-9988' },
          experienceYears: { type: 'integer', example: 7 },
          assignedVehicleId: { type: 'string', example: 'veh_01a2b3c4' },
        },
      },
      VerificationActionRequest: {
        type: 'object',
        required: ['userId', 'status'],
        properties: {
          userId: { type: 'string', example: 'usr_drv_9921' },
          status: { type: 'string', enum: ['VERIFIED', 'REJECTED', 'PENDING'], example: 'VERIFIED' },
          notes: { type: 'string', example: 'Commercial driver credentials verified with Ethiopian Federal Transport Authority.' },
        },
      },
      Bid: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'bid_55a9c0' },
          loadId: { type: 'string', example: 'cld_8a9f7e1b' },
          proposedRateEtb: { type: 'number', example: 178000 },
          transitTimeHours: { type: 'integer', example: 20 },
          status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'], example: 'PENDING' },
          notes: { type: 'string', example: 'Direct transport with dedicated driver and live GPS tracking.' },
        },
      },
      CreateBidRequest: {
        type: 'object',
        required: ['loadId', 'proposedRateEtb', 'transitTimeHours'],
        properties: {
          loadId: { type: 'string', example: 'cld_8a9f7e1b' },
          proposedRateEtb: { type: 'number', example: 178000 },
          transitTimeHours: { type: 'integer', example: 20 },
          notes: { type: 'string', example: 'Modern Volvo semi-trailer with dual fuel tanks.' },
        },
      },
      RespondBidRequest: {
        type: 'object',
        required: ['bidId', 'action'],
        properties: {
          bidId: { type: 'string', example: 'bid_55a9c0' },
          action: { type: 'string', enum: ['ACCEPT', 'REJECT'], example: 'ACCEPT' },
        },
      },
      DispatchShipmentRequest: {
        type: 'object',
        required: ['loadId', 'vehicleId', 'driverId'],
        properties: {
          loadId: { type: 'string', example: 'cld_8a9f7e1b' },
          vehicleId: { type: 'string', example: 'veh_01a2b3c4' },
          driverId: { type: 'string', example: 'drv_9012abcd' },
          initialCorridorNote: { type: 'string', example: 'Dispatched from Mojo Dry Port towards Galafi.' },
        },
      },
      AIMatchRequest: {
        type: 'object',
        required: ['origin', 'destination', 'cargoType', 'weightTons'],
        properties: {
          origin: { type: 'string', example: 'Addis Ababa' },
          destination: { type: 'string', example: 'Djibouti Port' },
          cargoType: { type: 'string', example: 'Coffee Beans' },
          weightTons: { type: 'number', example: 28.0 },
          volumeM3: { type: 'number', example: 45.0 },
          targetBudgetEtb: { type: 'number', example: 185000 },
          specialHandling: { type: 'string', example: 'Standard Heavy Freight' },
        },
      },
      TelemetryIngestRequest: {
        type: 'object',
        required: ['shipmentId', 'lat', 'lng', 'speedKmh'],
        properties: {
          shipmentId: { type: 'string', example: 'shp_88fa12c0' },
          lat: { type: 'number', example: 9.6012 },
          lng: { type: 'number', example: 41.8510 },
          speedKmh: { type: 'number', example: 64.5 },
          fuelRemainingLiters: { type: 'number', example: 240 },
          batteryPct: { type: 'number', example: 92 },
          isOfflineBuffered: { type: 'boolean', example: false },
          recordedAt: { type: 'string', example: '2026-09-23T01:45:00.000Z' },
        },
      },
      SpotRateRequest: {
        type: 'object',
        properties: {
          originLat: { type: 'number', example: 8.9056 },
          originLng: { type: 'number', example: 38.7612 },
          destLat: { type: 'number', example: 11.5950 },
          destLng: { type: 'number', example: 43.1480 },
          weightTons: { type: 'number', example: 30.0 },
          cargoType: { type: 'string', example: 'GENERAL_CONTAINER' },
          dieselPricePerLiter: { type: 'number', example: 59.8 },
          corridorName: { type: 'string', example: 'Djibouti-Modjo-Addis Ababa' },
        },
      },
      RouteOptimizationRequest: {
        type: 'object',
        properties: {
          originLat: { type: 'number', example: 8.895 },
          originLng: { type: 'number', example: 38.765 },
          destLat: { type: 'number', example: 11.595 },
          destLng: { type: 'number', example: 43.148 },
          weightTons: { type: 'number', example: 30.0 },
          avoidHighRisk: { type: 'boolean', example: true },
          fuelPricePerLiter: { type: 'number', example: 59.8 },
        },
      },
      CustomsValidateRequest: {
        type: 'object',
        properties: {
          commercialInvoice: {
            type: 'object',
            properties: {
              docNumber: { type: 'string', example: 'INV-2026-0891' },
              declaredValueUsd: { type: 'number', example: 48500 },
              weightTons: { type: 'number', example: 28.5 },
            },
          },
          packingList: {
            type: 'object',
            properties: {
              docNumber: { type: 'string', example: 'PL-2026-0891' },
              weightTons: { type: 'number', example: 28.5 },
              packageCount: { type: 'integer', example: 600 },
            },
          },
          billOfLading: {
            type: 'object',
            properties: {
              docNumber: { type: 'string', example: 'BOL-DJIB-9921' },
              weightTons: { type: 'number', example: 28.5 },
            },
          },
          certificateOfOrigin: {
            type: 'object',
            properties: {
              docNumber: { type: 'string', example: 'COO-ET-2026-441' },
            },
          },
        },
      },
      PaymentInitiateRequest: {
        type: 'object',
        required: ['grossAmountEtb'],
        properties: {
          loadId: { type: 'string', example: 'cld_8a9f7e1b' },
          bidId: { type: 'string', example: 'bid_55a9c0' },
          shipmentId: { type: 'string', example: 'shp_88fa12c0' },
          grossAmountEtb: { type: 'number', example: 185000 },
          paymentMethod: { type: 'string', enum: ['TELEBIRR', 'CBE_BIRR', 'BANK_TRANSFER'], example: 'TELEBIRR' },
          telebirrPhone: { type: 'string', example: '+251911445566' },
        },
      },
      PaymentSettleRequest: {
        type: 'object',
        required: ['shipmentId'],
        properties: {
          shipmentId: { type: 'string', example: 'shp_88fa12c0' },
          releaseEscrowNotes: { type: 'string', example: 'Cargo verified and POD signed at Mojo Dry Port.' },
        },
      },
      ConsolidateRequest: {
        type: 'object',
        required: ['loadIds', 'containerType'],
        properties: {
          loadIds: {
            type: 'array',
            items: { type: 'string' },
            example: ['cld_8a9f7e1b', 'cld_99b1a4c2'],
          },
          containerType: { type: 'string', example: '40ft High Cube Container (68 CBM / 28.5T)' },
          consolidationHub: { type: 'string', example: 'Mojo Multi-Modal Dry Port Terminal' },
        },
      },
    },
  },
  paths: {
    // ==========================================
    // 1. SYSTEM HEALTH
    // ==========================================
    '/api/health': {
      get: {
        summary: 'System Health Check',
        description: 'Returns operational health, database connectivity, and corridor telematics status.',
        tags: ['System'],
        responses: {
          '200': {
            description: 'TradeFlow services are healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },

    // ==========================================
    // 2. AUTHENTICATION & IAM
    // ==========================================
    '/api/auth/register': {
      post: {
        summary: 'Register New Persona Account',
        description: 'Registers a new Shipper, Freight Forwarder, Transporter, Driver, or Customs Officer account with PostgreSQL persistence.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User successfully registered with session token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'Email already registered or validation error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'User Authentication',
        description: 'Authenticates with email and password, returning JWT and full user persona profile.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { description: 'Invalid email or password' },
        },
      },
    },
    '/api/auth/google': {
      post: {
        summary: 'Google OAuth 2.0 Sign-In',
        description: 'Validates Google ID token and issues TradeFlow JWT session for seamless authentication.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GoogleAuthRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Authenticated successfully with Google' },
        },
      },
    },
    '/api/auth/users': {
      get: {
        summary: 'List All Corridor Users',
        description: 'Admin endpoint to view all registered users across the corridor with role breakdowns.',
        tags: ['Authentication'],
        responses: {
          '200': {
            description: 'User list retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==========================================
    // 3. PORTAL & MARKETPLACE
    // ==========================================
    '/api/portal/stats': {
      get: {
        summary: 'Platform Operational Statistics',
        description: 'Retrieves corridor load counts, active shipments, verification queues, and system health status.',
        tags: ['Portal & Marketplace'],
        responses: {
          '200': {
            description: 'Portal statistics retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PortalStats' },
              },
            },
          },
        },
      },
    },
    '/api/portal/loads': {
      get: {
        summary: 'List Freight Consignment Loads',
        description: 'Queries freight loads with optional corridor filtering (origin, destination, cargo type, weight range).',
        tags: ['Portal & Marketplace'],
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Keyword search for title or cargo' },
          { in: 'query', name: 'origin', schema: { type: 'string' }, description: 'Origin city or logistics hub' },
          { in: 'query', name: 'destination', schema: { type: 'string' }, description: 'Destination port or dry port' },
          { in: 'query', name: 'cargoType', schema: { type: 'string' }, description: 'Cargo classification filter' },
          { in: 'query', name: 'minWeightTons', schema: { type: 'number' }, description: 'Minimum payload weight' },
          { in: 'query', name: 'maxWeightTons', schema: { type: 'number' }, description: 'Maximum payload weight' },
        ],
        responses: {
          '200': {
            description: 'Loads matching criteria',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    loads: { type: 'array', items: { $ref: '#/components/schemas/Load' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Publish Freight Load',
        description: 'Publishes a new cargo consignment to the TradeFlow Freight Exchange.',
        tags: ['Portal & Marketplace'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateLoadRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Load published successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    load: { $ref: '#/components/schemas/Load' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/portal/loads/{id}': {
      delete: {
        summary: 'Cancel / Delete Consignment Load',
        description: 'Removes or cancels a published load with cascading safety checks.',
        tags: ['Portal & Marketplace'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Load ID' },
        ],
        responses: {
          '200': { description: 'Load successfully deleted' },
          '404': { description: 'Load not found' },
        },
      },
    },
    '/api/portal/verifications': {
      get: {
        summary: 'Admin Verification Queue',
        description: 'Fetches pending identity and commercial qualification dossiers for Transporters, Drivers, and Shippers.',
        tags: ['Portal & Marketplace'],
        responses: {
          '200': {
            description: 'Pending verification queue',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    verifications: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/portal/verify-user': {
      post: {
        summary: 'Approve or Reject User Verification Dossier',
        description: 'Admin action to approve credentials, verify TIN/commercial driver license, or reject with notes.',
        tags: ['Portal & Marketplace'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VerificationActionRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'User verification status updated and audit logged' },
        },
      },
    },
    '/api/portal/user-status': {
      get: {
        summary: 'Check Current User Verification Status',
        description: 'Returns real-time verification and role status for the logged-in user or by user ID/email.',
        tags: ['Portal & Marketplace'],
        parameters: [
          { in: 'query', name: 'userId', schema: { type: 'string' }, description: 'Optional User ID' },
          { in: 'query', name: 'email', schema: { type: 'string' }, description: 'Optional User Email' },
        ],
        responses: {
          '200': { description: 'User verification status details' },
        },
      },
    },
    '/api/portal/audit-logs': {
      get: {
        summary: 'System Audit Logs',
        description: 'Returns tamper-evident audit records of administrative, regulatory, and financial actions.',
        tags: ['Portal & Marketplace'],
        responses: {
          '200': { description: 'List of audit events' },
        },
      },
    },
    '/api/portal/vehicles': {
      get: {
        summary: 'List Fleet Vehicles',
        description: 'Retrieves all registered trucks, semi-trailers, and telematics GPS hardware units.',
        tags: ['Portal & Marketplace'],
        responses: {
          '200': {
            description: 'Fleet vehicle list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    vehicles: { type: 'array', items: { $ref: '#/components/schemas/Vehicle' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Register New Fleet Vehicle',
        description: 'Adds a commercial freight vehicle with plate number, capacity, and GPS unit mapping.',
        tags: ['Portal & Marketplace'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateVehicleRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Vehicle registered successfully' },
        },
      },
    },
    '/api/portal/drivers': {
      get: {
        summary: 'List Registered Fleet Drivers',
        description: 'Fetches drivers with license details, assigned trucks, and verification badges.',
        tags: ['Portal & Marketplace'],
        responses: {
          '200': {
            description: 'Driver fleet roster',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    drivers: { type: 'array', items: { $ref: '#/components/schemas/Driver' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Register New Transporter Driver',
        description: 'Onboards a driver under the transporter fleet; sets verification status to PENDING and notifies Admin.',
        tags: ['Portal & Marketplace'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateDriverRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Driver created and queued for Admin verification' },
        },
      },
    },
    '/api/portal/bids': {
      get: {
        summary: 'List Marketplace Bids',
        description: 'Retrieves active and historical freight bids filtered by load or transporter.',
        tags: ['Portal & Marketplace'],
        parameters: [
          { in: 'query', name: 'loadId', schema: { type: 'string' }, description: 'Filter bids for a specific load' },
          { in: 'query', name: 'transporterId', schema: { type: 'string' }, description: 'Filter bids by transporter' },
        ],
        responses: {
          '200': { description: 'List of bids' },
        },
      },
      post: {
        summary: 'Submit Transporter Bid',
        description: 'Transporter submits a competitive price bid (ETB) and transit time commitment for a load.',
        tags: ['Portal & Marketplace'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateBidRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Bid submitted' },
        },
      },
    },
    '/api/portal/bids/respond': {
      post: {
        summary: 'Accept or Reject Transporter Bid',
        description: 'Shipper or Forwarder accepts a bid, automatically transitioning the load to matched status and initiating escrow.',
        tags: ['Portal & Marketplace'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RespondBidRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Bid action executed successfully' },
        },
      },
    },
    '/api/portal/bids/{id}': {
      delete: {
        summary: 'Withdraw / Delete Bid',
        description: 'Cancels a pending bid before acceptance.',
        tags: ['Portal & Marketplace'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Bid ID' },
        ],
        responses: {
          '200': { description: 'Bid withdrawn' },
        },
      },
    },
    '/api/portal/dispatch': {
      post: {
        summary: 'Dispatch Shipment on Corridor',
        description: 'Assigns verified vehicle and driver to an accepted load and initiates telematics tracking.',
        tags: ['Portal & Marketplace'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DispatchShipmentRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Shipment dispatched' },
        },
      },
    },
    '/api/portal/driver/active-trip': {
      get: {
        summary: 'Get Driver Active Corridor Trip',
        description: 'Fetches active dispatch order, origin/destination coordinates, and load consignment details for driver mobile app.',
        tags: ['Portal & Marketplace'],
        parameters: [
          { in: 'query', name: 'driverId', schema: { type: 'string' }, description: 'Driver user ID' },
        ],
        responses: {
          '200': { description: 'Active trip details' },
        },
      },
    },
    '/api/portal/driver/start-trip': {
      post: {
        summary: 'Start Driver Journey',
        description: 'Driver marks trip started; status updates to IN_TRANSIT and telemetry stream activates.',
        tags: ['Portal & Marketplace'],
        responses: {
          '200': { description: 'Trip started' },
        },
      },
    },
    '/api/portal/driver/toggle-driving': {
      post: {
        summary: 'Toggle Driver Status (Driving vs Resting)',
        description: 'Records driver rest stops, weighbridge delays, or resumption of transit.',
        tags: ['Portal & Marketplace'],
        responses: {
          '200': { description: 'Driving status toggled' },
        },
      },
    },
    '/api/portal/driver/arrive-destination': {
      post: {
        summary: 'Record Destination Arrival & Proof of Delivery (POD)',
        description: 'Completes trip, saves delivery timestamp, and submits digital POD signature for escrow settlement.',
        tags: ['Portal & Marketplace'],
        responses: {
          '200': { description: 'Trip delivered and POD recorded' },
        },
      },
    },
    '/api/portal/provision-customs': {
      post: {
        summary: 'Provision Institutional Customs Officer Account',
        description: 'Admin endpoint to provision official Customs Officer credentials for border inspection stations.',
        tags: ['Portal & Marketplace'],
        responses: {
          '201': { description: 'Customs officer provisioned' },
        },
      },
    },
    '/api/portal/ratings': {
      get: {
        summary: 'Get User Reputation & Ratings',
        description: 'Fetches feedback reviews, star scores (1-5), and delivery compliance records.',
        tags: ['Portal & Marketplace'],
        responses: {
          '200': { description: 'List of ratings' },
        },
      },
      post: {
        summary: 'Submit Performance Rating',
        description: 'Submits a 5-star rating with commentary upon shipment completion.',
        tags: ['Portal & Marketplace'],
        responses: {
          '201': { description: 'Rating recorded' },
        },
      },
    },

    // ==========================================
    // 4. AI FREIGHT MATCHING ENGINE
    // ==========================================
    '/api/matching/find-matches': {
      post: {
        summary: 'Calculate AI Weighted Utility Matches',
        description: 'Executes the multi-criteria utility matching formula (SRS 4.2.2) ranking carriers by Cost (35%), Reliability (30%), Proximity (20%), and Fuel Efficiency (15%) within a sub-second SLA.',
        tags: ['AI Freight Matching'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AIMatchRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Ranked list of eligible carriers with individual utility scores',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sla: { type: 'object' },
                    loadParameters: { type: 'object' },
                    topMatches: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/matching/post-load': {
      post: {
        summary: 'Post Load with Booking Option (Option A vs Option B)',
        description: 'SRS 4.2.1 / 4.2.3: Supports Option A (Instant Match & Book) or Option B (Post to Open Marketplace for Competitive Bidding).',
        tags: ['AI Freight Matching'],
        responses: {
          '201': { description: 'Load posted with selected booking workflow' },
        },
      },
    },
    '/api/matching/submit-bid': {
      post: {
        summary: 'Submit Transporter Bid to RFQ',
        description: 'Transporters submit competitive bids specifying ETB rate, transit time commitment, and driver assignment.',
        tags: ['AI Freight Matching'],
        responses: {
          '201': { description: 'Bid submitted to matching pool' },
        },
      },
    },

    // ==========================================
    // 5. TELEMATICS & LIVE TRACKING
    // ==========================================
    '/api/tracking/telemetry': {
      post: {
        summary: 'Ingest Real-Time / Offline Batch GPS Telemetry',
        description: 'Receives high-frequency GPS ping or offline-buffered queue, evaluating geofences, speed, and fuel consumption.',
        tags: ['Telematics & Live Tracking'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TelemetryIngestRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Telemetry ingested and geofence events emitted' },
        },
      },
    },
    '/api/tracking/live': {
      get: {
        summary: 'Live Tracking Feed for Active Shipments',
        description: 'Retrieves current GPS coordinates, progress percentage along corridor, dynamic ETA, and milestone status.',
        tags: ['Telematics & Live Tracking'],
        responses: {
          '200': { description: 'Corridor tracking data' },
        },
      },
    },
    '/api/tracking/live/{shipmentId}': {
      get: {
        summary: 'Live Tracking for Specific Shipment',
        description: 'Returns real-time telematics, route polyline coordinates, speed, and geofence checkpoints for a single shipment.',
        tags: ['Telematics & Live Tracking'],
        parameters: [
          { in: 'path', name: 'shipmentId', required: true, schema: { type: 'string' }, description: 'Shipment UUID' },
        ],
        responses: {
          '200': { description: 'Shipment telematics status' },
          '404': { description: 'Shipment not found' },
        },
      },
    },
    '/api/tracking/corridor': {
      get: {
        summary: 'Get Ethiopia-Djibouti Corridor Metadata',
        description: 'Fetches geofence waypoints, fuel station diesel availability, customs border checkpoints, and road conditions.',
        tags: ['Telematics & Live Tracking'],
        responses: {
          '200': { description: 'Corridor waypoints and metadata' },
        },
      },
    },

    // ==========================================
    // 6. DYNAMIC PRICING ENGINE
    // ==========================================
    '/api/pricing/spot-rate': {
      post: {
        summary: 'Calculate Corridor Dynamic Spot Rate',
        description: 'Computes itemized pricing breakdown based on distance, cargo weight, national fuel index, and corridor demand ratio.',
        tags: ['Dynamic Pricing'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SpotRateRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Itemized spot rate calculation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    baseFreightEtb: { type: 'number' },
                    fuelSurchargeEtb: { type: 'number' },
                    demandAdjustmentEtb: { type: 'number' },
                    checkpointSurchargeEtb: { type: 'number' },
                    totalCalculatedSpotRateEtb: { type: 'number' },
                    ratePerTonKm: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/pricing/contract-rate/check': {
      post: {
        summary: 'Contract Rate Divergence Monitor (>20%)',
        description: 'Compares active contract tariffs against spot market conditions, triggering automated renegotiation alerts when variance exceeds 20%.',
        tags: ['Dynamic Pricing'],
        responses: {
          '200': { description: 'Divergence analysis result' },
        },
      },
    },
    '/api/pricing/audit-logs': {
      get: {
        summary: 'Get Pricing Calculation Audit Trail',
        description: 'Audit log of historical spot rate evaluations and price adjustments.',
        tags: ['Dynamic Pricing'],
        responses: {
          '200': { description: 'Pricing audit logs' },
        },
      },
    },

    // ==========================================
    // 7. CORRIDOR OPTIMIZATION & HAZARDS
    // ==========================================
    '/api/optimization/routes': {
      post: {
        summary: 'Recommend Optimized Corridor Routes',
        description: 'Evaluates Primary Highway A-1 vs Southern Bypass via Dewele Border using distance, travel time, fuel cost, and safety ratings.',
        tags: ['Corridor Optimization'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RouteOptimizationRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Ranked route recommendations' },
        },
      },
    },
    '/api/optimization/incident': {
      post: {
        summary: 'Report Corridor Incident or Road Hazard',
        description: 'Driver or operator reports road blockages, customs congestion, or vehicle breakdown with GPS location.',
        tags: ['Corridor Optimization'],
        responses: {
          '201': { description: 'Incident logged and broadcast to active drivers' },
        },
      },
    },
    '/api/optimization/incidents': {
      get: {
        summary: 'List Active Corridor Incidents',
        description: 'Retrieves active traffic hazards, weather warnings, and customs checkpoint delays.',
        tags: ['Corridor Optimization'],
        responses: {
          '200': { description: 'Active incidents along corridor' },
        },
      },
    },

    // ==========================================
    // 8. CUSTOMS CLEARANCE & REGULATORY
    // ==========================================
    '/api/customs/validate': {
      post: {
        summary: 'Automated Pre-Submission Document Consistency Validator',
        description: 'Cross-checks declared weights across Commercial Invoice, Packing List, and Bill of Lading (B/L) to prevent border delays.',
        tags: ['Customs Clearance'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomsValidateRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Validation results with warnings or errors' },
        },
      },
    },
    '/api/customs/documents': {
      get: {
        summary: 'List Customs Documents',
        description: 'Retrieves all regulatory cargo documents filed for corridor transit.',
        tags: ['Customs Clearance'],
        responses: {
          '200': { description: 'Customs documents' },
        },
      },
      post: {
        summary: 'Upload Customs Document',
        description: 'Submits an official clearance document (Commercial Invoice, B/L, Packing List, Transit Permit).',
        tags: ['Customs Clearance'],
        responses: {
          '201': { description: 'Document uploaded and attached to shipment dossier' },
        },
      },
    },
    '/api/customs/queue': {
      get: {
        summary: 'Customs Officer Inspection Queue',
        description: 'Grouped dossiers awaiting Single-Window regulatory review and border clearance stamps.',
        tags: ['Customs Clearance'],
        responses: {
          '200': { description: 'Inspection queue dossiers' },
        },
      },
    },
    '/api/customs/shipments/{shipmentId}/clearance': {
      patch: {
        summary: 'Update Shipment Customs Clearance Status',
        description: 'Customs Officer approves, rejects, or requests revision for a shipment dossier at Galafi or Mojo.',
        tags: ['Customs Clearance'],
        parameters: [
          { in: 'path', name: 'shipmentId', required: true, schema: { type: 'string' }, description: 'Shipment UUID' },
        ],
        responses: {
          '200': { description: 'Customs clearance status updated' },
        },
      },
    },
    '/api/customs/documents/{id}/status': {
      patch: {
        summary: 'Update Individual Document Verification Status',
        description: 'Approve or reject a specific document within the regulatory dossier.',
        tags: ['Customs Clearance'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Document ID' },
        ],
        responses: {
          '200': { description: 'Document status updated' },
        },
      },
    },
    '/api/customs/ledger': {
      get: {
        summary: 'Customs Clearance Ledger & Digital Certificates',
        description: 'Returns historical cleared shipments with export/import clearance certificates.',
        tags: ['Customs Clearance'],
        responses: {
          '200': { description: 'Customs clearance ledger' },
        },
      },
    },

    // ==========================================
    // 9. PAYMENTS & ESCROW
    // ==========================================
    '/api/payments/initiate': {
      post: {
        summary: 'Initiate TeleBirr / CBE Birr Escrow Payment',
        description: 'Locks freight funds into platform escrow upon contract award with 5.0% platform commission calculation.',
        tags: ['Payments & Escrow'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaymentInitiateRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Payment transaction created and escrow locked' },
        },
      },
    },
    '/api/payments/settle': {
      post: {
        summary: 'Automated Settlement & Escrow Release',
        description: 'Releases held escrow funds to transporter mobile wallet upon verified delivery and POD signature.',
        tags: ['Payments & Escrow'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaymentSettleRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Escrow released and transporter credited' },
        },
      },
    },
    '/api/payments/dispute': {
      post: {
        summary: 'File Cargo / Payment Dispute Ticket',
        description: 'Shipper or transporter files a claim for cargo damage, late delivery, or demurrage.',
        tags: ['Payments & Escrow'],
        responses: {
          '201': { description: 'Dispute ticket filed and escrow payment locked' },
        },
      },
    },
    '/api/payments/disputes': {
      get: {
        summary: 'List All Mediation Dispute Cases',
        description: 'Returns active dispute tickets for administrative arbitration.',
        tags: ['Payments & Escrow'],
        responses: {
          '200': { description: 'List of disputes' },
        },
      },
    },
    '/api/payments/disputes/{paymentId}/arbitrate': {
      post: {
        summary: 'Arbitrate Dispute & Execute Escrow Verdict',
        description: 'Admin resolves dispute, executing refund to shipper or payout to transporter with legal rationale.',
        tags: ['Payments & Escrow'],
        parameters: [
          { in: 'path', name: 'paymentId', required: true, schema: { type: 'string' }, description: 'Payment Transaction ID' },
        ],
        responses: {
          '200': { description: 'Arbitration verdict executed' },
        },
      },
    },
    '/api/payments/ledger': {
      get: {
        summary: 'Financial Transaction Ledger',
        description: 'Complete accounting log of escrow deposits, settlements, commissions, and dispute adjustments.',
        tags: ['Payments & Escrow'],
        responses: {
          '200': { description: 'Financial ledger' },
        },
      },
    },

    // ==========================================
    // 10. FREIGHT FORWARDER & CONSOLIDATION
    // ==========================================
    '/api/forwarder/clients': {
      get: {
        summary: 'Multi-Shipper Client Portfolio',
        description: 'Forwarder overview of managed shippers, aggregate tonnage, and active consignments.',
        tags: ['Freight Forwarder'],
        responses: {
          '200': { description: 'Shipper portfolio summary' },
        },
      },
    },
    '/api/forwarder/ltl-loads': {
      get: {
        summary: 'Less-than-Truckload (LTL) Cargo Queue',
        description: 'Retrieves partial container loads eligible for physical consolidation into full container loads.',
        tags: ['Freight Forwarder'],
        responses: {
          '200': { description: 'LTL cargo queue' },
        },
      },
    },
    '/api/forwarder/consolidate': {
      post: {
        summary: 'Consolidate LTL Loads into Container',
        description: 'Merges multiple LTL consignments into a single 40ft High Cube container shipment for corridor transit.',
        tags: ['Freight Forwarder'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ConsolidateRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Consolidation successful' },
        },
      },
    },
    '/api/forwarder/multimodal': {
      get: {
        summary: 'Multi-Modal Corridor Progress Tracking',
        description: 'Tracks cargo across road freight, dry port rail transfer (Ethio-Djibouti Railway), and maritime port handling.',
        tags: ['Freight Forwarder'],
        responses: {
          '200': { description: 'Multimodal tracking milestones' },
        },
      },
    },

    // ==========================================
    // 11. FLEET ANALYTICS & BENCHMARKING
    // ==========================================
    '/api/analytics/fuel': {
      get: {
        summary: 'Fleet Fuel Efficiency Analytics',
        description: 'Corridor fuel consumption benchmarking (km/L), monthly trends, and driver eco-ratings.',
        tags: ['Analytics & KPIs'],
        responses: {
          '200': { description: 'Fuel efficiency analytics' },
        },
      },
    },
    '/api/analytics/fuel/{transporterId}': {
      get: {
        summary: 'Transporter-Specific Fuel Consumption',
        description: 'Fuel analytics for a specific transporter fleet.',
        tags: ['Analytics & KPIs'],
        parameters: [
          { in: 'path', name: 'transporterId', required: true, schema: { type: 'string' }, description: 'Transporter User ID' },
        ],
        responses: {
          '200': { description: 'Transporter fuel metrics' },
        },
      },
    },
    '/api/analytics/transporter': {
      get: {
        summary: 'Transporter Performance KPIs & Corridor Ranking',
        description: 'On-time delivery percentages, safety metrics, and trip volume rankings across all transporters.',
        tags: ['Analytics & KPIs'],
        responses: {
          '200': { description: 'Corridor transporter benchmarking' },
        },
      },
    },
    '/api/analytics/transporter/{transporterId}': {
      get: {
        summary: 'Detailed Transporter KPI Scorecard',
        description: 'Individual scorecard with on-time rate, active fleet utilization, and customer rating breakdown.',
        tags: ['Analytics & KPIs'],
        parameters: [
          { in: 'path', name: 'transporterId', required: true, schema: { type: 'string' }, description: 'Transporter User ID' },
        ],
        responses: {
          '200': { description: 'Transporter scorecard' },
        },
      },
    },
  },
};

/**
 * Returns interactive Swagger UI HTML page with Try-It-Out functionality
 */
export const renderSwaggerUiHtml = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TradeFlow API Documentation — Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" >
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" sizes="32x32" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #0B132B;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 28px;
      background: #1C2541;
      border-bottom: 2px solid #3B82F6;
    }
    .topbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 800;
      color: #FFFFFF;
      text-decoration: none;
    }
    .topbar-badge {
      background: #0284C7;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .topbar-links {
      display: flex;
      gap: 16px;
    }
    .topbar-link {
      color: #94A3B8;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      transition: color 0.2s;
    }
    .topbar-link:hover {
      color: #38BDF8;
    }
    /* Swagger UI Overrides for Clean Aesthetics */
    .swagger-ui .info .title {
      color: #0F172A !important;
    }
    .swagger-ui {
      background: #FFFFFF;
      border-radius: 12px;
      max-width: 1380px;
      margin: 24px auto;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div class="topbar">
    <a href="/api/docs" class="topbar-brand">
      🚛 TradeFlow API Docs
      <span class="topbar-badge">OpenAPI 3.0</span>
    </a>
    <div class="topbar-links">
      <a href="/api/health" target="_blank" class="topbar-link">🏥 Health Check</a>
      <a href="/api/docs/json" target="_blank" class="topbar-link">📄 OpenAPI JSON</a>
      <a href="http://localhost:3000" target="_blank" class="topbar-link">🌐 Web Portal</a>
    </div>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"> </script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"> </script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(openApiSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true
      });
      window.ui = ui;
    };
  </script>
</body>
</html>
`;

export const swaggerDocsHandler = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(renderSwaggerUiHtml());
};

export const swaggerJsonHandler = (req: Request, res: Response) => {
  res.json(openApiSpec);
};
