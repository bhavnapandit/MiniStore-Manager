import { useEffect, useState } from "react";
import "./Pages.css"

function PurchasesPage() {
    const [purchases, setPurchases] = useState([]);
    const [customerName, setCustomerName] = useState("");
    const [itemId, setItemId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemsList, setItemsList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all purchases
    const fetchAllPurchases = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/purchase');
            if (!response.ok) throw new Error('Failed to fetch purchases');
            const data = await response.json();
            setPurchases(data);
        } catch (error) {
            console.error('Error fetching purchases:', error);
        }
    };

    // Fetch available items for the dropdown
    const fetchItems = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/items');
            if (!response.ok) throw new Error('Failed to fetch items');
            const data = await response.json();
            setItemsList(data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        fetchAllPurchases();
        fetchItems();
    }, []);

    // Add item to selected items list
    const handleAddItem = () => {
        const item = itemsList.find(i => i.id === parseInt(itemId));
        if (!item || !itemId || quantity <= 0) return;

        // Check if item already exists in selected items
        const existingItemIndex = selectedItems.findIndex(si => si.item_id === item.id);

        if (existingItemIndex >= 0) {
            // Update quantity if item already exists
            setSelectedItems(prev =>
                prev.map((si, index) =>
                    index === existingItemIndex
                        ? { ...si, quantity: si.quantity + parseInt(quantity) }
                        : si
                )
            );
        } else {
            // Add new item
            setSelectedItems(prev => [
                ...prev,
                {
                    item_id: item.id,
                    name: item.name,
                    price: parseFloat(item.price),
                    quantity: parseInt(quantity)
                }
            ]);
        }

        // Reset form
        setItemId("");
        setQuantity(1);
    };

    // Remove item from selected items
    const handleRemoveItem = (index) => {
        setSelectedItems(prev => prev.filter((_, i) => i !== index));
    };

    // Calculate total amount
    const calculateTotal = () => {
        return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!customerName.trim() || selectedItems.length === 0) {
            alert('Please provide customer name and add at least one item');
            return;
        }

        setLoading(true);

        try {
            const purchaseData = {
                customer_name: customerName,
                items: selectedItems.map(item => ({
                    item_id: item.item_id,
                    quantity: item.quantity
                })),
                total_amount: calculateTotal()
            };

            const response = await fetch('http://localhost:5000/api/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(purchaseData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to complete purchase');
            }

            const result = await response.json();

            if (result.success) {
                alert(`Purchase completed successfully! Purchase ID: ${result.purchaseId}`);

                // Reset form
                setCustomerName("");
                setSelectedItems([]);
                setItemId("");
                setQuantity(1);

                // Refresh purchases list
                await fetchAllPurchases();
            } else {
                throw new Error(result.message || 'Purchase failed');
            }
        } catch (error) {
            console.error('Error completing purchase:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Delete purchase
    const handleDeletePurchase = async (purchaseId) => {

        try {
            const response = await fetch(`http://localhost:5000/api/purchase/${purchaseId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete purchase');

            alert('Purchase deleted successfully!');
            await fetchAllPurchases();
        } catch (error) {
            console.error('Error deleting purchase:', error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="page">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Purchase History</h2>
                </div>
                <div className="card-content">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Purchase ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.length === 0 ? (<tr>
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
                                        <span style={{ border: '2px solid red', padding: '0.5rem', borderRadius: '8px' }}> No Purchases Found!</span>
                                    </td>
                                </tr>) : (
                                    purchases.map((purchase) => (
                                        <tr key={purchase.id}>
                                            <td>{purchase.id}</td>
                                            <td>{purchase.customer_name}</td>
                                            <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                                            <td>${parseFloat(purchase.total_amount).toFixed(2)}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => handleDeletePurchase(purchase.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
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
                    <h2 className="card-title">New Purchase</h2>
                </div>
                <div className="card-content">
                    <form className="form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Customer Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Customer name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <h3 className="form-section-title">Add Items</h3>
                            <div className="flex gap-2 mb-4">
                                <select
                                    className="form-input"
                                    value={itemId}
                                    onChange={(e) => setItemId(e.target.value)}
                                >
                                    <option value="">Select an item</option>
                                    {itemsList.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} - ${parseFloat(item.price).toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Qty"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    style={{ width: "80px" }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleAddItem}
                                    disabled={!itemId}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {selectedItems.length > 0 && (
                            <div className="table-container mb-4">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>${item.price.toFixed(2)}</td>
                                                <td>${(item.price * item.quantity).toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => handleRemoveItem(index)}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan="3" className="text-right">
                                                <strong>Total:</strong>
                                            </td>
                                            <td>
                                                <strong>${calculateTotal().toFixed(2)}</strong>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || selectedItems.length === 0 || !customerName.trim()}
                        >
                            {loading ? 'Processing...' : 'Complete Purchase'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PurchasesPage;