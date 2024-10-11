let KDNPCBindingSelectedSlot: NPCBindingSubgroup = null;
let KDNPCBindingSelectedRow: NPCBindingGroup = null;
let KDSelectedGenericRestraintType = "";
let KDSelectedGenericBindItem = "";

interface NPCRestraint extends Named {
	name: string,
	inventoryVariant?: string,
	events?: KinkyDungeonEvent[],
	powerbonus?: number,
	lock: string,
	id: number,
	faction?: string,
	conjured?: boolean,
}

function KDNPCRestraintSlotOrder(): string[] {
	let ret: string[] = [];
	for (let group of NPCBindingGroups) {
		for (let i = group.layers.length - 1; i >= 0; i--) {
			ret.push(group.layers[i].id);
		}
		ret.push(group.encaseGroup.id);
	}
	return ret;
}

function KDDrawNPCRestrain(npcID: number, restraints: Record<string, NPCRestraint>, x: number, y: number) {
	let rows: NPCBindingSubgroup[][] = [];
	for (let group of NPCBindingGroups) {
		let row: NPCBindingSubgroup[] = [group.encaseGroup];
		for (let sgroup of group.layers) {
			row.push(sgroup);
		}
		rows.push(row);
	}

	let XX = x;
	let YY = y;

	/** First column is encase column */
	let paddingFirstCol = 100;
	let paddingX = 50;
	let paddingY = 67;

	for (let row of rows) {
		let II = 0;
		let tooltip = "";
		for (let sgroup of row) {
			let restraint = restraints[sgroup.id];
			let preview = "";
			let Group = sgroup.allowedGroups[0];
			let grp = KDGetGroupPreviewImage(Group);
			if (restraint) {
				let r = KDRestraint({name: restraint.name});
				if (r) {
					let prevData = KDGetRestraintPreviewImage(r);
					if (prevData) {
						preview = prevData;
					}
				}

			}
			let wid = II == 0 ? 56 : 42;
			if ((!sgroup.requirePerk || KinkyDungeonStatsChoice.get(sgroup.requirePerk)) &&
				(!sgroup.noPerk || !KinkyDungeonStatsChoice.get(sgroup.noPerk)) && DrawButtonKDEx(
				"npc_rest_butsg_"+ sgroup.id,
				() => {
					let set = KDSetBindingSlot(sgroup, KDGetEncaseGroupRow(sgroup.id));
					if (set) {
						KinkyDungeonCurrentPageInventory = 0;
					} else {
						KDSendInput("addNPCRestraint", {
							slot: sgroup.id,
							id: -1,
							restraint: "",
							restraintid: -1,
							lock: "",
							npc: npcID,
							faction: undefined,
							time: KinkyDungeonFindID(npcID) ? 1 : 0,
							player: KDPlayer().id,
						});
					}
					return true;
				}, true,
				XX, YY,
				wid, wid, "", "#ffffff",
				preview, undefined, undefined,
				KDNPCBindingSelectedSlot?.id != sgroup.id,
				KDButtonColor, undefined, undefined, {
					scaleImage: true,
				}
			) || KDNPCBindingSelectedSlot?.id == sgroup.id) tooltip = sgroup.id;


			if (II++ == 0) {
				if (grp && (!sgroup.requirePerk || KinkyDungeonStatsChoice.get(sgroup.requirePerk))
					&& (!sgroup.noPerk || !KinkyDungeonStatsChoice.get(sgroup.noPerk))) {
					KDDraw(kdcanvas, kdpixisprites, "npc_bind_list_grp" + sgroup.id,
						grp,
						XX - Math.floor(wid*0.25), YY - Math.floor(wid*0.25), Math.ceil(wid*1), Math.ceil(wid*1),
						undefined, {
							zIndex: restraint ? 0 : 160,
						}
					);
				}
				if (restraint?.conjured) {
					KDDraw(kdcanvas, kdpixisprites, "npc_bind_list_conj" + sgroup.id,
						KinkyDungeonRootDirectory + "UI/Conjured.png",
						XX, YY + Math.floor(wid*0.5),
						Math.ceil(wid*0.5), Math.ceil(wid*0.5),
						undefined, {
							zIndex: 160,
						}
					);
				}
				XX += paddingFirstCol;

			} else {
				if (grp && (!sgroup.requirePerk || KinkyDungeonStatsChoice.get(sgroup.requirePerk))
					&& (!sgroup.noPerk || !KinkyDungeonStatsChoice.get(sgroup.noPerk))) {
					KDDraw(kdcanvas, kdpixisprites, "npc_bind_list_grp" + sgroup.id,
						grp,
						XX, YY, wid, wid,
						undefined, {
							zIndex: restraint ? 0 : 160,
						}
					);
				}
				if (restraint?.conjured) {
					KDDraw(kdcanvas, kdpixisprites, "npc_bind_list_conj" + sgroup.id,
						KinkyDungeonRootDirectory + "UI/Conjured.png",
						XX, YY + Math.floor(wid*0.5),
						Math.ceil(wid*0.5), Math.ceil(wid*0.5),
						undefined, {
							zIndex: 160,
						}
					);
				}
				XX += paddingX;
			}

		}

		if (tooltip)
			DrawTextFitKD(TextGet("KDBindNPCSlot_" + tooltip),
				x + paddingFirstCol + 25, YY - 12, 400, "#ffffff", KDTextGray1,
				18, "center"
			);

		XX = x;
		YY += paddingY;
	}

	let currentBottomTab = "";

	if (KDNPCBindingSelectedSlot) {
		let currentItem = restraints[KDNPCBindingSelectedSlot.id];
		let slot = KDNPCBindingSelectedSlot;
		let groups = slot.allowedGroups;
		let filter = LooseRestraint;
		let ss: {selected: KDFilteredInventoryItem, tooltipitem: KDFilteredInventoryItem} = null;

		if (KDNPCBindingPalette) {
			currentBottomTab = "Palette";
			// KDSetRestraintPalette\

			DrawButtonKDEx("defaultnpcrestpalette", () => {
				if (currentItem)
					KDDefaultNPCBindPalette = currentItem.faction;
				return true;
			}, currentItem?.faction != undefined, 1100, 920, 250, 64,
			TextGet("KDSetDefaultNPCPalette") + TextGet("KDPalette" + (KDDefaultNPCBindPalette || "")),
			"#ffffff"
			);
			DrawButtonKDEx("npcpaletteSetAll", () => {
				if (currentItem) {
					for (let r of Object.values(restraints)) {
						r.faction = currentItem.faction;
					}
					KDSetNPCRestraints(npcID, restraints);
					if (KDNPCChar.get(npcID))
						KDRefreshCharacter.set(KDNPCChar.get(npcID), true);
				}

				return true;
			}, currentItem?.faction != undefined, 800, 920, 250, 64,
			TextGet("KDSetNPCPaletteAll"),
			"#ffffff"
			);

			KDDrawPalettes(1300, 250, KDPaletteWidth, 72, currentItem?.faction || "", (palette) => {

				if (currentItem) {
					Object.values(restraints).filter((slt) => {
						return slt.id == currentItem.id;
					}).forEach((slt) => {
						slt.faction = palette;
					})
					KDSetNPCRestraints(npcID, restraints);
					if (KDNPCChar.get(npcID))
						KDRefreshCharacter.set(KDNPCChar.get(npcID), true);
				}

			}, "KDSetRestraintPaletteSelect");

		} else if (KDNPCBindingGeneric) {
			currentBottomTab = "Generic";
			KDDrawGenericNPCRestrainingUI(Object.values(KDRestraintGenericTypes), 1300, 250,
			currentItem, slot, npcID, KDGetNPCRestraints(npcID), (currentItem, restraint, slt, item, count, itemtype) => {
				if (currentItem) {
					// Remove current
					if (restraints[slot.id]?.name == currentItem.name) {
						KDSendInput("addNPCRestraint", {
							slot: slot.id,
							id: -1,
							restraint: "",
							restraintid: -1,
							lock: "",
							npc: npcID,
							faction: undefined,
							time: KinkyDungeonFindID(npcID) ? 1 : 0,
							player: KDPlayer().id,
						});
					}
				} else {
					// Add new one
					if (!KinkyDungeonFindID(npcID) || KDCanApplyBondage(KinkyDungeonFindID(npcID), KDPlayer(),
						restraint.quickBindCondition ?
							(t, p) => (KDQuickBindConditions[restraint.quickBindCondition](
								t, p,
								restraint,
								null)) :
							undefined)) {

								let condition = KinkyDungeonFindID(npcID) ? KDCanEquipItemOnNPC(restraint, npcID,
									KDWillingBondage(KinkyDungeonFindID(npcID), KDPlayer()))
									: "";
								if (condition) {
									KinkyDungeonSendTextMessage(8,
										TextGet("KDBondageCondition_" + condition),
										"#ff5555", 1, true);
								} else {
									KDSendInput("addNPCRestraint", {
										slot: slot.id,
										id: KinkyDungeonGetItemID(),
										restraint: restraint.name,
										restraintid: -1,
										lock: "",
										events: itemtype.events,
										powerbonus: itemtype.powerbonus,
										inventoryVariant: itemtype.inventoryVariant,
										npc: npcID,
										faction: KDDefaultNPCBindPalette,
										time: KinkyDungeonFindID(npcID) ? 1 : 0,
										player: KDPlayer().id,
									});
									if (item) {
										item.quantity -= count;
									}
								}
							} else {
								let condition = KinkyDungeonFindID(npcID) ? KDCanEquipItemOnNPC(restraint, npcID,
									KDWillingBondage(KinkyDungeonFindID(npcID), KDPlayer()))
									: "";
								if (condition) {
									KinkyDungeonSendTextMessage(8,
										TextGet("KDBondageCondition_" + condition),
										"#ff5555", 1, true);
								} else {
									KinkyDungeonSendTextMessage(8, TextGet("KDBondageFailInvalidTarget" + (restraint.quickBindCondition || "")), "#ff5555", 1, true);
								}
							}

				}
			}, );

		} else {
			let filteredInventory = KinkyDungeonFilterInventory(filter, undefined, undefined, undefined, undefined, KDInvFilter);

			filteredInventory = filteredInventory.filter((inv) => {
				return groups.includes(KDRestraint(inv.item)?.Group)
					&& slot.allowedTags.some((tag) => {return KDRestraint(inv.item)?.shrine.includes(tag);});
			})



			ss = KDDrawInventoryContainer(-165, 100, filteredInventory, filter, filter,
				(inv: KDFilteredInventoryItem, x, y, w, h) => {
				if (restraints[slot.id]?.name == inv.item.name) {
					KDSendInput("addNPCRestraint", {
						slot: slot.id,
						id: -1,
						restraint: "",
						restraintid: -1,
						lock: "",
						npc: npcID,
						faction: undefined,
						time: KinkyDungeonFindID(npcID) ? 1 : 0,
						player: KDPlayer().id,
					});
				} else {

					let restraint = KDRestraint(inv.item);
					// Add new one
					if (!KinkyDungeonFindID(npcID) || KDCanApplyBondage(KinkyDungeonFindID(npcID), KDPlayer(),
					restraint.quickBindCondition ?
						(t, p) => (KDQuickBindConditions[restraint.quickBindCondition](
							t, p,
							restraint,
							null)) :
						undefined)) {

						let condition = KinkyDungeonFindID(npcID) ? KDCanEquipItemOnNPC(restraint, npcID,
							KDWillingBondage(KinkyDungeonFindID(npcID), KDPlayer()))
							: "";
						if (condition) {
							KinkyDungeonSendTextMessage(8,
								TextGet("KDBondageCondition_" + condition),
								"#ff5555", 1, true);
						} else {
							KDSendInput("addNPCRestraint", {
								slot: slot.id,
								id: inv.item.id,
								restraint: inv.item.name,
								restraintid: inv.item.id,
								lock: "",
								npc: npcID,
								faction: KDDefaultNPCBindPalette || inv.item.faction,
								time: KinkyDungeonFindID(npcID) ? 1 : 0,
								player: KDPlayer().id,
							});
						}
					} else {
						let condition = KinkyDungeonFindID(npcID) ? KDCanEquipItemOnNPC(restraint, npcID,
							KDWillingBondage(KinkyDungeonFindID(npcID), KDPlayer()))
							: "";
						if (condition) {
							KinkyDungeonSendTextMessage(8,
								TextGet("KDBondageCondition_" + condition),
								"#ff5555", 1, true);
						} else {
							KinkyDungeonSendTextMessage(8, TextGet("KDBondageFailInvalidTarget" + (restraint.quickBindCondition || "")), "#ff5555", 1, true);
						}
					}

				}
			}, KDCustomDrawInvColorFilter[KinkyDungeonDrawState] ?
			KDCustomDrawInvColorFilter[KinkyDungeonDrawState]({
				restraints: restraints,
				id: npcID,
				entity: KinkyDungeonFindID(npcID),
				player: KDPlayer(),
				force: !KinkyDungeonFindID(npcID),
			})
			: (inv) => {
			if (KDRowItemIsValid(KDRestraint(inv.item), KDNPCBindingSelectedSlot, KDNPCBindingSelectedRow, restraints))
				return KDTextGray1;
			return "#e64539";
		});
		}




		if (currentItem) {
			DrawTextFitKD(TextGet("KDCurrentItem") + KDGetItemNameString(currentItem.name),
			x + 570, 130, 500, "#ffffff", KDTextGray1,
			36, "center"
			);
		}

		if (ss?.tooltipitem) {
			DrawTextFitKD(TextGet("KDCurrentItem2") + KDGetItemName(ss.tooltipitem.item),
			x + 570, 180, 500, "#ffffff", KDTextGray1,
			36, "center"
			);
		}

		DrawButtonKDEx("paletteswapnpcrest", () => {
			KDNPCBindingPalette = !KDNPCBindingPalette;
			KDNPCBindingGeneric = false;
			return true;
		}, true, 1400, 920, 250, 64,
		TextGet(currentBottomTab ? "KDSetRestraintPaletteReturn" : "KDSetRestraintPalette"),
		"#ffffff"
		);
		if (!currentBottomTab)
			DrawButtonKDEx("genericrestraint", () => {
				KDNPCBindingGeneric = !KDNPCBindingGeneric;
				KDNPCBindingPalette = false;
				return true;
			}, true, 1100, 920, 250, 64,
			TextGet("KDSetRestraintGeneric"),
			"#ffffff"
			);
		// TODO add properties
	}

	if (!currentBottomTab) {
		let enemy = KDGetGlobalEntity(npcID);
		if (enemy?.boundLevel < KDGetExpectedBondageAmountTotal(npcID, enemy, false)) {
			if (DrawButtonKDEx("TightenBinds", (b) => {
				if (!KDIsNPCPersistent(npcID) || KDGetPersistentNPC(npcID).collect)
					KDSendInput("tightenNPCRestraint", {
						npc: npcID,
						player: KDPlayer().id,
					});
				else {
					KinkyDungeonSendTextMessage(10, TextGet("KDNeedsTighten"), "#ffffff", 2, true, true);
				}
				if (KDSoundEnabled())
					AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Struggle" + ".ogg");
				return true;
			}, true, x + 5, y + 740, 80, 80,
			"", "#ffffff", KinkyDungeonRootDirectory + "UI/Tighten.png",
			undefined, undefined, false,
			(!KDIsNPCPersistent(npcID) || KDGetPersistentNPC(npcID).collect) ?
				KDButtonColor : "#ff5555")) {
					DrawTextFitKD(TextGet("KDTightenRestraint"), x + 0, y + 720, 500, "#ffffff",
					KDTextGray0, 18, "left");

				}
		}
	}
}

