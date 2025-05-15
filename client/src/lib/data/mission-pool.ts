import { Faction, CharacterClass, SkillType, LocationType } from '../types';

// Define mission structure
export interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  stage: number; // 1-20
  variant: number; // 1-5 within each stage
  storylines: string[]; // which storylines this connects with
  location: string; // location ID
  requiredSkillChecks?: {
    type: SkillType;
    level: number;
    success: string; // outcome ID if successful
    failure: string; // outcome ID if failed
  }[];
  choices: {
    id: string;
    text: string;
    requiredFlags?: string[];
    requiredItems?: string[];
    requiredFaction?: {
      faction: Faction;
      minReputation: number;
    };
    outcome: string; // outcome ID
  }[];
  outcomes: {
    id: string;
    text: string;
    reputationChanges?: {
      faction: Faction;
      change: number;
    }[];
    flagsSet?: string[];
    flagsRemoved?: string[];
    itemsGiven?: string[];
    itemsRemoved?: string[];
    creditsGiven?: number;
    creditsRemoved?: number;
    unlocksLocations?: string[];
    nextMission?: string; // optional specific next mission
    allowStageProgress: boolean; // whether to advance to next stage
  }[];
}

// Define storyline themes
export enum StorylineTheme {
  Alliance = 'alliance',
  Syndicate = 'syndicate',
  Settlers = 'settlers',
  Mystics = 'mystics',
  VoidEntity = 'void_entity',
  Exploration = 'exploration',
  Trade = 'trade',
  Artifact = 'artifact',
  Mystery = 'mystery',
  Rebellion = 'rebellion'
}

