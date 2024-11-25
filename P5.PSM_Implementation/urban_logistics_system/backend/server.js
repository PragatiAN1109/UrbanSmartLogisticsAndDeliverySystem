const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MSSQL Configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: true, // Use true for Azure; false for local Docker instances
        trustServerCertificate: true, // Disable SSL certificate verification
    },
};

// Test the database connection
sql.connect(dbConfig)
    .then(() => console.log('Connected to MSSQL database'))
    .catch((err) => console.error('Database connection failed:', err));

// Customer Endpoints
app.get('/customers', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Customer');
        res.json(result.recordset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Customer table
app.post('/customers', async (req, res) => {
    const { name, email, phoneNumber, streetAddress, zipCode, city, preferredLockerLocation, deliveryPreference } = req.body;

    // Validate required fields
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and Email are required.' });
    }

    // Validate phone number length if provided
    if (phoneNumber && phoneNumber.length !== 10) {
        return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }

    try {
        // Insert customer and retrieve the generated CustomerID
        const query = `
            INSERT INTO Customer (Name, Email, PhoneNumber, StreetAddress, ZipCode, City, PreferredLockerLocation, DeliveryPreference)
            OUTPUT INSERTED.CustomerID
            VALUES ('${name}', '${email}', '${phoneNumber}', '${streetAddress}', '${zipCode}', '${city}', ${preferredLockerLocation || 'NULL'}, '${deliveryPreference}')
        `;
        const result = await sql.query(query);

        // Return the generated CustomerID
        res.status(201).json({
            message: 'Customer created successfully',
            CustomerID: result.recordset[0].CustomerID,
        });
    } catch (err) {
        if (err.originalError && err.originalError.info.message.includes('UNIQUE constraint')) {
            res.status(400).json({ message: 'A customer with this email already exists.' });
        } else if (err.originalError && err.originalError.info.message.includes('FOREIGN KEY constraint')) {
            res.status(400).json({ message: 'Preferred Locker Location does not exist. Please select a valid locker.' });
        } else {
            console.error('Error creating customer:', err.message);
            res.status(500).json({ message: 'An error occurred while creating the customer.' });
        }
    }
});

app.get('/customers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`SELECT * FROM Customer WHERE CustomerID = ${id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Customer not found');
        }
    } catch (err) {
        console.error('Error fetching customer:', err.message);
        res.status(500).send('Server error');
    }
});

app.put('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phoneNumber, streetAddress, zipCode, city, preferredLockerLocation, deliveryPreference } = req.body;

    try {
        const result = await sql.query(
            `UPDATE Customer
            SET Name = '${name}', Email = '${email}', PhoneNumber = '${phoneNumber}',
                StreetAddress = '${streetAddress}', ZipCode = '${zipCode}', City = '${city}',
                PreferredLockerLocation = ${preferredLockerLocation}, DeliveryPreference = '${deliveryPreference}'
            WHERE CustomerID = ${id}`
        );
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Customer updated successfully' });
        } else {
            res.status(404).send('Customer not found');
        }
    } catch (err) {
        console.error('Error updating customer:', err.message);
        res.status(500).send('Server error');
    }
});

app.delete('/customers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM Customer WHERE CustomerID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Customer deleted successfully' });
        } else {
            res.status(404).send('Customer not found');
        }
    } catch (err) {
        console.error('Error deleting customer:', err.message);
        res.status(500).send('Server error');
    }
});

// Delivery Driver Endpoints
app.get('/delivery-drivers', async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT 
                dd.DriverID,
                dd.Name AS DriverName,
                dd.LicenseNumber,
                dd.AvailabilityStatus AS DriverAvailability,
                lp.Name AS LogisticProviderName,
                v.LicensePlate,
                v.Model AS VehicleModel
            FROM 
                DeliveryDriver dd
            LEFT JOIN LogisticProvider lp ON dd.ProviderID = lp.ProviderID
            LEFT JOIN Vehicle v ON dd.VehicleID = v.VehicleID;
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ error: 'Failed to fetch delivery drivers' });
    }
});


