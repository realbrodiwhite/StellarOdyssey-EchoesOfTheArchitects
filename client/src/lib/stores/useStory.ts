import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Location, CharacterClass } from "../types";
import { gameLocations } from "../data/locations";

// Types for the narrative system
export enum Alignment {
  Lawful = "Lawful",
  Neutral = "Neutral",
  Chaotic = "Chaotic"
}

export enum MoralAxis {
  Good = "Good",
  Neutral = "Neutral",
  Outlaw = "Outlaw"
}

export type Reputation = {
  faction: string;
  value: number; // -100 to 100
  title?: string; // Special title earned based on reputation
};

export type Relationship = {
  characterId: string;
  value: number; // -100 to 100
  status: "ally" | "neutral" | "rival" | "enemy";
};

export enum QuestStatus {
  NotStarted = "not_started",
  InProgress = "in_progress",
  Completed = "completed",
  Failed = "failed",
  Abandoned = "abandoned"
}

export interface QuestStep {
  id: string;
  description: string;
  completed: boolean;
  choices?: {
    id: string;
    text: string;
    requires?: { flag: string, value: boolean }[];
    alignment?: Alignment;
    moralAxis?: MoralAxis;
    reputationChanges?: { faction: string, change: number }[];
    relationshipChanges?: { characterId: string, change: number }[];
    flagChanges?: { flag: string, value: boolean }[];
    next?: string; // Next quest step ID
  }[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  isMainQuest: boolean;
  giver: string | null;
  steps: QuestStep[];
  currentStepId: string | null;
  rewards: {
    experience: number;
    credits?: number;
    items?: string[];
    reputationChanges?: { faction: string, change: number }[];
  };
  prerequisites?: {
    level?: number;
    flags?: { flag: string, value: boolean }[];
    reputation?: { faction: string, minValue: number }[];
    quests?: { id: string, status: QuestStatus }[];
  };
}

export type DialogueEntry = {
  speakerId: string;
  text: string;
  timestamp: number;
  choices?: {
    text: string;
    chosenAt?: number;
  }[];
  questId?: string;
  location?: string;
};

export interface StoryBeat {
  id: string;
  title: string;
  description: string;
  triggered: boolean;
  requiredFlags: { flag: string, value: boolean }[];
  cutscene?: {
    dialogues: {
      speakerId: string;
      text: string;
      delay: number;
    }[];
  };
  consequenceFlags: { flag: string, value: boolean }[];
}

interface StoryState {
  // Core narrative state
  currentChapter: number;
  alignment: Alignment;
  moralAxis: MoralAxis;
  honor: number; // -100 to 100
  reputations: Reputation[];
  relationships: Relationship[];
  
  // Environment state
  currentLocationId: string;
  visitedLocations: string[];
  discoveredLocations: string[];
  storyFlags: Record<string, boolean>;
  worldState: Record<string, any>;
  
  // Quest and dialogue
  activeQuests: Quest[];
  completedQuests: string[];
  failedQuests: string[];
  dialogueHistory: DialogueEntry[];
  storyBeats: StoryBeat[];
  currentCutsceneId: string | null;
  
  // Character traits and decisions
  characterClass: CharacterClass | null;
  decisionsHistory: {
    decisionId: string;
    choice: string;
    timestamp: number;
    consequenceIds: string[];
  }[];
  
  // Getters
  getCurrentLocation: () => Location | undefined;
  getReputation: (faction: string) => Reputation | undefined;
  getRelationship: (characterId: string) => Relationship | undefined;
  getQuestById: (questId: string) => Quest | undefined;
  getCurrentQuestStep: (questId: string) => QuestStep | undefined;
  getFactionTitle: (faction: string) => string | undefined;
  getHonorTitle: () => string;
  getActiveMainQuest: () => Quest | undefined;
  
  // Location management
  moveToLocation: (locationId: string) => boolean;
  canTravelTo: (locationId: string) => boolean;
  discoverLocation: (locationId: string) => void;
  
  // Story progression
  advanceChapter: () => void;
  setStoryFlag: (flag: string, value: boolean) => void;
  checkStoryFlag: (flag: string) => boolean;
  setWorldState: (key: string, value: any) => void;
  triggerStoryBeat: (beatId: string) => void;
  setCutscene: (cutsceneId: string | null) => void;
  
  // Moral and reputation systems
  changeAlignment: (newAlignment: Alignment) => void;
  changeMoralAxis: (newMoralAxis: MoralAxis) => void;
  adjustHonor: (amount: number) => void;
  changeReputation: (faction: string, amount: number) => void;
  changeRelationship: (characterId: string, amount: number) => void;
  
