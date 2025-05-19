import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CrewMember, findCrewMemberById } from "../data/crewMembers";
import { CompanionPersonality, RelationshipLevel } from "./useCompanion";

// Define relationship types between crew members
export enum RelationshipType {
  Friend = "Friend",         // Positive personal relationship
  Rival = "Rival",           // Competitive but respectful
  Antagonist = "Antagonist", // Negative relationship
  Family = "Family",         // Family ties
  Mentor = "Mentor",         // Teacher/student dynamic
  Romantic = "Romantic",     // Romantic interest/relationship
  Professional = "Professional" // Strictly work-related
}

// Define interface for a relationship between two crew members
export interface CrewRelationship {
  between: [string, string]; // IDs of the two crew members
  type: RelationshipType;
  strength: number; // 1-10 scale of relationship intensity
  background?: string; // Optional backstory of their relationship
  visibleToPlayer: boolean; // Whether the player knows about this relationship
}

// Define the interface for the crew relationships state
export interface CrewRelationshipsState {
  // Player relationships with crew
  playerRelationships: {
    [crewId: string]: {
      level: RelationshipLevel;
      points: number; // Accumulated relationship points
      maxPoints: number; // Points needed for next level
      personalQuestProgress?: number; // 0-100 progress on personal quest
      personalQuestCompleted?: boolean;
      significantInteractions: {
        id: string;
        description: string;
        effect: number; // Relationship change
        timestamp: number;
      }[];
    };
  };
  
  // Relationships between crew members
  crewRelationships: CrewRelationship[];
  
  // Methods
  getRelationshipLevel: (crewId: string) => RelationshipLevel;
  improveRelationship: (crewId: string, amount: number) => void;
  deteriorateRelationship: (crewId: string, amount: number) => void;
  setRelationshipLevel: (crewId: string, level: RelationshipLevel) => void;
  getRelationshipProgress: (crewId: string) => { current: number, target: number };
  recordInteraction: (crewId: string, description: string, effect: number) => void;
  getSignificantInteractions: (crewId: string) => { id: string, description: string, effect: number, timestamp: number }[];
  updatePersonalQuestProgress: (crewId: string, progress: number) => void;
  completePersonalQuest: (crewId: string) => void;
  getPersonalQuestProgress: (crewId: string) => { progress: number, completed: boolean };
  
  // Crew-to-crew relationship methods
  getCrewRelationship: (crewId1: string, crewId2: string) => CrewRelationship | undefined;
  setCrewRelationship: (crewId1: string, crewId2: string, type: RelationshipType, strength: number, background?: string) => void;
  revealRelationship: (crewId1: string, crewId2: string) => void;
  getCrewRelationships: (crewId: string) => CrewRelationship[];
}

// Calculate points needed for each relationship level
const pointsForLevel = {
  [RelationshipLevel.Distrustful]: 0,
  [RelationshipLevel.Neutral]: 10,
  [RelationshipLevel.Cooperative]: 25,
  [RelationshipLevel.Friendly]: 50,
  [RelationshipLevel.Devoted]: 100
};

// Calculate the next level
const getNextLevel = (currentLevel: RelationshipLevel): RelationshipLevel | null => {
  const levels = Object.values(RelationshipLevel);
  const currentIndex = levels.indexOf(currentLevel);
  
  if (currentIndex < levels.length - 1) {
    return levels[currentIndex + 1];
  }
  
  return null; // Already at max level
};

// Helper function to calculate points needed for next level
const getPointsForNextLevel = (currentLevel: RelationshipLevel): number => {
  const nextLevel = getNextLevel(currentLevel);
  if (!nextLevel) return Infinity;
  return pointsForLevel[nextLevel];
};

