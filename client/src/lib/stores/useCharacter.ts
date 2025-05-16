import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Character, CharacterClass, Gender, Skill, Item, Ability, SkillType } from '../types';

interface CharacterState {
  character: Character;
  
  // Character management
  initializeCharacter: (template: Partial<Character>) => void;
  selectCharacter: (template: Partial<Character>) => void; // Added this function
  gainExperience: (amount: number) => boolean;
  gainHealth: (amount: number) => void;
  loseHealth: (amount: number) => void;
  gainEnergy: (amount: number) => void;
  useEnergy: (amount: number) => boolean;
  
  // Skills management
  improveSkill: (skillId: string) => boolean;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  
  // Inventory management
  addItem: (item: Omit<Item, 'id'>) => void;
  removeItem: (itemId: string) => boolean;
  useItem: (itemId: string) => boolean;
  
  // Abilities management
  addAbility: (ability: Omit<Ability, 'id'>) => void;
  useAbility: (abilityId: string) => boolean;
  cooldownAbilities: () => void;
  
  // Reset
  resetCharacter: () => void;
}

// Experience needed for each level
const experienceThresholds = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 
  3250, 3850, 4500, 5200, 6000, 6900, 7900, 9000, 10200, 11500
];

// Starting character template
const newCharacter: Character = {
  id: '1',
  name: 'Player',
  class: CharacterClass.Pilot,
  description: 'A skilled ship pilot with experience navigating through dangerous territories.',
  skills: [
    {
      id: 'skill_navigation',
      name: 'Navigation',
      type: SkillType.Navigation,
      level: 2,
      description: 'Ability to plot efficient courses and navigate hazardous regions.',
      maxLevel: 5
    },
    {
      id: 'skill_piloting',
      name: 'Piloting',
      type: SkillType.Navigation,
      level: 3,
      description: 'Expertise in handling various spacecraft under different conditions.',
      maxLevel: 5
    },
    {
      id: 'skill_technical',
      name: 'Technical Aptitude',
      type: SkillType.Technical,
      level: 1,
      description: 'Basic understanding of ship systems and technical components.',
      maxLevel: 5
    }
  ],
  health: 100,
  maxHealth: 100,
  energy: 100,
  maxEnergy: 100,
  level: 1,
  experience: 0,
  inventory: [],
  abilities: [
    {
      id: 'ability_evasive',
      name: 'Evasive Maneuvers',
      description: 'Execute a series of complex flight patterns to avoid incoming danger.',
      energyCost: 30,
      cooldown: 3,
      currentCooldown: 0,
      requiredSkill: { type: SkillType.Navigation, level: 2 }
    }
  ],
  gender: Gender.Male,
  credits: 200,
  shield: 50,
  maxShield: 50
};

