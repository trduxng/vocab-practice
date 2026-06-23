<a id="_Toc103347311"></a>__Mục lục  
3\.3\. Đặc tả chi tiết các Use\-case__

__3\.3\.1\. Các Use\-cases dùng chung cho hệ thống__

__a\. UC 001: Đăng nhập hệ thống__

__b\. UC 002: Đăng ký tài khoản \(Dành cho Học viên\)__

__c\. UC 003: Cập nhật thông tin cá nhân__

__d\. UC 004: Thay đổi mật khẩu__

__3\.3\.2\. Các Use\-cases dành cho Học viên \(Learner\)__

__a\. UC 005: Xem Dashboard học tập cá nhân__

__b\. UC 006: Học từ vựng mới theo chủ đề \(Learn\)__

__c\. UC 007: Luyện tập thông qua Flashcard Spaced Repetition \(Practice\)__

__d\. UC 008: Tự động cập nhật tiến trình học từ vựng \(UserWordProgress thông qua SP\)__

__e\. UC 009: Làm đề thi thử \(Mini Test\)__

__f\. UC 010: Xem lịch sử kiểm tra và đáp án chi tiết__

__g\. UC 011: Xem bảng thành tích học tập và Huy hiệu \(Achievements & Gamification\)__

__3\.3\.3\. Các Use\-cases dành cho Biên tập viên \(Content Creator\)__

__a\. UC 012: Xem Dashboard & Báo cáo số liệu Content Creator__

__b\. UC 013: Quản lý Chủ đề \(Topics CRUD \- Trạng thái Draft\)__

__c\. UC 014: Quản lý Từ vựng & Câu ví dụ đi kèm \(Words & Examples CRUD \- Trạng thái Draft\)__

__d\. UC 015: Quản lý Câu hỏi ôn luyện \(Questions CRUD \- Trạng thái Draft\)__

__e\. UC 016: Quản lý Đề kiểm tra ngắn \(Mini Tests CRUD \- Trạng thái Draft\)__

__f\. UC 017: Quản lý Tệp đa phương tiện \(Upload & Quản lý Media Assets \- Hình ảnh/Âm thanh\)__

__g\. UC 018: Gửi nội dung yêu cầu phê duyệt \(Submit for Review\)__

__h\. UC 019: Xem danh sách nội dung: Bản nháp \(Drafts\), Đang chờ duyệt \(Pending\), Bị từ chối kèm lý do \(Rejected\)__

__3\.3\.4\. Các Use\-cases dành cho Quản trị viên \(Admin\)__

__a\. UC 020: Xem Dashboard Analytics hệ thống \(Thống kê toàn cục\)__

__b\. UC 021: Quản lý Danh mục chủ đề \(Topic Categories CRUD\)__

__c\. UC 022: Duyệt và phê duyệt nội dung của Biên tập viên \(Approve/Reject Content\)__

__c\. UC 023: Ghi nhận nhật ký lịch sử duyệt bài \(ContentReviewLogs\)__

__d\. UC 024: Quản lý tài khoản Học viên \(Xem danh sách, Khóa/Mở khóa tài khoản\)__

__e\. UC 025: Xem báo cáo phân tích hiệu suất \(Word Distribution & Daily attempts trends\)  
3\.3\.1 Use case dành cho tất cả người dùng__

__a\. Đăng nhập__

 <a id="_Toc103347312"></a>Mã Use case

 <a id="_Toc103347313"></a>__UC 001__

<a id="_Toc103347314"></a>Tên Usecase

<a id="_Toc103347315"></a>Đăng nhập

 <a id="_Toc103347316"></a>Tác nhân

<a id="_Toc103347317"></a>Tất cả

 <a id="_Toc103347318"></a>Mô tả

<a id="_Toc103347319"></a>Tác nhân đăng nhập hệ thống để sử dụng các chức năng phù hợp với vai trò của mình

<a id="_Toc103347320"></a>Sự kiện kích hoạt

<a id="_Toc103347321"></a>Kích vào nút đăng nhập trên giao diện

<a id="_Toc103347322"></a>Tiền điều kiện

<a id="_Toc103347323"></a>Tác nhân đã có tài khoản trên hệ thống

    

    

<a id="_Toc103347324"></a>Luồng sự kiện chính 

<a id="_Toc103347325"></a>\(Thành công\) 

<a id="_Toc103347326"></a>STT

<a id="_Toc103347327"></a>Tác nhân 

<a id="_Toc103347328"></a>Hệ thống

<a id="_Toc103347329"></a>1

<a id="_Toc103347330"></a>Nhập tài khoản và mật khẩu vào ô textbox trên hệ thống \(mô tả yêu cầu phía dưới\)

<a id="_Toc103347331"></a>Kiểm tra các trường đăng nhập đã hợp lệ hay chưa?

<a id="_Toc103347332"></a>2

<a id="_Toc103347333"></a>Yêu cầu đăng nhập

<a id="_Toc103347334"></a>Kiểm tra tài khoản và mật khẩu có hợp lệ hay không

<a id="_Toc103347335"></a>3

<a id="_Toc103347336"></a>Hiển thị giao diện, chức năng tương ứng với vai trò của người dùng

<a id="_Toc103347337"></a>Luồng sự kiện thay thế

<a id="_Toc103347338"></a>STT

<a id="_Toc103347339"></a>Hệ thống

<a id="_Toc103347340"></a>2a

<a id="_Toc103347341"></a>Hiển thị thông báo lỗi: Cần nhập các trường bắt buộc nếu khách nhập thiếu

<a id="_Toc103347342"></a>2b

<a id="_Toc103347343"></a>Hiển thị thông báo lỗi: Tên tài khoản hoặc mật khẩu sai

<a id="_Toc103347344"></a>2c 

<a id="_Toc103347345"></a>Hiển thị thông báo lỗi: vượt quá 5 lần nhập sai mật khẩu liên tiếp, tài khoản tạm khoá 5 phút

<a id="_Toc103347346"></a>Hậu điều kiện

<a id="_Toc103347347"></a>Tác nhân đăng nhập được vào hệ thống\.

\*Dữ liệu đầu vào gồm các trường dữ liệu sau:

<a id="_Toc103347348"></a>STT

<a id="_Toc103347349"></a>Trường dữ liệu

<a id="_Toc103347350"></a>Mô tả

<a id="_Toc103347351"></a>Bắt buộc

<a id="_Toc103347352"></a>Điều kiện hợp lệ

<a id="_Toc103347353"></a>Ví dụ

<a id="_Toc103347354"></a>2

<a id="_Toc103347355"></a>Tên tài khoản

<a id="_Toc103347356"></a>Input text field

<a id="_Toc103347357"></a>Có

<a id="_Toc103347358"></a>Các chữ cái thường, hoa, chữ số, không chứa dấu cách\.

<a id="_Toc103347359"></a>nhthanh

<a id="_Toc103347360"></a>3

<a id="_Toc103347361"></a>Mật khẩu

<a id="_Toc103347362"></a>Input field

<a id="_Toc103347363"></a>Có

<a id="_Toc103347364"></a>Mật khẩu ít nhất 6 kí tự, không chứa kí tự đặc biệt

<a id="_Toc103347365"></a>123456

<a id="_Toc103347366"></a>__b\. Thay đổi mật khẩu __

 <a id="_Toc103347367"></a>Mã Use case

 <a id="_Toc103347368"></a>__UC 002__

<a id="_Toc103347369"></a>Tên Usecase

<a id="_Toc103347370"></a>Thay đổi mật khẩu

 <a id="_Toc103347371"></a>Tác nhân

<a id="_Toc103347372"></a>Tất cả

 <a id="_Toc103347373"></a>Mô tả

<a id="_Toc103347374"></a>Tác nhân muốn thay đổi mật khẩu cho phù hợp với cá nhân mình, thao tác phải được thực hiện khi lần đầu đăng nhập hệ thống\.

<a id="_Toc103347375"></a>Sự kiện kích hoạt

<a id="_Toc103347376"></a>Click vào nút item Thay đổi mật khẩu trên dropbox Profile của người dùng

<a id="_Toc103347377"></a>Đăng nhập lần đầu vào hệ thống\.

<a id="_Toc103347378"></a>Tiền điều kiện

<a id="_Toc103347379"></a>Tác nhân đã đăng nhập thành công trên hệ thống

    

    

<a id="_Toc103347380"></a>Luồng sự kiện chính 

<a id="_Toc103347381"></a>\(Thành công\) 

<a id="_Toc103347382"></a>STT

<a id="_Toc103347383"></a>Tác nhân

<a id="_Toc103347384"></a>Hệ thống

<a id="_Toc103347385"></a>1

<a id="_Toc103347386"></a>Nhập mật khẩu cũ vào ô textbox trên hệ thống, mật khẩu mới để thay đổi và xác minh lại mật khẩu mới trùng khớp với mật khẩu cần thay đổi\.

<a id="_Toc103347387"></a>Kiểm tra các trường đăng nhập đã hợp lệ hay chưa?

<a id="_Toc103347388"></a>2

<a id="_Toc103347389"></a>Yêu cầu thay đổi mật khẩu

<a id="_Toc103347390"></a>Kiểm tra mật khẩu cũ, mật khẩu mới có trùng khớp hay không\.

<a id="_Toc103347391"></a>Hiển thị giao diện thông báo thay đổi mật khẩu thành công\.

<a id="_Toc103347392"></a>Luồng sự kiện thay thế

<a id="_Toc103347393"></a>STT

<a id="_Toc103347394"></a>Hệ thống

<a id="_Toc103347395"></a>2a

<a id="_Toc103347396"></a>Hiển thị thông báo lỗi thông tin mật khẩu cũ không đúng hoặc mật khẩu không trùng khớp\.

<a id="_Toc103347397"></a>Hậu điều kiện

<a id="_Toc103347398"></a>Mật khẩu mới được cập nhật vào hệ thống\.

\*Dữ liệu đầu vào gồm các trường dữ liệu sau:

<a id="_Toc103347399"></a>STT

<a id="_Toc103347400"></a>Trường dữ liệu

<a id="_Toc103347401"></a>Mô tả

<a id="_Toc103347402"></a>Bắt buộc

<a id="_Toc103347403"></a>Điều kiện hợp lệ

<a id="_Toc103347404"></a>Ví dụ

1

<a id="_Toc103347406"></a>Mật khẩu cũ

<a id="_Toc103347407"></a>Input field

<a id="_Toc103347408"></a>Có

<a id="_Toc103347409"></a>Mật khẩu ít nhất 6 kí tự, có ký tự chữ hoa, chữ thường, không chứa kí tự đặc biệt\.

<a id="_Toc103347410"></a>Abc123

2

<a id="_Toc103347412"></a>Mật khẩu mới

<a id="_Toc103347413"></a>Password field

<a id="_Toc103347414"></a>Có

<a id="_Toc103347415"></a>Mật khẩu ít nhất 6 kí tự, có ký tự chữ hoa, chữ thường, không chứa kí tự đặc biệt\.

<a id="_Toc103347416"></a>Abc123

3

Nhập lại mật khẩu

Password field

Có

Theo quy tắc mật khẩu

<a id="_Toc103347417"></a>__c\. Cập nhật thông tin cá nhân __

 <a id="_Toc103347418"></a>Mã Use case

 <a id="_Toc103347419"></a>__UC 003__

<a id="_Toc103347420"></a>Tên Usecase

<a id="_Toc103347421"></a>Cập nhật thông tin cá nhân

 <a id="_Toc103347422"></a>Tác nhân

<a id="_Toc103347423"></a>Tất cả

 <a id="_Toc103347424"></a>Mô tả

<a id="_Toc103347425"></a>Tác nhân muốn thay đổi thông tin cho phù hợp với cá nhân mình\.

<a id="_Toc103347426"></a>Sự kiện kích hoạt

<a id="_Toc103347427"></a>Click vào item Cập nhật thông tin cá nhân trên dropbox Profile của người dùng

<a id="_Toc103347428"></a>Tiền điều kiện

<a id="_Toc103347429"></a>Tác nhân đã đăng nhập thành công trên hệ thống

    

    

<a id="_Toc103347430"></a>Luồng sự kiện chính 

<a id="_Toc103347431"></a>\(Thành công\) 

<a id="_Toc103347432"></a>STT

<a id="_Toc103347433"></a>Tác nhân 

<a id="_Toc103347434"></a>Hệ thống

<a id="_Toc103347435"></a>1

<a id="_Toc103347436"></a>Điền thông tin muốn thay đổi \(mô tả phía dưới\)

<a id="_Toc103347437"></a>Kiểm tra các thông tin nhập liệu của người dùng\.

<a id="_Toc103347438"></a>2

<a id="_Toc103347439"></a>Yêu cầu cập nhật thay đổi

<a id="_Toc103347440"></a>Hiển thị giao diện thông báo cập nhật thông tin thành công\.

<a id="_Toc103347441"></a>Luồng sự kiện thay thế

<a id="_Toc103347442"></a>STT

<a id="_Toc103347443"></a>Hệ thống

<a id="_Toc103347444"></a>1a

<a id="_Toc103347445"></a>Hiển thị thông báo lỗi thông tin cập nhật không đúng hoặc không đủ\.

<a id="_Toc103347446"></a>2a

<a id="_Toc103347447"></a>Thông báo lỗi hệ thống không thể cập nhật thông tin

<a id="_Toc103347448"></a>Hậu điều kiện

<a id="_Toc103347449"></a>Cập nhật thành công, dữ liệu mới sẽ được lưu trữ trong hệ thống

\*Dữ liệu đầu vào gồm các trường dữ liệu sau:

<a id="_Toc103347450"></a>STT

<a id="_Toc103347451"></a>Trường dữ liệu

<a id="_Toc103347452"></a>Mô tả

<a id="_Toc103347453"></a>Bắt buộc

<a id="_Toc103347454"></a>Điều kiện hợp lệ

<a id="_Toc103347455"></a>Ví dụ

<a id="_Toc103347456"></a>1

<a id="_Toc103347457"></a>Họ tên

<a id="_Toc103347458"></a>Input text field

<a id="_Toc103347459"></a>Có

<a id="_Toc103347460"></a>Các kí tự chữ hoa, thường có dấu cách\.

<a id="_Toc103347461"></a>Ngtha\_01

<a id="_Toc103347462"></a>2

<a id="_Toc103347463"></a>Email

<a id="_Toc103347464"></a>Input email field

<a id="_Toc103347465"></a>Không

<a id="_Toc103347466"></a>Đúng định dạng email

<a id="_Toc103347467"></a>nhthanh@gmail\.com

<a id="_Toc103347468"></a>3

<a id="_Toc103347469"></a>Ngày sinh

<a id="_Toc103347470"></a>DatePicker

<a id="_Toc103347471"></a>Không

<a id="_Toc103347472"></a>Ngày tháng hợp lệ

<a id="_Toc103347473"></a>15/04/1998

<a id="_Toc103347474"></a>4

<a id="_Toc103347475"></a>Số điện thoại

<a id="_Toc103347476"></a>Input text field

<a id="_Toc103347477"></a>Không

<a id="_Toc103347478"></a>Kí tự số

<a id="_Toc103347479"></a>0987324456

<a id="_Toc103347480"></a>5

<a id="_Toc103347481"></a>Giới tính

<a id="_Toc103347482"></a>Nam, Nữ, Khác

<a id="_Toc103347483"></a>Có

<a id="_Toc103347484"></a>Lựa chọn 1 trong 3 giá trị

<a id="_Toc103347485"></a>Nữ

<a id="_Toc103347486"></a>6

<a id="_Toc103347487"></a>Phòng ban

<a id="_Toc103347488"></a>Combobox lấy tên, id phòng ban từ dữ liệu phòng ban

<a id="_Toc103347489"></a>Có

<a id="_Toc103347490"></a>Lựa chọn giá trị

<a id="_Toc103347491"></a>Xử lý dữ liệu ngành

<a id="_Toc103347492"></a>7

<a id="_Toc103347493"></a>Chức vụ

<a id="_Toc103347494"></a>Combo box lấy tên, id chức vụ từ dữ liệu chức vụ

<a id="_Toc103347495"></a>Có

<a id="_Toc103347496"></a>Lựa chọn giá trị

<a id="_Toc103347497"></a>Phó phòng

<a id="_Toc103347498"></a>7

<a id="_Toc103347499"></a>Ảnh

<a id="_Toc103347500"></a>Ảnh đại diện

<a id="_Toc103347501"></a>Không

<a id="_Toc103347502"></a>Định dạng \.png, \.gif, \.jpg, \.jpeg

<a id="_heading=h.f71i9rhzl0io"></a><a id="_Toc103347503"></a>__3\.3\.2 Use cases dành cho chuyên viên, lãnh đạo__

__a\. Quản lý thư mục__

 <a id="_Toc103347504"></a>Mã Use case

 <a id="_Toc103347505"></a>__UC 004 – UC 011__

<a id="_Toc103347506"></a>Tên Usecase

<a id="_Toc103347507"></a>Quản lý thư mục

 <a id="_Toc103347508"></a>Tác nhân

<a id="_Toc103347509"></a>Chuyên viên, lãnh đạo

 <a id="_Toc103347510"></a>Mô tả

<a id="_Toc103347511"></a>Thực hiện các tác vụ thêm mới, thay đổi, xóa, tìm kiếm thông tin thư mục, chia sẻ thư mục\.

<a id="_Toc103347512"></a>Sự kiện kích hoạt

 <a id="_Toc103347513"></a>Kích vào các nút Quản lý văn bản trên giao diện hệ thống

<a id="_Toc103347514"></a>Tiền điều kiện

<a id="_Toc103347515"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103347516"></a>Chuyển đến thư mục nơi muốn thực hiện các thao tác thư mục

<a id="_Toc103347525"></a>Luồng sự kiện chính \(Thành công \)

<a id="_Toc103347517"></a>STT

<a id="_Toc103347518"></a>Tác nhân 

<a id="_Toc103347519"></a>Hệ thống

<a id="_Toc103347520"></a>*Xem danh sách thư mục*

<a id="_Toc103347521"></a>1

<a id="_Toc103347522"></a>Kích vào thư mục cần xem

<a id="_Toc103347523"></a>Hiển thị danh sách thư mục, file của thư mục vừa kích để người dùng có thể tiếp tục xem tiếp\.

<a id="_Toc103347524"></a>*Thêm mới thư mục \(UC 004\)*

<a id="_Toc103347526"></a>1

<a id="_Toc103347527"></a>Đưa yêu cầu thêm mới \(Kích nút ![A close-up of a sign

AI-generated content may be incorrect.](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHsAAAA+CAYAAAALUmSgAAAEu0lEQVR4Xu2ZW28TRxTH/YkS5RNEydfgtbRSpQLipTxUqtSoUisuagMSErSqqVOISqgUAkRAQ3lIS1VIbK/tGCfxhTghhbQSbuNLrof9n806k8U4o+I6zsz5SUf2zswGz/7mzM4MIRKsIRQsEMxFZFuEyLYIkW0RItsiRLZFiGyLENkW0VT2kcspiUMU+7GvbOFwoONKZBuCjiuRbQg6rkS2Iei4EtmGoONKZBuCjiuRbQg6rkS2Iei4EtmGoONKZBuCjiuRbQg6rkS2Iei4EtmGoONKZBuCjiuRbQg6rqyWvb29TR+PzHE/EU7x32CTOmj74VCG2+ET128j8miZ2+FTBfdcmCg2rHtXdFxZLXtjY4PeD+/+5/+58SxtbW0FmzHhyaV6O8T6+nqwCbO5ucn1AzeStLj0nK/Vui9vegPm4v052lDq3hUdVwciGw+0Uqnwwz5I1lxhR13Z732XpGMRh/vb6DdBysnhNB112320025tbS3YjDN3YCxHx4eSNDufpVptbxvIns/l6fFUlJ4tFM2XjQfS399PPT09lM1m94z8duPLhsQzNxPc3/DkYrAZRQuvuO70aJyODXntGslGX7K5PKXST6larXFfEZ/fyvM9+I7BhH+31f3WcXUgsvv6+qi7u5symUzDTGoXquzM3Dz3FxmsZhxmoXPjOa7LzM7T8R+SDWXfcVa4XA28l9fd/n1yPV2/x3+fo30r0XElsll2il6VSnTqmpe1yGQf/L4PrszQqeEElUr/0ImAbPTn/M8LXHb5rkNT0TjH2Z2Z4ut7BTpxNcUzQqVS5Xc1yn/8rfDW9cF/QcdVW2TjgdRqNSqXy7S6ukq9vb3U1dVFjuO4D7DE5dVqtekK9/+gLtuNcrlC4QkvA5HJvghM6ygLT8xQ2V1nBGX7U/zAjQQVF5eo4vYDUrP5Ag8Q1CESM2me2i/cneXr4V9zLZ3KdVy1RXYkEqFQKNQ0BgcHeUC0E1U2JBXd1TOmdGQyMlpdmKEOslTZGBDfPCzw9ZUHmT1TO/ry1e0Zrrs0HucBjb9pvOzDkNn4DpnIUPR7LPqCpvN+1ia5DtstVTZvpca8rdSDWOGNbZYv9upklgeOWmasbJWOfGfvyMZvGf/Dk/HpTxk6eyfL31GGuqBslH0x+pSvr/++QFvKYG0ktlFZq9BxJbIV2ZiWV/76u769QmDRhjLUNZL9/UMvs0/fmn0js09e86bxpeVlvt9K2R23z96RzWWuxG/v7W6fsGjz64KyIRCnZP7guB1/ye3Qx8H7z7jszKjD6wFgnWzQaSdoqmwIwKoaizJ/YeZLCcoGOCVLpNL02Yh3sqbGyC8xyuV33+VWyu4UIC+eSHKoZ91YTMacJIe6Q8DgTLpbqKlYvD44kMVYvOF49PF0lPfYT6Zj/Pni5cqeAY1FGo5JUf98+U8z99mdCkRBMkLdCTQr9487VerlbrbXw22jLth8kM2oa2VWAx1XVss2CR1XItsQdFyJbEPQcSWyDUHHlcg2BB1XItsQdFyJbEPQcSWyDUHHlcg2BB1XItsQdFyJbEPQcSWyDUHH1b6yJQ5P7EdT2YJZiGyLENkWIbItQmRbhMi2CJFtESLbIkS2RbwGPwEgbVHbezwAAAAASUVORK5CYII=)trên giao diện hệ thống\)

<a id="_Toc103347528"></a>Hiển thị menu chức năng tạo mới thư mục bằng một số cách\.

<a id="_Toc103347529"></a>2a

