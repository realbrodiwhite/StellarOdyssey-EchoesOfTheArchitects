import { Location, LocationType, Faction, Enemy, Puzzle, Item } from "@/lib/types";
import { planetTypes } from "@/lib/data/locations";

/**
 * Procedural generation utility for creating dynamic game content
 * including planets, star systems, encounters, and more.
 */

// Seeded random number generator for consistent results with the same seed
class SeededRandom {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed || Math.floor(Math.random() * 1000000);
  }

  // Get the current seed
  getSeed(): number {
    return this.seed;
  }

  // Set a new seed
  setSeed(seed: number): void {
    this.seed = seed;
  }

  // Generate a random number between 0 and 1 (inclusive of 0, exclusive of 1)
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Generate a random integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Choose a random item from an array
  choose<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  // Shuffle an array randomly
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

export class ProceduralGenerator {
  private random: SeededRandom;
  private usedNames: Set<string>;

  // Planet name components for generating unique planet names
  private planetNamePrefixes: string[] = [
    "Nova", "Stella", "Astro", "Orb", "Lux", "Cosmo", "Terra", "Neo", 
    "Xeno", "Umbra", "Prime", "Void", "Sol", "Exo", "Gaia", "Echo",
    "Halo", "Nexus", "Omega", "Alpha", "Vega", "Ceti", "Dawn", "Dusk"
  ];

  private planetNameSuffixes: string[] = [
    "world", "sphere", "globe", "planet", "terra", "cluster", "haven", 
    "home", "scape", "stead", "port", "shore", "realm", "domain", "land",
    "orb", "rock", "giant", "system", "sector", "zone", "region", "quadrant"
  ];

  // Star types with color and temperature characteristics
  private starTypes: Array<{type: string, color: string, temp: string, lifeProb: number}> = [
    {type: "O", color: "#9bb0ff", temp: "Extremely hot", lifeProb: 0.01},
    {type: "B", color: "#aabfff", temp: "Very hot", lifeProb: 0.05},
    {type: "A", color: "#cad7ff", temp: "Hot", lifeProb: 0.1},
    {type: "F", color: "#f8f7ff", temp: "Warm", lifeProb: 0.2},
    {type: "G", color: "#fff4ea", temp: "Moderate", lifeProb: 0.4}, // Sun-like
    {type: "K", color: "#ffd2a1", temp: "Cool", lifeProb: 0.3},
    {type: "M", color: "#ffcc6f", temp: "Cold", lifeProb: 0.15},
    {type: "Red Dwarf", color: "#ff6060", temp: "Variable", lifeProb: 0.1},
    {type: "White Dwarf", color: "#ffffff", temp: "Cooling", lifeProb: 0.05},
    {type: "Neutron", color: "#c0ffff", temp: "Extreme radiation", lifeProb: 0.001},
    {type: "Black Hole", color: "#000000", temp: "Event horizon", lifeProb: 0}
  ];

  // Encounter probability weights for different location types
  private encounterProbabilities: Record<LocationType, {
    enemy: number,
    puzzle: number,
    item: number,
    empty: number,
  }> = {
    [LocationType.Planet]: { enemy: 0.3, puzzle: 0.3, item: 0.3, empty: 0.1 },
    [LocationType.Space]: { enemy: 0.5, puzzle: 0.2, item: 0.2, empty: 0.1 },
    [LocationType.Station]: { enemy: 0.1, puzzle: 0.4, item: 0.4, empty: 0.1 },
    [LocationType.Derelict]: { enemy: 0.5, puzzle: 0.3, item: 0.2, empty: 0 },
    [LocationType.Anomaly]: { enemy: 0.2, puzzle: 0.6, item: 0.2, empty: 0 },
    [LocationType.Ruins]: { enemy: 0.4, puzzle: 0.4, item: 0.2, empty: 0 },
    [LocationType.Settlement]: { enemy: 0.2, puzzle: 0.3, item: 0.4, empty: 0.1 },
    [LocationType.Ship]: { enemy: 0.2, puzzle: 0.3, item: 0.3, empty: 0.2 },
  };

  constructor(seed?: number) {
    this.random = new SeededRandom(seed);
    this.usedNames = new Set();
  }

  // Get the current seed
  getSeed(): number {
    return this.random.getSeed();
  }

  // Set a new seed
  setSeed(seed: number): void {
    this.random.setSeed(seed);
    this.usedNames.clear();
  }

  // Generate a unique name for a planet
  generatePlanetName(): string {
    let name = "";
    // Try to generate a unique name
    let attempts = 0;
    do {
      const prefix = this.random.choose(this.planetNamePrefixes);
      const suffix = this.random.choose(this.planetNameSuffixes);
      name = `${prefix} ${suffix}`;
      attempts++;
      
      if (attempts > 100) {
        // Add a number if we can't find a unique name after many attempts
        name = `${name} ${this.random.nextInt(1, 999)}`;
        break;
      }
    } while (this.usedNames.has(name));
    
    this.usedNames.add(name);
    return name;
  }

  // Generate a random planet
  generatePlanet(regionName?: string): Location {
    // Pick a planet type and variant
    const planetType = this.random.choose(planetTypes);
    const variant = this.random.choose(planetType.variants);
    
    // Determine if it's a stable system (affects life probability)
    const isStableSystem = this.random.next() < 0.7;
    
    // Choose a star type
    const starType = this.random.choose(this.starTypes);
    
    // Base probability of life modified by star type
    const baseProbOfLife = starType.lifeProb * (isStableSystem ? 1.5 : 0.5);
    
    // Adjust for planet type
    let lifeProbability = baseProbOfLife;
    if (planetType.type === "Terrestrial" && variant === "Earthlike") {
      lifeProbability *= 2;
    } else if (planetType.type === "Gas Giant") {
      lifeProbability *= 0.1;
    } else if (planetType.type === "Exotic") {
      lifeProbability *= 0.5;
    }
    
    // Clamp to 0-1 range
    lifeProbability = Math.max(0, Math.min(1, lifeProbability));
    
    // Determine controlling faction (or none)
    let controllingFaction: Faction | undefined;
    if (this.random.next() < 0.7) { // 70% chance of faction control
      const factions = [
        Faction.Alliance, 
        Faction.Syndicate, 
        Faction.Settlers, 
        Faction.Mystics,
        Faction.Independent
      ];
      
      // Void Entities only control planets with very low probability
      if (this.random.next() < 0.05) {
        controllingFaction = Faction.VoidEntity;
      } else {
        controllingFaction = this.random.choose(factions);
      }
    }
    
    // Generate random danger level (1-10)
    const dangerLevel = (() => {
      // Alliance controlled planets tend to be safer
      if (controllingFaction === Faction.Alliance) {
        return this.random.nextInt(1, 5);
      }
      // Void Entity planets are more dangerous
      else if (controllingFaction === Faction.VoidEntity) {
        return this.random.nextInt(7, 10);
      }
      // Other factions have moderate danger
      else if (controllingFaction) {
        return this.random.nextInt(3, 7);
      }
      // Uncontrolled planets have variable danger
      else {
        return this.random.nextInt(2, 10);
      }
    })();
    
    // Define potential environmental effects
    const possibleEffects = [
      { type: "radiation", maxSeverity: 5 },
      { type: "lowGravity", maxSeverity: 3 },
      { type: "highGravity", maxSeverity: 3 },
      { type: "extremeTemperature", maxSeverity: 5 },
      { type: "toxicAtmosphere", maxSeverity: 4 },
      { type: "voidEnergy", maxSeverity: 5 }
    ];
    
    // Determine environmental effects (if any)
    const environmentEffects = [];
    const effectCount = this.random.nextInt(0, 2); // 0-2 effects
    
    for (let i = 0; i < effectCount; i++) {
      const effect = this.random.choose(possibleEffects);
      const severity = this.random.nextInt(1, effect.maxSeverity);
      
      let effectDescription = "";
      switch (effect.type) {
        case "radiation":
          effectDescription = "Dangerous radiation affects unshielded equipment and living organisms.";
          break;
        case "lowGravity":
          effectDescription = "Reduced gravity affects movement and physical tasks.";
          break;
        case "highGravity":
          effectDescription = "Increased gravity strains equipment and limits mobility.";
          break;
        case "extremeTemperature":
          effectDescription = "Extreme temperatures require specialized equipment to survive.";
          break;
        case "toxicAtmosphere":
          effectDescription = "Toxic atmospheric compounds damage respiratory systems.";
          break;
        case "voidEnergy":
          effectDescription = "Strange energy patterns disrupt technology and mental processes.";
          break;
      }
      
      environmentEffects.push({
        type: effect.type as any,
        severity,
        effect: effectDescription
      });
    }
    
    // Determine if the planet has special resources or attractions
    const hasSpecialResources = this.random.next() < 0.4; // 40% chance
    
    // Base description from planet type
    let description = planetType.descriptions[variant] || "A mysterious planet with unknown properties.";
    
    // Add information about controlling faction
    if (controllingFaction) {
      description += ` Controlled by the ${controllingFaction}.`;
    } else {
      description += " No known faction claims this planet.";
    }
    
    // Add information about special resources if applicable
    if (hasSpecialResources) {
      const resourceTypes = [
        "rare minerals", "ancient artifacts", "exotic compounds", 
        "valuable gases", "unique biological specimens", "advanced technology"
      ];
      const resource = this.random.choose(resourceTypes);
      description += ` Known for its deposits of ${resource}.`;
    }
    
    // Add information about life if applicable
    if (this.random.next() < lifeProbability) {
      const lifeTypes = [
        "primitive microbial", "abundant plant", "diverse aquatic", 
        "exotic insectoid", "primitive vertebrate", "advanced sentient"
      ];
      const lifeType = this.random.choose(lifeTypes);
      description += ` Scans detect ${lifeType} life forms.`;
    }
    
    // Generate a unique name using our algorithm
    const name = this.generatePlanetName();
    
    // Create a unique ID
    const id = name.toLowerCase().replace(/\s+/g, '_');
    
    // Generate random connections (will be filled in later)
    const connections: string[] = [];
    
    // Generate planet-specific encounters
    const enemies = this.generateEncounterIds('enemy', dangerLevel, 0, 3);
    const puzzles = this.generateEncounterIds('puzzle', dangerLevel, 0, 2);
    const npcs = this.generateEncounterIds('npc', dangerLevel, 0, 3);
    
    // Create the planet location
    const planet: Location = {
      id,
      name,
      type: LocationType.Planet,
      description,
      encounters: {
        enemies,
        puzzles,
        npcs
      },
      connections,
      region: regionName || "Unknown Region",
      controlledBy: controllingFaction,
      dangerLevel,
      environmentEffects: environmentEffects.length > 0 ? environmentEffects : undefined,
      discovered: false
    };
    
    return planet;
  }
  
  // Generate a star system with planets
  generateStarSystem(regionName: string, planetCount: number = 0): Location[] {
    // If planetCount is 0, generate a random number between 1-8
    if (planetCount === 0) {
      planetCount = this.random.nextInt(1, 8);
    }
    
    // Generate a system name
    const systemName = `${this.generatePlanetName()} System`;
    const systemId = systemName.toLowerCase().replace(/\s+/g, '_');
    
    // Choose a star type
    const starType = this.random.choose(this.starTypes);
    
    // System description
    let systemDescription = `A ${starType.temp.toLowerCase()} ${starType.type} star system with ${planetCount} planets`;
    if (planetCount === 1) {
      systemDescription = `A ${starType.temp.toLowerCase()} ${starType.type} star system with a single planet`;
    }
    
    // Create the planets
    const planets: Location[] = [];
    for (let i = 0; i < planetCount; i++) {
      planets.push(this.generatePlanet(regionName));
    }
    
    // Create the main system location
    const systemLocation: Location = {
      id: systemId,
      name: systemName,
      type: LocationType.Space,
      description: systemDescription,
      encounters: {
        enemies: this.generateEncounterIds('enemy', 3, 1, 3),
        puzzles: this.generateEncounterIds('puzzle', 3, 0, 2)
      },
      connections: planets.map(planet => planet.id),
      region: regionName,
      dangerLevel: this.random.nextInt(1, 7),
      discovered: false
    };
    
    // Update planet connections to include system
    planets.forEach(planet => {
      planet.connections.push(systemId);
    });
    
    // Return all locations
    return [systemLocation, ...planets];
  }
  
