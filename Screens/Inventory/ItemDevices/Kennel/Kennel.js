"use strict";

const InventoryItemDevicesKennelOptions = [
	{
		Name: "OpenNoPadding",
		ItemValue: { Door: false, Padding: false},
		Property: { Type: null, Difficulty: -100 }
	}, {
		Name: "OpenPadding",
		ItemValue: { Door: false, Padding: true},
		Property: { Type: "OpenPadding", Difficulty: -100 }
	}, {
		Name: "ClosedNoPadding",
		ItemValue: { Door: true, Padding: false},
		Property: {
			Type: "Closed",
			Effect: ["OneWayEnclose", "Prone", "Freeze"],
			Difficulty: 10,
		}
	}, {
		Name: "ClosedPadding",
		ItemValue: { Door: true, Padding: true},
		Property: {
			Type: "ClosedPadding",
			Effect: ["OneWayEnclose", "Prone", "Freeze"],
			Difficulty: 10,
		}
	}
];

function InventoryItemDevicesKennelLoad() {
	ExtendedItemLoad(InventoryItemDevicesKennelOptions, "SelectKennelType");
}

function InventoryItemDevicesKennelDraw() {
	ExtendedItemDraw(InventoryItemDevicesKennelOptions, "KennelType");
}

function InventoryItemDevicesKennelClick() {
	ExtendedItemClick(InventoryItemDevicesKennelOptions);
}

function InventoryItemDevicesKennelPublishAction(C, Option, PreviousOption) {
	var msg = "KennelSet";
	if (Option.ItemValue.Padding != PreviousOption.ItemValue.Padding) {
		msg += Option.ItemValue.Padding ? "PA" : "PR";
	}
	if (Option.ItemValue.Door != PreviousOption.ItemValue.Door) {
		msg += Option.ItemValue.Door ? "DC" : "DO";
	}

	var Dictionary = [];
	Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber });
	Dictionary.push({ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
	ChatRoomPublishCustomAction(msg, true, Dictionary);
}

function InventoryItemDevicesKennelNpcDialog(C, Option) {
	C.CurrentDialog = DialogFind(C, "Kennel" + Option.Name, "ItemDevices");
}

function InventoryItemDevicesKennelValidate(C, Item, Option) {
	var Allowed = "";
	if (InventoryItemHasEffect(Item, "Lock", true)) {
		Allowed = DialogFind(Player, "CantChangeWhileLocked");
	}
	return Allowed;
}

/** @type {DynamicBeforeDrawCallback} */
function AssetsItemDevicesKennelBeforeDraw({ PersistentData, L, Property }) {
	if (L !== "_Door") return;

	const Data = PersistentData();
	const Properties = Property || {};
	const Type = Properties.Type ? Properties.Type : "Open";

	if (Data.DoorState >= 11 || Data.DoorState <= 1) Data.MustChange = false;

	if ((Data.DoorState < 11 && Type.startsWith("Closed")) || (Data.DoorState > 1 && !Type.startsWith("Closed"))) {
		if (Data.DrawRequested) Data.DoorState += Type.startsWith("Closed") ? 1 : -1;
		Data.MustChange = true;
		Data.DrawRequested = false;
		if (Data.DoorState < 11 && Data.DoorState > 1) return { LayerType: "A" + Data.DoorState };
	}
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemDevicesKennelScriptDraw({ C, PersistentData, Item }) {
	const Data = PersistentData();
	const Properties = Item.Property || {};
	const Type = Properties.Type ? Properties.Type : "Open";
	const FrameTime = 200;

	if (typeof Data.DoorState !== "number") Data.DoorState = Type.startsWith("Closed") ? 11 : 1;
	if (typeof Data.ChangeTime !== "number") Data.ChangeTime = CommonTime() + FrameTime;

	if (Data.MustChange && Data.ChangeTime < CommonTime()) {
		Data.ChangeTime = CommonTime() + FrameTime;
		Data.DrawRequested = true;
		AnimationRequestRefreshRate(C, FrameTime);
		AnimationRequestDraw(C);
	}
}

/**
 * @param {Character} C
 * @returns {string}
 */
function InventoryItemDevicesKennelGetAudio(C) {
	let wasWorn = InventoryGet(C, "ItemDevices") && InventoryGet(C, "ItemDevices").Asset.Name === "Kennel";
	let isSelf = C.ID == 0;
	return isSelf && wasWorn ? "CageStruggle" : "CageEquip";
}
