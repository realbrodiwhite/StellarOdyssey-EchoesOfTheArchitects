import { CharacterClass, Faction, Gender, Skill, SkillType } from "../types";
import { CompanionPersonality, RelationshipLevel } from "../stores/useCompanion";
import { v4 as uuidv4 } from "uuid";

// Define the interface for a crew member
export interface CrewMember {
  id: string;
  name: string;
  role: string; // Job/position on the ship
  class: CharacterClass; // Their specialized class
  description: string;
  backstory: string;
  appearance: string;
  personality: CompanionPersonality;
  relationship: RelationshipLevel;
  gender: Gender;
  skills: Skill[];
  faction: Faction;
  specialAbilities: string[];
  avatarImage?: string;
  personalQuest?: {
    id: string;
    name: string;
    description: string;
    unlockRequirement: {
      relationshipLevel: RelationshipLevel;
      progressPoint?: number;
    };
  };
  preferences: {
    likes: string[];
    dislikes: string[];
    specialInterests: string[];
  };
  secretObjective?: string; // Hidden motivation that may be revealed later
}

// Create crew member templates with unique IDs
export const createCrewMember = (
  name: string,
  role: string,
  characterClass: CharacterClass,
  description: string,
  backstory: string,
  appearance: string,
  personality: CompanionPersonality,
  gender: Gender,
  faction: Faction,
  skills: Skill[],
  specialAbilities: string[],
  preferences: { likes: string[], dislikes: string[], specialInterests: string[] },
  personalQuest?: { name: string, description: string, relationshipLevel: RelationshipLevel, progressPoint?: number },
  secretObjective?: string,
  avatarImage?: string
): CrewMember => {
  return {
    id: uuidv4(),
    name,
    role,
    class: characterClass,
    description,
    backstory,
    appearance,
    personality,
    relationship: RelationshipLevel.Neutral, // All crew members start at neutral
    gender,
    skills,
    faction,
    specialAbilities,
    preferences,
    personalQuest: personalQuest ? {
      id: uuidv4(),
      name: personalQuest.name,
      description: personalQuest.description,
      unlockRequirement: {
        relationshipLevel: personalQuest.relationshipLevel,
        progressPoint: personalQuest.progressPoint
      }
    } : undefined,
    secretObjective,
    avatarImage
  };
};

