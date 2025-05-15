import { v4 as uuidv4 } from 'uuid';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  progress?: number;
  maxProgress?: number;
  dateCompleted?: number;
  reward?: string;
  isHidden?: boolean;
}

export const achievements: Achievement[] = [
  {
    id: uuidv4(),
    name: "First Steps",
    description: "Complete the tutorial mission.",
    completed: false,
    reward: "Access to ship's navigation systems",
    isHidden: false
  },
  {
    id: uuidv4(),
    name: "Cosmic Surveyor",
    description: "Visit 3 different locations in space.",
    completed: false,
    progress: 0,
    maxProgress: 3,
    reward: "Enhanced scanner range",
    isHidden: false
  },
  {
    id: uuidv4(),
    name: "Emergency Response",
    description: "Successfully defend against a pirate ambush.",
    completed: false,
    reward: "Combat maneuvering tutorial",
    isHidden: false
  },
  {
    id: uuidv4(),
    name: "Technical Genius",
    description: "Solve your first technical puzzle.",
    completed: false,
    reward: "Ship's AI Companion System activation",
    isHidden: false
  },
  {
    id: uuidv4(),
    name: "First Contact",
    description: "Meet and interact with an alien species.",
    completed: false,
    reward: "Translation module for your Companion AI",
    isHidden: false
  },
  {
    id: uuidv4(),
    name: "Combat Veteran",
    description: "Win your first space combat encounter.",
    completed: false,
    reward: "Combat analysis module for your Companion AI",
    isHidden: false
  },
  {
    id: uuidv4(),
    name: "Explorer's Intuition",
    description: "Discover a hidden location not shown on standard star charts.",
    completed: false,
    reward: "Advanced navigation module for your Companion AI",
    isHidden: false
  },
  {
    id: uuidv4(),
    name: "Data Miner",
    description: "Collect 5 pieces of valuable data from various sources.",
    completed: false,
    progress: 0,
    maxProgress: 5,
    reward: "Research enhancement module for your Companion AI",
    isHidden: false
  }
];