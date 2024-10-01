interface NPCBindingGroup {
	id: string,
	encaseGroup: NPCBindingSubgroup,
	/** Length must equal 3 */
	layers: NPCBindingSubgroup[],
}

interface NPCBindingSubgroup {
	id: string,
	allowedTags: string[],
	allowedGroups: string[],
	encasedBy: string[],
	requirePerk?: string,
	noPerk?: string,
}

let NPCBindingRestraintSize = {
	Heels: 3,
	Straitjackets: 2,
	PlugGags: 2,
	Yokes: 2,
	Fiddles: 2,
	Spreaderbars: 2,
	Petsuits: 2,
}
let NPCBindingMouthSlots = [
	"Muzzle",
	"OuterGag",
	"InterGag",
	"InnerGag",
]
let NPCBindingNeckSlots = [
	"Collar",
	"ModulePunish",
	"ModuleUtility",
	"CollarTag",
]

interface KDBondageStats {
	level: number,
	type: string,
	mult: number,
	amount: number,
	/** List of conditions required for this item to be applied (not stay on) */
	conditions?: string[],
	/** List of conditions required for this item to stay on (TODO incomplete) */
	stayconditions?: string[],
}

/**
 *
 * Most items have 1 size
 *
 * Some exceptions:
 *
 * Size 2:
 * Straitjackets
 * Plug Gags
 * Yokes
 * Fiddles
 * Spreaderbars
 * Petsuits
 *
 * Size 3:
 * Heels
 */

