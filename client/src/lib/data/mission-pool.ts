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
  },
  
  // Stage 2 Variant 3: Void Entity Sighting
  {
    id: 'void_entity_sighting',
    title: 'Unknown Presence',
    description: 'Reports of strange energy signatures and unexplained phenomena have been coming from the fringes of the Proxima System.',
    stage: 2,
    variant: 3,
    storylines: [StorylineTheme.VoidEntity, StorylineTheme.Mystery],
    location: 'proxima_anomaly',
    choices: [
      {
        id: 'investigate_anomaly',
        text: 'Investigate the anomaly directly',
        outcome: 'void_encounter'
      },
      {
        id: 'scan_from_distance',
        text: 'Perform detailed scans from a safe distance',
        outcome: 'anomaly_data'
      },
      {
        id: 'report_to_mystics',
        text: 'Share information with the Order of the Cosmic Veil',
        outcome: 'mystic_approval'
      }
    ],
    outcomes: [
      {
        id: 'void_encounter',
        text: 'As you approach the anomaly, your ship\'s systems begin to fluctuate. Through the viewport, you glimpse what appears to be a shifting, ethereal form that defies description. Before you can investigate further, the entity vanishes, leaving behind unusual energy residue that your sensors struggle to categorize.',
        reputationChanges: [
          { faction: Faction.VoidEntity, change: 5 }
        ],
        flagsSet: ['encountered_void_entity'],
        unlocksLocations: ['mystic_sanctuary'],
        allowStageProgress: true
      },
      {
        id: 'anomaly_data',
        text: 'Your cautious approach yields valuable scientific data. The readings suggest the presence of an unknown form of energy that doesn\'t conform to standard physics. The Alliance would pay handsomely for this information, as would various research institutions.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 5 }
        ],
        flagsSet: ['anomaly_readings'],
        creditsGiven: 300,
        unlocksLocations: ['research_station'],
        allowStageProgress: true
      },
      {
        id: 'mystic_approval',
        text: 'The Order receives your information with great interest. According to their ancient texts, these signatures match entities they\'ve studied for centuries. They share some of their knowledge with you and request that you continue to provide them with any similar discoveries.',
        reputationChanges: [
          { faction: Faction.Mystics, change: 10 }
        ],
        flagsSet: ['mystic_collaboration'],
        unlocksLocations: ['mystic_sanctuary'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 2 Variant 4: Settlers' Struggle
  {
    id: 'settlers_struggle',
    title: 'Troubled Colony',
    description: 'A Settlers\' colony on the fringe of the system is experiencing critical resource shortages and has sent out a request for assistance.',
    stage: 2,
    variant: 4,
    storylines: [StorylineTheme.Settlers, StorylineTheme.Trade],
    location: 'struggling_colony',
    choices: [
      {
        id: 'deliver_supplies',
        text: 'Deliver essential supplies (costs 400 credits)',
        outcome: 'colony_saved'
      },
      {
        id: 'negotiate_trade',
        text: 'Establish a sustainable trade route',
        outcome: 'trade_agreement'
      },
      {
        id: 'report_syndicate',
        text: 'Inform the Syndicate about the vulnerable colony',
        outcome: 'syndicate_raid'
      }
    ],
    outcomes: [
      {
        id: 'colony_saved',
        text: 'You purchase and deliver critical supplies to the struggling colony. The settlers are immensely grateful and pledge to remember your generosity. They share some of their specialized technology with you as a token of appreciation.',
        reputationChanges: [
          { faction: Faction.Settlers, change: 15 }
        ],
        creditsRemoved: 400,
        itemsGiven: ['advanced_life_support'],
        flagsSet: ['helped_colony'],
        allowStageProgress: true
      },
      {
        id: 'trade_agreement',
        text: 'Rather than a one-time solution, you help the settlers establish reliable trade routes with nearby stations. This sustainable approach ensures their long-term survival and creates profitable opportunities for independent traders like yourself.',
        reputationChanges: [
          { faction: Faction.Settlers, change: 10 },
          { faction: Faction.Independent, change: 5 }
        ],
        flagsSet: ['trade_network'],
        creditsGiven: 200,
        allowStageProgress: true
      },
      {
        id: 'syndicate_raid',
        text: 'You alert the Syndicate to the colony\'s valuable resources and vulnerable state. They orchestrate a raid that acquires significant resources, giving you a substantial cut. The settlers are devastated and will struggle to recover from this setback.',
        reputationChanges: [
          { faction: Faction.Syndicate, change: 15 },
          { faction: Faction.Settlers, change: -20 }
        ],
        creditsGiven: 800,
        flagsSet: ['betrayed_settlers'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 2 Variant 5: Corporate Espionage
  {
    id: 'corporate_espionage',
    title: 'Industrial Secrets',
    description: 'A corporate executive discreetly approaches you with an offer to acquire sensitive information from a competing corporation\'s research facility.',
    stage: 2,
    variant: 5,
    storylines: [StorylineTheme.Syndicate, StorylineTheme.Alliance],
    location: 'corporate_hub',
    choices: [
      {
        id: 'accept_espionage',
        text: 'Accept the espionage mission',
        outcome: 'successful_theft'
      },
      {
        id: 'double_agent',
        text: 'Pretend to accept, but inform the target corporation',
        outcome: 'corporate_favor'
      },
      {
        id: 'refuse_corporate',
        text: 'Refuse to get involved in corporate warfare',
        outcome: 'maintain_neutrality'
      }
    ],
    outcomes: [
      {
        id: 'successful_theft',
        text: 'You successfully infiltrate the research facility and extract the requested data. The executive pays you handsomely, but you can\'t shake the feeling that you\'ve made powerful enemies in the corporate world.',
        reputationChanges: [
          { faction: Faction.Syndicate, change: 10 },
          { faction: Faction.Alliance, change: -10 }
        ],
        creditsGiven: 1200,
        flagsSet: ['corporate_espionage'],
        allowStageProgress: true
      },
      {
        id: 'corporate_favor',
        text: 'You alert the target corporation to the planned espionage. Grateful for your integrity, they offer you a legitimate consulting position and provide valuable insights about the executive who tried to compromise their security.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 15 },
          { faction: Faction.Syndicate, change: -5 }
        ],
        creditsGiven: 800,
        flagsSet: ['corporate_ally'],
        allowStageProgress: true
      },
      {
        id: 'maintain_neutrality',
        text: 'You decline the offer, preferring to avoid becoming entangled in corporate politics. The executive is disappointed but respects your decision. You maintain your reputation as an independent operator who can\'t be bought.',
        reputationChanges: [
          { faction: Faction.Independent, change: 5 }
        ],
        flagsSet: ['refused_corporate'],
        allowStageProgress: true
      }
    ]
  },

  // ================ STAGE 3 MISSIONS (5 variants) ================
  
  // Stage 3 Variant 1: Ancient Ruins
  {
    id: 'ancient_ruins',
    title: 'Forgotten Civilization',
    description: 'Explorers have discovered ruins of an ancient civilization on a distant planet. Various factions are racing to claim and study this archaeological find.',
    stage: 3,
    variant: 1,
    storylines: [StorylineTheme.Artifact, StorylineTheme.Exploration],
    location: 'ancient_ruins',
    choices: [
      {
        id: 'lead_expedition',
        text: 'Lead an independent research expedition',
        outcome: 'archaeological_discovery'
      },
      {
        id: 'alliance_research',
        text: 'Join the Alliance scientific team',
        outcome: 'scientific_contribution'
      },
      {
        id: 'mystic_guidance',
        text: 'Seek the Mystics\' interpretation of the ruins',
        outcome: 'ancient_knowledge'
      }
    ],
    outcomes: [
      {
        id: 'archaeological_discovery',
        text: 'Your independent expedition uncovers artifacts and symbols that hint at an advanced civilization that vanished millennia ago. The freedom to pursue your own research leads to unique insights that more structured teams might have missed.',
        reputationChanges: [
          { faction: Faction.Independent, change: 10 }
        ],
        itemsGiven: ['ancient_relic'],
        flagsSet: ['ruins_explorer'],
        allowStageProgress: true
      },
      {
        id: 'scientific_contribution',
        text: 'Working with the Alliance team, you help document and catalog the ruins using cutting-edge technology. Your findings will be published in scientific journals across the sector, establishing your reputation as a serious researcher.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 15 }
        ],
        creditsGiven: 500,
        flagsSet: ['alliance_researcher'],
        allowStageProgress: true
      },
      {
        id: 'ancient_knowledge',
        text: 'The Mystics guide you through the ruins, revealing interpretations based on their ancient texts. They believe this civilization achieved a form of transcendence through their understanding of void energy. The knowledge they share with you seems both profound and unsettling.',
        reputationChanges: [
          { faction: Faction.Mystics, change: 15 }
        ],
        flagsSet: ['void_knowledge'],
        unlocksLocations: ['mystic_inner_sanctum'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 3 Variant 2: Void Incursion
  {
    id: 'void_incursion',
    title: 'Reality Breach',
    description: 'A research station studying spatial anomalies has gone silent after reporting unusual readings. The last transmission mentioned "entities emerging from the void."',
    stage: 3,
    variant: 2,
    storylines: [StorylineTheme.VoidEntity, StorylineTheme.Alliance],
    location: 'research_station',
    choices: [
      {
        id: 'rescue_mission',
        text: 'Mount a rescue mission to the station',
        outcome: 'survivors_rescued'
      },
      {
        id: 'quarantine_station',
        text: 'Enforce quarantine and study from a distance',
        outcome: 'contained_threat'
      },
      {
        id: 'communicate_entities',
        text: 'Attempt to communicate with the entities',
        outcome: 'void_connection'
      }
    ],
    outcomes: [
      {
        id: 'survivors_rescued',
        text: 'You dock with the station and find it in disarray. Most of the crew are dead or missing, but you manage to rescue a few survivors who describe witnessing impossible geometries and beings that shouldn\'t exist. The Alliance commends your bravery but quarantines the survivors for observation.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 10 },
          { faction: Faction.VoidEntity, change: -5 }
        ],
        flagsSet: ['station_rescuer'],
        allowStageProgress: true
      },
      {
        id: 'contained_threat',
        text: 'You establish a perimeter around the station and conduct remote observations. The entities appear to be confined to the station, unable to exist beyond its walls. Your data about their behavior proves invaluable to understanding the nature of void incursions.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 15 }
        ],
        creditsGiven: 600,
        flagsSet: ['void_researcher'],
        allowStageProgress: true
      },
      {
        id: 'void_connection',
        text: 'Using modified communication arrays, you establish rudimentary contact with the entities. They seem to perceive reality differently, existing in multiple dimensions simultaneously. After the encounter, you experience strange dreams and find yourself occasionally able to perceive things others cannot.',
        reputationChanges: [
          { faction: Faction.VoidEntity, change: 20 },
          { faction: Faction.Mystics, change: 10 },
          { faction: Faction.Alliance, change: -10 }
        ],
        flagsSet: ['void_speaker'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 3 Variant 3: Syndicate War
  {
    id: 'syndicate_war',
    title: 'Underworld Conflict',
    description: 'A full-scale war has erupted between rival Syndicate factions, disrupting trade routes and threatening civilian populations throughout the sector.',
    stage: 3,
    variant: 3,
    storylines: [StorylineTheme.Syndicate, StorylineTheme.Trade],
    location: 'contested_station',
    choices: [
      {
        id: 'negotiate_peace',
        text: 'Attempt to negotiate peace between the factions',
        outcome: 'syndicate_mediator'
      },
      {
        id: 'support_faction',
        text: 'Support the faction with the strongest leadership',
        outcome: 'syndicate_ally'
      },
      {
        id: 'alliance_intervention',
        text: 'Request Alliance intervention to restore order',
        outcome: 'alliance_peacekeepers'
      }
    ],
    outcomes: [
      {
        id: 'syndicate_mediator',
        text: 'Using your reputation and diplomatic skills, you arrange talks between the faction leaders. After tense negotiations, they reach an agreement to divide territories and establish rules of engagement that minimize civilian casualties. Both sides respect your neutrality and wisdom.',
        reputationChanges: [
          { faction: Faction.Syndicate, change: 15 },
          { faction: Faction.Independent, change: 10 }
        ],
        flagsSet: ['syndicate_peacemaker'],
        allowStageProgress: true
      },
      {
        id: 'syndicate_ally',
        text: 'You throw your support behind the faction with the most competent leadership, helping them secure victory. The war ends more quickly as a result, and you gain a powerful ally in the unified Syndicate. However, the defeated faction\'s survivors hold a grudge against you.',
        reputationChanges: [
          { faction: Faction.Syndicate, change: 20 },
          { faction: Faction.Alliance, change: -10 }
        ],
        flagsSet: ['syndicate_enforcer'],
        unlocksLocations: ['syndicate_headquarters'],
        allowStageProgress: true
      },
      {
        id: 'alliance_peacekeepers',
        text: 'The Alliance sends a peacekeeping fleet in response to your request. They establish order by force, arresting faction leaders and imposing strict regulations. While this ends the immediate conflict, it pushes Syndicate operations further underground and creates resentment toward both the Alliance and yourself.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 15 },
          { faction: Faction.Syndicate, change: -20 }
        ],
        flagsSet: ['alliance_informant'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 3 Variant 4: Colonial Uprising
  {
    id: 'colonial_uprising',
    title: 'Fight for Independence',
    description: 'A major Settlers\' colony has declared independence from Alliance oversight, citing exploitation and neglect. Tensions are high as both sides prepare for possible conflict.',
    stage: 3,
    variant: 4,
    storylines: [StorylineTheme.Settlers, StorylineTheme.Rebellion],
    location: 'rebel_colony',
    choices: [
      {
        id: 'support_rebels',
        text: 'Support the colonists\' bid for independence',
        outcome: 'independence_fighter'
      },
      {
        id: 'advocate_compromise',
        text: 'Advocate for a peaceful compromise',
        outcome: 'colonial_diplomat'
      },
      {
        id: 'alliance_loyalty',
        text: 'Support Alliance authority in the region',
        outcome: 'alliance_supporter'
      }
    ],
    outcomes: [
      {
        id: 'independence_fighter',
        text: 'You provide tactical support and resources to the colonists, helping them establish defensive positions and communication networks. Your assistance proves crucial when Alliance forces attempt to reassert control, resulting in a negotiated withdrawal and de facto independence for the colony.',
        reputationChanges: [
          { faction: Faction.Settlers, change: 20 },
          { faction: Faction.Alliance, change: -15 }
        ],
        flagsSet: ['independence_hero'],
        unlocksLocations: ['free_colony'],
        allowStageProgress: true
      },
      {
        id: 'colonial_diplomat',
        text: 'You shuttle between colonial leaders and Alliance representatives, gradually building a framework for compromise. The resulting agreement grants the colony significant autonomy while maintaining nominal Alliance membership, with improved terms for resource sharing and development assistance.',
        reputationChanges: [
          { faction: Faction.Settlers, change: 10 },
          { faction: Faction.Alliance, change: 10 }
        ],
        creditsGiven: 700,
        flagsSet: ['respected_mediator'],
        allowStageProgress: true
      },
      {
        id: 'alliance_supporter',
        text: 'You provide intelligence and support to Alliance forces, believing that stable central governance is necessary for the sector\'s prosperity. The uprising is quickly suppressed, and while the colony returns to Alliance control with promises of reform, many settlers view you with suspicion and resentment.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 20 },
          { faction: Faction.Settlers, change: -20 }
        ],
        creditsGiven: 1000,
        flagsSet: ['alliance_loyalist'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 3 Variant 5: Mystic Prophecy
  {
    id: 'mystic_prophecy',
    title: 'Cosmic Alignment',
    description: 'The Order of the Cosmic Veil is performing an ancient ritual during a rare stellar alignment. They claim it will provide insights into the future of humanity among the stars.',
    stage: 3,
    variant: 5,
    storylines: [StorylineTheme.Mystics, StorylineTheme.Mystery],
    location: 'mystic_sanctuary',
    choices: [
      {
        id: 'participate_ritual',
        text: 'Participate in the mystical ritual',
        outcome: 'cosmic_vision'
      },
      {
        id: 'observe_scientifically',
        text: 'Observe and document the event scientifically',
        outcome: 'scientific_observation'
      },
      {
        id: 'disrupt_ritual',
        text: 'Attempt to disrupt the potentially dangerous ritual',
        outcome: 'ritual_disruption'
      }
    ],
    outcomes: [
      {
        id: 'cosmic_vision',
        text: 'You join the ritual circle as the stars align. During the ceremony, you experience vivid visions of possible futures - some filled with light and advancement, others with darkness and void entities. When you awaken, you find yourself changed, with a deeper connection to the cosmic forces the Mystics revere.',
        reputationChanges: [
          { faction: Faction.Mystics, change: 20 },
          { faction: Faction.VoidEntity, change: 5 }
        ],
        flagsSet: ['cosmic_initiate', 'had_vision'],
        allowStageProgress: true
      },
      {
        id: 'scientific_observation',
        text: 'You set up monitoring equipment to record the ritual and the stellar alignment. Your instruments detect unusual energy patterns during the ceremony that defy conventional explanation. The data you collect is invaluable to researchers studying the intersection of ancient practices and mysterious cosmic phenomena.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 10 },
          { faction: Faction.Mystics, change: 5 }
        ],
        creditsGiven: 500,
        flagsSet: ['phenomenon_researcher'],
        allowStageProgress: true
      },
      {
        id: 'ritual_disruption',
        text: 'Concerned about potentially dangerous manipulation of unknown forces, you interrupt the ritual at its critical moment. The energy that had been building is dispersed chaotically, causing minor injuries and significant outrage among the Mystics. However, you notice strange entities retreating at the edges of your vision, suggesting the ceremony may have been opening a doorway better left closed.',
        reputationChanges: [
          { faction: Faction.Mystics, change: -20 },
          { faction: Faction.Alliance, change: 5 },
          { faction: Faction.VoidEntity, change: -10 }
        ],
        flagsSet: ['ritual_breaker'],
        allowStageProgress: true
      }
    ]
  },

  // ================ STAGE 4 MISSIONS (5 variants) ================
  
  // Stage 4 Variant 1: Alliance-Syndicate Conflict
  {
    id: 'sector_war',
    title: 'Brink of War',
    description: 'Open conflict has erupted between Alliance forces and the unified Syndicate, threatening to engulf the entire sector in a devastating war.',
    stage: 4,
    variant: 1,
    storylines: [StorylineTheme.Alliance, StorylineTheme.Syndicate, StorylineTheme.Rebellion],
    location: 'contested_space',
    choices: [
      {
        id: 'alliance_campaign',
        text: 'Join the Alliance military campaign',
        outcome: 'alliance_officer'
      },
      {
        id: 'syndicate_operation',
        text: 'Support Syndicate resistance operations',
        outcome: 'syndicate_commander'
      },
      {
        id: 'sector_evacuation',
        text: 'Help evacuate civilians from conflict zones',
        outcome: 'humanitarian_effort'
      }
    ],
    outcomes: [
      {
        id: 'alliance_officer',
        text: 'You offer your ship and skills to the Alliance fleet, quickly earning a position of respect among their officers. Your tactical insights help secure several key victories, pushing Syndicate forces back to their core territories. The Alliance rewards your service with military honors and access to advanced technology.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 25 },
          { faction: Faction.Syndicate, change: -25 }
        ],
        itemsGiven: ['alliance_prototype_weapon'],
        flagsSet: ['alliance_war_hero'],
        allowStageProgress: true
      },
      {
        id: 'syndicate_commander',
        text: 'You join the Syndicate\'s asymmetric warfare campaign, using your knowledge of Alliance protocols to devastating effect. Under your guidance, Syndicate strike teams disable key Alliance infrastructure without excessive casualties, forcing the Alliance to reconsider their offensive strategy and come to the negotiating table.',
        reputationChanges: [
          { faction: Faction.Syndicate, change: 25 },
          { faction: Faction.Alliance, change: -25 }
        ],
        itemsGiven: ['syndicate_stealth_technology'],
        flagsSet: ['syndicate_strategist'],
        allowStageProgress: true
      },
      {
        id: 'humanitarian_effort',
        text: 'Rejecting both sides of the conflict, you organize a coalition of independent captains to evacuate civilians from battle zones. Your humanitarian convoy navigates the front lines, saving thousands of lives and establishing safe havens beyond the reach of the warring factions. Both sides come to respect your neutral stance and the moral authority it represents.',
        reputationChanges: [
          { faction: Faction.Independent, change: 20 },
          { faction: Faction.Settlers, change: 15 },
          { faction: Faction.Alliance, change: 5 },
          { faction: Faction.Syndicate, change: 5 }
        ],
        flagsSet: ['humanitarian_leader'],
        unlocksLocations: ['refugee_haven'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 4 Variant 2: Void Convergence
  {
    id: 'void_convergence',
    title: 'Thinning Veil',
    description: 'Multiple void incursions have been reported throughout the sector, occurring with increasing frequency and intensity. Something is weakening the barrier between realities.',
    stage: 4,
    variant: 2,
    storylines: [StorylineTheme.VoidEntity, StorylineTheme.Mystics, StorylineTheme.Mystery],
    location: 'void_nexus',
    choices: [
      {
        id: 'seal_breach',
        text: 'Work with scientists to seal the dimensional breaches',
        outcome: 'reality_anchor'
      },
      {
        id: 'mystic_solution',
        text: 'Seek the Mystics\' ancient methods of containing void entities',
        outcome: 'veil_guardian'
      },
      {
        id: 'void_communion',
        text: 'Attempt to communicate with the void entities to understand their purpose',
        outcome: 'void_interpreter'
      }
    ],
    outcomes: [
      {
        id: 'reality_anchor',
        text: 'Collaborating with Alliance scientists, you develop technology that can stabilize reality at incursion points. Deploying these "reality anchors" at key locations successfully reduces the frequency and severity of void breaches. Your scientific approach earns recognition throughout the academic community.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 20 },
          { faction: Faction.VoidEntity, change: -15 }
        ],
        itemsGiven: ['reality_stabilizer'],
        flagsSet: ['dimensional_scientist'],
        allowStageProgress: true
      },
      {
        id: 'veil_guardian',
        text: 'The Mystics teach you ancient rituals and symbols that strengthen the boundaries between realities. As you perform these ceremonies at breach sites, you experience strange visions but successfully contain the incursions. The Mystics recognize you as a guardian of the veil between worlds.',
        reputationChanges: [
          { faction: Faction.Mystics, change: 25 },
          { faction: Faction.VoidEntity, change: -10 }
        ],
        flagsSet: ['veil_keeper'],
        unlocksLocations: ['mystic_inner_sanctum'],
        allowStageProgress: true
      },
      {
        id: 'void_interpreter',
        text: 'Using techniques developed from previous entity encounters, you establish meaningful contact with the void beings. You learn they aren\'t invading but fleeing something in their own realm. Their incursions are unintentional, caused by desperation. This understanding changes the sector\'s approach to void phenomena completely.',
        reputationChanges: [
          { faction: Faction.VoidEntity, change: 30 },
          { faction: Faction.Mystics, change: 15 },
          { faction: Faction.Alliance, change: 10 }
        ],
        flagsSet: ['void_diplomat', 'knows_void_threat'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 4 Variant 3: Artifact Activation
  {
    id: 'artifact_activation',
    title: 'Ancient Awakening',
    description: 'Artifacts discovered throughout the sector have begun emitting energy signatures and responding to each other, forming a network of unknown purpose.',
    stage: 4,
    variant: 3,
    storylines: [StorylineTheme.Artifact, StorylineTheme.Mystery, StorylineTheme.Exploration],
    location: 'artifact_nexus',
    choices: [
      {
        id: 'study_network',
        text: 'Study the artifact network scientifically',
        outcome: 'technological_breakthrough'
      },
      {
        id: 'disrupt_activation',
        text: 'Attempt to disrupt the potentially dangerous activation',
        outcome: 'activation_prevented'
      },
      {
        id: 'accelerate_process',
        text: 'Help complete the artifact network activation',
        outcome: 'ancient_technology_unlocked'
      }
    ],
    outcomes: [
      {
        id: 'technological_breakthrough',
        text: 'Your methodical research reveals that the artifacts are components of an ancient communication system. As you document the network\'s activation, you gain insights into technologies far beyond current understanding. Your findings spark a renaissance in several scientific fields.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 15 },
          { faction: Faction.Independent, change: 10 }
        ],
        creditsGiven: 1500,
        flagsSet: ['artifact_researcher'],
        allowStageProgress: true
      },
      {
        id: 'activation_prevented',
        text: 'Concerned about the unknown consequences, you develop a method to dampen the artifacts\' energy signatures. As you suppress their activation, you experience a brief vision of vast structures in space and feel an ancient presence notice your interference before fading away. The sector remains safe, but an opportunity may have been lost.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 20 },
          { faction: Faction.Mystics, change: -15 }
        ],
        flagsSet: ['precautionary_leader'],
        allowStageProgress: true
      },
      {
        id: 'ancient_technology_unlocked',
        text: 'You gather several key artifacts and bring them to the apparent nexus of the network. As they synchronize, a holographic interface appears, providing access to a repository of knowledge from a civilization that achieved interstellar travel millions of years ago. The implications of this discovery will reshape humanity\'s future among the stars.',
        reputationChanges: [
          { faction: Faction.Mystics, change: 20 },
          { faction: Faction.Alliance, change: 15 },
          { faction: Faction.Settlers, change: 10 }
        ],
        flagsSet: ['precursor_knowledge'],
        unlocksLocations: ['precursor_archive'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 4 Variant 4: Settlers' Revolution
  {
    id: 'settlers_revolution',
    title: 'Unified Uprising',
    description: 'Settlers colonies throughout the sector have united in a coordinated revolution against Alliance control, declaring a new independent federation.',
    stage: 4,
    variant: 4,
    storylines: [StorylineTheme.Settlers, StorylineTheme.Rebellion, StorylineTheme.Alliance],
    location: 'revolution_headquarters',
    choices: [
      {
        id: 'support_revolution',
        text: 'Support the Settlers\' revolution',
        outcome: 'revolution_champion'
      },
      {
        id: 'negotiate_autonomy',
        text: 'Negotiate a peaceful transition to colonial autonomy',
        outcome: 'diplomatic_solution'
      },
      {
        id: 'alliance_counter',
        text: 'Help the Alliance develop a counter-strategy',
        outcome: 'suppressed_rebellion'
      }
    ],
    outcomes: [
      {
        id: 'revolution_champion',
        text: 'You join the revolutionary leadership, providing tactical expertise and helping coordinate actions across multiple systems. Under your guidance, the revolution succeeds with minimal bloodshed, establishing the Independent Colonial Federation as a major new power in the sector.',
        reputationChanges: [
          { faction: Faction.Settlers, change: 30 },
          { faction: Faction.Alliance, change: -25 }
        ],
        flagsSet: ['revolution_leader'],
        unlocksLocations: ['federation_capital'],
        allowStageProgress: true
      },
      {
        id: 'diplomatic_solution',
        text: 'You shuttle between revolutionary leaders and Alliance officials, gradually building a framework for peaceful transition. The resulting Commonwealth Accords grant colonies self-governance while maintaining economic and defensive partnerships with the Alliance, avoiding a costly war and creating a more equitable relationship.',
        reputationChanges: [
          { faction: Faction.Settlers, change: 20 },
          { faction: Faction.Alliance, change: 15 }
        ],
        creditsGiven: 1000,
        flagsSet: ['peace_architect'],
        allowStageProgress: true
      },
      {
        id: 'suppressed_rebellion',
        text: 'You provide the Alliance with intelligence on revolutionary plans and weaknesses. This allows for precise operations that capture key leaders and disrupt coordination between colonies. The revolution collapses, and while the Alliance implements some reforms to address legitimate grievances, the Settlers\' dream of independence is deferred indefinitely.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 25 },
          { faction: Faction.Settlers, change: -30 }
        ],
        creditsGiven: 2000,
        flagsSet: ['alliance_enforcer'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 4 Variant 5: Syndicate Evolution
  {
    id: 'syndicate_evolution',
    title: 'Criminal Legacy',
    description: 'The Syndicate\'s leadership is in transition, with competing visions for its future: continue as a criminal organization or evolve into a legitimate power.',
    stage: 4,
    variant: 5,
    storylines: [StorylineTheme.Syndicate, StorylineTheme.Trade],
    location: 'syndicate_headquarters',
    choices: [
      {
        id: 'criminal_enterprise',
        text: 'Support the traditional criminal enterprise model',
        outcome: 'syndicate_enforcer'
      },
      {
        id: 'legitimate_transition',
        text: 'Back the transition to legitimate business and politics',
        outcome: 'syndicate_reformer'
      },
      {
        id: 'dismantle_syndicate',
        text: 'Work covertly to destabilize and dismantle the Syndicate',
        outcome: 'syndicate_downfall'
      }
    ],
    outcomes: [
      {
        id: 'syndicate_enforcer',
        text: 'You help the traditional faction secure control, eliminating rivals and modernizing their operations. Under your guidance, the Syndicate expands its criminal enterprises while developing a sophisticated facade of legitimate businesses. Your position within the organization becomes unassailable.',
        reputationChanges: [
          { faction: Faction.Syndicate, change: 30 },
          { faction: Faction.Alliance, change: -20 }
        ],
        creditsGiven: 3000,
        flagsSet: ['syndicate_underboss'],
        allowStageProgress: true
      },
      {
        id: 'syndicate_reformer',
        text: 'You support the reformist faction, helping transform the Syndicate\'s vast resources and influence into legitimate businesses and political capital. The transition isn\'t seamless, but within months, the reformed Syndicate becomes a recognized economic and political force, challenging Alliance dominance through legal means.',
        reputationChanges: [
          { faction: Faction.Syndicate, change: 25 },
          { faction: Faction.Alliance, change: -10 },
          { faction: Faction.Independent, change: 15 }
        ],
        flagsSet: ['syndicate_reformer'],
        allowStageProgress: true
      },
      {
        id: 'syndicate_downfall',
        text: 'Working with Alliance intelligence, you infiltrate the Syndicate during its vulnerable transition period. Your inside information leads to precision strikes against key infrastructure and leadership, causing the organization to fragment into competing factions. The sector\'s criminal landscape is transformed, though smaller criminal groups rush to fill the vacuum.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 25 },
          { faction: Faction.Syndicate, change: -40 }
        ],
        creditsGiven: 2500,
        flagsSet: ['syndicate_destroyer'],
        allowStageProgress: true
      }
    ]
  },

  // ================ STAGE 5 MISSIONS (5 variants) ================
  
  // Stage 5 Variant 1: The Ancient Signal
  {
    id: 'ancient_signal',
    title: 'Call From Beyond',
    description: 'A signal of clearly artificial origin has been detected emanating from beyond the sector\'s edge. Initial analysis suggests it\'s millions of years old.',
    stage: 5,
    variant: 1,
    storylines: [StorylineTheme.Exploration, StorylineTheme.Mystery, StorylineTheme.Artifact],
    location: 'sector_edge',
    choices: [
      {
        id: 'lead_expedition',
        text: 'Lead an expedition to trace the signal to its source',
        outcome: 'precursor_discovery'
      },
      {
        id: 'analyze_signal',
        text: 'Work with scientists to decode the signal\'s message',
        outcome: 'ancient_message'
      },
      {
        id: 'cautious_approach',
        text: 'Advocate for caution and thorough preparation before response',
        outcome: 'measured_response'
      }
    ],
    outcomes: [
      {
        id: 'precursor_discovery',
        text: 'Your expedition ventures beyond known space, following the signal to a massive artificial structure orbiting a dying star. This megastructure appears to be a repository of knowledge left by a civilization that ascended beyond physical form eons ago. The discovery will forever change humanity\'s understanding of its place in the cosmos.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 20 },
          { faction: Faction.Mystics, change: 20 },
          { faction: Faction.Independent, change: 20 }
        ],
        flagsSet: ['precursor_finder'],
        unlocksLocations: ['precursor_megastructure'],
        allowStageProgress: true
      },
      {
        id: 'ancient_message',
        text: 'After months of analysis, you and a team of xenolinguists and mathematicians decipher the signal. It contains star charts identifying habitable worlds throughout the galaxy, technological blueprints for faster-than-light travel beyond current capabilities, and philosophical concepts that suggest a path to evolutionary transcendence.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 25 },
          { faction: Faction.Mystics, change: 15 }
        ],
        creditsGiven: 5000,
        flagsSet: ['signal_decoder'],
        allowStageProgress: true
      },
      {
        id: 'measured_response',
        text: 'You convince sector authorities to establish a research facility dedicated to studying the signal before taking any action. This cautious approach uncovers hidden elements in the transmission that could have been catastrophic if mishandled. Your prudence potentially saved countless lives while still advancing knowledge of the ancient civilization.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 15 },
          { faction: Faction.Settlers, change: 15 },
          { faction: Faction.Syndicate, change: 10 }
        ],
        flagsSet: ['prudent_leader'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 5 Variant 2: Void Entity Invasion
  {
    id: 'void_invasion',
    title: 'The Veil Tears',
    description: 'The barrier between dimensions has catastrophically failed. Void entities are appearing throughout the sector in unprecedented numbers.',
    stage: 5,
    variant: 2,
    storylines: [StorylineTheme.VoidEntity, StorylineTheme.Alliance, StorylineTheme.Mystics],
    location: 'major_breach',
    choices: [
      {
        id: 'military_response',
        text: 'Coordinate military response against the incursion',
        outcome: 'void_defender'
      },
      {
        id: 'seal_breaches',
        text: 'Focus on sealing dimensional breaches',
        outcome: 'reality_weaver'
      },
      {
        id: 'void_diplomacy',
        text: 'Attempt diplomatic contact with void entity leadership',
        outcome: 'void_ambassador'
      }
    ],
    outcomes: [
      {
        id: 'void_defender',
        text: 'You organize a coordinated defense force combining Alliance military, Syndicate guerrilla tactics, and Settlers\' knowledge of their territories. This unified approach successfully contains the invasion to specific zones, allowing civilians to evacuate and scientists to develop more permanent solutions.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 20 },
          { faction: Faction.Syndicate, change: 15 },
          { faction: Faction.Settlers, change: 15 },
          { faction: Faction.VoidEntity, change: -25 }
        ],
        flagsSet: ['defense_coordinator'],
        allowStageProgress: true
      },
      {
        id: 'reality_weaver',
        text: 'Working with Mystic adepts and Alliance scientists, you develop a method to repair the dimensional barriers. The process is dangerous and requires you to physically enter breach zones, but your efforts successfully close major incursion points. During the final sealing, you glimpse the void entities\' realm and understand they were fleeing something far worse.',
        reputationChanges: [
          { faction: Faction.Mystics, change: 25 },
          { faction: Faction.Alliance, change: 20 },
          { faction: Faction.VoidEntity, change: -15 }
        ],
        flagsSet: ['dimensional_healer', 'glimpsed_greater_void'],
        allowStageProgress: true
      },
      {
        id: 'void_ambassador',
        text: 'Drawing on previous void entity encounters, you establish meaningful communication with what appears to be their leadership collective. You learn they entered our dimension accidentally while fleeing an annihilating force in their own realm. By helping them find a safe path to another dimension, you end the crisis and gain insights into realities beyond human comprehension.',
        reputationChanges: [
          { faction: Faction.VoidEntity, change: 40 },
          { faction: Faction.Mystics, change: 20 },
          { faction: Faction.Alliance, change: 10 }
        ],
        flagsSet: ['void_diplomat', 'knows_cosmic_threat'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 5 Variant 3: Galactic Federation Contact
  {
    id: 'galactic_contact',
    title: 'First Contact',
    description: 'A massive unidentified vessel has appeared at the sector\'s edge, broadcasting a message of peaceful contact from the Galactic Federation, an interstellar alliance of civilizations.',
    stage: 5,
    variant: 3,
    storylines: [StorylineTheme.Exploration, StorylineTheme.Alliance, StorylineTheme.Trade],
    location: 'federation_contact_point',
    choices: [
      {
        id: 'welcome_federation',
        text: 'Lead a welcoming delegation to establish formal relations',
        outcome: 'diplomatic_envoy'
      },
      {
        id: 'cautious_verification',
        text: 'Insist on verification and gradual contact protocols',
        outcome: 'careful_integration'
      },
      {
        id: 'reject_interference',
        text: 'Advocate for maintaining independence from outside influence',
        outcome: 'independence_champion'
      }
    ],
    outcomes: [
      {
        id: 'diplomatic_envoy',
        text: 'You lead a diverse delegation representing all major factions to greet the Federation representatives. Your open approach accelerates diplomatic relations, and the Federation officially recognizes humanity as an emerging spacefaring civilization. They offer technology, knowledge, and trade opportunities that will advance human development by centuries.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 25 },
          { faction: Faction.Settlers, change: 20 },
          { faction: Faction.Syndicate, change: 15 },
          { faction: Faction.Mystics, change: 15 }
        ],
        flagsSet: ['federation_envoy'],
        unlocksLocations: ['federation_embassy'],
        allowStageProgress: true
      },
      {
        id: 'careful_integration',
        text: 'You implement a careful verification protocol before full contact, studying the Federation\'s technology and intentions. This prudent approach uncovers no threats but earns respect from the Federation, who appreciate your species\' caution. The resulting contact proceeds more slowly but with greater security and mutual trust.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 20 },
          { faction: Faction.Independent, change: 15 },
          { faction: Faction.Settlers, change: 15 }
        ],
        flagsSet: ['contact_protocol_designer'],
        allowStageProgress: true
      },
      {
        id: 'independence_champion',
        text: 'You persuade sector leadership to maintain distance from the Federation until humanity is more prepared for interstellar politics. Your arguments highlight the risk of cultural contamination and technological dependence. The Federation respects this decision, establishing only a minimal observation post and agreeing to revisit formal relations when humanity reaches specific developmental milestones.',
        reputationChanges: [
          { faction: Faction.Independent, change: 30 },
          { faction: Faction.Syndicate, change: 20 },
          { faction: Faction.Alliance, change: 10 }
        ],
        flagsSet: ['independence_advocate'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 5 Variant 4: Unification Crisis
  {
    id: 'unification_crisis',
    title: 'Sector Summit',
    description: 'Representatives from all major factions have gathered for an unprecedented summit to address mounting crises and potentially form a unified sector government.',
    stage: 5,
    variant: 4,
    storylines: [StorylineTheme.Alliance, StorylineTheme.Settlers, StorylineTheme.Syndicate, StorylineTheme.Mystics],
    location: 'neutral_station',
    choices: [
      {
        id: 'support_unification',
        text: 'Advocate for full political unification',
        outcome: 'sector_unifier'
      },
      {
        id: 'federation_model',
        text: 'Propose a federated system preserving faction autonomy',
        outcome: 'federation_architect'
      },
      {
        id: 'maintain_independence',
        text: 'Argue against centralization of power',
        outcome: 'independence_defender'
      }
    ],
    outcomes: [
      {
        id: 'sector_unifier',
        text: 'Your impassioned arguments for unity in the face of external threats and internal challenges sway even the most skeptical delegates. After weeks of negotiation, the Unified Sector Accord is signed, creating a central government with proportional representation from all factions. This historic achievement begins a new era of cooperation and advancement.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 25 },
          { faction: Faction.Settlers, change: 15 },
          { faction: Faction.Syndicate, change: 15 },
          { faction: Faction.Mystics, change: 15 }
        ],
        flagsSet: ['unification_champion'],
        unlocksLocations: ['unity_capital'],
        allowStageProgress: true
      },
      {
        id: 'federation_architect',
        text: 'You develop a compromise model that balances centralized coordination with respect for each faction\'s unique identity and governance. The resulting Sector Federation creates unified defense, research, and diplomacy while preserving internal autonomy. This balanced approach satisfies most constituencies and creates a sustainable path forward.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 20 },
          { faction: Faction.Settlers, change: 20 },
          { faction: Faction.Syndicate, change: 15 },
          { faction: Faction.Mystics, change: 15 },
          { faction: Faction.Independent, change: 10 }
        ],
        flagsSet: ['federation_designer'],
        allowStageProgress: true
      },
      {
        id: 'independence_defender',
        text: 'You persuasively argue that centralization would stifle the diversity and adaptability that has allowed humanity to thrive among the stars. Instead of a unified government, you help establish formalized treaties and cooperation protocols that address specific challenges while preserving independence. This flexible approach ensures no single power can dominate the sector\'s future.',
        reputationChanges: [
          { faction: Faction.Independent, change: 30 },
          { faction: Faction.Syndicate, change: 20 },
          { faction: Faction.Settlers, change: 15 },
          { faction: Faction.Alliance, change: -5 }
        ],
        flagsSet: ['sovereignty_champion'],
        allowStageProgress: true
      }
    ]
  },

  // Stage 5 Variant 5: Cosmic Legacy
  {
    id: 'cosmic_legacy',
    title: 'Beyond the Stars',
    description: 'A convergence of ancient artifacts, void phenomena, and cosmic alignments has created a unique opportunity to access what the Mystics call the "Celestial Archive" - a repository of knowledge from all civilizations that have achieved transcendence.',
    stage: 5,
    variant: 5,
    storylines: [StorylineTheme.Mystics, StorylineTheme.Mystery, StorylineTheme.Artifact, StorylineTheme.VoidEntity],
    location: 'ascension_nexus',
    choices: [
      {
        id: 'access_archive',
        text: 'Attempt to access the Celestial Archive',
        outcome: 'cosmic_initiate'
      },
      {
        id: 'study_phenomenon',
        text: 'Study the phenomenon scientifically without direct interaction',
        outcome: 'cosmic_researcher'
      },
      {
        id: 'prevent_access',
        text: 'Work to prevent potentially dangerous access to cosmic powers',
        outcome: 'reality_guardian'
      }
    ],
    outcomes: [
      {
        id: 'cosmic_initiate',
        text: 'You journey to the convergence point and, following mystical protocols and scientific principles, successfully establish connection with the Celestial Archive. The experience transforms you, granting insights into the nature of reality and humanity\'s potential evolutionary path. You return with knowledge that will guide your civilization for generations to come.',
        reputationChanges: [
          { faction: Faction.Mystics, change: 30 },
          { faction: Faction.VoidEntity, change: 20 },
          { faction: Faction.Alliance, change: 15 },
          { faction: Faction.Independent, change: 15 }
        ],
        flagsSet: ['transcendence_guide', 'accessed_archive'],
        allowStageProgress: true
      },
      {
        id: 'cosmic_researcher',
        text: 'You establish a scientific outpost to study the convergence from a safe distance, gathering unprecedented data about cosmic phenomena and possibly even the nature of consciousness itself. While you don\'t access the Archive directly, your research provides a scientific framework for understanding transcendent experiences and technologies.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 25 },
          { faction: Faction.Mystics, change: 15 },
          { faction: Faction.Independent, change: 15 }
        ],
        creditsGiven: 10000,
        flagsSet: ['cosmic_scientist'],
        allowStageProgress: true
      },
      {
        id: 'reality_guardian',
        text: 'Concerned about the risks of tampering with forces beyond human comprehension, you lead efforts to contain and stabilize the convergence. While this prevents potential catastrophe, it also closes a rare opportunity for advancement. You establish permanent monitoring protocols to ensure similar phenomena can be safely managed in the future.',
        reputationChanges: [
          { faction: Faction.Alliance, change: 20 },
          { faction: Faction.Settlers, change: 20 },
          { faction: Faction.Mystics, change: -10 },
          { faction: Faction.VoidEntity, change: -15 }
        ],
        flagsSet: ['cosmic_guardian'],
        allowStageProgress: true
      }
    ]
  }
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