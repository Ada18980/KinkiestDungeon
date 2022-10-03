"use strict";

// Regexes for lock combination numbers and passwords
const ValidationCombinationNumberRegex = /^\d{4}$/;
const ValidationPasswordRegex = /^[A-Z]{1,8}$/;
const ValidationDefaultCombinationNumber = "0000";
const ValidationDefaultPassword = "UNLOCK";
const ValidationRemoveTimerToleranceMs = 5000;
const ValidationNonModifiableLockProperties = ["LockedBy", "LockMemberNumber"];
const ValidationRestrictedLockProperties = [
	"EnableRandomInput", "RemoveItem", "ShowTimer", "CombinationNumber", "Password", "Hint", "LockSet", "LockPickSeed",
];
const ValidationTimerLockProperties = ["MemberNumberList", "RemoveTimer"];
const ValidationAllLockProperties = ValidationNonModifiableLockProperties
	.concat(ValidationRestrictedLockProperties)
	.concat(ValidationTimerLockProperties)
	.concat(["MemberNumberListKeys"]);
const ValidationModifiableProperties = ValidationAllLockProperties.concat(["Effect", "Expression"]);

/**
 * Creates the appearance update parameters used to validate an appearance diff, based on the provided target character
 * and the source character's member number.
 * @param {Character} C - The target character (to whom the appearance update is being applied)
 * @param {number} sourceMemberNumber - The member number of the source player (the person that sent the update)
 * @returns {AppearanceUpdateParameters} - Appearance update parameters used based on the relationship between the
 * target and source characters
 */
function ValidationCreateDiffParams(C, sourceMemberNumber) {
	const fromSelf = sourceMemberNumber === C.MemberNumber;
	const fromOwner = C.Ownership != null && (sourceMemberNumber === C.Ownership.MemberNumber || fromSelf);
	const loverNumbers = CharacterGetLoversNumbers(C);
	let fromLover = loverNumbers.includes(sourceMemberNumber) || fromSelf;
	// An update from the player's owner is counted as being from a lover if lover locks aren't blocked by a lover rule
	if (fromOwner && !fromLover) {
		let ownerCanUseLoverLocks = true;
		if (C.ID === 0 && LogQuery("BlockLoverLockOwner", "LoverRule")) {
			ownerCanUseLoverLocks = false;
		}
		fromLover = ownerCanUseLoverLocks;
	}
	return { C, fromSelf, fromOwner, fromLover, sourceMemberNumber };
}

/**
 * Resolves an appearance diff based on the previous item, new item, and the appearance update parameters provided.
 * Returns an {@link ItemDiffResolution} object containing the final appearance item and a valid flag indicating
 * whether or not the new item had to be modified/rolled back.
 * @param {Item|null} previousItem - The previous item that the target character had equipped (or null if none)
 * @param {Item|null} newItem - The new item to equip (may be identical to the previous item, or null if removing)
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {ItemDiffResolution} - The diff resolution - a wrapper object containing the final item and a flag
 * indicating whether or not the change was valid.
 */
function ValidationResolveAppearanceDiff(previousItem, newItem, params) {
	let result;
	if (!previousItem && !newItem) {
		result = { item: previousItem, valid: true };
	} else if (!previousItem) {
		result = ValidationResolveAddDiff(newItem, params);
	} else if (!newItem) {
		result = ValidationResolveRemoveDiff(previousItem, params);
	} else if (previousItem.Asset === newItem.Asset) {
		result = ValidationResolveModifyDiff(previousItem, newItem, params);
	} else {
		result = ValidationResolveSwapDiff(previousItem, newItem, params);
	}
	let { item, valid } = result;
	// If the diff has resolved to an item, sanitize its properties
	if (item) valid = !ValidationSanitizeProperties(params.C, item) && valid;
	return { item, valid };
}

/**
 * Resolves an appearance diff where an item is being added (i.e. there was no previous item in the asset group). Add
 * diffs are handled as the composite of two operations: item addition, followed by property modification. First we
 * check whether the base item can be added, and then we check that any added properties are permitted.
 * @param {Item} newItem - The new item to equip
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {ItemDiffResolution} - The diff resolution - a wrapper object containing the final item and a flag
 * indicating whether or not the change was valid.
 */
function ValidationResolveAddDiff(newItem, params) {
	const canAdd = ValidationCanAddItem(newItem, params);
	if (!canAdd) {
		console.warn(`Invalid addition of ${ValidationItemWarningMessage(newItem, params)}`);
		return { item: null, valid: false };
	}
	const itemWithoutProperties = {
		Asset: newItem.Asset,
		Difficulty: newItem.Difficulty,
		Color: newItem.Color,
	};
	return ValidationResolveModifyDiff(itemWithoutProperties, newItem, params);
}

/**
 * Resolves an appearance diff where an item is being removed (i.e. there was previously an item in the asset group, but
 * it is being removed)
 * @param {Item} previousItem - The previous item to remove
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @param {boolean} [isSwap] - Whether or not the removal is part of an item swap operation. This will allow certain
 * items which cannot normally be removed (e.g. items with `AllowNone: false`) to be removed
 * @returns {ItemDiffResolution} - The diff resolution - a wrapper object containing the final item and a flag
 * indicating whether or not the change was valid.
 */
function ValidationResolveRemoveDiff(previousItem, params, isSwap) {
	const canRemove = ValidationCanRemoveItem(previousItem, params, isSwap);
	if (!canRemove) {
		console.warn(`Invalid removal of ${ValidationItemWarningMessage(previousItem, params)}`);
	}
	return {
		item: canRemove ? null : previousItem,
		valid: canRemove,
	};
}

