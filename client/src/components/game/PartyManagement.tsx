import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParty, PartyMember } from '@/lib/stores/useParty';
import { useCharacter } from '@/lib/stores/useCharacter';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { CharacterClass, SkillType } from '@/lib/types';

interface PartyManagementProps {
  onClose: () => void;
}

const PartyManagement: React.FC<PartyManagementProps> = ({ onClose }) => {
  const { 
    partyMembers, 
    activePartyMembers, 
    availableCompanions,
    addPartyMember, 
    removePartyMember, 
    activatePartyMember, 
    deactivatePartyMember,
    purchaseCompanion,
    isPartyFull,
    maxPartySize
  } = useParty();
  
  const { selectedCharacter } = useCharacter();
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  const [selectionMode, setSelectionMode] = useState<'activate' | 'deactivate' | 'none'>('none');
  
  // Function to get specialization color
  const getSpecializationColor = (specialization: string) => {
    switch (specialization.toLowerCase()) {
      case 'tank':
      case 'tank/dps':
        return 'bg-red-600';
      case 'dps':
        return 'bg-orange-600';
      case 'healer':
      case 'support':
        return 'bg-green-600';
      case 'tech':
        return 'bg-blue-600';
      default:
        return 'bg-purple-600';
    }
  };
  
  // Function to get class icon
  const getClassIcon = (characterClass: CharacterClass) => {
    switch (characterClass) {
      case CharacterClass.Soldier:
        return '🪖';
      case CharacterClass.Engineer:
        return '🔧';
      case CharacterClass.Scientist:
        return '🔬';
      case CharacterClass.Pilot:
        return '🚀';
      case CharacterClass.Diplomat:
        return '🤝';
      case CharacterClass.Mercenary:
        return '💰';
      case CharacterClass.Explorer:
        return '🧭';
      default:
        return '👤';
    }
  };
  
  // Function to render skill level indicator
  const renderSkillLevel = (level: number, maxLevel: number = 5) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(maxLevel)].map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-3 rounded-sm ${i < level ? 'bg-blue-400' : 'bg-gray-600'}`}
          />
        ))}
      </div>
    );
  };
  
  // Handle selecting a companion for activation/deactivation
  const handleSelectCompanion = (id: string) => {
    if (selectionMode === 'none') {
      setSelectedCompanionId(id === selectedCompanionId ? null : id);
      return;
    }
    
    if (selectionMode === 'activate') {
      if (isPartyFull()) {
        alert('Your party is already full. Deactivate a member first.');
        return;
      }
      activatePartyMember(id);
      setSelectionMode('none');
    } else if (selectionMode === 'deactivate') {
      deactivatePartyMember(id);
      setSelectionMode('none');
    }
  };
  
  const handlePurchaseCompanion = (id: string) => {
    const success = purchaseCompanion(id);
    if (success) {
      // Could add animation or notification here
      setActiveTab('current');
    }
  };
  
  // Render a companion card (used in multiple places)
  const renderCompanionCard = (companion: PartyMember, isActive: boolean, isAvailable: boolean = false) => {
    const isSelected = companion.id === selectedCompanionId;
    
    return (
      <Card
        key={companion.id}
        className={`cursor-pointer border p-3 transition-all duration-200 ${
          isSelected 
            ? 'border-blue-500 ring-2 ring-blue-300 bg-gray-800' 
            : isActive 
              ? 'border-green-500 bg-gray-900'
              : 'border-gray-700 bg-gray-950 hover:bg-gray-900 hover:border-gray-500'
        }`}
        onClick={() => handleSelectCompanion(companion.id)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <span className="text-xl mr-2">{getClassIcon(companion.class)}</span>
            <h3 className="text-md font-bold text-white">{companion.name}</h3>
          </div>
          <Badge className={`${getSpecializationColor(companion.specialization)}`}>
            {companion.specialization}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="text-xs text-gray-400">{companion.description.substring(0, 80)}...</div>
          
          {companion.cost && isAvailable && (
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-md p-2 my-1">
              <div className="text-xs text-yellow-300 font-bold">Recruitment Cost</div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">💰</span>
                  <span className="text-white">{companion.cost} Credits</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchaseCompanion(companion.id);
                  }}
                  disabled={!selectedCharacter?.credits || selectedCharacter.credits < companion.cost}
                  className="h-7 text-xs"
                >
                  Recruit
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-800 rounded p-1.5">
            <div className="text-xs text-blue-400 mb-0.5">Health</div>
            <div className="text-sm font-bold text-white flex items-center">
              <span className="text-red-400 mr-1">❤</span> {companion.health}/{companion.maxHealth}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded p-1.5">
            <div className="text-xs text-blue-400 mb-0.5">Level</div>
            <div className="text-sm font-bold text-white">
              <span className="text-yellow-400 mr-1">✨</span> {companion.level}
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-300">Key Skills:</div>
          {companion.skills.slice(0, 2).map(skill => (
            <div key={skill.id} className="flex justify-between items-center text-xs">
              <span className="text-gray-400">{skill.name}</span>
              {renderSkillLevel(skill.level, skill.maxLevel)}
            </div>
          ))}
        </div>
        
        {isActive && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-xs text-green-400">Active Party Member</div>
          </div>
        )}
      </Card>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center border-b border-gray-700 p-4">
          <h2 className="text-xl font-bold text-white">Party Management</h2>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Active Party ({activePartyMembers.length}/{maxPartySize})</h3>
              <p className="text-gray-400 text-sm">
                {isPartyFull() 
                  ? "Your party is at maximum capacity." 
                  : `You can add ${maxPartySize - activePartyMembers.length} more companions.`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectionMode(selectionMode === 'activate' ? 'none' : 'activate')}
                disabled={isPartyFull() || activeTab !== 'current' || partyMembers.filter(m => !m.active).length === 0}
                className={selectionMode === 'activate' ? 'bg-green-900 text-white border-green-500' : ''}
              >
                Activate Member
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectionMode(selectionMode === 'deactivate' ? 'none' : 'deactivate')}
                disabled={activePartyMembers.length === 0 || activeTab !== 'current'}
                className={selectionMode === 'deactivate' ? 'bg-red-900 text-white border-red-500' : ''}
              >
                Deactivate Member
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="current" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
          <div className="px-4 border-b border-gray-700">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="current">Current Party</TabsTrigger>
              <TabsTrigger value="available">Available Companions</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="current" className="h-full">
              {partyMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Companions Yet</h3>
                  <p className="text-gray-400 max-w-md">
                    You haven't recruited any companions to your party. 
                    Explore the galaxy and you'll meet potential allies along the way.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partyMembers.map(companion => 
                    renderCompanionCard(companion, activePartyMembers.some(m => m.id === companion.id))
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="available" className="h-full">
              {availableCompanions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Available Companions</h3>
                  <p className="text-gray-400 max-w-md">
                    There are no companions available for recruitment at this time.
                    Continue exploring and visiting new locations to find potential allies.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCompanions.map(companion => 
                    renderCompanionCard(companion, false, true)
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
        
        {selectedCompanionId && selectionMode === 'none' && (
          <div className="border-t border-gray-700 p-4">
            <CompanionDetails 
              companionId={selectedCompanionId} 
              onClose={() => setSelectedCompanionId(null)} 
            />
          </div>
        )}
        
        <div className="border-t border-gray-700 p-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </div>
  );
};

// Component to show detailed information about a selected companion
const CompanionDetails: React.FC<{ companionId: string; onClose: () => void }> = ({ 
  companionId, 
  onClose 
}) => {
  const { getPartyMember } = useParty();
  const companion = getPartyMember(companionId);
  
  if (!companion) return null;
  
  // Get an emoji for skill type
  const getSkillTypeIcon = (type: SkillType) => {
    switch (type) {
      case SkillType.Combat: return '⚔️';
      case SkillType.Technical: return '🔧';
      case SkillType.Scientific: return '🔬';
      case SkillType.Social: return '🗣️';
      case SkillType.Navigation: return '🧭';
      default: return '📊';
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-md p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center">
            {companion.name}
            <span className="ml-2 text-sm bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
              Level {companion.level} {companion.class}
            </span>
          </h3>
          <div className="text-gray-400">{companion.description}</div>
        </div>
        <button 
          className="text-gray-400 hover:text-white"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-white font-semibold mb-2">Stats</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-900 p-2 rounded">
              <div className="text-xs text-blue-400">Health</div>
              <div className="text-white flex items-center">
                <span className="text-red-400 mr-1">❤</span>
                {companion.health}/{companion.maxHealth}
              </div>
            </div>
            <div className="bg-gray-900 p-2 rounded">
              <div className="text-xs text-blue-400">Energy</div>
              <div className="text-white flex items-center">
                <span className="text-blue-400 mr-1">⚡</span>
                {companion.energy}/{companion.maxEnergy}
              </div>
            </div>
            {companion.shield && companion.maxShield && (
              <div className="bg-gray-900 p-2 rounded">
                <div className="text-xs text-blue-400">Shield</div>
                <div className="text-white flex items-center">
                  <span className="text-cyan-400 mr-1">🛡️</span>
                  {companion.shield}/{companion.maxShield}
                </div>
              </div>
            )}
            <div className="bg-gray-900 p-2 rounded">
              <div className="text-xs text-blue-400">Loyalty</div>
              <div className="text-white flex items-center">
                <span className="text-purple-400 mr-1">🤝</span>
                {companion.loyalty}/100
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-2">Relationship</h4>
          <div className="bg-gray-900 p-3 rounded">
            <div className="relative h-2 bg-gray-700 rounded overflow-hidden mb-1">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600"
                style={{ width: `${companion.relationship}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">
                {companion.relationship < 25 ? 'Distrustful' : 
                 companion.relationship < 50 ? 'Neutral' : 
                 companion.relationship < 75 ? 'Friendly' : 'Loyal'}
              </span>
              <span className="text-gray-400">{companion.relationship}/100</span>
            </div>
          </div>
          
          <h4 className="text-white font-semibold mt-3 mb-2">Unique Perks</h4>
          <div className="bg-gray-900 p-2 rounded">
            <ul className="list-disc list-inside text-sm">
              {companion.uniquePerks.map((perk, index) => (
                <li key={index} className="text-gray-300">{perk}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-white font-semibold mb-2">Skills</h4>
          <div className="bg-gray-900 p-3 rounded">
            <div className="space-y-2">
              {companion.skills.map(skill => (
                <div key={skill.id}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="mr-1">{getSkillTypeIcon(skill.type)}</span>
                      <span className="text-gray-300">{skill.name}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Level {skill.level}/{skill.maxLevel}
                    </div>
                  </div>
                  <div className="relative h-1.5 bg-gray-800 rounded overflow-hidden mt-1">
                    <div 
                      className="absolute top-0 left-0 h-full bg-blue-500"
                      style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{skill.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-2">Abilities</h4>
          <div className="bg-gray-900 p-3 rounded">
            <div className="space-y-3">
              {companion.abilities.map(ability => (
                <div key={ability.id} className="border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <span className="text-white font-medium">{ability.name}</span>
                    <span className="text-blue-400 text-xs">
                      Cost: {ability.energyCost} Energy
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{ability.description}</div>
                  <div className="flex justify-between mt-1.5 text-xs">
                    <div className="flex items-center">
                      {ability.damage && (
                        <span className="text-red-400 mr-2">Damage: {ability.damage}</span>
                      )}
                      {ability.healing && (
                        <span className="text-green-400 mr-2">Healing: {ability.healing}</span>
                      )}
                    </div>
                    <span className="text-gray-500">Cooldown: {ability.cooldown} turns</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-700">
        <h4 className="text-white font-semibold mb-2">Backstory</h4>
        <div className="bg-gray-900 p-3 rounded text-gray-300 text-sm">
          {companion.backstory}
        </div>
      </div>
    </div>
  );
};

export default PartyManagement;