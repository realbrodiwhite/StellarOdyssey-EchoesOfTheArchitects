import React, { useState, useEffect, useRef } from 'react';
import { useStory } from '@/lib/stores/useStory';
import { gameLocations } from '@/lib/data/locations';
import { Location, LocationType } from '@/lib/types';
import { motion } from 'framer-motion';

interface StarMapProps {
  onSelectLocation: (locationId: string) => void;
  onClose: () => void;
}

const StarMap = ({ onSelectLocation, onClose }: StarMapProps) => {
  const { 
    getCurrentLocation, 
    canTravelTo, 
    visitedLocations, 
    discoveredLocations 
  } = useStory();
  
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [regions, setRegions] = useState<Record<string, Location[]>>({});
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const currentLocation = getCurrentLocation();
  
  // Group locations by region and initialize selected region
  useEffect(() => {
    const regionMap: Record<string, Location[]> = {};
    
    gameLocations.forEach(location => {
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
      setSelectedRegion(currentLocation.region);
    } else if (Object.keys(regionMap).length > 0) {
      setSelectedRegion(Object.keys(regionMap)[0]);
    }
    
    // Set initial selected location to current location
    if (currentLocation) {
      setSelectedLocation(currentLocation.id);
    }
  }, [discoveredLocations, canTravelTo, visitedLocations, currentLocation]);
  
  // Draw the star map canvas when region or locations change
  useEffect(() => {
    if (!canvasRef.current || !selectedRegion) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear the canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get relevant locations for this region
    const locationsInRegion = regions[selectedRegion] || [];
    
    // Draw connection lines first (so they appear behind locations)
    ctx.lineWidth = 1;
    locationsInRegion.forEach(location => {
      // Only draw connections if this location is visited or current
      if (visitedLocations.includes(location.id) || location.id === currentLocation?.id) {
        location.connections.forEach(connId => {
          // Only draw if the connection is in the same region and is discovered
          const connLocation = locationsInRegion.find(l => l.id === connId);
          if (connLocation && discoveredLocations.includes(connId)) {
            // Find screen coordinates for both locations
            const x1 = getLocationPositionX(location.id, canvas.width);
            const y1 = getLocationPositionY(location.id, canvas.height);
            const x2 = getLocationPositionX(connId, canvas.width);
            const y2 = getLocationPositionY(connId, canvas.height);
            
            // Determine line style based on if it's a possible travel route
            if (canTravelTo(connId) || connId === currentLocation?.id) {
              ctx.strokeStyle = 'rgba(100, 149, 237, 0.7)'; // Brighter line for valid travel routes
            } else {
              ctx.strokeStyle = 'rgba(100, 149, 237, 0.3)'; // Dimmer line for routes not currently available
            }
            
            // Draw the line
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        });
      }
    });
    
    // Draw backgrounds for locations (glow effects)
    locationsInRegion.forEach(location => {
      if (!discoveredLocations.includes(location.id)) return;
      
      const x = getLocationPositionX(location.id, canvas.width);
      const y = getLocationPositionY(location.id, canvas.height);
      const isCurrentLocation = location.id === currentLocation?.id;
      const isSelected = location.id === selectedLocation;
      const isHovered = location.id === hoveredLocation;
      const canTravel = canTravelTo(location.id);
      
      // Draw glow based on location status
      let radius = 12;
      let glowColor = 'rgba(50, 50, 100, 0.3)'; // Default
      
      if (isCurrentLocation) {
        radius = 18;
        glowColor = 'rgba(0, 255, 128, 0.5)'; // Green glow for current location
      } else if (isSelected) {
        radius = 16;
        glowColor = 'rgba(100, 149, 237, 0.5)'; // Blue glow for selected
      } else if (isHovered && canTravel) {
        radius = 14;
        glowColor = 'rgba(255, 210, 0, 0.4)'; // Yellow glow for hovered and travel-able
      }
      
      // Draw the location glow
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();
    });
    
    // Draw location points
    locationsInRegion.forEach(location => {
      if (!discoveredLocations.includes(location.id)) return;
      
      const x = getLocationPositionX(location.id, canvas.width);
      const y = getLocationPositionY(location.id, canvas.height);
      const isCurrentLocation = location.id === currentLocation?.id;
      const isSelected = location.id === selectedLocation;
      const isHovered = location.id === hoveredLocation;
      const isVisited = visitedLocations.includes(location.id);
      const canTravel = canTravelTo(location.id);
      
      // Determine appearance based on location status
      let radius = 5;
      let fillColor = '#666';
      
      if (isCurrentLocation) {
        radius = 8;
        fillColor = '#00ff80'; // Green for current location
      } else if (isSelected) {
        radius = 7;
        fillColor = '#6495ED'; // Blue for selected
      } else if (isHovered && canTravel) {
        radius = 6;
        fillColor = '#FFD700'; // Gold for hovered and travel-able
      } else if (isVisited) {
        fillColor = '#a0a0ff'; // Light blue for visited
      } else if (canTravel) {
        fillColor = '#90a0d0'; // Light purple for available but not visited
      }
      
      // Draw the location point
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      
      // Add a border for clarity
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw location names for important ones
      if (isCurrentLocation || isSelected || isHovered) {
        ctx.font = '12px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(location.name, x, y - 15);
        
        // Draw location type
        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(location.type, x, y + 15);
      }
    });
  }, [selectedRegion, regions, selectedLocation, hoveredLocation, currentLocation, canTravelTo, visitedLocations, discoveredLocations]);

  // Generate consistent positions based on location ID
  const getLocationPositionX = (locationId: string, width: number): number => {
    // Use a hash of the location ID to get a consistent position
    let hash = 0;
    for (let i = 0; i < locationId.length; i++) {
      hash = ((hash << 5) - hash) + locationId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Create a seeded random position within the bounds
    const padding = 50;
    return ((Math.abs(hash) % 83) / 100) * (width - padding * 2) + padding;
  };
  
  const getLocationPositionY = (locationId: string, height: number): number => {
    // Use a different hash calculation for Y to ensure different positions
    let hash = 0;
    for (let i = 0; i < locationId.length; i++) {
      hash = ((hash << 7) - hash) + locationId.charCodeAt(i);
      hash |= 0;
    }
    
    const padding = 50;
    return ((Math.abs(hash) % 89) / 100) * (height - padding * 2) + padding;
  };
  
  // Handle canvas click events
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedRegion) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Get locations in the current region
    const locationsInRegion = regions[selectedRegion] || [];
    
    // Find if we clicked on a location
    for (const location of locationsInRegion) {
      if (!discoveredLocations.includes(location.id)) continue;
      
      const locX = getLocationPositionX(location.id, canvas.width);
      const locY = getLocationPositionY(location.id, canvas.height);
      
      // Check if click is within the location point (use a reasonable radius for clicking)
      const distance = Math.sqrt(Math.pow(x - locX, 2) + Math.pow(y - locY, 2));
      if (distance <= 15) { // 15px click radius
        setSelectedLocation(location.id);
        
        // If the location is travel-able and not the current one, select it
        if (canTravelTo(location.id) && location.id !== currentLocation?.id) {
          // Just select it, don't navigate yet
          return;
        }
        break;
      }
    }
  };
  
  // Handle canvas mouse move for hover effects
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedRegion) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Get locations in the current region
    const locationsInRegion = regions[selectedRegion] || [];
    
    // Check for hover over locations
    let found = false;
    for (const location of locationsInRegion) {
      if (!discoveredLocations.includes(location.id)) continue;
      
      const locX = getLocationPositionX(location.id, canvas.width);
      const locY = getLocationPositionY(location.id, canvas.height);
      
      const distance = Math.sqrt(Math.pow(x - locX, 2) + Math.pow(y - locY, 2));
      if (distance <= 15) { // Same hover radius as click
        setHoveredLocation(location.id);
        found = true;
        break;
      }
    }
    
    if (!found && hoveredLocation) {
      setHoveredLocation(null);
    }
  };
  
  const handleCanvasMouseLeave = () => {
    setHoveredLocation(null);
  };
  
  // Get the currently selected location object
  const getSelectedLocationDetails = () => {
    if (!selectedLocation) return null;
    return gameLocations.find(loc => loc.id === selectedLocation);
  };
  
  // Travel to the selected location
  const handleTravel = () => {
    if (selectedLocation && currentLocation?.id !== selectedLocation && canTravelTo(selectedLocation)) {
      onSelectLocation(selectedLocation);
      onClose();
    }
  };
  
  const getLocationTypeIcon = (type: LocationType): string => {
    switch (type) {
      case LocationType.Ship:
        return '🚀';
      case LocationType.Planet:
        return '🪐';
      case LocationType.Space:
        return '✨';
      case LocationType.Station:
        return '🛰️';
      case LocationType.Derelict:
        return '☠️';
      case LocationType.Settlement:
        return '🏙️';
      case LocationType.Ruins:
        return '🏛️';
      case LocationType.Anomaly:
        return '❓';
      default:
        return '📍';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <motion.div 
        className="bg-gray-900 border border-blue-500 shadow-lg rounded-lg max-w-5xl w-[90vw] overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-purple-900 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold">Star Map</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-400 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row h-[75vh]">
          {/* Region selector */}
          <div className="w-full md:w-1/5 bg-gray-950 border-r border-blue-900 p-3 overflow-y-auto">
            <h3 className="text-blue-400 text-lg font-semibold mb-3">Regions</h3>
            <ul className="space-y-1">
              {Object.keys(regions).map(region => (
                <li key={region}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md ${selectedRegion === region 
                      ? 'bg-blue-900 text-white' 
                      : 'hover:bg-gray-800 text-gray-300'}`}
                    onClick={() => setSelectedRegion(region)}
                  >
                    {region}
                    <span className="text-xs ml-2 text-gray-400">
                      ({regions[region].length})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Star map canvas */}
          <div className="w-full md:w-3/5 bg-gray-900 p-0 relative overflow-hidden">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full cursor-pointer" 
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
            />
            
            {/* Map controls overlay */}
            <div className="absolute bottom-3 left-3 right-3 bg-black bg-opacity-50 text-white text-xs p-2 rounded flex items-center justify-between">
              <div>
                <div className="flex items-center mb-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-2"></span>
                  <span>Your Location</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                  <span>Travel Routes</span>
                </div>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
                  <span>Unexplored</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                  <span>Selected</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Location details */}
          <div className="w-full md:w-1/5 bg-gray-950 border-l border-blue-900 p-3 overflow-y-auto">
            <h3 className="text-blue-400 text-lg font-semibold mb-3">Details</h3>
            
            {getSelectedLocationDetails() ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-semibold text-white mb-1">
                    {getLocationTypeIcon(getSelectedLocationDetails()!.type)} {getSelectedLocationDetails()!.name}
                  </h4>
                  <div className="text-xs text-blue-300 mb-2">
                    {getSelectedLocationDetails()!.type} • {getSelectedLocationDetails()!.region || "Unknown Region"}
                  </div>
                  <p className="text-gray-300 text-sm">
                    {getSelectedLocationDetails()!.description}
                  </p>
                </div>
                
                {selectedLocation !== currentLocation?.id && canTravelTo(selectedLocation!) && (
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
                    onClick={handleTravel}
                  >
                    Set Course
                  </button>
                )}
                
                {getSelectedLocationDetails()!.encounters && (
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-200 mb-1">Known Data:</h5>
                    <ul className="text-xs text-gray-400">
                      {getSelectedLocationDetails()!.encounters.enemies?.length ? (
                        <li className="mb-1">• Hostile entities detected</li>
                      ) : null}
                      {getSelectedLocationDetails()!.encounters.puzzles?.length ? (
                        <li className="mb-1">• Points of interest detected</li>
                      ) : null}
                      {visitedLocations.includes(selectedLocation!) ? (
                        <li className="text-blue-300">• Location previously visited</li>
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

export default StarMap;