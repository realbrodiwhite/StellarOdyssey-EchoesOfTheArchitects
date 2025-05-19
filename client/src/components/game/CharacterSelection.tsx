import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { characterTemplates } from "@/lib/data/characters"; // Original templates as fallback
import { expandedCharacterTemplates } from "@/lib/data/expanded-characters"; // New expanded templates
import { useCharacter } from "@/lib/stores/useCharacter";
import { CharacterClass, SkillType, Gender, Character, Skill } from "@/lib/types";
import CharacterDetailModal from "./CharacterDetailModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CharacterSelectionProps {
  onSelect: () => void;
}

// Get the icon for a specific skill type
const getSkillTypeIcon = (type: SkillType): string => {
  switch (type) {
    case SkillType.Technical:
      return "🔧"; // Wrench
    case SkillType.Scientific:
      return "🧪"; // Test tube
    case SkillType.Social:
      return "💬"; // Speech bubble
    case SkillType.Navigation:
      return "🧭"; // Compass
    case SkillType.Combat:
      return "⚔️"; // Crossed swords
    default:
      return "✨"; // Sparkles (fallback)
  }
};

// Get color for a specific skill type
const getSkillTypeColor = (type: SkillType): string => {
  switch (type) {
    case SkillType.Technical:
      return "text-yellow-400";
    case SkillType.Scientific:
      return "text-purple-400";
    case SkillType.Social:
      return "text-green-400";
    case SkillType.Navigation:
      return "text-blue-400";
    case SkillType.Combat:
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

// Character Card Component
const CharacterCard = ({ 
  character, 
  isSelected, 
  onClick, 
  onViewDetails 
}: { 
  character: Character; 
  isSelected: boolean; 
  onClick: () => void; 
  onViewDetails: (e: React.MouseEvent) => void;
}) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 overflow-hidden h-full flex flex-col ${
        isSelected
          ? 'ring-2 ring-blue-500 bg-gray-800/90 transform scale-[1.02]' 
          : 'hover:bg-gray-900 hover:ring-1 hover:ring-blue-300 bg-gray-950/90'
      }`}
      onClick={onClick}
    >
      <div className="relative flex-1 flex flex-col">
        {/* Character glow effect on selected */}
        {isSelected && (
          <div className="absolute -inset-0.5 bg-blue-500/20 animate-pulse rounded-lg z-0"></div>
        )}
        
        <div className="p-2 sm:p-3 relative z-10 flex flex-col h-full">
          {/* Header with class name */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base sm:text-lg font-bold text-white">{character.class}</h2>
            {isSelected && (
              <div className="bg-blue-500 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded">
                Selected
              </div>
            )}
          </div>
          
          <div className="h-0.5 sm:h-1 w-12 sm:w-16 bg-gradient-to-r from-blue-500 to-purple-500 mb-1 sm:mb-2"></div>
          
          {/* Description area (flex-grow to take available space) */}
          <div className="bg-gradient-to-b from-gray-800/60 to-gray-900/60 p-1.5 sm:p-2 rounded mb-2 sm:mb-3 flex-grow">
            <p className="text-gray-300 text-xs sm:text-sm line-clamp-2">{character.description.split('.')[0]}.</p>
          </div>
          
          {/* Skills area (fixed height) */}
          <div className="space-y-1 sm:space-y-2 mb-auto">
            {character.skills
              .filter(skill => skill.level > 1)
              .slice(0, 2)
              .map(skill => (
                <div key={skill.id} className="flex justify-between items-center bg-gray-800/50 p-1 sm:p-1.5 rounded">
                  <span className="text-gray-300 text-[10px] sm:text-xs">{skill.name}</span>
                  <div className="flex space-x-0.5 sm:space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-0.5 sm:w-1 h-1.5 sm:h-2 rounded-sm ${
                          i < skill.level ? getSkillTypeColor(skill.type).replace('text-', 'bg-') : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
            
          {/* Stats area (fixed height) */}
          <div className="mt-1 pt-1 border-t border-gray-800 grid grid-cols-2 gap-1 sm:gap-2">
            <div className="bg-gray-800/80 p-1 sm:p-2 rounded">
              <div className="text-[9px] sm:text-xs text-blue-400">Health</div>
              <div className="text-xs sm:text-sm font-bold text-white">
                <span className="text-red-400 mr-0.5 sm:mr-1">❤</span> {character.health}
              </div>
            </div>
            
            <div className="bg-gray-800/80 p-1 sm:p-2 rounded">
              <div className="text-[9px] sm:text-xs text-blue-400">Energy</div>
              <div className="text-xs sm:text-sm font-bold text-white">
                <span className="text-blue-400 mr-0.5 sm:mr-1">⚡</span> {character.energy}
              </div>
            </div>
          </div>
          
          {/* Details button */}
          <button
            className="mt-1 sm:mt-2 w-full text-center text-[10px] sm:text-xs bg-blue-800/80 hover:bg-blue-700/80 text-white py-1 sm:py-1.5 rounded transition-colors"
            onClick={onViewDetails}
          >
            Details
          </button>
        </div>
      </div>
    </Card>
  );
};

// Character Sidebar Preview Component
const CharacterPreview = ({ character }: { character: Character | null }) => {
  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-blue-400 text-4xl mb-4">👤</div>
        <h3 className="text-white text-base font-bold mb-2">Select a Character</h3>
        <p className="text-gray-400 text-xs">Choose your class to view detailed stats</p>
      </div>
    );
  }

  // Group skills by type
  const skillsByType = useMemo(() => {
    const result: Record<SkillType, Skill[]> = {
      [SkillType.Technical]: [],
      [SkillType.Scientific]: [],
      [SkillType.Social]: [],
      [SkillType.Navigation]: [],
      [SkillType.Combat]: []
    };
    
    character.skills.forEach(skill => {
      result[skill.type].push(skill);
    });
    
    return result;
  }, [character.skills]);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* Character header */}
      <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 p-3 rounded-t border-b border-blue-700">
        <h2 className="text-white text-xl font-bold mb-1">{character.class}</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 mb-2"></div>
        <p className="text-gray-300 text-sm">{character.gender} • Level {character.level}</p>
      </div>
      
      {/* Character avatar (placeholder) */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-full flex items-center justify-center mb-2">
          <span className="text-white text-3xl">{character.class.charAt(0)}</span>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs mb-3">{character.description}</div>
          
          {/* Character stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-900/60 p-2 rounded">
              <div className="text-[10px] text-blue-400">Health</div>
              <div className="text-sm font-bold text-white">
                <span className="text-red-400 mr-1">❤</span> {character.health} / {character.maxHealth}
              </div>
            </div>
            
            <div className="bg-gray-900/60 p-2 rounded">
              <div className="text-[10px] text-blue-400">Energy</div>
              <div className="text-sm font-bold text-white">
                <span className="text-blue-400 mr-1">⚡</span> {character.energy} / {character.maxEnergy}
              </div>
            </div>
            
            {character.shield !== undefined && (
              <div className="bg-gray-900/60 p-2 rounded">
                <div className="text-[10px] text-blue-400">Shield</div>
                <div className="text-sm font-bold text-white">
                  <span className="text-cyan-400 mr-1">🛡️</span> {character.shield} / {character.maxShield}
                </div>
              </div>
            )}
            
            {character.credits !== undefined && (
              <div className="bg-gray-900/60 p-2 rounded">
                <div className="text-[10px] text-blue-400">Credits</div>
                <div className="text-sm font-bold text-white">
                  <span className="text-yellow-400 mr-1">💰</span> {character.credits}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Skills section */}
      <div className="flex-1 bg-gray-900 p-3 overflow-y-auto">
        <h3 className="text-blue-400 text-sm font-bold mb-2">Skills</h3>
        
        {Object.entries(skillsByType).map(([type, skills]) => {
          if (skills.length === 0) return null;
          
          return (
            <div key={type} className="mb-3">
              <div className={`flex items-center mb-1 ${getSkillTypeColor(type as SkillType)}`}>
                <span className="mr-1">{getSkillTypeIcon(type as SkillType)}</span>
                <span className="text-xs font-bold">{type}</span>
              </div>
              
              <div className="space-y-1.5">
                {skills.map(skill => (
                  <div key={skill.id} className="flex justify-between items-center bg-gray-800/50 p-1.5 rounded">
                    <div>
                      <div className="text-white text-xs">{skill.name}</div>
                      <div className="text-gray-400 text-[9px]">{skill.description}</div>
                    </div>
                    <div className="flex space-x-0.5 ml-2">
                      {[...Array(skill.maxLevel)].map((_, i) => (
                        <div 
                          key={i}
                          className={`w-1 h-3 rounded-sm ${
                            i < skill.level 
                              ? `${getSkillTypeColor(skill.type).replace('text-', 'bg-')}` 
                              : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* Abilities section */}
        {character.abilities && character.abilities.length > 0 && (
          <div className="mt-4">
            <h3 className="text-purple-400 text-sm font-bold mb-2">Abilities</h3>
            
            <div className="space-y-2">
              {character.abilities.map(ability => (
                <div key={ability.id} className="bg-gray-800/50 p-2 rounded">
                  <div className="flex justify-between items-start">
                    <div className="text-white text-xs font-bold">{ability.name}</div>
                    <div className="text-blue-400 text-[9px]">
                      Energy: {ability.energyCost}
                    </div>
                  </div>
                  
                  <div className="text-gray-400 text-[9px] mt-1">{ability.description}</div>
                  
                  <div className="flex justify-between mt-1.5">
                    {ability.damage && (
                      <div className="text-red-400 text-[9px]">
                        Damage: {ability.damage}
                      </div>
                    )}
                    {ability.healing && (
                      <div className="text-green-400 text-[9px]">
                        Healing: {ability.healing}
                      </div>
                    )}
                    <div className="text-amber-400 text-[9px]">
                      Cooldown: {ability.cooldown}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onSelect }) => {
  // Use expanded character templates if available, otherwise fall back to original
  const templates = expandedCharacterTemplates.length > 0 ? expandedCharacterTemplates : characterTemplates;
  
  // Debug: Check if character templates are loaded correctly
  console.log("Character templates available:", templates);
  console.log("Number of templates:", templates.length);
  
  const { selectCharacter } = useCharacter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modalCharacter, setModalCharacter] = useState<number | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender>(Gender.Male);
  
  // Group characters by class and gender for easier selection
  const charactersByClass = useMemo(() => {
    const result: Record<string, Record<Gender, Character[]>> = {};
    
    templates.forEach(character => {
      // Create class group if it doesn't exist
      if (!result[character.class]) {
        result[character.class] = {
          [Gender.Male]: [],
          [Gender.Female]: []
        };
      }
      
      // Add character to appropriate gender group
      result[character.class][character.gender].push(character);
    });
    
    return result;
  }, [templates]);
  
  // Get unique character classes (no gender duplicates)
  const uniqueClasses = useMemo(() => {
    const classSet = new Set<CharacterClass>();
    templates.forEach(character => {
      classSet.add(character.class);
    });
    return Array.from(classSet);
  }, [templates]);
  
  // Get the full template based on selected index but respecting gender choice
  const getSelectedTemplate = (): Character | null => {
    if (selectedIndex === null) return null;
    
    const selectedClass = uniqueClasses[selectedIndex];
    const genderOptions = charactersByClass[selectedClass][selectedGender];
    
    return genderOptions && genderOptions.length > 0 ? genderOptions[0] : null;
  };
  
  const handleCharacterSelect = (index: number) => {
    console.log("Selected character class index:", index);
    console.log("Character class:", uniqueClasses[index]);
    setSelectedIndex(index);
  };

  const handleCharacterDetails = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setModalCharacter(index);
  };
  
  const handleConfirmSelection = () => {
    if (selectedIndex !== null) {
      const selectedTemplate = getSelectedTemplate();
      if (selectedTemplate) {
        console.log("Selected character:", selectedTemplate);
        selectCharacter(selectedTemplate);
        onSelect();
      }
    }
  };
  
  const handleGenderToggle = (gender: Gender) => {
    setSelectedGender(gender);
    console.log("Selected gender:", gender);
  };
  
  // Get the character to display in the modal
  const getModalCharacter = (): Character | null => {
    if (modalCharacter === null) return null;
    
    const selectedClass = uniqueClasses[modalCharacter];
    const characterList = charactersByClass[selectedClass][selectedGender];
    return characterList && characterList.length > 0 ? characterList[0] : null;
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => {
          if (prev === null) return 0;
          return Math.max(0, prev - 1);
        });
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => {
          if (prev === null) return 0;
          return Math.min(uniqueClasses.length - 1, prev + 1);
        });
      } else if (e.key === 'Enter') {
        if (selectedIndex !== null) {
          handleConfirmSelection();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, uniqueClasses.length]);
  
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background stars - responsive */}
      <div className="absolute inset-0 z-0">
        {[...Array(Math.min(80, Math.max(30, Math.floor(window.innerWidth / 12))))].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.min(3, Math.max(1, window.innerWidth / 800))}px`,
              height: `${Math.min(3, Math.max(1, window.innerWidth / 800))}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>
      
      {/* Main content layout with sidebar */}
      <div className="w-full h-full flex flex-col max-h-screen z-10">
        {/* Header */}
        <motion.div
          className="p-4 sm:p-5 flex flex-col items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
            Select Your Character
          </h1>
          
          {/* Gender Selection Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-3 w-full max-w-xs"
          >
            <Tabs 
              defaultValue={Gender.Male} 
              className="w-full"
              onValueChange={(value) => handleGenderToggle(value as Gender)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value={Gender.Male} className="text-sm font-medium">
                  Male
                </TabsTrigger>
                <TabsTrigger value={Gender.Female} className="text-sm font-medium">
                  Female
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        </motion.div>
        
        {/* Main content with 3x4 grid and sidebar */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2">
          {/* Character cards grid - responsive 3x4 layout */}
          <div className="flex-1 overflow-y-auto pr-0 lg:pr-4">
            <div className="w-full h-full">
              <div className="grid grid-cols-3 gap-2 auto-rows-fr" style={{ 
                  width: '100%',
                  gridTemplateRows: 'repeat(4, minmax(0, 1fr))',
                  height: 'calc(100vh - 160px)'
                }}>
                {uniqueClasses && uniqueClasses.length > 0 ? (
                  uniqueClasses.map((characterClass, index) => {
                    // Get the character of the selected gender for this class
                    const characterGroup = charactersByClass[characterClass];
                    const character = characterGroup && characterGroup[selectedGender] && characterGroup[selectedGender][0];
                    
                    if (!character) return null;
                    
                    return (
                      <motion.div
                        key={`${characterClass}-${selectedGender}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                      >
                        <CharacterCard 
                          character={character}
                          isSelected={selectedIndex === index}
                          onClick={() => handleCharacterSelect(index)}
                          onViewDetails={(e) => handleCharacterDetails(e, index)}
                        />
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="w-full text-center text-white col-span-full">
                    <p>Loading character templates...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar character preview */}
          <motion.div 
            className="lg:w-80 xl:w-96 bg-gray-900/80 rounded-lg border border-gray-800 shadow-xl overflow-hidden mt-4 lg:mt-0 flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex-1 overflow-y-auto">
              <CharacterPreview character={getSelectedTemplate()} />
            </div>
            
            {/* Continue button at bottom of sidebar */}
            <div className="p-3 border-t border-gray-800 bg-gray-900">
              <Button 
                variant="default" 
                size="lg" 
                disabled={selectedIndex === null || !getSelectedTemplate()}
                onClick={handleConfirmSelection}
                className={`w-full py-3 transition-all ${
                  selectedIndex !== null 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg' 
                    : 'bg-gray-700'
                }`}
              >
                {selectedIndex !== null ? (
                  <div className="flex items-center justify-center">
                    <span>Begin Adventure</span>
                    <span className="ml-2">→</span>
                  </div>
                ) : 'Choose Your Path'}
              </Button>
              
              {selectedIndex !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-2 text-gray-400 text-xs text-center"
                >
                  Press ENTER to continue
                </motion.div>
              )}
            </div>
            
          </motion.div>
        </div>
      </div>
      
      {/* No sticky overlay button */}
      
      {/* Character Detail Modal */}
      {modalCharacter !== null && getModalCharacter() && (
        <CharacterDetailModal 
          character={getModalCharacter()!} 
          isOpen={modalCharacter !== null}
          onClose={() => setModalCharacter(null)}
        />
      )}
    </div>
  );
};

export default CharacterSelection;