Chào bạn, với tư cách là một người mới bắt đầu học code, việc nhìn vào một dự án thực tế đồ sộ có thể hơi ngợp. Dự án **VocaBoost (web_hoc_tu_vung)** này là một hệ thống **Full-stack** rất hoàn chỉnh và sử dụng các công nghệ cực kỳ hiện đại (những bản cập nhật mới nhất của năm 2024-2025).

Dưới đây là bức tranh toàn cảnh về **tất cả những gì bạn cần học** để có thể làm chủ được dự án này, đi từ nền tảng gốc rễ lên đến các công nghệ hiện đại mà dự án đang dùng. Để dễ hiểu, các kiến thức được chia thành các tầng như xây một ngôi nhà:

---

### Tầng 1: Kiến thức nền tảng Web (Bắt buộc phải có)
Đây là móng nhà. Bất kể bạn dùng framework xịn đến đâu (như React hay Next.js), nếu không nắm vững tầng này, bạn sẽ không thể fix được bug.

1.  **HTML (HyperText Markup Language):** Bộ xương của trang web. Bạn cần biết các thẻ cơ bản (div, span, p, a, input, form) để biết trình duyệt cấu trúc nội dung như thế nào.
2.  **CSS (Cascading Style Sheets):** Lớp da và quần áo của trang web. Bạn cần hiểu cách trang trí (màu sắc, kích thước) và đặc biệt là cách dàn trang (Flexbox và Grid là 2 thứ bắt buộc).
3.  **DOM (Document Object Model):** Là cấu trúc dạng cây đại diện cho toàn bộ trang HTML. Trình duyệt biến mã HTML thành DOM để JavaScript có thể tương tác (ví dụ: tìm một thẻ, đổi màu, thay đổi nội dung). Trong dự án này, dù React sử dụng "Virtual DOM" (DOM ảo) để tự động hóa việc cập nhật giao diện, việc hiểu DOM thật là điều kiện tiên quyết để hiểu cách React hoạt động bên dưới và để gỡ lỗi (debug) khi giao diện không hiển thị như ý.Khi trình duyệt đọc file HTML của bạn, nó sẽ dựng lên một cái "Cây" gọi là DOM. Bạn cần hiểu bản chất: dùng JavaScript để móc vào cái cây này (ví dụ: tìm cái nút bấm có id là "btn-login") và ra lệnh cho nó đổi màu hay thay chữ.
4.  **JavaScript (Vanilla JS) cốt lõi:**
    *   **Biến và kiểu dữ liệu:** `let`, `const`, String, Number, Boolean.
    *   **Cấu trúc điều khiển:** `if/else`, vòng lặp `for`.
    *   **Thao tác với mảng và object:** Cực kỳ quan trọng. Bạn phải rành các hàm như `.map()`, `.filter()`, `.reduce()` vì React dùng chúng liên tục.
    *   **Bất đồng bộ (Asynchronous):** Hiểu `Promise`, `async/await` để biết cách gọi dữ liệu từ server mà web không bị đơ.
5.  **Giao thức HTTP & REST API:** Hiểu cách frontend nói chuyện với backend qua mạng. Khi nào dùng GET (lấy dữ liệu), POST (gửi dữ liệu mới), PUT/PATCH (cập nhật), DELETE (xóa).

---

### Tầng 2: Kiến thức Frontend Framework (Phần nhìn)
Khi đã có móng, đây là các công cụ giúp bạn xây tầng trệt cực nhanh.

1.  **React.js (v19):** Thư viện thay đổi cách bạn viết web.
    *   Thay vì viết HTML/CSS/JS rời rạc, React gom chúng lại thành các **Components** (mảnh ghép tái sử dụng được, ví dụ: component Thẻ Từ Vựng, component Thanh Điều Hướng).
    *   Hiểu về **Virtual DOM**: React tạo ra một bản nháp của DOM thật trong bộ nhớ. Khi có thay đổi, nó so sánh nháp với thật, chỉ cập nhật đúng chỗ thay đổi, giúp web chạy cực nhanh.
    *   Hiểu **Hooks**: `useState` (để lưu dữ liệu có thể thay đổi trên màn hình, như số điểm), `useEffect` (để tự động chạy một cái gì đó, như lấy dữ liệu ngay khi mở trang).
