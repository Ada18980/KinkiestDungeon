
let KDStairsAltAction = {
	"RandomTeleport": (_toTile, _suppressCheckPoint) => {
		// Delete the stairs and teleport the player to a random location on another set of stairs
		KinkyDungeonMapSet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, '2');
		delete KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).AltStairAction;
		let point = KinkyDungeonGetRandomEnemyPointCriteria((x: number, y: number) => {
			return KinkyDungeonMapGet(x, y) == 's'
				&& KinkyDungeonTilesGet(x + "," + y)?.AltStairAction == "RandomTeleport";
		}, false, false, undefined, undefined, undefined, true);
		if (point) {
			KDMovePlayer(point.x, point.y, false);
			KinkyDungeonMapSet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, '2');
			delete KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).AltStairAction;

			KinkyDungeonSendTextMessage(10, TextGet("KDRandomStairTeleport"), KDBaseRed, 5);
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Teleport.ogg");
		} else {
			KinkyDungeonSendTextMessage(10, TextGet("KDRandomStairTeleportFail"), KDBaseRed, 5);
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Teleport.ogg");
		}
	},
	"Null": (_toTile, _suppressCheckPoint) => {
		// Beep
	}
};


function KDGoThruTile(x: number, y: number, suppressCheckPoint: boolean, force: boolean, willing: boolean, forceInstant = false) {

	// Prune inventory
	KDPruneInventoryVariants(true, true, true);

	KDTickAutorelease();

	KDExploreStairs(x, y);
	let toTile = KinkyDungeonMapGet(x, y);
	if (!KDAdvanceAmount[toTile]) toTile = 'H';
	let tile = KinkyDungeonTilesGet(x + "," + y);
	let altRoom = KDGameData.RoomType ? KinkyDungeonAltFloor(KDGameData.RoomType) : KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel);
	let altRoomTarget = (tile && tile.RoomType) ? KinkyDungeonAltFloor(tile.RoomType) : null;
	let Advance = KDAdvanceAmount[toTile](altRoom, null, tile);
	let AdvanceAmount = Advance.AdvanceAmount;

	let journeyTile = KDGameData.JourneyTarget && KDGameData.UseJourneyTarget ? KDGameData.JourneyMap[KDGameData.JourneyTarget.x + ',' + KDGameData.JourneyTarget.y]
		: KDGameData.JourneyMap[KDGameData.JourneyX + ',' + (KDGameData.JourneyY + AdvanceAmount)];
	let originalRoom = KDGameData.RoomType;

	if (!altRoomTarget && !(tile && tile.RoomType)) {
		altRoomTarget = (KinkyDungeonAltFloor(journeyTile?.RoomType));
	}
	Advance = KDAdvanceAmount[toTile](altRoom, altRoomTarget, tile);
	AdvanceAmount = Advance.AdvanceAmount;

	let data = {
		roomType: "",
		CurrentJourneyTile: KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY],
		JourneyTile: journeyTile,
		altRoom: altRoom,
		altRoomTarget: altRoomTarget,
		tile: tile,
		AdvanceAmount: AdvanceAmount,
		Xdelta: toTile != 'H' ? (tile?.Xdelta || 0) : (tile?.Xdelta || 0), // TODO allow maneuvering around the world map
		toTile: toTile,
		overrideRoomType: false,
		overrideProgression: false,
		overrideJourney: false,
		mapMod: KinkyDungeonTilesGet(x + "," + y)?.MapMod,
		faction: KinkyDungeonTilesGet(x + "," + y)?.Faction,
		escapeMethod: KinkyDungeonTilesGet(x + "," + y)?.EscapeMethod,
		cancelevent: "",
		cancelfilter: tile?.CancelFilter,
		SideRoom: tile?.SideRoom,
		ShortcutIndex: tile?.ShortcutIndex,
		force: force,
		willing: willing,
	};

	if (Advance.dataOverride) {
		Object.assign(data, Advance.dataOverride);
	}



	KinkyDungeonSendEvent("beforeStairCancelFilter", data);
	if (data.cancelfilter) {
		if (data.cancelfilter && KDCancelFilters[data.cancelfilter]) {
			data.cancelevent = KDCancelFilters[data.cancelfilter](x, y, tile, data);
		}
	}
	KinkyDungeonSendEvent("beforeStairCancel", data);
	if (data.cancelevent) {
		if (KDCancelEvents[data.cancelevent]) {
			KDCancelEvents[data.cancelevent](x, y, tile, data);
		}
	} else {

		let newLocation = KDAdvanceLevel(data, MiniGameKinkyDungeonLevel + data.AdvanceAmount > KDGameData.HighestLevelCurrent,
			true
		);

		let location = KDWorldMap[newLocation.x + "," + newLocation.y];



		KDGenMapCallback = () => {

			if (altRoom?.onExit) altRoom.onExit(data); // Handle any special contitions
			KinkyDungeonSendEvent("beforeHandleStairs", data);

			if (MiniGameKinkyDungeonLevel > Math.max(KinkyDungeonRep, ReputationGet("Gaming")) || Math.max(KinkyDungeonRep, ReputationGet("Gaming")) > KinkyDungeonMaxLevel) {
				KinkyDungeonRep = Math.max(KinkyDungeonRep, MiniGameKinkyDungeonLevel);
				DialogSetReputation("Gaming", KinkyDungeonRep);
			}
			MiniGameVictory = false;

			if (altRoom?.alwaysRegen
				|| altRoom?.removePartyMembers
				|| (altRoom && !(altRoom?.makeMain || altRoom?.persist))) {
				// Clear all enemies and remove them so that we pick up allies
				for (let en of [...KDMapData.Entities]) {
					if (!KDCanBringAlly(en))
						KDRemoveEntity(en, false, true, true);
				}
			}

			newLocation = KDAdvanceLevel(data, MiniGameKinkyDungeonLevel + data.AdvanceAmount > KDGameData.HighestLevelCurrent); // Advance anyway


			// We increment the save, etc, after the tunnel
			if (MiniGameKinkyDungeonLevel > KDGameData.HighestLevelCurrent) {
				if (!data.overrideProgression) {
					if (KDGameData.PriorJailbreaks > 0) KDGameData.PriorJailbreaksDecay = (KDGameData.PriorJailbreaksDecay + 1) || 1;

					if (MiniGameKinkyDungeonLevel > 1) {
						
						KDAdvanceOneFloor();
					}

					if (MiniGameKinkyDungeonLevel >= KinkyDungeonMaxLevel) {
						KDSetWorldSlot(0, 0, 0, 0);
						KinkyDungeonState = "End";
						KinkyDungeonClassModeChoice = "";
						MiniGameVictory = true;
						suppressCheckPoint = true;
					}
				}
			}
			if (!data.overrideRoomType) {
				if (tile?.RoomType != undefined) {
					data.roomType = tile.RoomType || altRoomTarget?.name || "";
					data.mapMod = tile.MapMod || "";
					data.faction = tile.Faction || altRoomTarget?.faction || KDPersonalAlt[tile.RoomType]?.OwnerFaction || "";
					KDGameData.MapMod = ""; // Reset the map mod
				} else {
					// If its an exit stair in the main, we override to the main of next floor
					// The player can never backtrack to old perk rooms
					data.mapMod = data.mapMod || journeyTile?.MapMod || "";
					data.faction = data.faction || journeyTile?.Faction || "";
					data.escapeMethod = data.escapeMethod || journeyTile?.EscapeMethod || "";

					data.roomType = data.JourneyTile?.RoomType || "";
					altRoomTarget = KinkyDungeonAltFloor(data.roomType);
					
				}
			}
			let movedUp = MiniGameKinkyDungeonLevel > KDGameData.HighestLevelCurrent;
			KDGameData.HighestLevelCurrent = Math.max(KDGameData.HighestLevelCurrent || 1, MiniGameKinkyDungeonLevel);
			KDGameData.HighestLevel = Math.max(KDGameData.HighestLevel || 1, MiniGameKinkyDungeonLevel);
			

			//if (KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)) {
			let MapMod = data.mapMod;
			if (MapMod) {
				KDGameData.MapMod = MapMod;
				//KDMapData.MapFaction = KDMapMods[KDGameData.MapMod].faction || "";
				data.faction = KDMapMods[KDGameData.MapMod]?.faction || data.faction || "";
			} else {
				KDGameData.MapMod = "";
				//KDMapData.MapFaction = "";
				//data.faction = "";
			}

			if (!data.overrideJourney) {
				let Journey = KinkyDungeonTilesGet(x + "," + y)?.Journey;
				if (Journey != undefined) {
					KDGameData.Journey = Journey;
					KDInitializeJourney(KDGameData.Journey, MiniGameKinkyDungeonLevel);
				}
			}


			if (!data.overrideRoomType) {
				let RoomType = KinkyDungeonTilesGet(x + "," + y)?.RoomType
					|| data.JourneyTile?.RoomType;
				if (RoomType) {
					data.roomType = RoomType;
				}
			}

			KDGameData.RoomType = data.roomType || "";


			KinkyDungeonSendActionMessage(10, TextGet("ClimbDown" + toTile), KDBaseWhite, 1);
			if (toTile == 's') {
				KinkyDungeonSetCheckPoint((KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY]?.Checkpoint || 'grv'), true, suppressCheckPoint);
			}



			if (KinkyDungeonState != "End") {
				KinkyDungeonSendEvent("afterHandleStairs", {
					toTile: toTile,
				});
				KDGameData.HeartTaken = false;

				KinkyDungeonCreateMap(KinkyDungeonMapParams[altRoomTarget?.useGenParams ? altRoomTarget.useGenParams : (KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY]?.Checkpoint || 'grv')],
					KDGameData.RoomType, KDGameData.MapMod, MiniGameKinkyDungeonLevel, undefined, undefined,
					data.faction, newLocation,
					!altRoomTarget || !altRoomTarget.alwaysRegen,
					// If this is a sideroom, its actually the main that is the upstairs
					(data.JourneyTile?.SideRooms?.includes(KDGameData.RoomType)) ?
						KDGetWorldMapLocation(newLocation)?.main || ""
						: (altRoom?.persist ?
						originalRoom :
						(KDGetWorldMapLocation(newLocation)?.main || data.JourneyTile?.RoomType || "")),
					AdvanceAmount > 0
						? (0)
						: (toTile == 'S' ? 1 : (
							altRoomTarget?.nostartstairs && !altRoomTarget?.startatstartpos ? 1 : 0
						)),
					data.escapeMethod);

				if (data.ShortcutIndex >= 0) {
					KDGameData.ShortcutIndex = data.ShortcutIndex;
				} else {
					KDGameData.ShortcutIndex = KDGameData.RoomType;
				}
				if (altRoom?.afterExit) altRoom.afterExit(data); // Handle any special contitions
				KinkyDungeonSendEvent("AfterAdvance", data);
				KDPostStairSave();
				KDSendStatus('nextLevel');
			} else {
				KDSendStatus('end');
			}
			return "Game";
		};




		if (!forceInstant && MiniGameKinkyDungeonLevel < KinkyDungeonMaxLevel - 1
			&& !((!altRoomTarget || !altRoomTarget.alwaysRegen)
			&& (location?.data[KDGameData.RoomType])))
			KinkyDungeonState = "GenMap";
		else {
			KDGenMapCallback();
			KDGenMapCallback = null;
		}
	}

}


