"use strict";

let KDBasicArmorWeight = 2.8;
let KDBasicArmorWeight_Cursed = 0.4;
let KDBasicArmorWeight_Enchanted = 0.6;
let KDEnchantedRestraintsWeight = 1.0;
let KDAdvancedArmorWeight = 1.5;
let KDAdvancedArmorWeight_Cursed = 2.0;
let KDAdvancedArmorWeight_Enchanted = 2.5;

let KD_hexchance_Default = 0.35;
let KD_enchantchance_Default = 0.8;

let KD_hexchance_EnchantedRestraints = 0.3;

let KDBasicArmor = [
	{name: "Breastplate", minLevel: 0, weight: KDBasicArmorWeight,
		armor: "Breastplate",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_Default, enchantchance: KD_enchantchance_Default, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		nouncursed: ["Breastplate"], message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "Bustier", minLevel: 0, weight: KDBasicArmorWeight,
		armor: "Bustier",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_Default, enchantchance: KD_enchantchance_Default, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		nouncursed: ["Bustier"], message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "ChainTunic", minLevel: 0, weight: KDBasicArmorWeight * 0.7,
		armor: "ChainTunic",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_Default, enchantchance: KD_enchantchance_Default, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		nouncursed: ["ChainTunic"], message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "Bracers", minLevel: 0, weight: KDBasicArmorWeight,
		armor: "Bracers",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_Default, enchantchance: KD_enchantchance_Default, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		nouncursed: ["Bracers"], message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "LeatherGloves", minLevel: 0, weight: KDBasicArmorWeight,
		armor: "LeatherGloves",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_Default, enchantchance: KD_enchantchance_Default, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		nouncursed: ["LeatherGloves"], message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "Gauntlets", minLevel: 0, weight: KDBasicArmorWeight,
		armor: "Gauntlets",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_Default, enchantchance: KD_enchantchance_Default, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		nouncursed: ["Gauntlets"], message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "SteelBoots", minLevel: 0, weight: KDBasicArmorWeight,
		armor: "SteelBoots",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_Default, enchantchance: KD_enchantchance_Default, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		nouncursed: ["SteelBoots"], message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "LeatherBoots", minLevel: 0, weight: KDBasicArmorWeight,
		armor: "LeatherBoots",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_Default, enchantchance: KD_enchantchance_Default, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		nouncursed: ["LeatherBoots"], message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
];
let KDAdvancedArmor = [
	{name: "SteelArmor", minLevel: 0, weight: KDAdvancedArmorWeight,
		armor: "SteelArmor",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_Default, enchantchance: KD_enchantchance_Default, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		nouncursed: ["SteelArmor"], message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "SteelSkirt", minLevel: 0, weight: KDAdvancedArmorWeight,
		armor: "SteelSkirt",
		hexlist: "Common",
		enchantlist: "Common", hexchance: KD_hexchance_Default, enchantchance: KD_enchantchance_Default, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		nouncursed: ["SteelSkirt"], message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "MageArmor", minLevel: 0, weight: KDAdvancedArmorWeight,
		armor: "MageArmor",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_Default, enchantchance: KD_enchantchance_Default, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		nouncursed: ["MageArmor"], message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
];
let KDGoldArmor = [...JSON.parse(JSON.stringify(KDAdvancedArmor)), ...JSON.parse(JSON.stringify(KDBasicArmor))];
for (let armor of KDGoldArmor) {
	armor.enchantlist = "Gold";
	armor.amtMult = 2;
	armor.weight *= 0.2;
}
let KDGoldArmor2 = [...JSON.parse(JSON.stringify(KDAdvancedArmor)), ...JSON.parse(JSON.stringify(KDBasicArmor))];
for (let armor of KDGoldArmor2) {
	armor.enchantlist = "Common";
	armor.minEnchants = 2;
	armor.maxEnchants = 3;
	armor.amtMult = 1.5;
	armor.weight *= 0.2;
}
let KDSilverArmor = [...JSON.parse(JSON.stringify(KDBasicArmor))];
for (let armor of KDSilverArmor) {
	armor.amtMult = 1.4;
	armor.maxEnchants = 2;
}

let KDEnchantedRestraints = [
	{name: "TrapRestraints", minLevel: 0, weight: KDEnchantedRestraintsWeight*2,
		armortags: ["trap"], armor: "TrapGag", // Backup to a gag
		cursesuffix: "",
		maxEnchants: 2,
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_EnchantedRestraints, enchantchance: 1, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "LatexRestraints", minLevel: 0, weight: KDEnchantedRestraintsWeight*2.5,
		armortags: ["latexRestraintsHeavy", "latexRestraints"], armor: "LatexBallGag",
		cursesuffix: "",
		amtMult: 1.5,
		maxEnchants: 2,
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_EnchantedRestraints, enchantchance: 1, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "LeatherRestraints", minLevel: 0, weight: KDEnchantedRestraintsWeight*3,
		armortags: ["leatherRestraintsHeavy"], armor: "TrapGag",
		cursesuffix: "",
		amtMult: 1.5,
		maxEnchants: 2,
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_EnchantedRestraints, enchantchance: 1, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "MagicRopes", minLevel: 0, weight: KDEnchantedRestraintsWeight*0.25,
		armortags: ["weakMagicRopes"], armor: "TrapGag",
		cursesuffix: "",
		amtMult: 2.5,
		hexlist: "Common", enchantlist: "Common", hexchance: 1.0, enchantchance: 1, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
];

let KDShadowRestraints = [...JSON.parse(JSON.stringify(KDEnchantedRestraints)),
	{name: "CursedToys", minLevel: 0, weight: KDEnchantedRestraintsWeight*1,
		armortags: ["genericToys", "plugSpell"], armor: "SteelPlugF",
		arousalMode: true,
		amtMult: 2,
		forceEquip: true,
		cursesuffix: "",
		hexlist: "Common", enchantlist: "Common", hexchance: 1.0, enchantchance: 1, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "Moon", minLevel: 0, weight: KDEnchantedRestraintsWeight*1,
		armortags: ["shadowLatexRestraints", "shadowLatexRestraintsHeavy", "obsidianRestraints"], armor: "SteelPlugF",
		arousalMode: true,
		amtMult: 2,
		maxEnchants: 3,
		forceEquip: true,
		cursesuffix: "",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_EnchantedRestraints, enchantchance: 1, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
	{name: "Star", minLevel: 0, weight: KDEnchantedRestraintsWeight*1,
		armortags: ["liquidMetalRestraintsRandom", "shadowLatexRestraintsHeavy", "mithrilRestraints"], armor: "SteelPlugF",
		arousalMode: true,
		amtMult: 2,
		maxEnchants: 3,
		forceEquip: true,
		cursesuffix: "",
		hexlist: "Common", enchantlist: "Common", hexchance: KD_hexchance_EnchantedRestraints, enchantchance: 1, alwaysenchanthex: true,
		unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
		message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},

];
for (let armor of KDShadowRestraints) {
	armor.amtMult = (armor.amtMult || 1) * 1.5;
	armor.maxEnchants = (armor.maxEnchants || 1) + 1;
	armor.forceEquip = true;
}

let KinkyDungeonLootTable = {
	"rubble": [
		//{name: "nothing", minLevel: 0, weight:9, message:"LootRubbleFail", messageColor:"#aaaaaa", messageTime: 2, allFloors: true},
		{name: "smallgold", minLevel: 0, weight:12, message:"LootRubbleSmallGold", messageColor:"yellow", messageTime: 3, allFloors: true},
		{name: "pick", minLevel: 0, weight:2.5, message:"LootRubbleLockpick", messageColor:"lightgreen", messageTime: 3, allFloors: true, prerequisites: ["fewpick"],},
		{name: "redkey", key: true, minLevel: 0, weight:1, message:"LootRubbleRedKey", messageColor:"lightgreen", messageTime: 3, allFloors: true},
		//{name: "greenkey", minLevel: 2, weight:2, message:"LootRubbleGreenKey", messageColor:"lightgreen", messageTime: 3, allFloors: true},
		//{name: "bluekey", key: true, minLevel: 2, weight:0.33, message:"LootRubbleBlueKey", messageColor:"lightgreen", messageTime: 3, allFloors: true},
		{name: "potion_mana", minLevel: 0, weight:3, message:"LootPotionMana", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "potion_will", minLevel: 0, weight:1, message:"LootPotionWill", messageColor:"#ff4444", messageTime: 3, allFloors: true},
		{name: "potion_stamina", minLevel: 0, weight:4, message:"LootPotionStamina", messageColor:"lightgreen", messageTime: 3, allFloors: true},
		{name: "potion_frigid", minLevel: 0, weight:2, message:"LootPotionFrigid", messageColor:"lightgreen", messageTime: 3, allFloors: true},


		{name: "AncientCoreSingle", minLevel: 0, weight:0.1, count: 1, message:"LootChestAncientCoreSingle", messageColor:"yellow", messageTime: 3, allFloors: true},
		{name: "AncientCoreSingleSpent", minLevel: 0, weight:2, count: 1, message:"LootChestAncientCoreSingleSpent", messageColor:"yellow", messageTime: 3, allFloors: true},

		{name: "knife", minLevel: 0, weight:3, message:"LootRubbleKnife", messageColor:"lightgreen", messageTime: 3, allFloors: true, noweapon: ["Knife"]},
		{name: "Torch", minLevel: 0, weight:7, weapon: "Torch", noweapon: ["Torch"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "Rope", minLevel: 0, weight:10, weapon: "Rope", noweapon: ["Rope"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "Scissors", minLevel: 0, weight:3, weapon: "Scissors", noweapon: ["Scissors"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "BagOfGoodies", arousalMode: true, minLevel: 0, weight:1.0, weapon: "BagOfGoodies", noweapon: ["BagOfGoodies"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
	],
	"shelf": [
		{name: "redkey", key: true, minLevel: 1, weight:1, message:"LootBookshelfKey", messageColor:"lightgreen", messageTime: 3, allFloors: true},
		{name: "bluekey", key: true, minLevel: 0, weight:0.33, message:"LootBookshelfBlueKey", messageColor:"lightgreen", messageTime: 3, allFloors: true},
		{name: "scroll_arms", minLevel: 0, weight:1, message:"LootBookshelfScroll", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "scroll_legs", minLevel: 0, weight:1, message:"LootBookshelfScroll", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "scroll_verbal", minLevel: 0, weight:1, message:"LootBookshelfScroll", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "trap_book", minLevel: 1, weight:5, message:"LootBookshelfTrap", messageColor:"#ff0000", messageTime: 3, allFloors: true},
	],
	"pearl": [
		{name: "pearlReward", minLevel: 0, weight:1, message:"LootPearlChest", messageColor:"lightblue", messageTime: 3, allFloors: true, prerequisites: ["pearlChest"],},
	],
	"shadow": [
		{name: "slimeThrower", minLevel: 0, weapon: "Slimethrower", weight:2, message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["Slimethrower"]},
		{name: "StaffDoll", minLevel: 0, weapon: "StaffDoll", weight:2, message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["StaffDoll"]},
		{name: "staff_incineration", minLevel: 0, weight:.5, weapon: "StaffIncineration", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["StaffIncineration"]},
		{name: "staff_storms", minLevel: 0, weight:.5, weapon: "StaffStorm", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["StaffStorm"]},
		{name: "staff_frostbite", minLevel: 0, weight:.5, weapon: "StaffFrostbite", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["StaffFrostbite"]},
		{name: "staff_bind", minLevel: 0, weight:.5, weapon: "StaffBind", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["StaffBind"]},
		{name: "AncientCores", minLevel: 0, weight:0.5, message:"LootChestAncientCores", messageColor:"yellow", messageTime: 3, allFloors: true, max: 1},
		{name: "bluekey", minLevel: 0, weight:0.5, message:"LootChestBlueKey", messageColor:"lightblue", messageTime: 3, allFloors: true},
		//{name: "spell_points", magic: true, minLevel: 0, weight:5, message:"LootChestSpellPoints", messageColor:"lightblue", messageTime: 3, allFloors: true, max: 1},
		...KDShadowRestraints,
	],
	"kitty": [
		{name: "CursedPetsuit", minLevel: 0, weight: 10,
			armor: "KittyPetSuit",
			amtMult: 4,
			maxEnchants: 3,
			forceEquip: true,
			cursesuffix: "",
			hexlist: "Common", enchantlist: "Common", hexchance: 0.5, enchantchance: 1, alwaysenchanthex: true,
			unlockcurse: ["Common"], hexlevelmin: 0, hexlevelmax: 10, enchantlevelmin: 0, enchantlevelmax: 10,
			message:"LootChestArmor", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "staff_incineration", minLevel: 0, weight:4, weapon: "StaffIncineration", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["StaffIncineration"]},
		{name: "StaffBind", minLevel: 0, weight:4, weapon: "StaffBind", goddess: "Rope", goddessWeight: 2.75, noweapon: ["StaffBind"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "MistressKey", minLevel: 0, weight:2, message:"LootChestMistressKey", messageColor:"yellow", messageTime: 3, allFloors: true},
		{name: "grinder", minLevel: 1, weight:4, message:"LootChestGrinder", messageColor:"yellow", messageTime: 3, allFloors: true},
	],
	"lessershadow": [
		//{name: "AncientCores", minLevel: 0, weight:1.5, message:"LootChestAncientCores", messageColor:"yellow", messageTime: 3, allFloors: true, max: 1},
		//{name: "bluekey", minLevel: 0, weight:1.0, message:"LootChestBlueKey", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "pick", minLevel: 0, weight:2.5, message:"LootRubbleLockpick", messageColor:"lightgreen", messageTime: 3, allFloors: true, prerequisites: ["fewpick"],},
		//{name: "redkey", key: true, minLevel: 0, weight:1, message:"LootRubbleRedKey", messageColor:"lightgreen", messageTime: 3, allFloors: true},
		{name: "potions_many", minLevel: 0, weight:3, message:"LootPotionsMedley", messageColor:"lightblue", messageTime: 3, allFloors: true, prerequisites: ["lowpotions"]},
		{name: "magicknife", minLevel: 0, weight:1.5, weapon: "EnchKnife", message:"LootChestMagicKnife", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["EnchKnife"]},
		...KDShadowRestraints,
	],
	"storage": [
		{name: "redkey", key: true, minLevel: 0, weight:1, message:"LootChestRedKey", messageColor:"lightgreen", messageTime: 3, allFloors: true},
		{name: "bola", minLevel: 0, weight:3, message:"LootChestBola", messageColor:"lightgreen", messageTime: 3, allFloors: true},
		{name: "bomb", minLevel: 0, weight:2, message:"LootChestBomb", messageColor:"lightgreen", messageTime: 3, allFloors: true},
		{name: "rope", minLevel: 0, weight:1, weapon: "Rope", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["Rope"]},
	],
	"blue": [
		{name: "spell_points", magic: true, minLevel: 0, weight:1, message:"LootChestSpellPoints", messageColor:"lightblue", messageTime: 3, allFloors: true, max: 1},
	],
	"tutorial1": [
		{name: "trap_cuffs", minLevel: 0, weight:1, lock: "Red", message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemArms"], power: 2},
	],
	"tutorial2": [
		{name: "trap_armbinder", minLevel: 0, weight:1, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemArms"], power: 6},
	],
	"chest": [
		{name: "ArrowFireSpell", spell: "ArrowFireSpell", nospell: ["ArrowFireSpell"], minLevel: 0, weight: 1.25, message:"LootChestSpell", messageColor:"lightblue", messageTime: 3, allFloors: true, prerequisite: ["hasBow"]},
		{name: "ArrowVineSpell", spell: "ArrowVineSpell", nospell: ["ArrowVineSpell"], minLevel: 0, weight: 1.25, message:"LootChestSpell", messageColor:"lightblue", messageTime: 3, allFloors: true, prerequisite: ["hasBow"]},

		{name: "archerykit", minLevel: 0, weight: 4, noweapon: ["Bow"], message:"LootArcheryKit", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "gold", minLevel: 0, weight:1, message:"LootChestGold", messageColor:"#ffff00", messageTime: 3, allFloors: true},
		{name: "magicknife", minLevel: 0, weight:1.5, weapon: "EnchKnife", message:"LootChestMagicKnife", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["EnchKnife"]},
		{name: "bluekey", redspecial: 8.5, key: true, minLevel: 3, weight:0.65, message:"LootChestBlueKey", messageColor:"lightgreen", messageTime: 3, allFloors: true},
		{name: "weapon_boltcutters", minLevel: 5, weight:0.7, message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["BoltCutters"]},
		{name: "hammer", minLevel: 0, weight:1, weapon: "Hammer", noweapon: ["Hammer"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "flail", minLevel: 0, weight:1, weapon: "Flail", noweapon: ["Flail"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "axe", minLevel: 0, weight:1, weapon: "Axe", noweapon: ["Axe"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "spear", minLevel: 0, weight:1, weapon: "Spear", noweapon: ["Spear"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "ShieldTower", minLevel: 0, weight:1.5, weapon: "ShieldTower", noweapon: ["ShieldTower"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "ShieldReinforced", minLevel: 0, weight:1.0, weapon: "ShieldReinforced", noweapon: ["ShieldReinforced"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "ShieldMagic", minLevel: 0, weight:1.0, weapon: "ShieldMagic", noweapon: ["ShieldMagic"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		//{name: "sword", minLevel: 0, weight:1, weapon: "Sword", noweapon: ["Sword"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "SlimeSword", minLevel: 0, weight:1, weapon: "SlimeSword", noweapon: ["SlimeSword"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "ChainSword", minLevel: 0, weight:1, weapon: "ChainSword", noweapon: ["ChainSword"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "Dirk", minLevel: 0, weight:1, weapon: "Dirk", noweapon: ["Dirk"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "Foil", minLevel: 0, weight:0.5, weapon: "Foil", noweapon: ["Foil"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "Crossbow", minLevel: 0, weight:1.5, weapon: "Crossbow", noweapon: ["Crossbow"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "BagOfGoodies", arousalMode: true, minLevel: 0, weight:0.5, weapon: "BagOfGoodies", noweapon: ["BagOfGoodies"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "VibeRemote", arousalMode: true, minLevel: 0, weight:0.5, weapon: "VibeRemote", noweapon: ["VibeRemote"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		...KDBasicArmor,
		/*{name: "trap_armbinder", trap: true, minLevel: 1, weight:2, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemArms", "ModerateRestraint"], power: 6},
		{name: "trap_armbinderHeavy", minLevel: 1, weight:2, message:"LootChestTrapMagicHarness", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemArms", "ModerateRestraint"], submissive: 15, power: 8},
		{name: "trap_cuffs", trap: true, minLevel: 1, weight:1, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemArms"], power: 2},
		{name: "trap_harness", trap: true, minLevel: 1, weight:2, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemTorso"], power: 4},
		{name: "trap_gag", trap: true, minLevel: 1, weight:3, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemMouth"], power: 6},
		{name: "trap_blindfold", trap: true, minLevel: 1, weight:2, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemHead"], power: 6},
		{name: "trap_boots", trap: true, minLevel: 1, weight:1.5, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemBoots"], power: 6},
		{name: "trap_legirons", trap: true, minLevel: 1, weight:1, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemFeet"], power: 8},
		{name: "trap_beltonly", arousalMode: true, trap: true, minLevel: 1, weight:3, message:"LootChestTrapMagicBelt", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemPelvis"], power: 5},
		{name: "trap_belt", arousalMode: true, trap: true, minLevel: 1, weight:1.5, message:"LootChestTrapMagicVibe", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemVulvaPiercings", "alreadyBelted", "vibe"], power: 1},
		*/
		{name: "trap_plug", arousalMode: true, trap: true, minLevel: 1, weight:1.5, message:"LootChestTrapMagicPlug", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemVulva", "alreadyBelted", "vibe"], power: 3},
		{name: "trap_nipple", arousalMode: true, trap: true, minLevel: 1, weight:1.5, message:"LootChestTrapMagicNipple", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemNipples", "alreadyBelted", "vibe"], power: 3},
		//{name: "trap_mitts", trap: true, minLevel: 7, weight:2, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemHands", "LightRestraint"], power: 10},
		{name: "potions_mana", minLevel: 0, weight:1, message:"LootPotionsMana", messageColor:"lightblue", messageTime: 3, allFloors: true, prerequisites: ["lowmanapotions"]},
		{name: "manaorb", minLevel: 0, weight:0.25, message:"LootManaOrb", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "potions_will", minLevel: 0, weight:1, message:"LootPotionsWill", messageColor:"#ff4444", messageTime: 3, allFloors: true, prerequisites: ["lowwillpotions"]},
		//{name: "potions_many", minLevel: 1, weight:0.5, message:"LootPotionsMedley", messageColor:"lightblue", messageTime: 3, allFloors: true, prerequisites: ["lowpotions"]},
	],
	"lost_items": [
		{name: "lost_items", minLevel: 0, weight:999999999999, message:"LootCacheLostItems", messageColor:"lightgreen", messageTime: 3, allFloors: true, prerequisites: ["LostItems"]},
	],
	"cache": [
		//{name: "lost_items", minLevel: 0, weight:999999999999, message:"LootCacheLostItems", messageColor:"lightgreen", messageTime: 3, allFloors: true, prerequisites: ["LostItems"]},
		{name: "potions_many", minLevel: 0, weight:0.001, message:"LootPotionsMedley", messageColor:"lightblue", messageTime: 3, allFloors: true},

		{name: "weapon_boltcutters", minLevel: 2, weight:1, message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["BoltCutters"]},
		{name: "flamberge", minLevel: 3, weight:0.8, weapon: "Flamberge", noweapon: ["Flamberge"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "FrostSword", minLevel: 3, weight:0.8, weapon: "FrostSword", noweapon: ["FrostSword"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "Rapier", minLevel: 3, weight:0.8, weapon: "Rapier", noweapon: ["Rapier"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "Katana", minLevel: 3, weight:0.8, weapon: "Katana", noweapon: ["Katana"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},

		{name: "CrossbowHeavy", minLevel: 5, weight:0.8, weapon: "CrossbowHeavy", noweapon: ["CrossbowHeavy"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "Longbow", minLevel: 3, weight:0.8, weapon: "Longbow", noweapon: ["Longbow"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},

		{name: "StaffTape", minLevel: 0, weight:1, weapon: "StaffTape", noweapon: ["StaffTape"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "DildoBatPlus", minLevel: 0, weight:1.0, weapon: "DildoBatPlus", noweapon: ["DildoBatPlus"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},

		{name: "StaffFlame", minLevel: 0, weight:1, weapon: "StaffFlame", noweapon: ["StaffFlame"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "StaffChain", minLevel: 0, weight:1, weapon: "StaffChain", noweapon: ["StaffChain"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "StaffGlue", minLevel: 0, weight:1, weapon: "StaffGlue", noweapon: ["StaffGlue"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "StaffElectric", minLevel: 0, weight:1, weapon: "StaffElectric", noweapon: ["StaffElectric"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "StaffPermafrost", minLevel: 0, weight:1, weapon: "StaffPermafrost", noweapon: ["StaffPermafrost"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},

		{name: "StaffDoll", minLevel: 5, weight:0.25, weapon: "StaffDoll", goddess: "Latex", goddessWeight: 1.25, noweapon: ["StaffDoll"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "StaffIncineration", minLevel: 5, weight:1, weapon: "StaffIncineration", goddess: "Elements", goddessWeight: 0.75, noweapon: ["StaffIncineration"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "StaffStorm", minLevel: 5, weight:1, weapon: "StaffStorm", goddess: "Elements", goddessWeight: 0.75, noweapon: ["StaffStorm"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "StaffFrostbite", minLevel: 5, weight:1, weapon: "StaffElectric", goddess: "Elements", goddessWeight: 0.75, noweapon: ["StaffFrostbite"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "StaffBind", minLevel: 5, weight:1, weapon: "StaffBind", goddess: "Rope", goddessWeight: 2.75, noweapon: ["StaffBind"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},

		{name: "Slimethrower", minLevel: 5, weight:1, weapon: "Slimethrower", goddess: "Latex", goddessWeight: 1.25, noweapon: ["Slimethrower"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},

		...KDAdvancedArmor,
		...KDEnchantedRestraints,
	],
	"magicrestraint": [
		...KDEnchantedRestraints,
	],
	"gold": [
		{name: "MistressKey", minLevel: 0, weight:6, message:"LootChestMistressKey", messageColor:"yellow", messageTime: 3, allFloors: true},
		{name: "AncientCores", max: 1, minLevel: 0, weight:7, count: 3, message:"LootChestAncientCores", messageColor:"yellow", messageTime: 3, allFloors: true, submissive: 50},
		{name: "EnchantedBelt", arousalMode: true, minLevel: 0, weight:4, message:"LootChestEnchantedBelt", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["EnchantedBelt"]},
		{name: "EnchantedBra", arousalMode: true, minLevel: 0, weight:4, message:"LootChestEnchantedBra", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["EnchantedBra"]},
		{name: "EnchantedHeels", minLevel: 0, weight:4, message:"LootChestEnchantedHeels", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["EnchantedHeels"]},
		{name: "EnchantedAnkleCuffs", minLevel: 0, weight:4, message:"LootChestEnchantedAnkleCuffs", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["EnchantedAnkleCuffs", "EnchantedAnkleCuffs2"]},
		{name: "EnchantedBlindfold", minLevel: 3, weight:4, message:"LootChestEnchantedBlindfold", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["EnchantedBlindfold"]},
		{name: "EnchantedMuzzle", minLevel: 0, weight:4, message:"LootChestEnchantedMuzzle", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["EnchantedMuzzle"]},
		{name: "EnchantedMittens", minLevel: 3, weight:4, message:"LootChestEnchantedMittens", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["EnchantedMittens"]},
		{name: "EnchantedArmbinder", minLevel: 5, weight:4, message:"LootChestEnchantedArmbinder", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["EnchantedArmbinder"], submissive: 5},
		{name: "EnchantedBallGag", minLevel: 0, weight:4, message:"LootChestEnchantedBallGag", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["EnchantedBallGag"]},
		{name: "PotionCollar", minLevel: 1, weight:10, message:"LootPotionCollar", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["PotionCollar"]},
		...KDEnchantedRestraints,
	],
	"lessergold": [
		...KDGoldArmor, ...KDGoldArmor2,
		{name: "scrolls_purity", minLevel: 0, weight: 1, message:"LootChestScrollsPurity", messageColor:"yellow", messageTime: 3, allFloors: true},
		{name: "MistressKey", minLevel: 0, weight:1, message:"LootChestMistressKey", messageColor:"yellow", messageTime: 3, allFloors: true},
		{name: "DivineTear", minLevel: 0, weight:5, message:"LootChestDivineTear", messageColor:"yellow", messageTime: 3, allFloors: true},
		{name: "AncientCores", max: 1, minLevel: 0, weight:3, message:"LootChestAncientCores", messageColor:"yellow", messageTime: 3, allFloors: true},
		{name: "magicknife", minLevel: 0, weight:7, weapon: "EnchKnife", message:"LootChestMagicKnife", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["EnchKnife"]},
		{name: "Scrolls", minLevel: 0, weight:2, message:"LootChestScrolls", messageColor:"yellow", messageTime: 3, allFloors: true},
		//{name: "spell_points", magic: true, minLevel: 3, weight: 3, message:"LootChestSpellPoints", messageColor:"lightblue", messageTime: 3, special:100, allFloors: true, max: 1},
		{name: "manaorbmany", minLevel: 0, weight:1, message:"LootManaOrbMany", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "MagicSword", minLevel: 3, weight:0.33, weapon: "MagicSword", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3,
			allFloors: true, noweapon: ["MagicSword"]},
		{name: "MagicAxe", minLevel: 3, weight:0.33, weapon: "MagicAxe", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3,
			allFloors: true, noweapon: ["MagicAxe"]},
		{name: "MagicSpear", minLevel: 3, weight:0.33, weapon: "MagicSpear", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3,
			allFloors: true, noweapon: ["MagicSpear"]},
		{name: "MagicFlail", minLevel: 3, weight:0.33, weapon: "MagicFlail", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3,
			allFloors: true, noweapon: ["MagicFlail"]},
		{name: "MagicHammer", minLevel: 3, weight:0.33, weapon: "MagicHammer", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3,
			allFloors: true, noweapon: ["MagicHammer"]},
		{name: "IceBreaker", minLevel: 2, weight:0.33, weapon: "IceBreaker", goddess: "Elements", goddessWeight: 3, message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3,
			allFloors: true, noweapon: ["IceBreaker"]},
		{name: "StormBreaker", minLevel: 2, weight:0.33, weapon: "StormBreaker", goddess: "Elements", goddessWeight: 3, message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3,
			allFloors: true, noweapon: ["StormBreaker"]},
		{name: "DarkKatana", minLevel: 2, weight:0.33, goddess: "Illusion", goddessWeight: 6, weapon: "DarkKatana", message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3,
			allFloors: true, noweapon: ["DarkKatana"]},
		//{name: "trap_protobelt", arousalMode: true, trap: true, minLevel: 9, goddess: "Metal", goddessWeight: 4, weight:0, message:"LootChestTrapMagicVibe", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemVulvaPiercings"], power: 15},
		{name: "trap_plug2", arousalMode: true, trap: true, minLevel: 6, weight:1.5, message:"LootChestTrapMagicPlug", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemVulva", "alreadyBelted", "vibe"], power: 3},
		{name: "trap_plug2_torment", arousalMode: true, trap: true, lock: "Gold", minLevel: 11, weight:1, message:"LootChestTrapMagicPlug", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemVulva", "alreadyBelted", "vibe"], power: 5},
		{name: "trap_nipple2", arousalMode: true, trap: true, minLevel: 7, weight:4, message:"LootChestTrapMagicNipple", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemNipples", "vibe"], power: 3},
		{name: "PotionCollar", minLevel: 1, weight:1.5, message:"LootPotionCollar", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["PotionCollar"]},
	],
	"silver": [
		{name: "manaorb", minLevel: 0, weight:4, message:"LootManaOrb", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "biggold", minLevel: 0, weight:10, message:"LootChestGold", messageColor:"#ffff00", messageTime: 3, allFloors: true},
		{name: "magicknife", minLevel: 0, weight:2.5, weapon: "EnchKnife", message:"LootChestMagicKnife", messageColor:"lightblue", messageTime: 3, allFloors: true, noweapon: ["EnchKnife"]},
		{name: "MagicRope", arousalMode: true, minLevel: 0, weight:4, weapon: "MagicRope", noweapon: ["MagicRope"], message:"LootChestWeapon", messageColor:"lightblue", messageTime: 3, allFloors: true},
		{name: "scrolls_basic", minLevel: 0, weight: 1.75, message:"LootChestScrollsBasic", messageColor:"yellow", messageTime: 3, allFloors: true},
		{name: "scrolls_purity", minLevel: 0, weight: 0.75, message:"LootChestScrollsPurity", messageColor:"yellow", messageTime: 3, allFloors: true},
		{name: "spell_illusion_low", magic: true, minLevel: 0, weight: 0.75, message:"LootChestSpell", messageColor:"lightblue", messageTime: 3, allFloors: true, prerequisites: ["UnlearnedIllusion", "lowlevel"]}, // lowlevel is spell levels 1-2
		{name: "spell_conjuration_low", magic: true, minLevel: 0, weight: 0.75, message:"LootChestSpell", messageColor:"lightblue", messageTime: 3, allFloors: true, prerequisites: ["UnlearnedConjure", "lowlevel"]}, // lowlevel is spell levels 1-2
		{name: "spell_elemental_low", magic: true, minLevel: 0, weight: 0.75, message:"LootChestSpell", messageColor:"lightblue", messageTime: 3, allFloors: true, prerequisites: ["UnlearnedElements", "lowlevel"]}, // lowlevel is spell levels 1-2
		/*{name: "trap_armbinderHeavy", trap:true, minLevel: 5, weight:2, message:"LootChestTrapMagicHarness", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemArms", "ModerateRestraint"], power: 6},
		{name: "trap_harness", trap: true, minLevel: 1, weight:2, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemTorso"], power: 4},
		{name: "trap_gagHeavy", trap:true, minLevel: 3, weight:3, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemMouth2"], power: 10},
		{name: "trap_mithrilankle", trap:true, minLevel: 4, weight:3, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemFeet"], power: 18},
		{name: "trap_beltonly", arousalMode: true, trap: true, minLevel: 1, weight:2, message:"LootChestTrapMagicBelt", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemPelvis"], power: 5},
		{name: "trap_belt", arousalMode: true, trap: true, minLevel: 3, weight:2, message:"LootChestTrapMagicVibe", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemVulvaPiercings", "alreadyBelted"], power: 1},
		*/
		{name: "trap_plug", arousalMode: true, trap: true, minLevel: 5, weight:1.5, message:"LootChestTrapMagicPlug", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemVulva", "alreadyBelted", "vibe"], power: 3},
		{name: "trap_plug_tease", arousalMode: true, trap: true, minLevel: 11, weight:1, message:"LootChestTrapMagicPlug", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemVulva", "alreadyBelted", "vibe"], power: 4},
		{name: "trap_plug_torment", arousalMode: true, trap: true, minLevel: 15, weight:0.5, message:"LootChestTrapMagicPlug", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemVulva", "alreadyBelted", "vibe"], power: 5},
		{name: "trap_plug_thunder", arousalMode: true, trap: true, minLevel: 15, weight:0.5, message:"LootChestTrapMagicPlug", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemVulva", "alreadyBelted", "vibe"], power: 5},
		{name: "trap_nipple", arousalMode: true, trap: true, minLevel: 2, weight:2, message:"LootChestTrapMagicNipple", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemNipples", "vibe"], power: 3},
		//{name: "trap_mitts", trap: true, minLevel: 5, weight:2, message:"LootChestTrapMagic", messageColor:"#ff0000", messageTime: 3, allFloors: true, prerequisites: ["Group_ItemHands", "LightRestraint"], power: 10},
		{name: "potions_mana", minLevel: 0, weight:3, message:"LootPotionsMana", messageColor:"lightblue", messageTime: 3, allFloors: true, prerequisites: ["lowmanapotions"]},
		{name: "potions_will", minLevel: 0, weight:2, message:"LootPotionsWill", messageColor:"#ff4444", messageTime: 3, allFloors: true, prerequisites: ["lowwillpotions"]},
		{name: "potions_many", minLevel: 1, weight:2, message:"LootPotionsMedley", messageColor:"lightblue", messageTime: 3, allFloors: true, prerequisites: ["lowpotions"]},
		{name: "grinder", minLevel: 1, weight:2, message:"LootChestGrinder", messageColor:"yellow", messageTime: 3, allFloors: true},
		{name: "PotionCollar", minLevel: 1, weight:0.5, message:"LootPotionCollar", messageColor:"yellow", messageTime: 3, allFloors: true, norestraint: ["PotionCollar"]},
		{name: "SlimeWalkers", armor: "SlimeWalkers", minLevel: 1, weight:0.5, message:"LootSlimeWalkers", messageColor:"lightblue", messageTime: 3, allFloors: true, norestraint: ["SlimeWalkers"]},
		...KDAdvancedArmor, ...KDSilverArmor,
	],
};


let KDLootEvents = {
	"Armor": (Loot, Floor, Replacemsg, Lock) => {
		return {
			value: 0,
			Replacemsg: Replacemsg,
		};
	},
	"archerykit": (Loot, Floor, Replacemsg, Lock) => {
		KinkyDungeonInventoryAddWeapon("Bow");
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 1);
		return {
			value: 0,
			Replacemsg: Replacemsg,
		};
	},
};