/*
  Replace the generated SEED720 demo phrases with a curated TOEIC vocabulary set.
  -------------------------------------------------------------------------------
  - Removes only legacy synthetic words linked to SEED720 topics.
  - Seeds 600 real vocabulary terms: 12 topics x 50 terms.
  - Rebuilds examples, shuffled MCQ options, mini-test items and demo learner data.
  - Leaves content outside the SEED720 topic group untouched.
  - Idempotent after the repair has been applied.

  Run with UTF-8 input:
    sqlcmd -S . -E -b -f 65001 -i Database\repair_seed_vocabulary_learning_curated.sql
*/

USE [ToeicVocabularyPlatform];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;

DECLARE @Now DATETIMEOFFSET(7) = SYSDATETIMEOFFSET();
DECLARE @AuthorID BIGINT;
DECLARE @ReviewerID BIGINT;
DECLARE @LearnerID BIGINT;
DECLARE @NounPartOfSpeechID INT;

SELECT TOP (1) @AuthorID = UserID
FROM dbo.Users
WHERE IsActive = 1
ORDER BY CASE UserRole WHEN N'Admin' THEN 1 WHEN N'ContentCreator' THEN 2 ELSE 3 END, UserID;

SELECT TOP (1) @ReviewerID = UserID
FROM dbo.Users
WHERE IsActive = 1 AND UserRole = N'Admin'
ORDER BY UserID;

SELECT TOP (1) @LearnerID = UserID
FROM dbo.Users
WHERE IsActive = 1 AND UserRole = N'Learner'
ORDER BY UserID;

SELECT TOP (1) @NounPartOfSpeechID = PartOfSpeechID
FROM dbo.PartOfSpeeches
WHERE LOWER(PartOfSpeechCode) IN (N'n', N'noun')
   OR LOWER(PartOfSpeechName) = N'noun'
ORDER BY CASE WHEN LOWER(PartOfSpeechCode) = N'n' THEN 1 ELSE 2 END, PartOfSpeechID;

IF @AuthorID IS NULL
    THROW 50101, N'Cần ít nhất một user active để tạo nội dung.', 1;

IF @ReviewerID IS NULL
    SET @ReviewerID = @AuthorID;

IF @NounPartOfSpeechID IS NULL
    THROW 50102, N'Không tìm thấy PartOfSpeeches cho noun.', 1;

