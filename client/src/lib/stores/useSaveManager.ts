import { create } from 'zustand';
import { useCharacter } from './useCharacter';
import { useInventory } from './useInventory';
import { useStory } from './useStory';
import { useGame } from './useGame';
import { useCompanion } from './useCompanion';
import { v4 as uuidv4 } from 'uuid';

export interface SaveData {
  id: string;
  name: string;
  timestamp: number;
  character: any;
  inventory: any;
  story: any;
  game: any;
  companion: any;
}

interface SaveManagerState {
  // Properties
  saves: SaveData[];
  currentSaveId: string | null;
  
  // Actions
  saveGame: (saveName: string) => string;
  loadGame: (saveId: string) => boolean;
  deleteSave: (saveId: string) => void;
  
  // Getters
  getSaves: () => SaveData[];
  getCurrentSave: () => SaveData | null;
}

export const useSaveManager = create<SaveManagerState>((set, get) => {
  // Initialize saves from localStorage if available
  const initialSaves: SaveData[] = (() => {
    try {
      const savedData = localStorage.getItem('cosmic_odyssey_saves');
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error('Error loading saved games:', error);
      return [];
    }
  })();

  return {
    // Initial state
    saves: initialSaves,
    currentSaveId: null,

    // Actions
    saveGame: (saveName: string) => {
      // Get current state from all stores
      const characterState = useCharacter.getState();
      const inventoryState = useInventory.getState();
      const storyState = useStory.getState();
      const gameState = useGame.getState();
      const companionState = useCompanion.getState();
      
      // Create save ID or reuse current
      const saveId = get().currentSaveId || uuidv4();
      
      // Create save data object
      const saveData: SaveData = {
        id: saveId,
        name: saveName,
        timestamp: Date.now(),
        character: {
          activeCharacter: characterState.activeCharacter,
          availableSkillPoints: characterState.availableSkillPoints
        },
        inventory: {
          items: inventoryState.items,
          credits: inventoryState.credits,
          capacity: inventoryState.capacity
        },
        story: {
          currentLocation: storyState.currentLocation,
          visitedLocations: storyState.visitedLocations,
          questProgress: storyState.questProgress,
          storyFlags: storyState.storyFlags
        },
        game: {
          settings: gameState.settings,
          gameState: gameState.gameState
        },
        companion: {
          activeCompanion: companionState.activeCompanion,
          availableCompanions: companionState.availableCompanions,
          companionRelationship: companionState.companionRelationship
        }
      };

      // Update saves array
      set(state => {
        // Check if save already exists and update it, or add new save
        const existingIndex = state.saves.findIndex(save => save.id === saveId);
        let newSaves: SaveData[];
        
        if (existingIndex >= 0) {
          // Update existing save
          newSaves = [...state.saves];
          newSaves[existingIndex] = saveData;
        } else {
          // Add new save
          newSaves = [...state.saves, saveData];
        }
        
        // Store saves in localStorage
        try {
          localStorage.setItem('cosmic_odyssey_saves', JSON.stringify(newSaves));
        } catch (error) {
          console.error('Error saving game:', error);
        }
        
        return { 
          saves: newSaves,
          currentSaveId: saveId 
        };
      });
      
      console.log(`Game saved as "${saveName}"`);
      return saveId;
    },

    loadGame: (saveId: string) => {
      // Find the requested save
      const saveToLoad = get().saves.find(save => save.id === saveId);
      
      if (!saveToLoad) {
        console.error(`Save with ID ${saveId} not found`);
        return false;
      }
      
      try {
        // Load data into each store
        if (saveToLoad.character) {
          const characterStore = useCharacter.getState();
          
          if (saveToLoad.character.activeCharacter) {
            characterStore.setActiveCharacter(saveToLoad.character.activeCharacter);
          }
          
          if (typeof saveToLoad.character.availableSkillPoints === 'number') {
            characterStore.setAvailableSkillPoints(saveToLoad.character.availableSkillPoints);
          }
        }
        
        if (saveToLoad.inventory) {
          const inventoryStore = useInventory.getState();
          
          if (Array.isArray(saveToLoad.inventory.items)) {
            inventoryStore.setItems(saveToLoad.inventory.items);
          }
          
          if (typeof saveToLoad.inventory.credits === 'number') {
            inventoryStore.setCredits(saveToLoad.inventory.credits);
          }
          
          if (typeof saveToLoad.inventory.capacity === 'number') {
            inventoryStore.setCapacity(saveToLoad.inventory.capacity);
          }
        }
        
        if (saveToLoad.story) {
          const storyStore = useStory.getState();
          
          if (saveToLoad.story.currentLocation) {
            storyStore.setCurrentLocation(saveToLoad.story.currentLocation);
          }
          
          if (Array.isArray(saveToLoad.story.visitedLocations)) {
            storyStore.setVisitedLocations(saveToLoad.story.visitedLocations);
          }
          
          if (saveToLoad.story.questProgress) {
            storyStore.setQuestProgress(saveToLoad.story.questProgress);
          }
          
          if (saveToLoad.story.storyFlags) {
            storyStore.setStoryFlags(saveToLoad.story.storyFlags);
          }
        }
        
        if (saveToLoad.game) {
          const gameStore = useGame.getState();
          
          if (saveToLoad.game.settings) {
            gameStore.setSettings(saveToLoad.game.settings);
          }
          
          if (saveToLoad.game.gameState) {
            gameStore.setGameState(saveToLoad.game.gameState);
          }
        }
        
        if (saveToLoad.companion) {
          // For companion data, we'll need to write specific loading logic
          // depending on the companion store's actions
          if (saveToLoad.companion.activeCompanion) {
            // For example, if there's a setActiveCompanion action
            // useCompanion.getState().setActiveCompanion(saveToLoad.companion.activeCompanion);
          }
        }
        
        // Update current save ID
        set({ currentSaveId: saveId });
        
        console.log(`Game loaded: ${saveToLoad.name}`);
        return true;
      } catch (error) {
        console.error('Error loading game:', error);
        return false;
      }
    },

    deleteSave: (saveId: string) => {
      // Remove save from array
      set(state => {
        const newSaves = state.saves.filter(save => save.id !== saveId);
        
        // Update localStorage
        try {
          localStorage.setItem('cosmic_odyssey_saves', JSON.stringify(newSaves));
        } catch (error) {
          console.error('Error updating saved games:', error);
        }
        
        // If we deleted the current save, set currentSaveId to null
        const currentSaveId = state.currentSaveId === saveId ? null : state.currentSaveId;
        
        return { saves: newSaves, currentSaveId };
      });
      
      console.log(`Save deleted: ${saveId}`);
    },

    // Getters
    getSaves: () => {
      return get().saves;
    },
    
    getCurrentSave: () => {
      const { currentSaveId, saves } = get();
      if (!currentSaveId) return null;
      
      return saves.find(save => save.id === currentSaveId) || null;
    }
  };
});