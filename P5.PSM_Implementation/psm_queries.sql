-- Procedures

-- 1. Assign a driver to a delivery route
IF OBJECT_ID('AssignDriverToRoute', 'P') IS NOT NULL
    DROP PROCEDURE AssignDriverToRoute;
GO
CREATE PROCEDURE AssignDriverToRoute
    @DriverID INT,
    @RouteID INT
AS
BEGIN
    UPDATE DeliverySchedule
    SET DriverID = @DriverID
    WHERE RouteID = @RouteID;
END;
GO

-- 2. Get locker utilization details
IF OBJECT_ID('GetLockerUtilization', 'P') IS NOT NULL
    DROP PROCEDURE GetLockerUtilization;
GO
CREATE PROCEDURE GetLockerUtilization
AS
BEGIN
    SELECT 
        LockerSize, 
        COUNT(*) AS TotalLockers, 
        SUM(CASE WHEN IsOccupied = 1 THEN 1 ELSE 0 END) AS OccupiedLockers
    FROM SmartLocker
    GROUP BY LockerSize;
END;
GO

-- 3. Retrieve prescription details for an order
IF OBJECT_ID('GetPrescriptionDetails', 'P') IS NOT NULL
    DROP PROCEDURE GetPrescriptionDetails;
GO
CREATE PROCEDURE GetPrescriptionDetails
    @OrderID INT
AS
BEGIN
    SELECT * 
    FROM Prescription
    WHERE OrderID = @OrderID;
END;
GO

-- 4. Verify a customer’s access to a smart locker
IF OBJECT_ID('VerifyCustomerLockerAccess', 'P') IS NOT NULL
    DROP PROCEDURE VerifyCustomerLockerAccess;
GO
CREATE PROCEDURE VerifyCustomerLockerAccess
    @CustomerID INT,
    @LockerID INT
AS
BEGIN
    SELECT CASE 
        WHEN EXISTS (SELECT * FROM Customer WHERE CustomerID = @CustomerID AND PreferredLockerLocation = @LockerID)
        THEN 'Access Granted'
        ELSE 'Access Denied'
    END AS AccessStatus;
END;
GO

-- Views

-- 1. View for active delivery schedules
GO
IF OBJECT_ID('ActiveDeliverySchedules', 'V') IS NOT NULL
    DROP VIEW ActiveDeliverySchedules;
GO
CREATE VIEW ActiveDeliverySchedules AS
SELECT 
    DS.ScheduleID, 
    DR.Name AS DriverName, 
    DR.AvailabilityStatus, 
    DS.RouteID, 
    DS.StartTime, 
    DS.EndTime
FROM DeliverySchedule DS
JOIN DeliveryDriver DR ON DS.DriverID = DR.DriverID
WHERE DS.EndTime > GETDATE();
GO

-- 2. View for order and package details
IF OBJECT_ID('OrderPackageDetails', 'V') IS NOT NULL
    DROP VIEW OrderPackageDetails;
GO
CREATE VIEW OrderPackageDetails AS
SELECT 
    O.OrderID, 
    O.OrderStatus, 
    P.PackageID, 
    P.DeliveryStatus
FROM [Order] O
JOIN Package P ON O.OrderID = P.OrderID;
GO

-- 3. View for prescription verification status
IF OBJECT_ID('PrescriptionVerificationStatus', 'V') IS NOT NULL
    DROP VIEW PrescriptionVerificationStatus;
GO
CREATE VIEW PrescriptionVerificationStatus AS
SELECT 
    P.PrescriptionID, 
    P.OrderID, 
    P.VerificationStatus, 
    C.Name AS CustomerName
FROM Prescription P
JOIN [Order] O ON P.OrderID = O.OrderID
JOIN Customer C ON O.CustomerID = C.CustomerID;

GO
IF OBJECT_ID('RouteInefficiencyAnalysis', 'V') IS NOT NULL
    DROP VIEW RouteInefficiencyAnalysis;
GO
CREATE VIEW RouteInefficiencyAnalysis AS
SELECT 
    dr.RouteID,
    -- Convert EstimatedTime (time) to total minutes
    DATEPART(HOUR, dr.EstimatedTime) * 60 + DATEPART(MINUTE, dr.EstimatedTime) AS EstimatedDuration,
    ds.StartTime,
    ds.EndTime,
    -- Calculate actual duration in minutes
    DATEDIFF(MINUTE, ds.StartTime, ds.EndTime) AS ActualDuration,
    -- Determine inefficiency status
    CASE 
        WHEN DATEDIFF(MINUTE, ds.StartTime, ds.EndTime) > (DATEPART(HOUR, dr.EstimatedTime) * 60 + DATEPART(MINUTE, dr.EstimatedTime)) THEN 'Delayed'
        WHEN DATEDIFF(MINUTE, ds.StartTime, ds.EndTime) < (DATEPART(HOUR, dr.EstimatedTime) * 60 + DATEPART(MINUTE, dr.EstimatedTime)) THEN 'Early'
        ELSE 'On-Time'
    END AS InefficiencyStatus
FROM DeliveryRoute dr
JOIN DeliverySchedule ds
    ON dr.RouteID = ds.RouteID;
GO