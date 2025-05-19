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
  Upload,
  Users,
  MessageCircle
} from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useCharacter } from "@/lib/stores/useCharacter";
import { useParty } from "@/lib/stores/useParty";
import { Controls } from "@/lib/types";
import Inventory from "./Inventory";
import SaveLoadMenu from "./SaveLoadMenu";
import SimplePartyManager from "./SimplePartyManager";
import CrewInteractionManager from "./CrewInteractionManager";

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
  const character = useCharacter(state => state.character);
  const [showInventory, setShowInventory] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [showPartyManager, setShowPartyManager] = useState(false);
  const [showCrewInteractions, setShowCrewInteractions] = useState(false);
  
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
  
  if (!character) return null;
  
  return (
    <>
      {/* Top status bar */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          {/* Character info */}
          <div className="bg-gray-900 bg-opacity-80 p-2 rounded-lg">
            <div className="text-white font-bold">
              {character.class} (Lv. {character.level})
            </div>
          </div>
          
          {/* Health bar */}
          <div className="flex items-center gap-2">
            <Heart className="text-red-500" size={20} />
            <div className="w-32 md:w-48">
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
                />
              </div>
              <div className="text-xs text-white mt-1">
                {character.health}/{character.maxHealth}
              </div>
            </div>
          </div>
          
          {/* Energy bar */}
          <div className="flex items-center gap-2">
            <Zap className="text-blue-400" size={20} />
            <div className="w-32 md:w-48">
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full" 
                  style={{ width: `${(character.energy / character.maxEnergy) * 100}%` }}
                />
              </div>
              <div className="text-xs text-white mt-1">
                {character.energy}/{character.maxEnergy}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-gray-800 bg-opacity-80 w-[24px] h-[24px] p-0.5"
            onClick={() => setShowInventory(true)}
          >
            <Package size={12} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-gray-800 bg-opacity-80 w-[24px] h-[24px] p-0.5"
            onClick={() => setShowPartyManager(true)}
          >
            <Users size={12} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-gray-800 bg-opacity-80 w-[24px] h-[24px] p-0.5"
            onClick={() => setShowCrewInteractions(true)}
          >
            <MessageCircle size={12} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-gray-800 bg-opacity-80 w-[24px] h-[24px] p-0.5"
            onClick={onRequestHint}
          >
            <HelpCircle size={12} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-gray-800 bg-opacity-80 w-[24px] h-[24px] p-0.5"
            onClick={onToggleSound}
          >
            {isSoundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-gray-800 bg-opacity-80 w-[24px] h-[24px] p-0.5"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu size={12} />
          </Button>
        </div>
      </div>
      
      {/* Controls help - adaptive for desktop/mobile */}
      <div className="fixed bottom-4 left-4 bg-gray-900 bg-opacity-80 p-2 rounded-lg z-20 text-xs md:text-sm max-w-[150px] md:max-w-none">
        <div className="text-white font-semibold mb-0.5 md:mb-1 text-[10px] md:text-sm">Controls:</div>
        <div className="text-gray-300 text-[10px] md:text-sm">WASD / Arrows: Move</div>
        <div className="text-gray-300 text-[10px] md:text-sm">E / Space: Interact</div>
        <div className="text-gray-300 text-[10px] md:text-sm">I: Inventory</div>
        <div className="text-gray-300 text-[10px] md:text-sm">H: Hint</div>
        <div className="text-gray-300 text-[10px] md:text-sm">ESC: Menu</div>
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
      
      {/* Party Manager modal */}
      <AnimatePresence>
        {showPartyManager && (
          <SimplePartyManager onClose={() => setShowPartyManager(false)} />
        )}
      </AnimatePresence>
      
      {/* Crew Interactions modal */}
      <AnimatePresence>
        {showCrewInteractions && (
          <CrewInteractionManager 
            onClose={() => setShowCrewInteractions(false)}
            currentLocation="Ship Bridge" 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default GameUI;
