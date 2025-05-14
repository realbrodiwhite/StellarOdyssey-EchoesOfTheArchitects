import { SkillType, Skill } from "../types";
import { v4 as uuidv4 } from "uuid";

// Core skills that all character classes share regardless of specialization
export const generateCoreSkills = (): Skill[] => [
  {
    id: uuidv4(),
    name: "Survival",
    type: SkillType.Scientific,
    level: 1,
    description: "Basic ability to survive in various environments",
    maxLevel: 5
  },
  {
    id: uuidv4(),
    name: "Basic Combat",
    type: SkillType.Combat,
    level: 1,
    description: "Fundamental combat techniques for self-defense",
    maxLevel: 5
  },
  {
    id: uuidv4(),
    name: "Spaceship Operations",
    type: SkillType.Navigation,
    level: 1,
    description: "Basic knowledge of spacecraft systems and operations",
    maxLevel: 5
  },
  {
    id: uuidv4(),
    name: "Equipment Maintenance",
    type: SkillType.Technical,
    level: 1,
    description: "Ability to perform basic maintenance on equipment",
    maxLevel: 5
  },
  {
    id: uuidv4(),
    name: "Communication",
    type: SkillType.Social,
    level: 1,
    description: "Effective interaction with others across different contexts",
    maxLevel: 5
  }
];