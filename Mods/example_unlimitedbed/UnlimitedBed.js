"use strict";

// from KinkyDungeonStats.ts, restore WP to 100%
KDSleepWillFraction = 1.0;
KDSleepWillFractionJail = 1.0;

// If the function would be removed in the future fail gracefully
if (typeof KDCanSleep === "function") {
    KDCanSleep = function() {
        // if health or mana pool is not maxed
        return (KinkyDungeonStatWill < KDGetSleepWillRegenHealthTo()) || (KinkyDungeonStatManaPool < KinkyDungeonStatManaPoolMax);
    }
} else {
    log.error("Cannot find KDCanSleep function!");
}


if (typeof KDCanSleepTooltip === "function") {
    KDCanSleepTooltip = function() {
        // remove already slept and jail condition
        /*if(KinkyDungeonFlags.get('slept') && !KinkyDungeonPlayerInCell()) {
		    return "KDBedSleptLevel";
        }*/

        // modify to if Health AND Mana is full
        if((KinkyDungeonStatWill >= KDGetSleepWillRegenHealthTo()) && (KinkyDungeonStatManaPool >= KinkyDungeonStatManaPoolMax)) {
            return "KDBedWillNotLow"; // too lazy to add new tooltip
        }

        // should not reach this point
        return "KDBedWillNotLow";
    }
} else {
    log.error("Cannot find KDCanSleepTooltip function!");
}
