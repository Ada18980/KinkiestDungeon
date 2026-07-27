/**
 * RingGags systems — base-game port
 *
 * Original mod: RingGags v1.0 by Sax
 * Phase 2: core open-ring restraint registration + helpers
 * Phase 3+: drool/breath tick, plug swaps, specials
 */

"use strict";

// ---------------------------------------------------------------------------
// Config
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

export const RG_BREATH_TIRED = 0.5;
export const RG_BREATH_HUFFING = 0.25;
export const RG_BREATH_AROUSED = 0.4;

/** Link set matching mod BallGagLink for open ring gags. */
const RG_BallGagLink = ["Stuffing", "PlugGags", "FlatGags", "MuzzleGags", "Tape", "Wrapping", "Encase"];

/** Events attached to every open ring gag (drool/breath tick wired in Phase 3). */
const RingGagEvents = [
	{ trigger: "tick", type: "ringGagEffects", inheritLinked: true },
	{ trigger: "postRemoval", type: "ringGagCleanup", inheritLinked: true },
];

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function RG_RandInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function RG_Pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

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

export function RG_RandomDroolVisual(): number {
	return RG_RandInt(1, 4);
}

// ---------------------------------------------------------------------------
// Core restraint definitions (Phase 2)
// ---------------------------------------------------------------------------

type RGText = { name: string; display: string; flavor: string; func: string };

const RG_RESTRAINT_TEXT: RGText[] = [
	{
		name: "RingGag",
		display: "Ring Gag",
		flavor: "A firm metal ring wedged behind your teeth forces your mouth wide open.",
		func: "A standard ring gag. Barely muffles speech since the mouth is held open.",
	},
	{
		name: "HarnessRingGag",
		display: "Harness Ring Gag",
		flavor: "A metal ring held in place by a web of leather straps buckled tightly around your head.",
		func: "The harness is comprehensive and it's locked in place.",
	},
	{
		name: "LargeRingGag",
		display: "Large Ring Gag",
		flavor: "A wider metal ring forced into your mouth. The stretch is significant.",
		func: "A larger ring gag. Your jaw is held wider than is comfortable.",
	},
	{
		name: "HugeRingGag",
		display: "Huge Ring Gag",
		flavor: "An enormous metal ring stretches your jaw painfully wide.",
		func: "The largest ring gag variant. Your jaw aches from how wide it forces you open.",
	},
	{
		name: "LatexRingGag",
		display: "Latex Ring Gag",
		flavor: "A soft rubber O-ring forced into your mouth. It stretches but doesn't yield.",
		func: "A flexible latex ring gag. The rubber holds your jaw open without the bite of metal.",
	},
	{
		name: "DragonscaleRingGag",
		display: "Dragonscale Ring Gag",
		flavor: "A metal ring secured with dragonscale straps that resist any blade.",
		func: "It's made from hard-to-cut dragonscale!!!",
	},
	{
		name: "HighsecSpiderGag",
		display: "High-Security Spider Gag",
		flavor: "A radial metal frame locked into your mouth, fanned out by a reinforced harness.",
		func: "The cable-reinforced straps and metal spider frame make this near-impossible to remove.",
	},
	{
		name: "MagicSpiderGag",
		display: "Magic Spider Gag",
		flavor: "An enchanted ring formed into a spider-like frame.",
		func: "It's brimming with conjured energy. A normal knife won't work here!",
	},
	{
		name: "GoodGirlGag",
		display: "Good Girl Gag",
		flavor: "A nurse-issue ring gag built into a soft leather muzzle. The plug pulls out for dosing.",
		func: "Open wide — good girl. Now let's plug that back up, shall we?",
	},
	{
		name: "CriersRing",
		display: "Crier's Ring",
		flavor: "A cruel ring gag that forces your mouth open and invites misfortune.",
		func: "Something about this ring feels cursed…",
	},
	{
		name: "TongueTrap",
		display: "Tongue Trap",
		flavor: "A firm metal ring with a rubber-coated saddle that clamps down over your tongue.",
		func: "Drinking potions becomes a gamble — your numbed tongue can't tell a healing brew from poison.",
	},
	{
		name: "IncantorsMouthpiece",
		display: "Incantor's Mouthpiece",
		flavor: "An ancient metal ring etched with spellwork that glows faintly gold when enemies draw near.",
		func: "Up close, the word is the weapon.",
	},
];

