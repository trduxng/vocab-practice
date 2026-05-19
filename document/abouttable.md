# Tác dụng của từng table và quan hệ với các table khác

## 1. Nhóm người dùng và phân quyền

### 1.1. `NguoiDung`

**Tác dụng:**  
Lưu thông tin tài khoản của tất cả người dùng trong hệ thống, gồm Người học, Biên tập viên/Giáo viên và Quản trị viên.

**Vai trò trong hệ thống:**

- Là bảng trung tâm để định danh người dùng.
- Dùng cho đăng nhập, phân quyền, ghi nhận người tạo nội dung, người học, người làm bài, người duyệt nội dung.
- Mọi hoạt động cá nhân hóa đều gắn với `NguoiDungID`.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `VaiTro` | Nhiều `NguoiDung` thuộc một `VaiTro` | Xác định người dùng là Người học, Biên tập viên hay Quản trị viên |
| `ChuDe` | Một `NguoiDung` có thể tạo nhiều `ChuDe` | Ghi nhận người tạo chủ đề |
| `TuVung` | Một `NguoiDung` có thể tạo nhiều `TuVung` | Ghi nhận người tạo từ vựng |
| `CauHoi` | Một `NguoiDung` có thể tạo nhiều `CauHoi` | Ghi nhận người tạo câu hỏi |
| `BaiKiemTraNho` | Một `NguoiDung` có thể tạo nhiều `BaiKiemTraNho` | Ghi nhận người tạo bài kiểm tra |
| `DangKyChuDeNguoiDung` | Một `NguoiDung` có nhiều chủ đề đã đăng ký | Lưu chủ đề người học chọn |
| `TienDoTuVungNguoiDung` | Một `NguoiDung` có nhiều tiến độ từ vựng | Theo dõi tiến độ học |
| `SoTayTuVungNguoiDung` | Một `NguoiDung` có nhiều từ trong sổ tay | Lưu sổ tay cá nhân |
| `LanLamBaiTap` | Một `NguoiDung` có nhiều lượt làm bài tập | Lưu lịch sử trả lời câu hỏi |
| `LanLamBaiKiemTraNho` | Một `NguoiDung` có nhiều lượt làm bài kiểm tra | Lưu kết quả làm bài kiểm tra |
| `TepMedia` | Một `NguoiDung` có thể upload nhiều media | Ghi nhận người tải file lên |
| `NhatKyDuyetNoiDung` | Một `NguoiDung` có thể thực hiện nhiều hành động duyệt | Ghi nhận ai duyệt, từ chối hoặc lưu trữ nội dung |

---

### 1.2. `VaiTro`

**Tác dụng:**  
Lưu danh sách vai trò trong hệ thống.

Ví dụ:

- `NguoiHoc`
- `BienTapVien`
- `QuanTriVien`

**Vai trò trong hệ thống:**

- Phân loại người dùng.
- Là tầng trung gian để gán quyền cho từng nhóm người dùng.
- Giúp backend biết user được phép truy cập chức năng nào.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `NguoiDung` | Một `VaiTro` có nhiều `NguoiDung` | Gán vai trò cho người dùng |
| `QuyenVaiTro` | Một `VaiTro` có nhiều quyền | Xác định tập quyền của vai trò |

---

### 1.3. `Quyen`

**Tác dụng:**  
Lưu danh sách quyền chức năng của hệ thống.

Ví dụ:

- `XEM_DASHBOARD`
- `HOC_TU_VUNG`
- `QUAN_LY_TU_VUNG`
- `QUAN_LY_CHU_DE`
- `DUYET_NOI_DUNG`
- `QUAN_LY_NGUOI_DUNG`

**Vai trò trong hệ thống:**

- Là đơn vị nhỏ nhất để kiểm soát quyền truy cập.
- Backend dùng mã quyền để cho phép hoặc từ chối hành động.
- Giúp hệ thống dễ mở rộng khi thêm chức năng mới.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `QuyenVaiTro` | Một `Quyen` có thể thuộc nhiều `VaiTro` | Cho phép nhiều vai trò dùng chung một quyền |

---

### 1.4. `QuyenVaiTro`

