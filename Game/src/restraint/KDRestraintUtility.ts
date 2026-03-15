"use strict";


// TODO add slime, vine security so some enemies can bypass slime, vines, etc


/**
 * Gets a list of restraints blocking this group
 * @param Group - regular group for player, slot or row for NPC
 * @param External
 * @param specificItem check ends once this item is reached
 */
function KDGetPotentialBlockingRestraints(Group: string, _External?: boolean, specificItem?: item | NPCRestraint, player?: entity): (item | NPCRestraint)[] {
    if (!player || player == KDPlayer()) {
        // Create the storage system
        let map: Map<item, boolean> = new Map();
        let all = KDAllRestraintDynamicList();
        // For this section we just create a set of items that block this one
        if (KinkyDungeonPlayerTags.get("ChastityLower") && ["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) {
            for (let item of all) {
                if (specificItem?.id == item.id || item == specificItem) break;
                if (!map.get(item) && (item == specificItem || KDRestraint(item)?.chastity)) {
                    map.set(item, true);
                }
            }
        }
        if (KinkyDungeonPlayerTags.get("ChastityUpper") && ["ItemNipples", "ItemNipplesPiercings"].includes(Group)) {
            for (let item of all) {
                if (specificItem?.id == item.id || item == specificItem) break;
                if (!map.get(item) && (item == specificItem || KDRestraint(item)?.chastitybra)) {
                    map.set(item, true);
                }
            }
        }
        if (KinkyDungeonPlayerTags.get("Block_" + Group)) {
            for (let item of all) {
                if (specificItem?.id == item.id || item == specificItem) break;
                if (!map.get(item) && (item == specificItem || KDRestraint(item)?.shrine?.includes("Block_" + Group))) {
                    map.set(item, true);
                }
            }
        }

        if (!specificItem || !KDRestraint(specificItem).alwaysAccessible) {
            let link = KinkyDungeonGetRestraintItem(Group);
            let TagsSoFar: Record<string, boolean> = {};
            while (link && KDRestraint(link)) {
                if (link == specificItem) break;
                if ((link == specificItem
                        || KDRestraint(link).inaccessible
                        || (specificItem && KDRestraint(specificItem).alwaysInaccessible)
                        || (specificItem && 
                            !KDRestraint(specificItem).alwaysRender
                                && !(!KDRestraint(specificItem).renderExcept
                                || !KDRestraint(specificItem).renderExcept.some((tag) => {
                                    return TagsSoFar[tag];
                                }))
                            && (
                                KDRestraint(link).UnderlinkedAlwaysRender
                                    || KDRestraint(link).accessible
                                    || (KDRestraint(specificItem).renderWhenLinked
                                    && KDRestraint(link).shrine && KDRestraint(specificItem).renderWhenLinked.some(
                                        (tag) => {return KDRestraint(link).shrine.includes(tag);}))
                            )
                        )
                    )) {
                    if (KDRestraint(link).shrine) {
                        for (let tag of KDRestraint(link).shrine) {
                            TagsSoFar[tag] = true;
                        }
                    }
                    if (!map.get(link))
                        map.set(link, true);
                }
                link = link.dynamicLink;
            }
        }
        
        // TODO make this generalized
        if (Group == "ItemHands") {
            let arms = KinkyDungeonGetRestraintItem("ItemArms");
            if (arms) {
                let link = arms;
                while (link && KDRestraint(link)) {
                    if (KDRestraint(link).inaccessible && !map.get(link)) {
                        map.set(link, true);
                    }
                    link = link.dynamicLink;
                }
            }
        }
        if (specificItem)
            map.set(specificItem, true);
        // Return restraints still in the list
        return [...map.keys()];
    } else if (player && KDGetNPCRestraints(player.id)) {

        // TODO might be necessary to allow adding sybian to NPCs?
        // note: need to maybe add handling for entityCanUnlock where the player is an entity and the entity is the player.....
        
        let map: Map<NPCRestraint, boolean> = new Map();
        let restraints = KDGetNPCRestraints(player.id);

        let row = KDGetEncaseGroupRow(Group);

        let all = Object.values(restraints);
        // For this section we just create a set of items that block this one
        if (["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) {
            for (let item of all) {
                if (specificItem?.id == item.id || item == specificItem) break;
                if (!map.get(item) && (item == specificItem || KDRestraint(item)?.chastity)) {
                    map.set(item, true);
                }
            }
        }
        if (["ItemNipples", "ItemNipplesPiercings"].includes(Group)) {
            for (let item of all) {
                if (specificItem?.id == item.id || item == specificItem) break;
                if (!map.get(item) && (item == specificItem || KDRestraint(item)?.chastitybra)) {
                    map.set(item, true);
                }
            }
        }

        if (specificItem && !KDRestraint(specificItem).alwaysAccessible) {
            for (let entry of Object.entries(restraints)) {
                if (specificItem?.id == entry[1].id || entry[1] == specificItem) {
                    let encaseSlots = KDGetEncaseGroupSlot(entry[0])?.encasedBy;
                    if (encaseSlots?.length > 0) {
                        for (let slot of encaseSlots) {
                            if (restraints[slot]) {
                                map.set(restraints[slot], true);
                            }
                        }
                    }
                    break;
                }
            }
        } else if (!specificItem) {
            if (restraints[row.encaseGroup.id]) {
                map.set(restraints[row.encaseGroup.id], true);
            }
        }

        if (specificItem)
            map.set(specificItem as NPCRestraint, true);

        return [...map.keys()]; 
    }
	
	

}






/**
 * Gets blockers for a particular restraint type being ADDED
 */
function KDGetBlockersToAddRestraint(restraint: restraint, player?: entity, bypass?: boolean): (item | NPCRestraint)[] {
    if (!player || player == KDPlayer()) {
        // Create the storage system
        let map: Map<item, boolean> = new Map();
        let all = KDAllRestraintDynamicList();
        let Group = restraint.Group;
        // For this section we just create a set of items that block this one
        if (!bypass) {
            if (KinkyDungeonPlayerTags.get("ChastityLower") && ["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) {
                for (let item of all) {
                    if (!map.get(item) && (KDRestraint(item)?.chastity)) {
                        map.set(item, true);
                    }
                }
            }
            if (KinkyDungeonPlayerTags.get("ChastityUpper") && ["ItemNipples", "ItemNipplesPiercings"].includes(Group)) {
                for (let item of all) {
                    if (!map.get(item) && (KDRestraint(item)?.chastitybra)) {
                        map.set(item, true);
                    }
                }
            }
            if (KinkyDungeonPlayerTags.get("Block_" + Group)) {
                for (let item of all) {
                    if (!map.get(item) && (KDRestraint(item)?.shrine?.includes("Block_" + Group))) {
                        map.set(item, true);
                    }
                }
            }
        }
       


        
        if (restraint.requireNoTagToEquip
            // ||
        ) {
            if (!KDIsEligible(restraint)) {
                let r = restraint;
                if (r.requireNoTagToEquip) {
                    for (let tag of r.requireNoTagToEquip) {
                        for (let item of Object.values(all)) {
                            if (KDValidateTagForItem(tag, item)) {
                                map.set(item, true);
                            }
                        }
                    }
                }
            }
        }

       

        // TODO make this generalized
        if (!bypass && Group == "ItemHands") {
            let arms = KinkyDungeonGetRestraintItem("ItemArms");
            if (arms) {
                let link = arms;
                while (link && KDRestraint(link)) {
                    if (KDRestraint(link).inaccessible && !map.get(link)) {
                        map.set(link, true);
                    }
                    link = link.dynamicLink;
                }
            }
        }
        // Return restraints still in the list
        return [...map.keys()];
    } else if (player && KDGetNPCRestraints(player.id)) {
        
        let map: Map<NPCRestraint, boolean> = new Map();
        let restraints = KDGetNPCRestraints(player.id);
        let Group = restraint.Group;


        let all = Object.values(restraints);
        // For this section we just create a set of items that block this one
        if (!bypass) {
            if (["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) {
                for (let item of all) {
                    if (!map.get(item) && (KDRestraint(item)?.chastity)) {
                        map.set(item, true);
                    }
                }
            }
            if (["ItemNipples", "ItemNipplesPiercings"].includes(Group)) {
                for (let item of all) {
                    if (!map.get(item) && ( KDRestraint(item)?.chastitybra)) {
                        map.set(item, true);
                    }
                }
            }
        }
       

        /*// note: right now you can always add an item under encasement, to NPCs
        // this may need to change but for now its how it is

        if (restraint.alwaysAccessible) {
            for (let entry of Object.entries(restraints)) {
                if (specificItem?.id == entry[1].id || entry[1] == specificItem) {
                    let encaseSlots = KDGetEncaseGroupSlot(entry[0])?.encasedBy;
                    if (encaseSlots?.length > 0) {
                        for (let slot of encaseSlots) {
                            if (restraints[slot]) {
                                map.set(restraints[slot], true);
                            }
                        }
                    }
                    break;
                }
            }
        } else if (!specificItem) {
            if (restraints[row.encaseGroup.id]) {
                map.set(restraints[row.encaseGroup.id], true);
            }
        }*/
       
        if (restraint.requireNoTagToEquip
            // ||
        ) {
            let npcSprite = KDNPCChar.get(player.id);
            if (npcSprite) {
                if (NPCTags.get(npcSprite) && KDIsEligibleNPC(restraint, player.id, NPCTags.get(npcSprite))) {
                    let r = restraint;
                    if (r.requireNoTagToEquip) {
                        for (let tag of r.requireNoTagToEquip) {
                            for (let item of Object.values(restraints)) {
                                if (KDValidateTagForItem(tag, item)) {
                                    map.set(item, true);
                                }
                            }
                        }
                    }
                }
            }
        }

        // check if anything is blocking, if so, put it as a blocker
        if (!bypass) {
            let slot = KDGetNPCBindingSlotForItem(restraint, player.id, false, undefined);
            if (!slot) {
                let slotToLook = KDGetNPCBindingSlotForItem(restraint, player.id, true, undefined);
                if (slotToLook && restraints[slotToLook.sgroup.id] != null) {
                    map.set(restraints[slotToLook.sgroup.id], true);
                }
            }
        }
        

        return [...map.keys()]; 
    }
}




/**
 * @param Group
 * @param enemy
 */
function KDEnemyPassesSecurity(Group: string, enemy: entity): string {
	if (!enemy) return "";
	let blockers = KDGetPotentialBlockingRestraints(Group, true);
	for (let blocker of blockers) {
		if (!KDRestraint(blocker)?.Security) return "";
		for (let secure of Object.entries(KDRestraint(blocker).Security)) {
			if (KDGetSecurity(enemy, secure[0]) >= secure[1]) return secure[0];
		}
	}
	return "";
}

interface KDCanPassSecurityData {
    blockers: KDBlockingItemToData[],
    success: boolean,
}

/**
 * check if an enemy can bypass a specific item or, if undefined, all items in a group
 * @param entity 
 * @param item can be null if group isnt null
 * @param group can be null if item isnt null
 * @param bypass ignore all items on top
 */
function KDEnemyCanPassSecurity(entity: entity, player: entity, item: item | NPCRestraint, group: string, bypass: boolean = true): KDCanPassSecurityData {
    if (bypass) {
        if (item) {
            let cantUnlock = KDEnemyCantUnlock(entity, item);
        
            return {
                blockers: !cantUnlock ? null : [
                    {item: item, reason: "Unlock"}
                ],
                success: !cantUnlock,
            };
        }
    } else {
        return {
            blockers: null,
            success: true,
        };
    }
    
    
    let top = (!player || player.player) ? KinkyDungeonGetRestraintItem(group ? group : KDRestraint(item).Group) : null;
    if (top || (player && !player.player)) {
        if (item) {
            let blockingItems = KDGetBlockingItemsTo(entity, player, item, false);
            if (blockingItems?.length > 0) {
                return {
                    blockers: blockingItems,
                    success: false,
                };
            }
        } else {
            let blockingItems = KDGetBlockingItems(entity, player, group, false);

            if (blockingItems?.length > 0) {
                return {
                    blockers: blockingItems,
                    success: false,
                };
            }
        }
        
    }
    return {
        blockers: null,
        success: true,
    };
}

interface KDBlockingItemToData {
    item: item | NPCRestraint,
    reason: string,
}


function KDGetAllBlockingItemsToRestraintsWithShrineTag(entity, player, tag): (item | NPCRestraint)[] {
    if (player.player) {
        let relevantRestraints = KDAllRestraintDynamicList().filter(
            (inv) => {
                return KDRestraint(inv)?.shrine?.includes(tag);
            }
        );
        let map = new Map();

        for (let item of relevantRestraints) {
            let blockingItems = KDGetBlockingItemsTo(entity, player, item, false);
            if (blockingItems?.length > 0) {
                for (let inv of blockingItems) {
                    if (!map.get(inv)) map.set(inv, true)
                }
            }
        }

        return [...map.keys()];

    } else if (entity && KDGetNPCRestraints(entity.id)) {
        // TODO might be necessary to allow adding sybian to NPCs?
        // note: need to maybe add handling for entityCanUnlock where the player is an entity and the entity is the player.....

        let relevantRestraints = Object.values(KDGetNPCRestraints(entity.id)).filter(
            (inv) => {
                return KDRestraint(inv)?.shrine?.includes(tag);
            }
        );
        let map = new Map();

        for (let item of relevantRestraints) {
            let blockingItems = KDGetBlockingItemsTo(entity, player, item, false);
            if (blockingItems?.length > 0) {
                for (let inv of blockingItems) {
                    if (!map.get(inv)) map.set(inv, true)
                }
            }
        }

        return [...map.keys()];
    }
}

function KDGetBlockingItemsTo(entity, player, item, nounlock): KDBlockingItemToData[] {
    let group = KDRestraint(item).Group;
    if (player && !player.player) {
        if (KDGetNPCRestraints(player.id)) {
            let restraints = KDGetNPCRestraints(player.id);
            let entries = Object.entries(restraints);
            for (let entry of entries) {
                if (entry[1]?.id == item.id || entry[1] == item) {
                    group = entry[0];
                    break;
                }
            }
        } else return [];
    }
    let list: (item | NPCRestraint)[] = KDGetPotentialBlockingRestraints(group, entity != player, item, player);
    let blockers: KDBlockingItemToData[] = [];

    for (let i = 0; i < list.length; i++) {
        let current = list[i];
        if (current) {
            if (nounlock)
                blockers.push({
                    item: current,
                    reason: "",
                }); 
            else {
                let cantUnlock = KDEnemyCantUnlock(entity, current, player);
                if (cantUnlock) {
                     blockers.push({
                        item: current,
                        reason: cantUnlock,
                     }); 
                }
            }
            if (current == item) break;
        }
    }
    
    return blockers;
}
function KDGetBlockingItems(entity, player, group, nounlock): KDBlockingItemToData[] {
    let list: (item | NPCRestraint)[] = KDGetPotentialBlockingRestraints(group, entity != player, null, player);
    let blockers: KDBlockingItemToData[] = [];

    for (let i = 0; i < list.length; i++) {
        let current = list[i];
        if (current) {
            if (nounlock)
                blockers.push({
                    item: current,
                    reason: "",
                }); 
            else {
                let cantUnlock = KDEnemyCantUnlock(entity, current, player);
                if (cantUnlock) {
                     blockers.push({
                        item: current,
                        reason: cantUnlock,
                     }); 
                }
            }
        }
    }
    
    return blockers;
}

/** Enemy can bypass this specific item in general, irrespective of on a player or not.
 * Useful for checking if an enemy will be able to unlock an item that isnt on the player yet.
 * This is for a HYPOTHETICAL or EXISTING item, define player as not null to indicate that it is on a character
 * @returns the reason for failure
 * */
function KDEnemyCantUnlock(entity: entity, item: item | NPCRestraint, player?: entity): string {
    if (item.lock) {
        let canUnlock = KDEnemyCanUnlockLock(entity, item.lock, item, player);
        if (!canUnlock) return "Lock";
        let canUncurse = KDEnemyCanUncurseCurse(entity, item.curse, item, player);
        if (!canUncurse) return "Curse";
    }
    return KDEnemyCantUnlockRestraint(entity, KDRestraint(item), false, false, player);
}
/** Enemy can bypass this specific restraint in general, irrespective of who it's on
 * KDEnemyCanUnlockItem leads into this one as a final filter;
 * @param useDefaultLock set to false if you're checking the lock itself independently
 * @param player optional; pass in case player has, say, something that makes unlocking harder
 * @returns the reason for failure
*/
function KDEnemyCantUnlockRestraint(entity: entity, restraint: restraint, useDefaultLock: boolean = true, useCurse: boolean = true, player?: entity): string {
    let data = {
        removeDiff: ((restraint.helpChance?.Remove) != undefined ? restraint.helpChance?.Remove : restraint.escapeChance?.Remove) || 0,
        struggleDiff: ((restraint.helpChance?.Struggle) != undefined ? restraint.helpChance?.Struggle : restraint.escapeChance?.Struggle) || 0,
        enemyMod: KDEnemyRank(entity) * KDGlobalEnemyRankRemoveModifier,
        //limitModRemove: ((restraint.limitChance?.Remove) != undefined ? restraint.helpChance?.Remove : restraint.escapeChance?.Remove),
        limitModStruggle: ((restraint.limitChance?.Struggle) != undefined ? restraint.helpChance?.Struggle : restraint.escapeChance?.Struggle),
        reason: undefined,
        entity: entity,
        player: player,
    };
    //if (data.limitModRemove == undefined) data.limitModRemove = KDGetBaseLimitChance("Remove");
    if (data.limitModStruggle == undefined) data.limitModStruggle = KDGetBaseLimitChance("Struggle");
    KinkyDungeonSendEvent("calcEnemyCantUnlockRestraint", data);

    if (useCurse) {
        if (!data.reason) {
            let canUncurse = KDEnemyCanUncurseCurse(entity, restraint.curse, undefined, player);
            if (!canUncurse) return "Curse";
        }
    }
    if (useDefaultLock) {
        if (!data.reason) {
            let canUnlock = KDEnemyCanUnlockLock(entity, restraint.DefaultLock, undefined, player);
            if (!canUnlock) return "Lock";
        }
    }
    if (!data.reason) {
        //  - data.limitModRemove <= 0  // irrelevant for calculation due to complexity
        if (data.struggleDiff + data.enemyMod&& data.struggleDiff + data.enemyMod - data.limitModStruggle <= 0) {
            data.reason = "Remove";
        }
    }

    return data.reason;
}
    
let KDGlobalEnemyRankRemoveModifier = 0.1;
interface KDEnemyCantUnlockRestraintData {
    removeDiff: number,
    struggleDiff: number,
    enemyMod: number,
}

/** 
 * @param player optional; pass in case player has, say, something that makes unlocking harder
*/
function KDEnemyCanUnlockLock(entity: entity, lock: string, item?: item | NPCRestraint, player?: entity): boolean {
    let lockType = KDLocks[lock];
    if (!lockType) return true;

    // remember to pass null to the 
    if (lockType.entityCanUnlock(entity, player, {
        query: true,
        entity: entity,
        player: player,
    })) return true;

    return false;
}
/** 
 * @param player optional; pass in case player has, say, something that makes unlocking harder
*/
function KDEnemyCanUncurseCurse(entity: entity, curse: string, item?: item | NPCRestraint, player?: entity): boolean {
    let curseType = KDCurses[curse];
    if (!curseType) return true;

    // remember to pass null to the 
    if (curseType.entityCanUnlock(entity, player, {
        query: true,
        entity: entity,
        player: player,
    })) return true;

    return false;
}

function KDValidateTagForItem(tag: string, item: item | NPCRestraint): boolean {
    if (KDTagValidationForItem[tag]) {
        return KDTagValidationForItem[tag](tag, item);
    }
    return KDRestraint(item)?.shrine?.includes(tag);
}

function KDValidateTagForRestraint(tag: string, restraint: restraint): boolean {
    if (KDTagValidationForItem[tag]) {
        return KDTagValidationForRestraint[tag](tag, restraint);
    }
    return restraint?.shrine?.includes(tag);
}


let KDTagValidationForItem: Record<string, (tag: string, item: item | NPCRestraint) => boolean> = {
    KDDefaultTagValidation: (tag, item) => {return KDTagValidationForRestraint.KDDefaultTagValidation(tag, KDRestraint(item));},
    FeetLinked: (tag, item) => {
        return KDRestraint(item)?.blockfeet || KDTagValidationForItem.KDDefaultTagValidation(tag, item);
    },
    LegBind: (tag, item) => {
        return !KDRestraint(item)?.addTag?.includes("HasSaddleAlternate") && KDTagValidationForItem.KDDefaultTagValidation(tag, item);
    },
}

let KDTagValidationForRestraint: Record<string, (tag: string, restraint: restraint) => boolean> = {
    KDDefaultTagValidation: (tag, restraint) => {return restraint.shrine?.includes(tag) || restraint.addTag?.includes(tag);},
    FeetLinked: (tag, restraint) => {
        return restraint.blockfeet || KDTagValidationForRestraint.KDDefaultTagValidation(tag, restraint);
    },
    LegBind: (tag, restraint) => {
        return !restraint.addTag?.includes("HasSaddleAlternate") && KDTagValidationForRestraint.KDDefaultTagValidation(tag, restraint);
    },
}