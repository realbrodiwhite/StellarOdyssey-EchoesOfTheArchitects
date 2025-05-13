import { Enemy, Ability, Character, SkillType } from "../types";

/**
 * Calculate damage based on the attacker's abilities and the defender's skills
 */
export function calculateDamage(
  attackerDamage: number,
  attackerAbility: Ability | null,
  defender: Character | Enemy
): number {
  // Base damage
  let damage = attackerDamage;
  
  // Add ability damage if an ability is used
  if (attackerAbility && attackerAbility.damage) {
    damage += attackerAbility.damage;
  }
  
  // Apply randomness (±20%)
  const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  damage = Math.floor(damage * randomFactor);
  
  // Apply damage reduction if defender is a player character with combat skills
  if ('skills' in defender) {
    const combatSkill = defender.skills.find(skill => skill.type === SkillType.Combat);
    if (combatSkill) {
      // Each combat level reduces damage by 3%
      const damageReduction = combatSkill.level * 0.03;
      damage = Math.floor(damage * (1 - damageReduction));
    }
  }
  
  // Ensure minimum damage of 1
  return Math.max(1, damage);
}

/**
 * Calculate hit chance based on skills and abilities
 */
export function calculateHitChance(
  attackerIsPlayer: boolean,
  attackerAbility: Ability | null,
  defenderIsPlayer: boolean
): number {
  // Base hit chance
  let hitChance = 0.85; // 85% base hit chance
  
  // Adjust based on ability (if any)
  if (attackerAbility) {
    // Abilities are generally more accurate
    hitChance += 0.05;
  }
  
  return Math.min(0.95, hitChance); // Cap at 95%
}

/**
 * Check if an attack hits
 */
export function doesAttackHit(
  attackerIsPlayer: boolean,
  attackerAbility: Ability | null,
  defenderIsPlayer: boolean
): boolean {
  const hitChance = calculateHitChance(attackerIsPlayer, attackerAbility, defenderIsPlayer);
  return Math.random() <= hitChance;
}

/**
 * Check if an attack is a critical hit
 */
export function isCriticalHit(
  attackerIsPlayer: boolean,
  attackerAbility: Ability | null
): boolean {
  // Base critical chance
  let critChance = 0.05; // 5% base critical chance
  
  // Some abilities might increase critical chance
  if (attackerAbility && attackerAbility.name.includes("Precision")) {
    critChance += 0.1; // Precision abilities have higher crit chance
  }
  
  return Math.random() <= critChance;
}

/**
 * Apply critical hit bonus to damage
 */
export function applyCriticalBonus(baseDamage: number): number {
  // Critical hits do 1.5x damage
  return Math.floor(baseDamage * 1.5);
}

/**
 * Generate a combat message for an attack
 */
export function generateCombatMessage(
  attackerName: string,
  defenderName: string,
  damage: number,
  didHit: boolean,
  isCritical: boolean,
  abilityName: string | null
): string {
  if (!didHit) {
    return `${attackerName}'s ${abilityName || "attack"} missed ${defenderName}!`;
  }
  
  if (isCritical) {
    return `${attackerName}'s ${abilityName || "attack"} critically hit ${defenderName} for ${damage} damage!`;
  }
  
  return `${attackerName}'s ${abilityName || "attack"} hit ${defenderName} for ${damage} damage.`;
}
