"use strict";

var InventoryItemArmsPrisonLockdownSuitOptions = [
	{
		Name: "Free",
		Property: {
			Type: null,
			Difficulty: 0,
			Effect: ["Block", "Prone", "Slow"],
		},
	},
	{
		Name: "Ankles",
		Property: {
			Type: "Ankles",
			Difficulty: 2,
			Effect: ["Block", "Prone", "Slow"],
		},
	},
	{
		Name: "Thighs",
		Property: {
			Type: "Thighs",
			Difficulty: 1,
			Effect: ["Block", "Prone", "Slow"],
		},
	},
	{
		Name: "Full",
		Property: {
			Type: "Full",
			Difficulty: 3,
			Effect: ["Block", "Prone", "Freeze"],
		},
	},
];

var InventoryItemArmsPrisonLockdownSuitPage = "Base";

function InventoryItemArmsPrisonLockdownSuitLoad() {
	ExtendedItemLoad(InventoryItemArmsPrisonLockdownSuitOptions, "ItemArmsPrisonLockdownSuitSelect");
	InventoryItemNeckAccessoriesCollarShockUnitLoad();
	InventoryItemArmsPrisonLockdownSuitSetPage("Base");
}

function InventoryItemArmsPrisonLockdownSuitSetPage(Page) {
	InventoryItemArmsPrisonLockdownSuitPage = Page;
	DialogExtendedMessage = DialogFindPlayer("ItemArmsPrisonLockdownSuitSelect" + Page);
}

function InventoryItemArmsPrisonLockdownSuitDraw() {
	CommonCallFunctionByName("InventoryItemArmsPrisonLockdownSuitDraw" + InventoryItemArmsPrisonLockdownSuitPage);
}

function InventoryItemArmsPrisonLockdownSuitDrawBase() {
	var A = DialogFocusItem.Asset;

	// Draw the header and item
	DrawAssetPreview(1387, 55, A);
	DrawText(DialogExtendedMessage, 1500, 375, "white", "gray");

	DrawPreviewBox(1175, 550, `${AssetGetInventoryPath(A)}/${DialogFocusItem.Property.Type || "Free"}.png`, "", { Hover: true });
	DrawText(DialogFindPlayer("ItemArmsPrisonLockdownSuitStraps"), 1288, 800, "white", "gray");

	DrawPreviewBox(1600, 550, `${AssetGetInventoryPath(A)}/Shock.png`, "", { Hover: true });
	DrawText(DialogFindPlayer("ItemArmsPrisonLockdownSuitShock"), 1713, 800, "white", "gray");
}

function InventoryItemArmsPrisonLockdownSuitDrawStraps() {
	ExtendedItemDraw(InventoryItemArmsPrisonLockdownSuitOptions, "ItemArmsPrisonLockdownSuit");
}

function InventoryItemArmsPrisonLockdownSuitDrawShock() {
	InventoryItemNeckAccessoriesCollarShockUnitDraw();
}

function InventoryItemArmsPrisonLockdownSuitClick() {
	CommonCallFunctionByName("InventoryItemArmsPrisonLockdownSuitClick" + InventoryItemArmsPrisonLockdownSuitPage);
}

function InventoryItemArmsPrisonLockdownSuitClickBase() {
	// Exit button
	if (MouseIn(1885, 25, 90, 85)) {
		DialogFocusItem = null;
		return;
	}

	if (MouseIn(1175, 550, 225, 225)) InventoryItemArmsPrisonLockdownSuitSetPage("Straps");
	else if (MouseIn(1600, 550, 225, 225)) InventoryItemArmsPrisonLockdownSuitSetPage("Shock");
}

function InventoryItemArmsPrisonLockdownSuitClickStraps() {
	// Exit button
	if (MouseIn(1885, 25, 90, 85)) {
		InventoryItemArmsPrisonLockdownSuitSetPage("Base");
		return;
	}

	ExtendedItemClick(InventoryItemArmsPrisonLockdownSuitOptions);
}

function InventoryItemArmsPrisonLockdownSuitClickShock() {
	// Exit button
	if (MouseIn(1885, 25, 90, 85)) {
		InventoryItemArmsPrisonLockdownSuitSetPage("Base");
		return;
	}

	InventoryItemNeckAccessoriesCollarShockUnitClick();
}

function InventoryItemArmsPrisonLockdownSuitPublishAction(C, Option, PreviousOption) {
	var msg = "ItemArmsPrisonLockdownSuitSet" + Option.Name;
	if (["Ankles", "Thighs"].includes(Option.Name) && ["Free", "Full"].includes(PreviousOption.Name)) {
		msg = "ItemArmsPrisonLockdownSuitSet" + PreviousOption.Name + "To" + Option.Name;
	}
	var dictionary = [
		{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
	];
	ChatRoomPublishCustomAction(msg, true, dictionary);
}

function InventoryItemArmsPrisonLockdownSuitNpcDialog(C, Option) {
	C.CurrentDialog = DialogFind(C, "ItemArmsPrisonLockdownSuit" + Option.Name, "ItemArms");
}
