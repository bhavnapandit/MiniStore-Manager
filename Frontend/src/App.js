"use client"

import { useState } from "react"
import "./App.css"
import ItemsPage from "./pages/Items"
import InventoryPage from "./pages/Inventory"
import PurchasesPage from "./pages/Purchases"
import ShippingPage from "./pages/Shipping"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"


function App() {
  const [activePage, setActivePage] = useState("items")

  const renderPage = () => {
    switch (activePage) {
      case "items":
        return <ItemsPage />
      case "inventory":
        return <InventoryPage />
      case "purchases":
        return <PurchasesPage />
      case "shipping":
        return <ShippingPage />
      default:
        return <ItemsPage />
    }
  }

  return (
    <div className="app">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main-content">
        <Header title={activePage.charAt(0).toUpperCase() + activePage.slice(1)} />
        {renderPage()}
      </div>
    </div>
  )
}

export default App

