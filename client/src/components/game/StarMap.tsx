import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStory } from '../../lib/stores/useStory';
import { Location, LocationType } from '../../lib/types';
import { cn } from '../../lib/utils';
import { useAudio } from '../../lib/stores/useAudio';

interface StarMapProps {
  onClose: () => void;
  onSelectLocation?: (locationId: string) => void;
}

// Different colors for different location types
const getLocationColor = (locationType: LocationType): string => {
  switch (locationType) {
    case LocationType.Ship:
      return 'bg-blue-500';
    case LocationType.Planet:
      return 'bg-green-500';
    case LocationType.Space:
      return 'bg-indigo-800';
    case LocationType.Station:
      return 'bg-yellow-500';
    case LocationType.Derelict:
      return 'bg-red-700';
    case LocationType.Settlement:
      return 'bg-amber-500';
    case LocationType.Ruins:
      return 'bg-purple-700';
    case LocationType.Anomaly:
      return 'bg-pink-500';
    default:
      return 'bg-gray-500';
  }
};

// Function to get an icon based on location type
const getLocationIcon = (locationType: LocationType): string => {
  switch (locationType) {
    case LocationType.Ship:
      return '🚀';
    case LocationType.Planet:
      return '🪐';
    case LocationType.Space:
      return '✨';
    case LocationType.Station:
      return '🛰️';
    case LocationType.Derelict:
      return '🛸';
    case LocationType.Settlement:
      return '🏙️';
    case LocationType.Ruins:
      return '🏛️';
    case LocationType.Anomaly:
      return '⚠️';
    default:
      return '❓';
  }
};

// Get danger level indicator
const getDangerLevelIndicator = (dangerLevel: number = 1): string => {
  if (dangerLevel <= 3) return 'Low Threat';
  if (dangerLevel <= 6) return 'Medium Threat';
  return 'High Threat';
};

// Get danger level color
const getDangerLevelColor = (dangerLevel: number = 1): string => {
  if (dangerLevel <= 3) return 'text-green-500';
  if (dangerLevel <= 6) return 'text-yellow-500';
  return 'text-red-500';
};

// Calculate pseudo-position for locations for visual layout
const calculateMapPositions = (locations: Location[]): Map<string, { x: number, y: number }> => {
  const positionMap = new Map<string, { x: number, y: number }>();
  const mapWidth = 1000;
  const mapHeight = 800;
  
  // Use location IDs to create deterministic positions
  locations.forEach(location => {
    // Create a simple hash from the ID
    let hash = 0;
    for (let i = 0; i < location.id.length; i++) {
      hash = ((hash << 5) - hash) + location.id.charCodeAt(i);
      hash |= 0;
    }
    
    // Use hash to create a position
    const x = Math.abs(hash % mapWidth);
    const y = Math.abs((hash >> 10) % mapHeight);
    
    positionMap.set(location.id, { x, y });
  });
  
  return positionMap;
};

