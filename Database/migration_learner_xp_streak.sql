-- Migration: Add XP/Level columns to Users table
-- Purpose: Track learner XP (experience points) and levels server-side for gamification

IF COL_LENGTH(N'dbo.Users', N'TotalXP') IS NULL
BEGIN
    ALTER TABLE dbo.Users
        ADD TotalXP INT NOT NULL CONSTRAINT DF_Users_TotalXP DEFAULT (0);
END;
GO

IF COL_LENGTH(N'dbo.Users', N'CurrentLevel') IS NULL
BEGIN
    ALTER TABLE dbo.Users
        ADD CurrentLevel INT NOT NULL CONSTRAINT DF_Users_CurrentLevel DEFAULT (1);
END;
GO

-- Update existing users to have sensible defaults
UPDATE dbo.Users
SET TotalXP = 0, CurrentLevel = 1
WHERE TotalXP IS NULL OR CurrentLevel IS NULL OR TotalXP < 0 OR CurrentLevel < 1;
GO
