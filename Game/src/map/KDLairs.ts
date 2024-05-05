"use strict";

interface KDLair {
	Name: string,
	RoomType: string,
	OwnerNPC?: number,
	//OwnerFaction?: string,
}
interface KDPersistentNPC {
	Name: string,
	id: number,
	entity: entity,
}

let KDPersonalAlt: {[_ : string]: KDLair} = {};
let KDPersistentNPCs: {[_ : string]: KDPersistentNPC} = {};



function KDGenerateLairNameFromEnemy(RoomType: string, enemy: entity): string {
	return TextGet("KDPersonalizedRoom")
	//RMNME of CHTRNME the ENMYNME
		.replace("RMNME", TextGet("KDSideRoom_" + RoomType))
		.replace("CHTRNME", KDGetPersistentNPC(enemy)?.Name)
		.replace("ENMYNME", TextGet("Name" + enemy.Enemy.name));
}

function KDGetPersistentNPC(enemy: entity): KDPersistentNPC {
	if (!KDPersistentNPCs[enemy.id]) {
		let entry = {
			Name: enemy.CustomName || KDGetEnemyName(enemy),
			id: enemy.id,
			entity: enemy,
		};
		KDPersistentNPCs[enemy.id] = entry;
	}
	return KDPersistentNPCs[enemy.id];

}