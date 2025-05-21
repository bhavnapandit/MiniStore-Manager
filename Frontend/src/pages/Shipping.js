import "./Pages.css"

function ShippingPage() {
    // Sample data
    const shipments = [
        { id: "P001", customer: "John Doe", date: "2023-05-15", status: "delivered", tracking: "TRK123456" },
        { id: "P002", customer: "Jane Smith", date: "2023-05-10", status: "shipped", tracking: "TRK789012" },
        { id: "P003", customer: "Bob Johnson", date: "2023-05-05", status: "pending", tracking: "N/A" },
    ]

    return (
        <div className="page">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Shipping Status</h2>
                </div>
                <div className="card-content">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Purchase ID</th>
                                    <th>Customer</th>
                                    <th>Purchase Date</th>
                                    <th>Status</th>
                                    <th>Tracking Number</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.map((shipment) => (
                                    <tr key={shipment.id}>
                                        <td>{shipment.id}</td>
                                        <td>{shipment.customer}</td>
                                        <td>{shipment.date}</td>
                                        <td>
                                            <span
                                                className={`badge badge-${shipment.status === "delivered"
                                                        ? "success"
                                                        : shipment.status === "shipped"
                                                            ? "primary"
                                                            : "secondary"
                                                    }`}
                                            >
                                                {shipment.status}
                                            </span>
                                        </td>
                                        <td>{shipment.tracking}</td>
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
                    <h2 className="card-title">Update Shipping</h2>
                </div>
                <div className="card-content">
                    <form className="form">
                        <div className="form-group">
                            <label className="form-label">Purchase</label>
                            <select className="form-input">
                                <option value="">Select a purchase</option>
                                <option value="P001">P001 - John Doe</option>
                                <option value="P002">P002 - Jane Smith</option>
                                <option value="P003">P003 - Bob Johnson</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-input">
                                <option value="pending">Pending</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tracking Number</label>
                            <input type="text" className="form-input" placeholder="Enter tracking number" />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Update Shipping
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ShippingPage
