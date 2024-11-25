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

const OrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    customerID: '',
    orderDate: '',
    deliveryDate: '',
    orderStatus: '',
    paymentStatus: '',
    prescriptionRequired: false,
  });

  useEffect(() => {
    // Fetch orders and customers
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get('/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get('/customers-dropdown');
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchOrders();
    fetchCustomers();
  }, []);

  const handleOpenDialog = (order = null) => {
    setSelectedOrder(order);
    if (order) {
      setFormData({
        customerID: order.CustomerID || '',
        orderDate: order.OrderDate?.split('T')[0] || '', // Handle date format
        deliveryDate: order.DeliveryDate?.split('T')[0] || '', // Handle date format
        orderStatus: order.OrderStatus || '',
        paymentStatus: order.PaymentStatus || '',
        prescriptionRequired: order.PrescriptionRequired || false,
      });
    } else {
      setFormData({
        customerID: '',
        orderDate: '',
        deliveryDate: '',
        orderStatus: '',
        paymentStatus: '',
        prescriptionRequired: false,
      });
    }
    setOpenForm(true);
  };

  const handleCloseDialog = () => {
    setOpenForm(false);
  };

  const handleSubmit = async () => {
    if (
      !formData.customerID ||
      !formData.orderStatus ||
      !formData.paymentStatus
    ) {
      alert('Customer, Order Status, and Payment Status are required.');
      return;
    }

    try {
      if (selectedOrder) {
        // Update existing order
        await axiosInstance.put(`/orders/${selectedOrder.OrderID}`, formData);
      } else {
        // Add new order
        await axiosInstance.post('/orders', formData);
      }
      // Refetch updated orders
      fetchOrders(); // Ensure fresh data is fetched after update
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('An error occurred while saving the order. Please try again.');
    }
  };

  // Fetch orders function
  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/orders');
      setOrders(response.data); // Update orders list
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/orders/${id}`);
      setOrders(orders.filter((o) => o.OrderID !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('An error occurred while trying to delete the order.');
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <h2>Orders Panel</h2>

      <Button
        variant='contained'
        color='primary'
        onClick={() => handleOpenDialog()}
        sx={{ marginBottom: 2 }}
      >
        Add Order
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Order ID</strong>
              </TableCell>
              <TableCell>
                <strong>Customer</strong>
              </TableCell>
              <TableCell>
                <strong>Order Date</strong>
              </TableCell>
              <TableCell>
                <strong>Delivery Date</strong>
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
            {orders.map((order) => (
              <TableRow key={order.OrderID}>
                <TableCell>{order.OrderID}</TableCell>
                <TableCell>{order.CustomerName}</TableCell>
                <TableCell>{order.OrderDate}</TableCell>
                <TableCell>{order.DeliveryDate}</TableCell>
                <TableCell>{order.OrderStatus}</TableCell>
                <TableCell>
                  <Button
                    variant='outlined'
                    color='warning'
                    size='small'
                    onClick={() => handleOpenDialog(order)}
                    sx={{ marginRight: 1 }}
                  >
                    Modify
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    size='small'
                    onClick={() => handleDelete(order.OrderID)}
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
          {selectedOrder ? 'Modify Order' : 'Add Order'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin='normal'>
            <InputLabel>Customer</InputLabel>
            <Select
              value={formData.customerID}
              onChange={(e) =>
                setFormData({ ...formData, customerID: e.target.value })
              }
              required
            >
              {customers.map((cust) => (
                <MenuItem key={cust.CustomerID} value={cust.CustomerID}>
                  {cust.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label='Order Date'
            type='date'
            fullWidth
            margin='normal'
            InputLabelProps={{ shrink: true }}
            value={formData.orderDate}
            onChange={(e) =>
              setFormData({ ...formData, orderDate: e.target.value })
            }
          />
          <TextField
            label='Delivery Date'
            type='date'
            fullWidth
            margin='normal'
            InputLabelProps={{ shrink: true }}
            value={formData.deliveryDate}
            onChange={(e) =>
              setFormData({ ...formData, deliveryDate: e.target.value })
            }
          />
          <FormControl fullWidth margin='normal'>
            <InputLabel>Order Status</InputLabel>
            <Select
              value={formData.orderStatus}
              onChange={(e) =>
                setFormData({ ...formData, orderStatus: e.target.value })
              }
              required
            >
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Shipped'>Shipped</MenuItem>
              <MenuItem value='Delivered'>Delivered</MenuItem>
              <MenuItem value='Cancelled'>Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin='normal'>
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={formData.paymentStatus}
              onChange={(e) =>
                setFormData({ ...formData, paymentStatus: e.target.value })
              }
              required
            >
              <MenuItem value='Paid'>Paid</MenuItem>
              <MenuItem value='Unpaid'>Unpaid</MenuItem>
              <MenuItem value='Refunded'>Refunded</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin='normal'>
            <InputLabel>Prescription Required</InputLabel>
            <Select
              value={formData.prescriptionRequired}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  prescriptionRequired: e.target.value,
                })
              }
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant='contained' color='primary'>
            {selectedOrder ? 'Save Changes' : 'Add Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersPanel;
