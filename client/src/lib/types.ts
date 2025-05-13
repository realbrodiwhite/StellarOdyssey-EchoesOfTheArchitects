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
  Engineer = 'Engineer',
  Scientist = 'Scientist',
  Diplomat = 'Diplomat',
  Pilot = 'Pilot'
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
  Derelict = 'Derelict'
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

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  encounters: { enemies?: Enemy[], puzzles?: Puzzle[] };
  items?: Item[];
  connections: string[]; // IDs of connected locations
}

export interface GameState {
  currentLocation: string;
  completedPuzzles: string[];
  defeatedEnemies: string[];
  questProgress: Record<string, any>;
  storyFlags: Record<string, boolean>;
}
