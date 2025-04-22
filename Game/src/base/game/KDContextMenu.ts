
let KDContextMenu = false;
let KDContextX = 0;
let KDContextY = 0;
let KDContextXX = 0;
let KDContextYY = 0;
let KDContextW = 0;
let KDContextH = 0;
let KDContextStage = "";



/** @type {Record<string, (draw: boolean, mouseX: number, mouseY: number) =>{options: string[], optionImages: Record<string, string>, optionActions: Record<string, (mouseX: number, mouseY: number) => void>, optionGrey: Record<string, boolean>, optionText: Record<string, string>, optionColor: Record<string, string>}>} */
let KDGetContextActions = {
	Game: (draw, mouseX, mouseY) => {
		let options: string[] = [];
		let optionImages: Record<string, string> = {};
		let optionActions: Record<string, (mouseX: number, mouseY: number) => void> = {};
		let optionGrey: Record<string, boolean> = {};
		let optionText: Record<string, string> = {};
		let optionColor: Record<string, string> = {};

		KinkyDungeonSetTargetLocation(false, KDContextX, KDContextY);

		KDGetGameContextActionsVanilla(draw, options, optionImages, optionActions, optionGrey, optionText, optionColor);

		if (options.length==0){
			options = ["None"];
			optionGrey.None = true;
		}

		return {
			options, optionImages, optionActions, optionGrey, optionText, optionColor
		};
	}
}

/** @type {Record<string, (draw: boolean, mouseX: number, mouseY: number) => string[]>} */
let KDDrawGameContextMenu = {
	Game: (draw, mouseX, mouseY) => {
		if (!draw)  {
			// Make it so context menu doesnt occur unless we hover over the map
			if (!KDMouseInPlayableArea()) return [];
		}

		let {
			options, optionImages, optionActions, optionGrey, optionText, optionColor
		} = KDGetContextActions.Game(draw, mouseX, mouseY);

		KDDraw(kdstatusboard, kdpixisprites, "ui_spellreticule",
			KinkyDungeonRootDirectory + "TargetSpell.png",
			(KinkyDungeonTargetX - KinkyDungeonCamX)*KinkyDungeonGridSizeDisplay,
			(KinkyDungeonTargetY - KinkyDungeonCamY)*KinkyDungeonGridSizeDisplay,
			KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
				zIndex: 100,
			});

		KDDrawContextMenu(draw, mouseX, mouseY, options,
			optionImages, optionActions, optionGrey, optionText, optionColor);

		return options;
	},
}



