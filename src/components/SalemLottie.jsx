import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import { Box } from '@mui/material';

import radarScan from '../assets/lottie/radarScan.json';
import bikeEnRoute from '../assets/lottie/bikeEnRoute.json';
import shieldEscrow from '../assets/lottie/shieldEscrow.json';
import bookingSuccess from '../assets/lottie/bookingSuccess.json';

const LOCAL_ANIMATIONS = {
  radar: radarScan,
  ss_radar: radarScan,
  bike: bikeEnRoute,
  shield: shieldEscrow,
  success: bookingSuccess
};

const REMOTE_URLS = {
  tool: 'https://useanimations.com/icons/tool.json',
  customerCare: 'https://assets7.lottiefiles.com/packages/lf20_puciaact.json',
  supportCall: 'https://assets8.lottiefiles.com/packages/lf20_5njp3vgg.json',
  send: 'https://useanimations.com/icons/send.json'
};

export default function SalemLottie({
  name = 'radar',
  url = null,
  animationData = null,
  loop = true,
  autoplay = true,
  width = 180,
  height = 180,
  style = {},
  ariaLabel = 'Shazu One animated illustration'
}) {
  const containerRef = useRef(null);
  const animInstanceRef = useRef(null);

  const targetUrl = url || REMOTE_URLS[name] || null;
  const targetData = animationData || LOCAL_ANIMATIONS[name] || (targetUrl ? null : radarScan);

  useEffect(() => {
    if (!containerRef.current) return;

    if (animInstanceRef.current) {
      animInstanceRef.current.destroy();
    }

    try {
      const config = {
        container: containerRef.current,
        renderer: 'svg',
        loop,
        autoplay
      };

      if (targetUrl) {
        config.path = targetUrl;
      } else if (targetData) {
        config.animationData = targetData;
      }

      animInstanceRef.current = lottie.loadAnimation(config);
    } catch (err) {
      console.warn('Lottie animation render fallback:', err);
    }

    return () => {
      if (animInstanceRef.current) {
        animInstanceRef.current.destroy();
        animInstanceRef.current = null;
      }
    };
  }, [name, targetUrl, targetData, loop, autoplay]);

  return (
    <Box
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      sx={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        overflow: 'hidden',
        ...style
      }}
    />
  );
}