function RG_CoreRestraints(): any[] {
	const link = [...RG_BallGagLink];
	return [
		{
			inventory: true, name: "RingGag", Asset: "RingGags", preview: "RingGags",
			Model: "RingGag", Group: "ItemMouth", Type: "Tight",
			Color: ["Default", "Default"], debris: "Belts", sfxGroup: "Leather",
			LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]],
			gag: 0.1, power: 4, weight: 3, strictness: 0.1, maxwill: 0.6,
			escapeChance: { Struggle: 0.15, Cut: 0.2, Remove: 0.8, Pick: 0.2 },
			limitChance: { Struggle: 0.15 },
			enemyTags: { leatherRestraints: 10, ballGagRestraints: 4 },
			playerTags: {}, minLevel: 0, allFloors: true,
			shrine: ["Leather", "Gags", "OpenGag"],
			events: [...RingGagEvents],
		},
		{
			inventory: true, trappable: true, name: "HarnessRingGag", debris: "Belts",
			Asset: "RingGags", preview: "RingGags", Model: "RingGagHarness", sfxGroup: "Leather",
			Group: "ItemMouth", Type: "Tight", Color: ["Default", "Default"],
			LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]],
			gag: 0.1, power: 5, weight: 2, strictness: 0.15, maxwill: 0.7,
			escapeChance: { Struggle: 0.05, Cut: 0.15, Remove: 0.5, Pick: 0.2 },
			limitChance: { Struggle: 0.15 },
			enemyTags: { leatherRestraints: 8, ballGagRestraints: 5 },
			playerTags: {}, minLevel: 0, allFloors: true,
			shrine: ["Leather", "Gags", "OpenGag"],
			events: [...RingGagEvents],
		},
		{
			inventory: true, name: "LargeRingGag", Asset: "RingGags", preview: "RingGags",
			Model: "LargeRingGag", Group: "ItemMouth", Type: "Tight",
			Color: ["Default", "Default"], debris: "Belts", sfxGroup: "Leather",
			LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]],
			gag: 0.1, power: 4, weight: 2, maxwill: 0.9,
			escapeChance: { Struggle: 0.0, Cut: 0.45, Remove: 0.65, Pick: 0.3 },
			limitChance: { Struggle: 0.15 },
			enemyTags: { ballGagRestraints: 4 },
			playerTags: {}, minLevel: 0, allFloors: true,
			shrine: ["Leather", "Gags", "OpenGag"],
			events: [...RingGagEvents],
		},
		{
			inventory: true, name: "HugeRingGag", Asset: "RingGags", preview: "RingGags",
			Model: "LargeRingGag", Group: "ItemMouth", Type: "Tight",
			Color: ["Default", "Default"], debris: "Belts", sfxGroup: "Leather",
			LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]],
			DefaultLock: "Red_Hi",
			gag: 0.1, power: 5, weight: 2, maxwill: 0.9,
			escapeChance: { Struggle: 0.0, Cut: 0.45, Remove: 0.65, Pick: 0.3 },
			limitChance: { Struggle: 0.15 },
			enemyTags: { ballGagRestraints: 3 },
			playerTags: {}, minLevel: 2, allFloors: true,
			shrine: ["Leather", "Gags", "OpenGag"],
			events: [...RingGagEvents],
		},
		{
			inventory: true, name: "LatexRingGag", Asset: "RingGags", preview: "RingGags",
			Model: "LatexRingGag", Group: "ItemMouth", Type: "Tight",
			Color: ["#4EA1FF", "Default"], sfxGroup: "Rubber",
			LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]],
			gag: 0.1, power: 7, weight: 0,
			escapeChance: { Struggle: -0.05, Cut: 0.04, Remove: 0.4, Pick: 0.25 },
			limitChance: { Struggle: 0.15 },
			enemyTags: { latexRestraints: 5, latexGag: 8 },
			playerTags: {}, minLevel: 0, allFloors: true,
			shrine: ["Latex", "Gags", "OpenGag"],
			events: [...RingGagEvents],
		},
		{
			inventory: true, name: "DragonscaleRingGag", debris: "Belts",
			Asset: "RingGags", preview: "RingGags", Model: "RingGagHarnessSecure",
			Group: "ItemMouth", Type: "Tight", Color: ["Default", "Default"], sfxGroup: "Leather",
			LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]],
			gag: 0.1, power: 6, weight: 1, maxwill: 0.75,
			escapeChance: { Struggle: -0.1, Cut: -0.5, Remove: 0.35, Pick: 0.2 },
			limitChance: { Struggle: 0.15 },
			enemyTags: { dragonRestraints: 6, ballGagRestraints: 2 },
			playerTags: {}, minLevel: 3, allFloors: true,
			shrine: ["Leather", "Gags", "OpenGag", "Dragon"],
			events: [...RingGagEvents],
		},
		{
			inventory: true, name: "HighsecSpiderGag", debris: "Belts",
			Asset: "RingGags", preview: "RingGags", Model: "SpiderGagHarnessSecure",
			Group: "ItemMouth", Type: "Tight", Color: ["Default", "Default"], sfxGroup: "Leather",
			LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]],
			quickBindCondition: "BallGag", quickBindMult: 0.5,
			gag: 0.1, power: 8, weight: 1, maxwill: 0.85,
			escapeChance: { Struggle: -0.2, Cut: 0.05, Remove: 0.2, Pick: 0.1 },
			limitChance: { Struggle: 0.2 },
			enemyTags: { highsec: 8, ballGagRestraints: 2 },
			playerTags: {}, minLevel: 5, allFloors: true,
			shrine: ["Leather", "Gags", "OpenGag", "Metal"],
			events: [...RingGagEvents],
		},
		{
			inventory: true, name: "MagicSpiderGag", Asset: "RingGags", preview: "RingGags", debris: "Belts",
			Model: "SpiderGag", sfxGroup: "Leather", Group: "ItemMouth", Type: "Tight",
			Color: ["Default", "#ff00ff"],
			LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]],
			quickBindCondition: "BallGag", quickBindMult: 0.5,
			DefaultLock: "Purple", magic: true,
			gag: 0.1, power: 5.5, weight: 2,
			escapeChance: { Struggle: -0.1, Cut: 0.12, Remove: 0.45, Pick: 0.25 },
			limitChance: { Struggle: 0.15 },
			enemyTags: { ballGagRestraintsMagic: 4, gagSpellStrong: 10, forceAntiMagic: -100 },
			playerTags: {}, minLevel: 0, allFloors: true,
			shrine: ["Leather", "Gags", "Conjure", "OpenGag"],
			events: [...RingGagEvents],
		},
		{
			inventory: true, name: "GoodGirlGag", Asset: "RingGags", preview: "RingGags",
			Model: "GoodGirlGagModel", Group: "ItemMouth", Type: "Tight",
			Color: ["Default", "Default"], debris: "Belts", sfxGroup: "Leather",
			LinkableBy: ["FlatGags", "MuzzleGags", "Tape", "Wrapping", "Encase"],
			renderWhenLinked: ["FlatGags", "MuzzleGags", "Tape", "Wrapping", "Encase"],
			factionColor: [[], [0]], DefaultLock: "Red",
			gag: 0.4, power: 8, weight: 2, maxwill: 0.9,
			limitChance: { Struggle: 0.1, Cut: 0, Unlock: 0.75 },
			escapeChance: { Struggle: -0.175, Cut: 0.15, Remove: 0.15, Pick: 0.15 },
			enemyTags: { nurseRestraints: 12, dressRestraints: 3, forceAntiMagic: -100 },
			playerTags: {}, minLevel: 0, allFloors: true,
			shrine: ["Leather", "Gags", "PlugGags"],
			events: [...RingGagEvents],
		},
		{
			inventory: true, name: "CriersRing", Asset: "RingGags", preview: "RingGags",
			Model: "RingGag", Group: "ItemMouth", Type: "Tight",
			Color: ["#5a1a1a", "#5a1a1a"], debris: "Belts", sfxGroup: "Leather",
			LinkableBy: link, renderWhenLinked: link,
			gag: 0.1, power: 10, weight: 0, strictness: 0.15, maxwill: 0.45,
			escapeChance: { Struggle: -0.1, Cut: 0.1, Remove: 0.25, Pick: 0.15 },
			limitChance: { Struggle: 0.15 },
			enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true,
			shrine: ["Leather", "Gags", "OpenGag", "Cursed"],
			events: [...RingGagEvents],
		},
		{
			inventory: true, name: "TongueTrap", Asset: "RingGags", preview: "RingGags",
			Model: "TongueTrapModel", Group: "ItemMouth", Type: "Tight",
			Color: ["Default", "Default"], sfxGroup: "Rubber",
			LinkableBy: link, renderWhenLinked: link,
			gag: 0.1, power: 10, weight: 1, strictness: 0.15, maxwill: 0.5,
			escapeChance: { Struggle: -0.1, Cut: 0.1, Remove: 0.3, Pick: 0.2 },
			limitChance: { Struggle: 0.15 }, DefaultLock: "Blue",
			enemyTags: { trapRestraints: 6, latexRestraints: 2 },
			playerTags: {}, minLevel: 2, allFloors: true,
			shrine: ["Latex", "Gags", "OpenGag"],
			events: [...RingGagEvents],
		},
		{
			inventory: true, name: "IncantorsMouthpiece", Asset: "RingGags", preview: "RingGags",
			Model: "IncantorsMouthpieceModel", Group: "ItemMouth", Type: "Tight",
			Color: ["#e8c96a", "#b08a2a"], sfxGroup: "Leather",
			LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]],
			DefaultLock: "Divine2",
			gag: 0.1, power: 30, weight: 0, strictness: 0.3, maxwill: 0.9,
			escapeChance: { Struggle: -99, Cut: -99, Remove: 1, Pick: -100 },
			limitChance: { Struggle: 0.5 },
			enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true,
			shrine: ["Metal", "Gags", "OpenGag", "Divine"],
			events: [...RingGagEvents],
		},
	];
}

