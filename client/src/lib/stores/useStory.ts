import { create } from 'zustand';
import { Location, GameState, Faction } from '../types';
import { gameLocations } from '../data/locations';
import { generateExplorationPoints } from '../utils/explorationGenerator';

// Merged game locations including both predefined and procedurally generated ones
let allGameLocations: Location[] = [...gameLocations];

// Keep track of exploration points separately for easy access
let explorationPoints: Location[] = [];

interface StoryState {
  gameState: GameState;
  
  // Getters
  getCurrentLocation: () => Location | undefined;
  getLocationById: (id: string) => Location | undefined;
  getVisitedLocations: () => string[];
  getDiscoveredLocations: () => string[];
  canTravelTo: (locationId: string) => boolean;
  
  // Exploration management
  generateExplorationPoints: (seed?: number) => Location[];
  getExplorationPoints: () => Location[];
  getAvailableLocations: () => Location[];
  discoverNearbyExplorationPoints: (currentLocationId: string, chance?: number) => string[];
  
  // Reputation management
  getFactionReputation: (faction: Faction) => number;
  
  // Setters
  moveToLocation: (locationId: string) => boolean;
  completePuzzle: (puzzleId: string) => void;
  defeatEnemy: (enemyId: string) => void;
  setQuestProgress: (questId: string, data: any) => void;
  setStoryFlag: (flag: string, value: boolean) => void;
  discoverLocation: (locationId: string) => void;
  changeFactionReputation: (faction: Faction, amount: number) => void;
  
  // Internal placeholders (these will be replaced with getters)
  _tempVisitedLocations: any[];
  _tempDiscoveredLocations: any[];
}

