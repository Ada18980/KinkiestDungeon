"use strict";

/**
* Add a new item by group & name to character inventory
* @param {Character} C - The character that gets the new item added to her inventory
* @param {string} NewItemName - The name of the new item to add
* @param {string} NewItemGroup - The group name of the new item to add
* @param {boolean} [Push=true] - Set to TRUE to push to the server
*/
function InventoryAdd(C, NewItemName, NewItemGroup, Push) {

	// First, we check if the inventory already exists, exit if it's the case
	for (let I = 0; I < C.Inventory.length; I++)
		if ((C.Inventory[I].Name == NewItemName) && (C.Inventory[I].Group == NewItemGroup))
			return;

	// Create the new item for current character's asset family, group name and item name
	var NewItem = InventoryItemCreate(C, NewItemGroup, NewItemName);

	// Only add the item if we found the asset
	if (NewItem) {
		// Pushes the new item to the inventory queue
		C.Inventory.push(NewItem);

		// Sends the new item to the server if it's for the current player
		if ((C.ID == 0) && ((Push == null) || Push))
			ServerPlayerInventorySync();
	}
}

/**
* Adds multiple new items by group & name to the character inventory
* @param {Character} C - The character that gets the new items added to her inventory
* @param {Array.<{ Name: string, Group: string }>} NewItems - The new items to add
* @param {Boolean} [Push=true] - Set to TRUE to push to the server, pushed by default
*/
function InventoryAddMany(C, NewItems, Push) {

	// Return if data is invalid
	if (C == null || !Array.isArray(NewItems)) return;

	var ShouldSync = false;

	// Add each items
	for (let NI = 0; NI < NewItems.length; NI++) {
		// First, we check if the item already exists in the inventory, continue if it's the case
		var ItemExists = false;
		for (let I = 0; I < C.Inventory.length; I++)
			if ((C.Inventory[I].Name == NewItems[NI].Name) && (C.Inventory[I].Group == NewItems[NI].Group)) {
				ItemExists = true;
				break;
			}

		if (!ItemExists) {
			// Create the new item for current character's asset family, group name and item name
			var NewItem = InventoryItemCreate(C, NewItems[NI].Group, NewItems[NI].Name);

			// Only add the item if we found the asset
			if (NewItem) {
				// Pushes the new item to the inventory and flag the refresh
				C.Inventory.push(NewItem);
				ShouldSync = true;
			}
		}
	}

	// Sends the new item(s) to the server if it's for the current player and an item was added
	if ((C.ID == 0) && ((Push == null) || Push) && ShouldSync) ServerPlayerInventorySync();
}

/**
 * Creates a new item for a character based on asset group and name
 * @param {Character} C - The character to create the item for
 * @param {string} Group - The name of the asset group the item belongs to
 * @param {string} Name - The name of the asset for the item
 * @return {InventoryItem | null} A new item for character using the specified asset name, or null if the specified asset could not be
 *     found in the named group
 */
function InventoryItemCreate(C, Group, Name) {
	var NewItemAsset = AssetGet(C.AssetFamily, Group, Name);
	if (NewItemAsset) return { Name, Group, Asset: NewItemAsset };
	return null;
}

/**
* Deletes an item from the character inventory
* @param {Character} C - The character on which we should remove the item
* @param {string} DelItemName - The name of the item to delete
* @param {string} DelItemGroup - The group name of the item to delete
* @param {boolean} [Push=true] - Set to TRUE to push to the server
*/
function InventoryDelete(C, DelItemName, DelItemGroup, Push) {

	// First, we remove the item from the player inventory
	for (let I = 0; I < C.Inventory.length; I++)
		if ((C.Inventory[I].Name == DelItemName) && (C.Inventory[I].Group == DelItemGroup)) {
			C.Inventory.splice(I, 1);
			break;
		}

	// Next, we call the player account service to remove the item
	if ((C.ID == 0) && ((Push == null) || Push))
		ServerPlayerInventorySync();

}

/**
* Loads the current inventory for a character, can be loaded from an object of Name/Group or a compressed array using
* LZString
* @param {Character} C - The character on which we should load the inventory
* @param {Array|Record<string, string[]>} Inventory - An array of Name / Group of items to load
*/
function InventoryLoad(C, Inventory) {
	if (Inventory == null) return;
	if (typeof Inventory === "string") {
		try {
			var Inv = JSON.parse(LZString.decompressFromUTF16(Inventory));
			for (let I = 0; I < Inv.length; I++)
				InventoryAdd(C, Inv[I][0], Inv[I][1], false);
		} catch(err) {
			console.log("Error while loading compressed inventory, no inventory loaded.");
		}
	}
	if (Array.isArray(Inventory)) {
		for (let I = 0; I < Inventory.length; I++)
			InventoryAdd(C, Inventory[I].Name, Inventory[I].Group, false);
	} else if (typeof Inventory === "object") {
		for (const G of Object.keys(Inventory)) {
			for (const A of Inventory[G]) {
				InventoryAdd(C, A, G, false);
			}
		}
	}
}

/**
* Checks if the character has the inventory available
* @param {Character} C - The character on which we should remove the item
* @param {String} InventoryName - The name of the item to validate
* @param {String} InventoryGroup - The group name of the item to validate
*/
function InventoryAvailable(C, InventoryName, InventoryGroup) {
	for (let I = 0; I < C.Inventory.length; I++)
		if ((C.Inventory[I].Name == InventoryName) && (C.Inventory[I].Group == InventoryGroup))
			return true;
	return false;
}

