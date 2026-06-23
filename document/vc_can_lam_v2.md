**Mục lục
3.3. Đặc tả chi tiết các Use-case**

**3.3.1. Các Use-cases dùng chung cho hệ thống**

**a. UC 001: Đăng nhập hệ thống**

**b. UC 002: Đăng ký tài khoản (Dành cho Học viên)**

**c. UC 003: Cập nhật thông tin cá nhân**

**d. UC 004: Thay đổi mật khẩu**

**3.3.2. Các Use-cases dành cho Học viên (Learner)**

**a. UC 005: Xem Dashboard học tập cá nhân**

**b. UC 006: Học từ vựng mới theo chủ đề (Learn)**

**c. UC 007: Luyện tập thông qua Flashcard Spaced Repetition (Practice)**

**d. UC 008: Tự động cập nhật tiến trình học từ vựng (UserWordProgress thông qua SP)**

**e. UC 009: Làm đề thi thử (Mini Test)**

**f. UC 010: Xem lịch sử kiểm tra và đáp án chi tiết**

**g. UC 011: Xem bảng thành tích học tập và Huy hiệu (Achievements & Gamification)**

**3.3.3. Các Use-cases dành cho Biên tập viên (Content Creator)**

**a. UC 012: Xem Dashboard & Báo cáo số liệu Content Creator**

**b. UC 013: Quản lý Chủ đề (Topics CRUD - Trạng thái Draft)**

**c. UC 014: Quản lý Từ vựng & Câu ví dụ đi kèm (Words & Examples CRUD - Trạng thái Draft)**

**d. UC 015: Quản lý Câu hỏi ôn luyện (Questions CRUD - Trạng thái Draft)**

**e. UC 016: Quản lý Đề kiểm tra ngắn (Mini Tests CRUD - Trạng thái Draft)**

**f. UC 017: Quản lý Tệp đa phương tiện (Upload & Quản lý Media Assets - Hình ảnh/Âm thanh)**

**g. UC 018: Gửi nội dung yêu cầu phê duyệt (Submit for Review)**

**h. UC 019: Xem danh sách nội dung: Bản nháp (Drafts), Đang chờ duyệt (Pending), Bị từ chối kèm lý do (Rejected)**

**3.3.4. Các Use-cases dành cho Quản trị viên (Admin)**

**a. UC 020: Xem Dashboard Analytics hệ thống (Thống kê toàn cục)**

**b. UC 021: Quản lý Danh mục chủ đề (Topic Categories CRUD)**

**c. UC 022: Duyệt và phê duyệt nội dung của Biên tập viên (Approve/Reject Content)**

**c. UC 023: Ghi nhận nhật ký lịch sử duyệt bài (ContentReviewLogs)**

**d. UC 024: Quản lý tài khoản Học viên (Xem danh sách, Khóa/Mở khóa tài khoản)**

**e. UC 025: Xem báo cáo phân tích hiệu suất (Word Distribution & Daily attempts trends)
3.3.1 Use case dành cho tất cả người dùng**

**a. Đăng nhập**

| Mã Use case | UC 001 |  | Tên Usecase | Đăng nhập |
| --- | --- | --- | --- | --- |
| Tác nhân | Tất cả |  |  |  |
| Mô tả | Tác nhân đăng nhập hệ thống để sử dụng các chức năng phù hợp với vai trò của mình |  |  |  |
| Sự kiện kích hoạt | Kích vào nút đăng nhập trên giao diện |  |  |  |
| Tiền điều kiện | Tác nhân đã có tài khoản trên hệ thống |  |  |  |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống |  |
|  | 1 | Nhập tài khoản và mật khẩu vào ô textbox trên hệ thống (mô tả yêu cầu phía dưới) | Kiểm tra các trường đăng nhập đã hợp lệ hay chưa? |  |
|  | 2 | Yêu cầu đăng nhập | Kiểm tra tài khoản và mật khẩu có hợp lệ hay không |  |
|  | 3 |  | Hiển thị giao diện, chức năng tương ứng với vai trò của người dùng |  |
| Luồng sự kiện thay thế | STT | Hệ thống |  |  |
|  | 2a | Hiển thị thông báo lỗi: Cần nhập các trường bắt buộc nếu khách nhập thiếu |  |  |
|  | 2b | Hiển thị thông báo lỗi: Tên tài khoản hoặc mật khẩu sai |  |  |
|  | 2c | Hiển thị thông báo lỗi: vượt quá 5 lần nhập sai mật khẩu liên tiếp, tài khoản tạm khoá 5 phút |  |  |
| Hậu điều kiện | Tác nhân đăng nhập được vào hệ thống. |  |  |  |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 2 | Tên tài khoản | Input text field | Có | Các chữ cái thường, hoa, chữ số, không chứa dấu cách. | nhthanh |
| 3 | Mật khẩu | Input field | Có | Mật khẩu ít nhất 6 kí tự, không chứa kí tự đặc biệt | 123456 |

**b. Thay đổi mật khẩu**

| Mã Use case | UC 002 |  | Tên Usecase | Thay đổi mật khẩu |
| --- | --- | --- | --- | --- |
| Tác nhân | Tất cả |  |  |  |
| Mô tả | Tác nhân muốn thay đổi mật khẩu cho phù hợp với cá nhân mình, thao tác phải được thực hiện khi lần đầu đăng nhập hệ thống. |  |  |  |
| Sự kiện kích hoạt | Click vào nút item Thay đổi mật khẩu trên dropbox Profile của người dùng Đăng nhập lần đầu vào hệ thống. |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống |  |
|  | 1 | Nhập mật khẩu cũ vào ô textbox trên hệ thống, mật khẩu mới để thay đổi và xác minh lại mật khẩu mới trùng khớp với mật khẩu cần thay đổi. | Kiểm tra các trường đăng nhập đã hợp lệ hay chưa? |  |
|  | 2 | Yêu cầu thay đổi mật khẩu | Kiểm tra mật khẩu cũ, mật khẩu mới có trùng khớp hay không. |  |
|  |  |  | Hiển thị giao diện thông báo thay đổi mật khẩu thành công. |  |
| Luồng sự kiện thay thế | STT | Hệ thống |  |  |
|  | 2a | Hiển thị thông báo lỗi thông tin mật khẩu cũ không đúng hoặc mật khẩu không trùng khớp. |  |  |
| Hậu điều kiện | Mật khẩu mới được cập nhật vào hệ thống. |  |  |  |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Mật khẩu cũ | Input field | Có | Mật khẩu ít nhất 6 kí tự, có ký tự chữ hoa, chữ thường, không chứa kí tự đặc biệt. | Abc123 |
| 2 | Mật khẩu mới | Password field | Có | Mật khẩu ít nhất 6 kí tự, có ký tự chữ hoa, chữ thường, không chứa kí tự đặc biệt. | Abc123 |
| 3 | Nhập lại mật khẩu | Password field | Có | Theo quy tắc mật khẩu |  |

**c. Cập nhật thông tin cá nhân**

| Mã Use case | UC 003 |  | Tên Usecase | Cập nhật thông tin cá nhân |
| --- | --- | --- | --- | --- |
| Tác nhân | Tất cả |  |  |  |
| Mô tả | Tác nhân muốn thay đổi thông tin cho phù hợp với cá nhân mình. |  |  |  |
| Sự kiện kích hoạt | Click vào item Cập nhật thông tin cá nhân trên dropbox Profile của người dùng |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống |  |
|  | 1 | Điền thông tin muốn thay đổi (mô tả phía dưới) | Kiểm tra các thông tin nhập liệu của người dùng. |  |
|  | 2 | Yêu cầu cập nhật thay đổi | Hiển thị giao diện thông báo cập nhật thông tin thành công. |  |
| Luồng sự kiện thay thế | STT | Hệ thống |  |  |
|  | 1a | Hiển thị thông báo lỗi thông tin cập nhật không đúng hoặc không đủ. |  |  |
|  | 2a | Thông báo lỗi hệ thống không thể cập nhật thông tin |  |  |
| Hậu điều kiện | Cập nhật thành công, dữ liệu mới sẽ được lưu trữ trong hệ thống |  |  |  |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Họ tên | Input text field | Có | Các kí tự chữ hoa, thường có dấu cách. | Ngtha_01 |
| 2 | Email | Input email field | Không | Đúng định dạng email | nhthanh@gmail.com |
| 3 | Ngày sinh | DatePicker | Không | Ngày tháng hợp lệ | 15/04/1998 |
| 4 | Số điện thoại | Input text field | Không | Kí tự số | 0987324456 |
| 5 | Giới tính | Nam, Nữ, Khác | Có | Lựa chọn 1 trong 3 giá trị | Nữ |
| 6 | Phòng ban | Combobox lấy tên, id phòng ban từ dữ liệu phòng ban | Có | Lựa chọn giá trị | Xử lý dữ liệu ngành |
| 7 | Chức vụ | Combo box lấy tên, id chức vụ từ dữ liệu chức vụ | Có | Lựa chọn giá trị | Phó phòng |
| 7 | Ảnh | Ảnh đại diện | Không | Định dạng .png, .gif, .jpg, .jpeg |  |

**3.3.2 Use cases dành cho chuyên viên, lãnh đạo**

**a. Quản lý thư mục**

| Mã Use case | UC 004 – UC 011 |  | Tên Usecase | Quản lý thư mục |
| --- | --- | --- | --- | --- |
| Tác nhân | Chuyên viên, lãnh đạo |  |  |  |
| Mô tả | Thực hiện các tác vụ thêm mới, thay đổi, xóa, tìm kiếm thông tin thư mục, chia sẻ thư mục. |  |  |  |
| Sự kiện kích hoạt | Kích vào các nút Quản lý văn bản trên giao diện hệ thống |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống Chuyển đến thư mục nơi muốn thực hiện các thao tác thư mục |  |  |  |
| Luồng sự kiện chính (Thành công ) | STT | Tác nhân | Hệ thống |  |
|  | Xem danh sách thư mục |  |  |  |
|  | 1 | Kích vào thư mục cần xem | Hiển thị danh sách thư mục, file của thư mục vừa kích để người dùng có thể tiếp tục xem tiếp. |  |
|  | Thêm mới thư mục (UC 004) |  |  |  |
|  | 1 | Đưa yêu cầu thêm mới (Kích nút trên giao diện hệ thống) | Hiển thị menu chức năng tạo mới thư mục bằng một số cách. |  |
|  | 2a | Chọn Thư mục trong menu sổ xuống | Xuất hiện modal box để người dùng nhập tên thư mục mới. |  |
|  | 3a | Nhập tên thư mục, kích nút Tạo để hoàn tất thao tác | Kiểm tra vùng lưu trữ xem còn chỗ trống không? Nếu có tạo thành công thư mục có tên người dùng đã nhập trên hệ thống |  |
|  | 2b | Chọn Tải thư mục lên | Mở cửa sổ Browse thư mục trên máy người dùng |  |
|  | 3b | Chọn thư mục trên máy mình, kích nút Tải lên | Kiểm tra vùng lưu trữ xem còn chỗ trống không? Thêm thành công thư mục & toàn bộ file nằm trong thư mục người dùng trên hệ thống. |  |
| Luồng sự kiện thay thế | 3c | Tên thư mục để trống | Thông báo lỗi, tên thư mục không được để trống. |  |
|  | 3d |  | Vùng lưu trữ đã đầy không thể tạo mới thư mục. Thông báo tạo thư mục không thành công. |  |
|  | Xoá thư mục (UC 005) |  |  |  |
| Luồng sự kiện chính | 1 | Ấn phím Ctrl (đối với windows/linux) + chuột phải để đánh dấu các thư mục cần thao tác | Highlight thư mục đã chọn |  |
|  | 2 | Kích nút xoá trên thanh công cụ | Hiển thị popup “Bạn có chắc chắn muốn xoá ?” |  |
|  | 3 | Xác nhận đồng ý xóa | Chuyển các thư mục đánh dấu xoá vào thùng rác |  |
| Luồng sự kiện thay thế | 3b | Không đồng ý xóa | Thư mục vẫn tồn tại ở vùng lưu trữ |  |
|  | Đổi tên thư mục (UC 006) |  |  |  |
| Luồng sự kiện chính | 1 | Đưa yêu cầu đổi tên thư mục (Kích chọn chức năng Đổi tên từ menu sổ xuống khi kích chuột phải vào tên thư mục hoặc từ menu gắn với tên Thư mục) | Xuất hiện hộp thoại với Tên thư mục được đánh dấu để sẵn sàng sửa |  |
|  | 2 | Thay đổi tên thư mục theo ý muốn. | Hiển thị tên theo nội dung người dùng thay đổi |  |
|  | 3 | Nhấn phím Enter để hoàn tất quá trình thay đổi hoặc kích vào “Đồng ý”. | Thông báo thay đổi thành công. Thư mục được đặt lại tên theo tên mới. |  |
| Luồng sự kiện thay thế | 3a | Tên thư mục để trống | Tên không để trống, quay trở về tên cũ trước khi đổi. |  |
|  | Xoá vĩnh viễn thư mục (UC 007) |  |  |  |
| Luồng sự kiện chính | 1 | Kích chọn chức năng thùng rác | Hiển thị giao diện các thư mục/file đang ở trong thùng rác |  |
|  | 2 | Chọn file muốn xóa Kích nút “Xóa” trên cửa sổ. | Hiển thị popup xác nhận việc xóa. |  |
|  | 3 | Xác nhận xóa | Xoá vĩnh viễn các thư mục tồn tại trên hệ thống trong mục thùng rác. |  |
| Luồng sự kiện thay thế | 3a | Không xác nhận xóa | Không xóa thư mục trong thùng rác. |  |
|  | Kéo di chuyển thư mục (UC 008) |  |  |  |
| Luồng sự kiện chính | 1 | Kéo thư mục muốn di chuyển chuyển đến vị trí mới (thư mục mới). | Thư mục được kéo xuất hiện tại vị trí đã kéo vào |  |
| Luồng sự kiện thay thế | 1a | Quá trình kéo thả chuột không đúng vị trí | Thư mục chưa được đặt vào vị trí mới |  |
|  | Tải thư mục xuống (UC 009) |  |  |  |
|  | 1 | Đưa yêu cầu tải thư mục | Xuất hiện cửa sổ để chọn nơi ghi thư mục trên máy tính người dùng |  |
|  | 2 | Chọn thư mục để ghi vào | Ghi toàn bộ nội dung thư mục vào nơi người dùng đã chọn |  |
|  | Chia sẻ thư mục (UC 010) |  |  |  |
| Luồng sự kiện chính | 1 | Đưa yêu cầu chia sẻ thư mục (Kích mục Chia sẻ trong menu sổ xuống khi kích vào thư mục) | Hiển thị cửa sổ cho phép chọn người được chia sẻ. |  |
|  | 2 | Tìm tên người muốn chia sẻ (có thể gõ một số ký tự gợi ý) | Hiển thị thành viên hệ thống theo tên đã nhập. |  |
|  | 3 | Chọn thành viên muốn chia sẻ | Tên thành viên được chọn xuất hiện trong hộp chia sẻ |  |
|  | 4 | Kích nút Chia sẻ để xác nhận thông tin chia sẻ. | Ghi lại thông tin chia sẻ của thư mục. |  |
|  | Bỏ chia sẻ (UC 011) |  |  |  |
| Luồng sự kiện chính | 1 | Đưa yêu cầu chia sẻ (Kích mục chia sẻ trên menu sổ xuống khi kích chuột phải vào thư mục) | Hiển thị danh sách người dùng đã được chia sẻ của thư mục |  |
|  | 2 | Kích chọn Bỏ chia sẻ để không chia sẻ cho người dùng đã chọn. | Danh sách chia sẻ được cập nhật trong CSDL. Bỏ chia sẻ thành công. |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |

