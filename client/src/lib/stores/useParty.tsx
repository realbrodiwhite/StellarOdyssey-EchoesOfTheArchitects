import { create } from 'zustand';
import { CharacterClass, Faction, Item, PartyMember, Skill, SkillType } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Sample skills to use for companions
const commonSkills: Skill[] = [
  {
    id: uuidv4(),
    name: "Survival",
    type: SkillType.Combat,
    level: 1,
    description: "Basic survival skills in hostile environments",
    maxLevel: 5
  },
  {
    id: uuidv4(),
    name: "First Aid",
    type: SkillType.Scientific,
    level: 1,
    description: "Basic medical treatment",
    maxLevel: 5
  },
  {
    id: uuidv4(),
    name: "Communication",
    type: SkillType.Social,
    level: 1,
    description: "Basic interpersonal communication skills",
    maxLevel: 5
  },
];

// Sample companions that could be recruited throughout the game
const sampleCompanions: PartyMember[] = [
  {
    id: uuidv4(),
    name: "Zara",
    class: CharacterClass.Soldier,
    specialization: "Combat",
    description: "A former Alliance special forces operative with exceptional combat skills.",
    faction: Faction.Alliance,
    health: 120,
    maxHealth: 120,
    energy: 80,
    maxEnergy: 80,
    level: 3,
    experience: 750,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Precision Strike",
        description: "A focused attack that deals high damage to a single target",
        energyCost: 15,
        damage: 35,
        cooldown: 2,
        currentCooldown: 0,
      },
      {
        id: uuidv4(),
        name: "Combat Stim",
        description: "Injects a combat stimulant that temporarily increases combat effectiveness",
        energyCost: 25,
        cooldown: 4,
        currentCooldown: 0,
      }
    ],
    skills: [
      {
        id: uuidv4(),
        name: "Weapons Mastery",
        type: SkillType.Combat,
        level: 3,
        description: "Advanced proficiency with all weapon types",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Tactical Operations",
        type: SkillType.Combat,
        level: 2,
        description: "Strategic combat planning and execution",
        maxLevel: 5
      },
      ...commonSkills
    ]
  },
  {
    id: uuidv4(),
    name: "Lexi",
    class: CharacterClass.Scientist,
    specialization: "Support",
    description: "A brilliant xenobiologist with expertise in alien physiology and medicine.",
    faction: Faction.Alliance,
    health: 85,
    maxHealth: 85,
    energy: 110,
    maxEnergy: 110,
    level: 3,
    experience: 720,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Emergency Treatment",
        description: "Provides immediate medical attention, healing injuries",
        energyCost: 20,
        healing: 40,
        cooldown: 3,
        currentCooldown: 0,
      },
      {
        id: uuidv4(),
        name: "Biological Analysis",
        description: "Analyzes enemy weaknesses, increasing team damage",
        energyCost: 15,
        cooldown: 3,
        currentCooldown: 0,
      }
    ],
    skills: [
      {
        id: uuidv4(),
        name: "Xenobiology",
        type: SkillType.Scientific,
        level: 3,
        description: "Extensive knowledge of alien biology and physiology",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Medical Expertise",
        type: SkillType.Scientific,
        level: 3,
        description: "Advanced medical skills and knowledge",
        maxLevel: 5
      },
      ...commonSkills
    ]
  },
  {
    id: uuidv4(),
    name: "Kato",
    class: CharacterClass.Engineer,
    specialization: "Technical",
    description: "A resourceful engineer capable of repairing and enhancing almost any technology.",
    faction: Faction.Independent,
    health: 90,
    maxHealth: 90,
    energy: 100,
    maxEnergy: 100,
    level: 3,
    experience: 700,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Tech Barrier",
        description: "Deploys a protective energy barrier that absorbs damage",
        energyCost: 25,
        cooldown: 4,
        currentCooldown: 0,
      },
      {
        id: uuidv4(),
        name: "Overload",
        description: "Overloads enemy systems or weapons, temporarily disabling them",
        energyCost: 20,
        damage: 15,
        cooldown: 2,
        currentCooldown: 0,
      }
    ],
    skills: [
      {
        id: uuidv4(),
        name: "Systems Engineering",
        type: SkillType.Technical,
        level: 3,
        description: "Advanced knowledge of mechanical and electronic systems",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Fabrication",
        type: SkillType.Technical,
        level: 2,
        description: "Ability to craft and modify equipment",
        maxLevel: 5
      },
      ...commonSkills
    ]
  },
  {
    id: uuidv4(),
    name: "Nova",
    class: CharacterClass.Pilot,
    specialization: "Navigation",
    description: "An ace pilot with exceptional navigational skills and quick reflexes.",
    faction: Faction.Syndicate,
    health: 95,
    maxHealth: 95,
    energy: 95,
    maxEnergy: 95,
    level: 3,
    experience: 710,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Evasive Maneuvers",
        description: "Performs complex evasive moves, increasing dodge chance",
        energyCost: 15,
        cooldown: 3,
        currentCooldown: 0,
      },
      {
        id: uuidv4(),
        name: "Precision Targeting",
        description: "Identifies and targets weak points for maximum damage",
        energyCost: 20,
        damage: 25,
        cooldown: 2,
        currentCooldown: 0,
      }
    ],
    skills: [
      {
        id: uuidv4(),
        name: "Advanced Piloting",
        type: SkillType.Navigation,
        level: 3,
        description: "Exceptional ability to navigate and pilot spacecraft",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Astrogation",
        type: SkillType.Navigation,
        level: 2,
        description: "Knowledge of celestial navigation and space travel",
        maxLevel: 5
      },
      ...commonSkills
    ]
  },
  {
    id: uuidv4(),
    name: "Saren",
    class: CharacterClass.Diplomat,
    specialization: "Social",
    description: "A charismatic negotiator skilled in diplomacy and manipulation.",
    faction: Faction.Settlers,
    health: 85,
    maxHealth: 85,
    energy: 105,
    maxEnergy: 105,
    level: 3,
    experience: 690,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Persuasive Speech",
        description: "Uses charisma to distract enemies, reducing their effectiveness",
        energyCost: 20,
        cooldown: 3,
        currentCooldown: 0,
      },
      {
        id: uuidv4(),
        name: "Morale Boost",
        description: "Inspires allies, increasing their damage output",
        energyCost: 25,
        cooldown: 4,
        currentCooldown: 0,
      }
    ],
    skills: [
      {
        id: uuidv4(),
        name: "Negotiation",
        type: SkillType.Social,
        level: 3,
        description: "Advanced diplomatic skills for resolving conflicts",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Cultural Knowledge",
        type: SkillType.Social,
        level: 2,
        description: "Understanding of various species' cultures and customs",
        maxLevel: 5
      },
      ...commonSkills
    ]
  }
];

