import React, { useState, useEffect } from "react";

const DiscountPage = () => {
    const [discounts, setDiscounts] = useState([]); // Danh sách giảm giá
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    //  Lấy danh sách giảm giá từ API
    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:8801/api/discount");
            if (!res.ok) throw new Error("Không thể lấy danh sách giảm giá!");

            const data = await res.json();
            console.log(" API response:", data);

            if (data.success && Array.isArray(data.discounts)) {
                setDiscounts(data.discounts);
            } else {
                setDiscounts([]); // Nếu không có giảm giá, đặt rỗng
            }

            setError(null);
        } catch (err) {
            setError(err.message);
            setDiscounts([]); // Nếu lỗi, không render `.map()`
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts(); // Lấy danh sách ngay khi vào trang
    }, []);

    //  Gọi API để tạo giảm giá tự động và cập nhật danh sách
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
                setDiscounts(prev => [...prev, data.discount]); //  Thêm món mới vào danh sách
            } else {
                fetchDiscounts(); // Nếu không có discount, gọi lại API
            }
        } catch (err) {
            alert("Lỗi khi tạo giảm giá!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Quản lý Giảm Giá</h2>

            <button 
                onClick={autoDiscount} 
                style={{ padding: "10px", background: "red", color: "white", marginBottom: "20px" }}
                disabled={loading}
            >
                {loading ? "Đang xử lý..." : "Giảm Giá Tự Động"}
            </button>

            <h3>Danh sách Giảm Giá</h3>

            {loading && <p>Đang tải dữ liệu...</p>}
            {error && <p style={{ color: "red" }}> {error}</p>}

            {Array.isArray(discounts) && discounts.length > 0 ? (
                <ul>
                    {discounts.map((d) => (
                        <li key={d.id}>
                              {d.value}% giảm giá
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
