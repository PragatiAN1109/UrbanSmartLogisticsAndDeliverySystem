import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BusinessIcon from '@mui/icons-material/Business';

const Sidebar = () => {
  return (
    <Box
      sx={{
        width: 240,
        minHeight: '100vh',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: 2,
      }}
    >
      <Typography
        variant='h6'
        align='center'
        gutterBottom
        sx={{ color: 'white' }}
      >
        Urban Logistics
      </Typography>
      <Divider sx={{ marginBottom: 2, backgroundColor: '#7f8c8d' }} />
      <List>
        <ListItem
          button
          component={Link}
          to='/'
          sx={{
            '&:hover': { backgroundColor: '#34495e' },
          }}
        >
          <ListItemIcon>
            <DashboardIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary='Dashboard' sx={{ color: 'white' }} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to='/customers'
          sx={{
            '&:hover': { backgroundColor: '#34495e' },
          }}
        >
          <ListItemIcon>
            <PeopleIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary='Customers' sx={{ color: 'white' }} />
        </ListItem>

        <ListItem
          button
          component={Link}
          to='/orders'
          sx={{
            '&:hover': { backgroundColor: '#34495e' },
          }}
        >
          <ListItemIcon>
            <ListAltIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary='Orders' sx={{ color: 'white' }} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to='/prescriptions'
          sx={{
            '&:hover': { backgroundColor: '#34495e' },
          }}
        >
          <ListItemIcon>
            <MedicationOutlinedIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary='Prescriptions' sx={{ color: 'white' }} />
        </ListItem>

        <ListItem
          button
          component={Link}
          to='/logistic-providers'
          sx={{
            '&:hover': { backgroundColor: '#34495e' },
          }}
        >
          <ListItemIcon>
            <BusinessIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary='Logistic Providers' sx={{ color: 'white' }} />
        </ListItem>

        <ListItem
          button
          component={Link}
          to='/manage-delivery-partner'
          sx={{
            '&:hover': { backgroundColor: '#34495e' },
          }}
        >
          <ListItemIcon>
            <LocalShippingIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText
            primary='Manage Delivery Partner'
            sx={{ color: 'white' }}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
