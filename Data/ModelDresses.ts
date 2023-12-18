/**
 * List off all dresses items
 */
let KDModelDresses: {[_: string]: KinkyDungeonDress} = {
	"Default" : KinkyDungeonDefaultDefaultDress,
	"Prisoner" : [
		{Item: "Swimsuit", Group: "Suit", Color: "#8A120C", Lost: false, Filters: {
			Swimsuit: {"gamma":1.5333333333333332,"saturation":0,"contrast":1.7666666666666666,"brightness":1.0166666666666666,"red":2.8000000000000003,"green":1,"blue":1,"alpha":1},
		}},
	],
	"Bandit" : [
		{Item: "Bandit", Group: "Suit", Color: "Default", Lost: false},
	],
	"GreenLeotard" : [
		{Item: "Swimsuit", Group: "Suit", Color: "#8A120C", Lost: false, Filters: {
			Swimsuit: {"gamma":1.5333333333333332,"saturation":0,"contrast":1.7666666666666666,"brightness":1.0166666666666666,"green":2.8000000000000003,"red":1,"blue":1,"alpha":1},
		}},
	],
	"Leotard" : [
		{Item: "BunnyLeotard", Group: "Suit", Color: "#53428D", Lost: false},
	],
	"Bikini" : [
		{Item: "StrappyBikini", Group: "Panties", Color: "#53428D", Lost: false,
		Filters: {
			StrappyLower: {"gamma":1,"saturation":0.05,"contrast":1,"brightness":0.55,"red":1,"green":1,"blue":1,"alpha":1},
		}},
		{Item: "StrappyBra", Group: "Bra", Color: "#53428D", Lost: false,
		Filters: {
			Bra: {"gamma":1,"saturation":0.05,"contrast":1,"brightness":0.55,"red":1,"green":1,"blue":1,"alpha":1},
		}},
	],
	"None" : [
		
	],
	"Lingerie" : [
		{Item: "LacePanties", Group: "Panties", Color: "#53428D", Lost: false},
		{Item: "LaceBra", Group: "Bra", Color: "#53428D", Lost: false},
	],
	"LatexPrisoner" : [{"Item":"Catsuit","Group":"Catsuit","Color":"#ffffff","Lost":false},{"Item":"LatexCorset","Group":"LatexCorset","Color":"#ffffff","Lost":false,"Filters":{"HeavyCorset":{"gamma":1,"saturation":0.41666666666666663,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"Corset":{"gamma":1,"saturation":0.4,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}}},{"Item":"LatexBra","Group":"LatexBra","Color":"#ffffff","Lost":false},{"Item":"ElfShoes","Group":"ElfShoes","Color":"#ffffff","Lost":false,"Filters":{"ShoeLeft":{"gamma":1,"saturation":0.1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"ShoeRight":{"gamma":1,"saturation":0.1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"CrystalShoeLeft":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.18333333333333335,"red":1,"green":1,"blue":1,"alpha":1},"CrystalShoeRight":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.26666666666666666,"red":1,"green":1,"blue":1,"alpha":1}}},{"Item":"BanditWrist","Group":"BanditWrist","Color":"#ffffff","Lost":false,"Filters":{"WristLeft":{"gamma":1,"saturation":0.05,"contrast":1,"brightness":1.8166666666666667,"red":1,"green":1,"blue":1,"alpha":1},"WristRight":{"gamma":1,"saturation":0.05,"contrast":1,"brightness":1.8166666666666667,"red":1,"green":1,"blue":1,"alpha":1}}}],
	"Dungeon" : [
		{Item: "LacePanties", Group: "Panties", Color: "#53428D", Lost: false},
		{Item: "LaceBra", Group: "Bra", Color: "#53428D", Lost: false},
	],
	"Bast" : [{"Item":"ElfSkirt","Group":"ElfSkirt","Color":"#ffffff","Lost":false,"Filters":{"SkirtBand":{"gamma":1,"saturation":0.05,"contrast":1,"brightness":0.55,"red":1,"green":2.15,"blue":1,"alpha":1},"Skirt":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.6666666666666666,"red":1,"green":1,"blue":1,"alpha":1},"SkirtBack":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.6666666666666666,"red":1,"green":1,"blue":1,"alpha":1}}},{"Item":"ElfTop","Group":"ElfTop","Color":"#ffffff","Lost":false,"Filters":{"Cloth":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.6666666666666666,"red":1,"green":1,"blue":1,"alpha":1}}},{"Item":"ElfBra","Group":"ElfBra","Color":"#ffffff","Lost":false},{"Item":"RobeBra","Group":"RobeBra","Color":"#ffffff","Lost":false},{"Item":"ElfPanties","Group":"ElfPanties","Color":"#ffffff","Lost":false},{"Item":"WarriorBoots","Group":"WarriorBoots","Color":"#ffffff","Lost":false}],
	"Dragon" : [
		{Item: "Dragonheart", Group: "Uniform", Color: "#444444", Lost: false},
	],
	"DollSuit" : [
		{Item: "Catsuit", Group: "Catsuit", Color: "#7F3C9B", Lost: false, Filters: {
			TorsoUpper: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":1.2333333333333334,"red":3.7166666666666663,"green":1,"blue":3.283333333333333,"alpha":1},
			TorsoLower: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":1.2333333333333334,"red":3.7166666666666663,"green":1,"blue":3.283333333333333,"alpha":1},
		}},
	],
	"SlimeSuit" : [
		{Item: "Catsuit", Group: "Catsuit", Color: "#7F3C9B", Lost: false, Filters: {
			TorsoUpper: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":1.2333333333333334,"red":3.7166666666666663,"green":1,"blue":3.283333333333333,"alpha":1},
			TorsoLower: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":1.2333333333333334,"red":3.7166666666666663,"green":1,"blue":3.283333333333333,"alpha":1},
		}},
	],
	"CyberDoll" : [
		{Item: "Catsuit", Group: "Catsuit", Color: "#7F3C9B", Lost: false, Filters: {
			TorsoUpper: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":1.2333333333333334,"red":3.7166666666666663,"green":1,"blue":3.283333333333333,"alpha":1},
			TorsoLower: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":1.2333333333333334,"red":3.7166666666666663,"green":1,"blue":3.283333333333333,"alpha":1},
		}},
	],
	"ProtoSlimeSuit" : [
		{Item: "Catsuit", Group: "Catsuit", Color: "#7F3C9B", Lost: false, Filters: {
			TorsoUpper: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":0.5333333333333334,"blue":3.7166666666666663,"red":1,"green":3.283333333333333,"alpha":1},
			TorsoLower: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":0.5333333333333334,"blue":3.7166666666666663,"red":1,"green":3.283333333333333,"alpha":1},
		}},
	],
	"BlueSuit" : [
		{Item: "Catsuit", Group: "Catsuit", Color: "#7F3C9B", Lost: false, Filters: {
			TorsoUpper: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":1.2333333333333334,"blue":3.7166666666666663,"red":1,"green":3.283333333333333,"alpha":1},
			TorsoLower: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":1.2333333333333334,"blue":3.7166666666666663,"red":1,"green":3.283333333333333,"alpha":1},
		}},
	],
	"Bountyhunter" : [
		{Item: "Catsuit", Group: "Suit", Color: "#444444", Lost: false},
		{Item: "BanditBoots", Group: "Shoes", Color: "#444444", Lost: false},
	],
	"BlueSuitPrison" : [
		{Item: "Catsuit", Group: "Catsuit", Color: "#7F3C9B", Lost: false, Filters: {
			TorsoUpper: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":1.2333333333333334,"blue":3.7166666666666663,"red":1,"green":3.283333333333333,"alpha":1},
			TorsoLower: {"gamma":0.8333333333333333,"saturation":1,"contrast":0.75,"brightness":1.2333333333333334,"blue":3.7166666666666663,"red":1,"green":3.283333333333333,"alpha":1},
		}},
	],
	"Wolfgirl" : [
		{Item: "Wolf", Group: "Uniform", Color: "#444444", Lost: false},
	],
	"Maid" : [{"Item":"MaidShoes","Group":"MaidShoes","Color":"#ffffff","Lost":false,"Filters":{"ShoeLeft":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},"ShoeRight":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1}}},{"Item":"LaceBra","Group":"LaceBra","Color":"#ffffff","Lost":false,"Filters":{"BraBase":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"BraCups":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"BraStripes":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}}},{"Item":"LacePanties","Group":"LacePanties","Color":"#ffffff","Lost":false,"Filters":{"LaceCrotchPanel":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"Panties":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"Trim":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"Lace":{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}}},{"Item":"BunnySocks","Group":"BunnySocks","Color":"#ffffff","Lost":false,"Filters":{"SockRight":{"gamma":1.2,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0980392156862746,"alpha":1},"SockLeft":{"gamma":1.2,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0980392156862746,"alpha":1}}},{"Item":"LeatherGloves","Group":"LeatherGloves","Color":"#ffffff","Lost":false,"Filters":{"GloveLeft":{"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0},"BandRight":{"gamma":1,"saturation":0,"contrast":0.9833333333333333,"brightness":0.5,"red":1.05,"green":1,"blue":1,"alpha":1},"GloveRight":{"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0},"RimRight":{"gamma":2,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},"RimLeft":{"gamma":2,"saturation":0,"contrast":1,"brightness":1.9333333333333333,"red":1,"green":1,"blue":1,"alpha":1},"BandLeft":{"gamma":1,"saturation":0,"contrast":0.9833333333333333,"brightness":0.5,"red":1.05,"green":1,"blue":1,"alpha":1}}},{"Item":"MaidBow","Group":"MaidBow","Color":"#ffffff","Lost":false,"Filters":{"Bow":{"gamma":1.4000000000000001,"saturation":1,"contrast":1,"brightness":1.25,"red":1,"green":1,"blue":1.1,"alpha":1}}},{"Item":"BowCorsetLongOverbust","Group":"BowCorsetLongOverbust","Color":"#ffffff","Lost":false,"Filters":{"CorsetBust":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.1,"alpha":1},"RuffleBust":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.1,"alpha":1},"Corset":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1.2,"red":1,"green":1,"blue":1.1,"alpha":1},"Ruffle":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1.2,"red":1,"green":1,"blue":1.1,"alpha":1}}},{"Item":"DressBlouseBust","Group":"DressBlouseBust","Color":"#ffffff","Lost":false,"Filters":{"BlouseSkirt":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},"Neck":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},"Collar":{"gamma":1.9,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.1,"alpha":1},"Blouse":{"gamma":1.9,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.1,"alpha":1}}},{"Item":"WitchBlouse","Group":"WitchBlouse","Color":"#ffffff","Lost":false,"Filters":{"BlouseLeft":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},"BlouseRight":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},"BlouseLiner":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},"Blouse":{"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1}}},{"Item":"BowCorsetBow","Group":"BowCorsetBow","Color":"#ffffff","Lost":false,"Filters":{"Bow":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.1,"alpha":1}}},{"Item":"Ribbon","Group":"Ribbon","Color":"#ffffff","Lost":false,"Filters":{"RibbonBelt":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1.5666666666666669,"red":1,"green":1,"blue":1.1,"alpha":1},"RibbonBack":{"gamma":1.9,"saturation":0,"contrast":1,"brightness":1.5666666666666669,"red":1,"green":1,"blue":1.1,"alpha":1}}},{"Item":"StrappyBikini","Group":"StrappyBikini","Color":"#ffffff","Lost":false,"Filters":{"StrappyLower":{"gamma":1,"saturation":0.05,"contrast":1,"brightness":0.55,"red":1,"green":1,"blue":1,"alpha":1}}},{"Item":"StrappyBra","Group":"StrappyBra","Color":"#ffffff","Lost":false,"Filters":{"Bra":{"gamma":1,"saturation":0.05,"contrast":1,"brightness":0.55,"red":1,"green":1,"blue":1,"alpha":1}}}],

	"Elven" : [
		{Item: "Elf", Group: "Uniform", Color: "#ffffff", Lost: false},
	],
	"Obsidian" : [
		{Item: "Catsuit", Group: "Suit", Color: "#444444", Lost: false},
	],
	"BindingDress": [{"Item":"DressBlouse","Group":"DressBlouse","Color":"#ffffff","Lost":false,"Filters":{"SkirtOverKneel":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.7333333333333334,"red":1.0166666666666666,"green":1,"blue":1.6666666666666665,"alpha":1},"BlouseArmLeft":{"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.6833333333333333,"alpha":1},"BlouseTorso":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.7333333333333334,"red":1.0166666666666666,"green":1,"blue":1.6666666666666665,"alpha":1},"BlouseSkirt":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.7333333333333334,"red":1.0166666666666666,"green":1,"blue":1.6666666666666665,"alpha":1},"Neck":{"gamma":0.2,"saturation":1,"contrast":1.3,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.16666666666666666},"Blouse":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.5166666666666666,"red":0.8666666666666667,"green":0.8,"blue":2.6500000000000004,"alpha":1},"Skirt":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.5166666666666666,"red":0.8666666666666667,"green":0.8,"blue":2.6500000000000004,"alpha":1},"SleeveRight":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.5166666666666666,"red":0.8666666666666667,"green":0.8,"blue":2.6500000000000004,"alpha":1},"SleeveLeft":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.5166666666666666,"red":0.8666666666666667,"green":0.8,"blue":2.6500000000000004,"alpha":1},"Collar":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.5166666666666666,"red":1.7000000000000002,"green":0.8,"blue":2.6500000000000004,"alpha":1}}},{"Item":"MaidCorset","Group":"MaidCorset","Color":"#ffffff","Lost":false,"Filters":{"Corset":{"gamma":1,"saturation":0.08333333333333333,"contrast":1,"brightness":1,"red":1.5833333333333333,"green":1,"blue":2.3499999999999996,"alpha":1}}},{"Item":"WitchSkirt","Group":"WitchSkirt","Color":"#ffffff","Lost":false,"Filters":{"Skirt":{"gamma":1,"saturation":0.05,"contrast":1,"brightness":0.5666666666666667,"red":1.2166666666666668,"green":1,"blue":3.033333333333333,"alpha":0.65},"SkirtRuffle":{"gamma":1,"saturation":0.05,"contrast":1,"brightness":0.5666666666666667,"red":2.916666666666667,"green":1,"blue":3.033333333333333,"alpha":1},"Ruffle":{"gamma":1,"saturation":1,"contrast":1,"brightness":0.5166666666666666,"red":3.6666666666666665,"green":0.65,"blue":2.4333333333333336,"alpha":1}}}],
};