**b. Quản lý file văn bản**

| Mã Use case | UC 012 – UC 020 |  |  | Tên Usecase |  | Quản lý file |
| --- | --- | --- | --- | --- | --- | --- |
| Tác nhân | Chuyên viên, lãnh đạo |  |  |  |  |  |
| Mô tả | Thực hiện các tác vụ thêm mới, thay đổi, xóa, chia sẻ, tải xuống văn bản |  |  |  |  |  |
| Sự kiện kích hoạt | Kích vào các nút Quản lý văn bản trên giao diện hệ thống |  |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống. Chuyển đến thư mục nơi muốn thực hiện các thao tác với văn bản |  |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |  |
|  | Xem danh sách file (UC 012) |  |  |  |  |  |
| Luồng sự kiện chính (Thành công ) | 1 | Kích vào thư mục cần xem |  | Hiển thị danh sách thư mục, file văn bản của thư mục vừa kích để người dùng có thể tiếp tục xem tiếp. |  |  |
|  | Thêm mới văn bản (UC 013) |  |  |  |  |  |
| Luồng sự kiện chính (Thành công ) Luồng sự kiện thay  thế | 1 | Đưa yêu cầu thêm mới file  văn bản (Kích nút trên giao diện hệ thống) |  | Hiển thị menu chức năng tạo mới văn bản bằng một số cách. |  |  |
|  | 2a | Chọn chức năng tạo mới ngay trong hệ thống. |  | Xuất hiện modal box để người dùng đặt tên file mới. |  |  |
|  | 3a | Kích nút Tạo để hoàn tất thao tác |  | Tạo thành công file văn bản mới. |  |  |
|  | 2b | Tải file lên |  | Xuất hiện cửa sổ chọn file (chỉ các file văn bản .doc, .docx, .pdf) |  |  |
|  | 3b | Chọn văn bản muốn đưa lên |  | Tạo thành công văn bản mới. Văn bản xuất hiện ở thư mục đang chọn |  |  |
|  | Xoá văn bản (UC 014) |  |  |  |  |  |
| Luồng sự kiện chính (Thành công ) | 1 | Ấn phím Ctrl (đối với windows/linux) + chuột phải để đánh dấu các file cần thao tác |  | Highligh file đã chọn |  |  |
|  | 2 | Kích chọn nút Xoá trên thanh công cụ |  | Hiển thị popup “Bạn có chắc chắn muốn xoá?” |  |  |
|  | 3 | Kích nút lệnh “ Đồng ý “ |  | Chuyển các file văn bản được đánh dấu xoá vào thùng rác. |  |  |
|  | Sửa tên văn bản (UC 015) |  |  |  |  |  |
| Luồng sự kiện chính (Thành công ) | 1 | Kích chọn chức năng Đổi tên (từ menu sổ xuống khi kích chuột phải vào tên file hoặc từ menu gắn với tên file) |  | Xuất hiện hộp thoại với Tên file văn bản được đánh dấu để sẵn sàng sửa |  |  |
|  | 2 | Thay đổi tên file theo ý muốn. |  | Hiển thị tên theo nội dung người dùng thay đổi |  |  |
|  | 3 | Nhấn phím Enter để hoàn tất quá trình thay đổi hoặc kích vào “Đồng ý”. |  | Thông báo thay đổi thành công |  |  |
|  | Xoá vĩnh viễn văn bản (UC 016) |  |  |  |  |  |
| Luồng sự kiện chính (Thành công ) | 1 | Kích chọn chức năng thùng rác |  | Hiển thị giao diện các thư mục/file đang ở trong thùng rác |  |  |
|  | 2 | Chọn file muốn xóa. Kích nút Xóa trên giao diện |  | Xoá vĩnh viễn các file tồn tại trên hệ thống trong mục thùng rác. |  |  |
|  | Kéo di chuyển văn bản (UC 017) |  |  |  |  |  |
| Luồng sự kiện chính (Thành công ) | 1 |  | Kéo văn bản muốn di chuyển chuyển đến vị trí mới (thư mục mới). |  | File văn bản được kéo xuất hiện tại vị trí đã kéo vào |  |
| Luống sự kiện thay thế | 1a |  | Quá trình kéo thả chuột không đúng vị trí |  | Văn bản chưa được đặt vào vị trí mới |  |
|  | Tải văn bản xuống (UC 018) |  |  |  |  |  |
| Luồng sự kiện chính (Thành công ) | 1 |  | Đưa yêu cầu tải văn bản |  | Xuất hiện cửa sổ để chọn nơi ghi văn bản trên máy tính người dùng |  |
|  | 2 |  | Chọn thư mục để ghi vào |  | Ghi file vào nơi người dùng đã chọn |  |
|  | Chia sẻ văn bản (UC 019) |  |  |  |  |  |
| Luồng sự kiện chính (Thành công ) | 1 |  | Đưa yêu cầu chia sẻ văn bản (Kích mục Chia sẻ trong menu sổ xuống khi kích vào văn bản) |  | Hiển thị cửa sổ cho phép chọn người được chia sẻ. |  |
|  | 2 |  | Tìm tên người muốn chia sẻ |  | Hiển thị thành viên hệ thống theo tên đã nhập. |  |
|  | 3 |  | Chọn thành viên muốn chia sẻ |  | Tên thành viên được chọn xuất hiện trong hộp chia sẻ |  |
|  | 4 |  | Kích nút Chia sẻ để xác nhận thông tin chia sẻ. |  | Ghi lại thông tin chia sẻ của file. |  |
|  | Bỏ chia sẻ văn bản (UC 020) |  |  |  |  |  |
| Luồng sự kiện chính (Thành công ) | 1 |  | Kích mục chia sẻ trên menu sổ xuống khi kích chuột phải vào |  | Hiển thị danh sách người dùng đã được chia sẻ của file văn bản |  |
|  | 2 |  | Kích chọn Bỏ chia sẻ để không chia sẻ cho người dùng đã chọn. |  | Danh sách chia sẻ được cập nhật trong CSDL. Bỏ chia sẻ thành công. |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |  |

**c. Quản lý chủ đề**

| Mã Use case | UC 021 – UC 027 |  |  |  | Tên Usecase | Quản lý chủ đề/sự kiện |
| --- | --- | --- | --- | --- | --- | --- |
| Tác nhân | Chuyên viên, lãnh đạo |  |  |  |  |  |
| Mô tả | Quản lý tất cả các chủ đề do người dùng tạo ra cũng như được chia sẻ để thuận tiện cho việc tóm tắt |  |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng quản lí chủ đề trên giao diện hệ thống |  |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |  |
|  | Xem danh sách chủ đề (UC 021) |  |  |  |  |  |
| Luồng sự kiện chính | STT |  | Tác nhân | Hệ thống |  |  |
|  | 1 |  | Đưa yêu cầu xem danh sách chủ đề trên giao diện (kích chọn menu Quản lý chủ đề) | Hiển thị danh sách chủ đề do tác nhân quản lý, mỗi chủ đề trên một dòng. |  |  |
| Luồng sự kiện phụ | 1a |  |  | Thông báo khi chưa có chủ đề nào. |  |  |
|  | Thêm chủ đề (UC 022) |  |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |  |
|  | 1 | Kích chọn chức năng thêm mới trên giao diện. |  |  | Hiển thị giao diện để nhập các trường dữ liệu thêm vào. |  |
|  | 2 | Nhập các trường dữ liệu vào các ô textbox tương ứng (*) |  |  | Giao diện thay đổi theo dữ liệu người dùng đưa vào |  |
|  | 2a | Kích nút Tải file để chọn các file lấy từ khóa |  |  | Hệ thống tự động xác định từ khóa của file đưa vào hộp danh sách từ khóa |  |
|  | 3a | Kéo từ khóa từ hộp danh sách vào các ô cần dùng (AND, OR) theo quy tắc các từ khóa trên cùng một dòng là quy tắc AND, OR với từ khóa trên dòng khác và ô NOT. |  |  | Các từ khóa được để đúng ô tác nhân đã kéo. |  |
|  | 4 | Chọn nút “Lưu" để lưu chủ đề đã tạo |  |  | Hệ thống lưu chủ đề vào CSDL và thông báo lưu chủ đề thành công. |  |
| Luồng sự kiện thay thế | STT | Tác nhân |  |  | Hệ thống |  |
|  | 2a | Không nhập tên chủ đề |  |  | Thông báo không được phép để trống |  |
|  | 3b | Cả 3 ô OR, AND, NOT đều để trống |  |  | Thông báo không được phép để trống cả ba (ít nhất phải có 1 hộp có giá trị) |  |
|  | Sửa thông tin chủ đề (UC 023) |  |  |  |  |  |
|  | STT | Tác nhân |  |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu sửa chủ đề (Kích mục Sửa trong menu sổ xuống ứng với dòng thông tin của chủ đề muốn sửa) |  |  | Hiển thị giao diện chứa thông tin chi tiết về chủ đề đã chọn. |  |
|  | 3 | Chỉnh sửa các trường thông tin (*) |  |  | Hiển thị giao diện theo thông tin sửa đổi |  |
|  | 4 | Kích nút Lưu để ghi lại thông tin đã sửa. |  |  | Ghi lại thông tin thay đổi của chủ đề vào CSDL và thông báo thay đổi thành công |  |
| Luồng sự kiện thay thế | 2a | Không nhập tên chủ đề |  |  | Thông báo không được phép để trống |  |
|  | 2b | Cả 3 ô OR, AND, NOT đều để trống |  |  | Thông báo không được phép để trống cả ba (ít nhất phải có 1 hộp có giá trị) |  |
|  | Xóa chủ đề (UC 024) |  |  |  |  |  |
|  | STT | Tác nhân |  |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu xóa chủ để (Kích mục Xóa trong menu sổ xuống ứng với dòng thông tin của chủ đề muốn xóa) |  |  | Hiển thị thông báo xác nhận việc xóa. |  |
|  | 3 | Xác nhận đồng ý xóa |  |  | Xóa chủ đề trong CSDL và thông báo xóa thành công. |  |
| Luồng sự kiện thay thế | 3a | Không xác nhận đồng ý |  |  | Không xóa chủ đề. Hiển thị chủ đề như trước. |  |
|  | Chia sẻ chủ đề (UC 025) |  |  |  |  |  |
|  | STT | Tác nhân |  |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu chia sẻ chủ đề (Kích mục Chia sẻ trong menu sổ xuống ứng với dòng thông tin của chủ đề muốn chia sẻ) |  |  | Hiển thị cửa sổ cho phép chọn người được chia sẻ. |  |
|  | 3 | Tìm tên người muốn chia sẻ |  |  | Hiển thị thành viên hệ thống có thể được chia sẻ (*) theo tên đã nhập. |  |
|  | 4 | Chọn thành viên muốn chia sẻ |  |  | Tên thành viên được chọn xuất hiện trong hộp chia sẻ |  |
|  | 5 | Kích nút Chia sẻ để xác nhận thông tin chia sẻ. |  |  | Ghi lại thông tin chia sẻ chủ đề. |  |
| Luồng sự kiện thay thế | 4a | Không chọn thành viên |  |  | Không thực hiện được chia sẻ |  |
|  | Bỏ chia sẻ chủ đề (UC 026) |  |  |  |  |  |
|  | STT | Tác nhân |  |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Kích mục chia sẻ trên dòng thông tin của chủ đề |  |  | Hiển thị danh sách người dùng đã được chia sẻ chủ đề |  |
|  | 3 | Kích chọn Bỏ chia sẻ để không chia sẻ cho người dùng đã chọn. |  |  | Danh sách chia sẻ được cập nhật trong CSDL. Bỏ chia sẻ thành công. |  |
| Luồng sự kiện thay thế | 3a | Không kích bỏ chọn |  |  | Chủ đề vẫn được chia sẻ cho thành viên đó. |  |
|  | Tìm kiếm chủ đề (UC 027) |  |  |  |  |  |
|  | STT | Tác nhân |  |  | Hệ thống |  |
| Luồng sự kiện chính (Thành công ) | 2 | Đưa yêu cầu tìm kiếm về: tên chủ đề, từ khóa, lĩnh vực, khoảng thời gian tạo chủ đề. |  |  | Trả lại kết quả tìm kiếm tổng hợp các điều kiện trên. |  |
| Luồng sự kiện thay thế | 2a |  |  |  | Trường hợp không có chủ đề nào thỏa mãn điều kiện tìm kiếm thông báo không tìm thấy chủ đề. |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |  |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Tên chủ đề | Input text field | Có | Các kí tự chữ hoa, thường có dấu cách. | Seagames |
| 2 | Tên lĩnh vực | Combobox lấy tên, id lĩnh vực bảng dữ liệu phòng ban | Có | Các kí tự chữ hoa, thường có dấu cách | Thể thao |
| 3 | Mô tả chủ đề | Input textarea | Không | Các kí tự chữ hoa, thường có dấu cách |  |
| 4 | Danh sách từ khóa AND, OR | Multi-select | Không |  |  |
| 5 | Danh sách từ khóa NOT | Multi-select | Không |  |  |