function KDPostStairSave() {
	if (KDGameData.RoomType == "PerkRoom" && MiniGameKinkyDungeonLevel >= 1) { //  && Math.floor(MiniGameKinkyDungeonLevel / 3) == MiniGameKinkyDungeonLevel / 3
			if ((!KinkyDungeonStatsChoice.get("saveMode"))) {
				let saveData = LZString.compressToBase64(JSON.stringify(KinkyDungeonSaveGame(true)));
				KinkyDungeonState = "Save";
				KDTextArea("saveDataField", 750, 100, 1000, 230);
				ElementValue("saveDataField", saveData);
			} else KinkyDungeonSaveGame();
		}
		else KinkyDungeonSaveGame();
 }
function KinkyDungeonHandleStairs(toTile: string, suppressCheckPoint?: boolean) {
	if (KinkyDungeonFlags.get("stairslocked")) {
		KinkyDungeonSendActionMessage(10, TextGet("KDStairsLocked").replace("NMB", "" + KinkyDungeonFlags.get("stairslocked")), KDBaseWhite, 1);
	} else

	if ((toTile == 's' || (toTile == 'S' && KDGetAltType(MiniGameKinkyDungeonLevel)?.noLeave)) && !KDCanEscape(KDGetEscapeMethod(MiniGameKinkyDungeonLevel))) {
		KinkyDungeonSendActionMessage(10, KDGetEscapeDoorText(KDGetEscapeMethod(MiniGameKinkyDungeonLevel)), KDBaseWhite, 1);
	}
	else if (KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.AltStairAction) {
		KDStairsAltAction[KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).AltStairAction](toTile, suppressCheckPoint);
	}
	else {
		if (!KDPlayer().leash) {
			KDGoThruTile(KDPlayer().x, KDPlayer().y, suppressCheckPoint, false, true);
		} else {
			KinkyDungeonSendActionMessage(10, TextGet("ClimbDownFail"), KDBaseWhite, 1);
		}
	}
}
