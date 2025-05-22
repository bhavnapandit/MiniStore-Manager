import express from 'express';
import {
    addItem,
    getAllItems,
    addInventory,
    getItemsWithInventory,
    deleteItem,
    updateItem,
    addPurchase,
    handleGetAllPurchases,
    deletePurchase
} from '../controllers/storeController.js';

const router = express.Router();

router.post('/items', addItem);
router.get('/items', getAllItems);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);
router.post('/inventory', addInventory);
router.get('/items-with-inventory', getItemsWithInventory);
router.post('/purchase', addPurchase);
router.get('/purchase', handleGetAllPurchases);
router.delete('/purchase/:id', deletePurchase);

export default router;