**(*): Quy tắc chia sẻ**

- Nếu là nhân viên bình thường chỉ danh sách nhân viên cùng phòng, lãnh đạo phòng, lãnh đạo Cục trực tiếp quản lý.

- Nếu là lãnh đạo phòng ngoài chia sẻ cho các nhân viên phòng mình thì còn có thể chia sẻ được cho các lãnh đạo phòng khác.

**d. Quản lý sự kiện**

| Mã Use case | UC 028 – UC 034 |  |  | Tên Usecase | Quản lý sự kiện |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Chuyên viên, lãnh đạo |  |  |  |  |
| Mô tả | Quản lý tất cả các sự kiện do người dùng tạo ra cũng như được chia sẻ để thuận tiện cho việc tóm tắt |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng quản lí sự kiện trên giao diện hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
|  | Xem danh sách sự kiện (UC 028) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Đưa yêu cầu xem danh sách chủ đề trên giao diện (kích chọn menu Quản lý sự kiện) | Hiển thị danh sách sự kiện do tác nhân quản lý, mỗi sự kiện trên một dòng. |  |  |
| Luồng sự kiện phụ | 1a |  | Thông báo khi chưa có sự kiện nào. |  |  |
|  | Thêm sự kiện (UC 029) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Kích chọn chức năng thêm mới trên giao diện. |  | Hiển thị giao diện để nhập các trường dữ liệu thêm vào. |  |
|  | 2 | Nhập các trường dữ liệu vào các ô textbox tương ứng (*) |  | Giao diện thay đổi theo dữ liệu người dùng đưa vào |  |
|  | 2a | Kích nút Tải file để chọn các file lấy từ khóa |  | Hệ thống tự động xác định từ khóa của file đưa vào hộp danh sách từ khóa |  |
|  | 2a’ | Chọn chủ đề để lấy từ khóa của chủ đề |  | Các từ khóa chủ đề được chọn xuất hiện trong hộp Từ khóa của chủ đề. |  |
|  | 3a | Kéo từ khóa từ hộp danh sách vào các ô cần dùng (AND, NOT) |  | Các từ khóa được để đúng ô tác nhân đã kéo. |  |
|  | 4 | Chọn nút “Lưu" để lưu sự kiện đã tạo |  | Hệ thống lưu sự kiện vào CSDL và thông báo lưu sự kiện thành công. |  |
| Luồng sự kiện thay thế | STT | Tác nhân |  | Hệ thống |  |
|  | 2a | Không nhập tên sự kiện |  | Thông báo không được phép để trống |  |
|  | 3b | Cả 3 ô OR, AND, NOT đều để trống |  | Thông báo không được phép để trống cả ba (ít nhất phải có 1 hộp có giá trị) |  |
|  | Sửa thông tin sự kiện (UC 030) |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu sửa sự kiện (Kích mục Sửa trong menu sổ xuống ứng với dòng thông tin của chủ đề muốn sửa) |  | Hiển thị giao diện chứa thông tin chi tiết về sự kiện đã chọn. |  |
|  | 3 | Chỉnh sửa các trường thông tin (*) |  | Hiển thị giao diện theo thông tin sửa đổi |  |
|  | 4 | Kích nút Lưu để ghi lại thông tin đã sửa. |  | Ghi lại thông tin thay đổi của sự kiện vào CSDL và thông báo thay đổi thành công |  |
| Luồng sự kiện thay thế | 2a | Không nhập tên sự kiện |  | Thông báo không được phép để trống |  |
|  | 3b | Cả 3 ô OR, AND, NOT đều để trống |  | Thông báo không được phép để trống cả ba (ít nhất phải có 1 hộp có giá trị) |  |
|  | Xóa sự kiện (UC 031) |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu xóa sự kiện (Kích mục Xóa trong menu sổ xuống ứng với dòng thông tin của sự kiện muốn xóa) |  | Hiển thị thông báo xác nhận việc xóa. |  |
|  | 3 | Xác nhận đồng ý xóa |  | Xóa sự kiện trong CSDL và thông báo xóa thành công. |  |
| Luồng sự kiện thay thế | 3a | Không xác nhận xóa |  | Không xóa sự kiện trong CSDL |  |
| Chia sẻ sự kiện (UC 032) |  |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu chia sẻ sự kiện (Kích mục Chia sẻ trong menu sổ xuống ứng với dòng thông tin của sự kiện muốn chia sẻ) |  | Hiển thị cửa sổ cho phép chọn người được chia sẻ. |  |
|  | 3 | Tìm tên người muốn chia sẻ |  | Hiển thị thành viên hệ thống theo tên đã nhập. |  |
|  | 4 | Chọn thành viên muốn chia sẻ |  | Tên thành viên được chọn xuất hiện trong hộp chia sẻ |  |
|  | 5 | Kích nút Chia sẻ để xác nhận thông tin chia sẻ. |  | Ghi lại thông tin chia sẻ sự kiện. |  |
| Luồng sự kiện thay thế | 4a | Không chọn thành viên nào |  | Không thực hiện chia sẻ |  |
|  | Bỏ chia sẻ sự kiện (UC033) |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Kích mục chia sẻ trên dòng thông tin của sự kiện |  | Hiển thị danh sách người dùng đã được chia sẻ sự kiện |  |
|  | 3 | Kích chọn Bỏ chia sẻ để không chia sẻ cho người dùng đã chọn. |  | Danh sách chia sẻ được cập nhật trong CSDL. Bỏ chia sẻ thành công. |  |
| Luồng sự kiện thay thế | 3a | Không kích chọn Bỏ chia sẻ |  | Bỏ chia sẻ không thành công. Người dùng vẫn nhận được chia sẻ sự kiện. |  |
| Tìm kiếm sự kiện  (UC034) |  |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu tìm kiếm về: tên sự kiện, từ khóa, lĩnh vực, khoảng thời gian của sự kiện. |  | Trả lại kết quả tìm kiếm tổng hợp các điều kiện trên. |  |
| Luồng sự kiện thay thế | 2a |  |  | Không tìm được kết quả thỏa mãn. |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

*Dữ liệu đầu vào gồm các trường dữ liệu sau:

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
|  | Tên sự kiện | Input text field | Có | Các kí tự chữ hoa, thường có dấu cách. | Sự kiện 11-9 |
|  | Mô tả sự kiện | Textarea | Không | Các kí tự chữ hoa, chữ số, chữ thường có dấu cách |  |
|  | Tên quốc gia | Combobox lấy tên, id quốc gia bảng dữ liệu quốc gia | Không | Các kí tự chữ hoa, thường có dấu cách | Mỹ |
|  | Khu vực | Combobox lấy tên, id khu vực bảng dữ liệu khu vực |  |  | Châu Mỹ |
|  | Lĩnh vực | Combobox lấy tên, id lĩnh vực bảng dữ liệu lĩnh vực |  |  |  |
|  | Thời gian bắt đầu thu thập | DatePicker | Không | Ngày tháng hợp lệ |  |
|  | Thời gian kết thúc thu thập | DatePicker | Không | Ngày tháng hợp lệ |  |
|  | Danh sách từ khóa OR | Multi-select | Không |  |  |
|  | Danh sách từ khóa AND | Multi-select | Không |  |  |
|  | Danh sách từ khóa NOT | Multi-select | Không |  |  |

**e. Đặc tả chức năng Tóm tắt văn bản**

Đặc tả chức năng Tóm tắt đơn/đa văn bản

Đặc tả chức năng Tóm tắt đơn văn bản

| Mã Use case | UC 035 – UC 037 |  | Tên Usecase | Quản lý các tóm tắt |
| --- | --- | --- | --- | --- |
| Tác nhân | Chuyên viên, lãnh đạo |  |  |  |
| Mô tả | Cho phép tác nhân xem danh sách tóm tắt mình đã thực hiện theo thời gian từ mới đến cũ |  |  |  |
| Sự kiện kích hoạt | Kích chọn chức năng Tóm tắt đơn văn bản trên giao diện hệ thống |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |
|  | Xem các văn bản đã tóm tắt (UC 035) |  |  |  |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống |  |
|  | 1 |  | Hiển thị danh sách tóm tắt theo thời gian từ mới đến cũ theo ngày tóm tắt. |  |
| Luồng sự kiện thay thế | 1a |  | Thông báo không có tóm tắt nào đã được thực hiện. |  |
|  | Sửa tóm tắt (UC 036) |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |
|  | 2 | Đưa yêu cầu sửa bản tóm tắt | Hiển thị nội dung đã thực hiện tóm tắt trên các ô dữ liệu tương ứng (văn bản đầu vào, văn bản tóm tắt) |  |
|  | 3 | Thực hiện tóm tắt theo mong muốn (Theo UC 038 - Tóm tắt) | Hiển thị các kết quả theo điều chỉnh của người dùng |  |
|  | 4 | Đưa yêu cầu ghi lại các thay đổi | Xác nhận người dùng muốn ghi đè lên bản cũ hay tạo bản mới. |  |
|  | 5 | Xác nhận lựa chọn | Ghi thay đổi vào CSDL theo lựa chọn của người dùng. Thông báo thay đổi thành công |  |
| Luồng sự kiện thay thế | 4a | Không lưu lại thay đổi | Bản sửa không cập nhật, CSDL không thay đổi. |  |
|  | Xóa bản tóm tắt (UC 037) |  |  |  |
|  | STT | Tác nhân | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu xóa bản tóm tắt (khi vùng lưu trữ của người dùng gần hết) | Xuất hiện hộp thoại xác nhận việc xóa |  |
|  | 3 | Xác nhận xóa | Xóa bản ghi trong CSDL. Thông báo xóa thành công |  |
| Luồng sự kiện thay thế | 3a | Xác nhận không xóa | Không xóa dữ liệu, CSDL không thay đổi |  |
| Hậu điều kiện | Hệ thống cập nhật các thay đổi. |  |  |  |

