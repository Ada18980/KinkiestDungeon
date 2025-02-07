let Character: Character[] = [];
let CharacterNextId = 1;

/**
 * Loads a character into the buffer, creates it if it does not exist
 * @param CharacterID - ID of the character
 * @param CharacterAssetFamily - Name of the asset family of the character
 * @param Type - The character type
 * @returns The newly loaded character
 */
function CharacterReset(CharacterID: number): Character {

	// Prepares the character sheet
	let NewCharacter: Character = {
		ID: CharacterID,
		Name: "",
		Palette: "",
		Appearance: [],
		HeightModifier: 0,
		Pose: [],
	};

	// Creates the inventory and default appearance
	if (CharacterID == 0 && !DefaultPlayer) {
		DefaultPlayer = NewCharacter;
		CharacterAppearanceSetDefault(NewCharacter);
	}


	return NewCharacter;
}


/**
 * Adds a pose to a character's pose list, does not add it if it's already there
 * @param C - Character for which to add a pose to its list
 * @param NewPose - The name of the pose to add
 */
function CharacterAddPose(C: Character, NewPose: string): void {
	for (let E = 0; E < NewPose.length; E++)
		if (C.Pose.indexOf(NewPose[E]) < 0)
			C.Pose.push(NewPose[E]);
}


/**
 * Checks if a certain pose is whitelisted and available for the pose menu
 * @param C - Character to check for the pose
 * @param Type - Pose type to check for within items
 * @param Pose - Pose to check for whitelist
 * @returns TRUE if the character has the pose available
 */
function CharacterItemsHavePoseAvailable(C: Character, Type: string | undefined, Pose: string): boolean {
	return true;
}

/**
 * Checks whether the items on a character set a given pose on the character
 * @param C - The character to check
 * @param pose - The name of the pose to check for
 * @param excludeClothes - Ignore clothing items in the check
 * @returns Returns true if the character is wearing an item that sets the given pose, false otherwise
 */
function CharacterDoItemsSetPose(C: Character, pose: string, excludeClothes: boolean = false): boolean {
	return false;
}




/**
 * Removes all appearance items from the character
 * @param C - Character to undress
 */
function CharacterNaked(C: Character): void {
	CharacterAppearanceNaked(C);
}

/**
 * Sets a new pose for the character
 * @param C - Character for which to set the pose
 * @param NewPose - Name of the pose to set as active
 * @param ForceChange - TRUE if the set pose(s) should overwrite current active pose(s)
 */
function CharacterSetActivePose(C: Character, NewPose: string, ForceChange: boolean = false): void {}

/**
 * Sets a specific facial expression for the character's specified AssetGroup, if there's a timer, the expression will expire after it, a
 * timed expression cannot override another one.
 * @param C - Character for which to set the expression of
 * @param AssetGroup - Asset group for the expression
 * @param Expression - Name of the expression to use
 * @param Timer - Optional: time the expression will last
 * @param Color Optional: color of the expression to set
 */
function CharacterSetFacialExpression(C: Character, AssetGroup: string, Expression: string, Timer: number = null, Color: string | string[] = null): void {
	if (StandalonePatched) {
		// TODO add facial expression handling
		return;
	}
}

/**
 * Resets the character's facial expression to the default
 * @param C - Character for which to reset the expression of
 */
function CharacterResetFacialExpression(C: Character): void {
	if (StandalonePatched) {
		// TODO add facial expression handling
		return;
	}
}

/**
 * Gets the currently selected character
 */
function CharacterGetCurrent(): Character | null {
	return DefaultPlayer;
}

/**
 * Returns the nickname of a character, or the name if the nickname isn't valid
 * Also validates if the character is a GGTS drone to alter her name
 * @param C - The character breaking from their owner
 * @returns The nickname to return
 */
function CharacterNickname(C: Character): string {
	return "";
}



/**
 * Loads an NPC into the character array. The appearance is randomized, and a type can be provided to dress them in a given style.
 * @param NPCType - Archetype of the NPC
 * @returns The randomly generated NPC
 */
function CharacterLoadNPC(id: number, Name: string, Palette?: string): Character {
	const CNew = CharacterReset(id);
	CNew.Name = Name;
	if (Palette)
		CNew.Palette = Palette;
	// Returns the new character
	return CNew;

}

/**
 * Removes all items except for clothing and slave collars from the character
 * @param C - Character to release
 */
function CharacterReleaseTotal(C: Character): void {
	for (let E = C.Appearance.length - 1; E >= 0; E--) {
		if (C.Appearance[E].Model?.Restraint) {
			C.Appearance.splice(E, 1);
		}
	}
}