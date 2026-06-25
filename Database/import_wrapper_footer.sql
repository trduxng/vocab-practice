GO

-- Re-enable all triggers
EXEC sp_MSforeachtable 'ALTER TABLE ? ENABLE TRIGGER ALL'
GO

-- Re-enable all foreign key constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL'
GO

PRINT 'Import completed successfully!'
GO