**Tác dụng:**  
Là bảng trung gian nối giữa `VaiTro` và `Quyen`.

**Vai trò trong hệ thống:**

- Xác định vai trò nào có những quyền nào.
- Cho phép quan hệ nhiều-nhiều giữa vai trò và quyền.
- Tách riêng logic phân quyền khỏi bảng người dùng.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `VaiTro` | Nhiều bản ghi `QuyenVaiTro` thuộc một `VaiTro` | Xác định vai trò được gán quyền |
| `Quyen` | Nhiều bản ghi `QuyenVaiTro` thuộc một `Quyen` | Xác định quyền được gán cho vai trò nào |

---

## 2. Nhóm danh mục, chủ đề và từ vựng

### 2.1. `DanhMucChuDe`

**Tác dụng:**  
Lưu nhóm lớn của các chủ đề học.

Ví dụ:

- Business English
- Travel English
- Daily Life
- TOEIC Skills
- Technology

**Vai trò trong hệ thống:**

- Gom các chủ đề nhỏ thành từng nhóm lớn.
- Giúp frontend hiển thị nội dung học theo cấu trúc rõ ràng.
- Hỗ trợ báo cáo tổng quan theo nhóm chủ đề.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `ChuDe` | Một `DanhMucChuDe` có nhiều `ChuDe` | Gom nhiều chủ đề vào một danh mục |
| `NguoiDung` | Có thể lưu người tạo danh mục | Ghi nhận ai tạo danh mục |

---

### 2.2. `ChuDe`

**Tác dụng:**  
Lưu các bộ từ vựng cụ thể để người học chọn học.

Ví dụ:

- Economy
- Office
- Airport
- Hotel
- TOEIC Part 5

**Vai trò trong hệ thống:**

- Là bộ học chính mà người học đăng ký.
- Là nơi gom các từ vựng cùng ngữ cảnh.
- Là cơ sở để tạo bài kiểm tra nhỏ.
- Là đối tượng báo cáo hiệu quả học tập.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `DanhMucChuDe` | Nhiều `ChuDe` thuộc một `DanhMucChuDe` | Phân nhóm chủ đề |
| `NguoiDung` | Một `NguoiDung` có thể tạo nhiều `ChuDe` | Ghi nhận người tạo chủ đề |
| `TuVungChuDe` | Một `ChuDe` có nhiều từ thông qua bảng nối | Gắn từ vựng vào chủ đề |
| `DangKyChuDeNguoiDung` | Một `ChuDe` có nhiều người học đăng ký | Biết chủ đề có những người học nào |
| `BaiKiemTraNho` | Một `ChuDe` có nhiều bài kiểm tra nhỏ | Tạo bài test theo chủ đề |
| `LienKetMediaNoiDung` | Một `ChuDe` có thể gắn media | Gắn ảnh đại diện hoặc tài nguyên minh họa |
| `vw_PhanTichHocTapChuDe` | View tổng hợp từ `ChuDe` | Phân tích tiến độ học theo chủ đề |
| `vw_TongQuanDanhMucChuDe` | View tổng hợp từ `ChuDe` | Thống kê số chủ đề theo danh mục |

---

### 2.3. `TuLoai`

**Tác dụng:**  
Lưu danh mục từ loại.

Ví dụ:

- Danh từ
- Động từ
- Tính từ
- Trạng từ
- Giới từ

**Vai trò trong hệ thống:**

- Chuẩn hóa thông tin từ loại.
- Tránh nhập sai hoặc nhập trùng dữ liệu.
- Hỗ trợ lọc từ vựng theo từ loại.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `TuVung` | Một `TuLoai` có nhiều `TuVung` | Xác định từ vựng thuộc loại từ nào |

---

### 2.4. `TuVung`

**Tác dụng:**  
Lưu thông tin từ vựng chính trong hệ thống.

Thông tin thường gồm:

- Từ tiếng Anh
- Nghĩa tiếng Việt
- Phiên âm
- Từ loại
- Audio UK
- Audio US
- Hình ảnh
- Độ khó
- Người tạo
- Trạng thái nội dung

**Vai trò trong hệ thống:**

