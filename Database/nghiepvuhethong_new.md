Dưới đây là **quy trình nghiệp vụ và nhiệm vụ của hệ thống luyện tập từ vựng TOEIC — bản tiếng Việt**, dựa trên database tiếng Việt hiện tại của bạn.

1\. Tổng quan hệ thống
======================

Hệ thống được thiết kế để hỗ trợ **học từ vựng TOEIC theo chủ đề**, có phân quyền rõ ràng giữa:

Nhóm người dùngVai trò trong hệ thống**Người học**Chọn chủ đề, học từ vựng, làm bài tập, làm bài kiểm tra nhỏ, theo dõi tiến độ, quản lý sổ tay cá nhân**Biên tập viên / Giáo viên**Tạo danh mục, chủ đề, từ vựng, câu ví dụ, câu hỏi, media, bài kiểm tra nhỏ**Quản trị viên**Quản lý người dùng, phân quyền, duyệt nội dung, giám sát hệ thống, xem báo cáo tổng thể

Database hiện tại có các nhóm bảng chính:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Người dùng & phân quyền:  - NguoiDung  - VaiTro  - Quyen  - QuyenVaiTro  Nội dung học:  - DanhMucChuDe  - ChuDe  - TuLoai  - TuVung  - CauViDu  - TuVungChuDe  Luyện tập & kiểm tra:  - CauHoi  - LanLamBaiTap  - BaiKiemTraNho  - CauHoiBaiKiemTraNho  - LanLamBaiKiemTraNho  Theo dõi cá nhân:  - DangKyChuDeNguoiDung  - TienDoTuVungNguoiDung  - SoTayTuVungNguoiDung  Duyệt nội dung & media:  - NhatKyDuyetNoiDung  - TepMedia  - LienKetMediaNoiDung  Báo cáo:  - vw_TongQuanNoiDungBienTapVien  - vw_PhanTichHocTapChuDe  - vw_PhanTichBaiKiemTraNho  - vw_TongQuanDanhMucChuDe   `

2\. Mục tiêu nghiệp vụ của hệ thống
===================================

Hệ thống có 5 mục tiêu chính:

2.1. Tổ chức kho từ vựng TOEIC
------------------------------

Từ vựng được tổ chức theo cấu trúc:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Danh mục chủ đề      → Chủ đề          → Từ vựng              → Câu ví dụ              → Audio / hình ảnh              → Câu hỏi luyện tập   `

Ví dụ:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Business English      → Office          → appointment          → colleague          → deadline  Travel English      → Airport          → boarding pass          → luggage          → departure   `

2.2. Hỗ trợ người học học theo lộ trình cá nhân
-----------------------------------------------

Người học có thể:

*   Chọn chủ đề muốn học.
    
*   Học từ vựng bằng flashcard hoặc bài học.
    
*   Làm câu hỏi luyện tập.
    
*   Làm bài kiểm tra nhỏ.
    
*   Xem từ yếu cần ôn lại.
    
*   Theo dõi mức độ thành thạo.
    
*   Lưu từ vào sổ tay cá nhân.
    

2.3. Hỗ trợ giáo viên / biên tập viên xây dựng nội dung
-------------------------------------------------------

Biên tập viên có thể:

*   Tạo danh mục chủ đề.
    
*   Tạo chủ đề học.
    
*   Thêm từ vựng.
    
*   Thêm nghĩa, phiên âm, từ loại.
    
*   Gắn audio UK / US.
    
*   Gắn hình ảnh minh họa.
    
*   Soạn câu ví dụ.
    
*   Tạo câu hỏi luyện tập.
    
*   Tạo bài kiểm tra nhỏ.
    
*   Theo dõi hiệu quả nội dung mình tạo.
    

2.4. Hỗ trợ quản trị viên quản lý toàn hệ thống
-----------------------------------------------

Quản trị viên có thể:

*   Quản lý người dùng.
    
*   Khóa / mở khóa tài khoản.
    
*   Phân quyền.
    
*   Duyệt nội dung.
    
*   Theo dõi hiệu quả học tập toàn hệ thống.
    
*   Xem báo cáo nội dung.
    
*   Kiểm soát dữ liệu media.
    

2.5. Ghi nhận dữ liệu học tập để phân tích
------------------------------------------

Hệ thống ghi nhận:

*   Người học đã học từ nào.
    
*   Làm đúng / sai câu hỏi nào.
    
*   Điểm bài kiểm tra.
    
*   Từ nào đang yếu.
    
*   Chủ đề nào hiệu quả.
    
*   Bài kiểm tra nào quá khó hoặc quá dễ.
    
*   Nội dung nào do giáo viên nào tạo.
    

3\. Các vai trò trong hệ thống
==============================

3.1. Người học
--------------

Người học là người sử dụng chính ở phía học tập.

### Nhiệm vụ của Người học

Nhiệm vụMô tảĐăng ký / đăng nhậpTruy cập hệ thống bằng tài khoản cá nhânChọn chủ đềChọn các chủ đề từ vựng muốn họcHọc từ vựngXem từ, nghĩa, phiên âm, ví dụ, audio, hình ảnhLuyện tậpLàm câu hỏi theo từng từ vựngLàm bài kiểm tra nhỏLàm bài test theo chủ đềXem tiến độTheo dõi mức độ thành thạo từng từQuản lý sổ tayLưu từ quan trọng, thêm ghi chú cá nhânÔn tập từ yếuXem danh sách từ cần ôn lại

### Bảng liên quan

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   NguoiDung  DangKyChuDeNguoiDung  TienDoTuVungNguoiDung  LanLamBaiTap  LanLamBaiKiemTraNho  SoTayTuVungNguoiDung   `

