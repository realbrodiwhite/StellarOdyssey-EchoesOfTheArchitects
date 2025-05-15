import { Location, LocationType } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Define exploration point types
export enum ExplorationPointType {
  AsteroidField = 'Asteroid Field',
  DebrisCluster = 'Debris Cluster',
  VoidRift = 'Void Rift',
  AncientRuins = 'Ancient Ruins',
  NebulaCloud = 'Nebula Cloud',
  AbandonedStation = 'Abandoned Station',
  SignalSource = 'Signal Source',
  StellarAnomaly = 'Stellar Anomaly',
  DerelictVessel = 'Derelict Vessel',
  ResourceDeposit = 'Resource Deposit'
}

// Define environmental hazards
export enum EnvironmentalHazard {
  RadiationBurst = 'Radiation Burst',
  GravityDistortion = 'Gravity Distortion',
  SpacetimeTear = 'Spacetime Tear',
  CosmicStorm = 'Cosmic Storm',
  ExtremePressure = 'Extreme Pressure',
  VoidCorruption = 'Void Corruption',
  ThermalFluctuation = 'Thermal Fluctuation'
}

interface ProcGenOptions {
  baseRegions: string[];
  baseSeed?: number;
  densityFactor?: number; // 0.0-1.0: controls how many exploration points generate
  generateConnections?: boolean;
  maxConnectionDistance?: number;
  dangerVariance?: number; // how much danger level can vary
}

const defaultOptions: ProcGenOptions = {
  baseRegions: [],
  baseSeed: Date.now(),
  densityFactor: 0.5,
  generateConnections: true,
  maxConnectionDistance: 100,
  dangerVariance: 3
};

// Pseudorandom number generator with seed
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Generate a pseudorandom number between 0 and 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Generate an integer within a range
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Choose a random item from an array
  choose<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  // Randomly returns true with the given probability (0-1)
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

export function generateExplorationPoints(
  existingLocations: Location[],
  options: Partial<ProcGenOptions> = {}
): Location[] {
  // Merge options with defaults
  const settings: ProcGenOptions = { ...defaultOptions, ...options };
  
  // Initialize random with seed
  const random = new SeededRandom(settings.baseSeed || Date.now());
  
  // Extract unique regions from existing locations
  const existingRegions = settings.baseRegions.length > 0 
    ? settings.baseRegions 
    : Array.from(new Set(existingLocations.map(loc => loc.region || "Unknown")));
  
  // Generate unique names for exploration points
  const pointNames = generatePointNames(random);
  
  const explorationPoints: Location[] = [];

  // Decide how many exploration points to create based on density
  const basePointCount = Math.ceil(existingLocations.length * 0.5); // Base count is 50% of existing locations
  const pointCount = Math.max(
    3, // Always generate at least 3 points
    Math.ceil(basePointCount * settings.densityFactor!)
  );
  
  for (let i = 0; i < pointCount; i++) {
    // Select a region for this point
    const region = random.choose(existingRegions);
    
    // Select a random point type
    const explorationType = random.choose(Object.values(ExplorationPointType));
    
    // Determine location type based on exploration type
    let locationType = LocationType.Space;
    if (explorationType === ExplorationPointType.AncientRuins) {
      locationType = LocationType.Ruins;
    } else if (explorationType === ExplorationPointType.AbandonedStation) {
      locationType = LocationType.Station;
    } else if (explorationType === ExplorationPointType.DerelictVessel) {
      locationType = LocationType.Derelict;
    }
    
    // Generate unique ID with a prefix to distinguish it
    const id = `exp_${uuidv4().substring(0, 8)}`;
    
    // Create name based on type and randomly selected name component
    const name = `${random.choose(pointNames)} ${explorationType}`;
    
    // Generate description based on exploration type
    const description = generateDescription(explorationType, random);
    
    // Determine danger level (1-10)
    const baseDanger = estimateBaseDanger(explorationType);
    const dangerLevel = Math.max(1, Math.min(10, 
      baseDanger + random.nextInt(-settings.dangerVariance!, settings.dangerVariance!)
    ));
    
    // Determine if there are environmental hazards
    const hasEnvironmentalHazards = random.chance(dangerLevel / 15);
    
    // Create a new exploration point
    const newPoint: Location = {
      id,
      name,
      type: locationType,
      description,
      encounters: {
        // Generate random enemies/puzzles based on danger level
        enemies: random.chance(0.3 + (dangerLevel / 20)) 
          ? Array(random.nextInt(1, Math.ceil(dangerLevel / 3)))
              .fill(0).map(() => `procedural_enemy_${random.nextInt(1, 10)}`) 
          : undefined,
        puzzles: random.chance(0.4) 
          ? Array(random.nextInt(1, 2))
              .fill(0).map(() => `procedural_puzzle_${random.nextInt(1, 5)}`) 
          : undefined
      },
      connections: [], // We'll fill these later
      region,
      dangerLevel,
      discovered: false // Start undiscovered
    };
    
    // Add environmental hazards if applicable
    if (hasEnvironmentalHazards) {
      const hazardType = random.choose(Object.values(EnvironmentalHazard));
      const severity = random.nextInt(1, Math.min(5, Math.ceil(dangerLevel / 2)));
      
      newPoint.environmentEffects = [
        {
          type: mapEnvironmentalHazardToEffect(hazardType),
          severity,
          effect: `${hazardType} - ${getHazardDescription(hazardType, severity)}`
        }
      ];
    }
    
    // Randomly add items
    if (random.chance(0.4)) {
      newPoint.items = [`exploration_item_${random.nextInt(1, 15)}`];
    }
    
    explorationPoints.push(newPoint);
  }
  
  // Generate connections between points and existing locations
  if (settings.generateConnections) {
    generateConnections(explorationPoints, existingLocations, random, settings.maxConnectionDistance!);
  }
  
  return explorationPoints;
}