  // Generate random identifiers for encounters
  private generateEncounterIds(type: 'enemy' | 'puzzle' | 'npc', dangerLevel: number, min: number, max: number): string[] {
    const count = this.random.nextInt(min, max);
    const result: string[] = [];
    
    // Enemy type mappings based on danger level
    const enemyTypes = {
      low: ['scout', 'drone', 'pirate', 'smuggler', 'wildlife'],
      medium: ['soldier', 'mercenary', 'elite_guard', 'scavenger', 'predator'],
      high: ['elite', 'commander', 'void_entity', 'ancient_guardian', 'rogue_ai']
    };
    
    // Puzzle type mappings based on difficulty
    const puzzleTypes = {
      easy: ['basic_encryption', 'power_routing', 'maintenance', 'calibration'],
      medium: ['security_override', 'data_recovery', 'malfunction', 'system_repair'],
      hard: ['advanced_encryption', 'void_stabilization', 'ai_corruption', 'ancient_tech']
    };
    
    // NPC type mappings
    const npcTypes = {
      common: ['trader', 'settler', 'technician', 'crew_member', 'scientist'],
      uncommon: ['captain', 'smuggler', 'faction_agent', 'bounty_hunter', 'researcher'],
      rare: ['faction_leader', 'ancient_ai', 'void_touched', 'mystic_elder', 'rogue_scientist'] 
    };
    
    for (let i = 0; i < count; i++) {
      let id = '';
      
      if (type === 'enemy') {
        const tierKey = dangerLevel <= 3 ? 'low' : (dangerLevel <= 6 ? 'medium' : 'high');
        const enemyType = this.random.choose(enemyTypes[tierKey]);
        id = `${enemyType}_${this.random.nextInt(1, 999)}`;
      }
      else if (type === 'puzzle') {
        const tierKey = dangerLevel <= 3 ? 'easy' : (dangerLevel <= 6 ? 'medium' : 'hard');
        const puzzleType = this.random.choose(puzzleTypes[tierKey]);
        id = `${puzzleType}_${this.random.nextInt(1, 999)}`;
      }
      else if (type === 'npc') {
        // Determine rarity based on random chance
        const rarityRoll = this.random.next();
        const tierKey = rarityRoll < 0.6 ? 'common' : (rarityRoll < 0.9 ? 'uncommon' : 'rare');
        const npcType = this.random.choose(npcTypes[tierKey]);
        id = `${npcType}_${this.random.nextInt(1, 999)}`;
      }
      
      result.push(id);
    }
    
    return result;
  }
  
  // Generate an entire region with multiple star systems
  generateRegion(regionName: string, systemCount: number = 0): Location[] {
    // If systemCount is 0, generate a random number between 3-10
    if (systemCount === 0) {
      systemCount = this.random.nextInt(3, 10);
    }
    
    let allLocations: Location[] = [];
    
    // Generate individual star systems
    for (let i = 0; i < systemCount; i++) {
      const systemLocations = this.generateStarSystem(regionName);
      allLocations = [...allLocations, ...systemLocations];
    }
    
    // Connect some systems to each other for better navigation
    const systemLocations = allLocations.filter(loc => loc.type === LocationType.Space);
    
    // Create connections between systems (each system connects to 1-3 other systems)
    for (const system of systemLocations) {
      const otherSystems = systemLocations.filter(s => s.id !== system.id);
      const connectionCount = this.random.nextInt(1, Math.min(3, otherSystems.length));
      
      // Shuffle other systems and take the first 'connectionCount' items
      const shuffled = this.random.shuffle(otherSystems);
      const connectTo = shuffled.slice(0, connectionCount);
      
      // Add connections between systems
      for (const target of connectTo) {
        if (!system.connections.includes(target.id)) {
          system.connections.push(target.id);
        }
        if (!target.connections.includes(system.id)) {
          target.connections.push(system.id);
        }
      }
    }
    
    return allLocations;
  }
  