/** Invisible cosmetic overlays for drool/breath (equipped by Phase 3 logic). */
function RG_CosmeticRestraints(): any[] {
	const list: any[] = [];
	for (let i = 1; i <= 4; i++) {
		list.push({
			inventory: false,
			name: "RingGagDroolS" + i + "FX",
			Asset: "RingGags",
			preview: "RingGags",
			Model: "RingGagDroolS" + i,
			Group: "RingGagDroolFX",
			power: 0, weight: 0,
			escapeChance: { Remove: 10 },
			enemyTags: {}, playerTags: {},
			minLevel: 0, allFloors: true, shrine: [],
		});
	}
	list.push({
		inventory: false,
		name: "RingGagBreathFX",
		Asset: "RingGags",
		preview: "RingGags",
		Model: "RingGagBreathOverlay",
		Group: "RingGagBreathFX",
		power: 0, weight: 0,
		escapeChance: { Remove: 10 },
		enemyTags: {}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: [],
	});
	return list;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

let RG_Registered = false;

/**
 * Register RingGags restraints + text with the core game.
 * Call once after KinkyDungeonRestraints is available (e.g. end of restraint list load).
 */
export function RG_Register(): void {
	if (RG_Registered) return;
	RG_Registered = true;

	const restraints = [...RG_CoreRestraints(), ...RG_CosmeticRestraints()];

	if (typeof KinkyDungeonRestraints !== "undefined" && Array.isArray(KinkyDungeonRestraints)) {
		for (const r of restraints) {
			if (!KinkyDungeonRestraints.find((x: any) => x.name === r.name)) {
				KinkyDungeonRestraints.push(r);
			}
		}
	}

	if (typeof KinkyDungeonAddRestraintText === "function") {
		for (const t of RG_RESTRAINT_TEXT) {
			KinkyDungeonAddRestraintText(t.name, t.display, t.flavor, t.func);
		}
	} else if (typeof addTextKey === "function") {
		for (const t of RG_RESTRAINT_TEXT) {
			addTextKey("Restraint" + t.name, t.display);
			addTextKey("Restraint" + t.name + "Desc", t.flavor);
			addTextKey("Restraint" + t.name + "Desc2", t.func);
		}
	}

	if (typeof KinkyDungeonRefreshRestraintsCache === "function") {
		KinkyDungeonRefreshRestraintsCache();
	}
}

// Auto-register when this module is evaluated after restraints exist.
// If load order is earlier, call RG_Register() from game init explicitly.
if (typeof KinkyDungeonRestraints !== "undefined") {
	try { RG_Register(); } catch (_e) { /* init later */ }
}
