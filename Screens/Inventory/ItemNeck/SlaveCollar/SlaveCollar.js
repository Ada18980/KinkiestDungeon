"use strict";
var InventoryItemNeckSlaveCollarColorMode = false;
var InventoryItemNeckSlaveCollarColor = "Default";
var InventoryItemNeckSlaveCollarOffset = 0;

// Defines all the slave collar models
/** @type {(ExtendedItemOption & { Image: string })[]} */
var InventoryItemNeckSlaveCollarTypes = [
	{
		Name: "",
		Image: "SlaveCollar",
		Property: null
	}, {
		Name: "SteelPosture",
		Image: "SteelPostureCollar",
		Property: { Type: "SteelPosture", Effect: ["FixedHead"], Block: [] }
	}, {
		Name: "LeatherPosture",
		Image: "PostureCollar",
		Property: { Type: "LeatherPosture", Effect: ["FixedHead"], Block: [] }
	},{
		Name: "PetCollar",
		Image: "PetCollar",
		Property: { Type: "PetCollar", Effect: [], Block: [] }
	},{
		Name: "HighCollar",
		Image: "HighCollar",
		Property: { Type: "HighCollar", Effect: [], Block: [] }
	},{
		Name: "LeatherCollarBell",
		Image: "LeatherCollarBell",
		Property: { Type: "LeatherCollarBell", Effect: [], Block: [] }
	},{
		Name: "LeatherCollarBow",
		Image: "LeatherCollarBow",
		Property: { Type: "LeatherCollarBow", Effect: [], Block: [] }
	},{
		Name: "MaidCollar",
		Image: "MaidCollar",
		Property: { Type: "MaidCollar", Effect: [], Block: [] }
	},{
		Name: "BatCollar",
		Image: "BatCollar",
		Property: { Type: "BatCollar", Effect: [], Block: [] }
	},{
		Name: "HighSecurityCollar",
		Image: "HighSecurityCollar",
		Property: { Type: "HighSecurityCollar", Effect: [], Block: [] }
	},{
		Name: "SpikeCollar",
		Image: "SpikeCollar",
		Property: { Type: "SpikeCollar", Effect: [], Block: [] }
	},{
		Name: "BordelleCollar",
		Image: "BordelleCollar",
		Property: { Type: "BordelleCollar", Effect: [], Block: [] }
	},{
		Name: "LeatherCorsetCollar",
		Image: "LeatherCorsetCollar",
		Property: { Type: "LeatherCorsetCollar", Effect: ["GagNormal"], Block: ["ItemMouth", "ItemMouth2", "ItemMouth3"] }
	},{
		Name: "StrictPostureCollar",
		Image: "StrictPostureCollar",
		Property: { Type: "StrictPostureCollar", Effect: ["FixedHead"], Block: [] }
	},{
		Name: "LatexPostureCollar",
		Image: "LatexPostureCollar",
		Property: { Type: "LatexPostureCollar", Effect: ["GagNormal", "FixedHead"], Block: ["ItemMouth", "ItemMouth2", "ItemMouth3"] }
	},{
		Name: "HeartCollar",
		Image: "HeartCollar",
		Property: { Type: "HeartCollar", Effect: [], Block: [] }
	},{
		Name: "NobleCorsetCollar",
		Image: "NobleCorsetCollar",
		Property: { Type: "NobleCorsetCollar", Effect: [], Block: [] }
	},{
		Name: "OrnateCollar",
		Image: "OrnateCollar",
		Property: { Type: "OrnateCollar", Effect: [], Block: [] }
	},{
		Name: "SlenderSteelCollar",
		Image: "SlenderSteelCollar",
		Property: { Type: "SlenderSteelCollar", Effect: [], Block: [] }
	},{
		Name: "ShinySteelCollar",
		Image: "ShinySteelCollar",
		Property: { Type: "ShinySteelCollar", Effect: [], Block: [] }
	},{
		Name: "HeartLinkChoker",
		Image: "HeartLinkChoker",
		Property: { Type: "HeartLinkChoker", Effect: [], Block: [] }
	}
];

