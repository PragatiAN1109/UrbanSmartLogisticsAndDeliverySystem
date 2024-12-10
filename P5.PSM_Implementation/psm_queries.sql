-- Procedures 

-- 1. Retrieve all orders for a customer
CREATE PROCEDURE GetOrdersForCustomer
    @CustomerID INT
AS
BEGIN
    SELECT * 
    FROM [Order]
    WHERE CustomerID = @CustomerID;
END;

GO
-- 2. Update the status of an order
CREATE PROCEDURE UpdateOrderStatus
    @OrderID INT,
    @NewStatus VARCHAR(50)
AS
BEGIN
    UPDATE [Order]
    SET OrderStatus = @NewStatus
    WHERE OrderID = @OrderID;
END;

GO
-- 3. Assign a driver to a delivery route
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
-- 4. Get locker utilization details
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
-- 5. Retrieve prescription details for an order
CREATE PROCEDURE GetPrescriptionDetails
    @OrderID INT
AS
BEGIN
    SELECT * 
    FROM Prescription
    WHERE OrderID = @OrderID;
END;

GO
-- 6. Verify a customer’s access to a smart locker
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



-- VIEWS 

-- 1. View for active delivery schedules
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
CREATE VIEW PrescriptionVerificationStatus AS
SELECT 
    P.PrescriptionID, 
    P.OrderID, 
    P.VerificationStatus, 
    C.Name AS CustomerName
FROM Prescription P
JOIN [Order] O ON P.OrderID = O.OrderID
JOIN Customer C ON O.CustomerID = C.CustomerID;


-- User Defined Functions: UDFs

-- 1. Calculate estimated route time
GO
CREATE FUNCTION CalculateRouteTime(@StartTime DATETIME, @EndTime DATETIME)
RETURNS INT
AS
BEGIN
    RETURN DATEDIFF(MINUTE, @StartTime, @EndTime);
END;

-- 2. Check driver availability
GO
CREATE FUNCTION IsDriverAvailable(@DriverID INT)
RETURNS BIT
AS
BEGIN
    RETURN (SELECT AvailabilityStatus FROM DeliveryDriver WHERE DriverID = @DriverID);
END;

-- 3. Get total orders for a customer
GO
CREATE FUNCTION GetTotalOrders(@CustomerID INT)
RETURNS INT
AS
BEGIN
    RETURN (SELECT COUNT(*) FROM [Order] WHERE CustomerID = @CustomerID);
END;






-- Triggers 

-- Update locker status upon package delivery
GO
CREATE TRIGGER UpdateLockerStatus
ON Package
AFTER INSERT, UPDATE
AS
BEGIN
    UPDATE SmartLocker
    SET IsOccupied = CASE 
        WHEN (SELECT DeliveryStatus FROM inserted) = 'Delivered' THEN 0
        ELSE 1
    END
    WHERE LockerID IN (SELECT LockerID FROM inserted);
END;
