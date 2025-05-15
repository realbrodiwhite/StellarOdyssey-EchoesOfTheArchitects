import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useCharacter } from './useCharacter';
import { CharacterClass, SkillType, Ability, Item } from '../types';

// Interface for party member companions (similar to Character type but with additional properties)
export interface PartyMember {
  id: string;
  name: string;
  class: CharacterClass;
  description: string;
  portrait: string; // Path to character portrait image
  model: string;    // Path to 3D model if applicable
  skills: {
    id: string;
    name: string;
    type: SkillType;
    level: number;
    description: string;
    maxLevel: number;
  }[];
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  level: number;
  experience: number;
  inventory: Item[];
  abilities: Ability[];
  shield?: number;
  maxShield?: number;
  loyalty: number;         // How loyal they are to the player (affects performance and potential betrayal)
  specialization: string;  // Their unique role in the party (e.g., "Healer", "Tank", "DPS", "Support")
  backstory: string;
  joinedLocation: string;  // Where they joined the party
  cost?: number;           // Cost to recruit if purchased rather than earned through gameplay
  active: boolean;         // Whether they are currently in the active party
  relationship: number;    // Relationship level with main character (1-100)
  questline?: string;      // Special questline related to this character
  uniquePerks: string[];   // Special abilities only this character has
}

interface PartyStore {
  // Party management
  partyMembers: PartyMember[];
  activePartyMembers: PartyMember[];
  maxPartySize: number;
  
  // Available companions that can be recruited
  availableCompanions: PartyMember[];
  
  // Functions to manage party
  addPartyMember: (member: PartyMember) => void;
  removePartyMember: (id: string) => void;
  activatePartyMember: (id: string) => void;
  deactivatePartyMember: (id: string) => void;
  updatePartyMember: (id: string, updates: Partial<PartyMember>) => void;
  
  // Relationship management
  increaseRelationship: (id: string, amount: number) => void;
  decreaseRelationship: (id: string, amount: number) => void;
  
  // Companion discovery
  discoverCompanion: (companion: PartyMember) => void;
  purchaseCompanion: (id: string) => boolean;
  
  // Helper functions
  isPartyFull: () => boolean;
  getActivePartyMembers: () => PartyMember[];
  getPartyMember: (id: string) => PartyMember | undefined;
  
  // Party combat stats
  getPartyTotalDamage: () => number;
  getPartyTotalHealth: () => number;
  getPartyTotalShield: () => number;
  
  // Reset party (for new game)
  resetParty: () => void;
}

