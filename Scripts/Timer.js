"use strict";
var CurrentTime = 0;
var TimerRunInterval = 20;
var TimerLastTime = CommonTime();
var TimerLastCycleCall = 0;
var TimerLastArousalProgress = 0;
var TimerLastArousalProgressCount = 0;
var TimerLastArousalDecay = 0;

/**
 * Returns the current time from the local computer clock
 * @returns {number} - Returns the number of milliseconds
 */
function TimerGetTime() {
	return new Date().getTime();
}

/**
 * Returns a string of the time remaining on a given timer
 * @param {number} T - Time to convert to a string in ms
 * @returns {string} - The time string in the DD:HH:MM:SS format (Days and hours not displayed if it contains none)
 */
function TimerToString(T) {
	var D = Math.floor(T / 86400000).toString();
	var H = Math.floor((T % 86400000) / 3600000).toString();
	var M = Math.floor((T % 3600000) / 60000).toString();
	var S = Math.floor((T % 60000) / 1000).toString();
	if (S.length == 1) S = "0" + S;
	if (M.length == 1) M = "0" + M;
	if (H.length == 1) H = "0" + H;
	return ((D != "0") ? D + ":" : "") + (((D != "0") || (H != "00")) ? H + ":" : "") + M + ":" + S;
}

/**
 * Returns a string of the time remaining on a given timer (Hours and minutes only)
 * @param {Date} T - Time to convert to a string in ms
 * @returns {string} - The time string in the HH:MM format
 */
function TimerHourToString(T) {
	var M = T.getMinutes().toString();
	var H = T.getHours().toString();
	if (M.length == 1) M = "0" + M;
	return H + ":" + M;
}

/**
 * Check if we must remove items from characters. (Expressions, items being removed, locks, etc.)
 * @returns {void} - Nothing
 */
function TimerInventoryRemove() {

	// Cycles through all items items for all offline characters (player + NPC)
	for (let C = 0; C < Character.length; C++)
		if (Character[C].IsPlayer() || Character[C].IsNpc())
			for (let A = 0; A < Character[C].Appearance.length; A++)
				if ((Character[C].Appearance[A].Property != null) && (Character[C].Appearance[A].Property.RemoveTimer != null))
					if ((typeof Character[C].Appearance[A].Property.RemoveTimer == "number") && (Character[C].Appearance[A].Property.RemoveTimer <= CurrentTime)) {
						const LockName = Character[C].Appearance[A].Property.LockedBy;
						const ShouldRemoveItem = Character[C].Appearance[A].Property.RemoveItem;

						// Remove any lock or timer
						ValidationDeleteLock(Character[C].Appearance[A].Property, false);

						// If we're removing a lock and we're in a chatroom, send a chatroom message
						if (LockName && ServerPlayerIsInChatRoom()) {
							var Dictionary = [
								{Tag: "DestinationCharacterName", Text: CharacterNickname(Character[C]), MemberNumber: Character[C].MemberNumber},
								{Tag: "FocusAssetGroup", AssetGroupName: Character[C].Appearance[A].Asset.Group.Name},
								{Tag: "LockName", AssetName: LockName}
							];
							ServerSend("ChatRoomChat", {Content: "TimerRelease", Type: "Action", Dictionary});
						}

						// If we must remove the linked item from the character or the facial expression
						if (ShouldRemoveItem && Character[C].Appearance[A].Asset.Group.Category === "Item")
							InventoryRemove(Character[C], Character[C].Appearance[A].Asset.Group.Name);
						else if (Character[C].Appearance[A].Asset.Group.AllowExpression != null)
							CharacterSetFacialExpression(Character[C], Character[C].Appearance[A].Asset.Group.Name, null);
						else
							CharacterRefresh(Character[C]);

						return;

					}

}

/**
 * Sets a remove timer in seconds for a specific item part / body part
 * @param {Character} C - Character for which we are removing an item
 * @param {string} AssetGroup - Group targeted by the removal
 * @param {number} Timer - Seconds it takes to remove the item
 * @returns {void} - Nothing
 */
function TimerInventoryRemoveSet(C, AssetGroup, Timer) {
	for (let E = 0; E < C.Appearance.length; E++)
		if (C.Appearance[E].Asset.Group.Name == AssetGroup) {
			if (C.Appearance[E].Property == null) C.Appearance[E].Property = {};
			C.Appearance[E].Property.RemoveTimer = Math.round(CurrentTime + Timer * 1000);
			break;
		}
	CharacterRefresh(C);
}

/**
 * Random trigger for the NPC owner in a private room. If possible, when triggered it will beep the player anywhere in the club, the player has 2 minutes to get back to her
 * @returns {void} - Nothing
 */
function TimerPrivateOwnerBeep() {

}


/**
 * Main timer process
 * @param {number} Timestamp - Time in ms of the time when the function was called
 * @returns {void} - Nothing
 */
function TimerProcess(Timestamp) {

	// Increments the time from the last frame
	TimerRunInterval = Timestamp - TimerLastTime;
	TimerLastTime = Timestamp;
	CurrentTime = CurrentTime + TimerRunInterval;

	// At each 1700 ms, we check for timed events (equivalent of 100 cycles at 60FPS)
	if (TimerLastCycleCall + 1700 <= CommonTime()) {
		TimerInventoryRemove();
		TimerPrivateOwnerBeep();
		TimerLastCycleCall = CommonTime();
	}

	if (ControllerActive == true) {
		if (ControllerCurrentButton >= ControllerButtonsX.length) {
			ControllerCurrentButton = 0;
		}
		DrawRect(MouseX - 5, MouseY - 5, 10, 10, "Cyan");
	}

	// Launches the main again for the next frame
	requestAnimationFrame(MainRun);

}

/**
 * Returns a string of the time remaining on a given timer (Hours, minutes, seconds)
 * @param {number} s - Time to convert to a string in ms
 * @Returns -  The time string in the HH:MM:SS format
 */
function TimermsToTime(s) {

	// Pad to 2 or 3 digits, default is 2
	function pad(n, z) {
		z = z || 2;
		return ('00' + n).slice(-z);
	}

	// Returns the formatted value
	var ms = s % 1000;
	s = (s - ms) / 1000;
	var secs = s % 60;
	s = (s - secs) / 60;
	var mins = s % 60;
	var hrs = (s - mins) / 60;
	return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);

}
