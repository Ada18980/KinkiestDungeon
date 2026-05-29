
/**
 * List off all bodies
 */
let KDModelBody: {[_: string]: KinkyDungeonDress} = {
	"Default" : [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false},
	],
	"Default2" : [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false},
	],
	"Zombie" : [
		{
			Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {"Torso":{"gamma":1,"saturation":0.35000000000000003,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"Head":{"gamma":1,"saturation":0.35000000000000003,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}}
		}
	],
	"Invisible" : [
		{
			Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false,
			Filters: {
				"Torso":{"gamma":1,"saturation":0.35000000000000003,"contrast":1,"brightness":1,
				"red":1,"green":1,"blue":1,"alpha":0.001},
				"Head":{"gamma":1,"saturation":0.35000000000000003,"contrast":1,"brightness":1,
					"red":1,"green":1,"blue":1,"alpha":0.001}}
		}
	],
	
	Krifath: [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0.5166666666666666,"contrast":1,"brightness":0.75,"red":1.2666666666666668,"green":1,"blue":1.6,"alpha":0.9833333333333333},
			Torso: {"gamma":1,"saturation":0.5166666666666666,"contrast":1,"brightness":0.75,"red":1.2666666666666668,"green":1,"blue":1.6,"alpha":0.9833333333333333},
		}},
	],
	Catey: [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":0.5117647058823529,"green":0.4294117647058823,"blue":0.5647058823529412,"alpha":1},
			Torso: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":0.5117647058823529,"green":0.4294117647058823,"blue":0.5647058823529412,"alpha":1},
			Nipples: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":0.5823529411764706,"green":0.4764705882352941,"blue":0.6352941176470588,"alpha":1},
		}},
	],
	Rook: [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":0.9666666666666667,"saturation":0,"contrast":1,"brightness":1,"red":1.8823529411764706,"green":0.9215686274509803,"blue":0.7843137254901961,"alpha":1},
			Torso: {"gamma":0.6,"saturation":0,"contrast":1.0166666666666666,"brightness":1,"red":1.7450980392156863,"green":1.0196078431372548,"blue":0.9215686274509803,"alpha":1},
		}},
	],
	Istoodin: [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0.8833333333333333,"contrast":0.81,"brightness":1,"red":0.39215686274509803,"green":0.4117647058823529,"blue":0.47058823529411764,"alpha":1},
			Torso: {"gamma":1,"saturation":0.8833333333333333,"contrast":0.81,"brightness":1,"red":0.39215686274509803,"green":0.4117647058823529,"blue":0.47058823529411764,"alpha":1},
			Nipples: {"gamma":1,"saturation":0.8833333333333333,"contrast":0.81,"brightness":1,"red":0.39215686274509803,"green":0.4117647058823529,"blue":0.47058823529411764,"alpha":1},
		}},
	],
	Anarial: [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1.2,"saturation":1.0666666666666667,"contrast":1.1,"brightness":1.1666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
			Torso: {"gamma":1.2,"saturation":1.0666666666666667,"contrast":1.1,"brightness":1.1666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
		}},
	],
	Julia: [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0,"contrast":0.97,"brightness":1,"red":1.2549019607843137,"green":0.9607843137254902,"blue":0.8823529411764706,"alpha":1},
			Torso: {"gamma":1,"saturation":0,"contrast":0.97,"brightness":1,"red":1.2549019607843137,"green":0.9607843137254902,"blue":0.8823529411764706,"alpha":1},
		}},
	],
	Salote: [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":0.9019607843137255,"green":1.0980392156862746,"blue":1.0392156862745099,"alpha":1},
			Torso: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":0.7647058823529411,"green":1.2352941176470589,"blue":1.1568627450980393,"alpha":1},
		}},
	],

	"Demon" : [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0.08333333333333333,"contrast":3.0833333333333335,"brightness":0.3833333333333333,"red":0.9333333333333333,"green":0.55,"blue":1.8333333333333333,"alpha":1},
			Torso: {"gamma":1,"saturation":0.08333333333333333,"contrast":3.0833333333333335,"brightness":0.3833333333333333,"red":0.9333333333333333,"green":0.55,"blue":1.8333333333333333,"alpha":1},
		}}
	],

	Nara:  [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0,"contrast":0.72,"brightness":1,"red":1.55,"green":1.1833333333333333,"blue":1.0833333333333335,"alpha":1},
			Torso: {"gamma":1,"saturation":0,"contrast":0.72,"brightness":1,"red":1.55,"green":1.1833333333333333,"blue":1.0833333333333335,"alpha":1},
			Nipples: {"gamma":1,"saturation":0,"contrast":0.72,"brightness":1,"red":1.55,"green":1.1833333333333333,"blue":1.0833333333333335,"alpha":1},
		}},
	],

	"Pale" : [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {"Head":{"gamma":1,"saturation":0.5666666666666667,"contrast":1.3666666666666667,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"Torso":{"gamma":1,"saturation":0.5666666666666667,"contrast":1.3666666666666667,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}}},
	],
	"ElementalLight": [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
			Torso: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		}},
	],
	"ElementalFire": [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1.1,"contrast":1,"brightness":0.9166666666666666,"red":1.7000000000000002,"green":1,"blue":0.8,"alpha":0.9833333333333333},
			Torso: {"gamma":1,"saturation":1.1,"contrast":1,"brightness":0.9166666666666666,"red":1.7000000000000002,"green":1,"blue":0.8,"alpha":0.9833333333333333},
		}},
	],
	"ElementalCorrupted": [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0.5166666666666666,"contrast":1,"brightness":0.5666666666666667,"red":1.2666666666666668,"green":1,"blue":1.6,"alpha":0.9833333333333333},
			Torso: {"gamma":1,"saturation":0.5166666666666666,"contrast":1,"brightness":0.5666666666666667,"red":1.2666666666666668,"green":1,"blue":1.6,"alpha":0.9833333333333333},
		}},
	],
	"ElementalTan": [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.7333333333333334,"red":1.2,"green":0.9833333333333333,"blue":0.8166666666666667,"alpha":1},
			Torso: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.7333333333333334,"red":1.2,"green":0.9833333333333333,"blue":0.8166666666666667,"alpha":1},
		}},
	],
	"Dryad": [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1,"contrast":2.1,"brightness":0.7000000000000001,"red":0.8833333333333333,"green":1.2,"blue":0.8500000000000001,"alpha":1},
			Torso: {"gamma":1,"saturation":1,"contrast":2.1,"brightness":0.7000000000000001,"red":0.8833333333333333,"green":1.2,"blue":0.8500000000000001,"alpha":1},
		}},
	],


	"ElementalLatex": [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0.016666666666666666,"contrast":1,"brightness":0.8666666666666667,"red":1,"green":1,"blue":1.4833333333333334,"alpha":0.9833333333333333},
			Torso: {"gamma":1,"saturation":0.016666666666666666,"contrast":1,"brightness":0.8666666666666667,"red":1,"green":1,"blue":1.4833333333333334,"alpha":0.9833333333333333},
		}},
	],

	"ElementalPale": [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0833333333333335,"alpha":1},
			Torso: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0833333333333335,"alpha":1},
		}},
	],
	"ElementalWater": [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1.1372549019607843,"blue":1.0784313725490196,"alpha":1},
			Torso: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1.1372549019607843,"blue":1.0784313725490196,"alpha":1},
		}},
	],

	"ElementalIce": [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0833333333333335,"alpha":1},
			Torso: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0833333333333335,"alpha":1},
		}},
	],



	"Maid": [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head:{"gamma":0.44999999999999996,"saturation":1.5,"contrast":0.8333333333333333,"brightness":0.8833333333333333,"red":1.2,"green":1.2,"blue":1.1,"alpha":1},
			Torso:{"gamma":0.44999999999999996,"saturation":1.5,"contrast":0.8333333333333333,"brightness":0.8833333333333333,"red":1.2,"green":1.2,"blue":1.1,"alpha":1},
			Nipples: {"gamma":1,"saturation":1.6,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.8},
		}},
	],

	"Mid": [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":2.4333333333333336,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
			Torso: {"gamma":1,"saturation":2.4333333333333336,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		}},
	],
	"Tan" : [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1.2,"saturation":1.0166666666666666,"contrast":1.1,"brightness":1.4333333333333333,"red":0.6166666666666667,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
			Torso: {"gamma":1.2,"saturation":1.0166666666666666,"contrast":1.1,"brightness":1.4333333333333333,"red":0.6166666666666667,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
		}},
	],
	"MidTan" : [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1.2,"saturation":1.0666666666666667,"contrast":1.1,"brightness":1.1666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
			Torso: {"gamma":1.2,"saturation":1.0666666666666667,"contrast":1.1,"brightness":1.1666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
		}
		},
	],
	"DarkTan" : [
		{Item: "SmoothBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {"Torso":{"gamma":1.2,"saturation":0.7833333333333334,"contrast":1.1,"brightness":0.9666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},"Head":{"gamma":1.2,"saturation":0.7833333333333334,"contrast":1.1,"brightness":0.9666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1}}},
	],



	"DefaultDoll" : [
		{Item: "DollBody", Group: "Body", Color: KDBaseWhite, Lost: false},
	],
	"MaidDoll": [
		{Item: "DollBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head:{"gamma":0.44999999999999996,"saturation":1.5,"contrast":0.8333333333333333,"brightness":0.8833333333333333,"red":1.2,"green":1.2,"blue":1.1,"alpha":1},
			Torso:{"gamma":0.44999999999999996,"saturation":1.5,"contrast":0.8333333333333333,"brightness":0.8833333333333333,"red":1.2,"green":1.2,"blue":1.1,"alpha":1},
			Nipples: {"gamma":1,"saturation":1.6,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.8},
		}},
	],

	"MidDoll": [
		{Item: "DollBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":2.4333333333333336,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
			Torso: {"gamma":1,"saturation":2.4333333333333336,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		}},
	],
	"TanDoll" : [
		{Item: "DollBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1.2,"saturation":1.0166666666666666,"contrast":1.1,"brightness":1.4333333333333333,"red":0.6166666666666667,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
			Torso: {"gamma":1.2,"saturation":1.0166666666666666,"contrast":1.1,"brightness":1.4333333333333333,"red":0.6166666666666667,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
		}},
	],
	"MidTanDoll" : [
		{Item: "DollBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1.2,"saturation":1.0666666666666667,"contrast":1.1,"brightness":1.1666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
			Torso: {"gamma":1.2,"saturation":1.0666666666666667,"contrast":1.1,"brightness":1.1666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
		}
		},
	],
	"DarkTanDoll" : [
		{Item: "DollBody", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {"Torso":{"gamma":1.2,"saturation":0.7833333333333334,"contrast":1.1,"brightness":0.9666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},"Head":{"gamma":1.2,"saturation":0.7833333333333334,"contrast":1.1,"brightness":0.9666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1}}},
	],


	
	"Maid2": [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head:{"gamma":0.44999999999999996,"saturation":1.5,"contrast":0.8333333333333333,"brightness":0.8833333333333333,"red":1.2,"green":1.2,"blue":1.1,"alpha":1},
			Torso:{"gamma":0.44999999999999996,"saturation":1.5,"contrast":0.8333333333333333,"brightness":0.8833333333333333,"red":1.2,"green":1.2,"blue":1.1,"alpha":1},
			Nipples: {"gamma":1,"saturation":1.6,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.8},
		}},
	],

	"Mid2": [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1,"saturation":2.4333333333333336,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
			Torso: {"gamma":1,"saturation":2.4333333333333336,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		}},
	],
	"Tan2" : [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1.2,"saturation":1.0166666666666666,"contrast":1.1,"brightness":1.4333333333333333,"red":0.6166666666666667,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
			Torso: {"gamma":1.2,"saturation":1.0166666666666666,"contrast":1.1,"brightness":1.4333333333333333,"red":0.6166666666666667,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
		}},
	],
	"MidTan2" : [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {
			Head: {"gamma":1.2,"saturation":1.0666666666666667,"contrast":1.1,"brightness":1.1666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
			Torso: {"gamma":1.2,"saturation":1.0666666666666667,"contrast":1.1,"brightness":1.1666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},
		}
		},
	],
	"DarkTan2" : [
		{Item: "Body", Group: "Body", Color: KDBaseWhite, Lost: false, Filters: {"Torso":{"gamma":1.2,"saturation":0.7833333333333334,"contrast":1.1,"brightness":0.9666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1},"Head":{"gamma":1.2,"saturation":0.7833333333333334,"contrast":1.1,"brightness":0.9666666666666667,"red":0.7333333333333334,"green":0.5166666666666666,"blue":0.5333333333333333,"alpha":1}}},
	],
};
