let LAYERS_BASE = [
	"FurnitureFront",

	// These are in front b/c the collar acc goes over the leash for visibility
	// and the leash shouldnt go thru the head when hogtied
	"CollarAcc",
	"Leash",

	"HatDeco",
	"Hat",
	"Brows", // Brows should get hidden with mask
	"Ahoge",
	"Circlet",
	"HeadbandDeco",
	"Headband",
	"MouthProp",
	"HairFront",
	"HairOver",
	"Hood", // For Kigu
	// Head items
	"Blindfold",
	"GagOver",
	"GagMuzzleStraps",
	"GagMuzzle",
	"GagFlatStraps",
	"GagFlat",
	"GagStraps",
	"Gag",
	"GagUnder",
	// Hair mid
	"Hair",
	"AnimalEars",
	"MaskOver",
	"CircletUnder",
	"Mask",
	"Goggles",
	"Glasses",
	"BlindfoldWrap",
	"GagWrap",
	// Head
	"Eyes",
	"Mouth",
	"Blush",
	"Head",


	"Yoke",


	// Bondage
	"WrapForeArms",
	"BindForeArms",
	"BindForeElbowLeft",
	"BindForeWristLeft",
	"BindForeWristRight",
	"BindForeHandLeft",
	"BindForeHandRight",
	"BindForeArmLeft",
	"BindForeArmRight",

	"ForeWrists",


	// Forearms (only in HandsFront)
	"ForeWristLeft",

	"ForeSleeveDecoLeft",
	"ForeSleeveLeft",
	"ForeMittenLeft",
	"ForeGloveLeft",
	"ForeHandLeft",
	"ForeArmLeft",

	"ForeWristRight",

	"ForeSleeveDecoRight",
	"ForeSleeveRight",
	"ForeMittenRight",
	"ForeGloveRight",
	"ForeHandRight",
	"ForeArmRight",

	// Clothes that go over the chest and hang down
	"Shoulders",

	// Hair mid
	"HairMid",


	// Collar and collar accessories
	"Collar",
	"NeckCorset",




	// This slot is for things like breastplates and things that go over
	"WrappingChest",

	"WrapArms",

	"Jacket",
	"ChestDeco",
	"ChestStraps",
	"Chestplate",

	// Bondage
	"BindArms",




	// Chest is breasts, should only intersect on bottom and side edges, top is indeterminate
	"Straps",
	"NecklaceCharm",
	"Necklace",


	"HarnessOver",
	"WrapChest",
	"BindChest",
	"BustierCollar",
	"BustierChest",
	"ShirtCollar",
	"ShirtChest",
	"Option_BindChestLower",
	"BraChest",
	"BindChestLower",
	"SuitChest",
	"Chest",

	"WrappingTorsoUpper",
	"StrapsUnderbustOver",
	"WrappingTorsoOver",

	// Crossed arms bondage -- left arm is mostly hidden, no hands
	"WrapCrossArms",
	"BindCrossArms",
	"BindCrossElbowLeft",
	"BindCrossWristRight",
	"BindCrossArmLeft",
	"BindCrossArmRight",

	// Crossed arms -- order is inverted
	"SleevesCrossArms",
	"CrossSleeveDecoRight",
	"CrossSleeveRight",
	"CrossMittenRight",
	"CrossGloveRight",
	"CrossArmRight",
	"CrossSleeveDecoLeft",
	"CrossSleeveLeft",
	"CrossMittenLeft",
	"CrossGloveLeft",
	"CrossArmLeft",


	// Certain pieces of armor go over the shirt
	"BeltBondage",
	"BeltCharm",
	"BeltDeco",
	"Belt",

	"BaggyShirt",

	// Skirts that dont follow shilhouette
	"WrappingLegsOver2",
	"OverSkirtDeco",
	"OverSkirt",
	"Greaves",

	"StrapsUnderbust",

	"OverCrotchStrapMid",
	"HarnessMid",

	"BeltUnder",

	"CrotchPanelMid",
	"WrappingTorsoMid", // For stuff that goes over a shirt and clothes but under restraints, e.g. tape



	// For form-fitting stuff that nonetheless goes over a shirt
	"Bustier",

	// Skirt part that goes in front of corsets, shirts, etc
	"SkirtOverDeco",
	"SkirtOver",

	// Belts and corsets that only go over
	"Cincher",

	"Shirt",
	// For things that go directly under the breasts
	"Underbust",
	// For things that go around armpit area--mainly ropes and stuff that goes under the breasts
	"Underarms",





	// Corsets that go under harness and poofy skirt
	"Corset",

	"Bra",

	// Skirts that are slim and follow the shilhouette
	"SkirtDeco",
	"Skirt",


	"WrappingLegsOver",

	"WrappingTorsoUnder",// For skintight stuff

	// Left Leg
	"KneeAccLeft",
	"ThighsOver",
	"Thighs",
	"Thighs3",
	"Thighs2",
	"Thighs1",
	"ThighLeftOver",
	"ThighLeft",

	"WrappingAnklesOver",

	"AnklesOver",
	"Ankles",
	"Ankles3",
	"Ankles2",
	"Ankles1",
	"AnkleLeftOver",
	"AnkleLeft",

	"WrappingLegs",

	"PantsAccLeft",
	"PantLeft",

	"BindFeet",
	"OverShoes",
	"ShoeLeftOver",
	"ShoeLeftDeco",
	"ShoeLeft",
	"ShoeLeftUnder",



	"WrappingLegsUnder",

	"OverSocks",
	"StockingLeft",
	"FootLeft",
	"LegLeft",

	"Option_ChastityBelt",

	// Panties go here when standing
	"Panties",

	// Upper body underwear and bodysuits
	"CorsetLiner",
	"Bodysuit",

	"ChastityBelt",
	// Lower harness
	"OverCrotchStrap",
	"HarnessLower",
	"CrotchPanelLower",
	"WrappingTorso",



	// These are for the base skirt layer when kneeling
	// The over layer is for kneeling
	// Skirts that dont follow shilhouette and are puffy
	"SkirtOverLowerDeco",
	"SkirtOverLower",

	// Skirts that are slim and follow the shilhouette
	"SkirtLowerDeco",
	"SkirtLower",

	// Right leg
	"WrappingLegsRightOver",
	"BindThighRight",
	"KneeAccRight",
	"ThighRight",
	"AnkleRight",
	"ThighRightOver",
	"AnkleRightOver",
	"PantsAccRight",
	"PantRight",
	"Pants",

	"HarnessUnder",



	// For waist belt
	"BeltBack",

	// Left arm clothes

	"BindWristLeft",
	"WrapArmLeft",
	"BindArmLeft",
	"BindElbowLeft",
	"BindHandLeft",

	"LowerArmBondageLeft",

	"SleeveDecoLeft",
	"SleeveLeft",

	// Left arm body - reserved for body and catsuits
	"WristLeft",
	"MittenLeft",
	"GloveLeft",
	"HandLeft",
	"ArmLeft",

	// Right Shoes
	"ShoeRightOver",
	"ShoeRightDeco",

	"ShoeRight",
	"ShoeRightUnder",
	"WrappingLegsRight",



	// Lower body underwear
	"StockingRight",

	"CorsetUnder", // Corsets go here when wearing pants

	"Option_ChastityBeltLower",

	// Panties go here when kneeling
	"PantiesLower",

	// Upper body underwear and bodysuits
	"CorsetLinerLower",
	"BodysuitLower",

	"ChastityBeltLower",


	// Lower body body - reserved for body and catsuits
	// Note that the lower torso is complex, you should avoid internal overlaps as much as possible
	// External overlaps are fine, e.g. right leg goes over
	"FootRight",
	"LegRight",
	"ShoulderLeft",
	"ShoulderRight",
	"TorsoUpper",
	"Butt",
	"TorsoLower",
	"Torso",

	// Feet behind the body
	"AnkleLeftHogtie",
	"ShoeLeftHogtie",
	"SockLeftHogtie",
	"FootLeftHogtie",
	"AnkleRightKneel",
	"ShoeRightKneel",
	"SockRightKneel",
	"FootRightKneel",

	// Right arm specific bondage
	"WrapArmRight",
	"BindWristRight",
	"BindArmRight",
	"BindCrossElbowRight",
	"BindForeElbowRight",
	"BindElbowRight",
	"BindHandRight",

	// Right arm clothes
	"SleeveDecoRight",
	"SleeveRight",

	// Right arm body - reserved for body and catsuits
	"WristRight",
	"MittenRight",
	"GloveRight",
	"HandRight",
	"ArmRight",

	// Chain links for leg cuffs
	"BindChainLinksUnder",

	// Clothes that go behind
	"SkirtBack",
	"BeltFarBack",
	"Coat",

	// Hair and hat back
	"HairBack",
	"HatBack",

	"Tail",
	"Cape",

	"FurnitureBackLinked",
	"FurnitureBack",
	"BG",
];

