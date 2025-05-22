import { useEffect, useState } from "react";
import "./Pages.css"

function InventoryPage() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        async function fetchItems() {
            try {
                const response = await fetch('http://localhost:5000/api/items-with-inventory');
                console.log(response);

                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                console.log(data);
                setItems(data);
            } catch (err) {
                console.error('Error fetching items with inventory:', err);
            }
        }

        fetchItems();
    }, []);
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
                                    <th>Quantity in Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>${Number(item.price).toFixed(2)}</td>
                                        <td>{item.stock}</td>
                                        <td>
                                            <button className="btn btn-secondary">Update</button>
                                        </td>
                                    </tr>
                                ))}
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
                    <form className="form">
                        <div className="form-group">
                            <label className="form-label">Item</label>
                            <select className="form-input">
                                <option value="">Select an item</option>
                                <option value="1">T-Shirt</option>
                                <option value="2">Jeans</option>
                                <option value="3">Sneakers</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Quantity</label>
                            <input type="number" className="form-input" placeholder="0" />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Update Inventory
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default InventoryPage
