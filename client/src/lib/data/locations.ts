import { Location, LocationType } from "../types";
import { v4 as uuidv4 } from "uuid";

// Note: This is just the location data structure
// Actual enemies and puzzles would be referenced from their respective data files

export const gameLocations: Location[] = [
  {
    id: "ship",
    name: "The Celestial Pioneer",
    type: LocationType.Ship,
    description: "Your reliable spacecraft, equipped with basic necessities for space exploration.",
    encounters: {
      puzzles: ["power_distribution"]
    },
    connections: ["orbit_station"]
  },
  {
    id: "orbit_station",
    name: "Orbital Research Station",
    type: LocationType.Station,
    description: "A research station orbiting a mysterious planet. Signs of recent abandonment are evident.",
    encounters: {
      enemies: ["security_drone", "malfunctioning_robot"],
      puzzles: ["security_bypass"]
    },
    connections: ["ship", "alien_planet", "derelict_ship"]
  },
  {
    id: "alien_planet",
    name: "Xenoforma Prime",
    type: LocationType.Planet,
    description: "A lush alien world with strange flora and fauna. The atmosphere is breathable but unusual.",
    encounters: {
      enemies: ["native_predator", "hostile_plant"],
      puzzles: ["alien_sequence"]
    },
    connections: ["orbit_station", "ancient_ruins"]
  },
  {
    id: "ancient_ruins",
    name: "Ancient Alien Ruins",
    type: LocationType.Planet,
    description: "The remnants of an advanced alien civilization. Strange technology still functions here.",
    encounters: {
      enemies: ["guardian_construct", "energy_entity"],
      puzzles: ["alien_encryption"]
    },
    connections: ["alien_planet", "inner_sanctum"]
  },
  {
    id: "inner_sanctum",
    name: "Inner Sanctum",
    type: LocationType.Planet,
    description: "The heart of the alien ruins, containing their most sacred and advanced technology.",
    encounters: {
      enemies: ["ancient_guardian"],
      puzzles: ["stellar_key"]
    },
    connections: ["ancient_ruins"]
  },
  {
    id: "derelict_ship",
    name: "Abandoned Vessel",
    type: LocationType.Derelict,
    description: "A drifting spacecraft of unknown origin. Life support is minimal and danger lurks in the shadows.",
    encounters: {
      enemies: ["space_parasite", "rogue_android"],
      puzzles: ["power_restoration"]
    },
    connections: ["orbit_station", "void_anomaly"]
  },
  {
    id: "void_anomaly",
    name: "Void Anomaly",
    type: LocationType.Space,
    description: "A strange spatial phenomenon that defies the laws of physics. Reality seems distorted here.",
    encounters: {
      enemies: ["void_entity"],
      puzzles: ["stellar_navigation", "reality_anchor"]
    },
    connections: ["derelict_ship", "alien_outpost"]
  },
  {
    id: "alien_outpost",
    name: "Alien Trading Outpost",
    type: LocationType.Station,
    description: "A bustling hub of alien commerce and diplomacy. Various species coexist here.",
    encounters: {
      puzzles: ["diplomatic_negotiation"]
    },
    connections: ["void_anomaly", "ship"]
  }
];
