'use strict';

let preloadList = [
	"TextureAtlas/atlas0.json",
];

async function LoadTextureAtlas(list) {
	for (let dataFile of list) {
		console.log("Loading" + dataFile);
		let atlas = await PIXI.Assets.backgroundLoad(dataFile);
		console.log(atlas);
	}
}

LoadTextureAtlas(preloadList);