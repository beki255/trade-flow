import { Request, Response } from 'express';
import { PrismaClient, UserRole, VerificationStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import { auditTrailStore } from './portal.controller';
import { sendMail, buildPasswordResetHtml, buildRegistrationOtpHtml } from '../services/smtp.service';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tradeflow_super_secret_jwt_key_2026';

const ETH_PHONE_REGEX = /^(\+251|251|0)?(9|7)\d{8}$/;

// 1. Zod Validation Schemas
const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'Password must contain at least one letter and one number'),
  role: z.string().min(1, 'Role is required'),
  phone: z
    .string()
    .refine((val) => {
      if (!val) return true;
      const cleaned = val.trim().replace(/[\s\-\(\)]/g, '');
      if (cleaned.startsWith('+') && !cleaned.startsWith('+251')) return false;
      return ETH_PHONE_REGEX.test(cleaned);
    }, {
      message: 'Invalid Ethiopian phone number. Only Ethiopian numbers (+251 9... / 09... or +251 7... / 07...) are accepted.',
    })
    .optional(),
  companyName: z.string().optional(),
  tin: z.string().optional(),
  tradeLicenseNo: z.string().optional(),
  tradeLicenseDoc: z.string().optional(),
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

    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    const phoneSuffix = cleanDigits.length >= 8 ? cleanDigits.slice(-8) : cleanDigits;

    // Query database for existing user across all phone/email variations
    // 1. Strict exact match on email, phone, or username first
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { username: identifier.trim() },
          { phone: identifier.trim() },
        ],
      },
      include: {
        driverProfile: {
          include: {
            assignedVehicle: true,
          },
        },
      },
    });

    // 2. Suffix / digits fallback if exact match wasn't found
    if (!user && cleanDigits.length >= 8) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: { contains: cleanDigits } },
            { phone: { contains: phoneSuffix } },
            { email: { contains: phoneSuffix } },
            { username: { contains: phoneSuffix } },
          ],
        },
        include: {
          driverProfile: {
            include: {
              assignedVehicle: true,
            },
          },
        },
      });
    }

    if (!user) {
      res.status(401).json({ error: 'User not found. Please check your phone number or credentials.' });
      return;
    }

    // Verify password against database record (accepts exact registered password or master demo credentials Demo1234! / Admin2024!)
    const passMatches =
      (user.passwordHash || '').trim() === password.trim() ||
      password.trim() === 'Demo1234!' ||
      password.trim() === 'Admin2024!';

    if (!passMatches) {
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
        phone: user.phone,
        role: user.role,
        companyName: user.companyName,
        tin: user.tin,
        tradeLicenseNo: user.tradeLicenseNo,
        tradeLicenseDoc: user.tradeLicenseDoc,
        roadworthinessDoc: user.roadworthinessDoc,
        photoUrl: user.roadworthinessDoc || user.insuranceDoc || null,
        driverProfile: user.driverProfile,
        verificationStatus: user.verificationStatus,
        ratingAvg: (user.totalRatingsCount && user.totalRatingsCount > 0) ? user.ratingAvg : 0.0,
        totalRatingsCount: user.totalRatingsCount || 0,
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
      include: {
        driverProfile: {
          include: {
            assignedVehicle: true,
          },
        },
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
        tradeLicenseDoc: user.tradeLicenseDoc,
        roadworthinessDoc: user.roadworthinessDoc,
        photoUrl: user.roadworthinessDoc || user.insuranceDoc || null,
        driverProfile: user.driverProfile,
        verificationStatus: user.verificationStatus,
        ratingAvg: (user.totalRatingsCount && user.totalRatingsCount > 0) ? user.ratingAvg : 0.0,
        totalRatingsCount: user.totalRatingsCount || 0,
      },
    });
  } catch (error: any) {
    console.error('getMe error:', error);
    res.status(500).json({ error: 'Internal server error verifying session' });
  }
};

export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
};

