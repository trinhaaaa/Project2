import React, { useEffect, useState } from "react";

const IngredientDashboard = () => {
    const [ingredients, setIngredients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

   
    useEffect(() => {
        fetch("http://localhost:8801/api/ingredients")
            .then(response => response.json())
            .then(data => setIngredients(data))
            .catch(error => console.error("Lỗi lấy dữ liệu nguyên liệu:", error));
    }, []);

  
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080"); 

        ws.onopen = () => {
            console.log("Kết nối WebSocket đã mở.");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Dữ liệu WebSocket nhận được:", data);
                
             
                setIngredients(prevIngredients =>
                    prevIngredients.map(ingredient =>
                        ingredient.id === data.ingredient_id
                            ? { ...ingredient, quantity: data.quantity }
                            : ingredient
                    )
                );
            } catch (err) {
                console.error("Lỗi parse dữ liệu WebSocket:", err);
            }
        };

        ws.onerror = (error) => {
            console.error("Lỗi WebSocket:", error);
        };

        ws.onclose = () => {
            console.log("Kết nối WebSocket đã đóng.");
        };

        return () => {
            ws.close();
        };
    }, []);


    const filteredIngredients = ingredients.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  
    const handleCreateIngredient = () => {
        if (searchTerm.trim() === "") return;  

       
        const existingUnit = ingredients.length > 0 ? ingredients[0].unit : "kg";

        const newIngredient = {
            name: searchTerm,
            quantity: 0,  
            unit: existingUnit,
            min_threshold: 0.5  
        };

       
        fetch("http://localhost:8801/api/ingredients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newIngredient),
        })
            .then(response => response.json())
            .then(data => {
                console.log("Nguyên liệu mới đã tạo:", data);
                setIngredients([...ingredients, data]); 
            })
            .catch(error => console.error("Lỗi tạo nguyên liệu:", error));
    };

    return (
        <div>
            <h2>Quản lý Nguyên Liệu</h2>

     
            <input 
                type="text"
                placeholder="Tìm nguyên liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: "10px", padding: "5px", width: "200px" }}
            />
            
           
            {filteredIngredients.length === 0 && searchTerm.trim() !== "" && (
                <button onClick={handleCreateIngredient} style={{ marginLeft: "10px", padding: "5px" }}>
                    Tạo nguyên liệu mới
                </button>
            )}

            <table border="1">
                <thead>
                    <tr>
                        <th>Tên nguyên liệu</th>
                        <th>Số lượng</th>
                        <th>Đơn vị</th>
                        <th>Cảnh báo</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredIngredients.length > 0 ? (
                        filteredIngredients.map(ingredient => (
                            <tr key={ingredient.id}>
                                <td>{ingredient.name}</td>
                                <td>{ingredient.quantity}</td>
                                <td>{ingredient.unit}</td>
                                <td>{ingredient.quantity < ingredient.min_threshold ? "Cần nhập hàng!" : "Đủ"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">Không tìm thấy nguyên liệu</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default IngredientDashboard;
