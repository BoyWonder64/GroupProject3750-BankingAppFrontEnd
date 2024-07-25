import React from 'react';
import {Navigate } from 'react-router-dom';
import { useAuth } from '../auth/auth.js';

// Checks if user is admin, redirects if not
const ProtectedRoute = ({ element, role, ...rest }) => {
    const { isAuthenticated, userRole } = useAuth();
  
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }
  
    if (role && userRole !== role) {
      return <Navigate to="/" />; 
    }
  
    return React.cloneElement(element, { ...rest });
  };
  
  export default ProtectedRoute;