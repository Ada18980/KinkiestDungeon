let LAYERS_BASE = [
	"Hat",
	"Headband",
	"HairFront",
	"Mask",
	"Circlet",
	"Brows",
	"Hair",
	"Blindfold",
	"Gag",
	// Head
	"Eyes",
	"Mouth",
	"Blush",
	"Head",
	"HatBack",

	// Clothes that go over the chest and hang down
	"Shoulders",

	// Hair mid
	"HairMid",

	// Collar and collar accessories
	"CollarAcc",
	"Collar",


	// Forearms (only in HandsFront)
	"ForeSleeveLeft",
	"ForeSleeveDecoLeft",
	"GloveLeft",
	"ForeHandLeft",
	"ForeArmLeft",

	"ForeSleeveRight",
	"ForeSleeveDecoRight",
	"GloveRight",
	"ForeHandRight",
	"ForeArmRight",

	// This slot is for things like breastplates and things that go over
	"ChestDeco",
	"ChestStraps",
	"Chestplate",
	// Certain pieces of armor go over the shirt
	"BeltCharm",
	"Belt",
	"BeltDeco",
	"Greaves",

	// For form-fitting stuff that nonetheless goes over a shirt
	"Bustier",
	"Harness",
	"Shirt",
	// Chest is breasts, should only intersect on bottom and side edges, top is indeterminate
	"Straps",
	"NecklaceCharm",
	"Necklace",
	"Bra",
	"Chest",
	// For things that go directly under the breasts
	"Underbust",
	// For things that go around armpit area--mainly ropes and stuff that goes under the breasts
	"Underarms",
	"Corset",


	// Lower body clothes with a bit more bulk
	"SkirtDeco",
	"Skirt",
	"PantLeft",
	"PantRight",
	"Pants",
	"BeltBack",

	// Left arm clothes
	"SleeveDecoLeft",
	"SleeveLeft",

	// Left arm body - reserved for body and catsuits
	"HandLeft",
	"ArmLeft",

	// Shoes

	"ShoeLeft",
	"ShoeRight",

	// Lower body underwear
	"StockingLeft",
	"StockingRight",
	"Panties",

	// Upper body underwear and bodysuits
	"CorsetLiner",
	"Bodysuit",

	// Lower body body - reserved for body and catsuits
	// Note that the lower torso is complex, you should avoid internal overlaps as much as possible
	// External overlaps are fine, e.g. right leg goes over
	"FootLeft",
	"LegLeft",
	"FootRight",
	"LegRight",
	"FootLeftHogtie",
	"FootRightKneel",
	"Butt",
	"TorsoUpper",
	"TorsoLower",
	"Torso",

	// Right arm clothes
	"SleeveDecoRight",
	"SleeveRight",

	// Right arm body - reserved for body and catsuits
	"HandRight",
	"ArmRight",

	// Clothes that go behind
	"BeltFarBack",
	"Coat",
	"Cape",

	// Hair back
	"HairBack",
];

let LayerProperties = {
	Eyes: {
		Parent: "Head",
	},
	Hair: {
		Parent: "Head",
	},
	HairFront: {
		Parent: "Head",
	},
	HairMiddle: {
		Parent: "Head",
	},
	HairBack: {
		Parent: "Head",
	},
	Mouth: {
		Parent: "Head",
	},
	Ears: {
		Parent: "Head",
	},
	Nose: {
		Parent: "Head",
	},
};

// Constants
/** Internal value for layering */
let LAYER_INCREMENT = 1000;

let MODELHEIGHT = 3500;
let MODELWIDTH = 2480;
/** Model scale to UI scalee */
let MODEL_SCALE = 1000/MODELHEIGHT;
let MODEL_XOFFSET = Math.floor((- MODELWIDTH * MODEL_SCALE)/2);