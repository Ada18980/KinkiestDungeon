interface NPCBindingGroup {
	id: string,
	encaseGroup: NPCBindingSubgroup,
	/** Length must equal 3 */
	layers: NPCBindingSubgroup[],
	arousalMode?: boolean,
}

interface NPCBindingSubgroup {
	id: string,
	allowedTags: string[],
	allowedGroups: string[],
	encasedBy: string[],
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
				allowedTags: ["Blindfolds", "Visors"]},
		]},
	{id: "Gag", encaseGroup:
		{id: "Muzzle", encasedBy: ["Hood"], allowedGroups: ["ItemMouth"],
			allowedTags: ["Muzzles", "Wrapping", "Encase"]},
		layers: [
			{id: "OuterGag", encasedBy: ["Hood", "Muzzle"], allowedGroups: ["ItemMouth"],
				allowedTags: ["FlatGags"]},
			{id: "InterGag", encasedBy: ["Hood", "Muzzle", "OuterGag"], allowedGroups: ["ItemMouth"],
				allowedTags: ["FlatGags", "PlugGags", "BallGags"]},
			{id: "InnerGag", encasedBy: ["Hood", "Muzzle", "InterGag", "OuterGag"], allowedGroups: ["ItemMouth"],
				allowedTags: ["FlatGags", "PlugGags", "BallGags", "Stuffing"]},
		]},
	{id: "Arms", encaseGroup:
		{id: "ArmEncase", encasedBy: [], allowedGroups: ["ItemArms"],
			allowedTags: ["Wrapping", "Encase"]},
		layers: [
			{id: "Secure", encasedBy: ["ArmEncase"], allowedGroups: ["ItemArms"],
				allowedTags: ["Petsuits", "Yokes", "Fiddles", "Straitjackets", "RopeReinforce", "Belts"]},
			{id: "HeavyBondage", encasedBy: ["ArmEncase"], allowedGroups: ["ItemArms"],
				allowedTags: ["Petsuits", "Yokes", "Fiddles", "Armbinders", "Boxbinders", "Straitjackets", "Boxties", "Wristties", "Cuffs"]},
			{id: "Wrists", encasedBy: ["ArmEncase", "HeavyBondage"], allowedGroups: ["ItemArms"],
				allowedTags: ["ArmCuffsBase", "ChestHarnesses"]},
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
	{id: "Chest", arousalMode: true, encaseGroup:
		{id: "ChastityBra", encasedBy: [], allowedGroups: ["ItemBreast"],
			allowedTags: ["ChastityBras"]},
		layers: [
			{id: "NippleVibe", encasedBy: ["ChastityBra"], allowedGroups: ["ItemNipples"],
				allowedTags: ["Vibes"]},
			{id: "NippleWeight", encasedBy: ["ChastityBra"], allowedGroups: ["ItemNipples"],
				allowedTags: ["Weights"]},
			{id: "Piercings", encasedBy: ["ChastityBra"], allowedGroups: ["ItemNipples"],
				allowedTags: ["Piercings"]},
		]},
	{id: "Torso", encaseGroup:
		{id: "Corset", encasedBy: [], allowedGroups: ["ItemTorso"],
			allowedTags: ["Corsets"]},
		layers: [
			{id: "Harness", encasedBy: ["Corset",], allowedGroups: ["ItemTorso"],
				allowedTags: ["Mittens", "Tape"]},
			{id: "HarnessExtra", encasedBy: ["Corset", "ArmEncase"], allowedGroups: ["ItemTorso"],
				allowedTags: ["ArmbinderHarness", "BoxbinderHarness", "Leotards", "Swimsuits"]},
			{id: "Suits", encasedBy: [], allowedGroups: ["ItemTorso"],
				allowedTags: ["Catsuits", "Leotards", "Swimsuits"]},
		]},
	{id: "Pelvis", arousalMode: true, encaseGroup:
		{id: "ChastityBelt", encasedBy: [], allowedGroups: ["ItemPelvis"],
			allowedTags: ["ChastityBelts", "Crotchropes"]},
		layers: [
			{id: "Vibe", encasedBy: ["ChastityBelt"], allowedGroups: ["ItemVulvaPiercings"],
				allowedTags: ["Vibes"]},
			{id: "FrontPlug", encasedBy: ["ChastityBelt"], allowedGroups: ["ItemVulva"],
				allowedTags: ["Plugs"]},
			{id: "RearPlug", encasedBy: ["ChastityBelt"], allowedGroups: ["ItemButt"],
				allowedTags: ["Plugs"]},
		]},
	{id: "Legs", encaseGroup:
		{id: "LegEncase", encasedBy: [], allowedGroups: ["ItemLegs"],
			allowedTags: ["Wrapping", "Encase"]},
		layers: [
			{id: "Legbinder", encasedBy: ["LegEncase"], allowedGroups: ["ItemLegs"],
				allowedTags: ["Legbinders", "RopeLegs3", "Belts", "SpreaderBars"]},
			{id: "ThighBinds", encasedBy: ["LegEncase", "Legbinder"], allowedGroups: ["ItemLegs"],
				allowedTags: ["RopeLegs2", "Belts", "Cuffs", "SpreaderBars"]},
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
				allowedTags: ["RopeFeet2", "Belts", "SpreaderBars", "Cuffs"]},
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