| Mã Use case | UC 038 |  |  |  |  |  | Tên Usecase | Tóm tắt đơn văn bản |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tác nhân | Nhân viên, lãnh đạo |  |  |  |  |  |  |  |
| Mô tả | Thực hiện các chức năng tóm tắt đơn văn bản bao gồm trích rút, tóm lược. |  |  |  |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng tóm tắt đơn văn bản trên giao diện hệ thống, hệ thống xuất hiện cửa sổ mặc định thực hiện tóm lược văn bản. |  |  |  |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công vào hệ thống |  |  |  |  |  |  |  |
| Tóm tắt (Tóm lược/trích rút) văn bản |  |  |  |  |  |  |  |  |
| Trường hợp tóm lược |  |  |  |  |  |  |  |  |
| Luồng sự kiện chính (Thành công ) | STT |  | Tác nhân |  |  |  | Hệ thống |  |
|  | 1 |  | Đưa dữ liệu vào thực hiện tóm tắt theo 2 cách |  |  |  | Hiển thị giao diện tương ứng |  |
|  | 1.1 |  | Kích nút tải file trên giao diện tóm tắt |  |  |  | Xuất hiện hộp thoại cho phép người dùng chọn file từ máy tính hoặc từ drive (vùng lưu trữ trên hệ thống) của mình. |  |
|  | 1.2 |  | Sao chép dữ liệu văn bản từ một nơi khác, dán vào hộp chứa văn bản. |  |  |  |  |  |
|  | 2 |  |  |  |  |  | Hiển thị nội dung cần tóm tắt trong hộp chứa văn bản gốc. Cho phép người dùng có thể thay đổi nội dung trong hộp văn bản |  |
|  | 3 |  | Kích vào nút Tóm tắt |  |  |  | Thực hiện tóm tắt văn bản Hiển thị hộp thoại hỏi có tiếp tục tóm tắt hay không nếu văn bản đang tóm tắt hoặc ở trạng thái chờ tóm tắt (4a). |  |
|  | 4 |  |  |  |  |  | Hiển thị kết quả tóm tắt trên hộp chứa văn bản tóm tắt sau khi tóm tắt xong. |  |
|  | 4a |  | Kích nút Tóm tắt lại |  |  |  | Quay về giao diện như lúc bắt đầu tóm tắt |  |
|  | 5a |  | Kích nút Tiếp tục tóm tắt |  |  |  | Hệ thống thực hiện tóm tắt văn bản, hiển thị trạng thái (chờ tóm tắt nếu tài nguyên máy chủ đang thực hiện tóm tắt khác hoặc đang tóm tắt nếu máy chủ đã sẵn sàng). Hiển thị kết quả tóm tắt trên hộp chứa văn bản tóm tắt sau khi tóm tắt xong. |  |
| Luồng sự kiện thay thế | STT |  | Tác nhân |  |  |  | Hệ thống |  |
|  | 1.1a |  | Không chọn file nào |  |  |  | Hộp chứa văn bản gốc trống. Không thực hiện được việc tóm tắt. |  |
|  | 1.2a |  | Không sao chép dữ liệu |  |  |  | Hộp chứa văn bản gốc trống. |  |
| Trường hợp trích rút |  |  |  |  |  |  |  |  |
|  |  | 1 |  |  | Kích tab Trích rút nếu muốn thực hiện trích rút văn bản, các bước thực hiện tương tự như trường hợp Tóm tắt |  |  |  |
| Tóm tắt theo chủ đề |  |  |  |  |  |  |  |  |
| Luồng sự kiện chính (thành công) | STT |  |  | Tác nhân |  |  | Hệ thống |  |
|  | 5 |  |  | Kích chọn Chủ đề |  |  | Xuất hiện hộp thoại hiển thị danh mục các chủ đề của người dùng |  |
|  | 6 |  |  | Lựa chọn chủ đề muốn tóm tắt bằng cách tích chọn trong hộp thoại |  |  | Các chủ đề người dùng đã tích chọn xuất hiện trong ô Chủ đề trong cửa sổ tóm tắt |  |
|  | 7 |  |  | Kích vào từng chủ đề muốn xem nội dung tóm tắt. |  |  | Hiển thị kết quả tóm tắt theo chủ đề trên hộp thoại chứa văn bản tóm tắt |  |
| Luồng sự kiện thay thế | STT |  | Tác nhân |  |  |  | Hệ thống |  |
|  | 7a |  | Không chọn chủ đề nào |  |  |  | Hiển thị kết quả tóm tắt toàn văn bản |  |
| Tóm tắt tùy chỉnh độ dài |  |  |  |  |  |  |  |  |
| Luồng sự kiện chính (thành công) | STT |  |  | Tác nhân |  |  | Hệ thống |  |
|  | 5 |  |  | Bỏ chọn chủ đề trên hộp chủ đề. |  |  |  |  |
|  | 6 |  |  | Kéo chọn thanh độ dài văn bản tóm tắt đến mức độ mong muốn |  |  | Độ dài mong muốn hiển thị bằng màu xám trên thanh kéo. Giá trị % thay đổi theo độ dài người dùng đã kéo |  |
|  | 7 |  |  | Kích vào nút Tóm tắt |  |  | Hiển thị kết quả tóm tắt theo độ dài người dùng mong muốn hộp thoại chứa văn bản tóm tắt. |  |
| Đánh dấu thực thể |  |  |  |  |  |  |  |  |
| Luồng sự kiện chính (thành công) | STT |  |  | Tác nhân |  |  | Hệ thống |  |
|  | 5 |  |  | Kích nút Đánh dấu thực thể |  |  | Các thực thể được đánh dấu bằng màu sắc khác (vàng) trong hộp thoại chứa văn bản kết quả tóm tắt. |  |
| Ghi lại văn bản tóm tắt |  |  |  |  |  |  |  |  |
| Luồng sự kiện chính (thành công) | STT |  |  | Tác nhân |  |  | Hệ thống |  |
|  | 5 |  |  | Người dùng thay đổi nội dung tóm tắt trong hộp kết quả tóm tắt |  |  | Hộp kết quả tóm tắt thay đổi theo nội dung người dùng đưa vào |  |
|  | 6 |  |  | Kích vào biểu tượng Ghi văn bản tóm tắt |  |  | Hệ thống ghi lại văn bản tóm tắt vào CSDL. |  |
| Lưu lại file văn bản tóm tắt |  |  |  |  |  |  |  |  |
| Luồng sự kiện chính (thành công) | STT |  |  | Tác nhân |  |  | Hệ thống |  |
|  | 5 |  |  | Kích vào biểu tượng Lưu văn bản tóm tắt |  |  | Mở hộp thoại File trên máy tính để người dùng chọn thư mục lưu lại. |  |
|  | 6 |  |  | Kích OK để hoàn tất việc ghi file tóm tắt văn bản. |  |  | Hệ thống ghi file tóm tắt (.docx) vào thư mục người dùng đã chọn. |  |
| Sao chép văn bản tóm tắt |  |  |  |  |  |  |  |  |
| STT Tác nhân Hệ thống 5 Kích vào biểu tượng Sao chép Sao chép nội dung trong hộp tóm tắt 6 Có thể dán nội dung đã sao chép vào bất kỳ chỗ nào. |  |  |  |  |  |  |  |  |
| In văn bản tóm tắt |  |  |  |  |  |  |  |  |
|  | STT |  |  | Tác nhân |  |  | Hệ thống |  |
|  | 5 |  |  | Kích vào biểu tượng In văn bản |  |  | Mở hộp thoại chọn máy in để in văn bản. |  |
|  | 6 |  |  | Kích nút In ấn để hoàn tất việc lựa chọn. |  |  | Hệ thống thực hiện in đoạn văn bản tóm tắt trên hộp tóm tắt. |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |  |  |  |

Đặc tả chức năng Tóm tắt đa văn bản

| Mã Use case | UC 039 – UC 41 |  | Tên Usecase | Quản lý các tóm tắt đa văn bản |
| --- | --- | --- | --- | --- |
| Tác nhân | Chuyên viên, lãnh đạo |  |  |  |
| Mô tả | Cho phép tác nhân xem danh sách tóm tắt mình đã thực hiện theo thời gian từ mới đến cũ, thay đổi nội dung tóm tắt, xóa đi nếu vùng lưu trữ đã đầy. |  |  |  |
| Sự kiện kích hoạt | Kích chọn chức năng Tóm tắt đa văn bản trên giao diện hệ thống |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |
|  | Xem các văn bản đã tóm tắt (UC 039) |  |  |  |
| Luồng sự kiện chính (Thành công) | STT | Tác nhân | Hệ thống |  |
|  | 1 |  | Hiển thị danh sách tóm tắt theo thời gian từ mới đến cũ theo ngày tóm tắt. |  |
| Luồng sự kiện thay thế | 1a |  | Thông báo không có tóm tắt đa văn bản nào đã được thực hiện. |  |
|  | Sửa tóm tắt (UC 040) |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |
|  | 2 | Đưa yêu cầu sửa bản tóm tắt | Hiển thị nội dung đã thực hiện tóm tắt trên các ô dữ liệu tương ứng (văn bản đầu vào, văn bản tóm tắt) |  |
|  | 3 | Thực hiện tóm tắt theo mong muốn (Theo UC 042 - Tóm tắt đa văn bản) | Hiển thị các kết quả theo điều chỉnh của người dùng |  |
|  | 4 | Đưa yêu cầu ghi lại các thay đổi | Xác nhận người dùng muốn ghi đè lên bản cũ hay tạo bản mới. |  |
|  | 5 | Xác nhận lựa chọn | Ghi thay đổi vào CSDL theo lựa chọn của người dùng. Thông báo thay đổi thành công |  |
| Luồng sự kiện thay thế | 4a | Không lưu lại thay đổi | Bản sửa không cập nhật, CSDL không thay đổi. |  |
|  | Xóa bản tóm tắt (UC 041) |  |  |  |
|  | STT | Tác nhân | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu xóa bản tóm tắt (khi vùng lưu trữ của người dùng gần hết) | Xuất hiện hộp thoại xác nhận việc xóa |  |
|  | 3 | Xác nhận xóa | Xóa bản ghi trong CSDL. Thông báo xóa thành công |  |
| Luồng sự kiện thay thế | 3a | Xác nhận không xóa | Không xóa dữ liệu, CSDL không thay đổi |  |
| Hậu điều kiện | Hệ thống cập nhật các thay đổi. |  |  |  |

| Mã Use case | UC 042 |  |  | Tên Usecase | Tóm tắt đa văn bản |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Nhân viên, lãnh đạo |  |  |  |  |
| Mô tả | Thực hiện các chức năng tóm tắt đa văn bản bao gồm tóm tắt theo cụm hoặc theo chủ đề. |  |  |  |  |
| Sự kiện kích hoạt | Click vào chức năng tóm tắt đa văn bản trên giao diện hệ thống, hệ thống xuất hiện cửa sổ mặc định thực hiện tóm tắt theo cụm đa văn bản. |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công vào hệ thống |  |  |  |  |
| Tóm tắt theo cụm văn bản |  |  |  |  |  |
| Luồng sự kiện chính (Thành công ) | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Kích nút tải file trên giao diện tóm tắt |  | Xuất hiện hộp thoại cho phép người dùng chọn nhiều file từ máy tính hoặc từ drive (vùng lưu trữ trên hệ thống) của mình. |  |
|  | 2 |  |  | Hiển thị danh sách các file đã chọn cần tóm tắt trong danh sách file. |  |
|  | 3a | Kích vào nút Tóm tắt |  | Xuất hiện các cụm phát hiện được từ nhiều văn bản trên hộp Chọn cụm. Hiển thị hộp thoại hỏi có tiếp tục tóm tắt hay không nếu văn bản đang tóm tắt hoặc ở trạng thái chờ tóm tắt (4a). |  |
|  | 4 | Kích chọn tên cụm trên hộp Chọn cụm để xem nội dung tóm tắt. |  | Hộp tóm tắt hiển thị nội dung theo cụm đã chọn Hộp danh sách file hiển thị các file có nội dung liên quan đến cụm đã chọn |  |
|  | 5a | Kích nút Tóm tắt lại |  | Quay về giao diện như lúc bắt đầu tóm tắt |  |
|  | 6a | Kích nút Tiếp tục tóm tắt |  | Hệ thống thực hiện tóm tắt đa văn bản, hiển thị trạng thái (chờ tóm tắt nếu tài nguyên máy chủ đang thực hiện tóm tắt khác hoặc đang tóm tắt nếu máy chủ đã sẵn sàng). Hiển thị kết quả tóm tắt như 4. |  |
| Luồng sự kiện thay thế | STT | Tác nhân |  | Hệ thống |  |
|  | 1a | Không chọn file nào |  | Hộp chứa văn bản gốc trống. Không thực hiện tóm tắt. |  |
|  | 4b | Không chọn cụm nào |  | Hộp chứa văn bản tóm tắt trống. Không hiển thị nội dung tóm tắt. |  |
| Tóm tắt theo chủ đề |  |  |  |  |  |
| Luồng sự kiện chính (thành công) | STT |  | Tác nhân | Hệ thống |  |
|  | 5 |  | Chọn tab Theo chủ đề | Xuất hiện cửa sổ tóm tắt theo chủ đề |  |
|  | 6 |  | Kích chọn Chủ đề | Xuất hiện hộp thoại hiển thị danh mục các chủ đề của người dùng |  |
|  | 7 |  | Lựa chọn chủ đề muốn tóm tắt bằng cách tích chọn trong hộp thoại | Các chủ đề người dùng đã tích chọn xuất hiện trong ô Chủ đề trong cửa sổ tóm tắt |  |
|  | 8 |  | Kích vào từng chủ đề muốn xem nội dung tóm tắt. | Hiển thị kết quả tóm tắt theo chủ đề trên hộp thoại chứa văn bản tóm tắt. |  |
| Luồng sự kiện thay thế | STT | Tác nhân |  | Hệ thống |  |
|  | 6a | Không chọn chủ đề nào |  | Không hiển thị kết quả tóm tắt theo chủ đề |  |
| Tóm tắt tùy chỉnh độ dài |  |  |  |  |  |
| Luồng sự kiện chính (thành công) | STT |  | Tác nhân | Hệ thống |  |
|  | 5 |  | Kéo chọn thanh độ dài văn bản tóm tắt đến mức độ mong muốn | Độ dài mong muốn hiển thị bằng màu xám trên thanh kéo. Giá trị % thay đổi theo độ dài người dùng đã kéo |  |
|  | 6 |  | Kích vào nút Tóm tắt | Hiển thị kết quả tóm tắt theo độ dài người dùng mong muốn hộp thoại chứa văn bản tóm tắt. |  |
| Đánh dấu thực thể |  |  |  |  |  |
| Luồng sự kiện chính (thành công) | STT |  | Tác nhân | Hệ thống |  |
|  | 4 |  | Kích nút Đánh dấu thực thể | Các thực thể được đánh dấu bằng màu sắc khác (vàng) trong hộp thoại chứa văn bản kết quả tóm tắt. |  |
| Ghi lại văn bản tóm tắt |  |  |  |  |  |
| Luồng sự kiện chính (thành công) | STT |  | Tác nhân | Hệ thống |  |
|  | 4 |  | Người dùng thay đổi nội dung tóm tắt trong hộp kết quả tóm tắt | Hộp kết quả tóm tắt thay đổi theo nội dung người dùng đưa vào |  |
|  | 5 |  | Kích vào biểu tượng Ghi văn bản tóm tắt | Hệ thống ghi lại văn bản tóm tắt vào CSDL. |  |
| Lưu lại file văn bản tóm tắt |  |  |  |  |  |
| Luồng sự kiện chính (thành công) | STT |  | Tác nhân | Hệ thống |  |
|  | 4 |  | Kích vào biểu tượng Lưu văn bản tóm tắt. | Mở hộp thoại File trên máy tính để người dùng chọn thư mục lưu lại. |  |
|  | 5 |  | Kích OK để hoàn tất việc ghi file tóm tắt văn bản. | Hệ thống ghi file tóm tắt (.docx) vào thư mục người dùng đã chọn. |  |
| In văn bản tóm tắt |  |  |  |  |  |
|  | STT |  | Tác nhân | Hệ thống |  |
|  | 4 |  | Kích vào biểu tượng In văn bản | Mở hộp thoại chọn máy in để in văn bản. |  |
|  | 5 |  | Kích nút In ấn để hoàn tất việc lựa chọn. | Hệ thống thực hiện in đoạn văn bản tóm tắt trên hộp tóm tắt. |  |
| Sao chép văn bản tóm tắt |  |  |  |  |  |
|  | STT Tác nhân Hệ thống 4 Kích vào biểu tượng sao chép Sao chép nội dung trên ô văn bản tóm tắt. 5 Có thể dán nội dung đã sao chép vào bất kỳ chỗ nào |  |  |  |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

