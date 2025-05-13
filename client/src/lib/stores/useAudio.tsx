import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
}

export const useAudio = create<AudioState>()(
  persist(
    (set, get) => ({
      backgroundMusic: null,
      hitSound: null,
      successSound: null,
      isMuted: false, // Start unmuted by default
      
      setBackgroundMusic: (music) => set({ backgroundMusic: music }),
      setHitSound: (sound) => set({ hitSound: sound }),
      setSuccessSound: (sound) => set({ successSound: sound }),
      
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
      }
    }),
    {
      name: "audio-settings", // localStorage key
      partialize: (state) => ({ isMuted: state.isMuted }), // only persist the muted state
    }
  )
);
