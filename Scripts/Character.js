"use strict";
/** @type Character[] */
var Character = [];
var CharacterNextId = 1;

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
var CharacterType = {
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
	var NewCharacter = {
		ID: CharacterID,
		Hooks: null,
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
		DrawPose: [],
		DrawAppearance: [],
		AllowedActivePose: [],
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
		FavoriteItems: [],
		HiddenItems: [],
		WhiteList: [],
		BlackList: [],
		HeightModifier: 0,
		HeightRatio: 1,
		HasHiddenItems: false,
		SavedColors: GetDefaultSavedColors(),
		CanTalk: function () {
			let GagEffect = SpeechGetGagLevel(this, ["ItemMouth", "ItemMouth2", "ItemMouth3", "ItemHead", "ItemHood", "ItemNeck", "ItemDevices"]);
			return (GagEffect <= 0);
		},
		CanWalk: function () {
			return (
				(this.Effect.indexOf("Freeze") < 0) &&
				(this.Effect.indexOf("Tethered") < 0) &&
				((this.Pose == null) || (this.Pose.indexOf("Kneel") < 0) || (this.Effect.indexOf("KneelFreeze") < 0))
			);
		},
		CanKneel: function () {
			return CharacterCanKneel(this);
		},
		CanInteract: function () {
			return (this.Effect.indexOf("Block") < 0);
		},
		CanChangeOwnClothes: function () {
			return this.CanChangeClothesOn(this);
		},
		CanChangeClothesOn: function (C) {
			if (this.IsPlayer() && C.IsPlayer()) {
				return (
					!C.IsRestrained()
				);
			} else {
				return (
					this.CanInteract() &&
					C.MemberNumber != null &&
					C.AllowItem &&
					!C.IsEnclose() &&
					!(InventoryGet(CurrentCharacter, "ItemNeck") !== null &&
						InventoryGet(CurrentCharacter, "ItemNeck").Asset.Name == "ClubSlaveCollar")
				);
			}
		},
		IsProne: function () {
			return (this.Effect.indexOf("Prone") >= 0);
		},
		IsRestrained: function () {
			return (
				(this.Effect.indexOf("Freeze") >= 0) ||
				(this.Effect.indexOf("Block") >= 0) ||
				(this.Effect.indexOf("Prone") >= 0)
			);
		},
		/** Look for blindness effects and return the worst (limited by settings), Light: 1, Normal: 2, Heavy: 3 */
		GetBlindLevel: function (eyesOnly = false) {
			let blindLevel = 0;
			const eyes1 = InventoryGet(this, "Eyes");
			const eyes2 = InventoryGet(this, "Eyes2");
			if (eyes1 && eyes1.Property && eyes1.Property.Expression && eyes2 && eyes2.Property && eyes2.Property.Expression) {
				if ((eyes1.Property.Expression === "Closed") && (eyes2.Property.Expression === "Closed")) {
					blindLevel += DialogFacialExpressionsSelectedBlindnessLevel;
				}
			}
			if (!eyesOnly) {
				if (this.Effect.includes("BlindTotal")) blindLevel += 4;
				else if (this.Effect.includes("BlindHeavy")) blindLevel += 3;
				else if (this.Effect.includes("BlindNormal")) blindLevel += 2;
				else if (this.Effect.includes("BlindLight")) blindLevel += 1;
			}
			blindLevel = Math.min(3, blindLevel);
			// Light sensory deprivation setting limits blindness
			if (this.IsPlayer() && this.GameplaySettings && this.GameplaySettings.SensDepChatLog == "SensDepLight") blindLevel = Math.min(2, blindLevel);
			return blindLevel;
		},
		GetBlurLevel: function() {
			if ((this.IsPlayer() && this.GraphicsSettings && !this.GraphicsSettings.AllowBlur) || CommonPhotoMode) {
				return 0;
			}
			let blurLevel = 0;
			for (const item of this.Appearance) {
				for (const [effect, level] of CharacterBlurLevels.entries()) {
					if (InventoryItemHasEffect(item, effect)) {
						blurLevel += level;
						break; // Only count the highest blur level defined on the item
					}
				}
			}
			return blurLevel;
		},
		IsLocked: function () {
			return this.Effect.indexOf("Lock") > 0;
		},
		IsBlind: function () {
			return this.GetBlindLevel() > 0;
		},
		IsEnclose: function () {
			return (this.Effect.indexOf("Enclose") >= 0 || (this.Effect.indexOf("OneWayEnclose") >= 0 && this.ID == 0));
		},
		IsMounted: function () {
			return (this.Effect.indexOf("Mounted") >= 0);
		},
		IsChaste: function () {
			return ((this.Effect.indexOf("Chaste") >= 0) || (this.Effect.indexOf("BreastChaste") >= 0));
		},
		IsVulvaChaste: function () {
			return (this.Effect.indexOf("Chaste") >= 0);
		},
		IsPlugged: function () {
			return (this.Effect.indexOf("IsPlugged") >= 0);
		},
		IsButtChaste: function () {
			return this.Effect.includes("ButtChaste");
		},
		IsBreastChaste: function () {
			return (this.Effect.indexOf("BreastChaste") >= 0);
		},
		IsShackled: function () {
			return (this.Effect.indexOf("Shackled") >= 0);
		},
		IsSlow: function () {
			return (
				((this.Effect.indexOf("Slow") >= 0) || (this.Pose.indexOf("Kneel") >= 0)) &&
				((this.ID != 0) || !/** @type {PlayerCharacter} */(this).RestrictionSettings.SlowImmunity)
			);
		},
		IsEgged: function () {
			return (this.Effect.indexOf("Egged") >= 0);
		},
		IsMouthBlocked: function () {
			return this.Effect.indexOf("BlockMouth") >= 0;
		},
		IsMouthOpen: function () {
			return this.Effect.indexOf("OpenMouth") >= 0;
		},
		IsVulvaFull: function () {
			return this.Effect.indexOf("FillVulva") >= 0;
		},
		IsFixedHead: function () {
			return this.Effect.includes("FixedHead");
		},
		IsOwned: function () {
			return false;
		},
		IsOwnedByPlayer: function () {
			return false;
		},
		IsOwnedByMemberNumber: function (memberNumber) {
			return false;
		},
		IsOwner: function () {
			return false;
		},
		IsLoverOfPlayer: function () {
			return false;
		},
		IsLover: function (C) {
			return false;
		},
		IsLoverOfMemberNumber: function (memberNumber) {
			return false;
		},
		GetLoversNumbers: function (MembersOnly) {
			return [];
		},
		GetDeafLevel: function () {
			let deafLevel = 0;
			for (const item of this.Appearance) {
				for (const [effect, level] of CharacterDeafLevels.entries()) {
					if (InventoryItemHasEffect(item, effect)) {
						deafLevel += level;
						break; // Only count the highest deafness level defined on the item
					}
				}
			}
			return deafLevel;
		},
		IsLoverPrivate: function () {
			return false;
		},
		IsKneeling: function () {
			return (this.Pose != null && (this.Pose.includes("Kneel") || this.Pose.includes("KneelingSpread")));
		},
		IsNaked: function () {
			return CharacterIsNaked(this);
		},
		IsDeaf: function () {
			return this.GetDeafLevel() > 0;
		},
		HasNoItem: function () {
			return CharacterHasNoItem(this);
		},
		IsEdged: function () {
			return CharacterIsEdged(this);
		},
		IsPlayer: function () {
			return this.ID === 0;
		},
		IsOnline: function () {
			return this.Type === CharacterType.ONLINE;
		},
		IsNpc: function () {
			return (this.Type !== CharacterType.ONLINE) && (this.Type !== CharacterType.SIMPLE);
		},
		IsSimple: function () {
			return this.Type === CharacterType.SIMPLE;
		},
		GetDifficulty: function () {
			return 1;
		},
		IsSuspended: function () {
			return this.Pose.includes("Suspension") || this.Effect.includes("Suspended");
		},
		IsInverted: function () {
			return this.Pose.indexOf("Suspension") >= 0;
		},
		CanChangeToPose: function (Pose) {
			return CharacterCanChangeToPose(this, Pose);
		},
		GetClumsiness: function () {
			return CharacterGetClumsiness(this);
		},
		HasEffect: function(Effect) {
			return this.Effect.includes(Effect);
		},
		HasTints: function() {
			if (this.IsPlayer() && this.ImmersionSettings && !this.ImmersionSettings.AllowTints) {
				return false;
			}
			return !CommonPhotoMode && this.Tints.length > 0;
		},
		GetTints: function() {
			return CharacterGetTints(this);
		},
		// Adds a new hook with a Name (determines when the hook will happen, an Instance ID (used to differentiate between different hooks happening at the same time), and a function that is run when the hook is called)
		RegisterHook: function (hookName, hookInstance, callback) {
			if (!this.Hooks) this.Hooks = new Map();

			let hooks = this.Hooks.get(hookName);
			if (!hooks) {
				hooks = new Map();
				this.Hooks.set(hookName, hooks);
			}

			if (!hooks.has(hookInstance)) {
				hooks.set(hookInstance, callback);
				return true;
			}
			return false;
		},
		// Removes a hook based on hookName and hookInstance
		UnregisterHook: function (hookName, hookInstance) {
			if (!this.Hooks) return false;

			const hooks = this.Hooks.get(hookName);
			if (hooks && hooks.delete(hookInstance)) {
				if (hooks.size == 0) {
					this.Hooks.delete(hookName);
				}
				return true;
			}

			return false;
		}
	};

	// If the character doesn't exist, we create it
	var CharacterIndex = Character.findIndex(c => c.ID == CharacterID);
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
	var FullPath = ((C.ID == 0) ? "Screens/Character/Player/Dialog_Player" : ((Override == null) ? "Screens/" + CurrentModule + "/" + CurrentScreen + "/Dialog_" + C.AccountName : Override)) + ".csv";
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
	var NewName = CharacterName[Math.floor(Math.random() * CharacterName.length)];
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
	const C = CharacterReset(CharacterNextId++, "Female3DCG", CharacterType.SIMPLE);
	C.AccountName = AccName;

	// Returns the new character
	return C;
}

