
import db from '../database.js';


export const addItem = async (req, res) => {
    try {
        const { name, description, price } = req.body;

        if (!name || price == null) {
            return res.status(400).json({ error: 'Name and price are required' });
        }

        const [itemResult] = await db.execute(
            'INSERT INTO items (name, description, price) VALUES (?, ?, ?)',
            [name, description, price]
        );

        const itemId = itemResult.insertId;

        // Automatically add inventory row with 0 stock
        await db.execute(
            'INSERT INTO inventory (item_id, stock) VALUES (?, ?)',
            [itemId, 1]
        );

        res.status(201).json({ message: 'Item and inventory added successfully' });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const getAllItems = async (req, res) => {
    try {
        const query = 'SELECT * FROM items';
        const [rows] = await db.execute(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addInventory = async (req, res) => {
    try {
        const { item_id, stock } = req.body;

        if (!item_id || stock == null) {
            return res.status(400).json({ error: 'item_id and stock are required' });
        }

        // Check if inventory for the item exists
        const [existing] = await db.execute(
            'SELECT * FROM inventory WHERE item_id = ?',
            [item_id]
        );

        if (existing.length > 0) {
            // Update stock if already exists
            await db.execute(
                'UPDATE inventory SET stock = stock + ? WHERE item_id = ?',
                [stock, item_id]
            );
        } else {
            // Insert new inventory record
            await db.execute(
                'INSERT INTO inventory (item_id, stock) VALUES (?, ?)',
                [item_id, stock]
            );
        }

        res.status(200).json({ message: 'Inventory updated successfully' });
    } catch (error) {
        console.error('Error adding inventory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getItemsWithInventory = async (req, res) => {
    try {
        const query = `
      SELECT 
        items.id, 
        items.name, 
        items.description, 
        items.price, 
        items.createdAt,
        inventory.stock
      FROM items
      JOIN inventory ON items.id = inventory.item_id
    `;

        const [rows] = await db.execute(query);

        return res.json(rows);
    } catch (error) {
        console.error('Error fetching items with inventory:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        await db.execute('DELETE FROM inventory WHERE item_id = ?', [id]);
        const [result] = await db.execute('DELETE FROM items WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        return res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateItem = async (req, res) => {
    try {
        const { id } = req.params; // item id from URL param
        const { name, description, price } = req.body;

        if (!name || !description || price == null) {
            return res.status(400).json({ error: 'Name, description, and price are required' });
        }

        const query = `
      UPDATE items
      SET name = ?, description = ?, price = ?
      WHERE id = ?
    `;

        const [result] = await db.execute(query, [name, description, price, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addPurchase = async (req, res) => {
    const { customer_name, items, total_amount } = req.body;
    try {
        await db.beginTransaction();

        const [purchaseResult] = await db.query(
            'INSERT INTO purchases (customer_name, total_amount) VALUES (?, ?)',
            [customer_name, total_amount]
        );

        const purchaseId = purchaseResult.insertId;

        for (const { item_id, quantity } of items) {
            await db.query(
                'INSERT INTO purchase_items (purchase_id, item_id, quantity) VALUES (?, ?, ?)',
                [purchaseId, item_id, quantity]
            );
            await db.query(
                'UPDATE inventory SET stock = stock - ? WHERE item_id = ? AND stock >= ?',
                [quantity, item_id, quantity]
            );
        }

        await db.commit();
        res.status(201).json({ success: true, purchaseId });

    } catch (error) {
        await db.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getAllPurchases = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM purchases ORDER BY purchase_date DESC');
        return rows;
    } catch (error) {
        console.error('Error fetching purchases:', error);
        throw error;
    }
};
export const handleGetAllPurchases = async (req, res) => {
    try {
        const purchases = await getAllPurchases(); // ✅ await here
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch purchases' });
    }
};

export const deletePurchase = async (req, res) => {
    const { id } = req.params;

    try {
        // Start transaction to ensure data consistency
        await db.beginTransaction();

        // First check if purchase exists
        const [purchaseCheck] = await db.query('SELECT id FROM purchases WHERE id = ?', [id]);
        if (purchaseCheck.length === 0) {
            await db.rollback();
            return res.status(404).json({ error: 'Purchase not found' });
        }

        // Get purchase items to restore inventory (optional - if you want to restore stock)
        const [purchaseItems] = await db.query(
            'SELECT item_id, quantity FROM purchase_items WHERE purchase_id = ?',
            [id]
        );

        // Restore inventory stock (optional)
        for (const item of purchaseItems) {
            await db.query(
                'UPDATE inventory SET stock = stock + ? WHERE item_id = ?',
                [item.quantity, item.item_id]
            );
        }

        // Delete purchase items first (due to foreign key constraint)
        await db.query('DELETE FROM purchase_items WHERE purchase_id = ?', [id]);

        // Then delete the purchase
        const [result] = await db.query('DELETE FROM purchases WHERE id = ?', [id]);

        await db.commit();

        res.json({
            success: true,
            message: 'Purchase deleted successfully',
            restoredItems: purchaseItems.length
        });

    } catch (error) {
        await db.rollback();
        console.error('Error deleting purchase:', error);
        res.status(500).json({ error: 'Failed to delete purchase' });
    }
};
