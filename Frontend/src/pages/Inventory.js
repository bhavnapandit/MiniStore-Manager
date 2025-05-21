import "./Pages.css"

function InventoryPage() {
    // Sample data
    const inventory = [
        { id: 1, itemName: "T-Shirt", price: 19.99, quantity: 100, lastUpdated: "2023-05-15" },
        { id: 2, itemName: "Jeans", price: 49.99, quantity: 50, lastUpdated: "2023-05-10" },
        { id: 3, itemName: "Sneakers", price: 79.99, quantity: 30, lastUpdated: "2023-05-05" },
    ]

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
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.itemName}</td>
                                        <td>${item.price.toFixed(2)}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.lastUpdated}</td>
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
