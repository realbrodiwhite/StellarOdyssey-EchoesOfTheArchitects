import { useState, useEffect } from "react";
import { 
  Environment, 
  Stars,
  useKeyboardControls
} from "@react-three/drei";
import { useCharacter } from "@/lib/stores/useCharacter";
import { useStory } from "@/lib/stores/useStory";
import { usePuzzle } from "@/lib/stores/usePuzzle";
import { useCombat } from "@/lib/stores/useCombat";
import { Controls } from "@/lib/types";
import { Html } from "@react-three/drei";
import SpaceExploration from "./SpaceExploration";
import SpaceNavigation from "./SpaceNavigation";

interface SpaceEnvironmentProps {
  onEnterCombat: () => void;
  onEnterPuzzle: () => void;
}

const SpaceEnvironment = ({ onEnterCombat, onEnterPuzzle }: SpaceEnvironmentProps) => {
  const { getCurrentLocation } = useStory();
  const { startPuzzle } = usePuzzle();
  const { startCombat } = useCombat();
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // UI States
  const [showNavigationConsole, setShowNavigationConsole] = useState(false);
  const [showPlanetaryView, setShowPlanetaryView] = useState(false);
  const [targetLocationId, setTargetLocationId] = useState<string | null>(null);
  
  // Get the current location data
  const currentLocation = getCurrentLocation();
  
  // Handle keyboard input for opening navigation console
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "n" || e.key === "N") {
        toggleNavigationConsole();
      }
      
      if (e.key === "Escape") {
        setShowNavigationConsole(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);
  
  const toggleNavigationConsole = () => {
    setShowNavigationConsole(prev => !prev);
  };
  
  const handleSelectLocation = (locationId: string) => {
    console.log(`Traveling to ${locationId}`);
    setTargetLocationId(locationId);
    // Actual travel logic is handled in the Story store
  };
  
  const handleLandAtPoint = (pointId: string) => {
    console.log(`Landing at point: ${pointId}`);
    
    // Example of puzzle at location
    const puzzleId = currentLocation?.encounters.puzzles?.[0];
    if (puzzleId) {
      console.log(`Starting puzzle: ${puzzleId}`);
      const puzzleStarted = startPuzzle(puzzleId);
      if (puzzleStarted) {
        onEnterPuzzle();
      }
    }
    
    // Example of enemy at location
    if (pointId.includes("hostile") || Math.random() < 0.3) {
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
      {/* Environment lighting */}
      <Environment preset="night" />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <hemisphereLight intensity={0.1} color="#88ccff" groundColor="#884466" />
      
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
      
      {/* Navigation console UI overlay */}
      {showNavigationConsole && (
        <Html fullscreen>
          <SpaceNavigation 
            onClose={() => setShowNavigationConsole(false)}
            onSelectLocation={handleSelectLocation}
          />
        </Html>
      )}
      
      {/* Instructions overlay */}
      <Html fullscreen>
        <div className="fixed top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-md max-w-xs text-sm z-50">
          <h3 className="font-bold mb-2">Controls</h3>
          <ul className="space-y-1 text-xs">
            <li>• WASD/Arrows: Fly spacecraft</li>
            <li>• E: Interact with objects</li>
            <li>• N: Open navigation console</li>
            <li>• ESC: Close menus</li>
          </ul>
          
          <div className="mt-4 pt-2 border-t border-gray-700">
            <div className="text-xs text-blue-300">Current Location:</div>
            <div className="font-medium">{currentLocation?.name || "Unknown"}</div>
          </div>
        </div>
      </Html>
    </>
  );
};

export default SpaceEnvironment;
