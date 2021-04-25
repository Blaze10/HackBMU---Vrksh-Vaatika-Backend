import { Router } from 'express';
import { createTradeOffer, editTradeOffer, getUserOffers, deleteTradeOffer } from '../controllers/trade_offer.controller';
import { checkAuth } from '../middleware/checkauth';

const router = Router();

router.post('/create', checkAuth, createTradeOffer);
router.post('/edit/:id', checkAuth, editTradeOffer);
router.get('/useroffers', checkAuth, getUserOffers);
router.delete('/delete/:id', checkAuth, deleteTradeOffer);

export default router;