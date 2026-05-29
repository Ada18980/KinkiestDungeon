/**
 * List off all face styles
 */

let KDModelStyles: Record<string, Record<string, string[]>> = {
	Nevermere: {
		Cosplay: [
			"Wolf1b",
			"Wolf2b",
			"Wolf1",
			"Wolf2",
			"Wolf1",
			"Wolf2",
			"Wolf1",
			"Wolf2",
			"ArcticFox",
			"",
		],
		Hairstyle: [
			"Wolfgirl1",
			"Wolfgirl2",
			"Wolfgirl3",
		],
		Bodystyle: [
			"Pale",
			"Default",
			"Tan","Tan","Tan2",
		],
		Facestyle: [
			"CyanCute",
			"CyanCute2",
			"TealCute",
			"GreenCute",
			"WolfgirlBlue",
			"WolfgirlCyan",
			"WolfgirlBrown",
			"WolfgirlOrange",
			"WolfgirlRare",
			"WolfgirlGrey",
		],
	},
	Elf: {
		Cosplay: [
			"Elf1",
			"Elf2",
			"Elf3",
			"Elf4",
			"Elf5",
			"Elf6",
		],
		Hairstyle: [
			"Elf1",
			"ElfShort",
			"ElfLong",
			"GreenMessy",
			"GreenPonytail",
			"LavenderPonytail",
			"GingerLong",
			"VeryPeachPonytail",
			"PeachTwintails",
		],
		Bodystyle: [
			"Pale",
			"Default",
		],
		Facestyle: [
			"Elf1",
			"GreenNormal",
			"GreenCute",
			"GreenAngry",
			"CyanNormal",
			"Cyan",
			"Amber1",
			"Amber2",
			"Amber3",
		],
	},
	Invisible: {
		Hairstyle: [
			"Invisible",
		],
		Bodystyle: [
			"Invisible",
		],
		Facestyle: [
			"Invisible",
		],
	},
	Dryad: {
		Hairstyle: [
			"Elf1",
			"ElfShort",
			"ElfLong",
			"GreenMessy",
			"GreenPonytail",
			"LavenderPonytail",
			"GingerLong",
			"VeryPeachPonytail",
			"PeachTwintails",
		],
		Bodystyle: [
			"Dryad",
		],
		Facestyle: [
			"Brown1",
			"Brown2",
			"Brown3",
			"Brown4",
			"Amber1",
			"Amber2",
			"Amber3",
		],
	},
	MaidKnightLight: {
		Hairstyle: [
			"MaidKnightLight",
		],
		Bodystyle: [
			"Maid",
		],
		Facestyle: [
			"MaidKnightLight",
		],
		Cosplay: [
			"MaidKnightLight",
		],
	},
	MaidKnightHeavy: {
		Hairstyle: [
			"MaidKnightHeavy",
		],
		Bodystyle: [
			"Maid",
		],
		Facestyle: [
			"MaidKnightHeavy",
		],
		Cosplay: [
			"MaidKnightHeavy",
		],
	},
	DarkElf: {
		Cosplay: [
			"Elf1",
			"Elf2",
			"Elf3",
			"Elf4",
			"Elf5",
			"Elf6",
		],
		Hairstyle: [
			"SlateTwintails",
			"BlueMessy",
			"BlueBangs",
			"PurpleBraid",
			"LavenderTwintails",
			"DarkPurpleSideBangs",
			"PurpleLong",
			"PurpleNecro",
		],
		Bodystyle: [
			"Pale",
			"ElementalPale",
			"ElementalCorrupted",
		],
		Facestyle: [
			"GreenNormal",
			"GreenCute",
			"GreenAngry",
			"CyanNormal",
			"Cyan",
		],
	},
	BlackCatGirl: {
		Cosplay: [
			"Kitty",
			"Kitty",
			"Kitty",
			"Kitty",
			"Kitty",
			"Kitty",
			"Kitty2",
		],
		Hairstyle: [
			"SlateTwintails",
			"KittyShort",
			"KittyLong",
		],
		Bodystyle: [
			"Pale",
			"Default",
			"Tan","Tan","Tan2",
			"Mid","Mid","Mid2",
			"MidTan","MidTan","MidTan2",
		],
		Facestyle: [
			"GreenNormal",
			"GreenAngry",
			"GreenCute",
			"CyanNormal",
			"Cyan",
		],
	},
	Mummy: {
		Cosplay: [
			"Kitty",
			"Kitty",
			"Kitty",
			"Kitty",
			"Kitty",
			"Kitty",
			"Kitty2",
		],
		Hairstyle: [
			"SlateTwintails",
			"KittyShort",
			"KittyLong",
		],
		Bodystyle: [
			"Tan","Tan","Tan2",
			"Mid","Mid","Mid2",
			"MidTan","MidTan","MidTan2",
			"DarkTan","DarkTan","DarkTan2",
		],
		Facestyle: [
			"GreenNormal",
			"GreenAngry",
			"GreenCute",
			"GreenOpen",
			"Hazel",
			"RedEyes",
		],
	},
	FireElemental: {
		Hairstyle: [
			"Fire1",
			"SlateShortPonytail",
			"SlateTwintails",
			"FireLong",
			"FireTwintails",
			"FireMessy",
		],
		Bodystyle: [
			"ElementalFire",
			"ElementalTan",
		],
		Facestyle: [
			"PinkCute",
			"PinkAngry",
			"RedOpen",
			"PurpleCute",
			"PurpleAngry",
			"MagentaCute",
		],
		Cosplay: [
			"",
			"Elf3",
		],
	},
	Demon: {
		Hairstyle: [
			"SlateShortPonytail",
			"SlateTwintails",
			"BlackTwintails",
			"PurpleTwintails",
			"DarkPurpleSideBangs",
			"PurpleBraid",
			"LavenderTwintails",
			"BlueMessy",
			"BlueLong1",
		],
		Bodystyle: [
			"Demon",
			"ElementalCorrupted",
		],
		Facestyle: [
			"RedScary",
			"RedOpen",
			"PurpleCute",
			"PurpleAngry",
			"PinkCute",
			"PinkAngry",
			"RedEyes",
		],
		Cosplay: [
			"Elf1",
			"Elf2",
			"Elf3",
		],
	},
	Angel: {
		Hairstyle: [
			"Wolfgirl1",
			"Wolfgirl2",
			"Wolfgirl3",
			"Maid6",
			"WhiteTwintails",
		],
		Bodystyle: [
			"Pale",
			"ElementalPale",
			"Tan","Tan","Tan2",
		],
		Facestyle: [
			"YellowAngry",
			"YellowCute",
			"Amber1",
		],
		Cosplay: [
			"Elf1",
			"Elf2",
			"Elf3",
		],
	},
	Worshipper: {
		Hairstyle: [
			"WhiteLongHair",
			"WhiteLongHair",
			"Maid6",
			"WhiteTwintails",
		],
		Bodystyle: [
			"Pale",
			"ElementalPale",
			"Tan","Tan","Tan2",
		],
		Facestyle: [
			"Worshipper",
			"Worshipper",
			"Worshipper",
			"PurpleCute",
			"PurpleAngry",
			"MagentaCute",
		],
		Cosplay: [
			"",
			"",
			"",
			"",
			"",
			"Elf1",
			"Elf2",
			"Elf3",
		],
	},

	EarthElemental: {
		Hairstyle: [
			"BrownPonytail",
			"BrownShort",
			"Brown1",
		],
		Bodystyle: [
			"Tan","Tan","Tan2",
			"MidTan","MidTan","MidTan2",
			"DarkTan","DarkTan","DarkTan2",
			"ElementalTan",
			"ElementalPale",
		],
		Facestyle: [
			"PinkCute",
			"PinkAngry",
			"RedOpen",
			"PurpleCute",
			"PurpleAngry",
			"MagentaCute",
		],
		Cosplay: [
			"",
			"Elf3",
		],
	},
	AirElemental: {
		Hairstyle: [
			"Wolfgirl1",
			"Wolfgirl2",
			"Wolfgirl3",
			"LavenderPonytail",
		],
		Bodystyle: [
			"Tan","Tan","Tan2",
			"MidTan","MidTan","MidTan2",
			"ElementalTan",
			"ElementalPale",
			"Pale",
		],
		Facestyle: [
			"PinkCute",
			"PinkAngry",
			"RedOpen",
			"PurpleCute",
			"PurpleAngry",
			"MagentaCute",
		],
		Cosplay: [
			"",
			"Elf3",
		],
	},
	WaterElemental: {
		Hairstyle: [
			"Water1",
			"BlueMessy",
			"BlueLong1",
			"BlueHime",
			"BlueBangs",
			"LightBlueLong",
			"LightBlueMedium",
			"BlueBraid",
			"BlueTwintail",
		],
		Bodystyle: [
			"ElementalWater",
		],
		Facestyle: [
			"PinkCute",
			"PinkAngry",
			"RedOpen",
			"PurpleCute",
			"PurpleAngry",
			"MagentaCute",
			"RedEyes",
		],
		Cosplay: [
			"",
			"Elf3",
		],
	},
	ElementalLatex: {
		Hairstyle: [
			"Water1",
			"BlueMessy",
			"BlueLong1",
			"BlueHime",
			"BlueBangs",
			"LightBlueLong",
			"LightBlueMedium",
			"LightBlueShort",
		],
		Bodystyle: [
			"ElementalLatex",
		],
		Facestyle: [
			"PinkCute",
			"PinkAngry",
			"RedOpen",
			"PurpleCute",
			"PurpleAngry",
			"MagentaCute",
		],
		Cosplay: [
			"",
			"Elf3",
		],
	},
	IceElemental: {
		Hairstyle: [
			"Wolfgirl1",
			"Wolfgirl2",
			"Wolfgirl3",
			"LavenderPonytail",
			"LightBlueLong",
			"LightBlueMedium",
		],
		Bodystyle: [
			"ElementalIce",
			"ElementalPale",
		],
		Facestyle: [
			"PinkCute",
			"PinkAngry",
			"RedOpen",
			"PurpleCute",
			"PurpleAngry",
			"MagentaCute",
		],
		Cosplay: [
			"",
			"Elf3",
		],
	},
	Zombie: {
		Bodystyle: [
			"Zombie",
			"Pale",
			"ElementalPale",
		],
		Facestyle: [
			"Fuuka",
			"PinkCute",
			"PinkAngry",
			"RedOpen",
			"RedScary",
		],
		Hairstyle: [
			"PeachShort",
			"PinkMessy",
			"PinkNeat",
			"PinkNeat",
			"PinkNeat",
			"BlackTwintails",
			"SlateTwintails",
			"DarkPurpleSideBangs",
			"PurpleBraid",
		],
	},
	Necromancer: {
		Hairstyle: [
			"PeachShort",
			"PinkMessy",
			"PinkNeat",
			"PinkNeat",
			"PinkNeat",
			"BlackTwintails",
			"SlateTwintails",
			"DarkPurpleSideBangs",
			"PurpleBraid",
			"PurpleNecro",
			"PurpleLong",
		],
		Bodystyle: [
			"Pale",
			"ElementalPale",
		],
		Facestyle: [
			"PinkCute",
			"PinkAngry",
			"Cyan",
			"CyanAngry",
			"CyanCute",
			"CyanCute2",
			"TealCute",
			"BlueCute",
		],
		Cosplay: [
			"",
			"",
			"",
			"",
			"",
			"Elf3",
		],
	},
	Shadow: {
		Hairstyle: [
			"PeachShort",
			"PinkMessy",
			"PinkNeat",
			"PinkNeat",
			"PinkNeat",
			"BlackTwintails",
			"SlateTwintails",
			"DarkPurpleSideBangs",
			"PurpleBraid",
			"PurpleTwintails",
			"PurpleLong",
		],
		Bodystyle: [
			"Pale",
			"Default",
			"Tan","Tan","Tan2",
			"ElementalPale",
			"ElementalCorrupted",
		],
		Facestyle: [
			"GreenAngry",
			"CyanAngry",
			"PinkAngry",
			"MagentaCute",
			"Amber1",
			"Amber2",
			"Amber3",
			"RedScary",
			"RedOpen",
			"RedEyes",
		],
		Cosplay: [
			"",
			"Elf1",
			"Elf3",
		],
	},
	Bandit: {
		Hairstyle: [
			"Ginger",
			"Ginger2",
			"OrangeBraid",
			"BrownShort",
			"Brown1",
			"PinkMessy",
			"KittyShort",
			"RedheadTwintail",
		],
		Bodystyle: [
			"Default","Default2",
			"Mid","Mid","Mid2",
			"Tan","Tan","Tan2",
			"MidTan","MidTan","MidTan2",
			"DarkTan","DarkTan","DarkTan2",
		],
		Facestyle: [
			"Brown1",
			"Brown2",
			"Brown3",
			"Amber1",
			"Amber2",
			"Amber3",
			"RedOpen",
		],
	},

	BlueHair: {
		Hairstyle: [
			"Water1",
			"BlueMessy",
			"BlueLong1",
			"BlueHime",
			"BlueBangs",
			"LightBlueLong",
			"LightBlueMedium",
			"BlueBraid",
			"BlueTwintail",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Mid","Mid","Mid2",
			"Pale",
			"MidTan","MidTan","MidTan2",
		],
		Facestyle: [
			"Amber1",
			"Amber2",
			"Amber3",
			"GreenOpen",
			"GreenNormal",
			"CyanCute",
			"PurpleCute",
			"Brown3",
		],
	},
	GreenHair: {
		Hairstyle: [
			"GreenMessy",
			"GreenPonytail",
			"GreenTwintail",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Mid","Mid","Mid2",
			"Pale",
			"MidTan","MidTan","MidTan2",
		],
		Facestyle: [
			"Amber1",
			"Amber2",
			"Amber3",
			"GreenOpen",
			"GreenNormal",
			"CyanCute",
			"PurpleCute",
			"Brown3",
		],
	},
	WhiteHair: {
		Hairstyle: [
			"Wolfgirl1",
			"Wolfgirl2",
			"Wolfgirl3",
			"LavenderPonytail",
			"Maid1",
			"Maid2",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Mid","Mid","Mid2",
			"Pale",
			"MidTan","MidTan","MidTan2",
			"DarkTan","DarkTan","DarkTan2",
		],
		Facestyle: [
			"BlueCute",
			"MagentaCute",
			"PinkCute",
			"PinkAngry",
			"PurpleAngry",
			"PurpleCute",
			"Brown1",
			"Brown2",
			"Brown3",
		],
	},
	Maid: {
		Hairstyle: [
			"Maid1",
			"Maid2",
			"Maid3",
			"Maid4",
			"Maid6",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Tan","Tan","Tan2",
			"Pale",
			"MidTan","MidTan","MidTan2",
		],
		Facestyle: [
			"BlueCute",
			"MagentaCute",
			"PinkCute",
			"PinkAngry",
			"PurpleAngry",
			"PurpleCute",
			"Brown1",
			"Brown2",
			"Brown3",
			"Hazel",
		],
	},
	Water: {
		Hairstyle: [
			"Water1",
			"BlueMessy",
			"BlueLong1",
			"BlueHime",
			"BlueBangs",
			"LightBlueLong",
			"LightBlueMedium",
			"LightBlueShort",
			"BlueBraid",
			"BlueTwintail",
			"PurpleLong",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Mid","Mid","Mid2",
			"Pale",
			"MidTan","MidTan","MidTan2",
		],
		Facestyle: [
			"Cyan",
			"CyanNormal",
			"CyanAngry",
			"CyanCute",
			"CyanCute2",
			"PurpleCute",
		],
	},
	Ice: {
		Hairstyle: [
			"Wolfgirl1",
			"Wolfgirl2",
			"Wolfgirl3",
			"LavenderPonytail",
			"LightBlueLong",
			"LightBlueMedium",
			"LightBlueShort",
			"BlueTwintail",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Mid","Mid","Mid2",
			"Pale",
		],
		Facestyle: [
			"TealCute",
			"BlueCute",
			"CyanAngry",
			"CyanCute",
			"CyanCute2",
		],
	},
	Earth: {
		Hairstyle: [
			"Ginger",
			"Ginger2",
			"GingerLong",
			"OrangeBraid",
			"PeachShort",
			"BrownPonytail",
			"BrownShort",
			"Brown1",
			"Brown2",
			"Brown3",
			"Brown4",
			"DeepRed",
			"PeachTwintails",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Mid","Mid","Mid2",
			"Pale",
		],
		Facestyle: [
			"Amber1",
			"Amber2",
			"Amber3",
			"Brown1",
			"Brown2",
			"Brown3",
			"TealCute",
			"BlueCute",
		],
	},
	Air: {
		Hairstyle: [
			"Wolfgirl1",
			"Wolfgirl2",
			"Wolfgirl3",
			"LavenderPonytail",
			"PeachTwintails",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Mid","Mid","Mid2",
			"Pale",
		],
		Facestyle: [
			"TealCute",
			"BlueCute",
			"CyanAngry",
			"CyanCute",
			"CyanCute2",
		],
	},

	Fire: {
		Hairstyle: [
			"Fire1",
			"SlateShortPonytail",
			"SlateTwintails",
			"FireLong",
			"FireTwintails",
			"FireMessy",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Tan","Tan","Tan2",
			"DarkTan","DarkTan","DarkTan2",
			"Pale",
		],
		Facestyle: [
			"GreenOpen",
			"GreenAngry",
			"Amber1",
			"Amber2",
			"Amber3",
			"Brown1",
			"Brown2",
			"RedOpen",
		],
	},

	DragonPoison: {
		Hairstyle: [
			"GreenMessy",
			"GreenPonytail",
			"GreenShiny",
			"PurpleBraid",
			"LavenderTwintails",
			"DarkPurpleSideBangs",
			"PurpleLong",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Mid","Mid","Mid2",
			"Pale",
			"Tan","Tan","Tan2",
			"DarkTan","DarkTan","DarkTan2",
		],
		Facestyle: [
			"GreenOpen",
			"GreenAngry",
			"GreenNormal",
			"PurpleCute",
			"TealCute",
			"PurpleAngry",
			"LightBlueCute",
		],
		Cosplay: [
			"DragonPoison"
		],
	},


	DragonCrystal: {
		Hairstyle: [
			"CrystalHair",
			"CrystalHair",
			"CrystalHair",
			"PinkMessy",
			"PinkNeat",
			"PinkNeat",
			"PinkNeat",

		],
		Bodystyle: [
			"Default","Default","Default2",
			"Mid","Mid","Mid2",
			"Pale",
			"Tan","Tan","Tan2",
			"DarkTan","DarkTan","DarkTan2",
		],
		Facestyle: [
			"CrystalFace",
			"CrystalFace",
			"PinkCute",
			"PinkAngry",
		],
		Cosplay: [
			"DragonCrystal",
		],
	},

	DragonIce: {
		Hairstyle: [
			"Wolfgirl1",
			"Wolfgirl2",
			"Wolfgirl3",
			"LavenderPonytail",
			"LightBlueLong",
			"LightBlueMedium",
			"LightBlueShort",
			"BlueTwintail",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Mid","Mid","Mid2",
			"Pale",
		],
		Facestyle: [
			"TealCute",
			"BlueCute",
			"CyanAngry",
			"CyanCute",
			"CyanCute2",
		],
		Cosplay: [
			"DragonIce"
		],
	},
	DragonShadow: {
		Hairstyle: [
			"SlateShortPonytail",
			"SlateTwintails",
			"BlackTwintails",
			"PurpleTwintails",
			"DarkPurpleSideBangs",
			"PurpleBraid",
			"LavenderTwintails",
			"BlueMessy",
			"BlueLong1",
			"PurpleLong",
		],
		Bodystyle: [
			"Demon",
			"ElementalCorrupted",
		],
		Facestyle: [
			"YellowOpen",
			"YellowRound",
			"YellowKjus",
		],
		Cosplay: [
			"DragonIce"
		],
	},

	RedHair: {
		Hairstyle: [
			"Fire1",
			"SlateShortPonytail",
			"SlateTwintails",
			"FireLong",
			"FireTwintails",
			"FireMessy",
			"DeepRed",
		],
		Bodystyle: [
			"Default","Default","Default2",
			"Tan","Tan","Tan2",
			"DarkTan","DarkTan","DarkTan2",
			"Pale",
		],
		Facestyle: [
			"GreenOpen",
			"GreenAngry",
			"GreenNormal",
			"PurpleCute",
			"TealCute",
			"PurpleAngry",
			"LightBlueCute",
		],
	},
	Kaisei: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Kaisei",
		],
		Hairstyle: [
			"Kaisei"
		],
	},
	Krifath: {
		Bodystyle: [
			"Krifath",
		],
		Facestyle: [
			"Krifath",
		],
		Hairstyle: [
			"Krifath"
		],
		Cosplay: [
			"Krifath"
		],
	},
	Yumi: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Yumi",
		],
		Hairstyle: [
			"Yumi"
		],
		Cosplay: [
			"Yumi"
		],
	},
	Melissa: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Melissa",
		],
		Hairstyle: [
			"Melissa",
		],
	},
	Director: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Director",
		],
		Hairstyle: [
			"Director",
		],
	},
	Minnie: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Minnie",
		],
		Hairstyle: [
			"Minnie",
		],
	},
	Carli: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Carli",
		],
		Hairstyle: [
			"Carli",
		],
	},
	Anketh: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Anketh",
		],
		Hairstyle: [
			"Anketh",
		],
	},
	Mizuna: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Mizuna",
		],
		Hairstyle: [
			"Mizuna",
		],
		Cosplay: [
			"Mizuna",
		],
	},
	Kaisei2: {
		Bodystyle: [
			"Default",
		],
		Facestyle: [
			"Kaisei2",
		],
		Hairstyle: [
			"Kaisei2",
		],
	},
	Sofia: {
		
		Cosplay: [
			"Sofia",
		],
		Bodystyle: [
			"Default",
		],
		Facestyle: [
			"Sofia",
		],
		Hairstyle: [
			"Sofia",
		],
	},
	Hina: {
		
		Bodystyle: [
			"Default",
		],
		Facestyle: [
			"Hina",
		],
		Hairstyle: [
			"Hina",
		],
	},
	Green: {
		
		Bodystyle: [
			"Default",
		],
		Facestyle: [
			"Green",
		],
		Hairstyle: [
			"Green",
		],
	},
	It: {
		
		Bodystyle: [
			"Default",
		],
		Facestyle: [
			"It",
		],
		Hairstyle: [
			"It",
		],
	},
	Puppet: {
		
		Bodystyle: [
			"DarkTanDoll",
			"MidTanDoll",
			"MaidDoll",
			"DefaultDoll",
			"DefaultDoll",
			"MidDoll",
			"MidDoll",
		],
		Facestyle: [
			"Puppet",
		],
		Cosplay: ["Strings"],
		Hairstyle: [
			
			"Brown1",
			"Brown2",
			"Brown3",
			"Brown4",
			"LavenderPonytail",
			"GingerLong",
			"VeryPeachPonytail",
			"PeachTwintails",
			"Water1",
			"BlueMessy",
			"BlueLong1",
			"BlueHime",
			"BlueBangs",
			"LightBlueLong",
			"LightBlueMedium",
			"LightBlueShort",
			"BlueBraid",
			"BlueTwintail",
			"PurpleLong",
		],
	},
	Anarial: {
		
		Cosplay: [
			"Anarial",
		],
		Bodystyle: [
			"Anarial",
		],
		Facestyle: [
			"Anarial",
		],
		Hairstyle: [
			"Anarial",
		],
	},
	Julia: {
		
		Cosplay: [
			"Julia",
		],
		Bodystyle: [
			"Julia",
		],
		Facestyle: [
			"Julia",
		],
		Hairstyle: [
			"Julia",
		],
	},
	MayHandel: {
		
		Cosplay: [
			"MayHandel",
		],
		Bodystyle: [
			"Default",
		],
		Facestyle: [
			"MayHandel",
		],
		Hairstyle: [
			"MayHandel",
		],
	},
	Helena: {
		
		Cosplay: [
			"Helena",
		],
		Bodystyle: [
			"Default",
		],
		Facestyle: [
			"Helena",
		],
		Hairstyle: [
			"Helena",
		],
	},
	Istoodin: {
		
		Cosplay: [
			"Istoodin",
		],
		Bodystyle: [
			"Istoodin",
		],
		Facestyle: [
			"Istoodin",
		],
		Hairstyle: [
			"Istoodin",
		],
	},
	Rook: {
		
		Cosplay: [
			"Rook",
		],
		Bodystyle: [
			"Rook",
		],
		Facestyle: [
			"Rook",
		],
		Hairstyle: [
			"Rook",
		],
	},
	Elodie: {
		
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Elodie",
		],
		Hairstyle: [
			"Elodie",
		],
	},
	iostream: {
		
		Cosplay: [
			"iostream",
		],
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"iostream",
		],
		Hairstyle: [
			"iostream",
		],
	},
	Ivy: {
		
		Cosplay: [
			"Ivy",
		],
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Ivy",
		],
		Hairstyle: [
			"Ivy",
		],
	},
	Salote: {
		
		Cosplay: [
			"Salote",
		],
		Bodystyle: [
			"Salote",
		],
		Facestyle: [
			"Salote",
		],
		Hairstyle: [
			"Salote",
		],
	},

	Catey: {
		
		Bodystyle: [
			"Catey",
		],
		Facestyle: [
			"Catey",
		],
		Hairstyle: [
			"Catey",
		],
	},
	
	Lushi: {
		
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Lushi",
		],
		Hairstyle: [
			"Lushi",
		],
	},
	Mizuna2: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Mizuna2",
		],
		Hairstyle: [
			"Mizuna2",
		],
		Cosplay: [
			"Mizuna2",
		],
	},
	Luce: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Luce",
		],
		Hairstyle: [
			"Luce",
		],
		Cosplay: [
			"Luce",
		],
	},
	Fidel: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Fidel",
		],
		Hairstyle: [
			"Fidel",
		],
	},
	Viola: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Viola",
		],
		Hairstyle: [
			"Viola",
		],
	},
	Yuri: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Yuri",
		],
		Hairstyle: [
			"PurpleNecro",
		],
		Cosplay: [
			"Glasses",
		],
	},
	Hilda: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Hilda",
		],
		Hairstyle: [
			"PinkTwintail",
		],
		Cosplay: [
			"Hilda",
		],
	},
	Nara: {
		Cosplay: [
			"Nara",
		],
		Bodystyle: [
			"Nara",
		],
		Facestyle: [
			"Nara",
		],
		Hairstyle: [
			"Nara",
		],
	},
	Myrtrice: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"Myrtrice",
		],
		Hairstyle: [
			"Myrtrice",
		],
	},
	Fuuka: {
		Cosplay: [
			"Fuuka",
		],
		Bodystyle: [
			"Zombie",
		],
		Facestyle: [
			"Fuuka",
		],
		Hairstyle: [
			"Fuuka",
		],
	},
	Dollmaker: {
		Bodystyle: [
			"Default2",
		],
		Facestyle: [
			"GreenAngry",
		],
		Hairstyle: [
			"BlueBraid",
		],
	},
};