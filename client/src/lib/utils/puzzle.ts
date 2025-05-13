import { Puzzle, PuzzleType, SkillType } from "../types";

/**
 * Check if a puzzle solution is correct
 */
export function checkPuzzleSolution(puzzle: Puzzle, userSolution: any): boolean {
  if (!puzzle || !userSolution) return false;
  
  switch (puzzle.type) {
    case PuzzleType.Logic:
      return checkLogicPuzzle(puzzle, userSolution);
    
    case PuzzleType.Pattern:
      return checkPatternPuzzle(puzzle, userSolution);
    
    case PuzzleType.Sequence:
      return checkSequencePuzzle(puzzle, userSolution);
    
    case PuzzleType.Rewiring:
      return checkRewiringPuzzle(puzzle, userSolution);
    
    case PuzzleType.Decryption:
      return checkDecryptionPuzzle(puzzle, userSolution);
    
    default:
      return false;
  }
}

/**
 * Check logic puzzle solution
 */
function checkLogicPuzzle(puzzle: Puzzle, userSolution: any): boolean {
  // For logic puzzles, we need to check if the provided inputs result in the expected output
  if (puzzle.solution.expectedOutput === undefined) return false;
  
  // For diplomatic negotiation puzzle
  if (puzzle.name === "Diplomatic Negotiation") {
    if (!userSolution.approaches || !Array.isArray(userSolution.approaches)) return false;
    
    // Check if user approaches match the solution approaches
    return userSolution.approaches.length === puzzle.solution.approaches.length &&
           userSolution.approaches.every((approach: string, index: number) => 
             approach === puzzle.solution.approaches[index]);
  }
  
  // For security bypass puzzle
  if (puzzle.name === "Security Bypass") {
    if (!userSolution.inputs || !Array.isArray(userSolution.inputs)) return false;
    
    // Evaluate the logic gates based on inputs
    // This is a simplified example - actual implementation would depend on the puzzle's logic
    const result = evaluateLogicGates(userSolution.inputs);
    return result === puzzle.solution.expectedOutput;
  }
  
  return false;
}

/**
 * Check pattern puzzle solution
 */
function checkPatternPuzzle(puzzle: Puzzle, userSolution: any): boolean {
  // For pattern puzzles like stellar navigation
  if (puzzle.name === "Stellar Navigation") {
    if (!userSolution.path || !Array.isArray(userSolution.path)) return false;
    
    // Check if user path matches the solution path
    return userSolution.path.length === puzzle.solution.path.length &&
           userSolution.path.every((point: string, index: number) => 
             point === puzzle.solution.path[index]);
  }
  
  return false;
}

/**
 * Check sequence puzzle solution
 */
function checkSequencePuzzle(puzzle: Puzzle, userSolution: any): boolean {
  // For sequence puzzles, check if the provided sequence matches the expected sequence
  if (!Array.isArray(userSolution) || !Array.isArray(puzzle.solution)) return false;
  
  return userSolution.length === puzzle.solution.length &&
         userSolution.every((value, index) => value === puzzle.solution[index]);
}

/**
 * Check rewiring puzzle solution
 */
function checkRewiringPuzzle(puzzle: Puzzle, userSolution: any): boolean {
  // For rewiring puzzles like power distribution
  if (puzzle.name === "Power Distribution") {
    if (!userSolution.connections || !Array.isArray(userSolution.connections)) return false;
    
    // Check if all required connections are made
    const requiredConnections = puzzle.solution.connections;
    if (userSolution.connections.length !== requiredConnections.length) return false;
    
    // Each connection needs source and target to match
    return requiredConnections.every((required: {source: string, target: string}) => 
      userSolution.connections.some((connection: {source: string, target: string}) => 
        connection.source === required.source && connection.target === required.target));
  }
  
  return false;
}

/**
 * Check decryption puzzle solution
 */
function checkDecryptionPuzzle(puzzle: Puzzle, userSolution: any): boolean {
  // For decryption puzzles like alien encryption
  if (puzzle.name === "Alien Encryption") {
    // Check if the user provided the correct key and message
    return userSolution.key === puzzle.solution.key &&
           userSolution.message === puzzle.solution.message;
  }
  
  return false;
}

/**
 * Evaluate logic gates for a security bypass puzzle
 * (Simplified example - actual implementation would be more complex)
 */
function evaluateLogicGates(inputs: boolean[]): boolean {
  if (inputs.length < 4) return false;
  
  // Example logic: (input0 AND input1) OR (input2 AND NOT input3)
  return (inputs[0] && inputs[1]) || (inputs[2] && !inputs[3]);
}

/**
 * Get a hint for a puzzle based on skill level
 */
export function getSkillBasedHint(puzzle: Puzzle, skillLevel: number): string {
  if (!puzzle.requiredSkill) return "This puzzle doesn't require any special skills.";
  
  const skillDifference = skillLevel - puzzle.requiredSkill.level;
  
  if (skillDifference < 0) {
    return "Your skill level is too low to understand this puzzle fully.";
  } else if (skillDifference === 0) {
    return "You have just enough skill to solve this, but it will be challenging.";
  } else if (skillDifference === 1) {
    return "Your skills give you good insight into this puzzle.";
  } else {
    return "Your advanced skills make this puzzle much easier to understand.";
  }
}
