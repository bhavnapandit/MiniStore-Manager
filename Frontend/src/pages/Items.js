import "./Pages.css"

function ItemsPage() {
    // Sample data - in a real app, this would come from a database
    const items = [
        { id: 1, name: "T-Shirt", description: "Cotton t-shirt", price: 19.99, createdAt: "2023-05-15" },
        { id: 2, name: "Jeans", description: "Blue denim jeans", price: 49.99, createdAt: "2023-05-10" },
        { id: 3, name: "Sneakers", description: "Running shoes", price: 79.99, createdAt: "2023-05-05" },
    ]

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
                                        <td>${item.price.toFixed(2)}</td>
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