/**
 * Deletes an NPC from the buffer
 * @param {string} NPCType - Account name of the npc to delete
 * @returns {void} - Nothing
 */
function CharacterDelete(NPCType) {
	for (let C = 0; C < Character.length; C++)
		if (Character[C].AccountName == NPCType) {
			AnimationPurge(Character[C], true);
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
 * Checks whether the given character can change to the named pose unaided
 * @param {Character} C - The character to check
 * @param {string} poseName - The name of the pose to check for
 * @returns {boolean} - Returns true if the character has no conflicting items and is not prevented from changing to
 * the provided pose
 */
function CharacterCanChangeToPose(C, poseName) {
	const pose = PoseFemale3DCG.find(P => P.Name === poseName);
	if (!pose) return false;
	const poseCategory = pose.Category;
	if (!CharacterItemsHavePoseAvailable(C, poseCategory, pose.Name)) return false;
	return !C.Appearance.some(item => InventoryGetItemProperty(item, "FreezeActivePose").includes(poseCategory));
}

/**
 * Checks if a certain pose is whitelisted and available for the pose menu
 * @param {Character} C - Character to check for the pose
 * @param {string|undefined} Type - Pose type to check for within items
 * @param {string} Pose - Pose to check for whitelist
 * @returns {boolean} - TRUE if the character has the pose available
 */
function CharacterItemsHavePoseAvailable(C, Type, Pose) {
	const ConflictingPoses = PoseFemale3DCG.filter(P => P.Name !== Pose && (P.Category == Type || P.Category == "BodyFull")).map(P => P.Name);

	for (let i = 0, Item = null; i < C.Appearance.length; i++) {
		Item = C.Appearance[i];

		const WhitelistActivePose = InventoryGetItemProperty(Item, "WhitelistActivePose");
		if (WhitelistActivePose != null && WhitelistActivePose.includes(Pose)) continue;

		const AllowActivePose = InventoryGetItemProperty(Item, "AllowActivePose");
		if (AllowActivePose != null && AllowActivePose.includes(Pose)) continue;

		const SetPose = InventoryGetItemProperty(Item, "SetPose", true);
		if (SetPose != null && SetPose.find(P => ConflictingPoses.includes(P))) return false;
	}
	return true;
}

/**
 * Checks if a character has a pose from items (not active pose unless an item lets it through)
 * @param {Character} C - Character to check for the pose
 * @param {string} Pose - Pose to check for within items
 * @param {boolean} [ExcludeClothes=false] - Ignore clothing items in the check
 * @returns {boolean} - TRUE if the character has the pose
 */
function CharacterItemsHavePose(C, Pose, ExcludeClothes = false) {
	if (C.ActivePose != null && C.AllowedActivePose.includes(Pose) && (typeof C.ActivePose == "string" && C.ActivePose == Pose || Array.isArray(C.ActivePose) && C.ActivePose.includes(Pose))) return true;
	return CharacterDoItemsSetPose(C, Pose, ExcludeClothes);
}

/**
 * Checks whether the items on a character set a given pose on the character
 * @param {Character} C - The character to check
 * @param {string} pose - The name of the pose to check for
 * @param {boolean} [excludeClothes=false] - Ignore clothing items in the check
 * @returns {boolean} - Returns true if the character is wearing an item that sets the given pose, false otherwise
 */
function CharacterDoItemsSetPose(C, pose, excludeClothes = false) {
	return C.Appearance
		.filter(item => !excludeClothes || !item.Asset.Group.Clothing)
		.some(item => {
			const setPose = InventoryGetItemProperty(item, "SetPose", true);
			return setPose && setPose.includes(pose);
		});
}

/**
 * Checks if a character has a pose type from items (not active pose unless an item lets it through)
 * @param {Character} C - Character to check for the pose type
 * @param {string} Type - Pose type to check for within items
 * @param {boolean} OnlyItems - Whether or not allowed activeposes should be ignored.
 * @returns {boolean} - TRUE if the character has the pose type active
 */
function CharacterItemsHavePoseType(C, Type, OnlyItems) {
	var PossiblePoses = PoseFemale3DCG.filter(P => P.Category == Type || P.Category == "BodyFull").map(P => P.Name);

	for (let A = 0; A < C.Appearance.length; A++) {
		if (!OnlyItems && C.Appearance[A].Asset.AllowActivePose != null && (C.Appearance[A].Asset.AllowActivePose.find(P => PossiblePoses.includes(P) && C.AllowedActivePose.includes(P))))
			return true;
		if ((C.Appearance[A].Property != null) && (C.Appearance[A].Property.SetPose != null) && (C.Appearance[A].Property.SetPose.find(P => PossiblePoses.includes(P))))
			return true;
		else if (C.Appearance[A].Asset.SetPose != null && (C.Appearance[A].Asset.SetPose.find(P => PossiblePoses.includes(P))))
			return true;
		else if (C.Appearance[A].Asset.Group.SetPose != null && (C.Appearance[A].Asset.Group.SetPose.find(P => PossiblePoses.includes(P))))
			return true;
	}
	return false;
}

/**
 * Refreshes the list of poses for a character. Each pose can only be found once in the pose array
 * @param {Character} C - Character for which to refresh the pose list
 * @returns {void} - Nothing
 */
function CharacterLoadPose(C) {
	C.Pose = [];
	C.AllowedActivePose = [];

	for (let i = 0, Item = null; i < C.Appearance.length; i++) {
		Item = C.Appearance[i];
		const AllowActivePose = InventoryGetItemProperty(Item, "AllowActivePose");
		if (Array.isArray(AllowActivePose)) AllowActivePose.forEach(Pose => C.AllowedActivePose.push(Pose));

		const SetPose = InventoryGetItemProperty(Item, "SetPose", true);
		if (SetPose != null) CharacterAddPose(C, SetPose);
	}

	// Add possible active poses (Bodyfull can only be alone, and cannot have two of upperbody or bodylower)
	var Poses = C.Pose.map(CP => PoseFemale3DCG.find(P => P.Name == CP)).filter(P => P);
	if (C.ActivePose != null && typeof C.ActivePose == "string") C.ActivePose = [C.ActivePose];

	if (C.ActivePose != null && Array.isArray(C.ActivePose)) {
		var ActivePoses = C.ActivePose
			.map(CP => PoseFemale3DCG.find(P => P.Name == CP))
			.filter(P => P);

		for (let P = 0; P < ActivePoses.length; P++) {
			var HasPose = C.Pose.includes(ActivePoses[P].Name);
			var IsAllowed = C.AllowedActivePose.includes(ActivePoses[P].Name) && CharacterItemsHavePoseAvailable(C, ActivePoses[P].Category, ActivePoses[P].Name);
			var MissingGroup = !Poses.find(Pose => Pose.Category == "BodyFull") && !Poses.find(Pose => Pose.Category == ActivePoses[P].Category);
			var IsFullBody = C.Pose.length > 0 && ActivePoses[P].Category == "BodyFull";
			if (!HasPose && (IsAllowed || (MissingGroup && !IsFullBody)))
				C.Pose.push(ActivePoses[P].Name);
		}
	}
}

/**
 * Refreshes the list of effects for a character. Each effect can only be found once in the effect array
 * @param {Character} C - Character for which to refresh the effect list
 * @returns {void} - Nothing
 */
function CharacterLoadEffect(C) {
	C.Effect = CharacterGetEffects(C);
	CharacterLoadTints(C);
}

/**
 * Returns a list of effects for a character from some or all groups
 * @param {Character} C - The character to check
 * @param {string[]} [Groups=null] - Optional: The list of groups to consider. If none defined, check all groups
 * @param {boolean} [AllowDuplicates=false] - Optional: If true, keep duplicates of the same effect provided they're taken from different groups
 * @returns {string[]} - A list of effects
 */
function CharacterGetEffects(C, Groups = null, AllowDuplicates = false) {
	let totalEffects = [];
	C.Appearance
		.filter(A => !Array.isArray(Groups) || Groups.length == 0 || Groups.includes(A.Asset.Group.Name))
		.forEach(item => {
			let itemEffects = [];
			let overrideAsset = false;

			if (item.Property && Array.isArray(item.Property.Effect)) {
				CommonArrayConcatDedupe(itemEffects, item.Property.Effect);
				overrideAsset = !!item.Property.OverrideAssetEffect;
			}
			if (!overrideAsset) {
				if (Array.isArray(item.Asset.Effect)) {
					CommonArrayConcatDedupe(itemEffects, item.Asset.Effect);
				} else if (Array.isArray(item.Asset.Group.Effect)) {
					CommonArrayConcatDedupe(itemEffects, item.Asset.Group.Effect);
				}
			}

			if (AllowDuplicates) {
				totalEffects = totalEffects.concat(itemEffects);
			} else {
				CommonArrayConcatDedupe(totalEffects, itemEffects);
			}
		});
	return totalEffects;
}

/**
 * Loads a character's tints, resolving tint definitions against items from the character's appearance
 * @param {Character} C - Character whose tints should be loaded
 * @returns {void} - Nothing
 */
function CharacterLoadTints(C) {
	// Tints on non-player characters don't have any effect right now, so don't bother loading them
	if (!C.IsPlayer()) {
		return;
	}

	/** @type {ResolvedTintDefinition[]} */
	const tints = [];
	for (const item of C.Appearance) {
		/** @type {TintDefinition[]} */
		const itemTints = InventoryGetItemProperty(item, "Tint");
		if (Array.isArray(itemTints)) {
			tints.push(...itemTints.map(({Color, Strength, DefaultColor}) => ({Color, Strength, DefaultColor, Item: item})));
		}
	}
	C.Tints = tints;
}

/**
 * Loads a character's canvas by sorting its appearance and drawing it.
 * @param {Character} C - Character to load the canvas for
 * @returns {void} - Nothing
 */
function CharacterLoadCanvas(C) {
	// Reset the property that tracks if wearing a hidden item
	C.HasHiddenItems = false;

	// We add a temporary appearance and pose here so that it can be modified by hooks.  We copy the arrays so no hooks can alter the reference accidentally
	C.DrawAppearance = AppearanceItemParse(CharacterAppearanceStringify(C));
	C.DrawPose = C.Pose.slice(); // Deep copy of pose array


	// Run BeforeSortLayers hook
	if (C.Hooks && typeof C.Hooks.get == "function") {
		let hooks = C.Hooks.get("BeforeSortLayers");
		if (hooks)
			hooks.forEach((hook) => hook(C)); // If there's a hook, call it
	}

	// Generates a layer array from the character's appearance array, sorted by drawing order
	C.AppearanceLayers = CharacterAppearanceSortLayers(C);

	// Run AfterLoadCanvas hooks
	if (C.Hooks && typeof C.Hooks.get == "function") {
		let hooks = C.Hooks.get("AfterLoadCanvas");
		if (hooks)
			hooks.forEach((hook) => hook(C)); // If there's a hook, call it
	}

	// Sets the total height modifier for that character
	CharacterAppearanceSetHeightModifiers(C);

	// Reload the canvas
	CharacterAppearanceBuildCanvas(C);
}

/**
 * Reloads all character canvases in need of being redrawn.
 * @returns {void} - Nothing
 */
function CharacterLoadCanvasAll() {
	for (let C = 0; C < Character.length; C++)
		if (Character[C].MustDraw) {
			CharacterLoadCanvas(Character[C]);
			Character[C].MustDraw = false;
		}
}

/**
 * Refreshes the character parameters (Effects, poses, canvas, settings, etc.)
 * @param {Character} C - Character to refresh
 * @param {boolean} [Push=true] - Pushes the data to the server if true or null
 * @param {boolean} [RefreshDialog=true] - Refreshes the character dialog
 * @returns {void} - Nothing
 */
function CharacterRefresh(C, Push, RefreshDialog = true) {
	AnimationPurge(C, false);
	CharacterLoadEffect(C);
	CharacterLoadPose(C);
	CharacterLoadCanvas(C);
	// Label often looped through checks:
	C.RunScripts = (!C.AccountName.startsWith('Online-') || !(Player.OnlineSettings && Player.OnlineSettings.DisableAnimations)) && (!Player.GhostList || Player.GhostList.indexOf(C.MemberNumber) == -1);
	C.HasScriptedAssets = !!C.Appearance.find(CA => CA.Asset.DynamicScriptDraw);
}

/**
 * Checks if a character is wearing items (restraints), the slave collar is ignored.
 * @param {Character} C - Character to inspect the appearance of
 * @returns {boolean} - Returns TRUE if the given character is wearing an item
 */
function CharacterHasNoItem(C) {
	for (let A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Category == "Item"))
			if (C.Appearance[A].Asset.Group.Name != "ItemNeck" || (C.Appearance[A].Asset.Group.Name == "ItemNeck" && !InventoryOwnerOnlyItem(C.Appearance[A])))
				return false;
	return true;
}

/**
 * Checks if a character is naked
 * @param {Character} C - Character to inspect the appearance of
 * @returns {boolean} - Returns TRUE if the given character is naked
 */
function CharacterIsNaked(C) {
	for (const A of C.Appearance)
		if (
			(A.Asset != null) &&
			// Ignore items
			(A.Asset.Group.Category == "Appearance") &&
			// Ignore body parts
			A.Asset.Group.AllowNone &&
			// Always ignore all cosplay items
			!A.Asset.BodyCosplay &&
			!A.Asset.Group.BodyCosplay &&
			// Ignore cosplay items if they are considered bodypart (BlockBodyCosplay)
			(
				C.IsNpc() ||
				!(
					A.Asset.Group.BodyCosplay &&
					C.OnlineSharedSettings &&
					C.OnlineSharedSettings.BlockBodyCosplay
				)
			)
		)
			return false;
	return true;
}

/**
 * Checks if a character is in underwear
 * @param {Character} C - Character to inspect the appearance of
 * @returns {boolean} - Returns TRUE if the given character is in underwear
 */
function CharacterIsInUnderwear(C) {
	for (let A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Category == "Appearance") && C.Appearance[A].Asset.Group.AllowNone && !C.Appearance[A].Asset.BodyCosplay && !C.Appearance[A].Asset.Group.BodyCosplay)
			if (!C.Appearance[A].Asset.Group.Underwear)
				if (C.IsNpc() || !(C.Appearance[A].Asset.Group.BodyCosplay && C.OnlineSharedSettings && C.OnlineSharedSettings.BlockBodyCosplay))
					return false;
	return true;
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
	if (NewPose == null || ForceChange || C.ActivePose == null) {
		C.ActivePose = NewPose;
		CharacterRefresh(C, false);
		return;
	}

	if (C.ActivePose == null) C.ActivePose = [];
	if (typeof C.ActivePose == "string") C.ActivePose = [C.ActivePose];

	const PreviousPoses = C.ActivePose.map(AP => PoseFemale3DCG.find(P => P.Name == AP)).filter(AP => typeof AP == "object");
	const Pose = PoseFemale3DCG.find(P => P.Name == NewPose);

	// We only allow poses of different categories to be matched together
	if (Pose && Pose.Category) {
		C.ActivePose = PreviousPoses
			.filter(PP => PP.AllowMenu && Pose.Category !== "BodyFull" && PP.Category !== "BodyFull" && PP.Category !== Pose.Category)
			.map(AP => AP.Name);
		C.ActivePose.push(Pose.Name);
	}

	// If we reset to base, we remove the poses
	if (C.ActivePose.filter(P => P !== "BaseUpper" && P !== "BaseLower").length == 0) C.ActivePose = null;

	CharacterRefresh(C, false);
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
	// A normal eye expression is triggered for both eyes
	if (AssetGroup == "Eyes") CharacterSetFacialExpression(C, "Eyes2", Expression, Timer);
	if (AssetGroup == "Eyes1") AssetGroup = "Eyes";

	var Ex = InventoryGet(C, AssetGroup);
	if ((Timer != null) && (Ex != null) && (Ex.Property != null) && (Ex.Property.Expression != null) && (Ex.Property.Expression != "")) return;
	for (let A = 0; A < C.Appearance.length; A++) {
		if ((C.Appearance[A].Asset.Group.Name == AssetGroup) && (C.Appearance[A].Asset.Group.AllowExpression)) {
			if ((Expression == null) || (C.Appearance[A].Asset.Group.AllowExpression.indexOf(Expression) >= 0)) {
				if (!C.Appearance[A].Property) C.Appearance[A].Property = {};
				// Delete any existing removal timer
				delete C.Appearance[A].Property.RemoveTimer;
				if (C.Appearance[A].Property.Expression != Expression) {
					C.Appearance[A].Property.Expression = Expression;
					if (Color && CommonColorIsValid(Color)) C.Appearance[A].Color = Color;
					CharacterRefresh(C);
				}
				if (Timer != null) TimerInventoryRemoveSet(C, AssetGroup, Timer);
				return;
			}
		}
	}
}