// Helper functions

// Generate connections between exploration points and existing locations
function generateConnections(
  explorationPoints: Location[],
  existingLocations: Location[],
  random: SeededRandom,
  maxDistance: number
): void {
  const allLocations = [...explorationPoints, ...existingLocations];
  
  // For each exploration point, find potential connections
  explorationPoints.forEach(point => {
    // Always connect to at least one existing location if possible
    const existingConnections = findNearestLocations(
      point, 
      existingLocations, 
      random.nextInt(1, 2), // Connect to 1-2 existing locations
      maxDistance,
      random
    );
    
    // Optionally connect to other exploration points (30% chance)
    if (random.chance(0.3)) {
      const explorationConnections = findNearestLocations(
        point,
        explorationPoints.filter(p => p.id !== point.id),
        random.nextInt(0, 2), // Connect to 0-2 other exploration points
        maxDistance,
        random
      );
      
      existingConnections.push(...explorationConnections);
    }
    
    // Update the point's connections
    point.connections = existingConnections.map(loc => loc.id);
    
    // Also update the connected locations to include this point
    existingConnections.forEach(connectedLoc => {
      const locToUpdate = allLocations.find(l => l.id === connectedLoc.id);
      if (locToUpdate && !locToUpdate.connections.includes(point.id)) {
        locToUpdate.connections.push(point.id);
      }
    });
  });
}

// Find the nearest locations to a given point
function findNearestLocations(
  point: Location,
  candidateLocations: Location[],
  count: number,
  maxDistance: number,
  random: SeededRandom
): Location[] {
  // We don't have actual coordinates, so we'll use the hash of the IDs
  // to create a pseudo-distance for demonstration purposes
  const locationDistances = candidateLocations.map(loc => {
    // Create a pseudo-distance based on ID hash
    const distance = Math.abs(hashString(point.id) - hashString(loc.id)) % maxDistance;
    return { location: loc, distance };
  });
  
  // Sort by distance
  locationDistances.sort((a, b) => a.distance - b.distance);
  
  // Take the closest ones, with a bit of randomness
  return locationDistances
    .slice(0, Math.min(count + 2, locationDistances.length))
    .filter(() => random.chance(0.8)) // 80% chance to include each of the closest locations
    .slice(0, count)
    .map(item => item.location);
}

// Simple hash function for strings
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate interesting names for exploration points
function generatePointNames(random: SeededRandom): string[] {
  const prefixes = [
    "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Theta", "Kappa",
    "Omicron", "Sigma", "Tau", "Omega", "Proxima", "Nova", "Stellar", "Cosmic",
    "Astral", "Celestial", "Void", "Echo", "Quantum", "Nebula", "Pulsar", "Quasar",
    "Helios", "Chronos", "Eternia", "Vega", "Arcturus", "Andromeda", "Orion", "Phoenix",
    "Hyperion", "Prometheus", "Atlas", "Enigma", "Zenith", "Nexus", "Oblivion", "Infinity"
  ];
  
  const descriptors = [
    "Forgotten", "Ancient", "Lost", "Hidden", "Mysterious", "Anomalous", "Drifting",
    "Shattered", "Fractured", "Glimmering", "Pulsing", "Unstable", "Radiant", "Shadowed",
    "Distorted", "Resonating", "Whispering", "Echoing", "Frozen", "Burning", "Tranquil",
    "Tumultuous", "Haunted", "Remnant", "Primal", "Twilight", "Dawning", "Crimson",
    "Azure", "Emerald", "Sapphire", "Obsidian", "Crystal", "Onyx", "Ivory"
  ];
  
  // Generate combined names for more variety
  const names: string[] = [];
  
  // Generate some full descriptive names
  for (let i = 0; i < 15; i++) {
    names.push(`${random.choose(descriptors)} ${random.choose(prefixes)}`);
  }
  
  // Add some simple prefix names
  prefixes.forEach(prefix => names.push(prefix));
  
  // Add some simple descriptor names
  descriptors.forEach(desc => names.push(desc));
  
  return names;
}

// Determine base danger level based on exploration type
function estimateBaseDanger(explorationType: ExplorationPointType): number {
  switch (explorationType) {
    case ExplorationPointType.AsteroidField:
      return 3;
    case ExplorationPointType.DebrisCluster:
      return 4;
    case ExplorationPointType.VoidRift:
      return 8;
    case ExplorationPointType.AncientRuins:
      return 6;
    case ExplorationPointType.NebulaCloud:
      return 3;
    case ExplorationPointType.AbandonedStation:
      return 5;
    case ExplorationPointType.SignalSource:
      return 4;
    case ExplorationPointType.StellarAnomaly:
      return 7;
    case ExplorationPointType.DerelictVessel:
      return 6;
    case ExplorationPointType.ResourceDeposit:
      return 2;
    default:
      return 5;
  }
}

// Generate description based on exploration type
function generateDescription(explorationType: ExplorationPointType, random: SeededRandom): string {
  switch (explorationType) {
    case ExplorationPointType.AsteroidField:
      return random.choose([
        "A dense cluster of asteroids drifting through space. Scans suggest valuable mineral deposits.",
        "Countless rock formations floating in a complex orbital pattern. Navigation will be challenging.",
        "An expansive field of asteroids, some showing traces of advanced mineral composition."
      ]);
    case ExplorationPointType.DebrisCluster:
      return random.choose([
        "The scattered remains of ships and structures. This area may contain salvageable technology.",
        "A massive collection of wreckage from an unknown conflict. Proceed with caution.",
        "Floating debris of technological origin. Signs of a recent incident or battle."
      ]);
    case ExplorationPointType.VoidRift:
      return random.choose([
        "A tear in the fabric of space-time. Sensors detect highly unusual energy patterns.",
        "A spatial anomaly emitting unknown radiation. Standard physics may not apply here.",
        "A mysterious rift with gravity fluctuations and temporal distortions. Extremely dangerous."
      ]);
    case ExplorationPointType.AncientRuins:
      return random.choose([
        "The remains of an ancient civilization on a barren planetoid. Origin unknown.",
        "Structures of apparent artificial origin dating back millennia. Technology may still be active.",
        "Monolithic ruins showing signs of advanced engineering beyond current understanding."
      ]);
    case ExplorationPointType.NebulaCloud:
      return random.choose([
        "A colorful cloud of interstellar gas and dust. Sensors detect unusual particle activity.",
        "A nebula with dense pockets of exotic matter. Communication might be disrupted inside.",
        "Swirling gases forming complex patterns of light and energy. Visually stunning but potentially hazardous."
      ]);
    case ExplorationPointType.AbandonedStation:
      return random.choose([
        "A derelict space station showing no signs of recent activity. Life support systems offline.",
        "Once a thriving outpost, now eerily empty. Internal power sources still functioning.",
        "A station of unknown origin, abandoned but intact. Signs of hasty evacuation visible."
      ]);
    case ExplorationPointType.SignalSource:
      return random.choose([
        "A repeating transmission of unknown origin. Pattern suggests artificial creation.",
        "Intermittent signals of non-standard frequency. Could be a distress call or automated beacon.",
        "Encrypted communication bursts detected from this location. Source concealed."
      ]);
    case ExplorationPointType.StellarAnomaly:
      return random.choose([
        "A star exhibiting impossible physical properties. Gravitational readings are off the charts.",
        "A stellar body behaving contrary to known physics. Safe observation distance recommended.",
        "A unique astronomical phenomenon never before documented. Scientific opportunity and extreme danger."
      ]);
    case ExplorationPointType.DerelictVessel:
      return random.choose([
        "An abandoned spacecraft drifting through space. Origins and fate of crew unknown.",
        "A ghost ship with systems still partially operational. Black box may provide answers.",
        "A vessel of unusual design showing battle damage. Valuable technology may be salvageable."
      ]);
    case ExplorationPointType.ResourceDeposit:
      return random.choose([
        "Scans indicate a rich concentration of rare minerals and elements in this region.",
        "An untapped source of valuable resources. Mining operations could be highly profitable.",
        "Unusually pure deposits of strategic materials. Worth the journey to extract."
      ]);
    default:
      return "An uncharted region of space with unknown properties.";
  }
}

// Map environmental hazard to location effect type
function mapEnvironmentalHazardToEffect(hazard: EnvironmentalHazard): 'radiation' | 'lowGravity' | 'highGravity' | 'extremeTemperature' | 'toxicAtmosphere' | 'voidEnergy' {
  switch (hazard) {
    case EnvironmentalHazard.RadiationBurst:
      return 'radiation';
    case EnvironmentalHazard.GravityDistortion:
      return Math.random() > 0.5 ? 'lowGravity' : 'highGravity';
    case EnvironmentalHazard.SpacetimeTear:
      return 'voidEnergy';
    case EnvironmentalHazard.CosmicStorm:
      return 'radiation';
    case EnvironmentalHazard.ExtremePressure:
      return 'highGravity';
    case EnvironmentalHazard.VoidCorruption:
      return 'voidEnergy';
    case EnvironmentalHazard.ThermalFluctuation:
      return 'extremeTemperature';
    default:
      return 'radiation';
  }
}

// Generate description for environmental hazards
function getHazardDescription(hazard: EnvironmentalHazard, severity: number): string {
  const intensityDesc = severity <= 2 ? "Minor" : severity <= 4 ? "Significant" : "Extreme";
  
  switch (hazard) {
    case EnvironmentalHazard.RadiationBurst:
      return `${intensityDesc} radiation levels detected. Shielding recommended.`;
    case EnvironmentalHazard.GravityDistortion:
      return `${intensityDesc} gravitational anomalies affecting navigation and movement.`;
    case EnvironmentalHazard.SpacetimeTear:
      return `${intensityDesc} distortions in the fabric of reality. Unpredictable effects possible.`;
    case EnvironmentalHazard.CosmicStorm:
      return `${intensityDesc} charged particle storm affecting systems and life forms.`;
    case EnvironmentalHazard.ExtremePressure:
      return `${intensityDesc} pressure differentials threatening hull integrity.`;
    case EnvironmentalHazard.VoidCorruption:
      return `${intensityDesc} void energy corrupting matter and technology.`;
    case EnvironmentalHazard.ThermalFluctuation:
      return `${intensityDesc} temperature fluctuations exceeding safe operational parameters.`;
    default:
      return `${intensityDesc} environmental hazard detected.`;
  }
}