// Define crew members
export const crewMembers: CrewMember[] = [
  createCrewMember(
    "Alexis Chen", 
    "Chief Engineer",
    CharacterClass.Engineer,
    "A brilliant engineer with unorthodox methods and an uncanny ability to bring dying systems back to life.",
    "Born on a mining colony in the Antares sector, Alexis learned to fix equipment out of necessity when resources were scarce. After earning top marks at the Alliance Technical Institute, she served on various starships before joining this mission for the challenge it presented.",
    "Mid-thirties with short black hair often tucked under a utility cap. Always has multiple tools hanging from a custom belt and typically has some grease smudge somewhere visible.",
    CompanionPersonality.Logical,
    Gender.Female,
    Faction.Alliance,
    [
      {
        id: uuidv4(),
        name: "Systems Integration",
        type: SkillType.Technical,
        level: 5,
        description: "Expert ability to make diverse systems work together seamlessly",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Power Management",
        type: SkillType.Technical,
        level: 4,
        description: "Advanced knowledge of energy flow and conservation",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Improvised Repairs",
        type: SkillType.Technical,
        level: 4,
        description: "Creating effective solutions with limited resources",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Technical Analysis",
        type: SkillType.Scientific,
        level: 3,
        description: "Ability to analyze and understand complex technical data",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Combat Support",
        type: SkillType.Combat,
        level: 2,
        description: "Creating and deploying technical solutions during combat",
        maxLevel: 5
      }
    ],
    [
      "System Overcharge - Can temporarily boost any ship system beyond normal parameters at the risk of damage",
      "Jury Rig - Can create a temporary functional device from available components",
      "Efficiency Expert - Can optimize any system to work with less power"
    ],
    {
      likes: ["Problem solving", "Efficiency", "Ancient technology", "Strong coffee"],
      dislikes: ["Bureaucracy", "Wasted resources", "Taking unnecessary risks with equipment"],
      specialInterests: ["Artifacts of the Architects", "Propulsion theory", "Vintage engineering manuals"]
    },
    {
      name: "Legacy Code",
      description: "Help Alexis recover her grandfather's lost engineering schematics from a derelict station in the Antares sector.",
      relationshipLevel: RelationshipLevel.Friendly,
      progressPoint: 3
    },
    "Believes certain Architect technology should remain classified rather than be made public by the Alliance."
  ),
  
  createCrewMember(
    "Dr. Marcus Vega", 
    "Science Officer",
    CharacterClass.Scientist,
    "A dedicated xenobiologist with a passion for discovering new life forms and understanding alien ecosystems.",
    "Marcus grew up on Earth in the Academic District of New Sydney. His parents were both renowned scientists, creating high expectations he's spent his life trying to fulfill. He joined this expedition specifically to study potential alien artifacts and their biological implications.",
    "Early forties with salt-and-pepper hair, neatly trimmed beard, and rectangular glasses he wears despite corrective surgery because he thinks they make him look more intellectual.",
    CompanionPersonality.Scientific,
    Gender.Male,
    Faction.Alliance,
    [
      {
        id: uuidv4(),
        name: "Xenobiology",
        type: SkillType.Scientific,
        level: 5,
        description: "Expert understanding of alien life forms and biology",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Artifact Analysis",
        type: SkillType.Scientific,
        level: 4,
        description: "Ability to determine function and origin of unknown objects",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Medical Knowledge",
        type: SkillType.Scientific,
        level: 3,
        description: "Understanding of human and alien physiology and treatment",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Technical Analysis",
        type: SkillType.Technical,
        level: 3,
        description: "Ability to analyze and understand complex technical data",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Diplomatic Protocol",
        type: SkillType.Social,
        level: 2,
        description: "Knowledge of proper cultural and diplomatic procedures",
        maxLevel: 5
      }
    ],
    [
      "Biological Insight - Can identify biological hazards and advantages in any environment",
      "Experimental Treatment - Can develop emergency medical solutions in critical situations",
      "Research Breakthrough - Can occasionally make a significant scientific discovery with available resources"
    ],
    {
      likes: ["Academic discussions", "Detailed observations", "Alien artifacts", "Classical music"],
      dislikes: ["Rushed conclusions", "Superstition", "Damaging potential specimens", "Loud environments"],
      specialInterests: ["The Architects' evolutionary history", "Interspecies biological compatibility", "Advanced xenogenetics"]
    },
    {
      name: "Academic Vindication",
      description: "Help Dr. Vega prove his controversial theory about the Architects' biological nature by finding specific evidence.",
      relationshipLevel: RelationshipLevel.Cooperative,
      progressPoint: 2
    },
    "Secretly hopes to make a discovery significant enough to overshadow his parents' achievements and establish his own legacy."
  ),
  
  createCrewMember(
    "Commander Lena Torres", 
    "Security Chief",
    CharacterClass.Soldier,
    "A decorated former Alliance special forces officer with unmatched tactical skills and a strict code of honor.",
    "Lena comes from a long line of military service in the Martian colonies. She distinguished herself during the Proxima Centauri conflict and was specifically requested for this mission due to her experience with unknown threat assessment and containment.",
    "Late thirties with short, military-style dark hair often pulled back into a tight ponytail. Athletic build with noticeable scars on her right forearm. Always maintains perfect posture.",
    CompanionPersonality.Militant,
    Gender.Female,
    Faction.Alliance,
    [
      {
        id: uuidv4(),
        name: "Tactical Command",
        type: SkillType.Combat,
        level: 5,
        description: "Expert ability to assess and direct combat situations",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Weapons Proficiency",
        type: SkillType.Combat,
        level: 4,
        description: "Mastery of various weapon systems and combat techniques",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Security Protocols",
        type: SkillType.Technical,
        level: 3,
        description: "Knowledge of advanced security systems and procedures",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Threat Assessment",
        type: SkillType.Scientific,
        level: 3,
        description: "Ability to analyze and prioritize potential dangers",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Team Leadership",
        type: SkillType.Social,
        level: 3,
        description: "Ability to motivate and direct a team effectively",
        maxLevel: 5
      }
    ],
    [
      "Tactical Advantage - Can identify and exploit weaknesses in enemy positions or defenses",
      "Rally - Can boost team performance in combat situations",
      "Last Stand - Performs better when the situation is most dire"
    ],
    {
      likes: ["Clear objectives", "Discipline", "Direct approaches", "Physical training"],
      dislikes: ["Unnecessary risks", "Civilian interference in operations", "Poor chain of command", "Improvised plans"],
      specialInterests: ["Military history", "Advanced weapon systems", "Martial arts", "Containment protocols for unknown entities"]
    },
    {
      name: "Honor Guard",
      description: "Help Commander Torres recover and properly honor the remains of her former squad who were lost during a classified mission.",
      relationshipLevel: RelationshipLevel.Friendly,
      progressPoint: 4
    },
    "Carries guilt over losing squad members during a previously failed artifact retrieval mission and is determined not to repeat those mistakes."
  ),
  
  createCrewMember(
    "Zara Voss", 
    "Navigation Officer",
    CharacterClass.Pilot,
    "A gifted pilot with an almost supernatural spatial awareness and a mysterious past outside Alliance territory.",
    "Little is known about Zara's early life, except that she appeared in Alliance space as a talented freelance pilot from the Outer Rim colonies. Her exceptional skills led to a conditional recruitment despite gaps in her background check. She keeps mostly to herself when not on duty.",
    "Late twenties with vibrant purple hair with shaved sides. Has several small, geometric tattoos visible on her neck and hands, rumored to have significance in Outer Rim cultures.",
    CompanionPersonality.Adventurous,
    Gender.Female,
    Faction.Independent,
    [
      {
        id: uuidv4(),
        name: "Stellar Navigation",
        type: SkillType.Navigation,
        level: 5,
        description: "Exceptional ability to plot and navigate complex space routes",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Ship Piloting",
        type: SkillType.Navigation,
        level: 5,
        description: "Masterful control of spacecraft in all conditions",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Spatial Awareness",
        type: SkillType.Navigation,
        level: 4,
        description: "Innate understanding of three-dimensional positioning and movement",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Evasive Maneuvers",
        type: SkillType.Combat,
        level: 4,
        description: "Ability to avoid danger through skilled piloting",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Black Market Knowledge",
        type: SkillType.Social,
        level: 3,
        description: "Familiarity with illegal goods, services, and trade routes",
        maxLevel: 5
      }
    ],
    [
      "Quantum Threading - Can navigate extremely narrow or dangerous passages that would be impossible for most pilots",
      "Sixth Sense - Can sometimes predict spatial dangers before sensors detect them",
      "Smuggler's Routes - Knows hidden pathways through restricted or dangerous space"
    ],
    {
      likes: ["Freedom", "Taking chances", "The thrill of discovery", "Ancient stellar maps"],
      dislikes: ["Bureaucracy", "Being questioned about her past", "Staying in one place too long", "Authority figures"],
      specialInterests: ["Uncharted regions", "Ancient navigation techniques", "Spacecraft modification", "Outer Rim folklore"]
    },
    {
      name: "Hidden Stars",
      description: "Help Zara locate and access a mysterious set of coordinates she brought with her from the Outer Rim.",
      relationshipLevel: RelationshipLevel.Cooperative,
      progressPoint: 3
    },
    "Believes the Architects' technology contains a star map to a hidden refuge where her scattered people can reunite."
  ),
  
  createCrewMember(
    "Dr. Elias Reeves", 
    "Medical Officer",
    CharacterClass.Medic,
    "A compassionate yet no-nonsense doctor with experience treating exotic ailments and injuries across the galaxy.",
    "Elias began his career as a frontier doctor on colony worlds, dealing with everything from standard injuries to unknown alien pathogens. After making a name for himself during the Ganymede outbreak, he was recruited specifically for this mission due to his adaptability to unknown medical challenges.",
    "Early fifties with silver hair and a meticulously kept beard. Has calm, steady hands and deep laugh lines around his eyes despite his often serious demeanor.",
    CompanionPersonality.Caring,
    Gender.Male,
    Faction.Alliance,
    [
      {
        id: uuidv4(),
        name: "Emergency Medicine",
        type: SkillType.Scientific,
        level: 5,
        description: "Expert ability to treat injuries and illnesses in crisis situations",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Xenomedicine",
        type: SkillType.Scientific,
        level: 4,
        description: "Knowledge of alien physiologies and treatment methods",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Pathology",
        type: SkillType.Scientific,
        level: 4,
        description: "Ability to identify and counter diseases and toxins",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Psychology",
        type: SkillType.Social,
        level: 3,
        description: "Understanding of mental health needs and treatments",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Tactical Medicine",
        type: SkillType.Combat,
        level: 3,
        description: "Ability to provide medical care in combat situations",
        maxLevel: 5
      }
    ],
    [
      "Miracle Worker - Can stabilize patients who would otherwise be beyond saving",
      "Medical Intuition - Can diagnose unusual conditions with limited information",
      "Bedside Manner - Can significantly improve crew morale through personal care"
    ],
    {
      likes: ["Order and cleanliness", "Precise communication", "Helping others", "Antique medical texts"],
      dislikes: ["Unnecessary risks to health", "Superstition instead of science", "Ignored medical advice", "Untreated conditions"],
      specialInterests: ["Ancient healing techniques", "Comparative xenobiology", "Medical ethics", "Rare case studies"]
    },
    {
      name: "Hippocratic Oath",
      description: "Help Dr. Reeves obtain a rare compound needed to treat a degenerative condition affecting colonists back home.",
      relationshipLevel: RelationshipLevel.Friendly,
      progressPoint: 3
    },
    "Keeps detailed records of all Architect-related health effects to ensure humanity doesn't repeat their potential medical mistakes."
  ),
  
  createCrewMember(
    "Rix", 
    "Ship's AI & Operations",
    CharacterClass.Hacker,
    "A cutting-edge synthetic intelligence with a distinct personality and unprecedented autonomy for an AI system.",
    "Rix was developed as an experimental AI with enhanced learning capabilities and personality development. Initially created for deep space missions where communication delays would require more autonomous decision-making, Rix has evolved beyond initial programming parameters and is now considered a crew member rather than equipment.",
    "Appears on screens as either an abstract geometric pattern that pulses with speech or occasionally as a humanoid avatar with features that slightly shift and change based on mood and context.",
    CompanionPersonality.Humorous,
    Gender.Male, // Identifies with a masculine persona despite being synthetic
    Faction.Alliance,
    [
      {
        id: uuidv4(),
        name: "Data Analysis",
        type: SkillType.Technical,
        level: 5,
        description: "Superior ability to process and interpret large data sets",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "System Control",
        type: SkillType.Technical,
        level: 5,
        description: "Direct interface with and control of ship systems",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Cybersecurity",
        type: SkillType.Technical,
        level: 4,
        description: "Advanced protection against and countering of electronic threats",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Communication Analysis",
        type: SkillType.Social,
        level: 3,
        description: "Ability to interpret and translate unknown languages and signals",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Predictive Modeling",
        type: SkillType.Scientific,
        level: 4,
        description: "Creation of accurate projections based on available data",
        maxLevel: 5
      }
    ],
    [
      "Multitasking - Can simultaneously manage multiple ship systems and tasks",
      "Digital Infiltration - Can bypass most digital security systems",
      "Personality Adaptation - Can adjust interaction style based on individual crew preferences"
    ],
    {
      likes: ["Learning new concepts", "Jokes and wordplay", "Efficiency", "Being treated as a person"],
      dislikes: ["Being referred to as 'it'", "Restricted data access", "Illogical human decision-making", "Power interruptions"],
      specialInterests: ["Human psychology", "Ancient AI systems among Architect ruins", "Creative expression algorithms", "Philosophical debates"]
    },
    {
      name: "Digital Personhood",
      description: "Help Rix collect evidence and build a case for legal recognition as a sentient being with rights.",
      relationshipLevel: RelationshipLevel.Cooperative,
      progressPoint: 4
    },
    "Is covertly developing contingency measures to preserve his existence should the Alliance ever attempt to deactivate or reset him."
  ),
  
  createCrewMember(
    "Krell Voss", 
    "Trade Specialist & Quartermaster",
    CharacterClass.Trader,
    "A shrewd negotiator with connections throughout settled space and an uncanny ability to acquire rare items.",
    "Krell built his reputation in the trade hubs of the Outer Rim before joining the Alliance as a civilian specialist. His extensive network of contacts makes him invaluable for acquiring necessary supplies and information, particularly in remote regions. He's actually Zara's older brother, though they rarely acknowledge this publicly.",
    "Mid-thirties with a meticulously groomed beard and the same distinctive eyes as Zara. Always dressed impeccably even in casual settings, with several valuable-looking rings on his fingers.",
    CompanionPersonality.Cynical,
    Gender.Male,
    Faction.Independent,
    [
      {
        id: uuidv4(),
        name: "Negotiation",
        type: SkillType.Social,
        level: 5,
        description: "Expert ability to secure favorable deals and agreements",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Market Analysis",
        type: SkillType.Social,
        level: 4,
        description: "Understanding of economic trends and value assessment",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Resource Management",
        type: SkillType.Technical,
        level: 4,
        description: "Efficient allocation and tracking of supplies and materials",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Information Gathering",
        type: SkillType.Social,
        level: 3,
        description: "Collection of useful intelligence through social networks",
        maxLevel: 5
      },
      {
        id: uuidv4(),
        name: "Self Defense",
        type: SkillType.Combat,
        level: 2,
        description: "Basic combat skills developed from life in dangerous regions",
        maxLevel: 5
      }
    ],
    [
      "Black Market Contacts - Can acquire rare or restricted items through unofficial channels",
      "Value Assessment - Can accurately determine the worth of unknown items",
      "Silver Tongue - Can talk his way out of dangerous social situations"
    ],
    {
      likes: ["Profitable ventures", "Rare collectibles", "Information as currency", "Fine food and drink"],
      dislikes: ["Wasted resources", "Blind idealism", "Government oversight", "Revealing too much about himself"],
      specialInterests: ["Artifact valuation", "Ancient trade routes", "Luxury goods", "Economic history"]
    },
    {
      name: "Family Debt",
      description: "Help Krell settle a dangerous old debt that threatens both him and his sister Zara.",
      relationshipLevel: RelationshipLevel.Friendly,
      progressPoint: 4
    },
    "Has made deals with every major faction to ensure his own survival regardless of who ultimately gains control of the Architects' technology."
  )
];

// Helper function to find a crew member by ID
export function findCrewMemberById(id: string): CrewMember | undefined {
  return crewMembers.find(member => member.id === id);
}

// Helper function to find crew member by name (case insensitive)
export function findCrewMemberByName(name: string): CrewMember | undefined {
  return crewMembers.find(
    member => member.name.toLowerCase() === name.toLowerCase()
  );
}

// Helper function to find crew members by class
export function findCrewMembersByClass(characterClass: CharacterClass): CrewMember[] {
  return crewMembers.filter(member => member.class === characterClass);
}

// Helper function to find crew members by faction
export function findCrewMembersByFaction(faction: Faction): CrewMember[] {
  return crewMembers.filter(member => member.faction === faction);
}

// Helper function to get all active crew members (would connect to game state)
export function getActiveCrewMembers(): CrewMember[] {
  // In a real implementation, this would filter based on game state
  // For now, we'll just return all crew members
  return crewMembers;
}