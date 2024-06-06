PIXI.Assets.init();


let KDFontName = "Inconsolata Medium";

let KDBaseFonts = [
	["Inconsolata", {
		alias: "Inconsolata",
		src: 'Fonts/Inconsolata/Inconsolata-Regular.ttf',
		mono: true,
		width: 1.25,
	}],
	["Inconsolata Medium", {
		alias: "Inconsolata Medium",
		src: 'Fonts/Inconsolata/Inconsolata-Medium.ttf',
		mono: true,
		width: 1.25,
	}],
	["Inconsolata Light", {
		alias: "Inconsolata Light",
		src: 'Fonts/Inconsolata/Inconsolata-Light.ttf',
		mono: true,
		width: 1.25,
	}],
	["Inconsolata Condensed Medium", {
		alias: "Inconsolata Condensed Medium",
		src: 'Fonts/Inconsolata/Inconsolata_Condensed-Medium.ttf',
		mono: true,
		width: 1.5,
	}],
	["Inconsolata Condensed Light", {
		alias: "Inconsolata Condensed Light",
		src: 'Fonts/Inconsolata/Inconsolata_Condensed-Light.ttf',
		mono: true,
		width: 1.5,
	}],
	["3270", {
		alias: "3270 Regular",
		src: 'Fonts/3270/3270-Regular.ttf',
		mono: true,
		width: 1.0,
	}],
	["3270 Condensed", {
		alias: "3270condensed Regular",
		src: 'Fonts/3270/3270Condensed-Regular.ttf',
		mono: true,
		width: 1.5,
	}],
	["Courier New", {
		alias: "Courier New",
		src: '',
		mono: true,
		width: 1.0,
	}],
	["Lekton", {
		alias: "Lekton Regular",
		src: 'Fonts/Lekton/Lekton-Regular.ttf',
		mono: true,
		width: 1.25,
	}],
	["System", {
		alias: "Fsex302",
		src: 'Fonts/System/FSEX302.ttf',
		mono: true,
		width: 1.1,
	}],
	["Iosevka Regular", {
		alias: "Iosevka Regular",
		src: 'Fonts/Iosevka/Iosevka-Regular.ttf',
		mono: true,
		width: 1.25,
	}],
	["Iosevka Medium", {
		alias: "Iosevka Medium",
		src: 'Fonts/Iosevka/Iosevka-Medium.ttf',
		mono: true,
		width: 1.25,
	}],
	["Iosevka Slab Regular", {
		alias: "Iosevkaslab Regular",
		src: 'Fonts/Iosevka/IosevkaSlab-Regular.ttf',
		mono: true,
		width: 1.25,
	}],
	["Iosevka Slab Medium", {
		alias: "Iosevkaslab Medium",
		src: 'Fonts/Iosevka/IosevkaSlab-Medium.ttf',
		mono: true,
		width: 1.25,
	}],
	["Iosevka Curly Regular", {
		alias: "Iosevkacurly Regular",
		src: 'Fonts/Iosevka/IosevkaCurly-Regular.ttf',
		mono: true,
		width: 1.25,
	}],
	["Iosevka Curly Medium", {
		alias: "Iosevkacurly Medium",
		src: 'Fonts/Iosevka/IosevkaCurly-Medium.ttf',
		mono: true,
		width: 1.25,
	}],
	["Nanum Gothic Coding", {
		alias: "Nanumgothiccoding Regular",
		src: 'Fonts/Nanum/NanumGothicCoding-Regular.ttf',
		mono: true,
		width: 1.25,
	}],
	["Roboto", {
		alias: "Roboto Regular",
		src: 'Fonts/Roboto/Roboto-Regular.ttf',
		mono: false,
		width: 1.3,
	}],
];

let KDFonts = new Map();
for (let obj of KDBaseFonts) {
	KDFonts.set(obj[0], obj[1]);
}
let KDFontsAlias = new Map();
for (let obj of KDBaseFonts) {
	if (typeof obj[1] !== "string")
		KDFontsAlias.set(obj[1].alias, obj[1]);
}

let KDSelectedFont = KDFontName;
let KDSelectedFontListIndex = 0;
let KDSelectedFontList = Array.from(KDFonts.keys());

let KDButtonFont = KDFontName;
let KDButtonFontListIndex = 0;
let KDButtonFontList = Array.from(KDFonts.keys());

