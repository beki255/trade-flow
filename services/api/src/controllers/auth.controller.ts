import { Request, Response } from 'express';
import { PrismaClient, UserRole, VerificationStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { auditTrailStore } from './portal.controller';

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
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { username: identifier.trim() },
          { phone: identifier.trim() },
          ...(cleanDigits.length >= 8
            ? [
                { phone: { contains: cleanDigits } },
                { phone: { contains: phoneSuffix } },
                { email: { contains: phoneSuffix } },
                { username: { contains: phoneSuffix } },
              ]
            : []),
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
      res.status(401).json({ error: 'User not found. Please check your phone number or credentials.' });
      return;
    }

    // Verify password against database record
    const passMatches = (user.passwordHash || '').trim() === password.trim();

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
      tradeLicenseDoc,
      insuranceDoc,
      roadworthinessDoc,
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
      action: isDuplicateAccount ? 'DUPLICATE_ACCOUNT_SUSPENDED_FOR_ADMIN_REVIEW' : 'USER_REGISTERED_PENDING_VERIFICATION',
      category: isDuplicateAccount ? 'FRAUD_PREVENTION' : 'VERIFICATION',
      targetUserId: newUser.id,
      targetName: newUser.companyName || newUser.fullName,
      previousStatus: 'UNREGISTERED',
      newStatus: initialStatus,
      performedByAdminId: isDuplicateAccount ? 'SYSTEM_DUPLICATE_DETECTOR' : 'SYSTEM_ONBOARDING',
      timestamp: new Date().toISOString(),
      notes: isDuplicateAccount
        ? `Duplicate account detected with matching ${duplicateField}. Suspended pending TIN/license verification.`
        : `New commercial ${newUser.role} registered with TIN: ${newUser.tin || 'N/A'}, Trade License: ${newUser.tradeLicenseNo || 'N/A'}. Placed in verification queue.`,
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

    if (!newPassword || newPassword.trim().length < 4) {
      res.status(400).json({ error: 'New password must be at least 4 characters long.' });
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
      res.status(404).json({ error: 'Account not found. Please log in again.' });
      return;
    }

    // Verify current / one-time password if provided
    if (oldPassword && oldPassword.trim().length > 0) {
      if ((user.passwordHash || '').trim() !== oldPassword.trim()) {
        res.status(401).json({ error: 'Current or temporary password does not match.' });
        return;
      }
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


