USE P4_SCHEMA;
GO

-- Insert data into LockerLocation table
INSERT INTO LockerLocation (Address, City, ZipCode) VALUES
('123 Main St', 'Boston', '02118'),
('456 Elm St', 'Cambridge', '02139'),
('789 Maple St', 'Somerville', '02145'),
('101 Pine St', 'Medford', '02155'),
('202 Oak St', 'Quincy', '02170'),
('303 Cedar St', 'Brookline', '02445'),
('404 Birch St', 'Newton', '02458'),
('505 Spruce St', 'Waltham', '02452'),
('606 Chestnut St', 'Watertown', '02472'),
('707 Walnut St', 'Malden', '02148');

-- Insert data into SmartLocker table
INSERT INTO SmartLocker (LocationID, LockerSize, IsOccupied) VALUES
(1, 'Small', 0),
(2, 'Medium', 1),
(3, 'Large', 0),
(4, 'Small', 1),
(5, 'Medium', 0),
(6, 'Large', 1),
(7, 'Small', 0),
(8, 'Medium', 1),
(9, 'Large', 0),
(10, 'Small', 1);

-- Insert data into LogisticProvider table
INSERT INTO LogisticProvider (Name, ContactNumber, Address, ZipCode, ServiceArea) VALUES
('FastShip', '1234567890', '123 Express Ln, Boston, MA', '02118', 'Greater Boston Area'),
('QuickDeliver', '2345678901', '456 Rapid Rd, Cambridge, MA', '02139', 'Cambridge Area'),
('OnTime', '3456789012', '789 Swift St, Somerville, MA', '02145', 'Somerville Area'),
('FastTrack', '4567890123', '101 Speed Way, Medford, MA', '02155', 'Medford Area'),
('PrimeExpress', '5678901234', '202 Turbo Ave, Quincy, MA', '02170', 'Quincy Area'),
('ShipNow', '6789012345', '303 Rush St, Brookline, MA', '02445', 'Brookline Area'),
('DirectCourier', '7890123456', '404 Pace Blvd, Newton, MA', '02458', 'Newton Area'),
('FlyFast', '8901234567', '505 Quick St, Waltham, MA', '02452', 'Waltham Area'),
('EzyCourier', '9012345678', '606 Accelerate Ave, Watertown, MA', '02472', 'Watertown Area'),
('SureShip', '0123456789', '707 Swift St, Malden, MA', '02148', 'Malden Area');

-- Insert data into DeliveryRoute table
INSERT INTO DeliveryRoute (StartLocation, EndLocation, EstimatedTime) VALUES
('Warehouse A', 'Customer Location X', '08:00:00'),
('Warehouse B', 'Customer Location Y', '09:00:00'),
('Warehouse C', 'Customer Location Z', '07:30:00'),
('Warehouse D', 'Customer Location W', '06:45:00'),
('Warehouse E', 'Customer Location V', '09:15:00'),
('Warehouse F', 'Customer Location U', '10:00:00'),
('Warehouse G', 'Customer Location T', '08:20:00'),
('Warehouse H', 'Customer Location S', '07:50:00'),
('Warehouse I', 'Customer Location R', '06:30:00'),
('Warehouse J', 'Customer Location Q', '09:45:00');

-- Insert data into Customer table
INSERT INTO Customer (Name, Email, PhoneNumber, StreetAddress, ZipCode, City, PreferredLockerLocation, DeliveryPreference) VALUES
('John Doe', 'john.doe@example.com', '1234567890', '123 Main St', '02118', 'Boston', 1, 'Locker Pickup'),
('Jane Smith', 'jane.smith@example.com', '2345678901', '456 Elm St', '02139', 'Cambridge', 2, 'Home Delivery'),
('Sam Brown', 'sam.brown@example.com', '3456789012', '789 Maple St', '02145', 'Somerville', 3, 'Home Delivery'),
('Lisa Black', 'lisa.black@example.com', '4567890123', '101 Pine St', '02155', 'Medford', 4, 'Locker Pickup'),
('Alice Green', 'alice.green@example.com', '5678901234', '202 Oak St', '02170', 'Quincy', 5, 'Locker Pickup'),
('Tom White', 'tom.white@example.com', '6789012345', '303 Cedar St', '02445', 'Brookline', 6, 'Home Delivery'),
('Emma Blue', 'emma.blue@example.com', '7890123456', '404 Birch St', '02458', 'Newton', 7, 'Locker Pickup'),
('Chris Red', 'chris.red@example.com', '8901234567', '505 Spruce St', '02452', 'Waltham', 8, 'Home Delivery'),
('Lucy Gray', 'lucy.gray@example.com', '9012345678', '606 Chestnut St', '02472', 'Watertown', 9, 'Home Delivery'),
('Mark Silver', 'mark.silver@example.com', '0123456789', '707 Walnut St', '02148', 'Malden', 10, 'Locker Pickup');

-- Insert data into Order table
INSERT INTO [Order] (CustomerID, OrderDate, DeliveryDate, OrderStatus, PaymentStatus, PrescriptionRequired) VALUES
(1, '2024-11-01', '2024-11-05', 'Pending', 'Paid', 1),
(2, '2024-11-02', '2024-11-06', 'Shipped', 'Unpaid', 0),
(3, '2024-11-03', '2024-11-07', 'Delivered', 'Paid', 1),
(4, '2024-11-04', '2024-11-08', 'Cancelled', 'Refunded', 0),
(5, '2024-11-05', '2024-11-09', 'Pending', 'Paid', 1),
(6, '2024-11-06', '2024-11-10', 'Shipped', 'Unpaid', 0),
(7, '2024-11-07', '2024-11-11', 'Delivered', 'Paid', 1),
(8, '2024-11-08', '2024-11-12', 'Cancelled', 'Refunded', 0),
(9, '2024-11-09', '2024-11-13', 'Pending', 'Paid', 1),
(10, '2024-11-10', '2024-11-14', 'Shipped', 'Unpaid', 0);

