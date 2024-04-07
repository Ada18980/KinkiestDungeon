PIXI.Assets.init();

let DisplacementMaps = [
'TapeTopRight.webp',
'TapeTopRightBoxtie.webp',
'TapeTopRightCrossed.webp',
'TapeTopRightWristtie.webp',
'Thigh1SquishClosed.webp',
'Thigh1SquishHogtie.webp',
'Thigh1SquishKneelClosed.webp',
'Thigh2SquishClosed.webp',
'Thigh2SquishHogtie.webp',
'Thigh2SquishKneelClosed.webp',
'Thigh3SquishClosed.webp',
'Thigh3SquishHogtie.webp',
'Thigh3SquishKneelClosed.webp',
'ThighCuffsLeftClosed.webp',
'ThighCuffsLeftKneel.webp',
'ThighCuffsLeftKneelClosed.webp',
'ThighCuffsLeftSpread.webp',
'ThighCuffsRightClosed.webp',
'ThighCuffsRightKneel.webp',
'ThighCuffsRightKneelClosed.webp',
'ThighCuffsRightSpread.webp',
'CrystalErase.webp',
'Xray.webp',
'BallSuit.webp',
'Bubble.webp',
'Bubble2.webp',
'BustHuge.webp',
'Fiddle.webp',
'TightBelt.webp',
'XrayBra.webp',
'XrayFace.webp',
'XrayPanties.webp',
'Yoke.webp',
'AnkleCuffLeftClosed.webp',
'AnkleCuffLeftKneel.webp',
'AnkleCuffLeftKneelClosed.webp',
'AnkleCuffLeftSpread.webp',
'AnkleCuffRightClosed.webp',
'AnkleCuffRightSpread.webp',
'AnklesSquishClosed.webp',
'AnklesSquishKneel.webp',
'Arm1SquishBoxtie.webp',
'Arm1SquishWristtie.webp',
'Arm2SquishBoxtie.webp',
'Arm2SquishWristtie.webp',
'ArmHarnessSquish.webp',
'ArmStrapCrossed.webp',
'BalletClosed.webp',
'BalletErase.webp',
'BalletEraseSpread.webp',
'BalletHogtie.webp',
'BalletKneel.webp',
'BalletKneelClosed.webp',
'BalletRightErase.webp',
'BalletRightEraseClosed.webp',
'BalletSpread.webp',

'BalletCuffsClosed.webp',
'BalletCuffsHogtie.webp',
'BalletCuffsKneel.webp',
'BalletCuffsKneelClosed.webp',
'BalletCuffsSpread.webp',
'Belt.webp',
'BeltFeet1SquishClosed.webp',
'BeltFeet1SquishKneelClosed.webp',
'BeltFeet2SquishClosed.webp',
'BeltFeet2SquishKneelClosed.webp',
'BeltLegs1SquishClosed.webp',
'BeltLegs1SquishHogtie.webp',
'BeltLegs1SquishKneelClosed.webp',
'BeltLegs2SquishClosed.webp',
'BeltLegs2SquishHogtie.webp',
'BeltLegs2SquishKneelClosed.webp',
'BeltSquish.webp',
'BinderLeftBoxtie.webp',
'BinderLeftWristtie.webp',
'BinderRightBoxtie.webp',
'BinderRightWristtie.webp',
'BootsClosed.webp',
'BootsHogtie.webp',
'BootsKneel.webp',
'BootsKneelClosed.webp',
'BootsShortClosed.webp',
'BootsShortHogtie.webp',
'BootsShortKneel.webp',
'BootsShortKneelClosed.webp',
'BootsShortSpread.webp',
'BootsSpread.webp',
'Breastplate.webp',
'Calf1SquishClosed.webp',
'Calf1SquishKneelClosed.webp',
'Calf2SquishClosed.webp',
'Calf2SquishHogtie.webp',
'Calf2SquishKneelClosed.webp',
'Calf3SquishClosed.webp',
'Calf3SquishHogtie.webp',
'Calf3SquishKneelClosed.webp',
'CorsetSquish.webp',
'CorsetSquishTight.webp',
'CrotchropeSquished.webp',
'CuffLeftCrossed.webp',
'CuffLeftFree.webp',
'CuffLeftFront.webp',
'CuffLeftYoked.webp',
'CuffRightCrossed.webp',
'CuffRightFree.webp',
'CuffRightFront.webp',
'CuffRightYoked.webp',
'CuffsSquishCrossed.webp',
'CuffsSquishFront.webp',
'ElbowCuffLeftBoxtie.webp',
'ElbowCuffLeftCrossed.webp',
'ElbowCuffLeftFree.webp',
'ElbowCuffLeftFront.webp',
'ElbowCuffLeftUp.webp',
'ElbowCuffLeftWristtie.webp',
'ElbowCuffLeftYoked.webp',
'ElbowCuffRightBoxtie.webp',
'ElbowCuffRightCrossed.webp',
'ElbowCuffRightFree.webp',
'ElbowCuffRightFront.webp',
'ElbowCuffRightUp.webp',
'ElbowCuffRightWristtie.webp',
'ElbowCuffRightYoked.webp',
'ForeArm1SquishWristtie.webp',
'ForeArm2SquishWristtie.webp',
'FrogThigh1SquishKneel.webp',
'FrogThigh1SquishKneelClosed.webp',
'FrogThigh2SquishKneel.webp',
'FrogThigh2SquishKneelClosed.webp',
'FrogThigh3SquishKneel.webp',
'FrogThigh3SquishKneelClosed.webp',
'HarnessSquish.webp',
'HeelsClosed.webp',
'HeelsErase.webp',
'HeelsEraseSpread.webp',
'HeelsHogtie.webp',
'HeelsKneel.webp',
'HeelsKneelClosed.webp',
'HeelsRightErase.webp',
'HeelsRightEraseClosed.webp',
'HeelsSpread.webp',
'JacketArmsBoxtie.webp',
'JacketArmsCrossed.webp',
'JacketArmsWristtie.webp',
'JacketBoxtie.webp',
'JacketCrossed.webp',
'JacketWristtie.webp',
'LaceChest.webp',
'LeftFrogtieSquishKneel.webp',
'LeftFrogtieSquishKneelClosed.webp',
'Leg1SquishClosed.webp',
'MittsFree.webp',
'MittsFront.webp',
'MittsCrossed.webp',
'MittsYoked.webp',
'Null.webp',
'RightFrogtieSquishKneel.webp',
'RightFrogtieSquishKneelClosed.webp',
'Sarco.webp',
'SlimeCorsetErase.webp',
'TapeAnklesSquishClosed.webp',
'TapeAnklesSquishKneel.webp',
'TapeAnklesSquishKneelClosed.webp',
'TapeAnklesSquishHogtie.webp',
'TapeArmsBoxtie.webp',
'TapeFullLeft.webp',
'TapeFullLeftBoxtie.webp',
'TapeFullLeftCrossed.webp',
'TapeFullLeftWristtie.webp',
'TapeFullRight.webp',
'TapeFullRightBoxtie.webp',
'TapeFullRightCrossed.webp',
'TapeFullRightWristtie.webp',
'TapeHeavyLeft.webp',
'TapeHeavyLeftBoxtie.webp',
'TapeHeavyLeftCrossed.webp',
'TapeHeavyLeftWristtie.webp',
'TapeHeavyRight.webp',
'TapeHeavyRightBoxtie.webp',
'TapeHeavyRightCrossed.webp',
'TapeHeavyRightWristtie.webp',
'TapeLightLeft.webp',
'TapeLightLeftBoxtie.webp',
'TapeLightLeftCrossed.webp',
'TapeLightLeftWristtie.webp',
'TapeLightRight.webp',
'TapeLightRightBoxtie.webp',
'TapeLightRightCrossed.webp',
'TapeLightRightWristtie.webp',
'TapeMedLeft.webp',
'TapeMedLeftBoxtie.webp',
'TapeMedLeftCrossed.webp',
'TapeMedLeftWristtie.webp',
'TapeMedRight.webp',
'TapeMedRightBoxtie.webp',
'TapeMedRightCrossed.webp',
'TapeMedRightWristtie.webp',
'TapeTopLeft.webp',
'TapeTopLeftBoxtie.webp',
'TapeTopLeftCrossed.webp',
'TapeTopLeftWristtie.webp',
'EraseCorsetKneel.webp',
'EraseCorsetKneelEncase.webp',
'EraseCorset.webp',
'EraseCorsetEncase.webp',
'ReversePrayer.webp',
'ButtSleeves.webp',
'PetsuitSquish.webp',
'LegbinderSquishClosed.webp',
'LegbinderSquishHogtie.webp',
'LegbinderSquishKneelClosed.webp',
'SlimeThighsKneelClosed.webp',
'SlimeThighsClosed.webp',
'SlimeThighsHogtie.webp',
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
		let result = preload ? await PIXI.Assets.backgroundLoad(dataFile).then(() => {}, () => {
			CurrentLoading = "Error Loading " + dataFile;
			KDLoadingDone += amount;
		})
		 : await PIXI.Assets.load(dataFile).then(() => {}, () => {
			CurrentLoading = "Error Loading " + dataFile;
			KDLoadingDone += amount;
		});

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
	PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;
	PIXI.BaseTexture.defaultOptions.anisotropicLevel = 4;

}
load();