/**
 * Resolves an appearance diff where an item is being swapped (i.e. there was an item previously in the asset group, but
 * the new item uses a different asset to the previous item). Swap diffs are handled as the composite of three
 * operations: item removal, item addition, and then property modification. First we check whether the previous item
 * can be removed, then whether the new item can be added, and finally we check that any added properties are permitted.
 * @param {Item} previousItem - The previous item to remove
 * @param {Item} newItem - The new item to add
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {ItemDiffResolution} - The diff resolution - a wrapper object containing the final item and a flag
 * indicating whether or not the change was valid.
 */
function ValidationResolveSwapDiff(previousItem, newItem, params) {
	// First, attempt to remove the previous item
	let result = ValidationResolveRemoveDiff(previousItem, params, true);
	// If the removal result was valid, attempt to add the new item
	if (result.valid) result = ValidationResolveAddDiff(newItem, params);
	// If the result is valid, return it
	if (result.valid) return result;
	// Otherwise, return the previous item and an invalid status
	else return { item: previousItem, valid: false };
}

/**
 * Resolves an appearance diff where an item is being modified (i.e. there was an item previously in the asset group,
 * and the new item uses the same asset as the previous item). The function primarily validates modifications to locked
 * items
 * @param {Item} previousItem - The previous item to remove
 * @param {Item} newItem - The new item to add
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {ItemDiffResolution} - The diff resolution - a wrapper object containing the final item and a flag
 * indicating whether or not the change was valid.
 */
function ValidationResolveModifyDiff(previousItem, newItem, params) {
	const { C, fromSelf, sourceMemberNumber } = params;

	// If the update is coming from ourself, it's always permitted
	if (fromSelf) return { item: newItem, valid: true };

	const asset = previousItem.Asset;
	const group = asset.Group;
	const previousProperty = previousItem.Property || {};
	/** @type {ItemProperties} */
	const newProperty = newItem.Property = newItem.Property || {};
	const itemBlocked = ValidationIsItemBlockedOrLimited(C, sourceMemberNumber, group.Name, asset.Name) ||
						ValidationIsItemBlockedOrLimited(C, sourceMemberNumber, group.Name, asset.Name, newProperty.Type);

	// If the type has changed and the new type is blocked/limited for the target character, prevent modifications
	if (newProperty.Type !== previousProperty.Type && itemBlocked) {
		return { item: previousItem, valid: false };
	}

	let valid = ValidationResolveLockModification(previousItem, newItem, params, itemBlocked);

	// If the source wouldn't usually be able to add the item, ensure that some properties are not modified
	if (!ValidationCanAddItem(newItem, params)) {
		const warningSuffix = ValidationItemWarningMessage(previousItem, params);
		// Block changing the color of non-clothing appearance items/cosplay items if the target does not permit that
		if (!CommonColorsEqual(newItem.Color, previousItem.Color)) {
			console.warn(`Invalid modification of color for item ${warningSuffix}`);
			newItem.Color = previousItem.Color;
			valid = false;
		}

		// Block changing the base difficulty of non-clothing appearance items/cosplay items
		if (newItem.Difficulty !== previousItem.Difficulty) {
			console.warn(`Invalid modification of difficulty for item ${warningSuffix}`);
			newItem.Difficulty = previousItem.Difficulty;
			valid = false;
		}

		// Block changing properties, but exclude modifiable and lock-related properties, as they get handled separately
		const previousKeys = Object.keys(previousProperty)
			.filter(key => !ValidationModifiableProperties.includes(key));
		const newKeys = Object.keys(newProperty).filter(key => !ValidationModifiableProperties.includes(key));

		previousKeys.forEach(key => {
			valid = !ValidationCopyProperty(previousProperty, newProperty, key) && valid;
		});
		newKeys.forEach((key) => {
			if (!previousKeys.includes(key)) {
				console.warn(`Invalid modification of property "${key}" for item ${warningSuffix}`);
				valid = false;
				delete newProperty[key];
			}
		});
	}

	if (!Object.keys(newProperty).length) delete newItem.Property;

	return { item: newItem, valid };
}

/**
 * Resolves modifications to an item's lock properties and returns a boolean to indicate whether or not the
 * modifications were valid.
 * @param {Item} previousItem - The previous item to remove
 * @param {Item} newItem - The new item to add
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @param {boolean} itemBlocked - Whether or not the item is blocked or limited for the source player
 * @returns {boolean} - true if the lock modifications (if any) were valid, false otherwise
 */
