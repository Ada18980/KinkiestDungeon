"use strict";


// For cacheing
let KinkyDungeonOutfitCache = new Map();

/**@type {string[]} Contains protected zones*/
let KDProtectedCosplay = [];

function KDOutfit(item) {
	return KinkyDungeonOutfitCache.get(item.name);
}

function KinkyDungeonRefreshOutfitCache() {
	KinkyDungeonOutfitCache = new Map();
	for (let r of KinkyDungeonOutfitsBase) {
		KinkyDungeonOutfitCache.set(r.name, r);
	}
}

/**
 * These priorities override the default BC
 * @type {Record<string, Record<string, number>>}
 */
let KDClothOverrides = {
	"Cloth": {
		"SleevelessTop": 24.9,
	},
};

// Default dress (witch hat and skirt and corset)
/** @type {KinkyDungeonDress} */
let KinkyDungeonDefaultDefaultDress = [
	{Item: "WitchHat1", Group: "Hat", Color: "Default", Lost: false},
	{Item: "LeatherCorsetTop1", Group: "Cloth", Color: "Default", Lost: false},
	{Item: "LatexSkirt1", Group: "ClothLower", Color: "Default", OverridePriority: 17, Lost: false, Skirt: true},
	{Item: "Socks4", Group: "Socks", Color: "#444444", Lost: false},
	{Item: "Heels3", Group: "Shoes", Color: "#222222", Lost: false},
	{Item: "KittyPanties1", Group: "Panties", Color: "#222222", Lost: false},
	{Item: "FullLatexBra", Group: "Bra", Color: "Default", Lost: false},
	{Item: "LatexElbowGloves", Group: "Gloves", Color: "Default", Lost: false},
	{Item: "Necklace4", Group: "Necklace", Color: "#222222", Lost: false},
];

// This is a flag that checks if the script should check for clothes loss
let KinkyDungeonCheckClothesLoss = false;

function KDGetDressList() {
	if (StandalonePatched) return KDModelDresses;
	return KinkyDungeonDresses;
}

// Return all dresses so theres no longer any Lost items
function KinkyDungeonInitializeDresses() {
	KinkyDungeonCheckClothesLoss = true;
	KinkyDungeonUndress = 0;
	if (Object.values(KDGetDressList()).length > 0) {
		for (let d of Object.values(KDGetDressList())) {
			for (let dd of d) {
				if (dd.Lost) dd.Lost = false;
			}
		}
	}

}

let KinkyDungeonNewDress = false;

// Sets the player's dress to whatever she is wearing
function KinkyDungeonDressSet() {
	if (KinkyDungeonNewDress) {
		KDGetDressList().Default = [];
		let C = KinkyDungeonPlayer;

		for (let A = 0; A < C.Appearance.length; A++) {
			let save = false;
			if (StandalonePatched) {
				if (C.Appearance[A].Model?.Protected) save = true;
				if (!C.Appearance[A].Model?.Restraint) save = true;
				if (save) {
					KDGetDressList().Default.push({
						Item: C.Appearance[A].Model?.Name || C.Appearance[A].Asset?.Name,
						Group: C.Appearance[A].Model?.Group,
						Filters: C.Appearance[A].Model?.Filters,
						Property: C.Appearance[A].Property,
						Color: (C.Appearance[A].Color) ? C.Appearance[A].Color : (C.Appearance[A].Model.DefaultColor ? C.Appearance[A].Model.DefaultColor : "Default"),
						Lost: false,
					},);
				}
			} else {
				if (C.Appearance[A].Asset.Group.BodyCosplay || C.Appearance[A].Asset.BodyCosplay) save = true;
				else if (C.Appearance[A].Asset.Group.Underwear) save = true;
				else if (C.Appearance[A].Asset.Group.Clothing) save = true;
				if (save) {
					KDGetDressList().Default.push({
						Item: C.Appearance[A].Asset.Name,
						Group: C.Appearance[A].Asset.Group.Name,
						Property: C.Appearance[A].Property,
						Color: (C.Appearance[A].Color) ? C.Appearance[A].Color : (C.Appearance[A].Asset.DefaultColor ? C.Appearance[A].Asset.DefaultColor : "Default"),
						Lost: false,
					},);
				}
			}
		}
	}
	KinkyDungeonNewDress = false;
}

function KinkyDungeonSetDress(Dress, Outfit, Character, NoRestraints) {
	if (Outfit) KDGameData.Outfit = Outfit;
	KinkyDungeonCurrentDress = Dress;
	if (KDGetDressList()) {
		for (let clothes of KDGetDressList()[KinkyDungeonCurrentDress]) {
			clothes.Lost = false;
		}
		KinkyDungeonCheckClothesLoss = true;
		KinkyDungeonDressPlayer(Character, NoRestraints);
		KDRefresh = true;
	}
}

let KDNaked = false;
let KDRefresh = false;
let KDLastForceRefresh = 0;
let KDLastForceRefreshInterval = 300;

/**
 * It sets the player's appearance based on their stats.
 */
