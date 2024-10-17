"use strict";

let KDMarketRateDecay = 0.98;

let KDInventoryAction: Record<string, KDInventoryActionDef> = {
	"Equip": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[0]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[0];},
		text: (_player, item) => {
			return TextGet("KDInventoryAction" + (KinkyDungeonPlayerWeapon != item.name ? "Equip" : "Unequip"));
		},
		icon: (_player, item) => {
			if (item.type == LooseRestraint) {
				let newItem = null;
				let currentItem = null;
				let linkable = null;

				newItem = KDRestraint(item);
				if (newItem) {
					currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
					if (KDDebugLink) {
						linkable = KDCanAddRestraint(KDRestraint(newItem), true, "", false, currentItem, true, true);
					} else {
						if (!currentItem) return "InventoryAction/Equip";
						linkable = KDCanAddRestraint(KDRestraint(newItem), false, "", false, currentItem, true, true);

						//linkable = KDCurrentItemLinkable(currentItem, newItem);
					}
					if (linkable) {
						return "InventoryAction/Equip";
					} else return "InventoryAction/Unequip";
				}
			}
			return KinkyDungeonPlayerWeapon != item.name ? "InventoryAction/Equip" : "InventoryAction/Unequip";
		},
		valid: (_player, item) => {
			if ((item?.type == Restraint)) return false;
			if (item.type == LooseRestraint) {
				let newItem = null;
				let currentItem = null;
				let linkable = null;

				newItem = KDRestraint(item);
				if (newItem) {

					if (newItem.requireSingleTagToEquip && !newItem.requireSingleTagToEquip.some((tag: any) => {return KinkyDungeonPlayerTags.get(tag);})) return false;
					if (newItem.requireAllTagsToEquip && newItem.requireAllTagsToEquip.some((tag: any) => {return !KinkyDungeonPlayerTags.get(tag);})) return false;

					currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
					if (KDDebugLink) {
						linkable = KDCanAddRestraint(KDRestraint(newItem), true, "", false, currentItem, true, true);
					} else {
						if (!currentItem) return true;
						//linkable = KDCurrentItemLinkable(currentItem, newItem);
						linkable = KDCanAddRestraint(KDRestraint(newItem), false, "", false, currentItem, true, true);

					}
					if (linkable) {
						return true;
					} else return false;
				}
				return true;
			}
			return item.type == Outfit || item.type == Weapon;
		},
		click: (_player, item) => {
			if (item.type == LooseRestraint) {
				let equipped = false;
				let newItem = null;
				let currentItem = null;
				let linkable = null;

				newItem = KDRestraint(item);
				if (newItem) {
					currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
					if (!currentItem) equipped = false;
					else {
						if (KDDebugLink) {
							linkable = KDCanAddRestraint(KDRestraint(newItem), true, "", false, currentItem, true, true);
						} else {
							//linkable = KDCurrentItemLinkable(currentItem, newItem);
							linkable = KDCanAddRestraint(KDRestraint(newItem), false, "", false, currentItem, true, true);

						}
						if (!currentItem || linkable) {
							equipped = false;
						} else equipped = true;
					}
				}
				if (!equipped && newItem) {
					if (KDGameData.InventoryAction && !KDConfirmOverInventoryAction) {
						KDConfirmOverInventoryAction = true;
						return true;
					} else if (KDSendInput("equip", {name: item.name,
						faction: item.faction,
						inventoryVariant: item.name != newItem.name ?
							item.name : undefined,
						group: newItem.Group, curse: item.curse, currentItem: currentItem ? currentItem.name : undefined, events: Object.assign([], item.events)})) return true;

				}
			} else if (item.type == Weapon) {
				let weapon = item.name;
				let equipped = item.name == KinkyDungeonPlayerWeapon;
				if (equipped) {
					KDSendInput("unequipweapon", {weapon: weapon});
				} else {
					KDSendInput("switchWeapon", {weapon: weapon});
				}
			} else if (item.type == Outfit) {
				let outfit = item.name;
				let toWear = KinkyDungeonGetOutfit(outfit);
				if (toWear) {
					let dress = toWear.dress;
					if (dress == "JailUniform" && KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)])
						dress = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)].defeat_outfit;
					KDSendInput("dress", {dress: dress, outfit: outfit});
				}
			}
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"Drop": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[2]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[2];},
		icon: (_player, _item) => {
			return "InventoryAction/Drop";
		},
		valid: (_player, item) => {
			if ((item?.type == Restraint)) return false;
			if ((item?.type == Weapon && isUnarmed(KDWeapon(item)))) return false;
			return true;
		},
		click: (_player, item) => {
			KDSendInput("drop", {item: item.name});
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"Hotbar": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[3]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[3];},
		icon: (_player, _item) => {
			return "InventoryAction/Hotbar";
		},
		valid: (_player, _item) => {
			return true;
		},
		click: (_player, _item) => {
			KDConfigHotbar = !KDConfigHotbar;
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"Remove": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[6]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[6];},
		icon: (_player, _item) => {
			return "InventoryAction/Remove";
		},
		show: (_player, item) => {
			return !KDGetCurse(item) && !item.lock;
		},
		valid: (_player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return !sg.blocked;
		},
		click: (_player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			if (itemIndex >= 0 && !sg.blocked) {
				KDSendInput("struggle", {group: sg.group, index: itemIndex, type: "Remove"});
			}
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"Unlock": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[4]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[4];},
		icon: (_player, item) => {
			return "Locks/" + item.lock;
		},
		show: (_player, item) => {
			return !KDGetCurse(item) && !item.lock == false;
		},
		valid: (_player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return !sg.blocked;
		},
		click: (_player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			if (itemIndex >= 0 && !sg.blocked) {
				KDSendInput("struggle", {group: sg.group, index: itemIndex, type: "Unlock"});
			}
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"Lock": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[7]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[7];},
		icon: (_player, _item) => {
			return "InventoryAction/Lock";
		},
		show: (_player, item) => {
			return !KDGetCurse(item) && !item.lock && KinkyDungeonIsLockable(KDRestraint(item));
		},
		valid: (_player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return !sg.blocked;
		},
		click: (_player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			if (itemIndex >= 0 && !sg.blocked) {
				KDSendInput("lock", {group: sg.group, index: itemIndex, type: "White"});
			}
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"Pick": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[5]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[5];},
		icon: (_player, _item) => {
			return "InventoryAction/Pick";
		},
		show: (_player, item) => {
			return !KDGetCurse(item) && !item.lock == false;
		},
		valid: (_player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return KinkyDungeonItemCount("Pick") > 0 && !sg.blocked;
		},
		click: (_player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			if (itemIndex >= 0 && !sg.blocked) {
				KDSendInput("struggle", {group: sg.group, index: itemIndex, type: "Unlock"});
			}
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},

	"CurseStruggle": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[3]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[3];},
		icon: (_player, _item) => {
			return "InventoryAction/CurseStruggle";
		},
		show: (_player, item) => {
			return !(KDGetCurse(item) || item.lock);
		},
		valid: (_player, _item) => {
			return true;
		},
		click: (_player, item) => {
			KinkyDungeonCurseStruggle(item, (KDGetCurse(item)));
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"CurseInfo": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[2]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[2];},
		icon: (_player, _item) => {
			return "InventoryAction/CurseInfo";
		},
		show: (_player, item) => {
			return !(KDGetCurse(item) || item.lock);
		},
		valid: (_player, _item) => {
			return true;
		},
		click: (_player, item) => {
			KinkyDungeonCurseInfo(item, (KDGetCurse(item)));
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"CurseUnlock": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[4]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[4];},
		icon: (_player, _item) => {
			return "InventoryAction/CurseUnlock";
		},
		show: (_player, item) => {
			return !KDGetCurse(item) == true;
		},
		valid: (_player, item) => {
			return KinkyDungeonCurseAvailable(item, (KDGetCurse(item)));
		},
		click: (_player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			if (itemIndex >= 0 && KinkyDungeonCurseAvailable(item, (KDGetCurse(item)))) {
				let r = KDRestraint(item);
				let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
				KDSendInput("curseUnlock", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], curse: (KDGetCurse(item))});
			}
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"Struggle": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[2]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[2];},
		icon: (_player, _item) => {
			return "InventoryAction/Struggle";
		},
		show: (_player, item) => {
			return !KDGetCurse(item) && !item.lock;
		},
		valid: (_player, _item) => {
			return true;
		},
		click: (_player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			if (itemIndex >= 0) {
				let r = KDRestraint(item);
				let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
				KDSendInput(KDGetCurse(item) ? "struggleCurse" : "struggle", {group: sg.group, index: itemIndex, type: "Struggle", curse: KDGetCurse(item)});
			}
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"Cut": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[3]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[3];},
		icon: (_player, _item) => {
			return (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name && !KinkyDungeonPlayerDamage.unarmed) ? "Items/" + KinkyDungeonPlayerWeapon :"InventoryAction/Cut";
		},
		show: (_player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return !KDGetCurse(item) && !sg.noCut;
		},
		valid: (_player, item) => {
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			return !sg.blocked;
		},
		click: (_player, item) => {
			let itemIndex = KDGetItemLinkIndex(item, false);
			let r = KDRestraint(item);
			let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
			if (itemIndex >= 0 && !sg.blocked && !sg.noCut) {
				KDSendInput("struggle", {group: sg.group, index: itemIndex, type: "Cut"});
			}
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},

	"Favorite": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[1]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[1];},
		text: (_player, item) => {
			return TextGet("KDInventoryAction" + (!(KDGameData.ItemPriority[item.name|| item.name] > 9) ? "Favorite" : "Unfavorite"));
		},
		icon: (_player, item) => {
			return !(KDGameData.ItemPriority[item.name|| item.name] > 9) ? "InventoryAction/Favorite" : "InventoryAction/Unfavorite";
		},
		valid: (_player, _item) => {
			return true;
		},
		click: (_player, item) => {
			if (!KDGameData.ItemPriority) KDGameData.ItemPriority = {};
			if (!(KDGameData.ItemPriority[item.name|| item.name] > 9)) KDGameData.ItemPriority[item.name|| item.name] = 10;
			else KDGameData.ItemPriority[item.name|| item.name] = 0;
			KDSortInventory(KinkyDungeonPlayerEntity);


			let filteredInventory = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter, undefined, undefined, undefined, undefined, KDInvFilter);
			let index = filteredInventory.findIndex((element) => {return element.item.name == item.name;});
			if (index >= 0) {
				KinkyDungeonCurrentPageInventory = index;
			}

		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"Use": {
		icon: (_player, _item) => {
			return "InventoryAction/Use";
		},
		valid: (_player, item) => {
			return item.quantity > 0;
		},
		click: (_player, item) => {
			KDSendInput("consumable", {item: item.name, quantity: 1});
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},

	"QuickSlot1": {
		icon: (_player, _item) => {
			return KDGameData.PreviousWeapon[0] ? "Items/" + (KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[0]]?.template || KDGameData.PreviousWeapon[0]) : "InventoryAction/Quickslot";
		},
		valid: (_player, _item) => {
			return true;//KDGameData.PreviousWeapon[0] != item.name;
		},
		label: (_player, _item) => {
			if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[0]) {
				return TextGet("KDLocked");
			}
			return "";
		},
		click: (_player, item) => {
			KDGameData.PreviousWeapon[0] = item.name;
			if (!KDGameData.PreviousWeaponLock) {
				KDGameData.PreviousWeaponLock = [];
				for (let i = 0; i < KDMaxPreviousWeapon; i++) {
					KDGameData.PreviousWeaponLock.push(false);
				}
			}
			KDGameData.PreviousWeaponLock[0] = !KDGameData.PreviousWeaponLock[0];
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"QuickSlot2": {
		icon: (_player, _item) => {
			return KDGameData.PreviousWeapon[1] ? "Items/" + (KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[1]]?.template || KDGameData.PreviousWeapon[1]) : "InventoryAction/Quickslot";
		},
		valid: (_player, _item) => {
			return true;//KDGameData.PreviousWeapon[0] != item.name;
		},
		label: (_player, _item) => {
			if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[1]) {
				return TextGet("KDLocked");
			}
			return "";
		},
		click: (_player, item) => {
			KDGameData.PreviousWeapon[1] = item.name;
			if (!KDGameData.PreviousWeaponLock) {
				KDGameData.PreviousWeaponLock = [];
				for (let i = 0; i < KDMaxPreviousWeapon; i++) {
					KDGameData.PreviousWeaponLock.push(false);
				}
			}
			KDGameData.PreviousWeaponLock[1] = !KDGameData.PreviousWeaponLock[1];
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"QuickSlot3": {
		icon: (_player, _item) => {
			return KDGameData.PreviousWeapon[2] ? "Items/" + (KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[2]]?.template || KDGameData.PreviousWeapon[2]) : "InventoryAction/Quickslot";
		},
		valid: (_player, _item) => {
			return true;//KDGameData.PreviousWeapon[0] != item.name;
		},
		label: (_player, _item) => {
			if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[2]) {
				return TextGet("KDLocked");
			}
			return "";
		},
		click: (_player, item) => {
			KDGameData.PreviousWeapon[2] = item.name;
			if (!KDGameData.PreviousWeaponLock) {
				KDGameData.PreviousWeaponLock = [];
				for (let i = 0; i < KDMaxPreviousWeapon; i++) {
					KDGameData.PreviousWeaponLock.push(false);
				}
			}
			KDGameData.PreviousWeaponLock[2] = !KDGameData.PreviousWeaponLock[2];
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},
	"QuickSlot4": {
		icon: (_player, _item) => {
			return KDGameData.PreviousWeapon[3] ? "Items/" + (KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[3]]?.template || KDGameData.PreviousWeapon[3]) : "InventoryAction/Quickslot";
		},
		valid: (_player, _item) => {
			return true;//KDGameData.PreviousWeapon[0] != item.name;
		},
		label: (_player, _item) => {
			if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[3]) {
				return TextGet("KDLocked");
			}
			return "";
		},
		click: (_player, item) => {
			KDGameData.PreviousWeapon[3] = item.name;
			if (!KDGameData.PreviousWeaponLock) {
				KDGameData.PreviousWeaponLock = [];
				for (let i = 0; i < KDMaxPreviousWeapon; i++) {
					KDGameData.PreviousWeaponLock.push(false);
				}
			}
			KDGameData.PreviousWeaponLock[3] = !KDGameData.PreviousWeaponLock[3];
		},
		cancel: (_player, _delta) => {
			return false; // NA for default actions
		},
	},


	"RemoveCurseOrHex": {
		icon: (_player, _item) => {
			return "InventoryAction/Macaron";
		},
		valid: (_player, item) => {
			if (!(item?.type == Restraint)) return false;
			return KDHasRemovableCurse(item, KDGameData.CurseLevel) || KDHasRemovableHex(item, KDGameData.CurseLevel);
		},
		/** Happens when you click the button */
		click: (_player, item) => {
			if (KDHasRemovableCurse(item, KDGameData.CurseLevel) || KDHasRemovableHex(item, KDGameData.CurseLevel)) {
				if (KDHasRemovableCurse(item, KDGameData.CurseLevel)) {
					if (item.curse && KDCurses[item.curse]) {
						KDCurses[item.curse].remove(item, KDGetRestraintHost(item), true);
					}

					let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
					item.curse = undefined;
					if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
						KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
					}
				}
				let removeHexes = {};
				for (let e of KDGetRemovableHex(item, KDGameData.CurseLevel)) {
					removeHexes[e.original] = true;
				}
				let newEvents = [];
				for (let event of item.events) {
					if (!event.original || !removeHexes[event.original]) newEvents.push(event);
				}
				item.events = newEvents;
				let transform = false;
				for (let event of newEvents) {
					if (event.trigger == "CurseTransform") transform = true;
				}
				if (!transform) {
					for (let event of newEvents) {
						if (event.trigger == "curseCount") {
							newEvents.splice(newEvents.indexOf(event), 1);
							break;
						}
					}
				}

				if (KDGetRestraintVariant(item)) {
					KDGetRestraintVariant(item).events = JSON.parse(JSON.stringify(item.events));
					if (KDGetRestraintVariant(item).suffix == "Cursed") KDGetRestraintVariant(item).suffix = "Purified";
					if (KDGetRestraintVariant(item).prefix == "Cursed") KDGetRestraintVariant(item).prefix = "Purified";
				}

				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Evil.ogg");

				if (KDGameData.UsingConsumable) {
					KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonInventoryItem" + KDGameData.UsingConsumable + "Use"), "#ff5555", 1, true);
					let con = KinkyDungeonInventoryGetConsumable(KDGameData.UsingConsumable);
					if (con) {
						if (con.quantity > 1) con.quantity -= 1;
						else {
							KDGameData.InventoryAction = "";
							KDGameData.UsingConsumable = "";
							KinkyDungeonInventoryRemoveSafe(con);
						}
					}
					KinkyDungeonLastAction = "";
					KinkyDungeonAdvanceTime(1, true, true);
				}
			}
		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction
					|| !(KinkyDungeonAllRestraintDynamic().some((r) => {return KDHasRemovableCurse(r.item, KDGameData.CurseLevel) || KDHasRemovableHex(r.item, KDGameData.CurseLevel);}))) {
					KDGameData.UsingConsumable = "";
					return true;
				}
			}
			return false;
		},
	},
	"RemoveMagicLock": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeyEnter[0]);},
		hotkeyPress: () => {return KinkyDungeonKeyEnter[0];},
		icon: (_player, _item) => {
			return "InventoryAction/CommandWord";
		},
		valid: (_player, item) => {
			if (!(item?.type == Restraint)) return false;
			return KDMagicLocks.includes(item.lock);
		},
		/** Happens when you click the button */
		click: (_player, item) => {
			if (KDMagicLocks.includes(item.lock)) {
				KinkyDungeonLock(item, "");

				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonPurpleLockRemove"), "#e7cf1a", 2);
				KinkyDungeonChangeMana(-KDGameData.InventoryActionManaCost || 0);
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");

				KDGameData.InventoryAction = "";
				KinkyDungeonLastAction = "Cast";
				KinkyDungeonAdvanceTime(1, true, true);
			}
		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (!KinkyDungeonHasMana(KDGameData.InventoryActionManaCost) || !(KinkyDungeonPlayerGetRestraintsWithLocks(KDMagicLocks).length > 0)) {
					return true;
				}
			}
			return false;
		},
	},
	"Offhand": {
		icon: (_player, _item) => {
			return "InventoryAction/Offhand";
		},
		valid: (_player, item) => {
			if (!(item?.type == Weapon && KDCanOffhand(item))) return false;
			return KinkyDungeonCanUseWeapon(false, undefined, KDWeapon(item));
		},
		show: (_player, item) => {
			return KDGameData.Offhand != item.name;
		},
		/** Happens when you click the button */
		click: (_player, item) => {
			KDGameData.Offhand = item.name;
			KDGameData.OffhandOld = item.name;
			KinkyDungeonAdvanceTime(1, true, true);
			//if (KDGameData.InventoryAction == "Offhand")
			//	KinkyDungeonDrawState = "Game";
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"RemoveOffhand": {
		icon: (_player, _item) => {
			return "InventoryAction/RemoveOffhand";
		},
		valid: (_player, item) => {
			return KDGameData.Offhand == item.name;
		},
		/** Happens when you click the button */
		click: (_player, item) => {
			KDGameData.Offhand = "";
			KDGameData.OffhandOld = "";
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"Attach": {
		icon: (_player, _item) => {
			return "InventoryAction/Attach";
		},
		valid: (_player, item) => {
			if (!(item?.type == Weapon && !KDWeapon(item)?.noHands && !KDWeapon(item)?.unarmed)) return false;
			return item.name != KDGameData.AttachedWep;
		},
		label:  (_player, _item) => {
			if (KDGameData.AttachedWep && KinkyDungeonInventoryGet(KDGameData.AttachedWep))
				return KDGetItemNameString(KDGameData.AttachedWep);
			return "";
		},
		itemlabel:  (_player, item) => {
			if (KDGameData.AttachedWep == item.name)
				return TextGet("KDAttached");
			return "";
		},
		/** Happens when you click the button */
		click: (_player, item) => {
			KDGameData.AttachedWep = item.name;
			KinkyDungeonAdvanceTime(1, true, true);
			KDStunTurns(4, true);
			KinkyDungeonDrawState = "Game";
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Tape.ogg");
		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"Sell": {
		alsoShow: ["SellBulk", "SellExcess"],
		icon: (_player, _item) => {
			return "InventoryAction/Sell";
		},
		label:  (_player, item) => {
			if (KDWeapon(item)?.unarmed) return "";
			let mult = 1;
			let quantity = 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)
			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDGP").replace("AMNT", value + "");
		},
		itemlabel:  (_player, item) => {
			if (KDWeapon(item)?.unarmed) return "";
			let mult = 1;
			let quantity = 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)
			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDGP").replace("AMNT", value + "");
		},
		itemlabelcolor: (_player, _item) => {return "#ffff44";},
		text:  (_player, item) => {
			let mult = 1;
			let quantity = 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)
			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDInventoryActionSell").replace("VLU", value + "");
		},
		valid: (_player, item) => {
			if (KDGameData.ItemPriority[item.name|| item.name] > 9) return false;
			if (KDWeapon(item)?.unarmed) return false;
			return item?.type == Weapon || item?.type == LooseRestraint || item?.type == Consumable;
		},
		/** Happens when you click the button */
		click: (_player, item) => {
			let mult = 1;
			let quantity = 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			let itemInv = KinkyDungeonInventoryGetSafe(item.name);
			if (!itemInv) return;
			if (itemInv.type == Consumable)
				KinkyDungeonChangeConsumable(KDConsumable(itemInv), -1);
			else if (itemInv.quantity > 1) itemInv.quantity -= 1;
			else KinkyDungeonInventoryRemoveSafe(itemInv);
			KinkyDungeonAddGold(value);
			if (!KDGameData.ItemsSold) KDGameData.ItemsSold = {};
			KDGameData.ItemsSold[item.name] = (KDGameData.ItemsSold[item.name] || 0) + 1;
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
			KinkyDungeonSendTextMessage(10, TextGet("KDSell")
				.replace("ITM", KDGetItemName(item))
				.replace("VLU", "" + value)
			, "#ffffff", 2);
		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"SellBulk": {
		icon: (_player, _item) => {
			return "InventoryAction/SellBulk";
		},
		label:  (_player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1);
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDGP").replace("AMNT", value + "");
		},
		text:  (_player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1);
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDInventoryActionSellBulk").replace("VLU", value + "");
		},
		valid: (_player, item) => {
			if (KDGameData.ItemPriority[item.name|| item.name] > 9) return false;
			return item?.type == LooseRestraint || item?.type == Consumable;
		},
		show: (_player, item) => {
			return item?.type == LooseRestraint || item?.type == Consumable;
		},
		/** Happens when you click the button */
		click: (_player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1);
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			let itemInv = KinkyDungeonInventoryGetSafe(item.name);
			if (!itemInv) return;
			if (itemInv.type == Consumable)
				KinkyDungeonChangeConsumable(KDConsumable(itemInv), -itemInv.quantity);
			else KinkyDungeonInventoryRemoveSafe(itemInv);
			if (!KDGameData.ItemsSold) KDGameData.ItemsSold = {};
			KDGameData.ItemsSold[item.name] = (KDGameData.ItemsSold[item.name] || 0) + quantity;
			KinkyDungeonAddGold(value);
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
			KinkyDungeonSendTextMessage(10, TextGet("KDSellBulk")
				.replace("ITM", KDGetItemName(item))
				.replace("VLU", "" + value)
				.replace("#", "" + (itemInv.quantity || 1))
			, "#ffffff", 2);
		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"SellExcess": {
		icon: (_player, _item) => {
			return "InventoryAction/SellExcess";
		},
		label:  (_player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1) - 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDGP").replace("AMNT", value + "");
		},
		text:  (_player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1) - 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			return TextGet("KDInventoryActionSellExcess").replace("VLU", value + "");
		},
		valid: (_player, item) => {
			if (KDGameData.ItemPriority[item.name|| item.name] > 9) return false;
			return item?.type == LooseRestraint || item?.type == Consumable;
		},
		show: (_player, item) => {
			if (!item.quantity || item.quantity == 1) return false;
			return item?.type == LooseRestraint || item?.type == Consumable;
		},
		/** Happens when you click the button */
		click: (_player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1) - 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
			let itemInv = KinkyDungeonInventoryGetSafe(item.name);
			if (!itemInv) return;
			if (itemInv.type == Consumable)
				KinkyDungeonChangeConsumable(KDConsumable(itemInv), -quantity);
			else KinkyDungeonInventoryGetSafe(item.name).quantity = 1;
			if (!KDGameData.ItemsSold) KDGameData.ItemsSold = {};
			KDGameData.ItemsSold[item.name] = (KDGameData.ItemsSold[item.name] || 0) + quantity;
			KinkyDungeonAddGold(value);
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
			KinkyDungeonSendTextMessage(10, TextGet("KDSellExcess")
				.replace("ITM", KDGetItemName(item))
				.replace("VLU", "" + value)
				.replace("#", "" + (quantity || 1))
			, "#ffffff", 2);
		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},


	"Recycle": {
		alsoShow: ["RecycleBulk", "RecycleExcess"],
		icon: (_player, _item) => {
			return "InventoryAction/Recycle";
		},
		show: (_player, item) => {
			return item?.type == LooseRestraint;
		},
		label:  (_player, item) => {
			return KDRecycleString(item, 1);
		},
		itemlabel:  (_player, item) => {
			return KDRecycleString(item, 1);
		},
		itemlabelcolor: (_player, _item) => {return "#ffffff";},
		text:  (_player, _item) => {
			let value = Math.round(100);
			return TextGet("KDInventoryActionRecycle").replace("VLU", value + "");
		},
		valid: (_player, item) => {
			if (KDGameData.ItemPriority[item.name|| item.name] > 9) return false;
			if (KDWeapon(item)?.unarmed) return false;
			if (KDRestraint(item)?.noRecycle != undefined) return false;
			return item?.type == Weapon || item?.type == LooseRestraint || item?.type == Consumable;
		},
		/** Happens when you click the button */
		click: (_player, item) => {
			KDChangeRecyclerInput(KDRecycleItem(item, 1));
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Recycle.ogg");
			KinkyDungeonSendTextMessage(10, KDRecycleResourceString(false, "RecyclerInput_"), "#ffffff", 2);
			KinkyDungeonSendTextMessage(10, TextGet("KDRecycle")
				.replace("ITM", KDGetItemName(item))
				.replace("VLU", "" + 100)
			, "#ffffff", 2);

		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"RecycleBulk": {
		icon: (_player, _item) => {
			return "InventoryAction/RecycleBulk";
		},
		label:  (_player, item) => {
			return KDRecycleString(item, item.quantity || 1);
		},
		text:  (_player, item) => {
			return KDRecycleString(item, item.quantity || 1);
		},
		valid: (_player, item) => {
			if (KDGameData.ItemPriority[item.name|| item.name] > 9) return false;
			return item?.type == LooseRestraint;
		},
		show: (_player, item) => {
			return item?.type == LooseRestraint;
		},
		/** Happens when you click the button */
		click: (_player, item) => {

			let itemInv = KinkyDungeonInventoryGetSafe(item.name);
			if (!itemInv) {
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/BeepEngage.ogg");
				return;
			}

			let quant = (itemInv.quantity || 1);

			KDChangeRecyclerInput(KDRecycleItem(item, itemInv.quantity || 1));
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Recycle.ogg");
			KinkyDungeonSendTextMessage(10, KDRecycleResourceString(false, "RecyclerInput_"), "#ffffff", 2);
			KinkyDungeonSendTextMessage(10, TextGet("KDRecycleBulk")
				.replace("ITM", KDGetItemName(item))
				.replace("VLU", "" + 100)
				.replace("#", "" + quant)
			, "#ffffff", 2);
		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"RecycleExcess": {
		icon: (_player, _item) => {
			return "InventoryAction/RecycleExcess";
		},
		label:  (_player, item) => {
			if (item.quantity > 1)
				return KDRecycleString(item, item.quantity - 1);
			return "";
		},
		text:  (_player, _item) => {
			let value = Math.round(100);
			return TextGet("KDInventoryActionRecycleExcess").replace("VLU", value + "");
		},
		valid: (_player, item) => {
			if (KDGameData.ItemPriority[item.name|| item.name] > 9) return false;
			return (item?.type == LooseRestraint);
		},
		show: (_player, item) => {
			return item?.type == LooseRestraint;
		},
		/** Happens when you click the button */
		click: (_player, item) => {

			let itemInv = KinkyDungeonInventoryGetSafe(item.name);
			if (!itemInv || !(itemInv.quantity > 1)) {
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/BeepEngage.ogg");
				return;
			}

			let quant = (itemInv.quantity - 1);

			KDChangeRecyclerInput(KDRecycleItem(item, itemInv.quantity - 1));
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Recycle.ogg");
			KinkyDungeonSendTextMessage(10, KDRecycleResourceString(false, "RecyclerInput_"), "#ffffff", 2);
			KinkyDungeonSendTextMessage(10, TextGet("KDRecycleExcess")
				.replace("ITM", KDGetItemName(item))
				.replace("VLU", "" + 100)
				.replace("#", "" + quant)
			, "#ffffff", 2);
		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},

	"Disassemble": {
		hotkey: () => {return KDHotkeyToText(KinkyDungeonKeySpell[4]);},
		hotkeyPress: () => {return KinkyDungeonKeySpell[4];},
		icon: (_player, _item) => {
			return "InventoryAction/Disassemble";
		},
		show: (_player, item) => {
			return item?.type == LooseRestraint && KDRestraint(item)?.disassembleAs != undefined;
		},
		itemlabelcolor: (_player, _item) => {return "#ffffff";},
		text:  (_player, item) => {
			let one = (item.quantity || 1) == 1 ? "One" : "";
			return TextGet("KDInventoryActionDisassemble" + one);
		},
		valid: (_player, item) => {
			if (KDGameData.ItemPriority[item.name|| item.name] > 9) return false;
			if (KDWeapon(item)?.unarmed) return false;
			return KDRestraint(item)?.disassembleAs != undefined;
		},
		/** Happens when you click the button */
		click: (_player, item) => {
			let itemInv = KinkyDungeonInventoryGetSafe(item.name);
			if (!itemInv || !(itemInv.quantity > 0)) {
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/BeepEngage.ogg");
				return;
			}

			let quant = Math.max(1, ((itemInv.quantity || 1) - 1));
			let mult = KDRestraint(item)?.disassembleCount || 1;
			let product = KDRestraint(item)?.disassembleAs;

			//KDChangeRecyclerInput(KDRecycleItem(item, itemInv.quantity - 1));

			KinkyDungeonInventoryAddLoose(
				product, undefined, undefined, quant
			);

			itemInv.quantity = (itemInv.quantity || 1) - quant;
			if (itemInv.quantity == 0) KinkyDungeonInventoryRemoveSafe(itemInv);
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Recycle.ogg");
			KinkyDungeonSendTextMessage(10, TextGet("KDRecycleExcess")
				.replace("ITM", KDGetItemName(item))
				.replace("PRD", TextGet("Restraint" + product))
				.replace("#", "" + quant)
				.replace("$", "" + quant*mult)
			, "#ffffff", 2);

		},
		/** Return true to cancel it */
		cancel: (_player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},



	"Bondage": {
		icon: (_player, _item) => {
			return "InventoryAction/Bondage";
		},
		/** Returns if the button is greyed out */
		valid: (player, item) => {
			if (!(item?.type == LooseRestraint)) return false;
			if (KDRestraintSpecial(item) || KDRestraint(item).armor) return false;
			let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
			for (let enemy of nearby) {
				if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
					return true;
				}
			}
			return false;
		},
		/** Happens when you click the button */
		click: (player, item) => {
			let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
			for (let enemy of nearby) {
				if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
					let level = KDRestraint(item).power;
					let type = KDRestraintBondageType(item);
					let status = KDRestraintBondageStatus(item);
					let mult = KDRestraintBondageMult(item, enemy);
					KDTieUpEnemy(enemy, level*mult, type);
					KinkyDungeonSendTextMessage(10,
						TextGet("KDTieUpEnemy")
							.replace("RSTR", KDGetItemName(item))//TextGet("Restraint" + KDRestraint(item)?.name))
							.replace("ENNME", TextGet("Name" + enemy.Enemy.name))
							.replace("AMNT", "" + Math.round(100 * enemy.boundLevel / enemy.Enemy.maxhp)),
						"#ffffff", 1);
					if (status.belt) {
						KinkyDungeonApplyBuffToEntity(enemy, KDChastity, {});
					}
					if (status.toy) {
						KinkyDungeonApplyBuffToEntity(enemy, KDToy, {});
					}
					if (status.plug) {
						KinkyDungeonApplyBuffToEntity(enemy, KDEntityBuffedStat(enemy, "Plug") > 0 ? KDDoublePlugged : KDPlugged, {});
					}
					if (status.blind) {
						enemy.blind = Math.max(enemy.blind || 0, status.blind);
					}
					if (status.silence) {
						enemy.silence = Math.max(enemy.silence || 0, status.silence);
					}
					if (status.bind) {
						enemy.bind = Math.max(enemy.bind || 0, status.bind);
					}
					if (status.immobile) {
						enemy.immobile = Math.max(enemy.immobile || 0, status.immobile);
					}
					if (status.slow) {
						enemy.slow = Math.max(enemy.slow || 0, status.slow);
					}
					if (status.disarm) {
						enemy.disarm = Math.max(enemy.disarm || 0, status.disarm);
					}
					if (status.reduceaccuracy) {
						KinkyDungeonApplyBuffToEntity(enemy,
							KDRestraintReduceAccuracy,
							{
								power: status.reduceaccuracy,
							},
						);
					}

					if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/LockLight.ogg");

					if (!enemy.items) enemy.items = [];
					enemy.items.push(item.inventoryVariant || item.name);
					if (item.quantity > 1) item.quantity -= 1;
					else KinkyDungeonInventoryRemoveSafe(item);
					KinkyDungeonAdvanceTime(1, true, true);

					break;
				}
			}
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
				for (let enemy of nearby) {
					if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
						return false;
					}
				}
				return true;
			}
			return false;
		},
	},
	"Food": {
		icon: (_player, _item) => {
			return "InventoryAction/Cookie";
		},
		/** Returns if the button is greyed out */
		valid: (player, item) => {
			if (!(item?.type == Consumable) || item.quantity < 1 || !KDConsumable(item)?.wp_instant) return false;
			let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
			for (let enemy of nearby) {
				if (enemy.id == KDGameData.FoodTarget && enemy.hp < enemy.Enemy.maxhp) {
					return true;
				}
			}
			return false;
		},
		/** Happens when you click the button */
		click: (player, item) => {
			let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
			for (let enemy of nearby) {
				if (enemy.id == KDGameData.FoodTarget) {
					enemy.hp = Math.min(enemy.Enemy.maxhp, enemy.hp + KDConsumable(item)?.wp_instant * 5);
					let faction2 = KDGetFaction(enemy);
					if (!KinkyDungeonHiddenFactions.has(faction2)) {
						KinkyDungeonChangeFactionRep(faction2, 0.01 * KDConsumable(item)?.wp_instant);
					}

					KinkyDungeonSendTextMessage(10,
						TextGet("KDGiveFood")
							.replace("RSTR", KDGetItemName(item))//TextGet("Restraint" + KDRestraint(item)?.name))
							.replace("ENNME", TextGet("Name" + enemy.Enemy.name))
							.replace("AMNT1", "" + Math.round(10 * enemy.hp))
							.replace("AMNT2", "" + Math.round(10 * enemy.Enemy.maxhp)),
						"#ffffff", 1);


					if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Cookie.ogg");

					if (item.quantity > 1) item.quantity -= 1;
					else KinkyDungeonInventoryRemoveSafe(item);
					KinkyDungeonAdvanceTime(1, true, true);

					break;
				}
			}
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
				for (let enemy of nearby) {
					if (enemy.id == KDGameData.FoodTarget) {
						return false;
					}
				}
				return true;
			}
			return false;
		},
	},
};