  // Quest system
  startQuest: (quest: Quest) => void;
  advanceQuest: (questId: string, choiceId?: string) => void;
  completeQuest: (questId: string) => void;
  failQuest: (questId: string) => void;
  abandonQuest: (questId: string) => void;
  
  // Dialogue system
  addDialogue: (entry: Omit<DialogueEntry, 'timestamp'>) => void;
  recordDecision: (decisionId: string, choice: string, consequenceIds: string[]) => void;
  
  // Game state
  resetStory: () => void;
  initializeCharacterStory: (characterClass: CharacterClass) => void;
}

export const useStory = create<StoryState>()(
  persist(
    (set, get) => ({
      // Core narrative state
      currentChapter: 1,
      alignment: Alignment.Neutral,
      moralAxis: MoralAxis.Neutral,
      honor: 0,
      reputations: [
        { faction: "Alliance", value: 0 },
        { faction: "Syndicate", value: 0 },
        { faction: "Settlers", value: 0 },
        { faction: "Mystics", value: 0 }
      ],
      relationships: [],
      
      // Environment state
      currentLocationId: "ship",
      visitedLocations: ["ship"],
      discoveredLocations: ["ship"],
      storyFlags: {
        // Prologue
        gameStarted: false,
        shipMalfunctioned: false,
        
        // Chapter 1 - The New Frontier
        arrivedAtOutpost: false,
        metCaptainRey: false,
        acceptedFirstMission: false,
        
        // Chapter 2 - Ancient Secrets
        discoveredArtifact: false,
        metMysteriousStranger: false,
        learnedAboutArtifactPowers: false,
        
        // Chapter 3 - Power Play
        confrontedSyndicate: false,
        allianceBetrayalRevealed: false,
        
        // Chapter 4 - Point of No Return
        madeKeyChoice: false,
        unlockedAncientTemple: false,
        
        // Chapter 5 - New Dawn
        defeatedMainAntagonist: false,
        savedColony: false,
        ascendedPowers: false,
        
        // Endings
        endingRedemption: false,
        endingDomination: false,
        endingFreedom: false,
        endingSacrifice: false
      },
      worldState: {
        galacticPeaceLevel: 50,
        syndicateInfluence: 40,
        allianceStrength: 60,
        settlementsProsperity: 30,
        mysticsPresence: 20
      },
      
      // Quest and dialogue
      activeQuests: [],
      completedQuests: [],
      failedQuests: [],
      dialogueHistory: [],
      storyBeats: [
        {
          id: "opening_scene",
          title: "A New Beginning",
          description: "The crew of the Odyssey embarks on their journey to the frontier.",
          triggered: false,
          requiredFlags: [{ flag: "gameStarted", value: true }],
          cutscene: {
            dialogues: [
              { speakerId: "captain", text: "All systems operational. Prepare for departure.", delay: 0 },
              { speakerId: "ai", text: "Navigation course set for the Proxima System.", delay: 2000 },
              { speakerId: "engineer", text: "Engines at full capacity. We're good to go.", delay: 4000 }
            ]
          },
          consequenceFlags: [{ flag: "shipMalfunctioned", value: true }]
        }
      ],
      currentCutsceneId: null,
      
      // Character traits and decisions
      characterClass: null,
      decisionsHistory: [],
      
      // Getters
      getCurrentLocation: () => {
        const locationId = get().currentLocationId;
        return gameLocations.find(loc => loc.id === locationId);
      },
      
      getReputation: (faction) => {
        return get().reputations.find(rep => rep.faction === faction);
      },
      
      getRelationship: (characterId) => {
        return get().relationships.find(rel => rel.characterId === characterId);
      },
      
      getQuestById: (questId) => {
        return get().activeQuests.find(q => q.id === questId);
      },
      
      getCurrentQuestStep: (questId) => {
        const quest = get().getQuestById(questId);
        if (!quest || !quest.currentStepId) return undefined;
        return quest.steps.find(step => step.id === quest.currentStepId);
      },
      
      getFactionTitle: (faction) => {
        const rep = get().getReputation(faction);
        if (!rep) return undefined;
        
        if (rep.value >= 90) return "Legendary";
        if (rep.value >= 75) return "Revered";
        if (rep.value >= 50) return "Honored";
        if (rep.value >= 25) return "Friendly";
        if (rep.value >= 0) return "Neutral";
        if (rep.value >= -25) return "Unfriendly";
        if (rep.value >= -50) return "Hostile";
        if (rep.value >= -75) return "Hated";
        return "Infamous";
      },
      
      getHonorTitle: () => {
        const honor = get().honor;
        
        if (honor >= 90) return "Paragon of the Galaxy";
        if (honor >= 75) return "Galactic Hero";
        if (honor >= 50) return "Respected Captain";
        if (honor >= 25) return "Honorable";
        if (honor >= -25) return "Spacefarer";
        if (honor >= -50) return "Opportunist";
        if (honor >= -75) return "Notorious";
        if (honor >= -90) return "Feared Outlaw";
        return "Galactic Villain";
      },
      
      getActiveMainQuest: () => {
        return get().activeQuests.find(q => q.isMainQuest);
      },
      
      // Location management
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
        
        // Add a travel entry to dialogue history
        const location = gameLocations.find(loc => loc.id === locationId);
        if (location) {
          get().addDialogue({
            speakerId: "system",
            text: `Arrived at ${location.name}`,
            location: locationId
          });
        }
        
        return true;
      },
      
      canTravelTo: (locationId) => {
        const currentLocation = get().getCurrentLocation();
        
        // Can't travel if current location doesn't exist
        if (!currentLocation) return false;
        
        // Check if target location is connected to current location
        return currentLocation.connections.includes(locationId);
      },
      
      discoverLocation: (locationId) => {
        set(state => ({
          discoveredLocations: state.discoveredLocations.includes(locationId)
            ? state.discoveredLocations
            : [...state.discoveredLocations, locationId]
        }));
      },
      
      // Story progression
      advanceChapter: () => {
        set(state => ({ currentChapter: state.currentChapter + 1 }));
        
        // Add chapter transition to dialogue
        const newChapter = get().currentChapter;
        get().addDialogue({
          speakerId: "system",
          text: `Chapter ${newChapter} begins...`
        });
      },
      
      setStoryFlag: (flag, value) => {
        set(state => ({
          storyFlags: {
            ...state.storyFlags,
            [flag]: value
          }
        }));
        
        // Check if setting this flag triggers any story beats
        const storyBeats = get().storyBeats;
        for (const beat of storyBeats) {
          if (beat.triggered) continue;
          
          // Check if all required flags match
          const allFlagsMatch = beat.requiredFlags.every(req => 
            get().storyFlags[req.flag] === req.value
          );
          
          if (allFlagsMatch) {
            get().triggerStoryBeat(beat.id);
          }
        }
      },
      
      checkStoryFlag: (flag) => {
        return get().storyFlags[flag] || false;
      },
      
      setWorldState: (key, value) => {
        set(state => ({
          worldState: {
            ...state.worldState,
            [key]: value
          }
        }));
      },
      
      triggerStoryBeat: (beatId) => {
        const beat = get().storyBeats.find(b => b.id === beatId);
        if (!beat || beat.triggered) return;
        
        // Mark as triggered
        set(state => ({
          storyBeats: state.storyBeats.map(b => 
            b.id === beatId ? { ...b, triggered: true } : b
          )
        }));
        
        // Set any consequence flags
        beat.consequenceFlags.forEach(flag => {
          get().setStoryFlag(flag.flag, flag.value);
        });
        
        // Start cutscene if it exists
        if (beat.cutscene) {
          get().setCutscene(beatId);
        }
        
        // Add to dialogue history
        get().addDialogue({
          speakerId: "system",
          text: beat.title + ": " + beat.description
        });
      },
      
      setCutscene: (cutsceneId) => {
        set({ currentCutsceneId: cutsceneId });
      },
      
      // Moral and reputation systems
      changeAlignment: (newAlignment) => {
        set({ alignment: newAlignment });
      },
      
      changeMoralAxis: (newMoralAxis) => {
        set({ moralAxis: newMoralAxis });
      },
      
      adjustHonor: (amount) => {
        set(state => ({
          honor: Math.max(-100, Math.min(100, state.honor + amount))
        }));
      },
      
      changeReputation: (faction, amount) => {
        set(state => ({
          reputations: state.reputations.map(rep => 
            rep.faction === faction
              ? { ...rep, value: Math.max(-100, Math.min(100, rep.value + amount)) }
              : rep
          )
        }));
      },
      
      changeRelationship: (characterId, amount) => {
        // Check if relationship exists
        const existing = get().relationships.find(r => r.characterId === characterId);
        
        if (existing) {
          // Update existing relationship
          set(state => ({
            relationships: state.relationships.map(rel => 
              rel.characterId === characterId
                ? { 
                    ...rel, 
                    value: Math.max(-100, Math.min(100, rel.value + amount)),
                    // Update status based on new value
                    status: rel.value + amount >= 50 ? "ally" 
                      : rel.value + amount >= 0 ? "neutral"
                      : rel.value + amount >= -50 ? "rival"
                      : "enemy"
                  }
                : rel
            )
          }));
        } else {
          // Create new relationship
          const newValue = Math.max(-100, Math.min(100, amount));
          const status = newValue >= 50 ? "ally" 
            : newValue >= 0 ? "neutral"
            : newValue >= -50 ? "rival"
            : "enemy";
            
          set(state => ({
            relationships: [
              ...state.relationships,
              { characterId, value: newValue, status }
            ]
          }));
        }
      },
      
      // Quest system
      startQuest: (quest) => {
        // Don't start if already active
        if (get().activeQuests.some(q => q.id === quest.id)) return;
        
        // Set initial quest step
        const initialStep = quest.steps[0];
        
        set(state => ({
          activeQuests: [...state.activeQuests, {
            ...quest,
            status: QuestStatus.InProgress,
            currentStepId: initialStep?.id || null
          }]
        }));
        
        // Add to dialogue history
        get().addDialogue({
          speakerId: "system",
          text: `New quest: ${quest.title}`,
          questId: quest.id
        });
      },
      
      advanceQuest: (questId, choiceId) => {
        const quest = get().getQuestById(questId);
        if (!quest || quest.status !== QuestStatus.InProgress) return;
        
        const currentStep = get().getCurrentQuestStep(questId);
        if (!currentStep) return;
        
        // Mark current step as completed
        set(state => ({
          activeQuests: state.activeQuests.map(q => 
            q.id === questId
              ? {
                  ...q,
                  steps: q.steps.map(step => 
                    step.id === currentStep.id
                      ? { ...step, completed: true }
                      : step
                  )
                }
              : q
          )
        }));
        
        // If a choice was made, find the next step from the choice
        let nextStepId = null;
        
        if (choiceId && currentStep.choices) {
          const choice = currentStep.choices.find(c => c.id === choiceId);
          
          if (choice) {
            // Apply reputation and relationship changes
            choice.reputationChanges?.forEach(change => {
              get().changeReputation(change.faction, change.change);
            });
            
            choice.relationshipChanges?.forEach(change => {
              get().changeRelationship(change.characterId, change.change);
            });
            
            // Apply flag changes
            choice.flagChanges?.forEach(change => {
              get().setStoryFlag(change.flag, change.value);
            });
            
            // Update alignment if needed
            if (choice.alignment) get().changeAlignment(choice.alignment);
            if (choice.moralAxis) get().changeMoralAxis(choice.moralAxis);
            
            nextStepId = choice.next || null;
          }
        }
        
        // If no next step from choice, look for the next incomplete step
        if (!nextStepId) {
          const stepIndex = quest.steps.findIndex(step => step.id === currentStep.id);
          if (stepIndex < quest.steps.length - 1) {
            nextStepId = quest.steps[stepIndex + 1].id;
          }
        }
        
        // Update the current step
        set(state => ({
          activeQuests: state.activeQuests.map(q => 
            q.id === questId
              ? { ...q, currentStepId: nextStepId }
              : q
          )
        }));
        
        // If no more steps, complete the quest
        if (!nextStepId) {
          get().completeQuest(questId);
        } else {
          // Add step progress to dialogue
          const nextStep = quest.steps.find(step => step.id === nextStepId);
          if (nextStep) {
            get().addDialogue({
              speakerId: "system",
              text: `Quest update: ${quest.title} - ${nextStep.description}`,
              questId
            });
          }
        }
      },
      
      completeQuest: (questId) => {
        const quest = get().getQuestById(questId);
        if (!quest) return;
        
        // Complete the quest
        set(state => ({
          activeQuests: state.activeQuests.filter(q => q.id !== questId),
          completedQuests: [...state.completedQuests, questId]
        }));
        
        // Apply rewards
        if (quest.rewards) {
          quest.rewards.reputationChanges?.forEach(change => {
            get().changeReputation(change.faction, change.change);
          });
        }
        
        // Add to dialogue history
        get().addDialogue({
          speakerId: "system",
          text: `Completed quest: ${quest.title}`,
          questId
        });
      },
      
      failQuest: (questId) => {
        const quest = get().getQuestById(questId);
        if (!quest) return;
        
        // Fail the quest
        set(state => ({
          activeQuests: state.activeQuests.filter(q => q.id !== questId),
          failedQuests: [...state.failedQuests, questId]
        }));
        
        // Add to dialogue history
        get().addDialogue({
          speakerId: "system",
          text: `Failed quest: ${quest.title}`,
          questId
        });
      },
      
      abandonQuest: (questId) => {
        const quest = get().getQuestById(questId);
        if (!quest) return;
        
        // Remove from active quests
        set(state => ({
          activeQuests: state.activeQuests.filter(q => q.id !== questId)
        }));
        
        // Add to dialogue history
        get().addDialogue({
          speakerId: "system",
          text: `Abandoned quest: ${quest.title}`,
          questId
        });
      },
      
      // Dialogue system
      addDialogue: (entry) => {
        set(state => ({
          dialogueHistory: [...state.dialogueHistory, {
            ...entry,
            timestamp: Date.now()
          }]
        }));
      },
      
      recordDecision: (decisionId, choice, consequenceIds) => {
        set(state => ({
          decisionsHistory: [...state.decisionsHistory, {
            decisionId,
            choice,
            timestamp: Date.now(),
            consequenceIds
          }]
        }));
      },
      
      // Game state
      resetStory: () => {
        set({
          currentChapter: 1,
          alignment: Alignment.Neutral,
          moralAxis: MoralAxis.Neutral,
          honor: 0,
          reputations: [
            { faction: "Alliance", value: 0 },
            { faction: "Syndicate", value: 0 },
            { faction: "Settlers", value: 0 },
            { faction: "Mystics", value: 0 }
          ],
          relationships: [],
          
          currentLocationId: "ship",
          visitedLocations: ["ship"],
          discoveredLocations: ["ship"],
          storyFlags: {
            gameStarted: false,
            shipMalfunctioned: false,
            arrivedAtOutpost: false,
            metCaptainRey: false,
            acceptedFirstMission: false,
            discoveredArtifact: false,
            metMysteriousStranger: false,
            learnedAboutArtifactPowers: false,
            confrontedSyndicate: false,
            allianceBetrayalRevealed: false,
            madeKeyChoice: false,
            unlockedAncientTemple: false,
            defeatedMainAntagonist: false,
            savedColony: false,
            ascendedPowers: false,
            endingRedemption: false,
            endingDomination: false,
            endingFreedom: false,
            endingSacrifice: false
          },
          worldState: {
            galacticPeaceLevel: 50,
            syndicateInfluence: 40,
            allianceStrength: 60,
            settlementsProsperity: 30,
            mysticsPresence: 20
          },
          
          activeQuests: [],
          completedQuests: [],
          failedQuests: [],
          dialogueHistory: [],
          currentCutsceneId: null,
          
          characterClass: null,
          decisionsHistory: []
        });
      },
      
      initializeCharacterStory: (characterClass) => {
        set({ characterClass });
        
        // Set initial reputation based on character class
        switch(characterClass) {
          case CharacterClass.Engineer:
            get().changeReputation("Alliance", 20);
            get().changeReputation("Settlers", 10);
            break;
          case CharacterClass.Scientist:
            get().changeReputation("Alliance", 15);
            get().changeReputation("Mystics", 15);
            break;
          case CharacterClass.Diplomat:
            get().changeReputation("Alliance", 25);
            get().changeReputation("Syndicate", 5);
            break;
          case CharacterClass.Pilot:
            get().changeReputation("Settlers", 15);
            get().changeReputation("Syndicate", 10);
            break;
        }
        
        // Mark game as started
        get().setStoryFlag("gameStarted", true);
        
        // Add initial entry
        get().addDialogue({
          speakerId: "system",
          text: `Beginning your journey as a ${characterClass}.`
        });
      }
    }),
    {
      name: "story-storage", // name of the item in localStorage
      partialize: (state) => ({
        currentChapter: state.currentChapter,
        alignment: state.alignment,
        moralAxis: state.moralAxis,
        honor: state.honor,
        reputations: state.reputations,
        relationships: state.relationships,
        
        currentLocationId: state.currentLocationId,
        visitedLocations: state.visitedLocations,
        discoveredLocations: state.discoveredLocations,
        storyFlags: state.storyFlags,
        worldState: state.worldState,
        
        activeQuests: state.activeQuests,
        completedQuests: state.completedQuests,
        failedQuests: state.failedQuests,
        dialogueHistory: state.dialogueHistory.slice(-100), // Only store last 100 entries
        storyBeats: state.storyBeats,
        
        characterClass: state.characterClass,
        decisionsHistory: state.decisionsHistory
      }),
    }
  )
);
