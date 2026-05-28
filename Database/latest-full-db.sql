USE [master]
GO
/****** Object:  Database [ToeicVocabularyPlatform]    Script Date: 28-May-26 8:31:13 PM ******/
CREATE DATABASE [ToeicVocabularyPlatform]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'ToeicVocabularyPlatform', FILENAME = N'/var/opt/mssql/data/ToeicVocabularyPlatform.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'ToeicVocabularyPlatform_log', FILENAME = N'/var/opt/mssql/data/ToeicVocabularyPlatform_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [ToeicVocabularyPlatform].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET ARITHABORT OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET  ENABLE_BROKER 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET  MULTI_USER 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET DB_CHAINING OFF 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'ToeicVocabularyPlatform', N'ON'
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET QUERY_STORE = ON
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [ToeicVocabularyPlatform]
GO
/****** Object:  Table [dbo].[Topics]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Topics](
	[TopicID] [bigint] IDENTITY(1,1) NOT NULL,
	[TopicName] [nvarchar](200) NOT NULL,
	[TopicCode] [nvarchar](50) NOT NULL,
	[Description] [nvarchar](1000) NULL,
	[CreatedByUserID] [bigint] NOT NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
	[UpdatedAt] [datetimeoffset](7) NOT NULL,
	[TopicCategoryID] [bigint] NULL,
	[ContentStatus] [nvarchar](30) NOT NULL,
	[ReviewedByUserID] [bigint] NULL,
	[ReviewedAt] [datetimeoffset](7) NULL,
	[PublishedAt] [datetimeoffset](7) NULL,
 CONSTRAINT [PK_Topics] PRIMARY KEY CLUSTERED 
(
	[TopicID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserTopicEnrollments]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserTopicEnrollments](
	[UserTopicEnrollmentID] [bigint] IDENTITY(1,1) NOT NULL,
	[UserID] [bigint] NOT NULL,
	[TopicID] [bigint] NOT NULL,
	[EnrolledAt] [datetimeoffset](7) NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_UserTopicEnrollments] PRIMARY KEY CLUSTERED 
(
	[UserTopicEnrollmentID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WordTopics]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WordTopics](
	[WordID] [bigint] NOT NULL,
	[TopicID] [bigint] NOT NULL,
	[AssignedAt] [datetimeoffset](7) NOT NULL,
 CONSTRAINT [PK_WordTopics] PRIMARY KEY CLUSTERED 
(
	[WordID] ASC,
	[TopicID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserWordProgress]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserWordProgress](
	[UserWordProgressID] [bigint] IDENTITY(1,1) NOT NULL,
	[UserID] [bigint] NOT NULL,
	[WordID] [bigint] NOT NULL,
	[MasteryLevel] [tinyint] NOT NULL,
	[EaseFactor] [decimal](4, 2) NOT NULL,
	[RepetitionCount] [int] NOT NULL,
	[ConsecutiveCorrect] [int] NOT NULL,
	[ConsecutiveWrong] [int] NOT NULL,
	[LastReviewedAt] [datetimeoffset](7) NULL,
	[NextReviewDate] [datetimeoffset](7) NULL,
	[LastScore] [decimal](5, 2) NULL,
	[MemoryStatus] [nvarchar](30) NOT NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
	[UpdatedAt] [datetimeoffset](7) NOT NULL,
 CONSTRAINT [PK_UserWordProgress] PRIMARY KEY CLUSTERED 
(
	[UserWordProgressID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_TopicLearningAnalytics]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[vw_TopicLearningAnalytics]
AS
SELECT
    t.TopicID,
    t.TopicName,
    t.TopicCode,

    COUNT(DISTINCT ute.UserID) AS TotalEnrolledLearners,
    COUNT(DISTINCT wt.WordID) AS TotalWords,
    COUNT(DISTINCT uwp.UserID) AS LearnersWithProgress,

    AVG(CAST(uwp.MasteryLevel AS DECIMAL(10,2))) AS AvgMasteryLevel,
    AVG(CAST(uwp.LastScore AS DECIMAL(10,2))) AS AvgLastScore,

    SUM(CASE WHEN uwp.MemoryStatus = N'Mastered' THEN 1 ELSE 0 END) AS TotalMasteredRecords,
    SUM(CASE WHEN uwp.MemoryStatus = N'Lapsed' THEN 1 ELSE 0 END) AS TotalLapsedRecords
FROM dbo.Topics t
LEFT JOIN dbo.UserTopicEnrollments ute
    ON ute.TopicID = t.TopicID
    AND ute.IsActive = 1
LEFT JOIN dbo.WordTopics wt
    ON wt.TopicID = t.TopicID
LEFT JOIN dbo.UserWordProgress uwp
    ON uwp.WordID = wt.WordID
GROUP BY
    t.TopicID,
    t.TopicName,
    t.TopicCode;


GO
/****** Object:  Table [dbo].[MiniTestAttempts]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiniTestAttempts](
	[MiniTestAttemptID] [bigint] IDENTITY(1,1) NOT NULL,
	[MiniTestID] [bigint] NOT NULL,
	[UserID] [bigint] NOT NULL,
	[StartedAt] [datetimeoffset](7) NOT NULL,
	[SubmittedAt] [datetimeoffset](7) NULL,
	[TotalQuestions] [int] NOT NULL,
	[CorrectCount] [int] NOT NULL,
	[Score] [decimal](5, 2) NULL,
 CONSTRAINT [PK_MiniTestAttempts] PRIMARY KEY CLUSTERED 
(
	[MiniTestAttemptID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MiniTests]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiniTests](
	[MiniTestID] [bigint] IDENTITY(1,1) NOT NULL,
	[TopicID] [bigint] NULL,
	[TestTitle] [nvarchar](255) NOT NULL,
	[Description] [nvarchar](1000) NULL,
	[CreatedByUserID] [bigint] NOT NULL,
	[TotalQuestions] [int] NOT NULL,
	[IsPublished] [bit] NOT NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
	[UpdatedAt] [datetimeoffset](7) NOT NULL,
	[ContentStatus] [nvarchar](30) NOT NULL,
	[ReviewedByUserID] [bigint] NULL,
	[ReviewedAt] [datetimeoffset](7) NULL,
	[PublishedAt] [datetimeoffset](7) NULL,
 CONSTRAINT [PK_MiniTests] PRIMARY KEY CLUSTERED 
(
	[MiniTestID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_MiniTestAnalytics]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[vw_MiniTestAnalytics]
AS
SELECT
    mt.MiniTestID,
    mt.TestTitle,
    mt.TopicID,
    t.TopicName,

    COUNT(mta.MiniTestAttemptID) AS TotalAttempts,
    COUNT(DISTINCT mta.UserID) AS TotalLearners,
    AVG(CAST(mta.Score AS DECIMAL(10,2))) AS AvgScore,
    MIN(mta.Score) AS MinScore,
    MAX(mta.Score) AS MaxScore,

    SUM(CASE WHEN mta.SubmittedAt IS NOT NULL THEN 1 ELSE 0 END) AS SubmittedAttempts,
    SUM(CASE WHEN mta.SubmittedAt IS NULL THEN 1 ELSE 0 END) AS UnfinishedAttempts
FROM dbo.MiniTests mt
LEFT JOIN dbo.Topics t
    ON t.TopicID = mt.TopicID
LEFT JOIN dbo.MiniTestAttempts mta
    ON mta.MiniTestID = mt.MiniTestID
GROUP BY
    mt.MiniTestID,
    mt.TestTitle,
    mt.TopicID,
    t.TopicName;


GO
/****** Object:  Table [dbo].[TopicCategories]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TopicCategories](
	[TopicCategoryID] [bigint] IDENTITY(1,1) NOT NULL,
	[CategoryName] [nvarchar](255) NOT NULL,
	[CategoryCode] [nvarchar](100) NOT NULL,
	[Description] [nvarchar](1000) NULL,
	[IconUrl] [nvarchar](1000) NULL,
	[DisplayOrder] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedByUserID] [bigint] NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
	[UpdatedAt] [datetimeoffset](7) NOT NULL,
 CONSTRAINT [PK_TopicCategories] PRIMARY KEY CLUSTERED 
(
	[TopicCategoryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_TopicCategorySummary]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[vw_TopicCategorySummary]
AS
SELECT
    tc.TopicCategoryID,
    tc.CategoryName,
    tc.CategoryCode,
    tc.Description,
    tc.IconUrl,
    tc.DisplayOrder,
    tc.IsActive,
    COUNT(t.TopicID) AS TotalTopics,
    SUM
    (
        CASE
            WHEN t.ContentStatus = N'Published' THEN 1
            ELSE 0
        END
    ) AS PublishedTopics,
    SUM
    (
        CASE
            WHEN t.ContentStatus = N'Draft' THEN 1
            ELSE 0
        END
    ) AS DraftTopics,
    SUM
    (
        CASE
            WHEN t.ContentStatus = N'PendingReview' THEN 1
            ELSE 0
        END
    ) AS PendingReviewTopics
FROM dbo.TopicCategories tc
LEFT JOIN dbo.Topics t
    ON t.TopicCategoryID = tc.TopicCategoryID
GROUP BY
    tc.TopicCategoryID,
    tc.CategoryName,
    tc.CategoryCode,
    tc.Description,
    tc.IconUrl,
    tc.DisplayOrder,
    tc.IsActive;


GO
/****** Object:  Table [dbo].[Users]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserID] [bigint] IDENTITY(1,1) NOT NULL,
	[FullName] [nvarchar](200) NOT NULL,
	[Email] [nvarchar](255) NOT NULL,
	[PasswordHash] [nvarchar](500) NOT NULL,
	[UserRole] [nvarchar](30) NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
	[UpdatedAt] [datetimeoffset](7) NOT NULL,
	[RoleID] [int] NOT NULL,
	[DailyGoal] [int] NOT NULL,
	[SRSReviewLimit] [int] NOT NULL,
	[TotalXP] [int] NOT NULL,
	[CurrentLevel] [int] NOT NULL,
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Words]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Words](
	[WordID] [bigint] IDENTITY(1,1) NOT NULL,
	[Term] [nvarchar](200) NOT NULL,
	[PartOfSpeechID] [int] NOT NULL,
	[Meaning] [nvarchar](1000) NOT NULL,
	[Phonetic] [nvarchar](255) NULL,
	[AudioUrlUK] [nvarchar](1000) NULL,
	[AudioUrlUS] [nvarchar](1000) NULL,
	[ImageUrl] [nvarchar](1000) NULL,
	[DifficultyLevel] [tinyint] NOT NULL,
	[CreatedByUserID] [bigint] NOT NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
	[UpdatedAt] [datetimeoffset](7) NOT NULL,
	[ContentStatus] [nvarchar](30) NOT NULL,
	[ReviewedByUserID] [bigint] NULL,
	[ReviewedAt] [datetimeoffset](7) NULL,
	[PublishedAt] [datetimeoffset](7) NULL,
 CONSTRAINT [PK_Words] PRIMARY KEY CLUSTERED 
(
	[WordID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Questions]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Questions](
	[QuestionID] [bigint] IDENTITY(1,1) NOT NULL,
	[WordID] [bigint] NOT NULL,
	[QuestionType] [nvarchar](30) NOT NULL,
	[QuestionText] [nvarchar](2000) NOT NULL,
	[OptionsJson] [nvarchar](max) NOT NULL,
	[CorrectAnswer] [nvarchar](500) NOT NULL,
	[Explanation] [nvarchar](2000) NULL,
	[DifficultyLevel] [tinyint] NOT NULL,
	[CreatedByUserID] [bigint] NOT NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
	[UpdatedAt] [datetimeoffset](7) NOT NULL,
	[ContentStatus] [nvarchar](30) NOT NULL,
	[ReviewedByUserID] [bigint] NULL,
	[ReviewedAt] [datetimeoffset](7) NULL,
	[PublishedAt] [datetimeoffset](7) NULL,
 CONSTRAINT [PK_Questions] PRIMARY KEY CLUSTERED 
(
	[QuestionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_ContentCreatorContentSummary]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[vw_ContentCreatorContentSummary]
AS
SELECT
    u.UserID,
    u.FullName,
    u.Email,

    COUNT(DISTINCT t.TopicID) AS TotalTopics,
    COUNT(DISTINCT w.WordID) AS TotalWords,
    COUNT(DISTINCT q.QuestionID) AS TotalQuestions,
    COUNT(DISTINCT mt.MiniTestID) AS TotalMiniTests,

    SUM(CASE WHEN w.ContentStatus = N'Published' THEN 1 ELSE 0 END) AS PublishedWords,
    SUM(CASE WHEN w.ContentStatus = N'PendingReview' THEN 1 ELSE 0 END) AS PendingWords,
    SUM(CASE WHEN w.ContentStatus = N'Rejected' THEN 1 ELSE 0 END) AS RejectedWords
FROM dbo.Users u
LEFT JOIN dbo.Topics t
    ON t.CreatedByUserID = u.UserID
LEFT JOIN dbo.Words w
    ON w.CreatedByUserID = u.UserID
LEFT JOIN dbo.Questions q
    ON q.CreatedByUserID = u.UserID
LEFT JOIN dbo.MiniTests mt
    ON mt.CreatedByUserID = u.UserID
WHERE u.UserRole = N'ContentCreator'
GROUP BY
    u.UserID,
    u.FullName,
    u.Email;


GO
/****** Object:  Table [dbo].[AdminAuditLogs]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AdminAuditLogs](
	[AdminAuditLogID] [bigint] IDENTITY(1,1) NOT NULL,
	[ActionByUserID] [bigint] NOT NULL,
	[Action] [nvarchar](100) NOT NULL,
	[EntityType] [nvarchar](50) NOT NULL,
	[EntityID] [bigint] NULL,
	[Details] [nvarchar](max) NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AdminAuditLogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContentMediaLinks]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContentMediaLinks](
	[ContentMediaLinkID] [bigint] IDENTITY(1,1) NOT NULL,
	[MediaAssetID] [bigint] NOT NULL,
	[EntityType] [nvarchar](30) NOT NULL,
	[EntityID] [bigint] NOT NULL,
	[Purpose] [nvarchar](50) NULL,
	[DisplayOrder] [int] NOT NULL,
 CONSTRAINT [PK_ContentMediaLinks] PRIMARY KEY CLUSTERED 
(
	[ContentMediaLinkID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContentReports]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContentReports](
	[ContentReportID] [bigint] IDENTITY(1,1) NOT NULL,
	[ReporterUserID] [bigint] NOT NULL,
	[EntityType] [nvarchar](30) NOT NULL,
	[WordID] [bigint] NULL,
	[QuestionID] [bigint] NULL,
	[ReportType] [nvarchar](50) NOT NULL,
	[Title] [nvarchar](200) NOT NULL,
	[Description] [nvarchar](2000) NOT NULL,
	[Status] [nvarchar](30) NOT NULL,
	[Priority] [nvarchar](20) NOT NULL,
	[AdminResponse] [nvarchar](2000) NULL,
	[ResolvedByUserID] [bigint] NULL,
	[ResolvedAt] [datetimeoffset](7) NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
	[UpdatedAt] [datetimeoffset](7) NOT NULL,
 CONSTRAINT [PK_ContentReports] PRIMARY KEY CLUSTERED 
(
	[ContentReportID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContentReviewLogs]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContentReviewLogs](
	[ContentReviewLogID] [bigint] IDENTITY(1,1) NOT NULL,
	[EntityType] [nvarchar](30) NOT NULL,
	[EntityID] [bigint] NOT NULL,
	[ActionByUserID] [bigint] NOT NULL,
	[OldStatus] [nvarchar](30) NULL,
	[NewStatus] [nvarchar](30) NOT NULL,
	[Comment] [nvarchar](2000) NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
 CONSTRAINT [PK_ContentReviewLogs] PRIMARY KEY CLUSTERED 
(
	[ContentReviewLogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ExampleSentences]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ExampleSentences](
	[ExampleSentenceID] [bigint] IDENTITY(1,1) NOT NULL,
	[WordID] [bigint] NOT NULL,
	[SentenceText] [nvarchar](2000) NOT NULL,
	[SentenceTranslation] [nvarchar](2000) NULL,
	[AudioUrl] [nvarchar](1000) NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
	[UpdatedAt] [datetimeoffset](7) NOT NULL,
 CONSTRAINT [PK_ExampleSentences] PRIMARY KEY CLUSTERED 
(
	[ExampleSentenceID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ExerciseAttempts]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ExerciseAttempts](
	[ExerciseAttemptID] [bigint] IDENTITY(1,1) NOT NULL,
	[UserID] [bigint] NOT NULL,
	[QuestionID] [bigint] NOT NULL,
	[WordID] [bigint] NOT NULL,
	[SubmittedAnswer] [nvarchar](1000) NOT NULL,
	[IsCorrect] [bit] NOT NULL,
	[ScoreAwarded] [decimal](5, 2) NOT NULL,
	[AttemptedAt] [datetimeoffset](7) NOT NULL,
	[ClientTimeZoneOffset] [nvarchar](10) NULL,
	[AttemptMetadataJson] [nvarchar](max) NULL,
 CONSTRAINT [PK_ExerciseAttempts] PRIMARY KEY CLUSTERED 
(
	[ExerciseAttemptID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MediaAssets]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MediaAssets](
	[MediaAssetID] [bigint] IDENTITY(1,1) NOT NULL,
	[UploadedByUserID] [bigint] NOT NULL,
	[MediaType] [nvarchar](30) NOT NULL,
	[FileUrl] [nvarchar](1000) NOT NULL,
	[FileName] [nvarchar](255) NULL,
	[MimeType] [nvarchar](100) NULL,
	[FileSizeBytes] [bigint] NULL,
	[AltText] [nvarchar](500) NULL,
	[Transcript] [nvarchar](2000) NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
 CONSTRAINT [PK_MediaAssets] PRIMARY KEY CLUSTERED 
(
	[MediaAssetID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MiniTestItems]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MiniTestItems](
	[MiniTestID] [bigint] NOT NULL,
	[QuestionID] [bigint] NOT NULL,
	[DisplayOrder] [int] NOT NULL,
 CONSTRAINT [PK_MiniTestItems] PRIMARY KEY CLUSTERED 
(
	[MiniTestID] ASC,
	[QuestionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Notifications]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Notifications](
	[NotificationID] [bigint] IDENTITY(1,1) NOT NULL,
	[UserID] [bigint] NOT NULL,
	[Title] [nvarchar](200) NOT NULL,
	[Message] [nvarchar](2000) NOT NULL,
	[Type] [nvarchar](50) NOT NULL,
	[DeliveryChannel] [nvarchar](20) NOT NULL,
	[IsRead] [bit] NOT NULL,
	[ActionUrl] [nvarchar](500) NULL,
	[CreatedAt] [datetimeoffset](7) NOT NULL,
 CONSTRAINT [PK_Notifications] PRIMARY KEY CLUSTERED 
(
	[NotificationID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PartOfSpeeches]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PartOfSpeeches](
	[PartOfSpeechID] [int] IDENTITY(1,1) NOT NULL,
	[PartOfSpeechCode] [nvarchar](20) NOT NULL,
	[PartOfSpeechName] [nvarchar](100) NOT NULL,
	[Description] [nvarchar](255) NULL,
 CONSTRAINT [PK_PartOfSpeeches] PRIMARY KEY CLUSTERED 
(
	[PartOfSpeechID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Permissions]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Permissions](
	[PermissionID] [int] IDENTITY(1,1) NOT NULL,
	[PermissionCode] [nvarchar](50) NOT NULL,
	[Description] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[PermissionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RolePermissions]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RolePermissions](
	[RoleID] [int] NOT NULL,
	[PermissionID] [int] NOT NULL,
 CONSTRAINT [PK_RolePermissions] PRIMARY KEY CLUSTERED 
(
	[RoleID] ASC,
	[PermissionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Roles]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
	[RoleID] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [nvarchar](50) NOT NULL,
	[Description] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[RoleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserVocabularyNotebook]    Script Date: 28-May-26 8:31:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserVocabularyNotebook](
	[NotebookID] [bigint] IDENTITY(1,1) NOT NULL,
	[UserID] [bigint] NOT NULL,
	[WordID] [bigint] NOT NULL,
	[PersonalNote] [nvarchar](2000) NULL,
	[IsFavorite] [bit] NOT NULL,
	[AddedAt] [datetimeoffset](7) NOT NULL,
	[UpdatedAt] [datetimeoffset](7) NOT NULL,
 CONSTRAINT [PK_UserVocabularyNotebook] PRIMARY KEY CLUSTERED 
(
	[NotebookID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[AdminAuditLogs] ON 

INSERT [dbo].[AdminAuditLogs] ([AdminAuditLogID], [ActionByUserID], [Action], [EntityType], [EntityID], [Details], [CreatedAt]) VALUES (1, 5, N'DELETE_TOPIC', N'Topic', 3, NULL, CAST(N'2026-05-20T14:44:00.9149274+07:00' AS DateTimeOffset))
INSERT [dbo].[AdminAuditLogs] ([AdminAuditLogID], [ActionByUserID], [Action], [EntityType], [EntityID], [Details], [CreatedAt]) VALUES (2, 5, N'UPDATE_CONTENT_STATUS', N'Word', 43, N'{"oldStatus":"Draft","status":"PendingReview","comment":"Review content"}', CAST(N'2026-05-20T14:45:36.1342268+07:00' AS DateTimeOffset))
INSERT [dbo].[AdminAuditLogs] ([AdminAuditLogID], [ActionByUserID], [Action], [EntityType], [EntityID], [Details], [CreatedAt]) VALUES (3, 5, N'UPDATE_CONTENT_STATUS', N'Word', 43, N'{"oldStatus":"PendingReview","status":"PendingReview","comment":"Review content"}', CAST(N'2026-05-20T14:45:39.5272824+07:00' AS DateTimeOffset))
INSERT [dbo].[AdminAuditLogs] ([AdminAuditLogID], [ActionByUserID], [Action], [EntityType], [EntityID], [Details], [CreatedAt]) VALUES (4, 5, N'UPDATE_CONTENT_STATUS', N'Word', 43, N'{"oldStatus":"PendingReview","status":"Published","comment":"Review content"}', CAST(N'2026-05-20T14:45:53.7176543+07:00' AS DateTimeOffset))
INSERT [dbo].[AdminAuditLogs] ([AdminAuditLogID], [ActionByUserID], [Action], [EntityType], [EntityID], [Details], [CreatedAt]) VALUES (5, 5, N'UPDATE_CONTENT_REPORT', N'ContentReport', 1, N'{"old":{"Status":"Open","Priority":"Normal"},"status":"Resolved","priority":"Normal","hasResponse":true}', CAST(N'2026-05-25T15:26:25.8362315+07:00' AS DateTimeOffset))
SET IDENTITY_INSERT [dbo].[AdminAuditLogs] OFF
GO
SET IDENTITY_INSERT [dbo].[ContentReports] ON 

INSERT [dbo].[ContentReports] ([ContentReportID], [ReporterUserID], [EntityType], [WordID], [QuestionID], [ReportType], [Title], [Description], [Status], [Priority], [AdminResponse], [ResolvedByUserID], [ResolvedAt], [CreatedAt], [UpdatedAt]) VALUES (1, 4, N'Question', 30, 45, N'AnswerIncorrect', N'Report question #45', N'receipt', N'Resolved', N'Normal', N'', 5, CAST(N'2026-05-25T15:26:25.8177797+07:00' AS DateTimeOffset), CAST(N'2026-05-25T15:25:43.7008847+07:00' AS DateTimeOffset), CAST(N'2026-05-25T15:26:25.8177797+07:00' AS DateTimeOffset))
SET IDENTITY_INSERT [dbo].[ContentReports] OFF
GO
SET IDENTITY_INSERT [dbo].[ContentReviewLogs] ON 

INSERT [dbo].[ContentReviewLogs] ([ContentReviewLogID], [EntityType], [EntityID], [ActionByUserID], [OldStatus], [NewStatus], [Comment], [CreatedAt]) VALUES (1, N'Topic', 3, 9, NULL, N'PendingReview', N'Submitted for review', CAST(N'2026-05-20T14:23:07.5235821+07:00' AS DateTimeOffset))
INSERT [dbo].[ContentReviewLogs] ([ContentReviewLogID], [EntityType], [EntityID], [ActionByUserID], [OldStatus], [NewStatus], [Comment], [CreatedAt]) VALUES (2, N'Topic', 3, 5, N'PendingReview', N'Rejected', NULL, CAST(N'2026-05-20T14:23:45.9944970+07:00' AS DateTimeOffset))
INSERT [dbo].[ContentReviewLogs] ([ContentReviewLogID], [EntityType], [EntityID], [ActionByUserID], [OldStatus], [NewStatus], [Comment], [CreatedAt]) VALUES (3, N'Word', 43, 5, N'Draft', N'PendingReview', N'Review content', CAST(N'2026-05-20T14:45:36.1181306+07:00' AS DateTimeOffset))
INSERT [dbo].[ContentReviewLogs] ([ContentReviewLogID], [EntityType], [EntityID], [ActionByUserID], [OldStatus], [NewStatus], [Comment], [CreatedAt]) VALUES (4, N'Word', 43, 5, N'PendingReview', N'PendingReview', N'Review content', CAST(N'2026-05-20T14:45:39.5154310+07:00' AS DateTimeOffset))
INSERT [dbo].[ContentReviewLogs] ([ContentReviewLogID], [EntityType], [EntityID], [ActionByUserID], [OldStatus], [NewStatus], [Comment], [CreatedAt]) VALUES (5, N'Word', 43, 5, N'PendingReview', N'Published', N'Review content', CAST(N'2026-05-20T14:45:53.7060358+07:00' AS DateTimeOffset))
SET IDENTITY_INSERT [dbo].[ContentReviewLogs] OFF
GO
SET IDENTITY_INSERT [dbo].[ExampleSentences] ON 

INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (1, 23, N'The manager sent the meeting agenda yesterday.', N'Nguoi quan ly da gui chuong trinh cuoc hop vao hom qua.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (2, 24, N'I have an appointment with the client at 10 a.m.', N'Toi co lich hen voi khach hang luc 10 gio sang.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (3, 25, N'Please arrange a conference room for the interview.', N'Vui long sap xep phong hop cho buoi phong van.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (4, 26, N'All team members are expected to attend the training.', N'Tat ca thanh vien nhom duoc yeu cau tham du buoi dao tao.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (5, 27, N'The director gave a brief update on sales.', N'Giam doc dua ra cap nhat ngan gon ve doanh so.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (6, 28, N'Two departments will collaborate on the new campaign.', N'Hai phong ban se hop tac trong chien dich moi.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (7, 29, N'Please confirm your attendance by Friday.', N'Vui long xac nhan viec tham du truoc thu Sau.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (8, 30, N'The deadline for the report is next Monday.', N'Han chot nop bao cao la thu Hai toi.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (9, 31, N'The supervisor will delegate tasks to the assistants.', N'Giam sat vien se giao viec cho cac tro ly.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (10, 32, N'We need to discuss the budget before approval.', N'Chung ta can thao luan ngan sach truoc khi phe duyet.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (11, 33, N'She requested an extension for the project deadline.', N'Co ay yeu cau gia han thoi han du an.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (12, 34, N'The follow-up email included the final schedule.', N'Email theo doi sau do co kem lich trinh cuoi cung.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (13, 35, N'The assistant prepared the minutes after the meeting.', N'Tro ly da chuan bi bien ban sau cuoc hop.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (14, 36, N'They decided to postpone the presentation until Thursday.', N'Ho quyet dinh hoan bai thuyet trinh den thu Nam.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (15, 37, N'The proposal was reviewed by senior management.', N'Ban de xuat da duoc ban quan ly cap cao xem xet.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (16, 38, N'I am calling regarding your recent invoice.', N'Toi goi ve hoa don gan day cua ban.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (17, 39, N'We had to reschedule the supplier meeting.', N'Chung toi da phai doi lich hop voi nha cung cap.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (18, 40, N'Could you summarize the main points of the report?', N'Ban co the tom tat cac y chinh cua bao cao khong?', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (19, 41, N'The venue for the seminar is on the third floor.', N'Dia diem to chuc hoi thao nam o tang ba.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[ExampleSentences] ([ExampleSentenceID], [WordID], [SentenceText], [SentenceTranslation], [AudioUrl], [CreatedAt], [UpdatedAt]) VALUES (20, 42, N'The new software improved the team workflow.', N'Phan mem moi da cai thien quy trinh lam viec cua nhom.', NULL, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
SET IDENTITY_INSERT [dbo].[ExampleSentences] OFF
GO
SET IDENTITY_INSERT [dbo].[ExerciseAttempts] ON 

INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (6, 5, 24, 12, N'Objective', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-04T16:05:15.6214639+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (13, 4, 21, 11, N'Báº£o trÃ¬, duy trÃ¬', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-05T21:30:54.9963636+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (14, 4, 24, 12, N'Objective', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-05T21:30:55.1830031+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (17, 4, 22, 11, N'Maintain', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-05T21:30:55.7442987+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (20, 4, 23, 12, N'Má»¥c tiÃªu', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-05T21:30:56.4826731+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (38, 4, 23, 12, N'Má»¥c tiÃªu', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-08T15:40:15.2545457+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (39, 4, 22, 11, N'Maintain', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-08T15:40:26.9372193+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (40, 4, 22, 11, N'Maintain', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-08T15:44:44.1650656+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (41, 4, 24, 12, N'Objective', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-08T15:44:50.6063421+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (42, 4, 23, 12, N'Má»¥c tiÃªu', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-18T08:29:18.8084627+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (43, 4, 22, 11, N'Maintain', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-18T08:29:21.9279906+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (44, 4, 66, 40, N'summarize', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-18T08:43:48.4736927+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (45, 4, 46, 30, N'deadline', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-18T08:43:51.8503982+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (46, 4, 44, 29, N'confirm', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-18T08:43:53.7329531+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (47, 4, 35, 25, N'sap xep, bo tri', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-18T08:43:55.0747084+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (48, 4, 53, 34, N'TIMEOUT', 0, CAST(0.00 AS Decimal(5, 2)), CAST(N'2026-05-18T13:38:15.3265611+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (49, 4, 33, 24, N'cuoc hen, lich hen', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-18T13:39:00.7890166+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (50, 4, 63, 39, N'thiet bi van phong', 0, CAST(0.00 AS Decimal(5, 2)), CAST(N'2026-05-18T13:39:31.3045035+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (51, 4, 58, 36, N'postpone', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-18T13:42:04.0975482+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (52, 4, 62, 38, N'regarding', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-18T13:42:11.2197860+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (53, 4, 56, 35, N'minutes', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-18T14:11:30.2554741+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (54, 4, 40, 27, N'brief', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-18T14:11:32.3035525+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (55, 4, 65, 40, N'tom tat', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-19T14:28:37.9978739+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (56, 4, 57, 36, N'tri hoan', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-19T14:28:41.5794589+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (57, 4, 55, 35, N'bien ban cuoc hop', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-19T14:28:49.5286400+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (58, 4, 42, 28, N'ăn', 0, CAST(0.00 AS Decimal(5, 2)), CAST(N'2026-05-19T14:28:56.0377925+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (59, 4, 67, 41, N'khach hang tiem nang', 0, CAST(0.00 AS Decimal(5, 2)), CAST(N'2026-05-19T14:29:03.1298017+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (60, 4, 37, 26, N'wrong', 0, CAST(0.00 AS Decimal(5, 2)), CAST(N'2026-05-20T13:54:31.2708462+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (61, 4, 36, 25, N'arrange', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-20T13:56:46.7688236+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (62, 4, 33, 24, N'cuoc hen, lich hen', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-20T13:56:55.4674720+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (63, 4, 61, 38, N'TIMEOUT', 0, CAST(0.00 AS Decimal(5, 2)), CAST(N'2026-05-20T13:57:19.8183896+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (64, 4, 70, 42, N'workflow', 1, CAST(100.00 AS Decimal(5, 2)), CAST(N'2026-05-20T14:05:30.4511169+07:00' AS DateTimeOffset), NULL, NULL)
INSERT [dbo].[ExerciseAttempts] ([ExerciseAttemptID], [UserID], [QuestionID], [WordID], [SubmittedAnswer], [IsCorrect], [ScoreAwarded], [AttemptedAt], [ClientTimeZoneOffset], [AttemptMetadataJson]) VALUES (65, 4, 45, 30, N'TIMEOUT', 0, CAST(0.00 AS Decimal(5, 2)), CAST(N'2026-05-25T15:25:46.2597068+07:00' AS DateTimeOffset), NULL, NULL)
SET IDENTITY_INSERT [dbo].[ExerciseAttempts] OFF
GO
SET IDENTITY_INSERT [dbo].[PartOfSpeeches] ON 

INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description]) VALUES (1, N'n', N'Noun', N'Danh từ')
INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description]) VALUES (2, N'v', N'Verb', N'Động từ')
INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description]) VALUES (3, N'adj', N'Adjective', N'Tính từ')
INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description]) VALUES (4, N'adv', N'Adverb', N'Trạng từ')
INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description]) VALUES (5, N'prep', N'Preposition', N'Giới từ')
INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description]) VALUES (6, N'Verb', N'Äá»™ng tá»«', NULL)
INSERT [dbo].[PartOfSpeeches] ([PartOfSpeechID], [PartOfSpeechCode], [PartOfSpeechName], [Description]) VALUES (7, N'Noun', N'Danh tá»«', NULL)
SET IDENTITY_INSERT [dbo].[PartOfSpeeches] OFF
GO
SET IDENTITY_INSERT [dbo].[Permissions] ON 

INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (1, N'VIEW_DASHBOARD', N'Xem dashboard')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (2, N'MANAGE_WORDS', N'Quáº£n lÃ½ tá»« vá»±ng')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (3, N'MANAGE_QUESTIONS', N'Quáº£n lÃ½ cÃ¢u há»i')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (4, N'MANAGE_TESTS', N'Quáº£n lÃ½ bÃ i thi')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (5, N'MANAGE_USERS', N'Quáº£n lÃ½ ngÆ°á»i dÃ¹ng')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (6, N'LEARN_VOCAB', N'Há»c tá»« vá»±ng')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (7, N'MANAGE_TOPIC_CATEGORIES', N'Quản lý danh mục chủ đề')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (8, N'ENROLL_TOPICS', N'Chọn / đăng ký bộ từ vựng')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (9, N'MANAGE_NOTEBOOK', N'Quản lý sổ tay từ vựng cá nhân')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (10, N'MANAGE_TOPICS', N'Quản lý bộ từ vựng / chủ đề')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (11, N'MANAGE_MEDIA', N'Quản lý tệp âm thanh và hình ảnh minh họa')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (12, N'SUBMIT_CONTENT_REVIEW', N'Gửi nội dung để duyệt')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (13, N'REVIEW_CONTENT', N'Duyệt / từ chối / lưu trữ nội dung')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (14, N'PUBLISH_OWN_CONTENT', N'Xuất bản nội dung do mình tạo')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (15, N'VIEW_CONTENT_ANALYTICS', N'Xem phân tích hiệu quả nội dung do mình tạo')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (16, N'VIEW_GLOBAL_ANALYTICS', N'Xem phân tích toàn cục')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (17, N'MANAGE_SYSTEM_SETTINGS', N'Quản lý cấu hình hệ thống')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (18, N'MANAGE_NOTIFICATIONS', N'Quản lý thông báo và thông báo đẩy')
INSERT [dbo].[Permissions] ([PermissionID], [PermissionCode], [Description]) VALUES (19, N'MANAGE_REPORTS', N'Quản lý báo cáo và phản hồi từ người học')
SET IDENTITY_INSERT [dbo].[Permissions] OFF
GO
SET IDENTITY_INSERT [dbo].[Questions] ON 

INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (21, 11, N'MCQ', N'Äá»‹nh nghÄ©a cá»§a tá»« ''Maintain'' lÃ  gÃ¬?', N'["Báº£o trÃ¬, duy trÃ¬", "Wrong Definition A", "Wrong Definition B", "Wrong Definition C"]', N'Báº£o trÃ¬, duy trÃ¬', NULL, 1, 8, CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset), N'Published', NULL, NULL, NULL)
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (22, 11, N'FillBlank', N'The roads are well ______ed.', N'[]', N'Maintain', NULL, 1, 8, CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset), N'Published', NULL, NULL, NULL)
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (23, 12, N'MCQ', N'Äá»‹nh nghÄ©a cá»§a tá»« ''Objective'' lÃ  gÃ¬?', N'["Má»¥c tiÃªu", "Wrong Definition A", "Wrong Definition B", "Wrong Definition C"]', N'Má»¥c tiÃªu', NULL, 1, 8, CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset), N'Published', NULL, NULL, NULL)
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (24, 12, N'FillBlank', N'Our main ______ is to win.', N'[]', N'Objective', NULL, 1, 8, CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset), N'Published', NULL, NULL, NULL)
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (31, 23, N'MCQ', N'What does "agenda" mean in Vietnamese?', N'["chuong trinh nghi su, noi dung cuoc hop","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'chuong trinh nghi su, noi dung cuoc hop', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (32, 23, N'FillBlank', N'The manager sent the meeting ______ yesterday.', N'[]', N'agenda', N'Complete the sentence with the correct TOEIC vocabulary word.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (33, 24, N'MCQ', N'What does "appointment" mean in Vietnamese?', N'["cuoc hen, lich hen","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'cuoc hen, lich hen', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (34, 24, N'FillBlank', N'I have an ______ with the client at 10 a.m.', N'[]', N'appointment', N'Complete the sentence with the correct TOEIC vocabulary word.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (35, 25, N'MCQ', N'What does "arrange" mean in Vietnamese?', N'["sap xep, bo tri","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'sap xep, bo tri', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (36, 25, N'FillBlank', N'Please ______ a conference room for the interview.', N'[]', N'arrange', N'Complete the sentence with the correct TOEIC vocabulary word.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (37, 26, N'MCQ', N'What does "attend" mean in Vietnamese?', N'["tham du, co mat","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'tham du, co mat', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (38, 26, N'FillBlank', N'All team members are expected to ______ the training.', N'[]', N'attend', N'Complete the sentence with the correct TOEIC vocabulary word.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (39, 27, N'MCQ', N'What does "brief" mean in Vietnamese?', N'["ngan gon; thong bao tom tat","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'ngan gon; thong bao tom tat', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (40, 27, N'FillBlank', N'The director gave a ______ update on sales.', N'[]', N'brief', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (41, 28, N'MCQ', N'What does "collaborate" mean in Vietnamese?', N'["cong tac, hop tac","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'cong tac, hop tac', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (42, 28, N'FillBlank', N'Two departments will ______ on the new campaign.', N'[]', N'collaborate', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (43, 29, N'MCQ', N'What does "confirm" mean in Vietnamese?', N'["xac nhan","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'xac nhan', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (44, 29, N'FillBlank', N'Please ______ your attendance by Friday.', N'[]', N'confirm', N'Complete the sentence with the correct TOEIC vocabulary word.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (45, 30, N'MCQ', N'What does "deadline" mean in Vietnamese?', N'["han chot","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'han chot', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (46, 30, N'FillBlank', N'The ______ for the report is next Monday.', N'[]', N'deadline', N'Complete the sentence with the correct TOEIC vocabulary word.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (47, 31, N'MCQ', N'What does "delegate" mean in Vietnamese?', N'["giao pho, uy quyen","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'giao pho, uy quyen', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (48, 31, N'FillBlank', N'The supervisor will ______ tasks to the assistants.', N'[]', N'delegate', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (49, 32, N'MCQ', N'What does "discuss" mean in Vietnamese?', N'["thao luan","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'thao luan', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (50, 32, N'FillBlank', N'We need to ______ the budget before approval.', N'[]', N'discuss', N'Complete the sentence with the correct TOEIC vocabulary word.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (51, 33, N'MCQ', N'What does "extension" mean in Vietnamese?', N'["su gia han, may nhanh noi bo","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'su gia han, may nhanh noi bo', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (52, 33, N'FillBlank', N'She requested an ______ for the project deadline.', N'[]', N'extension', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (53, 34, N'MCQ', N'What does "follow-up" mean in Vietnamese?', N'["viec tiep tuc xu ly, theo doi sau do","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'viec tiep tuc xu ly, theo doi sau do', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (54, 34, N'FillBlank', N'The ______ email included the final schedule.', N'[]', N'follow-up', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (55, 35, N'MCQ', N'What does "minutes" mean in Vietnamese?', N'["bien ban cuoc hop","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'bien ban cuoc hop', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (56, 35, N'FillBlank', N'The assistant prepared the ______ after the meeting.', N'[]', N'minutes', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (57, 36, N'MCQ', N'What does "postpone" mean in Vietnamese?', N'["tri hoan","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'tri hoan', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (58, 36, N'FillBlank', N'They decided to ______ the presentation until Thursday.', N'[]', N'postpone', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (59, 37, N'MCQ', N'What does "proposal" mean in Vietnamese?', N'["de xuat, ban de xuat","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'de xuat, ban de xuat', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (60, 37, N'FillBlank', N'The ______ was reviewed by senior management.', N'[]', N'proposal', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (61, 38, N'MCQ', N'What does "regarding" mean in Vietnamese?', N'["ve viec, lien quan den","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N've viec, lien quan den', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (62, 38, N'FillBlank', N'I am calling ______ your recent invoice.', N'[]', N'regarding', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (63, 39, N'MCQ', N'What does "reschedule" mean in Vietnamese?', N'["doi lich, sap xep lai lich","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'doi lich, sap xep lai lich', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (64, 39, N'FillBlank', N'We had to ______ the supplier meeting.', N'[]', N'reschedule', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (65, 40, N'MCQ', N'What does "summarize" mean in Vietnamese?', N'["tom tat","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'tom tat', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (66, 40, N'FillBlank', N'Could you ______ the main points of the report?', N'[]', N'summarize', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (67, 41, N'MCQ', N'What does "venue" mean in Vietnamese?', N'["dia diem to chuc","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'dia diem to chuc', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (68, 41, N'FillBlank', N'The ______ for the seminar is on the third floor.', N'[]', N'venue', N'Complete the sentence with the correct TOEIC vocabulary word.', 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (69, 42, N'MCQ', N'What does "workflow" mean in Vietnamese?', N'["quy trinh lam viec","khach hang tiem nang","hoa don da thanh toan","thiet bi van phong"]', N'quy trinh lam viec', N'Choose the Vietnamese meaning that matches the TOEIC workplace context.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Questions] ([QuestionID], [WordID], [QuestionType], [QuestionText], [OptionsJson], [CorrectAnswer], [Explanation], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (70, 42, N'FillBlank', N'The new software improved the team ______.', N'[]', N'workflow', N'Complete the sentence with the correct TOEIC vocabulary word.', 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
SET IDENTITY_INSERT [dbo].[Questions] OFF
GO
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 1)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 2)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 3)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 4)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 5)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 6)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 7)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 8)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 9)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 10)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 11)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 12)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 13)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 14)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 15)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 16)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 17)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 18)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (1, 19)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (2, 1)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (2, 6)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (2, 8)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (2, 9)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 1)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 2)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 3)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 4)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 6)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 10)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 11)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 12)
INSERT [dbo].[RolePermissions] ([RoleID], [PermissionID]) VALUES (3, 15)
GO
SET IDENTITY_INSERT [dbo].[Roles] ON 

INSERT [dbo].[Roles] ([RoleID], [RoleName], [Description]) VALUES (1, N'Admin', N'Quáº£n trá»‹ viÃªn toÃ n quyá»n')
INSERT [dbo].[Roles] ([RoleID], [RoleName], [Description]) VALUES (2, N'Learner', N'NgÆ°á»i há»c thÆ°á»ng')
INSERT [dbo].[Roles] ([RoleID], [RoleName], [Description]) VALUES (3, N'ContentCreator', N'Biên tập viên / Giáo viên quản lý nội dung học tập')
SET IDENTITY_INSERT [dbo].[Roles] OFF
GO
SET IDENTITY_INSERT [dbo].[TopicCategories] ON 

INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt]) VALUES (1, N'TOEIC Business', N'TOEIC_BUSINESS', N'T? v?ng TOEIC v? kinh doanh, thuong m?i, h?p d?ng', NULL, 1, 1, 1, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))
INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt]) VALUES (2, N'Daily Life', N'DAILY_LIFE', N'Từ vựng giao tiếp đời sống hằng ngày', NULL, 2, 1, NULL, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))
INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt]) VALUES (3, N'Travel English', N'TRAVEL_ENGLISH', N'Từ vựng du lịch, sân bay, khách sạn, chỉ đường', NULL, 3, 1, NULL, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))
INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt]) VALUES (4, N'TOEIC Skills', N'TOEIC_SKILLS', N'Từ vựng và bài học theo kỹ năng TOEIC', NULL, 4, 1, NULL, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))
INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt]) VALUES (5, N'Academic English', N'ACADEMIC_ENGLISH', N'Từ vựng học thuật, giáo dục, nghiên cứu', NULL, 5, 1, NULL, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))
INSERT [dbo].[TopicCategories] ([TopicCategoryID], [CategoryName], [CategoryCode], [Description], [IconUrl], [DisplayOrder], [IsActive], [CreatedByUserID], [CreatedAt], [UpdatedAt]) VALUES (6, N'Technology', N'TECHNOLOGY', N'Từ vựng công nghệ, phần mềm, internet, dữ liệu', NULL, 6, 1, NULL, CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset), CAST(N'2026-05-17T22:16:52.0972198+07:00' AS DateTimeOffset))
SET IDENTITY_INSERT [dbo].[TopicCategories] OFF
GO
SET IDENTITY_INSERT [dbo].[Topics] ON 

INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (1, N'TOEIC Starter Core', N'T50', N'15 tá»« vá»±ng ná»n táº£ng quan trá»ng nháº¥t cho ká»³ thi TOEIC', 8, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), 4, N'Published', NULL, NULL, NULL)
INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (2, N'TOEIC Office & Meetings', N'TOEIC-OFFICE-01', N'20 TOEIC words for office communication, meetings, schedules, and workplace reports.', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), NULL, N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (3, N'Daily Routines & Activities', N'DAILY-ROUTINES-01', N'10 t? v?ng v? sinh ho?t h?ng ngày, thói quen và các ho?t d?ng thu?ng nh?t.', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), 2, N'Published', 1, CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (4, N'Airport & Flight Travel', N'TRAVEL-AIRPORT-01', N'10 t? v?ng c?n thi?t v? sân bay, bay, hành lý và th? t?c du l?ch.', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), 3, N'Published', 1, CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T08:30:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (5, N'Software & Office Tech', N'TECH-SOFTWARE-01', N'10 t? v?ng công ngh? v? ph?n m?m, thi?t b? v?n phòng và công c? k? thu?t s?.', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), 6, N'Published', 1, CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:00:00.0000000+07:00' AS DateTimeOffset))
INSERT [dbo].[Topics] ([TopicID], [TopicName], [TopicCode], [Description], [CreatedByUserID], [CreatedAt], [UpdatedAt], [TopicCategoryID], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (6, N'Academic Study & Research', N'ACADEMIC-STUDY-01', N'10 t? v?ng h?c thu?t v? nghiên c?u, bài gi?ng, lu?n v?n và th? vi?n.', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), 5, N'Published', 1, CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset), CAST(N'2026-05-20T09:30:00.0000000+07:00' AS DateTimeOffset))
SET IDENTITY_INSERT [dbo].[Topics] OFF
GO
SET IDENTITY_INSERT [dbo].[Users] ON 

INSERT [dbo].[Users] ([UserID], [FullName], [Email], [PasswordHash], [UserRole], [IsActive], [CreatedAt], [UpdatedAt], [RoleID], [DailyGoal], [SRSReviewLimit], [TotalXP], [CurrentLevel]) VALUES (1, N'Admin Test', N'admin@gmail.com', N'123', N'Admin', 1, CAST(N'2026-05-04T14:21:05.4591454+07:00' AS DateTimeOffset), CAST(N'2026-05-04T14:21:05.4591454+07:00' AS DateTimeOffset), 1, 20, 15, 0, 1)
INSERT [dbo].[Users] ([UserID], [FullName], [Email], [PasswordHash], [UserRole], [IsActive], [CreatedAt], [UpdatedAt], [RoleID], [DailyGoal], [SRSReviewLimit], [TotalXP], [CurrentLevel]) VALUES (2, N'User Test 1', N'user1@gmail.com', N'123', N'Learner', 1, CAST(N'2026-05-04T14:21:05.4591454+07:00' AS DateTimeOffset), CAST(N'2026-05-04T14:21:05.4591454+07:00' AS DateTimeOffset), 2, 20, 15, 0, 1)
INSERT [dbo].[Users] ([UserID], [FullName], [Email], [PasswordHash], [UserRole], [IsActive], [CreatedAt], [UpdatedAt], [RoleID], [DailyGoal], [SRSReviewLimit], [TotalXP], [CurrentLevel]) VALUES (3, N'User Test 2', N'user2@gmail.com', N'123', N'Learner', 1, CAST(N'2026-05-04T14:21:05.4591454+07:00' AS DateTimeOffset), CAST(N'2026-05-04T14:21:05.4591454+07:00' AS DateTimeOffset), 2, 20, 15, 0, 1)
INSERT [dbo].[Users] ([UserID], [FullName], [Email], [PasswordHash], [UserRole], [IsActive], [CreatedAt], [UpdatedAt], [RoleID], [DailyGoal], [SRSReviewLimit], [TotalXP], [CurrentLevel]) VALUES (4, N'Test User', N'test_1777884304484@example.com', N'$2b$10$TXCP2yMR0ahEnCkLqr4N7OYu0lYk9tD5iBLUpHphXsC9smRzsFlHu', N'Learner', 1, CAST(N'2026-05-04T15:45:04.5975996+07:00' AS DateTimeOffset), CAST(N'2026-05-04T15:45:04.5975996+07:00' AS DateTimeOffset), 2, 20, 15, 0, 1)
INSERT [dbo].[Users] ([UserID], [FullName], [Email], [PasswordHash], [UserRole], [IsActive], [CreatedAt], [UpdatedAt], [RoleID], [DailyGoal], [SRSReviewLimit], [TotalXP], [CurrentLevel]) VALUES (5, N'LAITUNG', N'tung@gmail.com', N'$2b$10$isQCzJzRMz0WDr3z/0cAq.obuGFaO8eqnhYL/sf5SKyoGKxXvmdcS', N'Admin', 1, CAST(N'2026-05-04T15:58:33.8227924+07:00' AS DateTimeOffset), CAST(N'2026-05-04T15:58:33.8227924+07:00' AS DateTimeOffset), 1, 20, 15, 0, 1)
INSERT [dbo].[Users] ([UserID], [FullName], [Email], [PasswordHash], [UserRole], [IsActive], [CreatedAt], [UpdatedAt], [RoleID], [DailyGoal], [SRSReviewLimit], [TotalXP], [CurrentLevel]) VALUES (8, N'System Admin', N'system@vocaboost.com', N'N/A', N'Admin', 1, CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:03:43.5110176+07:00' AS DateTimeOffset), 1, 20, 15, 0, 1)
INSERT [dbo].[Users] ([UserID], [FullName], [Email], [PasswordHash], [UserRole], [IsActive], [CreatedAt], [UpdatedAt], [RoleID], [DailyGoal], [SRSReviewLimit], [TotalXP], [CurrentLevel]) VALUES (9, N'Biên tập viên / Giáo viên', N'teacher@vocaboost.com', N'$2b$10$tNoClV7O7zNIX.oRHst5K.vYVKWxr0cGmaBe8nN5yi7J0YDd.l/l2', N'ContentCreator', 1, CAST(N'2026-05-17T22:18:18.1662343+07:00' AS DateTimeOffset), CAST(N'2026-05-18T13:50:57.6934183+07:00' AS DateTimeOffset), 3, 20, 15, 0, 1)
INSERT [dbo].[Users] ([UserID], [FullName], [Email], [PasswordHash], [UserRole], [IsActive], [CreatedAt], [UpdatedAt], [RoleID], [DailyGoal], [SRSReviewLimit], [TotalXP], [CurrentLevel]) VALUES (10, N'Nguyễn Hoàng Phúc', N'phuc2011@gmail.com', N'$2b$10$Hv/ILBgFJkQyhoSJ7QKiD.KmwoL5JfFBp1G9hrc7EB7/6MlxrFeY6', N'Learner', 1, CAST(N'2026-05-25T09:14:14.4312623+00:00' AS DateTimeOffset), CAST(N'2026-05-25T09:14:14.4312623+00:00' AS DateTimeOffset), 2, 20, 15, 0, 1)
SET IDENTITY_INSERT [dbo].[Users] OFF
GO
SET IDENTITY_INSERT [dbo].[UserWordProgress] ON 

INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (6, 5, 12, 1, CAST(2.60 AS Decimal(4, 2)), 1, 1, 0, CAST(N'2026-05-04T16:05:15.6214639+07:00' AS DateTimeOffset), CAST(N'2026-05-05T16:05:15.6214639+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Learning', CAST(N'2026-05-04T16:05:15.6214639+07:00' AS DateTimeOffset), CAST(N'2026-05-04T16:05:15.6214639+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (13, 4, 11, 5, CAST(3.00 AS Decimal(4, 2)), 5, 5, 0, CAST(N'2026-05-18T08:29:21.9279906+07:00' AS DateTimeOffset), CAST(N'2026-06-17T08:29:21.9279906+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Reviewing', CAST(N'2026-05-05T21:30:54.9963636+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:29:21.9279906+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (14, 4, 12, 5, CAST(3.00 AS Decimal(4, 2)), 5, 5, 0, CAST(N'2026-05-18T08:29:18.8084627+07:00' AS DateTimeOffset), CAST(N'2026-06-17T08:29:18.8084627+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Reviewing', CAST(N'2026-05-05T21:30:55.1830031+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:29:18.8084627+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (22, 4, 22, 5, CAST(2.50 AS Decimal(4, 2)), 5, 5, 0, CAST(N'2026-05-18T08:29:08.2828901+07:00' AS DateTimeOffset), CAST(N'2026-05-21T08:29:08.2828901+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Reviewing', CAST(N'2026-05-08T15:39:43.0533336+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:29:08.2828901+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (23, 4, 40, 2, CAST(2.70 AS Decimal(4, 2)), 2, 2, 0, CAST(N'2026-05-19T14:28:37.9978739+07:00' AS DateTimeOffset), CAST(N'2026-05-22T14:28:37.9978739+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Learning', CAST(N'2026-05-18T08:43:48.4736927+07:00' AS DateTimeOffset), CAST(N'2026-05-19T14:28:37.9978739+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (24, 4, 30, 0, CAST(2.40 AS Decimal(4, 2)), 0, 0, 1, CAST(N'2026-05-25T15:25:46.2597068+07:00' AS DateTimeOffset), CAST(N'2026-05-25T15:55:46.2597068+07:00' AS DateTimeOffset), CAST(0.00 AS Decimal(5, 2)), N'Lapsed', CAST(N'2026-05-18T08:43:51.8503982+07:00' AS DateTimeOffset), CAST(N'2026-05-25T15:25:46.2597068+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (25, 4, 29, 1, CAST(2.60 AS Decimal(4, 2)), 1, 1, 0, CAST(N'2026-05-18T08:43:53.7329531+07:00' AS DateTimeOffset), CAST(N'2026-05-19T08:43:53.7329531+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Learning', CAST(N'2026-05-18T08:43:53.7329531+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:43:53.7329531+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (26, 4, 25, 2, CAST(2.70 AS Decimal(4, 2)), 2, 2, 0, CAST(N'2026-05-20T13:56:46.7688236+07:00' AS DateTimeOffset), CAST(N'2026-05-23T13:56:46.7688236+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Learning', CAST(N'2026-05-18T08:43:55.0747084+07:00' AS DateTimeOffset), CAST(N'2026-05-20T13:56:46.7688236+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (27, 4, 34, 0, CAST(2.30 AS Decimal(4, 2)), 0, 0, 1, CAST(N'2026-05-18T13:38:15.3265611+07:00' AS DateTimeOffset), CAST(N'2026-05-18T14:08:15.3265611+07:00' AS DateTimeOffset), CAST(0.00 AS Decimal(5, 2)), N'Lapsed', CAST(N'2026-05-18T13:38:15.3265611+07:00' AS DateTimeOffset), CAST(N'2026-05-18T13:38:15.3265611+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (28, 4, 24, 2, CAST(2.70 AS Decimal(4, 2)), 2, 2, 0, CAST(N'2026-05-20T13:56:55.4674720+07:00' AS DateTimeOffset), CAST(N'2026-05-23T13:56:55.4674720+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Learning', CAST(N'2026-05-18T13:39:00.7890166+07:00' AS DateTimeOffset), CAST(N'2026-05-20T13:56:55.4674720+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (29, 4, 39, 0, CAST(2.30 AS Decimal(4, 2)), 0, 0, 1, CAST(N'2026-05-18T13:39:31.3045035+07:00' AS DateTimeOffset), CAST(N'2026-05-18T14:09:31.3045035+07:00' AS DateTimeOffset), CAST(0.00 AS Decimal(5, 2)), N'Lapsed', CAST(N'2026-05-18T13:39:31.3045035+07:00' AS DateTimeOffset), CAST(N'2026-05-18T13:39:31.3045035+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (30, 4, 36, 2, CAST(2.70 AS Decimal(4, 2)), 2, 2, 0, CAST(N'2026-05-19T14:28:41.5794589+07:00' AS DateTimeOffset), CAST(N'2026-05-22T14:28:41.5794589+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Learning', CAST(N'2026-05-18T13:42:04.0975482+07:00' AS DateTimeOffset), CAST(N'2026-05-19T14:28:41.5794589+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (31, 4, 38, 0, CAST(2.40 AS Decimal(4, 2)), 0, 0, 1, CAST(N'2026-05-20T13:57:19.8183896+07:00' AS DateTimeOffset), CAST(N'2026-05-20T14:27:19.8183896+07:00' AS DateTimeOffset), CAST(0.00 AS Decimal(5, 2)), N'Lapsed', CAST(N'2026-05-18T13:42:11.2197860+07:00' AS DateTimeOffset), CAST(N'2026-05-20T13:57:19.8183896+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (32, 4, 35, 2, CAST(2.70 AS Decimal(4, 2)), 2, 2, 0, CAST(N'2026-05-19T14:28:49.5286400+07:00' AS DateTimeOffset), CAST(N'2026-05-22T14:28:49.5286400+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Learning', CAST(N'2026-05-18T14:11:30.2554741+07:00' AS DateTimeOffset), CAST(N'2026-05-19T14:28:49.5286400+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (33, 4, 27, 1, CAST(2.60 AS Decimal(4, 2)), 1, 1, 0, CAST(N'2026-05-18T14:11:32.3035525+07:00' AS DateTimeOffset), CAST(N'2026-05-19T14:11:32.3035525+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Learning', CAST(N'2026-05-18T14:11:32.3035525+07:00' AS DateTimeOffset), CAST(N'2026-05-18T14:11:32.3035525+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (34, 4, 28, 0, CAST(2.30 AS Decimal(4, 2)), 0, 0, 1, CAST(N'2026-05-19T14:28:56.0377925+07:00' AS DateTimeOffset), CAST(N'2026-05-19T14:58:56.0377925+07:00' AS DateTimeOffset), CAST(0.00 AS Decimal(5, 2)), N'Lapsed', CAST(N'2026-05-19T14:28:56.0377925+07:00' AS DateTimeOffset), CAST(N'2026-05-19T14:28:56.0377925+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (35, 4, 41, 0, CAST(2.30 AS Decimal(4, 2)), 0, 0, 1, CAST(N'2026-05-19T14:29:03.1298017+07:00' AS DateTimeOffset), CAST(N'2026-05-19T14:59:03.1298017+07:00' AS DateTimeOffset), CAST(0.00 AS Decimal(5, 2)), N'Lapsed', CAST(N'2026-05-19T14:29:03.1298017+07:00' AS DateTimeOffset), CAST(N'2026-05-19T14:29:03.1298017+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (36, 4, 26, 0, CAST(2.30 AS Decimal(4, 2)), 0, 0, 1, CAST(N'2026-05-20T13:54:31.2708462+07:00' AS DateTimeOffset), CAST(N'2026-05-20T14:24:31.2708462+07:00' AS DateTimeOffset), CAST(0.00 AS Decimal(5, 2)), N'Lapsed', CAST(N'2026-05-20T13:54:31.2708462+07:00' AS DateTimeOffset), CAST(N'2026-05-20T13:54:31.2708462+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (37, 4, 42, 1, CAST(2.60 AS Decimal(4, 2)), 1, 1, 0, CAST(N'2026-05-20T14:05:30.4511169+07:00' AS DateTimeOffset), CAST(N'2026-05-21T14:05:30.4511169+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Learning', CAST(N'2026-05-20T14:05:30.4511169+07:00' AS DateTimeOffset), CAST(N'2026-05-20T14:05:30.4511169+07:00' AS DateTimeOffset))
INSERT [dbo].[UserWordProgress] ([UserWordProgressID], [UserID], [WordID], [MasteryLevel], [EaseFactor], [RepetitionCount], [ConsecutiveCorrect], [ConsecutiveWrong], [LastReviewedAt], [NextReviewDate], [LastScore], [MemoryStatus], [CreatedAt], [UpdatedAt]) VALUES (38, 4, 43, 1, CAST(2.50 AS Decimal(4, 2)), 1, 1, 0, CAST(N'2026-05-25T15:36:26.7683540+07:00' AS DateTimeOffset), CAST(N'2026-05-26T15:36:26.7683540+07:00' AS DateTimeOffset), CAST(100.00 AS Decimal(5, 2)), N'Learning', CAST(N'2026-05-25T15:36:26.7683540+07:00' AS DateTimeOffset), CAST(N'2026-05-25T15:36:26.7683540+07:00' AS DateTimeOffset))
SET IDENTITY_INSERT [dbo].[UserWordProgress] OFF
GO
SET IDENTITY_INSERT [dbo].[Words] ON 

INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (11, N'Maintain', 1, N'Bảo trì, Duy ', N'/mānˈtān/', NULL, NULL, NULL, 1, 8, CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset), CAST(N'2026-05-06T15:29:04.7962069+07:00' AS DateTimeOffset), N'Published', NULL, NULL, NULL)
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (12, N'Objective', 1, N'Khách quan', N'/əbˈjektiv/', NULL, NULL, NULL, 1, 8, CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset), CAST(N'2026-05-06T15:28:22.1273081+07:00' AS DateTimeOffset), N'Published', NULL, NULL, NULL)
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (22, N'eat', 2, N'ăn', N'/eat/', NULL, NULL, NULL, 1, 5, CAST(N'2026-05-08T15:30:12.6530758+07:00' AS DateTimeOffset), CAST(N'2026-05-08T15:30:12.6530758+07:00' AS DateTimeOffset), N'Published', NULL, NULL, NULL)
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (23, N'agenda', 1, N'chuong trinh nghi su, noi dung cuoc hop', N'/eˈdʒendə/', NULL, NULL, NULL, 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (24, N'appointment', 1, N'cuoc hen, lich hen', N'/əˈpɔɪntmənt/', NULL, NULL, NULL, 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (25, N'arrange', 2, N'sap xep, bo tri', N'/əˈreɪndʒ/', NULL, NULL, NULL, 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (26, N'attend', 2, N'tham du, co mat', N'/əˈtend/', NULL, NULL, NULL, 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (27, N'brief', 3, N'ngan gon; thong bao tom tat', N'/briːf/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (28, N'collaborate', 2, N'cong tac, hop tac', N'/kəˈlæbəreɪt/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (29, N'confirm', 2, N'xac nhan', N'/kənˈfɜːrm/', NULL, NULL, NULL, 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (30, N'deadline', 1, N'han chot', N'/ˈdedlaɪn/', NULL, NULL, NULL, 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (31, N'delegate', 2, N'giao pho, uy quyen', N'/ˈdelɪɡeɪt/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (32, N'discuss', 2, N'thao luan', N'/dɪˈskʌs/', NULL, NULL, NULL, 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (33, N'extension', 1, N'su gia han, may nhanh noi bo', N'/ɪkˈstenʃn/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (34, N'follow-up', 1, N'viec tiep tuc xu ly, theo doi sau do', N'/ˈfɑːloʊ ʌp/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (35, N'minutes', 1, N'bien ban cuoc hop', N'/ˈmɪnɪts/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (36, N'postpone', 2, N'tri hoan', N'/poʊˈspoʊn/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (37, N'proposal', 1, N'de xuat, ban de xuat', N'/prəˈpoʊzl/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (38, N'regarding', 5, N've viec, lien quan den', N'/rɪˈɡɑːrdɪŋ/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (39, N'reschedule', 2, N'doi lich, sap xep lai lich', N'/ˌriːˈskedʒuːl/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (40, N'summarize', 2, N'tom tat', N'/ˈsʌməraɪz/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (41, N'venue', 1, N'dia diem to chuc', N'/ˈvenjuː/', NULL, NULL, NULL, 1, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (42, N'workflow', 1, N'quy trinh lam viec', N'/ˈwɜːrkfloʊ/', NULL, NULL, NULL, 2, 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), N'Published', 8, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset), CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[Words] ([WordID], [Term], [PartOfSpeechID], [Meaning], [Phonetic], [AudioUrlUK], [AudioUrlUS], [ImageUrl], [DifficultyLevel], [CreatedByUserID], [CreatedAt], [UpdatedAt], [ContentStatus], [ReviewedByUserID], [ReviewedAt], [PublishedAt]) VALUES (43, N'example', 1, N'ví dụ', N'/gttgt/', NULL, NULL, NULL, 1, 9, CAST(N'2026-05-20T14:22:53.3363483+07:00' AS DateTimeOffset), CAST(N'2026-05-20T14:45:53.6831416+07:00' AS DateTimeOffset), N'Published', 5, CAST(N'2026-05-20T14:45:53.6831416+07:00' AS DateTimeOffset), CAST(N'2026-05-20T14:45:53.6831416+07:00' AS DateTimeOffset))
SET IDENTITY_INSERT [dbo].[Words] OFF
GO
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (11, 1, CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (12, 1, CAST(N'2026-05-04T16:03:43.5323680+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (22, 1, CAST(N'2026-05-08T15:30:12.6618424+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (23, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (24, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (25, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (26, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (27, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (28, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (29, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (30, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (31, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (32, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (33, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (34, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (35, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (36, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (37, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (38, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (39, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (40, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (41, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
INSERT [dbo].[WordTopics] ([WordID], [TopicID], [AssignedAt]) VALUES (42, 2, CAST(N'2026-05-18T08:37:06.2275282+07:00' AS DateTimeOffset))
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ContentMediaLinks_Entity]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_ContentMediaLinks_Entity] ON [dbo].[ContentMediaLinks]
(
	[EntityType] ASC,
	[EntityID] ASC,
	[DisplayOrder] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ContentMediaLinks_MediaAssetID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_ContentMediaLinks_MediaAssetID] ON [dbo].[ContentMediaLinks]
(
	[MediaAssetID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ContentReports_ReporterUserID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_ContentReports_ReporterUserID] ON [dbo].[ContentReports]
(
	[ReporterUserID] ASC,
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ContentReports_ReportType]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_ContentReports_ReportType] ON [dbo].[ContentReports]
(
	[ReportType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ContentReports_Status_CreatedAt]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_ContentReports_Status_CreatedAt] ON [dbo].[ContentReports]
(
	[Status] ASC,
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ContentReviewLogs_ActionByUserID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_ContentReviewLogs_ActionByUserID] ON [dbo].[ContentReviewLogs]
(
	[ActionByUserID] ASC,
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ContentReviewLogs_Entity]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_ContentReviewLogs_Entity] ON [dbo].[ContentReviewLogs]
(
	[EntityType] ASC,
	[EntityID] ASC,
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ExampleSentences_WordID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_ExampleSentences_WordID] ON [dbo].[ExampleSentences]
(
	[WordID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ExerciseAttempts_QuestionID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_ExerciseAttempts_QuestionID] ON [dbo].[ExerciseAttempts]
(
	[QuestionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ExerciseAttempts_UserID_AttemptedAt]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_ExerciseAttempts_UserID_AttemptedAt] ON [dbo].[ExerciseAttempts]
(
	[UserID] ASC,
	[AttemptedAt] DESC
)
INCLUDE([QuestionID],[WordID],[IsCorrect],[ScoreAwarded]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ExerciseAttempts_WordID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_ExerciseAttempts_WordID] ON [dbo].[ExerciseAttempts]
(
	[WordID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_MediaAssets_UploadedByUserID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_MediaAssets_UploadedByUserID] ON [dbo].[MediaAssets]
(
	[UploadedByUserID] ASC,
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_MiniTestAttempts_MiniTestID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_MiniTestAttempts_MiniTestID] ON [dbo].[MiniTestAttempts]
(
	[MiniTestID] ASC,
	[StartedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_MiniTestAttempts_UserID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_MiniTestAttempts_UserID] ON [dbo].[MiniTestAttempts]
(
	[UserID] ASC,
	[StartedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_MiniTestItems_MiniTestID_DisplayOrder]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[MiniTestItems] ADD  CONSTRAINT [UQ_MiniTestItems_MiniTestID_DisplayOrder] UNIQUE NONCLUSTERED 
(
	[MiniTestID] ASC,
	[DisplayOrder] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_MiniTestItems_QuestionID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_MiniTestItems_QuestionID] ON [dbo].[MiniTestItems]
(
	[QuestionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_MiniTests_TopicID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_MiniTests_TopicID] ON [dbo].[MiniTests]
(
	[TopicID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Notifications_CreatedAt]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_Notifications_CreatedAt] ON [dbo].[Notifications]
(
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Notifications_UserID_IsRead]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_Notifications_UserID_IsRead] ON [dbo].[Notifications]
(
	[UserID] ASC,
	[IsRead] ASC
)
INCLUDE([Title],[Message],[Type],[CreatedAt],[ActionUrl]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_PartOfSpeeches_Code]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[PartOfSpeeches] ADD  CONSTRAINT [UQ_PartOfSpeeches_Code] UNIQUE NONCLUSTERED 
(
	[PartOfSpeechCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_PartOfSpeeches_Name]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[PartOfSpeeches] ADD  CONSTRAINT [UQ_PartOfSpeeches_Name] UNIQUE NONCLUSTERED 
(
	[PartOfSpeechName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Permissi__91FE5750DC9EAC6F]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[Permissions] ADD UNIQUE NONCLUSTERED 
(
	[PermissionCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Questions_CreatedByUserID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_Questions_CreatedByUserID] ON [dbo].[Questions]
(
	[CreatedByUserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Questions_WordID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_Questions_WordID] ON [dbo].[Questions]
(
	[WordID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Roles__8A2B61609663FC30]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[Roles] ADD UNIQUE NONCLUSTERED 
(
	[RoleName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_TopicCategories_CategoryCode]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[TopicCategories] ADD  CONSTRAINT [UQ_TopicCategories_CategoryCode] UNIQUE NONCLUSTERED 
(
	[CategoryCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_TopicCategories_IsActive_DisplayOrder]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_TopicCategories_IsActive_DisplayOrder] ON [dbo].[TopicCategories]
(
	[IsActive] ASC,
	[DisplayOrder] ASC,
	[CategoryName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Topics_TopicCode]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[Topics] ADD  CONSTRAINT [UQ_Topics_TopicCode] UNIQUE NONCLUSTERED 
(
	[TopicCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Topics_TopicName]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[Topics] ADD  CONSTRAINT [UQ_Topics_TopicName] UNIQUE NONCLUSTERED 
(
	[TopicName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Topics_TopicCategoryID_ContentStatus]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_Topics_TopicCategoryID_ContentStatus] ON [dbo].[Topics]
(
	[TopicCategoryID] ASC,
	[ContentStatus] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Users_Email]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [UQ_Users_Email] UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_UserTopicEnrollments_UserID_TopicID]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[UserTopicEnrollments] ADD  CONSTRAINT [UQ_UserTopicEnrollments_UserID_TopicID] UNIQUE NONCLUSTERED 
(
	[UserID] ASC,
	[TopicID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserTopicEnrollments_TopicID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_UserTopicEnrollments_TopicID] ON [dbo].[UserTopicEnrollments]
(
	[TopicID] ASC,
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserTopicEnrollments_UserID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_UserTopicEnrollments_UserID] ON [dbo].[UserTopicEnrollments]
(
	[UserID] ASC,
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_UserVocabularyNotebook_UserID_WordID]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[UserVocabularyNotebook] ADD  CONSTRAINT [UQ_UserVocabularyNotebook_UserID_WordID] UNIQUE NONCLUSTERED 
(
	[UserID] ASC,
	[WordID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserVocabularyNotebook_UserID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_UserVocabularyNotebook_UserID] ON [dbo].[UserVocabularyNotebook]
(
	[UserID] ASC,
	[IsFavorite] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserVocabularyNotebook_WordID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_UserVocabularyNotebook_WordID] ON [dbo].[UserVocabularyNotebook]
(
	[WordID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_UserWordProgress_UserID_WordID]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[UserWordProgress] ADD  CONSTRAINT [UQ_UserWordProgress_UserID_WordID] UNIQUE NONCLUSTERED 
(
	[UserID] ASC,
	[WordID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserWordProgress_NextReviewDate]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_UserWordProgress_NextReviewDate] ON [dbo].[UserWordProgress]
(
	[NextReviewDate] ASC
)
INCLUDE([UserID],[WordID],[MemoryStatus]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserWordProgress_UserID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_UserWordProgress_UserID] ON [dbo].[UserWordProgress]
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserWordProgress_UserID_NextReviewDate]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_UserWordProgress_UserID_NextReviewDate] ON [dbo].[UserWordProgress]
(
	[UserID] ASC,
	[NextReviewDate] ASC
)
INCLUDE([WordID],[MasteryLevel],[MemoryStatus],[RepetitionCount],[EaseFactor]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserWordProgress_WordID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_UserWordProgress_WordID] ON [dbo].[UserWordProgress]
(
	[WordID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Words_Term_PartOfSpeech]    Script Date: 28-May-26 8:31:14 PM ******/
