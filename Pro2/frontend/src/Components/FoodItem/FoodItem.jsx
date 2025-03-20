// import React, { useContext, useState, useEffect } from "react";
// import "./FoodItem.css";
// import { StoreContext } from "../../Context/StoreContext";
// import { assets } from "../../assets/assets";
// import { socket, eventEmitter } from "../../websocket"; 

// const FoodItem = ({ id, name, price, description, rate, image, showSoldOut = true, discountCode = null }) => {
//   const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
//   const [isSoldOut, setIsSoldOut] = useState(false);
//   const [discountAmount, setDiscountAmount] = useState(0);

//   useEffect(() => {
//     if (showSoldOut) {
//       const checkStock = async () => {
//         try {
//           const response = await fetch(`http://localhost:8801/api/check-stock/${id}`);
//           const data = await response.json();
//           setIsSoldOut(data.isSoldOut);
//         } catch (error) {
//           console.error("Lỗi kiểm tra tồn kho:", error);
//         }
//       };

//       checkStock();

//       const handleStockUpdate = (data) => {
//         if (data.id === id) {
//           setIsSoldOut(data.isSoldOut);
//         }
//       };

//       eventEmitter.on("stockUpdate", handleStockUpdate);

//       return () => {
//         eventEmitter.off("stockUpdate", handleStockUpdate);
//       };
//     }
//   }, [id, showSoldOut]);

//   useEffect(() => {
//     const checkDiscount = async () => {
//       try {
//         const response = await fetch(`http://localhost:8801/api/discount`);
//         const data = await response.json();
//         if (data.success && data.discounts) {
//           const discountItem = data.discounts.find((item) => item.dish_name === name);
//           if (discountItem) {
//             setDiscountAmount(discountItem.value);
//           } else {
//             setDiscountAmount(0);
//           }
//         }
//       } catch (error) {
//         console.error("Lỗi kiểm tra danh sách giảm giá:", error);
//         setDiscountAmount(0);
//       }
//     };
//     checkDiscount();
//   }, [name]);

//   const discountedPrice = (price * (1 - discountAmount / 100)).toFixed(0);

//   return (
//     <div className={`food-item-container ${isSoldOut && showSoldOut ? "sold-out" : ""}`}>
//       <div className="food-item-image-wrapper">
//         <img className="food-item-image" src={image} alt={name} />
//         {discountAmount > 0 && <span className="discount-tag">-{discountAmount}%</span>} 
//       </div>

//       {isSoldOut && showSoldOut ? (
//         <p className="sold-out-text"></p> 
//       ) : !cartItems[id] ? (
//         <p onClick={() => addToCart(id)} className="plus">+</p>
//       ) : (
//         <div className="food-item-counter">
//           <img onClick={() => removeFromCart(id)} src={assets.remove_icon} alt="remove" />
//           <p>{cartItems[id]}</p>
//           <img onClick={() => addToCart(id)} src={assets.add_icon} alt="add" />
//         </div>
//       )}

//       <div className="food-item-info">
//         <h4 className="food-item-name">{name}</h4>
//         <img className="food-item-rate" src="public/rate.png" alt="rating" />
//         <p className="food-item-price">
//           {discountAmount > 0 ? (
//             <span className="old-price" style={{ textDecoration: "line-through", color: "gray" }}>
//               {price},000 vnd
//             </span>
//           ) : null}
//           <br></br>
//           <span className="new-price">
//             {discountAmount > 0 ? discountedPrice : price},000<i>vnd</i>
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default FoodItem;

import React, { useContext, useState, useEffect } from "react";
import "./FoodItem.css";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";
import { socket } from "../../websocket"; 

const FoodItem = ({ id, name, price, description, rate, image, showSoldOut = true, discountCode = null }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (showSoldOut) {
      const checkStock = async () => {
        try {
          const response = await fetch(`http://localhost:8801/api/check-stock/${id}`);
          const data = await response.json();
          setIsSoldOut(data.isSoldOut);
        } catch (error) {
          console.error("Lỗi kiểm tra tồn kho:", error);
        }
      };

      checkStock();

      // Lắng nghe WebSocket
      socket.onmessage = (event) => {
        try {
          const stockData = JSON.parse(event.data);
          if (stockData.status === "update") {
            stockData.updates.forEach((update) => {
              if (update.id === id) {
                setIsSoldOut(update.isSoldOut);
              }
            });
          }
        } catch (error) {
          console.error("Lỗi xử lý dữ liệu WebSocket:", error);
        }
      };

      return () => {
        socket.onmessage = null; // Cleanup
      };
    }
  }, [id, showSoldOut]);

  useEffect(() => {
    const checkDiscount = async () => {
      try {
        const response = await fetch(`http://localhost:8801/api/discount`);
        const data = await response.json();
        if (data.success && data.discounts) {
          const discountItem = data.discounts.find((item) => item.dish_name === name);
          if (discountItem) {
            setDiscountAmount(discountItem.value);
          } else {
            setDiscountAmount(0);
          }
        }
      } catch (error) {
        console.error("Lỗi kiểm tra danh sách giảm giá:", error);
        setDiscountAmount(0);
      }
    };
    checkDiscount();
  }, [name]);

  const discountedPrice = (price * (1 - discountAmount / 100)).toFixed(0);

  return (
    <div className={`food-item-container ${isSoldOut && showSoldOut ? "sold-out" : ""}`}>
      <div className="food-item-image-wrapper">
        <img className="food-item-image" src={image} alt={name} />
        {discountAmount > 0 && <span className="discount-tag">-{discountAmount}%</span>} 
      </div>

      {isSoldOut && showSoldOut ? (
        <p className="sold-out-text">Hết hàng</p> 
      ) : !cartItems[id] ? (
        <p onClick={() => addToCart(id)} className="plus">+</p>
      ) : (
        <div className="food-item-counter">
          <img onClick={() => removeFromCart(id)} src={assets.remove_icon} alt="remove" />
          <p>{cartItems[id]}</p>
          <img onClick={() => addToCart(id)} src={assets.add_icon} alt="add" />
        </div>
      )}

      <div className="food-item-info">
        <h4 className="food-item-name">{name}</h4>
        <img className="food-item-rate" src="public/rate.png" alt="rating" />
        <p className="food-item-price">
          {discountAmount > 0 ? (
            <span className="old-price" style={{ textDecoration: "line-through", color: "gray" }}>
              {price},000 vnd
            </span>
          ) : null}
          <br></br>
          <span className="new-price">
            {discountAmount > 0 ? discountedPrice : price},000<i>vnd</i>
          </span>
        </p>
      </div>
    </div>
  );
};

export default FoodItem;