/**
 * Resets the character's facial expression to the default
 * @param {Character} C - Character for which to reset the expression of
 * @returns {void} - Nothing
 */
function CharacterResetFacialExpression(C) {
	for (let A = 0; A < C.Appearance.length; A++)
		if (C.Appearance[A].Asset.Group.AllowExpression)
			CharacterSetFacialExpression(C, C.Appearance[A].Asset.Group.Name, null);
}

/**
 * Gets the currently selected character
 * @returns {Character|null} - Currently selected character
 */
function CharacterGetCurrent() {
	if (CurrentScreen == "Appearance" && CharacterAppearanceSelection) return CharacterAppearanceSelection;
	return (Player.FocusGroup != null) ? Player : CurrentCharacter;
}

/**
 * Compresses a character wardrobe from an array to a LZ string to use less storage space
 * @param {Array.<Array.<*>>} Wardrobe - Uncompressed wardrobe
 * @returns {string} - The compressed wardrobe
 */
/*function CharacterCompressWardrobe(Wardrobe) {
	if (Array.isArray(Wardrobe) && (Wardrobe.length > 0)) {
		var CompressedWardrobe = [];
		for (let W = 0; W < Wardrobe.length; W++) {
			var Arr = [];
			if (Wardrobe[W] != null)
				for (let A = 0; A < Wardrobe[W].length; A++)
					Arr.push([Wardrobe[W][A].Name, Wardrobe[W][A].Group, Wardrobe[W][A].Color, Wardrobe[W][A].Property]);
			CompressedWardrobe.push(Arr);
		}
		return LZString.compressToUTF16(JSON.stringify(CompressedWardrobe));
	} else return "";
}*/


