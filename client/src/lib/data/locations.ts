import { Location, LocationType, Faction } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const gameLocations: Location[] = [
  // Starting point
  {
    id: 'ship',
    name: 'Your Ship',
    type: LocationType.Ship,
    description: 'Your trusty starship, a modified light freighter with upgraded systems. It serves as both transportation and home base for your adventures.',
    encounters: {
      puzzles: []
    },
    connections: ['frontier_outpost'],
    discovered: true
  },
  
  // Prologue locations
  {
    id: 'proxima_derelict',
    name: 'Derelict Alliance Vessel',
    type: LocationType.Derelict,
    description: 'A damaged Alliance research vessel drifting silently in space. Life support systems are failing, and there are signs of a struggle throughout the ship.',
    encounters: {
      enemies: ['scavenger_drone'],
      puzzles: ['power_restoration']
    },
    items: ['encrypted_data_core', 'emergency_supplies', 'alliance_insignia'],
    connections: ['ship', 'frontier_outpost'],
    region: 'Proxima System',
    controlledBy: Faction.Alliance,
    dangerLevel: 4,
    ambientSound: 'ambient_derelict'
  },
  
  // Main locations
  {
    id: 'frontier_outpost',
    name: 'Frontier Outpost',
    type: LocationType.Station,
    description: 'A bustling space station at the edge of Alliance space. It serves as a trade hub and security checkpoint for those traveling between settled space and the frontier.',
    encounters: {
      npcs: ['station_commander', 'merchant', 'bounty_hunter']
    },
    connections: ['ship', 'mining_colony', 'syndicate_hideout'],
    region: 'Border Territories',
    controlledBy: Faction.Alliance,
    discovered: true
  },
  {
    id: 'mining_colony',
    name: 'Helios Mining Colony',
    type: LocationType.Settlement,
    description: 'A rugged industrial outpost established on a mineral-rich asteroid. The colony provides essential resources for Alliance worlds but faces harsh working conditions.',
    encounters: {
      enemies: ['mining_drone', 'security_robot'],
      npcs: ['colony_foreman', 'union_representative']
    },
    connections: ['frontier_outpost', 'ancient_ruins'],
    region: 'Helios Belt',
    controlledBy: Faction.Settlers,
    dangerLevel: 3
  },
  {
    id: 'syndicate_hideout',
    name: 'Shadow Haven',
    type: LocationType.Station,
    description: 'A hidden space station serving as a base for Syndicate operations. Everything from illegal goods to restricted technology can be found here—for the right price.',
    encounters: {
      enemies: ['syndicate_enforcer'],
      npcs: ['black_market_dealer', 'information_broker']
    },
    connections: ['frontier_outpost'],
    region: 'Adaris Cloud',
    controlledBy: Faction.Syndicate,
    dangerLevel: 7,
    unlockRequirement: {
      reputation: { faction: Faction.Syndicate, level: -25 }
    }
  },
  
  // Mystery/Artifact locations
  {
    id: 'ancient_ruins',
    name: 'Ancient Ruins',
    type: LocationType.Ruins,
    description: 'The remnants of an ancient civilization discovered on a remote planet. Strange energy signatures emanate from deep within the structure.',
    encounters: {
      enemies: ['guardian_construct', 'corrupted_ai'],
      puzzles: ['sequence_lock', 'energy_flow']
    },
    connections: ['mining_colony', 'mystic_sanctuary'],
    region: 'Uncharted Space',
    dangerLevel: 6,
    environmentEffects: [
      {
        type: 'voidEnergy',
        severity: 2,
        effect: 'Occasional energy surges that can interfere with equipment.'
      }
    ]
  },
  {
    id: 'mystic_sanctuary',
    name: 'Sanctuary of the Veil',
    type: LocationType.Settlement,
    description: 'A tranquil monastery where members of the Order of the Cosmic Veil study the mysteries of the universe. Visitors are rare but welcomed if they come in peace.',
    encounters: {
      npcs: ['mystic_elder', 'acolyte']
    },
    connections: ['ancient_ruins'],
    region: 'Nebula Core',
    controlledBy: Faction.Mystics,
    dangerLevel: 2
  },
  
  // Alliance path
  {
    id: 'research_station',
    name: 'Horizon Research Station',
    type: LocationType.Station,
    description: 'A state-of-the-art Alliance research facility where cutting-edge technology and scientific discoveries are studied under tight security.',
    encounters: {
      npcs: ['chief_scientist', 'security_officer']
    },
    connections: ['frontier_outpost', 'alliance_headquarters'],
    region: 'Alliance Space',
    controlledBy: Faction.Alliance,
    dangerLevel: 1,
    unlockRequirement: {
      reputation: { faction: Faction.Alliance, level: 1 }
    }
  },
  {
    id: 'alliance_headquarters',
    name: 'Alliance Headquarters',
    type: LocationType.Station,
    description: 'The administrative and military center of the Galactic Alliance. Only those with proper clearance and a good standing with the Alliance can access this location.',
    encounters: {
      npcs: ['alliance_commander', 'diplomat']
    },
    connections: ['research_station'],
    region: 'Alliance Core',
    controlledBy: Faction.Alliance,
    dangerLevel: 1,
    unlockRequirement: {
      reputation: { faction: Faction.Alliance, level: 2 }
    }
  },
  
  // Void Entity path
  {
    id: 'void_anomaly',
    name: 'Void Anomaly',
    type: LocationType.Anomaly,
    description: 'A distortion in space where the barrier between dimensions is thin. Strange phenomena occur here, and entities not of this universe have been reported.',
    encounters: {
      enemies: ['void_manifestation', 'reality_warper'],
      puzzles: ['reality_stabilization']
    },
    connections: ['ancient_ruins'],
    region: 'Deep Space',
    controlledBy: Faction.VoidEntity,
    dangerLevel: 9,
    environmentEffects: [
      {
        type: 'voidEnergy',
        severity: 4,
        effect: 'Reality distortions that can cause hallucinations and equipment malfunction.'
      }
    ],
    unlockRequirement: {
      flag: 'discoveredArtifact'
    }
  }
];

// Function to generate a unique ID for a location
export function createLocationId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// Export location lookup by ID
export const locationLookup: Record<string, Location> = gameLocations.reduce(
  (acc, location) => {
    acc[location.id] = location;
    return acc;
  },
  {} as Record<string, Location>
);

export default gameLocations;