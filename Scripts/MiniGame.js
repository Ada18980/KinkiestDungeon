"use strict";
var MiniGameAdvancedPayment = 0;
var MiniGameReturnFunction = "";

/**
 * Starts a given mini game at a set difficulty and keeps
 * @param {string} GameType - Name of the mini-game to launch
 * @param {number|string} Difficulty - Difficulty Ration for the mini-game
 * @param {string} ReturnFunction - Callback name to execute once the mini-game is over
 * @returns {void} - Nothing
 */
function MiniGameStart(GameType, Difficulty, ReturnFunction) {
	CurrentCharacter = null;
	MiniGameReturnFunction = ReturnFunction;
	CommonSetScreen("MiniGame", GameType);
}