/**
 * Checks if the character is wearing an item that has a specific attribute
 * @param {Character} C - The character to test for
 * @param {string} Attribute - The name of the attribute that must be allowed
 * @returns {boolean} - TRUE if at least one item has that attribute
 */
function CharacterHasItemWithAttribute(C, Attribute) {
	return C.Appearance.some(item => {
		const attrs = InventoryGetItemProperty(item, "Attribute");
		return attrs && attrs.includes(Attribute);
	});
}

/**
 * Checks if the character is edged or not. The character is edged if every equipped vibrating item on an orgasm zone has the "Edged" effect
 * @param {Character} C - The character to check
 * @returns {boolean} - TRUE if the character is edged, FALSE otherwise
 */
function CharacterIsEdged(C) {
	if (C.ID !== 0 || !C.Effect.includes("Edged")) {
		return false;
	}

	// Get all zones that allow an orgasm
	let OrgasmZones = C.ArousalSettings.Zone
		.filter(Zone => Zone.Orgasm)
		.map(Zone => Zone.Name);

	// Get every vibrating item acting on an orgasm zone
	const VibratingItems = C.Appearance
		.filter(A => OrgasmZones.indexOf(A.Asset.ArousalZone) >= 0)
		.filter(Item => Item
			&& Item.Property
			&& Array.isArray(Item.Property.Effect)
			&& Item.Property.Effect.includes("Vibrating")
			&& typeof Item.Property.Intensity === "number"
			&& Item.Property.Intensity >= 0
		);

	// Return true if every vibrating item on an orgasm zone has the "Edged" effect
	return !!VibratingItems.length && VibratingItems.every(Item => Item.Property.Effect && Item.Property.Effect.includes("Edged"));
}

