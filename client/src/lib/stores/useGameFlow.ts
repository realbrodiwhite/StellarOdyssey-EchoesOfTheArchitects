import { create } from 'zustand';
import { StorylineTheme } from '../data/mission-pool';

// Game flow states
export type GameFlowState = 
  | 'intro' 
  | 'act1' 
  | 'cutscene1' 
  | 'act2' 
  | 'cutscene2' 
  | 'act3' 
  | 'cutscene3' 
  | 'act4' 
  | 'cutscene4' 
  | 'act5' 
  | 'cutscene5'
  | 'outro'
  | 'complete';

// Define types for space and land mission tracking
export interface ActMissionStatus {
  spaceMissionsCompleted: number;
  landMissionsCompleted: number;
  totalSpaceMissions: number;
  totalLandMissions: number;
}

interface GameFlowState {
  // Current state of game flow
  currentFlowState: GameFlowState;
  
  // Act progression tracking
  actProgress: {
    [GameFlowState.Act1]: ActMissionStatus;
    [GameFlowState.Act2]: ActMissionStatus;
    [GameFlowState.Act3]: ActMissionStatus;
    [GameFlowState.Act4]: ActMissionStatus;
    [GameFlowState.Act5]: ActMissionStatus;
  };
  
  // Current active act
  currentAct: 1 | 2 | 3 | 4 | 5;
  
  // Functions to manage flow
  advanceFlow: () => void;
  setFlowState: (state: GameFlowState) => void;
  
  // Mission tracking
  completeSpaceMission: (act: 1 | 2 | 3 | 4 | 5) => void;
  completeLandMission: (act: 1 | 2 | 3 | 4 | 5) => void;
  isActComplete: (act: 1 | 2 | 3 | 4 | 5) => boolean;
  resetProgress: () => void;
  
  // Utility functions
  isSpaceMission: (missionThemes: string[]) => boolean;
  isLandMission: (missionThemes: string[]) => boolean;
}

// Define number of required missions per act
const REQUIRED_SPACE_MISSIONS = 2;
const REQUIRED_LAND_MISSIONS = 2;

