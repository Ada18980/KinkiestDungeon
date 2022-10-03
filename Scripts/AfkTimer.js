"use strict";

var AfkTimerIncrementMs = 1000 * 60; // 1 minutes
var AfkTimerTimout = 5; // AfkTimerIncrementMs * 5  ==> 5 minutes
var AfkTimerIdle = 0;
var AfkTimerIsSet = false;
var AfkTimerIsEnabled = null;
var AfkTimerEventsList = ['mousedown', 'mousemove', 'keypress', 'touchstart'];
var AfkTimerID = null;
var AfkTimerOldEmoticon = null;

/**
 * Resets the timer for AFK count
 * @returns {void} - Nothing
 */
function AfkTimerReset() {
	AfkTimerIdle = 0;
	if (AfkTimerIsSet) {
		AfkTimerIsSet = false;
		CharacterSetFacialExpression(Player, "Emoticon", AfkTimerOldEmoticon);
		AfkTimerOldEmoticon = null;
	}
}

/**
 * Increments the AFK Timer by 1. Is called from the browser's timer handler method.
 * @see {@link AfkTimerStart} and {@link AfkTimerStop} for the registering and unregistering of this function.
 * @returns {void} - Nothing
 */
function AfkTimerIncrement() {
	if (++AfkTimerIdle >= AfkTimerTimout) {
		AfkTimerSetIsAfk();
	}
}

/**
 * Registers the AfkTimerReset method for every event that is listed in AfkTimerEventsList and starts the timer count.
 * @returns {void} - Nothing
 */
function AfkTimerStart() {
	AfkTimerEventsList.forEach(e => document.addEventListener(e, AfkTimerReset, true));
	AfkTimerID = setInterval(AfkTimerIncrement, AfkTimerIncrementMs);
}

/**
 * Unregisters the AfkTimerReset method from all events listed in AfkTimerEventsList and stops the timer count
 * @returns {void} - Nothing
 */
function AfkTimerStop() {
	AfkTimerEventsList.forEach(e => document.removeEventListener(e, AfkTimerReset, true));
	if (AfkTimerID != null) clearInterval(AfkTimerID);
	AfkTimerID = null;
}

/**
 * Enables or disables the afk timer. Is called, when the player changes her settings in the preferences dialog
 * @param {boolean} Enabled - Determines, wether the afk timer will be enabled (true) or disabled (false).
 * @returns {void} - Nothing
 */
function AfkTimerSetEnabled(Enabled) {
	if (typeof Enabled !== 'boolean') return;
	if (AfkTimerIsEnabled == Enabled) return;
	AfkTimerIsEnabled = Enabled;

	if (AfkTimerIsEnabled)
		AfkTimerStart();
	else
		AfkTimerStop();
}

/**
 * Sets the players's emote to the Afk symbol, when the timer runs out and saves the current Emoticon, if there is any
 * @returns {void} - Nothing
 */
function AfkTimerSetIsAfk() {
	if (CurrentScreen != "ChatRoom") return;
	if (AfkTimerIsSet) return;
	// save the current Emoticon, if there is any
	if (InventoryGet(Player, "Emoticon") && InventoryGet(Player, "Emoticon").Property && AfkTimerOldEmoticon == null) {
		AfkTimerOldEmoticon = InventoryGet(Player, "Emoticon").Property.Expression;
	}
	CharacterSetFacialExpression(Player, "Emoticon", "Afk");
	AfkTimerIsSet = true;
}