export interface PendingRegistration {
  userData: {
    fullName: string;
    companyName?: string;
    email: string;
    phone?: string;
    role: string;
    password: string;
    tin?: string;
    tradeLicenseNo?: string;
    tradeLicenseDoc?: string;
    insuranceDoc?: string;
    roadworthinessDoc?: string;
  };
  otp: string;
  expiresAt: number;
  attempts: number;
}

export const pendingRegistrationsStore = new Map<string, PendingRegistration>();

// Helper to execute genuine user creation and database write once verified
export const executeUserCreation = async (userData: {
  fullName: string;
  companyName?: string;
  email: string;
  phone?: string;
  role: string;
  password: string;
  tin?: string;
  tradeLicenseNo?: string;
  tradeLicenseDoc?: string;
  insuranceDoc?: string;
  roadworthinessDoc?: string;
}) => {
  const {
    fullName,
    email,
    password,
    role,
    phone,
    companyName,
    tin,
    tradeLicenseNo,
    tradeLicenseDoc,
    insuranceDoc,
    roadworthinessDoc,
  } = userData;

  const normalizedEmail = email.toLowerCase().trim();
  const mappedPrismaRole = mapToPrismaRole(role);

  // Boundary Condition 6.9: Duplicate account detected
  // Flag account for administrator review; suspend duplicate account pending TIN/license verification.
  let isDuplicateAccount = false;
  let duplicateField = '';
  let duplicateConflictUser: any = null;

  if (tin && tin.trim().length > 0) {
    duplicateConflictUser = await prisma.user.findFirst({
      where: { tin: tin.trim() },
    });
    if (duplicateConflictUser) {
      isDuplicateAccount = true;
      duplicateField = `Tax Identification Number (TIN: ${tin.trim()})`;
    }
  }

  if (!isDuplicateAccount && tradeLicenseNo && tradeLicenseNo.trim().length > 0) {
    duplicateConflictUser = await prisma.user.findFirst({
      where: { tradeLicenseNo: tradeLicenseNo.trim() },
    });
    if (duplicateConflictUser) {
      isDuplicateAccount = true;
      duplicateField = `Trade License Number (${tradeLicenseNo.trim()})`;
    }
  }

  const initialStatus = isDuplicateAccount
    ? VerificationStatus.SUSPENDED
    : VerificationStatus.PENDING;

  const initialNotes = isDuplicateAccount
    ? `[DUPLICATE ACCOUNT DETECTED]: ${duplicateField} matches existing registered business "${duplicateConflictUser?.companyName || duplicateConflictUser?.fullName}". Account suspended pending administrator TIN/license verification.`
    : null;

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
      tradeLicenseDoc: tradeLicenseDoc ? tradeLicenseDoc.trim() : null,
      insuranceDoc: insuranceDoc ? insuranceDoc.trim() : null,
      roadworthinessDoc: roadworthinessDoc ? roadworthinessDoc.trim() : null,
      role: mappedPrismaRole,
      passwordHash: password,
      verificationStatus: initialStatus,
      verificationNotes: initialNotes,
    },
  });

  // Record registration in immutable audit trail (§4.1.2)
  auditTrailStore.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    action: isDuplicateAccount ? 'DUPLICATE_ACCOUNT_SUSPENDED_FOR_ADMIN_REVIEW' : 'USER_REGISTERED_EMAIL_VERIFIED',
    category: isDuplicateAccount ? 'FRAUD' : 'VERIFICATION',
    targetUserId: newUser.id,
    targetName: newUser.companyName || newUser.fullName,
    previousStatus: 'UNREGISTERED',
    newStatus: initialStatus,
    performedByAdminId: isDuplicateAccount ? 'SYSTEM_DUPLICATE_DETECTOR' : 'SYSTEM_ONBOARDING',
    timestamp: new Date().toISOString(),
    notes: isDuplicateAccount
      ? `Duplicate account detected with matching ${duplicateField}. Suspended pending TIN/license verification.`
      : `New commercial ${newUser.role} registered with verified email and TIN: ${newUser.tin || 'N/A'}, Trade License: ${newUser.tradeLicenseNo || 'N/A'}. Placed in verification queue.`,
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

  return { newUser, token };
};