2.  **TypeScript:** Đây là JavaScript nhưng có "bảo vệ". Nó bắt bạn phải khai báo rõ ràng "biến này chứa số, hàm kia trả về chữ". Rất phiền lúc đầu, nhưng giúp tránh được 90% lỗi ngớ ngẩn khi code dự án lớn.
3.  **Next.js (v16):** Khung bao bọc bên ngoài React. React chỉ làm giao diện, Next.js lo việc định tuyến (chuyển trang), tạo ra các trang web chạy nhanh hơn nhờ tính toán trước nội dung trên server (SSR - Server Side Rendering).
4.  **Tailwind CSS (v4):** Cách viết CSS tắt. Thay vì tạo file CSS riêng để viết `margin: 10px`, bạn viết thẳng class `m-2` vào HTML. Học cực nhanh nếu bạn đã rành CSS thuần.
5.  **Shadcn UI & Radix/Base UI:** Bộ thư viện làm sẵn các nút bấm, menu, bảng biểu rất đẹp.
6.  **Các thư viện phụ trợ:**
    *   `React Hook Form` + `Zod`: Dùng để quản lý form đăng nhập/đăng ký và kiểm tra lỗi (vd: bắt buộc nhập email đúng định dạng).
    *   `Framer Motion`: Thư viện đỉnh cao để làm các hiệu ứng lật thẻ, trượt mượt mà.
    *   `Recharts`: Vẽ biểu đồ cột, tròn.
    *   **clsx & tailwind-merge:** Các công cụ tiện ích giúp gộp và xử lý các class CSS một cách thông minh, tránh xung đột màu sắc hay kích thước.
    *   **next-themes:** Giúp trang web có chế độ Sáng/Tối (Light/Dark mode).
    *   **Lucide React & Phosphor Icons:** Hai bộ thư viện icon (biểu tượng) hiện đại và nhẹ để làm đẹp giao diện.
    **Hiệu ứng (Animations):**
    *   **Framer Motion:** Thư viện đỉnh cao để làm các hiệu ứng chuyển động mượt mà (ví dụ: lật thẻ flashcard, popup mờ dần hiện lên).
    *   **tw-animate-css:** Thêm các hiệu ứng animation nhỏ kết hợp với Tailwind.
    **Xử lý Form & Dữ liệu (Forms & Data):**
    *   **React Hook Form:** Giúp quản lý các form điền thông tin (đăng ký, tạo từ vựng) hiệu quả, không làm web bị giật lag khi gõ.
    *   **Zod & @hookform/resolvers:** "Vệ sĩ" kiểm tra xem người dùng nhập đúng định dạng chưa (vd: email phải có chữ `@`, mật khẩu phải trên 8 ký tự) trước khi gửi đi.
    *   **Axios:** Người vận chuyển, chuyên gửi yêu cầu (request) từ giao diện lên máy chủ (Backend) để lấy hoặc lưu dữ liệu.
    **Tiện ích hiển thị khác:**
    *   **Recharts:** Vẽ các biểu đồ (cột, tròn, đường) trên trang quản trị Admin để xem thống kê học tập.
    *   **Sonner:** Hiển thị các thông báo nhỏ góc màn hình (Toast) kiểu "Lưu từ vựng thành công" hay "Sai mật khẩu".
    *   **Embla Carousel:** Tạo hiệu ứng vuốt/trượt ngang (slider) cho danh sách từ vựng.
    *   **React Day Picker & Date-fns:** Giúp chọn ngày tháng và xử lý tính toán thời gian (vd: tính xem 3 ngày nữa là ngày mấy).
    *   **XLSX:** Thư viện giúp xuất (export) hoặc nhập (import) dữ liệu từ file Excel.

---

### Tầng 3: Kiến thức Backend Framework (Phần xử lý)
Đây là động cơ xe, xử lý logic, tính toán điểm số và quyết định xem ai được phép làm gì.

1.  **Node.js & Express.js:** Dùng chính JavaScript (hoặc TypeScript) để viết code cho máy chủ. Express giúp tạo ra các đường dẫn (API) để frontend gọi vào.
2.  **Xác thực (Authentication) & Bảo mật:**
**Cốt lõi:**
*   **Node.js:** Môi trường giúp chạy mã JavaScript trên máy chủ.
*   **Express.js (v5.x):** Framework phổ biến nhất của Node.js để tạo ra các "cổng giao tiếp" (API endpoints) cho Frontend gọi vào.

