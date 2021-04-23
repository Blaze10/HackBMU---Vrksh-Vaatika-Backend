import { createGarden, deleteGardenItem, editGardenPlant, getGardenItemById, getUserGarden } from '../controllers/garden.controller';
import { Router } from 'express';
import { checkAuth } from '../middleware/checkauth';

const router = Router();

router.post('/create', checkAuth, createGarden);
router.get('/list', checkAuth, getUserGarden);
router.post('/update/:id', checkAuth, editGardenPlant);
router.post('/delete/:id', checkAuth, deleteGardenItem);
router.get('/get/:id', checkAuth, getGardenItemById);

export default router;