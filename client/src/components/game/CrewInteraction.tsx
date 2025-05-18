import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DialogueNode, DialogueOption, DialogueTree, findDialogueNode } from '@/lib/data/crewDialogueTrees';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompanion, CompanionPersonality, RelationshipLevel } from '@/lib/stores/useCompanion';
import { useCharacter } from '@/lib/stores/useCharacter';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CrewInteractionProps {
  dialogueTree: DialogueTree;
  crewMemberId: string;
  onClose: () => void;
  onComplete?: (unlocks: string[]) => void;
}

const CrewInteraction: React.FC<CrewInteractionProps> = ({
  dialogueTree,
  crewMemberId,
  onClose,
  onComplete
}) => {
  // Get the active companion data
  const { activeCompanion, addDialogue, improveRelationship, reduceRelationship } = useCompanion();
  
  // Current dialogue state
  const [currentNodeId, setCurrentNodeId] = useState<string>(dialogueTree.startNodeId);
  const [currentNode, setCurrentNode] = useState<DialogueNode | null>(null);
  const [dialogueHistory, setDialogueHistory] = useState<DialogueNode[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [relationshipChanges, setRelationshipChanges] = useState(0);
  
  // Sound effects
  const [dialogueSound] = useState(new Audio('/sounds/dialogue_blip.mp3'));
  
  // Get the character data for checks
  const { character } = useCharacter();
  
  // Load the initial dialogue node
  useEffect(() => {
    const initialNode = findDialogueNode(dialogueTree, dialogueTree.startNodeId);
    if (initialNode) {
      setCurrentNode(initialNode);
      setDialogueHistory([initialNode]);
      
      // Add this dialogue to the companion's history
      if (activeCompanion) {
        addDialogue(initialNode.type, initialNode.text);
      }
      
      // Start typing animation
      startTypingAnimation(initialNode.text);
    }
  }, [dialogueTree]);
  
  // Apply any effects when entering a node
  useEffect(() => {
    if (currentNode?.onEntryEffects) {
      currentNode.onEntryEffects.forEach(effect => {
        // Handle different types of effects
        switch (effect.type) {
          case 'sound':
            // Play sound effect
            const sound = new Audio(`/sounds/${effect.value}`);
            sound.play().catch(err => console.error('Failed to play sound:', err));
            break;
          case 'animation':
            // Animation effects would be handled here
            break;
          case 'notification':
            // Show notification
            console.log('Notification:', effect.value);
            break;
          default:
            break;
        }
      });
    }
  }, [currentNode]);
  
  // Typing animation for dialogue text
  const startTypingAnimation = (text: string) => {
    setIsTyping(true);
    setDisplayedText("");
    
    let i = 0;
    const speed = 30; // milliseconds per character
    
    const typeWriter = () => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
        
        // Play dialogue sound every few characters for a natural effect
        if (i % 3 === 0) {
          dialogueSound.volume = 0.2;
          dialogueSound.currentTime = 0;
          dialogueSound.play().catch(err => console.error('Failed to play sound:', err));
        }
        
        setTimeout(typeWriter, speed);
      } else {
        setIsTyping(false);
      }
    };
    
    typeWriter();
  };
  
  // Handle selecting a dialogue option
  const handleSelectOption = (option: DialogueOption) => {
    // Record this option selection
    setSelectedOptions(prev => [...prev, option.id]);
    
    // Apply relationship effects
    if (option.relationshipEffect !== undefined) {
      setRelationshipChanges(prev => prev + option.relationshipEffect!);
      
      if (option.relationshipEffect > 0) {
        improveRelationship(option.relationshipEffect);
      } else if (option.relationshipEffect < 0) {
        reduceRelationship(Math.abs(option.relationshipEffect));
      }
    }
    
    // Handle special effects
    if (option.specialEffects) {
      const newUnlocks = option.specialEffects
        .filter(effect => effect.type === 'unlock')
        .map(effect => effect.value);
      
      if (newUnlocks.length > 0) {
        setUnlocks(prev => [...prev, ...newUnlocks]);
      }
      
      // Handle other effect types as needed
      option.specialEffects.forEach(effect => {
        if (effect.type === 'reward') {
          // Give player a reward
          console.log('Reward granted:', effect.value);
        }
      });
    }
    
    // Move to the next node if specified
    if (option.nextNodeId) {
      const nextNode = findDialogueNode(dialogueTree, option.nextNodeId);
      if (nextNode) {
        setCurrentNode(nextNode);
        setDialogueHistory(prev => [...prev, nextNode]);
        
        // Add this dialogue to the companion's history
        if (activeCompanion) {
          addDialogue(nextNode.type, nextNode.text);
        }
        
        // Start typing animation for the new node
        startTypingAnimation(nextNode.text);
      }
    } else {
      // No next node means the conversation is ending
      handleConversationEnd();
    }
  };
  
  // End the conversation
  const handleConversationEnd = () => {
    // Apply any final effects or state changes
    if (onComplete) {
      onComplete(unlocks);
    }
    
    // Show summary of interaction
    console.log('Conversation ended with relationship change:', relationshipChanges);
    
    // Close the dialogue interface
    onClose();
  };
  
  // Get the relationship level name
  const getRelationshipLevelName = (level: RelationshipLevel) => {
    switch (level) {
      case RelationshipLevel.Distrustful:
        return "Distrustful";
      case RelationshipLevel.Neutral:
        return "Neutral";
      case RelationshipLevel.Cooperative:
        return "Cooperative";
      case RelationshipLevel.Friendly:
        return "Friendly";
      case RelationshipLevel.Devoted:
        return "Devoted";
      default:
        return "Unknown";
    }
  };
  
  // Get appropriate icon for dialogue type
  const getDialogueTypeIcon = (type: string) => {
    switch (type) {
      case 'Greeting':
        return '👋';
      case 'Combat':
        return '⚔️';
      case 'Exploration':
        return '🔍';
      case 'LocationInfo':
        return '📍';
      case 'Puzzle':
        return '🧩';
      case 'Lore':
        return '📜';
      case 'Advice':
        return '💡';
      case 'Reaction':
        return '😮';
      case 'Random':
        return '🎲';
      default:
        return '💬';
    }
  };
  
  // Check if an option should be disabled based on requirements
  const isOptionDisabled = (option: DialogueOption): boolean => {
    if (!option.requiredRelationship || !activeCompanion) return false;
    
    const relationshipOrder = Object.values(RelationshipLevel);
    const requiredIndex = relationshipOrder.indexOf(option.requiredRelationship);
    const currentIndex = relationshipOrder.indexOf(activeCompanion.relationship);
    
    return currentIndex < requiredIndex;
  };
  
  // Get appropriate color for relationship change indicator
  const getRelationshipChangeColor = (change: number): string => {
    if (change > 3) return "text-green-500";
    if (change > 0) return "text-green-400";
    if (change < -3) return "text-red-500";
    if (change < 0) return "text-red-400";
    return "text-gray-400";
  };
  
  // Get crew member portrait based on ID or personality
  const getCrewMemberPortrait = () => {
    if (!activeCompanion) return '/images/crew/default.png';
    
    const personality = activeCompanion.personality;
    
    switch (personality) {
      case CompanionPersonality.Logical:
        return '/images/crew/logical.png';
      case CompanionPersonality.Scientific:
        return '/images/crew/scientist.png';
      case CompanionPersonality.Caring:
        return '/images/crew/caring.png';
      case CompanionPersonality.Humorous:
        return '/images/crew/humorous.png';
      case CompanionPersonality.Adventurous:
        return '/images/crew/adventurous.png';
      case CompanionPersonality.Militant:
        return '/images/crew/militant.png';
      case CompanionPersonality.Cynical:
        return '/images/crew/cynical.png';
      default:
        return '/images/crew/default.png';
    }
  };
  
  // Skip the typing animation
  const handleSkipTyping = () => {
    if (isTyping && currentNode) {
      setIsTyping(false);
      setDisplayedText(currentNode.text);
    }
  };
  
  if (!currentNode || !activeCompanion) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-gray-900 rounded-lg w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with title and close button */}
        <div className="border-b border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">{dialogueTree.title}</h2>
            {relationshipChanges !== 0 && (
              <span className={getRelationshipChangeColor(relationshipChanges)}>
                {relationshipChanges > 0 ? `+${relationshipChanges}` : relationshipChanges} 
                <span className="text-xs ml-1">REL</span>
              </span>
            )}
          </div>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        {/* Main dialogue content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Crew member portrait and info */}
          <div className="p-4 border-r border-gray-700 flex flex-col items-center w-full md:w-64 bg-gray-800">
            <div className="relative">
              <img 
                src={getCrewMemberPortrait()} 
                alt={activeCompanion.name}
                className="w-32 h-32 rounded-full object-cover border-2 border-blue-500"
              />
              <div className="absolute bottom-0 right-0 bg-gray-900 rounded-full p-1 border border-gray-700">
                <span className="text-lg" title={activeCompanion.personality}>
                  {activeCompanion.personality === CompanionPersonality.Logical ? '🧠' :
                   activeCompanion.personality === CompanionPersonality.Scientific ? '🔬' :
                   activeCompanion.personality === CompanionPersonality.Caring ? '❤️' :
                   activeCompanion.personality === CompanionPersonality.Humorous ? '😄' :
                   activeCompanion.personality === CompanionPersonality.Adventurous ? '🌟' :
                   activeCompanion.personality === CompanionPersonality.Militant ? '🛡️' :
                   activeCompanion.personality === CompanionPersonality.Cynical ? '🙄' : '👤'}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white mt-3">{activeCompanion.name}</h3>
            <p className="text-sm text-gray-300">{activeCompanion.specialization}</p>
            
            <div className="mt-4 w-full">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Relationship</span>
                <span className="text-blue-300">{getRelationshipLevelName(activeCompanion.relationship)}</span>
              </div>
              
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ 
                    width: `${
                      activeCompanion.relationship === RelationshipLevel.Distrustful ? 20 :
                      activeCompanion.relationship === RelationshipLevel.Neutral ? 40 :
                      activeCompanion.relationship === RelationshipLevel.Cooperative ? 60 :
                      activeCompanion.relationship === RelationshipLevel.Friendly ? 80 : 100
                    }%` 
                  }}
                />
              </div>
            </div>
            
            <Separator className="my-4 bg-gray-700" />
            
            <div className="space-y-2 w-full">
              <h4 className="text-sm font-semibold text-gray-300">Conversation History</h4>
              <ScrollArea className="h-32 w-full rounded border border-gray-700 bg-gray-800 p-2">
                <div className="space-y-2">
                  {dialogueHistory.slice(0, -1).map((node, index) => (
                    <div key={index} className="text-xs text-gray-400 py-1 border-b border-gray-700 last:border-0">
                      <div className="flex items-center">
                        <span className="mr-1">{getDialogueTypeIcon(node.type)}</span>
                        <Badge variant="outline" className="text-[0.6rem] py-0">
                          {node.type}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2">{node.text.substring(0, 60)}...</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          {/* Dialogue text and options */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Current dialogue text */}
            <div 
              className="p-6 flex-1 overflow-auto bg-gradient-to-b from-gray-900 to-gray-800"
              onClick={isTyping ? handleSkipTyping : undefined}
            >
              <div className="flex mb-4">
                <Badge className="bg-blue-600">
                  {getDialogueTypeIcon(currentNode.type)} {currentNode.type}
                </Badge>
              </div>
              
              <p className="text-gray-100 text-lg leading-relaxed">
                {displayedText}
                {isTyping && <span className="animate-pulse">▋</span>}
              </p>
              
              {isTyping && (
                <div className="mt-4 text-sm text-gray-400 text-center">
                  Click to skip
                </div>
              )}
            </div>
            
            {/* Dialogue options */}
            <AnimatePresence>
              {!isTyping && (
                <motion.div 
                  className="border-t border-gray-700 bg-gray-900 p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="space-y-3">
                    {currentNode.options.map((option) => {
                      const disabled = isOptionDisabled(option);
                      
                      return (
                        <Button
                          key={option.id}
                          variant={selectedOptions.includes(option.id) ? "secondary" : "default"}
                          className={`w-full justify-start text-left ${disabled ? 'opacity-50' : ''}`}
                          onClick={() => !disabled && handleSelectOption(option)}
                          disabled={disabled}
                        >
                          <div>
                            <div className="flex items-center">
                              <span>{option.text}</span>
                              
                              {option.relationshipEffect && (
                                <span 
                                  className={`ml-2 text-xs ${
                                    option.relationshipEffect && option.relationshipEffect > 0 ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {option.relationshipEffect && (option.relationshipEffect > 0 ? `+${option.relationshipEffect}` : option.relationshipEffect)}
                                </span>
                              )}
                            </div>
                            
                            {disabled && option.requiredRelationship && (
                              <div className="text-xs text-red-400 mt-1">
                                Requires {getRelationshipLevelName(option.requiredRelationship)} relationship
                              </div>
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CrewInteraction;