export const useGameFlow = create<GameFlowState>((set, get) => ({
  currentFlowState: GameFlowState.Intro,
  currentAct: 1,
  
  actProgress: {
    [GameFlowState.Act1]: {
      spaceMissionsCompleted: 0,
      landMissionsCompleted: 0,
      totalSpaceMissions: REQUIRED_SPACE_MISSIONS,
      totalLandMissions: REQUIRED_LAND_MISSIONS
    },
    [GameFlowState.Act2]: {
      spaceMissionsCompleted: 0,
      landMissionsCompleted: 0,
      totalSpaceMissions: REQUIRED_SPACE_MISSIONS,
      totalLandMissions: REQUIRED_LAND_MISSIONS
    },
    [GameFlowState.Act3]: {
      spaceMissionsCompleted: 0,
      landMissionsCompleted: 0,
      totalSpaceMissions: REQUIRED_SPACE_MISSIONS,
      totalLandMissions: REQUIRED_LAND_MISSIONS
    },
    [GameFlowState.Act4]: {
      spaceMissionsCompleted: 0,
      landMissionsCompleted: 0,
      totalSpaceMissions: REQUIRED_SPACE_MISSIONS,
      totalLandMissions: REQUIRED_LAND_MISSIONS
    },
    [GameFlowState.Act5]: {
      spaceMissionsCompleted: 0,
      landMissionsCompleted: 0,
      totalSpaceMissions: REQUIRED_SPACE_MISSIONS,
      totalLandMissions: REQUIRED_LAND_MISSIONS
    }
  },
  
  advanceFlow: () => {
    const currentState = get().currentFlowState;
    const nextState = getNextFlowState(currentState);
    
    // Update act number if moving to a new act
    let newAct = get().currentAct;
    if (nextState === GameFlowState.Act2) newAct = 2;
    else if (nextState === GameFlowState.Act3) newAct = 3;
    else if (nextState === GameFlowState.Act4) newAct = 4;
    else if (nextState === GameFlowState.Act5) newAct = 5;
    
    set({ 
      currentFlowState: nextState,
      currentAct: newAct as 1 | 2 | 3 | 4 | 5
    });
    
    return nextState;
  },
  
  setFlowState: (state: GameFlowState) => {
    // Calculate the appropriate act number based on the state
    let actNumber = get().currentAct;
    
    if (state.includes('act')) {
      const actMatch = state.match(/act(\d)/);
      if (actMatch) {
        actNumber = parseInt(actMatch[1]) as 1 | 2 | 3 | 4 | 5;
      }
    }
    
    set({ 
      currentFlowState: state,
      currentAct: actNumber
    });
  },
  
  completeSpaceMission: (act: 1 | 2 | 3 | 4 | 5) => {
    const actKey = `act${act}` as keyof typeof GameFlowState;
    const flowStateKey = GameFlowState[actKey as keyof typeof GameFlowState];
    
    set(state => {
      const newProgress = { ...state.actProgress };
      newProgress[flowStateKey] = {
        ...newProgress[flowStateKey],
        spaceMissionsCompleted: Math.min(
          newProgress[flowStateKey].spaceMissionsCompleted + 1,
          newProgress[flowStateKey].totalSpaceMissions
        )
      };
      
      return { actProgress: newProgress };
    });
    
    // Check if the act is now complete
    if (get().isActComplete(act)) {
      // Auto-advance to cutscene if both mission types are complete
      const cutsceneKey = `cutscene${act}` as keyof typeof GameFlowState;
      set({ currentFlowState: GameFlowState[cutsceneKey as keyof typeof GameFlowState] });
    }
  },
  
  completeLandMission: (act: 1 | 2 | 3 | 4 | 5) => {
    const actKey = `act${act}` as keyof typeof GameFlowState;
    const flowStateKey = GameFlowState[actKey as keyof typeof GameFlowState];
    
    set(state => {
      const newProgress = { ...state.actProgress };
      newProgress[flowStateKey] = {
        ...newProgress[flowStateKey],
        landMissionsCompleted: Math.min(
          newProgress[flowStateKey].landMissionsCompleted + 1,
          newProgress[flowStateKey].totalLandMissions
        )
      };
      
      return { actProgress: newProgress };
    });
    
    // Check if the act is now complete
    if (get().isActComplete(act)) {
      // Auto-advance to cutscene if both mission types are complete
      const cutsceneKey = `cutscene${act}` as keyof typeof GameFlowState;
      set({ currentFlowState: GameFlowState[cutsceneKey as keyof typeof GameFlowState] });
    }
  },
  
  isActComplete: (act: 1 | 2 | 3 | 4 | 5) => {
    const actKey = `act${act}` as keyof typeof GameFlowState;
    const flowStateKey = GameFlowState[actKey as keyof typeof GameFlowState];
    const progress = get().actProgress[flowStateKey];
    
    return (
      progress.spaceMissionsCompleted >= progress.totalSpaceMissions &&
      progress.landMissionsCompleted >= progress.totalLandMissions
    );
  },
  
  resetProgress: () => {
    set({
      currentFlowState: GameFlowState.Intro,
      currentAct: 1,
      actProgress: {
        [GameFlowState.Act1]: {
          spaceMissionsCompleted: 0,
          landMissionsCompleted: 0,
          totalSpaceMissions: REQUIRED_SPACE_MISSIONS,
          totalLandMissions: REQUIRED_LAND_MISSIONS
        },
        [GameFlowState.Act2]: {
          spaceMissionsCompleted: 0,
          landMissionsCompleted: 0,
          totalSpaceMissions: REQUIRED_SPACE_MISSIONS,
          totalLandMissions: REQUIRED_LAND_MISSIONS
        },
        [GameFlowState.Act3]: {
          spaceMissionsCompleted: 0,
          landMissionsCompleted: 0,
          totalSpaceMissions: REQUIRED_SPACE_MISSIONS,
          totalLandMissions: REQUIRED_LAND_MISSIONS
        },
        [GameFlowState.Act4]: {
          spaceMissionsCompleted: 0,
          landMissionsCompleted: 0,
          totalSpaceMissions: REQUIRED_SPACE_MISSIONS,
          totalLandMissions: REQUIRED_LAND_MISSIONS
        },
        [GameFlowState.Act5]: {
          spaceMissionsCompleted: 0,
          landMissionsCompleted: 0,
          totalSpaceMissions: REQUIRED_SPACE_MISSIONS,
          totalLandMissions: REQUIRED_LAND_MISSIONS
        }
      }
    });
  },
  
  // Utility functions to determine mission types
  isSpaceMission: (missionThemes: string[]) => {
    const spaceThemes = [
      StorylineTheme.Exploration,
      StorylineTheme.Trade,
      StorylineTheme.VoidEntity
    ];
    
    return missionThemes.some(theme => spaceThemes.includes(theme as StorylineTheme));
  },
  
  isLandMission: (missionThemes: string[]) => {
    const landThemes = [
      StorylineTheme.Alliance,
      StorylineTheme.Settlers,
      StorylineTheme.Mystery,
      StorylineTheme.Rebellion
    ];
    
    return missionThemes.some(theme => landThemes.includes(theme as StorylineTheme));
  }
}));

// Helper to determine next state in the flow
function getNextFlowState(currentState: GameFlowState): GameFlowState {
  switch (currentState) {
    case GameFlowState.Intro:
      return GameFlowState.Act1;
    case GameFlowState.Act1:
      return GameFlowState.Cutscene1;
    case GameFlowState.Cutscene1:
      return GameFlowState.Act2;
    case GameFlowState.Act2:
      return GameFlowState.Cutscene2;
    case GameFlowState.Cutscene2:
      return GameFlowState.Act3;
    case GameFlowState.Act3:
      return GameFlowState.Cutscene3;
    case GameFlowState.Cutscene3:
      return GameFlowState.Act4;
    case GameFlowState.Act4:
      return GameFlowState.Cutscene4;
    case GameFlowState.Cutscene4:
      return GameFlowState.Act5;
    case GameFlowState.Act5:
      return GameFlowState.Cutscene5;
    case GameFlowState.Cutscene5:
      return GameFlowState.Outro;
    case GameFlowState.Outro:
      return GameFlowState.Complete;
    case GameFlowState.Complete:
      return GameFlowState.Complete; // End state
    default:
      return GameFlowState.Intro;
  }
}