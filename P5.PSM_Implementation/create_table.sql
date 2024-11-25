-- Create Database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'P4_SCHEMA')
BEGIN
    CREATE DATABASE P4_SCHEMA;
END
GO

USE P4_SCHEMA;
GO

-- Drop each table individually in reverse order of dependencies
IF OBJECT_ID('dbo.Waypoint', 'U') IS NOT NULL DROP TABLE Waypoint;
IF OBJECT_ID('dbo.DeliverySchedule', 'U') IS NOT NULL DROP TABLE DeliverySchedule;
IF OBJECT_ID('dbo.Package', 'U') IS NOT NULL DROP TABLE Package;
IF OBJECT_ID('dbo.Prescription', 'U') IS NOT NULL DROP TABLE Prescription;
IF OBJECT_ID('dbo.VerificationCode', 'U') IS NOT NULL DROP TABLE VerificationCode;
IF OBJECT_ID('dbo.[Order]', 'U') IS NOT NULL DROP TABLE [Order];
IF OBJECT_ID('dbo.Customer', 'U') IS NOT NULL DROP TABLE Customer;
IF OBJECT_ID('dbo.DeliveryDriver', 'U') IS NOT NULL DROP TABLE DeliveryDriver;
IF OBJECT_ID('dbo.Vehicle', 'U') IS NOT NULL DROP TABLE Vehicle;
IF OBJECT_ID('dbo.LogisticProvider', 'U') IS NOT NULL DROP TABLE LogisticProvider;
IF OBJECT_ID('dbo.SmartLocker', 'U') IS NOT NULL DROP TABLE SmartLocker;
IF OBJECT_ID('dbo.LockerLocation', 'U') IS NOT NULL DROP TABLE LockerLocation;
IF OBJECT_ID('dbo.DeliveryRoute', 'U') IS NOT NULL DROP TABLE DeliveryRoute;

-- Creating LockerLocation Table
CREATE TABLE LockerLocation (
    LocationID INT PRIMARY KEY IDENTITY(1,1),
    Address VARCHAR(255) NOT NULL,
    City VARCHAR(100) NOT NULL,
    ZipCode VARCHAR(10)
);

-- Creating SmartLocker Table
CREATE TABLE SmartLocker (
    LockerID INT PRIMARY KEY IDENTITY(1,1),
    LocationID INT NOT NULL,
    LockerSize VARCHAR(20) CHECK (LockerSize IN ('Small', 'Medium', 'Large')),
    IsOccupied BIT DEFAULT 0,
    FOREIGN KEY (LocationID) REFERENCES LockerLocation(LocationID)
);

-- Creating LogisticProvider Table
CREATE TABLE LogisticProvider (
    ProviderID INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(100) NOT NULL,
    ContactNumber VARCHAR(15),
    Address VARCHAR(255),
    ZipCode VARCHAR(10),
    ServiceArea VARCHAR(100)
);

-- Creating Vehicle Table 
CREATE TABLE Vehicle (
    VehicleID INT PRIMARY KEY IDENTITY(1,1),
    LicensePlate VARCHAR(15) NOT NULL UNIQUE,
    Model VARCHAR(50),
    Capacity DECIMAL(5, 2) CHECK (Capacity > 0),
    AvailabilityStatus BIT DEFAULT 1
);

-- Creating DeliveryRoute Table
CREATE TABLE DeliveryRoute (
    RouteID INT PRIMARY KEY IDENTITY(1,1),
    StartLocation VARCHAR(255) NOT NULL,
    EndLocation VARCHAR(255) NOT NULL,
    EstimatedTime TIME
);

-- Creating Customer Table (references SmartLocker)
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PhoneNumber VARCHAR(15),
    StreetAddress VARCHAR(255),
    ZipCode VARCHAR(10),
    City VARCHAR(100),
    PreferredLockerLocation INT,
    DeliveryPreference VARCHAR(50),
    CHECK (LEN(PhoneNumber) = 10),
    FOREIGN KEY (PreferredLockerLocation) REFERENCES SmartLocker(LockerID)
);

-- Creating Order Table (references Customer)
CREATE TABLE [Order] (
    OrderID INT PRIMARY KEY IDENTITY(1,1),
    CustomerID INT NOT NULL,
    OrderDate DATETIME DEFAULT GETDATE(),
    DeliveryDate DATETIME,
    OrderStatus VARCHAR(50) CHECK (OrderStatus IN ('Pending', 'Shipped', 'Delivered', 'Cancelled')),
    PaymentStatus VARCHAR(50) CHECK (PaymentStatus IN ('Paid', 'Unpaid', 'Refunded')),
    PrescriptionRequired BIT DEFAULT 0,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

-- Creating Prescription Table (references Order)
CREATE TABLE Prescription (
    PrescriptionID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL,
    Details TEXT,
    DoctorName VARCHAR(100),
    VerificationStatus VARCHAR(50) CHECK (VerificationStatus IN ('Verified', 'Pending', 'Rejected')),
    FOREIGN KEY (OrderID) REFERENCES [Order](OrderID)
);

-- Creating VerificationCode Table
CREATE TABLE VerificationCode (
    VerificationCodeID INT PRIMARY KEY IDENTITY(1,1),
    ExpirationDate DATETIME NOT NULL,
    EncryptedCode VARBINARY(MAX) -- Added to store encrypted data
);

-- Creating DeliveryDriver Table (references LogisticProvider and Vehicle)
CREATE TABLE DeliveryDriver (
    DriverID INT PRIMARY KEY IDENTITY(1,1),
    ProviderID INT NOT NULL,
    VehicleID INT, 
    Name VARCHAR(100) NOT NULL,
    LicenseNumber VARCHAR(20) UNIQUE NOT NULL,
    AvailabilityStatus BIT DEFAULT 1,
    FOREIGN KEY (ProviderID) REFERENCES LogisticProvider(ProviderID),
    FOREIGN KEY (VehicleID) REFERENCES Vehicle(VehicleID)
);

-- Creating Package Table (references Order, DeliveryDriver, SmartLocker)
CREATE TABLE Package (
    PackageID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL,
    DriverID INT,
    LockerID INT,
    DeliveryStatus VARCHAR(50) CHECK (DeliveryStatus IN ('In Transit', 'Delivered', 'Failed')),
    FOREIGN KEY (OrderID) REFERENCES [Order](OrderID),
    FOREIGN KEY (DriverID) REFERENCES DeliveryDriver(DriverID),
    FOREIGN KEY (LockerID) REFERENCES SmartLocker(LockerID)
);

-- Creating DeliverySchedule Table (references DeliveryRoute and DeliveryDriver)
CREATE TABLE DeliverySchedule (
    ScheduleID INT PRIMARY KEY IDENTITY(1,1),
    RouteID INT NOT NULL,
    DriverID INT NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME,
    FOREIGN KEY (RouteID) REFERENCES DeliveryRoute(RouteID),
    FOREIGN KEY (DriverID) REFERENCES DeliveryDriver(DriverID)
);

-- Creating Waypoint Table (references DeliveryRoute)
CREATE TABLE Waypoint (
    WaypointID INT PRIMARY KEY IDENTITY(1,1),
    RouteID INT NOT NULL,
    Location VARCHAR(255) NOT NULL,
    StopTime DATETIME,
    FOREIGN KEY (RouteID) REFERENCES DeliveryRoute(RouteID)
);
