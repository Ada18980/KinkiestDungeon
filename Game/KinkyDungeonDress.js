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

if (StandalonePatched) {
	KinkyDungeonDefaultDefaultDress = [
		//{Item: "RopeArms", Group: "ItemArms", Color: "Default", Lost: false},
		{Item: "Maid", Group: "Costume", Color: "Default", Lost: false},
		{Item: "MaidApron", Group: "Apron", Color: "Default", Lost: false},
		{Item: "Catsuit", Group: "Catsuit", Color: "Default", Lost: false},
	];
}

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

function KinkyDungeonSetDress(Dress, Outfit) {
	if (Outfit) KDGameData.Outfit = Outfit;
	KinkyDungeonCurrentDress = Dress;
	if (KDGetDressList()) {
		for (let clothes of KDGetDressList()[KinkyDungeonCurrentDress]) {
			clothes.Lost = false;
		}
		KinkyDungeonCheckClothesLoss = true;
		KinkyDungeonDressPlayer();
		KDRefresh = true;
	}
}

let KDNaked = false;
let KDRefresh = false;

/**
 * It sets the player's appearance based on their stats.
 */
function KinkyDungeonDressPlayer(Character) {
	if (!Character) Character = KinkyDungeonPlayer;

	let _CharacterRefresh = CharacterRefresh;
	let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
	// @ts-ignore
	CharacterRefresh = () => {KDRefresh = true;};
	// @ts-ignore
	CharacterAppearanceBuildCanvas = () => {};
	let restraints = [];

	try {
		let data = {
			updateRestraints: false,
			updateDress: false,
			updateExpression: false,
		};

		// @ts-ignore
		KinkyDungeonPlayer.OnlineSharedSettings = {BlockBodyCosplay: true};
		if (!KDNaked) KDCharacterNaked();

		// if true, nakeds the player, then reclothes
		if (KinkyDungeonCheckClothesLoss) {
			// We refresh all the restraints

			// First we remove all restraints and clothes
			let clothGroups = {};
			for (let cloth of KDGetDressList()[KinkyDungeonCurrentDress]) {
				clothGroups[cloth.Group || cloth.Item] = true;
			}
			let newAppearance = {};
			for (let A = 0; A < KinkyDungeonPlayer.Appearance.length; A++) {
				if (StandalonePatched) {
					let model = KinkyDungeonPlayer.Appearance[A].Model;
					if (!model.Group?.startsWith("Item") && !clothGroups[model.Group || model.Name]) {
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
			if (StandalonePatched) {
				if (!newAppearance.Body) newAppearance.Body = {Model: JSON.parse(JSON.stringify(ModelDefs.Body)), Group: "Body", Color: "Default"};
				if (!newAppearance.Eyes) newAppearance.Eyes = {Model: JSON.parse(JSON.stringify(ModelDefs.KoiEyes)), Group: "Eyes", Color: "Default"};
				if (!newAppearance.Brows) newAppearance.Brows = {Model: JSON.parse(JSON.stringify(ModelDefs.KoiBrows)), Group: "Brows", Color: "Default"};
				if (!newAppearance.Mouth) newAppearance.Mouth = {Model: JSON.parse(JSON.stringify(ModelDefs.KoiMouth)), Group: "Mouth", Color: "Default"};
				if (!newAppearance.Blush) newAppearance.Blush = {Model: JSON.parse(JSON.stringify(ModelDefs.KoiBlush)), Group: "Blush", Color: "Default"};
				if (!newAppearance.Hair) newAppearance.Hair = {Model: JSON.parse(JSON.stringify(ModelDefs.Braid)), Group: "Hair", Color: "Default"};
			}

			KinkyDungeonPlayer.Appearance = Object.values(newAppearance);

			//KinkyDungeonPlayer.Appearance = [];


			// Next we revisit all the player's restraints
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

			data.updateRestraints = true;
			KDNaked = true;
			KinkyDungeonUndress = 0;
		}

		let alreadyClothed = {};

		for (let A = 0; A < KinkyDungeonPlayer.Appearance.length; A++) {
			let asset = KinkyDungeonPlayer.Appearance[A].Asset;
			if (StandalonePatched) {
				// @ts-ignore
				if (KinkyDungeonPlayer.Appearance[A].Model?.Group)
					// @ts-ignore
					alreadyClothed[KinkyDungeonPlayer.Appearance[A].Model?.Group] = true;
			} else
				alreadyClothed[asset.Group.Name] = true;
		}

		for (let clothes of KDGetDressList()[KinkyDungeonCurrentDress]) {
			if (alreadyClothed[clothes.Group || clothes.Item]) continue;
			data.updateDress = true;
			if (!clothes.Lost && KinkyDungeonCheckClothesLoss) {
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
				for (let inv of KinkyDungeonAllRestraint()) {
					if (KDRestraint(inv).remove) {
						for (let remove of KDRestraint(inv).remove) {
							if (remove == clothes.Group) clothes.Lost = true;
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
					// @ts-ignore
					//KDCharacterAppearanceSetColorForGroup(KinkyDungeonPlayer, clothes.Color, clothes.Group);
				}
			}

			if (clothes.Group == "Panties" && !KinkyDungeonGetRestraintItem("ItemPelvis")) clothes.Lost = false; // A girl's best friend never leaves her
			if (clothes.Group == "Bra" && !KinkyDungeonGetRestraintItem("ItemBreast")) clothes.Lost = false; // A girl's best friend never leaves her
		}

		for (let inv of KinkyDungeonAllRestraint()) {
			if (KinkyDungeonCheckClothesLoss)
				if (KDRestraint(inv).AssetGroup && (!KDRestraint(inv).armor || KDToggles.DrawArmor)) {
					KDInventoryWear(KDRestraint(inv).Asset, KDRestraint(inv).AssetGroup, undefined, KDRestraint(inv).Color, KDRestraint(inv).Filters);
				}
		}
		if (KinkyDungeonCheckClothesLoss)
			KinkyDungeonWearForcedClothes(restraints);

		KinkyDungeonCheckClothesLoss = false;
		let AllowedArmPoses = KDGetAvailablePosesArms(KinkyDungeonPlayer);
		let AllowedLegPoses = KDGetAvailablePosesLegs(KinkyDungeonPlayer);

		if (KDGameData.KneelTurns > 0 || KDGameData.SleepTurns > 0) {
			if (StandalonePatched) {
				// Force player into being on the ground
				let newLegPoses = AllowedLegPoses.filter((element) => {return !STANDPOSES.includes(element);});
				if (newLegPoses.length > 0) AllowedLegPoses = newLegPoses;
			} else {
				if (CharacterItemsHavePoseAvailable(KinkyDungeonPlayer, "BodyLower", "Kneel") && !CharacterDoItemsSetPose(KinkyDungeonPlayer, "Kneel") && !KinkyDungeonPlayer.IsKneeling()) {
					CharacterSetActivePose(KinkyDungeonPlayer, "Kneel", false);
				}
			}

		} else if (KDGameData.SleepTurns < 1) {
			if (StandalonePatched) {
				// Nothing needed
			} else {
				if (CharacterItemsHavePoseAvailable(KinkyDungeonPlayer, "BodyLower", "Kneel") && !CharacterDoItemsSetPose(KinkyDungeonPlayer, "Kneel") && KinkyDungeonPlayer.IsKneeling()) {
					CharacterSetActivePose(KinkyDungeonPlayer, "BaseLower", false);
				}
			}

		}

		if (StandalonePatched) {
			// Pose set routine
			let ArmPose = KDGetPoseOfType(KinkyDungeonPlayer, "Arms");
			let LegPose = KDGetPoseOfType(KinkyDungeonPlayer, "Legs");
			let EyesPose = KDGetPoseOfType(KinkyDungeonPlayer, "Eyes");
			let Eyes2Pose = KDGetPoseOfType(KinkyDungeonPlayer, "Eyes2");
			let BrowsPose = KDGetPoseOfType(KinkyDungeonPlayer, "Brows");
			let Brows2Pose = KDGetPoseOfType(KinkyDungeonPlayer, "Brows2");
			let BlushPose = KDGetPoseOfType(KinkyDungeonPlayer, "Blush");
			let MouthPose = KDGetPoseOfType(KinkyDungeonPlayer, "Mouth");

			let DefaultBound = "Front"; // Default bondage for arms

			// Hold to player's preferred pose
			let PreferredArm = KDDesiredPlayerPose.Arms || "Free";
			let PreferredLeg = KDDesiredPlayerPose.Legs || "Spread";
			if (!AllowedArmPoses.includes(ArmPose) || (ArmPose != PreferredArm && AllowedArmPoses.includes(PreferredArm))) {
				ArmPose = (AllowedArmPoses.includes(DefaultBound) && KinkyDungeonIsArmsBound(false, false)) ? DefaultBound : AllowedArmPoses[0];
			}
			if (!AllowedLegPoses.includes(LegPose) || (LegPose != PreferredLeg && AllowedLegPoses.includes(PreferredLeg))) {
				LegPose = AllowedLegPoses[0];
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

			if (KDCurrentModels.get(KinkyDungeonPlayer))
				KDCurrentModels.get(KinkyDungeonPlayer).Poses = KDGeneratePoseArray(
					ArmPose,
					LegPose,
					EyesPose,
					BrowsPose,
					BlushPose,
					MouthPose,
					Eyes2Pose,
					Brows2Pose,
				);
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
		// @ts-ignore
		CharacterRefresh = _CharacterRefresh;
		// @ts-ignore
		CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
	}

	if (StandalonePatched && KDCurrentModels.get(Character))
		UpdateModels(KDCurrentModels.get(Character));
}

/**
 * Initializes protected groups like ears and tail
 */
function KDInitProtectedGroups() {
	KDProtectedCosplay = [];
	// init protected slots
	for (let a of KinkyDungeonPlayer.Appearance) {
		if (a.Asset?.Group?.BodyCosplay || a.Model?.Protected){
			KDProtectedCosplay.push(a.Asset.Group.Name);
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
 */
function KinkyDungeonWearForcedClothes(restraints) {
	if (!restraints) restraints = KinkyDungeonAllRestraint();
	for (let i = restraints.length - 1; i >= 0; i--) {
		let inv = restraints[i];
		if (KDRestraint(inv).alwaysDress) {
			KDRestraint(inv).alwaysDress.forEach(dress=>{ // for .. of  loop has issues with iterations
				if (dress.override || !dress.Group.includes("Item") || !InventoryGet(KinkyDungeonPlayer, dress.Group)) {
					let canReplace = (dress.override!==null && dress.override===true) ? true : !InventoryGet(KinkyDungeonPlayer,dress.Group);

					if (!canReplace) {return;}
					if (KDProtectedCosplay.includes(dress.Group)){return;}
					let filters = dress.Filters;
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
					// @ts-ignore
					if (dress.useHairColor && InventoryGet(KinkyDungeonPlayer, "HairFront")) color = InventoryGet(KinkyDungeonPlayer, "HairFront").Color;
					let item = KDInventoryWear(dress.Item, dress.Group, inv.name, color, filters);

					if (dress.OverridePriority) {
						if (item) {
							if (!item.Property) item.Property = {OverridePriority: dress.OverridePriority};
							else item.Property.OverridePriority = dress.OverridePriority;
						}
					}

					// @ts-ignore
					//KDCharacterAppearanceSetColorForGroup(KinkyDungeonPlayer, color, dress.Group);
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
 * @param {string} par - parent item
 * @param {string | string[]} color - parent item
 * @param {Record<string, LayerFilter>} filters - parent item
 */
function KDInventoryWear(AssetName, AssetGroup, par, color, filters) {
	const M = StandalonePatched ? ModelDefs[AssetName] : undefined;
	const A = StandalonePatched ? undefined : AssetGet(KinkyDungeonPlayer.AssetFamily, AssetGroup, AssetName);
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
				let f = !(KinkyDungeonPlayer.Appearance[A].Model.Group
					&& (KDProtectedCosplay.includes(KinkyDungeonPlayer.Appearance[A].Model.Group)));
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
			placed.Property = {Type: type, Modules: restraint.Modules, Difficulty: restraint.power, LockedBy: inv.lock ? "MetalPadlock" : undefined};

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
	// @ts-ignore
	let _ChatRoomCharacterUpdate = ChatRoomCharacterUpdate;
	// @ts-ignore
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
				// @ts-ignore
				placed.Property = ModularItemMergeModuleValues({ asset, modules }, restraint.Modules);
				placed.Property.LockedBy = inv.lock ? "MetalPadlock" : undefined;
			} else if (type) TypedItemSetOptionByName(KinkyDungeonPlayer, placed, type, false);
			if (restraint.OverridePriority) {
				placed.Property.OverridePriority = restraint.OverridePriority;
			}
		}
	} finally {
		// @ts-ignore
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

function KDGetAvailablePosesLegs(C) {
	/** @type {Record<string, boolean>} */
	let poses = {};
	for (let p of LEGPOSES) {
		poses[p] = true;
	}
	if (C == KinkyDungeonPlayer) {
		// Logic for the player
		if (KinkyDungeonPlayerTags.get("FeetLinked")) {
			delete poses.Spread;
		} else if (KinkyDungeonPlayerTags.get("ForceKneel")) {
			delete poses.Closed;
		}
		if (KinkyDungeonPlayerTags.get("ForceHogtie")) {
			for (let p of STANDPOSES) {
				delete poses[p];
			}
			for (let p of KNEELPOSES) {
				delete poses[p];
			}
		} else if (KinkyDungeonPlayerTags.get("ForceKneel")) {
			for (let p of STANDPOSES) {
				delete poses[p];
			}
		}
	} else {
		// Logic for NPC
		// ???
	}

	return Object.keys(poses);
}


function KDGetAvailablePosesArms(C) {
	/** @type {Record<string, boolean>} */
	let poses = {};
	for (let p of ARMPOSES) {
		poses[p] = true;
	}
	if (C == KinkyDungeonPlayer) {
		// Logic for the player
		if (KinkyDungeonPlayerTags.get("Yokes")) {
			poses = {Yoked: true};
		} else if (KinkyDungeonPlayerTags.get("Armbinders")) {
			poses = {Wristtie: true};
		} else if (KinkyDungeonPlayerTags.get("Boxbinders")) {
			poses = {Boxtie: true};
		} else if (KinkyDungeonPlayerTags.get("Straitjackets")) {
			poses = {Boxtie: true};
		} else if (KinkyDungeonPlayerTags.get("Boxties")) {
			poses = {Boxtie: true};
		} else if (KinkyDungeonPlayerTags.get("Wristties")) {
			poses = {Wristtie: true};
		}
		if (KinkyDungeonIsArmsBound(false, false)) {
			delete poses.Free;
			if (!KinkyDungeonPlayerTags.get("HandsFront")) {
				delete poses.HandsFront;
			}
			if (!KinkyDungeonPlayerTags.get("Yoked")) {
				delete poses.Yoked;
			}
		}
	} else {
		// Logic for NPC
		// ???
	}

	return Object.keys(poses);
}

/** @type {Record<string, KDExpression>} */
let KDExpressions = {
	"OrgSuccess": {
		priority: 10,
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