function KinkyDungeonDressPlayer(Character, NoRestraints) {
	if (!Character) Character = KinkyDungeonPlayer;

	let _CharacterRefresh = CharacterRefresh;
	let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
	CharacterRefresh = () => {KDRefresh = true;};
	CharacterAppearanceBuildCanvas = () => {};
	let restraints = [];

	if (StandalonePatched) {
		AppearanceCleanup(Character);
	}

	try {
		let data = {
			updateRestraints: false,
			updateDress: false,
			updateExpression: false,
		};

		KinkyDungeonPlayer.OnlineSharedSettings = {BlockBodyCosplay: true};
		if (!KDNaked) KDCharacterNaked();

		// if true, nakeds the player, then reclothes
		if (KinkyDungeonCheckClothesLoss) {
			// We refresh all the restraints
			if (StandalonePatched && CommonTime() > KDLastForceRefresh + KDLastForceRefreshInterval) {
				// Force refresh the model
				ForceRefreshModels(Character);
				KDLastForceRefresh = CommonTime();
			}

			// First we remove all restraints and clothes
			let clothGroups = {};
			for (let cloth of Object.values(KDGetDressList()[KinkyDungeonCurrentDress])) {
				clothGroups[cloth.Group || cloth.Item] = true;
			}
			let newAppearance = {};
			for (let A = 0; A < KinkyDungeonPlayer.Appearance.length; A++) {
				if (StandalonePatched) {
					let model = KinkyDungeonPlayer.Appearance[A].Model;
					if ((!model.Restraint && !model.Group?.startsWith("Item") && !clothGroups[model.Group || model.Name])
						|| model.Protected || model.SuperProtected) {
						//KinkyDungeonPlayer.Appearance.splice(A, 1);
						//A -= 1;
						newAppearance[model.Group || model.Name] = KinkyDungeonPlayer.Appearance[A];
					}
				} else {
					// BC support
					let asset = KinkyDungeonPlayer.Appearance[A].Asset;
					if (!asset.Group.Name.startsWith("Item") && !clothGroups[asset.Group.Name]) {
						//KinkyDungeonPlayer.Appearance.splice(A, 1);
						//A -= 1;
						newAppearance[asset.Group.Name] = KinkyDungeonPlayer.Appearance[A];
					}
				}

			}

			KinkyDungeonPlayer.Appearance = Object.values(newAppearance);

			//KinkyDungeonPlayer.Appearance = [];


			// Next we revisit all the player's restraints
			if (!NoRestraints) {
				for (let inv of KinkyDungeonAllRestraint()) {
					let renderTypes = KDRestraint(inv).shrine;
					KDApplyItem(inv, KinkyDungeonPlayerTags);
					restraints.push(inv);
					if (inv.dynamicLink) {
						let link = inv.dynamicLink;
						for (let I = 0; I < 30; I++) {
							if (KDRestraint(link).alwaysRender || (KDRestraint(link).renderWhenLinked && KDRestraint(link).renderWhenLinked.some((element) => {return renderTypes.includes(element);}))) {
								KDApplyItem(link, KinkyDungeonPlayerTags);
								restraints.push(link);
							}
							if (link.dynamicLink) {
								link = link.dynamicLink;
							} else I = 1000;
						}
					}
				}
			}

			data.updateRestraints = true;
			KDNaked = true;
			KinkyDungeonUndress = 0;
		}

		let alreadyClothed = {};

		for (let A = 0; A < KinkyDungeonPlayer.Appearance.length; A++) {
			let asset = KinkyDungeonPlayer.Appearance[A].Asset;
			if (StandalonePatched) {
				if (KinkyDungeonPlayer.Appearance[A].Model?.Group)
					alreadyClothed[KinkyDungeonPlayer.Appearance[A].Model?.Group] = true;
			} else
				alreadyClothed[asset.Group.Name] = true;
		}

		for (let clothes of KDGetDressList()[KinkyDungeonCurrentDress]) {
			if (alreadyClothed[clothes.Group || clothes.Item]) continue;
			data.updateDress = true;
			if (!clothes.Lost && KinkyDungeonCheckClothesLoss) {
				if (StandalonePatched) {
					if (IsModelLost(Character, clothes.Item))
						clothes.Lost = true;
				}

				if (clothes.Group == "Necklace") {
					if (KinkyDungeonGetRestraintItem("ItemTorso") && KDRestraint(KinkyDungeonGetRestraintItem("ItemTorso")).harness) clothes.Lost = true;
					if (KinkyDungeonGetRestraintItem("ItemArms") && KDGroupBlocked("ItemBreast")) clothes.Lost = true;
				}
				//if (clothes.Group == "Bra" && !clothes.NoLose) {
				//if (KinkyDungeonGetRestraintItem("ItemBreast")) clothes.Lost = true;
				//}
				if (clothes.Group == "Panties" && !clothes.NoLose) {
					if (KinkyDungeonGetRestraintItem("ItemPelvis") && KinkyDungeonGetRestraintItem("ItemPelvis") && KDRestraint(KinkyDungeonGetRestraintItem("ItemPelvis")).chastity) clothes.Lost = true;
				}
				if (clothes.Group == "ClothLower" && clothes.Skirt) {
					if (KinkyDungeonGetRestraintItem("ItemPelvis")) clothes.Lost = true;
					if (KDGroupBlocked("ItemLegs")) clothes.Lost = true;
					if (KDGroupBlocked("ClothLower")) clothes.Lost = true;
				}
				if (clothes.Group == "Shoes") {
					if (KinkyDungeonGetRestraintItem("ItemBoots")) clothes.Lost = true;
				}
				if (!NoRestraints) {
					for (let inv of KinkyDungeonAllRestraint()) {
						if (KDRestraint(inv).remove) {
							for (let remove of KDRestraint(inv).remove) {
								if (remove == clothes.Group) clothes.Lost = true;
							}
						}
					}
				}

				if (clothes.Lost) KinkyDungeonUndress += 1/KDGetDressList()[KinkyDungeonCurrentDress].length;
			}

			if (!clothes.Lost) {
				if (KinkyDungeonCheckClothesLoss) {
					let item = KDInventoryWear(clothes.Item, clothes.Group, undefined, clothes.Color, clothes.Filters);
					alreadyClothed[clothes.Group || clothes.Item] = true;
					if (clothes.OverridePriority) {
						if (item) {
							if (!item.Property) item.Property = {OverridePriority: clothes.OverridePriority};
							else item.Property.OverridePriority = clothes.OverridePriority;
						}
					} else if (KDClothOverrides[clothes.Group || clothes.Item] && KDClothOverrides[clothes.Group || clothes.Item][clothes.Item] != undefined) {
						if (!item.Property) item.Property = {OverridePriority: KDClothOverrides[clothes.Group || clothes.Item][clothes.Item]};
						else item.Property.OverridePriority = KDClothOverrides[clothes.Group || clothes.Item][clothes.Item];
					}
					if (clothes.Property) item.Property = clothes.Property;
					// Ignored because BC uses string[] as a type!
					//KDCharacterAppearanceSetColorForGroup(KinkyDungeonPlayer, clothes.Color, clothes.Group);
				}
			}

			if (clothes.Group == "Panties" && !KinkyDungeonGetRestraintItem("ItemPelvis")) clothes.Lost = false; // A girl's best friend never leaves her
			if (clothes.Group == "Bra" && !KinkyDungeonGetRestraintItem("ItemBreast")) clothes.Lost = false; // A girl's best friend never leaves her
		}

		if (!NoRestraints) {
			for (let inv of KinkyDungeonAllRestraint()) {
				if (KinkyDungeonCheckClothesLoss)
					if (KDRestraint(inv).AssetGroup && (!KDRestraint(inv).armor || KDToggles.DrawArmor)) {
						KDInventoryWear(KDRestraint(inv).Asset, KDRestraint(inv).AssetGroup, undefined, KDRestraint(inv).Color, KDRestraint(inv).Filters);
					}
			}
			if (KinkyDungeonCheckClothesLoss)
				KinkyDungeonWearForcedClothes(restraints);
		}

		// Apply poses from restraints
		if (StandalonePatched && KDCurrentModels.get(Character)) {
			RefreshTempPoses(Character, true);
		}



		KinkyDungeonCheckClothesLoss = false;
		let AllowedArmPoses = StandalonePatched ? KDGetAvailablePosesArms(Character) : [];
		let AllowedLegPoses = StandalonePatched ? KDGetAvailablePosesLegs(Character) : [];

		if (KDGameData.KneelTurns > 0 || KDGameData.SleepTurns > 0) {
			if (StandalonePatched) {
				// Force player into being on the ground
				let newLegPoses = AllowedLegPoses.filter((element) => {return !STANDPOSES.includes(element);});
				if (newLegPoses.length > 0) AllowedLegPoses = newLegPoses;
			} else {
				if (CharacterItemsHavePoseAvailable(Character, "BodyLower", "Kneel") && !CharacterDoItemsSetPose(Character, "Kneel") && !Character.IsKneeling()) {
					CharacterSetActivePose(Character, "Kneel", false);
				}
			}

		} else if (KDGameData.SleepTurns < 1) {
			if (StandalonePatched) {
				// Nothing needed
			} else {
				if (CharacterItemsHavePoseAvailable(Character, "BodyLower", "Kneel") && !CharacterDoItemsSetPose(Character, "Kneel") && Character.IsKneeling()) {
					CharacterSetActivePose(Character, "BaseLower", false);
				} else if (KDToggleXRay && KinkyDungeonPlayerTags.get("BoundFeet")) {
					if (CharacterItemsHavePoseAvailable(Character, "BodyLower", "LegsClosed") && !CharacterDoItemsSetPose(Character, "LegsClosed") && !Character.IsKneeling()) {
						CharacterSetActivePose(Character, "LegsClosed", false);
					}
				} else if (CharacterItemsHavePoseAvailable(Character, "BodyLower", "BaseLower") && !CharacterDoItemsSetPose(Character, "BaseLower") && !Character.IsKneeling()) {
					CharacterSetActivePose(Character, "BaseLower", false);
				}
				if (KDToggleXRay && (KinkyDungeonPlayerTags.get("BoundArms") || KinkyDungeonPlayerTags.get("BoundHands"))) {
					if (CharacterItemsHavePoseAvailable(Character, "BodyUpper", "BackElbowTouch") && !CharacterDoItemsSetPose(Character, "BackElbowTouch")) {
						CharacterSetActivePose(Character, "BackElbowTouch", false);
					}
				} else {
					if (CharacterItemsHavePoseAvailable(Character, "BodyUpper", "BaseUpper") && !CharacterDoItemsSetPose(Character, "BaseUpper")) {
						CharacterSetActivePose(Character, "BaseUpper", false);
					}
				}
			}

		}

		if (StandalonePatched) {
			// Pose set routine
			let ArmPose = KDGetPoseOfType(Character, "Arms");
			let LegPose = KDGetPoseOfType(Character, "Legs");
			let EyesPose = KDGetPoseOfType(Character, "Eyes");
			let Eyes2Pose = KDGetPoseOfType(Character, "Eyes2");
			let BrowsPose = KDGetPoseOfType(Character, "Brows");
			let Brows2Pose = KDGetPoseOfType(Character, "Brows2");
			let BlushPose = KDGetPoseOfType(Character, "Blush");
			let MouthPose = KDGetPoseOfType(Character, "Mouth");

			let DefaultBound = "Front"; // Default bondage for arms
			let DefaultHobbled = "Closed"; // Default bondage for legs

			// Hold to player's preferred pose
			let PreferredArm = KDDesiredPlayerPose.Arms || "Free";
			let PreferredLeg = KDDesiredPlayerPose.Legs || "Spread";
			if (!AllowedArmPoses.includes(ArmPose)) {
				ArmPose = (AllowedArmPoses.includes(DefaultBound) && KinkyDungeonIsArmsBound(false, false)) ? DefaultBound : AllowedArmPoses[0];
			}
			if (!AllowedLegPoses.includes(LegPose)) {
				LegPose = (AllowedLegPoses.includes(DefaultHobbled) && KinkyDungeonSlowLevel >= 3) ? DefaultHobbled : AllowedLegPoses[0];
			}
			if (ArmPose != PreferredArm && AllowedArmPoses.includes(PreferredArm)) {
				ArmPose = PreferredArm;
			}
			if (LegPose != PreferredLeg && AllowedLegPoses.includes(PreferredLeg)) {
				LegPose = PreferredLeg;
			}


			// Expressions for standalone


			/** @type {KDExpression} */
			let expression = null;
			let stackedPriorities = {};
			for (let e of Object.entries(KDExpressions)) {
				if (!expression || e[1].priority > expression.priority) {
					if (e[1].criteria(Character)) {
						expression = e[1];
					}
				}
				if (e[1].stackable) {
					if (!e[1].criteria(Character)) continue;
					let result = null;
					if (e[1].priority > (stackedPriorities.EyesPose || 0)) {
						result = result || e[1].expression(Character);
						if (result.EyesPose) {
							stackedPriorities.EyesPose = e[1].priority;
							if (!KDWardrobe_CurrentPoseEyes) EyesPose = result.EyesPose;
						}
					}
					if (e[1].priority > (stackedPriorities.Eyes2Pose || 0)) {
						result = result || e[1].expression(Character);
						if (result.Eyes2Pose) {
							stackedPriorities.Eyes2Pose = e[1].priority;
							if (!KDWardrobe_CurrentPoseEyes2) Eyes2Pose = result.Eyes2Pose;
						}
					}
					if (e[1].priority > (stackedPriorities.BrowsPose || 0)) {
						result = result || e[1].expression(Character);
						if (result.BrowsPose) {
							stackedPriorities.BrowsPose = e[1].priority;
							if (!KDWardrobe_CurrentPoseBrows) BrowsPose = result.BrowsPose;
						}
					}
					if (e[1].priority > (stackedPriorities.Brows2Pose || 0)) {
						result = result || e[1].expression(Character);
						if (result.Brows2Pose) {
							stackedPriorities.Brows2Pose = e[1].priority;
							if (!KDWardrobe_CurrentPoseBrows2) Brows2Pose = result.Brows2Pose;
						}
					}
					if (e[1].priority > (stackedPriorities.BlushPose || 0)) {
						result = result || e[1].expression(Character);
						if (result.BlushPose) {
							stackedPriorities.BlushPose = e[1].priority;
							if (!KDWardrobe_CurrentPoseBlush) BlushPose = result.BlushPose;
						}
					}
					if (e[1].priority > (stackedPriorities.MouthPose || 0)) {
						result = result || e[1].expression(Character);
						if (result.MouthPose) {
							stackedPriorities.MouthPose = e[1].priority;
							if (!KDWardrobe_CurrentPoseMouth) MouthPose = result.MouthPose;
						}
					}
				}
			}
			if (expression) {
				let result = expression.expression(Character);
				if (!KDWardrobe_CurrentPoseEyes && result.EyesPose) EyesPose = result.EyesPose;
				if (!KDWardrobe_CurrentPoseEyes2 && result.Eyes2Pose) Eyes2Pose = result.Eyes2Pose;
				if (!KDWardrobe_CurrentPoseBrows && result.BrowsPose) BrowsPose = result.BrowsPose;
				if (!KDWardrobe_CurrentPoseBrows2 && result.Brows2Pose) Brows2Pose = result.Brows2Pose;
				if (!KDWardrobe_CurrentPoseBlush && result.BlushPose) BlushPose = result.BlushPose;
				if (!KDWardrobe_CurrentPoseMouth && result.MouthPose) MouthPose = result.MouthPose;
			}

			if (KDCurrentModels.get(Character)) {
				KDCurrentModels.get(Character).Poses = KDGeneratePoseArray(
					ArmPose,
					LegPose,
					EyesPose,
					BrowsPose,
					BlushPose,
					MouthPose,
					Eyes2Pose,
					Brows2Pose,
				);
				KDUpdateTempPoses(Character);

			}
		}


		if (!StandalonePatched) {
			// Expressions for BC
			let BlushCounter = 0;
			let Blush = "";
			let Eyes = "";
			let Eyes2 = "";
			let Eyebrows = "";
			let Mouth = "";
			let Fluids = "";

			if (KDToggles.Drool && !KinkyDungeonCanTalk()) {
				if (KinkyDungeonGagTotal() > 0.9) Fluids = "DroolMessy";
				else if (KinkyDungeonGagTotal() > 0.5) Fluids = "DroolMedium";
				else Fluids = "DroolLow";
			}
			if (KDToggles.Drool && KDGameData.KinkyDungeonLeashedPlayer > 0) {
				if (Fluids.includes("Drool")) Fluids = Fluids.replace("Drool", "DroolTears");
				else Fluids = "TearsHigh";
			}

			if (KinkyDungeonSleepiness) {
				Eyes = "Dazed";
			}

			if (KinkyDungeonStatMana < KinkyDungeonStatManaMax*0.45) Eyes = "Sad";
			if (KinkyDungeonStatWill <= KinkyDungeonStatWillMax*0.33 || KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax/2) Eyes = "Dazed";

			if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.167 || KinkyDungeonStatMana < KinkyDungeonStatManaMax*0.33 || KinkyDungeonStatWill < KinkyDungeonStatWillMax*0.33) Eyebrows = "Soft";

			let chastityMult = KinkyDungeonChastityMult();
			if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.67 && KinkyDungeonStatWill > KinkyDungeonStatWillMax*0.5 && chastityMult > 0.9) Eyebrows = "Angry";

			if (KinkyDungeonStatDistraction >= KinkyDungeonStatDistractionMax * 0.8) Eyes = (Eyebrows != "Angry" && KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax * 0.99) ? "Lewd" : "Scared";

			if (KinkyDungeonStatDistraction >= 0.01 && KinkyDungeonStatDistraction <= 3) Eyes2 = "Closed";

			if (KDGameData.OrgasmTurns > 0) {
				Eyebrows = "Soft";
				Eyes2 = "";
				Eyes = "LewdHeart";
			} else if (KDGameData.OrgasmStamina > 0) {
				Eyebrows = "Soft";
			} else if (KDGameData.OrgasmStage > 5 && Math.random() < 0.33) {
				Eyebrows = "Angry";
			} else if (KDGameData.OrgasmStage > 3 && Math.random() < 0.33) {
				Eyebrows = "Angry";
			}

			if (KinkyDungeonStatWill <= 2) {
				Eyes = "Dazed";
				Eyes2 = "";
			}

			if (KinkyDungeonStatDistraction > 0.01) BlushCounter += 1;
			if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.33) BlushCounter += 1;
			if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.65) BlushCounter += 1;

			if (KinkyDungeonUndress > 0.4) BlushCounter += 1;
			if (KinkyDungeonUndress > 0.8) BlushCounter += 1;

			if (BlushCounter == 1) Blush = "Low";
			else if (BlushCounter == 2) Blush = "Medium";
			else if (BlushCounter == 3) Blush = "High";
			else if (BlushCounter == 4) Blush = "VeryHigh";
			else if (BlushCounter == 5) Blush = "Extreme";

			for (let A = 0; A < KinkyDungeonPlayer.Appearance.length; A++) {
				if (KinkyDungeonPlayer.Appearance[A].Asset.Group.Name == "Blush") {
					let property = KinkyDungeonPlayer.Appearance[A].Property;
					if (!property || property.Expression != Blush) {
						KinkyDungeonPlayer.Appearance[A].Property = { Expression: Blush };
						KDRefresh = true;
						data.updateExpression = true;
					}
				}
				if (KinkyDungeonPlayer.Appearance[A].Asset.Group.Name == "Eyebrows") {
					let property = KinkyDungeonPlayer.Appearance[A].Property;
					if (!property || property.Expression != Eyebrows) {
						KinkyDungeonPlayer.Appearance[A].Property = { Expression: Eyebrows };
						KDRefresh = true;
						data.updateExpression = true;
					}
				}
				if (KinkyDungeonPlayer.Appearance[A].Asset.Group.Name == "Mouth") {
					let property = KinkyDungeonPlayer.Appearance[A].Property;
					if (!property || property.Expression != Mouth) {
						KinkyDungeonPlayer.Appearance[A].Property = { Expression: Mouth };
						KDRefresh = true;
						data.updateExpression = true;
					}
				}
				if (KinkyDungeonPlayer.Appearance[A].Asset.Group.Name == "Fluids") {
					let property = KinkyDungeonPlayer.Appearance[A].Property;
					if (!property || property.Expression != Fluids) {
						KinkyDungeonPlayer.Appearance[A].Property = { Expression: Fluids };
						KDRefresh = true;
						data.updateExpression = true;
					}
				}
				if (KinkyDungeonPlayer.Appearance[A].Asset.Group.Name == "Eyes" || KinkyDungeonPlayer.Appearance[A].Asset.Group.Name == "Eyes2") {
					let property = KinkyDungeonPlayer.Appearance[A].Property;
					if (!property || property.Expression != ((KinkyDungeonPlayer.Appearance[A].Asset.Group.Name == "Eyes2" && Eyes2) ? Eyes2 : Eyes)) {
						KinkyDungeonPlayer.Appearance[A].Property = { Expression: ((KinkyDungeonPlayer.Appearance[A].Asset.Group.Name == "Eyes2" && Eyes2) ? Eyes2 : Eyes) };
						KDRefresh = true;
						data.updateExpression = true;
					}
				}


			}
		}

		KinkyDungeonSendEvent("afterDress", data);
	} finally {
		CharacterRefresh = _CharacterRefresh;
		CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
	}

	if (StandalonePatched && KDCurrentModels.get(Character)) {

		if (!InventoryGet(Character, "Body")) KDInventoryWear("Body", "Body");
		if (!InventoryGet(Character, "Eyes")) KDInventoryWear("KoiEyes", "Eyes");
		if (!InventoryGet(Character, "Brows")) KDInventoryWear("KoiBrows", "Brows");
		if (!InventoryGet(Character, "Mouth")) KDInventoryWear("KoiMouth", "Mouth");
		if (!InventoryGet(Character, "Blush")) KDInventoryWear("KoiBlush", "Blush");
		//if (!InventoryGet(Character, "Hair")) KDInventoryWear("Braid", "Hair");


		UpdateModels(Character);
	}
}