let NPCBindingGroups: NPCBindingGroup[] = [
	{id: "Collar", encaseGroup:
		{id: "Collar", encasedBy: [], allowedGroups: ["ItemNeck"],
			allowedTags: ["PostureCollars", "HighCollars", "Collars"]},
		layers: [
			{id: "ModulePunish", encasedBy: [], allowedGroups: ["ItemNeckAccessories", "ItemNeck"],
				allowedTags: ["ModulePunish"]},
			{id: "ModuleUtility", encasedBy: [], allowedGroups: ["ItemNeckAccessories", "ItemNeck"],
				allowedTags: ["ModuleUtility"]},
			{id: "CollarTag", encasedBy: [], allowedGroups: ["ItemNeckRestraints"],
				allowedTags: ["Leashes"]},
		]},
	{id: "Head", encaseGroup:
		{id: "Hood", encasedBy: [], allowedGroups: ["ItemHead"],
			allowedTags: ["Masks", "Hoods", "Wrapping", "Encase"]},
		layers: [
			{id: "OuterHead", encasedBy: ["Hood"], allowedGroups: ["ItemHead"],
				allowedTags: ["Blindfolds", "Earplugs"]},
			{id: "InterHead", encasedBy: ["Hood"], allowedGroups: ["ItemHead"],
				allowedTags: ["Blindfolds"]},
			{id: "InnerHead", encasedBy: ["Hood"], allowedGroups: ["ItemHead"],
				allowedTags: ["Blindfolds", "Tape", "Visors"]},
		]},
	{id: "Gag", encaseGroup:
		{id: "Muzzle", encasedBy: ["Hood"], allowedGroups: ["ItemMouth"],
			allowedTags: ["Muzzles", "Wrapping", "Encase"]},
		layers: [
			{id: "OuterGag", encasedBy: ["Hood", "Muzzle"], allowedGroups: ["ItemMouth"],
				allowedTags: ["FlatGags"]},
			{id: "InterGag", encasedBy: ["Hood", "Muzzle", "OuterGag"], allowedGroups: ["ItemMouth"],
				allowedTags: ["FlatGags", "PlugGags", "BallGags", "Tape"]},
			{id: "InnerGag", encasedBy: ["Hood", "Muzzle", "InterGag", "OuterGag"], allowedGroups: ["ItemMouth"],
				allowedTags: ["PlugGags", "Stuffing"]},
		]},
	{id: "Arms", encaseGroup:
		{id: "ArmEncase", encasedBy: [], allowedGroups: ["ItemArms"],
			allowedTags: ["Wrapping", "Encase"]},
		layers: [
			{id: "Secure", encasedBy: ["ArmEncase"], allowedGroups: ["ItemArms"],
				allowedTags: ["Petsuits", "Yokes", "Fiddles", "Straitjackets", "ChestHarnesses", "Belts", "ElbowLink"]},
			{id: "HeavyBondage", encasedBy: ["ArmEncase"], allowedGroups: ["ItemArms"],
				allowedTags: ["Petsuits", "BindingDress", "Yokes", "Fiddles", "Armbinders", "Boxbinders", "Straitjackets", "Boxties", "Wristties", "Cuffs", "WristLink"]},
			{id: "Wrists", encasedBy: ["ArmEncase", "HeavyBondage"], allowedGroups: ["ItemArms"],
				allowedTags: ["ArmCuffsBase", "IntricateRopeArms"]},
		]},
	{id: "Hands", encaseGroup:
		{id: "HandEncase", encasedBy: ["ArmEncase"], allowedGroups: ["ItemHands"],
			allowedTags: ["Wrapping", "Encase"]},
		layers: [
			{id: "OuterHands", encasedBy: ["ArmEncase", "HandEncase"], allowedGroups: ["ItemHands"],
				allowedTags: ["Mittens"]},
			{id: "InterHands", encasedBy: ["ArmEncase", "HandEncase", "OuterHands"], allowedGroups: ["ItemHands"],
				allowedTags: ["Mittens", "Tape"]},
			{id: "InnerHands", encasedBy: ["ArmEncase", "HandEncase", "InterHands", "OuterHands"], allowedGroups: ["ItemHands"],
				allowedTags: ["Gloves", "Tape"]},
		]},
	{id: "Chest", encaseGroup:
		{id: "ChastityBra", encasedBy: [], allowedGroups: ["ItemBreast"],
			allowedTags: ["ChastityBras"]},
		layers: [
			{id: "NippleVibe", encasedBy: ["ChastityBra"], allowedGroups: ["ItemNipples"],
				allowedTags: ["Vibes"], requirePerk: "arousalMode"},
			{id: "NippleWeight", encasedBy: ["ChastityBra"], allowedGroups: ["ItemNipples"],
				allowedTags: ["Weights"], requirePerk: "arousalMode"},
			{id: "Piercings", encasedBy: ["ChastityBra"], allowedGroups: ["ItemNipples"],
				allowedTags: ["Piercings"], requirePerk: "arousalModePiercing"},
		]},
	{id: "Torso", encaseGroup:
		{id: "Corset", encasedBy: [], allowedGroups: ["ItemTorso"],
			allowedTags: ["Corsets"]},
		layers: [
			{id: "Harness", encasedBy: ["Corset",], allowedGroups: ["ItemTorso"],
				allowedTags: ["Harnesses"]},
			{id: "HarnessExtra", encasedBy: ["Corset", "ArmEncase"], allowedGroups: ["ItemTorso"],
				allowedTags: ["ArmbinderHarness", "BoxbinderHarness", "Leotards", "Swimsuits"]},
			{id: "Suits", encasedBy: [], allowedGroups: ["ItemTorso"],
				allowedTags: ["Suits", "Leotards", "Swimsuits"]},
		]},
	{id: "Pelvis", encaseGroup:
		{id: "ChastityBelt", encasedBy: [], allowedGroups: ["ItemPelvis"],
			allowedTags: ["ChastityBelts", "RopeCrotch", "Panties"]},
		layers: [
			{id: "Vibe", encasedBy: ["ChastityBelt"], allowedGroups: ["ItemVulvaPiercings"],
				allowedTags: ["Vibes"], requirePerk: "arousalMode"},
			{id: "FrontPlug", encasedBy: ["ChastityBelt"], allowedGroups: ["ItemVulva"],
				allowedTags: ["Plugs"], requirePerk: "arousalMode", noPerk: "arousalModePlugNoFront"},
			{id: "RearPlug", encasedBy: ["ChastityBelt"], allowedGroups: ["ItemButt"],
				allowedTags: ["Plugs"], requirePerk: "arousalModePlug"},
		]},
	{id: "Legs", encaseGroup:
		{id: "LegEncase", encasedBy: [], allowedGroups: ["ItemLegs"],
			allowedTags: ["Wrapping", "Encase"]},
		layers: [
			{id: "Legbinder", encasedBy: ["LegEncase"], allowedGroups: ["ItemLegs"],
				allowedTags: ["Legbinders", "RopeLegs3", "Belts", "SpreaderBars"]},
			{id: "ThighBinds", encasedBy: ["LegEncase", "Legbinder"], allowedGroups: ["ItemLegs"],
				allowedTags: ["RopeLegs2", "Belts", "Cuffs", "SpreaderBars", "ThighLink"]},
			{id: "ThighCuffs", encasedBy: ["LegEncase", "Legbinder"], allowedGroups: ["ItemLegs"],
				allowedTags: ["RopeLegs1", "Belts", "LegCuffsBase"]},
		]},
	{id: "Ankles", encaseGroup:
		{id: "FeetEncase", encasedBy: [], allowedGroups: ["ItemFeet"],
			allowedTags: ["Wrapping", "Encase"]},
		layers: [
			{id: "Knees", encasedBy: ["FeetEncase"], allowedGroups: ["ItemFeet"],
				allowedTags: ["RopeFeet3", "Belts", "SpreaderBars"]},
			{id: "Shins", encasedBy: ["FeetEncase"], allowedGroups: ["ItemFeet"],
				allowedTags: ["RopeFeet2", "Belts", "SpreaderBars", "Cuffs", "Hogties", "AnkleLink"]},
			{id: "AnkleCuffs", encasedBy: ["FeetEncase"], allowedGroups: ["ItemFeet"],
				allowedTags: ["RopeFeet1", "Belts", "AnkleCuffsBase"]},
		]},
	{id: "Boots", encaseGroup:
		{id: "BootsEncase", encasedBy: [], allowedGroups: ["ItemBoots"],
			allowedTags: ["Wrapping", "Encase"]},
		layers: [
			{id: "Heels", encasedBy: ["FeetEncase"], allowedGroups: ["ItemBoots"],
				allowedTags: ["Heels"]},
			{id: "ToeTies", encasedBy: ["FeetEncase"], allowedGroups: ["ItemBoots"],
				allowedTags: ["Heels", "Ties"]},
			{id: "ToeCuffs", encasedBy: ["FeetEncase"], allowedGroups: ["ItemBoots"],
				allowedTags: ["Heels", "Cuffs"]},
		]},
];



