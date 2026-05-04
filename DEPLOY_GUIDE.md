# 🚀 Hướng dẫn Triển khai VocaBoost lên Internet

Tài liệu này hướng dẫn bạn cách đưa dự án từ môi trường Local lên các dịch vụ Cloud miễn phí/giá rẻ phổ biến nhất hiện nay.

---

## 1. Cơ sở dữ liệu (SQL Server Cloud)
**Dịch vụ khuyên dùng:** [Azure SQL](https://azure.microsoft.com/en-us/products/azure-sql/database/) hoặc [Aiven](https://aiven.io/mssql).

1.  **Tạo Database:** Đăng ký tài khoản và tạo một instance MSSQL mới.
2.  **Chạy Script:** Mở file `Database/prototype_database.sql` và chạy toàn bộ câu lệnh SQL vào Database mới trên Cloud.
3.  **Lấy Connection String:** Lưu lại các thông tin: Host, User, Password để cấu hình Backend.

---

## 2. Backend API (Node.js)
**Dịch vụ khuyên dùng:** [Render](https://render.com/) hoặc [Railway](https://railway.app/).

1.  **Push Code:** Đẩy toàn bộ mã nguồn của bạn lên một Repo GitHub (nên tách folder `backend` ra hoặc cấu hình Root Directory).
2.  **Tạo Web Service:** Kết nối GitHub với Render/Railway.
3.  **Cấu hình Environment Variables:**
    -   `PORT`: `3001`
    -   `DB_SERVER`: Địa chỉ host SQL Cloud.
    -   `DB_USER`: User database.
    -   `DB_PASSWORD`: Password database.
    -   `DB_NAME`: Tên database.
    -   `JWT_SECRET`: Một chuỗi ký tự ngẫu nhiên bảo mật.
4.  **Deploy:** Render sẽ tự động chạy `npm install` và `npm start`.

---

## 3. Frontend Web (Next.js)
**Dịch vụ khuyên dùng:** [Vercel](https://vercel.com/) (Tối ưu nhất cho Next.js).

1.  **Tạo Project:** Kết nối Repo GitHub với Vercel.
2.  **Cấu hình Framework:** Vercel sẽ tự nhận diện đây là dự án Next.js.
3.  **Cấu hình Environment Variables:**
    -   `NEXT_PUBLIC_API_URL`: URL của Backend bạn vừa tạo ở Bước 2 (vd: `https://vocaboost-api.onrender.com/api`).
4.  **Deploy:** Vercel sẽ build và cung cấp cho bạn một URL công khai (vd: `vocaboost.vercel.app`).

---

## 4. Kiểm tra sau khi triển khai
1.  Truy cập URL Frontend.
2.  Thử Đăng ký một tài khoản mới.
3.  Kiểm tra xem dữ liệu có được lưu vào Database Cloud không.
4.  Thử tính năng phát âm (TTS) và làm bài thi Mini Test.

---
**Lưu ý quan trọng:**
-   Đảm bảo bạn đã cấu hình **CORS** ở Backend để cho phép URL của Frontend (Vercel) truy cập.
-   Luôn giữ các file `.env` bí mật, không bao giờ push chúng lên GitHub.
