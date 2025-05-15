import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Faction } from '../types';
import { missionPool, MissionTemplate, missionLookup, getNextMission } from '../data/mission-pool';
import useInventory from './useInventory';
import { useStory } from './useStory';

export interface StarQuestProgress {
  currentMissionId: string | null;
  completedMissions: string[];
  activeMissions: string[];
  currentStage: number;
  storyFlags: string[];
  questChoices: Record<string, string>; // missionId -> choiceId
}

export interface QuestEvent {
  id: string;
  missionId: string;
  choiceId: string;
  outcomeId: string;
  timestamp: number;
}

interface StarQuestState {
  // Progress and state
  progress: StarQuestProgress;
  events: QuestEvent[];
  
  // Mission functions
  getCurrentMission: () => MissionTemplate | null;
  startMission: (missionId: string) => boolean;
  completeMission: (choiceId: string, outcomeId: string) => void;
  getAvailableMissionsForStage: (stage: number) => MissionTemplate[];
  advanceStage: () => void;
  resetProgress: () => void;
  
  // Flag and state functions
  hasFlag: (flag: string) => boolean;
  setFlag: (flag: string) => void;
  removeFlag: (flag: string) => void;
  setChoice: (missionId: string, choiceId: string) => void;
  getChoice: (missionId: string) => string | null;
  
  // Utility functions
  getStoryTimeline: () => QuestEvent[];
  getMissionById: (missionId: string) => MissionTemplate | null;
  getCurrentStage: () => number;
}