/**
 * Initializes protected groups like ears and tail
 */
function KDInitProtectedGroups() {
	KDProtectedCosplay = [];
	// init protected slots
	for (let a of KinkyDungeonPlayer.Appearance) {
		if (a.Asset?.Group?.BodyCosplay || (a.Model?.SuperProtected && a.Model.Group)){
			KDProtectedCosplay.push(a.Asset.Group?.Name || a.Model.Group);
		}
	}
}



/**
 * If the player is wearing a restraint that has a `alwaysDress` property, and the player is not wearing the item specified
 * in the `alwaysDress` property, the player will be forced to wear the items.
 */
/**
 *
 * @param {item[]} [restraints]
 * @param {Character} [C]
 */
function KinkyDungeonWearForcedClothes(restraints, C) {
	if (!C) C = KinkyDungeonPlayer;
	if (!restraints) restraints = KinkyDungeonAllRestraint();
	for (let i = restraints.length - 1; i >= 0; i--) {
		let inv = restraints[i];
		if (KDRestraint(inv).alwaysDress) {
			KDRestraint(inv).alwaysDress.forEach(dress=>{ // for .. of  loop has issues with iterations
				if (dress.override || !dress.Group.includes("Item") || !InventoryGet(C, dress.Group)) {
					let canReplace = (dress.override!==null && dress.override===true) ? true : !InventoryGet(C,dress.Group);

					if (!canReplace) {return;}
					if (KDProtectedCosplay.includes(dress.Group)){return;}
					let filters = dress.Filters;
					/** @type string|string[] */
					let color = (typeof dress.Color === "string") ? [dress.Color] : dress.Color;
					let faction = inv.faction;
					if (inv.faction)
						if (dress.factionColor && faction && KinkyDungeonFactionColors[faction]) {
							for (let ii = 0; ii < dress.factionColor.length; ii++) {
								for (let n of dress.factionColor[ii]) {
									if (KinkyDungeonFactionColors[faction][ii])
										color[n] = KinkyDungeonFactionColors[faction][ii]; // 0 is the primary color
								}
							}
						}
					if (dress.useHairColor && InventoryGet(C, "HairFront")) color = InventoryGet(C, "HairFront").Color;
					let item = KDInventoryWear(dress.Item, dress.Group, inv.name, color, filters);

					if (dress.Property) {
						item.Property = Object.assign(item.Property || {}, dress.Property);
					}
					if (dress.OverridePriority) {
						if (item) {
							if (!item.Property) item.Property = {OverridePriority: dress.OverridePriority};
							else item.Property.OverridePriority = dress.OverridePriority;
						}
					}

					//KDCharacterAppearanceSetColorForGroup(KinkyDungeonPlayer, color, dress.Group);
				}
			});
		}
		if (KDRestraint(inv).alwaysDressModel) {
			KDRestraint(inv).alwaysDressModel.forEach(dress=>{ // for .. of  loop has issues with iterations

				let canReplace = true;
				if (canReplace) {
					KDInventoryWear(dress.Model, undefined, undefined, undefined, dress.Filters);
				}
			});
		}
	}
}
function KDCharacterAppearanceSetColorForGroup(Player, Color, Group) {
	let item = InventoryGet(Player, Group);
	if (item) {
		item.Color = Color;
	}
}

