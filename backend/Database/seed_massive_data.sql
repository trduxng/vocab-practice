-- ============================================================
-- SEED MASSIVE DATA - ToeicVocabularyPlatform
-- Adds comprehensive, interconnected data across all tables
-- ============================================================
-- Creator UserID referenced: 9 (teacher@vocaboost.com - ContentCreator)
-- ============================================================

-- Enable IDENTITY_INSERT for tables where we need explicit IDs
SET IDENTITY_INSERT Words ON;
SET IDENTITY_INSERT ExampleSentences ON;
SET IDENTITY_INSERT Questions ON;
SET IDENTITY_INSERT MiniTests ON;
GO

-- ============================================================
-- PART 1: UPDATE TOPIC 7 (A.I English) TO PUBLISHED
-- ============================================================
UPDATE Topics
SET ContentStatus = 'Published',
    ReviewedByUserID = 1,
    ReviewedAt = SYSDATETIMEOFFSET(),
    PublishedAt = SYSDATETIMEOFFSET()
WHERE TopicID = 7 AND ContentStatus = 'Draft';

-- ============================================================
-- PART 2: NEW WORDS
-- ============================================================
-- Starting from WordID 273 (max is 272)

-- === TOPIC 1: TOEIC Starter Core (add 8 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(273, N'Delegate', 2, N'Ủy quyền, phân công', N'/ˈdel.ɪ.ɡeɪt/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(274, N'Allocate', 2, N'Phân bổ, cấp phát', N'/ˈæl.ə.keɪt/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(275, N'Dividend', 1, N'Cổ tức', N'/ˈdɪv.ɪ.dend/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(276, N'Forecast', 2, N'Dự báo', N'/ˈfɔːr.kæst/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(277, N'Liquidate', 2, N'Thanh lý', N'/ˈlɪk.wɪ.deɪt/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(278, N'Fiscal', 3, N'Thuộc tài chính, ngân sách', N'/ˈfɪs.kəl/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(279, N'Downsize', 2, N'Thu hẹp quy mô', N'/ˈdaʊn.saɪz/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(280, N'Equity', 1, N'Vốn chủ sở hữu', N'/ˈek.wɪ.ti/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- === TOPIC 2: TOEIC Office & Meetings (add 8 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(281, N'Ballot', 1, N'Lá phiếu, bỏ phiếu', N'/ˈbæl.ət/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(282, N'Consensus', 1, N'Sự đồng thuận', N'/kənˈsen.səs/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(283, N'Stakeholder', 1, N'Bên liên quan', N'/ˈsteɪk.həʊl.dər/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(284, N'Benchmark', 1, N'Điểm chuẩn, chuẩn mực', N'/ˈbentʃ.mɑːrk/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(285, N'Mandate', 1, N'Nhiệm vụ, ủy thác', N'/ˈmæn.deɪt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(286, N'Agenda', 1, N'Chương trình nghị sự', N'/əˈdʒen.də/', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
-- Note: 'Agenda' already exists in Topic 2, so I won't add it again. Let me use different words.
(287, N'Minutes', 1, N'Biên bản cuộc họp', N'/ˈmɪn.ɪts/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
-- Note: 'Minutes' already exists. Let me replace with different words.
(288, N'Quorum', 1, N'Số đại biểu tối thiểu', N'/ˈkwɔːr.əm/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(289, N'Arbitrate', 2, N'Phân xử, làm trọng tài', N'/ˈɑːr.bɪ.treɪt/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(290, N'Ratify', 2, N'Phê chuẩn, thông qua', N'/ˈræt.ɪ.faɪ/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- Fix: Some words already existed. Let me adjust Topic 2 words:
-- Actually, Agenda (ID exists) and Minutes (ID exists) are already in topic 2. 
-- Let me overwrite with different unique words
UPDATE Words SET Term = 'Convene', Meaning = N'Triệu tập, họp', Phonetic = '/kənˈviːn/', DifficultyLevel = 3 WHERE WordID = 286;
UPDATE Words SET Term = 'Adjourn', Meaning = N'Hoãn lại, tạm nghỉ', Phonetic = '/əˈdʒɜːrn/', DifficultyLevel = 3 WHERE WordID = 287;

-- === TOPIC 3: Daily Routines & Activities (add 8 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(291, N'Errand', 1, N'Việc vặt, việc lặt vặt', N'/ˈer.ənd/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(292, N'Nap', 1, N'Giấc ngủ ngắn', N'/næp/', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(293, N'Stroll', 2, N'Đi dạo, tản bộ', N'/strəʊl/', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(294, N'Groom', 2, N'Chải chuốt, vệ sinh cá nhân', N'/ɡruːm/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(295, N'Procrastinate', 2, N'Trì hoãn, chần chừ', N'/prəˈkræs.tɪ.neɪt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(296, N'Refresh', 2, N'Làm tươi mới, nghỉ ngơi', N'/rɪˈfreʃ/', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(297, N'Winding', 3, N'Quanh co, uốn lượn', N'/ˈwaɪn.dɪŋ/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(298, N'Habitual', 3, N'Thói quen, theo thói quen', N'/həˈbɪtʃ.u.əl/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- === TOPIC 4: Airport & Flight Travel (add 8 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(299, N'Concourse', 1, N'Nhà ga, sảnh chính', N'/ˈkɒŋ.kɔːrs/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(300, N'Tarmac', 1, N'Đường băng sân bay', N'/ˈtɑːr.mæk/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(301, N'Carry-on', 1, N'Hành lý xách tay', N'/ˈkær.i.ɒn/', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(302, N'Overbook', 2, N'Bán vé quá số lượng', N'/ˌəʊ.vərˈbʊk/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(303, N'Premium', 3, N'Cao cấp, thêm phí', N'/ˈpriː.mi.əm/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(304, N'Transit', 1, N'Quá cảnh', N'/ˈtræn.zɪt/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(305, N'Aisle', 1, N'Lối đi (trên máy bay)', N'/aɪl/', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(306, N'Turbulence', 1, N'Nhiễu động không khí', N'/ˈtɜːr.bjə.ləns/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- === TOPIC 5: Software & Office Tech (add 10 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(307, N'Bandwidth', 1, N'Băng thông', N'/ˈbænd.wɪdθ/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(308, N'Cache', 1, N'Bộ nhớ đệm', N'/kæʃ/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(309, N'Compile', 2, N'Biên dịch, tổng hợp', N'/kəmˈpaɪl/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(310, N'Debug', 2, N'Gỡ lỗi', N'/diːˈbʌɡ/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(311, N'Deploy', 2, N'Triển khai', N'/dɪˈplɔɪ/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(312, N'Latency', 1, N'Độ trễ', N'/ˈleɪ.tən.si/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(313, N'Migrate', 2, N'Di chuyển, di dời (dữ liệu)', N'/maɪˈɡreɪt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(314, N'Portal', 1, N'Cổng thông tin', N'/ˈpɔːr.təl/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(315, N'Query', 1, N'Truy vấn', N'/ˈkwɪr.i/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(316, N'Repository', 1, N'Kho lưu trữ', N'/rɪˈpɒz.ɪ.tɔːr.i/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- === TOPIC 6: Academic Study & Research (add 8 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(317, N'Abstract', 3, N'Trừu tượng; Tóm tắt (báo cáo)', N'/ˈæb.strækt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(318, N'Annotate', 2, N'Chú thích, ghi chú', N'/ˈæn.ə.teɪt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(319, N'Citation', 1, N'Trích dẫn', N'/saɪˈteɪ.ʃən/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(320, N'Peer', 3, N'Đồng cấp, đồng niên', N'/pɪr/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(321, N'Plagiarize', 2, N'Đạo văn', N'/ˈpleɪ.dʒər.aɪz/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(322, N'Practicum', 1, N'Thực tập, thực hành', N'/ˈpræk.tɪ.kəm/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(323, N'Tenure', 1, N'Nhiệm kỳ, biên chế', N'/ˈten.jər/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(324, N'Quantitative', 3, N'Định lượng', N'/ˈkwɒn.tɪ.tə.tɪv/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- === TOPIC 7: A.I English (15 new words - currently has ZERO words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(325, N'Algorithm', 1, N'Thuật toán', N'/ˈæl.ɡə.rɪð.əm/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(326, N'Neural', 3, N'Thuộc về thần kinh (mạng)', N'/ˈnjʊr.əl/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(327, N'Training', 1, N'Quá trình huấn luyện (AI)', N'/ˈtreɪ.nɪŋ/', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(328, N'Inference', 1, N'Suy luận, suy diễn', N'/ˈɪn.fər.əns/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(329, N'Dataset', 1, N'Bộ dữ liệu', N'/ˈdeɪ.tə.set/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(330, N'Tokenize', 2, N'Phân tách từ (token hóa)', N'/ˈtəʊ.kən.aɪz/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(331, N'Embedding', 1, N'Véc-tơ nhúng, biểu diễn', N'/ɪmˈbed.ɪŋ/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(332, N'Fine-tune', 2, N'Tinh chỉnh (mô hình AI)', N'/ˈfaɪn.tjuːn/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(333, N'Overfitting', 1, N'Quá khớp (mô hình học)', N'/ˌəʊ.vərˈfɪt.ɪŋ/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(334, N'Transformer', 1, N'Bộ biến đổi (kiến trúc AI)', N'/trænsˈfɔːr.mər/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(335, N'Classification', 1, N'Phân loại', N'/ˌklæs.ɪ.fɪˈkeɪ.ʃən/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(336, N'Generative', 3, N'Sinh tạo (tạo nội dung)', N'/ˈdʒen.ər.ə.tɪv/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(337, N'Prompt', 1, N'Câu lệnh, yêu cầu (cho AI)', N'/prɒmpt/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(338, N'Semantic', 3, N'Ngữ nghĩa', N'/sɪˈmæn.tɪk/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(339, N'Latent', 3, N'Tiềm ẩn (ẩn trong mô hình)', N'/ˈleɪ.tənt/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- === TOPIC 8: Shopping & Services (add 8 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(340, N'Consignment', 1, N'Lô hàng gửi bán', N'/kənˈsaɪn.mənt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(341, N'Merchandise', 1, N'Hàng hóa', N'/ˈmɜːr.tʃən.daɪs/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(342, N'Procurement', 1, N'Thu mua, mua sắm', N'/prəˈkjʊr.mənt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(343, N'Retail', 1, N'Bán lẻ', N'/ˈriː.teɪl/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(344, N'Vendor', 1, N'Nhà cung cấp, người bán', N'/ˈven.dər/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(345, N'Surcharge', 1, N'Phụ phí', N'/ˈsɜːr.tʃɑːrdʒ/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(346, N'Appraisal', 1, N'Định giá, thẩm định', N'/əˈpreɪ.zəl/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(347, N'Clearance', 1, N'Thanh lý, giải phóng hàng', N'/ˈklɪr.əns/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- === TOPIC 9: Health & Medical (add 8 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(348, N'Contagious', 3, N'Lây nhiễm', N'/kənˈteɪ.dʒəs/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(349, N'Chronic', 3, N'Mãn tính', N'/ˈkrɒn.ɪk/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(350, N'Diagnose', 2, N'Chẩn đoán', N'/ˈdaɪ.əɡ.nəʊz/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(351, N'Immunity', 1, N'Miễn dịch', N'/ɪˈmjuː.nɪ.ti/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(352, N'Malnutrition', 1, N'Suy dinh dưỡng', N'/ˌmæl.nuːˈtrɪʃ.ən/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(353, N'Prognosis', 1, N'Tiên lượng (bệnh)', N'/prɒɡˈnəʊ.sɪs/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(354, N'Remission', 1, N'Thuyên giảm (bệnh)', N'/rɪˈmɪʃ.ən/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(355, N'Sanitation', 1, N'Vệ sinh môi trường', N'/ˌsæn.ɪˈteɪ.ʃən/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- === TOPIC 10: Finance & Banking (add 8 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(356, N'Amortize', 2, N'Khấu hao, trả dần', N'/ˈæm.ər.taɪz/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(357, N'Annuity', 1, N'Niên kim', N'/əˈnjuː.ɪ.ti/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(358, N'Deficit', 1, N'Thâm hụt', N'/ˈdef.ɪ.sɪt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(359, N'Fiscal', 1, N'Năm tài chính', N'/ˈfɪs.kəl/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(360, N'Hedge', 2, N'Phòng ngừa (rủi ro)', N'/hedʒ/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(361, N'Leverage', 1, N'Đòn bẩy tài chính', N'/ˈlev.ər.ɪdʒ/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(362, N'Liquidity', 1, N'Tính thanh khoản', N'/lɪˈkwɪd.ɪ.ti/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(363, N'Principal', 1, N'Tiền gốc (khoản vay)', N'/ˈprɪn.sə.pəl/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- === TOPIC 11: Marketing & Advertising (add 8 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(364, N'Demographic', 1, N'Nhân khẩu học', N'/ˌdem.əˈɡræf.ɪk/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(365, N'Engagement', 1, N'Sự tương tác, gắn kết', N'/ɪnˈɡeɪdʒ.mənt/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(366, N'Funnel', 1, N'Phễu (marketing funnel)', N'/ˈfʌn.əl/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(367, N'Influencer', 1, N'Người có tầm ảnh hưởng', N'/ˈɪn.flu.ən.sər/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(368, N'Monetize', 2, N'Kiếm tiền từ, thương mại hóa', N'/ˈmʌn.ɪ.taɪz/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(369, N'Optimize', 2, N'Tối ưu hóa', N'/ˈɒp.tɪ.maɪz/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(370, N'Outreach', 1, N'Tiếp cận, vươn tới', N'/ˈaʊt.riːtʃ/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(371, N'Conversion', 1, N'Chuyển đổi (khách hàng)', N'/kənˈvɜːr.ʒən/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- === TOPIC 12: HR & Personnel Management (add 8 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(372, N'Attrition', 1, N'Sự nghỉ việc, hao hụt nhân sự', N'/əˈtrɪʃ.ən/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(373, N'Compliance', 1, N'Tuân thủ (quy định)', N'/kəmˈplaɪ.əns/', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(374, N'Delegation', 1, N'Sự ủy quyền, phân công', N'/ˌdel.ɪˈɡeɪ.ʃən/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(375, N'Remuneration', 1, N'Thù lao, đãi ngộ', N'/rɪˌmjuː.nərˈeɪ.ʃən/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(376, N'Succession', 1, N'Sự kế nhiệm', N'/səkˈseʃ.ən/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(377, N'Contingent', 3, N'Tạm thời, phụ thuộc', N'/kənˈtɪn.dʒənt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(378, N'Discretion', 1, N'Quyền quyết định, thận trọng', N'/dɪˈskreʃ.ən/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(379, N'Grievance', 1, N'Khiếu nại (nhân viên)', N'/ˈɡriː.vəns/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- === TOPIC 13: Law & Legal Affairs (add 8 words) ===
INSERT INTO Words (WordID, Term, PartOfSpeechID, Meaning, Phonetic, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(380, N'Affidavit', 1, N'Bản tuyên thệ, lời khai', N'/ˌæf.ɪˈdeɪ.vɪt/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(381, N'Covenant', 1, N'Giao ước, khế ước', N'/ˈkʌv.ən.ənt/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(382, N'Deposition', 1, N'Lời khai (trước tòa)', N'/ˌdep.əˈzɪʃ.ən/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(383, N'Fiduciary', 3, N'Ủy thác, tín thác', N'/fɪˈdjuː.ʃi.er.i/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(384, N'Indictment', 1, N'Bản cáo trạng', N'/ɪnˈdaɪt.mənt/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(385, N'Injunction', 1, N'Lệnh cấm, lệnh tòa', N'/ɪnˈdʒʌŋk.ʃən/', 4, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(386, N'Precedent', 1, N'Tiền lệ pháp lý', N'/ˈpres.ɪ.dənt/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(387, N'Testimony', 1, N'Lời khai, chứng cứ', N'/ˈtes.tɪ.mə.ni/', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

SET IDENTITY_INSERT Words OFF;
GO
PRINT '✅ Words inserted successfully. New WordID range: 273-387';

-- ============================================================
-- PART 3: WORD-TOPIC MAPPINGS
-- ============================================================
INSERT INTO WordTopics (WordID, TopicID, AssignedAt) VALUES
-- Topic 1: 8 words
(273, 1, SYSDATETIMEOFFSET()), (274, 1, SYSDATETIMEOFFSET()), (275, 1, SYSDATETIMEOFFSET()), (276, 1, SYSDATETIMEOFFSET()),
(277, 1, SYSDATETIMEOFFSET()), (278, 1, SYSDATETIMEOFFSET()), (279, 1, SYSDATETIMEOFFSET()), (280, 1, SYSDATETIMEOFFSET()),
-- Topic 2: 8 words (using corrected words Convence=286, Adjourn=287)
(281, 2, SYSDATETIMEOFFSET()), (282, 2, SYSDATETIMEOFFSET()), (283, 2, SYSDATETIMEOFFSET()), (284, 2, SYSDATETIMEOFFSET()),
(285, 2, SYSDATETIMEOFFSET()), (286, 2, SYSDATETIMEOFFSET()), (287, 2, SYSDATETIMEOFFSET()), (288, 2, SYSDATETIMEOFFSET()), (289, 2, SYSDATETIMEOFFSET()), (290, 2, SYSDATETIMEOFFSET()),
-- Topic 3: 8 words
(291, 3, SYSDATETIMEOFFSET()), (292, 3, SYSDATETIMEOFFSET()), (293, 3, SYSDATETIMEOFFSET()), (294, 3, SYSDATETIMEOFFSET()),
(295, 3, SYSDATETIMEOFFSET()), (296, 3, SYSDATETIMEOFFSET()), (297, 3, SYSDATETIMEOFFSET()), (298, 3, SYSDATETIMEOFFSET()),
-- Topic 4: 8 words
(299, 4, SYSDATETIMEOFFSET()), (300, 4, SYSDATETIMEOFFSET()), (301, 4, SYSDATETIMEOFFSET()), (302, 4, SYSDATETIMEOFFSET()),
(303, 4, SYSDATETIMEOFFSET()), (304, 4, SYSDATETIMEOFFSET()), (305, 4, SYSDATETIMEOFFSET()), (306, 4, SYSDATETIMEOFFSET()),
-- Topic 5: 10 words
(307, 5, SYSDATETIMEOFFSET()), (308, 5, SYSDATETIMEOFFSET()), (309, 5, SYSDATETIMEOFFSET()), (310, 5, SYSDATETIMEOFFSET()),
(311, 5, SYSDATETIMEOFFSET()), (312, 5, SYSDATETIMEOFFSET()), (313, 5, SYSDATETIMEOFFSET()), (314, 5, SYSDATETIMEOFFSET()),
(315, 5, SYSDATETIMEOFFSET()), (316, 5, SYSDATETIMEOFFSET()),
-- Topic 6: 8 words
(317, 6, SYSDATETIMEOFFSET()), (318, 6, SYSDATETIMEOFFSET()), (319, 6, SYSDATETIMEOFFSET()), (320, 6, SYSDATETIMEOFFSET()),
(321, 6, SYSDATETIMEOFFSET()), (322, 6, SYSDATETIMEOFFSET()), (323, 6, SYSDATETIMEOFFSET()), (324, 6, SYSDATETIMEOFFSET()),
-- Topic 7: 15 words
(325, 7, SYSDATETIMEOFFSET()), (326, 7, SYSDATETIMEOFFSET()), (327, 7, SYSDATETIMEOFFSET()), (328, 7, SYSDATETIMEOFFSET()),
(329, 7, SYSDATETIMEOFFSET()), (330, 7, SYSDATETIMEOFFSET()), (331, 7, SYSDATETIMEOFFSET()), (332, 7, SYSDATETIMEOFFSET()),
(333, 7, SYSDATETIMEOFFSET()), (334, 7, SYSDATETIMEOFFSET()), (335, 7, SYSDATETIMEOFFSET()), (336, 7, SYSDATETIMEOFFSET()),
(337, 7, SYSDATETIMEOFFSET()), (338, 7, SYSDATETIMEOFFSET()), (339, 7, SYSDATETIMEOFFSET()),
-- Topic 8: 8 words
(340, 8, SYSDATETIMEOFFSET()), (341, 8, SYSDATETIMEOFFSET()), (342, 8, SYSDATETIMEOFFSET()), (343, 8, SYSDATETIMEOFFSET()),
(344, 8, SYSDATETIMEOFFSET()), (345, 8, SYSDATETIMEOFFSET()), (346, 8, SYSDATETIMEOFFSET()), (347, 8, SYSDATETIMEOFFSET()),
-- Topic 9: 8 words
(348, 9, SYSDATETIMEOFFSET()), (349, 9, SYSDATETIMEOFFSET()), (350, 9, SYSDATETIMEOFFSET()), (351, 9, SYSDATETIMEOFFSET()),
(352, 9, SYSDATETIMEOFFSET()), (353, 9, SYSDATETIMEOFFSET()), (354, 9, SYSDATETIMEOFFSET()), (355, 9, SYSDATETIMEOFFSET()),
-- Topic 10: 8 words
(356, 10, SYSDATETIMEOFFSET()), (357, 10, SYSDATETIMEOFFSET()), (358, 10, SYSDATETIMEOFFSET()), (359, 10, SYSDATETIMEOFFSET()),
(360, 10, SYSDATETIMEOFFSET()), (361, 10, SYSDATETIMEOFFSET()), (362, 10, SYSDATETIMEOFFSET()), (363, 10, SYSDATETIMEOFFSET()),
-- Topic 11: 8 words
(364, 11, SYSDATETIMEOFFSET()), (365, 11, SYSDATETIMEOFFSET()), (366, 11, SYSDATETIMEOFFSET()), (367, 11, SYSDATETIMEOFFSET()),
(368, 11, SYSDATETIMEOFFSET()), (369, 11, SYSDATETIMEOFFSET()), (370, 11, SYSDATETIMEOFFSET()), (371, 11, SYSDATETIMEOFFSET()),
-- Topic 12: 8 words
(372, 12, SYSDATETIMEOFFSET()), (373, 12, SYSDATETIMEOFFSET()), (374, 12, SYSDATETIMEOFFSET()), (375, 12, SYSDATETIMEOFFSET()),
(376, 12, SYSDATETIMEOFFSET()), (377, 12, SYSDATETIMEOFFSET()), (378, 12, SYSDATETIMEOFFSET()), (379, 12, SYSDATETIMEOFFSET()),
-- Topic 13: 8 words
(380, 13, SYSDATETIMEOFFSET()), (381, 13, SYSDATETIMEOFFSET()), (382, 13, SYSDATETIMEOFFSET()), (383, 13, SYSDATETIMEOFFSET()),
(384, 13, SYSDATETIMEOFFSET()), (385, 13, SYSDATETIMEOFFSET()), (386, 13, SYSDATETIMEOFFSET()), (387, 13, SYSDATETIMEOFFSET());

PRINT '✅ WordTopics inserted successfully.';

-- ============================================================
-- PART 4: EXAMPLE SENTENCES
-- ============================================================
-- Starting from ExampleSentenceID 196 (max is 195)

INSERT INTO ExampleSentences (ExampleSentenceID, WordID, SentenceText, SentenceTranslation)
VALUES
-- Topic 1 words
(196, 273, N'The manager decided to delegate the task to her assistant.', N'Người quản lý quyết định ủy quyền nhiệm vụ cho trợ lý của cô ấy.'),
(197, 274, N'We need to allocate the budget carefully for this quarter.', N'Chúng ta cần phân bổ ngân sách cẩn thận cho quý này.'),
(198, 275, N'The company announced a dividend of $2 per share.', N'Công ty đã công bố cổ tức 2 đô la mỗi cổ phiếu.'),
(199, 276, N'The sales forecast predicts a 10% increase next year.', N'Dự báo doanh số dự đoán mức tăng 10% vào năm tới.'),
(200, 277, N'The company had to liquidate its assets to pay off debts.', N'Công ty phải thanh lý tài sản để trả nợ.'),
(201, 278, N'The fiscal year ends on December 31st.', N'Năm tài chính kết thúc vào ngày 31 tháng 12.'),
(202, 279, N'The firm decided to downsize its workforce by 20%.', N'Công ty quyết định thu hẹp quy mô lực lượng lao động 20%.'),
(203, 280, N'Home equity loans are popular among homeowners.', N'Các khoản vay vốn chủ sở hữu nhà phổ biến trong giới chủ nhà.'),
-- Topic 2 words
(204, 281, N'Members cast their ballots to elect the new chairperson.', N'Các thành viên bỏ phiếu để bầu chủ tịch mới.'),
(205, 282, N'The team reached a consensus after a long discussion.', N'Nhóm đã đạt được sự đồng thuận sau một cuộc thảo luận dài.'),
(206, 283, N'All stakeholders were invited to the project meeting.', N'Tất cả các bên liên quan đã được mời đến cuộc họp dự án.'),
(207, 284, N'We use industry benchmarks to measure our performance.', N'Chúng tôi sử dụng các điểm chuẩn ngành để đo lường hiệu suất.'),
(208, 285, N'The government issued a mandate to reduce carbon emissions.', N'Chính phủ ban hành nhiệm vụ giảm khí thải carbon.'),
(209, 286, N'The board decided to convene an emergency meeting.', N'Hội đồng quyết định triệu tập một cuộc họp khẩn cấp.'),
(210, 287, N'The chairman decided to adjourn the meeting until next week.', N'Chủ tịch quyết định hoãn cuộc họp đến tuần sau.'),
(211, 288, N'We need a quorum of at least ten members to vote.', N'Chúng tôi cần tối thiểu mười thành viên để bỏ phiếu.'),
(212, 289, N'A neutral third party was called to arbitrate the dispute.', N'Một bên thứ ba trung lập được mời đến phân xử tranh chấp.'),
(213, 290, N'The board ratified the agreement unanimously.', N'Hội đồng đã phê chuẩn thỏa thuận nhất trí.'),
-- Topic 3 words
(214, 291, N'I have a few errands to run after work.', N'Tôi có vài việc vặt cần làm sau giờ làm.'),
(215, 292, N'She took a short nap in the afternoon.', N'Cô ấy đã chợp mắt một lát vào buổi chiều.'),
(216, 293, N'They went for a stroll along the beach.', N'Họ đi dạo dọc theo bãi biển.'),
(217, 294, N'He spends 15 minutes grooming himself every morning.', N'Anh ấy dành 15 phút chải chuốt mỗi sáng.'),
(218, 295, N'Stop procrastinating and start your homework now!', N'Đừng trì hoãn nữa, hãy bắt đầu làm bài tập ngay!'),
(219, 296, N'A cold shower can refresh you after a long day.', N'Tắm nước lạnh có thể giúp bạn sảng khoái sau một ngày dài.'),
(220, 297, N'The path took a winding route through the forest.', N'Con đường uốn lượn xuyên qua khu rừng.'),
(221, 298, N'She is a habitual early riser.', N'Cô ấy có thói quen dậy sớm.'),
-- Topic 4 words
(222, 299, N'The airport concourse was crowded with travelers.', N'Nhà ga sân bay rất đông đúc du khách.'),
(223, 300, N'The plane taxied across the tarmac before takeoff.', N'Máy bay lăn trên đường băng trước khi cất cánh.'),
(224, 301, N'You are allowed one carry-on bag on the flight.', N'Bạn được phép mang một hành lý xách tay trên chuyến bay.'),
(225, 302, N'The airline overbooked the flight and asked for volunteers.', N'Hãng hàng không bán vé quá số lượng và yêu cầu tình nguyện viên.'),
(226, 303, N'Passengers can upgrade to premium economy for more legroom.', N'Hành khách có thể nâng cấp lên phổ thông cao cấp để có nhiều chỗ để chân hơn.'),
(227, 304, N'We have a two-hour transit stop in Singapore.', N'Chúng tôi có điểm dừng quá cảnh hai giờ ở Singapore.'),
(228, 305, N'She prefers an aisle seat on long flights.', N'Cô ấy thích ngồi ghế lối đi trên các chuyến bay dài.'),
(229, 306, N'The pilot warned passengers about upcoming turbulence.', N'Phi công cảnh báo hành khách về nhiễu động không khí sắp tới.'),
-- Topic 5 words
(230, 307, N'The video streaming service requires high bandwidth.', N'Dịch vụ phát trực tuyến video yêu cầu băng thông cao.'),
(231, 308, N'Clearing the browser cache can improve loading speed.', N'Xóa bộ nhớ đệm trình duyệt có thể cải thiện tốc độ tải.'),
(232, 309, N'The developer compiled the source code successfully.', N'Nhà phát triển đã biên dịch mã nguồn thành công.'),
(233, 310, N'Engineers spent hours debugging the software issue.', N'Các kỹ sư đã dành hàng giờ để gỡ lỗi sự cố phần mềm.'),
(234, 311, N'The team plans to deploy the new app in March.', N'Nhóm dự định triển khai ứng dụng mới vào tháng ba.'),
(235, 312, N'Low latency is crucial for online gaming.', N'Độ trễ thấp rất quan trọng đối với chơi game trực tuyến.'),
(236, 313, N'We need to migrate the data to the new server.', N'Chúng tôi cần di chuyển dữ liệu sang máy chủ mới.'),
(237, 314, N'Employees can access company resources through the portal.', N'Nhân viên có thể truy cập tài nguyên công ty qua cổng thông tin.'),
(238, 315, N'The database query returned thousands of results.', N'Truy vấn cơ sở dữ liệu trả về hàng nghìn kết quả.'),
(239, 316, N'All source code is stored in a central repository.', N'Tất cả mã nguồn được lưu trữ trong một kho lưu trữ trung tâm.'),
-- Topic 6 words
(240, 317, N'The research paper includes an abstract and keywords.', N'Bài nghiên cứu bao gồm phần tóm tắt và từ khóa.'),
(241, 318, N'Students should annotate the text while reading.', N'Sinh viên nên chú thích văn bản trong khi đọc.'),
(242, 319, N'Make sure to include proper citations in your essay.', N'Hãy chắc chắn bao gồm các trích dẫn phù hợp trong bài luận của bạn.'),
(243, 320, N'The research was reviewed by her peers before publication.', N'Nghiên cứu đã được đồng nghiệp xem xét trước khi xuất bản.'),
(244, 321, N'Plagiarizing someone else work is a serious offense.', N'Đạo văn tác phẩm của người khác là một hành vi nghiêm trọng.'),
(245, 322, N'The teaching practicum lasts for one semester.', N'Kỳ thực tập giảng dạy kéo dài một học kỳ.'),
(246, 323, N'After six years, she was granted academic tenure.', N'Sau sáu năm, cô ấy được cấp biên chế giảng dạy.'),
(247, 324, N'The study uses quantitative methods to analyze the data.', N'Nghiên cứu sử dụng phương pháp định lượng để phân tích dữ liệu.'),
-- Topic 7 words
(248, 325, N'The recommendation algorithm suggests videos based on your history.', N'Thuật toán đề xuất gợi ý video dựa trên lịch sử của bạn.'),
(249, 326, N'Neural networks are inspired by the human brain structure.', N'Mạng nơ-ron được lấy cảm hứng từ cấu trúc não người.'),
(250, 327, N'Training a large language model requires massive computing power.', N'Huấn luyện một mô hình ngôn ngữ lớn đòi hỏi sức mạnh tính toán khổng lồ.'),
(251, 328, N'An inference engine processes the data to make predictions.', N'Công cụ suy luận xử lý dữ liệu để đưa ra dự đoán.'),
(252, 329, N'The dataset contains over one million labeled images.', N'Bộ dữ liệu chứa hơn một triệu hình ảnh đã được gắn nhãn.'),
(253, 330, N'The system uses tokenization to split text into smaller units.', N'Hệ thống sử dụng token hóa để phân tách văn bản thành các đơn vị nhỏ hơn.'),
(254, 331, N'Word embeddings capture semantic relationships between words.', N'Véc-tơ nhúng từ nắm bắt các mối quan hệ ngữ nghĩa giữa các từ.'),
(255, 332, N'We need to fine-tune the model for better accuracy.', N'Chúng tôi cần tinh chỉnh mô hình để có độ chính xác cao hơn.'),
(256, 333, N'Overfitting occurs when the model memorizes the training data.', N'Quá khớp xảy ra khi mô hình ghi nhớ dữ liệu huấn luyện.'),
(257, 334, N'The Transformer architecture revolutionized natural language processing.', N'Kiến trúc Transformer đã cách mạng hóa xử lý ngôn ngữ tự nhiên.'),
(258, 335, N'Spam detection is a common text classification task.', N'Phát hiện thư rác là một nhiệm vụ phân loại văn bản phổ biến.'),
(259, 336, N'Generative AI can create realistic images and text.', N'AI tạo sinh có thể tạo ra hình ảnh và văn bản chân thực.'),
(260, 337, N'A well-crafted prompt leads to better AI responses.', N'Câu lệnh được viết tốt sẽ dẫn đến phản hồi AI tốt hơn.'),
(261, 338, N'Semantic analysis helps understand the meaning of the text.', N'Phân tích ngữ nghĩa giúp hiểu ý nghĩa của văn bản.'),
(262, 339, N'The model learns latent features from the input data.', N'Mô hình học các đặc trưng tiềm ẩn từ dữ liệu đầu vào.'),
-- Topic 8 words
(263, 340, N'The store sells items on a consignment basis.', N'Cửa hàng bán hàng theo hình thức gửi bán.'),
(264, 341, N'All merchandise must be inspected before shipment.', N'Tất cả hàng hóa phải được kiểm tra trước khi vận chuyển.'),
(265, 342, N'The procurement department handles supplier contracts.', N'Phòng thu mua xử lý hợp đồng nhà cung cấp.'),
(266, 343, N'Retail prices are often higher than wholesale prices.', N'Giá bán lẻ thường cao hơn giá bán buôn.'),
(267, 344, N'The vendor delivered the goods on time.', N'Nhà cung cấp đã giao hàng đúng hạn.'),
(268, 345, N'A surcharge applies for express delivery.', N'Phụ phí áp dụng cho giao hàng hỏa tốc.'),
(269, 346, N'The jewelry was sent for appraisal before auction.', N'Trang sức đã được gửi đi thẩm định trước khi đấu giá.'),
(270, 347, N'The store is having a clearance sale this weekend.', N'Cửa hàng đang có đợt giảm giá thanh lý cuối tuần này.'),
-- Topic 9 words
(271, 348, N'The flu is highly contagious during winter months.', N'Bệnh cúm rất dễ lây lan trong những tháng mùa đông.'),
(272, 349, N'She suffers from chronic back pain.', N'Cô ấy bị đau lưng mãn tính.'),
(273, 350, N'The doctor diagnosed him with diabetes.', N'Bác sĩ chẩn đoán anh ấy mắc bệnh tiểu đường.'),
(274, 351, N'Vaccination helps build immunity against diseases.', N'Tiêm phòng giúp xây dựng miễn dịch chống lại bệnh tật.'),
(275, 352, N'Children in poverty often suffer from malnutrition.', N'Trẻ em nghèo thường bị suy dinh dưỡng.'),
(276, 353, N'The prognosis for recovery is excellent.', N'Tiên lượng phục hồi là rất tốt.'),
(277, 354, N'The cancer patient is in remission after treatment.', N'Bệnh nhân ung thư đang trong giai đoạn thuyên giảm sau điều trị.'),
(278, 355, N'Access to clean water and sanitation is a basic human right.', N'Tiếp cận nước sạch và vệ sinh môi trường là quyền cơ bản của con người.'),
-- Topic 10 words
(279, 356, N'The loan is amortized over 20 years.', N'Khoản vay được khấu hao trong 20 năm.'),
(280, 357, N'She receives monthly payments from her annuity.', N'Cô ấy nhận thanh toán hàng tháng từ niên kim của mình.'),
(281, 358, N'The budget deficit has increased significantly.', N'Thâm hụt ngân sách đã tăng đáng kể.'),
(282, 359, N'The fiscal year starts in April for this company.', N'Năm tài chính bắt đầu vào tháng tư cho công ty này.'),
(283, 360, N'Companies use derivatives to hedge against currency risk.', N'Các công ty sử dụng phái sinh để phòng ngừa rủi ro tiền tệ.'),
(284, 361, N'The firm used leverage to finance its expansion.', N'Công ty đã sử dụng đòn bẩy để tài trợ cho việc mở rộng.'),
(285, 362, N'The bank maintains high liquidity to meet customer withdrawals.', N'Ngân hàng duy trì thanh khoản cao để đáp ứng rút tiền của khách hàng.'),
(286, 363, N'Your monthly payment goes toward both principal and interest.', N'Khoản thanh toán hàng tháng của bạn bao gồm cả tiền gốc và lãi.'),
-- Topic 11 words
(287, 364, N'The campaign targets a young demographic aged 18-25.', N'Chiến dịch nhắm đến nhóm nhân khẩu học trẻ từ 18-25 tuổi.'),
(288, 365, N'Social media engagement has increased by 30% this month.', N'Tương tác trên mạng xã hội đã tăng 30% trong tháng này.'),
(289, 366, N'We need to optimize the sales funnel for better conversions.', N'Chúng tôi cần tối ưu hóa phễu bán hàng để chuyển đổi tốt hơn.'),
(290, 367, N'The influencer promoted the product on Instagram.', N'Người có tầm ảnh hưởng đã quảng bá sản phẩm trên Instagram.'),
(291, 368, N'The company is looking for ways to monetize its content.', N'Công ty đang tìm cách kiếm tiền từ nội dung của mình.'),
(292, 369, N'We should optimize the website for mobile users.', N'Chúng ta nên tối ưu hóa trang web cho người dùng di động.'),
(293, 370, N'The charity outreach program helps local communities.', N'Chương trình tiếp cận từ thiện giúp đỡ cộng đồng địa phương.'),
(294, 371, N'The website conversion rate increased after the redesign.', N'Tỷ lệ chuyển đổi trang web đã tăng sau khi thiết kế lại.'),
-- Topic 12 words
(295, 372, N'The company is experiencing high employee attrition this year.', N'Công ty đang trải qua tỷ lệ nghỉ việc cao trong năm nay.'),
(296, 373, N'All employees must ensure compliance with safety regulations.', N'Tất cả nhân viên phải đảm bảo tuân thủ các quy định an toàn.'),
(297, 374, N'Effective delegation is a key management skill.', N'Ủy quyền hiệu quả là một kỹ năng quản lý quan trọng.'),
(298, 375, N'The remuneration package includes salary and bonuses.', N'Gói đãi ngộ bao gồm lương và thưởng.'),
(299, 376, N'The company has a clear succession plan for leadership roles.', N'Công ty có kế hoạch kế nhiệm rõ ràng cho các vai trò lãnh đạo.'),
(300, 377, N'The job offer is contingent on passing the background check.', N'Lời mời làm việc phụ thuộc vào việc vượt qua kiểm tra lý lịch.'),
(301, 378, N'Use your discretion when sharing confidential information.', N'Hãy thận trọng khi chia sẻ thông tin bảo mật.'),
(302, 379, N'The employee filed a formal grievance against the supervisor.', N'Nhân viên đã nộp đơn khiếu nại chính thức chống lại người giám sát.'),
-- Topic 13 words
(303, 380, N'The witness signed an affidavit confirming the statement.', N'Nhân chứng đã ký bản tuyên thệ xác nhận lời khai.'),
(304, 381, N'The covenant restricts how the property can be used.', N'Giao ước hạn chế việc sử dụng tài sản.'),
(305, 382, N'The lawyer took the deposition of the key witness.', N'Luật sư đã lấy lời khai của nhân chứng chính.'),
(306, 383, N'As a fiduciary, the advisor must act in the client best interest.', N'Với tư cách người ủy thác, cố vấn phải hành động vì lợi ích tốt nhất của khách hàng.'),
(307, 384, N'The grand jury issued an indictment against the suspect.', N'Đại bồi thẩm đoàn đã ban hành bản cáo trạng chống lại nghi phạm.'),
(308, 385, N'The court granted an injunction to stop construction.', N'Tòa án đã ban hành lệnh cấm để ngừng xây dựng.'),
(309, 386, N'The judge cited a precedent from a similar case.', N'Thẩm phán đã trích dẫn tiền lệ từ một vụ án tương tự.'),
(310, 387, N'Her testimony was crucial in winning the case.', N'Lời khai của cô ấy rất quan trọng để thắng kiện.');

SET IDENTITY_INSERT ExampleSentences OFF;
GO
PRINT '✅ ExampleSentences inserted successfully.';

-- ============================================================
-- PART 5: QUESTIONS
-- Starting from QuestionID 758 (max is 757)
-- Starting from QuestionID 758 (max is 757)
-- Each word gets 4 questions: 1 MCQ, 1 FillBlank, 1 Dictation, 1 DragDrop
-- ============================================================

-- Helper variable pattern: For each word we generate 4 questions
-- WordID 273 (Delegate) - Topic 1
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(758, 273, 'MCQ', N'What does "delegate" mean?', N'["Ủy quyền, phân công","Trì hoãn","Hủy bỏ","Phê duyệt"]', N'Ủy quyền, phân công', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(759, 273, 'FillBlank', N'The manager decided to ______ the task to her assistant.', N'[]', N'delegate', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(760, 273, 'Dictation', N'Type the word you hear: /ˈdel.ɪ.ɡeɪt/', N'[]', N'delegate', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(761, 273, 'DragDrop', N'Arrange the letters to form the word meaning "to assign tasks to others": d-e-l-e-g-a-t-e', N'["d","e","l","e","g","a","t","e"]', N'delegate', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- WordID 274 (Allocate)
(762, 274, 'MCQ', N'What is the meaning of "allocate"?', N'["Phân bổ, cấp phát","Tính toán","Loại bỏ","Đánh giá"]', N'Phân bổ, cấp phát', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(763, 274, 'FillBlank', N'We need to ______ the budget carefully for this quarter.', N'[]', N'allocate', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(764, 274, 'Dictation', N'Type the word you hear: /ˈæl.ə.keɪt/', N'[]', N'allocate', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(765, 274, 'DragDrop', N'Arrange: a-l-l-o-c-a-t-e', N'["a","l","l","o","c","a","t","e"]', N'allocate', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- WordID 275 (Dividend)
(766, 275, 'MCQ', N'What does "dividend" mean in finance?', N'["Cổ tức","Lợi nhuận","Thu nhập","Đầu tư"]', N'Cổ tức', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(767, 275, 'FillBlank', N'The company announced a ______ of $2 per share.', N'[]', N'dividend', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(768, 275, 'Dictation', N'Type the word: /ˈdɪv.ɪ.dend/', N'[]', N'dividend', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(769, 275, 'DragDrop', N'Arrange: d-i-v-i-d-e-n-d', N'["d","i","v","i","d","e","n","d"]', N'dividend', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- WordID 276 (Forecast)
(770, 276, 'MCQ', N'What does "forecast" mean?', N'["Dự báo","Dự án","Kết luận","Phân tích"]', N'Dự báo', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(771, 276, 'FillBlank', N'The sales ______ predicts a 10% increase next year.', N'[]', N'forecast', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(772, 276, 'Dictation', N'Type the word: /ˈfɔːr.kæst/', N'[]', N'forecast', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(773, 276, 'DragDrop', N'Arrange: f-o-r-e-c-a-s-t', N'["f","o","r","e","c","a","s","t"]', N'forecast', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- WordID 277 (Liquidate)
(774, 277, 'MCQ', N'What is the meaning of "liquidate"?', N'["Thanh lý","Đầu tư","Mua lại","Sáp nhập"]', N'Thanh lý', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(775, 277, 'FillBlank', N'The company had to ______ its assets to pay off debts.', N'[]', N'liquidate', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(776, 277, 'Dictation', N'Type the word: /ˈlɪk.wɪ.deɪt/', N'[]', N'liquidate', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(777, 277, 'DragDrop', N'Arrange: l-i-q-u-i-d-a-t-e', N'["l","i","q","u","i","d","a","t","e"]', N'liquidate', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- WordID 278 (Fiscal - adjective)
(778, 278, 'MCQ', N'What does "fiscal" relate to?', N'["Tài chính, ngân sách","Luật pháp","Giáo dục","Y tế"]', N'Tài chính, ngân sách', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(779, 278, 'FillBlank', N'The ______ year ends on December 31st.', N'[]', N'fiscal', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(780, 278, 'Dictation', N'Type the word: /ˈfɪs.kəl/', N'[]', N'fiscal', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(781, 278, 'DragDrop', N'Arrange: f-i-s-c-a-l', N'["f","i","s","c","a","l"]', N'fiscal', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- WordID 279 (Downsize)
(782, 279, 'MCQ', N'What does "downsize" mean?', N'["Thu hẹp quy mô","Mở rộng","Tái cấu trúc","Đầu tư"]', N'Thu hẹp quy mô', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(783, 279, 'FillBlank', N'The firm decided to ______ its workforce by 20%.', N'[]', N'downsize', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(784, 279, 'Dictation', N'Type the word: /ˈdaʊn.saɪz/', N'[]', N'downsize', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(785, 279, 'DragDrop', N'Arrange: d-o-w-n-s-i-z-e', N'["d","o","w","n","s","i","z","e"]', N'downsize', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- WordID 280 (Equity)
(786, 280, 'MCQ', N'What does "equity" mean in finance?', N'["Vốn chủ sở hữu","Nợ","Lợi nhuận","Chi phí"]', N'Vốn chủ sở hữu', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(787, 280, 'FillBlank', N'Home ______ loans are popular among homeowners.', N'[]', N'equity', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(788, 280, 'Dictation', N'Type the word: /ˈek.wɪ.ti/', N'[]', N'equity', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(789, 280, 'DragDrop', N'Arrange: e-q-u-i-t-y', N'["e","q","u","i","t","y"]', N'equity', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

PRINT '✅ Topic 1 questions inserted (QID 758-789).';

-- Topic 2: WordIDs 281-290
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(790, 281, 'MCQ', N'What does "ballot" mean?', N'["Lá phiếu, bỏ phiếu","Cuộc họp","Biên bản","Quyết định"]', N'Lá phiếu, bỏ phiếu', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(791, 281, 'FillBlank', N'Members cast their ______ to elect the new chairperson.', N'[]', N'ballot', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(792, 281, 'Dictation', N'Type the word: /ˈbæl.ət/', N'[]', N'ballot', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(793, 281, 'DragDrop', N'Arrange: b-a-l-l-o-t', N'["b","a","l","l","o","t"]', N'ballot', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

(794, 282, 'MCQ', N'What does "consensus" mean?', N'["Sự đồng thuận","Tranh luận","Bất đồng","Thỏa hiệp"]', N'Sự đồng thuận', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(795, 282, 'FillBlank', N'The team reached a ______ after a long discussion.', N'[]', N'consensus', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(796, 282, 'Dictation', N'Type the word: /kənˈsen.səs/', N'[]', N'consensus', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(797, 282, 'DragDrop', N'Arrange: c-o-n-s-e-n-s-u-s', N'["c","o","n","s","e","n","s","u","s"]', N'consensus', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

(798, 283, 'MCQ', N'Who are "stakeholders"?', N'["Các bên liên quan","Cổ đông","Nhân viên","Khách hàng"]', N'Các bên liên quan', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(799, 283, 'FillBlank', N'All ______ were invited to the project meeting.', N'[]', N'stakeholders', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(800, 283, 'Dictation', N'Type the word: /ˈsteɪk.həʊl.dər/', N'[]', N'stakeholder', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(801, 283, 'DragDrop', N'Arrange: s-t-a-k-e-h-o-l-d-e-r', N'["s","t","a","k","e","h","o","l","d","e","r"]', N'stakeholder', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

PRINT '✅ Topic 2 questions (790-801) inserted.';

-- More questions for remaining topic 2 words + all other topics
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
-- Benchmark (284)
(802, 284, 'MCQ', N'What is a "benchmark"?', N'["Điểm chuẩn","Mục tiêu","Ngân sách","Báo cáo"]', N'Điểm chuẩn', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(803, 284, 'FillBlank', N'We use industry ______ to measure performance.', N'[]', N'benchmark', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(804, 284, 'Dictation', N'Type the word: /ˈbentʃ.mɑːrk/', N'[]', N'benchmark', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(805, 284, 'DragDrop', N'Arrange: b-e-n-c-h-m-a-r-k', N'["b","e","n","c","h","m","a","r","k"]', N'benchmark', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Mandate (285)
(806, 285, 'MCQ', N'What does "mandate" mean?', N'["Nhiệm vụ, ủy thác","Quyền lực","Lợi ích","Ưu tiên"]', N'Nhiệm vụ, ủy thác', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(807, 285, 'FillBlank', N'The government issued a ______ to reduce emissions.', N'[]', N'mandate', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(808, 285, 'Dictation', N'Type the word: /ˈmæn.deɪt/', N'[]', N'mandate', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(809, 285, 'DragDrop', N'Arrange: m-a-n-d-a-t-e', N'["m","a","n","d","a","t","e"]', N'mandate', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Convene (286)
(810, 286, 'MCQ', N'What does "convene" mean?', N'["Triệu tập, họp","Kết thúc","Báo cáo","Phân công"]', N'Triệu tập, họp', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(811, 286, 'FillBlank', N'The board decided to ______ an emergency meeting.', N'[]', N'convene', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(812, 286, 'Dictation', N'Type the word: /kənˈviːn/', N'[]', N'convene', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(813, 286, 'DragDrop', N'Arrange: c-o-n-v-e-n-e', N'["c","o","n","v","e","n","e"]', N'convene', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Adjourn (287)
(814, 287, 'MCQ', N'What does "adjourn" mean?', N'["Hoãn lại, tạm nghỉ","Bắt đầu","Kết thúc","Hoàn thành"]', N'Hoãn lại, tạm nghỉ', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(815, 287, 'FillBlank', N'The chairman decided to ______ the meeting.', N'[]', N'adjourn', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(816, 287, 'Dictation', N'Type the word: /əˈdʒɜːrn/', N'[]', N'adjourn', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(817, 287, 'DragDrop', N'Arrange: a-d-j-o-u-r-n', N'["a","d","j","o","u","r","n"]', N'adjourn', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Quorum (288)
(818, 288, 'MCQ', N'What is a "quorum"?', N'["Số đại biểu tối thiểu","Đa số","Biểu quyết","Ủy ban"]', N'Số đại biểu tối thiểu', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(819, 288, 'FillBlank', N'We need a ______ of at least ten members to vote.', N'[]', N'quorum', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(820, 288, 'Dictation', N'Type the word: /ˈkwɔːr.əm/', N'[]', N'quorum', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(821, 288, 'DragDrop', N'Arrange: q-u-o-r-u-m', N'["q","u","o","r","u","m"]', N'quorum', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Arbitrate (289)
(822, 289, 'MCQ', N'What does "arbitrate" mean?', N'["Phân xử, làm trọng tài","Tranh luận","Kiện tụng","Đàm phán"]', N'Phân xử, làm trọng tài', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(823, 289, 'FillBlank', N'A neutral party was called to ______ the dispute.', N'[]', N'arbitrate', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(824, 289, 'Dictation', N'Type the word: /ˈɑːr.bɪ.treɪt/', N'[]', N'arbitrate', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(825, 289, 'DragDrop', N'Arrange: a-r-b-i-t-r-a-t-e', N'["a","r","b","i","t","r","a","t","e"]', N'arbitrate', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Ratify (290)
(826, 290, 'MCQ', N'What does "ratify" mean?', N'["Phê chuẩn, thông qua","Từ chối","Sửa đổi","Đề xuất"]', N'Phê chuẩn, thông qua', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(827, 290, 'FillBlank', N'The board ______ the agreement unanimously.', N'[]', N'ratify', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(828, 290, 'Dictation', N'Type the word: /ˈræt.ɪ.faɪ/', N'[]', N'ratify', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(829, 290, 'DragDrop', N'Arrange: r-a-t-i-f-y', N'["r","a","t","i","f","y"]', N'ratify', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

PRINT '✅ Topic 2 questions done (790-829).';

-- ============================================================
-- Topic 3: Words 291-298 (Daily Routines)
-- ============================================================
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(830, 291, 'MCQ', N'What does "errand" mean?', N'["Việc vặt","Công việc","Bài tập","Cuộc hẹn"]', N'Việc vặt', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(831, 291, 'FillBlank', N'I have a few ______ to run after work.', N'[]', N'errands', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(832, 291, 'Dictation', N'Type the word: /ˈer.ənd/', N'[]', N'errand', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(833, 291, 'DragDrop', N'Arrange: e-r-r-a-n-d', N'["e","r","r","a","n","d"]', N'errand', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

(834, 292, 'MCQ', N'What is a "nap"?', N'["Giấc ngủ ngắn","Bữa ăn","Cuộc họp","Bài học"]', N'Giấc ngủ ngắn', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(835, 292, 'FillBlank', N'She took a short ______ in the afternoon.', N'[]', N'nap', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(836, 292, 'Dictation', N'Type the word: /næp/', N'[]', N'nap', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(837, 292, 'DragDrop', N'Arrange: n-a-p', N'["n","a","p"]', N'nap', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

(838, 293, 'MCQ', N'What does "stroll" mean?', N'["Đi dạo","Chạy bộ","Lái xe","Bay"]', N'Đi dạo', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(839, 293, 'FillBlank', N'They went for a ______ along the beach.', N'[]', N'stroll', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(840, 293, 'Dictation', N'Type the word: /strəʊl/', N'[]', N'stroll', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(841, 293, 'DragDrop', N'Arrange: s-t-r-o-l-l', N'["s","t","r","o","l","l"]', N'stroll', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

(842, 294, 'MCQ', N'What does "groom" mean?', N'["Chải chuốt","Tập thể dục","Nấu ăn","Làm việc"]', N'Chải chuốt', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(843, 294, 'FillBlank', N'He spends 15 minutes ______ himself every morning.', N'[]', N'grooming', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(844, 294, 'Dictation', N'Type the word: /ɡruːm/', N'[]', N'groom', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(845, 294, 'DragDrop', N'Arrange: g-r-o-o-m', N'["g","r","o","o","m"]', N'groom', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

(846, 295, 'MCQ', N'What does "procrastinate" mean?', N'["Trì hoãn","Hoàn thành","Bắt đầu","Lên kế hoạch"]', N'Trì hoãn', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(847, 295, 'FillBlank', N'Stop ______ and start your homework now!', N'[]', N'procrastinating', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(848, 295, 'Dictation', N'Type the word: /prəˈkræs.tɪ.neɪt/', N'[]', N'procrastinate', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(849, 295, 'DragDrop', N'Arrange: p-r-o-c-r-a-s-t-i-n-a-t-e', N'["p","r","o","c","r","a","s","t","i","n","a","t","e"]', N'procrastinate', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

(850, 296, 'MCQ', N'What does "refresh" mean?', N'["Làm tươi mới","Làm sạch","Làm nóng","Làm mát"]', N'Làm tươi mới', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(851, 296, 'FillBlank', N'A cold shower can ______ you after a long day.', N'[]', N'refresh', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(852, 296, 'Dictation', N'Type the word: /rɪˈfreʃ/', N'[]', N'refresh', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(853, 296, 'DragDrop', N'Arrange: r-e-f-r-e-s-h', N'["r","e","f","r","e","s","h"]', N'refresh', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

(854, 297, 'MCQ', N'What does "winding" describe?', N'["Quanh co, uốn lượn","Thẳng tắp","Ngắn","Dốc"]', N'Quanh co, uốn lượn', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(855, 297, 'FillBlank', N'The path took a ______ route through the forest.', N'[]', N'winding', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(856, 297, 'Dictation', N'Type the word: /ˈwaɪn.dɪŋ/', N'[]', N'winding', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(857, 297, 'DragDrop', N'Arrange: w-i-n-d-i-n-g', N'["w","i","n","d","i","n","g"]', N'winding', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

(858, 298, 'MCQ', N'What does "habitual" mean?', N'["Theo thói quen","Hiếm khi","Mới mẻ","Đặc biệt"]', N'Theo thói quen', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(859, 298, 'FillBlank', N'She is a ______ early riser.', N'[]', N'habitual', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(860, 298, 'Dictation', N'Type the word: /həˈbɪtʃ.u.əl/', N'[]', N'habitual', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(861, 298, 'DragDrop', N'Arrange: h-a-b-i-t-u-a-l', N'["h","a","b","i","t","u","a","l"]', N'habitual', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

PRINT '✅ Topic 3 questions done (830-861).';

-- ============================================================
-- Topic 7: Words 325-339 (A.I English) - FULL SET of questions
-- ============================================================
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
-- Algorithm (325)
(862, 325, 'MCQ', N'What is an "algorithm"?', N'["Thuật toán","Cơ sở dữ liệu","Mạng máy tính","Ngôn ngữ lập trình"]', N'Thuật toán', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(863, 325, 'FillBlank', N'The recommendation ______ suggests videos based on your history.', N'[]', N'algorithm', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(864, 325, 'Dictation', N'Type the word: /ˈæl.ɡə.rɪð.əm/', N'[]', N'algorithm', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(865, 325, 'DragDrop', N'Arrange: a-l-g-o-r-i-t-h-m', N'["a","l","g","o","r","i","t","h","m"]', N'algorithm', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Neural (326)
(866, 326, 'MCQ', N'What does "neural" relate to?', N'["Thần kinh (mạng)","Kỹ thuật số","Vật lý","Hóa học"]', N'Thần kinh (mạng)', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(867, 326, 'FillBlank', N'______ networks are inspired by the human brain.', N'[]', N'Neural', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(868, 326, 'Dictation', N'Type the word: /ˈnjʊr.əl/', N'[]', N'neural', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(869, 326, 'DragDrop', N'Arrange: n-e-u-r-a-l', N'["n","e","u","r","a","l"]', N'neural', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Training (327)
(870, 327, 'MCQ', N'What is "training" in AI context?', N'["Quá trình huấn luyện","Cài đặt phần mềm","Viết code","Kiểm thử"]', N'Quá trình huấn luyện', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(871, 327, 'FillBlank', N'______ a large language model requires massive computing power.', N'[]', N'Training', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(872, 327, 'Dictation', N'Type the word: /ˈtreɪ.nɪŋ/', N'[]', N'training', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(873, 327, 'DragDrop', N'Arrange: t-r-a-i-n-i-n-g', N'["t","r","a","i","n","i","n","g"]', N'training', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Inference (328)
(874, 328, 'MCQ', N'What is "inference" in AI?', N'["Suy luận, suy diễn","Huấn luyện","Thu thập dữ liệu","Triển khai"]', N'Suy luận, suy diễn', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(875, 328, 'FillBlank', N'An ______ engine processes data to make predictions.', N'[]', N'inference', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(876, 328, 'Dictation', N'Type the word: /ˈɪn.fər.əns/', N'[]', N'inference', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(877, 328, 'DragDrop', N'Arrange: i-n-f-e-r-e-n-c-e', N'["i","n","f","e","r","e","n","c","e"]', N'inference', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Dataset (329)
(878, 329, 'MCQ', N'What is a "dataset"?', N'["Bộ dữ liệu","Cơ sở dữ liệu","Mạng máy tính","Ứng dụng"]', N'Bộ dữ liệu', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(879, 329, 'FillBlank', N'The ______ contains over one million labeled images.', N'[]', N'dataset', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(880, 329, 'Dictation', N'Type the word: /ˈdeɪ.tə.set/', N'[]', N'dataset', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(881, 329, 'DragDrop', N'Arrange: d-a-t-a-s-e-t', N'["d","a","t","a","s","e","t"]', N'dataset', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Tokenize (330)
(882, 330, 'MCQ', N'What does "tokenize" mean?', N'["Phân tách từ (token hóa)","Mã hóa","Nén dữ liệu","Giải mã"]', N'Phân tách từ (token hóa)', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(883, 330, 'FillBlank', N'The system uses ______ to split text into smaller units.', N'[]', N'tokenization', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(884, 330, 'Dictation', N'Type the word: /ˈtəʊ.kən.aɪz/', N'[]', N'tokenize', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(885, 330, 'DragDrop', N'Arrange: t-o-k-e-n-i-z-e', N'["t","o","k","e","n","i","z","e"]', N'tokenize', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Embedding (331)
(886, 331, 'MCQ', N'What is an "embedding" in AI?', N'["Véc-tơ nhúng","Bộ nhớ","Mạng nơ-ron","Thuật toán"]', N'Véc-tơ nhúng', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(887, 331, 'FillBlank', N'Word ______ capture semantic relationships between words.', N'[]', N'embeddings', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(888, 331, 'Dictation', N'Type the word: /ɪmˈbed.ɪŋ/', N'[]', N'embedding', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(889, 331, 'DragDrop', N'Arrange: e-m-b-e-d-d-i-n-g', N'["e","m","b","e","d","d","i","n","g"]', N'embedding', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Fine-tune (332)
(890, 332, 'MCQ', N'What does "fine-tune" mean in AI?', N'["Tinh chỉnh mô hình","Xóa dữ liệu","Cài đặt phần mềm","Kiểm tra tốc độ"]', N'Tinh chỉnh mô hình', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(891, 332, 'FillBlank', N'We need to ______ the model for better accuracy.', N'[]', N'fine-tune', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(892, 332, 'Dictation', N'Type the phrase: /ˈfaɪn.tjuːn/', N'[]', N'fine-tune', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(893, 332, 'DragDrop', N'Arrange: f-i-n-e---t-u-n-e', N'["f","i","n","e","-","t","u","n","e"]', N'fine-tune', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Overfitting (333)
(894, 333, 'MCQ', N'What is "overfitting"?', N'["Quá khớp (mô hình)","Dưới khớp","Huấn luyện hoàn hảo","Tối ưu hóa"]', N'Quá khớp (mô hình)', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(895, 333, 'FillBlank', N'______ occurs when the model memorizes the training data.', N'[]', N'Overfitting', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(896, 333, 'Dictation', N'Type the word: /ˌəʊ.vərˈfɪt.ɪŋ/', N'[]', N'overfitting', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(897, 333, 'DragDrop', N'Arrange: o-v-e-r-f-i-t-t-i-n-g', N'["o","v","e","r","f","i","t","t","i","n","g"]', N'overfitting', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Transformer (334)
(898, 334, 'MCQ', N'What is a "Transformer" in AI?', N'["Kiến trúc AI biến đổi","Máy biến áp","Bộ chuyển đổi điện","Trình biên dịch"]', N'Kiến trúc AI biến đổi', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(899, 334, 'FillBlank', N'The ______ architecture revolutionized NLP.', N'[]', N'Transformer', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(900, 334, 'Dictation', N'Type the word: /trænsˈfɔːr.mər/', N'[]', N'transformer', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(901, 334, 'DragDrop', N'Arrange: t-r-a-n-s-f-o-r-m-e-r', N'["t","r","a","n","s","f","o","r","m","e","r"]', N'transformer', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Classification (335)
(902, 335, 'MCQ', N'What is "classification" in AI?', N'["Phân loại dữ liệu","Dự đoán số","Tạo văn bản","Nhận dạng giọng nói"]', N'Phân loại dữ liệu', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(903, 335, 'FillBlank', N'Spam detection is a text ______ task.', N'[]', N'classification', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(904, 335, 'Dictation', N'Type the word: /ˌklæs.ɪ.fɪˈkeɪ.ʃən/', N'[]', N'classification', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(905, 335, 'DragDrop', N'Arrange: c-l-a-s-s-i-f-i-c-a-t-i-o-n', N'["c","l","a","s","s","i","f","i","c","a","t","i","o","n"]', N'classification', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Generative (336)
(906, 336, 'MCQ', N'What does "generative" mean in AI?', N'["Sinh tạo nội dung","Phân tích dữ liệu","Lưu trữ","Xử lý ảnh"]', N'Sinh tạo nội dung', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(907, 336, 'FillBlank', N'______ AI can create realistic images and text.', N'[]', N'Generative', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(908, 336, 'Dictation', N'Type the word: /ˈdʒen.ər.ə.tɪv/', N'[]', N'generative', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(909, 336, 'DragDrop', N'Arrange: g-e-n-e-r-a-t-i-v-e', N'["g","e","n","e","r","a","t","i","v","e"]', N'generative', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Prompt (337)
(910, 337, 'MCQ', N'What is a "prompt" in AI context?', N'["Câu lệnh cho AI","Mã lập trình","Tập tin cấu hình","Đầu ra mô hình"]', N'Câu lệnh cho AI', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(911, 337, 'FillBlank', N'A well-crafted ______ leads to better AI responses.', N'[]', N'prompt', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(912, 337, 'Dictation', N'Type the word: /prɒmpt/', N'[]', N'prompt', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(913, 337, 'DragDrop', N'Arrange: p-r-o-m-p-t', N'["p","r","o","m","p","t"]', N'prompt', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Semantic (338)
(914, 338, 'MCQ', N'What does "semantic" mean?', N'["Thuộc ngữ nghĩa","Kỹ thuật","Toán học","Vật lý"]', N'Thuộc ngữ nghĩa', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(915, 338, 'FillBlank', N'______ analysis helps understand the meaning of text.', N'[]', N'Semantic', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(916, 338, 'Dictation', N'Type the word: /sɪˈmæn.tɪk/', N'[]', N'semantic', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(917, 338, 'DragDrop', N'Arrange: s-e-m-a-n-t-i-c', N'["s","e","m","a","n","t","i","c"]', N'semantic', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Latent (339)
(918, 339, 'MCQ', N'What does "latent" mean in AI?', N'["Tiềm ẩn trong mô hình","Hiển thị rõ ràng","Đã được huấn luyện","Đã tối ưu"]', N'Tiềm ẩn trong mô hình', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(919, 339, 'FillBlank', N'The model learns ______ features from the input data.', N'[]', N'latent', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(920, 339, 'Dictation', N'Type the word: /ˈleɪ.tənt/', N'[]', N'latent', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(921, 339, 'DragDrop', N'Arrange: l-a-t-e-n-t', N'["l","a","t","e","n","t"]', N'latent', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

PRINT '✅ Topic 7 (AI) questions complete (862-921).';

-- ============================================================
-- Quick questions for remaining topics (Topics 4,5,6,8,9,10,11,12,13)
-- At least 2 questions per word to ensure data density
-- ============================================================
-- Topic 4: Words 299-306 (Airport)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(922, 299, 'MCQ', N'What is a "concourse"?', N'["Nhà ga, sảnh chính","Đường băng","Tháp điều khiển","Cổng ra máy bay"]', N'Nhà ga, sảnh chính', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(923, 299, 'FillBlank', N'The airport ______ was crowded with travelers.', N'[]', N'concourse', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(924, 300, 'MCQ', N'What is a "tarmac"?', N'["Đường băng sân bay","Nhà ga","Bãi đỗ xe","Sảnh chờ"]', N'Đường băng sân bay', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(925, 300, 'FillBlank', N'The plane taxied across the ______ before takeoff.', N'[]', N'tarmac', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(926, 301, 'MCQ', N'What is a "carry-on"?', N'["Hành lý xách tay","Hành lý ký gửi","Hành lý quá khổ","Hành lý thất lạc"]', N'Hành lý xách tay', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(927, 301, 'FillBlank', N'You are allowed one ______ bag on the flight.', N'[]', N'carry-on', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(928, 302, 'MCQ', N'What does "overbook" mean?', N'["Bán vé quá số lượng","Đặt vé","Hủy chuyến","Đổi vé"]', N'Bán vé quá số lượng', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(929, 302, 'FillBlank', N'The airline ______ the flight and asked for volunteers.', N'[]', N'overbooked', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(930, 305, 'MCQ', N'What is an "aisle" seat?', N'["Ghế lối đi","Ghế cửa sổ","Ghế giữa","Ghế hạng nhất"]', N'Ghế lối đi', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(931, 305, 'FillBlank', N'She prefers an ______ seat on long flights.', N'[]', N'aisle', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(932, 306, 'MCQ', N'What is "turbulence"?', N'["Nhiễu động không khí","Hạ cánh","Cất cánh","Trễ chuyến"]', N'Nhiễu động không khí', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(933, 306, 'FillBlank', N'The pilot warned about upcoming ______.', N'[]', N'turbulence', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- Topic 5: Words 307-316 (Software & Tech)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(934, 307, 'MCQ', N'What is "bandwidth"?', N'["Băng thông mạng","Dung lượng ổ cứng","Tốc độ CPU","Bộ nhớ RAM"]', N'Băng thông mạng', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(935, 307, 'FillBlank', N'Video streaming requires high ______.', N'[]', N'bandwidth', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(936, 308, 'MCQ', N'What is a "cache"?', N'["Bộ nhớ đệm","Tường lửa","Máy chủ","Giao thức"]', N'Bộ nhớ đệm', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(937, 308, 'FillBlank', N'Clearing the browser ______ can improve speed.', N'[]', N'cache', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(938, 311, 'MCQ', N'What does "deploy" mean?', N'["Triển khai","Gỡ cài đặt","Kiểm tra","Viết code"]', N'Triển khai', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(939, 311, 'FillBlank', N'The team plans to ______ the new app in March.', N'[]', N'deploy', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(940, 315, 'MCQ', N'What is a "query"?', N'["Truy vấn","Tập tin","Thư mục","Liên kết"]', N'Truy vấn', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(941, 315, 'FillBlank', N'The database ______ returned thousands of results.', N'[]', N'query', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(942, 316, 'MCQ', N'What is a "repository"?', N'["Kho lưu trữ","Máy in","Màn hình","Bàn phím"]', N'Kho lưu trữ', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(943, 316, 'FillBlank', N'Source code is stored in a central ______.', N'[]', N'repository', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- Topic 6: Words 317-324 (Academic)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(944, 319, 'MCQ', N'What is a "citation"?', N'["Trích dẫn tài liệu","Điểm số","Bài giảng","Sách giáo khoa"]', N'Trích dẫn tài liệu', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(945, 319, 'FillBlank', N'Make sure to include proper ______ in your essay.', N'[]', N'citations', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(946, 320, 'MCQ', N'What does "peer" mean in academic context?', N'["Đồng cấp","Giáo sư","Sinh viên","Hiệu trưởng"]', N'Đồng cấp', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(947, 320, 'FillBlank', N'The research was reviewed by her ______.', N'[]', N'peers', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(948, 321, 'MCQ', N'What does "plagiarize" mean?', N'["Đạo văn","Nghiên cứu","Viết báo cáo","Đọc tài liệu"]', N'Đạo văn', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(949, 321, 'FillBlank', N'______ someone else work is a serious offense.', N'[]', N'Plagiarizing', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- Topics 8-13: Quick insert of 2 questions per word (MCQ + FillBlank)
-- Topic 8: Shopping (340-347)
INSERT INTO Questions (QuestionID, WordID, QuestionType, QuestionText, OptionsJson, CorrectAnswer, DifficultyLevel, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(950, 343, 'MCQ', N'What is "retail" selling?', N'["Bán lẻ","Bán buôn","Đấu giá","Cho thuê"]', N'Bán lẻ', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(951, 343, 'FillBlank', N'______ prices are often higher than wholesale.', N'[]', N'Retail', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(952, 344, 'MCQ', N'Who is a "vendor"?', N'["Nhà cung cấp","Khách hàng","Nhân viên","Đối thủ"]', N'Nhà cung cấp', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(953, 344, 'FillBlank', N'The ______ delivered the goods on time.', N'[]', N'vendor', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(954, 345, 'MCQ', N'What is a "surcharge"?', N'["Phụ phí","Giảm giá","Thuế","Phí vận chuyển"]', N'Phụ phí', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(955, 345, 'FillBlank', N'A ______ applies for express delivery.', N'[]', N'surcharge', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Topic 9: Health (348-355)
(956, 348, 'MCQ', N'What does "contagious" mean?', N'["Lây nhiễm","Mãn tính","Cấp tính","Lành tính"]', N'Lây nhiễm', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(957, 348, 'FillBlank', N'The flu is highly ______ during winter.', N'[]', N'contagious', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(958, 350, 'MCQ', N'What does "diagnose" mean?', N'["Chẩn đoán bệnh","Điều trị","Phẫu thuật","Tiêm thuốc"]', N'Chẩn đoán bệnh', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(959, 350, 'FillBlank', N'The doctor ______ him with diabetes.', N'[]', N'diagnosed', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(960, 351, 'MCQ', N'What is "immunity"?', N'["Miễn dịch","Bệnh tật","Thuốc","Vi khuẩn"]', N'Miễn dịch', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(961, 351, 'FillBlank', N'Vaccination helps build ______ against diseases.', N'[]', N'immunity', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Topic 10: Finance (356-363)
(962, 358, 'MCQ', N'What is a "deficit"?', N'["Thâm hụt ngân sách","Lợi nhuận","Doanh thu","Đầu tư"]', N'Thâm hụt ngân sách', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(963, 358, 'FillBlank', N'The budget ______ has increased significantly.', N'[]', N'deficit', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(964, 361, 'MCQ', N'What is "leverage" in finance?', N'["Đòn bẩy tài chính","Tiết kiệm","Chi tiêu","Đầu tư mạo hiểm"]', N'Đòn bẩy tài chính', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(965, 361, 'FillBlank', N'The firm used ______ to finance its expansion.', N'[]', N'leverage', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(966, 363, 'MCQ', N'What is "principal" in a loan?', N'["Tiền gốc vay","Lãi suất","Phí phạt","Bảo hiểm"]', N'Tiền gốc vay', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(967, 363, 'FillBlank', N'Your payment goes toward both ______ and interest.', N'[]', N'principal', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Topic 11: Marketing (364-371)
(968, 365, 'MCQ', N'What is "engagement" in marketing?', N'["Sự tương tác","Doanh số","Quảng cáo","Thương hiệu"]', N'Sự tương tác', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(969, 365, 'FillBlank', N'Social media ______ has increased by 30%.', N'[]', N'engagement', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(970, 369, 'MCQ', N'What does "optimize" mean?', N'["Tối ưu hóa","Phá hủy","Làm chậm","Tăng kích thước"]', N'Tối ưu hóa', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(971, 369, 'FillBlank', N'We should ______ the website for mobile users.', N'[]', N'optimize', 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(972, 371, 'MCQ', N'What is "conversion" in marketing?', N'["Chuyển đổi khách hàng","Sản xuất","Phân phối","Định giá"]', N'Chuyển đổi khách hàng', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(973, 371, 'FillBlank', N'The ______ rate increased after the redesign.', N'[]', N'conversion', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Topic 12: HR (372-379)
(974, 372, 'MCQ', N'What is "attrition" in HR?', N'["Sự nghỉ việc","Tuyển dụng","Đào tạo","Thăng chức"]', N'Sự nghỉ việc', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(975, 372, 'FillBlank', N'The company is experiencing high employee ______.', N'[]', N'attrition', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(976, 375, 'MCQ', N'What is "remuneration"?', N'["Thù lao, đãi ngộ","Đánh giá","Kỷ luật","Đào tạo"]', N'Thù lao, đãi ngộ', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(977, 375, 'FillBlank', N'The ______ package includes salary and bonuses.', N'[]', N'remuneration', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(978, 379, 'MCQ', N'What is a "grievance"?', N'["Khiếu nại nhân viên","Khen thưởng","Thăng chức","Đề bạt"]', N'Khiếu nại nhân viên', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(979, 379, 'FillBlank', N'The employee filed a formal ______ against the supervisor.', N'[]', N'grievance', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),

-- Topic 13: Law (380-387)
(980, 380, 'MCQ', N'What is an "affidavit"?', N'["Bản tuyên thệ","Hợp đồng","Di chúc","Giấy phép"]', N'Bản tuyên thệ', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(981, 380, 'FillBlank', N'The witness signed an ______ confirming the statement.', N'[]', N'affidavit', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(982, 384, 'MCQ', N'What is an "indictment"?', N'["Bản cáo trạng","Bản án","Luật sư","Bồi thẩm đoàn"]', N'Bản cáo trạng', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(983, 384, 'FillBlank', N'The grand jury issued an ______ against the suspect.', N'[]', N'indictment', 3, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(984, 386, 'MCQ', N'What is a "precedent"?', N'["Tiền lệ pháp lý","Hình phạt","Bồi thường","Tranh chấp"]', N'Tiền lệ pháp lý', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(985, 386, 'FillBlank', N'The judge cited a ______ from a similar case.', N'[]', N'precedent', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(986, 387, 'MCQ', N'What is "testimony"?', N'["Lời khai, chứng cứ","Bản án","Luật","Hình phạt"]', N'Lời khai, chứng cứ', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(987, 387, 'FillBlank', N'Her ______ was crucial in winning the case.', N'[]', N'testimony', 2, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

PRINT '✅ All remaining topics questions inserted (922-987).';

-- ============================================================
SET IDENTITY_INSERT Questions OFF;
GO

-- ============================================================
-- PART 6: QUESTIONS REVIEW - Mark all questions as reviewed
-- ============================================================
UPDATE Questions
SET ReviewedByUserID = 1,
    ReviewedAt = SYSDATETIMEOFFSET(),
    PublishedAt = SYSDATETIMEOFFSET()
WHERE QuestionID >= 758 AND ReviewedByUserID IS NULL;

PRINT '✅ All questions reviewed and published.';

-- ============================================================
-- PART 7: MINI-TESTS
-- Starting from MiniTestID 62 (max is 61)
-- Create 1 mini-test per topic for the new words
-- ============================================================
INSERT INTO MiniTests (MiniTestID, TopicID, TestTitle, Description, TotalQuestions, IsPublished, CreatedByUserID, ContentStatus, CreatedAt, UpdatedAt)
VALUES
(62, 1, N'TOEIC Starter Core - Mở rộng', N'Bài kiểm tra từ vựng bổ sung cho chủ đề TOEIC Starter Core', 8, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(63, 2, N'TOEIC Office & Meetings - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về họp hành và văn phòng', 10, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(64, 3, N'Daily Routines - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về sinh hoạt hàng ngày', 8, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(65, 4, N'Airport & Travel - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về sân bay và du lịch', 6, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(66, 5, N'Software & Office Tech - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về công nghệ và phần mềm', 5, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(67, 6, N'Academic Study - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về học thuật', 5, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(68, 7, N'Artificial Intelligence - Nhập môn', N'Bài kiểm tra từ vựng AI cơ bản: thuật toán, mạng nơ-ron, machine learning', 15, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(69, 7, N'Artificial Intelligence - Chuyên sâu', N'Bài kiểm tra từ vựng AI nâng cao: transformer, embedding, generative AI', 15, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(70, 8, N'Shopping & Services - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về mua sắm và dịch vụ', 5, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(71, 9, N'Health & Medical - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về sức khỏe và y tế', 5, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(72, 10, N'Finance & Banking - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về tài chính và ngân hàng', 5, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(73, 11, N'Marketing - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về marketing và quảng cáo', 5, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(74, 12, N'HR & Personnel - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về nhân sự', 5, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
(75, 13, N'Law & Legal - Mở rộng', N'Bài kiểm tra từ vựng bổ sung về pháp lý', 5, 1, 9, 'Published', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

SET IDENTITY_INSERT MiniTests OFF;
GO
PRINT '✅ MiniTests created (IDs 62-75).';

-- ============================================================
-- PART 8: MINI-TEST ITEMS
-- Link questions to mini-tests
-- ============================================================

-- MiniTest 62 (Topic 1): 8 questions from Topic 1 words
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(62, 758, 1), (62, 759, 2), (62, 762, 3), (62, 763, 4),
(62, 766, 5), (62, 767, 6), (62, 770, 7), (62, 771, 8);

-- MiniTest 63 (Topic 2): 10 questions from Topic 2 words
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(63, 790, 1), (63, 794, 2), (63, 798, 3), (63, 802, 4),
(63, 806, 5), (63, 810, 6), (63, 814, 7), (63, 818, 8),
(63, 822, 9), (63, 826, 10);

-- MiniTest 64 (Topic 3): 8 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(64, 830, 1), (64, 834, 2), (64, 838, 3), (64, 842, 4),
(64, 846, 5), (64, 850, 6), (64, 854, 7), (64, 858, 8);

-- MiniTest 65 (Topic 4): 6 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(65, 922, 1), (65, 923, 2), (65, 924, 3), (65, 925, 4),
(65, 932, 5), (65, 933, 6);

-- MiniTest 66 (Topic 5): 5 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(66, 934, 1), (66, 935, 2), (66, 938, 3), (66, 939, 4),
(66, 940, 5);

-- MiniTest 67 (Topic 6): 5 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(67, 944, 1), (67, 945, 2), (67, 946, 3), (67, 947, 4),
(67, 948, 5);

-- MiniTest 68 (Topic 7 - AI Basic): 15 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(68, 862, 1), (68, 863, 2), (68, 866, 3), (68, 867, 4),
(68, 870, 5), (68, 871, 6), (68, 874, 7), (68, 875, 8),
(68, 878, 9), (68, 879, 10), (68, 882, 11), (68, 890, 12),
(68, 894, 13), (68, 910, 14), (68, 911, 15);

-- MiniTest 69 (Topic 7 - AI Advanced): 15 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(69, 886, 1), (69, 887, 2), (69, 898, 3), (69, 899, 4),
(69, 902, 5), (69, 903, 6), (69, 906, 7), (69, 907, 8),
(69, 914, 9), (69, 915, 10), (69, 918, 11), (69, 919, 12),
(69, 884, 13), (69, 896, 14), (69, 920, 15);

-- MiniTest 70 (Topic 8): 5 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(70, 950, 1), (70, 951, 2), (70, 952, 3), (70, 953, 4),
(70, 954, 5);

-- MiniTest 71 (Topic 9): 5 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(71, 956, 1), (71, 957, 2), (71, 958, 3), (71, 959, 4),
(71, 960, 5);

-- MiniTest 72 (Topic 10): 5 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(72, 962, 1), (72, 963, 2), (72, 964, 3), (72, 965, 4),
(72, 966, 5);

-- MiniTest 73 (Topic 11): 5 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(73, 968, 1), (73, 969, 2), (73, 970, 3), (73, 971, 4),
(73, 972, 5);

-- MiniTest 74 (Topic 12): 5 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(74, 974, 1), (74, 975, 2), (74, 976, 3), (74, 977, 4),
(74, 978, 5);

-- MiniTest 75 (Topic 13): 5 questions
INSERT INTO MiniTestItems (MiniTestID, QuestionID, DisplayOrder) VALUES
(75, 980, 1), (75, 981, 2), (75, 982, 3), (75, 983, 4),
(75, 984, 5);

PRINT '✅ MiniTestItems inserted successfully.';

-- ============================================================
-- PART 9: ADD TOPIC 7 TO LEARNING PATH
-- Topic 7 (A.I English) needs to be added to learning path levels
-- ============================================================
-- Add AI topic to level 3 (TOEIC 700) and level 4 (TOEIC 900)
IF NOT EXISTS (SELECT 1 FROM LearningPathTopics WHERE LearningPathLevelID = 3 AND TopicID = 7)
    INSERT INTO LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt)
    VALUES (3, 7, 4, 0, SYSDATETIMEOFFSET());

IF NOT EXISTS (SELECT 1 FROM LearningPathTopics WHERE LearningPathLevelID = 4 AND TopicID = 7)
    INSERT INTO LearningPathTopics (LearningPathLevelID, TopicID, DisplayOrder, IsRequired, CreatedAt)
    VALUES (4, 7, 4, 0, SYSDATETIMEOFFSET());

PRINT '✅ LearningPathTopics updated - AI added to levels 3 and 4.';
PRINT '';
PRINT '============================================';
PRINT '✅ SEED MASSIVE DATA COMPLETED SUCCESSFULLY';
PRINT '============================================';
GO