export const useStarQuest = create<StarQuestState>()(
  persist(
    (set, get) => ({
      progress: {
        currentMissionId: null,
        completedMissions: [],
        activeMissions: [],
        currentStage: 1,
        storyFlags: [],
        questChoices: {}
      },
      events: [],
      
      getCurrentMission: () => {
        const { currentMissionId } = get().progress;
        if (!currentMissionId) return null;
        
        return missionLookup[currentMissionId] || null;
      },
      
      startMission: (missionId: string) => {
        const mission = missionLookup[missionId];
        if (!mission) {
          console.error(`Mission not found: ${missionId}`);
          return false;
        }
        
        set(state => ({
          progress: {
            ...state.progress,
            currentMissionId: missionId,
            activeMissions: [...state.progress.activeMissions, missionId]
          }
        }));
        
        console.log(`Started mission: ${mission.title}`);
        return true;
      },
      
      completeMission: (choiceId: string, outcomeId: string) => {
        const { currentMissionId, completedMissions, storyFlags } = get().progress;
        if (!currentMissionId) return;
        
        const currentMission = missionLookup[currentMissionId];
        if (!currentMission) return;
        
        // Find the outcome
        const outcome = currentMission.outcomes.find(o => o.id === outcomeId);
        if (!outcome) {
          console.error(`Outcome not found: ${outcomeId}`);
          return;
        }
        
        // Record event
        const event: QuestEvent = {
          id: uuidv4(),
          missionId: currentMissionId,
          choiceId,
          outcomeId,
          timestamp: Date.now()
        };
        
        // Update state
        set(state => ({
          events: [...state.events, event],
          progress: {
            ...state.progress,
            completedMissions: [...completedMissions, currentMissionId],
            activeMissions: state.progress.activeMissions.filter(id => id !== currentMissionId),
            questChoices: {
              ...state.progress.questChoices,
              [currentMissionId]: choiceId
            }
          }
        }));
        
        // Process rewards and consequences
        if (outcome.reputationChanges) {
          outcome.reputationChanges.forEach(change => {
            const { changeFactionReputation } = useStory.getState();
            changeFactionReputation(change.faction, change.change);
          });
        }
        
        if (outcome.itemsGiven) {
          outcome.itemsGiven.forEach(itemId => {
            const { addItem } = useInventory.getState();
            addItem(itemId);
          });
        }
        
        if (outcome.itemsRemoved) {
          const { items } = useInventory.getState();
          outcome.itemsRemoved.forEach(itemTemplate => {
            // Find matching item
            const matchingItem = items.find(item => 
              item.name.toLowerCase().includes(itemTemplate.toLowerCase())
            );
            
            if (matchingItem) {
              const { removeItem } = useInventory.getState();
              removeItem(matchingItem.id);
            }
          });
        }
        
        if (outcome.creditsGiven) {
          const { addCredits } = useInventory.getState();
          addCredits(outcome.creditsGiven);
        }
        
        if (outcome.creditsRemoved) {
          const { removeCredits } = useInventory.getState();
          removeCredits(outcome.creditsRemoved);
        }
        
        // Set flags
        if (outcome.flagsSet) {
          outcome.flagsSet.forEach(flag => {
            get().setFlag(flag);
          });
        }
        
        // Remove flags
        if (outcome.flagsRemoved) {
          outcome.flagsRemoved.forEach(flag => {
            get().removeFlag(flag);
          });
        }
        
        // Determine next mission
        const nextMission = getNextMission(currentMission, outcomeId);
        
        if (outcome.allowStageProgress && currentMission.stage === get().progress.currentStage) {
          // If the mission allows stage progress and we're at the current stage, advance
          get().advanceStage();
        }
        
        // Set next mission if one is available
        if (nextMission) {
          get().startMission(nextMission.id);
        } else {
          // Clear current mission
          set(state => ({
            progress: {
              ...state.progress,
              currentMissionId: null
            }
          }));
        }
        
        console.log(`Completed mission: ${currentMission.title}`);
      },
      
      getAvailableMissionsForStage: (stage: number) => {
        const { completedMissions } = get().progress;
        
        return missionPool.filter(mission => 
          mission.stage === stage && 
          !completedMissions.includes(mission.id)
        );
      },
      
      advanceStage: () => {
        set(state => ({
          progress: {
            ...state.progress,
            currentStage: state.progress.currentStage + 1
          }
        }));
        
        const newStage = get().progress.currentStage;
        console.log(`Advanced to stage ${newStage}`);
      },
      
      resetProgress: () => {
        set({
          progress: {
            currentMissionId: null,
            completedMissions: [],
            activeMissions: [],
            currentStage: 1,
            storyFlags: [],
            questChoices: {}
          },
          events: []
        });
        
        console.log('Reset quest progress');
      },
      
      hasFlag: (flag: string) => {
        return get().progress.storyFlags.includes(flag);
      },
      
      setFlag: (flag: string) => {
        const { storyFlags } = get().progress;
        
        if (!storyFlags.includes(flag)) {
          set(state => ({
            progress: {
              ...state.progress,
              storyFlags: [...state.progress.storyFlags, flag]
            }
          }));
          
          console.log(`Set flag: ${flag}`);
        }
      },
      
      removeFlag: (flag: string) => {
        set(state => ({
          progress: {
            ...state.progress,
            storyFlags: state.progress.storyFlags.filter(f => f !== flag)
          }
        }));
        
        console.log(`Removed flag: ${flag}`);
      },
      
      setChoice: (missionId: string, choiceId: string) => {
        set(state => ({
          progress: {
            ...state.progress,
            questChoices: {
              ...state.progress.questChoices,
              [missionId]: choiceId
            }
          }
        }));
      },
      
      getChoice: (missionId: string) => {
        return get().progress.questChoices[missionId] || null;
      },
      
      getStoryTimeline: () => {
        return [...get().events].sort((a, b) => a.timestamp - b.timestamp);
      },
      
      getMissionById: (missionId: string) => {
        return missionLookup[missionId] || null;
      },
      
      getCurrentStage: () => {
        return get().progress.currentStage;
      }
    }),
    {
      name: 'star-quest-storage',
      partialize: (state) => ({
        progress: state.progress,
        events: state.events
      })
    }
  )
);

export default useStarQuest;