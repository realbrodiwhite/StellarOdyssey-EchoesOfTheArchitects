import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Character, SkillType } from '@/lib/types';

interface CharacterDetailModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
}

const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ 
  character, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  const getSkillTypeIcon = (type: SkillType): string => {
    switch (type) {
      case SkillType.Combat:
        return '⚔️';
      case SkillType.Technical:
        return '🔧';
      case SkillType.Scientific:
        return '🔬';
      case SkillType.Social:
        return '🗣️';
      case SkillType.Navigation:
        return '🧭';
      default:
        return '❓';
    }
  };

  // Function to render skill level as bars
  const renderSkillLevel = (level: number, maxLevel: number = 5) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(maxLevel)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-3 rounded-sm ${
              i < level ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <AnimatePresence>
        <motion.div
          className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">{character.class}</h2>
            <button 
              className="text-gray-400 hover:text-white transition-colors text-2xl"
              onClick={onClose}
            >
              &times;
            </button>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="mb-5">
                  <h3 className="text-xl font-semibold text-white mb-1">About</h3>
                  <p className="text-gray-300">{character.description}</p>
                </div>

                <div className="mb-5">
                  <h3 className="text-xl font-semibold text-white mb-3">Skills</h3>
                  <div className="space-y-4">
                    {character.skills.map(skill => (
                      <div key={skill.id} className="bg-gray-800 p-3 rounded">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <span className="mr-2">{getSkillTypeIcon(skill.type)}</span>
                            <span className="text-white font-medium">{skill.name}</span>
                          </div>
                          <div className="text-gray-400 text-sm">
                            Level {skill.level}/{skill.maxLevel}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-gray-400 text-sm">{skill.description}</p>
                          {renderSkillLevel(skill.level, skill.maxLevel)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {character.abilities && character.abilities.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xl font-semibold text-white mb-3">Abilities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {character.abilities.map(ability => (
                        <div key={ability.id} className="bg-gray-800 p-3 rounded">
                          <div className="text-white font-medium mb-1">{ability.name}</div>
                          <p className="text-gray-400 text-sm mb-2">{ability.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-blue-400">
                              Energy: {ability.energyCost}
                            </span>
                            <span className="text-gray-500">
                              Cooldown: {ability.cooldown} turns
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="bg-gray-800 p-4 rounded mb-4">
                  <h3 className="text-xl font-semibold text-white mb-3">Stats</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Health</span>
                        <span className="text-white">{character.health}/{character.maxHealth}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Energy</span>
                        <span className="text-white">{character.energy}/{character.maxEnergy}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${(character.energy / character.maxEnergy) * 100}%` }}
                        />
                      </div>
                    </div>

                    {character.shield !== undefined && character.maxShield !== undefined && (
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Shield</span>
                          <span className="text-white">{character.shield}/{character.maxShield}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 rounded-full" 
                            style={{ width: `${(character.shield / character.maxShield) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded">
                  <h3 className="text-lg font-semibold text-white mb-3">Character Details</h3>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">Class</div>
                      <div className="text-white">{character.class}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">Starting Level</div>
                      <div className="text-white">{character.level}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">Specialized In</div>
                      <div className="text-white">
                        {character.skills
                          .filter(s => s.level > 1)
                          .slice(0, 2)
                          .map(s => s.type)
                          .join(', ') || 'Balanced'}
                      </div>
                    </div>
                    
                    {character.credits !== undefined && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-400">Starting Credits</div>
                        <div className="text-white">{character.credits}</div>
                      </div>
                    )}
                    
                    {character.faction && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-400">Faction</div>
                        <div className="text-white">{character.faction}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 p-4 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CharacterDetailModal;