let DisplacementMaps = [
'HideBoxtieHand.png',
'FutureBox.png',
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
'CrystalErase.png',
'Xray.png',
'BallSuit.png',
'Bubble.png',
'Bubble2.png',
'BustHuge.png',
'Fiddle.png',
'TightBelt.png',
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
'BalletRightEraseKneel.png',
'BalletRightEraseClosed.png',
'BalletSpread.png',

'BalletCuffsClosed.png',
'BalletCuffsHogtie.png',
'BalletCuffsKneel.png',
'BalletCuffsKneelClosed.png',
'BalletCuffsSpread.png',
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
'CorsetSquishTight.png',
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
'MittsCrossed.png',
'MittsYoked.png',
'Null.png',
'RightFrogtieSquishKneel.png',
'RightFrogtieSquishKneelClosed.png',
'Sarco.png',
'SlimeCorsetErase.png',
'TapeAnklesSquishClosed.png',
'TapeAnklesSquishKneel.png',
'TapeAnklesSquishKneelClosed.png',
'TapeAnklesSquishHogtie.png',
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
'EraseCorsetKneel.png',
'EraseCorsetKneelEncase.png',
'EraseCorset.png',
'EraseCorsetEncase.png',
'ReversePrayer.png',
'ButtSleeves.png',
'PetsuitSquish.png',
'LegbinderSquishClosed.png',
'LegbinderSquishHogtie.png',
'LegbinderSquishKneelClosed.png',
'SlimeThighsKneelClosed.png',
'SlimeThighsClosed.png',
'SlimeThighsHogtie.png',
];

// Scale factor for displacement and erase maps
let DisplacementScale = 0.25;

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
		let result = preload ? await PIXI.Assets.backgroundLoad(dataFile).then((value) => {

			//console.log(value)
			CurrentLoading = "Loaded " + dataFile;
			//console.log(dataFile);
			KDLoadingDone += amount;

		}, () => {
			CurrentLoading = "Error Loading " + dataFile;
			KDLoadingDone += amount;
		})
		 : await PIXI.Assets.load(dataFile).then((value) => {
			for (let s of Object.values(value.linkedSheets)) {
				for (let t of Object.keys((s as any).textures)) {
					KDTex(t, scale_mode == PIXI.SCALE_MODES.NEAREST);
				}
			}

			//console.log(value)
			CurrentLoading = "Loaded " + dataFile;
			//console.log(dataFile);
			KDLoadingDone += amount;
		 }, () => {
			CurrentLoading = "Error Loading " + dataFile;
			KDLoadingDone += amount;
		});


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
		let amount = 1;
		KDLoadingMax += amount;
	}
	for (let dataFile of list) {
		let amount = 1;
		let texture = PIXI.Texture.fromURL(dataFile, {
			resourceOptions: {
				scale: DisplacementScale,
			}
		});
		texture.then((value) => {
			console.log(value)
			CurrentLoading = "Loaded " + dataFile;
			//console.log(dataFile);
			KDTex(dataFile, false);
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
if (!KDToggles.HighResDisplacement) DisplacementScale = 1/16


async function load() {

	for (let font of KDFonts.values()) {
		if (font.src) {
			try {
				const url_to_font_name = font.src;
				const font_name = new FontFace(font.alias, `url(${url_to_font_name})`);
				document.fonts.add(font_name);
				// Work that does not require `font_name` to be loaded…
				await font_name.load()
				// Work that requires `font_name` to be loaded…

				//await PIXI.Assets.load( {
				//	src: font.src,
				//});
			} catch (err) {
				console.log(err);
			}
		}

	}



	PIXI.BaseTexture.defaultOptions.mipmap = PIXI.MIPMAP_MODES.ON;
	PIXI.BaseTexture.defaultOptions.anisotropicLevel = 0;
	await LoadTextureAtlas(nearestList, KDToggles.NearestNeighbor ? PIXI.SCALE_MODES.NEAREST : PIXI.SCALE_MODES.LINEAR);
	await LoadTextureAtlas(linearList, PIXI.SCALE_MODES.LINEAR);
	await PreloadDisplacement(displacementList);
	PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;

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

	const validImageExtensions = ['.jpeg', '.jpg', '.png', '.webp', '.avif'];
	const validImageMIMEs = [
		'image/jpeg',
		'image/png',
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
