import React from 'react';

interface StarQuestManagerProps {
  onQuestComplete?: () => void;
}

export default function StarQuestManager({ onQuestComplete }: StarQuestManagerProps) {
  // This is now a legacy component - use MissionModal instead for popup functionality
  return null;
}