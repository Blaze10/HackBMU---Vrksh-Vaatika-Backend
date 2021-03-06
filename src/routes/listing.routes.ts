import { Router } from 'express';
import { createListing, getUserListings, updateListing, getListingById, deleteListing, nearbyListings } from '../controllers/listing.controller';
import { checkAuth } from '../middleware/checkauth';

const router = Router();

router.post('/create', checkAuth, createListing);
router.get('/list', checkAuth, getUserListings);
router.post('/update/:id', checkAuth, updateListing);
router.get('/get/:id', checkAuth, getListingById);
router.delete('/:id', checkAuth, deleteListing);
router.get('/nearby', checkAuth, nearbyListings);

export default router;