export interface PartyState {
  // Party members actively in the player's squad
  activePartyMembers: PartyMember[];
  
  // Companions that have been recruited but are not active in the squad
  inactivePartyMembers: PartyMember[];
  
  // Potential companions that can be recruited
  availableCompanions: PartyMember[];
  
  // Max number of active party members allowed
  maxPartySize: number;
  
  // Recruit a companion by ID
  addToParty: (companionId: string) => void;
  
  // Remove a party member by ID
  removeFromParty: (partyMemberId: string) => void;
  
  // Set a party member as active (in the player's active squad)
  setActivePartyMember: (partyMemberId: string) => void;
  
  // Set a party member as inactive (benched)
  setInactivePartyMember: (partyMemberId: string) => void;
  
  // Give an item to a party member
  giveItemToPartyMember: (partyMemberId: string, item: Item) => void;
  
  // Take an item from a party member
  takeItemFromPartyMember: (partyMemberId: string, itemId: string) => void;
  
  // Apply damage to a party member
  damagePartyMember: (partyMemberId: string, damage: number) => void;
  
  // Heal a party member
  healPartyMember: (partyMemberId: string, amount: number) => void;
  
  // Update cooldowns for party members' abilities
  updateCooldowns: () => void;
}

export const useParty = create<PartyState>((set) => ({
  activePartyMembers: [],
  inactivePartyMembers: [],
  availableCompanions: sampleCompanions,
  maxPartySize: 4,
  
  addToParty: (companionId) => set((state) => {
    // Find the companion in the available list
    const companion = state.availableCompanions.find(c => c.id === companionId);
    if (!companion) return state;
    
    // If active party is full, add to inactive
    if (state.activePartyMembers.length >= state.maxPartySize) {
      return {
        availableCompanions: state.availableCompanions.filter(c => c.id !== companionId),
        inactivePartyMembers: [...state.inactivePartyMembers, companion]
      };
    }
    
    // Otherwise, add to active party
    return {
      availableCompanions: state.availableCompanions.filter(c => c.id !== companionId),
      activePartyMembers: [...state.activePartyMembers, companion]
    };
  }),
  
  removeFromParty: (partyMemberId) => set((state) => {
    // Check active party members
    const activeCompanion = state.activePartyMembers.find(c => c.id === partyMemberId);
    if (activeCompanion) {
      return {
        activePartyMembers: state.activePartyMembers.filter(c => c.id !== partyMemberId),
        availableCompanions: [...state.availableCompanions, activeCompanion]
      };
    }
    
    // Check inactive party members
    const inactiveCompanion = state.inactivePartyMembers.find(c => c.id === partyMemberId);
    if (inactiveCompanion) {
      return {
        inactivePartyMembers: state.inactivePartyMembers.filter(c => c.id !== partyMemberId),
        availableCompanions: [...state.availableCompanions, inactiveCompanion]
      };
    }
    
    return state;
  }),
  
  setActivePartyMember: (partyMemberId) => set((state) => {
    // If active party is full, return state
    if (state.activePartyMembers.length >= state.maxPartySize) return state;
    
    // Find the inactive party member
    const companion = state.inactivePartyMembers.find(c => c.id === partyMemberId);
    if (!companion) return state;
    
    return {
      inactivePartyMembers: state.inactivePartyMembers.filter(c => c.id !== partyMemberId),
      activePartyMembers: [...state.activePartyMembers, companion]
    };
  }),
  
  setInactivePartyMember: (partyMemberId) => set((state) => {
    // Find the active party member
    const companion = state.activePartyMembers.find(c => c.id === partyMemberId);
    if (!companion) return state;
    
    return {
      activePartyMembers: state.activePartyMembers.filter(c => c.id !== partyMemberId),
      inactivePartyMembers: [...state.inactivePartyMembers, companion]
    };
  }),
  
  giveItemToPartyMember: (partyMemberId, item) => set((state) => {
    // Check active party members
    const activeIndex = state.activePartyMembers.findIndex(c => c.id === partyMemberId);
    if (activeIndex >= 0) {
      const updatedMembers = [...state.activePartyMembers];
      updatedMembers[activeIndex] = {
        ...updatedMembers[activeIndex],
        inventory: [...updatedMembers[activeIndex].inventory, item]
      };
      return { activePartyMembers: updatedMembers };
    }
    
    // Check inactive party members
    const inactiveIndex = state.inactivePartyMembers.findIndex(c => c.id === partyMemberId);
    if (inactiveIndex >= 0) {
      const updatedMembers = [...state.inactivePartyMembers];
      updatedMembers[inactiveIndex] = {
        ...updatedMembers[inactiveIndex],
        inventory: [...updatedMembers[inactiveIndex].inventory, item]
      };
      return { inactivePartyMembers: updatedMembers };
    }
    
    return state;
  }),
  
  takeItemFromPartyMember: (partyMemberId, itemId) => set((state) => {
    // Check active party members
    const activeIndex = state.activePartyMembers.findIndex(c => c.id === partyMemberId);
    if (activeIndex >= 0) {
      const updatedMembers = [...state.activePartyMembers];
      updatedMembers[activeIndex] = {
        ...updatedMembers[activeIndex],
        inventory: updatedMembers[activeIndex].inventory.filter(i => i.id !== itemId)
      };
      return { activePartyMembers: updatedMembers };
    }
    
    // Check inactive party members
    const inactiveIndex = state.inactivePartyMembers.findIndex(c => c.id === partyMemberId);
    if (inactiveIndex >= 0) {
      const updatedMembers = [...state.inactivePartyMembers];
      updatedMembers[inactiveIndex] = {
        ...updatedMembers[inactiveIndex],
        inventory: updatedMembers[inactiveIndex].inventory.filter(i => i.id !== itemId)
      };
      return { inactivePartyMembers: updatedMembers };
    }
    
    return state;
  }),
  
  damagePartyMember: (partyMemberId, damage) => set((state) => {
    // Check active party members
    const activeIndex = state.activePartyMembers.findIndex(c => c.id === partyMemberId);
    if (activeIndex >= 0) {
      const updatedMembers = [...state.activePartyMembers];
      updatedMembers[activeIndex] = {
        ...updatedMembers[activeIndex],
        health: Math.max(0, updatedMembers[activeIndex].health - damage)
      };
      return { activePartyMembers: updatedMembers };
    }
    
    // Check inactive party members
    const inactiveIndex = state.inactivePartyMembers.findIndex(c => c.id === partyMemberId);
    if (inactiveIndex >= 0) {
      const updatedMembers = [...state.inactivePartyMembers];
      updatedMembers[inactiveIndex] = {
        ...updatedMembers[inactiveIndex],
        health: Math.max(0, updatedMembers[inactiveIndex].health - damage)
      };
      return { inactivePartyMembers: updatedMembers };
    }
    
    return state;
  }),
  
  healPartyMember: (partyMemberId, amount) => set((state) => {
    // Check active party members
    const activeIndex = state.activePartyMembers.findIndex(c => c.id === partyMemberId);
    if (activeIndex >= 0) {
      const updatedMembers = [...state.activePartyMembers];
      updatedMembers[activeIndex] = {
        ...updatedMembers[activeIndex],
        health: Math.min(
          updatedMembers[activeIndex].maxHealth,
          updatedMembers[activeIndex].health + amount
        )
      };
      return { activePartyMembers: updatedMembers };
    }
    
    // Check inactive party members
    const inactiveIndex = state.inactivePartyMembers.findIndex(c => c.id === partyMemberId);
    if (inactiveIndex >= 0) {
      const updatedMembers = [...state.inactivePartyMembers];
      updatedMembers[inactiveIndex] = {
        ...updatedMembers[inactiveIndex],
        health: Math.min(
          updatedMembers[inactiveIndex].maxHealth,
          updatedMembers[inactiveIndex].health + amount
        )
      };
      return { inactivePartyMembers: updatedMembers };
    }
    
    return state;
  }),
  
  updateCooldowns: () => set((state) => {
    // Update ability cooldowns for active party members
    const updatedActiveMembers = state.activePartyMembers.map(member => ({
      ...member,
      abilities: member.abilities.map(ability => ({
        ...ability,
        currentCooldown: Math.max(0, ability.currentCooldown - 1)
      }))
    }));
    
    return { activePartyMembers: updatedActiveMembers };
  })
}));