/**
 * Returns whether the character appears upside-down on the screen which may depend on the player's own inverted status
 * @param {Character} C - The character to check
 * @returns {boolean} - If TRUE, the character appears upside-down
 */
function CharacterAppearsInverted(C) {
	return Player.GraphicsSettings && Player.GraphicsSettings.InvertRoom ? Player.IsInverted() != C.IsInverted() : C.IsInverted();
}

/**
 * Checks whether the given character can kneel unaided
 * @param {Character} C - The character to check
 * @returns {boolean} - Returns true if the character is capable of kneeling unaided, false otherwise
 */
function CharacterCanKneel(C) {
	if (C.Effect.includes("Freeze") || C.Effect.includes("ForceKneel")) return false;
	if (C.Pose == null) return true;
	if (C.Pose.includes("Suspension") || C.Pose.includes("Hogtied")) return false;
	return C.CanChangeToPose("Kneel");
}

/**
 * Determines how much the character's view should be darkened based on their blind level. 1 is fully visible, 0 is pitch black.
 * @param {Character} C - The character to check
 * @param {boolean} [eyesOnly=false] - If TRUE only check whether the character has eyes closed, and ignore item effects
 * @returns {number} - The number between 0 (dark) and 1 (bright) that determines screen darkness
 */
function CharacterGetDarkFactor(C, eyesOnly = false) {
	let DarkFactor = 1.0;
	const blindLevel = C.GetBlindLevel(eyesOnly);
	if (blindLevel >= 3) DarkFactor = 0.0;
	else if (CommonPhotoMode) DarkFactor = 1.0;
	else if (blindLevel === 2) DarkFactor = 0.15;
	else if (blindLevel === 1) DarkFactor = 0.3;
	return DarkFactor;
}