export const useParty = create<PartyStore>()(
  persist(
    (set, get) => ({
      partyMembers: [],
      activePartyMembers: [],
      maxPartySize: 3, // Player + 2 companions (KotOR style)
      availableCompanions: [],
      
      addPartyMember: (member) => {
        const { partyMembers } = get();
        
        // Check if member already exists
        if (partyMembers.find(m => m.id === member.id)) {
          return;
        }
        
        set({
          partyMembers: [...partyMembers, member],
        });
        
        // If party is not full, automatically activate the new member
        if (!get().isPartyFull()) {
          get().activatePartyMember(member.id);
        }
      },
      
      removePartyMember: (id) => {
        const { partyMembers, activePartyMembers } = get();
        
        set({
          partyMembers: partyMembers.filter(member => member.id !== id),
          activePartyMembers: activePartyMembers.filter(member => member.id !== id),
        });
      },
      
      activatePartyMember: (id) => {
        const { partyMembers, activePartyMembers, maxPartySize } = get();
        const memberToActivate = partyMembers.find(member => member.id === id);
        
        if (!memberToActivate) {
          console.warn(`Party member with ID ${id} not found`);
          return;
        }
        
        // If party is full, we can't add more members
        if (activePartyMembers.length >= maxPartySize) {
          console.warn('Party is already full. Deactivate a member first.');
          return;
        }
        
        // Add member to active party and update their status
        set({
          activePartyMembers: [...activePartyMembers, memberToActivate],
          partyMembers: partyMembers.map(member => 
            member.id === id ? { ...member, active: true } : member
          ),
        });
      },
      
      deactivatePartyMember: (id) => {
        const { partyMembers, activePartyMembers } = get();
        
        set({
          activePartyMembers: activePartyMembers.filter(member => member.id !== id),
          partyMembers: partyMembers.map(member => 
            member.id === id ? { ...member, active: false } : member
          ),
        });
      },
      
      updatePartyMember: (id, updates) => {
        const { partyMembers, activePartyMembers } = get();
        
        const updatedPartyMembers = partyMembers.map(member => 
          member.id === id ? { ...member, ...updates } : member
        );
        
        const updatedActivePartyMembers = activePartyMembers.map(member => 
          member.id === id ? { ...member, ...updates } : member
        );
        
        set({
          partyMembers: updatedPartyMembers,
          activePartyMembers: updatedActivePartyMembers,
        });
      },
      
      increaseRelationship: (id, amount) => {
        const { partyMembers } = get();
        const member = partyMembers.find(m => m.id === id);
        
        if (!member) return;
        
        // Calculate new relationship value (cap at 100)
        const newRelationship = Math.min(100, member.relationship + amount);
        
        get().updatePartyMember(id, { relationship: newRelationship });
        
        // If relationship crosses certain thresholds, could trigger events
        if (member.relationship < 50 && newRelationship >= 50) {
          console.log(`${member.name} now trusts you more`);
          // Could trigger new dialogue or abilities
        }
        if (member.relationship < 75 && newRelationship >= 75) {
          console.log(`${member.name} is now loyal to you`);
          // Could unlock special quests
        }
        if (member.relationship < 100 && newRelationship >= 100) {
          console.log(`${member.name} is now completely devoted to your cause`);
          // Could unlock romance options or powerful abilities
        }
      },
      
      decreaseRelationship: (id, amount) => {
        const { partyMembers } = get();
        const member = partyMembers.find(m => m.id === id);
        
        if (!member) return;
        
        // Calculate new relationship value (min at 0)
        const newRelationship = Math.max(0, member.relationship - amount);
        
        get().updatePartyMember(id, { relationship: newRelationship });
        
        // If relationship drops below certain thresholds, could trigger negative events
        if (member.relationship >= 50 && newRelationship < 50) {
          console.log(`${member.name} is losing trust in you`);
          // Could trigger arguments or decreased effectiveness
        }
        if (member.relationship >= 25 && newRelationship < 25) {
          console.log(`${member.name} is considering leaving your party`);
          // Could trigger a loyalty mission
        }
        if (member.relationship >= 10 && newRelationship < 10) {
          console.log(`${member.name} might betray you if you don't improve your relationship`);
          // High risk of betrayal or leaving
        }
      },
      
      discoverCompanion: (companion) => {
        const { availableCompanions } = get();
        
        // Check if companion is already discovered
        if (availableCompanions.find(c => c.id === companion.id)) {
          return;
        }
        
        set({
          availableCompanions: [...availableCompanions, companion],
        });
      },
      
      purchaseCompanion: (id) => {
        const { availableCompanions } = get();
        const companion = availableCompanions.find(c => c.id === id);
        
        if (!companion || !companion.cost) {
          return false;
        }
        
        // Check if player has enough credits
        const playerCharacter = useCharacter.getState().selectedCharacter;
        if (!playerCharacter || !playerCharacter.credits || playerCharacter.credits < companion.cost) {
          console.warn('Not enough credits to purchase this companion');
          return false;
        }
        
        // Deduct credits and add companion to party
        useCharacter.getState().updateCharacter({
          credits: playerCharacter.credits - companion.cost
        });
        
        get().addPartyMember({
          ...companion,
          cost: undefined, // Remove cost after purchase
        });
        
        // Remove from available companions
        set({
          availableCompanions: availableCompanions.filter(c => c.id !== id),
        });
        
        return true;
      },
      
      isPartyFull: () => {
        return get().activePartyMembers.length >= get().maxPartySize;
      },
      
      getActivePartyMembers: () => {
        return get().activePartyMembers;
      },
      
      getPartyMember: (id) => {
        return get().partyMembers.find(member => member.id === id);
      },
      
      getPartyTotalDamage: () => {
        const { activePartyMembers } = get();
        let totalDamage = 0;
        
        // Simple calculation - can be made more complex
        activePartyMembers.forEach(member => {
          // Calculate base damage from all damage-dealing abilities
          const abilitiesDamage = member.abilities
            .filter(ability => ability.damage !== undefined)
            .reduce((sum, ability) => sum + (ability.damage || 0), 0);
          
          // Add character level as a multiplier
          totalDamage += abilitiesDamage * (1 + member.level * 0.1);
        });
        
        return totalDamage;
      },
      
      getPartyTotalHealth: () => {
        return get().activePartyMembers.reduce((sum, member) => sum + member.health, 0);
      },
      
      getPartyTotalShield: () => {
        return get().activePartyMembers.reduce((sum, member) => sum + (member.shield || 0), 0);
      },
      
      resetParty: () => {
        set({
          partyMembers: [],
          activePartyMembers: [],
          availableCompanions: [], // Can be initialized with starter companions if needed
        });
      },
    }),
    {
      name: 'party-storage', // name of the localStorage key
    }
  )
);

