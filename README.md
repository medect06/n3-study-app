# JLPT N3 Study Hub

Ứng dụng hiện giữ nguyên hai trang học hiện có và thêm một backend Node.js nhẹ để phục vụ frontend cùng origin. Chưa có đăng nhập; mọi người dùng chung dữ liệu trên máy chạy server.

## Chạy local

Yêu cầu Node.js 18 trở lên.

```powershell
npm install
npm start
```

Mở [http://localhost:3000](http://localhost:3000). Trang mặc định là `N3_Study_Hub.html`; phần 2 vẫn có tại `/N3_Study_Hub_Part2.html`.

`npm install` không cần tải dependency bên ngoài vì server dùng module HTTP có sẵn của Node.js.

## API

- `GET /api/health` - kiểm tra server.
- `GET /api/study` - metadata các phần học và endpoint dữ liệu chung.
- `GET /api/shared-state` - đọc trạng thái dùng chung.
- `PUT /api/shared-state` hoặc `POST /api/shared-state` - ghi một JSON object trạng thái dùng chung (tối đa 100 KB).

Trạng thái được lưu tại `data/shared-state.json`. File này được tạo tự động; nội dung local không nên commit. Frontend hiện tại vẫn dùng `n3_data.js` và `n3_data_part2.js` tĩnh để tránh rủi ro làm hỏng flashcard, Kanji, nét vẽ và bài tập. API metadata cho phép chuyển từng phần sang tải động sau này mà không cần đổi cách chạy.

## Cho bạn bè truy cập trong cùng mạng

Máy chạy server lắng nghe trên mọi interface (`0.0.0.0`). Lấy địa chỉ IPv4 nội bộ của máy (ví dụ `192.168.1.20`) rồi gửi:

```text
http://192.168.1.20:3000
```

Nếu Windows Firewall hỏi, cho phép Node.js trên mạng Private. Không mở cổng này ra Internet công cộng nếu chưa bổ sung xác thực, phân quyền và bảo vệ dữ liệu.

## Triển khai sau này

Có thể chạy cùng `npm start` trên máy chủ/container Node.js. Dữ liệu chung hiện là JSON nhẹ, phù hợp nhóm nhỏ và một server duy nhất; nếu cần nhiều người ghi đồng thời hoặc lịch sử tiến độ, nên chuyển lớp lưu trữ sang SQLite/PostgreSQL và thêm kiểm soát truy cập.