**3.3.3 Use cases dành cho quản trị hệ thống**

Quản lý người dùng hệ thống

| Mã Use case | UC 043 – UC 048 |  |  | Tên Usecase | Quản lý người dùng |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Admin |  |  |  |  |
| Mô tả | Quản lý tất cả tất cả người dùng hệ thống từ xem danh sách, thêm mới, sửa thông tin, xóa, đặt lại mật khẩu người dùng. |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng quản lí người dùng trên giao diện hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
|  | Xem danh sách người dùng (UC 043) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Đưa yêu cầu xem danh sách người dùng trên giao diện (kích chọn menu Quản lý người dùng) | Hiển thị danh sách người dùng hệ thống (phân trang) mỗi người dùng trên một dòng. |  |  |
| Luồng sự kiện phụ | 1a |  | Thông báo khi chưa có người dùng nào. |  |  |
|  | Thêm người dùng (UC 044) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Kích chọn chức năng thêm mới trên giao diện. |  | Hiển thị giao diện để nhập các trường dữ liệu thêm vào. |  |
|  | 2 | Nhập các trường dữ liệu vào các ô textbox tương ứng (*) |  | Giao diện thay đổi theo dữ liệu người dùng đưa vào |  |
|  | 3 | Chọn nút “Lưu" để lưu người dùng đã tạo |  | Hệ thống kiểm tra thông tin đã nhập, tự động sinh mật khẩu cho tài khoản người dùng, lưu thông tin vào CSDL và thông báo lưu thành công. |  |
| Luồng sự kiện thay thế | STT | Tác nhân |  | Hệ thống |  |
|  | 3a | Không nhập họ tên người dùng |  | Thông báo không được phép để trống |  |
|  | 3b | Không nhập tài khoản |  | Thông báo không được phép để trống |  |
|  | 3c | Tài khoản trùng với người khác |  | Thông báo tên tài khoản đã có, nhập lại tài khoản khác |  |
|  | Sửa thông tin người dùng (UC 045) |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu sửa thông tin người dùng (Kích mục Sửa trong menu sổ xuống ứng với dòng thông tin của người dùng muốn sửa) |  | Hiển thị giao diện chứa thông tin chi tiết về người dùng đã chọn. |  |
|  | 3 | Chỉnh sửa các trường thông tin (*) |  | Hiển thị giao diện theo thông tin sửa đổi |  |
|  | 4 | Kích nút Lưu để ghi lại thông tin đã sửa. |  | Ghi lại thông tin thay đổi của người dùng vào CSDL và thông báo thay đổi thành công |  |
| Luồng sự kiện thay thế | 3a | Không nhập họ tên người dùng |  | Thông báo không được phép để trống |  |
|  | 3b | Không nhập tài khoản |  | Thông báo tài khoản không được phép để trống |  |
|  | 3c | Tài khoản trùng với người khác |  | Thông báo tên tài khoản đã có, nhập lại tài khoản khác |  |
|  | Khóa tài khoản người dùng (UC 046A) |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu khóa tài khoản người dùng (Kích mục Khóa trong menu sổ xuống ứng với dòng thông tin của người dùng muốn khóa) |  | Khóa tài khoản, tên tài khoản sẽ không thể đăng nhập hệ thống được. |  |
|  | Mở khóa tài khoản người dùng (UC 046B) |  |  |  |  |
| Luồng sự kiện thay thế | 2 | Đưa yêu cầu mở khóa tài khoản (Kích mục Mở khóa trong menu sổ xuống – trường hợp tài khoản đang ở trạng thái Đã khóa) |  | Mở khóa tài khoản tên tài khoản có thể đăng nhập để sử dụng hệ thống. |  |
|  | Đặt lại mật khẩu người dùng (UC 047) |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu đặt lại mật khẩu (Kích mục Đặt lại mật khẩu trong menu sổ xuống ứng với dòng thông tin của người dùng) |  | Hiển thị cửa sổ yêu cầu xác nhận có đặt lại hay không? |  |
|  | 3 | Xác nhận đồng ý đăt lại |  | Hệ thống tự động sinh mật khẩu mới, hiển thị cho quản trị viên xem. Cập nhật mật khẩu mới cho người dùng. |  |
| Luồng sự kiện thay thế | 3a | Không đồng ý đặt lại |  | Hệ thống giữ mật khẩu cũ của người dùng |  |
|  | Tìm kiếm người dùng (UC 048) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 2 | Đưa yêu cầu tìm kiếm về: tên người dùng, phòng ban. |  | Trả lại kết quả tìm kiếm tổng hợp các điều kiện trên. |  |
| Luồng sự kiện thay thế | 2a |  |  | Trường hợp không tìm thấy, hiển thị thông báo không có bản ghi thỏa mãn. |  |
| Hậu điều kiện | CSDL thay đổi cập nhật dữ liệu khi thao tác thành công. |  |  |  |  |

Các trường thông tin

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Tên hiển thị (Họ tên) | Input textfield | Có | Các kí tự chữ hoa, thường có dấu cách. | Nguyễn Thu Anh |
| 2 | Tên đăng nhập | Input textfield |  |  |  |
| 3 | Email | Input emailfield | Không | Đúng định dạng email | nhthanh@gmail.com |
| 4 | Ngày sinh | DatePicker | Không | Ngày tháng hợp lệ | 15/04/1998 |
| 5 | Số điện thoại | Input textfield | Không | Kí tự số | 0987324456 |
| 6 | Vị trí công tác | Combobox lấy tên, id phòng ban từ bảng dữ liệu phòng ban | Có | Lựa chọn giá trị | Xử lý dữ liệu ngành |
| 7 | Chức danh | Combobox lấy tên, id chức danh từ bảng dữ liệu chức danh | Có | Lựa chọn giá trị | Phó phòng |
| 8 | Dung lượng lưu trữ (đơn vị GB) | Number field | Có | Giá trị hiển thị mặc định theo thiết lập trước | 5 |
| 9 | Loại tài khoản | Combobox lấy id và tên loại tài khoản | Có | Lựa chọn giá trị | Quản trị |
| 10 | Mật khẩu | Password field | Có | Quy tắc nhập mật khẩu |  |
| 11 | Nhập lại mật khẩu | Password field | Có | Quy  tắc nhập mật khẩu, trùng với (10) |  |

Quản lý phòng ban

| Mã Use case | UC 049 – UC 52 |  |  | Tên Usecase | Quản lý phòng ban |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Admin |  |  |  |  |
| Mô tả | Quản lý tất cả tất cả các phòng ban trên hệ thống từ xem danh sách, thêm mới, sửa thông tin, xóa các đơn vị phòng ban |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng quản lý phòng ban trên giao diện hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
|  | Xem danh sách phòng ban (UC 049) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Đưa yêu cầu xem danh sách phòng ban trên giao diện (kích chọn menu Quản lý phòng ban) | Hiển thị danh sách phòng ban hệ thống (phân trang) |  |  |
| Luồng sự kiện phụ | 1a |  | Thông báo khi chưa có phòng ban nào. |  |  |
|  | Thêm phòng ban (UC 050) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Kích chọn chức năng thêm phòng ban trên giao diện. |  | Hiển thị giao diện để nhập và chọn các trường dữ liệu thêm vào. |  |
|  | 2 | Nhập các trường dữ liệu vào các ô textbox tương ứng (*) |  | Giao diện thay đổi theo dữ liệu người dùng đưa vào |  |
|  | 4 | Chọn nút “Lưu" để lưu phòng ban đã tạo |  | Hệ thống lưu thông tin phòng ban vào CSDL và thông báo lưu thành công. |  |
| Luồng sự kiện thay thế | STT | Tác nhân |  | Hệ thống |  |
|  | 2a | Không nhập tên đơn vị |  | Thông báo không được phép để trống |  |
|  | 4b | Phòng ban bị trùng lặp |  | Thông báo tạo lại phòng ban khác |  |
|  | Sửa thông tin phòng ban (UC 051) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Đưa yêu cầu sửa thông tin người dùng (Kích biểu tượng hình bút chì ứng ứng với dòng thông tin của phòng ban muốn sửa) |  | Hiển thị giao diện chứa thông tin chi tiết về phòng ban đã chọn. |  |
|  | 2 | Chỉnh sửa các trường thông tin (*) |  | Hiển thị giao diện theo thông tin sửa đổi |  |
|  | 3 | Kích nút Lưu để ghi lại thông tin đã sửa. |  | Ghi lại thông tin thay đổi của phòng ban vào CSDL và thông báo thay đổi thành công |  |
| Luồng sự kiện thay thế | 2a | Tên đơn vị để trống |  | Thông báo không được phép để trống |  |
|  | Xóa thông tin phòng ban (UC 052A) |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu xóa phòng ban đã tạo (Kích mục Xóa - biểu tượng  mắt ứng với dòng thông tin của phòng ban muốn xóa) |  | Chuyển trạng thái phòng ban thành Không hiển thị, không thể sử dụng phòng ban này ở bất kỳ chức năng nào khác. |  |
|  | Khôi phục phòng ban (UC 052B) |  |  |  |  |
|  | 2 | Đưa yêu cầu khôi phục lại phòng ban đã xóa (Kích mục Xóa - biểu tượng  mắt ứng với dòng thông tin của phòng ban muốn xóa) |  | Phòng ban chuyển lại trạng thái hiển thị để có thể sử dụng ở các chức năng khác có liên quan. |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

Các trường thông tin

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Tên đơn vị | Input text field | Có | Các kí tự chữ hoa, thường có dấu cách. | Đơn vị A |
| 2 | Mô tả | Input text field | Không | Các kí tự chữ hoa, thường có dấu cách | Đơn vị thực hiện các hoạt động … |
| 3 | Đơn vị cấp trên | Combo box | Có | Lựa chọn đơn vị |  |
| 4 | Danh mục chức danh | Multi-select | Có | Lựa chọn các chức danh trong phòng | Trưởng phòng, phó phòng. |

Quản lý lĩnh vực

