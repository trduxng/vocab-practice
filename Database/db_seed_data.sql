USE ToeicVocabularyPlatform_new;

GO
  /* ============================================================
   1. PART OF SPEECHES
   ============================================================ */
  IF NOT EXISTS (
    SELECT
      1
    FROM
      dbo.PartOfSpeeches
  ) BEGIN
INSERT INTO
  dbo.PartOfSpeeches (PartOfSpeechCode, PartOfSpeechName, Description)
VALUES
  ('n', 'Noun', 'Danh tu'),
  ('v', 'Verb', 'Dong tu'),
  ('adj', 'Adjective', 'Tinh tu'),
  ('adv', 'Adverb', 'Trang tu'),
  ('prep', 'Preposition', 'Gioi tu'),
  ('pron', 'Pronoun', 'Dai tu'),
  ('conj', 'Conjunction', 'Lien tu');

PRINT 'Inserted PartOfSpeeches';

END
ELSE PRINT 'PartOfSpeeches already has data, skipped.';

GO
  /* ============================================================
   2. TOPICS
   ============================================================ */
  IF NOT EXISTS (
    SELECT
      1
    FROM
      dbo.Topics
  ) BEGIN DECLARE @AdminUserID BIGINT;

SELECT
  TOP 1 @AdminUserID = UserID
FROM
  dbo.Users
WHERE
  UserRole = 'Admin';

IF @AdminUserID IS NOT NULL BEGIN
INSERT INTO
  dbo.Topics (
    TopicName,
    TopicCode,
    Description,
    CreatedByUserID
  )
VALUES
  (
    'IELTS Academic',
    'IELTS_ACAD',
    'Tu vung hoc thuat cho ky thi IELTS',
    @AdminUserID
  ),
  (
    'TOEIC Business',
    'TOEIC_BIZ',
    'Tu vung kinh doanh cho ky thi TOEIC',
    @AdminUserID
  ),
  (
    'Daily Communication',
    'DAILY_COMM',
    'Tu vung giao tiep hang ngay',
    @AdminUserID
  ),
  (
    'Technology',
    'TECH',
    'Tu vung ve cong nghe thong tin',
    @AdminUserID
  ),
  (
    'Environment',
    'ENV',
    'Tu vung ve moi truong va khi hau',
    @AdminUserID
  ),
  (
    'Education',
    'EDU',
    'Tu vung ve giao duc',
    @AdminUserID
  ),
  (
    'Healthcare',
    'HEALTH',
    'Tu vung ve suc khoe va y te',
    @AdminUserID
  );

PRINT 'Inserted Topics';

END
ELSE PRINT 'No Admin user found. Create an admin user first.';

END
ELSE PRINT 'Topics already has data, skipped.';

GO
  /* ============================================================
   3. SAMPLE WORDS + EXAMPLES + QUESTIONS
   ============================================================ */
  IF NOT EXISTS (
    SELECT
      1
    FROM
      dbo.Words
  ) BEGIN DECLARE @AdminID BIGINT;

SELECT
  TOP 1 @AdminID = UserID
FROM
  dbo.Users
WHERE
  UserRole = 'Admin';

IF @AdminID IS NULL BEGIN PRINT 'No Admin user found. Please create admin user first.';

RETURN;

END DECLARE @NounID INT,
@VerbID INT,
@AdjID INT,
@AdvID INT;

SELECT
  @NounID = PartOfSpeechID
FROM
  dbo.PartOfSpeeches
WHERE
  PartOfSpeechCode = 'n';

SELECT
  @VerbID = PartOfSpeechID
FROM
  dbo.PartOfSpeeches
WHERE
  PartOfSpeechCode = 'v';

SELECT
  @AdjID = PartOfSpeechID
FROM
  dbo.PartOfSpeeches
WHERE
  PartOfSpeechCode = 'adj';

SELECT
  @AdvID = PartOfSpeechID
FROM
  dbo.PartOfSpeeches
WHERE
  PartOfSpeechCode = 'adv';

DECLARE @TopicIELTS BIGINT,
@TopicTOEIC BIGINT,
@TopicDaily BIGINT,
@TopicTech BIGINT;

SELECT
  @TopicIELTS = TopicID
FROM
  dbo.Topics
WHERE
  TopicCode = 'IELTS_ACAD';

