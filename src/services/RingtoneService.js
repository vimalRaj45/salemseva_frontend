import { Capacitor } from '@capacitor/core';
import { Haptics, NotificationType } from '@capacitor/haptics';

class RingtoneAudioService {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
    this.isPlaying = false;
    this.isNative = Capacitor.isNativePlatform();
    this.isUnlocked = typeof localStorage !== 'undefined' && localStorage.getItem('shazuone_audio_unlocked') === 'true';
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

  // Explicit user gesture unlocker for Mobile Chrome, iOS Safari & PWA
  async unlockAudio() {
    try {
      this.initContext();
      if (this.audioCtx) {
        if (this.audioCtx.state === 'suspended') {
          await this.audioCtx.resume();
        }
        // Play an imperceptible 1ms silent buffer to fully unlock hardware pipeline
        const buffer = this.audioCtx.createBuffer(1, 1, 22050);
        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioCtx.destination);
        source.start(0);

        this.isUnlocked = true;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('shazuone_audio_unlocked', 'true');
        }
      }
      return true;
    } catch (err) {
      console.warn('Audio unlock note:', err);
      return false;
    }
  }

  // Dual-frequency harmonic tone burst (WhatsApp VoIP signature: 753Hz + 852Hz)
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

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.24, startTime + 0.04);
        gain.gain.setValueAtTime(0.24, startTime + duration - 0.05);
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

  // Continuous rhythmic ringing for incoming VoIP calls (WhatsApp-style cadence)
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

  // Customer Order Status Update Chime ("Order is on its way!", "Technician arrived")
  playOrderStatusChime() {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Ascending musical triad: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
      const notes = [
        { freq: 523.25, time: now, dur: 0.12 },
        { freq: 659.25, time: now + 0.10, dur: 0.14 },
        { freq: 783.99, time: now + 0.22, dur: 0.28 }
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.exponentialRampToValueAtTime(0.22, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + dur);
      });

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 80, 150]);
      }
    } catch (e) {
      console.warn('Order status chime error:', e);
    }
  }

  // High-priority job assigned alert for technicians
  playJobDispatchChime() {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Upbeat double chime: 880Hz -> 1320Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (e) {
      console.warn('Job dispatch chime error:', e);
    }
  }

  // Short distinct alert chime for chat messages
  playMessageChime() {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5 note

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80]);
      }
    } catch (e) {
      console.warn('Message chime error:', e);
    }
  }

  playNotificationChime() {
    this.playOrderStatusChime();
  }
}

export const RingtoneService = new RingtoneAudioService();
