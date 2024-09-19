'use strict';

let KDParticles: Map<Number, {info: any, sprite: any}> = new Map();
let KDParticleid = 0;

let KDParticleEmitters: Map<Number, {emitted: any, emitter: any, sprite: any, type: any, img: string}> = new Map();
let KDParticleEmitterid = 0;

/**
 * @param x
 * @param y
 * @param img
 * @param _type
 * @param data
 */
function KDAddParticle(x: number, y: number, img: string, _type: string, data: KDParticleData): void {
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


/**
 * @param x
 * @param y
 * @param img
 * @param imgemitted
 * @param type
 * @param emitter
 * @param emitted
 */
function KDAddParticleEmitter(x: number, y: number, img: string, imgemitted: string, type: string, emitter: KDParticleEmitterData, emitted: KDParticleData): void {
	if (KDParticleEmitters.size > 1000) return;
	let tex = KDTex(img);

	if (tex && emitted && emitter) {
		let emitterinfo = Object.assign({}, emitter);
		Object.assign(emitterinfo, {
			time: 0,
			lifetime: (emitter.lifetime || 0) + (emitter.lifetime_spread ? (Math.random()*emitter.lifetime_spread - emitter.lifetime_spread*0.5) : 0),
			zIndex: emitter.zIndex || 100,
			vy: emitter.vy + (emitter.vy_spread ? (Math.random()*emitter.vy_spread - emitter.vy_spread*0.5) : 0),
			vx: emitter.vx + (emitter.vx_spread ? (Math.random()*emitter.vx_spread - emitter.vx_spread*0.5) : 0),
			scale: emitter.scale || 1,
			scale_delta: emitter.scale_delta || 0,
			sin_y: emitter.sin_y + (emitter.sin_y_spread ? (Math.random()*emitter.sin_y_spread - emitter.sin_y_spread*0.5) : 0),
			sin_x: emitter.sin_x + (emitter.sin_x_spread ? (Math.random()*emitter.sin_x_spread - emitter.sin_x_spread*0.5) : 0),
			sin_period: emitter.sin_period + (emitter.sin_period_spread ? (Math.random()*emitter.sin_period_spread - emitter.sin_period_spread*0.5) : 0),
			phase: emitter.phase || 0,
			cd: emitter.cd || 0,
			rate: emitter.rate,
		});

		// Create the sprite
		let sprite = PIXI.Sprite.from(tex);
		sprite.position.x = x;
		sprite.position.y = y;
		sprite.zIndex = emitterinfo.zIndex;

		if (emitterinfo.scale != 1 || emitterinfo.scale_delta) {
			sprite.scale.x = emitterinfo.scale;
			sprite.scale.y = emitterinfo.scale;
		}

		if (emitterinfo.fadeEase) {
			switch (emitterinfo.fadeEase) {
				case "invcos": {sprite.alpha = Math.min(1, Math.max(0, 1 - Math.cos(2 * Math.PI * emitterinfo.time / emitterinfo.lifetime)));}
			}
		}

		KDParticleEmitters.set(KDParticleEmitterid, {emitter: emitterinfo, emitted: emitted, sprite: sprite, type: type, img: imgemitted});

		KDParticleEmitterid += 1;
		if (KDParticleEmitterid > 4000000000) KDParticleEmitterid = 0;
	}
}


function KDUpdateParticles(delta: number) {
	let id = 0;
	let info: KDParticleData = null;
	let sprite = null;
	for (let particle of KDParticles.entries()) {
		id = particle[0].valueOf();
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

		if ((info.rotation || info.rotation_spread) && !sprite.rotation) sprite.rotation = (info.rotation || 0) + (info.rotation_spread || 0) * (2 * KDRandom() - 1);

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


	let emitter: KDParticleEmitterData = null;
	for (let particle of KDParticleEmitters.entries()) {
		id = particle[0].valueOf();
		emitter = particle[1].emitter;
		sprite = particle[1].sprite;

		if (emitter.camX != undefined && KinkyDungeonCamXVis != emitter.camX) {
			sprite.position.x -= (KinkyDungeonCamXVis - emitter.camX) * KinkyDungeonGridSizeDisplay;
			emitter.camX = KinkyDungeonCamXVis;
		}
		if (emitter.camY != undefined && KinkyDungeonCamYVis != emitter.camY) {
			sprite.position.y -= (KinkyDungeonCamYVis - emitter.camY) * KinkyDungeonGridSizeDisplay;
			emitter.camY = KinkyDungeonCamYVis;
		}


		if (emitter.rotation && !sprite.rotation) sprite.rotation = emitter.rotation + (emitter.rotation_spread || 0) * (2 * KDRandom() - 1);

		if (emitter.vy) {sprite.position.y += emitter.vy * delta;}
		if (emitter.vx) {sprite.position.x += emitter.vx * delta;}

		if (emitter.sin_x && emitter.sin_period) {sprite.position.x += emitter.sin_x * Math.sin(emitter.phase + emitter.sin_period * emitter.time / emitter.lifetime) * delta;}
		if (emitter.sin_y && emitter.sin_period) {sprite.position.y += emitter.sin_y * Math.sin(emitter.phase + emitter.sin_period * emitter.time / emitter.lifetime) * delta;}

		if (emitter.fadeEase) {
			switch (emitter.fadeEase) {
				case "invcos": {sprite.alpha = Math.min(1, Math.max(0, 1 - Math.cos(2 * Math.PI * emitter.time / emitter.lifetime)));}
			}
		}

		if (emitter.scale != 1 || emitter.scale_delta) {
			sprite.scale.x = emitter.scale;
			sprite.scale.y = emitter.scale;
			emitter.scale += delta * emitter.scale_delta;
		}

		emitter.time += delta;
		emitter.cd -= delta;

		if (emitter.cd < 0) {
			KDAddParticle(sprite.position.x, sprite.position.y, particle[1].img, particle[1].type, particle[1].emitted);
			emitter.cd = emitter.rate;
		}

		if (!emitter.lifetime || emitter.time > emitter.lifetime) {
			KDRemoveParticleEmitter(id);
		}
	}
}

function KDRemoveParticle(id: number) {
	if (KDParticles.has(id)) {
		kdparticles.removeChild(KDParticles.get(id).sprite);
		KDParticles.get(id).sprite.destroy();
		KDParticles.delete(id);
	}
}

function KDRemoveParticleEmitter(id: number) {
	if (KDParticleEmitters.has(id)) {
		kdparticles.removeChild(KDParticleEmitters.get(id).sprite);
		KDParticleEmitters.get(id).sprite.destroy();
		KDParticleEmitters.delete(id);
	}
}

let lastArousalParticle = 0;
let lastVibeParticle = 0;

/**
 * Draws arousal heart particles
 * @param pinkChance - 0 to 1
 * @param density - 0 to 1
 * @param purpleChance - 0 to 1
 */
function KDDrawArousalParticles(pinkChance: number, density: number, purpleChance: number) {
	if (density == 0) return;
	let arousalRate = 100 / density;

	if (CommonTime() > lastArousalParticle + arousalRate) {
		KDCreateArousalParticle(pinkChance, purpleChance);

		lastArousalParticle = CommonTime();
	}

}

function KDDrawVibeParticles(density: number) {

	let arousalRate = 100 / density;
	if (StandalonePatched) arousalRate *= 2;
	if (KinkyDungeonVibeLevel > 0 && CommonTime() > lastVibeParticle + 0.03 * arousalRate * (3/(3 + KinkyDungeonVibeLevel))) {
		KDCreateVibeParticle();

		lastVibeParticle = CommonTime();
	}
}

function KDAddShockwave(x: number, y: number, size: number, spr: string = `Particles/Shockwave.png`, attachToCamera: boolean = true) {
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
		data['camX'] = KinkyDungeonCamX;
		data['camY'] = KinkyDungeonCamY;
	}
	KDAddParticle(
		x,
		y,
		KinkyDungeonRootDirectory + spr,
		undefined, data);
}

function KDSendGagParticles(entity: entity): void {
	if (!KDToggles.GagParticles) return;
	if (entity?.player) {
		// Player

		let lifetime = 2000;
		let pos = GetHardpointLoc(KinkyDungeonPlayer, 0, 0, 1, "Mouth", KDToggles.FlipPlayer);
		let x = pos.x;
		let y = pos.y;

		let vxx = ((KDToggles.FlipPlayer) ? -1 : 1) * (0.15 + Math.random()*0.05);
		let vyy = -.07 + Math.random() * .23;

		// Apply rotation
		let vx = vxx * Math.cos(pos.angle) - vyy * Math.sin(pos.angle);
		let vy = vxx * Math.sin(pos.angle) + vyy * Math.cos(pos.angle);

		KDAddParticleEmitter(
			x,
			y,
			KinkyDungeonRootDirectory + `Aura/Null.png`,
			KinkyDungeonRootDirectory + `Particles/nnn.png`,
			undefined, {
				time: 0,
				lifetime: 1000,
				vx: 0,
				vy: 0,
				zIndex: 60,
				rotation: 0,
				cd: 0,
				rate: 235,
			},
			{
				time: 0,
				lifetime: lifetime,
				vx: vx,
				vy: vy,
				zIndex: 60,
				sin_y: .1,
				sin_y_spread: .02,
				sin_period: 1.4,
				phase: 6 * Math.random(),
				fadeEase: "invcos",
				rotation: 0,
				rotation_spread: 0.25,
			});



	} else
	if (entity) {
		// Enemy
		let x = (entity.x - KinkyDungeonCamX + 0.5) * KinkyDungeonGridSizeDisplay;
		let y = (entity.y - KinkyDungeonCamY + 0.5) * KinkyDungeonGridSizeDisplay;

		let lifetime = 900;

		let vx = ((entity.flip) ? 1 : -1) * ((Math.random() < 0.7) ? 1 : -1) * (0.08 + Math.random()*0.03);
		let vy = -.0215 + Math.random() * .03;

		KDAddParticleEmitter(
			x,
			y,
			KinkyDungeonRootDirectory + `Aura/Null.png`,
			KinkyDungeonRootDirectory + `Particles/nnn.png`,
			undefined, {
				time: 0,
				lifetime: 780,
				vx: 0,
				vy: 0,
				zIndex: 60,
				rotation: 0,
				cd: 0,
				rate: 175,
			},
			{
				time: 0,
				lifetime: lifetime,
				vx: vx,
				vy: vy,
				camX: KinkyDungeonCamX,
				camY: KinkyDungeonCamY,
				zIndex: 60,
				scale: 0.5,
				sin_y: .1,
				sin_y_spread: .02,
				sin_period: 1.4,
				phase: 6 * Math.random(),
				fadeEase: "invcos",
				rotation: 0,
				rotation_spread: 0.25,
			});
	}
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
		let pos = GetHardpointLoc(KinkyDungeonPlayer, 0, 0, 1, "Front", KDToggles.FlipPlayer);
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
				let pos = forceSide > 0 ? GetHardpointLoc(KinkyDungeonPlayer, 0, 0, 1, "BreastRight", KDToggles.FlipPlayer) : GetHardpointLoc(KinkyDungeonPlayer, 0, 0, 1, "BreastLeft", KDToggles.FlipPlayer);
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
 * @param pinkChance - 0 to 1
 * @param purpleChance - 0 to 1
 */
function KDCreateArousalParticle(pinkChance: number, purpleChance: number) {
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
