import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Simple save data structure
export interface SaveData {
  id: string;
  name: string;
  timestamp: number;
  data: any; // Store all game state as serialized JSON
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

export const useSaveManager = create<SaveManagerState>()(
  persist(
    (set, get) => {
      // Initialize saves from localStorage if available
      const initialSaves: SaveData[] = [];

      return {
        // Initial state
        saves: initialSaves,
        currentSaveId: null,

        // Actions
        saveGame: (saveName: string) => {
          // Create save ID or reuse current
          const saveId = get().currentSaveId || uuidv4();
          
          // Get data from localStorage for each store
          const gameState: Record<string, any> = {};
          
          try {
            // Go through all localStorage items that match our patterns
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.endsWith('-storage')) {
                const value = localStorage.getItem(key);
                if (value) {
                  gameState[key] = JSON.parse(value);
                }
              }
            }
          } catch (error) {
            console.error('Error reading from localStorage:', error);
          }
          
          // Create save data object 
          const saveData: SaveData = {
            id: saveId,
            name: saveName,
            timestamp: Date.now(),
            data: gameState
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
            // Restore data to localStorage
            const { data } = saveToLoad;
            
            if (data) {
              // Write each store's data back to localStorage
              Object.entries(data).forEach(([key, value]) => {
                try {
                  localStorage.setItem(key, JSON.stringify(value));
                } catch (error) {
                  console.error(`Error restoring data for ${key}:`, error);
                }
              });
            }
            
            // Update current save ID
            set({ currentSaveId: saveId });
            
            console.log(`Game loaded: ${saveToLoad.name}`);
            
            // Reload the page to apply loaded state
            window.location.reload();
            
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
    },
    {
      name: "save-manager-storage",
      partialize: (state) => ({ 
        saves: state.saves,
        currentSaveId: state.currentSaveId
      })
    }
  )
);