create database restaurant_management;
use restaurant_management;

-- thông tin về nguyên liệu trong kho
create table ingredients (
    id int auto_increment primary key,
    name varchar(100) not null,  -- tên nguyên liệu 
    quantity float not null,  -- số lượng còn lại trong kho
    unit varchar(20) not null,  -- đơn vị đo lường 
    min_threshold float not null,  -- ngưỡng tối thiểu để cảnh báo thiếu nguyên liệu
    created_at timestamp default current_timestamp  -- thời gian nguyên liệu được thêm vào hệ thống
);

-- thông tin về món ăn trong menu nhà hàng
create table dishes (
    id int auto_increment primary key,
    name varchar(100) not null,  -- tên món ăn 
    price decimal(10,2) not null,  -- giá tiền của món ăn
    description text,  -- mô tả món ăn
    created_at timestamp default current_timestamp  -- thời gian món ăn được thêm vào menu
);
-- thông tin nhân viên và quản lý nhà hàng
create table users (
    id int auto_increment primary key,
    username varchar(50) unique not null,  -- tên đăng nhập
    password varchar(255) not null,  -- mật khẩu (được mã hóa để bảo mật)
    role enum('admin', 'chef', 'waiter') not null,  -- vai trò của người dùng
    created_at timestamp default current_timestamp  -- thời gian tài khoản được tạo
);


insert into ingredients (name, quantity, unit, min_threshold) values
('cá hồi', 5, 'kg', 1),
('cá ngừ', 4, 'kg', 1),
('cá bơn', 3, 'kg', 0.5),
('mực', 2, 'kg', 0.5),
('tôm', 3, 'kg', 0.5),
('gạo', 20, 'kg', 5),
('rong biển', 3, 'kg', 0.5);


insert into dishes (name, price, description) values
('sashimi cá hồi', 200.00, 'lát cá hồi tươi sống, phục vụ với wasabi và nước tương'),
('sashimi cá ngừ', 220.00, 'cá ngừ tươi sống, phục vụ với gừng và nước tương'),
('sashimi cá bơn', 250.00, 'lát cá bơn tươi, kết cấu mềm mại, phục vụ với wasabi'),
('sashimi mực', 190.00, 'mực tươi sống, giòn và ngọt, kèm theo nước tương'),
('sashimi tôm', 210.00, 'tôm ngọt tự nhiên, thái lát và ăn kèm gừng'),
('sushi cá hồi', 150.00, 'sushi làm từ cá hồi tươi ngon'),
('sushi cá ngừ', 160.00, 'sushi làm từ cá ngừ tươi'),
('sushi tôm', 170.00, 'sushi tôm ngon ngọt, ăn kèm với wasabi'),
('sushi lươn', 180.00, 'sushi lươn nướng thơm ngon, phủ sốt đặc biệt'),
('sushi bạch tuộc', 190.00, 'sushi bạch tuộc với nước sốt miso'),
('ramen truyền thống', 120.00, 'món mì nhật bản với nước dùng đậm đà');

insert into recipe (dish_id, ingredient_id, quantity_required, unit) values
(1, 1, 0.15, 'kg'), -- sashimi cá hồi cần 150g cá hồi
(2, 2, 0.15, 'kg'), -- sashimi cá ngừ cần 150g cá ngừ
(3, 3, 0.15, 'kg'), -- sashimi cá bơn cần 150g cá bơn
(4, 4, 0.15, 'kg'), -- sashimi mực cần 150g mực
(5, 5, 0.15, 'kg'), -- sashimi tôm cần 150g tôm
(6, 1, 0.1, 'kg'), -- sushi cá hồi cần 100g cá hồi
(6, 6, 0.2, 'kg'), -- sushi cá hồi cần 200g gạo
(6, 7, 0.05, 'kg'), -- sushi cá hồi cần 50g rong biển
(7, 2, 0.1, 'kg'), -- sushi cá ngừ cần 100g cá ngừ
(7, 6, 0.2, 'kg'), -- sushi cá ngừ cần 200g gạo
(7, 7, 0.05, 'kg'), -- sushi cá ngừ cần 50g rong biển
(8, 5, 0.1, 'kg'), -- sushi tôm cần 100g tôm
(8, 6, 0.2, 'kg'), -- sushi tôm cần 200g gạo
(8, 7, 0.05, 'kg'), -- sushi tôm cần 50g rong biển
(9, 5, 0.1, 'kg'), -- sushi lươn cần 100g lươn
(9, 6, 0.2, 'kg'), -- sushi lươn cần 200g gạo
(9, 7, 0.05, 'kg'), -- sushi lươn cần 50g rong biển
(10, 4, 0.1, 'kg'), -- sushi bạch tuộc cần 100g bạch tuộc
(10, 6, 0.2, 'kg'), -- sushi bạch tuộc cần 200g gạo
(10, 7, 0.05, 'kg'), -- sushi bạch tuộc cần 50g rong biển
(11, 6, 0.3, 'kg'); -- ramen cần 300g gạo


SELECT d.name AS dish_name, i.name AS ingredient_name, r.quantity_required, r.unit
FROM recipe r
JOIN dishes d ON r.dish_id = d.id
JOIN ingredients i ON r.ingredient_id = i.id
WHERE d.id = 6; -- kt sushi cá hồi

