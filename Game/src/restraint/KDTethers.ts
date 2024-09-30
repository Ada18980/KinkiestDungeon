
let KDLeashPullCost = 0.5;
let KDLeashPullKneelTime = 5;

let KDLeashablePersonalities = {
	"": (entity: entity, leasher: entity) => {
		// Switches refuse unless you are friendly to them.
		return (!KDHostile(entity, leasher) && KDFactionRelation(KDGetFaction(entity), KDGetFaction(leasher)) > 0.5) || KDBoundEffects(entity) > 1;
	},
	"Dom": (entity: entity, leasher: entity) => {
		// Doms always refuse. You need to tie them.
		return KDBoundEffects(entity) > 1;
	},
	"Sub": (entity: entity, leasher: entity) => {
		// Subs will always let you leash them unless you are hostile
		return !KDHostile(entity, leasher) || KDBoundEffects(entity) > 1;
	},
	"Brat": (entity: entity, leasher: entity) => {
		// Brats must be distracted to start leashing, or already leashed
		return (!KDHostile(entity, leasher) && entity.leash) || entity.distraction > entity.Enemy.maxhp*0.25 || KDBoundEffects(entity) > 1;
	},
};

let KDLeashReason : {[_: string]: (entity: entity) => boolean} = {
	ShadowTether: (entity) => {
		if (!(entity.leash.entity && KinkyDungeonFindID(entity.leash.entity)?.Enemy?.tags?.shadow))
			return false;
		if (entity.leash.entity && KinkyDungeonFindID(entity.leash.entity)
			&& KinkyDungeonIsDisabled(KinkyDungeonFindID(entity.leash.entity))) return false;
		if (entity.player) {
			return KinkyDungeonPlayerTags.get("Shadow");
		} else {
			return KDBoundEffects(entity) > 1;
		}
	},
	PlayerLeash: (entity) => {
		//if (!KinkyDungeonInventoryGetConsumable("LeashItem") && !KDHasSpell("LeashSkill")) return false;
		if (entity
			// Condition 1: the target is willing
			&& !(KDWillingLeash(entity))
			// Condition 1.5: the target is made willing
			&& !(KDCanApplyBondage(entity, KDPlayer()))
			// Condition 2: the player has the Brat Handler skill and target is wearing a leash item
			&& !(KDHasSpell("LeashSkill") && KDGetNPCRestraints(entity.id) && Object.values(KDGetNPCRestraints(entity.id))
				.some((rest) => {return KDRestraint(rest)?.leash;}))
			)
			return false;
		if (KDPlayerIsDisabled() || KinkyDungeonIsHandsBound(true, true, 0.5)) return false;
		return true;
	},
	Default: (entity) => {
		if (entity.leash && entity.leash.reason == "Default") {
			if (entity.leash.entity) {
				let leasher = KDLookupID(entity.leash.entity);
				if (!leasher) return false;
				if (!leasher.player) {
					if (KinkyDungeonIsDisabled(leasher)) return false;
				}
			}
		}
		if (entity.player) {
			if (KinkyDungeonPlayerTags.get("Leashable"))
				return true;
			else return false;
		}
		return true;
	},
	WolfgirlLeash: (entity) => {
		if (entity.leash && entity.leash.reason == "WolfgirlLeash") {
			if (entity.leash.entity) {
				let leasher = KDLookupID(entity.leash.entity);
				if (!leasher || KDEntityHasFlag(leasher, "aggression")) {
					return false;
				}
			}
		}
		// Careful about recursion
		return KDLeashReason.Default(entity);
	},
	DollLeash: (entity) => {
		if (entity.leash && entity.leash.reason == "DollLeash") {
			if (entity.leash.entity) {
				let leasher = KDLookupID(entity.leash.entity);
				if (!leasher || KDEntityHasFlag(leasher, "aggression") || !KDEntityHasFlag(leasher, "leashPrisoner")) {
					return false;
				}
			}
		}
		// Careful about recursion
		return KDLeashReason.Default(entity);
	},
};

function KDGetLeashedToCount(entity: entity): number {
	let n = 0;
	for (let en of KDMapData.Entities.filter((en) => {return en.leash?.entity;})) {
		if (en.leash.entity == entity.id) n++;
	}
	if (KDPlayer().leash?.entity == entity.id) n++;
	return n;
}

function KDGetLeashedTo(entity: entity): entity[] {
	let ret: entity[] = [];
	for (let en of KDMapData.Entities.filter((en) => {return en.leash?.entity;})) {
		if (en.leash.entity == entity.id) ret.push(en);
	}
	if (KDPlayer().leash?.entity == entity.id) ret.push(KDPlayer());
	return ret;
}

