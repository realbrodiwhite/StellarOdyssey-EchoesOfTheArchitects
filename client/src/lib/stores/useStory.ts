import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Faction } from '../types';

export interface StoryState {
  // Faction reputation data
  factionReputation: Record<Faction, number>;
  
  // World state flags
  worldFlags: string[];
  storyProgress: Record<string, number>;
  
  // Player decisions history
  decisions: {
    id: string;
    description: string;
    timestamp: number;
    effects: string[];
  }[];
  
  // Management functions
  getFactionReputation: (faction: Faction) => number;
  changeFactionReputation: (faction: Faction, amount: number) => void;
  hasFlag: (flag: string) => boolean;
  setFlag: (flag: string) => void;
  removeFlag: (flag: string) => void;
  addDecision: (description: string, effects: string[]) => void;
  getStoryProgress: (storyline: string) => number;
  advanceStoryProgress: (storyline: string, amount?: number) => void;
  setStoryProgress: (storyline: string, progress: number) => void;
  resetStory: () => void;
}

const initialFactionReputations: Record<Faction, number> = {
  [Faction.Alliance]: 0,
  [Faction.Syndicate]: 0,
  [Faction.Settlers]: 0,
  [Faction.Mystics]: 0,
  [Faction.Independent]: 0,
  [Faction.VoidEntity]: -10, // Start slightly negative with mysterious factions
};

export const useStory = create<StoryState>()(
  persist(
    (set, get) => ({
      factionReputation: { ...initialFactionReputations },
      worldFlags: [],
      storyProgress: {},
      decisions: [],
      
      getFactionReputation: (faction: Faction) => {
        return get().factionReputation[faction] || 0;
      },
      
      changeFactionReputation: (faction: Faction, amount: number) => {
        const currentRep = get().factionReputation[faction] || 0;
        const newRep = Math.min(Math.max(currentRep + amount, -100), 100); // Clamp between -100 and 100
        
        set(state => ({
          factionReputation: {
            ...state.factionReputation,
            [faction]: newRep
          }
        }));
        
        console.log(`${faction} reputation changed by ${amount} to ${newRep}`);
        
        // Apply effects on other factions based on relationships
        // For example, gaining reputation with Alliance might reduce Syndicate rep
        if (amount > 0) {
          if (faction === Faction.Alliance) {
            get().changeFactionReputation(Faction.Syndicate, Math.floor(-amount/3));
          } else if (faction === Faction.Syndicate) {
            get().changeFactionReputation(Faction.Alliance, Math.floor(-amount/3));
          } else if (faction === Faction.VoidEntity) {
            get().changeFactionReputation(Faction.Mystics, Math.floor(-amount/2));
          }
        }
      },
      
      hasFlag: (flag: string) => {
        return get().worldFlags.includes(flag);
      },
      
      setFlag: (flag: string) => {
        if (!get().worldFlags.includes(flag)) {
          set(state => ({
            worldFlags: [...state.worldFlags, flag]
          }));
          console.log(`Set story flag: ${flag}`);
        }
      },
      
      removeFlag: (flag: string) => {
        set(state => ({
          worldFlags: state.worldFlags.filter(f => f !== flag)
        }));
        console.log(`Removed story flag: ${flag}`);
      },
      
      addDecision: (description: string, effects: string[]) => {
        const decision = {
          id: `decision_${Date.now()}`,
          description,
          timestamp: Date.now(),
          effects
        };
        
        set(state => ({
          decisions: [...state.decisions, decision]
        }));
        console.log(`Decision recorded: ${description}`);
      },
      
      getStoryProgress: (storyline: string) => {
        return get().storyProgress[storyline] || 0;
      },
      
      advanceStoryProgress: (storyline: string, amount: number = 1) => {
        const current = get().storyProgress[storyline] || 0;
        
        set(state => ({
          storyProgress: {
            ...state.storyProgress,
            [storyline]: current + amount
          }
        }));
        console.log(`Advanced '${storyline}' storyline by ${amount}`);
      },
      
      setStoryProgress: (storyline: string, progress: number) => {
        set(state => ({
          storyProgress: {
            ...state.storyProgress,
            [storyline]: progress
          }
        }));
        console.log(`Set '${storyline}' storyline progress to ${progress}`);
      },
      
      resetStory: () => {
        set({
          factionReputation: { ...initialFactionReputations },
          worldFlags: [],
          storyProgress: {},
          decisions: []
        });
        console.log('Story state reset');
      }
    }),
    {
      name: 'story-storage',
      partialize: (state) => ({
        factionReputation: state.factionReputation,
        worldFlags: state.worldFlags,
        storyProgress: state.storyProgress,
        decisions: state.decisions
      })
    }
  )
);

export default useStory;