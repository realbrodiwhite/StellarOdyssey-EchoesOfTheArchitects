import { Faction, Location, LocationType } from "@/lib/types";

// Array of planet types with descriptions for generating varied planets
export const planetTypes = [
  {
    type: "Terrestrial",
    variants: ["Earthlike", "Desert", "Arctic", "Volcanic", "Ocean", "Rocky", "Jungle"],
    descriptions: {
      "Earthlike": "A lush world with diverse ecosystems, oceans, and habitable conditions.",
      "Desert": "A dry, arid world with vast dune seas and minimal surface water.",
      "Arctic": "A frigid world covered in ice and snow with extreme low temperatures.",
      "Volcanic": "An active world with frequent eruptions, lava flows, and ash-filled skies.",
      "Ocean": "A world almost entirely covered in water with scattered archipelagos.",
      "Rocky": "A barren world with rocky terrain, craters, and minimal atmosphere.",
      "Jungle": "A densely vegetated world with towering alien flora and complex ecosystems."
    }
  },
  {
    type: "Gas Giant",
    variants: ["Ringed", "Stormy", "Multi-colored", "Super-massive"],
    descriptions: {
      "Ringed": "A massive gas planet surrounded by spectacular rings of ice and rock debris.",
      "Stormy": "A turbulent gas giant with violent storms and powerful atmospheric winds.",
      "Multi-colored": "A gas giant with distinct colored bands in its atmosphere.",
      "Super-massive": "An enormous gas planet with intense gravitational forces."
    }
  },
  {
    type: "Exotic",
    variants: ["Crystal", "Sentient", "Quantum", "Artificial", "Shadow"],
    descriptions: {
      "Crystal": "A world where crystalline formations dominate the landscape.",
      "Sentient": "A mysterious planet exhibiting signs of collective consciousness.",
      "Quantum": "A planet with unstable physics affected by quantum phenomena.",
      "Artificial": "A constructed world built by an ancient advanced civilization.",
      "Shadow": "A dark world existing partially in another dimension."
    }
  }
];