- Là dữ liệu học tập cốt lõi.
- Dùng để hiển thị flashcard hoặc bài học.
- Dùng để tạo câu ví dụ, câu hỏi và bài kiểm tra.
- Dùng để theo dõi tiến độ học của từng người.
- Dùng để lưu vào sổ tay cá nhân.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `TuLoai` | Nhiều `TuVung` thuộc một `TuLoai` | Xác định loại từ |
| `NguoiDung` | Một `NguoiDung` có thể tạo nhiều `TuVung` | Ghi nhận người tạo từ |
| `CauViDu` | Một `TuVung` có nhiều `CauViDu` | Bổ sung ví dụ sử dụng từ |
| `TuVungChuDe` | Một `TuVung` thuộc nhiều `ChuDe` | Gắn từ vào các chủ đề học |
| `CauHoi` | Một `TuVung` có nhiều `CauHoi` | Tạo câu hỏi luyện tập cho từ |
| `LanLamBaiTap` | Một `TuVung` xuất hiện trong nhiều lượt làm bài | Ghi nhận kết quả luyện tập theo từ |
| `TienDoTuVungNguoiDung` | Một `TuVung` có nhiều bản ghi tiến độ theo user | Theo dõi mức độ thành thạo của từng người học |
| `SoTayTuVungNguoiDung` | Một `TuVung` có thể được nhiều người lưu | Lưu từ vào sổ tay cá nhân |
| `LienKetMediaNoiDung` | Một `TuVung` có thể gắn nhiều media | Gắn audio, hình ảnh hoặc tài nguyên phụ trợ |

---

### 2.5. `CauViDu`

**Tác dụng:**  
Lưu câu ví dụ cho từng từ vựng.

**Vai trò trong hệ thống:**

- Giúp người học hiểu cách dùng từ trong ngữ cảnh.
- Có thể gắn audio cho câu ví dụ.
- Hỗ trợ phần học từ vựng và ôn tập.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `TuVung` | Nhiều `CauViDu` thuộc một `TuVung` | Mỗi từ có thể có nhiều câu ví dụ |
| `LienKetMediaNoiDung` | Một `CauViDu` có thể gắn media | Gắn audio hoặc tài nguyên cho câu ví dụ |

---

### 2.6. `TuVungChuDe`

**Tác dụng:**  
Là bảng trung gian nối giữa `TuVung` và `ChuDe`.

**Vai trò trong hệ thống:**

- Cho phép một từ thuộc nhiều chủ đề.
- Cho phép một chủ đề chứa nhiều từ.
- Tạo quan hệ nhiều-nhiều giữa từ vựng và chủ đề.
- Là bảng quan trọng để lấy danh sách từ theo chủ đề.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `TuVung` | Nhiều bản ghi `TuVungChuDe` thuộc một `TuVung` | Gắn từ vào chủ đề |
| `ChuDe` | Nhiều bản ghi `TuVungChuDe` thuộc một `ChuDe` | Xác định chủ đề có những từ nào |

---

## 3. Nhóm câu hỏi, luyện tập và kiểm tra

### 3.1. `CauHoi`

**Tác dụng:**  
Lưu ngân hàng câu hỏi luyện tập.

Thông tin thường gồm:

- Từ vựng liên quan
- Loại câu hỏi
- Nội dung câu hỏi
- Danh sách lựa chọn JSON
- Đáp án đúng
- Giải thích
- Độ khó
- Người tạo
- Trạng thái nội dung

**Vai trò trong hệ thống:**

- Là dữ liệu chính cho chức năng luyện tập.
- Dùng để kiểm tra khả năng ghi nhớ từ.
- Dùng để tạo bài kiểm tra nhỏ.
- Là cơ sở để ghi nhận kết quả làm bài.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `TuVung` | Nhiều `CauHoi` thuộc một `TuVung` | Câu hỏi kiểm tra từ nào |
| `NguoiDung` | Một `NguoiDung` có thể tạo nhiều `CauHoi` | Ghi nhận người tạo câu hỏi |
| `LanLamBaiTap` | Một `CauHoi` có nhiều lượt làm | Lưu lịch sử trả lời câu hỏi |
| `CauHoiBaiKiemTraNho` | Một `CauHoi` có thể thuộc nhiều bài test | Đưa câu hỏi vào bài kiểm tra nhỏ |
| `LienKetMediaNoiDung` | Một `CauHoi` có thể gắn media | Gắn audio/hình cho câu hỏi |

