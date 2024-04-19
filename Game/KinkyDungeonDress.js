"use strict";

let KDNaughtySetting = false;

// For cacheing
let KinkyDungeonOutfitCache = new Map();

/**@type {string[]} Contains protected zones*/
let KDProtectedCosplay = [];

/**
 *
 * @param {Named} item
 * @returns {outfit}
 */
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
function KinkyDungeonDressSet(C) {
	if (KinkyDungeonNewDress) {
		KDGetDressList().Default = [];
		if (!C) C = KinkyDungeonPlayer;

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
						Color: (C.Appearance[A].Color) ? C.Appearance[A].Color : (C.Appearance[A].Model?.DefaultColor ? C.Appearance[A].Model?.DefaultColor : "Default"),
						Lost: false,
						Skirt: C.Appearance[A].Model?.Group == "Skirt" || C.Appearance[A].Model?.Categories?.includes("Skirts"),
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

let KDCharacterDress = new Map();

function KinkyDungeonSetDress(Dress, Outfit, Character, NoRestraints) {
	if (!Character || Character == KinkyDungeonPlayer) {
		if (Outfit) KDGameData.Outfit = Outfit;
		KinkyDungeonCurrentDress = Dress;
	} else {
		KDCharacterDress.set(Character, Dress);
	}
	if (KDGetDressList()) {
		if (!Character || Character == KinkyDungeonPlayer) {
			for (let clothes of KDGetDressList()[KinkyDungeonCurrentDress]) {
				clothes.Lost = false;
			}
		}
		KinkyDungeonCheckClothesLoss = true;
		KinkyDungeonDressPlayer(Character, NoRestraints);
		KDRefresh = true;
	}
}

let KDNaked = false;
let KDRefresh = false;
let KDLastForceRefresh = 0;
let KDLastForceRefreshInterval = 100;

/**
 * It sets the player's appearance based on their stats.
 */
function KinkyDungeonDressPlayer(Character, NoRestraints, Force) {
	if (!Character) Character = KinkyDungeonPlayer;

	let _CharacterRefresh = CharacterRefresh;
	let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
	CharacterRefresh = () => {KDRefresh = true;};
	CharacterAppearanceBuildCanvas = () => {};
	let restraints = [];

	if (StandalonePatched) {
		AppearanceCleanup(Character);
	}

	let restraintModels = {};

	let CurrentDress = Character == KinkyDungeonPlayer ? KinkyDungeonCurrentDress : (KDCharacterDress.get(Character) || "Bandit");
	let DressList = KDGetDressList()[CurrentDress];

	if (KDNPCStyle.get(Character)?.customOutfit) {
		DressList = [];
		for (let a of JSON.parse(DecompressB64(KDNPCStyle.get(Character)?.customOutfit))) {
			if (a.Model && !a.Model.Protected && !a.Model.Restraint && !a.Model.Cosplay) {
				DressList.push({
					Item: a.Model.Name || a.Model,
					Group: a.Model.Group || a.Model.Name || a.Model,
					Color: "#ffffff",
					Lost: false,
					Filters: a.Model.Filters || a.Filters,
				},);
			}
		}
	}

	try {
		let data = {
			updateRestraints: false,
			updateDress: false,
			updateExpression: false,
			Character: Character,
		};

		KinkyDungeonPlayer.OnlineSharedSettings = {BlockBodyCosplay: true};

		// if true, nakeds the player, then reclothes
		if (KinkyDungeonCheckClothesLoss) {


			if (!KDNaked) KDCharacterNaked(Character);
			// We refresh all the restraints
			/*=if (StandalonePatched && CommonTime() > KDLastForceRefresh + KDLastForceRefreshInterval) {
				// Force refresh the model
				ForceRefreshModels(Character);
				KDLastForceRefresh = CommonTime();
			}*/

			// First we remove all restraints and clothes
			let clothGroups = {};
			for (let cloth of Object.values(DressList)) {
				clothGroups[cloth.Group || cloth.Item] = true;
			}
			let newAppearance = {};
			for (let A = 0; A < Character.Appearance.length; A++) {
				if (StandalonePatched) {
					let model = Character.Appearance[A]?.Model;
					if (model && ((!model.Restraint && !model.Group?.startsWith("Item") && !clothGroups[model.Group || model.Name])
						|| model.Protected || model.SuperProtected)) {
						//Character.Appearance.splice(A, 1);
						//A -= 1;
						newAppearance[model.Group || model.Name] = Character.Appearance[A];
					}
				} else {
					// BC support
					let asset = Character.Appearance[A].Asset;
					if (!asset.Group.Name.startsWith("Item") && !clothGroups[asset.Group.Name]) {
						//Character.Appearance.splice(A, 1);
						//A -= 1;
						newAppearance[asset.Group.Name] = Character.Appearance[A];
					}
				}

			}

			Character.Appearance = Object.values(newAppearance);

			//Character.Appearance = [];

			let tags = Character == KinkyDungeonPlayer ? KinkyDungeonPlayerTags : new Map();

			// Next we revisit all the player's restraints
			if (!NoRestraints) {
				for (let inv of KinkyDungeonAllRestraint()) {
					if (!KDRestraint(inv) || (KDRestraint(inv).armor && !KDToggles.DrawArmor)) continue; // Skip invalid restraints!!!
					let renderTypes = KDRestraint(inv).shrine;
					if (!KDRestraint(inv).hideTags || KDRestraint(inv).hideTags.some((tag) => {return tags.get(tag) == true;})) {
						KDApplyItem(Character, inv, KinkyDungeonPlayerTags);
						if (KDRestraint(inv).Model) {

							restraintModels[KDRestraint(inv).Model] = true;
							restraintModels["Fashion" + KDRestraint(inv).Model] = true;
						}
					}
					restraints.push(inv);
					if (inv.dynamicLink) {
						let accessible = KDRestraint(inv)?.accessible || KDRestraint(inv)?.UnderlinkedAlwaysRender;
						let link = inv.dynamicLink;
						for (let I = 0; I < 30; I++) {
							if (accessible || KDRestraint(link).alwaysRender || (KDRestraint(link).renderWhenLinked && KDRestraint(link).renderWhenLinked.some((element) => {return renderTypes.includes(element);}))) {
								if (!KDRestraint(inv).hideTags || KDRestraint(inv).hideTags.some((tag) => {return tags.get(tag) == true;})) {
									KDApplyItem(Character, link, KinkyDungeonPlayerTags);

									if (KDRestraint(link).Model) {
										restraintModels[KDRestraint(link).Model] = true;
										restraintModels["Fashion" + KDRestraint(link).Model] = true;
									}

								}
								restraints.push(link);
							}
							if (link.dynamicLink) {
								renderTypes = KDRestraint(link).shrine;
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

		for (let A = 0; A < Character.Appearance.length; A++) {
			let asset = Character.Appearance[A].Asset;
			if (StandalonePatched) {
				if (Character.Appearance[A].Model?.Group)
					alreadyClothed[Character.Appearance[A].Model?.Group] = true;
			} else
				alreadyClothed[asset.Group.Name] = true;
		}

		// Only track these for player
		if (Character == KinkyDungeonPlayer) {
			for (let clothes of DressList) {
				if (!clothes) continue;
				if (StandalonePatched && !clothes.Lost && KinkyDungeonCheckClothesLoss) {
					if (clothes.Item && (restraintModels[clothes.Item] || restraintModels[clothes.Item + "Restraint"])) {
						clothes.Lost = true;
					} else if (IsModelLost(Character, clothes.Item))
						clothes.Lost = true;
				}
				if (alreadyClothed[clothes.Group || clothes.Item]) continue;
				data.updateDress = true;
				if (!clothes.Lost && KinkyDungeonCheckClothesLoss) {



					if (clothes.Group == "Necklace") {
						if (KinkyDungeonGetRestraintItem("ItemTorso") && KDRestraint(KinkyDungeonGetRestraintItem("ItemTorso"))?.harness) clothes.Lost = true;
						if (KinkyDungeonGetRestraintItem("ItemArms") && KDGroupBlocked("ItemBreast")) clothes.Lost = true;
					}
					//if (clothes.Group == "Bra" && !clothes.NoLose) {
					//if (KinkyDungeonGetRestraintItem("ItemBreast")) clothes.Lost = true;
					//}
					if (clothes.Group == "Panties" && !clothes.NoLose) {
						if (KinkyDungeonGetRestraintItem("ItemPelvis")) clothes.Lost = true;
					}
					if (clothes.Group == "ClothLower" && clothes.Skirt) {
						//if (KinkyDungeonPlayerTags?.get("EncaseLegs")) clothes.Lost = true;
						if (KDGroupBlocked("ItemLegs")) clothes.Lost = true;
						if (KDGroupBlocked("ClothLower")) clothes.Lost = true;
					}
					if (clothes.Group == "Shoes" || (
						StandalonePatched && ModelDefs[clothes.Item]?.Categories?.includes("Shoes")
					)) {
						let inv = KinkyDungeonGetRestraintItem("ItemBoots");
						if (inv && (!KDRestraint(inv).armor || KDToggles.DrawArmor)) clothes.Lost = true;
						if (KinkyDungeonFlags.get("stripShoes")) clothes.Lost = true;
					}
					if (!NoRestraints) {
						for (let inv of KinkyDungeonAllRestraint()) {
							if (KDRestraint(inv)?.remove && (!KDRestraint(inv).armor || KDToggles.DrawArmor)) {
								for (let remove of KDRestraint(inv).remove) {
									if (remove == clothes.Group) clothes.Lost = true;
									if (StandalonePatched && ModelDefs[clothes.Item]?.Categories?.includes(remove)) clothes.Lost = true;
								}
							}
						}
					}

					if (clothes.Lost) KinkyDungeonUndress += 1/DressList.length;
				}

				if (!clothes.Lost) {
					if (KinkyDungeonCheckClothesLoss) {
						let item = KDInventoryWear(Character, clothes.Item, clothes.Group, undefined, clothes.Color, clothes.Filters);
						alreadyClothed[clothes.Group || clothes.Item] = true;
						if (item) {
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
							//KDCharacterAppearanceSetColorForGroup(Character, clothes.Color, clothes.Group);
						}
					}
				}

				if (!KDNaughtySetting) {
					if (clothes.Group == "Panties" && !KinkyDungeonGetRestraintItem("ItemPelvis")) clothes.Lost = false; // A girl's best friend never leaves her
					if (clothes.Group == "Bra" && !KinkyDungeonGetRestraintItem("ItemBreast")) clothes.Lost = false; // A girl's best friend never leaves her
				}
			}
		} else {
			for (let clothes of DressList) {
				if (alreadyClothed[clothes.Group || clothes.Item]) continue;
				data.updateDress = true;

				//if (!clothes.Lost) {
				if (KinkyDungeonCheckClothesLoss) {
					KDInventoryWear(Character, clothes.Item, clothes.Group, undefined, clothes.Color, clothes.Filters);
					alreadyClothed[clothes.Group || clothes.Item] = true;
				}
				//}

			}
		}

		if (!NoRestraints) {
			if (!StandalonePatched)
				for (let inv of KinkyDungeonAllRestraint()) {
					if (KinkyDungeonCheckClothesLoss)
						if (KDRestraint(inv)?.AssetGroup && (!KDRestraint(inv).armor || KDToggles.DrawArmor)) {
							KDInventoryWear(Character, KDRestraint(inv).Asset, KDRestraint(inv).AssetGroup, undefined, KDRestraint(inv).Color, KDRestraint(inv).Filters);
						}
				}
			if (KinkyDungeonCheckClothesLoss)
				KinkyDungeonWearForcedClothes(Character, restraints);
			KinkyDungeonSendEvent("dressRestraints", data);
		}

		// Apply poses from restraints
		if (StandalonePatched && KDCurrentModels.get(Character)) {
			RefreshTempPoses(Character, true);
			KDRefreshPoseOptions(Character);
		}



		KinkyDungeonCheckClothesLoss = false;
		let AllowedArmPoses = StandalonePatched ? KDGetAvailablePosesArms(Character) : [];
		let AllowedLegPoses = StandalonePatched ? KDGetAvailablePosesLegs(Character) : [];

		if (Character == KinkyDungeonPlayer) {
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
			if (!AllowedLegPoses.includes(DefaultHobbled)) {
				DefaultHobbled = "Kneel"; // Get up from hogtie
			}
			if (!AllowedLegPoses.includes(DefaultHobbled)) {
				DefaultHobbled = "KneelClosed"; // Get up from hogtie
			}

			// Hold to player's preferred pose
			let PreferredArm = KDDesiredPlayerPose.Arms || "Free";
			let PreferredLeg = KDDesiredPlayerPose.Legs || "Spread";

			if (!AllowedLegPoses.includes(PreferredLeg)) {
				PreferredLeg = "Closed"; // Get up from hogtie
				if (!AllowedLegPoses.includes(PreferredLeg)) {
					DefaultHobbled = "Kneel"; // Get up from hogtie
					if (!AllowedLegPoses.includes(PreferredLeg)) {
						DefaultHobbled = "KneelClosed"; // Get up from hogtie
					}
				}
			}

			if (!AllowedArmPoses.includes(ArmPose)) {
				ArmPose = (AllowedArmPoses.includes(DefaultBound) && KinkyDungeonIsArmsBound(false, false)) ? DefaultBound : AllowedArmPoses[0];
			}
			if (!AllowedLegPoses.includes(LegPose)) {
				LegPose = (AllowedLegPoses.includes(DefaultHobbled)) ? DefaultHobbled : AllowedLegPoses[0];
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

		KDRefreshPoseOptions(Character);

		let Xray = [];
		if (KDToggleXRay > 0) {
			Xray = ["Xray"];
			if (KDToggleXRay > 1 && Character?.Appearance?.some((A) => {
				return A.Model?.Layers && Object.values(A.Model?.Layers).some((L) => {return Object.keys(LayerGroups.XrayFace).some((L2) => {return L2 == L.Layer;});});
			})) {
				Xray.push("XrayFace");
			}
			if (Character?.Appearance?.some((A) => {
				return A.Model?.Layers && A.Model?.Categories && Object.values(A.Model.Categories).some((C) => {return C == "ChastityBelt";});
			})) {
				Xray.push("XrayPanties");
			}
			if (Character?.Appearance?.some((A) => {
				return A.Model?.Layers && A.Model?.Categories && Object.values(A.Model.Categories).some((C) => {return C == "ChastityBra";});
			})) {
				Xray.push("XrayBra");
			}
		}
		UpdateModels(Character, Xray);
		let ReUpdate = false;

		let hairstyle = KDNPCStyle.get(Character)?.hairstyle || "Default";
		let bodystyle = KDNPCStyle.get(Character)?.bodystyle || "Default";
		let facestyle = KDNPCStyle.get(Character)?.facestyle || "Default";
		let cosplaystyle = KDNPCStyle.get(Character)?.cosplaystyle || "Default";

		if (!KDCurrentModels.get(Character)?.Poses?.Body && KDModelBody[bodystyle]) {
			for (let body of Object.values(KDModelBody[bodystyle])) {
				KDInventoryWear(Character, body.Item, undefined, undefined, undefined, body.Filters);
				ReUpdate = true;
			}
		}
		if (!KDCurrentModels.get(Character)?.Poses?.Eyes && KDModelFace[facestyle]) {
			for (let face of Object.values(KDModelFace[facestyle])) {
				KDInventoryWear(Character, face.Item, undefined, undefined, undefined, face.Filters);
				ReUpdate = true;
			}
		}
		if (!KDCurrentModels.get(Character)?.Poses?.Hair && KDModelHair[hairstyle]) {
			for (let hair of Object.values(KDModelHair[hairstyle])) {
				KDInventoryWear(Character, hair.Item, undefined, undefined, undefined, hair.Filters);
				ReUpdate = true;
			}
		}
		if (!KDCurrentModels.get(Character)?.Poses?.Cosplay && KDModelCosplay[cosplaystyle]) {
			for (let cosplay of Object.values(KDModelCosplay[cosplaystyle])) {
				KDInventoryWear(Character, cosplay.Item, undefined, undefined, undefined, cosplay.Filters);
				ReUpdate = true;
			}
		}

		if (ReUpdate) UpdateModels(Character, Xray);
		if (Force) {
			ForceRefreshModels(Character);
		}
	}
}

/**
 * Initializes protected groups like ears and tail
 * @param {Character} C
 */
function KDInitProtectedGroups(C) {
	if (!C) C = KinkyDungeonPlayer;
	if (C == KinkyDungeonPlayer) {
		KDProtectedCosplay = [];
		// init protected slots
		for (let a of C.Appearance) {
			if (a.Asset?.Group?.BodyCosplay || (a.Model?.SuperProtected && a.Model.Group)){
				KDProtectedCosplay.push(a.Asset.Group?.Name || a.Model.Group);
			}
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
 * @param {Character} C
 */
function KinkyDungeonWearForcedClothes(C, restraints) {
	if (!C) C = KinkyDungeonPlayer;
	if (!restraints) restraints = C == KinkyDungeonPlayer ? KinkyDungeonAllRestraint() : [];
	for (let i = restraints.length - 1; i >= 0; i--) {
		let inv = restraints[i];
		if (!StandalonePatched && KDRestraint(inv)?.alwaysDress) {
			KDRestraint(inv).alwaysDress.forEach(dress=>{ // for .. of  loop has issues with iterations
				if (dress.override || !dress.Group.includes("Item") || !InventoryGet(C, dress.Group)) {
					let canReplace = (dress.override!==null && dress.override===true) ? true : !InventoryGet(C,dress.Group);

					if (!canReplace) {return;}
					if (C == KinkyDungeonPlayer && KDProtectedCosplay.includes(dress.Group)){return;}
					let filters = dress.Filters ? JSON.parse(JSON.stringify(dress.Filters)) : {};
					/** @type string|string[] */
					let color = (typeof dress.Color === "string") ? [dress.Color] : dress.Color;
					let faction = inv.faction;
					if (inv.faction) {
						if (StandalonePatched) {
							if (dress.factionFilters && faction && KDGetFactionFilters(faction)) {
								for (let f of Object.entries(dress.factionFilters)) {
									if (KDGetFactionFilters(faction)[f[1].color])
										filters[f[0]] = KDGetFactionFilters(faction)[f[1].color]; // 0 is the primary color
								}
							}
						} else {
							if (dress.factionColor && faction && KinkyDungeonFactionColors[faction]) {
								for (let ii = 0; ii < dress.factionColor.length; ii++) {
									for (let n of dress.factionColor[ii]) {
										if (KinkyDungeonFactionColors[faction][ii])
											color[n] = KinkyDungeonFactionColors[faction][ii]; // 0 is the primary color
									}
								}
							}
						}
					}
					if (dress.useHairColor && InventoryGet(C, "HairFront")) color = InventoryGet(C, "HairFront").Color;
					let item = KDInventoryWear(C, dress.Item, dress.Group, inv.name, color, filters);

					if (dress.Property) {
						item.Property = Object.assign(item.Property ? JSON.parse(JSON.stringify(item.Property)) : {}, JSON.parse(JSON.stringify(dress.Property)));
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
		if (StandalonePatched && KDRestraint(inv)?.alwaysDressModel) {
			KDRestraint(inv).alwaysDressModel.forEach(dress=>{ // for .. of  loop has issues with iterations
				let canReplace = (dress.override!==null && dress.override===true) ? true : !InventoryGet(C,dress.Group);

				if (dress.Group && !canReplace) {return;}
				if (dress.Group && C == KinkyDungeonPlayer && KDProtectedCosplay.includes(dress.Group)){return;}
				let filters =  dress.Filters ? JSON.parse(JSON.stringify(dress.Filters)) : {};
				let faction = inv.faction;
				if (inv.faction) {
					if (StandalonePatched) {
						if (dress.factionFilters && faction && KDGetFactionFilters(faction)) {
							for (let f of Object.entries(dress.factionFilters)) {
								if (KDGetFactionFilters(faction)[f[1].color])
									filters[f[0]] = KDGetFactionFilters(faction)[f[1].color]; // 0 is the primary color
							}
						}
					}
				}
				KDInventoryWear(C, dress.Model, undefined, undefined, undefined, dress.inheritFilters ? KDRestraint(inv).Filters : (filters));
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
 * @param {Character} Character
 * @param {string} AssetName - The name of the asset to wear
 * @param {string} AssetGroup - The name of the asset group to wear
 * @param {string} [par] - parent item
 * @param {string | string[]} [color] - parent item
 * @param {Record<string, LayerFilter>} [filters] - parent item
 */
function KDInventoryWear(Character, AssetName, AssetGroup, par, color, filters) {
	const M = StandalonePatched ? ModelDefs[AssetName] : undefined;
	const A = AssetGet(Character.AssetFamily, AssetGroup, AssetName);
	if ((StandalonePatched && !M) || (!StandalonePatched && !A)) return;
	let item = StandalonePatched ?
		KDAddModel(Character, AssetGroup, M, color || "Default", filters)
		: KDAddAppearance(Character, AssetGroup, A, color || A.DefaultColor);
	//CharacterAppearanceSetItem(KinkyDungeonPlayer, AssetGroup, A, color || A.DefaultColor,0,-1, false);
	CharacterRefresh(Character, true);
	return item;
}

function KDCharacterNaked(Character) {
	if (!Character) Character = KinkyDungeonPlayer;
	KDCharacterAppearanceNaked(Character);
	CharacterRefresh(Character);
}

/**
 * Removes all items that can be removed, making the player naked. Checks for a blocking of CosPlayItem removal.
 * @param {Character} C
 * @returns {void} - Nothing
 */
function KDCharacterAppearanceNaked(C) {
	// For each item group (non default items only show at a 20% rate)
	for (let A = C.Appearance.length - 1; A >= 0; A--) {
		if (StandalonePatched) {
			if (!C.Appearance[A].Model.Restraint){
				// conditional filter
				let f = !(C.Appearance[A]?.Model
					&& ((C == KinkyDungeonPlayer &&
						KDProtectedCosplay.includes(C.Appearance[A].Model.Group))
						|| C.Appearance[A].Model.Protected
						|| C.Appearance[A].Model.SuperProtected));
				if (!f){continue;}
				C.Appearance.splice(A, 1);
			}
		} else {
			if (C.Appearance[A].Asset.Group.AllowNone &&
				(C.Appearance[A].Asset.Group.Category === "Appearance")){
				// conditional filter
				let f = !(C.Appearance[A]?.Asset.Group.BodyCosplay
					&& C == KinkyDungeonPlayer && (KDProtectedCosplay.includes(C.Appearance[A].Asset.Group.Name)));
				if (!f){continue;}
				C.Appearance.splice(A, 1);
			}
		}
	}


	// Loads the new character canvas
	CharacterLoadCanvas(C);
}

/**
 *
 * @param {Character} C
 * @param {*} inv
 * @param {*} tags
 * @returns
 */
function KDApplyItem(C, inv, tags) {
	if (KDToggleXRay && !StandalonePatched) {
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

		// faction color system
		let color = (typeof restraint.Color === "string") ? [restraint.Color] : restraint.Color;
		let filters =  (restraint.Filters || (ModelDefs[restraint.Model || restraint.Asset])?.Filters) ?
			JSON.parse(JSON.stringify(restraint.Filters || (ModelDefs[restraint.Model || restraint.Asset])?.Filters))
			: {};

		if (restraint.factionFilters && faction && KDGetFactionFilters(faction)) {
			for (let f of Object.entries(restraint.factionFilters)) {
				if (KDGetFactionFilters(faction)[f[1].color]) {
					if (f[1].override || !filters[f[0]]) {
						filters[f[0]] = KDGetFactionFilters(faction)[f[1].color];
					} else {
						filters[f[0]].saturation = 0;
						filters[f[0]].red = KDGetFactionFilters(faction)[f[1].color].red;
						filters[f[0]].blue = KDGetFactionFilters(faction)[f[1].color].blue;
						filters[f[0]].green = KDGetFactionFilters(faction)[f[1].color].green;
					}
				}
			}
		}

		let data = {
			Filters: filters,
			faction: faction,
		};
		KinkyDungeonSendEvent("apply", data);

		//let already = InventoryGet(C, AssetGroup);
		//let difficulty = already?.Property?.Difficulty || 0;

		/** @type {Item} */
		let placed = null;

		if (!restraint.armor || KDToggles.DrawArmor) {
			placed = KDAddModel(C, AssetGroup, ModelDefs[restraint.Model || restraint.Asset], color, data.Filters, inv);
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
				C.FocusGroup = AssetGroupGet("Female3DCG", AssetGroup);
				let options = window["Inventory" + ((AssetGroup.includes("ItemMouth")) ? "ItemMouth" : AssetGroup) + restraint.Asset + "Options"];
				if (!options) options = TypedItemDataLookup[`${AssetGroup}${restraint.Asset}`].options; // Try again
				const option = options.find(o => o.Name === type);
				ExtendedItemSetType(C, options, option);
				C.FocusGroup = null;
			}*/

			if (restraint.OverridePriority) {
				placed.Property.OverridePriority = restraint.OverridePriority;
			}
		}
		return;
	} else
		KDApplyItemLegacy(inv, tags);
}

/** Legacy */
function KDApplyItemLegacy(C, inv, tags) {
	if (!C) C = KinkyDungeonPlayer;
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

		let data = {
			color: color,
			faction: faction,
		};
		KinkyDungeonSendEvent("legacyApply", data);

		//let already = InventoryGet(C, AssetGroup);
		//let difficulty = already?.Property?.Difficulty || 0;

		/** @type {Item} */
		let placed = null;

		if (!restraint.armor || KDToggles.DrawArmor) {
			placed = KDAddAppearance(C, AssetGroup, AssetGet("3DCGFemale", AssetGroup, restraint.Asset), data.color, undefined, undefined, undefined, inv);
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
				C.FocusGroup = AssetGroupGet("Female3DCG", AssetGroup);
				let options = window["Inventory" + ((AssetGroup.includes("ItemMouth")) ? "ItemMouth" : AssetGroup) + restraint.Asset + "Options"];
				if (!options) options = TypedItemDataLookup[`${AssetGroup}${restraint.Asset}`].options; // Try again
				const option = options.find(o => o.Name === type);
				ExtendedItemSetType(C, options, option);
				C.FocusGroup = null;
			}*/

			if (restraint.Modules) {
				let D = ModularItemDataLookup[AssetGroup + restraint.Asset];
				let asset = D.asset;
				let modules = D.modules;
				placed.Property = ModularItemMergeModuleValues({ asset, modules }, restraint.Modules);
				placed.Property.LockedBy = inv.lock ? "MetalPadlock" : undefined;
			} else if (type) TypedItemSetOptionByName(C, placed, type, false);
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
	let outfit = KDOutfit({name: data.CurrentDress || KinkyDungeonCurrentDress});
	if (outfit && outfit.events) {
		for (let e of outfit.events) {
			if (e.trigger == Event) {
				KinkyDungeonHandleOutfitEvent(Event, e, outfit, data);
			}
		}
	}
}

/**
 *
 * @param {Character} C
 * @returns {string[]}
 */
function KDGetExtraPoses(C) {
	let poses = [];
	if (C == KinkyDungeonPlayer) {
		// For player
		if (KinkyDungeonPlayerTags.get("LinkFeet")) {
			poses.push("FeetLinked");
		}
		if (KinkyDungeonIsHandsBound()) {
			poses.push("HandsBound");
		}
		if (KDIsPlayerTethered(C) && KinkyDungeonLeashingEnemy()) {
			poses.push("Pulled");
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
	"Grabbed": {
		priority: 17,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && (KinkyDungeonFlags.get("grabbed"))) {
				return true;
			}
			return false;
		},
		expression: (C) => {
			return {
				EyesPose: "EyesSurprised",
				Eyes2Pose: "Eyes2Surprised",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "",
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
				MouthPose: "MouthDazed",
			};
		},
	},
	"Distracted": {
		stackable: true,
		priority: 1,
		criteria: (C) => {
			if (C == KinkyDungeonPlayer && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.1) {
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
				BlushPose: (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax*0.4) ? "BlushLow" : "BlushMedium",
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
	"Edged": {
		stackable: true,
		priority: 6,
		criteria: (C) => {
			return (C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Frustration > 0 && KDIsEdged(C));
		},
		expression: (C) => {
			return {
				EyesPose: "EyesDazed",
				Eyes2Pose: "Eyes2Dazed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "",
			};
		},
	},
	"Tormented": {
		stackable: true,
		priority: 7,
		criteria: (C) => {
			return (C == KinkyDungeonPlayer && KDIsEdged(C) && KinkyDungeonVibeLevel > 2);
		},
		expression: (C) => {
			return {
				EyesPose: "EyesDazed",
				Eyes2Pose: "Eyes2Dazed",
				BrowsPose: "BrowsSad",
				Brows2Pose: "Brows2Sad",
				BlushPose: "BlushExtreme",
				MouthPose: "",
			};
		},
	},
	"Frustrated": {
		stackable: true,
		priority: 2.25,
		criteria: (C) => {
			return (C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Frustration > -20 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.25) || KinkyDungeonFlags.get("escapeimpossible") > 0;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: KinkyDungeonGoddessRep.Frustration > 0 ? "BrowsAngry" : "BrowsSad",
				Brows2Pose: KinkyDungeonGoddessRep.Frustration > 0 ? "Brows2Angry" : "Brows2Sad",
				BlushPose: "",
				MouthPose: "",
			};
		},
	},
	"Struggling": {
		stackable: true,
		priority: 14,
		criteria: (C) => {
			return C == KinkyDungeonPlayer && KinkyDungeonFlags.get("escaping") > 0;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushHigh",
				MouthPose: "MouthPout",
			};
		},
	},
	"StrugglingLight": {
		stackable: true,
		priority: 6,
		criteria: (C) => {
			return C == KinkyDungeonPlayer && KinkyDungeonFlags.get("tryescaping") > 0;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "MouthPout",
			};
		},
	},
	"Picking": {
		stackable: true,
		priority: 13,
		criteria: (C) => {
			return C == KinkyDungeonPlayer && KinkyDungeonFlags.get("picking") > 0;
		},
		expression: (C) => {
			return {
				EyesPose: "EyesClosed",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "MouthPout",
			};
		},
	},
	"Unlocking": {
		stackable: true,
		priority: 12,
		criteria: (C) => {
			return C == KinkyDungeonPlayer && KinkyDungeonFlags.get("unlocking") > 0;
		},
		expression: (C) => {
			return {
				EyesPose: "EyesClosed",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "MouthEmbarrassed",
			};
		},
	},
	"Escaped": {
		stackable: true,
		priority: 20,
		criteria: (C) => {
			return C == KinkyDungeonPlayer && KinkyDungeonFlags.get("escaped") > 0;
		},
		expression: (C) => {
			return {
				EyesPose: "EyesNeutral",
				Eyes2Pose: "Eyes2Neutral",
				BrowsPose: "BrowsAngry",
				Brows2Pose: "Brows2Angry",
				BlushPose: "",
				MouthPose: "MouthSmile",
			};
		},
	},
	"FrustratedMouth": {
		stackable: true,
		priority: 0.25,
		criteria: (C) => {
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Frustration - KinkyDungeonGoddessRep.Passion > -25 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.25;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "MouthFrown",
			};
		},
	},
	"Passionate": {
		stackable: true,
		priority: 2.2,
		criteria: (C) => {
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Passion - KinkyDungeonGoddessRep.Frustration > -5 && KinkyDungeonGoddessRep.Passion > -30 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.25;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: KinkyDungeonGoddessRep.Passion - KinkyDungeonGoddessRep.Frustration > 25 ? "MouthSmile" : (KinkyDungeonGoddessRep.Passion - KinkyDungeonGoddessRep.Frustration > -25 ? "MouthEmbarrassed" : "MouthPout"),
			};
		},
	},
	"PassionateBlush1": {
		stackable: true,
		priority: 2.3,
		criteria: (C) => {
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Passion > -40 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.25;
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
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Passion > -10 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.5;
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
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Passion > 20 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.75;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushHigh",
				MouthPose: "MouthDistracted",
			};
		},
	},
	"PassionateBlush4": {
		stackable: true,
		priority: 10,
		criteria: (C) => {
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Passion > 40 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.5;
		},
		expression: (C) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushExtreme",
				MouthPose: "MouthDistracted",
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
	"Sleepy": {
		stackable: true,
		priority: 11,
		criteria: (C) => {
			return C == KinkyDungeonPlayer && KinkyDungeonSleepiness > 3.99;
		},
		expression: (C) => {
			return {
				EyesPose: "EyesClosed",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "",
			};
		},
	},
};

/**
 *
 * @param {Character} Character
 */
function KDUpdateTempPoses(Character) {
	KDRefreshPoseOptions(Character);
	// Append temp poses
	for (let pose of Object.keys(KDCurrentModels.get(Character).TempPoses)) {
		if (KDCurrentModels.get(Character).Poses[pose])
			delete KDCurrentModels.get(Character).TempPoses[pose];
		else
			KDCurrentModels.get(Character).Poses[pose] = true;
	}

	let extraPose = KDGetExtraPoses(Character);
	if (extraPose) {
		for (let pose of extraPose) {
			KDCurrentModels.get(Character).Poses[pose] = true;
		}
	}
}


function KDGetFactionFilters(faction) {
	if (KinkyDungeonFactionFilters[faction])
		return KinkyDungeonFactionFilters[faction];
	if (KDFactionProperties[faction]?.jailAlliedFaction && KinkyDungeonFactionFilters[KDFactionProperties[faction]?.jailAlliedFaction])
		return KinkyDungeonFactionFilters[KDFactionProperties[faction]?.jailAlliedFaction];
	return undefined;
}