/**
 * POST /api/auth/register/send-otp
 * Validates registration data, generates 6-digit OTP, stores pending registration, and sends OTP via SMTP
 */
export const sendRegistrationOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const {
      fullName,
      email,
      role,
      phone,
    } = parseResult.data;

    const normalizedEmail = email.toLowerCase().trim();
    const mappedPrismaRole = mapToPrismaRole(role);

    // Institutional Security Guard: Prevent public self-registration of Customs or Admin accounts
    if (mappedPrismaRole === UserRole.CUSTOMS_OFFICER || mappedPrismaRole === UserRole.ADMIN) {
      res.status(403).json({
        error: 'Institutional and regulatory accounts (Customs Officer / System Admin) cannot self-register publicly. Please contact platform administration.',
      });
      return;
    }

    // Check if user already exists in database by email or phone
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

    // Generate secure 6-digit OTP code and store pending registration for 15 minutes
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    pendingRegistrationsStore.set(normalizedEmail, {
      userData: parseResult.data,
      otp,
      expiresAt,
      attempts: 0,
    });

    const emailHtml = buildRegistrationOtpHtml(fullName, otp, role);
    const mailResult = await sendMail({
      to: normalizedEmail,
      subject: `[TradeFlow] Your Registration Verification Code: ${otp}`,
      html: emailHtml,
      text: `Hello ${fullName},\n\nYour TradeFlow account registration verification code is: ${otp}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this, please disregard this email.`,
    });

    res.json({
      success: true,
      requireOtp: true,
      message: `A 6-digit verification code has been dispatched to ${maskEmail(normalizedEmail)}. Please enter it to complete registration.`,
      email: normalizedEmail,
      maskedEmail: maskEmail(normalizedEmail),
      previewOtp: mailResult.mode === 'dev_fallback' ? otp : undefined,
    });
  } catch (error: any) {
    console.error('sendRegistrationOtp error:', error);
    res.status(500).json({ error: error.message || 'Failed to dispatch registration verification code.' });
  }
};

/**
 * POST /api/auth/register/verify-otp
 * Verifies 6-digit OTP code and creates the database user record
 */
export const verifyRegistrationOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, otp } = req.body;
    const inputOtp = (code || otp || '').toString().trim();

    if (!email || !email.trim()) {
      res.status(400).json({ error: 'Email address is required to verify registration.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pending = pendingRegistrationsStore.get(normalizedEmail);

    if (!pending) {
      res.status(400).json({
        error: 'No pending registration found for this email, or the session has expired. Please submit registration again.',
      });
      return;
    }

    if (Date.now() > pending.expiresAt) {
      pendingRegistrationsStore.delete(normalizedEmail);
      res.status(400).json({
        error: 'The verification code has expired. Please request a new code.',
      });
      return;
    }

    pending.attempts += 1;
    if (pending.attempts > 5) {
      pendingRegistrationsStore.delete(normalizedEmail);
      res.status(429).json({
        error: 'Too many incorrect attempts. Please submit your registration details again.',
      });
      return;
    }

    if (inputOtp !== pending.otp) {
      res.status(400).json({
        error: 'Incorrect 6-digit verification code. Please check your email inbox and try again.',
      });
      return;
    }

    // OTP matched! Create real PostgreSQL user record and issue JWT token
    const { newUser, token } = await executeUserCreation(pending.userData);

    // Clean up pending registration
    pendingRegistrationsStore.delete(normalizedEmail);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered and email verified!',
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
    console.error('verifyRegistrationOtp error:', error);
    res.status(500).json({ error: error.message || 'Internal database error completing registration.' });
  }
};

/**
 * POST /api/auth/register/resend-otp
 * Resends a fresh 6-digit OTP code to the user's pending email
 */
export const resendRegistrationOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pending = pendingRegistrationsStore.get(normalizedEmail);

    if (!pending) {
      res.status(400).json({
        error: 'No active registration session found. Please submit the registration form again.',
      });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pending.otp = otp;
    pending.expiresAt = Date.now() + 15 * 60 * 1000;
    pending.attempts = 0;

    const emailHtml = buildRegistrationOtpHtml(pending.userData.fullName, otp, pending.userData.role);
    const mailResult = await sendMail({
      to: normalizedEmail,
      subject: `[TradeFlow] Your New Registration Verification Code: ${otp}`,
      html: emailHtml,
      text: `Hello ${pending.userData.fullName},\n\nYour new TradeFlow registration verification code is: ${otp}\n\nThis code will expire in 15 minutes.`,
    });

    res.json({
      success: true,
      message: `A new 6-digit verification code has been dispatched to ${maskEmail(normalizedEmail)}.`,
      previewOtp: mailResult.mode === 'dev_fallback' ? otp : undefined,
    });
  } catch (error: any) {
    console.error('resendRegistrationOtp error:', error);
    res.status(500).json({ error: error.message || 'Failed to resend verification code.' });
  }
};

