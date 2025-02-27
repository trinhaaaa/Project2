import React from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import { Route, Routes } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Order from "./pages/Orders/Orders.jsx";
import IngredientDashboard from "./pages/IngredientDashboard/IngredientDashboard.jsx";
import HiddenList from "./pages/HiddenList/HiddenList.jsx";
import DiscountPage from "./pages/DiscountPage/DiscountPage"; 

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/add" element={<Add />} />
          <Route path="/list" element={<List />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/ingredients" element={<IngredientDashboard />} />
          <Route path="/hidden" element={<HiddenList />} />
          <Route path="/discount" element={<DiscountPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
