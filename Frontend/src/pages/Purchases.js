import "./Pages.css"

function PurchasesPage() {
    // Sample data
    const purchases = [
        { id: "P001", customer: "John Doe", date: "2023-05-15", total: 69.98 },
        { id: "P002", customer: "Jane Smith", date: "2023-05-10", total: 129.97 },
        { id: "P003", customer: "Bob Johnson", date: "2023-05-05", total: 19.99 },
    ]

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
                                {purchases.map((purchase) => (
                                    <tr key={purchase.id}>
                                        <td>{purchase.id}</td>
                                        <td>{purchase.customer}</td>
                                        <td>{purchase.date}</td>
                                        <td>${purchase.total.toFixed(2)}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button className="btn btn-secondary">View</button>
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
                    <h2 className="card-title">New Purchase</h2>
                </div>
                <div className="card-content">
                    <form className="form">
                        <div className="form-group">
                            <label className="form-label">Customer Name</label>
                            <input type="text" className="form-input" placeholder="Customer name" />
                        </div>

                        <div className="form-group">
                            <h3 className="form-section-title">Add Items</h3>
                            <div className="flex gap-2 mb-4">
                                <select className="form-input">
                                    <option value="">Select an item</option>
                                    <option value="1">T-Shirt - $19.99</option>
                                    <option value="2">Jeans - $49.99</option>
                                    <option value="3">Sneakers - $79.99</option>
                                </select>
                                <input type="number" className="form-input" placeholder="Qty" min="1" style={{ width: "80px" }} />
                                <button type="button" className="btn btn-secondary">
                                    Add
                                </button>
                            </div>
                        </div>

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
                                    <tr>
                                        <td>T-Shirt</td>
                                        <td>1</td>
                                        <td>$19.99</td>
                                        <td>$19.99</td>
                                        <td>
                                            <button className="btn btn-danger">Remove</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="text-right">
                                            <strong>Total:</strong>
                                        </td>
                                        <td>
                                            <strong>$19.99</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Complete Purchase
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PurchasesPage
