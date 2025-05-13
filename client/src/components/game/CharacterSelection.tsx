import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { characterTemplates } from "@/lib/data/characters";
import { useCharacter } from "@/lib/stores/useCharacter";
import { CharacterClass, SkillType } from "@/lib/types";

interface CharacterSelectionProps {
  onSelect: () => void;
}

const CharacterSelection = ({ onSelect }: CharacterSelectionProps) => {
  const { selectCharacter } = useCharacter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const handleCharacterSelect = (index: number) => {
    setSelectedIndex(index);
  };
  
  const handleConfirmSelection = () => {
    if (selectedIndex !== null) {
      selectCharacter(characterTemplates[selectedIndex].class);
      onSelect();
    }
  };
  
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
      
      <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto mb-8 z-10">
        {characterTemplates.map((character, index) => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex-1"
          >
            <Card 
              className={`p-6 h-full cursor-pointer transition-all duration-200 ${
                selectedIndex === index 
                  ? 'ring-2 ring-blue-500 bg-gray-800' 
                  : 'hover:bg-gray-900 bg-gray-950'
              }`}
              onClick={() => handleCharacterSelect(index)}
            >
              <h2 className="text-xl font-bold text-white mb-2">{character.class}</h2>
              <p className="text-gray-300 text-sm mb-4">{character.description}</p>
              
              <div className="space-y-3">
                <h3 className="text-md font-semibold text-gray-200">Skills:</h3>
                {character.skills.map(skill => (
                  <div key={skill.id} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{skill.name}</span>
                    {getSkillBar(skill.level, skill.maxLevel)}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Health:</span>
                  <span className="text-white">{character.health}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Energy:</span>
                  <span className="text-white">{character.energy}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="z-10"
      >
        <Button 
          variant="default" 
          size="lg" 
          disabled={selectedIndex === null}
          onClick={handleConfirmSelection}
          className="px-12"
        >
          Begin Adventure
        </Button>
      </motion.div>
    </div>
  );
};

export default CharacterSelection;
