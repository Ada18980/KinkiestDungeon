
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

	Nara:  [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0,"contrast":0.72,"brightness":1,"red":1.55,"green":1.1833333333333333,"blue":1.0833333333333335,"alpha":1},
			Torso: {"gamma":1,"saturation":0,"contrast":0.72,"brightness":1,"red":1.55,"green":1.1833333333333333,"blue":1.0833333333333335,"alpha":1},
			Nipples: {"gamma":1,"saturation":0,"contrast":0.72,"brightness":1,"red":1.55,"green":1.1833333333333333,"blue":1.0833333333333335,"alpha":1},
		}},
	],

	"Pale" : [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {"Head":{"gamma":1,"saturation":0.5666666666666667,"contrast":1.3666666666666667,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"Torso":{"gamma":1,"saturation":0.5666666666666667,"contrast":1.3666666666666667,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}}},
	],
	"ElementalLight": [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
			Torso: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		}},
	],
	"ElementalFire": [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1.1,"contrast":1,"brightness":0.9166666666666666,"red":1.7000000000000002,"green":1,"blue":0.8,"alpha":0.9833333333333333},
			Torso: {"gamma":1,"saturation":1.1,"contrast":1,"brightness":0.9166666666666666,"red":1.7000000000000002,"green":1,"blue":0.8,"alpha":0.9833333333333333},
		}},
	],
	"ElementalCorrupted": [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0.5166666666666666,"contrast":1,"brightness":0.5666666666666667,"red":1.2666666666666668,"green":1,"blue":1.6,"alpha":0.9833333333333333},
			Torso: {"gamma":1,"saturation":0.5166666666666666,"contrast":1,"brightness":0.5666666666666667,"red":1.2666666666666668,"green":1,"blue":1.6,"alpha":0.9833333333333333},
		}},
	],
	"ElementalTan": [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.7333333333333334,"red":1.2,"green":0.9833333333333333,"blue":0.8166666666666667,"alpha":1},
			Torso: {"gamma":1,"saturation":1,"contrast":1,"brightness":0.7333333333333334,"red":1.2,"green":0.9833333333333333,"blue":0.8166666666666667,"alpha":1},
		}},
	],
	"Dryad": [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1,"contrast":2.1,"brightness":0.7000000000000001,"red":0.8833333333333333,"green":1.2,"blue":0.8500000000000001,"alpha":1},
			Torso: {"gamma":1,"saturation":1,"contrast":2.1,"brightness":0.7000000000000001,"red":0.8833333333333333,"green":1.2,"blue":0.8500000000000001,"alpha":1},
		}},
	],


	"ElementalLatex": [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0.016666666666666666,"contrast":1,"brightness":0.8666666666666667,"red":1,"green":1,"blue":1.4833333333333334,"alpha":0.9833333333333333},
			Torso: {"gamma":1,"saturation":0.016666666666666666,"contrast":1,"brightness":0.8666666666666667,"red":1,"green":1,"blue":1.4833333333333334,"alpha":0.9833333333333333},
		}},
	],

	"ElementalPale": [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0833333333333335,"alpha":1},
			Torso: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0833333333333335,"alpha":1},
		}},
	],
	"ElementalWater": [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1.1372549019607843,"blue":1.0784313725490196,"alpha":1},
			Torso: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1.1372549019607843,"blue":1.0784313725490196,"alpha":1},
		}},
	],

	"ElementalIce": [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0833333333333335,"alpha":1},
			Torso: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0833333333333335,"alpha":1},
		}},
	],


	"Mid": [
		{Item: "Body", Group: "Body", Color: "#ffffff", Lost: false, Filters: {
			Head: {"gamma":1,"saturation":2.4333333333333336,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
			Torso: {"gamma":1,"saturation":2.4333333333333336,"contrast":1,"brightness":0.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		}},
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
