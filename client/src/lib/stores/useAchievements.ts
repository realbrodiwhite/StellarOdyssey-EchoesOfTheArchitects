import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Achievement, achievements as initialAchievements } from '../data/achievements';

interface AchievementState {
  // Properties
  achievements: Achievement[];
  unlockedCompanionAI: boolean;
  
  // Actions
  completeAchievement: (id: string) => void;
  incrementAchievementProgress: (id: string, amount: number) => void;
  resetAchievements: () => void;
  
  // Getters
  getAchievement: (id: string) => Achievement | undefined;
  isAchievementCompleted: (id: string) => boolean;
  getCompletedAchievements: () => Achievement[];
  hasUnlockedCompanionAI: () => boolean;
}

export const useAchievements = create<AchievementState>()(
  persist(
    (set, get) => ({
      // Initial state
      achievements: [...initialAchievements],
      unlockedCompanionAI: false,
      
      // Actions
      completeAchievement: (id: string) => {
        set(state => {
          const newAchievements = state.achievements.map(achievement => {
            if (achievement.id === id && !achievement.completed) {
              // Mark the achievement as completed
              const completedAchievement = {
                ...achievement,
                completed: true,
                dateCompleted: Date.now()
              };
              
              // Check if this achievement unlocks the Companion AI
              if (achievement.reward?.includes('AI Companion')) {
                return {
                  ...completedAchievement,
                  // Update unlockedCompanionAI separately to ensure state consistency
                  unlockedCompanionAI: true
                };
              }
              
              return completedAchievement;
            }
            return achievement;
          });
          
          // Check if the "Technical Genius" achievement was completed
          const techGeniusAchievement = newAchievements.find(
            a => a.name === "Technical Genius" && a.completed
          );
          
          return {
            achievements: newAchievements,
            unlockedCompanionAI: techGeniusAchievement ? true : state.unlockedCompanionAI
          };
        });
        
        // Log achievement completion
        const achievement = get().getAchievement(id);
        if (achievement && !achievement.isHidden) {
          console.log(`Achievement unlocked: ${achievement.name}`);
        }
      },
      
      incrementAchievementProgress: (id: string, amount: number) => {
        set(state => {
          const newAchievements = state.achievements.map(achievement => {
            if (achievement.id === id && !achievement.completed) {
              // Calculate new progress
              const newProgress = (achievement.progress || 0) + amount;
              const maxProgress = achievement.maxProgress || 1;
              
              // Check if achievement is completed
              if (newProgress >= maxProgress) {
                return {
                  ...achievement,
                  progress: maxProgress,
                  completed: true,
                  dateCompleted: Date.now()
                };
              }
              
              // Just update progress
              return {
                ...achievement,
                progress: newProgress
              };
            }
            return achievement;
          });
          
          // Check if the "Technical Genius" achievement was completed
          const techGeniusAchievement = newAchievements.find(
            a => a.name === "Technical Genius" && a.completed
          );
          
          return {
            achievements: newAchievements,
            unlockedCompanionAI: techGeniusAchievement ? true : state.unlockedCompanionAI
          };
        });
        
        // Check if achievement was completed by this increment
        const achievement = get().getAchievement(id);
        if (achievement && achievement.completed && !achievement.isHidden) {
          console.log(`Achievement unlocked: ${achievement.name}`);
        }
      },
      
      resetAchievements: () => {
        set({
          achievements: [...initialAchievements],
          unlockedCompanionAI: false
        });
      },
      
      // Getters
      getAchievement: (id: string) => {
        return get().achievements.find(achievement => achievement.id === id);
      },
      
      isAchievementCompleted: (id: string) => {
        const achievement = get().getAchievement(id);
        return achievement ? achievement.completed : false;
      },
      
      getCompletedAchievements: () => {
        return get().achievements.filter(achievement => achievement.completed);
      },
      
      hasUnlockedCompanionAI: () => {
        return get().unlockedCompanionAI;
      }
    }),
    {
      name: "achievements-storage",
      partialize: (state) => ({
        achievements: state.achievements,
        unlockedCompanionAI: state.unlockedCompanionAI
      })
    }
  )
);