app.post('/delivery-drivers', async (req, res) => {
    const { providerID, vehicleID, name, licenseNumber, availabilityStatus } = req.body;

    try {
        // Convert boolean `availabilityStatus` to a BIT-compatible value (1 or 0)
        const availabilityStatusBit = availabilityStatus ? 1 : 0;

        const result = await sql.query(
            `INSERT INTO DeliveryDriver (ProviderID, VehicleID, Name, LicenseNumber, AvailabilityStatus)
            VALUES (${providerID}, ${vehicleID || 'NULL'}, '${name}', '${licenseNumber}', ${availabilityStatusBit})`
        );
        res.status(201).json({ message: 'Delivery driver added successfully', result });
    } catch (err) {
        console.error('Error adding delivery driver:', err.message);
        res.status(500).send('Server error');
    }
});


app.get('/delivery-drivers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`SELECT * FROM DeliveryDriver WHERE DriverID = ${id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Delivery driver not found');
        }
    } catch (err) {
        console.error('Error fetching delivery driver:', err.message);
        res.status(500).send('Server error');
    }
});

app.put('/delivery-drivers/:id', async (req, res) => {
    const { id } = req.params;
    const { providerID, vehicleID, name, licenseNumber, availabilityStatus } = req.body;

    try {
        const result = await sql.query(
            `UPDATE DeliveryDriver
            SET ProviderID = ${providerID}, VehicleID = ${vehicleID}, Name = '${name}',
                LicenseNumber = '${licenseNumber}', AvailabilityStatus = ${availabilityStatus}
            WHERE DriverID = ${id}`
        );
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Delivery driver updated successfully' });
        } else {
            res.status(404).send('Delivery driver not found');
        }
    } catch (err) {
        console.error('Error updating delivery driver:', err.message);
        res.status(500).send('Server error');
    }
});

app.delete('/delivery-drivers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM DeliveryDriver WHERE DriverID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Delivery driver deleted successfully' });
        } else {
            res.status(404).send('Delivery driver not found');
        }
    } catch (err) {
        console.error('Error deleting delivery driver:', err.message);
        res.status(500).send('Server error');
    }
});

// DeliveryRoute Endpoints

// Fetch All Delivery Routes
app.get('/delivery-routes', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM DeliveryRoute');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching delivery routes:', err.message);
        res.status(500).send('Server error');
    }
});

// Add a New Delivery Route
app.post('/delivery-routes', async (req, res) => {
    const { startLocation, endLocation, estimatedTime } = req.body;

    try {
        const result = await sql.query(
            `INSERT INTO DeliveryRoute (StartLocation, EndLocation, EstimatedTime)
            VALUES ('${startLocation}', '${endLocation}', '${estimatedTime}')`
        );
        res.status(201).json({ message: 'Delivery route added successfully', result });
    } catch (err) {
        console.error('Error adding delivery route:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch a Single Delivery Route by ID
app.get('/delivery-routes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`SELECT * FROM DeliveryRoute WHERE RouteID = ${id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Delivery route not found');
        }
    } catch (err) {
        console.error('Error fetching delivery route:', err.message);
        res.status(500).send('Server error');
    }
});

// Update a Delivery Route
app.put('/delivery-routes/:id', async (req, res) => {
    const { id } = req.params;
    const { startLocation, endLocation, estimatedTime } = req.body;

    try {
        const result = await sql.query(
            `UPDATE DeliveryRoute
            SET StartLocation = '${startLocation}', EndLocation = '${endLocation}', EstimatedTime = '${estimatedTime}'
            WHERE RouteID = ${id}`
        );
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Delivery route updated successfully' });
        } else {
            res.status(404).send('Delivery route not found');
        }
    } catch (err) {
        console.error('Error updating delivery route:', err.message);
        res.status(500).send('Server error');
    }
});

// Delete a Delivery Route
app.delete('/delivery-routes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM DeliveryRoute WHERE RouteID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Delivery route deleted successfully' });
        } else {
            res.status(404).send('Delivery route not found');
        }
    } catch (err) {
        console.error('Error deleting delivery route:', err.message);
        res.status(500).send('Server error');
    }
});

// DeliverySchedule Endpoints

