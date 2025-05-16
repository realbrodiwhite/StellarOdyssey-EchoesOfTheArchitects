import { create } from 'zustand';
import { Location, LocationType } from '@/lib/types';
import { locations, getLocationById, discoverLocation } from '@/lib/data/locations';

interface LocationState {
  // Current location data
  currentLocationId: string;
  previousLocationId: string | null;
  visitedLocationIds: string[];
  discoveredLocationIds: string[];

  // Navigation data
  availableLocationIds: string[];
  navigationInProgress: boolean;
  navigationTarget: string | null;
  navigationProgress: number;
  navigationTime: number;
  
  // Location Actions  
  setCurrentLocation: (locationId: string) => void;
  visitLocation: (locationId: string) => void;
  discoverNewLocation: (locationId: string) => void;
  startNavigation: (targetLocationId: string, timeInSeconds: number) => void;
  updateNavigationProgress: (progress: number) => void;
  completeNavigation: () => void;
  cancelNavigation: () => void;
  
  // Location Getters
  getCurrentLocation: () => Location | undefined;
  getVisitedLocations: () => Location[];
  getDiscoveredLocations: () => Location[];
  getAvailableLocations: () => Location[];
  getNavigationTarget: () => Location | undefined;
  isLocationVisited: (locationId: string) => boolean;
  isLocationDiscovered: (locationId: string) => boolean;
  getConnectedLocations: (locationId: string) => Location[];
}

export const useLocation = create<LocationState>((set, get) => ({
  // Initial State
  currentLocationId: 'solara_system', // Default starting location
  previousLocationId: null,
  visitedLocationIds: ['solara_system', 'solara_prime', 'haven_station'], // Start with a few visited locations
  discoveredLocationIds: ['solara_system', 'solara_prime', 'haven_station'], // Start with these locations discovered
  
  availableLocationIds: [], // Will be populated when visiting a location
  navigationInProgress: false,
  navigationTarget: null,
  navigationProgress: 0,
  navigationTime: 0,
  
  // Actions
  setCurrentLocation: (locationId: string) => {
    const location = getLocationById(locationId);
    if (!location) return;
    
    set(state => ({
      currentLocationId: locationId,
      previousLocationId: state.currentLocationId,
      availableLocationIds: location.connections || []
    }));
  },
  
  visitLocation: (locationId: string) => {
    const location = getLocationById(locationId);
    if (!location) return;
    
    set(state => ({
      currentLocationId: locationId,
      previousLocationId: state.currentLocationId,
      visitedLocationIds: state.visitedLocationIds.includes(locationId) 
        ? state.visitedLocationIds 
        : [...state.visitedLocationIds, locationId],
      availableLocationIds: location.connections || []
    }));
  },
  
  discoverNewLocation: (locationId: string) => {
    const location = getLocationById(locationId);
    if (!location) return;
    
    // Update the location data
    discoverLocation(locationId);
    
    set(state => ({
      discoveredLocationIds: state.discoveredLocationIds.includes(locationId)
        ? state.discoveredLocationIds
        : [...state.discoveredLocationIds, locationId]
    }));
  },
  
  startNavigation: (targetLocationId: string, timeInSeconds: number) => {
    const targetLocation = getLocationById(targetLocationId);
    if (!targetLocation) return;
    
    set({
      navigationInProgress: true,
      navigationTarget: targetLocationId,
      navigationProgress: 0,
      navigationTime: timeInSeconds
    });
  },
  
  updateNavigationProgress: (progress: number) => {
    set({
      navigationProgress: Math.min(Math.max(progress, 0), 100) // Clamp between 0-100
    });
  },
  
  completeNavigation: () => {
    const { navigationTarget } = get();
    if (navigationTarget) {
      get().visitLocation(navigationTarget);
    }
    
    set({
      navigationInProgress: false,
      navigationTarget: null,
      navigationProgress: 0,
      navigationTime: 0
    });
  },
  
  cancelNavigation: () => {
    set({
      navigationInProgress: false,
      navigationTarget: null,
      navigationProgress: 0,
      navigationTime: 0
    });
  },
  
  // Getters
  getCurrentLocation: () => {
    return getLocationById(get().currentLocationId);
  },
  
  getVisitedLocations: () => {
    return get().visitedLocationIds
      .map(id => getLocationById(id))
      .filter((loc): loc is Location => loc !== undefined);
  },
  
  getDiscoveredLocations: () => {
    return get().discoveredLocationIds
      .map(id => getLocationById(id))
      .filter((loc): loc is Location => loc !== undefined);
  },
  
  getAvailableLocations: () => {
    const currentLocation = get().getCurrentLocation();
    if (!currentLocation || !currentLocation.connections) return [];
    
    return currentLocation.connections
      .map(id => getLocationById(id))
      .filter((loc): loc is Location => loc !== undefined);
  },
  
  getNavigationTarget: () => {
    const { navigationTarget } = get();
    if (!navigationTarget) return undefined;
    return getLocationById(navigationTarget);
  },
  
  isLocationVisited: (locationId: string) => {
    return get().visitedLocationIds.includes(locationId);
  },
  
  isLocationDiscovered: (locationId: string) => {
    return get().discoveredLocationIds.includes(locationId);
  },
  
  getConnectedLocations: (locationId: string) => {
    const location = getLocationById(locationId);
    if (!location || !location.connections) return [];
    
    return location.connections
      .map(id => getLocationById(id))
      .filter((loc): loc is Location => loc !== undefined);
  }
}));

export default useLocation;