/**
 * Gets the array of color tints that should be applied for a character in RGBA format.
 * @param {Character} C - The character
 * @returns {RGBAColor[]} - A list of RGBA tints that are currently affecting the character
 */
function CharacterGetTints(C) {
	if (!C.HasTints()) {
		return [];
	}
	/** @type {RGBAColor[]} */
	const tints = C.Tints.map(({Color, Strength, DefaultColor, Item}) => {
		let colorIndex = 0;
		if (typeof Color === "number") {
			colorIndex = Color;
			if (typeof Item.Color === "string") {
				Color = Item.Color;
			} else if (Array.isArray(Item.Color)) {
				Color = Item.Color[Color] || "Default";
			} else {
				Color = "Default";
			}
		}
		if (Color === "Default") {
			if (Item.Asset.DefaultColor) {
				Color = Array.isArray(Item.Asset.DefaultColor) ? Item.Asset.DefaultColor[colorIndex] : Item.Asset.DefaultColor;
			} else if (typeof DefaultColor === "string") {
				Color = DefaultColor;
			} else if (typeof Item.Asset.DefaultTint === "string") {
				Color = Item.Asset.DefaultTint;
			}
		}
		const {r, g, b} = DrawHexToRGB(Color);
		return {r, g, b, a: Math.max(0, Math.min(Strength, 1))};
	});
	return tints.filter(({a}) => a > 0);
}

