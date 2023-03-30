"use strict";

/**
 * Sends a multiplayer update, trimming off stuff that doesnt need to get sent yet
 * @returns {void}
 */
function KinkyDungeonMultiplayerUpdate(Delay) {
	if (KinkyDungeonIsPlayer() && ChatRoomCharacter && ChatRoomCharacter.length > 1 && DialogGamingPreviousRoom == "ChatRoom" && KinkyDungeonNextDataSendTime + Delay < CommonTime()) {
		let MN = [];

		for (let C = 0; C < ChatRoomCharacter.length; C++) {
			let Char = ChatRoomCharacter[C];

			if (KinkyDungeonStreamingPlayers.includes(Char.MemberNumber) && Char.ID != 0 && Char.Effect.includes("VR")) MN.push(Char.MemberNumber);
		}

		if (MN.length > 0) {
			let data = KinkyDungeonPackData(KinkyDungeonGrid_Last != KinkyDungeonGrid, true, KinkyDungeonMultiplayerInventoryFlag, CommonTime() > KinkyDungeonNextDataSendStatsTime + KinkyDungeonNextDataSendStatsTimeDelay);
			KinkyDungeonSendData(data);
		}

		KinkyDungeonNextDataSendTime = CommonTime();

		if (CommonTime() > KinkyDungeonNextDataSendStatsTime + KinkyDungeonNextDataSendStatsTimeDelay) KinkyDungeonNextDataSendStatsTime = CommonTime();
		KinkyDungeonGrid_Last = KinkyDungeonGrid;
		KinkyDungeonMultiplayerInventoryFlag = false;
	}
}



/**
 * Converts a string into Kinky Game Data
 * @returns {void}
 */
function KinkyDungeonUnpackData(KinkyData) {
	if (CurrentScreen != "KinkyDungeon" || KinkyDungeonState != "Game" || !KinkyDungeonPlayerCharacter) return;
	if (KinkyDungeonIsPlayer()) return; // Prevent griefing
	let data = JSON.parse(LZString.decompressFromBase64(KinkyData));

	if (!KinkyDungeonGameData) KinkyDungeonGameData = {};

	if (!data) return;

	if (data.enemies != null) {
		KinkyDungeonGameData.enemies = data.enemies;
	}
	if (data.items != null) {
		KinkyDungeonGameData.items = data.items;
	}
	if (data.bullets != null) {
		KinkyDungeonGameData.bullets = data.bullets;
	}
	if (data.map != null) {
		KinkyDungeonGameData.map = data.map;
	}
	if (data.inventory != null) {
		KinkyDungeonGameData.inventory = data.inventory;
	}
	if (data.meta != null) {
		KinkyDungeonGameData.meta = data.meta;
	}

	KinkyDungeonUpdateFromData();
	KinkyDungeonNextDataLastTimeReceived = CommonTime();
}

function KinkyDungeonUpdateFromData() {
	if (KinkyDungeonGameData.map == null ||
		KinkyDungeonGameData.inventory == null ||
		KinkyDungeonGameData.bullets == null ||
		KinkyDungeonGameData.items == null ||
		KinkyDungeonGameData.enemies == null) {
		KinkyDungeonGameData = null; // We need the full data before rendering anything!
		return false;
	}
	if (KinkyDungeonGameData.enemies) {
		KinkyDungeonEntities = [];
		KDUpdateEnemyCache = true;
		let enemies = JSON.parse(KinkyDungeonGameData.enemies);

		for (let N = 0; N < enemies.length; N++) {
			let enemy = enemies[N].split('/');
			let i = 1;
			// @ts-ignore
			KDAddEntity({Enemy: {name: enemy[i++]}, stun: enemy[i++], x:enemy[i++], y:enemy[i++]}); // Push the enemy
		}
	}
	if (KinkyDungeonGameData.inventory) {
		KDInitInventory();
		// TODO fix this...
		let inventory = JSON.parse(KinkyDungeonGameData.inventory);

		CharacterReleaseTotal(KinkyDungeonPlayer);

		if (typeof inventory !== "string")
			for (let N = 0; N < inventory.length; N++) {
				let item = inventory[N].split('/');
				if (item.length > 1) {
					let i = 1;
					let restraint = KinkyDungeonGetRestraintByName(item[i++]);
					KinkyDungeonAddRestraint(restraint, 0, true); // Add the item
					let createdrestraint = KinkyDungeonGetRestraintItem(restraint.Group);
					if (createdrestraint)
						createdrestraint.lock = undefined; // Lock if applicable
				}
			}
		KinkyDungeonUpdateStats(0);
		KinkyDungeonDressPlayer();
	}

	if (KinkyDungeonGameData.bullets) {
		KinkyDungeonBullets = [];
		let bullets = JSON.parse(KinkyDungeonGameData.bullets);

		for (let N = 0; N < bullets.length; N++) {
			let bullet = bullets[N].split('/');
			let i = 1;
			let name = bullet[i++];
			KinkyDungeonBullets.push({spriteID:name + CommonTime(), x:bullet[i], xx:bullet[i++], y:bullet[i], yy:bullet[i++], vx:bullet[i++], vy:bullet[i++],
				bullet:{name: name, width:bullet[i++], height:bullet[i++]}});
		}
	}
	if (KinkyDungeonGameData.items) {
		KinkyDungeonGroundItems = [];
		let items = JSON.parse(KinkyDungeonGameData.items);

		for (let N = 0; N < items.length; N++) {
			let item = items[N].split('/');
			let i = 1;
			KinkyDungeonGroundItems.push({name:item[i++], x:item[i++], y:item[i++]});
		}
	}

	if (KinkyDungeonGameData.map)
		KinkyDungeonGrid = KinkyDungeonGameData.map;
	if (KinkyDungeonGameData.meta) {
		KinkyDungeonUpdateLightGrid = true;

		KinkyDungeonGridWidth = Math.round(KinkyDungeonGameData.meta.w);
		KinkyDungeonGridHeight = Math.round(KinkyDungeonGameData.meta.h);
		KinkyDungeonPlayerEntity.x = Math.round(KinkyDungeonGameData.meta.x);
		KinkyDungeonPlayerEntity.y = Math.round(KinkyDungeonGameData.meta.y);

		if (KinkyDungeonGameData.meta.sp != null) KinkyDungeonStatStamina = Math.round(KinkyDungeonGameData.meta.sp);
		if (KinkyDungeonGameData.meta.mp != null) KinkyDungeonStatMana = Math.round(KinkyDungeonGameData.meta.mp);
		if (KinkyDungeonGameData.meta.ap != null) KinkyDungeonStatDistraction = Math.round(KinkyDungeonGameData.meta.ap);
		if (KinkyDungeonGameData.meta.rk != null) KinkyDungeonRedKeys = Math.round(KinkyDungeonGameData.meta.rk);
		if (KinkyDungeonGameData.meta.bk != null) KinkyDungeonBlueKeys = Math.round(KinkyDungeonGameData.meta.bk);
		if (KinkyDungeonGameData.meta.lp != null) KinkyDungeonLockpicks = Math.round(KinkyDungeonGameData.meta.lp);
		if (KinkyDungeonGameData.meta.gp != null) KinkyDungeonGold = Math.round(KinkyDungeonGameData.meta.gp);
		if (KinkyDungeonGameData.meta.lv != null) {
			MiniGameKinkyDungeonLevel = Math.round(KinkyDungeonGameData.meta.lv);
			if (KinkyDungeonGameData.meta.cp)
				KinkyDungeonSetCheckPoint(KinkyDungeonGameData.meta.cp);
			else KinkyDungeonSetCheckPoint();
		}
	}
}

