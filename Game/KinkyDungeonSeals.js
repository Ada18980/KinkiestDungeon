"use strict";

// Seals are semi-permanent debuffs that afflict the player
// They come in groups, which are used to offer the player a choice between seals
// Seals come in two forms: Greater Seals, and Lesser Seals.
// Lesser Seals require a restoration shrine to remove. You may remove one Lesser Seal per restoration shrine.
// You can also use a Restoration Crystal to remove one. These are dropped by powerful minibosses.
// Greater Seals are safeguarded by powerful magic. To remove one you must use a Restoration Crystal.
// While you possess a Greater Seal, minibosses that drop Restoration Crystals will spawn on every floor with normal enemies.

/** @type {Record<string, KDSealGroup>} */
let KDSealGroups = {
	"LettingGo": {
		arousalMode: true,
		level: 1,
		seals: [

		],
	}
};