/** Handy way of referencing multiple layers */
let LayerGroups = {
	"Breastplate": ToMap([
		"Chest",
		"Shirt",
	]),
	"ChestBinding": ToMap([
		"Chest",
		//"Shirt",
	]),
	"TopBinding": ToMap([
		"Shirt",
	]),
	"CrotchRope": ToMap([
		"HarnessLower",
	]),


	// region slime
	"SlimeLegs": ToMap([
		"Thighs",
		"Thighs3",
		"Thighs2",
		"Thighs1",
		"PantLeft",
		"PantRight",
	]),
	"SlimeFeet": ToMap([
		"Ankles",
		"Ankles3",
		"Ankles2",
		"Ankles1",
		"AnkleLeft",
		"AnkleRight",
	]),
	"Shoes": ToMap([
		"ShoeLeft",
		"ShoeLeftUnder",
		"ShoeRight",
		"ShoeRightUnder",
		"ShoeLeftOver",
		"ShoeRightOver",
		"SockLeft",
		"SockRight",
		"AnkleRightKneel",
		"ShoeRightKneel",
		"ShoeLeftHogtie",
	]),
	"BelowShoes": ToMap([ // Same as above but without shoeover
		"ShoeLeft",
		"ShoeLeftUnder",
		"ShoeRight",
		"ShoeRightUnder",
		"SockLeft",
		"SockRight",
		"AnkleRightKneel",
		"ShoeRightKneel",
		"ShoeLeftHogtie",
	]),
	"SlimeAnkles": ToMap([
		"Ankles",
		"Ankles3",
		"Ankles2",
		"Ankles1",
		"AnkleLeft",
		"AnkleRight",
	]),
	"SlimeTorsoLower": ToMap([
		"OverSkirt",
		"Pants",
	]),
	// endregion

	// region armor
	"Boots": ToMap([
		"AnklesOver",
		"Ankles",
		"Ankles3",
		"Ankles2",
		"Ankles1",
		"AnkleLeft",
		"AnkleRight",
		"AnkleLeftOver",
		"AnkleRightOver",
		"BindFeet",
		"OverShoes",
		"ShoeLeftUnder",
		"ShoeRightUnder",
		"WrappingLegsUnder",
		"WrappingLegsRight",
	]),
	"Heels": ToMap([
		"OverShoes",
		"OverSocks",
		"FootLeft",
		"StockingLeft",
		"FootLeft",
		"LegLeft",
		"FootRight",
		"StockingRight",
		"FootRight",
		"LegRight",
		"ShoeLeftUnder",
		"ShoeRightUnder",
		"WrappingLegsUnder",
		"WrappingLegsRight",
	]),
	"BalletHeels": ToMap([
		"OverShoes",
		"OverSocks",
		"FootLeft",
		"StockingLeft",
		"FootLeft",
		"LegLeft",
		"FootRight",
		"StockingRight",
		"FootRight",
		"LegRight",
		"ShoeLeftUnder",
		"ShoeRightUnder",
		"ShoeLeft",
		"ShoeRight",
		"WrappingLegsUnder",
		"WrappingLegsRight",
	]),
	"HeelRight": ToMap([
		"FootLeft",
		"StockingLeft",
		"FootLeft",
		"LegLeft",
		"FootRight",
		"StockingRight",
		"FootRight",
		"LegRight",
		"ShoeLeftUnder",
		"ShoeRightUnder",
		"WrappingLegsRight",
		"WrappingLegsUnder",

	]),
	"BalletHeelRight": ToMap([
		"FootLeft",
		"StockingLeft",
		"FootLeft",
		"LegLeft",
		"FootRight",
		"StockingRight",
		"FootRight",
		"LegRight",
		"ShoeLeftUnder",
		"ShoeRightUnder",
		"ShoeLeft",
		"ShoeRight",
		"WrappingLegsUnder",
		"WrappingLegsRight",

	]),
	// endregion

	//region generic
	"Arms": ToMap([
		//"Shirt",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"ArmLeft",
		"ArmRight",
		//"TorsoUpper",

		"CrossMittenLeft",
		"CrossMittenRight",

		"CrossGloveRight",
		"CrossArmRight",
		"CrossGloveLeft",
		"CrossArmLeft",
		/*"BindCrossElbowLeft",
		"BindCrossElbowRight",
		"BindCrossWristRight",
		"BindForeArmLeft",
		"BindForeArmRight",*/
	]),
	"ArmsAll": ToMap([
		"Shirt",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"ArmLeft",
		"ArmRight",
		"TorsoUpper",

		"ChestStraps",
		"StrapsUnderbust",
		"StrapsUnderbustOver",

		"ForeSleeveLeft",
		"ForeSleeveDecoLeft",
		"GloveLeft",
		"ForeHandLeft",

		"ForeWristRight",
		"ForeArmRight",
		"ForeGloveLeft",
		"ForeGloveRight",

		"ForeSleeveRight",
		"ForeSleeveDecoRight",
		"GloveRight",
		"ForeHandRight",

		"MittenLeft",
		"MittenRight",
		"CrossMittenLeft",
		"CrossMittenRight",
		"ForeMittenLeft",
		"ForeMittenRight",

		"CrossGloveRight",
		"CrossArmRight",
		"CrossGloveLeft",
		"CrossArmLeft",


		// Bindings too

		"BindWristLeft",
		"BindWristRight",
		"WrapArmLeft",
		"WrapArmRight",
		"BindArmLeft",
		"BindArmRight",
		"BindElbowLeft",
		"BindElbowRight",
		"BindHandLeft",
		"BindHandRight",


		"BindForeElbowLeft",
		"BindForeElbowRight",
		"BindForeWristLeft",
		"BindForeWristRight",
		"BindForeHandLeft",
		"BindForeHandRight",
		"BindForeArmLeft",
		"BindForeArmRight",


		"BindCrossElbowLeft",
		"BindCrossElbowRight",
		"BindCrossWristRight",
		"BindForeArmLeft",
		"BindForeArmRight",
	]),
	"ArmsAllAndHarness": ToMap([
		"HarnessLower",

		"Shirt",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"ArmLeft",
		"ArmRight",
		"TorsoUpper",

		"ChestStraps",
		"StrapsUnderbust",
		"StrapsUnderbustOver",

		"ForeSleeveLeft",
		"ForeSleeveDecoLeft",
		"GloveLeft",
		"ForeHandLeft",

		"ForeWristRight",
		"ForeArmRight",
		"ForeGloveLeft",
		"ForeGloveRight",

		"ForeSleeveRight",
		"ForeSleeveDecoRight",
		"GloveRight",
		"ForeHandRight",

		"MittenLeft",
		"MittenRight",
		"CrossMittenLeft",
		"CrossMittenRight",
		"ForeMittenLeft",
		"ForeMittenRight",

		"CrossGloveRight",
		"CrossArmRight",
		"CrossGloveLeft",
		"CrossArmLeft",


		// Bindings too

		"BindWristLeft",
		"BindWristRight",
		"WrapArmLeft",
		"WrapArmRight",
		"BindArmLeft",
		"BindArmRight",
		"BindElbowLeft",
		"BindElbowRight",
		"BindHandLeft",
		"BindHandRight",


		"BindForeElbowLeft",
		"BindForeElbowRight",
		"BindForeWristLeft",
		"BindForeWristRight",
		"BindForeHandLeft",
		"BindForeHandRight",
		"BindForeArmLeft",
		"BindForeArmRight",


		"BindCrossElbowLeft",
		"BindCrossElbowRight",
		"BindCrossWristRight",
		"BindForeArmLeft",
		"BindForeArmRight",
	]),
	// endregion

	// Region rope
	"Rope1": ToMap([
		"Shirt",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"ArmLeft",
		"ArmRight",
		"TorsoUpper",

		"CrossGloveRight",
		"CrossArmRight",
		"CrossGloveLeft",
		"CrossMittenLeft",
		"CrossMittenRight",
		"CrossArmLeft",
	]),
	"RopeTorso": ToMap([
		"Shirt",
		"CorsetLiner",
		// Skirts that dont follow shilhouette and are puffy
		"SkirtOverDeco",
		"SkirtOver",
		"SkirtOverLower",
		// Skirts that are slim and follow the shilhouette
		"SkirtDeco",
		"Skirt",
		"SkirtLower",

		"PantLeft",
		"PantRight",
		"Pants",

		"OverSocks",
		"StockingLeft",
		"StockingRight",

		"Bodysuit",
		"Panties",
		"Torso",
		"TorsoUpper",
		"Butt",
		"TorsoLower",
		"Torso",
	]),
	"CorsetTorso": ToMap([
		"Shirt",
		"CorsetLiner",
		// Skirts that dont follow shilhouette and are puffy
		"SkirtOverDeco",
		"SkirtOver",
		"SkirtOverLower",
		// Skirts that are slim and follow the shilhouette
		"SkirtDeco",
		"Skirt",
		"SkirtLower",

		"PantLeft",
		"PantRight",
		"Pants",

		"OverSocks",
		"StockingLeft",
		"StockingRight",

		"Bodysuit",
		"Panties",
		"Torso",
		"TorsoUpper",
		"Butt",
		"TorsoLower",
		"Torso",
	]),

	"PetsuitArms": ToMap([
		"BindForeElbowLeft",
		"BindForeWristLeft",
		"BindForeWristRight",
		"BindForeHandLeft",
		"BindForeHandRight",
		"BindForeArmLeft",
		"BindForeArmRight",

		"ForeWrists",


		// Forearms (only in HandsFront)
		"ForeWristLeft",

		"ForeSleeveDecoLeft",
		"ForeSleeveLeft",
		"ForeMittenLeft",
		"ForeGloveLeft",
		"ForeHandLeft",
		"ForeArmLeft",

		"ForeWristRight",

		"ForeSleeveDecoRight",
		"ForeSleeveRight",
		"ForeMittenRight",
		"ForeGloveRight",
		"ForeHandRight",
		"ForeArmRight",

		"GloveLeft",
		"GloveRight",
	]),

	"RopeFore": ToMap([
		"ForeSleeveLeft",
		"ForeSleeveDecoLeft",
		"GloveLeft",
		"ForeHandLeft",

		"ForeWristRight",
		"ForeArmRight",

		"ForeSleeveRight",
		"ForeSleeveDecoRight",
		"GloveRight",
		"MittenLeft",
		"MittenRight",
		"ForeHandRight",
	]),

	"RopeThighs": ToMap([
		"PantLeft",
		"PantRight",
		"Pants",

		"OverSocks",
		"StockingLeft",
		"StockingRight",

		"ShoeLeftDeco",
		"ShoeLeft",
		"ShoeLeftUnder",
		"ShoeRightDeco",
		"ShoeRight",
		"ShoeRightUnder",

		"Panties",

		"TorsoUpper",
		"Butt",
		"TorsoLower",
		"Torso",
		"LegLeft",
		"LegRight",

		"AnkleLeftHogtie",
		"ShoeLeftHogtie",
		"SockLeftHogtie",
		"FootLeftHogtie",
		"AnkleRightKneel",
		"ShoeRightKneel",
		"SockRightKneel",
		"FootRightKneel",
	]),

	"RopeCalf": ToMap([
		"PantLeft",
		"PantRight",
		"Pants",

		// Shoes
		"ShoeLeftDeco",
		"ShoeLeft",
		"ShoeLeftUnder",
		"ShoeRightDeco",
		"ShoeRight",
		"ShoeRightUnder",

		"OverSocks",
		"StockingLeft",
		"StockingRight",

		"LegLeft",
		"LegRight",

		"AnkleLeftHogtie",
		"ShoeLeftHogtie",
		"SockLeftHogtie",
		"FootLeftHogtie",
		"AnkleRightKneel",
		"ShoeRightKneel",
		"SockRightKneel",
		"FootRightKneel",
	]),
	"ToeTie": ToMap([

		"ShoeLeft",
		"ShoeLeftUnder",
		"ShoeRight",
		"ShoeRightUnder",
		"ShoeLeftHogtie", "ShoeRightKneel",
		"AnkleLeftHogtie",
		"AnkleRightKneel",
	]),
	// endregion


	// Region Ribbon
	"Ribbon1": ToMap([
		"Shirt",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"ArmLeft",
		"ArmRight",
		"TorsoUpper",

		"CrossGloveRight",
		"CrossMittenLeft",
		"CrossMittenRight",
		"CrossArmRight",
		"CrossGloveLeft",
		"CrossArmLeft",
	]),
	"RibbonTorso": ToMap([
		"Shirt",
		"CorsetLiner",
		// Skirts that dont follow shilhouette and are puffy
		"SkirtOverDeco",
		"SkirtOver",
		// Skirts that are slim and follow the shilhouette
		"SkirtDeco",
		"Skirt",

		"PantLeft",
		"PantRight",
		"Pants",

		"OverSocks",
		"StockingLeft",
		"StockingRight",

		"Panties",

		"TorsoUpper",
		"Butt",
		"TorsoLower",
		"Torso",
	]),

	"RibbonFore": ToMap([
		"ForeSleeveLeft",
		"ForeSleeveDecoLeft",
		"MittenLeft",
		"GloveLeft",
		"ForeHandLeft",

		"ForeWristRight",
		"ForeArmRight",

		"ForeSleeveRight",
		"ForeSleeveDecoRight",
		"MittenRight",
		"GloveRight",
		"ForeHandRight",
	]),

	"CorsetBra": ToMap([
		"Chest",
		"ShirtChest",
		"SuitChest",
		"BraChest",
		"BindChestLower",
	]),
	"ShirtCutoffBra": ToMap([
		"Chest",
		"SuitChest",
		"BraChest",
		"BindChestLower",
	]),

	"RibbonThighs": ToMap([
		"PantLeft",
		"PantRight",
		"Pants",

		"OverSocks",
		"StockingLeft",
		"StockingRight",

		"Panties",

		"TorsoUpper",
		"Butt",
		"TorsoLower",
		"Torso",
		"LegLeft",
		"LegRight",

		"AnkleLeftHogtie",
		"ShoeLeftHogtie",
		"SockLeftHogtie",
		"FootLeftHogtie",
		"AnkleRightKneel",
		"ShoeRightKneel",
		"SockRightKneel",
		"FootRightKneel",
	]),

	"RibbonCalf": ToMap([
		"PantLeft",
		"PantRight",
		"Pants",

		// Shoes
		"ShoeLeftDeco",

		"ShoeLeft",
		"ShoeLeftUnder",
		"ShoeRightDeco",

		"ShoeRight",
		"ShoeRightUnder",

		"OverSocks",
		"StockingLeft",
		"StockingRight",

		"LegLeft",
		"LegRight",

		"ShoeLeftHogtie",
		"SockLeftHogtie",
		"FootLeftHogtie",
		"AnkleLeftHogtie",
		"AnkleRightKneel",
		"ShoeRightKneel",
		"SockRightKneel",
		"FootRightKneel",
	]),
	"RibbonToeTie": ToMap([

		"ShoeLeft",
		"ShoeLeftUnder",
		"ShoeRight",
		"ShoeRightUnder",
		"ShoeLeftHogtie",
		"ShoeRightKneel",
		"AnkleLeftHogtie",
		"AnkleRightKneel",
	]),
	// endregion

	// region metal


	"LegCuffs": ToMap([
		"PantLeft",
		"PantRight",
		"Pants",

		// Shoes
		"ShoeLeftDeco",

		"ShoeLeft",
		"ShoeLeftUnder",
		"ShoeRightDeco",

		"ShoeRight",
		"ShoeRightUnder",

		"OverSocks",
		"StockingLeft",
		"StockingRight",

		"LegLeft",
		"LegRight",

		"ShoeLeftHogtie",
		"SockLeftHogtie",
		"FootLeftHogtie",
		"AnkleLeftHogtie",
		"AnkleRightKneel",
		"ShoeRightKneel",
		"SockRightKneel",
		"FootRightKneel",
	]),

	"Yoke": ToMap([
		"Shirt",
		"MittenLeft",
		"MittenRight",
		"GloveLeft",
		"GloveRight",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"ArmLeft",
		"ArmRight",
	]),
	"Cuffs": ToMap([
		// Affect clothes only not skintight
		"Shirt",
		//"MittenLeft",
		//"MittenRight",
		//"GloveLeft",
		//"GloveRight",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		//"ArmLeft",
		//"ArmRight",
	]),
	"Mitts": ToMap([
		"CrossGloveRight",
		"CrossHandRight",
		"CrossGloveLeft",
		"CrossHandLeft",
		"GloveRight",
		"HandRight",
		"GloveLeft",
		"HandLeft",
		"ForeGloveRight",
		"ForeHandRight",
		"ForeGloveLeft",
		"ForeHandLeft",
	]),
	// endregion

	// region Xray
	Xray: ToMap(
		[
			"FurnitureFront",

	"MouthProp",
	"Hood", // For Kigu
	"MaskOver",


	"NeckCorset",
	// Hair mid
	"Mask",
	"BlindfoldWrap",
	"GagWrap",

	// Clothes that go over the chest and hang down
	"Shoulders",

	// Forearms (only in HandsFront)
	"ForeSleeveLeft",
	"ForeSleeveDecoLeft",

	"ForeSleeveRight",
	"ForeSleeveDecoRight",



	// This slot is for things like breastplates and things that go over
	"WrappingChest",

	"Jacket",
	"ChestDeco",
	"Chestplate",
	"WrapChest",

	// Bondage




	// Chest is breasts, should only intersect on bottom and side edges, top is indeterminate
	//"NecklaceCharm",
	//"Necklace",

	"BustierCollar",
	"BustierChest",
	"ShirtCollar",
	"ShirtChest",

	//"StrapsUnderbustOver",
	"WrappingTorsoUpper",
	"WrappingTorsoOver",

	"WrapForeArms",
	"WrapCrossArms",

	// Crossed arms -- order is inverted
	"SleevesCrossArms",
	"CrossSleeveDecoRight",
	"CrossSleeveRight",
	"CrossSleeveDecoLeft",
	"CrossSleeveLeft",
	"WrapArmLeft",
	"WrapArmRight",

	// Certain pieces of armor go over the shirt
	"BeltBondage",
	"BeltCharm",
	"Belt",
	"BeltDeco",
	"BeltUnder",

	"BaggyShirt",

	// Skirts that dont follow shilhouette
	"WrappingLegsOver2",
	"OverSkirtDeco",
	"OverSkirt",
	"Greaves",

	"WrappingTorsoMid", // For stuff that covers a shirt

	// For form-fitting stuff that nonetheless goes over a shirt
	"Bustier",
	"Shirt",

	"WrappingTorsoUnder", // For skintight stuff

	// Skirts that dont follow shilhouette and are puffy
	"SkirtOverDeco",
	"SkirtOver",

	"WrappingLegsOver",
	"WrappingAnklesOver",

	// Corsets that go under harness and poofy skirt
	//"Corset",

	// Skirts that are slim and follow the shilhouette
	"SkirtDeco",
	"Skirt",


	// Left Leg
	"ThighsOver",
	"ThighLeftOver",
	//"ThighLeft",
	"AnklesOver",
	"AnkleLeftOver",
	"ThighRightOver",
	"AnkleRightOver",

	"WrappingLegs",
	"WrappingLegsUnder",

	"PantsAccLeft",
	"PantLeft",

	"OverShoes",
	"ShoeLeftOver",
	"OverSocks",

	// Lower harness
	"OverCrotchStrap",
	"WrappingTorso",

	// These are for the base skirt layer when kneeling
	// The over layer is for kneeling
	// Skirts that dont follow shilhouette and are puffy
	"SkirtOverLowerDeco",
	"SkirtOverLower",

	// Skirts that are slim and follow the shilhouette
	"SkirtLowerDeco",
	"SkirtLower",

	// Right leg
	"WrappingLegsRightOver",
	"WrappingLegsRight",
	"KneeAccRight",
	"PantsAccRight",
	"PantRight",
	"Pants",

	"SleeveDecoLeft",
	"SleeveLeft",

	// Right Shoes
	"ShoeRightOver",

	"CorsetUnder", // Corsets go here when wearing pants

	// Upper body underwear and bodysuits
	"CorsetLiner",
	"CorsetLinerLower",

	// Right arm clothes
	"SleeveDecoRight",
	"SleeveRight",
		]
	),
	// Extra layer of unpeeling over the head if we are wearing a blindfold or harness gag
	XrayFace: ToMap(
		[
			// Head items
			"Blindfold",
			"GagOver",
			"GagMuzzleStraps",
			"GagMuzzle",
			"GagFlatStraps",
			"GagFlat",
		]
	),
	// Panty xray only if we are wearing a chastity belt
	XrayPanties: ToMap(
		[
			//"BraChest",
			//"SuitChest",
			"PantiesLower",
			"Bodysuit",
			"BodysuitLower",
			"CrotchPanelMid",
			"CrotchPanelLower",
			"Panties",
			//"Bra",
		]
	),
	// Bra xray only if we are wearing a chastity bra
	XrayBra: ToMap(
		[
			"BraChest",
			"SuitChest",
			"Bodysuit",
			"Bra",
		]
	),
	// endregion

	// region ALL
	"All": ToMap(
		LAYERS_BASE
	),
	// endregion
};