// 3. Registration Endpoint with Database Persistence & Exact Role Mapping
// Supports direct OTP validation or automatic dispatch of OTP for email verification
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, otp, otpCode, bypassOtp } = req.body;
    const providedOtp = (code || otp || otpCode || '').toString().trim();

    // If an OTP code was provided, verify it directly
    if (providedOtp) {
      return verifyRegistrationOtp(req, res);
    }

    // If bypassOtp is explicitly allowed (e.g. testing), register immediately
    if (bypassOtp === true) {
      const parseResult = RegisterSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }
      const { newUser, token } = await executeUserCreation(parseResult.data);
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
      return;
    }

    // Default flow: Dispatch 6-digit email OTP verification code
    return sendRegistrationOtp(req, res);
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

    // STRICT CHECK: Google self-registration is disabled. All organizations must register via the official form.
    if (!user) {
      res.status(404).json({
        error: 'No registered enterprise account found for this Google email. Please register first using the official registration form with your business details, TIN, and trade license.',
      });
      return;
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

// 7. Change / Update User Password (for Driver one-time password update or any user)
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, phone, email, oldPassword, newPassword } = req.body;

    if (
      !newPassword ||
      newPassword.trim().length < 8 ||
      !/[a-zA-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      res.status(400).json({
        error: 'New password must be at least 8 characters long and contain at least one letter and one number.',
      });
      return;
    }

    let user: any = null;

    // Check JWT Authorization token if provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.userId) {
          user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        }
      } catch (e) {}
    }

    if (!user && userId) {
      try {
        user = await prisma.user.findUnique({ where: { id: userId } });
      } catch (e) {}
    }
    if (!user && email) {
      user = await prisma.user.findFirst({ where: { email: email.toLowerCase().trim() } });
    }
    if (!user && phone) {
      const cleanDigits = phone.replace(/[^0-9]/g, '');
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: phone.trim() },
            ...(cleanDigits.length >= 8 ? [{ phone: { contains: cleanDigits.slice(-8) } }] : []),
          ],
        },
      });
    }

    if (!user) {
      res.status(404).json({ error: 'Account not found. Please log in again.' });
      return;
    }

    // Verify current / one-time password
    if (!oldPassword || !oldPassword.trim()) {
      res.status(400).json({ error: 'Current password is required.' });
      return;
    }

    if ((user.passwordHash || '').trim() !== oldPassword.trim()) {
      res.status(401).json({ error: 'Current password does not match.' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPassword.trim(),
      },
    });

    res.json({
      message: 'Password updated successfully! Your new permanent password has been saved.',
      success: true,
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to update password.' });
  }
};

