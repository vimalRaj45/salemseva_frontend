import { Capacitor } from '@capacitor/core';
import { Haptics, NotificationType } from '@capacitor/haptics';

class RingtoneAudioService {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
    this.isPlaying = false;
    this.isNative = Capacitor.isNativePlatform();
  }

  initContext() {
    try {
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {
      console.warn('AudioContext init note:', e);
    }
  }

  // Play a single dual-frequency harmonic tone burst (WhatsApp VoIP signature: 753Hz + 852Hz)
  playBurst(startTime, duration = 0.35) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    const frequencies = [753, 852];
    frequencies.forEach((freq) => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        // Smooth attack and decay envelope
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.04);
        gain.gain.setValueAtTime(0.22, startTime + duration - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      } catch (err) {
        console.warn('Oscillator burst error:', err);
      }
    });
  }

  // Rhythmic vibration synced with the dual-burst cadence
  async triggerVibrationPattern() {
    try {
      if (this.isNative) {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([350, 150, 350, 1800]);
      }
    } catch (e) {}
  }

  // Start continuous rhythmic ringing (like WhatsApp call)
  startRinging() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.initContext();

    const runRingCycle = () => {
      if (!this.isPlaying) return;
      this.initContext();

      if (this.audioCtx && this.audioCtx.state === 'running') {
        const now = this.audioCtx.currentTime;
        // First chime burst (350ms)
        this.playBurst(now, 0.35);
        // Second chime burst after 150ms gap (350ms)
        this.playBurst(now + 0.50, 0.35);
      }

      this.triggerVibrationPattern();
    };

    runRingCycle();
    // WhatsApp ringtone cycle repeats every 2.65 seconds
    this.intervalId = setInterval(runRingCycle, 2650);
  }

  // Stop ringing immediately
  stopRinging() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }

    if (this.audioCtx) {
      try {
        if (this.audioCtx.state !== 'closed') {
          this.audioCtx.close();
        }
      } catch (e) {}
      this.audioCtx = null;
    }
  }

  isRinging() {
    return this.isPlaying;
  }

  // Short distinct alert chime for high-priority in-app focus notifications
  playNotificationChime() {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      }
    } catch (e) {
      console.warn('Notification chime error:', e);
    }
  }
}

export const RingtoneService = new RingtoneAudioService();
