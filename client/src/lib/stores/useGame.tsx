import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended";
export type GameState = "menu" | "transition" | "character" | "game" | "combat" | "puzzle" | "inventory" | "loading" | "navigation";
export type GameMode = "exploration" | "flying" | "landed" | "dialogue";

interface GameStore {
  phase: GamePhase;
  state: GameState;
  mode: GameMode;
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  
  // State transitions
  setState: (state: GameState) => void;
  setMode: (mode: GameMode) => void;
  
  // Space exploration specific
  showNavigationConsole: boolean;
  toggleNavigationConsole: () => void;
  
  // Landing and exploration
  activePlanetId: string | null;
  activePointOfInterest: string | null;
  setActivePlanet: (planetId: string | null) => void;
  setActivePointOfInterest: (poiId: string | null) => void;
  
  // User preferences
  mobileControlType: 'joystick' | 'swipe';
  setMobileControlType: (type: 'joystick' | 'swipe') => void;
  
  // UI transparency
  controlsOpacity: number;
  setControlsOpacity: (opacity: number) => void;
}

export const useGame = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    state: "loading",
    mode: "exploration",
    showNavigationConsole: false,
    activePlanetId: null,
    activePointOfInterest: null,
    mobileControlType: 'joystick', // Default to joystick controls
    controlsOpacity: 0.7, // Default opacity (70%)
    
    start: () => {
      set((state) => {
        console.log("Starting new game");
        // Only transition from ready to playing
        if (state.phase === "ready") {
          return { 
            phase: "playing",
            state: "transition" 
          };
        }
        return {};
      });
    },
    
    restart: () => {
      set(() => ({ 
        phase: "ready",
        state: "menu"
      }));
      console.log("Game restarted");
    },
    
    end: () => {
      set((state) => {
        // Only transition from playing to ended
        if (state.phase === "playing") {
          return { phase: "ended" };
        }
        return {};
      });
      console.log("Game ended");
    },
    
    setState: (newState: GameState) => {
      set({ state: newState });
      console.log("Current game state:", newState);
    },
    
    setMode: (newMode: GameMode) => {
      set({ mode: newMode });
      console.log("Current game mode:", newMode);
    },
    
    toggleNavigationConsole: () => {
      set((state) => ({ 
        showNavigationConsole: !state.showNavigationConsole 
      }));
      console.log("Navigation console:", !get().showNavigationConsole);
    },
    
    setActivePlanet: (planetId: string | null) => {
      set({ activePlanetId: planetId });
      if (planetId) {
        set({ mode: "landed" });
        console.log(`Landed on planet: ${planetId}`);
      } else {
        set({ mode: "flying" });
        console.log("Returned to space");
      }
    },
    
    setActivePointOfInterest: (poiId: string | null) => {
      set({ activePointOfInterest: poiId });
      console.log(`Active POI: ${poiId || "none"}`);
    },
    
    // Mobile controls preference
    setMobileControlType: (type: 'joystick' | 'swipe') => {
      set({ mobileControlType: type });
      console.log(`Mobile control type set to: ${type}`);
    },
    
    // UI controls opacity
    setControlsOpacity: (opacity: number) => {
      // Ensure opacity is between 0.2 and 1.0
      const validOpacity = Math.min(Math.max(opacity, 0.2), 1.0);
      set({ controlsOpacity: validOpacity });
      console.log(`Controls opacity set to: ${validOpacity}`);
    }
  }))
);
