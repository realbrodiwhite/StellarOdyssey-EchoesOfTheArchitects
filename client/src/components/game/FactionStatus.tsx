import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStory } from '@/lib/stores/useStory';
import { Faction } from '@/lib/types';
import { factionData, getReputationTitle, getReputationColor } from '@/lib/data/factions';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';

interface FactionStatusProps {
  onClose: () => void;
}

const FactionStatus: React.FC<FactionStatusProps> = ({ onClose }) => {
  const { getFactionReputation } = useStory();
  const [selectedFaction, setSelectedFaction] = useState<Faction>(Faction.Alliance);
  
  const handleSelectFaction = (factionId: string) => {
    setSelectedFaction(factionId as Faction);
  };
  
  const factions = Object.values(factionData);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <Card className="w-full max-w-4xl bg-gray-900 text-white overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-800">
          <h2 className="text-2xl font-bold">Faction Relations</h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        
        <div className="p-6">
          <Tabs
            value={selectedFaction}
            onValueChange={handleSelectFaction}
            className="w-full"
          >
            <TabsList className="mb-6 grid grid-cols-3 sm:grid-cols-6">
              {factions.map(faction => (
                <TabsTrigger
                  key={faction.id}
                  value={faction.id}
                  className="text-sm"
                >
                  {faction.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {factions.map(faction => {
              const reputation = getFactionReputation(faction.id);
              const repTitle = getReputationTitle(reputation);
              const repColor = getReputationColor(reputation);
              
              const normalizedRep = ((reputation + 100) / 200) * 100; // normalize from -100...100 to 0...100 for progress bar
              
              return (
                <TabsContent key={faction.id} value={faction.id} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-full sm:w-1/3">
                      <div 
                        className="w-full h-24 rounded-lg mb-2" 
                        style={{ 
                          background: `linear-gradient(135deg, ${faction.colors.primary} 0%, ${faction.colors.secondary} 100%)` 
                        }}
                      />
                      <h3 className="text-xl font-bold">{faction.name}</h3>
                      <p className="text-sm text-gray-300">{faction.leaderTitle}</p>
                      <p className="text-sm text-gray-300">Base: {faction.homeBase}</p>
                      <p className="mt-2 text-sm text-gray-300">Specializes in: {faction.specialization}</p>
                    </div>
                    
                    <div className="w-full sm:w-2/3">
                      <p className="text-sm mb-4">{faction.description}</p>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs">Hostile</span>
                          <span 
                            className="text-sm font-semibold" 
                            style={{ color: repColor }}
                          >
                            {repTitle} ({reputation})
                          </span>
                          <span className="text-xs">Allied</span>
                        </div>
                        <Progress value={normalizedRep} className="h-2" />
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-semibold">Relations:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-400">Allies:</p>
                            <ul className="list-disc list-inside text-sm">
                              {faction.allies.length > 0 ? (
                                faction.allies.map(allyId => (
                                  <li key={allyId} className="text-green-400">
                                    {factionData[allyId].name}
                                  </li>
                                ))
                              ) : (
                                <li className="text-gray-500">None</li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Enemies:</p>
                            <ul className="list-disc list-inside text-sm">
                              {faction.enemies.length > 0 ? (
                                faction.enemies.map(enemyId => (
                                  <li key={enemyId} className="text-red-400">
                                    {factionData[enemyId].name}
                                  </li>
                                ))
                              ) : (
                                <li className="text-gray-500">None</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Your Status:</h4>
                        <div className="bg-gray-800 p-3 rounded-md">
                          <p className="text-sm">
                            {reputation > 50 
                              ? `You are well-respected among the ${faction.name}. Their territories welcome you, and you have access to special missions and resources.`
                              : reputation > 0
                                ? `You are in good standing with the ${faction.name}. Most of their members treat you favorably.`
                                : reputation > -25 
                                  ? `The ${faction.name} are neutral toward you. You can move through their territories without trouble, but receive no special treatment.`
                                  : `The ${faction.name} view you with suspicion or hostility. Be careful in their territories.`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default FactionStatus;