---

### 3.2. `LanLamBaiTap`

**Tác dụng:**  
Lưu lịch sử mỗi lần người học trả lời một câu hỏi.

**Vai trò trong hệ thống:**

- Ghi nhận câu trả lời của người học.
- Xác định đúng/sai.
- Lưu điểm từng lần trả lời.
- Là dữ liệu đầu vào để cập nhật tiến độ học.
- Hỗ trợ phân tích câu hỏi nào khó hoặc dễ.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `NguoiDung` | Nhiều `LanLamBaiTap` thuộc một `NguoiDung` | Biết ai làm bài |
| `CauHoi` | Nhiều `LanLamBaiTap` thuộc một `CauHoi` | Biết người học trả lời câu hỏi nào |
| `TuVung` | Nhiều `LanLamBaiTap` liên quan đến một `TuVung` | Biết lượt làm bài đang kiểm tra từ nào |
| `TienDoTuVungNguoiDung` | Cập nhật gián tiếp | Sau khi làm bài, hệ thống cập nhật tiến độ từ vựng |

---

### 3.3. `BaiKiemTraNho`

**Tác dụng:**  
Lưu thông tin bài kiểm tra nhỏ theo chủ đề.

**Vai trò trong hệ thống:**

- Gom nhiều câu hỏi thành một bài kiểm tra.
- Dùng để đánh giá người học sau khi học một chủ đề.
- Là dữ liệu để tính điểm, báo cáo, thống kê hiệu quả học tập.
- Giúp giáo viên kiểm tra chất lượng bộ từ.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `ChuDe` | Nhiều `BaiKiemTraNho` thuộc một `ChuDe` | Bài test kiểm tra chủ đề nào |
| `NguoiDung` | Một `NguoiDung` có thể tạo nhiều `BaiKiemTraNho` | Ghi nhận người tạo bài kiểm tra |
| `CauHoiBaiKiemTraNho` | Một `BaiKiemTraNho` có nhiều câu hỏi | Gắn câu hỏi vào bài test |
| `LanLamBaiKiemTraNho` | Một `BaiKiemTraNho` có nhiều lượt làm | Lưu kết quả làm bài test |
| `vw_PhanTichBaiKiemTraNho` | View tổng hợp từ `BaiKiemTraNho` | Phân tích điểm và lượt làm bài |

---

### 3.4. `CauHoiBaiKiemTraNho`

**Tác dụng:**  
Là bảng trung gian nối giữa `BaiKiemTraNho` và `CauHoi`.

**Vai trò trong hệ thống:**

- Cho phép một bài kiểm tra có nhiều câu hỏi.
- Cho phép một câu hỏi được dùng lại trong nhiều bài kiểm tra.
- Lưu thứ tự hiển thị câu hỏi trong bài kiểm tra.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `BaiKiemTraNho` | Nhiều bản ghi thuộc một bài kiểm tra | Xác định bài kiểm tra chứa câu hỏi nào |
| `CauHoi` | Nhiều bản ghi thuộc một câu hỏi | Xác định câu hỏi xuất hiện trong bài test nào |

---

### 3.5. `LanLamBaiKiemTraNho`

**Tác dụng:**  
Lưu mỗi lượt người học làm một bài kiểm tra nhỏ.

**Vai trò trong hệ thống:**

- Ghi nhận người học bắt đầu làm bài.
- Ghi nhận thời điểm nộp bài.
- Lưu tổng số câu, số câu đúng và điểm.
- Là dữ liệu chính cho báo cáo bài kiểm tra.
- Lưu lịch sử làm bài của người học.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `NguoiDung` | Nhiều lượt làm thuộc một `NguoiDung` | Biết ai làm bài |
| `BaiKiemTraNho` | Nhiều lượt làm thuộc một `BaiKiemTraNho` | Biết người học làm bài test nào |
| `vw_PhanTichBaiKiemTraNho` | View tổng hợp từ lượt làm bài | Phân tích điểm trung bình, lượt làm, số bài đã nộp |

