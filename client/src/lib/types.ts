// Game Enums
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  interact = 'interact',
  inventory = 'inventory',
  menu = 'menu',
  hint = 'hint'
}

export enum CharacterClass {
  // Original classes
  Engineer = 'Engineer',
  Scientist = 'Scientist',
  Diplomat = 'Diplomat',
  Pilot = 'Pilot',
  Soldier = 'Soldier',
  Mercenary = 'Mercenary',
  Explorer = 'Explorer',
  
  // New classes
  Hacker = 'Hacker',
  Medic = 'Medic',
  Trader = 'Trader',
  Captain = 'Captain',
  Smuggler = 'Smuggler',
  
  // Gender variants (not used in enum but for display)
  // We'll implement gender selection separately
}

export enum SkillType {
  Technical = 'Technical',
  Scientific = 'Scientific',
  Social = 'Social',
  Navigation = 'Navigation',
  Combat = 'Combat'
}

export enum ItemType {
  Weapon = 'Weapon',
  Tool = 'Tool',
  Consumable = 'Consumable',
  Key = 'Key',
  Upgrade = 'Upgrade'
}

export enum PuzzleType {
  Logic = 'Logic',
  Pattern = 'Pattern',
  Sequence = 'Sequence',
  Rewiring = 'Rewiring',
  Decryption = 'Decryption'
}

export enum LocationType {
  Ship = 'Ship',
  Planet = 'Planet',
  Space = 'Space',
  Station = 'Station',
  Derelict = 'Derelict',
  Settlement = 'Settlement',
  Ruins = 'Ruins',
  Anomaly = 'Anomaly'
}

// Game Interfaces
export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  description: string;
  skills: Skill[];
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  level: number;
  experience: number;
  inventory: Item[];
  abilities: Ability[];
  // New fields
  shield?: number;
  maxShield?: number;
  credits?: number;
  faction?: Faction;
  statusEffects?: string[];
  backstory?: string;
  appearance?: string;
  personality?: string;
}

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  level: number;
  description: string;
  maxLevel: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  effect?: string;
  value: number;
  usable: boolean;
  quantity: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  damage?: number;
  healing?: number;
  cooldown: number;
  currentCooldown: number;
  requiredSkill?: { type: SkillType, level: number };
  areaEffect?: boolean;
}

export interface Puzzle {
  id: string;
  name: string;
  type: PuzzleType;
  description: string;
  difficulty: number;
  hints: string[];
  solved: boolean;
  requiredSkill?: { type: SkillType, level: number };
  solution: any;
  reward?: Item;
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  abilities: Ability[];
  description: string;
  reward: { experience: number, items?: Item[] };
}

export enum Faction {
  Alliance = 'Alliance',
  Syndicate = 'Syndicate',
  Settlers = 'Settlers',
  Mystics = 'Mystics',
  Independent = 'Independent',
  VoidEntity = 'Void Entities'
}

export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  encounters: { 
    enemies?: string[]; 
    puzzles?: string[];
    npcs?: string[];
  };
  items?: string[]; // IDs of items that can be found
  connections: string[]; // IDs of connected locations
  region?: string;
  controlledBy?: Faction;
  dangerLevel?: number; // 1-10
  environmentEffects?: {
    type: 'radiation' | 'lowGravity' | 'highGravity' | 'extremeTemperature' | 'toxicAtmosphere' | 'voidEnergy';
    severity: number; // 1-5
    effect: string;
  }[];
  requiresItem?: string; // ID of item needed to safely visit
  unlockRequirement?: {
    quest?: string;
    reputation?: { faction: Faction, level: number };
    item?: string;
  };
  image?: string;
  ambientSound?: string;
  discovered?: boolean;
}

export interface PartyMember {
  id: string;
  name: string;
  class: CharacterClass | string;
  specialization?: string;
  description: string;
  skills: Skill[];
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  level: number;
  experience: number;
  inventory: Item[];
  abilities: Ability[];
  // Optional fields
  shield?: number;
  maxShield?: number;
  credits?: number;
  faction?: Faction;
  statusEffects?: string[];
  backstory?: string;
  appearance?: string;
  personality?: string;
}

export interface GameState {
  currentLocation: string;
  completedPuzzles: string[];
  defeatedEnemies: string[];
  visitedLocations: string[];
  discoveredLocations: string[];
  questProgress: Record<string, any>;
  storyFlags: Record<string, boolean>;
  worldState: Record<string, any>;
  currentGameTime: number; // In-game time in minutes
  gameStartTime: number; // Real-world timestamp when game started
  totalPlayTime: number; // In minutes
  decisions: {
    id: string;
    choice: string;
    timestamp: number;
    consequences: string[];
  }[];
}
