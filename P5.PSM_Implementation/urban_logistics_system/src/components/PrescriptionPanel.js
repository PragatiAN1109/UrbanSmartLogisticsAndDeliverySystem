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

const PrescriptionPanel = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [formData, setFormData] = useState({
    orderID: '',
    details: '',
    doctorName: '',
    verificationStatus: 'Pending',
  });

  // Fetch prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axiosInstance.get('/prescriptions');
        setPrescriptions(response.data);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get('/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchPrescriptions();
    fetchOrders();
  }, []);

  // Open dialog
  const handleOpenDialog = (prescription = null) => {
    setSelectedPrescription(prescription);
    if (prescription) {
      setFormData({
        orderID: prescription.OrderID,
        details: prescription.Details || '',
        doctorName: prescription.DoctorName || '',
        verificationStatus: prescription.VerificationStatus || 'Pending',
      });
    } else {
      setFormData({
        orderID: '',
        details: '',
        doctorName: '',
        verificationStatus: 'Pending',
      });
    }
    setOpenForm(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenForm(false);
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      if (selectedPrescription) {
        // Update existing prescription
        await axiosInstance.put(
          `/prescriptions/${selectedPrescription.PrescriptionID}`,
          formData
        );
      } else {
        // Add new prescription
        await axiosInstance.post('/prescriptions', formData);
      }
      // Refetch updated prescriptions
      fetchPrescriptions(); // Ensure fresh data is fetched after update
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert(
        'An error occurred while saving the prescription. Please try again.'
      );
    }
  };

  // Fetch prescriptions function
  const fetchPrescriptions = async () => {
    try {
      const response = await axiosInstance.get('/prescriptions');
      setPrescriptions(response.data); // Update prescriptions list
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  // Delete prescription
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/prescriptions/${id}`);
      setPrescriptions(
        prescriptions.filter((pres) => pres.PrescriptionID !== id)
      );
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <h2>Prescription Panel</h2>

      <Button
        variant='contained'
        color='primary'
        onClick={() => handleOpenDialog()}
        sx={{ marginBottom: 2 }}
      >
        Add Prescription
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Order ID</strong>
              </TableCell>
              <TableCell>
                <strong>Doctor Name</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.map((prescription) => (
              <TableRow key={prescription.PrescriptionID}>
                <TableCell>{prescription.PrescriptionID}</TableCell>
                <TableCell>{prescription.OrderID}</TableCell>
                <TableCell>{prescription.DoctorName}</TableCell>
                <TableCell>
                  <Button
                    variant='outlined'
                    color='warning'
                    size='small'
                    onClick={() => handleOpenDialog(prescription)}
                    sx={{ marginRight: 1 }}
                  >
                    Modify
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    size='small'
                    onClick={() => handleDelete(prescription.PrescriptionID)}
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
          {selectedPrescription ? 'Modify Prescription' : 'Add Prescription'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin='normal'>
            <InputLabel>Order ID</InputLabel>
            <Select
              value={formData.orderID}
              onChange={(e) =>
                setFormData({ ...formData, orderID: e.target.value })
              }
            >
              {orders.map((order) => (
                <MenuItem key={order.OrderID} value={order.OrderID}>
                  {order.OrderID} (Customer: {order.CustomerID})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label='Details'
            fullWidth
            margin='normal'
            value={formData.details}
            onChange={(e) =>
              setFormData({ ...formData, details: e.target.value })
            }
          />
          <TextField
            label='Doctor Name'
            fullWidth
            margin='normal'
            value={formData.doctorName}
            onChange={(e) =>
              setFormData({ ...formData, doctorName: e.target.value })
            }
          />
          <FormControl fullWidth margin='normal'>
            <InputLabel>Verification Status</InputLabel>
            <Select
              value={formData.verificationStatus}
              onChange={(e) =>
                setFormData({ ...formData, verificationStatus: e.target.value })
              }
            >
              <MenuItem value='Verified'>Verified</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Rejected'>Rejected</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant='contained' color='primary'>
            {selectedPrescription ? 'Save Changes' : 'Add Prescription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrescriptionPanel;
