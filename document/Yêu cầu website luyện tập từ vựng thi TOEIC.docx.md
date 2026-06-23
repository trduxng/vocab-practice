**Website luyện tập từ vựng thi TOEIC (TOEIC Vocabulary Learning Platform)**

**1\. Bối cảnh (Context)**

Trong việc ôn luyện TOEIC, từ vựng chiếm 60% khả năng thành công nhưng người học thường gặp tình trạng "học trước quên sau". Các phương pháp học truyền thống thiếu sự tương tác và không đo lường được tiến độ ghi nhớ của từng cá nhân.

Hệ thống được xây dựng nhằm cung cấp một lộ trình học từ vựng thông minh, áp dụng các kỹ thuật ghi nhớ khoa học (như Spaced Repetition \- Lặp lại ngắt quãng) giúp người học ghi nhớ sâu và ứng dụng được từ vựng vào các ngữ cảnh thi thực tế.

**2\. Tầm nhìn và mục tiêu (Vision & Objectives)**

* **Tầm nhìn:** Trở thành trợ lý học tập cá nhân hóa, giúp người học chinh phục 990 TOEIC thông qua nền tảng từ vựng vững chắc.  
* **Mục tiêu:**  
  + **Tối ưu hóa việc ghi nhớ:** Áp dụng thuật toán giúp người học ôn lại đúng từ vào đúng thời điểm sắp quên.  
  + **Đa dạng hóa hình thức học:** Chuyển đổi từ vựng khô khan thành các trò chơi, flashcard và bài tập tương tác.  
  + **Theo dõi tiến độ:** Cung cấp báo cáo chi tiết về "độ chín" của vốn từ (biết \- hiểu \- nhớ lâu).

**3\. Các đối tượng người dùng (Actors)**

Hệ thống bao gồm 3 nhóm tác nhân chính:

1. **Người học (Learner):** Chọn bộ từ vựng, thực hiện các bài học/kiểm tra, theo dõi biểu đồ tiến bộ và quản lý "sổ tay" từ vựng cá nhân.  
2. **Biên tập viên nội dung (Content Creator):** Xây dựng các bộ từ vựng theo chủ đề (Economy, Office, Travel...), soạn thảo câu hỏi ví dụ, tệp âm thanh (Audio) và hình ảnh minh họa.  
3. **Quản trị viên (Admin):** Quản lý tài khoản người dùng, cấu hình thuật toán nhắc nhở, quản lý diễn đàn hỗ trợ và xem báo cáo tổng thể về hiệu quả của các bộ từ vựng.

**4\. Yêu cầu chức năng (Functional Requirements)**

**4.1. Phân hệ Quản lý nội dung từ vựng**

* **Cấu trúc từ vựng đa phương tiện:** Mỗi từ vựng bao gồm: Từ, Loại từ, Nghĩa, Phiên âm, Audio (Anh-Anh/Anh-Mỹ), Hình ảnh minh họa và Câu ví dụ trong đề thi TOEIC.  
* **Phân loại theo chủ đề:** Chia từ vựng theo 600 từ thiết yếu cho TOEIC hoặc theo các Part (Part 1 \- Part 7).

**4.2. Phân hệ Học tập và Tương tác (Core)**

* **Chế độ học Flashcard:** Lật thẻ để xem nghĩa và nghe phát âm.  
* **Bài tập trắc nghiệm:** Chọn nghĩa đúng, điền từ vào chỗ trống, sắp xếp câu hoặc nghe viết lại từ (Dictation).  
* **Thuật toán lặp lại ngắt quãng (Spaced Repetition):** Tự động xếp các từ người học hay làm sai vào danh sách "Cần ưu tiên ôn tập".

**4.3. Phân hệ Kiểm tra và Đánh giá**

* **Mini-test theo chủ đề:** Bài kiểm tra ngắn sau mỗi chương để đánh giá mức độ hoàn thành.  
* **Báo cáo tiến độ (Learning Dashboard):** Biểu đồ thể hiện số từ đã thuộc, số từ đang học và dự báo thời gian hoàn thành mục tiêu.

**4.4. Phân hệ Quản trị hệ thống**

* **Quản lý Ngân hàng câu hỏi:** Thêm, sửa, xóa các câu hỏi liên quan đến từ vựng.  
* **Hệ thống thông báo (Notification):** Gửi nhắc nhở học tập hàng ngày qua Email hoặc thông báo đẩy (Push Notification).

**5\. Yêu cầu phi chức năng (Non-functional Requirements)**

* **Tính tương tác (Interactivity):** Giao diện cần sinh động, có phản hồi ngay lập tức (âm thanh đúng/sai, hiệu ứng chúc mừng) để tạo động lực.  
* **Hiệu năng (Performance):** Tốc độ tải Audio và Hình ảnh phải nhanh, không gây ngắt quãng quá trình học.  
* **Tính khả dụng (Usability):** Giao diện thiết kế theo lối tối giản, tập trung vào nội dung học, hỗ trợ tốt trên thiết bị di động.  
* **Tính ổn định (Reliability):** Dữ liệu tiến độ học tập của người dùng phải được lưu trữ chính xác và đồng bộ tức thời.  
* **Khả năng mở rộng:** Dễ dàng bổ sung các ngôn ngữ khác hoặc các chứng chỉ khác (IELTS, JLPT) dựa trên khung hệ thống có sẵn.

