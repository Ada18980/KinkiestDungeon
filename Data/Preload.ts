PIXI.Assets.init();

let DisplacementMaps = [
	"AnklesSquishClosed.png",
	"AnklesSquishKneel.png",
	"Arm1SquishBoxtie.png",
	"Arm1SquishWristtie.png",
	"Arm2SquishBoxtie.png",
	"Arm2SquishWristtie.png",
	"ArmHarnessSquish.png",
	"BeltSquish.png",
	"BootsClosed.png",
	"BootsHogtie.png",
	"BootsKneel.png",
	"BootsKneelClosed.png",
	"BootsSpread.png",
	"Calf1SquishClosed.png",
	"Calf1SquishKneelClosed.png",
	"Calf2SquishClosed.png",
	"Calf2SquishHogtie.png",
	"Calf2SquishKneelClosed.png",
	"Calf3SquishClosed.png",
	"Calf3SquishHogtie.png",
	"Calf3SquishKneelClosed.png",
	"CrotchropeSquish.png",
	"CuffLeftCrossed.png",
	"CuffLeftFree.png",
	"CuffLeftYoked.png",
	"CuffRightCrossed.png",
	"CuffRightFree.png",
	"CuffRightYoked.png",
	"CuffRightFront.png",
	"CuffLeftFront.png",
	"Belt.png",
	"ElbowCuffLeftFree.png",
	"ElbowCuffRightFree.png",
	"ElbowCuffLeftYoked.png",
	"ElbowCuffRightYoked.png",
	"ElbowCuffRightWristtie.png",
	"ElbowCuffLeftWristtie.png",
	"ElbowCuffRightBoxtie.png",
	"ElbowCuffLeftBoxtie.png",
	"CuffsSquishFront.png",
	"ForeArm1SquishWristtie.png",
	"ForeArm2SquishWristtie.png",
	"FrogThigh1SquishKneel.png",
	"FrogThigh1SquishKneelClosed.png",
	"FrogThigh2SquishKneel.png",
	"FrogThigh2SquishKneelClosed.png",
	"FrogThigh3SquishKneel.png",
	"FrogThigh3SquishKneelClosed.png",
	"HarnessSquish.png",
	"LeftFrogtieSquishKneel.png",
	"LeftFrogtieSquishKneelClosed.png",
	"Leg1SquishClosed.png",
	"RightFrogtieSquishKneel.png",
	"RightFrogtieSquishKneelClosed.png",
	"Thigh1SquishClosed.png",
	"Thigh1SquishHogtie.png",
	"Thigh1SquishKneelClosed.png",
	"Thigh2SquishClosed.png",
	"Thigh2SquishHogtie.png",
	"Thigh2SquishKneelClosed.png",
	"Thigh3SquishClosed.png",
	"Thigh3SquishHogtie.png",
	"Thigh3SquishKneelClosed.png",
	"Yoke.png",
	"BinderLeftBoxtie.png",
	"BinderLeftWristtie.png",
	"BinderRightBoxtie.png",
	"BinderRightWristtie.png",
	"AnkleCuffRightSpread.png",
	"AnkleCuffLeftClosed.png",
	"AnkleCuffLeftKneel.png",
	"AnkleCuffLeftKneelClosed.png",
	"AnkleCuffLeftSpread.png",
	"AnkleCuffRightClosed.png",
	"ThighCuffRightSpread.png",
	"ThighCuffLeftClosed.png",
	"ThighCuffLeftKneel.png",
	"ThighCuffLeftKneelClosed.png",
	"ThighCuffRightKneel.png",
	"ThighCuffRightKneelClosed.png",
	"ThighCuffLeftSpread.png",
	"ThighCuffRightClosed.png",
];

let linearList = [
	"TextureAtlas/atlas0.json",
	...DisplacementMaps.map((e) => {return "DisplacementMaps/" + e;}),
];

let nearestList = [
	//"TextureAtlas/game0.json",
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