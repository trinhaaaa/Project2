import React, { useEffect, useState } from "react";

const IngredientDashboard = () => {
    const [ingredients, setIngredients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // **1️⃣ Fetch dữ liệu ban đầu từ API**
    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const response = await fetch("http://localhost:8801/api/ingredients");
            const data = await response.json();
            setIngredients(data);
        } catch (error) {
            console.error("❌ Lỗi lấy dữ liệu nguyên liệu:", error);
        }
    };

    // **2️⃣ WebSocket: Nhận cập nhật ngay lập tức từ ESP32**
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5678");

        ws.onopen = () => {
            console.log("✅ WebSocket đã kết nối.");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("📩 Dữ liệu WebSocket nhận được:", data);

                if (data.status === "update" && data.id && data.quantity !== undefined) {
                    setIngredients((prevIngredients) =>
                        prevIngredients.map((ingredient) =>
                            ingredient.id === data.id
                                ? { ...ingredient, quantity: data.quantity } // 🔥 Cập nhật ngay lập tức
                                : ingredient
                        )
                    );
                }
            } catch (err) {
                console.error("❌ Lỗi parse dữ liệu WebSocket:", err);
            }
        };

        ws.onerror = (error) => {
            console.error("❌ Lỗi WebSocket:", error);
        };

        ws.onclose = () => {
            console.log("⚠️ WebSocket đã đóng, đang thử lại...");
            setTimeout(() => {
                window.location.reload(); // 🔄 Nếu mất kết nối, tự động tải lại trang
            }, 5000);
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div>
            <h2>📦 Quản lý Nguyên Liệu</h2>

            <input 
                type="text"
                placeholder="🔍 Tìm nguyên liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: "10px", padding: "5px", width: "200px" }}
            />
            
            <table border="1">
                <thead>
                    <tr>
                        <th>📋 Tên nguyên liệu</th>
                        <th>⚖️ Số lượng</th>
                        <th>📏 Đơn vị</th>
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
                                <td style={{ fontWeight: "bold", color: "green" }}>
                                    {ingredient.quantity}
                                </td>
                                <td>{ingredient.unit}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default IngredientDashboard;