// Fetch All Delivery Schedules
app.get('/delivery-schedules', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM DeliverySchedule');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching delivery schedules:', err.message);
        res.status(500).send('Server error');
    }
});

// Add a New Delivery Schedule
app.post('/delivery-schedules', async (req, res) => {
    const { routeID, driverID, startTime, endTime } = req.body;

    try {
        const result = await sql.query(
            `INSERT INTO DeliverySchedule (RouteID, DriverID, StartTime, EndTime)
            VALUES (${routeID}, ${driverID}, '${startTime}', '${endTime}')`
        );
        res.status(201).json({ message: 'Delivery schedule added successfully', result });
    } catch (err) {
        console.error('Error adding delivery schedule:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch a Single Delivery Schedule by ID
app.get('/delivery-schedules/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`SELECT * FROM DeliverySchedule WHERE ScheduleID = ${id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Delivery schedule not found');
        }
    } catch (err) {
        console.error('Error fetching delivery schedule:', err.message);
        res.status(500).send('Server error');
    }
});

// Update a Delivery Schedule
app.put('/delivery-schedules/:id', async (req, res) => {
    const { id } = req.params;
    const { routeID, driverID, startTime, endTime } = req.body;

    try {
        const result = await sql.query(
            `UPDATE DeliverySchedule
            SET RouteID = ${routeID}, DriverID = ${driverID}, StartTime = '${startTime}', EndTime = '${endTime}'
            WHERE ScheduleID = ${id}`
        );
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Delivery schedule updated successfully' });
        } else {
            res.status(404).send('Delivery schedule not found');
        }
    } catch (err) {
        console.error('Error updating delivery schedule:', err.message);
        res.status(500).send('Server error');
    }
});

// Delete a Delivery Schedule
app.delete('/delivery-schedules/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM DeliverySchedule WHERE ScheduleID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Delivery schedule deleted successfully' });
        } else {
            res.status(404).send('Delivery schedule not found');
        }
    } catch (err) {
        console.error('Error deleting delivery schedule:', err.message);
        res.status(500).send('Server error');
    }
});

// LockerLocation Endpoints

// Fetch All Locker Locations
app.get('/locker-locations', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM LockerLocation');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching locker locations:', err.message);
        res.status(500).send('Server error');
    }
});

// Add a New Locker Location
app.post('/locker-locations', async (req, res) => {
    const { address, city, zipCode } = req.body;

    try {
        const result = await sql.query(
            `INSERT INTO LockerLocation (Address, City, ZipCode)
            VALUES ('${address}', '${city}', '${zipCode}')`
        );
        res.status(201).json({ message: 'Locker location added successfully', result });
    } catch (err) {
        console.error('Error adding locker location:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch a Single Locker Location by ID
app.get('/locker-locations/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`SELECT * FROM LockerLocation WHERE LocationID = ${id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Locker location not found');
        }
    } catch (err) {
        console.error('Error fetching locker location:', err.message);
        res.status(500).send('Server error');
    }
});

// Update a Locker Location
app.put('/locker-locations/:id', async (req, res) => {
    const { id } = req.params;
    const { address, city, zipCode } = req.body;

    try {
        const result = await sql.query(
            `UPDATE LockerLocation
            SET Address = '${address}', City = '${city}', ZipCode = '${zipCode}'
            WHERE LocationID = ${id}`
        );
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Locker location updated successfully' });
        } else {
            res.status(404).send('Locker location not found');
        }
    } catch (err) {
        console.error('Error updating locker location:', err.message);
        res.status(500).send('Server error');
    }
});

// Delete a Locker Location
app.delete('/locker-locations/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM LockerLocation WHERE LocationID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Locker location deleted successfully' });
        } else {
            res.status(404).send('Locker location not found');
        }
    } catch (err) {
        console.error('Error deleting locker location:', err.message);
        res.status(500).send('Server error');
    }
});

// LogisticProvider Endpoints
// LogisticProvider Endpoints
app.get('/logistic-providers', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM LogisticProvider');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching logistic providers:', err.message);
        res.status(500).send('Server error');
    }
});