function KDGetTetherLength(entity: entity): number {
	if (!entity) entity = KDPlayer();
	if (entity.leash) {
		return entity.leash.length || 2.5;
	}
	return 0;
}

function KDIsPlayerTethered(entity: entity): boolean {
	if (!entity) entity = KDPlayer();
	if (entity.leash) {
		KDUpdateLeashCondition(entity);
		return entity.leash != undefined;
	}
	if (entity.player) {
		let found = KinkyDungeonFindID(KDGameData.KinkyDungeonLeashingEnemy);
		if (!found) KDGameData.KinkyDungeonLeashingEnemy = 0;
		return KDGameData.KinkyDungeonLeashedPlayer > 0;
	}
	return false;
}

/** Updates the leash and returns true if the leash survives or false if removed */
function KDUpdateLeashCondition(entity: entity, noDelete: boolean = false) : boolean {
	if (entity.leash?.reason) {
		if (!KDLeashReason[entity.leash.reason] || !KDLeashReason[entity.leash.reason](entity)) {
			if (!noDelete)
				delete entity.leash;
			return false;
		}
	}
	return true;
}

function KinkyDungeonAttachTetherToEntity(dist: number, entity: entity, player: entity, reason: string = "Default", color?: string, priority: number = 5, item: item = null): KDLeashData {
	if (!player) player = KDPlayer();

	if (!player.leash || priority > player.leash.priority) {
		player.leash = {
			x: entity.x,
			y: entity.y,
			entity: entity.player ? -1 : entity.id,
			reason: reason,
			color: color,
			length: dist || 2,
			priority: priority,
			restraintID: item?.id,
		};
		return player.leash;
	}
	return undefined;
}

function KDIsPlayerTetheredToLocation(player: entity, x: number, y: number, entity?: entity): boolean {
	if (!player.player) return false;
	if (player.leash) {
		if (entity && KDIsPlayerTetheredToEntity(player, KDLookupID(entity.id))) {
			return true;
		} else if (player.leash.x == x && player.leash.y == y) return true;
		else if (entity && player.leash.x == entity.x && player.leash.y == entity.y) return true;
	}
	return false;
}

function KDIsPlayerTetheredToEntity(player: entity, entity: entity) {
	if (!player.player) return false;

	if (player.leash) {
		let host = KDLookupID(player.leash.entity);
		if (host?.id == entity?.id) {
			return true;
		}
	}
	return false;
}



function KDBreakTether(player: entity): boolean {
	if (player?.leash) {
		delete player.leash;
		return true;
	}
	return false;
}


function KinkyDungeonDrawTethers(CamX: number, CamY: number) {
	KDTetherGraphics.clear();
	if (!KDGameBoardAddedTethers) {
		kdgameboard.addChild(KDTetherGraphics);
		KDGameBoardAddedTethers = true;
	}

	let drawTether = (entity: entity) => {
		if (entity.leash && (KinkyDungeonVisionGet(entity.x, entity.y) > 0.5 || KinkyDungeonVisionGet(entity.leash.x, entity.leash.y) > 0.5)) {
			let xx = canvasOffsetX + (entity.visual_x - CamX)*KinkyDungeonGridSizeDisplay;
			let yy = canvasOffsetY + (entity.visual_y - CamY)*KinkyDungeonGridSizeDisplay;
			let txx = canvasOffsetX + (entity.leash.x - CamX)*KinkyDungeonGridSizeDisplay;
			let tyy = canvasOffsetY + (entity.leash.y - CamY)*KinkyDungeonGridSizeDisplay;
			let leasher = entity.leash.entity ? KDLookupID(entity.leash.entity) : undefined;
			if (leasher) {
				txx = canvasOffsetX + (leasher.visual_x - CamX)*KinkyDungeonGridSizeDisplay;
				tyy = canvasOffsetY + (leasher.visual_y - CamY)*KinkyDungeonGridSizeDisplay;
				txx += KinkyDungeonGridSizeDisplay * (leasher.flip ? 0.2 : -0.2);
			}
			let dx = (txx - xx);
			let dy = (tyy - yy);
			let dd = 0.1; // Increments
			let color = entity.leash.color;
			if (!color || color == "Default") color = "#aaaaaa";
			if (Array.isArray(color)) color = color[0];
			KDTetherGraphics.lineStyle(entity.player ? 3 : 2, string2hex(color), 1);
			for (let d = dd; d < 1 - dd; d += dd) {
				let yOffset = 30 * Math.sin(Math.PI * d);
				let yOffset2 = 30 * Math.sin(Math.PI * (d + dd));
				KDTetherGraphics.moveTo(KinkyDungeonGridSizeDisplay/2 + xx + dx*d, KinkyDungeonGridSizeDisplay*0.5 + yOffset + yy + dy*d);
				KDTetherGraphics.lineTo(KinkyDungeonGridSizeDisplay/2 + xx + dx*(d+dd), KinkyDungeonGridSizeDisplay*0.5 + yOffset2 + yy + dy*(d+dd));
			}
		}

	};

	drawTether(KDPlayer());
	for (let enemy of KDMapData.Entities) {
		drawTether(enemy);
	}
}

