'use strict';

/** @type {Map<Number, {info: any, sprite: any}>} */
let KDParticles = new Map();
let KDParticleid = 0;

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string} img
 * @param {string} type
 * @param {KDParticleData} data
 */
function KDAddParticle(x, y, img, type, data) {
	if (KDParticles.size > 1000) return;
	let tex = KDTex(img);

	if (tex && data) {
		// Setup info...
		let info = Object.assign({}, data);
		Object.assign(info, {
			time: 0,
			lifetime: (data.lifetime || 0) + (data.lifetime_spread ? (Math.random()*data.lifetime_spread - data.lifetime_spread*0.5) : 0),
			zIndex: data.zIndex || 100,
			vy: data.vy + (data.vy_spread ? (Math.random()*data.vy_spread - data.vy_spread*0.5) : 0),
			vx: data.vx + (data.vx_spread ? (Math.random()*data.vx_spread - data.vx_spread*0.5) : 0),
			scale: data.scale || 1,
			scale_delta: data.scale_delta || 0,
			sin_y: data.sin_y + (data.sin_y_spread ? (Math.random()*data.sin_y_spread - data.sin_y_spread*0.5) : 0),
			sin_x: data.sin_x + (data.sin_x_spread ? (Math.random()*data.sin_x_spread - data.sin_x_spread*0.5) : 0),
			sin_period: data.sin_period + (data.sin_period_spread ? (Math.random()*data.sin_period_spread - data.sin_period_spread*0.5) : 0),
			phase: data.phase || 0,
		});
		// Create the sprite
		let sprite = PIXI.Sprite.from(tex);
		sprite.position.x = x;
		sprite.position.y = y;
		sprite.zIndex = info.zIndex;

		if (info.scale != 1 || info.scale_delta) {
			sprite.scale.x = info.scale;
			sprite.scale.y = info.scale;
		}

		if (info.fadeEase) {
			switch (info.fadeEase) {
				case "invcos": {sprite.alpha = Math.min(1, Math.max(0, 1 - Math.cos(2 * Math.PI * info.time / info.lifetime)));}
			}
		}

		KDParticles.set(KDParticleid, {info: info, sprite: sprite});
		kdparticles.addChild(sprite);

		KDParticleid += 1;
		if (KDParticleid > 4000000000) KDParticleid = 0;
	}
}


function KDUpdateParticles(delta) {
	let id = 0;
	/**  @type {KDParticleData} */
	let info = null;
	let sprite = null;
	for (let particle of KDParticles.entries()) {
		id = particle[0];
		info = particle[1].info;
		sprite = particle[1].sprite;

		if (info.camX != undefined && KinkyDungeonCamXVis != info.camX) {
			sprite.position.x -= (KinkyDungeonCamXVis - info.camX) * KinkyDungeonGridSizeDisplay;
			info.camX = KinkyDungeonCamXVis;
		}
		if (info.camY != undefined && KinkyDungeonCamYVis != info.camY) {
			sprite.position.y -= (KinkyDungeonCamYVis - info.camY) * KinkyDungeonGridSizeDisplay;
			info.camY = KinkyDungeonCamYVis;
		}

		sprite.anchor.set(0.5);

		if (info.rotation && !sprite.rotation) sprite.rotation = info.rotation;

		if (info.vy) {sprite.position.y += info.vy * delta;}
		if (info.vx) {sprite.position.x += info.vx * delta;}

		if (info.sin_x && info.sin_period) {sprite.position.x += info.sin_x * Math.sin(info.phase + info.sin_period * info.time / info.lifetime) * delta;}
		if (info.sin_y && info.sin_period) {sprite.position.y += info.sin_y * Math.sin(info.phase + info.sin_period * info.time / info.lifetime) * delta;}

		if (info.fadeEase) {
			switch (info.fadeEase) {
				case "invcos": {sprite.alpha = Math.min(1, Math.max(0, 1 - Math.cos(2 * Math.PI * info.time / info.lifetime)));}
			}
		}

		if (info.scale != 1 || info.scale_delta) {
			sprite.scale.x = info.scale;
			sprite.scale.y = info.scale;
			info.scale += delta * info.scale_delta;
		}

		info.time += delta;
		if (!info.lifetime || info.time > info.lifetime) {
			KDRemoveParticle(id);
		}
	}
}

function KDRemoveParticle(id) {
	if (KDParticles.has(id)) {
		kdparticles.removeChild(KDParticles.get(id).sprite);
		KDParticles.get(id).sprite.destroy();
		KDParticles.delete(id);
	}
}

let lastArousalParticle = 0;
let lastVibeParticle = 0;

/**
 * Draws arousal heart particles
 * @param {number} pinkChance - 0 to 1
 * @param {number} density - 0 to 1
 * @param {number} purpleChance - 0 to 1
 */
function KDDrawArousalParticles(pinkChance, density, purpleChance) {
	if (density == 0) return;
	let arousalRate = 100 / density;

	if (CommonTime() > lastArousalParticle + arousalRate) {
		KDCreateArousalParticle(pinkChance, purpleChance);

		lastArousalParticle = CommonTime();
	}

}

