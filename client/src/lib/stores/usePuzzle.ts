import { create } from "zustand";
import { Puzzle, PuzzleType, SkillType } from "../types";
import { useCharacter } from "./useCharacter";
import { useAudio } from "./useAudio";
import { gamePuzzles } from "../data/puzzles";

interface PuzzleState {
  activePuzzle: Puzzle | null;
  hints: string[];
  currentHintIndex: number;
  userSolution: any;
  puzzlesSolved: string[];
  
  // Puzzle management
  startPuzzle: (puzzleId: string) => boolean;
  endPuzzle: (solved: boolean) => void;
  
  // Puzzle interaction
  updateSolution: (solution: any) => void;
  checkSolution: () => boolean;
  getNextHint: () => string | null;
  resetHints: () => void;
  
  // Puzzle status
  isPuzzleActive: () => boolean;
  isPuzzleSolved: (puzzleId: string) => boolean;
  
  // Utility functions
  canSolvePuzzle: (puzzle: Puzzle) => boolean;
}

export const usePuzzle = create<PuzzleState>((set, get) => ({
  activePuzzle: null,
  hints: [],
  currentHintIndex: -1,
  userSolution: null,
  puzzlesSolved: [],
  
  startPuzzle: (puzzleId) => {
    // Find the puzzle from the puzzles data
    const puzzle = gamePuzzles.find(p => p.id === puzzleId);
    
    if (!puzzle) {
      console.error(`Puzzle with ID ${puzzleId} not found.`);
      return false;
    }
    
    // Check if the player has the required skills
    if (!get().canSolvePuzzle(puzzle)) {
      console.log("Character doesn't have required skills for this puzzle.");
      return false;
    }
    
    // Initialize the puzzle
    set({
      activePuzzle: puzzle,
      hints: [...puzzle.hints],
      currentHintIndex: -1,
      userSolution: null
    });
    
    return true;
  },
  
  endPuzzle: (solved) => {
    const puzzle = get().activePuzzle;
    
    if (!puzzle) return;
    
    if (solved) {
      // Add to solved puzzles list
      set(state => ({
        puzzlesSolved: [...state.puzzlesSolved, puzzle.id]
      }));
      
      // Play success sound
      useAudio.getState().playSuccess();
      
      // Give experience for solving puzzle
      const character = useCharacter.getState();
      const experienceGained = puzzle.difficulty * 30; // More difficult puzzles give more XP
      character.gainExperience(experienceGained);
      
      console.log(`Puzzle solved! Gained ${experienceGained} experience.`);
    }
    
    // Clear the active puzzle
    set({
      activePuzzle: null,
      hints: [],
      currentHintIndex: -1,
      userSolution: null
    });
  },
  
  updateSolution: (solution) => {
    set({ userSolution: solution });
  },
  
  checkSolution: () => {
    const { activePuzzle, userSolution } = get();
    
    if (!activePuzzle || !userSolution) return false;
    
    // Different solution check logic based on puzzle type
    let correct = false;
    
    switch (activePuzzle.type) {
      case PuzzleType.Logic:
      case PuzzleType.Rewiring:
      case PuzzleType.Decryption:
      case PuzzleType.Pattern:
        // For complex object solutions, convert to JSON and compare
        correct = JSON.stringify(userSolution) === JSON.stringify(activePuzzle.solution);
        break;
      
      case PuzzleType.Sequence:
        // For sequence puzzles, check array equality
        if (Array.isArray(userSolution) && Array.isArray(activePuzzle.solution)) {
          correct = userSolution.length === activePuzzle.solution.length &&
                    userSolution.every((val, idx) => val === activePuzzle.solution[idx]);
        }
        break;
      
      default:
        correct = false;
    }
    
    if (correct) {
      get().endPuzzle(true);
    }
    
    return correct;
  },
  
  getNextHint: () => {
    const { hints, currentHintIndex } = get();
    
    if (currentHintIndex >= hints.length - 1) {
      return null; // No more hints available
    }
    
    const nextHintIndex = currentHintIndex + 1;
    set({ currentHintIndex: nextHintIndex });
    
    return hints[nextHintIndex];
  },
  
  resetHints: () => {
    set({ currentHintIndex: -1 });
  },
  
  isPuzzleActive: () => {
    return get().activePuzzle !== null;
  },
  
  isPuzzleSolved: (puzzleId) => {
    return get().puzzlesSolved.includes(puzzleId);
  },
  
  canSolvePuzzle: (puzzle) => {
    // If puzzle has no skill requirements, anyone can solve it
    if (!puzzle.requiredSkill) return true;
    
    // Check if the character has the required skill level
    const character = useCharacter.getState();
    return character.hasSkillLevel(
      puzzle.requiredSkill.type,
      puzzle.requiredSkill.level
    );
  }
}));