function ValidationResolveLockModification(previousItem, newItem, params, itemBlocked) {
	const { C, sourceMemberNumber } = params;

	const previousProperty = previousItem.Property || {};
	const newProperty = newItem.Property = newItem.Property || {};

	const previousLock = InventoryGetLock(previousItem);
	const newLock = InventoryGetLock(newItem);
	const notLocked = !previousLock && !newLock;

	if (notLocked || !ValidationLockWasModified(previousProperty, newProperty)) {
		return true;
	}

	const lockSwapped = !!newLock && !!previousLock && newLock.Asset.Name !== previousLock.Asset.Name;
	const lockModified = !!newLock && !!previousLock && !lockSwapped;
	const lockRemoved = lockSwapped || (!newLock && !!previousLock);
	const lockAdded = lockSwapped || (!!newLock && !previousLock);
	const newLockBlocked = !!newLock && ValidationIsItemBlockedOrLimited(
		C, sourceMemberNumber, newLock.Asset.Group.Name, newLock.Asset.Name,
	);

	const lockChangeInvalid = (lockRemoved && !ValidationIsLockChangePermitted(previousLock, params, true)) ||
		(lockAdded && !ValidationIsLockChangePermitted(newLock, params)) ||
		((lockAdded || lockModified || lockSwapped) && (newLockBlocked || itemBlocked));

	if (lockChangeInvalid) {
		if (previousLock) {
			// If there was a lock previously, reapply the old lock
			if (lockRemoved) {
				console.warn(`Invalid removal of lock ${ValidationItemWarningMessage(previousLock, params)}`);
			} else if (lockSwapped) {
				console.warn(`Invalid addition of lock ${ValidationItemWarningMessage(newLock, params)}`);
			} else {
				console.warn(`Invalid modification of lock ${ValidationItemWarningMessage(newLock, params)}`);
			}
			InventoryLock(C, newItem, previousLock, previousProperty.LockMemberNumber, false);
			ValidationCloneLock(previousProperty, newProperty);
			return false;
		} else {
			// Otherwise, delete any lock
			console.warn(`Invalid addition of lock ${ValidationItemWarningMessage(newLock, params)}`);
			return !ValidationDeleteLock(newItem.Property);
		}
	} else if (lockModified) {
		// If the lock has been modified, then ensure lock properties don't change (except where they should be able to)
		const hasLockPermissions = ValidationIsLockChangePermitted(previousLock, params) && !newLockBlocked;
		return !ValidationRollbackInvalidLockProperties(previousProperty, newProperty, hasLockPermissions);
	}

	// If there are no other issues, the change is valid
	return true;
}

/**
 * Determines whether or not a lock was modified on an item from its previous and new property values
 * @param previousProperty - The previous item property
 * @param newProperty - The new item property
 * @returns {boolean} - true if the item's lock was modified (added/removed/swapped/modified), false otherwise
 */
function ValidationLockWasModified(previousProperty, newProperty) {
	return previousProperty.LockedBy !== newProperty.LockedBy ||
		ValidationAllLockProperties.some((key) => !CommonDeepEqual(previousProperty[key], newProperty[key]));
}

/**
 * Returns a commonly used warning message indicating that an invalid change to an item was made, along with the target
 * and source characters' member numbers.
 * @param {Item} item - The item being modified
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {string} - The warning message
 */
function ValidationItemWarningMessage(item, { C, sourceMemberNumber }) {
	return `${item.Asset.Name} on member number ${C.IsNpc() ? C.Name : C.MemberNumber} by member number ${sourceMemberNumber || Player.MemberNumber} blocked`;
}

/**
 * Determines whether or not a lock can be modified based on the lock object and the provided appearance update
 * parameters.
 * @param {Item} lock - The lock object that is being checked, as returned by {@link InventoryGetLock}
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @param {boolean} [remove] - Whether the lock change is a removal
 * @returns {boolean} - TRUE if the lock can be modified, FALSE otherwise
 */
function ValidationIsLockChangePermitted(lock, { C, fromOwner, fromLover }, remove = false) {
	if (!lock) return true;
	if (lock.Asset.OwnerOnly && !fromOwner) return false;
	if (lock.Asset.LoverOnly) {
		// Owners can always remove lover locks, regardless of lover rules
		if (remove && fromOwner) return true;
		else return fromLover;
	}
	return true;
}

/**
 * Copies an item's lock-related properties from one Property object to another based on whether or not the source
 * character has permissions to modify the lock. Rolls back any invalid changes to their previous values.
 * @param {object} sourceProperty - The original Property object on the item
 * @param {object} targetProperty - The Property object on the modified item
 * @param {boolean} hasLockPermissions - Whether or not the source character of the appearance change has permission to
 * modify the lock (as determined by {@link ValidationIsLockChangePermitted})
 * @returns {boolean} - TRUE if the target Property object was modified as a result of copying (indicating that there
 * were invalid changes to the lock), FALSE otherwise
 */
function ValidationRollbackInvalidLockProperties(sourceProperty, targetProperty, hasLockPermissions) {
	let changed = false;
	for (const key of ValidationNonModifiableLockProperties) {
		changed = ValidationCopyProperty(sourceProperty, targetProperty, key) || changed;
	}
	if (!hasLockPermissions) {
		for (const key of ValidationRestrictedLockProperties) {
			changed = ValidationCopyProperty(sourceProperty, targetProperty, key) || changed;
		}
		if (!targetProperty.EnableRandomInput) {
			for (const key of ValidationTimerLockProperties) {
				changed = ValidationCopyProperty(sourceProperty, targetProperty, key) || changed;
			}
		}
	}
	return changed;
}

/**
 * Clones all lock properties from one Property object to another.
 * @param {object} sourceProperty - The property object to clone properties from
 * @param {object} targetProperty - The property object to clone properties to
 * @returns {void} - Nothing
 */
function ValidationCloneLock(sourceProperty, targetProperty) {
	for (const key of ValidationAllLockProperties) {
		targetProperty[key] = sourceProperty[key];
	}
}

/**
 * Copies the value of a single property key from a source Property object to a target Property object.
 * @param {object} sourceProperty - The original Property object on the item
 * @param {object} targetProperty - The Property object on the modified item
 * @param {string} key - The property key whose value to copy
 * @returns {boolean} - TRUE if the target Property object was modified as a result of copying (indicating that there
 * were invalid changes to the property), FALSE otherwise
 */