3.2. Biên tập viên / Giáo viên
------------------------------

Biên tập viên là người tạo và quản lý nội dung học tập.

### Nhiệm vụ của Biên tập viên

Nhiệm vụMô tảQuản lý danh mục chủ đềTạo nhóm lớn như Business English, Travel EnglishQuản lý chủ đềTạo chủ đề như Economy, Office, AirportQuản lý từ vựngThêm từ, nghĩa, phiên âm, độ khóQuản lý câu ví dụThêm câu tiếng Anh, dịch nghĩa, audioQuản lý mediaUpload audio, hình ảnh, transcriptQuản lý câu hỏiTạo câu hỏi luyện tậpTạo bài kiểm tra nhỏGom câu hỏi thành mini testGửi duyệt nội dungChuyển nội dung từ bản nháp sang chờ duyệtXem phân tích nội dungTheo dõi số lượng nội dung, trạng thái, hiệu quả học

### Bảng liên quan

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   DanhMucChuDe  ChuDe  TuVung  CauViDu  CauHoi  BaiKiemTraNho  CauHoiBaiKiemTraNho  TepMedia  LienKetMediaNoiDung  NhatKyDuyetNoiDung   `

3.3. Quản trị viên
------------------

Quản trị viên là người kiểm soát toàn hệ thống.

### Nhiệm vụ của Quản trị viên

Nhiệm vụMô tảQuản lý tài khoảnXem, khóa, mở khóa người dùngPhân quyềnGán vai trò Người học, Biên tập viên, Quản trị viênDuyệt nội dungDuyệt, từ chối, lưu trữ nội dungQuản lý hệ thốngTheo dõi dữ liệu và hoạt động hệ thốngXem báo cáo toàn cụcXem phân tích chủ đề, bài kiểm tra, hiệu quả nội dungKiểm soát mediaQuản lý file audio, hình ảnh được upload

### Bảng liên quan

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   NguoiDung  VaiTro  Quyen  QuyenVaiTro  NhatKyDuyetNoiDung  vw_TongQuanNoiDungBienTapVien  vw_PhanTichHocTapChuDe  vw_PhanTichBaiKiemTraNho  vw_TongQuanDanhMucChuDe   `

4\. Quy trình nghiệp vụ tổng thể
================================

4.1. Quy trình quản lý người dùng
---------------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Người dùng đăng ký      → Hệ thống tạo tài khoản NguoiDung          → Mặc định vai trò Người học              → Quản trị viên có thể đổi vai trò nếu cần                  → Người dùng đăng nhập và sử dụng chức năng theo quyền   `

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   NguoiDung  VaiTro  Quyen  QuyenVaiTro   `