function KDGetGameContextActionsVanilla(
	draw: boolean,
	options: string[],
	optionImages: Record<string, string>,
	optionActions: Record<string, (mouseX: number, mouseY: number) => void>,
	optionGrey: Record<string, boolean>,
	optionText: Record<string, string>,
	optionColor: Record<string, string>,

) {
	let tileType = KinkyDungeonMapGet(KinkyDungeonTargetX, KinkyDungeonTargetY);
	let entity = KinkyDungeonEntityAt(KinkyDungeonTargetX, KinkyDungeonTargetY);
	let tile = KinkyDungeonTilesGet(KinkyDungeonTargetX + ',' + KinkyDungeonTargetY);
	if (!KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY)) {
		entity = null;
		tile = null;
		if (!KinkyDungeonFogGet(KinkyDungeonTargetX, KinkyDungeonTargetY))
			tileType = '1';
	}
	if (entity && !KDCanSeeEnemy(entity)) {
		entity = null;
	}
	if (entity && !entity.player) {
		if (KDTalkToEnemy(entity)) {
			options.push("Talk");
			optionImages.Talk = KDistChebyshev(entity.x - KDPlayer().x, entity.y - KDPlayer().y) < 1.5
				? "Talk" : "MoveTo";
			optionActions.Talk = () => {
				KDCancelAutoWait();
				KDContextMenu = false;
				let Enemy = entity;
				let d = Enemy.Enemy.specialdialogue ? Enemy.Enemy.specialdialogue : "GenericAlly";
				if ((!Enemy.specialdialogue && !Enemy.prisondialogue) && KDIsImprisoned(Enemy)) d = "PrisonerJailBug";
				else if (Enemy.prisondialogue && KDIsImprisoned(Enemy)) d = Enemy.prisondialogue; // Special dialogue override
				else if (Enemy.specialdialogue) d = Enemy.specialdialogue; // Special dialogue override
				if (d || ((!Enemy.lifetime || Enemy.lifetime > 9000) && !Enemy.Enemy.tags.notalk)) { // KDAllied(Enemy)
					KDSendInput("talk", {d: d, id: Enemy.id, moveTo: true})
				}
			}

			let unaware = false;
			let aggroothers = true;

			if (entity.aware && !entity.playWithPlayer) {
				// attack
				unaware = false;
				aggroothers = true;
			} else if (entity.playWithPlayer) {
				// retaliate
				unaware = false;
				aggroothers = false;
			} else {
				// sneak attack
				unaware = true;
				aggroothers = false;
			}

			options.push("Aggro");
			optionText.Aggro = TextGet("KDContextMenu_" + (unaware ? "AggroSneak" : (aggroothers ? "Aggro" : "Retaliate")));
			optionImages.Aggro = unaware ? "AggroSneak" : (aggroothers ? "Aggro" : "Retaliate");
			let rng = 1.5; // TODO weapon range for stuff like spears
			//optionGrey.Aggro = KDistChebyshev(entity.x - KDPlayer().x, entity.y - KDPlayer().y) > rng;
			optionActions.Aggro = () => {
				KDCancelAutoWait();
				if (KDistChebyshev(entity.x - KDPlayer().x, entity.y - KDPlayer().y) <= rng)
					KDSendInput("doaggro", {
						tx: entity.x, ty: entity.y, id: entity.id, unaware: unaware, aggroothers: aggroothers
					})
			}


		} else {
			if (KDShouldCapture(entity)) {
				options.push("Capture");
				optionImages.Capture = "Capture";
				let rng = 1.5;
				optionGrey.Capture = KDistChebyshev(entity.x - KDPlayer().x, entity.y - KDPlayer().y) > rng;
				optionActions.Capture = () => {
					KDCancelAutoWait();
					if (KDistChebyshev(entity.x - KDPlayer().x, entity.y - KDPlayer().y) <= rng)
						KDSendInput("docapture", {
							tx: entity.x, ty: entity.y, noadvance: false, skip: 0, id: entity.id
						})
				}
			} else {
				let key = KDShouldTease(entity) ? "Tease" : "Attack";
				options.push(key);
				optionImages[key] = key;
				let attackCost = KDAttackCost().attackCost;
				let rng = 1.5; // TODO weapon range for stuff like spears
				optionGrey[key] = !KinkyDungeonHasStamina(Math.abs(attackCost), true) ||
					KDistChebyshev(entity.x - KDPlayer().x, entity.y - KDPlayer().y) > rng;
				optionActions[key] = () => {
					KDCancelAutoWait();
					if (KinkyDungeonHasStamina(Math.abs(attackCost), true) &&
						KDistChebyshev(entity.x - KDPlayer().x, entity.y - KDPlayer().y) <= rng)
						KDSendInput("doattack", {
							tx: entity.x, ty: entity.y, attackcost: -attackCost,
							teasesub: key == "Tease", skip: 0, id: entity.id
						})
				}
			}
		}


		if (KDCanBind(entity)) {
			//KDSendInput("truss", {id: entity.id, moveTo: true})
			options.push("Truss");
			optionImages.Truss = "Truss";
			let rng = KDGetSpellRange(KDBondageSpell);
			optionGrey.Truss = !KDCanApplyBondage(entity, KDPlayer(),
				undefined)
				|| KDistChebyshev(entity.x - KDPlayer().x, entity.y - KDPlayer().y) > rng;
			if (KDistChebyshev(entity.x - KDPlayer().x, entity.y - KDPlayer().y) > rng) {
				optionText.Truss = TextGet("KDContextMenu_TrussOOR");
				optionImages.Truss = "TrussX";
			} else if (optionGrey.Truss) {
				optionText.Truss = TextGet("KDContextMenu_TrussAttempt");
				optionImages.Truss = "TrussA";
			}
			optionActions.Truss = () => {
				KDCancelAutoWait();
				if (KDistChebyshev(entity.x - KDPlayer().x, entity.y - KDPlayer().y) <= rng)
					KDSendInput("tryCastSpell", {tx: entity.x, ty: entity.y,
						spell: KDBondageSpell, spellname: "Bondage",
						enemy: undefined,
						player: KDPlayer(),
						bullet: undefined})
			}
		}

		// enemy options e.g. interact, pass, ally commands (TODO)
		if (KDCanPassEnemy(KDPlayer(), entity, true)) {
			options.push("Pass");
			optionImages.Pass = "Pass";
			optionGrey.Pass = KDCanPassEnemy(KDPlayer(), entity, true, true);
			optionActions.Pass = () => {
				KinkyDungeonSetEnemyFlag(entity, "passthrough", 100);
			}
		}



	} else if ((entity == KDPlayer() || !entity
		|| (KinkyDungeonAutoWait || KDAutoWaitDelayed)) && !KinkyDungeonStairTiles.includes(tileType)) {
		// Player options e.g. wait
		options.push("Wait");
		optionImages.Wait = (KinkyDungeonAutoWait || KDAutoWaitDelayed) ? "Stop" : "Wait";
		if (KinkyDungeonAutoWait || KDAutoWaitDelayed) {
			optionText.Wait = TextGet("KDContextMenu_Stop")
		}
		optionGrey.Wait = KinkyDungeonAutoWait;
		optionActions.Wait = () => {
			KDContextMenu = false;
			if (KinkyDungeonAutoWait || KDAutoWaitDelayed) {
				KinkyDungeonAutoWait = false;
				KinkyDungeonTempWait = false;
				KinkyDungeonAutoWaitSuppress = false;
				KDSetFocusControl("");
			} else {
				KinkyDungeonAutoWait = true;
				KinkyDungeonTempWait = true;
				KinkyDungeonAutoWaitSuppress = true;
				KDUpdateWaitTime(100);
				KDSetFocusControl("AutoWait");
			}
		}
	}
	if (entity == KDPlayer() && KinkyDungeonDrawState != "Inventory") {
		// Player options e.g. wait
		options.push("Inventory");
		optionImages.Inventory = "Inventory";
		optionActions.Inventory = () => {
			KDContextMenu = false;
			KDShowInventory(null);
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
		}
	}

	if (KinkyDungeonPlayerDamage?.special)  {
		options.push("Special");
		optionImages.Special = KinkyDungeonRootDirectory + "Items/" + KinkyDungeonPlayerDamage.name + ".png";
		optionText.Special = TextGet("KDContextMenu_Shoot" +
			KDContextMenuWeaponSpecialSuff(KinkyDungeonPlayerDamage.special)
		)


		optionActions.Special = () => {
			KDCancelAutoWait();
			KDSendInput("dospecial", {
				x: KinkyDungeonTargetX, y: KinkyDungeonTargetY, weapon: KinkyDungeonPlayerWeapon
			})
		}
	}

	if (tile?.Type || KDTileInteract[tileType]) {
		// Interact
		options.push("Interact");
		optionImages.Interact = "Interact";
		optionActions.Interact = () => {
			KDCancelAutoWait();
			KDContextMenu = false;
			KDSendInput("interact", {x: KinkyDungeonTargetX, y: KinkyDungeonTargetY});
		}
	}

	if (!tile?.Type && (!entity || (entity.player && KinkyDungeonStairTiles.includes(tileType)))
		&& KinkyDungeonMovableTiles.includes(tileType)) {
		let noMove = false;
		if (entity == KDPlayer() && KinkyDungeonStairTiles.includes(tileType)) {
			options.push("Stairs");
			noMove = KDistChebyshev(KinkyDungeonTargetX - KDPlayer().x, KinkyDungeonTargetY - KDPlayer().y) < 0.5;
			if (!noMove) optionGrey.Stairs = true;
			optionImages.Stairs = "Stairs";
			optionActions.Stairs = () => {
				KDCancelAutoWait();
				KDContextMenu = false;
				KDSendInput("movestairs", {dir: {x:0, y: 0, delta: 0}, delta: 1, AllowInteract: true, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true);
			}
		}
		if (!noMove) {
			options.push("MoveTo");
			optionImages.MoveTo = "MoveTo";
			optionActions.MoveTo = () => {
				KDCancelAutoWait();
				KDContextMenu = false;
				KDFastMoveTo(KinkyDungeonTargetX, KinkyDungeonTargetY);
			}

			let md = KinkyDungeonGetDirection(
				KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x,
				KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y);
			if (md.x || md.y) {
				let newX = md.x * (KinkyDungeonSlowLevel < 2 ? 2 : 1) + KinkyDungeonPlayerEntity.x;
				let newY = md.y * (KinkyDungeonSlowLevel < 2 ? 2 : 1) + KinkyDungeonPlayerEntity.y;
				let tile = KinkyDungeonMapGet(newX, newY);
				if (KinkyDungeonMovableTilesEnemy.includes(tile)
					&& KinkyDungeonNoEnemy(newX, newY)) {
					if (draw) {
						KDDraw(kdstatusboard, kdpixisprites, "context_movesprint",
							KinkyDungeonRootDirectory + "Sprint.png",
							(newX - KinkyDungeonCamX)*KinkyDungeonGridSizeDisplay,
							(newY - KinkyDungeonCamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 99,
							});
						let sprintcost = KDSprintCost();
						optionText.Sprint = TextGet("KDContextMenu_Sprint").replace("AMNT", Math.round(-sprintcost*10) + "sp");
						DrawTextKD(Math.round(-sprintcost*10) + "sp",
							(newX - KinkyDungeonCamX + 0.5)*KinkyDungeonGridSizeDisplay,
							(newY - KinkyDungeonCamY - 0.25)*KinkyDungeonGridSizeDisplay, KDBaseMint);
					}

					options.push("Sprint");
					optionImages.Sprint = "Sprint";
					optionActions.Sprint = () => {
						KDCancelAutoWait();
						KDContextMenu = false;
						KDSendInput("move",
							{dir: {x:md.x, y: md.y, delta: 0},
							delta: 1, AllowInteract: true,
							AutoDoor: false,
							AutoPass: KinkyDungeonToggleAutoPass,
							sprint: KinkyDungeonToggleAutoSprint,
							SuppressSprint: KinkyDungeonSuppressSprint, forceSprint: true,},
							false, true);

					}

				}
			}
		}

	}
}



function KDContextMenuWeaponSpecialSuff(special: KDWeaponSpecial) {
	return ((special.selfCast) ? "selfcast"
	: ((special.type == "hitorspell") ? "hitorspell"
	: ((special.type == "attack") ? "attack"
	: ((special.type == "ignite") ? "ignite"
	: ""))));
}

function KDShowInventory(container: string[]) {
	KinkyDungeonDrawState = "Inventory";
	KDGameData.InventoryActionContainer = container || [];
	if (container?.length > 0)
		KDGameData.InventoryAction = container[0];
}