let KDBondageConditions: Record<string, (r: restraint, id: number, willing: boolean) => boolean> = {
	HeavyBondage: (r, id, willing) => {
		if (willing) return true;
		if (r.quickBindCondition) return true;
		if (r.quickBindCondition) return true;
		let enemy = KDGetGlobalEntity(id);
		if (!enemy) return false; // Must create an entity
		return enemy.stun >= 3 || enemy.freeze >= 3 || KDBoundEffects(enemy) > 3;
	},
	Extra: (r, id, willing) => {
		if (r.quickBindCondition) return true;
		let NPC = KDGetGlobalEntity(id);
		if (NPC) {
			KDQuickGenNPC(NPC, false);
			let npcSprite = KDNPCChar.get(id);
			if (npcSprite) {
				if (!NPCTags.get(npcSprite)) {
					NPCTags.set(npcSprite, new Map());
					NPCTags.set(npcSprite, KinkyDungeonUpdateRestraints(npcSprite, id, 0));
				}

				if (NPCTags.get(npcSprite)) {
					if (r.requireAllTagsToEquip) {
						for (let tag of r.requireAllTagsToEquip) {
							if (!NPCTags.get(npcSprite).get(tag)) {
								return false;
							}
						}
					}
					if (r.requireSingleTagToEquip) {
						for (let tag of r.requireSingleTagToEquip) {
							if (NPCTags.get(npcSprite).get(tag)) {
								return true;
							}
						}
						return false;
					}
				}

				return true;
			} else {
				return true;
			}

			return true;
		}
		return false;
	},
}


let KDQuickBindConditions: Record<string, (target: entity, player: entity, restraint: restraint, item: item) => boolean> = {
	Handcuffs: (target, player, restraint, item) => {
		return KinkyDungeonIsDisabled(target) || target.vulnerable > 0;
	},
	Stuffing: (target, player, restraint, item) => {
		return KinkyDungeonIsDisabled(target) || target.vulnerable > 0;
	},
	TapeGag: (target, player, restraint, item) => {
		return KinkyDungeonIsDisabled(target) || target.vulnerable > 0;
	},
	TapeBlindfold: (target, player, restraint, item) => {
		return KinkyDungeonIsDisabled(target) || target.vulnerable > 0;
	},
	BallGag: (target, player, restraint, item) => {
		return KinkyDungeonIsDisabled(target) || target.vulnerable > 0 || KDEntityHasFlag(target, "verbalcast");
	},
};