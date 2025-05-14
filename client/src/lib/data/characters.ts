import { Character, CharacterClass, SkillType, Faction } from "../types";
import { v4 as uuidv4 } from "uuid";

export const characterTemplates: Character[] = [
  {
    id: uuidv4(),
    name: "Soldier",
    class: CharacterClass.Soldier,
    description: "Elite combat specialist trained in advanced weapons and tactics. Soldiers excel at combat encounters and defensive maneuvers.",
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
        level: 3,
        description: "Advanced combat strategies and field tactics",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Armor Proficiency",
        type: SkillType.Technical,
        level: 2,
        description: "Ability to effectively use and maintain combat armor",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Field Medicine",
        type: SkillType.Scientific,
        level: 1,
        description: "Basic emergency medical treatment in combat situations",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Navigation",
        type: SkillType.Navigation,
        level: 1,
        description: "Basic navigation skills in unknown territory",
        maxLevel: 5
      }
    ],
    health: 100,
    maxHealth: 100,
    energy: 70,
    maxEnergy: 70,
    shield: 20,
    maxShield: 20,
    level: 1,
    experience: 0,
    credits: 100,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Suppressive Fire",
        description: "Lay down covering fire that damages and slows enemies",
        energyCost: 25,
        damage: 20,
        cooldown: 3,
        currentCooldown: 0,
        areaEffect: true,
        requiredSkill: { type: SkillType.Combat, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Combat Stim",
        description: "Inject a combat stimulant that temporarily boosts health and damage",
        energyCost: 30,
        healing: 25,
        cooldown: 5,
        currentCooldown: 0
      }
    ],
    statusEffects: [],
    faction: Faction.Alliance,
    backstory: "A decorated veteran of the Alliance Marine Corps with experience in numerous frontier conflicts. Specializes in combat operations in hostile environments.",
    appearance: "Tall and muscular with military-short hair and several small scars. Usually seen in standard-issue combat armor with personalized modifications.",
    personality: "Disciplined and direct, with a strong sense of duty. Tends to approach problems with tactical thinking and values clear chains of command."
  },
  {
    id: uuidv4(),
    name: "Explorer",
    class: CharacterClass.Explorer,
    description: "Seasoned surveyor of uncharted worlds with survival expertise. Explorers excel at navigation, discovery, and adapting to unknown environments.",
    skills: [
      {
        id: uuidv4(),
        name: "Stellar Cartography",
        type: SkillType.Navigation,
        level: 3,
        description: "Expert mapping and navigation of uncharted space",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Planetary Survival",
        type: SkillType.Scientific,
        level: 2,
        description: "Ability to survive in diverse planetary environments",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Xeno-Archaeology",
        type: SkillType.Scientific,
        level: 2,
        description: "Knowledge of alien artifacts and ancient technologies",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Environmental Adaptation",
        type: SkillType.Technical,
        level: 2,
        description: "Skill in modifying equipment for harsh environments",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Evasion",
        type: SkillType.Combat,
        level: 1,
        description: "Ability to avoid threats and escape dangerous situations",
        maxLevel: 5
      }
    ],
    health: 85,
    maxHealth: 85,
    energy: 80,
    maxEnergy: 80,
    shield: 10,
    maxShield: 10,
    level: 1,
    experience: 0,
    credits: 120,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Adaptive Shield",
        description: "Modify your shield to resist environmental hazards",
        energyCost: 20,
        cooldown: 4,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Technical, level: 1 }
      },
      {
        id: uuidv4(),
        name: "Discovery Scan",
        description: "Advanced scan that can reveal hidden objects and pathways",
        energyCost: 15,
        cooldown: 3,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Navigation, level: 2 }
      }
    ],
    statusEffects: [],
    faction: Faction.Independent,
    backstory: "A former Alliance surveyor who now works independently, mapping uncharted regions and studying alien ruins for both scientific and financial gain.",
    appearance: "Weathered and lean with adaptive clothing suited for various environments. Carries multiple scanning devices and survival tools.",
    personality: "Curious and self-reliant, with a deep respect for alien cultures and environments. Values knowledge and new experiences above material wealth."
  },
  {
    id: uuidv4(),
    name: "Mercenary",
    class: CharacterClass.Mercenary,
    description: "Skilled contract fighter and bounty hunter for hire. Mercenaries excel at combat versatility and acquiring resources from various factions.",
    skills: [
      {
        id: uuidv4(),
        name: "Weapon Versatility",
        type: SkillType.Combat,
        level: 3,
        description: "Proficiency with a wide range of weapon types",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Black Market Connections",
        type: SkillType.Social,
        level: 2,
        description: "Access to illegal or restricted goods and information",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Bounty Hunting",
        type: SkillType.Navigation,
        level: 2,
        description: "Skills in tracking and capturing targets",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Field Engineering",
        type: SkillType.Technical,
        level: 1,
        description: "Ability to modify and repair equipment in the field",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Intimidation",
        type: SkillType.Social,
        level: 2,
        description: "Ability to frighten or coerce others",
        maxLevel: 5
      }
    ],
    health: 90,
    maxHealth: 90,
    energy: 75,
    maxEnergy: 75,
    shield: 15,
    maxShield: 15,
    level: 1,
    experience: 0,
    credits: 150,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Tactical Advantage",
        description: "Quick analysis of combat situation for increased damage",
        energyCost: 15,
        damage: 15,
        cooldown: 2,
        currentCooldown: 0
      },
      {
        id: uuidv4(),
        name: "Scavenge",
        description: "Recover useful items from the environment or defeated enemies",
        energyCost: 20,
        cooldown: 5,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Technical, level: 1 }
      }
    ],
    statusEffects: [],
    faction: Faction.Independent,
    backstory: "A freelance operative who has worked for various factions, from corporate security to frontier protection. Goes where the credits are good and the odds are acceptable.",
    appearance: "Rugged and battle-worn with customized armor bearing marks from various engagements. Often displays trophies from notable contracts.",
    personality: "Pragmatic and calculating, with a strong focus on self-preservation and profit. Maintains a professional demeanor but can be ruthless when necessary."
  },
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
