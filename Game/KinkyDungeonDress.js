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

// Return all dresses so theres no longer any Lost items
function KinkyDungeonInitializeDresses() {
	KinkyDungeonCheckClothesLoss = true;
	KinkyDungeonUndress = 0;
	if (Object.values(KinkyDungeonDresses).length > 0) {
		for (let d of Object.values(KinkyDungeonDresses)) {
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
		KinkyDungeonDresses.Default = [];
		let C = KinkyDungeonPlayer;
		for (let A = 0; A < C.Appearance.length; A++) {
			let save = false;
			if (C.Appearance[A].Asset.Group.BodyCosplay || C.Appearance[A].Asset.BodyCosplay) save = true;
			else if (C.Appearance[A].Asset.Group.Underwear) save = true;
			else if (C.Appearance[A].Asset.Group.Clothing) save = true;
			if (save) {
				KinkyDungeonDresses.Default.push({
					Item: C.Appearance[A].Asset.Name,
					Group: C.Appearance[A].Asset.Group.Name,
					Color: (C.Appearance[A].Color) ? C.Appearance[A].Color : (C.Appearance[A].Asset.DefaultColor ? C.Appearance[A].Asset.DefaultColor : "Default"),
					Lost: false,
				},);
			}
		}
	}
	KinkyDungeonNewDress = false;
}

function KinkyDungeonSetDress(Dress, Outfit) {
	if (Outfit) KDGameData.Outfit = Outfit;
	KinkyDungeonCurrentDress = Dress;
	if (KinkyDungeonDresses) {
		for (let clothes of KinkyDungeonDresses[KinkyDungeonCurrentDress]) {
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
function KinkyDungeonDressPlayer() {
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

			// First we remove all restraints
			for (let A = 0; A < KinkyDungeonPlayer.Appearance.length; A++) {
				let asset = KinkyDungeonPlayer.Appearance[A].Asset;
				if (asset.Group.Name.startsWith("Item")) {
					KinkyDungeonPlayer.Appearance.splice(A, 1);
					A -= 1;
				}
			}


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

		for (let clothes of KinkyDungeonDresses[KinkyDungeonCurrentDress]) {
			data.updateDress = true;
			if (!clothes.Lost && KinkyDungeonCheckClothesLoss) {
				if (clothes.Group == "Necklace") {
					if (KinkyDungeonGetRestraintItem("ItemTorso") && KDRestraint(KinkyDungeonGetRestraintItem("ItemTorso")).harness) clothes.Lost = true;
					if (KinkyDungeonGetRestraintItem("ItemArms") && InventoryGroupIsBlockedForCharacter(KinkyDungeonPlayer, "ItemBreast")) clothes.Lost = true;
				}
				//if (clothes.Group == "Bra" && !clothes.NoLose) {
				//if (KinkyDungeonGetRestraintItem("ItemBreast")) clothes.Lost = true;
				//}
				if (clothes.Group == "Panties" && !clothes.NoLose) {
					if (KinkyDungeonGetRestraintItem("ItemPelvis") && KinkyDungeonGetRestraintItem("ItemPelvis") && KDRestraint(KinkyDungeonGetRestraintItem("ItemPelvis")).chastity) clothes.Lost = true;
				}
				if (clothes.Group == "ClothLower" && clothes.Skirt) {
					if (KinkyDungeonGetRestraintItem("ItemPelvis")) clothes.Lost = true;
					if (InventoryGroupIsBlockedForCharacter(KinkyDungeonPlayer, "ItemLegs")) clothes.Lost = true;
					if (InventoryGroupIsBlockedForCharacter(KinkyDungeonPlayer, "ClothLower")) clothes.Lost = true;
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

				if (clothes.Lost) KinkyDungeonUndress += 1/KinkyDungeonDresses[KinkyDungeonCurrentDress].length;
			}

			if (!clothes.Lost) {
				if (KinkyDungeonCheckClothesLoss) {
					InventoryWear(KinkyDungeonPlayer, clothes.Item, clothes.Group);
					if (clothes.OverridePriority) {
						let item = InventoryGet(KinkyDungeonPlayer, clothes.Group);
						if (item) {
							if (!item.Property) item.Property = {OverridePriority: clothes.OverridePriority};
							else item.Property.OverridePriority = clothes.OverridePriority;
						}
					} else if (KDClothOverrides[clothes.Group] && KDClothOverrides[clothes.Group][clothes.Item] != undefined) {
						let item = InventoryGet(KinkyDungeonPlayer, clothes.Group);
						if (!item.Property) item.Property = {OverridePriority: KDClothOverrides[clothes.Group][clothes.Item]};
						else item.Property.OverridePriority = KDClothOverrides[clothes.Group][clothes.Item];
					}
					// Ignored because BC uses string[] as a type!
					// @ts-ignore
					KDCharacterAppearanceSetColorForGroup(KinkyDungeonPlayer, clothes.Color, clothes.Group);
				}
			}

			if (clothes.Group == "Panties" && !KinkyDungeonGetRestraintItem("ItemPelvis")) clothes.Lost = false; // A girl's best friend never leaves her
			if (clothes.Group == "Bra" && !KinkyDungeonGetRestraintItem("ItemBreast")) clothes.Lost = false; // A girl's best friend never leaves her
		}

		for (let inv of KinkyDungeonAllRestraint()) {
			if (KinkyDungeonCheckClothesLoss)
				if (KDRestraint(inv).AssetGroup) {
					InventoryWear(KinkyDungeonPlayer, KDRestraint(inv).Asset, KDRestraint(inv).AssetGroup, KDRestraint(inv).Color);
				}
		}
		if (KinkyDungeonCheckClothesLoss)
			KinkyDungeonWearForcedClothes(restraints);

		KinkyDungeonCheckClothesLoss = false;

		if (KDGameData.KneelTurns > 0 || KDGameData.SleepTurns > 0) {
			if (CharacterItemsHavePoseAvailable(KinkyDungeonPlayer, "BodyLower", "Kneel") && !CharacterDoItemsSetPose(KinkyDungeonPlayer, "Kneel") && !KinkyDungeonPlayer.IsKneeling()) {
				CharacterSetActivePose(KinkyDungeonPlayer, "Kneel", false);
			}
		} else if (KDGameData.SleepTurns < 1) {
			if (CharacterItemsHavePoseAvailable(KinkyDungeonPlayer, "BodyLower", "Kneel") && !CharacterDoItemsSetPose(KinkyDungeonPlayer, "Kneel") && KinkyDungeonPlayer.IsKneeling()) {
				CharacterSetActivePose(KinkyDungeonPlayer, "BaseLower", false);
			}
		}

		let BlushCounter = 0;
		let Blush = "";
		let Eyes = "";
		let Eyes2 = "";
		let Eyebrows = "";
		let Mouth = "";
		let Fluids = "";

		if (KinkyDungeonDrool && !KinkyDungeonCanTalk()) {
			if (SpeechGetTotalGagLevel(KinkyDungeonPlayer) > 8) Fluids = "DroolMessy";
			else if (SpeechGetTotalGagLevel(KinkyDungeonPlayer) > 4) Fluids = "DroolMedium";
			else Fluids = "DroolLow";
		}
		if (KinkyDungeonDrool && KDGameData.KinkyDungeonLeashedPlayer > 0) {
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

		KinkyDungeonSendEvent("afterDress", data);
	} finally {
		// @ts-ignore
		CharacterRefresh = _CharacterRefresh;
		// @ts-ignore
		CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
	}
}

/**
 * Initializes protected groups like ears and tail
 */
function KDInitProtectedGroups() {
	KDProtectedCosplay = [];
	// init protected slots
	for (let a of KinkyDungeonPlayer.Appearance) {
		if (a.Asset.Group.BodyCosplay){
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
					let canReplace = dress.override!==null && dress.override===true ? true : !InventoryGet(KinkyDungeonPlayer,dress.Group);

					if (!canReplace) {return;}
					if (KDProtectedCosplay.includes(dress.Group)){return;}
					KDInventoryWear(dress.Item, dress.Group, inv.name);

					if (dress.OverridePriority) {
						let item = InventoryGet(KinkyDungeonPlayer, dress.Group);
						if (item) {
							if (!item.Property) item.Property = {OverridePriority: dress.OverridePriority};
							else item.Property.OverridePriority = dress.OverridePriority;
						}
					}
					let color = (typeof dress.Color === "string") ? [dress.Color] : dress.Color;
					let faction = inv.faction;
					if (inv.faction)
						if (dress.factionColor && faction && KinkyDungeonFactionColors[faction]) {
							for (let ii = 0; ii < dress.factionColor.length; ii++) {
								for (let n of dress.factionColor[ii]) {
									color[n] = KinkyDungeonFactionColors[faction][ii]; // 0 is the primary color
								}
							}
						}

					// @ts-ignore
					if (dress.useHairColor && InventoryGet(KinkyDungeonPlayer, "HairFront")) color = InventoryGet(KinkyDungeonPlayer, "HairFront").Color;
					// @ts-ignore
					KDCharacterAppearanceSetColorForGroup(KinkyDungeonPlayer, color, dress.Group);
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
 */
function KDInventoryWear(AssetName, AssetGroup,par) {
	const A = AssetGet(KinkyDungeonPlayer.AssetFamily, AssetGroup, AssetName);
	if (!A) return;
	CharacterAppearanceSetItem(KinkyDungeonPlayer, AssetGroup, A, A.DefaultColor,0,-1, false);
	CharacterRefresh(KinkyDungeonPlayer, true);
	InventoryExpressionTrigger(KinkyDungeonPlayer, InventoryGet(KinkyDungeonPlayer, AssetGroup));
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
	for (let A = KinkyDungeonPlayer.Appearance.length - 1; A >= 0; A--)
		if (KinkyDungeonPlayer.Appearance[A].Asset.Group.AllowNone &&
			(KinkyDungeonPlayer.Appearance[A].Asset.Group.Category === "Appearance")){
			// conditional filter
			let f = !(KinkyDungeonPlayer.Appearance[A].Asset.Group.BodyCosplay
				&& (KDProtectedCosplay.includes(KinkyDungeonPlayer.Appearance[A].Asset.Group.Name)));
			if (!f){continue;}
			KinkyDungeonPlayer.Appearance.splice(A, 1);
		}

	// Loads the new character canvas
	CharacterLoadCanvas(KinkyDungeonPlayer);
}


function KDApplyItem(inv, tags) {
	// @ts-ignore
	let _ChatRoomCharacterUpdate = ChatRoomCharacterUpdate;
	// @ts-ignore
	ChatRoomCharacterUpdate = () => {};
	try {
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

		let already = InventoryGet(KinkyDungeonPlayer, AssetGroup);
		let difficulty = already?.Property?.Difficulty || 0;

		let placed = KDAddAppearance(KinkyDungeonPlayer, AssetGroup, AssetGet("3DCGFemale", AssetGroup, restraint.Asset), color, undefined, undefined, undefined, inv);

		if (placed) {
			let type = restraint.Type;
			if (restraint.changeRenderType && Object.keys(restraint.changeRenderType).some((k) => {return tags.has(k);})) {
				let key = Object.keys(restraint.changeRenderType).filter((k) => {return tags.has(k);})[0];
				if (key) {
					type = restraint.changeRenderType[key];
				}
			}
			placed.Property = {Type: type, Difficulty: restraint.power, LockedBy: inv.lock ? "MetalPadlock" : undefined};
			if ((!already || restraint.power > difficulty) && type) {
				KinkyDungeonPlayer.FocusGroup = AssetGroupGet("Female3DCG", AssetGroup);
				let options = window["Inventory" + ((AssetGroup.includes("ItemMouth")) ? "ItemMouth" : AssetGroup) + restraint.Asset + "Options"];
				if (!options) options = TypedItemDataLookup[`${AssetGroup}${restraint.Asset}`].options; // Try again
				const option = options.find(o => o.Name === type);
				ExtendedItemSetType(KinkyDungeonPlayer, options, option);
				KinkyDungeonPlayer.FocusGroup = null;
			}

			if (restraint.Modules) {
				let data = ModularItemDataLookup[AssetGroup + restraint.Asset];
				let asset = data.asset;
				let modules = data.modules;
				// @ts-ignore
				placed.Property = ModularItemMergeModuleValues({ asset, modules }, restraint.Modules);
				placed.Property.LockedBy = inv.lock ? "MetalPadlock" : undefined;
			}
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