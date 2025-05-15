import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStarQuest, { QuestEvent } from '@/lib/stores/useStarQuest';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { StorylineTheme } from '@/lib/data/mission-pool';
import { useStory } from '@/lib/stores/useStory';
import { Faction } from '@/lib/types';

interface StoryRecordProps {
  onClose: () => void;
}

// Helper function to format timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
};

const StoryRecord: React.FC<StoryRecordProps> = ({ onClose }) => {
  const { getStoryTimeline, getMissionById, getCurrentStage } = useStarQuest();
  const { getFactionReputation } = useStory();
  
  const [activeTab, setActiveTab] = useState<string>('missions');
  const [timelineEvents, setTimelineEvents] = useState<QuestEvent[]>([]);
  
  useEffect(() => {
    const events = getStoryTimeline();
    setTimelineEvents(events);
  }, [getStoryTimeline]);
  
  // Get the storyline color for badges
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
  
  // Get faction reputation color
  const getFactionColor = (faction: Faction): string => {
    const reputation = getFactionReputation(faction);
    
    if (reputation >= 50) return 'bg-green-600';
    if (reputation >= 25) return 'bg-green-500';
    if (reputation > 0) return 'bg-green-400';
    if (reputation === 0) return 'bg-gray-500';
    if (reputation > -25) return 'bg-red-400';
    if (reputation > -50) return 'bg-red-500';
    return 'bg-red-600';
  };
  
  // Get current reputation for all factions
  const factionReputations = Object.values(Faction).map(faction => ({
    faction,
    reputation: getFactionReputation(faction)
  }));
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto bg-gray-900 text-white">
        <div className="flex items-center justify-between p-4 bg-gray-800 sticky top-0 z-10">
          <h2 className="text-2xl font-bold">Story Record</h2>
          <Badge variant="outline">Stage {getCurrentStage()}</Badge>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="missions">Mission History</TabsTrigger>
              <TabsTrigger value="factions">Faction Relations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="missions" className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Your Journey</h3>
              
              {timelineEvents.length > 0 ? (
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => {
                    const mission = getMissionById(event.missionId);
                    if (!mission) return null;
                    
                    const choice = mission.choices.find(c => c.id === event.choiceId);
                    const outcome = mission.outcomes.find(o => o.id === event.outcomeId);
                    
                    return (
                      <div key={event.id} className="relative">
                        {/* Timeline connector */}
                        {index < timelineEvents.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-700" />
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-700 text-sm">
                            {index + 1}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold">{mission.title}</h4>
                              <span className="text-xs text-gray-400">{formatDate(event.timestamp)}</span>
                            </div>
                            
                            <div className="mt-1 flex flex-wrap gap-1">
                              {mission.storylines.map(storyline => (
                                <Badge key={storyline} className={`${getStorylineColor(storyline)} text-xs`}>
                                  {storyline}
                                </Badge>
                              ))}
                            </div>
                            
                            <Card className="mt-2 bg-gray-800 p-3">
                              <p className="text-sm text-gray-300 mb-3">{mission.description}</p>
                              
                              <div className="pl-4 border-l-2 border-blue-500">
                                <p className="text-sm font-medium">Your Choice:</p>
                                <p className="text-sm text-gray-300">{choice?.text}</p>
                              </div>
                              
                              <div className="mt-3 pl-4 border-l-2 border-green-500">
                                <p className="text-sm font-medium">Outcome:</p>
                                <p className="text-sm text-gray-300">{outcome?.text}</p>
                              </div>
                            </Card>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400">Your story has yet to unfold. Begin your journey by accepting your first mission.</p>
              )}
            </TabsContent>
            
            <TabsContent value="factions" className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Faction Relations</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                {factionReputations.map(({ faction, reputation }) => (
                  <Card key={faction} className="bg-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{faction}</h4>
                      <Badge className={`${getFactionColor(faction)}`}>
                        {reputation}
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getFactionColor(faction)}`}
                        style={{ 
                          width: `${Math.max(0, Math.min(100, ((reputation + 100) / 200) * 100))}%` 
                        }}
                      />
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-300">
                      {reputation > 75 ? (
                        `You are revered as a hero among the ${faction}.`
                      ) : reputation > 50 ? (
                        `You are considered a trusted ally of the ${faction}.`
                      ) : reputation > 25 ? (
                        `You are respected by the ${faction}.`
                      ) : reputation > 0 ? (
                        `The ${faction} view you favorably.`
                      ) : reputation > -25 ? (
                        `The ${faction} are neutral toward you.`
                      ) : reputation > -50 ? (
                        `The ${faction} are suspicious of your intentions.`
                      ) : reputation > -75 ? (
                        `The ${faction} consider you a hostile entity.`
                      ) : (
                        `The ${faction} view you as a dangerous enemy.`
                      )}
                    </p>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default StoryRecord;