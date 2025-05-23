import { useEffect, useState } from "react";
import "./Pages.css";

function InventoryPage() {
    const [items, setItems] = useState([]);
    const [itemId, setItemId] = useState('');
    const [stock, setStock] = useState('');

 async function fetchItems() {
            try {
                const response = await fetch('https://ministore-manager.onrender.com/api/items-with-inventory');
                if (!response.ok) throw new Error('Failed to fetch items');
                const data = await response.json();
                setItems(data);
            } catch (err) {
                console.error('Error fetching items with inventory:', err);
            }
        }
    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://ministore-manager.onrender.com/api/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_id: itemId,
                    stock: parseInt(stock, 10)
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update inventory');

            alert('Inventory updated successfully!');
            setItemId('');
            setStock('');

            // Refresh inventory table
            const updated = await fetch('https://ministore-manager.onrender.com/api/items-with-inventory');
            const updatedData = await updated.json();
            setItems(updatedData);

        } catch (error) {
            console.error('Error:', error.message);
            alert(error.message);
        }
    };

    const handleDelete = async (item_id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this inventory item?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`https://ministore-manager.onrender.com/api/inventory/${item_id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setItems(items.filter(item => item.item_id !== item_id));
                fetchItems();
                alert("Inventory item deleted.");
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to delete item.");
            }
        } catch (err) {
            console.error("Error deleting item:", err);
            alert("Server error");
        }
    };


    return (
        <div className="page">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Inventory Levels</h2>
                </div>
                <div className="card-content">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Price</th>
                                    <th>Quantity </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{
                                            textAlign: 'center',
                                            padding: '2rem',
                                            fontSize: '1.5rem',
                                            fontWeight: '600',
                                            color: 'red',
                                            borderRadius: '8px',
                                            letterSpacing: '1px',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <span style={{ border: '2px solid red', padding: '0.5rem', borderRadius: '8px' }}> 🚫 Out of Stock</span>
                                        </td>
                                    </tr>

                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>${Number(item.price).toFixed(2)}</td>
                                            <td>{item.stock > 0 ? item.stock : 'No stock'}</td>
                                            <td className="flex gap-2">
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setItemId(item.id)}
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() =>handleDelete(item.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Update Inventory</h2>
                </div>
                <div className="card-content">
                    <form className="form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Item</label>
                            <select
                                className="form-input"
                                value={itemId}
                                onChange={(e) => setItemId(e.target.value)}
                                required
                            >
                                <option value="">Select an item</option>
                                {items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">New Quantity</label>
                            <input
                                type="number"
                                className="form-input"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="0"
                                min="1"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Update Inventory
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default InventoryPage;
