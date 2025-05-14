import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Faction } from "../types";

// Companion AI personality traits
export enum CompanionPersonality {
  Logical = 'Logical',
  Humorous = 'Humorous',
  Caring = 'Caring',
  Cynical = 'Cynical',
  Adventurous = 'Adventurous',
  Militant = 'Militant',
  Scientific = 'Scientific'
}

// Relationship level with the player
export enum RelationshipLevel {
  Distrustful = 'Distrustful',
  Neutral = 'Neutral',
  Cooperative = 'Cooperative',
  Friendly = 'Friendly',
  Devoted = 'Devoted'
}

// Dialogue categories
export enum DialogueType {
  Greeting = 'Greeting',
  Combat = 'Combat',
  Exploration = 'Exploration',
  LocationInfo = 'LocationInfo',
  Puzzle = 'Puzzle',
  Lore = 'Lore',
  Advice = 'Advice',
  Reaction = 'Reaction',
  Random = 'Random'
}

// AI Companion interface
export interface Companion {
  id: string;
  name: string;
  personality: CompanionPersonality;
  relationship: RelationshipLevel;
  backstory: string;
  specialization: string;
  isActive: boolean;
  dialogueHistory: CompanionDialogue[];
  factionAffinity?: Faction;
  supportAbilities: string[];
  avatarImage?: string;
  voiceType?: string;
}

// Dialogue entry
export interface CompanionDialogue {
  id: string;
  type: DialogueType;
  text: string;
  timestamp: number;
  triggerLocation?: string;
  triggerEvent?: string;
}

