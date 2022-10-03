"use strict";

var LoverTimerChooseList = [1, 2, 4, 8, 16, 24, 48, 72, 96, 120, 144, 168, -144, -72, -48, -24, -8, -4];
var LoverTimerChooseIndex = 0;

// Loads the item extension properties
function InventoryItemMiscLoversTimerPadlockLoad() {
    if ((DialogFocusSourceItem != null) && (DialogFocusSourceItem.Property == null)) DialogFocusSourceItem.Property = {};
    if ((DialogFocusSourceItem != null) && (DialogFocusSourceItem.Property != null) && (DialogFocusSourceItem.Property.RemoveItem == null)) DialogFocusSourceItem.Property.RemoveItem = false;
    if ((DialogFocusSourceItem != null) && (DialogFocusSourceItem.Property != null) && (DialogFocusSourceItem.Property.ShowTimer == null)) DialogFocusSourceItem.Property.ShowTimer = true;
    if ((DialogFocusSourceItem != null) && (DialogFocusSourceItem.Property != null) && (DialogFocusSourceItem.Property.EnableRandomInput == null)) DialogFocusSourceItem.Property.EnableRandomInput = false;
    if ((DialogFocusSourceItem != null) && (DialogFocusSourceItem.Property != null) && (DialogFocusSourceItem.Property.MemberNumberList == null)) DialogFocusSourceItem.Property.MemberNumberList = [];
}

// Draw the extension screen
function InventoryItemMiscLoversTimerPadlockDraw() {
    var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
    if ((DialogFocusItem == null) || (DialogFocusSourceItem.Property.RemoveTimer < CurrentTime)) { InventoryItemMiscLoversTimerPadlockExit(); return; }
    if (DialogFocusSourceItem.Property.ShowTimer) {
        DrawText(DialogFindPlayer("TimerLeft") + " " + TimerToString(DialogFocusSourceItem.Property.RemoveTimer - CurrentTime), 1500, 150, "white", "gray");
    } else { DrawText(DialogFindPlayer("TimerUnknown"), 1500, 150, "white", "gray"); }
    DrawAssetPreview(1387, 225, DialogFocusItem.Asset);
    DrawText(DialogFindPlayer(DialogFocusItem.Asset.Group.Name + DialogFocusItem.Asset.Name + "Intro"), 1500, 600, "white", "gray");

    // Draw the settings
    if (Player.CanInteract() && (C.IsLoverOfPlayer() || C.IsOwnedByPlayer())) {
        MainCanvas.textAlign = "left";
        DrawButton(1100, 666, 64, 64, "", "White", (DialogFocusSourceItem.Property.RemoveItem) ? "Icons/Checked.png" : "");
        DrawText(DialogFindPlayer("RemoveItemWithTimer"), 1200, 698, "white", "gray");
        DrawButton(1100, 746, 64, 64, "", "White", (DialogFocusSourceItem.Property.ShowTimer) ? "Icons/Checked.png" : "");
        DrawText(DialogFindPlayer("ShowItemWithTimerRemaining"), 1200, 778, "white", "gray");
        DrawButton(1100, 826, 64, 64, "", "White", (DialogFocusSourceItem.Property.EnableRandomInput) ? "Icons/Checked.png" : "");
        DrawText(DialogFindPlayer("EnableRandomInput"), 1200, 858, "white", "gray");
        MainCanvas.textAlign = "center";
    } else {
        if ((DialogFocusSourceItem != null) && (DialogFocusSourceItem.Property != null) && (DialogFocusSourceItem.Property.LockMemberNumber != null))
            DrawText(DialogFindPlayer("LockMemberNumber") + " " + DialogFocusSourceItem.Property.LockMemberNumber.toString(), 1500, 700, "white", "gray");
        DrawText(DialogFindPlayer(DialogFocusItem.Asset.Group.Name + DialogFocusItem.Asset.Name + "Detail"), 1500, 800, "white", "gray");
        DrawText(DialogFindPlayer((DialogFocusSourceItem.Property.RemoveItem) ? "WillRemoveItemWithTimer" : "WontRemoveItemWithTimer"), 1500, 868, "white", "gray");
    }

    // Draw buttons to add/remove time if available
    if (Player.CanInteract() && (C.IsLoverOfPlayer() || C.IsOwnedByPlayer())) {
        DrawButton(1100, 910, 250, 70, DialogFindPlayer("AddTimerTime"), "White");
        DrawBackNextButton(1400, 910, 250, 70, LoverTimerChooseList[LoverTimerChooseIndex] + " " + DialogFindPlayer("Hours"), "White", "",
            () => LoverTimerChooseList[(LoverTimerChooseList.length + LoverTimerChooseIndex - 1) % LoverTimerChooseList.length] + " " + DialogFindPlayer("Hours"),
            () => LoverTimerChooseList[(LoverTimerChooseIndex + 1) % LoverTimerChooseList.length] + " " + DialogFindPlayer("Hours"));
    }
    else if (Player.CanInteract() && DialogFocusSourceItem.Property.EnableRandomInput) {
        for (let I = 0; I < DialogFocusSourceItem.Property.MemberNumberList.length; I++) {
            if (DialogFocusSourceItem.Property.MemberNumberList[I] == Player.MemberNumber) return;
        }
        DrawButton(1100, 910, 250, 70, "- 2 " + DialogFindPlayer("Hours"), "White");
        DrawButton(1400, 910, 250, 70, DialogFindPlayer("Random"), "White");
        DrawButton(1700, 910, 250, 70, "+ 2 " + DialogFindPlayer("Hours"), "White");
    }
}

// Catches the item extension clicks
function InventoryItemMiscLoversTimerPadlockClick() {
    if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 25) && (MouseY <= 110)) InventoryItemMiscLoversTimerPadlockExit();
    if (!Player.CanInteract()) return;
    var C = CharacterGetCurrent();

    if (C.IsLoverOfPlayer() || C.IsOwnedByPlayer()) {
        if ((MouseX >= 1100) && (MouseX <= 1164)) {
            if ((MouseY >= 666) && (MouseY <= 730)) { DialogFocusSourceItem.Property.RemoveItem = !(DialogFocusSourceItem.Property.RemoveItem); }
            if ((MouseY >= 746) && (MouseY <= 810)) { DialogFocusSourceItem.Property.ShowTimer = !(DialogFocusSourceItem.Property.ShowTimer); }
            if ((MouseY >= 826) && (MouseY <= 890)) { DialogFocusSourceItem.Property.EnableRandomInput = !(DialogFocusSourceItem.Property.EnableRandomInput); }
            if (CurrentScreen == "ChatRoom") ChatRoomCharacterItemUpdate(CharacterGetCurrent());
        }
    }

    if ((MouseY >= 910) && (MouseY <= 975)) {
        if (C.IsLoverOfPlayer() || C.IsOwnedByPlayer()) {
            if ((MouseX >= 1100) && (MouseX < 1350)) InventoryItemMiscLoversTimerPadlockAdd(LoverTimerChooseList[LoverTimerChooseIndex] * 3600);
            if ((MouseX >= 1400) && (MouseX < 1650)) {
                if (MouseX <= 1525) LoverTimerChooseIndex = (LoverTimerChooseList.length + LoverTimerChooseIndex - 1) % LoverTimerChooseList.length;
                else LoverTimerChooseIndex = (LoverTimerChooseIndex + 1) % LoverTimerChooseList.length;
            }
        }
        else if (DialogFocusSourceItem.Property.EnableRandomInput) {
            for (let I = 0; I < DialogFocusSourceItem.Property.MemberNumberList.length; I++) {
                if (DialogFocusSourceItem.Property.MemberNumberList[I] == Player.MemberNumber) return;
            }
            if ((MouseX >= 1100) && (MouseX < 1350)) { InventoryItemMiscLoversTimerPadlockAdd(-2 * 3600, true); }
            if ((MouseX >= 1400) && (MouseX < 1650)) { InventoryItemMiscLoversTimerPadlockAdd(4 * 3600 * ((Math.random() >= 0.5) ? 1 : -1), true); }
            if ((MouseX >= 1700) && (MouseX < 1950)) { InventoryItemMiscLoversTimerPadlockAdd(2 * 3600, true); }
        }
    }
}

// When a value is added to the timer, can be a negative one
function InventoryItemMiscLoversTimerPadlockAdd(TimeToAdd, PlayerMemberNumberToList) {
    if (PlayerMemberNumberToList) DialogFocusSourceItem.Property.MemberNumberList.push(Player.MemberNumber);
    var TimerBefore = DialogFocusSourceItem.Property.RemoveTimer;
    if (DialogFocusItem.Asset.RemoveTimer > 0) DialogFocusSourceItem.Property.RemoveTimer = Math.round(Math.min(DialogFocusSourceItem.Property.RemoveTimer + (TimeToAdd * 1000), CurrentTime + (DialogFocusItem.Asset.MaxTimer * 1000)));
    var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
    if (CurrentScreen == "ChatRoom") {
        var timeAdded = (DialogFocusSourceItem.Property.RemoveTimer - TimerBefore) / (1000 * 3600);
        var msg = ((timeAdded < 0) && DialogFocusSourceItem.Property.ShowTimer ? "TimerRemoveTime" : "TimerAddTime");
        var Dictionary = [];
        Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber });
        Dictionary.push({ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
        if (DialogFocusSourceItem.Property.ShowTimer) {
            Dictionary.push({ Tag: "TimerTime", Text: Math.round(Math.abs(timeAdded)) });
            Dictionary.push({ Tag: "TimerUnit", TextToLookUp: "Hours" });
        } else {
            Dictionary.push({ Tag: "TimerTime", TextToLookUp: "TimerAddRemoveUnknownTime" });
            Dictionary.push({ Tag: "TimerUnit", Text: "" });
        }
        Dictionary.push({ Tag: "FocusAssetGroup", AssetGroupName: C.FocusGroup.Name });

        for (let A = 0; A < C.Appearance.length; A++) {
            if (C.Appearance[A].Asset.Group.Name == C.FocusGroup.Name)
                C.Appearance[A] = DialogFocusSourceItem;
        }
        ChatRoomPublishCustomAction(msg, true, Dictionary);
    } else { CharacterRefresh(C); }
    InventoryItemMiscLoversTimerPadlockExit();
}

// Exits the extended menu
function InventoryItemMiscLoversTimerPadlockExit() {
    DialogFocusItem = null;
    if (DialogInventory != null) DialogMenuButtonBuild(CharacterGetCurrent());
}