-- Insert data into Prescription table
INSERT INTO Prescription (OrderID, Details, DoctorName, VerificationStatus) VALUES
(1, 'Pain reliever', 'Dr. Smith', 'Verified'),
(2, 'Antibiotic', 'Dr. Lee', 'Pending'),
(3, 'Antidepressant', 'Dr. Adams', 'Rejected'),
(4, 'Blood pressure meds', 'Dr. Wong', 'Verified'),
(5, 'Pain reliever', 'Dr. Smith', 'Pending'),
(6, 'Diabetes meds', 'Dr. Allen', 'Rejected'),
(7, 'Heart meds', 'Dr. Johnson', 'Verified'),
(8, 'Anxiety meds', 'Dr. Brown', 'Pending'),
(9, 'Cholesterol meds', 'Dr. White', 'Rejected'),
(10, 'Allergy meds', 'Dr. Green', 'Verified');

-- Insert data into VerificationCode table
INSERT INTO VerificationCode (ExpirationDate) VALUES
('2024-12-31'),
('2024-12-30'),
('2024-12-29'),
('2024-12-28'),
('2024-12-27'),
('2024-12-26'),
('2024-12-25'),
('2024-12-24'),
('2024-12-23'),
('2024-12-22');

-- Insert data into Vehicle table
INSERT INTO Vehicle (LicensePlate, Model, Capacity, AvailabilityStatus) VALUES
('ABC123', 'Van', 3.5, 1),
('XYZ789', 'Truck', 5.0, 0),
('LMN456', 'Bike', 0.5, 1),
('QRS852', 'Car', 2.0, 1),
('DEF963', 'SUV', 4.0, 0),
('UVW159', 'Van', 3.5, 1),
('GHI258', 'Truck', 5.5, 0),
('JKL357', 'Bike', 0.7, 1),
('MNO456', 'Truck', 6.0, 1),
('PQR789', 'Van', 4.5, 0);

-- Insert data into DeliveryDriver table
INSERT INTO DeliveryDriver (ProviderID, VehicleID, Name, LicenseNumber, AvailabilityStatus) VALUES
(1, 1, 'Tom Hardy', 'LIC12345', 1),
(2, 2, 'Sarah Connor', 'LIC67890', 0),
(3, 3, 'John Wick', 'LIC11121', 1),
(4, 4, 'Bruce Wayne', 'LIC22232', 1),
(5, 5, 'Clark Kent', 'LIC33343', 0),
(6, 6, 'Diana Prince', 'LIC44454', 1),
(7, 7, 'Barry Allen', 'LIC55565', 1),
(8, 8, 'Peter Parker', 'LIC66676', 1),
(9, 9, 'Tony Stark', 'LIC77787', 0),
(10, 10, 'Steve Rogers', 'LIC88898', 1);

-- Insert data into Package table
INSERT INTO Package (OrderID, DriverID, LockerID, DeliveryStatus) VALUES
(1, 1, 1, 'In Transit'),
(2, 2, 2, 'Delivered'),
(3, 3, 3, 'Failed'),
(4, 4, 4, 'In Transit'),
(5, 5, 5, 'Delivered'),
(6, 6, 6, 'Failed'),
(7, 7, 7, 'In Transit'),
(8, 8, 8, 'Delivered'),
(9, 9, 9, 'Failed'),
(10, 10, 10, 'In Transit');

-- Insert data into DeliverySchedule table
INSERT INTO DeliverySchedule (RouteID, DriverID, StartTime, EndTime) VALUES
(1, 1, '2024-11-10 08:00', '2024-11-10 16:00'),
(2, 2, '2024-11-11 09:00', '2024-11-11 17:00'),
(3, 3, '2024-11-12 10:00', '2024-11-12 18:00'),
(4, 4, '2024-11-13 08:30', '2024-11-13 16:30'),
(5, 5, '2024-11-14 09:30', '2024-11-14 17:30'),
(6, 6, '2024-11-15 10:30', '2024-11-15 18:30'),
(7, 7, '2024-11-16 08:15', '2024-11-16 16:15'),
(8, 8, '2024-11-17 09:15', '2024-11-17 17:15'),
(9, 9, '2024-11-18 10:15', '2024-11-18 18:15'),
(10, 10, '2024-11-19 08:45', '2024-11-19 16:45');

-- Insert data into Waypoint table
INSERT INTO Waypoint (RouteID, Location, StopTime) VALUES
(1, 'Checkpoint A1', '2024-11-01 10:30'),
(1, 'Checkpoint A2', '2024-11-01 11:00'),
(2, 'Checkpoint B1', '2024-11-02 10:45'),
(2, 'Checkpoint B2', '2024-11-02 11:15'),
(3, 'Checkpoint C1', '2024-11-03 12:00'),
(3, 'Checkpoint C2', '2024-11-03 12:30'),
(4, 'Checkpoint D1', '2024-11-04 13:00'),
(4, 'Checkpoint D2', '2024-11-04 13:30'),
(5, 'Checkpoint E1', '2024-11-05 14:00'),
(5, 'Checkpoint E2', '2024-11-05 14:30');

select * from Waypoint;
select * from DeliverySchedule;
select * from Vehicle;
select * from DeliveryDriver;
select * from VerificationCode;
select * from Prescription;
select * from [Order];
select * from Customer;
select * from DeliveryRoute;
select * from LogisticProvider;
select * from SmartLocker;
select * from LockerLocation;
