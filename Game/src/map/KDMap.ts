
function KDGetMapData(coord: WorldCoord): KDMapDataType {
	let slot = KDGetWorldMapLocation({x: coord.mapX, y: coord.mapY});
	if (slot) {
		let data = slot.data[coord.room];
		return data;
	}
	return null;
}



function KDCoordToPoint(coord: {mapX: number, mapY: number}): KDPoint {
	return {
		x: coord.mapX != undefined ? coord.mapX : 0,
		y: coord.mapY != undefined ? coord.mapY : MiniGameKinkyDungeonLevel,
	}
}

function KDGetEntrancePoints(map: WorldCoord,
	includeShortcuts: boolean = true,
	includeStart: boolean = true,
	includeEnd: boolean = true): Record<string, KDPoint> {
		let slot = KDGetWorldMapLocation(KDCoordToPoint(map));
		if (slot) {
			let data = KDGetMapData(map);
			let entrances: Record<string, KDPoint> = {};
			if (data.UsedEntrances) {
				for (let entrance of Object.entries(data.UsedEntrances)) {
					entrances[entrance[0]] = entrance[1];
				}
			}
			if (data) {
				if (includeShortcuts) {
					for (let shortcut of Object.entries(data.ShortcutPositions || [])) {
						if (!entrances[shortcut[0]]) {
							entrances[shortcut[0]] = shortcut[1];
						}
					}
				}
				if (includeStart) {
					let exit = KDGetNearestExit(data.StartPosition.x, data.StartPosition.y, data, false);
					if (exit?.x == data.StartPosition.x && exit?.y == data.StartPosition.y) {
						let tile = KinkyDungeonTilesGet(exit.x + ',' + exit.y)
						if (tile?.RoomType) {
							entrances[tile.RoomType] = data.StartPosition;
						} else {
							// Infer the room
							if (data.RoomType == slot.main) {
								entrances["PREV"] = data.StartPosition;
							} else {
								entrances[slot.main || ""] = data.StartPosition;
							}
						}
					}
				}
				if (includeEnd) {
					let exit = KDGetNearestExit(data.EndPosition.x, data.EndPosition.y, data, false);
					if (exit?.x == data.EndPosition.x && exit?.y == data.EndPosition.y) {
						let tile = KinkyDungeonTilesGet(exit.x + ',' + exit.y)
						if (tile?.RoomType) {
							entrances[tile.RoomType] = data.EndPosition;
						} else {
							// Infer the room
							if (data.RoomType == slot.main) {
								entrances["NEXT"] = data.EndPosition;
							} else {
								entrances[slot.main || ""] = data.EndPosition;
							}
						}
					}
				}
			}

			return entrances;
		}

		return {};
	}

function KDGetEntrancesInRoom(map: WorldCoord,
	includePotential: boolean = true,
	includeShortcuts: boolean = true,
	includeStart: boolean = true,
	includeEnd: boolean = true): Record<string, boolean> {
	let slot = KDGetWorldMapLocation(KDCoordToPoint(map));
	if (slot) {
		let data = KDGetMapData(map);
		let entrances: Record<string, boolean> = {};
		if (data.UsedEntrances) {
			for (let entrance of Object.keys(data.UsedEntrances)) {
				entrances[entrance] = true;
			}
		}
		if (includePotential) {
			for (let dataEntrance of ((slot.lairsToPlace || {})[map.room] || [])) {
				if (!entrances[dataEntrance]) entrances[dataEntrance] = true;
			}
		}
		if (data) {
			if (includeShortcuts) {
				for (let shortcut of Object.entries(data.ShortcutPositions || [])) {
					if (!entrances[shortcut[0]]) {
						entrances[shortcut[0]] = true;
					}
				}
			}
			if (includeStart) {
				let exit = KDGetNearestExit(data.StartPosition.x, data.StartPosition.y, data, false);
				if (exit?.x == data.StartPosition.x && exit?.y == data.StartPosition.y) {
					let tile = KinkyDungeonTilesGet(exit.x + ',' + exit.y)
					if (tile?.RoomType) {
						entrances[tile.RoomType] = true;
					} else {
						// Infer the room
						if (data.RoomType == slot.main) {
							entrances["PREV"] = true;
						} else {
							entrances[slot.main || ""] = true;
						}
					}
				}
			}
			if (includeEnd) {
				let exit = KDGetNearestExit(data.EndPosition.x, data.EndPosition.y, data, false);
				if (exit?.x == data.EndPosition.x && exit?.y == data.EndPosition.y) {
					let tile = KinkyDungeonTilesGet(exit.x + ',' + exit.y)
					if (tile?.RoomType) {
						entrances[tile.RoomType] = true;
					} else {
						// Infer the room
						if (data.RoomType == slot.main) {
							entrances["NEXT"] = true;
						} else {
							entrances[slot.main || ""] = true;
						}
					}
				}
			}
		}

		return entrances;
	}

	return {};
}