function KDDrawVibeParticles(density) {

	let arousalRate = 100 / density;
	if (StandalonePatched) arousalRate *= 2;
	if (KinkyDungeonVibeLevel > 0 && CommonTime() > lastVibeParticle + 0.03 * arousalRate * (3/(3 + KinkyDungeonVibeLevel))) {
		KDCreateVibeParticle();

		lastVibeParticle = CommonTime();
	}
}

function KDAddShockwave(x, y, size, spr = `Particles/Shockwave.png`, attachToCamera = true) {
	let lifetime = 700 + size;
	let data = {
		time: 0,
		lifetime: lifetime,
		vx: 0,
		vy: 0,
		zIndex: 10,
		phase: 0,
		scale: 0.001,
		scale_delta: size / 512 / lifetime,
		fadeEase: "invcos",
		rotation: 0,
	};
	if (attachToCamera) {
		data.camX = KinkyDungeonCamX;
		data.camY = KinkyDungeonCamY;
	}
	KDAddParticle(
		x,
		y,
		KinkyDungeonRootDirectory + spr,
		undefined, data);
}

/**
 *
 */
function KDCreateVibeParticle() {
	let lifetime = 500 + Math.random() * 250;
	let x = 250 - (StandalonePatched ? 5 : 0);
	let Hogtied = KDIsHogtied(KinkyDungeonPlayer);
	let Kneeling = KDIsKneeling(KinkyDungeonPlayer);
	let y = 520 + (Hogtied ? 165 : (Kneeling ? 78 : 0));
	if (StandalonePatched) {
		// Throw out in favor of new system
		let pos = GetHardpointLoc(KinkyDungeonPlayer, 0, 0, 1, "Front");
		x = pos.x;
		y = pos.y;
	}

	let locations = KDSumVibeLocations();
	let vx = ((Math.random() > 0.5) ? -1 : 1) * (0.1 + Math.random()*0.15);
	let vy = -.15 + Math.random() * .3;
	let breast = locations.includes("ItemBreast") || locations.includes("ItemNipples");
	let cli = (locations.includes("ItemVulvaPiercings") || locations.includes("ItemPelvis"));
	let forceSide = 0;
	if (breast || cli) {
		if (cli && (locations.length == 1 || Math.random() < 0.25)) {
			vy = 0.25 + Math.random()*0.1;
			vx = -.05 + Math.random() * .1;
		}
		else if (breast && !Hogtied && (locations.length == 1 || Math.random() < 0.5)) {
			if (StandalonePatched) {
				if (Math.random() > 0.5) forceSide = 1;
				else forceSide = -1;
				let pos = forceSide > 0 ? GetHardpointLoc(KinkyDungeonPlayer, 0, 0, 1, "BreastRight") : GetHardpointLoc(KinkyDungeonPlayer, 0, 0, 1, "BreastLeft");
				x = pos.x;
				y = pos.y;
				vx = ((Math.random() > 0.5) ? -1 : 1) * (0.05 + Math.random()*0.12);
				vy = -.1 + Math.random() * .3;
				if ((forceSide > 0 && vx < 0) || (forceSide < 0 && vx > 0)) vx *= -1;
			} else {
				y -= 155;
			}
		}

	}

	if (KinkyDungeonPlayer.HeightRatio) y += (100) * (1 - KinkyDungeonPlayer.HeightRatio);
	if (KinkyDungeonPlayer.HeightModifier) y -= KinkyDungeonPlayer.HeightModifier;

	KDAddParticle(
		x,
		y,
		KinkyDungeonRootDirectory + `Particles/VibeHeart.png`,
		undefined, {
			time: 0,
			lifetime: lifetime,
			vx: vx,
			vy: vy,
			zIndex: 60,
			sin_x: .04,
			sin_x_spread: .01,
			sin_period: 1.4,
			phase: 6 * Math.random(),
			fadeEase: "invcos",
			rotation: Math.atan2(vy, vx),
		});
}

/**
 *
 * @param {number} pinkChance - 0 to 1
 * @param {number} purpleChance - 0 to 1
 */
function KDCreateArousalParticle(pinkChance, purpleChance) {
	let lifetime = 2000 + Math.random() * 1000;
	let y = 200 + Math.random() * 700;
	let xval = Math.random() < 0.5 ? 0.3 * Math.random() : (1 - 0.3 * Math.random());
	let x = xval * 500;
	let vy = -0.3 * Math.min(500, y) / lifetime;
	KDAddParticle(
		x,
		y,
		KinkyDungeonRootDirectory + `Particles/${
			Math.random() < purpleChance ? "HeartPurple" :
			(Math.random() < pinkChance ? "HeartPink" : "Heart")
		}.png`,
		undefined, {
			time: 0,
			lifetime: lifetime,
			vy: vy,
			zIndex: -1,
			sin_x: .04,
			sin_x_spread: .01,
			sin_period: 1.4,
			phase: 6 * Math.random(),
			fadeEase: "invcos",
		});
}