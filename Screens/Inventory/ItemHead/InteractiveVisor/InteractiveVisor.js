"use strict";

var InventoryItemHeadInteractiveVisorOptions = [
	{
		Name: "Transparent",
		Property: {
			Type: null,
			SelfUnlock: true,
			Effect: [],
		},
	},
	{
		Name: "LightTint",
		Property: {
			Type: "LightTint",
			Effect: ["BlindLight", "Prone"],
		},
	},
	{
		Name: "HeavyTint",
		Property: {
			Type: "HeavyTint",
			Effect: ["BlindNormal", "Prone"],
		},
	},
	{
		Name: "Blind",
		Property: {
			Type: "Blind",
			Effect: ["BlindHeavy", "Prone"],
		},
	},
];

function InventoryItemHeadInteractiveVisorLoad() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticLoadAccessDenied();
	} else
		ExtendedItemLoad(InventoryItemHeadInteractiveVisorOptions, "SelectVisorType");
}

function InventoryItemHeadInteractiveVisorDraw() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticDrawAccessDenied();
	} else
		ExtendedItemDraw(InventoryItemHeadInteractiveVisorOptions, "InteractiveVisorHeadType");
}

function InventoryItemHeadInteractiveVisorClick() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticClickAccessDenied();
	} else
		ExtendedItemClick(InventoryItemHeadInteractiveVisorOptions);
}

function InventoryItemHeadInteractiveVisorPublishAction(C, Option) {
	var Message = "InteractiveVisorHeadSet" + Option.Name;
	var Dictionary = [
		{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
		{ Tag: "TargetCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
	];
	ChatRoomPublishCustomAction(Message, true, Dictionary);
}


function InventoryItemHeadInteractiveVisorExit() {
	InventoryItemFuturisticExitAccessDenied();
}

function InventoryItemHeadInteractiveVisorValidate(C, Item) {
	return InventoryItemFuturisticValidate(C, Item); // All futuristic items refer to the gag
}

function InventoryItemHeadInteractiveVisorNpcDialog(C, Option) {
	C.CurrentDialog = DialogFind(C, "ItemHeadInteractiveVisor" + Option.Name, "ItemHead");
}