app.post('/logistic-providers', async (req, res) => {
    const { name, contactNumber, address, zipCode, serviceArea } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required.' });
    }

    try {
        const result = await sql.query(
            `INSERT INTO LogisticProvider (Name, ContactNumber, Address, ZipCode, ServiceArea)
             OUTPUT INSERTED.ProviderID
             VALUES ('${name}', '${contactNumber}', '${address}', '${zipCode}', '${serviceArea}')`
        );

        // Use OUTPUT clause to get the inserted ID
        const insertedProviderID = result.recordset[0].ProviderID;

        res.status(201).json({
            message: 'Logistic Provider created successfully',
            ProviderID: insertedProviderID,
        });
    } catch (err) {
        console.error('Error creating logistic provider:', err.message);
        res.status(500).send('Server error');
    }
});


app.put('/logistic-providers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, contactNumber, address, zipCode, serviceArea } = req.body;

    try {
        const result = await sql.query(
            `UPDATE LogisticProvider
             SET Name = '${name}', ContactNumber = '${contactNumber}', Address = '${address}', 
                 ZipCode = '${zipCode}', ServiceArea = '${serviceArea}'
             WHERE ProviderID = ${id}`
        );
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Logistic Provider updated successfully' });
        } else {
            res.status(404).send('Logistic Provider not found');
        }
    } catch (err) {
        console.error('Error updating logistic provider:', err.message);
        res.status(500).send('Server error');
    }
});

app.delete('/logistic-providers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM LogisticProvider WHERE ProviderID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Logistic Provider deleted successfully' });
        } else {
            res.status(404).send('Logistic Provider not found');
        }
    } catch (err) {
        console.error('Error deleting logistic provider:', err.message);
        res.status(500).send('Server error');
    }
});


// Order Endpoints

// Fetch All Orders
app.get('/orders', async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT o.*, c.Name AS CustomerName 
            FROM [Order] o
            JOIN Customer c ON o.CustomerID = c.CustomerID
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        res.status(500).send('Server error');
    }
});

// Add a New Order
app.post('/orders', async (req, res) => {
    const { customerID, orderDate, deliveryDate, orderStatus, paymentStatus, prescriptionRequired } = req.body;

    if (!customerID || !orderStatus || !paymentStatus) {
        return res.status(400).json({ message: 'Customer, Order Status, and Payment Status are required.' });
    }

    try {
        const result = await sql.query(`
            INSERT INTO [Order] (CustomerID, OrderDate, DeliveryDate, OrderStatus, PaymentStatus, PrescriptionRequired)
            OUTPUT INSERTED.OrderID
            VALUES (${customerID}, '${orderDate || 'GETDATE()'}', 
                    '${deliveryDate || null}', '${orderStatus}', '${paymentStatus}', ${prescriptionRequired || 0})
        `);
        res.status(201).json({ message: 'Order added successfully', OrderID: result.recordset[0].OrderID });
    } catch (err) {
        console.error('Error adding order:', err.message);
        res.status(500).send('Server error');
    }
});


// Fetch a Single Order by ID
app.get('/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query(`
            SELECT o.*, c.Name AS CustomerName 
            FROM [Order] o
            JOIN Customer c ON o.CustomerID = c.CustomerID
            WHERE o.OrderID = ${id}
        `);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Order not found');
        }
    } catch (err) {
        console.error('Error fetching order:', err.message);
        res.status(500).send('Server error');
    }
});


// Update an Order
app.put('/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { customerID, orderDate, deliveryDate, orderStatus, paymentStatus, prescriptionRequired } = req.body;

    try {
        const result = await sql.query(`
            UPDATE [Order]
            SET CustomerID = ${customerID}, OrderDate = '${orderDate}', DeliveryDate = '${deliveryDate}',
                OrderStatus = '${orderStatus}', PaymentStatus = '${paymentStatus}', PrescriptionRequired = ${prescriptionRequired || 0}
            WHERE OrderID = ${id}
        `);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Order updated successfully' });
        } else {
            res.status(404).send('Order not found');
        }
    } catch (err) {
        console.error('Error updating order:', err.message);
        res.status(500).send('Server error');
    }
});

// Delete an Order
app.delete('/orders/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM [Order] WHERE OrderID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Order deleted successfully' });
        } else {
            res.status(404).send('Order not found');
        }
    } catch (err) {
        console.error('Error deleting order:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch all customers for dropdown
app.get('/customers-dropdown', async (req, res) => {
    try {
        const result = await sql.query('SELECT CustomerID, Name FROM Customer');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching customers:', err.message);
        res.status(500).send('Server error');
    }
});



// Package Endpoints

// Fetch All Packages
app.get('/packages', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Package');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching packages:', err.message);
        res.status(500).send('Server error');
    }
});

// Add a New Package
app.post('/packages', async (req, res) => {
    const { orderID, driverID, lockerID, deliveryStatus } = req.body;

    try {
        const result = await sql.query(
            `INSERT INTO Package (OrderID, DriverID, LockerID, DeliveryStatus)
            VALUES (${orderID}, ${driverID}, ${lockerID}, '${deliveryStatus}')`
        );
        res.status(201).json({ message: 'Package added successfully', result });
    } catch (err) {
        console.error('Error adding package:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch a Single Package by ID
app.get('/packages/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`SELECT * FROM Package WHERE PackageID = ${id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Package not found');
        }
    } catch (err) {
        console.error('Error fetching package:', err.message);
        res.status(500).send('Server error');
    }
});

