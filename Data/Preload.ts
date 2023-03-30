PIXI.Assets.init();

let preloadList = [
	"TextureAtlas/game0.json",
	"TextureAtlas/atlas0.json",
];

let lastProgress = 0;
function incrementProgress(amount) {
	return (progress) => {
		console.log(progress);
		if (progress < lastProgress) lastProgress = 0;
		KDLoadingDone += (progress - lastProgress) * amount;
		lastProgress = progress;
	};
}
async function LoadTextureAtlas(list, preload = false) {
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


LoadTextureAtlas(preloadList);