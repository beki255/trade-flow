import { Router } from 'express';
import {
  login,
  register,
  googleAuth,
  getAllUsers,
  updateVerification,
} from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/google', googleAuth);
router.get('/users', getAllUsers);
router.patch('/users/:id/verification', updateVerification);

export default router;
