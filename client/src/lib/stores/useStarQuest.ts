import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Quest, 
  QuestState, 
  StoryStage, 
  StoryChoice, 
  StoryOutcome, 
  StoryOutcomeType, 
  initialQuestState,
  starQuestData
} from '../data/star-quest';
import { useCharacter } from './useCharacter';
import { useStory } from './useStory';
import { useInventory } from './useInventory';
import { Faction } from '../types';

// Types for the store
interface QuestProgress {
  currentStageId: string;
  decisions: Array<{
    stageId: string;
    choiceId: string;
    timestamp: number;
  }>;
  stateUpdatedAt: number;
}

interface StarQuestState {
  // Quest status tracking
  activeQuests: string[];
  completedQuests: string[];
  failedQuests: string[];
  unavailableQuests: string[];
  questProgress: Record<string, QuestProgress>;
  
  // Getters
  getAllQuests: () => Quest[];
  getQuest: (questId: string) => Quest | undefined;
  getQuestStage: (questId: string, stageId: string) => StoryStage | undefined;
  getCurrentStage: (questId: string) => StoryStage | undefined;
  getAvailableChoices: (questId: string) => StoryChoice[];
  canChooseOption: (questId: string, choiceId: string) => boolean;
  getQuestsByState: (state: QuestState) => Quest[];
  getMainQuestLine: () => Quest[];
  getActiveBranches: () => string[];
  
  // Setters and actions
  startQuest: (questId: string) => boolean;
  completeQuest: (questId: string) => void;
  failQuest: (questId: string) => void;
  makeChoice: (questId: string, choiceId: string) => boolean;
  applyOutcomes: (questId: string, outcomes: StoryOutcome[]) => void;
  
  // Reset and initialization
  resetStarQuest: () => void;
  initializeStarQuest: () => void;
}

// Helper function to get a quest by ID
const getQuestById = (questId: string): Quest | undefined => {
  return starQuestData.find(quest => quest.id === questId);
};

// Helper function to get a stage by ID within a quest
const getStageById = (quest: Quest, stageId: string): StoryStage | undefined => {
  return quest.stages.find(stage => stage.id === stageId);
};

// Helper function to check if a choice's requirements are met
const checkRequirements = (requirements: any[] | undefined): boolean => {
  if (!requirements || requirements.length === 0) return true;
  
  const character = useCharacter.getState().selectedCharacter;
  const storyState = useStory.getState();
  const inventory = useInventory.getState();
  
  return requirements.every(req => {
    switch (req.type) {
      case 'item':
        return inventory.hasItem(req.id);
      case 'skill':
        return character && useCharacter.getState().hasSkillLevel(req.skillType, req.skillLevel);
      case 'faction':
        return storyState.getFactionReputation(req.faction) >= req.reputationLevel;
      case 'class':
        return character && character.class === req.characterClass;
      case 'flag':
        return storyState.gameState.storyFlags[req.id] === req.value;
      case 'location':
        return storyState.gameState.visitedLocations.includes(req.locationId);
      case 'questCompleted':
        return useStarQuest.getState().completedQuests.includes(req.questId);
      default:
        return true;
    }
  });
};