SELECT
  @TopicTOEIC = TopicID
FROM
  dbo.Topics
WHERE
  TopicCode = 'TOEIC_BIZ';

SELECT
  @TopicDaily = TopicID
FROM
  dbo.Topics
WHERE
  TopicCode = 'DAILY_COMM';

SELECT
  @TopicTech = TopicID
FROM
  dbo.Topics
WHERE
  TopicCode = 'TECH';

-- =============================================
-- Word 1: Ambiguous (Adjective)
-- =============================================
DECLARE @WordID BIGINT;

INSERT INTO
  dbo.Words (
    Term,
    PartOfSpeechID,
    Meaning,
    Phonetic,
    DifficultyLevel,
    CreatedByUserID
  )
VALUES
  (
    'Ambiguous',
    @AdjID,
    'Mo ho, khong ro rang',
    '/aem''bigjuos/',
    2,
    @AdminID
  );

SET
  @WordID = SCOPE_IDENTITY();

INSERT INTO
  dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation)
VALUES
  (
    @WordID,
    'The instructions were ambiguous and confusing.',
    'Huong dan rat mo ho va kho hieu.'
  ),
  (
    @WordID,
    'His answer was deliberately ambiguous.',
    'Cau tra loi cua anh ay co tinh mo ho.'
  );

INSERT INTO
  dbo.WordTopics (WordID, TopicID)
VALUES
  (@WordID, @TopicIELTS),
  (@WordID, @TopicDaily);

INSERT INTO
  dbo.Questions (
    WordID,
    QuestionType,
    QuestionText,
    OptionsJson,
    CorrectAnswer,
    Explanation,
    CreatedByUserID
  )
VALUES
  (
    @WordID,
    'MCQ',
    'What does "Ambiguous" mean?',
    '{ "options": [ {"label": "A", "text": "Ro rang, minh bach"}, {"label": "B", "text": "Mo ho, khong ro rang"}, {"label": "C", "text": "Quan trong, can thiet"}, {"label": "D", "text": "Nhanh chong, kip thoi"} ] }',
    'B',
    '"Ambiguous" nghia la mo ho, khong ro rang.',
    @AdminID
  );

-- =============================================
-- Word 2: Eloquent (Adjective)
-- =============================================
INSERT INTO
  dbo.Words (
    Term,
    PartOfSpeechID,
    Meaning,
    Phonetic,
    DifficultyLevel,
    CreatedByUserID
  )
VALUES
  (
    'Eloquent',
    @AdjID,
    'Hung hon, dien dat tot',
    '/''el@kw@nt/',
    2,
    @AdminID
  );

SET
  @WordID = SCOPE_IDENTITY();

INSERT INTO
  dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation)
VALUES
  (
    @WordID,
    'She gave an eloquent speech at the conference.',
    'Co ay da co mot bai phat bieu hung hon tai hoi nghi.'
  );

INSERT INTO
  dbo.WordTopics (WordID, TopicID)
VALUES
  (@WordID, @TopicIELTS),
  (@WordID, @TopicTOEIC);

INSERT INTO
  dbo.Questions (
    WordID,
    QuestionType,
    QuestionText,
    OptionsJson,
    CorrectAnswer,
    Explanation,
    CreatedByUserID
  )
VALUES
  (
    @WordID,
    'MCQ',
    'Choose the correct meaning of "Eloquent":',
    '{ "options": [ {"label": "A", "text": "Im lang, it noi"}, {"label": "B", "text": "Hung hon, dien dat tot"}, {"label": "C", "text": "Cham chap, le me"}, {"label": "D", "text": "Tho lo, bat lich su"} ] }',
    'B',
    '"Eloquent" mo ta kha nang noi hoac viet rat thuyet phuc va troi chay.',
    @AdminID
  );

-- =============================================
-- Word 3: Diligent (Adjective)
-- =============================================
INSERT INTO
  dbo.Words (
    Term,
    PartOfSpeechID,
    Meaning,
    Phonetic,
    DifficultyLevel,
    CreatedByUserID
  )
VALUES
  (
    'Diligent',
    @AdjID,
    'Cham chi, can cu',
    '/''dIlIdZ@nt/',
    1,
    @AdminID
  );

