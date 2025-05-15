import { Faction } from '../types';

export interface FactionInfo {
  id: Faction;
  name: string;
  description: string;
  allies: Faction[];
  enemies: Faction[];
  neutrals: Faction[];
  leaderTitle: string;
  homeBase: string;
  specialization: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface ReputationLevel {
  level: number;
  title: string;
  description: string;
  perks: string[];
  requiredReputation: number;
}

export const factionData: Record<Faction, FactionInfo> = {
  [Faction.Alliance]: {
    id: Faction.Alliance,
    name: 'Galactic Alliance',
    description: 'The largest recognized governing body in the inhabited galaxy, focused on security, stability, and interspecies cooperation.',
    allies: [Faction.Settlers],
    enemies: [Faction.Syndicate, Faction.VoidEntity],
    neutrals: [Faction.Mystics, Faction.Independent],
    leaderTitle: 'High Chancellor',
    homeBase: 'New Terra Prime',
    specialization: 'Governance, Security, Research',
    colors: {
      primary: '#3366cc',
      secondary: '#99ccff'
    }
  },
  [Faction.Syndicate]: {
    id: Faction.Syndicate,
    name: 'Crimson Syndicate',
    description: 'A powerful shadow organization controlling much of the galactic black market, smuggling operations, and illegal technology.',
    allies: [Faction.Independent],
    enemies: [Faction.Alliance, Faction.Settlers],
    neutrals: [Faction.Mystics, Faction.VoidEntity],
    leaderTitle: 'Underboss',
    homeBase: 'Unknown (Rumored to be the Adaris asteroid belt)',
    specialization: 'Black Markets, Smuggling, Information Brokering',
    colors: {
      primary: '#cc3333',
      secondary: '#ff9999'
    }
  },
  [Faction.Settlers]: {
    id: Faction.Settlers,
    name: 'Frontier Settlers Coalition',
    description: 'A loose confederation of outer rim colonies and homesteads, valuing freedom, self-sufficiency, and minimal governance.',
    allies: [Faction.Alliance, Faction.Independent],
    enemies: [Faction.Syndicate, Faction.VoidEntity],
    neutrals: [Faction.Mystics],
    leaderTitle: 'Colony Representative',
    homeBase: 'Distributed across frontier worlds',
    specialization: 'Agriculture, Resource Extraction, Self-Governance',
    colors: {
      primary: '#336633',
      secondary: '#99cc99'
    }
  },
  [Faction.Mystics]: {
    id: Faction.Mystics,
    name: 'Order of the Cosmic Veil',
    description: 'An ancient order dedicated to understanding and harnessing the psychic energies that permeate the universe.',
    allies: [],
    enemies: [Faction.VoidEntity],
    neutrals: [Faction.Alliance, Faction.Syndicate, Faction.Settlers, Faction.Independent],
    leaderTitle: 'High Oracle',
    homeBase: 'The Sanctuary (location changes)',
    specialization: 'Psychic Abilities, Ancient Knowledge, Cosmic Phenomena',
    colors: {
      primary: '#9933cc',
      secondary: '#cc99ff'
    }
  },
  [Faction.Independent]: {
    id: Faction.Independent,
    name: 'Free Traders Association',
    description: 'A network of independent merchants, captains, and entrepreneurs operating throughout the galaxy with minimal allegiance.',
    allies: [Faction.Syndicate, Faction.Settlers],
    enemies: [],
    neutrals: [Faction.Alliance, Faction.Mystics, Faction.VoidEntity],
    leaderTitle: 'None (Informal elected council)',
    homeBase: 'Various trade hubs and neutral stations',
    specialization: 'Commerce, Transport, Information Exchange',
    colors: {
      primary: '#cc9933',
      secondary: '#ffcc99'
    }
  },
  [Faction.VoidEntity]: {
    id: Faction.VoidEntity,
    name: 'The Void Collective',
    description: 'Mysterious entities from the depths of space with unknown motivations and abilities beyond conventional understanding.',
    allies: [],
    enemies: [Faction.Alliance, Faction.Settlers, Faction.Mystics],
    neutrals: [Faction.Syndicate, Faction.Independent],
    leaderTitle: 'Unknown',
    homeBase: 'Unknown (believed to be beyond the Outer Rim)',
    specialization: 'Unknown Technology, Anomalous Phenomena, Infiltration',
    colors: {
      primary: '#333333',
      secondary: '#9966cc'
    }
  }
};

export const reputationLevels: ReputationLevel[] = [
  {
    level: -3,
    title: 'Nemesis',
    description: 'You are considered a dangerous enemy to be eliminated on sight.',
    perks: [
      'Hostile patrols will hunt you',
      'All faction-controlled areas are off-limits',
      'Bounty hunters may target you'
    ],
    requiredReputation: -75
  },
  {
    level: -2,
    title: 'Hostile',
    description: 'Your actions have made you a clear threat to faction interests.',
    perks: [
      'Attacked on sight in faction territories',
      'No access to faction services',
      'Higher prices from affiliated merchants'
    ],
    requiredReputation: -50
  },
  {
    level: -1,
    title: 'Unfavorable',
    description: 'You are viewed with suspicion and distrust.',
    perks: [
      'Limited access to faction territories',
      'Higher prices for goods and services',
      'No special missions or opportunities'
    ],
    requiredReputation: -25
  },
  {
    level: 0,
    title: 'Neutral',
    description: 'You are neither friend nor foe to this faction.',
    perks: [
      'Standard access to public areas',
      'Normal merchant prices',
      'No special benefits or penalties'
    ],
    requiredReputation: -10
  },
  {
    level: 1,
    title: 'Favorable',
    description: 'You are seen as a potential ally.',
    perks: [
      'Welcome in most faction territories',
      'Slightly better prices',
      'Access to basic faction missions'
    ],
    requiredReputation: 10
  },
  {
    level: 2,
    title: 'Respected',
    description: 'Your contributions to the faction are recognized and valued.',
    perks: [
      'Access to restricted areas',
      'Better prices and special items',
      'More lucrative mission opportunities'
    ],
    requiredReputation: 25
  },
  {
    level: 3,
    title: 'Ally',
    description: 'You are considered a trusted partner of the faction.',
    perks: [
      'Full access to faction territories',
      'Best prices and unique items',
      'High-priority missions and faction support'
    ],
    requiredReputation: 50
  },
  {
    level: 4,
    title: 'Hero',
    description: 'You are revered as a hero and champion of the faction.',
    perks: [
      'Celebrated throughout faction territory',
      'Access to faction leadership',
      'Special equipment and resources',
      'Faction members may come to your aid'
    ],
    requiredReputation: 75
  }
];

// Helper function to get reputation level title
export function getReputationTitle(reputation: number): string {
  const level = reputationLevels.find(
    level => reputation >= level.requiredReputation
  );
  
  return level ? level.title : 'Unknown';
}

// Helper function to get reputation color
export function getReputationColor(reputation: number): string {
  if (reputation >= 75) return '#66cc66'; // Hero
  if (reputation >= 50) return '#66aa66'; // Ally
  if (reputation >= 25) return '#aaffaa'; // Respected
  if (reputation >= 10) return '#ccffcc'; // Favorable
  if (reputation >= -10) return '#cccccc'; // Neutral
  if (reputation >= -25) return '#ffcccc'; // Unfavorable
  if (reputation >= -50) return '#ffaaaa'; // Hostile
  return '#ff6666'; // Nemesis
}

export default factionData;