/**
 * Turns the game state into a string that can be sent over
 * @returns {string} - String containing game data
 */
function KinkyDungeonPackData(IncludeMap, IncludeItems, IncludeInventory, IncludeStats) {
	let enemies = JSON.stringify(KinkyDungeonEntities, (key, value) => {
		if (CommonIsNumeric(key) && typeof value === "object") {
			if (value.Enemy) {
				return "E/" + value.Enemy.name + "/" + (value.stun ? value.stun : 0) + "/"+value.x+"/"+value.y;
			}
		}
		return value;
	});

	let items = IncludeItems ? JSON.stringify(KinkyDungeonGroundItems, (key, value) => {
		if (CommonIsNumeric(key) && typeof value === "object") {
			if (value.name) {
				return "G/" + value.name + "/"+value.x+"/"+value.y;
			}
		}
		return value;
	}) : "";

	let bullets = JSON.stringify(KinkyDungeonBullets, (key, value) => {
		if (CommonIsNumeric(key) && typeof value === "object") {
			if (value.bullet) {
				return "B/" + value.bullet.name + "/"+value.x+"/"+value.y + "/"+(Math.round(value.vx*10)/10)+"/"+(Math.round(value.vy*10)/10 + "/"+value.bullet.width + "/"+value.bullet.height);
			}
		}
		return "";
	});

	let map = IncludeMap ? KinkyDungeonGrid : "";

	let inventory = IncludeInventory ? JSON.stringify(Array.from(KinkyDungeonInventory.get(Restraint).values()), (key, value) => {
		if (CommonIsNumeric(key) && typeof value === "object") {
			if (value.restraint) {
				return "I/" + value.restraint.name + "/l" + value.lock;
			}
		}
		return "";
	}) : "";

	let meta = {w: KinkyDungeonGridWidth, h: KinkyDungeonGridHeight, x:KinkyDungeonPlayerEntity ? KinkyDungeonPlayerEntity.x : 0, y:KinkyDungeonPlayerEntity ? KinkyDungeonPlayerEntity.y : 0,};

	if (IncludeStats) {
		meta.sp = Math.round(KinkyDungeonStatStamina);
		meta.mp = Math.round(KinkyDungeonStatMana);
		meta.ap = Math.round(KinkyDungeonStatDistraction);
		meta.rk = KinkyDungeonRedKeys;
		meta.bk = KinkyDungeonBlueKeys;
		meta.lp = KinkyDungeonLockpicks;
		meta.gp = KinkyDungeonGold;
		meta.lv = MiniGameKinkyDungeonLevel;
		meta.cp = MiniGameKinkyDungeonCheckpoint;
	}

	let result = {
		enemies: enemies,
		items: items,
		bullets: bullets,
		map: map,
		inventory: inventory,
		meta: meta,
	};
	let stringToSend = LZString.compressToBase64(JSON.stringify(result));// The replace is needed to avoid artifacts during decompression

	return stringToSend;
}


/**
 * Sends kinky dungeon data to the target member
 * @returns {void}
 */
function KinkyDungeonSendData(data) {
	ServerSend("ChatRoomGame", { KinkyDungeon: data });
}

/**
 * Handles kinky dungeon data after receiving it from another player
 * @returns {void}
 */
function KinkyDungeonHandleData(data, SourceMemberNumber) {
	if (CurrentScreen == "KinkyDungeon" && SourceMemberNumber == KinkyDungeonPlayerCharacter.MemberNumber)
		KinkyDungeonUnpackData(data); // Unpack the rest of the data
}