function KinkyDungeonGetOutfit(Name) {
	if (KinkyDungeonOutfitCache && KinkyDungeonOutfitCache.get(Name)) {
		let outfit = {};
		Object.assign(outfit, KinkyDungeonOutfitCache.get(Name));
		return outfit;
	}
	return null;
}


/**
 * Makes the KinkyDungeonPlayer wear an item on a body area
 * @param {string} AssetName - The name of the asset to wear
 * @param {string} AssetGroup - The name of the asset group to wear
 * @param {string} [par] - parent item
 * @param {string | string[]} [color] - parent item
 * @param {Record<string, LayerFilter>} [filters] - parent item
 */
function KDInventoryWear(AssetName, AssetGroup, par, color, filters) {
	const M = StandalonePatched ? ModelDefs[AssetName] : undefined;
	const A = AssetGet(KinkyDungeonPlayer.AssetFamily, AssetGroup, AssetName);
	if ((StandalonePatched && !M) || (!StandalonePatched && !A)) return;
	let item = StandalonePatched ?
		KDAddModel(KinkyDungeonPlayer, AssetGroup, M, color || "Default", filters)
		: KDAddAppearance(KinkyDungeonPlayer, AssetGroup, A, color || A.DefaultColor);
	//CharacterAppearanceSetItem(KinkyDungeonPlayer, AssetGroup, A, color || A.DefaultColor,0,-1, false);
	CharacterRefresh(KinkyDungeonPlayer, true);
	return item;
}

