import { createTradeStatus, tradeStatusList } from '../controllers/trade_status_master.controller';
import { Router } from 'express';
import { checkAuth } from '../middleware/checkauth';

const router = Router();

router.post('/create', checkAuth, createTradeStatus);
router.get('/list', checkAuth, tradeStatusList);

export default router;