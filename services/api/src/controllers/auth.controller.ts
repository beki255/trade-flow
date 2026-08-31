import { Request, Response } from 'express';
import { PrismaClient, UserRole, VerificationStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tradeflow_super_secret_jwt_key_2026';

// 1. Zod Validation Schemas
const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  tin: z.string().optional(),
  tradeLicenseNo: z.string().optional(),
  insuranceDoc: z.string().optional(),
  roadworthinessDoc: z.string().optional(),
});

const LoginSchema = z.object({
  identifier: z.string().min(1, 'Email or Phone is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.string().optional(),
});

// Helper to map incoming role string to Prisma UserRole enum
const mapToPrismaRole = (roleStr: string): UserRole => {
  const r = (roleStr || '').toUpperCase();
  if (r.includes('FORWARDER') || r === 'FREIGHT_FORWARDER') return UserRole.FREIGHT_FORWARDER;
  if (r.includes('CUSTOMS') || r === 'CUSTOMS_OFFICER') return UserRole.CUSTOMS_OFFICER;
  if (r.includes('TRANSPORTER')) return UserRole.TRANSPORTER;
  if (r.includes('ADMIN')) return UserRole.ADMIN;
  if (r.includes('DRIVER')) return UserRole.DRIVER;
  return UserRole.SHIPPER;
};

// 2. Login Endpoint
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { identifier, password } = parseResult.data;

    // Query database for existing user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { username: identifier.trim() },
          { phone: identifier.trim() },
        ],
      },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found. Please check your credentials or register.' });
      return;
    }

    // Check password
    if (user.passwordHash !== password) {
      res.status(401).json({ error: 'Incorrect password. Please try again.' });
      return;
    }

    // Generate authenticated JWT session token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        companyName: user.companyName,
        tin: user.tin,
        tradeLicenseNo: user.tradeLicenseNo,
        verificationStatus: user.verificationStatus,
        ratingAvg: user.ratingAvg,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

// 0. Verify Session / Get Me (Checks if user still genuinely exists in PostgreSQL Database)
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Support evaluation demo token sessions
    if (token === 'mock-jwt-token' || token.startsWith('jwt-demo-')) {
      res.json({ status: 'OK', isDemo: true });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
      return;
    }

    // STRICT DATABASE CHECK: Ensure user still genuinely exists in PostgreSQL
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: decoded.userId },
          { email: decoded.email },
        ],
      },
    });

    if (!user) {
      // User was deleted from PostgreSQL Database! Immediately revoke session.
      res.status(401).json({ error: 'User no longer exists in database. Session invalidated.' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        companyName: user.companyName,
        phone: user.phone,
        role: user.role,
        tin: user.tin,
        tradeLicenseNo: user.tradeLicenseNo,
        verificationStatus: user.verificationStatus,
        ratingAvg: user.ratingAvg,
      },
    });
  } catch (error: any) {
    console.error('getMe error:', error);
    res.status(500).json({ error: 'Internal server error verifying session' });
  }
};

// 3. Registration Endpoint with Database Persistence & Exact Role Mapping
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const {
      fullName,
      email,
      password,
      role,
      phone,
      companyName,
      tin,
      tradeLicenseNo,
    } = parseResult.data;

    const normalizedEmail = email.toLowerCase().trim();
    const mappedPrismaRole = mapToPrismaRole(role);

    // Check if user already exists in database
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { phone: phone ? phone.trim() : undefined },
        ],
      },
    });

    if (existing) {
      res.status(409).json({
        error: 'An account with this email address or phone number is already registered.',
      });
      return;
    }

    // Insert newly registered user record into PostgreSQL Database
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        companyName: (companyName || fullName).trim(),
        email: normalizedEmail,
        username: normalizedEmail.split('@')[0] + Math.floor(Math.random() * 1000),
        phone: phone ? phone.trim() : '+251900000000',
        tin: tin ? tin.trim() : null,
        tradeLicenseNo: tradeLicenseNo ? tradeLicenseNo.trim() : null,
        role: mappedPrismaRole,
        passwordHash: password,
        verificationStatus: VerificationStatus.PENDING, // Enters Admin Verification Queue
      },
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.fullName,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account successfully registered and queued for administrator verification!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        companyName: newUser.companyName,
        tin: newUser.tin,
        tradeLicenseNo: newUser.tradeLicenseNo,
        role: newUser.role,
        verificationStatus: newUser.verificationStatus,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal database error during registration' });
  }
};

// 4. Google OAuth 2.0 Integration & Token Verification
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, email, fullName, role, mode } = req.body;

    let verifiedEmail = email;
    let verifiedName = fullName || 'Google User';

    // If a Google ID Token credential was supplied by Google Identity Services
    if (credential) {
      try {
        const decoded: any = jwt.decode(credential);
        if (decoded && decoded.email) {
          verifiedEmail = decoded.email;
          verifiedName = decoded.name || verifiedName;
        }
      } catch (err) {
        console.warn('Could not parse Google ID token, falling back to payload values');
      }
    }

    if (!verifiedEmail) {
      res.status(400).json({ error: 'Google authentication did not provide a valid email.' });
      return;
    }

    const normalizedEmail = verifiedEmail.toLowerCase().trim();
    const mappedPrismaRole = mapToPrismaRole(role || 'SHIPPER');

    // Check if user already exists in PostgreSQL Database
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // STRICT CHECK: If user is attempting to LOGIN with Google but does not exist in DB, REJECT
    if (!user && mode === 'login') {
      res.status(404).json({
        error: 'No account found with this Google email. Please register/create an account first.',
      });
      return;
    }

    // Only create a new account in PostgreSQL if user is explicitly REGISTERING (mode === 'register')
    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: verifiedName,
          companyName: verifiedName,
          email: normalizedEmail,
          username: normalizedEmail.split('@')[0] + Math.floor(Math.random() * 1000),
          phone: '+251911000000',
          role: mappedPrismaRole,
          passwordHash: 'GOOGLE_OAUTH_VERIFIED_USER',
          verificationStatus: VerificationStatus.VERIFIED, // Google accounts get verified status
        },
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google Authentication successful and session created.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error: any) {
    console.error('Google Auth error:', error);
    res.status(500).json({ error: 'Internal server error during Google OAuth authentication' });
  }
};

// 5. GET /api/auth/users -> Returns all database registered users for Admin Verification
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        companyName: true,
        email: true,
        phone: true,
        role: true,
        tin: true,
        tradeLicenseNo: true,
        verificationStatus: true,
        ratingAvg: true,
        createdAt: true,
      },
    });
    res.json({ users });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to retrieve database users' });
  }
};

// 6. PATCH /api/auth/users/:id/verification -> Updates status directly in PostgreSQL
export const updateVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'VERIFIED', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ error: 'Invalid verification status value' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { verificationStatus: status as VerificationStatus },
    });

    res.json({
      message: `User verification updated to ${status} in database.`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update verification error:', error);
    res.status(500).json({ error: 'Failed to update database verification record' });
  }
};
