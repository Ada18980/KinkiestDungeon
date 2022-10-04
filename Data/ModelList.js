"use strict";

let ARMPOSES = ["Free", "Boxtie", "Wristtie"];
let LEGPOSES = ["Spread", "Closed", "Kneel"];

AddModel({
	Name: "Body",
	Folder: "Body",
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Eyes", Pri: 100,
		},
		{ Name: "Head", Layer: "Head", Pri: 0,
		},
		{ Name: "Arms", Layer: "Arms", Pri: 0,
			Poses: ToMap(ARMPOSES)
		},
		{ Name: "LegLeft", Layer: "LegLeft", Pri: 0,
			Poses: ToMap(LEGPOSES)
		},
		{ Name: "Torso", Layer: "Torso", Pri: 0,
		},
		{ Name: "LegRight", Layer: "LegRight", Pri: 0,
			Poses: ToMap(LEGPOSES)
		},
	])
});