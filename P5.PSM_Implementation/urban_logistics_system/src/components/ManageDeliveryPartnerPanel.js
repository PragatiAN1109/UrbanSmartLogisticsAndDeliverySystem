import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';

const ManageDeliveryPartnerPanel = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [providers, setProviders] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [openDriverForm, setOpenDriverForm] = useState(false);
  const [openVehicleForm, setOpenVehicleForm] = useState(false);

  const [driverFormData, setDriverFormData] = useState({
    providerID: '',
    vehicleID: '',
    name: '',
    licenseNumber: '',
    availabilityStatus: true,
  });

  const [vehicleFormData, setVehicleFormData] = useState({
    licensePlate: '',
    model: '',
    capacity: '',
    availabilityStatus: true,
  });

  // Fetch data for drivers, vehicles, and providers
  useEffect(() => {
    const fetchData = async () => {
        try {
            const driverResponse = await axiosInstance.get('/delivery-drivers');
            console.log('Drivers Data:', driverResponse.data); // Debugging statement
            setDrivers(driverResponse.data);
    
            const vehicleResponse = await axiosInstance.get('/vehicles');
            setVehicles(vehicleResponse.data);
    
            const availableVehicleResponse = await axiosInstance.get(
                '/vehicles?available=true'
            );
            setAvailableVehicles(availableVehicleResponse.data);
    
            const providerResponse = await axiosInstance.get('/logistic-providers');
            setProviders(providerResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const driverResponse = await axiosInstance.get('/delivery-drivers');
        console.log('Drivers Data:', driverResponse.data); // Debugging statement
        setDrivers(driverResponse.data);

        const vehicleResponse = await axiosInstance.get('/vehicles');
        setVehicles(vehicleResponse.data);

        const availableVehicleResponse = await axiosInstance.get(
            '/vehicles?available=true'
        );
        setAvailableVehicles(availableVehicleResponse.data);

        const providerResponse = await axiosInstance.get('/logistic-providers');
        setProviders(providerResponse.data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};


  // Open and close dialogs
  const handleOpenDriverForm = (driver = null) => {
    if (driver) {
        console.log('Driver Data:', driver); // Debugging statement
        setDriverFormData({
            DriverID: driver.DriverID,
            providerID: driver.ProviderID || '', // Ensure this matches the backend field name
            vehicleID: driver.VehicleID || '', // Handle unassigned vehicles
            name: driver.DriverName, // Use correct key for driver name
            licenseNumber: driver.LicenseNumber,
            availabilityStatus: driver.DriverAvailability ? true : false, // Ensure correct boolean handling
        });
    } else {
        setDriverFormData({
            providerID: '',
            vehicleID: '',
            name: '',
            licenseNumber: '',
            availabilityStatus: true,
        });
    }
    setOpenDriverForm(true);
};




  const handleOpenVehicleForm = (vehicle = null) => {
    if (vehicle) {
      setVehicleFormData({
        VehicleID: vehicle.VehicleID,
        licensePlate: vehicle.LicensePlate,
        model: vehicle.Model,
        capacity: vehicle.Capacity,
        availabilityStatus: vehicle.AvailabilityStatus,
      });
    } else {
      setVehicleFormData({
        licensePlate: '',
        model: '',
        capacity: '',
        availabilityStatus: true,
      });
    }
    setOpenVehicleForm(true);
  };

  const handleCloseDriverForm = () => setOpenDriverForm(false);
  const handleCloseVehicleForm = () => setOpenVehicleForm(false);

  // Handle driver form submission
  const handleDriverSubmit = async () => {
    if (
      !driverFormData.providerID ||
      !driverFormData.name ||
      !driverFormData.licenseNumber
    ) {
      alert('Provider, Name, and License Number are required.');
      return;
    }

    try {
      if (driverFormData.DriverID) {
        await axiosInstance.put(
          `/delivery-drivers/${driverFormData.DriverID}`,
          driverFormData
        );
        setDrivers(
          drivers.map((driver) =>
            driver.DriverID === driverFormData.DriverID
              ? driverFormData
              : driver
          )
        );
      } else {
        const response = await axiosInstance.post(
          '/delivery-drivers',
          driverFormData
        );
        setDrivers([...drivers, response.data]);
      }
      handleCloseDriverForm();
      fetchData();
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  // Handle vehicle form submission
  const handleVehicleSubmit = async () => {
    if (
      !vehicleFormData.licensePlate ||
      !vehicleFormData.model ||
      !vehicleFormData.capacity
    ) {
      alert('License Plate, Model, and Capacity are required.');
      return;
    }

    try {
      const payload = {
        licensePlate: vehicleFormData.licensePlate,
        model: vehicleFormData.model,
        capacity: parseFloat(vehicleFormData.capacity), // Ensure it's a number
        availabilityStatus: vehicleFormData.availabilityStatus ? 1 : 0, // Convert to 1/0
      };

      if (vehicleFormData.VehicleID) {
        // Modify vehicle
        await axiosInstance.put(
          `/vehicles/${vehicleFormData.VehicleID}`,
          payload
        );
        setVehicles(
          vehicles.map((vehicle) =>
            vehicle.VehicleID === vehicleFormData.VehicleID
              ? { ...vehicle, ...payload }
              : vehicle
          )
        );
      } else {
        // Add vehicle
        const response = await axiosInstance.post('/vehicles', payload);
        setVehicles([...vehicles, response.data]);
        setAvailableVehicles([...availableVehicles, response.data]); // Add to available vehicles
      }
      handleCloseVehicleForm();
      fetchData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('An error occurred while saving the vehicle.');
    }
  };

  // Handle delete driver
  const handleDeleteDriver = async (id) => {
    try {
      await axiosInstance.delete(`/delivery-drivers/${id}`);
      setDrivers(drivers.filter((driver) => driver.DriverID !== id));
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async (id) => {
    try {
      await axiosInstance.delete(`/vehicles/${id}`);
      setVehicles(vehicles.filter((vehicle) => vehicle.VehicleID !== id));
      setAvailableVehicles(
        availableVehicles.filter((vehicle) => vehicle.VehicleID !== id)
      );
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <h2>Manage Delivery Partners</h2>

      {/* Add Driver Button */}
      <Button
        variant='contained'
        color='primary'
        onClick={() => handleOpenDriverForm()}
        sx={{ marginBottom: 2, marginRight: 2 }}
      >
        Add Driver
      </Button>

      {/* Drivers Table */}
      <h3>Delivery Drivers</h3>
      <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Provider</strong>
              </TableCell>
              <TableCell>
                <strong>Vehicle</strong>
              </TableCell>
              <TableCell>
                <strong>License Number</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.DriverID}>
                <TableCell>{driver.DriverName}</TableCell>
                <TableCell>
                  {driver.LogisticProviderName || 'Unassigned'}
                </TableCell>
                <TableCell>{driver.LicensePlate || 'Unassigned'}</TableCell>
                <TableCell>{driver.LicenseNumber}</TableCell>
                <TableCell>
                  <Button
                    variant='outlined'
                    color='warning'
                    size='small'
                    onClick={() => handleOpenDriverForm(driver)}
                    sx={{ marginRight: 1 }}
                  >
                    Modify
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    size='small'
                    onClick={() => handleDeleteDriver(driver.DriverID)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Vehicles Table */}
      <h3>Vehicles</h3>
      <Button
        variant='contained'
        color='secondary'
        onClick={handleOpenVehicleForm}
        sx={{ marginBottom: 2 }}
      >
        Add Vehicle
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>License Plate</strong>
              </TableCell>
              <TableCell>
                <strong>Model</strong>
              </TableCell>
              <TableCell>
                <strong>Capacity</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.VehicleID}>
                <TableCell>{vehicle.LicensePlate}</TableCell>
                <TableCell>{vehicle.Model}</TableCell>
                <TableCell>{vehicle.Capacity}</TableCell>
                <TableCell>
                  {vehicle.AvailabilityStatus ? 'Available' : 'Assigned'}
                </TableCell>
                <TableCell>
                  <Button
                    variant='outlined'
                    color='warning'
                    size='small'
                    onClick={() => handleOpenVehicleForm(vehicle)}
                    sx={{ marginRight: 1 }}
                  >
                    Modify
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    size='small'
                    onClick={() => handleDeleteVehicle(vehicle.VehicleID)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Modify Driver Dialog */}
      <Dialog open={openDriverForm} onClose={handleCloseDriverForm}>
        <DialogTitle>
          {driverFormData.DriverID ? 'Modify Driver' : 'Add Driver'}
        </DialogTitle>
        <DialogContent>
        <FormControl fullWidth margin="normal">
    <InputLabel>Provider</InputLabel>
    {console.log(driverFormData)}
    <Select
        value={driverFormData.providerID}
        onChange={(e) =>
            setDriverFormData({
                ...driverFormData,
                providerID: e.target.value,
            })
        }
        required
    >
        {providers.map((provider) => (
            <MenuItem key={provider.ProviderID} value={provider.ProviderID}>
                {provider.Name}
            </MenuItem>
        ))}
    </Select>
</FormControl>

<FormControl fullWidth margin="normal">
    <InputLabel>Vehicle</InputLabel>
    <Select
        value={driverFormData.vehicleID}
        onChange={(e) =>
            setDriverFormData({
                ...driverFormData,
                vehicleID: e.target.value,
            })
        }
    >
        {availableVehicles.map((vehicle) => (
            <MenuItem key={vehicle.VehicleID} value={vehicle.VehicleID}>
                {vehicle.LicensePlate}
            </MenuItem>
        ))}
    </Select>
</FormControl>

          <TextField
            label='Name'
            fullWidth
            margin='normal'
            value={driverFormData.name}
            onChange={(e) =>
              setDriverFormData({ ...driverFormData, name: e.target.value })
            }
            required
          />
          <TextField
            label='License Number'
            fullWidth
            margin='normal'
            value={driverFormData.licenseNumber}
            onChange={(e) =>
              setDriverFormData({
                ...driverFormData,
                licenseNumber: e.target.value,
              })
            }
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDriverForm} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={handleDriverSubmit}
            variant='contained'
            color='primary'
          >
            {driverFormData.DriverID ? 'Save Changes' : 'Add Driver'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Vehicle Dialog */}
      <Dialog open={openVehicleForm} onClose={handleCloseVehicleForm}>
        <DialogTitle>Add Vehicle</DialogTitle>
        <DialogContent>
          <TextField
            label='License Plate'
            fullWidth
            margin='normal'
            value={vehicleFormData.licensePlate}
            onChange={(e) =>
              setVehicleFormData({
                ...vehicleFormData,
                licensePlate: e.target.value,
              })
            }
            required
          />
          <TextField
            label='Model'
            fullWidth
            margin='normal'
            value={vehicleFormData.model}
            onChange={(e) =>
              setVehicleFormData({ ...vehicleFormData, model: e.target.value })
            }
            required
          />
          <TextField
            label='Capacity'
            type='number'
            fullWidth
            margin='normal'
            value={vehicleFormData.capacity}
            onChange={(e) =>
              setVehicleFormData({
                ...vehicleFormData,
                capacity: e.target.value,
              })
            }
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVehicleForm} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={handleVehicleSubmit}
            variant='contained'
            color='primary'
          >
            Add Vehicle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageDeliveryPartnerPanel;
