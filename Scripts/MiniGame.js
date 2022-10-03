"use strict";
var MiniGameType = "";
var MiniGameVictory = false;
var MiniGamePerfect = true;
/** @type {number|string} */
var MiniGameDifficulty = "";
var MiniGameDifficultyRatio = 1;
var MiniGameAdvancedPayment = 0;
var MiniGameReturnFunction = "";
var MiniGameProgress = -1;
var MiniGameTimer = 0;
var MiniGameEnded = false;
var MiniGameCheatAvailable = false;

function MiniGameLoad() {
	if (CurrentScreen == "Kidnap" || CurrentScreen == "HorseWalk") CurrentDarkFactor = 0.5;
}

/**
 * Starts a given mini game at a set difficulty and keeps
 * @param {string} GameType - Name of the mini-game to launch
 * @param {number|string} Difficulty - Difficulty Ration for the mini-game
 * @param {string} ReturnFunction - Callback name to execute once the mini-game is over
 * @returns {void} - Nothing
 */
function MiniGameStart(GameType, Difficulty, ReturnFunction) {
	CurrentCharacter = null;
	MiniGameType = GameType;
	MiniGameDifficulty = Difficulty;
	MiniGameDifficultyRatio = 1;
	MiniGameReturnFunction = ReturnFunction;
	MiniGameVictory = (Math.random() > 0.5);
	MiniGamePerfect = true;
	MiniGameProgress = -1;
	MiniGameTimer = 0;
	MiniGameEnded = false;
	MiniGameCheatAvailable = false;
	CommonSetScreen("MiniGame", GameType);
}