### Luồng chính

1.  Người dùng tạo tài khoản.
    
2.  Hệ thống lưu thông tin vào NguoiDung.
    
3.  Người dùng được gán vai trò mặc định NguoiHoc.
    
4.  Nếu là giáo viên, quản trị viên đổi vai trò thành BienTapVien.
    
5.  Nếu là quản trị hệ thống, gán vai trò QuanTriVien.
    
6.  Backend kiểm tra quyền qua VaiTro và Quyen.
    

4.2. Quy trình xây dựng danh mục và chủ đề
------------------------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Biên tập viên / Quản trị viên tạo danh mục chủ đề      → Tạo chủ đề bên trong danh mục          → Gắn từ vựng vào chủ đề              → Chủ đề sẵn sàng cho người học chọn   `

### Ví dụ

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   DanhMucChuDe: Business English      ChuDe: Economy      ChuDe: Office      ChuDe: Contract   `

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   DanhMucChuDe  ChuDe  TuVungChuDe   `

### Luồng chính

1.  Biên tập viên tạo danh mục chủ đề.
    
2.  Biên tập viên tạo chủ đề thuộc danh mục.
    
3.  Chủ đề được đặt mã, mô tả, thứ tự hiển thị.
    
4.  Chủ đề có thể ở trạng thái:
    
    *   BanNhap
        
    *   ChoDuyet
        
    *   DaXuatBan
        
    *   BiTuChoi
        
    *   DaLuuTru
        
5.  Chỉ chủ đề đã xuất bản mới hiển thị cho người học.
    

4.3. Quy trình tạo từ vựng
--------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Biên tập viên tạo từ vựng      → Chọn từ loại          → Nhập nghĩa, phiên âm, độ khó              → Gắn audio / hình ảnh                  → Gắn vào một hoặc nhiều chủ đề                      → Gửi duyệt / xuất bản   `

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   TuLoai  TuVung  TuVungChuDe  TepMedia  LienKetMediaNoiDung   `

### Luồng chính

1.  Biên tập viên nhập từ vựng.
    
2.  Chọn từ loại như danh từ, động từ, tính từ.
    
3.  Nhập nghĩa tiếng Việt.
    
4.  Nhập phiên âm.
    
5.  Gắn audio UK / US nếu có.
    
6.  Gắn hình ảnh minh họa nếu có.
    
7.  Chọn độ khó.
    
8.  Gắn từ vào một hoặc nhiều chủ đề.
    
9.  Gửi nội dung chờ duyệt.
    
10.  Quản trị viên duyệt hoặc từ chối.
    

4.4. Quy trình tạo câu ví dụ
----------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Biên tập viên chọn từ vựng      → Thêm câu tiếng Anh          → Thêm dịch nghĩa tiếng Việt              → Gắn audio ví dụ nếu có   `

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   CauViDu  TuVung  TepMedia  LienKetMediaNoiDung   `

### Mục đích

Câu ví dụ giúp người học hiểu cách dùng từ trong ngữ cảnh thật.

Ví dụ:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Từ: appointment  Câu tiếng Anh: I have an appointment with the manager.  Dịch nghĩa: Tôi có một cuộc hẹn với quản lý.   `

4.5. Quy trình tạo câu hỏi luyện tập
------------------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Biên tập viên chọn từ vựng      → Tạo câu hỏi          → Chọn loại câu hỏi              → Nhập lựa chọn JSON                  → Nhập đáp án đúng                      → Nhập giải thích                          → Gửi duyệt / xuất bản   `

### Các loại câu hỏi

LoạiÝ nghĩaTracNghiemChọn một đáp án đúngDienKhuyetĐiền từ còn thiếuNgheNghe audio và chọn / nhập đáp ánGhepNoiGhép từ với nghĩa hoặc ví dụ

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   CauHoi  TuVung  LanLamBaiTap   `

### Mục đích

Câu hỏi giúp hệ thống đánh giá khả năng nhớ và hiểu từ của người học.