SET
  @WordID = SCOPE_IDENTITY();

INSERT INTO
  dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation)
VALUES
  (
    @WordID,
    'He is a diligent student who studies every day.',
    'Anh ay la mot hoc sinh cham chi, hoc tap moi ngay.'
  );

INSERT INTO
  dbo.WordTopics (WordID, TopicID)
VALUES
  (@WordID, @TopicDaily);

INSERT INTO
  dbo.Questions (
    WordID,
    QuestionType,
    QuestionText,
    OptionsJson,
    CorrectAnswer,
    Explanation,
    CreatedByUserID
  )
VALUES
  (
    @WordID,
    'MCQ',
    '"Diligent" means:',
    '{ "options": [ {"label": "A", "text": "Luoi bieng"}, {"label": "B", "text": "Thong minh"}, {"label": "C", "text": "Cham chi, can cu"}, {"label": "D", "text": "Nhanh nhen"} ] }',
    'C',
    '"Diligent" nhan manh su cham chi lien tuc, co ky luat.',
    @AdminID
  );

-- =============================================
-- Word 4: Innovate (Verb)
-- =============================================
INSERT INTO
  dbo.Words (
    Term,
    PartOfSpeechID,
    Meaning,
    Phonetic,
    DifficultyLevel,
    CreatedByUserID
  )
VALUES
  (
    'Innovate',
    @VerbID,
    'Doi moi, sang tao',
    '/''In@veIt/',
    3,
    @AdminID
  );

SET
  @WordID = SCOPE_IDENTITY();

INSERT INTO
  dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation)
VALUES
  (
    @WordID,
    'Companies must innovate to stay competitive.',
    'Cac cong ty phai doi moi de duy tri tinh canh tranh.'
  );

INSERT INTO
  dbo.WordTopics (WordID, TopicID)
VALUES
  (@WordID, @TopicTech),
  (@WordID, @TopicTOEIC);

INSERT INTO
  dbo.Questions (
    WordID,
    QuestionType,
    QuestionText,
    OptionsJson,
    CorrectAnswer,
    Explanation,
    CreatedByUserID
  )
VALUES
  (
    @WordID,
    'FillBlank',
    'To stay ahead, businesses need to constantly _____.',
    '{ "context": "Business innovation", "hints": ["doi moi", "sang tao"] }',
    'innovate',
    '"Innovate" la dong tu, nghia la doi moi, sang tao.',
    @AdminID
  );

-- =============================================
-- Word 5: Versatile (Adjective)
-- =============================================
INSERT INTO
  dbo.Words (
    Term,
    PartOfSpeechID,
    Meaning,
    Phonetic,
    DifficultyLevel,
    CreatedByUserID
  )
VALUES
  (
    'Versatile',
    @AdjID,
    'Linh hoat, da nang',
    '/''v3:s@taIl/',
    2,
    @AdminID
  );

SET
  @WordID = SCOPE_IDENTITY();

INSERT INTO
  dbo.ExampleSentences (WordID, SentenceText, SentenceTranslation)
VALUES
  (
    @WordID,
    'She is a versatile athlete who excels in multiple sports.',
    'Co ay la mot van dong vien da nang, xuat sac trong nhieu mon the thao.'
  );

INSERT INTO
  dbo.WordTopics (WordID, TopicID)
VALUES
  (@WordID, @TopicDaily),
  (@WordID, @TopicIELTS);

INSERT INTO
  dbo.Questions (
    WordID,
    QuestionType,
    QuestionText,
    OptionsJson,
    CorrectAnswer,
    Explanation,
    CreatedByUserID
  )
VALUES
  (
    @WordID,
    'MCQ',
    'Someone who is "versatile" is:',
    '{ "options": [ {"label": "A", "text": "Chi gioi mot viec"}, {"label": "B", "text": "Linh hoat, da nang"}, {"label": "C", "text": "Cung nhac, kho thay doi"}, {"label": "D", "text": "Cham chap"} ] }',
    'B',
    '"Versatile" dung khi mot nguoi hoac vat co nhieu ky nang hoac cong dung.',
    @AdminID
  );

PRINT 'Inserted sample Words, Examples, and Questions.';

END
ELSE PRINT 'Words already has data, skipped.';

GO
  PRINT 'Seed data script completed!';

GO
