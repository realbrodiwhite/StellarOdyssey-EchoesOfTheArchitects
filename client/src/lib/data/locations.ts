import { Location, LocationType } from "../types";
import { v4 as uuidv4 } from "uuid";

// Note: This is just the location data structure
// Actual enemies and puzzles would be referenced from their respective data files

export const gameLocations: Location[] = [
  // CHAPTER 1 - THE NEW FRONTIER
  {
    id: "ship",
    name: "The Odyssey",
    type: LocationType.Ship,
    description: "Your advanced spacecraft, equipped with state-of-the-art technology. It serves as your mobile home and base of operations.",
    encounters: {
      puzzles: ["system_diagnosis"]
    },
    connections: ["frontier_outpost"],
    items: ["basic_repair_kit", "emergency_rations"],
    region: "Alliance Territory"
  },
  {
    id: "frontier_outpost",
    name: "Proxima Outpost",
    type: LocationType.Station,
    description: "The Alliance's furthest frontier outpost, a hub for explorers and traders. The station shows signs of recent conflict.",
    encounters: {
      enemies: ["rogue_drone", "syndicate_spy"],
      puzzles: ["communications_repair"]
    },
    connections: ["ship", "mining_colony", "debris_field"],
    items: ["frontier_map", "basic_medkit"],
    region: "Frontier Space"
  },
  {
    id: "mining_colony",
    name: "New Titan",
    type: LocationType.Planet,
    description: "A struggling mining colony plagued by Syndicate raids. The settlers eye newcomers with suspicion and hope.",
    encounters: {
      enemies: ["syndicate_marauder", "security_mech"],
      puzzles: ["resource_allocation"]
    },
    connections: ["frontier_outpost", "ancient_ruins", "smuggler_haven"],
    items: ["mining_equipment", "rare_mineral_sample"],
    region: "Frontier Space"
  },
  {
    id: "debris_field",
    name: "Proxima Graveyard",
    type: LocationType.Space,
    description: "A vast field of shipwrecks and debris from an ancient space battle. Scavengers search for valuable technology among the dangers.",
    encounters: {
      enemies: ["scavenger_drone", "void_lurker"],
      puzzles: ["salvage_operation"]
    },
    connections: ["frontier_outpost", "derelict_station"],
    items: ["salvaged_tech", "navigation_data"],
    region: "Frontier Space"
  },

  // CHAPTER 2 - ANCIENT SECRETS
  {
    id: "ancient_ruins",
    name: "Voidtouched Remnants",
    type: LocationType.Planet,
    description: "Mysterious ruins of an ancient civilization. Strange energy signatures emanate from deep within the structure.",
    encounters: {
      enemies: ["guardian_construct", "energy_entity"],
      puzzles: ["relic_activation"]
    },
    connections: ["mining_colony", "temple_entrance"],
    items: ["ancient_tablet", "energy_crystal"],
    region: "Uncharted Territory"
  },
  {
    id: "temple_entrance",
    name: "Celestial Gateway",
    type: LocationType.Planet,
    description: "A massive stone doorway carved into a mountain. Intricate symbols glow with pulsating energy.",
    encounters: {
      enemies: ["temple_guardian", "mystic_zealot"],
      puzzles: ["doorway_cipher"]
    },
    connections: ["ancient_ruins", "inner_sanctum"],
    region: "Uncharted Territory"
  },
  {
    id: "inner_sanctum",
    name: "Chamber of Ascension",
    type: LocationType.Planet,
    description: "The heart of the ancient temple, containing the civilization's most advanced technology and darkest secrets.",
    encounters: {
      enemies: ["ascended_guardian"],
      puzzles: ["stellar_key", "consciousness_transfer"]
    },
    connections: ["temple_entrance"],
    items: ["artifact_shard"],
    region: "Uncharted Territory"
  },

  // CHAPTER 3 - POWER PLAY
  {
    id: "derelict_station",
    name: "Abandoned Research Facility",
    type: LocationType.Derelict,
    description: "An Alliance research station showing signs of a violent struggle. The facility's logs speak of a breakthrough discovery.",
    encounters: {
      enemies: ["mutated_researcher", "security_system"],
      puzzles: ["data_recovery"]
    },
    connections: ["debris_field", "syndicate_base"],
    items: ["research_logs", "experimental_weapon"],
    region: "Contested Space"
  },
  {
    id: "syndicate_base",
    name: "Eclipse Point",
    type: LocationType.Station,
    description: "A heavily fortified Syndicate stronghold disguised as a trading post. Only the trusted are allowed in the inner chambers.",
    encounters: {
      enemies: ["syndicate_enforcer", "elite_guard"],
      puzzles: ["security_bypass"]
    },
    connections: ["derelict_station", "void_tear"],
    items: ["syndicate_insignia", "contraband"],
    region: "Syndicate Territory"
  },
  {
    id: "smuggler_haven",
    name: "Freeport",
    type: LocationType.Station,
    description: "A lawless space station where adventurers, criminals, and exiles gather. Information and illicit goods flow freely.",
    encounters: {
      enemies: ["bounty_hunter", "rival_smuggler"],
      puzzles: ["contraband_negotiation"]
    },
    connections: ["mining_colony", "mystic_enclave"],
    items: ["black_market_goods", "forged_credentials"],
    region: "Neutral Zone"
  },

  // CHAPTER 4 - POINT OF NO RETURN
  {
    id: "mystic_enclave",
    name: "Eternity's Cradle",
    type: LocationType.Derelict,
    description: "A hidden sanctuary for those seeking to understand the ancient civilization's power. The air vibrates with energy.",
    encounters: {
      enemies: ["rogue_mystic", "void_experiment"],
      puzzles: ["mind_trial"]
    },
    connections: ["smuggler_haven", "alliance_headquarters"],
    items: ["mystic_teachings", "void_essence"],
    region: "Mystical Sanctuary"
  },
  {
    id: "void_tear",
    name: "The Breach",
    type: LocationType.Space,
    description: "A fracture in spacetime revealing glimpses of another dimension. Reality itself seems unstable near the tear.",
    encounters: {
      enemies: ["void_entity", "dimensional_horror"],
      puzzles: ["reality_anchor", "dimensional_stabilization"]
    },
    connections: ["syndicate_base", "void_nexus"],
    region: "Void Space"
  },
  {
    id: "alliance_headquarters",
    name: "Harmony Central",
    type: LocationType.Station,
    description: "The heart of Alliance operations in this sector. High-ranking officials and military personnel coordinate efforts from here.",
    encounters: {
      enemies: ["corrupted_official", "alliance_elite"],
      puzzles: ["political_maneuvering"]
    },
    connections: ["mystic_enclave", "orbital_defense"],
    items: ["alliance_credentials", "classified_reports"],
    region: "Alliance Territory"
  },

  // CHAPTER 5 - NEW DAWN
  {
    id: "orbital_defense",
    name: "Guardian Array",
    type: LocationType.Space,
    description: "A massive orbital weapons platform designed to protect Alliance space. It's currently targeting the ancient temple.",
    encounters: {
      enemies: ["automated_defense", "alliance_commander"],
      puzzles: ["targeting_override"]
    },
    connections: ["alliance_headquarters", "final_confrontation"],
    region: "Alliance Territory"
  },
  {
    id: "void_nexus",
    name: "The Convergence",
    type: LocationType.Space,
    description: "The epicenter of the void anomalies. Multiple realities seem to overlap in this location.",
    encounters: {
      enemies: ["void_amalgamation"],
      puzzles: ["reality_navigation"]
    },
    connections: ["void_tear", "final_confrontation"],
    items: ["void_key"],
    region: "Void Space"
  },
  {
    id: "final_confrontation",
    name: "Ascension Point",
    type: LocationType.Planet,
    description: "The place where all paths converge. The fate of the galaxy will be decided here.",
    encounters: {
      enemies: ["final_adversary", "shadow_self"],
      puzzles: ["ultimate_choice"]
    },
    connections: ["orbital_defense", "void_nexus"],
    region: "Convergence Point"
  }
];
