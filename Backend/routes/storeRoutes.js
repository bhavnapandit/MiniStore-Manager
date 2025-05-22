import express from 'express';
import {
    addItem,
    getAllItems,
    addInventory,
    getItemsWithInventory,
    // makePurchase,
    // getAllPurchases,
    // updatePurchase,
    // deletePurchase
} from '../controllers/storeController.js';

const router = express.Router();

router.post('/items', addItem);
router.get('/items', getAllItems);
router.post('/inventory', addInventory);
router.get('/items-with-inventory', getItemsWithInventory);
// router.post('/purchase', makePurchase);
// router.get('/purchases', getAllPurchases);
// router.put('/purchase/:id', updatePurchase);
// router.delete('/purchase/:id', deletePurchase);

export default router;

