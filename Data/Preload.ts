PIXI.Assets.init();

let DisplacementMaps = [
"AnkleCuffLeftClosed.png",
"BootsShortKneelClosed.png",
"HarnessSquish.png",
"TapeLightLeft.png",
"AnkleCuffLeftKneel.png",
"BootsShortSpread.png",
"HeelsClosed.png",
"TapeLightLeftBoxtie.png",
"AnkleCuffLeftKneelClosed.png",
"BootsSpread.png",
"HeelsErase.png",
"TapeLightLeftCrossed.png",
"AnkleCuffLeftSpread.png",
"Breastplate.png",
"HeelsEraseSpread.png",
"TapeLightLeftWristtie.png",
"AnkleCuffRightClosed.png",
"Calf1SquishClosed.png",
"HeelsHogtie.png",
"TapeLightRight.png",
"AnkleCuffRightSpread.png",
"Calf1SquishKneelClosed.png",
"HeelsKneel.png",
"TapeLightRightBoxtie.png",
"AnklesSquishClosed.png",
"Calf2SquishClosed.png",
"HeelsKneelClosed.png",
"TapeLightRightCrossed.png",
"AnklesSquishKneel.png",
"Calf2SquishHogtie.png",
"HeelsRightErase.png",
"TapeLightRightWristtie.png",
"Arm1SquishBoxtie.png",
"Calf2SquishKneelClosed.png",
"HeelsRightEraseClosed.png",
"TapeMedLeft.png",
"Arm1SquishWristtie.png",
"Calf3SquishClosed.png",
"HeelsSpread.png",
"TapeMedLeftBoxtie.png",
"Arm2SquishBoxtie.png",
"Calf3SquishHogtie.png",
"JacketArmsBoxtie.png",
"TapeMedLeftCrossed.png",
"Arm2SquishWristtie.png",
"Calf3SquishKneelClosed.png",
"JacketArmsCrossed.png",
"TapeMedLeftWristtie.png",
"ArmHarnessSquish.png",
"CorsetSquish.png",
"JacketArmsWristtie.png",
"TapeMedRight.png",
"ArmStrapCrossed.png",
"CrotchRopeSquish.png",
"JacketBoxtie.png",
"TapeMedRightBoxtie.png",
"BalletClosed.png",
"CuffLeftCrossed.png",
"JacketCrossed.png",
"TapeMedRightCrossed.png",
"BalletErase.png",
"CuffLeftFree.png",
"JacketWristtie.png",
"TapeMedRightWristtie.png",
"BalletEraseSpread.png",
"CuffLeftFront.png",
"LaceChest.png",
"TapeTopLeft.png",
"BalletHogtie.png",
"CuffLeftYoked.png",
"LeftFrogtieSquishKneel.png",
"TapeTopLeftBoxtie.png",
"BalletKneel.png",
"CuffRightCrossed.png",
"LeftFrogtieSquishKneelClosed.png",
"TapeTopLeftCrossed.png",
"BalletKneelClosed.png",
"CuffRightFree.png",
"Leg1SquishClosed.png",
"TapeTopLeftWristtie.png",
"BalletRightErase.png",
"CuffRightFront.png",
"MittsFree.png",
"TapeTopRight.png",
"BalletRightEraseClosed.png",
"CuffRightYoked.png",
"MittsFront.png",
"TapeTopRightBoxtie.png",
"BalletSpread.png",
"CuffsSquishCrossed.png",
"MittsYoked.png",
"TapeTopRightCrossed.png",
"Belt.png",
"CuffsSquishFront.png",
"Null.png",
"TapeTopRightWristtie.png",
"BeltFeet1SquishClosed.png",
"ElbowCuffLeftBoxtie.png",
"RightFrogtieSquishKneel.png",
"Thigh1SquishClosed.png",
"BeltFeet1SquishKneelClosed.png",
"ElbowCuffLeftCrossed.png",
"RightFrogtieSquishKneelClosed.png",
"Thigh1SquishHogtie.png",
"BeltFeet2SquishClosed.png",
"ElbowCuffLeftFree.png",
"Sarco.png",
"Thigh1SquishKneelClosed.png",
"BeltFeet2SquishKneelClosed.png",
"ElbowCuffLeftFront.png",
"TapeAnklesSquishClosed.png",
"Thigh2SquishClosed.png",
"BeltLegs1SquishClosed.png",
"ElbowCuffLeftUp.png",
"TapeAnklesSquishKneel.png",
"Thigh2SquishHogtie.png",
"BeltLegs1SquishHogtie.png",
"ElbowCuffLeftWristtie.png",
"TapeArmsBoxtie.png",
"Thigh2SquishKneelClosed.png",
"BeltLegs1SquishKneelClosed.png",
"ElbowCuffLeftYoked.png",
"TapeFullLeft.png",
"Thigh3SquishClosed.png",
"BeltLegs2SquishClosed.png",
"ElbowCuffRightBoxtie.png",
"TapeFullLeftBoxtie.png",
"Thigh3SquishHogtie.png",
"BeltLegs2SquishHogtie.png",
"ElbowCuffRightCrossed.png",
"TapeFullLeftCrossed.png",
"Thigh3SquishKneelClosed.png",
"BeltLegs2SquishKneelClosed.png",
"ElbowCuffRightFree.png",
"TapeFullLeftWristtie.png",
"ThighCuffLeftClosed.png",
"BeltSquish.png",
"ElbowCuffRightFront.png",
"TapeFullRight.png",
"ThighCuffLeftKneel.png",
"BinderLeftBoxtie.png",
"ElbowCuffRightUp.png",
"TapeFullRightBoxtie.png",
"ThighCuffLeftKneelClosed.png",
"BinderLeftWristtie.png",
"ElbowCuffRightWristtie.png",
"TapeFullRightCrossed.png",
"ThighCuffLeftSpread.png",
"BinderRightBoxtie.png",
"ElbowCuffRightYoked.png",
"TapeFullRightWristtie.png",
"ThighCuffRightClosed.png",
"BinderRightWristtie.png",
"ForeArm1SquishWristtie.png",
"TapeHeavyLeft.png",
"ThighCuffRightKneel.png",
"BootsClosed.png",
"ForeArm2SquishWristtie.png",
"TapeHeavyLeftBoxtie.png",
"ThighCuffRightKneelClosed.png",
"BootsHogtie.png",
"FrogThigh1SquishKneel.png",
"TapeHeavyLeftCrossed.png",
"ThighCuffRightSpread.png",
"BootsKneel.png",
"FrogThigh1SquishKneelClosed.png",
"TapeHeavyLeftWristtie.png",
"Xray.png",
"BootsKneelClosed.png",
"FrogThigh2SquishKneel.png",
"TapeHeavyRight.png",
"XrayBra.png",
"BootsShortClosed.png",
"FrogThigh2SquishKneelClosed.png",
"TapeHeavyRightBoxtie.png",
"XrayFace.png",
"BootsShortHogtie.png",
"FrogThigh3SquishKneel.png",
"TapeHeavyRightCrossed.png",
"XrayPanties.png",
"BootsShortKneel.png",
"FrogThigh3SquishKneelClosed.png",
"TapeHeavyRightWristtie.png",
"Yoke.png",
];

// Scale factor for displacement and erase maps
let DisplacementScale = 0.5;

let displacementList = [
	...DisplacementMaps.map((e) => {return "DisplacementMaps/" + e;}),
];

let linearList = [
	//"TextureAtlas/atlas0.json",
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
		let result = preload ? PIXI.Assets.backgroundLoad(dataFile) : PIXI.Assets.load(dataFile);

		result.then((value) => {
			//console.log(value)
			CurrentLoading = "Loaded " + dataFile;
			//console.log(dataFile);
			KDLoadingDone += amount;
		}, () => {
			CurrentLoading = "Error Loading " + dataFile;
			console.log(CurrentLoading);
			KDLoadingDone += amount;
		});
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

LoadTextureAtlas(nearestList, PIXI.SCALE_MODES.NEAREST);
LoadTextureAtlas(linearList, PIXI.SCALE_MODES.LINEAR);
PreloadDisplacement(displacementList);