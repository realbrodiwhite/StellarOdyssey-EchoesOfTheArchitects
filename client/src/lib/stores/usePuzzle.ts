import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { puzzleTemplates, puzzleLookup, PuzzleTemplate, PuzzleSolution } from '../data/puzzle-templates';
import { useCharacter } from './useCharacter';
import { Item, SkillType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { itemTemplates } from './useInventory';

// Tracking active and completed puzzles
interface PuzzleState {
  activePuzzleId: string | null;
  completedPuzzles: string[];
  currentAttempts: number;
  maxAttempts: number;
  usedHints: string[];
  attemptedSolutions: string[];
  currentSolutionId: string | null;
  puzzleOutcome: {
    success: boolean;
    solutionId: string;
    outcomeText: string;
    rewards: {
      experience: number;
      items: Item[];
    } | null;
  } | null;
  timeRemaining: number | null; // For timed puzzles
  
  // Actions
  startPuzzle: (puzzleId: string) => void;
  attemptSolution: (solutionId: string) => Promise<boolean>;
  useHint: (hintIndex: number) => string;
  getRemainingAttempts: () => number;
  resetPuzzle: () => void;
  abandonPuzzle: () => void;
  getActivePuzzle: () => PuzzleTemplate | null;
  getPuzzleById: (puzzleId: string) => PuzzleTemplate | null;
  checkPuzzleCompletion: (puzzleId: string) => boolean;
  getAvailablePuzzles: () => PuzzleTemplate[];
  updateTimer: () => void;
}

export const usePuzzle = create<PuzzleState>()(
  persist(
    (set, get) => ({
      activePuzzleId: null,
      completedPuzzles: [],
      currentAttempts: 0,
      maxAttempts: 3,
      usedHints: [],
      attemptedSolutions: [],
      currentSolutionId: null,
      puzzleOutcome: null,
      timeRemaining: null,
      
      startPuzzle: (puzzleId: string) => {
        const puzzle = puzzleLookup[puzzleId];
        if (!puzzle) {
          console.error(`Puzzle not found: ${puzzleId}`);
          return;
        }
        
        set({
          activePuzzleId: puzzleId,
          currentAttempts: 0,
          usedHints: [],
          attemptedSolutions: [],
          currentSolutionId: null,
          puzzleOutcome: null,
          timeRemaining: puzzle.timeLimit || null
        });
        
        console.log(`Started puzzle: ${puzzle.name}`);
      },
      
      attemptSolution: async (solutionId: string) => {
        const { activePuzzleId, currentAttempts, maxAttempts } = get();
        
        if (!activePuzzleId) {
          console.error('No active puzzle');
          return false;
        }
        
        if (currentAttempts >= maxAttempts) {
          console.log('Maximum attempts reached');
          return false;
        }
        
        const puzzle = puzzleLookup[activePuzzleId];
        if (!puzzle) {
          console.error('Puzzle data not found');
          return false;
        }
        
        const solution = puzzle.solutions.find(s => s.id === solutionId);
        if (!solution) {
          console.error(`Solution not found: ${solutionId}`);
          return false;
        }
        
        // Check if character meets skill requirements
        let skillCheckPassed = true;
        if (solution.requiredSkill) {
          const { character } = useCharacter.getState();
          const relevantSkill = character.skills.find(
            skill => skill.type === solution.requiredSkill?.type
          );
          
          if (!relevantSkill || relevantSkill.level < (solution.requiredSkill?.level || 0)) {
            skillCheckPassed = false;
            console.log(`Skill check failed. Required: ${solution.requiredSkill.type} level ${solution.requiredSkill.level}`);
          }
        }
        
        // Check if character has enough energy
        const { character, useEnergy } = useCharacter.getState();
        if (character.energy < solution.energyCost) {
          console.log(`Not enough energy. Required: ${solution.energyCost}, Available: ${character.energy}`);
          return false;
        }
        
        // Use energy for the attempt
        useEnergy(solution.energyCost);
        
        // Increase attempt counter
        set(state => ({
          currentAttempts: state.currentAttempts + 1,
          attemptedSolutions: [...state.attemptedSolutions, solutionId],
          currentSolutionId: solutionId
        }));
        
        // Calculate success rate
        let baseSuccessRate = solution.successRate;
        
        // Modify success rate based on skill level if requirement is met
        if (skillCheckPassed && solution.requiredSkill) {
          const { character } = useCharacter.getState();
          const relevantSkill = character.skills.find(
            skill => skill.type === solution.requiredSkill?.type
          );
          
          if (relevantSkill) {
            // Bonus 5% per level above requirement
            const levelDifference = relevantSkill.level - (solution.requiredSkill?.level || 0);
            if (levelDifference > 0) {
              baseSuccessRate += levelDifference * 5;
            }
          }
        }
        
        // Cap success rate at 95%
        const successRate = Math.min(baseSuccessRate, 95);
        
        // Determine outcome
        const roll = Math.random() * 100;
        const success = roll <= successRate;
        
        // Generate rewards if successful
        let rewards = null;
        if (success) {
          // Calculate experience based on puzzle difficulty and solution reward modifier
          const experienceReward = Math.round(
            puzzle.baseExperienceReward * solution.rewardModifier
          );
          
          // Give experience to character
          const { gainExperience } = useCharacter.getState();
          gainExperience(experienceReward);
          
          // Potential item rewards based on difficulty
          const items: Item[] = [];
          
          // 25% chance for item reward on success
          if (Math.random() < 0.25) {
            // Select a random item type based on the puzzle type and solution
            const itemKeys = Object.keys(itemTemplates);
            const randomItemKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
            
            if (randomItemKey) {
              const itemTemplate = itemTemplates[randomItemKey];
              const item: Item = {
                ...itemTemplate,
                id: uuidv4()
              };
              
              items.push(item);
              
              // Add item to inventory
              const { addItem } = useCharacter.getState();
              addItem(item);
            }
          }
          
          rewards = {
            experience: experienceReward,
            items
          };
          
          // Add to completed puzzles if not already completed
          if (!get().completedPuzzles.includes(activePuzzleId)) {
            set(state => ({
              completedPuzzles: [...state.completedPuzzles, activePuzzleId]
            }));
          }
        }
        
        // Set outcome
        set({
          puzzleOutcome: {
            success,
            solutionId,
            outcomeText: success ? solution.outcomeDescription.success : solution.outcomeDescription.failure,
            rewards
          }
        });
        
        console.log(`Puzzle attempt result: ${success ? 'Success' : 'Failure'}`);
        return success;
      },
      
      useHint: (hintIndex: number) => {
        const { activePuzzleId, usedHints } = get();
        
        if (!activePuzzleId) {
          console.error('No active puzzle');
          return 'No active puzzle';
        }
        
        const puzzle = puzzleLookup[activePuzzleId];
        if (!puzzle) {
          console.error('Puzzle data not found');
          return 'Puzzle data not found';
        }
        
        if (hintIndex < 0 || hintIndex >= puzzle.hints.length) {
          console.error('Invalid hint index');
          return 'Invalid hint index';
        }
        
        const hintId = `${activePuzzleId}_hint_${hintIndex}`;
        
        // Check if hint already used
        if (usedHints.includes(hintId)) {
          return puzzle.hints[hintIndex];
        }
        
        // Mark hint as used
        set(state => ({
          usedHints: [...state.usedHints, hintId]
        }));
        
        return puzzle.hints[hintIndex];
      },
      
      getRemainingAttempts: () => {
        const { currentAttempts, maxAttempts } = get();
        return Math.max(0, maxAttempts - currentAttempts);
      },
      
      resetPuzzle: () => {
        const { activePuzzleId } = get();
        
        if (!activePuzzleId) {
          console.error('No active puzzle');
          return;
        }
        
        const puzzle = puzzleLookup[activePuzzleId];
        
        set({
          currentAttempts: 0,
          usedHints: [],
          attemptedSolutions: [],
          currentSolutionId: null,
          puzzleOutcome: null,
          timeRemaining: puzzle?.timeLimit || null
        });
        
        console.log('Puzzle reset');
      },
      
      abandonPuzzle: () => {
        set({
          activePuzzleId: null,
          currentAttempts: 0,
          usedHints: [],
          attemptedSolutions: [],
          currentSolutionId: null,
          puzzleOutcome: null,
          timeRemaining: null
        });
        
        console.log('Puzzle abandoned');
      },
      
      getActivePuzzle: () => {
        const { activePuzzleId } = get();
        if (!activePuzzleId) return null;
        
        return puzzleLookup[activePuzzleId] || null;
      },
      
      getPuzzleById: (puzzleId: string) => {
        return puzzleLookup[puzzleId] || null;
      },
      
      checkPuzzleCompletion: (puzzleId: string) => {
        return get().completedPuzzles.includes(puzzleId);
      },
      
      getAvailablePuzzles: () => {
        const { completedPuzzles } = get();
        
        // For now, all puzzles are available except completed ones
        // In a real game, you would filter based on the player's progress, location, etc.
        return puzzleTemplates.filter(puzzle => !completedPuzzles.includes(puzzle.id));
      },
      
      updateTimer: () => {
        const { timeRemaining, activePuzzleId } = get();
        
        if (timeRemaining === null || !activePuzzleId) return;
        
        if (timeRemaining <= 0) {
          // Time's up - auto-fail the puzzle
          set({
            puzzleOutcome: {
              success: false,
              solutionId: '',
              outcomeText: 'You ran out of time to solve the puzzle.',
              rewards: null
            },
            timeRemaining: 0
          });
          
          console.log('Puzzle failed: Time expired');
          return;
        }
        
        // Decrement timer
        set({ timeRemaining: timeRemaining - 1 });
      }
    }),
    {
      name: 'puzzle-storage',
      partialize: (state) => ({
        completedPuzzles: state.completedPuzzles
      })
    }
  )
);

export default usePuzzle;