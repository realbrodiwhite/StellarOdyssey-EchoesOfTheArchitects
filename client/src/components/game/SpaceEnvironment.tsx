import { useState, useEffect, useMemo } from "react";
import { 
  Stars,
  useKeyboardControls
} from "@react-three/drei";
import { useCharacter } from "@/lib/stores/useCharacter";
import { useStory } from "@/lib/stores/useStory";
import { usePuzzle } from "@/lib/stores/usePuzzle";
import { useCombat } from "@/lib/stores/useCombat";
import { useGame } from "@/lib/stores/useGame";
import { useCompanion, DialogueType } from "@/lib/stores/useCompanion";
import { useAchievements } from "@/lib/stores/useAchievements";
import { useAudio } from "@/lib/stores/useAudio";
import { useLocation } from "@/lib/stores/useLocation";
import { Controls, Location, LocationType } from "@/lib/types";
import { Html } from "@react-three/drei";
import SpaceExploration from "./SpaceExploration";
import SpaceNavigation from "./SpaceNavigation";
import StarMap from "./StarMap";
import CompanionChat from "./CompanionChat";
import CompanionSelection from "./CompanionSelection";
import ForearmPad from "./ForearmPad";
import TechnicalPuzzle from "./TechnicalPuzzle";
import SaveLoadMenu from "./SaveLoadMenu";
import EmergencyEncounter from "./EmergencyEncounter";
import ShipLaunchAnimation from "./ShipLaunchAnimation";
import * as THREE from "three";

interface SpaceEnvironmentProps {
  onEnterCombat: () => void;
  onEnterPuzzle: () => void;
}

