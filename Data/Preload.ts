PIXI.Assets.init();

let DisplacementMaps = [
'TapeTopRight.png',
'TapeTopRightBoxtie.png',
'TapeTopRightCrossed.png',
'TapeTopRightWristtie.png',
'Thigh1SquishClosed.png',
'Thigh1SquishHogtie.png',
'Thigh1SquishKneelClosed.png',
'Thigh2SquishClosed.png',
'Thigh2SquishHogtie.png',
'Thigh2SquishKneelClosed.png',
'Thigh3SquishClosed.png',
'Thigh3SquishHogtie.png',
'Thigh3SquishKneelClosed.png',
'ThighCuffsLeftClosed.png',
'ThighCuffsLeftKneel.png',
'ThighCuffsLeftKneelClosed.png',
'ThighCuffsLeftSpread.png',
'ThighCuffsRightClosed.png',
'ThighCuffsRightKneel.png',
'ThighCuffsRightKneelClosed.png',
'ThighCuffsRightSpread.png',
'Xray.png',
'XrayBra.png',
'XrayFace.png',
'XrayPanties.png',
'Yoke.png',
'AnkleCuffLeftClosed.png',
'AnkleCuffLeftKneel.png',
'AnkleCuffLeftKneelClosed.png',
'AnkleCuffLeftSpread.png',
'AnkleCuffRightClosed.png',
'AnkleCuffRightSpread.png',
'AnklesSquishClosed.png',
'AnklesSquishKneel.png',
'Arm1SquishBoxtie.png',
'Arm1SquishWristtie.png',
'Arm2SquishBoxtie.png',
'Arm2SquishWristtie.png',
'ArmHarnessSquish.png',
'ArmStrapCrossed.png',
'BalletClosed.png',
'BalletErase.png',
'BalletEraseSpread.png',
'BalletHogtie.png',
'BalletKneel.png',
'BalletKneelClosed.png',
'BalletRightErase.png',
'BalletRightEraseClosed.png',
'BalletSpread.png',
'Belt.png',
'BeltFeet1SquishClosed.png',
'BeltFeet1SquishKneelClosed.png',
'BeltFeet2SquishClosed.png',
'BeltFeet2SquishKneelClosed.png',
'BeltLegs1SquishClosed.png',
'BeltLegs1SquishHogtie.png',
'BeltLegs1SquishKneelClosed.png',
'BeltLegs2SquishClosed.png',
'BeltLegs2SquishHogtie.png',
'BeltLegs2SquishKneelClosed.png',
'BeltSquish.png',
'BinderLeftBoxtie.png',
'BinderLeftWristtie.png',
'BinderRightBoxtie.png',
'BinderRightWristtie.png',
'BootsClosed.png',
'BootsHogtie.png',
'BootsKneel.png',
'BootsKneelClosed.png',
'BootsShortClosed.png',
'BootsShortHogtie.png',
'BootsShortKneel.png',
'BootsShortKneelClosed.png',
'BootsShortSpread.png',
'BootsSpread.png',
'Breastplate.png',
'Calf1SquishClosed.png',
'Calf1SquishKneelClosed.png',
'Calf2SquishClosed.png',
'Calf2SquishHogtie.png',
'Calf2SquishKneelClosed.png',
'Calf3SquishClosed.png',
'Calf3SquishHogtie.png',
'Calf3SquishKneelClosed.png',
'CorsetSquish.png',
'CrotchropeSquished.png',
'CuffLeftCrossed.png',
'CuffLeftFree.png',
'CuffLeftFront.png',
'CuffLeftYoked.png',
'CuffRightCrossed.png',
'CuffRightFree.png',
'CuffRightFront.png',
'CuffRightYoked.png',
'CuffsSquishCrossed.png',
'CuffsSquishFront.png',
'ElbowCuffLeftBoxtie.png',
'ElbowCuffLeftCrossed.png',
'ElbowCuffLeftFree.png',
'ElbowCuffLeftFront.png',
'ElbowCuffLeftUp.png',
'ElbowCuffLeftWristtie.png',
'ElbowCuffLeftYoked.png',
'ElbowCuffRightBoxtie.png',
'ElbowCuffRightCrossed.png',
'ElbowCuffRightFree.png',
'ElbowCuffRightFront.png',
'ElbowCuffRightUp.png',
'ElbowCuffRightWristtie.png',
'ElbowCuffRightYoked.png',
'ForeArm1SquishWristtie.png',
'ForeArm2SquishWristtie.png',
'FrogThigh1SquishKneel.png',
'FrogThigh1SquishKneelClosed.png',
'FrogThigh2SquishKneel.png',
'FrogThigh2SquishKneelClosed.png',
'FrogThigh3SquishKneel.png',
'FrogThigh3SquishKneelClosed.png',
'HarnessSquish.png',
'HeelsClosed.png',
'HeelsErase.png',
'HeelsEraseSpread.png',
'HeelsHogtie.png',
'HeelsKneel.png',
'HeelsKneelClosed.png',
'HeelsRightErase.png',
'HeelsRightEraseClosed.png',
'HeelsSpread.png',
'JacketArmsBoxtie.png',
'JacketArmsCrossed.png',
'JacketArmsWristtie.png',
'JacketBoxtie.png',
'JacketCrossed.png',
'JacketWristtie.png',
'LaceChest.png',
'LeftFrogtieSquishKneel.png',
'LeftFrogtieSquishKneelClosed.png',
'Leg1SquishClosed.png',
'MittsFree.png',
'MittsFront.png',
'MittsYoked.png',
'Null.png',
'RightFrogtieSquishKneel.png',
'RightFrogtieSquishKneelClosed.png',
'Sarco.png',
'TapeAnklesSquishClosed.png',
'TapeAnklesSquishKneel.png',
'TapeArmsBoxtie.png',
'TapeFullLeft.png',
'TapeFullLeftBoxtie.png',
'TapeFullLeftCrossed.png',
'TapeFullLeftWristtie.png',
'TapeFullRight.png',
'TapeFullRightBoxtie.png',
'TapeFullRightCrossed.png',
'TapeFullRightWristtie.png',
'TapeHeavyLeft.png',
'TapeHeavyLeftBoxtie.png',
'TapeHeavyLeftCrossed.png',
'TapeHeavyLeftWristtie.png',
'TapeHeavyRight.png',
'TapeHeavyRightBoxtie.png',
'TapeHeavyRightCrossed.png',
'TapeHeavyRightWristtie.png',
'TapeLightLeft.png',
'TapeLightLeftBoxtie.png',
'TapeLightLeftCrossed.png',
'TapeLightLeftWristtie.png',
'TapeLightRight.png',
'TapeLightRightBoxtie.png',
'TapeLightRightCrossed.png',
'TapeLightRightWristtie.png',
'TapeMedLeft.png',
'TapeMedLeftBoxtie.png',
'TapeMedLeftCrossed.png',
'TapeMedLeftWristtie.png',
'TapeMedRight.png',
'TapeMedRightBoxtie.png',
'TapeMedRightCrossed.png',
'TapeMedRightWristtie.png',
'TapeTopLeft.png',
'TapeTopLeftBoxtie.png',
'TapeTopLeftCrossed.png',
'TapeTopLeftWristtie.png',
];

