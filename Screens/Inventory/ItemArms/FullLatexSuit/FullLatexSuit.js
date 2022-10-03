"use strict";

// Loads the item extension properties
function InventoryItemArmsFullLatexSuitLoad() {
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = { Type: null };
	if (DialogFocusItem.Property.Block == null) {
		DialogFocusItem.Property.Block = DialogFocusItem.Property.Type ? [] : ["ItemBreast", "ItemNipples", "ItemNipplesPiercings", "ItemVulva", "ItemVulvaPiercings", "ItemButt"];
		var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
		CharacterRefresh(C);
		ChatRoomCharacterItemUpdate(C, DialogFocusItem.Asset.Group.Name);
	}
}

// Draw the item extension screen
function InventoryItemArmsFullLatexSuitDraw() {

	// Draw the item image and top controls
	const C = CharacterGetCurrent();
	const asset = DialogFocusItem.Asset;
	const property = DialogFocusItem.Property;
	const inventoryPath = AssetGetInventoryPath(asset);
	DrawText(DialogFindPlayer("SelectSuitType"), 1500, 50, "white", "gray");
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	// Draw the suits options
	DrawText(DialogFindPlayer("FullLatexSuitTypeZipped"), 1263, 425, "white", "gray");
	DrawPreviewBox(1150, 440, `${inventoryPath}/Latex.png`, "", { Hover: true, Disabled: property.Type === null });

	DrawText(DialogFindPlayer("FullLatexSuitTypeUnZip"), 1713, 425, "white", "gray");
	DrawPreviewBox(1600, 440, `${inventoryPath}/UnZip.png`, "", { Hover: true, Disabled: property.Type === "UnZip" });

	if (InventoryGet(C, "ItemVulvaPiercings") == null ||
		!InventoryGet(C, "ItemVulvaPiercings").Asset ||
		!InventoryGet(C, "ItemVulvaPiercings").Asset.Effect ||
		InventoryGet(C, "ItemVulvaPiercings").Asset.Effect.indexOf("Chaste") == -1)
		if (InventoryGet(C, "ItemVulva") == null) {
			DrawText(DialogFindPlayer("FullLatexSuitTypeWand"), 1488, 725, "white", "gray");
			DrawPreviewBox(1375, 750, `${inventoryPath}/Wand.png`, "", { Hover: true });
		} else
			DrawText(DialogFindPlayer("CheckVulvaForWand"), 1500, 690, "white", "gray");

}

// Catches the item extension clicks
function InventoryItemArmsFullLatexSuitClick() {
	if (MouseIn(1885, 25, 90, 90)) DialogFocusItem = null;
	else if (MouseIn(1150, 440, 225, 225) && (DialogFocusItem.Property.Type != null)) InventoryItemArmsFullLatexSuitSetType(null);
	else if (MouseIn(1600, 440, 225, 225) && (DialogFocusItem.Property.Type !== "UnZip")) InventoryItemArmsFullLatexSuitSetType("UnZip");
	else if (MouseIn(1375, 750, 225, 225) && InventoryGet(CharacterGetCurrent(), "ItemVulva") == null) InventoryItemArmsFullLatexSuitSetType("Wand");
}

// Sets the suit properties when it's model changes
function InventoryItemArmsFullLatexSuitSetType(NewType) {

	// Sets the type, blocking zones and wand
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if ((CurrentScreen == "ChatRoom") || (DialogFocusItem == null)) {
		DialogFocusItem = InventoryGet(C, C.FocusGroup.Name);
		InventoryItemArmsFullLatexSuitLoad();
	}
	if (NewType == null || NewType == "UnZip") DialogFocusItem.Property.Type = NewType;
	if (NewType == null) DialogFocusItem.Property.Block = ["ItemBreast", "ItemNipples", "ItemNipplesPiercings", "ItemVulva", "ItemVulvaPiercings", "ItemButt"];
	else if (NewType == "UnZip") DialogFocusItem.Property.Block = [];
	if (NewType == "Wand") {
		InventoryWear(C, "FullLatexSuitWand", "ItemVulva");
		ChatRoomCharacterItemUpdate(C, "ItemVulva");
	}
	CharacterRefresh(C);

	// Pushes the change to the chatroom
	var msg = "FullLatexSuitSet" + ((NewType) ? NewType : "Zipped");
	var Dictionary = [];
	Dictionary.push({Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber});
	Dictionary.push({Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
	ChatRoomPublishCustomAction(msg, true, Dictionary);
	if (DialogInventory != null) {
		DialogFocusItem = null;
		DialogMenuButtonBuild(C);
	}

}