export const useStory = create<StoryState>((set, get) => ({
  gameState: {
    currentLocation: "ship", // Start on the player's ship
    completedPuzzles: [],
    defeatedEnemies: [],
    visitedLocations: ["ship"], // Start with the ship as visited
    discoveredLocations: ["ship", "frontier_outpost"], // Know about the ship and the nearby outpost
    questProgress: {},
    storyFlags: {
      // Initial story flags, if any
      hasMetCaptain: false,
      discoveredArtifact: false
    },
    worldState: {
      factionReputation: {
        [Faction.Alliance]: 0,
        [Faction.Syndicate]: -10,
        [Faction.Settlers]: 0,
        [Faction.Mystics]: 0,
        [Faction.Independent]: 0,
        [Faction.VoidEntity]: -20
      }
    },
    currentGameTime: 0,
    gameStartTime: Date.now(),
    totalPlayTime: 0,
    decisions: []
  },
  
  // Getters
  getCurrentLocation: () => {
    const { currentLocation } = get().gameState;
    return allGameLocations.find(loc => loc.id === currentLocation);
  },
  
  getLocationById: (id: string) => {
    return allGameLocations.find(loc => loc.id === id);
  },
  
  getVisitedLocations: () => {
    return get().gameState.visitedLocations;
  },
  
  getDiscoveredLocations: () => {
    return get().gameState.discoveredLocations;
  },
  
  canTravelTo: (locationId: string) => {
    const currentLocation = get().getCurrentLocation();
    if (!currentLocation) return false;
    
    // Can travel if either:
    // 1. The location is directly connected to current location
    // 2. The player has high navigation skill (would need to be implemented)
    return currentLocation.connections.includes(locationId);
  },
  
  // Exploration Management
  generateExplorationPoints: (seed = Date.now()) => {
    // Generate new exploration points based on existing locations
    explorationPoints = generateExplorationPoints(gameLocations, {
      baseSeed: seed,
      baseRegions: Array.from(new Set(gameLocations.map(loc => loc.region || "Unknown"))),
      densityFactor: 0.7,
      generateConnections: true
    });
    
    // Update all game locations to include both predefined and procedural
    allGameLocations = [...gameLocations, ...explorationPoints];
    
    return explorationPoints;
  },
  
  getExplorationPoints: () => {
    // If we haven't generated exploration points yet, do it now with default settings
    if (explorationPoints.length === 0) {
      return get().generateExplorationPoints();
    }
    
    return explorationPoints;
  },
  
  getAvailableLocations: () => {
    // Return all locations that the player has discovered
    const discoveredIds = get().gameState.discoveredLocations;
    return allGameLocations.filter(loc => discoveredIds.includes(loc.id));
  },
  
  discoverNearbyExplorationPoints: (currentLocationId: string, chance = 0.5) => {
    const currentLocation = get().getLocationById(currentLocationId);
    if (!currentLocation) return [];
    
    // Get connected locations that are exploration points and not yet discovered
    const nearbyPoints = currentLocation.connections
      .map(id => explorationPoints.find(loc => loc.id === id))
      .filter(loc => loc && !get().gameState.discoveredLocations.includes(loc.id)) as Location[];
    
    // Randomly discover some of these points based on chance
    const discoveredPoints: string[] = [];
    nearbyPoints.forEach(point => {
      // Use a basic random chance for discovery
      if (Math.random() < chance) {
        get().discoverLocation(point.id);
        discoveredPoints.push(point.id);
      }
    });
    
    return discoveredPoints;
  },
  
  getFactionReputation: (faction: Faction) => {
    const { worldState } = get().gameState;
    return worldState.factionReputation[faction] || 0;
  },
  
  // Derived properties
  get visitedLocations() {
    return get().gameState.visitedLocations;
  },
  
  get discoveredLocations() {
    return get().gameState.discoveredLocations;
  },
  
  // Setters
  moveToLocation: (locationId: string) => {
    const currentLocation = get().getCurrentLocation();
    
    // Ensure the location exists
    const targetLocation = get().getLocationById(locationId);
    if (!targetLocation) {
      console.error(`Location with ID "${locationId}" not found`);
      return false;
    }
    
    // Check if the location is connected to the current one
    if (currentLocation && !currentLocation.connections.includes(locationId)) {
      console.error(`Cannot travel to location "${locationId}" - not connected to current location`);
      return false;
    }
    
    // Add to visited locations if not already visited
    let visitedLocations = get().gameState.visitedLocations;
    if (!visitedLocations.includes(locationId)) {
      visitedLocations = [...visitedLocations, locationId];
    }
    
    // Move to the location
    set(state => ({
      gameState: {
        ...state.gameState,
        currentLocation: locationId,
        visitedLocations
      }
    }));
    
    // Discover connected locations
    const newlyDiscoveredLocations = targetLocation.connections.filter(
      connectedId => !get().gameState.discoveredLocations.includes(connectedId)
    );
    
    if (newlyDiscoveredLocations.length > 0) {
      set(state => ({
        gameState: {
          ...state.gameState,
          discoveredLocations: [
            ...state.gameState.discoveredLocations,
            ...newlyDiscoveredLocations
          ]
        }
      }));
    }
    
    console.log(`Moved to location: ${targetLocation.name}`);
    return true;
  },
  
  completePuzzle: (puzzleId: string) => {
    set(state => ({
      gameState: {
        ...state.gameState,
        completedPuzzles: [...state.gameState.completedPuzzles, puzzleId]
      }
    }));
  },
  
  defeatEnemy: (enemyId: string) => {
    set(state => ({
      gameState: {
        ...state.gameState,
        defeatedEnemies: [...state.gameState.defeatedEnemies, enemyId]
      }
    }));
  },
  
  setQuestProgress: (questId: string, data: any) => {
    set(state => ({
      gameState: {
        ...state.gameState,
        questProgress: {
          ...state.gameState.questProgress,
          [questId]: {
            ...state.gameState.questProgress[questId],
            ...data
          }
        }
      }
    }));
  },
  
  setStoryFlag: (flag: string, value: boolean) => {
    set(state => ({
      gameState: {
        ...state.gameState,
        storyFlags: {
          ...state.gameState.storyFlags,
          [flag]: value
        }
      }
    }));
  },
  
  discoverLocation: (locationId: string) => {
    if (get().gameState.discoveredLocations.includes(locationId)) {
      return; // Already discovered
    }
    
    set(state => ({
      gameState: {
        ...state.gameState,
        discoveredLocations: [...state.gameState.discoveredLocations, locationId]
      }
    }));
  },
  
  changeFactionReputation: (faction: Faction, amount: number) => {
    set(state => ({
      gameState: {
        ...state.gameState,
        worldState: {
          ...state.gameState.worldState,
          factionReputation: {
            ...state.gameState.worldState.factionReputation,
            [faction]: (state.gameState.worldState.factionReputation[faction] || 0) + amount
          }
        }
      }
    }));
    
    console.log(`Reputation with ${faction} changed by ${amount}`);
  },
  
  // Use any other property names to avoid conflicts
  _tempVisitedLocations: [],
  _tempDiscoveredLocations: []
}));

// Update the state store to add the getters we need
const storeAPI = useStory.getState();

// Define the required properties as getters
Object.defineProperties(storeAPI, {
  visitedLocations: {
    get: function() { return this.gameState.visitedLocations; }
  },
  discoveredLocations: {
    get: function() { return this.gameState.discoveredLocations; }
  }
});

// Initialize exploration points at startup
useStory.getState().generateExplorationPoints();