---

## 4. Nhóm tiến độ học và cá nhân hóa

### 4.1. `TienDoTuVungNguoiDung`

**Tác dụng:**  
Lưu tiến độ học từng từ vựng của từng người học.

**Vai trò trong hệ thống:**

- Biết người học đã học từ nào.
- Biết từ nào đang học, đã thành thạo hoặc bị quên.
- Tính ngày ôn tập tiếp theo.
- Cá nhân hóa lộ trình học.
- Cung cấp dữ liệu cho dashboard học tập.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `NguoiDung` | Một `NguoiDung` có nhiều bản ghi tiến độ | Theo dõi tiến độ của từng người |
| `TuVung` | Một `TuVung` có nhiều bản ghi tiến độ | Theo dõi nhiều người học cùng một từ |
| `LanLamBaiTap` | Cập nhật gián tiếp | Kết quả làm bài ảnh hưởng đến tiến độ |
| `vw_PhanTichHocTapChuDe` | View tổng hợp từ tiến độ | Phân tích mức thành thạo theo chủ đề |

---

### 4.2. `DangKyChuDeNguoiDung`

**Tác dụng:**  
Lưu việc người học chọn hoặc đăng ký chủ đề học.

**Vai trò trong hệ thống:**

- Biết người học đang học những chủ đề nào.
- Hiển thị dashboard cá nhân theo chủ đề đã chọn.
- Tính số lượng người học theo chủ đề.
- Cho phép bật/tắt trạng thái đang học của một chủ đề.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `NguoiDung` | Một `NguoiDung` có nhiều chủ đề đăng ký | Biết người học chọn gì |
| `ChuDe` | Một `ChuDe` có nhiều người học đăng ký | Biết chủ đề có bao nhiêu người học |
| `vw_PhanTichHocTapChuDe` | View tổng hợp từ bảng đăng ký | Tính số người học theo chủ đề |

---

### 4.3. `SoTayTuVungNguoiDung`

**Tác dụng:**  
Lưu sổ tay từ vựng cá nhân của người học.

**Vai trò trong hệ thống:**

- Cho phép người học lưu từ quan trọng.
- Cho phép ghi chú cá nhân.
- Cho phép đánh dấu yêu thích.
- Hỗ trợ ôn tập cá nhân ngoài lộ trình hệ thống.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `NguoiDung` | Một `NguoiDung` có nhiều từ trong sổ tay | Biết sổ tay thuộc người học nào |
| `TuVung` | Một `TuVung` có thể nằm trong sổ tay của nhiều người | Biết người học lưu từ nào |

---

## 5. Nhóm duyệt nội dung và media

### 5.1. `NhatKyDuyetNoiDung`

**Tác dụng:**  
Lưu lịch sử duyệt nội dung.

**Vai trò trong hệ thống:**

- Ghi nhận quá trình chuyển trạng thái nội dung.
- Biết ai gửi duyệt, ai duyệt, ai từ chối.
- Lưu trạng thái cũ, trạng thái mới và ghi chú.
- Hỗ trợ kiểm soát chất lượng nội dung.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `NguoiDung` | Một `NguoiDung` có thể thực hiện nhiều hành động duyệt | Ghi nhận người thực hiện |
| `ChuDe` | Quan hệ logic qua `LoaiThucThe` và `ThucTheID` | Duyệt chủ đề |
| `TuVung` | Quan hệ logic qua `LoaiThucThe` và `ThucTheID` | Duyệt từ vựng |
| `CauHoi` | Quan hệ logic qua `LoaiThucThe` và `ThucTheID` | Duyệt câu hỏi |
| `BaiKiemTraNho` | Quan hệ logic qua `LoaiThucThe` và `ThucTheID` | Duyệt bài kiểm tra |
| `TepMedia` | Quan hệ logic qua `LoaiThucThe` và `ThucTheID` | Duyệt file media nếu cần |

---

### 5.2. `TepMedia`

**Tác dụng:**  
Lưu thông tin file media được upload.

Ví dụ:

- Audio UK
- Audio US
- Hình ảnh minh họa
- Audio câu ví dụ
- Audio câu hỏi nghe
- Hình minh họa câu hỏi