| Mã Use case | UC 053- UC 056 |  |  | Tên Usecase | Quản lý lĩnh vực |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Admin |  |  |  |  |
| Mô tả | Quản lý thiết lập tất cả các lĩnh vực trên hệ thống từ xem danh sách, thêm mới, sửa thông tin, xóa lĩnh vực. |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng quản lý lĩnh vực trên giao diện hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
|  | Xem danh sách lĩnh vực (UC 053) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Đưa yêu cầu xem danh sách lĩnh vực trên giao diện (kích chọn menu Quản lý lĩnh vực) | Hiển thị danh sách lĩnh vực trên hệ thống (phân trang) |  |  |
| Luồng sự kiện phụ | 1a |  | Thông báo khi chưa có lĩnh vực nào. |  |  |
|  | Tìm kiếm lĩnh vực (UC 054) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Kích chọn ô textbox Tìm kiếm tên phía trên của giao diện | Hiển thị nháy đơn để nhập dữ liệu dầu vào |  |  |
|  | 2 | Nhập từ khoá để tìm kiếm lĩnh vực | Giao diện thay đổi theo dữ liệu người dùng đưa vào , hiển thị gợi ý lĩnh vực đã tạo trên hệ thống |  |  |
|  | 3 | Chọn nút biểu tượng kính lúp hoặc ấn phím enter để tìm kiếm | Hiển thị kết quả tìm kiếm. |  |  |
|  | 3a |  | Không tìm thấy bản ghi thỏa mãn, thông báo không tìm được. |  |  |
| Luồng sự kiện thay thế | STT | Tác nhân | Hệ thống |  |  |
|  | 3a | Nhập tên lĩnh vực bị sai hoặc chưa có trên hệ thống | Thông báo không tồn tại lĩnh vực đã tìm kiếm |  |  |
|  | Thêm lĩnh vực (UC 055) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Kích chọn chức năng thêm lĩnh vực trên giao diện. |  | Hiển thị giao diện để nhập các trường dữ liệu thêm vào. |  |
|  | 2 | Nhập các trường dữ liệu vào các ô textbox tương ứng (*) |  | Giao diện thay đổi theo dữ liệu người dùng đưa vào |  |
|  | 3 | Chọn nút “Lưu" để lưu lĩnh vực đã tạo |  | Hệ thống lưu thông tin lĩnh vực vào CSDL và thông báo lưu thành công. |  |
| Luồng sự kiện thay thế | STT | Tác nhân |  | Hệ thống |  |
|  | 2a | Không nhập tên lĩnh vực |  | Thông báo không được phép để trống |  |
|  | 3a | Lĩnh vực bị trùng lặp |  | Thông báo tạo lại lĩnh vực khác |  |
|  | Sửa thông tin  lĩnh vực (UC 056) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Đưa yêu cầu sửa thông tin lĩnh vực (Kích biểu tượng hình bút chì ứng với dòng thông tin của lĩnh vực muốn sửa) |  | Hiển thị giao diện chứa thông tin chi tiết về lĩnh vực đã chọn. |  |
|  | 2 | Chỉnh sửa các trường thông tin (*) |  | Hiển thị giao diện theo thông tin sửa đổi |  |
|  | 3 | Kích nút Lưu để ghi lại thông tin đã sửa. |  | Ghi lại thông tin thay đổi của lĩnh vực vào CSDL và thông báo thay đổi thành công |  |
| Luồng sự kiện thay thế | 3a | Tên lĩnh vực để trống |  | Thông báo không được phép để trống |  |
|  | 3b | Lĩnh vực bị trùng lặp |  | Thông báo tạo lại lĩnh vực khác |  |
|  | Xóa lĩnh vực (UC 057A) |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu xóa lĩnh vực đã tạo (Kích biểu tượng Xóa – hình mắt ứng với dòng thông tin của lĩnh vực muốn xóa) |  | Chuyển trạng thái lĩnh vực thành Không hiển thị, không thể sử dụng lĩnh vực này ở bất kỳ chức năng nào khác. |  |
|  | Khôi phục lĩnh vực đã xóa (UC57B) |  |  |  |  |
|  | 2 | Đưa yêu cầu khôi phục lĩnh vực đã xóa (Kích biểu tượng hình mắt ứng với dòng thông tin của lĩnh vực muốn khôi phục) |  | Chuyển trạng thái lĩnh vực thành Hiển thị, có thể sử dụng lĩnh vực này ở bất kỳ chức năng nào khác có liên quan. |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

Các trường thông tin

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Tên lĩnh vực | Input textfield | Có | Các kí tự chữ hoa, thường có dấu cách. | Quân sự |
| 2 | Mô tả | Textarea field | Có | Các kí tự chữ hoa, thường có dấu cách |  |

Quản lý thông tin Quốc gia

| Mã Use case | UC058 – UC062 |  |  | Tên Usecase | Quản lý Quốc Gia |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Admin |  |  |  |  |
| Mô tả | Quản lý thiết lập tất cả các Quốc Gia trên hệ thống từ xem danh sách, tìm kiếm, thêm mới, sửa thông tin Quốc gia |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng quản lý Quốc gia trên giao diện hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
|  | Xem danh sách Quốc Gia (UC 058) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Đưa yêu cầu xem danh sách Quốc gia trên giao diện (kích chọn menu Quản lý Quốc gia) | Hiển thị danh sách Quốc gia trên hệ thống (phân trang) |  |  |
| Luồng sự kiện phụ | 1a |  | Thông báo khi chưa có thông tin quốc gia nào. |  |  |
|  | Chọn Khu vực hiển thị ( Tìm kiếm chọn lọc) (UC 059) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Kích chọn droplist khu vực | Hiển thị droplist các khu vực có trên hệ thống |  |  |
|  | 2 | Kích chọn khu vực muốn hiển thị | Hiển thị danh sách kết quả theo khu vực đã chọn |  |  |
|  | Tìm kiếm Quốc gia (UC 060) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Kích chọn ô textbox Tìm kiếm tên phía trên của giao diện. | Hiển thị nháy đơn để nhập dữ liệu dầu vào |  |  |
|  | 2 | Nhập tên để tìm kiếm Quốc gia | Giao diện thay đổi theo dữ liệu người dùng đưa vào , hiển thị gợi ý Quốc gia đã tạo trên hệ thống |  |  |
|  | 3 | Chọn nút biểu tượng kính lúp hoặc ấn phím enter để tìm kiếm | Hiển thị kết quả tìm kiếm. |  |  |
| Luồng sự kiện thay thế | STT | Tác nhân | Hệ thống |  |  |
|  | 3a | Nhập tên Quốc gia bị sai hoặc chưa có trên hệ thống | Thông báo không tồn tại Quốc gia đã tìm kiếm |  |  |
|  | Thêm thông tin quốc gia (UC 061) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Kích chọn chức năng thêm Quốc gia trên giao diện. |  | Hiển thị giao diện để nhập các trường dữ liệu thêm vào. |  |
|  | 2 | Nhập các trường dữ liệu vào các ô textbox tương ứng (*) |  | Giao diện thay đổi theo dữ liệu người dùng đưa vào |  |
|  | 3 | Kích vào droplist khu vực |  | Hiển thị droplist khu vực |  |
|  | 4 | Chọn Khu vực |  | Giao diện thay đổi theo trường dũ liệu đã chọn |  |
|  | 5 | Chọn nút “Lưu" để lưu lĩnh vực đã tạo |  | Hệ thống lưu thông tin lĩnh vực vào CSDL và thông báo lưu thành công. |  |
| Luồng sự kiện thay thế | STT | Tác nhân |  | Hệ thống |  |
|  | 2a | Không nhập tên quốc gia |  | Thông báo không được phép để trống |  |
|  | 4b | Quốc gia bị trùng lặp |  | Thông báo tạo lại Quốc gia khác |  |
|  | Sửa thông tin Quốc gia (UC 062) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Đưa yêu cầu sửa thông tin Quốc gia (Kích biểu tượng hình bút chì ứng với dòng thông tin của Quốc gia muốn sửa) |  | Hiển thị giao diện chứa thông tin chi tiết về Quốc gia đã chọn. |  |
|  | 2 | Chỉnh sửa các trường thông tin (*) |  | Hiển thị giao diện theo thông tin sửa đổi |  |
|  | 3 | Chọn lại khu vực |  | Hiển thị giao diện theo thông tin sửa đổi |  |
|  | 4 | Kích nút Lưu để ghi lại thông tin đã sửa. |  | Ghi lại thông tin thay đổi của Quốc gia vào CSDL và thông báo thay đổi thành công |  |
| Luồng sự kiện thay thế | 4a | Tên Quốc gia để trống |  | Thông báo không được phép để trống |  |
|  | Xóa thông tin Quốc gia (UC 063A) |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
|  | 2 | Đưa yêu cầu xóa thông tin Quốc gia đã tạo (Kích biểu tượng Xóa – hình mắt ứng với dòng thông tin quốc gia muốn xóa) |  | Chuyển trạng thái quốc gia thành Không hiển thị, không thể sử dụng quốc gia này ở bất kỳ chức năng nào khác. |  |
|  | Khôi phục lĩnh vực đã xóa (UC57B) |  |  |  |  |
|  | 2 | Đưa yêu cầu khôi phục quốc gia đã xóa (Kích biểu tượng hình mắt ứng với dòng thông tin của muốn khôi phục) |  | Chuyển trạng thái quốc gia thành Hiển thị, có thể sử dụng quốc gia này ở bất kỳ chức năng nào khác có liên quan. |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

Các trường thông tin

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Tên Quốc gia | Input text field | Có | Các kí tự chữ hoa, thường có dấu cách. | Việt Nam |
| 2 | Tên khu vực | Combo box lấy tên, id khu vực từ dữ liệu khu vực | Có | Lựa chọn giá trị | Châu Á |

Quản lý Khu vực

| Mã Use case | UC 064 – UC 068 |  |  | Tên Usecase | Quản lý khu vực |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Admin |  |  |  |  |
| Mô tả | Quản lý thiết lập tất cả các khu vực hiển thị trên hệ thống từ xem danh sách, tìm kiếm, thêm mới, sửa thông tin, xóa khu vực |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng quản lý khu vực trên giao diện hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
|  | Xem danh sách khu vực (UC 064) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Đưa yêu cầu xem danh sách khu vực trên giao diện (kích chọn menu Quản lý khu vực) | Hiển thị danh sách khu vực trên hệ thống (phân trang) |  |  |
| Luồng sự kiện phụ | 1a |  | Thông báo khi chưa có khu vực nào. |  |  |
|  | Tìm kiếm khu vực (UC 065) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Kích chọn ô textbox Tìm kiếm tên phía trên của giao diện | Hiển thị nháy đơn để nhập dữ liệu dầu vào |  |  |
|  | 2 | Nhập từ khoá để tìm kiếm khu vực | Giao diện thay đổi theo dữ liệu người dùng đưa vào , hiển thị gợi ý khu vực đã tạo trên hệ thống |  |  |
|  | 3 | Chọn nút biểu tượng kính lúp hoặc ấn phím enter để tìm kiếm | Hiển thị kết quả tìm kiếm. |  |  |
| Luồng sự kiện thay thế | STT | Tác nhân | Hệ thống |  |  |
|  | 3a | Nhập tên khu vực bị sai hoặc chưa có trên hệ thống | Thông báo không tồn tại lĩnh vực đã tìm kiếm |  |  |
|  | Thêm khu vực (UC 066) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Kích chọn chức năng thêm khu vực trên giao diện. |  | Hiển thị giao diện để nhập các trường dữ liệu thêm vào. |  |
|  | 2 | Nhập các trường dữ liệu vào các ô textbox tương ứng (*) |  | Giao diện thay đổi theo dữ liệu người dùng đưa vào |  |
|  | 3 | Chọn nút “Lưu" để lưu khu vực đã tạo |  | Hệ thống lưu thông tin khu vực vào CSDL và thông báo lưu thành công. |  |
| Luồng sự kiện thay thế | STT | Tác nhân |  | Hệ thống |  |
|  | 2a | Không nhập tên khu vực |  | Thông báo không được phép để trống |  |
|  | 3a | Khu vực bị trùng lặp |  | Thông báo tạo lại khu vực khác |  |
|  | Sửa thông tin Khu vực (UC 067) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Đưa yêu cầu sửa thông tin khu vực (Kích biểu tượng hình bút chì ứng với dòng thông tin của khu vực muốn sửa) |  | Hiển thị giao diện chứa thông tin chi tiết về khu vực đã chọn. |  |
|  | 2 | Chỉnh sửa các trường thông tin (*) |  | Hiển thị giao diện theo thông tin sửa đổi |  |
|  | 3 | Kích nút Lưu để ghi lại thông tin đã sửa. |  | Ghi lại thông tin thay đổi của khu vực vào CSDL và thông báo thay đổi thành công |  |
| Luồng sự kiện thay thế | 2a | Tên khu vực để trống |  | Thông báo không được phép để trống |  |
|  | 3a | Tên khu vực bị trùng lặp |  | Thông báo sửa lại tên khu vực khác |  |
|  | Xoá khu vực (UC 068A) |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu xóa khu vực đã tạo (Kích biểu tượng Xóa hình mắt  ứng với dòng thông tin của khu vực muốn xóa) |  | Chuyển trạng thái khu vực thành Không hiển thị, không thể sử dụng khu vực này ở bất kỳ chức năng nào khác. |  |
|  | Khôi phục khu vực đã xóa (UC 068B) |  |  |  |  |
|  | 2 | Đưa yêu cầu khôi phục khu vực đã xóa (Kích biểu tượng hình mắt  ứng với dòng thông tin của khu vực muốn khôi phục) |  | Chuyển trạng thái khu vực thành Hiển thị, để có thể sử dụng khu vực này ở các chức năng liên quan. |  |

