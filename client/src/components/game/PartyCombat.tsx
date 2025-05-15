import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParty } from '@/lib/stores/useParty';
import { useCharacter } from '@/lib/stores/useCharacter';
import { Button } from '../ui/button';
import { Ability, Enemy } from '@/lib/types';

interface PartyCombatProps {
  enemies: Enemy[];
  onCombatEnd: (victory: boolean) => void;
  background?: string;
}

const PartyCombat: React.FC<PartyCombatProps> = ({ enemies, onCombatEnd, background = '/images/backgrounds/space-battle.jpg' }) => {
  const { selectedCharacter, useAbility, takeDamage, heal, updateCooldowns } = useCharacter();
  const { activePartyMembers } = useParty();
  
  const [currentEnemies, setCurrentEnemies] = useState<Enemy[]>(
    enemies.map(enemy => ({ ...enemy, health: enemy.maxHealth }))
  );
  
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>(['Combat initiated!']);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [activePartyMemberIndex, setActivePartyMemberIndex] = useState<number>(0);
  
  // Check if combat is over
  useEffect(() => {
    if (currentEnemies.every(enemy => enemy.health <= 0)) {
      // All enemies defeated
      addToCombatLog('All enemies defeated! Victory!');
      setTimeout(() => {
        onCombatEnd(true);
      }, 2000);
    } else if (!selectedCharacter || selectedCharacter.health <= 0) {
      // Player defeated
      addToCombatLog('You have been defeated!');
      setTimeout(() => {
        onCombatEnd(false);
      }, 2000);
    }
  }, [currentEnemies, selectedCharacter]);
  
  // Simple combat log system
  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev, message]);
  };
  
  // Party member takes an action
  const handlePartyMemberAction = (ability: Ability) => {
    setSelectedAbility(ability);
    // If area effect ability, no need to select target
    if (ability.areaEffect) {
      handleAbilityUse(ability, -1);
    }
  };
  
  // Use ability on target
  const handleAbilityUse = (ability: Ability, targetIndex: number) => {
    if (turn !== 'player') return;
    
    let actionSuccessful = false;
    const isMainCharacter = activePartyMemberIndex === -1;
    
    // If it's the player character
    if (isMainCharacter && selectedCharacter) {
      // Player character uses ability
      const successfulUse = useAbility(ability.id);
      
      if (successfulUse) {
        // Handle damage/healing from player character
        if (ability.damage && targetIndex >= 0) {
          const damage = ability.damage;
          const newEnemies = [...currentEnemies];
          newEnemies[targetIndex] = {
            ...newEnemies[targetIndex],
            health: Math.max(0, newEnemies[targetIndex].health - damage)
          };
          
          setCurrentEnemies(newEnemies);
          addToCombatLog(`${selectedCharacter.name} used ${ability.name} on ${newEnemies[targetIndex].name} for ${damage} damage!`);
          
          // If this killed the enemy
          if (newEnemies[targetIndex].health <= 0) {
            addToCombatLog(`${newEnemies[targetIndex].name} was defeated!`);
          }
        } else if (ability.damage && ability.areaEffect) {
          // Area effect damage
          const damage = ability.damage;
          const newEnemies = currentEnemies.map(enemy => ({
            ...enemy,
            health: Math.max(0, enemy.health - damage)
          }));
          
          setCurrentEnemies(newEnemies);
          addToCombatLog(`${selectedCharacter.name} used ${ability.name} on all enemies for ${damage} damage!`);
          
          // Check if any enemies were defeated
          newEnemies.forEach((enemy, i) => {
            if (enemy.health <= 0 && currentEnemies[i].health > 0) {
              addToCombatLog(`${enemy.name} was defeated!`);
            }
          });
        } else if (ability.healing) {
          // Handle healing on player
          heal(ability.healing);
          addToCombatLog(`${selectedCharacter.name} healed for ${ability.healing} health!`);
        }
        
        actionSuccessful = true;
      } else {
        addToCombatLog(`${selectedCharacter.name} failed to use ${ability.name}!`);
      }
    }
    // Otherwise it's a party member's turn
    else if (activePartyMemberIndex >= 0 && activePartyMemberIndex < activePartyMembers.length) {
      const partyMember = activePartyMembers[activePartyMemberIndex];
      
      // Check if ability is on cooldown for party member
      const partyMemberAbility = partyMember.abilities.find(a => a.id === ability.id);
      if (!partyMemberAbility || partyMemberAbility.currentCooldown > 0 || partyMember.energy < ability.energyCost) {
        addToCombatLog(`${partyMember.name} can't use ${ability.name} yet!`);
        return;
      }
      
      // Use energy and put ability on cooldown
      // In a real implementation, you would update the party member's state in the store
      
      // Handle damage/healing from party member
      if (ability.damage && targetIndex >= 0) {
        const damage = ability.damage;
        const newEnemies = [...currentEnemies];
        newEnemies[targetIndex] = {
          ...newEnemies[targetIndex],
          health: Math.max(0, newEnemies[targetIndex].health - damage)
        };
        
        setCurrentEnemies(newEnemies);
        addToCombatLog(`${partyMember.name} used ${ability.name} on ${newEnemies[targetIndex].name} for ${damage} damage!`);
        
        if (newEnemies[targetIndex].health <= 0) {
          addToCombatLog(`${newEnemies[targetIndex].name} was defeated!`);
        }
      } else if (ability.damage && ability.areaEffect) {
        // Area effect damage
        const damage = ability.damage;
        const newEnemies = currentEnemies.map(enemy => ({
          ...enemy,
          health: Math.max(0, enemy.health - damage)
        }));
        
        setCurrentEnemies(newEnemies);
        addToCombatLog(`${partyMember.name} used ${ability.name} on all enemies for ${damage} damage!`);
        
        newEnemies.forEach((enemy, i) => {
          if (enemy.health <= 0 && currentEnemies[i].health > 0) {
            addToCombatLog(`${enemy.name} was defeated!`);
          }
        });
      } else if (ability.healing) {
        // Handle healing - in a full implementation, could choose who to heal
        heal(ability.healing);
        addToCombatLog(`${partyMember.name} healed ${selectedCharacter?.name} for ${ability.healing} health!`);
      }
      
      actionSuccessful = true;
    }
    
    if (actionSuccessful) {
      setSelectedAbility(null);
      setSelectedTarget(null);
      
      // Move to next party member's turn or enemy turn
      const nextIndex = activePartyMemberIndex + 1;
      if (nextIndex >= activePartyMembers.length) {
        // All party members have gone, now it's enemy turn
        setActivePartyMemberIndex(-1); // Reset for next round
        setTurn('enemy');
        setTimeout(handleEnemyTurn, 1000);
      } else {
        // Move to next party member
        setActivePartyMemberIndex(nextIndex);
      }
    }
  };
  
  // Enemy turn logic
  const handleEnemyTurn = () => {
    if (turn !== 'enemy' || !selectedCharacter) return;
    
    // Process each enemy that's still alive
    const aliveEnemies = currentEnemies.filter(enemy => enemy.health > 0);
    
    // Simple AI for enemies - they just attack the player or use random abilities
    aliveEnemies.forEach((enemy, index) => {
      setTimeout(() => {
        // 70% chance to use a basic attack, 30% to use a special ability
        const useSpecialAbility = Math.random() > 0.7 && enemy.abilities.length > 0;
        
        if (useSpecialAbility) {
          // Pick a random ability
          const ability = enemy.abilities[Math.floor(Math.random() * enemy.abilities.length)];
          
          if (ability.damage) {
            // For simplicity, target the player character directly
            takeDamage(ability.damage);
            addToCombatLog(`${enemy.name} used ${ability.name} on ${selectedCharacter.name} for ${ability.damage} damage!`);
          }
        } else {
          // Basic attack
          const damage = enemy.damage;
          takeDamage(damage);
          addToCombatLog(`${enemy.name} attacks ${selectedCharacter.name} for ${damage} damage!`);
        }
        
        // If this was the last enemy, end enemy turn
        if (index === aliveEnemies.length - 1) {
          setTurn('player');
          setActivePartyMemberIndex(0);
          updateCooldowns(); // Update player ability cooldowns
        }
      }, index * 800); // Stagger enemy attacks for better visual effect
    });
    
    // If no enemies are alive, go back to player turn
    if (aliveEnemies.length === 0) {
      setTurn('player');
      setActivePartyMemberIndex(0);
      updateCooldowns();
    }
  };
  
  // Get the active character (player or party member)
  const getActiveCharacter = () => {
    if (activePartyMemberIndex === -1 || activePartyMemberIndex >= activePartyMembers.length) {
      return selectedCharacter;
    }
    return activePartyMembers[activePartyMemberIndex];
  };
  
  // Render health bar for enemies and party members
  const renderHealthBar = (current: number, max: number, type: 'enemy' | 'ally' = 'enemy') => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    const colorClass = type === 'enemy' 
      ? percentage < 20 ? 'bg-red-600' : percentage < 40 ? 'bg-red-500' : 'bg-red-400'
      : percentage < 20 ? 'bg-green-600' : percentage < 40 ? 'bg-green-500' : 'bg-green-400';

    return (
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden w-full">
        <div 
          className={`h-full ${colorClass} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex flex-col"
      style={{ 
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Combat UI Layout */}
      <div className="flex-1 flex flex-col">
        {/* Enemy section */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {currentEnemies.map((enemy, index) => (
              <motion.div
                key={`enemy-${index}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ 
                  opacity: enemy.health <= 0 ? 0.5 : 1, 
                  y: 0,
                  scale: enemy.health <= 0 ? 0.9 : 1
                }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-900/80 border border-gray-700 rounded-lg p-3 cursor-pointer relative ${
                  selectedTarget === index && 'ring-2 ring-red-500'
                } ${enemy.health <= 0 && 'opacity-50 cursor-not-allowed'}`}
                onClick={() => {
                  if (enemy.health <= 0) return;
                  if (selectedAbility && !selectedAbility.areaEffect) {
                    setSelectedTarget(index);
                    handleAbilityUse(selectedAbility, index);
                  }
                }}
              >
                {enemy.health <= 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg text-white">
                    Defeated
                  </div>
                )}
                
                <h3 className="text-white font-semibold flex justify-between">
                  <span>{enemy.name}</span>
                  <span className="text-sm text-red-400">{enemy.health}/{enemy.maxHealth}</span>
                </h3>
                
                {renderHealthBar(enemy.health, enemy.maxHealth)}
                
                <p className="text-gray-300 text-sm mt-1.5 line-clamp-2">{enemy.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Combat log */}
        <div className="bg-gray-900/90 border-t border-gray-800 h-32 overflow-y-auto p-2">
          {combatLog.map((message, index) => (
            <div 
              key={`log-${index}`}
              className={`text-sm ${index === combatLog.length - 1 ? 'text-white' : 'text-gray-400'}`}
            >
              {message}
            </div>
          ))}
        </div>
        
        {/* Action bar */}
        <div className="bg-gray-900 p-3 border-t border-gray-700">
          <div className="max-w-4xl mx-auto flex flex-col">
            {/* Active character info */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="font-semibold text-white">
                    {turn === 'player' ? 
                      `${getActiveCharacter()?.name}'s Turn` : 
                      "Enemy Turn"
                    }
                  </div>
                  {turn === 'player' && getActiveCharacter() && (
                    <div className="text-sm text-blue-400">
                      Select an ability to use
                    </div>
                  )}
                </div>
              </div>
              {getActiveCharacter() && (
                <div className="flex gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Health: </span>
                    <span className="text-white">{getActiveCharacter()?.health}/{getActiveCharacter()?.maxHealth}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Energy: </span>
                    <span className="text-white">{getActiveCharacter()?.energy}/{getActiveCharacter()?.maxEnergy}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Abilities or actions */}
            {turn === 'player' && getActiveCharacter() && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {getActiveCharacter()?.abilities.map((ability, index) => {
                  const onCooldown = ability.currentCooldown > 0;
                  const notEnoughEnergy = (getActiveCharacter()?.energy || 0) < ability.energyCost;
                  const disabled = onCooldown || notEnoughEnergy;
                  
                  return (
                    <Button
                      key={`ability-${index}`}
                      variant={selectedAbility?.id === ability.id ? "default" : "outline"}
                      className="flex flex-col items-center py-2 h-auto"
                      onClick={() => handlePartyMemberAction(ability)}
                      disabled={disabled || turn !== 'player'}
                    >
                      <div className="font-medium">{ability.name}</div>
                      <div className="text-xs flex justify-between w-full mt-1">
                        <span className="text-blue-400">{ability.energyCost} EN</span>
                        {onCooldown ? (
                          <span className="text-red-400">CD: {ability.currentCooldown}</span>
                        ) : (
                          <span>
                            {ability.damage && <span className="text-red-400">DMG: {ability.damage}</span>}
                            {ability.healing && <span className="text-green-400">HEAL: {ability.healing}</span>}
                          </span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Party members */}
      <div className="bg-gray-900/90 border-t border-gray-700 p-2">
        <div className="flex gap-2 max-w-4xl mx-auto">
          {/* Player character */}
          {selectedCharacter && (
            <div className={`bg-gray-800 rounded p-2 flex-1 ${activePartyMemberIndex === -1 && turn === 'player' ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex justify-between items-center">
                <div className="font-semibold text-white">{selectedCharacter.name}</div>
                <div className="text-xs text-blue-400">{selectedCharacter.class}</div>
              </div>
              <div className="flex justify-between text-xs text-gray-300 mt-1">
                <span>HP: {selectedCharacter.health}/{selectedCharacter.maxHealth}</span>
                <span>EN: {selectedCharacter.energy}/{selectedCharacter.maxEnergy}</span>
              </div>
              {renderHealthBar(selectedCharacter.health, selectedCharacter.maxHealth, 'ally')}
            </div>
          )}
          
          {/* Other party members */}
          {activePartyMembers.map((member, index) => (
            <div 
              key={`party-${index}`}
              className={`bg-gray-800 rounded p-2 flex-1 ${activePartyMemberIndex === index && turn === 'player' ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex justify-between items-center">
                <div className="font-semibold text-white">{member.name}</div>
                <div className="text-xs text-blue-400">{member.specialization}</div>
              </div>
              <div className="flex justify-between text-xs text-gray-300 mt-1">
                <span>HP: {member.health}/{member.maxHealth}</span>
                <span>EN: {member.energy}/{member.maxEnergy}</span>
              </div>
              {renderHealthBar(member.health, member.maxHealth, 'ally')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartyCombat;