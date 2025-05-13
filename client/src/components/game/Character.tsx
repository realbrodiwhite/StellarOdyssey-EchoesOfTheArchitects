import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { ChevronUp } from "lucide-react";
import { useCharacter } from "@/lib/stores/useCharacter";
import { Skill, SkillType } from "@/lib/types";

interface CharacterProps {
  onClose: () => void;
}

const Character = ({ onClose }: CharacterProps) => {
  const { selectedCharacter, improveSkill } = useCharacter();
  const [skillPoints, setSkillPoints] = useState(0);
  const [availableSkillPoints, setAvailableSkillPoints] = useState(0);
  
  // Calculate available skill points based on character level
  useEffect(() => {
    if (selectedCharacter) {
      // Simple formula: 3 skill points per level
      const totalPoints = selectedCharacter.level * 3;
      
      // Calculate how many points have been used
      const usedPoints = selectedCharacter.skills.reduce(
        (sum, skill) => sum + skill.level - 1, // -1 because level 1 is the starting level
        0
      );
      
      // Calculate available points
      const available = Math.max(0, totalPoints - usedPoints);
      setSkillPoints(totalPoints);
      setAvailableSkillPoints(available);
    }
  }, [selectedCharacter]);
  
  if (!selectedCharacter) return null;
  
  // Handle skill improvement
  const handleImproveSkill = (skill: Skill) => {
    if (availableSkillPoints <= 0 || skill.level >= skill.maxLevel) return;
    
    const improved = improveSkill(skill.id);
    if (improved) {
      // Update available skill points immediately for better UX
      setAvailableSkillPoints(prev => prev - 1);
    }
  };
  
  // Group skills by type
  const skillsByType = selectedCharacter.skills.reduce<Record<SkillType, Skill[]>>(
    (groups, skill) => {
      if (!groups[skill.type]) {
        groups[skill.type] = [];
      }
      groups[skill.type].push(skill);
      return groups;
    },
    {} as Record<SkillType, Skill[]>
  );
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-gray-900 rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Character Sheet</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {selectedCharacter.class}
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                {selectedCharacter.description}
              </p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300">Level</span>
                    <span className="text-white font-semibold">{selectedCharacter.level}</span>
                  </div>
                  <Progress 
                    value={(selectedCharacter.experience / 
                      (selectedCharacter.level * 100)) * 100} 
                    className="h-2 bg-gray-700"
                    indicatorClassName="bg-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>EXP: {selectedCharacter.experience}</span>
                    <span>Next: {selectedCharacter.level * 100}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300">Health</span>
                    <span className="text-white">
                      {selectedCharacter.health}/{selectedCharacter.maxHealth}
                    </span>
                  </div>
                  <Progress 
                    value={(selectedCharacter.health / selectedCharacter.maxHealth) * 100} 
                    className="h-2 bg-gray-700"
                    indicatorClassName="bg-red-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300">Energy</span>
                    <span className="text-white">
                      {selectedCharacter.energy}/{selectedCharacter.maxEnergy}
                    </span>
                  </div>
                  <Progress 
                    value={(selectedCharacter.energy / selectedCharacter.maxEnergy) * 100} 
                    className="h-2 bg-gray-700"
                    indicatorClassName="bg-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">Abilities</h3>
              </div>
              
              <div className="space-y-2">
                {selectedCharacter.abilities.map(ability => (
                  <Card key={ability.id} className="p-3 bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{ability.name}</h4>
                        <p className="text-gray-400 text-xs">{ability.description}</p>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-blue-400">Energy: {ability.energyCost}</div>
                        {ability.damage && <div className="text-red-400">Damage: {ability.damage}</div>}
                        {ability.healing && <div className="text-green-400">Healing: {ability.healing}</div>}
                        <div className="text-gray-400">Cooldown: {ability.cooldown} turns</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">Skills</h3>
              <span className="text-blue-300">
                Available Skill Points: {availableSkillPoints}
              </span>
            </div>
            
            <Tabs defaultValue="Technical" className="mt-4">
              <TabsList className="grid grid-cols-5 bg-gray-800">
                {Object.keys(SkillType).map(type => (
                  <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
                ))}
              </TabsList>
              
              {Object.entries(skillsByType).map(([type, skills]) => (
                <TabsContent key={type} value={type} className="mt-2">
                  <div className="space-y-2">
                    {skills.map(skill => (
                      <div key={skill.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                        <div>
                          <h4 className="text-white font-medium">{skill.name}</h4>
                          <p className="text-gray-400 text-xs">{skill.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-24">
                            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500"
                                style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-center text-gray-400 mt-1">
                              {skill.level}/{skill.maxLevel}
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8"
                            disabled={availableSkillPoints <= 0 || skill.level >= skill.maxLevel}
                            onClick={() => handleImproveSkill(skill)}
                          >
                            <ChevronUp size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Character;
