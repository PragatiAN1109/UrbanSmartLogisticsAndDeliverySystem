-- Indexes
USE P4_SCHEMA;
GO

-- 1. Non-clustered index on Customer Email
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CustomerEmail' AND object_id = OBJECT_ID('Customer'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_CustomerEmail ON Customer(Email);
END;
GO

-- 2. Non-clustered index on Order Status
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_OrderStatus' AND object_id = OBJECT_ID('[Order]'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_OrderStatus ON [Order](OrderStatus);
END;
GO

-- 3. Non-clustered index on Prescription Verification Status
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PrescriptionStatus' AND object_id = OBJECT_ID('Prescription'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_PrescriptionStatus ON Prescription(VerificationStatus);
END;
GO
