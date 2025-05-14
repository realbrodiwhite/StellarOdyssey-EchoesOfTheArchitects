import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { characterTemplates } from "@/lib/data/characters";
import { useCharacter } from "@/lib/stores/useCharacter";
import { CharacterClass, SkillType } from "@/lib/types";

interface CharacterSelectionProps {
  onSelect: () => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onSelect }) => {
  // Debug: Check if character templates are loaded correctly
  console.log("Character templates available:", characterTemplates);
  console.log("Number of templates:", characterTemplates.length);
  
  const { selectCharacter } = useCharacter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const handleCharacterSelect = (index: number) => {
    console.log("Selected character index:", index);
    console.log("Character data:", characterTemplates[index]);
    setSelectedIndex(index);
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
  
  // Function to get skill level as a visual bar
  const getSkillBar = (level: number, maxLevel: number) => {
    return (
      <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-400 rounded-full"
          style={{ width: `${(level / maxLevel) * 100}%` }}
        />
      </div>
    );
  };
  
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-auto py-8">
      {/* Background stars */}
      <div className="absolute inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>
      
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-white mb-6 z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Select Your Character
      </motion.h1>
      
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto mb-8 z-10 px-4">
        {characterTemplates && characterTemplates.length > 0 ? (
          characterTemplates.map((character, index) => (
            <motion.div
              key={character.id || `character-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 min-w-[280px]"
            >
              <Card 
                className={`p-6 h-full cursor-pointer transition-all duration-200 ${
                  selectedIndex === index 
                    ? 'ring-4 ring-blue-500 bg-gray-800 transform scale-[1.02]' 
                    : 'hover:bg-gray-900 hover:ring-2 hover:ring-blue-300 bg-gray-950'
                }`}
                onClick={() => handleCharacterSelect(index)}
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-white mb-2">{character.class}</h2>
                  {selectedIndex === index && (
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Selected</div>
                  )}
                </div>
                
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mb-4"></div>
                
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">{character.description}</p>
                
                {/* Character backstory preview */}
                {character.backstory && (
                  <div className="mb-5 px-3 py-2 bg-gray-900 rounded-md border-l-2 border-blue-500">
                    <p className="text-gray-400 text-xs italic leading-snug">"{character.backstory.substring(0, 120)}..."</p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <h3 className="text-md font-semibold text-gray-200 flex items-center">
                    <span className="mr-2">⚔️</span> Specialized Skills:
                  </h3>
                  {character.skills
                    .filter(skill => skill.level > 1) // Specialized skills have higher starting levels
                    .slice(0, 3) // Show only top specialized skills
                    .map(skill => (
                      <div key={skill.id} className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">{skill.name}</span>
                        <div className="flex items-center">
                          {getSkillBar(skill.level, skill.maxLevel)}
                          <span className="ml-2 text-blue-300 text-xs">{skill.level}/{skill.maxLevel}</span>
                        </div>
                      </div>
                    ))
                  }
                  
                  <h3 className="text-md font-semibold text-gray-200 mt-4 flex items-center">
                    <span className="mr-2">🛠️</span> Standard Skills:
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">All characters have these core skills:</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <span className="text-gray-300 text-xs flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Survival
                    </span>
                    <span className="text-gray-300 text-xs flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Basic Combat
                    </span>
                    <span className="text-gray-300 text-xs flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Spaceship Operations
                    </span>
                    <span className="text-gray-300 text-xs flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>Equipment Maintenance
                    </span>
                    <span className="text-gray-300 text-xs flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>Communication
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-3 rounded-md">
                    <div className="text-xs text-blue-400 mb-1">Health</div>
                    <div className="text-xl font-bold text-white flex items-center">
                      <span className="text-red-400 mr-1">❤</span> {character.health}
                      <span className="text-gray-500 text-xs ml-1">/ {character.maxHealth}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-3 rounded-md">
                    <div className="text-xs text-blue-400 mb-1">Energy</div>
                    <div className="text-xl font-bold text-white flex items-center">
                      <span className="text-blue-400 mr-1">⚡</span> {character.energy}
                      <span className="text-gray-500 text-xs ml-1">/ {character.maxEnergy}</span>
                    </div>
                  </div>
                  
                  {character.shield && character.maxShield && (
                    <div className="bg-gray-900 p-3 rounded-md">
                      <div className="text-xs text-blue-400 mb-1">Shield</div>
                      <div className="text-xl font-bold text-white flex items-center">
                        <span className="text-cyan-400 mr-1">🛡️</span> {character.shield}
                        <span className="text-gray-500 text-xs ml-1">/ {character.maxShield}</span>
                      </div>
                    </div>
                  )}
                  
                  {character.credits !== undefined && (
                    <div className="bg-gray-900 p-3 rounded-md">
                      <div className="text-xs text-blue-400 mb-1">Credits</div>
                      <div className="text-xl font-bold text-white flex items-center">
                        <span className="text-yellow-400 mr-1">💰</span> {character.credits}
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedIndex === index && (
                  <div className="mt-4 w-full">
                    <div className="h-1 w-full bg-blue-500 animate-pulse rounded"></div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="w-full text-center text-white">
            <p>Loading character templates...</p>
          </div>
        )}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="z-10 flex flex-col items-center"
      >
        {selectedIndex !== null ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mb-8 text-center"
          >
            <h3 className="text-green-400 text-lg mb-2">Character Selected: {characterTemplates[selectedIndex]?.class}</h3>
            <p className="text-gray-400 text-sm">Are you ready to begin your cosmic adventure?</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-8 text-center"
          >
            <h3 className="text-amber-400 text-lg mb-2">Select a character to continue</h3>
            <p className="text-gray-400 text-sm">Each class has unique abilities and advantages</p>
          </motion.div>
        )}
        
        <Button 
          variant="default" 
          size="lg" 
          disabled={selectedIndex === null}
          onClick={handleConfirmSelection}
          className={`px-16 py-6 text-lg transition-all ${
            selectedIndex !== null 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg' 
              : 'bg-gray-700'
          }`}
        >
          {selectedIndex !== null ? (
            <div className="flex items-center">
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
            className="mt-4 text-gray-400 text-xs"
          >
            Press ENTER to continue
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CharacterSelection;