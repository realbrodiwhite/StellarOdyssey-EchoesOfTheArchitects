import React from 'react';
import { PartyMember } from '@/lib/stores/useParty';
import { CharacterClass, SkillType } from '@/lib/types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface PartyMemberCardProps {
  partyMember: PartyMember;
  isActive: boolean;
  onClick?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  showControls?: boolean;
}

const PartyMemberCard: React.FC<PartyMemberCardProps> = ({
  partyMember,
  isActive,
  onClick,
  onActivate,
  onDeactivate,
  showControls = true
}) => {
  // Get appropriate emoji for character class
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

  // Get color for specialization badge
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

  return (
    <Card 
      className={`p-3 border overflow-hidden transition-all duration-200 ${
        isActive 
          ? 'border-green-500 bg-gray-800' 
          : 'border-gray-700 bg-gray-900 hover:bg-gray-850'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <span className="text-xl mr-2">{getClassIcon(partyMember.class)}</span>
          <div>
            <h3 className="text-md font-bold text-white">{partyMember.name}</h3>
            <div className="text-xs text-gray-400">Level {partyMember.level} {partyMember.class}</div>
          </div>
        </div>
        
        <Badge className={`${getSpecializationColor(partyMember.specialization)}`}>
          {partyMember.specialization}
        </Badge>
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Health</span>
          <span className="text-white">{partyMember.health}/{partyMember.maxHealth}</span>
        </div>
        <Progress 
          value={(partyMember.health / partyMember.maxHealth) * 100} 
          className="h-1.5" 
          indicatorClassName="bg-red-500"
        />
        
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Energy</span>
          <span className="text-white">{partyMember.energy}/{partyMember.maxEnergy}</span>
        </div>
        <Progress 
          value={(partyMember.energy / partyMember.maxEnergy) * 100} 
          className="h-1.5" 
          indicatorClassName="bg-blue-500"
        />
        
        {partyMember.shield !== undefined && partyMember.maxShield !== undefined && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Shield</span>
              <span className="text-white">{partyMember.shield}/{partyMember.maxShield}</span>
            </div>
            <Progress 
              value={(partyMember.shield / partyMember.maxShield) * 100} 
              className="h-1.5" 
              indicatorClassName="bg-cyan-500"
            />
          </>
        )}
      </div>
      
      {showControls && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between">
          {isActive ? (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDeactivate?.();
              }}
              className="w-full text-xs h-8"
            >
              Deactivate
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onActivate?.();
              }}
              className="w-full text-xs h-8"
            >
              Activate
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default PartyMemberCard;