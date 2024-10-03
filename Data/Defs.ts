let LAYERS_BASE = [
	"Weapon",
	"FurnitureFront",
	"FurnitureLinked",

	// These are in front b/c the collar acc goes over the leash for visibility
	// and the leash shouldnt go thru the head when hogtied
	"CollarAcc",
	"Leash",
	// Collar ring is meant to go under the leash
	"CollarRing",

	"AnimalEarsFront",
	"HatDeco",
	"Hat",
	"InflatableHead",
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
	"GagStrapsUnder",
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


	"InflatableArms",
	"InflatableLegs",
	"FiddleFront",


	// Bondage
	"WrapForeArms",
	"BindForeArms",
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

	"Yoke",

	// Clothes that go over the chest and hang down
	"Shoulders",

	// Hair mid
	"HairMid",


	// Collar and collar accessories
	"Collar",




	// This slot is for things like breastplates and things that go over
	"WrappingChest",
	"UpperArmStraps",

	"WrapArms",

	"Jacket",
	"Chestplate",

	// Bondage
	"WrapArms",
	"BindArms",


	"ChestDeco",
	"ChestStraps",


	// Chest is breasts, should only intersect on bottom and side edges, top is indeterminate
	"Straps",
	"NecklaceCharm",
	"Necklace",


	"WrapChest",
	"HarnessOver",
	"BindChest",
	"BustierCollar",
	"BustierChest",
	"ShirtCollar",
	"ShirtChest",
	"Option_BindChestLower",
	"NippleToysOption",
	"NeckCorset",
	"SuitChestOver",
	"BraChest",
	"BindChestLower",
	"SuitChest",
	"CatsuitChest",
	"NippleToys",
	"Nipples",
	"Chest",

	"WrappingTorsoUpper",
	"StrapsUnderbustOver",
	"WrappingTorsoOver",

	// Crossed arms bondage -- left arm is mostly hidden, no hands
	"WrapCrossArms",
	"BindCrossArms",
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
	"BeltCharmSide",
	"BeltCharm",
	"BeltDeco",
	"Belt",

	"BaggyShirt",

	// Skirts that dont follow shilhouette
	"OverSkirtDeco",
	"OverSkirt",
	"WrappingLegsOver2",
	"LegbinderLegsOver2",
	"Greaves",

	"WrappingTorsoMid", // For stuff that goes over a shirt and clothes but under restraints, e.g. tape

	"StrapsUnderbust",

	"WrappingTorsoLower",

	"OverCrotchStrapMid",
	"Option2_ChastityBelt",
	"HarnessMid",

	"BeltUnder",

	"CrotchPanelMid",



	// For form-fitting stuff that nonetheless goes over a shirt
	"Bustier",

	"ShirtOver",

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
	"LegbinderLegsOver",
	"PetsuitLegs",

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
	"LegbinderAnklesOver",

	"AnklesOver",
	"Ankles",
	"Ankles3",
	"Ankles2",
	"Ankles1",
	"AnkleLeftOver",
	"AnkleLeft",

	"WrappingLegs2",
	"WrappingLegs",

	"PantsAccLeft",
	"ShortsLeft",
	"PantLeft",

	"BindFeet",
	"OverShoes",
	"ShoeLeftOver",
	"ShoeLeftDeco",
	"ShoeLeft",
	"ShoeLeftUnder",



	"WrappingLegsUnder",

	"Shorts",

	"OverSocks",
	"StockingLeftKneel", "StockingLeft",
	"FootLeft",
	"LegLeft",

	// Lower harness
	"Option2_ChastityBeltLower",
	"HarnessLower",
	"CrotchPanelLower",

	"WrappingTorso",
	"OverCrotchStrap",

	"Option_ChastityBelt",
	"Option_CrotchRope",
	"BodysuitOver",

	// Panties go here when standing
	"Panties",

	// Upper body underwear and bodysuits
	"CorsetLiner",
	"Bodysuit",

	"ChastityBelt",
	"CrotchRope",



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
	"RightThighs3",
	"RightThighs2",
	"RightThighs1",
	"KneeAccRight",
	"ThighRight",
	"AnkleRight",
	"ThighRightOver",
	"AnkleRightOver",
	"PantsAccRight",
	"PantRight",
	"PantLegs",

	"HarnessUnder",



	// For waist belt
	"BeltBack",

	// Left arm clothes

	"BindWristLeft",
	"WrapArmLeft",
	"BindArmLeft",
	"BindCrossElbowLeft",
	"BindForeElbowLeft",
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
	"UpSleeveRight",
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
	"Wings",
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
		"ShirtOver",
	]),
	"ChestBinding": ToMap([
		"Chest",
		//"Shirt",
		//"ShirtOver",
	]),
	"TopBinding": ToMap([
		"Shirt",
		"ShirtOver",
	]),
	"CrotchRope": ToMap([
		"HarnessLower",
	]),
	ButtSleeves: ToMap([
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"BeltBack",
		"ShoeLeft",
	]),
	BustierPoses: ToMap([
		"Bustier",
		"Corset",
		"CorsetLiner",
		"HarnessLower",
		"HarnessMid",
		"ChastityBelt",
		"CrotchRope",
		"Option_ChastityBelt",
		"Option2_ChastityBelt",
		"Option_CrotchRope",
		"Panties",
		"CrotchPanelMid",
		"Bodysuit",
		//"Skirt",
		//"WrappingTorsoMid",
	]),
	BustierPoses2: ToMap([
		"Bustier",
		"Corset",
		"CorsetLiner",
		"HarnessLower",
		"HarnessMid",
		"ChastityBelt",
		"CrotchRope",
		"Option_ChastityBelt",
		"Option2_ChastityBelt",
		"Option_CrotchRope",
		"Panties",
		"CrotchPanelMid",
		"Bodysuit",
		"WrappingTorsoMid",
		"WrappingTorsoLower",
	]),
	BustSize: ToMap([
		"WrapChest",
		"HarnessOver",
		"BindChest",
		"BustierCollar",
		"BustierChest",
		"ShirtCollar",
		"ShirtChest",
		"Option_BindChestLower",
		"NippleToysOption",
		"SuitChestOver",
		"BraChest",
		"BindChestLower",
		"SuitChest",
		"CatsuitChest",
		"NippleToys",
		"Nipples",
		"Chest",
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
		"ShortsLeft",
		"Shorts",
	]),
	// endregion

	// region armor
	"Petsuit": ToMap([
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
	"Legbinder": ToMap([
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
		"PetsuitLegs",
	]),
	"SlimeThighs": ToMap([
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
		"LegbinderLegsOver",
		"LegbinderAnklesOver",
		"PetsuitLegs",
	]),
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
		"StockingLeftKneel", "StockingLeft",
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
		"StockingLeftKneel", "StockingLeft",
		"LegLeft",
		"FootRight",
		"StockingRight",
		"LegRight",
		"ShoeLeftUnder",
		"ShoeRightUnder",
		"ShoeLeft",
		"ShoeRight",
		"WrappingLegsUnder",
		"WrappingLegsRight",
	]),
	"BalletHeelsCuffs": ToMap([
		"AnkleLeft",
		"AnkleRight",
	]),
	"HeelRight": ToMap([
		"FootLeft",
		"FootRightKneel",
		"StockingLeftKneel", "StockingLeft",
		"FootLeftKneel",
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
		"FootRightKneel",
		"StockingLeftKneel", "StockingLeft",
		"StockingLeftKneel", "StockingLeft",
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
		"UpSleeveRight",
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
		"ShirtOver",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"UpSleeveRight",
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
		"WrapArms",
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
		"ShirtOver",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"UpSleeveRight",
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
		"WrapArms",
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
		"ShirtOver",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"UpSleeveRight",
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
		"ShirtOver",
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
		"ShortsLeft",
		"Shorts",

		"OverSocks",
		"StockingLeftKneel", "StockingLeft",
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
		"ShirtOver",
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
		"ShortsLeft",
		"Shorts",

		"OverSocks",
		"StockingLeftKneel", "StockingLeft",
		"StockingRight",

		"Bodysuit",
		"Panties",
		"Torso",
		"TorsoUpper",
		"Butt",
		"TorsoLower",
		"Torso",
	]),
	"TightChastityBelt": ToMap([
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
		"ShortsLeft",
		"Shorts",

		"OverSocks",
		"StockingLeftKneel", "StockingLeft",
		"StockingRight",

		"Bodysuit",
		"BodysuitLower",
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

		"MittenRight",
		"MittenLeft",
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
		"ShortsLeft",
		"Shorts",

		"OverSocks",
		"StockingLeftKneel", "StockingLeft",
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
		"ShortsLeft",
		"Shorts",

		// Shoes
		"ShoeLeftDeco",
		"ShoeLeft",
		"ShoeLeftUnder",
		"ShoeRightDeco",
		"ShoeRight",
		"ShoeRightUnder",

		"OverSocks",
		"StockingLeftKneel", "StockingLeft",
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
		"ShirtOver",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"UpSleeveRight",
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
		"ShirtOver",
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
		"ShortsLeft",
		"Shorts",

		"OverSocks",
		"StockingLeftKneel", "StockingLeft",
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
		"SuitChestOver",
		"SuitChest",
		"BraChest",
		"BindChestLower",
	]),
	"ShirtCutoffBra": ToMap([
		"Chest",
		"SuitChestOver",
		"SuitChest",
		"BraChest",
		"BindChestLower",
		"Option_BindChestLower",
	]),

	"MaidArmPoofRight": ToMap([
		"TorsoUpper",
		"Torso",
		"SleeveRight",
		"ArmRight",
		"GloveRight",
	]),

	"RibbonThighs": ToMap([
		"PantLeft",
		"PantRight",
		"Pants",
		"ShortsLeft",
		"Shorts",

		"OverSocks",
		"StockingLeftKneel", "StockingLeft",
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
		"ShortsLeft",
		"Shorts",

		// Shoes
		"ShoeLeftDeco",

		"ShoeLeft",
		"ShoeLeftUnder",
		"ShoeRightDeco",

		"ShoeRight",
		"ShoeRightUnder",

		"OverSocks",
		"StockingLeftKneel", "StockingLeft",
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
		"ShortsLeft",
		"Shorts",

		// Shoes
		"ShoeLeftDeco",

		"ShoeLeft",
		"ShoeLeftUnder",
		"ShoeRightDeco",

		"ShoeRight",
		"ShoeRightUnder",

		"OverSocks",
		"StockingLeftKneel", "StockingLeft",
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
		"ShirtOver",
		"MittenLeft",
		"MittenRight",
		"GloveLeft",
		"GloveRight",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"UpSleeveRight",
		"ArmLeft",
		"ArmRight",
	]),
	"Fiddle": ToMap([

		"GloveLeft",
		"GloveRight",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"ArmLeft",
		"ArmRight",


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
	]),
	"Cuffs": ToMap([
		// Affect clothes only not skintight
		"Shirt",
		"ShirtOver",
		//"MittenLeft",
		//"MittenRight",
		//"GloveLeft",
		//"GloveRight",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"UpSleeveRight",
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
	"RightHand": ToMap([
		"GloveRight",
		"HandRight",
		"ArmRight",
		"MittenRight",
	]),
	// endregion

	HairHelmet: ToMap(
		[

			"AnimalEars",
			"AnimalEarsFront",
			"Ahoge",
			"MouthProp",
			"HairFront",
			"HairOver",
			"HairBack",
			"Hood",
			"Hair",
			"Head",
		]
	),
	// region Xray
	Xray: ToMap(
		[
			"FurnitureFront",
			"FurnitureLinked",

			"InflatableHead",
			"InflatableArms",
			"InflatableLegs",
	"MouthProp",
	"Hood", // For Kigu
	"MaskOver",
	"OverCrotchStrapMid",

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

	"UpperArmStraps",

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
	"WrapArms",
	"WrapArmRight",

	// Certain pieces of armor go over the shirt
	"BeltBondage",
	"BeltCharm",
	"BeltCharmSide",
	"Belt",
	"BeltDeco",
	"BeltUnder",

	"BaggyShirt",

	// Skirts that dont follow shilhouette
	"WrappingLegsOver2",
	"LegbinderLegsOver2",
	"WrappingLegsOver",
	"LegbinderLegsOver",
	"OverSkirtDeco",
	"OverSkirt",
	"Greaves",

	"WrappingTorsoMid", // For stuff that covers a shirt
	"WrappingTorsoLower",

	// For form-fitting stuff that nonetheless goes over a shirt
	"Bustier",
	"Shirt",
	"ShirtOver",

	"WrappingTorsoUnder", // For skintight stuff

	// Skirts that dont follow shilhouette and are puffy
	"SkirtOverDeco",
	"SkirtOver",

	"WrappingLegsOver",
	"LegbinderLegsOver",
	"PetsuitLegs",
	"WrappingAnklesOver",
	"LegbinderAnklesOver",

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

	"WrappingLegs2",
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
	"ShortsLeft",
	"Shorts",

	"SleeveDecoLeft",
	"SleeveLeft",
	"SuitChestOver",
	"UpSleeveRight",

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

	WrappingLegsOver: {
		"WrappingLegsOver2": true,
		"LegbinderLegsOver2": true,
		"WrappingLegsOver": true,
		"LegbinderLegsOver": true,
		"WrappingLegs": true,
		"WrappingLegs2": true,
	},
	BindWristLeft: {
		"BindWristLeft": true,
		"BindForeWristLeft": true,
		"BindCrossWristLeft": true,
	},
	BindWristRight: {
		"BindWristRight": true,
		"BindForeWristRight": true,
		"BindCrossWristRight": true,
	},
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

	Bubble: ToMap(
		[
			"Coat",
			"AnimalEars",

			// Hair and hat back
			"HairBack",
			"HatBack",

			"Tail",
			"Wings",
			"Cape",
			"HatDeco",
			"Hat",
			"Weapon",
			"InflatableHead",
			"Brows", // Brows should get hidden with mask
			"Ahoge",
			"Circlet",
			"HeadbandDeco",
			"Headband",
			"MouthProp",
			"HairFront",
			"Hair",
			"HairOver",
			"Head",
			"Hood", // For Kigu

			"Skirt",
			"SkirtOver",


			"WrappingLegsUnder",
			"WrappingLegs",


			"LegbinderLegsOver2",
			"LegbinderLegsOver",
			"LegbinderAnklesOver",
			"WrappingAnklesOver",

			"WrappingLegsOver2",
			"WrappingLegsOver",
			"WrappingLegs",
			"WrappingLegs2",
			"WrappingLegsUnder",

			"OverSocks",
			"StockingRightKneel", "StockingRight",
			"FootRight",
			"LegRight",
			"StockingLeftKneel", "StockingLeft",
			"FootLeft",
			"LegLeft",

		]
	),

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
	InflatableHead: {Parent: "Head",},
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
	AnimalEarsFront: {Parent: "Head"},
	Tail: {Parent: "Torso"},



};

let Hardpoints = {
	Front: {
		Parent: "Torso",
		X: 1162,
		Y: 1790,
		Angle: Math.PI*1.5,
	},
	Mouth: {
		Parent: "Head",
		X: 1227,
		Y: 690,
		Angle: 0,
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