/**
* Returns an error message if a prerequisite clashes with the character's items and clothes
* @param {Character} C - The character on which we check for prerequisites
* @param {String} Prerequisite - The name of the prerequisite
* @returns {String} - The error tag, can be converted to an error message
*/
function InventoryPrerequisiteMessage(C, Prerequisite) {
	switch (Prerequisite) {
		// Basic prerequisites that can apply to many items
		case "NoItemFeet": return (InventoryGet(C, "ItemFeet") != null) ? "MustFreeFeetFirst" : "";
		case "NoItemArms": return (InventoryGet(C, "ItemArms") != null) ? "MustFreeArmsFirst" : "";
		case "NoItemLegs": return (InventoryGet(C, "ItemLegs") != null) ? "MustFreeLegsFirst" : "";
		case "NoItemHands": return (InventoryGet(C, "ItemHands") != null) ? "MustFreeHandsFirst" : "";
		case "LegsOpen": return CharacterItemsHavePose(C, "LegsClosed") ? "LegsCannotOpen" : "";
		case "CanCloseLegs": return !CharacterItemsHavePoseAvailable(C, "BodyLower", "LegsClosed") && !CharacterItemsHavePose(C, "Kneel") ? "LegsCannotClose" : "";
		case "NotKneeling": return CharacterItemsHavePose(C, "Kneel") ? "MustStandUpFirst" : "";
		case "CanKneel": return C.Effect.includes("BlockKneel") ? "MustBeAbleToKneel" : "";
		case "NotMounted": return C.Effect.includes("Mounted") ? "CannotBeUsedWhenMounted" : "";
		case "NotHorse": return InventoryIsItemInList(C, "ItemDevices", ["WoodenHorse"]) ? "CannotBeUsedWhenMounted" : "";
		case "NotSuspended": return C.IsSuspended() ? "RemoveSuspensionForItem" : "";
		case "NotLifted": return C.Effect.includes("Lifted") ? "RemoveSuspensionForItem" : "";
		case "NotHogtied": return C.Pose.includes("Hogtied") ? "ReleaseHogtieForItem" : "";
		case "NotYoked": return CharacterItemsHavePose(C, "Yoked") ? "CannotBeUsedWhenYoked" : "";
		case "NotKneelingSpread": return C.Pose.includes("KneelingSpread") ? "MustStandUpFirst" : "";
		case "NotChaste": return C.Effect.includes("Chaste") ? "RemoveChastityFirst" : "";
		case "NotChained": return C.Effect.includes("IsChained") ? "RemoveChainForItem" : "";
		case "NoFeetSpreader": return CharacterItemsHavePose(C, "Spread", true) || CharacterItemsHavePose(C, "LegsOpen", true) ? "CannotBeUsedWithFeetSpreader" : "";
		case "NotShackled": return C.Effect.includes("Shackled") ? "RemoveShacklesFirst" : "";
		case "Collared": return (InventoryGet(C, "ItemNeck") == null) ? "MustCollaredFirst" : "";
		case "CannotHaveWand": return InventoryIsItemInList(C, "ItemArms", ["FullLatexSuit"]) ? "CannotHaveWand" : "";
		case "CannotBeSuited": return InventoryIsItemInList(C, "ItemVulva", ["WandBelt", "HempRopeBelt"]) ? "CannotHaveWand" : "";
		case "AllFours": return CharacterItemsHavePose(C, "AllFours") ? "CannotUse" : "";
		case "OnBed": return !C.Effect.includes("OnBed") ? "MustBeOnBed" : "";
		case "CuffedArms": return  !C.Effect.includes("CuffedArms") ? "MustBeArmCuffedFirst" : "";
		case "CuffedLegs": return !C.Effect.includes("CuffedFeet") ? "MustBeFeetCuffedFirst" : "";
		case "CuffedFeet": return !C.Effect.includes("CuffedFeet") ? "MustBeFeetCuffedFirst" : "";
		case "CuffedArmsOrEmpty": return (InventoryGet(C, "ItemArms") != null && !C.Effect.includes("CuffedArms")) ? "MustFreeArmsFirst" : "";
		case "CuffedLegsOrEmpty": return (InventoryGet(C, "ItemLegs") != null && !C.Effect.includes("CuffedLegs")) ? "MustFreeLegsFirst" : "";
		case "CuffedFeetOrEmpty": return (InventoryGet(C, "ItemFeet") != null && !C.Effect.includes("CuffedFeet")) ? "MustFreeFeetFirst" : "";
		case "NoOuterClothes": return InventoryHasItemInAnyGroup(C, ["Cloth", "ClothLower"]) ? "RemoveClothesForItem" : "";
		case "NoClothLower": return InventoryHasItemInAnyGroup(C, ["ClothLower"]) ? "RemoveClothesForItem" : "";
		case "NoMaidTray": return InventoryIsItemInList(C, "ItemMisc", ["WoodenMaidTray", "WoodenMaidTrayFull"]) ? "CannotBeUsedWhileServingDrinks" : "";
		case "CanBeCeilingTethered": return InventoryHasItemInAnyGroup(C, ["ItemArms", "ItemTorso", "ItemPelvis"]) ? "" : "AddItemsToUse";

		// Checks for torso access based on clothes
		case "AccessTorso": return !InventoryDoItemsExposeGroup(C, "ItemTorso", ["Cloth"]) ? "RemoveClothesForItem" : "";

		// Breast items can be blocked by clothes
		case "AccessBreast": return !InventoryDoItemsExposeGroup(C, "ItemBreast", ["Cloth"]) || !InventoryDoItemsExposeGroup(
			C, "ItemBreast", ["Bra"]) ? "RemoveClothesForItem" : "";
		case "AccessBreastSuitZip": return !InventoryDoItemsExposeGroup(C, "ItemNipplesPiercings", ["Cloth"]) || !InventoryDoItemsExposeGroup(
			C, "ItemNipplesPiercings", ["Suit"]) ? "UnZipSuitForItem" : "";

		// Vulva/Butt items can be blocked by clothes, panties and some socks
		case "AccessVulva": return (
			InventoryDoItemsBlockGroup(C, "ItemVulva", ["Cloth", "Socks", "ItemPelvis", "ItemVulvaPiercings"])
			|| !InventoryDoItemsExposeGroup(C, "ItemVulva", ["ClothLower", "Panties"])
		) ? "RemoveClothesForItem" : "";

		case "AccessButt": return (
			InventoryDoItemsBlockGroup(C, "ItemButt", ["Cloth", "Socks", "ItemPelvis", "ItemVulvaPiercings"])
			|| !InventoryDoItemsExposeGroup(C, "ItemButt", ["ClothLower", "Panties"])
		) ? "RemoveClothesForItem" : "";

		// Items that require access to a certain character's zone
		case "AccessMouth": return C.IsMouthBlocked() ? "CannotBeUsedOverGag" : "";
		case "HoodEmpty": return InventoryGet(C, "ItemHood") ? "CannotBeUsedOverMask" : "";
		case "EyesEmpty": return InventoryGet(C, "ItemHead") ? "CannotBeUsedOverHood" : "";

		// Some chastity belts have removable vulva shields. This checks for those for items that wish to add something externally.
		case "VulvaNotBlockedByBelt": return InventoryDoItemsBlockGroup(C, "ItemVulva", ["ItemPelvis"])
		|| InventoryDoItemsBlockGroup(C, "ItemVulva", ["ItemVulvaPiercings"])
			? "RemoveChastityFirst" : "";

		// Ensure crotch is empty
		case "VulvaEmpty": return (InventoryGet(C, "ItemVulva") != null) ? "MustFreeVulvaFirst" : "";
		case "ClitEmpty": return ((InventoryGet(C, "ItemVulvaPiercings") != null)) ? "MustFreeClitFirst" : "";
		case "ButtEmpty": return ((InventoryGet(C, "ItemButt") != null)) ? "MustFreeButtFirst" : "";

		// For body parts that must be naked
		case "NakedFeet": return InventoryHasItemInAnyGroup(C, ["ItemBoots", "Socks", "Shoes"]) ? "RemoveClothesForItem" : "";
		case "NakedHands": return InventoryHasItemInAnyGroup(C, ["ItemHands", "Gloves"]) ? "RemoveClothesForItem" : "";

		// Display Frame
		case "DisplayFrame": return InventoryHasItemInAnyGroup(C, ["ItemArms", "ItemLegs", "ItemFeet", "ItemBoots"])
			? "RemoveRestraintsFirst"
			: InventoryHasItemInAnyGroup(C, ["Cloth", "ClothLower", "Shoes"])
			? "RemoveClothesForItem" : "";

		// Gas mask (Or face covering items going below the chin)
		case "GasMask": return InventoryIsItemInList(C, "ItemArms", ["Pillory"]) || InventoryIsItemInList(C, "ItemDevices", ["TheDisplayFrame"]) ? "RemoveRestraintsFirst" : "";
		case "NotMasked": return InventoryIsItemInList(C, "ItemHood", ["OldGasMask"]) ? "RemoveFaceMaskFirst" : "";

		// Blocked remotes on self
		case "RemotesAllowed": return LogQuery("BlockRemoteSelf", "OwnerRule") && C.ID === 0 ? "OwnerBlockedRemotes" : "";

		// Layered Gags, prevent gags from being equipped over other gags they are incompatible with
		case "GagUnique": return InventoryPrerequisiteConflictingGags(C, ["GagFlat", "GagCorset", "GagUnique"]);
		case "GagCorset": return InventoryPrerequisiteConflictingGags(C, ["GagCorset"]);

		// There's something in the mouth that's too large to allow that item on
		case "NotProtrudingFromMouth": return C.Effect.includes("ProtrudingMouth") ? "CannotBeUsedOverGag" : "";

		case "NeedsNippleRings": return !InventoryIsItemInList(C, "ItemNipplesPiercings", ["RoundPiercing"]) ? "NeedsNippleRings" : "";

		// Returns no message, indicating that all prerequisites are fine
		default: return "";
	}
}

/**
 * Prerequisite utility function that returns TRUE if the given character has an item equipped in the provided group
 * whose name matches one of the names in the provided list.
 * @param {Character} C - The character for whom to check equipped items
 * @param {String} ItemGroup - The name of the item group to check
 * @param {String[]} ItemList - A list of item names to check against
 * @returns {boolean} - TRUE if the character has an item from the item list equipped in the named slot, FALSE
 * otherwise
 */
