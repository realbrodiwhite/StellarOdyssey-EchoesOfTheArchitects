import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  alarmSound: HTMLAudioElement | null;
  explosionSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setAlarmSound: (sound: HTMLAudioElement) => void;
  setExplosionSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playAlarm: () => void;
  playExplosion: () => void;
}

export const useAudio = create<AudioState>()(
  persist(
    (set, get) => ({
      backgroundMusic: null,
      hitSound: null,
      successSound: null,
      alarmSound: null,
      explosionSound: null,
      isMuted: false, // Start unmuted by default
      
      setBackgroundMusic: (music) => set({ backgroundMusic: music }),
      setHitSound: (sound) => set({ hitSound: sound }),
      setSuccessSound: (sound) => set({ successSound: sound }),
      setAlarmSound: (sound) => set({ alarmSound: sound }),
      setExplosionSound: (sound) => set({ explosionSound: sound }),
      
      toggleMute: () => {
        const { isMuted, backgroundMusic } = get();
        const newMutedState = !isMuted;
        
        // Update the muted state
        set({ isMuted: newMutedState });
        
        // Log the change
        console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
        
        // Update background music playback if it exists
        if (backgroundMusic) {
          if (newMutedState) {
            backgroundMusic.pause();
          } else {
            backgroundMusic.play().catch(error => {
              console.log("Background music autoplay prevented:", error);
            });
          }
        }
      },
      
      playHit: () => {
        const { hitSound, isMuted } = get();
        if (hitSound) {
          // If sound is muted, don't play anything
          if (isMuted) {
            console.log("Hit sound skipped (muted)");
            return;
          }
          
          // Clone the sound to allow overlapping playback
          const soundClone = hitSound.cloneNode() as HTMLAudioElement;
          soundClone.volume = 0.3;
          soundClone.play().catch(error => {
            console.log("Hit sound play prevented:", error);
          });
        }
      },
      
      playSuccess: () => {
        const { successSound, isMuted } = get();
        if (successSound) {
          // If sound is muted, don't play anything
          if (isMuted) {
            console.log("Success sound skipped (muted)");
            return;
          }
          
          successSound.currentTime = 0;
          successSound.play().catch(error => {
            console.log("Success sound play prevented:", error);
          });
        }
      },
      
      playAlarm: () => {
        const { alarmSound, isMuted } = get();
        if (alarmSound) {
          // If sound is muted, don't play anything
          if (isMuted) {
            console.log("Alarm sound skipped (muted)");
            return;
          }
          
          alarmSound.currentTime = 0;
          alarmSound.loop = true;
          alarmSound.volume = 0.5;
          alarmSound.play().catch(error => {
            console.log("Alarm sound play prevented:", error);
          });
        }
      },
      
      playExplosion: () => {
        const { explosionSound, isMuted } = get();
        if (explosionSound) {
          // If sound is muted, don't play anything
          if (isMuted) {
            console.log("Explosion sound skipped (muted)");
            return;
          }
          
          // Clone the sound to allow overlapping playback
          const soundClone = explosionSound.cloneNode() as HTMLAudioElement;
          soundClone.volume = 0.4;
          soundClone.play().catch(error => {
            console.log("Explosion sound play prevented:", error);
          });
        }
      }
    }),
    {
      name: "audio-settings", // localStorage key
      partialize: (state) => ({ isMuted: state.isMuted }), // only persist the muted state
    }
  )
);