Các trường thông tin

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Tên khu vực | Input textfield | Có | Các kí tự chữ hoa, thường có dấu cách. | Châu Á |
| 2 | Mô tả | Input textfield | Có | Các kí tự chữ hoa, thường có dấu cách | Mô tả gắn với Châu Á. |

Quản lý Chức danh

| Mã Use case | UC 069 – UC 073 |  |  | Tên Usecase | Quản lý khu vực |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Admin |  |  |  |  |
| Mô tả | Quản lý thiết lập tất cả các khu vực hiển thị trên hệ thống từ xem danh sách, tìm kiếm, thêm mới, sửa thông tin, xóa chức danh |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng quản lý chức danh trên giao diện hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
|  | Xem danh sách chức danh (UC 069) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Đưa yêu cầu xem danh sách chức danh trên giao diện (kích chọn menu Quản lý chức danh) | Hiển thị danh sách chức danh trên hệ thống (phân trang) |  |  |
| Luồng sự kiện phụ | 1a |  | Thông báo khi chưa có chức danh nào. |  |  |
|  | Tìm kiếm chức danh (UC 070) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Kích chọn ô textbox Tìm kiếm tên phía trên của giao diện | Hiển thị nháy đơn để nhập dữ liệu dầu vào |  |  |
|  | 2 | Nhập từ khoá để tìm kiếm chức danh | Giao diện thay đổi theo dữ liệu người dùng đưa vào, hiển thị gợi ý chức danh đã tạo trên hệ thống |  |  |
|  | 3 | Chọn nút biểu tượng kính lúp hoặc ấn phím enter để tìm kiếm | Hiển thị kết quả tìm kiếm. |  |  |
| Luồng sự kiện thay thế | STT | Tác nhân | Hệ thống |  |  |
|  | 3a | Nhập tên chức danh bị sai hoặc chưa có trên hệ thống | Thông báo không tồn tại lĩnh vực đã tìm kiếm |  |  |
|  | Thêm chức danh (UC 071) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Kích chọn chức năng thêm chức danh trên giao diện. |  | Hiển thị giao diện để nhập các trường dữ liệu thêm vào. |  |
|  | 2 | Nhập các trường dữ liệu vào các ô textbox tương ứng (*) |  | Giao diện thay đổi theo dữ liệu người dùng đưa vào |  |
|  | 3 | Chọn nút “Lưu" để lưu chức danh đã tạo |  | Hệ thống lưu thông tin chức danh vào CSDL và thông báo lưu thành công. |  |
| Luồng sự kiện thay thế | STT | Tác nhân |  | Hệ thống |  |
|  | 2a | Không nhập tên chức danh |  | Thông báo không được phép để trống |  |
|  | 3a | Chức danh bị trùng lặp |  | Thông báo tạo lại chức danh khác |  |
|  | Sửa thông tin Chức danh (UC 072) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Đưa yêu cầu sửa thông tin chức danh (Kích biểu tượng hình bút chì ứng với dòng thông tin của chức danh muốn sửa) |  | Hiển thị giao diện chứa thông tin chi tiết về chức danh đã chọn. |  |
|  | 2 | Chỉnh sửa các trường thông tin (*) |  | Hiển thị giao diện theo thông tin sửa đổi |  |
|  | 3 | Kích nút Lưu để ghi lại thông tin đã sửa. |  | Ghi lại thông tin thay đổi của chức danh vào CSDL và thông báo thay đổi thành công |  |
| Luồng sự kiện thay thế | 2a | Tên chức danh để trống |  | Thông báo không được phép để trống |  |
|  | 3a | Tên chức danh bị trùng lặp |  | Thông báo sửa lại tên chức danh khác |  |
|  | Xoá chức danh (UC 073A) |  |  |  |  |
|  | STT | Tác nhân |  | Hệ thống |  |
| Luồng sự kiện chính | 2 | Đưa yêu cầu xóa chức danh đã tạo (Kích biểu tượng xóa có hình mắt ứng với dòng thông tin của chức danh muốn xóa) |  | Trạng thái chức danh chuyển sang Không hiển thị, không thể sử dụng chức danh này ở bất kỳ chức năng nào khác. |  |
|  | Khôi phục chức  danh (UC 073B) |  |  |  |  |
|  | 2 | Đưa yêu cầu khối phục chức danh đã tạo (Kích biểu tượng có hình mắt ứng với dòng thông tin của chức danh muốn khôi phục) |  | Trạng thái chức danh chuyển sang Hiển thị, để có thể sử dụng chức danh này các chức năng khác có liên quan. |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

Các trường thông tin

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
| --- | --- | --- | --- | --- | --- |
| 1 | Tên chức danh | Input textfield | Có | Các kí tự chữ hoa, thường có dấu cách. | Phó phòng |
| 2 | Số lượng vị trí | Input Number field | Có | Giá trị số | Mô tả gắn với chức danh phó phòng. |
| 3 | Vai trò | Combo box | Có | Giá trị lựa chọn |  |
| 4 | Chia sẻ cho các phòng ban khác | Checkbox | Không | Giá trị lựa chọn | Nếu được chọn sẽ cho phép chức danh này chia sẻ thông tin với các phòng ban khác |

Theo dõi lịch sử sử dụng phần mềm của người dùng hệ thống

| Mã Use case | UC 074 – UC 075 |  | Tên Usecase |  | Theo dõi lịch sử sử dụng hệ thống của người dùng |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Admin |  |  |  |  |
| Mô tả | Hiển thị thông tin lịch sử sử dụng hệ thống của người dùng. |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Lịch sử hoạt động trên giao diện hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
|  | Xem danh sách (UC 074) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 |  |  | Hiển thị danh sách các hoạt động của hệ thống (phân trang) của tất cả người dùng hệ thống (Bao gồm thời gian, Tên người dùng, Hoạt động đã thực hiện (đăng nhập hay đăng xuất), Mô tả thêm thực hiện từ địa chỉ IP nào). |  |
| Luồng sự kiện phụ | 1a |  |  | Thông báo khi chưa có hoạt động nào. |  |
|  | Lọc xem lịch sử hoạt động (UC 075) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Lọc xem lịch sử theo tên hoạt động, đơn vị, người dùng, khoảng thời gian |  | Hiển thị danh sách lịch sử theo tiêu chí đã chọn |  |
| Hậu điều kiện | Không thay đổi dữ liệu hệ thống |  |  |  |  |

Cấu hình tóm tắt văn bản

| Mã Use case | UC 076 |  |  | Tên Usecase | Thiết đặt mô hình AI chung cho toàn bộ phần tóm tắt. |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Admin |  |  |  |  |
| Mô tả | Hiển thị thông tin về cấu hình tóm tắt văn bản mặc định cho toàn bộ người dùng của hệ thống |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Cấu hình tóm tắt văn bản trong menu Cấu hình hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Thiết lập các tham số mặc định khi thực hiện khi tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể. Phạm vi áp dụng: kích vào ô chọn có áp dụng ghi đè lên tất cả cấu hình tham số của người dùng hay chỉ cho những người dùng mặc định chưa thay đổi các tham số này. | Hiển thị thông tin theo lựa chọn |  |  |
|  | 2 | Xác nhận thiết đặt cấu hình (kích nút Lưu trên giao diện hệ thống) | Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện. |  |  |
| Luồng sự kiện phụ | 2a | Hiển thị lại thông tin thiết đặt hiện tại trong CSDL (kích nút Hủy trên giao diện) | Hiển thị các thông số hiện tại trong CSDL |  |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

Sao lưu, phục hồi dữ liệu

| Mã Use case | UC 077 – UC 081 |  |  | Tên Usecase | Quản lý việc sao lưu và khôi phục dữ liệu |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Admin |  |  |  |  |
| Mô tả | Cho phép quản trị viên thiết đặt định kỳ sao lưu dữ liệu và hệ thống file |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Sao lưu, khôi phục dữ liệu trong menu Cấu hình hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
|  | Xem danh sách các lần sao lưu (UC 077) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 |  |  | Hiển thị danh sách các lần sao lưu dữ liệu của các admin |  |
|  | Sao lưu dữ liệu tự động (UC 078) |  |  |  |  |
| Luồng sự kiện chính | 1 |  | Lựa chọn sao lưu tự động (mặc định của hệ thống) Thiết đặt các thông tin sao lưu dữ liệu: Định kỳ sao lưu, thời gian, tùy chọn sao lưu. | Hiển thị các lựa chọn. Tự động sao lưu dữ liệu theo các thiết đặt của admin. |  |
|  | Sao lưu dữ liệu thủ công (UC 079) |  |  |  |  |
| Luồng sự kiện chính | 1 |  | Lựa chọn sao lưu thủ công. Thực hiện thêm mới lần sao lưu. | Hiển thị các tùy chọn sao lưu |  |
|  | 2 |  | Lựa chọn tùy chọn phù hợp, xác nhận sao lưu. | Thực hiện sao lưu theo tùy chọn. Ghi lại thông tin sao lưu. |  |
| Luồng sự kiện thay thế | 2a |  | Không xác nhận sao lưu | Không thực hiện sao lưu |  |
|  | Xóa bản sao lưu (UC 080) |  |  |  |  |
| Luồng sự kiện chính | 1 |  | Đưa yêu cầu xóa bản sao lưu | Yêu cầu người dùng xác nhận có xóa thực sự hay không? |  |
|  | 2 |  | Xác nhận xóa | Xóa bản sao lưu trên hệ thống |  |
| Luồng sự kiện thay thế | 2a |  | Không xác nhận xóa | Không thực hiện xóa. |  |
|  | Khôi phục dữ liệu (UC 081) |  |  |  |  |
| Luồng sự kiện chính | 1 |  | Đưa yêu cầu khôi phục dữ liệu | Yêu cầu người dùng có thực sự khôi phục theo bản dữ liệu đó |  |
|  | 2 |  | Xác nhận khôi phục | Khôi phục dữ liệu hệ thống theo dữ liệu trong bản sao lưu |  |
| Luồng sự kiện thay thế | 2a |  | Không xác nhận khôi phục | Không thực hiện khôi phục, hệ thống giữ nguyên dữ liệu và file hiện tại. |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

Cấu hình quản lý văn bản

| Mã Use case | UC 082 |  |  | Tên Usecase | Thiết đặt cấu hình chung cho quản lý văn bản (file/thư mục). |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Admin |  |  |  |  |
| Mô tả | Hiển thị thông tin về cấu hình quản lý văn bản cho toàn bộ người dùng của hệ thống |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Cấu hình quản lý văn bản trong menu Cấu hình hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân | Hệ thống |  |  |
|  | 1 | Thiết lập các tham số mặc định khi thực hiện khi làm việc với vùng lưu trữ của người dùng: kích thước tối đa của file khi tải lên vùng lưu trữ (MB), dung lượng lưu trữ mặc định (GB) khi cấp phát cho người dùng. | Giao diện thay đổi theo giá trị nhập vào. |  |  |
|  | 2 | Xác nhận thiết đặt cấu hình (kích nút Lưu trên giao diện hệ thống) | Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện. |  |  |
| Luồng sự kiện phụ | 2a | Hiển thị lại thông tin thiết đặt hiện tại trong CSDL (kích nút Hủy trên giao diện) | Hiển thị các thông số hiện tại trong CSDL |  |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

**3.3.4 Use cases riêng cho Cục trưởng**

a. Giao cán bộ phụ trách

| Mã Use case | UC 083 – UC 085 |  | Tên Usecase | Thiết lập quản lý người dùng cấp dưới |  |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Cục trưởng |  |  |  |  |
| Mô tả | Cho phép Cục trưởng thiết lập danh sách người dùng cấp dưới mình trực tiếp quản lý. |  |  |  |  |
| Sự kiện kích hoạt | Kích chọn chức năng Giao cán bộ phụ trách |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
|  | Xem  danh sách cấp dưới do mình quản lý  (UC 083) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |
|  | 1 |  |  |  | Hiển thị danh sách cấp dưới do mình quản lý: Các Cục phó & đơn vị phụ trách. |
|  | Thêm thông tin quản lý cấp dưới (UC 084) |  |  |  |  |
| Luồng sự kiện chính | 1 | Đưa yêu cầu thêm mới |  |  | Hiển thị giao diện thêm cấp dưới quản lý |
|  | 2 | Đưa thông tin về: người quản lý (Cục phó), đơn vị quản lý. |  |  | Hiển thị theo lựa chọn của người dùng |
|  | 3 | Xác nhận lưu thông tin |  |  | Lưu thông tin và thông báo lưu thành công |
| Luồng sự kiện thay thế | 3a | Không xác nhận lưu |  |  | Không lưu lại thông tin |
|  | Thay đổi thông tin quản lý cấp dưới (UC 085) |  |  |  |  |
| Luồng sự kiện chính | 1 | Đưa yêu cầu sửa thông tin |  |  | Hiển thị giao diện sửa thông tin cấp dưới quản lý |
|  | 2 | Thay đổi thông tin về: người quản lý (Cục phó), các đơn vị quản lý. |  |  | Hiển thị theo lựa chọn của người dùng |
|  | 3 | Xác nhận lưu thông tin |  |  | Lưu thông tin và thông báo sửa thành công |
| Luồng sự kiện thay thế | 3a | Không xác nhận lưu |  |  | Không lưu lại thông tin |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

