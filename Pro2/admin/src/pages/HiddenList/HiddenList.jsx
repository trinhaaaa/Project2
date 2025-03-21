import React, { useEffect, useState } from "react";
import { showToast } from "../../components/Notification/ToastProvider";
import "./HiddenList.css"; 

const HiddenList = () => {
  const [hiddenList, setHiddenList] = useState([]);

  //  ăn bị ẩn
  const fetchHiddenList = async () => {
    try {
      const res = await fetch("http://localhost:8801/api/hiddenProducts");
      if (!res.ok) {
        throw new Error("Failed to fetch hidden product list.");
      }
      const data = await res.json();
      setHiddenList(data);
    } catch (err) {
      console.error("Error fetching hidden product list:", err.message);
    }
  };

  // Khôi phục món ăn (đặt `deleted = 0`)
  const restoreFood = async (product_id) => {
    try {
      const response = await fetch("http://localhost:8801/api/restoreItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to restore item ${product_id}`);
      }

      await response.json();
      showToast("Restored successfully!", "success");

      // Cập nhật lại danh sách sau khi khôi phục món ăn
      setHiddenList(hiddenList.filter(item => item.product_id !== product_id));
    } catch (err) {
      showToast(err.message, "error");
      console.error("Error restoring item:", err.message);
    }
  };

  useEffect(() => {
    fetchHiddenList();
  }, []);

  return (
    <div className="list-container">
      <h2>Hidden Foods List</h2>
      <table className="list-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Product ID</th>
            <th>Name</th>
            <th>Category ID</th>
            <th>Category Name</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {hiddenList.map((item, index) => {
            const imgPath = `/public/${item.thumbnail}.jpg`;

            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <img className="food-image" src={imgPath} alt={item.name} />
                </td>
                <td>{item.product_id}</td>
                <td>{item.name}</td>
                <td>{item.category_id}</td>
                <td>on upload</td>
                <td>{item.price},000 VND</td>
                <td>
                  <button className="restore-btn" onClick={() => restoreFood(item.product_id)}>
                    Khôi phục
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HiddenList;