/**
 * Gets the clumsiness level of a character. This represents dexterity when interacting with locks etc. and can have a
 * maximum value of 5.
 * @param {Character} C - The character to check
 * @returns {number} - The clumsiness rating of the player, a number between 0 and 5 inclusive.
 */
function CharacterGetClumsiness(C) {
	let clumsiness = 0;
	if (!C.CanInteract()) clumsiness += 1;
	const armItem = InventoryGet(C, "ItemArms");
	if (armItem && armItem.Asset.IsRestraint && InventoryItemHasEffect(armItem, "Block")) clumsiness += 2;
	const handItem = InventoryGet(C, "ItemHands");
	if (handItem && handItem.Asset.IsRestraint && InventoryItemHasEffect(handItem, "Block")) clumsiness += 3;
	return Math.min(clumsiness, 5);
}

/**
 * Applies hooks to a character based on conditions
 * Future hooks go here
 * @param {Character} C - The character to check
 * @param {boolean} IgnoreHooks - Whether to remove some hooks from the player (such as during character dialog).
 * @returns {boolean} - If a hook was applied or removed
 */
function CharacterCheckHooks(C, IgnoreHooks) {
	var refresh = false;
	if (C && C.DrawAppearance) {
		if (!IgnoreHooks && Player.Effect.includes("VRAvatars") && C.Effect.includes("HideRestraints")) {
			// Then when that character enters the virtual world, register a hook to strip out restraint layers (if needed):
			if (C.RegisterHook("BeforeSortLayers", "HideRestraints", (C) => {
				C.DrawAppearance = C.DrawAppearance.filter((Layer) => !(Layer.Asset && Layer.Asset.IsRestraint));
				C.DrawPose = C.DrawPose.filter((Pose) => (Pose != "TapedHands"));

			})) refresh = true;
		} else if (C.UnregisterHook("BeforeSortLayers", "HideRestraints")) refresh = true;

		// Hook for layer visibility
		// Visibility is a string individual layers have. If an item has any layers with visibility, it should have the LayerVisibility: true property
		// We basically check the player's items and see if any are visible that have the LayerVisibility property.
		let LayerVisibility = false;
		for (let A = 0; A < C.DrawAppearance.length; A++) {
			if (C.DrawAppearance[A].Asset && C.DrawAppearance[A].Asset.LayerVisibility) {
				LayerVisibility = true;
				break;
			}
		}
		if (LayerVisibility) {
			// Fancy logic is to use a different hook for when the character is focused
			if (IgnoreHooks && (C.UnregisterHook("AfterLoadCanvas", "LayerVisibility") || C.RegisterHook("AfterLoadCanvas", "LayerVisibilityDialog", (C) => {
				C.AppearanceLayers = C.AppearanceLayers.filter((Layer) => (
					!Layer.Visibility ||
					(Layer.Visibility == "Player" && C == Player) ||
					(Layer.Visibility == "AllExceptPlayerDialog" && C != Player) ||
					(Layer.Visibility == "Others" && C != Player) ||
					(Layer.Visibility == "OthersExceptDialog") ||
					(Layer.Visibility == "Owner" && C.IsOwnedByPlayer()) ||
					(Layer.Visibility == "Lovers" && C.IsLoverOfPlayer()) ||
					(Layer.Visibility == "Mistresses")
				));
			}))) refresh = true;
			// Use the regular hook when the character is not
			else if (!IgnoreHooks && (C.UnregisterHook("AfterLoadCanvas", "LayerVisibilityDialog") || C.RegisterHook("AfterLoadCanvas", "LayerVisibility", (C) => {
				C.AppearanceLayers = C.AppearanceLayers.filter((Layer) => (
					!Layer.Visibility ||
					(Layer.Visibility == "Player" && C == Player) ||
					(Layer.Visibility == "AllExceptPlayerDialog") ||
					(Layer.Visibility == "Others" && C != Player) ||
					(Layer.Visibility == "OthersExceptDialog" && C != Player) ||
					(Layer.Visibility == "Owner" && C.IsOwnedByPlayer()) ||
					(Layer.Visibility == "Lovers" && C.IsLoverOfPlayer()) ||
					(Layer.Visibility == "Mistresses")
				));
			}))) refresh = true;

		} else if (C.UnregisterHook("AfterLoadCanvas", "LayerVisibility")) refresh = true;
	}

	if (refresh) CharacterLoadCanvas(C);
	return refresh;
}

