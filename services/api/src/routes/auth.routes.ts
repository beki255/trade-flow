import { Router } from 'express';
import {
  getMe,
  login,
  register,
  googleAuth,
  getAllUsers,
  updateVerification,
} from '../controllers/auth.controller';

const router = Router();

router.get('/me', getMe);
router.get('/verify-session', getMe);
router.post('/login', login);
router.post('/register', register);
router.post('/google', googleAuth);
router.get('/users', getAllUsers);
router.patch('/users/:id/verification', updateVerification);

export default router;
