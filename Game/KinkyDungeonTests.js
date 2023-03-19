"use strict";

// This file is for Kinky Dungeon unit tests, run from the console

function KDRunTests() {
	KDDebug = true;
	if (KDTestMapGen(100, [0, 6, 12, 18,], [0, 1, 2, 3, 11,])
		&& KDTestFullRunthrough(3, true, true)) {
		console.log("All tests passed!");
	}
	KDDebug = false;
}

function KDTestMapGen(count, Ranges, Checkpoints) {
	for (let Checkpoint of Checkpoints) {
		MiniGameKinkyDungeonCheckpoint = Checkpoint;
		for (let FloorRange of Ranges)
			for (let f = FloorRange; f < FloorRange + KDLevelsPerCheckpoint; f++) {
				console.log(`Testing floor ${f}`);
				MiniGameKinkyDungeonLevel = f;
				for (let i = 0; i < count; i++) {
					if (i % (count/KDLevelsPerCheckpoint) == 0)
						console.log(`Testing iteration ${i} on floor ${MiniGameKinkyDungeonLevel}`);
					KinkyDungeonCreateMap(KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]], f, true);
					let accessible = KinkyDungeonIsAccessible(KinkyDungeonStartPosition.x, KinkyDungeonStartPosition.y);
					if (!accessible) {
						console.log(`Error, stairs are inaccessible on iteration ${i}`);
						return false;
					}
				}
			}
	}
	return true;
}


function KDTestFullRunthrough(GameLoops, Init, NGP) {
	let EnemySpawnData = {};
	console.log("Testing full runthrough");
	if (Init) {
		MiniGameKinkyDungeonLevel = 1;
		MiniGameKinkyDungeonCheckpoint = "grv";
		KinkyDungeonInitialize(1);
	}
	for (let i = 0; i < KinkyDungeonMaxLevel * GameLoops; i++) {
		// Run through the stairs
		KinkyDungeonHandleStairs('s', true);
		console.log(`Arrived at floor ${MiniGameKinkyDungeonLevel}`);

		if (!EnemySpawnData["" + MiniGameKinkyDungeonCheckpoint]) {
			EnemySpawnData["" + MiniGameKinkyDungeonCheckpoint] = {};
		}
		for (let e of KinkyDungeonEntities) {
			if (EnemySpawnData["" + MiniGameKinkyDungeonCheckpoint][e.Enemy.name] == undefined)
				EnemySpawnData["" + MiniGameKinkyDungeonCheckpoint][e.Enemy.name] = 1;
			else EnemySpawnData["" + MiniGameKinkyDungeonCheckpoint][e.Enemy.name] += 1;
		}

		if (KinkyDungeonState == "End") {
			if (NGP)
				KinkyDungeonNewGamePlus();
			else {
				MiniGameKinkyDungeonLevel = 1;
				MiniGameKinkyDungeonCheckpoint = "grv";
				KinkyDungeonState = "Game";
			}
		}

		// Check various things
		if (KinkyDungeonEnemies.length < 1) {
			console.log(`Error, no enemies on floor ${MiniGameKinkyDungeonLevel}, iteration ${i}`);
			return false;
		} else if (MiniGameKinkyDungeonCheckpoint != KDDefaultJourney[Math.min(KDDefaultJourney.length - 1, Math.floor((MiniGameKinkyDungeonLevel) / KDLevelsPerCheckpoint))]) {
			console.log(`Error, wrong checkpoint on floor ${MiniGameKinkyDungeonLevel}, iteration ${i}: Found ${MiniGameKinkyDungeonCheckpoint}, Checkpoint should be ${Math.floor(MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint)}`);
			return false;
		}
	}
	console.log(EnemySpawnData);
	return true;
}

function KDTestjailer(iter) {
	let totals = {};
	for (let i = 0; i < iter; i++) {
		KDJailEvents.spawnGuard.trigger(KinkyDungeonJailGuard(), KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
		if (KinkyDungeonJailGuard()) {
			if (!totals[KinkyDungeonJailGuard().Enemy.name]) totals[KinkyDungeonJailGuard().Enemy.name] = 1;
			else totals[KinkyDungeonJailGuard().Enemy.name] = totals[KinkyDungeonJailGuard().Enemy.name] + 1;
		} else {
			if (!totals.null) totals.null = 1;
			else totals.null = totals.null + 1;
		}
		KDSpliceIndex(KinkyDungeonEntities.indexOf(KinkyDungeonJailGuard()), 1);
		KDGameData.KinkyDungeonJailGuard = 0;
	}
	console.log(totals);
}

async function KDExportTranslationFile() {
	await sleep(1000);
	let file = "";
	for (let c of Object.values(TextScreenCache.cache)) {
		file = file + '\n' + c;
		file = file + '\n';
	}
	navigator.clipboard.writeText(file);
}