// Create a pool of missions organized by stage and variant
export const missionPool: MissionTemplate[] = [
  // ================ STAGE 1 MISSIONS (5 variants) ================
  // Stage 1 Variant 1: Distress Signal
  {
    id: 'distress_signal',
    title: 'Distress Signal',
    description: 'While traveling through the Proxima System, you detect a distress signal from a damaged Alliance research vessel.',
    stage: 1,
    variant: 1,
    storylines: [StorylineTheme.Alliance, StorylineTheme.Exploration],
    location: 'proxima_derelict',
    choices: [
      {
        id: 'investigate',
        text: 'Investigate the derelict vessel',
        outcome: 'board_vessel'
      },
      {
        id: 'call_alliance',
        text: 'Report the signal to Alliance authorities',
        outcome: 'alliance_response'
      },
      {
        id: 'ignore',
        text: 'Ignore the signal and continue your journey',
        outcome: 'abandon_ship'
      }
    ],
    outcomes: [
      {
        id: 'board_vessel',
        text: 'You dock with the derelict vessel and board it to investigate. The ship is eerily quiet, with signs of a struggle. Most systems are offline, and the crew is nowhere to be found. While exploring, you discover an encrypted data core that might contain valuable information.',
        itemsGiven: ['encrypted_data_core', 'emergency_supplies'],
        reputationChanges: [
          { faction: Faction.Alliance, change: 5 }
        ],
        flagsSet: ['boarded_derelict'],
        unlocksLocations: ['frontier_outpost'],
        allowStageProgress: true
      },
      {
        id: 'alliance_response',
        text: 'You transmit the coordinates to the nearest Alliance outpost. They thank you for the information and dispatch a rescue team. Later, an Alliance officer contacts you with gratitude for your assistance and mentions that they recovered important research materials from the vessel.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 10 }
        ],
        creditsGiven: 200,
        flagsSet: ['alliance_grateful'],
        unlocksLocations: ['frontier_outpost'],
        allowStageProgress: true
      },
      {
        id: 'abandon_ship',
        text: 'You decide to ignore the distress call and continue on your journey. The incident is reported on the news networks days later, with authorities lamenting the lack of response from nearby vessels. The Alliance has launched an investigation into the incident.',
        reputationChanges: [
          { faction: Faction.Alliance, change: -5 }
        ],
        flagsSet: ['ignored_distress'],
        unlocksLocations: ['frontier_outpost'],
        allowStageProgress: true
      }
    ]
  },
  
  // Stage 1 Variant 2: Smuggling Run
  {
    id: 'smuggling_run',
    title: 'Lucrative Opportunity',
    description: 'A mysterious contact offers you a substantial payment to transport an unmarked cargo container to the Frontier Outpost, no questions asked.',
    stage: 1,
    variant: 2,
    storylines: [StorylineTheme.Syndicate, StorylineTheme.Trade],
    location: 'ship',
    choices: [
      {
        id: 'accept_job',
        text: 'Accept the job and transport the cargo',
        outcome: 'complete_smuggle'
      },
      {
        id: 'scan_container',
        text: 'Scan the container before accepting',
        outcome: 'container_contents'
      },
      {
        id: 'refuse_job',
        text: 'Refuse the suspicious offer',
        outcome: 'refuse_smuggle'
      }
    ],
    outcomes: [
      {
        id: 'complete_smuggle',
        text: 'You accept the job without asking questions and deliver the container to the specified coordinates at the Frontier Outpost. A shady individual takes possession of the container and transfers a substantial payment to your account. You never learn what was inside, but your reputation with certain underground elements has improved.',
        reputationChanges: [
          { faction: Faction.Syndicate, change: 10 },
          { faction: Faction.Alliance, change: -5 }
        ],
        creditsGiven: 1000,
        flagsSet: ['smuggler_contact'],
        unlocksLocations: ['frontier_outpost'],
        allowStageProgress: true
      },
      {
        id: 'container_contents',
        text: 'Your scan reveals that the container holds restricted medical supplies stolen from an Alliance facility. The contact is displeased by your caution but still offers the job at a reduced rate. You can choose whether to complete the delivery or report the operation to authorities.',
        flagsSet: ['knows_smuggled_contents'],
        nextMission: 'smuggling_decision',
        allowStageProgress: false
      },
      {
        id: 'refuse_smuggle',
        text: 'You decline the suspicious offer, preferring to avoid potential legal complications. The contact seems disappointed but respects your decision. You continue on your journey toward more legitimate opportunities.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 2 }
        ],
        unlocksLocations: ['frontier_outpost'],
        allowStageProgress: true
      }
    ]
  },
  
  // Stage 1 Variant 3: Asteroid Mining
  {
    id: 'asteroid_mining',
    title: 'Resource Expedition',
    description: 'The Settlers Coalition has put out an open call for independent pilots to assist with resource extraction in the Helios Asteroid Belt. The pay is modest, but it\'s honest work.',
    stage: 1,
    variant: 3,
    storylines: [StorylineTheme.Settlers, StorylineTheme.Trade],
    location: 'mining_colony',
    choices: [
      {
        id: 'join_operation',
        text: 'Join the mining operation',
        outcome: 'successful_mining'
      },
      {
        id: 'scout_asteroids',
        text: 'Scout for high-value asteroids independently',
        outcome: 'valuable_discovery'
      },
      {
        id: 'ignore_call',
        text: 'Ignore the request for assistance',
        outcome: 'skip_mining'
      }
    ],
    outcomes: [
      {
        id: 'successful_mining',
        text: 'You spend several days working alongside the Settlers, extracting valuable minerals from the asteroid belt. The work is tedious but rewarding, and the Settlers appreciate your help. They pay you fairly for your contribution and invite you to return in the future.',
        reputationChanges: [
          { faction: Faction.Settlers, change: 8 }
        ],
        creditsGiven: 500,
        itemsGiven: ['repair_kit'],
        flagsSet: ['helped_settlers'],
        unlocksLocations: ['frontier_outpost', 'mining_colony'],
        allowStageProgress: true
      },
      {
        id: 'valuable_discovery',
        text: 'Instead of joining the main operation, you venture deeper into the asteroid belt on your own. Your risk pays off when you discover a small asteroid with an unusually high concentration of rare minerals. You extract a substantial amount before heading back to sell your findings at a premium.',
        reputationChanges: [
          { faction: Faction.Settlers, change: 3 },
          { faction: Faction.Independent, change: 5 }
        ],
        creditsGiven: 800,
        flagsSet: ['independent_miner'],
        unlocksLocations: ['frontier_outpost', 'mining_colony'],
        allowStageProgress: true
      },
      {
        id: 'skip_mining',
        text: 'You decide that asteroid mining doesn\'t align with your interests or skills. Instead, you head directly to the Frontier Outpost to seek other opportunities.',
        unlocksLocations: ['frontier_outpost'],
        allowStageProgress: true
      }
    ]
  },
  
  // Stage 1 Variant 4: Strange Signals
  {
    id: 'strange_signals',
    title: 'Mysterious Transmission',
    description: 'Your ship\'s communications array picks up an unusual signal emanating from an uncharted region of space. The signal doesn\'t match any known patterns in your database.',
    stage: 1,
    variant: 4,
    storylines: [StorylineTheme.Mystery, StorylineTheme.VoidEntity, StorylineTheme.Exploration],
    location: 'ship',
    choices: [
      {
        id: 'investigate_signal',
        text: 'Follow the signal to its source',
        outcome: 'anomalous_discovery'
      },
      {
        id: 'analyze_data',
        text: 'Analyze the signal data from a safe distance',
        outcome: 'signal_analysis'
      },
      {
        id: 'report_mystics',
        text: 'Report the signal to the Order of the Cosmic Veil',
        outcome: 'mystic_interest'
      }
    ],
    outcomes: [
      {
        id: 'anomalous_discovery',
        text: 'You follow the signal to an uncharted region of space where you encounter a strange spatial anomaly. As you approach, your ship\'s systems begin to malfunction, and you experience brief hallucinations. Before retreating to a safe distance, you manage to collect unusual energy readings that might be valuable to researchers.',
        reputationChanges: [
          { faction: Faction.Mystics, change: 5 }
        ],
        flagsSet: ['encountered_anomaly', 'void_awareness'],
        unlocksLocations: ['frontier_outpost'],
        allowStageProgress: true
      },
      {
        id: 'signal_analysis',
        text: 'You analyze the signal from a safe distance, recording its patterns and frequencies. Your analysis suggests it might be artificial in origin, but unlike any known technology. The data would be of great interest to scientific researchers.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 5 }
        ],
        flagsSet: ['signal_data'],
        unlocksLocations: ['frontier_outpost', 'research_station'],
        allowStageProgress: true
      },
      {
        id: 'mystic_interest',
        text: 'You transmit the signal data to a known Mystic outpost. They respond with immediate interest and request a meeting. Their representative believes the signal may be connected to phenomena they\'ve been studying for centuries and offers to share their insights with you.',
        reputationChanges: [
          { faction: Faction.Mystics, change: 10 }
        ],
        flagsSet: ['mystic_contact'],
        unlocksLocations: ['frontier_outpost', 'mystic_sanctuary'],
        allowStageProgress: true
      }
    ]
  },
  
  // Stage 1 Variant 5: Pirate Ambush
  {
    id: 'pirate_ambush',
    title: 'Unexpected Ambush',
    description: 'While traveling through a supposedly safe sector, your ship is suddenly targeted by what appears to be a small group of pirate vessels demanding you surrender your cargo and credits.',
    stage: 1,
    variant: 5,
    storylines: [StorylineTheme.Syndicate, StorylineTheme.Rebellion],
    location: 'ship',
    choices: [
      {
        id: 'fight_back',
        text: 'Engage defensive systems and fight back',
        outcome: 'repel_pirates'
      },
      {
        id: 'negotiate',
        text: 'Attempt to negotiate with the pirates',
        outcome: 'pirate_deal'
      },
      {
        id: 'flee',
        text: 'Attempt emergency maneuvers to escape',
        outcome: 'narrow_escape'
      }
    ],
    outcomes: [
      {
        id: 'repel_pirates',
        text: 'You engage your ship\'s weapons systems and manage to disable two of the pirate vessels. The remaining ships retreat, and you salvage some useful components from the damaged vessels before continuing on your journey.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 5 },
          { faction: Faction.Syndicate, change: -5 }
        ],
        itemsGiven: ['pulse_pistol'],
        flagsSet: ['fought_pirates'],
        unlocksLocations: ['frontier_outpost'],
        allowStageProgress: true
      },
      {
        id: 'pirate_deal',
        text: 'You open communications and discover the "pirates" are actually displaced miners who lost their livelihoods when a large corporation took over their asteroid belt. You offer them a small payment in exchange for information about upcoming corporate shipments, establishing a mutually beneficial arrangement.',
        reputationChanges: [
          { faction: Faction.Syndicate, change: 8 },
          { faction: Faction.Alliance, change: -3 }
        ],
        creditsRemoved: 200,
        flagsSet: ['pirate_informants'],
        unlocksLocations: ['frontier_outpost', 'syndicate_hideout'],
        allowStageProgress: true
      },
      {
        id: 'narrow_escape',
        text: 'You push your engines to maximum and execute a series of evasive maneuvers, narrowly escaping the pirate vessels. Your ship sustains minor damage in the process, but you manage to reach the safety of the Frontier Outpost where you report the pirate activity to local authorities.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 3 }
        ],
        flagsSet: ['escaped_pirates'],
        unlocksLocations: ['frontier_outpost'],
        allowStageProgress: true
      }
    ]
  },
  
  // ================ STAGE 2 MISSIONS (First 2 variants) ================
  // More will be added later
  
  // Stage 2 Variant 1: Alliance Investigation
  {
    id: 'alliance_investigation',
    title: 'Classified Investigation',
    description: 'An Alliance security officer at the Frontier Outpost approaches you with a confidential request to investigate unusual activity aboard the station.',
    stage: 2,
    variant: 1,
    storylines: [StorylineTheme.Alliance, StorylineTheme.Mystery],
    location: 'frontier_outpost',
    requiredSkillChecks: [
      {
        type: SkillType.Technical,
        level: 2,
        success: 'evidence_secured',
        failure: 'partial_evidence'
      }
    ],
    choices: [
      {
        id: 'accept_mission',
        text: 'Accept the investigation mission',
        outcome: 'begin_investigation'
      },
      {
        id: 'demand_details',
        text: 'Demand more details before accepting',
        outcome: 'mission_details'
      },
      {
        id: 'refuse_mission',
        text: 'Decline the mission',
        outcome: 'decline_investigation'
      }
    ],
    outcomes: [
      {
        id: 'begin_investigation',
        text: 'You agree to help and are briefed on the mission. The security officer suspects information is being leaked from the station to the Syndicate. Using your access to the station\'s common areas, you begin gathering evidence.',
        flagsSet: ['investigation_active'],
        nextMission: 'investigation_evidence',
        allowStageProgress: false
      },
      {
        id: 'mission_details',
        text: 'When pressed for details, the officer reveals that they suspect a high-ranking station official of selling classified information to the Syndicate. They need an outsider to gather evidence without raising suspicion. With this information, you can decide whether to help the Alliance or potentially warn the suspect.',
        flagsSet: ['knows_investigation_details'],
        nextMission: 'investigation_choice',
        allowStageProgress: false
      },
      {
        id: 'decline_investigation',
        text: 'You politely decline the officer\'s request, preferring not to get involved in Alliance security matters. The officer is disappointed but understands your position.',
        reputationChanges: [
          { faction: Faction.Alliance, change: -3 }
        ],
        allowStageProgress: true
      },
      {
        id: 'evidence_secured',
        text: 'Your technical skills allow you to access restricted communication logs, where you find clear evidence of classified information being transmitted to an external source. You turn your findings over to the Alliance officer, who is impressed by your thoroughness.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 15 },
          { faction: Faction.Syndicate, change: -5 }
        ],
        creditsGiven: 800,
        itemsGiven: ['alliance_insignia'],
        flagsSet: ['investigation_success'],
        allowStageProgress: true
      },
      {
        id: 'partial_evidence',
        text: 'Despite your best efforts, you\'re only able to gather circumstantial evidence. The Alliance officer appreciates your help but mentions that they\'ll need to continue the investigation with more specialized personnel.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 8 }
        ],
        creditsGiven: 400,
        flagsSet: ['investigation_partial'],
        allowStageProgress: true
      }
    ]
  },
  
  // Stage 2 Variant 2: Artifact Discovery
  {
    id: 'artifact_discovery',
    title: 'Ancient Discovery',
    description: 'While exploring the marketplace at the Frontier Outpost, you notice an unusual object being sold by an elderly merchant who claims it was found in the ruins of an ancient civilization.',
    stage: 2,
    variant: 2,
    storylines: [StorylineTheme.Artifact, StorylineTheme.Mystics, StorylineTheme.Mystery],
    location: 'frontier_outpost',
    choices: [
      {
        id: 'purchase_artifact',
        text: 'Purchase the artifact (500 credits)',
        outcome: 'artifact_purchased'
      },
      {
        id: 'examine_artifact',
        text: 'Ask to examine the artifact more closely',
        outcome: 'artifact_examination'
      },
      {
        id: 'inform_authorities',
        text: 'Inform Alliance authorities about the potentially illegal artifact',
        outcome: 'artifact_seized'
      }
    ],
    outcomes: [
      {
        id: 'artifact_purchased',
        text: 'You purchase the mysterious artifact for 500 credits. As you hold it, you feel a strange resonance, as if the object is somehow responsive to your thoughts. The merchant warns you to keep it hidden from authorities, as ancient artifacts fall under strict Alliance regulations.',
        reputationChanges: [
          { faction: Faction.Mystics, change: 5 }
        ],
        creditsRemoved: 500,
        itemsGiven: ['mysterious_artifact'],
        flagsSet: ['owns_artifact', 'artifact_resonance'],
        allowStageProgress: true
      },
      {
        id: 'artifact_examination',
        text: 'The merchant allows you to examine the artifact. Upon closer inspection, you notice unusual symbols etched into its surface that seem to shift and change as you observe them. The merchant offers to sell it at a discount, sensing your genuine interest.',
        flagsSet: ['artifact_knowledge'],
        nextMission: 'artifact_decision',
        allowStageProgress: false
      },
      {
        id: 'artifact_seized',
        text: 'You alert Alliance authorities about the potentially illegal artifact. Officers quickly arrive and confiscate the object, thanking you for your vigilance. The merchant is detained for questioning, shooting you a resentful glare as they\'re escorted away.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 10 },
          { faction: Faction.Independent, change: -5 },
          { faction: Faction.Mystics, change: -8 }
        ],
        creditsGiven: 200,
        flagsSet: ['reported_artifact'],
        allowStageProgress: true
      }
    ]
  }
  
  // More missions will be added for stages 2-20, with 5 variants each
];