b. Xem lịch sử hoạt động

| Mã Use case | UC 086 |  | Tên Usecase | Xem thống kê số lượng sử dụng hệ thống của đơn vị mình quản lý |  |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Cục trưởng |  |  |  |  |
| Mô tả | Xem thống kê lịch sử hoạt động của các đơn vị do mình quản lý |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Lịch sử hoạt động |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |
|  | 1 | Lựa chọn thời gian khoảng thời gian muốn thống kê, kiểu biểu đồ hiển thị. |  |  | Hiển thị biểu đồ thống kê & bảng kết quả bao gồm: tổng số lần đăng nhập, số lần upload, số lần download, số lần thực hiện tóm tắt theo từng phòng ban do Cục quản lý. Sau khi kích vào từng phòng ban nội dung sẽ hiển thị như UC 094 |
| Luồng sự kiện phụ | 1a | Không lựa chọn thời gian |  |  | Không hiển thị biểu đồ |

c. Cấu hình tóm tắt văn bản

| Mã Use case | UC 087 |  | Tên Usecase |  | Thiết đặt tham số mô hình AI cho phần tóm tắt của Cục trưởng |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Cục trưởng |  |  |  |  |
| Mô tả | Thiết đặt thông tin về cấu hình tóm tắt văn bản cho cá nhân mình |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Cấu hình tóm tăt văn bản trong menu Cấu hình hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  | Hệ thống |  |
|  | 1 | Thiết lập các tham số mặc định khi thực hiện tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể. |  | Hiển thị thông tin theo lựa chọn |  |
|  | 2 | Xác nhận thiết đặt cấu hình (kích nút Lưu trên giao diện hệ thống) |  | Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện. Các tham số được sử dụng cho các hoạt động tóm tắt của riêng người dùng. |  |
| Luồng sự kiện phụ | 2a | Hiển thị lại thông tin thiết đặt hiện tại trong CSDL (kích nút Hủy trên giao diện) |  | Hiển thị các thông số hiện tại trong CSDL |  |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

**3.3.5 Use cases riêng cho Cục phó**

Xem lịch sử hoạt động

| Mã Use case | UC 088 |  | Tên Usecase | Xem thống kê số lượng sử dụng hệ thống của đơn vị mình quản lý |  |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Cục phó |  |  |  |  |
| Mô tả | Xem thống kê lịch sử hoạt động của các đơn vị do mình quản lý |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Lịch sử hoạt động |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |
|  | 1 | Lựa chọn thời gian khoảng thời gian muốn thống kê, kiểu biểu đồ hiển thị. |  |  | Hiển thị biểu đồ thống kê & bảng kết quả bao gồm: tổng số lần đăng nhập, số lần upload, số lần download, số lần thực hiện tóm tắt theo từng phòng ban được giao quản lý. Sau khi kích vào từng phòng ban nội dung sẽ hiển thị như UC 094 |
| Luồng sự kiện phụ | 1a | Không lựa chọn thời gian |  |  | Không hiển thị biểu đồ |

Thiết đặt cấu hình tóm tắt văn bản

| Mã Use case | UC 089 |  | Tên Usecase | Thiết đặt tham số mô hình AI chung cho phần tóm tắt. |  |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Cục phó |  |  |  |  |
| Mô tả | Thiết đặt thông tin về cấu hình tóm tắt văn bản cho cá nhân mình |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Cấu hình tóm tăt văn bản trong menu Cấu hình hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |
|  | 1 | Thiết lập các tham số mặc định khi thực hiện tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể. |  |  | Hiển thị thông tin theo lựa chọn |
|  | 2 | Xác nhận thiết đặt cấu hình (kích nút Lưu trên giao diện hệ thống) |  |  | Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện. Các tham số được sử dụng cho các hoạt động tóm tắt của riêng người dùng. |
| Luồng sự kiện phụ | 2a | Hiển thị lại thông tin thiết đặt hiện tại trong CSDL (kích nút Hủy trên giao diện) |  |  | Hiển thị các thông số hiện tại trong CSDL |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

**3.3.6 Use cases riêng cho Trưởng phòng**

a. Giao cán bộ phụ trách

| Mã Use case | UC 090 – UC 092 |  | Tên Usecase | Thiết lập phụ trách người dùng cấp dưới |  |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Trưởng phòng |  |  |  |  |
| Mô tả | Cho phép trưởng phòng thiết lập danh sách người dùng cấp dưới mình trực tiếp quản lý. |  |  |  |  |
| Sự kiện kích hoạt | Kích chọn chức năng Giao cán bộ phụ trách |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
|  | Xem  danh sách cấp dưới do mình quản lý (UC 090) |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |
|  | 1 |  |  |  | Hiển thị danh sách cấp dưới do mình quản lý: Các phó phòng & nhân viên phụ trách. |
|  | Thêm thông tin quản lý cho cấp dưới (UC 091) |  |  |  |  |
| Luồng sự kiện chính | 1 | Đưa yêu cầu thêm mới |  |  | Hiển thị giao diện thêm cấp dưới quản lý |
|  | 2 | Đưa thông tin về: cán bộ phụ trách (phó phòng), cán bộ được quản lý. |  |  | Hiển thị theo lựa chọn của người dùng |
|  | 3 | Xác nhận lưu thông tin |  |  | Lưu thông tin và thông báo lưu thành công |
| Luồng sự kiện thay thế | 3a | Không xác nhận lưu |  |  | Không lưu lại thông tin |
|  | Thay đổi thông tin quản lý cấp dưới (UC 092) |  |  |  |  |
| Luồng sự kiện chính | 1 | Đưa yêu cầu sửa thông tin |  |  | Hiển thị giao diện sửa thông tin cấp dưới quản lý |
|  | 2 | Thay đổi thông tin về: người quản lý (phó phòng), các cán bộ được quản lý. |  |  | Hiển thị theo lựa chọn của người dùng |
|  | 3 | Xác nhận lưu thông tin |  |  | Lưu thông tin và thông báo sửa thành công |
| Luồng sự kiện thay thế | 3a | Không xác nhận lưu |  |  | Không lưu lại thông tin |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

b. Xem lịch sử hoạt động

| Mã Use case | UC 093 |  | Tên Usecase | Xem thống kê số lượng sử dụng hệ thống của đơn vị mình quản lý |  |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Trưởng phòng |  |  |  |  |
| Mô tả | Xem thống kê lịch sử hoạt động của nhân viên trong đơn vị do mình quản lý |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Lịch sử hoạt động |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |
|  | 1 | Lựa chọn thời gian khoảng thời gian muốn thống kê, kiểu biểu đồ hiển thị. |  |  | Hiển thị biểu đồ thống kê & bảng kết quả bao gồm: tổng số lần đăng nhập, số lần upload, số lần download, số lần thực hiện tóm tắt theo từng nhân viên do phòng quản lý. Sau khi kích vào từng nhân viên nội dung sẽ hiển thị như UC 098 |
| Luồng sự kiện phụ | 1a | Không lựa chọn thời gian |  |  | Không hiển thị biểu đồ |

c. Thiết đặt cấu hình tóm tắt văn bản

| Mã Use case | UC 094 |  | Tên Usecase | Thiết đặt tham số mô hình AI cho phần tóm tắt. |  |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Trưởng phòng |  |  |  |  |
| Mô tả | Thiết đặt thông tin về cấu hình tóm tắt văn bản cho cá nhân mình |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Cấu hình tóm tăt văn bản trong menu Cấu hình hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |
|  | 1 | Thiết lập các tham số mặc định khi thực hiện tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể. |  |  | Hiển thị thông tin theo lựa chọn |
|  | 2 | Xác nhận thiết đặt cấu hình (kích nút Lưu trên giao diện hệ thống) |  |  | Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện. Các tham số được sử dụng cho các hoạt động tóm tắt của riêng người dùng. |
| Luồng sự kiện phụ | 2a | Hiển thị lại thông tin thiết đặt hiện tại trong CSDL (kích nút Hủy trên giao diện) |  |  | Hiển thị các thông số hiện tại trong CSDL |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

**3.3.7 Use cases riêng cho Phó phòng**

a. Xem lịch sử hoạt động

| Mã Use case | UC 095 |  | Tên Usecase | Xem thống kê số lượng sử dụng hệ thống của nhân viên mình quản lý |  |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Phó phòng |  |  |  |  |
| Mô tả | Xem thống kê lịch sử hoạt động của các nhân viên do mình quản lý |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Lịch sử hoạt động |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |
|  | 1 | Lựa chọn thời gian khoảng thời gian muốn thống kê, kiểu biểu đồ hiển thị. |  |  | Hiển thị biểu đồ thống kê & bảng kết quả bao gồm: tổng số lần đăng nhập, số lần upload, số lần download, số lần thực hiện tóm tắt theo từng nhân viên được giao quản lý. Sau khi kích vào từng nhân viên nội dung sẽ hiển thị như UC 098 |
| Luồng sự kiện phụ | 1a | Không lựa chọn thời gian |  |  | Không hiển thị biểu đồ |

b. Thiết đặt cấu hình tóm tắt văn bản

| Mã Use case | UC 096 |  | Tên Usecase | Thiết đặt tham số mô hình AI cho phần tóm tắt. |  |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Phó phòng |  |  |  |  |
| Mô tả | Thiết đặt thông tin về cấu hình tóm tắt văn bản cho cá nhân mình |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Cấu hình tóm tăt văn bản trong menu Cấu hình hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |
|  | 1 | Thiết lập các tham số mặc định khi thực hiện tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể. |  |  | Hiển thị thông tin theo lựa chọn |
|  | 2 | Xác nhận thiết đặt cấu hình (kích nút Lưu trên giao diện hệ thống) |  |  | Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện. Các tham số được sử dụng cho các hoạt động tóm tắt của riêng người dùng. |
| Luồng sự kiện phụ | 2a | Hiển thị lại thông tin thiết đặt hiện tại trong CSDL (kích nút Hủy trên giao diện) |  |  | Hiển thị các thông số hiện tại trong CSDL |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |

3.3.8 Use cases riêng cho Chuyên viên

a.  Xem lịch sử hoạt động

| Mã Use case | UC 097 |  | Tên Usecase | Xem thống kê số lượng sử dụng hệ thống của mình |  |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Chuyên viên |  |  |  |  |
| Mô tả | Xem thống kê lịch sử hoạt động của mình |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Lịch sử hoạt động |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |
|  | 1 | Lựa chọn thời gian khoảng thời gian muốn thống kê. |  |  | Hiển thị bảng thông tin về hoạt động của tài khoản: thời gian, từ địa chỉ IP nào, thực hiện hoạt động gì, mô tả cụ thể. |
| Luồng sự kiện phụ | 1a | Không lựa chọn thời gian |  |  | Không hiển thị bảng thông tin |
| Hậu điều kiện | Không thay đổi dữ liệu |  |  |  |  |

b. Cấu hình tóm tắt văn bản

| Mã Use case | UC 098 |  | Tên Usecase | Thiết đặt tham sô mô hình AI cho phần tóm tắt. |  |
| --- | --- | --- | --- | --- | --- |
| Tác nhân | Chuyên viên |  |  |  |  |
| Mô tả | Thiết đặt thông tin về cấu hình tóm tắt văn bản cho cá nhân mình |  |  |  |  |
| Sự kiện kích hoạt | Kích vào chức năng Cấu hình tóm tăt văn bản trong menu Cấu hình hệ thống |  |  |  |  |
| Tiền điều kiện | Tác nhân đã đăng nhập thành công trên hệ thống |  |  |  |  |
| Luồng sự kiện chính | STT | Tác nhân |  |  | Hệ thống |
|  | 1 | Thiết lập các tham số mặc định khi thực hiện tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể. |  |  | Hiển thị thông tin theo lựa chọn |
|  | 2 | Xác nhận thiết đặt cấu hình (kích nút Lưu trên giao diện hệ thống) |  |  | Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện. Các tham số được sử dụng cho các hoạt động tóm tắt của riêng người dùng. |
| Luồng sự kiện phụ | 2a | Hiển thị lại thông tin thiết đặt hiện tại trong CSDL (kích nút Hủy trên giao diện) |  |  | Hiển thị các thông số hiện tại trong CSDL |
| Hậu điều kiện | Dữ liệu được cập nhật trên hệ thống |  |  |  |  |