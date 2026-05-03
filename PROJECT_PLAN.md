# 🗺️ KẾ HOẠCH HOÀN THIỆN TOÀN BỘ DỰ ÁN VOCABOOST

## Giai đoạn 1: Sửa lỗi tích hợp & Ổn định hệ thống (Resolution & Stability)
**Mục tiêu:** Đảm bảo luồng Frontend - Backend - Database thông suốt, không còn lỗi vặt.
1. **Fix triệt để lỗi Network Error:** Xử lý CORS, kiểm tra biến môi trường `.env.local` ở Frontend và sự ổn định của Backend (đặc biệt là kết nối SQL Server).
2. **Xử lý Graceful Shutdown/Error:** Backend không được crash khi mất kết nối DB tạm thời; Frontend cần hiện thông báo lỗi thân thiện thay vì màn hình trắng.

## Giai đoạn 2: Hoàn thiện Admin Portal (Quản trị viên)
**Mục tiêu:** Cung cấp đầy đủ công cụ để Content Creator và Admin làm việc.
1. **Quản lý Từ vựng (`/admin/words`):** Bổ sung chức năng Sửa (Edit) và Xóa (Delete) (hiện tại mới chỉ có Xem và Thêm).
2. **Quản lý Mini Test (`/admin/minitests`):** Xây dựng trang UI cho phép Admin tạo Bài thi mới, thêm mô tả, và chọn các câu hỏi trắc nghiệm đưa vào bài thi.
3. **Quản lý Học viên (`/admin/students`):** Trang danh sách học viên, xem tiến độ học của từng người, khóa/mở khóa tài khoản (IsActive).
4. **Thống kê chuyên sâu (`/admin/analytics`):** Vẽ biểu đồ (Recharts) cho Admin thấy xu hướng đăng ký và học tập theo từng ngày/tuần.

## Giai đoạn 3: Hoàn thiện User Portal & Trải nghiệm Học tập
**Mục tiêu:** Gamification, giữ chân người dùng và hoàn thiện các trang còn thiếu.
1. **Lịch sử Mini Test:** Học viên có thể xem lại lịch sử các bài thi Mini Test đã làm, điểm số và chi tiết câu sai.
2. **Hệ thống Toast Notification:** Thay thế toàn bộ `alert()` xấu xí của trình duyệt bằng thư viện Toast (như sonner hoặc Shadcn Toast) để báo thành công/thất bại mượt mà.
3. **Cài đặt tài khoản (`/user/settings`):** Cho phép người dùng đổi tên (FullName), đổi mật khẩu, hoặc tùy chỉnh mục tiêu học (vd: 20 từ/ngày).
4. **Trang Thành tích (`/user/achievements`):** Giao diện riêng để trưng bày các Huy hiệu đã đạt được kèm mô tả chi tiết.

## Giai đoạn 4: Tối ưu hóa (Optimization) & Bảo mật (Security)
**Mục tiêu:** Đạt chuẩn dự án thực tế, an toàn và nhanh.
1. **Validate Dữ liệu (Zod):** Áp dụng Zod để kiểm tra tính hợp lệ của dữ liệu cả ở Form Frontend (để chặn người dùng nhập bậy) và Backend (để bảo vệ Database).
2. **Loading States & Skeletons:** Hiển thị hiệu ứng loading lấp lánh (Skeleton) khi đang chờ tải dữ liệu thay vì chữ "Đang tải..." đơn điệu.
3. **Tối ưu hóa Database Queries:** Thêm Indexes cho các trường thường xuyên tìm kiếm nếu cần, đảm bảo tốc độ khi số lượng từ vựng lên tới hàng chục nghìn.

## Giai đoạn 5: Đóng gói & Triển khai (Deployment)
**Mục tiêu:** Đưa website lên Internet.
1. Xây dựng script/Dockerize cho Backend.
2. Triển khai Frontend lên Vercel.
3. Triển khai Backend lên Render/Railway hoặc VPS.
4. Di chuyển SQL Server lên Cloud (Azure SQL hoặc AWS RDS).
