import { io } from "socket.io-client";
import { EventEmitter } from "events";

// Tạo một instance EventEmitter để các component có thể lắng nghe sự kiện
export const eventEmitter = new EventEmitter();

// Kết nối tới WebSocket server
export const socket = io("ws://localhost:5678", {
  transports: ["websocket"],
  reconnectionAttempts: 5, // Thử kết nối lại 5 lần nếu bị mất kết nối
  reconnectionDelay: 3000, // Mỗi lần thử lại cách nhau 3 giây
});

socket.on("connect", () => {
  console.log("WebSocket kết nối thành công!");
});

socket.on("disconnect", (reason) => {
  console.warn(" WebSocket bị ngắt kết nối:", reason);
});

socket.on("error", (error) => {
  console.error(" WebSocket lỗi:", error);
});

// Nhận sự kiện cập nhật số lượng nguyên liệu từ server
socket.on("update", (data) => {
  console.log(" Nhận cập nhật số lượng:", data);

  // Bắn sự kiện để component lắng nghe
  eventEmitter.emit("stockUpdate", data);
});
