"use strict";

var ReputationValidReputations = ["Dominant", "Kidnap", "ABDL", "Gaming", "Maid", "LARP", "Asylum", "Gambling", "HouseMaiestas", "HouseVincula", "HouseAmplector", "HouseCorporis"];

/**
 * Alters a given reputation value for the player
 * @param {string} RepType - The name/type of the reputation to alter
 * @param {number} RepValue - Reputation to add/subtract to the current reputation value.
 * @param {boolean} [Push=true] - Pushes the reputation to the server if TRUE
 * @returns {void} - Nothing
 */
function ReputationChange(RepType, RepValue, Push) {

	if (ReputationValidReputations.includes(RepType)) {

		// Nothing will be done for a zero change
		RepValue = parseInt(RepValue) || 0;
		if (RepValue != 0) {

			// If the reputation already exists, we update and push it
			for (let R = 0; R < Player.Reputation.length; R++)
				if (Player.Reputation[R].Type == RepType) {
					Player.Reputation[R].Value = Player.Reputation[R].Value + RepValue;
					if (Player.Reputation[R].Value > 100) Player.Reputation[R].Value = 100;
					if (Player.Reputation[R].Value < -100) Player.Reputation[R].Value = -100;
					if ((Push == null) || Push) ServerPlayerReputationSync();
					return;
				}

			// Creates the new reputation
			var NewRep = {
				Type: RepType,
				Value: RepValue
			};
			if (NewRep.Value > 100) NewRep.Value = 100;
			if (NewRep.Value < -100) NewRep.Value = -100;
			Player.Reputation.push(NewRep);
			if ((Push == null) || Push) ServerPlayerReputationSync();

		}
	}

	else {
		console.warn(`Invalid reputation type "${RepType}"`);
	}
}

/**
 * Loads the reputation data from the server
 * @param {Array.<{Type: string, Value: number}>} NewRep - The array of reputation-value pairs to load for the current player
 * @returns {void} - Nothing
 */
function ReputationLoad(NewRep) {
	// Make sure we have something to load
	if (NewRep != null) {

		// Add each reputation entry one by one
		for (let R = 0; R < NewRep.length; R++)
			ReputationChange(NewRep[R].Type, NewRep[R].Value, false);

	}

}

/**
 * Returns a specific reputation value for the player
 * @param {string} RepType - Type/name of the reputation to get the value of.
 * @returns {number} - Returns the value of the reputation. It can range from 100 to -100, and it defaults to 0 if the player never earned this type of reputation before.
 */
function ReputationGet(RepType) {
	for (let R = 0; R < Player.Reputation.length; R++)
		if (Player.Reputation[R].Type == RepType)
			return parseInt(Player.Reputation[R].Value);
	return 0;
}

/**
 * Returns a specific reputation value for a given character
 * @param {Character} C - Character to get the reputation for.
 * @param {string} RepType - Type/name of the reputation to get the value of.
 * @returns {number} - Returns the value of the reputation. It can range from 100 to -100, and it defaults to 0 if the given character never earned this type of reputation before.
 */
function ReputationCharacterGet(C, RepType) {
	if ((C != null) && (C.Reputation != null))
		for (let R = 0; R < C.Reputation.length; R++)
			if (C.Reputation[R].Type == RepType)
				return parseInt(C.Reputation[R].Value);
	return 0;
}

/**
 * Alter the reputation progress by a factor. The higher the rep, the slower it gets, a reputation is easier to break than to build. Takes the cheater version factor into account.
 * @param {string} RepType - Type/name of the reputation
 * @param {number|string} Value - Value of the reputation change before the factor is applied
 * @return {void} - Nothing
 */
function ReputationProgress(RepType, Value) {
	var V = ReputationGet(RepType);
	Value = parseInt(Value) * CheatFactor("DoubleReputation", 2);
	if (Value > 0) {
		if ((V >= 70) && (V <= 100)) ReputationChange(RepType, Math.floor(Value / 3));
		if ((V >= 30) && (V < 70)) ReputationChange(RepType, Math.floor(Value / 2));
		if ((V > -30) && (V < 30)) ReputationChange(RepType, Value);
		if ((V > -70) && (V <= -30)) ReputationChange(RepType, Value * 2);
		if ((V >= -100) && (V <= -70)) ReputationChange(RepType, Value * 4);
	} else {
		if ((V >= -100) && (V <= -70)) ReputationChange(RepType, Math.floor(Value * -1 / 3) * -1);
		if ((V > -70) && (V <= -30)) ReputationChange(RepType, Math.floor(Value * -1 / 2) * -1);
		if ((V > -30) && (V < 30)) ReputationChange(RepType, Value);
		if ((V >= 30) && (V < 70)) ReputationChange(RepType, Value * 2);
		if ((V >= 70) && (V <= 100)) ReputationChange(RepType, Value * 4);
	}
}
