import React, { useEffect, useState } from "react";
import "./IngredientDashboard.css";

const IngredientDashboard = () => {
    const [ingredients, setIngredients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [lowStockItems, setLowStockItems] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const response = await fetch("http://localhost:8801/api/ingredients");
            const data = await response.json();
            setIngredients(data);
            checkLowStock(data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu nguyên liệu:", error);
        }
    };

    const checkLowStock = (data) => {
        const lowStock = data.filter(item => item.quantity <= item.min_threshold);
        if (lowStock.length > 0) {
            setLowStockItems(lowStock);
            setShowPopup(true);
        }
    };

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5678");

        ws.onopen = () => {
            console.log("WebSocket đã kết nối.");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Dữ liệu WebSocket nhận được:", data);

                if (data.status === "update" && data.id && data.quantity !== undefined) {
                    setIngredients((prevIngredients) => {
                        const updatedIngredients = prevIngredients.map((ingredient) =>
                            ingredient.id === data.id
                                ? { ...ingredient, quantity: data.quantity }
                                : ingredient
                        );
                        checkLowStock(updatedIngredients);
                        return updatedIngredients;
                    });
                }
            } catch (err) {
                console.error("Lỗi parse dữ liệu WebSocket:", err);
            }
        };

        ws.onerror = (error) => {
            console.error("Lỗi WebSocket:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket đã đóng, đang thử lại...");
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div className="dashboard-container">
            <h2>📦 Quản lý Nguyên Liệu</h2>

            <input
                type="text"
                placeholder="🔍 Tìm nguyên liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />

            <table className="ingredients-table">
                <thead>
                    <tr>
                        <th>Tên nguyên liệu</th>
                        <th>Số lượng</th>
                        <th>Đơn vị</th>
                    </tr>
                </thead>
                <tbody>
                    {ingredients
                        .filter(ingredient =>
                            ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(ingredient => (
                            <tr key={ingredient.id}>
                                <td>{ingredient.name}</td>
                                <td className={`quantity-cell ${ingredient.quantity <= ingredient.min_threshold ? "low-stock" : ""}`}>
                                    {ingredient.quantity}
                                </td>
                                <td>{ingredient.unit}</td>
                            </tr>
                        ))}
                </tbody>
            </table>

            {showPopup && (
                <>
                    <div className="popup-overlay"></div> 
                    <div className="popup">
                        <div className="popup-content">
                            <h3>Cảnh báo nguyên liệu sắp hết!</h3>
                            <ul>
                                {lowStockItems.map((item) => (
                                    <li key={item.id}>{item.name}: {item.quantity} {item.unit}</li>
                                ))}
                            </ul>
                            <button onClick={() => setShowPopup(false)}>Đóng</button>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default IngredientDashboard;