// Loads the item extension properties
function InventoryItemNeckSlaveCollarLoad() {
	InventoryItemNeckSlaveCollarColorMode = false;
	var C = CharacterGetCurrent();
	var SC = InventoryItemNeckSlaveCollarTypes.find(element => (element.Name == "LoveLeatherCollar"));
	if (C && C.IsOwnedByPlayer() && C.IsLoverOfPlayer() && !SC) {
		InventoryItemNeckSlaveCollarTypes.push({
			Name: "LoveLeatherCollar",
			Image: "LoveLeatherCollar",
			Property: {Type: "LoveLeatherCollar", Effect: [], Block: []}
		});
	}
	else if (C && C.IsOwnedByPlayer && !C.IsLoverOfPlayer() && SC) { InventoryItemNeckSlaveCollarTypes.splice(InventoryItemNeckSlaveCollarTypes.indexOf(SC,1)); }
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = { Type: null, Effect: [], Block: [] };
}

// Draw the item extension screen
function InventoryItemNeckSlaveCollarDraw() {

	// Only the character owner can use the controls in that screen
	var C = CharacterGetCurrent();
	if (C && C.IsOwnedByPlayer()) {
		if (InventoryItemNeckSlaveCollarColorMode) {

			// In color picking mode, we allow the user to change the collar color
			ElementPosition("InputColor", 1450, 65, 300);
			ColorPickerDraw(1300, 145, 675, 830, document.getElementById("InputColor"), function (Color) { DialogChangeItemColor(C, Color); });
			DrawButton(1665, 25, 90, 90, "", "White", "Icons/ColorSelect.png");
			DrawButton(1775, 25, 90, 90, "", "White", "Icons/ColorCancel.png");

		} else {

			// In regular mode, the owner can select the collar model and change the offset to get the next 8 models
			ColorPickerHide();
			DrawText(DialogFindPlayer("SlaveCollarSelectType"), 1500, 250, "white", "gray");
			DrawButton(1665, 25, 90, 90, "", "White", "Icons/Next.png");
			DrawButton(1775, 25, 90, 90, "", (DialogFocusItem.Color != null && DialogFocusItem.Color != "Default" && DialogFocusItem.Color != "None") ? DialogFocusItem.Color : "White", "Icons/ColorPick.png");
			for (let I = InventoryItemNeckSlaveCollarOffset; I < InventoryItemNeckSlaveCollarTypes.length && I < InventoryItemNeckSlaveCollarOffset + 8; I++) {
				const A = DialogFocusItem.Asset;
				const Type = InventoryItemNeckSlaveCollarTypes[I];
				const CollarTypeAsset = AssetGet(A.Group.Family, A.Group.Name, Type.Image);
				const CurrentType = DialogFocusItem.Property && DialogFocusItem.Property.Type || "";
				const buttonX = 1000 + ((I - InventoryItemNeckSlaveCollarOffset) % 4) * 250;
				const buttonY = 350 + Math.floor((I - InventoryItemNeckSlaveCollarOffset) / 4) * 300;
				DrawPreviewBox(buttonX, buttonY, `${AssetGetPreviewPath(DialogFocusItem.Asset)}/${Type.Image}.png`, CollarTypeAsset.Description, {Hover: true, Disabled: CurrentType === Type.Name});
			}
		}
	}
}