function KDCharacterNaked() {
	KDCharacterAppearanceNaked();
	CharacterRefresh(KinkyDungeonPlayer);
}

/**
 * Removes all items that can be removed, making the player naked. Checks for a blocking of CosPlayItem removal.
 * @returns {void} - Nothing
 */
function KDCharacterAppearanceNaked() {
	// For each item group (non default items only show at a 20% rate)
	for (let A = KinkyDungeonPlayer.Appearance.length - 1; A >= 0; A--) {
		if (StandalonePatched) {
			if (!KinkyDungeonPlayer.Appearance[A].Model.Restraint){
				// conditional filter
				let f = !(KinkyDungeonPlayer.Appearance[A].Model
					&& (
						KDProtectedCosplay.includes(KinkyDungeonPlayer.Appearance[A].Model.Group)
						|| KinkyDungeonPlayer.Appearance[A].Model.Protected
						|| KinkyDungeonPlayer.Appearance[A].Model.SuperProtected));
				if (!f){continue;}
				KinkyDungeonPlayer.Appearance.splice(A, 1);
			}
		} else {
			if (KinkyDungeonPlayer.Appearance[A].Asset.Group.AllowNone &&
				(KinkyDungeonPlayer.Appearance[A].Asset.Group.Category === "Appearance")){
				// conditional filter
				let f = !(KinkyDungeonPlayer.Appearance[A].Asset.Group.BodyCosplay
					&& (KDProtectedCosplay.includes(KinkyDungeonPlayer.Appearance[A].Asset.Group.Name)));
				if (!f){continue;}
				KinkyDungeonPlayer.Appearance.splice(A, 1);
			}
		}
	}


	// Loads the new character canvas
	CharacterLoadCanvas(KinkyDungeonPlayer);
}


