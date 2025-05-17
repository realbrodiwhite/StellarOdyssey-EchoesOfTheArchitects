import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StorylineTheme } from '../data/mission-pool';

// Define the states for game progression
export enum GameStage {
  Intro = 'intro',
  Act1 = 'act1',
  Cutscene1 = 'cutscene1',
  Act2 = 'act2',
  Cutscene2 = 'cutscene2',
  Act3 = 'act3',
  Cutscene3 = 'cutscene3',
  Act4 = 'act4', 
  Cutscene4 = 'cutscene4',
  Act5 = 'act5',
  Cutscene5 = 'cutscene5',
  Outro = 'outro',
  Complete = 'complete'
}

// Record to keep track of mission completion for each act
interface ActProgress {
  actNumber: number;
  spaceMissions: number; // completed space missions
  landMissions: number;  // completed land missions
  requiredSpace: number; // required space missions to complete
  requiredLand: number;  // required land missions to complete
  completed: boolean;    // whether act is completed
}

// Store state definition
interface GameProgressState {
  // Current progress
  currentStage: GameStage;
  actProgress: Record<number, ActProgress>;
  
  // Actions
  advanceStage: () => void;
  setStage: (stage: GameStage) => void;
  
  // Mission tracking
  completeSpaceMission: (act: number) => void;
  completeLandMission: (act: number) => void;
  isActComplete: (act: number) => boolean;
  getCurrentActNumber: () => number;
  
  // Mission classification
  isSpaceMission: (themes: string[]) => boolean;
  isLandMission: (themes: string[]) => boolean;
  
  // Utilities
  resetProgress: () => void;
}