function ValidationCopyProperty(sourceProperty, targetProperty, key) {
	if (sourceProperty[key] != null && !CommonDeepEqual(targetProperty[key], sourceProperty[key])) {
		targetProperty[key] = sourceProperty[key];
		return true;
	}
	return false;
}

/**
 * Determines whether an item can be added to the target character, based on the provided appearance update parameters.
 * Note that the item's properties are not taken into account at this stage - this merely checks whether the basic item
 * can be added.
 * @param {Item} newItem - The new item to add
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {boolean} - TRUE if the new item can be equipped based on the appearance update parameters, FALSE otherwise
 */
function ValidationCanAddItem(newItem, params) {
	const {C, fromSelf, sourceMemberNumber} = params;

	// If the update is coming from ourself, it's always permitted
	if (fromSelf) return true;

	const asset = newItem.Asset;

	// If the item is blocked/limited and the source doesn't have the correct permission, prevent it from being added
	const type = (newItem.Property && newItem.Property.Type) || null;
	const itemBlocked = ValidationIsItemBlockedOrLimited(C, sourceMemberNumber, asset.Group.Name, asset.Name, type) ||
						ValidationIsItemBlockedOrLimited(C, sourceMemberNumber, asset.Group.Name, asset.Name);
	if (itemBlocked && OnlineGameAllowBlockItems()) return false;

	// Fall back to common item add/remove validation
	return ValidationCanAddOrRemoveItem(newItem, params);
}

/**
 * Determines whether the character described by the `sourceMemberNumber` parameter is permitted to add a given asset to
 * the target character `C`, based on the asset's group name, asset name and type (if applicable). This only checks
 * against the target character's limited and blocked item lists, not their global item permissions.
 * @param {Character} C - The target character
 * @param sourceMemberNumber - The member number of the source character
 * @param {string} groupName - The name of the asset group for the intended item
 * @param {string} assetName - The asset name of the intended item
 * @param {string|null} [type] - The type of the intended item
 * @returns {boolean} - TRUE if the character with the provided source member number is _not_ allowed to equip the
 * described asset on the target character, FALSE otherwise.
 */
function ValidationIsItemBlockedOrLimited(C, sourceMemberNumber, groupName, assetName, type) {
	if (C.MemberNumber === sourceMemberNumber) return false;
	if (InventoryIsPermissionBlocked(C, assetName, groupName, type)) return true;
	if (!InventoryIsPermissionLimited(C, assetName, groupName, type)) return false;
	if (C.IsLoverOfMemberNumber(sourceMemberNumber) || C.IsOwnedByMemberNumber(sourceMemberNumber)) return false;
	// If item permission is "Owner, Lover, whitelist & Dominants" or below, the source must be on their whitelist
	if (C.ItemPermission < 3 && C.WhiteList.includes(sourceMemberNumber)) return false;
	// Otherwise, the item is limited, and the source doesn't have permission
	return true;
}

/**
 * Determines whether an item can be removed from the target character, based on the provided appearance update
 * parameters.
 * @param {Item} previousItem - The item to remove
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @param {boolean} isSwap - Whether or not the removal is part of a swap, which allows temporary removal of items with
 * `AllowNone: false`.
 * @returns {boolean} - TRUE if the item can be removed based on the appearance update parameters, FALSE otherwise
 */
function ValidationCanRemoveItem(previousItem, params, isSwap) {
	// If we're not swapping, and the asset group can't be empty, always block removal
	if (!previousItem.Asset.Group.AllowNone && !isSwap) return false;

	const {fromSelf, fromOwner, fromLover} = params;

	// If the update is coming from ourself, it's always permitted
	if (fromSelf) return true;

	const lock = InventoryGetLock(previousItem);

	// If the previous item has AllowRemoveExclusive, allow owner/lover-only items to be removed if they're not locked
	if (previousItem.Asset.AllowRemoveExclusive) {
		if (InventoryOwnerOnlyItem(previousItem) && (!lock || !lock.Asset.OwnerOnly)) return true;
		else if (InventoryLoverOnlyItem(previousItem) && (!lock || !lock.Asset.LoverOnly)) return true;
	}

	// Owners can always remove lover locks, regardless of lover rules
	if (lock && lock.Asset.LoverOnly && fromOwner) return true;

	// Only owners/lovers can remove lover locks
	if (lock && lock.Asset.LoverOnly && !fromLover && !fromOwner) return false;

	// Only owners can remove owner locks
	if (lock && lock.Asset.OwnerOnly && !fromOwner) return false;

	// Fall back to common item add/remove validation
	return ValidationCanAddOrRemoveItem(previousItem, params);
}

/**
 * Determines whether an item can be added or removed from the target character, based on the provided appearance update
 * parameters.
 * @param {Item} item - The item to add or remove
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @return {boolean} - TRUE if the item can be added or removed based on the appearance update parameters, FALSE
 * otherwise
 */
function ValidationCanAddOrRemoveItem(item, { C, fromOwner, fromLover }) {
	const asset = item.Asset;

	// If the target does not permit full appearance modification, block changing non-clothing appearance items
	const blockFullWardrobeAccess = !(C.OnlineSharedSettings && C.OnlineSharedSettings.AllowFullWardrobeAccess);
	if (blockFullWardrobeAccess && asset.Group.Category === "Appearance" && !asset.Group.Clothing) return false;

	// If changing cosplay items is blocked and we're adding/removing a cosplay item, block it
	const blockBodyCosplay = C.OnlineSharedSettings && C.OnlineSharedSettings.BlockBodyCosplay;
	if (blockBodyCosplay && InventoryGetItemProperty(item, "BodyCosplay", true)) return false;

	// If the item is owner only, only the owner can add/remove it
	if (asset.OwnerOnly) return fromOwner;

	// If the item is lover only, only a lover/owner can add/remove it
	if (asset.LoverOnly) return fromLover;

	// If the asset does not have the Enable flag, it can't be added/removed
	if (!asset.Enable) return false;

	// Otherwise, the item can be added/removed
	return true;
}

