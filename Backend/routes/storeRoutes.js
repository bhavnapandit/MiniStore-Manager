import express from 'express';
import {
    addItem,
    getAllItems,
    addInventory,
    getItemsWithInventory,
    deleteInventory,
    deleteItem,
    updateItem,
    addPurchase,
    handleGetAllPurchases,
    deletePurchase,
    addShipping,
    getAllShipping,
    getPurchaseDetailsById,
    deleteShipping

} from '../controllers/storeController.js';

const router = express.Router();

router.post('/items', addItem);
router.get('/items', getAllItems);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);
router.post('/inventory', addInventory);
router.delete('/inventory/:item_id', deleteInventory);
router.get('/items-with-inventory', getItemsWithInventory);
router.post('/purchase', addPurchase);
router.get('/purchase', handleGetAllPurchases);
router.delete('/purchase/:id', deletePurchase);
router.post('/shipping', addShipping);
router.get('/shipping', getAllShipping);
router.get('/purchase-details/:id', getPurchaseDetailsById);
router.delete('/shipping/:id', deleteShipping);


export default router;