// Create the store with persistence
export const useCrewRelationships = create<CrewRelationshipsState>()(
  persist(
    (set, get) => ({
      playerRelationships: {},
      crewRelationships: [],
      
      getRelationshipLevel: (crewId: string) => {
        const relationships = get().playerRelationships;
        if (!relationships[crewId]) {
          // Initialize relationship if not exists
          set((state) => ({
            playerRelationships: {
              ...state.playerRelationships,
              [crewId]: {
                level: RelationshipLevel.Neutral,
                points: 0,
                maxPoints: getPointsForNextLevel(RelationshipLevel.Neutral),
                significantInteractions: []
              }
            }
          }));
          return RelationshipLevel.Neutral;
        }
        return relationships[crewId].level;
      },
      
      improveRelationship: (crewId: string, amount: number) => {
        const relationships = get().playerRelationships;
        const currentRelationship = relationships[crewId] || {
          level: RelationshipLevel.Neutral,
          points: 0,
          maxPoints: getPointsForNextLevel(RelationshipLevel.Neutral),
          significantInteractions: []
        };
        
        let newPoints = currentRelationship.points + amount;
        let newLevel = currentRelationship.level;
        
        // Check if we've reached a new level
        while (newPoints >= currentRelationship.maxPoints) {
          const nextLevel = getNextLevel(newLevel);
          if (!nextLevel) {
            // Already at max level
            newPoints = currentRelationship.maxPoints;
            break;
          }
          
          newLevel = nextLevel;
          newPoints = newPoints - currentRelationship.maxPoints;
        }
        
        set((state) => ({
          playerRelationships: {
            ...state.playerRelationships,
            [crewId]: {
              ...currentRelationship,
              level: newLevel,
              points: newPoints,
              maxPoints: getPointsForNextLevel(newLevel)
            }
          }
        }));
      },
      
      deteriorateRelationship: (crewId: string, amount: number) => {
        const relationships = get().playerRelationships;
        const currentRelationship = relationships[crewId] || {
          level: RelationshipLevel.Neutral,
          points: 0,
          maxPoints: getPointsForNextLevel(RelationshipLevel.Neutral),
          significantInteractions: []
        };
        
        let newPoints = currentRelationship.points - amount;
        let newLevel = currentRelationship.level;
        
        // Check if we've dropped to a lower level
        while (newPoints < 0) {
          const levels = Object.values(RelationshipLevel);
          const currentIndex = levels.indexOf(newLevel);
          
          if (currentIndex <= 0) {
            // Already at minimum level
            newPoints = 0;
            newLevel = RelationshipLevel.Distrustful;
            break;
          }
          
          const previousLevel = levels[currentIndex - 1];
          newLevel = previousLevel;
          
          // Calculate points in previous level
          const previousLevelMax = getPointsForNextLevel(previousLevel);
          newPoints = previousLevelMax + newPoints; // Add negative points to previous max
        }
        
        set((state) => ({
          playerRelationships: {
            ...state.playerRelationships,
            [crewId]: {
              ...currentRelationship,
              level: newLevel,
              points: newPoints,
              maxPoints: getPointsForNextLevel(newLevel)
            }
          }
        }));
      },
      
      setRelationshipLevel: (crewId: string, level: RelationshipLevel) => {
        const relationships = get().playerRelationships;
        const currentRelationship = relationships[crewId] || {
          level: RelationshipLevel.Neutral,
          points: 0,
          maxPoints: getPointsForNextLevel(RelationshipLevel.Neutral),
          significantInteractions: []
        };
        
        set((state) => ({
          playerRelationships: {
            ...state.playerRelationships,
            [crewId]: {
              ...currentRelationship,
              level,
              points: 0, // Reset points at new level
              maxPoints: getPointsForNextLevel(level)
            }
          }
        }));
      },
      
      getRelationshipProgress: (crewId: string) => {
        get().getRelationshipLevel(crewId); // Ensure relationship exists
        const relationship = get().playerRelationships[crewId];
        return {
          current: relationship.points,
          target: relationship.maxPoints
        };
      },
      
      recordInteraction: (crewId: string, description: string, effect: number) => {
        get().getRelationshipLevel(crewId); // Ensure relationship exists
        
        set((state) => {
          const currentRelationship = state.playerRelationships[crewId];
          
          return {
            playerRelationships: {
              ...state.playerRelationships,
              [crewId]: {
                ...currentRelationship,
                significantInteractions: [
                  ...currentRelationship.significantInteractions,
                  {
                    id: Math.random().toString(36).substring(2, 11),
                    description,
                    effect,
                    timestamp: Date.now()
                  }
                ]
              }
            }
          };
        });
        
        // Also update the relationship points
        if (effect > 0) {
          get().improveRelationship(crewId, effect);
        } else if (effect < 0) {
          get().deteriorateRelationship(crewId, Math.abs(effect));
        }
      },
      
      getSignificantInteractions: (crewId: string) => {
        get().getRelationshipLevel(crewId); // Ensure relationship exists
        return get().playerRelationships[crewId].significantInteractions;
      },
      
      updatePersonalQuestProgress: (crewId: string, progress: number) => {
        get().getRelationshipLevel(crewId); // Ensure relationship exists
        
        set((state) => {
          const currentRelationship = state.playerRelationships[crewId];
          const currentProgress = currentRelationship.personalQuestProgress || 0;
          const newProgress = Math.min(100, currentProgress + progress);
          
          return {
            playerRelationships: {
              ...state.playerRelationships,
              [crewId]: {
                ...currentRelationship,
                personalQuestProgress: newProgress,
                personalQuestCompleted: newProgress >= 100
              }
            }
          };
        });
        
        // If quest is now complete, record significant interaction
        const updatedRelationship = get().playerRelationships[crewId];
        if (updatedRelationship.personalQuestCompleted && updatedRelationship.personalQuestProgress === 100) {
          const crewMember = findCrewMemberById(crewId);
          if (crewMember && crewMember.personalQuest) {
            get().recordInteraction(
              crewId,
              `Completed personal quest: ${crewMember.personalQuest.name}`,
              10 // Major relationship boost for completing personal quest
            );
          }
        }
      },
      
      completePersonalQuest: (crewId: string) => {
        get().updatePersonalQuestProgress(crewId, 100); // Set to 100%
      },
      
      getPersonalQuestProgress: (crewId: string) => {
        get().getRelationshipLevel(crewId); // Ensure relationship exists
        const relationship = get().playerRelationships[crewId];
        return {
          progress: relationship.personalQuestProgress || 0,
          completed: relationship.personalQuestCompleted || false
        };
      },
      
      getCrewRelationship: (crewId1: string, crewId2: string) => {
        // Sort IDs to ensure consistent relationship lookup
        const [first, second] = [crewId1, crewId2].sort();
        return get().crewRelationships.find(
          rel => rel.between[0] === first && rel.between[1] === second
        );
      },
      
      setCrewRelationship: (crewId1: string, crewId2: string, type: RelationshipType, strength: number, background?: string) => {
        // Sort IDs to ensure consistent relationship storage
        const [first, second] = [crewId1, crewId2].sort();
        
        set((state) => {
          // Filter out any existing relationship between these crew members
          const filteredRelationships = state.crewRelationships.filter(
            rel => !(rel.between[0] === first && rel.between[1] === second)
          );
          
          // Add the new relationship
          return {
            crewRelationships: [
              ...filteredRelationships,
              {
                between: [first, second],
                type,
                strength,
                background,
                visibleToPlayer: false // Hidden by default until discovered
              }
            ]
          };
        });
      },
      
      revealRelationship: (crewId1: string, crewId2: string) => {
        // Sort IDs to ensure consistent relationship lookup
        const [first, second] = [crewId1, crewId2].sort();
        
        set((state) => ({
          crewRelationships: state.crewRelationships.map(rel => {
            if (rel.between[0] === first && rel.between[1] === second) {
              return { ...rel, visibleToPlayer: true };
            }
            return rel;
          })
        }));
      },
      
      getCrewRelationships: (crewId: string) => {
        return get().crewRelationships.filter(
          rel => rel.between.includes(crewId)
        );
      }
    }),
    {
      name: "crew-relationships-storage"
    }
  )
);