/**
 * Sanitizes the properties on an appearance item to ensure that no invalid properties are present. This removes invalid
 * locks, strips invalid values, and ensures property values are within the constraints defined by an item.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The appearance item to sanitize
 * @returns {boolean} - TRUE if the item was modified as part of the sanitization process (indicating that invalid
 * properties were present), FALSE otherwise
 */
function ValidationSanitizeProperties(C, item) {
	// If the character is an NPC, no validation is needed
	if (C.IsNpc()) return false;

	const property = item.Property;

	// If the item doesn't have a property, no validation is needed
	if (property == null) return false;

	// If the property is not an object, remove it and return
	if (typeof property !== "object") {
		console.warn("Removing invalid property:", property);
		delete item.Property;
		return true;
	}

	// Sanitize various properties
	let changed = ValidationSanitizeEffects(C, item);
	changed = ValidationSanitizeBlocks(C, item) || changed;
	changed = ValidationSanitizeSetPose(C, item) || changed;
	changed = ValidationSanitizeStringArray(property, "Hide") || changed;

	const asset = item.Asset;

	// If the property has a type, it needs to be in the asset's AllowType array
	const allowType = asset.AllowType || [];
	if (property.Type != null && !allowType.includes(property.Type)) {
		console.warn(`Removing invalid type "${property.Type}" from ${asset.Name}`);
		delete property.Type;
		changed = true;
	}

	// If the property has an expression, it needs to be in the asset or group's AllowExpression array
	const allowExpression = asset.AllowExpression || asset.Group.AllowExpression || [];
	if (property.Expression != null && !allowExpression.includes(property.Expression)) {
		console.warn(`Removing invalid expression "${property.Expression}" from ${asset.Name}`);
		delete property.Expression;
		changed = true;
	}

	// Clamp item opacity within the allowed range
	if (typeof property.Opacity === "number") {
		if (property.Opacity > asset.MaxOpacity) {
			property.Opacity = asset.MaxOpacity;
			changed = true;
		}
		if (property.Opacity < asset.MinOpacity) {
			property.Opacity = asset.MinOpacity;
			changed = true;
		}
	}

	if (property.Tint && !asset.AllowTint) {
		delete property.Tint;
		changed = true;
	}

	// Remove invalid properties from non-typed items
	if (!asset.AllowType || !asset.AllowType.length) {
		["SetPose", "Difficulty", "SelfUnlock", "Hide"].forEach(P => {
			if (property[P] != null) {
				console.warn(`Removing invalid property "${P}" from ${asset.Name}`);
				delete property[P];
				changed = true;
			}
		});
	}

	// Block advanced vibrator modes if disabled
	if (typeof property.Mode === "string" && C.ArousalSettings && C.ArousalSettings.DisableAdvancedVibes && !VibratorModeOptions[VibratorModeSet.STANDARD].includes(VibratorModeGetOption(property.Mode))) {
		console.warn(`Removing invalid mode "${property.Mode}" from ${asset.Name}`);
		property.Mode = VibratorModeOptions[VibratorModeSet.STANDARD][0].Name;
		changed = true;
	}

	return changed;
}

/**
 * Sanitizes the `Effect` array on an item's Property object, if present. This ensures that it is a valid array of
 * strings, and that each item in the array is present in the asset's `AllowEffect` array.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose `Effect` property should be sanitized
 * @returns {boolean} - TRUE if the item's `Effect` property was modified as part of the sanitization process
 * (indicating it was not a valid string array, or that invalid effects were present), FALSE otherwise
 */
function ValidationSanitizeEffects(C, item) {
	const property = item.Property;
	let changed = ValidationSanitizeStringArray(property, "Effect");
	changed = ValidationSanitizeLock(C, item) || changed;

	// If there is no Effect array, no further sanitization is needed
	if (!Array.isArray(property.Effect)) return changed;

	const assetEffect = item.Asset.Effect || [];
	const allowEffect = item.Asset.AllowEffect || [];
	property.Effect = property.Effect.filter((effect) => {
		// The Lock effect is handled by ValidationSanitizeLock
		if (effect === "Lock") return true;
		// All other effects must be included in the AllowEffect array to be permitted
		else if (!assetEffect.includes(effect) && !allowEffect.includes(effect)) {
			console.warn(`Filtering out invalid Effect entry on ${item.Asset.Name}:`, effect);
			changed = true;
			return false;
		} else return true;
	});

	return changed;
}

/**
 * Sanitizes an item's lock properties, if present. This ensures that any lock on the item is valid, and removes or
 * corrects invalid properties.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose lock properties should be sanitized
 * @returns {boolean} - TRUE if the item's properties were modified as part of the sanitization process (indicating the
 * lock was not valid), FALSE otherwise
 */
