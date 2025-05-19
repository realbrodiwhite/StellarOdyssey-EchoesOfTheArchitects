import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent } from '../ui/dialog';

import { crewMembers, findCrewMemberById } from '@/lib/data/crewMembers';
import { DialogueTree, findDialogueTree } from '@/lib/data/crewDialogueTrees';
import { useCrewRelationships, initializeCrewRelationships, RelationshipType } from '@/lib/stores/useCrewRelationships';
import { CompanionPersonality, RelationshipLevel } from '@/lib/stores/useCompanion';
import { useGameProgress } from '@/lib/stores/useGameProgress';
import DynamicDialogueSystem from './DynamicDialogueSystem';

// Interface for the CrewInteractionManager component
interface CrewInteractionManagerProps {
  onClose: () => void;
  currentLocation?: string;
}

// Initialize crew relationships if not already done
initializeCrewRelationships();

const CrewInteractionManager: React.FC<CrewInteractionManagerProps> = ({ 
  onClose,
  currentLocation
}) => {
  // Game progress state for story-dependent dialogues
  const { getCurrentActNumber } = useGameProgress();
  const gameProgress = getCurrentActNumber();
  
  // Relationship state 
  const { 
    getRelationshipLevel, 
    getRelationshipProgress, 
    getSignificantInteractions,
    getCrewRelationship,
    getCrewRelationships,
    revealRelationship
  } = useCrewRelationships();
  
  // Component state
  const [selectedCrewMember, setSelectedCrewMember] = useState<string | null>(null);
  const [availableDialogues, setAvailableDialogues] = useState<DialogueTree[]>([]);
  const [selectedDialogue, setSelectedDialogue] = useState<DialogueTree | null>(null);
  const [activeTab, setActiveTab] = useState('crew');
  const [relationshipLog, setRelationshipLog] = useState<{ id: string, description: string, effect: number, timestamp: number }[]>([]);
  const [revealedRelationships, setRevealedRelationships] = useState<string[]>([]);
  
  // Effect to load available dialogues when a crew member is selected
  useEffect(() => {
    if (selectedCrewMember) {
      // In a real implementation, you would fetch dialogues based on:
      // - Relationship level with this crew member
      // - Current game progress
      // - Current location
      // - Previous dialogue history
      // - Crew member's personality
      
      // For demo purposes, we'll load a simple dialogue
      const sampleDialogue = findDialogueTree("get-to-know-engineer");
      
      if (sampleDialogue) {
        setAvailableDialogues([sampleDialogue]);
      } else {
        setAvailableDialogues([]);
      }
      
      // Load relationship log
      const crewMember = findCrewMemberById(selectedCrewMember);
      if (crewMember) {
        const interactions = getSignificantInteractions(crewMember.id);
        setRelationshipLog(interactions);
        
        // Load crew relationships
        const relationships = getCrewRelationships(crewMember.id)
          .filter(rel => rel.visibleToPlayer)
          .map(rel => {
            // Find the other crew member in this relationship
            const otherCrewId = rel.between[0] === crewMember.id ? rel.between[1] : rel.between[0];
            const otherCrew = findCrewMemberById(otherCrewId);
            return {
              id: otherCrewId,
              name: otherCrew?.name || "Unknown Crew Member",
              type: rel.type,
              strength: rel.strength,
              background: rel.background
            };
          });
        
        setRevealedRelationships(relationships.map(r => r.id));
      }
    }
  }, [selectedCrewMember]);
  
  // Handle dialogue completion
  const handleDialogueComplete = (unlocks: string[]) => {
    // In a real implementation, you would handle unlocks like:
    // - New missions
    // - Revealed secrets
    // - Special items
    // - Crew relationship changes
    
    console.log("Dialogue completed with unlocks:", unlocks);
    
    // Reset the dialogue selection
    setSelectedDialogue(null);
    
    // Refresh available dialogues
    if (selectedCrewMember) {
      // Re-fetch available dialogues
      // For demo, we'll just keep the same ones
    }
  };
  
  // Get color for personality badge
  const getPersonalityColor = (personality: CompanionPersonality): string => {
    switch (personality) {
      case CompanionPersonality.Logical:
        return "bg-blue-600 text-white";
      case CompanionPersonality.Humorous:
        return "bg-amber-500 text-white";
      case CompanionPersonality.Caring:
        return "bg-green-600 text-white";
      case CompanionPersonality.Cynical:
        return "bg-zinc-600 text-white";
      case CompanionPersonality.Adventurous:
        return "bg-purple-600 text-white";
      case CompanionPersonality.Militant:
        return "bg-red-600 text-white";
      case CompanionPersonality.Scientific:
        return "bg-indigo-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };
  
  // Get color for relationship level
  const getRelationshipLevelColor = (level: RelationshipLevel): string => {
    switch (level) {
      case RelationshipLevel.Distrustful:
        return "text-red-500";
      case RelationshipLevel.Neutral:
        return "text-gray-400";
      case RelationshipLevel.Cooperative:
        return "text-blue-400";
      case RelationshipLevel.Friendly:
        return "text-green-400";
      case RelationshipLevel.Devoted:
        return "text-purple-500";
      default:
        return "text-gray-400";
    }
  };
  
  // Get color for relationship type
  const getRelationshipTypeColor = (type: RelationshipType): string => {
    switch (type) {
      case RelationshipType.Friend:
        return "bg-green-600";
      case RelationshipType.Rival:
        return "bg-amber-600";
      case RelationshipType.Antagonist:
        return "bg-red-600";
      case RelationshipType.Family:
        return "bg-purple-600";
      case RelationshipType.Mentor:
        return "bg-blue-600";
      case RelationshipType.Romantic:
        return "bg-pink-600";
      case RelationshipType.Professional:
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };
  
  // Create crew member card
  const renderCrewMemberCard = (crewMemberId: string) => {
    const crewMember = findCrewMemberById(crewMemberId);
    if (!crewMember) return null;
    
    const relationshipLevel = getRelationshipLevel(crewMember.id);
    const relationshipProgress = getRelationshipProgress(crewMember.id);
    const relationshipColor = getRelationshipLevelColor(relationshipLevel);
    const personalityColor = getPersonalityColor(crewMember.personality);
    
    return (
      <motion.div
        key={crewMember.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`p-4 bg-gray-800/60 rounded-lg cursor-pointer border-2 ${
          selectedCrewMember === crewMember.id 
            ? 'border-blue-500' 
            : 'border-transparent hover:border-gray-700'
        }`}
        onClick={() => setSelectedCrewMember(crewMember.id)}
      >
        <div className="flex items-start space-x-3">
          <div className="bg-gray-700 rounded-full p-1">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-xl">
              {crewMember.name.charAt(0)}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-white font-semibold">{crewMember.name}</h3>
              <Badge className={personalityColor}>
                {crewMember.personality}
              </Badge>
            </div>
            
            <p className="text-gray-400 text-sm mt-1">{crewMember.role}</p>
            
            <div className="mt-2 flex justify-between items-center">
              <div className="flex flex-col">
                <span className={`text-xs ${relationshipColor}`}>
                  {relationshipLevel}
                </span>
                <div className="h-1 w-20 bg-gray-700 rounded-full mt-1">
                  <div 
                    className={`h-full rounded-full bg-${relationshipColor.split('-')[1]}-500`}
                    style={{
                      width: `${(relationshipProgress.current / relationshipProgress.target) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <span className="text-xs text-gray-500">
                {crewMember.class}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Render dialogue option card
  const renderDialogueCard = (dialogue: DialogueTree) => {
    return (
      <motion.div
        key={dialogue.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="p-4 bg-gray-800/60 rounded-lg cursor-pointer hover:bg-gray-800"
        onClick={() => setSelectedDialogue(dialogue)}
      >
        <h3 className="text-white font-semibold">{dialogue.title}</h3>
        <p className="text-gray-400 text-sm mt-1">{dialogue.description}</p>
        
        {/* Requirements indicators, if any */}
        {dialogue.availability && (dialogue.availability.requiredRelationship || dialogue.availability.requiredProgress) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {dialogue.availability.requiredRelationship && (
              <Badge variant="outline" className="text-xs">
                Requires: {dialogue.availability.requiredRelationship}
              </Badge>
            )}
            
            {dialogue.availability.requiredProgress && (
              <Badge variant="outline" className="text-xs">
                Requires Act {dialogue.availability.requiredProgress}+
              </Badge>
            )}
          </div>
        )}
      </motion.div>
    );
  };
  
  // Currently selected crew member
  const currentCrewMember = selectedCrewMember ? findCrewMemberById(selectedCrewMember) : null;
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-lg w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        {/* Header with title and close button */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Crew Quarters</h2>
            <p className="text-blue-200 text-sm">
              {currentLocation ? `Location: ${currentLocation}` : "Interact with your crew members"}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        {/* Main content with tabs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="crew" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
            <div className="bg-gray-800 px-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="crew" className="px-4">
                  Crew Members
                </TabsTrigger>
                <TabsTrigger value="relationships" className="px-4">
                  Relationships
                </TabsTrigger>
                <TabsTrigger value="log" className="px-4">
                  Interaction Log
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {/* Crew Members Tab */}
              <TabsContent value="crew" className="flex-1 p-0 h-full flex flex-col">
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                  {/* Crew members list (left side) */}
                  <div className="w-full md:w-1/3 p-4 border-r border-gray-800">
                    <h3 className="text-white font-semibold mb-3">Available Crew</h3>
                    <ScrollArea className="h-[calc(90vh-200px)]">
                      <div className="space-y-3 pr-2">
                        {crewMembers.map(crew => renderCrewMemberCard(crew.id))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {/* Dialogue options and crew details (right side) */}
                  <div className="flex-1 p-4 overflow-hidden flex flex-col">
                    {selectedCrewMember && currentCrewMember ? (
                      <>
                        {/* Crew Member Info */}
                        <div className="mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gray-800 p-1.5 rounded-full">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-2xl">
                                  {currentCrewMember.name.charAt(0)}
                                </div>
                              </div>
                              
                              <div>
                                <h2 className="text-xl font-bold text-white">{currentCrewMember.name}</h2>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="bg-gray-800/60">
                                    {currentCrewMember.role}
                                  </Badge>
                                  <Badge className={getPersonalityColor(currentCrewMember.personality)}>
                                    {currentCrewMember.personality}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-sm font-medium ${getRelationshipLevelColor(getRelationshipLevel(currentCrewMember.id))}`}>
                                {getRelationshipLevel(currentCrewMember.id)}
                              </div>
                              <div className="text-xs text-gray-400">
                                Relationship
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-300 text-sm">{currentCrewMember.description}</p>
                          </div>
                        </div>
                        
                        {/* Available Conversation Options */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                          <h3 className="text-white font-semibold mb-3">Conversation Options</h3>
                          
                          <ScrollArea className="flex-1">
                            {availableDialogues.length > 0 ? (
                              <div className="space-y-3">
                                {availableDialogues.map(dialogue => renderDialogueCard(dialogue))}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <p className="text-gray-500">No conversation options available with this crew member at this time.</p>
                                <p className="text-gray-400 text-sm mt-2">Try progressing in the story or improving your relationship.</p>
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="bg-gray-800/60 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <h3 className="text-white text-lg font-semibold">Select a Crew Member</h3>
                          <p className="text-gray-400 text-sm mt-2">Choose a crew member to view details and conversation options.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Relationships Tab */}
              <TabsContent value="relationships" className="h-full">
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-3">Crew Relationships</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {crewMembers.map(crewMember => {
                      // Get this crew member's relationships with others
                      const relationships = crewMembers
                        .filter(other => other.id !== crewMember.id)
                        .map(other => {
                          const relationship = getCrewRelationship(crewMember.id, other.id);
                          return {
                            crew: other,
                            relationship: relationship && revealedRelationships.includes(other.id) ? relationship : null
                          };
                        })
                        .filter(item => item.relationship !== null);
                      
                      // Only show crew members who have known relationships
                      if (relationships.length === 0) return null;
                      
                      return (
                        <div 
                          key={crewMember.id}
                          className="bg-gray-800/60 rounded-lg p-4"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-gray-700 rounded-full p-1">
                              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-lg">
                                {crewMember.name.charAt(0)}
                              </div>
                            </div>
                            <h4 className="text-white font-medium">{crewMember.name}</h4>
                          </div>
                          
                          <div className="space-y-2">
                            {relationships.map(({ crew, relationship }) => (
                              <div 
                                key={crew.id}
                                className="bg-gray-700/50 rounded p-2 flex justify-between items-center"
                              >
                                <span className="text-gray-300 text-sm">{crew.name}</span>
                                
                                {relationship && (
                                  <Badge className={getRelationshipTypeColor(relationship.type)}>
                                    {relationship.type}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Info about discovering relationships */}
                  <div className="mt-6 bg-gray-800/40 p-4 rounded-lg">
                    <h4 className="text-gray-300 font-medium mb-2">About Crew Relationships</h4>
                    <p className="text-gray-400 text-sm">
                      Relationships between crew members affect mission dynamics and story events. Build trust with crew 
                      members to learn more about their relationships with others. Some relationships may only be 
                      revealed through specific dialogues or story events.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              {/* Interaction Log Tab */}
              <TabsContent value="log" className="h-full">
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-3">Significant Interactions</h3>
                  
                  {selectedCrewMember && relationshipLog.length > 0 ? (
                    <ScrollArea className="h-[calc(90vh-200px)]">
                      <div className="space-y-3">
                        {relationshipLog.map(interaction => (
                          <div 
                            key={interaction.id}
                            className="bg-gray-800/60 rounded-lg p-3"
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-gray-300 text-sm">{interaction.description}</p>
                              <Badge className={interaction.effect > 0 ? 'bg-green-600' : 'bg-red-600'}>
                                {interaction.effect > 0 ? '+' : ''}{interaction.effect}
                              </Badge>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              {new Date(interaction.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        {selectedCrewMember 
                          ? "No significant interactions recorded with this crew member yet." 
                          : "Select a crew member to view your interaction history."}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>
      
      {/* Active dialogue modal */}
      <AnimatePresence>
        {selectedDialogue && selectedCrewMember && (
          <Dialog open={true} onOpenChange={() => setSelectedDialogue(null)}>
            <DialogContent className="p-0 max-w-none w-full max-w-4xl max-h-[90vh] bg-transparent border-0">
              <DynamicDialogueSystem
                dialogueTree={selectedDialogue}
                crewMemberId={selectedCrewMember}
                onClose={() => setSelectedDialogue(null)}
                onComplete={handleDialogueComplete}
              />
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CrewInteractionManager;