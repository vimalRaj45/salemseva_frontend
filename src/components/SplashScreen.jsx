import React, { useEffect } from 'react';
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import BrandLoadingScreen from './BrandLoadingScreen';

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    // Hide native platform splash immediately
    if (Capacitor.isNativePlatform()) {
      try {
        CapacitorSplashScreen.hide();
      } catch (e) {
        // Safe fallback in web environments
      }
    }
  }, []);

  return (
    <BrandLoadingScreen
      open={true}
      mode="splash"
      duration={1450}
      onFinish={onFinish}
    />
  );
}