function KDBreakAllLeashedTo(entity: entity, reason?: string) {
	for (let en of KDMapData.Entities) {
		if (en.leash && en.leash.entity == entity.id && (!reason || en.leash.reason == reason)) {
			KDBreakTether(en);
		}
	}
}

function KinkyDungeonUpdateTether(Msg: boolean, Entity: entity, xTo?: number, yTo?: number): boolean {

	if (Entity.player && KinkyDungeonFlags.get("pulled")) return false;
	else if (KDEnemyHasFlag(Entity, "pulled")) return false;

	KDUpdateLeashCondition(Entity, false);

	if (Entity.leash) {
		let exceeded = false;
		let leash = Entity.leash;
		let tether = leash.length;

		if (leash.entity) {
			let target = KDLookupID(leash.entity);
			if (!target) {
				KDBreakTether(Entity);
				return false;
			} else {
				leash.x = target.x;
				leash.y = target.y;
			}
		}

		let restraint = (Entity.player && leash.restraintID) ?  KinkyDungeonAllRestraintDynamic().find((inv) => {return inv.item.id == leash.restraintID;}) : undefined;

		if (!restraint && (Entity.player && leash.restraintID)) {
			KDBreakTether(Entity);
		}

		if (Entity.player) {
			KDGameData.KinkyDungeonLeashedPlayer = Math.max(KDGameData.KinkyDungeonLeashedPlayer, 5);
			for (let inv of KinkyDungeonAllRestraint()) {
				if (KDRestraint(inv).removeOnLeash) {
					KinkyDungeonRemoveRestraint(KDRestraint(inv).Group, false);
					if (KDRestraint(inv).Group == "ItemDevices") {
						KinkyDungeonSetFlag("Released", 15);
						KinkyDungeonSetFlag("nojailbreak", 15);
					}
				}
			}
		}

		if (xTo || yTo) {// This means we are trying to move
			let pathToTether = KinkyDungeonFindPath(xTo, yTo, leash.x, leash.y, false, !Entity.player, false, KinkyDungeonMovableTilesSmartEnemy);
			let playerDist = Math.max(pathToTether?.length || 0, KDistChebyshev(xTo-leash.x, yTo-leash.y));
			// Fallback
			if (playerDist > tether && KDistEuclidean(xTo-leash.x, yTo-leash.y) > KDistEuclidean(Entity.x-leash.x, Entity.y-leash.y)) {
				if (Msg && leash.restraintID) {
					if (restraint) {
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonTetherTooShort").replace("TETHER", KDGetItemName(restraint.item)), "#ff5277", 2, true);
					}
				}
				if (Entity.player) {
					if (KinkyDungeonCanStand() && !KDForcedToGround()) {
						KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns, KDLeashPullKneelTime + KDGameData.SlowMoveTurns);
						KinkyDungeonChangeWill(-KDLeashPullCost, false);
					}
				} else {
					Entity.stun = Math.max(Entity.stun || 0, 2);
				}

				//return true;
				if (Entity.player) KinkyDungeonSetFlag("leashtug", 3);
				else KinkyDungeonSetEnemyFlag(Entity, "leashtug", 3);
				exceeded = true;
			}
		}
		for (let i = 0; i < 10; i++) {
			// Distance is in pathing units
			let pathToTether = KinkyDungeonFindPath(Entity.x, Entity.y, leash.x, leash.y, KDIDHasFlag(Entity.id, "blocked"), !Entity.player, false, KinkyDungeonMovableTilesSmartEnemy);
			let playerDist = pathToTether?.length;
			// Fallback
			if (!pathToTether) playerDist = KDistChebyshev(Entity.x-leash.x, Entity.y-leash.y);
			if (playerDist > tether) {
				let slot = null;
				if (pathToTether
					&& pathToTether?.length > 0
					&& (
						KDistEuclidean(pathToTether[0].x - leash.x, pathToTether[0].y - leash.y) > -0.01 + KDistEuclidean(Entity.x - leash.x, Entity.y - leash.y)
						|| KinkyDungeonFindPath(pathToTether[0].x, pathToTether[0].y, leash.x, leash.y, false, !Entity.player, false, KinkyDungeonMovableTilesSmartEnemy)?.length < pathToTether.length
					) && KDistChebyshev(pathToTether[0].x - Entity.x, pathToTether[0].y - Entity.y) < 1.5) {
					slot = pathToTether[0];
					if (slot && KinkyDungeonEntityAt(slot.x, slot.y) && KDIsImmobile(KinkyDungeonEntityAt(slot.x, slot.y), true)) {
						slot = null;
						KDSetIDFlag(Entity.id, "blocked", 3);
					}
				}

				if (!slot) {
					let mindist = playerDist;
					for (let X = Entity.x-1; X <= Entity.x+1; X++) {
						for (let Y = Entity.y-1; Y <= Entity.y+1; Y++) {
							if ((X !=  Entity.x || Y != Entity.y) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y)) && KDistEuclidean(X-leash.x, Y-leash.y) < mindist
							&& !(KinkyDungeonEntityAt(X-leash.x, Y-leash.y) && KDIsImmobile(KinkyDungeonEntityAt(X-leash.x, Y-leash.y), true))) {
								mindist = KDistEuclidean(X-leash.x, Y-leash.y);
								slot = {x:X, y:Y};
							}
						}
					}
				}
				if (!slot) { //Fallback
					slot = {x:leash.x, y:leash.y};
				}
				if (slot && KinkyDungeonEntityAt(slot.x, slot.y) && KDIsImmobile(KinkyDungeonEntityAt(slot.x, slot.y), true)) {
					slot = null;
				}
				if (slot) {
					let enemy = KinkyDungeonEntityAt(slot.x, slot.y);
					if (enemy && !enemy.player) { //  && !KDHostile(Entity, enemy)
						let slot2 = null;
						let mindist2 = playerDist;
						for (let X = enemy.x-1; X <= enemy.x+1; X++) {
							for (let Y = enemy.y-1; Y <= enemy.y+1; Y++) {
								if ((X !=  enemy.x || Y != enemy.y) && !KinkyDungeonEntityAt(X, Y) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y)) && KDistEuclidean(X-Entity.x, Y-Entity.y) < mindist2) {
									mindist2 = KDistEuclidean(X-Entity.x, Y-Entity.y);
									slot2 = {x:X, y:Y};
								}
							}
						}
						if (slot2) {
							KDMoveEntity(enemy, slot2.x, slot2.y, false);
						} else {
							let pointSwap = KinkyDungeonGetNearbyPoint(slot.x, slot.y, true, undefined, true, true);
							if (pointSwap)
								KDMoveEntity(enemy, pointSwap.x, pointSwap.y, false, undefined, undefined, true);
							else
								KDMoveEntity(enemy, Entity.x, Entity.y, false,undefined, undefined, true);
						}
					}
					exceeded = true;
					if (enemy?.player) continue;
					// Force open door
					if (KinkyDungeonMapGet(slot.x, slot.y) == 'D') KinkyDungeonMapSet(slot.x, slot.y, 'd');

					if (Entity.player) {
						KDMovePlayer(slot.x, slot.y, false, undefined, undefined);
					} else {
						KDMoveEntity(Entity, slot.x, slot.y, false, undefined, undefined);
					}
					if (Entity.player) KinkyDungeonSetFlag("pulled", 1);
					else KinkyDungeonSetEnemyFlag(Entity, "pulled", 1);
					if (Entity.player) KinkyDungeonSetFlag("leashtug", 3);
					else KinkyDungeonSetEnemyFlag(Entity, "leashtug", 3);
					if (Entity.player) {
						KinkyDungeonInterruptSleep();
						KinkyDungeonSendEvent("leashTug", {Entity: Entity, slot: slot, item: restraint});
						if (KinkyDungeonLeashingEnemy()) {
							KinkyDungeonSetEnemyFlag(KinkyDungeonLeashingEnemy(), "harshpull", 5);
						}
						if (Msg && restraint) KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonTetherPull").replace("TETHER", KDGetItemName(restraint.item)), "#ff5277", 2, true);

					}
				}
			}
		}
		return exceeded;
	}
	return false;


}



function KDWillingLeash(entity: entity): boolean {
	return entity?.personality != undefined
				&& KDLeashablePersonalities[entity.personality]
				&& KDLeashablePersonalities[entity.personality](entity, KDPlayer());
}