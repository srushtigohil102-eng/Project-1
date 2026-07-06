import { Router } from 'express';
import { 
  login, 
  register, 
  getCurrentUser, 
  changePassword, 
  updateProfile, 
  logout 
} from '../controllers/auth.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { requireHR } from '../middleware/role.middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Protected routes (require authentication)
router.get('/me', verifyTokenMiddleware, getCurrentUser);
router.post('/change-password', verifyTokenMiddleware, changePassword);

// Self-service profile update (any authenticated user)
router.put('/profile', verifyTokenMiddleware, updateProfile);

// Admin/HR only routes
router.post('/register', verifyTokenMiddleware, requireHR, register);

export default router;