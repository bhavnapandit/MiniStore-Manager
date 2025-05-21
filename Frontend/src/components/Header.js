import "./Header.css"

function Header({ title }) {
    return (
        <header className="header">
            <h1 className="header-title">{title}</h1>
            <div className="header-actions">
                <button className="btn btn-primary">Add New</button>
            </div>
        </header>
    )
}

export default Header
