"use strict";
var WardrobeBackground = "Private";
var WardrobeCharacter = [];
var WardrobeSelection = -1;
var WardrobeOffset = 0;
var WardrobeSize = 24;

/**
 * Loads the player's wardrobe safe spots. If a spot is not named yet, initializes it with the player's name
 * @returns {void} - Nothing
 */
function WardrobeLoadCharacterNames() {
	if (Player.WardrobeCharacterNames == null) Player.WardrobeCharacterNames = [];
	let Push = false;
	while (Player.WardrobeCharacterNames.length <= WardrobeSize) {
		Player.WardrobeCharacterNames.push(Player.Name);
		Push = true;
	}
	if (Push) ServerAccountUpdate.QueueData({ WardrobeCharacterNames: Player.WardrobeCharacterNames });
}

/**
 * Makes sure the wardrobe is of the correct length. If someone tampered with the wardrobe's size, all
 * extended slots are deleted
 * @returns {void} - Nothing
 */
function WardrobeFixLength() {
	if (Player.Wardrobe != null) {
		if (Player.Wardrobe.length > WardrobeSize) Player.Wardrobe = Player.Wardrobe.slice(0, WardrobeSize - 1);
		while (Player.Wardrobe.length < WardrobeSize) Player.Wardrobe.push(null);
	}
}

/**
 * Loads all wardrobe characters. If the slot of the wardrobe is currently unused, display a randomly dressed character.
 * Saves the current wardrobe on the server
 * @param {boolean} Fast
 * @returns {void} - Nothing
 */
function WardrobeLoadCharacters(Fast) {
	Fast = Fast == null ? false : Fast;
	let W = null;
	WardrobeLoadCharacterNames();
	if (Player.Wardrobe == null) Player.Wardrobe = [];
	for (let P = 0; P < WardrobeSize; P++) {
		if (WardrobeCharacter.length <= P && ((W == null) || !Fast)) {

			// Creates a character
			const C = CharacterLoadSimple(`Wardrobe-${P}`);
			C.Name = Player.WardrobeCharacterNames[P];
			CharacterAppearanceBuildAssets(C);

			// Loads from player data or generates at full random
			if (Player.Wardrobe[P] != null) {
				C.Appearance = [];
				WardrobeFastLoad(C, P);
			} else {
				CharacterAppearanceFullRandom(C);
				WardrobeFastSave(C, P, false);
				W = P;
			}

			// Keep the character
			WardrobeCharacter.push(C);

		} else if (W != null) {

			// randomize only one character
			CharacterAppearanceFullRandom(WardrobeCharacter[W]);
			WardrobeFastSave(WardrobeCharacter[W], P, false);

		}
	}
	if (W != null) {
		WardrobeFixLength();
		if (Fast) WardrobeFastLoad(WardrobeCharacter[W], W);
		ServerAccountUpdate.QueueData({ Wardrobe: CharacterCompressWardrobe(Player.Wardrobe) });
	}
}

/**
 * Loads the player's wardrobe. when the player opens the wardrobe screen for the first time.
 * This function is called dynamically.
 * @returns {void} - Nothing
 *
 */
function WardrobeLoad() {
	WardrobeSelection = -1;
	CurrentDarkFactor = 0.5;
	// Always open the wardrobe on the first page
	WardrobeOffset = 0;
	WardrobeLoadCharacters(false);
}

/**
 * Shows the wardrobe screen. This function is called dynamically on a repeated basis. So don't call complex functions
 * or use extended loops in this function.
 * @returns {void} - Nothing
 */
function WardrobeRun() {
	DrawCharacter(Player, 0, 0, 1);
	DrawButton(415, 25, 60, 60, "", "White", "Icons/Small/Prev.png");
	DrawButton(500, 25, 225, 60, TextGet("Load"), "White");
	DrawButton(750, 25, 225, 60, TextGet("Save"), "White");
	DrawButton(1000, 25, 60, 60, "", "White", "Icons/Small/Next.png");
	DrawButton(1750, 25, 225, 60, TextGet("Return"), "White");
	DrawText(TextGet("SelectAppareance"), 1405, 60, "White", "Gray");
	for (let C = 0; C < 12; C++)
		if (C < 6) {
			DrawCharacter(WardrobeCharacter[C + WardrobeOffset], 500 + C * 250, 100, 0.45);
			if (WardrobeSelection == C + WardrobeOffset) DrawEmptyRect(500 + C * 250, 105, 225, 440, "Cyan");
		}
		else {
			DrawCharacter(WardrobeCharacter[C + WardrobeOffset], 500 + (C - 6) * 250, 550, 0.45);
			if (WardrobeSelection == C + WardrobeOffset) DrawEmptyRect(500 + (C - 6) * 250, 555, 225, 440, "Cyan");
		}
}

/**
 * Handles the click events in the wardrobe screen. Clicks are propagated from CommonClick()
 * @returns {void} - Nothing
 */
function WardrobeClick() {

	// If we must go back to the room
	if (MouseIn(1750, 25, 225, 60))
		WardrobeExit();

	// If we must move to the previous page
	if (MouseIn(415, 25, 60, 60)) {
		WardrobeOffset -= 12;
		if (WardrobeOffset < 0) WardrobeOffset = Math.max(0, WardrobeSize - 12);
	}

	// If we must move to the next page
	if (MouseIn(1000, 25, 60, 60)) {
		WardrobeOffset += 12;
		if (WardrobeOffset >= WardrobeSize) WardrobeOffset = 0;
	}

	// If we must load a saved outfit
	if (MouseIn(500, 25, 225, 60) && (WardrobeSelection >= 0))
		WardrobeFastLoad(Player, WardrobeSelection);

	// If we must save an outfit
	if (MouseIn(750, 25, 225, 60) && (WardrobeSelection >= 0))
		WardrobeFastSave(Player, WardrobeSelection);

	// If we must select a different wardrobe
	if (MouseIn(500, 100, 1500, 900))
		for (let C = 0; C < 12; C++)
			if (C < 6) {
				if (MouseIn(500 + C * 250, 100, 250, 450))
					WardrobeSelection = C + WardrobeOffset;
			}
			else if (MouseIn(500 + (C - 6) * 250, 550, 250, 450))
				WardrobeSelection = C + WardrobeOffset;
}

/**
 * Exits the wardorbe screen and sends the player back to her private room
 * @returns {void} - Nothing
 */
function WardrobeExit() {
	CommonSetScreen("Room", "Private");
}

/**
 * Set a wardrobe character name, sync it with server
 * @param {number} W - The number of the wardrobe slot to save
 * @param {string} Name - The name of the wardrobe slot
 * @param {boolean} [Push=false] -If set to true, the changes are pushed to the server
 */
function WardrobeSetCharacterName(W, Name, Push) {
	Player.WardrobeCharacterNames[W] = Name;
	if (WardrobeCharacter != null && WardrobeCharacter[W] != null) {
		WardrobeCharacter[W].Name = Name;
	}
	if (Push == null || Push != false) {
		ServerAccountUpdate.QueueData({ WardrobeCharacterNames: Player.WardrobeCharacterNames });
	}
}

/**
 * Reduces a given asset to the attributes needed for the wardrobe
 * @param {Item} A - The asset that should be reduced
 * @returns {ItemBundle} - The bundled asset
 */
function WardrobeAssetBundle(A) {
	let Property;
	if (A.Property) {
		Property = Object.assign({}, A.Property);
		delete Property.Expression; // Don't add expressions to the wardrobe
		if (Object.keys(Property).length === 0) Property = undefined; // Don't save empty properties
	}
	return { Name: A.Asset.Name, Group: A.Asset.Group.Name, Color: A.Color, Property };
}

/**
 * Load character appearance from wardrobe, only load clothes on others
 * @param {Character} C - The character the appearance should be loaded for
 * @param {number} W - The spot in the wardrobe the appearance should be loaded to
 * @param {boolean} [Update=false] - If set to true, the appearance will be updated to the server
 * @returns {void} - Nothing
 */
function WardrobeFastLoad(C, W, Update) {
	var savedExpression = {};
	if (C == Player) savedExpression = WardrobeGetExpression(Player);
	if ((Player.Wardrobe != null) && (Player.Wardrobe[W] != null) && (Player.Wardrobe[W].length > 0)) {
		C.Appearance = C.Appearance
			.filter(a => a.Asset.Group.Category != "Appearance" || !WardrobeGroupAccessible(C, a.Asset.Group, { ExcludeNonCloth: true }));
		Player.Wardrobe[W]
			.filter(w => w.Name != null && w.Group != null)
			.filter(w => C.Appearance.find(a => a.Asset.Group.Name == w.Group) == null)
			.forEach(w => {
				const A = AssetGet(C.AssetFamily, w.Group, w.Name);
				if (
					A
					&& A.Group.Category == "Appearance"
					&& WardrobeGroupAccessible(C, A.Group, { ExcludeNonCloth: true })
					&& (A.Value == 0 || InventoryAvailable(Player, A.Name, A.Group.Name))
				) {
					CharacterAppearanceSetItem(C, w.Group, A, w.Color, 0, null, false);
					if (w.Property && InventoryGet(C, w.Group)) {
						var item = InventoryGet(C, w.Group);
						if (item.Property == null) item.Property = {};
						for (const key of Object.keys(w.Property)) {
							if (key !== "Expression") item.Property[key] = w.Property[key];
						}
					}
				}
			});
		// Adds any critical appearance asset that could be missing, adds the default one
		AssetGroup
			.filter(g => g.Category == "Appearance" && !g.AllowNone)
			.forEach(g => {
				if (C.Appearance.find(a => a.Asset.Group.Name == g.Name) == null) {
					// For a group with a mirrored group, we copy the opposite if it exists
					if (g.MirrorGroup && InventoryGet(C, g.MirrorGroup)) {
						C.Appearance.push({ Asset: AssetGet(C.AssetFamily, g.Name, InventoryGet(C, g.MirrorGroup).Asset.Name), Difficulty: 0, Color: InventoryGet(C, g.MirrorGroup).Color });
					} else {
						C.Appearance.push({ Asset: AssetGroupGet(C.AssetFamily, g.Name).Asset[0], Difficulty: 0, Color: "Default" });
					}
				}
			});
		// Restores the expressions the player had previously per item in the appearance
		if (C == Player) {
			Player.Appearance.forEach(item => {
				if (savedExpression[item.Asset.Group.Name] != null) {
					if (item.Property == null) item.Property = {};
					item.Property.Expression = savedExpression[item.Asset.Group.Name];

				}
			});
		}
		CharacterLoadPose(C);
		CharacterLoadCanvas(C);
		if (Update == null || Update) {
			if (C.ID == 0 && C.OnlineID != null) ServerPlayerAppearanceSync();
			if (C.ID == 0 || C.AccountName.indexOf("Online-") == 0) ChatRoomCharacterUpdate(C);
		}
	}
}

/**
 * Saves character appearance in player's wardrobe, use player's body as base for others
 * @param {Character} C - The character, whose appearance should be saved
 * @param {number} W - The spot in the wardrobe the current outfit should be saved to
 * @param {boolean} [Push=false] - If set to true, the wardrobe is saved on the server
 * @returns {void} - Nothing
 */
function WardrobeFastSave(C, W, Push) {
	if (Player.Wardrobe != null) {
		var AddAll = C.ID == 0 || C.AccountName.indexOf("Wardrobe-") == 0;
		Player.Wardrobe[W] = C.Appearance
			.filter(a => a.Asset.Group.Category == "Appearance")
			.filter(a => WardrobeGroupAccessible(C, a.Asset.Group, { ExcludeNonCloth: AddAll }))
			.map(WardrobeAssetBundle);
		if (!AddAll) {
			// Using Player's body as base
			Player.Wardrobe[W] = Player.Wardrobe[W].concat(Player.Appearance
				.filter(a => a.Asset.Group.Category == "Appearance")
				.filter(a => !a.Asset.Group.Clothing)
				.map(WardrobeAssetBundle));
		}
		WardrobeFixLength();
		if (WardrobeCharacter != null && WardrobeCharacter[W] != null && C.AccountName != WardrobeCharacter[W].AccountName) WardrobeFastLoad(WardrobeCharacter[W], W);
		if ((Push == null) || Push) ServerAccountUpdate.QueueData({ Wardrobe: CharacterCompressWardrobe(Player.Wardrobe) });
	}
}

/**
 * Returns the expressions of character C as a single big object
 * @param {Character} C - The character whose expressions should be returned
 * @returns {object} Expression - The expresssion of a character
 */
function WardrobeGetExpression(C) {
	var characterExpression = {};
	ServerAppearanceBundle(C.Appearance).filter(item => item.Property != null && item.Property.Expression != null).forEach(item => characterExpression[item.Group] = item.Property.Expression);
	return characterExpression;
}

/**
 * Checks if a given group of a character can be accessed.
 * @param {Character} C - The character in the wardrobe
 * @param {AssetGroup} Group - The group to check for accessibility
 * @returns {boolean} - Whether the zone can be altered or not.
 */
function WardrobeGroupAccessible(C, Group, Options) {

	// You can always edit yourself.
	if (C.IsPlayer() || C.AccountName.indexOf("Wardrobe-") == 0) return true;

	// You cannot always change body cosplay
	if (Group.BodyCosplay && C.OnlineSharedSettings && C.OnlineSharedSettings.BlockBodyCosplay) return false;

	// Clothes can always be edited
	if (Group.Clothing) return true;

	// You can filter out non-clothing options
	if (!Options || !Options.ExcludeNonCloth) {
		// If the player allows all
		if (C.OnlineSharedSettings && C.OnlineSharedSettings.AllowFullWardrobeAccess) return true;
	}

	return false;
}
