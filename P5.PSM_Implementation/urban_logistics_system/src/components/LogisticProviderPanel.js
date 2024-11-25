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

const LogisticProviderPanel = () => {
    const [providers, setProviders] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        address: '',
        zipCode: '',
        serviceArea: '',
    });

    // Fetch providers data
    const fetchProviders = async () => {
        try {
            const response = await axiosInstance.get('/logistic-providers');
            setProviders(response.data);
        } catch (error) {
            console.error('Error fetching providers:', error);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    // Open form for Add or Edit
    const handleOpenDialog = (provider = null) => {
        setSelectedProvider(provider);
        if (provider) {
            setFormData({
                name: provider.Name,
                contactNumber: provider.ContactNumber || '',
                address: provider.Address || '',
                zipCode: provider.ZipCode || '',
                serviceArea: provider.ServiceArea || '',
            });
        } else {
            setFormData({
                name: '',
                contactNumber: '',
                address: '',
                zipCode: '',
                serviceArea: '',
            });
        }
        setOpenForm(true);
    };

    const handleCloseDialog = () => {
        setOpenForm(false);
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            alert('Name is required.');
            return;
        }

        try {
            if (selectedProvider) {
                // Update provider
                await axiosInstance.put(`/logistic-providers/${selectedProvider.ProviderID}`, formData);
            } else {
                // Add new provider
                await axiosInstance.post('/logistic-providers', formData);
            }
            fetchProviders();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving provider:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/logistic-providers/${id}`);
            setProviders(providers.filter((provider) => provider.ProviderID !== id));
        } catch (error) {
            console.error('Error deleting provider:', error);
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <h2>Logistic Providers</h2>
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenDialog()}
                sx={{ marginBottom: 2 }}
            >
                Add Logistic Provider
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Contact</strong></TableCell>
                            <TableCell><strong>Address</strong></TableCell>
                            <TableCell><strong>Zip Code</strong></TableCell>
                            <TableCell><strong>Service Area</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {providers.map((provider) => (
                            <TableRow key={provider.ProviderID}>
                                <TableCell>{provider.ProviderID}</TableCell>
                                <TableCell>{provider.Name}</TableCell>
                                <TableCell>{provider.ContactNumber || 'N/A'}</TableCell>
                                <TableCell>{provider.Address || 'N/A'}</TableCell>
                                <TableCell>{provider.ZipCode || 'N/A'}</TableCell>
                                <TableCell>{provider.ServiceArea || 'N/A'}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        size="small"
                                        onClick={() => handleOpenDialog(provider)}
                                        sx={{ marginRight: 1 }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => handleDelete(provider.ProviderID)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={openForm} onClose={handleCloseDialog}>
                <DialogTitle>{selectedProvider ? 'Edit Provider' : 'Add Provider'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        fullWidth
                        margin="normal"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <TextField
                        label="Contact Number"
                        fullWidth
                        margin="normal"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    />
                    <TextField
                        label="Address"
                        fullWidth
                        margin="normal"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <TextField
                        label="Zip Code"
                        fullWidth
                        margin="normal"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    />
                    <TextField
                        label="Service Area"
                        fullWidth
                        margin="normal"
                        value={formData.serviceArea}
                        onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedProvider ? 'Save Changes' : 'Add Provider'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LogisticProviderPanel;
