import db from "../database.js";

export const addItem = async (req, res) => {
    try {
        const { name, description, price } = req.body;

        if (!name || price == null) {
            return res.status(400).json({ error: "Name and price are required" });
        }

        const [itemResult] = await db.execute(
            "INSERT INTO items (name, description, price) VALUES (?, ?, ?)",
            [name, description, price]
        );

        const itemId = itemResult.insertId;

        // automatically add inventory row with 0 stock
        await db.execute("INSERT INTO inventory (item_id, stock) VALUES (?, ?)", [
            itemId,
            1,
        ]);

        res.status(201).json({ message: "Item and inventory added successfully" });
    } catch (error) {
        console.error("Error adding item:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllItems = async (req, res) => {
    try {
        const query = "SELECT * FROM items";
        const [rows] = await db.execute(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addInventory = async (req, res) => {
    try {
        const { item_id, stock } = req.body;

        if (!item_id || stock == null) {
            return res.status(400).json({ error: "item_id and stock are required" });
        }

        // Check if inventory for the item exists
        const [existing] = await db.execute(
            "SELECT * FROM inventory WHERE item_id = ?",
            [item_id]
        );

        if (existing.length > 0) {
            // Update stock if already exists
            await db.execute(
                "UPDATE inventory SET stock = stock + ? WHERE item_id = ?",
                [stock, item_id]
            );
        } else {
            // Insert new inventory record
            await db.execute("INSERT INTO inventory (item_id, stock) VALUES (?, ?)", [
                item_id,
                stock,
            ]);
        }

        res.status(200).json({ message: "Inventory updated successfully" });
    } catch (error) {
        console.error("Error adding inventory:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteInventory = async (req, res) => {
    try {
        const { item_id } = req.params;

        if (!item_id) {
            return res.status(400).json({ error: "item_id is required" });
        }

        // Set stock to zero instead of deleting
        const [result] = await db.execute(
            "UPDATE inventory SET stock = 0 WHERE item_id = ?",
            [item_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Inventory item not found" });
        }

        res
            .status(200)
            .json({ message: "Inventory stock set to zero successfully" });
    } catch (error) {
        console.error("Error setting inventory stock to zero:", error);
        res.status(500).json({ error: "Internal server error" });
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
        console.error("Error fetching items with inventory:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        await db.execute("DELETE FROM inventory WHERE item_id = ?", [id]);
        const [result] = await db.execute("DELETE FROM items WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        return res.json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Error deleting item:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const updateItem = async (req, res) => {
    try {
        const { id } = req.params; // item id from URL param
        const { name, description, price } = req.body;

        if (!name || !description || price == null) {
            return res
                .status(400)
                .json({ error: "Name, description, and price are required" });
        }

        const query = `
      UPDATE items
      SET name = ?, description = ?, price = ?
      WHERE id = ?
    `;

        const [result] = await db.execute(query, [name, description, price, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.json({ message: "Item updated successfully" });
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addPurchase = async (req, res) => {
    const { customer_name, items, total_amount } = req.body;

    try {
        await db.beginTransaction();
        for (const { item_id, quantity } of items) {
            const [[stockRow]] = await db.query(
                "SELECT stock, name FROM inventory JOIN items ON inventory.item_id = items.id WHERE item_id = ?",
                [item_id]
            );

            if (!stockRow) {
                await db.rollback();
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: `Item ID ${item_id} not found in inventory.`,
                    });
            }

            if (stockRow.stock < quantity) {
                await db.rollback();
                return res.status(400).json({
                    success: false,
                    message: `'${stockRow.name}' is out of stock.`,
                });
            }
        }

        // Step 2: Insert into purchases
        const [purchaseResult] = await db.query(
            "INSERT INTO purchases (customer_name, total_amount) VALUES (?, ?)",
            [customer_name, total_amount]
        );

        const purchaseId = purchaseResult.insertId;

        // Step 3: Insert into purchase_items and update stock
        for (const { item_id, quantity } of items) {
            await db.query(
                "INSERT INTO purchase_items (purchase_id, item_id, quantity) VALUES (?, ?, ?)",
                [purchaseId, item_id, quantity]
            );

            await db.query(
                "UPDATE inventory SET stock = stock - ? WHERE item_id = ?",
                [quantity, item_id]
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
        const [rows] = await db.query(
            "SELECT * FROM purchases ORDER BY purchase_date DESC"
        );
        return rows;
    } catch (error) {
        console.error("Error fetching purchases:", error);
        throw error;
    }
};
export const handleGetAllPurchases = async (req, res) => {
    try {
        const purchases = await getAllPurchases(); // ✅ await here
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch purchases" });
    }
};

export const deletePurchase = async (req, res) => {
    const { id } = req.params;

    try {
        // Start transaction to ensure data consistency
        await db.beginTransaction();

        // First check if purchase exists
        const [purchaseCheck] = await db.query(
            "SELECT id FROM purchases WHERE id = ?",
            [id]
        );
        if (purchaseCheck.length === 0) {
            await db.rollback();
            return res.status(404).json({ error: "Purchase not found" });
        }

        // Get purchase items to restore inventory (optional - if you want to restore stock)
        const [purchaseItems] = await db.query(
            "SELECT item_id, quantity FROM purchase_items WHERE purchase_id = ?",
            [id]
        );

        // Restore inventory stock (optional)
        for (const item of purchaseItems) {
            await db.query(
                "UPDATE inventory SET stock = stock + ? WHERE item_id = ?",
                [item.quantity, item.item_id]
            );
        }

        // Delete purchase items first (due to foreign key constraint)
        await db.query("DELETE FROM purchase_items WHERE purchase_id = ?", [id]);

        // Then delete the purchase
        const [result] = await db.query("DELETE FROM purchases WHERE id = ?", [id]);

        await db.commit();

        res.json({
            success: true,
            message: "Purchase deleted successfully",
            restoredItems: purchaseItems.length,
        });
    } catch (error) {
        await db.rollback();
        console.error("Error deleting purchase:", error);
        res.status(500).json({ error: "Failed to delete purchase" });
    }
};

export const addShipping = async (req, res) => {
    const { purchase_id, shipping_date, shipping_address, status, items } =
        req.body;

    if (!purchase_id || !items || !items.length) {
        return res.status(400).json({ error: "Missing purchase or items" });
    }

    try {
        await db.beginTransaction();

        // Step 1: Fetch items from original purchase
        const [purchaseItemsRows] = await db.query(
            `SELECT item_id, quantity FROM purchase_items WHERE purchase_id = ?`,
            [purchase_id]
        );

        const purchasedItemMap = {};
        for (const { item_id, quantity } of purchaseItemsRows) {
            purchasedItemMap[item_id] = quantity;
        }

        // Step 2: Validate each item
        for (const { item_id, quantity } of items) {
            if (!purchasedItemMap[item_id]) {
                const [[itemInfo]] = await db.query(
                    `SELECT name FROM items WHERE id = ?`,
                    [item_id]
                );

                const itemName = itemInfo?.name || `Item ID ${item_id}`;
                return res.status(400).json({
                    error: `❌ '${itemName}' is not part of the original purchase order.`,
                });
            }

            if (quantity > purchasedItemMap[item_id]) {
                const [[itemInfo]] = await db.query(
                    `SELECT name FROM items WHERE id = ?`,
                    [item_id]
                );

                const itemName = itemInfo?.name || `Item ID ${item_id}`;
                return res.status(400).json({
                    error: `⚠️ Cannot ship more than purchased for '${itemName}'.`,
                });
            }
        }

        // Step 3: Insert into shipping table
        const [shippingResult] = await db.query(
            `INSERT INTO shipping (purchase_id, shipping_date, shipping_address, status) VALUES (?, ?, ?, ?)`,
            [
                purchase_id,
                shipping_date || new Date(),
                shipping_address || null,
                status || "pending",
            ]
        );

        const shipping_id = shippingResult.insertId;

        // Step 4: Insert into shipping_items
        for (const { item_id, quantity } of items) {
            await db.query(
                `INSERT INTO shipping_items (shipping_id, item_id, quantity) VALUES (?, ?, ?)`,
                [shipping_id, item_id, quantity]
            );
        }

        await db.commit();
        res.status(201).json({ success: true, shipping_id });
    } catch (error) {
        await db.rollback();
        console.error(error);
        res.status(500).json({ error: "Failed to record shipping" });
    }
};

export const getAllShipping = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM shipping");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching shipping records:", error);
        res.status(500).json({ error: "Failed to fetch shipping records" });
    }
};

export const getPurchaseDetailsById = async (req, res) => {
    const purchaseId = req.params.id;

    try {
        const [rows] = await db.query(
            `
            SELECT 
                p.id AS purchase_id,
                p.customer_name,
                p.total_amount,
                p.purchase_date,
                i.name AS item_name,
                pi.quantity,
                i.price
            FROM purchases p
            JOIN purchase_items pi ON p.id = pi.purchase_id
            JOIN items i ON pi.item_id = i.id
            WHERE p.id = ?
            ORDER BY p.purchase_date DESC;
        `,
            [purchaseId]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching purchase details:", error);
        res.status(500).json({ error: "Failed to fetch purchase details" });
    }
};

export const deleteShipping = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Missing shipping ID" });
    }

    try {
        await db.beginTransaction();

        const [shippedItems] = await db.query(
            `SELECT item_id, quantity FROM shipping_items WHERE shipping_id = ?`,
            [id]
        );

        // for (const { item_id, quantity } of shippedItems) {
        //     await db.query(
        //         `UPDATE inventory SET stock = stock + ? WHERE id = ?`,
        //         [quantity, item_id]
        //     );
        // }

        await db.query(`DELETE FROM shipping_items WHERE shipping_id = ?`, [id]);

        const [result] = await db.query(`DELETE FROM shipping WHERE id = ?`, [id]);

        await db.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Shipping record not found" });
        }

        res.status(200).json({ message: "Shipping record deleted successfully" });
    } catch (error) {
        await db.rollback();
        console.error("Error deleting shipping:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateShipping = async (req, res) => {
    const { id } = req.params;
    const { status, tracking_number, shipping_provider } = req.body;

    if (!id || (!status && !tracking_number && !shipping_provider)) {
        return res
            .status(400)
            .json({ error: "Invalid input: Provide at least one field to update" });
    }

    try {
        // Dynamically build the SQL SET clause
        const fields = [];
        const values = [];

        if (status) {
            fields.push("status = ?");
            values.push(status);
        }
        if (tracking_number) {
            fields.push("tracking_number = ?");
            values.push(tracking_number);
        }
        if (shipping_provider) {
            fields.push("shipping_provider = ?");
            values.push(shipping_provider);
        }

        values.push(id); // for WHERE clause

        const updateQuery = `UPDATE shipping SET ${fields.join(", ")} WHERE id = ?`;
        await db.query(updateQuery, values);

        res
            .status(200)
            .json({ success: true, message: "Shipping info updated successfully" });
    } catch (error) {
        console.error("Error updating shipping:", error);
        res.status(500).json({ error: "Failed to update shipping" });
    }
};
