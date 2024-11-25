import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CustomerPanel from './components/CustomerPanel';
import Dashboard from './components/Dashboard';
import OrdersPanel from './components/OrdersPanel';
import PrescriptionPanel from './components/PrescriptionPanel';
import ManageDeliveryPartnerPanel from './components/ManageDeliveryPartnerPanel';
import LogisticProviderPanel from './components/LogisticProviderPanel';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/customers' element={<CustomerPanel />} />
            <Route path='/orders' element={<OrdersPanel />} />
            <Route path='/prescriptions' element={<PrescriptionPanel />} />
            <Route
              path='/manage-delivery-partner'
              element={<ManageDeliveryPartnerPanel />}
            />
            <Route
              path='/logistic-providers'
              element={<LogisticProviderPanel />}
            />
            {/* Add routes for other panels */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