(() => {
	let extensions = PIXI.extensions;
	// Alternatively your plugin could be an object, such as with the @pixi/assets parsers
	const modAtlasLoader = {
		extension: {
			type: PIXI.ExtensionType.LoadParser,
			name: 'modAtlasLoader',
		},
		name: 'modAtlasLoader',

		async load<T>(url: string): Promise<T>
		{
			if (KDModFiles[url]) url = KDModFiles[url];
			else {
				url = url.substring(url.indexOf("blob:http:/"));
				url = url.replace("blob:http:/", "blob:http://")
			}

			const response = await PIXI.settings.ADAPTER.fetch(url);

			const json = await response.json();

			//json.meta.image = "TextureAtlas/" + json.meta.image;
			console.log(json)

			return json as T;
		},
	}


	// Make sure to "register" the extension!
	extensions.add(modAtlasLoader);

	const validImageExtensions = ['.jpeg', '.jpg', '.webp', '.webp', '.avif'];
	const validImageMIMEs = [
		'image/jpeg',
		'image/webp',
		'image/webp',
		'image/avif',
	];

	// Alternatively your plugin could be an object, such as with the @pixi/assets parsers
	const modTextureLoader = {
		extension: {
			type: PIXI.ExtensionType.LoadParser,
			name: 'modTextureLoader',
			priority: PIXI.LoaderParserPriority.High + 1,
		},
		name: 'modTextureLoader',

		config: {
			preferWorkers: true,
			preferCreateImageBitmap: true,
			crossOrigin: 'anonymous',
		},

		test(url: string): boolean
		{
			return (PIXI.checkDataUrl(url, validImageMIMEs) || PIXI.checkExtension(url, validImageExtensions)) && KDModFiles[url];
		},

		async load(url: string, asset: any, loader: any): Promise<any>
		{
			if (KDModFiles[url]) url = KDModFiles[url];
			const useImageBitmap = globalThis.createImageBitmap && this.config.preferCreateImageBitmap;
			let src: HTMLImageElement | ImageBitmap;

			if (useImageBitmap)
			{

				src = await PIXI.loadImageBitmap(url);
			}
			else
			{
				src = await new Promise((resolve, reject) =>
				{
					const src = new Image();

					src.crossOrigin = this.config.crossOrigin;
					src.src = url;
					if (src.complete)
					{
						resolve(src);
					}
					else
					{
						src.onload = () => resolve(src);
						src.onerror = (e) => reject(e);
					}
				});
			}

			const options = { ...asset.data };

			options.resolution ??= PIXI.utils.getResolutionOfUrl(url);
			if (useImageBitmap && options.resourceOptions?.ownsImageBitmap === undefined)
			{
				options.resourceOptions = { ...options.resourceOptions };
				options.resourceOptions.ownsImageBitmap = true;
			}

			const base = new PIXI.BaseTexture(src, options);

			base.resource.src = url;

			return PIXI.createTexture(base, loader, url);
		},

		unload(texture: PIXITexture): void
		{
			texture.destroy(true);
		}
	}

	// Make sure to "register" the extension!
	extensions.add(modTextureLoader);

	const resolveModURL = {
		extension: {
			type: PIXI.ExtensionType.ResolveParser,
			name: 'resolveModURL',
			priority: PIXI.LoaderParserPriority.High,
		},
		test: (url) => KDModFiles[url] != undefined,
		parse: (value: string): PIXIUnresolvedAsset =>
			({
				resolution: parseFloat(PIXI.settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
				format: PIXI.utils.path.extname(value).slice(1),
				src: KDModFiles[value],
			}),
	}

	extensions.add(resolveModURL);
})();
