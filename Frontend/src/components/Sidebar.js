import "./Sidebar.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';

function Sidebar({ activePage, setActivePage }) {
    return (
        <div class="sidebar">
            <div class="sidebar-header">
                <FontAwesomeIcon icon={faStore} className="store-icon" />
                <h1 class="sidebar-title">MiniStore Manager</h1>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li className={activePage === "items" ? "active" : ""} onClick={() => setActivePage("items")}>
                        Items
                    </li>
                    <li className={activePage === "inventory" ? "active" : ""} onClick={() => setActivePage("inventory")}>
                        Inventory
                    </li>
                    <li className={activePage === "purchases" ? "active" : ""} onClick={() => setActivePage("purchases")}>
                        Purchases
                    </li>
                    <li className={activePage === "shipping" ? "active" : ""} onClick={() => setActivePage("shipping")}>
                        Shipping
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Sidebar
