import { categoryList, createCategory } from '../controllers/category_master.controller';
import { Router } from 'express';
import { checkAuth } from '../middleware/checkauth';

const router = Router();

router.post('/create', checkAuth, createCategory);
router.get('/list', checkAuth, categoryList);

export default router;