let KDNPCBindingPalette = false;
let KDNPCBindingGeneric = false;
let KDDefaultNPCBindPalette = "";

function KDGetNPCRestraints(id: number): Record<string, NPCRestraint> {
	if (!KDGameData.NPCRestraints)
		KDGameData.NPCRestraints = {};
	let value = KDGameData.NPCRestraints["" + id];
	if (!value)
		return {};
	else return value;
}

function KDSetNPCRestraints(id: number, restraints: Record<string, NPCRestraint>) {
	if (!KDGameData.NPCRestraints)
		KDGameData.NPCRestraints = {};
	KDGameData.NPCRestraints["" + id] = restraints;

	if (KDGameData.Collection[id + ""])
		KDValidateEscapeGrace(KDGameData.Collection[id + ""]);
}
function KDSetNPCRestraint(id: number, slot: string, restraint: NPCRestraint): item {
	if (!KDGameData.NPCRestraints)
		KDGameData.NPCRestraints = {};
	let item: item = null;
	let restraints = KDGetNPCRestraints(id);
	if (restraints[slot]) {
		item = {
			name: restraints[slot].inventoryVariant || restraints[slot].name,
			//curse: curse,
			id: KinkyDungeonGetItemID(),
			type: LooseRestraint,
			events: restraints[slot].events,
			inventoryVariant: restraints[slot].inventoryVariant,
			conjured: restraints[slot].conjured,
			quantity: 1,
			showInQuickInv: KinkyDungeonRestraintVariants[restraints[slot].inventoryVariant] != undefined};
	}
	if (restraint)
		restraints[slot] = restraint;
	else delete restraints[slot];

	KDSetNPCRestraints(id, restraints);


	return item;
}