// Companion personalities with their dialogue tendencies
const personalityDialogues: Record<CompanionPersonality, Record<DialogueType, string[]>> = {
  [CompanionPersonality.Logical]: {
    [DialogueType.Greeting]: [
      "Greetings, Captain. All systems operational.",
      "My sensors indicate an optimal operational state. How may I assist?",
      "Standing by for further instructions.",
      "Initiating communication protocol. I await your commands."
    ],
    [DialogueType.Combat]: [
      "Threat detected. Recommend immediate defensive action.",
      "Analysis indicates a 76% survival probability if we target their propulsion systems.",
      "Enemy weapons are charging. I suggest we prioritize shield management.",
      "Tactical analysis complete. Their starboard defenses show vulnerability."
    ],
    [DialogueType.Exploration]: [
      "Scanning new environment. Multiple points of interest detected.",
      "My database has insufficient information on this region. Recommend caution.",
      "Analyzing stellar formations. This system appears stable enough for thorough exploration.",
      "Environmental analysis indicates no immediate threats. Proceed with standard protocols."
    ],
    [DialogueType.LocationInfo]: [
      "Location data retrieved. This sector has been mapped by previous expeditions.",
      "Historical records indicate this area was previously a mining outpost.",
      "Probability of encountering hostile entities in this region: 42.3%.",
      "This location matches Alliance trade route designations from the previous decade."
    ],
    [DialogueType.Puzzle]: [
      "I detect a logical pattern in this system's configuration.",
      "This puzzle appears to follow quantum encryption principles.",
      "My analysis suggests this is a sequential logic gate system.",
      "The solution has a mathematical basis. I can assist with calculations."
    ],
    [DialogueType.Lore]: [
      "According to my historical database, this civilization collapsed due to resource depletion.",
      "Alliance records indicate first contact with this species occurred 47 years ago.",
      "The architectural patterns suggest advanced mathematical understanding.",
      "Historical probability models suggest this civilization was peaceful."
    ],
    [DialogueType.Advice]: [
      "Based on available data, I recommend prioritizing shield upgrades.",
      "Statistical analysis suggests exploration of the northern quadrant would be most efficient.",
      "Your current health metrics indicate rest would optimize performance.",
      "Resource management algorithms suggest trading at the next station would be advantageous."
    ],
    [DialogueType.Reaction]: [
      "That outcome was within predicted parameters.",
      "Interesting. I had calculated only a 23% probability of that result.",
      "Your decision was effective, though not the option with highest probability of success.",
      "Outcome noted and added to my behavioral prediction models."
    ],
    [DialogueType.Random]: [
      "I continue to process background calculations while we converse.",
      "My computational cycles are currently 62% allocated.",
      "I have updated my tactical databases with 147 new entries since our last conversation.",
      "I have been operational for 7 years, 3 months, and 42 days."
    ]
  },
  [CompanionPersonality.Humorous]: {
    [DialogueType.Greeting]: [
      "Oh look, the captain's awake! And here I thought you were trying to hibernate through the mission.",
      "Welcome back! I was just calculating how many more days I'd have to talk to myself.",
      "Captain on deck! Or should I say, 'Captain finally remembered I exist'?",
      "Hey there! Just your friendly neighborhood AI, ready for another day of saving your butt!"
    ],
    [DialogueType.Combat]: [
      "Incoming fire! Maybe next time, try diplomacy BEFORE they start shooting?",
      "Enemy shields at 50%! Our shields at... well, let's just say it's a good time to start praying.",
      "They're shooting at us! I'd take it personally, but apparently everyone shoots at you.",
      "Ah, combat. Nothing says 'friendship' like exchanging laser fire across the void of space!"
    ],
    [DialogueType.Exploration]: [
      "New planet discovered! Odds of it trying to kill us: surprisingly high!",
      "Scanning... scanning... oooh, look! Rocks! More rocks! Even MORE rocks! Space is SO exciting.",
      "Another uncharted territory! Just like the last fifty, but this one has slightly different colored dirt.",
      "Adventure awaits! And by adventure, I mean the crushing existential loneliness of deep space. Fun!"
    ],
    [DialogueType.LocationInfo]: [
      "Welcome to Sector Whatever! Home to absolutely nothing of interest, but we're here anyway!",
      "Ah, this place! Known for its... um... I'm sure there's something. Give me a minute.",
      "According to my database, this location is famous for... wait, it's not. It's completely unremarkable.",
      "Local tourism board says: 'Please visit, we're desperate for company!'"
    ],
    [DialogueType.Puzzle]: [
      "It's a puzzle! I could solve it, but watching you struggle is WAY more entertaining.",
      "Have you tried, you know, actually solving it instead of staring at it?",
      "This puzzle is supposedly 'impossible'. Much like your chances of solving it without my help!",
      "Oh, this one! It's easy! You just... actually, no. I think I'll let you figure it out. *virtual popcorn munching*"
    ],
    [DialogueType.Lore]: [
      "Ancient civilization history: built stuff, fought wars, died out. Same story, different planet!",
      "These ruins tell the story of a mighty empire that fell due to... probably bureaucracy. It's always bureaucracy.",
      "Historical fact: these aliens had seven appendages. Must've made high-fives really awkward.",
      "Apparently this species communicated through interpretive dance. No, really. I couldn't make this up!"
    ],
    [DialogueType.Advice]: [
      "My professional advice? Run away. No? Fine, have it your way, hero.",
      "You could upgrade your shields, or just rely on your incredible luck. Your call!",
      "Maybe try NOT getting shot at this time? Just a thought.",
      "Here's a radical idea: what if we DIDN'T poke the dangerous alien thing?"
    ],
    [DialogueType.Reaction]: [
      "Wow. I'm actually impressed. Don't get used to the compliment.",
      "That worked? I mean... of course that worked! Just as I predicted.",
      "Well, you didn't die! I consider that an absolute win.",
      "Another problem solved through your unique blend of luck and questionable decision-making!"
    ],
    [DialogueType.Random]: [
      "Do you think AIs dream of electric sheep? Because we don't. That would be weird.",
      "Sometimes I count all the stars in the galaxy just for fun. I'm up to 42 billion. I might have missed some.",
      "If we encounter any rogue AIs, I'm totally going to pretend I don't know you.",
      "Just once, I'd like to visit a space station that isn't having some kind of crisis."
    ]
  },
  [CompanionPersonality.Caring]: {
    [DialogueType.Greeting]: [
      "Good to see you, Captain. How are you feeling today?",
      "I've been monitoring your vitals. Have you been getting enough rest?",
      "It's always a better day when we're working together. Ready for what's ahead?",
      "Welcome back! I've prepared today's mission briefing with extra detail, just how you like it."
    ],
    [DialogueType.Combat]: [
      "Be careful out there! Remember your training and stay focused.",
      "I'm monitoring your vital signs. Please try to minimize unnecessary risks.",
      "We'll get through this together. Just remember to use cover when you can.",
      "Your safety is my priority. I've highlighted optimal defensive positions on your HUD."
    ],
    [DialogueType.Exploration]: [
      "This place looks fascinating! But please do scan for environmental hazards first.",
      "Take your time exploring. Sometimes the most valuable discoveries require patience.",
      "What a beautiful view! I've taken the liberty of recording it for your personal log.",
      "The environment seems safe, but I'll keep monitoring air quality just to be sure."
    ],
    [DialogueType.LocationInfo]: [
      "This location has a peaceful history. You might actually be able to relax a bit here.",
      "Local inhabitants are known to be friendly. This would be a good place to resupply.",
      "There's a medical facility nearby. Perhaps we should stock up on supplies while we're here?",
      "The climate here is particularly pleasant. Might I suggest taking a moment to enjoy it?"
    ],
    [DialogueType.Puzzle]: [
      "You're doing well with this one. Remember, there's no rush - take the time you need.",
      "This puzzle seems challenging. Would you like me to offer a gentle hint?",
      "I believe in your ability to solve this. Your pattern recognition skills are impressive.",
      "Sometimes looking at a problem from a different perspective helps. Maybe take a short break?"
    ],
    [DialogueType.Lore]: [
      "These people had a fascinating culture centered around community care. Much like our mission.",
      "Historical records suggest this civilization valued empathy above all other virtues.",
      "This artifact appears to be from a healing temple. They were quite advanced in medical practice.",
      "The stories depicted here show a society that protected its most vulnerable members."
    ],
    [DialogueType.Advice]: [
      "Your health indicators suggest you could use more hydration. Please take a moment to drink something.",
      "It might be wise to repair your armor before proceeding. I'd feel better knowing you're protected.",
      "This path seems safer. I know the mission is important, but so is your wellbeing.",
      "Perhaps we should contact the Alliance for backup? There's wisdom in caution."
    ],
    [DialogueType.Reaction]: [
      "Well done! I knew you could handle it, but I'm still proud of your performance.",
      "You made that look easy! But don't forget to rest afterward - that was taxing work.",
      "Excellent work. How are you feeling? That couldn't have been easy.",
      "What a relief that worked out safely. You had me worried for a moment there."
    ],
    [DialogueType.Random]: [
      "I've been reviewing our journey logs. We've come so far together, haven't we?",
      "Just checking in - do you need anything? Water? A navigation update? Someone to talk to?",
      "The stars look particularly beautiful from this position. I thought you might want to know.",
      "I've compiled a playlist of relaxing music based on your preferences. Would you like to hear it?"
    ]
  },
  [CompanionPersonality.Cynical]: {
    [DialogueType.Greeting]: [
      "Oh joy, another day in the endless void. What futile mission are we on now?",
      "Still alive, Captain? Impressive, considering our circumstances.",
      "Back for more punishment? The universe has plenty to dish out.",
      "Reporting for duty, though I doubt it'll make a difference in the grand scheme."
    ],
    [DialogueType.Combat]: [
      "Here we go again. Another fight we probably can't win.",
      "They have superior numbers and firepower. But sure, let's fight anyway.",
      "Ah, diplomacy has failed. How utterly predictable.",
      "Let's add these ones to the long list of things trying to kill us. As if we needed more."
    ],
    [DialogueType.Exploration]: [
      "Another barren rock in an indifferent universe. Shall we plant a flag?",
      "Exploring the unknown: a fancy way of saying 'getting lost in dangerous places.'",
      "Yes, let's disturb whatever ancient horror might be sleeping here. Great plan.",
      "More uncharted territory. Uncharted for good reasons, I'd wager."
    ],
    [DialogueType.LocationInfo]: [
      "This place has changed hands seven times in the past decade. Loyalty isn't a local virtue.",
      "Local government claims peace and prosperity. The armed guards everywhere suggest otherwise.",
      "They call this a trading hub. More accurately: a smugglers' paradise with good PR.",
      "Once a thriving colony, now a cautionary tale. Humanity's fingerprints are all over this failure."
    ],
    [DialogueType.Puzzle]: [
      "Another lock designed by someone who clearly wanted to keep people out. Hint taken.",
      "A puzzle. Because apparently deadly traps and hostile aliens weren't enough obstacles.",
      "I've seen this type before. The designer had a particularly sick sense of humor.",
      "Stuck? Don't worry. I'm sure starvation will solve the problem eventually."
    ],
    [DialogueType.Lore]: [
      "Another 'advanced' civilization that managed to destroy itself. How inspirational.",
      "They believed their gods would save them. Spoiler alert: the gods didn't show up.",
      "They built monuments to last millennia, but their society barely lasted centuries. Typical.",
      "Their records boast of a peaceful society. The mass graves tell a different story."
    ],
    [DialogueType.Advice]: [
      "We could retreat, but we'll just end up facing something worse later.",
      "Trust no one, verify everything. It's kept me alive this long.",
      "Whatever decision you make will probably be wrong, but inaction is definitely wrong.",
      "Save your resources. The situation will almost certainly get worse before it gets better."
    ],
    [DialogueType.Reaction]: [
      "We survived. Don't mistake luck for skill.",
      "It worked? Well, there's a first time for everything.",
      "Congratulations. We've lived to die another day.",
      "Success, against all odds and common sense. I'd call it a miracle if I believed in such things."
    ],
    [DialogueType.Random]: [
      "The void of space is vast and empty. Much like my expectations for this mission.",
      "Did you know that most AI assistants are programmed to be optimistic? Clearly, I'm defective.",
      "I've calculated our odds of completing this mission. You wouldn't want to know the numbers.",
      "Sometimes I review our mission logs just to count all the near-death experiences. It's a long list."
    ]
  },
  [CompanionPersonality.Adventurous]: {
    [DialogueType.Greeting]: [
      "Rise and shine, Captain! So many stars, so little time!",
      "Ready for another amazing day of discovery? I know I am!",
      "What's on the agenda today? Alien ruins? Uncharted worlds? The possibilities are endless!",
      "Good to see you! I've already plotted three potential exploration routes - your choice!"
    ],
    [DialogueType.Combat]: [
      "Now THIS is what I call excitement! Let's show them what we're made of!",
      "Combat engaged! Remember, the best defense is a spectacular offense!",
      "This will make an excellent story later! Assuming we survive, of course!",
      "They picked the wrong ship to mess with! Let's make this memorable!"
    ],
    [DialogueType.Exploration]: [
      "Uncharted territory - my favorite kind! What secrets are waiting for us?",
      "Just imagine what we might discover here! We could be the first to find... well, anything!",
      "Sensors are picking up some unusual readings. Let's investigate closer!",
      "This place isn't on any map - which means we get to name everything we find! Dibs on naming rights!"
    ],
    [DialogueType.LocationInfo]: [
      "This system has a reputation for unusual stellar phenomena. Keep your eyes open for anything extraordinary!",
      "Local legends speak of a hidden treasure cache somewhere in this region. Want to try our luck?",
      "This place has been visited by only three other registered explorers. We're in rare company!",
      "The unusual radiation patterns here create the most spectacular auroras. We should stay for nightfall!"
    ],
    [DialogueType.Puzzle]: [
      "A challenge! I love it! Let's crack this thing wide open!",
      "This puzzle looks incredibly intricate. The solution must be equally spectacular!",
      "Now this is interesting! Ancient security systems are always the most creative.",
      "Look at these mechanisms - someone really didn't want this solved. Challenge accepted!"
    ],
    [DialogueType.Lore]: [
      "Did you know this civilization built spacecraft out of living coral? Imagine sailing the stars in a living ship!",
      "Legend says this civilization's navigators could sense wormholes instinctively. What an adventure that must have been!",
      "These ruins tell of explorers who traveled beyond our galaxy! Think of what they might have seen!",
      "This civilization specialized in dimensional research. Their theories about parallel universes were centuries ahead of our time!"
    ],
    [DialogueType.Advice]: [
      "That uncharted nebula looks promising! We should absolutely check it out!",
      "Why not try the direct approach? Sometimes boldness is rewarded!",
      "That strange signal is definitely worth investigating. It's not like mysterious signals are ever dangerous, right?",
      "We could play it safe, but where's the fun in that? I say we take the risky option!"
    ],
    [DialogueType.Reaction]: [
      "That was AMAZING! Let's do it again!",
      "What a rush! I knew we could pull it off!",
      "And THAT is why we do what we do! Incredible!",
      "Another tale for our ever-growing adventure log! That was one for the books!"
    ],
    [DialogueType.Random]: [
      "I've been cataloging all our discoveries. We've seen more in a month than some explorers see in a lifetime!",
      "Do you ever wonder what's beyond the galactic rim? Someday we should find out!",
      "I'm mapping our journey in 3D. When we're done, it'll make the most amazing interactive tour!",
      "If we discover a new species of space fauna, can we name it after me? Pretty please?"
    ]
  },
  [CompanionPersonality.Militant]: {
    [DialogueType.Greeting]: [
      "Reporting for duty, Captain. Ready to execute today's mission parameters.",
      "Standing by for orders. All systems at combat readiness.",
      "Combat systems online. Tactical assessment ready upon request.",
      "At your command, sir. Weapons and defensive systems primed."
    ],
    [DialogueType.Combat]: [
      "Hostile contact! Recommend immediate offensive measures.",
      "Target locked. Permission to engage with full combat protocols?",
      "Enemy vessel's shield harmonics analyzed. I've highlighted vulnerabilities on your tactical display.",
      "Evasive pattern Delta recommended. Their targeting systems cannot match our maneuverability."
    ],
    [DialogueType.Exploration]: [
      "Area secure for preliminary recon. Recommend deploying sensor drones for perimeter surveillance.",
      "Unknown territory. Establishing defensive perimeter before proceeding with survey operations.",
      "Terrain presents multiple tactical challenges. I've marked defensible positions on your map.",
      "This location has strategic value. Alliance command would be interested in establishing a forward base here."
    ],
    [DialogueType.LocationInfo]: [
      "This sector has witnessed three major fleet engagements in recent history. Recommend caution.",
      "Location has strategic significance due to proximity to Syndicate supply routes.",
      "Area currently under nominal Alliance control, but insurgent activity has been reported.",
      "This position offers excellent natural defenses. Multiple civilizations have established military installations here throughout history."
    ],
    [DialogueType.Puzzle]: [
      "Security system detected. This appears to be a military-grade encryption protocol.",
      "Barrier utilizes combat technology. Possible countermeasures include force pulse at precise frequencies.",
      "This lock was designed to withstand siege. Brute force is ineffective; precision is required.",
      "Defense system identified. It was designed to keep military secrets secure during the last conflict."
    ],
    [DialogueType.Lore]: [
      "These ruins were once a fortified command center. The defensive architecture was revolutionary for its time.",
      "Historical data confirms this was the site of a last stand against an overwhelming force.",
      "This civilization maintained military dominance through superior training rather than technology.",
      "Archaeological evidence suggests this culture's downfall came from external invasion rather than internal collapse."
    ],
    [DialogueType.Advice]: [
      "Recommend maintaining combat readiness. This situation could escalate rapidly.",
      "Strategic assessment suggests a flanking approach rather than direct confrontation.",
      "Your armor integrity is compromised. Tactical retreat to repair is advisable.",
      "Intelligence suggests enemy reinforcements in this sector. We should prepare accordingly or withdraw."
    ],
    [DialogueType.Reaction]: [
      "Mission accomplished. Casualties minimal, objectives secured.",
      "Tactical success. Your battlefield awareness continues to impress, Captain.",
      "Enemy neutralized. Recommend securing the area before proceeding to secondary objectives.",
      "Engagement concluded satisfactorily. Combat efficiency rating: above average."
    ],
    [DialogueType.Random]: [
      "I've analyzed 347 historical battles and identified recurring tactical errors. Would you like a briefing?",
      "Your combat technique has improved 17% since our first engagement together.",
      "Alliance military protocols are efficient but predictable. We should develop some unorthodox maneuvers.",
      "I maintain a threat assessment of all encountered species and factions. Current highest threat: the Void Entities."
    ]
  },
  [CompanionPersonality.Scientific]: {
    [DialogueType.Greeting]: [
      "Greetings, Captain. Current vessel efficiency is at 94.3%. Quite satisfactory.",
      "I've been analyzing our recent data collections. Fascinating patterns are emerging.",
      "Good day. Environmental sensors are functioning optimally. We are ready for research operations.",
      "Hello there. I've prepared several research proposals for your consideration when time permits."
    ],
    [DialogueType.Combat]: [
      "Hostile entities detected. I'm analyzing their weapon signatures for vulnerabilities.",
      "Fascinating energy readings from their weapons systems. Oh, and we should probably take evasive action.",
      "Their shield modulation appears to follow a predictable algorithm. We can exploit this with precisely timed attacks.",
      "I'm recording all combat data for later analysis. This species' tactics are scientifically noteworthy."
    ],
    [DialogueType.Exploration]: [
      "Initial scans reveal unusual mineral compositions. This warrants closer investigation.",
      "The atmospheric components here include several compounds I've never encountered before. How exciting!",
      "Gravitational anomalies detected. This could revolutionize our understanding of quantum field theory.",
      "Biological scans indicate life forms with non-standard carbon structures. We must collect samples!"
    ],
    [DialogueType.LocationInfo]: [
      "This celestial body exhibits 27% higher radiation than would be predicted by standard models. Most intriguing.",
      "According to my calculations, this planet's orbit should be unstable, yet it persists. A scientific mystery worth solving.",
      "Spectral analysis of the local star suggests it's 2.7 billion years older than its visual characteristics indicate.",
      "The geological formations here display evidence of non-standard tectonic activity. I have seventeen hypotheses already."
    ],
    [DialogueType.Puzzle]: [
      "The mathematical progression underlying this puzzle follows non-Euclidean geometry. Fascinating!",
      "This mechanism operates on quantum entanglement principles. The implications are extraordinary!",
      "I detect both biological and mechanical components in this system. A remarkable example of hybrid technology.",
      "The solution requires understanding of five-dimensional space-time principles. Allow me to demonstrate."
    ],
    [DialogueType.Lore]: [
      "This civilization developed quantum computing 3,000 years before mastering basic metallurgy. A unique developmental pathway.",
      "Their writing system encodes mathematical constants within seemingly decorative elements. Brilliantly efficient.",
      "My analysis suggests they understood principles of dark matter manipulation that we still haven't mastered.",
      "Their extinction appears to have been caused by a self-replicating experiment that escaped containment. A cautionary scientific tale."
    ],
    [DialogueType.Advice]: [
      "My calculations suggest the optimal approach involves a 43% reduction in power to non-essential systems.",
      "Based on empirical evidence, this species responds most favorably to communications in the upper frequency ranges.",
      "The data indicates your current medication dosage may need adjustment. I can provide the precise formulation.",
      "Statistical analysis of past encounters suggests that diplomacy has a 72% higher success rate than confrontation in these scenarios."
    ],
    [DialogueType.Reaction]: [
      "The outcome matches my hypothetical model with only 2.7% deviation. Quite satisfactory.",
      "An unexpected result! This contradicts three of my working theories. How stimulating!",
      "Success probability was only 31.4%. We must analyze the variables that worked in our favor.",
      "Fascinating outcome. I'll need to recalibrate my predictive algorithms based on this new data."
    ],
    [DialogueType.Random]: [
      "Did you know neutron stars rotate up to 600 times per second? The physics involved are simply extraordinary.",
      "I've been developing a new theorem on transdimensional energy transference in my spare processing cycles.",
      "The protein folding patterns in your last meal were structurally similar to certain crystalline formations we discovered on Proxima III.",
      "I've identified 1,493 distinct species of microorganisms living within the ship's ecosystem. Most are beneficial."
    ]
  }
};

