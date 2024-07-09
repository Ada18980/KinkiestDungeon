let KDNPCBindingSelectedSlot: NPCBindingSubgroup = null;

interface NPCRestraint {
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

function KDDrawNPCRestrain(restraints: Record<string, NPCRestraint>, x: number, y: number) {
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
					KDNPCBindingSelectedSlot = sgroup;
					KinkyDungeonCurrentPageInventory = 0;
					return true;
				}, true,
				XX, YY,
				wid, wid, "", "#ffffff",
				preview, undefined, undefined,
				KDNPCBindingSelectedSlot?.id != sgroup.id,
				KDButtonColor,
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


		let ss = KDDrawInventoryContainer(-165, 100, filteredInventory, filter, filter, (inv, x, y, w, h) => {

		}, (inv) => {

			return KDTextGray1;
		});

		if (currentItem) {
			DrawTextFitKD(TextGet("KDCurrentItem") + KDGetItemNameString(currentItem.name),
			x + 600, 140, 400, "#ffffff", KDTextGray1,
			36, "center"
			);
		}

		if (ss.tooltipitem) {
			DrawTextFitKD(TextGet("KDCurrentItem2") + KDGetItemName(ss.tooltipitem.item),
			x + 600, 175, 400, "#ffffff", KDTextGray1,
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