/**
 * Returns the nickname of a character, or the name if the nickname isn't valid
 * Also validates if the character is a GGTS drone to alter her name
 * @param {Character} C - The character breaking from their owner
 * @returns {String} - The nickname to return
 */
function CharacterNickname(C) {
	let Regex = /^[a-zA-Z\s]*$/;
	let Nick = C.Nickname;
	if (Nick == null) Nick = "";
	Nick = Nick.trim().substring(0, 20);
	if ((Nick == "") || !Regex.test(Nick)) Nick = C.Name;
	return Nick;
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
	let C = Character[Character.length - 1];
	C.AccountName = NPCType;
	CharacterRandomName(C);
	CharacterAppearanceBuildAssets(C);
	CharacterAppearanceFullRandom(C);

	// Returns the new character
	return C;

}

/**
 * Removes all items except for clothing and slave collars from the character
 * @param {Character} C - Character to release
 * @returns {void} - Nothing
 */
function CharacterReleaseTotal(C) {
	for (let E = C.Appearance.length - 1; E >= 0; E--) {
		if (!C.Appearance[E].Asset || C.Appearance[E].Asset.Group.Category != "Appearance") {
			if (C.IsOwned() && C.Appearance[E].Asset?.Name == "SlaveCollar") {
				// Reset slave collar to the default model if it has a gameplay effect (such as gagging the player)
				if (C.Appearance[E].Property && C.Appearance[E].Property.Effect && C.Appearance[E].Property.Effect.length > 0)
					delete C.Appearance[E].Property;
			}
			else {
				C.Appearance.splice(E, 1);
			}
		}
	}
	CharacterRefresh(C);
}