// Create lookup table by mission ID
export const missionLookup: Record<string, MissionTemplate> = missionPool.reduce(
  (acc, mission) => {
    acc[mission.id] = mission;
    return acc;
  },
  {} as Record<string, MissionTemplate>
);

// Function to get available missions for a specific stage
export const getMissionsForStage = (
  stage: number,
  completedMissions: string[],
  flags: string[],
  reputation: Record<Faction, number>
): MissionTemplate[] => {
  return missionPool.filter(mission => 
    mission.stage === stage && 
    !completedMissions.includes(mission.id)
  );
};

// Function to check if a mission is available based on player state
export const isMissionAvailable = (
  mission: MissionTemplate,
  flags: string[],
  items: string[],
  reputation: Record<Faction, number>
): boolean => {
  // Base logic - can be expanded with more complex requirements
  // For now, we'll just check stage requirements
  return true;
};

// Function to get next mission based on outcome
export const getNextMission = (
  currentMission: MissionTemplate,
  outcomeId: string
): MissionTemplate | null => {
  const outcome = currentMission.outcomes.find(o => o.id === outcomeId);
  
  if (!outcome) return null;
  
  if (outcome.nextMission && missionLookup[outcome.nextMission]) {
    return missionLookup[outcome.nextMission];
  }
  
  if (outcome.allowStageProgress) {
    // Find any available mission from the next stage
    const nextStage = currentMission.stage + 1;
    const nextMissions = missionPool.filter(m => m.stage === nextStage);
    return nextMissions.length > 0 ? nextMissions[0] : null;
  }
  
  return null;
};