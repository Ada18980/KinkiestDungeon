/**
 * List off all face styles
 */
let KDModelFace: {[_: string]: KinkyDungeonDress} = {
	"Default" : [
		{Item: "HumanEyes", Group: "HumanEyes", Color: "#ffffff", Lost: false},
		{Item: "KoiBrows", Group: "KoiBrows", Color: "#ffffff", Lost: false},
		{Item: "KoiBlush", Group: "KoiBlush", Color: "#ffffff", Lost: false},
		{Item: "KoiMouth", Group: "KoiMouth", Color: "#ffffff", Lost: false},
	],
	"Elf1" : [
		{
			Item: "HumanEyes", Group: "HumanEyes", Color: "#ffffff", Lost: false, Filters:
			{"Eyes":{"gamma":0.9833333333333333,"saturation":0.2833333333333333,"contrast":1.0666666666666667,"brightness":0.9833333333333333,"red":1.0833333333333335,"green":1.0833333333333335,"blue":2.0666666666666664,"alpha":0.9833333333333333},"Eyes2":{"gamma":0.9833333333333333,"saturation":0.2833333333333333,"contrast":1.0666666666666667,"brightness":0.9833333333333333,"red":1.0833333333333335,"green":1.0833333333333335,"blue":2.0666666666666664,"alpha":0.9833333333333333}},
		},
		{Item: "KoiBrows", Group: "KoiBrows", Color: "#ffffff", Lost: false},
		{Item: "KoiBlush", Group: "KoiBlush", Color: "#ffffff", Lost: false},
		{Item: "KoiMouth", Group: "KoiMouth", Color: "#ffffff", Lost: false},
	],

	"WolfgirlBlue" : [
		{Item: "KjusEyes", Group: "KjusEyes", Color: "#ffffff", Lost: false},
		{Item: "KjusBrows", Group: "KoiBrows", Color: "#ffffff", Lost: false},
		{Item: "KjusBlush", Group: "KoiBlush", Color: "#ffffff", Lost: false},
		{Item: "KjusMouth", Group: "KoiMouth", Color: "#ffffff", Lost: false},
	],
	"WolfgirlCyan" : [
		{Item: "KjusEyes", Group: "KjusEyes", Color: "#ffffff", Lost: false, Filters: {
			Eyes: {"gamma":1,"saturation":0.9333333333333333,"contrast":1,"brightness":2.2666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
			Eyes2: {"gamma":1,"saturation":0.9333333333333333,"contrast":1,"brightness":2.2666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		}},
		{Item: "KjusBrows", Group: "KoiBrows", Color: "#ffffff", Lost: false},
		{Item: "KjusBlush", Group: "KoiBlush", Color: "#ffffff", Lost: false},
		{Item: "KjusMouth", Group: "KoiMouth", Color: "#ffffff", Lost: false},
	],
	"WolfgirlBrown" : [
		{Item: "KjusEyes", Group: "KjusEyes", Color: "#ffffff", Lost: false, Filters: {
			Eyes: {"gamma":1,"saturation":0,"contrast":1.6500000000000001,"brightness":1,"red":1.8627450980392157,"green":0.9607843137254902,"blue":0.43137254901960786,"alpha":1},
			Eyes2: {"gamma":1,"saturation":0,"contrast":1.6500000000000001,"brightness":1,"red":1.8627450980392157,"green":0.9607843137254902,"blue":0.43137254901960786,"alpha":1},
		}},
		{Item: "KjusBrows", Group: "KoiBrows", Color: "#ffffff", Lost: false},
		{Item: "KjusBlush", Group: "KoiBlush", Color: "#ffffff", Lost: false},
		{Item: "KjusMouth", Group: "KoiMouth", Color: "#ffffff", Lost: false},
	],
	"WolfgirlRare" : [
		{Item: "KjusEyes", Group: "KjusEyes", Color: "#ffffff", Lost: false, Filters: {
			//Eyes: {"gamma":1,"saturation":0,"contrast":1.6500000000000001,"brightness":1,"red":1.8627450980392157,"green":0.9607843137254902,"blue":0.43137254901960786,"alpha":1},
			Eyes2: {"gamma":1,"saturation":0,"contrast":1.6500000000000001,"brightness":1,"red":1.8627450980392157,"green":0.9607843137254902,"blue":0.43137254901960786,"alpha":1},
		}},
		{Item: "KjusBrows", Group: "KoiBrows", Color: "#ffffff", Lost: false},
		{Item: "KjusBlush", Group: "KoiBlush", Color: "#ffffff", Lost: false},
		{Item: "KjusMouth", Group: "KoiMouth", Color: "#ffffff", Lost: false},
	],
	"WolfgirlGrey" : [
		{Item: "KjusEyes", Group: "KjusEyes", Color: "#ffffff", Lost: false, Filters: {
			Eyes: {"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":2.2666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
			Eyes2: {"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":2.2666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		}},
		{Item: "KjusBrows", Group: "KoiBrows", Color: "#ffffff", Lost: false},
		{Item: "KjusBlush", Group: "KoiBlush", Color: "#ffffff", Lost: false},
		{Item: "KjusMouth", Group: "KoiMouth", Color: "#ffffff", Lost: false},
	],
	"WolfgirlOrange" : [
		{Item: "KjusEyes", Group: "KjusEyes", Color: "#ffffff", Lost: false, Filters: {
			Eyes: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":2.4705882352941178,"green":0.9803921568627451,"blue":0.21568627450980393,"alpha":1},
			Eyes2: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":2.4705882352941178,"green":0.9803921568627451,"blue":0.21568627450980393,"alpha":1},
		}},
		{Item: "KjusBrows", Group: "KoiBrows", Color: "#ffffff", Lost: false},
		{Item: "KjusBlush", Group: "KoiBlush", Color: "#ffffff", Lost: false},
		{Item: "KjusMouth", Group: "KoiMouth", Color: "#ffffff", Lost: false},
	],

};
/**
 * List off all hair styles
 */
let KDModelHair: {[_: string]: KinkyDungeonDress} = {
	"Default" : [
		{Item: "Braid", Group: "Braid", Color: "#ffffff", Lost: false},
	],
	"Elf1" : [
		{
			Item: "StraightBangs", Color: "#ffffff", Lost: false, Filters:
			{"StraightBangs":{"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1.35,"green":1.588235294117647,"blue":0.7843137254901961,"alpha":1}}
		},
		{
			Item: "MessyBack", Color: "#ffffff", Lost: false, Filters:
			{"Messy":{"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1.35,"green":1.588235294117647,"blue":0.7843137254901961,"alpha":1}}
		},
		{
			Item: "ElfEarsLong", Color: "#ffffff", Lost: false
		},
		{
			Item: "ElfEarrings", Color: "#ffffff", Lost: false, Filters:
			{"EarringRight":{"gamma":1,"saturation":1,"contrast":1,"brightness":1.3,"red":1,"green":1,"blue":1,"alpha":1},"EarringLeft":{"gamma":1,"saturation":1,"contrast":0.65,"brightness":1.7000000000000002,"red":0.55,"green":0.55,"blue":2.033333333333333,"alpha":1.75}}
		},
	],
	"Wolfgirl1" : [
		{
			Item: "Curly", Group: "Curly", Color: "#ffffff", Lost: false,
			Filters:
			{"Curly":{"gamma":1,"saturation":0,"contrast":1.18,"brightness":1,"red":1.4509803921568627,"green":1.5490196078431373,"blue":1.4509803921568627,"alpha":1}},
		},
		{
			Item: "CurlyBack", Group: "CurlyBack", Color: "#ffffff", Lost: false,
			Filters:
			{"BackShortCurly":{"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1.4313725490196079,"green":1.588235294117647,"blue":1.6274509803921569,"alpha":1},"BackShortCurlyUnderlight":{"gamma":1,"saturation":0,"contrast":1.6500000000000001,"brightness":1,"red":0.9411764705882353,"green":1.3333333333333333,"blue":2.3529411764705883,"alpha":1}}
		},
		{
			Item: "WolfTail", Group: "WolfTail", Color: "#ffffff", Lost: false
		},
		{
			Item: "WolfEars", Group: "WolfEars", Color: "#ffffff", Lost: false
		},

	],
	"Wolfgirl2" : [
		{
			Item: "Fluffy", Group: "Fluffy", Color: "#ffffff", Lost: false,
		},
		{
			Item: "FluffyPonytail", Group: "FluffyPonytail", Color: "#ffffff", Lost: false,
		},
		{
			Item: "WolfTail", Group: "WolfTail", Color: "#ffffff", Lost: false
		},
		{
			Item: "WolfEars", Group: "WolfEars", Color: "#ffffff", Lost: false
		},

	],
	"Wolfgirl3" : [
		{
			Item: "BraidCustom", Group: "BraidCustom", Color: "#ffffff", Lost: false, Filters:
			{"BraidCustom":{"gamma":1,"saturation":0,"contrast":1.1333333333333333,"brightness":0.8833333333333333,"red":1.4166666666666665,"green":1.5,"blue":1.8833333333333333,"alpha":1}},
		},
		{
			Item: "FluffyPonytail", Group: "FluffyPonytail", Color: "#ffffff", Lost: false, Filters:
			{"Ponytail2":{"gamma":1,"saturation":0,"contrast":1.1333333333333333,"brightness":0.6166666666666667,"red":1.4166666666666665,"green":1.5,"blue":1.9833333333333334,"alpha":1}},
		},

		{
			Item: "WolfTail", Group: "WolfTail", Color: "#ffffff", Lost: false, Filters:
			{"Tail":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.8999999999999999,"red":1,"green":1.0833333333333335,"blue":1.2833333333333332,"alpha":1}}
		},
		{
			Item: "WolfEars", Group: "WolfEars", Color: "#ffffff", Lost: false, Filters:
			{"Ears":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.8999999999999999,"red":1,"green":1.0833333333333335,"blue":1.2833333333333332,"alpha":1}}
		},

	],
};

/**
 * List off all bodies
 */
let KDModelBody: {[_: string]: KinkyDungeonDress} = {
	"Default" : [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false},
	],
	"Zombie" : [
		{
			Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {"Torso":{"gamma":1,"saturation":0.35000000000000003,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"Head":{"gamma":1,"saturation":0.35000000000000003,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}}
		}
	],

	"Demon" : [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0.08333333333333333,"contrast":3.0833333333333335,"brightness":0.3833333333333333,"red":0.9333333333333333,"green":0.55,"blue":1.8333333333333333,"alpha":1},
			Torso: {"gamma":1,"saturation":0.08333333333333333,"contrast":3.0833333333333335,"brightness":0.3833333333333333,"red":0.9333333333333333,"green":0.55,"blue":1.8333333333333333,"alpha":1},
		}},
	],
	"Pale" : [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {"Head":{"gamma":1,"saturation":0.5666666666666667,"contrast":1.3666666666666667,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"Torso":{"gamma":1,"saturation":0.5666666666666667,"contrast":1.3666666666666667,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}}},
	],
	"Tan" : [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1.2,"saturation":1.0166666666666666,"contrast":1.1,"brightness":1.4333333333333333,"red":0.6166666666666667,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
			Torso: {"gamma":1.2,"saturation":1.0166666666666666,"contrast":1.1,"brightness":1.4333333333333333,"red":0.6166666666666667,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
		}},
	],
	"MidTan" : [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1.2,"saturation":1.0666666666666667,"contrast":1.1,"brightness":1.1666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
			Torso: {"gamma":1.2,"saturation":1.0666666666666667,"contrast":1.1,"brightness":1.1666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
		}
		},
	],
	"DarkTan" : [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {"Torso":{"gamma":1.2,"saturation":0.7833333333333334,"contrast":1.1,"brightness":0.9666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},"Head":{"gamma":1.2,"saturation":0.7833333333333334,"contrast":1.1,"brightness":0.9666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1}}},
	],
};

let KDModelStyles: Record<string, Record<string, string[]>> = {
	Nevermere: {
		Hairstyle: [
			"Wolfgirl1",
			"Wolfgirl2",
			"Wolfgirl3",
		],
		Bodystyle: [
			"Pale",
			"Default",
			"Tan",
		],
		Facestyle: [
			"WolfgirlBlue",
			"WolfgirlCyan",
			"WolfgirlBrown",
			"WolfgirlOrange",
			"WolfgirlRare",
			"WolfgirlGrey",
		],
	},
	Elf: {
		Hairstyle: [
			"Elf1",
		],
		Bodystyle: [
			"Pale",
			"Default",
		],
		Facestyle: [
			"Elf1",
		],
	},
	ElementalEarth: {
		Hairstyle: [
			"Elf1",
		],
		Bodystyle: [
			"Tan",
			"MidTan",
			"DarkTan",
		],
		Facestyle: [
			"Elf1",
		],
	},
};