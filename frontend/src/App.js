import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Create from './components/create';
import Login from './components/login';
import Logout from './components/logout';
import AccountsInfo from './components/accountSummary';
import BankingSummary from './components/bankingSummary';

const App = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    role: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TESTING RETRIEVAL
    // setAuthState({ isAuthenticated: true, role: 'admin' });
    // setLoading(false);

    fetch('/record/auth-check', {
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setAuthState({ isAuthenticated: true, role: data.role });
      })
      .catch(() => {
        setAuthState({ isAuthenticated: false, role: null });
      })
      .finally(() => setLoading(false));
  }, []);

  const renderProtectedRoute = (Component, requiredRole) => {
    if (loading) return <div>Loading...</div>;

    if (authState.isAuthenticated && (!requiredRole || authState.role === requiredRole)) {
      return <Component />;
    }
    return <Navigate to="/" />;
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create" element={renderProtectedRoute(Create, 'admin')} />
        <Route path="/logout" element={renderProtectedRoute(Logout)} />
        <Route path="/account" element={renderProtectedRoute(AccountsInfo)} />
        <Route path="/summary" element={renderProtectedRoute(BankingSummary)} />
      </Routes>
    </div>
  );
};

export default App;