**Vai trò trong hệ thống:**

- Quản lý media tập trung.
- Cho phép tái sử dụng media.
- Theo dõi người upload file.
- Hỗ trợ nội dung học đa phương tiện.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `NguoiDung` | Một `NguoiDung` có thể upload nhiều `TepMedia` | Ghi nhận người tải file lên |
| `LienKetMediaNoiDung` | Một `TepMedia` có thể gắn vào nhiều nội dung | Dùng file media cho từ vựng, câu hỏi, câu ví dụ hoặc chủ đề |

---

### 5.3. `LienKetMediaNoiDung`

**Tác dụng:**  
Là bảng trung gian nối `TepMedia` với các loại nội dung học.

**Vai trò trong hệ thống:**

- Gắn audio vào từ vựng.
- Gắn hình ảnh vào từ vựng.
- Gắn audio vào câu hỏi nghe.
- Gắn audio vào câu ví dụ.
- Gắn ảnh đại diện vào chủ đề.
- Cho phép một file được tái sử dụng ở nhiều nội dung.

**Quan hệ với bảng khác:**

| Table liên quan | Kiểu quan hệ | Tác dụng |
|---|---|---|
| `TepMedia` | Nhiều liên kết thuộc một file media | Xác định file được gắn |
| `TuVung` | Quan hệ logic qua `LoaiThucThe` và `ThucTheID` | Gắn media cho từ vựng |
| `CauHoi` | Quan hệ logic qua `LoaiThucThe` và `ThucTheID` | Gắn media cho câu hỏi |
| `CauViDu` | Quan hệ logic qua `LoaiThucThe` và `ThucTheID` | Gắn media cho câu ví dụ |
| `ChuDe` | Quan hệ logic qua `LoaiThucThe` và `ThucTheID` | Gắn media cho chủ đề |

---

## 6. Nhóm view báo cáo

### 6.1. `vw_TongQuanNoiDungBienTapVien`

**Tác dụng:**  
Tổng hợp số lượng nội dung do từng biên tập viên tạo.

**Vai trò trong hệ thống:**

- Giúp Admin đánh giá hoạt động của biên tập viên.
- Giúp Biên tập viên theo dõi số nội dung mình đã tạo.
- Thống kê nội dung theo trạng thái: đã xuất bản, chờ duyệt, bị từ chối.

**Lấy dữ liệu từ:**

| Table nguồn | Tác dụng |
|---|---|
| `NguoiDung` | Lấy thông tin biên tập viên |
| `ChuDe` | Đếm số chủ đề đã tạo |
| `TuVung` | Đếm số từ vựng đã tạo |
| `CauHoi` | Đếm số câu hỏi đã tạo |
| `BaiKiemTraNho` | Đếm số bài kiểm tra đã tạo |

---

### 6.2. `vw_PhanTichHocTapChuDe`

**Tác dụng:**  
Phân tích học tập theo từng chủ đề.

**Vai trò trong hệ thống:**

- Xem chủ đề nào có nhiều người học.
- Xem chủ đề nào có nhiều từ.
- Tính mức thành thạo trung bình.
- Theo dõi số lượng từ đã thành thạo hoặc bị quên.

**Lấy dữ liệu từ:**

| Table nguồn | Tác dụng |
|---|---|
| `ChuDe` | Lấy thông tin chủ đề |
| `DangKyChuDeNguoiDung` | Đếm số người đăng ký chủ đề |
| `TuVungChuDe` | Đếm số từ trong chủ đề |
| `TienDoTuVungNguoiDung` | Tính tiến độ học theo chủ đề |

---

### 6.3. `vw_PhanTichBaiKiemTraNho`

**Tác dụng:**  
Phân tích kết quả bài kiểm tra nhỏ.

**Vai trò trong hệ thống:**

- Xem số lượt làm bài.
- Tính điểm trung bình.
- Xem điểm cao nhất và thấp nhất.
- Theo dõi số lượt đã nộp hoặc chưa hoàn thành.

**Lấy dữ liệu từ:**

