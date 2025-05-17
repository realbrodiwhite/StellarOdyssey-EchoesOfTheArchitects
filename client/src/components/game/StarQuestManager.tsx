import React, { useState, useEffect } from 'react';
import useStarQuest from '@/lib/stores/useStarQuest';
import StoryQuest from './StoryQuest';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { StorylineTheme } from '@/lib/data/mission-pool';

interface StarQuestManagerProps {
  onQuestComplete?: () => void;
}

const StarQuestManager: React.FC<StarQuestManagerProps> = ({ onQuestComplete }) => {
  const {
    getCurrentMission,
    startMission,
    getAvailableMissionsForStage,
    getCurrentStage,
    progress
  } = useStarQuest();
  
  const [showQuestDialog, setShowQuestDialog] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [availableMissions, setAvailableMissions] = useState<any[]>([]);
  
  // Load available missions for the current stage
  useEffect(() => {
    const currentStage = getCurrentStage();
    const missions = getAvailableMissionsForStage(currentStage);
    setAvailableMissions(missions);
  }, [getCurrentStage, getAvailableMissionsForStage, progress.completedMissions]);
  
  // Check if we have an active mission
  const currentMission = getCurrentMission();
  
  // Handle mission selection
  const handleSelectMission = (missionId: string) => {
    setSelectedQuestId(missionId);
    setShowQuestDialog(true);
  };
  
  // Handle mission completion
  const handleQuestComplete = () => {
    setShowQuestDialog(false);
    setSelectedQuestId(null);
    
    if (onQuestComplete) {
      onQuestComplete();
    }
  };
  
  // Get storyline color for badge
  const getStorylineColor = (storyline: string): string => {
    switch (storyline) {
      case StorylineTheme.Alliance:
        return 'bg-blue-600';
      case StorylineTheme.Syndicate:
        return 'bg-red-600';
      case StorylineTheme.Settlers:
        return 'bg-green-600';
      case StorylineTheme.Mystics:
        return 'bg-purple-600';
      case StorylineTheme.VoidEntity:
        return 'bg-gray-800';
      case StorylineTheme.Exploration:
        return 'bg-cyan-600';
      case StorylineTheme.Trade:
        return 'bg-amber-600';
      case StorylineTheme.Artifact:
        return 'bg-indigo-600';
      case StorylineTheme.Mystery:
        return 'bg-violet-600';
      case StorylineTheme.Rebellion:
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  return (
    <>
      {showQuestDialog && (
        <StoryQuest
          questId={selectedQuestId || undefined}
          onClose={() => setShowQuestDialog(false)}
          onComplete={handleQuestComplete}
        />
      )}
      
      <Card className="bg-gray-900 text-white p-4 max-w-md w-full mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Missions</h2>
          <Badge variant="outline" className="px-2 py-1">
            Act {getCurrentStage()}
          </Badge>
        </div>
        
        {/* Active mission status */}
        {currentMission && (
          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-300 mb-2">Current Mission</h3>
            <Card className="bg-gray-800 p-3 hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => setShowQuestDialog(true)}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{currentMission.title}</h4>
                  <p className="text-sm text-gray-400 truncate max-w-xs">{currentMission.description}</p>
                </div>
                <Badge className="ml-2">Active</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {currentMission.storylines.map(storyline => (
                  <Badge key={storyline} className={`${getStorylineColor(storyline)} text-xs`}>
                    {storyline}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        )}
        
        {/* Available missions */}
        {availableMissions.length > 0 ? (
          <div>
            <h3 className="text-md font-semibold text-gray-300 mb-2">Available Missions</h3>
            <div className="space-y-2">
              {availableMissions.map(mission => (
                <Card 
                  key={mission.id} 
                  className="bg-gray-800 p-3 hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => handleSelectMission(mission.id)}
                >
                  <div>
                    <h4 className="font-medium">{mission.title}</h4>
                    <p className="text-sm text-gray-400 truncate">{mission.description}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {mission.storylines.map((storyline: string) => (
                      <Badge key={storyline} className={`${getStorylineColor(storyline)} text-xs`}>
                        {storyline}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            No missions available at this time.
            {progress.completedMissions.length > 0 ? ' Continue exploring to unlock more missions.' : ' Start your first mission to begin your journey.'}
          </p>
        )}
        
        {/* Action buttons */}
        <div className="mt-4 flex justify-end">
          {!showQuestDialog && !currentMission && availableMissions.length > 0 && (
            <Button
              onClick={() => handleSelectMission(availableMissions[0].id)}
              className="w-full"
            >
              Start Next Mission
            </Button>
          )}
          
          {!showQuestDialog && currentMission && (
            <Button
              onClick={() => setShowQuestDialog(true)}
              className="w-full"
            >
              Continue Current Mission
            </Button>
          )}
        </div>
      </Card>
    </>
  );
};

export default StarQuestManager;