// Update a Package
app.put('/packages/:id', async (req, res) => {
    const { id } = req.params;
    const { orderID, driverID, lockerID, deliveryStatus } = req.body;

    try {
        const result = await sql.query(
            `UPDATE Package
            SET OrderID = ${orderID}, DriverID = ${driverID}, LockerID = ${lockerID}, DeliveryStatus = '${deliveryStatus}'
            WHERE PackageID = ${id}`
        );
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Package updated successfully' });
        } else {
            res.status(404).send('Package not found');
        }
    } catch (err) {
        console.error('Error updating package:', err.message);
        res.status(500).send('Server error');
    }
});

// Delete a Package
app.delete('/packages/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM Package WHERE PackageID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Package deleted successfully' });
        } else {
            res.status(404).send('Package not found');
        }
    } catch (err) {
        console.error('Error deleting package:', err.message);
        res.status(500).send('Server error');
    }
});

// Prescription Endpoints

// Fetch All Prescriptions
app.get('/prescriptions', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Prescription');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching prescriptions:', err.message);
        res.status(500).send('Server error');
    }
});

// Add a New Prescription
app.post('/prescriptions', async (req, res) => {
    const { orderID, details, doctorName, verificationStatus } = req.body;

    try {
        const result = await sql.query(`
            INSERT INTO Prescription (OrderID, Details, DoctorName, VerificationStatus)
            VALUES (${orderID}, '${details}', '${doctorName}', '${verificationStatus}')
        `);
        res.status(201).json({ message: 'Prescription added successfully', result });
    } catch (err) {
        console.error('Error adding prescription:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch a Single Prescription by ID
app.get('/prescriptions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`SELECT * FROM Prescription WHERE PrescriptionID = ${id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Prescription not found');
        }
    } catch (err) {
        console.error('Error fetching prescription:', err.message);
        res.status(500).send('Server error');
    }
});

// Update a Prescription
app.put('/prescriptions/:id', async (req, res) => {
    const { id } = req.params;
    const { orderID, details, doctorName, verificationStatus } = req.body;

    try {
        const result = await sql.query(`
            UPDATE Prescription
            SET OrderID = ${orderID}, Details = '${details}', DoctorName = '${doctorName}', VerificationStatus = '${verificationStatus}'
            WHERE PrescriptionID = ${id}
        `);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Prescription updated successfully' });
        } else {
            res.status(404).send('Prescription not found');
        }
    } catch (err) {
        console.error('Error updating prescription:', err.message);
        res.status(500).send('Server error');
    }
});

// Delete a Prescription
app.delete('/prescriptions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM Prescription WHERE PrescriptionID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Prescription deleted successfully' });
        } else {
            res.status(404).send('Prescription not found');
        }
    } catch (err) {
        console.error('Error deleting prescription:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch All Orders for Dropdown
app.get('/orders/dropdown', async (req, res) => {
    try {
        const result = await sql.query('SELECT OrderID, CustomerID FROM [Order]');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching orders for dropdown:', err.message);
        res.status(500).send('Server error');
    }
});


// SmartLocker Endpoints

// Fetch All Smart Lockers
app.get('/smart-lockers', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM SmartLocker');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching smart lockers:', err.message);
        res.status(500).send('Server error');
    }
});

