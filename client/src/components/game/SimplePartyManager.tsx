import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParty } from '@/lib/stores/useParty';
import PartyMemberCard from './PartyMemberCard';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CharacterClass, SkillType, PartyMember, Skill } from '@/lib/types';
import { X, Plus, Shield, Sword, Brain, Star } from 'lucide-react';

interface SimplePartyManagerProps {
  onClose: () => void;
}

const SimplePartyManager: React.FC<SimplePartyManagerProps> = ({ onClose }) => {
  const partyStore = useParty();
  
  // Access state directly to avoid TypeScript issues
  const availableCompanions = partyStore.availableCompanions;
  const activePartyMembers = partyStore.activePartyMembers;
  
  // Create wrapper functions for the actions
  const addToParty = (id: string) => {
    (partyStore as any).addToParty(id);
  };
  
  const removeFromParty = (id: string) => {
    (partyStore as any).removeFromParty(id);
  };
  
  const setActivePartyMember = (id: string) => {
    (partyStore as any).setActivePartyMember(id);
  };
  
  const setInactivePartyMember = (id: string) => {
    (partyStore as any).setInactivePartyMember(id);
  };
  
  const [activeTab, setActiveTab] = useState<'current' | 'available'>('current');
  
  const getSpecializationIcon = (specialization: string) => {
    switch (specialization.toLowerCase()) {
      case 'combat':
        return <Sword className="h-4 w-4 text-red-400" />;
      case 'support':
        return <Shield className="h-4 w-4 text-blue-400" />;
      case 'technical':
        return <Brain className="h-4 w-4 text-yellow-400" />;
      default:
        return <Star className="h-4 w-4 text-purple-400" />;
    }
  };
  
  const getClassIcon = (characterClass: CharacterClass | string) => {
    switch (characterClass) {
      case CharacterClass.Soldier:
        return '⚔️';
      case CharacterClass.Engineer:
        return '🔧';
      case CharacterClass.Scientist:
        return '🔬';
      case CharacterClass.Pilot:
        return '🚀';
      case CharacterClass.Diplomat:
        return '🗣️';
      case CharacterClass.Mercenary:
        return '💰';
      case CharacterClass.Explorer:
        return '🧭';
      default:
        return '👤';
    }
  };
  
  const getSkillTypeIcon = (type: SkillType | string) => {
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
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center border-b border-gray-700 p-4">
          <h2 className="text-xl font-bold text-white">Party Management</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs 
          defaultValue="current" 
          className="flex-1 flex flex-col"
          onValueChange={(value) => setActiveTab(value as 'current' | 'available')}
        >
          <div className="border-b border-gray-700">
            <TabsList className="bg-gray-800 mx-4 mt-2">
              <TabsTrigger value="current" className="data-[state=active]:bg-gray-700">
                Current Party ({activePartyMembers.length})
              </TabsTrigger>
              <TabsTrigger value="available" className="data-[state=active]:bg-gray-700">
                Available Companions ({availableCompanions.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="current" className="flex-1 p-4 overflow-auto">
            {activePartyMembers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">Your party is currently empty.</p>
                <Button onClick={() => setActiveTab('available')}>Recruit Companions</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePartyMembers.map((member: PartyMember) => (
                  <div key={member.id} className="relative">
                    <PartyMemberCard 
                      partyMember={member} 
                      isActive={true}
                      showControls={true}
                      onDeactivate={() => setInactivePartyMember(member.id)}
                    />
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => removeFromParty(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {activePartyMembers.length > 0 && (
              <div className="mt-6 border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-3">Party Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Combat Power</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      <Sword className="h-5 w-5 text-red-400" />
                      {/* Calculate based on combat skills and abilities */}
                      {activePartyMembers.reduce((sum: number, member: PartyMember) => {
                        // Simple calculation for demo
                        return sum + (member.skills?.filter((s: any) => s.type === SkillType.Combat)
                          .reduce((acc: number, s: any) => acc + s.level, 0) || 0);
                      }, 0)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Technical Skill</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-yellow-400" />
                      {activePartyMembers.reduce((sum: number, member: PartyMember) => {
                        return sum + (member.skills?.filter((s: any) => s.type === SkillType.Technical)
                          .reduce((acc: number, s: any) => acc + s.level, 0) || 0);
                      }, 0)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Social Skills</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-400" />
                      {activePartyMembers.reduce((sum: number, member: PartyMember) => {
                        return sum + (member.skills?.filter((s: any) => s.type === SkillType.Social)
                          .reduce((acc: number, s: any) => acc + s.level, 0) || 0);
                      }, 0)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Scientific Knowledge</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      <Star className="h-5 w-5 text-purple-400" />
                      {activePartyMembers.reduce((sum, member) => {
                        return sum + (member.skills?.filter(s => s.type === SkillType.Scientific)
                          .reduce((acc, s) => acc + s.level, 0) || 0);
                      }, 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="available" className="flex-1 p-4 overflow-auto">
            {availableCompanions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No companions available for recruitment.</p>
                <p className="text-gray-500 text-sm mt-2">Explore the galaxy to find companions who can join your crew.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCompanions.map((companion) => (
                  <div key={companion.id} className="bg-gray-800 rounded-lg p-4 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{companion.name}</h3>
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <span className="mr-1">{getClassIcon(companion.class || '')}</span>
                          <span>{companion.class}</span>
                          {companion.specialization && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="flex items-center">
                                {getSpecializationIcon(companion.specialization)}
                                <span className="ml-1">{companion.specialization}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-blue-900/50 hover:bg-blue-800"
                        onClick={() => addToParty(companion.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Recruit
                      </Button>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4">{companion.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300">Key Skills:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {companion.skills?.slice(0, 4).map((skill) => (
                          <div key={skill.id} className="flex items-center text-xs text-gray-400">
                            <span className="mr-1">{getSkillTypeIcon(skill.type)}</span>
                            <span>{skill.name} (Lv.{skill.level})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="border-t border-gray-700 p-4 flex justify-between">
          <div className="text-sm text-gray-400">
            <span>Party Limit: {activePartyMembers.length}/4</span>
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SimplePartyManager;