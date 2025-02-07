
let KDMinimapIcons: Record<string, (_x: number, _y:number) => string> = {
	'G': (_x, _y) => {return "UI/MiniMap/Ghost.png";},
	'O': (_x, _y) => {return "UI/MiniMap/Orb.png";},
	'S': (_x, _y) => {return "UI/MiniMap/Stairs.png";},
	's': (_x, _y) => {return "UI/MiniMap/StairsDown.png";},
	'H': (_x, _y) => {return "UI/MiniMap/StairsDown.png";},
	'A': (x, y) => {
		if (KinkyDungeonTilesGet(x + "," + y)?.drunk) {
			if (KinkyDungeonTilesGet(x + "," + y)?.Quest)
				return "UI/MiniMap/ShrineQuest.png";
			return "UI/MiniMap/ShrineMana.png";
		}
		if (KinkyDungeonTilesGet(x + "," + y)?.Quest)
			return "UI/MiniMap/ShrineManaQuest.png";
		return "UI/MiniMap/ShrineMana.png";},
	'=': (_x, _y) => {return "UI/MiniMap/ChargerEmpty.png";},
	'+': (_x, _y) => {return "UI/MiniMap/ChargerCrystal.png";},
	'D': (_x, _y) => {return "UI/MiniMap/DoorClosed.png";},
	'd': (_x, _y) => {return "UI/MiniMap/DoorOpen.png";},
	'B': (_x, _y) => {return "UI/MiniMap/Bed.png";},
	'b': (_x, _y) => {return "UI/MiniMap/Bars.png";},
	'g': (_x, _y) => {return "UI/MiniMap/Grate.png";},
	'M': (_x, _y) => {return "UI/MiniMap/Tablet.png";},
	'C': (_x, _y) => {return "UI/MiniMap/Chest.png";},
};


let KDMinimapLabels: Record<string, (_x: number, _y:number, force: boolean) => string> = {
	'G': (_x, _y, force) => {if (!force && !KDMMLabels_Shrine) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : (KinkyDungeonTilesGet(_x + "," + _y)?.Msg ? "" : TextGet("KDMinimapLabel_Ghost"));},
	'O': (_x, _y, force) => {if (!force && !KDMMLabels_Shrine) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : TextGet("KDMinimapLabel_Orb");},
	'S': (_x, _y, force) => {if (!force && !KDMMLabels_Other) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : TextGet("KDMinimapLabel_S");},
	's': (_x, _y, force) => {if (!force && !KDMMLabels_Other) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : TextGet("KDMinimapLabel_s");},
	'H': (_x, _y, force) => {if (!force && !KDMMLabels_Other) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : (KinkyDungeonTilesGet(_x + "," + _y).RoomType ? ">" + KDGetDungeonName({
			mapX: KDGetCurrentLocation().mapX,
			mapY: KDGetCurrentLocation().mapY,
			room: KinkyDungeonTilesGet(_x + "," + _y).RoomType
		}): TextGet("KDMinimapLabel_H"));},
	'A': (x, y, force) => {if (!force && !KDMMLabels_Shrine) return "";
		if (KinkyDungeonTilesGet(x + "," + y)?.MMLabel)
			return TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(x + "," + y).MMLabel);
		if (KinkyDungeonTilesGet(x + "," + y)?.Quest)
			return TextGet("KDMinimapLabel_ShrineQuest");
		return TextGet("KDMinimapLabel_Shrine");},
	'=': (_x, _y, force) => {if (!force && !KDMMLabels_Other) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : TextGet("KDMinimapLabel_=");},
	'+': (_x, _y, force) => {if (!force && !KDMMLabels_Other) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : TextGet("KDMinimapLabel_+");},
	'D': (_x, _y, force) => {if (!force && !KDMMLabels_Other) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : "";},
	'd': (_x, _y, force) => {if (!force && !KDMMLabels_Other) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : "";},
	'B': (_x, _y, force) => {if (!force && !KDMMLabels_Other) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : TextGet("KDMinimapLabel_Bed" + (KinkyDungeonFlags.get("slept") ? "Fail" : ""));},
	'b': (_x, _y, force) => {if (!force && !KDMMLabels_Other) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : "";},
	'g': (_x, _y, force) => {if (!force && !KDMMLabels_Other) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : "";},
	'M': (_x, _y, force) => {if (!force && !KDMMLabels_Shrine) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : TextGet("KDMinimapLabel_Tablet");},
	'C': (_x, _y, force) => {if (!force && !KDMMLabels_Chest) return "";
		return KinkyDungeonTilesGet(_x + "," + _y)?.MMLabel ?
		TextGet("KDMinimapLabel_" + KinkyDungeonTilesGet(_x + "," + _y).MMLabel)
		 : TextGet("KDMinimapLabel_C_" + KinkyDungeonTilesGet(_x + "," + _y)?.Loot);},
}