"use strict";

let KDMagicLocks = ["Purple"]; // Magical locks
let KDKeyedLocks = ["Red", "White", "Blue"];

// LinkableBy array templates
let KDFeetRopeLink = ["Ties", "Hogties", "Wrapping", "Encase", "Belts"];
let KDFormFitting = ["Socks", "Gloves"];
let KDHarnessLink = ["Wrapping", "Encase", "HeavyCorsets", "Corsets", "ArmbinderHarness", "Ties", "Hogties", "Link", "Belts", "Belt", "Harnesses"];
let KDCorsetLink = ["Wrapping", "Encase", "Harnesses", "ArmbinderHarness", "Ties", "Link", "Belts", "Belt"];
let KDBindable = ["Wrapping", "Encase", "Harnesses", "Belts", "Belt", "Tape", "Ties", "Hogties", "Link", "Cuffs", "Boxties", "Wristties", "Crossties"]; // Things that can be wrapped in various restraints
let KDBindableMinusCuffs = KDBindable.filter((b) => {return b != "Cuffs";});
let KDDevices = ["Armbinders", "Straitjackets", "Legbinders", "BindingDress", "Boxbinders", "Petsuits"]; // More complex devices
let KDElbowBind = ["Armbinders", "BindingDress", "Hogties"]; // More complex devices
let KDBoxBind = ["Boxbinders", "Hogties"]; // More complex devices
let KDWrappable = ["Wrapping", "Encase", "Belts", "Tape"]; // Things that can be wrapped in various restraints but not tied due to covering
let KDArmbinderLink = ["Armbinders", "Wrapping", "Encase", "Belts", "BindingDress", "Hogties", "Ties"]; // Standard link for an armbinder
let KDBoxbinderLink = ["Boxbinders", "Wrapping", "Encase", "Belts", "BindingDress", "Hogties", "Ties"]; // Standard link for a boxbinder
let KDDressLink = ["Armbinders", "Ties", "Link", "Wrapping", "Encase", "Belts", "BindingDress", "Hogties", "Straitjackets"];
let KDJacketLink = ["Wrapping", "Encase", "Belts", "Hogties", "TransportJackets"]; // Standard link for an armbinder
let KDJacketRender = ["Wrapping", "Encase", "Belts", "BindingDress"]; // Standard link for an armbinder
let KDTransportLink = ["Wrapping", "Encase", "Belts", "Hogties"];
let KDLegbinderLink = ["Belts", "Tape", "Wrapping", "Encase", "Hobbleskirts", "Socks"];
let KDLegbinderRender = ["Belts", "Tape", "Wrapping", "Encase",];
let KDLegRopesBind = ["Ties", "Link", "Legbinders", "Hobbleskirts", "Tape", "Belts", "Wrapping", "Encase", "HeavyCorsets", "Corsets"];
let KDLegRopesRender = ["Belts", "Ties", "Link", "HeavyCorsets", "Corsets", "Legbinders", "Hobbleskirts"];
let KDArmRopesRender = ["Armbinders", "Boxbinders", "Straitjackets", "Belts", "Ties", "Link", "Cuffs"];
let KDBeltsBind = ["Wrapping", "Encase", "Ties", "Hogties", "Link", "Legbinders", "Hobbleskirts", "HeavyCorsets", "Corsets"];
let KDBeltsRender = ["Ties", "Link", "Legbinders", "Hobbleskirts", "HeavyCorsets", "Corsets"]; // "Wrapping", "Encase",
let KDTapeLink = ["Wrapping", "Encase", "Belts", "Masks", "Mittens", "FlatGags"]; // Standard link for tape style items
let KDTapeRender = ["Wrapping", "Encase", "Tape", "Belts", "Masks", "Mittens", "FlatGags", "Ties", "Hogties", "Link", "Harnesses", "Corsets"]; // Standard link for tape style items
let KDRubberLink = ["Wrapping", "Encase", "Tape", "Belts", "Masks", "Mittens"]; // Standard link for rubber style items
let KDBlindfoldLink = ["Wrapping", "Encase", "Masks", "Tape"];
let KDVisorLink = ["Wrapping", "Encase", "Masks", "Tape"];
let KDWrappingLink = ["Masks", "Wrapping", "Encase",];
let KDMaskLink = [];
let KDStuffingLink = ["BallGags", "FlatGags", "Stuffing", "Tape", "Wrapping", "Encase",];
let KDBallGagLink = ["FlatGags", "Tape", "Wrapping", "Encase",];
let KDFlatGagLink = ["FlatGags", "Tape", "Wrapping", "Encase",];
let KDPlugGagLink = ["FlatGags", "Tape", "Wrapping", "Encase",];
let KDCollarLink = ["HighCollars", "Collars", "Modules"];
let KDCollarRender = ["Modules"];
let KDHighCollarRender = ["Collars", "Modules"];
let KDCollarModuleLink = ["Modules"];
let KDGlovesLink = [...KDBindable, ...KDDevices, "Mittens"];
let KDSocksLink = [...KDBindable, ...KDDevices, "Boots", "Heels"];
let KDBeltLink = [...KDBindable, ...KDDevices]; // For ACTUAL belt, not chastity
//let KDCorsetRender = ["Harnesses", "ArmbinderHarness", "Ties", "Belts"];



/**
 */
const KinkyDungeonRestraints: restraint[] = [
	// region Scarf
	{name: "ScarfArms", unlimited: true, accessible: true, debris: "Fabric", Asset: "DuctTape", Color: "#880022", Group: "ItemArms", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], bindarms: true, power: 0, weight: 0, escapeChance: {"Struggle": 0.5, "Cut": 0.9, "Remove": 0.2},
		affinity: {Remove: ["Hook"],},
		Filters: {
			Tape: {"gamma":1.35,"saturation":1,"contrast":0.6,"brightness":0.6666666666666666,"red":1.9,"green":0.8333333333333333,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "LightNeutral", override: false},
		},
		Model: "TapeArms",
		addTag: ["HandsBehind"],
		enemyTags: {"scarfRestraints":2}, playerTags: {"ItemArmsFull":2}, minLevel: 0, allFloors: true, shrine: ["Rope", "Tape", "Boxties", ]},
	{name: "ScarfLegs", unlimited: true, accessible: true, debris: "Fabric", OverridePriority: 25.1, Asset: "DuctTape", Color: "#880022", Group: "ItemLegs", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], hobble: 1, addTag: ["FeetLinked"], power: 0, weight: 0, escapeChance: {"Struggle": 0.5, "Cut": 0.9, "Remove": 0.2},
		affinity: {Remove: ["Hook"],},
		Filters: {
			Tape: {"gamma":1.35,"saturation":1,"contrast":0.6,"brightness":0.6666666666666666,"red":1.9,"green":0.8333333333333333,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "LightNeutral", override: false},
		},
		Model: "TapeLegs",
		maxwill: 0.4,
		enemyTags: {"scarfRestraints":2}, playerTags: {"ItemLegsFull":2}, minLevel: 0, allFloors: true, shrine: ["Rope", "Tape"]},
	{name: "ScarfFeet", unlimited: true, accessible: true, debris: "Fabric", Asset: "DuctTape", Color: "#880022", Group: "ItemFeet", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], blockfeet: true, addTag: ["FeetLinked"],power: 0, weight: 0, escapeChance: {"Struggle": 0.5, "Cut": 0.9, "Remove": 0.2},
		affinity: {Remove: ["Hook"],},
		Filters: {
			Tape: {"gamma":1.35,"saturation":1,"contrast":0.6,"brightness":0.6666666666666666,"red":1.9,"green":0.8333333333333333,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "LightNeutral", override: false},
		},
		Model: "TapeAnkles",
		maxwill: 0.1,
		enemyTags: {"scarfRestraints":2}, playerTags: {"ItemFeetFull":2}, minLevel: 0, allFloors: true, shrine: ["Rope", "Tape"]},
	// Simple cloth stuff
	{name: "ScarfGag", unlimited: true, Asset: "ScarfGag", debris: "Fabric", accessible: true, gag: 0.3, Type: "OTN", Color: "#880022", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemMouth", AssetGroup: "ItemMouth3", power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		affinity: {Remove: ["Hook"],},
		Filters: {
			Cloth: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.3833333333333333,"red":2.3666666666666667,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Cloth: {color: "LightNeutral", override: false},
		},
		Model: "ClothOTM",
		enemyTags: {"scarfRestraints":8, "ropeAuxiliary": 1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Gags", "Tape"]},
	{name: "ScarfBlindfold", unlimited: true, Asset: "ScarfBlindfold", debris: "Fabric", accessible: true, Color: "#880022", Group: "ItemHead", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		affinity: {Struggle: ["Sticky", "Hook"], Remove: ["Hook"],},
		Filters: {
			Cloth: {"gamma":1,"saturation":1,"contrast":0.8333333333333333,"brightness":0.48333333333333334,"red":2.3666666666666667,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Cloth: {color: "LightNeutral", override: false},
		},
		Model: "ClothBlindfold",
		blindfold: 2, enemyTags: {"scarfRestraints":8, "ropeAuxiliary": 1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Rope", "Blindfolds", "Tape"]},
	// endregion

	// region Kigu
	{inventory: true, name: "KiguMask", inaccessible: true, Asset: "KirugumiMask", Color: ["Default", "Default"], AssetGroup: "ItemHood", Group: "ItemHead", LinkableBy: [...KDMaskLink], gag: 0.3, blindfold: 1, power: 7, weight: 0,
		Model: "KiguMask",
		escapeChance: {"Struggle": -0.2, "Cut": -0.1, "Remove": 0.33, "Pick": 0.15, "Unlock": 0.6},
		enemyTags: {"kiguRestraints":1}, playerTags: {"ItemMouth1Full":2, "ItemMouth2Full":1, "NoKigu": -1000}, minLevel: 0, allFloors: true, shrine: ["Latex", "Masks", "Block_ItemMouth"], events: [
			//{trigger: "onWear", type: "setSkinColor"},
		]},
	// endregion

	// region Hood
	{inventory: true, name: "LeatherHood", inaccessible: true, Color: ["Default", "Default"],
		Group: "ItemHead", LinkableBy: [...KDMaskLink], gag: 0.7, blindfold: 3, power: 5, weight: 0,
		Model: "LeatherHood",
		escapeChance: {"Struggle": -0.35, "Cut": -0.15, "Remove": 0.12, "Pick": 0.11, "Unlock": 0.7},
		enemyTags: {"sensedep":10},
		maxwill: 0.1,
		playerTags: {"ItemMouth1Full":2, "ItemMouth2Full":1, "NoHood": -1000, NoSenseDep: -1000},
		minLevel: 0, allFloors: true, shrine: ["Leather", "Hoods", "Block_ItemMouth"],
		deaf: 4,
	},
	{inventory: true, name: "LeatherMask", inaccessible: true, Color: ["Default", "Default"],
		Group: "ItemHead", LinkableBy: [...KDMaskLink], gag: 0.7, blindfold: 3, power: 5, weight: 0,
		Model: "LeatherMask",
		escapeChance: {"Struggle": -0.35, "Cut": -0.15, "Remove": 0.12, "Pick": 0.11, "Unlock": 0.7},
		enemyTags: {"sensedep":10},
		maxwill: 0.1,
		playerTags: {"ItemMouth1Full":2, "ItemMouth2Full":1, "Unmasked": -1000, NoSenseDep: -1000},
		minLevel: 0, allFloors: true, shrine: ["Leather", "Masks", "Block_ItemMouth"],
		deaf: 4,
	},
	// endregion

	//region Charms
	// Not super punishing but would be hard to apply IRL
	{inventory: true, name: "CharmRaw",
		noRecycle: true,
		requireSingleTagToEquip: ["Impossible"],
		Asset: "", Color: "",
		Group: "ItemDevices", power: 1, weight: -1000,
		escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.05},
		enemyTags: {}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["Charms", "Tape", "Raw"]},
	{inventory: true, name: "DuctTapeRaw",
		noRecycle: true,
		requireSingleTagToEquip: ["Impossible"],
		Asset: "", Color: "",
		Group: "ItemDevices", power: 1, weight: -1000,
		escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.05},
		enemyTags: {}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["Tape", "Raw"]},
	{inventory: true, name: "DuctTapeCollar", debris: "Fabric", Asset: "LatexCollar2", factionColor: [[], [0]], Color: "Default", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: 4, DefaultLock: "Blue",
		Model: "ElfCollarRestraint",
		struggleBreak: true,
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		maxwill: 0.25, enemyTags: {"livingCollar":10}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["Collars","Tape"],
		events: [{trigger: "tick", type: "livingRestraints", tags: ["ribbonRestraints"], cloneTags: [], inheritLinked: true, frequencyMax: 60, frequencyMin: 10, frequencyStep: 0.8, count: 4}]
	},
	{inventory: true, name: "DuctTapeHands", unlimited: true, inaccessible: true, Asset: "DuctTape", Color: "Default", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemHands",
		factionColor: [[], [0]],
		Model: "TapeHeavyHands",
		disassembleAs: "DuctTapeRaw",
		bindhands: 0.9, power: 1, weight: 0, escapeChance: {"Struggle": -0.1, "Cut": 0.4, "Remove": 0.4}, struggleMaxSpeed: {"Remove": 0.1},
		strictness: 0.05, strictnessZones: ["ItemHands"], failSuffix: {"Remove": "Tape"},
		maxwill: 0.6, enemyTags: {"tapeRestraints":8, "ropeAuxiliary": 4}, playerTags: {"ItemHandsFull": -4}, minLevel: 0, allFloors: true, shrine: ["Tape", "Wrapping"]},

	{removePrison: true, name: "DuctTapeArms", unlimited: true, debris: "Fabric", accessible: true, Asset: "DuctTape", Color: "#AA2222", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemArms", bindarms: true, power: -2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeArms",
		addTag: ["HandsBehind"],
		disassembleAs: "CharmRaw",
		Filters: {
			Tape: {"gamma":0.18333333333333335,"saturation":1,"contrast":0.8333333333333333,"brightness":1.2166666666666668,"red":5,"green":1.607843137254902,"blue":2.3333333333333335,"alpha":1},
		},
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {"ItemArmsFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms", "Tape", "Will"]},
	{removePrison: true, name: "DuctTapeFeet", unlimited: true, debris: "Fabric", accessible: true, Asset: "DuctTape", Color: "#AA2222", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: -2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeAnkles",
		maxwill: 0.1,
		disassembleAs: "CharmRaw",
		Filters: {
			Tape: {"gamma":0.18333333333333335,"saturation":1,"contrast":0.8333333333333333,"brightness":1.2166666666666668,"red":5,"green":1.607843137254902,"blue":2.3333333333333335,"alpha":1},
		},
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {"ItemLegsFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms", "Tape", "Will"]},
	{removePrison: true, name: "DuctTapeBoots", unlimited: true, debris: "Fabric", inaccessible: true, Asset: "ToeTape", Type: "Full", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Color: "#AA2222", Group: "ItemBoots", blockfeet: true, addTag: ["FeetLinked"],power: -2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeHeavyBoots",
		disassembleAs: "CharmRaw",
		maxwill: 0.05,
		Filters: {
			Tape: {"gamma":0.18333333333333335,"saturation":1,"contrast":0.8333333333333333,"brightness":1.2166666666666668,"red":5,"green":1.607843137254902,"blue":2.3333333333333335,"alpha":1},
		},
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {"ItemFeetFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms", "Wrapping", "Will"]},
	{removePrison: true, name: "DuctTapeLegs", OverridePriority: 25.1, unlimited: true, debris: "Fabric", accessible: true, Asset: "DuctTape", Color: "#AA2222", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: -2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeLegs",
		maxwill: 0.4,
		disassembleAs: "CharmRaw",
		Filters: {
			Tape: {"gamma":0.18333333333333335,"saturation":1,"contrast":0.8333333333333333,"brightness":1.2166666666666668,"red":5,"green":1.607843137254902,"blue":2.3333333333333335,"alpha":1},
		},
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {"ItemFeetFull":8}, minLevel: 0, allFloors: true, shrine: ["Charms", "Tape", "Will"]},
	{removePrison: true, name: "DuctTapeHead", unlimited: true, debris: "Fabric", inaccessible: true, Type: "Wrap", Asset: "DuctTape", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Color: "#AA2222", Group: "ItemHead", power: -2, blindfold: 3, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "BlindfoldTape",
		disassembleAs: "CharmRaw",
		quickBindCondition: "TapeBlindfold",
		Filters: {
			Tape: {"gamma":0.18333333333333335,"saturation":1,"contrast":0.8333333333333333,"brightness":1.2166666666666668,"red":5,"green":1.607843137254902,"blue":2.3333333333333335,"alpha":1},
		},
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {NoBlindfolds: -1000}, minLevel: 0, allFloors: true, shrine: ["Charms", "Tape", "Will"]},
	{removePrison: true, name: "DuctTapeMouth", unlimited: true, debris: "Fabric", Asset: "DuctTape", Color: "#AA2222", Group: "ItemMouth", AssetGroup: "ItemMouth2", gag: 0.5, power: -2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeWrapOver",
		disassembleAs: "CharmRaw",
		quickBindCondition: "TapeGag",
		Filters: {
			Tape: {"gamma":0.18333333333333335,"saturation":1,"contrast":0.8333333333333333,"brightness":1.2166666666666668,"red":5,"green":1.607843137254902,"blue":2.3333333333333335,"alpha":1},
		},
		LinkableBy: [...KDTapeLink],
		renderWhenLinked: [...KDTapeRender],
		enemyTags: {"ribbonRestraints":5, "ribbonRestraintsLight":5}, playerTags: {"ItemMouth1Full":8}, minLevel: 0, allFloors: true, shrine: ["Charms", "Gags", "Tape", "Will"]},

	{removePrison: true, name: "DuctTapeHeadMummy", unlimited: true, debris: "Fabric", inaccessible: true, Asset: "LeatherSlimMask", LinkableBy: [...KDWrappingLink], renderWhenLinked: [...KDWrappingLink], Color: "#AA2222", Group: "ItemHead", gag: 0.5, blindfold: 4, power: 2, weight: 0,  escapeChance: {"Struggle": 0.15, "Cut": 0.8, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeFace",
		disassembleAs: "CharmRaw",
		disassembleCount: 2,
		Filters: {
			Tape: {"gamma":0.18333333333333335,"saturation":1,"contrast":0.8333333333333333,"brightness":1.2166666666666668,"red":5,"green":1.607843137254902,"blue":2.3333333333333335,"alpha":1},
		},
		enemyTags: {"ribbonRestraints":1}, playerTags: {"ItemMouth1Full":2, "ItemMouth2Full":1, "Unmasked": -1000}, minLevel: 2, allFloors: true, shrine: ["Charms", "Wrapping", "Block_ItemMouth", "Will"]},
	{removePrison: true, name: "DuctTapeArmsMummy", unlimited: true, debris: "Fabric", inaccessible: true, Type: "Complete", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender],
		remove: ["Cloth", "ClothLower", "Tops"],
		addTag: ["HandsBehind"],
		disassembleAs: "CharmRaw",
		disassembleCount: 2,
		Asset: "DuctTape", Color: "#AA2222", Group: "ItemArms", bindarms: true, power: 2, weight: 0,  escapeChance: {"Struggle": 0.1, "Cut": 0.8, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeHeavyArmsFull",
		Filters: {
			Tape: {"gamma":0.18333333333333335,"saturation":1,"contrast":0.8333333333333333,"brightness":1.2166666666666668,"red":5,"green":1.607843137254902,"blue":2.3333333333333335,"alpha":1},
		},
		enemyTags: {"ribbonRestraints":1}, playerTags: {"ItemArmsFull":3}, minLevel: 0, allFloors: true, shrine: ["Charms", "Wrapping", "Will"]},
	{removePrison: true, name: "DuctTapeLegsMummy", OverridePriority: 25.1, unlimited: true, debris: "Fabric", inaccessible: true, Type: "CompleteLegs", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender],
		remove: ["ClothLower", "Skirts"], Asset: "DuctTape", Color: "#AA2222", Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 2, weight: 0,  escapeChance: {"Struggle": 0.15, "Cut": 0.8, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeHeavyBottomFull",
		maxwill: 0.3,
		disassembleAs: "CharmRaw",
		disassembleCount: 2,
		Filters: {
			Tape: {"gamma":0.18333333333333335,"saturation":1,"contrast":0.8333333333333333,"brightness":1.2166666666666668,"red":5,"green":1.607843137254902,"blue":2.3333333333333335,"alpha":1},
		},
		enemyTags: {"ribbonRestraints":1}, playerTags: {"ItemLegsFull":3}, minLevel: 0, allFloors: true, shrine: ["Charms", "Hobbleskirts", "Wrapping", "Will"]},
	{removePrison: true, name: "DuctTapeFeetMummy", unlimited: true, debris: "Fabric", inaccessible: true, Type: "CompleteFeet", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Asset: "DuctTape", Color: "#AA2222", Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 2, weight: 0,  escapeChance: {"Struggle": 0.15, "Cut": 0.8, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeHeavyAnkles",
		maxwill: 0.1,
		disassembleAs: "CharmRaw",
		disassembleCount: 2,
		Filters: {
			Tape: {"gamma":0.18333333333333335,"saturation":1,"contrast":0.8333333333333333,"brightness":1.2166666666666668,"red":5,"green":1.607843137254902,"blue":2.3333333333333335,"alpha":1},
		},
		enemyTags: {"ribbonRestraints":1}, playerTags: {"ItemFeetFull":3}, minLevel: 0, allFloors: true, shrine: ["Charms", "Wrapping", "Will"]},
	//endregion

	// region Bubbles
	{removePrison: true, name: "BubbleHead", unlimited: true, debris: "Water", inaccessible: true, Asset: "DuctTape",
		Color: "#2277ee", Group: "ItemHead", power: 2, blindfold: 3, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": 1.0, "Remove": -0.5},
		Model: "BubbleHead",
		tightType: "Thick",
		events: [
			{trigger: "postApply", type: "BubbleCombine", count: 3, inheritLinked: true},
		],
		enemyTags: {"aquaRestraints":50}, playerTags: {"Furniture": -100}, minLevel: 0, allFloors: true, shrine: ["CombineBubble1", "Elements", "Encase", "Bubble", "Block_ItemMouth", "Block_ItemEars"]},
	{removePrison: true, name: "BubbleArms", unlimited: true, debris: "Water", inaccessible: true, Asset: "DuctTape",
		Color: "#2277ee", Group: "ItemArms", power: 2, bindarms: true, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": 1.0, "Remove": -0.5},
		Model: "BubbleArms",
		tightType: "Thick",
		events: [
			{trigger: "postApply", type: "BubbleCombine", count: 3, inheritLinked: true},
		],
		enemyTags: {"aquaRestraints":1}, playerTags: {"Furniture": -100}, minLevel: 0, allFloors: true, shrine: ["CombineBubble2", "Elements", "Encase", "Bubble", "Block_ItemHands", "Block_ItemBreast", "Block_ItemNipples"]},

	{removePrison: true, name: "BubbleLegs", unlimited: true, debris: "Water", inaccessible: true, Asset: "DuctTape",
		Color: "#2277ee", Group: "ItemLegs", power: 2, weight: 0, hobble: 2, heelpower: 10,
		maxwill: 0.5,
		escapeChance: {"Struggle": -0.1, "Cut": 1.0, "Remove": -0.5},
		Model: "BubbleLegs",
		tightType: "Thick",
		events: [
			{trigger: "postApply", type: "BubbleCombine", count: 3, inheritLinked: true},
		],
		enemyTags: {"aquaRestraints":25}, playerTags: {"Furniture": -100}, minLevel: 0, allFloors: true, shrine: ["CombineBubble3", "Elements", "DiscourageKneel", "Encase", "Bubble", "Block_ItemFeet", "Block_ItemBoots", "Block_ItemPelvis", "Block_ItemVulva", "Block_ItemVulvaPiercings"]},

	//endregion

	//region BlessedWrappings
	{inventory: true, name: "MysticDuctTapeCollar", debris: "FabricGreen", Asset: "LatexCollar2", factionColor: [[], [0]], Color: "Default", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: 4, DefaultLock: "Blue",
		Model: "ElfCollarRestraint",
		struggleBreak: true,
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		tightType: "Secure",
		maxwill: 0.25, enemyTags: {"livingCollar":10}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["MysticDuctTape", "Collars","Will"],
		events: [{trigger: "tick", type: "livingRestraints", tags: ["mummyRestraints"], cloneTags: [], inheritLinked: true, frequencyMax: 60, frequencyMin: 10, frequencyStep: 0.8, count: 4}]
	},
	{inventory: true, name: "MysticDuctTapeRaw",
		noRecycle: true,
		requireSingleTagToEquip: ["Impossible"],
		Asset: "", Color: "",
		Group: "ItemDevices", power: 1, weight: -1000,
		escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.05},
		enemyTags: {}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["MysticDuctTape", "Charms", "Tape", "Raw"]},
	{removePrison: true, name: "MysticDuctTapeHead", unlimited: true, debris: "FabricGreen", inaccessible: true, Type: "Wrap", Asset: "DuctTape", Color: "#55AA22", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemHead", blindfold: 4, power: 1, weight: 0, escapeChance: {"Struggle": 0.2, "Cut": 0.6, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeFace",
		disassembleAs: "MysticDuctTapeRaw",
		quickBindCondition: "TapeBlindfold",
		Filters: {
			Tape: {"gamma":1,"saturation":1,"contrast":1.2666666666666668,"brightness":0.6666666666666666,"red":1,"green":1.6833333333333333,"blue":0.6666666666666666,"alpha":1},
		},
		enemyTags: {"mummyRestraints":-499}, playerTags: {"ItemHeadFull":99, "ItemMouthFull":99, "ItemArmsFull":99, "ItemLegsFull":99, "ItemFeetFull":99, "ItemBootsFull":99, NoBlindfolds: 99, Unmasked: -1000}, minLevel: 0, allFloors: true, shrine: ["MysticDuctTape", "Charms", "Wrapping", "Block_ItemMouth", "Will"]},
	{removePrison: true, name: "MysticDuctTapeEyes", unlimited: true, debris: "FabricGreen", inaccessible: true, Type: "Wrap", Asset: "DuctTape", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Color: "#AA2222", Group: "ItemHead", power: 3, blindfold: 3, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.9, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "BlindfoldTape",
		disassembleAs: "MysticDuctTapeRaw",
		Filters: {
			Tape: {"gamma":1,"saturation":1,"contrast":1.2666666666666668,"brightness":0.6666666666666666,"red":1,"green":1.6833333333333333,"blue":0.6666666666666666,"alpha":1},
		},
		enemyTags: {"mummyRestraints":-399}, playerTags: {"ItemMouthFull":99, "ItemArmsFull":99, "ItemLegsFull":99, "ItemFeetFull":99, "ItemBootsFull":99, NoBlindfolds: -1000}, minLevel: 0, allFloors: true, shrine: ["MysticDuctTape", "Charms", "Tape", "Will"]},
	{removePrison: true, name: "MysticDuctTapeMouth", unlimited: true, debris: "FabricGreen", inaccessible: true, Asset: "DuctTape", Color: "#55AA22", Group: "ItemMouth", AssetGroup: "ItemMouth2", gag: 0.5, power: 1, weight: 0, escapeChance: {"Struggle": 0.2, "Cut": 0.6, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeFull",
		LinkableBy: [...KDTapeLink],
		disassembleAs: "MysticDuctTapeRaw",
		renderWhenLinked: [...KDTapeRender],
		quickBindCondition: "TapeGag",
		Filters: {
			Tape: {"gamma":1,"saturation":1,"contrast":1.2666666666666668,"brightness":0.6666666666666666,"red":1,"green":1.6833333333333333,"blue":0.6666666666666666,"alpha":1},
		},
		enemyTags: {"mummyRestraints":-299}, playerTags: {"ItemArmsFull":99, "ItemLegsFull":99, "ItemFeetFull":99, "ItemBootsFull":99}, minLevel: 0, allFloors: true, shrine: ["MysticDuctTape", "Charms", "Gags", "Wrapping", "Will"]},
	{removePrison: true, name: "MysticDuctTapeArmsMummy", unlimited: true, debris: "FabricGreen", inaccessible: true, Type: "Complete", remove: ["Cloth", "ClothLower", "Tops"], LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Asset: "DuctTape", Color: "#55AA22", Group: "ItemArms", bindarms: true, power: 3, weight: 0,  escapeChance: {"Struggle": 0.05, "Cut": 0.5, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeHeavyArmsFull",
		addTag: ["HandsBehind"],
		disassembleAs: "MysticDuctTapeRaw",
		disassembleCount: 2,
		Filters: {
			Tape: {"gamma":1,"saturation":1,"contrast":1.2666666666666668,"brightness":0.6666666666666666,"red":1,"green":1.6833333333333333,"blue":0.6666666666666666,"alpha":1},
		},
		enemyTags: {"mummyRestraints":-199}, playerTags: {"ItemLegsFull":99, "ItemFeetFull":99, "ItemBootsFull":99}, minLevel: 0, allFloors: true, shrine: ["MysticDuctTape", "Charms", "Wrapping", "Will"]},
	{removePrison: true, name: "MysticDuctTapeLegsMummy", unlimited: true, OverridePriority: 25.1, debris: "FabricGreen", inaccessible: true, Type: "CompleteLegs", remove: ["ClothLower", "Skirts"], LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Asset: "DuctTape", Color: "#55AA22", Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 3, weight: 0,  escapeChance: {"Struggle": 0.05, "Cut": 0.5, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeHeavyBottomFull",
		maxwill: 0.3,
		disassembleAs: "MysticDuctTapeRaw",
		disassembleCount: 2,
		Filters: {
			Tape: {"gamma":1,"saturation":1,"contrast":1.2666666666666668,"brightness":0.6666666666666666,"red":1,"green":1.6833333333333333,"blue":0.6666666666666666,"alpha":1},
		},
		enemyTags: {"mummyRestraints":-99}, playerTags: {"ItemFeetFull":99, "ItemBootsFull":99}, minLevel: 0, allFloors: true, shrine: ["MysticDuctTape", "Charms", "Hobbleskirts", "Will", "Wrapping", "Encase",]},
	{removePrison: true, name: "MysticDuctTapeFeetMummy", unlimited: true, debris: "FabricGreen", inaccessible: true, Type: "CompleteFeet", Asset: "DuctTape", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Color: "#55AA22", Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 3, weight: 0,  escapeChance: {"Struggle": 0.05, "Cut": 0.5, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeHeavyAnkles",
		maxwill: 0.1,
		disassembleAs: "MysticDuctTapeRaw",
		disassembleCount: 2,
		Filters: {
			Tape: {"gamma":1,"saturation":1,"contrast":1.2666666666666668,"brightness":0.6666666666666666,"red":1,"green":1.6833333333333333,"blue":0.6666666666666666,"alpha":1},
		},
		enemyTags: {"mummyRestraints":-1}, playerTags: {"ItemBootsFull":99}, minLevel: 0, allFloors: true, shrine: ["MysticDuctTape", "Charms", "Wrapping", "Will"]},
	{removePrison: true, name: "MysticDuctTapeBoots", unlimited: true, debris: "FabricGreen", inaccessible: true, Asset: "ToeTape", Type: "Full", Color: "#55AA22", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemBoots", blockfeet: true, addTag: ["FeetLinked"],power: 3, weight: 0,  escapeChance: {"Struggle": 0.05, "Cut": 0.5, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeHeavyBoots",
		maxwill: 0.05,
		disassembleAs: "MysticDuctTapeRaw",
		disassembleCount: 2,
		Filters: {
			Tape: {"gamma":1,"saturation":1,"contrast":1.2666666666666668,"brightness":0.6666666666666666,"red":1,"green":1.6833333333333333,"blue":0.6666666666666666,"alpha":1},
		},
		enemyTags: {"mummyRestraints":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["MysticDuctTape", "Charms", "Wrapping", "Will"]},
	{inventory: true, name: "MysticDuctTapeHands", unlimited: true, inaccessible: true, Asset: "DuctTape", Color: "Default", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemHands",
		Filters: {
			Tape: {"gamma":1,"saturation":1,"contrast":1.2666666666666668,"brightness":0.6666666666666666,"red":1,"green":1.6833333333333333,"blue":0.6666666666666666,"alpha":1},
		},
		Model: "TapeHeavyHands",
		disassembleAs: "MysticDuctTapeRaw",
		bindhands: 0.9, power: 3, weight: 0, escapeChance: {"Struggle": 0.05, "Cut": 0.5, "Remove": 0},
		strictness: 0.05, strictnessZones: ["ItemHands"], failSuffix: {"Remove": "Tape"},
		maxwill: 0.6, enemyTags: {"mummyRestraints":100}, playerTags: {"ItemHandsFull": -4}, minLevel: 0, allFloors: true, shrine: ["MysticDuctTape", "Charms", "Wrapping", "Will"]},


	//endregion

	//region AutoTape
	{inventory: true, name: "AutoTapeCollar", Asset: "LatexCollar2", factionColor: [[], [0]], Color: "Default", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: 4, DefaultLock: "Blue",
		Model: "ElfCollarRestraint",
		struggleBreak: true,
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		tightType: "Secure",
		maxwill: 0.25, enemyTags: {"livingCollar":10}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["AutoTape", "Collars","Tape"],
		events: [{trigger: "tick", type: "livingRestraints", tags: ["autoTape"], cloneTags: [], inheritLinked: true, frequencyMax: 60, frequencyMin: 10, frequencyStep: 0.8, count: 4}]
	},
	{inventory: true, name: "AutoTapeRaw",
		noRecycle: true,
		requireSingleTagToEquip: ["Impossible"],
		Asset: "", Color: "",
		Group: "ItemDevices", power: 1, weight: -1000,
		escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.05},
		enemyTags: {}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["AutoTape", "Tape", "Raw"]},

	{inventory: true, name: "AutoTapeHands", unlimited: true, inaccessible: true, Asset: "DuctTape", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemHands",
		Model: "TapeHeavyHands",
		disassembleAs: "AutoTapeRaw",
		Filters: {
			Tape: {"gamma":0.8333333333333333,"saturation":0.9833333333333333,"contrast":1.4166666666666665,"brightness":0.7833333333333334,"red":1,"green":1.4333333333333333,"blue":3.216666666666667,"alpha":1},
		},
		bindhands: 1.0, power: 6, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0.}, struggleMaxSpeed: {"Remove": 0.1}, failSuffix: {"Remove": "Tape"},
		strictness: 0.1, strictnessZones: ["ItemHands"], limitChance: {Struggle: 0.12},
		maxwill: 0.6, enemyTags: {"autoTape":8}, playerTags: {"ItemHandsFull": -4}, minLevel: 8, allFloors: true, shrine: ["AutoTape", "Tape"]},
	{removePrison: true, name: "AutoTapeArms", unlimited: true, accessible: true, Type: "Top", Asset: "DuctTape", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemArms",
		Model: "TapeStrappedArms",
		addTag: ["HandsBehind"],
		disassembleAs: "AutoTapeRaw",
		Filters: {
			Tape: {"gamma":0.8333333333333333,"saturation":0.9833333333333333,"contrast":1.4166666666666665,"brightness":0.7833333333333334,"red":1,"green":1.4333333333333333,"blue":3.216666666666667,"alpha":1},
		},
		bindarms: true, power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"autoTape":10}, playerTags: {"ItemArmsFull":8}, minLevel: 0, allFloors: true, shrine: ["AutoTape", "Tape"]},
	{removePrison: true, name: "AutoTapeFeet", unlimited: true, accessible: true, Asset: "DuctTape", Color: "#6E9FA3", Group: "ItemFeet", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], blockfeet: true, addTag: ["FeetLinked"],power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeMedAnkles",
		Filters: {
			Tape: {"gamma":0.8333333333333333,"saturation":0.9833333333333333,"contrast":1.4166666666666665,"brightness":0.7833333333333334,"red":1,"green":1.4333333333333333,"blue":3.216666666666667,"alpha":1},
		},
		disassembleAs: "AutoTapeRaw",
		enemyTags: {"autoTape":10}, playerTags: {"ItemLegsFull":8}, minLevel: 0, allFloors: true, shrine: ["AutoTape", "Tape"]},
	{removePrison: true, name: "AutoTapeBoots", unlimited: true, accessible: true, Asset: "ToeTape", Type: "Full", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemBoots", blockfeet: true, addTag: ["FeetLinked"],power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeMedBoots",
		disassembleAs: "AutoTapeRaw",
		Filters: {
			Tape: {"gamma":0.8333333333333333,"saturation":0.9833333333333333,"contrast":1.4166666666666665,"brightness":0.7833333333333334,"red":1,"green":1.4333333333333333,"blue":3.216666666666667,"alpha":1},
		},
		enemyTags: {"autoTape":10}, playerTags: {"ItemFeetFull":8}, minLevel: 0, allFloors: true, shrine: ["AutoTape", "Tape", "Wrapping", "Encase",]},
	{removePrison: true, name: "AutoTapeLegs", unlimited: true, accessible: true, Type: "MostLegs", Asset: "DuctTape", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeMedLegs",
		disassembleAs: "AutoTapeRaw",
		Filters: {
			Tape: {"gamma":0.8333333333333333,"saturation":0.9833333333333333,"contrast":1.4166666666666665,"brightness":0.7833333333333334,"red":1,"green":1.4333333333333333,"blue":3.216666666666667,"alpha":1},
		},
		enemyTags: {"autoTape":10}, playerTags: {"ItemFeetFull":8}, minLevel: 0, allFloors: true, shrine: ["AutoTape", "Tape"]},
	{removePrison: true, name: "AutoTapeHead", unlimited: true, inaccessible: true, Type: "Wrap", Asset: "DuctTape", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemHead", power: 5, blindfold: 4, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "BlindfoldTape",
		disassembleAs: "AutoTapeRaw",
		quickBindCondition: "TapeBlindfold",
		Filters: {
			Tape: {"gamma":0.8333333333333333,"saturation":0.9833333333333333,"contrast":1.4166666666666665,"brightness":0.7833333333333334,"red":1,"green":1.4333333333333333,"blue":3.216666666666667,"alpha":1},
		},
		enemyTags: {}, playerTags: {NoBlindfolds: -1000}, minLevel: 0, allFloors: true, shrine: ["AutoTape", "Tape"]},
	{removePrison: true, name: "AutoTapeMouth", unlimited: true, accessible: true, Asset: "DuctTape", Type: "Double", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemMouth", AssetGroup: "ItemMouth2", gag: 0.5, power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeWrapOver",
		disassembleAs: "AutoTapeRaw",
		quickBindCondition: "TapeGag",
		Filters: {
			Tape: {"gamma":0.8333333333333333,"saturation":0.9833333333333333,"contrast":1.4166666666666665,"brightness":0.7833333333333334,"red":1,"green":1.4333333333333333,"blue":3.216666666666667,"alpha":1},
		},
		enemyTags: {"autoTape":10}, playerTags: {"ItemMouth1Full":8}, minLevel: 0, allFloors: true, shrine: ["AutoTape", "Gags", "Tape"]},
	{removePrison: true, name: "AutoTapeMouthFull", unlimited: true, accessible: true, Asset: "DuctTape", Type: "Double", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemMouth", AssetGroup: "ItemMouth2", gag: 0.5, power: 5, weight: 0,
		escapeChance: {"Struggle": 0.0, "Cut": 0.2, "Remove": -.1}, failSuffix: {"Remove": "Tape"},
		Model: "TapeFullOver",
		disassembleAs: "AutoTapeRaw",
		Filters: {
			Tape: {"gamma":0.8333333333333333,"saturation":0.9833333333333333,"contrast":1.4166666666666665,"brightness":0.7833333333333334,"red":1,"green":1.4333333333333333,"blue":3.216666666666667,"alpha":1},
		},
		enemyTags: {"autoTape":10}, playerTags: {"ItemMouth1Full":8}, minLevel: 0, allFloors: true, shrine: ["AutoTape", "Gags", "Tape", "Wrapping", "Encase"]},
	//endregion


	//region VinylTape
	{inventory: true, name: "VinylTapeCollar", Asset: "LatexCollar2", factionColor: [[], [0]], Color: "Default", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: 4, DefaultLock: "Blue",
		Model: "ElfCollarRestraint",
		struggleBreak: true,
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		tightType: "Secure",
		maxwill: 0.25, enemyTags: {"livingCollar":10}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["VinylTape", "Collars","Tape"],
		events: [{trigger: "tick", type: "livingRestraints", tags: ["vinylTape"], cloneTags: [], inheritLinked: true, frequencyMax: 60, frequencyMin: 10, frequencyStep: 0.8, count: 4}]
	},
	{inventory: true, name: "VinylTapeRaw",
		noRecycle: true,
		requireSingleTagToEquip: ["Impossible"],
		Asset: "", Color: "",
		Group: "ItemDevices", power: 1, weight: -1000,
		escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.05},
		enemyTags: {}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["VinylTape", "Tape", "Raw"]},

	{inventory: true, name: "VinylTapeHands", unlimited: true, inaccessible: true, Asset: "DuctTape", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemHands",
		Model: "TapeHeavyHands",
		disassembleAs: "VinylTapeRaw",
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		bindhands: 1.0, power: 6, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0.}, struggleMaxSpeed: {"Remove": 0.1}, failSuffix: {"Remove": "Tape"},
		strictness: 0.1, strictnessZones: ["ItemHands"], limitChance: {Struggle: 0.12},
		maxwill: 0.6, enemyTags: {"vinylTape":8}, playerTags: {"ItemHandsFull": -4}, minLevel: 8, allFloors: true, shrine: ["VinylTape", "Tape", "Latex"]},
	{removePrison: true, name: "VinylTapeArms", unlimited: true, accessible: true, Type: "Top", Asset: "DuctTape", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemArms",
		Model: "TapeStrappedArms",
		addTag: ["HandsBehind"],
		disassembleAs: "VinylTapeRaw",
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		bindarms: true, power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		enemyTags: {"vinylTape":10}, playerTags: {"ItemArmsFull":8}, minLevel: 0, allFloors: true, shrine: ["VinylTape", "Tape", "Latex"]},
	{removePrison: true, name: "VinylTapeFeet", unlimited: true, accessible: true, Asset: "DuctTape", Color: "#6E9FA3", Group: "ItemFeet", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], blockfeet: true, addTag: ["FeetLinked"],power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeMedAnkles",
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		disassembleAs: "VinylTapeRaw",
		enemyTags: {"vinylTape":10}, playerTags: {"ItemLegsFull":8}, minLevel: 0, allFloors: true, shrine: ["VinylTape", "Tape", "Latex"]},
	{removePrison: true, name: "VinylTapeBoots", unlimited: true, accessible: true, Asset: "ToeTape", Type: "Full", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemBoots", blockfeet: true, addTag: ["FeetLinked"],power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeMedBoots",
		disassembleAs: "VinylTapeRaw",
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		enemyTags: {"vinylTape":10}, playerTags: {"ItemFeetFull":8}, minLevel: 0, allFloors: true, shrine: ["VinylTape", "Tape", "Wrapping", "Encase", "Latex"]},
	{removePrison: true, name: "VinylTapeLegs", unlimited: true, accessible: true, Type: "MostLegs", Asset: "DuctTape", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 5, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeMedLegs",
		disassembleAs: "VinylTapeRaw",
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		enemyTags: {"vinylTape":10}, playerTags: {"ItemFeetFull":8}, minLevel: 0, allFloors: true, shrine: ["VinylTape", "Tape", "Latex"]},
	{removePrison: true, name: "VinylTapeHead", unlimited: true, inaccessible: true, Type: "Wrap", Asset: "DuctTape", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemHead", power: 5, blindfold: 4, weight: 0, escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "BlindfoldTape",
		disassembleAs: "VinylTapeRaw",
		quickBindCondition: "TapeBlindfold",
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		enemyTags: {}, playerTags: {NoBlindfolds: -1000}, minLevel: 0, allFloors: true, shrine: ["VinylTape", "Tape", "Latex"]},
	{removePrison: true, name: "VinylTapeMouth", unlimited: true, accessible: true, Asset: "DuctTape", Type: "Double", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemMouth", AssetGroup: "ItemMouth2", gag: 0.5, power: 5, weight: 0,
		escapeChance: {"Struggle": 0.1, "Cut": 0.2, "Remove": 0}, failSuffix: {"Remove": "Tape"},
		Model: "TapeWrapOver",
		disassembleAs: "VinylTapeRaw",
		quickBindCondition: "TapeGag",
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		enemyTags: {"vinylTape":10}, playerTags: {"ItemMouth1Full":8}, minLevel: 0, allFloors: true, shrine: ["VinylTape", "Gags", "Tape", "Latex"]},
	{removePrison: true, name: "VinylTapeMouthFull", unlimited: true, accessible: true, Asset: "DuctTape", Type: "Double", Color: "#6E9FA3", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemMouth", AssetGroup: "ItemMouth2", gag: 0.5, power: 5, weight: 0,
		escapeChance: {"Struggle": 0.0, "Cut": 0.2, "Remove": -.1}, failSuffix: {"Remove": "Tape"},
		Model: "TapeFullOver",
		disassembleAs: "VinylTapeRaw",
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		enemyTags: {"vinylTape":10}, playerTags: {"ItemMouth1Full":8}, minLevel: 0, allFloors: true, shrine: ["VinylTape", "Gags", "Tape", "Latex", "Wrapping", "Encase"]},


	{removePrison: true, name: "VinylTapeHeadMummy", unlimited: true, debris: "Fabric", inaccessible: true, Asset: "LeatherSlimMask", LinkableBy: [...KDWrappingLink], renderWhenLinked: [...KDWrappingLink], Color: "#AA2222", Group: "ItemHead", gag: 0.5, blindfold: 4, power: 2, weight: 0,
		escapeChance: {"Struggle": 0.0, "Cut": 0.2, "Remove": -.1}, failSuffix: {"Remove": "Tape"},
		Model: "TapeFace",
		disassembleAs: "VinylTapeRaw",
		disassembleCount: 2,
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		enemyTags: {"vinylTapeMummyHead":1}, playerTags: {"ItemMouth1Full":2, "ItemMouth2Full":1, "Unmasked": -1000}, minLevel: 2, allFloors: true, shrine: ["VinylTape", "Wrapping", "Block_ItemMouth", "Latex"]},
	{removePrison: true, name: "VinylTapeArmsMummy", unlimited: true, debris: "Fabric", inaccessible: true, Type: "Complete", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender],
		remove: ["Cloth", "ClothLower", "Tops"],
		addTag: ["HandsBehind"],
		disassembleAs: "VinylTapeRaw",
		disassembleCount: 2,
		Asset: "VinylTape", Color: "#AA2222", Group: "ItemArms", bindarms: true, power: 2, weight: 0,
		escapeChance: {"Struggle": 0.0, "Cut": 0.2, "Remove": -.1}, failSuffix: {"Remove": "Tape"},
		Model: "TapeHeavyArmsFull",
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		enemyTags: {"vinylTapeMummy":1}, playerTags: {"ItemArmsFull":3}, minLevel: 0, allFloors: true, shrine: ["VinylTape", "Wrapping", "Latex"]},
	{removePrison: true, name: "VinylTapeLegsMummy", OverridePriority: 25.1, unlimited: true, debris: "Fabric", inaccessible: true, Type: "CompleteLegs", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender],
		remove: ["ClothLower", "Skirts"], Asset: "VinylTape", Color: "#AA2222", Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 2, weight: 0,
		escapeChance: {"Struggle": 0.0, "Cut": 0.2, "Remove": -.1}, failSuffix: {"Remove": "Tape"},
		Model: "TapeHeavyBottomFull",
		maxwill: 0.3,
		disassembleAs: "VinylTapeRaw",
		disassembleCount: 2,
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		enemyTags: {"vinylTapeMummy":1}, playerTags: {"ItemLegsFull":3}, minLevel: 0, allFloors: true, shrine: ["VinylTape", "Hobbleskirts", "Wrapping", "Latex"]},
	{removePrison: true, name: "VinylTapeFeetMummy", unlimited: true, debris: "Fabric", inaccessible: true, Type: "CompleteFeet", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Asset: "VinylTape", Color: "#AA2222", Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 2, weight: 0,
		escapeChance: {"Struggle": 0.0, "Cut": 0.2, "Remove": -.1}, failSuffix: {"Remove": "Tape"},
		Model: "TapeHeavyAnkles",
		maxwill: 0.1,
		disassembleAs: "VinylTapeRaw",
		disassembleCount: 2,
		Filters: {
			Tape: {"gamma":0.21666666666666667,"saturation":1,"contrast":1.0166666666666666,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Tape: {color: "Highlight", override: false},
		},
		enemyTags: {"vinylTapeMummy":1}, playerTags: {"ItemFeetFull":3}, minLevel: 0, allFloors: true, shrine: ["VinylTape", "Wrapping", "Latex"]},


	//endregion



	{forceRemovePrison: true, name: "ShadowHandMouth", unlimited: true, alwaysAccessible: true, tether: 1.5, Asset: "DuctTape", Type: "Double", Color: ["#3c115c"], Group: "ItemMouth", AssetGroup: "ItemMouth3", gag: 0.5,
		Model: "ShadowHandsMouth",
		power: 4, weight: 0, escapeChance: {"Struggle": 0.5, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":10, "shadowBolt": 10}, playerTags: {"ItemMouth1Full":-9}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Wrapping", "Shadow", "Illusion"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},{trigger: "beforeStruggleCalc", type: "shadowBuff", inheritLinked: true}]},

	{forceRemovePrison: true, name: "ShadowHandEyes", unlimited: true, alwaysAccessible: true, tether: 1.5, Asset: "DuctTape", Color: ["#3c115c"], Group: "ItemHead", blindfold: 3,
		Model: "ShadowHandsEyes",
		power: 4, weight: 0, escapeChance: {"Struggle": 0.5, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":10, "shadowBolt": 10}, playerTags: {"ItemEyesFull":-9, NoBlindfolds: -1000}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Wrapping", "Shadow", "Illusion"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},{trigger: "beforeStruggleCalc", type: "shadowBuff", inheritLinked: true}]},

	{forceRemovePrison: true, name: "ShadowHandArms", alwaysAccessible: true, unlimited: true, LinkableBy: ["Shadow"], accessible: true, tether: 1.5, Asset: "DuctTape", Color: ["#3c115c"], Group: "ItemArms", bindarms: true,
		Model: "ShadowHandsArms2",
		addTag: ["HandsBehind"],
		maxwill: 0.9,
		power: 4, weight: 0, escapeChance: {"Struggle": 0.35, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":10, "shadowBolt": 6}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Tape", "Shadow", "Illusion"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},{trigger: "beforeStruggleCalc", type: "shadowBuff", inheritLinked: true}]},

	{forceRemovePrison: true, name: "ShadowHandArmsHeavy", alwaysAccessible: true, unlimited: true, accessible: true, tether: 1.5, Asset: "DuctTape", Type: "Top", Color: ["#3c115c"], Group: "ItemArms", bindarms: true, bindhands: 0.5,
		Model: "ShadowHandsArmsAll",
		maxwill: 0.5,
		addTag: ["HandsBehind"],
		power: 5, weight: -9, escapeChance: {"Struggle": 0.1, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":1, "shadowBolt": 1}, playerTags: {"ItemArmsFull":9}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Wrapping", "Shadow", "Illusion"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},{trigger: "beforeStruggleCalc", type: "shadowBuff", inheritLinked: true}]},

	{forceRemovePrison: true, name: "ShadowHandLegs", alwaysAccessible: true, unlimited: true, LinkableBy: ["Shadow"], accessible: true, tether: 1.5, Asset: "DuctTape", Color: ["#3c115c"], Group: "ItemLegs", hobble: 1,
		Model: "ShadowHandsLegs2",
		addTag: ["FeetLinked"],
		power: 4, weight: 0, escapeChance: {"Struggle": 0.5, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":10, "shadowBolt": 1}, playerTags: {"ItemArmsEmpty": -1}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Tape", "Shadow", "Illusion"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},{trigger: "beforeStruggleCalc", type: "shadowBuff", inheritLinked: true}]},
	{forceRemovePrison: true, name: "ShadowHandLegsHeavy", alwaysAccessible: true, unlimited: true, tether: 1.5, Asset: "DuctTape", Color: ["#3c115c"], Group: "ItemLegs", Type: "MostLegs", hobble: 1, addTag: ["FeetLinked"],
		Model: "ShadowHandsLegsAll",
		blockfeet: true, maxwill: 0.5,
		power: 5, weight: -5, escapeChance: {"Struggle": 0.1, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":1, "shadowBolt": 1}, playerTags: {"ItemLegsFull": 5, "ItemFeetFull": 3}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Wrapping", "Shadow", "Illusion"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},{trigger: "beforeStruggleCalc", type: "shadowBuff", inheritLinked: true}]},


	{forceRemovePrison: true, name: "ShadowHandCrotch", unlimited: true, alwaysAccessible: true, accessible: true, tether: 1.5, Asset: "Ribbons", Color: ["#3c115c"], Group: "ItemPelvis", crotchrope: true, strictness: 0.15,
		Model: "ShadowHandsCrotch",
		power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":10, "shadowBolt": 2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Wrapping", "Shadow", "Illusion"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},{trigger: "beforeStruggleCalc", type: "shadowBuff", inheritLinked: true}]},

	{forceRemovePrison: true, name: "ShadowHandFeet", unlimited: true, alwaysAccessible: true, accessible: true, tether: 1.5, Asset: "DuctTape", Color: ["#3c115c"], Group: "ItemFeet", blockfeet: true,
		maxwill: 0.4,
		addTag: ["FeetLinked"],
		Model: "ShadowHandsFeet",
		power: 4, weight: 0, escapeChance: {"Struggle": 0.4, "Remove": -100}, failSuffix: {"Struggle": "ShadowHand", "Remove": "ShadowHand"},
		enemyTags: {"shadowHands":10, "shadowBolt": 2}, playerTags: {"ItemLegsEmpty": -2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Rope", "Leather", "Metal", "Wrapping", "Encase", "Shadow", "Illusion"],
		events: [{trigger: "tick", type: "ShadowHandTether", requiredTag: "shadowHandEnemy", chance: 1.0, dist: 1.5},{trigger: "beforeStruggleCalc", type: "shadowBuff", inheritLinked: true}]},

	//region Slime
	{inventory: true, name: "SlimeCollar", debris: "Slime", Asset: "LatexCollar2", factionColor: [[], [0]],
		Color: "Default", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],
		power: 9, weight: 4, DefaultLock: "Blue",
		Model: "ElfCollarRestraint",
		struggleBreak: true,
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		tightType: "Secure",
		maxwill: 0.25, enemyTags: {"livingCollar":10}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["Collars","Latex","Slime"],
		events: [{trigger: "tick", type: "livingRestraints", tags: ["slimeRestraints"], cloneTags: [], inheritLinked: true, frequencyMax: 60, frequencyMin: 10, frequencyStep: 0.8, count: 4}]
	},

	{removePrison: true, name: "SlimeBoots", unlimited: true, debris: "Slime", inaccessible: true, linkCategory: "SlimeBoots", linkSize: 0.6, Asset: "ToeTape", Type: "Full", Color: "#9B49BD", Group: "ItemBoots", blockfeet: true,power: 4, weight: 0,  escapeChance: {"Struggle": 0.3, "Cut": 0, "Remove": 0},
		LinkableBy: [...KDRubberLink, ], renderWhenLinked: [...KDRubberLink],
		events: [{trigger: "tick", type: "slimeSpread", power: 0.04, inheritLinked: true}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1, inheritLinked: true}], slimeLevel: 1,
		Model: "SlimeBoots",
		tightType: "Thick",
		addPoseIfTopLevel: ["ItemBootsRubberOver"],
		failSuffix: {"Remove": "Slime"},
		affinity: {Struggle: ["Edge"], Remove: ["Edge"],},
		factionColor: [[], [0]],
		disassembleAs: "SlimeRaw",
		maxwill: 0.1,
		enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 2, "slimeRestraintsRandomLight": 2}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["Latex", "Encase", "Slime"], addTag: ["slime", "FeetLinked"]},
	{removePrison: true, name: "SlimeFeet", unlimited: true, debris: "Slime", inaccessible: true, linkCategory: "SlimeFeet", linkSize: 0.6, Asset: "DuctTape", Type: "CompleteFeet", OverridePriority: 24, Color: "#9B49BD", Group: "ItemFeet", blockfeet: true,power: 4, weight: -100,  escapeChance: {"Struggle": 0.3, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.05, inheritLinked: true}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1, inheritLinked: true}], slimeLevel: 1,
		LinkableBy: [...KDRubberLink, ], renderWhenLinked: [...KDRubberLink],
		Model: "SlimeFeet",
		tightType: "Thick",
		addPoseIfTopLevel: ["ItemFeetRubberOver"],
		failSuffix: {"Remove": "Slime"},
		affinity: {Struggle: ["Edge"], Remove: ["Edge"],},
		factionColor: [[], [0]],
		disassembleAs: "SlimeRaw",
		maxwill: 0.4,
		enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 101, "slimeRestraintsRandomLight": 101}, playerTags: {"ItemBootsFull":15},
		minLevel: 0, allFloors: true, shrine: ["Latex", "Encase", "Slime"], addTag: ["slime", "FeetLinked"]},
	{removePrison: true, name: "SlimeLegs", unlimited: true, debris: "Slime", inaccessible: true, linkCategory: "SlimeLegs", linkSize: 0.6, remove: ["ClothLower", "Skirts", "Pants"],  Asset: "SeamlessHobbleSkirt", Color: "#9B49BD", Group: "ItemLegs", hobble: 1, power: 4, weight: -102,  escapeChance: {"Struggle": 0.22, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.07, inheritLinked: true}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1, inheritLinked: true}], slimeLevel: 1,
		LinkableBy: [...KDRubberLink, ], renderWhenLinked: [...KDRubberLink],
		Model: "SlimeLegs",
		tightType: "Thick",
		addPoseIfTopLevel: ["ItemLegsRubberOver"],
		failSuffix: {"Remove": "Slime"},
		affinity: {Struggle: ["Edge"], Remove: ["Edge"],},
		factionColor: [[], [0]],
		disassembleAs: "SlimeRaw",
		maxwill: 0.7,
		enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 103, "slimeRestraintsRandomLight": 103}, playerTags: {"ItemFeetFull":2, "ItemBootsFull":2},
		minLevel: 0, allFloors: true, shrine: ["Slime", "Latex", "Encase", "Hobbleskirts", ], addTag: ["slime", "FeetLinked"]},
	{removePrison: true, name: "SlimeArms", unlimited: true, debris: "Slime", inaccessible: true, linkCategory: "SlimeArms", linkSize: 0.6, remove: ["Bra", "Cloth", "Bras", "Tops"], Asset: "StraitLeotard", Modules: [0, 0, 0, 0], Color: ["#9B49BD", "#9B49BD", "#9B49BD"], Group: "ItemArms", bindarms: true, bindhands: 0.25, power: 6, weight: -102,  escapeChance: {"Struggle": 0.2, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.1, inheritLinked: true}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1}], slimeLevel: 1,
		LinkableBy: [...KDRubberLink, ], renderWhenLinked: [...KDRubberLink],
		Model: "SlimeArms",
		tightType: "Thick",
		addPoseIfTopLevel: ["ItemArmsRubberOver"],
		failSuffix: {"Remove": "Slime"},
		affinity: {Struggle: ["Edge"], Remove: ["Edge"],},
		factionColor: [[], [0, 1, 2]],
		disassembleAs: "SlimeRaw",
		enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 103}, playerTags: {"ItemFeetFull":2, "ItemBootsFull":2, "ItemLegsFull":2},
		minLevel: 0, allFloors: true, shrine: ["Slime", "Latex", "Encase", "HandsBehind"], addTag: ["slime"]},
	{removePrison: true, name: "SlimeHands", unlimited: true, debris: "Slime", inaccessible: true, linkCategory: "SlimeHands", linkSize: 0.6, Asset: "DuctTape", Color: "#9B49BD", Group: "ItemHands", bindhands: 0.5, power: 4.5, weight: -102,  escapeChance: {"Struggle": 0.4, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.05, inheritLinked: true}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1, inheritLinked: true}], slimeLevel: 1,
		LinkableBy: [...KDRubberLink, ], renderWhenLinked: [...KDRubberLink],
		Model: "SlimeHands",
		tightType: "Thick",
		failSuffix: {"Remove": "Slime"},
		addPoseIfTopLevel: ["ItemHandsRubberOver"],
		affinity: {Struggle: ["Edge"], Remove: ["Edge"],},
		factionColor: [[], [0]],
		disassembleAs: "SlimeRaw",
		enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 103, "slimeRestraintsRandomLight": 103}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHeadFull":1},
		minLevel: 0, allFloors: true, shrine: ["Slime", "Latex", "Encase",], addTag: ["slime"]},
	{removePrison: true, name: "SlimeMouth", unlimited: true, debris: "Slime", inaccessible: true, linkCategory: "SlimeMouth", linkSize: 0.6, Asset: "LatexBallMuzzleGag", Color: "#9B49BD", Group: "ItemMouth", AssetGroup: "ItemMouth3", gag: 0.75, power: 4, weight: -102,  escapeChance: {"Struggle": 0.22, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.05, inheritLinked: true}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1, inheritLinked: true}], slimeLevel: 1,
		LinkableBy: [...KDRubberLink, ], renderWhenLinked: [...KDRubberLink],
		Model: "SlimeMouth",
		tightType: "Thick",
		failSuffix: {"Remove": "Slime"},
		addPoseIfTopLevel: ["ItemSlimeRubberOver"],
		affinity: {Struggle: ["Edge"], Remove: ["Edge"],},
		factionColor: [[], [0, 1, 2]],
		disassembleAs: "SlimeRaw",
		enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 103}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHandsFull":1, "ItemArmsFull":1},
		minLevel: 0, allFloors: true, shrine: ["Slime", "Latex", "Encase", "Gags", "FlatGag"], addTag: ["slime"]},
	{removePrison: true, name: "SlimeHead", unlimited: true, debris: "Slime", inaccessible: true, linkCategory: "SlimeHead", linkSize: 0.6, Asset: "LeatherSlimMask", Color: "#9B49BD", Group: "ItemHead", gag: 0.5, blindfold: 4, power: 4, weight: -103,  escapeChance: {"Struggle": 0.22, "Cut": 0, "Remove": 0}, events: [{trigger: "tick", type: "slimeSpread", power: 0.05, inheritLinked: true}, {trigger: "remove", type: "slimeStop"}, {trigger: "beforeStruggleCalc", type: "boostWater", power: 0.1, inheritLinked: true}], slimeLevel: 1,
		LinkableBy: [...KDRubberLink, ], renderWhenLinked: [...KDRubberLink],
		Model: "SlimeHead",
		tightType: "Thick",
		failSuffix: {"Remove": "Slime"},
		addPoseIfTopLevel: ["ItemHeadRubberOver"],
		affinity: {Struggle: ["Edge"], Remove: ["Edge"],},
		factionColor: [[], [0]],
		disassembleAs: "SlimeRaw",
		enemyTags: {"slimeRestraints":100, "slimeRestraintsRandom": 100}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHandsFull":1, "ItemArmsFull":1, "ItemMouth3Full":1, "Unmasked": -1000},
		minLevel: 0, allFloors: true, shrine: ["Slime", "Latex", "Encase", "Block_ItemMouth"], addTag: ["slime"]},
	//endregion

	//region HardSlime
	{inventory: true, name: "HardSlimeCollar", debris: "Slime", Asset: "LatexCollar2", factionColor: [[], [0]], Color: "Default", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: 4, DefaultLock: "Blue",
		Model: "ElfCollarRestraint",
		struggleBreak: true,
		Filters: {
			Collar: {"gamma":1.05,"saturation":0.016666666666666666,"contrast":0.8,"brightness":1.5,"red":0.8999999999999999,"green":1.1833333333333333,"blue":1.75,"alpha":1},
		},
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		tightType: "Secure",
		maxwill: 0.25, enemyTags: {"livingCollar":10}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["Collars","Latex","Rubber"],
		events: [{trigger: "tick", type: "livingRestraints", tags: ["latexEncase"], kind: "Rubber", cloneTags: [], inheritLinked: true, frequencyMax: 60, frequencyMin: 10, frequencyStep: 0.8, count: 4}]
	},
	{inventory: true, unlimited: true, removePrison: true, name: "HardSlimeBoots", debris: "Slime", linkCategory: "SlimeBoots", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "ToeTape", Type: "Full", Color: "#9B49BD", Group: "ItemBoots", blockfeet: true, addTag: ["FeetLinked"],power: 5, weight: 0,
		escapeChance: {"Struggle": 0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		affinity: {Struggle: ["Sharp",], Remove: ["Hook"],},
		factionColor: [[], [0]],
		factionFilters: {
			Rubber: {color: "DarkNeutral", override: true},
		},
		disassembleAs: "HardSlimeRaw",
		maxwill: 0.1,
		Model: "RubberBoots",
		tightType: "Thick",
		addPoseIfTopLevel: ["ItemBootsRubberOver"],
		enemyTags: {"latexEncase":100, "latexEncaseRandom":103}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["Latex", "Encase", "SlimeHard", "Rubber"]},
	{inventory: true, unlimited: true, removePrison: true, name: "HardSlimeFeet", debris: "Slime", linkCategory: "SlimeFeet", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "DuctTape", Type: "CompleteFeet", OverridePriority: 24, Color: "#9B49BD", Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 6, weight: -100,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		affinity: {Struggle: ["Sharp",], Remove: ["Hook"],},
		factionColor: [[], [0]],
		Model: "RubberFeet",
		tightType: "Thick",
		factionFilters: {
			Rubber: {color: "DarkNeutral", override: true},
		},
		disassembleAs: "HardSlimeRaw",
		maxwill: 0.4,
		addPoseIfTopLevel: ["ItemFeetRubberOver"],
		enemyTags: {"latexEncase":100, "latexEncaseRandom":103}, playerTags: {"ItemBootsFull":15},
		minLevel: 0, allFloors: true, shrine: ["Latex", "Encase", "SlimeHard", "Rubber"]},
	{inventory: true, unlimited: true, removePrison: true, name: "HardSlimeLegs", debris: "Slime", linkCategory: "SlimeLegs", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink],
		inaccessible: true, remove: ["ClothLower", "Skirts"], Asset: "SeamlessHobbleSkirt", Color: "#9B49BD", Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 6, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		affinity: {Struggle: ["Sharp",], Remove: ["Hook"],},
		factionColor: [[], [0]],
		Model: "RubberLegs",
		tightType: "Thick",
		factionFilters: {
			Rubber: {color: "DarkNeutral", override: true},
		},
		disassembleAs: "HardSlimeRaw",
		maxwill: 0.7,
		addPoseIfTopLevel: ["ItemLegsRubberOver"],
		enemyTags: {"latexEncase":100, "latexEncaseRandom":103}, playerTags: {"ItemFeetFull":2, "ItemBootsFull":2},
		minLevel: 0, allFloors: true, shrine: ["Latex", "Hobbleskirts", "Encase", "SlimeHard", "Rubber"]},
	{inventory: true, unlimited: true, removePrison: true, name: "HardSlimeArms", debris: "Slime", linkCategory: "SlimeArms", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true,
		remove: ["Bra", "Cloth", "Tops"], Asset: "StraitLeotard", Modules: [0, 0, 0, 0], Color: ["#9B49BD", "#9B49BD", "#9B49BD"], Group: "ItemArms", bindarms: true, bindhands: 0.35, power: 8, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		affinity: {Struggle: ["Sharp",], Remove: ["Hook"],},
		factionColor: [[], [0, 1, 2]],
		Model: "RubberArms",
		tightType: "Thick",
		factionFilters: {
			Rubber: {color: "DarkNeutral", override: true},
		},
		disassembleAs: "HardSlimeRaw",
		addPoseIfTopLevel: ["ItemArmsRubberOver"],
		enemyTags: {"latexEncase":100, "latexEncaseRandom":103}, playerTags: {"ItemFeetFull":2, "ItemBootsFull":2, "ItemLegsFull":2},
		minLevel: 0, allFloors: true, shrine: ["Latex", "Encase", "SlimeHard", "Rubber", "Encase",]},
	{inventory: true, unlimited: true, removePrison: true, name: "HardSlimeHands", debris: "Slime", linkCategory: "SlimeHands", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "DuctTape", Color: "#9B49BD", Group: "ItemHands", bindhands: 0.65, power: 5, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		affinity: {Struggle: ["Sharp",], Remove: ["Hook"],},
		factionColor: [[], [0]],
		Model: "RubberHands",
		tightType: "Thick",
		factionFilters: {
			Rubber: {color: "DarkNeutral", override: true},
		},
		disassembleAs: "HardSlimeRaw",
		addPoseIfTopLevel: ["ItemHandsRubberOver"],
		enemyTags: {"latexEncase":100, "latexEncaseRandom":103}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHeadFull":1},
		minLevel: 0, allFloors: true, shrine: ["Latex", "Encase", "SlimeHard", "Rubber"]},
	{inventory: true, unlimited: true, removePrison: true, name: "HardSlimeMouth", debris: "Slime", linkCategory: "SlimeMouth", linkSize: 0.6, inaccessible: true, Asset: "KittyGag", LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], Color: ["#9B49BD", "#9B49BD", "#9B49BD"], Group: "ItemMouth", AssetGroup: "ItemMouth3", gag: 0.75, power: 6, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		affinity: {Struggle: ["Sharp",], Remove: ["Hook"],},
		factionColor: [[], [0, 1, 2]],
		Model: "RubberMouth",
		tightType: "Thick",
		factionFilters: {
			Rubber: {color: "DarkNeutral", override: true},
		},
		disassembleAs: "HardSlimeRaw",
		addPoseIfTopLevel: ["ItemMouthRubberOver"],
		enemyTags: {"latexEncase":100, "latexEncaseRandom":103}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHandsFull":1, "ItemArmsFull":1},
		minLevel: 0, allFloors: true, shrine: ["Latex", "Encase", "SlimeHard", "Rubber", "Gags", "FlatGag"]},
	{inventory: true, unlimited: true, removePrison: true, name: "HardSlimeHead", debris: "Slime", linkCategory: "SlimeHead", linkSize: 0.6, LinkableBy: [...KDRubberLink], renderWhenLinked: [...KDRubberLink], inaccessible: true, Asset: "LeatherSlimMask", Color: "#9B49BD", Group: "ItemHead", gag: 0.5, blindfold: 5, power: 6, weight: -102,
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0}, failSuffix: {"Remove": "SlimeHard"},
		affinity: {Struggle: ["Sharp",], Remove: ["Hook"],},
		factionColor: [[], [0]],
		Model: "RubberHead",
		tightType: "Thick",
		factionFilters: {
			Rubber: {color: "DarkNeutral", override: true},
		},
		disassembleAs: "HardSlimeRaw",
		addPoseIfTopLevel: ["ItemHeadRubberOver"],
		enemyTags: {"latexEncase":100, "latexEncaseRandom":103}, playerTags: {"ItemFeetFull":1, "ItemBootsFull":1, "ItemLegsFull":1, "ItemHandsFull":1, "ItemArmsFull":1, "ItemMouth3Full":1, "Unmasked": -1000},
		minLevel: 0, allFloors: true, shrine: ["Latex", "Encase", "Block_ItemMouth", "Encase", "SlimeHard", "Rubber"]},

	{inventory: true, name: "HardSlimeRaw",
		noRecycle: true,
		requireSingleTagToEquip: ["Impossible"],
		Asset: "", Color: "",
		Group: "ItemDevices", power: 1, weight: -1000,
		escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.05},
		enemyTags: {}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["Rubber", "Latex", "Raw"]},
	{inventory: true, name: "SlimeRaw",
		noRecycle: true,
		requireSingleTagToEquip: ["Impossible"],
		Asset: "", Color: "",
		Group: "ItemDevices", power: 1, weight: -1000,
		escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.05},
		enemyTags: {}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["Slime", "Latex", "Raw"]},



	//region Glue
	{removePrison: true, name: "GlueBoots", unlimited: true, debris: "Slime", linkCategory: "SlimeBoots", linkSize: 0.3, inaccessible: true, Asset: "ToeTape", Type: "Full", Color: "#e7cf1a", Group: "ItemBoots", blockfeet: true, addTag: ["FeetLinked"],power: 1, weight: 0,  escapeChance: {"Struggle": 0.3, "Cut": 0.0, "Remove": 0.05},
		Model: "SlimeBoots",
		tightType: "Thick",
		Filters: {
			Slime: {"gamma":1.45,"saturation":0.016666666666666666,"contrast":1.6833333333333333,"brightness":0.9166666666666666,"red":2.3666666666666667,"green":1.6166666666666665,"blue":0.8666666666666667,"alpha":1},
		},
		enemyTags: {"glueRestraints":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Glue", "Latex", "Slime"]},
	{removePrison: true, name: "GlueFeet", unlimited: true, debris: "Slime", linkCategory: "SlimeFeet", linkSize: 0.3, inaccessible: true, Asset: "DuctTape", Type: "CompleteFeet", OverridePriority: 24, Color: "#e7cf1a", Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 1, weight: -100,  escapeChance: {"Struggle": 0.25, "Cut": 0.0, "Remove": 0.05},
		Model: "SlimeFeet",
		tightType: "Thick",
		remove: ["Pants"], // They rip off b/c of glue :)
		Filters: {
			Slime: {"gamma":1.45,"saturation":0.016666666666666666,"contrast":1.6833333333333333,"brightness":0.9166666666666666,"red":2.3666666666666667,"green":1.6166666666666665,"blue":0.8666666666666667,"alpha":1},
		},
		enemyTags: {"glueRestraints":100}, playerTags: {"ItemBootsFull":15}, minLevel: 0, allFloors: true, shrine: ["Glue", "Latex", "Slime"]},
	{removePrison: true, name: "GlueLegs", unlimited: true, debris: "Slime", linkCategory: "SlimeLegs", linkSize: 0.3, inaccessible: true, remove: ["ClothLower", "Skirts", "Pants"], Asset: "SeamlessHobbleSkirt", Color: "#e7cf1a", Group: "ItemLegs", blockfeet: true, addTag: ["FeetLinked"],power: 1, weight: -102,  escapeChance: {"Struggle": 0.2, "Cut": 0.0, "Remove": 0.05},
		Model: "SlimeLegs",
		tightType: "Thick",
		Filters: {
			Slime: {"gamma":1.45,"saturation":0.016666666666666666,"contrast":1.6833333333333333,"brightness":0.9166666666666666,"red":2.3666666666666667,"green":1.6166666666666665,"blue":0.8666666666666667,"alpha":1},
		},
		enemyTags: {"glueRestraints":100}, playerTags: {"ItemBootsFull":2, "ItemFeetFull":2}, minLevel: 0, allFloors: true, shrine: ["Glue", "Latex", "Hobbleskirts", "Slime"]},
	//endregion


	//region CyberDoll
	{inventory: true, arousalMode: true, name: "CyberBelt", Asset: "FuturisticChastityBelt", Modules: [3, 1, 1, 1, 1], OverridePriority: 26,
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",
		Color: ['#222222', '#499ed6', '#555555', '#000000', '#555555', '#b927a8', '#3868E8', '#555555', '#222222'],
		// Body, Display, Panel, Lock, band, trim, band, underplug, plug, strap
		factionColor: [[0], [5], [1]],
		Group: "ItemPelvis", chastity: true, power: 20, weight: 0,
		DefaultLock: "Cyber3",
		tightType: "Secure",
		Security: {
			level_tech: 2,
		},
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
		],
		Model: "CyberBelt",
		factionFilters: {
			Lining: {color: "LightNeutral", override: true},
			Metal: {color: "DarkNeutral", override: true},
			Display: {color: "Highlight", override: false},
			Plug: {color: "Highlight", override: true},
		},
		maxwill: 0.4,
		LinkableBy: ["Wrapping"],
		escapeChance: {"Struggle": -1.3, "Cut": -0.8, "Remove": 1.0, "Pick": -0.35},
		enemyTags: {"cyberdollchastity" : 1000},
		playerTags: {"ItemVulvaEmpty" : -5, "ItemVulvaPiercingsEmpty" : -5},
		minLevel: 7, allFloors: true, shrine: ["Chastity", "Metal", "ChastityBelts", "Cyber", "CyberChastityL"]},
	{inventory: true, arousalMode: true, trappable: true, name: "CyberBra", Asset: "FuturisticBra2", OverridePriority: 26,
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",
		Color: ['#499ed6', '#555555', '#222222', '#ffffff', '#555555', '#000000', "#000000"], Group: "ItemBreast",
		factionColor: [[2, 5], [2], [0]],
		tightType: "Secure",
		chastitybra: true, power: 15, weight: 0,
		Model: "BraCyber",
		factionFilters: {
			Display: {color: "Highlight", override: false},
			Lining: {color: "LightNeutral", override: true},
			Metal: {color: "DarkNeutral", override: true},
		},
		Security: {
			level_tech: 2,
		},
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
		],
		DefaultLock: "Cyber3",
		maxwill: 0.6,
		escapeChance: {"Struggle": -1.1, "Cut": -0.8, "Remove": 1.0, "Pick": -0.35},
		enemyTags: {"cyberdollchastity" : 1000},
		playerTags: {"FreeBoob": -1000},
		minLevel: 4, allFloors: true, shrine: ["ChastityBras", "Chastity", "Metal", "Cyber", "CyberChastityU"]},


	{alwaysRender: true, inventory: true, name: "ControlHarness", debris: "Chains", accessible: true, Asset: "FuturisticHarness", LinkableBy: [...KDHarnessLink], strictness: 0.1,
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",
		Model: "FutureHarness",
		tightType: "Secure",
		harness: true,
		unlimited: true,
		factionFilters: {
			Display: {color: "Highlight", override: false},
			Straps: {color: "LightNeutral", override: true},
			Metal: {color: "DarkNeutral", override: true},
		},
		Color: ['#499ed6', '#555555', '#555555', '#000000'],
		factionColor: [[], [], [0]],
		restriction: 3,
		Group: "ItemTorso", power: 10, weight: 0,
		escapeChance: {"Struggle": -0.4, "Cut": -0.2, "Remove": 0.4, "Pick": 0.1},
		DefaultLock: "Cyber3",
		maxwill: 0.5,
		enemyTags: {"controlHarness" : 20, "roboPrisoner" : 10, "cyberdollrestraints" : 100},
		playerTags: {},
		minLevel: 7, allFloors: true, shrine: ["Metal", "Harnesses", "Cyber"],
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postApply", type: "ControlHarness", power: 1, inheritLinked: true},
			{trigger: "remotePunish", type: "RemoteControlHarness", kind: "RemoteLink", noLeash: false, enemyDialogue: "KDDialogueRemoteLinkTether", msg: "KDMsgRemoteLinkCHTether"},
		]},

	{inventory: true, name: "CyberLongMittens",
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",
		Model: "CyberLongMittens",
		tightType: "Secure",
		factionFilters: {
			Mitten: {color: "Catsuit", override: false},
			Straps: {color: "DarkNeutral", override: true},
			Cap: {color: "LightNeutral", override: false},
			Glow: {color: "Highlight", override: false},
			Display: {color: "Highlight", override: false},
			Lock: {color: "DarkNeutral", override: true},
			Cuff: {color: "DarkNeutral", override: true},
			UpperGlow: {color: "Highlight", override: false},
			UpperDisplay: {color: "Highlight", override: false},
			UpperLock: {color: "DarkNeutral", override: true},
			UpperCuff: {color: "DarkNeutral", override: true},
		},
		DefaultLock: "Cyber3",
		factionColor: [[], [], [0]],
		Asset: "LatexElbowGloves", Color: "#ff5277", LinkableBy: [...KDGlovesLink], renderWhenLinked: ["Mittens"], Group: "ItemHands",
		bindhands: 1.4, power: 10, weight: 0,
		escapeChance: {"Struggle": -0.4, "Cut": -0.2, "Remove": 0.04, "Pick": -0.25},
		limitChance: {"Struggle": 0.3, "Cut": 0.2,},
		struggleMaxSpeed: {Remove: 0.1},
		maxwill: 0.2, enemyTags: {"cyberdollrestraints": 6}, playerTags: {"ItemHandsFull":-2}, minLevel: 7, allFloors: true, shrine: ["CyberMittens","LongMittens","Mittens", "Metal", "Cyber"]},

	{inventory: true, name: "CyberMittens",
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",
		Model: "CyberMittens",
		tightType: "Secure",
		factionFilters: {
			Mitten: {color: "LightNeutral", override: true},
			Straps: {color: "DarkNeutral", override: true},
			Cap: {color: "LightNeutral", override: false},
			Glow: {color: "Highlight", override: false},
			Display: {color: "Highlight", override: false},
			Lock: {color: "DarkNeutral", override: true},
			Cuff: {color: "DarkNeutral", override: true},
		},
		DefaultLock: "Cyber2",
		factionColor: [[], [], [0]],
		Asset: "LatexElbowGloves", Color: "#ff5277", LinkableBy: [...KDGlovesLink], renderWhenLinked: ["Mittens"], Group: "ItemHands",
		bindhands: 1.0, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.25, "Cut": -0.15, "Remove": 0.15, "Pick": -0.1},
		maxwill: 0.4, enemyTags: {"cyberdollrestraints": 10}, playerTags: {"ItemHandsFull":-2}, minLevel: 0, allFloors: true, shrine: ["CyberMittens","Mittens", "Metal", "Cyber"]},

	{inventory: true, name: "TrackingCollar", debris: "Chains", accessible: true, Asset: "FuturisticCollar",
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",
		Model: "FutureCollar",
		tightType: "Secure",
		factionFilters: {
			Display: {color: "Highlight", override: false},
			Base: {color: "DarkNeutral", override: true},
			Rim: {color: "LightNeutral", override: true},
			Band: {color: "LightNeutral", override: true},
		},
		linkCategories: ["CyberCollar", "BasicCollar"], linkSizes: [0.7, 0.45],
		Color: ['#499ed6', '#555555', '#b927a8', '#000000'],
		factionColor: [[], [2], [0]],
		DefaultLock: "Cyber2",
		Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": 0.33, "Pick": -0.15},
		maxwill: 0.5,
		enemyTags: {"controlHarness":5, "roboPrisoner" : 100, "cyberdollrestraints" : 10},
		playerTags: {"ItemNeckEmpty":10},
		minLevel: 0, allFloors: true, shrine: ["Metal", "Collars", "Cyber"],
	},

	{inventory: true, name: "CyberLinkCollar", debris: "Chains", accessible: true, Asset: "FuturisticCollar",
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",
		Model: "CyberLinkCollar",
		tightType: "Secure",
		factionFilters: {
			Display: {color: "Highlight", override: false},
			Base: {color: "DarkNeutral", override: true},
			Rim: {color: "LightNeutral", override: true},
			Band: {color: "LightNeutral", override: true},
		},
		linkCategories: ["CyberCollar", "BasicCollar"], linkSizes: [0.7, 0.45],
		Color: ['#499ed6', '#555555', '#b927a8', '#000000'],
		factionColor: [[], [2], [0]],
		DefaultLock: "Cyber3",
		Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender], power: 20, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": 0.33, "Pick": -0.15},
		maxwill: 0.5,
		enemyTags: {},
		playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["Metal", "Collars", "Cyber", "CyberLink", "CyberLinkDirect"],
	},


	{
		inventory: true, name: "DollmakerVisor", accessible: true, Asset: "InteractiveVisor",
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",
		Model: "Goggles",
		curse: "DollLock",
		Color: ['#91023a'],
		Group: "ItemHead", LinkableBy: [...KDVisorLink],
		power: 40, weight: 0, escapeChance: {"Struggle": -0.6, "Cut": -1.0, "Remove": 0.5, "Pick": -0.5},
		maxwill: 0.1,
		enemyTags: {},
		playerTags: {},
		events: [
			/*{trigger: "tick", type: "DollmakerMask", inheritLinked: true},
			{trigger: "calcBlind", type: "DollmakerMask", inheritLinked: true},
			{trigger: "kill", type: "DollmakerMask", inheritLinked: true},
			{trigger: "draw", type: "DollmakerMask", inheritLinked: true},*/
			{trigger: "calcEscapeKillTarget", type: "DollmakerMask", inheritLinked: true},
			{trigger: "calcEscapeMethod", type: "DollmakerMask", inheritLinked: true},
		],
		minLevel: 0, allFloors: true, shrine: ["Visors", "Cyber"],
	},
	{
		inventory: true, name: "DollmakerMask", inaccessible: true,
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",
		Model: "FullVisorRim",
		curse: "DollLock",
		factionColor: [[2]], Color: ["#ff5277"], Group: "ItemHead", Asset: "DroneMask", LinkableBy: [...KDMaskLink],
		power: 39, weight: 0, escapeChance: {"Struggle": -0.6, "Cut": -1.0, "Remove": 0.5, "Pick": -0.5},
		maxwill: 0.1,
		enemyTags: {},
		playerTags: {},
		events: [
			/*{trigger: "tick", type: "DollmakerMask", inheritLinked: true},
			{trigger: "calcBlind", type: "DollmakerMask", inheritLinked: true},
			{trigger: "kill", type: "DollmakerMask", inheritLinked: true},
			{trigger: "draw", type: "DollmakerMask", inheritLinked: true},*/
			{trigger: "calcEscapeKillTarget", type: "DollmakerMask", inheritLinked: true},
			{trigger: "calcEscapeMethod", type: "DollmakerMask", inheritLinked: true},
		],
		minLevel: 0, allFloors: true, shrine: ["Masks", "Block_ItemMouth", "Cyber"],
	},

	{inventory: true, name: "CyberBallGag", debris: "Belts", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink],
		sfx: "HydraulicLock",
		sfxRemove: "SciFiPump",
		factionFilters: {
			Display: {color: "Highlight", override: false},
			Harness: {color: "DarkNeutral", override: true},
			Strap: {color: "LightNeutral", override: true},
			SideStrap: {color: "LightNeutral", override: true},
			HarnessMask: {color: "DarkNeutral", override: true},
			Mask: {color: "DarkNeutral", override: true},
			HarnessDisplay: {color: "Highlight", override: false},
			Ball: {color: "Highlight", override: false},
			HarnessRim: {color: "LightNeutral", override: true},
			Muzzle: {color: "LightNeutral", override: true},
		},
		Model: "AdvancedSciFiBallGag",
		Filters: {
			Ball: {"gamma":0.26666666666666666,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":0.2833333333333333,"green":0.8999999999999999,"blue":1.9166666666666667,"alpha":1},
			Display: {"gamma":0.26666666666666666,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":0.2833333333333333,"green":0.8999999999999999,"blue":1.9166666666666667,"alpha":1},
		},
		Asset: "FuturisticHarnessBallGag", strictness: 0.35, gag: 0.65,
		Color: ['#499ed6', '#b927a8', '#222222', '#FFFFFF', '#000000'], Group: "ItemMouth", power: 12, weight: 0,
		factionColor: [[2], [1], [0]],
		DefaultLock: "Cyber2",
		maxwill: 0.75, escapeChance: {"Struggle": -0.4, "Cut": -0.2, "Remove": 0.05, "Pick": -0.1},
		enemyTags: {"cyberdollrestraints" : 10, forceAntiMagic: -100},
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.35, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.25, requiredTag: "Blindfolds"},
		],
		playerTags: {}, minLevel: 0, allFloors: true, shrine: ["BallGags", "Gags", "Metal", "Cyber"]},
	{inventory: true, name: "CyberPlugGag", debris: "Belts", LinkableBy: [...KDPlugGagLink], renderWhenLinked: [...KDPlugGagLink],
		sfx: "HydraulicLock",
		sfxRemove: "SciFiPump",
		Model: "AdvancedSciFiPlugGag",
		DefaultLock: "Cyber2",
		factionFilters: {
			Display: {color: "Highlight", override: false},
			Harness: {color: "DarkNeutral", override: true},
			Strap: {color: "LightNeutral", override: true},
			SideStrap: {color: "LightNeutral", override: true},
			HarnessMask: {color: "DarkNeutral", override: true},
			Mask: {color: "DarkNeutral", override: true},
			HarnessDisplay: {color: "Highlight", override: false},
			HarnessRim: {color: "LightNeutral", override: true},
			Muzzle: {color: "LightNeutral", override: true},
		},
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.35, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.25, requiredTag: "Blindfolds"},
		],
		Filters: {
			HarnessDisplay: {"gamma":0.26666666666666666,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":0.2833333333333333,"green":0.8999999999999999,"blue":1.9166666666666667,"alpha":1},
			Display: {"gamma":0.26666666666666666,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":0.2833333333333333,"green":0.8999999999999999,"blue":1.9166666666666667,"alpha":1},
		},
		Asset: "FuturisticHarnessPanelGag", strictness: 0.35, gag: 1.0,
		Color: ['#499ed6', '#222222', '#555555', '#FFFFFF', '#000000'], Group: "ItemMouth", power: 15, weight: 0,
		factionColor: [[], [], [0]],
		maxwill: 0.75, escapeChance: {"Struggle": -0.4, "Cut": -0.2, "Remove": 0.05, "Pick": -0.1},
		enemyTags: {"cyberdollrestraints" : 10},
		playerTags: {}, minLevel: 15, allFloors: true, shrine: ["PlugGags", "Gags", "Cyber", "Metal", ]},

	{inventory: true, name: "CyberMuzzle", debris: "Belts", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink],
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",
		Model: "AdvancedSciFiMuzzle2",
		factionFilters: {
			Display: {color: "Highlight", override: false},
			Harness: {color: "DarkNeutral", override: true},
			Strap: {color: "LightNeutral", override: true},
			SideStrap: {color: "LightNeutral", override: true},
			HarnessMask: {color: "DarkNeutral", override: true},
			Mask: {color: "DarkNeutral", override: true},
			HarnessDisplay: {color: "Highlight", override: false},
			HarnessRim: {color: "LightNeutral", override: true},
			Muzzle: {color: "LightNeutral", override: true},
		},
		Filters: {
			HarnessDisplay: {"gamma":0.26666666666666666,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":0.2833333333333333,"green":0.8999999999999999,"blue":1.9166666666666667,"alpha":1},
			Display: {"gamma":0.26666666666666666,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":0.2833333333333333,"green":0.8999999999999999,"blue":1.9166666666666667,"alpha":1},
		},
		DefaultLock: "Cyber",
		inaccessible: true,
		Asset: "FuturisticMuzzle", strictness: 0.35, gag: 0.5,
		Color: ['#499ed6', '#222222', '#555555', '#FFFFFF', '#000000'], Group: "ItemMouth", power: 12, weight: 0,
		factionColor: [[], [], [0]],
		maxwill: 0.25, escapeChance: {"Struggle": -0.25, "Cut": -0.8, "Remove": 0.05, "Pick": -0.25},
		enemyTags: {"cyberdollheavy": 1}, events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
		],
		playerTags: {}, minLevel: 9, allFloors: true, shrine: ["FlatGags", "Gags", "Cyber", "Metal", "ControlHMouth"]},

	{inventory: true,  name: "CyberDollJacket", inaccessible: true, remove: ["Bra", "Tops"], Asset: "FuturisticStraitjacket",
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",

		DefaultLock: "Cyber",
		LinkableBy: [...KDJacketLink],
		renderWhenLinked: [...KDJacketRender],
		Model: "JacketBolero",
		Filters: {
			Display: {"gamma":0.26666666666666666,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":0.2833333333333333,"green":0.8999999999999999,"blue":1.9166666666666667,"alpha":1},
			"BeltsLower":{"gamma":1,"saturation":0,"contrast":1.2,"brightness":1.6166666666666665,"red":1.9333333333333333,"green":1,"blue":2.183333333333333,"alpha":1},
			"BeltsChest":{"gamma":1,"saturation":0,"contrast":1.2,"brightness":1.6166666666666665,"red":1.9333333333333333,"green":1,"blue":2.183333333333333,"alpha":1},
			"BeltsArms":{"gamma":1,"saturation":0,"contrast":1.2,"brightness":1.6166666666666665,"red":1.9333333333333333,"green":1,"blue":2.183333333333333,"alpha":1},
			"Arms":{"gamma":1,"saturation":1,"contrast":1.3666666666666667,"brightness":0.8500000000000001,"red":1,"green":1,"blue":1,"alpha":1},
			"Chest":{"gamma":1,"saturation":1,"contrast":1.3666666666666667,"brightness":0.8500000000000001,"red":1,"green":1,"blue":1,"alpha":1},
			"Lower":{"gamma":1,"saturation":1,"contrast":1.3666666666666667,"brightness":0.8500000000000001,"red":1,"green":1,"blue":1,"alpha":1}
		},

		factionFilters: {
			BeltsLower: {color: "LightNeutral", override: false},
			BeltsArms: {color: "LightNeutral", override: false},
			BeltsChest: {color: "LightNeutral", override: false},
			Arms: {color: "DarkNeutral", override: false},
			Chest: {color: "DarkNeutral", override: false},
			Lower: {color: "DarkNeutral", override: false},
		},
		Modules: [1, 1, 1, 1],
		factionColor: [[0], [1], [3]],
		Color: ["#222222", "#b927a8", "#000000", "#499ed6", "#222222", "#000000"],
		Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 15, weight: 0, strictness: 0.2,
		escapeChance: {"Struggle": -0.2, "Cut": -.3, "Remove": -0.3, "Pick": -0.1},
		limitChance: {"Struggle": 0.3, "Cut": 0.3, "Remove": 0.1, "Unlock": 0.75}, // Hard to escape the arms box by struggling
		maxwill: 0.1,
		enemyTags: {"cyberdollheavy": 1}, events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
		],
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Cyber", "Metal", "Latex", "Straitjackets", "Block_ItemHands"]},

	{inventory: true, name: "CyberHeels", inaccessible: true, Asset: "FuturisticHeels2", remove: ["Shoes"],
		sfx: "FutureLock",
		sfxRemove: "SciFiConfigure",
		Model: "CyberBalletHeels",
		factionFilters: {
			Glow: {color: "Highlight", override: true},
			Shoe: {color: "LightNeutral", override: true},
		},
		Filters: {
			Glow: {"gamma":0.26666666666666666,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":0.2833333333333333,"green":0.8999999999999999,"blue":1.9166666666666667,"alpha":1},
		},
		DefaultLock: "Cyber",
		factionColor: [[0], [4], [1]],
		Color: ["#222222", "#499ed6", "#ffffff", "Default", "#b927a8", "#222222", "#000000"],
		Group: "ItemBoots", heelpower: 2, power: 10, weight: 0,
		escapeChance: {"Struggle": -0.4, "Cut": -0.35, "Remove": 0.2, "Pick": -0.25},
		maxwill: 0.25, enemyTags: {"cyberdollrestraints" : 10},
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
		],
		playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Cyber", "Heels", "Metal", "Boots"]},


	{inventory: true, name: "CyberAnkleCuffs", debris: "Chains", accessible: true, Asset: "FuturisticAnkleCuffs", LinkableBy: [...KDBindable, ...KDDevices],
		sfx: "HydraulicLock",
		sfxRemove: "HydraulicUnlock",
		Model: "CyberCuffsAnkles",
		factionFilters: {
			Display: {color: "Highlight", override: false},
			Screen: {color: "LightNeutral", override: true},
			BaseMetal: {color: "DarkNeutral", override: true},
			Lock: {color: "DarkNeutral", override: true},
		},
		alwaysRender: true,
		struggleBreak: true,
		DefaultLock: "Cyber2",
		linkCategory: "AnkleCuffs", linkSize: 0.4, noDupe: true,
		Color: ["#499ed6", "#499ed6", "#b927a8", "#000000"],
		factionColor: [[], [2], [0,1]],
		Group: "ItemFeet", power: 12, weight: 0,
		escapeChance: {"Struggle": -0.8, "Cut": -0.65, "Remove": 0.6, "Pick": -0.15},
		enemyTags: {"cyberdollcuffs":6, "cyberdollrestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 4, allFloors: true, shrine: ["Cyber", "CyberCuffs", "Cuffs", "Metal",  "AnkleCuffsBase", "HogtieLower", "CyberAnkleCuffs"],
	},
	{inventory: true, name: "CyberLegCuffs", debris: "Chains", accessible: true, Asset: "FuturisticLegCuffs", LinkableBy: [...KDBindable, ...KDDevices],
		sfx: "HydraulicLock",
		sfxRemove: "HydraulicUnlock",
		Model: "CyberCuffsThigh",
		factionFilters: {
			Display: {color: "Highlight", override: false},
			Screen: {color: "LightNeutral", override: true},
			BaseMetal: {color: "DarkNeutral", override: true},
			Lock: {color: "DarkNeutral", override: true},
		},
		alwaysRender: true,
		DefaultLock: "Cyber2",
		Color: ["#499ed6", "#499ed6", "#b927a8", "#000000"],
		struggleBreak: true,
		factionColor: [[], [2], [0,1]],
		Group: "ItemLegs", power: 12, weight: 0,
		escapeChance: {"Struggle": -0.8, "Cut": -0.65, "Remove": 0.6, "Pick": -0.15},
		enemyTags: {"cyberdollcuffs":6, "cyberdollrestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 4, allFloors: true, shrine: ["Cyber", "CyberCuffs", "Metal", "Cuffs", "LegCuffsBase", "CyberLegCuffs"],
	},
	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "CyberArmCuffs", debris: "Chains", accessible: true,
		sfx: "HydraulicLock",
		sfxRemove: "HydraulicUnlock",
		Model: "CyberCuffsArms",
		factionFilters: {
			Display: {color: "Highlight", override: false},
			Screen: {color: "LightNeutral", override: true},
			BaseMetal: {color: "DarkNeutral", override: true},
			Lock: {color: "DarkNeutral", override: true},
		},
		alwaysRender: true,
		struggleBreak: true,
		DefaultLock: "Cyber2",
		Asset: "FuturisticCuffs", linkCategory: "Cuffs", linkSize: 0.55, LinkableBy: [...KDDevices, ...KDBindable],
		Color: ["#499ed6", "#b927a8", "#000000"],
		factionColor: [[], [1], [0]],
		unlimited: true,
		Group: "ItemArms", bindarms: false, power: 12, weight: 0,
		escapeChance: {"Struggle": -0.8, "Cut": -0.65, "Remove": 0.25, "Pick": -0.15},
		enemyTags: {"cyberdollcuffs":20, "cyberdollrestraints":6}, playerTags: {"ItemArmsFull":-2},
		minLevel: 4, allFloors: true, shrine: ["Cyber", "CyberCuffs", "Cuffs", "Metal",  "ArmCuffsBase", "CyberWristCuffs"],
		maxwill: 0.8
	},
	//endregion

	//region Latex
	{inventory: true, name: "LatexStraitjacket", inaccessible: true, factionColor: [[0, 1, 2]], remove: ["Bra", "Tops"], Asset: "StraitLeotard", Modules: [1, 1, 1, 1], Color: ["#499ed6", "#499ed6", "#499ed6"],
		Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 7, weight: 0, strictness: 0.2,
		LinkableBy: [...KDJacketLink],
		renderWhenLinked: [...KDJacketRender],
		Model: "Jacket",
		Filters: {
			BeltsChest: {"gamma":1,"saturation":0.08333333333333333,"contrast":1.3166666666666664,"brightness":2.8666666666666667,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":0.08333333333333333,"contrast":1.3166666666666664,"brightness":2.8666666666666667,"red":1,"green":1,"blue":1,"alpha":1},
			Chest: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":0.7833333333333334,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
			Arms: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":0.7833333333333334,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
			LatexLower: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":2.2666666666666666,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
			LatexUpper: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":2.2666666666666666,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		factionFilters: {
			Chest: {color: "DarkNeutral", override: true},
			Arms: {color: "DarkNeutral", override: true},
			LatexLower: {color: "DarkNeutral", override: false},
			LatexUpper: {color: "DarkNeutral", override: false},
		},
		escapeChance: {"Struggle": 0.1, "Cut": 0.15, "Remove": 0.1, "Pick": 0.35},
		limitChance: {"Struggle": 0.25, "Cut": 0.14, "Remove": 0.08, "Unlock": 0.75},
		maxwill: 0.25, enemyTags: {"latexRestraintsHeavy" : 3, "latexjacketSpell": 10, "jailRestraints": 1}, playerTags: {"posLatex": -1, "latexRage": 4}, minLevel: 0, allFloors: true, shrine: ["Latex", "Straitjackets", "Block_ItemHands"]},

	{inventory: true, name: "LatexTransportJacket", inaccessible: true, factionColor: [[0, 1, 2]], remove: ["Bra", "Tops"], Asset: "StraitLeotard", Modules: [1, 1, 1, 1], Color: ["#499ed6", "#499ed6", "#499ed6"],
		Group: "ItemArms", bindarms: true, bindhands: 1.33, power: 10, weight: 0, strictness: 0.3,
		LinkableBy: [...KDTransportLink],
		renderWhenLinked: [...KDJacketRender],
		Model: "JacketHeavy",
		Filters: {
			BeltsChest: {"gamma":1,"saturation":0.08333333333333333,"contrast":1.3166666666666664,"brightness":2.8666666666666667,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":0.08333333333333333,"contrast":1.3166666666666664,"brightness":2.8666666666666667,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsLower: {"gamma":1,"saturation":0.08333333333333333,"contrast":1.3166666666666664,"brightness":2.8666666666666667,"red":1,"green":1,"blue":1,"alpha":1},
			Chest: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":0.7833333333333334,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
			Arms: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":0.7833333333333334,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
			Lower: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":0.7833333333333334,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
			LatexLower: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":2.2666666666666666,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
			LatexUpper: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":2.2666666666666666,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		factionFilters: {
			Chest: {color: "DarkNeutral", override: true},
			Arms: {color: "DarkNeutral", override: true},
			LatexLower: {color: "DarkNeutral", override: false},
			LatexUpper: {color: "DarkNeutral", override: false},
		},
		escapeChance: {"Struggle": -0.275, "Cut": 0.1, "Remove": 0.1, "Pick": 0.15},
		limitChance: {"Struggle": 0.12, "Cut": 0.16, "Remove": 0.15, "Unlock": 0.75},
		maxwill: 0.1, enemyTags: {"latexRestraintsHeavy" : -1}, playerTags: {"LatexStraitjacketWorn": 20, "posLatex": -1, "latexRage": 4}, minLevel: 12, allFloors: true, shrine: ["Latex", "Straitjackets", "TransportJackets","Block_ItemHands"]},


	{inventory: true, name: "LatexArmbinder", inaccessible: true, factionColor: [[0]], Asset: "SeamlessLatexArmbinder", strictness: 0.1,
		LinkableBy: [...KDArmbinderLink], Color: ["#499ed6"], Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 7, weight: 0,
		renderWhenLinked: [...KDArmbinderLink],
		Model: "SmoothArmbinderGwen",
		Filters: {
			Straps: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1.5333333333333332,"blue":4.116666666666667,"alpha":1},
			BinderStraps: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1.5333333333333332,"blue":4.116666666666667,"alpha":1},
			Binder: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":2.4166666666666665,"blue":4.116666666666667,"alpha":1},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Armbinders": 3.5,
			"Less_Armbinders": 0.1,
		},
		factionFilters: {
			Binder: {color: "DarkNeutral", override: true},
		},
		escapeChance: {"Struggle": 0.15, "Cut": 0.15, "Remove": 0.1, "Pick": 0.35},
		limitChance: {"Struggle": 0.2, "Cut": 0.14, "Remove": 0.45, "Unlock": 0.2},
		maxwill: 0.35, enemyTags: {"latexRestraints" : 5, "latexarmbinderSpell": 100, "latexRestraintsForced" : 15, "jailRestraints": 5}, playerTags: {"posLatex": -1, "latexAnger": 1, "latexRage": 1},
		minLevel: 0, allFloors: true, shrine: ["Latex", "Armbinders", "Block_ItemHands"]},
	{inventory: true, name: "LatexBoxbinder", debris: "Belts", inaccessible: true, Asset: "BoxTieArmbinder", strictness: 0.08,
		Model: "SmoothArmbinderGwen",
		Filters: {
			Straps: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1.5333333333333332,"blue":4.116666666666667,"alpha":1},
			BinderStraps: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1.5333333333333332,"blue":4.116666666666667,"alpha":1},
			Binder: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":2.4166666666666665,"blue":4.116666666666667,"alpha":1},
		},
		factionFilters: {
			Binder: {color: "DarkNeutral", override: true},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Boxbinders": 3.5,
			"Less_Boxbinders": 0.1,
		},
		LinkableBy: [...KDBoxbinderLink], Color: ["#499ed6", "#ffffff"], Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 7, weight: 0, factionColor: [[0]],
		escapeChance: {"Struggle": 0.1, "Cut": 0.13, "Remove": 0.2, "Pick": 0.25},
		limitChance: {"Struggle": 0.2, "Cut": 0.14, "Remove": 0.45, "Unlock": 0.2},
		maxwill: 0.35, enemyTags: {"latexRestraints" : 5, "latexarmbinderspell": 10, "latexRestraintsForced" : 15, "jailRestraints": 5}, playerTags: {"posLatex": -1, "latexAnger": 1, "latexRage": 1},
		minLevel: 0, allFloors: true, shrine: ["Latex", "Boxbinders", "Block_ItemHands"]},
	{renderWhenLinked: [...KDLegbinderRender], inventory: true, name: "LatexLegbinder", inaccessible: true, factionColor: [[0]], Asset: "SeamlessLegBinder", LinkableBy: [...KDLegbinderLink], Color: ["#499ed6"], Group: "ItemLegs", hobble: 1, blockfeet: true, addTag: ["FeetLinked"], power: 7, weight: 0,  escapeChance: {"Struggle": -0.05, "Cut": 0.15, "Remove": 0.1, "Pick": 0.35},
		Model: "Legbinder",
		Filters: {
			Binder: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1.6833333333333333,"blue":3.1,"alpha":1},
		},
		factionFilters: {
			Binder: {color: "DarkNeutral", override: true},
		},
		struggleMult: {Struggle: 0.4},
		affinity: {Remove: ["Hook"], Struggle: ["Hook"],},
		maxwill: 0.25, enemyTags: {"latexRestraintsHeavy" : 6, "latexlegbinderSpell": 10, "jailRestraints": 1, "latexStart": 10}, playerTags: {"posLatex": -1, "latexAnger": 1, "latexRage": 2}, minLevel: 0, allFloors: true, shrine: ["Latex", "Legbinders"]},
	{inventory: true, name: "LatexBoots", inaccessible: true, factionColor: [[0]], Asset: "HighThighBoots", Color: ["#3873C3"], Group: "ItemBoots", power: 6, weight: 0, escapeChance: {"Struggle": -0.15, "Cut": 0.12, "Remove": 0.07, "Pick": 0.25},
		Model: "TallHeelsRestraint",
		Filters: {
			Shoe: {"gamma":0.75,"saturation":1,"contrast":0.7333333333333334,"brightness":0.6166666666666667,"red":1,"green":2.0833333333333335,"blue":2.8499999999999996,"alpha":1},
		},
		factionFilters: {
			Shoe: {color: "DarkNeutral", override: false},
		},
		heelpower: 0.5,
		enemyTags: {"latexRestraints" : 8, "latexBoots" : 3, "jailRestraints": 1, "latexheelSpell": 10, "latexUniform": 12}, playerTags: {"posLatex": -1, "latexAnger": 2, "latexRage": 2}, minLevel: 0, allFloors: true, shrine: ["Heels", "Latex", "Boots"]},
	{alwaysRender: true, inventory: true, name: "LatexCorset", linkCategory: "Corset", linkSize: 0.55, inaccessible: true, deepAccessible: true, factionColor: [[0]],
		OverridePriority: 25.9, Asset: "HeavyLatexCorset", LinkableBy: KDCorsetLink, strictness: 0.1, Color: ["#5196EF"], Group: "ItemTorso", power: 8, weight: 0,
		Model: "LatexCorsetCrossRestraint",
		factionFilters: {
			Corset: {color: "Catsuit", override: false},
		},
		Filters: {"HeavyCorset":{"gamma":1,"saturation":1,"contrast":1,"brightness":1.35,"red":1,"green":1,"blue":1,"alpha":1},"Corset":{"gamma":1.3,"saturation":0.9333333333333333,"contrast":1.2166666666666668,"brightness":2.2333333333333334,"red":1,"green":1,"blue":1,"alpha":1}},
		restriction: 10,
		escapeChance: {"Struggle": -0.1, "Cut": 0.2, "Remove": 0.15, "Pick": 0.3},
		limitChance: {"Struggle": 0.1, "Cut": 0.04, "Remove": 0.0, "Pick": 0.0},
		struggleMinSpeed: {"Remove": 0.05}, struggleMaxSpeed: {"Remove": 0.1},
		affinity: {Remove: ["Hook"], Struggle: ["Hook"],},
		failSuffix: {"Remove": "Corset"},
		enemyTags: {"latexRestraints" : 7, "latexcorsetSpell": 10, "jailRestraints": 1, "latexUniform": 12},
		playerTags: {"ItemTorsoFull": -5, "posLatex": -1, "latexAnger": 2, "latexRage": 2},
		minLevel: 0, allFloors: true, shrine: ["Corsets", "Latex", "HeavyCorsets"]},

	{inventory: true, name: "LatexBallGag", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink], factionColor: [[], [0]], Asset: "BallGag", gag: 0.75, Color: ["#4EA1FF", "Default"], Type: "Tight", Group: "ItemMouth", power: 7, weight: 0, escapeChance: {"Struggle": -0.05, "Cut": 0.04, "Remove": 0.4, "Pick": 0.25},
		Model: "SmoothBallGag",
		quickBindCondition: "BallGag", quickBindMult: 0.5,
		Filters: {
			Ball: {"gamma":1,"saturation":0.16666666666666666,"contrast":1.25,"brightness":1.8166666666666667,"red":0.3166666666666667,"green":1.3333333333333333,"blue":2.8499999999999996,"alpha":1},
		},
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		factionFilters: {
			Straps: {color: "LightNeutral", override: true},
			Ball: {color: "Highlight", override: false},
		},
		events: [{trigger: "postRemoval", type: "replaceItem", requireFlag: "Struggle", list: ["GagNecklace"], keepLock: true, power: 1, msg: "KDGagNecklaceOn"}],
		maxwill: 0.8, enemyTags: {"latexRestraints" : 3, "latexGag" : 10, "latexgagSpell": 10, "jailRestraints": 1, forceAntiMagic: -100}, playerTags: {"posLatex": -1, "latexAnger": 2, "latexRage": 2}, minLevel: 0, maxLevel: 5, allFloors: true, shrine: ["BallGags", "Latex" , "Gags"]},
	{inventory: true, name: "LatexBallGagLarge", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink], factionColor: [[], [0]], Asset: "BallGag", gag: 0.75, Color: ["#4EA1FF", "Default"], Type: "Tight", Group: "ItemMouth", power: 7, weight: 0, escapeChance: {"Struggle": -0.05, "Cut": 0.04, "Remove": 0.4, "Pick": 0.25},
		Model: "SmoothLargeBallGag",
		quickBindCondition: "BallGag", quickBindMult: 0.5,
		events: [{trigger: "postRemoval", type: "replaceItem", requireFlag: "Struggle", list: ["GagNecklace"], keepLock: true, power: 1, msg: "KDGagNecklaceOn"}],
		Filters: {
			Ball: {"gamma":1,"saturation":0.16666666666666666,"contrast":1.25,"brightness":1.8166666666666667,"red":0.3166666666666667,"green":1.3333333333333333,"blue":2.8499999999999996,"alpha":1},
		},
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		factionFilters: {
			Straps: {color: "LightNeutral", override: true},
			Ball: {color: "Highlight", override: false},
		},
		maxwill: 0.8, enemyTags: {"latexRestraints" : 5, "latexRestraintsHeavy" : 5, "latexgagSpell": 10, forceAntiMagic: -100, "latexGag" : 10, "jailRestraints": 3}, ignoreMinLevelTags: ["latexRestraintsHeavy"], playerTags: {"posLatex": -1, "latexAnger": 2, "latexRage": 4}, minLevel: 4, allFloors: true, shrine: ["BallGags", "Latex" , "Gags"]},


	{inventory: true, name: "LatexOTNGag", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], factionColor: [[0], [0], [0]], Asset: "KittyGag", gag: 0.5, Color: ["#4EA1FF", "#4EA1FF", "#4EA1FF"], Group: "ItemMouth", AssetGroup: "ItemMouth3", power: 4, weight: -6, escapeChance: {"Struggle": 0.05, "Cut": 0.18, "Remove": 0.1},
		Model: "GagLatex",
		Filters: {
			Latex: {"gamma":1,"saturation":0.16666666666666666,"contrast":1.25,"brightness":1.8166666666666667,"red":0.3166666666666667,"green":0.48333333333333334,"blue":2.8499999999999996,"alpha":1},
		},

		factionFilters: {
			Latex: {color: "Highlight", override: true},
		},
		maxwill: 0.5, enemyTags: {"latexRestraints":6, "latexgagSpell": 10}, playerTags: {"ItemMouthFull": 6}, minLevel: 0, allFloors: true, shrine: ["FlatGags", "Latex", "Gags"]},
	{inventory: true, name: "LatexOTNGagHeavy", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], factionColor: [[0], [0], [0]],
		Asset: "KittyGag", gag: 0.5, Color: ["#4EA1FF", "#4EA1FF", "#4EA1FF"], Group: "ItemMouth", AssetGroup: "ItemMouth3", power: 6, weight: -6,
		escapeChance: {"Struggle": -0.1, "Cut": 0.04, "Remove": 0.1, Pick: 0.0},
		Model: "ShinyLatexMuzzle", //Model: "GagLatexMute",
		Filters: {
			Gag: {"gamma":1,"saturation":1,"contrast":1.4166666666666665,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Rim: {"gamma":1,"saturation":0.16666666666666666,"contrast":1.25,"brightness":1.8166666666666667,"red":0.3166666666666667,"green":0.48333333333333334,"blue":2.8499999999999996,"alpha":1},
		},
		factionFilters: {
			Gag: {color: "LightNeutral", override: false},
			Rim: {color: "Highlight", override: true},
		},
		maxwill: 0.5, enemyTags: {"latexRestraints":6, "latexgagSpell": 10}, playerTags: {"ItemMouthFull": 6}, minLevel: 0, allFloors: true, shrine: ["FlatGags", "Latex", "Gags"]},

	{inventory: true, unlimited: true, name: "LatexMittens",
		Model: "LatexMittens",
		Filters: {
			Mitten: {"gamma":1,"saturation":0.16666666666666666,"contrast":1.25,"brightness":1.8166666666666667,"red":0.3166666666666667,"green":0.48333333333333334,"blue":2.8499999999999996,"alpha":1},
		},
		factionFilters: {
			Mitten: {color: "DarkNeutral", override: true},
		},
		Asset: "LatexElbowGloves", Color: "#ff5277", LinkableBy: [...KDGlovesLink], renderWhenLinked: ["Mittens"], Group: "ItemHands",
		bindhands: 1.0, power: 7, weight: 0,
		escapeChance: {"Struggle": -0.05, "Cut": 0.09, "Remove": 0.4, "Pick": 0.25},
		maxwill: 0.4, enemyTags: {"latexRestraints":6,"mittensSpell": 10}, playerTags: {"ItemHandsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Mittens", "Latex"]},


	{renderWhenLinked: ["Corsets", "Harnesses", ...KDBindable, "Latex", "Leather", "Metal", "Rope"], inventory: true, name: "LatexCatsuit", inaccessible: true,
		factionColor: [[0]], Asset: "SeamlessCatsuit", AssetGroup: "Suit", Color: ["#3873C3"],
		alwaysAccessible: true,
		Model: "Catsuit",
		Filters: {
			TorsoLower: {"gamma":2.7666666666666666,"saturation":1.6833333333333333,"contrast":0.8,"brightness":1.5,"red":0.6333333333333334,"green":1.1833333333333333,"blue":2.033333333333333,"alpha":1},
			TorsoUpper: {"gamma":2.7666666666666666,"saturation":1.6833333333333333,"contrast":0.8,"brightness":1.5,"red":0.6333333333333334,"green":1.1833333333333333,"blue":2.033333333333333,"alpha":1},
		},
		factionFilters: {
			TorsoLower: {color: "Catsuit", override: true},
			TorsoUpper: {color: "Catsuit", override: true},
		},
		LinkAll: true, noDupe: true,
		linkCategory: "Catsuits", linkSize: 0.45,
		restriction: 1,
		Group: "ItemTorso", power: 6, weight: 0, escapeChance: {"Struggle": -0.8, "Cut": 0.1, "Remove": 0.05},
		enemyTags: {"latexRestraintsHeavy" : 6, "latexRestraints" : 2, "latexCatsuits": 12, "latexUniform": 12, "latexStart": 10, 'shopCatsuit': 10, "latexcatsuitSpell": 10}, playerTags: {"posLatex": -1, "latexAnger": 2, "latexRage": 2}, minLevel: 0, maxLevel: 10, allFloors: true, shrine: ["Catsuits", "Latex", "Suits"],
		alwaysDress: [
			{Item: "SeamlessCatsuit", Group: "Suit", Color: ['#3873C3'], override: true, factionColor: [[0]]},
			{Item: "SeamlessCatsuit", Group: "SuitLower", Color: ['#3873C3'], override: true, factionColor: [[0]]},
			{Item: "Catsuit", Group: "Gloves", Color: ['#3873C3'], override: true, factionColor: [[0]]}],
		events: [
			{trigger: "beforeStruggleCalc", type: "latexDebuff", power: 0.15, inheritLinked: true}
		]
	},


	{renderWhenLinked: ["Corsets", "Harnesses", ...KDBindable, "Latex", "Leather", "Metal", "Rope"], inventory: true, name: "HeavyLatexCatsuit", inaccessible: true,
		factionColor: [[0]], Asset: "SeamlessCatsuit", AssetGroup: "Suit", Color: ["#3873C3"],
		alwaysAccessible: true,
		Model: "Catsuit",
		Filters: {
			TorsoLower: {"gamma":2.7666666666666666,"saturation":1.6833333333333333,"contrast":0.8,"brightness":1.5,"red":0.6333333333333334,"green":1.1833333333333333,"blue":2.033333333333333,"alpha":1},
			TorsoUpper: {"gamma":2.7666666666666666,"saturation":1.6833333333333333,"contrast":0.8,"brightness":1.5,"red":0.6333333333333334,"green":1.1833333333333333,"blue":2.033333333333333,"alpha":1},
		},
		factionFilters: {
			TorsoLower: {color: "Catsuit", override: true},
			TorsoUpper: {color: "Catsuit", override: true},
		},
		LinkAll: true, noDupe: true,
		linkCategory: "Catsuits", linkSize: 0.75,
		restriction: 3,
		Group: "ItemTorso", power: 8.5, weight: 0, escapeChance: {"Struggle": -1.4, "Cut": -0.1, "Remove": 0.025},
		enemyTags: {"latexRestraintsHeavy" : 1.4, "latexRestraints" : 2, "latexCatsuits": 3, "latexUniform": 3, "latexStart": 10, 'shopCatsuit': 5, "latexcatsuitSpell": 5}, playerTags: {"posLatex": -1, "latexAnger": 2, "latexRage": 2}, minLevel: 7, allFloors: true, shrine: ["Catsuits", "Latex", "Suits"],
		alwaysDress: [
			{Item: "SeamlessCatsuit", Group: "Suit", Color: ['#3873C3'], override: true, factionColor: [[0]]},
			{Item: "SeamlessCatsuit", Group: "SuitLower", Color: ['#3873C3'], override: true, factionColor: [[0]]},
			{Item: "Catsuit", Group: "Gloves", Color: ['#3873C3'], override: true, factionColor: [[0]]}],
		events: [
			{trigger: "beforeStruggleCalc", type: "latexDebuff", power: 0.25, inheritLinked: true}
		]
	},
	//endregion

	//region crystal


	{inventory: true, name: "CrystalArmbinder", inaccessible: true, factionColor: [[0]], Asset: "SeamlessLatexArmbinder", strictness: 0.1,
		LinkableBy: [...KDArmbinderLink], Color: ["#499ed6"], Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 7, weight: 0,
		renderWhenLinked: [...KDArmbinderLink],
		Model: "SmoothArmbinder",
		Filters: {
			Binder: {"gamma":0.95,"saturation":1,"contrast":0.95,"brightness":1.4166666666666665,"red":2.0166666666666666,"green":0.9833333333333333,"blue":2.5333333333333337,"alpha":0.6666666666666666},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Armbinders": 3.5,
			"Less_Armbinders": 0.1,
		},
		factionFilters: {
			Binder: {color: "DarkNeutral", override: true},
		},
		events: [
			{trigger: "tick", type: "crystalDrain", power: -0.01, inheritLinked: true},
			{trigger: "struggle", type: "crystalPunish"},
		],
		escapeChance: {"Struggle": 0.15, "Cut": 0.15, "Remove": 0.1, "Pick": 0.35},
		limitChance: {"Struggle": 0.2, "Cut": 0.1, "Remove": 0.45, "Unlock": 0.2},
		maxwill: 0.35, enemyTags: {"crystalRestraints" : 5, "crystalBinder": 100}, playerTags: {"posElements": -1, "elementsAnger": 1, "elementsRage": 1},
		minLevel: 0, allFloors: true, shrine: ["Crystal", "Leather", "Elements", "Armbinders", "Block_ItemHands"]},


	{renderWhenLinked: ["Corsets", "Harnesses", ...KDBindable, "Latex", "Leather", "Metal", "Rope"], name: "Crystal",
		inaccessible: true, factionColor: [[0]], Asset: "TransparentCatsuit", AssetGroup: "Suit", Color: ["#3873C3"],
		Group: "ItemDevices", power: 10, weight: 0, escapeChance: {"Struggle": -0.4, "Cut": -0.8, "Remove": -100},
		enemyTags: {crystalEncase: 100},
		bindhands: 1.0,
		bindarms: true,
		playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Container", "CrystalEncase", "BlockKneel", "FeetLinked", "HandsBehind"], ignoreSpells: true, removeOnLeash: true, immobile: true,
		alwaysEscapable: ["Struggle"],
		struggleMinSpeed: {
			Struggle: 0.01,
		},
		struggleMaxSpeed: {
			Struggle: 0.4,
		},
		limitChance: {
			Struggle: -0.01,
		},
		Model: "CrystalEncase",
		Filters:{
			TorsoUpper: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1.9666666666666666,"blue":1,"alpha":0.48333333333333334},
			Torso: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1.9666666666666666,"blue":1,"alpha":0.48333333333333334},
			TorsoLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1.9666666666666666,"blue":1,"alpha":0.48333333333333334},
		},
		events: [
			//{trigger: "tick", type: "callGuardFurniture", inheritLinked: true},
			{trigger: "playerMove", type: "removeOnMove", inheritLinked: true},
			//{trigger: "beforeStruggleCalc", type: "latexDebuff", power: 0.15, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "shatter", mult: 1.5, subMult: 0.5, count: 9, inheritLinked: true},
		]
	},
	//endregion

	//region resin
	{renderWhenLinked: ["Corsets", "Harnesses", ...KDBindable, "Latex", "Leather", "Metal", "Rope"], inventory: true, name: "Resin",
		inaccessible: true, factionColor: [[0]], Asset: "TransparentCatsuit", AssetGroup: "Suit", Color: ["#3873C3"],
		Group: "ItemDevices", power: 10, weight: 0, escapeChance: {"Struggle": -0.4, "Cut": -0.3, "Remove": -100},
		enemyTags: {"resinRestraints" : 10, 'resin': 10,},
		bindhands: 1.0,
		bindarms: true,
		playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Container"], ignoreSpells: true, removeOnLeash: true, immobile: true,

		Model: "TransparentCatsuit",
		Filters:{
			TorsoUpper: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1.9666666666666666,"blue":1,"alpha":0.48333333333333334},
			Torso: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1.9666666666666666,"blue":1,"alpha":0.48333333333333334},
			TorsoLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1.9666666666666666,"blue":1,"alpha":0.48333333333333334},
		},
		alwaysDress: [
			{Item: "SeethroughSuit", Group: "Suit", Color: ['#63ab3f'], override: true, factionColor: [[0]]},
			{Item: "SeethroughSuit", Group: "SuitLower", Color: ['#63ab3f'], override: true, factionColor: [[0]]},
			{Item: "SeethroughSuit", Group: "Gloves", Color: ['#63ab3f'], override: true, factionColor: [[0]]}],
		events: [
			{trigger: "tick", type: "callGuardFurniture", inheritLinked: true},
			{trigger: "playerMove", type: "removeOnMove", inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "latexDebuff", power: 0.15, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "shatter", mult: 1.5, subMult: 0.5, count: 9, inheritLinked: true},
		]
	},
	//endregion

	//region redLatex

	{inventory: true, unlimited: true, name: "RedLatexOTNGag", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink],
		factionColor: [[2], [2], [2]], Asset: "KittyGag", gag: 0.5, Color: ["#ff5277", "#ff5277", "#ff5277"], Group: "ItemMouth", AssetGroup: "ItemMouth3", power: 7, weight: -6,
		escapeChance: {"Struggle": -0.1, "Cut": -0.1, "Remove": -0.1},
		Model: "GagLatexMute",
		Filters: {
			Latex: {"gamma":0.35000000000000003,"saturation":0.16666666666666666,"contrast":1.25,"brightness":0.7333333333333334,"red":2.5166666666666666,"green":0.48333333333333334,"blue":0.41666666666666663,"alpha":1},
		},
		factionFilters: {
			Latex: {color: "Highlight", override: false},
		},
		maxwill: 0.8, enemyTags: {"redLatexBasic":6}, playerTags: {"ItemMouthFull": 6}, minLevel: 0, allFloors: true, shrine: ["Latex", "RedLatex", "FlatGags", "Gags"]},
	{inventory: true, unlimited: true, name: "RedLatexBallGag", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink], factionColor: [[], [0]], Asset: "BallGag", gag: 0.75, Color: ["#ff5277", "#882222"],
		Model: "BallGag",
		quickBindCondition: "BallGag", quickBindMult: 0.5,
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		events: [{trigger: "postRemoval", type: "replaceItem", requireFlag: "Struggle", list: ["GagNecklace"], keepLock: true, power: 1, msg: "KDGagNecklaceOn"}],
		factionFilters: {
			Strap: {color: "DarkNeutral", override: false},
			Ball: {color: "Highlight", override: false},
		},
		Type: "Tight", Group: "ItemMouth", power: 6, weight: 0, escapeChance: {"Struggle": -0.1, "Cut": -0.1, "Remove": -0.1},
		maxwill: 0.8, enemyTags: {"redLatexBasic" : 5, forceAntiMagic: -100}, playerTags: {"latexAnger": 2, "latexRage": 2}, minLevel: 0, allFloors: true, shrine: ["Latex", "RedLatex", "BallGags", "Gags"]},

	{inventory: true, unlimited: true, name: "RedLatexMask", LinkableBy: [...KDMaskLink],
		Filters: {
			Rubber: {"gamma":0.35000000000000003,"saturation":0.16666666666666666,"contrast":1.25,"brightness":0.7333333333333334,"red":2.5166666666666666,"green":0.48333333333333334,"blue":0.41666666666666663,"alpha":1},
		},
		factionFilters: {
			Rubber: {color: "Highlight", override: false},
		},
		Model: "RubberHead",
		gag: 0.3, blindfold: 6, power: 7, weight: -6,
		factionColor: [[2]], Color: ["#ff5277"], Group: "ItemHead", Asset: "DroneMask",
		escapeChance: {"Struggle": -0.1, "Cut": -0.1, "Remove": -0.1},
		maxwill: 0.8, enemyTags: {"redLatexBasic":6}, playerTags: {"ItemMouthFull": 6, "Unmasked": -1000}, minLevel: 0, allFloors: true, shrine: ["Latex", "RedLatex", "Masks", "Block_ItemMouth"]},

	{inventory: true, unlimited: true, name: "RedLatexHands",
		Model: "BunnyGlovesRestraint",
		Filters: {"GloveLeft":{"gamma":1,"saturation":0.23333333333333334,"contrast":2.966666666666667,"brightness":0.21666666666666667,"red":2.4833333333333334,"green":0.6666666666666666,"blue":0.6,"alpha":1},"GloveRight":{"gamma":1,"saturation":0.23333333333333334,"contrast":2.966666666666667,"brightness":0.21666666666666667,"red":2.4833333333333334,"green":0.6666666666666666,"blue":0.6,"alpha":1}},

		factionFilters: {
			GloveRight: {color: "Highlight", override: false},
			GloveLeft: {color: "Highlight", override: false},
		},
		Asset: "LatexElbowGloves", Color: "#ff5277", LinkableBy: [...KDGlovesLink], Group: "ItemHands", AssetGroup: "Gloves",
		bindhands: 0.5, power: 10, weight: 0,
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},
		escapeChance: {"Struggle": -0.1, "Cut": -0.1, "Remove": -0.1},
		maxwill: 0.4, enemyTags: {"redLatexBasic":2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "RedLatex", "Gloves"]},

	{inventory: true, unlimited: true, name: "RedLatexBoots", LinkableBy: [...KDSocksLink], renderWhenLinked: ["Boots"], deepAccessible: true, alwaysAccessible: true,
		heelpower: 0.5,
		Model: "BunnySocksRestraint",
		Filters: {"SockLeft":{"gamma":1,"saturation":0.23333333333333334,"contrast":2.966666666666667,"brightness":0.21666666666666667,"red":2.4833333333333334,"green":0.6666666666666666,"blue":0.6,"alpha":1},"SockRight":{"gamma":1,"saturation":0.23333333333333334,"contrast":2.966666666666667,"brightness":0.21666666666666667,"red":2.4833333333333334,"green":0.6666666666666666,"blue":0.6,"alpha":1}},

		factionFilters: {
			SockRight: {color: "Highlight", override: false},
			SockLeft: {color: "Highlight", override: false},
		},
		power: 5, weight: 0,
		factionColor: [[2]], Color: ["#ff5277"], Group: "ItemBoots", AssetGroup: "Socks", Asset: "LatexSocks1",
		escapeChance: {"Struggle": -0.1, "Cut": -0.1, "Remove": -0.1},
		maxwill: 0.8, enemyTags: {"redLatexBasic":5}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "RedLatex", "Socks"]},

	//endregion

	//region Wolf
	{inventory: true, name: "WolfArmbinder", debris: "Belts", inaccessible: true, Asset: "SeamlessLatexArmbinder", strictness: 0.1, LinkableBy: [...KDArmbinderLink], Color: "#2E2E2E", Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 7.5, weight: 0,  escapeChance: {"Struggle": 0.05, "Cut": 0.15, "Remove": 0.07, "Pick": 0.2},
		Model: "WolfArmbinder",
		Filters: {
			BinderStraps: {"gamma":1.1,"saturation":2.4333333333333336,"contrast":1.1333333333333333,"brightness":2.15,"red":1.4666666666666668,"green":4.25,"blue":1,"alpha":1},
		},
		renderWhenLinked: [...KDArmbinderLink],
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Armbinders": 3.5,
			"Less_Armbinders": 0.1,
		},
		factionFilters: {
			Binder: {color: "DarkNeutral", override: true},
			Straps: {color: "Highlight", override: true},
			BinderStraps: {color: "Highlight", override: true},
		},
		limitChance: {"Cut": 0.1, "Remove": 0.04, "Unlock": 0.2},
		maxwill: 0.35, enemyTags: {"wolfRestraints" : 5}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Metal", "Armbinders", "Block_ItemHands"]},
	{inventory: true, name: "WolfStrongArmbinder", debris: "Belts", inaccessible: true, Asset: "SeamlessLatexArmbinder", strictness: 0.2, LinkableBy: [...KDArmbinderLink], Color: "#2E2E2E", Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 9, weight: 0,  escapeChance: {"Struggle": -0.25, "Cut": -0.15, "Remove": -0.07, "Pick": -0.2},
		Model: "JacketHeavyArmbinder",
		Filters: {
			BeltsArms: {"gamma":1.3,"saturation":0,"contrast":2.216666666666667,"brightness":1.2,"red":1.85,"green":3.333333333333333,"blue":1,"alpha":1},
			BeltsChest: {"gamma":1.3,"saturation":0,"contrast":2.216666666666667,"brightness":1.2,"red":1.85,"green":3.333333333333333,"blue":1,"alpha":1},
			BeltsLower: {"gamma":1.3,"saturation":0,"contrast":2.216666666666667,"brightness":1.2,"red":1.85,"green":3.333333333333333,"blue":1,"alpha":1},
		},
		renderWhenLinked: [...KDArmbinderLink],
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Armbinders": 3.5,
			"Less_Armbinders": 0.1,
		},
		factionFilters: {
			Arms: {color: "DarkNeutral", override: true},
			BeltsArms: {color: "Highlight", override: true},
			BeltsChest: {color: "Highlight", override: true},
			BeltsLower: {color: "Highlight", override: true},
		},
		limitChance: {"Cut": 0.1, "Remove": 0.04, "Unlock": 0.2},
		maxwill: 0.2, enemyTags: {"wolfRestraintsHeavy" : 1}, playerTags: {}, minLevel: 12, allFloors: true, shrine: ["Latex", "Metal", "Armbinders", "Block_ItemHands"]},
	{inventory: true, name: "WolfAnkleCuffs", debris: "Chains", accessible: true, Asset: "FuturisticAnkleCuffs", LinkableBy: [...KDBindable], Type: "Chained", Color: ['#4F91DE', '#4F91DE', '#3F6945', '#000000'], Group: "ItemFeet", power: 8, weight: 0,
		Model: "WolfCuffsAnkles",
		linkCategory: "AnkleCuffs", linkSize: 0.51, noDupe: true,
		escapeChance: {"Struggle": -0.5, "Cut": -0.4, "Remove": 0.4, "Pick": 0.15},
		maxwill: 1.0, enemyTags: {"wolfRestraints":7}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Cuffs", "Metal",  "AnkleCuffsBase", "HogtieLower"],
		events: [
			{trigger: "remotePunish", type: "RemoteLinkItem", restraint: "AnkleLinkShort", sfx: "LightJingle", noLeash: true, enemyDialogue: "KDDialogueRemoteLinkCuffs", msg: "KDMsgRemoteLinkCuffs"},
		]
	},
	{alwaysRender: true, inventory: true, name: "WolfHarness", debris: "Belts", accessible: true, remove: ["Cloth"], Asset: "FuturisticHarness", LinkableBy: [...KDHarnessLink],
		strictness: 0.05, harness: true, Color: ['#4F91DE', '#346942', '#889FA7', "#000000"], Group: "ItemTorso", power: 4, weight: 0,

		restriction: 3,
		Model: "WolfHarnessRestraint",
		factionFilters: {
			Lining: {color: "DarkNeutral", override: true},
			Band: {color: "Highlight", override: true},
			Hardware: {color: "LightNeutral", override: true},
		},
		escapeChance: {"Struggle": -0.15, "Cut": 0.12, "Remove": 0.1, "Pick": 0.35},
		maxwill: 1.0, enemyTags: {"wolfRestraints" : 6, "wolfGear":6}, playerTags: {"ItemTorsoFull": -5}, minLevel: 0, allFloors: true, shrine: ["Latex", "Harnesses"]},
	{inventory: true, unlimited: true, name: "WolfMittens",
		Model: "LongMittens",
		factionFilters: {
			Mitten: {color: "DarkNeutral", override: true},
			Band: {color: "Highlight", override: true},
			Lock: {color: "LightNeutral", override: true},
		},
		Asset: "LatexElbowGloves", Color: "#ff5277", LinkableBy: [...KDGlovesLink], renderWhenLinked: ["Mittens"], Group: "ItemHands",
		bindhands: 1.0, power: 10, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": -0.1, "Remove": -0.1, "Pick": 1.0},
		maxwill: 0.4, enemyTags: {"wolfRestraints" : 6, "wolfGear":6}, playerTags: {"ItemHandsFull":-2}, minLevel: 0, allFloors: true, shrine: ["LongMittens", "Mittens", "Latex"]},

	{inventory: true, name: "WolfBallGag", debris: "Belts", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink],
		Model: "SegmentedLargeBallGagHarnessSecure",
		Asset: "FuturisticHarnessBallGag", strictness: 0.35, gag: 0.65,
		events: [
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.35, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.25, requiredTag: "Blindfolds"},
		],
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		Color: ['#5edc73', '#428E4F', '#6E6E6E', '#FFFFFF', '#000000'], Group: "ItemMouth", power: 9, weight: 0,
		maxwill: 0.75, escapeChance: {"Struggle": -0.3, "Cut": 0.0, "Remove": 0.05, "Pick": 0.2},
		enemyTags: {"wolfRestraints" : 8, forceAntiMagic: -100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["BallGags", "Latex" , "Gags", "Metal"]},
	{inventory: true, name: "WolfCollar", debris: "Belts", accessible: true, Asset: "AutoShockCollar", Color: ['#6EAF81', '#6EAF81'], Group: "ItemNeck",
		LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDHighCollarRender],power: 6, weight: 0, escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0.1, "Pick": -0.05},
		Model: "WolfCollarTag",
		factionFilters: {
			Lining: {color: "DarkNeutral", override: true},
			Band: {color: "Highlight", override: true},
			Hardware: {color: "LightNeutral", override: true},
		},
		linkCategory: "BasicCollar", linkSize: 0.51,
		struggleBreak: true,
		maxwill: 0.5, enemyTags: {"wolfRestraints":3, "wolfGear":3, "wolfLeash": 1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "HighCollars", "Collars"],
	},
	{inventory: true, name: "ShockModule", debris: "Belts", accessible: true, Asset: "AutoShockCollar", Color: ['#6EAF81', '#6EAF81'],
		Group: "ItemNeck", LinkableBy: [...KDCollarModuleLink], power: 10, weight: 0, escapeChance: {"Struggle": -0.05, "Cut": 0, "Remove": 0.1, "Pick": -0.15},
		Model: "ShockModule",
		factionFilters: {
			Module: {color: "LightNeutral", override: true},
			ModuleDisplay: {color: "Highlight", override: false},
		},
		DefaultLock: "Red_Hi",
		struggleBreak: true,
		maxwill: 0.35, enemyTags: {"wolfRestraints":3, "wolfGear":3, "wolfLeash": 1, "shockmodule": 10},
		playerTags: {}, playerTagsMissing: {Collars: -1000}, minLevel: 2, allFloors: true, shrine: ["Modules", "Metal", "ModulePunish"],
		requireSingleTagToEquip: ["Collars"],
		linkCategory: "ModulePunish", linkSize: 0.6,
		events: [
			{trigger: "afterPlayerDamage", type: "moduleDamage", mult: 1.5, subMult: 0.5, count: 7, inheritLinked: true},
			{trigger: "postRemoval", type: "collarModule"},
			{trigger: "playerAttack", type: "PunishPlayer", count: 4, chance: 0.25, stun: 2, warningchance: 1.0, damage: "electric", power: 2, sfx: "Shock", inheritLinked: true,},
			{trigger: "beforeStruggleCalc", type: "ShockForStruggle", count: 4, chance: 0.5, stun: 2, warningchance: 0.85, damage: "electric", power: 2, sfx: "Shock", bind: 0.2, inheritLinked: true,},
			{trigger: "playerCast", type: "PunishPlayer", count: 4, chance: 0.35, warningchance: 0.85, punishComponent: "Verbal", damage: "electric", power: 2, sfx: "Shock", inheritLinked: true,},
			{trigger: "remotePunish", type: "RemoteActivatedShock", count: 4, chance: 0.1, stun: 2, damage: "electric", power: 1, sfx: "Shock", noLeash: true, inheritLinked: true,}
		]},
	{inventory: true, name: "TrackingModule", debris: "Belts", accessible: true, Asset: "AutoShockCollar", Color: ['#6EAF81', '#6EAF81'],
		Group: "ItemNeck", LinkableBy: [...KDCollarModuleLink], power: 6, weight: 0, escapeChance: {"Struggle": -0.05, "Cut": 0, "Remove": 0.1, "Pick": -0.15},
		Model: "TrackingModule",
		DefaultLock: "Red_Hi",
		factionFilters: {
			Module: {color: "LightNeutral", override: true},
			ModuleDisplay: {color: "Highlight", override: false},
		},
		struggleBreak: true,
		maxwill: 0.35, enemyTags: {"controlHarness":5, "roboPrisoner" : 100, "cyberdollrestraints" : 10, "trackingmodule": 10},
		playerTags: {}, playerTagsMissing: {Collars: -1000}, minLevel: 2, allFloors: true, shrine: ["Modules", "Metal", "ModuleUtility"],
		linkCategory: "ModuleUtility", linkSize: 0.6,
		requireSingleTagToEquip: ["Collars"],
		events: [
			{trigger: "afterPlayerDamage", type: "moduleDamage", mult: 1.5, subMult: 0.5, count: 9, inheritLinked: true},
			{trigger: "postRemoval", type: "collarModule"},
			{trigger: "playerAttack", type: "AlertEnemies", chance: 1.0, power: 10, sfx: "RobotBeep", inheritLinked: true},
		]},

	{inventory: true, removePrison: true, name: "WolfLeash", debris: "Belts", tether: 2.9, Asset: "CollarLeash", Color: "#44fF76", Group: "ItemNeckRestraints", leash: true, power: 1, weight: -99, harness: true,
		Model: "Leash",
		struggleBreak: true,
		affinity: {
			Cut: ["SharpHookOrFoot"],
			Struggle: ["HookOrFoot"],
		},
		Filters: {
			Leash: {"gamma":1,"saturation":1,"contrast":1.6,"brightness":0.6666666666666666,"red":1,"green":2.0833333333333335,"blue":1,"alpha":1},
		},
		unlimited: true,
		events: [
			{trigger: "postRemoval", type: "RequireCollar"},
		],
		limitChance: {Struggle: 0.2},
		escapeChance: {"Struggle": -0.14, "Cut": -0.2, "Remove": 0.4, "Pick": 0.35}, enemyTags: {"wolfRestraints":9, "wolfLeash": 10}, playerTags: {"ItemNeckRestraintsFull":-2, "ItemNeckFull":999}, minLevel: 0, allFloors: true, shrine: ["Leashes", "Leashable"]},

	//endregion

	//region Cosplay
	{inventory: true, name: "BindingDress", debris: "Fabric", inaccessible: true, remove: ["Cloth", "Bra", "Tops", "Bras"], Type: "Strap", Asset: "LeatherArmbinder", strictness: 0.25, Color: ['#473488'], Group: "ItemArms",
		Model: "ArmbinderGwen",
		Filters: {
			"Straps":{"gamma":1,"saturation":0.08333333333333333,"contrast":0.7333333333333334,"brightness":1.25,"red":1.25,"green":0.6666666666666666,"blue":2.0833333333333335,"alpha":1},
			"BinderStraps":{"gamma":1,"saturation":1,"contrast":0.6666666666666666,"brightness":2.5166666666666666,"red":1,"green":1,"blue":1,"alpha":1},
			"Binder":{"gamma":1,"saturation":0.08333333333333333,"contrast":1,"brightness":0.43333333333333335,"red":1.25,"green":0.6666666666666666,"blue":2.0833333333333335,"alpha":1},
		},

		events: [
			{type: "FactionStealth", trigger: 'calcSneak', kind: "Dressmaker", mult: 0.8, power: 2,},
		],
		LinkableBy: [...KDDressLink], alwaysRender: true, bindarms: true, bindhands: 1.0, power: 8, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": 0.2, "Remove": -0.2, "Pick": 0.15}, helpChance: {"Struggle": -0.1, "Cut": 0.2, "Remove": 0.075},
		limitChance: {"Struggle": 0.125, "Cut": 0.125, "Remove": 0.1, "Unlock": 0.5},
		alwaysDress: [
			{Item: "PleatedSkirt", Group: "ClothLower", Color: ['#6B48E0'], override: true},
			{Item: "SleevelessCatsuit", Group: "Suit", Color: ['#473488'], override: true},
			{Item: "CatsuitPanties", Group: "SuitLower", Color: ['#473488'], override: true}],
		forceOutfit: "Lingerie",
		forceOutfitPriority: 1,
		alwaysDressModel: [
			{
				Model: "BindingDress",
				Filters: {
					"Skirt":{"gamma":1,"saturation":0.05,"contrast":1,"brightness":1.7166666666666666,"red":1,"green":1,"blue":1,"alpha":1},
					SkirtBack: {"gamma":1,"saturation":0,"contrast":0.5700000000000001,"brightness":1,"red":0.5294117647058824,"green":0.35294117647058826,"blue":0.6470588235294118,"alpha":1}
				},
				factionFilters: {
					Base: {override: true, color: "DarkNeutral"},
					Hardware: {override: true, color: "Highlight"},
					Stripes: {override: true, color: "LightNeutral"},
					BraBase: {override: true, color: "DarkNeutral"},
					BraStripes: {override: true, color: "DarkNeutral"},
					BaseMetal: {override: false, color: "DarkNeutral"},
					Crystal: {override: false, color: "Highlight"},
					Skirt: {override: true, color: "LightNeutral"},
					SkirtBack: {override: false, color: "DarkNeutral"},
					Trim: {override: false, color: "Highlight"},
					Lace: {override: false, color: "Highlight"},
					Tie: {override: false, color: "Highlight"},
					Panties: {override: false, color: "DarkNeutral"},
				},
			}
		],
		addPose: ["PreferWristtie"],
		maxwill: 0.5, enemyTags: {"dressRestraints" : 10, "bindingDress": 10}, playerTagsMult: {"ItemArmsEmpty": 0.05}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["BindingDress", "Rope", "Block_ItemHands", "HandsBehind"]},
	{inventory: true, trappable: true, name: "DressGag", debris: "Fabric", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink], Asset: "HarnessBallGag",
		Model: "SmoothBallGagHarnessSecure",
		Filters: {
			Ball: {"gamma":1,"saturation":0.08333333333333333,"contrast":1,"brightness":0.43333333333333335,"red":1.25,"green":0.6666666666666666,"blue":2.0833333333333335,"alpha":1},
		},
		events: [
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.35, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.25, requiredTag: "Blindfolds"},
		],
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		gag: 0.65, Type: "Tight", Color: ["#8762c7", "Default"], Group: "ItemMouth", power: 8, strictness: 0.2, weight: 5, magic: true,
		escapeChance: {"Struggle": -0.2, "Cut": 0.2, "Remove": 0.2, "Pick": 0.2},
		maxwill: 0.6, enemyTags: {"dressRestraints":3, forceAntiMagic: -100}, playerTags: {}, minLevel: 2, allFloors: true, shrine: ["Rope", "BallGags", "Gags"]},
	{inventory: true, trappable: true, name: "DressMuzzle", debris: "Fabric", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], Asset: "MuzzleGag", gag: 0.3, Color: ["#6B48E0", "#39339c"], Group: "ItemMouth", AssetGroup: "ItemMouth3", power: 9, strictness: 0.3, weight: 1, magic: true,
		Model: "GagFabric",
		Filters: {
			Fabric: {"gamma":1.8833333333333333,"saturation":1,"contrast":0.9833333333333333,"brightness":0.7166666666666667,"red":1.4333333333333333,"green":1.0166666666666666,"blue":2.183333333333333,"alpha":1},
		},
		escapeChance: {"Struggle": -0.4, "Cut": 0.15, "Remove": 0.2, "Pick": 0.1}, DefaultLock: "Blue",
		maxwill: 0.1, enemyTags: {"dressRestraints":3, "dressGags": 3}, playerTags: {"ItemMouthEmpty": -10}, minLevel: 6, allFloors: true, shrine: ["FlatGags", "Rope", "Gags"]},



	{alwaysRender: true, inventory: true, name: "DressCorset", debris: "Fabric", linkCategory: "Corset", linkSize: 0.55, inaccessible: true, factionColor: [[0]], OverridePriority: 26, Asset: "HeavyLatexCorset",
		Model: "LaceCorset",
		factionFilters: {
			Base: {color: "DarkNeutral", override: true},
			Stripes: {color: "LightNeutral", override: true},
			Crystal: {color: "Highlight", override: true},
		},
		restriction: 7,
		LinkableBy: KDCorsetLink, strictness: 0.1, Color: ["#473488"], Group: "ItemTorso", power: 8, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": 0.2, "Remove": -0.2, "Pick": 0.15}, helpChance: {"Struggle": -0.1, "Cut": 0.2, "Remove": 0.025}, struggleMinSpeed: {"Remove": 0.05}, struggleMaxSpeed: {"Remove": 0.1},
		failSuffix: {"Remove": "Corset"}, enemyTags: {"dressRestraints": 1, "dressUniform": 12}, playerTags: {"ItemTorsoFull": -5, "conjureAnger": 2, "conjureRage": 2}, minLevel: 0, allFloors: true, shrine: ["Corsets", "Latex", "HeavyCorsets"],
		alwaysDress: [
			{Item: "AsymmetricSkirt", Group: "ClothLower", Color: ['#6B48E0'], override: true},
			{Item: "SleevelessCatsuit", Group: "Suit", Color: ['#473488'], override: true},
			{Item: "CatsuitPanties", Group: "SuitLower", Color: ['#F8BD01'], override: true}],
	},

	{inventory: true, name: "DressBra", debris: "Fabric", inaccessible: true, Asset: "FuturisticBra2", Color: ['#6B48E0', '#F8BD01', '#6B48E0', '#6B48E0', '#F8BD01', '#6B48E0'], Group: "ItemBreast", LinkableBy: ["Ornate"], chastitybra: true, power: 8, weight: -2,
		Model: "LaceBraDeco",
		factionFilters: {
			BraCuts: {color: "DarkNeutral", override: true},
			BraBase: {color: "LightNeutral", override: true},
			BraStripes: {color: "Highlight", override: true},
			DecoBase: {color: "LightNeutral", override: true},
			DecoCrystal: {color: "Highlight", override: true},
		},
		Security: {
			level_key: 2,
			level_magic: 2,
		},
		escapeChance: {"Struggle": -0.5, "Cut": -0.05, "Remove": 0.4, "Pick": 0.15}, bypass: true,
		maxwill: 0.9, enemyTags: {"dressRestraints" : 10, "dressUniform" : 10}, playerTags: {"ItemNipplesFull": 2, "FreeBoob": -1000}, minLevel: 0, allFloors: true, shrine: ["ChastityBras", "Rope"]},

	{inventory: true, name: "AsylumJacket", debris: "Belts", Asset: "HighSecurityStraitJacket", Modules: [1, 2, 3], Color: ["#333333", "#333333", '#808080', '#808080'],
		LinkableBy: [...KDJacketLink],
		renderWhenLinked: [...KDJacketLink], Group: "ItemArms", power: 8, weight: 0, bindarms: true, bindhands: 1.0,strictness: 0.2,

		Model: "Jacket",
		Filters: {
			Chest: {"gamma":1.5333333333333332,"saturation":1,"contrast":0.8999999999999999,"brightness":2.15,"red":1,"green":1,"blue":1,"alpha":1},
			Arms: {"gamma":1.5333333333333332,"saturation":1,"contrast":0.8999999999999999,"brightness":2.15,"red":1,"green":1,"blue":1,"alpha":1},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		limitChance: {"Struggle": 0.12, "Cut": 0.03, "Remove": 0.1, "Unlock": 0.75},
		escapeChance: {"Struggle": -0.175, "Cut": 0.15, "Remove": 0.1, "Pick": 0.15},
		enemyTags: {"nurseRestraints": 5, "jacketSpell": 50}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, maxwill: 0.35, allFloors: true, shrine: ["Straitjackets", "Block_ItemHands", "Leather"]},

	{inventory: true, name: "TransportJacket", debris: "Belts", Asset: "TransportJacket", events: [{type: "PrisonerJacket", trigger: "afterDress"}], Color: ["#808080", "#202020", "#808080", "#EEEEEE", "#202020", "#808080"],
		Model: "JacketHeavy",
		LinkableBy: [...KDTransportLink],
		renderWhenLinked: [...KDJacketRender],
		Filters: {
			Chest: {"gamma":1.5333333333333332,"saturation":1,"contrast":0.8999999999999999,"brightness":2.15,"red":1,"green":1,"blue":1,"alpha":1},
			Arms: {"gamma":1.5333333333333332,"saturation":1,"contrast":0.8999999999999999,"brightness":2.15,"red":1,"green":1,"blue":1,"alpha":1},
			Lower: {"gamma":1.5333333333333332,"saturation":1,"contrast":0.8999999999999999,"brightness":2.15,"red":1,"green":1,"blue":1,"alpha":1},
		},
		harness: true,
		Group: "ItemArms", power: 10, weight: -1, bindarms: true, bindhands: 1.0, strictness: 0.3,
		unlimited: true,
		limitChance: {"Struggle": 0.12, "Cut": 0.1, "Remove": 0.15, "Unlock": 0.75},
		escapeChance: {"Struggle": -0.175, "Cut": 0.1, "Remove": 0.1, "Pick": 0.15},
		enemyTags: {"nurseRestraints": 1}, playerTagsMult: {"ItemArmsEmpty": 0.02}, playerTags: {"AsylumJacketWorn": 20}, minLevel: 0, maxwill: 0.1, allFloors: true, shrine: ["Straitjackets", "Block_ItemHands", "TransportJackets", "Leather"]},

	{renderWhenLinked: [...KDLegbinderRender], inventory: true, name: "AsylumLegbinder", debris: "Belts", inaccessible: true, Asset: "LegBinder", LinkableBy: [...KDLegbinderLink], Color: "Default", Group: "ItemLegs", blockfeet: true,
		Model: "Legbinder",
		Filters: {
			Binder: {"gamma":0.6333333333333334,"saturation":1,"contrast":0.6833333333333333,"brightness":0.6,"red":1.7999999999999998,"green":1.2333333333333334,"blue":1,"alpha":1},
		},
		factionFilters: {
			Laces: {color: "DarkNeutral", override: true},
		},
		hobble: 1,
		affinity: {Remove: ["Hook"], Struggle: ["Hook"],},
		maxwill: 0.1,
		struggleMult: {Struggle: 0.4},
		power: 6, weight: 2, escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": 0.3, "Pick": 0.25}, enemyTags: {"nurseRestraints": 1}, playerTags: {"ItemArmsFull":3},
		struggleMaxSpeed: {"Remove": 0.1}, // Easy to remove but takes a while
		minLevel: 0, allFloors: true, shrine: ["Leather", "Legbinders"]},

	{inventory: true, name: "AsylumMuzzle", debris: "Belts", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], gag: 0.4, Asset: "FuturisticMuzzle", Modules: [1, 1, 0], Group: "ItemMouth", AssetGroup: "ItemMouth3", Color: ["#814F21","#814F21","#814F21","#814F21"], power: 8, weight: 2,
		Model: "GagFabric",
		Filters: {
			Fabric: {"gamma":0.6333333333333334,"saturation":1,"contrast":0.6833333333333333,"brightness":0.6,"red":1.7999999999999998,"green":1.2333333333333334,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": -0.14, "Cut": 0.18, "Remove": 0.25, "Pick": 0.2}, maxwill: 0.9,
		enemyTags: {"nurseRestraints":3}, playerTags: {"ItemMouthFull":1}, minLevel: 0, allFloors: true, shrine: ["FlatGags", "Leather", "Gags"]},

	//endregion

	//region Fuuka's stuff
	{inventory: true, curse: "GhostLock", name: "MikoCollar", Asset: "HighCollar", Color: ["#ffffff", "#AA2222"],Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDHighCollarRender],magic: true, power: 40, weight: 0, difficultyBonus: 10,
		Model: "MikoCollar",
		struggleBreak: true,
		factionFilters: {
			Rim: {color: "Highlight", override: true,},
			Neck: {color: "DarkNeutral", override: true,},
			Collar: {color: "Highlight", override: true,},
		},
		escapeChance: {"Struggle": -100, "Cut": -0.8, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["HighCollars", "Collars"],
		unlimited: true,
		events: [{trigger: "kill", type: "MikoGhost", inheritLinked: true}],
	},
	{inventory: true, curse: "GhostLock", name: "MikoCollar2", Asset: "HighCollar", Color: ["#ffffff", "#AA2222"],Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDHighCollarRender],magic: true, power: 40, weight: 0, difficultyBonus: 10,
		Model: "MikoCollar",
		struggleBreak: true,
		linkCategory: "SpecialCollar",
		factionFilters: {
			Rim: {color: "Highlight", override: true,},
			Neck: {color: "DarkNeutral", override: true,},
			Collar: {color: "Highlight", override: true,},
		},
		linkSize: 0.99,
		escapeChance: {"Struggle": -100, "Cut": -0.8, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["HighCollars", "Collars"],
		unlimited: true,
		events: [{trigger: "kill", type: "MikoGhost2", inheritLinked: true}],
	},
	// Generic stronger gag
	{inventory: true, name: "MikoGag", Asset: "OTNPlugGag", debris: "Belts", LinkableBy: [...KDPlugGagLink], renderWhenLinked: [...KDPlugGagLink], Type: "Plug", gag: 1.0, Color: ["#ffffff", "#AA2222", "#ffffff"],
		Group: "ItemMouth", power: 9, weight: 2, DefaultLock: "Blue",
		magic: true,
		/*Model: "PlugMuzzleGagHarnessSecure",
		Filters: {
			Plug: {"gamma":1,"saturation":1,"contrast":3.1,"brightness":0.5666666666666667,"red":1,"green":1,"blue":1,"alpha":1},
			Strap: {"gamma":1,"saturation":0.06666666666666667,"contrast":1,"brightness":1,"red":2.816666666666667,"green":1,"blue":1,"alpha":1},
			Harness: {"gamma":1,"saturation":0.06666666666666667,"contrast":1,"brightness":1,"red":2.816666666666667,"green":1,"blue":1,"alpha":1},
			SideStrap: {"gamma":1,"saturation":0.06666666666666667,"contrast":1,"brightness":1,"red":2.816666666666667,"green":1,"blue":1,"alpha":1},
			Muzzle: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":3.7,"red":1,"green":1,"blue":1,"alpha":1},
		},*/
		factionFilters: {
			Plug: {color: "Highlight", override: true,},
			Strap: {color: "DarkNeutral", override: true,},
			SideStrap: {color: "DarkNeutral", override: true,},
			Harness: {color: "DarkNeutral", override: true,},
			Latex: {color: "LightNeutral", override: true,},
		},
		Model: "GagLatexPlugHarnessSecure",
		Filters: {"Plug":{"gamma":1,"saturation":0.03333333333333333,"contrast":0.6666666666666666,"brightness":1.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},"Harness":{"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"Latex":{"gamma":1,"saturation":0.05,"contrast":1.2,"brightness":0.6,"red":2.166666666666667,"green":0.43333333333333335,"blue":0.6,"alpha":1}},
		value: 150,
		escapeChance: {"Struggle": -0.25, "Cut": 0.05, "Remove": -0.2, "Pick": 0.09}, helpChance: {"Struggle": -0.2, "Cut": 0.05, "Remove": 0.125},
		limitChance: {"Struggle": 0.125, "Cut": 0.125, "Remove": 0.1, "Unlock": 0.5},
		maxwill: 0.6, enemyTags: {"mikoRestraints" : 10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["PlugGags", "Will", "Rope", "Gags"]},
	{inventory: true, name: "MikoDress", debris: "Fabric", inaccessible: true, remove: ["Cloth", "Bra", "Tops", "Bras"], Type: "Strap", Asset: "LeatherArmbinder", strictness: 0.25, Color: ['#ffffff'], Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 8, weight: 0, DefaultLock: "Blue",
		Model: "SmoothArmbinderSecure",
		LinkableBy: [...KDDressLink], alwaysRender: true,
		Filters: {
			BinderStraps: {"gamma":1,"saturation":1,"contrast":1,"brightness":3.2666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
			Binder: {"gamma":1,"saturation":0.06666666666666667,"contrast":1,"brightness":1,"red":2.816666666666667,"green":1,"blue":1,"alpha":1},
			Straps: {"gamma":1,"saturation":1,"contrast":1,"brightness":3.2666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Binder: {color: "Highlight", override: true,},
			BinderStraps: {color: "DarkNeutral", override: true,},
			Straps: {color: "DarkNeutral", override: true,},
		},

		forceOutfit: "Lingerie",
		forceOutfitPriority: 1,
		alwaysDressModel: [
			{
				Model: "BindingDress",
				Filters: {SkirtBack: {"gamma":1,"saturation":0,"contrast":0.5700000000000001,"brightness":1,"red":0.5294117647058824,"green":0.35294117647058826,"blue":0.3570588235294118,"alpha":1},
					"Skirt":{"gamma":1,"saturation":0.05,"contrast":1.2,"brightness":0.6,"red":2.166666666666667,"green":0.43333333333333335,"blue":0.6,"alpha":1},
					"Stripes":{"gamma":1,"saturation":1,"contrast":0.6666666666666666,"brightness":2.5166666666666666,"red":1,"green":1,"blue":1,"alpha":1},
					"BraStripes":{"gamma":1,"saturation":1,"contrast":0.6666666666666666,"brightness":2.5166666666666666,"red":1,"green":1,"blue":1,"alpha":1},
					"Crystal":{"gamma":1,"saturation":1,"contrast":0.6666666666666666,"brightness":0.7166666666666667,"red":3.433333333333333,"green":1,"blue":1,"alpha":1},
					"Base":{"gamma":1,"saturation":0.05,"contrast":1.2,"brightness":1.6833333333333333,"red":2.166666666666667,"green":0.43333333333333335,"blue":0.6,"alpha":1},
					"BraBase":{"gamma":1,"saturation":0.05,"contrast":1.2,"brightness":1.6833333333333333,"red":2.166666666666667,"green":0.43333333333333335,"blue":0.6,"alpha":1},
					"Panties":{"gamma":1,"saturation":0.05,"contrast":1.2,"brightness":1.7999999999999998,"red":2.166666666666667,"green":0.43333333333333335,"blue":0.6,"alpha":1},
					"Trim":{"gamma":1,"saturation":0.05,"contrast":1.2,"brightness":2.0833333333333335,"red":2.166666666666667,"green":0.43333333333333335,"blue":0.6,"alpha":1},"Lace":{"gamma":1,"saturation":0.03333333333333333,"contrast":0.6666666666666666,"brightness":2.5166666666666666,"red":1,"green":1,"blue":1,"alpha":1}},
				factionFilters: {
					Base: {override: true, color: "DarkNeutral"},
					Hardware: {override: true, color: "Highlight"},
					Stripes: {override: true, color: "LightNeutral"},
					BraBase: {override: true, color: "DarkNeutral"},
					BraStripes: {override: true, color: "DarkNeutral"},
					BaseMetal: {override: false, color: "DarkNeutral"},
					Crystal: {override: false, color: "Highlight"},
					Skirt: {override: true, color: "LightNeutral"},
					SkirtBack: {override: false, color: "DarkNeutral"},
					Trim: {override: false, color: "Highlight"},
					Lace: {override: false, color: "Highlight"},
					Tie: {override: false, color: "Highlight"},
					Panties: {override: false, color: "DarkNeutral"},
				},
			}
		],
		value: 200,
		magic: true,
		escapeChance: {"Struggle": -0.25, "Cut": 0.05, "Remove": -0.2, "Pick": 0.15}, helpChance: {"Struggle": -0.2, "Cut": 0.05, "Remove": 0.125},
		limitChance: {"Struggle": 0.125, "Cut": 0.125, "Remove": 0.1, "Unlock": 0.5},
		addPose: ["PreferWristtie"],
		alwaysDress: [
			{Item: "PleatedSkirt", Group: "ClothLower", Color: ['#AA2222'], override: true},
			{Item: "SleevelessCatsuit", Group: "Suit", Color: ['#AA2222'], override: true},
			{Item: "LatexCorset1", Group: "Corset", Color: ['#ffffff'], override: true},
			{Item: "CatsuitPanties", Group: "SuitLower", Color: ['#AA2222'], override: true}],
		maxwill: 0.5, enemyTags: {"mikoRestraints" : 10}, playerTagsMult: {"ItemArmsEmpty": 0.05}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["BindingDress", "Will", "Rope", "Block_ItemHands", "HandsBehind"]},
	//endregion




	// collar #6EAF81

	//region Exp
	{inventory: true, name: "ExpArmbinder", debris: "Belts", inaccessible: true, Asset: "BoxTieArmbinder", strictness: 0.12,
		Model: "JacketArmbinderSecure",
		Filters: {
			Arms: {"gamma":1,"saturation":1,"contrast":0.8833333333333333,"brightness":1.3,"red":1,"green":1.3,"blue":2.8499999999999996,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":3.4499999999999997,"blue":1,"alpha":1},
			BeltsChest: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":3.4499999999999997,"blue":1,"alpha":1},
		},
		factionFilters: {
			Arms: {color: "DarkNeutral", override: true},
			BeltsArms: {color: "Highlight", override: true},
			BeltsChest: {color: "Highlight", override: true},
			BeltsLower: {color: "Highlight", override: true},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.1,
			"More_Armbinders": 3.5,
			"Less_Armbinders": 0.1,
		},
		LinkableBy: [...KDBoxbinderLink], Color: ["#415690", "#ffffff"], Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 8, weight: 0,
		limitChance: {"Struggle": 0.05, "Cut": 0.05, "Remove": 0.035, "Unlock": 0.3}, // Hard to escape the arms box by struggling
		escapeChance: {"Struggle": 0.1, "Cut": 0.15, "Remove": 0.1, "Pick": 0.35},
		maxwill: 0.25, enemyTags: {"expRestraints" : 5}, playerTags: {}, minLevel: 7, allFloors: true, shrine: ["Boxbinders", "Latex", "Block_ItemHands"]},
	{alwaysRender: true, inventory: true, name: "ExpArmbinderHarness", debris: "Belts", accessible: true, Asset: "Corset4", Color: "#383E4D", Group: "ItemTorso", strictness: 0.1, power: 9, weight: -10, OverridePriority: 26,
		LinkableBy: [...KDHarnessLink],

		restriction: 2,
		Model: "JacketStraps",
		Filters: {
			BeltsArms: {"gamma":1,"saturation":0,"contrast":1.45,"brightness":2.05,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsChest: {"gamma":1,"saturation":0,"contrast":1.45,"brightness":2.05,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			BeltsArms: {color: "Highlight", override: true},
			BeltsChest: {color: "Highlight", override: true},
			BeltsLower: {color: "Highlight", override: true},
		},
		escapeChance: {"Struggle": 0.0, "Cut": 0.1, "Remove": 0.15},
		enemyTagsMult: {"backup_harness": 0.05},
		maxwill: 0.6, enemyTags: {"expRestraints" : 20}, playerTags: {"ItemArmsEmpty": -1000, "Armbinders": 25, "Boxbinders": 25}, playerTagsMissing: {"Armbinders": -25, "Boxbinders": -25},minLevel: 7, allFloors: true, shrine: ["ArmbinderHarness", "Latex"],
		events: [{trigger: "postRemoval", type: "armbinderHarness"}], requireSingleTagToEquip: ["Armbinders", "Boxbinders"]},
	{inventory: true, name: "ExpCollar", debris: "Belts", inaccessible: true, Asset: "LatexPostureCollar", gag: 0.3, Color: "#4E7DFF",
		Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDHighCollarRender],factionColor: [[0]], power: 8, weight: -2,
		strictness: 0.05, escapeChance: {"Struggle": -0.05, "Cut": 0.05, "Remove": 0.2, "Pick": 0.2},
		Model: "NeckCorsetGag",
		factionFilters: {
			Neck: {color: "LightNeutral", override: false},
			Latex: {color: "LightNeutral", override: false},
			Rim: {color: "Highlight", override: true},
		},
		maxwill: 0.25, enemyTags: {"expRestraints" : 3, "latexCollar": 7}, playerTags: {"ItemMouthFull": 2, "ItemMouth2Full": 2, "ItemMouth3Full": 2},
		minLevel: 0, allFloors: true, shrine: ["Posture", "HighCollars", "Collars", "Latex"]},
	{inventory: true, name: "ExpBoots", debris: "Belts",  remove: ["Shoes"], inaccessible: true, Asset: "BalletWedges", Color: "#748395", Group: "ItemBoots", LinkableBy: ["Wrapping", "Encase",],
		power: 8, weight: 0, escapeChance: {"Struggle": -0.25, "Cut": 0.0, "Remove": 0.07, "Pick": 0.25},
		Model: "ShinyBalletHeelsRestraint",
		heelpower: 1.25,
		maxwill: 0.9, enemyTags: {"expRestraints" : 6, "latexBoots" : 3, "blacksteelRestraints":10}, playerTags: {}, minLevel: 2, allFloors: true, shrine: ["Heels", "Latex"]},
	//endregion

	// TODO AlwaysDebris
	{inventory: true, name: "Stuffing", unlimited: true, debris: "Fabric", Asset: "ClothStuffing", LinkableBy: [...KDStuffingLink], Color: "Default", Group: "ItemMouth", power: -20, weight: 0, gag: 0.4,
		Model: "Stuffing",
		alwaysRender: true,
		quickBindCondition: "Stuffing",
		alwaysInaccessible: true,
		escapeChance: {"Struggle": 1, "Cut": 1, "Remove": 1}, enemyTags: {"stuffedGag": 100, "clothRestraints":12, "ribbonRestraints":6, "ropeAuxiliary": 4,}, playerTags: {}, minLevel: 0,
		allFloors: true, shrine: ["Stuffing"]},




	//#region Mithril
	{inventory: true, name: "MithrilCollar", Asset: "ShinySteelCollar", Color: ['#C9B883', '#C9B883'], Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: -2,
		Model: "ElfCollarRestraint",
		Filters: {
			Collar: {"gamma":1,"saturation":0,"contrast":1,"brightness":1.5,"red":1,"green":1,"blue":1,"alpha":1},
		},
		struggleBreak: true,
		linkCategory: "BasicCollar", linkSize: 0.51,
		unlimited: true, escapeChance: {"Struggle": -0.1, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		maxwill: 0.25, enemyTags: {"mithrilRestraints":4, 'shopCollar': 10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Collars"]},
	//endregion

	{removePrison: true, name: "LatexCube", Asset: "VacCube", Color: ["#ff77ff"], Group: "ItemDevices", power: 5, weight: 1, immobile: true, alwaysStruggleable: true,
		Model: "LatexCube",
		addTag: ["ForceKneel", "NoHogtie"],
		tightType: "Thick",
		escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": -.2},
		helpChance: {"Remove": 0.5, "Pick": 0.5, "Unlock": 1.0},
		enemyTags: {"latexcube":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Container", "Latex"], ignoreSpells: true, removeOnLeash: true,
		events: [{trigger: "tick", type: "cageDebuff", inheritLinked: true}, {trigger: "tick", type: "callGuardFurniture", inheritLinked: true}, {trigger: "playerMove", type: "removeOnMove", inheritLinked: true}]},
	{removePrison: true, name: "Bubble", Asset: "VacCube", Color: ["#ff77ff"], Group: "ItemDevices", power: 3, weight: 1, alwaysStruggleable: true,
		Model: "Bubble", LinkableBy: ["Container"],renderWhenLinked: ["Container"],
		addTag: ["ForceKneel", "NoHogtie"],
		hobble: 3,
		heelpower: 10,
		tightType: "Thick",
		failSuffix: {Remove: "Bubble", Struggle: "Bubble", Cut: "Bubble"},
		limitChance: {
			Cut: 0,
			Struggle: 0.4,
			Remove: 0.8,
		},
		affinity: {
			Struggle: ["Sharp"],
			Remove: ["Sharp"],
		},
		escapeChance: {"Struggle": 0, "Cut": 0.8, "Remove": 0.3},
		helpChance: {"Struggle": 0.2, "Pick": 1.0, "Remove": .2},
		events: [
			{trigger: "afterPlayerDamage", type: "bubblePop", mult: 1.5, subMult: 0.5, count: 13, inheritLinked: true},
			{trigger: "beforePlayerDamage", type: "bounce", chance: 0.2, sfx: "RubberBolt", inheritLinked: true},
		],
		enemyTags: {"bubble":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Container", "Elements"], removeOnLeash: true,
	},
	{removePrison: true, name: "SlimeBubble", Asset: "VacCube", Color: ["#ff77ff"], Group: "ItemDevices", power: 5, weight: 1, alwaysStruggleable: true,
		Model: "SlimeBubble", LinkableBy: ["Container"],renderWhenLinked: ["Container"],
		hobble: 3,
		heelpower: 10,
		tightType: "Thick",
		addTag: ["ForceKneel", "NoHogtie"],
		failSuffix: {Remove: "Bubble", Struggle: "Bubble", Cut: "Bubble"},
		affinity: {
			Struggle: ["Sharp"],
			Remove: ["Sharp"],
		},
		limitChance: {
			Cut: 0.3,
			Struggle: 0.4,
			Remove: 0.8,
		},
		escapeChance: {"Struggle": 0, "Cut": 0.4, "Remove": .3},
		helpChance: {"Struggle": 0.2, "Pick": 1.0, "Remove": .2},
		events: [
			{trigger: "afterPlayerDamage", type: "bubblePop", mult: 1.5, subMult: 0.5, count: 13, inheritLinked: true},
			{trigger: "beforePlayerDamage", type: "bounce", chance: 0.2, sfx: "RubberBolt", inheritLinked: true},
		],
		enemyTags: {"slimebubble":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Container", "Latex"], removeOnLeash: true,
	},


	{removePrison: true, name: "BallSuit", Asset: "VacCube", Color: ["#88aaff"], Group: "ItemDevices", power: 4, weight: 1, alwaysStruggleable: true,
		Model: "BallSuit", LinkableBy: ["Container"],renderWhenLinked: ["Container"],
		bindarms: true,
		restriction: 15,
		tightType: "Thick",
		addTag: ["ForceKneel", "NoHogtie"],
		failSuffix: {Remove: "Bubble", Struggle: "Bubble", Cut: "Bubble"},
		escapeChance: {"Struggle": -0.3, "Cut": 0.5, "Remove": -.5},
		helpChance: {"Struggle": -0.3, "Pick": 1.0, "Remove": -.5},
		affinity: {
			Struggle: ["Sharp"],
			Remove: ["Sharp"],
		},
		factionFilters: {
			BallSuit: {color: "Highlight", override: false},
		},
		events: [
			//{trigger: "tick", type: "callGuardFurniture", inheritLinked: true},
			{trigger: "beforePlayerDamage", type: "bounce", chance: 0.4, sfx: "RubberBolt", inheritLinked: true},
			{trigger: "playerMove", type: "tipBallsuit", inheritLinked: true},
		],
		enemyTags: {"ballSuit":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Container", "Latex", "BallSuit"], removeOnLeash: true,
	},

	{removePrison: true, name: "LatexSphere", Asset: "VacCube", Color: ["#88aaff"], Group: "ItemDevices", power: 5, weight: 1, immobile: true, alwaysStruggleable: true, blindfold: 6, enclose: true,
		Model: "LatexSphere",
		bindarms: true,
		restriction: 30,
		tightType: "Thick",
		addTag: ["ForceKneel", "NoHogtie"],
		failSuffix: {Remove: "Bubble", Struggle: "Bubble", Cut: "Bubble"},
		escapeChance: {"Struggle": -0.3, "Cut": 0.5, "Remove": -.5},
		helpChance: {"Struggle": -0.3, "Pick": 1.0, "Remove": -.5},
		affinity: {
			Struggle: ["Sharp"],
			Remove: ["Sharp"],
		},
		factionFilters: {
			LatexSphere: {color: "Highlight", override: false},
			LatexSphereCutaway: {color: "Highlight", override: false},
			LatexSphereCutawayBack: {color: "Highlight", override: false},
		},
		events: [
			{trigger: "tick", type: "callGuardFurniture", inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "bubblePop", mult: 1.5, subMult: 0.5, count: 13, inheritLinked: true},
			{trigger: "beforePlayerDamage", type: "bounce", chance: 0.2, sfx: "RubberBolt", inheritLinked: true},
		],
		enemyTags: {"latexSphere":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Container", "Latex"], removeOnLeash: true,
	},
	// Future Box
	{removePrison: true, name: "FutureBox", Asset: "Cage", Color: ['Default', 'Default', '#000000'], Group: "ItemDevices", power: 8, weight: 1,
		Model: "FutureBox",
		DefaultLock: "Red",
		addTag: ["NoHogtie"],
		tightType: "Secure",
		factionFilters: {
			Display: {color: "Highlight", override: false},
			DoorNumeral: {color: "Highlight", override: false},
			BackFade: {color: "Highlight", override: false},
		},
		escapeChance: {"Struggle": -10, "Cut": -0.7, "Remove": 10, "Pick": -10, "Unlock": -10},
		helpChance: {"Remove": 0.5, "Pick": -0.1, "Unlock": 1.0},
		enemyTags: {"futurebox":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Container", "CyberBox"], ignoreSpells: true, removeOnLeash: true, immobile: true, enclose: true,
		events: [{trigger: "tick", type: "callGuardFurniture", inheritLinked: true}, {trigger: "playerMove", type: "removeOnMove", inheritLinked: true}]},
	// Barrel trap, always possible to struggle out but takes time
	{removePrison: true, name: "BarrelTrap", Asset: "SmallWoodenBox", Color: "Default", Group: "ItemDevices", power: 2, weight: 1, immobile: true, alwaysStruggleable: true, blindfold: 6, enclose: true,
		Model: "Barrel",
		tightType: "Secure",
		escapeChance: {"Struggle": 0.1, "Cut": 0.025, "Remove": 0.025, "Pick": -1.0, "Unlock": -1.0},
		struggleMinSpeed: {"Struggle": 0.07, "Cut": 0.03, "Remove": 0.05}, alwaysEscapable: ["Struggle"],
		struggleMaxSpeed: {"Struggle": 0.15, "Cut": 0.15, "Remove": 0.15},
		addTag: ["ForceKneel", "NoHogtie"],
		helpChance: {"Remove": 0.4, "Pick": 0.2, "Unlock": 1.0},
		limitChance: {"Struggle": 0.01, "Cut": 0, "Remove": 0.01, "Pick": 0, "Unlock": 0},
		enemyTags: {"barrel":100}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Furniture", "Container"], ignoreSpells: true, removeOnLeash: true, ignoreIfNotLeash: true,
		events: [{trigger: "tick", type: "barrelDebuff", inheritLinked: true}, {trigger: "tick", type: "callGuardFurniture", inheritLinked: true}, {trigger: "playerMove", type: "removeOnMove", inheritLinked: true}]},
	// Cage trap
	{removePrison: true, name: "CageTrap", Asset: "Cage", Color: ['Default', 'Default', '#000000'], Group: "ItemDevices", power: 3, weight: 1, alwaysStruggleable: true,
		Model: "Cage",
		DefaultLock: "Red",
		addTag: ["NoHogtie"],
		tightType: "Secure",
		escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": 0.35, "Pick": 0.33, "Unlock": 0.7},
		helpChance: {"Remove": 0.5, "Pick": 0.5, "Unlock": 1.0},
		enemyTags: {"cage":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Container", "Cages"], ignoreSpells: true, removeOnLeash: true, immobile: true,
		events: [{trigger: "tick", type: "cageDebuff", inheritLinked: true}, {trigger: "tick", type: "callGuardFurniture", inheritLinked: true}, {trigger: "playerMove", type: "removeOnMove", inheritLinked: true}]},
	// Sarcophagus
	{removePrison: true, name: "Sarcophagus", Asset: "DisplayCase", Color: ['Default'], Group: "ItemDevices", power: 10, weight: 1, immobile: true, alwaysStruggleable: true,
		DefaultLock: "Blue",
		Model: "Sarcophagus",
		Filters: {
			SarcoBack: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.06666666666666667,"red":1,"green":1,"blue":1,"alpha":1},
		},
		addTag: ["ForceStand"],
		tightType: "Secure",
		escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": 0.35, "Pick": -0.5, "Unlock": 0.7},
		helpChance: {"Remove": 0.5, "Pick": 0.5, "Unlock": 1.0},
		enemyTags: {"sarcophagus":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Container", "Sarcophagus"], ignoreSpells: true, removeOnLeash: true,
		events: [{trigger: "tick", type: "cageDebuff", inheritLinked: true}, {trigger: "tick", type: "callGuardFurniture", inheritLinked: true, chance: 0.04}, {trigger: "playerMove", type: "removeOnMove", inheritLinked: true}]},
	// Display trap
	{removePrison: true, name: "DisplayTrap", Asset: "TheDisplayFrame", Color: ['Default'], Group: "ItemDevices", power: 5, weight: 1, immobile: true, alwaysStruggleable: true,
		DefaultLock: "Red",
		bindarms: true,
		Model: "DisplayStand",
		restriction: 20,
		tightType: "Secure",
		escapeChance: {"Struggle": -0.1, "Cut": -0.8, "Remove": 0.15, "Pick": -0.1, "Unlock": -0.1},
		helpChance: {"Remove": 0.35, "Pick": 0.25, "Unlock": 0.5},
		//removeShrine: ["Hogties"],
		addTag: ["ForceStand"],
		blockfeet: true,
		enemyTags: {"displaySpell":100, "display": 100, "displaystand": 100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "FeetLinked", "BlockKneel", "DiscourageHogtie"], ignoreSpells: true, removeOnLeash: true,
		events: [{trigger: "tick", type: "cageDebuff", inheritLinked: true}, {trigger: "tick", type: "callGuardFurniture", inheritLinked: true}, {trigger: "playerMove", type: "removeOnMove", inheritLinked: true}]},
	{removePrison: true, name: "DollStand", arousalMode: true, Asset: "OneBarPrison", Color: ['Default'], Group: "ItemDevices", power: 5, weight: 1, immobile: true, alwaysStruggleable: true,
		DefaultLock: "Red",
		Model: "OneBarPrison",
		addTag: ["ForceStand"],
		tightType: "Secure",
		escapeChance: {"Struggle": -0.1, "Cut": -0.6, "Remove": 0.5, "Pick": 0.1, "Unlock": -0.05},
		helpChance: {"Remove": 0.8, "Pick": 0.35, "Unlock": 0.8},
		removeShrine: ["Hogties"],
		events: [{trigger: "tick", type: "callGuardFurniture", time: 300, inheritLinked: true}],
		enemyTags: {"dollstandSpell":100, "dollstand": 100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Dollstand"], ignoreSpells: true, removeOnLeash: true,
	},

	{removePrison: true, name: "OneBar", arousalMode: true, Asset: "OneBarPrison", Color: ['Default'], Group: "ItemDevices", power: 3, weight: 1, immobile: true, alwaysStruggleable: true,
		Model: "OneBarPrison",
		addTag: ["ForceStand"],
		alwaysEscapable: ["Struggle"],
		tightType: "Secure",
		escapeChance: {"Struggle": -0.1, "Cut": -0.6, "Remove": 0.5, "Pick": 0.1, "Unlock": -0.05},
		struggleMinSpeed: {Struggle: .1, Remove: 4, Unlock: 5, Pick: 2},
		helpChance: {"Remove": 0.8, "Pick": 0.35, "Unlock": 0.8},
		removeShrine: ["Hogties"],
		DefaultLock: "White",
		events: [{trigger: "tick", type: "callGuardFurniture", time: 300, inheritLinked: true}],
		enemyTags: {"onebar":1000}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "OneBar"], ignoreSpells: true, removeOnLeash: true,
	},

	{removePrison: true, name: "DollStandSFW", Asset: "TheDisplayFrame", Color: ['Default'], Group: "ItemDevices", power: 5, weight: 1, immobile: true, alwaysStruggleable: true,
		DefaultLock: "Red",
		blockfeet: true,
		Model: "DisplayStand",
		restriction: 20,
		tightType: "Secure",
		escapeChance: {"Struggle": -0.1, "Cut": -0.6, "Remove": 0.5, "Pick": 0.1, "Unlock": -0.05},
		helpChance: {"Remove": 0.8, "Pick": 0.35, "Unlock": 0.8},
		//removeShrine: ["Hogties"],
		events: [{trigger: "tick", type: "callGuardFurniture", time: 300, inheritLinked: true}],
		enemyTags: {"dollstandSpell":100, "dollstand": 100}, playerTags: {"arousalMode": -1000}, minLevel: 0, allFloors: true, shrine: ["Furniture", "FeetLinked", "BlockKneel", "DiscourageHogtie", "Dollstand"], ignoreSpells: true, removeOnLeash: true,
	},
	// Bed trap, always possible to struggle out but takes time
	{removePrison: true, name: "BedTrap", debris: "Belts", Asset: "Bed", Color: ["#523629", "#4c6885", "#808284"], Group: "ItemDevices", power: 2, weight: 1, immobile: true, alwaysStruggleable: true,
		Model: "BondageBed",
		restriction: 10,
		bindarms: true,
		tightType: "Secure",
		escapeChance: {"Struggle": 0.0, "Cut": 0.05, "Remove": 0.05, "Pick": -0.3, "Unlock": -0.3},
		struggleMinSpeed: {"Struggle": 0.025},
		struggleMaxSpeed: {"Struggle": 0.2, "Cut": 0.05, "Remove": 0.2}, helpChance: {"Remove": 0.4, "Pick": 0.5, "Unlock": 1.0},
		limitChance: {"Struggle": 0.01, "Cut": 0, "Remove": 0.01, "Pick": 0, "Unlock": 0},
		alwaysDress: [
			{Item: "BedStraps", Group: "ItemAddon", Color: ['Default'], override: false},
		],
		addTag: ["HandsBehind"],
		enemyTags: {"bed":100}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Furniture", "HandsBehind"], ignoreSpells: true, removeOnLeash: true,
		events: [
			{trigger: "tick", type: "callGuardFurniture", inheritLinked: true},
			{trigger: "playerMove", type: "removeOnMove", inheritLinked: true}
		]},
	//region High security prison restraints
	{inventory: true, name: "HighsecArmbinder", debris: "Belts", strictness: 0.1, Asset: "LeatherArmbinder", inaccessible: true, LinkableBy: [...KDArmbinderLink], renderWhenLinked: [...KDArmbinderLink], Type: "Strap", Group: "ItemArms", bindarms: true, bindhands: 1.0, Color: "#333333",
		limitChance: {"Unlock": 0.2}, power: 7, weight: 2,
		Model: "Jacket",
		factionFilters: {
			BeltsArms: {color: "DarkNeutral", override: true},
			BeltsChest: {color: "DarkNeutral", override: true},
			BeltsLower: {color: "DarkNeutral", override: true},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Armbinders": 3.5,
			"Less_Armbinders": 0.1,
		},
		struggleMaxSpeed: {"Remove": 0.5, "Pick": 0.1},
		escapeChance: {"Struggle": -0.25, "Cut": 0.1, "Remove": 0.15, "Pick": 0.1}, enemyTags: {"highsecRestraints": 10, "leatherRestraintsHeavy":4, "armbinderSpell": 100}, playerTags: {}, minLevel: 8, allFloors: true, shrine: ["Leather", "Armbinders", "Block_ItemHands"]},
	{inventory: true, name: "HighsecBoxbinder", debris: "Belts", strictness: 0.1, Asset: "BoxTieArmbinder", inaccessible: true, LinkableBy: [...KDBoxbinderLink], renderWhenLinked: [...KDBoxbinderLink], Group: "ItemArms", bindarms: true, bindhands: 1.0, Color: "#333333",
		Model: "Jacket",
		factionFilters: {
			BeltsArms: {color: "DarkNeutral", override: true},
			BeltsChest: {color: "DarkNeutral", override: true},
			BeltsLower: {color: "DarkNeutral", override: true},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Boxbinders": 3.5,
			"Less_Boxbinders": 0.1,
		},
		limitChance: {"Unlock": 0.2}, power: 7, weight: 2,
		escapeChance: {"Struggle": -0.28, "Cut": 0.13, "Remove": 0.10, "Pick": 0.1}, enemyTags: {"highsecRestraints": 10, "leatherRestraintsHeavy":4, "armbinderSpell": 10}, playerTags: {},
		struggleMaxSpeed: {"Remove": 0.25, "Pick": 0.08},
		minLevel: 8, allFloors: true, shrine: ["Boxbinders", "Leather", "Block_ItemHands"]},
	{inventory: true, name: "HighsecStraitjacket", debris: "Belts", strictness: 0.2,
		Model: "Jacket",
		factionFilters: {
			BeltsArms: {color: "DarkNeutral", override: true},
			BeltsChest: {color: "DarkNeutral", override: true},
			BeltsLower: {color: "DarkNeutral", override: true},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		Asset: "HighSecurityStraitJacket", Modules: [1, 2, 3], Color: ["#333333", "#333333", '#808080', '#808080'],
		inaccessible: true, LinkableBy: [...KDJacketLink], renderWhenLinked: [...KDJacketLink], Group: "ItemArms", bindarms: true, bindhands: 1.33,
		limitChance: {"Unlock": 0.2}, power: 7, weight: 2,
		struggleMaxSpeed: {"Remove": 0.07, "Pick": 0.04},
		escapeChance: {"Struggle": -0.35, "Cut": 0.09, "Remove": 0.05, "Pick": 0.1}, enemyTags: {"highsecRestraints": 10, "leatherRestraintsHeavy":4, "jacketSpell": 100}, playerTags: {},
		minLevel: 8, allFloors: true, shrine: ["Leather", "Straitjackets", "Block_ItemHands"]},

	{inventory: true, name: "HighsecTransportJacket", debris: "Belts", Asset: "TransportJacket", Color: ["#808080", "#202020", "#808080", "#EEEEEE", "#202020", "#808080"],
		Model: "JacketHeavy",
		LinkableBy: [...KDTransportLink],
		renderWhenLinked: [...KDJacketRender],
		factionFilters: {
			BeltsArms: {color: "DarkNeutral", override: true},
			BeltsChest: {color: "DarkNeutral", override: true},
			BeltsLower: {color: "DarkNeutral", override: true},
		},
		harness: true,
		Group: "ItemArms", power: 10, weight: -1, bindarms: true, bindhands: 1.5, strictness: 0.3,
		unlimited: true,
		limitChance: {"Unlock": 0.1},
		escapeChance: {"Struggle": -0.5, "Cut": 0, "Remove": 0, "Pick": 0},
		enemyTags: {"highsecRestraints": 100, "leatherRestraintsHeavy": 1}, playerTagsMult: {"ItemArmsEmpty": 0.02}, playerTags: {"HighsecStraitjacketWorn": 20}, minLevel: 12, maxwill: 0.1, allFloors: true, shrine: ["Straitjackets", "Block_ItemHands", "TransportJackets", "Leather"]},


	{inventory: true, name: "HighsecShackles", debris: "Chains", Asset: "SteelAnkleCuffs", Type: "Chained", LinkableBy: [...KDBindable, ...KDDevices], Group: "ItemFeet", hobble: 1, Color: ["Default", "Default"], power: 6, weight: 2,
		Model: "Legirons",
		alwaysDressModel: [
			{Model: "AnkleLink"}
		],
		linkCategory: "AnkleCuffs", linkSize: 0.4, noDupe: true,
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 1.1, "Pick": 0.3}, enemyTags: {}, playerTags: {}, minLevel: 7, allFloors: true, shrine: ["Legirons", "Metal", "Cuffs"]},
	{inventory: true, name: "HighsecBallGag", debris: "Belts", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink], factionColor: [[], [0]], Asset: "HarnessBallGag",
		Model: "LargeBallGagHarness",
		events: [
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.35, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.25, requiredTag: "Blindfolds"},
		],
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		factionFilters: {
			Ball: {color: "Highlight", override: false},
		},
		strictness: 0.2, gag: 0.65, Type: "Tight", Color: ["Default", "Default"], Group: "ItemMouth", power: 8, weight: 2,
		escapeChance: {"Struggle": -0.25, "Cut": -0.05, "Remove": 0.18, "Pick": 0.25}, enemyTags: {"highsecRestraints": 10, forceAntiMagic: -100, "ballGagRestraints" : 4, "gagSpell": 100}, playerTags: {}, minLevel: 5, allFloors: true, shrine: ["BallGags", "Leather", "Gags"]},
	{inventory: true, name: "HighsecMuzzle", debris: "Belts", inaccessible: true, LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], factionColor: [[], [0]], Asset: "MuzzleGag",
		Model: "MuzzleGagHarnessSecure",
		events: [
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.35, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.25, requiredTag: "Blindfolds"},
		],
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		strictness: 0.2, gag: 0.6, Color: ["Default", "Default"], Group: "ItemMouth", power: 8, weight: 2,
		escapeChance: {"Struggle": -0.35, "Cut": -0.1, "Remove": 0.22, "Pick": 0.2}, enemyTags: {"highsecRestraints": 1, forceAntiMagic: -100, "leatherRestraintsHeavy" : 4}, playerTags: {}, minLevel: 7, allFloors: true, shrine: ["FlatGags", "Leather", "Gags"]},

	{renderWhenLinked: [...KDLegbinderRender], inventory: true, name: "HighsecLegbinder", debris: "Belts", Asset: "LegBinder", inaccessible: true,
		LinkableBy: [...KDLegbinderLink], Color: "Default", Group: "ItemLegs", blockfeet: true,
		Model: "Legbinder",
		Filters: {
			Laces: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":3.35,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Binder: {color: "DarkNeutral", override: true},
			Laces: {color: "Highlight", override: true},
		},
		affinity: {Remove: ["Hook"], Struggle: ["Hook"],},
		maxwill: 0.1,
		struggleMult: {Struggle: 0.4},
		struggleMaxSpeed: {Struggle: 0.15},
		power: 8, weight: 2, escapeChance: {"Struggle": -0.1, "Cut": 0.1, "Remove": 0.35, "Pick": 0.25}, enemyTags: {"highsecRestraints": 10, "legbinderSpell": 1, "leatherRestraintsHeavy" : 1}, playerTags: {}, minLevel: 0, allFloors: true,
		shrine: ["Leather", "Legbinders"]},


	{inventory: true, arousalMode: true, name: "PrisonBelt", Asset: "PolishedChastityBelt", OverridePriority: 26, Color: "#444444", Group: "ItemPelvis", chastity: true,
		Security: {
			level_key: 2,
			level_tech: 1,
		},
		Model: "SteelChastityBelt_Padlock",
		LinkableBy: ["Wrapping", "Ornate"],
		factionFilters: {
			Lock: {color: "Highlight", override: true},
			BaseMetal: {color: "DarkNeutral", override: false},
		},
		Filters: {
			BaseMetal: {"gamma":0.8999999999999999,"saturation":0.0,"contrast":3.1666666666666665,"brightness":0.6166666666666667,"red":1.0166666666666666,"green":1,"blue":1,"alpha":1},
		},
		power: 8, weight: 2, escapeChance: {"Struggle": -0.5, "Cut": -0.30, "Remove": 100.0, "Pick": 0.25}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Chastity", "Metal", "ChastityBelts"]},
	{inventory: true, arousalMode: true, name: "PrisonBelt2", Asset: "OrnateChastityBelt", OverridePriority: 26, Color: ["#272727", "#AA0000"], Group: "ItemPelvis", chastity: true,
		Security: {
			level_key: 3,
			level_magic: 2,
		},
		Model: "SteelChastityBelt_Segu",
		LinkableBy: ["Wrapping"],
		factionFilters: {
			Lock: {color: "Highlight", override: true},
			BaseMetal: {color: "DarkNeutral", override: true},
		},
		Filters: {
			Lock: {"gamma":1,"saturation":0.06666666666666667,"contrast":2.1333333333333333,"brightness":1.6500000000000001,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
			Lining: {"gamma":1,"saturation":0.06666666666666667,"contrast":2.1333333333333333,"brightness":1.6500000000000001,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
			BaseMetal: {"gamma":1,"saturation":0.06666666666666667,"contrast":0.7833333333333334,"brightness":0.48333333333333334,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
		},
		power: 9, weight: 2, escapeChance: {"Struggle": -0.5, "Cut": -0.30, "Remove": 100.0, "Pick": 0.22}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Chastity", "Metal", "ChastityBelts", "Ornate"]},
	//endregion

	//region Trap items. Note that traps do not respect stamina, so its okay for these to have reasonable maxwill
	{alwaysRender: true, inventory: true, name: "TrapArmbinderHarness", debris: "Belts", Asset: "LeatherHarness", accessible: true, Color: "Default", Group: "ItemTorso", OverridePriority: 26, LinkableBy: [...KDHarnessLink], power: 3, strictness: 0.1,
		weight: 0,
		restriction: 2,
		Model: "JacketStraps",
		factionFilters: {
			BeltsArms: {color: "Highlight", override: true},
			BeltsChest: {color: "Highlight", override: true},
			BeltsLower: {color: "Highlight", override: true},
		},
		harness: true,
		escapeChance: {"Struggle": -0.1, "Cut": 0.25, "Remove": 0.25, "Pick": 0.15},
		enemyTags: {"leatherRestraintsHeavy":2, "armbinderSpell": 100, "harnessSpell": 1, "binderharnessSpell": 10}, playerTags: {"ItemArmsEmpty": -1000, "Armbinders": 8, "Boxbinders": 8}, playerTagsMissing: {"Armbinders": -8, "Boxbinders": -8},
		enemyTagsMult: {"backup_harness": 0.05},
		minLevel: 4, allFloors: true, shrine: ["ArmbinderHarness", "Leather"],
		maxwill: 0.6, events: [{trigger: "postRemoval", type: "armbinderHarness"}], requireSingleTagToEquip: ["Armbinders", "Boxbinders"]},
	{renderWhenLinked: [...KDArmbinderLink], inventory: true, trappable: true, name: "TrapArmbinder", debris: "Belts", inaccessible: true, strictness: 0.1, Asset: "LeatherArmbinder", LinkableBy: [...KDArmbinderLink], Type: "WrapStrap", Group: "ItemArms", Color: "Default", bindarms: true, bindhands: 1.0, power: 6, weight: 2,
		Model: "ArmbinderCross",
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Armbinders": 3.5,
			"Less_Armbinders": 0.1,
		},
		limitChance: {"Struggle": 0.15, "Cut": 0.1, "Unlock": 0.2},
		maxwill: 0.25, escapeChance: {"Struggle": 0.11, "Cut": 0.4, "Remove": 0.3, "Pick": 0.5}, enemyTags: {"trap":100, "leatherRestraintsHeavy":6, "armbinderSpell": 100}, playerTags: {}, minLevel: 4, allFloors: true, shrine: ["Leather", "Armbinders", "Block_ItemHands"]},

	{renderWhenLinked: [...KDLegbinderRender], inventory: true, name: "TrapLegbinder", debris: "Belts", Asset: "LegBinder", inaccessible: true,
		LinkableBy: [...KDLegbinderLink], Color: "Default", Group: "ItemLegs", blockfeet: true,
		Model: "Legbinder",
		factionFilters: {
			Binder: {color: "DarkNeutral", override: true},
			Laces: {color: "Highlight", override: true},
		},
		maxwill: 0.1,
		affinity: {Remove: ["Hook"], Struggle: ["Hook"],},
		struggleMaxSpeed: {Struggle: 0.1, Cut: 0.3, Remove: 0.1},
		struggleMult: {Struggle: 0.34},
		speedMult: {Struggle: 0.25},
		power: 6, weight: 2, escapeChance: {"Struggle": .11, "Cut": 0.3, "Remove": 0.25, "Pick": 0.5}, enemyTags: {"trap":100, "leatherRestraintsHeavy":6, "legbinderSpell": 10}, playerTags: {}, minLevel: 6, allFloors: true,
		shrine: ["Leather", "Legbinders"]},

	{renderWhenLinked: ["Belts"], inventory: true, trappable: true, name: "TrapBoxbinder", debris: "Belts", inaccessible: true, strictness: 0.075, Asset: "BoxTieArmbinder",
		Model: "ArmbinderCross",
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Boxbinders": 3.5,
			"Less_Boxbinders": 0.1,
		},
		LinkableBy: [...KDBoxbinderLink], Group: "ItemArms", Color: ["Default", "Default"],
		bindarms: true, bindhands: 1.0, power: 6, weight: 2,
		limitChance: {"Struggle": 0.15, "Cut": 0.1, "Unlock": 0.2},
		maxwill: 0.25,
		escapeChance: {"Struggle": -0.05, "Cut": 0.4, "Remove": 0.4, "Pick": 0.45},
		enemyTags: {"trap":100, "leatherRestraintsHeavy":6, "armbinderSpell": 10},
		playerTags: {}, minLevel: 4, allFloors: true, shrine: ["Boxbinders", "Leather", "Block_ItemHands"]},
	{inventory: true, trappable: true, name: "TrapYoke", Asset: "Yoke", accessible: true, Group: "ItemArms",
		Model: "SteelYoke",
		playerTagsMult: {
			"More_Yokes": 3.5,
			"Less_Yokes": 0.1,
		},
		restriction: 10,
		Color: "Default", bindarms: true, restricthands: 0.85, power: 6, weight: 0, DefaultLock: "Red",
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 10, "Pick": -0.15, "Unlock": -0.15},
		helpChance: {"Pick": 0.5, "Unlock": 1.0}, enemyTags: {"trap":9, "yokeSpell": 10, "Unchained": -9, "steelbondage": 10, "onebar":1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Yokes", "Yoked"]},
	{inventory: true, trappable: true, name: "HeavyYoke", Asset: "Yoke", accessible: true, Group: "ItemArms",
		Model: "HeavyYoke",
		playerTagsMult: {
			"More_Yokes": 3.5,
			"Less_Yokes": 0.1,
		},
		restriction: 10,
		Color: "Default", bindarms: true, restricthands: 0.85, power: 9, weight: 0, DefaultLock: "Disc",
		escapeChance: {"Struggle": -1, "Cut": -0.8, "Remove": 0.4, "Pick": -0.25, "Unlock": -0.25},
		helpChance: {"Pick": 0.25, "Unlock": 0.33}, enemyTags: {"trap":14, "yokeSpell": 50, "Unchained": -25, "steelbondage": 10, "onebar":1}, playerTags: {}, minLevel: 7, allFloors: true, shrine: ["Metal", "Yokes", "Yoked"]},
	{inventory: true, trappable: true, name: "TrapFiddle", Asset: "Yoke", accessible: true, Group: "ItemArms",
		Model: "HeavyFiddle",
		playerTagsMult: {
			"More_Yokes": 3.5,
			"Less_Yokes": 0.1,
		},
		restriction: 10,
		Color: "Default", bindarms: true, restricthands: 0.75, power: 6, weight: 0, DefaultLock: "Red",
		escapeChance: {"Struggle": -0.6, "Cut": -0.55, "Remove": 4, "Pick": -0.13, "Unlock": -0.09},
		helpChance: {"Pick": 0.4, "Unlock": 1.0}, enemyTags: {"trap":9, "yokeSpell": 4, "fiddle": 14, "Unchained": -9, "steelbondage": 10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Fiddles"]},
	{alwaysRender: true, inventory: true, trappable: true, name: "TrapHarness", debris: "Belts", strictness: 0.05, Asset: "LeatherStrapHarness", accessible: true,
		Model: "Harness",
		harness: true,
		restriction: 2,
		LinkableBy: [...KDHarnessLink], OverridePriority: 26, Color: "#222222", Group: "ItemTorso", power: 2, weight: 2,
		escapeChance: {"Struggle": -0.15, "Cut": 0.3, "Remove": 0.8, "Pick": 0.4}, enemyTags: {"trap":100, "leatherRestraints":6, "harnessSpell": 10},
		enemyTagsMult: {"backup_harness": 0.05},
		playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Harnesses"]},
	{alwaysRender: true, inventory: true, trappable: true, name: "PVCHarness", debris: "Belts", strictness: 0.07, Asset: "LeatherStrapHarness", accessible: true,
		Model: "Harness",
		harness: true,
		factionFilters: {
			Straps: {color: "LightNeutral", override: true},
		},
		restriction: 2,
		Filters: {
			Hardware: {"gamma":0.11666666666666667,"saturation":1,"contrast":1.6166666666666665,"brightness":2.45,"red":1,"green":1,"blue":1,"alpha":1},
		},
		LinkableBy: [...KDHarnessLink], OverridePriority: 26, Color: "#222222", Group: "ItemTorso", power: 2, weight: 2,
		escapeChance: {"Struggle": -0.1, "Cut": 0.35, "Remove": 0.8, "Pick": 0.25}, enemyTags: {"latexRestraints":6, "harnessSpell": 1},
		enemyTagsMult: {"backup_harness": 0.05},
		playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Harnesses"]},
	{inventory: true, trappable: true, name: "TrapGag", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink], Asset: "BallGag",
		Model: "BallGag",
		quickBindCondition: "BallGag", quickBindMult: 0.5,
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		events: [{trigger: "postRemoval", type: "replaceItem", requireFlag: "Struggle", list: ["GagNecklace"], keepLock: true, power: 1, msg: "KDGagNecklaceOn"}],
		factionFilters: {
			Ball: {color: "Highlight", override: false},
		},
		factionColor: [[], [0]], gag: 0.35, Type: "Tight", Color: ["Default", "Default"], Group: "ItemMouth", power: 3, weight: 2,
		maxwill: 0.6, escapeChance: {"Struggle": 0.25, "Cut": 0.45, "Remove": 0.3, "Pick": 0.4}, enemyTags: {"trap":100, "leatherRestraintsHeavy":6, "gagSpell": 8, forceAntiMagic: -100}, playerTags: {}, minLevel: 0, maxLevel: 5, allFloors: true,
		shrine: ["BallGags", "Leather", "Gags"]},
	{inventory: true, trappable: true, name: "TrapGagLarge", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink], Asset: "BallGag",
		Model: "LargeBallGag",
		quickBindCondition: "BallGag", quickBindMult: 0.5,
		events: [{trigger: "postRemoval", type: "replaceItem", requireFlag: "Struggle", list: ["GagNecklace"], keepLock: true, power: 1, msg: "KDGagNecklaceOn"}],
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		factionColor: [[], [0]], gag: 0.35, Type: "Tight", Color: ["Default", "Default"], Group: "ItemMouth", power: 4.5, weight: 2,
		maxwill: 0.6, escapeChance: {"Struggle": 0.25, "Cut": 0.45, "Remove": 0.3, "Pick": 0.4}, enemyTags: {"trap":100, forceAntiMagic: -100, "leatherRestraintsHeavy":8, "gagSpell": 12}, playerTags: {}, minLevel: 3, allFloors: true,
		shrine: ["BallGags", "Leather", "Gags"]},

	{inventory: true, trappable: true, name: "TrapBlindfold", debris: "Belts", Asset: "LeatherBlindfold", LinkableBy: [...KDBlindfoldLink], renderWhenLinked: [...KDBlindfoldLink], Color: "Default", Group: "ItemHead",
		power: 3, weight: 2,
		Model: "BlindfoldLeather",
		/*Filters: {
			Blindfold: {"gamma":1,"saturation":1,"contrast":1.8833333333333333,"brightness":0.48333333333333334,"red":1,"green":1,"blue":1,"alpha":1},
			Rim: {"gamma":1,"saturation":1,"contrast":0.8333333333333333,"brightness":3.1333333333333337,"red":2.5166666666666666,"green":1.1166666666666667,"blue":1.9666666666666666,"alpha":1},
		},*/
		factionFilters: {
			Blindfold: {color: "DarkNeutral", override: true},
			Rim: {color: "Highlight", override: true},
		},
		maxwill: 0.5, blindfold: 3, escapeChance: {"Struggle": 0.4, "Cut": 0.6, "Remove": 0.3, "Pick": 0.4},
		enemyTags: {"trap":100, "leatherRestraints":6, "blindfoldSpell": 10},
		playerTags: {NoBlindfolds: -1000}, minLevel: 4, allFloors: true, shrine: ["Leather", "Blindfolds"]},
	{inventory: true, trappable: true, name: "TrapBoots", debris: "Belts", Asset: "BalletHeels", Color: "Default", Group: "ItemBoots", heelpower: 1, power: 3, weight: 2,
		remove: ["Shoes"],
		Model: "BalletHeelsRestraint",
		maxwill: 0.9, escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.4, "Pick": 0.4}, enemyTags: {"trap":100, "leatherHeels": 8}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Heels", "Leather", "Boots", "Heels"]},
	{inventory: true, trappable: true, name: "TrainingHeels", debris: "Belts", Asset: "BalletHeels", Color: "Default", Group: "ItemBoots", heelpower: 1, power: 5, weight: 0,
		alwaysKeep: true,
		DefaultLock: "HiSec",
		remove: ["Shoes"],
		Model: "BalletHeelsRestraint",
		escapeChance: {"Struggle": -0.5, "Cut": 0.1, "Remove": 10, "Pick": 0.0}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Heels", "Boots"]},

	{inventory: true, trappable: true, name: "TrapLegirons", debris: "Chains", Asset: "Irish8Cuffs", LinkableBy: ["Wrapping", "Encase", "Belts"], Color: "Default", Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],
		power: 4, weight: 2,
		struggleBreak: true,
		Model: "Legirons",
		linkCategory: "AnkleCuffs", linkSize: 0.51, noDupe: true, playerTagsMissingMult: {"ItemLegsFull":0.05},
		sfxGroup: "Handcuffs",
		escapeChance: {"Struggle": -0.5, "Cut": -0.4, "Remove": 10, "Pick": 0.5}, enemyTags: {"trap":100, "cuffsSpell": 7}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Legirons", "Metal", "Cuffs"]},

	{inventory: true, arousalMode: true, trappable: true, name: "TrapBelt", Asset: "PolishedChastityBelt", OverridePriority: 26, Color: "Default", Group: "ItemPelvis", chastity: true,
		power: 5, weight: 0, DefaultLock: "Red",
		Security: {
			level_key: 2,
		},
		Model: "HeartBelt",
		LinkableBy: ["Wrapping", "Ornate"],
		factionFilters: {
			Lining: {color: "Highlight", override: true},
			Lock: {color: "Highlight", override: true},
		},
		Filters: {
			Lining: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		},
		maxwill: 0.75, escapeChance: {"Struggle": -0.5, "Cut": -0.10, "Remove": 10.0, "Pick": 0.35}, enemyTags: {"trap":10, 'machineChastity': 2, "maidRestraints": 6, "maidRestraintsLight": 6, "genericChastity": 12, "chastitySpell": 10,}, playerTags: {"ItemVulvaEmpty" : -4, "ItemVulvaPiercingsEmpty" : -4}, minLevel: 0, allFloors: true, shrine: ["Chastity", "Metal", "ChastityBelts"]},
	{inventory: true, arousalMode: true, trappable: true, name: "BlacksteelBelt", Asset: "PolishedChastityBelt", OverridePriority: 26, Color: "#333333", Group: "ItemPelvis", chastity: true,
		power: 10, weight: 0, DefaultLock: "Blue",
		Security: {
			level_key: 2,
		},
		Model: "SteelChastityBelt_Padlock",
		LinkableBy: ["Wrapping", "Ornate"],
		factionFilters: {
			Lock: {color: "Highlight", override: true},
			BaseMetal: {color: "DarkNeutral", override: false},
		},
		Filters: {
			Lock: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Lining: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BaseMetal: {"gamma":1,"saturation":0.8500000000000001,"contrast":3.3833333333333333,"brightness":0.43333333333333335,"red":1,"green":1,"blue":1,"alpha":1},
		},
		maxwill: 0.75, escapeChance: {"Struggle": -0.6, "Cut": -0.50, "Remove": 10.0, "Pick": 0.2}, enemyTags: {"trap":10, 'machineChastity': 2, "maidRestraints": 9, "maidRestraintsLight": 6, "genericChastity": 32, "blacksteelRestraints": 12, "blacksteelchastity": 50, "chastitySpell": 30,}, playerTags: {"ItemVulvaEmpty" : -4, "ItemVulvaPiercingsEmpty" : -4}, minLevel: 9, allFloors: true, shrine: ["Chastity", "Metal", "ChastityBelts"]},
	{inventory: true, arousalMode: true, trappable: true, name: "BlacksteelBra", Asset: "FuturisticBra2", OverridePriority: 26, Color: ['#333333', '#999999', '#333333', '#333333', '#999999', '#333333'], Group: "ItemBreast",
		Model: "SteelChastityBra_Padlock",
		factionFilters: {
			Lock: {color: "Highlight", override: true},
			BaseMetal: {color: "DarkNeutral", override: true},

		},
		Filters: {
			Lock: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Lining: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Steel: {"gamma":1,"saturation":0.8500000000000001,"contrast":3.3833333333333333,"brightness":0.43333333333333335,"red":1,"green":1,"blue":1,"alpha":1},
		},
		chastitybra: true, power: 7, weight: 0, DefaultLock: "Blue",
		Security: {
			level_tech: 1,
			level_key: 2,
		},
		escapeChance: {"Struggle": -0.6, "Cut": -0.5, "Remove": 10.0, "Pick": 0.1}, enemyTags: {"genericChastity": 8, "blacksteelRestraints": 4, "blacksteelBra": 8, "blacksteelchastity": 25, "roboAngry": 6},
		playerTags: {"FreeBoob": -1000}, minLevel: 9, allFloors: true, shrine: ["ChastityBras", "Chastity", "Metal", "Ornate"]},


	{inventory: true, arousalMode: true, trappable: true, name: "MagicBelt", Asset: "PolishedChastityBelt", OverridePriority: 26, Color: "#8f60b1", Group: "ItemPelvis", chastity: true,
		power: 7, weight: 0,
		Security: {
			level_magic: 1,
		},
		npcBondageMult: 4,
		npcBondageType: "Magic",
		Model: "HeartBelt",
		LinkableBy: ["Wrapping", "Ornate"],
		factionFilters: {
			Lining: {color: "Highlight", override: true},
			Lock: {color: "Highlight", override: true},
		},
		Filters: {
			Lock: {"gamma":1,"saturation":0.08333333333333333,"contrast":1,"brightness":1,"red":1.5666666666666669,"green":1,"blue":2.5333333333333337,"alpha":1},
			Lining: {"gamma":1,"saturation":0.08333333333333333,"contrast":1,"brightness":1,"red":1.5666666666666669,"green":1,"blue":2.5333333333333337,"alpha":1},
			Steel: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":2.5333333333333337,"alpha":1},
		},
		maxwill: 0.75, escapeChance: {"Struggle": -1.0, "Cut": -0.10, "Remove": 10.0, "Pick": 0.5}, magic: true, DefaultLock: "Purple",
		enemyTags: {"magicBelt": 4, "magicBeltForced": 10, "chastitySpell": 5,}, playerTags: {"ItemVulvaEmpty" : -4, "ItemVulvaPiercingsEmpty" : -4}, minLevel: 12, allFloors: true, shrine: ["Chastity", "Metal", "ChastityBelts"]},
	{inventory: true, arousalMode: true, name: "TrapBeltProto", Asset: "FuturisticChastityBelt", Modules: [3, 1, 1, 1, 1], OverridePriority: 26, Color: ['#5E5E6B', '#4A5FC1', '#CD9F0E', '#43B2BA', '#A68009', '#F8BD01', '#3868E8', '#A68009', '#FFC81D'],
		Group: "ItemPelvis", chastity: true, power: 15, weight: 0, DefaultLock: "Red",
		Security: {
			level_tech: 1,
			level_key: 3,
		},
		npcBondageMult: 3,
		Model: "ProtoBelt",
		factionFilters: {
			Lining: {color: "DarkNeutral", override: true},
			Metal: {color: "LightNeutral", override: true},
			Display: {color: "Highlight", override: false},
			Plug: {color: "Highlight", override: true},
		},
		LinkableBy: ["Wrapping", "Ornate"],
		Filters: {
			Lock: {"gamma":1,"saturation":0.06666666666666667,"contrast":2.1333333333333333,"brightness":1.6500000000000001,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
			Lining: {"gamma":1,"saturation":0.06666666666666667,"contrast":1.7833333333333334,"brightness":1,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
			Steel: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":3.1666666666666665,"brightness":0.6166666666666667,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
		},
		maxwill: 0.75, escapeChance: {"Struggle": -0.8, "Cut": -0.50, "Remove": 1.0, "Pick": -0.1}, enemyTags: {"protoRestraints": 10, 'machineChastity': 8, "roboAngry": 10}, playerTags: {"ItemVulvaEmpty" : -5, "ItemVulvaPiercingsEmpty" : -5}, minLevel: 7, allFloors: true, shrine: ["Chastity", "Metal", "ChastityBelts"]},
	{inventory: true, arousalMode: true, trappable: true, name: "TrapBra", Asset: "PolishedChastityBra", debris: "Chains", OverridePriority: 26, Color: "Default", Group: "ItemBreast", LinkableBy: ["Ornate"], chastitybra: true,
		Model: "ChastityBra",
		factionFilters: {
			Lining: {color: "Highlight", override: true},
		},
		Filters: {
			Lining: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		},
		power: 4, weight: 0, DefaultLock: "Red",
		Security: {
			level_key: 2,
		},
		maxwill: 0.75, escapeChance: {"Struggle": -0.5, "Cut": -0.10, "Remove": 10.0, "Pick": 0.35}, enemyTags: {"trap":10, "maidRestraints": 6, "maidRestraintsLight": 6, "genericChastity": 10},
		playerTags: {"ItemNipplesEmpty" : -5, "FreeBoob": -1000}, minLevel: 0, allFloors: true, shrine: ["ChastityBras", "Chastity", "Metal"]},



	{inventory: true, trappable: true, name: "TrapMittens", debris: "Belts", inaccessible: true, Asset: "LeatherMittens", Color: "Default", Group: "ItemHands", bindhands: 1.0, power: 4, weight: 0, LinkableBy: [...KDGlovesLink],
		Model: "LeatherMittens",
		Filters: {
			Lock: {"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Band: {"gamma":0.43333333333333335,"saturation":1,"contrast":1.1833333333333333,"brightness":0.5166666666666666,"red":1,"green":1,"blue":1,"alpha":1},
			Mitten: {"gamma":0.9166666666666666,"saturation":1,"contrast":3,"brightness":0.06666666666666667,"red":1,"green":1,"blue":1,"alpha":1},
		},
		maxwill: 0.5, escapeChance: {"Struggle": 0.05, "Cut": 0.4, "Remove": 0.15, "Pick": 1.0}, enemyTags: {"leatherRestraints":6, "mittensSpell": 10}, playerTags: {"ItemHandsFull":-2}, minLevel: 4, allFloors: true, shrine: ["Mittens", "Leather"]},
	// These ones are tougher
	{inventory: true, arousalMode: true, trappable: true, name: "TrapBelt2", Asset: "OrnateChastityBelt", OverridePriority: 26, Color: ["#272727", "#D3B24B"], Group: "ItemPelvis", chastity: true,
		power: 9, weight: 0, DefaultLock: "Gold",
		Security: {
			level_magic: 2,
			level_key: 3,
		},
		Model: "SteelChastityBelt_Radial",
		LinkableBy: ["Wrapping", "Ornate"],
		factionFilters: {
			Lock: {color: "Highlight", override: true},
			Lining: {color: "Highlight", override: true},
			BaseMetal: {color: "LightNeutral", override: false},
		},
		Filters: {
			Lock: {"gamma":1,"saturation":0.06666666666666667,"contrast":1.6833333333333333,"brightness":0.6666666666666666,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
			Lining: {"gamma":1,"saturation":0.06666666666666667,"contrast":2.1333333333333333,"brightness":1.6500000000000001,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
			BaseMetal: {"gamma":1,"saturation":0.06666666666666667,"contrast":0.7833333333333334,"brightness":0.48333333333333334,"red":2.15,"green":1.7166666666666666,"blue":1.0166666666666666,"alpha":1},
		},
		escapeChance: {"Struggle": -0.5, "Cut": -0.125, "Remove": 10.0, "Pick": 0.1}, enemyTags: {"genericChastity": 8, "ornateChastity": 8}, playerTags: {}, minLevel: 4, allFloors: true, shrine: ["Chastity", "Metal", "ChastityBelts", "Ornate"]},
	{inventory: true, arousalMode: true, trappable: true, name: "TrapBra2", Asset: "FuturisticBra2", OverridePriority: 26, Color: ['#5E5E6B', '#F8BD01', '#5E5E6B', '#5E5E6B', '#F8BD01', '#5E5E6B'], Group: "ItemBreast",
		chastitybra: true, power: 9, weight: 0, DefaultLock: "Gold",
		Security: {
			level_magic: 2,
			level_key: 3,
		},
		Model: "SteelChastityBra_Radial",
		factionFilters: {
			Display: {color: "Highlight", override: false},
			Lining: {color: "Highlight", override: true},
			BaseMetal: {color: "LightNeutral", override: true},
			Cups: {color: "DarkNeutral", override: true},
		},
		/*Filters: {
			Lining: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":1,"red":2.5333333333333337,"green":1.9,"blue":1,"alpha":1},
			Chain: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":1,"red":2.5333333333333337,"green":1.9,"blue":1,"alpha":1},
			Lock: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":1,"red":2.5333333333333337,"green":1.9,"blue":1,"alpha":1},
			Steel: {"gamma":1,"saturation":0.8500000000000001,"contrast":3.3833333333333333,"brightness":0.43333333333333335,"red":1,"green":1,"blue":1,"alpha":1},
		},*/
		escapeChance: {"Struggle": -0.5, "Cut": -0.125, "Remove": 10.0, "Pick": 0.1}, enemyTags: {"genericChastity": 8, "ornateChastity": 8, "roboAngry": 10},
		playerTags: {"FreeBoob": -1000}, minLevel: 4, allFloors: true, shrine: ["ChastityBras", "Chastity", "Metal", "Ornate"]},
	//endregion

	// Toys

	{renderWhenLinked: ["Chastity"], inventory: true, arousalMode: true, name: "WolfPanties", debris: "Belts", inaccessible: true, Asset: "SciFiPleasurePanties", strictness: 0.05, Color: ["#4F91DE", "#2E2E2E", "#3b7d4f", "#2f5753", "#4F91DE", "#4F91DE", "#000000"] ,Group: "ItemPelvis", LinkableBy: ["Chastity"], power: 4,
		Model: "WolfPantiesRestraint",
		limited: true,
		Filters: {
			Panties: {"gamma":1,"saturation":2.3000000000000003,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		},
		weight: 0, escapeChance: {"Struggle": 0.05, "Cut": 0.3, "Remove": 0.05, "Pick": 0.35}, escapeMult: 3.0, vibeLocation: "ItemVulva",
		linkedVibeTags: ["teaser"], allowRemote: true, events: [
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 2, time: 20, edgeOnly: true},
			{trigger:"tick",  type: "PeriodicTeasing", power: 1, time: 48, edgeOnly: true, cooldown: {"normal": 120, "tease": 20}, chance: 0.02},
			{trigger:"tick",  type: "PeriodicDenial", power: 2, time: 42, edgeOnly: true, cooldown: {"normal": 100, "tease": 20}, chance: 0.03},
			{trigger:"tick",  type: "PeriodicTeasing", power: 3, time: 14, edgeOnly: false, cooldown: {"normal": 140, "tease": 20}, chance: 0.01},
		],
		maxwill: 0.5, enemyTags: {"wolfRestraints" : 6, "wolfGear":6}, playerTags: {"ItemPelvisFull": -5, "NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Latex", "Panties", "Vibes", "Toys"]},


	// Nipple vibes - these generally trigger on attack
	{inventory: true, arousalMode: true, name: "NippleClamps", Asset: "HeartPasties", Color: "Default", Group: "ItemNipples", power: 3, weight: 0,
		vibeLocation: "ItemNipples",
		Model: "NippleClamps",
		limited: true,
		escapeChance: {"Struggle": -10, "Cut": -0.05, "Remove": 0.5, "Pick": 0.25}, failSuffix: {"Struggle": "Clamps"},
		maxwill: 1.0, enemyTags: {"dressRestraints" : 5, "toyTease": 2, "genericToys": 5, "maidRestraints": 3, "maidRestraintsLight": 1, "roboAngry": 10, "teasetoys": 3}, playerTags: {"NoVibes": -1000}, minLevel: 0, maxLevel: 8, allFloors: true, shrine: ["Vibes", "Toys"], linkedVibeTags: ["teaser", "piercings"],
		allowRemote: true, events: [
			{trigger:"playerAttack",  type: "MotionSensitive", chance: 0.5, msg: "KDPunishAttack", inheritLinked: true},
			{trigger:"punish", type: "PunishSelf", power: 1, time: 24, edgeOnly: true, inheritLinked: true},
		]},
	{inventory: true, arousalMode: true, name: "NippleClamps2", Asset: "HeartPasties", Color: "Default", Group: "ItemNipples", power: 4, weight: 0,
		vibeLocation: "ItemNipples",
		Model: "VibePiercings",
		limited: true,
		escapeChance: {"Struggle": -10, "Cut": -0.05, "Remove": 0.5, "Pick": 0.25}, failSuffix: {"Struggle": "Clamps"},
		maxwill: 0.25, enemyTags: {"dressRestraints" : 3, "genericToys": 3, "maidRestraints": 2, "maidRestraintsLight": 1, "roboAngry": 10, "toyTeaseMid": 2, "teasetoys": 2}, playerTags: {"NoVibes": -1000}, minLevel: 4, allFloors: true, shrine: ["Vibes", "Toys", "Piercings"], linkedVibeTags: ["teaser", "piercings"],
		allowRemote: true, events: [
			{trigger:"playerAttack",  type: "MotionSensitive", chance: 0.5, msg: "KDPunishAttack", inheritLinked: true},
			{trigger:"struggle",  type: "VibeOnStruggle", chance: 0.5, msg: "KDPunishStruggle", inheritLinked: true},
			{trigger:"punish", type: "PunishSelf", power: 1, time: 24, edgeOnly: true, inheritLinked: true},
		]},
	{inventory: true, arousalMode: true, name: "NippleWeights", Asset: "HeartPasties", Color: "Default", Group: "ItemNipples", power: 4, weight: 0,
		Model: "NippleWeights",
		limited: true,
		escapeChance: {"Struggle": -10, "Cut": -0.05, "Remove": 0.5, "Pick": 0.25}, failSuffix: {"Struggle": "Clamps"},
		maxwill: 1.0, enemyTags: {"obsidianRestraints" : 3, "bandit": 0.1, "genericToys": 1, "toyTease": 2}, playerTags: {"NoVibes": -1000}, minLevel: 3, allFloors: true, shrine: ["Weights", "Toys"],
		allowRemote: true, events: [
			{trigger:"sprint",  type: "NippleWeights", chance: 0.5, mult: 0.25, msg: "KDNippleWeights", inheritLinked: true},
			{trigger:"playerAttack",  type: "NippleWeights", chance: 0.25, msg: "KDNippleWeights", mult: 0.25, power: 2.0, inheritLinked: true},
			{trigger:"playerCast",  type: "NippleWeights", chance: 1.0, msg: "KDNippleWeights", power: 1.5, inheritLinked: true},
		]},
	{inventory: true, arousalMode: true, name: "NippleClamps3", Asset: "HeartPasties", Color: "Default", Group: "ItemNipples", power: 5, weight: 0,
		LinkableBy: ["Weights"],
		vibeLocation: "ItemNipples",
		Model: "RingVibes",
		limited: true,
		escapeChance: {"Struggle": -10, "Cut": -0.05, "Remove": 0.5, "Pick": 0.25}, failSuffix: {"Struggle": "Clamps"},
		maxwill: 0.25, enemyTags: {"dressRestraints" : 1, "genericToys": 1, "maidRestraints": 1, "roboAngry": 10, "teasetoys": 1, "toyTeaseIntense": 2}, playerTags: {"NoVibes": -1000}, minLevel: 8, allFloors: true, shrine: ["Vibes", "Toys"], linkedVibeTags: ["teaser", "piercings"],
		allowRemote: true, events: [
			{trigger:"playerAttack",  type: "MotionSensitive", chance: 1.0, msg: "KDPunishAttack", inheritLinked: true},
			{trigger:"struggle",  type: "VibeOnStruggle", chance: 1.0, msg: "KDPunishStruggle", inheritLinked: true},
			{trigger:"sprint",  type: "MotionSensitive", chance: 0.5, msg: "KDPunishSprint", inheritLinked: true},
			{trigger:"punish", type: "PunishSelf", power: 1, time: 24, edgeOnly: true, inheritLinked: true},
		]},

	// Vibrators - These generally trigger on magic
	{inventory: true, arousalMode: true, name: "TrapVibe", Asset: "TapedClitEgg", Color: "Default", Group: "ItemVulvaPiercings", power: 1, weight: 2,
		failSuffix: {"Struggle": "Egg"},
		limited: true,
		escapeChance: {"Struggle": 0.15}, enemyTags: {"trap":100, "maidRestraintsLight": 5, "genericToys": 2, "teasetoys": 2, "toyTease": 2}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Vibes", "Toys"], linkedVibeTags: ["teaser"], vibeLocation: "ItemVulvaPiercings",
		allowRemote: true, events: [
			{trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true}, // Harder to remove by crotch rope
			{trigger:"playerCast",  type: "MagicallySensitive"},
			{trigger:"punish", type: "PunishSelf", power: 1, time: 24, edgeOnly: true},
		]},
	{inventory: true, arousalMode: true, name: "TrapVibeProto", Asset: "TapedClitEgg", Color: "Default", Group: "ItemVulvaPiercings", power: 1, weight: 2,
		failSuffix: {"Struggle": "Egg"},
		limited: true,
		escapeChance: {"Struggle": 0.25, Remove: 0.5}, enemyTags: {"protoToys": 2, "roboAngry": 10, "toyTeaseIntense": 2}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Vibes", "Toys"], linkedVibeTags: ["teaser", "piercings"], vibeLocation: "ItemVulvaPiercings",
		allowRemote: true, events: [
			{trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true}, // Harder to remove by crotch rope
			{trigger:"playerCast",  type: "MagicallySensitive"},
			{trigger:"punish", type: "PunishSelf", power: 3, time: 12, edgeOnly: true},
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 1, time: 48, edgeOnly: true},
			{trigger:"tick",  type: "PeriodicTeasing", power: 2, time: 20, edgeOnly: true, cooldown: {"normal": 90, "tease": 20}, chance: 0.02},
			{trigger:"tick",  type: "PeriodicTeasing", power: 3, time: 15, edgeOnly: false, cooldown: {"normal": 90, "tease": 20}, chance: 0.02},
		]},
	{inventory: true, arousalMode: true, name: "MaidVibe", Asset: "TapedClitEgg", Color: "Default", Group: "ItemVulvaPiercings", power: 4, weight: 2, escapeChance: {"Struggle": 0.15},
		failSuffix: {"Struggle": "Egg"},
		limited: true,
		enemyTags: {"maidVibeRestraints": 1000, "maidVibeRestraintsLimited": 100, "toyTeaseMid": 1}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Vibes", "Toys"], linkedVibeTags: ["teaser"], vibeLocation: "ItemVulva",
		allowRemote: true, events: [
			{trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true}, // Harder to remove by crotch rope
			{trigger:"playerCast",  type: "MagicallySensitive", chance: 0.5},
			{trigger:"punish", type: "PunishSelf", power: 2, time: 12, edgeOnly: true},
			{trigger:"tick",  type: "PeriodicTeasing", power: 2, time: 32, edgeOnly: true, cooldown: {"normal": 90, "tease": 20}, chance: 0.015},
		]},

	{inventory: true, arousalMode: true, name: "TrapPlug", Asset: "VibratingDildo", Color: "Default", Group: "ItemVulva", plugSize: 1.0, power: 3, weight: 2,
		failSuffix: {"Struggle": "Plug"},
		limited: true,
		escapeChance: {"Struggle": 0.25, Remove: 0.5}, enemyTags: {"trap":10, "maidRestraintsLight": 2, "genericToys": 2, 'machinePlug': 5, "toyPleasure": 2}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Plugs", "Vibes", "Toys"], linkedVibeTags: ["plugs"],
		allowRemote: true, events: [
			{trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true},
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 2, time: 12, edgeOnly: true},
			{trigger:"tick",  type: "PeriodicTeasing", power: 1, time: 12, edgeOnly: false, cooldown: {"normal": 60, "tease": 20}, chance: 0.02},
			{trigger:"tick",  type: "PeriodicDenial", power: 1, time: 36, edgeOnly: false, cooldown: {"normal": 60, "tease": 20}, chance: 0.02},
			{trigger:"tick",  type: "PeriodicTeasing", power: 3, time: 16, edgeOnly: false, cooldown: {"normal": 60, "tease": 20}, chance: 0.02},
		]},
	{inventory: true, arousalMode: true, name: "TrapPlug2", Asset: "VibratingDildo", Color: "Default", Group: "ItemVulva", plugSize: 1.0, power: 4, weight: 2,
		failSuffix: {"Struggle": "Plug"},
		limited: true,
		escapeChance: {"Struggle": 0.25, Remove: 0.5}, enemyTags: {"trap":0, 'machinePlug': 5, "teasetoys": 2, "toyEdge": 2, "toyDeny": 2}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Plugs", "Vibes", "Toys"], linkedVibeTags: ["plugs"],
		allowRemote: true, events: [
			{trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true},
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 2, time: 12, edgeOnly: true},
			{trigger:"tick",  type: "PeriodicDenial", power: 1, time: 60, edgeOnly: false, cooldown: {"normal": 50, "tease": 10}, chance: 0.05},
		]},
	{inventory: true, arousalMode: true, name: "TrapPlug3", Asset: "VibratingDildo", Color: "Default", Group: "ItemVulva", plugSize: 1.0, power: 5, weight: 2,
		failSuffix: {"Struggle": "Plug"},
		limited: true,
		escapeChance: {"Struggle": 0.25, Remove: 0.5}, enemyTags: {"trap":0, 'machinePlug': 5, "teasetoys": 2, "toyDenyMid": 2}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Plugs", "Vibes", "Toys"], linkedVibeTags: ["plugs"],
		allowRemote: true, events: [
			{trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true},
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 2, time: 12, edgeOnly: false},
			{trigger:"tick",  type: "PeriodicDenial", power: 2, time: 36, cooldown: {"normal": 150, "tease": 40}, chance: 0.05},
		]},
	{inventory: true, arousalMode: true, name: "TrapPlug4", Asset: "VibratingDildo", Color: "Default", Group: "ItemVulva", plugSize: 1.0, power: 5, weight: 1,
		failSuffix: {"Struggle": "Plug"},
		limited: true,
		escapeChance: {"Struggle": 0.25, Remove: 0.5}, enemyTags: {"trap":0, 'machinePlug': 2, "toyPleasureMid": 2, "toyEdgeMid": 2}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Plugs", "Vibes", "Toys"], linkedVibeTags: ["plugs"],
		allowRemote: true, events: [
			{trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true},
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 2, time: 12, edgeOnly: false},
			{trigger:"tick",  type: "PeriodicTeasing", power: 3, time: 20, edgeOnly: false, cooldown: {"normal": 40, "tease": 20}, chance: 0.01},
			{trigger:"tick",  type: "PeriodicDenial", power: 2, time: 30, edgeOnly: true, cooldown: {"normal": 70, "tease": 20}, chance: 0.02},
			{trigger:"tick",  type: "PeriodicTeasing", power: 4, time: 10, edgeOnly: false, cooldown: {"normal": 90, "tease": 5}, chance: 0.03},
			{trigger:"tryOrgasm",  type: "ForcedOrgasmPower", power: 1},
			{trigger:"tryOrgasm",  type: "ForcedOrgasmMin", power: 3},
		]},

	{inventory: true, arousalMode: true, name: "TrapPlug5", Asset: "VibratingDildo", Color: "Default", Group: "ItemVulva", plugSize: 1.0, power: 5, weight: 1,
		failSuffix: {"Struggle": "Plug"},
		limited: true,
		escapeChance: {"Struggle": 0.25, Remove: 0.5}, enemyTags: {"trap":0, 'machinePlug': 2, "intensetoys": 2, "toyPleasureIntense": 4}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Plugs", "Vibes", "Toys"], linkedVibeTags: ["plugs"],
		allowRemote: true, events: [
			{trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true},
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 2, time: 12, edgeOnly: false},
			{trigger:"tick",  type: "PeriodicTeasing", power: 2, time: 36, edgeOnly: false, cooldown: {"normal": 60, "tease": 30}, chance: 0.05},
			{trigger:"tick",  type: "PeriodicTeasing", power: 4, time: 24, edgeOnly: false, cooldown: {"normal": 90, "tease": 15}, chance: 0.03},
			{trigger:"tryOrgasm",  type: "ForcedOrgasmPower", power: 3},
			{trigger:"tryOrgasm",  type: "ForcedOrgasmMin", power: 6},
		]},


	{inventory: true, arousalMode: true, name: "SteelPlugF", Asset: "VibratingDildo", Color: "#ffffff", Group: "ItemVulva", plugSize: 1.5, power: 1, weight: 2,
		limited: true,
		escapeChance: {"Struggle": 0.35, Remove: 0.7}, enemyTags: {"plugSpell":1, "toyTease": 2, "onebar": 8}, playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Plugs", "Toys"],
		events: [
			{trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true},
		],
		failSuffix: {"Struggle": "Plug"},
	},
	{inventory: true, arousalMode: true, name: "SteelPlugR", Asset: "VibratingDildoPlug", Color: "#ffffff", Group: "ItemButt", plugSize: 1.5, power: 1, weight: 2,
		limited: true,
		escapeChance: {"Struggle": 0.35, Remove: 0.7},
		enemyTags: {"plugSpell":1, 'machinePlug': 4, "toyTease": 2, "onebar": 8},
		playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Plugs", "Toys"],
		events: [
			{trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true},
		],
		failSuffix: {"Struggle": "Plug"},
	},
	{inventory: true, arousalMode: true, name: "RearVibe1", Asset: "VibratingDildoPlug", Color: "Default", Group: "ItemButt", plugSize: 1.0, power: 5, weight: 1, escapeChance: {"Struggle": 0.25, Remove: 0.5},
		enemyTags: {"genericToys": 1, "rearToys": 10, "toyEdgeMid": 2},
		limited: true,
		playerTags: {"NoVibes": -1000}, minLevel: 0, allFloors: true, shrine: ["Plugs", "Vibes", "Toys"],
		failSuffix: {"Struggle": "Plug"},
		linkedVibeTags: ["plugs"], allowRemote: true, events: [
			{trigger: "beforeStruggleCalc", type: "vibeStruggle", inheritLinked: true},
			{trigger:"remoteVibe",  type: "RemoteActivatedVibe", power: 2, time: 12, edgeOnly: true},
			{trigger:"tick",  type: "PeriodicTeasing", power: 1, time: 30, edgeOnly: true, cooldown: {"normal": 120, "tease": 20}, chance: 0.02},
		]},

	// Generic ball gag thats stronger than the trap one
	{inventory: true, name: "MagicGag", Asset: "BallGag", debris: "Belts", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink], factionColor: [[], [0]], gag: 0.35,
		Model: "BallGag",
		quickBindCondition: "BallGag", quickBindMult: 0.5,
		events: [{trigger: "postRemoval", type: "replaceItem", requireFlag: "Struggle", list: ["GagNecklace"], keepLock: true, power: 1, msg: "KDGagNecklaceOn"}],
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 20, ballGagRestraintsMagic: 12},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		Type: "Tight", Color: ["Default", "Default"], Group: "ItemMouth", DefaultLock: "Red", power: 4, weight: 2,
		escapeChance: {"Struggle": 0.0, "Cut": 0.45, "Remove": 0.65, "Pick": 0.3},
		maxwill: 0.9, enemyTags: {"ballGagRestraints" : 4, "gagSpell": 10, forceAntiMagic: -100}, playerTags: {}, minLevel: 0, maxLevel: 7, allFloors: true, shrine: ["BallGags", "Leather", "Gags"]},
	{inventory: true, name: "MagicGagLarge", Asset: "BallGag", debris: "Belts", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink], factionColor: [[], [0]], gag: 0.35,
		Model: "LargeBallGag",
		quickBindCondition: "BallGag", quickBindMult: 0.5,
		events: [{trigger: "postRemoval", type: "replaceItem", requireFlag: "Struggle", list: ["GagNecklace"], keepLock: true, power: 1, msg: "KDGagNecklaceOn"}],
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 20, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		Type: "Tight", Color: ["Default", "Default"], Group: "ItemMouth", DefaultLock: "Red_Hi", power: 5, weight: 2,
		escapeChance: {"Struggle": 0.0, "Cut": 0.45, "Remove": 0.65, "Pick": 0.3},
		maxwill: 0.9, enemyTags: {"ballGagRestraints" : 4, "gagSpell": 10, forceAntiMagic: -100}, playerTags: {}, minLevel: 7, allFloors: true, shrine: ["BallGags", "Leather", "Gags"]},

	{inventory: true, name: "MagicGag2", Asset: "BallGag", debris: "Belts", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink], factionColor: [[], [0]],
		Model: "LargeBallGag",
		quickBindCondition: "BallGag", quickBindMult: 0.5,
		events: [{trigger: "postRemoval", type: "replaceItem", requireFlag: "Struggle", list: ["GagNecklace"], keepLock: true, power: 1, msg: "KDGagNecklaceOn"}],
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 20, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		gag: 0.45, Type: "Tight", Color: ["Default", "#ff00ff"], Group: "ItemMouth", DefaultLock: "Purple", magic: true, power: 5.5, weight: 2,
		escapeChance: {"Struggle": -0.1, "Cut": 0.12, "Remove": 0.45, "Pick": 0.25},
		enemyTags: {"ballGagRestraintsMagic" : 4, "gagSpellStrong": 10, forceAntiMagic: -100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["BallGags", "Leather", "Gags", "Conjure"]},
	{inventory: true, name: "AntiMagicGag", Asset: "BallGag", debris: "Belts", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink],
		Model: "BallGag",
		quickBindCondition: "BallGag", quickBindMult: 0.5,
		Filters: {
			"Ball": {"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":3.016666666666667,"blue":3.95,"alpha":1},
		},
		gag: 0.15, Type: "Tight", Color: ["Default", "#92e8c0"], Group: "ItemMouth", DefaultLock: "Purple", magic: true, power: 6, weight: 2,
		escapeChance: {"Struggle": -0.3, "Cut": 0.04, "Remove": 0.45, "Pick": 0.15},
		events: [
			{trigger: "tick", type: "AntiMagicGag", inheritLinked: true, count: 8, power: 0.4},
			{trigger: "postRemoval", type: "replaceItem", requireFlag: "Struggle", list: ["GagNecklace"], keepLock: true, power: 1, msg: "KDGagNecklaceOn"}
		],
		//"ballGagRestraintsMagic" : 2, "antiMagic": 6
		enemyTags: {}, playerTags: {}, minLevel: 3, maxLevel: 7, allFloors: true, shrine: ["Illusion", "BallGags", "Leather" , "Gags", "Conjure"]},
	{inventory: true, name: "AntiMagicGag2", Asset: "BallGag", debris: "Belts", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink],
		Model: "BallGag",
		quickBindCondition: "BallGag", quickBindMult: 0.5,
		Filters: {
			"Ball": {"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":3.016666666666667,"blue":3.95,"alpha":1},
		},
		gag: 0.45, Type: "Tight", Color: ["Default", "#92e8c0"], Group: "ItemMouth", DefaultLock: "Purple", magic: true, power: 7, weight: 2,
		escapeChance: {"Struggle": -0.4, "Cut": -0.02, "Remove": 0.4, "Pick": 0.12},
		events: [
			{trigger: "postRemoval", type: "replaceItem", requireFlag: "Struggle", list: ["GagNecklace"], keepLock: true, power: 1, msg: "KDGagNecklaceOn"},
			{trigger: "tick", type: "AntiMagicGag", inheritLinked: true, count: 30, power: 0.4},
		],
		//"ballGagRestraintsMagic" : 0.3, "antiMagic": 2
		enemyTags: {}, playerTags: {}, minLevel: 7, allFloors: true, shrine: ["Illusion", "BallGags", "Latex" , "Gags", "Conjure"]},

	// Generic stronger gag
	{inventory: true, trappable: true, name: "PanelGag", debris: "Belts", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], Asset: "DeepthroatGag", gag: 0.7,
		Model: "PanelGag",
		Color: "#888888", Group: "ItemMouth", power: 4, weight: 5,
		escapeChance: {"Struggle": 0.1, "Cut": 0.3, "Remove": 0.4, "Pick": 0.3},
		maxwill: 0.6, enemyTags: {"leatherRestraints":8, "leatherGags": 10}, playerTags: {}, minLevel: 0, maxLevel: 7, allFloors: true, shrine: ["FlatGags", "Leather", "Gags"]},
	{inventory: true, trappable: true, name: "HarnessPanelGag", debris: "Belts", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], Asset: "HarnessPanelGag", gag: 0.7,
		Model: "PanelGagHarness",
		events: [
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.35, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.25, requiredTag: "Blindfolds"},
		],
		Color: "#888888", Group: "ItemMouth", AssetGroup: "ItemMouth2", power: 5, strictness: 0.2, weight: 2,
		escapeChance: {"Struggle": -0.1, "Cut": 0.25, "Remove": 0.15, "Pick": 0.15},
		maxwill: 0.6, enemyTags: {"leatherRestraintsHeavy":8, "leatherGags": 10}, playerTags: {}, minLevel: 3, allFloors: true, shrine: ["FlatGags", "Leather", "Gags"]},
	{inventory: true, trappable: true, name: "HarnessGag", debris: "Belts", Asset: "HarnessBallGag", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink],
		Model: "BallGagHarness",
		events: [
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.15, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.1, requiredTag: "Blindfolds"},
		],
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		factionFilters: {
			Ball: {color: "Highlight", override: false},
		},
		gag: 0.65, Type: "Tight", Color: ["Default", "Default"], Group: "ItemMouth", power: 4, strictness: 0.2, weight: 3,
		escapeChance: {"Struggle": -0.1, "Cut": 0.25, "Remove": 0.15, "Pick": 0.2},
		maxwill: 0.6, enemyTags: {"leatherRestraints":1, "leatherRestraintsHeavy": 1,  "leatherGags": 10, forceAntiMagic: -100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["BallGags", "Leather" , "Gags"]},
	{inventory: true, name: "PanelPlugGagHarness", Asset: "OTNPlugGag", debris: "Belts", LinkableBy: [...KDPlugGagLink], renderWhenLinked: [...KDPlugGagLink], Type: "Plug", gag: 1.0,
		Model: "PlugMuzzleGagHarness",
		events: [
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.35, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.25, requiredTag: "Blindfolds"},
		],
		Color: ["#888888", "#444444", "#aaaaaa"], Group: "ItemMouth", strictness: 0.4, power: 7, weight: 1,
		escapeChance: {"Struggle": -0.2, "Cut": 0.2, "Remove": 0.12, "Pick": 0.07},
		ignoreMinLevelTags: ["miniboss", "boss", "stageboss"],
		maxwill: 0.2, enemyTags: {"leatherRestraintsHeavy" : 4, "leatherGags": 5}, playerTags: {}, minLevel: 8, allFloors: true, shrine: ["PlugGags", "Leather", "Gags"]},
	{inventory: true, name: "PanelPlugGag", Asset: "DildoPlugGag", debris: "Belts", LinkableBy: [...KDPlugGagLink], renderWhenLinked: [...KDPlugGagLink], gag: 0.9,
		Model: "PlugMuzzleGag",
		Color: ["#888888", "#444444", "#aaaaaa"], Group: "ItemMouth", power: 6, weight: 1,
		escapeChance: {"Struggle": -0.05, "Cut": 0.2, "Remove": 0.15, "Pick": 0.1},
		maxwill: 0.2, enemyTags: {"leatherRestraintsHeavy" : 10, "leatherGags": 5}, playerTags: {}, minLevel: 5, maxLevel: 10, allFloors: true, shrine: ["PlugGags", "Leather", "Gags"]},

	// Simple cloth stuff
	{inventory: true, name: "ClothGag", LinkableBy: [...KDBallGagLink], debris: "Fabric", renderWhenLinked: [...KDBallGagLink], Asset: "ClothGag", gag: 0.35, Type: "Knotted", Color: "#959595", Group: "ItemMouth", AssetGroup: "ItemMouth2", power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		Model: "ClothCleave",
		maxwill: 0.75, enemyTags: {"clothRestraints":8, "ropeAuxiliary": 3}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["ClothGag", "Rope", "BallGags", "Gags"]},
	{inventory: true, name: "ClothGag2", LinkableBy: [...KDBallGagLink], debris: "Fabric", renderWhenLinked: [...KDBallGagLink], Asset: "ClothGag", gag: 0.45, Type: "Knotted", Color: "#959595", Group: "ItemMouth", AssetGroup: "ItemMouth2", power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		Model: "ClothCleaveThick",
		maxwill: 0.6, enemyTags: {"clothRestraints":6, "ropeAuxiliary": 2}, playerTags: {}, minLevel: 2, allFloors: true, shrine: ["ClothGag", "Rope", "BallGags", "Gags"]},
	{inventory: true, name: "ClothGag3", LinkableBy: [...KDBallGagLink], debris: "Fabric", renderWhenLinked: [...KDBallGagLink], Asset: "ClothGag", gag: 0.65, Type: "Knotted", Color: "#959595", Group: "ItemMouth", AssetGroup: "ItemMouth2", power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		Model: "ClothKnot",
		maxwill: 0.35, enemyTags: {"clothRestraints":4, "ropeAuxiliary": 1}, playerTags: {}, minLevel: 3, allFloors: true, shrine: ["ClothGag", "Rope", "BallGags", "Gags"]},
	{inventory: true, name: "ClothGagOver", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], Asset: "ClothGag", gag: 0.35, Type: "OTN", Color: "#959595", Group: "ItemMouth", AssetGroup: "ItemMouth3", power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		Model: "ClothOTN",
		maxwill: 0.75, enemyTags: {"clothRestraints":4, "ropeAuxiliary": 1}, debris: "Fabric", playerTags: {"ItemMouthEmpty": -4, "ItemMouth2Empty": -4}, minLevel: 0, allFloors: true, shrine: ["ClothGag", "FlatGags", "Rope", "Gags"]},
	{inventory: true, name: "ClothBlindfold", Asset: "ClothBlindfold", debris: "Fabric", Color: "#959595", LinkableBy: [...KDTapeLink], renderWhenLinked: [...KDTapeRender], Group: "ItemHead", power: 0.1, weight: 2, escapeChance: {"Struggle": 0.5, "Cut": 1.0, "Remove": 0.8},
		Model: "ClothBlindfold",
		affinity: {Struggle: ["Sticky", "Hook"], Remove: ["Hook"],},
		maxwill: 0.85, blindfold: 2, enemyTags: {"clothRestraints":8, "ropeAuxiliary": 1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["ClothBlindfold", "Rope", "Blindfolds"]},

	//region Baast warriors only apply two things so its okay that these have a high maxwill
	{inventory: true, name: "KittyGag", Asset: "KittyHarnessPanelGag", debris: "Belts", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], gag: 0.6,
		Model: "KittyHarnessPanelGag",
		events: [
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.35, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.25, requiredTag: "Blindfolds"},
		],
		Color: ["#FFFFFF", "#FFFFFF", "#000000", "#E496E7"], Group: "ItemMouth", AssetGroup: "ItemMouth2", power: 5, weight: 2, escapeChance: {"Struggle": -0.1, "Cut": 0.2, "Remove": 0.25, "Pick": 0.2},
		enemyTags: {"kittyRestraints":8}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["FlatGags", "Leather", "Gags", "Will"]},
	{inventory: true, name: "KittyMuzzle", debris: "Belts", Asset: "KittyGag", gag: 0.4, Color: ["#FFFFFF", "#000000", "#E496E7"], Group: "ItemMouth", AssetGroup: "ItemMouth3", power: 7, weight: -6, escapeChance: {"Struggle": -0.04, "Cut": 0.04, "Remove": 0.4, "Pick": 0.2},
		Model: "KittyMuzzle",
		maxwill: 0.9, enemyTags: {"kittyRestraints":6}, playerTags: {"ItemMouth2Full": 4, "ItemMouthFull": 4}, minLevel: 3, allFloors: true, shrine: ["FlatGags", "Leather", "Gags", "Will"]},
	{inventory: true, name: "KittyBlindfold", debris: "Belts", Asset: "KittyBlindfold", blindfold: 3,
		Model: "KittyBlindfold",
		LinkableBy: [...KDBlindfoldLink], renderWhenLinked: [...KDBlindfoldLink], Color: ["#FFFFFF","#000000","#E48FE9"], Group: "ItemHead",
		power: 5, weight: 2, escapeChance: {"Struggle": 0.1, "Cut": 0.3, "Remove": 0.25, "Pick": 0.2},
		enemyTags: {"kittyRestraints":8}, playerTags: {NoBlindfolds: -1000}, minLevel: 0, allFloors: true, shrine: ["Leather", "Blindfolds", "Will"]},
	{inventory: true, name: "KittyPaws", debris: "Belts", Asset: "PawMittens", Color: ["#FFFFFF","#FFFFFF","#FFFFFF","#B38295"], Group: "ItemHands",
		LinkableBy: [...KDGlovesLink], bindhands: 1.0, power: 5, weight: 2,
		escapeChance: {"Struggle": 0.0, "Cut": 0.3, "Remove": 0.15, "Pick": 0.4},
		Model: "LeatherPawMittens",
		maxwill: 0.9, enemyTags: {"kittyRestraints":8}, playerTags: {}, minLevel: 4, allFloors: true, shrine: ["Mittens", "Leather", "Will"]},
	{inventory: true, name: "KittySuit", debris: "Belts", Asset: "BitchSuit", Color: "Default", Group: "ItemArms", DefaultLock: "Red",
		Model: "ElitePetsuit",
		Filters: {
			Suit: {"gamma":1.65,"saturation":1,"contrast":1,"brightness":1.23,"red":1,"green":1,"blue":1,"alpha":1}
		},
		factionFilters: {
			Suit: {
				color: "LightNeutral", override: false,
			},
			Straps: {
				color: "DarkNeutral", override: true,
			},
			Hardware: {
				color: "Highlight", override: true,
			},
			Laces: {
				color: "Highlight", override: true,
			},
		},
		bindarms: true, bindhands: 1.0, addTag: ["ForceKneel"],
		hobble: 2,
		power: 11, weight: 0, escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": -0.1, "Pick": 0.15},
		events:[
			{trigger:"defeat",  type:"Kittify"},
		],
		helpChance: {"Remove": 0.1}, maxwill: 0.15, enemyTags: {"kittyRestraints":3}, playerTags: {"NoPet": -1000}, minLevel: 7, allFloors: true, shrine: ["Petsuits", "Latex", "Will", "HinderFeet"]},
	{inventory: true, name: "MagicPetsuit", inaccessible: true, debris: "Belts", Asset: "StrictLeatherPetCrawler", magic: true, Color: "Default", Group: "ItemArms",
		Model: "Petsuit",
		bindarms: true, bindhands: 1.0, addTag: ["ForceKneel"], power: 12, weight: 0,
		hobble: 2,
		factionFilters: {
			Arms: {
				color: "DarkNeutral", override: true,
			},
			ArmsBelts: {
				color: "LightNeutral", override: true,
			},
			Legs: {
				color: "DarkNeutral", override: true,
			},
			LegsBelts: {
				color: "LightNeutral", override: true,
			},
		},
		escapeChance: {"Struggle": -0.15, "Cut": 0.12, "Remove": -0.05, "Pick": 0.15},
		helpChance: {"Remove": 0.2}, maxwill: 0.15, enemyTags: {"petsuitSpell": 1},
		playerTags: {"NoPet": -1000}, minLevel: 0, allFloors: true,
		shrine: ["Petsuits", "Leather", "Conjure", "HinderFeet"]},
	{inventory: true, name: "LatexPetsuit", inaccessible: true, debris: "Slime", Color: "Default", Group: "ItemArms",
		Model: "LatexPetsuit",
		bindarms: true, bindhands: 1.0, addTag: ["ForceKneel"], power: 9, weight: 0,
		hobble: 2,
		factionFilters: {
			Arms: {
				color: "Catsuit", override: true,
			},
			Legs: {
				color: "Catsuit", override: true,
			},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.005, // Impossible to put on without binding arms first
		},
		Filters: {
			Legs: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":2.2666666666666666,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
			Arms: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":2.2666666666666666,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
		},
		alwaysDressModel: [
			{
				Model: "Catsuit",
				Filters: {
					TorsoUpper: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":2.2666666666666666,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
					TorsoLower: {"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":2.2666666666666666,"red":1,"green":1.8333333333333333,"blue":2.7666666666666666,"alpha":1},
				},
				factionFilters: {
					TorsoUpper: {color: "Catsuit", override: true},
					TorsoLower: {color: "Catsuit", override: true},
				},
			},
		],
		remove: ["Bras", "Panties", "Skirts", "Socks", "Shirts", "Boots"],
		escapeChance: {"Struggle": -0.25, "Cut": 0.05, "Remove": -0.2, "Pick": 0.15},
		helpChance: {"Remove": 0.15}, maxwill: 0.15, enemyTags: {"petsuitSpell": 1, "latexpetsuit": 3},
		playerTags: {"NoPet": -1000}, minLevel: 0, allFloors: true, shrine: ["Petsuits", "Latex", "Conjure", "HinderFeet"]},
	{inventory: true, name: "WolfPetsuit", inaccessible: true, debris: "Belts", Asset: "StrictLeatherPetCrawler", Color: "Default", Group: "ItemArms",
		DefaultLock: "Blue",
		remove: ["Bras", "Panties"],
		alwaysDressModel: [
			{
				Model: "WolfTorsoLower",
				factionFilters: {
					Band: {color: "Highlight", override: true},
					Rim: {color: "LightNeutral", override: true},
					Cloth: {color: "DarkNeutral", override: true},
				},
			},
			{
				Model: "WolfTorsoUpper",
				factionFilters: {
					Band: {color: "Highlight", override: true},
					Rim: {color: "LightNeutral", override: true},
					Cups: {color: "LightNeutral", override: true},
					Cloth: {color: "DarkNeutral", override: true},
				},
			},
		],

		bindarms: true, bindhands: 1.0, addTag: ["ForceKneel"], power: 14, weight: 0,
		hobble: 2,
		Model: "CyberPetsuit",
		factionFilters: {
			Suit: {
				color: "LightNeutral", override: true,
			},
			Straps: {
				color: "DarkNeutral", override: true,
			},
			Display: {
				color: "Highlight", override: true,
			},
		},
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', kind: "Nevermere", mult: 0.8, power: 2,},
		],
		escapeChance: {"Struggle": -0.45, "Cut": -0.1, "Remove": -0.3, "Pick": 0.15},
		helpChance: {"Remove": 0.01}, maxwill: 0.15, enemyTags: {"wolfPetsuit": 1}, playerTags: {"NoPet": -1000}, minLevel: 0, allFloors: true, shrine: ["Petsuits", "Latex", "HinderFeet"]},
	// Only apply if already wearing KittySuit
	{inventory: true, name: "KittyPetSuit", inaccessible: true, debris: "Belts", Asset: "BitchSuit", Color: "Default", Group: "ItemArms",
		DefaultLock: "Blue",
		Model: "ElitePetsuit",
		remove: ["Bras", "Panties"],
		alwaysDressModel: [
			{
				Model: "LeatherLeotard",
				factionFilters: {
					Leather: {
						color: "LightNeutral", override: true,
					},
					Corset: {
						color: "DarkNeutral", override: true,
					},
					Laces: {
						color: "Highlight", override: true,
					},
				},
			},
			{
				Model: "LeatherLeotardStrapsLower",
				factionFilters: {
					Straps: {
						color: "Highlight", override: true,
					},
					Hardware: {
						color: "Highlight", override: true,
					},
				},
			},
			{
				Model: "LeatherLeotardStrapsUpper",
				factionFilters: {
					Straps: {
						color: "Highlight", override: true,
					},
				},
			},
		],

		factionFilters: {
			Suit: {
				color: "LightNeutral", override: true,
			},
			Straps: {
				color: "Highlight", override: true,
			},
			Hardware: {
				color: "LightNeutral", override: true,
			},
			Laces: {
				color: "Highlight", override: true,
			},
		},
		bindarms: true, bindhands: 1.0, addTag: ["ForceKneel"],power: 14, weight: 0,
		hobble: 2,
		escapeChance: {"Struggle": -0.3, "Cut": 0.0, "Remove": -0.3, "Pick": 0.15},
		alwaysDress: [
			{Item: "KittenEars2", Group: "HairAccessory2", Color: ['Default'], override: false, useHairColor: true,},
			{Item: "TailStrap", Group: "TailStraps", Color: ['Default'], override: false, useHairColor: true,},
		],
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', kind: "Bast", mult: 0.8, power: 2,},
		],
		helpChance: {"Remove": 0.01}, maxwill: 0.15, enemyTags: {"kittyRestraints":0}, playerTags: {"NoPet": -1000}, minLevel: 7, allFloors: true, shrine: ["Petsuits", "Latex", "Will", "HinderFeet"]},
	//endregion

	//region These restraints are easy, so they dont have maxwill
	{inventory: true, name: "WristShackles", debris: "Chains", Asset: "WristShackles", linkCategory: "Cuffs", linkSize: 0.33, LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindable],
		sfxGroup: "Handcuffs",
		struggleBreak: true,
		Model: "ShacklesWrists",
		quickBindCondition: "Handcuffs",
		noDupe: true,
		Group: "ItemArms", Color: "Default", bindarms: true, Type: "Behind", power: 1, escapeChance: {"Struggle": -0.05, "Cut": -0.25, "Remove": 10, "Pick": 5},
		DefaultLock: "White",
		// Cuffs playertags
		weight: 2,
		playerTags: {"ItemArmsFull":-2, "ItemArmsEmpty": 5},
		playerTagsMult: {Metal: 2},
		playerTagsMissing: {Metal: -4},
		playerTagsMissingMult: {Metal: 0.2},
		events: [{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true}],
		enemyTags: {"shackleRestraints":7, "handcuffer": 2, "Unchained": -8}, enemyTagsMult: {handcuffer: 0.2, Unchained: 0.1}, minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs"]},
	{inventory: true, trappable: true, name: "TrapCuffs", debris: "Chains", Asset: "MetalCuffs", accessible: true, linkCategory: "Cuffs", linkSize: 0.33, LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindable], Group: "ItemArms",
		sfxGroup: "Handcuffs",
		struggleBreak: true,
		quickBindCondition: "Handcuffs",
		Model: "HandCuffs",
		noDupe: true,
		Color: "Default", bindarms: true, power: 2, DefaultLock: "White",
		events: [{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true}],
		// Cuffs playertags
		weight: 4,
		playerTags: {"ItemArmsFull":-2, "ItemArmsEmpty": 5},
		playerTagsMult: {Metal: 2},
		playerTagsMissing: {Metal: -8},
		playerTagsMissingMult: {Metal: 0.2},
		escapeChance: {"Struggle": -0.25, "Cut": -0.1, "Remove": 10, "Pick": 0.5}, enemyTagsMult: {handcuffer: 0.2, Unchained: 0.1}, enemyTags: {"trap":100, "handcuffer": 4, "cuffsSpell": 10}, minLevel: 0, allFloors: true, shrine: ["Handcuffs", "HandsFrontAllowed", "Metal", "Cuffs"]},

	{inventory: true, trappable: true, name: "HingedCuffs", debris: "Chains", Asset: "MetalCuffs", accessible: true,
		sfxGroup: "Handcuffs",
		struggleBreak: true,
		Model: "HingedCuffs",
		quickBindCondition: "Handcuffs",
		noDupe: true,
		linkCategory: "Cuffs", linkSize: 0.4, LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindable], Group: "ItemArms",
		Color: "Default", bindarms: true, power: 5, DefaultLock: "White",
		events: [{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true}],
		helpChance: {"Remove": 0.4, "Pick": 0.4, "Unlock": 1.0},
		escapeChance: {"Struggle": -0.3, "Cut": -0.2, "Remove": -0.2, "Pick": -0.25, "Unlock": -0.25},
		// Cuffs playertags
		weight: 10,
		restriction: 2,
		playerTags: {"ItemArmsFull":-2, "ItemArmsEmpty": 5},
		playerTagsMult: {Metal: 2},
		playerTagsMissing: {Metal: -15},
		playerTagsMissingMult: {Metal: 0.2},
		enemyTags: {"trap":100, "handcuffer": 6, "cuffsSpell": 10}, enemyTagsMult: {handcuffer: 0.2, Unchained: 0.1}, minLevel: 5, allFloors: true, shrine: ["Handcuffs", "HandsFrontAllowed", "Metal", "Cuffs"]},
	{inventory: true, trappable: true, name: "Irish8Cuffs", debris: "Chains", Asset: "MetalCuffs", accessible: true,
		sfxGroup: "Handcuffs",
		struggleBreak: true,
		Model: "Irish8Cuffs",
		quickBindCondition: "Handcuffs",
		linkCategory: "Cuffs", linkSize: 0.51, LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindable], Group: "ItemArms",
		Color: "Default", bindarms: true, power: 6, DefaultLock: "White",
		events: [{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true}],
		helpChance: {"Remove": 0.5, "Pick": 0.4, "Unlock": 1.0},
		escapeChance: {"Struggle": -0.5, "Cut": -0.4, "Remove": -0.2, "Pick": -0.2, "Unlock": -0.25},
		// Cuffs playertags
		weight: 4,
		noDupe: true,
		restriction: 3,
		playerTags: {"ItemArmsFull":-2, "ItemArmsEmpty": 5},
		playerTagsMult: {Metal: 2},
		playerTagsMissing: {Metal: -4},
		playerTagsMissingMult: {Metal: 0.2},
		enemyTags: {"trap":10, "handcuffer": 4, "cuffsSpell": 7}, enemyTagsMult: {handcuffer: 0.2, Unchained: 0.1}, minLevel: 8, allFloors: true, shrine: ["Handcuffs", "HandsFrontAllowed", "Metal", "Cuffs"]},

	{inventory: true, trappable: true, name: "AnkleIrish8Cuffs", debris: "Chains", Asset: "Irish8Cuffs", LinkableBy: ["Wrapping", "Encase", "Belts"], Color: "Default", Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],
		power: 6,
		Model: "Irish8Ankle",
		struggleBreak: true,
		linkCategory: "AnkleCuffs", linkSize: 0.51, noDupe: true,
		maxwill: 0.5,
		sfxGroup: "Handcuffs",
		// Shackles playertags
		weight: 4,
		restriction: 2,
		playerTags: {"ItemFeetFull":-2, "ItemFeetEmpty": 5},
		playerTagsMult: {Metal: 2},
		playerTagsMissing: {Metal: -8},
		playerTagsMissingMult: {Metal: 0.2},
		escapeChance: {"Struggle": -0.6, "Cut": -0.4, "Remove": 0.1, "Pick": 0.4}, enemyTags: {"handcuffer":4, "shackleRestraints": 1, "cuffsSpell": 7}, enemyTagsMult: {handcuffer: 0.2, Unchained: 0.1}, minLevel: 7, allFloors: true, shrine: ["Legirons", "Metal", "Cuffs"]},



	{inventory: true, trappable: true, name: "ThumbCuffs", debris: "Chains", Asset: "MetalCuffs", accessible: true,
		Model: "Thumbcuffs",
		struggleBreak: true,
		hideTags: ["Armbinders", "Boxbinders", "Boxties", "Wristies", "BoundArms"],
		AssetGroup: "ItemArms",
		sfxGroup: "Handcuffs",
		linkCategory: "Thumbs", linkSize: 0.51, LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindable], Group: "ItemHands",
		Color: "Default", bindarms: true, power: 6, DefaultLock: "White",
		bindhands: 0.4,
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postApply", type: "NoYoke", inheritLinked: true},
		],
		helpChance: {"Pick": 0.4, "Unlock": 1.0},
		escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": -0.2, "Pick": -0.12, "Unlock": -0.05},
		enemyTags: {},
		restriction: 3,
		enemyTagsMult: {},
		weight: -10000,
		noDupe: true,
		playerTags: {},
		playerTagsMult: {Metal: 2},
		playerTagsMissing: {Metal: -13},
		playerTagsMissingMult: {Metal: 0.2},
		minLevel: 8, allFloors: true, shrine: ["Cuffs", "Metal",  "Thumbcuffs", "HandsFrontAllowed"]},

	{inventory: true, trappable: true, name: "ThumbCuffsNew", debris: "Chains", Asset: "MetalCuffs", accessible: true,
		Model: "Thumbcuffs",
		struggleBreak: true,
		hideTags: ["Armbinders", "Boxbinders", "Boxties", "Wristies", "BoundArms"],
		AssetGroup: "ItemArms",
		sfxGroup: "Handcuffs",
		linkCategory: "Thumbs", linkSize: 0.51, LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindable], Group: "ItemArms",
		Color: "Default", bindarms: true, power: 6, DefaultLock: "White",
		bindhands: 0.4,
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postApply", type: "NoYoke", inheritLinked: true},
		],
		restriction: 3,
		helpChance: {"Pick": 0.4, "Unlock": 1.0},
		escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": -0.2, "Pick": -0.12, "Unlock": -0.05},
		enemyTags: {"trap":1, "handcuffer": 1, "cuffsSpell": 1, "thumbcuffs": 10},
		enemyTagsMult: {handcuffer: 0.3, Unchained: 0.2},
		weight: 15,
		noDupe: true,
		playerTags: {"ItemHandsFull":-2, "ItemArmsEmpty": -13, "Yokes": -100},
		playerTagsMult: {Metal: 2},
		playerTagsMissing: {Metal: -13},
		playerTagsMissingMult: {Metal: 0.2},
		minLevel: 8, allFloors: true, shrine: ["Cuffs", "Metal",  "Thumbcuffs", "HandsFrontAllowed"]},


	{inventory: true, name: "WolfCuffs", debris: "Chains", Asset: "MetalCuffs", accessible: true, linkCategory: "SmartCuffs", linkSize: 0.55, LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindable],
		quickBindCondition: "Handcuffs",
		sfxGroup: "Handcuffs",
		struggleBreak: true,
		Model: "WolfCuffs",
		Color: "Default", Group: "ItemArms", bindarms: true, power: 5, DefaultLock: "Red",
		// Cuffs playertags
		weight: 2,
		playerTags: {"ItemArmsFull":-2, "ItemArmsEmpty": 5},
		playerTagsMult: {Metal: 2},
		noDupe: true,
		playerTagsMissing: {Metal: -10},
		playerTagsMissingMult: {Metal: 0.2},
		events: [{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true}],
		maxwill: 0.8, escapeChance: {"Struggle": -0.4, "Cut": -0.15, "Remove": 10, "Pick": 0.0},
		enemyTags: {"wolfCuffs": 6, "cuffsSpell": 100}, minLevel: 5, allFloors: true, shrine: ["Handcuffs", "HandsFrontAllowed", "Metal", "Cuffs"]},



	{inventory: true, name: "LegShackles", debris: "Chains", Asset: "LeatherLegCuffs", LinkableBy: [...KDBindable, ...KDDevices],
		sfxGroup: "Handcuffs",
		struggleBreak: true,
		Model: "ShacklesThigh",
		alwaysDressModel: [
			{Model: "ThighLink", inheritFilters: true}
		],
		Group: "ItemLegs", hobble: 1, Type: "Chained", Color: ["Default", "#888888", "#AAAAAA"], power: 3,
		escapeChance: {"Struggle": -0.1, "Cut": -0.3, "Remove": 10, "Pick": 5},
		enemyTags: {"shackleRestraints":2},
		enemyTagsMult: {handcuffer: 0.2, Unchained: 0.1},
		weight: 2,
		playerTags: {"ItemLegsFull":-2, "ItemLegsEmpty": 5},
		playerTagsMult: {Metal: 2},
		playerTagsMissing: {Metal: -5},
		playerTagsMissingMult: {Metal: 0.2},
		minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs", "LegCuffsBase"]},

	{inventory: true, name: "FeetShackles", debris: "Chains", Asset: "SteelAnkleCuffs", LinkableBy: [...KDBindable, ...KDDevices],
		Model: "ShacklesAnkles",
		struggleBreak: true,
		alwaysDressModel: [
			{Model: "AnkleLink", inheritFilters: true}
		],
		Filters: {
			BaseMetal: {"gamma":1,"saturation":1,"contrast":1.4833333333333334,"brightness":2.0166666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		},
		linkCategory: "AnkleCuffs", linkSize: 0.4, noDupe: true,
		sfxGroup: "Handcuffs",
		Group: "ItemFeet", hobble: 1, Type: "Chained", Color: ["Default", "Default"], power: 5, escapeChance: {"Struggle": -0.1, "Cut": -0.3, "Remove": 10, "Pick": 5},
		enemyTags: {"shackleRestraints":2},
		enemyTagsMult: {handcuffer: 0.2, Unchained: 0.1},
		minLevel: 0, allFloors: true, shrine: ["Metal", "Cuffs", "AnkleCuffsBase", "HogtieLower"],
		// Shackles playertags
		weight: 2,
		playerTags: {"ItemFeetFull":-2, "ItemFeetEmpty": 5},
		playerTagsMult: {Metal: 2},
		playerTagsMissing: {Metal: -5},
		playerTagsMissingMult: {Metal: 0.2},
	},
	{inventory: true, name: "SteelMuzzleGag", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], gag: 0.3, Asset: "MuzzleGag", Group: "ItemMouth", AssetGroup: "ItemMouth3", Color: "#999999",
		Model: "GagMetalRiveted",
		struggleBreak: true,
		power: 3, weight: 2, escapeChance: {"Struggle": -0.3, "Cut": -0.25, "Remove": 10, "Pick": 5}, enemyTags: {"shackleGag":1}, playerTags: {"ItemMouthFull":1}, minLevel: 0, allFloors: true, shrine: ["FlatGags", "Metal", "Gags"]},
	//endregion

	//region Invisible
	{inventory: true, name: "InvisibleGag", gag: 0.5, Asset: "BallGag", Group: "ItemMouth", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink],
		AssetGroup: "ItemMouth3", Color: "#cccccc", power: 4, weight: 4, escapeChance: {"Struggle": -0.1, "Cut": 0.1, "Remove": 0.25, Pick: 0.2, Unlock: 0.7}, maxwill: 0.9,
		Model: "GhostGag",
		enemyTags: {"invisRestraints":4, invisGag: 10}, playerTags: {"ItemMouthFull":-3.8}, minLevel: 0, allFloors: true, shrine: ["Gags", "Invisible", "BallGags", "Illusion"]},

	{inventory: true, trappable: true, name: "InvisibleBlindfold", Asset: "LeatherBlindfold", LinkableBy: [...KDBlindfoldLink], renderWhenLinked: [...KDBlindfoldLink], Color: "Default", Group: "ItemHead",
		power: 3, weight: 2,
		Model: "BlindfoldLeather",
		events: [
			{trigger: "tick", type: "InvisibleGhosts"},
		],
		Filters: {
			Blindfold: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.01},
			Rim: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.01},
		},
		maxwill: 1.0, escapeChance: {"Struggle": 0.4, "Cut": 0.6, "Remove": 0.3, "Pick": 0.4},
		enemyTags: {"invisRestraints":1, },
		playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Illusion", "Blindfolds"]},

	{renderWhenLinked: [...KDArmbinderLink], inventory: true, trappable: true, name: "InvisibleArmbinder", debris: "Belts",
		inaccessible: true, strictness: 0.1, Asset: "LeatherArmbinder", LinkableBy: [...KDArmbinderLink],
		Type: "WrapStrap", Group: "ItemArms", Color: "Default", bindarms: true, bindhands: 1.0, power: 6, weight: 2,
		Model: "SmoothArmbinder",

		Filters: {
			Binder: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.01},
		},
		limitChance: {"Struggle": 0.15, "Cut": 0.1, "Unlock": 0.2},
		playerTagsMult: {
			"More_Armbinders": 3.5,
			"Less_Armbinders": 0.1,
		},
		maxwill: 0.35, escapeChance: {"Struggle": 0.11, "Cut": 0.4, "Remove": 0.3, "Pick": 0.5}, enemyTags: {"invisRestraints":10, }, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Illusion", "Armbinders", "Block_ItemHands"]},

	{renderWhenLinked: [...KDLegbinderRender], inventory: true, name: "InvisibleLegbinder", debris: "Belts", Asset: "LegBinder", inaccessible: true,
		LinkableBy: [...KDLegbinderLink], Color: "Default", Group: "ItemLegs", blockfeet: true,
		Model: "Legbinder",
		Filters: {
			Binder: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.01},
			Laces: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.01},
		},
		affinity: {Remove: ["Hook"], Struggle: ["Hook"],},
		struggleMaxSpeed: {Cut: 0.3, Remove: 0.1},
		maxwill: 0.1,
		struggleMult: {Struggle: 0.4},
		power: 6, weight: 2, escapeChance: {"Struggle": .06, "Cut": 0.35, "Remove": 0.25, "Pick": 0.35}, enemyTags: {"invisRestraints":3, }, playerTags: {}, minLevel: 7, allFloors: true,
		shrine: ["Illusion", "Legbinders"]},

	//Endregion invisible

	//region Comfy
	{inventory: true, name: "ComfyGag", gag: 0.5, Asset: "MuzzleGag", Group: "ItemMouth", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], AssetGroup: "ItemMouth3", Color: "#cccccc", power: 1, weight: 4, escapeChance: {"Struggle": 0.2, "Cut": 0.2, "Remove": 0.4, "Pick": 5}, maxwill: 0.9,
		Model: "GagComfy",
		Filters: {
			Fabric: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5166666666666666},
		},
		enemyTags: {"comfyRestraints":1}, playerTags: {"ItemMouthFull":1}, minLevel: 0, allFloors: true, shrine: ["FlatGags", "Gags", "Illusion"]},
	{inventory: true, name: "ComfyStraitjacket", Asset: "HighSecurityStraitJacket", Modules: [0, 2, 1], Color: ['#cccccc', '#cccccc', '#cccccc'], Group: "ItemArms", power: 3, weight: 1, bindarms: true, bindhands: 0.9,

		LinkableBy: [...KDJacketLink],
		renderWhenLinked: [...KDJacketRender],
		Model: "JacketHeavy",
		Filters: {
			Arms: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.44999999999999996},
			Chest: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.44999999999999996},
			Lower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.44999999999999996},
			BeltsArms: {"gamma":1,"saturation":0.2,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.7166666666666667},
			BeltsChest: {"gamma":1,"saturation":0.2,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.7166666666666667},
			BeltsLower: {"gamma":1,"saturation":0.2,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.7166666666666667},
		},
		playerTagsMult: {
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		limitChance: {"Struggle": 0.2, "Cut": 0.07, "Remove": 0.35, "Unlock": 0.75}, // Hard to escape the arms box by struggling
		escapeChance: {"Struggle": 0.2, "Cut": 0.2, "Remove": 0.4, "Pick": 5}, enemyTags: {"comfyRestraints": 1}, playerTags: {}, minLevel: 0, maxwill: 0.35,
		allFloors: true, shrine: ["Straitjackets", "Block_ItemHands", "Illusion"]},

	//endregion

	{curse: "5Keys", name: "GhostCollar", Asset: "OrnateCollar", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],magic: true, Color: ["#555555", "#AAAAAA"], power: 20, weight: 0, difficultyBonus: 30,
		Model: "WolfCollarRestraint",
		Filters: {
			Band: {"gamma":1,"saturation":0.0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Lining: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.78333333333333334,"red":1,"green":1,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": -100, "Cut": -0.8, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: []},

	{renderWhenLinked: [...KDBeltsRender], inventory: true, name: "SturdyLeatherBeltsArms", debris: "Belts", accessible: true, Asset: "SturdyLeatherBelts", LinkableBy: [...KDBeltsBind], Type: "Three", Color: "Default", Group: "ItemArms", bindarms: true, power: 2.5, weight: 0,
		Model: "BeltsArmsAll",
		addTag: ["HandsBehind"],
		escapeChance: {"Struggle": -0.1, "Cut": 0.5, "Remove": 0.22},
		maxwill: 0.9, enemyTags: {"leatherRestraints":6, "beltRestraints": 10, "noBelt": -100}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Leather", "Belts", "ArmBind", "HogtieUpper"]},
	{renderWhenLinked: [...KDBeltsRender], inventory: true, name: "SturdyLeatherBeltsFeet", debris: "Belts", accessible: true, Asset: "SturdyLeatherBelts", LinkableBy: [...KDBeltsBind], Type: "Three", Color: "Default", Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"] ,power: 2, weight: 0,
		Model: "BeltsFeetAll",
		escapeChance: {"Struggle": -0.1, "Cut": 0.5, "Remove": 0.5},
		maxwill: 1.0, enemyTags: {"leatherRestraints":6, "beltRestraints": 10, "noBelt": -100}, playerTagsMissingMult: {"ItemLegsFull": 0.05}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Belts", "LegBind"]},
	{LinkableBy: [...KDBeltsBind], renderWhenLinked: [...KDBeltsRender], accessible: true, inventory: true, name: "SturdyLeatherBeltsLegs", debris: "Belts", Asset: "SturdyLeatherBelts", Type: "Two", Color: "Default", Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 2, weight: 0,
		Model: "BeltsLegsAll",
		escapeChance: {"Struggle": -0.1, "Cut": 0.5, "Remove": 0.5},
		maxwill: 0.8, enemyTags: {"leatherRestraints":6, "beltRestraints": 10, "noBelt": -100}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Leather", "Belts", "LegBind", "HogtieLower"]},


	{renderWhenLinked: [...KDBeltsRender], inventory: true, name: "MagicBeltArms", debris: "Belts", accessible: true, Asset: "SturdyLeatherBelts", LinkableBy: [...KDBeltsBind], Type: "Three", Color: "Default", Group: "ItemArms", bindarms: true, power: 5, weight: 0,
		Model: "BeltsArmsAll",
		addTag: ["HandsBehind"],
		magic: true, DefaultLock: "Purple",
		factionFilters: {
			Belt: {
				color: "Highlight", override: true,
			}
		},
		Filters: {"Belt":{"gamma":1,"saturation":0,"contrast":0.85,"brightness":1,"red":1.9607843137254901,"green":1.0196078431372548,"blue":2.411764705882353,"alpha":1}},
		escapeChance: {"Struggle": -0.12, "Cut": 0.5, "Remove": 0.22},
		maxwill: 0.9, enemyTags: {"leatherRestraintsMagic":6, "beltRestraintsMagic": 10}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, allFloors: true, shrine: ["MagicBelts", "Belts", "Leather", "ArmBind", "HogtieUpper"]},
	{renderWhenLinked: [...KDBeltsRender], inventory: true, name: "MagicBeltFeet", debris: "Belts", accessible: true, Asset: "SturdyLeatherBelts", LinkableBy: [...KDBeltsBind], Type: "Three", Color: "Default", Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"] ,power: 5, weight: 0,
		Model: "BeltsFeetAll",
		magic: true, DefaultLock: "Purple",
		factionFilters: {
			Belt: {
				color: "Highlight", override: true,
			}
		},
		Filters: {"Belt":{"gamma":1,"saturation":0,"contrast":0.85,"brightness":1,"red":1.9607843137254901,"green":1.0196078431372548,"blue":2.411764705882353,"alpha":1}},
		escapeChance: {"Struggle": -0.12, "Cut": 0.5, "Remove": 0.5},
		maxwill: 1.0, enemyTags: {"leatherRestraintsMagic":6, "beltRestraintsMagic": 10}, playerTagsMissingMult: {"ItemLegsFull": 0.05}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["MagicBelts", "Belts", "Leather", "LegBind", "HogtieLower"]},
	{LinkableBy: [...KDBeltsBind], renderWhenLinked: [...KDBeltsRender], accessible: true, inventory: true, name: "MagicBeltLegs", debris: "Belts", Asset: "SturdyLeatherBelts", Type: "Two", Color: "Default", Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 5, weight: 0,
		Model: "BeltsLegsAll",
		factionFilters: {
			Belt: {
				color: "Highlight", override: true,
			}
		},
		Filters: {"Belt":{"gamma":1,"saturation":0,"contrast":0.85,"brightness":1,"red":1.9607843137254901,"green":1.0196078431372548,"blue":2.411764705882353,"alpha":1}},
		magic: true, DefaultLock: "Purple",
		escapeChance: {"Struggle": -0.12, "Cut": 0.5, "Remove": 0.5},
		maxwill: 0.8, enemyTags: {"leatherRestraintsMagic":6, "beltRestraintsMagic": 10}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["MagicBelts", "Belts", "Leather", "LegBind"]},


	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "SteelArmCuffs", debris: "Chains", accessible: true,
		Model: "ShacklesWrists",
		Filters: {
			BaseMetal: {"gamma":1,"saturation":1,"contrast":1.4833333333333334,"brightness":2.0166666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		},
		LinkAll: true,
		Asset: "SteelCuffs", linkCategory: "Cuffs", linkSize: 0.55, Color: ['Default', 'Default'], Group: "ItemArms", bindarms: false, power: 4, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": -0.5, "Remove": 0.15, "Pick": 0.25}, enemyTags: {"steelCuffs":4, "handcuffer": 1}, playerTags: {"ItemArmsFull":-2}, minLevel: 4, allFloors: true, shrine: ["Cuffs", "Metal",  "ArmCuffsBase"],
		maxwill: 0.9
	},


	// Magnetic cuffs
	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "MagneticArmCuffs", debris: "Chains", accessible: true, Asset: "SteelCuffs", linkCategory: "Cuffs", linkSize: 0.55,
		Model: "ShacklesWrists",
		struggleBreak: true,
		Filters: {
			BaseMetal: {"gamma":1,"saturation":1,"contrast":1.4833333333333334,"brightness":2.0166666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		},
		LinkAll: true, Color: ['#444444', '#444444'], Group: "ItemArms", bindarms: false, power: 5, weight: 0,
		escapeChance: {"Struggle": -0.2, "Cut": -0.5, "Remove": 0.15, "Pick": 0.15}, enemyTags: {"magnetCuffs":10}, playerTags: {"ItemArmsFull":-4},
		minLevel: 0, allFloors: true, shrine: ["Cuffs", "Metal",  "ArmCuffsBase", "Elements"],
		maxwill: 0.9, events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "beforePlayerDamage", type: "linkItemOnDamageType", restraint: "WristLink", sfx: "LightJingle", damage: "electric", chance: 1.0, requiredTag: "locked"},
			{trigger: "beforePlayerDamage", type: "lockItemOnDamageType", restraint: "WristLink", sfx: "LightJingle", damage: "electric", chance: 1.0, lock: "Blue"},
		]},

	{inventory: true, nonbinding: true, name: "MagneticAnkleCuffs", Asset: "SteelAnkleCuffs", debris: "Chains",
		LinkAll: true, Color: "#444444",
		Model: "ShacklesAnkles",
		Filters: {
			BaseMetal: {"gamma":1.4166666666666665,"saturation":1,"contrast":1.4833333333333334,"brightness":2.0166666666666666,"red":1,"green":1.8833333333333333,"blue":1.9166666666666667,"alpha":1},
		},
		Group: "ItemFeet", power: 5, weight: 0,
		linkCategory: "AnkleCuffs", linkSize: 0.51, noDupe: true,
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": 0.1, "Pick": 0.15},
		enemyTags: {"magnetCuffs": 5}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Cuffs", "Metal",  "AnkleCuffsBase", "HogtieLower", "Elements"],
		maxwill: 0.8, events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "beforePlayerDamage", type: "linkItemOnDamageType", restraint: "AnkleLinkShort", sfx: "LightJingle", damage: "electric", chance: 1.0, requiredTag: "locked"},
			{trigger: "beforePlayerDamage", type: "lockItemOnDamageType", restraint: "AnkleLinkShort", sfx: "LightJingle", damage: "electric", chance: 1.0, lock: "Blue"},
		]},

	// End magnetic cuffs

	//region Maid
	{inventory: true, name: "MaidJacket", debris: "Belts", Asset: "Bolero", Color: ["#191919", "#A3A3A3"],
		Model: "JacketBolero",
		Filters: {
			Arms: {"gamma":1,"saturation":1,"contrast":1.0333333333333332,"brightness":3.05,"red":1,"green":1,"blue":1,"alpha":1},
			Chest: {"gamma":1,"saturation":1,"contrast":1.0333333333333332,"brightness":3.05,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":0.05,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsChest: {"gamma":1,"saturation":0.05,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 7.5, weight: 0, strictness: 0.2,
		LinkableBy: [...KDJacketLink], renderWhenLinked: [...KDJacketRender],
		limitChance: {"Struggle": 0.12, "Cut": 0.03, "Remove": 0.1, "Unlock": 0.75}, // Hard to escape the arms box by struggling
		escapeChance: {"Struggle": -0.175, "Cut": 0.1, "Remove": 0.15, "Pick": 0.15},
		maxwill: 0.3, enemyTags: {"maidRestraints":5, "maidRestraintsHeavy":14, "maidRestraintsNonChastity": 10, "noMaidJacket":-5},  playerTags: {},
		minLevel: 7, allFloors: true, shrine: ["Latex", "Straitjackets", "Block_ItemHands", "Illusion"]},

	{inventory: true, name: "MaidTransportJacket", debris: "Belts", Asset: "Bolero", Color: ["#191919", "#A3A3A3"],
		Model: "JacketHeavyBolero",
		Filters: {
			Arms: {"gamma":1,"saturation":1,"contrast":1.0333333333333332,"brightness":3.05,"red":1,"green":1,"blue":1,"alpha":1},
			Chest: {"gamma":1,"saturation":1,"contrast":1.0333333333333332,"brightness":3.05,"red":1,"green":1,"blue":1,"alpha":1},
			Lower: {"gamma":1,"saturation":1,"contrast":1.0333333333333332,"brightness":3.05,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":0.05,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsChest: {"gamma":1,"saturation":0.05,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsLower: {"gamma":1,"saturation":0.05,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 10, weight: 0, strictness: 0.3,
		LinkableBy: [...KDTransportLink], renderWhenLinked: [...KDJacketRender],
		limitChance: {"Struggle": 0.08, "Cut": 0.02, "Remove": 0.05, "Unlock": 0.5}, // Hard to escape the arms box by struggling
		escapeChance: {"Struggle": -0.375, "Cut": -0.1, "Remove": -0.15, "Pick": 0.10},

		maxwill: 0.1, enemyTags: {"maidRestraintsHeavy":1, "noMaidJacket":-5},  playerTags: {"MaidJacketWorn":10},
		minLevel: 12, allFloors: true, shrine: ["Latex", "Straitjackets", "Block_ItemHands", "Illusion", "TransportJackets"]},

	{inventory: true, name: "MaidDress", debris: "Fabric", inaccessible: true, Type: "Strap", Asset: "LeatherArmbinder", strictness: 0.25, Color: ['#191919'],
		Model: "Jacket",
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', kind: "Maidforce", mult: 0.8, power: 2,},
		],
		Filters: {
			Arms: {"gamma":1,"saturation":1,"contrast":1.0333333333333332,"brightness":3.05,"red":1,"green":1,"blue":1,"alpha":1},
			Chest: {"gamma":1,"saturation":1,"contrast":1.0333333333333332,"brightness":3.05,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":0.05,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsChest: {"gamma":1,"saturation":0.05,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		},
		forceOutfit: "Lingerie",
		forceOutfitPriority: 1,
		Group: "ItemArms", LinkableBy: [...KDDressLink], alwaysRender: true, bindarms: true, bindhands: 1.0, power: 8.5, weight: 0,
		escapeChance: {"Struggle": -0.175, "Cut": 0.1, "Remove": -0.2, "Pick": 0.15},
		helpChance: {"Remove": 0.075},
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
		],
		alwaysDressModel: [
			{"Model":"MaidShoes","Group":"MaidShoes","override":true,
				"Filters":{
					"ShoeLeft":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},
					"ShoeRight":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1}},
				"factionFilters":
				{
					ShoeLeft: {color: "DarkNeutral", override: true},
					ShoeRight: {color: "DarkNeutral", override: true},
				},
				"inheritFilters":false},{"Model":"LaceBra","Group":"LaceBra","override":true,"Filters":
				{
					"BraBase":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
					"BraCups":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
					"BraStripes":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}
				},"factionFilters":
				{
					BraBase: {color: "DarkNeutral", override: true},
					BraCups: {color: "DarkNeutral", override: true},
					BraStripes: {color: "LightNeutral", override: true},
				},
			"inheritFilters":false},{"Model":"LacePanties","Group":"LacePanties","override":true,"Filters":
				{
					"LaceCrotchPanel":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
					"Panties":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
					"Trim":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
					"Lace":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}
				}, "factionFilters":

				{
					LaceCrotchPanel: {color: "LightNeutral", override: true},
					Panties: {color: "DarkNeutral", override: true},
					Trim: {color: "LightNeutral", override: true},
					Lace: {color: "LightNeutral", override: true},
				},
			"inheritFilters":false},{"Model":"BunnySocks","Group":"BunnySocks","override":true,"Filters":
				{
					"SockRight":{"gamma":1.2,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0980392156862746,"alpha":1},
					"SockLeft":{"gamma":1.2,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0980392156862746,"alpha":1}
				},"factionFilters":

				{
					SockRight: {color: "LightNeutral", override: true},
					SockLeft: {color: "LightNeutral", override: true},
				},
			"inheritFilters":false},{"Model":"LeatherGloves","Group":"LeatherGloves","override":true,"Filters":
				{
					"GloveLeft":{"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0},
					"BandRight":{"gamma":1,"saturation":0,"contrast":0.9833333333333333,"brightness":0.5,"red":1.05,"green":1,"blue":1,"alpha":1},
					"GloveRight":{"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0},
					"RimRight":{"gamma":2,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
					"RimLeft":{"gamma":2,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
					"BandLeft":{"gamma":1,"saturation":0,"contrast":0.9833333333333333,"brightness":0.5,"red":1.05,"green":1,"blue":1,"alpha":1}
				},"factionFilters":

				{
					GloveLeft: {color: "DarkNeutral", override: true},
					GloveRight: {color: "DarkNeutral", override: true},
					RimRight: {color: "LightNeutral", override: true},
					RimLeft: {color: "LightNeutral", override: true},
					BandRight: {color: "Highlight", override: true},
					BandLeft: {color: "Highlight", override: true},
				},
			"inheritFilters":false},{"Model":"BowCorsetLongOverbust","Group":"BowCorsetLongOverbust","override":true,"Filters":
				{
					"CorsetBust":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.1,"alpha":1},
					"RuffleBust":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.1,"alpha":1},
					"Corset":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1.2,"red":1,"green":1,"blue":1.1,"alpha":1},
					"Ruffle":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1.2,"red":1,"green":1,"blue":1.1,"alpha":1}
				},"factionFilters":

				{
					CorsetBust: {color: "LightNeutral", override: true},
					RuffleBust: {color: "Highlight", override: true},
					Corset: {color: "Highlight", override: true},
					Ruffle: {color: "Highlight", override: true},
				},
			"inheritFilters":false},{"Model":"DressBlouseBustCropped","Group":"DressBlouseBust","override":true,"Filters":
				{
					"Neck":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},
					"Collar":{"gamma":1.9,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.1,"alpha":1},
					"Blouse":{"gamma":1.9,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.1,"alpha":1}
				},"factionFilters":

				{
					Blouse: {color: "DarkNeutral", override: true},
					Collar: {color: "LightNeutral", override: true},
					Neck: {color: "DarkNeutral", override: true},
				},
			"inheritFilters":false},{"Model":"BlouseSkirt","Group":"DressBlouseBust","override":true,"Filters":
			{
				"BlouseSkirt":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},
			},"factionFilters":

			{
				BlouseSkirt: {color: "DarkNeutral", override: true},
			},
			"inheritFilters":false},{"Model":"WitchBlouse","Group":"WitchBlouse","override":true,"Filters":
				{
					"BlouseLeft":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},
					"BlouseRight":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},
					"BlouseLiner":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},
					"Blouse":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1}
				},"factionFilters":

				{
					BlouseLeft: {color: "DarkNeutral", override: true},
					BlouseLiner: {color: "DarkNeutral", override: true},
					Blouse: {color: "DarkNeutral", override: true},
					BlouseRight: {color: "DarkNeutral", override: true},
				},
			"inheritFilters":false},{"Model":"BowCorsetBow","Group":"BowCorsetBow","override":true,"Filters":
				{"Bow":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.1,"alpha":1}},"factionFilters":
				{Bow: {color: "Highlight", override: true},},
			"inheritFilters":false},{"Model":"Ribbon","Group":"Ribbon","override":true,"Filters":
				{
					"RibbonBelt":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1.5666666666666669,"red":1,"green":1,"blue":1.1,"alpha":1},
					"RibbonBack":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1.5666666666666669,"red":1,"green":1,"blue":1.1,"alpha":1}
				},"factionFilters":
				{
					RibbonBelt: {color: "Highlight", override: true},
					RibbonBack: {color: "Highlight", override: true},
				},
			"inheritFilters":false}],
		maxwill: 0.3, enemyTags: {"maidRestraints":3, "maidRestraintsHeavy":14, "maidRestraintsNonChastity": 5},
		playerTagsMult: {"ItemArmsEmpty": 0.05}, playerTags: {}, minLevel: 7, allFloors: true,
		addPose: ["PreferWristtie"],
		shrine: ["BindingDress", "Rope", "HandsBehind", "Block_ItemHands", "Illusion"]},
	{inventory: true, name: "MaidBelt", debris: "Belts", Asset: "LeatherBelt", Color: "#DBDBDB", Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 9, weight: 0,
		LinkableBy: [...KDBeltsBind], renderWhenLinked: [...KDBeltsRender],
		accessible: true,
		Model: "BeltsLegs1",
		Filters: {
			Belt: {"gamma":1,"saturation":0,"contrast":0.9666666666666667,"brightness":4.016666666666667,"red":1,"green":1,"blue":1.1,"alpha":1},
		},
		escapeChance: {"Struggle": -0.5, "Cut": 0.05, "Remove": 0.1, "Pick": 0.25},
		maxwill: 1.0, enemyTags: {"maidRestraints":10, "maidRestraintsNonChastity": 10, "maidRestraintsLight":1}, playerTags: {"ItemLegsFull":-2}, minLevel: 2, allFloors: true, shrine: ["Leather", "Belts"]},
	{inventory: true, name: "MaidAnkleCuffs", debris: "Chains", Asset: "SteelAnkleCuffs", LinkableBy: [...KDBindable, ...KDDevices], Type: "Chained", Color: "Default", Group: "ItemFeet",
		alwaysDressModel: [
			{Model: "AnkleLink", inheritFilters: true}
		],
		Model: "ShacklesAnkles",
		Filters: {
			BaseMetal: {"gamma":1,"saturation":1,"contrast":1,"brightness":1.9500000000000002,"red":1,"green":1,"blue":1,"alpha":1},
		},
		hobble: 1, power: 9, weight: 0,
		linkCategory: "AnkleCuffs", linkSize: 0.4, noDupe: true,
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": 0.1, "Pick": 0.15},
		enemyTags: {"maidRestraints":7, "maidRestraintsNonChastity": 10, "steelCuffs": 5}, playerTags: {"ItemFeetFull":-2}, minLevel: 4, allFloors: true, shrine: ["Cuffs", "Metal",  "AnkleCuffsBase", "HogtieLower", "Illusion"],
		maxwill: 0.8,},
	{inventory: true, name: "MaidCollar", debris: "Belts", Asset: "HighCollar", Color: ["#C9C9C9", "#FFFFFF"], Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDHighCollarRender],power: 11, weight: 0,
		Model: "LeatherCollarBow",
		struggleBreak: true,
		Filters: {
			Cuff: {"gamma":2.2333333333333334,"saturation":1,"contrast":1.0833333333333335,"brightness":2.283333333333333,"red":1,"green":1,"blue":1,"alpha":1},
			Band: {"gamma":1,"saturation":0.05,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": -0.3, "Cut": -0.25, "Remove": 0.4, "Pick": -0.1},
		unlimited: true,
		linkCategory: "BasicCollar", linkSize: 0.51,
		maxwill: 0.25, enemyTags: {"maidRestraints":3, "maidRestraintsNonChastity": 10, "maidCollar":1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["HighCollars", "Collars", "Illusion"]},
	{inventory: true, name: "MaidGag", debris: "Belts", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], gag: 0.75,
		Model: "MaidGag",
		Filters: {
			Straps: {"gamma":1,"saturation":0.05,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Panel: {"gamma":1,"saturation":0.05,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		},
		Asset: "MuzzleGag", Color: "Default", Group: "ItemMouth", AssetGroup: "ItemMouth2", power: 8, weight: 0,
		limitChance: {"Struggle": 0.12},
		escapeChance: {"Struggle": -0.18, "Cut": 0.05, "Remove": 0.33, "Pick": 0.15},
		maxwill: 0.75, enemyTags: {"maidRestraints":7, "maidRestraintsNonChastity": 10, }, playerTags: {}, minLevel: 4, allFloors: true, shrine: ["FlatGags", "Leather", "Gags", "Illusion"]},
	{inventory: true, name: "MaidMuzzle", debris: "Belts", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], gag: 0.75,
		inaccessible: true,
		Model: "PlugMuzzleGag",
		Asset: "MuzzleGag", Color: "Default", Group: "ItemMouth", AssetGroup: "ItemMouth2", power: 9, weight: 0,
		limitChance: {"Struggle": 0.18},
		escapeChance: {"Struggle": -0.18, "Cut": -0.03, "Remove": 0.5, "Pick": -0.1}, DefaultLock: "Disc",
		maxwill: 0.5, enemyTags: {"maidRestraints":4, "maidRestraintsHeavy":14, "maidRestraintsNonChastity": 6, }, playerTags: {"ItemMouthEmpty": -30}, minLevel: 7, allFloors: true, shrine: ["FlatGags", "Leather", "Gags", "Illusion"]},

	{inventory: true, name: "DusterGag", debris: "Belts", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], gag: 1.0,
		Model: "DusterGag",
		Filters: {
			Straps: {"gamma":1,"saturation":0.05,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Panel: {"gamma":1,"saturation":0.05,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		},
		events: [
			{trigger: "playerAttack", type: "ElementalEffect", power: 0.5, distract: 3.0, damage: "tickle", sfx: "Tickle"},
			{trigger: "playerAttack", type: "DestroyDirt", power: 5, damage: "plush"},
			{trigger: "playerAttack", type: "DestroyMold", power: 2, damage: "plush"},
		],
		value: 100,
		Asset: "MuzzleGag", Color: "Default", Group: "ItemMouth", AssetGroup: "ItemMouth2", power: 8, weight: 0, DefaultLock: "Blue",
		limitChance: {"Struggle": 0.15},
		escapeChance: {"Struggle": -0.18, "Cut": 0.05, "Remove": 0.33, "Pick": 0.1},
		good: true, alwaysKeep: true, showInQuickInv: true,
		maxwill: 0, enemyTags: {}, playerTags: {"dustergag": 100}, minLevel: 0, allFloors: true, shrine: ["FlatGags", "Gags"]},
	// Maid chastity.
	{inventory: true, arousalMode: true, name: "MaidCBelt", Asset: "PolishedChastityBelt", OverridePriority: 26, Color: "Default", Group: "ItemPelvis", chastity: true, power: 9, weight: 0,
		Security: {
			level_key: 3,
		},
		Model: "HeartBelt",
		LinkableBy: ["Wrapping", "Ornate"],
		factionFilters: {
			Lining: {color: "Highlight", override: true},
			Lock: {color: "Highlight", override: true},
		},
		Filters: {
			Lock: {"gamma":1,"saturation":0,"contrast":2.183333333333333,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Lining: {"gamma":1,"saturation":0.05,"contrast":0.6333333333333334,"brightness":0.23333333333333334,"red":1,"green":1,"blue":1,"alpha":1},
			Steel: {"gamma":1,"saturation":0.6333333333333334,"contrast":0.9833333333333333,"brightness":1.4166666666666665,"red":1,"green":1,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": 0.5, "Pick": 0.12},
		maxwill: 0.75, enemyTags: {"maidVibeRestraints": 200, "maidVibeRestraintsLimited": 100, "maidChastityBelt": 200}, playerTags: {"ItemVulvaEmpty" : -50, "ItemVulvaPiercingsEmpty" : -50}, minLevel: 0, allFloors: true, shrine: ["Chastity", "Metal", "ChastityBelts", "Illusion"]},

	//endregion

	//region Dragon
	{inventory: true, name: "DragonArmbinder", debris: "Belts", inaccessible: true, Asset: "BoxTieArmbinder", strictness: 0.08,
		LinkableBy: [...KDBoxbinderLink], renderWhenLinked: [...KDBoxbinderLink],
		Color: ["#9B1818", "#ffffff"], Group: "ItemArms", bindarms: true, bindhands: 1.0, power: 7, weight: 0,
		Model: "Jacket",
		Filters: {
			BeltsArms: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":2.1333333333333333,"green":1,"blue":1,"alpha":1},
			BeltsChest: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":2.1333333333333333,"green":1,"blue":1,"alpha":1},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Armbinders": 3.5,
			"Less_Armbinders": 0.1,
		},
		escapeChance: {"Struggle": 0.0, "Cut": -0.05, "Remove": 0.1, "Pick": 0.25}, // Hard to escape the arms box by struggling
		limitChance: {"Struggle": 0.1, "Remove": 0.1, "Pick": 0.05, "Unlock": 0.5},
		maxwill: 0.25, enemyTags: {"dragonRestraints" : 2}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Boxbinders", "Block_ItemHands"]},
	{inventory: true, name: "DragonStraps", debris: "Belts", Asset: "ThinLeatherStraps", LinkableBy: ["Boxbinders"], Color: "#9B1818", Group: "ItemArms", bindarms: true, power: 8, weight: 0,
		Model: "JacketStraps",
		addPose: ["HandsBehind"],
		accessible: true,
		Filters: {
			BeltsArms: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":2.1333333333333333,"green":1,"blue":1,"alpha":1},
			BeltsChest: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":2.1333333333333333,"green":1,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": -0.175, "Cut": -0.05, "Remove": 0.1, "Pick": 0.25},
		maxwill: 0.7, enemyTags: {"dragonRestraints":6}, playerTags: {"ItemArmsFull":-2}, minLevel: 4, allFloors: true, shrine: ["Leather", "Belts"]},
	{inventory: true, name: "DragonStrongStraps", debris: "Belts", Asset: "ThinLeatherStraps", LinkableBy: ["Boxbinders"], Color: "#9B1818", Group: "ItemArms", bindarms: true, power: 10, weight: 0,
		Model: "JacketHeavyStraps",
		addPose: ["HandsBehind"],
		accessible: true,
		Filters: {
			BeltsArms: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":2.1333333333333333,"green":1,"blue":1,"alpha":1},
			BeltsChest: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":2.1333333333333333,"green":1,"blue":1,"alpha":1},
			BeltsLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":2.1333333333333333,"green":1,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": -0.375, "Cut": -0.25, "Remove": -0.1, "Pick": 0},
		limitChance: {"Struggle": 0.25, "Cut": 0.14, "Remove": 0.12},
		maxwill: 0.3, enemyTags: {"dragonRestraints":1}, playerTags: {"ItemArmsFull":2}, minLevel: 12, allFloors: true, shrine: ["Boxbinders", "Leather", "Belts"]},
	{inventory: true, name: "DragonBoots", debris: "Belts", Asset: "BalletWedges", Color: "#424242", Group: "ItemBoots", heelpower: 1, power: 7, weight: 0, remove: ["Shoes"],
		Model: "BalletHeelsRestraint",
		Filters: {
			Laces: {"gamma":1,"saturation":1,"contrast":1.7999999999999998,"brightness":1.0833333333333335,"red":1.0333333333333332,"green":1,"blue":1,"alpha":1},
			Sole: {"gamma":1,"saturation":1,"contrast":1,"brightness":1.7166666666666666,"red":1,"green":1,"blue":1,"alpha":1},
			Shoe: {"gamma":1,"saturation":0.08333333333333333,"contrast":1,"brightness":0.55,"red":2.816666666666667,"green":1,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": 0.025, "Cut": -0.05, "Remove": 0.1, "Pick": 0.25},
		enemyTags: {"dragonRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 2, allFloors: true, shrine: ["Heels", "Leather", "Boots"]},
	{inventory: true, name: "DragonBallGag", debris: "Belts", LinkableBy: [...KDBallGagLink], renderWhenLinked: [...KDBallGagLink], gag: 0.65, Asset: "FuturisticHarnessBallGag",
		Model: "BallGagHarnessSecure",
		Filters: {
			Strap: {"gamma":1,"saturation":1,"contrast":1.9500000000000002,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Harness: {"gamma":1,"saturation":1,"contrast":1.9500000000000002,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Ball: {"gamma":0.5166666666666666,"saturation":0.7166666666666667,"contrast":1.9333333333333333,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		},
		events: [
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.35, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.25, requiredTag: "Blindfolds"},
		],
		ApplyVariants: {
			"AntiMagic": {
				weightMod: -10,
				weightMult: 0.3,
				enemyTags: {forceAntiMagic: 100, antiMagic: 16, ballGagRestraintsMagic: 10},
				playerTagsMult: {"ItemMouthFull": 0.1},
			},
		},
		strictness: 0.3, Color: ['#680000', '#680000', '#680000', '#680000', '#680000'], Group: "ItemMouth", power: 7, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.05, "Remove": 0.1, "Pick": 0.25},
		maxwill: 0.6, enemyTags: {"dragonRestraints":6, forceAntiMagic: -100}, playerTags: {"ItemFeetFull":-2}, minLevel: 7, allFloors: true, shrine: ["BallGags", "Leather", "Latex" , "Gags"]},
	{inventory: true, name: "DragonMuzzleGag", debris: "Belts", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], gag: 0.3, Asset: "StitchedMuzzleGag", Color: "#9B1818", Group: "ItemMouth", AssetGroup: "ItemMouth3", power: 7, weight: -6,
		Model: "ShinyLatexMuzzle",
		Filters: {
			Gag: {"gamma":1,"saturation":1,"contrast":1.4166666666666665,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Rim: {"gamma":0.6166666666666667,"saturation":1.0166666666666666,"contrast":0.3333333333333333,"brightness":1.7999999999999998,"red":0.8666666666666667,"green":0.23333333333333334,"blue":0.43333333333333335,"alpha":1},
		},
		factionFilters: {
			Gag: {color: "DarkNeutral", override: false},
			Rim: {color: "Highlight", override: true},
		},
		escapeChance: {"Struggle": 0.05, "Cut": 0.0, "Remove": 0.1},
		maxwill: 0.75, enemyTags: {"dragonRestraints":6}, playerTags: {"ItemMouthFull":4, "ItemMouth2Full":4}, minLevel: 0, allFloors: true, shrine: ["FlatGags", "Leather", "Gags"]},
	{inventory: true, name: "DragonCollar", debris: "Belts", Asset: "LatexCollar2", Color: "#9B1818", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: 4,
		Model: "StardustCollar",
		Filters: {
			Collar: {"gamma":0.5666666666666667,"saturation":0.06666666666666667,"contrast":2.633333333333333,"brightness":1,"red":3.05,"green":1,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": -0.2, "Cut": -0.1, "Remove": 0.1},
		unlimited: true,
		tightType: "Secure",
		maxwill: 0.25, enemyTags: {"dragonRestraints":6, "dragonCollar": 4}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["Collars"]},
	//endregion

	//region ShadowLatex

	{removePrison: true, name: "ShadowBallSuit", Asset: "VacCube", Color: ["#88aaff"], Group: "ItemDevices", power: 8, weight: 1, alwaysStruggleable: true,
		Model: "BallSuit", LinkableBy: ["Container"],renderWhenLinked: ["Container"],
		bindarms: true,
		restriction: 30,
		tightType: "Thick",
		addTag: ["ForceKneel", "NoHogtie"],
		failSuffix: {Remove: "Bubble", Struggle: "Bubble", Cut: "Bubble"},
		escapeChance: {"Struggle": -0.4, "Cut": -0.5, "Remove": -10},
		helpChance: {"Struggle": -0.3, "Cut": -0.1, "Remove": -10},
		affinity: {
			Struggle: ["Sharp"],
			Remove: ["Sharp"],
		},
		Filters: {"BallSuit":{"gamma":0.5,"saturation":1.2166666666666668,"contrast":0.7166666666666667,"brightness":1.0833333333333335,"red":0.6333333333333334,"green":0.16666666666666666,"blue":0.65,"alpha":0.9333333333333333}},
		events: [
			//{trigger: "tick", type: "callGuardFurniture", inheritLinked: true},
			{trigger: "beforePlayerDamage", type: "bounce", chance: 0.4, sfx: "RubberBolt", inheritLinked: true},
			{trigger: "playerMove", type: "tipBallsuit", inheritLinked: true},
			{trigger: "tick", type: "shadowDrain", power: -0.1, inheritLinked: true},
		],
		enemyTags: {"shadowBall":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "ShadowLatex", "Latex", "BallSuit", "ShadowEncase"], removeOnLeash: true,
	},

	{inventory: true, name: "ShadowLatexPetsuit", inaccessible: true, debris: "Slime", Color: "Default", Group: "ItemArms",
		Model: "LatexPetsuitGlow",
		bindarms: true, bindhands: 1.0, addTag: ["ForceKneel"], power: 9, weight: 0,
		hobble: 2,
		Filters: {
			Arms: {"gamma":1.3333333333333333,"saturation":0,"contrast":1.45,"brightness":1,"red":0.6078431372549019,"green":0.6078431372549019,"blue":1.196078431372549,"alpha":1},
			Legs: {"gamma":1.3333333333333333,"saturation":0,"contrast":1.45,"brightness":1,"red":0.6078431372549019,"green":0.6078431372549019,"blue":1.196078431372549,"alpha":1},
			Glow: {"gamma":1.3333333333333333,"saturation":0,"contrast":1.45,"brightness":1,"red":0.6078431372549019,"green":0.6078431372549019,"blue":1.196078431372549,"alpha":.25},
			GlowTorso: {"gamma":1.3333333333333333,"saturation":0,"contrast":1.45,"brightness":1,"red":0.6078431372549019,"green":0.6078431372549019,"blue":1.196078431372549,"alpha":.04},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
		},
		alwaysDressModel: [
			{
				Model: "TransparentCatsuit",
				Filters: {
					TorsoUpper: {"gamma":1.3333333333333333,"saturation":0,"contrast":1.45,"brightness":1,"red":0.6078431372549019,"green":0.6078431372549019,"blue":1.196078431372549,"alpha":1},
					TorsoLower: {"gamma":1.3333333333333333,"saturation":0,"contrast":1.45,"brightness":1,"red":0.6078431372549019,"green":0.6078431372549019,"blue":1.196078431372549,"alpha":1},
				},
			},
		],
		remove: ["Bras", "Panties", "Skirts", "Socks", "Shirts", "Boots"],
		escapeChance: {"Struggle": -0.45, "Cut": -0.05, "Remove": -0.35, "Pick": 0.15},
		helpChance: {"Remove": 0.1}, maxwill: 0.15, enemyTags: {"shadowLatexPetsuit": 3},
		playerTags: {"NoPet": -1000}, minLevel: 9, allFloors: true, shrine: ["ShadowLatex", "Petsuits", "Latex", "Illusion", "HinderFeet"]},


	{inventory: true, name: "ShadowLatexGagCollar", debris: "Belts", inaccessible: true, Asset: "LatexPostureCollar", gag: 0.4, Color: "#4E7DFF",
		Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDHighCollarRender],factionColor: [[0]], power: 9, weight: -2,
		strictness: 0.05, escapeChance: {"Struggle": -0.15, "Cut": -0.05, "Remove": 0.1, "Pick": 0.2},
		Model: "LatexNeckCorsetGagRestraint",
		factionFilters: {
			Rim: {color: "Highlight", override: true},
		},
		Filters: {
			Neck: {"gamma":1,"saturation":0,"contrast":1.0666666666666667,"brightness":0.9166666666666666,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
			Latex: {"gamma":1,"saturation":0,"contrast":1.0666666666666667,"brightness":0.9166666666666666,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
			Rim: {"gamma":1,"saturation":0,"contrast":1.0666666666666667,"brightness":0.9166666666666666,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
		},
		maxwill: 0.25, enemyTags: {"shadowLatexGag" : 3, "shadowLatexRestraints": 7}, playerTags: {"ItemMouthFull": 2, "ItemMouth2Full": 2, "ItemMouth3Full": 2},
		minLevel: 3, allFloors: true, shrine: ["ShadowLatex", "Latex", "Posture", "HighCollars", "Collars"]},

	{inventory: true, sfx: "Fwoosh", name: "ShadowLatexHeels", inaccessible: true, Asset: "FuturisticHeels2", remove: ["Shoes"],
		Model: "BalletHeelsRestraint",
		Filters: {
			Sole: {"gamma":1.25,"saturation":1,"contrast":1.5333333333333332,"brightness":1,"red":1,"green":1,"blue":2.8666666666666667,"alpha":1},
			Shoe: {"gamma":1.6,"saturation":0.3833333333333333,"contrast":1.6833333333333333,"brightness":0.43333333333333335,"red":1,"green":1,"blue":1.1166666666666667,"alpha":1},
		},

		Color: ["#222222", "#4e2a70", "#ffffff", "Default", "#b927a8", "#222222", "#000000"],
		Group: "ItemBoots", heelpower: 1, power: 8, weight: 0,
		escapeChance: {"Struggle": -0.3, "Cut": -0.05, "Remove": 0.15, "Pick": 0.24},
		limitChance: {"Struggle": 0.25, "Cut": 0.14, "Remove": 0.12}, // Hard to escape the arms box by struggling
		maxwill: 0.8, enemyTags: {"shadowLatexRestraints" : 10},
		playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Heels", "Latex", "Boots", "ShadowLatex", "Obsidian", ]},
	{inventory: true, sfx: "Fwoosh", name: "ShadowLatexStraitjacket", inaccessible: true, remove: ["Bra", "Tops"], Asset: "StraitLeotard", Modules: [1, 1, 1, 1], Color: ["#4e2a70", "#4e2a70", "#4e2a70"], Group: "ItemArms",

		LinkableBy: [...KDJacketLink],
		renderWhenLinked: [...KDJacketRender],
		Model: "JacketLeotard",
		Filters: {
			BeltsChest: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Chest: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			Arms: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			LatexLower: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
			LatexUpper: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
		},
		bindarms: true, bindhands: 1.0, power: 9, weight: 0, strictness: 0.2,
		escapeChance: {"Struggle": -0.3, "Cut": -0.05, "Remove": 0.1, "Pick": 0.2},
		limitChance: {"Struggle": 0.25, "Cut": 0.14, "Remove": 0.08, "Unlock": 0.75}, // Hard to escape the arms box by struggling
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		maxwill: 0.25, enemyTags: {"shadowLatexRestraintsHeavy" : 3}, playerTags: {"posLatex": -1}, minLevel: 7, allFloors: true,
		shrine: ["Latex", "ShadowLatex", "Obsidian", "Straitjackets", "Block_ItemHands"]},

	{inventory: true, sfx: "Fwoosh", name: "ShadowLatexStrongJacket", inaccessible: true, remove: ["Bra", "Tops"], Asset: "StraitLeotard", Modules: [1, 1, 1, 1], Color: ["#4e2a70", "#4e2a70", "#4e2a70"], Group: "ItemArms",
		events: [
			{trigger: "tick", type: "shadowDrain", power: -0.1, inheritLinked: true},
		],
		LinkableBy: [...KDJacketLink],
		renderWhenLinked: [...KDJacketRender],
		Model: "JacketExtraLeotard",
		Filters: {
			BeltsChest: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsLower: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Chest: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			Arms: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			Lower: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			LatexLower: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
			LatexUpper: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		bindarms: true, bindhands: 1.33, power: 11, weight: 0, strictness: 0.4, DefaultLock: "Purple",
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": -0.1, "Pick": -0.1},
		limitChance: {"Struggle": 0.15, "Cut": 0.05, "Remove": 0.04, "Unlock": 0.5}, // Hard to escape the arms box by struggling
		maxwill: 0.25, enemyTags: {"shadowLatexRestraintsHeavy" : -5}, playerTags: {"posLatex": -1, "ShadowLatexStraitjacketWorn": 10}, minLevel: 12, allFloors: true,
		shrine: ["Latex", "ShadowLatex", "Obsidian", "Straitjackets", "Block_ItemHands", "TransportJackets"]},

	{inventory: true, sfx: "Fwoosh", name: "ShadowLatexArmbinder", inaccessible: true, Asset: "SeamlessLatexArmbinder",

		Model: "JacketLeotard",
		Filters: {
			BeltsChest: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Chest: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			Arms: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			LatexLower: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
			LatexUpper: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
		},
		strictness: 0.2, LinkableBy: [...KDArmbinderLink], Color: ["#4e2a70"], Group: "ItemArms",
		renderWhenLinked: [...KDArmbinderLink],
		bindarms: true, bindhands: 1.0, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.3, "Cut": -0.05, "Remove": 0.1, "Pick": 0.2},
		limitChance: {"Struggle": 0.2, "Cut": 0.1, "Remove": 0.85, "Unlock": 0.2},

		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Armbinders": 3.5,
			"Less_Armbinders": 0.1,
		},
		maxwill: 0.35, enemyTags: {"shadowLatexRestraints" : 5, "shadowLatexRestraintsForced" : 15}, playerTags: {"posLatex": -1}, minLevel: 0, allFloors: true,
		shrine: ["Latex", "ShadowLatex", "Obsidian", "Armbinders", "Block_ItemHands"]},

	{inventory: true, sfx: "Fwoosh", name: "ShadowLatexStrongArmbinder", inaccessible: true, remove: ["Bra", "Tops"], Asset: "StraitLeotard", Modules: [1, 1, 1, 1], Color: ["#4e2a70", "#4e2a70", "#4e2a70"], Group: "ItemArms",
		events: [
			{trigger: "tick", type: "shadowDrain", power: -0.1, inheritLinked: true},
		],
		LinkableBy: [...KDDressLink],
		renderWhenLinked: [...KDArmbinderLink],
		Model: "JacketExtraLeotard",
		Filters: {
			BeltsChest: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsLower: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Chest: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			Arms: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			Lower: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			LatexLower: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
			LatexUpper: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		bindarms: true, bindhands: 1.33, power: 11, weight: 0, strictness: 0.4, DefaultLock: "Purple",
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": -0.1, "Pick": -0.1},
		limitChance: {"Struggle": 0.15, "Cut": 0.05, "Remove": 0.5, "Unlock": 0.05}, // Hard to escape the arms box by struggling
		maxwill: 0.25, enemyTags: {"shadowLatexRestraintsHeavy" : -5}, playerTags: {"posLatex": -1, "ShadowLatexArmbinderWorn": 10}, minLevel: 12, allFloors: true,
		shrine: ["Latex", "ShadowLatex", "Obsidian", "Armbinders", "Block_ItemHands"]},

	{inventory: true, sfx: "Fwoosh", name: "ShadowLatexBoxbinder", inaccessible: true, Asset: "BoxTieArmbinder",
		Model: "JacketLeotard",
		Filters: {
			BeltsChest: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Chest: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			Arms: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			LatexLower: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
			LatexUpper: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Boxbinders": 3.5,
			"Less_Boxbinders": 0.1,
		},
		strictness: 0.2, LinkableBy: [...KDBoxbinderLink], Color: ["#4e2a70"], Group: "ItemArms",
		bindarms: true, bindhands: 1.0, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.3, "Cut": -0.05, "Remove": 0.1, "Pick": 0.2},
		limitChance: {"Struggle": 0.2, "Cut": 0.1, "Remove": 0.85, "Unlock": 0.2},
		maxwill: 0.35, enemyTags: {"shadowLatexRestraints" : 5, "shadowLatexRestraintsForced" : 15}, playerTags: {"posLatex": -1}, minLevel: 0, allFloors: true,
		shrine: ["Latex", "ShadowLatex", "Obsidian", "Boxbinders", "Block_ItemHands"]},
	{renderWhenLinked: [...KDLegbinderRender], inventory: true, sfx: "Fwoosh", name: "ShadowLatexLegbinder", inaccessible: true, Asset: "SeamlessLegBinder", LinkableBy: [...KDLegbinderLink], Color: ["#4e2a70"], Group: "ItemLegs",
		Model: "Hobbleskirt",
		Filters: {
			Rubber: {"gamma":1.3333333333333333,"saturation":0,"contrast":1.45,"brightness":1,"red":0.6078431372549019,"green":0.6078431372549019,"blue":1.196078431372549,"alpha":0.8333333333333333},
		},
		hobble: 1, addTag: ["FeetLinked"], power: 9, weight: 0, blockfeet: true,
		escapeChance: {"Struggle": -0.25, "Cut": -0.05, "Remove": 0.1, "Pick": 0.25},
		maxwill: 0.2,
		enemyTags: {"shadowLatexRestraintsHeavy" : 6}, playerTags: {"posLatex": -1, "ItemFeetEmpty": -4, "ItemLegsEmpty": -4},
		minLevel: 4, allFloors: true, shrine: ["Latex", "ShadowLatex", "Obsidian", "Legbinders"]},

	{inventory: true, sfx: "Fwoosh", name: "ShadowLatexStrongBoxbinder", inaccessible: true, remove: ["Bra", "Tops"], Asset: "StraitLeotard", Modules: [1, 1, 1, 1], Color: ["#4e2a70", "#4e2a70", "#4e2a70"], Group: "ItemArms",
		events: [
			{trigger: "tick", type: "shadowDrain", power: -0.1, inheritLinked: true},
		],
		LinkableBy: [...KDBoxbinderLink],
		renderWhenLinked: [...KDBoxbinderLink],
		Model: "JacketExtraLeotard",
		Filters: {
			BeltsChest: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsArms: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			BeltsLower: {"gamma":1,"saturation":0,"contrast":1.7166666666666666,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Chest: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			//Arms: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			Lower: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":1.3666666666666667,"red":1,"green":1,"blue":1.9,"alpha":0.8333333333333333},
			LatexLower: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
			LatexUpper: {"gamma":1,"saturation":1,"contrast":0.8666666666666667,"brightness":2.0833333333333335,"red":1,"green":1,"blue":1.9,"alpha":0.9166666666666666},
		},
		playerTagsMult: {
			"ItemArmsEmpty": 0.05,
			"More_Jackets": 3.5,
			"Less_Jackets": 0.1,
		},
		bindarms: true, bindhands: 1.33, power: 11, weight: 0, strictness: 0.4, DefaultLock: "Purple",
		escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": -0.1, "Pick": -0.1},
		limitChance: {"Struggle": 0.15, "Cut": 0.05, "Remove": 0.5, "Unlock": 0.05}, // Hard to escape the arms box by struggling
		maxwill: 0.25, enemyTags: {"shadowLatexRestraintsHeavy" : -5}, playerTags: {"posLatex": -1, "ShadowLatexBoxbinderWorn": 10}, minLevel: 12, allFloors: true,
		shrine: ["Latex", "ShadowLatex", "Obsidian", "Boxbinders", "Block_ItemHands"]},

	//endregion

	//region Obsidian
	{inventory: true, removePrison: true, name: "ObsidianLeash",
		debris: "Belts", tether: 2.9, Asset: "CollarLeash",
		Color: "#44fF76", Group: "ItemNeckRestraints", leash: true, power: 3, weight: 10, harness: true,
		Model: "Leash",
		struggleBreak: true,
		magic: true,
		affinity: {
			Cut: ["SharpHookOrFoot"],
			Struggle: ["HookOrFoot"],
		},
		Filters: {
			Leash: {"gamma":1,"saturation":0,"contrast":0.8166666666666667,"brightness":1.7166666666666666,"red":1.3833333333333333,"green":1,"blue":3.2666666666666666,"alpha":0.6833333333333333},
		},
		unlimited: true,
		events: [
			{trigger: "postRemoval", type: "RequireCollar"},
		],
		requireAllTagsToEquip: ["Collars"],
		limitChance: {Struggle: 0.1, Cut: 0.1},
		DefaultLock: "Purple",
		escapeChance: {"Struggle": -0.35, "Cut": 0.05, "Remove": 0.4, "Pick": 0.35},
		enemyTags: {"obsidianLeash":9, "obsidianRestraints": 10},
		playerTags: {"ItemNeckRestraintsFull":-2, "ItemNeckFull":999},
		minLevel: 0, allFloors: true, shrine: ["Leashes", "Leashable"]},

	{inventory: true, name: "ObsidianGag", debris: "Chains", gag: 0.75, Asset: "MuzzleGag", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], Color: ["#1C1847", "#1C1847"], Group: "ItemMouth", AssetGroup: "ItemMouth3", power: 9, weight: -4, escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		Model: "GagMetalRiveted",
		Filters: {
			Metal: {"gamma":0.55,"saturation":1,"contrast":1.6500000000000001,"brightness":0.9833333333333333,"red":1.1333333333333333,"green":0.95,"blue":2.833333333333333,"alpha":1},
			Rivets: {"gamma":0.18333333333333335,"saturation":1,"contrast":3.7666666666666666,"brightness":0.4,"red":1.6666666666666665,"green":1.4166666666666665,"blue":0.6,"alpha":1},
		},
		factionFilters: {
			Rivets: {color: "Highlight", override: true},
			Metal: {color: "DarkNeutral", override: true},
		},
		maxwill: 0.7, enemyTags: {"obsidianRestraints":8}, playerTags: {"ItemMouth3Full":-2, "ItemMouth2Full":2, "ItemMouth1Full":2}, minLevel: 4, allFloors: true, shrine: ["Metal", "Gags", "Obsidian", "Elements", "FlatGags"]},
	{inventory: true, name: "ObsidianCollar", debris: "Chains", Asset: "OrnateCollar", Color: ["#171222", "#9B63C5"], Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDHighCollarRender],power: 9, weight: -2, escapeChance: {"Struggle": -0.2, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		maxwill: 0.25, enemyTags: {"obsidianRestraints":4, "obsidianCollar": 4, "obsidianNoCuffs": -1000, "obsidianLessCuffs": -3.9, "obsidianCuffs":100}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Collars", "Obsidian", "Elements", "HighCollars"],
		Model: "SteelCollarRunes",
		struggleBreak: true,
		tightType: "Secure",
		Filters: {
			Runes: {"gamma":1,"saturation":1,"contrast":0.3833333333333333,"brightness":0.48333333333333334,"red":1,"green":2.8499999999999996,"blue":3.3000000000000003,"alpha":3.7666666666666666},
			BaseMetal: {"gamma":0.95,"saturation":1,"contrast":1.6166666666666665,"brightness":1.7999999999999998,"red":1.0166666666666666,"green":0.9833333333333333,"blue":2.5333333333333337,"alpha":1},
		},
		factionFilters: {
			Runes: {color: "Highlight", override: true},
			BaseMetal: {color: "DarkNeutral", override: true},
		},
		unlimited: true,
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},{trigger: "beforeStruggleCalc", type: "obsidianDebuff", power: 0.15, inheritLinked: true}
		]},
	//endregion


	//region BanditCuffs
	{inventory: true, name: "BanditLivingCollar", debris: "Fabric", Asset: "LatexCollar2", factionColor: [[], [0]], Color: "Default", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: 4, DefaultLock: "Blue",
		Model: "ElfCollarRestraint",
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		struggleBreak: true,
		tightType: "Secure",
		maxwill: 0.25, enemyTags: {"livingCollar":10}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["Collars", "Metal"],
		events: [{trigger: "tick", type: "livingRestraints", tags: ["banditMagicRestraints"], cloneTags: [], inheritLinked: true, frequencyMax: 60, frequencyMin: 10, frequencyStep: 0.8, count: 4}]
	},
	{inventory: true, name: "BanditLegCuffs", debris: "Chains", accessible: true, Asset: "OrnateLegCuffs", LinkableBy: ["Legbinders", "Hobbleskirts", "Belts", "Ties"], Type: "Chained", Color: ["#aaaaaa", "#e7cf1a", "#ff5277"], Group: "ItemLegs", hobble: 1, power: 7, weight: 0,
		Model: "ShacklesThigh",
		struggleBreak: true,
		Filters: {
			BaseMetal: {"gamma":1.4166666666666665,"saturation":1,"contrast":1.4833333333333334,"brightness":1.1833333333333333,"red":2.3499999999999996,"green":1.9666666666666666,"blue":1.1333333333333333,"alpha":1},
		},
		alwaysDressModel: [
			{Model: "ThighLink", inheritFilters: true}
		],
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": 0.2, "Pick": 0.35},
		maxwill: 0.8, enemyTags: {"banditMagicRestraints":6}, playerTags: {"ItemLegsFull":-2}, minLevel: 7,
		allFloors: true, shrine: ["Metal", "Cuffs"],
		events: [
			{trigger: "struggle", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
			{trigger: "playerAttack", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
		]},
	{inventory: true, name: "BanditAnkleCuffs", debris: "Chains", accessible: true, Asset: "OrnateAnkleCuffs", LinkableBy: [...KDBindable], Type: "Chained", Color: ["#675F50", "#e7cf1a", "#ff5277"], Group: "ItemFeet", hobble: 1, power: 7, weight: 0,
		Model: "ShacklesAnkles",
		struggleBreak: true,
		Filters: {
			BaseMetal: {"gamma":1.4166666666666665,"saturation":1,"contrast":1.4833333333333334,"brightness":1.1833333333333333,"red":2.3499999999999996,"green":1.9666666666666666,"blue":1.1333333333333333,"alpha":1},
		},
		linkCategory: "AnkleCuffs", linkSize: 0.51, noDupe: true,
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove":  0.2, "Pick": 0.35}, enemyTags: {"banditMagicRestraints":6}, playerTags: {"ItemFeetFull":-2}, minLevel: 2, allFloors: true, shrine: ["Cuffs", "Metal",  "AnkleCuffsBase", "HogtieLower"],
		maxwill: 1.0, events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "struggle", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
			{trigger: "playerAttack", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
		]},

	{renderWhenLinked: ["Ties"], nonbinding: true, inventory: true, name: "BanditArmCuffs", debris: "Chains", accessible: true, Asset: "OrnateCuffs", linkCategory: "Cuffs", linkSize: 0.55,
		LinkAll: true, Color: ["#e7cf1a", "#ff5277"], Group: "ItemArms", bindarms: false, power: 7, weight: 0,
		Model: "ShacklesArms",
		struggleBreak: true,
		Filters: {
			BaseMetal: {"gamma":1.4166666666666665,"saturation":1,"contrast":1.4833333333333334,"brightness":1.1833333333333333,"red":2.3499999999999996,"green":1.9666666666666666,"blue":1.1333333333333333,"alpha":1},
		},
		escapeChance: {"Struggle": -0.2, "Cut": 0.1, "Remove": 0.25, "Pick": 0.45}, enemyTags: {"banditMagicRestraints":24}, playerTags: {"ItemArmsFull":-2}, minLevel: 2, allFloors: true, shrine: ["Cuffs", "Metal",  "ArmCuffsBase"],
		maxwill: 0.6, events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "struggle", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
			{trigger: "playerAttack", type: "PunishPlayer", chance: 0.33, stun: 2, warningchance: 1.0, damage: "crush", power: 3, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerBandit", inheritLinked: true},
		]},

	//endregion

	{renderWhenLinked: ["Corsets", "Harnesses", ...KDBindable, "Latex", "Leather", "Metal", "Rope"], name: "IceCrystal",
		inaccessible: true, factionColor: [[0]], Asset: "TransparentCatsuit", AssetGroup: "Suit", Color: ["#3873C3"],
		Group: "ItemDevices", power: 10, weight: 0, escapeChance: {"Struggle": -0.4, "Cut": -0.8, "Remove": -100},
		enemyTags: {iceEncase: 100},
		bindhands: 1.0,
		bindarms: true,
		playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "Container", "IceEncase", "BlockKneel", "FeetLinked", "HandsBehind"], ignoreSpells: true, removeOnLeash: true, immobile: true,
		alwaysEscapable: ["Struggle"],
		struggleMinSpeed: {
			Struggle: 0.01,
		},
		struggleMaxSpeed: {
			Struggle: 0.2,
		},
		limitChance: {
			Struggle: -0.01,
		},
		Model: "LatexCube",
		Filters:{"LatexCube":{"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":2.4333333333333336,"alpha":1},"LatexCubeBack":{"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":0.41666666666666663,"green":3.25,"blue":2.2333333333333334,"alpha":1}},
		events: [
			//{trigger: "tick", type: "callGuardFurniture", inheritLinked: true},
			{trigger: "playerMove", type: "removeOnMove", inheritLinked: true},
			{trigger: "tick", type: "iceDrain", power: -0.025, inheritLinked: true},
			{trigger: "tick", type: "iceMelt", power: 0.1, count: 13, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "iceMelt", mult: 1.5, subMult: 0.5, count: 13, inheritLinked: true},
		]
	},

	{unlimited: true, removePrison: true, name: "IceArms", debris: "Ice", sfx: "Freeze", Asset: "Ribbons", LinkableBy: ["Armbinders", "Wrapping", "Encase",], Type: "Heavy", Color: "#5DA9E5", Group: "ItemArms", bindarms: true, power: 4, weight: 0, magic: true, escapeChance: {"Struggle": 0.15, "Cut": 0.05, "Remove": 0}, enemyTags: {"iceRestraints":4}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Ties", "Ice", "Elements"],
		Model: "RibbonBoxtie2",
		Filters: {
			Ribbon: {"gamma":0.2833333333333333,"saturation":0.05,"contrast":1.0166666666666666,"brightness":1.1833333333333333,"red":1,"green":2.2333333333333334,"blue":3.3833333333333333,"alpha":1},
		},
		maxwill: 0.8, events: [
			{trigger: "tick", type: "iceDrain", power: -0.025, inheritLinked: true},
			{trigger: "tick", type: "iceMelt", power: 0.1, count: 13, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "iceMelt", mult: 1.5, subMult: 0.5, count: 13, inheritLinked: true},
		]},
	{unlimited: true, removePrison: true, name: "IceLegs", debris: "Ice", sfx: "Freeze", Asset: "Ribbons", LinkableBy: ["Legbinders", "Hobbleskirts", "Wrapping", "Encase",], Type: "MessyWrap", Color: "#5DA9E5", Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 4, weight: 0, magic: true, escapeChance: {"Struggle": 0.15, "Cut": 0.05, "Remove": 0}, enemyTags: {"iceRestraints":4}, playerTags: {"ItemLegsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Ties", "Ice", "Elements"],
		Model: "RibbonLegs3",
		Filters: {
			Ribbon: {"gamma":0.2833333333333333,"saturation":0.05,"contrast":1.0166666666666666,"brightness":1.1833333333333333,"red":1,"green":2.2333333333333334,"blue":3.3833333333333333,"alpha":1},
		},
		events: [
			{trigger: "tick", type: "iceDrain", power: -0.025, inheritLinked: true},
			{trigger: "tick", type: "iceMelt", power: 0.1, count: 15, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "iceMelt", mult: 1.5, subMult: 0.5, count: 15, inheritLinked: true},
		]},
	{unlimited: true, removePrison: true, name: "IceHarness", debris: "Ice", sfx: "Freeze", Asset: "Ribbons", Type: "Harness2", Color: "#5DA9E5", Group: "ItemTorso", power: 1, weight: 0, magic: true, escapeChance: {"Struggle": 0.15, "Cut": 0.05, "Remove": 0}, enemyTags: {"iceRestraints":4}, playerTags: {"ItemTorsoFull":-2}, minLevel: 0, allFloors: true, shrine: ["Ties", "Ice", "Elements"],
		Model: "RibbonHarness",
		harness: true,
		restriction: 5,
		Filters: {
			Ribbon: {"gamma":0.2833333333333333,"saturation":0.05,"contrast":1.0166666666666666,"brightness":1.1833333333333333,"red":1,"green":2.2333333333333334,"blue":3.3833333333333333,"alpha":1},
		},
		events: [
			{trigger: "tick", type: "iceDrain", power: -0.025, inheritLinked: true},
			{trigger: "tick", type: "iceMelt", power: 0.1, count: 11, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "iceMelt", mult: 1.5, subMult: 0.5, count: 11, inheritLinked: true},
		]},
	{unlimited: true, removePrison: true, name: "IceGag", debris: "Ice", gag: 0.35, sfx: "Freeze", Asset: "Ribbons", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], Color: "#5DA9E5", Group: "ItemMouth", power: 4, weight: 0, magic: true, escapeChance: {"Struggle": 0.15, "Cut": 0.05, "Remove": 0}, enemyTags: {"iceRestraints":4}, playerTags: {"ItemMouthFull":-2}, minLevel: 0, allFloors: true, shrine: ["Wrapping", "Encase", "Ice", "Elements"],
		Model: "TapeWrapOver",
		Filters: {
			Tape: {"gamma":0.2833333333333333,"saturation":0.05,"contrast":1.0166666666666666,"brightness":1.1833333333333333,"red":1,"green":2.2333333333333334,"blue":3.3833333333333333,"alpha":1},
		},
		maxwill: 0.7, events: [
			{trigger: "tick", type: "iceDrain", power: -0.025, inheritLinked: true},
			{trigger: "tick", type: "iceMelt", power: 0.1, count: 8, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "iceMelt", mult: 1.2, subMult: 0.5, count: 8, inheritLinked: true},
		]},

	{renderWhenLinked: [...KDBeltsRender], removePrison: true, name: "CableArms", debris: "Chains", sfx: "FutureLock", Asset: "NylonRope", changeRenderType: {"ArmBind": "WristElbowHarnessTie"},
		Model: "RibbonWristtie2",
		UnderlinkedAlwaysRender: true,
		Filters: {
			Ribbon: {"gamma":0.2833333333333333,"saturation":0.05,"contrast":3.4499999999999997,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
		},
		LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindable], Color: ["#333333"], Group: "ItemArms", bindarms: true, power: 6, weight: 0, magic: false,
		escapeChance: {"Struggle": 0.1, "Cut": 0.00, "Remove": 0.25, "Pick": 0.3},
		maxwill: 0.8, enemyTags: {"hitechCables":4}, playerTags: {"ItemArmsFull":-2}, minLevel: 6, allFloors: true, shrine: ["Metal", "Belts", "HogtieUpper"]},
	{renderWhenLinked: [...KDBeltsRender], removePrison: true, name: "CableLegs", debris: "Chains", sfx: "FutureLock", Asset: "NylonRope", Type: "KneesThighs",
		LinkableBy: [...KDBeltsBind], Color: ["#333333", "#333333"], Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 6, weight: 0, magic: false,
		Model: "RibbonLegs2",
		UnderlinkedAlwaysRender: true,
		Filters: {
			Ribbon: {"gamma":0.2833333333333333,"saturation":0.05,"contrast":3.4499999999999997,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": 0.1, "Cut": 0.0, "Remove": 0.25, "Pick": 0.3}, enemyTags: {"hitechCables":4}, playerTags: {"ItemLegsFull":-2}, minLevel: 6, allFloors: true, shrine: ["Metal", "Belts"]},
	{renderWhenLinked: [...KDBeltsRender], removePrison: true, name: "CableHarness", sfx: "FutureLock", Asset: "NylonRopeHarness", OverridePriority: 27, Color: ["#333333", "#333333"], Type: "Harness", Group: "ItemTorso", power: 2, strictness: 0.05, weight: 0, magic: false,
		LinkableBy: [...KDBeltsBind],
		Model: "RibbonHarness",
		UnderlinkedAlwaysRender: true,
		restriction: 4,
		harness: true,
		Filters: {
			Ribbon: {"gamma":0.2833333333333333,"saturation":0.05,"contrast":3.4499999999999997,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": 0.1, "Cut": 0.0, "Remove": 0.25, "Pick": 0.3}, enemyTags: {"hitechCables":4}, playerTags: {"ItemTorsoFull":-2}, minLevel: 6, allFloors: true, shrine: ["Metal", "Belts"]},

	{renderWhenLinked: [...KDBeltsRender], removePrison: true, name: "NylonCableArms", debris: "Chains", sfx: "FutureLock", Asset: "NylonRope", changeRenderType: {"ArmBind": "WristElbowHarnessTie"}, maxLevel: 6,
		Model: "RibbonWristtie2",
		UnderlinkedAlwaysRender: true,
		Filters: {
			Ribbon: {"gamma":1,"saturation":0.05,"contrast":1.6,"brightness":0.35000000000000003,"red":1,"green":1,"blue":1,"alpha":1},
		},
		LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindable], Color: ["#222222"], Group: "ItemArms", bindarms: true, power: 6, weight: 0, magic: false,
		escapeChance: {"Struggle": 0.12, "Cut": 0.2, "Remove": 0.3, "Pick": 0.35},
		maxwill: 0.8, enemyTags: {"hitechCables":4}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Belts", "HogtieUpper"]},
	{renderWhenLinked: [...KDBeltsRender], removePrison: true, name: "NylonCableLegs", debris: "Chains", sfx: "FutureLock", Asset: "NylonRope", Type: "KneesThighs", maxLevel: 6,
		LinkableBy: [...KDBeltsBind],
		Model: "RibbonLegs2",
		UnderlinkedAlwaysRender: true,
		Filters: {
			Ribbon: {"gamma":1,"saturation":0.05,"contrast":1.6,"brightness":0.35000000000000003,"red":1,"green":1,"blue":1,"alpha":1},
		},
		Color: ["#222222", "#222222"], Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 6, weight: 0, magic: false,
		escapeChance: {"Struggle": 0.12, "Cut": 0.2, "Remove": 0.3, "Pick": 0.35}, enemyTags: {"hitechCables":4}, playerTags: {"ItemLegsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Belts"]},
	{renderWhenLinked: [...KDBeltsRender], removePrison: true, name: "NylonCableHarness", sfx: "FutureLock", Asset: "NylonRopeHarness", OverridePriority: 27, maxLevel: 6,
		LinkableBy: [...KDBeltsBind],
		Model: "RibbonHarness",
		harness: true,
		UnderlinkedAlwaysRender: true,
		restriction: 2,
		Filters: {
			Ribbon: {"gamma":1,"saturation":0.05,"contrast":1.6,"brightness":0.35000000000000003,"red":1,"green":1,"blue":1,"alpha":1},
		},
		Color: ["#222222", "#222222"], Type: "Harness", Group: "ItemTorso", power: 2, strictness: 0.05, weight: 0, magic: false,
		escapeChance: {"Struggle": 0.12, "Cut": 0.2, "Remove": 0.3, "Pick": 0.35}, enemyTags: {"hitechCables":4}, playerTags: {"ItemTorsoFull":-2}, minLevel: 0, allFloors: true, shrine: ["Metal", "Belts"]},

	//region Ribbon

	{inventory: true, name: "RibbonCollar", debris: "Fabric", Asset: "LatexCollar2", factionColor: [[], [0]], Color: "Default", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: 4, DefaultLock: "Blue",
		Model: "ElfCollarRestraint",
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		struggleBreak: true,
		UnderlinkedAlwaysRender: true,
		tightType: "Secure",
		maxwill: 0.25, enemyTags: {"livingCollar":10}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["Collars","Rope","Ribbons"],
		events: [{trigger: "tick", type: "livingRestraints", tags: ["magicRibbons","magicRibbonsHarsh"], cloneTags: [], inheritLinked: true, frequencyMax: 60, frequencyMin: 10, frequencyStep: 0.8, count: 4}]
	},

	{inventory: true, name: "RibbonRaw",
		noRecycle: true,
		requireSingleTagToEquip: ["Impossible"],
		Asset: "", Color: "",
		Group: "ItemDevices", power: 1, weight: -1000,
		escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.05},
		enemyTags: {}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["Ribbons", "Raw"]},


	{unlimited: true, inventory: true, removePrison: true, name: "RibbonArms", debris: "Fabric", sfx: "MagicSlash", Asset: "Ribbons", Color: "#a583ff", Group: "ItemArms", bindarms: true, power: 6, weight: 0, magic: true,
		escapeChance: {"Struggle": 0.15, "Cut": 0.3, "Remove": 0.2,}, struggleMaxSpeed: {"Remove": 0.15}, struggleMinSpeed: {"Struggle": 0.1},
		affinity: {Remove: ["Hook"],},
		Model: "RibbonBoxtie2",
		UnderlinkedAlwaysRender: true,
		Filters: {
			Ribbon: {"gamma":0.6,"saturation":0,"contrast":1,"brightness":1,"red":1.1333333333333333,"green":0.6666666666666666,"blue":2.4166666666666665,"alpha":1},
		},
		disassembleAs: "RibbonRaw",
		maxwill: 0.8, enemyTags: {"magicRibbons":4, "lowWeightRibbons":1}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Ribbons", "Rope", "Ties", "Conjure", "Wristties"]},
	{unlimited: true, inventory: true, removePrison: true, name: "RibbonLegs", debris: "Fabric", sfx: "MagicSlash", Asset: "DuctTape", Color: "#a583ff", Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 7, weight: 0, magic: true,
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},

		Model: "RibbonLegs2",
		UnderlinkedAlwaysRender: true,
		Filters: {
			Ribbon: {"gamma":0.6,"saturation":0,"contrast":1,"brightness":1,"red":1.1333333333333333,"green":0.6666666666666666,"blue":2.4166666666666665,"alpha":1},
		},
		disassembleAs: "RibbonRaw",
		escapeChance: {"Struggle": 0.07, "Cut": 0.3, "Remove": 0.15}, enemyTags: {"magicRibbons":4, "lowWeightRibbons":1}, struggleMaxSpeed: {"Remove": 0.15}, playerTags: {"ItemLegsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Ribbons", "Rope", "Ties", "Conjure"]},
	{unlimited: true, inventory: true, removePrison: true, name: "RibbonFeet", debris: "Fabric", sfx: "MagicSlash", Asset: "DuctTape", Color: "#a583ff", Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 7, weight: 0, magic: true,

		Model: "RibbonAnkles1",
		UnderlinkedAlwaysRender: true,
		Filters: {
			Ribbon: {"gamma":0.6,"saturation":0,"contrast":1,"brightness":1,"red":1.1333333333333333,"green":0.6666666666666666,"blue":2.4166666666666665,"alpha":1},
		},
		disassembleAs: "RibbonRaw",
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1}, playerTagsMissingMult: {"ItemLegsFull":0.05},
		escapeChance: {"Struggle": 0.07, "Cut": 0.3, "Remove": 0.15}, enemyTags: {"magicRibbons":4, "lowWeightRibbons":1}, struggleMaxSpeed: {"Remove": 0.15}, playerTags: {"ItemLegsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Ribbons", "Rope", "Ties", "Conjure"]},
	{unlimited: true, inventory: true, removePrison: true, name: "RibbonHarness", debris: "Fabric", sfx: "MagicSlash", Asset: "Ribbons", Type: "Harness2", Color: "#a583ff", Group: "ItemTorso", power: 6, strictness: 0.05, weight: 0, magic: true,
		Model: "RibbonHarness",

		restriction: 4,
		harness: true,
		UnderlinkedAlwaysRender: true,
		Filters: {
			Ribbon: {"gamma":0.6,"saturation":0,"contrast":1,"brightness":1,"red":1.1333333333333333,"green":0.6666666666666666,"blue":2.4166666666666665,"alpha":1},
		},
		disassembleAs: "RibbonRaw",
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},
		escapeChance: {"Struggle": 0.07, "Cut": 0.3, "Remove": 0.15}, struggleMaxSpeed: {"Remove": 0.15}, enemyTags: {"magicRibbons":4, "lowWeightRibbons":1}, playerTags: {"ItemTorsoFull":-2}, minLevel: 0, allFloors: true, shrine: ["Ribbons", "Rope", "Ties", "Conjure"]},
	{unlimited: true, inventory: true, removePrison: true, name: "RibbonCrotch", debris: "Fabric", sfx: "MagicSlash", Asset: "Ribbons", Color: "#a583ff", Group: "ItemPelvis", power: 5, crotchrope: true, strictness: 0.15, weight: 0, magic: true,
		Model: "RibbonCrotch",
		Filters: {
			Ribbon: {"gamma":0.6,"saturation":0,"contrast":1,"brightness":1,"red":1.1333333333333333,"green":0.6666666666666666,"blue":2.4166666666666665,"alpha":1},
		},
		disassembleAs: "RibbonRaw",
		UnderlinkedAlwaysRender: true,
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},
		escapeChance: {"Struggle": 0.15, "Cut": 0.35, "Remove": 0.25}, struggleMaxSpeed: {"Remove": 0.2}, enemyTags: {"magicRibbons":4, "lowWeightRibbons":1}, playerTags: {"ItemTorsoFull":-2}, minLevel: 0,
		allFloors: true, shrine: ["RopeCrotch", "Rope", "Ties", "Conjure", "Ribbons",], events: [{trigger: "struggle", type: "crotchrope"}]},
	{unlimited: true, inventory: true, name: "RibbonHands", Asset: "DuctTape", debris: "Fabric", Color: "#a583ff", LinkableBy: ["Mittens"], Group: "ItemHands", bindhands: 0.7, power: 5, weight: 0, magic: true,
		Model: "TapeHeavyHands",
		Filters: {
			Tape: {"gamma":0.6,"saturation":0,"contrast":1.0666666666666667,"brightness":1.25,"red":1.1333333333333333,"green":0.6666666666666666,"blue":2.4166666666666665,"alpha":1},
		},
		disassembleAs: "RibbonRaw",
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},
		escapeChance: {"Struggle": 0, "Cut": 0.4, "Remove": 0.5}, struggleMaxSpeed: {"Remove": 0.1},
		maxwill: 0.3, enemyTags: {"magicRibbonsHarsh":1}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Ribbons", "Rope", "Ties", "Conjure"]},
	{unlimited: true, inventory: true, name: "RibbonMouth", Asset: "DuctTape", debris: "Fabric", Color: "#9573ef", Type: "Cover", LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink], Group: "ItemMouth", AssetGroup: "ItemMouth2", gag: 0.5, power: 5, weight: 0, magic: true, escapeChance: {"Struggle": 0.0, "Cut": 0.4, "Remove": 0.4}, struggleMaxSpeed: {"Remove": 0.15},
		Model: "TapeWrapOver",
		Filters: {
			Tape: {"gamma":0.6,"saturation":0,"contrast":1.0666666666666667,"brightness":1.25,"red":1.1333333333333333,"green":0.6666666666666666,"blue":2.4166666666666665,"alpha":1},
		},
		disassembleAs: "RibbonRaw",
		affinity: {Remove: ["Hook"],}, struggleMinSpeed: {"Struggle": 0.1},
		enemyTags: {"magicRibbons":4, "lowWeightRibbons":1}, playerTags: {"ItemMouth1Full":8}, minLevel: 0, allFloors: true, shrine: ["Ribbons", "Rope", "Wrapping", "Conjure"]},
	//endregion

	{inventory: true, name: "CableGag", Asset: "DeepthroatGag", debris: "Belts", gag: 1.0, sfx: "FutureLock", Color: "Default", LinkableBy: [...KDPlugGagLink], renderWhenLinked: [...KDPlugGagLink],
		Model: "PlugPanelGag",
		UnderlinkedAlwaysRender: true,
		Group: "ItemMouth", power: 5, weight: 2, escapeChance: {"Struggle": -0.12, "Cut": 0.0, "Remove": 0.5, "Pick": 0.3},
		maxwill: 0.6, enemyTags: {"cableGag":3}, playerTags: {}, minLevel: 6, allFloors: true, shrine: ["Metal", "PlugGags", "Gags"]},
	{inventory: true, name: "NylonCableGag", Asset: "DeepthroatGag", debris: "Belts", gag: 0.8, sfx: "FutureLock", Color: "#222222", LinkableBy: [...KDPlugGagLink], renderWhenLinked: [...KDPlugGagLink], Group: "ItemMouth", power: 5, weight: 2, escapeChance: {"Struggle": -0.07, "Cut": 0.2, "Remove": 0.5, "Pick": 0.35},
		Model: "PlugPanelGag",
		UnderlinkedAlwaysRender: true,
		maxwill: 0.6, enemyTags: {"cableGag":3}, playerTags: {}, minLevel: 0, maxLevel: 6, allFloors: true, shrine: ["Metal", "PlugGags", "Gags"]},

	//region RopeSnake
	{inventory: true, name: "RopeSnakeCollar", debris: "Ropes", Asset: "LatexCollar2", factionColor: [[], [0]], Color: "Default", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: 4, DefaultLock: "Blue",
		Model: "ElfCollarRestraint",
		linkPriority: 100,
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		struggleBreak: true,
		tightType: "Secure",
		linkCategories: ["EnchantableCollar"], linkSizes: [0.51],
		maxwill: 0.25, enemyTags: {"livingCollar":10}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["Collars","Rope", "RopeSnake"],
		events: [{trigger: "tick", type: "livingRestraints", tags: ["ropeRestraints", "ropeRestraints2", "ropeRestraintsWrist"], cloneTags: [], inheritLinked: true, frequencyMax: 60, frequencyMin: 10, frequencyStep: 0.9, count: 8}]
	},
	{inventory: true, name: "RopeSnakeRaw",
		noRecycle: true,
		requireSingleTagToEquip: ["Impossible"],
		Asset: "", Color: "",
		Group: "ItemDevices", power: 1, weight: -1000,
		escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.05},
		enemyTags: {}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["RopeSnake", "Rope", "Raw"]},
	{unlimited: true, changeRenderType: {"ArmBind": "WristElbowHarnessTie"}, inventory: true, name: "RopeSnakeArmsBoxtie", debris: "Ropes", accessible: true, factionColor: [[], [0]],
		Model: "RopeBoxtie1",
		linkPriority: 10,
		linkCategories: ["RopeArms", "EnchantableArms"], linkSizes: [0.51, 0.51],
		//renderWhenLinked: [...KDArmRopesRender],
		alwaysRender: true,
		disassembleAs: "RopeSnakeRaw",
		Asset: "HempRope", Color: "Default", LinkableBy: ["Boxbinders", "Boxties", "RopeReinforce", "Wrapping", "Encase",...KDBindable], Group: "ItemArms", bindarms: true, power: 1.5, weight: 0, escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.05},
		struggleMult: {"Struggle": 0.35, "Remove": 0.3},
		affinity: {Remove: ["Hook"],},
		UnderlinkedAlwaysRender: true,
		maxwill: 0.7, enemyTags: {"ropeRestraints":4}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "Boxties", "HogtieUpper"]},
	{unlimited: true, inventory: true, name: "RopeSnakeCuffs", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "RopeCuffs", Color: "Default",
		noDupe: true,
		linkPriority: -1,
		linkCategories: ["Cuffs", "EnchantableCuffs"], linkSizes: [0.33, 0.51],
		Model: "RopeCuffs",
		events: [
			{trigger: "beforeStruggleCalc", type: "ropeDebuff", power: 0.05, inheritLinked: true, requireTags: ["RopeReinforce", "IntricateRopeArms"]}
		],
		disassembleAs: "RopeSnakeRaw",
		alwaysRender: true,
		struggleMult: {"Struggle": 0.45, "Remove": 0.45},
		LinkableBy: ["Boxbinders", "Armbinders", "BindingDress", ...KDBindable, "Cuffs", "Ties"], Group: "ItemArms", bindarms: true, power: 1, weight: 0, escapeChance: {"Struggle": 0.4, "Cut": 0.67, "Remove": 0.3},
		affinity: {Remove: ["Hook"],},
		UnderlinkedAlwaysRender: true,
		maxwill: 1.0, enemyTags: {"ropeRestraints":8}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["RopeSnake", "Rope", "Cuffs", "HandsFrontAllowed", "HandsCrossedAllowed", "HandsUpAllowed", "HogtieUpper"]},
	{unlimited: true, inventory: true, name: "RopeSnakeCuffsAdv", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "RopeCuffs", Color: "Default",

		linkPriority: 11,
		linkCategories: ["Ropework", "EnchantableRopework"], linkSizes: [0.33, 0.51],
		Model: "RopeChestStraps1",
		events: [
			{trigger: "beforeStruggleCalc", type: "ropeDebuff", power: 0.05, inheritLinked: true, requireTags: ["Wristties", "Boxties", "Crossties"]}
		],
		//renderWhenLinked: [...KDArmRopesRender],
		alwaysRender: true,
		struggleMult: {"Struggle": 0.2, "Remove": 0.22},
		UnderlinkedAlwaysRender: true,
		disassembleAs: "RopeSnakeRaw",
		LinkableBy: ["Boxbinders", "Armbinders", ...KDBindable, "Cuffs", "RopeReinforce"], Group: "ItemArms", bindarms: true, power: 2, weight: 0, escapeChance: {"Struggle": 0.25, "Cut": 0.67, "Remove": 0.2},
		affinity: {Remove: ["Hook"],}, strictness: 0.05, strictnessZones: ["ItemHands", "HandsFrontAllowed", "HandsCrossedAllowed", "HandsUpAllowed"],
		maxwill: 1.0, enemyTags: {"ropeRestraints":8}, playerTags: {"ItemArmsFull":-1}, minLevel: 2, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "RopeReinforce", "IntricateRopeArms", "HogtieUpper"]},
	{unlimited: true, inventory: true, name: "RopeSnakeCuffsAdv2", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "RopeCuffs", Color: "Default",
		linkCategories: ["Ropework2", "EnchantableRopework2"], linkSizes: [0.33, 0.51], noDupe: true,
		linkPriority: 12,
		Model: "RopeChestStraps2",
		events: [
			{trigger: "beforeStruggleCalc", type: "ropeDebuff", power: 0.05, inheritLinked: true, requireTags: ["Wristties", "Boxties", "Crossties"]}
		],
		//renderWhenLinked: [...KDArmRopesRender],
		alwaysRender: true,
		playerTagsMissingMult: {"IntricateRopeArms": 0.1},
		UnderlinkedAlwaysRender: true,
		disassembleAs: "RopeSnakeRaw",
		struggleMult: {"Struggle": 0.1, "Remove": 0.1},
		LinkableBy: ["Boxbinders", "Armbinders", ...KDBindable, "Cuffs", "RopeReinforce"], Group: "ItemArms", bindarms: true, power: 3, weight: 0, escapeChance: {"Struggle": 0.25, "Cut": 0.67, "Remove": 0.2},
		affinity: {Remove: ["Hook"],}, strictness: 0.1, strictnessZones: ["ItemHands", "HandsFrontAllowed", "HandsCrossedAllowed", "HandsUpAllowed"],
		maxwill: 1.0, enemyTags: {"ropeRestraints":8}, playerTags: {"ItemArmsFull":-1}, minLevel: 3, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "RopeReinforce", "ChestHarnesses", "HogtieUpper"]},
	{unlimited: true, inventory: true, name: "RopeSnakeArmsWrist", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "WristElbowHarnessTie",
		Model: "RopeWristtie1",
		linkPriority: 10,
		struggleMult: {"Struggle": 0.6, "Remove": 0.3},
		linkCategories: ["RopeArms", "EnchantableArms"], linkSizes: [0.51, 0.51],
		//renderWhenLinked: [...KDArmRopesRender],
		alwaysRender: true,
		UnderlinkedAlwaysRender: true,
		disassembleAs: "RopeSnakeRaw",
		LinkableBy: ["Armbinders", "Wristties", "RopeReinforce", "Wrapping", "Encase", "Belts", "HogtieUpper"],
		Color: "Default", Group: "ItemArms", bindarms: true, power: 1.5, weight: 0, escapeChance: {"Struggle": 0.185, "Cut": 0.45, "Remove": 0},
		affinity: {Remove: ["Hook"],},
		maxwill: 0.7, enemyTags: {"ropeRestraintsWrist":4}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "Wristties"]},

	{name: "RopeSnakeHogtieLink",
		debris: "Ropes", accessible: true,
		linkPriority: 100,
		Asset: "HempRope", Type: "Hogtied", Color: "Default",
		Group: "ItemFeet", power: 4, weight: 0,
		struggleMult: {"Struggle": 0.4, "Remove": 0.3, "Cut": 10},
		escapeChance: {"Struggle": 0.0, "Cut": 0.35, "Remove": 0},
		affinity: {Remove: ["Hook"],},
		disassembleAs: "RopeSnakeRaw",
		minLevel: 0, allFloors: true, shrine: ["RopeSnake", "Link", "Rope", "Hogties"],

		linkCategories: ["Hogtie", "EnchantableHogtie"], linkSizes: [0.4, 0.51],
		LinkAll: true,
		noDupe: true,
		addPose: ["HandsBehind"],
		UnderlinkedAlwaysRender: true,
		struggleBreak: true,
		requireAllTagsToEquip: ["HogtieLower", "HogtieUpper"],
		enemyTags: {"ropeRestraintsHogtie":4}, playerTags: {},
		maxwill: 0.1,
		DefaultLock: "White",
		events: [
			{trigger: "postRemoval", type: "RequireHogtie"}
		]
	},
	/*{unlimited: true, inventory: true, name: "RopeSnakeHogtie", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "Hogtied", Color: "Default", Group: "ItemArms",
		bindarms: true, power: 6, weight: 0,
		Model: "RopeBoxtie1",
		alwaysDressModel: [
			{Model: "RopeChestStraps2", inheritFilters: true,}
		],
		linkCategory: "Hogtie", linkSize: 0.51,
		//renderWhenLinked: [...KDArmRopesRender],
		alwaysRender: true,
		LinkableBy: [...KDWrappable],
		struggleMult: {"Struggle": 0.4, "Remove": 0.3},
		escapeChance: {"Struggle": 0.0, "Cut": 0.15, "Remove": 0}, affinity: {Remove: ["Hook"],},
		maxwill: 0.25, enemyTags: {"ropeRestraintsHogtie":12}, playerTags: {}, minLevel: 2, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "Hogties", "Boxties"],
		//events: [{trigger: "postRemoval", type: "replaceItem", list: ["RopeSnakeArmsBoxtie"], power: 6}]
	},
	{unlimited: true, inventory: true, name: "RopeSnakeHogtieWrist", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "Hogtied", Color: "Default", Group: "ItemArms", bindarms: true, power: 6, weight: 0,
		Model: "RopeWristtie1",
		alwaysDressModel: [
			{Model: "RopeChestStraps2", inheritFilters: true}
		],
		linkCategory: "Hogtie", linkSize: 0.51,
		LinkableBy: [...KDWrappable],
		//renderWhenLinked: [...KDArmRopesRender],
		alwaysRender: true,
		struggleMult: {"Struggle": 0.4, "Remove": 0.3},
		escapeChance: {"Struggle": 0.1, "Cut": 0.15, "Remove": -0.05}, affinity: {Remove: ["Hook"],},
		maxwill: 0.25, enemyTags: {"ropeRestraintsHogtie":12}, playerTags: {}, minLevel: 2, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "Hogties", "Wristties"],
		//events: [{trigger: "postRemoval", type: "replaceItem", list: ["RopeSnakeArmsWrist"], power: 6}]
	},*/
	{unlimited: true, renderWhenLinked: [...KDLegRopesRender], inventory: true, name: "RopeSnakeFeet", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Color: "Default", LinkableBy: [...KDFeetRopeLink], Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 1, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.5, "Remove": 0.15},
		Model: "RopeAnkles1",
		linkPriority: 10,
		restriction: 2,
		struggleMult: {"Struggle": 0.5, "Remove": 0.25},
		affinity: {Remove: ["Hook"],},
		disassembleAs: "RopeSnakeRaw",
		linkCategories: ["RopeFeet1", "EnchantableRopeFeet1"], linkSizes: [0.7, 0.7],
		UnderlinkedAlwaysRender: true,
		events: [
			{trigger: "beforeStruggleCalc", type: "ropeDebuff", power: 0.05, inheritLinked: true, requireTags: ["RopeFeet2", "RopeLegs3"]}
		],
		maxwill: 1.0, enemyTags: {"ropeRestraints":4}, playerTags: {"ItemLegsFull":-1}, playerTagsMissingMult: {"ItemLegsFull":0.05}, minLevel: 0, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "RopeFeet1", "HogtieLower"]},
	{unlimited: true, renderWhenLinked: [...KDLegRopesRender], inventory: true, name: "RopeSnakeFeet2", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Color: "Default", LinkableBy: [...KDFeetRopeLink], Group: "ItemFeet", blockfeet: true, hobble: 0.25, addTag: ["FeetLinked"],power: 1, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.5, "Remove": 0.15},
		Model: "RopeAnkles2",
		linkPriority: 10,
		restriction: 2,
		struggleMult: {"Struggle": 0.6, "Remove": 0.3},
		affinity: {Remove: ["Hook"],},
		disassembleAs: "RopeSnakeRaw",
		linkCategories: ["RopeFeet2", "EnchantableRopeFeet2"], linkSizes: [0.7, 0.7],
		UnderlinkedAlwaysRender: true,
		events: [
			{trigger: "beforeStruggleCalc", type: "ropeDebuff", power: 0.05, inheritLinked: true, requireTags: ["RopeFeet1", "RopeFeet3"]}
		],
		aggroLevel: 2.0,
		maxwill: 1.0, enemyTags: {"ropeRestraints":4}, playerTags: {"ItemLegsFull":-1}, playerTagsMissing: {"RopeFeet1": -100}, playerTagsMissingMult: {"ItemLegsFull":0.05}, minLevel: 3, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "RopeFeet2"]},
	{unlimited: true, renderWhenLinked: [...KDLegRopesRender], inventory: true, name: "RopeSnakeFeet3", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Color: "Default", LinkableBy: [...KDFeetRopeLink], Group: "ItemFeet", blockfeet: true, hobble: 0.25, addTag: ["FeetLinked"],power: 1, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.5, "Remove": 0.15},
		Model: "RopeAnkles3",
		restriction: 2,
		struggleMult: {"Struggle": 0.6, "Remove": 0.3},
		affinity: {Remove: ["Hook"],},
		linkCategories: ["RopeFeet3", "EnchantableRopeFeet3"], linkSizes: [0.7, 0.7],
		UnderlinkedAlwaysRender: true,
		disassembleAs: "RopeSnakeRaw",
		linkPriority: 10,
		events: [
			{trigger: "beforeStruggleCalc", type: "ropeDebuff", power: 0.05, inheritLinked: true, requireTags: ["RopeFeet2", "ToeRope"]}
		],
		aggroLevel: 3.0,
		maxwill: 1.0, enemyTags: {"ropeRestraints":4}, playerTags: {"ItemLegsFull":-1}, playerTagsMissing: {"RopeFeet1": -100, "RopeFeet2": -100}, playerTagsMissingMult: {"ItemLegsFull":0.05}, minLevel: 5, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "RopeFeet3"]},
	{unlimited: true, renderWhenLinked: [...KDLegRopesRender], inventory: true, name: "RopeSnakeToes", accessible: true, Asset: "ToeTie", OverridePriority: 26, LinkableBy: ["Wrapping", "Encase",],
		Color: "Default", Group: "ItemBoots", blockfeet: true, addTag: ["FeetLinked"], power: 1, weight: 1,
		affinity: {Remove: ["Hook"],},
		restriction: 2,
		debris: "Ropes", factionColor: [[], [0]],
		escapeChance: {"Struggle": 0.1, "Cut": 0.5, "Remove": 0.15},
		UnderlinkedAlwaysRender: true,
		disassembleAs: "RopeSnakeRaw",
		Model: "RopeToes",
		linkPriority: 10,
		heelpower: 0.5,
		linkCategories: ["RopeToes", "EnchantableRopeToes"], linkSizes: [0.34, 0.51], noDupe: true,
		maxwill: 1.0, enemyTags: {"ropeRestraints":4}, playerTags: {"ItemLegsFull":-1}, playerTagsMissingMult: {"ItemAnklesFull":0.05}, minLevel: 0, allFloors: true, shrine: ["RopeSnake", "ToeRope", "Rope", "Ties"]},
	{unlimited: true, renderWhenLinked: [...KDLegRopesRender], inventory: true, name: "RopeSnakeLegs", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "FullBinding", LinkableBy: [...KDLegRopesBind], Color: "Default", Group: "ItemLegs", hobble: 0.5, addTag: ["FeetLinked"], power: 1, weight: 0, escapeChance: {"Struggle": 0.25, "Cut": 0.45, "Remove": 0.15},
		Model: "RopeLegs1",
		linkPriority: 10,
		restriction: 2,
		struggleMult: {"Struggle": 0.6, "Remove": 0.3},
		affinity: {Remove: ["Hook"],},
		linkCategories: ["RopeLegs1", "EnchantableRopeLegs1"], linkSizes: [0.7, 0.7],
		UnderlinkedAlwaysRender: true,
		disassembleAs: "RopeSnakeRaw",
		events: [
			{trigger: "beforeStruggleCalc", type: "ropeDebuff", power: 0.05, inheritLinked: true, requireTags: ["RopeLegs2", "RopeHarness", "RopeCrotch"]}
		],
		maxwill: 0.6, enemyTags: {"ropeRestraints":4}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "RopeLegs1"]},
	{unlimited: true, renderWhenLinked: [...KDLegRopesRender], inventory: true, name: "RopeSnakeLegs2", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "FullBinding", LinkableBy: [...KDLegRopesBind], Color: "Default", Group: "ItemLegs", hobble: 0.5, addTag: ["FeetLinked"], power: 1, weight: 0, escapeChance: {"Struggle": 0.25, "Cut": 0.45, "Remove": 0.15},
		Model: "RopeLegs2",
		restriction: 2,
		linkPriority: 10,
		struggleMult: {"Struggle": 0.6, "Remove": 0.3},
		affinity: {Remove: ["Hook"],},
		linkCategories: ["RopeLegs2", "EnchantableRopeLegs2"], linkSizes: [0.7, 0.7],
		UnderlinkedAlwaysRender: true,
		disassembleAs: "RopeSnakeRaw",
		events: [
			{trigger: "beforeStruggleCalc", type: "ropeDebuff", power: 0.05, inheritLinked: true, requireTags: ["RopeLegs3", "RopeLegs1"]}
		],
		aggroLevel: 4.0,
		maxwill: 0.6, enemyTags: {"ropeRestraints":4}, playerTags: {"ItemFeetFull":-1}, playerTagsMissing: {"RopeLegs1": -100}, minLevel: 7, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "RopeLegs2"]},
	{unlimited: true, renderWhenLinked: [...KDLegRopesRender], inventory: true, name: "RopeSnakeLegs3", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRope", Type: "FullBinding", LinkableBy: [...KDLegRopesBind], Color: "Default", Group: "ItemLegs", hobble: 0.5, addTag: ["FeetLinked"], power: 1, weight: 0, escapeChance: {"Struggle": 0.25, "Cut": 0.45, "Remove": 0.15},
		Model: "RopeLegs3",
		linkPriority: 10,
		restriction: 2,
		struggleMult: {"Struggle": 0.6, "Remove": 0.3},
		affinity: {Remove: ["Hook"],},
		linkCategories: ["RopeLegs3", "EnchantableRopeLegs3"], linkSizes: [0.7, 0.7],
		UnderlinkedAlwaysRender: true,
		disassembleAs: "RopeSnakeRaw",
		events: [
			{trigger: "beforeStruggleCalc", type: "ropeDebuff", power: 0.05, inheritLinked: true, requireTags: ["RopeFeet3", "RopeLegs2"]}
		],
		aggroLevel: 6.0,
		maxwill: 0.6, enemyTags: {"ropeRestraints":4}, playerTags: {"ItemFeetFull":-1}, playerTagsMissing: {"RopeLegs2": -100, "RopeLegs1": -100}, minLevel: 9, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "RopeLegs3"]},
	{unlimited: true, renderWhenLinked: ["Harnesses", "HeavyCorsets", "Corsets"], inventory: true, name: "RopeSnakeBelt", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRopeHarness", Type: "Waist", Color: "Default", Group: "ItemTorso", power: 1, weight: 0, harness: true, escapeChance: {"Struggle": 0.1, "Cut": 0.67, "Remove": 0.3},
		Model: "RopeBelt",
		restriction: 2,
		linkPriority: 10,
		affinity: {Remove: ["Hook"],},
		linkCategories: ["RopeHarness", "EnchantableRopeHarness"], linkSizes: [0.33, 0.51],
		UnderlinkedAlwaysRender: true,
		disassembleAs: "RopeSnakeRaw",
		maxwill: 0.9, enemyTags: {"ropeRestraints2":4}, playerTags: {"ItemTorsoFull":-3}, minLevel: 0, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties"]},
	{unlimited: true, renderWhenLinked: ["Harnesses", "HeavyCorsets", "Corsets"], inventory: true, name: "RopeSnakeHarness", debris: "Ropes", accessible: true, factionColor: [[], [0]], Asset: "HempRopeHarness", Type: "Star", strictness: 0.1, OverridePriority: 26, Color: "Default", Group: "ItemTorso", power: 2, weight: 0, harness: true, escapeChance: {"Struggle": 0.1, "Cut": 0.67, "Remove": 0.3},
		Model: "RopeHarness",
		restriction: 4,
		linkPriority: 10,
		struggleMult: {"Struggle": 0.3, "Remove": 0.15},
		linkCategories: ["RopeHarness", "EnchantableRopeHarness"], linkSizes: [0.51, 0.51],
		UnderlinkedAlwaysRender: true,
		affinity: {Remove: ["Hook"],},
		disassembleAs: "RopeSnakeRaw",
		aggroLevel: 2.0,
		maxwill: 0.75, enemyTags: {"ropeRestraints2":1}, playerTags: {"ItemTorsoFull":5}, minLevel: 3, allFloors: true, shrine: ["RopeSnake", "Rope", "Ties", "Harnesses", "RopeHarness"]},
	{unlimited: true, inventory: true, name: "RopeSnakeCrotch", debris: "Ropes", accessible: true, factionColor: [[], [0]], crotchrope: true, strictness: 0.15, Asset: "HempRope", Type: "OverPanties", LinkableBy: ["ChastityBelts"], OverridePriority: 26, Color: "Default", Group: "ItemPelvis", power: 1, weight: 0,
		Model: "RopeCrotch",
		harness: true,
		linkPriority: 10,
		linkCategories: ["RopeCrotch", "EnchantableRopeCrotch"], linkSizes: [0.34, 0.51], noDupe: true,
		UnderlinkedAlwaysRender: true,
		struggleMult: {"Struggle": 0.6, "Remove": 0.5},
		affinity: {Remove: ["Hook"],},
		disassembleAs: "RopeSnakeRaw",
		aggroLevel: 1.0,
		maxwill: 0.75, escapeChance: {"Struggle": 0.1, "Cut": 0.67, "Remove": 0.15}, enemyTags: {"ropeRestraints2":4}, playerTags: {"ItemPelvisFull":-3}, minLevel: 0, allFloors: true, shrine: ["RopeCrotch", "RopeSnake", "Rope", "Ties"],
		events: [{trigger: "struggle", type: "crotchrope"}]},
	//endregion

	// regiuon Links
	{name: "ThighLink", accessible: true, Asset: "FuturisticLegCuffs", debris: "Chains", LinkableBy: [...KDBindable, ...KDDevices],
		sfx: "Chain",
		binding: true,
		Model: "ThighLink", alwaysRender: true,
		linkSize: 0.35, linkCategory: "LegLink", noDupe: true,
		Type: "Chained", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'],
		Group: "ItemLegs", hobble: 1, power: 3, weight: 0,
		minLevel: 0, allFloors: true, shrine: ["ThighLink", "Link", "Metal", "Cuffs"],
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		enemyTags: {jailer: 0.1, linkRegular: 40, handcuffer: 40, shackleRestraints: 40, chainRestraints: 40, "legLink": 1}, playerTags: {},
		DefaultLock: "White",
		requireSingleTagToEquip: ["LegCuffsBase"],
		unlimited: true,
		UnderlinkedAlwaysRender: true,
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseLegCuffs", inheritLinked: true}
		]},


	{name: "ChainHogtieLink",
		sfx: "Chain",
		binding: true,
		UnderlinkedAlwaysRender: true,
		debris: "Chains", accessible: true,
		Asset: "HempRope", Type: "Hogtied", Color: "Default",
		Group: "ItemFeet", power: 6, weight: 0,
		struggleMult: {"Struggle": 0.4, "Remove": 0.3, "Cut": 10},
		escapeChance: {"Struggle": -0.2, "Cut": -0.1, "Remove": 0.3, "Pick": 0.8},
		limitChance: {"Struggle": 0.8},
		affinity: {Remove: ["Hook"],},
		minLevel: 0, allFloors: true, shrine: ["Chains", "Link", "Metal", "Hogties"],
		linkCategory: "Hogtie", linkSize: 0.51,
		LinkAll: true,
		noDupe: true,
		addPose: ["HandsBehind"],
		struggleBreak: true,
		requireAllTagsToEquip: ["HogtieLower", "HogtieUpper"],
		// handcuffers will only do this if you are fighting back
		unlimited: true,
		enemyTags: {"chainRestraints":1, "handcuffer":0.1, "hogtieLink": 1}, playerTags: {}, playerTagsMissing: {PlayerCombat: -0.1},
		maxwill: 0.1,
		DefaultLock: "White",
		events: [
			{trigger: "postRemoval", type: "RequireHogtie"}
		]
	},

	{name: "AnkleLink", debris: "Chains", accessible: true, Asset: "FuturisticAnkleCuffs", LinkableBy: [...KDBindableMinusCuffs],
		sfx: "Chain",
		binding: true,
		Model: "AnkleLink", alwaysRender: true,
		UnderlinkedAlwaysRender: true,
		struggleBreak: true,
		linkSize: 0.6, linkCategory: "AnkleLink",
		requireSingleTagToEquip: ["AnkleCuffsBase"],
		Type: "Chained", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'],
		Group: "ItemFeet", hobble: 1, power: 2, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		enemyTags: {jailer: 0.1, leashing: 0.1, linkRegular: 40, handcuffer: 40, shackleRestraints: 40, chainRestraints: 40, "feetLink": 10}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["AnkleLink", "Link", "Metal"],
		DefaultLock: "White",
		unlimited: true,
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseAnkleCuffs", inheritLinked: true}
		]},
	{name: "AnkleLinkShort", debris: "Chains", accessible: true, Asset: "FuturisticAnkleCuffs", LinkableBy: [...KDBindableMinusCuffs],
		sfx: "Chain",
		binding: true,
		Type: "Closed", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'],
		UnderlinkedAlwaysRender: true,
		Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 3, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		minLevel: 0, allFloors: true, shrine: ["AnkleLink", "Link", "Metal",],
		linkSize: 0.6, linkCategory: "AnkleLink",
		struggleBreak: true,
		requireSingleTagToEquip: ["AnkleCuffsBase"],
		enemyTags: {jailer: 0.1, linkTight: 40, handcuffer: 20, shackleRestraints: 20, chainRestraints: 20, "feetLink": 1}, playerTags: {},
		maxwill: 0.2,
		DefaultLock: "White",
		unlimited: true,
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}
		]},


	{name: "WristLink", debris: "Chains", accessible: true, Asset: "FuturisticCuffs",
		sfx: "Chain",
		binding: true,
		Type: "Wrist", LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindableMinusCuffs],
		UnderlinkedAlwaysRender: true,
		Color: ['#FFFFFF', '#CFBE88', '#000000'],
		Group: "ItemArms", bindarms: true, power: 3, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": -0.3, "Remove": 0.2, "Pick": 0.25},
		helpChance: {"Remove": 0.4},
		minLevel: 0, floors: KDMapInit([]), shrine: ["WristLink", "Link", "Metal", "HogtieUpper"],
		linkSize: 0.6, linkCategory: "ArmLink",
		struggleBreak: true,
		requireSingleTagToEquip: ["ArmCuffsBase"],
		enemyTags: {jailer: 0.1, leashing: 0.1, linkRegular: 40, handcuffer: 40, shackleRestraints: 40, chainRestraints: 40, armLink: 10}, playerTags: {},
		maxwill: 0.7,
		allFloors: true,
		DefaultLock: "White",
		unlimited: true,
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseArmCuffs", inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.08, inheritLinked: true}
		]},
	{name: "ElbowLink", debris: "Chains", accessible: true, Asset: "FuturisticCuffs",
		sfx: "Chain",
		binding: true,
		Type: "Both", LinkableBy: [...KDElbowBind, ...KDBindableMinusCuffs],
		UnderlinkedAlwaysRender: true,
		Color: ['#FFFFFF', '#CFBE88', '#000000'],
		Group: "ItemArms", bindarms: true, power: 4, weight: 0, strictness: 0.1,
		addPose: ["HandsBehind"],
		alwaysRender: true,
		linkSize: 0.6, linkCategory: "ElbowLink",
		struggleBreak: true,
		requireSingleTagToEquip: ["ArmCuffsBase"],
		escapeChance: {"Struggle": -0.175, "Cut": -0.3, "Remove": -0.1, "Pick": 0.25},
		helpChance: {"Remove": 0.4},
		enemyTags: {jailer: 0.1, linkTight: 40, handcuffer: 10, shackleRestraints: 10, chainRestraints: 10, "armLink": 1}, playerTags: {},
		minLevel: 0, floors: KDMapInit([]), shrine: ["ElbowLink", "Link", "Metal", "ElbowTied"],
		maxwill: 0.5,
		allFloors: true,
		DefaultLock: "White",
		unlimited: true,
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseArmCuffs", inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.12, inheritLinked: true}
		]},



	//endregion



	// regiuon CyberLinks
	{name: "CyberThighLink", accessible: true, Asset: "FuturisticLegCuffs", debris: "Chains", LinkableBy: [...KDBindable, ...KDDevices],
		binding: true,
		sfx: "BeepEngage",
		sfxRemove: "Crackling",
		Model: "CyberThighLink", alwaysRender: true,
		linkSize: 0.55, linkCategory: "LegLink", noDupe: true,
		Type: "Chained", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'],
		Group: "ItemLegs", hobble: 1, power: 6, weight: 0,
		minLevel: 7, allFloors: true, shrine: ["ThighLink", "CyberLink", "Link", "Metal", "Cuffs", "ControlHLeg"],
		escapeChance: {"Struggle": -1.05, "Cut": -0.4, "Remove": 0.2, "Pick": 0.05},
		enemyTags: {"cyberLink": 10, "controlHarness" : 20, "roboPrisoner" : 10}, playerTags: {},
		DefaultLock: "Cyber",
		requireAllTagsToEquip: ["CyberLegCuffs", "LegCuffsBase"],
		unlimited: true,
		UnderlinkedAlwaysRender: true,
		factionFilters: {
			Tether: {color: "Highlight", override: true},
			Glow: {color: "Highlight", override: false},
		},
		events: [
			{trigger: "tick", type: "tetherRegen", power: 0.1, count: 3, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "tetherDamage", mult: 1.0, subMult: 2.1, count: 5, inheritLinked: true},
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseLegCuffs", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireTag", requiredTag: "CyberLegCuffs", inheritLinked: true},
		]},


	{name: "CyberHogtieLink",
		sfx: "BeepEngage",
		sfxRemove: "Crackling",
		binding: true,
		UnderlinkedAlwaysRender: true,
		debris: "Chains", accessible: true,
		Asset: "HempRope", Type: "Hogtied", Color: "Default",
		Group: "ItemFeet", power: 9, weight: 0,
		struggleMult: {"Struggle": 0.4, "Remove": 0.3, "Cut": 7},
		escapeChance: {"Struggle": -1.0, "Cut": -0.3, "Remove": 0.3, "Pick": 0.25},
		limitChance: {"Struggle": 0.8},
		affinity: {Remove: ["Hook"],},
		minLevel: 12, allFloors: true, shrine: ["CyberLink", "Chains", "Link", "Metal", "Hogties"],
		linkCategory: "Hogtie", linkSize: 0.51,
		LinkAll: true,
		noDupe: true,
		addPose: ["HandsBehind"],
		struggleBreak: true,
		requireAllTagsToEquip: ["CyberAnkleCuffs", "CyberWristCuffs", "HogtieLower", "HogtieUpper"],
		// handcuffers will only do this if you are fighting back
		unlimited: true,
		enemyTags: {"cyberhogtie" : 1}, playerTags: {}, playerTagsMissing: {PlayerCombat: -0.1},
		maxwill: 0.1,
		DefaultLock: "Cyber",
		events: [
			{trigger: "tick", type: "tetherRegen", power: 0.1, count: 5, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "tetherDamage", mult: 1.0, subMult: 2.1, count: 7.5, inheritLinked: true},
			{trigger: "postRemoval", type: "RequireHogtie"},
			{trigger: "postRemoval", type: "RequireTag", requiredTag: "CyberWristCuffs", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireTag", requiredTag: "CyberAnkleCuffs", inheritLinked: true},
		]
	},

	{name: "CyberAnkleLink", debris: "Chains", accessible: true, Asset: "FuturisticAnkleCuffs", LinkableBy: [...KDBindableMinusCuffs],
		sfx: "BeepEngage",
		sfxRemove: "Crackling",
		binding: true,
		Model: "CyberAnkleLink", alwaysRender: true,
		UnderlinkedAlwaysRender: true,
		struggleBreak: true,
		factionFilters: {
			Tether: {color: "Highlight", override: true},
			Glow: {color: "Highlight", override: false},
		},
		linkSize: 0.6, linkCategory: "AnkleLink",
		requireAllTagsToEquip: ["CyberAnkleCuffs", "AnkleCuffsBase"],
		Type: "Chained", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'],
		Group: "ItemFeet", hobble: 1, power: 6, weight: 0,
		escapeChance: {"Struggle": -1.1, "Cut": -0.4, "Remove": 0.2, "Pick": 0},
		enemyTags: {"cyberLink": 10, "controlHarness" : 20, "roboPrisoner" : 10}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["CyberLink", "AnkleLink", "Link", "Metal", "ControlHAnkle"],
		DefaultLock: "Cyber",
		unlimited: true,
		events: [
			{trigger: "tick", type: "tetherRegen", power: 0.1, count: 10, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "tetherDamage", mult: 1.0, subMult: 2.1, count: 15, inheritLinked: true},
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseAnkleCuffs", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireTag", requiredTag: "CyberAnkleCuffs", inheritLinked: true},
		]},
	{name: "CyberAnkleLinkShort", debris: "Chains", accessible: true, Asset: "FuturisticAnkleCuffs", LinkableBy: [...KDBindableMinusCuffs],
		sfx: "BeepEngage",
		sfxRemove: "Crackling",
		binding: true,
		Type: "Closed", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'],
		UnderlinkedAlwaysRender: true,
		Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"], power: 7, weight: 0, strictness: 0.05,
		escapeChance: {"Struggle": -1.5, "Cut": -0.37, "Remove": -0.1, "Pick": 0},
		minLevel: 0, allFloors: true, shrine: ["CyberLink", "AnkleLink", "Link", "Metal", "ControlHAnkle"],
		linkSize: 0.6, linkCategory: "AnkleLink",
		struggleBreak: true,
		requireAllTagsToEquip: ["CyberAnkleCuffs", "AnkleCuffsBase"],
		enemyTags: {}, playerTags: {},
		maxwill: 0.2,
		DefaultLock: "Cyber",
		unlimited: true,
		events: [
			{trigger: "tick", type: "tetherRegen", power: 0.1, count: 2.5, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "tetherDamage", mult: 1.0, subMult: 2.1, count: 3.5, inheritLinked: true},
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireTag", requiredTag: "CyberAnkleCuffs", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseAnkleCuffs"}
		]},


	{name: "CyberWristLink", debris: "Chains", accessible: true, Asset: "FuturisticCuffs",
		sfx: "BeepEngage",
		sfxRemove: "Crackling",
		binding: true,
		Type: "Wrist", LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindableMinusCuffs],
		UnderlinkedAlwaysRender: true,
		Color: ['#FFFFFF', '#CFBE88', '#000000'],
		Group: "ItemArms", bindarms: true, power: 6, weight: 0,
		escapeChance: {"Struggle": -0.9, "Cut": -0.4, "Remove": -0.1, "Pick": 0.05},
		helpChance: {"Remove": 0.4},
		minLevel: 0, floors: KDMapInit([]), shrine: ["CyberLink", "WristLink", "Link", "Metal", "HogtieUpper", "ControlHArm"],
		linkSize: 0.6, linkCategory: "ArmLink",
		struggleBreak: true,
		requireAllTagsToEquip: ["CyberWristCuffs", "ArmCuffsBase"],
		enemyTags: {"cyberLink": 10, "controlHarness" : 20, "roboPrisoner" : 10}, playerTags: {},
		maxwill: 0.7,
		allFloors: true,
		DefaultLock: "Cyber",
		unlimited: true,
		events: [
			{trigger: "tick", type: "tetherRegen", power: 0.1, count: 5, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "tetherDamage", mult: 1.0, subMult: 2.1, count: 7, inheritLinked: true},
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseArmCuffs", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireTag", requiredTag: "CyberWristCuffs", inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.08, inheritLinked: true}
		]},
	{name: "CyberElbowLink", debris: "Chains", accessible: true, Asset: "FuturisticCuffs",
		sfx: "BeepEngage",
		sfxRemove: "Crackling",
		binding: true,
		Type: "Both", LinkableBy: [...KDElbowBind, ...KDBindableMinusCuffs],
		UnderlinkedAlwaysRender: true,
		Color: ['#FFFFFF', '#CFBE88', '#000000'],
		Group: "ItemArms", bindarms: true, power: 7, weight: 0, strictness: 0.125,
		addPose: ["HandsBehind"],
		alwaysRender: true,
		linkSize: 0.6, linkCategory: "ElbowLink",
		struggleBreak: true,
		requireAllTagsToEquip: ["CyberWristCuffs", "ArmCuffsBase"],
		escapeChance: {"Struggle": -1.1, "Cut": -0.37, "Remove": -0.2, "Pick": 0.25},
		helpChance: {"Remove": 0.4},
		enemyTags: {"cyberLink": 1, "controlHarness" : 2, "roboPrisoner" : 1}, playerTags: {},
		minLevel: 0, floors: KDMapInit([]), shrine: ["CyberLink", "ElbowLink", "Link", "Metal", "ElbowTied", "ControlHArm"],
		maxwill: 0.5,
		allFloors: true,
		DefaultLock: "Cyber",
		unlimited: true,
		events: [
			{trigger: "tick", type: "tetherRegen", power: 0.1, count: 3, inheritLinked: true},
			{trigger: "afterPlayerDamage", type: "tetherDamage", mult: 1.0, subMult: 2.1, count: 5, inheritLinked: true},
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseArmCuffs", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireTag", requiredTag: "CyberWristCuffs", inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.12, inheritLinked: true}
		]},



	//endregion

	//region Warden

	{inventory: true, name: "WardenBelt", Asset: "Default", Color: "Default",
		Model: "IronBelt",
		UnderlinkedAlwaysRender: true,
		Filters: {
			BaseMetal: {"gamma":1.2833333333333334,"saturation":1,"contrast":1.45,"brightness":1,"red":2,"green":1.5,"blue":1,"alpha":1},
		},

		accessible: true,
		cloneTag: "wardenCuffs",

		debris: "Chains",
		Group: "ItemTorso",
		LinkableBy: [...KDBeltLink], renderWhenLinked: [...KDBeltLink],

		curse: "SpellLock8",
		power: 26, weight: 100, DefaultLock: "Gold",
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		struggleBreak: true,
		tightType: "Secure",

		maxwill: 0.6, enemyTags: {"wardenBelt":10}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Belt", "Warden"],
		events: [
			{trigger: "tick", type: "livingRestraints", tags: [], cloneTags: [], inheritLinked: true, frequencyMax: 60, frequencyMin: 10, frequencyStep: 0.9, count: 4}
		]
	},
	{inventory: true, name: "WardenBelt2", Asset: "Default", Color: "Default",
		Model: "IronBelt",
		UnderlinkedAlwaysRender: true,
		Filters: {
			BaseMetal: {"gamma":1.2833333333333334,"saturation":1,"contrast":1.45,"brightness":1,"red":2,"green":1.5,"blue":1,"alpha":1},
		},

		cloneTag: "wardenCuffs",
		accessible: true,

		debris: "Chains",
		Group: "ItemTorso",
		LinkableBy: [...KDBeltLink], renderWhenLinked: [...KDBeltLink],
		AlwaysLinkable: true,

		curse: "SpellLock8",
		power: 26, weight: 100, DefaultLock: "Gold",
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		struggleBreak: true,
		tightType: "Secure",

		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Belt", "Warden"],
		events: [
			{type: "Buff", trigger: "tick", power: 1, buffType: "DivinePrivilege", inheritLinked: true,},
		],
	},



	{name: "WardenThighLink", accessible: true, Asset: "FuturisticLegCuffs", debris: "Chains", LinkableBy: [...KDBindable, ...KDDevices],
		Model: "ThighLink", alwaysRender: true,
		binding: true,
		UnderlinkedAlwaysRender: true,
		noDupe: true,
		Type: "Chained", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'],
		Group: "ItemLegs", hobble: 1, power: 1, weight: 0,
		minLevel: 0, allFloors: true, shrine: ["ThighLink", "Link", "Metal", "Cuffs"],
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		enemyTags: {wardenLink: 10}, playerTags: {},


		curse: "SpellLock1",
		DefaultLock: "White",
		requireSingleTagToEquip: ["LegCuffsBase"],
		Filters: {
			ThighLink: {"gamma":1.2833333333333334,"saturation":1,"contrast":1.45,"brightness":1,"red":2,"green":1.5,"blue":1,"alpha":1},
		},
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseLegCuffs", inheritLinked: true},
			{trigger: "tick", type: "wardenMelt", power: 0.1, count: 8, inheritLinked: true},
		]},

	{name: "WardenAnkleLink", debris: "Chains", accessible: true, Asset: "FuturisticAnkleCuffs", LinkableBy: [...KDBindableMinusCuffs],
		Model: "AnkleLink", alwaysRender: true,
		binding: true,
		struggleBreak: true,
		UnderlinkedAlwaysRender: true,
		noDupe: true,
		requireSingleTagToEquip: ["AnkleCuffsBase"],
		Type: "Chained", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'],
		Group: "ItemFeet", hobble: 1, power: 1, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		enemyTags: {wardenLink: 10}, playerTags: {},
		minLevel: 0, allFloors: true, shrine: ["AnkleLink", "Link", "Metal"],
		DefaultLock: "White",
		curse: "SpellLock1",
		Filters: {
			ThighLink: {"gamma":1.2833333333333334,"saturation":1,"contrast":1.45,"brightness":1,"red":2,"green":1.5,"blue":1,"alpha":1},
		},
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseAnkleCuffs", inheritLinked: true},
		]},
	{name: "WardenAnkleLinkShort", debris: "Chains", accessible: true, Asset: "FuturisticAnkleCuffs", LinkableBy: [...KDBindableMinusCuffs],
		Type: "Closed", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'],
		UnderlinkedAlwaysRender: true,
		binding: true,
		Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 2, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		minLevel: 0, allFloors: true, shrine: ["AnkleLink", "Link", "Metal",],
		noDupe: true,
		struggleBreak: true,
		requireSingleTagToEquip: ["AnkleCuffsBase"],
		enemyTags: {wardenLink: 10}, playerTags: {},
		maxwill: 0.2,
		DefaultLock: "White",
		Filters: {
			ThighLink: {"gamma":1.2833333333333334,"saturation":1,"contrast":1.45,"brightness":1,"red":2,"green":1.5,"blue":1,"alpha":1},
		},
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseAnkleCuffs", inheritLinked: true},
			{trigger: "tick", type: "wardenMelt", power: 0.1, count: 8, inheritLinked: true},
		]},

	{name: "WardenWristLink", debris: "Chains", accessible: true, Asset: "FuturisticCuffs",
		Type: "Wrist", LinkableBy: [...KDElbowBind, ...KDBoxBind, ...KDBindableMinusCuffs],
		Color: ['#FFFFFF', '#CFBE88', '#000000'],
		binding: true,
		UnderlinkedAlwaysRender: true,
		Group: "ItemArms", bindarms: true, power: 1, weight: 0,
		escapeChance: {"Struggle": -0.1, "Cut": -0.3, "Remove": 0.2, "Pick": 0.25},
		helpChance: {"Remove": 0.4},
		minLevel: 0, floors: KDMapInit([]), shrine: ["WristLink", "Link", "Metal", "HogtieUpper"],
		noDupe: true,
		allFloors: true,
		struggleBreak: true,
		requireSingleTagToEquip: ["ArmCuffsBase"],
		enemyTags: {wardenLink: 10}, playerTags: {},
		maxwill: 0.7,
		DefaultLock: "White",
		Filters: {
			ThighLink: {"gamma":1.2833333333333334,"saturation":1,"contrast":1.45,"brightness":1,"red":2,"green":1.5,"blue":1,"alpha":1},
		},
		curse: "SpellLock1",
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseArmCuffs", inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.08, inheritLinked: true},
			{trigger: "tick", type: "wardenMelt", power: 0.1, count: 8, inheritLinked: true},
		]},
	{name: "WardenElbowLink", debris: "Chains", accessible: true, Asset: "FuturisticCuffs",
		Type: "Both", LinkableBy: [...KDElbowBind, ...KDBindableMinusCuffs],
		UnderlinkedAlwaysRender: true,
		binding: true,
		Color: ['#FFFFFF', '#CFBE88', '#000000'],
		Group: "ItemArms", bindarms: true, power: 2, weight: 0, strictness: 0.1,
		addPose: ["HandsBehind"],
		alwaysRender: true,
		noDupe: true,
		allFloors: true,
		struggleBreak: true,
		requireSingleTagToEquip: ["ArmCuffsBase"],
		escapeChance: {"Struggle": -0.175, "Cut": -0.3, "Remove": -0.1, "Pick": 0.25},
		helpChance: {"Remove": 0.4},
		enemyTags: {wardenLink: 10}, playerTags: {},
		minLevel: 0, floors: KDMapInit([]), shrine: ["ElbowLink", "Link", "Metal", "ElbowTied"],
		maxwill: 0.5,
		DefaultLock: "White",
		Filters: {
			ThighLink: {"gamma":1.2833333333333334,"saturation":1,"contrast":1.45,"brightness":1,"red":2,"green":1.5,"blue":1,"alpha":1},
		},
		events: [
			{trigger: "postUnlock", type: "RequireLocked", inheritLinked: true},
			{trigger: "postRemoval", type: "RequireBaseArmCuffs", inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "wristCuffsBlock", power: 0.12, inheritLinked: true},
		]},


	// endregion

	//region TemplateCuffs
	{inventory: true, name: "TemplateLivingCollar", debris: "Fabric", Asset: "LatexCollar2", factionColor: [[], [0]], Color: "Default", Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 9, weight: 4, DefaultLock: "Blue",
		Model: "ElfCollarRestraint",
		escapeChance: {"Struggle": -0.5, "Cut": -0.5, "Remove": 0.33, "Pick": -0.15},
		unlimited: true,
		struggleBreak: true,
		UnderlinkedAlwaysRender: true,
		tightType: "Secure",
		maxwill: 0.25, enemyTags: {"livingCollar":10}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["Collars"],
		events: [{trigger: "tick", type: "livingRestraints", tags: [], cloneTags: [], inheritLinked: true, frequencyMax: 60, frequencyMin: 10, frequencyStep: 0.9, count: 4}]
	},
	{inventory: true, name: "TemplateLegCuffs", debris: "Chains", accessible: true, Asset: "FuturisticLegCuffs",
		LinkAll: true,
		struggleBreak: true,
		UnderlinkedAlwaysRender: true,
		linkCategory: "LegCuffs", linkSize: 0.4, noDupe: true,
		Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'], Group: "ItemLegs", power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25},
		renderWhenLinked: [...KDBindable],
		maxwill: 0.6, enemyTags: {}, playerTags: {"ItemLegsFull":-2}, minLevel: 4, allFloors: true, shrine: ["Cuffs", "Metal",  "LegCuffsBase"]},

	{inventory: true, name: "TemplateAnkleCuffs", debris: "Chains", accessible: true, Asset: "FuturisticAnkleCuffs", Type: "Chained", Color: ['#888888', '#FFFFFF', '#CFBE88', '#000000'], Group: "ItemFeet", power: 9, weight: 0,
		LinkAll: true,
		struggleBreak: true,
		UnderlinkedAlwaysRender: true,
		linkCategory: "AnkleCuffs", linkSize: 0.4, noDupe: true,
		renderWhenLinked: [...KDBindable],
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.2, "Pick": 0.25}, enemyTags: {}, playerTags: {"ItemFeetFull":-2}, minLevel: 0, allFloors: true, shrine: ["Cuffs", "Metal",  "AnkleCuffsBase", "HogtieLower"],
		maxwill: 0.5},
	{nonbinding: true, inventory: true, name: "TemplateArmCuffs", debris: "Chains", accessible: true, Asset: "FuturisticCuffs", linkCategory: "Cuffs", linkSize: 0.55,
		unlimited: true,
		recycleresource: {
			Leather: 10,
			Metal: 4,
		},
		renderWhenLinked: [...KDBindable],
		UnderlinkedAlwaysRender: true,
		struggleBreak: true,
		LinkAll: true, Color: ['#FFFFFF', '#CFBE88', '#000000'], Group: "ItemArms", bindarms: false, power: 9, weight: 0,
		escapeChance: {"Struggle": -0.5, "Cut": -0.2, "Remove": 0.25, "Pick": 0.35}, enemyTags: {}, playerTags: {"ItemArmsFull":-2}, minLevel: 0, allFloors: true, shrine: ["Cuffs", "Metal",  "ArmCuffsBase"],
		maxwill: 0.4},

	//endregion

	//region VinePlant


	{renderWhenLinked: ["Corsets", "Harnesses", ...KDBindable, "Latex", "Leather", "Metal", "Rope"], name: "VineSuspension",
		inaccessible: true,
		factionColor: [[0]], Asset: "TransparentCatsuit", AssetGroup: "Suit", Color: ["#3873C3"],
		Group: "ItemDevices", power: 10, weight: 0, escapeChance: {"Struggle": -0.1, "Cut": 1.0, "Remove": -0.3},
		enemyTags: {vineSuspend: 100},
		playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Furniture", "VineSuspend", "BlockKneel"], ignoreSpells: true, removeOnLeash: true, immobile: true,
		alwaysEscapable: ["Struggle"],
		struggleMinSpeed: {
			Struggle: 0.01,
		},
		struggleMaxSpeed: {
			Struggle: 0.4,
		},
		limitChance: {
			Struggle: -0.01,
		},
		Model: "RopeSuspension",
		Filters: {
			Rope: {"gamma":1,"saturation":1,"contrast":1.85,"brightness":1,"red":1,"green":2.8833333333333333,"blue":1.6833333333333333,"alpha":1},
		},
		events: [
			{trigger: "playerMove", type: "removeOnMove", inheritLinked: true},
		]
	},

	{unlimited: true, removePrison: true, name: "VinePlantArms", accessible: true, Asset: "NylonRope", Color: ["#006722", "#006722"], Group: "ItemArms", debris: "Vines",
		affinity: {Remove: ["Hook"],},
		Model: "RopeBoxtie3",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":1,"saturation":1,"contrast":1.85,"brightness":1,"red":1,"green":2.8833333333333333,"blue":1.6833333333333333,"alpha":1},
		},
		bindarms: true, power: 0.1, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.8, "Remove": 0.2}, enemyTags: {"vineRestraints":4}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties", "Vines", "Will"]},
	{unlimited: true, removePrison: true, name: "VinePlantFeet", accessible: true, Asset: "NylonRope", Color: ["#006722", "#006722"], Group: "ItemFeet", debris: "Vines",
		Model: "RopeAnkles3",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":1,"saturation":1,"contrast":1.85,"brightness":1,"red":1,"green":2.8833333333333333,"blue":1.6833333333333333,"alpha":1},
		},
		affinity: {Remove: ["Hook"],},
		blockfeet: true, addTag: ["FeetLinked"],power: 0.1, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.8, "Remove": 0.2}, enemyTags: {"vineRestraints":4}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties", "Vines", "Will"]},
	{unlimited: true, removePrison: true, name: "VinePlantLegs", accessible: true, Asset: "NylonRope", Color: ["#006722", "#006722"], Group: "ItemLegs", debris: "Vines",
		Model: "RopeLegs3",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":1,"saturation":1,"contrast":1.85,"brightness":1,"red":1,"green":2.8833333333333333,"blue":1.6833333333333333,"alpha":1},
		},
		affinity: {Remove: ["Hook"],},
		hobble: 1, addTag: ["FeetLinked"], power: 0.1, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.8, "Remove": 0.2}, enemyTags: {"vineRestraints":4}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties", "Vines", "Will"]},
	{unlimited: true, removePrison: true, name: "VinePlantTorso", accessible: true, Asset: "NylonRopeHarness", Type: "Diamond", OverridePriority: 26, Color: ["#006722", "#006722"], Group: "ItemTorso", debris: "Vines",
		Model: "RopeHarness",
		struggleBreak: true,
		restriction: 4,
		Filters: {
			Rope: {"gamma":1,"saturation":1,"contrast":1.85,"brightness":1,"red":1,"green":2.8833333333333333,"blue":1.6833333333333333,"alpha":1},
		},
		affinity: {Remove: ["Hook"],},
		harness: true, power: 0.1, weight: 0, strictness: 0.05, escapeChance: {"Struggle": 0.3, "Cut": 0.8, "Remove": 0.2}, enemyTags: {"vineRestraints":4}, playerTags: {"ItemTorsoFull":-3}, minLevel: 0, allFloors: true, shrine: ["Rope", "Ties", "Vines", "Will"]},
	//endregion

	//region Chain
	{inventory: true, name: "ChainArms", debris: "Chains",
		accessible: true, sfx: "Chain", Asset: "Chains", Type: "WristElbowHarnessTie", LinkableBy: ["Armbinders", "Wrapping", "Encase",],
		Color: "Default", Group: "ItemArms", bindarms: true, power: 5, weight: 0,
		escapeChance: {"Struggle": 0.1, "Cut": -0.1, "Remove": 0.3, "Pick": 1.5},
		Model: "RopeBoxtie2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":2.1333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		maxwill: 0.8, enemyTags: {"chainRestraints":2}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal", "Wristties"]},
	{inventory: true, name: "ChainLegs", debris: "Chains", accessible: true, sfx: "Chain", Asset: "Chains", Type: "Strict", Color: "Default", LinkableBy: ["Legbinders", "Hobbleskirts"],
		Model: "RopeLegs2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":2.1333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 5, weight: 0, escapeChance: {"Struggle": 0.15, "Cut": -0.1, "Remove": 0.3, "Pick": 1.5}, enemyTags: {"chainRestraints":2}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	{inventory: true, name: "ChainFeet", debris: "Chains", accessible: true, sfx: "Chain", Asset: "Chains", Color: "Default", LinkableBy: ["Wrapping", "Hogties", "Encase", "Belts"],
		Model: "RopeAnkles2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":2.1333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 5, weight: 0, escapeChance: {"Struggle": 0.03, "Cut": -0.1, "Remove": 0.3, "Pick": 1.5}, enemyTags: {"chainRestraints":2}, playerTags: {"ItemFeetFull":-1}, playerTagsMissingMult: {"ItemLegsFull":0.05}, minLevel: 0, allFloors: true,
		shrine: ["Chains", "Ties","Metal", "HogtieLower"]},
	{inventory: true, name: "ChainCrotch", debris: "Chains", accessible: true, sfx: "Chain", Asset: "CrotchChain", crotchrope: true, strictness: 0.15,
		Model: "RopeCrotch",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":1,"saturation":0,"contrast":2.033333333333333,"brightness":2.1333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		strictnessZones: ["ItemVulva", "ItemVulvaPiercings", "ItemButt"], OverridePriority: 26, Color: "Default", Group: "ItemTorso", power: 3, weight: 0, harness: true, escapeChance: {"Struggle": 0.03, "Cut": -0.1, "Remove": 0.3, "Pick": 1.5}, enemyTags: {"chainRestraints":2}, playerTags: {"ItemPelvisFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal"]},
	//endregion

	//region MagicChain
	{unlimited: true, inventory: true, removePrison: true, sfx: "Chain", name: "MagicChainArms", debris: "Chains", accessible: true, Asset: "Chains", LinkableBy: ["Armbinders", "Wrapping", "Encase",], Type: "WristElbowHarnessTie", Color: "#aa00aa", Group: "ItemArms", bindarms: true, power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": -0.1, "Remove": -0.05},
		Model: "RopeBoxtie2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":0.7333333333333334,"saturation":0,"contrast":1.4166666666666665,"brightness":2.1333333333333333,"red":1.3333333333333333,"green":1,"blue":3.416666666666667,"alpha":1},
		},
		failSuffix: {"Remove": "MagicChain"}, maxwill: 0.9, enemyTags: {"chainRestraintsMagic":2}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal", "Conjure", "Wristties"]},
	{unlimited: true, inventory: true, removePrison: true, sfx: "Chain", name: "MagicChainLegs", debris: "Chains", accessible: true, Asset: "Chains", LinkableBy: ["Legbinders", "Hobbleskirts"],
		Model: "RopeLegs2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":0.7333333333333334,"saturation":0,"contrast":1.4166666666666665,"brightness":2.1333333333333333,"red":1.3333333333333333,"green":1,"blue":3.416666666666667,"alpha":1},
		},
		Type: "Strict", Color: "#aa00aa", Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 4, weight: 0,
		failSuffix: {"Remove": "MagicChain"}, escapeChance: {"Struggle": 0.3, "Cut": -0.1, "Remove": -0.05}, enemyTags: {"chainRestraintsMagic":2}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal", "Conjure"]},
	{unlimited: true, inventory: true, removePrison: true, sfx: "Chain", name: "MagicChainFeet", debris: "Chains", accessible: true, Asset: "Chains", LinkableBy: ["Wrapping", "Hogties", "Encase",], Color: "#aa00aa",
		Model: "RopeAnkles2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":0.7333333333333334,"saturation":0,"contrast":1.4166666666666665,"brightness":2.1333333333333333,"red":1.3333333333333333,"green":1,"blue":3.416666666666667,"alpha":1},
		},
		Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 4, weight: 0, playerTagsMissingMult: {"ItemLegsFull":0.05},
		failSuffix: {"Remove": "MagicChain"}, escapeChance: {"Struggle": 0.2, "Cut": -0.1, "Remove": -0.05}, enemyTags: {"chainRestraintsMagic":2}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true,
		shrine: ["Chains", "Ties","Metal", "Conjure", "HogtieLower"]},
	{unlimited: true, inventory: true, removePrison: true, sfx: "Chain", name: "MagicChainCrotch", debris: "Chains", accessible: true, crotchrope: true, strictness: 0.15, strictnessZones: ["ItemVulva", "ItemVulvaPiercings", "ItemButt"], Asset: "CrotchChain", OverridePriority: 26, Color: "#aa00aa", Group: "ItemTorso", power: 2, weight: 0,
		Model: "RopeCrotch",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":0.7333333333333334,"saturation":0,"contrast":1.4166666666666665,"brightness":2.1333333333333333,"red":1.3333333333333333,"green":1,"blue":3.416666666666667,"alpha":1},
		},
		failSuffix: {"Remove": "MagicChain"}, escapeChance: {"Struggle": 0.2, "Cut": -0.1, "Remove": -0.05}, enemyTags: {"chainRestraintsMagic":2}, playerTags: {"ItemPelvisFull":-1}, minLevel: 0, allFloors: true, shrine: ["RopeCrotch", "Chains", "Ties","Metal", "Conjure"],
		events: [{trigger: "struggle", type: "crotchrope"}]},
	//endregion

	//region ShadowChain
	{unlimited: true, removePrison: true, sfx: "Chain", name: "ShadowChainArms", debris: "Chains", accessible: true, Asset: "Chains", LinkableBy: ["Boxbinders", "Wrapping", "Encase",], Type: "BoxTie", Color: "#000000", Group: "ItemArms", bindarms: true, power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": -0.1, "Remove": -0.1},
		Model: "RopeBoxtie2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":0.7333333333333334,"saturation":0,"contrast":1.4166666666666665,"brightness":2.1333333333333333,"red":0.6333333333333334,"green":0.15,"blue":3.0833333333333335,"alpha":1},
		},
		maxwill: 0.9, enemyTags: {"shadowRestraints":2}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal", "Illusion", "HogtieUpper"]},
	{unlimited: true, removePrison: true, sfx: "Chain", name: "ShadowChainLegs", debris: "Chains", accessible: true, Asset: "Chains", LinkableBy: ["Legbinders", "Hobbleskirts"],
		Model: "RopeLegs2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":0.7333333333333334,"saturation":0,"contrast":1.4166666666666665,"brightness":2.1333333333333333,"red":0.6333333333333334,"green":0.15,"blue":3.0833333333333335,"alpha":1},
		},
		Type: "Strict", Color: "#000000", Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": -0.1, "Remove": -0.1}, enemyTags: {"shadowRestraints":2}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal", "Illusion"]},
	{unlimited: true, removePrison: true, sfx: "Chain", name: "ShadowChainFeet", debris: "Chains", accessible: true, Asset: "Chains", LinkableBy: ["Wrapping", "Encase", "Hogties"], Color: "#000000",
		Model: "RopeAnkles2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":0.7333333333333334,"saturation":0,"contrast":1.4166666666666665,"brightness":2.1333333333333333,"red":0.6333333333333334,"green":0.15,"blue":3.0833333333333335,"alpha":1},
		},
		Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 4, weight: 0, escapeChance: {"Struggle": 0.2, "Cut": -0.1, "Remove": -0.1}, enemyTags: {"shadowRestraints":2}, playerTags: {"ItemFeetFull":-1}, playerTagsMissingMult: {"ItemLegsFull":0.05}, minLevel: 0, allFloors: true,
		shrine: ["Chains", "Ties","Metal", "Illusion", "HogtieLower"]},
	{unlimited: true, removePrison: true, sfx: "Chain", name: "ShadowChainCrotch", debris: "Chains", accessible: true, crotchrope: true, strictness: 0.15,
		Model: "RopeCrotch",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":0.7333333333333334,"saturation":0,"contrast":1.4166666666666665,"brightness":2.1333333333333333,"red":0.6333333333333334,"green":0.15,"blue":3.0833333333333335,"alpha":1},
		},
		strictnessZones: ["ItemVulva", "ItemVulvaPiercings", "ItemButt"], Asset: "CrotchChain", OverridePriority: 26, Color: "#000000", Group: "ItemTorso", power: 2, weight: 0, escapeChance: {"Struggle": 0.2, "Cut": -0.1, "Remove": -0.1}, enemyTags: {"shadowRestraints":2}, playerTags: {"ItemPelvisFull":-1}, minLevel: 0, allFloors: true, shrine: ["RopeCrotch", "Chains", "Ties","Metal", "Illusion"],
		events: [{trigger: "struggle", type: "crotchrope"}]},
	//endregion

	//region GhostChain
	{unlimited: true, removePrison: true, sfx: "Chain", name: "GhostChainArms", accessible: true, Asset: "Chains", LinkableBy: ["Boxbinders", "Wrapping", "Encase",], Type: "BoxTie", Color: "#cccccc", Group: "ItemArms", bindarms: true, power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.2, "Remove": 0.1},
		Model: "RopeBoxtie2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":1.6500000000000001,"saturation":0,"contrast":2.033333333333333,"brightness":2.1333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		maxwill: 0.9, enemyTags: {"ghostRestraints":2}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal", "Illusion", "HogtieUpper"]},
	{unlimited: true, removePrison: true, sfx: "Chain", name: "GhostChainLegs", accessible: true, Asset: "Chains", LinkableBy: ["Legbinders", "Hobbleskirts"], Type: "Strict", Color: "#cccccc",
		Model: "RopeLegs2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":1.6500000000000001,"saturation":0,"contrast":2.033333333333333,"brightness":2.1333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		Group: "ItemLegs", hobble: 1, addTag: ["FeetLinked"], power: 4, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.2, "Remove": 0.1}, enemyTags: {"ghostRestraints":2}, playerTags: {"ItemLegsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Chains", "Ties","Metal", "Illusion"]},
	{unlimited: true, removePrison: true, sfx: "Chain", name: "GhostChainFeet", accessible: true, Asset: "Chains", LinkableBy: ["Wrapping", "Encase", "Hogties"], Color: "#cccccc",
		Model: "RopeAnkles2",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":1.6500000000000001,"saturation":0,"contrast":2.033333333333333,"brightness":2.1333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		Group: "ItemFeet", blockfeet: true, addTag: ["FeetLinked"],power: 4, weight: 0, playerTagsMissingMult: {"ItemLegsFull":0.05}, escapeChance: {"Struggle": 0.3, "Cut": 0.2, "Remove": 0.1}, enemyTags: {"ghostRestraints":2}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true,
		shrine: ["Chains", "Ties","Metal", "Illusion", "HogtieLower"]},
	{unlimited: true, removePrison: true, sfx: "Chain", name: "GhostChainCrotch", accessible: true, crotchrope: true, strictness: 0.15,
		Model: "RopeCrotch",
		struggleBreak: true,
		Filters: {
			Rope: {"gamma":1.6500000000000001,"saturation":0,"contrast":2.033333333333333,"brightness":2.1333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		},
		strictnessZones: ["ItemVulva", "ItemVulvaPiercings", "ItemButt"], Asset: "CrotchChain", OverridePriority: 26, Color: "#cccccc", Group: "ItemTorso", power: 2, weight: 0, escapeChance: {"Struggle": 0.3, "Cut": 0.2, "Remove": 0.1}, enemyTags: {"ghostRestraints":2}, playerTags: {"ItemPelvisFull":-1}, minLevel: 0, allFloors: true, shrine: ["RopeCrotch", "Chains", "Ties","Metal", "Illusion"],
		events: [{trigger: "struggle", type: "crotchrope"}]},
	//endregion

	{removePrison: true, divine: true, name: "DivineCuffs", accessible: true, Asset: "FuturisticCuffs", LinkableBy: ["Boxbinders", "Armbinders", ...KDBindable], DefaultLock: "Gold", Type: "Wrist", Color: ['#6AB0ED', '#AE915C', '#FFFFFF'], Group: "ItemArms", bindarms: true, power: 49, weight: 0,
		Model: "DivineCuffsArms",
		specStruggleTypes: ["Struggle"], escapeChance: {"Struggle": -99, "Cut": -99, "Remove": 1, Pick: -100}, enemyTags: {"divineRestraints":2}, playerTags: {"ItemArmsFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Metal", "Latex", "Leather", "HogtieLower"]},

	{inventory: true, arousalMode: true, name: "DivineBelt", Asset: "OrnateChastityBelt", OverridePriority: 26, Color: ["#272727", "#D3B24B"], Group: "ItemPelvis", chastity: true,
		power: 49, weight: 0,
		special: true,
		alwaysKeep: true,
		Security: {
			level_key: 4,
			level_magic: 4,
			level_tech: 4,
		},
		Model: "DivineBelt",
		factionFilters: {
			Lining: {color: "Highlight", override: true},
		},
		Filters: {
			Lock: {"gamma":1,"saturation":0.06666666666666667,"contrast":1.6833333333333333,"brightness":0.8666666666666666,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
			Lining: {"gamma":1,"saturation":0.06666666666666667,"contrast":2.1333333333333333,"brightness":1.6500000000000001,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
			Steel: {"gamma":1,"saturation":0.06666666666666667,"contrast":0.7833333333333334,"brightness":0.68333333333333334,"red":2.15,"green":1.7166666666666666,"blue":1.0166666666666666,"alpha":1},
		},
		value: 500,
		events: [
			{trigger:"tryOrgasm",  type: "DivineBelt"},
		],
		specStruggleTypes: ["Struggle"], escapeChance: {"Struggle": -99, "Cut": -99, "Remove": 1, Pick: -100},
		DefaultLock: "Divine2",
		enemyTags: {"divinebelt": 10}, playerTags: {}, minLevel: 0, allFloors: true,
		shrine: ["Chastity", "Metal", "Latex", "Rope", "Leather", "ChastityBelts", "SupremeBelt"]},
	{inventory: true, arousalMode: true, name: "DivineBelt2", Asset: "OrnateChastityBelt", OverridePriority: 26, Color: ["#272727", "#D3B24B"], Group: "ItemPelvis", chastity: true,
		power: 49, weight: 0,
		special: true,
		Security: {
			level_key: 4,
			level_magic: 4,
			level_tech: 4,
		},
		alwaysKeep: true,
		Model: "DivineBeltRunic",
		factionFilters: {
			Lining: {color: "Highlight", override: true},
		},
		Filters: {
			Lock: {"gamma":1,"saturation":0.06666666666666667,"contrast":1.6833333333333333,"brightness":0.8666666666666666,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
			Lining: {"gamma":1,"saturation":0.06666666666666667,"contrast":2.1333333333333333,"brightness":1.6500000000000001,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
			Steel: {"gamma":1,"saturation":0.06666666666666667,"contrast":0.7833333333333334,"brightness":0.68333333333333334,"red":2.15,"green":1.7166666666666666,"blue":1.0166666666666666,"alpha":1},
		},
		value: 500,
		events: [
			{trigger:"tryOrgasm",  type: "DivineBelt2"},
		],
		DefaultLock: "Divine2",
		specStruggleTypes: ["Struggle"], escapeChance: {"Struggle": -99, "Cut": -99, "Remove": 1, Pick: -100},
		enemyTags: {"divinebelt": 10}, playerTags: {}, minLevel: 0, allFloors: true,
		shrine: ["Divine", "Chastity", "Metal", "Latex", "Rope", "Leather", "ChastityBelts", "SupremeBelt"]},

	{inventory: true, arousalMode: true, name: "DivineBra", Asset: "FuturisticBra2", OverridePriority: 26, Color: ['#5E5E6B', '#F8BD01', '#5E5E6B', '#5E5E6B', '#F8BD01', '#5E5E6B'], Group: "ItemBreast",
		Security: {
			level_key: 4,
			level_magic: 4,
			level_tech: 4,
		},
		special: true,
		alwaysKeep: true,
		chastitybra: true,
		power: 49,
		weight: 0,
		Model: "DivineBra",
		DefaultLock: "Divine2",
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": 1, Pick: -100}, enemyTags: {"divinebra": 10},
		playerTags: {"FreeBoob": -1000}, minLevel: 0, allFloors: true, shrine: ["Divine", "Chastity", "Metal", "Latex", "Rope", "Leather", "ChastityBras", "SupremeBra"],
		//LinkableBy: ["Ornate"],
		events: [
			{trigger:"playSelf",  type: "DivineBra"},
		],
	},
	{inventory: true, arousalMode: true, name: "DivineBra2", Asset: "FuturisticBra2", OverridePriority: 26, Color: ['#5E5E6B', '#F8BD01', '#5E5E6B', '#5E5E6B', '#F8BD01', '#5E5E6B'], Group: "ItemBreast",
		Security: {
			level_key: 4,
			level_magic: 4,
			level_tech: 4,
		},
		special: true,
		alwaysKeep: true,
		chastitybra: true,
		power: 49,
		weight: 0,
		Model: "DivineBraRunic",
		DefaultLock: "Divine2",
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": 1, Pick: -100}, enemyTags: {"divinebra": 10},
		playerTags: {"FreeBoob": -1000}, minLevel: 0, allFloors: true, shrine: ["Divine", "Chastity", "Metal", "Latex", "Rope", "Leather", "ChastityBras", "SupremeBra"],
		//LinkableBy: ["Ornate"],
		events: [
			{trigger:"playSelf",  type: "DivineBra2"},
		],
	},

	{removePrison: true, divine: true, name: "DivineAnkleCuffs", accessible: true, Asset: "FuturisticAnkleCuffs",
		LinkableBy: [...KDBindable], DefaultLock: "Divine2", Color: ['#AE915C', '#71D2EE', '#AE915C', '#000000'],
		Group: "ItemFeet", Type: "Closed", blockfeet: true, addTag: ["FeetLinked"],power: 49, weight: 0,
		Model: "DivineCuffsAnkles",
		specStruggleTypes: ["Struggle"], escapeChance: {"Struggle": -99, "Cut": -99, "Remove": 1, Pick: -100}, enemyTags: {"divineRestraints":2}, playerTags: {"ItemFeetFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Metal", "Latex", "Leather"]},
	{removePrison: true, divine: true, name: "DivineGag", accessible: true, gag: 0.9, Asset: "FuturisticMuzzle",
		Modules: [0, 1, 1], LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink],
		Color: ['#AE915C', '#AE915C', '#CAA562', '#5FBEE8'], DefaultLock: "Divine2", Group: "ItemMouth", AssetGroup: "ItemMouth3", power: 30, weight: 0,
		Model: "DivineGag", Link: "DivineMuzzle",
		specStruggleTypes: ["Struggle"], escapeChance: {"Struggle": -99, "Cut": -99, "Remove": 1, Pick: -100}, enemyTags: {"divineRestraints":2}, playerTags: {"ItemPelvisFull":-1}, minLevel: 0, allFloors: true, shrine: ["Rope", "Metal", "Latex", "Leather"]},
	{removePrison: true, divine: true, name: "DivineMuzzle", accessible: true, gag: 0.6, Asset: "FuturisticMuzzle",
		Modules: [0, 1, 1], LinkableBy: [...KDFlatGagLink], renderWhenLinked: [...KDFlatGagLink],
		Color: ['#AE915C', '#AE915C', '#CAA562', '#5FBEE8'], DefaultLock: "Divine2", Group: "ItemMouth", AssetGroup: "ItemMouth3", power: 30, weight: 0,
		Model: "DivineMuzzle",
		Filters: {"Muzzle":{"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":0.7333333333333334,"red":2.283333333333333,"green":1.7333333333333334,"blue":1,"alpha":2.8000000000000003},"Harness":{"gamma":1,"saturation":1,"contrast":0.8999999999999999,"brightness":3.233333333333333,"red":1,"green":1,"blue":1,"alpha":1},"Collar":{"gamma":1,"saturation":1,"contrast":0.8166666666666667,"brightness":2.8666666666666667,"red":1,"green":1,"blue":1,"alpha":1},"Rim":{"gamma":1.8666666666666667,"saturation":1,"contrast":1,"brightness":3.1666666666666665,"red":1,"green":1,"blue":1,"alpha":1}},
		specStruggleTypes: ["Struggle"], escapeChance: {"Struggle": -99, "Cut": -99, "Remove": 1, Pick: -100}, enemyTags: {"divineRestraints":2}, playerTags: {"ItemPelvisFull":-1}, minLevel: 12, allFloors: true, shrine: ["Rope", "Metal", "Latex", "Leather"]},

	{inventory: true, name: "BasicCollar", debris: "Belts", accessible: true, Asset: "LeatherCollar", Color: ["#000000", "Default"], Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 1, weight: 0, escapeChance: {"Struggle": -0.2, "Cut": 0.15, "Remove": 0.5, "Pick": 0.1},
		Model: "LeatherCollar",
		maxwill: 0.25,
		struggleBreak: true,
		linkCategory: "BasicCollar", linkSize: 0.51,
		factionFilters: {
			Band: {color: "LightNeutral", override: true},
			Cuff: {color: "DarkNeutral", override: true},
		},
		unlimited: true, enemyTags: {"leashing":0.001, "maidCollar":-1, "dragonRestraints":-1, "mithrilRestraints": -1}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, maxLevel: 3, allFloors: true, shrine: ["Collars", "Will"]},
	{inventory: true, name: "SteelCollar", accessible: true, Asset: "SlenderSteelCollar", Color: ["Default"], Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 3, weight: 0, escapeChance: {"Struggle": -0.5, "Cut": -0.4, "Remove": 0.5, "Pick": 0.05},
		Model: "WolfCollarRestraint",
		struggleBreak: true,
		linkCategory: "BasicCollar", linkSize: 0.51,
		tightType: "Secure",
		Filters: {
			Band: {"gamma":1,"saturation":0.05,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
			Lining: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.48333333333333334,"red":1,"green":1,"blue":1,"alpha":1},
		},
		maxwill: 0.25,
		unlimited: true, enemyTags: {"leashing":0.001, "maidCollar":-1, "dragonRestraints":-1, "mithrilRestraints": -1, 'shopCollar': 10}, playerTags: {"ItemNeckFull":-2, "Unchained": -1, "Damsel": 1}, minLevel: 2, allFloors: true, shrine: ["Collars", "Elements"]},
	{inventory: true, name: "MagicCollar", debris: "Belts", accessible: true, Asset: "LeatherCollar", Color: ["#000000", "#6E5B38"], Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 2, weight: 0, magic: true, escapeChance: {"Struggle": -0.5, "Cut": -0.1, "Remove": 0.25, "Pick": 0.05},
		Model: "SteelCollarRunes",
		struggleBreak: true,
		tightType: "Secure",
		linkCategory: "BasicCollar", linkSize: 0.51,
		Filters: {
			Runes: {"gamma":1,"saturation":1,"contrast":0.3833333333333333,"brightness":0.48333333333333334,"red":1,"green":2.8499999999999996,"blue":3.3000000000000003,"alpha":3.7666666666666666},
			BaseMetal: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":2.5333333333333337,"alpha":1},
		},

		factionFilters: {
			Runes: {color: "Highlight", override: true},
			BaseMetal: {color: "DarkNeutral", override: true},
		},
		maxwill: 0.25,
		unlimited: true, enemyTags: {"leashing":0.001, "maidCollar":-1, "dragonRestraints":-1, "mithrilRestraints": -1, 'shopCollar': 10}, playerTags: {"ItemNeckFull":-2, "Damsel": -1}, minLevel: 2, allFloors: true, shrine: ["Collars", "Conjure"]},
	{inventory: true, name: "KittyCollar", debris: "Belts", accessible: true, Asset: "LeatherCollarBell", Color: ["Default"], Group: "ItemNeck", LinkableBy: [...KDCollarLink],renderWhenLinked: [...KDCollarRender],power: 5, weight: 0, magic: true, escapeChance: {"Struggle": -0.5, "Cut": -0.25, "Remove": 0.25, "Pick": 0.05},
		Model: "LeatherCollarBell",
		struggleBreak: true,
		linkCategory: "BasicCollar", linkSize: 0.51,
		Filters: {
			Cuff: {"gamma":2.2333333333333334,"saturation":1,"contrast":1.0833333333333335,"brightness":2.283333333333333,"red":1,"green":1,"blue":1,"alpha":1},
			Band: {"gamma":1,"saturation":0.05,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		},
		factionFilters: {
			Band: {color: "Highlight", override: true},
			Cuff: {color: "DarkNeutral", override: true},
		},
		maxwill: 0.25,
		unlimited: true, enemyTags: {"kittyRestraints":0.001, "kittyCollar": 10, "maidCollar":-1, "dragonRestraints":-1, "mithrilRestraints": -1, 'shopCollar': 10}, playerTags: {"ItemNeckFull":-2}, minLevel: 0, allFloors: true, shrine: ["Collars", "Will"],

	},

	{inventory: true, removePrison: true, alwaysKeep: true, showInQuickInv: true, good: true, name: "QuakeCollar", accessible: true, Asset: "SlenderSteelCollar", Color: ["#6E5B38"],
		Group: "ItemNeck", power: 55, weight: 0, escapeChance: {"Struggle": -10, "Cut": -10, "Remove": 0.5, "Pick": 0.1},
		Model: "QuakeCollar",
		struggleBreak: true,
		curse: "MistressKey",
		enchanted: true,
		value: 1000,
		tightType: "Secure",
		LinkableBy: [...KDCollarLink],
		alwaysRender: true,
		alwaysStruggleable: true,
		events: [
			{trigger:"playSelf",  type: "QuakeCollar"},
		],
		enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Collars", "HighCollars"]},
	{inventory: true, removePrison: true, alwaysKeep: true, showInQuickInv: true, good: true, name: "PotionCollar", accessible: true, Asset: "SlenderSteelCollar", Color: ["#6E5B38"], Group: "ItemNeck", power: 1, weight: 0, escapeChance: {"Struggle": -0.2, "Cut": -0.1, "Remove": 0.5, "Pick": 0.15}, potionCollar: true, allowPotions: true,
		Model: "MageCollar",
		struggleBreak: true,
		value: 500,
		tightType: "Secure",
		factionFilters: {
			Band: {color: "Highlight", override: true},
			Cuff: {color: "DarkNeutral", override: true},
		},
		Filters: {"Hardware":{"gamma":1,"saturation":0,"contrast":1.24,"brightness":1,"red":1.8431372549019607,"green":1.0980392156862746,"blue":0.29411764705882354,"alpha":1}},
		enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Collars"]},
	{
		name: "GagNecklace", accessible: true, harness: true,
		Group: "ItemNeck",
		power: 1, weight: 0,
		escapeChance: {"Struggle": -0.08, "Cut": 0.1, "Remove": 0.2, "Pick": 0.5},
		Model: "GagNecklace",
		value: 20,
		tightType: "Secure",
		LinkAll: true, AlwaysLinkable: true, noDupe: true,
		factionFilters: {
			Ball: {color: "Highlight", override: false},
			Strap: {color: "DarkNeutral", override: true},
		},
		events: [
			{trigger: "postApply", type: "requireNoGags"},
		],
		enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Collars", "GagNecklance"]},
	{inventory: true, name: "SarielPanties", unlimited: true, debris: "Fabric", Asset: "ClothStuffing", LinkableBy: [...KDStuffingLink], Color: "Default", Group: "ItemMouth", power: -1, weight: 0, gag: 0.1,
		value: 1000,
		alwaysKeep: true, showInQuickInv: true, good: true,
		Model: "Stuffing",
		alwaysRender: true,
		Filters: {
			Stuffing: {"gamma":0.3833333333333333,"saturation":1,"contrast":1.3,"brightness":0.2,"red":1,"green":1,"blue":1,"alpha":1},
		},
		events: [
			{trigger: "perksBonus", type: "spellDamage", power: 0.1, inheritLinked: true,},
			{type: "ReduceMiscastVerbal", trigger: "beforeCast", power: 0.5, inheritLinked: true},
		],
		alwaysInaccessible: true,
		escapeChance: {"Struggle": 1, "Cut": 1, "Remove": 1}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: ["Stuffing"]},
	{inventory: true, removePrison: true, alwaysKeep: true, showInQuickInv: true, good: true, name: "SlimeWalkers", debris: "Belts", inaccessible: true, Asset: "BalletHeels", Color: "#ff00ff", Group: "ItemBoots", power: 1, weight: 0, slimeWalk: true,
		value: 250,
		heelpower: 0.5,
		Model: "BalletHeelsRestraint",
		Filters: {
			Shoe: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1.9666666666666666,"green":1,"blue":3.616666666666667,"alpha":1},
			Sole: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":2.15,"alpha":1},
			Laces: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":3.9000000000000004,"red":1,"green":1,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": 0.15, "Cut": 0.45, "Remove": 0.4, "Pick": 0.9}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: []},
	{inventory: true, removePrison: true, alwaysKeep: true, showInQuickInv: true, good: true, name: "ElvenPanties", debris: "Fabric", inaccessible: true,
		Asset: "ElfPanties", Color: "#ff00ff", Group: "ItemPelvis", power: 1, weight: 0,
		value: 250,
		armor: true,
		Model: "ElfPanties",
		LinkAll: true,
		AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
		events: [
			{type: "Buff", trigger: "tick", power: 0.11, buffType: "SprintEfficiency"},
		],
		escapeChance: {"Struggle": 1, "Cut": 1, "Remove": 1, "Pick": 1}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: []},
	{inventory: true, removePrison: true, alwaysKeep: true, showInQuickInv: true, good: true,
		name: "GasMask", debris: "Belts", accessible: true,
		Asset: "GasMask", Color: "#ff00ff", Group: "ItemMouth", gag: 0.4, power: 1, weight: 0,
		value: 300,
		displayPower: 3,
		Model: "GasMask",
		events: [
			{type: "Buff", trigger: "tick", power: 2.0, buffType: "happygasDamageResist"},
			{type: "Buff", trigger: "tick", power: 0.5, buffType: "poisonDamageResist"},
		],
		escapeChance: {"Struggle": 0.15, "Cut": -0.3, "Remove": 10, "Pick": 0.9}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: []},
	{inventory: true, removePrison: true, alwaysKeep: true, showInQuickInv: true, good: true,
		name: "Sunglasses", accessible: true,
		Asset: "Sunglasses", Color: "#ffffff", Group: "ItemHead", power: 1, weight: 0,
		armor: true,
		displayPower: 2,
		value: 150,
		Model: "Glasses",
		Filters: {
			Glasses: {"gamma":1,"saturation":0.18333333333333335,"contrast":0.5,"brightness":0.9666666666666667,"red":1,"green":1,"blue":1,"alpha":1},
			Lens: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.08333333333333333,"red":1,"green":1,"blue":1,"alpha":1.2666666666666668},
		},
		factionFilters: {
			Glasses: {color: "DarkNeutral", override: false},
		},
		events: [
			{type: "Buff", trigger: "tick", power: .25, buffType: "holyDamageResist"},
			{type: "Buff", trigger: "tick", power: 1.5, buffType: "blindResist"},
		],
		escapeChance: {"Struggle": 0.25, "Cut": -0.25, "Remove": 10, "Pick": 0.9}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: []},
	{inventory: true, removePrison: true, alwaysKeep: true, showInQuickInv: true, good: true,
		name: "Sunglasses2", accessible: true,
		Asset: "Sunglasses", Color: "#ffffff", Group: "ItemHead", power: 1, weight: 0,
		displayPower: 2,
		value: 150,
		Model: "Sunglasses",
		armor: true,
		Filters: {
			Glasses: {"gamma":1,"saturation":0.18333333333333335,"contrast":0.5,"brightness":0.9666666666666667,"red":1,"green":1,"blue":1,"alpha":1},
			Lens: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.08333333333333333,"red":1,"green":1,"blue":1,"alpha":1.2666666666666668},
		},
		factionFilters: {
			Glasses: {color: "DarkNeutral", override: false},
		},
		events: [
			{type: "Buff", trigger: "tick", power: .25, buffType: "holyDamageResist"},
			{type: "Buff", trigger: "tick", power: 1.5, buffType: "blindResist"},
		],
		escapeChance: {"Struggle": 0.25, "Cut": -0.25, "Remove": 10, "Pick": 0.9}, enemyTags: {}, playerTags: {}, minLevel: 0, floors: KDMapInit([]), shrine: []},
	{inventory: true, removePrison: true, name: "BasicLeash", tether: 2.9, Asset: "CollarLeash", Color: "Default", Group: "ItemNeckRestraints", leash: true, power: 1, weight: -99, harness: true,
		Model: "Leash",
		unlimited: true,
		struggleBreak: true,
		affinity: {
			Cut: ["SharpTug", "SharpHookOrFoot"],
			Struggle: ["Tug", "HookOrFoot"],
		},
		events: [
			{trigger: "postRemoval", type: "RequireCollar"}
		],
		struggleMinSpeed: {
			Cut: 0.05,
		},
		limitChance: {Struggle: 0.2},
		escapeChance: {"Struggle": -0.1, "Cut": 0.2, "Remove": 0.5, "Pick": 1.25}, enemyTags: {"leashing":1}, playerTags: {"ItemNeckRestraintsFull":-2, "ItemNeckFull":99}, minLevel: 0, allFloors: true, shrine: ["Leashes", "Leashable"]},

	//region Cursed Set - Flames of Desire
	//endregion

	//region Cursed Set - Grace of the Clouds
	//endregion

	//region Cursed Set - Deluge of Passion
	//endregion

	//region Cursed Set - Iron Discipline
	//endregion

	//region Cursed Set - Stardust Curse
	{inventory: true, name: "CursedCollar", alwaysKeep: true, debris: "Chains", Asset: "SlenderSteelCollar", Color: ["#7842ad"], Group: "ItemNeck", LinkableBy: [...KDCollarLink],
		special: true,
		struggleBreak: true,
		Model: "StardustCollar",
		tightType: "Secure",
		Filters: {
			"Collar": {"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":0.3,"red":1.4,"green":1,"blue":3.95,"alpha":1},
		},
		power: 49, weight: -100, escapeChance: {"Struggle": -50, "Cut": -50, "Remove": -50, "Pick": -50},
		curse: "CursedCollar",
		enemyTags: {"cursedCollar": 1000, "ChestCollar": 1000}, playerTags: {}, minLevel: 0, allFloors: true,
		shrine: ["Collars", "Cursed", "CursedSet", "Stardust"],
		events: [
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedTransformation", color: "#9074ab", inheritLinked: true},
			{trigger: "postApply", type: "EngageCurse", inheritLinked: true},
			{trigger: "EngageCurse", type: "CursedCollar", inheritLinked: true, trim: true, curse: true, tags: ["obsidianRestraints", "shadowLatexRestraints", "shadowLatexRestraintsHeavy", "shadowLatexRestraintsForced",], msg: "KDCursedTransformation"},
			{trigger: "tick", type: "TriggerCurseTransform", chance: 0.25, inheritLinked: true, trim: true, curse: true, tags: ["obsidianRestraints", "shadowLatexRestraints", "shadowLatexRestraintsHeavy",], msg: "KDCursedTransformation"},
		]},
	{inventory: true, name: "CursedCollar2", alwaysKeep: true, debris: "Chains", Asset: "SlenderSteelCollar", Color: ["#8E72AA"], Group: "ItemNeck", LinkableBy: [...KDCollarLink],
		special: true,
		struggleBreak: true,
		Model: "StardustCollar",
		tightType: "Secure",
		Filters: {
			"Collar": {"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1.0,"red":1.4,"green":1,"blue":1.9, "alpha":1},
		},
		power: 49, weight: -100, escapeChance: {"Struggle": -50, "Cut": -50, "Remove": -50, "Pick": -50},
		curse: "CursedCollar",
		enemyTags: {"cursedCollar2": 1000, "ChestCollar": 1000}, playerTags: {}, minLevel: 0, allFloors: true,
		shrine: ["Collars", "Cursed", "CursedSet", "Stardust"],
		events: [
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedTransformation", color: "#9074ab", inheritLinked: true},
			{trigger: "postApply", type: "EngageCurse", inheritLinked: true},
			{trigger: "EngageCurse", type: "CursedCollar", inheritLinked: true, trim: true, curse: true, tags: ["mithrilRestraints", "liquidMetalRestraintsRandom"], msg: "KDCursedTransformation"},
			{trigger: "tick", type: "TriggerCurseTransform", chance: 0.25, inheritLinked: true, trim: true, curse: true, tags: ["mithrilRestraints", "liquidMetalRestraintsRandom"], msg: "KDCursedTransformation"},
		]},
	//endregion




	//region Enchanted
	{curse: "MistressKey", enchantedDrain: 0.00001, inventory: true, arousalMode: true, enchanted: true, name: "EnchantedBelt", Asset: "PolishedChastityBelt", OverridePriority: 26, Color: "#AE915C", Group: "ItemPelvis", chastity: true, power: 44, weight: 0,
		Security: {
			level_key: 4,
			level_magic: 4,
			level_tech: 4,
		},
		Model: "SteelChastityBelt_Segu",
		factionFilters: {
			Lining: {color: "Highlight", override: true},
		},
		Filters: {
			Lock: {"gamma":1,"saturation":0.06666666666666667,"contrast":2.1333333333333333,"brightness":1.6500000000000001,"red":1,"green":1.0166666666666666,"blue":1.0166666666666666,"alpha":1},
			Lining: {"gamma":1,"saturation":0.06666666666666667,"contrast":2,"brightness":1.25,"red":1,"green":3.7,"blue":4.566666666666666,"alpha":1},
			BaseMetal: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":3.1666666666666665,"brightness":0.6166666666666667,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Ancient", "SupremeBelt"],
		//renderWhenLinked: ["Ornate],
		LinkableBy: ["Ornate"],
		events: [
			{trigger: "calcMiscast", type: "ReduceMiscastFlat", power: 0.3, requireEnergy: true},
			{trigger: "tick", type: "RegenStamina", power: 1, requireEnergy: true, energyCost: 0.0005},
		]},
	{curse: "MistressKey", enchantedDrain: 0.00001, inventory: true, arousalMode: true, enchanted: true, name: "EnchantedBra", Asset: "PolishedChastityBra", OverridePriority: 26, Color: "#AE915C", Group: "ItemBreast", chastitybra: true, power: 44, weight: 0,
		Security: {
			level_key: 4,
			level_magic: 4,
			level_tech: 4,
		},

		Model: "SteelChastityBra_Segu",
		Filters: {
			Lock: {"gamma":1,"saturation":0.06666666666666667,"contrast":2,"brightness":1.25,"red":1,"green":3.7,"blue":4.566666666666666,"alpha":1},
			Lining: {"gamma":1,"saturation":0.06666666666666667,"contrast":2,"brightness":1.25,"red":1,"green":3.7,"blue":4.566666666666666,"alpha":1},
			BaseMetal: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":2.183333333333333,"brightness":0.6166666666666667,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
			Chain: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":2.183333333333333,"brightness":0.6166666666666667,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {"FreeBoob": -1000}, minLevel: 0, allFloors: true, shrine: ["Ancient", "SupremeBra"],
		//renderWhenLinked: ["Ornate],
		LinkableBy: ["Ornate"],
		events: [
			{trigger: "beforeDamage", type: "ModifyDamageFlat", power: -2, requireEnergy: true, energyCost: 0.01, inheritLinked: true}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00001, inventory: true, enchanted: true, name: "EnchantedHeels", Asset: "BalletWedges", Color: "#AE915C", Group: "ItemBoots", power: 44, weight: 0,

		heelpower: 0.8,
		Model: "BalletHeelsRestraint",
		Filters: {
			Shoe: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1.9666666666666666,"green":1.1500000000000001,"blue":0.5666666666666667,"alpha":1},
			Laces: {"gamma":1,"saturation":1,"contrast":1.1333333333333333,"brightness":3.9000000000000004,"red":1,"green":1,"blue":1,"alpha":0},
		},
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Ancient"],
		events: [
			{trigger: "tick", type: "ApplySlowLevelBuff", power: -2, requireEnergy: true, energyCost: 0.0005, inheritLinked: true},
			{type: "ShadowHeel", trigger: "playerAttack", requireEnergy: true, energyCost: 0.00225, inheritLinked: true},
			//{trigger: "beforePlayerAttack", type: "BoostDamage", power: 1, requireEnergy: true, energyCost: 0.001125}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00001, inventory: true, enchanted: true, name: "EnchantedBlindfold", Asset: "PaddedBlindfold", Color: ["#AE915C", "#262626"], Group: "ItemHead", blindfold: 6, power: 44, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Ancient"],
		LinkableBy: [...KDBlindfoldLink],
		Model: "BlindfoldBasic",
		Filters: {
			Rim: {"gamma":1,"saturation":1,"contrast":1,"brightness":1.9166666666666667,"red":0.6,"green":1.9166666666666667,"blue":2.916666666666667,"alpha":1},
			Blindfold: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":2.4166666666666665,"brightness":1.2166666666666668,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
		},
		events: [
			{trigger: "calcEvasion", type: "BlindFighting", requireEnergy: true, inheritLinked: true},
			{trigger: "tick", type: "AccuracyBuff", power: 1.0, requireEnergy: true, inheritLinked: true},
			{trigger: "beforePlayerAttack", type: "BoostDamage", power: 1, requireEnergy: true, energyCost: 0.001125, inheritLinked: true},
		]},
	{curse: "MistressKey", enchantedDrain: 0.00001, inventory: true, enchanted: true, name: "EnchantedAnkleCuffs", Asset: "SteelAnkleCuffs", Type: "Chained", Color: ["#AE915C", "#B0B0B0"], Group: "ItemFeet", power: 44, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Ancient"],
		LinkableBy: [...KDBindable, ...KDDevices], renderWhenLinked: [...KDBindable],
		Model: "ShacklesAnkles",
		alwaysDressModel: [
			{Model: "AnkleLink", inheritFilters: true},
		],
		Filters: {
			BaseMetal: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":1.7166666666666666,"brightness":1.4833333333333334,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
		},
		events: [
			{trigger: "tick", type: "EnchantedAnkleCuffs"},
			{trigger: "tick", type: "AllyHealingAura", aoe: 3.9, power: 1.5, inheritLinked: true},
			{trigger: "tick", type: "EvasionBuff", power: 0.25, requireEnergy: true, inheritLinked: true},
			{trigger: "missPlayer", type: "EnergyCost", requireEnergy: true, energyCost: 0.0075, inheritLinked: true}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00001, inventory: true, enchanted: true, inventoryAs: "EnchantedAnkleCuffs", name: "EnchantedAnkleCuffs2", Asset: "SteelAnkleCuffs", Type: "Closed", blockfeet: true, addTag: ["FeetLinked"],Color: ["#AE915C", "#B0B0B0"], Group: "ItemFeet", power: 44, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Ancient"],
		LinkableBy: [...KDBindable, ...KDDevices], renderWhenLinked: [...KDBindable],
		Model: "ShacklesAnkles",
		Filters: {
			BaseMetal: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":1.7166666666666666,"brightness":1.4833333333333334,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
		},
		events: [
			// These wont unlink if they're under something else
			{trigger: "tick", type: "EnchantedAnkleCuffs2", requireEnergy: true, inheritLinked: true}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00001, inventory: true, enchanted: true, name: "EnchantedMuzzle", gag: 1.0, Asset: "FuturisticMuzzle", Modules: [1, 1, 2], Color: ['#AE915C', '#AE915C', '#CAA562', '#000000'],
		Group: "ItemMouth", power: 44, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["AncientMuzzle", "FlatGags"],
		Model: "PlugMuzzleGag",
		Filters: {
			Muzzle: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":1.25,"brightness":0.7666666666666666,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
			Strap: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":1.25,"brightness":0.7666666666666666,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
			Plug: {"gamma":0.6333333333333334,"saturation":0.2,"contrast":3.7,"brightness":0.8666666666666667,"red":1.1333333333333333,"green":2.05,"blue":2.5,"alpha":1},
		},
		events: [
			{trigger: "tick", type: "SneakBuff", power: 1.15, requireEnergy: true, inheritLinked: true},
			{trigger: "tick", type: "RegenMana", power: 1.0, requireEnergy: true, energyCost: 0.0025, inheritLinked: true},
			{trigger: "beforeDamageEnemy", type: "AddDamageStealth", power: 7.0, requireEnergy: true, energyCost: 0.0015, inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.25, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.2, requiredTag: "Blindfolds"},
		]},
	{curse: "MistressKey", enchantedDrain: 0.00001, inventory: true, enchanted: true, name: "EnchantedBallGag", gag: 0.6, Asset: "FuturisticHarnessBallGag", Color: ['#AE915C', '#AE915C', '#424242', "#CAA562", '#000000'],
		Group: "ItemMouth", power: 44, weight: 0,
		Model: "PlugMuzzleGag",
		Filters: {
			Harness: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":1.25,"brightness":0.7666666666666666,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
			SideStrap: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":1.25,"brightness":0.7666666666666666,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
			Strap: {"gamma":0.8999999999999999,"saturation":0.2,"contrast":1.25,"brightness":0.7666666666666666,"red":2.816666666666667,"green":1.9333333333333333,"blue":1,"alpha":1},
			Ball: {"gamma":0.8666666666666667,"saturation":0,"contrast":1.3,"brightness":1.3333333333333333,"red":1,"green":2.816666666666667,"blue":3.05,"alpha":1},
		},
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Flat"],
		LinkableBy: [...KDBallGagLink, "AncientMuzzle"], renderWhenLinked: [...KDBallGagLink],
		events: [
			{trigger: "calcMiscast", type: "ReduceMiscastFlat", power: 0.3, requireEnergy: true, inheritLinked: true},
			{trigger: "tick", type: "RegenMana", power: 1.0, requireEnergy: true, energyCost: 0.0025, inheritLinked: true},
			{trigger: "beforeDamageEnemy", type: "MultiplyDamageStatus", power: 1.3, requireEnergy: true, energyCost: 0.0025, inheritLinked: true},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagRemoveBlindfold", inheritLinked: true,StruggleType: "Remove", power: 0.25, requiredTag: "Blindfolds"},
			{trigger: "beforeStruggleCalc", type: "struggleDebuff", msg: "KDHarnessGagStruggleBlindfold", inheritLinked: true,StruggleType: "Struggle", power: 0.2, requiredTag: "Blindfolds"},
		]},
	{curse: "MistressKey", enchantedDrain: 0.00001, inventory: true, enchanted: true, name: "EnchantedArmbinder", inaccessible: true, Asset: "FuturisticArmbinder", Type: "Tight", Color: ['#AE915C', '#AE915C', '#424242', "#424242", '#000000'],
		Group: "ItemArms", power: 44, weight: 0,
		bindarms: true,
		bindhands: 1.0,
		Model: "Jacket",
		Filters: {
			BeltsArms: {"gamma":1.1833333333333333,"saturation":0.2,"contrast":1.4333333333333333,"brightness":0.7666666666666666,"red":3.1666666666666665,"green":2.5166666666666666,"blue":1,"alpha":1},
			BeltsChest: {"gamma":1.1833333333333333,"saturation":0.2,"contrast":1.4333333333333333,"brightness":0.7666666666666666,"red":3.1666666666666665,"green":2.5166666666666666,"blue":1,"alpha":1},
			Chest: {"gamma":1.4166666666666665,"saturation":1.0833333333333335,"contrast":2.5333333333333337,"brightness":0.6166666666666667,"red":1,"green":1,"blue":1,"alpha":1},
			Arms: {"gamma":1.4166666666666665,"saturation":1.0833333333333335,"contrast":2.5333333333333337,"brightness":1.6166666666666667,"red":1,"green":1,"blue":1,"alpha":1},
		},
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Ancient", "Armbinders", "Block_ItemHands"],
		LinkableBy: [...KDArmbinderLink], renderWhenLinked: [...KDArmbinderLink],
		events: [
			{trigger: "tick", type: "spellRange", power: 0.5, requireEnergy: true},
			{trigger: "beforeDamageEnemy", type: "MultiplyDamageMagic", power: 1.4, requireEnergy: true, energyCost: 0.00002, inheritLinked: true}
		]},
	{curse: "MistressKey", enchantedDrain: 0.00001, inventory: true, enchanted: true, name: "EnchantedMittens", Asset: "FuturisticMittens", bindhands: 1.0,
		Model: "LeatherMittens",
		Filters: {
			Band: {"gamma":0.43333333333333335,"saturation":1,"contrast":1.1833333333333333,"brightness":0.5166666666666666,"red":2.8666666666666667,"green":1.9500000000000002,"blue":0.3,"alpha":1},
			Mitten: {"gamma":0.9166666666666666,"saturation":1,"contrast":3,"brightness":0.06666666666666667,"red":1,"green":1,"blue":1,"alpha":1},
		},
		Color: ['#B6A262', '#B6A262', '#424242', '#000000'], Group: "ItemHands", power: 44, weight: 0,
		escapeChance: {"Struggle": -100, "Cut": -100, "Remove": -100}, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Ancient"],
		LinkableBy: ["Tape", "Mittens"],
		events: [
			{trigger: "beforeDamageEnemy", type: "MultiplyDamageMagic", power: 1.4, requireEnergy: true, energyCost: 0.000025, inheritLinked: true} // Energy cost per point o' extra damage
		]},
	//endregion
];


KDAddRopeVariants(
	"RopeSnake",
	"WeakMagicRope",
	"",
	"ropeMagicWeak",
	["WeakMagicRopes"],
	["RopeSnake"],
	2,
	{
		magic: true,
		Color: "#bb3cd7",
	},
	[
		{trigger: "drawSGTooltip", type: "StruggleManaBonus", inheritLinked: true, power: 0.2, mult: 0.1, threshold: 10},
		{trigger: "beforeStruggleCalc", type: "StruggleManaBonus", inheritLinked: true, power: 0.2, mult: 0.1, threshold: 10},
	],
	{
		Struggle: -0.1,
		Cut: -0.1,
		Remove: -0.05,
	},
	{
	},
	{
		Rope: {"gamma":2.55,"saturation":0.9666666666666667,"contrast":2,"brightness":0.5,"red":1.6833333333333333,"green":1,"blue":2.6500000000000004,"alpha":1},
	},
	undefined, true
);
KDAddRopeVariants(
	"RopeSnake",
	"CelestialRope",
	"",
	"celestialRopes",
	["HolyRope", "Holy"],
	["RopeSnake"],
	4,
	{
		magic: true,
		Color: "#ffff44",
	},
	[{trigger: "struggle", type: "celestialRopePunish"}],
	{
		Struggle: -0.15,
		Cut: 0,
		Remove: -0.1,
	},
	{
	},
	{
		Rope: {"gamma":1.6166666666666665,"saturation":1,"contrast":1.6,"brightness":2.45,"red":2.2,"green":2.4166666666666665,"blue":1,"alpha":1},
	},
);

KDAddRopeVariants(
	"RopeSnake",
	"StrongMagicRope",
	"",
	"ropeMagicStrong",
	["StrongMagicRopes"],
	["RopeSnake"],
	4,
	{
		magic: true,
		Color: "#4fa4b8",
	},
	[
		{trigger: "drawSGTooltip", type: "StruggleManaBonus", inheritLinked: true, power: 0.3, mult: 0.1, threshold: 10},
		{trigger: "beforeStruggleCalc", type: "StruggleManaBonus", inheritLinked: true, power: 0.3, mult: 0.1, threshold: 10},
	],
	{
		Struggle: -0.25,
		Cut: 0,
		Remove: -0.15,
	},
	{
	},
	{
		Rope: {"gamma":1.7333333333333334,"saturation":2.1,"contrast":1.4000000000000001,"brightness":0.9666666666666667,"red":0.44999999999999996,"green":1.4000000000000001,"blue":2.6166666666666667,"alpha":1},
	},
	undefined, true
);
KDAddRopeVariants(
	"RopeSnake",
	"MithrilRope",
	"",
	"mithrilRope",
	["Mithril"],
	["RopeSnake"],
	4,
	{
		Color: "#ffffff",
	},
	[],
	{
		Struggle: -0.15,
		Cut: -0.45,
		Remove: -0.05,
	},
	{
	},
	{
		Rope: {"gamma":1.7833333333333334,"saturation":0,"contrast":2.45,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
	},
);



KDAddCuffVariants(
	"Template",
	"Blacksteel",
	"",
	"blacksteel",
	{"blacksteelRestraints": 4, "expRestraints": 7},
	["Blacksteel"],
	[],
	0,
	{
		Color: ["#92e8c0", "#171222", "#333333"],
	},
	[],
	{
		Struggle: -0.05,
		Cut: 0.05,
		Remove: 0.0,
		Pick: 0.00,
	},
	{
	},{
		Struggle: -0.15,
		Cut: 0.05,
		Remove: 0.0,
		Pick: 0.00,
	},
	{
	}, {
		BaseMetal: {"gamma":0.6166666666666667,"saturation":1,"contrast":1.3,"brightness":2.4166666666666665,"red":1,"green":1,"blue":1,"alpha":1},
	}, 6, false,
	{
		"ArmCuffs": "FuturisticCuffs",
		"LegCuffs": "FuturisticLegCuffs",
		"AnkleCuffs": "FuturisticAnkleCuffs",
	},
	{
		"ArmCuffs": "SteelCuffsArms",
		"LegCuffs": "SteelCuffsThigh",
		"AnkleCuffs": "SteelCuffsAnkles",
	},
);

KDAddCuffVariants(
	"Template",
	"Mithril",
	"",
	"mithril",
	{},
	["Mithril"],
	[],
	0,
	{
		Color: "#ffffff",
	},
	[],
	{
		Struggle: 0.0,
		Cut: 0.0,
		Remove: 0.0,
		Pick: 0.00,
	},
	{
	},{
		Struggle: -0.1,
		Cut: 0.0,
		Remove: 0.0,
		Pick: 0.00,
	},
	{
	}, {
		BaseMetal: {"gamma":1.7833333333333334,"saturation":1,"contrast":2.45,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		Rim: {"gamma":1.2833333333333334,"saturation":1,"contrast":2.45,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
	}, 6, false,
	{
		"ArmCuffs": "FuturisticCuffs",
		"LegCuffs": "FuturisticLegCuffs",
		"AnkleCuffs": "FuturisticAnkleCuffs",
	},
	{
		"ArmCuffs": "SteelCuffsArms",
		"LegCuffs": "SteelCuffsThigh",
		"AnkleCuffs": "SteelCuffsAnkles",
	},
);
KDAddCuffVariants(
	"Template",
	"Warden",
	"",
	"warden",
	{},
	["Warden", "WardenCuffs"],
	[],
	0,
	{
		Color: "#ffffff",
	},
	[
		{trigger: "spellOrb", type: "wardenPunish", dynamic: true, inheritLinked: true},
		{trigger: "afterShrineDrink", type: "wardenPunish", dynamic: true, inheritLinked: true},
		{trigger: "afterShrineBottle", type: "wardenPunish", dynamic: true, inheritLinked: true},
		{trigger: "afterFailGoddessQuest", type: "wardenPunish", dynamic: true},
	],
	{
		Struggle: 0.0,
		Cut: 0.0,
		Remove: 0.0,
		Pick: 0.00,
	},
	{
	},{
		Struggle: -0.1,
		Cut: 0.0,
		Remove: 0.0,
		Pick: 0.00,
	},
	{
	}, {
		BaseMetal: {"gamma":1.2833333333333334,"saturation":1,"contrast":1.45,"brightness":1,"red":2,"green":1.5,"blue":1,"alpha":1},
	}, 6, false,
	{
		"ArmCuffs": "FuturisticCuffs",
		"LegCuffs": "FuturisticLegCuffs",
		"AnkleCuffs": "FuturisticAnkleCuffs",
	},
	{
		"ArmCuffs": "SteelCuffsArms",
		"LegCuffs": "SteelCuffsThigh",
		"AnkleCuffs": "SteelCuffsAnkles",
	},
);

KDAddCuffVariants(
	"Template",
	"Leather",
	"",
	"leather",
	{
		"leatherRestraintsHeavy":4, "dragonRestraints":6, "handcuffer": 10, "leathercuffsSpell": 8
	},
	["LeatherCuffs", "Leather"],
	["Metal"],
	-5,
	{
		Color: "#999999",
		factionFilters: {
			Band: {color: "Highlight", override: true},
		},
	},
	[],
	{
		Struggle: 0.6,
		Cut: 0.3,
		Remove: 0.05,
		Pick: 0.05,
	},
	{
	},{
		Struggle: 0.25,
		Cut: 0.3,
		Remove: 0.05,
		Pick: 0.05,
	},
	{
	}, {

	}, 6, false,
	{
		"ArmCuffs": "LeatherCuffs",
		"LegCuffs": "LeatherLegCuffs",
		"AnkleCuffs": "LeatherAnkleCuffs",
	},
	{
		"ArmCuffs": "CuffsArms",
		"LegCuffs": "CuffsThigh",
		"AnkleCuffs": "CuffsAnkles",
	},
);

KDAddCuffVariants(
	"Template",
	"Asylum",
	"",
	"nurse",
	{
		"nurseCuffRestraints": 5, "leathercuffsSpell": 3
	},
	["Asylum", "LeatherCuffs", "Leather"],
	["Metal"],
	-3,
	{
		Color: "#554033",
		factionFilters: {
			Band: {color: "Highlight", override: true},
		},
	},
	[],
	{
		Struggle: 0.35,
		Cut: 0.2,
		Remove: -0.05,
		Pick: -0.05,
	},
	{
	},
	{
		Struggle: 0.15,
		Cut: 0.15,
		Remove: 0.00,
		Pick: -0.05,
	},
	{
	}, {
		Cuff: {"gamma":1.3,"saturation":1,"contrast":1.2166666666666668,"brightness":0.4666666666666667,"red":1.6666666666666665,"green":1.25,"blue":1,"alpha":1},
	}, 6, false,
	{
		"ArmCuffs": "LeatherCuffs",
		"LegCuffs": "LeatherLegCuffs",
		"AnkleCuffs": "LeatherAnkleCuffs",
	},
	{
		"ArmCuffs": "CuffsArms",
		"LegCuffs": "CuffsThigh",
		"AnkleCuffs": "CuffsAnkles",
	},
);

KDAddCuffVariants(
	"Template",
	"Scale",
	"",
	"scale",
	{
		"dragonRestraints":4
	},
	["ScaleCuffs", "Scale", "LeatherCuffs", "Leather"],
	["Metal"],
	-2,
	{
		Color: ["#92e8c0", "#171222", "#ff5555"],
		factionFilters: {
			Band: {color: "Highlight", override: true},
		},
	},
	[],
	{
		Struggle: 0.3,
		Cut: 0.15,
		Remove: 0.00,
		Pick: 0.00,
	},
	{
	},
	{
		Struggle: 0.12,
		Cut: 0.2,
		Remove: 0.00,
		Pick: 0.00,
	},
	{
	}, {
		Cuff: {"gamma":1,"saturation":1,"contrast":1.6166666666666665,"brightness":1,"red":1.7999999999999998,"green":0.8666666666666667,"blue":0.8666666666666667,"alpha":1},
		Band: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
	}, 6, false,
	{
		"ArmCuffs": "LeatherCuffs",
		"LegCuffs": "LeatherLegCuffs",
		"AnkleCuffs": "LeatherAnkleCuffs",
	},
	{
		"ArmCuffs": "CuffsArms",
		"LegCuffs": "CuffsThigh",
		"AnkleCuffs": "CuffsAnkles",
	},
);



KDAddCuffVariants(
	"Template",
	"Crystal",
	"",
	"crystal",
	{},
	["CrystalCuffs", "Crystal", "Elements", "Leather"],
	["Metal"],
	0,
	{
		Color: ["#a694cb", "#ff5277"],
		DefaultLock: "Crystal",
	},
	[
		{trigger: "tick", type: "crystalDrain", power: -0.01, inheritLinked: true},
		{trigger: "struggle", type: "crystalPunish"},
	],
	{
		Struggle: 0.25,
		Cut: 0.05,
		Remove: 0.05,
		Pick: 0.05,
	},
	{
	},
	{
		Struggle: 0,
		Cut: 0.05,
		Remove: 0.0,
		Pick: 0.0,
	},
	{
	}, {
		//BaseMetal: {"gamma":0.95,"saturation":1,"contrast":1.6166666666666665,"brightness":2.29999999999998,"red":2.0166666666666666,"green":0.9833333333333333,"blue":2.5333333333333337,"alpha":0.6666666666666666},
	}, 6, false,
	{
		"ArmCuffs": "OrnateCuffs",
		"LegCuffs": "OrnateLegCuffs",
		"AnkleCuffs": "OrnateAnkleCuffs",
	},
	{
		"ArmCuffs": "CrystalCuffsArms",
		"LegCuffs": "CrystalCuffsThigh",
		"AnkleCuffs": "CrystalCuffsAnkles",
	},

);



KDAddCuffVariants(
	"Template",
	"Ice",
	"",
	"ice",
	{},
	["Ice"],
	[],
	-4,
	{
		Color: ["#9999ff", "#ff5277"],
		failSuffix: {"Remove": "Ice"},
	},
	[
		{trigger: "tick", type: "iceDrain", power: -0.02, inheritLinked: true},
		{trigger: "afterPlayerDamage", type: "iceMelt", mult: 1.5, subMult: 0.5, count: 13, inheritLinked: true},
	],
	{
		Struggle: 0.3,
		Cut: 0.12,
		Remove: -1,
	},
	{
	},
	{
		Struggle: 0.2,
		Cut: 0.12,
		Remove: 0.0,
	},
	{
	}, {"BaseMetal":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},"Rim":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.65,"red":1,"green":1,"blue":1,"alpha":1}}, 6, false,
	{
		"ArmCuffs": "OrnateCuffs",
		"LegCuffs": "OrnateLegCuffs",
		"AnkleCuffs": "OrnateAnkleCuffs",
	},
	{
		"ArmCuffs": "CrystalCuffsArms",
		"LegCuffs": "CrystalCuffsThigh",
		"AnkleCuffs": "CrystalCuffsAnkles",
	},
	true, false
);

KDAddCuffVariants(
	"Template",
	"Obsidian",
	"",
	"obsidian",
	{},
	["Obsidian"],
	[],
	-1,
	{
		Color: "#ffffff",
	},
	[],
	{
		Struggle: 0.1,
		Cut: -0.05,
		Remove: 0.05,
		Pick: 0.05,
	},
	{
	},
	{
		Struggle: -0.05,
		Cut: -0.05,
		Remove: 0.0,
		Pick: 0.0,
	},
	{
	}, {
		BaseMetal: {"gamma":1.2166666666666668,"saturation":0,"contrast":4.5,"brightness":0.3333333333333333,"red":1.0166666666666666,"green":0.9833333333333333,"blue":2.5333333333333337,"alpha":1},
	}, 6, false,
	{
		"ArmCuffs": "OrnateCuffs",
		"LegCuffs": "OrnateLegCuffs",
		"AnkleCuffs": "OrnateAnkleCuffs",
	},
	{
		"ArmCuffs": "CrystalCuffsArms",
		"LegCuffs": "CrystalCuffsThigh",
		"AnkleCuffs": "CrystalCuffsAnkles",
	},
);


KDAddHardSlimeVariants(
	"HardSlime",
	"LiquidMetal",
	"",
	"liquidMetalRestraints",
	["liquidMetal", "Metal"],
	["Latex", "Rubber", "SlimeHard"],
	6,
	{
		Color: ["#aaaaaa", "#aaaaaa", "#aaaaaa"],
		Filters: {
			Rubber:  {"gamma":0.8666666666666667,"saturation":0,"contrast":0.8,"brightness":1,"red":1.5098039215686274,"green":1.5098039215686274,"blue":1.5098039215686274,"alpha":1},
		},
		factionColor: [],
		factionFilters: {
			Rubber: {color: "Catsuit", override: true},
		},
	},
	[
		{trigger: "tick", type: "ApplyConduction", duration: 2},
		{type: "Buff", trigger: "tick", power: -0.1, buffType: "electricDamageResist"},
	],
	{
		Struggle: -0.1,
		Cut: -0.2,
		Remove: -1,
	},
	{
	},
);

KDAddHardSlimeVariants(
	"Slime",
	"ProtoSlime",
	"",
	"moldRestraints",
	["ProtoSlime"],
	[],
	-2,
	{
		Color: ["#404973", "#404973", "#404973"],
		Filters: {
			Slime: {"gamma":1.2833333333333332,"saturation":0.016666666666666666,"contrast":2.96,"brightness":0.5,"red":0.97058823529411764,"green":0.97058823529411764,"blue":0.97058823529411764,"alpha":1},
		},
		factionColor: [],
		factionFilters: {
			Slime: {color: "DarkNeutral", override: false},
		},
	},
	[
	],
	{
		Struggle: .1,
		Cut: 0,
		Remove: 0.1,
	},
	{
	}, undefined, undefined, "Proto"
);
KDAddHardSlimeVariants(
	"HardSlime",
	"HardProtoSlime",
	"",
	"hardMoldRestraints",
	["ProtoSlime"],
	[],
	-1,
	{
		Color: ["#404973", "#404973", "#404973"],
		Filters: {
			Rubber: {"gamma":1.2833333333333332,"saturation":0.016666666666666666,"contrast":2.96,"brightness":0.5,"red":0.97058823529411764,"green":0.97058823529411764,"blue":0.97058823529411764,"alpha":1},
		},
		factionColor: [],
		factionFilters: {
			Rubber: {color: "DarkNeutral", override: false},
		},
	},
	[
	],
	{
		Struggle: .1,
		Cut: 0,
		Remove: 0.1,
	},
	{
	}
);


KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "Breastplate",
	Group: "ItemBreast",
	Asset: "PolishedChastityBra",
	OverridePriority: 27,
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	debris: "Belts",
	Model: "Breastplate",
	escapeChance: {
		"Struggle": 10,
		"Cut": -0.5,
		"Remove": 10
	},
	shrine: ["Armor", "ChestArmor", "MetalArmor", "Heavy"],
	addPose: ["ChestArmor"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	protection: 1,
	displayPower: 4,
	noRecover: true,
	inventory: true,
	removePrison: true,
	events: [
		{trigger: "tick", type: "ApplyConduction", duration: 2},
		{trigger: "tick", type: "RestraintBlock", power: 2.5, inheritLinked: true},
		{trigger: "tick", type: "sneakBuff", power: -0.15, inheritLinked: true},
	],
}, "Breastplate", "Rock-solid and form-fitting.", "Provides minor protection against enemy attacks. Decreases stealth.")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "Bustier",
	Group: "ItemTorso",
	Asset: "LeatherCorsetTop1",
	AssetGroup: "Corset",
	Model: "WarriorBustier",
	debris: "Belts",
	OverridePriority: 27,
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": 0.1,
		"Cut": 0.1,
		"Remove": 0.4,
	},
	shrine: ["Armor", "TorsoArmor", "Light"],
	addPose: ["TorsoArmor"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	protection: 1,
	displayPower: 3,
	strictness: 0.05,
	restriction: 1,
	protectionCursed: true,
	inventory: true,
	noRecover: true,
	removePrison: true,
	events: [
		{trigger: "tick", type: "RestraintBlock", power: 1, inheritLinked: true},
	],
}, "Adventuring Corset", "Protects your organs and your sense of style.", "Provides minor protection against enemy attacks at the cost of flexibility.")
, [...KDHexVariantList.Base]);


KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "Swimsuit",
	Group: "ItemTorso",
	Model: "Swimsuit",
	remove: ["Cloth", "ClothLower", "Tops", "Skirts", "Shirts", "Pants"],
	debris: "Belts",
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	inventory: true,
	escapeChance: {
		"Struggle": 0.2,
		"Cut": 0.2,
		"Remove": 0.5,
		"Pick": 0.15,
	},
	shrine: ["Armor", "TorsoArmor", "Cloth"],
	addPose: ["TorsoArmor"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategories: ["Armor", "Swimsuit"], linkSizes: [0.3, 0.6],
	protection: 1,
	displayPower: 2,
	protectionCursed: true,
	events: [
		{type: "Buff", trigger: "tick", power: 0.2, buffType: "glueDamageResist", inheritLinked: true},
		{type: "Buff", trigger: "tick", power: 0.2, buffType: "soapDamageResist", inheritLinked: true},
		{type: "Buff", trigger: "tick", power: 1.0, buffType: "DrySpeed", inheritLinked: true},
		{trigger: "tick", type: "evasionBuff", power: 0.1, inheritLinked: true},
	],
}, "Swimsuit", "The best uniform. Has a (lockable) zipper in the back for convenience!", "Removes excess clothing and adds +10 Evasion. +20 Soap and Glue resist, and being drenched dries faster.")
, [...KDHexVariantList.Base]);


KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "RobeOfChastity",
	Group: "ItemTorso",
	Model: "TheRobeOfChastityRestraint",
	remove: ["Cloth", "ClothLower", "Tops", "Skirts", "Shirts", "Pants", "Corsets"],
	debris: "Belts",
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	inventory: true,
	escapeChance: {
		"Struggle": -50,
		"Cut": -50,
		"Remove": 0.25,
		"Pick": -0.3,
	},
	factionFilters: {
		Fabric: {color: "DarkNeutral", override: true},
		Cape: {color: "DarkNeutral", override: true},
		Gold: {color: "Highlight", override: true},
		Pauldrons: {color: "Highlight", override: true},
		GoldBase: {color: "Highlight", override: false},
		Plate: {color: "LightNeutral", override: false},
		ChestPlate: {color: "LightNeutral", override: false},
		Frill: {color: "LightNeutral", override: true},
	},
	DefaultLock: "Divine",
	shrine: ["Armor", "TorsoArmor", "Cloth"],
	addPose: ["TorsoArmor"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategories: ["Armor", "Swimsuit"], linkSizes: [0.3, 0.6],
	protection: 3,
	displayPower: 30,
	protectionCursed: true,
	events: [
		{type: "RobeOfChastity", trigger: "orgasm", count: 3, time: 50, inheritLinked: true},
		{type: "RobeOfChastity", trigger: "playerCast", count: 3, mult: 0.08, inheritLinked: true},
		{type: "RobeOfChastity", trigger: "tickAfter", power: 0.2, mult: 0.03, damage: "holy", dist: 3.5, inheritLinked: true},
		{type: "Buff", trigger: "tick", power: 0.5, buffType: "StatGainDistraction", inheritLinked: true},

	],
}, "Robe of Chastity",
"A magical leotard whose power stems directly from the divine. Made from a weave that channel's the wearer's deeper energies into powerful energies as long as no clothes are worn over it.",
"It is said that whomever follows the chaste principles of the Paladins shall receive -1% Desire decay/ 40 turns and 2 (+3% missing DP) Holy damage/turn aura. Affects only enemies who enter melee range. In addition, the magically conductive fabric is quite stimulating, resulting in 50% increased distraction gain from all sources, and 8% of mana spent converted into Desire.")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "ChainTunic",
	Group: "ItemTorso",
	Asset: "Bodice1",
	Model: "ChainShirt",
	AssetGroup: "Cloth",
	Color: ["#808080", "#808080", "#808080"],
	OverridePriority: 27,
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	debris: "Chains",
	escapeChance: {
		"Struggle": -0.1,
		"Cut": -0.35,
		"Remove": 0.35,
	},
	protection: 2,
	displayPower: 7,
	protectionCursed: true,
	inventory: true,
	strictness: 0.08,
	shrine: ["Armor", "TorsoArmor", "MetalArmor", "Heavy"],
	addPose: ["TorsoArmor"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	noRecover: true,
	removePrison: true,
	events: [
		{trigger: "tick", type: "ApplyConduction", duration: 2},
		{trigger: "tick", type: "armorBuff", power: 1.0, inheritLinked: true},
		{trigger: "tick", type: "RestraintBlock", power: 5, inheritLinked: true},
		{trigger: "tick", type: "evasionBuff", power: -0.5, inheritLinked: true},
		{trigger: "tick", type: "sneakBuff", power: -0.5, inheritLinked: true},
	],
}, "Chainmail Tank Top", "Cumbersome, but effective!", "Provides +10 armor and protection against enemy attacks. Decreases stealth/evasion and makes struggling harder.")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "ChainBikini",
	Group: "ItemTorso",
	Asset: "Bodice1",
	Model: "ChainBikini",
	AssetGroup: "Cloth",
	Color: ["#808080", "#808080", "#808080"],
	OverridePriority: 27,
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	debris: "Chains",
	displayPower: 5,
	escapeChance: {
		"Struggle": 0.5,
		"Cut": -0.35,
		"Remove": 1,
	},
	protection: 1,
	protectionCursed: true,
	inventory: true,
	strictness: 0.08,
	shrine: ["Armor", "TorsoArmor", "MetalArmor", "Light"],
	addPose: ["TorsoArmor"],
	armor: true,
	noRecover: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	removePrison: true,
	events: [
		{trigger: "tick", type: "ApplyConduction", duration: 2},
		{trigger: "tick", type: "RestraintBlock", power: 2.0, inheritLinked: true},
	],
}, "Chainmail Bikini", "Covers the important bits, anyway.", "+20 Bondage Resist. Conducts electricity.")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "SteelArmor",
	Group: "ItemTorso",
	Asset: "MistressTop",
	Model: "ChainShirt",
	AssetGroup: "Cloth",
	restriction: 2,
	Color: ["Default"],
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": -0.5,
		"Cut": -0.5,
		"Remove": 0.15,
	},
	shrine: ["Armor", "TorsoArmor", "MetalArmor", "Heavy"],
	addPose: ["TorsoArmor"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	debris: "Belts",
	protection: 3,
	protectionCursed: true,
	inventory: true,
	strictness: 0.15,
	displayPower: 10,
	removePrison: true,
	events: [
		{trigger: "tick", type: "ApplyConduction", duration: 2},
		{trigger: "tick", type: "armorBuff", power: 0.5, inheritLinked: true},
		{trigger: "tick", type: "RestraintBlock", power: 8, inheritLinked: true},
	],
}, "Light Plate Armor", "Knight in shining rest-err, armor!", "Provides +5 armor and high protection. No impact to stealth or evasion")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "MageArmor",
	Group: "ItemTorso",
	Model: "RobeSleeves",
	Asset: "GrandMage",
	AssetGroup: "Cloth",
	Color: ["#5555ff"],
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": 0,
		"Cut": -0.5,
		"Remove": 0.25,
	},
	shrine: ["Armor", "Robe", "Mage"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	debris: "Belts",
	protection: 1,
	displayPower: 10,
	removePrison: true,
	inventory: true,
	events: [
		{trigger: "perksBonus", type: "spellDamage", power: 0.3, inheritLinked: true},
		{trigger: "tick", type: "spellWardBuff", power: 1, inheritLinked: true},
	],
}, "Wizard's Robe", "I have the power!", "+30% spell damage and +10 spell ward")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "SteelSkirt2",
	Group: "ItemLegs",
	Asset: "LatexSkirt2",
	Model: "ChainSkirt2",
	AssetGroup: "ClothLower",
	Color: ["#ffffff"],
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": -0.5,
		"Cut": -0.5,
		"Remove": 0.35,
	},
	shrine: ["Armor", "PelvisArmor", "MetalArmor", "Heavy"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	protection: 1,
	debris: "Belts",
	protectionCursed: true,
	inventory: true,
	displayPower: 5,
	removePrison: true,
	events: [
		{trigger: "tick", type: "ApplyConduction", duration: 2},
		{trigger: "tick", type: "RestraintBlock", power: 3.5, inheritLinked: true},
	],
}, "Chain Skirt", "A defensive garment providing optimal coverage to the lower torso.", "Provides medium protection. No impact to stealth or evasion")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "SteelSkirt",
	Group: "ItemLegs",
	Asset: "LatexSkirt2",
	Model: "ChainSkirt",
	AssetGroup: "ClothLower",
	Color: ["#ffffff"],
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": -0.5,
		"Cut": -0.5,
		"Remove": 0.35,
	},
	shrine: ["Armor", "PelvisArmor", "MetalArmor", "Heavy"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	protection: 2,
	debris: "Belts",
	protectionCursed: true,
	inventory: true,
	displayPower: 8,
	removePrison: true,
	events: [
		{trigger: "tick", type: "ApplyConduction", duration: 2},
		{trigger: "tick", type: "armorBuff", power: 0.5, inheritLinked: true},
		{trigger: "tick", type: "RestraintBlock", power: 5, inheritLinked: true},
	],
}, "Armored Skirt", "Knight in shining rest-err, armor!", "Provides +5 armor and high protection. No impact to stealth or evasion")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "Gauntlets",
	Group: "ItemHands",
	Asset: "FingerlessGloves",
	AssetGroup: "Gloves",
	Model: "Gauntlets",
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": 10,
		"Cut": -0.5,
		"Remove": 10
	},
	shrine: ["Armor", "GlovesArmor", "MetalArmor", "Heavy"],
	addPose: ["GlovesArmor"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	debris: "Belts",
	protection: 1,
	displayPower: 5,
	noRecover: true,
	inventory: true,
	removePrison: true,
	events: [
		{trigger: "tick", type: "ApplyConduction", duration: 2},
		{trigger: "tick", type: "armorBuff", power: 0.5, inheritLinked: true},
		{trigger: "tick", type: "RestraintBlock", power: 2.5, inheritLinked: true},
		{trigger: "playerAttack", type: "armorNoise", chance: 1, dist: 8, sfx: "Chain", msg: "KinkyDungeonPunishPlayerArmor", inheritLinked: true},
		{trigger: "playerCast", type: "armorNoise", chance: 1, dist: 11, punishComponent: "Arms", sfx: "Chain", msg: "KinkyDungeonPunishPlayerArmor", inheritLinked: true},
	],
}, "Gauntlets", "Gloves with an iron grip.", "Provides +5 armor and minor protection against enemy attacks. Makes noise when attacking.")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "LeatherGloves",
	Group: "ItemHands",
	Model: "LeatherGloves",
	Asset: "BikerGloves",
	AssetGroup: "Gloves",
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": 10,
		"Cut": 0.1,
		"Remove": 10
	},
	shrine: ["Armor", "GlovesArmor", "Light"],
	addPose: ["GlovesArmor"],
	armor: true,
	displayPower: 2,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	debris: "Belts",
	protection: 1,
	inventory: true,
	removePrison: true,
	events: [
		{trigger: "tick", type: "RestraintBlock", power: 1, inheritLinked: true},
	],
	noRecover: true,
}, "Leather Gloves", "Protecting you in style.", "Provides minor protection against enemy attacks.")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "Bracers",
	Group: "ItemArms",
	Asset: "FurBolero",
	Model: "Pauldrons",
	AssetGroup: "ClothAccessory",
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": 10,
		"Cut": -0.5,
		"Remove": 10
	},
	shrine: ["Armor", "ArmArmor", "Heavy"],
	armor: true,
	displayPower: 3,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	debris: "Belts",
	inventory: true,
	protection: 1,
	removePrison: true,
	events: [
		{trigger: "tick", type: "RestraintBlock", power: 1, inheritLinked: true},
	],
	noRecover: true,
}, "Steel Pauldrons", "Dependable protection for the average adventurer.", "Provides minor protection against enemy attacks.")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "Cape",
	Group: "ItemArms",
	Model: "Cape",
	Filters: {
		Front: {"gamma":1,"saturation":1,"contrast":1.1833333333333333,"brightness":0.48333333333333334,"red":0.95,"green":1.5333333333333332,"blue":1,"alpha":1},
		Back: {"gamma":1,"saturation":1,"contrast":1.1833333333333333,"brightness":0.21666666666666667,"red":0.95,"green":1.5333333333333332,"blue":1,"alpha":1},
	},
	Asset: "Cape",
	AssetGroup: "ClothAccessory",
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": 10,
		"Cut": -0.5,
		"Remove": 10
	},
	shrine: ["Armor", "ArmArmor", "Light"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	debris: "Belts",
	protection: 1,
	displayPower: 6,
	removePrison: true,
	inventory: true,
	events: [
		{trigger: "tick", type: "evasionBuff", power: .25, inheritLinked: true},
		{trigger: "tick", type: "sneakBuff", power: .15, inheritLinked: true},
	],
}, "Ranger's Cape", "Inbued with the powers of moss and ferns and stuff.", "+25 Evasion. Increases stealth slightly.")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "MagicArmbands",
	Group: "ItemArms",
	Asset: "OrnateCuffs",
	Model: "DragonArmband",
	Color: ["#888888", "#9B63C5"],
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": 10,
		"Cut": -0.5,
		"Remove": 10
	},
	shrine: ["Armor", "ArmArmor", "MagicArmor", "Mage"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	debris: "Chains",
	protection: 1,
	displayPower: 5,
	removePrison: true,
	inventory: true,
	events: [
		{trigger: "perksBonus", type: "spellDamage", power: 0.05, inheritLinked: true},
		{trigger: "tick", type: "spellWardBuff", power: 0.5, inheritLinked: true},
	],
}, "Oracle's Armbands", "Armbands made of a slightly magical material.", "+5% spell damage. +5 Magic Armor.")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "SteelBoots",
	Group: "ItemBoots",
	Asset: "Boots1",
	Model: "PlateBoots",
	AssetGroup: "Shoes",
	Color: ["#444444", "#222222"],
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": 10,
		"Cut": -0.5,
		"Remove": 10
	},
	shrine: ["Armor", "BootsArmor", "MetalArmor", "Heavy"],
	addPose: ["BootsArmor"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	protection: 1,
	displayPower: 4,
	debris: "Belts",
	noRecover: true,
	removePrison: true,
	inventory: true,
	events: [
		{trigger: "tick", type: "ApplyConduction", duration: 2},
		{trigger: "tick", type: "armorBuff", power: 0.5, inheritLinked: true},
		{trigger: "tick", type: "RestraintBlock", power: 2.5, inheritLinked: true},
		{trigger: "tick", type: "sneakBuff", power: -0.35, inheritLinked: true},
	],
}, "Armored Boots", "Noisy, but fashionable!", "Provides +5 armor and protection against enemy attacks. Decreases stealth.")
, [...KDHexVariantList.Base]);

KinkyDungeonAddCursedVariants(KinkyDungeonCreateRestraint({
	name: "LeatherBoots",
	Group: "ItemBoots",
	Asset: "WoollyBootsTall",
	AssetGroup: "Shoes",
	Color: ["#808080"],
	Model: "WarriorBoots",
	showInQuickInv: true, good: true,
	alwaysKeep: true,
	alwaysRender: true,
	UnderlinkedAlwaysRender: true,
	escapeChance: {
		"Struggle": 10,
		"Cut": 0.1,
		"Remove": 10
	},
	shrine: ["Armor", "BootsArmor", "Light"],
	addPose: ["BootsArmor"],
	armor: true,
	LinkAll: true, AlwaysLinkable: true, linkCategory: "Armor", linkSize: 0.6,
	debris: "Belts",
	displayPower: 2,
	protection: 1,
	removePrison: true,
	inventory: true,
	events: [
		{trigger: "tick", type: "RestraintBlock", power: 1.0, inheritLinked: true},
	],
	noRecover: true,
}, "Hide Boots", "For stepping into all kinds of trouble!", "Provides minor protection against enemy attacks.")
, [...KDHexVariantList.Base]);

(() => {
	let afterload = KDModsAfterLoad;
	KDModsAfterLoad = () => {
		// This is where you would add restraint variants in a mod
		afterload();
	};
})();


let KDControlHarnessCategories = {
	"Cuffs": {
		activateCount: 3,
		activateTags: ["CyberWristCuffs", "CyberAnkleCuffs", "CyberLegCuffs"],
		activateFunction: (_e: KinkyDungeonEvent, item: item, _data: any, _invItems: item[]) => {
			//if (!KinkyDungeonFlags.get("ControlHarnessCuffs")) {

			// If there are any cuffs to upgrade
			let upgradedTags = ["ControlHArm", "ControlHAnkle", "ControlHLeg"];
			let addedGroup = {};
			if (upgradedTags.some((tag) => {return KinkyDungeonPlayerTags.get(tag) != true;})) {
				let succ = false;
				for (let rName of ["CyberHeels", "CyberMittens"]) {
					if (KinkyDungeonPlayerTags.get("Item_"+rName)) continue;
					let newRestraint = KinkyDungeonGetRestraintByName(rName);
					if (addedGroup[newRestraint.Group]) continue;
					addedGroup[newRestraint.Group] = true;
					//KinkyDungeonLinkItem(newRestraint, item, item.tightness, "");
					if (
						KinkyDungeonAddRestraintIfWeaker(newRestraint, item.tightness, true, "", false, undefined, undefined, item.faction, true)) {
						if (KDSoundEnabled()) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/RobotEngage.ogg");
						succ = true;
					}

				}
				if (succ) {
					KinkyDungeonSendTextMessage(4,
						TextGet("KDControlHarnessCuffsActivate"),
						"#ffffff",
						1,
					);
				}

			}
			//KinkyDungeonSetFlag("ControlHarnessCuffs", 1);
			//}
		},
		updateFunction: (_e: KinkyDungeonEvent, _item: item, data: any, invItems: item[]) => {
			let upgradedTags = ["ControlHArm", "ControlHAnkle", "ControlHLeg"];
			if (upgradedTags.some((tag) => {return KinkyDungeonPlayerTags.get(tag) != true;})) {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDControlHarnessCuffsUpdate")
						.replace("RESTRAINTNAME", TextGet("Restraint" + data.item.name))
						.replace("PERCENT", "" + Math.round(100 * invItems.length / 3)),
					"#ffffff",
					1,
				);
			}
		},
	},
	"RemoteLink": {
		activateCount: 0,
		activateTags: [],
		activateFunction: (_e: KinkyDungeonEvent, item: item, _data: any, _invItems: item[]) => {
			//if (!KinkyDungeonFlags.get("ControlHarnessCuffs")) {

			// If there are any cuffs to upgrade
			let upgradedTags = ["ControlHArm", "ControlHAnkle", "ControlHLeg"];
			let addedGroup = {};
			if (upgradedTags.some((tag) => {return KinkyDungeonPlayerTags.get(tag) != true;})) {
				let succ = false;
				for (let rName of ["CyberWristLink", "CyberElbowLink", "CyberThighLink", "CyberAnkleLink", "CyberAnkleLinkShort"]) {
					if (KinkyDungeonPlayerTags.get("Item_"+rName)) continue;
					let newRestraint = KinkyDungeonGetRestraintByName(rName);
					if (addedGroup[newRestraint.Group]) continue;
					addedGroup[newRestraint.Group] = true;
					//KinkyDungeonLinkItem(newRestraint, item, item.tightness, "");
					if (
						KinkyDungeonAddRestraintIfWeaker(newRestraint, item.tightness, true, "", false, undefined, undefined, item.faction, true)) {
						if (KDSoundEnabled()) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/RobotEngage.ogg");
						succ = true;
					}

				}
				if (succ) {
					KinkyDungeonSendTextMessage(4,
						TextGet("KDControlHarnessCuffsLink"),
						"#ffffff",
						1,
					);
				}

			}
			//KinkyDungeonSetFlag("ControlHarnessCuffs", 1);
			//}
		},
		updateFunction: (_e: KinkyDungeonEvent, _item: item, _data: any, _invItems: item[]) => {

		},
	},
	"Chastity": {
		activateCount: 2,
		activateTags: ["CyberChastityL", "CyberChastityU"],
		activateFunction: (_e: KinkyDungeonEvent, item: item, _data: any, _invItems: item[]) => {
			if (!KinkyDungeonStatsChoice.get("arousalMode")) return;
			//if (!KinkyDungeonFlags.get("ControlHarnessCuffs")) {

			// If there are any cuffs to upgrade
			let fillGroups = ["ItemVulva", "ItemVulvaPiercings", "ItemButt", "ItemNipples"];
			if (fillGroups.some((group) => {return !KinkyDungeonGetRestraintItem(group);})) {
				let Mode = CommonRandomItemFromList("", ["Edge", "Deny", "Fullpower"]);
				if (KinkyDungeonGetRestraintItem("ItemVulva")) Mode = "Extra";
				KinkyDungeonSendTextMessage(4,
					TextGet("KDControlHarnessChastityActivate")
						.replace("CHASTITYMODE", TextGet("KDControlHarnessChastityMode_" + Mode)),
					"#ffffff",
					1,
				);
				let addList = ["RearVibe1", "TrapVibeProto", "NippleClamps"];
				if (Mode == "Edge") addList.push("TrapPlug2");
				else if (Mode == "Deny") addList.push("TrapPlug3");
				else if (Mode == "Fullpower") addList.push("TrapPlug5");
				for (let rName of addList) {
					let newRestraint = KinkyDungeonGetRestraintByName(rName);
					if (KinkyDungeonGetRestraintItem(KDRestraint(newRestraint).Group)) continue;
					if (
						KinkyDungeonAddRestraintIfWeaker(newRestraint, item.tightness, true, "", false, undefined, undefined, item.faction, true)) {
						if (KDSoundEnabled()) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/RobotEngage.ogg");
					}
				}

			}
			//KinkyDungeonSetFlag("ControlHarnessCuffs", 1);
			//}
		},
		updateFunction: (_e: KinkyDungeonEvent, _item: item, data: any, invItems: item[]) => {
			if (!KinkyDungeonStatsChoice.get("arousalMode")) return;

			let fillGroups = ["ItemVulva", "ItemVulvaPiercings", "ItemButt", "ItemNipples"];
			if (fillGroups.some((group) => {return !KinkyDungeonGetRestraintItem(group);})) {
				KinkyDungeonSendTextMessage(4,
					TextGet("KDControlHarnessChastityUpdate")
						.replace("RESTRAINTNAME", TextGet("Restraint" + data.item.name))
						.replace("PERCENT", "" + Math.round(100 * invItems.length / 2)),
					"#ffffff",
					1,
				);
			}
		},
	},
};

/**
 */
let KDSFXGroups: Record<string, KDSFXGroup> = {
	"Handcuffs": {
		sfx: "LockHeavy",
		sfxEscape: {
			Struggle: "LockLight",
			Cut: "ClangLight",
			Remove: "LockLight",
			Pick: "Pick",
			Unlock: "Unlock",
			NoWill: "LockLight",
			NoStamina: "LockLight",
			NoMagic: "Shield",
		},
		sfxFinishEscape: {
			Struggle: "Clang",
			Cut: "Clang",
			Remove: "Unlock",
			Pick: "Unlock",
			Unlock: "Unlock",
			Destroy: "ClangHeavy",
		},
		sfxRemove: "Unlock",
	},
};

