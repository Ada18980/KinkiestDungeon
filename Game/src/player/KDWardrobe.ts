'use strict';


let KDConfirmType = "";
let KinkyDungeonReplaceConfirm = 0;

let KDCanRevertFlag = false;

let ColorPickerFilterCode = "";
let ColorPickerFilter = new PIXI.filters.AdjustmentFilter({
	brightness: 1,
	saturation: 1,
	gamma: 1,
	alpha: 1,
	red: 1,
	blue: 1,
	green: 1,
	contrast: 1,
});

let KDCurrentColorFilterCode = {};
let KDCurrentColorFilter = {};

let KDCurrentOutfit = 0;
let KDMaxOutfits = 99;
let KDMaxOutfitsDisplay = 10;
let KDMaxOutfitsIndex = 0;
let KDOutfitInfo = [];
let KDOutfitStore = {};
let KDOutfitOriginalStore = {};

let lastFilterUpdate = 0;
let FilterUpdateInterval = 90;

let KDModelListMax = 14;
let KDModelListViewSkip = 7;

let KDShowCharacterPalette = false;


let KDModelList_Categories_index = 0;
let KDModelList_Categories_viewindex = {index: 0};
let KDModelList_Categories = [];
let KDModelList_Toplevel_index = 0;
let KDModelList_Toplevel_viewindex = {index: 0};
let KDModelList_Toplevel = [];
let KDModelList_Sublevel_index = 0;
let KDModelList_Sublevel_viewindex = {index: 0};
let KDModelList_Sublevel = [];

let KDModelListFilter = "";

let KDRefreshProps = false;

let KDWardrobeCategories = [
	"Hairstyles",
	"Cosplay",
	"Face",
	"Eyes",
	"Mouth",
	"Uniforms",
	"Suits",
	"Armor",
	"Bodysuits",
	"Bras",
	"Underwear",
	"Socks",
	"Shoes",
	"Tops",
	"Gloves",
	"Sleeves",
	"Corsets",
	"Skirts",
	"Pants",
	"Accessories",
	"Hats",
	"FashionRestraints",
	"Toys",
	"Body",
	"Weapon",
];

if (TestMode) KDWardrobeCategories.push("Restraints");

let KDSelectedModel = null;
let KDColorSliders: LayerFilter = {
	gamma: 1,
	saturation: 1,
	contrast: 1,
	brightness: 1,
	red: 1,
	green: 1,
	blue: 1,
	alpha: 1,
};
let KDProps: LayerProperties = {
};
let KDColorSliderColor = {
	red: "#ff5555",
	green: "#55ff55",
	blue: "#5555ff",
};
let KDCurrentLayer = "";

let KDSavedColorCount = 18;
let KDSavedColorPerRow = 9;
let KDSavedColors = [

];
if (localStorage.getItem("kdcolorfilters")) KDSavedColors = JSON.parse(localStorage.getItem("kdcolorfilters"));
for (let i = 0; i < KDSavedColorCount; i++) {
	KDSavedColors.push(Object.assign({}, KDColorSliders));
}

//KDTextField("MapTileSkin", 1000 - 400 - 100, 150, 200, 60,);

let KDWardrobe_PoseArms = ["Free", "Crossed", "Front", "Yoked", "Boxtie", "Wristtie", "Up"];
let KDWardrobe_PoseLegs = ["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie",];
let KDWardrobe_PoseEyes = EYEPOSES;
let KDWardrobe_PoseEyes2 = EYE2POSES;
let KDWardrobe_PoseBrows = BROWPOSES;
let KDWardrobe_PoseBrows2 = BROW2POSES;
let KDWardrobe_PoseMouth = MOUTHPOSES;
let KDWardrobe_PoseBlush = ["BlushNeutral", ...BLUSHPOSES];

let KDNPCPoses = new Map();
let NPCDesiredPoses = new Map();

/*
KDNPCPoses.set(KinkyDungeonPlayer, {

});

KDNPCPoses.get(KinkyDungeonPlayer).CurrentPoseArms = KDWardrobe_PoseArms[0];
KDNPCPoses.get(KinkyDungeonPlayer).CurrentPoseLegs = KDWardrobe_PoseLegs[0];
KDNPCPoses.get(KinkyDungeonPlayer).CurrentPoseEyes = KDWardrobe_PoseEyes[0];
KDNPCPoses.get(KinkyDungeonPlayer).CurrentPoseEyes2 = KDWardrobe_PoseEyes2[0];
KDNPCPoses.get(KinkyDungeonPlayer).CurrentPoseBrows = KDWardrobe_PoseBrows[0];
KDNPCPoses.get(KinkyDungeonPlayer).CurrentPoseBrows2 = KDWardrobe_PoseBrows2[0];
KDNPCPoses.get(KinkyDungeonPlayer).CurrentPoseMouth = KDWardrobe_PoseMouth[0];
KDNPCPoses.get(KinkyDungeonPlayer).CurrentPoseBlush = KDWardrobe_PoseBlush[0];*/

function KDInitCurrentPose(blank?: boolean, C?: Character) {
	if (!C) C = KinkyDungeonPlayer;
	if (KDNPCPoses.has(C))
		KDNPCPoses.delete(C);
	KDNPCPoses.set(C, {

	});


	KDNPCPoses.get(C).CurrentPoseArms = blank ? "" : KDWardrobe_PoseArms[0];
	KDNPCPoses.get(C).CurrentPoseLegs = blank ? "" : KDWardrobe_PoseLegs[0];
	KDNPCPoses.get(C).CurrentPoseEyes = blank ? "" : KDWardrobe_PoseEyes[0];
	KDNPCPoses.get(C).CurrentPoseEyes2 = blank ? "" : KDWardrobe_PoseEyes2[0];
	KDNPCPoses.get(C).CurrentPoseBrows = blank ? "" : KDWardrobe_PoseBrows[0];
	KDNPCPoses.get(C).CurrentPoseBrows2 = blank ? "" : KDWardrobe_PoseBrows2[0];
	KDNPCPoses.get(C).CurrentPoseMouth = blank ? "" : KDWardrobe_PoseMouth[0];
	KDNPCPoses.get(C).CurrentPoseBlush = blank ? "" : KDWardrobe_PoseBlush[0];
}


function KDDrawSavedColors(X: number, y: number, max: number, C: Character): void {
	let spacing = 100;
	let vspacing = 120;
	let filters = (KDSelectedModel?.Filters ? KDSelectedModel.Filters[KDCurrentLayer] : undefined) || KDColorSliders;


	for (let ii = 0; ii < max && ii < KDSavedColors.length; ii++) {
		let i = ii;
		let Y = y;
		while (i >= KDSavedColorPerRow) {
			i -= KDSavedColorPerRow;
			Y += vspacing;
		}
		if (KDSavedColors[ii]) {
			if (KDCurrentColorFilterCode[ii] != JSON.stringify(KDSavedColors[ii])) {
				KDCurrentColorFilterCode[ii] = JSON.stringify(KDSavedColors[ii]);
				if (KDCurrentColorFilter[ii])
					KDCurrentColorFilter[ii].destroy();
				KDCurrentColorFilter[ii] = new PIXI.filters.AdjustmentFilter(KDSavedColors[ii]);
			}
		} else if (KDCurrentColorFilterCode[ii] != undefined) {
			KDCurrentColorFilterCode[ii] = undefined;
			if (KDCurrentColorFilter[ii])
				KDCurrentColorFilter[ii].destroy();
			KDCurrentColorFilter[ii] = new PIXI.filters.AdjustmentFilter({
				brightness: 1,
				saturation: 1,
				gamma: 1,
				alpha: 1,
				red: 1,
				blue: 1,
				green: 1,
				contrast: 1,
			});
		}
		if (!KDCurrentColorFilter[ii]) KDCurrentColorFilter[ii] = new PIXI.filters.AdjustmentFilter({
			brightness: 1,
			saturation: 1,
			gamma: 1,
			alpha: 1,
			red: 1,
			blue: 1,
			green: 1,
			contrast: 1,
		});

		KDDraw(kdcanvas, kdpixisprites, "SavedColor" + ii, KinkyDungeonRootDirectory + "UI/greyColor.png", X + spacing * i, Y, 64, 64, undefined, {
			filters: [
				KDCurrentColorFilter[ii],
			]
		});
		DrawButtonKDEx("SavedColorCopy" + ii, (_bdata) => {
			if (filters && KDSelectedModel) {
				KDSavedColors[ii] = Object.assign({}, filters);
				localStorage.setItem("kdcolorfilters", JSON.stringify(KDSavedColors));
			}
			return true;
		}, true, X + spacing * i + 32 - 48, Y + 64, 48, 48, "", "#ffffff", KinkyDungeonRootDirectory + "UI/savedColor_copy.png", undefined, false, true);
		DrawButtonKDEx("SavedColorPaste" + ii, (_bdata) => {
			if (filters && KDSelectedModel) {
				Object.assign(filters, KDSavedColors[ii]);
				KDChangeWardrobe(C);
				if (!KDSelectedModel.Filters) KDSelectedModel.Filters = {};
				KDSelectedModel.Filters[KDCurrentLayer] = Object.assign({}, filters);
				KDCurrentModels.get(C).Models.set(KDSelectedModel.Name, JSON.parse(JSON.stringify(KDSelectedModel)));
			}
			return true;
		}, true, X + spacing * i + 32 + 0, Y + 64, 48, 48, "", "#ffffff", KinkyDungeonRootDirectory + "UI/savedColor_paste.png", undefined, false, true);
	}
}

let KDPropsSlider = false;

/**
 * @param X
 * @param Y
 * @param C
 * @param Model
 */