function ValidationSanitizeLock(C, item) {
	const property = item.Property;
	// If there is no lock effect present, strip out any lock-related properties
	if (!Array.isArray(property.Effect) || !property.Effect.includes("Lock")) return ValidationDeleteLock(property);

	const lock = InventoryGetLock(item);

	// If there is no lock, or the item in its current state does not permit locks
	if (!lock || !InventoryDoesItemAllowLock(item)) {
		return ValidationDeleteLock(property);
	}

	let changed = false;

	// Remove any invalid lock member number
	const lockNumber = property.LockMemberNumber;
	if (lockNumber != null && typeof lockNumber !== "number") {
		console.warn("Removing invalid lock member number:", lockNumber);
		delete property.LockMemberNumber;
		changed = true;
	}

	const lockedBySelf = lockNumber === C.MemberNumber;
	const ownerNumber = C.Ownership && C.Ownership.MemberNumber;
	const lockedByOwner = (typeof ownerNumber === 'number' && lockNumber === ownerNumber);

	// Ensure the lock & its member number is valid on owner-only locks
	if (lock.Asset.OwnerOnly) {
		const selfCanUseOwnerLocks = !C.IsPlayer() || !LogQuery("BlockOwnerLockSelf", "OwnerRule");
		const lockNumberValid = (lockedBySelf && selfCanUseOwnerLocks) || lockedByOwner;
		if (!(C.IsOwned() || typeof ownerNumber === 'number') || !lockNumberValid) {
			console.warn(`Removing invalid owner-only lock with member number: ${lockNumber}`);
			return ValidationDeleteLock(property);
		}
	}

	// Ensure the lock & its member number is valid on lover-only locks
	if (lock.Asset.LoverOnly) {
		const hasLovers = !!C.GetLoversNumbers().length;
		const ownerCanUseLoverLocks = !C.IsPlayer() || !LogQuery("BlockLoverLockOwner", "LoverRule");
		const selfCanUseLoverLocks = !C.IsPlayer() || !LogQuery("BlockLoverLockSelf", "LoverRule");
		const lockNumberValid = (lockedBySelf && selfCanUseLoverLocks) ||
			C.GetLoversNumbers().includes(lockNumber) ||
			(lockedByOwner && ownerCanUseLoverLocks);

		if (!hasLovers || !lockNumberValid) {
			console.warn(`Removing invalid lover-only lock with member number: ${lockNumber}`);
			return ValidationDeleteLock(property);
		}
	}

	// Sanitize combination lock number
	if (typeof property.CombinationNumber === "string") {
		if (!ValidationCombinationNumberRegex.test(property.CombinationNumber)) {
			// If the combination is invalid, reset to 0000
			console.warn(
				`Invalid combination number: ${property.CombinationNumber}. Combination will be reset to ${ValidationDefaultCombinationNumber}`
			);
			property.CombinationNumber = ValidationDefaultCombinationNumber;
			changed = true;
		}
	} else if (property.CombinationNumber != null) {
		delete property.CombinationNumber;
		changed = true;
	}

	// Sanitize lockpicking seed
	if (typeof property.LockPickSeed === "string") {
		const seed = CommonConvertStringToArray(property.LockPickSeed);
		if (!seed.length) {
			console.warn("Deleting invalid lockpicking seed: ", property.LockPickSeed);
			delete property.LockPickSeed;
			changed = true;
		} else {
			// Check that every number from 0 up to the seed length is included in the seed
			for (let i = 0; i < seed.length; i++) {
				if (!seed.includes(i)) {
					console.warn("Deleting invalid lockpicking seed: ", property.LockPickSeed);
					delete property.LockPickSeed;
					changed = true;
					break;
				}
			}
		}
	} else if (property.LockPickSeed != null) {
		delete property.LockPickSeed;
		changed = true;
	}

	// Sanitize lock password
	if (typeof property.Password === "string") {
		if (!ValidationPasswordRegex.test(property.Password)) {
			// If the password is invalid, reset to "UNLOCK"
			console.warn(
				`Invalid password: ${property.Password}. Combination will be reset to ${ValidationDefaultPassword}`
			);
			property.Password = ValidationDefaultPassword;
			changed = true;
		}
	} else if (property.Password != null) {
		delete property.Password;
		changed = true;
	}

	// Sanitize timer lock remove timers
	if (lock.Asset.RemoveTimer > 0 && typeof property.RemoveTimer === "number") {
		// Ensure the lock's remove timer doesn't exceed the maximum for that lock type
		if (property.RemoveTimer - ValidationRemoveTimerToleranceMs > CurrentTime + lock.Asset.MaxTimer * 1000) {
			property.RemoveTimer = Math.round(CurrentTime + lock.Asset.MaxTimer * 1000);
			changed = true;
		}
	} else if (property.RemoveTimer != null) {
		delete property.RemoveTimer;
		changed = true;
	}

	return changed;
}

/**
 * Sanitizes the `Block` array on an item's Property object, if present. This ensures that it is a valid array of
 * strings, and that each item in the array is present in the either the asset's `Block` or `AllowBlock` array.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose `Block` property should be sanitized
 * @returns {boolean} - TRUE if the item's `Block` property was modified as part of the sanitization process
 * (indicating it was not a valid string array, or that invalid entries were present), FALSE otherwise
 */
function ValidationSanitizeBlocks(C, item) {
	const property = item.Property;
	let changed = ValidationSanitizeStringArray(property, "Block");

	// If there is no Block array, no further sanitization is needed
	if (!Array.isArray(property.Block)) return changed;

	const assetBlock = item.Asset.Block || [];
	const allowBlock = item.Asset.AllowBlock || [];
	// Any Block entry must be included in the AllowBlock list to be permitted
	property.Block = property.Block.filter((block) => {
		if (!assetBlock.includes(block) && !allowBlock.includes(block)) {
			console.warn(`Filtering out invalid Block entry on ${item.Asset.Name}:`, block);
			changed = true;
			return false;
		} else return true;
	});
	return changed;
}