function KDSetBindingSlot(sgroup: NPCBindingSubgroup, row: NPCBindingGroup): boolean {
	if (sgroup != KDNPCBindingSelectedSlot) {
		KDNPCBindingSelectedSlot = sgroup;
		KDNPCBindingSelectedRow = row;
		return true;
	}
	return false;
}

function KDNPCRestraintSize(restraint: restraint, sgroup: NPCBindingSubgroup, row: NPCBindingGroup): number {
	let tags = restraint.shrine;
	let size = 1;
	if (sgroup.id != row.encaseGroup.id)
		tags.forEach((tag) => {
			size = Math.max(size, NPCBindingRestraintSize[tag] || 1);
		})
	return size;
}

function KDGetRestraintsForCharacter(char): (item | NPCRestraint)[] {
	if (char == KinkyDungeonPlayer) return KinkyDungeonAllRestraintDynamic().map((inv) => {return inv.item;});
	else if (KDNPCChar_ID.get(char)) {
		let rest = KDGetNPCRestraints(KDNPCChar_ID.get(char));
		if (rest) return Object.values(rest);
	}
	return [];
}
function KDGetRestraintsForEntity(entity: entity): (item | NPCRestraint)[] {
	let char = KDGetCharacter(entity);
	if (char == KinkyDungeonPlayer) return KinkyDungeonAllRestraintDynamic().map((inv) => {return inv.item;});
	else {
		let rest = KDGetNPCRestraints(entity.id);
		if (rest) return Object.values(rest);
	}
	return [];
}
function KDGetRestraintsForID(id: number): (item | NPCRestraint)[] {
	if (id == KDPlayer().id) return KinkyDungeonAllRestraintDynamic().map((inv) => {return inv.item;});
	else {
		let rest = KDGetNPCRestraints(id);
		if (rest) return Object.values(rest);
	}
	return [];
}

