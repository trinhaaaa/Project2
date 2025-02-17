import React, { useContext } from "react";
import "./ExploreMenu.css";
import { StoreContext } from "../../Context/StoreContext";

const ExploreMenu = ({ category, setCategory }) => {
  // Giả sử trong context bạn có 3 dữ liệu: 
  // menu_list: danh sách các món (bao gồm product_id, name, thumbnail, category_id, ...)
  // recipeList: danh sách công thức (mỗi phần tử có product_id, ingredient_id, quantity_required, unit)
  // ingredientList: danh sách nguyên liệu (mỗi phần tử có id, name, quantity, unit, min_threshold)
  const { menu_list, recipeList, ingredientList } = useContext(StoreContext);

  // Hàm tính số món có thể làm được cho 1 món ăn dựa vào nguyên liệu còn lại
  const getAvailableDishCount = (dish) => {
    if (!recipeList || !ingredientList) return 0; // Ensure recipeList and ingredientList are not undefined

    // Lấy các công thức tương ứng với dish
    const recipesForDish = recipeList.filter((r) => r.product_id === dish.product_id);
    if (recipesForDish.length === 0) return 0;

    // Với mỗi nguyên liệu cần cho món, tính số món tối đa có thể làm được
    const counts = recipesForDish.map((recipe) => {
      // Tìm nguyên liệu tương ứng trong ingredientList
      const ingredient = ingredientList.find((ing) => ing.id === recipe.ingredient_id);
      // Nếu không có nguyên liệu thì xem như số lượng 0
      if (!ingredient) return 0;
      // Số món tối đa dựa trên nguyên liệu này
      return Math.floor(ingredient.quantity / recipe.quantity_required);
    });
    
    // Số món có thể làm được của món ăn là giá trị nhỏ nhất
    return Math.min(...counts);
  };

  if (!menu_list || !recipeList || !ingredientList) {
    return <div>Loading...</div>;  // Add a loading state if data is not available yet
  }

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore our menu</h1>
      <p className="menu-text">
        Celebration of flavors &amp; aromas carefully curated to tantalize your taste buds.
      </p>

      <div className="menu-list">
        {menu_list.map((item, index) => {
          const menuPath = item.thumbnail + ".jpg";
          // Tính số món có thể làm được từ nguyên liệu hiện có cho món này
          const availableCount = getAvailableDishCount(item);

          return (
            <div
              onClick={() =>
                setCategory((prev) => (prev === item.category_id ? "All" : item.category_id))
              }
              key={index}
              className="menu-item"
            >
              <div className="menu-img-container">
                <img
                  className={category === item.category_id ? "active" : ""}
                  src={menuPath}
                  alt={item.name}
                />
              </div>
              <p className="menu-name">{item.name}</p>
              {/* Hiển thị số món có thể làm được */}
              <p className="available-count">Available: {availableCount}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExploreMenu;
