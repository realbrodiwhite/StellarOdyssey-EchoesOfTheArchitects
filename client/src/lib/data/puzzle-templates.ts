import { PuzzleType, SkillType } from '../types';

// Define interfaces for our puzzle system
export interface PuzzleSolution {
  id: string;
  description: string;
  requiredSkill?: {
    type: SkillType;
    level: number;
  };
  successRate: number; // 0-100
  rewardModifier: number; // Multiplier for rewards (0.5-2.0)
  energyCost: number; // Energy required to attempt this solution
  outcomeDescription: {
    success: string;
    failure: string;
  };
}

export interface PuzzleTemplate {
  id: string;
  name: string;
  type: PuzzleType;
  description: string;
  difficulty: number; // 1-10
  backgroundImage?: string;
  introText: string;
  solutions: PuzzleSolution[];
  hints: string[];
  baseExperienceReward: number;
  timeLimit?: number; // In seconds, optional
}

// Create a collection of puzzles with multiple solution paths
export const puzzleTemplates: PuzzleTemplate[] = [
  // ============== REWIRING PUZZLES ==============
  {
    id: 'ship_power_failure',
    name: 'Power System Failure',
    type: PuzzleType.Rewiring,
    description: 'The ship\'s main power system has failed, and emergency systems are running at minimal capacity. Restore power before critical systems go offline.',
    difficulty: 3,
    introText: 'Warning: Main power failure detected. Emergency systems active. Estimated time until life support failure: 15 minutes.',
    solutions: [
      {
        id: 'technical_rewiring',
        description: 'Manually rewire the power distribution nodes to bypass damaged circuitry',
        requiredSkill: {
          type: SkillType.Technical,
          level: 2
        },
        successRate: 85,
        rewardModifier: 1.0,
        energyCost: 20,
        outcomeDescription: {
          success: 'You carefully trace the power conduits and identify the damaged sections. By rerouting power through secondary systems, you successfully restore main power to the ship.',
          failure: 'While attempting to rewire the system, you accidentally trigger a power surge. The emergency systems stabilize, but you\'ll need to try a different approach.'
        }
      },
      {
        id: 'brute_force_reset',
        description: 'Perform an emergency reset of all systems and restart with auxiliary power',
        successRate: 60,
        rewardModifier: 0.7,
        energyCost: 10,
        outcomeDescription: {
          success: 'The emergency reset works! Systems come back online one by one, restoring power to critical functions.',
          failure: 'The reset fails to address the underlying issue. Power fluctuations continue, and you\'ll need to try another approach.'
        }
      },
      {
        id: 'optimize_power_distribution',
        description: 'Write a custom algorithm to dynamically allocate power based on system priority',
        requiredSkill: {
          type: SkillType.Technical,
          level: 3
        },
        successRate: 90,
        rewardModifier: 1.5,
        energyCost: 35,
        outcomeDescription: {
          success: 'Your algorithm perfectly balances power distribution, not only restoring systems but optimizing them. The ship\'s power efficiency has increased by 15%!',
          failure: 'The algorithm encounters an unforeseen error condition. While you prevented further damage, the power systems remain offline.'
        }
      }
    ],
    hints: [
      'Check the emergency bypass panels located near the engine room',
      'The ship\'s technical manual mentions a reset procedure for catastrophic power failures',
      'Power distribution can be controlled via the auxiliary engineering terminal'
    ],
    baseExperienceReward: 150
  },
  
  // ============== DECRYPTION PUZZLES ==============
  {
    id: 'encrypted_datacore',
    name: 'Encrypted Alliance Datacore',
    type: PuzzleType.Decryption,
    description: 'You\'ve recovered a heavily encrypted Alliance datacore containing valuable information. Decrypt it to access the contents.',
    difficulty: 5,
    introText: 'The datacore\'s security system activates as you connect it to your ship\'s computer. Multiple layers of encryption detected.',
    solutions: [
      {
        id: 'brute_force_decryption',
        description: 'Use the ship\'s computing power to brute-force the encryption',
        successRate: 40,
        rewardModifier: 0.6,
        energyCost: 15,
        outcomeDescription: {
          success: 'After several hours, your computer manages to break through the encryption. The data is slightly corrupted but readable.',
          failure: 'The brute force attempt triggers an additional security protocol, further complicating the encryption. This approach won\'t work.'
        }
      },
      {
        id: 'cryptographic_analysis',
        description: 'Analyze the encryption pattern to identify potential weaknesses',
        requiredSkill: {
          type: SkillType.Technical,
          level: 3
        },
        successRate: 75,
        rewardModifier: 1.0,
        energyCost: 25,
        outcomeDescription: {
          success: 'Your analysis reveals a pattern in the encryption algorithm. Exploiting this weakness, you successfully decrypt the datacore without damaging the contents.',
          failure: 'The encryption proves more sophisticated than initially assessed. Your analysis yields some insights but fails to break the code.'
        }
      },
      {
        id: 'alliance_backdoor',
        description: 'Use Alliance security clearance codes to access the emergency backdoor',
        requiredSkill: {
          type: SkillType.Social,
          level: 2
        },
        successRate: 95,
        rewardModifier: 1.2,
        energyCost: 10,
        outcomeDescription: {
          success: 'Your Alliance credentials grant you access to the datacore\'s administrative functions. You easily bypass the encryption using official channels.',
          failure: 'Your credentials are rejected. It appears this datacore requires higher-level clearance than you currently possess.'
        }
      }
    ],
    hints: [
      'Alliance encryption typically includes a backdoor for authorized personnel',
      'The pattern of the encryption may reveal vulnerabilities if analyzed carefully',
      'Sometimes raw computing power can overcome security measures, albeit inefficiently'
    ],
    baseExperienceReward: 200
  },
  
  // ============== LOGIC PUZZLES ==============
  {
    id: 'ancient_alien_door',
    name: 'Ancient Alien Gateway',
    type: PuzzleType.Logic,
    description: 'An ancient doorway stands before you, covered in mysterious symbols. The door appears to be operated by a complex locking mechanism.',
    difficulty: 7,
    introText: 'As you approach the ancient structure, symbols on the door begin to glow faintly. A circular panel in the center seems to be some kind of interface.',
    solutions: [
      {
        id: 'symbol_pattern_solution',
        description: 'Analyze the symbols to identify a pattern or sequence',
        requiredSkill: {
          type: SkillType.Scientific,
          level: 3
        },
        successRate: 80,
        rewardModifier: 1.2,
        energyCost: 20,
        outcomeDescription: {
          success: 'After careful study, you recognize the symbols represent celestial bodies. You arrange them in the correct astronomical order, and the door slides open silently.',
          failure: 'Your interpretation of the symbols seems incorrect. The panel flashes red briefly before returning to its dormant state.'
        }
      },
      {
        id: 'energy_resonance',
        description: 'Use your scanner to match the energy frequency of the door',
        requiredSkill: {
          type: SkillType.Technical,
          level: 2
        },
        successRate: 70,
        rewardModifier: 1.0,
        energyCost: 30,
        outcomeDescription: {
          success: 'Your scanner detects a specific energy frequency emanating from the door. By calibrating your equipment to match and amplify this frequency, the locking mechanism disengages.',
          failure: 'The door\'s energy pattern is too complex for your scanner to replicate accurately. The attempt destabilizes the field briefly but fails to open the door.'
        }
      },
      {
        id: 'forceful_entry',
        description: 'Apply targeted force to the mechanism\'s weak points',
        requiredSkill: {
          type: SkillType.Combat,
          level: 3
        },
        successRate: 60,
        rewardModifier: 0.7,
        energyCost: 40,
        outcomeDescription: {
          success: 'You identify structural weaknesses in the door frame. With precisely applied force, you manage to trigger the emergency release mechanism designed to prevent entrapment.',
          failure: 'Your attempt to force the door triggers a defensive mechanism. A localized energy field repels you, and the door remains firmly closed.'
        }
      },
      {
        id: 'mystic_intuition',
        description: 'Rely on intuition and let the ancient energies guide your actions',
        requiredSkill: {
          type: SkillType.Scientific,
          level: 1
        },
        successRate: 40,
        rewardModifier: 1.8,
        energyCost: 50,
        outcomeDescription: {
          success: 'You clear your mind and allow your hand to move across the symbols instinctively. To your surprise, the correct sequence reveals itself through intuition alone, and the door opens with a harmonic tone.',
          failure: 'Despite your best efforts to connect with the ancient technology, the door remains unresponsive to your intuitive approach.'
        }
      }
    ],
    hints: [
      'The symbols appear to be arranged in a pattern that resembles star configurations',
      'Scanning the door reveals fluctuating energy patterns that might be part of the locking mechanism',
      'There are small indentations near the frame that could be pressure points'
    ],
    baseExperienceReward: 300
  },
  
  // ============== SEQUENCE PUZZLES ==============
  {
    id: 'reactor_stabilization',
    name: 'Unstable Reactor Core',
    type: PuzzleType.Sequence,
    description: 'The starship\'s reactor core is becoming unstable following damage from a meteor impact. Stabilize it before a catastrophic meltdown occurs.',
    difficulty: 6,
    introText: 'Warning: Reactor instability detected. Core temperature rising. Estimated time to critical failure: 5 minutes.',
    solutions: [
      {
        id: 'emergency_shutdown',
        description: 'Initiate emergency shutdown procedure and switch to backup power',
        successRate: 90,
        rewardModifier: 0.5,
        energyCost: 10,
        outcomeDescription: {
          success: 'The emergency shutdown executes successfully. The ship switches to backup power, giving you time to properly repair the reactor later.',
          failure: 'The shutdown sequence is rejected by the system. The damage has compromised the normal safety protocols.'
        }
      },
      {
        id: 'coolant_rerouting',
        description: 'Reroute additional coolant to the reactor core',
        requiredSkill: {
          type: SkillType.Technical,
          level: 2
        },
        successRate: 75,
        rewardModifier: 1.0,
        energyCost: 20,
        outcomeDescription: {
          success: 'You successfully redirect coolant from non-essential systems. The core temperature gradually returns to safe levels as the coolant absorbs excess heat.',
          failure: 'While rerouting the coolant, one of the damaged pipes bursts. The reactor continues to heat up, forcing you to try a different approach.'
        }
      },
      {
        id: 'containment_field_recalibration',
        description: 'Manually recalibrate the containment field to compensate for the instability',
        requiredSkill: {
          type: SkillType.Technical,
          level: 4
        },
        successRate: 65,
        rewardModifier: 1.5,
        energyCost: 35,
        outcomeDescription: {
          success: 'Through precise adjustments to the containment field, you manage to counteract the instability. The reactor stabilizes while remaining operational at 90% capacity.',
          failure: 'The containment field fluctuates unpredictably during recalibration. You\'re forced to abort the attempt as the instability increases.'
        }
      },
      {
        id: 'controlled_energy_venting',
        description: 'Vent excess energy through the emergency release valves',
        requiredSkill: {
          type: SkillType.Navigation,
          level: 3
        },
        successRate: 70,
        rewardModifier: 1.2,
        energyCost: 25,
        outcomeDescription: {
          success: 'Carefully timing the energy releases, you manage to reduce the core pressure without compromising ship functions. The reactor returns to stable operation.',
          failure: 'The energy venting process becomes difficult to control. You manage to prevent a meltdown, but the reactor automatically enters safe mode.'
        }
      }
    ],
    hints: [
      'The reactor manual mentions emergency protocols for critical system failure',
      'Coolant systems have redundancies that can be accessed through the engineering bay',
      'The containment field calibration requires precision but offers the best outcome',
      'Controlled venting can be dangerous but effective if timed correctly'
    ],
    baseExperienceReward: 250,
    timeLimit: 300 // 5 minutes in seconds
  },
  
  // ============== PATTERN PUZZLES ==============
  {
    id: 'alien_artifact_activation',
    name: 'Mysterious Alien Artifact',
    type: PuzzleType.Pattern,
    description: 'You\'ve discovered an alien artifact of unknown origin. Activating it could provide valuable insights into a long-extinct civilization.',
    difficulty: 4,
    introText: 'The artifact is a polyhedral object covered in intricate geometric patterns. It faintly hums when touched, suggesting it contains an internal power source.',
    solutions: [
      {
        id: 'resonance_scanning',
        description: 'Use your scanner to identify resonance patterns and match them',
        requiredSkill: {
          type: SkillType.Scientific,
          level: 2
        },
        successRate: 80,
        rewardModifier: 1.1,
        energyCost: 15,
        outcomeDescription: {
          success: 'Your scanner detects subtle harmonic patterns emanating from the artifact. By generating matching frequencies, you successfully activate it, revealing holographic star charts of unknown regions.',
          failure: 'The resonance patterns are too complex for your scanner to accurately replicate. The artifact responds briefly but returns to its dormant state.'
        }
      },
      {
        id: 'pattern_alignment',
        description: 'Physically align the movable sections to complete the surface pattern',
        successRate: 70,
        rewardModifier: 1.0,
        energyCost: 10,
        outcomeDescription: {
          success: 'You notice that sections of the artifact can be rotated. After careful observation, you align the patterns into a cohesive whole. The artifact activates, projecting ancient symbols and images.',
          failure: 'The sections move, but finding the correct alignment proves challenging. The artifact remains inactive despite your efforts.'
        }
      },
      {
        id: 'energy_infusion',
        description: 'Channel energy from your ship\'s power systems into the artifact',
        requiredSkill: {
          type: SkillType.Technical,
          level: 2
        },
        successRate: 60,
        rewardModifier: 1.3,
        energyCost: 30,
        outcomeDescription: {
          success: 'You carefully connect the artifact to a regulated power source. After a moment of calibration, the artifact accepts the energy and activates fully, revealing technological secrets beyond your current understanding.',
          failure: 'The artifact rejects the external power source. A brief surge causes your equipment to short circuit momentarily, but fortunately causes no permanent damage.'
        }
      },
      {
        id: 'biological_interface',
        description: 'Attempt to form a direct mental connection with the artifact',
        requiredSkill: {
          type: SkillType.Scientific,
          level: 4
        },
        successRate: 50,
        rewardModifier: 2.0,
        energyCost: 50,
        outcomeDescription: {
          success: 'As you focus your mind on the artifact, you feel an unexpected connection forming. Knowledge flows directly into your consciousness—a profound and intense experience that grants you unique insights into the alien technology.',
          failure: 'You sense a faint connection attempting to form, but it slips away before anything meaningful occurs. The experience leaves you with a mild headache but no lasting effects.'
        }
      }
    ],
    hints: [
      'The patterns on the surface appear to be both decorative and functional',
      'When examined under different light spectrums, new details become visible',
      'The humming sound changes slightly when certain areas are touched in sequence',
      'Ancient records mention artifacts that responded to the mental states of their users'
    ],
    baseExperienceReward: 200
  }
];

// Create lookup map for easier access
export const puzzleLookup: Record<string, PuzzleTemplate> = puzzleTemplates.reduce(
  (acc, puzzle) => {
    acc[puzzle.id] = puzzle;
    return acc;
  },
  {} as Record<string, PuzzleTemplate>
);

export default puzzleTemplates;