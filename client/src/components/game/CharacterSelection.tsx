import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { characterTemplates } from "@/lib/data/characters";
import { useCharacter } from "@/lib/stores/useCharacter";
import { CharacterClass, SkillType } from "@/lib/types";
import CharacterDetailModal from "./CharacterDetailModal";

interface CharacterSelectionProps {
  onSelect: () => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onSelect }) => {
  // Debug: Check if character templates are loaded correctly
  console.log("Character templates available:", characterTemplates);
  console.log("Number of templates:", characterTemplates.length);
  
  const { selectCharacter } = useCharacter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modalCharacter, setModalCharacter] = useState<number | null>(null);
  
  const handleCharacterSelect = (index: number) => {
    console.log("Selected character index:", index);
    console.log("Character data:", characterTemplates[index]);
    setSelectedIndex(index);
  };

  const handleCharacterDetails = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setModalCharacter(index);
  };
  
  const handleConfirmSelection = () => {
    if (selectedIndex !== null) {
      // Pass the actual CharacterClass enum value, not a string
      selectCharacter(characterTemplates[selectedIndex].class);
      console.log("Selected character class:", characterTemplates[selectedIndex].class);
      onSelect();
    }
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
          return Math.min(characterTemplates.length - 1, prev + 1);
        });
      } else if (e.key === 'Enter') {
        if (selectedIndex !== null) {
          handleConfirmSelection();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);
  
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-auto py-4 sm:py-6 md:py-8">
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
      
      <motion.h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-5 md:mb-6 z-10 px-4 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Select Your Character
      </motion.h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto mb-6 sm:mb-7 md:mb-8 z-10 px-2 sm:px-3 md:px-4">
        {characterTemplates && characterTemplates.length > 0 ? (
          characterTemplates.map((character, index) => (
            <motion.div
              key={character.id || `character-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 overflow-hidden ${
                  selectedIndex === index 
                    ? 'ring-3 ring-blue-500 bg-gray-800 transform scale-[1.02]' 
                    : 'hover:bg-gray-900 hover:ring-1 hover:ring-blue-300 bg-gray-950'
                }`}
                onClick={() => handleCharacterSelect(index)}
              >
                <div className="relative">
                  {/* Character glow effect on selected */}
                  {selectedIndex === index && (
                    <div className="absolute -inset-0.5 bg-blue-500/20 animate-pulse rounded-lg z-0"></div>
                  )}
                  
                  <div className="p-3 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-base font-bold text-white">{character.class}</h2>
                      {selectedIndex === index && (
                        <div className="bg-blue-500 text-white text-[10px] px-1 py-0.5 rounded">Selected</div>
                      )}
                    </div>
                    
                    <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-purple-500 mb-2"></div>
                    
                    <p className="text-gray-300 text-xs mb-3 line-clamp-2">{character.description.split('.')[0]}.</p>
                    
                    <div className="space-y-1.5">
                      {/* Top skills at a glance */}
                      {character.skills
                        .filter(skill => skill.level > 1)
                        .slice(0, 2)
                        .map(skill => (
                          <div key={skill.id} className="flex justify-between items-center">
                            <span className="text-gray-400 text-[10px]">{skill.name}</span>
                            <div className="flex space-x-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div 
                                  key={i}
                                  className={`w-1 h-2 rounded-sm ${
                                    i < skill.level ? 'bg-blue-400' : 'bg-gray-700'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                      
                    <div className="mt-3 pt-2 border-t border-gray-800 grid grid-cols-2 gap-1.5">
                      <div className="bg-gray-900/60 p-1.5 rounded">
                        <div className="text-[9px] text-blue-400">Health</div>
                        <div className="text-xs font-bold text-white">
                          <span className="text-red-400 mr-0.5">❤</span> {character.health}
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/60 p-1.5 rounded">
                        <div className="text-[9px] text-blue-400">Energy</div>
                        <div className="text-xs font-bold text-white">
                          <span className="text-blue-400 mr-0.5">⚡</span> {character.energy}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      className="mt-2 w-full text-center text-[10px] bg-gray-800/80 hover:bg-gray-700 text-gray-300 py-1 rounded transition-colors"
                      onClick={(e) => handleCharacterDetails(e, index)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="w-full text-center text-white col-span-4">
            <p>Loading character templates...</p>
          </div>
        )}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="z-10 flex flex-col items-center px-4 w-full max-w-md"
      >
        {selectedIndex !== null ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mb-4 sm:mb-6 md:mb-8 text-center"
          >
            <h3 className="text-green-400 text-base sm:text-lg mb-1 sm:mb-2">Character Selected: {characterTemplates[selectedIndex]?.class}</h3>
            <p className="text-gray-400 text-xs sm:text-sm">Are you ready to begin your cosmic adventure?</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-4 sm:mb-6 md:mb-8 text-center"
          >
            <h3 className="text-amber-400 text-base sm:text-lg mb-1 sm:mb-2">Select a character to continue</h3>
            <p className="text-gray-400 text-xs sm:text-sm">Each class has unique abilities and advantages</p>
          </motion.div>
        )}
        
        <Button 
          variant="default" 
          size="lg" 
          disabled={selectedIndex === null}
          onClick={handleConfirmSelection}
          className={`px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 text-base sm:text-lg transition-all w-full sm:w-auto ${
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
            className="mt-3 sm:mt-4 text-gray-400 text-xs"
          >
            Press ENTER to continue
          </motion.div>
        )}
      </motion.div>
      
      {/* Character Detail Modal */}
      {modalCharacter !== null && (
        <CharacterDetailModal 
          character={characterTemplates[modalCharacter]} 
          isOpen={modalCharacter !== null}
          onClose={() => setModalCharacter(null)}
        />
      )}
    </div>
  );
};

export default CharacterSelection;