import { useState, useEffect } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Heart, 
  Zap, 
  Package, 
  HelpCircle, 
  Volume2, 
  VolumeX,
  Menu,
  Save,
  Upload
} from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useCharacter } from "@/lib/stores/useCharacter";
import { Controls } from "@/lib/types";
import Inventory from "./Inventory";
import SaveLoadMenu from "./SaveLoadMenu";

interface GameUIProps {
  onOpenInventory: () => void;
  onRequestHint: () => void;
  onToggleSound: () => void;
  isSoundOn: boolean;
  onReturnToMenu: () => void;
}

const GameUI = ({ 
  onRequestHint, 
  onToggleSound, 
  isSoundOn, 
  onReturnToMenu 
}: GameUIProps) => {
  const { selectedCharacter } = useCharacter();
  const [showInventory, setShowInventory] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  
  // Keyboard controls subscription
  const inventoryPressed = useKeyboardControls<Controls>(state => state.inventory);
  const hintPressed = useKeyboardControls<Controls>(state => state.hint);
  const menuPressed = useKeyboardControls<Controls>(state => state.menu);
  
  // Handle keyboard controls
  useEffect(() => {
    if (inventoryPressed) {
      setShowInventory(prev => !prev);
    }
  }, [inventoryPressed]);
  
  useEffect(() => {
    if (hintPressed) {
      onRequestHint();
    }
  }, [hintPressed, onRequestHint]);
  
  useEffect(() => {
    if (menuPressed) {
      setShowMenu(prev => !prev);
    }
  }, [menuPressed]);
  
  if (!selectedCharacter) return null;
  
  return (
    <>
      {/* Top status bar */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          {/* Character info */}
          <div className="bg-gray-900 bg-opacity-80 p-2 rounded-lg">
            <div className="text-white font-bold">
              {selectedCharacter.class} (Lv. {selectedCharacter.level})
            </div>
          </div>
          
          {/* Health bar */}
          <div className="flex items-center gap-2">
            <Heart className="text-red-500" size={20} />
            <div className="w-32 md:w-48">
              <Progress 
                value={(selectedCharacter.health / selectedCharacter.maxHealth) * 100} 
                className="h-2 bg-gray-700"
                indicatorClassName="bg-red-500"
              />
              <div className="text-xs text-white mt-1">
                {selectedCharacter.health}/{selectedCharacter.maxHealth}
              </div>
            </div>
          </div>
          
          {/* Energy bar */}
          <div className="flex items-center gap-2">
            <Zap className="text-blue-400" size={20} />
            <div className="w-32 md:w-48">
              <Progress 
                value={(selectedCharacter.energy / selectedCharacter.maxEnergy) * 100} 
                className="h-2 bg-gray-700"
                indicatorClassName="bg-blue-400"
              />
              <div className="text-xs text-white mt-1">
                {selectedCharacter.energy}/{selectedCharacter.maxEnergy}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-gray-800 bg-opacity-80"
            onClick={() => setShowInventory(true)}
          >
            <Package size={18} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-gray-800 bg-opacity-80"
            onClick={onRequestHint}
          >
            <HelpCircle size={18} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-gray-800 bg-opacity-80"
            onClick={onToggleSound}
          >
            {isSoundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-gray-800 bg-opacity-80"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu size={18} />
          </Button>
        </div>
      </div>
      
      {/* Controls help */}
      <div className="fixed bottom-4 left-4 bg-gray-900 bg-opacity-80 p-3 rounded-lg z-20 text-sm">
        <div className="text-white font-semibold mb-1">Controls:</div>
        <div className="text-gray-300">WASD / Arrows: Move</div>
        <div className="text-gray-300">E / Space: Interact</div>
        <div className="text-gray-300">I: Inventory</div>
        <div className="text-gray-300">H: Hint</div>
        <div className="text-gray-300">ESC: Menu</div>
      </div>
      
      {/* Game menu modal */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 w-80"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Game Menu</h2>
              <div className="space-y-4">
                <Button variant="default" className="w-full" onClick={() => setShowMenu(false)}>
                  Resume Game
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowInventory(true)}>
                  Inventory
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowSaveMenu(true);
                    setShowMenu(false);
                  }}
                >
                  Save Game
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowLoadMenu(true);
                    setShowMenu(false);
                  }}
                >
                  Load Game
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onToggleSound}
                >
                  {isSoundOn ? "Mute Sound" : "Enable Sound"}
                </Button>
                <Button variant="destructive" className="w-full" onClick={onReturnToMenu}>
                  Return to Main Menu
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Inventory modal */}
      <AnimatePresence>
        {showInventory && (
          <Inventory onClose={() => setShowInventory(false)} />
        )}
      </AnimatePresence>
      
      {/* Save/Load menus */}
      <AnimatePresence>
        {showSaveMenu && (
          <SaveLoadMenu 
            isOpen={showSaveMenu} 
            onClose={() => setShowSaveMenu(false)} 
            mode="save" 
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showLoadMenu && (
          <SaveLoadMenu 
            isOpen={showLoadMenu} 
            onClose={() => setShowLoadMenu(false)} 
            mode="load" 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default GameUI;
