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
	}
];