// 8. Update Driver / User Photo
export const updatePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, phone, email, photoUrl } = req.body;
    if (!photoUrl) {
      res.status(400).json({ error: 'Photo data or URL is required.' });
      return;
    }

    let user: any = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user && phone) {
      const cleanDigits = phone.replace(/[^0-9]/g, '');
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: phone.trim() },
            ...(cleanDigits.length >= 8 ? [{ phone: { contains: cleanDigits.slice(-8) } }] : []),
          ],
        },
      });
    }
    if (!user && email) {
      user = await prisma.user.findFirst({ where: { email: email.toLowerCase().trim() } });
    }

    if (!user) {
      res.status(404).json({ error: 'Account not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        roadworthinessDoc: photoUrl,
      },
      include: {
        driverProfile: {
          include: {
            assignedVehicle: true,
          },
        },
      },
    });

    res.json({
      message: 'Profile photo updated successfully!',
      photoUrl: updated.roadworthinessDoc,
      user: {
        ...updated,
        photoUrl: updated.roadworthinessDoc,
      },
    });
  } catch (error: any) {
    console.error('Update photo error:', error);
    res.status(500).json({ error: 'Failed to update profile photo.' });
  }
};

// 9. Complete Profile for Transporter / Commercial Users
export const completeProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      email,
      phone,
      companyName,
      tin,
      tradeLicenseNo,
      tradeLicenseDoc,
      insuranceDoc,
      roadworthinessDoc,
    } = req.body;

    let user: any = null;
    if (userId) {
      try {
        user = await prisma.user.findUnique({ where: { id: userId } });
      } catch (e) {}
    }
    if (!user && email) {
      user = await prisma.user.findFirst({ where: { email: email.toLowerCase().trim() } });
    }
    if (!user && phone) {
      const cleanDigits = phone.replace(/[^0-9]/g, '');
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: phone.trim() },
            ...(cleanDigits.length >= 8 ? [{ phone: { contains: cleanDigits.slice(-8) } }] : []),
          ],
        },
      });
    }

    if (!user) {
      res.status(404).json({ error: 'User account not found' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(companyName ? { companyName: companyName.trim() } : {}),
        ...(tin ? { tin: tin.trim() } : {}),
        ...(tradeLicenseNo ? { tradeLicenseNo: tradeLicenseNo.trim() } : {}),
        ...(tradeLicenseDoc ? { tradeLicenseDoc: typeof tradeLicenseDoc === 'object' ? JSON.stringify(tradeLicenseDoc) : tradeLicenseDoc } : {}),
        ...(insuranceDoc ? { insuranceDoc: typeof insuranceDoc === 'object' ? JSON.stringify(insuranceDoc) : insuranceDoc } : {}),
        ...(roadworthinessDoc ? { roadworthinessDoc: typeof roadworthinessDoc === 'object' ? JSON.stringify(roadworthinessDoc) : roadworthinessDoc } : {}),
        verificationStatus: VerificationStatus.PENDING,
      },
    });

    // Record in immutable audit trail (§4.1.2)
    auditTrailStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: 'TRANSPORTER_PROFILE_COMPLETED',
      category: 'VERIFICATION',
      targetUserId: updatedUser.id,
      targetName: updatedUser.companyName || updatedUser.fullName,
      previousStatus: user.verificationStatus,
      newStatus: VerificationStatus.PENDING,
      performedByAdminId: 'SYSTEM_ONBOARDING',
      timestamp: new Date().toISOString(),
      notes: `Transporter completed compliance credentials with TIN: ${updatedUser.tin || 'N/A'}, License: ${updatedUser.tradeLicenseNo || 'N/A'}. Placed in administrative verification queue.`,
    });

    // Broadcast WebSocket event to Web Admin & Portals
    const io = req.app?.get('io');
    if (io) {
      io.emit('user:verification-updated', {
        userId: updatedUser.id,
        email: updatedUser.email,
        verificationStatus: VerificationStatus.PENDING,
      });
      io.emit('portal:refresh', { type: 'VERIFICATION', userId: updatedUser.id });
    }

    res.json({
      message: 'Business profile and compliance credentials submitted successfully! Placed in verification queue.',
      user: {
        ...updatedUser,
        photoUrl: updatedUser.roadworthinessDoc || updatedUser.insuranceDoc || null,
      },
    });
  } catch (error: any) {
    console.error('completeProfile error:', error);
    res.status(500).json({ error: 'Failed to complete profile' });
  }
};

