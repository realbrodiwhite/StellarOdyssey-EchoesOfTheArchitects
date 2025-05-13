import { create } from "zustand";
import { useCharacter } from "./useCharacter";
import { useAudio } from "./useAudio";
import { Enemy, Ability } from "../types";

interface CombatState {
  inCombat: boolean;
  currentEnemy: Enemy | null;
  playerTurn: boolean;
  turnCount: number;
  combatLog: string[];
  
  // Combat management
  startCombat: (enemy: Enemy) => void;
  endCombat: (playerWon: boolean) => void;
  
  // Actions
  attack: () => void;
  useAbility: (abilityId: string) => void;
  useItem: (itemId: string) => void;
  flee: () => boolean;
  
  // Enemy actions
  enemyTurn: () => void;
  
  // Combat status
  isPlayerTurn: () => boolean;
  addToCombatLog: (message: string) => void;
}

export const useCombat = create<CombatState>((set, get) => ({
  inCombat: false,
  currentEnemy: null,
  playerTurn: true,
  turnCount: 0,
  combatLog: [],
  
  startCombat: (enemy) => {
    // Clone the enemy to avoid reference issues
    const enemyClone = { ...enemy };
    
    set({
      inCombat: true,
      currentEnemy: enemyClone,
      playerTurn: true, // Player goes first
      turnCount: 1,
      combatLog: [`Combat with ${enemyClone.name} has begun!`]
    });
  },
  
  endCombat: (playerWon) => {
    const enemy = get().currentEnemy;
    
    if (playerWon && enemy) {
      // Give player experience and any rewards
      const character = useCharacter.getState();
      character.gainExperience(enemy.reward.experience);
      
      // Add item rewards if any
      if (enemy.reward.items) {
        const inventory = useCharacter.getState();
        enemy.reward.items.forEach(item => {
          // Handle adding items to inventory here
        });
      }
      
      get().addToCombatLog(`You defeated ${enemy.name}! Gained ${enemy.reward.experience} XP.`);
    } else {
      get().addToCombatLog("You were defeated...");
    }
    
    set({
      inCombat: false,
      currentEnemy: null
    });
  },
  
  attack: () => {
    if (!get().inCombat || !get().playerTurn || !get().currentEnemy) return;
    
    const character = useCharacter.getState().selectedCharacter;
    if (!character) return;
    
    const enemy = get().currentEnemy;
    
    // Calculate basic attack damage (this could be more complex based on character stats/skills)
    const baseDamage = 10;
    const damageVariance = Math.floor(Math.random() * 6) - 2; // -2 to +3 variance
    const damage = Math.max(1, baseDamage + damageVariance);
    
    // Apply damage to enemy
    const newEnemyHealth = Math.max(0, enemy.health - damage);
    
    // Play hit sound
    useAudio.getState().playHit();
    
    // Update enemy health
    set({
      currentEnemy: {
        ...enemy,
        health: newEnemyHealth
      },
      playerTurn: false,
      combatLog: [...get().combatLog, `You attacked ${enemy.name} for ${damage} damage!`]
    });
    
    // Check if enemy is defeated
    if (newEnemyHealth <= 0) {
      get().addToCombatLog(`${enemy.name} has been defeated!`);
      get().endCombat(true);
      useAudio.getState().playSuccess();
      return;
    }
    
    // Process enemy turn
    setTimeout(() => {
      get().enemyTurn();
    }, 1000);
  },
  
  useAbility: (abilityId) => {
    if (!get().inCombat || !get().playerTurn || !get().currentEnemy) return;
    
    const character = useCharacter.getState();
    if (!character.selectedCharacter) return;
    
    // Try to use the ability
    const abilityUsed = character.useAbility(abilityId);
    if (!abilityUsed) {
      get().addToCombatLog("Cannot use that ability right now.");
      return;
    }
    
    const ability = character.selectedCharacter.abilities.find(a => a.id === abilityId);
    if (!ability) return;
    
    const enemy = get().currentEnemy;
    
    // Apply ability effects
    if (ability.damage && ability.damage > 0) {
      // Damage enemy
      const newEnemyHealth = Math.max(0, enemy.health - ability.damage);
      
      set({
        currentEnemy: {
          ...enemy,
          health: newEnemyHealth
        },
        playerTurn: false,
        combatLog: [...get().combatLog, `You used ${ability.name} for ${ability.damage} damage!`]
      });
      
      // Play hit sound
      useAudio.getState().playHit();
      
      // Check if enemy is defeated
      if (newEnemyHealth <= 0) {
        get().addToCombatLog(`${enemy.name} has been defeated!`);
        get().endCombat(true);
        useAudio.getState().playSuccess();
        return;
      }
    }
    
    if (ability.healing && ability.healing > 0) {
      // Heal player
      character.heal(ability.healing);
      
      get().addToCombatLog(`You used ${ability.name} and healed for ${ability.healing} health!`);
      set({ playerTurn: false });
    }
    
    // If no damage or healing, just log the ability use
    if (!ability.damage && !ability.healing) {
      get().addToCombatLog(`You used ${ability.name}!`);
      set({ playerTurn: false });
    }
    
    // Process enemy turn
    setTimeout(() => {
      get().enemyTurn();
    }, 1000);
  },
  
  useItem: (itemId) => {
    if (!get().inCombat || !get().playerTurn) return;
    
    const inventory = useCharacter.getState();
    // Implement item usage logic here
    
    set({ playerTurn: false });
    
    // Process enemy turn
    setTimeout(() => {
      get().enemyTurn();
    }, 1000);
  },
  
  flee: () => {
    if (!get().inCombat || !get().playerTurn) return false;
    
    // 50% chance to flee successfully
    const fleeSuccess = Math.random() > 0.5;
    
    if (fleeSuccess) {
      get().addToCombatLog("You successfully fled from combat!");
      set({
        inCombat: false,
        currentEnemy: null
      });
      return true;
    } else {
      get().addToCombatLog("You failed to flee!");
      set({ playerTurn: false });
      
      // Process enemy turn
      setTimeout(() => {
        get().enemyTurn();
      }, 1000);
      return false;
    }
  },
  
  enemyTurn: () => {
    if (!get().inCombat || get().playerTurn || !get().currentEnemy) return;
    
    const enemy = get().currentEnemy;
    const character = useCharacter.getState();
    
    if (!character.selectedCharacter) return;
    
    // Simple AI: randomly choose between basic attack and abilities
    const useAbility = enemy.abilities.length > 0 && Math.random() > 0.6;
    
    if (useAbility) {
      // Randomly select an ability
      const abilityIndex = Math.floor(Math.random() * enemy.abilities.length);
      const ability = enemy.abilities[abilityIndex];
      
      // Apply ability effects
      if (ability.damage && ability.damage > 0) {
        character.takeDamage(ability.damage);
        get().addToCombatLog(`${enemy.name} used ${ability.name} for ${ability.damage} damage!`);
        
        // Play hit sound
        useAudio.getState().playHit();
        
        // Check if player is defeated
        if (character.isDead()) {
          get().addToCombatLog("You have been defeated!");
          get().endCombat(false);
          return;
        }
      } else if (ability.healing && ability.healing > 0) {
        const newEnemyHealth = Math.min(enemy.maxHealth, enemy.health + ability.healing);
        
        set({
          currentEnemy: {
            ...enemy,
            health: newEnemyHealth
          }
        });
        
        get().addToCombatLog(`${enemy.name} used ${ability.name} and healed for ${ability.healing} health!`);
      } else {
        get().addToCombatLog(`${enemy.name} used ${ability.name}!`);
      }
    } else {
      // Basic attack
      const damage = enemy.damage + Math.floor(Math.random() * 4) - 1; // -1 to +2 variance
      character.takeDamage(damage);
      
      get().addToCombatLog(`${enemy.name} attacked you for ${damage} damage!`);
      
      // Play hit sound
      useAudio.getState().playHit();
      
      // Check if player is defeated
      if (character.isDead()) {
        get().addToCombatLog("You have been defeated!");
        get().endCombat(false);
        return;
      }
    }
    
    // Increment turn counter and give turn back to player
    set(state => ({
      turnCount: state.turnCount + 1,
      playerTurn: true
    }));
    
    // Update ability cooldowns at the end of a full turn
    character.updateCooldowns();
  },
  
  isPlayerTurn: () => {
    return get().playerTurn;
  },
  
  addToCombatLog: (message) => {
    set(state => ({
      combatLog: [...state.combatLog, message]
    }));
  }
}));