// Export party constants and initializers
export const STARTER_COMPANIONS = [
  // Example companion that can be immediately available
  {
    id: uuidv4(),
    name: "Zara",
    class: CharacterClass.Engineer,
    description: "A talented engineer with a knack for fixing anything mechanical. She escaped from a Syndicate factory and has a deep-seated hatred for exploitation.",
    portrait: "/images/companions/zara-portrait.png", // This would need to be created
    model: "/models/companions/zara.glb", // This would need to be created
    skills: [
      {
        id: uuidv4(),
        name: "Technical Repairs",
        type: SkillType.Technical,
        level: 3,
        description: "Advanced ability to repair and upgrade equipment",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Drone Deployment",
        type: SkillType.Technical, 
        level: 2,
        description: "Can deploy repair and combat drones",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Hacking",
        type: SkillType.Technical,
        level: 2,
        description: "Can hack electronic systems",
        maxLevel: 5
      }
    ],
    health: 85,
    maxHealth: 85,
    energy: 120,
    maxEnergy: 120,
    level: 3,
    experience: 0,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Repair Pulse",
        description: "Sends out a pulse that repairs the shields of all party members",
        energyCost: 25,
        healing: 15,
        cooldown: 3,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Technical, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Overload",
        description: "Overloads enemy systems, causing damage",
        energyCost: 30,
        damage: 20,
        cooldown: 2,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Technical, level: 2 }
      }
    ],
    shield: 50,
    maxShield: 50,
    loyalty: 70,
    specialization: "Support",
    backstory: "Once a child prodigy in the Syndicate engineering corps, Zara escaped after discovering her inventions were being used for oppression. She now uses her skills to fight against her former employers and help those in need.",
    joinedLocation: "Starting Space Station",
    relationship: 50,
    active: false,
    uniquePerks: ["Shield Specialist", "Mechanical Insight"]
  }
];

// Function to initialize starter companions (can be called at game start)
export const initializeStarterCompanions = () => {
  const partyStore = useParty.getState();
  
  STARTER_COMPANIONS.forEach(companion => {
    partyStore.discoverCompanion(companion);
  });
};

// Example purchasable companions (could be loaded from a database or API)
export const PURCHASABLE_COMPANIONS = [
  {
    id: uuidv4(),
    name: "Dorn",
    class: CharacterClass.Soldier,
    description: "A stoic former Alliance special forces soldier who left after a mission went wrong. He's a weapons expert and tactical genius.",
    portrait: "/images/companions/dorn-portrait.png",
    model: "/models/companions/dorn.glb",
    skills: [
      {
        id: uuidv4(),
        name: "Heavy Weapons",
        type: SkillType.Combat,
        level: 4,
        description: "Expert with large-scale weaponry",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Tactical Positioning",
        type: SkillType.Combat,
        level: 3,
        description: "Expert at battlefield positioning and tactics",
        maxLevel: 5
      }
    ],
    health: 150,
    maxHealth: 150,
    energy: 85,
    maxEnergy: 85,
    level: 4,
    experience: 0,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Suppressive Fire",
        description: "Fires at all enemies, reducing their damage output",
        energyCost: 35,
        damage: 15,
        cooldown: 4,
        currentCooldown: 0,
        areaEffect: true
      },
      {
        id: uuidv4(),
        name: "Precision Shot",
        description: "A carefully aimed shot at a vital point",
        energyCost: 20,
        damage: 40,
        cooldown: 2,
        currentCooldown: 0
      }
    ],
    shield: 75,
    maxShield: 75,
    loyalty: 50,
    specialization: "Tank/DPS",
    backstory: "Dorn served in the Alliance military for fifteen years before a covert operation led to civilian casualties. Unable to reconcile with his commanders' coverup, he went AWOL and now works as a mercenary.",
    joinedLocation: "Mercenary Guild",
    cost: 5000, // Credits cost to hire
    relationship: 25,
    active: false,
    uniquePerks: ["Battlefield Commander", "Crisis Management"]
  }
];

// Function to make purchasable companions available
export const loadPurchasableCompanions = (locationId: string) => {
  const partyStore = useParty.getState();
  
  // In a real game, this would filter companions based on current location
  PURCHASABLE_COMPANIONS.forEach(companion => {
    partyStore.discoverCompanion(companion);
  });
};