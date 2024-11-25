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
} from '@mui/material';

const CustomerPanel = () => {
  const [customers, setCustomers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    streetAddress: '',
    zipCode: '',
    city: '',
    preferredLockerLocation: '',
    deliveryPreference: '',
  });

  // Fetch customers from the database
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get('/customers');
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Open the Add/Modify dialog
  const handleOpenDialog = (customer = null) => {
    setSelectedCustomer(customer);
    if (customer) {
      setFormData({
        name: customer.Name || '',
        email: customer.Email || '',
        phoneNumber: customer.PhoneNumber || '',
        streetAddress: customer.StreetAddress || '',
        zipCode: customer.ZipCode || '',
        city: customer.City || '',
        preferredLockerLocation: customer.PreferredLockerLocation || '',
        deliveryPreference: customer.DeliveryPreference || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        streetAddress: '',
        zipCode: '',
        city: '',
        preferredLockerLocation: '',
        deliveryPreference: '',
      });
    }
    setOpenForm(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenForm(false);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.email) {
      alert('Name and Email are required.');
      return;
    }

    if (formData.phoneNumber && formData.phoneNumber.length !== 10) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      if (selectedCustomer) {
        // Modify existing customer
        await axiosInstance.put(
          `/customers/${selectedCustomer.CustomerID}`,
          formData
        );
      } else {
        // Add new customer
        await axiosInstance.post('/customers', formData);
      }
      handleCloseDialog();
      fetchCustomers(); // Refetch customers to reflect the latest state
    } catch (error) {
      if (
        error.response &&
        error.response.data.message.includes('UNIQUE constraint')
      ) {
        alert('A customer with this email already exists.');
      } else {
        console.error('Error saving customer:', error);
        alert('An error occurred while saving the customer. Please try again.');
      }
    }
  };

  // Handle delete customer
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/customers/${id}`);
      setCustomers(customers.filter((customer) => customer.CustomerID !== id));
    } catch (error) {
      if (
        error.response &&
        error.response.data.message.includes('REFERENCE constraint')
      ) {
        alert(
          'Cannot delete this customer because there are associated orders. Please delete the related orders first.'
        );
      } else {
        console.error('Error deleting customer:', error);
        alert('An error occurred while trying to delete the customer.');
      }
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <h2>Customer Panel</h2>

      <Button
        variant='contained'
        color='primary'
        onClick={() => handleOpenDialog()}
        sx={{ marginBottom: 2 }}
      >
        Add Customer
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.CustomerID}>
                <TableCell>{customer.CustomerID}</TableCell>
                <TableCell>{customer.Name}</TableCell>
                <TableCell>{customer.Email}</TableCell>
                <TableCell>
                  <Button
                    variant='outlined'
                    color='warning'
                    size='small'
                    onClick={() => handleOpenDialog(customer)}
                    sx={{ marginRight: 1 }}
                  >
                    Modify
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    size='small'
                    onClick={() => handleDelete(customer.CustomerID)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Modify Dialog */}
      <Dialog open={openForm} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedCustomer ? 'Modify Customer' : 'Add Customer'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label='Name'
            fullWidth
            margin='normal'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            error={!formData.name}
            helperText={!formData.name ? 'Name is required.' : ''}
          />
          <TextField
            label='Email'
            fullWidth
            margin='normal'
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            error={!formData.email}
            helperText={!formData.email ? 'Email is required.' : ''}
          />
          <TextField
            label='Phone Number'
            fullWidth
            margin='normal'
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />
          <TextField
            label='Street Address'
            fullWidth
            margin='normal'
            value={formData.streetAddress}
            onChange={(e) =>
              setFormData({ ...formData, streetAddress: e.target.value })
            }
          />
          <TextField
            label='Zip Code'
            fullWidth
            margin='normal'
            value={formData.zipCode}
            onChange={(e) =>
              setFormData({ ...formData, zipCode: e.target.value })
            }
          />
          <TextField
            label='City'
            fullWidth
            margin='normal'
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
          <TextField
            label='Preferred Locker Location'
            fullWidth
            margin='normal'
            value={formData.preferredLockerLocation}
            onChange={(e) =>
              setFormData({
                ...formData,
                preferredLockerLocation: e.target.value,
              })
            }
          />
          <TextField
            label='Delivery Preference'
            fullWidth
            margin='normal'
            value={formData.deliveryPreference}
            onChange={(e) =>
              setFormData({ ...formData, deliveryPreference: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant='contained' color='primary'>
            {selectedCustomer ? 'Save Changes' : 'Add Customer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerPanel;