function KDNPCRestraintValidLayers(restraint: restraint,
		sgroup: NPCBindingSubgroup,
		row: NPCBindingGroup,
		restraints?: Record<string, NPCRestraint>,
		allowSameID?: number,
		power?: number): NPCBindingSubgroup[] {
	let group = restraint.Group;
	let tags = restraint.shrine;
	let ret = [...row.layers, row.encaseGroup].filter((sg) => {
		return (!restraints // no restraints array given => general case
			|| !restraints[sg.id] // Slot is empty
			|| (allowSameID && restraints[sg.id].id == allowSameID) // allows same ID as current item
			|| (power != undefined && power > KDGetNPCRestraintPower(restraints[sg.id])) // power given, check if power is higher
		) && (
			sg.id == sgroup.id
			|| (
				sg.allowedGroups.includes(group)
				&& tags.some((tag) => {
					return sg.allowedTags.includes(tag);
				})
			)
		);
	});

	if (ret.length > 0) {
		// Resolve ambiguity
		let index = ret.findIndex((slot) => {
			return slot.id == sgroup.id;
		});

		if (index > 0) {
			// Javascript witchery
			ret.unshift(...ret.splice(index, 1));
		}
	}
	return ret;
}

function KDRowItemIsValid(restraint: restraint,
		sgroup: NPCBindingSubgroup,
		row: NPCBindingGroup,
		restraints: Record<string, NPCRestraint>,
		treatAsEmpty: boolean = false,
		power?: number): boolean {
	let group = restraint.Group;

	if (
		sgroup.allowedGroups.includes(group)
	) {
		let tags = restraint.shrine;
		if (tags.some((tag) => {
			return sgroup.allowedTags.includes(tag);
		})) {
			if (treatAsEmpty) return true;
			let size = KDNPCRestraintSize(restraint, sgroup, row);
			if ((power === undefined && size == 1) ||
				(
					size <=
						KDNPCRestraintValidLayers(restraint, sgroup, row, restraints, undefined, power).length
					&& KDNPCRestraintValidLayers(restraint, sgroup, row, restraints, undefined, power).some(
						(slot) => {return slot.id == sgroup.id;}
					)
				)
			) {
				return true;
			}
		}
	}

	return false;
}

/** Gets the row of the specified id */
function KDGetEncaseGroupRow(id): NPCBindingGroup {
	for (let group of NPCBindingGroups) {
		if (group.encaseGroup.id == id ||
			group.layers.some((layer) => {
				return layer.id == id;
			})
		) return group;
	}
	return null;
}
/** Gets the specified id */
function KDGetEncaseGroupSlot(id): NPCBindingSubgroup {
	for (let group of NPCBindingGroups) {
		if (group.encaseGroup.id == id) return group.encaseGroup;
		for (let layer of group.layers) {
			if (layer.id == id) return layer;
		}
	}
	return null;
}

function KDNPCRefreshBondage(id: number, player: number, force: boolean = false, allowConjured: boolean = true, container?: Record<string, item>) {
	let restraints: Record<string, NPCRestraint> = JSON.parse(JSON.stringify(KDGetNPCRestraints(id)));

	if (restraints) {
		let already = {};
		for (let inv of Object.entries(restraints)) {
			if (!already[inv[1].id] && (allowConjured || !inv[1].conjured)) {
				already[inv[1].id] = true;
				KDInputSetNPCRestraint({
					slot: inv[0],
					id: -1,
					restraint: "",
					restraintid: -1,
					lock: "",
					npc: id,
					player: player,
					force: true,
				}, container);

			}
		}
		// Readd
		already = {};
		for (let inv of Object.entries(restraints)) {
			if (!already[inv[1].id] && (allowConjured || !inv[1].conjured)) {
				already[inv[1].id] = true;
				KDInputSetNPCRestraint({
					slot: inv[0],
					id: inv[1].id,

					faction: inv[1].faction,
					restraint: inv[1].name,
					restraintid: -1,
					lock: inv[1].lock,
					inventoryVariant: inv[1].inventoryVariant,
					events: inv[1].events,
					powerbonus: inv[1].powerbonus,
					conjured: inv[1].conjured,

					npc: id,
					player: player,
					force: true,
				}, container);
			}
		}
	}
}

function KDNPCRestraintTieUp(id: number, restraint: NPCRestraint, mult: number = 1) {
	let enemy = KDGetGlobalEntity(id);
	if (enemy) {

		let stats = KDGetRestraintBondageStats(restraint, enemy);
		KDTieUpEnemy(enemy, stats.amount * mult, stats.type, {}, false, 0);

		KDUpdatePersistentNPC(id);
	}

	if (KDGameData.Collection[id + ""])
		KDValidateEscapeGrace(KDGameData.Collection[id + ""]);
}

function KDCanEquipItemOnNPC(r: restraint, id: number, willing: boolean): string {
	let enemy = KDGetGlobalEntity(id);
	// TODO make this function work on player too
	if (enemy) {
		let stats = KDGetRestraintBondageStats(r, enemy);
		if (stats.conditions) {
			for (let condition of stats.conditions) {
				if (!KDBondageConditions[condition](r, id, willing)) {
					return condition;
				}
			}
		}

		return "";
	}
	return "Null";
}

function KDFreeNPCRestraints(id: number, player: number) {
	if (KDGameData.NPCRestraints) {

		let restraints = KDGameData.NPCRestraints[id + ''];
		if (restraints) {
			for (let inv of Object.entries(restraints)) {
				KDInputSetNPCRestraint({
					slot: inv[0],
					id: -1,
					restraint: "",
					restraintid: -1,
					lock: "",
					npc: id,
					player: player,
				});
			}
		}
	}
}

