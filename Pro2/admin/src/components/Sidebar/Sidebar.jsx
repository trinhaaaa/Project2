import React from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
      <NavLink to="/discount" className="sidebar-option">
          <img src={assets.discount_icon} alt="discount" /> 
          <p>discount</p>
        </NavLink>
        <NavLink to="/ingredients" className="sidebar-option">
          <img src={assets.ingredient_icon} alt="Ingredients" />
          <p>Ingredients</p>
        </NavLink>
        <NavLink to="/add" className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Add Items</p>
        </NavLink>
        <NavLink to="/list" className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>List Items</p>
        </NavLink>
        <NavLink to="/orders" className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>
        {}
        <NavLink to="/hidden" className="sidebar-option">
          <img src={assets.hidden_icon} alt="" /> 
          <p>Hidden Items</p>
        </NavLink>

      </div>
    </div>
  );
};

export default Sidebar;
