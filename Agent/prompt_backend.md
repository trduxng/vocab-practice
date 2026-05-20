Bạn là một senior backend developer.

Tôi đã có:

- Một backend Node.js (Express) cơ bản
- Một database SQL Server đã thiết kế sẵn (KHÔNG được thay đổi schema)
- Dự án xây dựng website luyện từ vựng

Yêu cầu của bạn:
KHÔNG tạo project mới. Hãy mở rộng từ base backend hiện có.

Công nghệ:

- Node.js + Express
- SQL Server (sử dụng mssql package hoặc tương đương)
- codegraphcontext
- memvid

Mục tiêu:
Xây dựng API backend cho website trang luyện từ vựng với các chức năng:

1. lộ trình xây dựng
   theo lộ trình @Database/lo_trinh_xay_dung.md

2. Database:

- Sử dụng các bảng đã có (KHÔNG tạo bảng mới)
- Viết truy vấn SQL phù hợp với SQL Server
- Dùng parameterized query để chống SQL injection

5. Kiến trúc:

- file tạo database @Database/prototype_database.sql

Yêu cầu output:

1. Phân tích cách mapping database hiện có sang API
2. Danh sách API endpoints
3. Code đầy đủ cho từng file (controller, service, route)
4. Ví dụ query SQL cụ thể
5. Không được bỏ sót file
6. Không được viết chung chung

Ràng buộc:

- Code rõ ràng, tách logic service
- Không thay đổi database schema
- Không dùng ORM nếu không cần thiết
- Ưu tiên raw SQL
- xây dựng theo frontend có sẵn @frontend

Nếu thiếu thông tin về database:

- hỏi trước khi tiếp tục

Không được tóm tắt.