4.6. Quy trình tạo bài kiểm tra nhỏ
-----------------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Biên tập viên tạo bài kiểm tra nhỏ      → Chọn chủ đề          → Thêm danh sách câu hỏi              → Sắp xếp thứ tự câu hỏi                  → Xuất bản bài kiểm tra                      → Người học làm bài   `

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   BaiKiemTraNho  CauHoiBaiKiemTraNho  LanLamBaiKiemTraNho   `

### Luồng chính

1.  Biên tập viên tạo bài kiểm tra nhỏ.
    
2.  Chọn chủ đề liên quan.
    
3.  Thêm câu hỏi vào bài.
    
4.  Thiết lập tổng số câu hỏi.
    
5.  Gửi duyệt hoặc xuất bản.
    
6.  Người học làm bài.
    
7.  Hệ thống ghi nhận điểm, số câu đúng, thời điểm nộp.
    

4.7. Quy trình duyệt nội dung
-----------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Biên tập viên tạo nội dung bản nháp      → Gửi chờ duyệt          → Quản trị viên xem xét              → Duyệt xuất bản              hoặc              → Từ chối kèm ghi chú              hoặc              → Lưu trữ   `

### Trạng thái nội dung

Trạng tháiÝ nghĩaBanNhapNội dung đang soạnChoDuyetĐã gửi quản trị viên duyệtDaXuatBanĐược phép hiển thị cho người họcBiTuChoiBị từ chối, cần sửaDaLuuTruKhông còn sử dụng nhưng giữ lịch sử

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   NhatKyDuyetNoiDung  ChuDe  TuVung  CauHoi  BaiKiemTraNho   `

### Mục đích

Đảm bảo nội dung học tập có kiểm soát chất lượng trước khi đến người học.

5\. Quy trình học tập của Người học
===================================

5.1. Chọn chủ đề học
--------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Người học xem danh mục chủ đề      → Chọn chủ đề muốn học          → Hệ thống ghi nhận đăng ký chủ đề              → Chủ đề xuất hiện trong dashboard cá nhân   `

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   DanhMucChuDe  ChuDe  DangKyChuDeNguoiDung   `

### Ví dụ

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Người học chọn:  Business English → Office   `

Hệ thống lưu:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   NguoiDungID  ChuDeID  ThoiDiemDangKy  DangHoatDong   `

5.2. Học từ vựng
----------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Người học mở chủ đề      → Xem danh sách từ          → Xem nghĩa, phiên âm, ví dụ, audio, hình ảnh              → Đánh dấu đã học / cần ôn   `

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   TuVung  CauViDu  TuVungChuDe  TienDoTuVungNguoiDung   `

### Hệ thống cần thực hiện

*   Lấy từ vựng theo chủ đề.
    
*   Chỉ hiển thị nội dung đã xuất bản.
    
*   Ghi nhận tiến độ học.
    
*   Cập nhật trạng thái ghi nhớ.
    

5.3. Làm bài luyện tập từng câu
-------------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Người học nhận câu hỏi      → Chọn / nhập đáp án          → Hệ thống chấm đúng sai              → Ghi nhận lần làm bài                  → Cập nhật tiến độ từ vựng   `

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   CauHoi  LanLamBaiTap  TienDoTuVungNguoiDung   `

### Hệ thống cần ghi nhận

*   Người làm bài.
    
*   Câu hỏi.
    
*   Từ vựng liên quan.
    
*   Đáp án đã nộp.
    
*   Đúng / sai.
    
*   Điểm nhận được.
    
*   Thời điểm làm.
    
*   Metadata JSON nếu có.
    

5.4. Cập nhật tiến độ từ vựng
-----------------------------

