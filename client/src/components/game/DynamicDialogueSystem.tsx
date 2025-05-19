import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { findCrewMemberById } from '@/lib/data/crewMembers';
import { DialogueNode, DialogueOption, DialogueTree, findDialogueNode } from '@/lib/data/crewDialogueTrees';
import { useCrewRelationships } from '@/lib/stores/useCrewRelationships';
import { CompanionPersonality, DialogueType, RelationshipLevel } from '@/lib/stores/useCompanion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface DynamicDialogueSystemProps {
  dialogueTree: DialogueTree;
  crewMemberId: string;
  onClose: () => void;
  onComplete?: (unlocks: string[]) => void;
  inScene?: boolean; // Whether this is in a 3D scene or standalone
}

const DynamicDialogueSystem: React.FC<DynamicDialogueSystemProps> = ({
  dialogueTree,
  crewMemberId,
  onClose,
  onComplete,
  inScene = false
}) => {
  // Get crew member data
  const crewMember = findCrewMemberById(crewMemberId);
  
  // Get relationship state
  const { 
    getRelationshipLevel, 
    getRelationshipProgress, 
    recordInteraction, 
    getSignificantInteractions
  } = useCrewRelationships();
  
  // Current dialogue state
  const [currentNodeId, setCurrentNodeId] = useState<string>(dialogueTree.startNodeId);
  const [currentNode, setCurrentNode] = useState<DialogueNode | null>(null);
  const [dialogueHistory, setDialogueHistory] = useState<DialogueNode[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [relationshipChanges, setRelationshipChanges] = useState(0);
  
  // Sound effect for dialogue
  const dialogueSound = useRef(new Audio('/sounds/dialogue_blip.mp3'));
  
  // Set volume for sound effect
  useEffect(() => {
    if (dialogueSound.current) {
      dialogueSound.current.volume = 0.3;
    }
  }, []);
  
  // Load the initial dialogue node
  useEffect(() => {
    const initialNode = findDialogueNode(dialogueTree, dialogueTree.startNodeId);
    if (initialNode) {
      setCurrentNode(initialNode);
      setDialogueHistory([initialNode]);
      
      // Start typing animation
      startTypingAnimation(initialNode.text);
    }
  }, [dialogueTree]);
  
  // Handle the typing animation effect
  const startTypingAnimation = (text: string) => {
    setIsTyping(true);
    setDisplayedText("");
    
    let index = 0;
    const speed = 30; // milliseconds per character
    
    const typeText = () => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text.charAt(index));
        index++;
        
        // Play dialogue sound for certain characters to create typing effect
        if (index % 3 === 0 && dialogueSound.current) {
          // Clone the audio to allow overlapping sounds
          const sound = dialogueSound.current.cloneNode() as HTMLAudioElement;
          sound.volume = 0.1;
          sound.play().catch(err => console.error("Error playing dialogue sound:", err));
        }
        
        setTimeout(typeText, speed);
      } else {
        setIsTyping(false);
      }
    };
    
    typeText();
  };
  
  // Handle selecting a dialogue option
  const handleSelectOption = (option: DialogueOption) => {
    // Record this option as selected
    setSelectedOptions(prev => [...prev, option.id]);
    
    // Apply relationship effect if any
    if (option.relationshipEffect !== undefined && crewMember) {
      const effectValue = option.relationshipEffect;
      setRelationshipChanges(prev => prev + effectValue);
      
      if (effectValue > 0) {
        recordInteraction(
          crewMember.id,
          `Positive dialogue choice: ${option.text}`,
          effectValue
        );
      } else if (effectValue < 0) {
        recordInteraction(
          crewMember.id,
          `Negative dialogue choice: ${option.text}`,
          effectValue
        );
      }
    }
    
    // Apply special effects if any
    if (option.specialEffects && option.specialEffects.length > 0) {
      const newUnlocks = option.specialEffects
        .filter(effect => effect.type === 'unlock')
        .map(effect => effect.value);
      
      setUnlocks(prev => [...prev, ...newUnlocks]);
    }
    
    // Move to the next node if specified
    if (option.nextNodeId) {
      const nextNode = findDialogueNode(dialogueTree, option.nextNodeId);
      if (nextNode) {
        setCurrentNodeId(option.nextNodeId);
        setCurrentNode(nextNode);
        setDialogueHistory(prev => [...prev, nextNode]);
        
        // Start typing animation for the new node
        startTypingAnimation(nextNode.text);
      }
    } else {
      // End of dialogue if no next node
      setTimeout(() => {
        if (onComplete && unlocks.length > 0) {
          onComplete(unlocks);
        }
        onClose();
      }, 500);
    }
  };
  
  // Check if an option should be disabled based on relationship level
  const isOptionDisabled = (option: DialogueOption): boolean => {
    if (!option.requiredRelationship || !crewMember) return false;
    
    const currentRelationship = getRelationshipLevel(crewMember.id);
    const requiredRelationship = option.requiredRelationship;
    
    const relationshipOrder = Object.values(RelationshipLevel);
    const requiredIndex = relationshipOrder.indexOf(requiredRelationship);
    const currentIndex = relationshipOrder.indexOf(currentRelationship);
    
    return currentIndex < requiredIndex;
  };
  
  // Get a string version of the relationship level name
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
  
  // Skip the typing animation
  const handleSkipTyping = () => {
    if (isTyping && currentNode) {
      setIsTyping(false);
      setDisplayedText(currentNode.text);
    }
  };
  
  // Get a color based on personality for visual elements
  const getPersonalityColor = (personality: CompanionPersonality): string => {
    switch (personality) {
      case CompanionPersonality.Logical:
        return "from-blue-600 to-cyan-600";
      case CompanionPersonality.Humorous:
        return "from-orange-500 to-amber-500";
      case CompanionPersonality.Caring:
        return "from-green-600 to-emerald-500";
      case CompanionPersonality.Cynical:
        return "from-slate-700 to-zinc-600";
      case CompanionPersonality.Adventurous:
        return "from-purple-600 to-fuchsia-500";
      case CompanionPersonality.Militant:
        return "from-red-600 to-rose-600";
      case CompanionPersonality.Scientific:
        return "from-indigo-600 to-violet-600";
      default:
        return "from-gray-600 to-slate-600";
    }
  };
  
  // Get badge color for dialogue type
  const getDialogueTypeBadge = (type: DialogueType): {color: string, label: string} => {
    switch (type) {
      case DialogueType.Greeting:
        return { color: "bg-blue-600", label: "Greeting" };
      case DialogueType.Combat:
        return { color: "bg-red-600", label: "Combat" };
      case DialogueType.Exploration:
        return { color: "bg-purple-600", label: "Exploration" };
      case DialogueType.LocationInfo:
        return { color: "bg-cyan-600", label: "Information" };
      case DialogueType.Puzzle:
        return { color: "bg-amber-600", label: "Puzzle" };
      case DialogueType.Lore:
        return { color: "bg-emerald-600", label: "Lore" };
      case DialogueType.Advice:
        return { color: "bg-indigo-600", label: "Advice" };
      case DialogueType.Reaction:
        return { color: "bg-pink-600", label: "Reaction" };
      case DialogueType.Random:
        return { color: "bg-gray-600", label: "Chatter" };
      default:
        return { color: "bg-gray-600", label: "Dialogue" };
    }
  };
  
  // Get relationship change icon and class
  const getRelationshipChangeDisplay = (): {icon: string, className: string} => {
    if (relationshipChanges > 0) {
      return { icon: "↑", className: "text-green-500" };
    } else if (relationshipChanges < 0) {
      return { icon: "↓", className: "text-red-500" };
    }
    return { icon: "•", className: "text-gray-500" };
  };
  
  if (!crewMember || !currentNode) return null;
  
  // Current relationship data
  const relationshipLevel = getRelationshipLevel(crewMember.id);
  const relationshipProgress = getRelationshipProgress(crewMember.id);
  const relationshipChange = getRelationshipChangeDisplay();
  
  // Determine dialogue type badge
  const typeBadge = getDialogueTypeBadge(currentNode.type);
  
  // Get personality color
  const personalityColor = getPersonalityColor(crewMember.personality);
  
  // Create a container based on whether this is in a scene or standalone
  const Container = inScene ? motion.div : React.Fragment;
  const containerProps = inScene ? {
    className: "absolute inset-0 flex items-center justify-center z-50",
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  } : {};
  
  return (
    <Container {...containerProps}>
      <div className={`${inScene ? '' : 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'}`}>
        <motion.div 
          className="bg-gray-900 rounded-lg w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header with character name, type and relationship */}
          <div className={`p-4 bg-gradient-to-r ${personalityColor} flex justify-between items-center`}>
            <div className="flex items-center space-x-3">
              <div className="bg-gray-900/30 p-1 rounded-full">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-xl">
                  {crewMember.name.charAt(0)}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{crewMember.name}</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-white/80">{crewMember.role}</span>
                  <span className="text-white/60">•</span>
                  <span className="text-xs text-white/80">{crewMember.class}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className={typeBadge.color}>
                {typeBadge.label}
              </Badge>
              
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-white/90">Relationship:</span>
                  <span className="text-white font-medium">{getRelationshipLevelName(relationshipLevel)}</span>
                  <span className={`text-sm ${relationshipChange.className}`}>{relationshipChange.icon}</span>
                </div>
                
                <div className="h-1.5 w-20 bg-gray-800/50 rounded-full mt-1">
                  <div 
                    className="h-full bg-white/80 rounded-full"
                    style={{
                      width: `${(relationshipProgress.current / relationshipProgress.target) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
          
          {/* Dialogue content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Main dialogue display area */}
            <ScrollArea className="flex-grow p-4">
              {/* Current dialogue text */}
              <div 
                className="relative p-4 bg-gray-800/50 rounded-lg mb-4 overflow-hidden cursor-pointer"
                onClick={handleSkipTyping}
              >
                <p className="text-white text-base leading-relaxed">
                  {displayedText}
                </p>
                
                {isTyping && (
                  <div className="absolute bottom-2 right-2 flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
                
                {isTyping && (
                  <div className="absolute right-2 top-2 text-xs text-white/60">
                    Click to skip
                  </div>
                )}
              </div>
              
              {/* Response options - only show when done typing */}
              {!isTyping && currentNode.options && currentNode.options.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Your response:</h3>
                  
                  {currentNode.options.map(option => {
                    const disabled = isOptionDisabled(option);
                    
                    return (
                      <motion.div 
                        key={option.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Button 
                          variant={disabled ? "outline" : "secondary"}
                          size="lg"
                          className={`w-full justify-start p-3 text-left ${
                            disabled 
                              ? 'opacity-60 cursor-not-allowed' 
                              : 'hover:bg-gray-700'
                          }`}
                          onClick={() => !disabled && handleSelectOption(option)}
                          disabled={disabled}
                        >
                          <div>
                            <p className="text-sm">{option.text}</p>
                            
                            {/* Show requirements if option is disabled */}
                            {disabled && option.requiredRelationship && (
                              <p className="text-red-400 text-xs mt-1">
                                Requires {getRelationshipLevelName(option.requiredRelationship)} relationship
                              </p>
                            )}
                            
                            {/* Show relationship effect indicator if present */}
                            {!disabled && option.relationshipEffect && (
                              <p className={`text-xs mt-1 ${
                                option.relationshipEffect > 0 
                                  ? 'text-green-400' 
                                  : option.relationshipEffect < 0 
                                    ? 'text-red-400' 
                                    : 'text-gray-400'
                              }`}>
                                Relationship: {option.relationshipEffect > 0 ? '+' : ''}{option.relationshipEffect}
                              </p>
                            )}
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            
            {/* Dialogue history toggle button */}
            {dialogueHistory.length > 1 && (
              <div className="p-2 border-t border-gray-800">
                <details className="text-sm">
                  <summary className="text-gray-400 cursor-pointer">
                    <div className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span>Conversation History</span>
                    </div>
                  </summary>
                  
                  <div className="mt-2 pl-4 border-l-2 border-gray-800 space-y-2 max-h-40 overflow-y-auto">
                    {dialogueHistory.slice(0, -1).map((node, index) => (
                      <div key={index} className="text-gray-400 text-xs py-1">
                        <p>{node.text}</p>
                        {selectedOptions[index] && (
                          <p className="text-indigo-400 mt-1 italic">
                            {currentNode.options.find(o => o.id === selectedOptions[index])?.text || "..."}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Container>
  );
};

export default DynamicDialogueSystem;