// Catches the item extension clicks
function InventoryItemNeckSlaveCollarClick() {

	// When the user exits the screen
	if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 25) && (MouseY <= 110)) {
		ElementRemove("InputColor");
		DialogFocusItem = null;
		return;
	}

	// Only the character owner can use the controls in that screen
	var C = CharacterGetCurrent();
	if (C != null && C.IsOwnedByPlayer()) {
		if (InventoryItemNeckSlaveCollarColorMode) {

			// In color picking mode, we allow the user to change the collar color
			if ((MouseX >= 1665) && (MouseX <= 1755) && (MouseY >= 25) && (MouseY <= 110)) {
				let Color = ElementValue("InputColor");
				if (CommonIsColor(Color)) {
					CharacterAppearanceSetColorForGroup(C, Color, "ItemNeck");
					InventoryItemNeckSlaveCollarColorMode = false;
					ElementRemove("InputColor");
					ChatRoomCharacterItemUpdate(C);
					if (CurrentScreen != "ChatRoom") CharacterRefresh(C);
					DialogFocusItem = null;
				}
			}
			if ((MouseX >= 1775) && (MouseX <= 1865) && (MouseY >= 25) && (MouseY <= 110)) {
				InventoryItemNeckSlaveCollarColor = "Default";
				InventoryItemNeckSlaveCollarColorMode = false;
				CharacterAppearanceSetColorForGroup(C, InventoryItemNeckSlaveCollarColor, "ItemNeck");
				ElementRemove("InputColor");
				CharacterLoadCanvas(C);
			}
			if ((MouseX >= 1300) && (MouseX < 1975) && (MouseY >= 145) && (MouseY < 975)) {
				let Color = ElementValue("InputColor");
				CharacterAppearanceSetColorForGroup(C, Color, "ItemNeck");
				CharacterLoadCanvas(C);
				ElementValue("InputColor", Color);
			}

		} else {

			// In regular mode, the owner can select the collar model and change the offset to get the next 8 models
			if ((MouseX >= 1665) && (MouseX <= 1755) && (MouseY >= 25) && (MouseY <= 110)) {
				InventoryItemNeckSlaveCollarOffset = InventoryItemNeckSlaveCollarOffset + 8;
				if (InventoryItemNeckSlaveCollarOffset >= InventoryItemNeckSlaveCollarTypes.length) InventoryItemNeckSlaveCollarOffset = 0;
			}
			if ((MouseX >= 1775) && (MouseX <= 1865) && (MouseY >= 25) && (MouseY <= 110)) {
				InventoryItemNeckSlaveCollarColorMode = true;
				InventoryItemNeckSlaveCollarColor = DialogFocusItem.Color;
				ElementCreateInput("InputColor", "text", (DialogColorSelect != null) ? DialogColorSelect.toString() : "");
			}
			for (let I = InventoryItemNeckSlaveCollarOffset; I < InventoryItemNeckSlaveCollarTypes.length && I < InventoryItemNeckSlaveCollarOffset + 8; I++) {
				var Type = DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.Type || "";
				if ((MouseX >= 1000 + ((I - InventoryItemNeckSlaveCollarOffset) % 4) * 250) && (MouseX <= 1225 + ((I - InventoryItemNeckSlaveCollarOffset) % 4) * 250) && (MouseY >= 350 + Math.floor((I - InventoryItemNeckSlaveCollarOffset) / 4) * 300) && (MouseY <= 625 + Math.floor((I - InventoryItemNeckSlaveCollarOffset) / 4) * 300) && (Type != InventoryItemNeckSlaveCollarTypes[I].Name))
					InventoryItemNeckSlaveCollarSetType(InventoryItemNeckSlaveCollarTypes[I].Name);
			}

		}
	}

}

// Sets the slave collar model
function InventoryItemNeckSlaveCollarSetType(NewType) {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	var Type = InventoryItemNeckSlaveCollarTypes.find(Collar => Collar.Name == NewType) || InventoryItemNeckSlaveCollarTypes[0];
	DialogFocusItem.Property = Type.Property;
	var Dictionary = [];
	Dictionary.push({Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
	Dictionary.push({Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber});
	ChatRoomPublishCustomAction("SlaveCollarChangeType", true, Dictionary);
	CharacterRefresh(C);
}