function InventoryIsItemInList(C, ItemGroup, ItemList) {
	const Item = InventoryGet(C, ItemGroup);
	return Item && ItemList.includes(Item.Asset.Name);
}

/**
 * Prerequisite utility function that returns TRUE if the given character has an item equipped in the provided group
 * which has the provided prerequisite.
 * @param {Character} C - The character whose items should be checked
 * @param {String} ItemGroup - The name of the item group to check
 * @param {String} Prerequisite - The name of the prerequisite to look for
 * @returns {boolean} - TRUE if the character has an item equipped in the named slot which has the named prerequisite,
 * FALSE otherwise
 */
function InventoryDoesItemHavePrerequisite(C, ItemGroup, Prerequisite) {
	const Item = InventoryGet(C, ItemGroup);
	return Item && Item.Asset.Prerequisite && Item.Asset.Prerequisite.includes(Prerequisite);
}

/**
 * Prerequisite utility function to check whether the target group for the given character is blocked by any of the
 * given groups to check.
 * @param {Character} C - The character whose items should be checked
 * @param {String} TargetGroup - The name of the group that should be checked for being blocked
 * @param {String[]} GroupsToCheck - The name(s) of the groups whose items should be checked
 * @returns {boolean} - TRUE if the character has an item equipped in any of the given groups to check which blocks the
 * target group, FALSE otherwise.
 */
function InventoryDoItemsBlockGroup(C, TargetGroup, GroupsToCheck) {
	return GroupsToCheck.some((Group) => {
		const Item = InventoryGet(C, Group);
		return Item && Item.Asset.Block && Item.Asset.Block.includes(TargetGroup);
	});
}

/**
 * Prerequisite utility function to check whether the target group for the given character is exposed by all of the
 * given groups to check.
 * @param {Character} C - The character whose items should be checked
 * @param {String} TargetGroup - The name of the group that should be checked for being exposed
 * @param {String[]} GroupsToCheck - The name(s) of the groups whose items should be checked
 * @returns {boolean} - FALSE if the character has an item equipped in ANY of the given groups to check that does not
 * expose the target group. Returns TRUE otherwise.
 */
function InventoryDoItemsExposeGroup(C, TargetGroup, GroupsToCheck) {
	return GroupsToCheck.every((Group) => {
		const Item = InventoryGet(C, Group);
		return !Item || Item.Asset.Expose.includes(TargetGroup);
	});
}

/**
 * Prerequisite utility function that returns TRUE if the given character has an item equipped in any of the named group
 * slots.
 * @param {Character} C - The character whose items should be checked
 * @param {String[]} GroupList - The list of groups to check for items in
 * @returns {boolean} - TRUE if the character has any item equipped in any of the named groups, FALSE otherwise.
 */
function InventoryHasItemInAnyGroup(C, GroupList) {
	return GroupList.some(GroupName => !!InventoryGet(C, GroupName));
}

/**
 * Check if there are any gags with prerequisites that block the new gag from being applied
 * @param {Character} C - The character on which we check for prerequisites
 * @param {Array} BlockingPrereqs - The prerequisites we check for on lower gags
 * @returns {String} - Returns the prerequisite message if the gag is blocked, or an empty string if not
 */
function InventoryPrerequisiteConflictingGags(C, BlockingPrereqs) {
	// Index of the gag we're trying to add (1-indexed)
	let GagIndex = 4; // By default, assume no gag slots are allowed to conflict
	if (C.FocusGroup && C.FocusGroup.Name.startsWith("ItemMouth")) {
		// If there's a focus group, calculate the gag index
		GagIndex = Number(C.FocusGroup.Name.replace("ItemMouth", "") || 1);
	}
	const MouthItems = [InventoryGet(C, "ItemMouth"), InventoryGet(C, "ItemMouth2"), InventoryGet(C, "ItemMouth3")];
	let MinBlockingIndex = 0;
	for (let i = 0; i < MouthItems.length && !MinBlockingIndex; i++) {
		// Find the lowest indexed slot in which there is a gag with a prerequisite that blocks the new gag
		let AssetPrerequisites = MouthItems[i] && MouthItems[i].Asset.Prerequisite;
		if (!Array.isArray(AssetPrerequisites)) {
			AssetPrerequisites = [AssetPrerequisites];
		}
		if (AssetPrerequisites.some((Prerequisite) => BlockingPrereqs.includes(Prerequisite))) {
			MinBlockingIndex = i + 1;
		}
	}
	// Not allowed to add the new gag if there is a blocking gag anywhere below it
	if (MinBlockingIndex && GagIndex > MinBlockingIndex) return "CannotBeUsedOverGag";
	else return "";
}

/**
 * Returns TRUE if we can add the item, no other items must block that prerequisite
 * @param {Character} C - The character on which we check for prerequisites
 * @param {Asset} asset - The asset for which prerequisites should be checked. Any item equipped in the asset's group
 * will be ignored for the purposes of the prerequisite check.
 * @param {string|string[]} [prerequisites=asset.Prerequisite] - An array of prerequisites or a string for a single
 * prerequisite. If nothing is provided, the asset's default prerequisites will be used
 * @param {boolean} [setDialog=true] - If TRUE, set the screen dialog message at the same time
 * @returns {boolean} - TRUE if the item can be added to the character
 */
function InventoryAllow(C, asset, prerequisites = asset.Prerequisite, setDialog = true) {
	// Prerequisite can be a string
	if (typeof prerequisites === "string") {
		prerequisites = [prerequisites];
	}

	// If prerequisite isn't a valid array, return true
	if (!Array.isArray(prerequisites)) {
		return true;
	}

	// Create/load a simple character for prerequisite checking
	const checkCharacter = CharacterLoadSimple("InventoryAllow");
	checkCharacter.Appearance = C.Appearance.filter((item) => item.Asset.Group.Name !== asset.Group.Name);
	CharacterLoadEffect(checkCharacter);
	CharacterLoadPose(checkCharacter);

	let Msg = "";
	prerequisites.some((prerequisite) => (Msg = InventoryPrerequisiteMessage(checkCharacter, prerequisite)));

	// If no error message was found, we return TRUE, if a message was found, we can show it in the dialog
	if (Msg && setDialog) DialogSetText(Msg);
	return !Msg;
}

/**
* Gets the current item / cloth worn a specific area (AssetGroup)
* @param {Character} C - The character on which we must check the appearance
* @param {String} AssetGroup - The name of the asset group to scan
* @returns {Item|null} - Returns the appearance which is the item / cloth asset, color and properties
*/
function InventoryGet(C, AssetGroup) {
	for (let A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Family == C.AssetFamily) && (C.Appearance[A].Asset.Group.Name == AssetGroup))
			return C.Appearance[A];
	return null;
}

/**
* Applies crafted properties to the item used
* @param {Character} Source - The character that used the item
* @param {Character} Target - The character on which the item is used
* @param {String} GroupName - The name of the asset group to scan
* @param {CraftingItem} Craft - The crafted properties to apply
* @param {Boolean} Refresh - TRUE if we must refresh the character
* @returns {void}
*/
function InventoryCraft(Source, Target, GroupName, Craft, Refresh) {

	// Gets the item first
	if ((Source == null) || (Target == null) || (GroupName == null) || (Craft == null)) return;
	let Item = InventoryGet(Target, GroupName);
	if (Item == null) return;
	if (Item.Craft == null) Item.Craft = Craft;

	// Applies the color schema, separated by commas
	if (Craft.Color != null && typeof Craft.Color === "string") {
		Item.Color = Craft.Color.replace(" ", "").split(",");
		for (let C of Item.Color)
			if (CommonIsColor(C) == false)
				C = "Default";
	}

	// Applies a lock to the item
	if ((Craft.Lock != null) && (Craft.Lock != ""))
		InventoryLock(Target, Item, Craft.Lock, Source.MemberNumber, false);

	// Sets the crafter name and ID
	if (Item.Craft.MemberNumber == null) Item.Craft.MemberNumber = Source.MemberNumber;
	if (Item.Craft.MemberName == null) Item.Craft.MemberName = CharacterNickname(Source);

	// The properties are only applied on self or NPCs to prevent duplicating the effect
	if ((Craft.Property != null) && (Target.IsPlayer() || Target.IsNpc())) {

		// The secure property adds 5 to the difficulty rating to struggle out
		if (Craft.Property === "Secure") {
			if (Item.Difficulty == null) Item.Difficulty = 5;
			else Item.Difficulty = Item.Difficulty + 5;
		}

		// The loose property removes 5 to the difficulty rating to struggle out
		if (Craft.Property === "Loose") {
			if (Item.Difficulty == null) Item.Difficulty = -5;
			else Item.Difficulty = Item.Difficulty - 5;
		}

		// The decoy property makes it always possible to struggle out
		if (Craft.Property === "Decoy") Item.Difficulty = -50;

		// Expressions cannot be changed if the settings doesn't allow it for the player
		if (!Target.IsPlayer() || (Player.OnlineSharedSettings == null) || Player.OnlineSharedSettings.ItemsAffectExpressions) {

			// The painful property triggers an expression change
			if (Craft.Property === "Painful") {
				CharacterSetFacialExpression(Target, "Blush", "ShortBreath", 10);
				CharacterSetFacialExpression(Target, "Eyes", "Angry", 10);
				CharacterSetFacialExpression(Target, "Eyes2", "Angry", 10);
				CharacterSetFacialExpression(Target, "Eyebrows1", "Angry", 10);
			}

			// The comfy property triggers an expression change
			if (Craft.Property === "Comfy") {
				CharacterSetFacialExpression(Target, "Blush", "Light", 10);
				CharacterSetFacialExpression(Target, "Eyes", "Horny", 10);
				CharacterSetFacialExpression(Target, "Eyes2", "Horny", 10);
				CharacterSetFacialExpression(Target, "Eyebrows1", "Raised", 10);
			}

		}

	}

	// Refreshes the character if needed
	if (Refresh && (Target.IsPlayer() || Target.IsNpc()))
		CharacterRefresh(Target, true);

}

/**
* Returns the number of items on a character with a specific property
* @param {Character} C - The character to validate
* @param {String} Property - The property to count
* @returns {Number} - The number of times the property is found
*/
function InventoryCraftCount(C, Property) {
	let Count = 0;
	if ((C != null) && (C.Appearance != null))
		for (let A of C.Appearance)
			if ((A.Craft != null) && (A.Craft.Property != null) && (A.Craft.Property == Property))
				Count++;
	return Count;
}

/**
* Returns TRUE if an item as the specified crafted property
* @param {Item} Item - The item to validate
* @param {String} Property - The property to check
* @returns {boolean} - TRUE if the property matches
*/
function InventoryCraftPropertyIs(Item, Property) {
	if ((Item == null) || (Item.Craft == null) || (Item.Craft.Property == null) || (Property == null)) return false;
	return (Item.Craft.Property == Property);
}

/**
* Sets the craft and type on the item, uses the achetype properties if possible
* @param {Item} Item - The item being applied
* @param {Object} [Craft] - The crafting properties of the item
*/
function InventoryWearCraft(Item, Craft) {
	if ((Item == null) || (Item.Asset == null) || (Craft == null)) return;
	Item.Craft = Craft;
	if ((Craft.Type != null) && (Item.Asset.AllowType != null) && (Item.Asset.AllowType.indexOf(Craft.Type) >= 0)) {
		if (Item.Asset.Extended && (Item.Asset.Archetype == "typed")) {
			let Config = AssetFemale3DCGExtended[Item.Asset.Group.Name][Item.Asset.Name].Config;
			if ((Config != null) && (Config.Options != null))
				for (let O of Config.Options)
					if (O.Name == Craft.Type)
						return Item.Property = JSON.parse(JSON.stringify(O.Property));
		}
		if (Item.Property == null) Item.Property = {};
		Item.Property.Type = Craft.Type;
	}
}

/**
* Makes the character wear an item on a body area
* @param {Character} C - The character that must wear the item
* @param {string} AssetName - The name of the asset to wear
* @param {string} AssetGroup - The name of the asset group to wear
* @param {string | string[]} [ItemColor] - The hex color of the item, can be undefined or "Default"
* @param {number} [Difficulty] - The difficulty, on top of the base asset difficulty, to assign to the item
* @param {number} [MemberNumber] - The member number of the character putting the item on - defaults to -1
* @param {Object} [Craft] - The crafting properties of the item
*/
function InventoryWear(C, AssetName, AssetGroup, ItemColor, Difficulty, MemberNumber, Craft) {
	const A = AssetGet(C.AssetFamily, AssetGroup, AssetName);
	if (!A) return;
	CharacterAppearanceSetItem(C, AssetGroup, A, ((ItemColor == null || ItemColor == "Default") && A.DefaultColor != null) ? A.DefaultColor : ItemColor, Difficulty, MemberNumber, false);
	let Item = InventoryGet(C, AssetGroup);
	InventoryWearCraft(Item, Craft);
	CharacterRefresh(C, true);
	InventoryExpressionTrigger(C, Item);
}

/**
* Sets the difficulty to remove an item for a body area
* @param {Character} C - The character that is wearing the item
* @param {String} AssetGroup - The name of the asset group
* @param {number} Difficulty - The new difficulty level to escape from the item
*/
function InventorySetDifficulty(C, AssetGroup, Difficulty) {
	if ((Difficulty >= 0) && (Difficulty <= 100))
		for (let A = 0; A < C.Appearance.length; A++)
			if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Name == AssetGroup))
				C.Appearance[A].Difficulty = Difficulty;
	if ((CurrentModule != "Character") && (C.ID == 0)) ServerPlayerAppearanceSync();
}

/**
* Returns TRUE if there's already a locked item at a given body area
* @param {Character} C - The character that is wearing the item
* @param {String} AssetGroup - The name of the asset group (body area)
* @param {Boolean} CheckProperties - Set to TRUE to check for additionnal properties
* @returns {Boolean} - TRUE if the item is locked
*/
function InventoryLocked(C, AssetGroup, CheckProperties) {
	var I = InventoryGet(C, AssetGroup);
	return ((I != null) && InventoryItemHasEffect(I, "Lock", CheckProperties));
}

/**
 * Makes the character wear a random item from a body area
 * @param {Character} C - The character that must wear the item
 * @param {string} GroupName - The name of the asset group (body area)
 * @param {number} [Difficulty] - The difficulty, on top of the base asset difficulty, to assign to the item
 * @param {boolean} [Refresh=true] - Do not call CharacterRefresh if false
 * @param {boolean} [MustOwn=false] - If TRUE, only assets that the character owns can be worn. Otherwise any asset can
 * be used
 * @param {boolean} [Extend=true] - Whether or not to randomly extend the item (i.e. set the item type), provided it has
 * an archetype that supports random extension
 * @param {string[]} [AllowedAssets=null] - A list of assets from which one must be selected
 * @param {boolean} [IgnoreRequirements=false] - If True, the group being blocked and prerequisites will not prevent the item being added.
 *  NOTE: Long-term this should be replaced with better checks before calling this function.
 * @returns {void} - Nothing
 */
