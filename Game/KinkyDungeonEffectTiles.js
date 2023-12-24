"use strict";

let KDLatexDmg = 1;
let KDLatexBind = 2;

/**
 * @type {Record<string, effectTile>}
 */
let KDEffectTiles = {
	"FateBoundGround": {
		name: "Ice",
		duration: 2,
		priority: 10,
		tags: ["fate"],
	},
	"Ice": {
		name: "Ice",
		duration: 1,
		priority: 1,
		tags: ["ice", "slippery", "terrain"],
	},
	"Water": {
		name: "Water",
		duration: 40,
		priority: 1,
		tags: ["water", "freezeover", "conductive", "slippery", "terrain"],
	},
	"Cracked": {
		name: "Cracked",
		duration: 100,
		priority: 0,
		affinities: ["Edge"],
		tags: ["terrain", "ground", "wettable", "freezeover"],
	},
	"Slime": {
		name: "Slime",
		duration: 10,
		priority: 2,
		affinities: ["Sticky"],
		tags: ["slime", "freezeover", "flammable", "conductive", "terrain"],
	},
	"Glue": {
		name: "Glue",
		duration: 10,
		priority: 1,
		affinities: ["Sticky"],
		tags: ["glue", "terrain"],
	},
	"Latex": {
		name: "Latex",
		duration: 80,
		priority: -2,
		affinities: ["Sticky", "Latex"],
		tags: ["latex", "insulator", "terrain"],
	},
	"LiquidMetal": {
		name: "LiquidMetal",
		duration: 300,
		priority: -2,
		affinities: ["Slippery"],
		tags: ["slippery", "metal", "conductive", "conductcold", "liquidmetal", "terrain"],
	},
	"LatexThin": {
		name: "LatexThin",
		functionName: "Latex",
		duration: 30,
		priority: -2.01,
		affinities: ["Latex"],
		tags: ["latex", "insulator", "terrain"],
	},
	"LatexBlue": {
		name: "LatexBlue",
		functionName: "Latex",
		duration: 80,
		priority: -2.01,
		affinities: ["Latex"],
		tags: ["latex", "insulator", "terrain"],
	},
	"LatexThinBlue": {
		name: "LatexThinBlue",
		functionName: "Latex",
		duration: 30,
		priority: -2.01,
		affinities: ["Latex"],
		tags: ["latex", "insulator", "terrain"],
	},
	"Ropes": {
		name: "Ropes",
		duration: 30,
		priority: 5,
		tags: ["bind", "rope", "flammable", "terrain"],
	},
	"Gunpowder": {
		name: "Gunpowder",
		duration: 400,
		priority: 2,
		tags: ["flammable"],
	},
	"Fabric": {
		name: "Fabric",
		duration: 30,
		priority: 5,
		tags: ["bind", "fabric", "flammable", "terrain"],
	},
	"Portals/DarkPortal": {
		name: "Portals/DarkPortal",
		duration: 40,
		priority: 100,
		brightness: 8,
		lightColor: 0x8b53e9,
		fade: "sine3000",
		spin: -0.25,
		xoffset: 0.5,
		yoffset: 0.5,
		tags: ["portal", "demonportal"],
	},
	"Portals/Portal": {
		name: "Portals/DarkPortal",
		duration: 40,
		priority: 100,
		brightness: 8,
		lightColor: 0x77aaff,
		fade: "sine3000",
		spin: -0.25,
		xoffset: 0.5,
		yoffset: 0.25,
		tags: ["portal", "demonportal"],
	},
	"FabricGreen": {
		name: "FabricGreen",
		duration: 30,
		priority: 5,
		brightness: 3.5,
		lightColor: 0x55ff55,
		tags: ["bind", "fabric", "terrain"],
	},
	"Vines": {
		name: "Vines",
		duration: 50,
		priority: 5,
		tags: ["bind", "vine", "flammable", "terrain"],
	},
	"Runes": {
		name: "Runes",
		duration: 9999,
		priority: 10,
		tags: ["runesummon", "rune", "hiddenmagic"],
	},
	"RunesTrap": {
		name: "RunesTrap",
		duration: 9999,
		priority: 10,
		tags: ["magic", "runetrap", "rune", "hiddenmagic"],
	},
	"BoobyTrap": {
		name: "BoobyTrap",
		duration: 9999,
		priority: 10,
		tags: ["trap", "hiddenmagic"],
	},
	"BoobyTrapMagic": {
		name: "BoobyTrapMagic",
		duration: 9999,
		priority: 10,
		tags: ["magic", "rune", "trap", "hiddenmagic"],
	},
	"Belts": {
		name: "Belts",
		duration: 30,
		priority: 5,
		tags: ["bind", "belt", "terrain"],
	},
	"Chains": {
		name: "Chains",
		duration: 30,
		priority: 5,
		tags: ["bind", "chain", "noisy", "conductive", "conductcold", "terrain"],
	},
	"SlimeBurning": {
		name: "SlimeBurning",
		duration: 5,
		priority: 3,
		affinities: ["Sticky", "Fire", "Hot"],
		tags: ["slime", "ignite", "fire", "hot", "conductive"],
	},
	"Smoke": {
		name: "Smoke",
		duration: 2,
		priority: 4,
		tags: ["smoke", "visionblock", "brightnessblock", "darkarea"],
	},
	"Inferno": {
		name: "Inferno",
		duration: 5,
		priority: 5,
		brightness: 6,
		lightColor: 0xff8933,
		affinities: ["Fire", "Hot"],
		tags: ["fire", "ignite", "smoke", "visionblock"],
	},
	"Ember": {
		name: "Ember",
		duration: 1,
		priority: 3,
		brightness: 3.5,
		visionBlockRadius: 2.5,
		lightColor: 0xb83716,
		affinities: ["Hot"],
		tags: ["ignite", "smoke", "visionblock"],
	},
	"Sparks": {
		name: "Sparks",
		duration: 4,
		priority: 7,
		brightness: 6,
		lightColor: 0xaaaaff,
		tags: ["ignite", "electric"],
	},
	"Chill": {
		name: "Chill",
		duration: 4,
		priority: 7,
		brightness: 2,
		lightColor: 0x88ffff,
		tags: ["ice", "chill"],
	},
	"WireSparks": {
		name: "WireSparks",
		duration: 4,
		priority: 51,
		brightness: 3,
		lightColor: 0xff5555,
		tags: ["signal"],
	},
	"WireSparksAct": {
		name: "WireSparks",
		duration: 1,
		priority: 1,
		tags: ["signalFrame"],
	},
	"Wire": {
		name: "Wire",
		duration: 9999,
		priority: 50,
		tags: ["hiddenmagic", "wire"],
	},
	"PressurePlate": {
		name: "PressurePlate",
		duration: 9999,
		priority: 50,
		tags: ["wire"],
	},
	"PressurePlateOneUse": {
		name: "PressurePlateOneUse",
		duration: 9999,
		priority: 50,
		tags: ["wire"],
	},
	"PressurePlateActive": {
		name: "PressurePlateActive",
		duration: 2,
		priority: 51,
		tags: ["ppactive"],
	},
	"PressurePlateHold": {
		name: "PressurePlateHold",
		duration: 9999,
		priority: 50,
		tags: ["wire"],
	},
	"Ignition": {
		name: "Ignition",
		duration: 1,
		priority: 0,
		brightness: 1.5,
		lightColor: 0xff8933,
		affinities: ["Fire", "Hot"],
		tags: ["ignite", "hot"],
	},
	"Sack": {
		name: "Sack",
		duration: 9999,
		priority: 10,
		yoffset: -1,
		tags: ["unbaggable", "brightnessblock", "darkarea"],
	},
	"Torch": {
		name: "Torch",
		duration: 9999,
		priority: 5,
		brightness: 6,
		lightColor: 0xff8933,
		yoffset: -1,
		affinitiesStanding: ["Fire", "Hot"],
		tags: ["hot", "snuffable"],
	},
	"TorchUnlit": {
		name: "TorchUnlit",
		duration: 9999,
		priority: 5,
		yoffset: -1,
		tags: ["sackable"],
	},
	"Lantern": {
		name: "Lantern",
		duration: 9999,
		priority: 5,
		brightness: 6.5,
		lightColor: 0xffee83,
		affinitiesStanding: ["Hook", "Edge", "Fire", "Hot"],
		yoffset: -1,
		tags: ["hot", "snuffable"],
	},
	"LanternUnlit": {
		name: "LanternUnlit",
		duration: 9999,
		priority: 5,
		affinitiesStanding: ["Hook", "Edge"],
		yoffset: -1,
		tags: ["sackable"],
	},
	"TorchOrb": {
		name: "TorchOrb",
		duration: 9999,
		priority: 5,
		brightness: 6,
		lightColor: 0x99aaff,
		affinitiesStanding: ["Hook", "Edge", "SmallMagic"],
		yoffset: -1,
		tags: ["sackable"],
	},
	"IllusOrb": {
		name: "IllusOrb",
		duration: 9999,
		priority: 5,
		brightness: 4,
		lightColor: 0xffffff,
		affinitiesStanding: ["Hook", "Edge", "SmallMagic"],
		yoffset: -1,
		tags: ["sackable"],
	},
	"IllusOrbDead": {
		name: "IllusOrbDead",
		duration: 9999,
		priority: 5,
		brightness: 2,
		lightColor: 0x6700ff,
		affinitiesStanding: ["Hook", "Edge"],
		yoffset: -1,
		tags: [],
	},
	"EdgeOrb": {
		name: "EdgeOrb",
		duration: 9999,
		priority: 5,
		brightness: 4,
		lightColor: 0xffffff,
		affinitiesStanding: ["Hook", "Edge", "SmallDark"],
		yoffset: -1,
		tags: [],
	},
	"EdgeOrbDead": {
		name: "EdgeOrbDead",
		duration: 9999,
		priority: 5,
		brightness: 2,
		lightColor: 0x6700ff,
		affinitiesStanding: ["Hook", "Edge"],
		yoffset: -1,
		tags: [],
	},
	"Steam": {
		name: "Steam",
		duration: 6,
		priority: 2,
		affinities: ["Hot"],
		tags: ["steam", "hot", "visionblock"],
	},
	"StarryTrail": {
		name: "StarryTrail",
		duration: 40,
		priority: 10,
		tags: [],
	},
};