
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

const Index = () => {
  // Redirect to Dashboard or Login based on authentication status
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default Index;
