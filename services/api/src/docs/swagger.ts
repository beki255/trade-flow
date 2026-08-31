import { Request, Response } from 'express';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'TradeFlow API — Intelligent Logistics & Freight Matching',
    version: '1.0.0',
    description: `
**TradeFlow Backend REST & Realtime Telematics API**
Designed for the Ethiopia-Djibouti Trade Corridor (Lake Abbe ➔ Mojo Dry Port ➔ Addis Ababa).

### Features:
- 🔐 **Multi-Persona Authentication**: Shipper, Freight Forwarder, Customs Officer, Transporter, Driver, Admin.
- 🌐 **Google OAuth 2.0 & JWT Security**.
- 📍 **Offline-First Telematics & Checkpoints**: Live GPS & checkpoint logs.
- 📦 **Freight Marketplace**: Load postings, digital RFQ bids, and cargo tracking.
- 🇪🇹 **National Digital Payments**: Telebirr & CBE Birr ready.
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
          email: { type: 'string', example: 'dawit@mojofreight.et' },
          name: { type: 'string', example: 'Dawit Tadesse' },
          role: {
            type: 'string',
            enum: ['SHIPPER', 'FREIGHT_FORWARDER', 'CUSTOMS_OFFICER', 'TRANSPORTER', 'DRIVER', 'ADMIN'],
            example: 'FREIGHT_FORWARDER',
          },
          companyName: { type: 'string', example: 'Mojo Freight PLC' },
          tinNumber: { type: 'string', example: '0049281745' },
          phoneNumber: { type: 'string', example: '+251911223344' },
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
          email: { type: 'string', example: 'dawit@mojofreight.et' },
          password: { type: 'string', example: 'Password123!' },
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
          timestamp: { type: 'string', example: '2026-08-30T04:30:00.000Z' },
          corridor: { type: 'string', example: 'Djibouti-Modjo-Addis Ababa' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'System Health Check',
        description: 'Returns the operational health and corridor connection status of TradeFlow API.',
        tags: ['System'],
        responses: {
          '200': {
            description: 'System is healthy and connected',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a New Account',
        description: 'Creates a new user profile with chosen role (Shipper, Forwarder, Customs, Transporter, Driver) and persists into PostgreSQL.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User successfully created and authenticated',
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
          '400': {
            description: 'Validation error or email already registered',
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'User Login',
        description: 'Authenticates registered users with email and password, returning JWT token and full profile.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
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
          '401': {
            description: 'Invalid credentials or user not found in database',
          },
        },
      },
    },
    '/api/auth/google': {
      post: {
        summary: 'Google OAuth 2.0 Sign-In',
        description: 'Verifies Google token, upserts user in PostgreSQL, and generates TradeFlow JWT session.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/GoogleAuthRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Google Authentication Successful',
          },
        },
      },
    },
    '/api/auth/users': {
      get: {
        summary: 'List All Registered Users',
        description: 'Retrieves all users across the corridor for Admin management and directory verification.',
        tags: ['Authentication'],
        responses: {
          '200': {
            description: 'List of registered users',
          },
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
    /* Swagger UI Overrides for Dark/Clean Aesthetics */
    .swagger-ui .info .title {
      color: #0F172A !important;
    }
    .swagger-ui {
      background: #FFFFFF;
      border-radius: 12px;
      max-width: 1280px;
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
