"use strict";

// LinkableBy array templates
let KDHarnessLink = ["Wrapping", "HeavyCorsets", "Corsets", "ArmbinderHarness", "Ties", "Belts", "Harnesses"];
let KDCorsetLink = ["Wrapping", "Harnesses", "ArmbinderHarness", "Ties", "Belts"];
let KDBindable = ["Wrapping", "Belts", "Tape", "Ties"]; // Things that can be wrapped in various restraints
let KDWrappable = ["Wrapping", "Belts", "Tape"]; // Things that can be wrapped in various restraints but not tied due to covering
let KDArmbinderLink = ["Wrapping", "Belts", "BindingDress"]; // Standard link for an armbinder
let KDTapeLink = ["Wrapping", "Tape", "Belts", "Mask", "Mittens"]; // Standard link for tape style items
let KDRubberLink = ["Wrapping", "Tape", "Belts", "Mask", "Mittens"]; // Standard link for rubber style items
//let KDCorsetRender = ["Harnesses", "ArmbinderHarness", "Ties", "Belts"];

/**
 * @type {restraint[]}
 */
const KinkyDungeonRestraints = [
	{name: "ScarfArms", accessible: true, Asset: "DuctTape", Color: "#880022", Group: "ItemArms", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], bindarms: true, power: 0, weight: 0, escapeChance: {"Struggle": 0.5, "Cut": 0.9, "Remove": 0.2},
		affinity: {Remove: ["Hook"],},
		enemyTags: {"scarfRestraints":2}, playerTags: {"ItemArmsFull":2}, minLevel: 0, allFloors: true, shrine: ["Rope", "Tape"]},
	{name: "ScarfLegs", accessible: true, Asset: "DuctTape", Color: "#880022", Group: "ItemLegs", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], hobble: true, power: 0, weight: 0, escapeChance: {"Struggle": 0.5, "Cut": 0.9, "Remove": 0.2},
		affinity: {Remove: ["Hook"],},
		enemyTags: {"scarfRestraints":2}, playerTags: {"ItemLegsFull":2}, minLevel: 0, allFloors: true, shrine: ["Rope","Tape"]},
	{name: "ScarfFeet", accessible: true, Asset: "DuctTape", Color: "#880022", Group: "ItemFeet", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], blockfeet: true, power: 0, weight: 0, escapeChance: {"Struggle": 0.5, "Cut": 0.9, "Remove": 0.2},
		affinity: {Remove: ["Hook"],},
		enemyTags: {"scarfRestraints":2}, playerTags: {"ItemFeetFull":2}, minLevel: 0, allFloors: true, shrine: ["Rope", "Tape"]},
	// Simple cloth stuff
	{name: "ScarfGag", Asset: "ScarfGag", accessible: true, gag: 0.3, Type: "OTN", Color: "#880022", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Group: "ItemMouth3", power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		affinity: {Remove: ["Hook"],},
		enemyTags: {"scarfRestraints":8, "ropeAuxiliary": 1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Gags", "Tape"]},
	{name: "ScarfBlindfold", Asset: "ScarfBlindfold", accessible: true, Color: "#880022", Group: "ItemHead", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		affinity: {Struggle: ["Sticky", "Hook"], Remove: ["Hook"],},
		blindfold: 1, enemyTags: {"scarfRestraints":8, "ropeAuxiliary": 1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Blindfolds", "Tape"]},


	// region Kigu
	{inventory: true, name: "KiguMask", inaccessible: true, Asset: "KirugumiMask", Color: ["Default", "Default"], Group: "ItemHood", gag: 0.3, blindfold: 1, power: 7, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": -0.1, "Remove": 0.33, "Pick": 0.15, "Unlock": 0.6},
		enemyTags: {"kiguRestraints":1}, playerTags: {"ItemMouth1Full":2, "ItemMouth2Full":1, "Unmasked": -1000}, minLevel: 0, allFloors: true, shrine: ["Latex", "Masks", "Wrapping"], events: [
			{trigger: "onWear", type: "setSkinColor"},
		]},
	// endregion

	//region DuctTape
	// Not super punishing but would be hard to apply IRL
	{inventory: true, name: "DuctTapeHands", inaccessible: true, Asset: "DuctTape", Color: "Default", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Group: "ItemHands", bindhands: true, power: 1, weight: 0,  escapeChance: {"Struggle": -0.1, "Cut": 0.4, "Remove": 0.5}, struggleMaxSpeed: {"Remove": 0.1},
		maxwill: 0.6, enemyTags: {"tapeRestraints":8}, playerTags: {"ItemHandsFull": -4}, minLevel: 0, allFloors: true, shrine: ["Tape"]},
	{removePrison: true, name: "DuctTapeArms", accessible: true, Asset: "DuctTape", Color: "#AA2222", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Group: "ItemArms", bindarms: true, power: -2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {"ItemArmsFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms", "Tape"]},
	{removePrison: true, name: "DuctTapeFeet", accessible: true, Asset: "DuctTape", Color: "#AA2222", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Group: "ItemFeet", blockfeet: true, power: -2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {"ItemLegsFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms", "Tape"]},
	{removePrison: true, name: "DuctTapeBoots", inaccessible: true, Asset: "ToeTape", Type: "Full", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Color: "#AA2222", Group: "ItemBoots", blockfeet: true, power: -2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {"ItemFeetFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms", "Wrapping"]},
	{removePrison: true, name: "DuctTapeLegs", accessible: true, Asset: "DuctTape", Color: "#AA2222", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Group: "ItemLegs", hobble: true, power: -2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {"ItemFeetFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms", "Tape"]},
	{removePrison: true, name: "DuctTapeHead", inaccessible: true, Type: "Wrap", Asset: "DuctTape", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Color: "#AA2222", Group: "ItemHead", power: -2, blindfold: 2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Charms", "Tape"]},
	{removePrison: true, name: "DuctTapeMouth", Asset: "DuctTape", Color: "#AA2222", Group: "ItemMouth2", gag: 0.5, power: -2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {"ItemMouth1Full":8}, minLevel: 0, allFloors: true, shrine: ["Charms", "Tape"]},
	{removePrison: true, name: "DuctTapeHeadMummy", inaccessible: true, Asset: "LeatherSlimMask", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Color: "#AA2222", Group: "ItemHead", gag: 0.5, blindfold: 3, power: 2, weight: 0,  escapeChance: {"Struggle": 0.15, "Cut": 0.8, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"ribbonRestraints":1}, playerTags: {"ItemMouth1Full":2, "ItemMouth2Full":1, "Unmasked": -1000}, minLevel: 2, allFloors: true, shrine: ["Charms", "Wrapping"]},
	{removePrison: true, name: "DuctTapeArmsMummy", inaccessible: true, Type: "Complete", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], remove: ["Cloth", "ClothLower"], Asset: "DuctTape", Color: "#AA2222", Group: "ItemArms", bindarms: true, power: 2, weight: 0,  escapeChance: {"Struggle": 0.1, "Cut": 0.8, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"ribbonRestraints":1}, playerTags: {"ItemArmsFull":3}, minLevel: 0, allFloors: true, shrine: ["Charms", "Wrapping"]},
	{removePrison: true, name: "DuctTapeLegsMummy", inaccessible: true, Type: "CompleteLegs", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], remove: ["ClothLower"], Asset: "DuctTape", Color: "#AA2222", Group: "ItemLegs", hobble: true, power: 2, weight: 0,  escapeChance: {"Struggle": 0.15, "Cut": 0.8, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"ribbonRestraints":1}, playerTags: {"ItemLegsFull":3}, minLevel: 0, allFloors: true, shrine: ["Charms", "Hobbleskirts", "Wrapping"]},
	{removePrison: true, name: "DuctTapeFeetMummy", inaccessible: true, Type: "CompleteFeet", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Asset: "DuctTape", Color: "#AA2222", Group: "ItemFeet", blockfeet: true, power: 2, weight: 0,  escapeChance: {"Struggle": 0.15, "Cut": 0.8, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"ribbonRestraints":1}, playerTags: {"ItemFeetFull":3}, minLevel: 0, allFloors: true, shrine: ["Charms", "Wrapping"]},
	//endregion

	//region MysticDuctTape
	{removePrison: true, name: "MysticDuctTapeHead", inaccessible: true, Type: "Wrap", Asset: "DuctTape", Color: "#55AA22", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Group: "ItemHead", blindfold: 3, power: 1, weight: 0, escapeChance: {"Struggle": 0.2, "Cut": 0.6, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"mummyRestraints":-399}, playerTags: {"ItemMouth2Full":99, "ItemArmsFull":99, "ItemLegsFull":99, "ItemFeetFull":99, "ItemBootsFull":99}, minLevel: 0, allFloors: true, shrine: ["Charms", "Wrapping"]},
	{removePrison: true, name: "MysticDuctTapeMouth", inaccessible: true, Asset: "DuctTape", Color: "#55AA22", Group: "ItemMouth2", gag: 0.5, power: 1, weight: 0, escapeChance: {"Struggle": 0.2, "Cut": 0.6, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"mummyRestraints":-299}, playerTags: {"ItemArmsFull":99, "ItemLegsFull":99, "ItemFeetFull":99, "ItemBootsFull":99}, minLevel: 0, allFloors: true, shrine: ["Charms", "Tape"]},
	{removePrison: true, name: "MysticDuctTapeArmsMummy", inaccessible: true, Type: "Complete", remove: ["Cloth", "ClothLower"], LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Asset: "DuctTape", Color: "#55AA22", Group: "ItemArms", bindarms: true, power: 3, weight: 0,  escapeChance: {"Struggle": 0.05, "Cut": 0.5, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"mummyRestraints":-199}, playerTags: {"ItemLegsFull":99, "ItemFeetFull":99, "ItemBootsFull":99}, minLevel: 0, allFloors: true, shrine: ["Charms", "Wrapping"]},
	{removePrison: true, name: "MysticDuctTapeLegsMummy", inaccessible: true, Type: "CompleteLegs", remove: ["ClothLower"], LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Asset: "DuctTape", Color: "#55AA22", Group: "ItemLegs", hobble: true, power: 3, weight: 0,  escapeChance: {"Struggle": 0.05, "Cut": 0.5, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"mummyRestraints":-99}, playerTags: {"ItemFeetFull":99, "ItemBootsFull":99}, minLevel: 0, allFloors: true, shrine: ["Charms", "Hobbleskirts"]},
	{removePrison: true, name: "MysticDuctTapeFeetMummy", inaccessible: true, Type: "CompleteFeet", Asset: "DuctTape", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Color: "#55AA22", Group: "ItemFeet", blockfeet: true, power: 3, weight: 0,  escapeChance: {"Struggle": 0.05, "Cut": 0.5, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"mummyRestraints":-1}, playerTags: {"ItemBootsFull":99}, minLevel: 0, allFloors: true, shrine: ["Charms", "Wrapping"]},
	{removePrison: true, name: "MysticDuctTapeBoots", inaccessible: true, Asset: "ToeTape", Type: "Full", Color: "#55AA22", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeLink], Group: "ItemBoots", blockfeet: true, power: 3, weight: 0,  escapeChance: {"Struggle": 0.05, "Cut": 0.5, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"mummyRestraints":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Charms", "Wrapping"]},
	//endregion

	//region AutoTape
	{removePrison: true, name: "AutoTapeArms", accessible: true, Type: "Top", Asset: "DuctTape", Color: "#6E9FA3", Group: "ItemArms", bindarms: true, power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"autoTape":10}, playerTags: {"ItemArmsFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms"]},
	{removePrison: true, name: "AutoTapeFeet", accessible: true, Asset: "DuctTape", Color: "#6E9FA3", Group: "ItemFeet", blockfeet: true, power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"autoTape":10}, playerTags: {"ItemLegsFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms"]},
	{removePrison: true, name: "AutoTapeBoots", accessible: true, Asset: "ToeTape", Type: "Full", Color: "#6E9FA3", Group: "ItemBoots", blockfeet: true, power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"autoTape":10}, playerTags: {"ItemFeetFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms", "Wrapping"]},
	{removePrison: true, name: "AutoTapeLegs", accessible: true, Type: "MostLegs", Asset: "DuctTape", Color: "#6E9FA3", Group: "ItemLegs", hobble: true, power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"autoTape":10}, playerTags: {"ItemFeetFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms"]},
	{removePrison: true, name: "AutoTapeHead", inaccessible: true, Type: "Wrap", Asset: "DuctTape", Color: "#6E9FA3", LinkableBy: ["Wrapping", "Mask"], Group: "ItemHead", power: 5, blindfold: 3, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Charms"]},
	{removePrison: true, name: "AutoTapeMouth", accessible: true, Asset: "DuctTape", Type: "Double", Color: "#6E9FA3", Group: "ItemMouth2", gag: 0.5, power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"autoTape":10}, playerTags: {"ItemMouth1Full":8}, minLevel: 0, allFloors: true, shrine: ["Charms"]},
	//endregion

	{removePrison: true, name: "ShadowHandMouth", inaccessible: true, tether: 1.5, Asset: "DuctTape", Type: "Double", Color: ["#3c115c"], Group: "ItemMouth3", gag: 0.5,
		power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":10}, playerTags: {"ItemMouth1Full":-9}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Wrapping", "Shadow"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},]},

	{removePrison: true, name: "ShadowHandArms", LinkableBy: ["Shadow"], accessible: true, tether: 1.5, Asset: "DuctTape", Color: ["#3c115c"], Group: "ItemArms", bindarms: true,
		power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Tape", "Shadow"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},]},

	{removePrison: true, name: "ShadowHandArmsHeavy", inaccessible: true, tether: 1.5, Asset: "DuctTape", Type: "Top", Color: ["#3c115c"], Group: "ItemArms", bindarms: true, bindhands: true,
		power: 5, weight: -9, escapeChance: {"Struggle": 0.1, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":1}, playerTags: {"ItemArmsFull":9}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Wrapping", "Shadow"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},]},

	{removePrison: true, name: "ShadowHandLegs", LinkableBy: ["Shadow"], accessible: true, tether: 1.5, Asset: "DuctTape", Color: ["#3c115c"], Group: "ItemLegs", hobble: true,
		power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Tape", "Shadow"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},]},
	{removePrison: true, name: "ShadowHandLegsHeavy", inaccessible: true, tether: 1.5, Asset: "DuctTape", Color: ["#3c115c"], Group: "ItemLegs", Type: "MostLegs", hobble: true, blockfeet: true,
		power: 5, weight: -5, escapeChance: {"Struggle": 0.1, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":1}, playerTags: {"ItemLegsFull": 5, "ItemFeetFull": 4}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Wrapping", "Shadow"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},]},


	{removePrison: true, name: "ShadowHandCrotch", accessible: true, tether: 1.5, Asset: "Ribbons", Color: ["#3c115c"], Group: "ItemPelvis", crotchrope: true,
		power: 4, weight: 0, escapeChance: {"Struggle": 0.2, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Wrapping", "Shadow"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},]},

	{removePrison: true, name: "ShadowHandFeet", accessible: true, tether: 1.5, Asset: "DuctTape", Color: ["#3c115c"], Group: "ItemFeet", blockfeet: true,
		power: 4, weight: 0, escapeChance: {"Struggle": 0.25, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Wrapping", "Shadow"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},]},

	//region Slime
	{removePrison: true, name: "SlimeBoots", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, Asset: "ToeTape", Type: "Full", Color: "#9B49BD", Group: "ItemBoots", blockfeet: true, power: 4, weight: 0,  escapeChance: {"Struggle": 0.3, "Cut": 0, "Remove": 0},
		events: [{trigger: "tick", type: "slimeSpread", power: 0.04}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 1,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 2, "slimeRestraintsRandomLight": 2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "SlimeFeet", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, Asset: "DuctTape", Type: "CompleteFeet", OverridePriority: 24, Color: "#9B49BD", Group: "ItemFeet", blockfeet: true, power: 4, weight: -100,  escapeChance: {"Struggle": 0.3, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.05}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 1,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 101, "slimeRestraintsRandomLight": 101}, playerTags: {"ItemBootsFull":15}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "SlimeLegs", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, remove: ["ClothLower"],  Asset: "SeamlessHobbleSkirt", Color: "#9B49BD", Group: "ItemLegs", hobble: true, power: 4, weight: -102,  escapeChance: {"Struggle": 0.22, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.07}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 1,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 103, "slimeRestraintsRandomLight": 103}, playerTags: {"ItemFeetFull":2, "ItemBootsFull":2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Hobbleskirts", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "SlimeArms", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, remove: ["Bra"], Asset: "StraitLeotard", Modules: [0, 0, 0, 0], Color: ["#9B49BD", "#9B49BD", "#9B49BD"], Group: "ItemArms", bindarms: true, bindhands: true, power: 6, weight: -102,  escapeChance: {"Struggle": 0.2, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.1}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 1,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 103}, playerTags: {"ItemFeetFull":2, "ItemBootsFull":2, "ItemLegsFull":2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "SlimeHands", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, Asset: "DuctTape", Color: "#9B49BD", Group: "ItemHands", bindhands: true, power: 1, weight: -102,  escapeChance: {"Struggle": 0.4, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.05}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 1,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 103, "slimeRestraintsRandomLight": 103}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHeadFull":1}, minLevel: 0, allFloors: true, shrine: ["Latex", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "SlimeMouth", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, Asset: "LatexBallMuzzleGag", Color: "#9B49BD", Group: "ItemMouth3", gag: 1.0, power: 4, weight: -102,  escapeChance: {"Struggle": 0.22, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.05}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 1,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 103}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHandsFull":1, "ItemArmsFull":1}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "SlimeHead", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, Asset: "LeatherSlimMask", Color: "#9B49BD", Group: "ItemHead", gag: 1.0, blindfold: 4, power: 4, weight: -103,  escapeChance: {"Struggle": 0.22, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.05}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 1,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 100}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHandsFull":1, "ItemArmsFull":1, "ItemMouth3Full":1, "Unmasked": -1000}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "Slime"], addTag: ["slime"]},
	//endregion

	//region HardSlime
	{inventory: true, removePrison: true, name: "HardSlimeBoots", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "ToeTape", Type: "Full", Color: "#9B49BD", Group: "ItemBoots", blockfeet: true, power: 5, weight: 0,
		escapeChance: {"Struggle": 0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardSlimeFeet", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "DuctTape", Type: "CompleteFeet", OverridePriority: 24, Color: "#9B49BD", Group: "ItemFeet", blockfeet: true, power: 6, weight: -100,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardSlimeLegs", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, remove: ["ClothLower"], Asset: "SeamlessHobbleSkirt", Color: "#9B49BD", Group: "ItemLegs", hobble: true, power: 6, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Hobbleskirts", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardSlimeArms", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, remove: ["Bra"], Asset: "StraitLeotard", Modules: [0, 0, 0, 0], Color: ["#9B49BD", "#9B49BD", "#9B49BD"], Group: "ItemArms", bindarms: true, bindhands: true, power: 8, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardSlimeHands", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "DuctTape", Color: "#9B49BD", Group: "ItemHands", bindhands: true, power: 5, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardSlimeMouth", inaccessible: true, Asset: "KittyGag", Color: ["#9B49BD", "#9B49BD", "#9B49BD"], Group: "ItemMouth3", gag: 1.0, power: 6, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardSlimeHead", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "LeatherSlimMask", Color: "#9B49BD", Group: "ItemHead", gag: 1.0, blindfold: 4, power: 6, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {"Unmasked": -1000}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "SlimeHard"]},



	//region Slime
	{removePrison: true, name: "ProtoSlimeBoots", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, Asset: "ToeTape", Type: "Full", Color: "#404973", Group: "ItemBoots", blockfeet: true, power: 4, weight: 0,  escapeChance: {"Struggle": 0.4, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", restraint: "Proto", power: 0.02}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 0.5,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"moldRestraints":100, "moldRestraintsRandom": 2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "ProtoSlimeFeet", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, Asset: "DuctTape", Type: "CompleteFeet", OverridePriority: 24, Color: "#404973", Group: "ItemFeet", blockfeet: true, power: 4, weight: -100,  escapeChance: {"Struggle": 0.4, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", restraint: "Proto", power: 0.03}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 0.5,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"moldRestraints":100, "moldRestraintsRandom": 101}, playerTags: {"ItemBootsFull":15}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "ProtoSlimeLegs", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, remove: ["ClothLower"],  Asset: "SeamlessHobbleSkirt", Color: "#404973", Group: "ItemLegs", hobble: true, power: 4, weight: -102,  escapeChance: {"Struggle": 0.3, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", restraint: "Proto", power: 0.02}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 0.5,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"moldRestraints":100, "moldRestraintsRandom": 103}, playerTags: {"ItemFeetFull":2, "ItemBootsFull":2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Hobbleskirts", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "ProtoSlimeArms", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, remove: ["Bra"], Asset: "StraitLeotard", Modules: [0, 0, 0, 0], Color: ["#404973", "#404973", "#404973"], Group: "ItemArms", bindarms: true, bindhands: true, power: 6, weight: -102,  escapeChance: {"Struggle": 0.3, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", restraint: "Proto", power: 0.05}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 0.5,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"moldRestraints":100, "moldRestraintsRandom": 103}, playerTags: {"ItemFeetFull":2, "ItemBootsFull":2, "ItemLegsFull":2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "ProtoSlimeHands", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, Asset: "DuctTape", Color: "#404973", Group: "ItemHands", bindhands: true, power: 1, weight: -102,  escapeChance: {"Struggle": 0.45, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", restraint: "Proto", power: 0.02}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 0.5,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"moldRestraints":100, "moldRestraintsRandom": 103}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHeadFull":1}, minLevel: 0, allFloors: true, shrine: ["Latex", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "ProtoSlimeMouth", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, Asset: "LatexBallMuzzleGag", Color: "#404973", Group: "ItemMouth3", gag: 1.0, power: 4, weight: -102,  escapeChance: {"Struggle": 0.3, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", restraint: "Proto", power: 0.02}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 0.5,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"moldRestraints":100, "moldRestraintsRandom": 103}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHandsFull":1, "ItemArmsFull":1}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "Slime"], addTag: ["slime"]},
	{removePrison: true, name: "ProtoSlimeHead", inaccessible: true, linkCategory: "Slime", linkSize: 0.6, Asset: "LeatherSlimMask", Color: "#404973", Group: "ItemHead", gag: 1.0, blindfold: 4, power: 4, weight: -103,  escapeChance: {"Struggle": 0.3, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", restraint: "Proto", power: 0.02}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 0.5,
		failSuffix: {"Remove": "Slime"}, enemyTags: {"moldRestraints":100, "moldRestraintsRandom": 100}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHandsFull":1, "ItemArmsFull":1, "ItemMouth3Full":1, "Unmasked": -1000}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "Slime"], addTag: ["slime"]},
	//endregion

	//region HardSlime
	{inventory: true, removePrison: true, name: "HardProtoSlimeBoots", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "ToeTape", Type: "Full", Color: "#404973", Group: "ItemBoots", blockfeet: true, power: 5, weight: 0,
		escapeChance: {"Struggle": 0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardProtoSlimeFeet", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "DuctTape", Type: "CompleteFeet", OverridePriority: 24, Color: "#404973", Group: "ItemFeet", blockfeet: true, power: 6, weight: -100,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardProtoSlimeLegs", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, remove: ["ClothLower"], Asset: "SeamlessHobbleSkirt", Color: "#404973", Group: "ItemLegs", hobble: true, power: 6, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Hobbleskirts", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardProtoSlimeArms", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, remove: ["Bra"], Asset: "StraitLeotard", Modules: [0, 0, 0, 0], Color: ["#404973", "#404973", "#404973"], Group: "ItemArms", bindarms: true, bindhands: true, power: 8, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardProtoSlimeHands", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "DuctTape", Color: "#404973", Group: "ItemHands", bindhands: true, power: 5, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardProtoSlimeMouth", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "KittyGag", Color: ["#9B49BD", "#9B49BD", "#9B49BD"], Group: "ItemMouth3", gag: 1.0, power: 6, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "SlimeHard"]},
	{inventory: true, removePrison: true, name: "HardProtoSlimeHead", linkCategory: "Slime", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "LeatherSlimMask", Color: "#404973", Group: "ItemHead", gag: 1.0, blindfold: 4, power: 6, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		enemyTags: {}, playerTags: {"Unmasked": -1000}, minLevel: 0, allFloors: true, shrine: ["Latex", "Wrapping", "SlimeHard"]},
	//endregion

	//region Glue
	{removePrison: true, name: "GlueBoots", inaccessible: true, Asset: "ToeTape", Type: "Full", Color: "#f0b541", Group: "ItemBoots", blockfeet: true, power: 1, weight: 0,  escapeChance: {"Struggle": 0.3, "Cut": 0.0, "Remove": 0.05},
		enemyTags: {"glueRestraints":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Slime"]},
	{removePrison: true, name: "GlueFeet", inaccessible: true, Asset: "DuctTape", Type: "CompleteFeet", OverridePriority: 24, Color: "#f0b541", Group: "ItemFeet", blockfeet: true, power: 1, weight: -100,  escapeChance: {"Struggle": 0.25, "Cut": 0.0, "Remove": 0.05},
		enemyTags: {"glueRestraints":100}, playerTags: {"ItemBootsFull":15}, minLevel: 0, allFloors: true, shrine: ["Latex", "Slime"]},
	{removePrison: true, name: "GlueLegs", inaccessible: true, remove: ["ClothLower"], Asset: "SeamlessHobbleSkirt", Color: "#f0b541", Group: "ItemLegs", blockfeet: true, power: 1, weight: -102,  escapeChance: {"Struggle": 0.2, "Cut": 0.0, "Remove": 0.05},
		enemyTags: {"glueRestraints":100}, playerTags: {"ItemBootsFull":2, "ItemFeetFull":2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Hobbleskirts", "Slime"]},
	//endregion

	//region Latex
	{inventory: true, name: "LatexStraitjacket", inaccessible: true, factionColor: [[0, 1, 2]], remove: ["Bra"], Asset: "StraitLeotard", Modules: [1, 1, 1, 1], Color: ["#499ed6", "#499ed6", "#499ed6"], Group: "ItemArms", bindarms: true, bindhands: true, power: 8, weight: 0, strictness: 0.2,
		escapeChance: {"Struggle": 0.1, "Cut": 0.15, "Remove": 0.1, "Pick": 0.35},
		limitChance: {"Struggle": 0.25, "Cut": 0.14, "Remove": 0.08, "Unlock": 0.75}, // Hard to escape the arms box by struggling
		maxwill: 0.25, enemyTags: {"latexRestraintsHeavy" : 3, "jailRestraints": 1}, playerTags: {"posLatex": -1, "latexRage": 4}, minLevel: 0, allFloors: true, shrine: ["Latex", "Straitjackets"]},
	{inventory: true, name: "LatexArmbinder", inaccessible: true, factionColor: [[0]], Asset: "SeamlessLatexArmbinder", strictness: 0.1, LinkableBy: [...KDArmbinderLink], Color: ["#499ed6"], Group: "ItemArms", bindarms: true, bindhands: true, power: 7, weight: 0,  escapeChance: {"Struggle": 0.15, "Cut": 0.15, "Remove": 0.1, "Pick": 0.35},
		limitChance: {"Struggle": 0.2, "Cut": 0.1, "Remove": 0.85, "Unlock": 0.2},
		maxwill: 0.35, enemyTags: {"latexRestraints" : 5, "jailRestraints": 1}, playerTags: {"posLatex": -1, "latexAnger": 1, "latexRage": 1}, minLevel: 0, allFloors: true, shrine: ["Latex", "Armbinders"]},
	{inventory: true, name: "LatexLegbinder", inaccessible: true, factionColor: [[0]], Asset: "SeamlessLegBinder", LinkableBy: ["Hobbleskirts", "Wrapping"], Color: ["#499ed6"], Group: "ItemLegs", hobble: true, power: 7, weight: 0,  escapeChance: {"Struggle": -0.05, "Cut": 0.15, "Remove": 0.1, "Pick": 0.35},
		maxwill: 0.6, enemyTags: {"latexRestraintsHeavy" : 6, "jailRestraints": 1}, playerTags: {"posLatex": -1, "latexAnger": 1, "latexRage": 2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Legbinders"]},
	{inventory: true, name: "LatexBoots", inaccessible: true, factionColor: [[0]], Asset: "HighThighBoots", Color: ["#3873C3"], Group: "ItemBoots", hobble: true, power: 6, weight: 0, escapeChance: {"Struggle": -0.15, "Cut": 0.12, "Remove": 0.07, "Pick": 0.25},
		enemyTags: {"latexRestraints" : 8, "latexBoots" : 3, "jailRestraints": 1}, playerTags: {"posLatex": -1, "latexAnger": 2, "latexRage": 2}, minLevel: 0, allFloors: true, shrine: ["Latex"]},
	{alwaysRender: true, inventory: true, name: "LatexCorset", linkCategory: "Corset", linkSize: 0.55, inaccessible: true, factionColor: [[0]], OverridePriority: 26, Asset: "HeavyLatexCorset", LinkableBy: KDCorsetLink, strictness: 0.1, Color: ["#5196EF"], Group: "ItemTorso", power: 8, weight: 0, escapeChance: {"Struggle": -0.1, "Cut": 0.2, "Remove": 0.15, "Pick": 0.3}, struggleMinSpeed: {"Remove": 0.05}, struggleMaxSpeed: {"Remove": 0.1},
		failSuffix: {"Remove": "Corset"}, enemyTags: {"latexRestraints" : 7, "jailRestraints": 1}, playerTags: {"ItemTorsoFull": -5, "posLatex": -1, "latexAnger": 2, "latexRage": 2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Corsets", "HeavyCorsets"]},

	{inventory: true, name: "LatexBallGag", factionColor: [[], [0]], Asset: "BallGag", gag: 0.75, Color: ["#4EA1FF", "Default"], Type: "Tight", Group: "ItemMouth", power: 7, weight: 0, escapeChance: {"Struggle": -0.05, "Cut": 0.04, "Remove": 0.4, "Pick": 0.25},
		maxwill: 0.8, enemyTags: {"latexRestraints" : 3, "latexGag" : 10, "jailRestraints": 1}, playerTags: {"posLatex": -1, "latexAnger": 2, "latexRage": 2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Leather"]},

	{inventory: true, name: "LatexOTNGag", factionColor: [[0], [0], [0]], Asset: "KittyGag", gag: 0.5, Color: ["#4EA1FF", "#4EA1FF", "#4EA1FF"], Group: "ItemMouth3", power: 4, weight: -6, escapeChance: {"Struggle": 0.05, "Cut": 0.18, "Remove": 0.1},
		maxwill: 0.5, enemyTags: {"latexRestraints":6}, playerTags: {"ItemMouth2Full": 3, "ItemMouthFull": 3}, minLevel: 0, allFloors: true, shrine: ["Latex", "Gags"]},

	{renderWhenLinked: ["Corsets", "Harnesses", ...KDBindable, "Latex", "Leather", "Metal", "Rope"], inventory: true, name: "LatexCatsuit", inaccessible: true, factionColor: [[0]], Asset: "SeamlessCatsuit", AssetGroup: "Suit", Color: ["#3873C3"],
		LinkableBy: ["Corsets", "Harnesses", ...KDBindable, "Ribbon"],
		Group: "ItemTorso", power: 7, weight: 0, escapeChance: {"Struggle": -1.0, "Cut": 0.1, "Remove": 0.05},
		enemyTags: {"latexRestraintsHeavy" : 6, "latexCatsuits": 12}, playerTags: {"posLatex": -1, "latexAnger": 2, "latexRage": 2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Suits"],
		alwaysDress: [
			{Item: "SeamlessCatsuit", Group: "Suit", Color: ['#3873C3'], override: true},
			{Item: "SeamlessCatsuit", Group: "SuitLower", Color: ['#3873C3'], override: true},
			{Item: "Catsuit", Group: "Gloves", Color: ['#3873C3'], override: true}],
		events: [
			{trigger: "beforeStruggleCalc", type: "latexDebuff", power: 0.15, inheritLinked: true}
		]
	},
	//endregion

	//region Wolf
	{inventory: true, name: "WolfArmbinder", inaccessible: true, Asset: "SeamlessLatexArmbinder", strictness: 0.1, LinkableBy: [...KDArmbinderLink], Color: "#2E2E2E", Group: "ItemArms", bindarms: true, bindhands: true, power: 7, weight: 0,  escapeChance: {"Struggle": 0.05, "Cut": 0.15, "Remove": 0.07, "Pick": 0.2},
		limitChance: {"Cut": 0.1, "Remove": 0.04, "Unlock": 0.2},
		maxwill: 0.35, enemyTags: {"wolfRestraints" : 5}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Armbinders"]},
	{inventory: true, name: "WolfCuffs", Asset: "MetalCuffs", accessible: true, linkCategory: "Cuffs", linkSize: 0.33, LinkableBy: ["Wrapping", "Belts", "Boxbinders", "Armbinders", "Cuffs", "Ties"], Color: "Default", Group: "ItemArms", bindarms: true, power: 5, weight: 2, DefaultLock: "Red",
		maxwill: 0.8, escapeChance: {"Struggle": -0.5, "Cut": -0.1, "Remove": 10, "Pick": 0.0}, enemyTags: {"wolfCuffs": 8, "cuffsSpell": 100}, playerTags: {}, minLevel: 5, allFloors: true, shrine: ["Metal", "Cuffs"]},
	{inventory: true, name: "WolfAnkleCuffs", accessible: true, Asset: "FuturisticAnkleCuffs", Link: "WolfAnkleCuffs2", DefaultLock: "Red", LinkableBy: [...KDBindable], Type: "Chained", Color: ['#4F91DE', '#4F91DE', '#3F6945', '#000000'], Group: "ItemFeet", hobble: true, power: 8, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.4, "Remove": 0.4, "Pick": 0.15},
		maxwill: 1.0, enemyTags: {"wolfRestraints":7}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs", "AnkleCuffsBase"],
		events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.3, subMult: 0.5, noLeash: true}]},
	{name: "WolfAnkleCuffs2", accessible: true, Asset: "FuturisticAnkleCuffs", UnLink: "WolfAnkleCuffs", LinkableBy: ["AnkleCuffsBase", ...KDBindable], Type: "Closed", Color: ['#4F91DE', '#4F91DE', '#3F6945', '#000000'], Group: "ItemFeet", blockfeet: true, power: 8, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.4, "Remove": 0.4, "Pick": 0.15},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}]},
	{alwaysRender: true, inventory: true, name: "WolfHarness", accessible: true, remove: ["Cloth"], Asset: "FuturisticHarness", LinkableBy: [...KDHarnessLink], strictness: 0.05, harness: true, Color: ['#4F91DE', '#346942', '#889FA7', "#000000"], Group: "ItemTorso", power: 4, weight: 0,
		escapeChance: {"Struggle": -0.15, "Cut": 0.2, "Remove": 0.1, "Pick": 0.35},
		maxwill: 1.0, enemyTags: {"wolfRestraints" : 6, "wolfGear":6}, playerTags: {"ItemTorsoFull": -5}, minLevel: 0, allFloors: true, shrine: ["Latex", "Harnesses"]},
	{inventory: true, name: "WolfBallGag", Asset: "FuturisticHarnessBallGag", strictness: 0.35, gag: 0.6, Color: ['#4F91DE', '#428E4F', '#6E6E6E', '#FFFFFF', '#000000'], Group: "ItemMouth", power: 10, weight: 0,
		maxwill: 0.75, escapeChance: {"Struggle": -0.3, "Cut": 0.0, "Remove": 0.05, "Pick": 0.2},
		enemyTags: {"wolfRestraints" : 8}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Leather"]},
	{inventory: true, name: "WolfCollar", accessible: true, Asset: "AutoShockCollar", Color: ['#6EAF81', '#6EAF81'], Group: "ItemNeck", LinkableBy: ["HighCollars"], power: 11, weight: 0, escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0.1, "Pick": -0.05},
		maxwill: 0.5, enemyTags: {"wolfRestraints":3, "wolfGear":3}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Collars", "HighCollars"],
		events: [
			{trigger: "playerAttack", type: "PunishPlayer", chance: 0.25, stun: 2, warningchance: 1.0, damage: "electric", power: 2, sfx: "Shock", inheritLinked: true,},
			{trigger: "beforeStruggleCalc", type: "ShockForStruggle", chance: 0.75, stun: 2, warningchance: 1.0, damage: "electric", power: 2, sfx: "Shock", bind: 0.2, inheritLinked: true,},
			{trigger: "playerCast", type: "PunishPlayer", chance: 1.0, punishComponent: "Verbal", damage: "electric", power: 2, sfx: "Shock", inheritLinked: true,}
		]},
	{inventory: true, removePrison: true, name: "WolfLeash", tether: 2.9, Asset: "CollarLeash", Color: "#44fF76", Group: "ItemNeckRestraints", leash: true, power: 1, weight: -99, harness: true,
		escapeChance: {"Struggle": -0.3, "Cut": -0.2, "Remove": 0.4, "Pick": 0.35}, enemyTags: {"wolfRestraints":9}, playerTags: {"ItemNeckRestraintsFull":-2, "ItemNeckFull":999}, minLevel: 0, allFloors: true, shrine: []},
	{renderWhenLinked: ["Chastity"], inventory: true, arousalMode: true, name: "WolfPanties", inaccessible: true, Asset: "SciFiPleasurePanties", strictness: 0.05, Color: ["#4F91DE", "#2E2E2E", "#3b7d4f", "#2f5753", "#4F91DE", "#4F91DE", "#000000"] ,Group: "ItemPelvis", LinkableBy: ["Chastity"], power: 4,
		weight: 0, escapeChance: {"Struggle": 0.05, "Cut": 0.3, "Remove": 0.05, "Pick": 0.35}, escapeMult: 3.0, vibeLocation: "ItemVulva",
		linkedVibeTags: ["teaser"], allowRemote: true, events: [
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 2, time: 20, edgeOnly: true},
			{trigger:"tick",  type: "PeriodicTeasing", power: 1, time: 48, edgeOnly: true, cooldown: {"normal": 120, "tease": 20}, chance: 0.02},
			{trigger:"tick",  type: "PeriodicDenial", power: 2, time: 42, edgeOnly: true, cooldown: {"normal": 100, "tease": 20}, chance: 0.03},
			{trigger:"tick",  type: "PeriodicTeasing", power: 3, time: 14, edgeOnly: false, cooldown: {"normal": 140, "tease": 20}, chance: 0.01},
		],
		maxwill: 0.5, enemyTags: {"wolfRestraints" : 6, "wolfGear":6}, playerTags: {"ItemPelvisFull": -5, "NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Latex", "Panties", "Vibes"]},
	//endregion

	//region Cosplay
	{alwaysRender: true, inventory: true, name: "BindingDress", inaccessible: true, remove: ["Cloth", "Bra"], Type: "Strap", Asset: "LeatherArmbinder", strictness: 0.25, Color: ['#473488'], Group: "ItemArms", LinkableBy: ["Armbinders"], bindarms: true, bindhands: true, power: 7, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": 0.2, "Remove": -0.2, "Pick": 0.15}, helpChance: {"Struggle": -0.1, "Cut": 0.2, "Remove": 0.025},
		limitChance: {"Struggle": 0.125, "Cut": 0.125, "Remove": 0.1, "Unlock": 0.5},
		alwaysDress: [
			{Item: "PleatedSkirt", Group: "ClothLower", Color: ['#6B48E0'], override: true},
			{Item: "SleevelessCatsuit", Group: "Suit", Color: ['#473488'], override: true},
			{Item: "CatsuitPanties", Group: "SuitLower", Color: ['#473488'], override: true}],
		maxwill: 0.5, enemyTags: {"dressRestraints" : 10, "bindingDress": 10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "BindingDress"]},

	{inventory: true, name: "DressBra", inaccessible: true, Asset: "FuturisticBra2", Color: ['#6B48E0', '#F8BD01', '#6B48E0', '#6B48E0', '#F8BD01', '#6B48E0'], Group: "ItemBreast", LinkableBy: ["Ornate"], chastitybra: true, power: 8, weight: -2,
		escapeChance: {"Struggle": -0.5, "Cut": -0.05, "Remove": 0.4, "Pick": 0.15}, DefaultLock: "Red", bypass: true,
		maxwill: 0.9, enemyTags: {"dressRestraints" : 10}, playerTags: {"ItemNipplesFull": 2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Harnesses"]},

	{inventory: true, name: "AsylumJacket", Asset: "HighSecurityStraitJacket", Modules: [1, 1, 3], Color: ["#333333", "#333333", '#808080', '#808080'], LinkableBy: ["TransportJackets", "Wrapping"], Group: "ItemArms", power: 8, weight: 0, bindarms: true, bindhands: true,strictness: 0.2,
		limitChance: {"Struggle": 0.12, "Cut": 0.03, "Remove": 0.1, "Unlock": 0.75},
		escapeChance: {"Struggle": -0.175, "Cut": 0.15, "Remove": 0.1, "Pick": 0.15},
		enemyTags: {"nurseRestraints": 5, "jacketSpell": 5}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, maxwill: 0.35, allFloors: true, shrine: ["Straitjackets", "Leather"]},

	{inventory: true, name: "TransportJacket", Asset: "TransportJacket", events: [{type: "PrisonerJacket", trigger: "afterDress"}], Color: ["#808080", "#202020", "#808080", "#EEEEEE", "#202020", "#808080"],
		Group: "ItemArms", power: 10, weight: 0, bindarms: true, bindhands: true, strictness: 0.3, LinkableBy: ["Wrapping"],
		limitChance: {"Struggle": 0.12, "Cut": 0.1, "Remove": 0.15, "Unlock": 0.75},
		escapeChance: {"Struggle": -0.175, "Cut": 0.1, "Remove": 0.1, "Pick": 0.15},
		enemyTags: {"nurseRestraints": -1}, playerTags: {"ItemArmsFull":10}, minLevel: 0, maxwill: 0.30, allFloors: true, shrine: ["Straitjackets", "TransportJackets", "Leather"]},

	{renderWhenLinked: ["Belts"], inventory: true, name: "AsylumLegbinder", inaccessible: true, Asset: "LegBinder", LinkableBy: ["Hobbleskirts", "Belts"], Color: "Default", Group: "ItemLegs", blockfeet: true,
		power: 6, weight: 2, escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": 0.3, "Pick": 0.25}, enemyTags: {"nurseRestraints": 1}, playerTags: {"ItemArmsFull":3},
		struggleMaxSpeed: {"Remove": 0.1}, // Easy to remove but takes a while
		minLevel: 0, allFloors: true, shrine: ["Leather", "Legbinders"]},

	{inventory: true, name: "AsylumAnkleCuffs", Asset: "LeatherAnkleCuffs", LinkableBy: ["Wrapping", "Ties", "Belts"], Link: "AsylumAnkleCuffs2", DefaultLock: "Blue", Type: "Chained", Color: ["Default", "#814F21", "#Default"], Group: "ItemFeet", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": -0.05, "Remove": 0.35, "Pick": 0.25}, enemyTags: {"nurseRestraints": 3, "nurseCuffRestraints": 5}, playerTags: {"ItemFeetFull":-2}, minLevel: 2, allFloors: true, shrine: ["Leather", "Cuffs", "AnkleCuffsBase"],
		maxwill: 1.0, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.2, subMult: 0.5, noLeash: true}]},
	{name: "AsylumAnkleCuffs2", Asset: "LeatherAnkleCuffs", LinkableBy: ["Wrapping", "Ties", "Belts"], UnLink: "AsylumAnkleCuffs", Type: "Closed", Color: ["Default", "#814F21", "Default"], Group: "ItemFeet", blockfeet: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": -0.05, "Remove": 0.35, "Pick": 0.25}, enemyTags: {"nurseRestraints": 3, "nurseCuffRestraints": 5}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Leather", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}]},


	{inventory: true, name: "AsylumMuzzle", gag: 1.0, Asset: "FuturisticMuzzle", Modules: [1, 1, 0], Group: "ItemMouth3", Color: ["#814F21","#814F21","#814F21","#814F21"], power: 8, weight: 2,
		escapeChance: {"Struggle": -0.14, "Cut": 0.18, "Remove": 0.25, "Pick": 0.2}, maxwill: 0.9,
		enemyTags: {"nurseRestraints":3}, playerTags: {"ItemMouthFull":1}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags"]},

	//endregion

	//region Fuuka's stuff
	{inventory: true, curse: "GhostLock", name: "MikoCollar", Asset: "HighCollar", Color: ["#ffffff", "#AA2222"],Group: "ItemNeck", LinkableBy: ["HighCollars"], magic: true, power: 40, weight: 0, difficultyBonus: 10,
		escapeChance: {"Struggle": -100, "Cut": -0.8, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Collars", "HighCollars"],
		events: [{trigger: "kill", type: "MikoGhost"}],
	},
	// Generic stronger gag
	{inventory: true, name: "MikoGag", Asset: "OTNPlugGag", Type: "Plug", gag: 1.0, Color: ["#ffffff", "#AA2222", "#ffffff"], Group: "ItemMouth", power: 9, weight: 2, DefaultLock: "Blue", magic: true,
		escapeChance: {"Struggle": -0.2, "Cut": 0.2, "Remove": 0.15, "Pick": 0.07},
		maxwill: 0.6, enemyTags: {"mikoRestraints" : 10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags"]},
	{alwaysRender: true, inventory: true, name: "MikoDress", inaccessible: true, remove: ["Cloth", "Bra"], Type: "Strap", Asset: "LeatherArmbinder", strictness: 0.25, Color: ['#ffffff'], Group: "ItemArms", LinkableBy: ["Armbinders", "Wrapping"], bindarms: true, bindhands: true, power: 7, weight: 0, DefaultLock: "Blue",
		escapeChance: {"Struggle": -0.2, "Cut": 0.2, "Remove": -0.2, "Pick": 0.15}, helpChance: {"Struggle": -0.15, "Cut": 0.2, "Remove": 0.025},
		limitChance: {"Struggle": 0.125, "Cut": 0.125, "Remove": 0.1, "Unlock": 0.5},
		alwaysDress: [
			{Item: "PleatedSkirt", Group: "ClothLower", Color: ['#AA2222'], override: true},
			{Item: "SleevelessCatsuit", Group: "Suit", Color: ['#AA2222'], override: true},
			{Item: "LatexCorset1", Group: "Corset", Color: ['#ffffff'], override: true},
			{Item: "CatsuitPanties", Group: "SuitLower", Color: ['#AA2222'], override: true}],
		maxwill: 0.5, enemyTags: {"mikoRestraints" : 10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "BindingDress"]},
	//endregion

	{inventory: true, arousalMode: true, name: "NippleClamps", Asset: "HeartPasties", Color: "Default", Group: "ItemNipples", power: 3, weight: 0,
		escapeChance: {"Struggle": -10, "Cut": -0.05, "Remove": 0.5, "Pick": 0.25}, failSuffix: {"Struggle": "Clamps"},
		maxwill: 1.0, enemyTags: {"dressRestraints" : 4, "genericToys": 2, "maidRestraints": 1, "maidRestraintsLight": 1}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Vibes"], linkedVibeTags: ["teaser", "piercings"],
		allowRemote: true, events: [
			{trigger:"playerCast",  type: "MagicallySensitive", chance: 0.5, power: 1, time: 24, edgeOnly: true},
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 1, time: 24, edgeOnly: true},
			{trigger:"tick",  type: "PeriodicTeasing", power: 1, time: 24, edgeOnly: true, cooldown: {"normal": 80, "tease": 20}, chance: 0.02},
		]},

	{alwaysRender: true, inventory: true, name: "ControlHarness", accessible: true, Asset: "FuturisticHarness", LinkableBy: [...KDHarnessLink], strictness: 0.1, Color: ['#8CF3FF', '#352753', '#889FA7', '#000000'], Group: "ItemTorso", power: 10, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.4, "Pick": 0.1}, DefaultLock: "Red",
		maxwill: 0.5, enemyTags: {"controlHarness" : 1}, playerTags: {}, minLevel: 7, allFloors: true, shrine: ["Metal", "Harnesses", "Futuristic"]},

	{inventory: true, name: "TrackingCollar", accessible: true, Asset: "FuturisticCollar", Color: ['#8CF3FF', '#352753', '#889FA7', '#000000'], Group: "ItemNeck", LinkableBy: ["HighCollars"], power: 9, weight: 0, escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.25, "Pick": -0.1},
		maxwill: 0.5, enemyTags: {"controlHarness":10}, playerTags: {"ItemNeckEmpty":10}, minLevel: 0, allFloors: true, shrine: ["Metal", "Collars", "Futuristic"],
		events: [
			{trigger: "playerAttack", type: "AlertEnemies", chance: 1.0, power: 10, sfx: "Alarm", inheritLinked: true},
		]},

	// collar #6EAF81

	//region Exp
	{inventory: true, name: "ExpArmbinder", inaccessible: true, Asset: "BoxTieArmbinder", strictness: 0.08, LinkableBy: ["Wrapping"], Color: ["#415690", "#ffffff"], Group: "ItemArms", bindarms: true, bindhands: true, power: 7, weight: 0,
		limitChance: {"Struggle": 0.15, "Cut": 0.1, "Remove": 0.035, "Unlock": 0.5}, // Hard to escape the arms box by struggling
		escapeChance: {"Struggle": 0.1, "Cut": 0.15, "Remove": 0.1, "Pick": 0.35},
		maxwill: 0.25, enemyTags: {"expRestraints" : 5}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Boxbinders"]},
	{alwaysRender: true, inventory: true, name: "ExpArmbinderHarness", accessible: true, Asset: "Corset4", Color: "#383E4D", Group: "ItemTorso", strictness: 0.1, power: 9, weight: -10, OverridePriority: 26, LinkableBy: [...KDHarnessLink],
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0.15},
		maxwill: 0.6, enemyTags: {"expRestraints" : 9}, playerTags: {"Boxbinders": 20, "Armbinders": 20}, minLevel: 7, allFloors: true, shrine: ["Latex", "ArmbinderHarness"],
		events: [{trigger: "postRemoval", type: "armbinderHarness"}], requireSingleTagToEquip: ["Armbinders", "Boxbinders"]},
	{inventory: true, name: "ExpAnkleCuffs", accessible: true, Asset: "SteelAnkleCuffs", Link: "ExpAnkleCuffs2", DefaultLock: "Red", LinkableBy: [...KDBindable], Type: "Chained", Color: "#333333", Group: "ItemFeet", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.4, "Remove": 0.1, "Pick": 0.15},
		enemyTags: {"expRestraints":7}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs", "AnkleCuffsBase"],
		events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.2, subMult: 0.5, noLeash: true}]},
	{name: "ExpAnkleCuffs2", accessible: true, Asset: "SteelAnkleCuffs", UnLink: "ExpAnkleCuffs", LinkableBy: [...KDBindable], Type: "Closed", Color: "#333333", Group: "ItemFeet", blockfeet: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.4, "Remove": 0.1, "Pick": 0.15},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}]},
	{inventory: true, name: "ExpCollar", inaccessible: true, Asset: "LatexPostureCollar", gag: 0.4, Color: "#4E7DFF", Group: "ItemNeck", LinkableBy: ["Collars", "HighCollars"], power: 8, weight: -2, strictness: 0.05, escapeChance: {"Struggle": 0, "Cut": 0.15, "Remove": 0.2, "Pick": 0.25},
		maxwill: 0.25, enemyTags: {"expRestraints" : 2.1, "latexCollar": 1}, playerTags: {"ItemMouthFull": 2, "ItemMouth2Full": 2, "ItemMouth3Full": 2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Posture", "Collars", "HighCollars"]},
	{inventory: true, name: "ExpBoots", inaccessible: true, Asset: "BalletWedges", Color: "#748395", Group: "ItemBoots", LinkableBy: ["Wrapping"], hobble: true, power: 8, weight: 0, escapeChance: {"Struggle": -0.25, "Cut": 0.0, "Remove": 0.07, "Pick": 0.25},
		maxwill: 0.9, enemyTags: {"expRestraints" : 6, "latexBoots" : 3, "wolfRestraints": 6}, playerTags: {}, minLevel: 2, allFloors: true, shrine: ["Metal", "Boots"]},
	//endregion

	{inventory: true, name: "Stuffing", Asset: "ClothStuffing", Color: "Default", Group: "ItemMouth", power: -20, weight: 0, gag: 0.3,
		escapeChance: {"Struggle": 10, "Cut": 10, "Remove": 10}, enemyTags: {"stuffedGag": 100, "clothRestraints":12, "ribbonRestraints":6}, playerTags: {}, minLevel: 0,
		allFloors: true, shrine: ["Rope"]},

	//region MagicRope
	{inventory: true, renderWhenLinked: ["Boxbinders"], changeRenderType: {"ArmBind": "WristElbowHarnessTie"}, name: "WeakMagicRopeArms", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Color: "#ff88AA", LinkableBy: ["Boxbinders", "Wrapping"], Group: "ItemArms", bindarms: true, power: 0, weight: 1, escapeChance: {"Struggle": 0.3, "Cut": 0.67, "Remove": 0.2},
		affinity: {Remove: ["Hook"],},
		failSuffix: {"Remove": "MagicRope"}, maxwill: 0.65, enemyTags: {"ropeMagicWeak":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, name: "WeakMagicRopeLegs", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "FullBinding", LinkableBy: ["Legbinders", "Hobbleskirts"], Color: "#ff88AA", Group: "ItemLegs", hobble: true, power: 0, weight: 1,
		affinity: {Remove: ["Hook"],},
		failSuffix: {"Remove": "MagicRope"}, escapeChance: {"Struggle": 0.3, "Cut": 0.67, "Remove": 0.15}, enemyTags: {"ropeMagicWeak":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, name: "StrongMagicRopeCuffs", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Color: "#ff00dd", Type: "RopeCuffs", linkCategory: "Cuffs", linkSize: 0.33, LinkableBy: ["Boxbinders", "Armbinders", ...KDBindable, "Cuffs"], Group: "ItemArms", bindarms: true, power: 2, weight: 1, escapeChance: {"Struggle": 0.3, "Cut": 0.35, "Remove": -0.1}, specStruggleTypes: ["Remove", "Struggle"],
		affinity: {Remove: ["Hook"],},
		failSuffix: {"Remove": "MagicRope"}, maxwill: 1.0, enemyTags: {"ropeMagicStrong":5}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Cuffs"]},
	{renderWhenLinked: ["Boxbinders"], changeRenderType: {"ArmBind": "WristElbowHarnessTie"}, inventory: true, name: "StrongMagicRopeArms", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Color: "#ff00dd", LinkableBy: ["Boxbinders", "Wrapping"], Group: "ItemArms", bindarms: true, power: 6, weight: 1, escapeChance: {"Struggle": 0.15, "Cut": 0.2, "Remove": -0.1}, specStruggleTypes: ["Remove", "Struggle"],
		affinity: {Remove: ["Hook"],},
		failSuffix: {"Remove": "MagicRope"}, maxwill: 0.65, enemyTags: {"ropeMagicStrong":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: false, name: "StrongMagicRopeHogtie", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Color: "#ff00dd", Type: "Hogtied", Group: "ItemArms", bindarms: true, power: 8, weight: 1, escapeChance: {"Struggle": -0.1, "Cut": 0.15, "Remove": -0.1}, specStruggleTypes: ["Remove", "Struggle"],
		affinity: {Remove: ["Hook"],},
		maxwill: 0.25, enemyTags: {"ropeMagicHogtie":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"],
		failSuffix: {"Remove": "MagicRope"}, events: [{trigger: "postRemoval", type: "replaceItem", list: ["StrongMagicRopeArms"], power: 6}]
	},
	{inventory: true, name: "StrongMagicRopeLegs", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "FullBinding", LinkableBy: ["Legbinders", "Hobbleskirts"], Color: "#ff00dd", Group: "ItemLegs", hobble: true, power: 5, weight: 1,
		affinity: {Remove: ["Hook"],},
		escapeChance: {"Struggle": 0.15, "Cut": 0.2, "Remove": -0.1}, specStruggleTypes: ["Remove", "Struggle"],
		failSuffix: {"Remove": "MagicRope"}, maxwill: 0.8, enemyTags: {"ropeMagicStrong":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, name: "StrongMagicRopeFeet", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Color: "#ff00dd", LinkableBy: ["Wrapping"], Group: "ItemFeet", blockfeet: true, power: 5, weight: 1,
		affinity: {Remove: ["Hook"],},
		escapeChance: {"Struggle": 0.15, "Cut": 0.2, "Remove": -0.1}, specStruggleTypes: ["Remove", "Struggle"],
		failSuffix: {"Remove": "MagicRope"}, enemyTags: {"ropeMagicStrong":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, name: "StrongMagicRopeCrotch", accessible: true, factionColor: [[], [0]], crotchrope: true, Asset: "HempRope", Type: "OverPanties", OverridePriority: 26, Color: "#ff00dd", Group: "ItemPelvis", power: 5, weight: 1,
		affinity: {Remove: ["Hook"],},
		escapeChance: {"Struggle": 0.15, "Cut": 0.2, "Remove": -0.1}, specStruggleTypes: ["Remove", "Struggle"], enemyTags: {"ropeMagicStrong":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"],
		failSuffix: {"Remove": "MagicRope"}, events: [{trigger: "struggle", type: "crotchrope"}]},
	{inventory: true, name: "StrongMagicRopeToe", accessible: true, factionColor: [[], [0]], Asset: "ToeTie", OverridePriority: 26, LinkableBy: ["Wrapping"], Color: "#ff00dd", Group: "ItemBoots", blockfeet: true, power: 5, weight: 1,
		affinity: {Remove: ["Hook"],},
		failSuffix: {"Remove": "MagicRope"}, escapeChance: {"Struggle": 0.15, "Cut": 0.2, "Remove": -0.1}, specStruggleTypes: ["Remove", "Struggle"], enemyTags: {"ropeMagicStrong":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	//endregion

	//region MithrilRope
	{renderWhenLinked: ["Boxbinders"], changeRenderType: {"ArmBind": "WristElbowHarnessTie"}, inventory: true, name: "MithrilRopeArms", accessible: true, Asset: "NylonRope", Color: "#ffffff", LinkableBy: ["Armbinders", "Wrapping"], Group: "ItemArms", bindarms: true, power: 6, weight: 1, magic: true,
		affinity: {Remove: ["Hook"],},
		escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0.05}, specStruggleTypes: ["Remove", "Struggle"],
		maxwill: 0.7, enemyTags: {"mithrilRope":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: false, name: "MithrilRopeHogtie", accessible: true, Asset: "HempRope", Color: "#ffffff", Type: "KneelingHogtie", Group: "ItemArms", bindarms: true, power: 8, weight: 1, magic: true,
		affinity: {Remove: ["Hook"],},
		escapeChance: {"Struggle": -0.1, "Cut": 0.15, "Remove": 0.05}, specStruggleTypes: ["Remove", "Struggle"],
		maxwill: 0.15, enemyTags: {"mithrilRopeHogtie":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"],
		events: [{trigger: "postRemoval", type: "replaceItem", list: ["MithrilRopeArms"], power: 6}]
	},
	{inventory: true, name: "MithrilRopeLegs", accessible: true, Asset: "NylonRope", LinkableBy: ["Legbinders", "Hobbleskirts"], Color: "#ffffff", Group: "ItemLegs", hobble: true, power: 5, weight: 1, magic: true,
		affinity: {Remove: ["Hook"],},
		escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0.05}, specStruggleTypes: ["Remove", "Struggle"], strictness: 0.1,
		maxwill: 0.8, enemyTags: {"mithrilRope":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, name: "MithrilRopeFeet", accessible: true, Asset: "NylonRope", Color: "#ffffff", LinkableBy: ["Wrapping"], Group: "ItemFeet", blockfeet: true, power: 5, weight: 1, magic: true,
		affinity: {Remove: ["Hook"],},
		escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0.05}, specStruggleTypes: ["Remove", "Struggle"], strictness: 0.1,
		enemyTags: {"mithrilRope":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, name: "MithrilRopeHarness", accessible: true, Asset: "NylonRopeHarness", Type: "Star", harness: true, OverridePriority: 26, Color: "#ffffff", Group: "ItemTorso", power: 5, weight: 1, magic: true,
		affinity: {Remove: ["Hook"],},
		escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0.05}, specStruggleTypes: ["Remove", "Struggle"], strictness: 0.1,
		enemyTags: {"mithrilRope":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, name: "MithrilRopeCrotch", accessible: true, crotchrope: true, Asset: "HempRope", Type: "OverPanties", OverridePriority: 26, Color: "#ffffff", Group: "ItemPelvis", power: 5, weight: 1, magic: true,
		affinity: {Remove: ["Hook"],},
		escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0.05}, specStruggleTypes: ["Remove", "Struggle"],
		enemyTags: {"mithrilRope":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"],
		events: [{trigger: "struggle", type: "crotchrope"}]},
	{inventory: true, name: "MithrilRopeToe", accessible: true, Asset: "ToeTie", OverridePriority: 26, LinkableBy: ["Wrapping"], Color: "#ffffff", Group: "ItemBoots", blockfeet: true, power: 5, weight: 1, magic: true,
		affinity: {Remove: ["Hook"],},
		escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0.05}, specStruggleTypes: ["Remove", "Struggle"],
		enemyTags: {"mithrilRope":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	//endregion

	//region Mithril
	{inventory: true, name: "MithrilLegCuffs", accessible: true, Asset: "FuturisticLegCuffs", LinkableBy: ["Legbinders", "Wrapping", "Hobbleskirts", "Belts"], Type: "Chained", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'], Group: "ItemLegs", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		maxwill: 0.6, enemyTags: {"mithrilRestraints":6}, playerTags: {"ItemLegsFull":-2}, minLevel: 7, allFloors: true, shrine: ["Metal", "Cuffs"]},
	{inventory: true, name: "MithrilAnkleCuffs", accessible: true, Asset: "FuturisticAnkleCuffs", LinkableBy: [...KDBindable], DefaultLock: "Blue", Link: "MithrilAnkleCuffs2", Type: "Chained", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'], Group: "ItemFeet", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25}, enemyTags: {"mithrilRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs", "AnkleCuffsBase"],
		maxwill: 0.5, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.2, subMult: 0.5, noLeash: true}]},
	{name: "MithrilAnkleCuffs2", accessible: true, Asset: "FuturisticAnkleCuffs", LinkableBy: [...KDBindable], UnLink: "MithrilAnkleCuffs", Type: "Closed", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'], Group: "ItemFeet", blockfeet: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25}, enemyTags: {"mithrilRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}]},
	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "MithrilArmCuffs", DefaultLock: "Blue", accessible: true, Asset: "FuturisticCuffs", linkCategory: "Cuffs", linkSize: 0.55, LinkableBy: ["Armbinders", "Petsuits", "Straitjackets", "Boxbinders", ...KDBindable], Link: "MithrilArmCuffs2", Color: ['#FFFFFF', '#CFBE88', '#000000'], Group: "ItemArms", bindarms: false, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.25, "Pick": 0.35}, enemyTags: {"mithrilRestraints":24}, playerTags: {"ItemArmsFull":-2}, minLevel: 4, allFloors: true, shrine: ["Metal", "Cuffs", "ArmCuffsBase"],
		maxwill: 0.4, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.33}, {trigger: "defeat", type: "linkItem", chance: 1.0}]},
	{name: "MithrilArmCuffs2", accessible: true, Asset: "FuturisticCuffs", Type: "Wrist", LinkableBy: ["Armbinders", "Boxbinders", ...KDBindable], Link: "MithrilArmCuffs3", UnLink: "MithrilArmCuffs", Color: ['#FFFFFF', '#CFBE88', '#000000'], Group: "ItemArms", bindarms: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.33}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.08, inheritLinked: true}]},
	{name: "MithrilArmCuffs3", accessible: true, Asset: "FuturisticCuffs", Type: "Both", LinkableBy: ["Armbinders", "Wrapping", "Belts"], UnLink: "MithrilArmCuffs4", Color: ['#FFFFFF', '#CFBE88', '#000000'], Group: "ItemArms", bindarms: true, power: 9, weight: 0, strictness: 0.1,
		escapeChance: {"Struggle": -0.175, "Cut": -0.2, "Remove": -0.1, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.12, inheritLinked: true}]},
	{name: "MithrilArmCuffs4", accessible: true, Asset: "FuturisticCuffs", Type: "Elbow", LinkableBy: ["Armbinders", "Wrapping", "Belts"], Link: "MithrilArmCuffs3", UnLink: "MithrilArmCuffs", Color: ['#FFFFFF', '#CFBE88', '#000000'], Group: "ItemArms", bindarms: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": -0.2, "Remove": -0.15, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.5}, {trigger: "beforeStruggleCalc", type: "elbowCuffsBlock", inheritLinked: true}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}]},
	{inventory: true, name: "MithrilCollar", Asset: "ShinySteelCollar", Color: ['#C9B883', '#C9B883'], Group: "ItemNeck", LinkableBy: ["HighCollars"], power: 9, weight: -2, escapeChance: {"Struggle": -0.1, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		maxwill: 0.25, enemyTags: {"mithrilRestraints":4}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Collars"]},
	//endregion

	// Slime, added by slime effects. Easy to struggle out, not debilitating, but slows you greatly
	{removePrison: true, name: "StickySlime", Asset: "Web", Type: "Wrapped", Color: "#ff77ff", Group: "ItemArms", bindarms: true, bindhands: true, power: 0.1, weight: 1, removeOnLeash: true, freeze: true, escapeChance: {"Struggle": 10, "Cut": 10, "Remove": 10}, enemyTags: {"slime":100}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Slime"]},
	// Barrel trap, always possible to struggle out but takes time
	{removePrison: true, name: "BarrelTrap", Asset: "SmallWoodenBox", Color: "Default", Group: "ItemDevices", power: 2, weight: 1, immobile: true, alwaysStruggleable: true, blindfold: 5, enclose: true,
		escapeChance: {"Struggle": 0.1, "Cut": 0.025, "Remove": 0.025, "Pick": -1.0, "Unlock": -1.0},
		struggleMinSpeed: {"Struggle": 0.07, "Cut": 0.03, "Remove": 0.05}, alwaysEscapable: ["Struggle"],
		struggleMaxSpeed: {"Struggle": 0.15, "Cut": 0.15, "Remove": 0.15},
		helpChance: {"Remove": 0.4, "Pick": 0.2, "Unlock": 1.0},
		limitChance: {"Struggle": 0.01, "Cut": 0, "Remove": 0.01, "Pick": 0, "Unlock": 0},
		enemyTags: {"barrel":100}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Furniture"], ignoreSpells: true, removeOnLeash: true, ignoreIfNotLeash: true,
		events: [{trigger: "tick", type: "barrelDebuff", inheritLinked: true}, {trigger: "tick", type: "callGuardFurniture", inheritLinked: true}, {trigger: "playerMove", type: "removeOnMove", inheritLinked: true}]},
	// Cage trap
	{removePrison: true, name: "CageTrap", Asset: "Cage", Color: ['Default', 'Default', '#000000'], Group: "ItemDevices", power: 3, weight: 1, immobile: true, alwaysStruggleable: true,
		DefaultLock: "Red",
		escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": 0.35, "Pick": 0.33, "Unlock": 0.7},
		helpChance: {"Remove": 0.5, "Pick": 0.5, "Unlock": 1.0},
		enemyTags: {"cage":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture"], ignoreSpells: true, removeOnLeash: true,
		events: [{trigger: "tick", type: "cageDebuff", inheritLinked: true}, {trigger: "tick", type: "callGuardFurniture", inheritLinked: true}, {trigger: "playerMove", type: "removeOnMove", inheritLinked: true}]},
	// Bed trap, always possible to struggle out but takes time
	{removePrison: true, name: "BedTrap", Asset: "Bed", Color: ["#523629", "#4c6885", "#808284"], Group: "ItemDevices", power: 2, weight: 1, immobile: true, alwaysStruggleable: true,
		escapeChance: {"Struggle": 0.2, "Cut": 0.2, "Remove": 0.05, "Pick": -1.0, "Unlock": -1.0},
		struggleMinSpeed: {"Struggle": 0.025}, alwaysEscapable: ["Struggle"],
		struggleMaxSpeed: {"Struggle": 0.05, "Cut": 0.03, "Remove": 0.05}, helpChance: {"Remove": 0.4, "Pick": 0.2, "Unlock": 1.0},
		limitChance: {"Struggle": 0.01, "Cut": 0, "Remove": 0.01, "Pick": 0, "Unlock": 0},
		alwaysDress: [
			{Item: "BedStraps", Group: "ItemAddon", Color: ['Default'], override: false},
		],
		enemyTags: {"bed":100}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Furniture"], ignoreSpells: true, removeOnLeash: true,
		events: [{trigger: "tick", type: "callGuardFurniture", inheritLinked: true}, {trigger: "playerMove", type: "removeOnMove", inheritLinked: true}]},
	//region High security prison restraints
	{inventory: true, name: "HighsecArmbinder", strictness: 0.1, Asset: "LeatherArmbinder", inaccessible: true, LinkableBy: [...KDArmbinderLink], Type: "Strap", Group: "ItemArms", bindarms: true, bindhands: true, Color: "#333333",
		limitChance: {"Unlock": 0.5}, DefaultLock: "Red", power: 12, weight: 2,
		escapeChance: {"Struggle": -0.1, "Cut": 0.1, "Remove": 0.35, "Pick": 0.2}, enemyTags: {"leatherRestraintsHeavy":4, "armbinderSpell": 100}, playerTags: {}, minLevel: 8, allFloors: true, shrine: ["Leather", "Armbinders"]},
	{inventory: true, name: "HighsecShackles", Asset: "SteelAnkleCuffs", Type: "Chained", LinkableBy: ["Wrapping"], Group: "ItemFeet", hobble: true, Color: ["Default", "Default"], DefaultLock: "Red", power: 8, weight: 2,
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 1.1, "Pick": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 7, allFloors: true, shrine: ["Metal", "Cuffs"]},
	{inventory: true, name: "HighsecBallGag", factionColor: [[], [0]], Asset: "HarnessBallGag", strictness: 0.2, gag: 0.75, Type: "Tight", Color: ["Default", "Default"], Group: "ItemMouth", DefaultLock: "Red", power: 8, weight: 2,
		escapeChance: {"Struggle": 0.00, "Cut": 0.0, "Remove": 0.5, "Pick": 0.25}, enemyTags: {"ballGagRestraints" : 4, "gagSpell": 100}, playerTags: {}, minLevel: 5, allFloors: true, shrine: ["Leather", "Latex", "Gags"]},
	{renderWhenLinked: ["Belts"], inventory: true, name: "HighsecLegbinder", Asset: "LegBinder", inaccessible: true, LinkableBy: ["Hobbleskirts", "Belts"], Color: "Default", Group: "ItemLegs", blockfeet: true,
		DefaultLock: "Red", power: 8, weight: 2, escapeChance: {"Struggle": -0.1, "Cut": 0.1, "Remove": 0.35, "Pick": 0.25}, enemyTags: {"legbinderSpell": 10}, playerTags: {}, minLevel: 0, allFloors: true,
		shrine: ["Leather", "Legbinders"]},
	{inventory: true, arousalMode: true, name: "PrisonVibe", Asset: "VibratingDildo", Color: "Default", Group: "ItemVulva", plugSize: 1.0, power: 5, weight: 2, escapeChance: {"Struggle": 10}, enemyTags: {}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Vibes", "Plugs"],
		linkedVibeTags: ["plugs"], allowRemote: true, events: [
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 2, time: 12, edgeOnly: true},
			{trigger:"tick",  type: "PeriodicTeasing", power: 1, time: 48, edgeOnly: true, cooldown: {"normal": 120, "tease": 20}, chance: 0.02},
			{trigger:"tick",  type: "PeriodicTeasing", power: 4, time: 14, edgeOnly: false, cooldown: {"normal": 120, "tease": 20}, chance: 0.005},
		]},
	{inventory: true, arousalMode: true, name: "PrisonBelt", Asset: "PolishedChastityBelt", OverridePriority: 26, Color: "#444444", Group: "ItemPelvis", LinkableBy: ["Ornate"], DefaultLock: "Red", chastity: true, power: 8, weight: 2, escapeChance: {"Struggle": -0.5, "Cut": -0.30, "Remove": 100.0, "Pick": 0.25}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Chastity"]},
	{inventory: true, arousalMode: true, name: "PrisonBelt2", Asset: "OrnateChastityBelt", OverridePriority: 26, Color: ["#272727", "#AA0000"], Group: "ItemPelvis", DefaultLock: "Red", chastity: true, power: 9, weight: 2, escapeChance: {"Struggle": -0.5, "Cut": -0.30, "Remove": 100.0, "Pick": 0.22}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Chastity", "Ornate"]},
	//endregion

	//region Trap items. Note that traps do not respect stamina, so its okay for these to have reasonable maxwill
	{alwaysRender: true, inventory: true, name: "TrapArmbinderHarness", Asset: "LeatherHarness", accessible: true, Color: "Default", Group: "ItemTorso", OverridePriority: 26, LinkableBy: [...KDHarnessLink], power: 3, strictness: 0.1, weight: -100, escapeChance: {"Struggle": -0.1, "Cut": 0.25, "Remove": 0.25, "Pick": 0.15},
		enemyTags: {"leatherRestraintsHeavy":2, "armbinderSpell": 1, "harnessSpell": 1}, playerTags: {"ItemArmsEmpty": -1000, "Armbinders": 100}, minLevel: 4, allFloors: true, shrine: ["Leather", "ArmbinderHarness"],
		maxwill: 0.6, events: [{trigger: "postRemoval", type: "armbinderHarness"}], requireSingleTagToEquip: ["Armbinders", "Boxbinders"]},
	{renderWhenLinked: ["Belts"], inventory: true, trappable: true, name: "TrapArmbinder", inaccessible: true, strictness: 0.1, Asset: "LeatherArmbinder", LinkableBy: [...KDArmbinderLink], Type: "WrapStrap", Group: "ItemArms", Color: "Default", bindarms: true, bindhands: true, power: 6, weight: 2,
		limitChance: {"Struggle": 0.15, "Cut": 0.1, "Unlock": 0.2},
		maxwill: 0.25, escapeChance: {"Struggle": 0.1, "Cut": 0.5, "Remove": 0.35, "Pick": 0.15}, enemyTags: {"trap":100, "leatherRestraintsHeavy":6, "armbinderSpell": 10}, playerTags: {}, minLevel: 4, allFloors: true, shrine: ["Leather", "Armbinders"]},
	{inventory: true, trappable: true, name: "TrapCuffs", Asset: "MetalCuffs", accessible: true, linkCategory: "Cuffs", linkSize: 0.33, LinkableBy: ["Wrapping", "Belts", "Armbinders", "Boxbinders", "Cuffs", "Ties"], Group: "ItemArms",
		Color: "Default", bindarms: true, power: 2, weight: 2, DefaultLock: "Red",
		escapeChance: {"Struggle": -0.5, "Cut": -0.1, "Remove": 10, "Pick": 2.5}, enemyTags: {"trap":100, "cuffsSpell": 10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"]},
	{alwaysRender: true, inventory: true, trappable: true, name: "TrapHarness", strictness: 0.05, Asset: "LeatherStrapHarness", accessible: true, LinkableBy: [...KDHarnessLink], OverridePriority: 26, Color: "#222222", Group: "ItemTorso", power: 2, weight: 2,
		escapeChance: {"Struggle": 0.1, "Cut": 0.3, "Remove": 0.8, "Pick": 1.0}, enemyTags: {"trap":100, "leatherRestraintsHeavy":6, "harnessSpell": 10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Harnesses"]},
	{inventory: true, trappable: true, name: "TrapGag", Asset: "BallGag", factionColor: [[], [0]], gag: 0.35, Type: "Tight", Color: ["Default", "Default"], Group: "ItemMouth", power: 3, weight: 2,
		maxwill: 0.6, escapeChance: {"Struggle": 0.35, "Cut": 0.45, "Remove": 0.3, "Pick": 0.5}, enemyTags: {"trap":100, "leatherRestraintsHeavy":6}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Latex", "Gags"]},
	{inventory: true, trappable: true, name: "TrapBlindfold", Asset: "LeatherBlindfold", LinkableBy: ["Wrapping", "Mask"], Color: "Default", Group: "ItemHead", power: 3, weight: 2,
		maxwill: 0.5, blindfold: 2, escapeChance: {"Struggle": 0.4, "Cut": 0.6, "Remove": 0.3, "Pick": 0.5}, enemyTags: {"trap":100, "leatherRestraintsHeavy":6, "ropeAuxiliary": 4, "blindfoldSpell": 10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Blindfolds"]},
	{inventory: true, trappable: true, name: "TrapBoots", Asset: "BalletHeels", Color: "Default", Group: "ItemBoots", hobble: true, power: 3, weight: 2,
		maxwill: 0.9, escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.4, "Pick": 0.9}, enemyTags: {"trap":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Boots"]},
	{inventory: true, trappable: true, name: "TrapLegirons", Asset: "Irish8Cuffs", LinkableBy: ["Wrapping", "Belts"], Color: "Default", Group: "ItemFeet", blockfeet: true, power: 4, weight: 2,
		escapeChance: {"Struggle": -0.5, "Cut": -0.4, "Remove": 10, "Pick": 2.5}, enemyTags: {"trap":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"]},
	{inventory: true, arousalMode: true, trappable: true, name: "TrapBelt", Asset: "PolishedChastityBelt", OverridePriority: 26, Color: "Default", Group: "ItemPelvis", LinkableBy: ["Ornate"], chastity: true, power: 5, weight: 0, DefaultLock: "Red",
		maxwill: 0.75, escapeChance: {"Struggle": -0.5, "Cut": -0.10, "Remove": 10.0, "Pick": 0.5}, enemyTags: {"trap":10, "maidRestraints": 6, "maidRestraintsLight": 6, "genericChastity": 12, "chastitySpell": 10,}, playerTags: {"ItemVulvaEmpty" : -4, "ItemVulvaPiercingsEmpty" : -4}, minLevel: 0, allFloors: true, shrine: ["Metal", "Chastity"]},
	{inventory: true, arousalMode: true, name: "TrapBeltProto", Asset: "FuturisticChastityBelt", Modules: [3, 1, 1, 1, 1], OverridePriority: 26, Color: ['#5E5E6B', '#4A5FC1', '#CD9F0E', '#43B2BA', '#A68009', '#F8BD01', '#3868E8', '#A68009', '#FFC81D'],
		Group: "ItemPelvis", LinkableBy: ["Ornate"], chastity: true, power: 15, weight: 0, DefaultLock: "Red",
		maxwill: 0.75, escapeChance: {"Struggle": -0.8, "Cut": -0.50, "Remove": 1.0, "Pick": -0.1}, enemyTags: {"protoRestraints": 10}, playerTags: {"ItemVulvaEmpty" : -5, "ItemVulvaPiercingsEmpty" : -5}, minLevel: 7, allFloors: true, shrine: ["Metal", "Chastity"]},
	{inventory: true, arousalMode: true, trappable: true, name: "TrapBra", Asset: "PolishedChastityBra", OverridePriority: 26, Color: "Default", Group: "ItemBreast", LinkableBy: ["Ornate"], chastitybra: true, power: 4, weight: 0, DefaultLock: "Red",
		maxwill: 0.75, escapeChance: {"Struggle": -0.5, "Cut": -0.10, "Remove": 10.0, "Pick": 0.5}, enemyTags: {"trap":10, "maidRestraints": 6, "maidRestraintsLight": 6, "genericChastity": 10}, playerTags: {"ItemNipplesEmpty" : -5}, minLevel: 0, allFloors: true, shrine: ["Metal", "Chastity"]},
	{inventory: true, arousalMode: true, name: "TrapVibe", Asset: "TapedClitEgg", Color: "Default", Group: "ItemVulvaPiercings", power: 1, weight: 2,
		escapeChance: {"Struggle": 10}, enemyTags: {"trap":100, "maidRestraintsLight": 5, "genericToys": 2}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Vibes"], linkedVibeTags: ["teaser"], vibeLocation: "ItemVulvaPiercings",
		allowRemote: true, events: [
			{trigger:"playerCast",  type:"MagicallySensitive", chance: 0.5, power: 1, time: 12, edgeOnly: true},
			{trigger:"remoteVibe",  type:"RemoteActivatedVibe", power: 1, time: 12, edgeOnly: true},
		]},
	{inventory: true, arousalMode: true, name: "TrapVibeProto", Asset: "TapedClitEgg", Color: "Default", Group: "ItemVulvaPiercings", power: 1, weight: 2,
		escapeChance: {"Struggle": 10}, enemyTags: {"protoToys": 2}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Vibes"], linkedVibeTags: ["teaser", "piercings"], vibeLocation: "ItemVulvaPiercings",
		allowRemote: true, events: [
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 1, time: 48, edgeOnly: true},
			{trigger:"tick",  type: "PeriodicTeasing", power: 2, time: 20, edgeOnly: true, cooldown: {"normal": 90, "tease": 20}, chance: 0.02},
		]},
	{inventory: true, arousalMode: true, name: "TrapPlug", Asset: "VibratingDildo", Color: "Default", Group: "ItemVulva", plugSize: 1.0, power: 3, weight: 2,
		escapeChance: {"Struggle": 10}, enemyTags: {"trap":10, "maidRestraintsLight": 2}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Vibes", "Plugs"], linkedVibeTags: ["plugs"],
		allowRemote: true, events: [
			{trigger:"tick",  type: "PeriodicTeasing", power: 1, time: 12, edgeOnly: true, cooldown: {"normal": 60, "tease": 20}, chance: 0.02},
			{trigger:"tick",  type: "PeriodicDenial", power: 1, time: 36, edgeOnly: true, cooldown: {"normal": 70, "tease": 20}, chance: 0.02},
			{trigger:"tick",  type: "PeriodicTeasing", power: 3, time: 12, edgeOnly: false, cooldown: {"normal": 75, "tease": 20}, chance: 0.005},
		]},
	{inventory: true, arousalMode: true, name: "TrapPlug2", Asset: "VibratingDildo", Color: "Default", Group: "ItemVulva", plugSize: 1.0, power: 4, weight: 2,
		escapeChance: {"Struggle": 10}, enemyTags: {"trap":0}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Vibes", "Plugs"], linkedVibeTags: ["plugs"],
		allowRemote: true, events: [
			{trigger:"tick",  type: "PeriodicTeasing", power: 1, time: 24, edgeOnly: true, cooldown: {"normal": 30, "tease": 8}, chance: 0.05},
		]},
	{inventory: true, arousalMode: true, name: "TrapPlug3", Asset: "VibratingDildo", Color: "Default", Group: "ItemVulva", plugSize: 1.0, power: 5, weight: 2,
		escapeChance: {"Struggle": 10}, enemyTags: {"trap":0}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Vibes", "Plugs"], linkedVibeTags: ["plugs"],
		allowRemote: true, events: [
			{trigger:"tick",  type: "PeriodicDenial", power: 2, time: 36, cooldown: {"normal": 150, "tease": 40}, chance: 0.05},
		]},
	{inventory: true, trappable: true, name: "TrapMittens", Asset: "LeatherMittens", Color: "Default", Group: "ItemHands", bindhands: true, power: 5, weight: 0,
		maxwill: 0.5, escapeChance: {"Struggle": 0.05, "Cut": 0.4, "Remove": 0.15, "Pick": 1.0}, enemyTags: {"leatherRestraintsHeavy":6}, playerTags: {"ItemHandsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Leather", "Mittens"]},
	// These ones are tougher
	{inventory: true, arousalMode: true, trappable: true, name: "TrapBelt2", Asset: "OrnateChastityBelt", OverridePriority: 26, Color: ["#272727", "#D3B24B"], Group: "ItemPelvis", LinkableBy: ["Shadow"], chastity: true, power: 9, weight: 0, DefaultLock: "Gold",
		escapeChance: {"Struggle": -0.5, "Cut": -0.125, "Remove": 10.0, "Pick": 0.1}, enemyTags: {"genericChastity": 8, "ornateChastity": 8}, playerTags: {}, minLevel: 4, allFloors: true, shrine: ["Metal", "Chastity", "Ornate"]},
	{inventory: true, arousalMode: true, trappable: true, name: "TrapBra2", Asset: "FuturisticBra2", OverridePriority: 26, Color: ['#5E5E6B', '#F8BD01', '#5E5E6B', '#5E5E6B', '#F8BD01', '#5E5E6B'], Group: "ItemBreast", chastitybra: true, power: 9, weight: 0, DefaultLock: "Gold",
		escapeChance: {"Struggle": -0.5, "Cut": -0.125, "Remove": 10.0, "Pick": 0.1}, enemyTags: {"genericChastity": 8, "ornateChastity": 8}, playerTags: {}, minLevel: 4, allFloors: true, shrine: ["Metal", "Chastity", "Ornate"]},
	//endregion

	// Stainless Plugs
	{inventory: true, arousalMode: true, name: "SteelPlugF", Asset: "VibratingDildo", Color: "#ffffff", Group: "ItemVulva", plugSize: 1.5, power: 1, weight: 2,
		escapeChance: {"Struggle": 10}, enemyTags: {"plugSpell":1}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Plugs"],
	},
	{inventory: true, arousalMode: true, name: "SteelPlugR", Asset: "VibratingDildo", Color: "#ffffff", Group: "ItemButt", plugSize: 1.5, power: 1, weight: 2,
		escapeChance: {"Struggle": 10}, enemyTags: {"plugSpell":1}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Plugs"],
	},

	// Generic ball gag thats stronger than the trap one
	{inventory: true, name: "MagicGag", Asset: "BallGag", factionColor: [[], [0]], gag: 0.4, Type: "Tight", Color: ["Default", "Default"], Group: "ItemMouth", DefaultLock: "Red", power: 5, weight: 2,
		escapeChance: {"Struggle": 0.0, "Cut": 0.45, "Remove": 0.65, "Pick": 0.5},
		maxwill: 0.9, enemyTags: {"ballGagRestraints" : 4, "gagSpell": 10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Latex", "Gags"]},
	{inventory: true, name: "MagicGag2", Asset: "BallGag", factionColor: [[], [0]], gag: 0.5, Type: "Tight", Color: ["Default", "##ff00ff"], Group: "ItemMouth", DefaultLock: "Red", magic: true, power: 8, weight: 2,
		escapeChance: {"Struggle": -0.1, "Cut": 0.12, "Remove": 0.45, "Pick": 0.5},
		enemyTags: {"ballGagRestraintsMagic" : 4, "gagSpellStrong": 10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Latex", "Gags"]},

	// Generic stronger gag
	{inventory: true, trappable: true, name: "PanelGag", Asset: "HarnessPanelGag", gag: 1.0, Color: "#888888", Group: "ItemMouth2", power: 5, strictness: 0.2, weight: 2, escapeChance: {"Struggle": 0, "Cut": 0.3, "Remove": 0.4, "Pick": 0.5},
		maxwill: 0.75, enemyTags: {"leatherRestraintsHeavy":8, "ropeAuxiliary": 4}, playerTags: {}, minLevel: 4, allFloors: true, shrine: ["Leather", "Gags"]},
	{inventory: true, name: "PanelPlugGag", Asset: "OTNPlugGag", Type: "Plug", gag: 1.0, Color: ["#888888", "#444444", "#aaaaaa"], Group: "ItemMouth", strictness: 0.4, power: 7, weight: 1,
		escapeChance: {"Struggle": -0.1, "Cut": 0.2, "Remove": 0.15, "Pick": 0.07},
		maxwill: 0.1, enemyTags: {"leatherRestraintsHeavy" : 10, "ropeAuxiliary": 1}, playerTags: {}, minLevel: 8, allFloors: true, shrine: ["Leather", "Gags"]},

	// Simple cloth stuff
	{inventory: true, name: "ClothGag", Asset: "ClothGag", gag: 0.35, Type: "Knotted", Color: "#959595", Group: "ItemMouth2", power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		maxwill: 0.75, enemyTags: {"clothRestraints":8, "ropeAuxiliary": 1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Gags"]},
	{inventory: true, name: "ClothGagOver", Asset: "ClothGag", gag: 0.35, Type: "OTN", Color: "#959595", Group: "ItemMouth3", power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		maxwill: 0.75, enemyTags: {"clothRestraints":4, "ropeAuxiliary": 1}, playerTags: {"ItemMouthEmpty": -4, "ItemMouth2Empty": -4}, minLevel: 0, allFloors: true, shrine: ["Rope", "Gags"]},
	{inventory: true, name: "ClothBlindfold", Asset: "ClothBlindfold", Color: "#959595", LinkableBy: ["Wrapping", "Mask"], Group: "ItemHead", power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		affinity: {Struggle: ["Sticky", "Hook"], Remove: ["Hook"],},
		maxwill: 0.85, blindfold: 1, enemyTags: {"clothRestraints":8, "ropeAuxiliary": 1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Blindfolds"]},

	//region Baast warriors only apply two things so its okay that these have a high maxwill
	{inventory: true, name: "KittyGag", Asset: "KittyHarnessPanelGag", gag: 0.6, Color: ["#FFFFFF", "#FFFFFF", "#000000", "#E496E7"], Group: "ItemMouth2", DefaultLock: "Red", power: 5, weight: 2, escapeChance: {"Struggle": 0, "Cut": 0.3, "Remove": 0.25, "Pick": 0.2},
		enemyTags: {"kittyRestraints":8}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags"]},
	{inventory: true, name: "KittyMuzzle", Asset: "KittyGag", gag: 1.0, Color: ["#FFFFFF", "#000000", "#E496E7"], Group: "ItemMouth3", DefaultLock: "Red", power: 5, weight: -6, escapeChance: {"Struggle": -0.1, "Cut": 0.18, "Remove": 0.4, "Pick": 0.2},
		maxwill: 0.9, enemyTags: {"kittyRestraints":6}, playerTags: {"ItemMouth2Full": 4, "ItemMouthFull": 4}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags"]},
	{inventory: true, name: "KittyBlindfold", Asset: "KittyBlindfold", blindfold: 2, LinkableBy: ["Wrapping", "Mask"], Color: ["#FFFFFF","#000000","#E48FE9"], Group: "ItemHead", DefaultLock: "Red", power: 5, weight: 2, escapeChance: {"Struggle": 0.1, "Cut": 0.3, "Remove": 0.25, "Pick": 0.2},
		enemyTags: {"kittyRestraints":8}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags"]},
	{inventory: true, name: "KittyPaws", Asset: "PawMittens", Color: ["#FFFFFF","#FFFFFF","#FFFFFF","#B38295"], Group: "ItemHands", bindhands: true, power: 5, weight: 2, escapeChance: {"Struggle": 0.1, "Cut": 0.3, "Remove": 0.3, "Pick": 0.2},
		maxwill: 0.9, enemyTags: {"kittyRestraints":8}, playerTags: {}, minLevel: 4, allFloors: true, shrine: ["Leather", "Mittens"]},
	{inventory: true, name: "KittySuit", Asset: "BitchSuit", Color: "Default", Group: "ItemArms", DefaultLock: "Red", bindarms: true, bindhands: true, power: 11, weight: 0, escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": -0.1, "Pick": 0.15},
		events:[
			{trigger:"defeat",  type:"Kittify"},
		],
		helpChance: {"Remove": 0.1}, maxwill: 0.15, enemyTags: {"kittyRestraints":3}, playerTags: {}, minLevel: 7, allFloors: true, shrine: ["Latex", "Petsuits"]},
	{inventory: true, name: "MagicPetsuit", Asset: "StrictLeatherPetCrawler", magic: true, Color: "Default", Group: "ItemArms", DefaultLock: "Red", bindarms: true, bindhands: true, power: 10, weight: 0, escapeChance: {"Struggle": -0.15, "Cut": 0.12, "Remove": -0.05, "Pick": 0.15},
		helpChance: {"Remove": 0.2}, maxwill: 0.15, enemyTags: {"petsuitSpell": 1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Petsuits"]},
	// Only apply if already wearing KittySuit
	{inventory: true, name: "KittyPetSuit", Asset: "BitchSuit", Color: "Default", Group: "ItemArms", DefaultLock: "Blue", bindarms: true, bindhands: true, blockfeet: true, power: 12, weight: 0, escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": -0.1, "Pick": 0.15},
		alwaysDress: [
			{Item: "KittenEars2", Group: "HairAccessory2", Color: ['Default'], override: false, useHairColor: true,},
			{Item: "TailStrap", Group: "TailStraps", Color: ['Default'], override: false, useHairColor: true,},
			//{Item: "LeatherBreastBinder", Group: "Bra", Color: ['Default'], drawOver: true},
			//{Item: "LeatherHarness", Group: "ItemTorso", Color: ['Default'], drawOver: true}
		],
		helpChance: {"Remove": 0.01}, maxwill: 0.15, enemyTags: {"kittyRestraints":0}, playerTags: {}, minLevel: 7, allFloors: true, shrine: ["Latex", "Petsuits"]},
	//endregion

	//region These restraints are easy, so they dont have maxwill
	{inventory: true, name: "WristShackles", Asset: "WristShackles", linkCategory: "Cuffs", linkSize: 0.33, LinkableBy: ["Wrapping", "Belts", "Armbinders", "Cuffs", "Ties"], Group: "ItemArms", Color: "Default", bindarms: true, Type: "Behind", power: 1, weight: 2, DefaultLock: "Red", escapeChance: {"Struggle": 0.1, "Cut": -0.25, "Remove": 10, "Pick": 5}, enemyTags: {"shackleRestraints":7, "handcuffer": 6, "Unchained": -8}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"]},
	{inventory: true, name: "AnkleShackles", Asset: "AnkleShackles", LinkableBy: [...KDBindable], Group: "ItemFeet", Color: "Default", hobble: true, power: 2, weight: 2, DefaultLock: "Red", escapeChance: {"Struggle": 0.1, "Cut": -0.3, "Remove": 10, "Pick": 5}, enemyTags: {"shackleRestraints":2}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"]},
	{inventory: true, name: "LegShackles", Asset: "LeatherLegCuffs", LinkableBy: ["Legbinders", "Hobbleskirts", "Belts", "Ties"], Group: "ItemLegs", hobble: true, Type: "Chained", Color: ["Default", "#888888", "#AAAAAA"], power: 3, weight: 2, DefaultLock: "Red", escapeChance: {"Struggle": 0.2, "Cut": -0.3, "Remove": 10, "Pick": 5}, enemyTags: {"shackleRestraints":2}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"]},
	{inventory: true, name: "FeetShackles", Asset: "SteelAnkleCuffs", LinkableBy: [...KDBindable], Link: "FeetShackles2", Group: "ItemFeet", hobble: true, Type: "Chained", Color: ["Default", "Default"], power: 5, weight: 2, DefaultLock: "Red", escapeChance: {"Struggle": 0.15, "Cut": -0.3, "Remove": 10, "Pick": 5}, enemyTags: {"shackleRestraints":2}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.2, subMult: 0.5, noLeash: true}]},
	{name: "FeetShackles2", Asset: "SteelAnkleCuffs", LinkableBy: ["Wrapping"], UnLink: "FeetShackles", Group: "ItemFeet", blockfeet: true, Type: "Closed", Color: ["Default", "Default"], power: 5, weight: 2, DefaultLock: "Red", escapeChance: {"Struggle": 0.15, "Cut": -0.3, "Remove": 10, "Pick": 5}, enemyTags: {"shackleRestraints":2}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}]},
	{inventory: true, name: "SteelMuzzleGag", gag: 1.0, Asset: "MuzzleGag", Group: "ItemMouth3", Color: "#999999", power: 3, weight: 2, DefaultLock: "Red", escapeChance: {"Struggle": 0.2, "Cut": -0.25, "Remove": 10, "Pick": 5}, enemyTags: {"shackleGag":1}, playerTags: {"ItemMouthFull":1}, minLevel: 0, allFloors: true, shrine: ["Metal", "Gags"]},
	//endregion

	{name: "ComfyGag", gag: 1.0, Asset: "MuzzleGag", Group: "ItemMouth3", Color: "#cccccc", power: 1, weight: 4, escapeChance: {"Struggle": 0.2, "Cut": 0.2, "Remove": 0.4, "Pick": 5}, maxwill: 0.9,
		enemyTags: {"comfyRestraints":1}, playerTags: {"ItemMouthFull":1}, minLevel: 0, allFloors: true, shrine: ["Gags"]},
	{name: "ComfyStraitjacket", Asset: "HighSecurityStraitJacket", Modules: [0, 1, 1], Color: ['#cccccc', '#cccccc', '#cccccc'], Group: "ItemArms", power: 3, weight: 1, bindarms: true, bindhands: true,
		limitChance: {"Struggle": 0.2, "Cut": 0.07, "Remove": 0.35, "Unlock": 0.75}, // Hard to escape the arms box by struggling
		escapeChance: {"Struggle": 0.2, "Cut": 0.2, "Remove": 0.4, "Pick": 5}, enemyTags: {"comfyRestraints": 1}, playerTags: {}, minLevel: 0, maxwill: 0.35,
		allFloors: true, shrine: ["Straitjackets"]},

	{curse: "5Keys", name: "GhostCollar", Asset: "OrnateCollar", Group: "ItemNeck", LinkableBy: ["HighCollars"], magic: true, Color: ["#555555", "#AAAAAA"], power: 20, weight: 0, difficultyBonus: 30,
		escapeChance: {"Struggle": -100, "Cut": -0.8, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: []},

	{renderWhenLinked: ["Ties"], inventory: true, name: "SturdyLeatherBeltsArms", accessible: true, Asset: "SturdyLeatherBelts", LinkableBy: ["Wrapping", "Ties"], Type: "Three", Color: "Default", Group: "ItemArms", bindarms: true, power: 2.5, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": 0.5, "Remove": 0.22},
		maxwill: 0.9, enemyTags: {"leatherRestraints":6}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Leather", "Belts", "ArmBind"]},
	{renderWhenLinked: ["Ties"], inventory: true, name: "SturdyLeatherBeltsFeet", accessible: true, Asset: "SturdyLeatherBelts", LinkableBy: ["Wrapping", "Ties"], Type: "Three", Color: "Default", Group: "ItemFeet", blockfeet: true, power: 2, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": 0.5, "Remove": 0.5},
		maxwill: 1.0, enemyTags: {"leatherRestraints":6}, playerTags: {"ItemLegsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Leather", "Belts", "LegBind"]},
	{renderWhenLinked: ["Legbinders", "Hobbleskirts", "Ties"], accessible: true, inventory: true, name: "SturdyLeatherBeltsLegs", Asset: "SturdyLeatherBelts", LinkableBy: ["Wrapping", "Legbinders", "Hobbleskirts", "Ties"], Type: "Two", Color: "Default", Group: "ItemLegs", hobble: true, power: 2, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": 0.5, "Remove": 0.5},
		maxwill: 0.8, enemyTags: {"leatherRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Leather", "Belts", "LegBind"]},

	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "LeatherArmCuffs", DefaultLock: "Red", accessible: true, Asset: "LeatherCuffs", linkCategory: "Cuffs", linkSize: 0.55, LinkableBy: ["Armbinders", "Straitjackets", "Petsuits", "Boxbinders", ...KDBindable], Link: "LeatherArmCuffs2", Color: ['Default', 'Default'], Group: "ItemArms", bindarms: false, power: 3, weight: 0,
		escapeChance: {"Struggle": 0.1, "Cut": 0.1, "Remove": 0.25, "Pick": 0.35}, enemyTags: {"leatherRestraintsHeavy":4, "dragonRestraints":6, "handcuffer": 10, "leathercuffsSpell": 8}, playerTags: {"ItemArmsFull":-2, "Unchained": 9}, minLevel: 0, allFloors: true, shrine: ["Leather", "Cuffs", "ArmCuffsBase"],
		maxwill: 1.0, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.33}, {trigger: "defeat", type: "linkItem", chance: 1.0}]},
	{name: "LeatherArmCuffs2", accessible: true, Asset: "LeatherCuffs", Type: "Wrist", LinkableBy: ["Armbinders", "Boxbinders", ...KDBindable], Link: "LeatherArmCuffs3", UnLink: "LeatherArmCuffs", Color: ['Default', 'Default'], Group: "ItemArms", bindarms: true, power: 4, weight: 0,
		escapeChance: {"Struggle": 0, "Cut": 0.1, "Remove": 0.2, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Leather", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.33}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.08, inheritLinked: true}]},
	{name: "LeatherArmCuffs3", accessible: true, Asset: "LeatherCuffs", Type: "Both", LinkableBy: ["Armbinders", ...KDBindable], UnLink: "LeatherArmCuffs4", Color: ['Default', 'Default'], Group: "ItemArms", bindarms: true, power: 5, weight: 0, strictness: 0.1,
		escapeChance: {"Struggle": -0.1, "Cut": 0.1, "Remove": -0.1, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Leather", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.12, inheritLinked: true}]},
	{name: "LeatherArmCuffs4", accessible: true, Asset: "LeatherCuffs", Type: "Elbow", LinkableBy: ["Armbinders", ...KDBindable], Link: "LeatherArmCuffs3", UnLink: "LeatherArmCuffs", Color: ['Default', 'Default'], Group: "ItemArms", bindarms: true, power: 4, weight: 0,
		escapeChance: {"Struggle": 0, "Cut": 0.1, "Remove": -0.15, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Leather", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.5}, {trigger: "beforeStruggleCalc", type: "elbowCuffsBlock", inheritLinked: true}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}]},

	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "SteelArmCuffs", DefaultLock: "Blue", accessible: true, Asset: "SteelCuffs", linkCategory: "Cuffs", linkSize: 0.55, LinkableBy: ["Armbinders", "Straitjackets", "Petsuits", "Boxbinders", ...KDBindable], Link: "SteelArmCuffs2", Color: ['Default', 'Default'], Group: "ItemArms", bindarms: false, power: 4, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": -0.5, "Remove": 0.15, "Pick": 0.25}, enemyTags: {"steelCuffs":4}, playerTags: {"ItemArmsFull":-2}, minLevel: 4, allFloors: true, shrine: ["Metal", "Cuffs", "ArmCuffsBase"],
		maxwill: 0.9, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.4}, {trigger: "defeat", type: "linkItem", chance: 1.0}]},
	{name: "SteelArmCuffs2", accessible: true, Asset: "SteelCuffs", Type: "Wrist", LinkableBy: ["Armbinders", "Boxbinders", ...KDBindable], UnLink: "SteelArmCuffs", Color: ['Default', 'Default'], Group: "ItemArms", bindarms: true, power: 4, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": -0.5, "Remove": 0.2, "Pick": 0.15}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.08, inheritLinked: true}]},


	// Magnetic cuffs
	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "MagneticArmCuffs", accessible: true, Asset: "SteelCuffs", linkCategory: "Cuffs", linkSize: 0.55,
		LinkableBy: ["Armbinders", "Straitjackets", "Petsuits", "Boxbinders", ...KDBindable], Link: "MagneticArmCuffs2", Color: ['#444444', '#444444'], Group: "ItemArms", bindarms: false, power: 5, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": -0.5, "Remove": 0.15, "Pick": 0.15}, enemyTags: {"magnetCuffs":10}, playerTags: {"ItemArmsFull":-4}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs", "ArmCuffsBase"],
		maxwill: 0.9, events: [
			{trigger: "beforePlayerDamage", type: "linkItemOnDamageType", sfx: "LightJingle", damage: "electric", chance: 1.0, requiredTag: "locked"},
			{trigger: "beforePlayerDamage", type: "lockItemOnDamageType", sfx: "LightJingle", damage: "electric", chance: 1.0, lock: "Blue"},
			{trigger: "defeat", type: "linkItem", chance: 1.0}
		]},
	{name: "MagneticArmCuffs2", accessible: true, Asset: "SteelCuffs", Type: "Wrist", LinkableBy: ["Armbinders", "Boxbinders", ...KDBindable], UnLink: "MagneticArmCuffs", Color: ['#444444', '#444444'],
		Group: "ItemArms", bindarms: true, power: 5, weight: 0, helpChance: {"Remove": 0.25},
		escapeChance: {"Struggle": 0.05, "Remove": -0.2}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.08, inheritLinked: true}]},


	{inventory: true, nonbinding: true, name: "MagneticAnkleCuffs", Asset: "SteelAnkleCuffs", LinkableBy: [...KDBindable], Link: "MagneticAnkleCuffs2", Color: "#444444", Group: "ItemFeet", power: 5, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": 0.1, "Pick": 0.15},
		enemyTags: {"magnetCuffs": 5}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs", "AnkleCuffsBase"],
		maxwill: 0.8, events: [
			{trigger: "beforePlayerDamage", type: "linkItemOnDamageType", sfx: "LightJingle", damage: "electric", chance: 1.0, requiredTag: "locked"},
			{trigger: "beforePlayerDamage", type: "lockItemOnDamageType", sfx: "LightJingle", damage: "electric", chance: 1.0, lock: "Blue"},
			{trigger: "defeat", type: "linkItem", chance: 1.0}
		]},
	{name: "MagneticAnkleCuffs2", Asset: "SteelAnkleCuffs", LinkableBy: [...KDBindable], UnLink: "MagneticAnkleCuffs", Type: "Closed", Color: "#444444", Group: "ItemFeet", blockfeet: true, power: 5, weight: 0,
		escapeChance: {"Struggle": 0.05, "Remove": 0.05}, helpChance: {"Remove": 0.25},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}]},

	// End magnetic cuffs

	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "ScaleArmCuffs", accessible: true, Asset: "LeatherCuffs", linkCategory: "Cuffs", linkSize: 0.55, LinkableBy: ["Armbinders", "Straitjackets", "Petsuits", "Boxbinders", ...KDBindable], Link: "ScaleArmCuffs2", Color: ["#9B1818", "#675F50"], Group: "ItemArms", bindarms: false, power: 8, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": -0.05, "Remove": 0.25, "Pick": 0.35}, enemyTags: {"dragonRestraints":1}, playerTags: {"ItemArmsFull":2}, minLevel: 7, allFloors: true, shrine: ["Leather", "Cuffs", "ArmCuffsBase"],
		maxwill: 0.7, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.33}, {trigger: "defeat", type: "linkItem", chance: 1.0}]},
	{name: "ScaleArmCuffs2", accessible: true, Asset: "LeatherCuffs", Type: "Wrist", LinkableBy: ["Armbinders", "Boxbinders", ...KDBindable], Link: "ScaleArmCuffs3", UnLink: "MithrilArmCuffs", Color: ["#9B1818", "#675F50"], Group: "ItemArms", bindarms: true, power: 9, weight: 0, escapeChance: {"Struggle": -0.1, "Cut": -0.05, "Remove": 0.2, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Leather", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.33}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.08, inheritLinked: true}]},
	{name: "ScaleArmCuffs3", accessible: true, Asset: "LeatherCuffs", Type: "Both", LinkableBy: ["Armbinders", ...KDBindable], UnLink: "ScaleArmCuffs4", Color: ["#9B1818", "#675F50"], Group: "ItemArms", bindarms: true, power: 9, weight: 0, strictness: 0.1, escapeChance: {"Struggle": -0.15, "Cut": -0.05, "Remove": -0.1, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Leather", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.12, inheritLinked: true}]},
	{name: "ScaleArmCuffs4", accessible: true, Asset: "LeatherCuffs", Type: "Elbow", LinkableBy: ["Armbinders", ...KDBindable], Link: "ScaleArmCuffs3", UnLink: "ScaleArmCuffs", Color: ["#9B1818", "#675F50"], Group: "ItemArms", bindarms: true, power: 9, weight: 0, escapeChance: {"Struggle": -0.15, "Cut": -0.05, "Remove": -0.15, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Leather", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.5}, {trigger: "beforeStruggleCalc", type: "elbowCuffsBlock", inheritLinked: true}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}]},

	//region Maid
	{inventory: true, name: "MaidJacket", Asset: "Bolero", Color: ["#191919", "#A3A3A3"], Group: "ItemArms", bindarms: true, bindhands: true, power: 9, weight: 0, strictness: 0.2,
		limitChance: {"Struggle": 0.12, "Cut": 0.03, "Remove": 0.1, "Unlock": 0.75}, // Hard to escape the arms box by struggling
		escapeChance: {"Struggle": -0.175, "Cut": 0.1, "Remove": 0.15, "Pick": 0.15},
		maxwill: 0.3, enemyTags: {"maidRestraints":5}, playerTags: {"ItemArmsFull":-2}, minLevel: 7, allFloors: true, shrine: ["Latex", "Straitjackets"]},
	{alwaysRender: true, inventory: true, name: "MaidDress", inaccessible: true, Type: "Strap", Asset: "LeatherArmbinder", strictness: 0.25, Color: ['#191919'], Group: "ItemArms", LinkableBy: ["Armbinders"], bindarms: true, bindhands: true, power: 8, weight: 0,
		escapeChance: {"Struggle": -0.175, "Cut": 0.1, "Remove": -0.2, "Pick": 0.15},
		limitChance: {"Struggle": 0.12, "Cut": 0.03, "Remove": 0.1, "Unlock": 0.75}, // Hard to escape the arms box by struggling
		alwaysDress: [
			{Item: "SleevelessCatsuit", Group: "Suit", Color: "#aaaaaa", override: true},
			{Item: "MaidApron2", Group: "Cloth", Color: "Default", override: true},
			{Item: "FullLatexBra2", Group: "Bra", Color: ["#333333", "#aaaaaa"], override: true},
			{Item: "Pantyhose2", Group: "SuitLower", Color: "#939393", override: true},
			{Item: "LaceBands", Group: "Bracelet", Color: ['Default', '#151515'], override: true},
			{Item: "MageSkirt", Group: "ClothLower", Color: ["#676767", "#2E2E2E"], override: true},
			{Item: "Corset4", Group: "Corset", Color: "#4B4B4B", override: true},
			{Item: "Band1", Group: "Hat", Color: "#767676", override: true},
			{Item: "Shoes5", Group: "Shoes", Color: "#575757", override: true},
			{Item: "Socks6", Group: "Socks", Color: ['#080808', 'Default'], override: true}
		], maxwill: 0.3, enemyTags: {"maidRestraints":5}, playerTags: {"ItemArmsFull":-2}, minLevel: 7, allFloors: true, shrine: ["Latex", "Armbinders", "BindingDress"]},
	{inventory: true, name: "MaidBelt", Asset: "LeatherBelt", Color: "#DBDBDB", Group: "ItemLegs", LinkableBy: ["Wrapping", "Legbinders", "Hobbleskirts", "Ties"], hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": 0.05, "Remove": 0.1, "Pick": 0.25},
		maxwill: 1.0, enemyTags: {"maidRestraints":10, "maidRestraintsLight":1}, playerTags: {"ItemLegsFull":-2}, minLevel: 2, allFloors: true, shrine: ["Leather", "Belts"]},
	{inventory: true, name: "MaidAnkleCuffs", Asset: "SteelAnkleCuffs", LinkableBy: [...KDBindable], Link: "MaidAnkleCuffs2", DefaultLock: "Blue", Type: "Chained", Color: "Default", Group: "ItemFeet", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": 0.1, "Pick": 0.15},
		enemyTags: {"maidRestraints":7, "steelCuffs": 5}, playerTags: {"ItemFeetFull":-2}, minLevel: 4, allFloors: true, shrine: ["Metal", "Cuffs", "AnkleCuffsBase"],
		maxwill: 0.8, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.2, subMult: 0.5, noLeash: true}]},
	{name: "MaidAnkleCuffs2", Asset: "SteelAnkleCuffs", LinkableBy: [...KDBindable], UnLink: "MaidAnkleCuffs", Type: "Closed", Color: "Default", Group: "ItemFeet", blockfeet: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": 0.1, "Pick": 0.15},
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}]},
	{inventory: true, name: "MaidCollar", Asset: "HighCollar", Color: ["#C9C9C9", "#FFFFFF"], Group: "ItemNeck", LinkableBy: ["HighCollars"], power: 11, weight: 0,
		escapeChance: {"Struggle": -0.3, "Cut": -0.25, "Remove": 0.4, "Pick": -0.1},
		maxwill: 0.25, enemyTags: {"maidRestraints":3, "maidCollar":1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Collars", "HighCollars"]},
	{inventory: true, name: "MaidGag", gag: 1.0, Asset: "BallGagMask", Color: "Default", Group: "ItemMouth2", power: 8, weight: 0,
		limitChance: {"Struggle": 0.12},
		escapeChance: {"Struggle": -0.18, "Cut": 0.05, "Remove": 0.33, "Pick": 0.15},
		maxwill: 0.75, enemyTags: {"maidRestraints":7}, playerTags: {}, minLevel: 4, allFloors: true, shrine: ["Leather", "Gags"]},
	// Maid chastity.
	{inventory: true, arousalMode: true, name: "MaidCBelt", Asset: "PolishedChastityBelt", OverridePriority: 26, Color: "Default", Group: "ItemPelvis", LinkableBy: ["Ornate"], chastity: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": 0.5, "Pick": 0.12},
		maxwill: 0.75, enemyTags: {"maidVibeRestraints": 200, "maidVibeRestraintsLimited": 100}, playerTags: {"ItemVulvaEmpty" : -50, "ItemVulvaPiercingsEmpty" : -50}, minLevel: 0, allFloors: true, shrine: ["Metal", "Chastity"]},
	{inventory: true, arousalMode: true, name: "MaidVibe", Asset: "TapedClitEgg", Color: "Default", Group: "ItemVulvaPiercings", power: 4, weight: 2, escapeChance: {"Struggle": 10},
		enemyTags: {"maidVibeRestraints": 1000, "maidVibeRestraintsLimited": 100}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Vibes"], linkedVibeTags: ["teaser"], vibeLocation: "ItemVulva",
		allowRemote: true, events: [
			{trigger:"playerCast",  type: "MagicallySensitive", chance: 0.5, power: 2, time: 12, edgeOnly: true},
			{trigger:"struggle",  type: "VibeOnStruggle", chance: 1.0, power: 2, time: 12, edgeOnly: true},
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 2, time: 12, edgeOnly: true},
			{trigger:"tick",  type: "PeriodicTeasing", power: 2, time: 32, edgeOnly: true, cooldown: {"normal": 90, "tease": 20}, chance: 0.015},
		]},
	//endregion

	//region Dragon
	{inventory: true, name: "DragonStraps", Asset: "ThinLeatherStraps", LinkableBy: ["Boxbinders"], Color: "#9B1818", Group: "ItemArms", bindarms: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.175, "Cut": -0.05, "Remove": 0.1, "Pick": 0.25},
		maxwill: 0.7, enemyTags: {"dragonRestraints":6}, playerTags: {"ItemArmsFull":-2}, minLevel: 4, allFloors: true, shrine: ["Leather", "Belts"]},
	{inventory: true, name: "DragonLegCuffs", Asset: "LeatherLegCuffs", LinkableBy: ["Legbinders", "Ties", "Belts", "Hobbleskirts"], Type: "Chained", Color: ["Default", "#9B1818", "#675F50"], Group: "ItemLegs", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": -0.05, "Remove": 0.3, "Pick": 0.25},
		maxwill: 0.8, enemyTags: {"dragonRestraints":6}, playerTags: {"ItemLegsFull":-2}, minLevel: 4, allFloors: true, shrine: ["Leather", "Cuffs"]},
	{inventory: true, name: "DragonAnkleCuffs", Asset: "LeatherAnkleCuffs", LinkableBy: [...KDBindable], Link: "DragonAnkleCuffs2", DefaultLock: "Blue", Type: "Chained", Color: ["Default", "#9B1818", "#675F50"], Group: "ItemFeet", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": -0.05, "Remove": 0.3, "Pick": 0.25}, enemyTags: {"dragonRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 2, allFloors: true, shrine: ["Leather", "Cuffs", "AnkleCuffsBase"],
		maxwill: 1.0, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.2, subMult: 0.5, noLeash: true}]},
	{name: "DragonAnkleCuffs2", Asset: "LeatherAnkleCuffs", LinkableBy: [...KDBindable], UnLink: "DragonAnkleCuffs", Type: "Closed", Color: ["Default", "#9B1818", "#675F50"], Group: "ItemFeet", blockfeet: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": -0.05, "Remove": 0.3, "Pick": 0.25}, enemyTags: {"dragonRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Leather", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}]},
	{inventory: true, name: "DragonBoots", Asset: "BalletWedges", Color: "#424242", Group: "ItemBoots", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": -0.05, "Remove": 0.05, "Pick": 0.25},
		enemyTags: {"dragonRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 2, allFloors: true, shrine: ["Leather", "Boots"]},
	{inventory: true, name: "DragonBallGag", gag: 0.75, Asset: "FuturisticHarnessBallGag", strictness: 0.3, Color: ['#680000', '#680000', '#680000', '#680000', '#680000'], Group: "ItemMouth", power: 9, weight: 0,
		escapeChance: {"Struggle": -0.25, "Cut": -0.05, "Remove": 0.05, "Pick": 0.25},
		maxwill: 0.6, enemyTags: {"dragonRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 7, allFloors: true, shrine: ["Leather", "Latex", "Gags"]},
	{inventory: true, name: "DragonMuzzleGag", gag: 1.0, Asset: "StitchedMuzzleGag", Color: "#9B1818", Group: "ItemMouth3", power: 9, weight: -6,
		escapeChance: {"Struggle": 0.05, "Cut": 0.0, "Remove": 0.1},
		maxwill: 0.75, enemyTags: {"dragonRestraints":6}, playerTags: {"ItemMouthFull":4, "ItemMouth2Full":4}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags"]},
	{inventory: true, name: "DragonCollar", Asset: "LatexCollar2", Color: "#9B1818", Group: "ItemNeck", LinkableBy: ["HighCollars"], power: 9, weight: 4,
		escapeChance: {"Struggle": -0.2, "Cut": -0.1, "Remove": 0.1},
		maxwill: 0.25, enemyTags: {"dragonRestraints":6}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["Collars"]},
	//endregion

	//region Obsidian
	{inventory: true, name: "ObsidianLegCuffs", accessible: true, Asset: "OrnateLegCuffs", LinkableBy: ["Legbinders", "Hobbleskirts", "Belts", "Ties"], Type: "Chained", Color: ["#675F50", "#171222", "#9B63C5"], Group: "ItemLegs", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.6, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		maxwill: 0.8, enemyTags: {"obsidianRestraints":6}, playerTags: {"ItemLegsFull":-2}, minLevel: 7, allFloors: true, shrine: ["Metal", "Cuffs", "Obsidian"]},
	{inventory: true, name: "ObsidianAnkleCuffs", accessible: true, Asset: "OrnateAnkleCuffs", LinkableBy: [...KDBindable], Link: "ObsidianAnkleCuffs2", DefaultLock: "Blue", Type: "Chained", Color: ["#675F50", "#171222", "#9B63C5"], Group: "ItemFeet", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.6, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25}, enemyTags: {"obsidianRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs", "AnkleCuffsBase", "Obsidian"],
		maxwill: 1.0, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.2, subMult: 0.5, noLeash: true}]},
	{name: "ObsidianAnkleCuffs2", accessible: true, Asset: "OrnateAnkleCuffs", LinkableBy: ["AnkleCuffsBase", ...KDBindable], UnLink: "ObsidianAnkleCuffs", Type: "Closed", Color: ["#675F50", "#171222", "#9B63C5"], Group: "ItemFeet", blockfeet: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.6, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25}, enemyTags: {}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs", "Obsidian"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}]},
	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "ObsidianArmCuffs", DefaultLock: "Purple", accessible: true, Asset: "OrnateCuffs", linkCategory: "Cuffs", linkSize: 0.55, LinkableBy: ["Armbinders", "Petsuits", "Straitjackets", "Boxbinders", ...KDBindable], Link: "ObsidianArmCuffs2", Color: ["#171222", "#9B63C5"], Group: "ItemArms", bindarms: false, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.6, "Cut": -0.2, "Remove": 0.25, "Pick": 0.35}, enemyTags: {"obsidianRestraints":24}, playerTags: {"ItemArmsFull":-2}, minLevel: 4, allFloors: true, shrine: ["Metal", "Cuffs", "ArmCuffsBase", "Obsidian"],
		maxwill: 0.8, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.33}, {trigger: "defeat", type: "linkItem", chance: 1.0}]},
	{name: "ObsidianArmCuffs2", accessible: true, Asset: "OrnateCuffs", Type: "Wrist", LinkableBy: ["Armbinders", "Boxbinders", ...KDBindable], Link: "ObsidianArmCuffs3", UnLink: "ObsidianArmCuffs", Color: ["#171222", "#9B63C5"], Group: "ItemArms", bindarms: true, power: 9, weight: 0, escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs", "Obsidian"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.33}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.08, inheritLinked: true}]},
	{name: "ObsidianArmCuffs3", accessible: true, Asset: "OrnateCuffs", Type: "Both", LinkableBy: ["Armbinders", ...KDBindable], UnLink: "ObsidianArmCuffs4", Color: ["#171222", "#9B63C5"], Group: "ItemArms", bindarms: true, power: 9, weight: 0, strictness: 0.1, escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": -0.1, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs", "Obsidian"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.12, inheritLinked: true}]},
	{name: "ObsidianArmCuffs4", accessible: true, Asset: "OrnateCuffs", Type: "Elbow", LinkableBy: ["Armbinders", ...KDBindable], Link: "ObsidianArmCuffs3", UnLink: "ObsidianArmCuffs", Color: ["#171222", "#9B63C5"], Group: "ItemArms", bindarms: true, power: 9, weight: 0, escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": -0.15, "Pick": 0.25}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs", "Obsidian"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.5}, {trigger: "beforeStruggleCalc", type: "elbowCuffsBlock", inheritLinked: true}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}]},
	{inventory: true, name: "ObsidianGag", gag: 1.0, Asset: "MuzzleGag", Color: ["#1C1847", "#1C1847"], Group: "ItemMouth3", power: 9, weight: -7, escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		maxwill: 0.7, enemyTags: {"obsidianRestraints":8}, playerTags: {"ItemMouth3Full":-2, "ItemMouth2Full":2, "ItemMouth1Full":2}, minLevel: 4, allFloors: true, shrine: ["Metal", "Gags", "Obsidian"]},
	{inventory: true, name: "ObsidianCollar", Asset: "OrnateCollar", Color: ["#171222", "#9B63C5"], Group: "ItemNeck", LinkableBy: ["HighCollars"], power: 9, weight: -2, escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		maxwill: 0.25, enemyTags: {"obsidianRestraints":4}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Collars", "Obsidian", "HighCollars"], events: [
			{trigger: "beforeStruggleCalc", type: "obsidianDebuff", power: 0.15, inheritLinked: true}
		]},
	//endregion

	//region CrystalCuffs
	{inventory: true, name: "CrystalLegCuffs", accessible: true, Asset: "OrnateLegCuffs", LinkableBy: ["Legbinders", "Hobbleskirts", "Belts", "Ties"], Type: "Chained", Color: ["#675F50", "#a694cb", "#ff5277"], Group: "ItemLegs", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": 0.2, "Pick": 0.35},
		maxwill: 0.8, enemyTags: {"crystalRestraints":6}, playerTags: {"ItemLegsFull":-2}, minLevel: 7,
		allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [{trigger: "tick", type: "crystalDrain", power: -0.034, inheritLinked: true}, {trigger: "struggle", type: "crystalPunish"}]},
	{inventory: true, name: "CrystalAnkleCuffs", accessible: true, Asset: "OrnateAnkleCuffs", LinkableBy: [...KDBindable], Link: "CrystalAnkleCuffs2", DefaultLock: "Red", Type: "Chained", Color: ["#675F50", "#a694cb", "#ff5277"], Group: "ItemFeet", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove":  0.2, "Pick": 0.35}, enemyTags: {"crystalRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs", "AnkleCuffsBase"],
		maxwill: 1.0, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.2, subMult: 0.5, noLeash: true}, {trigger: "tick", type: "crystalDrain", power: -0.033, inheritLinked: true}, {trigger: "struggle", type: "crystalPunish"}]},
	{name: "CrystalAnkleCuffs2", accessible: true, Asset: "OrnateAnkleCuffs", LinkableBy: [...KDBindable], UnLink: "CrystalAnkleCuffs", Type: "Closed", Color: ["#675F50", "#a694cb", "#ff5277"], Group: "ItemFeet", blockfeet: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": 0.2, "Pick": 0.35}, enemyTags: {}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "struggle", type: "crystalPunish"}, {trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}]},
	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "CrystalArmCuffs", DefaultLock: "Blue", accessible: true, Asset: "OrnateCuffs", linkCategory: "Cuffs", linkSize: 0.55, LinkableBy: ["Armbinders", "Petsuits", "Straitjackets", "Boxbinders", ...KDBindable], Link: "CrystalArmCuffs2", Color: ["#a694cb", "#ff5277"], Group: "ItemArms", bindarms: false, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": 0.25, "Pick": 0.45}, enemyTags: {"crystalRestraints":24}, playerTags: {"ItemArmsFull":-2}, minLevel: 4, allFloors: true, shrine: ["Metal", "Cuffs", "ArmCuffsBase"],
		maxwill: 0.6, events: [{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.33}, {trigger: "defeat", type: "linkItem", chance: 1.0}, {trigger: "tick", type: "crystalDrain", power: -0.034, inheritLinked: true}, {trigger: "struggle", type: "crystalPunish"}]},
	{name: "CrystalArmCuffs2", accessible: true, Asset: "OrnateCuffs", Type: "Wrist", LinkableBy: ["Armbinders", "Boxbinders", ...KDBindable], Link: "CrystalArmCuffs3", UnLink: "CrystalArmCuffs", Color: ["#a694cb", "#ff5277"], Group: "ItemArms", bindarms: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.15, "Cut": 0.1, "Remove": 0.2, "Pick": 0.35}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.33}, {trigger: "struggle", type: "crystalPunish"}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.08, inheritLinked: true}]},
	{name: "CrystalArmCuffs3", accessible: true, Asset: "OrnateCuffs", Type: "Both", LinkableBy: ["Armbinders", ...KDBindable], UnLink: "CrystalArmCuffs4", Color: ["#a694cb", "#ff5277"], Group: "ItemArms", bindarms: true, power: 9, weight: 0, strictness: 0.1,
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": -0.1, "Pick": 0.35}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "struggle", type: "crystalPunish"}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}, {trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.12, inheritLinked: true}]},
	{name: "CrystalArmCuffs4", accessible: true, Asset: "OrnateCuffs", Type: "Elbow", LinkableBy: ["Armbinders", ...KDBindable], Link: "CrystalArmCuffs3", UnLink: "CrystalArmCuffs", Color: ["#a694cb", "#ff5277"], Group: "ItemArms", bindarms: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.15, "Cut": 0.1, "Remove": -0.15, "Pick": 0.35}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs"],
		events: [{trigger: "remove", type: "unlinkItem"}, {trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.5}, {trigger: "struggle", type: "crystalPunish"}, {trigger: "beforeStruggleCalc", type: "elbowCuffsBlock", inheritLinked: true}, {trigger: "postRemoval", type: "RequireBaseArmCuffs"}]},
	//endregion


	//region BanditCuffs
	{inventory: true, name: "BanditLegCuffs", accessible: true, Asset: "OrnateLegCuffs", LinkableBy: ["Legbinders", "Hobbleskirts", "Belts", "Ties"], Type: "Chained", Color: ["#aaaaaa", "#f0b541", "#ff5277"], Group: "ItemLegs", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": 0.2, "Pick": 0.35},
		maxwill: 0.8, enemyTags: {"banditMagicRestraints":6}, playerTags: {"ItemLegsFull":-2}, minLevel: 7,
		allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [
			{trigger: "struggle", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
			{trigger: "playerAttack", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
		]},
	{inventory: true, name: "BanditAnkleCuffs", accessible: true, Asset: "OrnateAnkleCuffs", LinkableBy: [...KDBindable], Link: "BanditAnkleCuffs2", DefaultLock: "Red", Type: "Chained", Color: ["#675F50", "#f0b541", "#ff5277"], Group: "ItemFeet", hobble: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove":  0.2, "Pick": 0.35}, enemyTags: {"banditMagicRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 2, allFloors: true, shrine: ["Metal", "Cuffs", "AnkleCuffsBase"],
		maxwill: 1.0, events: [
			{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.2, subMult: 0.5, noLeash: true},
			{trigger: "struggle", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
			{trigger: "playerAttack", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
		]},
	{name: "BanditAnkleCuffs2", accessible: true, Asset: "OrnateAnkleCuffs", LinkableBy: [...KDBindable], UnLink: "BanditAnkleCuffs", Type: "Closed", Color: ["#675F50", "#f0b541", "#ff5277"], Group: "ItemFeet", blockfeet: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": 0.2, "Pick": 0.35}, enemyTags: {}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [
			{trigger: "remove", type: "unlinkItem"},
			{trigger: "struggle", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}]},
	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "BanditArmCuffs", DefaultLock: "Blue", accessible: true, Asset: "OrnateCuffs", linkCategory: "Cuffs", linkSize: 0.55, LinkableBy: ["Armbinders", "Petsuits", "Straitjackets", "Boxbinders", ...KDBindable], Link: "BanditArmCuffs2", Color: ["#f0b541", "#ff5277"], Group: "ItemArms", bindarms: false, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": 0.25, "Pick": 0.45}, enemyTags: {"banditMagicRestraints":24}, playerTags: {"ItemArmsFull":-2}, minLevel: 2, allFloors: true, shrine: ["Metal", "Cuffs", "ArmCuffsBase"],
		maxwill: 0.6, events: [
			{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.5},
			{trigger: "defeat", type: "linkItem", chance: 1.0},
			{trigger: "struggle", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
			{trigger: "playerAttack", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
		]},
	{name: "BanditArmCuffs2", accessible: true, Asset: "OrnateCuffs", Type: "Wrist", LinkableBy: ["Armbinders", "Boxbinders", ...KDBindable], Link: "BanditArmCuffs3", UnLink: "BanditArmCuffs", Color: ["#f0b541", "#ff5277"], Group: "ItemArms", bindarms: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.15, "Cut": 0.1, "Remove": 0.2, "Pick": 0.35}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs"],
		events: [
			{trigger: "remove", type: "unlinkItem"},
			{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.33},
			{trigger: "struggle", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseArmCuffs"},
			{trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.08, inheritLinked: true}]},
	{name: "BanditArmCuffs3", accessible: true, Asset: "OrnateCuffs", Type: "Both", LinkableBy: ["Armbinders", ...KDBindable], UnLink: "BanditArmCuffs4", Color: ["#f0b541", "#ff5277"], Group: "ItemArms", bindarms: true, power: 9, weight: 0, strictness: 0.1,
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": -0.1, "Pick": 0.35}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs"],
		events: [
			{trigger: "remove", type: "unlinkItem"},
			{trigger: "struggle", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseArmCuffs"},
			{trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.12, inheritLinked: true}]},
	{name: "BanditArmCuffs4", accessible: true, Asset: "OrnateCuffs", Type: "Elbow", LinkableBy: ["Armbinders", ...KDBindable], Link: "BanditArmCuffs3", UnLink: "BanditArmCuffs", Color: ["#f0b541", "#ff5277"], Group: "ItemArms", bindarms: true, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.15, "Cut": 0.1, "Remove": -0.15, "Pick": 0.35}, helpChance: {"Remove": 0.4}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Metal", "Cuffs"],
		events: [
			{trigger: "remove", type: "unlinkItem"},
			{trigger: "hit", type: "linkItem", sfx: "LightJingle", chance: 0.5},
			{trigger: "struggle", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "elbowCuffsBlock", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseArmCuffs"}]},
	//endregion

	{removePrison: true, name: "IceArms", sfx: "Freeze", Asset: "Ribbons", LinkableBy: ["Armbinders", "Wrapping"], Type: "Heavy", Color: "#5DA9E5", Group: "ItemArms", bindarms: true, power: 4, weight: 0, magic: true, escapeChance: {"Struggle": 0.15, "Cut": 0.05, "Remove": 0}, enemyTags: {"iceRestraints":4}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Ties"],
		maxwill: 0.8, events: [{trigger: "tick", type: "iceDrain", power: -0.025, inheritLinked: true}]},
	{removePrison: true, name: "IceLegs", sfx: "Freeze", Asset: "Ribbons", LinkableBy: ["Legbinders", "Hobbleskirts", "Wrapping"], Type: "MessyWrap", Color: "#5DA9E5", Group: "ItemLegs", hobble: true, power: 4, weight: 0, magic: true, escapeChance: {"Struggle": 0.15, "Cut": 0.05, "Remove": 0}, enemyTags: {"iceRestraints":4}, playerTags: {"ItemLegsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Ties"],
		events: [{trigger: "tick", type: "iceDrain", power: -0.025, inheritLinked: true}]},
	{removePrison: true, name: "IceHarness", sfx: "Freeze", Asset: "Ribbons", Type: "Harness2", Color: "#5DA9E5", Group: "ItemTorso", power: 1, weight: 0, magic: true, escapeChance: {"Struggle": 0.15, "Cut": 0.05, "Remove": 0}, enemyTags: {"iceRestraints":4}, playerTags: {"ItemTorsoFull":-2}, minLevel: 0, allFloors: true, shrine: ["Ties"],
		events: [{trigger: "tick", type: "iceDrain", power: -0.025, inheritLinked: true}]},
	{removePrison: true, name: "IceGag", gag: 0.35, sfx: "Freeze", Asset: "Ribbons", Color: "#5DA9E5", Group: "ItemMouth", power: 4, weight: 0, magic: true, escapeChance: {"Struggle": 0.15, "Cut": 0.05, "Remove": 0}, enemyTags: {"iceRestraints":4}, playerTags: {"ItemMouthFull":-2}, minLevel: 0, allFloors: true, shrine: ["Ties"],
		maxwill: 0.7, events: [{trigger: "tick", type: "iceDrain", power: -0.025, inheritLinked: true}]},

	{removePrison: true, name: "CableArms", sfx: "FutureLock", Asset: "Ribbons", LinkableBy: ["Wrapping", "Boxbinders"], Color: "#7D7D7D", Group: "ItemArms", bindarms: true, power: 6, weight: 0, magic: false, escapeChance: {"Struggle": 0.1, "Cut": 0.00, "Remove": 0.25, "Pick": 0.35},
		maxwill: 0.8, enemyTags: {"hitechCables":4}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Ties"]},
	{removePrison: true, name: "CableLegs", sfx: "FutureLock", Asset: "Ribbons", LinkableBy: ["Legbinders", "Hobbleskirts", "Wrapping"], Type: "Cross", Color: "#7D7D7D", Group: "ItemLegs", hobble: true, power: 6, weight: 0, magic: false, escapeChance: {"Struggle": 0.1, "Cut": 0.0, "Remove": 0.25, "Pick": 0.35}, enemyTags: {"hitechCables":4}, playerTags: {"ItemLegsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Ties"]},
	{renderWhenLinked: ["HeavyCorsets"], removePrison: true, name: "CableHarness", sfx: "FutureLock", Asset: "Ribbons", Type: "Harness1", Color: "#7D7D7D", Group: "ItemTorso", power: 2, strictness: 0.05, weight: 0, magic: false, escapeChance: {"Struggle": 0.1, "Cut": 0.0, "Remove": 0.25, "Pick": 0.35}, enemyTags: {"hitechCables":4}, playerTags: {"ItemTorsoFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Ties"]},

	//region Ribbon
	{inventory: true, removePrison: true, name: "RibbonArms", sfx: "MagicSlash", Asset: "Ribbons", Color: "#a583ff", Group: "ItemArms", bindarms: true, power: 6, weight: 0, magic: true,
		escapeChance: {"Struggle": 0.15, "Cut": 0.3, "Remove": 0.2,}, struggleMaxSpeed: {"Remove": 0.15}, struggleMinSpeed: {"Struggle": 0.1},
		affinity: {Remove: ["Hook"],},
		maxwill: 0.8, enemyTags: {"magicRibbons":4}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, removePrison: true, name: "RibbonLegs", sfx: "MagicSlash", Asset: "DuctTape", Color: "#a583ff", Group: "ItemLegs", hobble: true, power: 7, weight: 0, magic: true,
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},
		escapeChance: {"Struggle": 0.07, "Cut": 0.3, "Remove": 0.15}, enemyTags: {"magicRibbons":4}, struggleMaxSpeed: {"Remove": 0.15}, playerTags: {"ItemLegsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, removePrison: true, name: "RibbonFeet", sfx: "MagicSlash", Asset: "DuctTape", Color: "#a583ff", Group: "ItemFeet", blockfeet: true, power: 7, weight: 0, magic: true,
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},
		escapeChance: {"Struggle": 0.07, "Cut": 0.3, "Remove": 0.15}, enemyTags: {"magicRibbons":4}, struggleMaxSpeed: {"Remove": 0.15}, playerTags: {"ItemLegsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, removePrison: true, name: "RibbonHarness", sfx: "MagicSlash", Asset: "Ribbons", Type: "Harness2", Color: "#a583ff", Group: "ItemTorso", power: 6, strictness: 0.05, weight: 0, magic: true,
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},
		escapeChance: {"Struggle": 0.07, "Cut": 0.3, "Remove": 0.15}, struggleMaxSpeed: {"Remove": 0.15}, enemyTags: {"magicRibbons":4}, playerTags: {"ItemTorsoFull":-2}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, removePrison: true, name: "RibbonCrotch", sfx: "MagicSlash", Asset: "Ribbons", Color: "#a583ff", Group: "ItemPelvis", power: 5, crotchrope: true, weight: 0, magic: true,
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},
		escapeChance: {"Struggle": 0.15, "Cut": 0.35, "Remove": 0.25}, struggleMaxSpeed: {"Remove": 0.2}, enemyTags: {"magicRibbons":4}, playerTags: {"ItemTorsoFull":-2}, minLevel: 0,
		allFloors: true, shrine: ["Rope", "Ties"], events: [{trigger: "struggle", type: "crotchrope"}]},
	{inventory: true, name: "RibbonHands", Asset: "DuctTape", Color: "#a583ff", LinkableBy: ["Mittens"], Group: "ItemHands", bindhands: true, power: 5, weight: 0, magic: true,
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},
		escapeChance: {"Struggle": 0, "Cut": 0.4, "Remove": 0.5}, struggleMaxSpeed: {"Remove": 0.1},
		maxwill: 0.3, enemyTags: {"magicRibbonsHarsh":1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, name: "RibbonMouth", Asset: "DuctTape", Color: "#9573ef", Type: "Cover", Group: "ItemMouth2", gag: 0.5, power: 5, weight: 0, magic: true, escapeChance: {"Struggle": 0.0, "Cut": 0.4, "Remove": 0.4}, struggleMaxSpeed: {"Remove": 0.15},
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},
		enemyTags: {"magicRibbons":4}, playerTags: {"ItemMouth1Full":8}, minLevel: 0, allFloors: true, shrine: ["Charms"]},
	//endregion

	{inventory: true, name: "CableGag", Asset: "DeepthroatGag", gag: 1.0, sfx: "FutureLock", Color: "Default", Group: "ItemMouth", DefaultLock: "Red", power: 5, weight: 2, escapeChance: {"Struggle": -0.12, "Cut": 0.0, "Remove": 0.5, "Pick": 0.35},
		maxwill: 0.6, enemyTags: {"cableGag":3}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Gags"]},

	//region RopeSnake
	{renderWhenLinked: ["Boxbinders"], changeRenderType: {"ArmBind": "WristElbowHarnessTie"}, inventory: true, name: "RopeSnakeArms", accessible: true, factionColor: [[], [0]],
		Asset: "HempRope", Color: "Default", LinkableBy: ["Boxbinders", "Wrapping"], Group: "ItemArms", bindarms: true, power: 1.5, weight: 0, escapeChance: {"Struggle": 0.25, "Cut": 0.45, "Remove": 0.1},
		affinity: {Remove: ["Hook"],},
		maxwill: 0.7, enemyTags: {"ropeRestraints":4}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: true, name: "RopeSnakeCuffs", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "RopeCuffs", Color: "Default", linkCategory: "Cuffs", linkSize: 0.33,
		LinkableBy: ["Boxbinders", "Armbinders", ...KDBindable, "Cuffs"], Group: "ItemArms", bindarms: true, power: 1, weight: 0, escapeChance: {"Struggle": 0.4, "Cut": 0.67, "Remove": 0.3},
		affinity: {Remove: ["Hook"],},
		maxwill: 1.0, enemyTags: {"ropeRestraints":8}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Cuffs"]},
	{renderWhenLinked: ["Armbinders", "Belts"], inventory: true, name: "RopeSnakeArmsWrist", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "WristElbowHarnessTie",
		LinkableBy: ["Armbinders", "Wrapping", "Belts"], Color: "Default", Group: "ItemArms", bindarms: true, power: 1.5, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.45, "Remove": 0.2},
		affinity: {Remove: ["Hook"],},
		maxwill: 0.7, enemyTags: {"ropeRestraintsWrist":4}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{inventory: false, name: "RopeSnakeHogtie", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "Hogtied", Color: "Default", Group: "ItemArms", bindarms: true, power: 6, weight: 0,
		escapeChance: {"Struggle": 0.05, "Cut": 0.15, "Remove": 0.0}, affinity: {Remove: ["Hook"],},
		maxwill: 0.25, enemyTags: {"ropeRestraintsHogtie":12}, playerTags: {}, minLevel: 2, allFloors: true, shrine: ["Rope", "Ties"],
		events: [{trigger: "postRemoval", type: "replaceItem", list: ["RopeSnakeArmsWrist"], power: 6}]
	},
	{renderWhenLinked: ["Wrapping", "Belts"], inventory: true, name: "RopeSnakeFeet", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Color: "Default", LinkableBy: ["Wrapping", "Belts"], Group: "ItemFeet", blockfeet: true, power: 1, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.5, "Remove": 0.15},
		affinity: {Remove: ["Hook"],},
		maxwill: 1.0, enemyTags: {"ropeRestraints":4}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{renderWhenLinked: ["Legbinders", "Hobbleskirts", "Belts"], inventory: true, name: "RopeSnakeLegs", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "FullBinding", LinkableBy: ["Legbinders", "Hobbleskirts", "Belts"], Color: "Default", Group: "ItemLegs", hobble: true, power: 1, weight: 0, escapeChance: {"Struggle": 0.25, "Cut": 0.45, "Remove": 0.15},
		affinity: {Remove: ["Hook"],},
		maxwill: 0.6, enemyTags: {"ropeRestraints":4}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{renderWhenLinked: ["Harnesses", "HeavyCorsets"], inventory: true, name: "RopeSnakeTorso", accessible: true, factionColor: [[], [0]], Asset: "HempRopeHarness", Type: "Waist", Color: "Default", Group: "ItemTorso", power: 1, weight: 0, harness: true, escapeChance: {"Struggle": 0.1, "Cut": 0.67, "Remove": 0.3},
		affinity: {Remove: ["Hook"],},
		maxwill: 0.9, enemyTags: {"ropeRestraints2":4}, playerTags: {"ItemTorsoFull":-3}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{renderWhenLinked: ["ChastityBelts"], inventory: true, name: "RopeSnakeCrotch", accessible: true, factionColor: [[], [0]], crotchrope: true, Asset: "HempRope", Type: "OverPanties", LinkableBy: ["ChastityBelts"], OverridePriority: 26, Color: "Default", Group: "ItemPelvis", power: 1, weight: 0,
		affinity: {Remove: ["Hook"],},
		maxwill: 0.75, escapeChance: {"Struggle": 0.1, "Cut": 0.67, "Remove": 0.15}, enemyTags: {"ropeRestraints2":4}, playerTags: {"ItemPelvisFull":-3}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"],
		events: [{trigger: "struggle", type: "crotchrope"}]},
	//endregion

	//region CelestialRope
	{renderWhenLinked: ["Boxbinders"], changeRenderType: {"ArmBind": "WristElbowHarnessTie"}, inventory: true, name: "CelestialRopeArms", accessible: true, Asset: "HempRope", Color: ["#aaaa67"], LinkableBy: ["Boxbinders", "Wrapping"], Group: "ItemArms", bindarms: true, power: 2, weight: 0, escapeChance: {"Struggle": 0.2, "Cut": 0.3, "Remove": 0.1},
		affinity: {Remove: ["Hook"],},
		maxwill: 0.7, enemyTags: {"celestialRopes":4}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"],
		failSuffix: {"Remove": "MagicRope"}, events: [{trigger: "struggle", type: "celestialRopePunish"}]},
	{inventory: true, name: "CelestialRopeCuffs", accessible: true, Asset: "HempRope", Type: "RopeCuffs", Color: ["#ffff90"], linkCategory: "Cuffs", linkSize: 0.33, LinkableBy: ["Boxbinders", "Armbinders", ...KDBindable, "Cuffs"], Group: "ItemArms", bindarms: true, power: 1, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.4, "Remove": 0.3},
		affinity: {Remove: ["Hook"],},
		maxwill: 1.0, enemyTags: {"celestialRopes":8}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Cuffs"],
		failSuffix: {"Remove": "MagicRope"}, events: [{trigger: "struggle", type: "celestialRopePunish"}]},
	{inventory: true, name: "CelestialRopeFeet", accessible: true, Asset: "NylonRope", Color: ["#aaaa67", "#aaaa67"], LinkableBy: ["Wrapping"], Group: "ItemFeet", blockfeet: true, power: 1, weight: 0, escapeChance: {"Struggle": 0.2, "Cut": 0.3, "Remove": 0.15},
		affinity: {Remove: ["Hook"],},
		maxwill: 1.0, enemyTags: {"celestialRopes":4}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"],
		failSuffix: {"Remove": "MagicRope"}, events: [{trigger: "struggle", type: "celestialRopePunish"}]},
	{inventory: true, name: "CelestialRopeLegs", accessible: true, Asset: "NylonRope", LinkableBy: ["Legbinders", "Hobbleskirts"], Color: ["#aaaa67", "#aaaa67"], Group: "ItemLegs", hobble: true, power: 1, weight: 0, escapeChance: {"Struggle": 0.2, "Cut": 0.35, "Remove": 0.15},
		affinity: {Remove: ["Hook"],},
		maxwill: 0.6, enemyTags: {"celestialRopes":4}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"],
		failSuffix: {"Remove": "MagicRope"}, events: [{trigger: "struggle", type: "celestialRopePunish"}]},
	{inventory: true, name: "CelestialRopeTorso", accessible: true, Asset: "NylonRopeHarness", Color: ["#aaaa67", "#aaaa67"], Group: "ItemTorso", power: 1, weight: 0, harness: true, escapeChance: {"Struggle": 0.1, "Cut": 0.3, "Remove": 0.1},
		affinity: {Remove: ["Hook"],},
		maxwill: 0.9, enemyTags: {"celestialRopes":4}, playerTags: {"ItemTorsoFull":-3}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"],
		failSuffix: {"Remove": "MagicRope"}, events: [{trigger: "struggle", type: "celestialRopePunish"}]},
	{inventory: true, name: "CelestialRopeCrotch", accessible: true, crotchrope: true, Asset: "HempRope", Type: "OverPanties", OverridePriority: 26, Color: ["#ffff90", "#aaaa67"], Group: "ItemPelvis", power: 1, weight: 0,
		affinity: {Remove: ["Hook"],},
		maxwill: 0.75, escapeChance: {"Struggle": 0.1, "Cut": 0.35, "Remove": 0.15}, enemyTags: {"celestialRopes":4}, playerTags: {"ItemPelvisFull":-3}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"],
		failSuffix: {"Remove": "MagicRope"}, events: [{trigger: "struggle", type: "celestialRopePunish"}, {trigger: "struggle", type: "crotchrope"}]},
	//endregion

	//region VinePlant
	{removePrison: true, name: "VinePlantArms", accessible: true, Asset: "NylonRope", Color: ["#006722", "#006722"], Group: "ItemArms",
		affinity: {Remove: ["Hook"],},
		bindarms: true, power: 0.1, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.8, "Remove": 0.2}, enemyTags: {"vineRestraints":4}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{removePrison: true, name: "VinePlantFeet", accessible: true, Asset: "NylonRope", Color: ["#006722", "#006722"], Group: "ItemFeet",
		affinity: {Remove: ["Hook"],},
		blockfeet: true, power: 0.1, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.8, "Remove": 0.2}, enemyTags: {"vineRestraints":4}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{removePrison: true, name: "VinePlantLegs", accessible: true, Asset: "NylonRope", Color: ["#006722", "#006722"], Group: "ItemLegs",
		affinity: {Remove: ["Hook"],},
		hobble: true, power: 0.1, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.8, "Remove": 0.2}, enemyTags: {"vineRestraints":4}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	{removePrison: true, name: "VinePlantTorso", accessible: true, Asset: "NylonRopeHarness", Type: "Diamond", OverridePriority: 26, Color: ["#006722", "#006722"], Group: "ItemTorso",
		affinity: {Remove: ["Hook"],},
		harness: true, power: 0.1, weight: 0, strictness: 0.05, escapeChance: {"Struggle": 0.3, "Cut": 0.8, "Remove": 0.2}, enemyTags: {"vineRestraints":4}, playerTags: {"ItemTorsoFull":-3}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties"]},
	//endregion

	//region Chain
	{inventory: true, name: "ChainArms", accessible: true, sfx: "Chain", Asset: "Chains", Type: "WristElbowHarnessTie", LinkableBy: ["Armbinders", "Wrapping"], Color: "Default", Group: "ItemArms", bindarms: true, power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": -0.1, "Remove": 0.3, "Pick": 1.5},
		maxwill: 0.8, enemyTags: {"chainRestraints":2}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{inventory: true, name: "ChainLegs", accessible: true, sfx: "Chain", Asset: "Chains", Type: "Strict", Color: "Default", LinkableBy: ["Legbinders", "Hobbleskirts"], Group: "ItemLegs", hobble: true, power: 5, weight: 0, escapeChance: {"Struggle": 0.15, "Cut": -0.1, "Remove": 0.3, "Pick": 1.5}, enemyTags: {"chainRestraints":2}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{inventory: true, name: "ChainFeet", accessible: true, sfx: "Chain", Asset: "Chains", Color: "Default", LinkableBy: ["Wrapping", "Belts"], Group: "ItemFeet", blockfeet: true, power: 5, weight: 0, escapeChance: {"Struggle": -0.3, "Cut": -0.1, "Remove": 0.3, "Pick": 1.5}, enemyTags: {"chainRestraints":2}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{inventory: true, name: "ChainCrotch", accessible: true, sfx: "Chain", Asset: "CrotchChain", crotchrope: true, OverridePriority: 26, Color: "Default", Group: "ItemTorso", power: 3, weight: 0, harness: true, escapeChance: {"Struggle": -0.3, "Cut": -0.1, "Remove": 0.3, "Pick": 1.5}, enemyTags: {"chainRestraints":2}, playerTags: {"ItemPelvisFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	//endregion

	//region MagicChain
	{inventory: true, removePrison: true, sfx: "Chain", name: "MagicChainArms", accessible: true, Asset: "Chains", LinkableBy: ["Armbinders", "Wrapping"], Type: "WristElbowHarnessTie", Color: "#aa00aa", Group: "ItemArms", bindarms: true, power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": -0.1, "Remove": -0.05},
		failSuffix: {"Remove": "MagicChain"}, maxwill: 0.9, enemyTags: {"chainRestraintsMagic":2}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{inventory: true, removePrison: true, sfx: "Chain", name: "MagicChainLegs", accessible: true, Asset: "Chains", LinkableBy: ["Legbinders", "Hobbleskirts"], Type: "Strict", Color: "#aa00aa", Group: "ItemLegs", hobble: true, power: 4, weight: 0,
		failSuffix: {"Remove": "MagicChain"}, escapeChance: {"Struggle": 0.3, "Cut": -0.1, "Remove": -0.05}, enemyTags: {"chainRestraintsMagic":2}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{inventory: true, removePrison: true, sfx: "Chain", name: "MagicChainFeet", accessible: true, Asset: "Chains", LinkableBy: ["Wrapping"], Color: "#aa00aa", Group: "ItemFeet", blockfeet: true, power: 4, weight: 0,
		failSuffix: {"Remove": "MagicChain"}, escapeChance: {"Struggle": 0.2, "Cut": -0.1, "Remove": -0.05}, enemyTags: {"chainRestraintsMagic":2}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{inventory: true, removePrison: true, sfx: "Chain", name: "MagicChainCrotch", accessible: true, crotchrope: true, Asset: "CrotchChain", OverridePriority: 26, Color: "#aa00aa", Group: "ItemTorso", power: 2, weight: 0,
		failSuffix: {"Remove": "MagicChain"}, escapeChance: {"Struggle": 0.2, "Cut": -0.1, "Remove": -0.05}, enemyTags: {"chainRestraintsMagic":2}, playerTags: {"ItemPelvisFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"],
		events: [{trigger: "struggle", type: "crotchrope"}]},
	//endregion

	//region ShadowChain
	{removePrison: true, sfx: "Chain", name: "ShadowChainArms", accessible: true, Asset: "Chains", LinkableBy: ["Boxbinders", "Wrapping"], Type: "BoxTie", Color: "#000000", Group: "ItemArms", bindarms: true, power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": -0.1, "Remove": -0.1},
		maxwill: 0.9, enemyTags: {"shadowRestraints":2}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{removePrison: true, sfx: "Chain", name: "ShadowChainLegs", accessible: true, Asset: "Chains", LinkableBy: ["Legbinders", "Hobbleskirts"], Type: "Strict", Color: "#000000", Group: "ItemLegs", hobble: true, power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": -0.1, "Remove": -0.1}, enemyTags: {"shadowRestraints":2}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{removePrison: true, sfx: "Chain", name: "ShadowChainFeet", accessible: true, Asset: "Chains", LinkableBy: ["Wrapping"], Color: "#000000", Group: "ItemFeet", blockfeet: true, power: 4, weight: 0, escapeChance: {"Struggle": 0.2, "Cut": -0.1, "Remove": -0.1}, enemyTags: {"shadowRestraints":2}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{removePrison: true, sfx: "Chain", name: "ShadowChainCrotch", accessible: true, crotchrope: true, Asset: "CrotchChain", OverridePriority: 26, Color: "#000000", Group: "ItemTorso", power: 2, weight: 0, escapeChance: {"Struggle": 0.2, "Cut": -0.1, "Remove": -0.1}, enemyTags: {"shadowRestraints":2}, playerTags: {"ItemPelvisFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"],
		events: [{trigger: "struggle", type: "crotchrope"}]},
	//endregion

	//region GhostChain
	{removePrison: true, sfx: "Chain", name: "GhostChainArms", accessible: true, Asset: "Chains", LinkableBy: ["Boxbinders", "Wrapping"], Type: "BoxTie", Color: "#cccccc", Group: "ItemArms", bindarms: true, power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.2, "Remove": 0.1},
		maxwill: 0.9, enemyTags: {"ghostRestraints":2}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{removePrison: true, sfx: "Chain", name: "GhostChainLegs", accessible: true, Asset: "Chains", LinkableBy: ["Legbinders", "Hobbleskirts"], Type: "Strict", Color: "#cccccc", Group: "ItemLegs", hobble: true, power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.2, "Remove": 0.1}, enemyTags: {"ghostRestraints":2}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{removePrison: true, sfx: "Chain", name: "GhostChainFeet", accessible: true, Asset: "Chains", LinkableBy: ["Wrapping"], Color: "#cccccc", Group: "ItemFeet", blockfeet: true, power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.2, "Remove": 0.1}, enemyTags: {"ghostRestraints":2}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{removePrison: true, sfx: "Chain", name: "GhostChainCrotch", accessible: true, crotchrope: true, Asset: "CrotchChain", OverridePriority: 26, Color: "#cccccc", Group: "ItemTorso", power: 2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.2, "Remove": 0.1}, enemyTags: {"ghostRestraints":2}, playerTags: {"ItemPelvisFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"],
		events: [{trigger: "struggle", type: "crotchrope"}]},
	//endregion

	{removePrison: true, divine: true, name: "DivineCuffs", accessible: true, Asset: "FuturisticCuffs", LinkableBy: ["Boxbinders", "Armbinders", ...KDBindable], DefaultLock: "Gold", Type: "Wrist", Color: ['#6AB0ED', '#AE915C', '#FFFFFF'], Group: "ItemArms", bindarms: true, power: 50, weight: 0,
		specStruggleTypes: ["Struggle"], escapeChance: {"Struggle": -99, "Cut": -99, "Remove": -99}, enemyTags: {"divineRestraints":2}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: []},
	{removePrison: true, divine: true, name: "DivineAnkleCuffs", accessible: true, Asset: "FuturisticAnkleCuffs", LinkableBy: [...KDBindable], DefaultLock: "Gold", Color: ['#AE915C', '#71D2EE', '#AE915C', '#000000'], Group: "ItemFeet", Type: "Closed", blockfeet: true, power: 50, weight: 0,
		specStruggleTypes: ["Struggle"], escapeChance: {"Struggle": -99, "Cut": -99, "Remove": -99}, enemyTags: {"divineRestraints":2}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: []},
	{removePrison: true, divine: true, name: "DivineMuzzle", accessible: true, gag: 1.0, Asset: "FuturisticMuzzle", Modules: [0, 1, 1], Color: ['#AE915C', '#AE915C', '#CAA562', '#5FBEE8'], DefaultLock: "Gold", Group: "ItemMouth3", power: 30, weight: 0,
		specStruggleTypes: ["Struggle"], escapeChance: {"Struggle": -99, "Cut": -99, "Remove": -99}, enemyTags: {"divineRestraints":2}, playerTags: {"ItemPelvisFull":-1}, minLevel: 0, allFloors: true, shrine: []},

	{inventory: true, name: "BasicCollar", accessible: true, Asset: "LeatherCollar", Color: ["#000000", "Default"], Group: "ItemNeck", LinkableBy: ["HighCollars"], power: 1, weight: 0, DefaultLock: "Red", escapeChance: {"Struggle": -0.2, "Cut": 0.15, "Remove": 0.5, "Pick": 0.1},
		maxwill: 0.25, enemyTags: {"leashing":0.001, "maidCollar":-1, "dragonRestraints":-1, "expRestraints":-1, "wolfRestraints":-1, "mithrilRestraints": -1}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, maxLevel: 3, allFloors: true, shrine: ["Collars"]},
	{inventory: true, name: "SteelCollar", accessible: true, Asset: "SlenderSteelCollar", Color: ["Default"], Group: "ItemNeck", LinkableBy: ["HighCollars"], power: 3, weight: 0, DefaultLock: "Red", escapeChance: {"Struggle": -0.5, "Cut": -0.4, "Remove": 0.5, "Pick": 0.05},
		maxwill: 0.25, enemyTags: {"leashing":0.001, "maidCollar":-1, "dragonRestraints":-1, "expRestraints":-1, "wolfRestraints":-1, "mithrilRestraints": -1}, playerTags: {"ItemNeckFull":-2, "Unchained": -1, "Damsel": 1}, minLevel: 2, allFloors: true, shrine: ["Collars"]},
	{inventory: true, name: "MagicCollar", accessible: true, Asset: "LeatherCollar", Color: ["#000000", "#6E5B38"], Group: "ItemNeck", LinkableBy: ["HighCollars"], power: 2, weight: 0, DefaultLock: "Blue", escapeChance: {"Struggle": -0.5, "Cut": -0.1, "Remove": 0.25, "Pick": 0.05},
		maxwill: 0.25, enemyTags: {"leashing":0.001, "maidCollar":-1, "dragonRestraints":-1, "expRestraints":-1, "wolfRestraints":-1, "mithrilRestraints": -1}, playerTags: {"ItemNeckFull":-2, "Damsel": -1}, minLevel: 2, allFloors: true, shrine: ["Collars"]},
	{inventory: true, removePrison: true, alwaysKeep: true, showInQuickInv: true, name: "PotionCollar", accessible: true, Asset: "SlenderSteelCollar", Color: ["#6E5B38"], Group: "ItemNeck", power: 1, weight: 0, escapeChance: {"Struggle": -0.2, "Cut": -0.1, "Remove": 0.5, "Pick": 0.15}, potionCollar: true, allowPotions: true,
		enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: []},
	{inventory: true, removePrison: true, alwaysKeep: true, showInQuickInv: true, name: "SlimeWalkers", inaccessible: true, Asset: "BalletHeels", Color: "#ff00ff", Group: "ItemBoots", hobble: true, power: 1, weight: 0, slimeWalk: true,
		escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.4, "Pick": 0.9}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: []},
	{inventory: true, removePrison: true, name: "BasicLeash", tether: 2.9, Asset: "CollarLeash", Color: "Default", Group: "ItemNeckRestraints", leash: true, power: 1, weight: -99, harness: true, escapeChance: {"Struggle": 0.33, "Cut": 0.2, "Remove": 0.5, "Pick": 1.25}, enemyTags: {"leashing":1}, playerTags: {"ItemNeckRestraintsFull":-2, "ItemNeckFull":99}, minLevel: 0, allFloors: true, shrine: []},

	//region Enchanted
	{curse: "MistressKey", enchantedDrain: 0.00025, inventory: true, arousalMode: true, enchanted: true, name: "EnchantedBelt", Asset: "PolishedChastityBelt", OverridePriority: 26, Color: "#AE915C", Group: "ItemPelvis", chastity: true, power: 25, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
		events: [
			{trigger: "calcMiscast", type: "ReduceMiscastFlat", power: 0.3, requireEnergy: true},
			{trigger: "tick", type: "RegenStamina", power: 1.25, requireEnergy: true, energyCost: 0.002},
		]},
	{curse: "MistressKey", enchantedDrain: 0.00025, inventory: true, arousalMode: true, enchanted: true, name: "EnchantedBra", Asset: "PolishedChastityBra", OverridePriority: 26, Color: "#AE915C", Group: "ItemBreast", chastitybra: true, power: 25, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
		events: [
			{trigger: "beforeDamage", type: "ModifyDamageFlat", power: -1, requireEnergy: true, energyCost: 0.01}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00025, inventory: true, enchanted: true, name: "EnchantedHeels", Asset: "BalletWedges", Color: "#AE915C", Group: "ItemBoots", hobble: true, power: 25, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
		events: [
			{trigger: "tick", type: "ApplySlowLevelBuff", power: -2, requireEnergy: true, energyCost: 0.0005},
			{type: "ShadowHeel", trigger: "playerAttack", requireEnergy: true, energyCost: 0.00225},
			//{trigger: "beforePlayerAttack", type: "BoostDamage", power: 1, requireEnergy: true, energyCost: 0.001125}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00025, inventory: true, enchanted: true, name: "EnchantedBlindfold", Asset: "PaddedBlindfold", Color: ["#AE915C", "#262626"], Group: "ItemHead", blindfold: 5, power: 25, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
		events: [
			{trigger: "calcEvasion", type: "BlindFighting", requireEnergy: true},
			{trigger: "tick", type: "AccuracyBuff", power: 1.0, requireEnergy: true},
			{trigger: "beforePlayerAttack", type: "BoostDamage", power: 1, requireEnergy: true, energyCost: 0.001125},
		]},
	{curse: "MistressKey", enchantedDrain: 0.00025, inventory: true, enchanted: true, name: "EnchantedAnkleCuffs", Asset: "SteelAnkleCuffs", Type: "Chained", Color: ["#AE915C", "#B0B0B0"], Group: "ItemFeet", power: 25, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
		events: [
			{trigger: "tick", type: "EnchantedAnkleCuffs"},
			{trigger: "tick", type: "AllyHealingAura", aoe: 3.9, power: 1.5},
			{trigger: "tick", type: "EvasionBuff", power: 0.25, requireEnergy: true},
			{trigger: "miss", type: "EnergyCost", requireEnergy: true, energyCost: 0.0075}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00025, inventory: true, enchanted: true, inventoryAs: "EnchantedAnkleCuffs", name: "EnchantedAnkleCuffs2", Asset: "SteelAnkleCuffs", Type: "Closed", blockfeet: true, Color: ["#AE915C", "#B0B0B0"], Group: "ItemFeet", power: 25, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
		events: [
			{trigger: "tick", type: "EnchantedAnkleCuffs2", requireEnergy: true}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00025, inventory: true, enchanted: true, name: "EnchantedMuzzle", gag: 1.0, Asset: "FuturisticMuzzle", Modules: [1, 1, 2], Color: ['#AE915C', '#AE915C', '#CAA562', '#000000'],
		Group: "ItemMouth3", power: 25, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
		events: [
			{trigger: "tick", type: "SneakBuff", power: 1.15, requireEnergy: true},
			{trigger: "tick", type: "RegenMana", power: 1.0, requireEnergy: true, energyCost: 0.0025},
			{trigger: "beforeDamageEnemy", type: "MultiplyDamageStealth", power: 2.5, requireEnergy: true, energyCost: 0.0015}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00025, inventory: true, enchanted: true, name: "EnchantedBallGag", gag: 0.6, Asset: "FuturisticHarnessBallGag", Color: ['#AE915C', '#AE915C', '#424242', "#CAA562", '#000000'],
		Group: "ItemMouth", power: 25, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
		events: [
			{trigger: "calcMiscast", type: "ReduceMiscastFlat", power: 0.3, requireEnergy: true},
			{trigger: "tick", type: "RegenMana", power: 1.0, requireEnergy: true, energyCost: 0.0025},
			{trigger: "beforeDamageEnemy", type: "MultiplyDamageStatus", power: 1.3, requireEnergy: true, energyCost: 0.0025}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00025, inventory: true, enchanted: true, name: "EnchantedArmbinder", inaccessible: true, Asset: "FuturisticArmbinder", Type: "Tight", Color: ['#AE915C', '#AE915C', '#424242', "#424242", '#000000'],
		Group: "ItemArms", power: 25, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
		events: [
			{trigger: "tick", type: "spellRange", power: 0.5, requireEnergy: true},
			{trigger: "beforeDamageEnemy", type: "MultiplyDamageMagic", power: 1.4, requireEnergy: true, energyCost: 0.00002}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00025, inventory: true, enchanted: true, name: "EnchantedMittens", Asset: "FuturisticMittens", bindhands: true,
		Color: ['#B6A262', '#B6A262', '#424242', '#000000'], Group: "ItemHands", power: 25, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
		events: [
			{trigger: "beforeDamageEnemy", type: "MultiplyDamageMagic", power: 1.4, requireEnergy: true, energyCost: 0.000025} // Energy cost per point o' extra damage
		]},
	//endregion
];

/**
 * @type {Record<string, KDLockType>}
 */
let KDLocks = {
	"Red": {
		lockmult: 2.0,
		// Picking
		pickable: true, // rather than calling the function (which could vary) this is for classifying the lock
		pick_time: 1.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (data) => {
			return true;
		},
		doPick: (data) => {
			return true;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return KDRandom() < KinkyDungeonKeyGetPickBreakChance();
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Red",
		canUnlock: (data) => {
			return KinkyDungeonRedKeys > 0;
		},
		doUnlock: (data) => {
			KinkyDungeonRedKeys -= 1;
			return true;
		},
		removeKeys: (data) => {
			KinkyDungeonRedKeys -= 1;
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: false,
		loot_locked: true,
	},
	"Blue": {
		lockmult: 3.0,
		penalty: {
			"Struggle": 0.1,
			"Cut": 0.15,
		},

		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_time: 0.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Break";
		},
		breakChance: (data) => {
			return true;
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Blue",
		canUnlock: (data) => {
			return KinkyDungeonBlueKeys > 0;
		},
		doUnlock: (data) => {
			return true;
		},
		removeKeys: (data) => {
			KinkyDungeonBlueKeys -= 1;
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: true,
		loot_locked: false,
	},
	"Gold": {
		lockmult: 3.25,
		penalty: {
			"Struggle": 0.2,
			"Cut": 0.3,
		},

		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_time: 0.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Break";
		},
		breakChance: (data) => {
			return true;
		},

		// Key
		unlockable: true, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Mistress",
		canUnlock: (data) => {
			return KinkyDungeonItemCount("MistressKey") > 0;
		},
		doUnlock: (data) => {
			return true;
		},
		removeKeys: (data) => {
			KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable("MistressKey"), -1);
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
			if ((MiniGameKinkyDungeonLevel >= item.lockTimer || !item.lockTimer)) {
				KinkyDungeonLock(item, "Blue");
				KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonGoldLockRemove"), "yellow", 2);
			}
		},
		shrineImmune: false,

		// Command word
		commandlevel: 0, // rather than calling the function (which could vary) this is for classifying the lock
		command_lesser: () => {return 0.0 ;},
		command_greater: () => {return 0.0;},
		command_supreme: () => {return 0.0;},

		loot_special: true,
		loot_locked: false,
	},
	"Purple": {
		lockmult: 2.5,

		// Picking
		pickable: false, // rather than calling the function (which could vary) this is for classifying the lock
		pick_time: 0.0, // Multiplies the picking rate
		pick_diff: 0.0, // Added to the item's pick difficulty

		canPick: (data) => {
			return false;
		},
		doPick: (data) => {
			return false;
		},
		failPick: (data) => {
			return "Fail";
		},
		breakChance: (data) => {
			return false;
		},

		// Key
		unlockable: false, // rather than calling the function (which could vary) this is for classifying the lock
		key: "Blue",
		canUnlock: (data) => {
			return false;
		},
		doUnlock: (data) => {
			return true;
		},
		removeKeys: (data) => {
			//
		},
		failUnlock: (data) => {
			return "Fail";
		},

		// Start of level -- for gold locks
		levelStart: (item) => {
		},
		shrineImmune: false,

		// Command word
		commandlevel: 1, // rather than calling the function (which could vary) this is for classifying the lock
		command_lesser: () => {return 1.0 ;},
		command_greater: () => {return 3.0;},
		command_supreme: () => {return 10.0;},

		loot_special: false,
		loot_locked: true,
	},
};