function KDApplyItem(inv, tags) {
	if (KDToggleXRay) {
		let itemTags = KDRestraint(inv)?.shrine;
		if (itemTags && itemTags.some((t) => {
			return KD_XRayHidden.includes(t);
		})) {
			return;
		}
	}
	if (StandalonePatched) {
		let restraint = KDRestraint(inv);
		let AssetGroup = restraint.AssetGroup ? restraint.AssetGroup : restraint.Group;
		let faction = inv.faction ? inv.faction : "";

		let color = (typeof restraint.Color === "string") ? [restraint.Color] : restraint.Color;
		if (restraint.factionColor && faction && KinkyDungeonFactionColors[faction]) {
			for (let i = 0; i < restraint.factionColor.length; i++) {
				for (let n of restraint.factionColor[i]) {
					color[n] = KinkyDungeonFactionColors[faction][i]; // 0 is the primary color
				}
			}
		}

		//let already = InventoryGet(KinkyDungeonPlayer, AssetGroup);
		//let difficulty = already?.Property?.Difficulty || 0;

		/** @type {Item} */
		let placed = null;

		if (!restraint.armor || KDToggles.DrawArmor) {
			placed = KDAddModel(KinkyDungeonPlayer, AssetGroup, ModelDefs[restraint.Model || restraint.Asset], color, restraint.Filters, inv);
		}

		if (placed) {
			let type = restraint.Type;
			if (restraint.changeRenderType && Object.keys(restraint.changeRenderType).some((k) => {return tags.has(k);})) {
				let key = Object.keys(restraint.changeRenderType).filter((k) => {return tags.has(k);})[0];
				if (key) {
					type = restraint.changeRenderType[key];
				}
			}
			placed.Property = {Type: type, Modules: restraint.Modules, Difficulty: restraint.power, LockedBy: inv.lock || (KDGetCurse(inv) && KDCurses[KDGetCurse(inv)].lock) ? "MetalPadlock" : undefined};

			/*if ((!already) && type) {
				KinkyDungeonPlayer.FocusGroup = AssetGroupGet("Female3DCG", AssetGroup);
				let options = window["Inventory" + ((AssetGroup.includes("ItemMouth")) ? "ItemMouth" : AssetGroup) + restraint.Asset + "Options"];
				if (!options) options = TypedItemDataLookup[`${AssetGroup}${restraint.Asset}`].options; // Try again
				const option = options.find(o => o.Name === type);
				ExtendedItemSetType(KinkyDungeonPlayer, options, option);
				KinkyDungeonPlayer.FocusGroup = null;
			}*/

			if (restraint.OverridePriority) {
				placed.Property.OverridePriority = restraint.OverridePriority;
			}
		}
		return;
	}
	KDApplyItemLegacy(inv, tags);
}

