"use strict";

interface KDLair {
	Name: string,
	RoomType: string,
	OwnerNPC?: number,
	//OwnerFaction?: string,
}
let KDPersonalAlt: {[_ : string]: KDLair} = {};



function KDGenerateLairNameFromEnemy(RoomType: string, enemy: entity): string {
	return TextGet("KDPersonalizedRoom")
	//RMNME of CHTRNME the ENMYNME
		.replace("RMNME", TextGet("KDSideRoom_" + RoomType))
		.replace("CHTRNME", KDGetPersistentNPC(enemy.id)?.Name)
		.replace("ENMYNME", TextGet("Name" + enemy.Enemy.name));
}