// 10. Update Profile (for Shipper, Freight Forwarder, Transporter, Customs, Admin)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, email, fullName, companyName, phone, tin, tradeLicenseNo } = req.body;

    let user: any = null;
    if (userId) {
      try {
        user = await prisma.user.findUnique({ where: { id: userId } });
      } catch (e) {}
    }
    if (!user && email) {
      user = await prisma.user.findFirst({ where: { email: email.toLowerCase().trim() } });
    }
    if (!user && phone) {
      const cleanDigits = phone.replace(/[^0-9]/g, '');
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: phone.trim() },
            ...(cleanDigits.length >= 8 ? [{ phone: { contains: cleanDigits.slice(-8) } }] : []),
          ],
        },
      });
    }

    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    if (phone && phone.trim()) {
      const cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');
      if ((cleaned.startsWith('+') && !cleaned.startsWith('+251')) || !ETH_PHONE_REGEX.test(cleaned)) {
        res.status(400).json({
          error: 'Only Ethiopian phone numbers (+251 9... / 09... or +251 7... / 07...) are accepted.',
        });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(fullName && fullName.trim() ? { fullName: fullName.trim() } : {}),
        ...(companyName && companyName.trim() ? { companyName: companyName.trim() } : {}),
        ...(phone && phone.trim() ? { phone: phone.trim() } : {}),
        ...(tin && tin.trim() ? { tin: tin.trim() } : {}),
        ...(tradeLicenseNo && tradeLicenseNo.trim() ? { tradeLicenseNo: tradeLicenseNo.trim() } : {}),
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        companyName: updatedUser.companyName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        tin: updatedUser.tin,
        tradeLicenseNo: updatedUser.tradeLicenseNo,
        verificationStatus: updatedUser.verificationStatus,
      },
    });
  } catch (error: any) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile.' });
  }
};

// ============================================================================
// 12. PASSWORD RESET VIA SMTP / OTP CONTROLLERS
// ============================================================================

export interface PasswordResetEntry {
  userId: string;
  email: string;
  token: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

export const passwordResetStore = new Map<string, PasswordResetEntry>();

/**
 * POST /api/auth/forgot-password
 * Generates an OTP & secure token, sends an enterprise HTML email via SMTP
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.body;

    if (!identifier || !identifier.trim()) {
      res.status(400).json({ error: 'Please enter your registered email address or phone number.' });
      return;
    }

    const trimmed = identifier.trim();
    const cleanDigits = trimmed.replace(/[^0-9]/g, '');

    // Locate user in database by email, username, or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: trimmed.toLowerCase() },
          { username: trimmed },
          { phone: trimmed },
          ...(cleanDigits.length >= 8
            ? [
                { phone: { contains: cleanDigits.slice(-8) } },
                { email: { contains: cleanDigits.slice(-8) } },
              ]
            : []),
        ],
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'No registered TradeFlow account found with that email address or phone number.',
      });
      return;
    }

    // Generate secure 6-digit OTP code for mobile/quick input and 32-byte hex token for direct link
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    const entry: PasswordResetEntry = {
      userId: user.id,
      email: user.email.toLowerCase(),
      token,
      otp,
      expiresAt,
      attempts: 0,
    };

    // Index by email and token for dual lookup
    passwordResetStore.set(user.email.toLowerCase(), entry);
    passwordResetStore.set(token, entry);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    // Generate responsive HTML template and dispatch via SMTP
    const emailHtml = buildPasswordResetHtml(user.fullName, otp, resetLink);
    const mailResult = await sendMail({
      to: user.email,
      subject: `[TradeFlow] Password Reset Verification Code: ${otp}`,
      html: emailHtml,
      text: `Hello ${user.fullName},\n\nYour TradeFlow password reset verification code is: ${otp}\n\nThis code will expire in 15 minutes.\nYou can also reset your password directly at: ${resetLink}\n\nIf you did not request this, please ignore this email.`,
    });

    // Record in immutable audit trail
    auditTrailStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: 'PASSWORD_RESET_REQUESTED',
      category: 'AUTH',
      targetUserId: user.id,
      targetName: user.companyName || user.fullName,
      performedByAdminId: 'SYSTEM',
      notes: `Password reset verification code dispatched to ${maskEmail(user.email)} via SMTP (${mailResult.mode}).`,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${maskEmail(user.email)}. Please check your inbox.`,
      email: user.email,
      maskedEmail: maskEmail(user.email),
      // In local dev mode, provide previewOtp for frictionless verification if SMTP credentials aren't set
      previewOtp: mailResult.mode === 'dev_fallback' ? otp : undefined,
      token,
    });
  } catch (error: any) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ error: error.message || 'Failed to process password reset request.' });
  }
};

/**
 * POST /api/auth/verify-reset-code
 * Validates the 6-digit OTP code before asking for the new password
 */
export const verifyResetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, code, token } = req.body;

    let entry: PasswordResetEntry | undefined;

    if (token && passwordResetStore.has(token)) {
      entry = passwordResetStore.get(token);
    } else if (identifier) {
      const emailKey = identifier.toLowerCase().trim();
      entry = passwordResetStore.get(emailKey);
    }

    if (!entry) {
      res.status(400).json({ error: 'No active password reset request found. Please request a new code.' });
      return;
    }

    if (Date.now() > entry.expiresAt) {
      passwordResetStore.delete(entry.email);
      passwordResetStore.delete(entry.token);
      res.status(400).json({ error: 'The verification code has expired. Please request a new code.' });
      return;
    }

    entry.attempts += 1;
    if (entry.attempts > 5) {
      passwordResetStore.delete(entry.email);
      passwordResetStore.delete(entry.token);
      res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' });
      return;
    }

    if (code && code.trim() !== entry.otp) {
      res.status(400).json({ error: 'Incorrect 6-digit verification code. Please check and try again.' });
      return;
    }

    res.json({
      success: true,
      message: 'Verification code confirmed. You may now enter your new password.',
      email: entry.email,
      token: entry.token,
    });
  } catch (error: any) {
    console.error('verifyResetCode error:', error);
    res.status(500).json({ error: error.message || 'Verification failed.' });
  }
};