/** Legacy */
function KDApplyItemLegacy(inv, tags) {
	let _ChatRoomCharacterUpdate = ChatRoomCharacterUpdate;
	ChatRoomCharacterUpdate = () => {};
	try {
		let restraint = KDRestraint(inv);
		let AssetGroup = restraint.AssetGroup ? restraint.AssetGroup : restraint.Group;
		let faction = inv.faction ? inv.faction : "";

		let color = (typeof restraint.Color === "string") ? [restraint.Color] : Object.assign([], restraint.Color);
		if (restraint.factionColor && faction && KinkyDungeonFactionColors[faction]) {
			for (let i = 0; i < restraint.factionColor.length; i++) {
				for (let n of restraint.factionColor[i]) {
					if (KinkyDungeonFactionColors[faction][i])
						color[n] = KinkyDungeonFactionColors[faction][i]; // 0 is the primary color
				}
			}
		}

		//let already = InventoryGet(KinkyDungeonPlayer, AssetGroup);
		//let difficulty = already?.Property?.Difficulty || 0;

		/** @type {Item} */
		let placed = null;

		if (!restraint.armor || KDToggles.DrawArmor) {
			placed = KDAddAppearance(KinkyDungeonPlayer, AssetGroup, AssetGet("3DCGFemale", AssetGroup, restraint.Asset), color, undefined, undefined, undefined, inv);
		}

		if (placed) {
			let type = restraint.Type;
			if (restraint.changeRenderType && Object.keys(restraint.changeRenderType).some((k) => {return tags.has(k);})) {
				let key = Object.keys(restraint.changeRenderType).filter((k) => {return tags.has(k);})[0];
				if (key) {
					type = restraint.changeRenderType[key];
				}
			}
			placed.Property = {Type: type, Difficulty: restraint.power, LockedBy: inv.lock ? "MetalPadlock" : undefined};

			/*if ((!already) && type) {
				KinkyDungeonPlayer.FocusGroup = AssetGroupGet("Female3DCG", AssetGroup);
				let options = window["Inventory" + ((AssetGroup.includes("ItemMouth")) ? "ItemMouth" : AssetGroup) + restraint.Asset + "Options"];
				if (!options) options = TypedItemDataLookup[`${AssetGroup}${restraint.Asset}`].options; // Try again
				const option = options.find(o => o.Name === type);
				ExtendedItemSetType(KinkyDungeonPlayer, options, option);
				KinkyDungeonPlayer.FocusGroup = null;
			}*/

			if (restraint.Modules) {
				let data = ModularItemDataLookup[AssetGroup + restraint.Asset];
				let asset = data.asset;
				let modules = data.modules;
				placed.Property = ModularItemMergeModuleValues({ asset, modules }, restraint.Modules);
				placed.Property.LockedBy = inv.lock ? "MetalPadlock" : undefined;
			} else if (type) TypedItemSetOptionByName(KinkyDungeonPlayer, placed, type, false);
			if (restraint.OverridePriority) {
				placed.Property.OverridePriority = restraint.OverridePriority;
			}
		}
	} finally {
		ChatRoomCharacterUpdate = _ChatRoomCharacterUpdate;
	}
}


function KinkyDungeonSendOutfitEvent(Event, data) {
	if (!KDMapHasEvent(KDEventMapOutfit, Event)) return;
	let outfit = KDOutfit({name: KinkyDungeonCurrentDress});
	if (outfit && outfit.events) {
		for (let e of outfit.events) {
			if (e.trigger == Event) {
				KinkyDungeonHandleOutfitEvent(Event, e, outfit, data);
			}
		}
	}
}


function KDGetExtraPoses(C) {
	let poses = [];
	if (C == KinkyDungeonPlayer) {
		// For player
		if (KinkyDungeonPlayerTags.get("LinkFeet")) {
			poses.push("FeetLinked");
		}
	} else {
		// For NPC
		// ???
	}
	return poses;
}