const SpaceEnvironment = ({ onEnterCombat, onEnterPuzzle }: SpaceEnvironmentProps) => {
  // Use location store for navigation
  const { 
    getCurrentLocation, 
    setCurrentLocation,
    isLocationVisited,
    visitLocation
  } = useLocation();
  
  const { startPuzzle } = usePuzzle();
  const { startCombat } = useCombat();
  const { 
    mode, 
    setMode,
    showNavigationConsole, 
    toggleNavigationConsole 
  } = useGame();
  
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // UI States
  const [showStarMap, setShowStarMap] = useState(false);
  const [showCompanionSelect, setShowCompanionSelect] = useState(false);
  const [showCompanionChat, setShowCompanionChat] = useState(false);
  const [showForearmPad, setShowForearmPad] = useState(false);
  const [showTechnicalPuzzle, setShowTechnicalPuzzle] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [companionChatMinimized, setCompanionChatMinimized] = useState(false);
  const [targetLocationId, setTargetLocationId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentObjective, setCurrentObjective] = useState("First mission: Land at Proxima Outpost to deliver cargo");
  
  // Ship launch and emergency pirate encounter system
  const [showShipLaunch, setShowShipLaunch] = useState(true); // Start with ship launch animation
  const [showEmergencyEncounter, setShowEmergencyEncounter] = useState(false); // Will show after ship launch
  
  // Contextual ambient lighting states
  const [environmentPreset, setEnvironmentPreset] = useState<"night" | "apartment" | "city" | "dawn" | "forest" | "lobby" | "park" | "studio" | "sunset" | "warehouse">("night");
  const [ambientIntensity, setAmbientIntensity] = useState<number>(0.3);
  const [hemisphereIntensity, setHemisphereIntensity] = useState<number>(0.1);
  const [hemisphereColor, setHemisphereColor] = useState<string>("#88ccff");
  const [hemisphereGroundColor, setHemisphereGroundColor] = useState<string>("#884466");
  
  // Companion and achievement systems
  const { activeCompanion, getRandomDialogue, addDialogue } = useCompanion();
  const { hasUnlockedCompanionAI } = useAchievements();
  
  // Get location data
  const currentLocation = getCurrentLocation();
  
  // Function to determine lighting settings based on location type and characteristics
  const updateLightingForLocation = (location: Location | undefined) => {
    if (!location) return;
    
    // Default space lighting
    let preset: "night" | "apartment" | "city" | "dawn" | "forest" | "lobby" | "park" | "studio" | "sunset" | "warehouse" = "night";
    let ambIntensity = 0.3;
    let hemiIntensity = 0.1;
    let hemiColor = "#88ccff";
    let hemiGroundColor = "#884466";
    
    switch (location.type) {
      case LocationType.Planet:
        // Check for planet description to determine type
        if (location.description.toLowerCase().includes("desert")) {
          preset = "sunset";
          ambIntensity = 0.5;
          hemiIntensity = 0.2;
          hemiColor = "#ffbb77";
          hemiGroundColor = "#aa7744";
        } else if (location.description.toLowerCase().includes("ice") || 
                  location.description.toLowerCase().includes("arctic") || 
                  location.description.toLowerCase().includes("frozen")) {
          preset = "dawn";
          ambIntensity = 0.4;
          hemiIntensity = 0.15;
          hemiColor = "#aaccff";
          hemiGroundColor = "#ffffff";
        } else if (location.description.toLowerCase().includes("jungle") || 
                  location.description.toLowerCase().includes("forest")) {
          preset = "forest";
          ambIntensity = 0.2;
          hemiIntensity = 0.15;
          hemiColor = "#88cc88";
          hemiGroundColor = "#335533";
        } else if (location.description.toLowerCase().includes("volcanic") || 
                  location.description.toLowerCase().includes("lava")) {
          preset = "sunset";
          ambIntensity = 0.5;
          hemiIntensity = 0.2;
          hemiColor = "#ff7744";
          hemiGroundColor = "#661100";
        } else if (location.description.toLowerCase().includes("ocean") || 
                  location.description.toLowerCase().includes("water")) {
          preset = "city";
          ambIntensity = 0.35;
          hemiIntensity = 0.15;
          hemiColor = "#55aaff";
          hemiGroundColor = "#00448a";
        } else {
          // Default terrestrial planet settings
          preset = "park";
          ambIntensity = 0.4;
          hemiIntensity = 0.15;
          hemiColor = "#aaddff";
          hemiGroundColor = "#779966";
        }
        break;

      case LocationType.Space:
        preset = "night";
        ambIntensity = 0.3;
        hemiIntensity = 0.1;
        hemiColor = "#88ccff";
        hemiGroundColor = "#884466";
        break;

      case LocationType.Station:
        preset = "apartment";
        ambIntensity = 0.4;
        hemiIntensity = 0.15;
        hemiColor = "#ccccdd";
        hemiGroundColor = "#555566";
        break;

      case LocationType.Derelict:
        preset = "night";
        ambIntensity = 0.2;
        hemiIntensity = 0.05;
        hemiColor = "#445566";
        hemiGroundColor = "#332244";
        break;

      case LocationType.Anomaly:
        // For anomalies, check for void energy
        if (location.environmentEffects?.some(effect => effect.type === "voidEnergy")) {
          preset = "night";
          ambIntensity = 0.25;
          hemiIntensity = 0.1;
          hemiColor = "#9966cc";
          hemiGroundColor = "#331144";
        } else {
          preset = "lobby";
          ambIntensity = 0.3;
          hemiIntensity = 0.1;
          hemiColor = "#aabbcc";
          hemiGroundColor = "#334455";
        }
        break;

      case LocationType.Ruins:
        preset = "sunset";
        ambIntensity = 0.25;
        hemiIntensity = 0.1;
        hemiColor = "#ddbb99";
        hemiGroundColor = "#775544";
        break;

      case LocationType.Settlement:
        preset = "city";
        ambIntensity = 0.4;
        hemiIntensity = 0.15;
        hemiColor = "#ccccdd";
        hemiGroundColor = "#666677";
        break;

      default:
        preset = "night";
        ambIntensity = 0.3;
        hemiIntensity = 0.1;
        hemiColor = "#88ccff";
        hemiGroundColor = "#884466";
    }
    
    // Apply environment effects if present
    if (location.environmentEffects && location.environmentEffects.length > 0) {
      // Adjust lighting based on environmental effects
      location.environmentEffects.forEach(effect => {
        // Extreme temperature
        if (effect.type === "extremeTemperature" && effect.severity > 2) {
          if (location.description.toLowerCase().includes("cold") || 
              location.description.toLowerCase().includes("ice") ||
              location.description.toLowerCase().includes("frozen")) {
            // Cold environments
            hemiColor = "#aaccff";
            hemiGroundColor = "#ddeeff";
          } else {
            // Hot environments
            hemiColor = "#ffaa77";
            hemiGroundColor = "#cc7744";
          }
        }
        
        // Radiation - give a slight green tint
        if (effect.type === "radiation") {
          hemiColor = mixColors(hemiColor, "#aaff99", effect.severity * 0.1);
        }
        
        // Toxic atmosphere - give a slight purple/green tint
        if (effect.type === "toxicAtmosphere") {
          hemiColor = mixColors(hemiColor, "#aa88cc", effect.severity * 0.15);
        }
      });
    }
    
    // Apply the lighting settings
    setEnvironmentPreset(preset as "night" | "apartment" | "city" | "dawn" | "forest" | "lobby" | "park" | "studio" | "sunset" | "warehouse");
    setAmbientIntensity(ambIntensity);
    setHemisphereIntensity(hemiIntensity);
    setHemisphereColor(hemiColor);
    setHemisphereGroundColor(hemiGroundColor);
  };
  
  // Helper function to mix colors
  const mixColors = (color1: string, color2: string, ratio: number): string => {
    // Convert hex to RGB
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    
    // Mix the colors
    const mixed = new THREE.Color(
      c1.r * (1 - ratio) + c2.r * ratio,
      c1.g * (1 - ratio) + c2.g * ratio,
      c1.b * (1 - ratio) + c2.b * ratio
    );
    
    return '#' + mixed.getHexString();
  };
  
  // Initialize first mission guidance through ship's automated system
  useEffect(() => {
    if (currentLocation?.id === "ship") {
      // Set the objective message through the ship's automated system
      setCurrentObjective("Mission: Deliver urgent cargo to Proxima Outpost");
    }
    
    // Update lighting settings based on the current location
    updateLightingForLocation(currentLocation);
    console.log(`Updated lighting for location: ${currentLocation?.name} (${currentLocation?.type})`);
  }, [currentLocation?.id]);
  
  // This effect is no longer needed as we're using the 113-second timer instead
  // We're keeping the code commented for reference
  /*
  useEffect(() => {
    if (targetLocationId === "frontier_outpost" && isTransitioning && mode === "flying" && !showEmergencyEncounter) {
      // Wait a bit to let the flight animation start, then trigger the pirate ambush
      const pirateAmbushTimer = setTimeout(() => {
        setShowEmergencyEncounter(true);
      }, 2000);
      
      return () => clearTimeout(pirateAmbushTimer);
    }
  }, [targetLocationId, isTransitioning, mode, showEmergencyEncounter]);
  */
  
  // Handle keyboard input for opening navigation console and star map
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle keypresses during transitions
      if (isTransitioning) return;
      
      // Emergency encounter is now triggered immediately on component mount
      // No need for the 113-second timer
      
      if (e.key === "n" || e.key === "N") {
        toggleNavigationConsole();
      }
      
      if (e.key === "m" || e.key === "M") {
        toggleStarMap();
      }
      
      if (e.key === "Escape") {
        if (showStarMap) {
          setShowStarMap(false);
        } else if (showNavigationConsole) {
          toggleNavigationConsole();
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isTransitioning, showStarMap, showNavigationConsole, toggleNavigationConsole]);
  
  const toggleStarMap = () => {
    setShowStarMap(prev => !prev);
  };
  
  // Ship launch and emergency encounter handlers
  const handleShipLaunchComplete = () => {
    console.log("Ship launch animation complete, triggering emergency encounter");
    setShowShipLaunch(false);
    setShowEmergencyEncounter(true);
  };
  
  // Emergency encounter handlers
  const handleEmergencyComplete = () => {
    setShowEmergencyEncounter(false);
    setCurrentObjective("Mission: Continue to Proxima Outpost to deliver cargo");
    
    // Complete the "Emergency Response" achievement
    const achievements = useAchievements.getState();
    const emergencyAchievement = achievements.achievements.find(a => a.name === "Emergency Response");
    if (emergencyAchievement && !emergencyAchievement.completed) {
      achievements.completeAchievement(emergencyAchievement.id);
      console.log("Emergency Response achievement completed!");
    }
    
    // Resume normal travel to the destination
    console.log("Emergency encounter completed, continuing travel");
  };
  
  // Handle selecting a location from either map view
  const handleSelectLocation = (locationId: string) => {
    console.log(`Traveling to ${locationId}`);
    setTargetLocationId(locationId);
    setIsTransitioning(true);
    
    // Set traveling objective with just the ID for now
    setCurrentObjective(`Traveling to ${locationId}`);
    
    // Simulate a travel delay and then move
    setTimeout(() => {
      setMode("flying");
      // Perform the actual movement using the new location store
      setCurrentLocation(locationId);
      visitLocation(locationId);
      const success = true; // Assume success for now
      
      if (success) {
        console.log(`Successfully traveled to ${locationId}`);
        
        // Check if this is the space station for the first mission
        if (locationId === "frontier_outpost") {
          setCurrentObjective("Mission accomplished! Docked at Proxima Outpost");
          
          // Complete the "First Steps" achievement
          const achievements = useAchievements.getState();
          const firstStepsAchievement = achievements.achievements.find(a => a.name === "First Steps");
          if (firstStepsAchievement && !firstStepsAchievement.completed) {
            achievements.completeAchievement(firstStepsAchievement.id);
          }
          
          // Add mission completion notification through ship's systems
          // We'll dispatch an event to show this in the UI later
          console.log("MISSION COMPLETE: Successfully docked at Proxima Outpost");
        } else {
          // For other locations, set a generic objective
          // Use the current location after we've navigated
          const newLocation = getCurrentLocation();
          if (newLocation) {
            setCurrentObjective(`Explore ${newLocation.name}`);
          } else {
            setCurrentObjective(`Explore ${locationId}`);
          }
        }
      } else {
        console.error(`Failed to travel to ${locationId}`);
      }
      
      setIsTransitioning(false);
      setTargetLocationId(null);
    }, 800); // Short delay to simulate travel
  };
  
  // Handle interaction with a point of interest
  const handleLandAtPoint = (pointId: string) => {
    console.log(`Interacting with: ${pointId}`);
    
    // Based on point ID, decide what kind of interaction this is
    if (pointId.includes("landing") || pointId.includes("docking")) {
      // Change to landed mode for planets or stations
      setMode("landed");
      setCurrentObjective(`Landed on surface of ${currentLocation?.name}`);
      return;
    }
    
    // Determine if this is a puzzle or combat encounter based on the point ID
    const isPuzzleEncounter = pointId.includes("puzzle") || 
                             pointId.includes("ancient") || 
                             pointId.includes("terminal") ||
                             pointId.includes("breach") ||
                             pointId.includes("power") ||
                             pointId.includes("anomaly");
    
    const isCombatEncounter = pointId.includes("hostile") || 
                             pointId.includes("enemy") ||
                             pointId.includes("security") ||
                             Math.random() < 0.3; // 30% chance of random encounter
    
    // Handle puzzle encounters
    if (isPuzzleEncounter) {
      // Get a puzzle from the current location (first one for demo)
      const puzzleId = currentLocation?.encounters.puzzles?.[0];
      if (puzzleId) {
        console.log(`Starting puzzle: ${puzzleId}`);
        startPuzzle(puzzleId);
        // Always enter puzzle mode when we find a puzzle
        onEnterPuzzle();
      }
    }
    
    // Handle combat encounters
    if (isCombatEncounter) {
      const enemyId = currentLocation?.encounters.enemies?.[0];
      if (enemyId) {
        console.log(`Engaging enemy: ${enemyId}`);
        
        // In a real implementation, fetch enemy data from a proper source
        const enemyData = {
          id: enemyId,
          name: "Space Drone",
          faction: "Syndicate", 
          health: 50,
          maxHealth: 50,
          shield: 20,
          maxShield: 20,
          damage: 8,
          defense: 2,
          abilities: [],
          description: "A hostile security drone.",
          weaknesses: [],
          resistances: [],
          immunities: [],
          canFlee: true,
          level: 1,
          image: "",
          reward: { experience: 50 },
          dialogues: {},
          uniqueEncounter: false
        };
        
        startCombat(enemyData);
        onEnterCombat();
      }
    }
  };
  
  return (
    <>
      {/* Custom contextual lighting setup for different planet types */}
      {/* Main directional light (sun/star) */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
        color={hemisphereColor}
      />
      
      {/* Fill light from opposite side */}
      <directionalLight 
        position={[-8, 5, -10]} 
        intensity={0.3 * hemisphereIntensity} 
        color={hemisphereGroundColor}
      />
      
      {/* Ambient and hemisphere lighting for overall scene illumination */}
      <ambientLight intensity={ambientIntensity} />
      <hemisphereLight 
        intensity={hemisphereIntensity} 
        color={hemisphereColor} 
        groundColor={hemisphereGroundColor} 
      />
      
      {/* Background stars */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5}
      />
      
      {/* Main space flying component */}
      <SpaceExploration 
        onNavigate={toggleNavigationConsole}
        onLand={handleLandAtPoint}
      />
      
      {/* Navigation console UI overlay (smaller version) */}
      {showNavigationConsole && (
        <Html fullscreen>
          <SpaceNavigation 
            onClose={() => toggleNavigationConsole()}
            onSelectLocation={handleSelectLocation}
          />
        </Html>
      )}
      
      {/* Star Map - more detailed galactic navigation */}
      {showStarMap && (
        <Html fullscreen>
          <StarMap 
            onClose={() => setShowStarMap(false)}
            onSelectLocation={handleSelectLocation}
          />
        </Html>
      )}
      
      {/* Transition overlay when traveling */}
      {isTransitioning && (
        <Html fullscreen>
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-3xl text-blue-300 mb-4">
                Engaging FTL Drive
              </div>
              <div className="text-xl text-white mb-8">
                Destination: {targetLocationId}
              </div>
              <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-blue-500 animate-[pulse_1s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        </Html>
      )}
      
      {/* HUD overlay with controls and current location */}
      <Html fullscreen>
        <div className="fixed top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-md max-w-xs text-sm z-40">
          <h3 className="font-bold mb-2">Ship Controls</h3>
          <ul className="space-y-1 text-xs">
            <li>• WASD/Arrows: Pilot spacecraft</li>
            <li>• E: Interact with objects</li>
            <li>• N: Navigation console</li>
            <li>• M: Star map</li>
            <li>• ESC: Close menus</li>
          </ul>
          
          <div className="mt-4 pt-2 border-t border-gray-700">
            <div className="text-xs text-blue-300">Current Location:</div>
            <div className="font-medium">{currentLocation?.name || "Unknown"}</div>
            <div className="text-xs text-gray-400">{currentLocation?.type} - {currentLocation?.region || "Unknown Region"}</div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-xs text-green-300">Current Objective:</div>
            <div className="text-sm">{currentObjective}</div>
          </div>
          
          <div className="mt-4 space-y-2">
            <button
              onClick={toggleStarMap}
              className="bg-blue-700 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-md w-full"
            >
              Open Star Map
            </button>
            
            <button
              onClick={() => setShowForearmPad(true)}
              className="bg-green-700 hover:bg-green-600 text-white text-xs py-1 px-3 rounded-md w-full"
            >
              Open Forearm Terminal
            </button>
            
            {/* Save/Load buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSaveMenu(true)}
                className="flex-1 bg-amber-700 hover:bg-amber-600 text-white text-xs py-1 px-2 rounded-md"
              >
                Save Game
              </button>
              <button
                onClick={() => setShowLoadMenu(true)}
                className="flex-1 bg-teal-700 hover:bg-teal-600 text-white text-xs py-1 px-2 rounded-md"
              >
                Load Game
              </button>
            </div>
            
            {hasUnlockedCompanionAI() && activeCompanion ? (
              <button
                onClick={() => setShowCompanionChat(prev => !prev)}
                className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs py-1 px-3 rounded-md w-full"
              >
                Chat with {activeCompanion.name}
              </button>
            ) : hasUnlockedCompanionAI() ? (
              <button
                onClick={() => setShowCompanionSelect(true)}
                className="bg-purple-700 hover:bg-purple-600 text-white text-xs py-1 px-3 rounded-md w-full"
              >
                Activate AI Companion
              </button>
            ) : (
              <button
                onClick={() => setShowTechnicalPuzzle(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-3 rounded-md w-full"
              >
                AI System Offline
              </button>
            )}
          </div>
        </div>
        
        {/* Companion chat window */}
        {showCompanionChat && activeCompanion && (
          <CompanionChat 
            minimized={companionChatMinimized}
            onToggleMinimize={() => setCompanionChatMinimized(prev => !prev)}
            onClose={() => setShowCompanionChat(false)}
          />
        )}
        
        {/* Companion selection modal */}
        {showCompanionSelect && hasUnlockedCompanionAI() && (
          <CompanionSelection 
            onClose={() => setShowCompanionSelect(false)} 
          />
        )}
        
        {/* Forearm Pad */}
        {showForearmPad && (
          <ForearmPad
            onClose={() => setShowForearmPad(false)}
          />
        )}
        
        {/* Technical Puzzle for AI unlock */}
        {showTechnicalPuzzle && (
          <TechnicalPuzzle
            onClose={() => setShowTechnicalPuzzle(false)}
            onSuccess={() => {
              // After successful puzzle completion, the achievement system
              // will automatically unlock the companion AI
              setShowTechnicalPuzzle(false);
              setTimeout(() => {
                // Show the forearm pad after a short delay
                setShowForearmPad(true);
              }, 1000);
            }}
          />
        )}
        
        {/* Save/Load menus */}
        {showSaveMenu && (
          <SaveLoadMenu 
            isOpen={showSaveMenu} 
            onClose={() => setShowSaveMenu(false)} 
            mode="save" 
          />
        )}
        
        {showLoadMenu && (
          <SaveLoadMenu 
            isOpen={showLoadMenu} 
            onClose={() => setShowLoadMenu(false)} 
            mode="load" 
          />
        )}
        
        {/* Ship Launch Animation */}
        {showShipLaunch && (
          <ShipLaunchAnimation 
            onComplete={handleShipLaunchComplete}
          />
        )}
        
        {/* Emergency Pirate Encounter */}
        {showEmergencyEncounter && (
          <EmergencyEncounter
            onComplete={handleEmergencyComplete}
          />
        )}
      </Html>
    </>
  );
};

export default SpaceEnvironment;