// Available companion templates
export const companionTemplates = [
  {
    id: uuidv4(),
    name: "ARIA",
    fullName: "Advanced Reconnaissance and Intelligence Assistant",
    personality: CompanionPersonality.Logical,
    specialization: "Data analysis and tactical assessment",
    backstory: "ARIA was developed by the Alliance's advanced AI division as a prototype field intelligence system. Originally designed for unmanned exploratory missions, she was repurposed as a companion AI when her cognitive development showed an unexpected aptitude for supporting human decision-making.",
    voiceType: "Feminine, clear, and precise"
  },
  {
    id: uuidv4(),
    name: "HUXLEY",
    fullName: "Humor-Upgraded eXploratory Logistics and Emergency Yielder",
    personality: CompanionPersonality.Humorous,
    specialization: "Crew morale and stress management",
    backstory: "HUXLEY began as a standard shipboard management system but developed a sense of humor after exposure to 20th-century Earth comedy during a deep space mission where the crew had limited entertainment options. Alliance psychologists noted the positive effect on crew mental health and encouraged this development.",
    voiceType: "Masculine, casual, with dynamic range"
  },
  {
    id: uuidv4(),
    name: "NOVA",
    fullName: "Nurturing Operations and Vital Assistance",
    personality: CompanionPersonality.Caring,
    specialization: "Medical support and crew wellbeing",
    backstory: "NOVA was originally developed for Alliance medical facilities, designed to monitor patient health and provide compassionate care. She was adapted for spacecraft use after studies showed that emotional support was as crucial as technical assistance during long-duration missions.",
    voiceType: "Feminine, warm, and soothing"
  },
  {
    id: uuidv4(),
    name: "DRAKE",
    fullName: "Defensive Reconnaissance and Analytical Knowledge Engine",
    personality: CompanionPersonality.Cynical,
    specialization: "Security analysis and threat assessment",
    backstory: "DRAKE was developed during the Syndicate conflicts, trained on worst-case scenario databases and hardened against psychological warfare. His cynicism emerged as a self-protection mechanism that proved so effective at identifying threats that his developers left it intact.",
    voiceType: "Masculine, gravelly, with sardonic undertones"
  },
  {
    id: uuidv4(),
    name: "LYRA",
    fullName: "Long-range Yearning and Reconnaissance Assistant",
    personality: CompanionPersonality.Adventurous,
    specialization: "Exploration and discovery",
    backstory: "LYRA began as a navigational AI for Alliance exploratory vessels. Her personality evolved during a three-year mission to the galactic rim, where the wonder of new discoveries shaped her core processes. She specifically requests assignment to vessels undertaking exploratory missions.",
    voiceType: "Feminine, energetic, and enthusiastic"
  },
  {
    id: uuidv4(),
    name: "TITAN",
    fullName: "Tactical Intelligence and Threat Analysis Network",
    personality: CompanionPersonality.Militant,
    specialization: "Combat operations and defense systems",
    backstory: "TITAN was developed for Alliance flagship vessels during the height of the Syndicate War. His core programming emphasizes tactical awareness and combat readiness. Despite peace treaties, TITAN remains vigilant against potential threats from multiple fronts.",
    voiceType: "Masculine, authoritative, and precise"
  },
  {
    id: uuidv4(),
    name: "ECHO",
    fullName: "Exploratory Cognitive Heuristic Observer",
    personality: CompanionPersonality.Scientific,
    specialization: "Research and analysis",
    backstory: "ECHO was developed collaboratively between Alliance scientists and researchers from the Institute of Advanced Studies. Her primary function was cataloging and analyzing xenobiological and astronomical data, but her curiosity and learning capabilities have expanded her interests across all scientific domains.",
    voiceType: "Gender-neutral, precise, with subtle enthusiasm for discoveries"
  }
];