ALTER TABLE [dbo].[Words] ADD  CONSTRAINT [UQ_Words_Term_PartOfSpeech] UNIQUE NONCLUSTERED 
(
	[Term] ASC,
	[PartOfSpeechID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Words_CreatedByUserID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_Words_CreatedByUserID] ON [dbo].[Words]
(
	[CreatedByUserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Words_PartOfSpeechID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_Words_PartOfSpeechID] ON [dbo].[Words]
(
	[PartOfSpeechID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_WordTopics_TopicID]    Script Date: 28-May-26 8:31:14 PM ******/
CREATE NONCLUSTERED INDEX [IX_WordTopics_TopicID] ON [dbo].[WordTopics]
(
	[TopicID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[AdminAuditLogs] ADD  CONSTRAINT [DF_AdminAuditLogs_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ContentMediaLinks] ADD  CONSTRAINT [DF_ContentMediaLinks_DisplayOrder]  DEFAULT ((1)) FOR [DisplayOrder]
GO
ALTER TABLE [dbo].[ContentReports] ADD  CONSTRAINT [DF_ContentReports_Status]  DEFAULT (N'Open') FOR [Status]
GO
ALTER TABLE [dbo].[ContentReports] ADD  CONSTRAINT [DF_ContentReports_Priority]  DEFAULT (N'Normal') FOR [Priority]
GO
ALTER TABLE [dbo].[ContentReports] ADD  CONSTRAINT [DF_ContentReports_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ContentReports] ADD  CONSTRAINT [DF_ContentReports_UpdatedAt]  DEFAULT (sysdatetimeoffset()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[ContentReviewLogs] ADD  CONSTRAINT [DF_ContentReviewLogs_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ExampleSentences] ADD  CONSTRAINT [DF_ExampleSentences_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ExampleSentences] ADD  CONSTRAINT [DF_ExampleSentences_UpdatedAt]  DEFAULT (sysdatetimeoffset()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[ExerciseAttempts] ADD  CONSTRAINT [DF_ExerciseAttempts_AttemptedAt]  DEFAULT (sysdatetimeoffset()) FOR [AttemptedAt]
GO
ALTER TABLE [dbo].[MediaAssets] ADD  CONSTRAINT [DF_MediaAssets_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[MiniTestAttempts] ADD  CONSTRAINT [DF_MiniTestAttempts_StartedAt]  DEFAULT (sysdatetimeoffset()) FOR [StartedAt]
GO
ALTER TABLE [dbo].[MiniTestAttempts] ADD  CONSTRAINT [DF_MiniTestAttempts_TotalQuestions]  DEFAULT ((0)) FOR [TotalQuestions]
GO
ALTER TABLE [dbo].[MiniTestAttempts] ADD  CONSTRAINT [DF_MiniTestAttempts_CorrectCount]  DEFAULT ((0)) FOR [CorrectCount]
GO
ALTER TABLE [dbo].[MiniTests] ADD  CONSTRAINT [DF_MiniTests_TotalQuestions]  DEFAULT ((0)) FOR [TotalQuestions]
GO
ALTER TABLE [dbo].[MiniTests] ADD  CONSTRAINT [DF_MiniTests_IsPublished]  DEFAULT ((0)) FOR [IsPublished]
GO
ALTER TABLE [dbo].[MiniTests] ADD  CONSTRAINT [DF_MiniTests_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[MiniTests] ADD  CONSTRAINT [DF_MiniTests_UpdatedAt]  DEFAULT (sysdatetimeoffset()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[MiniTests] ADD  CONSTRAINT [DF_MiniTests_ContentStatus]  DEFAULT (N'Draft') FOR [ContentStatus]
GO
ALTER TABLE [dbo].[Notifications] ADD  CONSTRAINT [DF_Notifications_IsRead]  DEFAULT ((0)) FOR [IsRead]
GO
ALTER TABLE [dbo].[Notifications] ADD  CONSTRAINT [DF_Notifications_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Questions] ADD  CONSTRAINT [DF_Questions_DifficultyLevel]  DEFAULT ((1)) FOR [DifficultyLevel]
GO
ALTER TABLE [dbo].[Questions] ADD  CONSTRAINT [DF_Questions_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Questions] ADD  CONSTRAINT [DF_Questions_UpdatedAt]  DEFAULT (sysdatetimeoffset()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Questions] ADD  CONSTRAINT [DF_Questions_ContentStatus]  DEFAULT (N'Published') FOR [ContentStatus]
GO
ALTER TABLE [dbo].[TopicCategories] ADD  CONSTRAINT [DF_TopicCategories_DisplayOrder]  DEFAULT ((1)) FOR [DisplayOrder]
GO
ALTER TABLE [dbo].[TopicCategories] ADD  CONSTRAINT [DF_TopicCategories_IsActive]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[TopicCategories] ADD  CONSTRAINT [DF_TopicCategories_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[TopicCategories] ADD  CONSTRAINT [DF_TopicCategories_UpdatedAt]  DEFAULT (sysdatetimeoffset()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Topics] ADD  CONSTRAINT [DF_Topics_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Topics] ADD  CONSTRAINT [DF_Topics_UpdatedAt]  DEFAULT (sysdatetimeoffset()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Topics] ADD  CONSTRAINT [DF_Topics_ContentStatus]  DEFAULT (N'Published') FOR [ContentStatus]
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF_Users_IsActive]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF_Users_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF_Users_UpdatedAt]  DEFAULT (sysdatetimeoffset()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF_Users_DailyGoal]  DEFAULT ((20)) FOR [DailyGoal]
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF_Users_SRSReviewLimit]  DEFAULT ((15)) FOR [SRSReviewLimit]
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF_Users_TotalXP]  DEFAULT ((0)) FOR [TotalXP]
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF_Users_CurrentLevel]  DEFAULT ((1)) FOR [CurrentLevel]
GO
ALTER TABLE [dbo].[UserTopicEnrollments] ADD  CONSTRAINT [DF_UserTopicEnrollments_EnrolledAt]  DEFAULT (sysdatetimeoffset()) FOR [EnrolledAt]
GO
ALTER TABLE [dbo].[UserTopicEnrollments] ADD  CONSTRAINT [DF_UserTopicEnrollments_IsActive]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[UserVocabularyNotebook] ADD  CONSTRAINT [DF_UserVocabularyNotebook_IsFavorite]  DEFAULT ((0)) FOR [IsFavorite]
GO
ALTER TABLE [dbo].[UserVocabularyNotebook] ADD  CONSTRAINT [DF_UserVocabularyNotebook_AddedAt]  DEFAULT (sysdatetimeoffset()) FOR [AddedAt]
GO
ALTER TABLE [dbo].[UserVocabularyNotebook] ADD  CONSTRAINT [DF_UserVocabularyNotebook_UpdatedAt]  DEFAULT (sysdatetimeoffset()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[UserWordProgress] ADD  CONSTRAINT [DF_UserWordProgress_MasteryLevel]  DEFAULT ((0)) FOR [MasteryLevel]
GO
ALTER TABLE [dbo].[UserWordProgress] ADD  CONSTRAINT [DF_UserWordProgress_EaseFactor]  DEFAULT ((2.50)) FOR [EaseFactor]
GO
ALTER TABLE [dbo].[UserWordProgress] ADD  CONSTRAINT [DF_UserWordProgress_RepetitionCount]  DEFAULT ((0)) FOR [RepetitionCount]
GO
ALTER TABLE [dbo].[UserWordProgress] ADD  CONSTRAINT [DF_UserWordProgress_ConsecutiveCorrect]  DEFAULT ((0)) FOR [ConsecutiveCorrect]
GO
ALTER TABLE [dbo].[UserWordProgress] ADD  CONSTRAINT [DF_UserWordProgress_ConsecutiveWrong]  DEFAULT ((0)) FOR [ConsecutiveWrong]
GO
ALTER TABLE [dbo].[UserWordProgress] ADD  CONSTRAINT [DF_UserWordProgress_MemoryStatus]  DEFAULT (N'New') FOR [MemoryStatus]
GO
ALTER TABLE [dbo].[UserWordProgress] ADD  CONSTRAINT [DF_UserWordProgress_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[UserWordProgress] ADD  CONSTRAINT [DF_UserWordProgress_UpdatedAt]  DEFAULT (sysdatetimeoffset()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Words] ADD  CONSTRAINT [DF_Words_DifficultyLevel]  DEFAULT ((1)) FOR [DifficultyLevel]
GO
ALTER TABLE [dbo].[Words] ADD  CONSTRAINT [DF_Words_CreatedAt]  DEFAULT (sysdatetimeoffset()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Words] ADD  CONSTRAINT [DF_Words_UpdatedAt]  DEFAULT (sysdatetimeoffset()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Words] ADD  CONSTRAINT [DF_Words_ContentStatus]  DEFAULT (N'Published') FOR [ContentStatus]
GO
ALTER TABLE [dbo].[WordTopics] ADD  CONSTRAINT [DF_WordTopics_AssignedAt]  DEFAULT (sysdatetimeoffset()) FOR [AssignedAt]
GO
ALTER TABLE [dbo].[ContentMediaLinks]  WITH CHECK ADD  CONSTRAINT [FK_ContentMediaLinks_MediaAssetID] FOREIGN KEY([MediaAssetID])
REFERENCES [dbo].[MediaAssets] ([MediaAssetID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ContentMediaLinks] CHECK CONSTRAINT [FK_ContentMediaLinks_MediaAssetID]
GO
ALTER TABLE [dbo].[ContentReports]  WITH CHECK ADD  CONSTRAINT [FK_ContentReports_QuestionID] FOREIGN KEY([QuestionID])
REFERENCES [dbo].[Questions] ([QuestionID])
GO
ALTER TABLE [dbo].[ContentReports] CHECK CONSTRAINT [FK_ContentReports_QuestionID]
GO
ALTER TABLE [dbo].[ContentReports]  WITH CHECK ADD  CONSTRAINT [FK_ContentReports_ReporterUserID] FOREIGN KEY([ReporterUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[ContentReports] CHECK CONSTRAINT [FK_ContentReports_ReporterUserID]
GO
ALTER TABLE [dbo].[ContentReports]  WITH CHECK ADD  CONSTRAINT [FK_ContentReports_ResolvedByUserID] FOREIGN KEY([ResolvedByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[ContentReports] CHECK CONSTRAINT [FK_ContentReports_ResolvedByUserID]
GO
ALTER TABLE [dbo].[ContentReports]  WITH CHECK ADD  CONSTRAINT [FK_ContentReports_WordID] FOREIGN KEY([WordID])
REFERENCES [dbo].[Words] ([WordID])
GO
ALTER TABLE [dbo].[ContentReports] CHECK CONSTRAINT [FK_ContentReports_WordID]
GO
ALTER TABLE [dbo].[ContentReviewLogs]  WITH CHECK ADD  CONSTRAINT [FK_ContentReviewLogs_ActionByUserID] FOREIGN KEY([ActionByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[ContentReviewLogs] CHECK CONSTRAINT [FK_ContentReviewLogs_ActionByUserID]
GO
ALTER TABLE [dbo].[ExampleSentences]  WITH CHECK ADD  CONSTRAINT [FK_ExampleSentences_WordID] FOREIGN KEY([WordID])
REFERENCES [dbo].[Words] ([WordID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ExampleSentences] CHECK CONSTRAINT [FK_ExampleSentences_WordID]
GO
ALTER TABLE [dbo].[ExerciseAttempts]  WITH CHECK ADD  CONSTRAINT [FK_ExerciseAttempts_QuestionID] FOREIGN KEY([QuestionID])
REFERENCES [dbo].[Questions] ([QuestionID])
GO
ALTER TABLE [dbo].[ExerciseAttempts] CHECK CONSTRAINT [FK_ExerciseAttempts_QuestionID]
GO
ALTER TABLE [dbo].[ExerciseAttempts]  WITH CHECK ADD  CONSTRAINT [FK_ExerciseAttempts_UserID] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ExerciseAttempts] CHECK CONSTRAINT [FK_ExerciseAttempts_UserID]
GO
ALTER TABLE [dbo].[ExerciseAttempts]  WITH CHECK ADD  CONSTRAINT [FK_ExerciseAttempts_WordID] FOREIGN KEY([WordID])
REFERENCES [dbo].[Words] ([WordID])
GO
ALTER TABLE [dbo].[ExerciseAttempts] CHECK CONSTRAINT [FK_ExerciseAttempts_WordID]
GO
ALTER TABLE [dbo].[MediaAssets]  WITH CHECK ADD  CONSTRAINT [FK_MediaAssets_UploadedByUserID] FOREIGN KEY([UploadedByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[MediaAssets] CHECK CONSTRAINT [FK_MediaAssets_UploadedByUserID]
GO
ALTER TABLE [dbo].[MiniTestAttempts]  WITH CHECK ADD  CONSTRAINT [FK_MiniTestAttempts_MiniTestID] FOREIGN KEY([MiniTestID])
REFERENCES [dbo].[MiniTests] ([MiniTestID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[MiniTestAttempts] CHECK CONSTRAINT [FK_MiniTestAttempts_MiniTestID]
GO
ALTER TABLE [dbo].[MiniTestAttempts]  WITH CHECK ADD  CONSTRAINT [FK_MiniTestAttempts_UserID] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[MiniTestAttempts] CHECK CONSTRAINT [FK_MiniTestAttempts_UserID]
GO
ALTER TABLE [dbo].[MiniTestItems]  WITH CHECK ADD  CONSTRAINT [FK_MiniTestItems_MiniTestID] FOREIGN KEY([MiniTestID])
REFERENCES [dbo].[MiniTests] ([MiniTestID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[MiniTestItems] CHECK CONSTRAINT [FK_MiniTestItems_MiniTestID]
GO
ALTER TABLE [dbo].[MiniTestItems]  WITH CHECK ADD  CONSTRAINT [FK_MiniTestItems_QuestionID] FOREIGN KEY([QuestionID])
REFERENCES [dbo].[Questions] ([QuestionID])
GO
ALTER TABLE [dbo].[MiniTestItems] CHECK CONSTRAINT [FK_MiniTestItems_QuestionID]
GO
ALTER TABLE [dbo].[MiniTests]  WITH CHECK ADD  CONSTRAINT [FK_MiniTests_CreatedByUserID] FOREIGN KEY([CreatedByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[MiniTests] CHECK CONSTRAINT [FK_MiniTests_CreatedByUserID]
GO
ALTER TABLE [dbo].[MiniTests]  WITH CHECK ADD  CONSTRAINT [FK_MiniTests_ReviewedByUserID] FOREIGN KEY([ReviewedByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[MiniTests] CHECK CONSTRAINT [FK_MiniTests_ReviewedByUserID]
GO
ALTER TABLE [dbo].[MiniTests]  WITH CHECK ADD  CONSTRAINT [FK_MiniTests_TopicID] FOREIGN KEY([TopicID])
REFERENCES [dbo].[Topics] ([TopicID])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[MiniTests] CHECK CONSTRAINT [FK_MiniTests_TopicID]
GO
ALTER TABLE [dbo].[Notifications]  WITH CHECK ADD  CONSTRAINT [FK_Notifications_Users] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Notifications] CHECK CONSTRAINT [FK_Notifications_Users]
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD  CONSTRAINT [FK_Questions_CreatedByUserID] FOREIGN KEY([CreatedByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Questions] CHECK CONSTRAINT [FK_Questions_CreatedByUserID]
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD  CONSTRAINT [FK_Questions_ReviewedByUserID] FOREIGN KEY([ReviewedByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Questions] CHECK CONSTRAINT [FK_Questions_ReviewedByUserID]
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD  CONSTRAINT [FK_Questions_WordID] FOREIGN KEY([WordID])
REFERENCES [dbo].[Words] ([WordID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Questions] CHECK CONSTRAINT [FK_Questions_WordID]
GO
ALTER TABLE [dbo].[RolePermissions]  WITH CHECK ADD  CONSTRAINT [FK_RolePermissions_Permission] FOREIGN KEY([PermissionID])
REFERENCES [dbo].[Permissions] ([PermissionID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RolePermissions] CHECK CONSTRAINT [FK_RolePermissions_Permission]
GO
ALTER TABLE [dbo].[RolePermissions]  WITH CHECK ADD  CONSTRAINT [FK_RolePermissions_Role] FOREIGN KEY([RoleID])
REFERENCES [dbo].[Roles] ([RoleID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RolePermissions] CHECK CONSTRAINT [FK_RolePermissions_Role]
GO
ALTER TABLE [dbo].[TopicCategories]  WITH CHECK ADD  CONSTRAINT [FK_TopicCategories_CreatedByUserID] FOREIGN KEY([CreatedByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[TopicCategories] CHECK CONSTRAINT [FK_TopicCategories_CreatedByUserID]
GO
ALTER TABLE [dbo].[Topics]  WITH CHECK ADD  CONSTRAINT [FK_Topics_CreatedByUserID] FOREIGN KEY([CreatedByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Topics] CHECK CONSTRAINT [FK_Topics_CreatedByUserID]
GO
ALTER TABLE [dbo].[Topics]  WITH CHECK ADD  CONSTRAINT [FK_Topics_ReviewedByUserID] FOREIGN KEY([ReviewedByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Topics] CHECK CONSTRAINT [FK_Topics_ReviewedByUserID]
GO
ALTER TABLE [dbo].[Topics]  WITH CHECK ADD  CONSTRAINT [FK_Topics_TopicCategoryID] FOREIGN KEY([TopicCategoryID])
REFERENCES [dbo].[TopicCategories] ([TopicCategoryID])
GO
ALTER TABLE [dbo].[Topics] CHECK CONSTRAINT [FK_Topics_TopicCategoryID]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_RoleID] FOREIGN KEY([RoleID])
REFERENCES [dbo].[Roles] ([RoleID])
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_RoleID]
GO
ALTER TABLE [dbo].[UserTopicEnrollments]  WITH CHECK ADD  CONSTRAINT [FK_UserTopicEnrollments_TopicID] FOREIGN KEY([TopicID])
REFERENCES [dbo].[Topics] ([TopicID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserTopicEnrollments] CHECK CONSTRAINT [FK_UserTopicEnrollments_TopicID]
GO
ALTER TABLE [dbo].[UserTopicEnrollments]  WITH CHECK ADD  CONSTRAINT [FK_UserTopicEnrollments_UserID] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserTopicEnrollments] CHECK CONSTRAINT [FK_UserTopicEnrollments_UserID]
GO
ALTER TABLE [dbo].[UserVocabularyNotebook]  WITH CHECK ADD  CONSTRAINT [FK_UserVocabularyNotebook_UserID] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserVocabularyNotebook] CHECK CONSTRAINT [FK_UserVocabularyNotebook_UserID]
GO
ALTER TABLE [dbo].[UserVocabularyNotebook]  WITH CHECK ADD  CONSTRAINT [FK_UserVocabularyNotebook_WordID] FOREIGN KEY([WordID])
REFERENCES [dbo].[Words] ([WordID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserVocabularyNotebook] CHECK CONSTRAINT [FK_UserVocabularyNotebook_WordID]
GO
ALTER TABLE [dbo].[UserWordProgress]  WITH CHECK ADD  CONSTRAINT [FK_UserWordProgress_UserID] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserWordProgress] CHECK CONSTRAINT [FK_UserWordProgress_UserID]
GO
ALTER TABLE [dbo].[UserWordProgress]  WITH CHECK ADD  CONSTRAINT [FK_UserWordProgress_WordID] FOREIGN KEY([WordID])
REFERENCES [dbo].[Words] ([WordID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserWordProgress] CHECK CONSTRAINT [FK_UserWordProgress_WordID]
GO
ALTER TABLE [dbo].[Words]  WITH CHECK ADD  CONSTRAINT [FK_Words_CreatedByUserID] FOREIGN KEY([CreatedByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Words] CHECK CONSTRAINT [FK_Words_CreatedByUserID]
GO
ALTER TABLE [dbo].[Words]  WITH CHECK ADD  CONSTRAINT [FK_Words_PartOfSpeechID] FOREIGN KEY([PartOfSpeechID])
REFERENCES [dbo].[PartOfSpeeches] ([PartOfSpeechID])
GO
ALTER TABLE [dbo].[Words] CHECK CONSTRAINT [FK_Words_PartOfSpeechID]
GO
ALTER TABLE [dbo].[Words]  WITH CHECK ADD  CONSTRAINT [FK_Words_ReviewedByUserID] FOREIGN KEY([ReviewedByUserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Words] CHECK CONSTRAINT [FK_Words_ReviewedByUserID]
GO
ALTER TABLE [dbo].[WordTopics]  WITH CHECK ADD  CONSTRAINT [FK_WordTopics_TopicID] FOREIGN KEY([TopicID])
REFERENCES [dbo].[Topics] ([TopicID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[WordTopics] CHECK CONSTRAINT [FK_WordTopics_TopicID]
GO
ALTER TABLE [dbo].[WordTopics]  WITH CHECK ADD  CONSTRAINT [FK_WordTopics_WordID] FOREIGN KEY([WordID])
REFERENCES [dbo].[Words] ([WordID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[WordTopics] CHECK CONSTRAINT [FK_WordTopics_WordID]
GO
ALTER TABLE [dbo].[ContentMediaLinks]  WITH CHECK ADD  CONSTRAINT [CK_ContentMediaLinks_DisplayOrder] CHECK  (([DisplayOrder]>(0)))
GO
ALTER TABLE [dbo].[ContentMediaLinks] CHECK CONSTRAINT [CK_ContentMediaLinks_DisplayOrder]
GO
ALTER TABLE [dbo].[ContentMediaLinks]  WITH CHECK ADD  CONSTRAINT [CK_ContentMediaLinks_EntityType] CHECK  (([EntityType]=N'Topic' OR [EntityType]=N'ExampleSentence' OR [EntityType]=N'Question' OR [EntityType]=N'Word'))
GO
ALTER TABLE [dbo].[ContentMediaLinks] CHECK CONSTRAINT [CK_ContentMediaLinks_EntityType]
GO
ALTER TABLE [dbo].[ContentReports]  WITH CHECK ADD  CONSTRAINT [CK_ContentReports_EntityType] CHECK  (([EntityType]=N'General' OR [EntityType]=N'Audio' OR [EntityType]=N'Question' OR [EntityType]=N'Word'))
GO
ALTER TABLE [dbo].[ContentReports] CHECK CONSTRAINT [CK_ContentReports_EntityType]
GO
ALTER TABLE [dbo].[ContentReports]  WITH CHECK ADD  CONSTRAINT [CK_ContentReports_Priority] CHECK  (([Priority]=N'Urgent' OR [Priority]=N'High' OR [Priority]=N'Normal' OR [Priority]=N'Low'))
GO
ALTER TABLE [dbo].[ContentReports] CHECK CONSTRAINT [CK_ContentReports_Priority]
GO
ALTER TABLE [dbo].[ContentReports]  WITH CHECK ADD  CONSTRAINT [CK_ContentReports_ReportType] CHECK  (([ReportType]=N'Other' OR [ReportType]=N'Typo' OR [ReportType]=N'AnswerIncorrect' OR [ReportType]=N'AudioIssue' OR [ReportType]=N'WordIncorrect'))
GO
ALTER TABLE [dbo].[ContentReports] CHECK CONSTRAINT [CK_ContentReports_ReportType]
GO
ALTER TABLE [dbo].[ContentReports]  WITH CHECK ADD  CONSTRAINT [CK_ContentReports_Status] CHECK  (([Status]=N'Rejected' OR [Status]=N'Resolved' OR [Status]=N'InReview' OR [Status]=N'Open'))
GO
ALTER TABLE [dbo].[ContentReports] CHECK CONSTRAINT [CK_ContentReports_Status]
GO
ALTER TABLE [dbo].[ContentReviewLogs]  WITH CHECK ADD  CONSTRAINT [CK_ContentReviewLogs_EntityType] CHECK  (([EntityType]=N'MediaAsset' OR [EntityType]=N'ExampleSentence' OR [EntityType]=N'MiniTest' OR [EntityType]=N'Question' OR [EntityType]=N'Word' OR [EntityType]=N'Topic'))
GO
ALTER TABLE [dbo].[ContentReviewLogs] CHECK CONSTRAINT [CK_ContentReviewLogs_EntityType]
GO
ALTER TABLE [dbo].[ContentReviewLogs]  WITH CHECK ADD  CONSTRAINT [CK_ContentReviewLogs_Status] CHECK  ((([NewStatus]=N'Archived' OR [NewStatus]=N'Rejected' OR [NewStatus]=N'Published' OR [NewStatus]=N'PendingReview' OR [NewStatus]=N'Draft') AND ([OldStatus] IS NULL OR ([OldStatus]=N'Archived' OR [OldStatus]=N'Rejected' OR [OldStatus]=N'Published' OR [OldStatus]=N'PendingReview' OR [OldStatus]=N'Draft'))))
GO
ALTER TABLE [dbo].[ContentReviewLogs] CHECK CONSTRAINT [CK_ContentReviewLogs_Status]
GO
ALTER TABLE [dbo].[ExerciseAttempts]  WITH CHECK ADD  CONSTRAINT [CK_ExerciseAttempts_AttemptMetadataJson_IsJson] CHECK  (([AttemptMetadataJson] IS NULL OR isjson([AttemptMetadataJson])=(1)))
GO
ALTER TABLE [dbo].[ExerciseAttempts] CHECK CONSTRAINT [CK_ExerciseAttempts_AttemptMetadataJson_IsJson]
GO
ALTER TABLE [dbo].[ExerciseAttempts]  WITH CHECK ADD  CONSTRAINT [CK_ExerciseAttempts_ScoreAwarded] CHECK  (([ScoreAwarded]>=(0) AND [ScoreAwarded]<=(100)))
GO
ALTER TABLE [dbo].[ExerciseAttempts] CHECK CONSTRAINT [CK_ExerciseAttempts_ScoreAwarded]
GO
ALTER TABLE [dbo].[MediaAssets]  WITH CHECK ADD  CONSTRAINT [CK_MediaAssets_FileSizeBytes] CHECK  (([FileSizeBytes] IS NULL OR [FileSizeBytes]>=(0)))
GO
ALTER TABLE [dbo].[MediaAssets] CHECK CONSTRAINT [CK_MediaAssets_FileSizeBytes]
GO
ALTER TABLE [dbo].[MediaAssets]  WITH CHECK ADD  CONSTRAINT [CK_MediaAssets_MediaType] CHECK  (([MediaType]=N'QuestionImage' OR [MediaType]=N'QuestionAudio' OR [MediaType]=N'ExampleAudio' OR [MediaType]=N'Image' OR [MediaType]=N'AudioUS' OR [MediaType]=N'AudioUK'))
GO
ALTER TABLE [dbo].[MediaAssets] CHECK CONSTRAINT [CK_MediaAssets_MediaType]
GO
ALTER TABLE [dbo].[MiniTestAttempts]  WITH CHECK ADD  CONSTRAINT [CK_MiniTestAttempts_CorrectCount] CHECK  (([CorrectCount]>=(0)))
GO
ALTER TABLE [dbo].[MiniTestAttempts] CHECK CONSTRAINT [CK_MiniTestAttempts_CorrectCount]
GO
ALTER TABLE [dbo].[MiniTestAttempts]  WITH CHECK ADD  CONSTRAINT [CK_MiniTestAttempts_Score] CHECK  (([Score] IS NULL OR [Score]>=(0) AND [Score]<=(100)))
GO
ALTER TABLE [dbo].[MiniTestAttempts] CHECK CONSTRAINT [CK_MiniTestAttempts_Score]
GO
ALTER TABLE [dbo].[MiniTestAttempts]  WITH CHECK ADD  CONSTRAINT [CK_MiniTestAttempts_TotalQuestions] CHECK  (([TotalQuestions]>=(0)))
GO
ALTER TABLE [dbo].[MiniTestAttempts] CHECK CONSTRAINT [CK_MiniTestAttempts_TotalQuestions]
GO
ALTER TABLE [dbo].[MiniTestItems]  WITH CHECK ADD  CONSTRAINT [CK_MiniTestItems_DisplayOrder] CHECK  (([DisplayOrder]>(0)))
GO
ALTER TABLE [dbo].[MiniTestItems] CHECK CONSTRAINT [CK_MiniTestItems_DisplayOrder]
GO
ALTER TABLE [dbo].[MiniTests]  WITH CHECK ADD  CONSTRAINT [CK_MiniTests_ContentStatus] CHECK  (([ContentStatus]=N'Archived' OR [ContentStatus]=N'Rejected' OR [ContentStatus]=N'Published' OR [ContentStatus]=N'PendingReview' OR [ContentStatus]=N'Draft'))
GO
ALTER TABLE [dbo].[MiniTests] CHECK CONSTRAINT [CK_MiniTests_ContentStatus]
GO
ALTER TABLE [dbo].[MiniTests]  WITH CHECK ADD  CONSTRAINT [CK_MiniTests_TotalQuestions] CHECK  (([TotalQuestions]>=(0)))
GO
ALTER TABLE [dbo].[MiniTests] CHECK CONSTRAINT [CK_MiniTests_TotalQuestions]
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD  CONSTRAINT [CK_Questions_ContentStatus] CHECK  (([ContentStatus]=N'Archived' OR [ContentStatus]=N'Rejected' OR [ContentStatus]=N'Published' OR [ContentStatus]=N'PendingReview' OR [ContentStatus]=N'Draft'))
GO
ALTER TABLE [dbo].[Questions] CHECK CONSTRAINT [CK_Questions_ContentStatus]
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD  CONSTRAINT [CK_Questions_DifficultyLevel] CHECK  (([DifficultyLevel]>=(1) AND [DifficultyLevel]<=(5)))
GO
ALTER TABLE [dbo].[Questions] CHECK CONSTRAINT [CK_Questions_DifficultyLevel]
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD  CONSTRAINT [CK_Questions_OptionsJson_IsJson] CHECK  ((isjson([OptionsJson])=(1)))
GO
ALTER TABLE [dbo].[Questions] CHECK CONSTRAINT [CK_Questions_OptionsJson_IsJson]
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD  CONSTRAINT [CK_Questions_QuestionType] CHECK  (([QuestionType]=N'FlashcardCheck' OR [QuestionType]=N'Dictation' OR [QuestionType]=N'DragDrop' OR [QuestionType]=N'FillBlank' OR [QuestionType]=N'MCQ'))
GO
ALTER TABLE [dbo].[Questions] CHECK CONSTRAINT [CK_Questions_QuestionType]
GO
ALTER TABLE [dbo].[TopicCategories]  WITH CHECK ADD  CONSTRAINT [CK_TopicCategories_DisplayOrder] CHECK  (([DisplayOrder]>(0)))
GO
ALTER TABLE [dbo].[TopicCategories] CHECK CONSTRAINT [CK_TopicCategories_DisplayOrder]
GO
ALTER TABLE [dbo].[Topics]  WITH CHECK ADD  CONSTRAINT [CK_Topics_ContentStatus] CHECK  (([ContentStatus]=N'Archived' OR [ContentStatus]=N'Rejected' OR [ContentStatus]=N'Published' OR [ContentStatus]=N'PendingReview' OR [ContentStatus]=N'Draft'))
GO
ALTER TABLE [dbo].[Topics] CHECK CONSTRAINT [CK_Topics_ContentStatus]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [CK_Users_UserRole] CHECK  (([UserRole]=N'Admin' OR [UserRole]=N'ContentCreator' OR [UserRole]=N'Learner'))
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [CK_Users_UserRole]
GO
ALTER TABLE [dbo].[UserWordProgress]  WITH CHECK ADD  CONSTRAINT [CK_UserWordProgress_ConsecutiveCorrect] CHECK  (([ConsecutiveCorrect]>=(0)))
GO
ALTER TABLE [dbo].[UserWordProgress] CHECK CONSTRAINT [CK_UserWordProgress_ConsecutiveCorrect]
GO
ALTER TABLE [dbo].[UserWordProgress]  WITH CHECK ADD  CONSTRAINT [CK_UserWordProgress_ConsecutiveWrong] CHECK  (([ConsecutiveWrong]>=(0)))
GO
ALTER TABLE [dbo].[UserWordProgress] CHECK CONSTRAINT [CK_UserWordProgress_ConsecutiveWrong]
GO
ALTER TABLE [dbo].[UserWordProgress]  WITH CHECK ADD  CONSTRAINT [CK_UserWordProgress_EaseFactor] CHECK  (([EaseFactor]>=(1.30) AND [EaseFactor]<=(3.50)))
GO
ALTER TABLE [dbo].[UserWordProgress] CHECK CONSTRAINT [CK_UserWordProgress_EaseFactor]
GO
ALTER TABLE [dbo].[UserWordProgress]  WITH CHECK ADD  CONSTRAINT [CK_UserWordProgress_LastScore] CHECK  (([LastScore] IS NULL OR [LastScore]>=(0) AND [LastScore]<=(100)))
GO
ALTER TABLE [dbo].[UserWordProgress] CHECK CONSTRAINT [CK_UserWordProgress_LastScore]
GO
ALTER TABLE [dbo].[UserWordProgress]  WITH CHECK ADD  CONSTRAINT [CK_UserWordProgress_MasteryLevel] CHECK  (([MasteryLevel]>=(0) AND [MasteryLevel]<=(10)))
GO
ALTER TABLE [dbo].[UserWordProgress] CHECK CONSTRAINT [CK_UserWordProgress_MasteryLevel]
GO
ALTER TABLE [dbo].[UserWordProgress]  WITH CHECK ADD  CONSTRAINT [CK_UserWordProgress_MemoryStatus] CHECK  (([MemoryStatus]=N'Lapsed' OR [MemoryStatus]=N'Mastered' OR [MemoryStatus]=N'Reviewing' OR [MemoryStatus]=N'Learning' OR [MemoryStatus]=N'New'))
GO
ALTER TABLE [dbo].[UserWordProgress] CHECK CONSTRAINT [CK_UserWordProgress_MemoryStatus]
GO
ALTER TABLE [dbo].[UserWordProgress]  WITH CHECK ADD  CONSTRAINT [CK_UserWordProgress_RepetitionCount] CHECK  (([RepetitionCount]>=(0)))
GO
ALTER TABLE [dbo].[UserWordProgress] CHECK CONSTRAINT [CK_UserWordProgress_RepetitionCount]
GO
ALTER TABLE [dbo].[Words]  WITH CHECK ADD  CONSTRAINT [CK_Words_ContentStatus] CHECK  (([ContentStatus]=N'Archived' OR [ContentStatus]=N'Rejected' OR [ContentStatus]=N'Published' OR [ContentStatus]=N'PendingReview' OR [ContentStatus]=N'Draft'))
GO
ALTER TABLE [dbo].[Words] CHECK CONSTRAINT [CK_Words_ContentStatus]
GO
ALTER TABLE [dbo].[Words]  WITH CHECK ADD  CONSTRAINT [CK_Words_DifficultyLevel] CHECK  (([DifficultyLevel]>=(1) AND [DifficultyLevel]<=(5)))
GO
ALTER TABLE [dbo].[Words] CHECK CONSTRAINT [CK_Words_DifficultyLevel]
GO
/****** Object:  StoredProcedure [dbo].[usp_SubmitQuestionAttempt]    Script Date: 28-May-26 8:31:14 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* ============================================================
   9. STORED PROCEDURE
   - ACID-compliant question submission
   - Logs attempt
   - Calculates score / memory state
   - Updates NextReviewDate
   ============================================================ */

CREATE PROCEDURE [dbo].[usp_SubmitQuestionAttempt]
(
    @UserID               BIGINT,
    @QuestionID           BIGINT,
    @SubmittedAnswer      NVARCHAR(1000),
    @ClientTimeZoneOffset NVARCHAR(10) = NULL,
    @AttemptMetadataJson  NVARCHAR(MAX) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @WordID               BIGINT,
        @CorrectAnswer        NVARCHAR(500),
        @QuestionType         NVARCHAR(30),
        @IsCorrect            BIT,
        @ScoreAwarded         DECIMAL(5,2),
        @Now                  DATETIMEOFFSET(7),
        @UserWordProgressID   BIGINT,
        @MasteryLevel         TINYINT,
        @EaseFactor           DECIMAL(4,2),
        @RepetitionCount      INT,
        @ConsecutiveCorrect   INT,
        @ConsecutiveWrong     INT,
        @LastScore            DECIMAL(5,2),
        @MemoryStatus         NVARCHAR(30),
        @NextReviewDate       DATETIMEOFFSET(7),
        @IntervalDays         INT;

    BEGIN TRY
        BEGIN TRAN;

        /* Validate JSON input if provided */
        IF @AttemptMetadataJson IS NOT NULL AND ISJSON(@AttemptMetadataJson) <> 1
        BEGIN
            THROW 50001, N'AttemptMetadataJson phải là JSON hợp lệ.', 1;
        END

        SET @Now = SYSDATETIMEOFFSET();

        /* Get question detail */
        SELECT
            @WordID = q.WordID,
            @CorrectAnswer = q.CorrectAnswer,
            @QuestionType = q.QuestionType
        FROM dbo.Questions AS q
        WHERE q.QuestionID = @QuestionID;

        IF @WordID IS NULL
        BEGIN
            THROW 50002, N'QuestionID không tồn tại.', 1;
        END

        /* Check user existence */
        IF NOT EXISTS
        (
            SELECT 1
            FROM dbo.Users AS u
            WHERE u.UserID = @UserID
              AND u.IsActive = 1
        )
        BEGIN
            THROW 50003, N'UserID không hợp lệ hoặc đã bị vô hiệu hóa.', 1;
        END

        /*
            Simple answer evaluation:
            - Normalize by trimming and lowercasing.
            - In real production, MCQ / dictation / fill blank may need more advanced scoring.
        */
        SET @IsCorrect =
            CASE
                WHEN LOWER(LTRIM(RTRIM(@SubmittedAnswer))) = LOWER(LTRIM(RTRIM(@CorrectAnswer)))
                    THEN 1
                ELSE 0
            END;

        SET @ScoreAwarded =
            CASE
                WHEN @IsCorrect = 1 THEN 100.00
                ELSE 0.00
            END;

        /*
            Upsert-like handling for UserWordProgress.
            Locking hints are used to avoid race conditions when the same user submits
            multiple attempts concurrently for the same word.
        */
        SELECT
            @UserWordProgressID = uwp.UserWordProgressID,
            @MasteryLevel = uwp.MasteryLevel,
            @EaseFactor = uwp.EaseFactor,
            @RepetitionCount = uwp.RepetitionCount,
            @ConsecutiveCorrect = uwp.ConsecutiveCorrect,
            @ConsecutiveWrong = uwp.ConsecutiveWrong,
            @LastScore = uwp.LastScore,
            @MemoryStatus = uwp.MemoryStatus
        FROM dbo.UserWordProgress AS uwp WITH (UPDLOCK, HOLDLOCK)
        WHERE uwp.UserID = @UserID
          AND uwp.WordID = @WordID;

        IF @UserWordProgressID IS NULL
        BEGIN
            INSERT INTO dbo.UserWordProgress
            (
                UserID,
                WordID,
                MasteryLevel,
                EaseFactor,
                RepetitionCount,
                ConsecutiveCorrect,
                ConsecutiveWrong,
                LastReviewedAt,
                NextReviewDate,
                LastScore,
                MemoryStatus,
                CreatedAt,
                UpdatedAt
            )
            VALUES
            (
                @UserID,
                @WordID,
                0,
                2.50,
                0,
                0,
                0,
                NULL,
                NULL,
                NULL,
                N'New',
                @Now,
                @Now
            );

            SET @UserWordProgressID = SCOPE_IDENTITY();
            SET @MasteryLevel = 0;
            SET @EaseFactor = 2.50;
            SET @RepetitionCount = 0;
            SET @ConsecutiveCorrect = 0;
            SET @ConsecutiveWrong = 0;
            SET @MemoryStatus = N'New';
        END

        /* 1) Log attempt history */
        INSERT INTO dbo.ExerciseAttempts
        (
            UserID,
            QuestionID,
            WordID,
            SubmittedAnswer,
            IsCorrect,
            ScoreAwarded,
            AttemptedAt,
            ClientTimeZoneOffset,
            AttemptMetadataJson
        )
        VALUES
        (
            @UserID,
            @QuestionID,
            @WordID,
            @SubmittedAnswer,
            @IsCorrect,
            @ScoreAwarded,
            @Now,
            @ClientTimeZoneOffset,
            @AttemptMetadataJson
        );

        /*
            2) Calculate memory metrics
            A lightweight spaced repetition policy:
            - Correct:
                + increase repetition count
                + increase mastery
                + reduce wrong streak
                + slightly improve ease factor
            - Wrong:
                + reset repetition count
                + reduce mastery
                + increase wrong streak
                + reduce ease factor
        */
        IF @IsCorrect = 1
        BEGIN
            SET @RepetitionCount = @RepetitionCount + 1;
            SET @ConsecutiveCorrect = @ConsecutiveCorrect + 1;
            SET @ConsecutiveWrong = 0;
            SET @MasteryLevel = CASE WHEN @MasteryLevel < 10 THEN @MasteryLevel + 1 ELSE 10 END;
            SET @EaseFactor =
                CASE
                    WHEN @EaseFactor + 0.10 > 3.50 THEN 3.50
                    ELSE @EaseFactor + 0.10
                END;
        END
        ELSE
        BEGIN
            SET @RepetitionCount = 0;
            SET @ConsecutiveCorrect = 0;
            SET @ConsecutiveWrong = @ConsecutiveWrong + 1;
            SET @MasteryLevel = CASE WHEN @MasteryLevel > 0 THEN @MasteryLevel - 1 ELSE 0 END;
            SET @EaseFactor =
                CASE
                    WHEN @EaseFactor - 0.20 < 1.30 THEN 1.30
                    ELSE @EaseFactor - 0.20
                END;
        END

        /*
            3) Compute next review date
            Simple interval strategy:
            - Wrong  : review again very soon
            - Correct: interval grows with repetition count
        */
        IF @IsCorrect = 0
        BEGIN
            SET @IntervalDays = 0; 
            SET @NextReviewDate = DATEADD(MINUTE, 30, @Now);
            SET @MemoryStatus = N'Lapsed';
        END
        ELSE
        BEGIN
            SET @IntervalDays =
                CASE
                    WHEN @RepetitionCount = 1 THEN 1
                    WHEN @RepetitionCount = 2 THEN 3
                    WHEN @RepetitionCount = 3 THEN 7
                    WHEN @RepetitionCount = 4 THEN 14
                    WHEN @RepetitionCount = 5 THEN 30
                    ELSE CAST(ROUND((@RepetitionCount * @EaseFactor * 10.0), 0) AS INT)
                END;

            SET @NextReviewDate = DATEADD(DAY, @IntervalDays, @Now);

            SET @MemoryStatus =
                CASE
                    WHEN @MasteryLevel >= 8 THEN N'Mastered'
                    WHEN @MasteryLevel >= 5 THEN N'Reviewing'
                    ELSE N'Learning'
                END;
        END

        /* 4) Update learning progress */
        UPDATE dbo.UserWordProgress
        SET
            MasteryLevel = @MasteryLevel,
            EaseFactor = @EaseFactor,
            RepetitionCount = @RepetitionCount,
            ConsecutiveCorrect = @ConsecutiveCorrect,
            ConsecutiveWrong = @ConsecutiveWrong,
            LastReviewedAt = @Now,
            NextReviewDate = @NextReviewDate,
            LastScore = @ScoreAwarded,
            MemoryStatus = @MemoryStatus,
            UpdatedAt = @Now
        WHERE UserWordProgressID = @UserWordProgressID;

        COMMIT TRAN;

        /* Return result for application layer */
        SELECT
            @UserID AS UserID,
            @QuestionID AS QuestionID,
            @WordID AS WordID,
            @IsCorrect AS IsCorrect,
            @ScoreAwarded AS ScoreAwarded,
            @MasteryLevel AS MasteryLevel,
            @EaseFactor AS EaseFactor,
            @RepetitionCount AS RepetitionCount,
            @MemoryStatus AS MemoryStatus,
            @NextReviewDate AS NextReviewDate,
            @Now AS ProcessedAt;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;

        DECLARE
            @ErrorNumber INT = ERROR_NUMBER(),
            @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE(),
            @ErrorLine INT = ERROR_LINE(),
            @ErrorProcedure NVARCHAR(200) = ERROR_PROCEDURE();

        -- Gán chuỗi báo lỗi vào một biến trước
        DECLARE @ThrowMsg NVARCHAR(2048);
        SET @ThrowMsg = CONCAT
            (
                N'usp_SubmitQuestionAttempt failed. ErrorNumber=', @ErrorNumber,
                N', Procedure=', ISNULL(@ErrorProcedure, N''),
                N', Line=', @ErrorLine,
                N', Message=', @ErrorMessage
            );

        -- Truyền biến vào lệnh THROW
        THROW 51000, @ThrowMsg, 1;
    END CATCH
END

GO
USE [master]
GO
ALTER DATABASE [ToeicVocabularyPlatform] SET  READ_WRITE 
GO
