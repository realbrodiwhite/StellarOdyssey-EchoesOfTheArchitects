import { Puzzle, PuzzleType, SkillType } from "../types";
import { v4 as uuidv4 } from "uuid";

export const gamePuzzles: Puzzle[] = [
  {
    id: uuidv4(),
    name: "Power Distribution",
    type: PuzzleType.Rewiring,
    description: "The ship's power system needs reconfiguration. Connect power sources to critical systems without overloading any circuits.",
    difficulty: 2,
    hints: [
      "Each system requires a specific amount of power",
      "Some connections can handle more load than others",
      "Try to balance the power distribution across all available paths"
    ],
    solved: false,
    requiredSkill: { type: SkillType.Technical, level: 2 },
    solution: {
      connections: [
        { source: "generator1", target: "lifesupport" },
        { source: "generator2", target: "engines" },
        { source: "generator3", target: "shields" },
        { source: "backup", target: "communications" }
      ]
    }
  },
  {
    id: uuidv4(),
    name: "Alien Sequence",
    type: PuzzleType.Sequence,
    description: "Decode the alien transmission sequence to establish communication.",
    difficulty: 3,
    hints: [
      "The sequence follows a mathematical pattern",
      "Every third number represents a prime number",
      "The pattern repeats after 7 iterations"
    ],
    solved: false,
    requiredSkill: { type: SkillType.Scientific, level: 2 },
    solution: [2, 3, 5, 8, 13, 21, 34]
  },
  {
    id: uuidv4(),
    name: "Security Bypass",
    type: PuzzleType.Logic,
    description: "Bypass the security system by solving a series of logic gates.",
    difficulty: 2,
    hints: [
      "The gates follow Boolean logic",
      "Each gate has two inputs and one output",
      "Try working backwards from the required output"
    ],
    solved: false,
    requiredSkill: { type: SkillType.Technical, level: 1 },
    solution: {
      inputs: [true, false, true, false],
      expectedOutput: true
    }
  },
  {
    id: uuidv4(),
    name: "Stellar Navigation",
    type: PuzzleType.Pattern,
    description: "Plot a safe course through an asteroid field using star patterns for navigation.",
    difficulty: 3,
    hints: [
      "The constellation patterns indicate safe passages",
      "Connect similar star patterns to find the path",
      "Brighter stars indicate primary navigation points"
    ],
    solved: false,
    requiredSkill: { type: SkillType.Navigation, level: 2 },
    solution: {
      path: ["alpha", "beta", "delta", "gamma", "epsilon"]
    }
  },
  {
    id: uuidv4(),
    name: "Alien Encryption",
    type: PuzzleType.Decryption,
    description: "Decrypt the alien database to access valuable information.",
    difficulty: 4,
    hints: [
      "The encryption key uses a substitution cipher",
      "Symbols with similar shapes often represent related concepts",
      "The key is hidden within the first section of data"
    ],
    solved: false,
    requiredSkill: { type: SkillType.Scientific, level: 3 },
    solution: {
      key: "XQZPYLMKOIJNBUHVGFWDETRSCBA",
      message: "COORDINATES_TO_ANCIENT_RUINS"
    }
  },
  {
    id: uuidv4(),
    name: "Diplomatic Negotiation",
    type: PuzzleType.Logic,
    description: "Navigate a complex negotiation with alien representatives to secure an alliance.",
    difficulty: 3,
    hints: [
      "Different alien species value different approaches",
      "Past interactions can guide future decisions",
      "Consider the cultural taboos mentioned in your briefing"
    ],
    solved: false,
    requiredSkill: { type: SkillType.Social, level: 2 },
    solution: {
      approaches: ["respectful", "direct", "patient", "formal"]
    }
  }
];
