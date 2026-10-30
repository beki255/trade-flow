import { Router } from 'express';
import {
  getMe,
  login,
  register,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  googleAuth,
  getAllUsers,
  updateVerification,
  changePassword,
  updatePhoto,
  completeProfile,
  updateProfile,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../controllers/auth.controller';

const router = Router();

router.get('/me', getMe);
router.get('/verify-session', getMe);
router.post('/login', login);
router.post('/register', register);
router.post('/register/send-otp', sendRegistrationOtp);
router.post('/register/verify-otp', verifyRegistrationOtp);
router.post('/register/resend-otp', resendRegistrationOtp);
router.post('/google', googleAuth);
router.get('/users', getAllUsers);
router.patch('/users/:id/verification', updateVerification);
router.post('/change-password', changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.post('/update-photo', updatePhoto);
router.post('/complete-profile', completeProfile);
router.put('/update-profile', updateProfile);
router.post('/update-profile', updateProfile);

export default router;
