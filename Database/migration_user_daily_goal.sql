-- Migration: Add DailyGoal column to Users table
-- Purpose: Allow syncing daily word goal across devices
-- Note: Also add SRSReviewLimit for future SRS configuration

IF COL_LENGTH(N'dbo.Users', N'DailyGoal') IS NULL
BEGIN
    ALTER TABLE dbo.Users
        ADD DailyGoal INT NOT NULL CONSTRAINT DF_Users_DailyGoal DEFAULT (20);
END;
GO

IF COL_LENGTH(N'dbo.Users', N'SRSReviewLimit') IS NULL
BEGIN
    ALTER TABLE dbo.Users
        ADD SRSReviewLimit INT NOT NULL CONSTRAINT DF_Users_SRSReviewLimit DEFAULT (15);
END;
GO

-- Update existing users to have sensible defaults
UPDATE dbo.Users
SET DailyGoal = 20
WHERE DailyGoal IS NULL OR DailyGoal <= 0;
GO

UPDATE dbo.Users
SET SRSReviewLimit = 15
WHERE SRSReviewLimit IS NULL OR SRSReviewLimit <= 0;
GO
