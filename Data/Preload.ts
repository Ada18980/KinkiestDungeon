PIXI.Assets.init();

let linearList = [
	"TextureAtlas/atlas0.json",
	"TextureAtlas/disp0.json",
];

let nearestList = [
	"TextureAtlas/game0.json",
]

let lastProgress = 0;
function incrementProgress(amount) {
	return (progress) => {
		console.log(progress);
		if (progress < lastProgress) lastProgress = 0;
		KDLoadingDone += (progress - lastProgress) * amount;
		lastProgress = progress;
	};
}
async function LoadTextureAtlas(list, scale_mode, preload = false) {
	PIXI.BaseTexture.defaultOptions.scaleMode = scale_mode;

	for (let dataFile of list) {
		console.log("Found atlas: " + dataFile);
		let amount = 100;
		KDLoadingMax += amount;
	}
	for (let dataFile of list) {
		console.log("Loading" + dataFile);
		let amount = 100;
		let result = preload ? PIXI.Assets.backgroundLoad(dataFile) : PIXI.Assets.load(dataFile);

		result.then(() => {
			console.log(PIXI.Cache);
			KDLoadingDone += amount;
		});
		//let atlas = await result;
	}

}
LoadTextureAtlas(nearestList, PIXI.SCALE_MODES.NEAREST);
LoadTextureAtlas(linearList, PIXI.SCALE_MODES.LINEAR);