-- Migration: Add Notifications table for in-app notification system
-- Supports both admin announcements and user-facing notifications

IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
        NotificationID   BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Notifications PRIMARY KEY CLUSTERED,
        UserID           BIGINT NOT NULL,
        Title            NVARCHAR(200)   NOT NULL,
        Message          NVARCHAR(2000)  NOT NULL,
        Type             NVARCHAR(50)    NOT NULL,
        DeliveryChannel  NVARCHAR(20)    NOT NULL,
        IsRead           BIT NOT NULL
            CONSTRAINT DF_Notifications_IsRead DEFAULT (0),
        ActionUrl        NVARCHAR(500)   NULL,
        CreatedAt        DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_Notifications_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
        CONSTRAINT FK_Notifications_Users
            FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
    );

    CREATE NONCLUSTERED INDEX IX_Notifications_UserID_IsRead
        ON dbo.Notifications (UserID, IsRead)
        INCLUDE (Title, Message, Type, CreatedAt, ActionUrl);

    CREATE NONCLUSTERED INDEX IX_Notifications_CreatedAt
        ON dbo.Notifications (CreatedAt DESC);

    PRINT 'Created Notifications table.';
END
ELSE
BEGIN
    PRINT 'Notifications table already exists.';
END
GO
