

/**
 * Helper function used to summon cursed epicenters
 * @param x
 * @param y
 */
function KDSummonLatexKittyTrap(x: number, y: number): entity {
	let enemy = KinkyDungeonGetEnemy(["latexKitty"], KDGetEffLevel(),KDCurrIndex(), '0',
	["latexKitty"]);
	if (enemy) {
		let point = {x: x, y: y};//KinkyDungeonGetNearbyPoint(x, y, true);
		if (point) {
			let en = DialogueCreateEnemy(point.x, point.y, enemy.name);

			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/SummonCurse.ogg");
			KinkyDungeonSendTextMessage(8, TextGet("KDSummonLatexKitty"), "#77aaff", 5);
			KDDisableAutoWait();
			return en;
		}
	}
}