function KDInputSetNPCRestraint(data, container?: Record<string, item>): boolean {
	let row = KDGetEncaseGroupRow(data.slot);
	let slot = KDGetEncaseGroupSlot(data.slot);
	let item: item = null;
	if (!slot) return false;
	let willing = data.force || false;
	if (KDGameData.Collection[data.npc + ""]) {
		if (!KDGetGlobalEntity(data.npc)) {// We have to create it
			let Enemy = KinkyDungeonGetEnemyByName(KDGameData.Collection[data.npc + ""].type);
			let npc = KDGetPersistentNPC(data.npc, {summoned: true, Enemy: Enemy, id: data.npc,
				x:1, y:1,
				hp: (Enemy && Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp,
				movePoints: 0, attackPoints: 0}); // Make them persistent
			npc.collect = true; // They are in collection
		}
		willing = willing || KDGetPersistentNPC(data.npc)?.collect;
	}

	let globalEntity = KDGetGlobalEntity(data.npc);
	let packed = globalEntity ? KDUnPackEnemy(globalEntity) : false;

	if (data.restraint) {
		let rests = KDGetNPCRestraints(data.npc);
		let restraint = KDRestraint({name: data.restraint});


		if (restraint) {
			// Willing: true because they cant resist
			let condition = KDCanEquipItemOnNPC(restraint, data.npc, willing || KDWillingBondage(KDGetGlobalEntity(data.npc),
			data.player ? KDLookupID(data.player) : undefined));
			if (condition) {
				KinkyDungeonSendTextMessage(8,
					TextGet("KDBondageCondition_" + condition),
					"#ff5555", 1, true);
				return false;
			}
		}

		if (rests && rests[slot.id]) {
			KDInputSetNPCRestraint({
				slot: slot.id,
				id: -1,
				restraint: "",
				restraintid: -1,
				lock: "",
				npc: data.npc,
				player: data.player,
			});
		}
		if (KDRowItemIsValid(restraint, slot, row, rests)) {
			if (KDNPCChar.get(data.npc))
				KDRefreshCharacter.set(KDNPCChar.get(data.npc), true);
			let size = KDNPCRestraintSize(restraint, slot, row);
			let id = data.restraintid > 0 ? data.restraintid : KinkyDungeonGetItemID();
			let slotsToFill = KDNPCRestraintValidLayers(restraint, slot, row, rests, id);

			if (slotsToFill.length >= size) {
				let rrr: NPCRestraint = {
					lock: data.lock,
					name: data.restraint,
					id: id,
					faction: data.faction,

					inventoryVariant: data.inventoryVariant,
					powerbonus: data.inventoryVariant ? KinkyDungeonRestraintVariants[data.inventoryVariant]?.power : data.powerbonus,
				};

				if (data.inventoryVariant) {
					rrr.events = KDGetEventsForRestraint(data.restraint);
					if (rrr.events && KinkyDungeonRestraintVariants[data.inventoryVariant]?.events)
						Object.assign(rrr.events,
							JSON.parse(JSON.stringify(KinkyDungeonRestraintVariants[data.inventoryVariant]?.events)));
				} else if (data.events) {
					rrr.events = JSON.parse(JSON.stringify(data.events));
				}

				for (let i = 0; i < size; i++) {
					item = KDSetNPCRestraint(data.npc, slotsToFill[i].id, rrr);
				}

				// Add the tieup value
				if (item)
					KDNPCRestraintTieUp(data.npc, {
						lock: item.lock,
						name: item.name,
						id: item.id,
						faction: item.faction,
						inventoryVariant: item.inventoryVariant,
					}, -1);
				KDNPCRestraintTieUp(data.npc, rrr, 1);
			} else return;

			if (!data.noInventory) {
				if (container && container[data.restraint]) {
					container[data.restraint].quantity -= 1;
					if (container[data.restraint].quantity <= 0) {
						delete container[data.restraint];
					}
				} else if (KinkyDungeonInventoryGetSafe(data.restraint)) {
					KinkyDungeonInventoryGetSafe(data.restraint).quantity =
						(KinkyDungeonInventoryGetSafe(data.restraint).quantity || 1) - 1;
						if (KinkyDungeonInventoryGetSafe(data.restraint).quantity <= 0) {
							KinkyDungeonInventoryRemoveSafe(KinkyDungeonInventoryGetSafe(data.restraint));
							KDSortInventory(KDPlayer());
						}
				}

			}
		}

		if (packed) KDPackEnemy(globalEntity);
	} else {

		let rests = KDGetNPCRestraints(data.npc);
		if (rests) {
			let restraint = rests[slot.id];
			if (KDNPCChar.get(data.npc))
				KDRefreshCharacter.set(KDNPCChar.get(data.npc), true);
			if (restraint) {
				// Add the tieup value
				KDNPCRestraintTieUp(data.npc, restraint, -1);
				let slots = restraint.id == -1
				? Object.entries(rests).filter((slt) => {
					return slt[1].id == restraint.id;
				}).map((slt) => {
					return slt[0];
				})
				: Object.entries(rests).filter((slt) => {
					return slt[1].id == restraint.id;
				}).map((slt) => {
					return slt[0];
				})
				for (let slt of slots) {
					let it = KDSetNPCRestraint(data.npc, slt, undefined);
					item = item || it;
				}

			}

		}

	}
	if (item && !data.noInventory) {
		KDReturnNPCItem(
			item, container
		);
	}

	let npcSprite = KDNPCChar.get(data.npc);
	if (npcSprite) {
		NPCTags.set(npcSprite, KinkyDungeonUpdateRestraints(npcSprite, data.npc, 0));
	}

	if (packed) KDPackEnemy(globalEntity);

	return true;
}

function KDReturnNPCItem(item: item, container?: Record<string, item>) {
	let restraint = KDRestraint(item);
		if (!item.conjured) {

			let inventoryAs = item.inventoryVariant || restraint?.inventoryAs || item.name;

			if (container) {
				if (!container[item.name]) {
					if (KinkyDungeonRestraintVariants[item.inventoryVariant || item.name]) {
						container[item.name] = KDGetInventoryVariant(KinkyDungeonRestraintVariants[item.inventoryVariant || item.name], undefined,
							KinkyDungeonRestraintVariants[item.inventoryVariant || item.name].curse, "", item.name);

					} else {
						container[item.name] = {
						name: inventoryAs,
						//curse: curse,
						id: item.id,
						type: LooseRestraint,
						//events:events,
						quantity: 1,
						showInQuickInv: KinkyDungeonRestraintVariants[item.inventoryVariant || item.name] != undefined,};
					}

				} else {
					container[item.name].quantity = (container[item.name].quantity || 1) + 1;
				}
			} else {
				if (!KinkyDungeonInventoryGetSafe(item.name)) {
					if (KinkyDungeonRestraintVariants[item.inventoryVariant || item.name]) {
						KDGiveInventoryVariant(KinkyDungeonRestraintVariants[item.inventoryVariant || item.name], undefined,
							KinkyDungeonRestraintVariants[item.inventoryVariant || item.name].curse, "", item.name);

					} else {
						KinkyDungeonInventoryAdd({
						name: inventoryAs,
						//curse: curse,
						id: item.id,
						type: LooseRestraint,
						//events:events,
						quantity: 1,
						showInQuickInv: KinkyDungeonRestraintVariants[item.inventoryVariant || item.name] != undefined,});
					}


					KDSortInventory(KDPlayer());
				} else KinkyDungeonInventoryGetSafe(item.name).quantity = (KinkyDungeonInventoryGetSafe(item.name).quantity || 1) + 1;
			}

		} else {
			if (!container)
				KinkyDungeonSendTextMessage(4, TextGet("KDConjuredRestraintVanish").replace(
					"RSTN",
					KDGetItemName(item),
				), "#5577aa", 1);
		}
}

function KDGetRestraintBondageStats(item: Named, target: entity): KDBondageStats {
	let level = Math.max(KDRestraint(item).power || 0, 1);
	let type = KDRestraintBondageType(item) || "Leather";
	let mult = KDRestraintBondageMult(item, target) || 0;
	let conditions = KDRestraintBondageConditions(item);

	return {
		level: level,
		type: type,
		mult: mult,
		amount: mult*level,
		conditions: conditions,
	};
}

/** Gets the expected total bondage amounts */
function KDGetExpectedBondageAmount(id: number, target: entity): Record<string, number> {
	if (!KDGameData.NPCRestraints) return {};
	let result : Record<string, number> = {};
	let restraints = Object.values(KDGameData.NPCRestraints[id + ""] || {});
	let already = {};
	for (let item of restraints) {
		if (!already[item.id]) {
			if (KDRestraint(item)) {
				let stats = KDGetRestraintBondageStats(item, target)
				already[item.id] = true;
				result[stats.type] = (result[stats.type] || 0) + stats.amount;
			} else if (item) {
				KinkyDungeonSendTextMessage(12, TextGet("KDErrorMods"), "#ff5555", 2, true);
			}
		}
	}
	return result;
}
/** Gets the expected total bondage amounts */
function KDGetExpectedBondageAmountTotal(id: number, target: entity, allowConjured: boolean = true): number {
	if (!KDGameData.NPCRestraints) return 0;
	let result = 0;
	let restraints = Object.values(KDGameData.NPCRestraints[id + ""] || {});
	let already = {};
	for (let item of restraints) {
		if (!already[item.id] && KDRestraint(item) && (allowConjured || !item.conjured)) {
			let stats = KDGetRestraintBondageStats(item, target)
			already[item.id] = true;
			result +=  stats.amount;
		}
	}
	return result;
}

function KDGetNPCStrugglePoints(id: number): Record<string, number> {
	let result : Record<string, number> = {};
	let enemy = KDGetGlobalEntity(id);
	let actual = enemy?.specialBoundLevel;
	let expected = KDGetExpectedBondageAmount(id, enemy);
	let expectedTotal = KDGetExpectedBondageAmountTotal(id, enemy);
	if (expected && expectedTotal > enemy.boundLevel) {
		for (let entry of Object.entries(expected)) {
			result[entry[0]] = entry[1] - (actual ? actual[entry[0]] || 0 : 0);
		}
	}

	return result;
}

function KDGetNPCEscapableRestraints(id: number, target: entity): {slot: string, inv: NPCRestraint, points: number, target: number}[] {
	let restraints = KDGetNPCRestraints(id);
	let retval: {slot: string, inv: NPCRestraint, points: number, target: number}[] = [];
	if (restraints) {
		let entries = Object.entries(restraints);
		let strugglePoints = KDGetNPCStrugglePoints(id);
		for (let entry of entries) {
			if (KDRestraint(entry[1])) {
				let stats = KDGetRestraintBondageStats(entry[1], target);
				if (strugglePoints[stats.type] >= stats.amount) {
					retval.push({slot: entry[0], inv: entry[1], points: strugglePoints[stats.type], target: stats.amount});
				}
			} else if (entry[1]) {
				KinkyDungeonSendTextMessage(12, TextGet("KDErrorMods"), "#ff5555", 2, true);
			}

		}
	}
	return retval;
}

/** Selects a restraint to struggle */
function KDNPCStruggleTick(id: number, delta: number): {slot: string, inv: NPCRestraint, points: number, target: number} {
	if (delta > 0) {
		for (let i = 0; i < delta; i++) {
			let escapable = KDGetNPCEscapableRestraints(id, KDGetGlobalEntity(id));
			if (escapable.length > 0) {
				return escapable[Math.floor(KDRandom() * escapable.length)];
			}
		}
	}
	return null;
}

/** Possible results:
 * "Remove" - removes the restraint
 * "" - default, failure
 * "Unlock" - removes lock
 */
function KDNPCDoStruggle(id: number, slot: string, restraint: NPCRestraint, chance: number): string {
	if (!chance || KDRandom() > chance) {
		return "Struggle";
	}
	if (restraint.lock) {
		restraint.lock = "";
		KDSetNPCRestraint(id, slot, restraint);
		KDUpdatePersistentNPC(id);
		return "Unlock";
	} else if (restraint) {
		restraint.lock = "";
		let item = KDSetNPCRestraint(id, slot, undefined);
		if (item && KDRestraint(item)?.inventory && !item.conjured) {
			let entity = KDGetGlobalEntity(id);
			if (entity) {
				if (!entity.items) entity.items = [];
				entity.items.push(KDRestraint(item)?.inventoryAs || item.name);
			}
		}
		KDUpdatePersistentNPC(id);
		return "Remove";
	}

	return "";
}

function KDWantsToEscape(value: KDCollectionEntry): boolean {
	return !value.status // Is prisoner
		&& (!value.Opinion || value.Opinion < 0) // Doesn't like you
		&& (!KDGetGlobalEntity(value.id) // has no entity or is unimprisoned
			|| (!KDIsImprisoned(KDGetGlobalEntity(value.id))
		))
		&& !KDIsInPartyID(value.id);
}
function KDIsOKWithRestraining(value: KDCollectionEntry): boolean {
	return (value.Opinion > 0)
		&& (
			(
				KDGameData.Collection[value.id + ""]?.personality != undefined
				&& KDLoosePersonalities.includes(KDGameData.Collection[value.id + ""]?.personality)
			)
			|| (KDIsNPCPersistent(value.id)
			&& KDGetPersistentNPC(value.id).entity
			&& KDGetPersistentNPC(value.id).entity.personality
			&& KDLoosePersonalities.includes(KDGetPersistentNPC(value.id).entity.personality))
		);
}


function KDCollectionNPCEscapeTicks(ticks: number = 10) {
	let eligibleNPCs = Object.values(KDGameData.Collection).filter((value) => {
		return KDWantsToEscape(value);
	});

	let origTick: Record<number, number> = {};



	for (let value of eligibleNPCs) {
		if (KDGetGlobalEntity(value.id)) {
			origTick[value.id] = KDGetGlobalEntity(value.id).boundLevel;
		}
		KDRunNPCEscapeTick(value.id, ticks);
	}

	let maxmsg = 10;
	let msgcount = 0;
	for (let value of eligibleNPCs) {
		if (!value.escaped) {
			if (!KDGetGlobalEntity(value.id) || !(KDGetGlobalEntity(value.id).boundLevel)) {
				// This NPC escapes!!!!
				if (value.escapegrace && KDCollHasFlag(value.id, "escapegrace")) {
					value.escaped = true;
					KinkyDungeonSendTextMessage(10, TextGet("KDNPCEscaped").replace(
						"NPC",
						value.name
					), "#ff5555", 1);
				} else {
					KDSetCollFlag(value.id, "escapegrace", -1);
					value.escapegrace = true;
					KinkyDungeonSendTextMessage(10, TextGet("KDNPCEscapeGrace").replace(
						"NPC",
						value.name
					), "#ff5555", 1);
				}

			} else {
				if ((origTick[value.id] && KDGetGlobalEntity(value.id).boundLevel < origTick[value.id]) && msgcount++ < maxmsg) KinkyDungeonSendTextMessage(10, TextGet("KDNPCStruggle").replace(
					"NPC",
					value.name
				), "#ffa1a1", 1);
				value.escapegrace = false;
			}

		}

	}
	KDSortCollection();
}

function KDRunNPCEscapeTick(id: number, ticks: number) {
	let enemy = KDGetGlobalEntity(id);
	if (enemy) {
		let returnToString = false;
		let repack = false;
		if (typeof enemy.Enemy == "string") {
			returnToString = true;
			enemy.Enemy = KinkyDungeonGetEnemyByName(enemy.Enemy);
		} else if (!enemy.Enemy.maxhp) {
			KDUnPackEnemy(enemy);
			repack = true;
		}
		if (enemy.Enemy?.tags)
			for (let i = 0; i < ticks; i++) {
				KDEnemyStruggleTurn(enemy, 1, KDNPCStruggleThreshMult(enemy), true, true);
			}
		KDUpdatePersistentNPC(id);
		if (returnToString) (enemy as any).Enemy = enemy.Enemy.name;
		else if (repack) KDPackEnemy(enemy);
	}

}

function KDNPCStruggleThreshMult(enemy: entity) {
	return 1 + KDEnemyRank(enemy) + (enemy.Enemy.tags.unstoppable ? 2 : (enemy.Enemy.tags.unflinching ? 1 : 0))
}
function KDNPCStruggleThreshMultType(enemy: enemy) {
	return 1 + KDEnemyTypeRank(enemy) + (enemy.tags.unstoppable ? 2 : (enemy.tags.unflinching ? 1 : 0))
}

function KDTriggerNPCEscape(maxNPC: number = 10) {
	let eligibleNPCs = Object.values(KDGameData.Collection).filter((value) => {
		return value.escaped && KDWantsToEscape(value);
	});

	let count = 0;
	for (let i = 0; i < maxNPC && eligibleNPCs.length > 0; i++) {
		let ind = Math.floor(KDRandom() * eligibleNPCs.length);
		let value = eligibleNPCs[ind];
		eligibleNPCs.splice(ind, 1);

		// Find an eligible point
		let point = KinkyDungeonGetRandomEnemyPoint(true, false, undefined, undefined, undefined, false);

		if (point) {
			let entity = DialogueCreateEnemy(point.x, point.y, value.type, value.id, true)
			if (entity) {
				entity.hp = entity.Enemy.maxhp;

				KDSetToExpectedBondage(entity, -1);

				KDMakeHostile(entity, 300);
				KinkyDungeonSendDialogue(entity,
					TextGet((KDHelpless(entity) ? "KinkyDungeonRemindJailPlayHelpless" : "KinkyDungeonRemindJailPlayBrat") + (KDGetEnemyPlayLine(entity) ? KDGetEnemyPlayLine(entity) : "") + Math.floor(KDRandom() * 3))
						.replace("EnemyName", TextGet("Name" + entity.Enemy.name)), KDGetColor(entity),
					Math.floor(12 + KDRandom() * 8), 10, false, true);
				count += 1;
			}
		} else break;
	}
	return count;
}

function KDNPCEscape(entity: entity) {

	let type = KinkyDungeonGetEnemyByName(KDGameData.Collection[entity.id + ""].type);
	let rep = -1*KDGetEnemyTypeRep(type, KDGameData.Collection[entity.id + ""].Faction);
	KinkyDungeonChangeFactionRep(KDGameData.Collection[entity.id + ""].Faction, rep);

	DisposeEntity(entity.id, true, false);
	KDRemoveEntity(entity, false, false, true);
}

let KDGenericMatsPerRow = 2;
let KDGenericBindsPerRow = 3;
let KDGenericBindSpacing = 75;

function KDDrawGenericNPCRestrainingUI(cats: RestraintGenericType[], x: number, y: number,
		currentItem: NPCRestraint, slot: NPCBindingSubgroup, id: number, restraints: Record<string, NPCRestraint>,
		callback: (currentItem: NPCRestraint, restraint: restraint, slot: NPCBindingSubgroup, item: item, count: number, itemtype: RestraintGenericTypeSlot) => void) {
	let XX = 0;
	let secondXX = KDGenericBindSpacing * (KDGenericMatsPerRow + 0.5);
	let YY = 0;
	let colCounter = 0;
	let index = 0;
	let selectedcat: RestraintGenericType = null;
	let highlightedItem: string = "";
	if (KDSelectedGenericRestraintType == "" && cats[0])
		KDSelectedGenericRestraintType = cats[0].raw || cats[0].consumableRaw;
	let iin = index;
	for (let cat of cats) {
		let selected = (cat.raw || cat.consumableRaw) == KDSelectedGenericRestraintType;
		if (selected) selectedcat = cat;
		let hotkey: string = "";
		if ((cats[index+1]?.raw || cats[index+1]?.consumableRaw) == KDSelectedGenericRestraintType) {
			hotkey = KinkyDungeonKey[1];
		} else
		if ((cats[index-1]?.raw || cats[index-1]?.consumableRaw) == KDSelectedGenericRestraintType) {
			hotkey = KinkyDungeonKey[3];
		}
		let preview = (cat.raw) ?
			KDGetRestraintPreviewImage(KDRestraint({name: cat.raw}))
			: KinkyDungeonRootDirectory + "Items/" + cat.consumableRaw + ".png";
		let inventoryItem = KinkyDungeonInventoryGetSafe(cat.raw || cat.consumableRaw);
		DrawTextFitKD("" + (inventoryItem?.quantity || 0),
		x + XX + 32, y + YY + 60, 72, "#ffffff", KDTextGray0, 18, "left", 160);
		if (KDSelectedGenericRestraintType == (cat.raw || cat.consumableRaw)) iin = index;
		if (DrawButtonKDExScroll(
			"res_gen_list" + (cat.raw || cat.consumableRaw),
			(amount: number) => {
				if (amount < 0) {
					if (cats[iin-1]) {
						KDSelectedGenericRestraintType = (cats[iin-1].raw || cats[iin-1].consumableRaw);
					}
				} else {
					if (cats[iin+1]) {
						KDSelectedGenericRestraintType = (cats[iin+1].raw || cats[iin+1].consumableRaw);
					}
				}
			},
			() => {
				if (KDSelectedGenericRestraintType != (cat.raw || cat.consumableRaw)) {
					KDSelectedGenericRestraintType = (cat.raw || cat.consumableRaw);
					KDSelectedGenericBindItem = "";
				} else if (KDSelectedGenericRestraintType == (cat.raw || cat.consumableRaw)) KDSelectedGenericRestraintType = "";
				return true;
			}, true,

			x + XX + 32, y + YY, 72, 72, "",
			"#ffffff", preview,
			undefined, false, !selected, KDButtonColor, undefined, true,
			{
				scaleImage: true,
				centered: true,
				hotkey: hotkey ? KDHotkeyToText(hotkey) : undefined,
				hotkeyPress: hotkey,
			}
		)) {
			DrawTextFitKD(TextGet("KDCurrentItemRaw")
				+ KDGetItemNameString(cat.raw || cat.consumableRaw),
			x + secondXX + KDGenericBindSpacing, 180, 500, "#ffffff", KDTextGray1,
			36, "center"
			);
			highlightedItem = "Null";
		}
		colCounter++;
		if (colCounter >= KDGenericMatsPerRow) {
			colCounter = 0;
			XX = 0;
			YY += KDGenericBindSpacing;
		} else {
			XX += KDGenericBindSpacing;
		}
		index++;
	}

	YY = 0;
	colCounter = 0;
	XX = secondXX;


	if (!KDNPCBindingSelectedSlot) {
		DrawTextFitKD(
			TextGet("KDSelectABindingSlot"),
			x + secondXX,
			y + 200,
			2 * secondXX,
			"#ffffff", KDTextGray0
		);
	} else if (selectedcat) {
		let quantity = KinkyDungeonInventoryGetSafe(selectedcat.raw || selectedcat.consumableRaw)?.quantity;
		index = 0;
		let items = selectedcat.items.filter(
			(item) => {
				return slot.allowedGroups.includes(KDRestraint({name: item.restraint})?.Group)
				&& slot.allowedTags.some((tag) => {return KDRestraint({name: item.restraint})?.shrine.includes(tag);});
			}
		);
		let ii = 0;

		let npc = KinkyDungeonFindID(id);

		for (let item of items) {

			let rst = KDRestraint({name: item.restraint});

			let img = KDGetRestraintPreviewImage(rst);

			let grp = KDGetGroupPreviewImage(rst.Group);

			if (!KDSelectedGenericBindItem) KDSelectedGenericBindItem = item.restraint;

			let selected = item.restraint == KDSelectedGenericBindItem;
			//if (selected) highlightedItem = item.restraint;
			let hotkey: string = "";
			if (items[index+1]?.restraint == KDSelectedGenericBindItem) {
				hotkey = KinkyDungeonKey[6];
			} else
			if (items[index-1]?.restraint == KDSelectedGenericBindItem) {
				hotkey = KinkyDungeonKey[7];
			} else
			if (items[index]?.restraint == KDSelectedGenericBindItem) {
				hotkey = KinkyDungeonKeyEnter[0];
			}
			//let inventoryItem = KinkyDungeonInventoryGetSafe(item.restraint);
			//if (inventoryItem)
			DrawTextFitKD(TextGet("KDCost") + (item.count),
			x + XX + 32, y + YY + 60, 72, "#ffffff", KDTextGray0, 18, "left", 160);
			if (KDSelectedGenericBindItem == item.restraint) ii = index;
			if (DrawButtonKDExScroll(
				"gen_bind_list" + item.restraint,
				(amount: number) => {
					if (amount < 0) {
						if (items[ii-1]) {
							KDSelectedGenericBindItem = items[ii-1].restraint;
						}
					} else {
						if (items[ii+1]) {
							KDSelectedGenericBindItem = items[ii+1].restraint;
						}
					}
				},
				() => {
					if (KDSelectedGenericBindItem != item.restraint)
						KDSelectedGenericBindItem = item.restraint;
					else if (quantity >= item.count) {
						callback(currentItem, KDRestraint({name: item.restraint}), KDNPCBindingSelectedSlot,
						KinkyDungeonInventoryGetSafe(selectedcat.raw || selectedcat.consumableRaw), item.count, item);
					}
					return true;
				}, true,

				x + XX + 32, y + YY, 72, 72, "",
				"#ffffff", img,
				undefined, false, !selected,
				npc ?
				(KDCanApplyBondage(npc, KDPlayer(),
						rst?.quickBindCondition ?
						(t, p) => (KDQuickBindConditions[rst?.quickBindCondition](
							t, p,
							rst,
							null)) : undefined) ? "#63ab3f" : "#f0b541")
				: KDButtonColor,
				undefined, true,
				{
					scaleImage: true,
					centered: true,
					hotkey: hotkey ? KDHotkeyToText(hotkey) : undefined,
					hotkeyPress: hotkey,
				}
			) || (!highlightedItem && KDSelectedGenericBindItem == item.restraint)) {
				if (!highlightedItem) {
					DrawTextFitKD(TextGet(KDSelectedGenericBindItem == item.restraint ? "KDCurrentItem2" : "KDCurrentItem3")
					+ KDGetItemNameString(item.restraint),
					x + secondXX + KDGenericBindSpacing, 180, 500, "#ffffff", KDTextGray1,
					36, "center"
					);
					highlightedItem = item.restraint;
				}

			}

			if (grp) {
				KDDraw(kdcanvas, kdpixisprites, "gen_bind_list_grp" + item.restraint,
					grp,
					x + XX + 32, y + YY, 72, 72,
				);
			}
			colCounter++;
			if (colCounter >= KDGenericBindsPerRow) {
				colCounter = 0;
				XX = secondXX;
				YY += KDGenericBindSpacing;
			} else {
				XX += KDGenericBindSpacing;
			}
			index++;
		}

	}
}
