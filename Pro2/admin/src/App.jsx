import React from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import { Route, Routes } from "react-router-dom";
import List from "./pages/List/List";
import Order from "./pages/Orders/Orders.jsx";
import IngredientDashboard from "./components/IngredientDashboard.jsx"; // Cập nhật đường dẫn import

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/list" element={<List />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/ingredients" element={<IngredientDashboard />} /> {/* Thêm route mới */}
        </Routes>
      </div>
    </div>
  );
};

export default App;
