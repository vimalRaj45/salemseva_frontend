import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PartnerOnboardingPage() {
  return <Navigate to="/register?role=partner" replace />;
}