// Initialize default crew relationships
export const initializeCrewRelationships = () => {
  const store = useCrewRelationships.getState();
  
  // Define some initial relationships between crew members
  // These would be revealed to the player through dialogue and interactions
  
  // Zara and Krell (siblings)
  store.setCrewRelationship(
    "Zara Voss", // Will be matched by name in the implementation
    "Krell Voss",
    RelationshipType.Family,
    7,
    "Siblings who grew up together in the Outer Rim before taking different paths in life. They maintain a complicated but ultimately supportive relationship."
  );
  
  // Alexis and Dr. Marcus (colleagues with some tension)
  store.setCrewRelationship(
    "Alexis Chen",
    "Dr. Marcus Vega",
    RelationshipType.Rival,
    5,
    "Former colleagues on a previous research mission that ended with conflicting views on how certain alien technology should be handled. They respect each other's expertise but disagree on methodological approaches."
  );
  
  // Commander Torres and Dr. Reeves (professional respect)
  store.setCrewRelationship(
    "Commander Lena Torres",
    "Dr. Elias Reeves",
    RelationshipType.Professional,
    8,
    "Have served together on multiple missions and developed a strong working relationship built on mutual respect and trust in each other's capabilities."
  );
  
  // Rix and Alexis (friendship)
  store.setCrewRelationship(
    "Rix",
    "Alexis Chen",
    RelationshipType.Friend,
    9,
    "Alexis was among the first to treat Rix as a person rather than a tool, and they've formed a close friendship through shared interest in technological innovations."
  );
  
  // Dr. Reeves and Dr. Vega (mentor relationship)
  store.setCrewRelationship(
    "Dr. Elias Reeves",
    "Dr. Marcus Vega",
    RelationshipType.Mentor,
    6,
    "Dr. Reeves provided guidance to Dr. Vega early in his career and continues to offer wisdom, though Vega has developed his own scientific perspective that sometimes conflicts with his mentor's more cautious approach."
  );
};