// Create the store with persistence
export const useGameProgress = create<GameProgressState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStage: GameStage.Intro,
      
      // Progress for each act - default configuration
      actProgress: {
        1: { actNumber: 1, spaceMissions: 0, landMissions: 0, requiredSpace: 2, requiredLand: 2, completed: false },
        2: { actNumber: 2, spaceMissions: 0, landMissions: 0, requiredSpace: 2, requiredLand: 2, completed: false },
        3: { actNumber: 3, spaceMissions: 0, landMissions: 0, requiredSpace: 2, requiredLand: 2, completed: false },
        4: { actNumber: 4, spaceMissions: 0, landMissions: 0, requiredSpace: 2, requiredLand: 2, completed: false },
        5: { actNumber: 5, spaceMissions: 0, landMissions: 0, requiredSpace: 2, requiredLand: 2, completed: false }
      },
      
      // Move to the next stage in sequence
      advanceStage: () => {
        const currentStage = get().currentStage;
        const nextStage = getNextStage(currentStage);
        set({ currentStage: nextStage });
      },
      
      // Explicitly set a stage
      setStage: (stage: GameStage) => {
        set({ currentStage: stage });
      },
      
      // Track space mission completion
      completeSpaceMission: (act: number) => {
        const currentProgress = { ...get().actProgress };
        
        // Make sure the act exists
        if (currentProgress[act]) {
          currentProgress[act] = {
            ...currentProgress[act],
            spaceMissions: currentProgress[act].spaceMissions + 1
          };
          
          // Check if this completes the act
          if (
            currentProgress[act].spaceMissions >= currentProgress[act].requiredSpace &&
            currentProgress[act].landMissions >= currentProgress[act].requiredLand
          ) {
            currentProgress[act].completed = true;
            
            // Automatically advance to cutscene if this was the current act
            if (get().getCurrentActNumber() === act) {
              const cutsceneStage = `cutscene${act}` as GameStage;
              set({ currentStage: cutsceneStage });
            }
          }
          
          set({ actProgress: currentProgress });
        }
      },
      
      // Track land mission completion
      completeLandMission: (act: number) => {
        const currentProgress = { ...get().actProgress };
        
        // Make sure the act exists
        if (currentProgress[act]) {
          currentProgress[act] = {
            ...currentProgress[act],
            landMissions: currentProgress[act].landMissions + 1
          };
          
          // Check if this completes the act
          if (
            currentProgress[act].spaceMissions >= currentProgress[act].requiredSpace &&
            currentProgress[act].landMissions >= currentProgress[act].requiredLand
          ) {
            currentProgress[act].completed = true;
            
            // Automatically advance to cutscene if this was the current act
            if (get().getCurrentActNumber() === act) {
              const cutsceneStage = `cutscene${act}` as GameStage;
              set({ currentStage: cutsceneStage });
            }
          }
          
          set({ actProgress: currentProgress });
        }
      },
      
      // Check if an act is complete
      isActComplete: (act: number) => {
        const progress = get().actProgress[act];
        return progress ? progress.completed : false;
      },
      
      // Get the current act number based on stage
      getCurrentActNumber: () => {
        const stage = get().currentStage;
        
        // Extract act number from stage string
        if (stage.startsWith('act')) {
          const match = stage.match(/act(\d)/);
          if (match && match[1]) {
            return parseInt(match[1]);
          }
        }
        
        // For cutscenes, return the act that just completed
        if (stage.startsWith('cutscene')) {
          const match = stage.match(/cutscene(\d)/);
          if (match && match[1]) {
            return parseInt(match[1]);
          }
        }
        
        // Default to act 1 for intro or outro
        return 1;
      },
      
      // Classify mission as space-based
      isSpaceMission: (themes: string[]) => {
        const spaceThemes = [
          StorylineTheme.Exploration,
          StorylineTheme.Trade,
          StorylineTheme.VoidEntity
        ];
        
        return themes.some(theme => spaceThemes.includes(theme as StorylineTheme));
      },
      
      // Classify mission as land-based
      isLandMission: (themes: string[]) => {
        const landThemes = [
          StorylineTheme.Alliance,
          StorylineTheme.Settlers,
          StorylineTheme.Mystery,
          StorylineTheme.Rebellion
        ];
        
        return themes.some(theme => landThemes.includes(theme as StorylineTheme));
      },
      
      // Reset all progress
      resetProgress: () => {
        set({
          currentStage: GameStage.Intro,
          actProgress: {
            1: { actNumber: 1, spaceMissions: 0, landMissions: 0, requiredSpace: 2, requiredLand: 2, completed: false },
            2: { actNumber: 2, spaceMissions: 0, landMissions: 0, requiredSpace: 2, requiredLand: 2, completed: false },
            3: { actNumber: 3, spaceMissions: 0, landMissions: 0, requiredSpace: 2, requiredLand: 2, completed: false },
            4: { actNumber: 4, spaceMissions: 0, landMissions: 0, requiredSpace: 2, requiredLand: 2, completed: false },
            5: { actNumber: 5, spaceMissions: 0, landMissions: 0, requiredSpace: 2, requiredLand: 2, completed: false }
          }
        });
      }
    }),
    {
      name: 'game-progress-storage'
    }
  )
);

// Helper function to determine the next stage in sequence
function getNextStage(currentStage: GameStage): GameStage {
  switch (currentStage) {
    case GameStage.Intro:
      return GameStage.Act1;
    case GameStage.Act1:
      return GameStage.Cutscene1;
    case GameStage.Cutscene1:
      return GameStage.Act2;
    case GameStage.Act2:
      return GameStage.Cutscene2;
    case GameStage.Cutscene2:
      return GameStage.Act3;
    case GameStage.Cutscene3:
      return GameStage.Act4;
    case GameStage.Act4:
      return GameStage.Cutscene4;
    case GameStage.Cutscene4:
      return GameStage.Act5;
    case GameStage.Act5:
      return GameStage.Cutscene5;
    case GameStage.Cutscene5:
      return GameStage.Outro;
    case GameStage.Outro:
      return GameStage.Complete;
    default:
      return GameStage.Complete; // End state loops back to itself
  }
}