// Add a New Smart Locker
app.post('/smart-lockers', async (req, res) => {
    const { locationID, lockerSize, isOccupied } = req.body;

    try {
        const result = await sql.query(
            `INSERT INTO SmartLocker (LocationID, LockerSize, IsOccupied)
            VALUES (${locationID}, '${lockerSize}', ${isOccupied})`
        );
        res.status(201).json({ message: 'Smart locker added successfully', result });
    } catch (err) {
        console.error('Error adding smart locker:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch a Single Smart Locker by ID
app.get('/smart-lockers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`SELECT * FROM SmartLocker WHERE LockerID = ${id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Smart locker not found');
        }
    } catch (err) {
        console.error('Error fetching smart locker:', err.message);
        res.status(500).send('Server error');
    }
});

// Update a Smart Locker
app.put('/smart-lockers/:id', async (req, res) => {
    const { id } = req.params;
    const { locationID, lockerSize, isOccupied } = req.body;

    try {
        const result = await sql.query(
            `UPDATE SmartLocker
            SET LocationID = ${locationID}, LockerSize = '${lockerSize}', IsOccupied = ${isOccupied}
            WHERE LockerID = ${id}`
        );
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Smart locker updated successfully' });
        } else {
            res.status(404).send('Smart locker not found');
        }
    } catch (err) {
        console.error('Error updating smart locker:', err.message);
        res.status(500).send('Server error');
    }
});

// Delete a Smart Locker
app.delete('/smart-lockers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM SmartLocker WHERE LockerID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Smart locker deleted successfully' });
        } else {
            res.status(404).send('Smart locker not found');
        }
    } catch (err) {
        console.error('Error deleting smart locker:', err.message);
        res.status(500).send('Server error');
    }
});

// Vehicle Endpoints

// Fetch All Vehicles
app.get('/vehicles', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Vehicle');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching vehicles:', err.message);
        res.status(500).send('Server error');
    }
});

// Add a New Vehicle
app.post('/vehicles', async (req, res) => {
    const { licensePlate, model, capacity, availabilityStatus } = req.body;

    // Validate required fields
    if (!licensePlate || !model || !capacity || availabilityStatus === undefined) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const query = `
            INSERT INTO Vehicle (LicensePlate, Model, Capacity, AvailabilityStatus)
            VALUES ('${licensePlate}', '${model}', ${capacity}, ${availabilityStatus ? 1 : 0})
        `;
        const result = await sql.query(query);
        res.status(201).json({ message: 'Vehicle added successfully', result });
    } catch (err) {
        console.error('Error adding vehicle:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch a Single Vehicle by ID
app.get('/vehicles/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`SELECT * FROM Vehicle WHERE VehicleID = ${id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Vehicle not found');
        }
    } catch (err) {
        console.error('Error fetching vehicle:', err.message);
        res.status(500).send('Server error');
    }
});

// Update a Vehicle
app.put('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    const { licensePlate, model, capacity, availabilityStatus } = req.body;

    try {
        const result = await sql.query(
            `UPDATE Vehicle
            SET LicensePlate = '${licensePlate}', Model = '${model}', Capacity = ${capacity}, AvailabilityStatus = ${availabilityStatus}
            WHERE VehicleID = ${id}`
        );
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Vehicle updated successfully' });
        } else {
            res.status(404).send('Vehicle not found');
        }
    } catch (err) {
        console.error('Error updating vehicle:', err.message);
        res.status(500).send('Server error');
    }
});

// Delete a Vehicle
app.delete('/vehicles/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM Vehicle WHERE VehicleID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Vehicle deleted successfully' });
        } else {
            res.status(404).send('Vehicle not found');
        }
    } catch (err) {
        console.error('Error deleting vehicle:', err.message);
        res.status(500).send('Server error');
    }
});

