import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { useCombat } from "@/lib/stores/useCombat";
import { useCharacter } from "@/lib/stores/useCharacter";
import { useAudio } from "@/lib/stores/useAudio";

interface CombatProps {
  onCombatEnd: () => void;
}

const Combat = ({ onCombatEnd }: CombatProps) => {
  const { 
    inCombat, 
    currentEnemy, 
    playerTurn, 
    combatLog, 
    attack, 
    useAbility,
    flee, 
    endCombat 
  } = useCombat();
  
  const { selectedCharacter } = useCharacter();
  const { playHit } = useAudio();
  const [animateAttack, setAnimateAttack] = useState(false);
  const [animateHit, setAnimateHit] = useState(false);
  
  // Exit combat if not in combat
  useEffect(() => {
    if (!inCombat || !currentEnemy) {
      onCombatEnd();
    }
  }, [inCombat, currentEnemy, onCombatEnd]);
  
  if (!selectedCharacter || !currentEnemy) {
    return null;
  }
  
  const handleAttack = () => {
    setAnimateAttack(true);
    setTimeout(() => {
      attack();
      setAnimateAttack(false);
      setAnimateHit(true);
      setTimeout(() => setAnimateHit(false), 300);
    }, 300);
  };
  
  const handleAbilityUse = (abilityId: string) => {
    setAnimateAttack(true);
    setTimeout(() => {
      useAbility(abilityId);
      setAnimateAttack(false);
      setAnimateHit(true);
      setTimeout(() => setAnimateHit(false), 300);
    }, 300);
  };
  
  const handleFlee = () => {
    const escaped = flee();
    if (escaped) {
      onCombatEnd();
    }
  };
  
  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col items-center">
      {/* Combat interface */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 p-4 h-full">
        {/* Left side - Character */}
        <div className="w-full md:w-1/3 flex flex-col">
          <Card className="p-4 bg-gray-800 flex-1">
            <h2 className="text-xl font-bold text-white mb-2">{selectedCharacter.name}</h2>
            
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">Health</span>
                <span className="text-white">{selectedCharacter.health}/{selectedCharacter.maxHealth}</span>
              </div>
              <Progress 
                value={(selectedCharacter.health / selectedCharacter.maxHealth) * 100} 
                className="h-2 bg-gray-700"
                indicatorClassName="bg-green-500"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">Energy</span>
                <span className="text-white">{selectedCharacter.energy}/{selectedCharacter.maxEnergy}</span>
              </div>
              <Progress 
                value={(selectedCharacter.energy / selectedCharacter.maxEnergy) * 100} 
                className="h-2 bg-gray-700"
                indicatorClassName="bg-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-md font-semibold text-gray-200">Abilities:</h3>
              {selectedCharacter.abilities.map(ability => (
                <Button 
                  key={ability.id}
                  variant="outline" 
                  size="sm"
                  className="w-full text-left justify-between"
                  disabled={!playerTurn || ability.currentCooldown > 0 || selectedCharacter.energy < ability.energyCost}
                  onClick={() => handleAbilityUse(ability.id)}
                >
                  <span>{ability.name}</span>
                  <span className="text-xs opacity-70">
                    {ability.currentCooldown > 0 
                      ? `CD: ${ability.currentCooldown}` 
                      : `E: ${ability.energyCost}`}
                  </span>
                </Button>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Center - Combat Area */}
        <div className="w-full md:w-1/3 flex flex-col">
          <Card className="p-4 bg-gray-800 flex-1 flex flex-col justify-center items-center">
            <div className="relative w-full h-48 flex justify-center items-center">
              {/* Player representation */}
              <motion.div 
                className="absolute left-1/4 transform -translate-x-1/2 w-16 h-32 bg-blue-500 rounded"
                animate={animateAttack ? { x: 50, rotateZ: 15 } : { x: 0, rotateZ: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              />
              
              {/* Enemy representation */}
              <motion.div 
                className="absolute right-1/4 transform translate-x-1/2 w-16 h-32 bg-red-500 rounded"
                animate={animateHit ? { x: -30, opacity: 0.7 } : { x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="w-full flex gap-2">
              <Button 
                variant="default" 
                className="flex-1"
                disabled={!playerTurn}
                onClick={handleAttack}
              >
                Attack
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                disabled={!playerTurn}
                onClick={handleFlee}
              >
                Flee
              </Button>
            </div>
            
            <div className="mt-4 text-center">
              {playerTurn 
                ? <span className="text-green-400">Your turn</span>
                : <span className="text-red-400">Enemy turn</span>}
            </div>
          </Card>
        </div>
        
        {/* Right side - Enemy & Combat Log */}
        <div className="w-full md:w-1/3 flex flex-col">
          <Card className="p-4 bg-gray-800 mb-4">
            <h2 className="text-xl font-bold text-white mb-2">{currentEnemy.name}</h2>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">Health</span>
                <span className="text-white">{currentEnemy.health}/{currentEnemy.maxHealth}</span>
              </div>
              <Progress 
                value={(currentEnemy.health / currentEnemy.maxHealth) * 100} 
                className="h-2 bg-gray-700"
                indicatorClassName="bg-red-500"
              />
            </div>
            
            <p className="text-gray-300 text-sm">{currentEnemy.description}</p>
          </Card>
          
          <Card className="p-4 bg-gray-800 flex-1 overflow-hidden">
            <h3 className="text-md font-semibold text-gray-200 mb-2">Combat Log:</h3>
            <div className="overflow-y-auto h-56 text-sm space-y-1">
              {combatLog.map((log, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="py-1 border-b border-gray-700 last:border-0"
                >
                  {log}
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Combat;