function KDDrawColorSliders(X: number, Y: number, C: Character, Model: Model): void {
	DrawTextFitKD(TextGet("KDFilters"), X - 5 - 245 + 300, 25, 500, "#ffffff", KDTextGray0, undefined, "center");

	DrawBoxKD(X, 50, 310, 600, KDButtonColor, true, 0.5, -10);
	DrawBoxKD(X - 5 - 245, 5, 600, 700, KDButtonColor, false, 0.5, -10);
	DrawTextFitKD(TextGet("KDLayers"), X - 120, 80, 300, "#ffffff", KDTextGray0, 22, "center");

	let YY = Y;
	let width = 300;
	let layers = KDGetColorableLayers(Model, KDPropsSlider);
	if (!KDCurrentLayer) KDCurrentLayer = layers[0] || "";

	if (KDPropsSlider) {
		let Properties = (Model.Properties ? Model.Properties[KDCurrentLayer] : undefined) || KDProps;

		DrawButtonKDEx("ResetCurrentLayer", (_bdata) => {
			if (Model.Properties && Model.Properties[KDCurrentLayer]) {
				KDChangeWardrobe(C);
				delete Model.Properties[KDCurrentLayer];
				KDCurrentModels.get(C).Models.set(Model.Name, Model);
			}
			KDRefreshProps = true;
			lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
			ForceRefreshModels(C);
			return true;
		}, true, X + width/2 + 10, YY, width/2 - 10, 30, TextGet("KDResetLayerProps"), "#ffffff");


		if (!KDClipboardDisabled) {
			if (TestMode)
				DrawButtonKDEx("ExportAllProps", (_bdata) => {
					if (Model.Properties) {
						navigator.clipboard.writeText(JSON.stringify(Model.Properties));
					}
					return true;
				}, true, X + width/2 + 10, YY - 40, width/2 - 10, 30, TextGet("KDExportAllProps"), "#88ff88");

			DrawButtonKDEx("KDCopyProps", (_bdata) => {
				navigator.clipboard.writeText(JSON.stringify(Properties));
				return true;
			}, true, X, YY, width/2 - 10, 30, TextGet("KDCopyLayer"), "#ffffff");
			DrawButtonKDEx("KDPasteProps", (_bdata) => {
				navigator.clipboard.readText()
					.then(text => {
						let parsed: LayerProperties = JSON.parse(text);
						if (parsed) {
							console.log(Object.assign({}, parsed));
							KDChangeWardrobe(C);
							if (!Model.Properties) Model.Properties = {};
							Model.Properties[KDCurrentLayer] = Object.assign({}, parsed);
							KDCurrentModels.get(C).Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
							KDRefreshProps = true;
							lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
							ForceRefreshModels(C);
						}
					});
				return true;
			}, true, X, YY - 40, width/2 - 10, 30, TextGet("KDPasteLayer"), "#ffffff");
		} else {
			let CF = KDTextField("KDCopyProperties", X, YY - 50, width, 30, undefined, undefined, "300");
			if (CF.Created) {
				CF.Element.oninput = (_event: any) => {
					let value = ElementValue("KDCopyProperties");
					try {
						let parsed = JSON.parse(value);
						if (value) {
							KDChangeWardrobe(C);
							if (!Model.Properties) Model.Filters = {};
							if (!Model.Properties[KDCurrentLayer])
								Model.Properties[KDCurrentLayer] = Object.assign({}, KDProps);
							Model.Properties[KDCurrentLayer].LayerBonus = parsed.LayerBonus;
							Model.Properties[KDCurrentLayer].Rotation = parsed.Rotation;
							Model.Properties[KDCurrentLayer].XOffset = parsed.XOffset;
							Model.Properties[KDCurrentLayer].YOffset = parsed.YOffset;
							Model.Properties[KDCurrentLayer].XPivot = parsed.XPivot;
							Model.Properties[KDCurrentLayer].YPivot = parsed.YPivot;
							Model.Properties[KDCurrentLayer].XScale = parsed.XScale;
							Model.Properties[KDCurrentLayer].Protected = parsed.Protected;
							Model.Properties[KDCurrentLayer].NoOverride = parsed.NoOverride;
							Model.Properties[KDCurrentLayer].HideOverridden = parsed.HideOverridden;
							Model.Properties[KDCurrentLayer].YScale = parsed.YScale;
							KDCurrentModels.get(C).Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
							KDRefreshProps = true;
						}
					} catch (err) {
						console.log("Invalid Properties");
					}

				};
			}
		}
		YY += 60;

		/** Property fields */
		let fields: Record<keyof LayerProperties, string> = {
			"XOffset": "0",
			"YOffset": "0",
			"XPivot": "0",
			"YPivot": "0",
			"XScale": "1",
			"YScale": "1",
			"Rotation": "0",
			"LayerBonus": "0",
			"Protected": "0",
			"SuppressDynamic": "0",
			"HideOverridden": "0",
			"NoOverride": "0",
			"ExtraHidePoses": ",",
			"ExtraRequirePoses": ",",
			ExtraHidePrefixPose: ",",
			ExtraHidePrefixPoseSuffix: ",",
		};

		if (KDRefreshProps) {
			KDRefreshProps = false;
			YY += 400;
		} else {
			let YYold = YY;
			YY -= 24;
			for (let field0 of Object.entries(fields)) {

				let field = field0[0];
				let deff = field0[1];

				DrawTextFitKD(TextGet("KDPropField_" + field), X + width/2 + 10, YY + 10, width, "#ffffff", "#000000", 20);


				let FF = KDTextField("KDPropField" + field, X, YY, width, 20, undefined, undefined, "20", "18");
				if (FF.Created) {
					if (Model.Properties && Model.Properties[KDCurrentLayer])
						ElementValue("KDPropField" + field, Model.Properties[KDCurrentLayer][field]);
					else
						ElementValue("KDPropField" + field, "" + deff);
					FF.Element.oninput = (_event: any) => {
						let value = ElementValue("KDPropField" + field);
						try {
							let parsed: string | string[] | number = value;
							if (deff == "") {
								// Nothing!
								parsed = "";
							} else if (deff.includes(',')) {
								parsed = parsed.split(',').filter((str) => {
									return str != "";
								});
							} else parsed = parseFloat(value) || parseFloat(value + "0") || value;
							if (value) {
								KDChangeWardrobe(C);
								if (!Model.Properties) Model.Properties = {};
								if (!Model.Properties[KDCurrentLayer])
									Model.Properties[KDCurrentLayer] = Object.assign({}, KDProps);
								Model.Properties[KDCurrentLayer][field] = parsed;
								KDCurrentModels.get(C).Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
								lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
								ForceRefreshModels(C);
							}
						} catch (err) {
							console.log("Must be a float");
						}
					};
				}



				YY += 30;
			}
			YY = YYold + 400;
		}
		YY += 70;

	} else {
		let filters = (Model.Filters ? Model.Filters[KDCurrentLayer] : undefined) || KDColorSliders;

		DrawButtonKDEx("ResetCurrentLayer", (_bdata) => {
			if (Model.Filters && Model.Filters[KDCurrentLayer]) {
				KDChangeWardrobe(C);
				delete Model.Filters[KDCurrentLayer];
				KDCurrentModels.get(C).Models.set(Model.Name, Model);
			}
			// Set the rgb value to empty when color is reset
			ElementValue("KDSelectedColor", "");
			KDRefreshProps = true;
			lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
			ForceRefreshModels(C);
			return true;
		}, true, X + width/2 + 10, YY, width/2 - 10, 30, TextGet("KDResetLayer"), "#ffffff");



		if (!KDClipboardDisabled) {
			if (TestMode)
				DrawButtonKDEx("ExportAllLayers", (_bdata) => {
					if (Model.Filters) {
						navigator.clipboard.writeText(JSON.stringify(Model.Filters));
					}
					return true;
				}, true, X + width/2 + 10, YY - 40, width/2 - 10, 30, TextGet("KDExportAllLayers"), "#88ff88");

			DrawButtonKDEx("KDCopyLayer", (_bdata) => {
				navigator.clipboard.writeText(JSON.stringify(filters));
				return true;
			}, true, X, YY, width/2 - 10, 30, TextGet("KDCopyLayer"), "#ffffff");
			DrawButtonKDEx("KDPasteLayer", (_bdata) => {
				navigator.clipboard.readText()
					.then(text => {
						let parsed = JSON.parse(text);
						if (parsed?.red != undefined && parsed.green != undefined && parsed.blue != undefined) {
							console.log(Object.assign({}, parsed));
							KDChangeWardrobe(C);
							if (!Model.Filters) Model.Filters = {};
							Model.Filters[KDCurrentLayer] = Object.assign({}, parsed);
							KDCurrentModels.get(C).Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
						}
					});
				return true;
			}, true, X, YY - 40, width/2 - 10, 30, TextGet("KDPasteLayer"), "#ffffff");
		} else {
			let CF = KDTextField("KDCopyFilter", X, YY - 50, width, 30, undefined, undefined, "300");
			if (CF.Created) {
				CF.Element.oninput = (_event: any) => {
					let value = ElementValue("KDCopyFilter");
					try {
						let parsed = JSON.parse(value);
						if (value) {
							KDChangeWardrobe(C);
							if (!Model.Filters) Model.Filters = {};
							if (!Model.Filters[KDCurrentLayer])
								Model.Filters[KDCurrentLayer] = Object.assign({}, KDColorSliders);
							if (Model.Filters[KDCurrentLayer].alpha < 0.001) Model.Filters[KDCurrentLayer].alpha = 0.001;
							Model.Filters[KDCurrentLayer].red = parsed.red;
							Model.Filters[KDCurrentLayer].green = parsed.green;
							Model.Filters[KDCurrentLayer].blue = parsed.blue;
							Model.Filters[KDCurrentLayer].gamma = parsed.gamma;
							Model.Filters[KDCurrentLayer].brightness = parsed.brightness;
							Model.Filters[KDCurrentLayer].alpha = parsed.alpha;
							Model.Filters[KDCurrentLayer].contrast = parsed.contrast;
							Model.Filters[KDCurrentLayer].saturation = parsed.saturation;
							KDCurrentModels.get(C).Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
						}
					} catch (err) {
						console.log("Invalid filter");
					}

				};
			}
		}


		YY += 60;

		// get the visualbrightness from the color so that the visualbrightness value matches
		// the actual brightness value which should be shown on the slider.
		KDVisualBrightness = rgbToHsl(filters.red/5, filters.green/5, filters.blue/5)[2];

		if (KDToggles.SimpleColorPicker) {
			let force = false;
			for (let key of ["brightness", "contrast"]) {
				DrawTextFitKD(TextGet("KDColorSlider" + key) + ": " + (Math.round((key == "brightness" ? KDVisualBrightness : (0.2 * filters[key]))*100)/100), X + width/2, YY, width, "#ffffff", "#000000", 20);
				KinkyDungeonBar(X, YY - 15, width, 30, Math.min(100, (key == "brightness" ? KDVisualBrightness : (filters[key]/3))*100), KDColorSliderColor[key] || "#ffffff", "#000000");
				if ((mouseDown) && MouseIn(X, YY - 15, width, 30)) {
					MouseClicked = false;
					if (CommonTime() > lastFilterUpdate + FilterUpdateInterval) {
						lastFilterUpdate = CommonTime();
						KDChangeWardrobe(C);
						if (!Model.Filters) Model.Filters = {};
						if (!Model.Filters[KDCurrentLayer])
							Model.Filters[KDCurrentLayer] = Object.assign({}, KDColorSliders);
						if (key == 'brightness') {
							KDVisualBrightness = ((MouseX - X) / width);

							force = true;

						} else {
							Model.Filters[KDCurrentLayer][key] = ((MouseX - X) / width) * 3;
						}

						KDCurrentModels.get(C).Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
						let rr = Math.round(Model.Filters[KDCurrentLayer].red /5 * 255).toString(16);
						if (rr.length == 1) rr = '0' + rr;
						let gg = Math.round(Model.Filters[KDCurrentLayer].green /5 * 255).toString(16);
						if (gg.length == 1) gg = '0' + gg;
						let bb = Math.round(Model.Filters[KDCurrentLayer].blue /5 * 255).toString(16);
						if (bb.length == 1) bb = '0' + bb;
						ElementValue("KDSelectedColor", `#${
							rr}${
							gg}${
							bb}`);
						ElementValue("KDCopyFilter", JSON.stringify(Model.Filters[KDCurrentLayer]));
						lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
						ForceRefreshModels(C);
					}

				}
				YY += 50;
			}

			let radius = 150;
			if (ElementValue("KDSelectedColor") && Model?.Filters && Model.Filters[KDCurrentLayer]) {
				let hsl = rgbToHsl(
					Math.max(0, Math.min(1, Model.Filters[KDCurrentLayer].red/5 || 0)),
					Math.max(0, Math.min(1, Model.Filters[KDCurrentLayer].green/5 || 0)),
					Math.max(0, Math.min(1, Model.Filters[KDCurrentLayer].blue/5 || 0)),
				);
				let x = radius * hsl[1] * Math.cos(hsl[0] * 2*Math.PI);
				let y = radius * hsl[1] * Math.sin(hsl[0] * 2*Math.PI);


				if (ColorPickerFilterCode != (1 - hsl[2]) + "," + hsl[2]) {
					ColorPickerFilterCode = (1 - hsl[2]) + "," + hsl[2];
					ColorPickerFilter.destroy();
					let lumi =
						Math.min(1, 5 * hsl[2]);
					ColorPickerFilter = new PIXI.filters.AdjustmentFilter({
						brightness: 1,
						saturation: Math.max(0, Math.min(1, 1.5 - 1.5*hsl[2])),
						gamma: 1,
						alpha: 1,
						red: lumi,
						blue: lumi,
						green: lumi,
						contrast: 1,
					});
				}

				let value = ElementValue("KDSelectedColor");
				let RegExp = /^#[0-9A-Fa-f]{6}$/i;

				KDDraw(kdcanvas, kdpixisprites, "colorpickercolor", KinkyDungeonRootDirectory + "Color.png", X - 12 + x + radius, YY - 12 + y + radius, 23, 23, 0,
					{
						tint: RegExp.test(value) ?
							new PIXI.Color(ElementValue("KDSelectedColor")).toNumber() : 0xffffff,
					});
			} else {
				if (ColorPickerFilterCode) {
					ColorPickerFilterCode = "";
					ColorPickerFilter.destroy();
					ColorPickerFilter = new PIXI.filters.AdjustmentFilter({
						brightness: 1,
						saturation: 1,
						gamma: 1,
						alpha: 1,
						red: 1,
						blue: 1,
						green: 1,
						contrast: 1,
					});
				}
			}

			KDDraw(kdcanvas, kdpixisprites, "colorpicker",
				KinkyDungeonRootDirectory + "ColorPicker.png", X, YY, 300, 300,
				undefined, {
					filters: [ColorPickerFilter],
				});


			let dist = KDistEuclidean(MouseX - (X + radius), MouseY - (YY + radius));
			if ((mouseDown && dist * 0.8 < radius) || force) {
				let hue = Math.max(0, 0.5 + 0.5 * Math.min(1, Math.atan2(
					-MouseY + (YY + radius),
					-MouseX + (X + radius)) / Math.PI));
				let sat = Math.min(1, dist/radius);

				if (force) {
					let hsl = rgbToHsl(
						Math.max(0, Math.min(1, Model.Filters[KDCurrentLayer].red/5 || 0)),
						Math.max(0, Math.min(1, Model.Filters[KDCurrentLayer].green/5 || 0)),
						Math.max(0, Math.min(1, Model.Filters[KDCurrentLayer].blue/5 || 0)),
					);
					hue = hsl[0];
					sat = hsl[1];
				}

				let arr = hslToRgb(hue, sat, Math.max(0, Math.min(1, KDVisualBrightness)));
				let r = arr[0];
				let g = arr[1];
				let b = arr[2];

				MouseClicked = false;
				if (force || CommonTime() > lastFilterUpdate + FilterUpdateInterval) {
					lastFilterUpdate = CommonTime();
					KDChangeWardrobe(C);
					if (!Model.Filters) Model.Filters = {};
					if (!Model.Filters[KDCurrentLayer])
						Model.Filters[KDCurrentLayer] = Object.assign({}, KDColorSliders);
					Model.Filters[KDCurrentLayer].red = 5*r/255.0;
					Model.Filters[KDCurrentLayer].green = 5*g/255.0;
					Model.Filters[KDCurrentLayer].blue = 5*b/255.0;
					Model.Filters[KDCurrentLayer].brightness = 1;
					if (Model.Filters[KDCurrentLayer].saturation == 1 || !Model.Filters[KDCurrentLayer].saturation)
						Model.Filters[KDCurrentLayer].saturation = 0;
					KDCurrentModels.get(C).Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
					let rr = Math.round(Model.Filters[KDCurrentLayer].red/5 * 255).toString(16);
					if (rr.length == 1) rr = '0' + rr;
					let gg = Math.round(Model.Filters[KDCurrentLayer].green/5 * 255).toString(16);
					if (gg.length == 1) gg = '0' + gg;
					let bb = Math.round(Model.Filters[KDCurrentLayer].blue/5 * 255).toString(16);
					if (bb.length == 1) bb = '0' + bb;
					ElementValue("KDSelectedColor", `#${
						rr}${
						gg}${
						bb}`);
					ElementValue("KDCopyFilter", JSON.stringify(Model.Filters[KDCurrentLayer]));
					lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
					ForceRefreshModels(C);
				}
			}

			YY += 300;
		} else {
			for (let key of Object.keys(KDColorSliders)) {
				DrawTextFitKD(TextGet("KDColorSlider" + key) + ": " + (Math.round(filters[key]*100)/100), X + width/2, YY, width, "#ffffff", "#000000", 20);
				KinkyDungeonBar(X, YY - 15, width, 30, filters[key]/5*100, KDColorSliderColor[key] || "#ffffff", "#000000");
				if ((mouseDown) && MouseIn(X, YY - 15, width, 30)) {
					MouseClicked = false;
					if (CommonTime() > lastFilterUpdate + FilterUpdateInterval) {
						lastFilterUpdate = CommonTime();
						KDChangeWardrobe(C);
						if (!Model.Filters) Model.Filters = {};
						if (!Model.Filters[KDCurrentLayer])
							Model.Filters[KDCurrentLayer] = Object.assign({}, KDColorSliders);
						Model.Filters[KDCurrentLayer][key] = ((MouseX - X) / width) * 5;
						KDCurrentModels.get(C).Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
						let rr = Math.round(Model.Filters[KDCurrentLayer].red /5 * 255).toString(16);
						if (rr.length == 1) rr = '0' + rr;
						let gg = Math.round(Model.Filters[KDCurrentLayer].green /5 * 255).toString(16);
						if (gg.length == 1) gg = '0' + gg;
						let bb = Math.round(Model.Filters[KDCurrentLayer].blue /5 * 255).toString(16);
						if (bb.length == 1) bb = '0' + bb;
						ElementValue("KDSelectedColor", `#${
							rr}${
							gg}${
							bb}`);
						ElementValue("KDCopyFilter", JSON.stringify(Model.Filters[KDCurrentLayer]));
						lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
						ForceRefreshModels(C);
					}

				}
				YY += 50;
			}
		}



		YY += 70;
		DrawTextFitKD(TextGet("KDColorHex"),X + width/2, YY - 40, 300, "#ffffff", KDTextGray0, undefined, "center");
		let TF = KDTextField("KDSelectedColor", X - 10, YY - 20, width, 30);
		if (TF.Created) {
			TF.Element.oninput = (_event: any) => {
				let value = ElementValue("KDSelectedColor");
				let RegExp = /^#[0-9A-Fa-f]{6}$/i;

				if (RegExp.test(value)) {
					let hex = KDhexToRGB(value);
					if (hex) {
						let r = 5.0 * (parseInt(hex.r, 16) / 255.0);
						let g = 5.0 * (parseInt(hex.g, 16) / 255.0);
						let b = 5.0 * (parseInt(hex.b, 16) / 255.0);
						KDChangeWardrobe(C);
						if (!Model.Filters) Model.Filters = {};
						if (!Model.Filters[KDCurrentLayer])
							Model.Filters[KDCurrentLayer] = Object.assign({}, KDColorSliders);
						if (Model.Filters[KDCurrentLayer].alpha < 0.001) Model.Filters[KDCurrentLayer].alpha = 0.001;
						if (KDToggles.SimpleColorPicker) {
							Model.Filters[KDCurrentLayer].brightness = 1;
							if (Model.Filters[KDCurrentLayer].saturation == 1 || !Model.Filters[KDCurrentLayer].saturation)
								Model.Filters[KDCurrentLayer].saturation = 0;
						}
						Model.Filters[KDCurrentLayer].red = r;
						Model.Filters[KDCurrentLayer].green = g;
						Model.Filters[KDCurrentLayer].blue = b;
						KDCurrentModels.get(C).Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
					}
				}
			};
		}
	}



	DrawButtonKDEx("tab_ColorPickerSimple", (_b) => {
		KDToggles.SimpleColorPicker = true;
		KDPropsSlider = false;
		return true;
	}, true, X - 240, YY + 40, 190, 30, TextGet("KDColorPickerSimple"), "#ffffff", undefined, undefined, undefined,
	KDPropsSlider || !KDToggles.SimpleColorPicker, KDButtonColor);
	DrawButtonKDEx("tab_ColorPickerAdvanced", (_b) => {
		KDToggles.SimpleColorPicker = false;
		KDPropsSlider = false;
		return true;
	}, true, X - 240 + 200, YY + 40, 190, 30, TextGet("KDColorPickerAdvanced"), "#ffffff", undefined, undefined, undefined,
	KDPropsSlider || KDToggles.SimpleColorPicker, KDButtonColor);
	DrawButtonKDEx("tab_ColorPickerProperties", (_b) => {
		KDPropsSlider = true;
		return true;
	}, true, X - 240 + 400, YY + 40, 190, 30, TextGet("KDColorPickerProperties"), "#ffffff", undefined, undefined, undefined,
	!KDPropsSlider, KDButtonColor);


	YY += 60;
	YY = Y + 35;

	let ii = 0;
	let buttonSpacing = 30;
	while (YY < 590) {
		if (ii >= KDLayerIndex) {
			let l = layers[ii];
			DrawButtonKDExScroll("SelectLayer" + YY,
				(amount) => {
					KDLayerIndex += Math.min(5, Math.abs(amount)/35) * Math.sign(amount);
					KDLayerIndex = Math.min(KDLayerIndex, layers.length - 10);
					KDLayerIndex = Math.max(0, KDLayerIndex);
				},
				(_bdata) => {
					if (l) {
						KDCurrentLayer = l;
					}
					KDRefreshProps = true;
					return true;
				}, true, X - 220, YY, 200, buttonSpacing - 1, l ? TextGet(`l_${Model.Name}_${l}`) : "",
				"#ffffff", undefined, undefined, undefined, KDCurrentLayer != l, KDButtonColor);
			YY += buttonSpacing;
		}
		ii += 1;
	}
	DrawButtonKDEx("SelectLayer_V", (_bdata) => {
		KDLayerIndex += 5;
		KDLayerIndex = Math.min(KDLayerIndex, layers.length - 10);
		KDLayerIndex = Math.max(0, KDLayerIndex);
		return true;
	}, true, X-220, 620, 200, buttonSpacing - 1,
	"",
	KDModelList_Toplevel_viewindex.index + KDModelListMax < KDModelList_Toplevel_viewindex.index ? "#ffffff" : "#888888", KinkyDungeonRootDirectory + "Down.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});

	DrawButtonKDEx("SelectLayer_^", (_bdata) => {
		KDLayerIndex -= 5;
		KDLayerIndex = Math.min(KDLayerIndex, layers.length - 10);
		KDLayerIndex = Math.max(0, KDLayerIndex);
		return true;
	}, true, X-220, 100, 200, buttonSpacing - 1,
	"",
	KDModelList_Toplevel_viewindex.index > 0 ? "#ffffff" : "#888888", KinkyDungeonRootDirectory + "Up.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});

	if (KDLayerIndex > layers.length - 10) KDLayerIndex = Math.max(0, layers.length - 10);
}

let KDLayerIndex = 0;

function KDDrawPoseButtons(C: Character, X: number = 960, Y: number = 750, allowRemove: boolean = false, dress: boolean = false, updateDesired: boolean = false) {
	if (!KDNPCPoses.get(C)) KDNPCPoses.set(C, {});
	let buttonClick = (arms: string, legs: string, eyes: string, eyes2?: string, brows?: string, brows2?: string, blush?: string, mouth?: string, update: boolean = true) => {
		return (_bdata: any) => {
			if (allowRemove && arms == KDNPCPoses.get(C).CurrentPoseArms) KDNPCPoses.get(C).CurrentPoseArms = "";
			else KDNPCPoses.get(C).CurrentPoseArms = arms || KDNPCPoses.get(C).CurrentPoseArms;
			if (allowRemove && legs == KDNPCPoses.get(C).CurrentPoseLegs) KDNPCPoses.get(C).CurrentPoseLegs = "";
			else KDNPCPoses.get(C).CurrentPoseLegs = legs || KDNPCPoses.get(C).CurrentPoseLegs;


			if (allowRemove && eyes == KDNPCPoses.get(C).CurrentPoseEyes) KDNPCPoses.get(C).CurrentPoseEyes = "";
			else KDNPCPoses.get(C).CurrentPoseEyes = eyes || KDNPCPoses.get(C).CurrentPoseEyes;
			if (allowRemove && eyes2 == KDNPCPoses.get(C).CurrentPoseEyes2) KDNPCPoses.get(C).CurrentPoseEyes2 = "";
			else KDNPCPoses.get(C).CurrentPoseEyes2 = eyes2 || KDNPCPoses.get(C).CurrentPoseEyes2;
			if (allowRemove && brows == KDNPCPoses.get(C).CurrentPoseBrows) KDNPCPoses.get(C).CurrentPoseBrows = "";
			else KDNPCPoses.get(C).CurrentPoseBrows = brows || KDNPCPoses.get(C).CurrentPoseBrows;
			if (allowRemove && brows2 == KDNPCPoses.get(C).CurrentPoseBrows2) KDNPCPoses.get(C).CurrentPoseBrows2 = "";
			else KDNPCPoses.get(C).CurrentPoseBrows2 = brows2 || KDNPCPoses.get(C).CurrentPoseBrows2;
			if (allowRemove && blush == KDNPCPoses.get(C).CurrentPoseBlush) KDNPCPoses.get(C).CurrentPoseBlush = "";
			else KDNPCPoses.get(C).CurrentPoseBlush = blush || KDNPCPoses.get(C).CurrentPoseBlush;
			if (allowRemove && mouth == KDNPCPoses.get(C).CurrentPoseMouth) KDNPCPoses.get(C).CurrentPoseMouth = "";
			else KDNPCPoses.get(C).CurrentPoseMouth = mouth || KDNPCPoses.get(C).CurrentPoseMouth;

			if (updateDesired) {
				NPCDesiredPoses.set(C, {
					Arms: KDNPCPoses.get(C).CurrentPoseArms,
					Legs: KDNPCPoses.get(C).CurrentPoseLegs,
					Eyes: KDNPCPoses.get(C).CurrentPoseEyes,
					Brows: KDNPCPoses.get(C).CurrentPoseBrows,
					Blush: KDNPCPoses.get(C).CurrentPoseBlush,
					Mouth: KDNPCPoses.get(C).CurrentPoseMouth,
				});
			}

			if (update) {
				KDCurrentModels.get(C).Poses = KDGeneratePoseArray(
					KDNPCPoses.get(C).CurrentPoseArms,
					KDNPCPoses.get(C).CurrentPoseLegs,
					KDNPCPoses.get(C).CurrentPoseEyes,
					KDNPCPoses.get(C).CurrentPoseBrows,
					KDNPCPoses.get(C).CurrentPoseBlush,
					KDNPCPoses.get(C).CurrentPoseMouth,
					KDNPCPoses.get(C).CurrentPoseEyes2,
					KDNPCPoses.get(C).CurrentPoseBrows2,
					//KDGetPoseOfType(C, "Eyes"),
					//KDGetPoseOfType(C, "Brows"),
					//KDGetPoseOfType(C, "Blush"),
					//KDGetPoseOfType(C, "Mouth"),
				);
				KDUpdateTempPoses(C);
				UpdateModels(C);
			}
			if (dress) {

				KDRefreshCharacter.set(C, true);
				KinkyDungeonDressPlayer(C);
			}

			return true;
		};
	};

	let AvailableArms = KDGetAvailablePosesArms(C);
	let AvailableLegs = KDGetAvailablePosesLegs(C);

	let buttonWidth = 52;
	let buttonSpacing = 55;
	let xoff = KDWardrobe_PoseLegs.length % 2 != KDWardrobe_PoseArms.length % 2 ? buttonWidth/2 : 0;
	for (let i = 0; i < KDWardrobe_PoseArms.length; i++) {
		DrawButtonKDEx("PoseArms" + i,
			buttonClick(KDWardrobe_PoseArms[i], "", "", "", "", "", "", "", AvailableArms.includes(KDWardrobe_PoseArms[i])),
			true,
			X + i*buttonSpacing, Y + 120, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseArms[i] + ".png",
			undefined, false, KDNPCPoses.get(C).CurrentPoseArms != KDWardrobe_PoseArms[i], !AvailableArms.includes(KDWardrobe_PoseArms[i]) ? "#ff5555" : KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseLegs.length; i++) {
		DrawButtonKDEx("PoseLegs" + i,
			buttonClick("", KDWardrobe_PoseLegs[i], "", "", "", "", "", "", AvailableLegs.includes(KDWardrobe_PoseLegs[i])),
			true,
			X + xoff + i*buttonSpacing, Y + 180, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseLegs[i] + ".png",
			undefined, false, KDNPCPoses.get(C).CurrentPoseLegs != KDWardrobe_PoseLegs[i], !AvailableLegs.includes(KDWardrobe_PoseLegs[i]) ? "#ff5555" : KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseEyes.length; i++) {
		DrawButtonKDEx("PoseEyes" + i, buttonClick("", "", KDWardrobe_PoseEyes[i]), true, X + i*buttonSpacing, Y, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseEyes[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseEyes != KDWardrobe_PoseEyes[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseEyes.length; i++) {
		DrawButtonKDEx("PoseEyes2" + i, buttonClick("", "", "", KDWardrobe_PoseEyes2[i]), true, X + i*buttonSpacing, Y + 60, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseEyes2[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseEyes2 != KDWardrobe_PoseEyes2[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseBrows.length; i++) {
		DrawButtonKDEx("PoseBrows" + i, buttonClick("", "", "", "", KDWardrobe_PoseBrows[i]), true, X + 400 + i*buttonSpacing, Y, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseBrows[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseBrows != KDWardrobe_PoseBrows[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseBrows2.length; i++) {
		DrawButtonKDEx("PoseBrows2" + i, buttonClick("", "", "", "", "", KDWardrobe_PoseBrows2[i]), true, X + 400 + i*buttonSpacing, Y + 60, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseBrows2[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseBrows2 != KDWardrobe_PoseBrows2[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseBlush.length; i++) {
		DrawButtonKDEx("PoseBlush" + i, buttonClick("", "", "", "", "", "", KDWardrobe_PoseBlush[i]), true, X + 400 + i*buttonSpacing, Y + 120, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseBlush[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseBlush != KDWardrobe_PoseBlush[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseMouth.length; i++) {
		DrawButtonKDEx("PoseMouth" + i, buttonClick("", "", "", "", "", "", "", KDWardrobe_PoseMouth[i]), true, X + 400 + i*buttonSpacing, Y + 180, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseMouth[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseMouth != KDWardrobe_PoseMouth[i], KDButtonColor);
	}
}

/**
 * Updates the mopel list, only altering a level if the specified altered level is that low
 * @param level
 */
function KDUpdateModelList(level: number = 0): void {
	if (level <= 0) {
		KDModelList_Categories = [];
		KDModelList_Categories_index = 0;
		KDModelList_Categories_viewindex.index = 0;
		for (let cat of KDWardrobeCategories) {
			KDModelList_Categories.push(cat);
		}
	}
	let category = KDModelList_Categories[KDModelList_Categories_index];

	if (level <= 1 && category) {
		KDModelList_Toplevel = [];
		KDModelList_Toplevel_index = 0;
		KDModelList_Toplevel_viewindex.index = 0;
		for (let model of Object.entries(ModelDefs)) {
			if (model[1].TopLevel && (KDModelListFilter || model[1].Categories?.includes(category)) && (TestMode || !model[1].Restraint)) {
				if (!KDModelListFilter || TextGet(model[0]).toLowerCase().includes(KDModelListFilter.toLowerCase()))
					KDModelList_Toplevel.push(model[0]);
			}
		}

	}
	let toplevel = KDModelList_Toplevel[KDModelList_Toplevel_index];

	if (level <= 2) {
		KDModelList_Sublevel = [];
		KDModelList_Sublevel_index = 0;
		KDModelList_Sublevel_viewindex.index = 0;
		if (toplevel) {
			// Put these at the top of the list
			for (let model of Object.entries(ModelDefs)) {
				if (model[1].Parent != toplevel && model[0] == toplevel && (TestMode || !model[1].Restraint)) {
					if (!KDModelListFilter || TextGet(model[1].Parent).toLowerCase().includes(KDModelListFilter.toLowerCase()))
						KDModelList_Sublevel.push(model[0]);
				}
			}
			for (let model of Object.entries(ModelDefs)) {
				if ((model[1].Parent == toplevel || KDModelListFilter) && (TestMode || !model[1].Restraint)) {
					if (!KDModelListFilter || TextGet(model[1].Name).toLowerCase().includes(KDModelListFilter.toLowerCase()))
						KDModelList_Sublevel.push(model[0]);
				}
			}
		}


	}
}

/** Call BEFORE making any changes */
function KDChangeWardrobe(C: Character) {
	if (C == KinkyDungeonPlayer)
		try {
			if (!KDOriginalValue)
				KDOriginalValue = AppearanceItemStringify(C.Appearance);
		} catch (e) {
			// Fail
		}
	UpdateModels(C);
}

/**
 * @param X
 * @param C
 */
function KDDrawModelList(X: number, C: Character) {


	let clickCategory = (en: any, index: number) => {
		return (_bdata: any) => {
			if (!en) return false;
			KDModelList_Categories_index = index;
			if (KDModelListFilter) {
				KDModelListFilter = "";
				KDUpdateModelList(0);
				KDUpdateModelList(2);
			}
			KDUpdateModelList(1);
			return true;
		};
	};
	let clickToplevel = (en: any, index: number) => {
		return (_bdata: any) => {
			if (!en) return false;
			KDModelList_Toplevel_index = index;
			if (KDModelListFilter) {
				KDModelListFilter = "";
				KDUpdateModelList(0);
				KDUpdateModelList(1);
			}
			KDUpdateModelList(2);
			let name = KDModelList_Sublevel[KDModelList_Sublevel_index] || "";
			if (name) {
				KDCurrentLayer = Object.keys(ModelDefs[name]?.Layers || {})[0] || "";
			} else KDCurrentLayer = "";
			KDRefreshProps = true;
			return true;
		};
	};
	let clickSublevel = (en: any, index: number, name: string) => {
		return (_bdata: any) => {
			if (!en) return false;

			let removed = false;
			for (let appIndex = 0; appIndex < C.Appearance.length; appIndex++) {
				if (C.Appearance[appIndex]?.Model?.Name == name) {
					if (KDModelList_Sublevel_index == index) {
						KDChangeWardrobe(C);
						C.Appearance.splice(appIndex, 1);
						UpdateModels(C);
					}
					removed = true;
					break;
				}
			}
			if (!removed) {
				let M = ModelDefs[name];
				if (M) {
					KDChangeWardrobe(C);
					KDAddModel(C, M.Group || M.Name, M, "Default", undefined);
					UpdateModels(C);
				}


			}


			KDModelList_Sublevel_index = index;
			KDCurrentLayer = Object.keys(ModelDefs[name]?.Layers || {})[0] || "";
			KDRefreshProps = true;
			KDUpdateModelList(3);
			return true;
		};
	};

	let buttonHeight = 38;
	let buttonSpacing = 40;

	DrawTextFitKD(TextGet("KDItemMenu"), X + 10, 25, 220, "#ffffff", KDTextGray0, undefined, "left");
	DrawBoxKD(X - 5, 5, 650, 700, KDButtonColor, false, 0.5, -10);

	let MF = KDTextField("KDModelListFilter", X+220, 10, 400, buttonHeight, undefined, undefined, "30");
	if (MF.Created) {
		MF.Element.oninput = (_event: any) => {
			KDModelListFilter = ElementValue("KDModelListFilter");

			//KDUpdateModelList(1);
			KDUpdateModelList(2);
			KDUpdateModelList(3);
		};
	}


	let hasCategories = {};
	let hasTopLevel = {};
	let models = KDCurrentModels.get(C).Models.values();
	for (let m of models) {
		if (m.Categories) {
			for (let cat of m.Categories) {
				hasCategories[cat] = true;
			}
		}
		if (m.Parent) {
			hasTopLevel[m.Parent] = true;
		}
	}

	let faded = "#888888";
	KDSelectedModel = null;
	// Draw each row
	for (let i = 0; i < KDModelListMax; i++) {

		let index_cat = i + KDModelList_Categories_viewindex.index;
		let category = KDModelList_Categories[index_cat];
		//if (category)
		DrawButtonKDExScroll("ClickCategory" + i, (amount) => {KDModelList_Categories_viewindex.index += Math.min(5, Math.abs(amount)/buttonHeight) * Math.sign(amount); cullIndex();},
			clickCategory(category, index_cat), true, X+0, 100 + buttonSpacing * i, 190, buttonHeight,
			!category ? "" : TextGet("cat_" + category),
			hasCategories[category] ? "#ffffff" : faded, "",
			undefined, undefined, index_cat != KDModelList_Categories_index, KDButtonColor);


		let index_top = i + KDModelList_Toplevel_viewindex.index;
		let toplevel = KDModelList_Toplevel[index_top];
		//if (toplevel)
		DrawButtonKDExScroll("ClickToplevel" + i, (amount) => {KDModelList_Toplevel_viewindex.index += Math.min(5, Math.abs(amount)/buttonHeight) * Math.sign(amount); cullIndex();},
			clickToplevel(toplevel, index_top), true, X+220, 100 + buttonSpacing * i, 190, buttonHeight,
			!toplevel ? "" : TextGet("m_" + toplevel),
			(KDCurrentModels.get(C).Models.has(toplevel) || hasTopLevel[toplevel]) ? "#ffffff" : faded, "",
			undefined, undefined, index_top != KDModelList_Toplevel_index, KDButtonColor);



		let index_sub = i + KDModelList_Sublevel_viewindex.index;
		let sublevel = KDModelList_Sublevel[index_sub];
		//if (sublevel) {
		DrawButtonKDExScroll("ClickSublevel" + i, (amount) => {KDModelList_Sublevel_viewindex.index += Math.min(5, Math.abs(amount)/buttonHeight) * Math.sign(amount); cullIndex();},
			clickSublevel(sublevel, index_sub, sublevel), true, X+440, 100 + buttonSpacing * i, 190, buttonHeight,
			!sublevel ? "" : TextGet("m_" + sublevel),
			KDCurrentModels.get(C).Models.has(sublevel) ? "#ffffff" : faded, "",
			undefined, undefined, index_sub != KDModelList_Sublevel_index, KDButtonColor);
		if (sublevel) {
			if (index_sub == KDModelList_Sublevel_index && KDCurrentModels.get(C).Models.has(sublevel)) {
				KDSelectedModel = C.Appearance.find((value) => {
					return value.Model.Name == sublevel;
				})?.Model;
			}
		}

		// KDCurrentModels.get(KinkyDungeonPlayer).Models.has(model) ? "#ffffff" : "#888888", "");
	}

	let cullIndex = () => {
		KDModelList_Toplevel_viewindex.index = Math.round(Math.max(0, Math.min(KDModelList_Toplevel.length - 5, KDModelList_Toplevel_viewindex.index)));
		KDModelList_Sublevel_viewindex.index = Math.round(Math.max(0, Math.min(KDModelList_Sublevel.length - 5, KDModelList_Sublevel_viewindex.index)));
		KDModelList_Categories_viewindex.index = Math.round(Math.max(0, Math.min(KDModelList_Categories.length - 5, KDModelList_Categories_viewindex.index)));
	};

	DrawButtonKDEx("KDModelList_Toplevel_V", (_bdata) => {
		KDModelList_Toplevel_viewindex.index += 5;
		cullIndex();
		return true;
	}, true, X+220, 100 + buttonSpacing * KDModelListMax, 200, buttonHeight,
	"",
	KDModelList_Toplevel_viewindex.index + KDModelListMax < KDModelList_Toplevel_viewindex.index ? "#ffffff" : "#888888", KinkyDungeonRootDirectory + "Down.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});

	DrawButtonKDEx("KDModelList_Toplevel_^", (_bdata) => {
		KDModelList_Toplevel_viewindex.index -= 5;
		cullIndex();
		return true;
	}, true, X+220, 100 + buttonSpacing * -1, 200, buttonHeight,
	"",
	KDModelList_Toplevel_viewindex.index > 0 ? "#ffffff" : "#888888", KinkyDungeonRootDirectory + "Up.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});

	DrawButtonKDEx("KDModelList_Sublevel_V", (_bdata) => {
		KDModelList_Sublevel_viewindex.index += 5;
		cullIndex();
		return true;
	}, true, X+440, 100 + buttonSpacing * KDModelListMax, 200, buttonHeight,
	"",
	KDModelList_Sublevel_viewindex.index + KDModelListMax < KDModelList_Sublevel_viewindex.index ? "#ffffff" : "#888888", KinkyDungeonRootDirectory + "Down.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});
	DrawButtonKDEx("KDModelList_Sublevel_^", (_bdata) => {
		KDModelList_Sublevel_viewindex.index -= 5;
		cullIndex();
		return true;
	}, true, X+440, 100 + buttonSpacing * -1, 200, buttonHeight,
	"",
	KDModelList_Sublevel_viewindex.index > 0 ? "#ffffff" : "#888888", KinkyDungeonRootDirectory + "Up.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});



	DrawButtonKDEx("KDModelList_Categories_V", (_bdata) => {
		KDModelList_Categories_viewindex.index += 5;
		cullIndex();
		return true;
	}, true, X+0, 100 + buttonSpacing * KDModelListMax, 200, buttonHeight,
	"",
	(KDModelList_Categories_viewindex.index + KDModelListMax < KDModelList_Categories_viewindex.index) ? "#ffffff" : "#888888", KinkyDungeonRootDirectory + "Down.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});
	DrawButtonKDEx("KDModelList_Categories_^", (_bdata) => {
		KDModelList_Categories_viewindex.index -= 5;
		cullIndex();
		return true;
	}, true, X+0, 100 + buttonSpacing * -1, 200, buttonHeight,
	"",
	KDModelList_Categories_viewindex.index > 0 ? "#ffffff" : "#888888", KinkyDungeonRootDirectory + "Up.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});


	cullIndex();

}

function KDCanForcePose(C: Character): boolean {
	return C != KinkyDungeonPlayer;
}

function KDDrawWardrobe(_screen: string, Character: Character) {
	if (KDOutfitInfo.length == 0) KDRefreshOutfitInfo();

	let C = Character || KinkyDungeonPlayer;
	if (KDBGColor) {
		FillRectKD(kdcanvas, kdpixisprites, "playerbg", {
			Left: 0,
			Top: 0,
			Width: 500,
			Height: 1000,
			Color: KDBGColor,
			zIndex: -1,
			alpha: StandalonePatched ? KDUIAlpha : 0.01,
		});
	}
	DrawCharacter(C, 0, 0, 1, undefined, undefined, undefined, undefined, undefined, C == KinkyDungeonPlayer ? KDToggles.FlipPlayer : false);

	KDTextField("KDOutfitName", 25, 5, 450, 30);
	if (!ElementValue("KDOutfitName")) {
		ElementValue("KDOutfitName", KDOutfitInfo[KDCurrentOutfit]);
	}
	if (KDShowCharacterPalette) {
		KDDrawPalettes(1300, 250, KDPaletteWidth, 72, C.Palette || "", (pal) => {
			C.Palette = pal;

		}, "KDSetCharacterPalette");
	} else {
		KDDrawModelList(720, C);
	}

	DrawBoxKD(1025, 710, 950, 285, KDButtonColor, false, 0.5, -10);
	if (KDPlayerSetPose) {
		KDDrawPoseButtons(C, 1050, undefined, undefined, undefined, KDCanForcePose(C));
	} else {
		DrawTextFitKD(TextGet("KDQuickColor"), 1050, 735, 250, "#ffffff", KDTextGray0, undefined, "left");
		KDDrawSavedColors(1060, 760, KDSavedColorCount, C);
	}
	DrawButtonKDEx("SetPose", (_bdata) => {
		KinkyDungeonTargetTile = null;
		KinkyDungeonTargetTileLocation = "";
		KDPlayerSetPose = !KDPlayerSetPose;
		KDModalArea = false;
		return true;
	}, true, 715, 765, 240, 50, TextGet("KDChangePose"), "#ffffff",
	KinkyDungeonRootDirectory + "Poses/SetPose.png", "", false, false,
		KDPlayerSetPose ? KDTextGray3 : KDButtonColor, undefined, true);


	DrawButtonKDEx("ToggleXray", (_bdata) => {
		KDToggleXRay += 1;
		if (KDToggleXRay > (StandalonePatched ? 2 : 1)) KDToggleXRay = 0;

		KDRefreshCharacter.set(KinkyDungeonPlayer, true);
		KinkyDungeonDressPlayer(KinkyDungeonPlayer, false, true);
		return true;
	}, true, 715, 820, 240, 50, TextGet("KDXRay"), "#ffffff",
	KinkyDungeonRootDirectory + "UI/XRay" + KDToggleXRay + ".png", "", false, false,
		KDToggleXRay ? KDTextGray3 : KDButtonColor, undefined, true);



	let palette = C.Palette;
	let o = {
	};

	if (palette && KinkyDungeonFactionFilters[palette]) {
		o['filters'] = [
			new PIXI.filters.AdjustmentFilter(KinkyDungeonFactionFilters[palette].Highlight),
		];
	}


	DrawButtonKDEx("SetPalette", (_bdata) => {
		KDShowCharacterPalette = !KDShowCharacterPalette;
		return true;
	}, true, 715, 875, 240, 50, TextGet("KDSetPalette"), "#ffffff",
	KinkyDungeonRootDirectory + "UI/SetPalette.png", "", false, false,
	undefined, undefined, true, o);


	DrawButtonKDEx("BackupOutfit", (_bdata) => {
		downloadFile((ElementValue("savename") || KDOutfitInfo[KDCurrentOutfit] || "Outfit") + KDOUTFITBACKUP,
			LZString.compressToBase64(CharacterAppearanceStringify(C || KinkyDungeonPlayer,
				KDGetCharMetadata(C || KinkyDungeonPlayer)
			)));
		return true;
	}, true, 715, 930, 115, 50, TextGet("KDBackupOutfits"), "#ffffff",
	KinkyDungeonRootDirectory + "UI/Safe.png", "", false, false,
	undefined, undefined, true);

	DrawButtonKDEx("RestoreOutfit", (_bdata) => {
		getFileInput(KDLoadOutfitDirect, C);
		return true;
	}, true, 835, 930, 115, 50, TextGet("KDLoadOutfits"), "#ffffff",
	KinkyDungeonRootDirectory + "UI/Restore.png", "", false, false,
	undefined, undefined, true);

	if (KDShowCharacterPalette) {
		// nyet
	} else {
		if (KDSelectedModel) {
			KDDrawColorSliders(1625, 100, C, KDSelectedModel);
		} else {
			KDCurrentLayer = "";
			KDRefreshProps = true;
		}
	}

	// Return anon function anonymously
	let clickButton = (index: number) => {
		return (_bdata: any) => {
			if (C == KinkyDungeonPlayer) {
				KDOutfitStore[KDCurrentOutfit] = LZString.compressToBase64(CharacterAppearanceStringify(C || KinkyDungeonPlayer,
					KDGetCharMetadata(C || KinkyDungeonPlayer)
				));
				KDOutfitOriginalStore[KDCurrentOutfit] = KDOriginalValue;
				ElementValue("KDOutfitName", "");
			}
			KDCurrentOutfit = index;
			if (C == KinkyDungeonPlayer)
				localStorage.setItem("kdcurrentoutfit", KDCurrentOutfit + "");

			let NewOutfit = KDOutfitStore[KDCurrentOutfit] || localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit);

			if (NewOutfit) {
				KDOriginalValue = KDOutfitOriginalStore[KDCurrentOutfit] || "";
				KinkyDungeonSetDress("None", "None", C, true);
				KDRefreshCharacter.set(C, true);
				KinkyDungeonDressPlayer(C, true);
				let newOut = DecompressB64(NewOutfit);
				CharacterAppearanceRestore(C, newOut, C != KinkyDungeonPlayer, true);
				let newParsed = JSON.parse(newOut);
				if (newParsed?.metadata) {
					C.Palette = newParsed.metadata.palette;
				} else C.Palette = "";
				CharacterRefresh(C);
				KDInitProtectedGroups(C);
				KDRefreshCharacter.set(C, true);
				KinkyDungeonDressPlayer(C, true);
			} else if (C == KinkyDungeonPlayer) {
				KDGetDressList().Default = KinkyDungeonDefaultDefaultDress;
				CharacterAppearanceRestore(KinkyDungeonPlayer,
					CharacterAppearanceStringify(DefaultPlayer,
						KDGetCharMetadata(DefaultPlayer)
					), false, true);
				CharacterReleaseTotal(KinkyDungeonPlayer);
				KinkyDungeonSetDress("Default", "Default", C, true);
				C.Palette = "";
				KDRefreshCharacter.set(C, true);
				KinkyDungeonDressPlayer();
				KDInitProtectedGroups(KinkyDungeonPlayer);
			}
			return true;
		};
	};

	DrawTextFitKD(TextGet("KDLabelSaved"), 575, 75, 220, "#ffffff", KDTextGray0);


	DrawButtonKDEx("KDOutfitSaved_V", (_bdata) => {
		KDMaxOutfitsIndex += 3;
		if (KDMaxOutfitsIndex > KDMaxOutfits-9) KDMaxOutfitsIndex = Math.floor(KDMaxOutfits-9);
		return true;
	}, true, 475, 110 + 50 * (1 + KDMaxOutfitsDisplay), 200, 45,
	"",
	KDModelList_Toplevel_viewindex.index + KDModelListMax < KDModelList_Toplevel_viewindex.index ? "#ffffff" : "#888888", KinkyDungeonRootDirectory + "Down.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});

	DrawButtonKDEx("KDOutfitSaved_^^", (_bdata) => {
		KDMaxOutfitsIndex -= 3;
		if (KDMaxOutfitsIndex < 0) KDMaxOutfitsIndex = 0;
		return true;
	}, true, 475, 90, 200, 45,
	"",
	KDModelList_Toplevel_viewindex.index > 0 ? "#ffffff" : "#888888", KinkyDungeonRootDirectory + "Up.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});

	for (let i = 0; i < KDOutfitInfo.length && i < KDMaxOutfitsDisplay; i++) {
		let index = i + KDMaxOutfitsIndex;

		if (KDOutfitInfo[index])
			DrawButtonKDExScroll("ClickOutfit" + i, (amount) => {
				if (amount > 0) {
					KDMaxOutfitsIndex += 3;
					if (KDMaxOutfitsIndex > KDMaxOutfits-9) KDMaxOutfitsIndex = Math.floor(KDMaxOutfits-9);
				} else if (amount < 0) {
					KDMaxOutfitsIndex -= 3;
					if (KDMaxOutfitsIndex < 0) KDMaxOutfitsIndex = 0;
				}
			},
			clickButton(index), true, 475, 140 + 50 * i, 200, 45,
			KDOutfitInfo[index] + (((index == KDCurrentOutfit && KDOriginalValue) || KDOutfitOriginalStore[index]) ? "(*)" : ""),
				index == KDCurrentOutfit ? "#ffffff" : "#888888", "", undefined, undefined, index != KDCurrentOutfit);

	}
	DrawBoxKD(450, 55, 250, 56 + (2+KDMaxOutfitsDisplay) * 50, KDButtonColor,
		false, 0.5, -10);


	DrawTextFitKD(TextGet("KDManageOutfits"), 445 + 520/2, 740, 260, "#ffffff", KDTextGray0);
	DrawBoxKD(450, 710, 520, 285, KDButtonColor, false, 0.5, -10);



	DrawButtonKDEx("StripOutfit", (_bdata) => {
		if (KDConfirmType == "strip" && KinkyDungeonReplaceConfirm > 0) {
			KDChangeWardrobe(C);
			CharacterReleaseTotal(C);
			CharacterNaked(C);
			KDRefreshCharacter.set(C, true);
			if (KDCharacterDress.get(C) != "Bikini") {
				KinkyDungeonSetDress("Bikini", "Bikini", C, true);
			} else
				KinkyDungeonSetDress("None", "None", C, true);
			KinkyDungeonDressPlayer(C, true);
			if (C == KinkyDungeonPlayer) {
				KDInitProtectedGroups(C);
				KinkyDungeonConfigAppearance = true;
			}

			KinkyDungeonReplaceConfirm = 0;
			return true;
		} else {
			KDConfirmType = "strip";
			KinkyDungeonReplaceConfirm = 2;
			return true;
		}
	}, true, 465, 765, 240, 50,
	TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'strip') ?
			"KDConfirmStrip" :
			"KDDressStrip"),
	"#ffffff", KinkyDungeonRootDirectory + "UI/X.png", undefined, undefined, undefined,
	undefined, undefined, true);
	DrawButtonKDEx("LoadFromCode", (_bdata) => {
		KinkyDungeonState = "LoadOutfit";


		CharacterReleaseTotal(C || KinkyDungeonPlayer);
		ElementCreateTextArea("saveInputField");
		ElementValue("saveInputField", LZString.compressToBase64(
			AppearanceItemStringify((C || KinkyDungeonPlayer).Appearance)
		));
		return true;
	}, true,465, 875, 240, 50, TextGet("KinkyDungeonDressPlayerImport"),
	"#ffffff", KinkyDungeonRootDirectory + "UI/Load.png", undefined, undefined, undefined,
	undefined, undefined, true);

	DrawButtonKDEx("KDWardrobeCancel", (_bdata) => {
		if (KDConfirmType == "revert" && KinkyDungeonReplaceConfirm > 0) {
			KinkyDungeonReplaceConfirm = 0;

			if (KDWardrobeRevertCallback) KDWardrobeRevertCallback();
			else
				KDRestoreOutfit();
			KDOriginalValue = "";
			return true;
		} else {
			KDConfirmType = "revert";
			KinkyDungeonReplaceConfirm = 2;
			return true;
		}
	}, true, 465, 820, 240, 50,
	TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'revert') ?
		"KDWardrobeCancelConfirm" :
		"KDWardrobeCancel"), ((C == KinkyDungeonPlayer && KDOriginalValue) || (KDCanRevertFlag)) ? "#ffffff" : "#888888",
		KinkyDungeonRootDirectory + "UI/Revert.png", undefined, undefined, undefined,
		undefined, undefined, true);
	if (C == KinkyDungeonPlayer) {
		DrawButtonKDEx("KDWardrobeSaveOutfit", (_bdata) => {
			if (KDConfirmType == "save" && KinkyDungeonReplaceConfirm > 0) {
				if (ElementValue("KDOutfitName").length < 50) {
					KDOutfitInfo[KDCurrentOutfit] = ElementValue("KDOutfitName");
					KDSaveOutfitInfo();
				}
				KinkyDungeonReplaceConfirm = 0;
				localStorage.setItem("kinkydungeonappearance" + KDCurrentOutfit,
					LZString.compressToBase64(
						CharacterAppearanceStringify(C || KinkyDungeonPlayer,
							KDGetCharMetadata(C || KinkyDungeonPlayer)
						)
					));
				//localStorage.setItem("kdcurrentoutfit", KDCurrentOutfit + "");
				KinkyDungeonDressSet();
				KDOriginalValue = "";
				KDRefreshOutfitInfo();
				return true;
			} else {
				KDConfirmType = "save";
				KinkyDungeonReplaceConfirm = 2;
				return true;
			}
		}, true, 465, 930, 240, 50,
		TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'save') ?
			"KDWardrobeSaveOutfitConfirm" :
			"KDWardrobeSaveOutfit"), KDOriginalValue ? "#ffffff" : "#888888",
			KinkyDungeonRootDirectory + "UI/Floppy.png", undefined, undefined, undefined,
			undefined, undefined, true);
	} else {
		DrawButtonKDEx("ResetOutfit", (_bdata) => {
			if (KDConfirmType == "reset" && KinkyDungeonReplaceConfirm > 0) {
				if (C == KinkyDungeonPlayer) {
					KDChangeWardrobe(C);
					KDGetDressList().Default = KinkyDungeonDefaultDefaultDress;
					CharacterAppearanceRestore(KinkyDungeonPlayer,
						CharacterAppearanceStringify(DefaultPlayer,
							KDGetCharMetadata(KinkyDungeonPlayer)
						), false, false
					);
					CharacterReleaseTotal(KinkyDungeonPlayer);
					KinkyDungeonSetDress("Default", "Default", C, true);
					KinkyDungeonDressPlayer();
					KDInitProtectedGroups(KinkyDungeonPlayer);
					UpdateModels(KinkyDungeonPlayer);
					KinkyDungeonConfigAppearance = true;
					KinkyDungeonReplaceConfirm = 0;
				} else if (C == KDSpeakerNPC) {
					let value = KDNPCStyle.get(KDSpeakerNPC);
					if (!value) return false;
					KDSpeakerNPC.Appearance = [];
					delete value.customOutfit;

					let enemyType = value.Enemy || KinkyDungeonGetEnemyByName(value.type);
					if (!value.bodystyle && !value.facestyle && !value.hairstyle) {
						if (enemyType?.style || KinkyDungeonGetEnemyByName(value.type)?.style) {
							if (KDModelStyles[enemyType?.style || KinkyDungeonGetEnemyByName(value.type)?.style]) {
								let style = KDModelStyles[enemyType?.style || KinkyDungeonGetEnemyByName(value.type)?.style];
								if (!value.bodystyle && style.Bodystyle) {
									value.bodystyle = style.Bodystyle[Math.floor(Math.random() * style.Bodystyle.length)];
								}
								if (!value.hairstyle && style.Hairstyle) {
									value.hairstyle = style.Hairstyle[Math.floor(Math.random() * style.Hairstyle.length)];
								}
								if (!value.facestyle && style.Facestyle) {
									value.facestyle = style.Facestyle[Math.floor(Math.random() * style.Facestyle.length)];
								}
								if (!value.cosplaystyle && style.Cosplay) {
									value.cosplaystyle = style.Cosplay[Math.floor(Math.random() * style.Cosplay.length)];
								}

							}
						}
					}
					if (enemyType?.outfit || KinkyDungeonGetEnemyByName(value.type)?.outfit) {
						KinkyDungeonSetDress(
							value.outfit || enemyType?.outfit || KinkyDungeonGetEnemyByName(value.type)?.outfit,
							value.outfit || enemyType?.outfit || KinkyDungeonGetEnemyByName(value.type)?.outfit, KDSpeakerNPC, true);
					}
					KDRefreshCharacter.set(KDSpeakerNPC, true);
					KinkyDungeonDressPlayer(KDSpeakerNPC, true);
				}
				return true;
			} else {
				KDConfirmType = "reset";
				KinkyDungeonReplaceConfirm = 2;
				return true;
			}
		}, true, 465, 930, 240, 50,
		TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'reset') ?
				"KinkyDungeonConfirm" :
				"KinkyDungeonDressPlayerReset"),
		"#ffffff",
		KinkyDungeonRootDirectory + "UI/Reset.png", undefined, undefined, undefined,
		undefined, undefined, true);
	}

	if (!Character || Character == KinkyDungeonPlayer) {
		DrawButtonKDEx("KDWardrobeSave", (_bdata) => {
			KinkyDungeonState = "Menu";
			KDPlayerSetPose = false;
			KinkyDungeonDressSet();
			return true;
		}, true, 20, 940, 400, 50, TextGet("KDWardrobeSave"), "#ffffff", "");
	} else {
		DrawButtonKDEx("KDBackToGame", (_bdata) => {
			KinkyDungeonState = "Game";
			KDPlayerSetPose = false;
			ForceRefreshModelsAsync(C);
			if (KDWardrobeCallback) KDWardrobeCallback();
			KinkyDungeonDressSet(C);
			return true;
		}, true, 20, 942, 400, 50, TextGet("KDBackToGame"), "#ffffff", "");

	}


	if (TestMode && !KDClipboardDisabled && C == KinkyDungeonPlayer) {
		DrawButtonKDEx("KDCreateOutfit", (_bdata) => {
			let exportData = [];
			if (C?.Appearance)
				for (let a of C.Appearance) {
					// FIXME: Cosplay is not defined in Model
					if (a.Model && !(KDModelIsProtected(a.Model)) && !a.Model.Restraint && !a.Model['Cosplay']) {
						exportData.push({
							Item: a.Model.Name,
							Group: a.Model.Group || a.Model.Name,
							Color: "#ffffff",
							Lost: false,
							Filters: a.Model.Filters,
							Properties: a.Model.Properties,
						},);
					}
				}
			navigator.clipboard.writeText(JSON.stringify(exportData));
			return true;
		}, true, 945, 950, 100, 60,
		TextGet("KDCreateOutfit"), "#99ff99", "");
		DrawButtonKDEx("KDCreateAlwaysDress", (_bdata) => {
			let exportData: alwaysDressModel[] = [];
			if (C?.Appearance)
				for (let a of C.Appearance) {
					// FIXME: Cosplay is not defined in Model
					if (a.Model && !KDModelIsProtected(a.Model) && !a.Model.Restraint && !a.Model['Cosplay']) {
						exportData.push({
							Model: a.Model.Name,
							Group: a.Model.Group || a.Model.Name,
							override: true,
							Filters: a.Model.Filters,
							Properties: a.Model.Properties,
							factionFilters: {},
							inheritFilters: false,
						},);
					}
				}
			navigator.clipboard.writeText(JSON.stringify(exportData));
			return true;
		}, true, 945, 890, 100, 60,
		TextGet("KDCreateAlwaysDress"), "#99ff99", "");


		DrawButtonKDEx("KDCreateFace", (_bdata) => {
			let exportData = [];
			if (C?.Appearance)
				for (let a of C.Appearance) {
					if (a.Model && KDModelIsProtected(a.Model) && (a.Model.Categories?.includes("Face") && !a.Model.Categories?.includes("Hair") && !a.Model.Categories?.includes("Cosplay"))) {
						exportData.push({
							Item: a.Model.Name,
							Group: a.Model.Group || a.Model.Name,
							Color: "#ffffff",
							Lost: false,
							Filters: a.Model.Filters,
							Properties: a.Model.Properties,
						},);
					}
				}
			navigator.clipboard.writeText(JSON.stringify(exportData));
			return true;
		}, true, 945, 710, 100, 60,
		TextGet("KDCreateFace"), "#99ff99", "");
		DrawButtonKDEx("KDCreateHair", (_bdata) => {
			let exportData = [];
			if (C?.Appearance)
				for (let a of C.Appearance) {
					if (a.Model && KDModelIsProtected(a.Model) && (a.Model.Categories?.includes("Hairstyles") && !a.Model.Categories?.includes("Cosplay"))) {
						exportData.push({
							Item: a.Model.Name,
							Group: a.Model.Group || a.Model.Name,
							Color: "#ffffff",
							Lost: false,
							Filters: a.Model.Filters,
							Properties: a.Model.Properties,
						},);
					}
				}
			navigator.clipboard.writeText(JSON.stringify(exportData));
			return true;
		}, true, 945, 830, 100, 60,
		TextGet("KDCreateHair"), "#99ff99", "");
		DrawButtonKDEx("KDCreateCosplay", (_bdata) => {
			let exportData = [];
			if (C?.Appearance)
				for (let a of C.Appearance) {
					if (a.Model && KDModelIsProtected(a.Model) && (a.Model.Categories?.includes("Cosplay"))) {
						exportData.push({
							Item: a.Model.Name,
							Group: a.Model.Group || a.Model.Name,
							Color: "#ffffff",
							Lost: false,
							Filters: a.Model.Filters,
							Properties: a.Model.Properties,
						},);
					}
				}
			navigator.clipboard.writeText(JSON.stringify(exportData));
			return true;
		}, true, 945, 770, 100, 60,
		TextGet("KDCreateCosplay"), "#99ff99", "");
	}

}

let KDWardrobeCallback = null;
let KDWardrobeRevertCallback = null;
let KDWardrobeResetCallback = null;

function KDSaveCodeOutfit(C: Character, clothesOnly: boolean = false): void {
	if (!C) C = KinkyDungeonPlayer;
	// Save outfit
	KDChangeWardrobe(C);
	let decompressed = DecompressB64(ElementValue("saveInputField"));
	if (decompressed) {

		// Strips first
		KDChangeWardrobe(C);
		CharacterReleaseTotal(C);
		CharacterNaked(C);
		KDRefreshCharacter.set(C, true);
		KinkyDungeonSetDress("None", "None", C, true);
		KinkyDungeonDressPlayer(C, true);
		KDInitProtectedGroups(C);
		KinkyDungeonConfigAppearance = true;
		KinkyDungeonReplaceConfirm = 0;

		// Then decompresses
		CharacterAppearanceRestore(C, decompressed, clothesOnly, !clothesOnly);
		CharacterRefresh(C);
		KDInitProtectedGroups(C);
	}

	KDRefreshCharacter.set(C, true);
	KinkyDungeonDressPlayer(C, true);

	//KinkyDungeonNewDress = true;
}

function KDRestoreOutfit() {
	// Restore the original outfit
	if (KDOriginalValue) {
		CharacterAppearanceRestore(KinkyDungeonPlayer, DecompressB64(KDOriginalValue) || KDOriginalValue, false, true);
		CharacterRefresh(KinkyDungeonPlayer);
		KDInitProtectedGroups(KinkyDungeonPlayer);
		KinkyDungeonDressPlayer();
	}
}

function KDSaveOutfitInfo() {
	localStorage.setItem("kdOutfitMeta", JSON.stringify(KDOutfitInfo));
}

function KDRefreshOutfitInfo() {
	let loaded = JSON.parse(localStorage.getItem("kdOutfitMeta"));
	if (!(loaded?.length) || typeof loaded === 'string') {
		loaded = [];
	}
	if (loaded?.length != undefined) {
		KDOutfitInfo = loaded;
		if (loaded.length < KDMaxOutfits) {
			for (let i = 1; i <= KDMaxOutfits; i++) {
				if (i > loaded.length) {
					KDOutfitInfo.push("Outfit" + i);
				}
			}
		}
	}
}


/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param    h       The hue
 * @param    s       The saturation
 * @param    l       The lightness
 * @return            The RGB representation
 */
function hslToRgb(h: number, s: number, l: number): number[] {
	let r: number, g: number, b: number;

	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hueToRgb(p, q, h + 1/3);
		g = hueToRgb(p, q, h);
		b = hueToRgb(p, q, h - 1/3);
	}

	return [
		Math.round(r * 255),
		Math.round(g * 255),
		Math.round(b * 255)
	];
}

function hueToRgb(p: number, q: number, t: number): number {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1/6) return p + (q - p) * 6 * t;
	if (t < 1/2) return q;
	if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	return p;
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 1] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param    r       The red color value
 * @param    g       The green color value
 * @param    b       The blue color value
 * @return            The HSL representation
 */
function rgbToHsl(r: number, g: number, b: number): number[] {
	const vmax = Math.max(r, g, b),
		vmin = Math.min(r, g, b);
	let h: number, s: number, l: number = (vmax + vmin) / 2;

	if (vmax === vmin) {
		return [0, 0, l]; // achromatic
	}

	const d = vmax - vmin;
	s = l > 0.5 ? d / (2 - vmax - vmin) : d / (vmax + vmin);
	if (vmax === r) h = (g - b) / d + (g < b ? 6 : 0);
	if (vmax === g) h = (b - r) / d + 2;
	if (vmax === b) h = (r - g) / d + 4;
	h /= 6;

	return [h, s, l];
}

let KDVisualBrightness = 0.5;



function KDLoadOutfit(files: File[]) {
	for (let f of files) {
		if (f && f.name) {
			if (f.name.endsWith(KDOUTFITEXTENSION) || f.name.endsWith(KDOUTFITBACKUP) || f.name.endsWith('.txt')) {
				let str = "";
				KDSaveName = f.name;
				try {
					const reader = new FileReader();
					reader.addEventListener('load', (event) => {
						str = event.target.result.toString();
						ElementValue("saveInputField",
							str
						);
					});
					reader.readAsText(f);
				} catch (err) {
					console.log (err);
				}
				return;
			}
		}
	}
}
function KDLoadOutfitDirect(files: File[], Char: Character) {
	for (let f of files) {
		if (f && f.name) {
			if (f.name.endsWith(KDOUTFITEXTENSION) || f.name.endsWith(KDOUTFITBACKUP) || f.name.endsWith('.txt')) {
				let str = "";
				KDSaveName = f.name;
				try {
					const reader = new FileReader();
					reader.addEventListener('load', (event) => {
						str = event.target.result.toString();

						let decompressed = DecompressB64(str);
						if (decompressed) {
							let origAppearance = Char.Appearance;
							try {
								CharacterAppearanceRestore(Char, decompressed, false, true);
								let newParsed = JSON.parse(decompressed);
								if (newParsed) {
									Char.Palette = newParsed.metadata.palette;
								}
								CharacterRefresh(Char);
								KDOldValue = str;
								KDInitProtectedGroups(Char);
								KinkyDungeonDressPlayer(Char, true);

								if (Char.Appearance.length == 0)
									throw new DOMException();
							} catch (e) {
								Char.Appearance = origAppearance;
							}
						}
					});
					reader.readAsText(f);
				} catch (err) {
					console.log (err);
				}
				return;
			}
		}
	}
}

/**
 * @param C
 */
function KDGetCharMetadata(C: Character): KDOutfitMetadata {
	return {
		name: C.Name,
		palette: C.Palette,
	};
}
