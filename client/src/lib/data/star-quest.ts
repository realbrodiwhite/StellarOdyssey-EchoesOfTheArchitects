import { v4 as uuidv4 } from 'uuid';
import { CharacterClass, Faction, SkillType } from '../types';

// Enums

export enum StoryOutcomeType {
  Reward = 'reward',
  Reputation = 'reputation',
  UnlockLocation = 'unlockLocation',
  UnlockQuest = 'unlockQuest',
  UnlockCompanion = 'unlockCompanion',
  Item = 'item',
  Experience = 'experience',
  SetFlag = 'setFlag',
  Combat = 'combat',
  Death = 'death',
  GameEnd = 'gameEnd'
}

export enum StoryBranch {
  Alliance = 'alliance',
  Syndicate = 'syndicate',
  Independent = 'independent',
  Mystics = 'mystics',
  Settlers = 'settlers',
  VoidEntity = 'voidEntity',
  Main = 'main'
}

export enum QuestState {
  Unavailable = 'unavailable',
  Available = 'available',
  InProgress = 'inProgress',
  Completed = 'completed',
  Failed = 'failed'
}

export enum StoryEnding {
  AllianceHero = 'allianceHero',
  SyndicateLeader = 'syndicateLeader',
  GalacticPeacemaker = 'galacticPeacemaker',
  CosmicEnlightenment = 'cosmicEnlightenment',
  LoneRanger = 'loneRanger',
  VoidCorruption = 'voidCorruption',
  Sacrifice = 'sacrifice',
  GalacticDomination = 'galacticDomination',
  ColonySavior = 'colonySavior'
}

// Interfaces

export interface StoryRequirement {
  type: 'item' | 'skill' | 'faction' | 'class' | 'flag' | 'location' | 'questCompleted';
  id?: string;
  value?: any;
  skillType?: SkillType;
  skillLevel?: number;
  faction?: Faction;
  reputationLevel?: number;
  characterClass?: CharacterClass;
  locationId?: string;
  questId?: string;
}

export interface StoryOutcome {
  type: StoryOutcomeType;
  value?: any; // Can be a number (for experience/reputation) or string (for flag/location)
  itemId?: string;
  factionId?: Faction;
  locationId?: string;
  questId?: string;
  companionId?: string;
  flagName?: string;
  combatId?: string;
  message?: string;
  ending?: StoryEnding;
}

export interface StoryChoice {
  id: string;
  text: string;
  requirements?: StoryRequirement[];
  outcomes: StoryOutcome[];
  nextQuestId?: string;
  nextStageId?: string;
}

export interface StoryStage {
  id: string;
  stageNumber: number;
  title: string;
  description: string;
  choices: StoryChoice[];
  location?: string; // Required location ID
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  branch: StoryBranch;
  isMainQuest: boolean;
  state: QuestState;
  stages: StoryStage[];
  requirements?: StoryRequirement[];
  startingStageId: string;
  currentStageId?: string;
  completionOutcomes?: StoryOutcome[];
  failureOutcomes?: StoryOutcome[];
  recommendedLevel?: number;
}