Sau mỗi lần học hoặc làm bài, hệ thống cập nhật bảng:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   TienDoTuVungNguoiDung   `

### Các chỉ số quan trọng

CộtÝ nghĩaMucDoThanhThaoMức độ thành thạo của người học với từHeSoDeNhoHệ số phục vụ ôn tập ngắt quãngSoLanLapLaiSố lần đã ônSoLanDungLienTiepSố lần làm đúng liên tiếpSoLanSaiLienTiepSố lần làm sai liên tiếpThoiDiemOnTapGanNhatLần ôn gần nhấtNgayOnTapTiepTheoNgày nên ôn tiếpDiemGanNhatĐiểm gần nhấtTrangThaiGhiNhoTrạng thái ghi nhớ hiện tại

### Trạng thái ghi nhớ

Trạng tháiÝ nghĩaMoiTừ mớiDangHocĐang họcDangOnTapĐang ôn tậpDaThanhThaoĐã thành thạoBiQuenĐã quên, cần học lại

5.5. Làm bài kiểm tra nhỏ
-------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Người học chọn bài kiểm tra      → Hệ thống tạo lượt làm bài          → Người học trả lời các câu hỏi              → Nộp bài                  → Hệ thống tính điểm                      → Lưu kết quả                          → Cập nhật báo cáo   `

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   BaiKiemTraNho  CauHoiBaiKiemTraNho  LanLamBaiKiemTraNho  LanLamBaiTap   `

### Kết quả lưu lại

*   Bài kiểm tra nào.
    
*   Người học nào.
    
*   Thời điểm bắt đầu.
    
*   Thời điểm nộp.
    
*   Tổng số câu hỏi.
    
*   Số câu đúng.
    
*   Điểm.
    

5.6. Quản lý sổ tay từ vựng cá nhân
-----------------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Người học gặp từ quan trọng      → Thêm vào sổ tay          → Ghi chú cá nhân              → Đánh dấu yêu thích nếu cần                  → Xem lại khi ôn tập   `

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SoTayTuVungNguoiDung  TuVung  NguoiDung   `

### Mục đích

Cho phép người học tự tạo kho từ cá nhân ngoài lộ trình hệ thống.

6\. Quy trình media
===================

6.1. Upload media
-----------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Biên tập viên upload file      → Hệ thống lưu thông tin file          → Gắn file vào từ vựng / câu hỏi / câu ví dụ / chủ đề   `

### Dữ liệu sử dụng

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   TepMedia  LienKetMediaNoiDung   `

### Loại media

LoạiÝ nghĩaAudioUKAudio giọng Anh - AnhAudioUSAudio giọng Anh - MỹImageHình ảnh minh họaExampleAudioAudio cho câu ví dụQuestionAudioAudio cho câu hỏi ngheQuestionImageHình minh họa cho câu hỏi

### Mục đích

Tách file media ra khỏi bảng từ vựng để dễ quản lý, tái sử dụng và kiểm soát dung lượng.

7\. Quy trình phân quyền
========================

7.1. Cấu trúc phân quyền
------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   NguoiDung      → VaiTro          → QuyenVaiTro              → Quyen   `

### Ví dụ quyền

Mã quyềnÝ nghĩaXEM\_DASHBOARDXem dashboardHOC\_TU\_VUNGHọc từ vựngDANG\_KY\_CHU\_DEChọn / đăng ký chủ đềQUAN\_LY\_SO\_TAYQuản lý sổ tayQUAN\_LY\_TU\_VUNGQuản lý từ vựngQUAN\_LY\_CHU\_DEQuản lý chủ đềQUAN\_LY\_DANH\_MUC\_CHU\_DEQuản lý danh mục chủ đềQUAN\_LY\_CAU\_HOIQuản lý câu hỏiQUAN\_LY\_BAI\_KIEM\_TRAQuản lý bài kiểm traDUYET\_NOI\_DUNGDuyệt nội dungQUAN\_LY\_NGUOI\_DUNGQuản lý người dùngXEM\_PHAN\_TICH\_TOAN\_CUCXem phân tích toàn hệ thống

7.2. Nhiệm vụ của backend
-------------------------

Backend cần kiểm tra:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Người dùng đăng nhập chưa?      → Có vai trò gì?          → Vai trò đó có quyền thực hiện action không?              → Có: cho phép              → Không: từ chối   `

8\. Quy trình báo cáo và phân tích
==================================

8.1. Báo cáo nội dung của biên tập viên
---------------------------------------

View:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   vw_TongQuanNoiDungBienTapVien   `

Mục đích:

*   Xem mỗi biên tập viên đã tạo bao nhiêu chủ đề.
    
*   Bao nhiêu từ vựng.
    
*   Bao nhiêu câu hỏi.
    
*   Bao nhiêu bài kiểm tra nhỏ.
    
*   Bao nhiêu nội dung đã xuất bản.
    
