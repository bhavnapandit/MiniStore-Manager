import { useEffect, useState } from "react";
import "./Pages.css"

function ItemsPage() {
    const [items, setItems] = useState([]);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedPrice, setEditedPrice] = useState('');

    const fetchAllItems = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/items');
            if (!response.ok) throw new Error('Failed to fetch items');
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        fetchAllItems();
    }, []);

    const handleAddNewItem = async (e) => {
        e.preventDefault();

        if (!newName || !newPrice) {
            alert("Name and Price are required");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    description: newDescription,
                    price: parseFloat(newPrice),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add new item');
            }

            alert("Item added successfully");
            // Reset form fields
            setNewName('');
            setNewDescription('');
            setNewPrice('');
            // Refresh items list
            fetchAllItems();
        } catch (error) {
            console.error('Error adding new item:', error);
            alert(error.message);
        }
    };

    const handleEditClick = (item) => {
        setEditingItemId(item.id);
        setEditedName(item.name);
        setEditedDescription(item.description);
        setEditedPrice(item.price);
    };

    const handleCancelClick = () => {
        setEditingItemId(null);
    };

    const handleUpdateClick = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editedName,
                    description: editedDescription,
                    price: Number(editedPrice),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update item');
            }

            alert('Item updated successfully!');
            setEditingItemId(null);
            fetchAllItems();
        } catch (error) {
            console.error('Error updating item:', error);
            alert(error.message);
        }
    };

    // const handleDeleteItem = async (itemId) => {
    //     try {
    //         const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
    //             method: 'DELETE',
    //         });

    //         if (!response.ok) {
    //             throw new Error('Failed to delete item');
    //         }

    //         alert('Item deleted successfully');
    //         fetchAllItems();
    //     } catch (error) {
    //         console.error('Error deleting item:', error);
    //         alert(error.message);
    //     }
    // };

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
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{
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
                                            {editingItemId === item.id ? (
                                                <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={editedName}
                                                            onChange={(e) => setEditedName(e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={editedDescription}
                                                            onChange={(e) => setEditedDescription(e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={editedPrice}
                                                            onChange={(e) => setEditedPrice(e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="flex gap-2">
                                                        <button className="btn btn-secondary" onClick={() => handleUpdateClick(item.id)}>Update</button>
                                                        <button className="btn btn-danger" onClick={handleCancelClick}>Cancel</button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.name}</td>
                                                    <td>{item.description}</td>
                                                    <td>${Number(item.price).toFixed(2)}</td>
                                                    <td>
                                                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <button className="btn btn-secondary" onClick={() => handleEditClick(item)}>Edit</button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
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
                    <h2 className="card-title">Add New Item</h2>
                </div>
                <div className="card-content">
                    <form className="form" onSubmit={handleAddNewItem}>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Item name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-input"
                                rows="3"
                                placeholder="Item description"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Price</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-input"
                                placeholder="0.00"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Save Item
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}

export default ItemsPage;