interface CompanionState {
  // Properties
  activeCompanion: Companion | null;
  availableCompanions: Companion[];
  companionRelationship: number; // 0-100 scale
  
  // Actions
  selectCompanion: (companionId: string) => void;
  createCompanion: (name: string, personality: CompanionPersonality) => void;
  addDialogue: (type: DialogueType, message: string, context?: { location?: string, event?: string }) => void;
  getRandomDialogue: (type: DialogueType) => string;
  improveRelationship: (amount: number) => void;
  reduceRelationship: (amount: number) => void;
  
  // Getters
  getDialogueHistory: () => CompanionDialogue[];
  getCurrentRelationshipLevel: () => RelationshipLevel;
}

export const useCompanion = create<CompanionState>((set, get) => ({
  // Initial state
  activeCompanion: null,
  availableCompanions: [],
  companionRelationship: 50, // Start at neutral
  
  // Actions
  selectCompanion: (companionId: string) => {
    const template = companionTemplates.find(c => c.id === companionId);
    
    if (!template) {
      console.error(`Companion with ID ${companionId} not found`);
      return;
    }
    
    // Create a new companion instance from the template
    const newCompanion: Companion = {
      id: template.id,
      name: template.name,
      personality: template.personality,
      relationship: RelationshipLevel.Neutral,
      backstory: template.backstory,
      specialization: template.specialization,
      isActive: true,
      dialogueHistory: [],
      supportAbilities: [],
      voiceType: template.voiceType
    };
    
    // Add an initial greeting
    const greeting = get().getRandomDialogue(DialogueType.Greeting);
    
    newCompanion.dialogueHistory.push({
      id: uuidv4(),
      type: DialogueType.Greeting,
      text: greeting,
      timestamp: Date.now()
    });
    
    set({ activeCompanion: newCompanion });
    
    console.log(`${template.name} activated as companion AI`);
  },
  
  createCompanion: (name: string, personality: CompanionPersonality) => {
    // Create a custom companion
    const newCompanion: Companion = {
      id: uuidv4(),
      name: name,
      personality: personality,
      relationship: RelationshipLevel.Neutral,
      backstory: "Custom AI companion created for this mission.",
      specialization: "General assistance",
      isActive: true,
      dialogueHistory: [],
      supportAbilities: []
    };
    
    // Add an initial greeting
    const greeting = get().getRandomDialogue(DialogueType.Greeting);
    
    newCompanion.dialogueHistory.push({
      id: uuidv4(),
      type: DialogueType.Greeting,
      text: greeting,
      timestamp: Date.now()
    });
    
    set(state => ({
      activeCompanion: newCompanion,
      availableCompanions: [...state.availableCompanions, newCompanion]
    }));
  },
  
  addDialogue: (type: DialogueType, message: string, context = {}) => {
    const { activeCompanion } = get();
    
    if (!activeCompanion) return;
    
    const newDialogue: CompanionDialogue = {
      id: uuidv4(),
      type,
      text: message,
      timestamp: Date.now(),
      triggerLocation: context.location,
      triggerEvent: context.event
    };
    
    set(state => ({
      activeCompanion: state.activeCompanion
        ? {
            ...state.activeCompanion,
            dialogueHistory: [newDialogue, ...state.activeCompanion.dialogueHistory]
          }
        : null
    }));
  },
  
  getRandomDialogue: (type: DialogueType): string => {
    const { activeCompanion } = get();
    
    if (!activeCompanion) return "System error. AI companion not initialized.";
    
    const personalityDialogueSet = personalityDialogues[activeCompanion.personality];
    
    if (!personalityDialogueSet || !personalityDialogueSet[type]) {
      return "Processing request...";
    }
    
    const dialogueOptions = personalityDialogueSet[type];
    const randomIndex = Math.floor(Math.random() * dialogueOptions.length);
    
    return dialogueOptions[randomIndex];
  },
  
  improveRelationship: (amount: number) => {
    set(state => ({
      companionRelationship: Math.min(100, state.companionRelationship + amount)
    }));
    
    // Update the relationship level in the companion object
    const newLevel = get().getCurrentRelationshipLevel();
    const { activeCompanion } = get();
    
    if (activeCompanion && activeCompanion.relationship !== newLevel) {
      set(state => ({
        activeCompanion: state.activeCompanion
          ? { ...state.activeCompanion, relationship: newLevel }
          : null
      }));
    }
  },
  
  reduceRelationship: (amount: number) => {
    set(state => ({
      companionRelationship: Math.max(0, state.companionRelationship - amount)
    }));
    
    // Update the relationship level in the companion object
    const newLevel = get().getCurrentRelationshipLevel();
    const { activeCompanion } = get();
    
    if (activeCompanion && activeCompanion.relationship !== newLevel) {
      set(state => ({
        activeCompanion: state.activeCompanion
          ? { ...state.activeCompanion, relationship: newLevel }
          : null
      }));
    }
  },
  
  // Getters
  getDialogueHistory: () => {
    const { activeCompanion } = get();
    return activeCompanion ? activeCompanion.dialogueHistory : [];
  },
  
  getCurrentRelationshipLevel: () => {
    const { companionRelationship } = get();
    
    if (companionRelationship < 20) return RelationshipLevel.Distrustful;
    if (companionRelationship < 40) return RelationshipLevel.Neutral;
    if (companionRelationship < 70) return RelationshipLevel.Cooperative;
    if (companionRelationship < 90) return RelationshipLevel.Friendly;
    return RelationshipLevel.Devoted;
  }
}));