export const useCharacter = create<CharacterState>()(
  persist(
    (set, get) => ({
      character: { ...newCharacter },
      
      // Initialize a character with custom properties merged with defaults
      initializeCharacter: (template) => {
        const templateWithDefaults = {
          ...newCharacter,
          ...template,
          id: uuidv4()
        };
        
        set({ character: templateWithDefaults });
        console.log(`Character initialized: ${templateWithDefaults.name}`);
      },
      
      gainExperience: (amount) => {
        const { character } = get();
        const currentExp = character.experience + amount;
        const currentLevel = character.level;
        
        let newLevel = currentLevel;
        // Check if character leveled up
        while (newLevel < experienceThresholds.length && currentExp >= experienceThresholds[newLevel]) {
          newLevel++;
        }
        
        const leveledUp = newLevel > currentLevel;
        
        // Update character
        set(state => ({
          character: {
            ...state.character,
            experience: currentExp,
            level: newLevel,
            // If leveled up, increase stats
            maxHealth: leveledUp ? state.character.maxHealth + 10 : state.character.maxHealth,
            health: leveledUp ? state.character.maxHealth + 10 : state.character.health,
            maxEnergy: leveledUp ? state.character.maxEnergy + 5 : state.character.maxEnergy,
            energy: leveledUp ? state.character.maxEnergy + 5 : state.character.energy,
          }
        }));
        
        if (leveledUp) {
          console.log(`Character leveled up to ${newLevel}!`);
        }
        
        return leveledUp;
      },
      
      gainHealth: (amount) => {
        const { character } = get();
        const newHealth = Math.min(character.health + amount, character.maxHealth);
        
        set(state => ({
          character: {
            ...state.character,
            health: newHealth
          }
        }));
        
        console.log(`Character gained ${amount} health. Current: ${newHealth}/${character.maxHealth}`);
      },
      
      loseHealth: (amount) => {
        const { character } = get();
        
        // First apply damage to shield if available
        let remainingDamage = amount;
        let newShield = character.shield || 0;
        
        if (newShield > 0) {
          if (newShield >= remainingDamage) {
            newShield -= remainingDamage;
            remainingDamage = 0;
          } else {
            remainingDamage -= newShield;
            newShield = 0;
          }
        }
        
        // Apply remaining damage to health
        const newHealth = Math.max(character.health - remainingDamage, 0);
        
        set(state => ({
          character: {
            ...state.character,
            health: newHealth,
            shield: newShield
          }
        }));
        
        console.log(`Character lost ${amount} health (${amount - remainingDamage} absorbed by shield). Current: ${newHealth}/${character.maxHealth}, Shield: ${newShield}`);
      },
      
      gainEnergy: (amount) => {
        const { character } = get();
        const newEnergy = Math.min(character.energy + amount, character.maxEnergy);
        
        set(state => ({
          character: {
            ...state.character,
            energy: newEnergy
          }
        }));
        
        console.log(`Character gained ${amount} energy. Current: ${newEnergy}/${character.maxEnergy}`);
      },
      
      useEnergy: (amount) => {
        const { character } = get();
        
        if (character.energy < amount) {
          console.log(`Not enough energy. Required: ${amount}, Current: ${character.energy}`);
          return false;
        }
        
        set(state => ({
          character: {
            ...state.character,
            energy: state.character.energy - amount
          }
        }));
        
        console.log(`Character used ${amount} energy. Remaining: ${character.energy - amount}`);
        return true;
      },
      
      improveSkill: (skillId) => {
        const { character } = get();
        const skillIndex = character.skills.findIndex(skill => skill.id === skillId);
        
        if (skillIndex === -1) {
          console.log(`Skill not found: ${skillId}`);
          return false;
        }
        
        const skill = character.skills[skillIndex];
        
        if (skill.level >= skill.maxLevel) {
          console.log(`Skill already at max level: ${skill.name}`);
          return false;
        }
        
        // Update skill
        const updatedSkills = [...character.skills];
        updatedSkills[skillIndex] = {
          ...skill,
          level: skill.level + 1
        };
        
        set(state => ({
          character: {
            ...state.character,
            skills: updatedSkills
          }
        }));
        
        console.log(`Improved skill: ${skill.name} to level ${skill.level + 1}`);
        return true;
      },
      
      addSkill: (skillTemplate) => {
        const skill: Skill = {
          ...skillTemplate,
          id: `skill_${uuidv4()}`
        };
        
        set(state => ({
          character: {
            ...state.character,
            skills: [...state.character.skills, skill]
          }
        }));
        
        console.log(`Added new skill: ${skill.name}`);
      },
      
      addItem: (itemTemplate) => {
        const item: Item = {
          ...itemTemplate,
          id: `item_${uuidv4()}`
        };
        
        set(state => ({
          character: {
            ...state.character,
            inventory: [...state.character.inventory, item]
          }
        }));
        
        console.log(`Added item to inventory: ${item.name}`);
      },
      
      removeItem: (itemId) => {
        const { character } = get();
        const itemIndex = character.inventory.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
          console.log(`Item not found: ${itemId}`);
          return false;
        }
        
        const updatedInventory = character.inventory.filter(item => item.id !== itemId);
        
        set(state => ({
          character: {
            ...state.character,
            inventory: updatedInventory
          }
        }));
        
        console.log(`Removed item from inventory: ${character.inventory[itemIndex].name}`);
        return true;
      },
      
      useItem: (itemId) => {
        const { character } = get();
        const itemIndex = character.inventory.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
          console.log(`Item not found: ${itemId}`);
          return false;
        }
        
        const item = character.inventory[itemIndex];
        
        if (!item.usable) {
          console.log(`Item cannot be used: ${item.name}`);
          return false;
        }
        
        // Apply item effects (this would be expanded based on item types)
        console.log(`Using item: ${item.name}`);
        
        // Remove item from inventory if it's consumed
        const updatedInventory = [...character.inventory];
        
        if (item.quantity > 1) {
          updatedInventory[itemIndex] = {
            ...item,
            quantity: item.quantity - 1
          };
        } else {
          updatedInventory.splice(itemIndex, 1);
        }
        
        set(state => ({
          character: {
            ...state.character,
            inventory: updatedInventory
          }
        }));
        
        return true;
      },
      
      addAbility: (abilityTemplate) => {
        const ability: Ability = {
          ...abilityTemplate,
          id: `ability_${uuidv4()}`
        };
        
        set(state => ({
          character: {
            ...state.character,
            abilities: [...state.character.abilities, ability]
          }
        }));
        
        console.log(`Added new ability: ${ability.name}`);
      },
      
      useAbility: (abilityId) => {
        const { character } = get();
        const abilityIndex = character.abilities.findIndex(ability => ability.id === abilityId);
        
        if (abilityIndex === -1) {
          console.log(`Ability not found: ${abilityId}`);
          return false;
        }
        
        const ability = character.abilities[abilityIndex];
        
        // Check if ability is on cooldown
        if (ability.currentCooldown > 0) {
          console.log(`Ability on cooldown: ${ability.name}`);
          return false;
        }
        
        // Check if character has enough energy
        if (character.energy < ability.energyCost) {
          console.log(`Not enough energy for ability: ${ability.name}`);
          return false;
        }
        
        // Use energy
        const newEnergy = character.energy - ability.energyCost;
        
        // Set ability on cooldown
        const updatedAbilities = [...character.abilities];
        updatedAbilities[abilityIndex] = {
          ...ability,
          currentCooldown: ability.cooldown
        };
        
        set(state => ({
          character: {
            ...state.character,
            energy: newEnergy,
            abilities: updatedAbilities
          }
        }));
        
        console.log(`Used ability: ${ability.name}`);
        return true;
      },
      
      cooldownAbilities: () => {
        const { character } = get();
        
        const updatedAbilities = character.abilities.map(ability => ({
          ...ability,
          currentCooldown: Math.max(0, ability.currentCooldown - 1)
        }));
        
        set(state => ({
          character: {
            ...state.character,
            abilities: updatedAbilities
          }
        }));
      },
      
      // Function to select a character from a template
      selectCharacter: (template) => {
        console.log("Selecting character from template:", template);
        // Generate a new UUID for the character
        const characterId = uuidv4();
        
        // Create a complete character from the template, filling in any missing properties
        const fullCharacter: Character = {
          ...newCharacter, // Start with default values
          ...template,     // Override with template values
          id: characterId, // Always use a new ID
          // Ensure critical stats are properly set or use defaults
          health: template.health || newCharacter.health,
          maxHealth: template.maxHealth || newCharacter.maxHealth,
          energy: template.energy || newCharacter.energy,
          maxEnergy: template.maxEnergy || newCharacter.maxEnergy,
          level: template.level || 1,
          experience: template.experience || 0,
          // Merge or use default arrays
          skills: template.skills || newCharacter.skills,
          inventory: template.inventory || [],
          abilities: template.abilities || []
        };
        
        console.log("Character selected successfully:", fullCharacter);
        set({ character: fullCharacter });
      },
      
      resetCharacter: () => {
        set({ character: { ...newCharacter } });
        console.log('Character reset to default');
      }
    }),
    {
      name: 'character-storage',
      partialize: (state) => ({ character: state.character })
    }
  )
);

export default useCharacter;