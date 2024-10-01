"use strict";

let KDNaughtySetting = false;

// For cacheing
let KinkyDungeonOutfitCache = new Map();

/** Contains protected zones */
let KDProtectedCosplay: string[] = [];

/**
 * @param item
 */
function KDOutfit(item: Named): outfit {
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
 */
let KDClothOverrides: Record<string, Record<string, number>> = {
	"Cloth": {
		"SleevelessTop": 24.9,
	},
};

// Default dress (witch hat and skirt and corset)
let KinkyDungeonDefaultDefaultDress: KinkyDungeonDress = [
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
	KDRefreshCharacter.set(KinkyDungeonPlayer, true);
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
function KinkyDungeonDressSet(C?: Character) {
	if (KinkyDungeonNewDress) {
		KDGetDressList().Default = [];
		if (!C) C = KinkyDungeonPlayer;

		for (let A = 0; A < C.Appearance.length; A++) {
			let save = false;
			if (StandalonePatched) {
				if (C.Appearance[A].Model && KDModelIsProtected(C.Appearance[A].Model)) save = true;
				if (!C.Appearance[A].Model?.Restraint) save = true;
				if (save) {
					KDGetDressList().Default.push({
						Item: C.Appearance[A].Model?.Name || C.Appearance[A].Asset?.Name,
						Group: C.Appearance[A].Model?.Group,
						Filters: C.Appearance[A].Model?.Filters,
						Properties: C.Appearance[A].Model?.Properties,
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

function KinkyDungeonSetDress(Dress: string, Outfit?: string, Character?: Character, NoRestraints?: boolean) {
	if (!Character || Character == KinkyDungeonPlayer) {
		if (Outfit) KDGameData.Outfit = Outfit;
		KinkyDungeonCurrentDress = Dress;
	}
	KDCharacterDress.set(Character, Dress);
	if (KDGetDressList()) {
		if (!Character || Character == KinkyDungeonPlayer) {
			for (let clothes of KDGetDressList()[KinkyDungeonCurrentDress]) {
				clothes.Lost = false;
			}
		}
		//KinkyDungeonCheckClothesLoss = true;
		KDRefreshCharacter.set(Character || KinkyDungeonPlayer, true);
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
 *
 * @param [Character]
 * @param [NoRestraints]
 * @param [Force]
 * @param [npcRestraints]
 * @param [customInventory]
 * @param [customPlayerTags]
 * @param [customFaction]
 * @param [noDressOutfit]
 */
function KinkyDungeonDressPlayer (
	Character?:         Character,
	NoRestraints?:      boolean,
	Force?:             boolean,
	npcRestraints?:     Record<string, NPCRestraint>,
	customInventory?:   item[],
	customPlayerTags?:  Map<string, boolean>,
	customFaction?:     string,
	noDressOutfit?:     boolean
)
{
	if (!Character) Character = KinkyDungeonPlayer;

	let _CharacterRefresh = CharacterRefresh;
	let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
	CharacterRefresh = () => {KDRefresh = true;};
	CharacterAppearanceBuildCanvas = () => {};
	let restraints: item[] = [];

	if (StandalonePatched) {
		AppearanceCleanup(Character);
	}

	let restraintModels = {};

	let CurrentDress = Character == KinkyDungeonPlayer ? KinkyDungeonCurrentDress
		: (Character == KDPreviewModel ? KinkyDungeonCurrentDress : (KDCharacterDress.get(Character) || "Bandit"));
	let DressList = noDressOutfit ? [] : KDGetDressList()[CurrentDress];

	if (!noDressOutfit && KDNPCStyle.get(Character)?.customOutfit) {
		DressList = [];
		for (let a of JSON.parse(DecompressB64(KDNPCStyle.get(Character)?.customOutfit))) {
			if (a.Model && !KDModelIsProtected(a.Model) && !a.Model.Restraint && !a.Model.Cosplay) {
				DressList.push({
					Item: a.Model.Name || a.Model,
					Group: a.Model.Group || a.Model.Name || a.Model,
					Color: "#ffffff",
					Lost: false,
					Filters: a.Model.Filters || a.Filters,
					Properties: a.Model.Properties || a.Properties,
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
			extraForceDress: undefined,
			Wornitems: KDGetCharacterID(Character) && KDGameData.NPCRestraints[KDGetCharacterID(Character)] ?
				Object.values(KDGameData.NPCRestraints[KDGetCharacterID(Character)])
					.filter((rest) => {return rest.events})
					.map((rest) => {return rest.id;})
			: [],
			NPCRestraintEvents: KDGetCharacterID(Character) ?
				KDGameData.NPCRestraints[KDGetCharacterID(Character)]
				: undefined,
		};

		if (KinkyDungeonCheckClothesLoss) KDRefreshCharacter.set(Character, true);

		// if true, nakeds the player, then reclothes
		if (KDRefreshCharacter.get(Character)) {


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
						|| KDModelIsProtected(model) || model.SuperProtected)) {
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

			let tags = Character == KinkyDungeonPlayer ? customPlayerTags || KinkyDungeonPlayerTags : new Map();

			// Next we revisit all the player's restraints
			if (!NoRestraints) {
				if (Character == KinkyDungeonPlayer || customInventory) {
					for (let inv of (customInventory || KinkyDungeonAllRestraint())) {
						// Skip invalid restraints!!!
						let renderTypes = KDRestraint(inv).shrine;
						if (!(!KDRestraint(inv) || (KDRestraint(inv).armor && !KDToggles.DrawArmor))) {
							if (!KDRestraint(inv).hideTags || KDRestraint(inv).hideTags.some((tag) => {return tags.get(tag) == true;})) {
								KDApplyItem(Character, inv, customPlayerTags || KinkyDungeonPlayerTags, customFaction);
								if (KDRestraint(inv).Model) {

									restraintModels[KDRestraint(inv).Model] = true;
									restraintModels["Fashion" + KDRestraint(inv).Model] = true;
								}
							}
							restraints.push(inv);
						} else renderTypes = [];
						if (inv.dynamicLink) {
							let accessible = KDRestraint(inv)?.accessible || KDRestraint(inv)?.UnderlinkedAlwaysRender;
							let link = inv.dynamicLink;
							for (let I = 0; I < 30; I++) {
								if (accessible || KDRestraint(link).alwaysRender || (KDRestraint(link).renderWhenLinked && KDRestraint(link).renderWhenLinked.some((element) => {return renderTypes.includes(element);}))) {
									if (!KDRestraint(inv).hideTags || KDRestraint(inv).hideTags.some((tag) => {return tags.get(tag) == true;})) {
										KDApplyItem(Character, link, customPlayerTags || KinkyDungeonPlayerTags, customFaction);

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
				} else if (npcRestraints) {
					let ids = {};
					for (let inv of Object.values(npcRestraints)) {
						if (!KDRestraint(inv)) continue; // Skip invalid restraints!!!
						if (ids[inv.id]) continue;
						ids[inv.id] = true; // No dupe

						if (!KDRestraint(inv).hideTags || KDRestraint(inv).hideTags.some((tag) => {return tags.get(tag) == true;})) {
							KDApplyItem(Character, inv, NPCTags.get(Character) || new Map(), customFaction);
							if (KDRestraint(inv).Model) {

								restraintModels[KDRestraint(inv).Model] = true;
								restraintModels["Fashion" + KDRestraint(inv).Model] = true;
							}
						}
						restraints.push({
							name: inv.name,
							id: -1,
							type: Restraint
						});
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
				if (StandalonePatched && !clothes.Lost && KDRefreshCharacter.get(Character)) {
					if (clothes.Item && (restraintModels[clothes.Item] || restraintModels[clothes.Item + "Restraint"])) {
						clothes.Lost = true;
					} else if (IsModelLost(Character, clothes.Item))
						clothes.Lost = true;
				}
				if (alreadyClothed[clothes.Group || clothes.Item]) continue;
				data.updateDress = true;
				if (!clothes.Lost && KDRefreshCharacter.get(Character)) {



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
						if (Character == KinkyDungeonPlayer) {
							for (let entry of KinkyDungeonAllRestraintDynamic()) {
								let inv = entry.item;
								if (KDRestraint(inv)?.remove && (!KDRestraint(inv).armor || KDToggles.DrawArmor)) {
									for (let remove of KDRestraint(inv).remove) {
										if (remove == clothes.Group) clothes.Lost = true;
										if (StandalonePatched && ModelDefs[clothes.Item]?.Categories?.includes(remove)) clothes.Lost = true;
									}
								}
							}
						}
					}

					if (clothes.Lost) KinkyDungeonUndress += 1/DressList.length;
				}

				if (!clothes.Lost) {
					if (KDRefreshCharacter.get(Character)) {
						let item = KDInventoryWear(Character, clothes.Item, clothes.Group, undefined, clothes.Color, clothes.Filters, clothes.Properties);
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
				if (KDRefreshCharacter.get(Character)) {
					KDInventoryWear(Character, clothes.Item, clothes.Group, undefined, clothes.Color, clothes.Filters, clothes.Properties);
					alreadyClothed[clothes.Group || clothes.Item] = true;
				}
				//}

			}
		}

		if (!NoRestraints) {
			if (KDRefreshCharacter.get(Character)) {
				data.extraForceDress = [];
				KinkyDungeonSendEvent("beforeDressRestraints", data);
				KinkyDungeonWearForcedClothes(Character, restraints, data.extraForceDress);
				KinkyDungeonSendEvent("dressRestraints", data);
			}
		}

		// Apply poses from restraints
		if (StandalonePatched && KDCurrentModels.get(Character)) {
			RefreshTempPoses(Character, true);
			KDRefreshPoseOptions(Character);
		}



		let AllowedArmPoses = StandalonePatched ? KDGetAvailablePosesArms(Character, customPlayerTags) : [];
		let AllowedLegPoses = StandalonePatched ? KDGetAvailablePosesLegs(Character, customPlayerTags) : [];

		if (Character == KinkyDungeonPlayer) {
			if (KDGameData.KneelTurns > 0 || KDGameData.SleepTurns > 0) {
				if (StandalonePatched) {
					// Force player into being on the ground
					let newLegPoses = AllowedLegPoses.filter((element) => {return !STANDPOSES.includes(element);});
					if (newLegPoses.length > 0) AllowedLegPoses = newLegPoses;
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
			let PreferredArm = NPCDesiredPoses.get(Character)?.Arms || "Free";
			let PreferredLeg = NPCDesiredPoses.get(Character)?.Legs || "Spread";

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


			let expression: KDExpression = null;
			let stackedPriorities: Record<string, number> = {};
			let flags = KDGetEntityFlags(Character);
			for (let e of Object.entries(KDExpressions)) {
				if (!expression || e[1].priority > expression.priority) {
					if (e[1].criteria(Character, flags)) {
						expression = e[1];
					}
				}
				if (e[1].stackable) {
					if (!e[1].criteria(Character, flags)) continue;
					let result = null;
					if (e[1].priority > (stackedPriorities.EyesPose || 0)) {
						result = result || e[1].expression(Character, flags);
						if (result.EyesPose) {
							stackedPriorities.EyesPose = e[1].priority;
							if (!KDNPCPoses.get(Character)?.CurrentPoseEyes) EyesPose = result.EyesPose;
						}
					}
					if (e[1].priority > (stackedPriorities.Eyes2Pose || 0)) {
						result = result || e[1].expression(Character, flags);
						if (result.Eyes2Pose) {
							stackedPriorities.Eyes2Pose = e[1].priority;
							if (!KDNPCPoses.get(Character)?.CurrentPoseEyes2) Eyes2Pose = result.Eyes2Pose;
						}
					}
					if (e[1].priority > (stackedPriorities.BrowsPose || 0)) {
						result = result || e[1].expression(Character, flags);
						if (result.BrowsPose) {
							stackedPriorities.BrowsPose = e[1].priority;
							if (!KDNPCPoses.get(Character)?.CurrentPoseBrows) BrowsPose = result.BrowsPose;
						}
					}
					if (e[1].priority > (stackedPriorities.Brows2Pose || 0)) {
						result = result || e[1].expression(Character, flags);
						if (result.Brows2Pose) {
							stackedPriorities.Brows2Pose = e[1].priority;
							if (!KDNPCPoses.get(Character)?.CurrentPoseBrows2) Brows2Pose = result.Brows2Pose;
						}
					}
					if (e[1].priority > (stackedPriorities.BlushPose || 0)) {
						result = result || e[1].expression(Character, flags);
						if (result.BlushPose) {
							stackedPriorities.BlushPose = e[1].priority;
							if (!KDNPCPoses.get(Character)?.CurrentPoseBlush) BlushPose = result.BlushPose;
						}
					}
					if (e[1].priority > (stackedPriorities.MouthPose || 0)) {
						result = result || e[1].expression(Character, flags);
						if (result.MouthPose) {
							stackedPriorities.MouthPose = e[1].priority;
							if (!KDNPCPoses.get(Character)?.CurrentPoseMouth) MouthPose = result.MouthPose;
						}
					}
				}
			}
			if (expression) {
				let result = expression.expression(Character, flags);
				if (!KDNPCPoses.get(Character)?.CurrentPoseEyes && result.EyesPose) EyesPose = result.EyesPose;
				if (!KDNPCPoses.get(Character)?.CurrentPoseEyes2 && result.Eyes2Pose) Eyes2Pose = result.Eyes2Pose;
				if (!KDNPCPoses.get(Character)?.CurrentPoseBrows && result.BrowsPose) BrowsPose = result.BrowsPose;
				if (!KDNPCPoses.get(Character)?.CurrentPoseBrows2 && result.Brows2Pose) Brows2Pose = result.Brows2Pose;
				if (!KDNPCPoses.get(Character)?.CurrentPoseBlush && result.BlushPose) BlushPose = result.BlushPose;
				if (!KDNPCPoses.get(Character)?.CurrentPoseMouth && result.MouthPose) MouthPose = result.MouthPose;
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
		if (KDRefreshCharacter.get(Character) || Character == KinkyDungeonPlayer || Character == KDSpeakerNPC)
			UpdateModels(Character, Xray);
		let ReUpdate = false;

		let hairstyle = KDNPCStyle.get(Character)?.hairstyle || "Default";
		let bodystyle = KDNPCStyle.get(Character)?.bodystyle || "Default";
		let facestyle = KDNPCStyle.get(Character)?.facestyle || "Default";
		let cosplaystyle = KDNPCStyle.get(Character)?.cosplaystyle || "Default";

		if (!KDCurrentModels.get(Character)?.Poses?.Body && KDModelBody[bodystyle]) {
			for (let body of Object.values(KDModelBody[bodystyle])) {
				KDInventoryWear(Character, body.Item, undefined, undefined, undefined, body.Filters, body.Properties);
				ReUpdate = true;
			}
		}
		if (!KDCurrentModels.get(Character)?.Poses?.Eyes && KDModelFace[facestyle]) {
			for (let face of Object.values(KDModelFace[facestyle])) {
				KDInventoryWear(Character, face.Item, undefined, undefined, undefined, face.Filters, face.Properties);
				ReUpdate = true;
			}
		}
		if (!KDCurrentModels.get(Character)?.Poses?.Hair && KDModelHair[hairstyle]) {
			for (let hair of Object.values(KDModelHair[hairstyle])) {
				KDInventoryWear(Character, hair.Item, undefined, undefined, undefined, hair.Filters, hair.Properties);
				ReUpdate = true;
			}
		}
		if (!KDCurrentModels.get(Character)?.Poses?.Cosplay && KDModelCosplay[cosplaystyle]) {
			for (let cosplay of Object.values(KDModelCosplay[cosplaystyle])) {
				KDInventoryWear(Character, cosplay.Item, undefined, undefined, undefined, cosplay.Filters, cosplay.Properties);
				ReUpdate = true;
			}
		}

		if (KDRefreshCharacter.get(Character) || Character == KinkyDungeonPlayer || Character == KDSpeakerNPC)
			if (ReUpdate) UpdateModels(Character, Xray);
		if (Force) {
			ForceRefreshModels(Character);
		}

		KinkyDungeonCheckClothesLoss = false;
		KDRefreshCharacter.delete(Character);
	}
}

let KDRefreshCharacter = new Map();

/**
 * Initializes protected groups like ears and tail
 * @param C
 */
function KDInitProtectedGroups(C: Character) {
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
 * @param C
 * @param [restraints]
 * @param [extraForceDress]
 */
function KinkyDungeonWearForcedClothes(C: Character, restraints?: item[], extraForceDress?: alwaysDressModel[]) {
	if (!C) C = KinkyDungeonPlayer;

	for (let dress of extraForceDress) {
		let canReplace = (dress.override!==null && dress.override===true) ? true : !InventoryGet(C,dress.Group);

		if (dress.Group && !canReplace) {return;}
		if (dress.Group && C == KinkyDungeonPlayer && KDProtectedCosplay.includes(dress.Group)){return;}
		let filters =  dress.Filters ? JSON.parse(JSON.stringify(dress.Filters)) : {};
		let Properties =  dress.Properties ? JSON.parse(JSON.stringify(dress.Properties)) : {};
		let faction = dress.faction;
		if (dress.faction) {
			if (StandalonePatched) {
				if (dress.factionFilters && faction && KDGetFactionFilters(faction)) {
					for (let f of Object.entries(dress.factionFilters)) {
						if (KDGetFactionFilters(faction)[f[1].color])
							filters[f[0]] = KDGetFactionFilters(faction)[f[1].color]; // 0 is the primary color
					}
				}
			}
		}
		KDInventoryWear(C, dress.Model, undefined, undefined, undefined, filters, Properties);
	}


	if (!restraints) restraints = C == KinkyDungeonPlayer ? KinkyDungeonAllRestraint() : [];
	for (let i = restraints.length - 1; i >= 0; i--) {
		let inv = restraints[i];

		if (StandalonePatched && KDRestraint(inv)?.alwaysDressModel) {
			KDRestraint(inv).alwaysDressModel.forEach(dress=>{ // for .. of  loop has issues with iterations
				let canReplace = (dress.override!==null && dress.override===true) ? true : !InventoryGet(C,dress.Group);

				if (dress.Group && !canReplace) {return;}
				if (dress.Group && C == KinkyDungeonPlayer && KDProtectedCosplay.includes(dress.Group)){return;}
				let filters =  dress.Filters ? JSON.parse(JSON.stringify(dress.Filters)) : {};
				let Properties =  dress.Properties ? JSON.parse(JSON.stringify(dress.Properties)) : {};
				let faction = inv.faction || dress.faction;
				if (faction) {
					if (dress.factionFilters && faction && KDGetFactionFilters(faction)) {
						for (let f of Object.entries(dress.factionFilters)) {
							if (KDGetFactionFilters(faction)[f[1].color])
								filters[f[0]] = KDGetFactionFilters(faction)[f[1].color]; // 0 is the primary color
						}
					}
				}
				KDInventoryWear(C, dress.Model, undefined, undefined, undefined, dress.inheritFilters ? KDRestraint(inv).Filters : (filters), Properties);
			});
		}
	}
}
function KDCharacterAppearanceSetColorForGroup(Player: Character, Color: ItemColor, Group: string) {
	let item = InventoryGet(Player, Group);
	if (item) {
		item.Color = Color;
	}
}

function KinkyDungeonGetOutfit(Name: string): any {
	if (KinkyDungeonOutfitCache && KinkyDungeonOutfitCache.get(Name)) {
		let outfit = {};
		Object.assign(outfit, KinkyDungeonOutfitCache.get(Name));
		return outfit;
	}
	return null;
}


/**
 * Makes the KinkyDungeonPlayer wear an item on a body area
 * @param Character
 * @param AssetName - The name of the asset to wear
 * @param AssetGroup - The name of the asset group to wear
 * @param [par] - parent item
 * @param [color] - parent item
 * @param [filters] - parent item
 * @param [Properties] - parent item
 */
function KDInventoryWear(Character: Character, AssetName: string, AssetGroup: string, _par?: string, color?: ItemColor, filters?: Record<string, LayerFilter>, Properties?: Record<string, LayerProperties>): Item {
	const M = StandalonePatched ? ModelDefs[AssetName] : undefined;
	if (!M) return;
	let item = KDAddModel(Character, AssetGroup, M, color || "Default", filters, undefined, Properties);
	//CharacterAppearanceSetItem(KinkyDungeonPlayer, AssetGroup, A, color || A.DefaultColor,0,-1, false);
	CharacterRefresh(Character, true);
	return item;
}

function KDCharacterNaked(Character: Character) {
	if (!Character) Character = KinkyDungeonPlayer;
	KDCharacterAppearanceNaked(Character);
	CharacterRefresh(Character);
}

/**
 * Removes all items that can be removed, making the player naked. Checks for a blocking of CosPlayItem removal.
 * @param C
 */
function KDCharacterAppearanceNaked(C: Character): void {
	// For each item group (non default items only show at a 20% rate)
	for (let A = C.Appearance.length - 1; A >= 0; A--) {
		if (StandalonePatched) {
			if (!C.Appearance[A].Model.Restraint){
				// conditional filter
				let f = !(C.Appearance[A]?.Model
					&& ((C == KinkyDungeonPlayer &&
						KDProtectedCosplay.includes(C.Appearance[A].Model.Group))
						|| KDModelIsProtected(C.Appearance[A].Model)
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
 * @param C
 * @param inv
 * @param tags
 * @param customFaction
 */
function KDApplyItem(C: Character, inv: any, tags: any, customFaction: string = undefined): void {
	if (StandalonePatched) {
		let restraint = KDRestraint(inv);
		let AssetGroup = restraint.AssetGroup ? restraint.AssetGroup : restraint.Group;
		let faction = customFaction ? customFaction : inv.faction ? inv.faction : "";

		// faction color system
		let filters =  (restraint.Filters || (ModelDefs[restraint.Model || restraint.Asset])?.Filters) ?
			JSON.parse(JSON.stringify(restraint.Filters || (ModelDefs[restraint.Model || restraint.Asset])?.Filters))
			: {};
		let Properties =  (restraint.Properties || (ModelDefs[restraint.Model || restraint.Asset])?.Properties) ?
			JSON.parse(JSON.stringify(restraint.Properties || (ModelDefs[restraint.Model || restraint.Asset])?.Properties))
			: {};


		if (restraint.factionFilters && faction && KDGetFactionFilters(faction)) {
			for (let f of Object.entries(restraint.factionFilters)) {
				if (KDGetFactionFilters(faction)[f[1].color]) {
					if (f[1].override) {
						filters[f[0]] = KDGetFactionFilters(faction)[f[1].color];
					} else {
						let origFilters = filters[f[0]];
						if (!filters[f[0]]) filters[f[0]] = {};
						filters[f[0]].saturation = 0;
						filters[f[0]].constrast = (origFilters)
							? origFilters.contrast : 1;
						filters[f[0]].gamma = (origFilters)
							? origFilters.gamma : 1;
						filters[f[0]].brightness = (origFilters)
							? origFilters.brightness : 1;
						filters[f[0]].red = KDGetFactionFilters(faction)[f[1].color].red;
						filters[f[0]].blue = KDGetFactionFilters(faction)[f[1].color].blue;
						filters[f[0]].green = KDGetFactionFilters(faction)[f[1].color].green;
					}
				}
			}
		}

		let data = {
			Filters: filters,
			Properties: Properties,
			faction: faction,
			Character: C,
			Wornitems: KDGetCharacterID(C) && KDGameData.NPCRestraints[KDGetCharacterID(C)] ?
				Object.values(KDGameData.NPCRestraints[KDGetCharacterID(C)])
					.filter((rest) => {return rest.events})
					.map((rest) => {return rest.id;})
				: [],
			NPCRestraintEvents: KDGetCharacterID(C) ?
				KDGameData.NPCRestraints[KDGetCharacterID(C)]
				: undefined,
		};
		KinkyDungeonSendEvent("apply", data);

		//let already = InventoryGet(C, AssetGroup);
		//let difficulty = already?.Property?.Difficulty || 0;

		let placed: Item = null;

		if (!restraint.armor || KDToggles.DrawArmor) {
			placed = KDAddModel(C, AssetGroup, ModelDefs[restraint.Model || restraint.Asset], "", data.Filters, inv, data.Properties);
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
	}
}


function KinkyDungeonSendOutfitEvent(Event: string, data: any) {
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
 * @param C
 */
function KDGetExtraPoses(C: Character): string[] {
	let poses = [];
	if (C == KinkyDungeonPlayer) {
		// For player
		if (KinkyDungeonPlayerTags.get("LinkFeet")) {
			poses.push("FeetLinked");
		}
		if (KinkyDungeonIsHandsBound()) {
			poses.push("HandsBound");
		}
		if (KDIsPlayerTethered(KDPlayer()) && KinkyDungeonLeashingEnemy()) {
			poses.push("Pulled");
		}
	} else {
		// For NPC
		// ???
	}
	return poses;
}


/**
 * @param C
 */
function KDGetEntityFlags(C: Character): Map<string, number> {
	let flags: Map<string, number> = new Map();

	if (C == KinkyDungeonPlayer) {
		for (let flag of KinkyDungeonFlags.entries()) {
			flags.set(flag[0], flag[1]);
		}
	} else {
		let flgs: Record<string, number> = {};
		let id = KDGetCharacterID(C);
		if (id) {
			let entity = KinkyDungeonFindID(id);
			if (!entity && KDGameData.Collection["" + id]) {
				flgs = KDGameData.Collection["" + id].flags;
			} else if (entity) flgs = entity.flags || {};
		}
		if (flgs)
			for (let flag of Object.entries(flgs)) {
				flags.set(flag[0], flag[1]);
			}
	}

	return flags;
}

/**
 * @param Character
 */
function KDUpdateTempPoses(Character: Character) {
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


function KDGetFactionFilters(faction: string): Record<string, LayerFilter> {
	if (KinkyDungeonFactionFilters[faction])
		return KinkyDungeonFactionFilters[faction];
	if (KDFactionProperties[faction]?.jailAlliedFaction && KinkyDungeonFactionFilters[KDFactionProperties[faction]?.jailAlliedFaction])
		return KinkyDungeonFactionFilters[KDFactionProperties[faction]?.jailAlliedFaction];
	return undefined;
}
