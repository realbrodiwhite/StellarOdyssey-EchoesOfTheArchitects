import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParty, PartyMember, initializeStarterCompanions } from '@/lib/stores/useParty';
import { useCharacter } from '@/lib/stores/useCharacter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import PartyMemberCard from './PartyMemberCard';

interface SimplePartyManagerProps {
  onClose: () => void;
}

const SimplePartyManager: React.FC<SimplePartyManagerProps> = ({ onClose }) => {
  const { 
    partyMembers, 
    activePartyMembers, 
    availableCompanions,
    addPartyMember, 
    activatePartyMember, 
    deactivatePartyMember,
    purchaseCompanion,
    isPartyFull,
    maxPartySize
  } = useParty();
  
  const { selectedCharacter } = useCharacter();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Initialize starter companions if we don't have any
  useEffect(() => {
    if (availableCompanions.length === 0) {
      initializeStarterCompanions();
    }
  }, [availableCompanions.length]);
  
  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id === selectedMemberId ? null : id);
  };
  
  const handleActivate = (id: string) => {
    if (isPartyFull()) {
      // Show a message that party is full
      alert('Your party is already full. Deactivate a member first.');
      return;
    }
    activatePartyMember(id);
  };
  
  const handleDeactivate = (id: string) => {
    deactivatePartyMember(id);
  };
  
  const handleRecruitCompanion = (id: string) => {
    const success = purchaseCompanion(id);
    if (!success) {
      // If recruitment fails (not enough credits)
      alert('Not enough credits to recruit this companion');
    }
  };
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Party Management</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>&times;</Button>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="text-white font-semibold">
              Party: {activePartyMembers.length}/{maxPartySize}
            </div>
            {selectedCharacter?.credits !== undefined && (
              <div className="flex items-center text-yellow-400">
                <span>💰</span>
                <span className="ml-1">{selectedCharacter.credits} Credits</span>
              </div>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="party" className="flex-1 flex flex-col">
          <div className="px-4 border-b border-gray-700">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="party">Your Party</TabsTrigger>
              <TabsTrigger value="available">Available Companions</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="party" className="h-full mt-0">
              {partyMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-bold text-white mb-2">No Companions Yet</h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    You don't have any companions in your party yet. 
                    Check the "Available Companions" tab to recruit some allies for your journey.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partyMembers.map(member => (
                    <PartyMemberCard
                      key={member.id}
                      partyMember={member}
                      isActive={activePartyMembers.some(m => m.id === member.id)}
                      onClick={() => handleSelectMember(member.id)}
                      onActivate={() => handleActivate(member.id)}
                      onDeactivate={() => handleDeactivate(member.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="available" className="h-full mt-0">
              {availableCompanions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-bold text-white mb-2">No Available Companions</h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    There are no companions available for recruitment at this time.
                    Continue exploring the galaxy to discover potential allies.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableCompanions.map(companion => (
                    <div key={companion.id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white">{companion.name}</h3>
                          <div className="text-sm text-gray-400">
                            Level {companion.level} {companion.class} - {companion.specialization}
                          </div>
                          <p className="text-gray-300 mt-2 text-sm">
                            {companion.description}
                          </p>
                        </div>
                        
                        {companion.cost && (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center text-yellow-400 mb-2">
                              <span>💰</span>
                              <span className="ml-1">{companion.cost} Credits</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleRecruitCompanion(companion.id)}
                              disabled={!selectedCharacter?.credits || selectedCharacter.credits < companion.cost}
                            >
                              Recruit
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="bg-gray-900 p-2 rounded">
                          <div className="text-xs text-blue-400">Health</div>
                          <div className="text-sm text-white">
                            {companion.health}/{companion.maxHealth}
                          </div>
                        </div>
                        <div className="bg-gray-900 p-2 rounded">
                          <div className="text-xs text-blue-400">Energy</div>
                          <div className="text-sm text-white">
                            {companion.energy}/{companion.maxEnergy}
                          </div>
                        </div>
                        <div className="bg-gray-900 p-2 rounded">
                          <div className="text-xs text-blue-400">Key Skills</div>
                          <div className="text-sm text-white">
                            {companion.skills[0]?.name}, {companion.skills[1]?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="border-t border-gray-700 p-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SimplePartyManager;