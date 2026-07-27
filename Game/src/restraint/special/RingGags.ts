/**
 * RingGags systems — base-game port
 *
 * Original mod: RingGags v1.0 by Sax
 * Port target: integrated into vanilla so behavior remains without the mod.
 *
 * Systems:
 * - Ring / plug / open gag restraints (registered with core restraint list)
 * - Drool: logical stages S1–S4 + cycle; visual sprite random on equip/update
 * - Breath: open mouth + (tired | huffing | aroused)
 * - Plug/unplug swaps, specials, particles (phased in)
 *
 * TODO Phase 2+: wire AddModel / KinkyDungeonRestraints / event hooks here.
 * This file is the integration home so KinkyDungeonRestraintsList stays readable.
 */

"use strict";

// ---------------------------------------------------------------------------
// Config — drool timing (matches mod defaults)
// ---------------------------------------------------------------------------

export const RG_COOLDOWNS: Record<string, [number, number]> = {
	"1": [35, 50],
	"2": [35, 50],
	"3": [35, 50],
	"4": [35, 50],
	cycle: [35, 50],
};

export const RG_DURATIONS: Record<string, [number, number]> = {
	"1": [10, 20],
	"2": [10, 20],
	"3": [10, 20],
	"4": [10, 20],
	cycle: [10, 20],
};

export const RG_WIPE_COOLDOWN: [number, number] = [35, 50];
export const RG_STEPS_PER_TICK = 5;
export const RG_CYCLE = [2, 3, 4];

/** Breath thresholds (base-game Tired uses 50% stamina). */
export const RG_BREATH_TIRED = 0.5;
export const RG_BREATH_HUFFING = 0.25;
export const RG_BREATH_AROUSED = 0.4;

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function RG_RandInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function RG_Pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Breath condition (Phase 3)
// Mouth must be open (caller ensures open/ring-gag-only state).
// ---------------------------------------------------------------------------

/**
 * Returns true when breath SFX should show.
 * Requires open mouth (checked by caller via open-gag state).
 */
export function RG_ShouldShowBreath(
	stamina: number,
	staminaMax: number,
	distraction: number,
	distractionMax: number,
): boolean {
	const staminaRatio = staminaMax > 0 ? stamina / staminaMax : 1;
	const tired = staminaRatio < RG_BREATH_TIRED;
	const huffing = staminaRatio < RG_BREATH_HUFFING;
	const aroused =
		distractionMax > 0 && distraction / distractionMax >= RG_BREATH_AROUSED;
	return tired || huffing || aroused;
}

/** Random drool visual index 1–4 (used on every equip / stage change). */
export function RG_RandomDroolVisual(): number {
	return RG_RandInt(1, 4);
}

// ---------------------------------------------------------------------------
// Registration stub (Phase 2+)
// Call from game init once restraint/model APIs are wired.
// ---------------------------------------------------------------------------

/**
 * Register RingGags models, restraints, and event handlers with the core game.
 * Currently a no-op placeholder until Phase 2–3 implementation.
 */
export function RG_Register(): void {
	// Phase 2: AddModel / restraint push
	// Phase 3: tick + overlay event handlers
	// Phase 4: inventory actions, specials
	void 0;
}
