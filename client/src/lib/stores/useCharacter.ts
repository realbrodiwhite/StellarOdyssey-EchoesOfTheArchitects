import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Character, Skill, SkillType, Item, Ability } from "../types";
import { characterTemplates } from "../data/characters";
import { generateCoreSkills } from "../data/skills";

interface CharacterState {
  selectedCharacter: Character | null;
  
  // Character selection and management
  selectCharacter: (characterClass: string) => void;
  resetCharacter: () => void;
  
  // Stats and progression
  gainExperience: (amount: number) => void;
  levelUp: () => void;
  improveSkill: (skillId: string) => boolean;
  
  // Health and energy
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  useEnergy: (amount: number) => boolean;
  restoreEnergy: (amount: number) => void;
  
  // Abilities
  useAbility: (abilityId: string) => boolean;
  updateCooldowns: () => void;
  
  // Character status checks
  isDead: () => boolean;
  canUseAbility: (abilityId: string) => boolean;
  hasSkillLevel: (skillType: SkillType, level: number) => boolean;
}

// Experience needed for each level
const experienceRequirements = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3300];

export const useCharacter = create<CharacterState>()(
  persist(
    (set, get) => ({
      selectedCharacter: null,
      
      selectCharacter: (characterClass) => {
        const template = characterTemplates.find(c => c.class.toString() === characterClass);
        if (template) {
          set({ selectedCharacter: { ...template } });
        }
      },
      
      resetCharacter: () => {
        set({ selectedCharacter: null });
      },
      
      gainExperience: (amount) => {
        const character = get().selectedCharacter;
        if (!character) return;
        
        const newExperience = character.experience + amount;
        set({
          selectedCharacter: {
            ...character,
            experience: newExperience
          }
        });
        
        // Check if level up is available
        if (character.level < 10 && newExperience >= experienceRequirements[character.level]) {
          get().levelUp();
        }
      },
      
      levelUp: () => {
        const character = get().selectedCharacter;
        if (!character || character.level >= 10) return;
        
        set({
          selectedCharacter: {
            ...character,
            level: character.level + 1,
            maxHealth: character.maxHealth + 10,
            health: character.health + 10,
            maxEnergy: character.maxEnergy + 5,
            energy: character.energy + 5
          }
        });
      },
      
      improveSkill: (skillId) => {
        const character = get().selectedCharacter;
        if (!character) return false;
        
        const updatedSkills = character.skills.map(skill => {
          if (skill.id === skillId && skill.level < skill.maxLevel) {
            return { ...skill, level: skill.level + 1 };
          }
          return skill;
        });
        
        // Check if any skill was actually improved
        const skillImproved = updatedSkills.some(
          (skill, idx) => skill.level !== character.skills[idx].level
        );
        
        if (skillImproved) {
          set({
            selectedCharacter: {
              ...character,
              skills: updatedSkills
            }
          });
          return true;
        }
        
        return false;
      },
      
      takeDamage: (amount) => {
        const character = get().selectedCharacter;
        if (!character) return;
        
        const newHealth = Math.max(0, character.health - amount);
        set({
          selectedCharacter: {
            ...character,
            health: newHealth
          }
        });
      },
      
      heal: (amount) => {
        const character = get().selectedCharacter;
        if (!character) return;
        
        const newHealth = Math.min(character.maxHealth, character.health + amount);
        set({
          selectedCharacter: {
            ...character,
            health: newHealth
          }
        });
      },
      
      useEnergy: (amount) => {
        const character = get().selectedCharacter;
        if (!character || character.energy < amount) return false;
        
        set({
          selectedCharacter: {
            ...character,
            energy: character.energy - amount
          }
        });
        
        return true;
      },
      
      restoreEnergy: (amount) => {
        const character = get().selectedCharacter;
        if (!character) return;
        
        const newEnergy = Math.min(character.maxEnergy, character.energy + amount);
        set({
          selectedCharacter: {
            ...character,
            energy: newEnergy
          }
        });
      },
      
      useAbility: (abilityId) => {
        const character = get().selectedCharacter;
        if (!character) return false;
        
        const ability = character.abilities.find(a => a.id === abilityId);
        if (!ability) return false;
        
        // Check if ability is on cooldown
        if (ability.currentCooldown > 0) return false;
        
        // Check if character has enough energy
        if (character.energy < ability.energyCost) return false;
        
        // Check if character has required skill level
        if (ability.requiredSkill && 
            !get().hasSkillLevel(ability.requiredSkill.type, ability.requiredSkill.level)) {
          return false;
        }
        
        // Use energy and put ability on cooldown
        const updatedAbilities = character.abilities.map(a => {
          if (a.id === abilityId) {
            return { ...a, currentCooldown: a.cooldown };
          }
          return a;
        });
        
        set({
          selectedCharacter: {
            ...character,
            energy: character.energy - ability.energyCost,
            abilities: updatedAbilities
          }
        });
        
        return true;
      },
      
      updateCooldowns: () => {
        const character = get().selectedCharacter;
        if (!character) return;
        
        const updatedAbilities = character.abilities.map(ability => {
          if (ability.currentCooldown > 0) {
            return { ...ability, currentCooldown: ability.currentCooldown - 1 };
          }
          return ability;
        });
        
        set({
          selectedCharacter: {
            ...character,
            abilities: updatedAbilities
          }
        });
      },
      
      isDead: () => {
        const character = get().selectedCharacter;
        return character ? character.health <= 0 : false;
      },
      
      canUseAbility: (abilityId) => {
        const character = get().selectedCharacter;
        if (!character) return false;
        
        const ability = character.abilities.find(a => a.id === abilityId);
        if (!ability) return false;
        
        // Check cooldown and energy
        if (ability.currentCooldown > 0 || character.energy < ability.energyCost) return false;
        
        // Check required skill level
        if (ability.requiredSkill && 
            !get().hasSkillLevel(ability.requiredSkill.type, ability.requiredSkill.level)) {
          return false;
        }
        
        return true;
      },
      
      hasSkillLevel: (skillType, level) => {
        const character = get().selectedCharacter;
        if (!character) return false;
        
        const skill = character.skills.find(s => s.type === skillType);
        return skill ? skill.level >= level : false;
      }
    }),
    {
      name: "character-storage", // name of the item in localStorage
      partialize: (state) => ({ selectedCharacter: state.selectedCharacter }), // only store selected character
    }
  )
);
