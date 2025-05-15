import { Character, CharacterClass, SkillType, Faction, Gender } from "../types";
import { v4 as uuidv4 } from "uuid";
import { generateCoreSkills } from "./skills";

// Helper function to clone a character with a different gender
const createGenderVariant = (character: Character, gender: Gender): Character => {
  return {
    ...character,
    id: uuidv4(), // Each gender variant gets a unique ID
    gender,
    // Adjust appearance description based on gender
    appearance: character.appearance?.replace(
      gender === Gender.Male ? /feminine|female/gi : /masculine|male/gi,
      gender === Gender.Male ? "masculine" : "feminine"
    )
  };
};

// Base character templates with shared skills and attributes
const characterBaseTemplates: Partial<Record<CharacterClass, Omit<Character, "gender" | "id">>> = {
  [CharacterClass.Soldier]: {
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
    backstory: "A decorated veteran with experience in numerous frontier conflicts. Specializes in combat operations in hostile environments.",
    appearance: "Strong build with military-short hair and several small scars. Usually seen in standard-issue combat armor with personalized modifications.",
    personality: "Disciplined and direct, with a strong sense of duty. Tends to approach problems with tactical thinking and values clear chains of command."
  },
  [CharacterClass.Engineer]: {
    name: "Engineer",
    class: CharacterClass.Engineer,
    description: "Technical specialist skilled in repairing and modifying equipment. Engineers excel at solving technical puzzles and improvising solutions.",
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
        name: "Fabrication",
        type: SkillType.Technical,
        level: 2,
        description: "Skill in creating and modifying equipment",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Weaponry",
        type: SkillType.Combat,
        level: 1,
        description: "Basic proficiency with weapons",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Navigation",
        type: SkillType.Navigation,
        level: 1,
        description: "Basic ability to navigate and pilot spacecraft",
        maxLevel: 5
      }
    ],
    health: 80,
    maxHealth: 80,
    energy: 90,
    maxEnergy: 90,
    shield: 15,
    maxShield: 15,
    level: 1,
    experience: 0,
    credits: 120,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Overcharge",
        description: "Temporarily boost a weapon's power output",
        energyCost: 20,
        damage: 15,
        cooldown: 3,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Technical, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Repair Drone",
        description: "Deploy a drone that repairs your equipment",
        energyCost: 25,
        healing: 20,
        cooldown: 4,
        currentCooldown: 0
      }
    ],
    statusEffects: [],
    faction: Faction.Alliance,
    backstory: "A technical genius with a knack for improvising solutions from limited materials. Known for unorthodox but effective methods.",
    appearance: "Usually seen wearing utility overalls with numerous pockets full of tools and gadgets. Has callused hands and often has grease stains somewhere.",
    personality: "Analytical and resourceful, with a strong pragmatic streak. Prefers practical solutions over theoretical perfection."
  },
  [CharacterClass.Scientist]: {
    name: "Scientist",
    class: CharacterClass.Scientist,
    description: "Research specialist with expertise in analyzing alien technologies and phenomena. Scientists excel at research-based puzzles and discoveries.",
    skills: [
      {
        id: uuidv4(),
        name: "Xenobiology",
        type: SkillType.Scientific,
        level: 3,
        description: "Knowledge of alien life forms and their biology",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Data Analysis",
        type: SkillType.Scientific,
        level: 3,
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
        name: "Technology Theory",
        type: SkillType.Technical,
        level: 2,
        description: "Understanding of technological principles",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Self-Defense",
        type: SkillType.Combat,
        level: 1,
        description: "Basic ability to defend oneself in dangerous situations",
        maxLevel: 5
      }
    ],
    health: 70,
    maxHealth: 70,
    energy: 100,
    maxEnergy: 100,
    shield: 10,
    maxShield: 10,
    level: 1,
    experience: 0,
    credits: 90,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Analyze",
        description: "Scan enemy for weaknesses, increasing damage dealt",
        energyCost: 15,
        damage: 5,
        cooldown: 2,
        currentCooldown: 0
      },
      {
        id: uuidv4(),
        name: "Nanobots",
        description: "Deploy healing nanobots that repair damage over time",
        energyCost: 30,
        healing: 25,
        cooldown: 4,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Scientific, level: 2 }
      }
    ],
    statusEffects: [],
    faction: Faction.Independent,
    backstory: "A brilliant researcher whose curiosity about alien technologies led to leaving prestigious academic positions to explore the frontier firsthand.",
    appearance: "Often wears practical field clothing adapted with various scientific instruments and sensors. Has a focused, observant demeanor.",
    personality: "Curious and methodical, with a love of discovery and learning. Values knowledge and tends to document everything thoroughly."
  },
  [CharacterClass.Diplomat]: {
    name: "Diplomat",
    class: CharacterClass.Diplomat,
    description: "Skilled negotiator with extensive knowledge of alien cultures and politics. Diplomats excel at social challenges and avoiding conflicts.",
    skills: [
      {
        id: uuidv4(),
        name: "Negotiation",
        type: SkillType.Social,
        level: 3,
        description: "Advanced skill in negotiating favorable outcomes",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Alien Cultures",
        type: SkillType.Social,
        level: 3,
        description: "Extensive knowledge of various alien societies and customs",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Persuasion",
        type: SkillType.Social,
        level: 2,
        description: "Ability to convince others to adopt your point of view",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Political Analysis",
        type: SkillType.Social,
        level: 2,
        description: "Understanding of political dynamics and power structures",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Evasion",
        type: SkillType.Combat,
        level: 1,
        description: "Ability to avoid attacks and dangerous situations",
        maxLevel: 5
      }
    ],
    health: 75,
    maxHealth: 75,
    energy: 90,
    maxEnergy: 90,
    shield: 10,
    maxShield: 10,
    level: 1,
    experience: 0,
    credits: 150,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Persuade",
        description: "Attempt to talk your way out of combat",
        energyCost: 25,
        cooldown: 5,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Social, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Distract",
        description: "Distract an enemy, reducing their accuracy",
        energyCost: 20,
        damage: 5,
        cooldown: 3,
        currentCooldown: 0
      }
    ],
    statusEffects: [],
    faction: Faction.Alliance,
    backstory: "A respected representative who has mediated numerous interspecies conflicts and helped establish peaceful relations between previously hostile factions.",
    appearance: "Impeccably dressed in formal attire appropriate to the situation, with subtle cultural adaptations to respect local customs. Carries few visible weapons.",
    personality: "Measured and patient, with a gift for reading people and situations. Prefers peaceful solutions but can be surprisingly decisive when necessary."
  },
  [CharacterClass.Pilot]: {
    name: "Pilot",
    class: CharacterClass.Pilot,
    description: "Expert spacecraft operator with exceptional reflexes and navigation skills. Pilots excel at flight-related challenges and quick maneuvers.",
    skills: [
      {
        id: uuidv4(),
        name: "Spacecraft Piloting",
        type: SkillType.Navigation,
        level: 3,
        description: "Advanced skill in piloting spacecraft in various conditions",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Astrogation",
        type: SkillType.Navigation,
        level: 3,
        description: "Detailed knowledge of space routes and navigation",
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
        name: "Ship Systems",
        type: SkillType.Technical,
        level: 2,
        description: "Knowledge of spacecraft systems and operations",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Communication",
        type: SkillType.Social,
        level: 1,
        description: "Effective communication in high-pressure situations",
        maxLevel: 5
      }
    ],
    health: 85,
    maxHealth: 85,
    energy: 85,
    maxEnergy: 85,
    shield: 15,
    maxShield: 15,
    level: 1,
    experience: 0,
    credits: 110,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Evasive Maneuvers",
        description: "Perform complex evasive patterns to avoid attacks",
        energyCost: 15,
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
        cooldown: 3,
        currentCooldown: 0
      }
    ],
    statusEffects: [],
    faction: Faction.Alliance,
    backstory: "A natural talent behind the controls of any spacecraft. Has flown everything from racing skiffs to military cruisers, and has a reputation for getting out of impossible situations.",
    appearance: "Often wears a customized flight suit with personal lucky charms or mementos. Has quick, precise movements and excellent spatial awareness.",
    personality: "Confident and decisive, with a thrill-seeking side. Tends to trust instincts over computers and believes almost any situation can be flown out of."
  },
  [CharacterClass.Mercenary]: {
    name: "Mercenary",
    class: CharacterClass.Mercenary,
    description: "Skilled contract fighter with practical experience in various combat scenarios. Mercenaries excel at adapting to challenges and getting results.",
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
        name: "Combat Tactics",
        type: SkillType.Combat,
        level: 2,
        description: "Knowledge of effective fighting strategies",
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
    backstory: "A freelance operative who has worked for various factions, taking jobs based on payment and personal code. Has seen enough double-crosses to be cautious but not paranoid.",
    appearance: "Wears practical, well-maintained gear with some personalized modifications. Often has visible weapons and a ready stance.",
    personality: "Pragmatic and straightforward, with a focus on getting the job done efficiently. Values reputation and reliability in both clients and partners."
  },
  [CharacterClass.Explorer]: {
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
    backstory: "A trailblazer who has mapped dozens of previously unknown star systems and made first contact with several species. Driven by an insatiable curiosity about what lies beyond the next horizon.",
    appearance: "Wears adaptable clothing suited for different environments, with various tools and scanning devices attached. Often has mementos from different worlds.",
    personality: "Inquisitive and self-reliant, with a strong sense of wonder. Values discovery and new experiences, and prefers uncharted territory to established routes."
  },
  [CharacterClass.Hacker]: {
    name: "Hacker",
    class: CharacterClass.Hacker,
    description: "Digital infiltration specialist who can bypass security systems and extract protected data. Hackers excel at solving electronic puzzles and accessing restricted areas.",
    skills: [
      {
        id: uuidv4(),
        name: "System Infiltration",
        type: SkillType.Technical,
        level: 3,
        description: "Advanced ability to breach security systems",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Data Mining",
        type: SkillType.Technical,
        level: 3,
        description: "Skill in extracting and analyzing protected information",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "AI Manipulation",
        type: SkillType.Technical,
        level: 2,
        description: "Ability to reprogram or control artificial intelligence",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Electronic Warfare",
        type: SkillType.Combat,
        level: 2,
        description: "Skill in disrupting enemy systems during combat",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Stealth",
        type: SkillType.Combat,
        level: 1,
        description: "Ability to avoid detection in hostile environments",
        maxLevel: 5
      }
    ],
    health: 75,
    maxHealth: 75,
    energy: 95,
    maxEnergy: 95,
    shield: 10,
    maxShield: 10,
    level: 1,
    experience: 0,
    credits: 130,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "System Shock",
        description: "Overload enemy systems causing temporary paralysis",
        energyCost: 25,
        damage: 15,
        cooldown: 3,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Technical, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Digital Ghost",
        description: "Become temporarily invisible to electronic detection",
        energyCost: 30,
        cooldown: 4,
        currentCooldown: 0
      }
    ],
    statusEffects: [],
    faction: Faction.Independent,
    backstory: "A digital savant who sees network architecture as poetry and security systems as puzzles. Has a reputation in certain circles for achieving the impossible, though the legality is often questionable.",
    appearance: "Often wears unassuming clothing with hidden tech augmentations. Usually has multiple devices and custom hardware tools within easy reach.",
    personality: "Quick-thinking and adaptable, with a tendency to see rules as suggestions. Values intellectual challenges and clever solutions over brute force approaches."
  },
  [CharacterClass.Medic]: {
    name: "Medic",
    class: CharacterClass.Medic,
    description: "Specialized healthcare provider with combat field experience. Medics excel at keeping the team alive and functional in dangerous situations.",
    skills: [
      {
        id: uuidv4(),
        name: "Emergency Medicine",
        type: SkillType.Scientific,
        level: 3,
        description: "Advanced ability to treat injuries in crisis situations",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Xenobiology",
        type: SkillType.Scientific,
        level: 2,
        description: "Knowledge of alien physiology and treatment adaptations",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Pharmacology",
        type: SkillType.Scientific,
        level: 2,
        description: "Expertise in medicines and chemical compounds",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Battlefield Awareness",
        type: SkillType.Combat,
        level: 1,
        description: "Ability to navigate combat zones safely",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Counseling",
        type: SkillType.Social,
        level: 2,
        description: "Skill in providing psychological support",
        maxLevel: 5
      }
    ],
    health: 80,
    maxHealth: 80,
    energy: 85,
    maxEnergy: 85,
    shield: 10,
    maxShield: 10,
    level: 1,
    experience: 0,
    credits: 110,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Rapid Treatment",
        description: "Quickly administer emergency medical care",
        energyCost: 20,
        healing: 30,
        cooldown: 3,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Scientific, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Stimulant Injection",
        description: "Administer performance-enhancing compounds",
        energyCost: 25,
        healing: 15,
        cooldown: 4,
        currentCooldown: 0
      }
    ],
    statusEffects: [],
    faction: Faction.Alliance,
    backstory: "A dedicated healthcare professional who chose to serve where most needed – on the dangerous frontier. Has saved countless lives in situations where conventional medical facilities weren't available.",
    appearance: "Typically wears practical clothing with emergency medical equipment always at hand. Often has specialized carrying cases for critical supplies.",
    personality: "Calm under pressure and deeply compassionate, but with the necessary detachment to make tough decisions. Prioritizes life above all else."
  },
  [CharacterClass.Trader]: {
    name: "Trader",
    class: CharacterClass.Trader,
    description: "Savvy merchant with connections throughout settled space. Traders excel at acquiring resources and navigating economic systems.",
    skills: [
      {
        id: uuidv4(),
        name: "Negotiation",
        type: SkillType.Social,
        level: 3,
        description: "Advanced ability to secure favorable deals",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Market Analysis",
        type: SkillType.Social,
        level: 3,
        description: "Expertise in identifying profitable opportunities",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Network Connections",
        type: SkillType.Social,
        level: 2,
        description: "Access to a wide range of contacts and information sources",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Navigation",
        type: SkillType.Navigation,
        level: 2,
        description: "Knowledge of trade routes and shortcuts",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Self-Defense",
        type: SkillType.Combat,
        level: 1,
        description: "Basic ability to protect oneself and assets",
        maxLevel: 5
      }
    ],
    health: 75,
    maxHealth: 75,
    energy: 80,
    maxEnergy: 80,
    shield: 10,
    maxShield: 10,
    level: 1,
    experience: 0,
    credits: 200,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Resource Acquisition",
        description: "Quickly source needed items even in remote locations",
        energyCost: 15,
        cooldown: 5,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Social, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Tactical Bribery",
        description: "Convince opponents to stand down or assist",
        energyCost: 25,
        cooldown: 4,
        currentCooldown: 0
      }
    ],
    statusEffects: [],
    faction: Faction.Independent,
    backstory: "A shrewd businessperson who has built a reputation for fair deals and reliable service across multiple star systems. Knows the value of information as much as physical goods.",
    appearance: "Often dresses to impress potential clients, with practical but quality clothing and accessories that hint at success without ostentation.",
    personality: "Observant and calculating, with excellent people-reading skills. Values profitable relationships and has a knack for finding win-win solutions."
  },
  [CharacterClass.Captain]: {
    name: "Captain",
    class: CharacterClass.Captain,
    description: "Natural leader with strategic thinking and command experience. Captains excel at coordinating teams and making critical decisions under pressure.",
    skills: [
      {
        id: uuidv4(),
        name: "Leadership",
        type: SkillType.Social,
        level: 3,
        description: "Exceptional ability to inspire and direct others",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Strategic Planning",
        type: SkillType.Social,
        level: 3,
        description: "Skill in developing effective plans and contingencies",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Ship Command",
        type: SkillType.Navigation,
        level: 2,
        description: "Knowledge of spacecraft operations and command protocols",
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
        name: "Political Acumen",
        type: SkillType.Social,
        level: 2,
        description: "Skill in navigating complex political situations",
        maxLevel: 5
      }
    ],
    health: 90,
    maxHealth: 90,
    energy: 85,
    maxEnergy: 85,
    shield: 15,
    maxShield: 15,
    level: 1,
    experience: 0,
    credits: 150,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Rally Team",
        description: "Inspire allies to perform at their best",
        energyCost: 25,
        cooldown: 4,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Social, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Tactical Order",
        description: "Direct a coordinated attack on enemies",
        energyCost: 20,
        damage: 15,
        cooldown: 3,
        currentCooldown: 0
      }
    ],
    statusEffects: [],
    faction: Faction.Alliance,
    backstory: "A respected commander who has led crews through countless dangerous situations. Known for making tough calls and taking responsibility for the consequences.",
    appearance: "Projects an authoritative presence with neat, practical attire that commands respect without being flashy. Carries themselves with confidence.",
    personality: "Decisive and responsible, with a calm demeanor in crisis situations. Values loyalty, competence, and clear communication from team members."
  },
  [CharacterClass.Smuggler]: {
    name: "Smuggler",
    class: CharacterClass.Smuggler,
    description: "Expert in transporting goods through restricted areas undetected. Smugglers excel at stealth, deception, and finding alternative solutions.",
    skills: [
      {
        id: uuidv4(),
        name: "Stealth Operations",
        type: SkillType.Combat,
        level: 3,
        description: "Advanced ability to remain undetected",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Spacecraft Modifications",
        type: SkillType.Technical,
        level: 2,
        description: "Skill in modifying ships for concealment and performance",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Evasive Piloting",
        type: SkillType.Navigation,
        level: 2,
        description: "Ability to outmaneuver pursuers and navigation hazards",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Underground Contacts",
        type: SkillType.Social,
        level: 3,
        description: "Connections with criminal networks and information brokers",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Quick Thinking",
        type: SkillType.Social,
        level: 2,
        description: "Ability to improvise solutions under pressure",
        maxLevel: 5
      }
    ],
    health: 80,
    maxHealth: 80,
    energy: 85,
    maxEnergy: 85,
    shield: 10,
    maxShield: 10,
    level: 1,
    experience: 0,
    credits: 180,
    inventory: [],
    abilities: [
      {
        id: uuidv4(),
        name: "Disappearing Act",
        description: "Temporarily become undetectable to enemies",
        energyCost: 30,
        cooldown: 5,
        currentCooldown: 0,
        requiredSkill: { type: SkillType.Combat, level: 2 }
      },
      {
        id: uuidv4(),
        name: "Surprise Attack",
        description: "Emerge from stealth with a powerful strike",
        energyCost: 25,
        damage: 25,
        cooldown: 4,
        currentCooldown: 0
      }
    ],
    statusEffects: [],
    faction: Faction.Independent,
    backstory: "A daring transporter who specializes in getting cargo – no questions asked – past even the tightest security. Knows all the best routes that don't appear on official charts.",
    appearance: "Typically dresses inconspicuously to blend into various environments, with clothing that has numerous hidden pockets and compartments.",
    personality: "Resourceful and quick-witted, with a healthy disrespect for authority. Values freedom and self-reliance above all else."
  }
};

// Create full character list with gender variants
export const expandedCharacterTemplates: Character[] = Object.entries(characterBaseTemplates).flatMap(([classKey, baseTemplate]) => {
  const fullTemplate = baseTemplate as Character; // Required fields will be added below
  
  // Create male variant
  const maleVariant: Character = {
    ...fullTemplate,
    id: uuidv4(),
    gender: Gender.Male
  };
  
  // Create female variant
  const femaleVariant: Character = {
    ...fullTemplate,
    id: uuidv4(),
    gender: Gender.Female
  };
  
  return [maleVariant, femaleVariant];
});

// Console logging
console.log(`Created ${expandedCharacterTemplates.length} character templates with gender variants`);