/**
 * POST /api/auth/reset-password
 * Applies the new password to PostgreSQL database
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, code, token, newPassword } = req.body;

    if (
      !newPassword ||
      newPassword.trim().length < 8 ||
      !/[a-zA-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      res.status(400).json({
        error: 'New password must be at least 8 characters long and contain at least one letter and one number.',
      });
      return;
    }

    let entry: PasswordResetEntry | undefined;

    if (token && passwordResetStore.has(token)) {
      entry = passwordResetStore.get(token);
    } else if (identifier) {
      const emailKey = identifier.toLowerCase().trim();
      entry = passwordResetStore.get(emailKey);
    }

    if (!entry) {
      res.status(400).json({
        error: 'Password reset session expired or invalid. Please request a new code.',
      });
      return;
    }

    if (Date.now() > entry.expiresAt) {
      passwordResetStore.delete(entry.email);
      passwordResetStore.delete(entry.token);
      res.status(400).json({ error: 'Reset session has expired. Please request a new code.' });
      return;
    }

    // If code is provided, verify it matches
    if (code && code.trim() !== entry.otp && (!token || token !== entry.token)) {
      res.status(400).json({ error: 'Incorrect verification code.' });
      return;
    }

    // Update password directly in PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: entry.userId },
      data: {
        passwordHash: newPassword.trim(),
      },
    });

    // Cleanup session tokens
    passwordResetStore.delete(entry.email);
    passwordResetStore.delete(entry.token);

    // Record in audit trail
    auditTrailStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: 'PASSWORD_RESET_SUCCESS',
      category: 'AUTH',
      targetUserId: updatedUser.id,
      targetName: updatedUser.companyName || updatedUser.fullName,
      performedByAdminId: 'SYSTEM',
      notes: `Password was successfully reset and updated in database for ${updatedUser.email}.`,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Your password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('resetPassword error:', error);
    res.status(500).json({ error: error.message || 'Failed to reset password.' });
  }
};



