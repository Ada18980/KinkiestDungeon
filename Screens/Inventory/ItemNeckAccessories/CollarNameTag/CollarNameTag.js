"use strict";

// Loads the item extension properties
function InventoryItemNeckAccessoriesCollarNameTagLoad() {
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = { Type: null };
}

// Draw the item extension screen
function InventoryItemNeckAccessoriesCollarNameTagDraw() {
	// Draw the header and item
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	// Draw the possible tags
	if (!InventoryItemHasEffect(DialogFocusItem, "Lock", true)) {
		DrawText(DialogFindPlayer("SelectCollarNameTagType"), 1500, 500, "white", "gray");
		var List = DialogFocusItem.Asset.AllowType;
		var X = 955;
		var Y = 530;
		for (let T = 0; T < List.length; T++) {
			if ((DialogFocusItem.Property.Type != List[T])) DrawButton(X, Y, 200, 55, DialogFindPlayer("CollarNameTagType" + List[T]), "White");
			X = X + 210;
			if (T % 5 == 4) {
				X = 955;
				Y = Y + 60;
			}
		}
	}
	else {
		DrawText(DialogFindPlayer("SelectCollarNameTagTypeLocked"), 1500, 500, "white", "gray");
	}
}

// Catches the item extension clicks
function InventoryItemNeckAccessoriesCollarNameTagClick() {
	if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 25) && (MouseY <= 110)) { DialogFocusItem = null; return; }
	if (!InventoryItemHasEffect(DialogFocusItem, "Lock", true)) {
		var List = DialogFocusItem.Asset.AllowType;
		var X = 955;
		var Y = 530;
		for (let T = 0; T < List.length; T++) {
			if ((MouseX >= X) && (MouseX <= X + 200) && (MouseY >= Y) && (MouseY <= Y + 55) && (DialogFocusItem.Property.Type != List[T]))
				InventoryItemNeckAccessoriesCollarNameTagSetType(List[T]);
			X = X + 210;
			if (T % 5 == 4) {
				X = 955;
				Y = Y + 60;
			}
		}
	}
}

// Sets the type of tag
function InventoryItemNeckAccessoriesCollarNameTagSetType(NewType) {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (CurrentScreen == "ChatRoom") {
		DialogFocusItem = InventoryGet(C, C.FocusGroup.Name);
		InventoryItemNeckAccessoriesCollarNameTagLoad();
	}
	DialogFocusItem.Property.Type = NewType;
	DialogFocusItem.Property.Effect = [];

	// Refreshes the character and chatroom
	CharacterRefresh(C);
	var Dictionary = [];
	Dictionary.push({Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
	Dictionary.push({Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber});
	Dictionary.push({Tag: "NameTagType", TextToLookUp: "CollarNameTagType" + ((NewType) ? NewType : "")});
	ChatRoomPublishCustomAction("CollarNameTagSet", true, Dictionary);
	if (DialogInventory != null) {
		DialogFocusItem = null;
		DialogMenuButtonBuild(C);
	}
}
