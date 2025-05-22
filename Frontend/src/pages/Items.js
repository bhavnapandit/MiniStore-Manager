import { useEffect, useState } from "react";
import "./Pages.css"

function ItemsPage() {
    const [items, setItems] = useState([]);

    async function fetchAllItems() {
        try {
            const response = await fetch('http://localhost:5000/api/items');
            console.log(response);
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const items = await response.json();
            console.log('Items:', items);
            setItems(items);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }

    useEffect(() => {
        fetchAllItems();
    }, []);

    return (
        <div className="page">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Item List</h2>
                </div>
                <div className="card-content">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.description}</td>
                                        <td>${Number(item.price).toFixed(2)}</td>
                                        <td>{item.createdAt}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button className="btn btn-secondary">Edit</button>
                                                <button className="btn btn-danger">Delete</button>
                                            </div>
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
                    <h2 className="card-title">Add New Item</h2>
                </div>
                <div className="card-content">
                    <form className="form">
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input type="text" className="form-input" placeholder="Item name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-input" rows="3" placeholder="Item description"></textarea>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Price</label>
                            <input type="number" step="0.01" className="form-input" placeholder="0.00" />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Save Item
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ItemsPage
