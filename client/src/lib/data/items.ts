import { Item, ItemType } from "../types";
import { v4 as uuidv4 } from "uuid";

export const gameItems: Item[] = [
  {
    id: uuidv4(),
    name: "Energy Pistol",
    type: ItemType.Weapon,
    description: "Standard issue energy pistol with decent damage output",
    effect: "Deals 10-15 damage to enemies",
    value: 50,
    usable: true,
    quantity: 1
  },
  {
    id: uuidv4(),
    name: "Plasma Rifle",
    type: ItemType.Weapon,
    description: "Advanced weapon that fires superheated plasma",
    effect: "Deals 20-25 damage to enemies",
    value: 100,
    usable: true,
    quantity: 1
  },
  {
    id: uuidv4(),
    name: "Repair Kit",
    type: ItemType.Tool,
    description: "Contains tools to repair damaged equipment",
    effect: "Restores 30 health",
    value: 30,
    usable: true,
    quantity: 1
  },
  {
    id: uuidv4(),
    name: "Energy Cell",
    type: ItemType.Consumable,
    description: "A small power cell that can restore energy",
    effect: "Restores 25 energy",
    value: 25,
    usable: true,
    quantity: 1
  },
  {
    id: uuidv4(),
    name: "Medical Nanobots",
    type: ItemType.Consumable,
    description: "Microscopic robots that repair cellular damage",
    effect: "Restores 40 health",
    value: 40,
    usable: true,
    quantity: 1
  },
  {
    id: uuidv4(),
    name: "Captain's Keycard",
    type: ItemType.Key,
    description: "Access card for the captain's quarters",
    value: 0,
    usable: false,
    quantity: 1
  },
  {
    id: uuidv4(),
    name: "Ancient Artifact",
    type: ItemType.Key,
    description: "A mysterious alien artifact of unknown purpose",
    value: 150,
    usable: false,
    quantity: 1
  },
  {
    id: uuidv4(),
    name: "Shield Enhancer",
    type: ItemType.Upgrade,
    description: "A module that increases personal shield capacity",
    effect: "Increases max health by 20",
    value: 75,
    usable: true,
    quantity: 1
  },
  {
    id: uuidv4(),
    name: "Neural Booster",
    type: ItemType.Upgrade,
    description: "Enhances neural pathways to improve energy efficiency",
    effect: "Increases max energy by 15",
    value: 65,
    usable: true,
    quantity: 1
  },
  {
    id: uuidv4(),
    name: "Hacking Device",
    type: ItemType.Tool,
    description: "Specialized tool for bypassing electronic security systems",
    effect: "Automatically solves certain technical puzzles",
    value: 50,
    usable: true,
    quantity: 1
  },
  {
    id: uuidv4(),
    name: "Universal Translator",
    type: ItemType.Tool,
    description: "Translates any known alien language",
    effect: "Provides additional dialogue options",
    value: 45,
    usable: true,
    quantity: 1
  },
  {
    id: uuidv4(),
    name: "Stasis Grenade",
    type: ItemType.Weapon,
    description: "Temporarily freezes enemies in place",
    effect: "Stuns enemies for 2 turns",
    value: 35,
    usable: true,
    quantity: 1
  }
];
