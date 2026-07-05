-- ============================================================
-- SEED: Thêm 6 chủ đề mới cho từng stage học + từ vựng + câu hỏi
-- Tổng quan kế hoạch bổ sung:
--   Level 1 (TOEIC 300): + Shopping & Services
--   Level 2 (TOEIC 500): + Health & Medical
--   Level 3 (TOEIC 700): + Finance & Banking, Marketing & Advertising
--   Level 4 (TOEIC 900): + HR & Personnel Mgmt, Law & Legal Affairs
-- ============================================================
-- Cách chạy:
--   docker cp backend/Database/seed_topics_for_all_levels.sql sqlserver_2022:/tmp/seed_topics.sql
--   docker exec sqlserver_2022 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Hoangphuc@040505' -C -d ToeicVocabularyPlatform -i /tmp/seed_topics.sql
-- ============================================================

PRINT '============================================================';
PRINT '  BẮT ĐẦU SEED: Thêm chủ đề mới cho từng stage học';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- Biến dùng chung
-- ============================================================
DECLARE @AdminUserID BIGINT = 1; -- User admin mặc định
DECLARE @Now DATETIMEOFFSET = SYSDATETIMEOFFSET();
DECLARE @TopicName NVARCHAR(200); -- Dùng trong topic_test_cursor

-- ============================================================
-- PHẦN 1: TẠO TOPIC MỚI
-- ============================================================
PRINT '=== PHẦN 1: TẠO 6 TOPIC MỚI ===';