/**
 * Sanitizes the `SetPose` array on an item's Property object, if present. This ensures that it is a valid array of
 * strings, and that each item in the array is present in the list of poses available in the game.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose `SetPose` property should be sanitized
 * @returns {boolean} - TRUE if the item's `SetPose` property was modified as part of the sanitization process
 * (indicating it was not a valid string array, or that invalid entries were present), FALSE otherwise
 */
function ValidationSanitizeSetPose(C, item) {
	const property = item.Property;
	let changed = ValidationSanitizeStringArray(property, "SetPose");

	// If there is no SetPose array, no further sanitization is needed
	if (!Array.isArray(property.SetPose)) return changed;

	// The SetPose array must contain a list of valid pose names
	property.SetPose = property.SetPose.filter((pose) => {
		if (!PoseFemale3DCGNames.includes(pose)) {
			console.warn(`Filtering out invalid SetPose entry on ${item.Asset.Name}:`, pose);
			changed = true;
			return false;
		} else return true;
	});
	return changed;
}

/**
 * Sanitizes a property on an object to ensure that it is a valid string array or null/undefined. If the property is not
 * a valid array and is not null, it will be deleted from the object. If it is a valid array, any non-string entries
 * will be removed.
 * @param {object} property - The object whose property should be sanitized
 * @param {string} key - The key indicating which property on the object should be sanitized
 * @returns {boolean} - TRUE if the object's property was modified as part of the sanitization process (indicating  that
 * the property was not a valid array, or that it contained a non-string entry), FALSE otherwise
 */
function ValidationSanitizeStringArray(property, key) {
	const value = property[key];
	let changed = false;
	if (Array.isArray(value)) {
		value.filter(str => {
			if (typeof str !== "string") {
				console.warn(`Filtering out invalid ${key} entry:`, str);
				changed = true;
				return false;
			} else {
				return true;
			}
		});
	} else if (value != null) {
		console.warn(`Removing invalid ${key} array:`, value);
		delete property[key];
		changed = true;
	}
	return changed;
}

/**
 * Completely removes a lock from an item's Property object. This removes all lock-related properties, and the "Lock"
 * effect from the property object.
 * @param {object} property - The Property object to remove the lock from
 * @param {boolean} verbose - Whether or not to print console warnings when properties are deleted. Defaults to true.
 * @returns {boolean} - TRUE if the Property object was modified as a result of the lock deletion (indicating that at
 * least one lock-related property was present), FALSE otherwise
 */
function ValidationDeleteLock(property, verbose = true) {
	let changed = false;
	if (property) {
		ValidationAllLockProperties.forEach(key => {
			if (property[key] != null) {
				// Special casing for RemoveTimer because it is used for both locks and expressions :(
				if (key === "RemoveTimer" && property.Expression != null) return;
				// Otherwise remove the property
				if (verbose) console.warn("Removing invalid lock property:", key);
				delete property[key];
				changed = true;
			}
		});
		if (Array.isArray(property.Effect)) {
			property.Effect = property.Effect.filter(E => {
				if (E === "Lock") {
					if (verbose) console.warn("Filtering out invalid Lock effect");
					changed = true;
					return false;
				} else return true;
			});
		}
	}
	return changed;
}

/**
 * Fixes any cyclic blocks in the provided appearance array. The given diff map is used to determine the order in which
 * items should be rolled back or removed if block cycles are found (a block cycle being a series of items that block
 * each other in a cyclic fashion).
 * @param {Item[]} appearance - The appearance to sanitize
 * @param {AppearanceDiffMap} diffMap - The appearance diff map which indicates the items that were changed as part of
 * the appearance update that triggered this validation
 * @returns {AppearanceValidationWrapper} - A wrapper containing the final appearance, with any block cycles removed,
 * plus a valid flag indicating whether or not the appearance had to be modified.
 */
function ValidationResolveCyclicBlocks(appearance, diffMap) {
	let cycles = ValidationFindBlockCycles(appearance);
	let valid = true;

	// Keep rolling items back until there are no block cycles left
	while (cycles.length > 0) {
		const groups = appearance.map((item) => item.Asset.Group.Name);

		/* @type Map<string, number> */
		const groupCounts = new Map();
		// Count how many cycles each group appears in
		for (const group of groups) {
			for (const cycle of cycles) {
				if (cycle.includes(group)) {
					groupCounts.set(group, (groupCounts.get(group) || 0) + 1);
				}
			}
		}

		// Sort the groups - groups that appear in more cycles should be removed first
		const groupsByFrequency = Array.from(groupCounts.entries())
			.sort(([, c1], [, c2]) => c2 - c1)
			.map(entry => entry[0]);

		const nonModifiedGroups = [];
		/*
		 * Find the groups that were modified in the provided diff map with changes that may impact blocking. These
		 * groups are the highest priorities for rollback/removal
		 */
		const modifiedGroups = groupsByFrequency.filter((group) => {
			if (diffMap[group]) {
				const [prev, next] = diffMap[group];
				if (!!prev !== !!next) return true;
				if (!CommonDeepEqual(prev.Asset.Block, next.Asset.Block)) return true;
				const prevPropBlock = prev.Property && prev.Property.Block;
				const nextPropBlock = next.Property && next.Property.Block;
				if (!CommonDeepEqual(prevPropBlock, nextPropBlock)) return true;
				const prevEnclose = InventoryItemHasEffect(prev, "Enclose");
				const nextEnclose = InventoryItemHasEffect(next, "Enclose");
				if (prevEnclose !== nextEnclose) return true;
			}
			nonModifiedGroups.push(group);
			return false;
		});
		const groupsByPriority = modifiedGroups.concat(nonModifiedGroups);

		let i = 0;
		// Remove groups in priority order until there are no cycles left
		while (cycles.length > 0 && i < groupsByPriority.length) {
			const groupToRollback = groupsByPriority[i];
			console.warn(`Rolling back group ${groupToRollback} due to block cycles`);
			valid = false;
			// Modify the appearance by rolling back or removing the item in the current group
			appearance = appearance
				.map((item) => {
					const groupName = item.Asset.Group.Name;
					if (groupName === groupToRollback) {
						if (modifiedGroups.includes(groupName) && item !== diffMap[groupName][0]) {
							/*
							 * If the group was modified as part of the diff map, and we're not already looking at the
							 * rolled back item, roll back
							 */
							return diffMap[groupName][0];
						} else {
							// Otherwise remove
							return null;
						}
					}
					// If it's not the group we care about, don't modify
					return item;
				})
				.filter(Boolean);

			// Remove any cycles that contain the group we just removed/rolled back
			cycles = cycles.filter(cycle => !cycle.includes(groupToRollback));
			i++;
		}

		// Finally, do one more cycle check to verify that the rollbacks didn't reveal more cycles
		cycles = ValidationFindBlockCycles(appearance);
	}
	return { appearance, valid };
}