// ============== LOCATIONS ==============
export const locations: Location[] = [
  // --------- STARTING AREA ---------
  {
    id: "solara_system",
    name: "Solara System",
    type: LocationType.Space,
    description: "A medium-sized star system with seven planets and numerous moons, serving as a hub for Alliance operations in this sector.",
    encounters: {
      enemies: ["pirate_scout", "syndicate_patrol"],
      puzzles: ["comms_interference", "data_decryption"],
    },
    connections: ["solara_prime", "haven_station", "asteroid_belt_alpha", "quantum_nebula", "wrecked_convoy"],
    region: "Core Systems",
    controlledBy: Faction.Alliance,
    dangerLevel: 2,
    discovered: true
  },
  {
    id: "solara_prime",
    name: "Solara Prime",
    type: LocationType.Planet,
    description: "The third planet in the Solara system, a temperate terrestrial world with extensive Alliance settlements and research facilities.",
    encounters: {
      puzzles: ["security_override", "environmental_adaptation"],
      npcs: ["alliance_commander", "scientist_lyra"],
    },
    connections: ["solara_system", "haven_station", "prime_capital_city", "northern_wilderness"],
    region: "Core Systems",
    controlledBy: Faction.Alliance,
    dangerLevel: 1,
    environmentEffects: [
      {
        type: "lowGravity",
        severity: 1,
        effect: "Slightly reduced gravity makes movement easier but affects precision tasks."
      }
    ],
    discovered: true
  },
  {
    id: "haven_station",
    name: "Haven Station",
    type: LocationType.Station,
    description: "A large Alliance space station serving as the primary trading hub, refueling depot, and security checkpoint in the Solara system.",
    encounters: {
      puzzles: ["maintenance_systems", "data_theft_investigation"],
      npcs: ["station_commander", "merchant_guild_rep", "mysterious_traveler"],
    },
    connections: ["solara_system", "solara_prime", "deep_space_route", "trader_concourse", "maintenance_sector"],
    items: ["enhanced_scanner", "shield_booster", "repair_kit"],
    region: "Core Systems",
    controlledBy: Faction.Alliance,
    dangerLevel: 1,
    discovered: true
  },
  
  // --------- MID-TIER LOCATIONS ---------
  {
    id: "quantum_nebula",
    name: "Quantum Nebula",
    type: LocationType.Anomaly,
    description: "A swirling cosmic cloud where normal physics behave unpredictably. Rich in exotic particles and rare elements but dangerous to navigate.",
    encounters: {
      enemies: ["energy_entity", "void_stalker"],
      puzzles: ["realign_warp_drive", "stabilize_reality"],
    },
    connections: ["solara_system", "lost_research_outpost", "temporal_rift", "mystic_enclave"],
    region: "Uncharted Space",
    dangerLevel: 6,
    environmentEffects: [
      {
        type: "voidEnergy",
        severity: 3,
        effect: "Exposure to quantum particles causes equipment malfunctions and sensor ghosts."
      }
    ],
    requiresItem: "quantum_stabilizer",
    discovered: false
  },
  {
    id: "asteroid_belt_alpha",
    name: "Asteroid Belt Alpha",
    type: LocationType.Space,
    description: "A dense field of asteroids rich in valuable minerals but notorious as a hideout for pirates and smugglers.",
    encounters: {
      enemies: ["pirate_ambush", "automated_mines"],
      puzzles: ["navigation_hazard", "mineral_identification"],
    },
    connections: ["solara_system", "mining_outpost_36", "smuggler_hideout", "ancient_beacon"],
    items: ["mineral_samples", "pirate_contraband"],
    region: "Core Systems",
    controlledBy: Faction.Syndicate,
    dangerLevel: 4,
    discovered: false
  },
  {
    id: "wrecked_convoy",
    name: "Wrecked Alliance Convoy",
    type: LocationType.Derelict,
    description: "The remains of a destroyed Alliance supply convoy. The wreckage drifts silently, holding valuable salvage and possibly survivors.",
    encounters: {
      enemies: ["automated_defense_system", "scavengers"],
      puzzles: ["access_locked_cargo", "life_support_restoration"],
    },
    connections: ["solara_system", "emergency_beacon"],
    items: ["classified_data_core", "military_supplies"],
    region: "Core Systems",
    dangerLevel: 3,
    environmentEffects: [
      {
        type: "radiation",
        severity: 2,
        effect: "Damaged reactor cores leak radiation that damages equipment and health over time."
      }
    ],
    discovered: false
  },
  
  // --------- HIGH-TIER LOCATIONS ---------
  {
    id: "mystic_enclave",
    name: "Mystic Enclave",
    type: LocationType.Settlement,
    description: "A hidden sanctuary of the enigmatic Mystics, built within a hollowed-out asteroid. Ancient technologies and esoteric knowledge abound here.",
    encounters: {
      puzzles: ["telepathic_trial", "artifact_attunement"],
      npcs: ["mystic_elder", "void_seer", "exiled_scientist"],
    },
    connections: ["quantum_nebula", "void_temple", "meditation_chambers"],
    region: "Deep Space",
    controlledBy: Faction.Mystics,
    dangerLevel: 3,
    unlockRequirement: {
      reputation: { faction: Faction.Mystics, level: 2 }
    },
    discovered: false
  },
  {
    id: "temporal_rift",
    name: "Temporal Rift",
    type: LocationType.Anomaly,
    description: "A tear in space-time that manifests as a swirling vortex of energy. Time flows differently near the rift, and echoes of the past and future can be experienced.",
    encounters: {
      enemies: ["chronos_guardian", "time_displaced_entity"],
      puzzles: ["temporal_stabilization", "chrono_navigation"],
    },
    connections: ["quantum_nebula", "echo_of_the_past", "potential_future"],
    region: "Void Space",
    dangerLevel: 8,
    environmentEffects: [
      {
        type: "voidEnergy",
        severity: 4,
        effect: "Time dilation effects cause unpredictable shifts in perception and equipment function."
      }
    ],
    unlockRequirement: {
      item: "temporal_anchor"
    },
    discovered: false
  },
  {
    id: "ancient_ruins_theta",
    name: "Ancient Ruins Theta",
    type: LocationType.Ruins,
    description: "Massive structures of unknown origin, built by a civilization that vanished millennia ago. The technology that remains is far beyond current understanding.",
    encounters: {
      enemies: ["ancient_guardian", "security_construct"],
      puzzles: ["alien_language_decryption", "activate_ancient_technology"],
    },
    connections: ["desert_world_exodus", "hidden_chamber", "central_archive"],
    region: "Frontier Systems",
    dangerLevel: 7,
    environmentEffects: [
      {
        type: "voidEnergy",
        severity: 2,
        effect: "Strange energy fields interfere with conventional technology and enhance certain psionic abilities."
      }
    ],
    unlockRequirement: {
      quest: "path_of_the_ancients"
    },
    discovered: false
  },
  {
    id: "void_breach",
    name: "Void Breach",
    type: LocationType.Anomaly,
    description: "A terrifying tear in reality that leads to another dimension. Void entities occasionally emerge from the breach, bringing chaos and destruction.",
    encounters: {
      enemies: ["void_horror", "reality_warper"],
      puzzles: ["seal_dimensional_tear", "void_energy_containment"],
    },
    connections: ["deep_space_route", "void_observation_post"],
    region: "Dark Sector",
    controlledBy: Faction.VoidEntity,
    dangerLevel: 10,
    environmentEffects: [
      {
        type: "voidEnergy",
        severity: 5,
        effect: "Exposure to void energies causes hallucinations, equipment failure, and psychological trauma."
      }
    ],
    unlockRequirement: {
      quest: "void_incursion"
    },
    discovered: false
  },
  
  // --------- SECONDARY SETTLEMENTS & STATIONS ---------
  {
    id: "mining_outpost_36",
    name: "Mining Outpost 36",
    type: LocationType.Settlement,
    description: "A rugged asteroid mining facility operated by independent contractors. The outpost extracts valuable minerals and provides shelter within the dangerous asteroid belt.",
    encounters: {
      npcs: ["mining_supervisor", "black_market_dealer", "retired_explorer"],
    },
    connections: ["asteroid_belt_alpha", "deep_mine_shaft", "recreational_dome"],
    items: ["mining_equipment", "refined_minerals"],
    region: "Core Systems",
    dangerLevel: 2,
    discovered: false
  },
  {
    id: "smuggler_hideout",
    name: "Smuggler's Hideout",
    type: LocationType.Settlement,
    description: "A secretive outpost built into a hollowed asteroid, serving as a base for smugglers, pirates, and others avoiding Alliance attention.",
    encounters: {
      enemies: ["smuggler_guard", "rival_gang"],
      npcs: ["smuggler_boss", "information_broker"],
    },
    connections: ["asteroid_belt_alpha", "black_market", "escape_tunnels"],
    items: ["contraband", "black_market_weapons"],
    region: "Core Systems",
    controlledBy: Faction.Syndicate,
    dangerLevel: 5,
    unlockRequirement: {
      reputation: { faction: Faction.Syndicate, level: 1 }
    },
    discovered: false
  },
  
  // --------- OTHER PLANETARY LOCATIONS ---------
  {
    id: "desert_world_exodus",
    name: "Exodus",
    type: LocationType.Planet,
    description: "A harsh desert planet with minimal water. Settlers survive in domed cities and by harvesting moisture from the atmosphere. Famous for its resilient population and valuable mineral deposits.",
    encounters: {
      enemies: ["desert_predator", "sand_raiders"],
      puzzles: ["water_purification_crisis", "sandstorm_navigation"],
      npcs: ["settlement_leader", "water_merchant"],
    },
    connections: ["deep_space_route", "exodus_prime_settlement", "ancient_ruins_theta", "crystal_canyons"],
    region: "Frontier Systems",
    controlledBy: Faction.Settlers,
    dangerLevel: 4,
    environmentEffects: [
      {
        type: "extremeTemperature",
        severity: 3,
        effect: "Scorching daytime temperatures and freezing nights strain survival systems and equipment."
      }
    ],
    discovered: false
  },
  {
    id: "jungle_world_viridian",
    name: "Viridian",
    type: LocationType.Planet,
    description: "A vibrant jungle world teeming with exotic life forms. The dense canopy towers hundreds of meters high, creating a multi-layered ecosystem unlike any other known planet.",
    encounters: {
      enemies: ["predatory_flora", "territorial_fauna"],
      puzzles: ["toxic_pollen_filtration", "bioluminescent_navigation"],
      npcs: ["xenobiologist", "native_guide"],
    },
    connections: ["deep_space_route", "research_outpost_viridian", "canopy_settlement", "ancient_temple"],
    region: "Frontier Systems",
    dangerLevel: 6,
    environmentEffects: [
      {
        type: "toxicAtmosphere",
        severity: 2,
        effect: "Alien spores and pollens can cause respiratory issues and equipment contamination."
      }
    ],
    discovered: false
  },
  {
    id: "ice_world_glacius",
    name: "Glacius",
    type: LocationType.Planet,
    description: "A frozen world with vast ice sheets and constant snowstorms. Beneath the surface lie ancient frozen organisms and valuable resources preserved in the ice.",
    encounters: {
      enemies: ["ice_burrower", "cryo_construct"],
      puzzles: ["thermal_regulation", "ice_crevasse_traversal"],
      npcs: ["research_team_leader", "stranded_explorer"],
    },
    connections: ["deep_space_route", "research_station_glacius", "ice_caves", "frozen_ruins"],
    region: "Frontier Systems",
    dangerLevel: 5,
    environmentEffects: [
      {
        type: "extremeTemperature",
        severity: 4,
        effect: "Extreme cold rapidly drains energy reserves and freezes exposed equipment."
      }
    ],
    discovered: false
  }
];

// Function to get location by ID
export const getLocationById = (id: string): Location | undefined => {
  return locations.find(location => location.id === id);
};

// Function to get connected locations
export const getConnectedLocations = (locationId: string): Location[] => {
  const location = getLocationById(locationId);
  if (!location) return [];
  
  return location.connections
    .map(connId => getLocationById(connId))
    .filter((loc): loc is Location => loc !== undefined);
};

// Function to get planetary system for a location
export const getLocationSystem = (locationId: string): string => {
  const location = getLocationById(locationId);
  if (!location || !location.region) return "Unknown";
  return location.region;
};

// Function to discover a location
export const discoverLocation = (locationId: string): void => {
  const location = getLocationById(locationId);
  if (location) {
    location.discovered = true;
  }
};

export default locations;