<a id="_Toc103347530"></a>Chọn Thư mục trong menu sổ xuống![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUcAAACNCAYAAAAkTbgNAAAQIElEQVR4Xu2di29Vx4GH/afsSqkaqdqXojaij1Bti0KVZpNtoWEhOGGz5ZEsjQmhqdqGR8piilJhoRIMbKhpaLrZFbVFggkhvO2a2MHmYUNsMNiYYOPEEMBgmwVm+c12Lsfnzrm+vr7G9/p8n/STuXNm5h4D/jxnZu45BQMDA0bp7+83fX195vr166a3t9d+vXXrlgEAGO/IdUH3yYUFPjFevXoVMQJArJDz5D4nyAKJ8caNG/bFtWvX7EGJEgAgbsh9cqBcWOBGjHpx5coV88UXXzBqBIBYIvfJgXJhgUaN7lJahZcuXTJ37twJtwEAGPfIfXKgXFjgxChTXr582XR3d4frAwDEBjlQLkzIUS8+++wzc/HixXBdAIDYIAfKhQXBy2kVXrhwIVwXACA2/GzHBetCK0eNGj///HPT1dVlOjo6wnUBAGLDT7d3WBcWaK6xp6fHDiM1amxvbw/XBQCIDYvebbcuLNCoUXLUMPL8+fPmzJkz4boAALHh5W1nrQutHHVJ3dnZaS+pT58+Ha4LABAbFla0WhcWaCFGS9caRra1tZnmlpZwXQCA2LCw/LRpb6+8J8dPP/3UyvHkyZPhugAAseGlP7UMlqOGkZpvbGxqCtcFAIgNkmNbW4spcIsxkmNra6s5cvSo3fNICCFxzIKtzfYqukCLMU6OWoypb2hIqkwIIXFJc3OzOXv27D05njt3zhbW1dUlVSaEkLhEHtQUo5WjdoO3tbebk598YmpqDiVVJoSQuCRZjnevsZuamszBqqqkyoQQEpd8cneQmJCjNoCfvSvHxsZGs3ffvqTKhBASlwySozaAawLy+F057tm7N6kyIYTEJX45Hj9uPty9O6kyIYTEJZFy3PXh/ZPjkSNHzIoVK8wrr7zizZYtW5LaEELIaCYn5JhKjLkuyFWrVpm33347qZwQkt+JlOP9vKwOizDTSLIahYb7zzQS30MPPeTNjBkz7N8VciRkfMYvx/u8IBOW3EgiQYb7z0YkwEWLFtkV/WB5pnI8deqU2bp1q/08e/gYIWTskyzHMdjK48QWLh9ustWPL6nkuGHDBlNcXGwmTJhgpkyZYg4cOGCP6RfNvHnzBo1m1c/LL79sdu3aZZYvX54kR/W3Zs0aW+fhhx+2/e3fv9+Ul5ebyZMn2/dYuXKlvXuS609tXHu9p0a1+/7y76c7u7/zzju2rforKiqyd1wKvichJDlJchyLTeDZklq2+vEllRyfeOIJK0Rtot+8ebOZPXu2/RhmlBwnTZpk2/kkpfLCwkLT0NBg/z3Wrl1rHnnkEVuuPvVvM2vWLFNRUZHoL5UcJcbnnnvOvpc+HlpWVmYWLFiQkCshxJ9kOf7l44N//nNNUuXRynClFlU/qjwbSSXHN998M/FaIpw5c6Y5duxYpBx9/QT7Cy4+1dfXm2nTptmvwTpOiKnkqFu8z58/3+zYsSNxXDcWkcB1WR9+b0LIvSR9QkYP1tJnCmtra5Mqj1aGK7Wo+lHl2UiU1MJzjhKh5KSvmcoxqr9gnXTkqD/PmTNnkFgJIeklSY66dNOo4vB9/IFKV2quXjjh4+F22UiU1FLJDDkSkr+JlGM2t8QMlXSlFpZiuF34dTYTJbVUMvPJKaqfdPoL1gnKUQs0ulmxXg91Wa33raqqssfC700IuRevHHWz22PHjydVHq0MV2pR9aPKs5EoqaWSmeqqjRZVNJ+rRRYttvj6Sae/YB0nR0lw6tSpVsAS3qZNm+yqNAsyhIwsSXJ0j0nQqmi48mhluFKLqh9Vno1kIke9Pnr0qHn22WetsLSKvWzZMm8/6fbn6jg5aqvOxo0b7RYftwqu7T++rTyqs2TJEhZjCEkjOz/YY/bsO+iR44kTSZVHK9mSWrb6IYQQ78hRBb49eKOVbEktW/3kW7SRXCPS0tLSpGOEkMySE3JcvHhxQmwjzWh9fDDXo081KeFyQkhmiZSjDoQrj1Y0n5bOnXmGSrZvPEEIiW9yQo6EEJJrQY6EEOIJciSEEE+QIyGEeIIcCSHEE+RICCGeIEdCCPEEORJCiCcp5QgAEFeQIwCAB+QIAOABOQIAeECOAAAekCMAgAfkCADgATkCAHhIKceW022EEBLLpJQjAEBcQY4AAB6QIwCAB+QIAOABOQIAeECOAAAePtj1oZlR+K/IEQAgCHIEAPCAHAEAPCBHAAAPyBEAwMPHhw+buS+8iBwBAILIgTt37kKOAABB2OcIAOABOQIAeMhJOZ49e9aUlJSYpUuXpkxFRUW46Zhx4sRJM336TPPee9vNnTt3wocBIM/ISTmuXr06SYRRyRVB/u+tW+ajj2rNz3/xS9Pf358oO3bsmLly5UqodjQDAwOmtHSD+e6kR82hQx9lLNqVv15l48hWvwBxISfl6MSXivshSMnlr/76AW+e/OcfmkuXLiXqnjp12syd+7xpa29PlF2+/IX5l+lPm/ff35koc9y4ccO8+OIC885//8+g8sod75v/WLHS/hsULVhomltaBh1Pl7Acs9UvQFwYF3IcTUE6JDHJTFLLBlFyzBZhOQLA8Bg3chxtQUbJsa+vz6xbt9589WsTzJcf/IopKnrJ6O9SaGSpEaYuY4NolPmNb05MjEKD/dbXN5ipP5pmyzWH6UZ4alP4zCzzu99tNhO+/i37Xq//ZrV9fx9hOUb1q3OcNevfzLZt79ryB770oJn/k6LE9wAQV8aVHEdTkFFyXL9+o71M1SW05vUkrOXLV9j5xig5Ct/Isbm52UyZ8pRpbGwyN2/eNNu3V5qnZz5juru7rRwnTvxHU1a22fT29prW1jO27u/f2hLo9R5BOabq152jhNjVddH09PSYf5//ovnt2jdCPQLEi3Enx6HaZYpPjlrU0GJLsEwilIgky+HIUX2tWvW62bSpLFFHEpw9Z56pq6tLjByDIzqN9n48e66tF8bJcah+dY4zZhRacTp0Ti8tXJRYWAKII3krRx+ZtksHnxzF9es3zBvrSu1ldXixZjhydK/DCz+K2kuOuvwNLgLp0ljCDJY5nByH6tddVqt/R9T3ChAnkGOa+IShS2ddRuuyWpejQsIZiRwrK3eEav4/PjlqtKdRXzpyjOoXOQL4yTs5NjQ0RM4rpmo3UnzCcOIJyq+qujojOUq0mqt085UO92efHHfv2TvkZfVQ/SJHAD95JUeJ0R2rqakJH45slw18wtDixquvLjHLXvuVHTm2tJyyK77pyFFzgdp3WFKyxvZ5+/Ztu6KsVWzti7x1V15adHn+hfl272RwQUYr1B0d581T06YPWtAJElyQSdUvcgTwkzdyDIrRRWVBfO2yRZQw9PemlV5tgZEY39ryB7tlprOzK6UchaQ18dvfSSzgSJj6lM3jjz9p5wQfnfyY2b//gC2XvLShXPObbiuPVpTT2cqTql/kCOAnL+ToE6NPkOF24wnfZTUAjB55Icfy8vKECINS1Fcdi2qXr1RVVdtRokaTDuQIcH/JCzkK3aknfMyVOXzt8hHtndQNK4ILKMgR4P6SN3J0ZHoMAGA4IEcAAA95J8dUZNoOACBMTsqxuLg4IbrhRjfKBQAYKTkpRy20DOdu4EExhhdpAAAyYecHe8yefQdzS44AAGPNkSNHTFNTE3IEAAiCHAEAPCBHAAAPyBEAwANyBADwgBwBADwgRwAAD7rzV2Njoyk4eeYzc6z5gmk4cc7UHm011XUnw3UBAGJDfX09cgQACPPxxx/bWwciRwCAALW1tXbeETkCAAQ4dOiQOXz4MHIcKSdOnLQP2Hrvve32wVUAkN9UV1fb0SNyHCF6pIGe8PfzX/zS9Pf3J8o0Z6HHHqSDnvrnnhiYz/ieujgwMGBKSzeY70561JbzCwRyncQty3JBjrrdWElJSdKtyFwqKirCTUYViUqPMvXFPZvaoWe8zJ37vH0WtEMPyNKDsvS86DB67Kkefxp87vR4lmPljvftc7r1n61owULT3NISaAGQe+SUHNO5h+P9FqQj289yzqYcu7oumm3b3jU3b94MHxoTfHIEyDdySo5hEWYajT6zfdPbKDn29fWZdevWm69+bYL58oNfMUVFLxltqBdRktAo8xvfnJgYhbp+9R5Llr5m/vPNTebv/v4hM+Hr30rMYaovPX1QbR2qP/8nRebgwSqzdNlrSXKUaNes+a2t88CXHjSPTn7M1NbW2T7Vt85Xo7nr168n+gvKOXz+mibYuvVPtq36mzfvBXP+/PlEfUe4naivbzBTfzTNfr+am3UjR30/hc/MMtu3V9rzC58TwFgxLuWoSJDZJEqO69dvtJeJuoTWvNrrv1ltli9fYUXik4QjauQoKeoSVPOWu3fvMY99/5/MuXMdkXKUlItX/torKYluypSnTEvLqbuyuWHWvrHO/M3f/oMt1zxoe/s589S06aaycoetP5QcJUaJraPjvP1eN//+LfP8C/OTRBZu19zcbM+jsbHJClwifHrmM6a7uzvxi0JC1DlpWkJ13TkBjBU5KceRkq1+gvjkqBGdfqCDZRKCfrgly7AkgkTJUSNH97xqtf/BD6eaurq6SDmGzymIRPfHP/5X4rVGa48//uSg+T7VcUJMJcfe3l7z49lzze49exPHr169at7a8gd7WR8k2E5/R6tWvW42bSpLHFdfs+fMs9+Xvp8ZMwpNZ2dX4rjOQb9kAMaSvJOjPu841LxjOv0MlygRaUT2xrpSO4ILL9ZkIscoOWUqx2D/avvEkz8Y1Ee6ctSfdfmbzkJKsJ37PsMLWoqO61z0famNI3hOAGNFXslRYnR1ampqwocTDNVPJvhEpBGeRji6rO7p6bFl+oFHjslyjLpMRo6Qq+SNHINidFGZj1T9ZIpPRO4HPyi/qurqUZNjWE6+cwqSiRw19+f2IAbf33dZrcWow4frzbVr1xJlIthOv0A0B+vmYR3uz8gRcpW8kKNPjKkEGdXPSPCJSIsLr766xCx77Vd25KiFDy1YpCNHCUgiKilZY/u8fft2Sjk6mWpRRZfyei/NbYbPKchw5aj3mfy971sBS4ZlZZvtqrQ7/0wXZLRSrUUX7fe8dVeKra1nbDstviBHyFXyQo7l5eUJEQalqK86Fiaqn5Hgk6PQth23VUbi0AKFtqxogSEsiTCSxsRvfyexgJNKjkJSUd96r5mFz5rFi5d6z8kxXDlqNKdtRNpO41bBtb3GvX9wK4/q6NNA4cUYET5v/SLQp4e0GKS5RvW5f/8BW44cIVfJCzkKt28xWCdqL2OqfgAA0iFv5OjIVh3w46YKtH8TIM4gR0iira3NBiDO5J0c0yFb/QBAfMkpORYXFyfENtLoJhYAAJmSU3LUAks6d+YZKuojarEGACAdckqOAAC5AnIEAPCAHAEAPCBHAAAPyBEAwANyBADwgBwBADwgRwAAD8gRAMADcgQA8IAcAQA8IEcAAA/IEQDAA3IEAPCQUo4tp9sIISSWSSlHAIC4ghwBADwgRwAADwk56uH0nZ2dpqOjwxboAABAXEGOAAAenBz/DxF+Y/AZWuBQAAAAAElFTkSuQmCC)

 <a id="_Toc103347531"></a>Xuất hiện modal box để người dùng nhập tên thư mục mới\.

<a id="_Toc103347532"></a>3a

<a id="_Toc103347533"></a>Nhập tên thư mục, kích nút Tạo để hoàn tất thao tác

<a id="_Toc103347534"></a>Kiểm tra vùng lưu trữ xem còn chỗ trống không? Nếu có tạo thành công thư mục có tên người dùng đã nhập trên hệ thống

<a id="_Toc103347535"></a>2b

<a id="_Toc103347536"></a>Chọn Tải thư mục lên

<a id="_Toc103347537"></a>Mở cửa sổ Browse thư mục trên máy người dùng

<a id="_Toc103347538"></a>3b

<a id="_Toc103347539"></a>Chọn thư mục trên máy mình, kích nút Tải lên

<a id="_Toc103347540"></a>Kiểm tra vùng lưu trữ xem còn chỗ trống không? Thêm thành công thư mục & toàn bộ file nằm trong thư mục người dùng trên hệ thống\.

<a id="_Toc103347541"></a>Luồng sự kiện thay thế

<a id="_Toc103347542"></a>3c

<a id="_Toc103347543"></a>Tên thư mục để trống

<a id="_Toc103347544"></a>Thông báo lỗi, tên thư mục không được để trống\.

<a id="_Toc103347545"></a>3d

<a id="_Toc103347546"></a>Vùng lưu trữ đã đầy không thể tạo mới thư mục\. 

<a id="_Toc103347547"></a>Thông báo tạo thư mục không thành công\.                                                                                                                                                                                                                                                                                                                                                                                                                                             

<a id="_Toc103347548"></a>*Xoá thư mục \(UC 005\)*

<a id="_Toc103347549"></a>Luồng sự kiện chính

<a id="_Toc103347550"></a>1

<a id="_Toc103347551"></a>Ấn phím Ctrl \(đối với windows/linux\) \+ chuột phải để đánh dấu các thư mục cần thao tác

 <a id="_Toc103347552"></a>Highlight thư mục đã chọn

<a id="_Toc103347553"></a>2

<a id="_Toc103347554"></a>Kích nút xoá trên thanh công cụ

<a id="_Toc103347555"></a>Hiển thị popup “Bạn có chắc chắn muốn xoá ?”

<a id="_Toc103347556"></a>3

<a id="_Toc103347557"></a>Xác nhận đồng ý xóa

<a id="_Toc103347558"></a>Chuyển các thư mục đánh dấu xoá vào thùng rác

<a id="_Toc103347559"></a>Luồng sự kiện thay thế

<a id="_Toc103347560"></a>3b

<a id="_Toc103347561"></a>Không đồng ý xóa

<a id="_Toc103347562"></a>Thư mục vẫn tồn tại ở vùng lưu trữ

<a id="_Toc103347563"></a>*Đổi tên thư mục \(UC 006\)*

<a id="_Toc103347564"></a>Luồng sự kiện chính

<a id="_Toc103347565"></a>1

<a id="_Toc103347566"></a>Đưa yêu cầu đổi tên thư mục \(Kích chọn chức năng Đổi tên từ menu sổ xuống khi kích chuột phải vào tên thư mục hoặc từ menu gắn với tên Thư mục\)

<a id="_Toc103347567"></a>Xuất hiện hộp thoại với Tên thư mục được đánh dấu để sẵn sàng sửa

<a id="_Toc103347568"></a>2

<a id="_Toc103347569"></a>Thay đổi tên thư mục theo ý muốn\.

<a id="_Toc103347570"></a>Hiển thị tên theo nội dung người dùng thay đổi

<a id="_Toc103347571"></a>3

<a id="_Toc103347572"></a>Nhấn phím Enter để hoàn tất quá trình thay đổi hoặc kích vào “Đồng ý”\.

<a id="_Toc103347573"></a>Thông báo thay đổi thành công\. Thư mục được đặt lại tên theo tên mới\.

<a id="_Toc103347574"></a>Luồng sự kiện thay thế

<a id="_Toc103347575"></a>3a

<a id="_Toc103347576"></a>Tên thư mục để trống

<a id="_Toc103347577"></a>Tên không để trống, quay trở về tên cũ trước khi đổi\.

<a id="_Toc103347578"></a>*Xoá vĩnh viễn thư mục \(UC 007\)*

<a id="_Toc103347579"></a>Luồng sự kiện chính

<a id="_Toc103347580"></a>1

<a id="_Toc103347581"></a>Kích chọn chức năng thùng rác

<a id="_Toc103347582"></a>Hiển thị giao diện các thư mục/file đang ở trong thùng rác

<a id="_Toc103347583"></a>2

<a id="_Toc103347584"></a>Chọn file muốn xóa

<a id="_Toc103347585"></a>Kích nút “Xóa” trên cửa sổ\. 

<a id="_Toc103347586"></a>Hiển thị popup xác nhận việc xóa\.

<a id="_Toc103347587"></a>3

<a id="_Toc103347588"></a>Xác nhận xóa

<a id="_Toc103347589"></a>Xoá vĩnh viễn các thư mục tồn tại trên hệ thống trong mục thùng rác\.

<a id="_Toc103347590"></a>Luồng sự kiện thay thế

<a id="_Toc103347591"></a>3a

<a id="_Toc103347592"></a>Không xác nhận xóa

<a id="_Toc103347593"></a>Không xóa thư mục trong thùng rác\.

<a id="_Toc103347594"></a>*Kéo di chuyển thư mục \(UC 008\)*

Luồng sự kiện chính

<a id="_Toc103347595"></a>1

<a id="_Toc103347596"></a>Kéo thư mục muốn di chuyển chuyển đến vị trí mới \(thư mục mới\)\.

<a id="_Toc103347597"></a>Thư mục được kéo xuất hiện tại vị trí đã kéo vào 

Luồng sự kiện thay thế

<a id="_Toc103347598"></a>1a

<a id="_Toc103347599"></a>Quá trình kéo thả chuột không đúng vị trí

<a id="_Toc103347600"></a>Thư mục chưa được đặt vào vị trí mới

<a id="_Toc103347601"></a>*Tải thư mục xuống \(UC 009\)*

<a id="_Toc103347602"></a>1

<a id="_Toc103347603"></a>Đưa yêu cầu tải thư mục

<a id="_Toc103347604"></a>Xuất hiện cửa sổ để chọn nơi ghi thư mục trên máy tính người dùng

<a id="_Toc103347605"></a>2

<a id="_Toc103347606"></a>Chọn thư mục để ghi vào

<a id="_Toc103347607"></a>Ghi toàn bộ nội dung thư mục vào nơi người dùng đã chọn

<a id="_Toc103347608"></a>*Chia sẻ thư mục \(UC 010\)*

Luồng sự kiện chính

<a id="_Toc103347609"></a>1

<a id="_Toc103347610"></a>Đưa yêu cầu chia sẻ thư mục \(Kích mục Chia sẻ trong menu sổ xuống khi kích vào thư mục\)

<a id="_Toc103347611"></a>Hiển thị cửa sổ cho phép chọn người được chia sẻ\. 

<a id="_Toc103347612"></a>2

<a id="_Toc103347613"></a>Tìm tên người muốn chia sẻ \(có thể gõ một số ký tự gợi ý\)

<a id="_Toc103347614"></a>Hiển thị thành viên hệ thống theo tên đã nhập\.

<a id="_Toc103347615"></a>3

<a id="_Toc103347616"></a>Chọn thành viên muốn chia sẻ

<a id="_Toc103347617"></a>Tên thành viên được chọn xuất hiện trong hộp chia sẻ

<a id="_Toc103347618"></a>4

<a id="_Toc103347619"></a>Kích nút Chia sẻ để xác nhận thông tin chia sẻ\.

<a id="_Toc103347620"></a>Ghi lại thông tin chia sẻ của thư mục\.

<a id="_Toc103347621"></a>*Bỏ chia sẻ \(UC 011\)*

Luồng sự kiện chính

<a id="_Toc103347622"></a>1

<a id="_Toc103347623"></a>Đưa yêu cầu chia sẻ \(Kích mục chia sẻ trên menu sổ xuống khi kích chuột phải vào thư mục\) 

<a id="_Toc103347624"></a>Hiển thị danh sách người dùng đã được chia sẻ của thư mục

<a id="_Toc103347625"></a>2

<a id="_Toc103347626"></a>Kích chọn Bỏ chia sẻ để không chia sẻ cho người dùng đã chọn\.

<a id="_Toc103347627"></a>Danh sách chia sẻ được cập nhật trong CSDL\. Bỏ chia sẻ thành công\.

<a id="_Toc103347628"></a>Hậu điều kiện

<a id="_Toc103347629"></a>Dữ liệu được cập nhật trên hệ thống

<a id="_Toc103347630"></a>__b\. Quản lý file văn bản__

  <a id="_Toc103347631"></a>Mã Use case

 <a id="_Toc103347632"></a>__UC 012 – UC 020__

<a id="_Toc103347633"></a>Tên Usecase

<a id="_Toc103347634"></a>Quản lý file

 <a id="_Toc103347635"></a>Tác nhân

<a id="_Toc103347636"></a>Chuyên viên, lãnh đạo

 <a id="_Toc103347637"></a>Mô tả

<a id="_Toc103347638"></a>Thực hiện các tác vụ thêm mới, thay đổi, xóa, chia sẻ, tải xuống văn bản

<a id="_Toc103347639"></a>Sự kiện kích hoạt

 <a id="_Toc103347640"></a>Kích vào các nút Quản lý văn bản trên giao diện hệ thống

<a id="_Toc103347641"></a>Tiền điều kiện

<a id="_Toc103347642"></a>Tác nhân đã đăng nhập thành công trên hệ thống\.

<a id="_Toc103347643"></a>Chuyển đến thư mục nơi muốn thực hiện các thao tác với văn bản

    

<a id="_Toc103347644"></a>STT

<a id="_Toc103347645"></a>Tác nhân

<a id="_Toc103347646"></a>Hệ thống

<a id="_Toc103347647"></a>*Xem danh sách file \(*UC 012*\)*

 <a id="_Toc103347648"></a>Luồng sự kiện chính \(Thành công \)

<a id="_Toc103347649"></a>1

<a id="_Toc103347650"></a>Kích vào thư mục cần xem

<a id="_Toc103347651"></a>Hiển thị danh sách thư mục, file văn bản của thư mục vừa kích để người dùng có thể tiếp tục xem tiếp\.

<a id="_Toc103347652"></a>*Thêm mới văn bản \(*UC 013*\)*

<a id="_Toc103347653"></a>Luồng sự kiện chính \(Thành công \)

Luồng sự kiện thay  thế

<a id="_Toc103347654"></a>1

<a id="_Toc103347655"></a>Đưa yêu cầu thêm mới file  văn bản \(Kích nút ![A close-up of a sign

AI-generated content may be incorrect.](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHsAAAA+CAYAAAALUmSgAAAEu0lEQVR4Xu2ZW28TRxTH/YkS5RNEydfgtbRSpQLipTxUqtSoUisuagMSErSqqVOISqgUAkRAQ3lIS1VIbK/tGCfxhTghhbQSbuNLrof9n806k8U4o+I6zsz5SUf2zswGz/7mzM4MIRKsIRQsEMxFZFuEyLYIkW0RItsiRLZFiGyLENkW0VT2kcspiUMU+7GvbOFwoONKZBuCjiuRbQg6rkS2Iei4EtmGoONKZBuCjiuRbQg6rkS2Iei4EtmGoONKZBuCjiuRbQg6rkS2Iei4EtmGoONKZBuCjiuRbQg6rqyWvb29TR+PzHE/EU7x32CTOmj74VCG2+ET128j8miZ2+FTBfdcmCg2rHtXdFxZLXtjY4PeD+/+5/+58SxtbW0FmzHhyaV6O8T6+nqwCbO5ucn1AzeStLj0nK/Vui9vegPm4v052lDq3hUdVwciGw+0Uqnwwz5I1lxhR13Z732XpGMRh/vb6DdBysnhNB112320025tbS3YjDN3YCxHx4eSNDufpVptbxvIns/l6fFUlJ4tFM2XjQfS399PPT09lM1m94z8duPLhsQzNxPc3/DkYrAZRQuvuO70aJyODXntGslGX7K5PKXST6larXFfEZ/fyvM9+I7BhH+31f3WcXUgsvv6+qi7u5symUzDTGoXquzM3Dz3FxmsZhxmoXPjOa7LzM7T8R+SDWXfcVa4XA28l9fd/n1yPV2/x3+fo30r0XElsll2il6VSnTqmpe1yGQf/L4PrszQqeEElUr/0ImAbPTn/M8LXHb5rkNT0TjH2Z2Z4ut7BTpxNcUzQqVS5Xc1yn/8rfDW9cF/QcdVW2TjgdRqNSqXy7S6ukq9vb3U1dVFjuO4D7DE5dVqtekK9/+gLtuNcrlC4QkvA5HJvghM6ygLT8xQ2V1nBGX7U/zAjQQVF5eo4vYDUrP5Ag8Q1CESM2me2i/cneXr4V9zLZ3KdVy1RXYkEqFQKNQ0BgcHeUC0E1U2JBXd1TOmdGQyMlpdmKEOslTZGBDfPCzw9ZUHmT1TO/ry1e0Zrrs0HucBjb9pvOzDkNn4DpnIUPR7LPqCpvN+1ia5DtstVTZvpca8rdSDWOGNbZYv9upklgeOWmasbJWOfGfvyMZvGf/Dk/HpTxk6eyfL31GGuqBslH0x+pSvr/++QFvKYG0ktlFZq9BxJbIV2ZiWV/76u769QmDRhjLUNZL9/UMvs0/fmn0js09e86bxpeVlvt9K2R23z96RzWWuxG/v7W6fsGjz64KyIRCnZP7guB1/ye3Qx8H7z7jszKjD6wFgnWzQaSdoqmwIwKoaizJ/YeZLCcoGOCVLpNL02Yh3sqbGyC8xyuV33+VWyu4UIC+eSHKoZ91YTMacJIe6Q8DgTLpbqKlYvD44kMVYvOF49PF0lPfYT6Zj/Pni5cqeAY1FGo5JUf98+U8z99mdCkRBMkLdCTQr9487VerlbrbXw22jLth8kM2oa2VWAx1XVss2CR1XItsQdFyJbEPQcSWyDUHHlcg2BB1XItsQdFyJbEPQcSWyDUHHlcg2BB1XItsQdFyJbEPQcSWyDUHH1b6yJQ5P7EdT2YJZiGyLENkWIbItQmRbhMi2CJFtESLbIkS2RbwGPwEgbVHbezwAAAAASUVORK5CYII=)trên giao diện hệ thống\)

<a id="_Toc103347656"></a>Hiển thị menu chức năng tạo mới văn bản bằng một số cách\.

<a id="_Toc103347657"></a>2a

<a id="_Toc103347658"></a>Chọn chức năng tạo mới ngay trong hệ thống\.

<a id="_Toc103347659"></a>Xuất hiện modal box để người dùng đặt tên file mới\.

<a id="_Toc103347660"></a>3a

<a id="_Toc103347661"></a>Kích nút Tạo để hoàn tất thao tác

<a id="_Toc103347662"></a>Tạo thành công file văn bản mới\.

<a id="_Toc103347663"></a>2b

<a id="_Toc103347664"></a>Tải file lên

<a id="_Toc103347665"></a>Xuất hiện cửa sổ chọn file \(chỉ các file văn bản \.doc, \.docx, \.pdf\)

<a id="_Toc103347666"></a>3b

<a id="_Toc103347667"></a>Chọn văn bản muốn đưa lên

<a id="_Toc103347668"></a>Tạo thành công văn bản mới\. Văn bản xuất hiện ở thư mục đang chọn

<a id="_Toc103347669"></a>*Xoá văn bản \(*UC 014*\)*

Luồng sự kiện chính \(Thành công \)

<a id="_Toc103347670"></a>1

<a id="_Toc103347671"></a>Ấn phím Ctrl \(đối với windows/linux\) \+ chuột phải để đánh dấu các file cần thao tác

 <a id="_Toc103347672"></a>Highligh file đã chọn

<a id="_Toc103347673"></a>2

<a id="_Toc103347674"></a>Kích chọn nút Xoá trên thanh công cụ

<a id="_Toc103347675"></a>Hiển thị popup “Bạn có chắc chắn muốn xoá?”

<a id="_Toc103347676"></a>3

<a id="_Toc103347677"></a>Kích nút lệnh “ Đồng ý “

<a id="_Toc103347678"></a>Chuyển các file văn bản được đánh dấu xoá vào thùng rác\.

<a id="_Toc103347679"></a>*Sửa tên văn bản \(*UC 015*\)*

Luồng sự kiện chính \(Thành công \)

<a id="_Toc103347680"></a>1

<a id="_Toc103347681"></a>Kích chọn chức năng Đổi tên \(từ menu sổ xuống khi kích chuột phải vào tên file hoặc từ menu gắn với tên file\)

<a id="_Toc103347682"></a>Xuất hiện hộp thoại với Tên file văn bản được đánh dấu để sẵn sàng sửa

<a id="_Toc103347683"></a>2

<a id="_Toc103347684"></a>Thay đổi tên file theo ý muốn\.

<a id="_Toc103347685"></a>Hiển thị tên theo nội dung người dùng thay đổi

<a id="_Toc103347686"></a>3

<a id="_Toc103347687"></a>Nhấn phím Enter để hoàn tất quá trình thay đổi hoặc kích vào “Đồng ý”\.

<a id="_Toc103347688"></a>Thông báo thay đổi thành công

<a id="_Toc103347689"></a>*Xoá vĩnh viễn văn bản \(*UC 016\)

Luồng sự kiện chính \(Thành công \)

<a id="_Toc103347690"></a>1

<a id="_Toc103347691"></a>Kích chọn chức năng thùng rác

<a id="_Toc103347692"></a>Hiển thị giao diện các thư mục/file đang ở trong thùng rác

<a id="_Toc103347693"></a>2

<a id="_Toc103347694"></a>Chọn file muốn xóa\. 

<a id="_Toc103347695"></a>Kích nút Xóa trên giao diện

<a id="_Toc103347696"></a>Xoá vĩnh viễn các file tồn tại trên hệ thống trong mục thùng rác\.

<a id="_Toc103347697"></a>*Kéo di chuyển văn bản \(UC 017\)*

Luồng sự kiện chính \(Thành công \)

<a id="_Toc103347698"></a>1

<a id="_Toc103347699"></a>Kéo văn bản muốn di chuyển chuyển đến vị trí mới \(thư mục mới\)\.

<a id="_Toc103347700"></a>File văn bản được kéo xuất hiện tại vị trí đã kéo vào 

<a id="_Toc103347701"></a>Luống sự kiện thay thế

<a id="_Toc103347702"></a>1a

<a id="_Toc103347703"></a>Quá trình kéo thả chuột không đúng vị trí

<a id="_Toc103347704"></a>Văn bản chưa được đặt vào vị trí mới

<a id="_Toc103347705"></a>*Tải văn bản xuống \(UC 018\)*

Luồng sự kiện chính \(Thành công \)

<a id="_Toc103347706"></a>1

<a id="_Toc103347707"></a>Đưa yêu cầu tải văn bản

<a id="_Toc103347708"></a>Xuất hiện cửa sổ để chọn nơi ghi văn bản trên máy tính người dùng

<a id="_Toc103347709"></a>2

<a id="_Toc103347710"></a>Chọn thư mục để ghi vào

<a id="_Toc103347711"></a>Ghi file vào nơi người dùng đã chọn

<a id="_Toc103347712"></a>*Chia sẻ văn bản \(UC 019\)*

Luồng sự kiện chính \(Thành công \)

<a id="_Toc103347713"></a>1

<a id="_Toc103347714"></a>Đưa yêu cầu chia sẻ văn bản \(Kích mục Chia sẻ trong menu sổ xuống khi kích vào văn bản\)

<a id="_Toc103347715"></a>Hiển thị cửa sổ cho phép chọn người được chia sẻ\. 

<a id="_Toc103347716"></a>2

<a id="_Toc103347717"></a>Tìm tên người muốn chia sẻ

<a id="_Toc103347718"></a>Hiển thị thành viên hệ thống theo tên đã nhập\.

<a id="_Toc103347719"></a>3

<a id="_Toc103347720"></a>Chọn thành viên muốn chia sẻ

<a id="_Toc103347721"></a>Tên thành viên được chọn xuất hiện trong hộp chia sẻ

<a id="_Toc103347722"></a>4

<a id="_Toc103347723"></a>Kích nút Chia sẻ để xác nhận thông tin chia sẻ\.

<a id="_Toc103347724"></a>Ghi lại thông tin chia sẻ của file\.

<a id="_Toc103347725"></a>*Bỏ chia sẻ văn bản \(UC 020\)*

Luồng sự kiện chính \(Thành công \)

<a id="_Toc103347726"></a>1

<a id="_Toc103347727"></a>Kích mục chia sẻ trên menu sổ xuống khi kích chuột phải vào 

<a id="_Toc103347728"></a>Hiển thị danh sách người dùng đã được chia sẻ của file văn bản

<a id="_Toc103347729"></a>2

<a id="_Toc103347730"></a>Kích chọn Bỏ chia sẻ để không chia sẻ cho người dùng đã chọn\.

<a id="_Toc103347731"></a>Danh sách chia sẻ được cập nhật trong CSDL\. Bỏ chia sẻ thành công\.

<a id="_Toc103347732"></a>Hậu điều kiện

<a id="_Toc103347733"></a>Dữ liệu được cập nhật trên hệ thống

<a id="_Toc103347734"></a>__c\. Quản lý chủ đề __

 <a id="_Toc103347735"></a>Mã Use case

<a id="_Toc103347736"></a>__UC 021 – UC 027__ 

<a id="_Toc103347737"></a>Tên Usecase

<a id="_Toc103347738"></a>Quản lý chủ đề/sự kiện

 <a id="_Toc103347739"></a>Tác nhân

<a id="_Toc103347740"></a>Chuyên viên, lãnh đạo

 <a id="_Toc103347741"></a>Mô tả

<a id="_Toc103347742"></a>Quản lý tất cả các chủ đề do người dùng tạo ra cũng như được chia sẻ để thuận tiện cho việc tóm tắt

<a id="_Toc103347743"></a>Sự kiện kích hoạt

 <a id="_Toc103347744"></a>Kích vào chức năng quản lí chủ đề trên giao diện hệ thống

 <a id="_Toc103347745"></a>Tiền điều kiện

<a id="_Toc103347746"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103347747"></a>*Xem danh sách chủ đề \(*UC 021\)

<a id="_Toc103347748"></a>Luồng sự kiện chính

<a id="_Toc103347749"></a>STT

<a id="_Toc103347750"></a>Tác nhân 

<a id="_Toc103347751"></a>Hệ thống

<a id="_Toc103347752"></a>1

<a id="_Toc103347753"></a>Đưa yêu cầu xem danh sách chủ đề trên giao diện \(kích chọn menu Quản lý chủ đề\)

<a id="_Toc103347754"></a>Hiển thị danh sách chủ đề do tác nhân quản lý, mỗi chủ đề trên một dòng\. 

<a id="_Toc103347755"></a>Luồng sự kiện phụ

<a id="_Toc103347756"></a>1a

<a id="_Toc103347757"></a>Thông báo khi chưa có chủ đề nào\.

<a id="_Toc103347758"></a>*Thêm chủ đề \(*UC 022\)

<a id="_Toc103347759"></a>Luồng sự kiện chính

<a id="_Toc103347760"></a>STT

<a id="_Toc103347761"></a>Tác nhân 

<a id="_Toc103347762"></a>Hệ thống

<a id="_Toc103347763"></a>1

<a id="_Toc103347764"></a>Kích chọn chức năng thêm mới trên giao diện\.

<a id="_Toc103347765"></a>Hiển thị giao diện để nhập các trường dữ liệu thêm vào\.

<a id="_Toc103347766"></a>2

<a id="_Toc103347767"></a>Nhập các trường dữ liệu vào các ô textbox tương ứng \(\*\)

<a id="_Toc103347768"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào

<a id="_Toc103347769"></a>2a

<a id="_Toc103347770"></a>Kích nút Tải file để chọn các file lấy từ khóa

<a id="_Toc103347771"></a>Hệ thống tự động xác định từ khóa của file đưa vào hộp danh sách từ khóa

<a id="_Toc103347772"></a>3a

<a id="_Toc103347773"></a>Kéo từ khóa từ hộp danh sách vào các ô cần dùng \(AND, OR\) theo quy tắc các từ khóa trên cùng một dòng là quy tắc AND, OR với từ khóa trên dòng khác và ô NOT\.

<a id="_Toc103347774"></a>Các từ khóa được để đúng ô tác nhân đã kéo\.

<a id="_Toc103347775"></a>4

<a id="_Toc103347776"></a>Chọn nút “Lưu" để lưu chủ đề đã tạo

<a id="_Toc103347777"></a>Hệ thống lưu chủ đề vào CSDL và thông báo lưu chủ đề thành công\.

<a id="_Toc103347778"></a>Luồng sự kiện thay thế

<a id="_Toc103347779"></a>STT

<a id="_Toc103347780"></a>Tác nhân

<a id="_Toc103347781"></a>Hệ thống

<a id="_Toc103347782"></a>2a

<a id="_Toc103347783"></a>Không nhập tên chủ đề 

<a id="_Toc103347784"></a>Thông báo không được phép để trống

<a id="_Toc103347785"></a>3b

<a id="_Toc103347786"></a>Cả 3 ô OR, AND, NOT đều để trống

<a id="_Toc103347787"></a>Thông báo không được phép để trống cả ba \(ít nhất phải có 1 hộp có giá trị\)

<a id="_Toc103347788"></a>*Sửa thông tin chủ đề \(*UC 023\)

<a id="_Toc103347789"></a>STT

<a id="_Toc103347790"></a>Tác nhân

<a id="_Toc103347791"></a>Hệ thống

<a id="_Toc103347792"></a>Luồng sự kiện chính 

<a id="_Toc103347793"></a>2

<a id="_Toc103347794"></a>Đưa yêu cầu sửa chủ đề \(Kích mục Sửa trong menu sổ xuống ứng với dòng thông tin của chủ đề muốn sửa\)

<a id="_Toc103347795"></a>Hiển thị giao diện chứa thông tin chi tiết về chủ đề đã chọn\. 

<a id="_Toc103347796"></a>3

<a id="_Toc103347797"></a>Chỉnh sửa các trường thông tin \(\*\)

<a id="_Toc103347798"></a>Hiển thị giao diện theo thông tin sửa đổi

<a id="_Toc103347799"></a>4

<a id="_Toc103347800"></a>Kích nút Lưu để ghi lại thông tin đã sửa\.

<a id="_Toc103347801"></a>Ghi lại thông tin thay đổi của chủ đề vào CSDL và thông báo thay đổi thành công

<a id="_Toc103347802"></a>Luồng sự kiện thay thế

<a id="_Toc103347803"></a>2a

<a id="_Toc103347804"></a>Không nhập tên chủ đề 

<a id="_Toc103347805"></a>Thông báo không được phép để trống

<a id="_Toc103347806"></a>2b

<a id="_Toc103347807"></a>Cả 3 ô OR, AND, NOT đều để trống

<a id="_Toc103347808"></a>Thông báo không được phép để trống cả ba \(ít nhất phải có 1 hộp có giá trị\)

<a id="_Toc103347809"></a>*Xóa chủ đề \(*UC 024\)

<a id="_Toc103347810"></a>STT

<a id="_Toc103347811"></a>Tác nhân

<a id="_Toc103347812"></a>Hệ thống

<a id="_Toc103347813"></a>Luồng sự kiện chính

<a id="_Toc103347814"></a>2

<a id="_Toc103347815"></a>Đưa yêu cầu xóa chủ để \(Kích mục ­­­­Xóa trong menu sổ xuống ứng với dòng thông tin của chủ đề muốn xóa\)

<a id="_Toc103347816"></a>Hiển thị thông báo xác nhận việc xóa\. 

<a id="_Toc103347817"></a>3

<a id="_Toc103347818"></a>Xác nhận đồng ý xóa

<a id="_Toc103347819"></a>Xóa chủ đề trong CSDL và thông báo xóa thành công\.

<a id="_Toc103347820"></a>Luồng sự kiện thay thế

<a id="_Toc103347821"></a>3a

<a id="_Toc103347822"></a>Không xác nhận đồng ý

<a id="_Toc103347823"></a>Không xóa chủ đề\. Hiển thị chủ đề như trước\.

<a id="_Toc103347824"></a>*Chia sẻ chủ đề \(*UC 025\)

<a id="_Toc103347825"></a>STT

<a id="_Toc103347826"></a>Tác nhân

<a id="_Toc103347827"></a>Hệ thống

<a id="_Toc103347828"></a>Luồng sự kiện chính

<a id="_Toc103347829"></a>2

<a id="_Toc103347830"></a>Đưa yêu cầu chia sẻ chủ đề \(Kích mục Chia sẻ trong menu sổ xuống ứng với dòng thông tin của chủ đề muốn chia sẻ\)

<a id="_Toc103347831"></a>Hiển thị cửa sổ cho phép chọn người được chia sẻ\. 

<a id="_Toc103347832"></a>3

<a id="_Toc103347833"></a>Tìm tên người muốn chia sẻ

<a id="_Toc103347834"></a>Hiển thị thành viên hệ thống có thể được chia sẻ \(\*\) theo tên đã nhập\.

<a id="_Toc103347835"></a>4

<a id="_Toc103347836"></a>Chọn thành viên muốn chia sẻ

<a id="_Toc103347837"></a>Tên thành viên được chọn xuất hiện trong hộp chia sẻ

<a id="_Toc103347838"></a>5

<a id="_Toc103347839"></a>Kích nút Chia sẻ để xác nhận thông tin chia sẻ\.

<a id="_Toc103347840"></a>Ghi lại thông tin chia sẻ chủ đề\.

<a id="_Toc103347841"></a>Luồng sự kiện thay thế

<a id="_Toc103347842"></a>4a

<a id="_Toc103347843"></a>Không chọn thành viên

<a id="_Toc103347844"></a>Không thực hiện được chia sẻ

<a id="_Toc103347845"></a>*Bỏ chia sẻ chủ đề \(*UC 026\)

<a id="_Toc103347846"></a>STT

<a id="_Toc103347847"></a>Tác nhân

<a id="_Toc103347848"></a>Hệ thống

<a id="_Toc103347849"></a>Luồng sự kiện chính

<a id="_Toc103347850"></a>2

<a id="_Toc103347851"></a>Kích mục chia sẻ trên dòng thông tin của chủ đề 

<a id="_Toc103347852"></a>Hiển thị danh sách người dùng đã được chia sẻ chủ đề

<a id="_Toc103347853"></a>3

<a id="_Toc103347854"></a>Kích chọn Bỏ chia sẻ để không chia sẻ cho người dùng đã chọn\.

<a id="_Toc103347855"></a>Danh sách chia sẻ được cập nhật trong CSDL\. Bỏ chia sẻ thành công\.

Luồng sự kiện thay thế

<a id="_Toc103347857"></a>3a

<a id="_Toc103347858"></a>Không kích bỏ chọn

<a id="_Toc103347859"></a>Chủ đề vẫn được chia sẻ cho thành viên đó\.

<a id="_Toc103347860"></a>*Tìm kiếm chủ đề \(*UC 027\)

<a id="_Toc103347861"></a>STT

<a id="_Toc103347862"></a>Tác nhân

<a id="_Toc103347863"></a>Hệ thống

Luồng sự kiện chính \(Thành công \)

<a id="_Toc103347864"></a>2

<a id="_Toc103347865"></a>Đưa yêu cầu tìm kiếm về: tên chủ đề, từ khóa, lĩnh vực, khoảng thời gian tạo chủ đề\.

<a id="_Toc103347866"></a>Trả lại kết quả tìm kiếm tổng hợp các điều kiện trên\.

Luồng sự kiện thay thế

<a id="_Toc103347867"></a>2a

<a id="_Toc103347868"></a>Trường hợp không có chủ đề nào thỏa mãn điều kiện tìm kiếm thông báo không tìm thấy chủ đề\.

Hậu điều kiện

Dữ liệu được cập nhật trên hệ thống

\*Dữ liệu đầu vào gồm các trường dữ liệu sau:

<a id="_Toc103347869"></a>STT

<a id="_Toc103347870"></a>Trường dữ liệu

<a id="_Toc103347871"></a>Mô tả

<a id="_Toc103347872"></a>Bắt buộc

<a id="_Toc103347873"></a>Điều kiện hợp lệ

<a id="_Toc103347874"></a>Ví dụ

<a id="_Toc103347875"></a>1

<a id="_Toc103347876"></a>Tên chủ đề

<a id="_Toc103347877"></a>Input text field

<a id="_Toc103347878"></a>Có

<a id="_Toc103347879"></a>Các kí tự chữ hoa, thường có dấu cách\.

<a id="_Toc103347880"></a>Seagames

<a id="_Toc103347881"></a>2

<a id="_Toc103347882"></a>Tên lĩnh vực

<a id="_Toc103347883"></a>Combobox lấy tên, id lĩnh vực bảng dữ liệu phòng ban

<a id="_Toc103347884"></a>Có

<a id="_Toc103347885"></a>Các kí tự chữ hoa, thường có dấu cách

<a id="_Toc103347886"></a>Thể thao

<a id="_Toc103347887"></a>3

<a id="_Toc103347888"></a>Mô tả chủ đề

<a id="_Toc103347889"></a>Input textarea

<a id="_Toc103347890"></a>Không

<a id="_Toc103347891"></a>Các kí tự chữ hoa, thường có dấu cách

<a id="_Toc103347892"></a>4

<a id="_Toc103347893"></a>Danh sách từ khóa AND, OR

<a id="_Toc103347894"></a>Multi\-select

<a id="_Toc103347895"></a>Không

5

<a id="_Toc103347901"></a>Danh sách từ khóa NOT

<a id="_Toc103347902"></a>Multi\-select

<a id="_Toc103347903"></a>Không

<a id="_Toc103347904"></a>__\(\*\): Quy tắc chia sẻ__

__\- __Nếu là__ nhân viên bình thường __chỉ danh sách nhân viên cùng phòng, lãnh đạo phòng, lãnh đạo Cục trực tiếp quản lý\.

\- Nếu là __lãnh đạo phòng __ngoài chia sẻ cho các nhân viên phòng mình thì còn có thể chia sẻ được cho các lãnh đạo phòng khác\.

__d\. Quản lý sự kiện__

 <a id="_Toc103347905"></a>Mã Use case

<a id="_Toc103347906"></a>__UC 028 – UC 034__

 

<a id="_Toc103347907"></a>Tên Usecase

<a id="_Toc103347908"></a>Quản lý sự kiện

 <a id="_Toc103347909"></a>Tác nhân

<a id="_Toc103347910"></a>Chuyên viên, lãnh đạo

 <a id="_Toc103347911"></a>Mô tả

<a id="_Toc103347912"></a>Quản lý tất cả các sự kiện do người dùng tạo ra cũng như được chia sẻ để thuận tiện cho việc tóm tắt

<a id="_Toc103347913"></a>Sự kiện kích hoạt

 <a id="_Toc103347914"></a>Kích vào chức năng quản lí sự kiện trên giao diện hệ thống

 <a id="_Toc103347915"></a>Tiền điều kiện

<a id="_Toc103347916"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103347917"></a>*Xem danh sách sự kiện \(*UC 028\)

<a id="_Toc103347918"></a>Luồng sự kiện chính

<a id="_Toc103347919"></a>STT

<a id="_Toc103347920"></a>Tác nhân 

<a id="_Toc103347921"></a>Hệ thống

<a id="_Toc103347922"></a>1

<a id="_Toc103347923"></a>Đưa yêu cầu xem danh sách chủ đề trên giao diện \(kích chọn menu Quản lý sự kiện\)

<a id="_Toc103347924"></a>Hiển thị danh sách sự kiện do tác nhân quản lý, mỗi sự kiện trên một dòng\. 

<a id="_Toc103347925"></a>Luồng sự kiện phụ

<a id="_Toc103347926"></a>1a

<a id="_Toc103347927"></a>Thông báo khi chưa có sự kiện nào\.

<a id="_Toc103347928"></a>*Thêm sự kiện \(*UC 029\)

<a id="_Toc103347929"></a>Luồng sự kiện chính

<a id="_Toc103347930"></a>STT

<a id="_Toc103347931"></a>Tác nhân 

<a id="_Toc103347932"></a>Hệ thống

<a id="_Toc103347933"></a>1

<a id="_Toc103347934"></a>Kích chọn chức năng thêm mới trên giao diện\.

<a id="_Toc103347935"></a>Hiển thị giao diện để nhập các trường dữ liệu thêm vào\.

<a id="_Toc103347936"></a>2

<a id="_Toc103347937"></a>Nhập các trường dữ liệu vào các ô textbox tương ứng \(\*\)

<a id="_Toc103347938"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào

<a id="_Toc103347939"></a>2a

<a id="_Toc103347940"></a>Kích nút Tải file để chọn các file lấy từ khóa

<a id="_Toc103347941"></a>Hệ thống tự động xác định từ khóa của file đưa vào hộp danh sách từ khóa

<a id="_Toc103347942"></a>2a’

<a id="_Toc103347943"></a>Chọn chủ đề để lấy từ khóa của chủ đề

<a id="_Toc103347944"></a>Các từ khóa chủ đề được chọn xuất hiện trong hộp Từ khóa của chủ đề\.

<a id="_Toc103347945"></a>3a

<a id="_Toc103347946"></a>Kéo từ khóa từ hộp danh sách vào các ô cần dùng \(AND, NOT\)

<a id="_Toc103347947"></a>Các từ khóa được để đúng ô tác nhân đã kéo\.

<a id="_Toc103347948"></a>4

<a id="_Toc103347949"></a>Chọn nút “Lưu" để lưu sự kiện đã tạo

<a id="_Toc103347950"></a>Hệ thống lưu sự kiện vào CSDL và thông báo lưu sự kiện thành công\.

<a id="_Toc103347951"></a>Luồng sự kiện thay thế

<a id="_Toc103347952"></a>STT

<a id="_Toc103347953"></a>Tác nhân

<a id="_Toc103347954"></a>Hệ thống

<a id="_Toc103347955"></a>2a

<a id="_Toc103347956"></a>Không nhập tên sự kiện 

<a id="_Toc103347957"></a>Thông báo không được phép để trống

<a id="_Toc103347958"></a>3b

<a id="_Toc103347959"></a>Cả 3 ô OR, AND, NOT đều để trống

<a id="_Toc103347960"></a>Thông báo không được phép để trống cả ba \(ít nhất phải có 1 hộp có giá trị\)

<a id="_Toc103347961"></a>*Sửa thông tin sự kiện \(*UC 030*\)*

<a id="_Toc103347962"></a>STT

<a id="_Toc103347963"></a>Tác nhân

<a id="_Toc103347964"></a>Hệ thống

<a id="_Toc103347965"></a>Luồng sự kiện chính 

<a id="_Toc103347966"></a>2

<a id="_Toc103347967"></a>Đưa yêu cầu sửa sự kiện \(Kích mục Sửa trong menu sổ xuống ứng với dòng thông tin của chủ đề muốn sửa\)

<a id="_Toc103347968"></a>Hiển thị giao diện chứa thông tin chi tiết về sự kiện đã chọn\. 

<a id="_Toc103347969"></a>3

<a id="_Toc103347970"></a>Chỉnh sửa các trường thông tin \(\*\)

<a id="_Toc103347971"></a>Hiển thị giao diện theo thông tin sửa đổi

<a id="_Toc103347972"></a>4

<a id="_Toc103347973"></a>Kích nút Lưu để ghi lại thông tin đã sửa\.

<a id="_Toc103347974"></a>Ghi lại thông tin thay đổi của sự kiện vào CSDL và thông báo thay đổi thành công

<a id="_Toc103347975"></a>Luồng sự kiện thay thế

<a id="_Toc103347976"></a>2a

<a id="_Toc103347977"></a>Không nhập tên sự kiện 

<a id="_Toc103347978"></a>Thông báo không được phép để trống

<a id="_Toc103347979"></a>3b

<a id="_Toc103347980"></a>Cả 3 ô OR, AND, NOT đều để trống

<a id="_Toc103347981"></a>Thông báo không được phép để trống cả ba \(ít nhất phải có 1 hộp có giá trị\)

<a id="_Toc103347982"></a>*Xóa sự kiện \(UC 031\)*

<a id="_Toc103347983"></a>STT

<a id="_Toc103347984"></a>Tác nhân

<a id="_Toc103347985"></a>Hệ thống

<a id="_Toc103347986"></a>Luồng sự kiện chính

<a id="_Toc103347987"></a>2

<a id="_Toc103347988"></a>Đưa yêu cầu xóa sự kiện \(Kích mục Xóa trong menu sổ xuống ứng với dòng thông tin của sự kiện muốn xóa\)

<a id="_Toc103347989"></a>Hiển thị thông báo xác nhận việc xóa\. 

<a id="_Toc103347990"></a>3

<a id="_Toc103347991"></a>Xác nhận đồng ý xóa

<a id="_Toc103347992"></a>Xóa sự kiện trong CSDL và thông báo xóa thành công\.

<a id="_Toc103347993"></a>Luồng sự kiện thay thế

<a id="_Toc103347994"></a>3a

<a id="_Toc103347995"></a>Không xác nhận xóa

<a id="_Toc103347996"></a>Không xóa sự kiện trong CSDL

<a id="_Toc103347997"></a>*Chia sẻ sự kiện \(UC 032\)*

<a id="_Toc103347998"></a>STT

<a id="_Toc103347999"></a>Tác nhân

<a id="_Toc103348000"></a>Hệ thống

<a id="_Toc103348001"></a>Luồng sự kiện chính

<a id="_Toc103348002"></a>2

<a id="_Toc103348003"></a>Đưa yêu cầu chia sẻ sự kiện \(Kích mục Chia sẻ trong menu sổ xuống ứng với dòng thông tin của sự kiện muốn chia sẻ\)

<a id="_Toc103348004"></a>Hiển thị cửa sổ cho phép chọn người được chia sẻ\. 

<a id="_Toc103348005"></a>3

<a id="_Toc103348006"></a>Tìm tên người muốn chia sẻ

<a id="_Toc103348007"></a>Hiển thị thành viên hệ thống theo tên đã nhập\.

<a id="_Toc103348008"></a>4

<a id="_Toc103348009"></a>Chọn thành viên muốn chia sẻ

<a id="_Toc103348010"></a>Tên thành viên được chọn xuất hiện trong hộp chia sẻ

<a id="_Toc103348011"></a>5

<a id="_Toc103348012"></a>Kích nút Chia sẻ để xác nhận thông tin chia sẻ\.

<a id="_Toc103348013"></a>Ghi lại thông tin chia sẻ sự kiện\.

<a id="_Toc103348014"></a>Luồng sự kiện thay thế

<a id="_Toc103348015"></a>4a

<a id="_Toc103348016"></a>Không chọn thành viên nào

<a id="_Toc103348017"></a>Không thực hiện chia sẻ

<a id="_Toc103348018"></a>*Bỏ chia sẻ sự kiện \(UC033\)*

<a id="_Toc103348019"></a>STT

<a id="_Toc103348020"></a>Tác nhân

<a id="_Toc103348021"></a>Hệ thống

<a id="_Toc103348022"></a>Luồng sự kiện chính

<a id="_Toc103348023"></a>2

<a id="_Toc103348024"></a>Kích mục chia sẻ trên dòng thông tin của sự kiện

<a id="_Toc103348025"></a>Hiển thị danh sách người dùng đã được chia sẻ sự kiện

<a id="_Toc103348026"></a>3

<a id="_Toc103348027"></a>Kích chọn Bỏ chia sẻ để không chia sẻ cho người dùng đã chọn\.

<a id="_Toc103348028"></a>Danh sách chia sẻ được cập nhật trong CSDL\. Bỏ chia sẻ thành công\.

<a id="_Toc103348029"></a>Luồng sự kiện thay thế

<a id="_Toc103348030"></a>3a

<a id="_Toc103348031"></a>Không kích chọn Bỏ chia sẻ

<a id="_Toc103348032"></a>Bỏ chia sẻ không thành công\. Người dùng vẫn nhận được chia sẻ sự kiện\.

<a id="_Toc103348033"></a>*Tìm kiếm sự kiện  \(UC034\)*

<a id="_Toc103348034"></a>STT

<a id="_Toc103348035"></a>Tác nhân

<a id="_Toc103348036"></a>Hệ thống

Luồng sự kiện chính

<a id="_Toc103348037"></a>2

<a id="_Toc103348038"></a>Đưa yêu cầu tìm kiếm về: tên sự kiện, từ khóa, lĩnh vực, khoảng thời gian của sự kiện\.

<a id="_Toc103348039"></a>Trả lại kết quả tìm kiếm tổng hợp các điều kiện trên\.

Luồng sự kiện thay thế

<a id="_Toc103348040"></a>2a

<a id="_Toc103348041"></a>Không tìm được kết quả thỏa mãn\.

Hậu điều kiện

Dữ liệu được cập nhật trên hệ thống

\*Dữ liệu đầu vào gồm các trường dữ liệu sau:

<a id="_Toc103348042"></a>STT

<a id="_Toc103348043"></a>Trường dữ liệu

<a id="_Toc103348044"></a>Mô tả

<a id="_Toc103348045"></a>Bắt buộc

<a id="_Toc103348046"></a>Điều kiện hợp lệ

<a id="_Toc103348047"></a>Ví dụ

<a id="_Toc103348048"></a>Tên sự kiện

<a id="_Toc103348049"></a>Input text field

<a id="_Toc103348050"></a>Có

<a id="_Toc103348051"></a>Các kí tự chữ hoa, thường có dấu cách\.

<a id="_Toc103348052"></a>Sự kiện 11\-9

<a id="_Toc103348053"></a>Mô tả sự kiện

<a id="_Toc103348054"></a>Textarea

<a id="_Toc103348055"></a>Không

<a id="_Toc103348056"></a>Các kí tự chữ hoa, chữ số, chữ thường có dấu cách

<a id="_Toc103348057"></a>Tên quốc gia

<a id="_Toc103348058"></a>Combobox lấy tên, id quốc gia bảng dữ liệu quốc gia

<a id="_Toc103348059"></a>Không

<a id="_Toc103348060"></a>Các kí tự chữ hoa, thường có dấu cách

<a id="_Toc103348061"></a>Mỹ

<a id="_Toc103348062"></a>Khu vực

<a id="_Toc103348063"></a>Combobox lấy tên, id khu vực bảng dữ liệu khu vực

<a id="_Toc103348064"></a>Châu Mỹ

<a id="_Toc103348065"></a>Lĩnh vực

<a id="_Toc103348066"></a>Combobox lấy tên, id lĩnh vực bảng dữ liệu lĩnh vực

<a id="_Toc103348067"></a>Thời gian bắt đầu thu thập

<a id="_Toc103348068"></a>DatePicker

<a id="_Toc103348069"></a>Không

<a id="_Toc103348070"></a>Ngày tháng hợp lệ

<a id="_Toc103348071"></a>Thời gian kết thúc thu thập

<a id="_Toc103348072"></a>DatePicker

<a id="_Toc103348073"></a>Không

<a id="_Toc103348074"></a>Ngày tháng hợp lệ

<a id="_Toc103348075"></a>Danh sách từ khóa OR

<a id="_Toc103348076"></a>Multi\-select

<a id="_Toc103348077"></a>Không

<a id="_Toc103348078"></a>Danh sách từ khóa AND

<a id="_Toc103348079"></a>Multi\-select

<a id="_Toc103348080"></a>Không

<a id="_Toc103348081"></a>Danh sách từ khóa NOT

<a id="_Toc103348082"></a>Multi\-select

<a id="_Toc103348083"></a>Không

<a id="_heading=h.6gkvm06vx5yo"></a><a id="_Toc103348084"></a>__e\. Đặc tả chức năng Tóm tắt văn bản __

Đặc tả chức năng Tóm tắt đơn/đa văn bản 

- Đặc tả chức năng Tóm tắt đơn văn bản

  <a id="_Toc103348085"></a>Mã Use case

__ __<a id="_Toc103348086"></a>__UC 035 – UC 037__

<a id="_Toc103348087"></a>Tên Usecase

<a id="_Toc103348088"></a>Quản lý các tóm tắt

 <a id="_Toc103348089"></a>Tác nhân

<a id="_Toc103348090"></a>Chuyên viên, lãnh đạo

 <a id="_Toc103348091"></a>Mô tả

<a id="_Toc103348092"></a>Cho phép tác nhân xem danh sách tóm tắt mình đã thực hiện theo thời gian từ mới đến cũ

<a id="_Toc103348093"></a>Sự kiện kích hoạt

<a id="_Toc103348094"></a>Kích chọn chức năng Tóm tắt đơn văn bản trên giao diện hệ thống

 <a id="_Toc103348095"></a>Tiền điều kiện

<a id="_Toc103348096"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103348097"></a>*Xem các văn bản đã tóm tắt \(UC 035\)*

 

<a id="_Toc103348098"></a>Luồng sự kiện chính \(Thành công\)

<a id="_Toc103348099"></a>STT

<a id="_Toc103348100"></a>Tác nhân 

<a id="_Toc103348101"></a>Hệ thống

<a id="_Toc103348102"></a>1

<a id="_Toc103348103"></a>Hiển thị danh sách tóm tắt theo thời gian từ mới đến cũ theo ngày tóm tắt\. 

<a id="_Toc103348104"></a>Luồng sự kiện thay thế

<a id="_Toc103348105"></a>1a

<a id="_Toc103348106"></a>Thông báo không có tóm tắt nào đã được thực hiện\.

<a id="_Toc103348107"></a>*Sửa tóm tắt \(UC 036\)*

<a id="_Toc103348108"></a>Luồng sự kiện chính

<a id="_Toc103348109"></a>STT

<a id="_Toc103348110"></a>Tác nhân

<a id="_Toc103348111"></a>Hệ thống

<a id="_Toc103348112"></a>2

<a id="_Toc103348113"></a>Đưa yêu cầu sửa bản tóm tắt 

<a id="_Toc103348114"></a>Hiển thị nội dung đã thực hiện tóm tắt trên các ô dữ liệu tương ứng \(văn bản đầu vào, văn bản tóm tắt\)

<a id="_Toc103348115"></a>3

<a id="_Toc103348116"></a>Thực hiện tóm tắt theo mong muốn \(Theo UC 038 \- Tóm tắt\)

<a id="_Toc103348117"></a>Hiển thị các kết quả theo điều chỉnh của người dùng

<a id="_Toc103348118"></a>4

<a id="_Toc103348119"></a>Đưa yêu cầu ghi lại các thay đổi

<a id="_Toc103348120"></a>Xác nhận người dùng muốn ghi đè lên bản cũ hay tạo bản mới\.

<a id="_Toc103348121"></a>5

<a id="_Toc103348122"></a>Xác nhận lựa chọn

<a id="_Toc103348123"></a>Ghi thay đổi vào CSDL theo lựa chọn của người dùng\. Thông báo thay đổi thành công 

<a id="_Toc103348124"></a>Luồng sự kiện thay thế

<a id="_Toc103348125"></a>4a

<a id="_Toc103348126"></a>Không lưu lại thay đổi 

<a id="_Toc103348127"></a>Bản sửa không cập nhật, CSDL không thay đổi\.

<a id="_Toc103348128"></a>*Xóa bản tóm tắt \(UC 037\)*

<a id="_Toc103348129"></a>STT

<a id="_Toc103348130"></a>Tác nhân

<a id="_Toc103348131"></a>Hệ thống

<a id="_Toc103348132"></a>Luồng sự kiện chính

<a id="_Toc103348133"></a>2

<a id="_Toc103348134"></a>Đưa yêu cầu xóa bản tóm tắt \(khi vùng lưu trữ của người dùng gần hết\) 

<a id="_Toc103348135"></a>Xuất hiện hộp thoại xác nhận việc xóa

<a id="_Toc103348136"></a>3

<a id="_Toc103348137"></a>Xác nhận xóa

<a id="_Toc103348138"></a>Xóa bản ghi trong CSDL\. Thông báo xóa thành công

<a id="_Toc103348139"></a>Luồng sự kiện thay thế

<a id="_Toc103348140"></a>3a

<a id="_Toc103348141"></a>Xác nhận không xóa

<a id="_Toc103348142"></a>Không xóa dữ liệu, CSDL không thay đổi

<a id="_Toc103348143"></a>Hậu điều kiện

<a id="_Toc103348144"></a>Hệ thống cập nhật các thay đổi\.

 <a id="_Toc103348145"></a>Mã Use case

 <a id="_Toc103348146"></a>UC 038 

 <a id="_Toc103348147"></a>Tên Usecase

<a id="_Toc103348148"></a>Tóm tắt đơn văn bản

 <a id="_Toc103348149"></a>Tác nhân

 <a id="_Toc103348150"></a>Nhân viên, lãnh đạo

 <a id="_Toc103348151"></a>Mô tả

 <a id="_Toc103348152"></a>Thực hiện các chức năng tóm tắt đơn văn bản bao gồm trích rút, tóm lược\.

<a id="_Toc103348153"></a>Sự kiện kích hoạt

<a id="_Toc103348154"></a>Kích vào chức năng tóm tắt đơn văn bản trên giao diện hệ thống, hệ thống xuất hiện cửa sổ mặc định thực hiện tóm lược văn bản\. 

<a id="_Toc103348155"></a>Tiền điều kiện

<a id="_Toc103348156"></a>Tác nhân đã đăng nhập thành công vào hệ thống

<a id="_Toc103348157"></a>*Tóm tắt \(Tóm lược/trích rút\) văn bản *

*Trường hợp tóm lược*

*    *

* *

*    *

<a id="_Toc103348158"></a>Luồng sự kiện chính \(Thành công \)

<a id="_Toc103348159"></a>STT

<a id="_Toc103348160"></a>Tác nhân

<a id="_Toc103348161"></a>Hệ thống

<a id="_Toc103348162"></a>1

<a id="_Toc103348163"></a>Đưa dữ liệu vào thực hiện tóm tắt theo 2 cách

<a id="_Toc103348164"></a>Hiển thị giao diện tương ứng

<a id="_Toc103348165"></a>1\.1

<a id="_Toc103348166"></a>Kích nút tải file trên giao diện tóm tắt

<a id="_Toc103348167"></a>Xuất hiện hộp thoại cho phép người dùng chọn file từ máy tính hoặc từ drive \(vùng lưu trữ trên hệ thống\) của mình\.

<a id="_Toc103348168"></a>1\.2

<a id="_Toc103348169"></a>Sao chép dữ liệu văn bản từ một nơi khác, dán vào hộp chứa văn bản\.

 

<a id="_Toc103348170"></a>2

 

<a id="_Toc103348171"></a>Hiển thị nội dung cần tóm tắt trong hộp chứa văn bản gốc\.

Cho phép người dùng có thể thay đổi nội dung trong hộp văn bản

<a id="_Toc103348172"></a>3

<a id="_Toc103348173"></a>Kích vào nút Tóm tắt

<a id="_Toc103348174"></a>Thực hiện tóm tắt văn bản

Hiển thị hộp thoại hỏi có tiếp tục tóm tắt hay không nếu văn bản đang tóm tắt hoặc ở trạng thái chờ tóm tắt \(4a\)\. 

4

Hiển thị kết quả tóm tắt trên hộp chứa văn bản tóm tắt sau khi tóm tắt xong\.

4a

Kích nút Tóm tắt lại

Quay về giao diện như lúc bắt đầu tóm tắt

5a

Kích nút Tiếp tục tóm tắt

Hệ thống thực hiện tóm tắt văn bản, hiển thị trạng thái \(chờ tóm tắt nếu tài nguyên máy chủ đang thực hiện tóm tắt khác hoặc đang tóm tắt nếu máy chủ đã sẵn sàng\)\. 

Hiển thị kết quả tóm tắt trên hộp chứa văn bản tóm tắt sau khi tóm tắt xong\.

<a id="_Toc103348178"></a>*Luồng sự kiện thay thế*

<a id="_Toc103348179"></a>STT

<a id="_Toc103348180"></a>Tác nhân

<a id="_Toc103348181"></a>Hệ thống

<a id="_Toc103348182"></a>1\.1a

 <a id="_Toc103348183"></a>Không chọn file nào

 <a id="_Toc103348184"></a>Hộp chứa văn bản gốc trống\. Không thực hiện được việc tóm tắt\.

<a id="_Toc103348185"></a>1\.2a

<a id="_Toc103348186"></a>Không sao chép dữ liệu

<a id="_Toc103348187"></a>Hộp chứa văn bản gốc trống\.

*Trường hợp trích rút*

1

<a id="_Toc103348176"></a>Kích tab Trích rút nếu muốn thực hiện trích rút văn bản, các bước thực hiện tương tự như trường hợp Tóm tắt

<a id="_Toc103348188"></a>*Tóm tắt theo chủ đề*

* *

* *

* *<a id="_Toc103348189"></a>*Luồng sự kiện chính \(thành công\)*

<a id="_Toc103348190"></a>STT

<a id="_Toc103348191"></a>Tác nhân

<a id="_Toc103348192"></a>Hệ thống

5

<a id="_Toc103348194"></a>Kích chọn Chủ đề 

<a id="_Toc103348195"></a>Xuất hiện hộp thoại hiển thị danh mục các chủ đề của người dùng

6

<a id="_Toc103348197"></a>Lựa chọn chủ đề muốn tóm tắt bằng cách tích chọn trong hộp thoại

<a id="_Toc103348198"></a>Các chủ đề người dùng đã tích chọn xuất hiện trong ô Chủ đề trong cửa sổ tóm tắt

7

<a id="_Toc103348200"></a>Kích vào từng chủ đề muốn xem nội dung tóm tắt\.

<a id="_Toc103348201"></a>Hiển thị kết quả tóm tắt theo chủ đề trên hộp thoại chứa văn bản tóm tắt

<a id="_heading=h.ey74fgodk7bo"></a><a id="_Toc103348202"></a>*Luồng sự kiện thay thế*

<a id="_heading=h.u63uzt97qnw5"></a><a id="_Toc103348203"></a>STT

<a id="_heading=h.fi6fy8g8k5u"></a><a id="_Toc103348204"></a>Tác nhân

<a id="_Toc103348205"></a>Hệ thống

<a id="_Toc103348206"></a>7a

 <a id="_Toc103348207"></a>Không chọn chủ đề nào 

 <a id="_Toc103348208"></a>Hiển thị kết quả tóm tắt toàn văn bản

<a id="_Toc103348209"></a>*Tóm tắt tùy chỉnh độ dài*

* *

* *

* *<a id="_Toc103348210"></a>*Luồng sự kiện chính \(thành công\)*

* *

<a id="_Toc103348211"></a>STT

<a id="_Toc103348212"></a>Tác nhân

<a id="_Toc103348213"></a>Hệ thống

5

<a id="_Toc103348215"></a>Bỏ chọn chủ đề trên hộp chủ đề\.

 

6

<a id="_Toc103348217"></a>Kéo chọn thanh độ dài văn bản tóm tắt đến mức độ mong muốn

<a id="_Toc103348218"></a>Độ dài mong muốn hiển thị bằng màu xám trên thanh kéo\.

<a id="_Toc103348219"></a>Giá trị % thay đổi theo độ dài người dùng đã kéo

7

<a id="_Toc103348221"></a>Kích vào nút Tóm tắt

<a id="_Toc103348222"></a>Hiển thị kết quả tóm tắt theo độ dài người dùng mong muốn hộp thoại chứa văn bản tóm tắt\.

<a id="_Toc103348223"></a>*Đánh dấu thực thể*

<a id="_heading=h.6j8bcnynvkgs"></a>* *

* *<a id="_Toc103348224"></a>*Luồng sự kiện chính \(thành công\)*

<a id="_Toc103348225"></a>STT

<a id="_Toc103348226"></a>Tác nhân

<a id="_Toc103348227"></a>Hệ thống

5

<a id="_Toc103348229"></a>Kích nút Đánh dấu thực thể

<a id="_Toc103348230"></a>Các thực thể được đánh dấu bằng màu sắc khác \(vàng\) trong hộp thoại chứa văn bản kết quả tóm tắt\.

<a id="_Toc103348231"></a>*Ghi lại văn bản tóm tắt*

* *

* *<a id="_Toc103348232"></a>*Luồng sự kiện chính \(thành công\)*

* *

<a id="_Toc103348233"></a>STT

<a id="_Toc103348234"></a>Tác nhân

<a id="_Toc103348235"></a>Hệ thống

5

<a id="_Toc103348237"></a>Người dùng thay đổi nội dung tóm tắt trong hộp kết quả tóm tắt

<a id="_Toc103348238"></a>Hộp kết quả tóm tắt thay đổi theo nội dung người dùng đưa vào

6

<a id="_Toc103348240"></a>Kích vào biểu tượng Ghi văn bản tóm tắt

<a id="_Toc103348241"></a>Hệ thống ghi lại văn bản tóm tắt vào CSDL\.

<a id="_heading=h.wkdp07ak6lpl"></a><a id="_Toc103348242"></a>*Lưu lại file văn bản tóm tắt *

<a id="_Toc103348243"></a>*Luồng sự kiện chính \(thành công\)*

<a id="_Toc103348244"></a>STT

<a id="_Toc103348245"></a>Tác nhân

<a id="_Toc103348246"></a>Hệ thống

5

<a id="_Toc103348248"></a>Kích vào biểu tượng Lưu văn bản tóm tắt

<a id="_Toc103348249"></a>Mở hộp thoại File trên máy tính để người dùng chọn thư mục lưu lại\.

6

<a id="_Toc103348251"></a>Kích OK để hoàn tất việc ghi file tóm tắt văn bản\.

 <a id="_Toc103348252"></a>Hệ thống ghi file tóm tắt \(\.docx\) vào thư mục người dùng đã chọn\.

*Sao chép văn bản tóm tắt*

* *

* *

STT

Tác nhân

Hệ thống

5

Kích vào biểu tượng Sao chép

Sao chép nội dung trong hộp tóm tắt

6

Có thể dán nội dung đã sao chép vào bất kỳ chỗ nào\.

<a id="_Toc103348253"></a>*In văn bản tóm tắt*

* *

* *

* *

<a id="_Toc103348254"></a>STT

<a id="_Toc103348255"></a>Tác nhân

<a id="_Toc103348256"></a>Hệ thống

5

<a id="_Toc103348258"></a>Kích vào biểu tượng In văn bản

<a id="_Toc103348259"></a>Mở hộp thoại chọn máy in để in văn bản\.

6

<a id="_Toc103348261"></a>Kích nút In ấn để hoàn tất việc lựa chọn\.

 <a id="_Toc103348262"></a>Hệ thống thực hiện in đoạn văn bản tóm tắt trên hộp tóm tắt\.

<a id="_Toc103348263"></a>*Hậu điều kiện*

<a id="_Toc103348264"></a>Dữ liệu được cập nhật trên hệ thống

- <a id="_heading=h.8ek0q81n9bul"></a>Đặc tả chức năng Tóm tắt đa văn bản 

 <a id="_Toc103348265"></a>Mã Use case

 <a id="_Toc103348266"></a>UC 039 – UC 41

<a id="_Toc103348267"></a>Tên Usecase

<a id="_Toc103348268"></a>Quản lý các tóm tắt đa văn bản

 <a id="_Toc103348269"></a>Tác nhân

<a id="_Toc103348270"></a>Chuyên viên, lãnh đạo

 <a id="_Toc103348271"></a>Mô tả

<a id="_Toc103348272"></a>Cho phép tác nhân xem danh sách tóm tắt mình đã thực hiện theo thời gian từ mới đến cũ, thay đổi nội dung tóm tắt, xóa đi nếu vùng lưu trữ đã đầy\. 

<a id="_Toc103348273"></a>Sự kiện kích hoạt

<a id="_Toc103348274"></a>Kích chọn chức năng Tóm tắt đa văn bản trên giao diện hệ thống

 <a id="_Toc103348275"></a>Tiền điều kiện

<a id="_Toc103348276"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103348277"></a>*Xem các văn bản đã tóm tắt \(UC 039\)*

 

<a id="_Toc103348278"></a>Luồng sự kiện chính \(Thành công\)

<a id="_Toc103348279"></a>STT

<a id="_Toc103348280"></a>Tác nhân 

<a id="_Toc103348281"></a>Hệ thống

<a id="_Toc103348282"></a>1

<a id="_Toc103348283"></a>Hiển thị danh sách tóm tắt theo thời gian từ mới đến cũ theo ngày tóm tắt\. 

<a id="_Toc103348284"></a>Luồng sự kiện thay thế

<a id="_Toc103348285"></a>1a

<a id="_Toc103348286"></a>Thông báo không có tóm tắt đa văn bản nào đã được thực hiện\.

<a id="_Toc103348287"></a>*Sửa tóm tắt \(UC 040\)*

<a id="_Toc103348288"></a>Luồng sự kiện chính

<a id="_Toc103348289"></a>STT

<a id="_Toc103348290"></a>Tác nhân

<a id="_Toc103348291"></a>Hệ thống

<a id="_Toc103348292"></a>2

<a id="_Toc103348293"></a>Đưa yêu cầu sửa bản tóm tắt 

<a id="_Toc103348294"></a>Hiển thị nội dung đã thực hiện tóm tắt trên các ô dữ liệu tương ứng \(văn bản đầu vào, văn bản tóm tắt\)

<a id="_Toc103348295"></a>3

<a id="_Toc103348296"></a>Thực hiện tóm tắt theo mong muốn \(Theo UC 042 \- Tóm tắt đa văn bản\)

<a id="_Toc103348297"></a>Hiển thị các kết quả theo điều chỉnh của người dùng

<a id="_Toc103348298"></a>4

<a id="_Toc103348299"></a>Đưa yêu cầu ghi lại các thay đổi

<a id="_Toc103348300"></a>Xác nhận người dùng muốn ghi đè lên bản cũ hay tạo bản mới\.

<a id="_Toc103348301"></a>5

<a id="_Toc103348302"></a>Xác nhận lựa chọn

<a id="_Toc103348303"></a>Ghi thay đổi vào CSDL theo lựa chọn của người dùng\. Thông báo thay đổi thành công

<a id="_Toc103348304"></a>Luồng sự kiện thay thế

<a id="_Toc103348305"></a>4a

<a id="_Toc103348306"></a>Không lưu lại thay đổi 

<a id="_Toc103348307"></a>Bản sửa không cập nhật, CSDL không thay đổi\.

<a id="_Toc103348308"></a>*Xóa bản tóm tắt \(UC 041\)*

<a id="_Toc103348309"></a>STT

<a id="_Toc103348310"></a>Tác nhân

<a id="_Toc103348311"></a>Hệ thống

<a id="_Toc103348312"></a>Luồng sự kiện chính

<a id="_Toc103348313"></a>2

<a id="_Toc103348314"></a>Đưa yêu cầu xóa bản tóm tắt \(khi vùng lưu trữ của người dùng gần hết\) 

<a id="_Toc103348315"></a>Xuất hiện hộp thoại xác nhận việc xóa

<a id="_Toc103348316"></a>3

<a id="_Toc103348317"></a>Xác nhận xóa

<a id="_Toc103348318"></a>Xóa bản ghi trong CSDL\. Thông báo xóa thành công

<a id="_Toc103348319"></a>Luồng sự kiện thay thế

<a id="_Toc103348320"></a>3a

<a id="_Toc103348321"></a>Xác nhận không xóa

<a id="_Toc103348322"></a>Không xóa dữ liệu, CSDL không thay đổi

<a id="_Toc103348323"></a>Hậu điều kiện

<a id="_Toc103348324"></a>Hệ thống cập nhật các thay đổi\.

<a id="_Toc103348325"></a>Mã Use case

 <a id="_Toc103348326"></a>UC 042

 <a id="_Toc103348327"></a>Tên Usecase

<a id="_Toc103348328"></a>Tóm tắt đa văn bản

 <a id="_Toc103348329"></a>Tác nhân

 <a id="_Toc103348330"></a>Nhân viên, lãnh đạo

 <a id="_Toc103348331"></a>Mô tả

 <a id="_Toc103348332"></a>Thực hiện các chức năng tóm tắt đa văn bản bao gồm tóm tắt theo cụm hoặc theo chủ đề\.

<a id="_Toc103348333"></a>Sự kiện kích hoạt

 <a id="_Toc103348334"></a>Click vào chức năng tóm tắt đa văn bản trên giao diện hệ thống, hệ thống xuất hiện cửa sổ mặc định thực hiện tóm tắt theo cụm đa văn bản\.

 <a id="_Toc103348335"></a>Tiền điều kiện

<a id="_Toc103348336"></a>Tác nhân đã đăng nhập thành công vào hệ thống

<a id="_Toc103348337"></a>*Tóm tắt theo cụm văn bản*

*    *

* *

*    *

<a id="_Toc103348338"></a>*Luồng sự kiện chính \(Thành công \)*

<a id="_Toc103348339"></a>STT

<a id="_Toc103348340"></a>Tác nhân

<a id="_Toc103348341"></a>Hệ thống

<a id="_Toc103348342"></a>1

<a id="_Toc103348343"></a>Kích nút tải file trên giao diện tóm tắt

<a id="_Toc103348344"></a>Xuất hiện hộp thoại cho phép người dùng chọn nhiều file từ máy tính hoặc từ drive \(vùng lưu trữ trên hệ thống\) của mình\.

<a id="_Toc103348345"></a>2

 

<a id="_Toc103348346"></a>Hiển thị danh sách các file đã chọn cần tóm tắt trong danh sách file\.

<a id="_Toc103348347"></a>3a

<a id="_Toc103348348"></a>Kích vào nút Tóm tắt

<a id="_Toc103348349"></a>Xuất hiện các cụm phát hiện được từ nhiều văn bản trên hộp Chọn cụm\.

Hiển thị hộp thoại hỏi có tiếp tục tóm tắt hay không nếu văn bản đang tóm tắt hoặc ở trạng thái chờ tóm tắt \(4a\)\.

<a id="_Toc103348350"></a>4

<a id="_Toc103348351"></a>Kích chọn tên cụm trên hộp Chọn cụm để xem nội dung tóm tắt\.

<a id="_Toc103348352"></a>Hộp tóm tắt hiển thị nội dung theo cụm đã chọn

<a id="_Toc103348353"></a>Hộp danh sách file hiển thị các file có nội dung liên quan đến cụm đã chọn

5a

Kích nút Tóm tắt lại

Quay về giao diện như lúc bắt đầu tóm tắt

6a

Kích nút Tiếp tục tóm tắt

Hệ thống thực hiện tóm tắt đa văn bản, hiển thị trạng thái \(chờ tóm tắt nếu tài nguyên máy chủ đang thực hiện tóm tắt khác hoặc đang tóm tắt nếu máy chủ đã sẵn sàng\)\. 

Hiển thị kết quả tóm tắt như 4\.

<a id="_Toc103348354"></a>*Luồng sự kiện thay thế*

<a id="_Toc103348355"></a>STT

<a id="_Toc103348356"></a>Tác nhân

<a id="_Toc103348357"></a>Hệ thống 

<a id="_Toc103348358"></a>1a

<a id="_Toc103348359"></a>Không chọn file nào

<a id="_Toc103348360"></a>Hộp chứa văn bản gốc trống\. Không thực hiện tóm tắt\.

<a id="_Toc103348361"></a>4b

<a id="_Toc103348362"></a>Không chọn cụm nào

<a id="_Toc103348363"></a>Hộp chứa văn bản tóm tắt trống\. Không hiển thị nội dung tóm tắt\.

<a id="_Toc103348364"></a>*Tóm tắt theo chủ đề*

* *

* *

* *<a id="_Toc103348365"></a>*Luồng sự kiện chính \(thành công\)*

<a id="_Toc103348366"></a>STT

<a id="_Toc103348367"></a>Tác nhân

<a id="_Toc103348368"></a>Hệ thống

5

<a id="_Toc103348370"></a>Chọn tab Theo chủ đề 

<a id="_Toc103348371"></a>Xuất hiện cửa sổ tóm tắt theo chủ đề

6

<a id="_Toc103348373"></a>Kích chọn Chủ đề 

 <a id="_Toc103348374"></a>Xuất hiện hộp thoại hiển thị danh mục các chủ đề của người dùng

7

<a id="_Toc103348376"></a>Lựa chọn chủ đề muốn tóm tắt bằng cách tích chọn trong hộp thoại

<a id="_Toc103348377"></a>Các chủ đề người dùng đã tích chọn xuất hiện trong ô Chủ đề trong cửa sổ tóm tắt

8

<a id="_Toc103348379"></a>Kích vào từng chủ đề muốn xem nội dung tóm tắt\.

<a id="_Toc103348380"></a>Hiển thị kết quả tóm tắt theo chủ đề trên hộp thoại chứa văn bản tóm tắt\.

<a id="_Toc103348381"></a>*Luồng sự kiện thay thế*

<a id="_Toc103348382"></a>STT

<a id="_Toc103348383"></a>Tác nhân

<a id="_Toc103348384"></a>Hệ thống

<a id="_Toc103348385"></a>6a

 <a id="_Toc103348386"></a>Không chọn chủ đề nào 

 <a id="_Toc103348387"></a>Không hiển thị kết quả tóm tắt theo chủ đề

<a id="_Toc103348388"></a>*Tóm tắt tùy chỉnh độ dài*

* *

* *

* *<a id="_Toc103348389"></a>*Luồng sự kiện chính \(thành công\)*

* *

<a id="_Toc103348390"></a>STT

<a id="_Toc103348391"></a>Tác nhân

<a id="_Toc103348392"></a>Hệ thống

<a id="_Toc103348393"></a>5

<a id="_Toc103348394"></a>Kéo chọn thanh độ dài văn bản tóm tắt đến mức độ mong muốn

<a id="_Toc103348395"></a>Độ dài mong muốn hiển thị bằng màu xám trên thanh kéo\.

<a id="_Toc103348396"></a>Giá trị % thay đổi theo độ dài người dùng đã kéo

<a id="_Toc103348397"></a>6

<a id="_Toc103348398"></a>Kích vào nút Tóm tắt

<a id="_Toc103348399"></a>Hiển thị kết quả tóm tắt theo độ dài người dùng mong muốn hộp thoại chứa văn bản tóm tắt\.

<a id="_Toc103348400"></a>*Đánh dấu thực thể*

* *

* *<a id="_Toc103348401"></a>*Luồng sự kiện chính \(thành công\)*

<a id="_Toc103348402"></a>STT

<a id="_Toc103348403"></a>Tác nhân

<a id="_Toc103348404"></a>Hệ thống

<a id="_Toc103348405"></a>4

<a id="_Toc103348406"></a>Kích nút Đánh dấu thực thể

<a id="_Toc103348407"></a>Các thực thể được đánh dấu bằng màu sắc khác \(vàng\) trong hộp thoại chứa văn bản kết quả tóm tắt\.

<a id="_Toc103348408"></a>*Ghi lại văn bản tóm tắt*

* *

* *<a id="_Toc103348409"></a>*Luồng sự kiện chính \(thành công\)*

* *

<a id="_Toc103348410"></a>STT

<a id="_Toc103348411"></a>Tác nhân

<a id="_Toc103348412"></a>Hệ thống

<a id="_Toc103348413"></a>4

<a id="_Toc103348414"></a>Người dùng thay đổi nội dung tóm tắt trong hộp kết quả tóm tắt

<a id="_Toc103348415"></a>Hộp kết quả tóm tắt thay đổi theo nội dung người dùng đưa vào

<a id="_Toc103348416"></a>5

<a id="_Toc103348417"></a>Kích vào biểu tượng Ghi văn bản tóm tắt

<a id="_Toc103348418"></a>Hệ thống ghi lại văn bản tóm tắt vào CSDL\.

<a id="_Toc103348419"></a>*Lưu lại file văn bản tóm tắt*

<a id="_Toc103348420"></a>*Luồng sự kiện chính \(thành công\)*

<a id="_Toc103348421"></a>STT

<a id="_Toc103348422"></a>Tác nhân

<a id="_Toc103348423"></a>Hệ thống

<a id="_Toc103348424"></a>4

<a id="_Toc103348425"></a>Kích vào biểu tượng Lưu văn bản tóm tắt\.

<a id="_Toc103348426"></a>Mở hộp thoại File trên máy tính để người dùng chọn thư mục lưu lại\.

 <a id="_Toc103348427"></a>5

<a id="_Toc103348428"></a>Kích OK để hoàn tất việc ghi file tóm tắt văn bản\.

 <a id="_Toc103348429"></a>Hệ thống ghi file tóm tắt \(\.docx\) vào thư mục người dùng đã chọn\.

<a id="_Toc103348430"></a>*In văn bản tóm tắt*

* *

* *

* *

<a id="_Toc103348431"></a>STT

<a id="_Toc103348432"></a>Tác nhân

<a id="_Toc103348433"></a>Hệ thống

<a id="_Toc103348434"></a>4

<a id="_Toc103348435"></a>Kích vào biểu tượng In văn bản

<a id="_Toc103348436"></a>Mở hộp thoại chọn máy in để in văn bản\.

 <a id="_Toc103348437"></a>5

<a id="_Toc103348438"></a>Kích nút In ấn để hoàn tất việc lựa chọn\.

 <a id="_Toc103348439"></a>Hệ thống thực hiện in đoạn văn bản tóm tắt trên hộp tóm tắt\.

*Sao chép văn bản tóm tắt*

STT

Tác nhân

Hệ thống

4

Kích vào biểu tượng sao chép

Sao chép nội dung trên ô văn bản tóm tắt\.

 5

Có thể dán nội dung đã sao chép vào bất kỳ chỗ nào

<a id="_Toc103348440"></a>*Hậu điều kiện*

<a id="_Toc103348441"></a>*Dữ liệu được cập nhật trên hệ thống*

<a id="_Toc103348442"></a>__3\.3\.3 Use cases­­ dành cho quản trị hệ thống __

1. Quản lý người dùng hệ thống

 <a id="_Toc103348443"></a>Mã Use case

__ __<a id="_Toc103348444"></a>__UC 043 – UC 048__

<a id="_Toc103348445"></a>Tên Usecase

<a id="_Toc103348446"></a>Quản lý người dùng

 <a id="_Toc103348447"></a>Tác nhân

<a id="_Toc103348448"></a>Admin

 <a id="_Toc103348449"></a>Mô tả

<a id="_Toc103348450"></a>Quản lý tất cả tất cả người dùng hệ thống từ xem danh sách, thêm mới, sửa thông tin, xóa, đặt lại mật khẩu người dùng\.

<a id="_Toc103348451"></a>Sự kiện kích hoạt

<a id="_Toc103348452"></a>Kích vào chức năng quản lí người dùng trên giao diện hệ thống

 <a id="_Toc103348453"></a>Tiền điều kiện

<a id="_Toc103348454"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103348455"></a>*Xem danh sách người dùng \(*UC 043*\)*

<a id="_Toc103348456"></a>Luồng sự kiện chính

<a id="_Toc103348457"></a>STT

<a id="_Toc103348458"></a>Tác nhân 

<a id="_Toc103348459"></a>Hệ thống

<a id="_Toc103348460"></a>1

<a id="_Toc103348461"></a>Đưa yêu cầu xem danh sách người dùng trên giao diện \(kích chọn menu Quản lý người dùng\)

<a id="_Toc103348462"></a>Hiển thị danh sách người dùng hệ thống \(phân trang\) mỗi người dùng trên một dòng\. 

<a id="_Toc103348463"></a>Luồng sự kiện phụ

<a id="_Toc103348464"></a>1a

<a id="_Toc103348465"></a>Thông báo khi chưa có người dùng nào\.

<a id="_Toc103348466"></a>*Thêm người dùng \(*UC 044*\)*

<a id="_Toc103348467"></a>*Luồng sự kiện chính*

<a id="_Toc103348468"></a>STT

<a id="_Toc103348469"></a>Tác nhân 

<a id="_Toc103348470"></a>Hệ thống

<a id="_Toc103348471"></a>1

<a id="_Toc103348472"></a>Kích chọn chức năng thêm mới trên giao diện\.

<a id="_Toc103348473"></a>Hiển thị giao diện để nhập các trường dữ liệu thêm vào\.

<a id="_Toc103348474"></a>2

<a id="_Toc103348475"></a>Nhập các trường dữ liệu vào các ô textbox tương ứng \(\*\)

<a id="_Toc103348476"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào

<a id="_Toc103348477"></a>3

<a id="_Toc103348478"></a>Chọn nút “Lưu" để lưu người dùng đã tạo

<a id="_Toc103348479"></a>Hệ thống kiểm tra thông tin đã nhập, tự động sinh mật khẩu cho tài khoản người dùng, lưu thông tin vào CSDL và thông báo lưu thành công\. 

<a id="_Toc103348480"></a>*Luồng sự kiện thay thế*

<a id="_Toc103348481"></a>STT

<a id="_Toc103348482"></a>Tác nhân

<a id="_Toc103348483"></a>Hệ thống

<a id="_Toc103348484"></a>3a

<a id="_Toc103348485"></a>Không nhập họ tên người dùng

<a id="_Toc103348486"></a>Thông báo không được phép để trống

<a id="_Toc103348487"></a>3b

<a id="_Toc103348488"></a>Không nhập tài khoản

<a id="_Toc103348489"></a>Thông báo không được phép để trống

<a id="_Toc103348490"></a>3c

<a id="_Toc103348491"></a>Tài khoản trùng với người khác

<a id="_Toc103348492"></a>Thông báo tên tài khoản đã có, nhập lại tài khoản khác

<a id="_Toc103348493"></a>*Sửa thông tin người dùng \(*UC 045*\)*

<a id="_Toc103348494"></a>STT

<a id="_Toc103348495"></a>Tác nhân

<a id="_Toc103348496"></a>Hệ thống

<a id="_Toc103348497"></a>Luồng sự kiện chính 

<a id="_Toc103348498"></a>2

<a id="_Toc103348499"></a>Đưa yêu cầu sửa thông tin người dùng \(Kích mục Sửa trong menu sổ xuống ứng với dòng thông tin của người dùng muốn sửa\)

<a id="_Toc103348500"></a>Hiển thị giao diện chứa thông tin chi tiết về người dùng đã chọn\. 

<a id="_Toc103348501"></a>3

<a id="_Toc103348502"></a>Chỉnh sửa các trường thông tin \(\*\)

<a id="_Toc103348503"></a>Hiển thị giao diện theo thông tin sửa đổi

<a id="_Toc103348504"></a>4

<a id="_Toc103348505"></a>Kích nút Lưu để ghi lại thông tin đã sửa\.

<a id="_Toc103348506"></a>Ghi lại thông tin thay đổi của người dùng vào CSDL và thông báo thay đổi thành công

<a id="_Toc103348507"></a>Luồng sự kiện thay thế

<a id="_Toc103348508"></a>3a

<a id="_Toc103348509"></a>Không nhập họ tên người dùng

<a id="_Toc103348510"></a>Thông báo không được phép để trống

<a id="_Toc103348511"></a>3b

<a id="_Toc103348512"></a>Không nhập tài khoản

<a id="_Toc103348513"></a>Thông báo tài khoản không được phép để trống

<a id="_Toc103348514"></a>3c

<a id="_Toc103348515"></a>Tài khoản trùng với người khác

<a id="_Toc103348516"></a>Thông báo tên tài khoản đã có, nhập lại tài khoản khác

<a id="_Toc103348517"></a>*Khóa tài khoản người dùng \(*UC 046A*\)*

<a id="_Toc103348518"></a>STT

<a id="_Toc103348519"></a>Tác nhân

<a id="_Toc103348520"></a>Hệ thống

<a id="_Toc103348521"></a>*Luồng sự kiện chính*

<a id="_Toc103348522"></a>2

<a id="_Toc103348523"></a>Đưa yêu cầu khóa tài khoản người dùng \(Kích mục Khóa trong menu sổ xuống ứng với dòng thông tin của người dùng muốn khóa\)

Khóa tài khoản, tên tài khoản sẽ không thể đăng nhập hệ thống được\. 

*Mở khóa tài khoản người dùng \(*UC 046B*\)*

<a id="_Toc103348528"></a>*Luồng sự kiện thay thế*

2

Đưa yêu cầu mở khóa tài khoản \(Kích mục Mở khóa trong menu sổ xuống – trường hợp tài khoản đang ở trạng thái Đã khóa\)

Mở khóa tài khoản tên tài khoản có thể đăng nhập để sử dụng hệ thống\.

<a id="_Toc103348532"></a>*Đặt lại mật khẩu người dùng \(*UC 047*\)*

<a id="_Toc103348533"></a>STT

<a id="_Toc103348534"></a>Tác nhân

<a id="_Toc103348535"></a>Hệ thống

<a id="_Toc103348536"></a>*Luồng sự kiện chính*

<a id="_Toc103348537"></a>2

<a id="_Toc103348538"></a>Đưa yêu cầu đặt lại mật khẩu \(Kích mục Đặt lại mật khẩu trong menu sổ xuống ứng với dòng thông tin của người dùng\)

<a id="_Toc103348539"></a>Hiển thị cửa sổ yêu cầu xác nhận có đặt lại hay không? 

<a id="_Toc103348540"></a>3

<a id="_Toc103348541"></a>Xác nhận đồng ý đăt lại

<a id="_Toc103348542"></a>Hệ thống tự động sinh mật khẩu mới, hiển thị cho quản trị viên xem\. Cập nhật mật khẩu mới cho người dùng\.

<a id="_Toc103348543"></a>*Luồng sự kiện thay thế*

<a id="_Toc103348544"></a>3a

<a id="_Toc103348545"></a>Không đồng ý đặt lại

<a id="_Toc103348546"></a>Hệ thống giữ mật khẩu cũ của người dùng

<a id="_Toc103348547"></a>*Tìm kiếm người dùng \(*UC 048*\)*

<a id="_Toc103348548"></a>*Luồng sự kiện chính*

<a id="_Toc103348549"></a>STT

<a id="_Toc103348550"></a>Tác nhân

<a id="_Toc103348551"></a>Hệ thống

<a id="_Toc103348552"></a>2

<a id="_Toc103348553"></a>Đưa yêu cầu tìm kiếm về: tên người dùng, phòng ban\.

<a id="_Toc103348554"></a>Trả lại kết quả tìm kiếm tổng hợp các điều kiện trên\.

<a id="_Toc103348555"></a>*Luồng sự kiện thay thế*

<a id="_Toc103348556"></a>2a

<a id="_Toc103348557"></a>Trường hợp không tìm thấy, hiển thị thông báo không có bản ghi thỏa mãn\.

<a id="_Toc103348558"></a>*Hậu điều kiện*

<a id="_Toc103348559"></a>CSDL thay đổi cập nhật dữ liệu khi thao tác thành công\. 

Các trường thông tin

<a id="_Toc103348560"></a>STT

<a id="_Toc103348561"></a>Trường dữ liệu

<a id="_Toc103348562"></a>Mô tả

<a id="_Toc103348563"></a>Bắt buộc

<a id="_Toc103348564"></a>Điều kiện hợp lệ

<a id="_Toc103348565"></a>Ví dụ

<a id="_Toc103348566"></a>1

Tên hiển thị \(Họ tên\)

<a id="_Toc103348568"></a>Input textfield

<a id="_Toc103348569"></a>Có

<a id="_Toc103348570"></a>Các kí tự chữ hoa, thường có dấu cách\.

<a id="_Toc103348571"></a>Nguyễn Thu Anh

2

Tên đăng nhập

Input textfield

3

<a id="_Toc103348573"></a>Email

<a id="_Toc103348574"></a>Input emailfield

<a id="_Toc103348575"></a>Không

<a id="_Toc103348576"></a>Đúng định dạng email

<a id="_Toc103348577"></a>nhthanh@gmail\.com

4

<a id="_Toc103348579"></a>Ngày sinh

<a id="_Toc103348580"></a>DatePicker

<a id="_Toc103348581"></a>Không

<a id="_Toc103348582"></a>Ngày tháng hợp lệ

<a id="_Toc103348583"></a>15/04/1998

5

<a id="_Toc103348585"></a>Số điện thoại

<a id="_Toc103348586"></a>Input textfield

<a id="_Toc103348587"></a>Không

<a id="_Toc103348588"></a>Kí tự số

<a id="_Toc103348589"></a>0987324456

<a id="_Toc103348596"></a>6

Vị trí công tác

<a id="_Toc103348598"></a>Combobox lấy tên, id phòng ban từ bảng dữ liệu phòng ban

<a id="_Toc103348599"></a>Có

<a id="_Toc103348600"></a>Lựa chọn giá trị

<a id="_Toc103348601"></a>Xử lý dữ liệu ngành

<a id="_Toc103348602"></a>7

<a id="_Toc103348603"></a>Chức danh

<a id="_Toc103348604"></a>Combobox lấy tên, id chức danh từ bảng dữ liệu chức danh

<a id="_Toc103348605"></a>Có

<a id="_Toc103348606"></a>Lựa chọn giá trị

<a id="_Toc103348607"></a>Phó phòng

8

Dung lượng lưu trữ \(đơn vị GB\)

Number field

Có

Giá trị hiển thị mặc định theo thiết lập trước

5

9

<a id="_Toc103348614"></a>Loại tài khoản

Combobox lấy id và tên loại tài khoản

<a id="_Toc103348616"></a>Có

Lựa chọn giá trị

Quản trị

10

Mật khẩu

Password field

Có

Quy tắc nhập mật khẩu

11

Nhập lại mật khẩu

Password field

Có

Quy  tắc nhập mật khẩu, trùng với \(10\)

1. Quản lý phòng ban 

 <a id="_Toc103348619"></a>Mã Use case

 <a id="_Toc103348620"></a>UC 049 – UC 52

<a id="_Toc103348621"></a>Tên Usecase

<a id="_Toc103348622"></a>Quản lý phòng ban

 <a id="_Toc103348623"></a>Tác nhân

<a id="_Toc103348624"></a>Admin

 <a id="_Toc103348625"></a>Mô tả

<a id="_Toc103348626"></a>Quản lý tất cả tất cả các phòng ban trên hệ thống từ xem danh sách, thêm mới, sửa thông tin, xóa các đơn vị phòng ban

<a id="_Toc103348627"></a>Sự kiện kích hoạt

<a id="_Toc103348628"></a>Kích vào chức năng quản lý phòng ban trên giao diện hệ thống

 <a id="_Toc103348629"></a>Tiền điều kiện

<a id="_Toc103348630"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103348631"></a>*Xem danh sách phòng ban \(*UC 049\)

<a id="_Toc103348632"></a>Luồng sự kiện chính

<a id="_Toc103348633"></a>STT

<a id="_Toc103348634"></a>Tác nhân 

<a id="_Toc103348635"></a>Hệ thống

<a id="_Toc103348636"></a>1

<a id="_Toc103348637"></a>Đưa yêu cầu xem danh sách phòng ban trên giao diện \(kích chọn menu Quản lý phòng ban\)

<a id="_Toc103348638"></a>Hiển thị danh sách phòng ban hệ thống \(phân trang\) 

<a id="_Toc103348639"></a>Luồng sự kiện phụ

<a id="_Toc103348640"></a>1a

<a id="_Toc103348641"></a>Thông báo khi chưa có phòng ban nào\.

<a id="_Toc103348642"></a>*Thêm phòng ban \(*UC 050\)

<a id="_Toc103348643"></a>*Luồng sự kiện chính*

<a id="_Toc103348644"></a>STT

<a id="_Toc103348645"></a>Tác nhân 

<a id="_Toc103348646"></a>Hệ thống

<a id="_Toc103348647"></a>1

<a id="_Toc103348648"></a>Kích chọn chức năng thêm phòng ban trên giao diện\.

<a id="_Toc103348649"></a>Hiển thị giao diện để nhập và chọn các trường dữ liệu thêm vào\.

<a id="_Toc103348650"></a>2

<a id="_Toc103348651"></a>Nhập các trường dữ liệu vào các ô textbox tương ứng \(\*\)

<a id="_Toc103348652"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào

<a id="_Toc103348653"></a>4

<a id="_Toc103348654"></a>Chọn nút “Lưu" để lưu phòng ban đã tạo

<a id="_Toc103348655"></a>Hệ thống lưu thông tin phòng ban vào CSDL và thông báo lưu thành công\.

<a id="_Toc103348656"></a>*Luồng sự kiện thay thế*

<a id="_Toc103348657"></a>STT

<a id="_Toc103348658"></a>Tác nhân

<a id="_Toc103348659"></a>Hệ thống

<a id="_Toc103348660"></a>2a

<a id="_Toc103348661"></a>Không nhập tên đơn vị

<a id="_Toc103348662"></a>Thông báo không được phép để trống

<a id="_Toc103348663"></a>4b

<a id="_Toc103348664"></a>Phòng ban bị trùng lặp

<a id="_Toc103348665"></a>Thông báo tạo lại phòng ban khác

<a id="_Toc103348666"></a>*Sửa thông tin phòng ban \(*UC 051\)

<a id="_Toc103348667"></a>Luồng sự kiện chính 

<a id="_Toc103348668"></a>STT

<a id="_Toc103348669"></a>Tác nhân

<a id="_Toc103348670"></a>Hệ thống

<a id="_Toc103348671"></a>1

<a id="_Toc103348672"></a>Đưa yêu cầu sửa thông tin người dùng \(Kích biểu tượng hình bút chì ứng ứng với dòng thông tin của phòng ban muốn sửa\)

<a id="_Toc103348673"></a>Hiển thị giao diện chứa thông tin chi tiết về phòng ban đã chọn\. 

<a id="_Toc103348674"></a>2

<a id="_Toc103348675"></a>Chỉnh sửa các trường thông tin \(\*\)

<a id="_Toc103348676"></a>Hiển thị giao diện theo thông tin sửa đổi

<a id="_Toc103348677"></a>3

<a id="_Toc103348678"></a>Kích nút Lưu để ghi lại thông tin đã sửa\.

<a id="_Toc103348679"></a>Ghi lại thông tin thay đổi của phòng ban vào CSDL và thông báo thay đổi thành công

<a id="_Toc103348680"></a>Luồng sự kiện thay thế

<a id="_Toc103348681"></a>2a

<a id="_Toc103348682"></a>Tên đơn vị để trống

<a id="_Toc103348683"></a>Thông báo không được phép để trống

<a id="_Toc103348684"></a>*Xóa thông tin phòng ban \(*UC 052A\)

<a id="_Toc103348685"></a>STT

<a id="_Toc103348686"></a>Tác nhân

<a id="_Toc103348687"></a>Hệ thống

<a id="_Toc103348688"></a>*Luồng sự kiện chính*

<a id="_Toc103348689"></a>2

<a id="_Toc103348690"></a>Đưa yêu cầu xóa phòng ban đã tạo \(Kích mục Xóa \- biểu tượng  mắt ứng với dòng thông tin của phòng ban muốn xóa\)

Chuyển trạng thái phòng ban thành Không hiển thị, không thể sử dụng phòng ban này ở bất kỳ chức năng nào khác\.

*Khôi phục phòng ban \(UC 052B\)*

2

Đưa yêu cầu khôi phục lại phòng ban đã xóa \(Kích mục Xóa \- biểu tượng  mắt ứng với dòng thông tin của phòng ban muốn xóa\)

Phòng ban chuyển lại trạng thái hiển thị để có thể sử dụng ở các chức năng khác có liên quan\.

<a id="_Toc103348698"></a>Hậu điều kiện

<a id="_Toc103348699"></a>Dữ liệu được cập nhật trên hệ thống

Các trường thông tin

<a id="_Toc103348700"></a>STT

<a id="_Toc103348701"></a>Trường dữ liệu

<a id="_Toc103348702"></a>Mô tả

<a id="_Toc103348703"></a>Bắt buộc

<a id="_Toc103348704"></a>Điều kiện hợp lệ

<a id="_Toc103348705"></a>Ví dụ

<a id="_Toc103348706"></a>1

<a id="_Toc103348707"></a>Tên đơn vị

<a id="_Toc103348708"></a>Input text field

<a id="_Toc103348709"></a>Có

<a id="_Toc103348710"></a>Các kí tự chữ hoa, thường có dấu cách\.

<a id="_Toc103348711"></a>Đơn vị A

<a id="_Toc103348712"></a>2

<a id="_Toc103348713"></a>Mô tả

<a id="_Toc103348714"></a>Input text field

<a id="_Toc103348715"></a>Không

<a id="_Toc103348716"></a>Các kí tự chữ hoa, thường có dấu cách

<a id="_Toc103348717"></a>Đơn vị thực hiện các hoạt động …

<a id="_Toc103348718"></a>3

<a id="_Toc103348719"></a>Đơn vị cấp trên

<a id="_Toc103348720"></a>Combo box

<a id="_Toc103348721"></a>Có

<a id="_Toc103348722"></a>Lựa chọn đơn vị 

4

Danh mục chức danh

Multi\-select

Có

Lựa chọn các chức danh trong phòng

Trưởng phòng, phó phòng\.

1. Quản lý lĩnh vực

 <a id="_Toc103348723"></a>Mã Use case

<a id="_Toc103348724"></a>__UC 053\- UC 056__

<a id="_Toc103348725"></a>Tên Usecase

<a id="_Toc103348726"></a>Quản lý lĩnh vực

 <a id="_Toc103348727"></a>Tác nhân

<a id="_Toc103348728"></a>Admin

 <a id="_Toc103348729"></a>Mô tả

<a id="_Toc103348730"></a>Quản lý thiết lập tất cả các lĩnh vực trên hệ thống từ xem danh sách, thêm mới, sửa thông tin, xóa lĩnh vực\.

<a id="_Toc103348731"></a>Sự kiện kích hoạt

<a id="_Toc103348732"></a>Kích vào chức năng quản lý lĩnh vực trên giao diện hệ thống

<a id="_Toc103348733"></a>Tiền điều kiện

<a id="_Toc103348734"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103348735"></a>*Xem danh sách lĩnh vực \(UC 053\)*

<a id="_Toc103348736"></a>Luồng sự kiện chính

<a id="_Toc103348737"></a>STT

<a id="_Toc103348738"></a>Tác nhân 

<a id="_Toc103348739"></a>Hệ thống

<a id="_Toc103348740"></a>1

<a id="_Toc103348741"></a>Đưa yêu cầu xem danh sách lĩnh vực trên giao diện \(kích chọn menu Quản lý lĩnh vực\)

<a id="_Toc103348742"></a>Hiển thị danh sách lĩnh vực trên hệ thống \(phân trang\) 

<a id="_Toc103348743"></a>Luồng sự kiện phụ

<a id="_Toc103348744"></a>1a

<a id="_Toc103348745"></a>Thông báo khi chưa có lĩnh vực nào\.

<a id="_Toc103348746"></a>*Tìm kiếm lĩnh vực \(UC 054\)*

<a id="_Toc103348747"></a>*Luồng sự kiện chính*

<a id="_Toc103348748"></a>STT

<a id="_Toc103348749"></a>Tác nhân 

<a id="_Toc103348750"></a>Hệ thống

<a id="_Toc103348751"></a>1

<a id="_Toc103348752"></a>Kích chọn ô textbox Tìm kiếm tên phía trên của giao diện

<a id="_Toc103348753"></a>Hiển thị nháy đơn để nhập dữ liệu dầu vào

<a id="_Toc103348754"></a>2

<a id="_Toc103348755"></a>Nhập từ khoá để tìm kiếm lĩnh vực

<a id="_Toc103348756"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào , hiển thị gợi ý lĩnh vực đã tạo trên hệ thống

<a id="_Toc103348757"></a>3

<a id="_Toc103348758"></a>Chọn nút biểu tượng kính lúp hoặc ấn phím enter để tìm kiếm

<a id="_Toc103348759"></a>Hiển thị kết quả tìm kiếm\.

<a id="_Toc103348760"></a>3a

<a id="_Toc103348761"></a>Không tìm thấy bản ghi thỏa mãn, thông báo không tìm được\.

<a id="_Toc103348762"></a>*Luồng sự kiện thay thế*

<a id="_Toc103348763"></a>STT

<a id="_Toc103348764"></a>Tác nhân

<a id="_Toc103348765"></a>Hệ thống

<a id="_Toc103348766"></a>3a

<a id="_Toc103348767"></a>Nhập tên lĩnh vực bị sai hoặc chưa có trên hệ thống

<a id="_Toc103348768"></a>Thông báo không tồn tại lĩnh vực đã tìm kiếm

<a id="_Toc103348769"></a>*Thêm lĩnh vực \(UC 055\)*

<a id="_Toc103348770"></a>*Luồng sự kiện chính*

<a id="_Toc103348771"></a>STT

<a id="_Toc103348772"></a>Tác nhân 

<a id="_Toc103348773"></a>Hệ thống

<a id="_Toc103348774"></a>1

<a id="_Toc103348775"></a>Kích chọn chức năng thêm lĩnh vực trên giao diện\.

<a id="_Toc103348776"></a>Hiển thị giao diện để nhập các trường dữ liệu thêm vào\.

<a id="_Toc103348777"></a>2

<a id="_Toc103348778"></a>Nhập các trường dữ liệu vào các ô textbox tương ứng \(\*\)

<a id="_Toc103348779"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào

<a id="_Toc103348780"></a>3

<a id="_Toc103348781"></a>Chọn nút “Lưu" để lưu lĩnh vực đã tạo

<a id="_Toc103348782"></a>Hệ thống lưu thông tin lĩnh vực vào CSDL và thông báo lưu thành công\.

<a id="_Toc103348783"></a>*Luồng sự kiện thay thế*

<a id="_Toc103348784"></a>STT

<a id="_Toc103348785"></a>Tác nhân

<a id="_Toc103348786"></a>Hệ thống

<a id="_Toc103348787"></a>2a

<a id="_Toc103348788"></a>Không nhập tên lĩnh vực

<a id="_Toc103348789"></a>Thông báo không được phép để trống

<a id="_Toc103348790"></a>3a

<a id="_Toc103348791"></a>Lĩnh vực bị trùng lặp

<a id="_Toc103348792"></a>Thông báo tạo lại lĩnh vực khác

<a id="_Toc103348793"></a>*Sửa thông tin  lĩnh vực \(UC 056\)*

<a id="_Toc103348794"></a>Luồng sự kiện chính 

<a id="_Toc103348795"></a>STT

<a id="_Toc103348796"></a>Tác nhân

<a id="_Toc103348797"></a>Hệ thống

<a id="_Toc103348798"></a>1

<a id="_Toc103348799"></a>Đưa yêu cầu sửa thông tin lĩnh vực \(Kích biểu tượng hình bút chì ứng với dòng thông tin của lĩnh vực muốn sửa\)

<a id="_Toc103348800"></a>Hiển thị giao diện chứa thông tin chi tiết về lĩnh vực đã chọn\. 

<a id="_Toc103348801"></a>2

<a id="_Toc103348802"></a>Chỉnh sửa các trường thông tin \(\*\)

<a id="_Toc103348803"></a>Hiển thị giao diện theo thông tin sửa đổi

<a id="_Toc103348804"></a>3

<a id="_Toc103348805"></a>Kích nút Lưu để ghi lại thông tin đã sửa\.

<a id="_Toc103348806"></a>Ghi lại thông tin thay đổi của lĩnh vực vào CSDL và thông báo thay đổi thành công

<a id="_Toc103348807"></a>Luồng sự kiện thay thế

<a id="_Toc103348808"></a>3a

<a id="_Toc103348809"></a>Tên lĩnh vực để trống

<a id="_Toc103348810"></a>Thông báo không được phép để trống

<a id="_Toc103348811"></a>3b

<a id="_Toc103348812"></a>Lĩnh vực bị trùng lặp

<a id="_Toc103348813"></a>Thông báo tạo lại lĩnh vực khác

<a id="_Toc103348814"></a>*Xóa lĩnh vực \(UC 057A\)*

<a id="_Toc103348815"></a>STT

<a id="_Toc103348816"></a>Tác nhân

<a id="_Toc103348817"></a>Hệ thống

<a id="_Toc103348818"></a>*Luồng sự kiện chính*

<a id="_Toc103348819"></a>2

<a id="_Toc103348820"></a>Đưa yêu cầu xóa lĩnh vực đã tạo \(Kích biểu tượng Xóa – hình mắt ứng với dòng thông tin của lĩnh vực muốn xóa\)

<a id="_Toc103348821"></a>Chuyển trạng thái lĩnh vực thành Không hiển thị, không thể sử dụng lĩnh vực này ở bất kỳ chức năng nào khác\.

*Khôi phục lĩnh vực đã xóa \(UC57B\)*

2

Đưa yêu cầu khôi phục lĩnh vực đã xóa \(Kích biểu tượng hình mắt ứng với dòng thông tin của lĩnh vực muốn khôi phục\)

Chuyển trạng thái lĩnh vực thành Hiển thị, có thể sử dụng lĩnh vực này ở bất kỳ chức năng nào khác có liên quan\.

<a id="_Toc103348828"></a>Hậu điều kiện

Dữ liệu được cập nhật trên hệ thống

Các trường thông tin

<a id="_Toc103348829"></a>STT

<a id="_Toc103348830"></a>Trường dữ liệu

<a id="_Toc103348831"></a>Mô tả

<a id="_Toc103348832"></a>Bắt buộc

<a id="_Toc103348833"></a>Điều kiện hợp lệ

<a id="_Toc103348834"></a>Ví dụ

<a id="_Toc103348835"></a>1

<a id="_Toc103348836"></a>Tên lĩnh vực

<a id="_Toc103348837"></a>Input textfield

<a id="_Toc103348838"></a>Có

<a id="_Toc103348839"></a>Các kí tự chữ hoa, thường có dấu cách\.

<a id="_Toc103348840"></a>Quân sự

<a id="_Toc103348841"></a>2

<a id="_Toc103348842"></a>Mô tả

<a id="_Toc103348843"></a>Textarea field

<a id="_Toc103348844"></a>Có

<a id="_Toc103348845"></a>Các kí tự chữ hoa, thường có dấu cách

1. Quản lý thông tin Quốc gia

 <a id="_Toc103348846"></a>Mã Use case

<a id="_Toc103348847"></a>UC058 – UC062

<a id="_Toc103348848"></a>Tên Usecase

<a id="_Toc103348849"></a>Quản lý Quốc Gia

 <a id="_Toc103348850"></a>Tác nhân

<a id="_Toc103348851"></a>Admin

 <a id="_Toc103348852"></a>Mô tả

<a id="_Toc103348853"></a>Quản lý thiết lập tất cả các Quốc Gia trên hệ thống từ xem danh sách, tìm kiếm, thêm mới, sửa thông tin Quốc gia

<a id="_Toc103348854"></a>Sự kiện kích hoạt

<a id="_Toc103348855"></a>Kích vào chức năng quản lý Quốc gia trên giao diện hệ thống

 <a id="_Toc103348856"></a>Tiền điều kiện

<a id="_Toc103348857"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103348858"></a>*Xem danh sách Quốc Gia \(UC 058\)*

<a id="_Toc103348859"></a>Luồng sự kiện chính

<a id="_Toc103348860"></a>STT

<a id="_Toc103348861"></a>Tác nhân 

<a id="_Toc103348862"></a>Hệ thống

<a id="_Toc103348863"></a>1

<a id="_Toc103348864"></a>Đưa yêu cầu xem danh sách Quốc gia trên giao diện \(kích chọn menu Quản lý Quốc gia\)

<a id="_Toc103348865"></a>Hiển thị danh sách Quốc gia trên hệ thống \(phân trang\) 

<a id="_Toc103348866"></a>Luồng sự kiện phụ

<a id="_Toc103348867"></a>1a

<a id="_Toc103348868"></a>Thông báo khi chưa có thông tin quốc gia nào\.

<a id="_Toc103348869"></a>*Chọn Khu vực hiển thị \( Tìm kiếm chọn lọc\) \(UC 059\)*

<a id="_Toc103348870"></a>Luồng sự kiện chính

<a id="_Toc103348871"></a>STT

<a id="_Toc103348872"></a>Tác nhân 

<a id="_Toc103348873"></a>Hệ thống

<a id="_Toc103348874"></a>1

<a id="_Toc103348875"></a>Kích chọn droplist khu vực

<a id="_Toc103348876"></a>Hiển thị droplist các khu vực có trên hệ thống

<a id="_Toc103348877"></a>2

<a id="_Toc103348878"></a>Kích chọn khu vực muốn hiển thị

<a id="_Toc103348879"></a>Hiển thị danh sách kết quả theo khu vực đã chọn

<a id="_Toc103348880"></a>*Tìm kiếm Quốc gia \(UC 060\)*

<a id="_Toc103348881"></a>*Luồng sự kiện chính*

<a id="_Toc103348882"></a>STT

<a id="_Toc103348883"></a>Tác nhân 

<a id="_Toc103348884"></a>Hệ thống

<a id="_Toc103348885"></a>1

<a id="_Toc103348886"></a>Kích chọn ô textbox Tìm kiếm tên phía trên của giao diện\. 

<a id="_Toc103348887"></a>Hiển thị nháy đơn để nhập dữ liệu dầu vào

<a id="_Toc103348888"></a>2

<a id="_Toc103348889"></a>Nhập tên để tìm kiếm Quốc gia

<a id="_Toc103348890"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào , hiển thị gợi ý Quốc gia đã tạo trên hệ thống

<a id="_Toc103348891"></a>3

<a id="_Toc103348892"></a>Chọn nút biểu tượng kính lúp hoặc ấn phím enter để tìm kiếm

<a id="_Toc103348893"></a>Hiển thị kết quả tìm kiếm\.

<a id="_Toc103348894"></a>*Luồng sự kiện thay thế*

<a id="_Toc103348895"></a>STT

<a id="_Toc103348896"></a>Tác nhân

<a id="_Toc103348897"></a>Hệ thống

<a id="_Toc103348898"></a>3a

<a id="_Toc103348899"></a>Nhập tên Quốc gia bị sai hoặc chưa có trên hệ thống

<a id="_Toc103348900"></a>Thông báo không tồn tại Quốc gia đã tìm kiếm

<a id="_Toc103348901"></a>*Thêm thông tin quốc gia \(UC 061\)*

<a id="_Toc103348902"></a>*Luồng sự kiện chính*

<a id="_Toc103348903"></a>STT

<a id="_Toc103348904"></a>Tác nhân 

<a id="_Toc103348905"></a>Hệ thống

<a id="_Toc103348906"></a>1

<a id="_Toc103348907"></a>Kích chọn chức năng thêm Quốc gia trên giao diện\.

<a id="_Toc103348908"></a>Hiển thị giao diện để nhập các trường dữ liệu thêm vào\.

<a id="_Toc103348909"></a>2

<a id="_Toc103348910"></a>Nhập các trường dữ liệu vào các ô textbox tương ứng \(\*\)

<a id="_Toc103348911"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào

<a id="_Toc103348912"></a>3

<a id="_Toc103348913"></a>Kích vào droplist khu vực

<a id="_Toc103348914"></a>Hiển thị droplist khu vực 

<a id="_Toc103348915"></a>4

<a id="_Toc103348916"></a>Chọn Khu vực 

<a id="_Toc103348917"></a>Giao diện thay đổi theo trường dũ liệu đã chọn

<a id="_Toc103348918"></a>5

<a id="_Toc103348919"></a>Chọn nút “Lưu" để lưu lĩnh vực đã tạo

<a id="_Toc103348920"></a>Hệ thống lưu thông tin lĩnh vực vào CSDL và thông báo lưu thành công\.

<a id="_Toc103348921"></a>*Luồng sự kiện thay thế*

<a id="_Toc103348922"></a>STT

<a id="_Toc103348923"></a>Tác nhân

<a id="_Toc103348924"></a>Hệ thống

<a id="_Toc103348925"></a>2a

<a id="_Toc103348926"></a>Không nhập tên quốc gia

<a id="_Toc103348927"></a>Thông báo không được phép để trống

<a id="_Toc103348928"></a>4b

<a id="_Toc103348929"></a>Quốc gia bị trùng lặp

<a id="_Toc103348930"></a>Thông báo tạo lại Quốc gia khác

<a id="_Toc103348931"></a>*Sửa thông tin Quốc gia \(UC 062\)*

<a id="_Toc103348932"></a>Luồng sự kiện chính 

<a id="_Toc103348933"></a>STT

<a id="_Toc103348934"></a>Tác nhân

<a id="_Toc103348935"></a>Hệ thống

<a id="_Toc103348936"></a>1

<a id="_Toc103348937"></a>Đưa yêu cầu sửa thông tin Quốc gia \(Kích biểu tượng hình bút chì ứng với dòng thông tin của Quốc gia muốn sửa\)

<a id="_Toc103348938"></a>Hiển thị giao diện chứa thông tin chi tiết về Quốc gia đã chọn\. 

<a id="_Toc103348939"></a>2

<a id="_Toc103348940"></a>Chỉnh sửa các trường thông tin \(\*\)

<a id="_Toc103348941"></a>Hiển thị giao diện theo thông tin sửa đổi

<a id="_Toc103348942"></a>3

<a id="_Toc103348943"></a>Chọn lại khu vực

<a id="_Toc103348944"></a>Hiển thị giao diện theo thông tin sửa đổi

<a id="_Toc103348945"></a>4

<a id="_Toc103348946"></a>Kích nút Lưu để ghi lại thông tin đã sửa\.

<a id="_Toc103348947"></a>Ghi lại thông tin thay đổi của Quốc gia vào CSDL và thông báo thay đổi thành công

<a id="_Toc103348948"></a>Luồng sự kiện thay thế

<a id="_Toc103348949"></a>4a

<a id="_Toc103348950"></a>Tên Quốc gia để trống

<a id="_Toc103348951"></a>Thông báo không được phép để trống

*Xóa thông tin Quốc gia \(UC 063A\)*

STT

Tác nhân

Hệ thống

2

Đưa yêu cầu xóa thông tin Quốc gia đã tạo \(Kích biểu tượng Xóa – hình mắt ứng với dòng thông tin quốc gia muốn xóa\)

Chuyển trạng thái quốc gia thành Không hiển thị, không thể sử dụng quốc gia này ở bất kỳ chức năng nào khác\.

*Khôi phục lĩnh vực đã xóa \(UC57B\)*

2

Đưa yêu cầu khôi phục quốc gia đã xóa \(Kích biểu tượng hình mắt ứng với dòng thông tin của muốn khôi phục\)

Chuyển trạng thái quốc gia thành Hiển thị, có thể sử dụng quốc gia này ở bất kỳ chức năng nào khác có liên quan\.

Hậu điều kiện

Dữ liệu được cập nhật trên hệ thống

Các trường thông tin

<a id="_Toc103348952"></a>STT

<a id="_Toc103348953"></a>Trường dữ liệu

<a id="_Toc103348954"></a>Mô tả

<a id="_Toc103348955"></a>Bắt buộc

<a id="_Toc103348956"></a>Điều kiện hợp lệ

<a id="_Toc103348957"></a>Ví dụ

<a id="_Toc103348958"></a>1

<a id="_Toc103348959"></a>Tên Quốc gia

<a id="_Toc103348960"></a>Input text field

<a id="_Toc103348961"></a>Có

<a id="_Toc103348962"></a>Các kí tự chữ hoa, thường có dấu cách\.

<a id="_Toc103348963"></a>Việt Nam

<a id="_Toc103348964"></a>2

<a id="_Toc103348965"></a>Tên khu vực

<a id="_Toc103348966"></a>Combo box lấy tên, id khu vực từ dữ liệu khu vực

<a id="_Toc103348967"></a>Có

<a id="_Toc103348968"></a>Lựa chọn giá trị

Châu Á

1. Quản lý Khu vực 

 <a id="_Toc103348969"></a>Mã Use case

<a id="_Toc103348970"></a>UC 064 – UC 068

<a id="_Toc103348971"></a>Tên Usecase

<a id="_Toc103348972"></a>Quản lý khu vực

 <a id="_Toc103348973"></a>Tác nhân

<a id="_Toc103348974"></a>Admin

 <a id="_Toc103348975"></a>Mô tả

<a id="_Toc103348976"></a>Quản lý thiết lập tất cả các khu vực hiển thị trên hệ thống từ xem danh sách, tìm kiếm, thêm mới, sửa thông tin, xóa khu vực

<a id="_Toc103348977"></a>Sự kiện kích hoạt

<a id="_Toc103348978"></a>Kích vào chức năng quản lý khu vực trên giao diện hệ thống

 <a id="_Toc103348979"></a>Tiền điều kiện

<a id="_Toc103348980"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103348981"></a>*Xem danh sách khu vực \(UC 064\)*

<a id="_Toc103348982"></a>Luồng sự kiện chính

<a id="_Toc103348983"></a>STT

<a id="_Toc103348984"></a>Tác nhân 

<a id="_Toc103348985"></a>Hệ thống

<a id="_Toc103348986"></a>1

<a id="_Toc103348987"></a>Đưa yêu cầu xem danh sách khu vực trên giao diện \(kích chọn menu Quản lý khu vực\)

<a id="_Toc103348988"></a>Hiển thị danh sách khu vực trên hệ thống \(phân trang\) 

<a id="_Toc103348989"></a>Luồng sự kiện phụ

<a id="_Toc103348990"></a>1a

<a id="_Toc103348991"></a>Thông báo khi chưa có khu vực nào\.

<a id="_Toc103348992"></a>*Tìm kiếm khu vực \(UC 065\)*

<a id="_Toc103348993"></a>*Luồng sự kiện chính*

<a id="_Toc103348994"></a>STT

<a id="_Toc103348995"></a>Tác nhân 

<a id="_Toc103348996"></a>Hệ thống

<a id="_Toc103348997"></a>1

<a id="_Toc103348998"></a>Kích chọn ô textbox Tìm kiếm tên phía trên của giao diện

<a id="_Toc103348999"></a>Hiển thị nháy đơn để nhập dữ liệu dầu vào

<a id="_Toc103349000"></a>2

<a id="_Toc103349001"></a>Nhập từ khoá để tìm kiếm khu vực

<a id="_Toc103349002"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào , hiển thị gợi ý khu vực đã tạo trên hệ thống

<a id="_Toc103349003"></a>3

<a id="_Toc103349004"></a>Chọn nút biểu tượng kính lúp hoặc ấn phím enter để tìm kiếm

<a id="_Toc103349005"></a>Hiển thị kết quả tìm kiếm\.

<a id="_Toc103349006"></a>*Luồng sự kiện thay thế*

<a id="_Toc103349007"></a>STT

<a id="_Toc103349008"></a>Tác nhân

<a id="_Toc103349009"></a>Hệ thống

<a id="_Toc103349010"></a>3a

<a id="_Toc103349011"></a>Nhập tên khu vực bị sai hoặc chưa có trên hệ thống

<a id="_Toc103349012"></a>Thông báo không tồn tại lĩnh vực đã tìm kiếm

<a id="_Toc103349013"></a>*Thêm khu vực \(UC 066\)*

<a id="_Toc103349014"></a>*Luồng sự kiện chính*

<a id="_Toc103349015"></a>STT

<a id="_Toc103349016"></a>Tác nhân 

<a id="_Toc103349017"></a>Hệ thống

<a id="_Toc103349018"></a>1

<a id="_Toc103349019"></a>Kích chọn chức năng thêm khu vực trên giao diện\.

<a id="_Toc103349020"></a>Hiển thị giao diện để nhập các trường dữ liệu thêm vào\.

<a id="_Toc103349021"></a>2

<a id="_Toc103349022"></a>Nhập các trường dữ liệu vào các ô textbox tương ứng \(\*\)

<a id="_Toc103349023"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào

<a id="_Toc103349024"></a>3

<a id="_Toc103349025"></a>Chọn nút “Lưu" để lưu khu vực đã tạo

<a id="_Toc103349026"></a>Hệ thống lưu thông tin khu vực vào CSDL và thông báo lưu thành công\.

<a id="_Toc103349027"></a>*Luồng sự kiện thay thế*

<a id="_Toc103349028"></a>STT

<a id="_Toc103349029"></a>Tác nhân

<a id="_Toc103349030"></a>Hệ thống

<a id="_Toc103349031"></a>2a

<a id="_Toc103349032"></a>Không nhập tên khu vực

<a id="_Toc103349033"></a>Thông báo không được phép để trống

<a id="_Toc103349034"></a>3a

<a id="_Toc103349035"></a>Khu vực bị trùng lặp

<a id="_Toc103349036"></a>Thông báo tạo lại khu vực khác

<a id="_Toc103349037"></a>*Sửa thông tin Khu vực \(UC 067\)*

<a id="_Toc103349038"></a>Luồng sự kiện chính 

<a id="_Toc103349039"></a>STT

<a id="_Toc103349040"></a>Tác nhân

<a id="_Toc103349041"></a>Hệ thống

<a id="_Toc103349042"></a>1

<a id="_Toc103349043"></a>Đưa yêu cầu sửa thông tin khu vực \(Kích biểu tượng hình bút chì ứng với dòng thông tin của khu vực muốn sửa\)

<a id="_Toc103349044"></a>Hiển thị giao diện chứa thông tin chi tiết về khu vực đã chọn\. 

<a id="_Toc103349045"></a>2

<a id="_Toc103349046"></a>Chỉnh sửa các trường thông tin \(\*\)

<a id="_Toc103349047"></a>Hiển thị giao diện theo thông tin sửa đổi

<a id="_Toc103349048"></a>3

<a id="_Toc103349049"></a>Kích nút Lưu để ghi lại thông tin đã sửa\.

<a id="_Toc103349050"></a>Ghi lại thông tin thay đổi của khu vực vào CSDL và thông báo thay đổi thành công

<a id="_Toc103349051"></a>Luồng sự kiện thay thế

<a id="_Toc103349052"></a>2a

<a id="_Toc103349053"></a>Tên khu vực để trống

<a id="_Toc103349054"></a>Thông báo không được phép để trống

<a id="_Toc103349055"></a>3a

<a id="_Toc103349056"></a>Tên khu vực bị trùng lặp

<a id="_Toc103349057"></a>Thông báo sửa lại tên khu vực khác

<a id="_Toc103349058"></a>*Xoá khu vực \(UC 068A\)*

<a id="_Toc103349059"></a>STT

<a id="_Toc103349060"></a>Tác nhân

<a id="_Toc103349061"></a>Hệ thống

<a id="_Toc103349062"></a>*Luồng sự kiện chính*

<a id="_Toc103349063"></a>2

<a id="_Toc103349064"></a>Đưa yêu cầu xóa khu vực đã tạo \(Kích biểu tượng Xóa hình mắt  ứng với dòng thông tin của khu vực muốn xóa\)

Chuyển trạng thái khu vực thành Không hiển thị, không thể sử dụng khu vực này ở bất kỳ chức năng nào khác\.

*Khôi phục khu vực đã xóa \(UC 068B\)*

2

Đưa yêu cầu khôi phục khu vực đã xóa \(Kích biểu tượng hình mắt  ứng với dòng thông tin của khu vực muốn khôi phục\)

Chuyển trạng thái khu vực thành Hiển thị, để có thể sử dụng khu vực này ở các chức năng liên quan\.

Các trường thông tin

<a id="_Toc103349072"></a>STT

<a id="_Toc103349073"></a>Trường dữ liệu

<a id="_Toc103349074"></a>Mô tả

<a id="_Toc103349075"></a>Bắt buộc

<a id="_Toc103349076"></a>Điều kiện hợp lệ

<a id="_Toc103349077"></a>Ví dụ

<a id="_Toc103349078"></a>1

<a id="_Toc103349079"></a>Tên khu vực

<a id="_Toc103349080"></a>Input textfield

<a id="_Toc103349081"></a>Có

<a id="_Toc103349082"></a>Các kí tự chữ hoa, thường có dấu cách\.

<a id="_Toc103349083"></a>Châu Á

<a id="_Toc103349084"></a>2

<a id="_Toc103349085"></a>Mô tả

<a id="_Toc103349086"></a>Input textfield

<a id="_Toc103349087"></a>Có

<a id="_Toc103349088"></a>Các kí tự chữ hoa, thường có dấu cách

<a id="_Toc103349089"></a>Mô tả gắn với Châu Á\.

1. Quản lý Chức danh 

 <a id="_Toc103349090"></a>Mã Use case

<a id="_Toc103349091"></a>UC 069 – UC 073

<a id="_Toc103349092"></a>Tên Usecase

<a id="_Toc103349093"></a>Quản lý khu vực

 <a id="_Toc103349094"></a>Tác nhân

<a id="_Toc103349095"></a>Admin

 <a id="_Toc103349096"></a>Mô tả

<a id="_Toc103349097"></a>Quản lý thiết lập tất cả các khu vực hiển thị trên hệ thống từ xem danh sách, tìm kiếm, thêm mới, sửa thông tin, xóa chức danh

<a id="_Toc103349098"></a>Sự kiện kích hoạt

<a id="_Toc103349099"></a>Kích vào chức năng quản lý chức danh trên giao diện hệ thống

 <a id="_Toc103349100"></a>Tiền điều kiện

<a id="_Toc103349101"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349102"></a>*Xem danh sách chức danh \(UC 069\)*

<a id="_Toc103349103"></a>Luồng sự kiện chính

<a id="_Toc103349104"></a>STT

<a id="_Toc103349105"></a>Tác nhân 

<a id="_Toc103349106"></a>Hệ thống

<a id="_Toc103349107"></a>1

<a id="_Toc103349108"></a>Đưa yêu cầu xem danh sách chức danh trên giao diện \(kích chọn menu Quản lý chức danh\)

<a id="_Toc103349109"></a>Hiển thị danh sách chức danh trên hệ thống \(phân trang\) 

<a id="_Toc103349110"></a>Luồng sự kiện phụ

<a id="_Toc103349111"></a>1a

<a id="_Toc103349112"></a>Thông báo khi chưa có chức danh nào\.

<a id="_Toc103349113"></a>*Tìm kiếm chức danh \(UC 070\)*

<a id="_Toc103349114"></a>*Luồng sự kiện chính*

<a id="_Toc103349115"></a>STT

<a id="_Toc103349116"></a>Tác nhân 

<a id="_Toc103349117"></a>Hệ thống

<a id="_Toc103349118"></a>1

<a id="_Toc103349119"></a>Kích chọn ô textbox Tìm kiếm tên phía trên của giao diện

<a id="_Toc103349120"></a>Hiển thị nháy đơn để nhập dữ liệu dầu vào

<a id="_Toc103349121"></a>2

<a id="_Toc103349122"></a>Nhập từ khoá để tìm kiếm chức danh

<a id="_Toc103349123"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào, hiển thị gợi ý chức danh đã tạo trên hệ thống

<a id="_Toc103349124"></a>3

<a id="_Toc103349125"></a>Chọn nút biểu tượng kính lúp hoặc ấn phím enter để tìm kiếm

<a id="_Toc103349126"></a>Hiển thị kết quả tìm kiếm\.

<a id="_Toc103349127"></a>*Luồng sự kiện thay thế*

<a id="_Toc103349128"></a>STT

<a id="_Toc103349129"></a>Tác nhân

<a id="_Toc103349130"></a>Hệ thống

<a id="_Toc103349131"></a>3a

<a id="_Toc103349132"></a>Nhập tên chức danh bị sai hoặc chưa có trên hệ thống

<a id="_Toc103349133"></a>Thông báo không tồn tại lĩnh vực đã tìm kiếm

<a id="_Toc103349134"></a>*Thêm chức danh \(UC 071\)*

<a id="_Toc103349135"></a>*Luồng sự kiện chính*

<a id="_Toc103349136"></a>STT

<a id="_Toc103349137"></a>Tác nhân 

<a id="_Toc103349138"></a>Hệ thống

<a id="_Toc103349139"></a>1

<a id="_Toc103349140"></a>Kích chọn chức năng thêm chức danh trên giao diện\.

<a id="_Toc103349141"></a>Hiển thị giao diện để nhập các trường dữ liệu thêm vào\.

<a id="_Toc103349142"></a>2

<a id="_Toc103349143"></a>Nhập các trường dữ liệu vào các ô textbox tương ứng \(\*\)

<a id="_Toc103349144"></a>Giao diện thay đổi theo dữ liệu người dùng đưa vào

<a id="_Toc103349145"></a>3

<a id="_Toc103349146"></a>Chọn nút “Lưu" để lưu chức danh đã tạo

<a id="_Toc103349147"></a>Hệ thống lưu thông tin chức danh vào CSDL và thông báo lưu thành công\.

<a id="_Toc103349148"></a>*Luồng sự kiện thay thế*

<a id="_Toc103349149"></a>STT

<a id="_Toc103349150"></a>Tác nhân

<a id="_Toc103349151"></a>Hệ thống

<a id="_Toc103349152"></a>2a

<a id="_Toc103349153"></a>Không nhập tên chức danh

<a id="_Toc103349154"></a>Thông báo không được phép để trống

<a id="_Toc103349155"></a>3a

<a id="_Toc103349156"></a>Chức danh bị trùng lặp

<a id="_Toc103349157"></a>Thông báo tạo lại chức danh khác

<a id="_Toc103349158"></a>*Sửa thông tin Chức danh \(UC 072\)*

<a id="_Toc103349159"></a>Luồng sự kiện chính 

<a id="_Toc103349160"></a>STT

<a id="_Toc103349161"></a>Tác nhân

<a id="_Toc103349162"></a>Hệ thống

<a id="_Toc103349163"></a>1

<a id="_Toc103349164"></a>Đưa yêu cầu sửa thông tin chức danh \(Kích biểu tượng hình bút chì ứng với dòng thông tin của chức danh muốn sửa\)

<a id="_Toc103349165"></a>Hiển thị giao diện chứa thông tin chi tiết về chức danh đã chọn\. 

<a id="_Toc103349166"></a>2

<a id="_Toc103349167"></a>Chỉnh sửa các trường thông tin \(\*\)

<a id="_Toc103349168"></a>Hiển thị giao diện theo thông tin sửa đổi

<a id="_Toc103349169"></a>3

<a id="_Toc103349170"></a>Kích nút Lưu để ghi lại thông tin đã sửa\.

<a id="_Toc103349171"></a>Ghi lại thông tin thay đổi của chức danh vào CSDL và thông báo thay đổi thành công

<a id="_Toc103349172"></a>Luồng sự kiện thay thế

<a id="_Toc103349173"></a>2a

<a id="_Toc103349174"></a>Tên chức danh để trống

<a id="_Toc103349175"></a>Thông báo không được phép để trống

<a id="_Toc103349176"></a>3a

<a id="_Toc103349177"></a>Tên chức danh bị trùng lặp

<a id="_Toc103349178"></a>Thông báo sửa lại tên chức danh khác

<a id="_Toc103349179"></a>*Xoá chức danh \(UC 073A\)*

<a id="_Toc103349180"></a>STT

<a id="_Toc103349181"></a>Tác nhân

<a id="_Toc103349182"></a>Hệ thống

<a id="_Toc103349183"></a>*Luồng sự kiện chính*

<a id="_Toc103349184"></a>2

<a id="_Toc103349185"></a>Đưa yêu cầu xóa chức danh đã tạo \(Kích biểu tượng xóa có hình mắt ứng với dòng thông tin của chức danh muốn xóa\)

Trạng thái chức danh chuyển sang Không hiển thị, không thể sử dụng chức danh này ở bất kỳ chức năng nào khác\. 

*Khôi phục chức  danh \(UC 073B\)*

2

Đưa yêu cầu khối phục chức danh đã tạo \(Kích biểu tượng có hình mắt ứng với dòng thông tin của chức danh muốn khôi phục\)

Trạng thái chức danh chuyển sang Hiển thị, để có thể sử dụng chức danh này các chức năng khác có liên quan\. 

<a id="_Toc103349193"></a>Hậu điều kiện

<a id="_Toc103349194"></a>Dữ liệu được cập nhật trên hệ thống

Các trường thông tin

<a id="_Toc103349195"></a>STT

<a id="_Toc103349196"></a>Trường dữ liệu

<a id="_Toc103349197"></a>Mô tả

<a id="_Toc103349198"></a>Bắt buộc

<a id="_Toc103349199"></a>Điều kiện hợp lệ

<a id="_Toc103349200"></a>Ví dụ

<a id="_Toc103349201"></a>1

<a id="_Toc103349202"></a>Tên chức danh

<a id="_Toc103349203"></a>Input textfield

<a id="_Toc103349204"></a>Có

<a id="_Toc103349205"></a>Các kí tự chữ hoa, thường có dấu cách\.

<a id="_Toc103349206"></a>Phó phòng

<a id="_Toc103349207"></a>2

Số lượng vị trí

<a id="_Toc103349209"></a>Input Number field

<a id="_Toc103349210"></a>Có

Giá trị số

<a id="_Toc103349212"></a>Mô tả gắn với chức danh phó phòng\.

3

Vai trò

Combo box

Có

Giá trị lựa chọn

4

Chia sẻ cho các phòng ban khác

Checkbox

Không

Giá trị lựa chọn

Nếu được chọn sẽ cho phép chức danh này chia sẻ thông tin với các phòng ban khác

1. Theo dõi lịch sử sử dụng phần mềm của người dùng hệ thống

 <a id="_Toc103349213"></a>Mã Use case

<a id="_Toc103349214"></a>UC 074 – UC 075 

<a id="_Toc103349215"></a>Tên Usecase

<a id="_Toc103349216"></a>Theo dõi lịch sử sử dụng hệ thống của người dùng

 <a id="_Toc103349217"></a>Tác nhân

<a id="_Toc103349218"></a>Admin

 <a id="_Toc103349219"></a>Mô tả

<a id="_Toc103349220"></a>Hiển thị thông tin lịch sử sử dụng hệ thống của người dùng\.

<a id="_Toc103349221"></a>Sự kiện kích hoạt

<a id="_Toc103349222"></a>Kích vào chức năng Lịch sử hoạt động trên giao diện hệ thống

 <a id="_Toc103349223"></a>Tiền điều kiện

<a id="_Toc103349224"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349225"></a>*Xem danh sách \(UC 074\)*

<a id="_Toc103349226"></a>Luồng sự kiện chính

<a id="_Toc103349227"></a>STT

<a id="_Toc103349228"></a>Tác nhân 

<a id="_Toc103349229"></a>Hệ thống

<a id="_Toc103349230"></a>1

<a id="_Toc103349231"></a>Hiển thị danh sách các hoạt động của hệ thống \(phân trang\) của tất cả người dùng hệ thống \(Bao gồm thời gian, Tên người dùng, Hoạt động đã thực hiện \(đăng nhập hay đăng xuất\), Mô tả thêm thực hiện từ địa chỉ IP nào\)\.

<a id="_Toc103349232"></a>Luồng sự kiện phụ

<a id="_Toc103349233"></a>1a

<a id="_Toc103349234"></a>Thông báo khi chưa có hoạt động nào\.

<a id="_Toc103349235"></a>*Lọc xem lịch sử hoạt động \(UC 075\)*

<a id="_Toc103349236"></a>Luồng sự kiện chính

<a id="_Toc103349237"></a>STT

<a id="_Toc103349238"></a>Tác nhân 

<a id="_Toc103349239"></a>Hệ thống

1

<a id="_Toc103349240"></a>Lọc xem lịch sử theo tên hoạt động, đơn vị, người dùng, khoảng thời gian

<a id="_Toc103349241"></a>Hiển thị danh sách lịch sử theo tiêu chí đã chọn

<a id="_Toc103349249"></a>Hậu điều kiện

<a id="_Toc103349250"></a>Không thay đổi dữ liệu hệ thống

1. Cấu hình tóm tắt văn bản

 <a id="_Toc103349251"></a>Mã Use case

 <a id="_Toc103349252"></a>UC 076 

<a id="_Toc103349253"></a>Tên Usecase

<a id="_Toc103349254"></a>Thiết đặt mô hình AI chung cho toàn bộ phần tóm tắt\.

 <a id="_Toc103349255"></a>Tác nhân

<a id="_Toc103349256"></a>Admin

 <a id="_Toc103349257"></a>Mô tả

<a id="_Toc103349258"></a>Hiển thị thông tin về cấu hình tóm tắt văn bản mặc định cho toàn bộ người dùng của hệ thống

<a id="_Toc103349259"></a>Sự kiện kích hoạt

<a id="_Toc103349260"></a>Kích vào chức năng Cấu hình tóm tắt văn bản trong menu Cấu hình hệ thống

 <a id="_Toc103349261"></a>Tiền điều kiện

<a id="_Toc103349262"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349263"></a>Luồng sự kiện chính

<a id="_Toc103349264"></a>STT

<a id="_Toc103349265"></a>Tác nhân 

<a id="_Toc103349266"></a>Hệ thống

<a id="_Toc103349267"></a>1

<a id="_Toc103349268"></a>Thiết lập các tham số mặc định khi thực hiện khi

- tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; 
- tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể\.

<a id="_Toc103349269"></a>Phạm vi áp dụng: kích vào ô chọn có áp dụng ghi đè lên tất cả cấu hình tham số của người dùng hay chỉ cho những người dùng mặc định chưa thay đổi các tham số này\.

<a id="_Toc103349270"></a>Hiển thị thông tin theo lựa chọn

<a id="_Toc103349271"></a>2

<a id="_Toc103349272"></a>Xác nhận thiết đặt cấu hình \(kích nút Lưu trên giao diện hệ thống\)

<a id="_Toc103349273"></a>Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện\.

<a id="_Toc103349274"></a>Luồng sự kiện phụ

<a id="_Toc103349275"></a>2a

<a id="_Toc103349276"></a>Hiển thị lại thông tin thiết đặt hiện tại trong CSDL \(kích nút Hủy trên giao diện\)

<a id="_Toc103349277"></a>Hiển thị các thông số hiện tại trong CSDL

<a id="_Toc103349278"></a>Hậu điều kiện

<a id="_Toc103349279"></a>Dữ liệu được cập nhật trên hệ thống

1. Sao lưu, phục hồi dữ liệu

 <a id="_Toc103349280"></a>Mã Use case

 <a id="_Toc103349281"></a>UC 077 – UC 081

<a id="_Toc103349282"></a>Tên Usecase

<a id="_Toc103349283"></a>Quản lý việc sao lưu và khôi phục dữ liệu

 <a id="_Toc103349284"></a>Tác nhân

<a id="_Toc103349285"></a>Admin

 <a id="_Toc103349286"></a>Mô tả

<a id="_Toc103349287"></a>Cho phép quản trị viên thiết đặt định kỳ sao lưu dữ liệu và hệ thống file

<a id="_Toc103349288"></a>Sự kiện kích hoạt

<a id="_Toc103349289"></a>Kích vào chức năng Sao lưu, khôi phục dữ liệu trong menu Cấu hình hệ thống

 <a id="_Toc103349290"></a>Tiền điều kiện

<a id="_Toc103349291"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349292"></a>*Xem danh sách các lần sao lưu \(*UC 077*\)*

<a id="_Toc103349293"></a>Luồng sự kiện chính

<a id="_Toc103349294"></a>STT

<a id="_Toc103349295"></a>Tác nhân 

<a id="_Toc103349296"></a>Hệ thống

<a id="_Toc103349297"></a>1

<a id="_Toc103349298"></a>Hiển thị danh sách các lần sao lưu dữ liệu của các admin

<a id="_Toc103349299"></a>*Sao lưu dữ liệu tự động \(*UC 078*\)*

<a id="_Toc103349300"></a>Luồng sự kiện chính

<a id="_Toc103349301"></a>1

<a id="_Toc103349302"></a>Lựa chọn sao lưu tự động \(mặc định của hệ thống\)

<a id="_Toc103349303"></a>Thiết đặt các thông tin sao lưu dữ liệu: Định kỳ sao lưu, thời gian, tùy chọn sao lưu\.

<a id="_Toc103349304"></a>Hiển thị các lựa chọn\.

<a id="_Toc103349305"></a>Tự động sao lưu dữ liệu theo các thiết đặt của admin\.

<a id="_Toc103349306"></a>*Sao lưu dữ liệu thủ công \(*UC 079*\)*

<a id="_Toc103349307"></a>Luồng sự kiện chính

<a id="_Toc103349308"></a>1

<a id="_Toc103349309"></a>Lựa chọn sao lưu thủ công\. 

<a id="_Toc103349310"></a>Thực hiện thêm mới lần sao lưu\.

<a id="_Toc103349311"></a>Hiển thị các tùy chọn sao lưu

<a id="_Toc103349312"></a>2

<a id="_Toc103349313"></a>Lựa chọn tùy chọn phù hợp, xác nhận sao lưu\.

<a id="_Toc103349314"></a>Thực hiện sao lưu theo tùy chọn\. Ghi lại thông tin sao lưu\.

<a id="_Toc103349315"></a>Luồng sự kiện thay thế

<a id="_Toc103349316"></a>2a

<a id="_Toc103349317"></a>Không xác nhận sao lưu

<a id="_Toc103349318"></a>Không thực hiện sao lưu

<a id="_Toc103349319"></a>*Xóa bản sao lưu \(*UC 080*\)*

<a id="_Toc103349320"></a>Luồng sự kiện chính

<a id="_Toc103349321"></a>1

<a id="_Toc103349322"></a>Đưa yêu cầu xóa bản sao lưu

<a id="_Toc103349323"></a>Yêu cầu người dùng xác nhận có xóa thực sự hay không?

<a id="_Toc103349324"></a>2

<a id="_Toc103349325"></a>Xác nhận xóa

<a id="_Toc103349326"></a>Xóa bản sao lưu trên hệ thống

<a id="_Toc103349327"></a>Luồng sự kiện thay thế

<a id="_Toc103349328"></a>2a

<a id="_Toc103349329"></a>Không xác nhận xóa

<a id="_Toc103349330"></a>Không thực hiện xóa\.

<a id="_Toc103349331"></a>*Khôi phục dữ liệu \(*UC 081*\)*

<a id="_Toc103349332"></a>Luồng sự kiện chính

<a id="_Toc103349333"></a>1

<a id="_Toc103349334"></a>Đưa yêu cầu khôi phục dữ liệu

<a id="_Toc103349335"></a>Yêu cầu người dùng có thực sự khôi phục theo bản dữ liệu đó

<a id="_Toc103349336"></a>2

<a id="_Toc103349337"></a>Xác nhận khôi phục

<a id="_Toc103349338"></a>Khôi phục dữ liệu hệ thống theo dữ liệu trong bản sao lưu

<a id="_Toc103349339"></a>Luồng sự kiện thay thế

<a id="_Toc103349340"></a>2a

<a id="_Toc103349341"></a>Không xác nhận khôi phục

<a id="_Toc103349342"></a>Không thực hiện khôi phục, hệ thống giữ nguyên dữ liệu và file hiện tại\.

<a id="_Toc103349343"></a>Hậu điều kiện

<a id="_Toc103349344"></a>Dữ liệu được cập nhật trên hệ thống

1. <a id="_Toc103349345"></a>Cấu hình quản lý văn bản

 Mã Use case

 UC 082 

Tên Usecase

Thiết đặt cấu hình chung cho quản lý văn bản \(file/thư mục\)\.

 Tác nhân

Admin

 Mô tả

Hiển thị thông tin về cấu hình quản lý văn bản cho toàn bộ người dùng của hệ thống

Sự kiện kích hoạt

Kích vào chức năng Cấu hình quản lý văn bản trong menu Cấu hình hệ thống

 Tiền điều kiện

Tác nhân đã đăng nhập thành công trên hệ thống

Luồng sự kiện chính

STT

Tác nhân 

Hệ thống

1

Thiết lập các tham số mặc định khi thực hiện khi làm việc với vùng lưu trữ của người dùng: kích thước tối đa của file khi tải lên vùng lưu trữ \(MB\), dung lượng lưu trữ mặc định \(GB\) khi cấp phát cho người dùng\. 

Giao diện thay đổi theo giá trị nhập vào\.

2

Xác nhận thiết đặt cấu hình \(kích nút Lưu trên giao diện hệ thống\)

Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện\.

Luồng sự kiện phụ

2a

Hiển thị lại thông tin thiết đặt hiện tại trong CSDL \(kích nút Hủy trên giao diện\)

Hiển thị các thông số hiện tại trong CSDL

Hậu điều kiện

Dữ liệu được cập nhật trên hệ thống

__3\.3\.4 Use cases riêng cho Cục trưởng__

<a id="_heading=h.61ii9r9yiv7f"></a>a\. Giao cán bộ phụ trách

 <a id="_Toc103349346"></a>Mã Use case

 <a id="_Toc103349347"></a>__UC 083 – UC 085__

<a id="_Toc103349348"></a>Tên Usecase

<a id="_Toc103349349"></a>Thiết lập quản lý người dùng cấp dưới

 <a id="_Toc103349350"></a>Tác nhân

<a id="_Toc103349351"></a>Cục trưởng

 <a id="_Toc103349352"></a>Mô tả

<a id="_Toc103349353"></a>Cho phép Cục trưởng thiết lập danh sách người dùng cấp dưới mình trực tiếp quản lý\.

<a id="_Toc103349354"></a>Sự kiện kích hoạt

<a id="_Toc103349355"></a>Kích chọn chức năng Giao cán bộ phụ trách

<a id="_Toc103349356"></a>Tiền điều kiện

<a id="_Toc103349357"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349358"></a>*Xem  danh sách cấp dưới do mình quản lý  \(UC 083\)*

<a id="_Toc103349359"></a>Luồng sự kiện chính

<a id="_Toc103349360"></a>STT

<a id="_Toc103349361"></a>Tác nhân 

<a id="_Toc103349362"></a>Hệ thống

<a id="_Toc103349363"></a>1

<a id="_Toc103349364"></a>Hiển thị danh sách cấp dưới do mình quản lý: Các Cục phó & đơn vị phụ trách\.

<a id="_Toc103349365"></a>*Thêm thông tin quản lý cấp dưới \(UC 084\)*

<a id="_Toc103349366"></a>Luồng sự kiện chính

<a id="_Toc103349367"></a>1

<a id="_Toc103349368"></a>Đưa yêu cầu thêm mới

<a id="_Toc103349369"></a>Hiển thị giao diện thêm cấp dưới quản lý

<a id="_Toc103349370"></a>2

<a id="_Toc103349371"></a>Đưa thông tin về: người quản lý \(Cục phó\), đơn vị quản lý\.

<a id="_Toc103349372"></a>Hiển thị theo lựa chọn của người dùng

<a id="_Toc103349373"></a>3

<a id="_Toc103349374"></a>Xác nhận lưu thông tin

<a id="_Toc103349375"></a>Lưu thông tin và thông báo lưu thành công

<a id="_Toc103349376"></a>Luồng sự kiện thay thế

<a id="_Toc103349377"></a>3a

<a id="_Toc103349378"></a>Không xác nhận lưu

<a id="_Toc103349379"></a>Không lưu lại thông tin

<a id="_Toc103349380"></a>*Thay đổi thông tin quản lý cấp dưới \(UC 085\)*

<a id="_Toc103349381"></a>Luồng sự kiện chính

<a id="_Toc103349382"></a>1

<a id="_Toc103349383"></a>Đưa yêu cầu sửa thông tin

<a id="_Toc103349384"></a>Hiển thị giao diện sửa thông tin cấp dưới quản lý

<a id="_Toc103349385"></a>2

<a id="_Toc103349386"></a>Thay đổi thông tin về: người quản lý \(Cục phó\), các đơn vị quản lý\.

<a id="_Toc103349387"></a>Hiển thị theo lựa chọn của người dùng

<a id="_Toc103349388"></a>3

<a id="_Toc103349389"></a>Xác nhận lưu thông tin

<a id="_Toc103349390"></a>Lưu thông tin và thông báo sửa thành công

<a id="_Toc103349391"></a>Luồng sự kiện thay thế

<a id="_Toc103349392"></a>3a

<a id="_Toc103349393"></a>Không xác nhận lưu

<a id="_Toc103349394"></a>Không lưu lại thông tin

<a id="_Toc103349407"></a>Hậu điều kiện

<a id="_Toc103349408"></a>Dữ liệu được cập nhật trên hệ thống

 b\. Xem lịch sử hoạt động

 <a id="_Toc103349409"></a>Mã Use case

__ __<a id="_Toc103349410"></a>__UC 086__

<a id="_Toc103349411"></a>Tên Usecase

<a id="_Toc103349412"></a>Xem thống kê số lượng sử dụng hệ thống của đơn vị mình quản lý 

 <a id="_Toc103349413"></a>Tác nhân

<a id="_Toc103349414"></a>Cục trưởng

 <a id="_Toc103349415"></a>Mô tả

<a id="_Toc103349416"></a>Xem thống kê lịch sử hoạt động của các đơn vị do mình quản lý

<a id="_Toc103349417"></a>Sự kiện kích hoạt

<a id="_Toc103349418"></a>Kích vào chức năng Lịch sử hoạt động

 <a id="_Toc103349419"></a>Tiền điều kiện

<a id="_Toc103349420"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349421"></a>Luồng sự kiện chính

<a id="_Toc103349422"></a>STT

<a id="_Toc103349423"></a>Tác nhân 

<a id="_Toc103349424"></a>Hệ thống

<a id="_Toc103349425"></a>1

<a id="_Toc103349426"></a>Lựa chọn thời gian khoảng thời gian muốn thống kê, kiểu biểu đồ hiển thị\.

<a id="_Toc103349427"></a>Hiển thị biểu đồ thống kê & bảng kết quả bao gồm: tổng số lần đăng nhập, số lần upload, số lần download, số lần thực hiện tóm tắt theo từng phòng ban do Cục quản lý\. Sau khi kích vào từng phòng ban nội dung sẽ hiển thị như UC 094

<a id="_Toc103349428"></a>Luồng sự kiện phụ

<a id="_Toc103349429"></a>1a

<a id="_Toc103349430"></a>Không lựa chọn thời gian

<a id="_Toc103349431"></a>Không hiển thị biểu đồ

c\. Cấu hình tóm tắt văn bản

 <a id="_Toc103349432"></a>Mã Use case

 <a id="_Toc103349433"></a>__UC 087__

<a id="_Toc103349434"></a>Tên Usecase

<a id="_Toc103349435"></a>Thiết đặt tham số mô hình AI cho phần tóm tắt của Cục trưởng

 <a id="_Toc103349436"></a>Tác nhân

<a id="_Toc103349437"></a>Cục trưởng

 <a id="_Toc103349438"></a>Mô tả

<a id="_Toc103349439"></a>Thiết đặt thông tin về cấu hình tóm tắt văn bản cho cá nhân mình

<a id="_Toc103349440"></a>Sự kiện kích hoạt

<a id="_Toc103349441"></a>Kích vào chức năng Cấu hình tóm tăt văn bản trong menu Cấu hình hệ thống

 <a id="_Toc103349442"></a>Tiền điều kiện

<a id="_Toc103349443"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349444"></a>Luồng sự kiện chính

<a id="_Toc103349445"></a>STT

<a id="_Toc103349446"></a>Tác nhân 

<a id="_Toc103349447"></a>Hệ thống

<a id="_Toc103349448"></a>1

<a id="_Toc103349449"></a>Thiết lập các tham số mặc định khi thực hiện tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể\.

<a id="_Toc103349450"></a>Hiển thị thông tin theo lựa chọn

<a id="_Toc103349451"></a>2

<a id="_Toc103349452"></a>Xác nhận thiết đặt cấu hình \(kích nút Lưu trên giao diện hệ thống\)

<a id="_Toc103349453"></a>Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện\. Các tham số được sử dụng cho các hoạt động tóm tắt của riêng người dùng\.

<a id="_Toc103349454"></a>Luồng sự kiện phụ

<a id="_Toc103349455"></a>2a

<a id="_Toc103349456"></a>Hiển thị lại thông tin thiết đặt hiện tại trong CSDL \(kích nút Hủy trên giao diện\)

<a id="_Toc103349457"></a>Hiển thị các thông số hiện tại trong CSDL

<a id="_Toc103349458"></a>Hậu điều kiện

<a id="_Toc103349459"></a>Dữ liệu được cập nhật trên hệ thống

<a id="_Toc103349460"></a>__3\.3\.5 Use cases riêng cho Cục phó__

1. Xem lịch sử hoạt động

 <a id="_Toc103349461"></a>Mã Use case

 <a id="_Toc103349462"></a>__UC 088__

<a id="_Toc103349463"></a>Tên Usecase

<a id="_Toc103349464"></a>Xem thống kê số lượng sử dụng hệ thống của đơn vị mình quản lý 

 <a id="_Toc103349465"></a>Tác nhân

<a id="_Toc103349466"></a>Cục phó

 <a id="_Toc103349467"></a>Mô tả

<a id="_Toc103349468"></a>Xem thống kê lịch sử hoạt động của các đơn vị do mình quản lý

<a id="_Toc103349469"></a>Sự kiện kích hoạt

<a id="_Toc103349470"></a>Kích vào chức năng Lịch sử hoạt động

 <a id="_Toc103349471"></a>Tiền điều kiện

<a id="_Toc103349472"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349473"></a>Luồng sự kiện chính

<a id="_Toc103349474"></a>STT

<a id="_Toc103349475"></a>Tác nhân 

<a id="_Toc103349476"></a>Hệ thống

<a id="_Toc103349477"></a>1

<a id="_Toc103349478"></a>Lựa chọn thời gian khoảng thời gian muốn thống kê, kiểu biểu đồ hiển thị\.

<a id="_Toc103349479"></a>Hiển thị biểu đồ thống kê & bảng kết quả bao gồm: tổng số lần đăng nhập, số lần upload, số lần download, số lần thực hiện tóm tắt theo từng phòng ban được giao quản lý\. Sau khi kích vào từng phòng ban nội dung sẽ hiển thị như UC 094

<a id="_Toc103349480"></a>Luồng sự kiện phụ

<a id="_Toc103349481"></a>1a

<a id="_Toc103349482"></a>Không lựa chọn thời gian

<a id="_Toc103349483"></a>Không hiển thị biểu đồ

1. Thiết đặt cấu hình tóm tắt văn bản

 <a id="_Toc103349484"></a>Mã Use case

 <a id="_Toc103349485"></a>__UC 089__

<a id="_Toc103349486"></a>Tên Usecase

<a id="_Toc103349487"></a>Thiết đặt tham số mô hình AI chung cho phần tóm tắt\.

 <a id="_Toc103349488"></a>Tác nhân

<a id="_Toc103349489"></a>Cục phó

 <a id="_Toc103349490"></a>Mô tả

<a id="_Toc103349491"></a>Thiết đặt thông tin về cấu hình tóm tắt văn bản cho cá nhân mình

<a id="_Toc103349492"></a>Sự kiện kích hoạt

<a id="_Toc103349493"></a>Kích vào chức năng Cấu hình tóm tăt văn bản trong menu Cấu hình hệ thống

 <a id="_Toc103349494"></a>Tiền điều kiện

<a id="_Toc103349495"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349496"></a>Luồng sự kiện chính

<a id="_Toc103349497"></a>STT

<a id="_Toc103349498"></a>Tác nhân 

<a id="_Toc103349499"></a>Hệ thống

<a id="_Toc103349500"></a>1

<a id="_Toc103349501"></a>Thiết lập các tham số mặc định khi thực hiện tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể\.

<a id="_Toc103349502"></a>Hiển thị thông tin theo lựa chọn

<a id="_Toc103349503"></a>2

<a id="_Toc103349504"></a>Xác nhận thiết đặt cấu hình \(kích nút Lưu trên giao diện hệ thống\)

<a id="_Toc103349505"></a>Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện\. Các tham số được sử dụng cho các hoạt động tóm tắt của riêng người dùng\.

<a id="_Toc103349506"></a>Luồng sự kiện phụ

<a id="_Toc103349507"></a>2a

<a id="_Toc103349508"></a>Hiển thị lại thông tin thiết đặt hiện tại trong CSDL \(kích nút Hủy trên giao diện\)

<a id="_Toc103349509"></a>Hiển thị các thông số hiện tại trong CSDL

<a id="_Toc103349510"></a>Hậu điều kiện

<a id="_Toc103349511"></a>Dữ liệu được cập nhật trên hệ thống

<a id="_Toc103349512"></a>__3\.3\.6 Use cases riêng cho Trưởng phòng__

a\. Giao cán bộ phụ trách

 <a id="_Toc103349513"></a>Mã Use case

__ __<a id="_Toc103349514"></a>__UC 090 – UC 092__

<a id="_Toc103349515"></a>Tên Usecase

<a id="_Toc103349516"></a>Thiết lập phụ trách người dùng cấp dưới

 <a id="_Toc103349517"></a>Tác nhân

<a id="_Toc103349518"></a>Trưởng phòng

 <a id="_Toc103349519"></a>Mô tả

<a id="_Toc103349520"></a>Cho phép trưởng phòng thiết lập danh sách người dùng cấp dưới mình trực tiếp quản lý\.

<a id="_Toc103349521"></a>Sự kiện kích hoạt

<a id="_Toc103349522"></a>Kích chọn chức năng Giao cán bộ phụ trách

<a id="_Toc103349523"></a>Tiền điều kiện

<a id="_Toc103349524"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349525"></a>*Xem  danh sách cấp dưới do mình quản lý \(UC 090\)*

<a id="_Toc103349526"></a>Luồng sự kiện chính

<a id="_Toc103349527"></a>STT

<a id="_Toc103349528"></a>Tác nhân 

<a id="_Toc103349529"></a>Hệ thống

<a id="_Toc103349530"></a>1

<a id="_Toc103349531"></a>Hiển thị danh sách cấp dưới do mình quản lý: Các phó phòng & nhân viên phụ trách\.

<a id="_Toc103349532"></a>*Thêm thông tin quản lý cho cấp dưới \(UC 091\)*

<a id="_Toc103349533"></a>Luồng sự kiện chính

<a id="_Toc103349534"></a>1

<a id="_Toc103349535"></a>Đưa yêu cầu thêm mới

<a id="_Toc103349536"></a>Hiển thị giao diện thêm cấp dưới quản lý

<a id="_Toc103349537"></a>2

<a id="_Toc103349538"></a>Đưa thông tin về: cán bộ phụ trách \(phó phòng\), cán bộ được quản lý\.

<a id="_Toc103349539"></a>Hiển thị theo lựa chọn của người dùng

<a id="_Toc103349540"></a>3

<a id="_Toc103349541"></a>Xác nhận lưu thông tin

<a id="_Toc103349542"></a>Lưu thông tin và thông báo lưu thành công

<a id="_Toc103349543"></a>Luồng sự kiện thay thế

<a id="_Toc103349544"></a>3a

<a id="_Toc103349545"></a>Không xác nhận lưu

<a id="_Toc103349546"></a>Không lưu lại thông tin

<a id="_Toc103349547"></a>*Thay đổi thông tin quản lý cấp dưới \(UC 092\)*

<a id="_Toc103349548"></a>Luồng sự kiện chính

<a id="_Toc103349549"></a>1

<a id="_Toc103349550"></a>Đưa yêu cầu sửa thông tin

<a id="_Toc103349551"></a>Hiển thị giao diện sửa thông tin cấp dưới quản lý

<a id="_Toc103349552"></a>2

<a id="_Toc103349553"></a>Thay đổi thông tin về: người quản lý \(phó phòng\), các cán bộ được quản lý\.

<a id="_Toc103349554"></a>Hiển thị theo lựa chọn của người dùng

<a id="_Toc103349555"></a>3

<a id="_Toc103349556"></a>Xác nhận lưu thông tin

<a id="_Toc103349557"></a>Lưu thông tin và thông báo sửa thành công

<a id="_Toc103349558"></a>Luồng sự kiện thay thế

<a id="_Toc103349559"></a>3a

<a id="_Toc103349560"></a>Không xác nhận lưu

<a id="_Toc103349561"></a>Không lưu lại thông tin

<a id="_Toc103349573"></a>Hậu điều kiện

<a id="_Toc103349574"></a>Dữ liệu được cập nhật trên hệ thống

 b\. Xem lịch sử hoạt động

 <a id="_Toc103349575"></a>Mã Use case

__ __<a id="_Toc103349576"></a>__UC 093__

<a id="_Toc103349577"></a>Tên Usecase

<a id="_Toc103349578"></a>Xem thống kê số lượng sử dụng hệ thống của đơn vị mình quản lý 

 <a id="_Toc103349579"></a>Tác nhân

<a id="_Toc103349580"></a>Trưởng phòng

 <a id="_Toc103349581"></a>Mô tả

<a id="_Toc103349582"></a>Xem thống kê lịch sử hoạt động của nhân viên trong đơn vị do mình quản lý

<a id="_Toc103349583"></a>Sự kiện kích hoạt

<a id="_Toc103349584"></a>Kích vào chức năng Lịch sử hoạt động

 <a id="_Toc103349585"></a>Tiền điều kiện

<a id="_Toc103349586"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349587"></a>Luồng sự kiện chính

<a id="_Toc103349588"></a>STT

<a id="_Toc103349589"></a>Tác nhân 

<a id="_Toc103349590"></a>Hệ thống

<a id="_Toc103349591"></a>1

<a id="_Toc103349592"></a>Lựa chọn thời gian khoảng thời gian muốn thống kê, kiểu biểu đồ hiển thị\.

<a id="_Toc103349593"></a>Hiển thị biểu đồ thống kê & bảng kết quả bao gồm: tổng số lần đăng nhập, số lần upload, số lần download, số lần thực hiện tóm tắt theo từng nhân viên do phòng quản lý\. Sau khi kích vào từng nhân viên nội dung sẽ hiển thị như UC 098 

<a id="_Toc103349594"></a>Luồng sự kiện phụ

<a id="_Toc103349595"></a>1a

<a id="_Toc103349596"></a>Không lựa chọn thời gian

<a id="_Toc103349597"></a>Không hiển thị biểu đồ

c\. Thiết đặt cấu hình tóm tắt văn bản

 <a id="_Toc103349598"></a>Mã Use case

 <a id="_Toc103349599"></a>__UC 094__

<a id="_Toc103349600"></a>Tên Usecase

<a id="_Toc103349601"></a>Thiết đặt tham số mô hình AI cho phần tóm tắt\.

 <a id="_Toc103349602"></a>Tác nhân

<a id="_Toc103349603"></a>Trưởng phòng

 <a id="_Toc103349604"></a>Mô tả

<a id="_Toc103349605"></a>Thiết đặt thông tin về cấu hình tóm tắt văn bản cho cá nhân mình

<a id="_Toc103349606"></a>Sự kiện kích hoạt

<a id="_Toc103349607"></a>Kích vào chức năng Cấu hình tóm tăt văn bản trong menu Cấu hình hệ thống

 <a id="_Toc103349608"></a>Tiền điều kiện

<a id="_Toc103349609"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349610"></a>Luồng sự kiện chính

<a id="_Toc103349611"></a>STT

<a id="_Toc103349612"></a>Tác nhân 

<a id="_Toc103349613"></a>Hệ thống

<a id="_Toc103349614"></a>1

<a id="_Toc103349615"></a>Thiết lập các tham số mặc định khi thực hiện tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể\.

<a id="_Toc103349616"></a>Hiển thị thông tin theo lựa chọn

<a id="_Toc103349617"></a>2

<a id="_Toc103349618"></a>Xác nhận thiết đặt cấu hình \(kích nút Lưu trên giao diện hệ thống\)

<a id="_Toc103349619"></a>Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện\. Các tham số được sử dụng cho các hoạt động tóm tắt của riêng người dùng\.

<a id="_Toc103349620"></a>Luồng sự kiện phụ

<a id="_Toc103349621"></a>2a

<a id="_Toc103349622"></a>Hiển thị lại thông tin thiết đặt hiện tại trong CSDL \(kích nút Hủy trên giao diện\)

<a id="_Toc103349623"></a>Hiển thị các thông số hiện tại trong CSDL

<a id="_Toc103349624"></a>Hậu điều kiện

<a id="_Toc103349625"></a>Dữ liệu được cập nhật trên hệ thống

<a id="_Toc103349626"></a>__3\.3\.7 Use cases riêng cho Phó phòng__

a\. Xem lịch sử hoạt động

 <a id="_Toc103349627"></a>Mã Use case

__ __<a id="_Toc103349628"></a>__UC 095__

<a id="_Toc103349629"></a>Tên Usecase

<a id="_Toc103349630"></a>Xem thống kê số lượng sử dụng hệ thống của nhân viên mình quản lý 

 <a id="_Toc103349631"></a>Tác nhân

<a id="_Toc103349632"></a>Phó phòng

 <a id="_Toc103349633"></a>Mô tả

<a id="_Toc103349634"></a>Xem thống kê lịch sử hoạt động của các nhân viên do mình quản lý

<a id="_Toc103349635"></a>Sự kiện kích hoạt

<a id="_Toc103349636"></a>Kích vào chức năng Lịch sử hoạt động

 <a id="_Toc103349637"></a>Tiền điều kiện

<a id="_Toc103349638"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349639"></a>Luồng sự kiện chính

<a id="_Toc103349640"></a>STT

<a id="_Toc103349641"></a>Tác nhân 

<a id="_Toc103349642"></a>Hệ thống

<a id="_Toc103349643"></a>1

<a id="_Toc103349644"></a>Lựa chọn thời gian khoảng thời gian muốn thống kê, kiểu biểu đồ hiển thị\.

<a id="_Toc103349645"></a>Hiển thị biểu đồ thống kê & bảng kết quả bao gồm: tổng số lần đăng nhập, số lần upload, số lần download, số lần thực hiện tóm tắt theo từng nhân viên được giao quản lý\. Sau khi kích vào từng nhân viên nội dung sẽ hiển thị như UC 098 

<a id="_Toc103349646"></a>Luồng sự kiện phụ

<a id="_Toc103349647"></a>1a

<a id="_Toc103349648"></a>Không lựa chọn thời gian

<a id="_Toc103349649"></a>Không hiển thị biểu đồ

b\. Thiết đặt cấu hình tóm tắt văn bản

 <a id="_Toc103349650"></a>Mã Use case

__ __<a id="_Toc103349651"></a>__UC 096__

<a id="_Toc103349652"></a>Tên Usecase

<a id="_Toc103349653"></a>Thiết đặt tham số mô hình AI cho phần tóm tắt\.

 <a id="_Toc103349654"></a>Tác nhân

<a id="_Toc103349655"></a>Phó phòng

 <a id="_Toc103349656"></a>Mô tả

<a id="_Toc103349657"></a>Thiết đặt thông tin về cấu hình tóm tắt văn bản cho cá nhân mình

<a id="_Toc103349658"></a>Sự kiện kích hoạt

<a id="_Toc103349659"></a>Kích vào chức năng Cấu hình tóm tăt văn bản trong menu Cấu hình hệ thống

 <a id="_Toc103349660"></a>Tiền điều kiện

<a id="_Toc103349661"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349662"></a>Luồng sự kiện chính

<a id="_Toc103349663"></a>STT

<a id="_Toc103349664"></a>Tác nhân 

<a id="_Toc103349665"></a>Hệ thống

<a id="_Toc103349666"></a>1

<a id="_Toc103349667"></a>Thiết lập các tham số mặc định khi thực hiện tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể\.

<a id="_Toc103349668"></a>Hiển thị thông tin theo lựa chọn

<a id="_Toc103349669"></a>2

<a id="_Toc103349670"></a>Xác nhận thiết đặt cấu hình \(kích nút Lưu trên giao diện hệ thống\)

<a id="_Toc103349671"></a>Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện\. Các tham số được sử dụng cho các hoạt động tóm tắt của riêng người dùng\.

<a id="_Toc103349672"></a>Luồng sự kiện phụ

<a id="_Toc103349673"></a>2a

<a id="_Toc103349674"></a>Hiển thị lại thông tin thiết đặt hiện tại trong CSDL \(kích nút Hủy trên giao diện\)

<a id="_Toc103349675"></a>Hiển thị các thông số hiện tại trong CSDL

<a id="_Toc103349676"></a>Hậu điều kiện

<a id="_Toc103349677"></a>Dữ liệu được cập nhật trên hệ thống

<a id="_Toc103349678"></a>3\.3\.8 __Use cases riêng cho Chuyên viên__

a\.  Xem lịch sử hoạt động

 <a id="_Toc103349679"></a>Mã Use case

 <a id="_Toc103349680"></a>__UC 097__

<a id="_Toc103349681"></a>Tên Usecase

<a id="_Toc103349682"></a>Xem thống kê số lượng sử dụng hệ thống của mình

 <a id="_Toc103349683"></a>Tác nhân

<a id="_Toc103349684"></a>Chuyên viên

 <a id="_Toc103349685"></a>Mô tả

<a id="_Toc103349686"></a>Xem thống kê lịch sử hoạt động của mình

<a id="_Toc103349687"></a>Sự kiện kích hoạt

<a id="_Toc103349688"></a>Kích vào chức năng Lịch sử hoạt động

<a id="_Toc103349689"></a>Tiền điều kiện

<a id="_Toc103349690"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349691"></a>Luồng sự kiện chính

<a id="_Toc103349692"></a>STT

<a id="_Toc103349693"></a>Tác nhân 

<a id="_Toc103349694"></a>Hệ thống

<a id="_Toc103349695"></a>1

<a id="_Toc103349696"></a>Lựa chọn thời gian khoảng thời gian muốn thống kê\.

<a id="_Toc103349697"></a>Hiển thị bảng thông tin về hoạt động của tài khoản: thời gian, từ địa chỉ IP nào, thực hiện hoạt động gì, mô tả cụ thể\. 

<a id="_Toc103349698"></a>Luồng sự kiện phụ

<a id="_Toc103349699"></a>1a

<a id="_Toc103349700"></a>Không lựa chọn thời gian

<a id="_Toc103349701"></a>Không hiển thị bảng thông tin

<a id="_Toc103349702"></a>Hậu điều kiện

<a id="_Toc103349703"></a>Không thay đổi dữ liệu

b\. Cấu hình tóm tắt văn bản

 <a id="_Toc103349704"></a>Mã Use case

 <a id="_Toc103349705"></a>UC 098

<a id="_Toc103349706"></a>Tên Usecase

<a id="_Toc103349707"></a>Thiết đặt tham sô mô hình AI cho phần tóm tắt\.

 <a id="_Toc103349708"></a>Tác nhân

<a id="_Toc103349709"></a>Chuyên viên

 <a id="_Toc103349710"></a>Mô tả

<a id="_Toc103349711"></a>Thiết đặt thông tin về cấu hình tóm tắt văn bản cho cá nhân mình

<a id="_Toc103349712"></a>Sự kiện kích hoạt

<a id="_Toc103349713"></a>Kích vào chức năng Cấu hình tóm tăt văn bản trong menu Cấu hình hệ thống

 <a id="_Toc103349714"></a>Tiền điều kiện

<a id="_Toc103349715"></a>Tác nhân đã đăng nhập thành công trên hệ thống

<a id="_Toc103349716"></a>Luồng sự kiện chính

<a id="_Toc103349717"></a>STT

<a id="_Toc103349718"></a>Tác nhân 

<a id="_Toc103349719"></a>Hệ thống

<a id="_Toc103349720"></a>1

<a id="_Toc103349721"></a>Thiết lập các tham số mặc định khi thực hiện tóm tắt đơn văn bản: chọn thuật toán trích rút, chọn thuật toán tóm lược, chọn phần trăm mặc định khi tóm tắt; tóm tắt đa văn bản: thuật toán tóm tắt, thuật toán phân cụm, phần trăm mặc định; thuật toán trích rút từ khóa, thuật toán trích rút thực thể\.

<a id="_Toc103349722"></a>Hiển thị thông tin theo lựa chọn

<a id="_Toc103349723"></a>2

<a id="_Toc103349724"></a>Xác nhận thiết đặt cấu hình \(kích nút Lưu trên giao diện hệ thống\)

<a id="_Toc103349725"></a>Thông báo thiết đặt thành công, các tham số được lưu lại trong CSDL và hiển thị ngay trên giao diện\. Các tham số được sử dụng cho các hoạt động tóm tắt của riêng người dùng\.

<a id="_Toc103349726"></a>Luồng sự kiện phụ

<a id="_Toc103349727"></a>2a

<a id="_Toc103349728"></a>Hiển thị lại thông tin thiết đặt hiện tại trong CSDL \(kích nút Hủy trên giao diện\)

<a id="_Toc103349729"></a>Hiển thị các thông số hiện tại trong CSDL

<a id="_Toc103349730"></a>Hậu điều kiện

<a id="_Toc103349731"></a>Dữ liệu được cập nhật trên hệ thống

