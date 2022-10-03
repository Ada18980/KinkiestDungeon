"use strict";
/**
 * Where animation data is stored. Animation data is only managed client side, nothing should be synced.
 * @constant
 * @type {object} - The animation data object.
 */
var AnimationPersistentStorage = {};

/**
 * Types of dynamic data that can be stored.
 * @constant
 * @enum {string}
 */
var AnimationDataTypes = {
	AssetGroup: "AssetGroup",
	Base: "",
	Canvas: "DynamicPlayerCanvas",
	PersistentData: "PersistentData",
	Rebuild: "Rebuild",
	RefreshTime: "RefreshTime",
	RefreshRate: "RefreshRate",
};

/**
 * Gets the dynamic data storage name for a given item on a given character.
 * @param {Character} C - Character wearing the animated object
 * @param {AnimationDataTypes} Type - Type of data to query
 * @param {Asset} [Asset] - The animated object
 * @returns {string} - Contains the name of the persistent data key.
 */
function AnimationGetDynamicDataName(C, Type, Asset) {
	return (Type ? Type + "__" : "") + C.AccountName + (Asset ? "__" + Asset.Group.Name + "__" + Asset.Name : "");
}

/**
 * Gets the persistent data  for a given item on a given character. This method should not be called explicitly, use the Data builder passed to the dynamic drawing functions.
 * @param {Character} C - Character wearing the animated object
 * @param {Asset} Asset - The animated object
 * @returns {any} - Contains the persistent data of the animated object, returns a new empty object if it was never initialized previously.
 */
function AnimationPersistentDataGet(C, Asset) {
	const PersistentDataName = AnimationGetDynamicDataName(C, AnimationDataTypes.PersistentData, Asset);
	if (!AnimationPersistentStorage[PersistentDataName]) {
		AnimationPersistentStorage[PersistentDataName] = {};
	}
	return AnimationPersistentStorage[PersistentDataName];
}

/**
 * Sets the maximum animation refresh rate for a given character.
 * @param {Character} C - Character wearing the dynamic object
 * @param {number} RequestedRate - The maximum refresh rate to request in ms
 * @returns {void} - Nothing
 */
function AnimationRequestRefreshRate(C, RequestedRate) {
	const key = AnimationGetDynamicDataName(C, AnimationDataTypes.RefreshRate);
	let RefreshRate = AnimationPersistentStorage[key] != null ? AnimationPersistentStorage[key] : Infinity;
	if (RequestedRate < RefreshRate) {
		AnimationPersistentStorage[key] = RequestedRate;
	}
}

/**
 * Marks a given character to be redrawn on the next animation refresh.
 * @param {Character} C - Character wearing the dynamic object
 * @returns {void} - Nothing
 */
function AnimationRequestDraw(C) {
	AnimationPersistentStorage[AnimationGetDynamicDataName(C, AnimationDataTypes.Rebuild)] = true;
}

/**
 * Gets the group object for a given character. This method should not be called explicitly, use the Data builder passed to the dynamic drawing functions.
 * @param {Character} C - Character wearing the animated object
 * @param {string} Name - Name of the animated object
 * @returns {object} - Contains the persistent group data, returns a new empty object if it was never initialized previously.
 */
function AnimationGroupGet(C, Name) {
	let GroupKey = AnimationGetDynamicDataName(C, AnimationDataTypes.AssetGroup);
	if (!AnimationPersistentStorage[GroupKey]) {
		AnimationPersistentStorage[GroupKey] = {};
	}
	if (!AnimationPersistentStorage[GroupKey][Name]) {
		AnimationPersistentStorage[GroupKey][Name] = { Subscriptions: [] };
	}
	return AnimationPersistentStorage[GroupKey][Name];
}

/**
 * Marks a given asset as part of a shared data group.
 * @param {Character} C - Character wearing the dynamic object
 * @param {Asset} Asset - The animated object
 * @param {string} Name - Name of the group to subscribe to.
 * @returns {void} - Nothing
 */
