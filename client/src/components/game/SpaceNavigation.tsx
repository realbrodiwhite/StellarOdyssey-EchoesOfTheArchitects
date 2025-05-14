import { useState, useEffect } from "react";
import { useStory } from "@/lib/stores/useStory";
import { gameLocations } from "@/lib/data/locations";
import { Location, LocationType } from "@/lib/types";
import { motion } from "framer-motion";

interface SpaceNavigationProps {
  onClose: () => void;
  onSelectLocation: (locationId: string) => void;
}

const SpaceNavigation = ({ onClose, onSelectLocation }: SpaceNavigationProps) => {
  const { 
    getCurrentLocation, 
    moveToLocation, 
    canTravelTo, 
    visitedLocations, 
    discoveredLocations 
  } = useStory();
  
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [regions, setRegions] = useState<Record<string, Location[]>>({});
  const [currentRegion, setCurrentRegion] = useState<string | null>(null);
  
  const currentLocation = getCurrentLocation();
  
  // Group locations by region on component mount
  useEffect(() => {
    const regionMap: Record<string, Location[]> = {};
    
    gameLocations.forEach(location => {
      // Skip undiscovered locations unless they are connected to current location
      if (!discoveredLocations.includes(location.id) && 
          !canTravelTo(location.id) &&
          !visitedLocations.includes(location.id)) {
        return;
      }
      
      const region = location.region || "Unknown";
      if (!regionMap[region]) {
        regionMap[region] = [];
      }
      regionMap[region].push(location);
    });
    
    setRegions(regionMap);
    
    // Set initial region to current location's region
    if (currentLocation?.region) {
      setCurrentRegion(currentLocation.region);
    } else if (Object.keys(regionMap).length > 0) {
      setCurrentRegion(Object.keys(regionMap)[0]);
    }
  }, [discoveredLocations, canTravelTo, visitedLocations, currentLocation]);
  
  // Set initial selected location to current location
  useEffect(() => {
    if (currentLocation) {
      setSelectedLocationId(currentLocation.id);
    }
  }, [currentLocation]);
  
  const handleSelectLocation = (locationId: string) => {
    setSelectedLocationId(locationId);
  };
  
  const handleTravel = () => {
    if (selectedLocationId && selectedLocationId !== currentLocation?.id) {
      moveToLocation(selectedLocationId);
      onSelectLocation(selectedLocationId);
      onClose();
    }
  };
  
  const getLocationTypeIcon = (type: LocationType) => {
    switch (type) {
      case LocationType.Ship:
        return "🚀";
      case LocationType.Planet:
        return "🪐";
      case LocationType.Space:
        return "✨";
      case LocationType.Station:
        return "🛰️";
      case LocationType.Derelict:
        return "☠️";
      case LocationType.Settlement:
        return "🏙️";
      case LocationType.Ruins:
        return "🏛️";
      case LocationType.Anomaly:
        return "❓";
      default:
        return "📍";
    }
  };
  
  const getSelectedLocation = () => {
    if (!selectedLocationId) return null;
    return gameLocations.find(loc => loc.id === selectedLocationId);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-gray-900 border border-blue-500 shadow-xl rounded-lg w-full max-w-5xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 bg-gradient-to-r from-blue-900 to-purple-900 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold">Navigation Console</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-400 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="flex h-[70vh]">
          {/* Galaxy Map with regions */}
          <div className="w-1/4 bg-gray-950 border-r border-blue-900 p-4 overflow-y-auto">
            <h3 className="text-blue-400 text-lg font-semibold mb-3">Regions</h3>
            <ul className="space-y-1">
              {Object.keys(regions).map(region => (
                <li key={region}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md ${currentRegion === region 
                      ? 'bg-blue-900 text-white' 
                      : 'hover:bg-gray-800 text-gray-300'}`}
                    onClick={() => setCurrentRegion(region)}
                  >
                    {region}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Region map with locations */}
          <div className="w-1/2 p-4 bg-gray-900 overflow-y-auto">
            <h3 className="text-blue-400 text-lg font-semibold mb-3">
              {currentRegion || "Select Region"}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {currentRegion && regions[currentRegion]?.map(location => {
                const isCurrentLocation = location.id === currentLocation?.id;
                const canTravel = canTravelTo(location.id) || isCurrentLocation;
                const isVisited = visitedLocations.includes(location.id);
                const isSelected = location.id === selectedLocationId;
                
                return (
                  <button
                    key={location.id}
                    className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-900 border-blue-500 shadow-lg' 
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    } ${
                      !canTravel 
                        ? 'opacity-60 cursor-not-allowed' 
                        : 'cursor-pointer'
                    }`}
                    onClick={() => canTravel && handleSelectLocation(location.id)}
                    disabled={!canTravel}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getLocationTypeIcon(location.type)}</span>
                      <span className="font-medium text-white">
                        {location.name}
                        {isCurrentLocation && " (Current)"}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-400">
                      {isVisited ? "Visited" : canTravel ? "Available" : "Locked"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Location details */}
          <div className="w-1/4 bg-gray-950 border-l border-blue-900 p-4 overflow-y-auto">
            <h3 className="text-blue-400 text-lg font-semibold mb-3">Details</h3>
            
            {getSelectedLocation() ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-semibold text-white mb-1">
                    {getLocationTypeIcon(getSelectedLocation()!.type)} {getSelectedLocation()!.name}
                  </h4>
                  <div className="text-xs text-blue-300 mb-2">
                    {getSelectedLocation()!.type} • {getSelectedLocation()!.region || "Unknown Region"}
                  </div>
                  <p className="text-gray-300 text-sm">
                    {getSelectedLocation()!.description}
                  </p>
                </div>
                
                {selectedLocationId !== currentLocation?.id && canTravelTo(selectedLocationId!) && (
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
                    onClick={handleTravel}
                  >
                    Travel to Location
                  </button>
                )}
                
                {getSelectedLocation()!.encounters && (
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-200 mb-1">Known Encounters:</h5>
                    <ul className="text-xs text-gray-400">
                      {getSelectedLocation()!.encounters.enemies?.length ? (
                        <li>• Hostile entities detected</li>
                      ) : null}
                      {getSelectedLocation()!.encounters.puzzles?.length ? (
                        <li>• Points of interest detected</li>
                      ) : null}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Select a location to view details
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SpaceNavigation;