// VerificationCode Endpoints

// Fetch All Verification Codes
app.get('/verification-codes', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM VerificationCode');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching verification codes:', err.message);
        res.status(500).send('Server error');
    }
});

// Add a New Verification Code
app.post('/verification-codes', async (req, res) => {
    const { expirationDate, encryptedCode } = req.body;

    try {
        const result = await sql.query(
            `INSERT INTO VerificationCode (ExpirationDate, EncryptedCode)
            VALUES ('${expirationDate}', CAST('${encryptedCode}' AS VARBINARY(MAX)))`
        );
        res.status(201).json({ message: 'Verification code added successfully', result });
    } catch (err) {
        console.error('Error adding verification code:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch a Single Verification Code by ID
app.get('/verification-codes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`SELECT * FROM VerificationCode WHERE VerificationCodeID = ${id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Verification code not found');
        }
    } catch (err) {
        console.error('Error fetching verification code:', err.message);
        res.status(500).send('Server error');
    }
});

// Update a Verification Code
app.put('/verification-codes/:id', async (req, res) => {
    const { id } = req.params;
    const { expirationDate, encryptedCode } = req.body;

    try {
        const result = await sql.query(
            `UPDATE VerificationCode
            SET ExpirationDate = '${expirationDate}', EncryptedCode = CAST('${encryptedCode}' AS VARBINARY(MAX))
            WHERE VerificationCodeID = ${id}`
        );
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Verification code updated successfully' });
        } else {
            res.status(404).send('Verification code not found');
        }
    } catch (err) {
        console.error('Error updating verification code:', err.message);
        res.status(500).send('Server error');
    }
});

// Delete a Verification Code
app.delete('/verification-codes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM VerificationCode WHERE VerificationCodeID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Verification code deleted successfully' });
        } else {
            res.status(404).send('Verification code not found');
        }
    } catch (err) {
        console.error('Error deleting verification code:', err.message);
        res.status(500).send('Server error');
    }
});

// Waypoint Endpoints

// Fetch All Waypoints
app.get('/waypoints', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Waypoint');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching waypoints:', err.message);
        res.status(500).send('Server error');
    }
});

// Add a New Waypoint
app.post('/waypoints', async (req, res) => {
    const { routeID, location, stopTime } = req.body;

    try {
        const result = await sql.query(
            `INSERT INTO Waypoint (RouteID, Location, StopTime)
            VALUES (${routeID}, '${location}', '${stopTime}')`
        );
        res.status(201).json({ message: 'Waypoint added successfully', result });
    } catch (err) {
        console.error('Error adding waypoint:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch a Single Waypoint by ID
app.get('/waypoints/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`SELECT * FROM Waypoint WHERE WaypointID = ${id}`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Waypoint not found');
        }
    } catch (err) {
        console.error('Error fetching waypoint:', err.message);
        res.status(500).send('Server error');
    }
});

// Update a Waypoint
app.put('/waypoints/:id', async (req, res) => {
    const { id } = req.params;
    const { routeID, location, stopTime } = req.body;

    try {
        const result = await sql.query(
            `UPDATE Waypoint
            SET RouteID = ${routeID}, Location = '${location}', StopTime = '${stopTime}'
            WHERE WaypointID = ${id}`
        );
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Waypoint updated successfully' });
        } else {
            res.status(404).send('Waypoint not found');
        }
    } catch (err) {
        console.error('Error updating waypoint:', err.message);
        res.status(500).send('Server error');
    }
});

// Delete a Waypoint
app.delete('/waypoints/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql.query(`DELETE FROM Waypoint WHERE WaypointID = ${id}`);
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Waypoint deleted successfully' });
        } else {
            res.status(404).send('Waypoint not found');
        }
    } catch (err) {
        console.error('Error deleting waypoint:', err.message);
        res.status(500).send('Server error');
    }
});


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}');
}); 

// get available vehicles
app.get('/available-vehicles', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Vehicle WHERE VehicleID NOT IN (SELECT VehicleID FROM DeliveryDriver WHERE VehicleID IS NOT NULL)');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching available vehicles:', err.message);
        res.status(500).send('Server error');
    }
});
