import React, { useState, useEffect } from "react";
import "./DiscountPage.css"; // Import CSS

const DiscountPage = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:8801/api/discount");
            if (!res.ok) throw new Error("Không thể lấy danh sách giảm giá!");

            const data = await res.json();
            if (data.success && Array.isArray(data.discounts)) {
                setDiscounts(data.discounts);
            } else {
                setDiscounts([]);
            }

            setError(null);
        } catch (err) {
            setError(err.message);
            setDiscounts([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteAllDiscounts = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:8801/api/discount/delete-all", {
                method: "DELETE"
            });

            const data = await res.json();
            alert(data.message);

            if (data.success) {
                setDiscounts([]);
            }
        } catch (err) {
            alert("Lỗi khi xóa giảm giá!");
        } finally {
            setLoading(false);
        }
    };

    const autoDiscount = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:8801/api/discount/auto-discount", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();
            alert(data.message);

            if (data.success && data.discount) {
                setDiscounts(prev => [...prev, data.discount]);
            } else {
                fetchDiscounts();
            }
        } catch (err) {
            alert("Lỗi khi tạo giảm giá!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="discount-container">
            <h2>Quản lý Giảm Giá</h2>

         
            <div className="button-group">
                <button
                    onClick={autoDiscount}
                    className="discount-button auto-discount"
                    disabled={loading}
                >
                    {loading ? "Đang xử lý..." : "Giảm Giá Tự Động"}
                </button>

                <button
                    onClick={deleteAllDiscounts}
                    className="discount-button delete-discount"
                    disabled={loading}
                >
                    {loading ? "Đang xóa..." : "Xóa Giảm Giá"}
                </button>
            </div>

            <h3>Danh sách Giảm Giá</h3>

            {loading && <p className="loading-text">Đang tải dữ liệu...</p>}
            {error && <p className="error-text">{error}</p>}

            {Array.isArray(discounts) && discounts.length > 0 ? (
                <ul className="discount-list">
                    {discounts.map((d) => (
                        <li key={d.id} className="discount-item">
                            <img
                                src={`/${d.dish_image}.jpg`}
                                alt={d.dish_name}
                                className="discount-image"
                            />
                            <div className="discount-info">
                                <span className="discount-name">{d.dish_name}</span>
                                <span className="discount-value">{d.value}%</span> giảm giá
                            </div>
                        </li>
                    ))}
                </ul>

            ) : (
                <p>Không có giảm giá nào.</p>
            )}
        </div>
    );
};

export default DiscountPage;
