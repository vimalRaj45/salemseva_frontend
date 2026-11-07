import React from 'react';
import { Navigate } from 'react-router-dom';

export default function CustomerOnboardingPage() {
  return <Navigate to="/register?role=customer" replace />;
}
