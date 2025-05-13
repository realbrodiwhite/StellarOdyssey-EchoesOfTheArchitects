import { Character, CharacterClass, SkillType } from "../types";
import { v4 as uuidv4 } from "uuid";

export const characterTemplates: Character[] = [
  {
    id: uuidv4(),
    name: "Engineer",
    class: CharacterClass.Engineer,
    description: "Specializes in solving technical problems and repairing equipment. Engineers excel at technical puzzles and crafting useful items.",
    skills: [
      {
        id: uuidv4(),
        name: "Systems Repair",
        type: SkillType.Technical,
        level: 3,
        description: "Ability to repair and restore damaged systems",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Circuit Design",
        type: SkillType.Technical,
        level: 2,
        description: "Knowledge of electrical circuits and design principles",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Weaponry",
        type: SkillType.Combat,
        level: 1,
        description: "Proficiency with combat weapons",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Navigation",
        type: SkillType.Navigation,
        level: 1,
        description: "Ability to navigate and pilot spacecraft",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Communication",
        type: SkillType.Social,
        level: 1,
        description: "Effectiveness in communicating with others",
        maxLevel: 5
      }
    ],
    health: 80,
    maxHealth: 80,
    energy: 70,
    maxEnergy: 70,
    level: 1,
    experience: 0,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Overcharge",
        description: "Temporarily boost a weapon's power output",
        energyCost: 20,
        damage: 15,
        healing: 0,
        cooldown: 3,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Technical, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Repair Drone",
        description: "Deploy a drone that repairs your equipment",
        energyCost: 25,
        damage: 0,
        healing: 20,
        cooldown: 4,
        currentCooldown: 0
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Scientist",
    class: CharacterClass.Scientist,
    description: "Experts in analyzing data and understanding alien technology. Scientists excel at decryption and research-based puzzles.",
    skills: [
      {
        id: uuidv4(),
        name: "Xenobiology",
        type: SkillType.Scientific,
        level: 3,
        description: "Knowledge of alien life forms",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Data Analysis",
        type: SkillType.Scientific,
        level: 2,
        description: "Ability to analyze complex data patterns",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Medical",
        type: SkillType.Scientific,
        level: 2,
        description: "Knowledge of medical procedures and treatments",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Navigation",
        type: SkillType.Navigation,
        level: 1,
        description: "Ability to navigate and pilot spacecraft",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Combat Tactics",
        type: SkillType.Combat,
        level: 1,
        description: "Understanding of effective combat strategies",
        maxLevel: 5
      }
    ],
    health: 70,
    maxHealth: 70,
    energy: 90,
    maxEnergy: 90,
    level: 1,
    experience: 0,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Analyze",
        description: "Scan enemy for weaknesses, increasing damage dealt",
        energyCost: 15,
        damage: 5,
        healing: 0,
        cooldown: 2,
        currentCooldown: 0
      },
      {
        id: uuidv4(),
        name: "Nanobots",
        description: "Deploy nanobots that heal over time",
        energyCost: 30,
        damage: 0,
        healing: 25,
        cooldown: 4,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Scientific, level: 2 }
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Diplomat",
    class: CharacterClass.Diplomat,
    description: "Skilled in communication and negotiation. Diplomats excel at social puzzles and can often avoid combat through negotiation.",
    skills: [
      {
        id: uuidv4(),
        name: "Negotiation",
        type: SkillType.Social,
        level: 3,
        description: "Skill in negotiating favorable outcomes",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Alien Cultures",
        type: SkillType.Social,
        level: 2,
        description: "Knowledge of various alien societies and customs",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Deception",
        type: SkillType.Social,
        level: 2,
        description: "Ability to mislead or deceive when necessary",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Technical Analysis",
        type: SkillType.Technical,
        level: 1,
        description: "Basic understanding of technical systems",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Evasion",
        type: SkillType.Combat,
        level: 1,
        description: "Ability to avoid attacks",
        maxLevel: 5
      }
    ],
    health: 75,
    maxHealth: 75,
    energy: 80,
    maxEnergy: 80,
    level: 1,
    experience: 0,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Persuade",
        description: "Attempt to talk your way out of combat",
        energyCost: 25,
        damage: 0,
        healing: 0,
        cooldown: 5,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Social, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Distract",
        description: "Distract an enemy, reducing their accuracy",
        energyCost: 20,
        damage: 10,
        healing: 0,
        cooldown: 3,
        currentCooldown: 0
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Pilot",
    class: CharacterClass.Pilot,
    description: "Experts in navigation and spacecraft operation. Pilots excel at navigation puzzles and combat maneuvers.",
    skills: [
      {
        id: uuidv4(),
        name: "Spacecraft Piloting",
        type: SkillType.Navigation,
        level: 3,
        description: "Advanced skill in piloting spacecraft",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Astrogation",
        type: SkillType.Navigation,
        level: 2,
        description: "Knowledge of space routes and navigation",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Combat Tactics",
        type: SkillType.Combat,
        level: 2,
        description: "Understanding of effective combat strategies",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Quick Reflexes",
        type: SkillType.Combat,
        level: 2,
        description: "Enhanced reaction time in combat situations",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Communication",
        type: SkillType.Social,
        level: 1,
        description: "Effectiveness in communicating with others",
        maxLevel: 5
      }
    ],
    health: 85,
    maxHealth: 85,
    energy: 75,
    maxEnergy: 75,
    level: 1,
    experience: 0,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Evasive Maneuvers",
        description: "Dodge incoming attacks",
        energyCost: 15,
        damage: 0,
        healing: 0,
        cooldown: 2,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Navigation, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Precision Strike",
        description: "Target a weak point for increased damage",
        energyCost: 25,
        damage: 20,
        healing: 0,
        cooldown: 3,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Combat, level: 1 }
      }
    ]
  }
];