/**
 * Finds any block cycles in the given appearance array. Block cycles are groups of items that block each other in a
 * cyclic fashion. Block cycles are represented as an array of group names that comprise the cycle. For example:
 * ["ItemArms", "ItemDevices", "ItemArms"]
 * This indicates that the item in the ItemArms group blocks the item in the ItemDevices group, and vice versa. This
 * function returns an array of such block cycles, or an empty array if none were found.
 * Be advised that cyclic block checking is relatively expensive, so should only be run when needed - don't run it every
 * frame!
 * @param {Item[]} appearance - The appearance array to check
 * @returns {string[][]} - A list of block cycles, each cycle being represented as an array of group names.
 */
function ValidationFindBlockCycles(appearance) {
	const groups = appearance.map((item) => item.Asset.Group.Name);
	/** @type {[string, string][]} */
	const edges = [];
	/** @type {Map<string, string>} */
	const edgeMap = new Map();
	/** @type {(from: string, to: string) => void} */
	const recordEdge = (from, to) => {
		if (!edgeMap.get(from)) {
			edgeMap.set(from, to);
			edges.push([from, to]);
		}
	};

	for (const item of appearance) {
		const blockedGroups = ValidationGetBlockedGroups(item, groups);
		for (const group of blockedGroups) {
			recordEdge(item.Asset.Group.Name, group);
		}
		const blockingGroups = ValidationGetPrerequisiteBlockingGroups(item, appearance);
		for (const group of blockingGroups) {
			recordEdge(group, item.Asset.Group.Name);
		}
	}

	const graph = new DirectedGraph(groups, edges);
	return graph.findCycles();
}

/**
 * Finds the groups, from a provided list of groups, that are blocked by a given item.
 * @param {Item} item - The item to check
 * @param {string[]} groupNames - A list of group names that should be used to filter the final block list
 * @returns {string[]} - A subset of the provided group names representing the groups that are blocked by the given
 * item.
 */
function ValidationGetBlockedGroups(item, groupNames) {
	if (InventoryItemHasEffect(item, "Enclose", true)) {
		return groupNames.filter(groupName => groupName !== item.Asset.Group.Name);
	}

	let blockedGroups = [];
	if (Array.isArray(item.Asset.Block)) {
		blockedGroups = blockedGroups.concat(item.Asset.Block);
	}
	if (item.Property && Array.isArray(item.Property.Block)) {
		blockedGroups = blockedGroups.concat(item.Property.Block);
	}
	return blockedGroups.filter(groupName => groupNames.includes(groupName));
}

/**
 * Finds the groups from the provided appearance array that block a given item due to prerequisites. In this situation,
 * an item is considered to be blocking if the target item can't be added with it, but can without it.
 * @param {Item} item - The item to check
 * @param {Item[]} appearance - The appearance array to check
 * @returns {string[]} - A list of group names corresponding to items from the appearance array that block the given
 * item due to prerequisites
 */
function ValidationGetPrerequisiteBlockingGroups(item, appearance) {
	if (!item.Asset.Prerequisite) return [];

	appearance = appearance.filter((appearanceItem) => appearanceItem.Asset !== item.Asset);
	const char = CharacterLoadSimple(`PrerequisiteCheck${item.Asset.Group.Name}`);
	/** @type {string[]} */
	const blockingGroups = [];

	for (const checkItem of appearance) {
		char.Appearance = appearance;
		CharacterLoadEffect(char);
		CharacterLoadPose(char);
		const allowedWithCheckItem = InventoryAllow(char, item.Asset, undefined, false);
		if (!allowedWithCheckItem) {
			char.Appearance = appearance.filter((appearanceItem) => appearanceItem.Asset !== checkItem.Asset);
			CharacterLoadEffect(char);
			CharacterLoadPose(char);
			const allowedWithoutCheckItem = InventoryAllow(char, item.Asset, undefined, false);
			if (allowedWithoutCheckItem) {
				blockingGroups.push(checkItem.Asset.Group.Name);
			}
		}
	}

	return blockingGroups;
}
