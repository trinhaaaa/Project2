import { useState, useEffect } from 'react';

const WebSocketURL = "ws://localhost:8080"; // Địa chỉ WebSocket

function Inventory() {
    const [ingredients, setIngredients] = useState([]);

    useEffect(() => {
        const ws = new WebSocket(WebSocketURL);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setIngredients(prev => prev.map(ing => 
                ing.id === data.ingredient_id ? { ...ing, quantity: data.quantity } : ing
            ));
        };

        return () => ws.close();
    }, []);

    return (
        <div>
            <h2>Danh sách nguyên liệu</h2>
            <ul>
                {ingredients.map(ing => (
                    <li key={ing.id}>{ing.name}: {ing.quantity} {ing.unit}</li>
                ))}
            </ul>
        </div>
    );
}

export default Inventory;