BEGIN TRY
    BEGIN TRANSACTION;

    CREATE TABLE #SeedTopics
    (
        TopicOrder       INT NOT NULL,
        TopicCode        NVARCHAR(50) NOT NULL,
        TopicName        NVARCHAR(200) NOT NULL,
        ContextLabel     NVARCHAR(100) NOT NULL,
        ContextLabelVi   NVARCHAR(100) NOT NULL,
        DifficultyLevel  TINYINT NOT NULL
    );

    INSERT #SeedTopics (TopicOrder, TopicCode, TopicName, ContextLabel, ContextLabelVi, DifficultyLevel)
    VALUES
        (1,  N'SEED720-OFFICE',       N'Office Communication Essentials', N'office',                   N'văn phòng',                  1),
        (2,  N'SEED720-HR',           N'Human Resources & Recruitment',  N'human resources',          N'nhân sự',                    1),
        (3,  N'SEED720-SALES',        N'Sales & Marketing Basics',       N'sales and marketing',       N'bán hàng và marketing',      2),
        (4,  N'SEED720-FINANCE',      N'Finance & Accounting',           N'finance',                    N'tài chính',                   2),
        (5,  N'SEED720-CUSTOMER',     N'Customer Service Operations',    N'customer service',           N'dịch vụ khách hàng',         2),
        (6,  N'SEED720-TRAVEL',       N'Business Travel',                N'business travel',             N'công tác',                    2),
        (7,  N'SEED720-HOSPITALITY',  N'Hospitality & Events',           N'hospitality and events',      N'khách sạn và sự kiện',       3),
        (8,  N'SEED720-TECH',         N'Technology & Data',              N'technology',                  N'công nghệ',                   3),
        (9,  N'SEED720-LOGISTICS',    N'Logistics & Supply Chain',       N'logistics',                   N'logistics',                   3),
        (10, N'SEED720-PROJECT',      N'Project Management',             N'project management',          N'quản lý dự án',               4),
        (11, N'SEED720-COMPLIANCE',   N'Legal & Compliance',             N'legal compliance',            N'tuân thủ pháp lý',            4),
        (12, N'SEED720-PROFESSIONAL', N'Professional Development',       N'professional development',    N'phát triển nghề nghiệp',      4);

    IF (SELECT COUNT(*) FROM dbo.Topics WHERE TopicCode LIKE N'SEED720-%') <> 12
        THROW 50103, N'Hãy chạy seed_vocabulary_learning_720.sql trước khi chạy repair.', 1;

    CREATE TABLE #TopicVocabulary
    (
        TopicCode  NVARCHAR(50) NOT NULL,
        WordsJson  NVARCHAR(MAX) NOT NULL
    );

    INSERT #TopicVocabulary (TopicCode, WordsJson)
    VALUES
    (N'SEED720-OFFICE', N'[
      ["agenda","chương trình nghị sự"],["appointment","cuộc hẹn"],["announcement","thông báo"],["attachment","tệp đính kèm"],["brochure","tờ giới thiệu"],
      ["bulletin","bản tin"],["calendar","lịch"],["conference room","phòng họp"],["correspondence","thư từ"],["courier","dịch vụ chuyển phát"],
      ["cubicle","ô làm việc"],["directory","danh bạ"],["envelope","phong bì"],["extension number","số máy lẻ"],["fax machine","máy fax"],
      ["filing cabinet","tủ hồ sơ"],["folder","thư mục"],["headquarters","trụ sở"],["memo","bản ghi nhớ"],["meeting minutes","biên bản cuộc họp"],
      ["noticeboard","bảng thông báo"],["photocopier","máy photocopy"],["printer","máy in"],["reception desk","quầy lễ tân"],["receptionist","nhân viên lễ tân"],
      ["stationery","văn phòng phẩm"],["supervisor","người giám sát"],["workstation","chỗ làm việc"],["briefing","cuộc họp phổ biến"],["inbox","hộp thư đến"],
      ["signature","chữ ký"],["recipient","người nhận"],["sender","người gửi"],["mailroom","phòng thư"],["handout","tài liệu phát tay"],
      ["whiteboard","bảng trắng"],["projector","máy chiếu"],["venue","địa điểm"],["attendee","người tham dự"],["seminar","hội thảo"],
      ["workshop","hội thảo thực hành"],["refreshment","đồ ăn nhẹ"],["branch office","chi nhánh"],["department","phòng ban"],["colleague","đồng nghiệp"],
      ["shift","ca làm việc"],["annual leave","nghỉ phép năm"],["overtime","giờ làm thêm"],["workload","khối lượng công việc"],["deadline","hạn chót"]
    ]'),
    (N'SEED720-HR', N'[
      ["applicant","ứng viên nộp đơn"],["application form","đơn ứng tuyển"],["resume","sơ yếu lý lịch"],["candidate","ứng viên"],["vacancy","vị trí trống"],
      ["recruitment","việc tuyển dụng"],["interview","buổi phỏng vấn"],["interviewer","người phỏng vấn"],["orientation","buổi định hướng"],["probation","thời gian thử việc"],
      ["promotion","sự thăng chức"],["transfer","sự điều chuyển"],["resignation","sự từ chức"],["retirement","sự nghỉ hưu"],["salary","lương tháng"],
      ["wage","tiền công"],["payroll","bảng lương"],["bonus","tiền thưởng"],["allowance","phụ cấp"],["benefit","phúc lợi"],
      ["insurance","bảo hiểm"],["pension","lương hưu"],["attendance","sự có mặt"],["absence","sự vắng mặt"],["evaluation","sự đánh giá"],
      ["appraisal","đánh giá hiệu suất"],["qualification","trình độ chuyên môn"],["credential","chứng chỉ năng lực"],["reference","thư giới thiệu"],["employment contract","hợp đồng lao động"],
      ["workforce","lực lượng lao động"],["labor union","công đoàn"],["grievance","khiếu nại nội bộ"],["discipline","kỷ luật"],["dismissal","sự sa thải"],
      ["termination","sự chấm dứt hợp đồng"],["replacement","người thay thế"],["trainee","nhân viên tập sự"],["mentor","người hướng dẫn"],["intern","thực tập sinh"],
      ["internship","kỳ thực tập"],["certification","chứng nhận"],["experience","kinh nghiệm"],["skill","kỹ năng"],["expertise","chuyên môn"],
      ["diversity","sự đa dạng"],["morale","tinh thần làm việc"],["incentive","khoản khuyến khích"],["compensation","tiền bồi thường"],["personnel file","hồ sơ nhân sự"]
    ]'),
    (N'SEED720-SALES', N'[
      ["advertisement","quảng cáo"],["audience","khán giả mục tiêu"],["brand","thương hiệu"],["campaign","chiến dịch"],["catalog","danh mục sản phẩm"],
      ["client","khách hàng doanh nghiệp"],["competitor","đối thủ cạnh tranh"],["consumer","người tiêu dùng"],["coupon","phiếu giảm giá"],["demand","nhu cầu"],
      ["discount","chiết khấu"],["distributor","nhà phân phối"],["exhibition","triển lãm"],["forecast","dự báo"],["market share","thị phần"],
      ["merchandise","hàng hóa"],["outlet","điểm bán hàng"],["product package","bao bì sản phẩm"],["publicity","hoạt động quảng bá"],["purchase","giao dịch mua"],
      ["rebate","khoản hoàn giảm giá"],["retailer","nhà bán lẻ"],["revenue","doanh thu"],["sample","mẫu sản phẩm"],["slogan","khẩu hiệu"],
      ["sponsor","nhà tài trợ"],["subscription","gói đăng ký"],["supplier","nhà cung cấp"],["market survey","khảo sát thị trường"],["sales target","chỉ tiêu bán hàng"],
      ["transaction","giao dịch"],["trend","xu hướng"],["wholesale","việc bán sỉ"],["warranty","bảo hành"],["commission","hoa hồng"],
      ["quota","hạn ngạch"],["prospect","khách hàng tiềm năng"],["product launch","đợt ra mắt sản phẩm"],["market segment","phân khúc thị trường"],["loyalty program","chương trình khách hàng thân thiết"],
      ["referral","sự giới thiệu khách hàng"],["testimonial","lời chứng thực"],["showcase","buổi trưng bày"],["pricing","việc định giá"],["profitability","khả năng sinh lời"],
      ["turnover","doanh số"],["buyer","người mua"],["seller","người bán"],["negotiation","cuộc đàm phán"],["bid","hồ sơ dự thầu"]
    ]'),
    (N'SEED720-FINANCE', N'[
      ["bank account","tài khoản ngân hàng"],["accountant","kế toán viên"],["audit report","báo cáo kiểm toán"],["balance","số dư"],["bankruptcy","sự phá sản"],
      ["bill","hóa đơn thanh toán"],["budget","ngân sách"],["cash","tiền mặt"],["cheque","séc"],["credit","tín dụng"],
      ["currency","tiền tệ"],["debt","khoản nợ"],["deposit","tiền gửi"],["dividend","cổ tức"],["expense","chi phí"],
      ["fee","phí"],["fund","quỹ"],["income","thu nhập cá nhân"],["interest rate","lãi suất"],["invoice","hóa đơn"],
      ["loan","khoản vay"],["mortgage","khoản vay thế chấp"],["payment","khoản thanh toán"],["profit","lợi nhuận"],["refund","khoản hoàn tiền"],
      ["rent","tiền thuê"],["savings","tiền tiết kiệm"],["bank statement","sao kê ngân hàng"],["tax","thuế"],["withdrawal","việc rút tiền"],
      ["asset","tài sản"],["liability","khoản phải trả"],["equity","vốn chủ sở hữu"],["ledger","sổ cái"],["receipt","biên lai"],
      ["reimbursement","khoản hoàn trả chi phí"],["installment","khoản trả góp"],["earnings","thu nhập doanh nghiệp"],["expenditure","khoản chi tiêu"],["deduction","khoản khấu trừ"],
      ["premium","phí bảo hiểm"],["subsidy","trợ cấp"],["treasury","ngân quỹ"],["capital","vốn"],["deficit","thâm hụt"],
      ["surplus","thặng dư"],["remittance","khoản chuyển tiền"],["valuation","việc định giá tài sản"],["shareholder","cổ đông"],["financial quarter","quý tài chính"]
    ]'),
    (N'SEED720-CUSTOMER', N'[
      ["complaint","lời phàn nàn"],["inquiry","yêu cầu thông tin"],["feedback","phản hồi"],["product return","việc trả hàng"],["exchange request","yêu cầu đổi hàng"],
      ["assistance","sự hỗ trợ"],["hotline","đường dây nóng"],["operator","nhân viên trực tổng đài"],["satisfaction","sự hài lòng"],["response","phản hồi trả lời"],
      ["resolution","giải pháp xử lý"],["service request","yêu cầu dịch vụ"],["service issue","vấn đề dịch vụ"],["defect","lỗi sản phẩm"],["service delay","sự chậm trễ dịch vụ"],
      ["apology","lời xin lỗi"],["courtesy","sự lịch sự"],["queue","hàng chờ"],["guarantee","sự bảo đảm"],["repair","việc sửa chữa"],
      ["subscriber","người đăng ký"],["membership","tư cách thành viên"],["caller","người gọi điện"],["rating","điểm đánh giá"],["customer review","đánh giá của khách hàng"],
      ["support ticket","phiếu hỗ trợ"],["escalation","việc chuyển cấp xử lý"],["follow-up","việc theo dõi sau xử lý"],["callback","cuộc gọi lại"],["helpline","đường dây trợ giúp"],
      ["representative","nhân viên đại diện"],["patron","khách hàng thường xuyên"],["shopper","người mua sắm"],["concern","mối quan ngại"],["availability","tình trạng sẵn có"],
      ["instruction","hướng dẫn"],["guidance","sự hướng dẫn"],["explanation","lời giải thích"],["solution","giải pháp"],["inconvenience","sự bất tiện"],
      ["preference","sở thích"],["comment","nhận xét"],["message","tin nhắn"],["live chat","trò chuyện trực tuyến"],["contact detail","thông tin liên hệ"],
      ["customer service","dịch vụ khách hàng"],["technical support","hỗ trợ kỹ thuật"],["troubleshooting","việc khắc phục sự cố"],["complaint form","phiếu khiếu nại"],["refund policy","chính sách hoàn tiền"]
    ]'),
    (N'SEED720-TRAVEL', N'[
      ["airport","sân bay"],["airline","hãng hàng không"],["arrival","sự đến nơi"],["departure","sự khởi hành"],["baggage","hành lý ký gửi"],
      ["boarding pass","thẻ lên máy bay"],["itinerary","lịch trình chuyến đi"],["passport","hộ chiếu"],["visa","thị thực"],["airfare","giá vé máy bay"],
      ["terminal","nhà ga"],["boarding gate","cổng lên máy bay"],["luggage","hành lý mang theo"],["suitcase","va li"],["customs declaration","tờ khai hải quan"],
      ["destination","điểm đến"],["travel route","tuyến đường"],["journey","hành trình"],["business trip","chuyến công tác"],["traveler","khách du lịch"],
      ["passenger","hành khách"],["shuttle bus","xe buýt trung chuyển"],["taxi","taxi"],["railway","đường sắt"],["train platform","sân ga"],
      ["carriage","toa tàu"],["layover","thời gian chờ nối chuyến"],["stopover","điểm dừng chân"],["flight connection","chuyến bay nối chuyến"],["accommodation","chỗ ở"],
      ["reservation","sự đặt chỗ"],["booking","việc đặt chỗ"],["confirmation","xác nhận"],["cancellation","sự hủy bỏ"],["fare","giá vé"],
      ["travel voucher","phiếu du lịch"],["map","bản đồ"],["tour guide","hướng dẫn viên"],["excursion","chuyến tham quan"],["car rental","dịch vụ thuê xe"],
      ["travel coverage","phạm vi bảo hiểm du lịch"],["luggage claim","yêu cầu bồi thường hành lý"],["check-in","việc làm thủ tục nhận chỗ"],["check-out","việc trả phòng"],["boarding","việc lên máy bay"],
      ["immigration","thủ tục nhập cảnh"],["security checkpoint","điểm kiểm tra an ninh"],["aisle seat","ghế cạnh lối đi"],["timetable","thời gian biểu"],["travel agency","đại lý du lịch"]
    ]'),
    (N'SEED720-HOSPITALITY', N'[
      ["hotel","khách sạn"],["lobby","sảnh"],["suite","phòng hạng sang"],["guest room","phòng khách"],["key card","thẻ khóa phòng"],
      ["concierge","nhân viên hỗ trợ khách"],["porter","nhân viên khuân hành lý"],["housekeeping","bộ phận buồng phòng"],["laundry service","dịch vụ giặt là"],["restaurant","nhà hàng"],
      ["menu","thực đơn"],["buffet","tiệc tự chọn"],["banquet","tiệc lớn"],["catering","dịch vụ ăn uống"],["ceremony","buổi lễ"],
      ["convention","hội nghị"],["event registration","việc đăng ký sự kiện"],["participant","người tham gia"],["speaker","diễn giả"],["stage","sân khấu"],
      ["microphone","micro"],["decoration","đồ trang trí"],["invitation","thiệp mời"],["guest","khách"],["host","người chủ trì"],
      ["organizer","người tổ chức"],["delegate","đại biểu"],["ballroom","phòng khiêu vũ"],["auditorium","khán phòng"],["exhibition booth","gian triển lãm"],
      ["meal","bữa ăn"],["beverage","đồ uống"],["appetizer","món khai vị"],["dessert","món tráng miệng"],["gratuity","tiền boa"],
      ["waiter","nhân viên phục vụ"],["chef","đầu bếp"],["kitchen","nhà bếp"],["occupancy","tỷ lệ lấp đầy phòng"],["amenity","tiện nghi"],
      ["facility","cơ sở vật chất"],["room service","dịch vụ phòng"],["spa","khu spa"],["gym","phòng tập"],["swimming pool","hồ bơi"],
      ["terrace","sân hiên"],["parking area","khu đỗ xe"],["entrance","lối vào"],["seating arrangement","sơ đồ chỗ ngồi"],["lighting system","hệ thống chiếu sáng"]
    ]'),
    (N'SEED720-TECH', N'[
      ["software","phần mềm"],["hardware","phần cứng"],["network","mạng"],["database","cơ sở dữ liệu"],["server","máy chủ"],
      ["password","mật khẩu"],["username","tên đăng nhập"],["login","việc đăng nhập"],["browser","trình duyệt"],["website","trang web"],
      ["webpage","trang nội dung web"],["mobile app","ứng dụng di động"],["program","chương trình"],["file","tệp"],["backup","bản sao lưu"],
      ["cloud storage","lưu trữ đám mây"],["device","thiết bị"],["keyboard","bàn phím"],["monitor","màn hình"],["cable","dây cáp"],
      ["router","bộ định tuyến"],["firewall","tường lửa"],["virus","vi rút máy tính"],["malware","phần mềm độc hại"],["update","bản cập nhật"],
      ["upgrade","bản nâng cấp"],["download","lượt tải xuống"],["upload","lượt tải lên"],["installation","việc cài đặt"],["configuration","cấu hình"],
      ["access","quyền truy cập"],["permission","quyền hạn"],["encryption","mã hóa"],["user profile","hồ sơ người dùng"],["dashboard","bảng điều khiển"],
      ["analytics","phân tích dữ liệu"],["spreadsheet","bảng tính"],["processor","bộ xử lý"],["memory card","thẻ nhớ"],["battery","pin"],
      ["charger","bộ sạc"],["bandwidth","băng thông"],["outage","sự gián đoạn"],["error message","thông báo lỗi"],["software bug","lỗi phần mềm"],
      ["security patch","bản vá bảo mật"],["software version","phiên bản phần mềm"],["interface","giao diện"],["portal","cổng thông tin"],["automation","tự động hóa"]
    ]'),
    (N'SEED720-LOGISTICS', N'[
      ["warehouse","kho hàng"],["shipment","lô hàng"],["cargo","hàng hóa vận chuyển"],["freight","hàng chuyên chở"],["parcel","bưu kiện"],
      ["container","thùng container"],["pallet","pa-lét"],["crate","thùng gỗ"],["stock","hàng tồn kho"],["inventory","hàng tồn kho kiểm kê"],
      ["supply","nguồn cung"],["vendor","nhà cung ứng"],["manufacturer","nhà sản xuất"],["factory","nhà máy"],["production","hoạt động sản xuất"],
      ["distribution","việc phân phối"],["dispatch","việc gửi hàng"],["delivery","việc giao hàng"],["order","đơn hàng"],["purchase order","đơn đặt hàng"],
      ["tracking number","mã theo dõi"],["shipping label","nhãn vận chuyển"],["barcode","mã vạch"],["quantity","số lượng"],["weight","trọng lượng"],
      ["volume","thể tích"],["loading dock","bến bốc hàng"],["forklift","xe nâng"],["truck","xe tải"],["trailer","rơ-moóc"],
      ["carrier","đơn vị vận chuyển"],["customs clearance","thủ tục thông quan"],["import","hàng nhập khẩu"],["export","hàng xuất khẩu"],["tariff","thuế quan"],
      ["transit","quá trình vận chuyển"],["consignee","người nhận hàng"],["consignor","người gửi hàng"],["lead time","thời gian hoàn thành đơn"],["shortage","sự thiếu hụt"],
      ["overstock","hàng tồn quá mức"],["reorder","đơn đặt hàng lại"],["procurement","việc thu mua"],["material","nguyên vật liệu"],["component","linh kiện"],
      ["assembly","việc lắp ráp"],["batch","lô sản xuất"],["depot","kho trung chuyển"],["fulfillment","việc hoàn tất đơn hàng"],["packing list","phiếu đóng gói"]
    ]'),
    (N'SEED720-PROJECT', N'[
      ["project","dự án"],["objective","mục tiêu"],["scope","phạm vi"],["milestone","cột mốc"],["timeline","tiến độ thời gian"],
      ["deliverable","sản phẩm bàn giao"],["task","nhiệm vụ"],["assignment","phần việc"],["priority","mức ưu tiên"],["resource","nguồn lực"],
      ["estimate","ước tính"],["roadmap","lộ trình"],["plan","kế hoạch"],["strategy","chiến lược"],["proposal","đề xuất"],
      ["stakeholder","bên liên quan"],["project owner","chủ dự án"],["project team","nhóm dự án"],["project manager","quản lý dự án"],["coordinator","điều phối viên"],
      ["status report","báo cáo trạng thái"],["risk","rủi ro"],["dependency","sự phụ thuộc"],["constraint","ràng buộc"],["requirement","yêu cầu"],
      ["specification","đặc tả"],["approval","sự phê duyệt"],["revision","bản sửa đổi"],["draft","bản nháp"],["phase","giai đoạn"],
      ["kickoff","buổi khởi động"],["retrospective","buổi nhìn lại"],["backlog","danh sách việc tồn"],["sprint","chu kỳ làm việc ngắn"],["workflow","luồng công việc"],
      ["progress","tiến độ"],["completion","sự hoàn thành"],["quality","chất lượng"],["change request","yêu cầu thay đổi"],["baseline","đường cơ sở"],
      ["benchmark","mốc tham chiếu"],["outcome","kết quả đầu ra"],["action item","hạng mục hành động"],["collaboration","sự cộng tác"],["communication","việc giao tiếp"],
      ["documentation","tài liệu dự án"],["template","mẫu"],["checklist","danh sách kiểm tra"],["project tracker","công cụ theo dõi dự án"],["project charter","điều lệ dự án"]
    ]'),
    (N'SEED720-COMPLIANCE', N'[
      ["regulation","quy định"],["policy","chính sách"],["procedure","thủ tục"],["guideline","hướng dẫn"],["standard","tiêu chuẩn"],
      ["rule","quy tắc"],["law","luật"],["legislation","pháp luật"],["license","giấy phép"],["permit","giấy cho phép"],
      ["certificate","chứng chỉ"],["violation","sự vi phạm"],["penalty","hình phạt"],["fine","tiền phạt"],["sanction","biện pháp trừng phạt"],
      ["obligation","nghĩa vụ"],["control","biện pháp kiểm soát"],["disclosure","việc công bố"],["privacy","quyền riêng tư"],["consent","sự đồng ý"],
      ["record","hồ sơ"],["evidence","bằng chứng"],["authorization","sự ủy quyền"],["ethics","đạo đức nghề nghiệp"],["code of conduct","quy tắc ứng xử"],
      ["fraud","gian lận"],["bribery","hối lộ"],["conflict of interest","xung đột lợi ích"],["confidentiality","tính bảo mật"],["safety","an toàn"],
      ["hazard","mối nguy"],["incident","sự cố"],["investigation","cuộc điều tra"],["finding","phát hiện kiểm tra"],["corrective action","hành động khắc phục"],
      ["compliance","sự tuân thủ"],["governance","việc quản trị"],["accountability","trách nhiệm giải trình"],["transparency","tính minh bạch"],["monitoring","việc giám sát"],
      ["reporting","việc báo cáo"],["assessment","sự đánh giá"],["verification","việc xác minh"],["validation","việc thẩm định"],["accreditation","sự công nhận"],
      ["renewal","việc gia hạn"],["retention period","thời hạn lưu giữ"],["clause","điều khoản"],["amendment","bản sửa đổi pháp lý"],["legal notice","thông báo pháp lý"]
    ]'),
    (N'SEED720-PROFESSIONAL', N'[
      ["career","sự nghiệp"],["leadership","khả năng lãnh đạo"],["teamwork","làm việc nhóm"],["presentation","bài thuyết trình"],["competency","năng lực"],
      ["knowledge","kiến thức"],["training","việc đào tạo"],["course","khóa học"],["lesson","bài học"],["coaching","việc huấn luyện"],
      ["mentoring","việc cố vấn"],["goal","mục tiêu"],["achievement","thành tựu"],["performance","hiệu suất"],["productivity","năng suất"],
      ["motivation","động lực"],["confidence","sự tự tin"],["creativity","tính sáng tạo"],["innovation","sự đổi mới"],["problem-solving","kỹ năng giải quyết vấn đề"],
      ["decision-making","kỹ năng ra quyết định"],["time management","kỹ năng quản lý thời gian"],["networking","việc xây dựng quan hệ"],["relationship","mối quan hệ"],["opportunity","cơ hội"],
      ["challenge","thách thức"],["responsibility","trách nhiệm"],["initiative","tính chủ động"],["adaptability","khả năng thích nghi"],["flexibility","sự linh hoạt"],
      ["professionalism","tính chuyên nghiệp"],["portfolio","hồ sơ năng lực"],["development","sự phát triển"],["growth","sự trưởng thành"],["learning","việc học"],
      ["education","giáo dục"],["webinar","hội thảo trực tuyến"],["specialization","chuyên môn hóa"],["strength","điểm mạnh"],["weakness","điểm yếu"],
      ["habit","thói quen"],["focus","sự tập trung"],["recognition","sự ghi nhận"],["reward","phần thưởng"],["award","giải thưởng"],
      ["career path","lộ trình nghề nghiệp"],["personal brand","thương hiệu cá nhân"],["public speaking","kỹ năng nói trước công chúng"],["career coach","cố vấn nghề nghiệp"],["development plan","kế hoạch phát triển"]
    ]');

    CREATE TABLE #SeedVocabulary
    (
        SeedOrdinal      INT NOT NULL,
        VocabularyOrder  INT NOT NULL,
        TopicCode        NVARCHAR(50) NOT NULL,
        Term             NVARCHAR(200) NOT NULL,
        Meaning          NVARCHAR(1000) NOT NULL,
        DifficultyLevel  TINYINT NOT NULL
    );

    INSERT #SeedVocabulary (SeedOrdinal, VocabularyOrder, TopicCode, Term, Meaning, DifficultyLevel)
    SELECT ((st.TopicOrder - 1) * 50) + CONVERT(INT, item.[key]) + 1,
           CONVERT(INT, item.[key]) + 1,
           st.TopicCode,
           JSON_VALUE(item.value, N'$[0]'),
           JSON_VALUE(item.value, N'$[1]'),
           st.DifficultyLevel
    FROM #SeedTopics st
    JOIN #TopicVocabulary tv ON tv.TopicCode = st.TopicCode
    CROSS APPLY OPENJSON(tv.WordsJson) item;

    IF (SELECT COUNT(*) FROM #SeedVocabulary) <> 600
        THROW 50104, N'Curated vocabulary phải có đúng 600 từ.', 1;

    IF EXISTS (
        SELECT TopicCode FROM #SeedVocabulary GROUP BY TopicCode HAVING COUNT(*) <> 50
    )
        THROW 50105, N'Mỗi topic phải có đúng 50 từ.', 1;

    IF EXISTS (
        SELECT LOWER(Term) FROM #SeedVocabulary GROUP BY LOWER(Term) HAVING COUNT(*) > 1
    )
        THROW 50106, N'Curated vocabulary có term trùng.', 1;

    CREATE TABLE #LegacyWords (WordID BIGINT NOT NULL PRIMARY KEY);
    INSERT #LegacyWords (WordID)
    SELECT DISTINCT w.WordID
    FROM dbo.Topics t
    JOIN dbo.WordTopics wt ON wt.TopicID = t.TopicID
    JOIN dbo.Words w ON w.WordID = wt.WordID
    WHERE t.TopicCode LIKE N'SEED720-%'
      AND w.Meaning LIKE N'% trong chu de %';

    IF EXISTS (SELECT 1 FROM #LegacyWords)
    BEGIN
        CREATE TABLE #LegacyQuestions (QuestionID BIGINT NOT NULL PRIMARY KEY);
        INSERT #LegacyQuestions (QuestionID)
        SELECT q.QuestionID
        FROM dbo.Questions q
        JOIN #LegacyWords lw ON lw.WordID = q.WordID;

        IF OBJECT_ID(N'dbo.UserXPEvents', N'U') IS NOT NULL
        BEGIN
            EXEC sys.sp_executesql N'
                WITH SeedXP AS
                (
                    SELECT UserID, SUM(XPAmount) AS XPAmount
                    FROM dbo.UserXPEvents
                    WHERE SourceKey LIKE N''seed720-%''
                    GROUP BY UserID
                )
                UPDATE u
                SET TotalXP = CASE WHEN ISNULL(u.TotalXP, 0) > sx.XPAmount THEN u.TotalXP - sx.XPAmount ELSE 0 END,
                    UpdatedAt = SYSDATETIMEOFFSET()
                FROM dbo.Users u
                JOIN SeedXP sx ON sx.UserID = u.UserID;

                DELETE dbo.UserXPEvents WHERE SourceKey LIKE N''seed720-%'';
            ';
        END;

        DELETE cr
        FROM dbo.ContentReports cr
        WHERE EXISTS (SELECT 1 FROM #LegacyWords lw WHERE lw.WordID = cr.WordID)
           OR EXISTS (SELECT 1 FROM #LegacyQuestions lq WHERE lq.QuestionID = cr.QuestionID);

        DELETE cml
        FROM dbo.ContentMediaLinks cml
        WHERE (cml.EntityType = N'Word' AND EXISTS (SELECT 1 FROM #LegacyWords lw WHERE lw.WordID = cml.EntityID))
           OR (cml.EntityType = N'Question' AND EXISTS (SELECT 1 FROM #LegacyQuestions lq WHERE lq.QuestionID = cml.EntityID));

        DELETE ea
        FROM dbo.ExerciseAttempts ea
        WHERE EXISTS (SELECT 1 FROM #LegacyWords lw WHERE lw.WordID = ea.WordID)
           OR EXISTS (SELECT 1 FROM #LegacyQuestions lq WHERE lq.QuestionID = ea.QuestionID);

        DELETE mta
        FROM dbo.MiniTestAttempts mta
        JOIN dbo.MiniTests mt ON mt.MiniTestID = mta.MiniTestID
        WHERE mt.TestTitle LIKE N'SEED720 - %';

        DELETE mti
        FROM dbo.MiniTestItems mti
        JOIN dbo.MiniTests mt ON mt.MiniTestID = mti.MiniTestID
        WHERE mt.TestTitle LIKE N'SEED720 - %';

        DELETE w
        FROM dbo.Words w
        JOIN #LegacyWords lw ON lw.WordID = w.WordID;
    END;

    INSERT dbo.Words
        (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt)
    SELECT sv.Term, @NounPartOfSpeechID, sv.Meaning, NULL, sv.DifficultyLevel,
           @AuthorID, @Now, @Now, N'Published', @ReviewerID, @Now, @Now
    FROM #SeedVocabulary sv
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Words w
        WHERE LOWER(w.Term) = LOWER(sv.Term)
          AND w.PartOfSpeechID = @NounPartOfSpeechID
    );

    CREATE TABLE #SeedWords
    (
        SeedOrdinal      INT NOT NULL,
        VocabularyOrder  INT NOT NULL,
        TopicCode        NVARCHAR(50) NOT NULL,
        TopicID          BIGINT NOT NULL,
        WordID           BIGINT NOT NULL,
        Term             NVARCHAR(200) NOT NULL,
        Meaning          NVARCHAR(1000) NOT NULL
    );

    INSERT #SeedWords (SeedOrdinal, VocabularyOrder, TopicCode, TopicID, WordID, Term, Meaning)
    SELECT sv.SeedOrdinal, sv.VocabularyOrder, sv.TopicCode, t.TopicID, w.WordID, sv.Term, sv.Meaning
    FROM #SeedVocabulary sv
    JOIN dbo.Topics t ON t.TopicCode = sv.TopicCode
    JOIN dbo.Words w ON LOWER(w.Term) = LOWER(sv.Term) AND w.PartOfSpeechID = @NounPartOfSpeechID;

    IF (SELECT COUNT(*) FROM #SeedWords) <> 600
        THROW 50107, N'Không map được đủ 600 curated words.', 1;

    INSERT dbo.WordTopics (WordID, TopicID, AssignedAt)
    SELECT sw.WordID, sw.TopicID, @Now
    FROM #SeedWords sw
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.WordTopics wt WHERE wt.WordID = sw.WordID AND wt.TopicID = sw.TopicID
    );

    INSERT dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
    SELECT sw.WordID,
           CONCAT(N'The report mentioned the ', sw.Term, N' in the ', st.ContextLabel, N' section.'),
           CONCAT(N'Báo cáo đề cập đến ', sw.Meaning, N' trong phần ', st.ContextLabelVi, N'.'),
           @Now, @Now
    FROM #SeedWords sw
    JOIN #SeedTopics st ON st.TopicCode = sw.TopicCode
    WHERE NOT EXISTS (SELECT 1 FROM dbo.ExampleSentences ex WHERE ex.WordID = sw.WordID);

    UPDATE ex
    SET SentenceText = CONCAT(N'The report mentioned the ', sw.Term, N' in the ', st.ContextLabel, N' section.'),
        SentenceTranslation = CONCAT(N'Báo cáo đề cập đến ', sw.Meaning, N' trong phần ', st.ContextLabelVi, N'.'),
        UpdatedAt = @Now
    FROM dbo.ExampleSentences ex
    JOIN #SeedWords sw ON sw.WordID = ex.WordID
    JOIN #SeedTopics st ON st.TopicCode = sw.TopicCode
    WHERE ex.SentenceText LIKE N'The TOEIC exercise uses "%'
       OR ex.SentenceText LIKE N'The report mentioned the % in the % section.';

    ;WITH VocabularyOptions AS
    (
        SELECT sw.*,
               d1.Meaning AS Distractor1,
               d2.Meaning AS Distractor2,
               d3.Meaning AS Distractor3
        FROM #SeedWords sw
        JOIN #SeedVocabulary d1 ON d1.TopicCode = sw.TopicCode AND d1.VocabularyOrder = (sw.VocabularyOrder % 50) + 1
        JOIN #SeedVocabulary d2 ON d2.TopicCode = sw.TopicCode AND d2.VocabularyOrder = ((sw.VocabularyOrder + 7) % 50) + 1
        JOIN #SeedVocabulary d3 ON d3.TopicCode = sw.TopicCode AND d3.VocabularyOrder = ((sw.VocabularyOrder + 19) % 50) + 1
    )
    INSERT dbo.Questions
        (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, Explanation, DifficultyLevel, CreatedByUserID, CreatedAt, UpdatedAt, ContentStatus, ReviewedByUserID, ReviewedAt, PublishedAt)
    SELECT vo.WordID, N'MCQ',
           CONCAT(N'What is the Vietnamese meaning of "', vo.Term, N'"?'),
           CASE vo.VocabularyOrder % 4
             WHEN 0 THEN CONCAT(N'["', STRING_ESCAPE(vo.Meaning, 'json'), N'","', STRING_ESCAPE(vo.Distractor1, 'json'), N'","', STRING_ESCAPE(vo.Distractor2, 'json'), N'","', STRING_ESCAPE(vo.Distractor3, 'json'), N'"]')
             WHEN 1 THEN CONCAT(N'["', STRING_ESCAPE(vo.Distractor1, 'json'), N'","', STRING_ESCAPE(vo.Meaning, 'json'), N'","', STRING_ESCAPE(vo.Distractor2, 'json'), N'","', STRING_ESCAPE(vo.Distractor3, 'json'), N'"]')
             WHEN 2 THEN CONCAT(N'["', STRING_ESCAPE(vo.Distractor1, 'json'), N'","', STRING_ESCAPE(vo.Distractor2, 'json'), N'","', STRING_ESCAPE(vo.Meaning, 'json'), N'","', STRING_ESCAPE(vo.Distractor3, 'json'), N'"]')
             ELSE CONCAT(N'["', STRING_ESCAPE(vo.Distractor1, 'json'), N'","', STRING_ESCAPE(vo.Distractor2, 'json'), N'","', STRING_ESCAPE(vo.Distractor3, 'json'), N'","', STRING_ESCAPE(vo.Meaning, 'json'), N'"]')
           END,
           vo.Meaning,
           CONCAT(N'"', vo.Term, N'" thuộc chủ đề ', vo.TopicCode, N'.'),
           sv.DifficultyLevel, @AuthorID, @Now, @Now, N'Published', @ReviewerID, @Now, @Now
    FROM VocabularyOptions vo
    JOIN #SeedVocabulary sv ON sv.SeedOrdinal = vo.SeedOrdinal
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Questions q WHERE q.WordID = vo.WordID AND q.QuestionType = N'MCQ'
    );

    ;WITH VocabularyOptions AS
    (
        SELECT sw.*,
               d1.Meaning AS Distractor1,
               d2.Meaning AS Distractor2,
               d3.Meaning AS Distractor3
        FROM #SeedWords sw
        JOIN #SeedVocabulary d1 ON d1.TopicCode = sw.TopicCode AND d1.VocabularyOrder = (sw.VocabularyOrder % 50) + 1
        JOIN #SeedVocabulary d2 ON d2.TopicCode = sw.TopicCode AND d2.VocabularyOrder = ((sw.VocabularyOrder + 7) % 50) + 1
        JOIN #SeedVocabulary d3 ON d3.TopicCode = sw.TopicCode AND d3.VocabularyOrder = ((sw.VocabularyOrder + 19) % 50) + 1
    )
    UPDATE q
    SET OptionsJson =
          CASE vo.VocabularyOrder % 4
            WHEN 0 THEN CONCAT(N'["', STRING_ESCAPE(vo.Meaning, 'json'), N'","', STRING_ESCAPE(vo.Distractor1, 'json'), N'","', STRING_ESCAPE(vo.Distractor2, 'json'), N'","', STRING_ESCAPE(vo.Distractor3, 'json'), N'"]')
            WHEN 1 THEN CONCAT(N'["', STRING_ESCAPE(vo.Distractor1, 'json'), N'","', STRING_ESCAPE(vo.Meaning, 'json'), N'","', STRING_ESCAPE(vo.Distractor2, 'json'), N'","', STRING_ESCAPE(vo.Distractor3, 'json'), N'"]')
            WHEN 2 THEN CONCAT(N'["', STRING_ESCAPE(vo.Distractor1, 'json'), N'","', STRING_ESCAPE(vo.Distractor2, 'json'), N'","', STRING_ESCAPE(vo.Meaning, 'json'), N'","', STRING_ESCAPE(vo.Distractor3, 'json'), N'"]')
            ELSE CONCAT(N'["', STRING_ESCAPE(vo.Distractor1, 'json'), N'","', STRING_ESCAPE(vo.Distractor2, 'json'), N'","', STRING_ESCAPE(vo.Distractor3, 'json'), N'","', STRING_ESCAPE(vo.Meaning, 'json'), N'"]')
          END,
        CorrectAnswer = vo.Meaning,
        UpdatedAt = @Now
    FROM dbo.Questions q
    JOIN VocabularyOptions vo ON vo.WordID = q.WordID
    WHERE q.QuestionType = N'MCQ'
      AND q.QuestionText LIKE N'What is the Vietnamese meaning of "%';

    UPDATE w
    SET Meaning = sw.Meaning,
        UpdatedAt = @Now
    FROM dbo.Words w
    JOIN #SeedWords sw ON sw.WordID = w.WordID
    WHERE EXISTS (
        SELECT 1
        FROM dbo.Questions q
        WHERE q.WordID = w.WordID
          AND q.QuestionType = N'MCQ'
          AND q.QuestionText LIKE N'What is the Vietnamese meaning of "%'
    );

    DELETE mti
    FROM dbo.MiniTestItems mti
    JOIN dbo.MiniTests mt ON mt.MiniTestID = mti.MiniTestID
    WHERE mt.TestTitle LIKE N'SEED720 - %';

    ;WITH RankedQuestions AS
    (
        SELECT mt.MiniTestID, q.QuestionID,
               ROW_NUMBER() OVER (PARTITION BY mt.MiniTestID ORDER BY sw.VocabularyOrder) AS DisplayOrder
        FROM #SeedWords sw
        JOIN dbo.Topics t ON t.TopicID = sw.TopicID
        JOIN dbo.MiniTests mt ON mt.TopicID = t.TopicID AND mt.TestTitle LIKE N'SEED720 - %'
        JOIN dbo.Questions q ON q.WordID = sw.WordID AND q.QuestionType = N'MCQ'
    )
    INSERT dbo.MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT MiniTestID, QuestionID, DisplayOrder
    FROM RankedQuestions
    WHERE DisplayOrder <= 10;

    IF @LearnerID IS NOT NULL
    BEGIN
        INSERT dbo.UserTopicEnrollments (UserID, TopicID, EnrolledAt, IsActive)
        SELECT @LearnerID, t.TopicID, @Now, 1
        FROM #SeedTopics st
        JOIN dbo.Topics t ON t.TopicCode = st.TopicCode
        WHERE NOT EXISTS (
            SELECT 1 FROM dbo.UserTopicEnrollments ute WHERE ute.UserID = @LearnerID AND ute.TopicID = t.TopicID
        );

        INSERT dbo.UserWordProgress
            (UserID, WordID, MasteryLevel, EaseFactor, RepetitionCount, ConsecutiveCorrect, ConsecutiveWrong, LastReviewedAt, NextReviewDate, LastScore, MemoryStatus, CreatedAt, UpdatedAt)
        SELECT @LearnerID, sw.WordID,
               CASE WHEN sw.SeedOrdinal <= 50 THEN 8 WHEN sw.SeedOrdinal <= 100 THEN 5 WHEN sw.SeedOrdinal <= 150 THEN 2 ELSE 0 END,
               CASE WHEN sw.SeedOrdinal <= 50 THEN 2.90 WHEN sw.SeedOrdinal <= 100 THEN 2.70 WHEN sw.SeedOrdinal <= 150 THEN 2.50 ELSE 2.20 END,
               CASE WHEN sw.SeedOrdinal <= 50 THEN 8 WHEN sw.SeedOrdinal <= 100 THEN 5 WHEN sw.SeedOrdinal <= 150 THEN 2 ELSE 1 END,
               CASE WHEN sw.SeedOrdinal <= 150 THEN 2 ELSE 0 END,
               CASE WHEN sw.SeedOrdinal > 150 THEN 1 ELSE 0 END,
               DATEADD(day, -((sw.SeedOrdinal % 21) + 1), @Now),
               CASE WHEN sw.SeedOrdinal <= 50 THEN DATEADD(day, 30, @Now)
                    WHEN sw.SeedOrdinal <= 100 THEN DATEADD(day, 7, @Now)
                    WHEN sw.SeedOrdinal <= 150 THEN DATEADD(day, 1, @Now)
                    ELSE DATEADD(day, -1, @Now) END,
               CASE WHEN sw.SeedOrdinal > 150 THEN 0 ELSE 100 END,
               CASE WHEN sw.SeedOrdinal <= 50 THEN N'Mastered'
                    WHEN sw.SeedOrdinal <= 100 THEN N'Reviewing'
                    WHEN sw.SeedOrdinal <= 150 THEN N'Learning'
                    ELSE N'Lapsed' END,
               DATEADD(day, -((sw.SeedOrdinal % 120) + 1), @Now), @Now
        FROM #SeedWords sw
        WHERE sw.SeedOrdinal <= 170
          AND NOT EXISTS (
              SELECT 1 FROM dbo.UserWordProgress uwp WHERE uwp.UserID = @LearnerID AND uwp.WordID = sw.WordID
          );

        INSERT dbo.ExerciseAttempts
            (UserID, QuestionID, WordID, SubmittedAnswer, IsCorrect, ScoreAwarded, AttemptedAt, ClientTimeZoneOffset, AttemptMetadataJson)
        SELECT @LearnerID, q.QuestionID, sw.WordID,
               CASE WHEN sw.SeedOrdinal % 5 = 0 THEN N'wrong answer' ELSE sw.Meaning END,
               CASE WHEN sw.SeedOrdinal % 5 = 0 THEN 0 ELSE 1 END,
               CASE WHEN sw.SeedOrdinal % 5 = 0 THEN 0 ELSE 100 END,
               DATEADD(day, -((sw.SeedOrdinal % 60) + 1), @Now), N'+07:00',
               CONCAT(N'{"seed":"SEED720-CURATED","ordinal":', sw.SeedOrdinal, N'}')
        FROM #SeedWords sw
        JOIN dbo.Questions q ON q.WordID = sw.WordID AND q.QuestionType = N'MCQ'
        WHERE sw.SeedOrdinal <= 120
          AND NOT EXISTS (
              SELECT 1 FROM dbo.ExerciseAttempts ea
              WHERE ea.UserID = @LearnerID
                AND JSON_VALUE(ea.AttemptMetadataJson, '$.seed') = N'SEED720-CURATED'
                AND TRY_CONVERT(INT, JSON_VALUE(ea.AttemptMetadataJson, '$.ordinal')) = sw.SeedOrdinal
          );

        INSERT dbo.UserVocabularyNotebook (UserID, WordID, PersonalNote, IsFavorite, AddedAt, UpdatedAt)
        SELECT @LearnerID, sw.WordID, CONCAT(N'Cần ghi nhớ: ', sw.Term, N'.'),
               CASE WHEN sw.SeedOrdinal <= 5 THEN 1 ELSE 0 END, @Now, @Now
        FROM #SeedWords sw
        WHERE sw.SeedOrdinal <= 15
          AND NOT EXISTS (
              SELECT 1 FROM dbo.UserVocabularyNotebook notebook WHERE notebook.UserID = @LearnerID AND notebook.WordID = sw.WordID
          );

        ;WITH RankedMiniTests AS
        (
            SELECT mt.MiniTestID,
                   ROW_NUMBER() OVER (ORDER BY st.TopicOrder) AS TestOrder
            FROM #SeedTopics st
            JOIN dbo.Topics t ON t.TopicCode = st.TopicCode
            JOIN dbo.MiniTests mt ON mt.TopicID = t.TopicID AND mt.TestTitle LIKE N'SEED720 - %'
        )
        INSERT dbo.MiniTestAttempts (MiniTestID, UserID, StartedAt, SubmittedAt, TotalQuestions, CorrectCount, Score)
        SELECT rmt.MiniTestID, @LearnerID,
               DATEADD(day, -rmt.TestOrder, @Now), DATEADD(day, -rmt.TestOrder, @Now),
               10, CASE WHEN rmt.TestOrder = 1 THEN 9 ELSE 8 END,
               CASE WHEN rmt.TestOrder = 1 THEN 90 ELSE 80 END
        FROM RankedMiniTests rmt
        WHERE rmt.TestOrder <= 2
          AND NOT EXISTS (
              SELECT 1 FROM dbo.MiniTestAttempts mta
              WHERE mta.UserID = @LearnerID AND mta.MiniTestID = rmt.MiniTestID
          );

        IF OBJECT_ID(N'dbo.UserXPEvents', N'U') IS NOT NULL
        BEGIN
            EXEC sys.sp_executesql N'
                DECLARE @InsertedXP TABLE (XPAmount INT NOT NULL);

                INSERT dbo.UserXPEvents (UserID, EventType, XPAmount, SourceKey, MetadataJson, CreatedAt)
                OUTPUT inserted.XPAmount INTO @InsertedXP
                SELECT @LearnerID, N''LearnWord'', 5,
                       CONCAT(N''seed720-curated-learn-word:'', sw.WordID),
                       CONCAT(N''{"seed":"SEED720-CURATED","wordId":'', sw.WordID, N''}''),
                       DATEADD(day, -((sw.SeedOrdinal % 30) + 1), @Now)
                FROM #SeedWords sw
                WHERE sw.SeedOrdinal <= 120
                  AND NOT EXISTS (
                      SELECT 1 FROM dbo.UserXPEvents x
                      WHERE x.UserID = @LearnerID
                        AND x.EventType = N''LearnWord''
                        AND x.SourceKey = CONCAT(N''seed720-curated-learn-word:'', sw.WordID)
                  );

                DECLARE @XPDelta INT = ISNULL((SELECT SUM(XPAmount) FROM @InsertedXP), 0);
                IF @XPDelta > 0
                BEGIN
                    UPDATE dbo.Users
                    SET TotalXP = ISNULL(TotalXP, 0) + @XPDelta,
                        UpdatedAt = @Now
                    WHERE UserID = @LearnerID;
                END;
            ', N'@LearnerID BIGINT, @Now DATETIMEOFFSET(7)', @LearnerID = @LearnerID, @Now = @Now;
        END;
    END;

    COMMIT TRANSACTION;

    PRINT N'Curated SEED720 repair completed successfully.';
    SELECT COUNT(*) AS CuratedVocabularyCount FROM #SeedWords;
    SELECT TopicCode, COUNT(*) AS VocabularyCount
    FROM #SeedWords
    GROUP BY TopicCode
    ORDER BY TopicCode;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