| Table nguồn | Tác dụng |
|---|---|
| `BaiKiemTraNho` | Lấy thông tin bài kiểm tra |
| `ChuDe` | Biết bài kiểm tra thuộc chủ đề nào |
| `LanLamBaiKiemTraNho` | Tính lượt làm và điểm số |

---

### 6.4. `vw_TongQuanDanhMucChuDe`

**Tác dụng:**  
Tổng quan số lượng chủ đề theo từng danh mục.

**Vai trò trong hệ thống:**

- Biết mỗi danh mục có bao nhiêu chủ đề.
- Biết bao nhiêu chủ đề đã xuất bản.
- Biết bao nhiêu chủ đề đang là bản nháp.
- Biết bao nhiêu chủ đề đang chờ duyệt.

**Lấy dữ liệu từ:**

| Table nguồn | Tác dụng |
|---|---|
| `DanhMucChuDe` | Lấy thông tin danh mục |
| `ChuDe` | Đếm số chủ đề trong từng danh mục |

---

## 7. Phân loại table theo vai trò trong database

### 7.1. Bảng chính

| Table | Tác dụng |
|---|---|
| `NguoiDung` | Trung tâm tài khoản và định danh người dùng |
| `DanhMucChuDe` | Nhóm lớn của nội dung học |
| `ChuDe` | Bộ học chính mà người học đăng ký |
| `TuVung` | Dữ liệu học tập cốt lõi |
| `CauHoi` | Dữ liệu luyện tập |
| `BaiKiemTraNho` | Dữ liệu kiểm tra theo chủ đề |

### 7.2. Bảng phụ / bảng chi tiết

| Table | Tác dụng |
|---|---|
| `TuLoai` | Chuẩn hóa loại từ |
| `CauViDu` | Bổ sung ví dụ cho từ |
| `TepMedia` | Lưu file audio/hình ảnh |
| `NhatKyDuyetNoiDung` | Lưu lịch sử duyệt nội dung |

### 7.3. Bảng trung gian nhiều-nhiều

| Table | Nối giữa |
|---|---|
| `QuyenVaiTro` | `VaiTro` ↔ `Quyen` |
| `TuVungChuDe` | `TuVung` ↔ `ChuDe` |
| `CauHoiBaiKiemTraNho` | `BaiKiemTraNho` ↔ `CauHoi` |
| `LienKetMediaNoiDung` | `TepMedia` ↔ nội dung học |

### 7.4. Bảng lịch sử / phát sinh theo hoạt động

| Table | Ghi nhận hoạt động |
|---|---|
| `LanLamBaiTap` | Mỗi lần trả lời câu hỏi |
| `LanLamBaiKiemTraNho` | Mỗi lần làm bài kiểm tra |
| `TienDoTuVungNguoiDung` | Trạng thái học từng từ |
| `DangKyChuDeNguoiDung` | Chủ đề người học đã chọn |
| `SoTayTuVungNguoiDung` | Từ người học tự lưu |

---

## 8. Sơ đồ quan hệ tổng quát

```text
NguoiDung
 ├── VaiTro
 │    └── QuyenVaiTro ── Quyen
 │
 ├── tạo ChuDe
 ├── tạo TuVung
 ├── tạo CauHoi
 ├── tạo BaiKiemTraNho
 ├── làm LanLamBaiTap
 ├── làm LanLamBaiKiemTraNho
 ├── có TienDoTuVungNguoiDung
 ├── có SoTayTuVungNguoiDung
 └── đăng ký DangKyChuDeNguoiDung

DanhMucChuDe
 └── ChuDe
      ├── TuVungChuDe ── TuVung
      │                  ├── TuLoai
      │                  ├── CauViDu
      │                  ├── CauHoi
      │                  ├── TienDoTuVungNguoiDung
      │                  └── SoTayTuVungNguoiDung
      │
      └── BaiKiemTraNho
             └── CauHoiBaiKiemTraNho ── CauHoi

TepMedia
 └── LienKetMediaNoiDung
      ├── TuVung
      ├── CauHoi
      ├── CauViDu
      └── ChuDe

NhatKyDuyetNoiDung
 ├── ChuDe
 ├── TuVung
 ├── CauHoi
 ├── BaiKiemTraNho
 └── TepMedia