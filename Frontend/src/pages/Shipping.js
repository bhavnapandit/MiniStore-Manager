import { useEffect, useState } from "react";
import "./Pages.css";

function ShippingPage() {
    const [inventory, setInventory] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [shippingRecords, setShippingRecords] = useState([]);
    const [form, setForm] = useState({
        purchase_id: "",
        shipping_date: new Date().toISOString().slice(0, 10),
        shipping_address: "",
        status: "pending",
        items: [{ item_id: "", quantity: 1 }],
    });

    useEffect(() => {
        fetchInventory();
        fetchPurchases();
        fetchShippingRecords();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/items-with-inventory");
            if (!res.ok) throw new Error("Failed to fetch items");
            const data = await res.json();
            setInventory(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPurchases = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/purchase");
            if (!res.ok) throw new Error("Failed to fetch purchases");
            const data = await res.json();
            console.log(data);

            setPurchases(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchShippingRecords = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/shipping");
            if (!res.ok) throw new Error("Failed to fetch shipping records");
            const data = await res.json();
            setShippingRecords(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFormChange = (index, e) => {
        const { name, value } = e.target;
        const updatedItems = [...form.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [name]: name === "quantity" ? Number(value) : value,
        };
        setForm({ ...form, items: updatedItems });
    };

    const addItemRow = () => {
        setForm({ ...form, items: [...form.items, { item_id: "", quantity: 1 }] });
    };

    const removeItemRow = (index) => {
        if (form.items.length <= 1) return; // keep at least one item row
        const updatedItems = form.items.filter((_, i) => i !== index);
        setForm({ ...form, items: updatedItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check stock
        const hasInsufficientStock = form.items.some(({ item_id, quantity }) => {
            const inv = inventory.find((item) => item.id === parseInt(item_id));
            return !inv || inv.stock < quantity;
        });

        if (hasInsufficientStock) {
            alert("Insufficient stock for one or more items.");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/shipping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            console.log(inventory);

            if (!res.ok) throw new Error(data.error || "Failed to record shipment");

            alert("Shipment recorded successfully");
            // Reset form
            setForm({
                purchase_id: "",
                shipping_date: new Date().toISOString().slice(0, 10),
                shipping_address: "",
                status: "pending",
                items: [{ item_id: "", quantity: 1 }],
            });

            // Refresh data
            fetchInventory();
            fetchShippingRecords();
        } catch (err) {
            alert(err.message);
        }
    };
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/shipping/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete purchase');

            alert('Shipment deleted successfully!');
            await fetchShippingRecords()
        } catch (error) {
            console.error('Error deleting Shipment:', error);
            alert(`Error: ${error.message}`);
        }
    }

    return (
        <div className="shipping-page">
            <div className="page-grid">
                {/* Shipping Records */}
                <div className="shipping-records-section">
                    <div className="card records-card">
                        <div className="card-header">
                            <div className="header-content">
                                <h2 className="card-title">Recent Shipments</h2>
                                <div className="records-summary">
                                    <span className="total-records">{shippingRecords.length} shipments</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="table-container">
                                <table className="records-table">
                                    <thead>
                                        <tr>
                                            <th>Shipment ID</th>
                                            <th>Purchase Order</th>
                                            <th>Shipping Date</th>
                                            <th>Address</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shippingRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="empty-state">
                                                    No shipping records found
                                                </td>
                                            </tr>
                                        ) : (
                                            shippingRecords.map((record) => (
                                                <tr key={record.id}>
                                                    <td>{record.id}</td>
                                                    <td>PO-{record.purchase_id}</td>
                                                    <td>{new Date(record.shipping_date).toLocaleDateString()}</td>
                                                    <td>{record.shipping_address || "Not specified"}</td>
                                                    <td>
                                                        <span className={`status-indicator ${record.status}`}>
                                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className=" btn btn-danger" onClick={() => handleDelete(record.id)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipment Form */}
                <div className="form-section">
                    <div className="card shipment-card">
                        <div className="card-header">
                            <div className="header-content">
                                <h2 className="card-title">Record Outbound Shipment</h2>
                                <p className="card-description">Ship items to customers and update inventory</p>
                            </div>
                        </div>
                        <div className="card-content">
                            <form className="shipment-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">
                                            Purchase Order<span className="required">*</span>
                                        </label>
                                        <select
                                            name="purchase_id"
                                            className="form-input select-input"
                                            value={form.purchase_id}
                                            onChange={(e) => setForm({ ...form, purchase_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select purchase order...</option>
                                            {purchases.map((purchase) => (
                                                <option key={purchase.id} value={purchase.id}>
                                                    PO {purchase.id} - {purchase.customer_name || "Unknown Supplier"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Shipping Date<span className="required">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-input date-input"
                                            value={form.shipping_date}
                                            onChange={(e) => setForm({ ...form, shipping_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Shipping Address</label>
                                        <textarea
                                            className="form-input textarea-input"
                                            value={form.shipping_address}
                                            onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                                            placeholder="Enter shipping address..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select
                                            name="status"
                                            className="form-input select-input"
                                            value={form.status}
                                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="items-section">
                                    <div className="section-header">
                                        <label className="form-label section-label">
                                            Items to Ship<span className="required">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            className="btn btn-secondary add-item-btn"
                                            onClick={addItemRow}
                                        >
                                            <span className="btn-icon">+</span> Add Item
                                        </button>
                                    </div>

                                    <div className="items-list">
                                        {form.items.map((item, index) => {
                                            const inventoryItem = inventory.find(
                                                (inv) => inv.id === parseInt(item.item_id)
                                            );
                                            const availableStock = inventoryItem?.stock || 0;
                                            const isInsufficientStock = item.quantity > availableStock;

                                            return (
                                                <div
                                                    key={index}
                                                    className={`item-row ${isInsufficientStock ? "insufficient-stock" : ""}`}
                                                >
                                                    <div className="item-row-content">
                                                        <div className="item-select-group">
                                                            <select
                                                                name="item_id"
                                                                value={item.item_id}
                                                                onChange={(e) => handleFormChange(index, e)}
                                                                required
                                                                className="form-input item-select"
                                                            >
                                                                <option value="">Select item...</option>
                                                                {inventory.map((inv) => (
                                                                    <option key={inv.id} value={inv.id}>
                                                                        {inv.name} (Available: {inv.stock})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="quantity-group">
                                                            <input
                                                                name="quantity"
                                                                type="number"
                                                                min="1"
                                                                max={availableStock}
                                                                value={item.quantity}
                                                                onChange={(e) => handleFormChange(index, e)}
                                                                className="form-input quantity-input"
                                                                placeholder="Qty"
                                                                required
                                                            />

                                                        </div>

                                                        {form.items.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger remove-btn"
                                                                onClick={() => removeItemRow(index)}
                                                                title="Remove item"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary submit-btn">
                                        <span className="btn-icon">🚚</span> Record Shipment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShippingPage;
