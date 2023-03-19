'use strict';


let KDConfirmType = "";
let KinkyDungeonReplaceConfirm = 0;

/** Call BEFORE making any changes */
function KDChangeWardrobe() {
	try {
		if (!KDOriginalValue)
			KDOriginalValue = LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer));
	} catch (e) {
		// Fail
	}
}

function KDDrawWardrobe(screen) {


	DrawButtonKDEx("ResetOutfit", (bdata) => {
		if (KDConfirmType == "reset" && KinkyDungeonReplaceConfirm > 0) {
			KDChangeWardrobe();
			KDGetDressList().Default = KinkyDungeonDefaultDefaultDress;
			CharacterAppearanceRestore(KinkyDungeonPlayer, CharacterAppearanceStringify(KinkyDungeonPlayerCharacter ? KinkyDungeonPlayerCharacter : Player));
			CharacterReleaseTotal(KinkyDungeonPlayer);
			KinkyDungeonSetDress("Default", "Default");
			KinkyDungeonDressPlayer();
			KDInitProtectedGroups();
			KinkyDungeonConfigAppearance = true;
			KinkyDungeonReplaceConfirm = 0;
			return true;
		} else {
			KDConfirmType = "reset";
			KinkyDungeonReplaceConfirm = 2;
			return true;
		}
	}, true, 475, 860, 220, 60,
	TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'reset') ?
			"KinkyDungeonConfirm" :
			"KinkyDungeonDressPlayerReset"),
	"#ffffff", "");
	DrawButtonKDEx("LoadFromCode", (bdata) => {
		KinkyDungeonState = "LoadOutfit";

		LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer));
		CharacterReleaseTotal(KinkyDungeonPlayer);
		ElementCreateTextArea("saveInputField");
		ElementValue("saveInputField", LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer)));
		return true;
	}, true,475, 930, 220, 60, TextGet("KinkyDungeonDressPlayerImport"),
	"#ffffff", "");


	DrawButtonKDEx("KDWardrobeCancel", (bdata) => {
		if (KDConfirmType == "revert" && KinkyDungeonReplaceConfirm > 0) {
			KinkyDungeonReplaceConfirm = 0;
			KDRestoreOutfit();
			KDOriginalValue = "";
			return true;
		} else {
			KDConfirmType = "revert";
			KinkyDungeonReplaceConfirm = 2;
			return true;
		}
	}, true, 725, 860, 220, 60,
	TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'revert') ?
		"KDWardrobeCancelConfirm" :
		"KDWardrobeCancel"), KDOriginalValue ? "#ffffff" : "#888888", "");
	DrawButtonKDEx("KDWardrobeSaveOutfit", (bdata) => {
		if (KDConfirmType == "save" && KinkyDungeonReplaceConfirm > 0) {
			KinkyDungeonReplaceConfirm = 0;
			localStorage.setItem("kinkydungeonappearance", LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer)));
			KinkyDungeonDressSet();
			KDOriginalValue = "";
			return true;
		} else {
			KDConfirmType = "save";
			KinkyDungeonReplaceConfirm = 2;
			return true;
		}
	}, true, 725, 930, 220, 60,
	TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'save') ?
		"KDWardrobeSaveOutfitConfirm" :
		"KDWardrobeSaveOutfit"), KDOriginalValue ? "#ffffff" : "#888888", "");

	DrawButtonKDEx("KDWardrobeSave", (bdata) => {
		KinkyDungeonState = "Menu";
		KinkyDungeonDressSet();
		return true;
	}, true, 1275, 900, 350, 64, TextGet("KDWardrobeSave"), "#ffffff", "");
}

function KDSaveCodeOutfit() {
	// Save outfit
	KDChangeWardrobe();
	let decompressed = LZString.decompressFromBase64(ElementValue("saveInputField"));
	let stringified = "";
	if (decompressed) {
		let origAppearance = KinkyDungeonPlayer.Appearance;
		try {
			CharacterAppearanceRestore(KinkyDungeonPlayer, decompressed);
			CharacterRefresh(KinkyDungeonPlayer);
			KDInitProtectedGroups();
			stringified = CharacterAppearanceStringify(KinkyDungeonPlayer);
		} catch (e) {
			// If we fail, it might be a BCX code. try it!
			KinkyDungeonPlayer.Appearance = origAppearance;
			try {
				let parsed = JSON.parse(decompressed);
				if (parsed.length > 0) {
					if (!StandalonePatched) {
						for (let g of parsed) {
							InventoryWear(KinkyDungeonPlayer, g.Name, g.Group, g.Color);
						}
						CharacterRefresh(KinkyDungeonPlayer);
					}
					KDInitProtectedGroups();
					stringified = CharacterAppearanceStringify(KinkyDungeonPlayer);
				} else {
					console.log("Invalid code. Maybe its corrupt?");
				}
			} catch (error) {
				console.log("Invalid code.");
			}
		}
	}

	KinkyDungeonDressPlayer();
	if (stringified)
		localStorage.setItem("kinkydungeonappearance", stringified);

	KinkyDungeonNewDress = true;
}

function KDRestoreOutfit() {
	// Restore the original outfit
	if (KDOriginalValue) {
		CharacterAppearanceRestore(KinkyDungeonPlayer, LZString.decompressFromBase64(KDOriginalValue));
		CharacterRefresh(KinkyDungeonPlayer);
		KDInitProtectedGroups();
		KinkyDungeonDressPlayer();
	}
}