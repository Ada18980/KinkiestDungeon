interface RestraintGenericType {
	/** Name of the raw restraint material */
	raw?: string,
	/** Name of the raw consumable material */
	consumableRaw?: string,
	items: RestraintGenericTypeSlot[],
}

interface RestraintGenericTypeSlot {
	count: number,
	restraint: string,
	icon?: string,
	variant?: string,
	events?: KinkyDungeonEvent[],
	powerbonus?: number,
	inventoryVariant?: string,
}




let KDRestraintGenericTypes: Record<string, RestraintGenericType> = {
	"HempRope": {
		raw: "RopeSnakeRaw",
		items: [
			{count: 1, restraint: "RopeSnakeArmsBoxtie"},
			{count: 1, restraint: "RopeSnakeArmsWrist"},
			{count: 1, restraint: "RopeSnakeCuffs"},
			{count: 1, restraint: "RopeSnakeCuffsAdv"},
			{count: 1, restraint: "RopeSnakeCuffsAdv2"},
			{count: 1, restraint: "RopeSnakeLegs"},
			{count: 1, restraint: "RopeSnakeLegs2"},
			{count: 1, restraint: "RopeSnakeLegs3"},
			{count: 1, restraint: "RopeSnakeFeet"},
			{count: 1, restraint: "RopeSnakeFeet2"},
			{count: 1, restraint: "RopeSnakeFeet3"},
			{count: 1, restraint: "RopeSnakeHogtieLink"},
			{count: 1, restraint: "RopeSnakeToes"},
			{count: 1, restraint: "RopeSnakeCrotch"},
			{count: 1, restraint: "RopeSnakeHarness"},
			{count: 1, restraint: "RopeSnakeBelt"},
		],
	},
	"WeakMagic": {
		raw: "WeakMagicRopeRaw",
		items: [
			{count: 1, restraint: "WeakMagicRopeArmsBoxtie"},
			{count: 1, restraint: "WeakMagicRopeArmsWrist"},
			{count: 1, restraint: "WeakMagicRopeCuffs"},
			{count: 1, restraint: "WeakMagicRopeCuffsAdv"},
			{count: 1, restraint: "WeakMagicRopeCuffsAdv2"},
			{count: 1, restraint: "WeakMagicRopeLegs"},
			{count: 1, restraint: "WeakMagicRopeLegs2"},
			{count: 1, restraint: "WeakMagicRopeLegs3"},
			{count: 1, restraint: "WeakMagicRopeFeet"},
			{count: 1, restraint: "WeakMagicRopeFeet2"},
			{count: 1, restraint: "WeakMagicRopeFeet3"},
			{count: 1, restraint: "WeakMagicRopeHogtieLink"},
			{count: 1, restraint: "WeakMagicRopeToes"},
			{count: 1, restraint: "WeakMagicRopeCrotch"},
			{count: 1, restraint: "WeakMagicRopeHarness"},
			{count: 1, restraint: "WeakMagicRopeBelt"},
		],
	},
	"StrongMagic": {
		raw: "StrongMagicRopeRaw",
		items: [
			{count: 1, restraint: "StrongMagicRopeArmsBoxtie"},
			{count: 1, restraint: "StrongMagicRopeArmsWrist"},
			{count: 1, restraint: "StrongMagicRopeCuffs"},
			{count: 1, restraint: "StrongMagicRopeCuffsAdv"},
			{count: 1, restraint: "StrongMagicRopeCuffsAdv2"},
			{count: 1, restraint: "StrongMagicRopeLegs"},
			{count: 1, restraint: "StrongMagicRopeLegs2"},
			{count: 1, restraint: "StrongMagicRopeLegs3"},
			{count: 1, restraint: "StrongMagicRopeFeet"},
			{count: 1, restraint: "StrongMagicRopeFeet2"},
			{count: 1, restraint: "StrongMagicRopeFeet3"},
			{count: 1, restraint: "StrongMagicRopeHogtieLink"},
			{count: 1, restraint: "StrongMagicRopeToes"},
			{count: 1, restraint: "StrongMagicRopeCrotch"},
			{count: 1, restraint: "StrongMagicRopeHarness"},
			{count: 1, restraint: "StrongMagicRopeBelt"},
		],
	},
	"MithrilRope": {
		raw: "MithrilRopeRaw",
		items: [
			{count: 1, restraint: "MithrilRopeArmsBoxtie"},
			{count: 1, restraint: "MithrilRopeArmsWrist"},
			{count: 1, restraint: "MithrilRopeCuffs"},
			{count: 1, restraint: "MithrilRopeCuffsAdv"},
			{count: 1, restraint: "MithrilRopeCuffsAdv2"},
			{count: 1, restraint: "MithrilRopeLegs"},
			{count: 1, restraint: "MithrilRopeLegs2"},
			{count: 1, restraint: "MithrilRopeLegs3"},
			{count: 1, restraint: "MithrilRopeFeet"},
			{count: 1, restraint: "MithrilRopeFeet2"},
			{count: 1, restraint: "MithrilRopeFeet3"},
			{count: 1, restraint: "MithrilRopeHogtieLink"},
			{count: 1, restraint: "MithrilRopeToes"},
			{count: 1, restraint: "MithrilRopeCrotch"},
			{count: 1, restraint: "MithrilRopeHarness"},
			{count: 1, restraint: "MithrilRopeBelt"},
		],
	},
	"CelestialRope": {
		raw: "CelestialRopeRaw",
		items: [
			{count: 1, restraint: "CelestialRopeArmsBoxtie"},
			{count: 1, restraint: "CelestialRopeArmsWrist"},
			{count: 1, restraint: "CelestialRopeCuffs"},
			{count: 1, restraint: "CelestialRopeCuffsAdv"},
			{count: 1, restraint: "CelestialRopeCuffsAdv2"},
			{count: 1, restraint: "CelestialRopeLegs"},
			{count: 1, restraint: "CelestialRopeLegs2"},
			{count: 1, restraint: "CelestialRopeLegs3"},
			{count: 1, restraint: "CelestialRopeFeet"},
			{count: 1, restraint: "CelestialRopeFeet2"},
			{count: 1, restraint: "CelestialRopeFeet3"},
			{count: 1, restraint: "CelestialRopeHogtieLink"},
			{count: 1, restraint: "CelestialRopeToes"},
			{count: 1, restraint: "CelestialRopeCrotch"},
			{count: 1, restraint: "CelestialRopeHarness"},
			{count: 1, restraint: "CelestialRopeBelt"},
		],
	},
	"Slime": {
		raw: "SlimeRaw",
		items: [
			{count: 1, restraint: "SlimeHead"},
			{count: 1, restraint: "SlimeMouth"},
			{count: 2, restraint: "SlimeArms"},
			{count: 1, restraint: "SlimeHands"},
			{count: 1, restraint: "SlimeLegs"},
			{count: 1, restraint: "SlimeFeet"},
			{count: 1, restraint: "SlimeBoots"},
		],
	},
	"HardSlime": {
		raw: "HardSlimeRaw",
		items: [
			{count: 1, restraint: "HardSlimeHead"},
			{count: 1, restraint: "HardSlimeMouth"},
			{count: 2, restraint: "HardSlimeArms"},
			{count: 1, restraint: "HardSlimeHands"},
			{count: 1, restraint: "HardSlimeLegs"},
			{count: 1, restraint: "HardSlimeFeet"},
			{count: 1, restraint: "HardSlimeBoots"},
		],
	},
	"ProtoSlime": {
		raw: "ProtoSlimeRaw",
		items: [
			{count: 1, restraint: "ProtoSlimeHead"},
			{count: 1, restraint: "ProtoSlimeMouth"},
			{count: 2, restraint: "ProtoSlimeArms"},
			{count: 1, restraint: "ProtoSlimeHands"},
			{count: 1, restraint: "ProtoSlimeLegs"},
			{count: 1, restraint: "ProtoSlimeFeet"},
			{count: 1, restraint: "ProtoSlimeBoots"},
		],
	},
	"HardProtoSlime": {
		raw: "HardProtoSlimeRaw",
		items: [
			{count: 1, restraint: "HardProtoSlimeHead"},
			{count: 1, restraint: "HardProtoSlimeMouth"},
			{count: 2, restraint: "HardProtoSlimeArms"},
			{count: 1, restraint: "HardProtoSlimeHands"},
			{count: 1, restraint: "HardProtoSlimeLegs"},
			{count: 1, restraint: "HardProtoSlimeFeet"},
			{count: 1, restraint: "HardProtoSlimeBoots"},
		],
	},
	"DuctTape": {
		raw: "DuctTapeRaw",
		items: [
			{count: 1, restraint: "DuctTapeHands"},
		],
	},
	"Charms": {
		raw: "CharmRaw",
		items: [
			{count: 1, restraint: "DuctTapeArms"},
			{count: 1, restraint: "DuctTapeFeet"},
			{count: 1, restraint: "DuctTapeBoots"},
			{count: 1, restraint: "DuctTapeLegs"},
			{count: 1, restraint: "DuctTapeHead"},
			{count: 1, restraint: "DuctTapeMouth"},
			{count: 2, restraint: "DuctTapeHeadMummy"},
			{count: 2, restraint: "DuctTapeArmsMummy"},
			{count: 2, restraint: "DuctTapeLegsMummy"},
			{count: 2, restraint: "DuctTapeFeetMummy"},
		],
	},
	"MysticDuctTape": {
		raw: "MysticDuctTapeRaw",
		items: [
			{count: 1, restraint: "MysticDuctTapeHands"},
			{count: 1, restraint: "MysticDuctTapeHead"},
			{count: 1, restraint: "MysticDuctTapeEyes"},
			{count: 1, restraint: "MysticDuctTapeMouth"},
			{count: 2, restraint: "MysticDuctTapeArmsMummy"},
			{count: 2, restraint: "MysticDuctTapeLegsMummy"},
			{count: 2, restraint: "MysticDuctTapeFeetMummy"},
			{count: 2, restraint: "MysticDuctTapeBoots"},
		],
	},
	"AutoTape": {
		raw: "AutoTapeRaw",
		items: [
			{count: 1, restraint: "AutoTapeHands"},
			{count: 1, restraint: "AutoTapeArms"},
			{count: 1, restraint: "AutoTapeFeet"},
			{count: 1, restraint: "AutoTapeBoots"},
			{count: 1, restraint: "AutoTapeLegs"},
			{count: 1, restraint: "AutoTapeHead"},
			{count: 1, restraint: "AutoTapeMouth"},
		],
	},
	"VinylTape": {
		raw: "VinylTapeRaw",
		items: [
			{count: 1, restraint: "VinylTapeHands"},
			{count: 1, restraint: "VinylTapeArms"},
			{count: 1, restraint: "VinylTapeFeet"},
			{count: 1, restraint: "VinylTapeBoots"},
			{count: 1, restraint: "VinylTapeLegs"},
			{count: 1, restraint: "VinylTapeHead"},
			{count: 1, restraint: "VinylTapeMouth"},
			{count: 2, restraint: "VinylTapeHeadMummy"},
			{count: 2, restraint: "VinylTapeArmsMummy"},
			{count: 2, restraint: "VinylTapeLegsMummy"},
			{count: 2, restraint: "VinylTapeFeetMummy"},
		],
	},
	"Ribbon": {
		raw: "RibbonRaw",
		items: [
			{count: 1, restraint: "RibbonArms"},
			{count: 1, restraint: "RibbonLegs"},
			{count: 1, restraint: "RibbonFeet"},
			{count: 1, restraint: "RibbonHarness"},
			{count: 1, restraint: "RibbonCrotch"},
			{count: 1, restraint: "RibbonHands"},
			{count: 1, restraint: "RibbonMouth"},
		],
	},
};

let KDGenericRestraintRawCache: Record<string, {raw: string, count: number}> = {};
let KDGenericRestraintRawOriginalCache: Record<string, {name: string, count: number}[]> = {};

function KDRefreshRawCache() {
	KDGenericRestraintRawCache = {};
	for (let mat of Object.values(KDRestraintGenericTypes)) {
		let raw = mat.raw;
		if (!KDGenericRestraintRawOriginalCache[mat.raw] )
			KDGenericRestraintRawOriginalCache[mat.raw] = [];
		for (let item of mat.items) {
			KDGenericRestraintRawCache[item.restraint] = {
				count: item.count,
				raw: raw,
			};
			KDGenericRestraintRawOriginalCache[mat.raw].push(
				{
					name: item.restraint,
					count: item.count,
				}
			);
		}
	}
}

KDRefreshRawCache();