-- Level 1 - TOEIC 300: Shopping & Services (Category: Daily Life, ID=2)
IF NOT EXISTS (SELECT 1 FROM Topics WHERE TopicCode = 'SHOPPING_SERVICES')
BEGIN
    INSERT INTO Topics (TopicName, TopicCode, Description, CreatedByUserID, TopicCategoryID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (N'Shopping & Services', 'SHOPPING_SERVICES', N'Từ vựng về mua sắm, dịch vụ khách hàng và giao dịch thương mại cơ bản', @AdminUserID, 2, 'Published', @Now, @Now, @Now);
    PRINT '  + Created: Shopping & Services (Topic 7)';
END
ELSE PRINT '  ~ Shopping & Services already exists';

-- Level 2 - TOEIC 500: Health & Medical (Category: Daily Life, ID=2)
IF NOT EXISTS (SELECT 1 FROM Topics WHERE TopicCode = 'HEALTH_MEDICAL')
BEGIN
    INSERT INTO Topics (TopicName, TopicCode, Description, CreatedByUserID, TopicCategoryID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (N'Health & Medical', 'HEALTH_MEDICAL', N'Từ vựng về sức khỏe, y tế, bệnh viện và chăm sóc sức khỏe hàng ngày', @AdminUserID, 2, 'Published', @Now, @Now, @Now);
    PRINT '  + Created: Health & Medical (Topic 8)';
END
ELSE PRINT '  ~ Health & Medical already exists';

-- Level 3 - TOEIC 700: Finance & Banking (Category: TOEIC Business, ID=1)
IF NOT EXISTS (SELECT 1 FROM Topics WHERE TopicCode = 'FINANCE_BANKING')
BEGIN
    INSERT INTO Topics (TopicName, TopicCode, Description, CreatedByUserID, TopicCategoryID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (N'Finance & Banking', 'FINANCE_BANKING', N'Từ vựng về tài chính, ngân hàng, đầu tư và quản lý tiền tệ', @AdminUserID, 1, 'Published', @Now, @Now, @Now);
    PRINT '  + Created: Finance & Banking (Topic 9)';
END
ELSE PRINT '  ~ Finance & Banking already exists';

-- Level 3 - TOEIC 700: Marketing & Advertising (Category: TOEIC Business, ID=1)
IF NOT EXISTS (SELECT 1 FROM Topics WHERE TopicCode = 'MARKETING_ADVERTISING')
BEGIN
    INSERT INTO Topics (TopicName, TopicCode, Description, CreatedByUserID, TopicCategoryID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (N'Marketing & Advertising', 'MARKETING_ADVERTISING', N'Từ vựng về tiếp thị, quảng cáo, thương hiệu và chiến lược kinh doanh', @AdminUserID, 1, 'Published', @Now, @Now, @Now);
    PRINT '  + Created: Marketing & Advertising (Topic 10)';
END
ELSE PRINT '  ~ Marketing & Advertising already exists';

-- Level 4 - TOEIC 900: HR & Personnel Management (Category: TOEIC Business, ID=1)
IF NOT EXISTS (SELECT 1 FROM Topics WHERE TopicCode = 'HR_PERSONNEL')
BEGIN
    INSERT INTO Topics (TopicName, TopicCode, Description, CreatedByUserID, TopicCategoryID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (N'HR & Personnel Management', 'HR_PERSONNEL', N'Từ vựng về nhân sự, quản lý nhân viên, tuyển dụng và phúc lợi', @AdminUserID, 1, 'Published', @Now, @Now, @Now);
    PRINT '  + Created: HR & Personnel Management (Topic 11)';
END
ELSE PRINT '  ~ HR & Personnel Management already exists';

-- Level 4 - TOEIC 900: Law & Legal Affairs (Category: TOEIC Business, ID=1)
IF NOT EXISTS (SELECT 1 FROM Topics WHERE TopicCode = 'LAW_LEGAL')
BEGIN
    INSERT INTO Topics (TopicName, TopicCode, Description, CreatedByUserID, TopicCategoryID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (N'Law & Legal Affairs', 'LAW_LEGAL', N'Từ vựng về pháp luật, hợp đồng, tranh chấp và các vấn đề pháp lý trong kinh doanh', @AdminUserID, 1, 'Published', @Now, @Now, @Now);
    PRINT '  + Created: Law & Legal Affairs (Topic 12)';
END
ELSE PRINT '  ~ Law & Legal Affairs already exists';

PRINT '';

-- ============================================================
-- PHẦN 2: THÊM TỪ VỰNG CHO TỪNG TOPIC
-- ============================================================
PRINT '=== PHẦN 2: THÊM TỪ VỰNG MỚI ===';

-- Helper: Lưu TopicID vào biến
DECLARE @Topic7ID BIGINT = (SELECT TopicID FROM Topics WHERE TopicCode = 'SHOPPING_SERVICES');
DECLARE @Topic8ID BIGINT = (SELECT TopicID FROM Topics WHERE TopicCode = 'HEALTH_MEDICAL');
DECLARE @Topic9ID BIGINT = (SELECT TopicID FROM Topics WHERE TopicCode = 'FINANCE_BANKING');
DECLARE @Topic10ID BIGINT = (SELECT TopicID FROM Topics WHERE TopicCode = 'MARKETING_ADVERTISING');
DECLARE @Topic11ID BIGINT = (SELECT TopicID FROM Topics WHERE TopicCode = 'HR_PERSONNEL');
DECLARE @Topic12ID BIGINT = (SELECT TopicID FROM Topics WHERE TopicCode = 'LAW_LEGAL');

PRINT '  Topic 7 ID: ' + CAST(@Topic7ID AS VARCHAR);
PRINT '  Topic 8 ID: ' + CAST(@Topic8ID AS VARCHAR);
PRINT '  Topic 9 ID: ' + CAST(@Topic9ID AS VARCHAR);
PRINT '  Topic 10 ID: ' + CAST(@Topic10ID AS VARCHAR);
PRINT '  Topic 11 ID: ' + CAST(@Topic11ID AS VARCHAR);
PRINT '  Topic 12 ID: ' + CAST(@Topic12ID AS VARCHAR);
PRINT '';

-- ============================
-- TOPIC 7: Shopping & Services (14 words)
-- ============================
PRINT '--- Topic 7: Shopping & Services ---';

-- Tạo bảng tạm chứa dữ liệu từ vựng
IF OBJECT_ID('tempdb..#NewWords') IS NOT NULL DROP TABLE #NewWords;
CREATE TABLE #NewWords (
    Term NVARCHAR(200),
    Meaning NVARCHAR(1000),
    Phonetic NVARCHAR(255),
    PartOfSpeechID INT,
    DifficultyLevel TINYINT,
    TopicID BIGINT,
    SentenceText NVARCHAR(2000),
    SentenceTranslation NVARCHAR(2000)
);

-- Shopping & Services words
INSERT INTO #NewWords VALUES
(N'bargain', N'món hời, giá rẻ', N'/ˈbɑːrɡən/', 1, 1, @Topic7ID, N'I found a great bargain at the weekend sale.', N'Tôi đã tìm được một món hời tại buổi giảm giá cuối tuần.'),
(N'browse', N'xem qua, lướt qua', N'/braʊz/', 2, 1, @Topic7ID, N'I like to browse the mall when I have free time.', N'Tôi thích đi dạo xem qua trung tâm thương mại khi có thời gian rảnh.'),
(N'complaint', N'khiếu nại, phàn nàn', N'/kəmˈpleɪnt/', 1, 1, @Topic7ID, N'The customer filed a complaint about the defective product.', N'Khách hàng đã gửi khiếu nại về sản phẩm bị lỗi.'),
(N'coupon', N'phiếu giảm giá', N'/ˈkuːpɑːn/', 1, 1, @Topic7ID, N'She used a coupon to get 20% off her purchase.', N'Cô ấy đã dùng phiếu giảm giá để được giảm 20% cho món hàng.'),
(N'delivery', N'giao hàng', N'/dɪˈlɪvəri/', 1, 1, @Topic7ID, N'The delivery usually takes 3 to 5 business days.', N'Việc giao hàng thường mất 3 đến 5 ngày làm việc.'),
(N'discount', N'giảm giá', N'/ˈdɪskaʊnt/', 1, 1, @Topic7ID, N'Students get a 10% discount on all items.', N'Sinh viên được giảm giá 10% trên tất cả các mặt hàng.'),
(N'exchange', N'đổi trả hàng', N'/ɪksˈtʃeɪndʒ/', 2, 1, @Topic7ID, N'You can exchange the item within 30 days of purchase.', N'Bạn có thể đổi trả hàng trong vòng 30 ngày kể từ ngày mua.'),
(N'invoice', N'hóa đơn', N'/ˈɪnvɔɪs/', 1, 1, @Topic7ID, N'Please send the invoice to our accounting department.', N'Vui lòng gửi hóa đơn đến phòng kế toán của chúng tôi.'),
(N'outlet', N'cửa hàng giảm giá', N'/ˈaʊtlet/', 1, 1, @Topic7ID, N'You can find cheaper prices at the factory outlet.', N'Bạn có thể tìm thấy giá rẻ hơn tại cửa hàng giảm giá của nhà máy.'),
(N'queue', N'xếp hàng, hàng đợi', N'/kjuː/', 1, 1, @Topic7ID, N'We had to queue for 30 minutes to get into the store.', N'Chúng tôi phải xếp hàng 30 phút để vào cửa hàng.'),
(N'receipt', N'biên lai, hóa đơn', N'/rɪˈsiːt/', 1, 1, @Topic7ID, N'Keep your receipt in case you need to return the item.', N'Hãy giữ biên lai phòng khi bạn cần trả lại hàng.'),
(N'refund', N'hoàn tiền', N'/ˈriːfʌnd/', 1, 1, @Topic7ID, N'The store offered a full refund for the damaged item.', N'Cửa hàng đã đề nghị hoàn lại toàn bộ tiền cho món hàng bị hư hỏng.'),
(N'tip', N'tiền boa, tiền thưởng nhỏ', N'/tɪp/', 1, 1, @Topic7ID, N'It is customary to leave a 15% tip at restaurants.', N'Thông thường, bạn nên để lại tiền boa 15% tại nhà hàng.'),
(N'warranty', N'bảo hành', N'/ˈwɔːrənti/', 1, 1, @Topic7ID, N'The laptop comes with a two-year warranty.', N'Chiếc máy tính xách tay đi kèm với bảo hành hai năm.');

-- Health & Medical words
INSERT INTO #NewWords VALUES
(N'allergy', N'dị ứng', N'/ˈælərdʒi/', 1, 2, @Topic8ID, N'She has a severe allergy to peanuts.', N'Cô ấy bị dị ứng nặng với đậu phộng.'),
(N'checkup', N'kiểm tra sức khỏe tổng quát', N'/ˈtʃekʌp/', 1, 2, @Topic8ID, N'You should schedule an annual checkup with your doctor.', N'Bạn nên đặt lịch kiểm tra sức khỏe tổng quát hàng năm với bác sĩ.'),
(N'diagnosis', N'chẩn đoán', N'/ˌdaɪəɡˈnoʊsɪs/', 1, 2, @Topic8ID, N'The doctor made a diagnosis after reviewing the test results.', N'Bác sĩ đã đưa ra chẩn đoán sau khi xem xét kết quả xét nghiệm.'),
(N'dosage', N'liều lượng (thuốc)', N'/ˈdoʊsɪdʒ/', 1, 2, @Topic8ID, N'The recommended dosage is one tablet twice a day.', N'Liều lượng khuyến cáo là một viên hai lần một ngày.'),
(N'epidemic', N'dịch bệnh', N'/ˌepɪˈdemɪk/', 1, 2, @Topic8ID, N'The government took measures to control the epidemic.', N'Chính phủ đã thực hiện các biện pháp để kiểm soát dịch bệnh.'),
(N'fatigue', N'mệt mỏi, kiệt sức', N'/fəˈtiːɡ/', 1, 2, @Topic8ID, N'Constant fatigue can be a sign of an underlying health issue.', N'Mệt mỏi liên tục có thể là dấu hiệu của một vấn đề sức khỏe tiềm ẩn.'),
(N'nutrition', N'dinh dưỡng', N'/nuːˈtrɪʃn/', 1, 2, @Topic8ID, N'Good nutrition is essential for maintaining a healthy lifestyle.', N'Dinh dưỡng tốt là điều cần thiết để duy trì lối sống lành mạnh.'),
(N'pharmacy', N'hiệu thuốc, nhà thuốc', N'/ˈfɑːrməsi/', 1, 2, @Topic8ID, N'You can buy over-the-counter medicine at the pharmacy.', N'Bạn có thể mua thuốc không kê đơn tại hiệu thuốc.'),
(N'prescription', N'đơn thuốc', N'/prɪˈskrɪpʃn/', 1, 2, @Topic8ID, N'The doctor gave me a prescription for antibiotics.', N'Bác sĩ đã cho tôi một đơn thuốc kháng sinh.'),
(N'recovery', N'sự hồi phục', N'/rɪˈkʌvəri/', 1, 2, @Topic8ID, N'Her recovery after surgery was faster than expected.', N'Sự hồi phục của cô ấy sau phẫu thuật nhanh hơn dự kiến.'),
(N'surgery', N'phẫu thuật', N'/ˈsɜːrdʒəri/', 1, 2, @Topic8ID, N'The patient underwent surgery to remove the tumor.', N'Bệnh nhân đã trải qua phẫu thuật để loại bỏ khối u.'),
(N'symptom', N'triệu chứng', N'/ˈsɪmptəm/', 1, 2, @Topic8ID, N'Common symptoms of the flu include fever and cough.', N'Các triệu chứng phổ biến của bệnh cúm bao gồm sốt và ho.'),
(N'therapy', N'liệu pháp, điều trị', N'/ˈθerəpi/', 1, 2, @Topic8ID, N'Physical therapy helped him recover from the injury.', N'Liệu pháp vật lý đã giúp anh ấy hồi phục sau chấn thương.'),
(N'vaccination', N'tiêm chủng, vắc-xin', N'/ˌvæksɪˈneɪʃn/', 1, 2, @Topic8ID, N'Vaccination is the best way to prevent infectious diseases.', N'Tiêm chủng là cách tốt nhất để ngăn ngừa các bệnh truyền nhiễm.');

-- Finance & Banking words
INSERT INTO #NewWords VALUES
(N'balance', N'số dư (tài khoản)', N'/ˈbæləns/', 1, 3, @Topic9ID, N'Please check your account balance before making a withdrawal.', N'Vui lòng kiểm tra số dư tài khoản trước khi rút tiền.'),
(N'collateral', N'tài sản thế chấp', N'/kəˈlætərəl/', 1, 3, @Topic9ID, N'The bank requires collateral for large loans.', N'Ngân hàng yêu cầu tài sản thế chấp cho các khoản vay lớn.'),
(N'credit', N'tín dụng', N'/ˈkredɪt/', 1, 3, @Topic9ID, N'She has a good credit score, so she qualified for a low interest rate.', N'Cô ấy có điểm tín dụng tốt, vì vậy cô ấy đủ điều kiện để có lãi suất thấp.'),
(N'currency', N'tiền tệ', N'/ˈkɜːrənsi/', 1, 3, @Topic9ID, N'The exchange rate between the two currencies fluctuates daily.', N'Tỷ giá hối đoái giữa hai loại tiền tệ biến động hàng ngày.'),
(N'deposit', N'tiền gửi, đặt cọc', N'/dɪˈpɑːzɪt/', 1, 3, @Topic9ID, N'You need to make a deposit of 20% to secure the booking.', N'Bạn cần đặt cọc 20% để giữ chỗ.'),
(N'exchange_rate', N'tỷ giá hối đoái', N'/ɪksˈtʃeɪndʒ reɪt/', 1, 3, @Topic9ID, N'The exchange rate for US dollars is very favorable today.', N'Tỷ giá hối đoái cho đô la Mỹ rất thuận lợi hôm nay.'),
(N'installment', N'trả góp', N'/ɪnˈstɔːlmənt/', 1, 3, @Topic9ID, N'You can pay for the car in monthly installments.', N'Bạn có thể trả góp hàng tháng cho chiếc xe hơi.'),
(N'interest', N'lãi suất', N'/ˈɪntrəst/', 1, 3, @Topic9ID, N'The bank offers an annual interest rate of 5% on savings accounts.', N'Ngân hàng cung cấp lãi suất hàng năm 5% cho tài khoản tiết kiệm.'),
(N'loan', N'khoản vay', N'/loʊn/', 1, 3, @Topic9ID, N'They applied for a loan to start their own business.', N'Họ đã nộp đơn xin vay vốn để khởi nghiệp kinh doanh.'),
(N'mortgage', N'thế chấp', N'/ˈmɔːrɡɪdʒ/', 1, 3, @Topic9ID, N'They took out a 30-year mortgage to buy their home.', N'Họ đã vay thế chấp 30 năm để mua nhà.'),
(N'overdraft', N'thấu chi', N'/ˈoʊvərdræft/', 1, 3, @Topic9ID, N'The bank charged a fee for exceeding the overdraft limit.', N'Ngân hàng đã tính phí vì vượt quá hạn mức thấu chi.'),
(N'statement', N'sao kê tài khoản', N'/ˈsteɪtmənt/', 1, 3, @Topic9ID, N'The bank sends a monthly statement to all account holders.', N'Ngân hàng gửi sao kê hàng tháng cho tất cả chủ tài khoản.'),
(N'transaction', N'giao dịch', N'/trænˈzækʃn/', 1, 3, @Topic9ID, N'All transactions are recorded in the system for audit purposes.', N'Tất cả các giao dịch đều được ghi lại trong hệ thống nhằm mục đích kiểm toán.'),
(N'withdrawal', N'rút tiền', N'/wɪðˈdrɔːəl/', 1, 3, @Topic9ID, N'You can make a withdrawal at any ATM.', N'Bạn có thể rút tiền tại bất kỳ máy ATM nào.');

-- Marketing & Advertising words
INSERT INTO #NewWords VALUES
(N'advertisement', N'quảng cáo', N'/ˌædvərˈtaɪzmənt/', 1, 3, @Topic10ID, N'The company placed an advertisement in the local newspaper.', N'Công ty đã đặt một quảng cáo trên báo địa phương.'),
(N'brand', N'thương hiệu', N'/brænd/', 1, 3, @Topic10ID, N'Building a strong brand is essential for long-term success.', N'Xây dựng một thương hiệu mạnh là điều cần thiết cho thành công lâu dài.'),
(N'campaign', N'chiến dịch', N'/kæmˈpeɪn/', 1, 3, @Topic10ID, N'The marketing campaign increased sales by 30 percent.', N'Chiến dịch tiếp thị đã tăng doanh số bán hàng lên 30 phần trăm.'),
(N'distribution', N'phân phối', N'/ˌdɪstrɪˈbjuːʃn/', 1, 3, @Topic10ID, N'The company has a wide distribution network across the country.', N'Công ty có mạng lưới phân phối rộng khắp cả nước.'),
(N'endorsement', N'sự chứng thực, tán thành', N'/ɪnˈdɔːrsmənt/', 1, 3, @Topic10ID, N'The celebrity endorsement boosted the product visibility.', N'Sự chứng thực của người nổi tiếng đã tăng khả năng hiển thị của sản phẩm.'),
(N'franchise', N'nhượng quyền', N'/ˈfræntʃaɪz/', 1, 3, @Topic10ID, N'They opened a franchise of the popular restaurant chain.', N'Họ đã mở một cửa hàng nhượng quyền của chuỗi nhà hàng nổi tiếng.'),
(N'launch', N'ra mắt (sản phẩm)', N'/lɔːntʃ/', 2, 3, @Topic10ID, N'The company will launch its new product line next month.', N'Công ty sẽ ra mắt dòng sản phẩm mới vào tháng tới.'),
(N'market_share', N'thị phần', N'/ˈmɑːrkɪt ʃer/', 1, 3, @Topic10ID, N'The company aims to increase its market share this year.', N'Công ty đặt mục tiêu tăng thị phần trong năm nay.'),
(N'publicity', N'công khai, sự chú ý của công chúng', N'/pʌbˈlɪsəti/', 1, 3, @Topic10ID, N'The new product received a lot of publicity on social media.', N'Sản phẩm mới đã nhận được nhiều sự chú ý của công chúng trên mạng xã hội.'),
(N'segment', N'phân khúc', N'/ˈseɡmənt/', 1, 3, @Topic10ID, N'The company targets the luxury segment of the market.', N'Công ty nhắm vào phân khúc thị trường cao cấp.'),
(N'slogan', N'khẩu hiệu', N'/ˈsloʊɡən/', 1, 3, @Topic10ID, N'The new slogan captures the essence of the brand perfectly.', N'Khẩu hiệu mới thể hiện hoàn hảo bản chất của thương hiệu.'),
(N'survey', N'khảo sát', N'/ˈsɜːrveɪ/', 1, 3, @Topic10ID, N'The survey showed that customers prefer online shopping.', N'Khảo sát cho thấy khách hàng thích mua sắm trực tuyến hơn.'),
(N'target', N'mục tiêu, đối tượng mục tiêu', N'/ˈtɑːrɡɪt/', 1, 3, @Topic10ID, N'Our target audience is young professionals aged 25 to 40.', N'Đối tượng mục tiêu của chúng tôi là các chuyên gia trẻ từ 25 đến 40 tuổi.'),
(N'trademark', N'nhãn hiệu', N'/ˈtreɪdmɑːrk/', 1, 3, @Topic10ID, N'The company registered its logo as a trademark.', N'Công ty đã đăng ký logo của mình làm nhãn hiệu.');

-- HR & Personnel words
INSERT INTO #NewWords VALUES
(N'appraisal', N'đánh giá nhân viên', N'/əˈpreɪzl/', 1, 4, @Topic11ID, N'The annual performance appraisal determines salary increases.', N'Việc đánh giá hiệu suất hàng năm quyết định mức tăng lương.'),
(N'benefit', N'phúc lợi', N'/ˈbenɪfɪt/', 1, 4, @Topic11ID, N'The job offers excellent benefits including health insurance.', N'Công việc này cung cấp phúc lợi tuyệt vời bao gồm bảo hiểm sức khỏe.'),
(N'incentive', N'sự khuyến khích, động lực', N'/ɪnˈsentɪv/', 1, 4, @Topic11ID, N'The company offers bonuses as an incentive for high performance.', N'Công ty cung cấp tiền thưởng như một động lực cho hiệu suất cao.'),
(N'interview', N'phỏng vấn', N'/ˈɪntərvjuː/', 1, 4, @Topic11ID, N'The job interview will take place next Tuesday at 10 AM.', N'Buổi phỏng vấn xin việc sẽ diễn ra vào thứ Ba tới lúc 10 giờ sáng.'),
(N'mentor', N'người hướng dẫn', N'/ˈmentɔːr/', 1, 4, @Topic11ID, N'Each new employee is assigned a mentor during the first month.', N'Mỗi nhân viên mới được chỉ định một người hướng dẫn trong tháng đầu tiên.'),
(N'payroll', N'bảng lương', N'/ˈpeɪroʊl/', 1, 4, @Topic11ID, N'The payroll department processes salaries at the end of each month.', N'Bộ phận bảng lương xử lý tiền lương vào cuối mỗi tháng.'),
(N'pension', N'lương hưu', N'/ˈpenʃn/', 1, 4, @Topic11ID, N'Employees contribute to a pension plan throughout their career.', N'Nhân viên đóng góp vào kế hoạch lương hưu trong suốt sự nghiệp của họ.'),
(N'probation', N'thử việc', N'/proʊˈbeɪʃn/', 1, 4, @Topic11ID, N'New employees have a three-month probation period.', N'Nhân viên mới có thời gian thử việc ba tháng.'),
(N'recruitment', N'tuyển dụng', N'/rɪˈkruːtmənt/', 1, 4, @Topic11ID, N'The recruitment process includes multiple rounds of interviews.', N'Quy trình tuyển dụng bao gồm nhiều vòng phỏng vấn.'),
(N'resume', N'sơ yếu lý lịch', N'/rɪˈzjuːm/', 1, 4, @Topic11ID, N'Please send your resume and cover letter to the HR department.', N'Vui lòng gửi sơ yếu lý lịch và thư xin việc đến phòng nhân sự.'),
(N'retire', N'nghỉ hưu', N'/rɪˈtaɪər/', 2, 4, @Topic11ID, N'She plans to retire at the age of 65.', N'Cô ấy dự định nghỉ hưu ở tuổi 65.'),
(N'severance', N'trợ cấp thôi việc', N'/ˈsevərəns/', 1, 4, @Topic11ID, N'The company offered a generous severance package to laid-off workers.', N'Công ty đã đề nghị gói trợ cấp thôi việc hào phóng cho công nhân bị sa thải.'),
(N'terminate', N'sa thải, chấm dứt hợp đồng', N'/ˈtɜːrmɪneɪt/', 2, 4, @Topic11ID, N'The employer can terminate the contract with a 30-day notice.', N'Người sử dụng lao động có thể chấm dứt hợp đồng với thông báo trước 30 ngày.'),
(N'vacancy', N'vị trí còn trống', N'/ˈveɪkənsi/', 1, 4, @Topic11ID, N'There is a vacancy for a marketing manager in our office.', N'Có một vị trí còn trống cho quản lý tiếp thị tại văn phòng của chúng tôi.');

-- Law & Legal words
INSERT INTO #NewWords VALUES
(N'arbitration', N'trọng tài (giải quyết tranh chấp)', N'/ˌɑːrbɪˈtreɪʃn/', 1, 4, @Topic12ID, N'The dispute was settled through arbitration rather than going to court.', N'Tranh chấp đã được giải quyết thông qua trọng tài thay vì ra tòa.'),
(N'clause', N'điều khoản', N'/klɔːz/', 1, 4, @Topic12ID, N'The contract includes a confidentiality clause.', N'Hợp đồng bao gồm một điều khoản bảo mật.'),
(N'compliance', N'tuân thủ', N'/kəmˈplaɪəns/', 1, 4, @Topic12ID, N'All employees must ensure compliance with company policies.', N'Tất cả nhân viên phải đảm bảo tuân thủ các chính sách của công ty.'),
(N'dispute', N'tranh chấp', N'/dɪˈspjuːt/', 1, 4, @Topic12ID, N'The labor dispute was resolved after weeks of negotiation.', N'Tranh chấp lao động đã được giải quyết sau nhiều tuần đàm phán.'),
(N'infringement', N'vi phạm, xâm phạm', N'/ɪnˈfrɪndʒmənt/', 1, 4, @Topic12ID, N'The company was sued for patent infringement.', N'Công ty đã bị kiện vì vi phạm bằng sáng chế.'),
(N'jurisdiction', N'thẩm quyền xét xử', N'/ˌdʒʊrɪsˈdɪkʃn/', 1, 4, @Topic12ID, N'The case falls under the jurisdiction of the federal court.', N'Vụ việc thuộc thẩm quyền xét xử của tòa án liên bang.'),
(N'lawsuit', N'vụ kiện', N'/ˈlɔːsuːt/', 1, 4, @Topic12ID, N'The company filed a lawsuit against its former partner.', N'Công ty đã đệ đơn kiện đối tác cũ của mình.'),
(N'legislation', N'pháp luật, pháp chế', N'/ˌledʒɪsˈleɪʃn/', 1, 4, @Topic12ID, N'New legislation regarding data privacy was introduced this year.', N'Luật mới liên quan đến quyền riêng tư dữ liệu đã được ban hành trong năm nay.'),
(N'liability', N'trách nhiệm pháp lý', N'/ˌlaɪəˈbɪləti/', 1, 4, @Topic12ID, N'The company has limited liability for debts.', N'Công ty có trách nhiệm pháp lý hữu hạn đối với các khoản nợ.'),
(N'litigation', N'kiện tụng', N'/ˌlɪtɪˈɡeɪʃn/', 1, 4, @Topic12ID, N'The litigation process can be lengthy and expensive.', N'Quá trình kiện tụng có thể kéo dài và tốn kém.'),
(N'notarize', N'công chứng', N'/ˈnoʊtəraɪz/', 2, 4, @Topic12ID, N'The agreement needs to be notarized by a public notary.', N'Thỏa thuận cần được công chứng bởi công chứng viên.'),
(N'regulation', N'quy định', N'/ˌreɡjuˈleɪʃn/', 1, 4, @Topic12ID, N'The company must comply with all safety regulations.', N'Công ty phải tuân thủ tất cả các quy định an toàn.'),
(N'statute', N'đạo luật', N'/ˈstætʃuːt/', 1, 4, @Topic12ID, N'The statute was enacted to protect consumer rights.', N'Đạo luật được ban hành để bảo vệ quyền lợi người tiêu dùng.'),
(N'tribunal', N'tòa án, hội đồng xét xử', N'/traɪˈbjuːnl/', 1, 4, @Topic12ID, N'The employment tribunal ruled in favor of the worker.', N'Tòa án lao động đã phán quyết có lợi cho người lao động.');

PRINT '  Data prepared. Inserting words now...';

-- ============================================================
-- PHẦN 3: INSERT WORDS + EXAMPLES + WORDTOPICS
-- ============================================================
PRINT '=== PHẦN 3: INSERT WORDS & LINK TOPICS ===';

DECLARE @WordID BIGINT;
DECLARE @Term NVARCHAR(200);
DECLARE @Meaning NVARCHAR(1000);
DECLARE @Phonetic NVARCHAR(255);
DECLARE @POSID INT;
DECLARE @DiffLevel TINYINT;
DECLARE @TopicID BIGINT;
DECLARE @Sentence NVARCHAR(2000);
DECLARE @SentenceTrans NVARCHAR(2000);

DECLARE word_cursor CURSOR FOR
    SELECT Term, Meaning, Phonetic, PartOfSpeechID, DifficultyLevel, TopicID, SentenceText, SentenceTranslation
    FROM #NewWords
    ORDER BY TopicID, Term;

OPEN word_cursor;
FETCH NEXT FROM word_cursor INTO @Term, @Meaning, @Phonetic, @POSID, @DiffLevel, @TopicID, @Sentence, @SentenceTrans;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Chỉ insert nếu chưa tồn tại
    IF NOT EXISTS (SELECT 1 FROM Words WHERE Term = @Term)
    BEGIN
        INSERT INTO Words (Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
        VALUES (@Term, @POSID, @Meaning, @Phonetic, @DiffLevel, @AdminUserID, 'Published', @Now, @Now, @Now);

        SET @WordID = SCOPE_IDENTITY();

        -- Link word to topic
        INSERT INTO WordTopics (WordID, TopicID, AssignedAt)
        VALUES (@WordID, @TopicID, @Now);

        -- Add example sentence
        INSERT INTO ExampleSentences (WordID, SentenceText, SentenceTranslation, CreatedAt, UpdatedAt)
        VALUES (@WordID, @Sentence, @SentenceTrans, @Now, @Now);

        PRINT '    + Word: ' + @Term + ' (' + @Meaning + ')';
    END
    ELSE
    BEGIN
        SET @WordID = (SELECT WordID FROM Words WHERE Term = @Term);
        -- Chỉ link nếu chưa link với topic này
        IF NOT EXISTS (SELECT 1 FROM WordTopics WHERE WordID = @WordID AND TopicID = @TopicID)
        BEGIN
            INSERT INTO WordTopics (WordID, TopicID, AssignedAt) VALUES (@WordID, @TopicID, @Now);
        END
        PRINT '    ~ SKIP: ' + @Term + ' (already exists)';
    END

    FETCH NEXT FROM word_cursor INTO @Term, @Meaning, @Phonetic, @POSID, @DiffLevel, @TopicID, @Sentence, @SentenceTrans;
END;

CLOSE word_cursor;
DEALLOCATE word_cursor;

PRINT '';

-- ============================================================
-- PHẦN 4: TẠO CÂU HỎI (4 loại) cho từng word mới
-- ============================================================
PRINT '=== PHẦN 4: TẠO CÂU HỎI (MCQ, FillBlank, Dictation, DragDrop) ===';

DECLARE @NewWordID BIGINT;
DECLARE @NewTerm NVARCHAR(200);
DECLARE @NewMeaning NVARCHAR(1000);
DECLARE @NewSentence NVARCHAR(2000);

DECLARE questions_cursor CURSOR FOR
    SELECT w.WordID, w.Term, w.Meaning, es.SentenceText
    FROM Words w
    JOIN WordTopics wt ON w.WordID = wt.WordID
    JOIN ExampleSentences es ON w.WordID = es.WordID
    WHERE wt.TopicID IN (@Topic7ID, @Topic8ID, @Topic9ID, @Topic10ID, @Topic11ID, @Topic12ID)
      AND w.ContentStatus = 'Published'
      AND NOT EXISTS (SELECT 1 FROM Questions q WHERE q.WordID = w.WordID AND q.QuestionType = 'MCQ')
    ORDER BY w.WordID;

OPEN questions_cursor;
FETCH NEXT FROM questions_cursor INTO @NewWordID, @NewTerm, @NewMeaning, @NewSentence;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- 1. MCQ: Từ -> nghĩa
    INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (@NewWordID, 'MCQ', N'Chọn nghĩa đúng của từ "' + @NewTerm + N'"', '{}', @NewMeaning, 1, @AdminUserID, 'Published', @Now, @Now, @Now);

    -- 2. FillBlank: Điền từ vào câu
    IF @NewSentence IS NOT NULL AND LEN(@NewSentence) > 0
    BEGIN
        -- Tạo câu thiếu từ (thay từ bằng _____)
        DECLARE @FillBlankSentence NVARCHAR(2000);
        SET @FillBlankSentence = REPLACE(@NewSentence, @NewTerm, '_____');
        -- Nếu từ xuất hiện dưới dạng viết hoa/khác
        IF @FillBlankSentence = @NewSentence
            SET @FillBlankSentence = REPLACE(@NewSentence, LOWER(@NewTerm), '_____');
        IF @FillBlankSentence = @NewSentence
            SET @FillBlankSentence = REPLACE(@NewSentence, UPPER(@NewTerm), '_____');

        INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
        VALUES (@NewWordID, 'FillBlank', N'Điền từ thích hợp vào chỗ trống: ' + @FillBlankSentence, '{}', @NewTerm, 2, @AdminUserID, 'Published', @Now, @Now, @Now);
    END

    -- 3. Dictation: Nghe và nhập từ
    INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (@NewWordID, 'Dictation', N'Nghe và nhập từ tiếng Anh tương ứng', '{}', @NewTerm, 1, @AdminUserID, 'Published', @Now, @Now, @Now);

    -- 4. DragDrop: Sắp xếp thành câu (nếu có câu ví dụ)
    IF @NewSentence IS NOT NULL AND LEN(@NewSentence) > 0
    BEGIN
        DECLARE @DragDropJson NVARCHAR(MAX) = '{"items":[';
        DECLARE @First BIT = 1;

        -- Split sentence by spaces and build JSON
        DECLARE @Word NVARCHAR(200);
        DECLARE split_cursor CURSOR FOR
            SELECT value FROM STRING_SPLIT(@NewSentence, ' ') WHERE value != '';

        OPEN split_cursor;
        FETCH NEXT FROM split_cursor INTO @Word;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            IF @First = 1
                SET @DragDropJson = @DragDropJson + '"' + @Word + '"';
            ELSE
                SET @DragDropJson = @DragDropJson + ',"' + @Word + '"';
            SET @First = 0;
            FETCH NEXT FROM split_cursor INTO @Word;
        END;

        CLOSE split_cursor;
        DEALLOCATE split_cursor;

        SET @DragDropJson = @DragDropJson + ']}';

        INSERT INTO Questions (WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
        VALUES (@NewWordID, 'DragDrop', N'Sắp xếp các từ để tạo thành câu hoàn chỉnh', @DragDropJson, @NewSentence, 2, @AdminUserID, 'Published', @Now, @Now, @Now);
    END

    PRINT '    + Questions created for: ' + @NewTerm;
    FETCH NEXT FROM questions_cursor INTO @NewWordID, @NewTerm, @NewMeaning, @NewSentence;
END;

CLOSE questions_cursor;
DEALLOCATE questions_cursor;

PRINT '';

-- ============================================================
-- PHẦN 5: CẬP NHẬT LEARNING PATH
-- ============================================================
PRINT '=== PHẦN 5: CẬP NHẬT LEARNING PATH ===';

-- Level 1 (TOEIC 300) -> Add Topic 7
DECLARE @Level1ID INT = (SELECT LearningPathLevelID FROM LearningPathLevels WHERE LevelCode = 'TOEIC_300');
IF NOT EXISTS (SELECT 1 FROM LearningPathTopics WHERE LearningPathLevelID = @Level1ID AND TopicID = @Topic7ID)
BEGIN
    INSERT INTO LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt)
    VALUES (@Level1ID, @Topic7ID, 3, 1, @Now);
    PRINT '  + Level 1 -> Shopping & Services (Order 3)';
END
ELSE PRINT '  ~ Level 1 -> Shopping & Services already exists';

-- Level 2 (TOEIC 500) -> Add Topic 8
DECLARE @Level2ID INT = (SELECT LearningPathLevelID FROM LearningPathLevels WHERE LevelCode = 'TOEIC_500');
IF NOT EXISTS (SELECT 1 FROM LearningPathTopics WHERE LearningPathLevelID = @Level2ID AND TopicID = @Topic8ID)
BEGIN
    INSERT INTO LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt)
    VALUES (@Level2ID, @Topic8ID, 3, 1, @Now);
    PRINT '  + Level 2 -> Health & Medical (Order 3)';
END
ELSE PRINT '  ~ Level 2 -> Health & Medical already exists';

-- Level 3 (TOEIC 700) -> Add Topic 9 + 10
DECLARE @Level3ID INT = (SELECT LearningPathLevelID FROM LearningPathLevels WHERE LevelCode = 'TOEIC_700');
IF NOT EXISTS (SELECT 1 FROM LearningPathTopics WHERE LearningPathLevelID = @Level3ID AND TopicID = @Topic9ID)
BEGIN
    INSERT INTO LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt)
    VALUES (@Level3ID, @Topic9ID, 2, 1, @Now);
    PRINT '  + Level 3 -> Finance & Banking (Order 2)';
END
ELSE PRINT '  ~ Level 3 -> Finance & Banking already exists';

IF NOT EXISTS (SELECT 1 FROM LearningPathTopics WHERE LearningPathLevelID = @Level3ID AND TopicID = @Topic10ID)
BEGIN
    INSERT INTO LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt)
    VALUES (@Level3ID, @Topic10ID, 3, 1, @Now);
    PRINT '  + Level 3 -> Marketing & Advertising (Order 3)';
END
ELSE PRINT '  ~ Level 3 -> Marketing & Advertising already exists';

-- Level 4 (TOEIC 900) -> Add Topic 11 + 12
DECLARE @Level4ID INT = (SELECT LearningPathLevelID FROM LearningPathLevels WHERE LevelCode = 'TOEIC_900');
IF NOT EXISTS (SELECT 1 FROM LearningPathTopics WHERE LearningPathLevelID = @Level4ID AND TopicID = @Topic11ID)
BEGIN
    INSERT INTO LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt)
    VALUES (@Level4ID, @Topic11ID, 2, 1, @Now);
    PRINT '  + Level 4 -> HR & Personnel Management (Order 2)';
END
ELSE PRINT '  ~ Level 4 -> HR & Personnel already exists';

IF NOT EXISTS (SELECT 1 FROM LearningPathTopics WHERE LearningPathLevelID = @Level4ID AND TopicID = @Topic12ID)
BEGIN
    INSERT INTO LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt)
    VALUES (@Level4ID, @Topic12ID, 3, 1, @Now);
    PRINT '  + Level 4 -> Law & Legal Affairs (Order 3)';
END
ELSE PRINT '  ~ Level 4 -> Law & Legal already exists';

PRINT '';

-- ============================================================
-- PHẦN 6: TẠO MINI TEST CHO CÁC TOPIC MỚI
-- ============================================================
PRINT '=== PHẦN 6: TẠO MINI TEST CHO TOPIC MỚI ===';

-- Tạo 2 tests cho mỗi topic mới
DECLARE @TestCounter INT;
DECLARE @TestID BIGINT;
DECLARE @TestTitle NVARCHAR(255);
DECLARE @TestDesc NVARCHAR(1000);

-- Danh sách topic cần tạo test
IF OBJECT_ID('tempdb..#NewTopics') IS NOT NULL DROP TABLE #NewTopics;
CREATE TABLE #NewTopics (TopicID BIGINT, TopicName NVARCHAR(200));
INSERT INTO #NewTopics VALUES (@Topic7ID, N'Shopping & Services');
INSERT INTO #NewTopics VALUES (@Topic8ID, N'Health & Medical');
INSERT INTO #NewTopics VALUES (@Topic9ID, N'Finance & Banking');
INSERT INTO #NewTopics VALUES (@Topic10ID, N'Marketing & Advertising');
INSERT INTO #NewTopics VALUES (@Topic11ID, N'HR & Personnel Management');
INSERT INTO #NewTopics VALUES (@Topic12ID, N'Law & Legal Affairs');

DECLARE topic_test_cursor CURSOR FOR
    SELECT TopicID, TopicName FROM #NewTopics ORDER BY TopicID;

OPEN topic_test_cursor;
FETCH NEXT FROM topic_test_cursor INTO @TopicID, @TopicName;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- ===== Test A: Tổng hợp =====
    SET @TestTitle = N'Bài kiểm tra: ' + @TopicName + N' (A - Tổng hợp)';
    SET @TestDesc = N'Bài kiểm tra tổng hợp gồm trắc nghiệm, điền từ, nghe chép chính tả và sắp xếp câu.';

    INSERT INTO MiniTests (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (@TopicID, @TestTitle, @TestDesc, @AdminUserID, 8, 1, 'Published', @Now, @Now, @Now);

    SET @TestID = SCOPE_IDENTITY();
    SET @TestCounter = 1;

    -- 2 MCQ
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT TOP 2 @TestID, q.QuestionID, @TestCounter + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM Questions q JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
    JOIN WordTopics wt ON w.WordID = wt.WordID AND wt.TopicID = @TopicID
    WHERE q.QuestionType = 'MCQ' AND q.ContentStatus = 'Published'
    ORDER BY NEWID();
    SET @TestCounter = @TestCounter + 2;

    -- 2 FillBlank
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT TOP 2 @TestID, q.QuestionID, @TestCounter + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM Questions q JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
    JOIN WordTopics wt ON w.WordID = wt.WordID AND wt.TopicID = @TopicID
    WHERE q.QuestionType = 'FillBlank' AND q.ContentStatus = 'Published'
    ORDER BY NEWID();
    SET @TestCounter = @TestCounter + 2;

    -- 2 Dictation
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT TOP 2 @TestID, q.QuestionID, @TestCounter + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM Questions q JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
    JOIN WordTopics wt ON w.WordID = wt.WordID AND wt.TopicID = @TopicID
    WHERE q.QuestionType = 'Dictation' AND q.ContentStatus = 'Published'
    ORDER BY NEWID();
    SET @TestCounter = @TestCounter + 2;

    -- 2 DragDrop
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT TOP 2 @TestID, q.QuestionID, @TestCounter + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM Questions q JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
    JOIN WordTopics wt ON w.WordID = wt.WordID AND wt.TopicID = @TopicID
    WHERE q.QuestionType = 'DragDrop' AND q.ContentStatus = 'Published'
    ORDER BY NEWID();

    PRINT N'  + Test A created for "' + @TopicName + N'"';

    -- ===== Test B: Nâng cao =====
    SET @TestTitle = N'Bài kiểm tra: ' + @TopicName + N' (B - Nâng cao)';
    SET @TestDesc = N'Bài kiểm tra nâng cao gồm trắc nghiệm, điền từ, nghe chép chính tả và sắp xếp câu.';

    INSERT INTO MiniTests (TopicID, TestTitle, Description, CreatedByUserID, TotalQuestions, IsPublished, ContentStatus, CreatedAt, UpdatedAt, PublishedAt)
    VALUES (@TopicID, @TestTitle, @TestDesc, @AdminUserID, 8, 1, 'Published', @Now, @Now, @Now);

    SET @TestID = SCOPE_IDENTITY();
    SET @TestCounter = 1;

    -- 2 MCQ
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT TOP 2 @TestID, q.QuestionID, @TestCounter + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM Questions q JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
    JOIN WordTopics wt ON w.WordID = wt.WordID AND wt.TopicID = @TopicID
    WHERE q.QuestionType = 'MCQ' AND q.ContentStatus = 'Published'
    ORDER BY NEWID();
    SET @TestCounter = @TestCounter + 2;

    -- 2 FillBlank
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT TOP 2 @TestID, q.QuestionID, @TestCounter + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM Questions q JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
    JOIN WordTopics wt ON w.WordID = wt.WordID AND wt.TopicID = @TopicID
    WHERE q.QuestionType = 'FillBlank' AND q.ContentStatus = 'Published'
    ORDER BY NEWID();
    SET @TestCounter = @TestCounter + 2;

    -- 2 Dictation
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT TOP 2 @TestID, q.QuestionID, @TestCounter + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM Questions q JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
    JOIN WordTopics wt ON w.WordID = wt.WordID AND wt.TopicID = @TopicID
    WHERE q.QuestionType = 'Dictation' AND q.ContentStatus = 'Published'
    ORDER BY NEWID();
    SET @TestCounter = @TestCounter + 2;

    -- 2 DragDrop
    INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder)
    SELECT TOP 2 @TestID, q.QuestionID, @TestCounter + ROW_NUMBER() OVER (ORDER BY NEWID()) - 1
    FROM Questions q JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = 'Published'
    JOIN WordTopics wt ON w.WordID = wt.WordID AND wt.TopicID = @TopicID
    WHERE q.QuestionType = 'DragDrop' AND q.ContentStatus = 'Published'
    ORDER BY NEWID();

    PRINT N'  + Test B created for "' + @TopicName + N'"';

    FETCH NEXT FROM topic_test_cursor INTO @TopicID, @TopicName;
END;

CLOSE topic_test_cursor;
DEALLOCATE topic_test_cursor;

PRINT '';

-- ============================================================
-- PHẦN 7: VERIFY
-- ============================================================
PRINT '============================================================';
PRINT '  VERIFY KẾT QUẢ';
PRINT '============================================================';
PRINT '';

PRINT '--- TỔNG QUAN DATABASE SAU KHI SEED ---';

-- Topics
PRINT '';
SELECT t.TopicID AS ID, t.TopicName, tc.CategoryName, COUNT(DISTINCT wt.WordID) AS WordCount, COUNT(DISTINCT q.QuestionID) AS QuestionCount
FROM Topics t
LEFT JOIN TopicCategories tc ON t.TopicCategoryID = tc.TopicCategoryID
LEFT JOIN WordTopics wt ON t.TopicID = wt.TopicID
LEFT JOIN Words w ON w.WordID = wt.WordID AND w.ContentStatus = 'Published'
LEFT JOIN Questions q ON q.WordID = w.WordID AND q.ContentStatus = 'Published'
WHERE t.ContentStatus = 'Published'
GROUP BY t.TopicID, t.TopicName, tc.CategoryName, t.TopicCategoryID
ORDER BY t.TopicID;

-- Learning Path
PRINT '';
PRINT '--- LEARNING PATH (sau khi cập nhật) ---';
SELECT 
    lpl.LevelCode,
    lpl.LevelName,
    lpl.DisplayOrder AS LevelOrder,
    t.TopicName,
    lpt.DisplayOrder AS TopicOrder
FROM LearningPathLevels lpl
JOIN LearningPathTopics lpt ON lpl.LearningPathLevelID = lpt.LearningPathLevelID
JOIN Topics t ON lpt.TopicID = t.TopicID
ORDER BY lpl.DisplayOrder, lpt.DisplayOrder;

-- Questions by type
PRINT '';
PRINT '--- PHÂN BỐ CÂU HỎI THEO LOẠI ---';
SELECT QuestionType, COUNT(*) AS Count FROM Questions GROUP BY QuestionType ORDER BY QuestionType;

-- MiniTests
PRINT '';
PRINT '--- THỐNG KÊ MINI TESTS ---';
DECLARE @TotalMTCnt INT, @TotalMTICnt INT;
SELECT @TotalMTCnt = COUNT(*) FROM MiniTests;
SELECT @TotalMTICnt = COUNT(*) FROM MiniTestItems;
PRINT 'Tổng số MiniTests: ' + CAST(@TotalMTCnt AS VARCHAR);
PRINT 'Tổng số MiniTestItems: ' + CAST(@TotalMTICnt AS VARCHAR);

PRINT '';
PRINT '============================================================';
PRINT '  HOÀN THÀNH SEED!';
PRINT '============================================================';
GO
