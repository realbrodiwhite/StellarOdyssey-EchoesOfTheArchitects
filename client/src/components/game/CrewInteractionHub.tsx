import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DialogueTree, getAvailableDialogueTrees } from '@/lib/data/crewDialogueTrees';
import { useCompanion, CompanionPersonality, RelationshipLevel } from '@/lib/stores/useCompanion';
import { useGameProgress } from '@/lib/stores/useGameProgress';
import { PartyMember } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CrewInteraction from './CrewInteraction';

interface CrewInteractionHubProps {
  onClose: () => void;
  location?: string;
}

const CrewInteractionHub: React.FC<CrewInteractionHubProps> = ({ 
  onClose,
  location
}) => {
  // Get companions and game progress data
  const { activeCompanion, availableCompanions } = useCompanion();
  const { getCurrentActNumber } = useGameProgress();
  
  // Use act number as a proxy for game progress (1-5 scale)
  const gameProgress = getCurrentActNumber();
  
  // State for managing the UI and selections
  const [selectedCrewMember, setSelectedCrewMember] = useState<PartyMember | null>(null);
  const [availableDialogues, setAvailableDialogues] = useState<DialogueTree[]>([]);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedDialogue, setSelectedDialogue] = useState<DialogueTree | null>(null);
  const [unlocks, setUnlocks] = useState<string[]>([]);
  
  // Effect to reset available dialogues when crew member selection changes
  useEffect(() => {
    if (selectedCrewMember && activeCompanion) {
      // Get dialogues available for this crew member
      const dialogues = getAvailableDialogueTrees(
        selectedCrewMember.id,
        activeCompanion.personality as CompanionPersonality,
        activeCompanion.relationship as RelationshipLevel,
        gameProgress,
        location
      );
      
      setAvailableDialogues(dialogues);
    } else {
      setAvailableDialogues([]);
    }
  }, [selectedCrewMember, activeCompanion, gameProgress, location]);
  
  // Handle crew member selection
  const handleSelectCrewMember = (crewMember: PartyMember) => {
    setSelectedCrewMember(crewMember);
    setSelectedDialogue(null); // Reset dialogue selection
  };
  
  // Handle dialogue selection
  const handleSelectDialogue = (dialogue: DialogueTree) => {
    setSelectedDialogue(dialogue);
  };
  
  // Handle dialogue completion
  const handleDialogueComplete = (newUnlocks: string[]) => {
    if (newUnlocks.length > 0) {
      setUnlocks(prev => [...prev, ...newUnlocks]);
    }
    
    // Close the dialogue interface
    setSelectedDialogue(null);
  };
  
  // Get the appropriate icon for a crew member based on their class or role
  const getCrewMemberIcon = (crewMember: PartyMember) => {
    switch (crewMember.class.toLowerCase()) {
      case 'engineer':
        return '🔧';
      case 'scientist':
        return '🔬';
      case 'soldier':
      case 'mercenary':
        return '🪖';
      case 'diplomat':
        return '🤝';
      case 'pilot':
        return '🚀';
      case 'explorer':
        return '🧭';
      case 'medic':
        return '⚕️';
      case 'captain':
        return '👨‍✈️';
      default:
        return '👤';
    }
  };
  
  // Get color for relationship level
  const getRelationshipColor = (level: RelationshipLevel) => {
    switch (level) {
      case RelationshipLevel.Distrustful:
        return 'text-red-500';
      case RelationshipLevel.Neutral:
        return 'text-gray-300';
      case RelationshipLevel.Cooperative:
        return 'text-blue-400';
      case RelationshipLevel.Friendly:
        return 'text-green-400';
      case RelationshipLevel.Devoted:
        return 'text-purple-400';
      default:
        return 'text-gray-300';
    }
  };
  
  // Render a crew member card
  const renderCrewMemberCard = (crewMember: PartyMember) => {
    const isSelected = selectedCrewMember?.id === crewMember.id;
    
    return (
      <motion.div
        key={crewMember.id}
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'border-blue-500 bg-gray-800' 
            : 'border-gray-700 bg-gray-900 hover:bg-gray-850'
        }`}
        whileHover={{ scale: 1.02 }}
        onClick={() => handleSelectCrewMember(crewMember)}
      >
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">
            {getCrewMemberIcon(crewMember)}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white">{crewMember.name}</h3>
                <p className="text-sm text-gray-400">{crewMember.class}</p>
              </div>
              
              {activeCompanion && (
                <Badge 
                  className="bg-gray-700"
                  variant="secondary"
                >
                  <span className={getRelationshipColor(activeCompanion.relationship as RelationshipLevel)}>
                    {activeCompanion.relationship}
                  </span>
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
              {crewMember.description || 'Crew member aboard your vessel.'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Render a dialogue option card
  const renderDialogueCard = (dialogue: DialogueTree) => {
    return (
      <motion.div
        key={dialogue.id}
        className="p-4 border border-gray-700 rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-850"
        whileHover={{ scale: 1.02 }}
        onClick={() => handleSelectDialogue(dialogue)}
      >
        <h3 className="font-bold text-white">{dialogue.title}</h3>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{dialogue.description}</p>
        
        {dialogue.availability.requiredRelationship && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              Requires {dialogue.availability.requiredRelationship} Relationship
            </Badge>
          </div>
        )}
      </motion.div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with title and close button */}
        <div className="border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Crew Interactions</h2>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-gray-700">
            <TabsList className="bg-gray-800 mx-4 my-2">
              <TabsTrigger 
                value="available" 
                onClick={() => setActiveTab('available')}
                className={activeTab === 'available' ? 'bg-gray-700' : ''}
              >
                Available Crew
              </TabsTrigger>
              <TabsTrigger 
                value="recent" 
                onClick={() => setActiveTab('recent')}
                className={activeTab === 'recent' ? 'bg-gray-700' : ''}
              >
                Recent Conversations
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {activeTab === 'available' ? (
              <div className="flex h-full">
                {/* Crew member list */}
                <div className="w-1/2 border-r border-gray-700 p-4 overflow-auto">
                  <h3 className="text-lg font-semibold text-white mb-3">Crew Members</h3>
                  
                  {availableCompanions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No crew members available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableCompanions.map(companion => {
                        // Convert Companion to PartyMember to satisfy type requirements
                        const partyMember = {
                          id: companion.id,
                          name: companion.name,
                          class: companion.specialization || "Crew Member", 
                          description: companion.backstory,
                          skills: [], 
                          health: 100,
                          maxHealth: 100,
                          energy: 100,
                          maxEnergy: 100,
                          level: 1,
                          experience: 0,
                          inventory: [],
                          abilities: [],
                          gender: "Male",
                        } as unknown as PartyMember;
                        return renderCrewMemberCard(partyMember);
                      })}
                    </div>
                  )}
                </div>
                
                {/* Available dialogues for selected crew member */}
                <div className="w-1/2 p-4 overflow-auto">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {selectedCrewMember ? 
                      `Conversations with ${selectedCrewMember.name}` : 
                      'Select a crew member'
                    }
                  </h3>
                  
                  {selectedCrewMember ? (
                    availableDialogues.length > 0 ? (
                      <div className="space-y-3">
                        {availableDialogues.map(dialogue => 
                          renderDialogueCard(dialogue)
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No conversations available with this crew member at this time</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-gray-400">Select a crew member to see available conversations</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Recent Interactions</h3>
                
                {unlocks.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <h4 className="font-semibold text-white">Unlocked Content</h4>
                      <ul className="mt-2 space-y-1">
                        {unlocks.map((unlock, index) => (
                          <li key={index} className="text-green-400 text-sm">
                            • {unlock.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <p className="text-gray-400 text-sm">
                      Recent conversations and their outcomes will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No recent interactions</p>
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Active dialogue overlay */}
      <AnimatePresence>
        {selectedDialogue && selectedCrewMember && (
          <CrewInteraction
            dialogueTree={selectedDialogue}
            crewMemberId={selectedCrewMember.id}
            onClose={() => setSelectedDialogue(null)}
            onComplete={handleDialogueComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrewInteractionHub;