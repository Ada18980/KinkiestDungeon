"use strict";
/** @type Character[] */
let Character = [];
let CharacterNextId = 1;

/** @type Map<EffectName, number> */
const CharacterDeafLevels = new Map([
	["DeafTotal", 4],
	["DeafHeavy", 3],
	["DeafNormal", 2],
	["DeafLight", 1],
]);

/** @type Map<EffectName, number> */
const CharacterBlurLevels = new Map([
	["BlurTotal", 50],
	["BlurHeavy", 20],
	["BlurNormal", 8],
	["BlurLight", 3],
]);

/**
 * An enum representing the various character archetypes
 * ONLINE: The player, or a character representing another online player
 * NPC: Any NPC
 * SIMPLE: Any simple character, generally used internally and not to represent an actual in-game character
 * @type {Record<"ONLINE"|"NPC"|"SIMPLE", CharacterType>}
 */
let CharacterType = {
	ONLINE: "online",
	NPC: "npc",
	SIMPLE: "simple",
};

/**
 * Loads a character into the buffer, creates it if it does not exist
 * @param {number} CharacterID - ID of the character
 * @param {string} CharacterAssetFamily - Name of the asset family of the character
 * @param {CharacterType} [Type=CharacterType.ONLINE] - The character type
 * @returns {Character} - The newly loaded character
 */
function CharacterReset(CharacterID, CharacterAssetFamily, Type = CharacterType.ONLINE) {

	// Prepares the character sheet
	/** @type {Character} */
	let NewCharacter = {
		ID: CharacterID,
		Name: "",
		Type,
		AssetFamily: CharacterAssetFamily,
		AccountName: "",
		Owner: "",
		Lover: "",
		Money: 0,
		Inventory: [],
		Appearance: [],
		Stage: "0",
		CurrentDialog: "",
		Dialog: [],
		Reputation: [],
		Skill: [],
		Pose: [],
		Effect: [],
		Tints: [],
		FocusGroup: null,
		Canvas: null,
		CanvasBlink: null,
		MustDraw: false,
		BlinkFactor: Math.round(Math.random() * 10) + 10,
		AllowItem: true,
		BlockItems: [],
		LimitedItems: [],
		BlackList: [],
		IsKneeling: function () {
			throw new Error("Function not implemented.");
		},
		FavoriteItems: [],
		WhiteList: [],
		HeightModifier: 0
	};

	// If the character doesn't exist, we create it
	let CharacterIndex = Character.findIndex(c => c.ID == CharacterID);
	if (CharacterIndex == -1)
		Character.push(NewCharacter);
	else
		Character[CharacterIndex] = NewCharacter;

	// Creates the inventory and default appearance
	if (CharacterID == 0) {
		Player = NewCharacter;
		CharacterAppearanceSetDefault(NewCharacter);
	}

	// Load the character image
	CharacterLoadCanvas(NewCharacter);

	return NewCharacter;
}


/**
 * Loads the content of a CSV file to build the character dialog. Can override the current screen.
 * @param {Character} C - Character for which to build the dialog objects
 * @param {string} [Override] - Optional: Path to the specific CSV to build the character dialog with
 * @returns {void} - Nothing
 */
function CharacterLoadCSVDialog(C, Override) {

	// Finds the full path of the CSV file to use cache
	let FullPath = ((C.ID == 0) ? "Screens/Character/Player/Dialog_Player" : ((Override == null) ? "Screens/" + CurrentModule + "/" + CurrentScreen + "/Dialog_" + C.AccountName : Override)) + ".csv";
	if (CommonCSVCache[FullPath]) {
		CharacterBuildDialog(C, CommonCSVCache[FullPath]);
		return;
	}

	// Opens the file, parse it and returns the result it to build the dialog
	CommonGet(FullPath, function () {
		if (this.status == 200) {
			CommonCSVCache[FullPath] = CommonParseCSV(this.responseText);
			CharacterBuildDialog(C, CommonCSVCache[FullPath]);
		}
	});

}


/**
 * Builds the dialog objects from the character CSV file
 * @param {Character} C - Character for which to build the dialog
 * @param {string[][]} CSV - Content of the CSV file
 * @returns {void} - Nothing
 */
function CharacterBuildDialog(C, CSV) {

	const OnlinePlayer = C.AccountName.indexOf("Online-") >= 0;
	C.Dialog = [];
	// For each lines in the file
	for (let L = 0; L < CSV.length; L++)
		if ((CSV[L][0] != null) && (CSV[L][0] != "")) {

			// Creates a dialog object
			const D = {};
			D.Stage = CSV[L][0];
			if ((CSV[L][1] != null) && (CSV[L][1].trim() != "")) D.NextStage = CSV[L][1];
			if ((CSV[L][2] != null) && (CSV[L][2].trim() != "")) D.Option = CSV[L][2].replace("DialogCharacterName", C.Name).replace("DialogPlayerName", CharacterNickname(Player));
			if ((CSV[L][3] != null) && (CSV[L][3].trim() != "")) D.Result = CSV[L][3].replace("DialogCharacterName", C.Name).replace("DialogPlayerName", CharacterNickname(Player));
			if ((CSV[L][4] != null) && (CSV[L][4].trim() != "")) D.Function = ((CSV[L][4].trim().substring(0, 6) == "Dialog") ? "" : OnlinePlayer ? "ChatRoom" : CurrentScreen) + CSV[L][4];
			if ((CSV[L][5] != null) && (CSV[L][5].trim() != "")) D.Prerequisite = CSV[L][5];
			if ((CSV[L][6] != null) && (CSV[L][6].trim() != "")) D.Group = CSV[L][6];
			if ((CSV[L][7] != null) && (CSV[L][7].trim() != "")) D.Trait = CSV[L][7];
			C.Dialog.push(D);

		}

	// Translate the dialog if needed
	TranslationDialog(C);

	if (C === Player) {
		for (const D of C.Dialog) {
			if (typeof D.Result === "string")
				PlayerDialog.set(D.Stage, D.Result);
		}
	}
}

/**
 * Attributes a random name for the character, does not select a name in use
 * @param {Character} C - Character for which to attribute a name
 * @returns {void} - Nothing
 */
function CharacterRandomName(C) {

	// Generates a name from the name bank
	let NewName = CharacterName[Math.floor(Math.random() * CharacterName.length)];
	C.Name = NewName;

	// If the name is already taken, we generate a new one
	for (let CN = 0; CN < Character.length; CN++)
		if ((Character[CN].Name == NewName) && (Character[CN].ID != C.ID)) {
			CharacterRandomName(C);
			return;
		}
}

/**
 * Create a minimal character object
 * @param {string} AccName - The account name to give to the character
 * @returns {Character} - The created character
 */
function CharacterLoadSimple(AccName) {
	// Checks if the character already exists and returns it if it's the case
	for (let C = 0; C < Character.length; C++)
		if (Character[C].AccountName === AccName)
			return Character[C];

	// Create the new character
	const CNew = CharacterReset(CharacterNextId++, "Female3DCG", CharacterType.SIMPLE);
	CNew.AccountName = AccName;

	// Returns the new character
	return CNew;
}

/**
 * Deletes an NPC from the buffer
 * @param {string} NPCType - Account name of the npc to delete
 * @returns {void} - Nothing
 */
function CharacterDelete(NPCType) {
	for (let C = 0; C < Character.length; C++)
		if (Character[C].AccountName == NPCType) {
			Character.splice(C, 1);
			return;
		}
}

/**
 * Adds a pose to a character's pose list, does not add it if it's already there
 * @param {Character} C - Character for which to add a pose to its list
 * @param {string} NewPose - The name of the pose to add
 * @returns {void} - Nothing
 */
function CharacterAddPose(C, NewPose) {
	for (let E = 0; E < NewPose.length; E++)
		if (C.Pose.indexOf(NewPose[E]) < 0)
			C.Pose.push(NewPose[E]);
}


/**
 * Checks if a certain pose is whitelisted and available for the pose menu
 * @param {Character} C - Character to check for the pose
 * @param {string|undefined} Type - Pose type to check for within items
 * @param {string} Pose - Pose to check for whitelist
 * @returns {boolean} - TRUE if the character has the pose available
 */
function CharacterItemsHavePoseAvailable(C, Type, Pose) {
	return true;
}

/**
 * Checks whether the items on a character set a given pose on the character
 * @param {Character} C - The character to check
 * @param {string} pose - The name of the pose to check for
 * @param {boolean} [excludeClothes=false] - Ignore clothing items in the check
 * @returns {boolean} - Returns true if the character is wearing an item that sets the given pose, false otherwise
 */
function CharacterDoItemsSetPose(C, pose, excludeClothes = false) {
	return false;
}


/**
 * Loads a character's canvas by sorting its appearance and drawing it.
 * @param {Character} C - Character to load the canvas for
 * @returns {void} - Nothing
 */
function CharacterLoadCanvas(C) {

}

/**
 * Reloads all character canvases in need of being redrawn.
 * @returns {void} - Nothing
 */
function CharacterLoadCanvasAll() {
}

/**
 * Refreshes the character parameters (Effects, poses, canvas, settings, etc.)
 * @param {Character} C - Character to refresh
 * @param {boolean} [Push=true] - Pushes the data to the server if true or null
 * @param {boolean} [RefreshDialog=true] - Refreshes the character dialog
 * @returns {void} - Nothing
 */
function CharacterRefresh(C, Push, RefreshDialog = true) {
}



/**
 * Removes all appearance items from the character
 * @param {Character} C - Character to undress
 * @returns {void} - Nothing
 */
function CharacterNaked(C) {
	CharacterAppearanceNaked(C);
	CharacterRefresh(C);
}

/**
 * Sets a new pose for the character
 * @param {Character} C - Character for which to set the pose
 * @param {string} NewPose - Name of the pose to set as active
 * @param {boolean} [ForceChange=false] - TRUE if the set pose(s) should overwrite current active pose(s)
 * @returns {void} - Nothing
 */
function CharacterSetActivePose(C, NewPose, ForceChange = false) {
	return;
}

/**
 * Sets a specific facial expression for the character's specified AssetGroup, if there's a timer, the expression will expire after it, a
 * timed expression cannot override another one.
 * @param {Character} C - Character for which to set the expression of
 * @param {string} AssetGroup - Asset group for the expression
 * @param {string} Expression - Name of the expression to use
 * @param {number} [Timer] - Optional: time the expression will last
 * @param {string|string[]} [Color] - Optional: color of the expression to set
 * @returns {void} - Nothing
 */
function CharacterSetFacialExpression(C, AssetGroup, Expression, Timer, Color) {
	if (StandalonePatched) {
		// TODO add facial expression handling
		return;
	}
}

/**
 * Resets the character's facial expression to the default
 * @param {Character} C - Character for which to reset the expression of
 * @returns {void} - Nothing
 */
function CharacterResetFacialExpression(C) {
	if (StandalonePatched) {
		// TODO add facial expression handling
		return;
	}
}

/**
 * Gets the currently selected character
 * @returns {Character|null} - Currently selected character
 */
function CharacterGetCurrent() {
	return Player;
}

/**
 * Returns the nickname of a character, or the name if the nickname isn't valid
 * Also validates if the character is a GGTS drone to alter her name
 * @param {Character} C - The character breaking from their owner
 * @returns {String} - The nickname to return
 */
function CharacterNickname(C) {
	return "";
}



/**
 * Loads an NPC into the character array. The appearance is randomized, and a type can be provided to dress them in a given style.
 * @param {string} NPCType - Archetype of the NPC
 * @returns {NPCCharacter} - The randomly generated NPC
 */
function CharacterLoadNPC(NPCType) {

	// Checks if the NPC already exists and returns it if it's the case
	for (let C = 0; C < Character.length; C++)
		if (Character[C].AccountName == NPCType)
			return Character[C];

	// Randomize the new character
	CharacterReset(CharacterNextId++, "Female3DCG", CharacterType.NPC);
	const CNew = Character[Character.length - 1];
	CNew.AccountName = NPCType;
	CharacterRandomName(CNew);
	//CharacterAppearanceBuildAssets(C);
	//CharacterAppearanceFullRandom(C);

	// Returns the new character
	return CNew;

}

/**
 * Removes all items except for clothing and slave collars from the character
 * @param {Character} C - Character to release
 * @returns {void} - Nothing
 */
function CharacterReleaseTotal(C) {
	for (let E = C.Appearance.length - 1; E >= 0; E--) {
		if (!(C.Appearance[E].Model?.Restraint == undefined)) {
			C.Appearance.splice(E, 1);
		}
	}
	CharacterRefresh(C);
}