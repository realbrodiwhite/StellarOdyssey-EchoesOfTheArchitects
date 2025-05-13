import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Location } from "../types";
import { gameLocations } from "../data/locations";

interface StoryState {
  currentLocationId: string;
  visitedLocations: string[];
  storyFlags: Record<string, boolean>;
  dialogueHistory: string[];
  questProgress: Record<string, any>;
  
  // Location management
  getCurrentLocation: () => Location | undefined;
  moveToLocation: (locationId: string) => boolean;
  canTravelTo: (locationId: string) => boolean;
  
  // Story progression
  setStoryFlag: (flag: string, value: boolean) => void;
  checkStoryFlag: (flag: string) => boolean;
  addDialogue: (text: string) => void;
  updateQuestProgress: (questId: string, progress: any) => void;
  
  // Game state
  resetStory: () => void;
}

export const useStory = create<StoryState>()(
  persist(
    (set, get) => ({
      currentLocationId: "ship", // Start at the ship
      visitedLocations: ["ship"],
      storyFlags: {
        gameStarted: false,
        metFirstAlien: false,
        discoveredArtifact: false,
        accessedInnerSanctum: false,
        completedMainQuest: false
      },
      dialogueHistory: [],
      questProgress: {},
      
      getCurrentLocation: () => {
        const locationId = get().currentLocationId;
        return gameLocations.find(loc => loc.id === locationId);
      },
      
      moveToLocation: (locationId) => {
        // Check if player can travel to this location
        if (!get().canTravelTo(locationId)) {
          return false;
        }
        
        // Update current location
        set(state => ({
          currentLocationId: locationId,
          visitedLocations: state.visitedLocations.includes(locationId)
            ? state.visitedLocations
            : [...state.visitedLocations, locationId]
        }));
        
        return true;
      },
      
      canTravelTo: (locationId) => {
        const currentLocation = get().getCurrentLocation();
        
        // Can't travel if current location doesn't exist
        if (!currentLocation) return false;
        
        // Check if target location is connected to current location
        return currentLocation.connections.includes(locationId);
      },
      
      setStoryFlag: (flag, value) => {
        set(state => ({
          storyFlags: {
            ...state.storyFlags,
            [flag]: value
          }
        }));
      },
      
      checkStoryFlag: (flag) => {
        return get().storyFlags[flag] || false;
      },
      
      addDialogue: (text) => {
        set(state => ({
          dialogueHistory: [...state.dialogueHistory, text]
        }));
      },
      
      updateQuestProgress: (questId, progress) => {
        set(state => ({
          questProgress: {
            ...state.questProgress,
            [questId]: progress
          }
        }));
      },
      
      resetStory: () => {
        set({
          currentLocationId: "ship",
          visitedLocations: ["ship"],
          storyFlags: {
            gameStarted: false,
            metFirstAlien: false,
            discoveredArtifact: false,
            accessedInnerSanctum: false,
            completedMainQuest: false
          },
          dialogueHistory: [],
          questProgress: {}
        });
      }
    }),
    {
      name: "story-storage", // name of the item in localStorage
      partialize: (state) => ({
        currentLocationId: state.currentLocationId,
        visitedLocations: state.visitedLocations,
        storyFlags: state.storyFlags,
        questProgress: state.questProgress
      }),
    }
  )
);