/** @type {Record<string, KDExpression>} */
let KDExpressions = {
	"RestrainedImmediate": {
		priority: 7,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && KinkyDungeonFlags.get("restrained")) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushHigh",
				MouthPose: "MouthSurprised",
			};
		},
	},
	"RestrainedRecent": {
		priority: 1.5,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && KinkyDungeonFlags.get("restrained_recently")) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushMedium",
				MouthPose: "MouthEmbarrassed",
			};
		},
	},
	"OrgSuccess": {
		priority: 14,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && KinkyDungeonFlags.get("OrgSuccess")) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: "EyesSurprised",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsSurprised",
				Brows2Pose: "Brows2Surprised",
				BlushPose: "BlushExtreme",
				MouthPose: "MouthDazed",
			};
		},
	},
	"OrgEdged": {
		priority: 8,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && KinkyDungeonFlags.get("OrgEdged")) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: "EyesAngry",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsAnnoyed",
				Brows2Pose: "Brows2Annoyed",
				BlushPose: "BlushExtreme",
				MouthPose: "MouthDazed",
			};
		},
	},
	"OrgDenied": {
		priority: 8,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && KinkyDungeonFlags.get("OrgDenied")) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: "EyesSurprised",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsAngry",
				Brows2Pose: "Brows2Angry",
				BlushPose: "BlushExtreme",
				MouthPose: "MouthEmbarrassed",
			};
		},
	},
	"DenialPassion": {
		priority: 9,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && (KinkyDungeonFlags.get("OrgDenied") || KinkyDungeonFlags.get("OrgEdged")) && KinkyDungeonGoddessRep.Passion > 10) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: "EyesSurprised",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsSad",
				Brows2Pose: "Brows2Sad",
				BlushPose: "BlushExtreme",
				MouthPose: "MouthSmile",
			};
		},
	},
	"PlayWithSelf": {
		priority: 12,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && (KinkyDungeonFlags.get("PlayWithSelf"))) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: KinkyDungeonFlags.get("VibeContinued") ? "EyesDazed" : "EyesNeutral",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsNeutral",
				Brows2Pose: "Brows2Neutral",
				BlushPose: "BlushHigh",
				MouthPose: "MouthSmile",
			};
		},
	},
	"VibeStart": {
		priority: 6,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && (KinkyDungeonFlags.get("VibeStarted") || KinkyDungeonFlags.get("VibeContinued"))) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: KinkyDungeonFlags.get("VibeContinued") ? "EyesDazed" : "EyesNeutral",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsSad",
				Brows2Pose: "Brows2Sad",
				BlushPose: "BlushHigh",
				MouthPose: "MouthDazed",
			};
		},
	},
	"Vibing": {
		stackable: true,
		priority: 2,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && KinkyDungeonVibeLevel > 0) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.5) ? "EyesAngry" : "",
				Eyes2Pose: (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.5) ? "Eyes2Angry" : "",
				BrowsPose: "BrowsNeutral",
				Brows2Pose: "Brows2Neutral",
				BlushPose: (KinkyDungeonVibeLevel > 2 || KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.5) ? "BlushMedium" : "BlushHigh",
				MouthPose: "MouthEmbarrassed",
			};
		},
	},
	"Distracted": {
		stackable: true,
		priority: 1,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && KinkyDungeonStatDistraction > 0) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.5) ? "BlushLow" : "BlushMedium",
				MouthPose: "",
			};
		},
	},
	"Tired": {
		stackable: true,
		priority: 1,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax * 0.5) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax * 0.25) ? "EyesClosed" : "EyesDazed",
				Eyes2Pose: "Eyes2Dazed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "",
			};
		},
	},
	"Frustrated": {
		stackable: true,
		priority: 2.25,
		criteria: (C) => {
			return KinkyDungeonGoddessRep.Frustration > -20;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "BrowsSad",
				Brows2Pose: "Brows2Sad",
				BlushPose: "",
				MouthPose: "",
			};
		},
	},
	"FrustratedMouth": {
		stackable: true,
		priority: 0.25,
		criteria: (C) => {
			return KinkyDungeonGoddessRep.Frustration > 20;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "MouthEmbarrassed",
			};
		},
	},
	"Passionate": {
		stackable: true,
		priority: 2.2,
		criteria: (C) => {
			return KinkyDungeonGoddessRep.Passion > -5;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "MouthSmile",
			};
		},
	},
	"PassionateBlush1": {
		stackable: true,
		priority: 2.2,
		criteria: (C) => {
			return KinkyDungeonGoddessRep.Passion > -40;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushLow",
				MouthPose: "",
			};
		},
	},
	"PassionateBlush2": {
		stackable: true,
		priority: 4,
		criteria: (C) => {
			return KinkyDungeonGoddessRep.Passion > -10;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushMedium",
				MouthPose: "",
			};
		},
	},
	"PassionateBlush3": {
		stackable: true,
		priority: 7,
		criteria: (C) => {
			return KinkyDungeonGoddessRep.Passion > 20;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushHigh",
				MouthPose: "",
			};
		},
	},
	"PassionateBlush4": {
		stackable: true,
		priority: 10,
		criteria: (C) => {
			return KinkyDungeonGoddessRep.Passion > 40;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushExtreme",
				MouthPose: "",
			};
		},
	},
	"Neutral": {
		stackable: true,
		priority: 0.1,
		criteria: (C) => {
			return true;
		},
		expression: (C) => {
			return {
				EyesPose: "EyesNeutral",
				Eyes2Pose: "Eyes2Neutral",
				BrowsPose: "BrowsNeutral",
				Brows2Pose: "Brows2Neutral",
				BlushPose: "BlushNone",
				MouthPose: "MouthNeutral",
			};
		},
	},
};

function KDUpdateTempPoses(Character) {
	// Append temp poses
	for (let pose of Object.keys(KDCurrentModels.get(Character).TempPoses)) {
		if (KDCurrentModels.get(Character).Poses[pose])
			delete KDCurrentModels.get(Character).TempPoses[pose];
		else
			KDCurrentModels.get(Character).Poses[pose] = true;
	}
}