function AnimationGroupSubscribe(C, Asset, Name) {
	const DataKey = AnimationGetDynamicDataName(C, AnimationDataTypes.PersistentData, Asset);
	const Group = AnimationGroupGet(C, Name);
	AnimationPersistentDataGet(C, Asset)["GroupData" + Name] = Group;
	if (Array.isArray(Group.Subscriptions) && !Group.Subscriptions.includes(DataKey)) {
		Group.Subscriptions.push(DataKey);
	}
}

/**
 * Generates a temporary canvas used draw on for dynamic assets.
 * Careful! The width of the canvas should never be higher than 500px.
 * @param {Character} C - Character for which the temporary canvas is
 * @param {Asset} A - Asset for which the canvas is
 * @param {number} W - Width of the canvas (can be changed later)
 * @param {number} H - Height of the canvas (can be changed later)
 * @returns {HTMLCanvasElement} - The temporary canvas to use
 */
function AnimationGenerateTempCanvas(C, A, W, H) {
	let TempCanvas = document.createElement("canvas");
	TempCanvas.setAttribute('name', AnimationGetDynamicDataName(C, AnimationDataTypes.Canvas, A));
	TempCanvas.width = W ? W : 500;
	TempCanvas.height = H ? H : 500;
	return TempCanvas;
}

/**
 * Purges all dynamic asset data corresponding to a given character.
 * @param {Character} C - The character to delete the animation data of
 * @param {boolean} IncludeAll - TRUE if we should delete every animation data for the given character.
 * @returns {void} - Nothing
 */
function AnimationPurge(C, IncludeAll) {
	const PossibleData = [];
	const PossibleCanvas = [];

	// Highlights the data to keep
	if (!IncludeAll) {
		C.Appearance.forEach((CA) => {
			PossibleData.push(AnimationGetDynamicDataName(C, AnimationDataTypes.PersistentData, CA.Asset));
			PossibleCanvas.push(AnimationGetDynamicDataName(C, AnimationDataTypes.Canvas, CA.Asset));
		});
	}

	// Checks if any character specific info is worth being kept
	if (IncludeAll || !C.Appearance.find(CA => CA.Asset.DynamicScriptDraw || CA.Asset.DynamicAfterDraw || CA.Asset.DynamicBeforeDraw)) {
		delete AnimationPersistentStorage[AnimationGetDynamicDataName(C, AnimationDataTypes.RefreshTime)];
		delete AnimationPersistentStorage[AnimationGetDynamicDataName(C, AnimationDataTypes.Rebuild)];
		delete AnimationPersistentStorage[AnimationGetDynamicDataName(C, AnimationDataTypes.AssetGroup)];
	}

	// Always delete the refresh rate for accurate requested rate.
	delete AnimationPersistentStorage[AnimationGetDynamicDataName(C, AnimationDataTypes.RefreshRate)];

	// Clear no longer needed data (Clear the subscription, then clear the asset data)
	for (const key in AnimationPersistentStorage) {
		const isCharDataKey = key.startsWith(AnimationDataTypes.PersistentData + "__" + C.AccountName + "__");
		if (isCharDataKey && !PossibleData.includes(key)) {
			const Group = AnimationPersistentStorage[key].Group;
			if (Group && Array.isArray(Group.Subscriptions)) {
				Group.Subscriptions = Group.Subscriptions.filter(k => k != key);
			}
			delete AnimationPersistentStorage[key];
		}
	}

	// Clear no longer needed cached canvases
	GLDrawImageCache.forEach((img, key) => {
		if (key.startsWith(AnimationDataTypes.Canvas + "__" + + C.AccountName + "__") && !PossibleCanvas.includes(key)) {
			GLDrawImageCache.delete(key);
		}
	});

	// Clear empty groups when all is done
	const GroupKey = AnimationGetDynamicDataName(C, AnimationDataTypes.AssetGroup);
	if (AnimationPersistentStorage[GroupKey]) {
		for (const key in AnimationPersistentStorage[GroupKey]) {
			if (!AnimationPersistentStorage[GroupKey][key].Subscriptions || !Array.isArray(AnimationPersistentStorage[GroupKey][key].Subscriptions) || AnimationPersistentStorage[GroupKey][key].Subscriptions.length == 0) {
				delete AnimationPersistentStorage[GroupKey][key];
			}
		}
	}
}
