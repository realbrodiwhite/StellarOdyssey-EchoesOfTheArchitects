import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import useLocation from '@/lib/stores/useLocation';
import { useAudio } from '@/lib/stores/useAudio';
import { Faction, LocationType } from '@/lib/types';
import { AlertCircle, Navigation, MapPin, Shield, SkullIcon, Globe, Space, Compass, Lock, Ship, Home, Satellite, Diamond, Radio, Zap, AlertTriangle, Building, Landmark, ParkingSquare } from 'lucide-react';

interface SpaceNavigationProps {
  onClose: () => void;
}

const SpaceNavigation: React.FC<SpaceNavigationProps> = ({ onClose }) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'available' | 'discovered' | 'all'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationProgress, setNavigationProgress] = useState(0);
  
  const { 
    getCurrentLocation, 
    getAvailableLocations, 
    getDiscoveredLocations,
    visitLocation,
    startNavigation,
    updateNavigationProgress,
    completeNavigation,
    cancelNavigation,
    navigationInProgress,
    navigationProgress: storeNavigationProgress,
    navigationTime,
    navigationTarget
  } = useLocation();

  const { playHit, playSuccess, playAlarm } = useAudio();
  
  const currentLocation = getCurrentLocation();
  const availableLocations = getAvailableLocations();
  const discoveredLocations = getDiscoveredLocations();
  
  // Filter locations based on view mode and search query
  const filteredLocations = (() => {
    let locationsToShow = availableLocations;
    
    if (viewMode === 'discovered') {
      locationsToShow = discoveredLocations;
    } else if (viewMode === 'all') {
      // In a full game, this would be all known locations in the universe
      locationsToShow = discoveredLocations;
    }
    
    if (searchQuery.trim() === '') {
      return locationsToShow;
    }
    
    const query = searchQuery.toLowerCase();
    return locationsToShow.filter(loc => 
      loc.name.toLowerCase().includes(query) || 
      loc.description.toLowerCase().includes(query) ||
      (loc.region && loc.region.toLowerCase().includes(query))
    );
  })();
  
  // Simulate navigation progress
  useEffect(() => {
    if (navigationInProgress && navigationTime > 0) {
      setIsNavigating(true);
      
      const interval = setInterval(() => {
        updateNavigationProgress(storeNavigationProgress + (100 / navigationTime) * 0.1);
        
        if (storeNavigationProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            completeNavigation();
            setIsNavigating(false);
            playSuccess();
          }, 500);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [navigationInProgress, storeNavigationProgress, navigationTime]);
  
  // Handle location selection
  const handleSelectLocation = (locationId: string) => {
    setSelectedLocationId(locationId);
    playHit();
  };
  
  // Calculate travel time based on location type, danger level and region
  const calculateTravelTime = (locationId: string) => {
    const location = availableLocations.find(loc => loc.id === locationId);
    if (!location) return 10; // Default 10 seconds
    
    let baseTime = 5; // Base time in seconds
    
    // Adjust based on location type
    switch (location.type) {
      case LocationType.Space:
        baseTime += 5;
        break;
      case LocationType.Planet:
        baseTime += 8;
        break;
      case LocationType.Anomaly:
        baseTime += 12;
        break;
      case LocationType.Derelict:
        baseTime += 7;
        break;
      default:
        baseTime += 5;
    }
    
    // Adjust based on danger level
    baseTime += location.dangerLevel || 0;
    
    // Adjust based on region
    if (location.region !== currentLocation?.region) {
      baseTime += 5; // Cross-region travel takes longer
    }
    
    return Math.max(5, baseTime); // Minimum 5 seconds
  };
  
  // Handle navigation start
  const handleNavigate = (locationId: string) => {
    const travelTime = calculateTravelTime(locationId);
    startNavigation(locationId, travelTime);
    playHit(); // Use hit sound for navigation start
  };
  
  // Handle navigation cancel
  const handleCancelNavigation = () => {
    cancelNavigation();
    setIsNavigating(false);
    playAlarm();
  };
  
  // Icon for location type
  const getLocationTypeIcon = (type: LocationType) => {
    switch (type) {
      case LocationType.Planet:
        return <Globe className="h-5 w-5 text-blue-400" />;
      case LocationType.Space:
        return <Space className="h-5 w-5 text-indigo-400" />;
      case LocationType.Station:
        return <Satellite className="h-5 w-5 text-gray-400" />;
      case LocationType.Derelict:
        return <Ship className="h-5 w-5 text-red-400" />;
      case LocationType.Settlement:
        return <Building className="h-5 w-5 text-green-400" />;
      case LocationType.Ruins:
        return <Landmark className="h-5 w-5 text-amber-400" />;
      case LocationType.Anomaly:
        return <AlertTriangle className="h-5 w-5 text-purple-400" />;
      default:
        return <MapPin className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Color for location card based on type
  const getLocationColor = (type: LocationType) => {
    switch (type) {
      case LocationType.Planet:
        return 'border-blue-700 bg-blue-950 bg-opacity-40';
      case LocationType.Space:
        return 'border-indigo-700 bg-indigo-950 bg-opacity-40';
      case LocationType.Station:
        return 'border-gray-600 bg-gray-900 bg-opacity-60';
      case LocationType.Derelict:
        return 'border-red-800 bg-red-950 bg-opacity-40';
      case LocationType.Settlement:
        return 'border-green-700 bg-green-950 bg-opacity-40';
      case LocationType.Ruins:
        return 'border-amber-700 bg-amber-950 bg-opacity-40';
      case LocationType.Anomaly:
        return 'border-purple-700 bg-purple-950 bg-opacity-40';
      default:
        return 'border-gray-700 bg-gray-900';
    }
  };
  
  // Faction badge color
  const getFactionColor = (faction?: Faction) => {
    switch (faction) {
      case Faction.Alliance:
        return 'bg-blue-700 text-blue-100';
      case Faction.Syndicate:
        return 'bg-red-700 text-red-100';
      case Faction.Settlers:
        return 'bg-green-700 text-green-100';
      case Faction.Mystics:
        return 'bg-purple-700 text-purple-100';
      case Faction.VoidEntity:
        return 'bg-black text-purple-300 border border-purple-500';
      default:
        return 'bg-gray-700 text-gray-100';
    }
  };
  
  // Danger level indicator color
  const getDangerLevelColor = (level?: number) => {
    if (!level) return 'bg-gray-700 text-gray-100';
    
    if (level <= 2) return 'bg-green-700 text-green-100';
    if (level <= 5) return 'bg-yellow-700 text-yellow-100';
    if (level <= 7) return 'bg-orange-700 text-orange-100';
    return 'bg-red-700 text-red-100';
  };
  
  // Format for danger level display
  const formatDangerLevel = (level?: number) => {
    if (!level) return 'Unknown';
    
    if (level <= 2) return `Low (${level})`;
    if (level <= 5) return `Moderate (${level})`;
    if (level <= 7) return `High (${level})`;
    return `Extreme (${level})`;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Navigation className="h-6 w-6 mr-2 text-blue-400" />
                Space Navigation
              </h2>
              <p className="text-gray-400">Explore the galaxy and discover new locations.</p>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
              Close
            </Button>
          </div>
          
          {/* Navigation in progress display */}
          {isNavigating && (
            <div className="w-full bg-gray-900 border border-blue-800 rounded-lg p-4 my-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-blue-300">Navigation in Progress</h3>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleCancelNavigation}
                >
                  Abort
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-white">
                  Traveling to: <span className="font-semibold">{
                    availableLocations.find(loc => loc.id === navigationTarget)?.name
                  }</span>
                </p>
                
                <Progress 
                  value={storeNavigationProgress} 
                  className="h-2 bg-gray-700"
                />
                
                <p className="text-sm text-gray-400">
                  ETA: {Math.ceil((navigationTime * (100 - storeNavigationProgress)) / 100)} seconds
                </p>
              </div>
            </div>
          )}
          
          {/* Current Location */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-lg text-blue-300 font-semibold mb-2 flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Current Location
            </h3>
            
            {currentLocation && (
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-gray-800">
                  {getLocationTypeIcon(currentLocation.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-semibold text-white">{currentLocation.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-gray-700">
                          {LocationType[currentLocation.type]}
                        </Badge>
                        
                        {currentLocation.region && (
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {currentLocation.region}
                          </Badge>
                        )}
                        
                        {currentLocation.controlledBy && (
                          <Badge className={getFactionColor(currentLocation.controlledBy)}>
                            <Shield className="h-3 w-3 mr-1" />
                            {currentLocation.controlledBy}
                          </Badge>
                        )}
                        
                        {currentLocation.dangerLevel !== undefined && (
                          <Badge className={getDangerLevelColor(currentLocation.dangerLevel)}>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Threat: {formatDangerLevel(currentLocation.dangerLevel)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-gray-300">
                    {currentLocation.description}
                  </p>
                  
                  {currentLocation.environmentEffects && currentLocation.environmentEffects.length > 0 && (
                    <div className="mt-3 bg-gray-800 bg-opacity-60 p-2 rounded-md">
                      <p className="text-sm font-medium text-amber-300 mb-1">Environmental Effects:</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {currentLocation.environmentEffects.map((effect, i) => (
                          <li key={i} className="flex items-start">
                            <Zap className="h-4 w-4 mr-1 text-amber-400 mt-0.5" />
                            <span>
                              <strong className="text-amber-200">{effect.type}</strong>: {effect.effect}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Available Locations */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button 
                  variant={viewMode === 'available' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('available')}
                  className={viewMode === 'available' ? 'bg-blue-700 hover:bg-blue-600' : ''}
                >
                  Available
                </Button>
                <Button 
                  variant={viewMode === 'discovered' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('discovered')}
                  className={viewMode === 'discovered' ? 'bg-blue-700 hover:bg-blue-600' : ''}
                >
                  Discovered
                </Button>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search locations..."
                  className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 text-sm w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocations.map(location => (
                <motion.div
                  key={location.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer hover:shadow-md hover:shadow-blue-900/20 h-full ${getLocationColor(location.type)}`}
                    onClick={() => handleSelectLocation(location.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        {getLocationTypeIcon(location.type)}
                        <span>{location.name}</span>
                      </CardTitle>
                      
                      <CardDescription>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {location.region || 'Unknown Region'}
                          </Badge>
                          
                          {location.controlledBy && (
                            <Badge className={getFactionColor(location.controlledBy)}>
                              {location.controlledBy}
                            </Badge>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {location.description}
                      </p>
                    </CardContent>
                    
                    <CardFooter className="pt-0">
                      <div className="w-full flex justify-between items-center">
                        <Badge className={getDangerLevelColor(location.dangerLevel)}>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {formatDangerLevel(location.dangerLevel)}
                        </Badge>
                        
                        {location.unlockRequirement && (
                          <Badge className="bg-amber-800 text-amber-200">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                        
                        <Badge className="bg-gray-800 text-blue-300">
                          {calculateTravelTime(location.id)}s travel time
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
              
              {filteredLocations.length === 0 && (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-400">No locations found. Explore more to discover new destinations.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Selected Location Detail */}
          <AnimatePresence>
            {selectedLocationId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-blue-900 p-4 z-10"
              >
                {availableLocations.filter(loc => loc.id === selectedLocationId).map(location => (
                  <div key={location.id} className="max-w-6xl mx-auto flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        {getLocationTypeIcon(location.type)}
                        <span className="ml-2">{location.name}</span>
                      </h3>
                      
                      <p className="text-gray-300 my-2">{location.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {location.environmentEffects && location.environmentEffects.length > 0 && (
                          <Badge className="bg-amber-800 text-amber-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Environmental Hazards
                          </Badge>
                        )}
                        
                        {location.encounters?.enemies && location.encounters.enemies.length > 0 && (
                          <Badge className="bg-red-900 text-red-200">
                            <SkullIcon className="h-3 w-3 mr-1" />
                            Hostile Entities
                          </Badge>
                        )}
                        
                        {location.encounters?.puzzles && location.encounters.puzzles.length > 0 && (
                          <Badge className="bg-blue-900 text-blue-200">
                            <Compass className="h-3 w-3 mr-1" />
                            Puzzles/Challenges
                          </Badge>
                        )}
                        
                        {location.items && location.items.length > 0 && (
                          <Badge className="bg-green-900 text-green-200">
                            <Diamond className="h-3 w-3 mr-1" />
                            Resources Available
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedLocationId(null)}
                      >
                        Cancel
                      </Button>
                      
                      <Button 
                        variant="default"
                        className="bg-blue-700 hover:bg-blue-600"
                        disabled={isNavigating}
                        onClick={() => handleNavigate(location.id)}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SpaceNavigation;