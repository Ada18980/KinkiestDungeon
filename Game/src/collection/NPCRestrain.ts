let KDNPCBindingSelectedSlot: NPCBindingSubgroup = null;
let KDNPCBindingSelectedRow: NPCBindingGroup = null;

interface NPCRestraint extends Named {
	name: string,
	lock: string,
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
				let prevData = KDGetRestraintPreviewImage(r);
				if (prevData) {
					preview = prevData;
				}

			}
			let wid = II == 0 ? 56 : 42;
			if (DrawButtonKDEx(
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
							lock: "",
							npc: npcID,
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
			)) tooltip = sgroup.id;


			if (II++ == 0) {
				if (grp) {
					KDDraw(kdcanvas, kdpixisprites, "npc_bind_list_grp" + sgroup.id,
						grp,
						XX - Math.floor(wid*0.25), YY - Math.floor(wid*0.25), Math.ceil(wid*1), Math.ceil(wid*1),
						undefined, {
							zIndex: 160,
						}
					);
				}
				XX += paddingFirstCol;

			} else {
				if (grp) {
					KDDraw(kdcanvas, kdpixisprites, "npc_bind_list_grp" + sgroup.id,
						grp,
						XX, YY, wid, wid,
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

	if (KDNPCBindingSelectedSlot) {
		let currentItem = restraints[KDNPCBindingSelectedSlot.id];
		let slot = KDNPCBindingSelectedSlot;
		let groups = slot.allowedGroups;
		let filter = LooseRestraint;
		let filteredInventory = KinkyDungeonFilterInventory(filter, undefined, undefined, undefined, undefined, KDInvFilter);

		filteredInventory = filteredInventory.filter((inv) => {
			return groups.includes(KDRestraint(inv.item)?.Group)
				&& slot.allowedTags.some((tag) => {return KDRestraint(inv.item)?.shrine.includes(tag);});
		})


		let ss = KDDrawInventoryContainer(-165, 100, filteredInventory, filter, filter,
			(inv: KDFilteredInventoryItem, x, y, w, h) => {
			if (restraints[slot.id]?.name == inv.item.name) {
				KDSendInput("addNPCRestraint", {
					slot: slot.id,
					id: -1,
					restraint: "",
					lock: "",
					npc: npcID,
				});
			} else {
				KDSendInput("addNPCRestraint", {
					slot: slot.id,
					id: inv.item.id,
					restraint: inv.item.name,
					lock: "White",
					npc: npcID,
				});
			}
		}, (inv) => {
			if (KDRowItemIsValid(KDRestraint(inv.item), KDNPCBindingSelectedSlot, KDNPCBindingSelectedRow))
				return KDTextGray1;
			return "#e64539"
		});

		if (currentItem) {
			DrawTextFitKD(TextGet("KDCurrentItem") + KDGetItemNameString(currentItem.name),
			x + 620, 60, 400, "#ffffff", KDTextGray1,
			36, "center"
			);
		}

		if (ss.tooltipitem) {
			DrawTextFitKD(TextGet("KDCurrentItem2") + KDGetItemName(ss.tooltipitem.item),
			x + 620, 115, 400, "#ffffff", KDTextGray1,
			36, "center"
			);
		}
		// TODO add properties
	}
}

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
}
function KDSetNPCRestraint(id: number, slot: string, restraint: NPCRestraint): item {
	if (!KDGameData.NPCRestraints)
		KDGameData.NPCRestraints = {};
	let item: item = null;
	let restraints = KDGetNPCRestraints(id);
	if (restraints[slot]) {
		item = {
			name: restraints[slot].name,
			//curse: curse,
			id: KinkyDungeonGetItemID(),
			type: LooseRestraint,
			//events:events,
			quantity: 1,
			showInQuickInv: KinkyDungeonRestraintVariants[restraints[slot].name] != undefined};
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

function KDRowItemIsValid(restraint: restraint, sgroup: NPCBindingSubgroup, row: NPCBindingGroup): boolean {
	let group = restraint.Group;

	if (
		sgroup.allowedGroups.includes(group)
	) {
		let tags = restraint.shrine;
		if (tags.some((tag) => {
			return sgroup.allowedTags.includes(tag);
		})) {
			let size = 1;
			if (sgroup.id != row.encaseGroup.id)
				tags.forEach((tag) => {
					size = Math.max(size, NPCBindingRestraintSize[tag] || 1);
				})
			if (size == 1 ||
				(
					size <=
						row.layers.filter((sg) => {
							return sg.id == sgroup.id ||
								(
									sg.allowedGroups.includes(group)
									&& tags.some((tag) => {
										return sgroup.allowedTags.includes(tag);
									})
								)
						}).length
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

