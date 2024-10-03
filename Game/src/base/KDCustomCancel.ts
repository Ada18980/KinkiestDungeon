interface CustomCancel {
	cancel: () => void,
	condition: () => boolean,
}

let KDCustomCancels = [
	{
		// Recycle
		condition: () => {
			return KDGameData.InventoryAction == "Recycle" && KinkyDungeonDrawState == "Inventory";
		},
		cancel: () => {
			KinkyDungeonDrawState = "Facilities";
			KinkyDungeonGameKey.keyPressed[9] = false;
			KinkyDungeonKeybindingCurrentKey = '';
		},
	},
	{
		// Container
		condition: () => {
			return KinkyDungeonDrawState == "Container";
		},
		cancel: () => {
			KinkyDungeonDrawState = KDUI_ContainerBackScreen || "Game";
			KinkyDungeonGameKey.keyPressed[9] = false;
			KinkyDungeonKeybindingCurrentKey = '';
		},
	},

	{
		// Recycle
		condition: () => {
			return KinkyDungeonTargetingSpell && KinkyDungeonDrawState == "Game";
		},
		cancel: () => {
			KinkyDungeonGameKey.keyPressed[9] = false;
			KinkyDungeonTargetingSpell = null;
			KinkyDungeonTargetingSpellItem = null;
			KinkyDungeonTargetingSpellWeapon = null;
		},
	}
];