*   Bao nhiêu nội dung đang chờ duyệt.
    
*   Bao nhiêu nội dung bị từ chối.
    

8.2. Phân tích học tập theo chủ đề
----------------------------------

View:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   vw_PhanTichHocTapChuDe   `

Mục đích:

*   Chủ đề nào có nhiều người học.
    
*   Chủ đề nào có nhiều từ.
    
*   Mức độ thành thạo trung bình.
    
*   Điểm trung bình gần nhất.
    
*   Bao nhiêu từ đã thành thạo.
    
*   Bao nhiêu từ bị quên.
    

8.3. Phân tích bài kiểm tra nhỏ
-------------------------------

View:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   vw_PhanTichBaiKiemTraNho   `

Mục đích:

*   Bài kiểm tra nào có nhiều lượt làm.
    
*   Điểm trung bình.
    
*   Điểm cao nhất.
    
*   Điểm thấp nhất.
    
*   Số lượt đã nộp.
    
*   Số lượt chưa hoàn thành.
    

8.4. Tổng quan danh mục chủ đề
------------------------------

View:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   vw_TongQuanDanhMucChuDe   `

Mục đích:

*   Danh mục nào có bao nhiêu chủ đề.
    
*   Bao nhiêu chủ đề đã xuất bản.
    
*   Bao nhiêu chủ đề bản nháp.
    
*   Bao nhiêu chủ đề đang chờ duyệt.
    

9\. Nhiệm vụ chính của hệ thống
===============================

9.1. Với Người học
------------------

Hệ thống phải:

1.  Cho phép đăng ký / đăng nhập.
    
2.  Hiển thị danh mục và chủ đề đã xuất bản.
    
3.  Cho phép đăng ký chủ đề học.
    
4.  Hiển thị từ vựng theo chủ đề.
    
5.  Hiển thị nghĩa, phiên âm, audio, hình ảnh, ví dụ.
    
6.  Sinh câu hỏi luyện tập.
    
7.  Chấm điểm bài làm.
    
8.  Cập nhật tiến độ từ vựng.
    
9.  Tính từ yếu cần ôn lại.
    
10.  Quản lý sổ tay cá nhân.
    
11.  Hiển thị dashboard học tập.
    

9.2. Với Biên tập viên / Giáo viên
----------------------------------

Hệ thống phải:

1.  Cho phép tạo danh mục chủ đề.
    
2.  Cho phép tạo chủ đề.
    
3.  Cho phép thêm từ vựng.
    
4.  Cho phép gắn từ vào chủ đề.
    
5.  Cho phép thêm câu ví dụ.
    
6.  Cho phép upload media.
    
7.  Cho phép tạo câu hỏi.
    
8.  Cho phép tạo bài kiểm tra nhỏ.
    
9.  Cho phép gửi nội dung chờ duyệt.
    
10.  Cho phép xem thống kê nội dung mình tạo.
    

9.3. Với Quản trị viên
----------------------

Hệ thống phải:

1.  Quản lý danh sách người dùng.
    
2.  Gán vai trò.
    
3.  Gán quyền theo vai trò.
    
4.  Khóa / mở khóa tài khoản.
    
5.  Duyệt nội dung.
    
6.  Từ chối nội dung kèm ghi chú.
    
7.  Lưu trữ nội dung cũ.
    
8.  Xem báo cáo toàn hệ thống.
    
9.  Theo dõi hiệu quả chủ đề.
    
10.  Theo dõi hiệu quả bài kiểm tra.
    
11.  Giám sát dữ liệu media.
    

10\. Các luồng nghiệp vụ quan trọng
===================================

10.1. Luồng tạo nội dung học tập
--------------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Biên tập viên đăng nhập      → Tạo danh mục chủ đề          → Tạo chủ đề              → Thêm từ vựng                  → Thêm câu ví dụ                      → Thêm câu hỏi                          → Tạo bài kiểm tra nhỏ                              → Gửi duyệt                                  → Quản trị viên duyệt                                      → Người học nhìn thấy nội dung   `

