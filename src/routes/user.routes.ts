import { Router } from 'express';
import { getUserbyId, loginUser, updateUser } from '../controllers/user_controller';
import { checkAuth } from '../middleware/checkauth';

const router = Router();

router.post('/login', loginUser);
router.post('/update', checkAuth, updateUser);
router.get('/user/:id', checkAuth, getUserbyId);

export default router;