const StarMap: React.FC<StarMapProps> = ({ onClose, onSelectLocation }) => {
  const audioState = useAudio();
  const story = useStory();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [positions, setPositions] = useState<Map<string, { x: number, y: number }>>(new Map());
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Current location from the game state
  const currentLocation = story.getCurrentLocation();
  
  // Available discovered locations
  const discoveredLocations = story.getAvailableLocations();
  
  // All exploration points (separate reference for special display)
  const explorationPoints = story.getExplorationPoints();
  
  // Filter to show only discovered locations
  const visibleLocations = discoveredLocations;
  
  useEffect(() => {
    // Calculate positions for map display
    setPositions(calculateMapPositions([...visibleLocations, ...explorationPoints]));
    
    // Center the map on the current location if possible
    if (currentLocation && mapRef.current) {
      const currentPos = positions.get(currentLocation.id);
      if (currentPos) {
        const mapCenter = {
          x: mapRef.current.clientWidth / 2,
          y: mapRef.current.clientHeight / 2
        };
        
        setMapOffset({
          x: mapCenter.x - currentPos.x * zoomLevel,
          y: mapCenter.y - currentPos.y * zoomLevel
        });
      }
    }
  }, [visibleLocations, currentLocation, explorationPoints]);
  
  // Handle selecting a location
  const handleSelectLocation = (location: Location) => {
    // Play sound if available (simplified for now)
    new Audio('/sounds/ui_select.mp3').play().catch(() => {});
    setSelectedLocation(location);
  };
  
  // Handle travel to a location
  const handleTravelToLocation = () => {
    if (selectedLocation && story.canTravelTo(selectedLocation.id)) {
      // Play sound if available
      new Audio('/sounds/warp_drive.mp3').play().catch(() => {});
      onSelectLocation?.(selectedLocation.id);
      onClose();
    } else {
      // Play error sound if available
      new Audio('/sounds/error.mp3').play().catch(() => {});
    }
  };
  
  // Handle map dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setMapOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(2, prev * zoomFactor)));
  };
  
  // Calculate connection lines between locations
  const renderConnectionLines = () => {
    const lines: JSX.Element[] = [];
    
    visibleLocations.forEach(location => {
      const sourcePos = positions.get(location.id);
      if (!sourcePos) return;
      
      location.connections.forEach(targetId => {
        // Only draw connections to discovered locations
        if (!story.gameState.discoveredLocations.includes(targetId)) return;
        
        const targetPos = positions.get(targetId);
        if (!targetPos) return;
        
        const key = `${location.id}-${targetId}`;
        
        // Check if this is the current travel route
        const isCurrentRoute = currentLocation && selectedLocation && 
          ((currentLocation.id === location.id && selectedLocation.id === targetId) ||
          (currentLocation.id === targetId && selectedLocation.id === location.id));
        
        // Check if this is a potential travel route
        const isPotentialRoute = currentLocation && selectedLocation &&
          currentLocation.id === location.id && selectedLocation.id === targetId;
        
        lines.push(
          <line
            key={key}
            x1={sourcePos.x}
            y1={sourcePos.y}
            x2={targetPos.x}
            y2={targetPos.y}
            stroke={isCurrentRoute ? "#00aaff" : (isPotentialRoute ? "#22cc22" : "#555555")}
            strokeWidth={isCurrentRoute || isPotentialRoute ? 3 : 1}
            strokeDasharray={isPotentialRoute ? "5,5" : undefined}
          />
        );
      });
    });
    
    return lines;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-gray-900 border border-blue-800 rounded-lg overflow-hidden w-full max-w-6xl h-[80vh] flex flex-col">
        <div className="p-4 bg-blue-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Star Map Navigation</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-blue-800 rounded"
          >
            ✕
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Star Map */}
          <div 
            ref={mapRef}
            className="relative flex-1 bg-black overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Map background */}
            <div className="absolute inset-0 bg-[url('/textures/space_bg.jpg')] opacity-40"></div>
            
            {/* SVG for connection lines */}
            <svg 
              className="absolute inset-0 w-full h-full"
              style={{ 
                transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: '0 0'
              }}
            >
              {renderConnectionLines()}
            </svg>
            
            {/* Location markers */}
            {visibleLocations.map(location => {
              const pos = positions.get(location.id);
              if (!pos) return null;
              
              const isCurrentLocation = currentLocation?.id === location.id;
              const isSelected = selectedLocation?.id === location.id;
              const isDiscovered = story.gameState.discoveredLocations.includes(location.id);
              const isVisited = story.gameState.visitedLocations.includes(location.id);
              const canTravelTo = currentLocation && story.canTravelTo(location.id);
              // Highlight the space station if it's the player's first mission
              const isFirstMission = location.id === "frontier_outpost" && 
                                     currentLocation?.id === "ship" && 
                                     !story.gameState.visitedLocations.includes("frontier_outpost");
              
              // Special styling based on location status
              const locationColor = getLocationColor(location.type);
              
              return (
                <motion.div
                  key={location.id}
                  className={cn(
                    "absolute rounded-full flex items-center justify-center shadow-lg",
                    locationColor,
                    isSelected ? "ring-4 ring-white" : "",
                    isCurrentLocation ? "ring-4 ring-yellow-400" : "",
                    isFirstMission ? "ring-4 ring-blue-500 animate-pulse" : "",
                    !isDiscovered ? "opacity-50" : "",
                    !canTravelTo ? "grayscale" : ""
                  )}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: isCurrentLocation ? '30px' : '24px',
                    height: isCurrentLocation ? '30px' : '24px',
                    transform: `translate(-50%, -50%) translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoomLevel})`,
                    transformOrigin: '0 0',
                    cursor: 'pointer',
                    zIndex: isCurrentLocation ? 10 : (isSelected ? 5 : 1)
                  }}
                  whileHover={{ scale: 1.2 * zoomLevel }}
                  onClick={() => handleSelectLocation(location)}
                >
                  <span className="text-xs">
                    {getLocationIcon(location.type)}
                  </span>
                </motion.div>
              );
            })}
            
            {/* Exploration points - shown with special styling */}
            {explorationPoints.filter(point => 
              story.gameState.discoveredLocations.includes(point.id)
            ).map(point => {
              const pos = positions.get(point.id);
              if (!pos) return null;
              
              const isSelected = selectedLocation?.id === point.id;
              const canTravelTo = currentLocation && story.canTravelTo(point.id);
              
              return (
                <motion.div
                  key={point.id}
                  className={cn(
                    "absolute rounded-full flex items-center justify-center shadow-lg border-2 border-dashed border-yellow-400",
                    getLocationColor(point.type),
                    isSelected ? "ring-2 ring-white" : "",
                    !canTravelTo ? "opacity-50" : ""
                  )}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: '24px',
                    height: '24px',
                    transform: `translate(-50%, -50%) translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoomLevel})`,
                    transformOrigin: '0 0',
                    cursor: 'pointer'
                  }}
                  whileHover={{ scale: 1.2 * zoomLevel }}
                  onClick={() => handleSelectLocation(point)}
                >
                  <span className="text-xs">
                    {getLocationIcon(point.type)}
                  </span>
                </motion.div>
              );
            })}
          </div>
          
          {/* Right panel - Location details */}
          <div className="w-80 bg-gray-800 p-4 overflow-y-auto text-white">
            {selectedLocation ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center", 
                    getLocationColor(selectedLocation.type)
                  )}>
                    <span className="text-xl">{getLocationIcon(selectedLocation.type)}</span>
                  </div>
                  <h3 className="text-xl font-bold">{selectedLocation.name}</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Type: {selectedLocation.type}</div>
                  {selectedLocation.region && (
                    <div className="text-sm text-gray-400">Region: {selectedLocation.region}</div>
                  )}
                  {selectedLocation.dangerLevel && (
                    <div className="text-sm flex items-center space-x-2">
                      <span>Threat Level:</span>
                      <span className={getDangerLevelColor(selectedLocation.dangerLevel)}>
                        {getDangerLevelIndicator(selectedLocation.dangerLevel)}
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-300">{selectedLocation.description}</p>
                
                {/* Mission Objective */}
                {selectedLocation.id === "frontier_outpost" && 
                 currentLocation?.id === "ship" && 
                 !story.gameState.visitedLocations.includes("frontier_outpost") && (
                  <div className="my-2 p-2 bg-blue-900 bg-opacity-50 border border-blue-500 rounded animate-pulse">
                    <p className="text-sm font-bold text-blue-300">
                      MISSION OBJECTIVE: Dock at this station
                    </p>
                  </div>
                )}
                
                {/* Environmental Effects */}
                {selectedLocation.environmentEffects && selectedLocation.environmentEffects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-400">Environmental Hazards</h4>
                    <ul className="space-y-1">
                      {selectedLocation.environmentEffects.map((effect, index) => (
                        <li key={index} className="text-sm bg-red-900 bg-opacity-50 p-2 rounded">
                          {effect.effect}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Encounters */}
                {selectedLocation.encounters && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-400">Points of Interest</h4>
                    <ul className="space-y-1">
                      {selectedLocation.encounters.enemies && selectedLocation.encounters.enemies.length > 0 && (
                        <li className="text-sm">Combat Encounters: {selectedLocation.encounters.enemies.length}</li>
                      )}
                      {selectedLocation.encounters.puzzles && selectedLocation.encounters.puzzles.length > 0 && (
                        <li className="text-sm">Puzzles: {selectedLocation.encounters.puzzles.length}</li>
                      )}
                      {selectedLocation.encounters.npcs && selectedLocation.encounters.npcs.length > 0 && (
                        <li className="text-sm">NPCs: {selectedLocation.encounters.npcs.length}</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {/* Travel button */}
                <div className="pt-4">
                  <button
                    onClick={handleTravelToLocation}
                    disabled={!story.canTravelTo(selectedLocation.id)}
                    className={cn(
                      "w-full py-2 px-4 rounded",
                      story.canTravelTo(selectedLocation.id)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-700 cursor-not-allowed"
                    )}
                  >
                    {story.canTravelTo(selectedLocation.id) 
                      ? "Travel to Location" 
                      : "Cannot Travel Here"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p className="text-center">Select a location on the star map to view details</p>
                <p className="text-xs mt-4">Use mouse wheel to zoom in/out</p>
                <p className="text-xs">Drag to pan the map</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer with legend */}
        <div className="p-2 bg-gray-900 text-xs text-gray-400 flex flex-wrap gap-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Ship</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Planet</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Station</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-700"></div>
            <span>Derelict</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-purple-700"></div>
            <span>Ruins</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span>Anomaly</span>
          </div>
          <div className="flex items-center space-x-1 ml-auto">
            <span>Discovered Locations: {story.gameState.discoveredLocations.length}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StarMap;