10.2. Luồng học tập
-------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Người học đăng nhập      → Xem danh mục chủ đề          → Chọn chủ đề              → Học từ vựng                  → Làm bài luyện tập                      → Hệ thống chấm điểm                          → Cập nhật tiến độ                              → Đề xuất từ cần ôn   `

10.3. Luồng kiểm tra
--------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Người học chọn bài kiểm tra nhỏ      → Bắt đầu làm bài          → Trả lời từng câu hỏi              → Nộp bài                  → Hệ thống tính điểm                      → Lưu kết quả                          → Cập nhật báo cáo bài kiểm tra   `

10.4. Luồng quản trị
--------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Quản trị viên đăng nhập      → Xem dashboard toàn hệ thống          → Quản lý người dùng          → Duyệt nội dung          → Xem báo cáo học tập          → Xem báo cáo hiệu quả nội dung   `

11\. Đầu vào và đầu ra của hệ thống
===================================

11.1. Đầu vào
-------------

NguồnDữ liệuNgười họcĐăng ký chủ đề, câu trả lời, lượt làm bài, ghi chú sổ tayBiên tập viênChủ đề, từ vựng, câu ví dụ, câu hỏi, media, bài kiểm traQuản trị viênVai trò, quyền, quyết định duyệt nội dungHệ thốngThời điểm tạo, thời điểm cập nhật, điểm, trạng thái ghi nhớ

11.2. Đầu ra
------------

Đối tượng nhậnKết quảNgười họcBài học, câu hỏi, điểm số, tiến độ, sổ tay, từ cần ônBiên tập viênThống kê nội dung, trạng thái duyệtQuản trị viênBáo cáo toàn cục, danh sách user, hiệu quả chủ đề, hiệu quả bài test

12\. Ràng buộc nghiệp vụ
========================

12.1. Nội dung học tập
----------------------

*   Chỉ nội dung DaXuatBan mới hiển thị cho người học.
    
*   Nội dung BanNhap chỉ người tạo hoặc quản trị viên xem được.
    
*   Nội dung ChoDuyet chờ quản trị viên xử lý.
    
*   Nội dung BiTuChoi cần có ghi chú lý do.
    
*   Nội dung DaLuuTru không hiển thị trong luồng học chính.
    

12.2. Người học
---------------

*   Một người học có thể đăng ký nhiều chủ đề.
    
*   Một chủ đề có thể có nhiều người học.
    
*   Một người học chỉ nên có một bản ghi tiến độ cho mỗi từ vựng.
    
*   Một người học chỉ nên lưu một từ vựng một lần trong sổ tay.
    

12.3. Từ vựng
-------------

*   Một từ vựng có thể thuộc nhiều chủ đề.
    
*   Một từ vựng có thể có nhiều câu ví dụ.
    
*   Một từ vựng có thể có nhiều câu hỏi.
    
*   Một từ vựng nên có từ loại, nghĩa và độ khó.
    

12.4. Bài kiểm tra nhỏ
----------------------

*   Một bài kiểm tra nhỏ thuộc một chủ đề.
    
*   Một bài kiểm tra nhỏ gồm nhiều câu hỏi.
    
*   Một câu hỏi có thể xuất hiện trong nhiều bài kiểm tra.
    
*   Kết quả bài kiểm tra phải lưu lại lịch sử làm bài.
    

13\. Kết luận
=============

Hệ thống đang thiết kế là một **nền tảng học từ vựng TOEIC có quản trị nội dung, phân quyền, theo dõi tiến độ và phân tích học tập**.

Có thể tóm tắt thành 3 trục nghiệp vụ chính:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   1. Quản lý nội dung học tập     Danh mục → Chủ đề → Từ vựng → Ví dụ → Câu hỏi → Bài kiểm tra  2. Cá nhân hóa học tập     Chọn chủ đề → Học từ → Làm bài → Cập nhật tiến độ → Sổ tay → Ôn tập  3. Quản trị và phân tích     Người dùng → Vai trò → Quyền → Duyệt nội dung → Báo cáo hiệu quả   `

Bản database tiếng Việt hiện tại đã đủ nền để triển khai các module chính: **Người học**, **Biên tập viên/Giáo viên**, **Quản trị viên**, **Nội dung**, **Luyện tập**, **Kiểm tra**, **Sổ tay**, **Media**, và **Báo cáo**.