  // Generate a procedural enemy based on danger level
  generateEnemy(dangerLevel: number): Enemy {
    // Enemy types with associated characteristics
    const enemyTemplates = [
      { type: "Drone", health: 15, damage: 3, techLevel: "basic" },
      { type: "Pirate", health: 20, damage: 5, techLevel: "moderate" },
      { type: "Guard", health: 25, damage: 4, techLevel: "moderate" },
      { type: "Mercenary", health: 30, damage: 6, techLevel: "advanced" },
      { type: "Creature", health: 35, damage: 7, techLevel: "natural" },
      { type: "Elite", health: 40, damage: 8, techLevel: "advanced" },
      { type: "Commander", health: 50, damage: 7, techLevel: "high" },
      { type: "Void Entity", health: 60, damage: 10, techLevel: "alien" }
    ];
    
    // Select template based on danger level
    let templateIndex = Math.min(Math.floor(dangerLevel / 2), enemyTemplates.length - 1);
    const template = enemyTemplates[templateIndex];
    
    // Modifiers for variation
    const modifiers = [
      "Armored", "Enhanced", "Tactical", "Frenzied", "Stealth", 
      "Cyber", "Rogue", "Corrupted", "Veteran", "Alpha"
    ];
    
    // Generate a unique ID
    const id = `enemy_${Date.now()}_${this.random.nextInt(1000, 9999)}`;
    
    // For higher danger levels, add modifiers
    let name = template.type;
    let healthBonus = 0;
    let damageBonus = 0;
    
    if (dangerLevel > 3) {
      const modifier = this.random.choose(modifiers);
      name = `${modifier} ${template.type}`;
      healthBonus = this.random.nextInt(5, 15);
      damageBonus = this.random.nextInt(1, 3);
    }
    
    // Scale health and damage with danger level
    const healthScaling = 1 + (dangerLevel * 0.1);
    const damageScaling = 1 + (dangerLevel * 0.1);
    
    const health = Math.round((template.health + healthBonus) * healthScaling);
    const damage = Math.round((template.damage + damageBonus) * damageScaling);
    
    // Generate enemy abilities
    const abilities = this.generateEnemyAbilities(template.techLevel, dangerLevel);
    
    // Create description based on type
    let description = "";
    switch (template.techLevel) {
      case "basic":
        description = `A simple automated ${template.type.toLowerCase()} with basic offensive capabilities.`;
        break;
      case "moderate":
        description = `A combat-ready ${template.type.toLowerCase()} equipped with standard weaponry.`;
        break;
      case "advanced":
        description = `A highly trained ${template.type.toLowerCase()} with advanced combat systems.`;
        break;
      case "high":
        description = `An elite ${template.type.toLowerCase()} utilizing cutting-edge technology and tactics.`;
        break;
      case "natural":
        description = `A dangerous ${template.type.toLowerCase()} with evolved natural weapons.`;
        break;
      case "alien":
        description = `A mysterious entity with capabilities beyond conventional understanding.`;
        break;
    }
    
    // Generate reward based on danger level
    const reward = {
      experience: 20 * dangerLevel,
      items: this.random.next() < 0.3 ? [this.generateLootId(dangerLevel)] : undefined
    };
    
    return {
      id,
      name,
      health,
      maxHealth: health,
      damage,
      abilities,
      description,
      reward
    };
  }
  