// Scale factor for displacement and erase maps
let DisplacementScale = 0.5;

let displacementList = [
	...DisplacementMaps.map((e) => {return "DisplacementMaps/" + e;}),
];

let linearList = [
	"TextureAtlas/atlas0.json",
];

let nearestList = [
	"TextureAtlas/game0.json",
]

let CurrentLoading = "";

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
		let amount = 100;
		let result = preload ? await PIXI.Assets.backgroundLoad(dataFile) : await PIXI.Assets.load(dataFile);

		//console.log(value)
		CurrentLoading = "Loaded " + dataFile;
		//console.log(dataFile);
		KDLoadingDone += amount;

		/*result.then((value) => {

		}, () => {
			CurrentLoading = "Error Loading " + dataFile;
			KDLoadingDone += amount;
		});*/
		//let atlas = await result;
	}

}

async function PreloadDisplacement(list) {
	for (let dataFile of list) {
		console.log("Found d_map: " + dataFile);
		let amount = 100;
		KDLoadingMax += amount;
	}
	for (let dataFile of list) {
		let amount = 100;
		let texture = PIXI.Texture.fromURL(dataFile, {
			resourceOptions: {
				scale: DisplacementScale
			}
		});
		texture.then((value) => {
			console.log(value)
			CurrentLoading = "Loaded " + dataFile;
			//console.log(dataFile);
			KDLoadingDone += amount;
		}, () => {
			CurrentLoading = "Error Loading " + dataFile;
			console.log(CurrentLoading);
			KDLoadingDone += amount;
		});
		/*let result = preload ? PIXI.Assets.backgroundLoad(dataFile) : PIXI.Assets.load(dataFile);

		result.then((value) => {
			console.log(value)
			CurrentLoading = "Loaded " + dataFile;
			//console.log(dataFile);
			KDLoadingDone += amount;
		}, () => {
			CurrentLoading = "Error Loading " + dataFile;
			console.log(CurrentLoading);
			KDLoadingDone += amount;
		});*/
		//let atlas = await result;
	}
}

KDLoadToggles();
if (!KDToggles.HighResDisplacement) DisplacementScale = 0.25

async function load() {

	await LoadTextureAtlas(nearestList, KDToggles.NearestNeighbor ? PIXI.SCALE_MODES.NEAREST : PIXI.SCALE_MODES.LINEAR);
	await LoadTextureAtlas(linearList, PIXI.SCALE_MODES.LINEAR);
	await PreloadDisplacement(displacementList);
}
load();