export const useStarQuest = create<StarQuestState>()(
  persist(
    (set, get) => ({
      activeQuests: initialQuestState.activeQuests,
      completedQuests: initialQuestState.completedQuests,
      failedQuests: initialQuestState.failedQuests,
      unavailableQuests: initialQuestState.unavailableQuests,
      questProgress: initialQuestState.questProgress,
      
      // Getters
      getAllQuests: () => starQuestData,
      
      getQuest: (questId: string) => {
        return getQuestById(questId);
      },
      
      getQuestStage: (questId: string, stageId: string) => {
        const quest = get().getQuest(questId);
        if (!quest) return undefined;
        
        return getStageById(quest, stageId);
      },
      
      getCurrentStage: (questId: string) => {
        const progress = get().questProgress[questId];
        if (!progress) return undefined;
        
        const quest = get().getQuest(questId);
        if (!quest) return undefined;
        
        return getStageById(quest, progress.currentStageId);
      },
      
      getAvailableChoices: (questId: string) => {
        const currentStage = get().getCurrentStage(questId);
        if (!currentStage) return [];
        
        return currentStage.choices.filter(choice => 
          !choice.requirements || checkRequirements(choice.requirements)
        );
      },
      
      canChooseOption: (questId: string, choiceId: string) => {
        const currentStage = get().getCurrentStage(questId);
        if (!currentStage) return false;
        
        const choice = currentStage.choices.find(c => c.id === choiceId);
        if (!choice) return false;
        
        return !choice.requirements || checkRequirements(choice.requirements);
      },
      
      getQuestsByState: (state: QuestState) => {
        const { activeQuests, completedQuests, failedQuests, unavailableQuests } = get();
        
        let questIds: string[] = [];
        switch (state) {
          case QuestState.Available:
          case QuestState.InProgress:
            questIds = activeQuests;
            break;
          case QuestState.Completed:
            questIds = completedQuests;
            break;
          case QuestState.Failed:
            questIds = failedQuests;
            break;
          case QuestState.Unavailable:
            questIds = unavailableQuests;
            break;
        }
        
        return questIds
          .map(id => getQuestById(id))
          .filter((quest): quest is Quest => quest !== undefined);
      },
      
      getMainQuestLine: () => {
        return starQuestData.filter(quest => quest.isMainQuest);
      },
      
      getActiveBranches: () => {
        const activeQuests = get().getQuestsByState(QuestState.InProgress);
        return Array.from(new Set(activeQuests.map(quest => quest.branch)));
      },
      
      // Setters and actions
      startQuest: (questId: string) => {
        const quest = get().getQuest(questId);
        if (!quest || !quest.startingStageId) return false;
        
        // Check if already active or completed
        if (get().activeQuests.includes(questId) || get().completedQuests.includes(questId)) {
          return false;
        }
        
        // Remove from unavailable
        const unavailableQuests = get().unavailableQuests.filter(id => id !== questId);
        
        // Add to active
        const activeQuests = [...get().activeQuests, questId];
        
        // Create initial progress
        const questProgress = {
          ...get().questProgress,
          [questId]: {
            currentStageId: quest.startingStageId,
            decisions: [],
            stateUpdatedAt: Date.now()
          }
        };
        
        set({
          activeQuests,
          unavailableQuests,
          questProgress
        });
        
        console.log(`Started quest: ${quest.title}`);
        return true;
      },
      
      completeQuest: (questId: string) => {
        const quest = get().getQuest(questId);
        if (!quest) return;
        
        // Remove from active
        const activeQuests = get().activeQuests.filter(id => id !== questId);
        
        // Add to completed
        const completedQuests = [...get().completedQuests, questId];
        
        set({
          activeQuests,
          completedQuests
        });
        
        // Apply completion outcomes if any
        if (quest.completionOutcomes && quest.completionOutcomes.length > 0) {
          get().applyOutcomes(questId, quest.completionOutcomes);
        }
        
        console.log(`Completed quest: ${quest.title}`);
      },
      
      failQuest: (questId: string) => {
        const quest = get().getQuest(questId);
        if (!quest) return;
        
        // Remove from active
        const activeQuests = get().activeQuests.filter(id => id !== questId);
        
        // Add to failed
        const failedQuests = [...get().failedQuests, questId];
        
        set({
          activeQuests,
          failedQuests
        });
        
        // Apply failure outcomes if any
        if (quest.failureOutcomes && quest.failureOutcomes.length > 0) {
          get().applyOutcomes(questId, quest.failureOutcomes);
        }
        
        console.log(`Failed quest: ${quest.title}`);
      },
      
      makeChoice: (questId: string, choiceId: string) => {
        const currentStage = get().getCurrentStage(questId);
        if (!currentStage) return false;
        
        const choice = currentStage.choices.find(c => c.id === choiceId);
        if (!choice) return false;
        
        // Check if requirements are met
        if (choice.requirements && !checkRequirements(choice.requirements)) {
          console.log('Requirements not met for choice');
          return false;
        }
        
        // Record the decision
        const questProgress = {
          ...get().questProgress,
          [questId]: {
            ...get().questProgress[questId],
            decisions: [
              ...get().questProgress[questId].decisions,
              {
                stageId: currentStage.id,
                choiceId: choice.id,
                timestamp: Date.now()
              }
            ],
            stateUpdatedAt: Date.now()
          }
        };
        
        // Apply outcomes
        get().applyOutcomes(questId, choice.outcomes);
        
        // Move to next stage or quest
        if (choice.nextStageId) {
          questProgress[questId].currentStageId = choice.nextStageId;
          
          set({ questProgress });
          console.log(`Advanced to next stage in quest ${questId}`);
        } else if (choice.nextQuestId) {
          // Complete current quest
          get().completeQuest(questId);
          
          // Start next quest if it exists and is not already active
          const nextQuest = get().getQuest(choice.nextQuestId);
          if (nextQuest && !get().activeQuests.includes(choice.nextQuestId)) {
            get().startQuest(choice.nextQuestId);
          }
          
          console.log(`Completed quest ${questId} and moved to ${choice.nextQuestId}`);
        } else {
          // No next stage or quest specified, just update progress
          set({ questProgress });
          console.log(`Made choice in quest ${questId} but no next step specified`);
        }
        
        return true;
      },
      
      applyOutcomes: (questId: string, outcomes: StoryOutcome[]) => {
        const characterStore = useCharacter.getState();
        const storyStore = useStory.getState();
        const inventoryStore = useInventory.getState();
        
        outcomes.forEach(outcome => {
          switch (outcome.type) {
            case StoryOutcomeType.Reward:
              // Generic reward type - not implementing details yet
              console.log(`Applied reward outcome: ${outcome.value}`);
              break;
            
            case StoryOutcomeType.Reputation:
              if (outcome.factionId && outcome.value) {
                storyStore.changeFactionReputation(outcome.factionId as Faction, outcome.value);
                console.log(`Changed reputation with ${outcome.factionId} by ${outcome.value}`);
              }
              break;
            
            case StoryOutcomeType.UnlockLocation:
              if (outcome.locationId) {
                storyStore.discoverLocation(outcome.locationId);
                console.log(`Discovered location: ${outcome.locationId}`);
              }
              break;
            
            case StoryOutcomeType.UnlockQuest:
              if (outcome.questId) {
                // Move from unavailable to available
                const unavailableQuests = get().unavailableQuests.filter(id => id !== outcome.questId);
                
                set({ unavailableQuests });
                
                console.log(`Unlocked quest: ${outcome.questId}`);
              }
              break;
            
            case StoryOutcomeType.UnlockCompanion:
              // Will implement when we have a companion system
              console.log(`Unlocked companion: ${outcome.companionId}`);
              break;
            
            case StoryOutcomeType.Item:
              if (outcome.itemId) {
                // We'd need a way to get item templates from their IDs
                // For now, log it
                console.log(`Received item: ${outcome.itemId}`);
              }
              break;
            
            case StoryOutcomeType.Experience:
              if (outcome.value) {
                characterStore.gainExperience(outcome.value);
                console.log(`Gained ${outcome.value} experience`);
              }
              break;
            
            case StoryOutcomeType.SetFlag:
              if (outcome.flagName) {
                storyStore.setStoryFlag(outcome.flagName, outcome.value === true);
                console.log(`Set story flag ${outcome.flagName} to ${outcome.value}`);
              }
              break;
            
            case StoryOutcomeType.Combat:
              // Would trigger a combat encounter
              console.log(`Triggered combat: ${outcome.combatId}`);
              break;
            
            case StoryOutcomeType.Death:
              // Game over state
              console.log('Character death triggered');
              break;
            
            case StoryOutcomeType.GameEnd:
              // Trigger a game ending
              console.log(`Reached game ending: ${outcome.ending}`);
              break;
          }
        });
      },
      
      resetStarQuest: () => {
        set({
          activeQuests: initialQuestState.activeQuests,
          completedQuests: initialQuestState.completedQuests,
          failedQuests: initialQuestState.failedQuests,
          unavailableQuests: initialQuestState.unavailableQuests,
          questProgress: initialQuestState.questProgress
        });
        
        console.log('Reset Star Quest data to initial state');
      },
      
      initializeStarQuest: () => {
        // Only initialize if we're in a clean state
        if (get().activeQuests.length === 0 && get().completedQuests.length === 0) {
          set({
            activeQuests: initialQuestState.activeQuests,
            completedQuests: initialQuestState.completedQuests,
            failedQuests: initialQuestState.failedQuests,
            unavailableQuests: initialQuestState.unavailableQuests,
            questProgress: initialQuestState.questProgress
          });
          
          console.log('Initialized Star Quest data');
        }
      }
    }),
    {
      name: 'star-quest-storage',
      partialize: (state) => ({
        activeQuests: state.activeQuests,
        completedQuests: state.completedQuests,
        failedQuests: state.failedQuests,
        unavailableQuests: state.unavailableQuests,
        questProgress: state.questProgress
      })
    }
  )
);

export default useStarQuest;