// Helper function to create a unique ID for a quest
export function createQuestId(branch: StoryBranch, name: string): string {
  return `quest_${branch}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
}

// Helper function to create a unique ID for a stage
export function createStageId(questId: string, stageNumber: number): string {
  return `${questId}_stage_${stageNumber}`;
}

// Helper function to create a unique ID for a choice
export function createChoiceId(stageId: string, choiceNumber: number): string {
  return `${stageId}_choice_${choiceNumber}`;
}

// Star Quest main storyline
export const starQuestData: Quest[] = [
  // Prologue: The Distress Call
  {
    id: createQuestId(StoryBranch.Main, 'Prologue'),
    title: 'Prologue: The Distress Call',
    description: 'Your routine cargo delivery is interrupted by a mysterious distress signal from a nearby system.',
    branch: StoryBranch.Main,
    isMainQuest: true,
    state: QuestState.Available,
    startingStageId: 'quest_main_prologue_stage_1',
    stages: [
      {
        id: 'quest_main_prologue_stage_1',
        stageNumber: 1,
        title: 'Unexpected Signal',
        description: 'As your ship moves through hyperspace, a distress signal breaks through. It seems to be coming from the Proxima system - not far from your route, but definitely a detour.',
        location: 'ship',
        choices: [
          {
            id: createChoiceId('quest_main_prologue_stage_1', 1),
            text: 'Investigate the distress signal',
            outcomes: [
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'investigatedDistressSignal',
                value: true
              },
              {
                type: StoryOutcomeType.UnlockLocation,
                locationId: 'proxima_derelict'
              },
              {
                type: StoryOutcomeType.Experience,
                value: 50
              }
            ],
            nextStageId: 'quest_main_prologue_stage_2'
          },
          {
            id: createChoiceId('quest_main_prologue_stage_1', 2),
            text: 'Continue to your destination',
            outcomes: [
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'ignoredDistressSignal',
                value: true
              },
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Alliance,
                value: -5
              },
              {
                type: StoryOutcomeType.UnlockLocation,
                locationId: 'frontier_outpost'
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Main, 'Cargo_Delivery')
          }
        ]
      },
      {
        id: 'quest_main_prologue_stage_2',
        stageNumber: 2,
        title: 'The Derelict Ship',
        description: 'You arrive at the source of the distress signal. It\'s a damaged Alliance research vessel, drifting silently. Scans show minimal power and life support, but there could be survivors.',
        location: 'proxima_derelict',
        choices: [
          {
            id: createChoiceId('quest_main_prologue_stage_2', 1),
            text: 'Dock and board the vessel',
            requirements: [
              {
                type: 'skill',
                skillType: SkillType.Technical,
                skillLevel: 2
              }
            ],
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 100
              },
              {
                type: StoryOutcomeType.Item,
                itemId: 'encrypted_data_core'
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'discoveredArtifactData',
                value: true
              }
            ],
            nextStageId: 'quest_main_prologue_stage_3'
          },
          {
            id: createChoiceId('quest_main_prologue_stage_2', 2),
            text: 'Send a rescue beacon and continue your journey',
            outcomes: [
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Alliance,
                value: 5
              },
              {
                type: StoryOutcomeType.UnlockLocation,
                locationId: 'frontier_outpost'
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Main, 'Cargo_Delivery')
          },
          {
            id: createChoiceId('quest_main_prologue_stage_2', 3),
            text: 'Scan for valuable salvage before deciding',
            requirements: [
              {
                type: 'skill',
                skillType: SkillType.Scientific,
                skillLevel: 1
              }
            ],
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 75
              },
              {
                type: StoryOutcomeType.Item,
                itemId: 'advanced_scanner'
              }
            ],
            nextStageId: 'quest_main_prologue_stage_2_alt'
          }
        ]
      },
      {
        id: 'quest_main_prologue_stage_2_alt',
        stageNumber: 3,
        title: 'Valuable Discovery',
        description: 'Your scan reveals not only the expected ship systems but also something unusual - a secure containment unit in the research bay that\'s still receiving emergency power.',
        location: 'proxima_derelict',
        choices: [
          {
            id: createChoiceId('quest_main_prologue_stage_2_alt', 1),
            text: 'Board the vessel and investigate the containment unit',
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 150
              },
              {
                type: StoryOutcomeType.Item,
                itemId: 'mysterious_artifact'
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'discoveredArtifact',
                value: true
              }
            ],
            nextStageId: 'quest_main_prologue_stage_3_artifact'
          },
          {
            id: createChoiceId('quest_main_prologue_stage_2_alt', 2),
            text: 'The risk is too high - send a rescue beacon and continue',
            outcomes: [
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Alliance,
                value: 5
              },
              {
                type: StoryOutcomeType.UnlockLocation,
                locationId: 'frontier_outpost'
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Main, 'Cargo_Delivery')
          }
        ]
      },
      {
        id: 'quest_main_prologue_stage_3',
        stageNumber: 4,
        title: 'Ship Exploration',
        description: 'You board the vessel and find signs of a struggle. The few crew members you find are deceased. The ship\'s logs indicate they were transporting something important when they were attacked.',
        location: 'proxima_derelict',
        choices: [
          {
            id: createChoiceId('quest_main_prologue_stage_3', 1),
            text: 'Take what you can and leave quickly',
            outcomes: [
              {
                type: StoryOutcomeType.Item,
                itemId: 'alliance_insignia'
              },
              {
                type: StoryOutcomeType.Item,
                itemId: 'emergency_supplies'
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'tookDerelictSupplies',
                value: true
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Main, 'Cargo_Delivery')
          },
          {
            id: createChoiceId('quest_main_prologue_stage_3', 2),
            text: 'Thoroughly search the research bay',
            requirements: [
              {
                type: 'skill',
                skillType: SkillType.Scientific,
                skillLevel: 2
              }
            ],
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 150
              },
              {
                type: StoryOutcomeType.Item,
                itemId: 'mysterious_artifact'
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'discoveredArtifact',
                value: true
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Main, 'Artifact_Mystery')
          }
        ]
      },
      {
        id: 'quest_main_prologue_stage_3_artifact',
        stageNumber: 5,
        title: 'The Artifact',
        description: 'Inside the containment unit, you find a strange object unlike anything you\'ve seen. It appears ancient but gives off a faint energy signature. As you approach, you feel an odd sensation, as if it\'s somehow aware of your presence.',
        location: 'proxima_derelict',
        choices: [
          {
            id: createChoiceId('quest_main_prologue_stage_3_artifact', 1),
            text: 'Take the artifact with you',
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 200
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'tookArtifact',
                value: true
              },
              {
                type: StoryOutcomeType.UnlockQuest,
                questId: createQuestId(StoryBranch.Main, 'Artifact_Mystery')
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Main, 'Artifact_Mystery')
          },
          {
            id: createChoiceId('quest_main_prologue_stage_3_artifact', 2),
            text: 'Leave it and report your findings to the Alliance',
            outcomes: [
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Alliance,
                value: 15
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'reportedArtifact',
                value: true
              },
              {
                type: StoryOutcomeType.UnlockQuest,
                questId: createQuestId(StoryBranch.Alliance, 'Alliance_Trust')
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Main, 'Cargo_Delivery')
          },
          {
            id: createChoiceId('quest_main_prologue_stage_3_artifact', 3),
            text: 'Contact the Syndicate about your valuable find',
            requirements: [
              {
                type: 'faction',
                faction: Faction.Syndicate,
                reputationLevel: -5
              }
            ],
            outcomes: [
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Syndicate,
                value: 15
              },
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Alliance,
                value: -10
              },
              {
                type: StoryOutcomeType.Item,
                itemId: 'syndicate_payment'
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'contactedSyndicate',
                value: true
              },
              {
                type: StoryOutcomeType.UnlockQuest,
                questId: createQuestId(StoryBranch.Syndicate, 'Syndicate_Interest')
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Main, 'Cargo_Delivery')
          }
        ]
      }
    ],
    recommendedLevel: 1
  },
  
  // Cargo Delivery
  {
    id: createQuestId(StoryBranch.Main, 'Cargo_Delivery'),
    title: 'Routine Delivery',
    description: 'Complete your cargo delivery to Frontier Outpost.',
    branch: StoryBranch.Main,
    isMainQuest: true,
    state: QuestState.Unavailable,
    startingStageId: 'quest_main_cargo_delivery_stage_1',
    stages: [
      {
        id: 'quest_main_cargo_delivery_stage_1',
        stageNumber: 1,
        title: 'Arrival at Frontier Outpost',
        description: 'You arrive at Frontier Outpost with your cargo. The station seems unusually busy, with several ships docked and security running additional scans.',
        location: 'frontier_outpost',
        choices: [
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_1', 1),
            text: 'Deliver the cargo as planned',
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 100
              },
              {
                type: StoryOutcomeType.Item,
                itemId: 'credits_payment'
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'completedDelivery',
                value: true
              }
            ],
            nextStageId: 'quest_main_cargo_delivery_stage_2'
          },
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_1', 2),
            text: 'Inspect your cargo before delivery',
            requirements: [
              {
                type: 'skill',
                skillType: SkillType.Technical,
                skillLevel: 1
              }
            ],
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 75
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'inspectedCargo',
                value: true
              }
            ],
            nextStageId: 'quest_main_cargo_delivery_stage_1_inspect'
          }
        ]
      },
      {
        id: 'quest_main_cargo_delivery_stage_1_inspect',
        stageNumber: 2,
        title: 'Suspicious Contents',
        description: 'Your inspection reveals that the cargo contains more than the manifested supplies. Hidden compartments hold what appear to be experimental weapon components.',
        location: 'frontier_outpost',
        choices: [
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_1_inspect', 1),
            text: 'Deliver as planned and say nothing',
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 100
              },
              {
                type: StoryOutcomeType.Item,
                itemId: 'credits_payment'
              },
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Syndicate,
                value: 5
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'smuggledWeapons',
                value: true
              }
            ],
            nextStageId: 'quest_main_cargo_delivery_stage_2'
          },
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_1_inspect', 2),
            text: 'Report the suspicious cargo to station security',
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 150
              },
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Alliance,
                value: 10
              },
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Syndicate,
                value: -15
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'reportedSmugglers',
                value: true
              }
            ],
            nextStageId: 'quest_main_cargo_delivery_stage_3_alliance'
          },
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_1_inspect', 3),
            text: 'Confront your contact about the true contents',
            requirements: [
              {
                type: 'skill',
                skillType: SkillType.Social,
                skillLevel: 2
              }
            ],
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 125
              },
              {
                type: StoryOutcomeType.Item,
                itemId: 'bonus_payment'
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'negotiatedWithSmugglers',
                value: true
              }
            ],
            nextStageId: 'quest_main_cargo_delivery_stage_3_syndicate'
          }
        ]
      },
      {
        id: 'quest_main_cargo_delivery_stage_2',
        stageNumber: 3,
        title: 'New Opportunities',
        description: 'With your delivery complete, you have time to explore the outpost. The station\'s job board shows several interesting opportunities.',
        location: 'frontier_outpost',
        choices: [
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_2', 1),
            text: 'Look for legitimate transport work',
            outcomes: [
              {
                type: StoryOutcomeType.UnlockQuest,
                questId: createQuestId(StoryBranch.Alliance, 'Supply_Run')
              },
              {
                type: StoryOutcomeType.UnlockLocation,
                locationId: 'mining_colony'
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Alliance, 'Supply_Run')
          },
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_2', 2),
            text: 'Seek higher-paying but riskier jobs',
            outcomes: [
              {
                type: StoryOutcomeType.UnlockQuest,
                questId: createQuestId(StoryBranch.Syndicate, 'Valuable_Cargo')
              },
              {
                type: StoryOutcomeType.UnlockLocation,
                locationId: 'syndicate_hideout'
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Syndicate, 'Valuable_Cargo')
          },
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_2', 3),
            text: 'Investigate rumors of an ancient ruin',
            requirements: [
              {
                type: 'flag',
                id: 'discoveredArtifact',
                value: true
              }
            ],
            outcomes: [
              {
                type: StoryOutcomeType.UnlockQuest,
                questId: createQuestId(StoryBranch.Main, 'Artifact_Mystery')
              },
              {
                type: StoryOutcomeType.UnlockLocation,
                locationId: 'ancient_ruins'
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Main, 'Artifact_Mystery')
          }
        ]
      },
      {
        id: 'quest_main_cargo_delivery_stage_3_alliance',
        stageNumber: 4,
        title: 'Alliance Gratitude',
        description: 'The Alliance security officer thanks you for your vigilance. The smugglers are arrested, and you\'ve prevented dangerous weapons from reaching the wrong hands.',
        location: 'frontier_outpost',
        choices: [
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_3_alliance', 1),
            text: 'Accept a position as an Alliance informant',
            outcomes: [
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Alliance,
                value: 15
              },
              {
                type: StoryOutcomeType.UnlockQuest,
                questId: createQuestId(StoryBranch.Alliance, 'Alliance_Trust')
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Alliance, 'Alliance_Trust')
          },
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_3_alliance', 2),
            text: 'Decline further involvement',
            outcomes: [
              {
                type: StoryOutcomeType.UnlockQuest,
                questId: createQuestId(StoryBranch.Independent, 'Free_Agent')
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Independent, 'Free_Agent')
          }
        ]
      },
      {
        id: 'quest_main_cargo_delivery_stage_3_syndicate',
        stageNumber: 5,
        title: 'Syndicate Proposition',
        description: 'Your contact is impressed by your perception and nerve. They offer you a position in their smuggling network, promising substantial rewards.',
        location: 'frontier_outpost',
        choices: [
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_3_syndicate', 1),
            text: 'Accept the Syndicate\'s offer',
            outcomes: [
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Syndicate,
                value: 20
              },
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Alliance,
                value: -10
              },
              {
                type: StoryOutcomeType.UnlockQuest,
                questId: createQuestId(StoryBranch.Syndicate, 'Syndicate_Rising')
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Syndicate, 'Syndicate_Rising')
          },
          {
            id: createChoiceId('quest_main_cargo_delivery_stage_3_syndicate', 2),
            text: 'Decline but keep it cordial',
            outcomes: [
              {
                type: StoryOutcomeType.UnlockQuest,
                questId: createQuestId(StoryBranch.Independent, 'Free_Agent')
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Independent, 'Free_Agent')
          }
        ]
      }
    ],
    recommendedLevel: 1
  },
  
  // Artifact Mystery
  {
    id: createQuestId(StoryBranch.Main, 'Artifact_Mystery'),
    title: 'The Ancient Artifact',
    description: 'Investigate the mysterious artifact you discovered and uncover its origins and purpose.',
    branch: StoryBranch.Main,
    isMainQuest: true,
    state: QuestState.Unavailable,
    startingStageId: 'quest_main_artifact_mystery_stage_1',
    requirements: [
      {
        type: 'flag',
        id: 'discoveredArtifact',
        value: true
      }
    ],
    stages: [
      {
        id: 'quest_main_artifact_mystery_stage_1',
        stageNumber: 1,
        title: 'Strange Effects',
        description: 'The artifact has been emitting occasional pulses of energy since you acquired it. You notice it seems to respond to your proximity, and you\'ve begun having unusual dreams.',
        location: 'ship',
        choices: [
          {
            id: createChoiceId('quest_main_artifact_mystery_stage_1', 1),
            text: 'Seek a scientific expert',
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 100
              },
              {
                type: StoryOutcomeType.UnlockLocation,
                locationId: 'research_station'
              }
            ],
            nextStageId: 'quest_main_artifact_mystery_stage_2_science'
          },
          {
            id: createChoiceId('quest_main_artifact_mystery_stage_1', 2),
            text: 'Consult with the Mystics',
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 100
              },
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Mystics,
                value: 10
              },
              {
                type: StoryOutcomeType.UnlockLocation,
                locationId: 'mystic_sanctuary'
              }
            ],
            nextStageId: 'quest_main_artifact_mystery_stage_2_mystics'
          },
          {
            id: createChoiceId('quest_main_artifact_mystery_stage_1', 3),
            text: 'Find a buyer on the black market',
            outcomes: [
              {
                type: StoryOutcomeType.Experience,
                value: 75
              },
              {
                type: StoryOutcomeType.Reputation,
                factionId: Faction.Syndicate,
                value: 15
              },
              {
                type: StoryOutcomeType.Item,
                itemId: 'large_credit_payment'
              },
              {
                type: StoryOutcomeType.SetFlag,
                flagName: 'soldArtifact',
                value: true
              }
            ],
            nextQuestId: createQuestId(StoryBranch.Syndicate, 'Syndicate_Interest')
          }
        ]
      },
      // More stages would be defined here - this is just a sample
    ],
    recommendedLevel: 2
  }
];

// Export initial quest state for story
export const initialQuestState = {
  activeQuests: [createQuestId(StoryBranch.Main, 'Prologue')],
  completedQuests: [],
  failedQuests: [],
  unavailableQuests: [
    createQuestId(StoryBranch.Main, 'Cargo_Delivery'),
    createQuestId(StoryBranch.Main, 'Artifact_Mystery'),
    createQuestId(StoryBranch.Alliance, 'Alliance_Trust'),
    createQuestId(StoryBranch.Syndicate, 'Syndicate_Interest')
  ],
  questProgress: {
    [createQuestId(StoryBranch.Main, 'Prologue')]: {
      currentStageId: 'quest_main_prologue_stage_1',
      decisions: [],
      stateUpdatedAt: Date.now()
    }
  }
};

export default starQuestData;