function InventoryWearRandom(C, GroupName, Difficulty, Refresh = true, MustOwn = false, Extend = true, AllowedAssets = null, IgnoreRequirements = false) {
	if (InventoryLocked(C, GroupName, true)) {
		return;
	}

	// Finds the asset group and make sure it's not blocked
	const Group = AssetGroupGet(C.AssetFamily, GroupName);
	if (!IgnoreRequirements && (!Group || InventoryGroupIsBlocked(C, GroupName))) {
		return;
	}
	const IsClothes = Group.Clothing;

	let AssetList = null;
	if (AllowedAssets) {
		AssetList = AllowedAssets.map(assetName => Asset.find(A => A.Group.Name == GroupName && A.Name == assetName));
	}
	// Restrict the options to assets owned by the character
	if (MustOwn) {
		CharacterAppearanceBuildAssets(C);
		if (AssetList) {
			AssetList.filter(A => CharacterAppearanceAssets.some(CAA => CAA.Group.Name == A.Group.Name && CAA.Name == A.Name));
		} else {
			AssetList = CharacterAppearanceAssets;
		}
	}

	// Get and apply a random asset
	const SelectedAsset = InventoryGetRandom(C, GroupName, AssetList, IgnoreRequirements);

	// Pick a random color for clothes from their schema
	const SelectedColor = IsClothes ? SelectedAsset.Group.ColorSchema[Math.floor(Math.random() * SelectedAsset.Group.ColorSchema.length)] : null;

	CharacterAppearanceSetItem(C, GroupName, SelectedAsset, SelectedColor, Difficulty, null, false);

	if (Extend) {
		InventoryRandomExtend(C, GroupName);
	}

	if (Refresh) {
		CharacterRefresh(C);
	}
}

/**
 * Randomly extends an item (sets an item type, etc.) on a character
 * @param {Character} C - The character wearing the item
 * @param {string} GroupName - The name of the item's group
 * @returns {void} - Nothing
 */
function InventoryRandomExtend(C, GroupName) {
	const Item = InventoryGet(C, GroupName);

	if (!Item || !Item.Asset.Archetype) {
		return;
	}

	switch (Item.Asset.Archetype) {
		case ExtendedArchetype.TYPED:
			TypedItemSetRandomOption(C, Item);
			break;
		default:
			// Archetype does not yet support random extension
			break;
	}
}

/**
 * Select a random asset from a group, narrowed to the most preferable available options (i.e
 * unblocked/visible/unlimited) based on their binary "rank"
 * @param {Character} C - The character to pick the asset for
 * @param {string} GroupName - The asset group to pick the asset from. Set to an empty string to not filter by group.
 * @param {Asset[]} [AllowedAssets] - Optional parameter: A list of assets from which one can be selected. If not provided,
 *     the full list of all assets is used.
 * @param {boolean} [IgnorePrerequisites=false] - If True, skip the step to check whether prerequisites are met
 *  NOTE: Long-term this should be replaced with better checks before calling this function.
 * @returns {Asset|null} - The randomly selected asset or `null` if none found
 */
function InventoryGetRandom(C, GroupName, AllowedAssets, IgnorePrerequisites = false) {
	var List = [];
	var AssetList = AllowedAssets || Asset;
	var RandomOnly = (AllowedAssets == null);

	var MinRank = Math.pow(2, 10);
	var BlockedRank = Math.pow(2, 2);
	var HiddenRank = Math.pow(2, 1);
	var LimitedRank = Math.pow(2, 0);

	for (let A = 0; A < AssetList.length; A++)
		if (((AssetList[A].Group.Name == GroupName && AssetList[A].Wear) || GroupName == null || GroupName == "")
			&& (RandomOnly == false || AssetList[A].Random)
			&& AssetList[A].Enable
			&& (IgnorePrerequisites || InventoryAllow(C, AssetList[A], undefined, false)))
		{
			var CurrRank = 0;

			if (InventoryIsPermissionBlocked(C, AssetList[A].Name, AssetList[A].Group.Name)) {
				if (BlockedRank > MinRank) continue;
				else CurrRank += BlockedRank;
			}

			if (CharacterAppearanceItemIsHidden(AssetList[A].Name, GroupName)) {
				if (HiddenRank > MinRank) continue;
				else CurrRank += HiddenRank;
			}

			if (InventoryIsPermissionLimited(C, AssetList[A].Name, AssetList[A].Group.Name)) {
				if (LimitedRank > MinRank) continue;
				else CurrRank += LimitedRank;
			}

			MinRank = Math.min(MinRank, CurrRank);
			List.push({ Asset: AssetList[A], Rank: CurrRank });
		}

	var PreferredList = List.filter(L => L.Rank == MinRank);
	if (PreferredList.length == 0) return null;

	return PreferredList[Math.floor(Math.random() * PreferredList.length)].Asset;
}

/**
* Removes a specific item from a character body area
* @param {Character} C - The character on which we must remove the item
* @param {String} AssetGroup - The name of the asset group (body area)
* @param {boolean} [Refresh] - Whether or not to trigger a character refresh. Defaults to false
*/
function InventoryRemove(C, AssetGroup, Refresh) {

	const lastblindlevel = Player.GetBlindLevel();
	DrawLastDarkFactor = CharacterGetDarkFactor(Player);

	// First loop to find the item and any sub item to remove with it
	for (let E = 0; E < C.Appearance.length; E++)
		if (C.Appearance[E].Asset.Group.Name == AssetGroup) {
			let AssetToRemove = C.Appearance[E].Asset;
			let AssetToCheck = null;
			for (let R = 0; R < AssetToRemove.RemoveItemOnRemove.length; R++) {
				AssetToCheck = AssetToRemove.RemoveItemOnRemove[R];
				if (!AssetToCheck.Name) {
					// Just try to force remove a group, if no item is specified
					InventoryRemove(C, AssetToCheck.Group, false);
				} else {
					let AssetFound = InventoryGet(C, AssetToCheck.Group);
					// If a name is specified check if the item is worn
					if (AssetFound && (AssetFound.Asset.Name == AssetToCheck.Name))
						// If there is no type check or there is a type check and the item type matches, remove it
						if (AssetToCheck.Type) {
							if (AssetFound.Property && AssetFound.Property.Type === AssetToCheck.Type)
								InventoryRemove(C, AssetToCheck.Group, false);
						} else {
							InventoryRemove(C, AssetToCheck.Group, false);
						}
				}
			}
		}

	// Second loop to find the item again, and remove it from the character appearance
	for (let E = 0; E < C.Appearance.length; E++)
		if (C.Appearance[E].Asset.Group.Name == AssetGroup) {
			C.Appearance.splice(E, 1);
			if (Refresh || Refresh == null) CharacterRefresh(C);

			if (Player.GraphicsSettings && Player.GraphicsSettings.DoBlindFlash) {
				if (Refresh == false) CharacterLoadEffect(C); // update Effect to get the new blind level
				if (lastblindlevel > 0 && Player.GetBlindLevel() === 0) {
					DrawBlindFlash(lastblindlevel);
				}
			}

			return;
		}

}

/**
* Returns TRUE if the body area (Asset Group) for a character is blocked and cannot be used
* @param {Character} C - The character on which we validate the group
* @param {AssetGroupName} [GroupName] - The name of the asset group (body area), defaults to `C.FocusGroup`
* @param {boolean} [Activity=false] - if TRUE check if activity is allowed on the asset group
* @returns {boolean} - TRUE if the group is blocked
*/
function InventoryGroupIsBlockedForCharacter(C, GroupName, Activity) {
	if (Activity == null) Activity = false;

	// Default to characters focused group
	if (GroupName == null) GroupName = C.FocusGroup.Name;

	if (Activity) {
		for (let E = 0; E < C.Appearance.length; E++) {
			if (!C.Appearance[E].Asset.Group.Clothing && (C.Appearance[E].Asset.AllowActivityOn != null) && (C.Appearance[E].Asset.AllowActivityOn.includes(GroupName))){
				Activity = true;
				break;
			} else if (!C.Appearance[E].Asset.Group.Clothing && (C.Appearance[E].Property != null) && (C.Appearance[E].Property.AllowActivityOn != null) && (C.Appearance[E].Property.AllowActivityOn.indexOf(GroupName) >= 0)){
				Activity = true;
				break;
			} else Activity = false;
		}
	}

	// Items can block each other (hoods blocks gags, belts blocks eggs, etc.)
	for (let E = 0; E < C.Appearance.length; E++) {
		if (!C.Appearance[E].Asset.Group.Clothing && (C.Appearance[E].Asset.Block != null) && (C.Appearance[E].Asset.Block.includes(GroupName)) && !Activity) return true;
		if (!C.Appearance[E].Asset.Group.Clothing && (C.Appearance[E].Property != null) && (C.Appearance[E].Property.Block != null) && Array.isArray(C.Appearance[E].Property.Block) && (C.Appearance[E].Property.Block.indexOf(GroupName) >= 0) && !Activity) return true;
	}

	// If another character is enclosed, items other than the enclosing one cannot be used
	if ((C.ID != 0) && C.IsEnclose()) {
		for (let E = 0; E < C.Appearance.length; E++)
			if ((C.Appearance[E].Asset.Group.Name == GroupName) && InventoryItemHasEffect(C.Appearance[E], "Enclose", true))
				return false;
		return true;
	}
	// Nothing is preventing the group from being used
	return false;
}

/**
* Returns TRUE if the body area (Asset Group) for a character is blocked and cannot be used
* Similar to InventoryGroupIsBlockedForCharacter but also blocks groups on all characters if the player is enclosed.
* @param {Character} C - The character on which we validate the group
* @param {string} [GroupName] - The name of the asset group (body area)
* @param {boolean} [Activity] - if TRUE check if activity is allowed on the asset group
* @returns {boolean} - TRUE if the group is blocked
*/
function InventoryGroupIsBlocked(C, GroupName, Activity) {
	if (InventoryGroupIsBlockedForCharacter(C, GroupName, Activity)) return true;
	// If the player is enclosed, all groups for another character are blocked
	if ((C.ID != 0) && Player.IsEnclose()) return true;

	// Nothing is preventing the group from being used
	return false;

}

/**
* Returns TRUE if an item has a specific effect
* @param {Item} Item - The item from appearance that must be validated
* @param {EffectName} [Effect] - The name of the effect to validate, can be undefined to check for any effect
* @param {boolean} [CheckProperties=true] - If properties should be checked (defaults to `true`)
* @returns {boolean} `true` if the effect is on the item
*/
function InventoryItemHasEffect(Item, Effect, CheckProperties = true) {
	if (!Item) return false;
	if (!Effect) {
		return !!(
			(Item.Asset && Array.isArray(Item.Asset.Effect) && Item.Asset.Effect.length > 0) ||
			(CheckProperties && Item.Property && Array.isArray(Item.Property.Effect) && Item.Property.Effect.length > 0)
		);
	} else {
		return !!(
			(Item.Asset && Array.isArray(Item.Asset.Effect) && Item.Asset.Effect.includes(Effect)) ||
			(CheckProperties && Item.Property && Array.isArray(Item.Property.Effect) && Item.Property.Effect.includes(Effect))
		);
	}
}

/**
* Returns TRUE if an item lock is pickable
* @param {Item} Item - The item from appearance that must be validated
* @returns {Boolean} - TRUE if PickDifficulty is on the item
*/
function InventoryItemIsPickable(Item) {
	if (!Item) return null;
	const lock = InventoryGetLock(Item);
	if (lock && lock.Asset && lock.Asset.PickDifficulty && lock.Asset.PickDifficulty > 0) return true;
	else return false;
}

/**
 * Returns the value of a given property of an appearance item, prioritizes the Property object.
 * @param {object} Item - The appearance item to scan
 * @param {string} PropertyName - The property name to get.
 * @param {boolean} [CheckGroup=false] - Whether or not to fall back to the item's group if the property is not found on
 * Property or Asset.
 * @returns {any} - The value of the requested property for the given item. Returns undefined if the property or the
 * item itself does not exist.
 */
function InventoryGetItemProperty(Item, PropertyName, CheckGroup=false) {
	if (!Item || !PropertyName || !Item.Asset) return;
	let Property = Item.Property && Item.Property[PropertyName];
	if (Property === undefined) Property = Item.Asset[PropertyName];
	if (Property === undefined && CheckGroup) Property = Item.Asset.Group[PropertyName];
	return Property;
}

/**
* Check if we must trigger an expression for the character after an item is used/applied
* @param {Character} C - The character that we must validate
* @param {Item} item - The item from appearance that we must validate
*/
function InventoryExpressionTrigger(C, item) {
	if (item && item.Asset) {
		const expressions = item.Asset.DynamicExpressionTrigger(C);
		if (expressions) InventoryExpressionTriggerApply(C, expressions);
	}
}

/**
 * Apply an item's expression trigger to a character if able
 * @param {Character} C - The character to update
 * @param {ExpressionTrigger[]} expressions - The expression change to apply to each group
 */
function InventoryExpressionTriggerApply(C, expressions) {
	const expressionsAllowed = C.ID === 0 || C.AccountName.startsWith("Online-") ? C.OnlineSharedSettings.ItemsAffectExpressions : true;
	if (expressionsAllowed) {
		expressions.forEach(expression => {
			const targetGroupItem = InventoryGet(C, expression.Group);
			if (!targetGroupItem || !targetGroupItem.Property || !targetGroupItem.Property.Expression) {
				CharacterSetFacialExpression(C, expression.Group, expression.Name, expression.Timer);
			}
		});
	}
}

/**
* Returns the padlock item that locks another item
* @param {Item} Item - The item from appearance that must be scanned
* @returns {Item} - A padlock item or NULL if none
*/
function InventoryGetLock(Item) {
	if ((Item == null) || (Item.Property == null) || (Item.Property.LockedBy == null)) return null;
	for (let A = 0; A < Asset.length; A++)
		if (Asset[A].IsLock && (Asset[A].Name == Item.Property.LockedBy))
			return { Asset: Asset[A] };
	return null;
}

/**
* Returns TRUE if the item has an OwnerOnly flag, such as the owner padlock
* @param {Item} Item - The item from appearance that must be scanned
* @returns {Boolean} - TRUE if owner only
*/
function InventoryOwnerOnlyItem(Item) {
	if (Item == null) return false;
	if (Item.Asset.OwnerOnly) return true;
	if (Item.Asset.Group.Category == "Item") {
		var Lock = InventoryGetLock(Item);
		if ((Lock != null) && (Lock.Asset.OwnerOnly != null) && Lock.Asset.OwnerOnly) return true;
	}
	return false;
}

/**
* Returns TRUE if the item has a LoverOnly flag, such as the lover padlock
* @param {Item} Item - The item from appearance that must be scanned
* @returns {Boolean} - TRUE if lover only
*/
function InventoryLoverOnlyItem(Item) {
	if (Item == null) return false;
	if (Item.Asset.LoverOnly) return true;
	if (Item.Asset.Group.Category == "Item") {
		var Lock = InventoryGetLock(Item);
		if ((Lock != null) && (Lock.Asset.LoverOnly != null) && Lock.Asset.LoverOnly) return true;
	}
	return false;
}

/**
* Returns TRUE if the character is wearing at least one restraint that's locked with an extra lock
* @param {Character} C - The character to scan
* @returns {Boolean} - TRUE if one restraint with an extra lock is found
*/
function InventoryCharacterHasLockedRestraint(C) {
	if (C.Appearance != null)
		for (let A = 0; A < C.Appearance.length; A++)
			if (C.Appearance[A].Asset.IsRestraint && (InventoryGetLock(C.Appearance[A]) != null))
				return true;
	return false;
}

/**
 *
 * @param {Character} C - The character to scan
 * @param {String} LockName - The type of lock to check for
 * @returns {Boolean} - Returns TRUE if any item has the specified lock locked onto it
 */
function InventoryCharacterIsWearingLock(C, LockName) {
	for (let A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Property != null) && (C.Appearance[A].Property.LockedBy == LockName))
			return true;
	return false;
}

/**
* Returns TRUE if the character is wearing at least one item that's a restraint with a OwnerOnly flag, such as the
* owner padlock
* @param {Character} C - The character to scan
* @returns {Boolean} - TRUE if one owner only restraint is found
*/
function InventoryCharacterHasOwnerOnlyRestraint(C) {
	if ((C.Ownership == null) || (C.Ownership.MemberNumber == null) || (C.Ownership.MemberNumber == "")) return false;
	if (C.Appearance != null)
		for (let A = 0; A < C.Appearance.length; A++)
			if (C.Appearance[A].Asset.IsRestraint && InventoryOwnerOnlyItem(C.Appearance[A]))
				return true;
	return false;
}

/**
* Returns TRUE if the character is wearing at least one item that's a restraint with a LoverOnly flag, such as the
* lover padlock
* @param {Character} C - The character to scan
* @returns {Boolean} - TRUE if one lover only restraint is found
*/
function InventoryCharacterHasLoverOnlyRestraint(C) {
	if (C.GetLoversNumbers().length == 0) return false;
	if (C.Appearance != null)
		for (let A = 0; A < C.Appearance.length; A++) {
			if (C.Appearance[A].Asset.IsRestraint && InventoryLoverOnlyItem(C.Appearance[A]))
				return true;
		}
	return false;
}

/**
* Returns TRUE if at least one item on the character can be locked
* @param {Character} C - The character to scan
* @returns {Boolean} - TRUE if at least one item can be locked
*/
function InventoryHasLockableItems(C) {
	return C.Appearance.some((item) => InventoryDoesItemAllowLock(item) && InventoryGetLock(item) == null);
}

/**
 * Determines whether an item in its current state permits locks.
 * @param {Item} item - The item to check
 * @returns {boolean} - TRUE if the asset's current type permits locks
 */
function InventoryDoesItemAllowLock(item) {
	const asset = item.Asset;
	const property = item.Property;
	const type = property && property.Type;
	if (Array.isArray(asset.AllowLockType)) {
		// "" is used to represent the null type in AllowLockType arrays
		return type != null ? asset.AllowLockType.includes(type) : asset.AllowLockType.includes("");
	} else {
		return asset.AllowLock;
	}
}

/**
 * Applies a lock to an appearance item of a character
 * @param {Character} C - The character on which the lock must be applied
 * @param {Item|string} Item - The item from appearance to lock
 * @param {Item|string} Lock - The asset of the lock or the name of the lock asset
 * @param {number|string} [MemberNumber] - The member number to put on the lock, or message to show
 * @param {boolean} [Update=true] - Whether or not to update the character
 */
function InventoryLock(C, Item, Lock, MemberNumber, Update = true) {
	if (typeof Item === 'string') Item = InventoryGet(C, Item);
	if (typeof Lock === 'string') Lock = { Asset: AssetGet(C.AssetFamily, "ItemMisc", Lock) };
	if (Item && Lock && Lock.Asset.IsLock && InventoryDoesItemAllowLock(Item)) {
		if (Item.Property == null) Item.Property = {};
		if (Item.Property.Effect == null) Item.Property.Effect = [];
		if (Item.Property.Effect.indexOf("Lock") < 0) Item.Property.Effect.push("Lock");

		if (!Item.Property.MemberNumberListKeys && Lock.Asset.Name == "HighSecurityPadlock") Item.Property.MemberNumberListKeys = "" + MemberNumber;
		Item.Property.LockedBy = /** @type AssetLockType */(Lock.Asset.Name);
		if (MemberNumber != null) Item.Property.LockMemberNumber = MemberNumber;
		if (Update) {
			if (Lock.Asset.RemoveTimer > 0) TimerInventoryRemoveSet(C, Item.Asset.Group.Name, Lock.Asset.RemoveTimer);
			CharacterRefresh(C, true);
		}
	}
}

/**
* Unlocks an item and removes all related properties
* @param {Character} C - The character on which the item must be unlocked
* @param {Item|string} Item - The item from appearance to unlock
*/
function InventoryUnlock(C, Item) {
	if (typeof Item === 'string') Item = InventoryGet(C, Item);
	if (Item && Item.Property && Item.Property.Effect) {
		ValidationDeleteLock(Item.Property, false);
		CharacterRefresh(C);
	}
}

/**
* Applies a random lock on an item
* @param {Character} C - The character on which the item must be locked
* @param {Item} Item - The item from appearance to lock
* @param {Boolean} FromOwner - Set to TRUE if the source is the owner, to apply owner locks
*/
function InventoryLockRandom(C, Item, FromOwner) {
	if (InventoryDoesItemAllowLock(Item)) {
		var List = [];
		for (let A = 0; A < Asset.length; A++)
			if (Asset[A].IsLock && Asset[A].Random && !Asset[A].LoverOnly && (FromOwner || !Asset[A].OwnerOnly))
				List.push(Asset[A]);
		if (List.length > 0) {
			var Lock = { Asset: InventoryGetRandom(C, null, List) };
			InventoryLock(C, Item, Lock);
		}
	}
}

/**
* Applies random locks on each character items that can be locked
* @param {Character} C - The character on which the items must be locked
* @param {Boolean} FromOwner - Set to TRUE if the source is the owner, to apply owner locks
*/
function InventoryFullLockRandom(C, FromOwner) {
	for (let I = 0; I < C.Appearance.length; I++)
		if (InventoryGetLock(C.Appearance[I]) == null)
			InventoryLockRandom(C, C.Appearance[I], FromOwner);
}

/**
* Removes all common keys from the player inventory
*/
function InventoryConfiscateKey() {
	InventoryDelete(Player, "MetalCuffsKey", "ItemMisc");
	InventoryDelete(Player, "MetalPadlockKey", "ItemMisc");
	InventoryDelete(Player, "IntricatePadlockKey", "ItemMisc");
	InventoryDelete(Player, "HighSecurityPadlockKey", "ItemMisc");
	InventoryDelete(Player, "Lockpicks", "ItemMisc");
}

/**
* Removes the remotes of the vibrators from the player inventory
*/
function InventoryConfiscateRemote() {
	InventoryDelete(Player, "VibratorRemote", "ItemVulva");
	InventoryDelete(Player, "VibratorRemote", "ItemNipples");
	InventoryDelete(Player, "LoversVibratorRemote", "ItemVulva");
	InventoryDelete(Player, "SpankingToysVibeRemote", "ItemHands");
}

/**
* Returns TRUE if the item is worn by the character
* @param {Character} C - The character to scan
* @param {String} AssetName - The asset / item name to scan
* @param {String} AssetGroup - The asset group name to scan
* @returns {Boolean} - TRUE if item is worn
*/
function InventoryIsWorn(C, AssetName, AssetGroup) {
	if ((C != null) && (C.Appearance != null) && Array.isArray(C.Appearance))
		for (let A = 0; A < C.Appearance.length; A++)
			if ((C.Appearance[A].Asset.Name == AssetName) && (C.Appearance[A].Asset.Group.Name == AssetGroup))
				return true;
	return false;
}

/**
 * Toggles an item's permission for the player
 * @param {Item} Item - Appearance item to toggle
 * @param {string} [Type] - Type of the item to toggle
 * @param {boolean} [Worn] - True if the player is changing permissions for an item they're wearing
 * @returns {void} - Nothing
 */
function InventoryTogglePermission(Item, Type, Worn) {
	const onExtreme = Player.GetDifficulty() >= 3;
	const blockAllowed = !Worn && !onExtreme;
	const limitedAllowed = !Worn && (!onExtreme || MainHallStrongLocks.includes(Item.Asset.Name));

	const removeFromPermissions = (B) => B.Name != Item.Asset.Name || B.Group != Item.Asset.Group.Name || B.Type != Type;
	const permissionItem = { Name: Item.Asset.Name, Group: Item.Asset.Group.Name, Type: Type };
	if (InventoryIsPermissionBlocked(Player, Item.Asset.Name, Item.Asset.Group.Name, Type)) {
		Player.BlockItems = Player.BlockItems.filter(removeFromPermissions);
		Player.LimitedItems.push(permissionItem);
	} else if (InventoryIsPermissionLimited(Player, Item.Asset.Name, Item.Asset.Group.Name, Type)) {
		Player.LimitedItems = Player.LimitedItems.filter(removeFromPermissions);
	} else if (InventoryIsFavorite(Player, Item.Asset.Name, Item.Asset.Group.Name, Type)) {
		if (blockAllowed)
			Player.BlockItems.push(permissionItem);
		else if (limitedAllowed)
			Player.LimitedItems.push(permissionItem);
		Player.FavoriteItems = Player.FavoriteItems.filter(removeFromPermissions);
	} else {
		Player.FavoriteItems.push(permissionItem);
	}
	ServerPlayerBlockItemsSync();
}

/**
* Returns TRUE if a specific item / asset is blocked by the character item permissions
* @param {Character} C - The character on which we check the permissions
* @param {string} AssetName - The asset / item name to scan
* @param {string} AssetGroup - The asset group name to scan
* @param {string} [AssetType] - The asset type to scan
* @returns {boolean} - TRUE if asset / item is blocked
*/
function InventoryIsPermissionBlocked(C, AssetName, AssetGroup, AssetType) {
	if ((C != null) && (C.BlockItems != null) && Array.isArray(C.BlockItems))
		for (let B = 0; B < C.BlockItems.length; B++)
			if ((C.BlockItems[B].Name == AssetName) && (C.BlockItems[B].Group == AssetGroup) && (C.BlockItems[B].Type == AssetType))
				return true;
	return false;
}


/**
* Returns TRUE if a specific item / asset is favorited by the character item permissions
* @param {Character} C - The character on which we check the permissions
* @param {string} AssetName - The asset / item name to scan
* @param {string} AssetGroup - The asset group name to scan
* @param {string} [AssetType] - The asset type to scan
* @returns {boolean} - TRUE if asset / item is a favorite
*/
function InventoryIsFavorite(C, AssetName, AssetGroup, AssetType) {
	if ((C != null) && (C.FavoriteItems != null) && Array.isArray(C.FavoriteItems))
		for (let B = 0; B < C.FavoriteItems.length; B++)
			if ((C.FavoriteItems[B].Name == AssetName) && (C.FavoriteItems[B].Group == AssetGroup) && (C.FavoriteItems[B].Type == AssetType))
				return true;
	return false;
}

/**
 * Returns TRUE if a specific item / asset is limited by the character item permissions
 * @param {Character} C - The character on which we check the permissions
 * @param {string} AssetName - The asset / item name to scan
 * @param {string} AssetGroup - The asset group name to scan
 * @param {string} [AssetType] - The asset type to scan
 * @returns {boolean} - TRUE if asset / item is limited
 */
function InventoryIsPermissionLimited(C, AssetName, AssetGroup, AssetType) {
	if ((C != null) && (C.LimitedItems != null) && Array.isArray(C.LimitedItems))
		for (let B = 0; B < C.LimitedItems.length; B++)
			if ((C.LimitedItems[B].Name == AssetName) && (C.LimitedItems[B].Group == AssetGroup) && (C.LimitedItems[B].Type == AssetType))
				return true;
	return false;
}

/**
 * Returns TRUE if the item is not limited, if the player is an owner or a lover of the character, or on their whitelist
 * @param {Character} C - The character on which we check the limited permissions for the item
 * @param {Item} Item - The item being interacted with
 * @param {String} [ItemType] - The asset type to scan
 * @returns {Boolean} - TRUE if item is allowed
 */
function InventoryCheckLimitedPermission(C, Item, ItemType) {
	if (!InventoryIsPermissionLimited(C, Item.Asset.DynamicName(Player), Item.Asset.Group.Name, ItemType)) return true;
	if ((C.ID == 0) || C.IsLoverOfPlayer() || C.IsOwnedByPlayer()) return true;
	if ((C.ItemPermission < 3) && !(C.WhiteList.indexOf(Player.MemberNumber) < 0)) return true;
	return false;
}

/**
 * Returns TRUE if a specific item / asset is blocked or limited for the player by the character item permissions
 * @param {Character} C - The character on which we check the permissions
 * @param {Item} Item - The item being interacted with
 * @param {String} [ItemType] - The asset type to scan
 * @returns {Boolean} - Returns TRUE if the item cannot be used
 */
function InventoryBlockedOrLimited(C, Item, ItemType) {
	let Blocked = InventoryIsPermissionBlocked(C, Item.Asset.DynamicName(Player), Item.Asset.Group.Name, ItemType);
	let Limited = !InventoryCheckLimitedPermission(C, Item, ItemType);
	return Blocked || Limited;
}

/**
 * Determines whether a given item is an allowed limited item for the player (i.e. has limited permissions, but can be
 * used by the player)
 * @param {Character} C - The character whose permissions to check
 * @param {Item} item - The item to check
 * @param {string | undefined} [type] - the item type to check
 * @returns {boolean} - Returns TRUE if the given item & type is limited but allowed for the player
 */
function InventoryIsAllowedLimited(C, item, type) {
	return !InventoryBlockedOrLimited(C, item, type) &&
		InventoryIsPermissionLimited(C, item.Asset.Name, item.Asset.Group.Name, type);
}

/**
 * Returns TRUE if the item is a key, having the effect of unlocking other items
 * @param {Item} Item - The item to validate
 * @returns {Boolean} - TRUE if item is a key
 */
function InventoryIsKey(Item) {
	if ((Item == null) || (Item.Asset == null) || (Item.Asset.Effect == null)) return false;
	for (let E = 0; E < Item.Asset.Effect.length; E++)
		if (Item.Asset.Effect[E].substr(0, 7) == "Unlock-")
			return true;
	return false;
}

/**
 * Serialises the provided character's inventory into a string for easy comparisons, inventory items are uniquely
 * identified by their name and group
 * @param {Character} C - The character whose inventory we should serialise
 * @return {string} - A simple string representation of the character's inventory
 */
function InventoryStringify(C) {
	if (!C || !Array.isArray(C.Inventory)) return "";
	return C.Inventory.map(({ Name, Group }) => Group + Name ).join();
}

/**
 * Returns TRUE if the inventory category is blocked in the current chat room
 * @param {array} Category - An array of string containing all the categories to validate
 * @return {boolean} - TRUE if it's blocked
 */
function InventoryChatRoomAllow(Category) {
	if ((CurrentScreen == "ChatRoom") && (Category != null) && (Category.length > 0) && (ChatRoomData != null) && (ChatRoomData.BlockCategory != null) && (ChatRoomData.BlockCategory.length > 0))
		for (let C = 0; C < Category.length; C++)
			if (ChatRoomData.BlockCategory.indexOf(Category[C]) >= 0)
				return false;
	return true;
}

/**
 * Applies a preset expression from being shocked to the character if able
 * @param {Character} C - The character to update
 * @returns {void} - Nothing
 */
function InventoryShockExpression(C) {
	const expressions = [
		{ Group: "Eyebrows", Name: "Soft", Timer: 10 },
		{ Group: "Blush", Name: "Medium", Timer: 15 },
		{ Group: "Eyes", Name: "Closed", Timer: 5 },
	];
	InventoryExpressionTriggerApply(C, expressions);
}

/**
 * Extracts all lock-related properties from an item's property object
 * @param {ItemProperties} property - The property object to extract from
 * @returns {ItemProperties} - A property object containing only the lock-related properties from the provided property
 * object
 */
function InventoryExtractLockProperties(property) {
	/** @type {ItemProperties} */
	const lockProperties = {};
	for (const key of Object.keys(property)) {
		if (ValidationAllLockProperties.includes(key)) {
			lockProperties[key] = JSON.parse(JSON.stringify(property[key]));
		}
	}
	return lockProperties;
}
