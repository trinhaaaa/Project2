import React, { useEffect, useState } from "react";
import FoodItem from "../FoodItem/FoodItem";
import "./ShowTopFood.css";
import { FaTag } from "react-icons/fa";

const DiscountSection = () => {
  const [discountItems, setDiscountItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchDiscountItems = async () => {
      try {
        const response = await fetch("http://localhost:8801/api/discount");
        const data = await response.json();
        
        if (data.success) {
          setDiscountItems(data.discounts);
        } else {
          setErrorMessage("No promotions found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Server connection error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscountItems();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleItems = discountItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(discountItems.length / itemsPerPage);

  return (
    <section className="discount-section">
      <header className="section-header">
        <FaTag className="tag-icon" />
        <h2>Special Promotions</h2>
      </header>

      {isLoading ? (
        <div className="loading-indicator">Loading promotions...</div>
      ) : errorMessage ? (
        <div className="error-message">{errorMessage}</div>
      ) : (
        <>
          <div className="discount-grid">
            {visibleItems.map((item) => (
              <div key={item.id} className="food-item-wrapper">
                <FoodItem
                  id={item.id}
                  name={item.dish_name}
                  price={item.dish_price}
                  discount={item.value}
                  image={`public/${item.dish_image}.jpg`}
                  showSoldOut={false}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="page-control">
              <button 
                className="page-button" 
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage}/{totalPages}
              </span>
              <button
                className="page-button"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default DiscountSection; 