**Bảo mật & Xác thực (Security & Auth):**
*   **JWT (JSON Web Token):** Khi người dùng đăng nhập đúng, backend phát cho một cái "thẻ từ" (Token). Các lần sau frontend cứ gửi thẻ từ này kèm theo yêu cầu là được, không cần gửi mật khẩu nữa.
*   **Bcrypt:** Thư viện băm (mã hóa) mật khẩu. Khi người dùng tạo mật khẩu `123456`, nó sẽ biến thành một chuỗi mã hóa dài loằng ngoằng trong Database để không ai đọc trộm được.
*   **JSON Web Token (jsonwebtoken):** Cấp một "thẻ bài" (token) cho người dùng sau khi đăng nhập thành công. Các lần sau gửi yêu cầu chỉ cần chìa thẻ này ra, máy chủ sẽ biết là ai mà không cần đăng nhập lại.
*   **Helmet:** Tự động thêm các lớp khiên bảo vệ vào máy chủ để chống lại các cuộc tấn công web phổ biến.
*   **CORS:** Cấp phép cho Frontend (ở một địa chỉ khác) được quyền gọi dữ liệu từ Backend.

**Xử lý Dữ liệu:**
*   **Zod:** Giống như ở Frontend, Backend cũng dùng Zod để kiểm tra lại dữ liệu một lần nữa cho chắc chắn an toàn.
*   **mssql & msnodesqlv8:** Bộ công cụ để Backend nói chuyện, ra lệnh cho cơ sở dữ liệu SQL Server.
*   **Dotenv:** Giúp giấu các thông tin nhạy cảm (như mật khẩu Database, khóa bí mật) vào một file `.env` riêng biệt, không để lộ trên mã nguồn.
---

### Tầng 4: Kiến thức Cơ sở dữ liệu (Nơi lưu trữ)
Kho chứa đồ của ngôi nhà.

1.  **SQL thuần (Raw SQL) & SQL Server:** Dự án này không dùng công cụ tự động (ORM) mà viết trực tiếp các câu lệnh SQL.
    *   Biết viết các lệnh `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
    *   Hiểu cách `JOIN` nhiều bảng lại với nhau (vd: kết hợp thông tin người dùng với điểm số của họ).
2.  **Thiết kế CSDL (ERD):** Hiểu quan hệ giữa các bảng. Khóa chính (Primary Key) là gì, khóa ngoại (Foreign Key) là gì.(Ví dụ: `NguoiDung` -> `TienDoTuVung`, `TuVung` -> `CauHoi`).
3.  **Stored Procedures & Views:** Các đoạn mã SQL nâng cao được lưu sẵn trong Database để xử lý báo cáo phức tạp (như tính tiến độ học tập).

---

### Tầng 5: Kiến thức Nghiệp vụ chuyên sâu (Đặc sản của dự án)
Đây là "linh hồn" của ứng dụng VocaBoost.

1.  **Thuật toán SRS (Spaced Repetition System - Lặp lại ngắt quãng):**
    *   Phải hiểu logic toán học đằng sau: Làm sao để tính được ngày mai hay 3 ngày nữa từ vựng này phải xuất hiện lại? Thuật toán tính toán dựa trên mức độ "Dễ" hay "Khó" mà người dùng vừa chọn.
    *   Kiến thức về cách não bộ con người ghi nhớ. Code sẽ phải tính toán công thức: Nếu từ này chọn "Dễ", mấy ngày sau mới xuất hiện lại? Nếu "Khó", bao lâu phải hỏi lại?
2.  **Gamification (Kiến thức game hóa):** Thiết kế logic hệ thống tính điểm XP, lưu chuỗi ngày học liên tục (Streak) để kích thích người học.
3.  **Text-to-Speech (TTS):** Cơ chế chuyển văn bản tiếng Anh thành âm thanh đọc chuẩn xác.

---

### Tầng 6: Kiến cụ Công cụ DevOps & Quản lý
Cách để code, lưu code và đưa web lên mạng.

1.  **Git & GitHub:** Cách lưu lại lịch sử code để nếu code hỏng thì "quay ngược thời gian" lại được.
2.  **Docker:** Công cụ giúp "gói" cả ứng dụng (kèm cơ sở dữ liệu) vào một cái hộp. Bạn có thể mang hộp này chạy trên máy Win, Mac hay Linux đều giống hệt nhau, không sợ lỗi môi trường.

---

### 💡 Lời khuyên Lộ trình cho bạn (Beginner)
Nếu bạn là người mới tinh, đừng hoảng! Không ai học hết đống này trong 1 ngày. Bạn cứ xây từ móng theo lộ trình sau:
1.  **HTML -> CSS -> JS cơ bản -> DOM**
2.  **SQL cơ bản**
3.  **React cơ bản** (để biết cách làm giao diện Component, Hook).
4.  **Node.js & Express cơ bản** (để biết cách tạo một API đơn giản).
5.  **Học SQL cơ bản** (biết cách tạo bảng, truy vấn dữ liệu).
Xây chắc móng rồi mới đụng vào dự án này nhé.