let LayerProperties = {
	ShoeLeftOver: {
		Parent: "ShoeLeft",
	},
	ShoeLeftUnder: {
		Parent: "ShoeLeft",
	},
	ShoeRightOver: {
		Parent: "ShoeRight",
	},
	ShoeRightUnder: {
		Parent: "ShoeRight",
	},
	FurnitureFront: {
		Parent: "BG",
	},
	FurnitureBack: {
		Parent: "BG",
	},
	Glasses: {
		Parent: "Head",
	},
	Eyes: {
		Parent: "Head",
	},
	Hair: {
		Parent: "Head",
	},
	HairFront: {
		Parent: "Head",
	},
	HairOver: {
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
	Blush: {
		Parent: "Head",
	},
	Brows: {
		Parent: "Head",
	},
	Ears: {
		Parent: "Head",
	},
	Nose: {
		Parent: "Head",
	},
	Hat: {Parent: "Head",},
	Hood: {Parent: "Head",},
	HeadbandDeco: {Parent: "Head"},
	Headband: {Parent: "Head"},
	Mask: {Parent: "Head"},
	MaskOver: {Parent: "Head"},
	MouthProp: {Parent: "Head"},
	Goggles: {Parent: "Head"},
	BlindfoldWrap: {Parent: "Head"},
	Blindfold: {Parent: "Head"},
	GagOver: {Parent: "Head"},
	GagMuzzleStraps: {Parent: "Head"},
	GagMuzzle: {Parent: "Head"},
	GagFlatStraps: {Parent: "Head"},
	GagFlat: {Parent: "Head"},
	GagStraps: {Parent: "Head"},
	Gag: {Parent: "Head"},
	GagUnder: {Parent: "Head"},
	Circlet: {Parent: "Head"},
	CircletUnder: {Parent: "Head"},
	HatBack: {Parent: "Head"},
	AnimalEars: {Parent: "Head"},
	Tail: {Parent: "Torso"},



};

let Hardpoints = {
	Front: {
		Parent: "Torso",
		X: 1162,
		Y: 1790,
		Angle: Math.PI*1.5,
	},
	Rear: {
		Parent: "Torso",
		X: 1127,
		Y: 1799,
		Angle: Math.PI*1.5,
	},
	Chest: {
		Parent: "Torso",
		X: 1144,
		Y: 1127,
		Angle: Math.PI*1.0,
	},
	BreastLeft: {
		Parent: "Chest",
		X: 950,
		Y: 1127,
		Angle: Math.PI*1.0,
	},
	BreastRight: {
		Parent: "Chest",
		X: 1350,
		Y: 1127,
		Angle: Math.PI*1.0,
	},
};

// Constants
/** Internal value for layering */
let LAYER_INCREMENT = 500;

let MODELHEIGHT = 3500;
let MODELWIDTH = 2480;
/** Model scale to UI scalee */
let MODEL_SCALE = 1000/MODELHEIGHT;
let MODEL_XOFFSET = Math.floor((- MODELWIDTH * MODEL_SCALE)/2);