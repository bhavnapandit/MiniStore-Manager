// storeController.js
import db from '../database.js'; // the connection from above

export const addItem = async (req, res) => {
    try {
        const { name, description, price } = req.body;

        if (!name || !description || !price) {
            return res.status(400).json({ error: 'Name, description, and price are required' });
        }

        const query = `
      INSERT INTO items (name, description, price, createdAt)
      VALUES (?, ?, ?, NOW())
    `;

        // Use await and destructure result
        const [result] = await db.execute(query, [name, description, price]);

        return res.status(201).json({
            message: 'Item added successfully',
            itemId: result.insertId,
        });
    } catch (error) {
        console.error('Error adding item:', error);
        return res.status(500).json({ error: 'Internal server error' });
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

// controllers/storeController.js

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