  // Generate abilities for enemies
  private generateEnemyAbilities(techLevel: string, dangerLevel: number): any[] {
    const abilities = [];
    
    // Number of abilities scales with danger level
    const abilityCount = Math.max(1, Math.min(5, Math.floor(dangerLevel / 2)));
    
    // Define ability templates based on tech level
    const abilityTemplates: Record<string, any[]> = {
      "basic": [
        { name: "Basic Attack", energyCost: 0, damage: 5, cooldown: 0 },
        { name: "Defensive Mode", energyCost: 10, damage: 0, healing: 5, cooldown: 3 }
      ],
      "moderate": [
        { name: "Rapid Fire", energyCost: 5, damage: 8, cooldown: 1 },
        { name: "Shield Boost", energyCost: 15, damage: 0, healing: 10, cooldown: 4 },
        { name: "Disabling Shot", energyCost: 12, damage: 3, cooldown: 2 }
      ],
      "advanced": [
        { name: "Precision Strike", energyCost: 15, damage: 15, cooldown: 2 },
        { name: "Tactical Barrier", energyCost: 20, damage: 0, healing: 15, cooldown: 3 },
        { name: "System Hack", energyCost: 25, damage: 5, cooldown: 3 },
        { name: "Overcharge", energyCost: 30, damage: 20, cooldown: 4 }
      ],
      "high": [
        { name: "Devastating Blast", energyCost: 25, damage: 25, cooldown: 3 },
        { name: "Advanced Shielding", energyCost: 30, damage: 0, healing: 25, cooldown: 4 },
        { name: "Neural Disruptor", energyCost: 35, damage: 10, cooldown: 3 },
        { name: "Tactical Override", energyCost: 40, damage: 15, cooldown: 3 },
        { name: "Weapon Overload", energyCost: 50, damage: 35, cooldown: 5 }
      ],
      "natural": [
        { name: "Feral Strike", energyCost: 5, damage: 12, cooldown: 1 },
        { name: "Regenerate", energyCost: 20, damage: 0, healing: 15, cooldown: 4 },
        { name: "Toxic Spray", energyCost: 15, damage: 8, cooldown: 2 },
        { name: "Predator Sense", energyCost: 10, damage: 0, cooldown: 3 }
      ],
      "alien": [
        { name: "Void Touch", energyCost: 20, damage: 20, cooldown: 2 },
        { name: "Phase Shift", energyCost: 30, damage: 0, healing: 20, cooldown: 3 },
        { name: "Reality Tear", energyCost: 40, damage: 30, cooldown: 4 },
        { name: "Mind Fracture", energyCost: 35, damage: 15, cooldown: 3 },
        { name: "Cosmic Pulse", energyCost: 50, damage: 40, cooldown: 5 }
      ]
    };
    
    // Get the relevant ability templates
    const templates = abilityTemplates[techLevel] || abilityTemplates["basic"];
    
    // Pick random abilities up to the ability count
    const shuffled = this.random.shuffle([...templates]);
    const selectedTemplates = shuffled.slice(0, abilityCount);
    
    // Create abilities with some random variation
    for (const template of selectedTemplates) {
      // Add some random variation (±20%)
      const damageVariation = template.damage ? this.random.nextInt(-20, 20) / 100 : 0;
      const healingVariation = template.healing ? this.random.nextInt(-20, 20) / 100 : 0;
      const energyVariation = this.random.nextInt(-10, 10) / 100;
      
      // Create ability ID
      const id = `ability_${Date.now()}_${this.random.nextInt(1000, 9999)}`;
      
      // Apply variations
      const ability = {
        id,
        name: template.name,
        description: `Enemy ${template.name.toLowerCase()} ability`,
        energyCost: Math.max(0, Math.round(template.energyCost * (1 + energyVariation))),
        cooldown: template.cooldown,
        currentCooldown: 0
      };
      
      // Only add properties if they exist in the template
      if (template.damage) {
        ability.damage = Math.max(1, Math.round(template.damage * (1 + damageVariation)));
      }
      
      if (template.healing) {
        ability.healing = Math.max(1, Math.round(template.healing * (1 + healingVariation)));
      }
      
      abilities.push(ability);
    }
    
    // Always ensure at least one ability
    if (abilities.length === 0) {
      abilities.push({
        id: `ability_${Date.now()}_${this.random.nextInt(1000, 9999)}`,
        name: "Basic Attack",
        description: "A simple attack",
        energyCost: 0,
        damage: Math.max(1, dangerLevel * 2),
        cooldown: 0,
        currentCooldown: 0
      });
    }
    
    return abilities;
  }
  
  // Generate an ID for loot items
  private generateLootId(dangerLevel: number): string {
    const rarityTiers = ["common", "uncommon", "rare", "epic", "legendary"];
    
    // Higher danger level increases chance of better loot
    let rarityIndex = 0;
    const rarityRoll = this.random.next();
    
    if (dangerLevel >= 8 && rarityRoll > 0.7) {
      rarityIndex = 4; // legendary
    } else if (dangerLevel >= 6 && rarityRoll > 0.6) {
      rarityIndex = 3; // epic
    } else if (dangerLevel >= 4 && rarityRoll > 0.5) {
      rarityIndex = 2; // rare
    } else if (dangerLevel >= 2 && rarityRoll > 0.4) {
      rarityIndex = 1; // uncommon
    }
    
    const rarity = rarityTiers[rarityIndex];
    
    // Item types
    const itemTypes = ["weapon", "armor", "consumable", "tech", "upgrade"];
    const type = this.random.choose(itemTypes);
    
    return `${type}_${rarity}_${this.random.nextInt(1, 999)}`;
  }
}

export default ProceduralGenerator;