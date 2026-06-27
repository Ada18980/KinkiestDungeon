'use strict';



let KDConfirmType = "";
let KinkyDungeonReplaceConfirm = 0;

let lastFastPaletteUpdate = 0;

let KDCanRevertFlag = false;

let KDSelectedPaletteLayer = "Highlight";

let GenericPaletteLayers = [
	"DarkNeutral",
	"LightNeutral",
	"Highlight",
	"Catsuit",
];
let GenericPaletteLayerSprites = {
	Highlight: KinkyDungeonRootDirectory + "UI/greyColorHighlight.png",
	DarkNeutral: KinkyDungeonRootDirectory + "UI/greyColor.png",
	LightNeutral: KinkyDungeonRootDirectory + "UI/greyColorLight.png",
	Catsuit: KinkyDungeonRootDirectory + "UI/greyColorCatsuit.png",
	None: KinkyDungeonRootDirectory + "UI/X.png",
};

let ColorPickerFilterCode: Record<string, string> = {
	Default: "",
};
let ColorPickerFilter: Record<string, PIXIAdjustmentFilter> = {
	Default: new PIXI.filters.AdjustmentFilter({
		brightness: 1,
		saturation: 1,
		gamma: 1,
		alpha: 1,
		red: 1,
		blue: 1,
		green: 1,
		contrast: 1,
	}),
}

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
let KDCurrentCharacterPalettes : Record<string, Record<string, LayerFilter>> = null;


let KDModelList_Categories_index = 1;
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

let KDCategoryFilterSpecial: Record<string, (C: Character, m: Model, stage: number, level: number) => boolean> = {
	Worn: (C: Character, m: Model, stage: number, level) => {
		return !!KDCurrentModels.get(C)?.Models?.get(m.Name) && (
			level == 1
			? KDModelIsProtected(KDCurrentModels.get(C)?.Models?.get(m.Name))
			: !KDModelIsProtected(KDCurrentModels.get(C)?.Models?.get(m.Name))
		);
	}
}

let KDCategoryFilterSpecialSubClick: Record<string, (C: Character, en: any, index: number, name: string) => ((_bdata) => boolean)> = {
	Worn: (C, en, index, name) => {
		return (_bdata: any) => {
			if (!en) return false;

			let removed = false;
			for (let appIndex = 0; appIndex < C.Appearance.length; appIndex++) {
				if (C.Appearance[appIndex]?.Model?.Name == name) {
					if (KDModelList_Sublevel_index == index && name == KDSelectedModel?.Name) {
						KDChangeWardrobe(C);
						C.Appearance.splice(appIndex, 1);
						KDUpdateChar(C);
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
					KDUpdateChar(C);
				}


			}


			KDModelList_Sublevel_index = index;
			KDCurrentLayer = Object.keys(ModelDefs[name]?.Layers || {})[0] || "";
			KDCurrentLayerOrig = Object.keys(ModelDefs[name]?.Layers || {})[0] || "";
			KDRefreshProps = true;
			KDUpdateModelList(3, C);
			if (KDCurrentModels.get(C).Models.has(name)) {
				KDSelectedModel = C.Appearance.find((value) => {
					return value.Model.Name == name;
				})?.Model;
			} else KDSelectedModel = null;
			return true;
		};
	},
}

let KDCategoryFilterSpecialSubNoBorder: Record<string, (C: Character, en: any, index: number, name: string) => boolean> = {
	Worn: (C, en, index, name) => {
		return index != KDModelList_Sublevel_index || name != KDSelectedModel?.Name;
	},
}


let KDCategoryFilterSpecialTopClick: Record<string, (C: Character, en: any, index: number, name: string) => ((_bdata) => boolean)> = {
	Worn: (C, en, index, name) => {
		return (_bdata: any) => {
			if (!en) return false;

			let removed = false;
			for (let appIndex = 0; appIndex < C.Appearance.length; appIndex++) {
				if (C.Appearance[appIndex]?.Model?.Name == name) {
					if (KDModelList_Toplevel_index == index && name == KDSelectedModel?.Name) {
						KDChangeWardrobe(C);
						C.Appearance.splice(appIndex, 1);
						KDUpdateChar(C);
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
					KDUpdateChar(C);
				}


			}


			KDModelList_Toplevel_index = index;
			KDCurrentLayer = Object.keys(ModelDefs[name]?.Layers || {})[0] || "";
			KDCurrentLayerOrig = Object.keys(ModelDefs[name]?.Layers || {})[0] || "";
			KDRefreshProps = true;
			KDUpdateModelList(3, C);
			if (KDCurrentModels.get(C).Models.has(name)) {
				KDSelectedModel = C.Appearance.find((value) => {
					return value.Model.Name == name;
				})?.Model;
			} else KDSelectedModel = null;
			return true;
		};
	},
}


let KDCategoryFilterSpecialTopNoBorder: Record<string, (C: Character, en: any, index: number, name: string) => boolean> = {
	Worn: (C, en, index, name) => {
		return index != KDModelList_Toplevel_index || name != KDSelectedModel?.Name;
	},
}


let KDWardrobeCategories = [
	"Worn",
	"Uniforms",
	"Hairstyles",
	"Face",
	"Eyes",
	"Mouth",
	"Cosplay",
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

let KDSelectedModel: Model = null;
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
let KDProps: LayerPropertiesType = {
};
let KDColorSliderColor = {
	red: KDBaseRed,
	green: KDBaseNeon,
	blue: "#5555ff",
};
let KDCurrentLayer = "";
let KDCurrentLayerOrig = "";

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
let KDWardrobe_PoseFear = FEARPOSES;

interface NPCPoseStruct {
	CurrentPoseArms?: string,
	CurrentPoseLegs?: string,
	CurrentPoseEyes?: string,
	CurrentPoseBrows?: string,
	CurrentPoseBlush?: string,
	CurrentPoseMouth?: string,
	CurrentPoseEyes2?: string,
	CurrentPoseBrows2?: string,
	CurrentPoseFear?: string,
}

let KDNPCPoses: Map<Character, NPCPoseStruct> = new Map();
let NPCDesiredPoses: Map<Character, KDExpressionPoseType> = new Map();

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
	KDNPCPoses.get(C).CurrentPoseFear = blank ? "" : KDWardrobe_PoseFear[0];
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

		KDDraw(kdpalettecontainer, kdpixisprites, "SavedColor" + ii, KinkyDungeonRootDirectory + "UI/greyColor.png", X + spacing * i, Y, 64, 64, undefined, {
			filters: [
				KDCurrentColorFilter[ii],
			]
		});
		DrawButtonKDExTo(kdpalettecontainer, "SavedColorCopy" + ii, (_bdata) => {
			if (filters && KDSelectedModel) {
				KDSavedColors[ii] = Object.assign({}, filters);
				localStorage.setItem("kdcolorfilters", JSON.stringify(KDSavedColors));
			}
			return true;
		}, true, X + spacing * i + 32 - 48, Y + 64, 48, 48, "", KDBaseWhite, KinkyDungeonRootDirectory + "UI/savedColor_copy.png", undefined, false, true);
		DrawButtonKDExTo(kdpalettecontainer, "SavedColorPaste" + ii, (_bdata) => {
			if (filters && KDSelectedModel) {
				Object.assign(filters, KDSavedColors[ii]);
				KDChangeWardrobe(C);
				if (!KDSelectedModel.Filters) KDSelectedModel.Filters = {};
				KDSelectedModel.Filters[KDCurrentLayer] = Object.assign({}, filters);
				KDCurrentModels.get(C).Models.set(KDSelectedModel.Name, JSON.parse(JSON.stringify(KDSelectedModel)));
			}
			return true;
		}, true, X + spacing * i + 32 + 0, Y + 64, 48, 48, "", KDBaseWhite, KinkyDungeonRootDirectory + "UI/savedColor_paste.png", undefined, false, true);
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
	DrawTextFitKD(TextGet("KDFilters"), X - 5 - 245 + 300, 25, 500, KDBaseWhite, KDTextGray0, undefined, "center");

	DrawBoxKD(X, 50, 310, 600, KDButtonColor, true, 0.5, -10);
	DrawBoxKD(X - 5 - 245, 5, 600, 700, KDButtonColor, false, 0.5, -10);
	DrawTextFitKD(TextGet("KDLayers"), X - 120, 80, 300, KDBaseWhite, KDTextGray0, 22, "center");

	let YY = Y;
	let width = 300;
	let layers = KDGetColorableLayers(Model, KDPropsSlider);
	if (!layers[0]) return;
	if (!KDCurrentLayer) {
		KDCurrentLayer = layers[0].name || "";
		KDCurrentLayerOrig = layers[0].layer || "";
	}

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
		}, true, X + width/2 + 10, YY, width/2 - 10, 30, TextGet("KDResetLayerProps"), KDBaseWhite);


		if (!KDClipboardDisabled) {
			if (TestMode)
				DrawButtonKDEx("ExportAllProps", (_bdata) => {
					if (Model.Properties) {
						navigator.clipboard.writeText(JSON.stringify(Model.Properties));
					}
					return true;
				}, true, X + width/2 + 10, YY - 40, width/2 - 10, 30, TextGet("KDExportAllProps"), KDBaseMint);

			DrawButtonKDEx("KDCopyProps", (_bdata) => {
				navigator.clipboard.writeText(JSON.stringify(Properties));
				return true;
			}, true, X, YY, width/2 - 10, 30, TextGet("KDCopyLayer"), KDBaseWhite);
			DrawButtonKDEx("KDPasteProps", (_bdata) => {
				navigator.clipboard.readText()
					.then(text => {
						let parsed: LayerPropertiesType = JSON.parse(text);
						if (parsed) {
							console.log(Object.assign({}, parsed));
							KDChangeWardrobe(C);
							if (!Model.Properties) Model.Properties = {};
							Model.Properties[KDCurrentLayer] = Object.assign({}, parsed);
							Object.assign(KDCurrentModels.get(C).Models.get(Model.Name), JSON.parse(JSON.stringify(Model)));
							UpdateModels(C);
							KDRefreshProps = true;
							lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
							ForceRefreshModels(C);
						}
					});
				return true;
			}, true, X, YY - 40, width/2 - 10, 30, TextGet("KDPasteLayer"), KDBaseWhite);
		} else {
			let CF = KDTextField("KDCopyProperties", X, YY - 70,
				width, 30, undefined, undefined, "300", 12);
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
							Object.assign(KDCurrentModels.get(C).Models.get(Model.Name), JSON.parse(JSON.stringify(Model)));
							UpdateModels(C);
							KDRefreshProps = true;
						}
					} catch (err) {
						console.log("Invalid Properties");
					}

				};
				CF.Element.onclick = (_event: any) => {
					ElementValue("KDCopyProperties", JSON.stringify(Model.Properties))
				}
			}
		}
		YY += 60;

		/** Property fields */
		let fields: Record<keyof LayerPropertiesType, string> = KDGetLayerPropFields();

		let XXOff = 0;
		let dXXOff = width/2;

		if (KDRefreshProps) {
			KDRefreshProps = false;
			YY += 400;
		} else {
			let YYold = YY;
			YY -= 24;
			let start = true;
			let lastlong = false;
			for (let field0 of Object.entries(fields)) {

				let field = field0[0];
				let deff = field0[1];
				let long = deff.includes(',');

				if (!start) {
					if (!long && !lastlong && XXOff < dXXOff) XXOff += dXXOff;
					else {
						XXOff = 0;
						YY += 30;
					}
				} else {
					start = false;
				}



				DrawTextFitKD(TextGet("KDPropField_" + field),
				X + (long ? width/2 : width/4) + 10 + XXOff,
				YY + 10, long ? width : width/2, KDBaseWhite, KDBaseBlack, 20);


				let FF = KDTextField("KDPropField" + field, X + XXOff, YY,
					long ? width : width/2, 20,
					undefined, undefined, "100", 18);
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
							if (value || value === "") {
								KDChangeWardrobe(C);
								if (!Model.Properties) Model.Properties = {};
								if (!Model.Properties[KDCurrentLayer])
									Model.Properties[KDCurrentLayer] = Object.assign({}, KDProps);
								Model.Properties[KDCurrentLayer][field] = parsed;
								Object.assign(KDCurrentModels.get(C).Models.get(Model.Name), JSON.parse(JSON.stringify(Model)));
								UpdateModels(C);
								lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
								ForceRefreshModels(C);
							}
						} catch (err) {
							console.log("Must be a float");
						}
					};
				}


				if (long) lastlong = true;
				else lastlong = false;

				//YY += 30;
			}
			YY = YYold + 400;
		}
		YY += 70;

	} else {
		let filters = (Model.Filters ? Model.Filters[KDCurrentLayer] : undefined) || KDColorSliders;
		YY = KDDrawColorPicker("Default", KDCurrentLayer, filters, Model.Filters, YY, X,
			300,
			() => {
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
			},
			(parsed) => {
				if (parsed?.red != undefined && parsed.green != undefined && parsed.blue != undefined) {
					console.log(Object.assign({}, parsed));
					KDChangeWardrobe(C);
					if (!Model.Filters)
						Model.Filters = {};
					Model.Filters[KDCurrentLayer] = Object.assign({}, parsed);
					Object.assign(KDCurrentModels.get(C).Models.get(Model.Name), JSON.parse(JSON.stringify(Model)));
					UpdateModels(C);
				}
			},
			(parsed) => {
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
				Object.assign(KDCurrentModels.get(C).Models.get(Model.Name), JSON.parse(JSON.stringify(Model)));
				UpdateModels(C);
			},
			(key) => {
				let force = false;
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

				Object.assign(KDCurrentModels.get(C).Models.get(Model.Name), JSON.parse(JSON.stringify(Model)));
				UpdateModels(C);
				let maxNorm = Math.max(1.5, Math.max(
					Model.Filters[KDCurrentLayer].red,
					Model.Filters[KDCurrentLayer].green,
					Model.Filters[KDCurrentLayer].blue,
				));
				let rr = Math.round(Math.min(1, Model.Filters[KDCurrentLayer].red /maxNorm) * 255).toString(16);
				if (rr.length == 1) rr = '0' + rr;
				let gg = Math.round(Math.min(1, Model.Filters[KDCurrentLayer].green /maxNorm) * 255).toString(16);
				if (gg.length == 1) gg = '0' + gg;
				let bb = Math.round(Math.min(1, Model.Filters[KDCurrentLayer].blue /maxNorm) * 255).toString(16);
				if (bb.length == 1) bb = '0' + bb;
				ElementValue("KDSelectedColor", `#${
					rr}${
					gg}${
					bb}`);
				ElementValue("KDCopyFilter", JSON.stringify(Model.Filters[KDCurrentLayer]));
				lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
				ForceRefreshModels(C);
				return force;
			},
			(r, g, b) => {
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
				Object.assign(KDCurrentModels.get(C).Models.get(Model.Name), JSON.parse(JSON.stringify(Model)));
				UpdateModels(C);
				let maxNorm = Math.max(1.5, Math.max(
					Model.Filters[KDCurrentLayer].red,
					Model.Filters[KDCurrentLayer].green,
					Model.Filters[KDCurrentLayer].blue,
				));
				let rr = Math.round(Math.min(1, Model.Filters[KDCurrentLayer].red/maxNorm) * 255).toString(16);
				if (rr.length == 1) rr = '0' + rr;
				let gg = Math.round(Math.min(1, Model.Filters[KDCurrentLayer].green/maxNorm) * 255).toString(16);
				if (gg.length == 1) gg = '0' + gg;
				let bb = Math.round(Math.min(1, Model.Filters[KDCurrentLayer].blue/maxNorm) * 255).toString(16);
				if (bb.length == 1) bb = '0' + bb;
				ElementValue("KDSelectedColor", `#${
					rr}${
					gg}${
					bb}`);
				ElementValue("KDCopyFilter", JSON.stringify(Model.Filters[KDCurrentLayer]));
				ForceRefreshModels(C);
			}, 
			(key) => {
				KDChangeWardrobe(C);
				if (!Model.Filters) Model.Filters = {};
				if (!Model.Filters[KDCurrentLayer])
					Model.Filters[KDCurrentLayer] = Object.assign({}, KDColorSliders);
				Model.Filters[KDCurrentLayer][key] = ((MouseX - X) / width) * 5;
				Object.assign(KDCurrentModels.get(C).Models.get(Model.Name), JSON.parse(JSON.stringify(Model)));
				UpdateModels(C);
				let maxNorm = Math.max(1.5, Math.max(
					Model.Filters[KDCurrentLayer].red,
					Model.Filters[KDCurrentLayer].green,
					Model.Filters[KDCurrentLayer].blue,
				));
				let rr = Math.round(Math.min(1, Model.Filters[KDCurrentLayer].red /maxNorm) * 255).toString(16);
				if (rr.length == 1) rr = '0' + rr;
				let gg = Math.round(Math.min(1, Model.Filters[KDCurrentLayer].green /maxNorm) * 255).toString(16);
				if (gg.length == 1) gg = '0' + gg;
				let bb = Math.round(Math.min(1, Model.Filters[KDCurrentLayer].blue /maxNorm) * 255).toString(16);
				if (bb.length == 1) bb = '0' + bb;
				ElementValue("KDSelectedColor", `#${
					rr}${
					gg}${
					bb}`);
				ElementValue("KDCopyFilter", JSON.stringify(Model.Filters[KDCurrentLayer]));
			},
			(r, g, b) => {
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
				Object.assign(KDCurrentModels.get(C).Models.get(Model.Name), JSON.parse(JSON.stringify(Model)));
				
				UpdateModels(C);
			}, (key, override, desaturate) => {
				KDChangeWardrobe(C);
				if (key == "None") {
					if (Model.factionFilters) {
						if (Model.factionFilters[KDCurrentLayer]) {
							delete Model.factionFilters[KDCurrentLayer];
							if (Object.values(Model.factionFilters).length == 0) {
								delete Model.factionFilters;
							}
						}
					}
				} else {
					if (!Model.factionFilters) {
						Model.factionFilters = {};
					}
					Model.factionFilters[KDCurrentLayer] = {color: key, override: override, desaturate: desaturate};
				}
				
				Object.assign(KDCurrentModels.get(C).Models.get(Model.Name), JSON.parse(JSON.stringify(Model)));
				lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
				ForceRefreshModels(C);
				UpdateModels(C);
			},
			C?.metadata?.palette || C.Palette || "", C?.ID + "_",
			Model.factionFilters ? Model.factionFilters[KDCurrentLayer] : undefined,
			!!TestMode,
		).YY;
	}

	KDDrawWardrobeToolsButtons(X, Y, C, Model);


	DrawButtonKDEx("tab_ColorPickerSimple", (_b) => {
		KDToggles.SimpleColorPicker = true;
		KDToggles.PaletteColorPicker = false;
		KDPropsSlider = false;
		return true;
	}, true, X - 240, YY + 40, 140, 30, TextGet("KDColorPickerSimple"), 
		KDBaseWhite, undefined, undefined, undefined,
		KDToggles.PaletteColorPicker || KDPropsSlider || !KDToggles.SimpleColorPicker, KDButtonColor);
	DrawButtonKDEx("tab_ColorPickerPalette", (_b) => {
		KDToggles.PaletteColorPicker = true;
		KDPropsSlider = false;
		return true;
	}, true, X - 240 + 290, YY + 40, 140, 30, 
	TextGet("KDColorPickerPalette"), KDBaseWhite, undefined, undefined, undefined,
	KDPropsSlider || !KDToggles.PaletteColorPicker, 
	(Model.factionFilters && Model.factionFilters[KDCurrentLayer]) ? KDTextGray3 : KDButtonColor);
	DrawButtonKDEx("tab_ColorPickerAdvanced", (_b) => {
		KDToggles.SimpleColorPicker = false;
		KDToggles.PaletteColorPicker = false;
		KDPropsSlider = false;
		return true;
	}, true, X - 240 + 145, YY + 40, 140, 30, TextGet("KDColorPickerAdvanced"), KDBaseWhite, undefined, undefined, undefined,
	KDToggles.PaletteColorPicker || KDPropsSlider || KDToggles.SimpleColorPicker, KDButtonColor);
	DrawButtonKDEx("tab_ColorPickerProperties", (_b) => {
		KDPropsSlider = true;
		KDToggles.PaletteColorPicker = false;
		return true;
	}, true, X - 240 + 435, YY + 40, 140, 30, TextGet("KDColorPickerProperties"), KDBaseWhite, undefined, undefined, undefined,
	!KDPropsSlider, KDButtonColor);


	YY += 60;
	YY = Y + 35;

	let ii = 0;
	let buttonSpacing = 30;
	while (YY < 590) {
		if (ii >= KDLayerIndex) {
			let ll = layers[ii];
			let l = ll?.name || "";
			let str = "";
			if (l) {
				if (!KDPropsSlider || KDWToolsLayerAbbrMode == "Full") {
					str = TextGet(`m_${Model.Name}_l_${l}`);
				} else {
					str = !HasText(`l_${Model.Name}_${l}`) ? KDAbbreviate(l)
					: KDAbbreviate(TextGet(`m_${Model.Name}_l_${l}`));
				}
			}

			DrawButtonKDExScroll("SelectLayer" + YY,
				(amount) => {
					KDLayerIndex += Math.min(5, Math.abs(amount)/35) * Math.sign(amount);
					KDLayerIndex = Math.min(KDLayerIndex, layers.length - 10);
					KDLayerIndex = Math.max(0, KDLayerIndex);
				},
				(_bdata) => {
					if (l) {
						KDCurrentLayer = l;
						KDCurrentLayerOrig = ll.layer;
					}
					KDRefreshProps = true;
					return true;
				}, true, X - 220, YY, 200, buttonSpacing - 1,
				l ? str : "",
				KDBaseWhite, undefined, undefined, undefined, KDCurrentLayer != l, KDButtonColor);
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
	KDModelList_Toplevel_viewindex.index + KDModelListMax < KDModelList_Toplevel_viewindex.index ? KDBaseWhite : "#888888", KinkyDungeonRootDirectory + "Down.png", undefined, undefined, undefined, undefined,
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
	KDModelList_Toplevel_viewindex.index > 0 ? KDBaseWhite : "#888888", KinkyDungeonRootDirectory + "Up.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});

	if (KDLayerIndex > layers.length - 10) KDLayerIndex = Math.max(0, layers.length - 10);
}

function KDUpdateChar(C: Character) {
	KDCurrentModels.get(C).Poses = KDGeneratePoseArray(
		KDNPCPoses.get(C)?.CurrentPoseArms,
		KDNPCPoses.get(C)?.CurrentPoseLegs,
		KDNPCPoses.get(C)?.CurrentPoseEyes,
		KDNPCPoses.get(C)?.CurrentPoseBrows,
		KDNPCPoses.get(C)?.CurrentPoseBlush,
		KDNPCPoses.get(C)?.CurrentPoseMouth,
		KDNPCPoses.get(C)?.CurrentPoseEyes2,
		KDNPCPoses.get(C)?.CurrentPoseBrows2,
		undefined,
		KDNPCPoses.get(C)?.CurrentPoseFear,
		//KDGetPoseOfType(C, "Eyes"),
		//KDGetPoseOfType(C, "Brows"),
		//KDGetPoseOfType(C, "Blush"),
		//KDGetPoseOfType(C, "Mouth"),
	);
	KDUpdateTempPoses(C);
	UpdateModels(C);
}

let KDLayerIndex = 0;

function KDDrawPoseButtons(C: Character, X: number = 960, Y: number = 750, allowRemove: boolean = false, dress: boolean = false, updateDesired: boolean = false) {
	if (!KDNPCPoses.get(C)) KDNPCPoses.set(C, {});
	let buttonClick = (
		arms: string,
		legs: string,
		eyes: string,
		eyes2?: string,
		brows?: string,
		brows2?: string,
		blush?: string,
		mouth?: string,
		update: boolean = true,
		fear?: string,
		) => {
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
			if (allowRemove && fear == KDNPCPoses.get(C).CurrentPoseFear) KDNPCPoses.get(C).CurrentPoseFear = "";
			else KDNPCPoses.get(C).CurrentPoseFear = fear || KDNPCPoses.get(C).CurrentPoseFear;

			if (updateDesired) {
				NPCDesiredPoses.set(C, {
					Arms: KDNPCPoses.get(C).CurrentPoseArms,
					Legs: KDNPCPoses.get(C).CurrentPoseLegs,
					Eyes: KDNPCPoses.get(C).CurrentPoseEyes,
					Eyes2: KDNPCPoses.get(C).CurrentPoseEyes2,
					Brows: KDNPCPoses.get(C).CurrentPoseBrows,
					Brows2: KDNPCPoses.get(C).CurrentPoseBrows2,
					Blush: KDNPCPoses.get(C).CurrentPoseBlush,
					Mouth: KDNPCPoses.get(C).CurrentPoseMouth,
					Fear: KDNPCPoses.get(C).CurrentPoseFear,
				});
			}

			if (update) {
				KDUpdateChar(C);
			}
			if (dress) {

				KDRefreshCharacter.set(C, true);
				KDDressWardrobeChar(C, KinkyDungeonState == "Game");

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
			KDBaseWhite, KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseArms[i] + ".png",
			undefined, false, KDNPCPoses.get(C).CurrentPoseArms != KDWardrobe_PoseArms[i], !AvailableArms.includes(KDWardrobe_PoseArms[i]) ? KDBaseRed : KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseLegs.length; i++) {
		DrawButtonKDEx("PoseLegs" + i,
			buttonClick("", KDWardrobe_PoseLegs[i], "", "", "", "", "", "", AvailableLegs.includes(KDWardrobe_PoseLegs[i])),
			true,
			X + xoff + i*buttonSpacing, Y + 180, buttonWidth, buttonWidth,
			"",
			KDBaseWhite, KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseLegs[i] + ".png",
			undefined, false, KDNPCPoses.get(C).CurrentPoseLegs != KDWardrobe_PoseLegs[i], !AvailableLegs.includes(KDWardrobe_PoseLegs[i]) ? KDBaseRed : KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseEyes.length; i++) {
		DrawButtonKDEx("PoseEyes" + i, buttonClick("", "", KDWardrobe_PoseEyes[i]), true, X + i*buttonSpacing, Y, buttonWidth, buttonWidth,
			"",
			KDBaseWhite, KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseEyes[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseEyes != KDWardrobe_PoseEyes[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseEyes.length; i++) {
		DrawButtonKDEx("PoseEyes2" + i, buttonClick("", "", "", KDWardrobe_PoseEyes2[i]), true, X + i*buttonSpacing, Y + 60, buttonWidth, buttonWidth,
			"",
			KDBaseWhite, KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseEyes2[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseEyes2 != KDWardrobe_PoseEyes2[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseBrows.length; i++) {
		DrawButtonKDEx("PoseBrows" + i, buttonClick("", "", "", "", KDWardrobe_PoseBrows[i]), true, X + 400 + i*buttonSpacing, Y, buttonWidth, buttonWidth,
			"",
			KDBaseWhite, KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseBrows[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseBrows != KDWardrobe_PoseBrows[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseBrows2.length; i++) {
		DrawButtonKDEx("PoseBrows2" + i, buttonClick("", "", "", "", "", KDWardrobe_PoseBrows2[i]), true, X + 400 + i*buttonSpacing, Y + 60, buttonWidth, buttonWidth,
			"",
			KDBaseWhite, KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseBrows2[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseBrows2 != KDWardrobe_PoseBrows2[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseBlush.length; i++) {
		DrawButtonKDEx("PoseBlush" + i, buttonClick("", "", "", "", "", "", KDWardrobe_PoseBlush[i]), true, X + 400 + i*buttonSpacing, Y + 120, buttonWidth, buttonWidth,
			"",
			KDBaseWhite, KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseBlush[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseBlush != KDWardrobe_PoseBlush[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseMouth.length; i++) {
		DrawButtonKDEx("PoseMouth" + i, buttonClick("", "", "", "", "", "", "", KDWardrobe_PoseMouth[i]), true, X + 400 + i*buttonSpacing, Y + 180, buttonWidth, buttonWidth,
			"",
			KDBaseWhite, KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseMouth[i] + ".png",
			undefined, undefined, KDNPCPoses.get(C).CurrentPoseMouth != KDWardrobe_PoseMouth[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseFear.length; i++) {
		DrawButtonKDEx("PoseFear" + i,
			buttonClick("", "", "", "", "", "", "", "", undefined, KDWardrobe_PoseFear[i]),
			true,
			X + 400 + (6 + i)*buttonSpacing,
			Y + 60,
			buttonWidth, buttonWidth,
			"",
			KDBaseWhite, KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseFear[i] + ".png",
			undefined, undefined,
			KDNPCPoses.get(C).CurrentPoseFear != KDWardrobe_PoseFear[i],
			KDButtonColor);
	}
}

/**
 * Updates the mopel list, only altering a level if the specified altered level is that low
 * @param level
 */
function KDUpdateModelList(level: number = 0, C?: Character): void {
	if (!C) C = KinkyDungeonPlayer;
	if (level <= 0) {
		KDModelList_Categories = [];
		KDModelList_Categories_index = 1;
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
			if ((model[1].TopLevel || KDCategoryFilterSpecial[category]) && (KDModelListFilter ||
				(KDCategoryFilterSpecial[category] ? KDCategoryFilterSpecial[category](C, model[1], level, 1)
				: model[1].Categories?.includes(category))) && (TestMode || !model[1].Restraint)) {
				if (!KDModelListFilter
					|| TextGet(model[0])?.toLowerCase().includes(KDModelListFilter.toLowerCase()))
					KDModelList_Toplevel.push(model[0]);
			}
		}

	}
	let toplevel: string = KDModelList_Toplevel[KDModelList_Toplevel_index];

	if (level <= 2) {
		KDModelList_Sublevel = [];
		KDModelList_Sublevel_index = 0;
		KDModelList_Sublevel_viewindex.index = 0;
		if (toplevel) {
			let already = {};
			// Put these at the top of the list
			if (KDCategoryFilterSpecial[category]) {
				for (let model of Object.entries(ModelDefs)) {
					if (already[model[0]]) continue;
					if (
						KDCategoryFilterSpecial[category](C, model[1], level, 2))
							{already[model[0]] = true; KDModelList_Sublevel.push(model[0]);}
				}
			} else {
				for (let model of Object.entries(ModelDefs)) {
					if (already[model[0]]) continue;
					if ((model[1].Parent != toplevel
						&& (!model[1].Parent2 || !model[1].Parent2.some((p) => {
							return toplevel == p;
						}))
					)
						 && model[0] == toplevel && (TestMode || !model[1].Restraint)) {
						if (!KDModelListFilter || TextGet(model[1].Parent)?.toLowerCase().includes(KDModelListFilter.toLowerCase()))
							{already[model[0]] = true; KDModelList_Sublevel.push(model[0]);}
					}
				}
				for (let model of Object.entries(ModelDefs)) {
					if (already[model[0]]) continue;
					if (((model[1].Parent == toplevel
						|| (model[1].Parent2 && model[1].Parent2.some((p) => {
							return toplevel == p;
						}))) || KDModelListFilter) && (TestMode || !model[1].Restraint)) {
						if (!KDModelListFilter || TextGet(model[1].Name)?.toLowerCase().includes(KDModelListFilter.toLowerCase()))
							{already[model[0]] = true; KDModelList_Sublevel.push(model[0]);}
					}
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


	let clickCategory = (en: any, index: number, sublevel: any) => {
		return (_bdata: any) => {
			if (!en) return false;
			KDModelList_Categories_index = index;
			KDModelList_Sublevel_index = -1;
			if (KDModelListFilter) {
				KDModelListFilter = "";
				KDUpdateModelList(0, C);
				KDUpdateModelList(2, C);
			}
			KDUpdateModelList(1, C);
			if (sublevel && KDCurrentModels.get(C).Models.has(sublevel)) {
				KDSelectedModel = C.Appearance.find((value) => {
					return value.Model.Name == sublevel;
				})?.Model;
			} else KDSelectedModel = null;
			return true;
		};
	};
	let clickToplevel = (en: any, index: number, sublevel: any) => {
		return (_bdata: any) => {
			if (!en) return false;
			KDModelList_Toplevel_index = index;
			KDModelList_Sublevel_index = -1;
			if (KDModelListFilter) {
				KDModelListFilter = "";
				KDUpdateModelList(0, C);
				KDUpdateModelList(1, C);
			}
			KDUpdateModelList(2, C);
			let name = KDModelList_Sublevel[KDModelList_Sublevel_index] || "";
			if (name) {
				KDCurrentLayer = Object.keys(ModelDefs[name]?.Layers || {})[0] || "";
				KDCurrentLayerOrig = Object.keys(ModelDefs[name]?.Layers || {})[0] || "";
			} else {
				KDCurrentLayer = "";
				KDCurrentLayerOrig = "";
			}
			KDRefreshProps = true;
			if (sublevel && KDCurrentModels.get(C).Models.has(sublevel)) {
				KDSelectedModel = C.Appearance.find((value) => {
					return value.Model.Name == sublevel;
				})?.Model;
			} else KDSelectedModel = null;
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
						KDUpdateChar(C);
					}
					removed = true;
					break;
				}
			}
			if (!removed) {
				let M = ModelDefs[name];
				if (M) {
					KDChangeWardrobe(C);

					if (!!M.Group && !KDToggles.StackOutfitItems) {
						// Items with groups cannot stack unless toggle is turned off
						for (let appIndex = 0; appIndex < C.Appearance.length; appIndex++) {
						if (C.Appearance[appIndex]?.Model?.Group == M.Group) {
								C.Appearance.splice(appIndex, 1);
								removed = true;
								break;
							}
						}
					}

					KDAddModel(C, M.Group || M.Name, M, "Default", undefined);
					KDUpdateChar(C);
				}


			}


			KDModelList_Sublevel_index = index;
			KDCurrentLayer = Object.keys(ModelDefs[name]?.Layers || {})[0] || "";
			KDCurrentLayerOrig = Object.keys(ModelDefs[name]?.Layers || {})[0] || "";
			KDRefreshProps = true;
			KDUpdateModelList(3, C);
			if (KDCurrentModels.get(C).Models.has(name)) {
				KDSelectedModel = C.Appearance.find((value) => {
					return value.Model.Name == name;
				})?.Model;
			} else KDSelectedModel = null;
			return true;
		};
	};

	let buttonHeight = 38;
	let buttonSpacing = 40;

	DrawTextFitKD(TextGet("KDItemMenu"), X + 10, 25, 220, KDBaseWhite, KDTextGray0, undefined, "left");
	DrawBoxKD(X - 5, 5, 650, 700, KDButtonColor, false, 0.5, -10);

	let MF = KDTextField("KDModelListFilter", X+220, 10, 400, buttonHeight, undefined, undefined, "30");
	if (MF.Created) {
		MF.Element.oninput = (_event: any) => {
			KDModelListFilter = ElementValue("KDModelListFilter");
			if (KDModelList_Categories_index == 0) {
				KDModelList_Categories_index = 1;
			}
			//KDUpdateModelList(1);
			KDUpdateModelList(2, C);
			KDUpdateModelList(3, C);
			KDModelList_Sublevel_index = -1;
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
	// Draw each row
	let mainCat = KDModelList_Categories[KDModelList_Categories_index];
	for (let i = 0; i < KDModelListMax; i++) {

		let index_cat = i + KDModelList_Categories_viewindex.index;
		let category = KDModelList_Categories[index_cat];
		let index_sub = i + KDModelList_Sublevel_viewindex.index;
		let sublevel = KDModelList_Sublevel[index_sub];
		//if (category)
		DrawButtonKDExScroll("ClickCategory" + i, (amount) => {KDModelList_Categories_viewindex.index += Math.min(5, Math.abs(amount)/buttonHeight) * Math.sign(amount); cullIndex();},
			clickCategory(category, index_cat, sublevel), true, X+0, 100 + buttonSpacing * i, 190, buttonHeight,
			!category ? "" : TextGet("cat_" + category),
			hasCategories[category] ? KDBaseWhite : faded, "",
			undefined, undefined, index_cat != KDModelList_Categories_index, KDButtonColor);


		let index_top = i + KDModelList_Toplevel_viewindex.index;
		let toplevel = KDModelList_Toplevel[index_top];
		//if (toplevel)
		DrawButtonKDExScroll("ClickToplevel" + i, (amount) => {KDModelList_Toplevel_viewindex.index += Math.min(5, Math.abs(amount)/buttonHeight) * Math.sign(amount); cullIndex();},
			KDCategoryFilterSpecialTopClick[mainCat] ?
					KDCategoryFilterSpecialTopClick[mainCat](C, toplevel, index_top, toplevel)
					: clickToplevel(toplevel, index_top, sublevel)
		, true, X+220, 100 + buttonSpacing * i, 190, buttonHeight,
			!toplevel ? "" : (HasText("c_" + toplevel) ? TextGet("c_" + toplevel) : TextGet("m_" + toplevel)),
			(KDCurrentModels.get(C).Models.has(toplevel) || hasTopLevel[toplevel]) ? KDBaseWhite : faded, "",
			undefined, undefined, 
			KDCategoryFilterSpecialTopNoBorder[mainCat] ?
				KDCategoryFilterSpecialTopNoBorder[mainCat](C, toplevel, index_top, toplevel)
				: index_top != KDModelList_Toplevel_index, KDButtonColor);



		//if (sublevel) {
		DrawButtonKDExScroll("ClickSublevel" + i, (amount) => {KDModelList_Sublevel_viewindex.index += Math.min(5, Math.abs(amount)/buttonHeight) * Math.sign(amount); cullIndex();},
			KDCategoryFilterSpecialSubClick[mainCat] ?
					KDCategoryFilterSpecialSubClick[mainCat](C, sublevel, index_sub, sublevel)
					: clickSublevel(sublevel, index_sub, sublevel), true, X+440, 100 + buttonSpacing * i, 190, buttonHeight,
			!sublevel ? "" : TextGet("m_" + sublevel),
			KDCurrentModels.get(C).Models.has(sublevel) ? KDBaseWhite : faded, "",
			undefined, undefined, 
			KDCategoryFilterSpecialSubNoBorder[mainCat] ?
				KDCategoryFilterSpecialSubNoBorder[mainCat](C, sublevel, index_sub, sublevel)
				: index_sub != KDModelList_Sublevel_index, KDButtonColor);


		if (!KDSelectedModel && sublevel) {
			if (KDCurrentModels.get(C).Models.has(sublevel)) {
				KDSelectedModel = C.Appearance.find((value) => {
					return value.Model.Name == sublevel;
				})?.Model;
				KDModelList_Sublevel_index = index_sub;
			}
		}
		// KDCurrentModels.get(KinkyDungeonPlayer).Models.has(model) ? KDBaseWhite : "#888888", "");
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
	KDModelList_Toplevel_viewindex.index + KDModelListMax < KDModelList_Toplevel_viewindex.index ? KDBaseWhite : "#888888", KinkyDungeonRootDirectory + "Down.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});

	DrawButtonKDEx("KDModelList_Toplevel_^", (_bdata) => {
		KDModelList_Toplevel_viewindex.index -= 5;
		cullIndex();
		return true;
	}, true, X+220, 100 + buttonSpacing * -1, 200, buttonHeight,
	"",
	KDModelList_Toplevel_viewindex.index > 0 ? KDBaseWhite : "#888888", KinkyDungeonRootDirectory + "Up.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});

	DrawButtonKDEx("KDModelList_Sublevel_V", (_bdata) => {
		KDModelList_Sublevel_viewindex.index += 5;
		cullIndex();
		return true;
	}, true, X+440, 100 + buttonSpacing * KDModelListMax, 200, buttonHeight,
	"",
	KDModelList_Sublevel_viewindex.index + KDModelListMax < KDModelList_Sublevel_viewindex.index ? KDBaseWhite : "#888888", KinkyDungeonRootDirectory + "Down.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});
	DrawButtonKDEx("KDModelList_Sublevel_^", (_bdata) => {
		KDModelList_Sublevel_viewindex.index -= 5;
		cullIndex();
		return true;
	}, true, X+440, 100 + buttonSpacing * -1, 200, buttonHeight,
	"",
	KDModelList_Sublevel_viewindex.index > 0 ? KDBaseWhite : "#888888", KinkyDungeonRootDirectory + "Up.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});



	DrawButtonKDEx("KDModelList_Categories_V", (_bdata) => {
		KDModelList_Categories_viewindex.index += 5;
		cullIndex();
		return true;
	}, true, X+0, 100 + buttonSpacing * KDModelListMax, 200, buttonHeight,
	"",
	(KDModelList_Categories_viewindex.index + KDModelListMax < KDModelList_Categories_viewindex.index) ? KDBaseWhite : "#888888", KinkyDungeonRootDirectory + "Down.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});
	DrawButtonKDEx("KDModelList_Categories_^", (_bdata) => {
		KDModelList_Categories_viewindex.index -= 5;
		cullIndex();
		return true;
	}, true, X+0, 100 + buttonSpacing * -1, 200, buttonHeight,
	"",
	KDModelList_Categories_viewindex.index > 0 ? KDBaseWhite : "#888888", KinkyDungeonRootDirectory + "Up.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});


	cullIndex();

}

function KDCanForcePose(C: Character): boolean {
	return C != KinkyDungeonPlayer;
}

let KDDefaultWardrobePalettes: Record<string, Record<string, LayerFilter>> = {
	"Custom1": {
		Catsuit: {"gamma":1.0166666666666666,"saturation":0,"contrast":0.8833333333333333,"brightness":1.5666666666666669,"red":4.216666666666667,"green":0.7166666666666667,"blue":0.7000000000000001,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":0.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0,"contrast":1.0,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		Highlight: {"gamma":0.6833333333333333,"saturation":0,"contrast":2.55,"brightness":0.41666666666666663,"red":2.5333333333333337,"green":0.7666666666666666,"blue":0.8500000000000001,"alpha":1},
	},
	"Custom2": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1.2,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0980392156862746,"alpha":1},
		Highlight: {"gamma":1.9,"saturation":0,"contrast":1,"brightness":1.5666666666666669,"red":1,"green":1,"blue":1.1,"alpha":1},
	},
	"Custom3": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":0.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0.0,"contrast":1.0,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		Highlight: {"gamma":0.7333333333333334,"saturation":0,"contrast":2.3499999999999996,"brightness":0.8166666666666667,"red":1.7833333333333334,"green":0.9666666666666667,"blue":0.6,"alpha":1},
	},
	"Custom4": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":0.7666666666666666,
			"red":1,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":0.6333333333333334,"saturation":1,"contrast":0.6833333333333333,"brightness":0.6,"red":1.7999999999999998,"green":1.2333333333333334,"blue":1,"alpha":1},
		Highlight: {"gamma":0.6833333333333333,"saturation":0,"contrast":2.55,"brightness":0.41666666666666663,"red":2.5333333333333337,"green":0.7666666666666666,"blue":0.8500000000000001,"alpha":1},
	},
	"Custom5": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":0.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0.0,"contrast":1.0,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		Highlight: {"gamma":0.7333333333333334,"saturation":0,"contrast":2.3499999999999996,"brightness":0.8166666666666667,"red":1.7833333333333334,"green":0.9666666666666667,"blue":0.6,"alpha":1},
	},
	"Custom6": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":0.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0.0,"contrast":1.0,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		Highlight: {"gamma":0.7333333333333334,"saturation":0,"contrast":2.3499999999999996,"brightness":0.8166666666666667,"red":1.7833333333333334,"green":0.9666666666666667,"blue":0.6,"alpha":1},
	},
};


let KDWardrobePreviewRestraints = "";

function KDDrawSubmeshEditor() {
	let CF = KDTextField("KDSubmesh", 10, 60, 480, 30, 
		undefined, undefined, "300");
	if (CF.Created) {
		SubmeshEditorBuffer = null;
		SubmeshEditorBufferOrig = null;
		ElementValue("KDSubmesh", KDSubmeshChosen);
		CF.Element.oninput = (_event: any) => {
			let value = ElementValue("KDSubmesh");
			try {
				if (value && value != KDSubmeshChosen) {
					KDSubmeshChosen = value;
					SubmeshEditorBuffer = null;
		SubmeshEditorBufferOrig = null;
				}
			} catch (err) {
				console.log("Invalid filter");
			}

		};
	}
}

function KDDrawWardrobe(_screen: string, Character: Character) {
	if (KDOutfitInfo.length == 0) KDRefreshOutfitInfo();

	let C = Character || KinkyDungeonPlayer;

	if (KDDebugMode) {
		DrawButtonKDEx("togglewireframeeditor", 
			() => {
				KDSubmeshEditor = !KDSubmeshEditor;
				SubmeshEditorBuffer = null;
				SubmeshEditorBufferOrig = null;
				return true;
			}, true, 510, 5, 100, 40, "Submesh Editor", KDBaseWhite);
		let II = 0;
		let debugspacing = 110;
		if (KDShowCharacterPalette) DrawButtonKDEx("fliplayerbonus", 
		() => {
			if (C) {
				
				KDChangeWardrobe(C);
				for (let model of C.Appearance) {
					if (model.Properties) {
						for (let entry of Object.entries(model.Properties)) {
							if (entry[1].LayerBonus)
								model.Properties[entry[0]].LayerBonus *= -1;
						}
					}
						
				}
				KDUpdateChar(C);
				if (KDCurrentModels.get(C)) {
					KDCurrentModels.get(C).Update.clear();
				}
			}
			return true;
		}, true, 510 + debugspacing * ++II, 5, 100, 40, "Flip lyrbonus", KDBaseWhite);
		if (KDSubmeshEditor) {
			KDDrawSubmeshEditor();
		}
		if (SubmeshEditorBufferOrig && SubmeshEditorBuffer)
			DrawButtonKDEx("exportwireframediff", 
				() => {
					let data = [...SubmeshEditorBuffer].map((a, index) => {
						return a - KDTemplateEmptyMesh[index];
					});
					console.log(data);
					return true;
				}, true, 605, 5, 100, 40, "Print SM to console", KDBaseWhite);
		if (KDSubmeshEditor) {
			KDDrawSubmeshEditor();
		}
	}

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
	DrawCharacter(C, 
		250 - 250 * KDCharSize , 
					0.5*PIXIHeight - 0.5 * PIXIHeight * KDCharSize + (1 - KDCharSize) * PIXIHeight*0.27, KDCharSize, undefined, undefined, undefined, undefined, undefined, C == KinkyDungeonPlayer ? KDToggles.FlipPlayer : false);

	KDTextField("KDOutfitName", 25, 5, 450, 30);
	if (!ElementValue("KDOutfitName")) {
		ElementValue("KDOutfitName", KDOutfitInfo[KDCurrentOutfit]);
	}
	if (KDShowCharacterPalette) {
		KDCurrentCharacterPalettes = KDGetPalettes(C, true, true, 
			C == KinkyDungeonPlayer ? KDDefaultWardrobePalettes : (
				(KinkyDungeonPlayer.metadata?.customColors) ? Object.assign(Object.assign({}, KDDefaultWardrobePalettes), 
				KinkyDungeonPlayer.metadata.customColors) : KDDefaultWardrobePalettes
			)
		);

		
		
		
		let YY = 55
		let size = 48;
		let spacing = 50;
		DrawCheckboxKDEx("HideArmorWardrobe", () => {
			KDToggles.HideArmorWardrobe = !KDToggles.HideArmorWardrobe;
			KDSaveToggles();
			KDRefreshCharacter.set(C, true);
			KDDressWardrobeChar(C);
			return true;
		}, true, 750, YY, size, size,
		TextGet("KDVisualOpt_HideArmorWardrobe"), KDToggles.HideArmorWardrobe, false, KDBaseWhite, undefined, {
			maxWidth: 350,
			fontSize: 24,
			scaleImage: true,
		}); YY += spacing;
		YY = 55
		size = 30;
		spacing = 32;
		let previewTypes = ["Latex", "Leather", "Metal", "Rope"];
		for (let preview of previewTypes) {
			DrawCheckboxKDEx("PreviewRestraints" + preview, () => {
				if (KDWardrobePreviewRestraints == preview) {
					KDWardrobePreviewRestraints = "";
				} else {
					KDWardrobePreviewRestraints = preview;
				}
				KDRefreshCharacter.set(C, true);
				KDDressWardrobeChar(C);
				return true;
			}, true, 1150, YY, size, size,
			TextGet("KDVisualOpt_PreviewRestraints_" + preview), KDWardrobePreviewRestraints == preview, 
			false, KDBaseWhite, undefined, {
				maxWidth: 350,
				fontSize: Math.max(24, size/2),
				scaleImage: true,
			}); YY += spacing;
		}




		let selectedPalette = C.metadata?.palette || C.Palette || "";
		let palette = GetPalette(C, selectedPalette, false, true);
		let palettelayer = KDSelectedPaletteLayer;
		let pid = C.ID + "_";

		let pp = JSON.parse(JSON.stringify(KDCurrentCharacterPalettes));

		// reorganize so custom stuff is always sorted alpha
		let customPalettes = Object.keys(pp).filter((p) => {
			return !!KDDefaultWardrobePalettes[p];
		});
		if (customPalettes.length > 0) {
			customPalettes = customPalettes.sort();
			let temp = customPalettes.map((key) => {return {_1: key, _2:KDCurrentCharacterPalettes[key] || KDDefaultWardrobePalettes[key]};});
			for (let p of customPalettes) {
				delete pp[p];
			}
			for (let p of temp) {
				pp[p._1] = p._2;
			}
		}
	
		KDDrawCustomPalettes(pp, pid,
			750, 200, KDPaletteWidth, 72, 
			selectedPalette, (pal) => {
			C.Palette = pal;
			if (!C.metadata) {
				C.metadata = DefaultOutfitMetadata();
			}
			C.metadata.palette = pal;
			KDRefreshCharacter.set(C, true);
			KDDressWardrobeChar(C);

		}, "KDSetCharacterPalette");

		let temporary = !palette;
		if (temporary && !palette && selectedPalette) {
			// le funni
			// temporarily make a palette and delete at end of the frame
			palette = KDGetPalettes(C, true, true)[selectedPalette];
			if (!C.metadata) {
				C.metadata = DefaultOutfitMetadata();
			}
			if (!C.metadata.customColors) C.metadata.customColors = {};
			C.metadata.customColors[selectedPalette] = palette;
		}
		let temporaryNoLayer = false;
		if (palette) {
			temporaryNoLayer = !palette[palettelayer];
			if (temporaryNoLayer && palette) {
				// le funni
				// temporarily make a palette and delete at end of the frame
				let palettetemp = KDGetPalettes(undefined, true, true)[selectedPalette];
				if (palettetemp) {
					palette[palettelayer] = palettetemp[palettelayer];
				}
				
			}
		}
		
		if (palette && selectedPalette) {

			
			let top = 100;
			let X = 1625;
			let res = KDDrawColorPicker("Default", palettelayer, palette[palettelayer], palette, 
				top, X,
				300);
				
			DrawButtonKDEx("tab_ColorPickerSimple", (_b) => {
				KDToggles.SimpleColorPicker = true;
				KDPropsSlider = false;
				return true;
			}, true, X - 200, res.YY + 20, 240, 30, TextGet("KDColorPickerSimple"), KDBaseWhite, undefined, undefined, undefined,
			KDPropsSlider || !KDToggles.SimpleColorPicker, KDButtonColor);
			DrawButtonKDEx("tab_ColorPickerAdvanced", (_b) => {
				KDToggles.SimpleColorPicker = false;
				KDPropsSlider = false;
				return true;
			}, true, X - 200 + 250, res.YY + 20, 240, 30, TextGet("KDColorPickerAdvanced"), KDBaseWhite, undefined, undefined, undefined,
			KDPropsSlider || KDToggles.SimpleColorPicker, KDButtonColor);
			
			DrawButtonKDEx("KDResetAllLayers", (_bdata) => {
				if (C.metadata?.customColors[selectedPalette]) {
					delete C.metadata.customColors[selectedPalette];
					delete KDCurrentCharacterPalettes[selectedPalette];
					KDRefreshCharacter.set(C, true);
					KDDressWardrobeChar(C);
					

				}
				return true;
			}, true, X + 300/2 + 10, top - 40, 300/2 - 10, 30, 
			TextGet("KDResetAllLayers"), KDTextWhite);


			DrawBoxKD(1625 - 225, top - 50, 350 + 200, res.YY - top + 125, KDButtonColor, false, 0.5, -10);
			
			let spacing = 64;
			let yyColor = top - 50 + (res.YY - top + 100) / 2 - spacing/2*GenericPaletteLayers.length;
			let xxColor = 1625 - 215;
			
			let ii = 0;
			for (let col of GenericPaletteLayers) {
				let sprite = GenericPaletteLayerSprites[col] || GenericPaletteLayerSprites.DarkNeutral;

				DrawButtonKDEx("paletteLayer" + col, 
					() => {
						KDSelectedPaletteLayer = col;
						return true;
					}, 
					true, xxColor, yyColor, 200, 60, TextGet("KDPaletteLayer_" + col), 
					KDTextWhite, sprite, undefined, undefined, col != KDSelectedPaletteLayer, 
					KDButtonColor, undefined, true, {
						// @ts-ignore
						filters: KDPIXIPaletteFilters.get(pid + selectedPalette) ? KDPIXIPaletteFilters.get(pid + selectedPalette)[ii++] : undefined,
					});

				yyColor += spacing;
			}
			
			if (CommonTime() > lastFastPaletteUpdate + 200) {
				lastFastPaletteUpdate = CommonTime();
				if (KDPIXIPaletteFilters.has(pid + selectedPalette))
					KDPIXIPaletteFilters.delete(pid + selectedPalette)

				
				if (C.metadata?.customColors)
					for (let palette in C.metadata.customColors) {
						// finally update
						KDCurrentCharacterPalettes[palette] = C.metadata.customColors[palette];
					}
			}
			
			if (res.updated) {
				if (KDPIXIPaletteFilters.has(pid + selectedPalette))
					KDPIXIPaletteFilters.delete(pid + selectedPalette)
				if (!C.metadata) {
					C.metadata = DefaultOutfitMetadata();
				}
				if (palette && Object.values(palette).length > 0) {
					if (!C.metadata.customColors) C.metadata.customColors = {};
					if (!C.metadata.customColors[selectedPalette]) 
						C.metadata.customColors[selectedPalette] = KDCurrentCharacterPalettes[selectedPalette] || {};
					C.metadata.customColors[selectedPalette][palettelayer] = palette[palettelayer];
				} else {
					delete C.metadata.customColors[selectedPalette];
					delete KDCurrentCharacterPalettes[selectedPalette];
				}
				for (let palette in C.metadata.customColors) {
					// finally update
					KDCurrentCharacterPalettes[palette] = C.metadata.customColors[palette];
				}
				KDRefreshCharacter.set(C, true);
				KDDressWardrobeChar(C);
			};
		}
		if (temporary || temporaryNoLayer) {
			if (palette && Object.values(palette).length == 0) {
				delete C.metadata.customColors[selectedPalette];
				delete KDCurrentCharacterPalettes[selectedPalette];
			}
		}
		
			
	} else {
		KDSelectedPaletteLayer = "Highlight";
		KDCurrentCharacterPalettes = null;
		KDDrawModelList(720, C);
	}

	DrawBoxKD(1025, 710, 950, 285, KDButtonColor, false, 0.5, -10);
	if (KDPlayerSetPose) {
		KDDrawPoseButtons(C, 1050, undefined, undefined, undefined, KDCanForcePose(C));
	} else {
		DrawTextFitKD(TextGet("KDQuickColor"), 1050, 735, 250, KDBaseWhite, KDTextGray0, undefined, "left");
		KDDrawSavedColors(1060, 760, KDSavedColorCount, C);
	}
	DrawButtonKDEx("SetPose", (_bdata) => {
		KinkyDungeonTargetTile = null;
		KinkyDungeonTargetTileLocation = "";
		KDPlayerSetPose = !KDPlayerSetPose;
		KDModalArea = false;
		return true;
	}, true, 715, 765, 240, 50, TextGet("KDChangePose"), KDBaseWhite,
	KinkyDungeonRootDirectory + "Poses/SetPose.png", "", false, false,
		KDPlayerSetPose ? KDTextGray3 : KDButtonColor, undefined, true);


	DrawButtonKDEx("ToggleXray", (_bdata) => {
		KDToggleXRay += 1;
		if (KDToggleXRay > (StandalonePatched ? 2 : 1)) KDToggleXRay = 0;

		KDRefreshCharacter.set(KinkyDungeonPlayer, true);
		KinkyDungeonDressPlayer(C, false, true);
		return true;
	}, true, 715, 820, 240, 50, TextGet("KDXRay"), KDBaseWhite,
	KinkyDungeonRootDirectory + "UI/XRay" + KDToggleXRay + ".png", "", false, false,
		KDToggleXRay ? KDTextGray3 : KDButtonColor, undefined, true);



	let palette = C.metadata?.palette || C.Palette;
	let o = {
	};

	if (palette && GetPalette(C, palette)) {
		o['filters'] = [
			new PIXI.filters.AdjustmentFilter(GetPalette(C, palette).Highlight),
		];
	}


	DrawButtonKDEx("SetPalette", (_bdata) => {
		KDShowCharacterPalette = !KDShowCharacterPalette;
		KDRefreshCharacter.set(C, true);
		KDDressWardrobeChar(C);
		return true;
	}, true, 715, 875, 240, 50, TextGet("KDSetPalette"), KDBaseWhite,
	KinkyDungeonRootDirectory + "UI/SetPalette.png", "", false, false,
	undefined, undefined, true, o);


	DrawButtonKDEx("BackupOutfit", (_bdata) => {
		downloadFile((ElementValue("savename") || KDOutfitInfo[KDCurrentOutfit] || "Outfit") + KDOUTFITBACKUP,
			LZString.compressToBase64(CharacterAppearanceStringify(C || KinkyDungeonPlayer,
				KDGetCharMetadata(C || KinkyDungeonPlayer)
			)));
		return true;
	}, true, 715, 930, 115, 50, TextGet("KDBackupOutfits"), KDBaseWhite,
	KinkyDungeonRootDirectory + "UI/Safe.png", "", false, false,
	undefined, undefined, true);

	DrawButtonKDEx("RestoreOutfit", (_bdata) => {
		getFileInput(KDLoadOutfitDirect, C);
		return true;
	}, true, 835, 930, 115, 50, TextGet("KDLoadOutfits"), KDBaseWhite,
	KinkyDungeonRootDirectory + "UI/Restore.png", "", false, false,
	undefined, undefined, true);

	if (KDShowCharacterPalette) {
		// nyet
	} else {
		if (KDSelectedModel) {
			KDDrawColorSliders(1625, 100, C, KDSelectedModel);
		} else {
			KDCurrentLayer = "";
			KDCurrentLayerOrig = "";
			KDRefreshProps = true;
		}
	}

	// Return anon function anonymously
	let clickButton = (index: number) => {
		return (_bdata: any) => {
			KDSelectedModel = null;
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
				KinkyDungeonDressPlayer(C, true, false, undefined, undefined, undefined, C.metadata?.palette || C.Palette, undefined, 
					true);
				let newOut = DecompressB64(NewOutfit);
				CharacterAppearanceRestore(C, newOut, C != KinkyDungeonPlayer, false);
				let newParsed = JSON.parse(newOut);
				C.metadata = newParsed?.metadata || DefaultOutfitMetadata();
				if (newParsed?.metadata) {
					C.Palette = newParsed.metadata.palette;
				} else C.Palette = "";
				CharacterRefresh(C);
				KDInitProtectedGroups(C);
				KDRefreshCharacter.set(C, true);
				KinkyDungeonDressPlayer(C, true, undefined, undefined, undefined,
					undefined, C.metadata?.palette || C.Palette, true
				);
			} else if (C == KinkyDungeonPlayer) {
				KDGetDressList().Default = KinkyDungeonDefaultDefaultDress;
				CharacterAppearanceRestore(KinkyDungeonPlayer,
					CharacterAppearanceStringify(DefaultPlayer,
						KDGetCharMetadata(DefaultPlayer)
					), false, true);
				CharacterReleaseTotal(KinkyDungeonPlayer);
				KinkyDungeonSetDress("Default", "Default", C, true);
				C.Palette = "";
				C.metadata = DefaultOutfitMetadata();
				KDRefreshCharacter.set(C, true);
				KinkyDungeonDressPlayer();
				KDInitProtectedGroups(KinkyDungeonPlayer);
			}
			return true;
		};
	};

	DrawTextFitKD(TextGet("KDLabelSaved"), 575, 75, 220, KDBaseWhite, KDTextGray0);


	DrawButtonKDEx("KDOutfitSaved_V", (_bdata) => {
		KDMaxOutfitsIndex += 3;
		if (KDMaxOutfitsIndex > KDMaxOutfits-9) KDMaxOutfitsIndex = Math.floor(KDMaxOutfits-9);
		return true;
	}, true, 475, 110 + 50 * (1 + KDMaxOutfitsDisplay), 200, 45,
	"",
	KDModelList_Toplevel_viewindex.index + KDModelListMax < KDModelList_Toplevel_viewindex.index ? KDBaseWhite : "#888888", KinkyDungeonRootDirectory + "Down.png", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		centered: true,
	});

	DrawButtonKDEx("KDOutfitSaved_^^", (_bdata) => {
		KDMaxOutfitsIndex -= 3;
		if (KDMaxOutfitsIndex < 0) KDMaxOutfitsIndex = 0;
		return true;
	}, true, 475, 90, 200, 45,
	"",
	KDModelList_Toplevel_viewindex.index > 0 ? KDBaseWhite : "#888888", KinkyDungeonRootDirectory + "Up.png", undefined, undefined, undefined, undefined,
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
				index == KDCurrentOutfit ? KDBaseWhite : "#888888", "", undefined, undefined, index != KDCurrentOutfit);

	}
	DrawBoxKD(450, 55, 250, 56 + (2+KDMaxOutfitsDisplay) * 50, KDButtonColor,
		false, 0.5, -10);


	DrawTextFitKD(TextGet("KDManageOutfits"), 445 + 520/2, 740, 260, KDBaseWhite, KDTextGray0);
	DrawBoxKD(450, 710, 520, 285, KDButtonColor, false, 0.5, -10);



	DrawButtonKDEx("StripOutfit", (_bdata) => {
		if (KDConfirmType == "strip" && KinkyDungeonReplaceConfirm > 0) {
			KDSelectedModel = null;
			KDChangeWardrobe(C);
			CharacterReleaseTotal(C);
			CharacterNaked(C);
			KDRefreshCharacter.set(C, true);
			if (KDCharacterDress.get(C) != "Bikini") {
				KinkyDungeonSetDress("Bikini", "Bikini", C, true);
			} else
				KinkyDungeonSetDress("None", "None", C, true);
			KinkyDungeonDressPlayer(C, true, false, undefined, undefined, 
				undefined, C.metadata?.palette || C.Palette, undefined, true);
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
	KDBaseWhite, KinkyDungeonRootDirectory + "UI/X.png", undefined, undefined, undefined,
	undefined, undefined, true);
	DrawButtonKDEx("LoadFromCode", (_bdata) => {
		KinkyDungeonState = "LoadOutfit";
		KDSelectedModel = null;


		CharacterReleaseTotal(C || KinkyDungeonPlayer);
		ElementCreateTextArea("saveInputField");
		ElementValue("saveInputField", LZString.compressToBase64(
			AppearanceItemStringify((C || KinkyDungeonPlayer).Appearance)
		));
		return true;
	}, true,465, 875, 240, 50, TextGet("KinkyDungeonDressPlayerImport"),
	KDBaseWhite, KinkyDungeonRootDirectory + "UI/Load.png", undefined, undefined, undefined,
	undefined, undefined, true);

	DrawButtonKDEx("KDWardrobeCancel", (_bdata) => {
		if (KDConfirmType == "revert" && KinkyDungeonReplaceConfirm > 0) {
			KDSelectedModel = null;
			KinkyDungeonReplaceConfirm = 0;

			if (KDWardrobeRevertCallback) KDWardrobeRevertCallback();
			else
				KDRestoreOutfit();
			KDOriginalValue = "";
			return true;
		} else {
			KDConfirmType = "revert";
			KinkyDungeonReplaceConfirm = 2;
            if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/ClickError.ogg");
			return true;
		}
	}, true, 465, 820, 240, 50,
	TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'revert') ?
		"KDWardrobeCancelConfirm" :
		"KDWardrobeCancel"), ((C == KinkyDungeonPlayer && KDOriginalValue) || (KDCanRevertFlag)) ? KDBaseWhite : "#888888",
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
				
                if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/ClickError.ogg");
				return true;
			}
		}, true, 465, 930, 240, 50,
		TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'save') ?
			"KDWardrobeSaveOutfitConfirm" :
			"KDWardrobeSaveOutfit"), KDOriginalValue ? KDBaseWhite : "#888888",
			KinkyDungeonRootDirectory + "UI/Floppy.png", undefined, undefined, undefined,
			undefined, undefined, true);
	} else {
		DrawButtonKDEx("ResetOutfit", (_bdata) => {
			if (KDConfirmType == "reset" && KinkyDungeonReplaceConfirm > 0) {
				KDSelectedModel = null;
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
					/** breaks the link */
					KDRefreshSelectedModel(KDSpeakerNPC);
				}
				return true;
			} else {
				KDConfirmType = "reset";
				KinkyDungeonReplaceConfirm = 2;
				
                if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/ClickError.ogg");
				return true;
			}
		}, true, 465, 930, 240, 50,
		TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'reset') ?
				"KinkyDungeonConfirm" :
				"KinkyDungeonDressPlayerReset"),
		KDBaseWhite,
		KinkyDungeonRootDirectory + "UI/Reset.png", undefined, undefined, undefined,
		undefined, undefined, true);
	}

	if (!Character || Character == KinkyDungeonPlayer) {
		DrawButtonKDEx("KDWardrobeSave", (_bdata) => {
			if (KinkyDungeonPreviousState) {
				KinkyDungeonState = KinkyDungeonPreviousState;
				KinkyDungeonPreviousState = "";
			} else {
				KinkyDungeonState = "Menu";
			}
			KDPlayerSetPose = false;
			KinkyDungeonDressSet();
			return true;
		}, true, 20, 940, 400, 50, TextGet("KDWardrobeSave" + (KinkyDungeonPreviousState || "")), KDBaseWhite, "");
	} else {
		DrawButtonKDEx("KDBackToGame", (_bdata) => {
			KinkyDungeonState = "Game";
			KDPlayerSetPose = false;
			ForceRefreshModelsAsync(C);
			if (KDWardrobeCallback) KDWardrobeCallback();
			KinkyDungeonDressSet(C);
			return true;
		}, true, 20, 942, 400, 50, TextGet("KDBackToGame"), KDBaseWhite, "");

	}


	if (TestMode && C == KinkyDungeonPlayer) {
		DrawButtonKDEx("KDCreateOutfit", (_bdata) => {
			let exportData = [];
			if (C?.Appearance)
				for (let a of C.Appearance) {
					// FIXME: Cosplay is not defined in Model
					if (a.Model && !(KDModelIsProtected(a.Model)) && !a.Model.Restraint && !a.Model['Cosplay']) {
						exportData.push({
							Item: a.Model.Name,
							Group: a.Model.Group || a.Model.Name,
							Color: KDBaseWhite,
							Lost: false,
							Filters: a.Model.Filters,
							Properties: a.Model.Properties,
							factionFilters: a.Model.factionFilters,
						},);
					}
				}
			KinkyDungeonExportWardrobeDataToClipboardOrModal(JSON.stringify(exportData), "KDCreateOutfit")
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
							factionFilters: a.Model.factionFilters || {},
							inheritFilters: false,
						},);
					}
				}
			KinkyDungeonExportWardrobeDataToClipboardOrModal(JSON.stringify(exportData), "KDCreateAlwaysDress")
			return true;
		}, true, 945, 890, 100, 60,
		TextGet("KDCreateAlwaysDress"), "#99ff99", "");

		DrawButtonKDEx("KDCreateExpression", (_bdata) => {

			let exportData: KDExpressionType = {
				BlushPose: KDGetPoseOfType(C, "Blush"),
				EyesPose: KDGetPoseOfType(C, "Eyes"),
				Eyes2Pose: KDGetPoseOfType(C, "Eyes2"),
				MouthPose: KDGetPoseOfType(C, "Mouth"),
				FearPose: KDGetPoseOfType(C, "Fear"),
				BrowsPose: KDGetPoseOfType(C, "Brows"),
				Brows2Pose: KDGetPoseOfType(C, "Brows2"),
			};
			

			KinkyDungeonExportWardrobeDataToClipboardOrModal(JSON.stringify(exportData), "KDCreateFace")
			return true;
		}, true, 845, 710, 100, 60,
		TextGet("KDCreateExpression"), "#99ff99", "");

		DrawButtonKDEx("KDCreateFace", (_bdata) => {
			let exportData = [];
			if (C?.Appearance)
				for (let a of C.Appearance) {
					if (a.Model && KDModelIsProtected(a.Model) && (a.Model.Categories?.includes("Face") && !a.Model.Categories?.includes("Hair") && !a.Model.Categories?.includes("Cosplay"))) {
						exportData.push({
							Item: a.Model.Name,
							Group: a.Model.Group || a.Model.Name,
							Color: KDBaseWhite,
							Lost: false,
							Filters: a.Model.Filters,
							Properties: a.Model.Properties,
							factionFilters: a.Model.factionFilters,
						},);
					}
				}
			KinkyDungeonExportWardrobeDataToClipboardOrModal(JSON.stringify(exportData), "KDCreateFace")
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
							Color: KDBaseWhite,
							Lost: false,
							Filters: a.Model.Filters,
							Properties: a.Model.Properties,
							factionFilters: a.Model.factionFilters,
						},);
					}
				}
			KinkyDungeonExportWardrobeDataToClipboardOrModal(JSON.stringify(exportData), "KDCreateHair")
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
							Color: KDBaseWhite,
							Lost: false,
							Filters: a.Model.Filters,
							Properties: a.Model.Properties,
							factionFilters: a.Model.factionFilters,
						},);
					}
				}
			KinkyDungeonExportWardrobeDataToClipboardOrModal(JSON.stringify(exportData), "KDCreateCosplay")
			return true;
		}, true, 945, 770, 100, 60,
		TextGet("KDCreateCosplay"), "#99ff99", "");


	}

	KDWardrobeToolsDraw(Character);

	KDlastSelectedModel = KDSelectedModel;
}

let KDToolsDisplayPoses = false;


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
	KinkyDungeonDressPlayer(C, true, undefined, undefined, undefined, 
		undefined, C.metadata?.palette || C.Palette, true);


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
								CharacterAppearanceRestore(Char, decompressed, Char == KDSpeakerNPC, Char != KDSpeakerNPC);
								let newParsed = JSON.parse(decompressed);
								if (newParsed && newParsed.metadata) {
									Char.metadata = newParsed.metadata;
									Char.Palette = newParsed.metadata.palette;
								}
								CharacterRefresh(Char);
								KDOldValue = str;
								KDInitProtectedGroups(Char);
								KinkyDungeonDressPlayer(Char, true, undefined, undefined, 
									undefined, undefined, Char.metadata?.palette || Char.Palette, true);

								if (Char.Appearance.length == 0)
									throw new DOMException();
							} catch (e) {
								Char.Appearance = origAppearance;
								/** breaks the link */
								KDRefreshSelectedModel(Char);
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
	let meta = C.metadata || DefaultOutfitMetadata();
	meta.palette = C.metadata?.palette || C.Palette;
	meta.name = C.metadata?.name || C.Name;
	return meta;
}


function KDDrawWardrobeToolsButtons(X, Y, C, Model) {
	//Hardocded numbers, check if they've been changed in the future updates in KDDrawColorSliders();
	let YY = Y;
	let yOff = KDDebugMode ? -80 : -40;
	let width = 300;
	if (Model && KDPropsSlider) {
		//Pivot-to-Mouse button
		DrawButtonKDEx("KDWToolsButton1", (bdata) => {
			KDWToolsPivotAimEnabled = !KDWToolsPivotAimEnabled;
			KDWToolsPivotAim2 = false;
			return true;
			}, true, X + width/2 + 10, YY + yOff, 30, 30, undefined, KDBaseWhite, "Game/UI/Aim.png",
			undefined, false, false, KDWToolsPivotAimEnabled ? KDBorderColor : KDButtonColor,
			undefined, undefined, {hotkeyPress: KDHotkeyToText('ControlLeft')});
		//Grab toggle button
		DrawButtonKDEx("KDWToolsButton2", (bdata) => {
			KDWToolsDraggingEnabled = !KDWToolsDraggingEnabled;
			return true;
			}, true, X + 3*width/4 - 10, YY + yOff, 30, 30, undefined, KDBaseWhite,
			"Game/UI/Grab" + (KDWToolsDraggingEnabled ? "Closed" : "Open") + ".png",
			undefined, false, false, KDWToolsDraggingEnabled ? KDBorderColor : KDButtonColor);
		//Reserved button
		DrawButtonKDEx("KDWToolsButton3", (bdata) => {
			KDWToolsDrawSettingsMenuEnabled = !KDWToolsDrawSettingsMenuEnabled;
			return true;
			}, true, X + width - 30, YY + yOff, 30, 30, undefined, KDBaseWhite, "Game/UI/Wrench.png",
			undefined, false, false, KDWToolsDrawSettingsMenuEnabled ? KDBorderColor : KDButtonColor);

		//Tooltips
		for (let i = 1; i <= 3; i++)
			if (MouseInKD("KDWToolsButton" + i))
				DrawTextFitKD(TextGet("KDWToolsButton" + i), X + 3*width/4 + 5,
			YY + yOff - 15, width/2 + 50, KDBaseWhite, KDTextGray0);

		//Settings menu
		if(KDWToolsDrawSettingsMenuEnabled)
			KDWToolsDrawSettingsMenu(X, Y, C, Model, width);
	}
}


function KDWardrobeToolsDraw(C: Character) {
	if (!C) C = KinkyDungeonPlayer;

	if (KDSelectedModel) {
		if (!KDSelectedModel.Properties) KDSelectedModel.Properties = {};
		if (!KDSelectedModel.Properties[KDCurrentLayer] &&
			(KDWToolsDraggingRefresh || KDWToolsPivotAimRefresh)
		)
			KDSelectedModel.Properties[KDCurrentLayer] = Object.assign({}, KDProps);
		let CurrentLayer = KDSelectedModel.Properties[KDCurrentLayer]
		if (CurrentLayer && KDSelectedModel.Layers[KDCurrentLayerOrig]) {
			let parent = "";
			let l = LayerLayer(KDCurrentModels.get(C),
				KDSelectedModel.Layers[KDCurrentLayerOrig],
				KDSelectedModel,
				[]);
			if (LayerProperties[l]) parent = LayerProperties[l].Parent;
			else parent = "Torso";
			if (KDWToolsPivotAimRefresh) {

				CenterPivotToMouse(C, CurrentLayer, parent);
			}
			if (KDWToolsDraggingRefresh)
				ApplyDragDisplacement(C, CurrentLayer, parent);

			KDWToolsDrawPivotPoint(C, CurrentLayer, parent);
			return true;
		}
	}
	KDWToolsPivotAimRefresh = false;
}


//Pivot positioning
//Two flags are required because the first one is caught by the button itself.
let KDWToolsPivotAimEnabled = false;
let KDWToolsPivotAim2 = false;
let KDWToolsPivotAimRefresh = false;


//Set pivot location to the mouse pointer
function CenterPivotToMouse(C: Character, CurrentLayer: LayerPropertiesType, Parent?: string) {
	let Zoom = KDCharSize;
	//Translate Mouse coordinates to canvas coordinates


	let roundAmt = 100;

	//Round to two decimal places
	let XScale = Math.round((parseFloat('' + CurrentLayer.XScale) || 1)*roundAmt)/roundAmt;
	let YScale = Math.round((parseFloat('' + CurrentLayer.YScale) || 1)*roundAmt)/roundAmt;
	let XOffset = Math.round((parseFloat('' + CurrentLayer.XOffset) || 0)*roundAmt)/roundAmt;
	let YOffset = Math.round((parseFloat('' + CurrentLayer.YOffset) || 0)*roundAmt)/roundAmt;
	let XPivot = Math.round((parseFloat('' + CurrentLayer.XPivot) || 0)*roundAmt)/roundAmt;
	let YPivot = Math.round((parseFloat('' + CurrentLayer.YPivot) || 0)*roundAmt)/roundAmt;

	let Rotation = (Math.PI / 180) *
		(parseFloat('' + CurrentLayer.Rotation) || 0);

	let X_Pivot = MouseX;
	let Y_Pivot = MouseY;

	//X_Pivot += pmx * Math.cos(Rotation) - pmy * Math.sin(Rotation);
	//Y_Pivot += pmy * Math.cos(Rotation) + pmx * Math.sin(Rotation);

	//if (KDToggles.FlipPlayer) X_Pivot = MODELWIDTH - X_Pivot;

	//Consider offsets from poses (like hogtie)
	/*let {X_Offset, Y_Offset} = ModelGetPoseOffsets(KDCurrentModels.get(C).Poses, KDToggles.FlipPlayer);
*/


	// Do some magical transformation of coordinates
	// Its now offset
	//X_Pivot = ox + dox * Math.cos(-Rotation) - doy * Math.sin(-Rotation);
	//Y_Pivot = oy + doy * Math.cos(-Rotation) + dox * Math.sin(-Rotation);

	let {x, y, angle} = GetModelLocInverse(C, KDPlayerPos().x, KDPlayerPos().y, Zoom, {
		Angle: 0,
		Parent: Parent || "Torso",
		X: X_Pivot,
		Y: Y_Pivot,
	}, KDToggles.FlipPlayer);
	let XX_Offset = x;
	let YY_Offset = y;

	// Rotation mod from poses
	//let {rotation, X_Anchor, Y_Anchor} = ModelGetPoseRotation(KDCurrentModels.get(C).Poses);
	// let angle = rotation * Math.PI / 180;
	// if (KDToggles.FlipPlayer) angle = -angle;
	// let XX_Pivot =  X_OFFSET_POSE * Math.cos(angle) - Y_OFFSET_POSE * Math.sin(angle);
	// let YY_Pivot =  Y_OFFSET_POSE * Math.cos(angle) + X_OFFSET_POSE * Math.sin(angle);


	KDChangeWardrobe(C);

	let pdx = 1/XScale * (XX_Offset-XOffset);
	let pdy = 1/YScale * (YY_Offset-YOffset);
	//Keep relative offsets
	CurrentLayer.XPivot = Math.round((XPivot +
		pdx * Math.cos(-Rotation) - pdy * Math.sin(-Rotation)
	)*roundAmt)/roundAmt;
	CurrentLayer.YPivot = Math.round((YPivot +
		pdy * Math.cos(-Rotation) + pdx * Math.sin(-Rotation)
	)*roundAmt)/roundAmt;
	CurrentLayer.XOffset = Math.round((XX_Offset)*roundAmt)/roundAmt;;
	CurrentLayer.YOffset = Math.round((YY_Offset)*roundAmt)/roundAmt;;

	KDCurrentModels.get(C).Models.set(KDSelectedModel.Name, JSON.parse(JSON.stringify(KDSelectedModel)));
	KDRefreshProps = true;

	UpdateModels(C);
	lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
	ForceRefreshModels(C);
	KDWToolsPivotAimRefresh = false;
}

//Draw red circle at the pivot location
function KDWToolsDrawPivotPoint(C: Character, CurrentLayer: LayerPropertiesType, Parent: string) {
	let Zoom = KDCharSize;
	//Transform model coordiantes to screen coordinates
	if (!CurrentLayer.XPivot || !CurrentLayer.YPivot) return;
	let X_Pivot = CurrentLayer.XPivot || 0;
	let Y_Pivot = CurrentLayer.YPivot || 0;
	let X_Offset = CurrentLayer.XOffset || 0;
	let Y_Offset = CurrentLayer.YOffset || 0;
	let Rotation = (Math.PI / 180) *
		(parseFloat('' + CurrentLayer.Rotation) || 0);


	let pox = 0;//Zoom * MODEL_SCALE * (X_Offset - X_Pivot);
	let poy = 0;//Zoom * MODEL_SCALE * (Y_Offset - Y_Pivot);

	//if (KDToggles.FlipPlayer) X_Pivot = (MODELWIDTH + MODEL_XOFFSET * 2 - X_Pivot);

	//Consider offsets from poses (like hogtie)
	let {x, y, angle} = GetModelLoc(C, KDPlayerPos().x, KDPlayerPos().y, Zoom, {
		Angle: 0,
		Parent: Parent || "Torso",
		X: X_Offset,
		Y: Y_Offset,
	}, KDToggles.FlipPlayer);


	//let {X_Offset, Y_Offset} = ModelGetPoseOffsets(KDCurrentModels.get(KinkyDungeonPlayer).Poses, KDToggles.FlipPlayer);

	//let XX_Pivot = X_Pivot + MODELWIDTH * X_Offset * MODEL_SCALE * Zoom;
	//let YY_Pivot = Y_Pivot + MODELHEIGHT * Y_Offset * MODEL_SCALE * Zoom;
	let XX_Pivot = x + pox * Math.cos(0) - poy * Math.sin(0);
	let YY_Pivot = y + poy * Math.cos(0) + pox * Math.sin(0);

	//console.log("WardrobeTools.ks - X_Offset: " + X_Offset);
	//console.log("WardrobeTools.ks - Y_Offset: " + Y_Offset);

	// Rotation mod from poses
	// let {rotation, X_Anchor, Y_Anchor} = ModelGetPoseRotation(KDCurrentModels.get(KinkyDungeonPlayer).Poses);
	// let angle = -rotation * Math.PI / 180;
	// XX_Pivot = X_Pivot * Math.cos(angle) + Y_Pivot * Math.sin(angle);
	// YY_Pivot = Y_Pivot * Math.cos(angle) + X_Pivot * Math.sin(angle);

	//Draw pivot point for the current model layer
	let Radius = 4;
	FillCircleKD(kdcanvas, kdpixisprites, "pivotpoint", {
		Left: XX_Pivot,
		Top: YY_Pivot,
		Radius: Radius,
		Color: "red",
		zIndex: 10,
		alpha: 0.8,
	});
	FillCircleKD(kdcanvas, kdpixisprites, "pivotpointbg", {
		Left: XX_Pivot,
		Top: YY_Pivot,
		Radius: Radius + 2,
		Color: KDBaseWhite,
		zIndex: 9,
		alpha: 0.8,
	});
}

//Grabbable layers
let KDWToolsDraggingEnabled = false;
let KDWToolsIsDraggingNow = false;
let KDWToolsDraggingDelta = {x: 0, y: 0, Scroll: 0, zIndex: 0};
let KDWToolsDraggingRefresh = false;
let KDWToolsDraggingScrollRefresh = false;
let KDWToolsDraggingShiftKey = false;
let KDWToolsDraggingCtrlKey = false;


window.addEventListener('click', function(event) {
	if (KinkyDungeonState != 'Wardrobe') return;
	if (KDWToolsPivotAimEnabled) {
		if (KDWToolsPivotAim2) {
			KDWToolsPivotAimRefresh = true;
			KDWToolsPivotAimEnabled = false;
			KDWToolsPivotAim2 = false;
			KDRefreshProps = true;
		} else KDWToolsPivotAim2 = true;
	}
});

window.addEventListener('mousedown', function(event) {
	if (KinkyDungeonState != 'Wardrobe') return;
	//console.log("WardrobeTools.ks - KDWToolsDraggingEnabled: "+KDWToolsDraggingEnabled);
	if (KDWToolsDraggingEnabled && MouseIn(0, 0, 500, 1000) && KDCurrentLayer) {
		KDWToolsIsDraggingNow = true;
		KDWToolsDraggingDelta.zIndex = 0;
	}
});

window.addEventListener('mousemove', function(event) {
	if (KinkyDungeonState != 'Wardrobe') return;
	//console.log("WardrobeTools.ks - KDWToolsIsDraggingNow: "+KDWToolsIsDraggingNow);
	//console.log("WardrobeTools.ks - KDWToolsDraggingDelta: "+KDWToolsDraggingDelta);
	if (KDWToolsDraggingEnabled && KDWToolsIsDraggingNow) {
		//scaled to the window size
		KDWToolsDraggingDelta.x += event.movementX * CanvasWidth / PIXICanvas.clientWidth;
		KDWToolsDraggingDelta.y += event.movementY * CanvasHeight / PIXICanvas.clientHeight;
		KDWToolsDraggingRefresh = true;
	}
});

window.addEventListener('mouseup', function(event) {
	if (KinkyDungeonState != 'Wardrobe') return;
	//console.log("WardrobeTools.ks - KDWToolsDraggingDelta: "+KDWToolsDraggingDelta);
	if (KDWToolsDraggingEnabled && KDWToolsIsDraggingNow) {
		KDWToolsIsDraggingNow = false;
		KDWToolsDraggingDelta.x = 0;
		KDWToolsDraggingDelta.y = 0;
		KDWToolsDraggingLazyRefresh = 0;
		KDRefreshProps = true;
	}
});


window.addEventListener('wheel', function(event) {
	if (KinkyDungeonState != 'Wardrobe') return;
	if ((MouseOverChar())) {
		KDWToolsDraggingDelta.Scroll += event.deltaY > 0 ? -1 : event.deltaY < 0 ? 1 : 0;
		KDWToolsDraggingShiftKey = event.shiftKey;
		KDWToolsDraggingCtrlKey = event.ctrlKey;
		KDWToolsDraggingRefresh = true;
		KDWToolsDraggingScrollRefresh = true;
	}
});

let KDWToolsDraggingLazyRefresh = 0;

//Calculations of properties while drag-moving
function ApplyDragDisplacement(C, CurrentLayer, Parent: string) {
	let Zoom = KDCharSize;
	let X_OFFSET = (KDToggles.FlipPlayer ? -1 : 1) * (KDWToolsDraggingDelta.x / (MODEL_SCALE * Zoom));
	let Y_OFFSET = KDWToolsDraggingDelta.y / (MODEL_SCALE * Zoom);
	//console.log("WardrobeTools.ks - ApplyDragDisplacement");

	//Consider rotation from poses (like hogtie)

	let {x, y, angle} = GetModelLoc(C, KDPlayerPos().x, KDPlayerPos().y, Zoom, {
		Angle: 0,
		Parent: Parent || "Torso",
		X: 0,
		Y: 0,
	}, false);

	//0  = x=x, y=y
	//90 = x=-y,y=x
	//180= x=-x,y=-y
	//270= x=y, y=-x
	let XX_OFFSET = X_OFFSET * Math.cos(-angle) - Y_OFFSET * Math.sin(-angle);
	let YY_OFFSET = Y_OFFSET * Math.cos(-angle) + X_OFFSET * Math.sin(-angle);

	//Round to two decimal places
	let XOffset = Math.round((parseFloat(CurrentLayer.XOffset) || 0)*100)/100;
	let YOffset = Math.round((parseFloat(CurrentLayer.YOffset) || 0)*100)/100;
	let XPivot = Math.round((parseFloat(CurrentLayer.XPivot) || 0)*100)/100;
	let YPivot = Math.round((parseFloat(CurrentLayer.YPivot) || 0)*100)/100;
	let XScale = Math.round((parseFloat(CurrentLayer.XScale) || 1)*100)/100;
	let YScale = Math.round((parseFloat(CurrentLayer.YScale) || 1)*100)/100;
	let Rotation = Math.round((parseFloat(CurrentLayer.Rotation) || 0)*100)/100;
	let LayerBonus = Math.round((parseFloat(CurrentLayer.LayerBonus) || 0)*100)/100;

	KDChangeWardrobe(C);
	if (XX_OFFSET) {
		CurrentLayer.XOffset = Math.round((XOffset + XX_OFFSET)*100)/100;
		CurrentLayer.XPivot = XPivot;
	}

	if (YY_OFFSET) {
		CurrentLayer.YOffset = Math.round((YOffset + YY_OFFSET)*100)/100;
		CurrentLayer.YPivot = YPivot;
	}
	//CurrentLayer.XPivot = XPivot + X_OFFSET;
	//CurrentLayer.YPivot = YPivot + Y_OFFSET;

	//console.log("WardrobeTools.ks - KinkyDungeonKeybindingCurrentKey: " + KinkyDungeonKeybindingCurrentKey);
	//console.log("WardrobeTools.ks - KDWToolsDraggingShiftKey: " + KDWToolsDraggingShiftKey);
	//console.log("WardrobeTools.ks - KDWToolsDraggingCtrlKey: " + KDWToolsDraggingCtrlKey);
	if (KDWToolsDraggingDelta.Scroll)
	{
		if (KDWToolsToggleScrollMode == "Layer Bonus")
		{
			//fine adjustment with Shift
			if (KDWToolsDraggingShiftKey)
				CurrentLayer.LayerBonus = LayerBonus + KDWToolsDraggingDelta.Scroll
			else {
				//Increment in powers of 10 while keeping the smaller part
				//10501
				// let t = (LayerBonus != 0) ? Math.trunc(Math.sign(LayerBonus) * Math.log10(Math.abs(LayerBonus))) : 0; // 4
				// let tt = (t != 0) ? Math.sign(t) * 10 ** Math.abs(t) : 0 ; // 10000
				// let buf = (tt != 0) ? LayerBonus % tt : 0; // 501
				// t = t + KDWToolsDraggingDelta.Scroll; //5
				// t = (t != 0) ? Math.sign(t) * 10 ** Math.abs(t) : 0 ; // 100000
				let t = ((LayerBonus != 0) ? (Math.trunc(Math.sign(LayerBonus) * Math.log10(Math.abs(LayerBonus)))) : 0);
				// In case current LayerBonus is like 9999 we don't skip a 1000.
				if (Math.abs(LayerBonus) >=  2 * (10 ** Math.abs(t))) t = Math.sign(t) * (Math.abs(t) + 1);
				t = KDWToolsDraggingDelta.Scroll + t;
				CurrentLayer.LayerBonus = (t != 0) ? Math.sign(t) * 10 ** Math.abs(t) : 0; // 501 + 100000 = 100501
			}
		}
		else if (KDWToolsToggleScrollMode == "Rotation")
		{
			//fine adjustment with Shift and Ctrl
			let RotationScale = KDWToolsDraggingCtrlKey ? 0.1 : (KDWToolsDraggingShiftKey ? 1 : 5);
			CurrentLayer.Rotation = Math.round((Rotation + KDWToolsDraggingDelta.Scroll*RotationScale)*100)/100;
		}
		else if (KDWToolsToggleScrollMode == "Scale")
		{
			let tempXScale;
			let tempYScale;
			if (KDWToolsDraggingShiftKey) { 										//floating point hurr durr
				tempXScale = Math.round((XScale + Math.sign(XScale)*KDWToolsDraggingDelta.Scroll/100)*100)/100;
				tempYScale = YScale;
			}
			else if (KDWToolsDraggingCtrlKey) {
				tempXScale = XScale;
				tempYScale = Math.round((YScale + Math.sign(YScale)*KDWToolsDraggingDelta.Scroll/100)*100)/100;
			}
			else {
				tempXScale = Math.round((XScale + Math.sign(XScale)*KDWToolsDraggingDelta.Scroll/100)*100)/100;
				tempYScale = Math.round((YScale + Math.sign(YScale)*KDWToolsDraggingDelta.Scroll/100)*100)/100;
			}
			//Jump over 0 to avoid reset to 1;
			if (tempXScale == 0) tempXScale = -XScale;
			if (tempYScale == 0) tempYScale = -YScale;
			CurrentLayer.XScale = tempXScale;
			CurrentLayer.YScale = tempYScale;
		}
	}
	KDWToolsDraggingDelta.x = 0;
	KDWToolsDraggingDelta.y = 0;
	KDWToolsDraggingDelta.Scroll = 0;

	if (KDWToolsDraggingLazyRefresh++ >= 10 || KDWToolsDraggingScrollRefresh) {
		KDRefreshProps = true;
		KDWToolsDraggingLazyRefresh = 0;
	}
	lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
	KDCurrentModels.get(C).Models.set(KDSelectedModel.Name, JSON.parse(JSON.stringify(KDSelectedModel)));
	ForceRefreshModels(C);
	KDWToolsDraggingRefresh = false;
	KDWToolsDraggingScrollRefresh = false;
}

let KDWToolsDrawSettingsMenuEnabled = false;

function KDWToolsDrawSettingsMenu(X, Y, C, Model, Width) {
	Y += 35;
	let zIndex = 150

	DrawBoxKD(X, Y, Width, 520, "rgba(10, 10, 10, 0.5)",
		false, 1, zIndex - 10);

	let fields = KDGetLayerPropFields();
	//Hide property fields
	for (let field in fields) {
		let f = document.getElementById("KDPropField"+field);
		// sudo
		//@ts-ignore
		if (f) f.style = "display: none";
		KDDrawnElements.delete("KDPropField"+field);
	}
	let II = 0;
	KDWToolsDrawOptionEntry(X+5, Y+5 + 45*II++, Width-10, 40, TextGet("KDWToolsToggleScrollModeText") + KDWToolsToggleScrollMode,
		() => {	KDWToolsToggleScrollModeIndex = (KDWToolsToggleScrollModes.length + KDWToolsToggleScrollModeIndex - 1) % KDWToolsToggleScrollModes.length;
				KDWToolsToggleScrollMode = KDWToolsToggleScrollModes[KDWToolsToggleScrollModeIndex];
				localStorage.setItem("WToolsScrollMode", KDWToolsToggleScrollModeIndex + '');
				//console.log("WardrobeTools.ks - KDWToolsToggleScrollMode: " + KDWToolsToggleScrollMode)
				return true;
				},
		() => {	KDWToolsToggleScrollModeIndex = (KDWToolsToggleScrollModeIndex + 1) % KDWToolsToggleScrollModes.length,
				KDWToolsToggleScrollMode = KDWToolsToggleScrollModes[KDWToolsToggleScrollModeIndex]
				localStorage.setItem("WToolsScrollMode", KDWToolsToggleScrollModeIndex + '');
				return true;
				//console.log("WardrobeTools.ks - KDWToolsToggleScrollMode: " + KDWToolsToggleScrollMode)
				},
		zIndex, 0.5);
	KDWToolsDrawOptionEntry(X+5, Y+5 + 45*II++, Width-10, 40, TextGet("KDWToolsLayerAbbrText") + KDWToolsLayerAbbrMode,
		() => {	KDWToolsLayerAbbrModeIndex = (KDWToolsLayerAbbrModes.length + KDWToolsLayerAbbrModeIndex - 1) % KDWToolsLayerAbbrModes.length;
				KDWToolsLayerAbbrMode = KDWToolsLayerAbbrModes[KDWToolsLayerAbbrModeIndex];
				localStorage.setItem("WToolsLayerAbbr", KDWToolsLayerAbbrModeIndex + '');
				//console.log("WardrobeTools.ks - KDWToolsLayerAbbrMode: " + KDWToolsLayerAbbrMode)
				return true;
				},
		() => {	KDWToolsLayerAbbrModeIndex = (KDWToolsLayerAbbrModeIndex + 1) % KDWToolsLayerAbbrModes.length,
				KDWToolsLayerAbbrMode = KDWToolsLayerAbbrModes[KDWToolsLayerAbbrModeIndex]
				localStorage.setItem("WToolsLayerAbbr", KDWToolsLayerAbbrModeIndex + '');
				return true;
				//console.log("WardrobeTools.ks - KDWToolsLayerAbbrMode: " + KDWToolsLayerAbbrMode)
				},
		zIndex, 0.5);
}

//Draw a horizontal selectable option in the format of "< Label >"
function KDWToolsDrawOptionEntry(X, Y, Width, Height, Label, funcPrev, funcNext, zIndex = undefined, alpha = 0.5) {
	let ArrowWidth = Width*0.1; //in % of Width

	DrawBoxKD(X, Y, Width, Height, KDButtonColor, false, undefined, zIndex - 10);

	//DrawButtonKDEx(name, func, enabled, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, options) {
	DrawButtonKDEx("KDWTools_"+Label+"<", funcPrev, true, X, Y, ArrowWidth, Height, "<", KDBaseWhite,
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, {zIndex: zIndex});

	DrawTextFitKD(Label, X + Width/2, Y + Height/2, Width - ArrowWidth*2, KDBaseWhite, KDBaseBlack, 30, "center", zIndex);

	DrawButtonKDEx("KDWTools_"+Label+">", funcNext, true, X + Width - ArrowWidth, Y, ArrowWidth, Height, ">", KDBaseWhite,
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, {zIndex: zIndex});
}


function KDGetLayerPropFields(): Record<keyof LayerPropertiesType, string> {
	return {
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
		AddPose: ",",
		DontAddPose: ",",
		DisplaceAmount: "1",
		EraseAmount: "1",
		NoLoss: "0",
		HideRestraintsTags: ",",
	};
}

/** TODO */
function KDGetAbbreviations(context?: string) {
	return {
		Right: "R",
		Left: "L",
		Dress: "Drs.",
		Spread: "_Sprd",
		Closed: "_Closed",
		Hogtie: "_HogT",
		Kneel: "_Knl",
		KneelClosed: "_KnlCl",
		Yoked: "_Yoke",
		Free: "_Free",
		Boxtie: "_Box",
		Wristtie: "_Wrst",
		Up: "_Up",
		Crossed: "_Cross",
		Front: "_Front",
	}
}

function KDAbbreviate(str: string, context?: string) {
	let abbreviations = KDGetAbbreviations(context);

	for (let i = 0; i < 1; i++) {
		let found = false;

		for (let entry of Object.entries(abbreviations)) {
			if (str.includes(entry[0])) {
				found = true;
				str = str.replace(entry[0], entry[1]);
			}
		}

		if (!found) break;
	}
	return str;
}

function KDDrawColorPicker(id: string, currentLayerName: string, targetFilter: LayerFilter, targetFilters: Record<string, LayerFilter>, YY: number, X = 0,
	width: number = 300,
	callback_reset?: () => void,
	callback_paste?: (parsed: LayerFilter) => void,
	callback_pastefield?: (parsed: LayerFilter) => void,
	callback_update?: (key: string) => boolean,
	callback_updatewheel?: (r: number, g: number, b: number) => void,
	callback_updateadv?: (key: string) => void,
	callback_textfield?: (r: number, g: number, b: number) => void,
	callback_palette?: (key: string, override: boolean, desaturate: boolean) => void,
	palette?: string,
	/** Required to show the palette picker */
	pid?: string,
	factionFilterDef?: FactionFilterDef,
	debug?: boolean

): {YY: number, updated: boolean} {
	let targ_filter = targetFilter;
	let res = {
		YY: YY,
		updated: false,
	};

	if (DrawButtonKDEx("ResetCurrentLayer", (_bdata) => {
		if (callback_reset) {
			callback_reset();
		} else {
			if (targetFilters && targetFilters[currentLayerName]) {
				delete targetFilters[currentLayerName];
			}
			// Set the rgb value to empty when color is reset
			ElementValue("KDSelectedColor", "");
			KDRefreshProps = true;
			lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
		}
		
		return true;
	}, true, X + width/2 + 10, YY, width/2 - 10, 30, 
	TextGet("KDResetLayer"), KDBaseWhite) && MouseClicked) res.updated = true;



	if (!KDClipboardDisabled) {
		if (debug)
			DrawButtonKDEx("ExportAllLayers", (_bdata) => {
				if (targetFilter) {
					navigator.clipboard.writeText(JSON.stringify(targetFilter));
				}
				return true;
			}, true, X + width/2 + 10, YY - 40, width/2 - 10, 30, TextGet("KDExportAllLayers"), KDBaseMint);

		DrawButtonKDEx("KDCopyLayer", (_bdata) => {
			navigator.clipboard.writeText(JSON.stringify(targ_filter));
			return true;
		}, true, X, YY, width/2 - 10, 30, TextGet("KDCopyLayer"), KDBaseWhite);
		if (DrawButtonKDEx("KDPasteLayer", (_bdata) => {
			navigator.clipboard.readText()
				.then(text => {
					let parsed = JSON.parse(text);
					if (callback_paste) callback_paste(parsed);
					else if (parsed?.red != undefined && parsed.green != undefined && parsed.blue != undefined) {
						// clear object without removing pointer
						for (const prop of Object.getOwnPropertyNames(targetFilter)) {
							delete targetFilter[prop];
						}
						Object.assign(targetFilter, parsed);
					}
				});
			return true;
		}, true, X, YY - 40, width/2 - 10, 30, TextGet("KDPasteLayer"), KDBaseWhite)
		 && MouseClicked) res.updated = true;
	} else {
		let CF = KDTextField("KDCopyFilter", X, YY - 50, width, 30, undefined, undefined, "300", 12);
		if (CF.Created) {
			CF.Element.oninput = (_event: any) => {
				let value = ElementValue("KDCopyFilter");
				try {
					let parsed = JSON.parse(value);
					if (value) {
						if (callback_pastefield) callback_pastefield(parsed);
						else {
							if (!targetFilters[currentLayerName])
								targetFilters[currentLayerName] = Object.assign({}, KDColorSliders);
							if (targetFilters[currentLayerName].alpha < 0.001) targetFilters[currentLayerName].alpha = 0.001;
							targetFilters[currentLayerName].red = parsed.red;
							targetFilters[currentLayerName].green = parsed.green;
							targetFilters[currentLayerName].blue = parsed.blue;
							targetFilters[currentLayerName].gamma = parsed.gamma;
							targetFilters[currentLayerName].brightness = parsed.brightness;
							targetFilters[currentLayerName].alpha = parsed.alpha;
							targetFilters[currentLayerName].contrast = parsed.contrast;
							targetFilters[currentLayerName].saturation = parsed.saturation;
						}
					}
				} catch (err) {
					console.log("Invalid filter");
				}

			};
			CF.Element.onclick = (_event: any) => {
				if (targetFilter) {
					ElementValue("KDCopyFilter", JSON.stringify(targetFilter))
				}
			}
		}
	}


	YY += 60;


	// get the visualbrightness from the color so that the visualbrightness value matches
	// the actual brightness value which should be shown on the slider.
	KDVisualBrightness = rgbToHsl(targ_filter.red/5, targ_filter.green/5, targ_filter.blue/5)[2];


	if (KDToggles.PaletteColorPicker && pid) {
		let ii = -1;
		let selectedLayer = factionFilterDef?.color || "None";
		for (let key of ["None", ...GenericPaletteLayers]) {
			//DrawTextFitKD(TextGet("KDPaletteLayer_" + key), X + width/2, YY, width, KDBaseWhite, KDBaseBlack, 20);
			
			let sprite = GenericPaletteLayerSprites[key] || GenericPaletteLayerSprites.DarkNeutral;

			
			DrawButtonKDEx("paletteLayer" + key, 
				() => {
					lastFilterUpdate = CommonTime();
					if (callback_palette) callback_palette(key, factionFilterDef?.override, factionFilterDef?.desaturate != undefined ? true : undefined);
					
					lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
					return true;
				}, 
				true, X, YY - 15, width, 60, TextGet("KDPaletteLayer_" + key), 
				KDTextWhite, sprite, undefined, undefined, key != selectedLayer, 
				KDButtonColor, undefined, true, {
					// @ts-ignore
					filters: (ii >= 0 && KDPIXIPaletteFilters.get(pid + palette)) ? KDPIXIPaletteFilters.get(pid + palette)[ii++] : undefined,
				});

			
			YY += 61;
		}
		YY += 15;

		DrawCheckboxKDEx("overridePaletteLayer", () => {
			lastFilterUpdate = CommonTime();
			if (callback_palette) callback_palette(selectedLayer, !factionFilterDef?.override, factionFilterDef?.desaturate != undefined ? true : undefined);
			
			lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
			return true;
		}, selectedLayer != "None", 
		X, YY - 15, 50, 50, TextGet("KDWardrobeOverridePaletteLayer"), 
		factionFilterDef?.override, selectedLayer == "None", KDTextWhite, undefined, {
			fontSize: 18,
			maxWidth: 200,
		});

		YY += 60;
		DrawCheckboxKDEx("desaturatePaletteLayer", () => {
			lastFilterUpdate = CommonTime();
			if (callback_palette) callback_palette(selectedLayer, factionFilterDef?.override, factionFilterDef?.desaturate != undefined ? undefined : true);
			
			lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
			return true;
		}, selectedLayer != "None", 
		X, YY - 15, 50, 50, TextGet("KDWardrobeDesaturatePaletteLayer"), 
		!factionFilterDef?.desaturate, selectedLayer == "None", KDTextWhite, undefined, {
			fontSize: 18,
			maxWidth: 200,
		});

		
		YY += 20;

	}
	else if (KDToggles.SimpleColorPicker) {
		let force = false;
		for (let key of ["brightness", "contrast"]) {
			DrawTextFitKD(TextGet("KDColorSlider" + key) + ": " + (Math.round((key == "brightness" ? KDVisualBrightness : (0.2 * targ_filter[key]))*100)/100), X + width/2, YY, width, KDBaseWhite, KDBaseBlack, 20);
			KinkyDungeonBar(X, YY - 15, width, 30, Math.min(100, (key == "brightness" ? KDVisualBrightness : (targ_filter[key]/3))*100), KDColorSliderColor[key] || KDBaseWhite, KDBaseBlack);
			if ((mouseDown) && MouseIn(X, YY - 15, width, 30)) {
				MouseClicked = false;
				if (CommonTime() > lastFilterUpdate + FilterUpdateInterval) {
					lastFilterUpdate = CommonTime();
					res.updated = true;
					if (callback_update) force = force || callback_update(key);
					else {
						if (!targetFilters[currentLayerName])
							targetFilters[currentLayerName] = Object.assign({}, KDColorSliders);
						if (key == 'brightness') {
							KDVisualBrightness = ((MouseX - X) / width);

							force = true;

						} else {
							targetFilters[currentLayerName][key] = ((MouseX - X) / width) * 3;
						}
						let maxNorm = Math.max(1.5, Math.max(
							targetFilters[currentLayerName].red,
							targetFilters[currentLayerName].green,
							targetFilters[currentLayerName].blue,
						));
						let rr = Math.round(Math.min(1, targetFilters[currentLayerName].red /maxNorm) * 255).toString(16);
						if (rr.length == 1) rr = '0' + rr;
						let gg = Math.round(Math.min(1, targetFilters[currentLayerName].green /maxNorm) * 255).toString(16);
						if (gg.length == 1) gg = '0' + gg;
						let bb = Math.round(Math.min(1, targetFilters[currentLayerName].blue /maxNorm) * 255).toString(16);
						if (bb.length == 1) bb = '0' + bb;
						ElementValue("KDSelectedColor", `#${
							rr}${
							gg}${
							bb}`);
						ElementValue("KDCopyFilter", JSON.stringify(targetFilters[currentLayerName]));
					}
					
					lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
				}

			}
			YY += 50;
		}

		let radius = 150;
		if (ElementValue("KDSelectedColor") && targetFilters && targetFilters[currentLayerName]) {
			let hsl = rgbToHsl(
				Math.max(0, Math.min(1, targetFilters[currentLayerName].red/5 || 0)),
				Math.max(0, Math.min(1, targetFilters[currentLayerName].green/5 || 0)),
				Math.max(0, Math.min(1, targetFilters[currentLayerName].blue/5 || 0)),
			);
			let x = radius * hsl[1] * Math.cos(hsl[0] * 2*Math.PI);
			let y = radius * hsl[1] * Math.sin(hsl[0] * 2*Math.PI);


			if (ColorPickerFilterCode[id] != (1 - hsl[2]) + "," + hsl[2]) {
				ColorPickerFilterCode[id] = (1 - hsl[2]) + "," + hsl[2];
				ColorPickerFilter[id].destroy();
				let lumi =
					Math.min(1, 5 * hsl[2]);
				ColorPickerFilter[id] = new PIXI.filters.AdjustmentFilter({
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
						new PIXI.Color(ElementValue("KDSelectedColor")).toNumber() : 0xfffafa,
				});
		} else {
			if (ColorPickerFilterCode[id]) {
				ColorPickerFilterCode[id] = "";
				ColorPickerFilter[id].destroy();
				ColorPickerFilter[id] = new PIXI.filters.AdjustmentFilter({
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
				filters: [ColorPickerFilter[id]],
			});


		let dist = KDistEuclidean(MouseX - (X + radius), MouseY - (YY + radius));
		if ((mouseDown && dist * 0.8 < radius) || force) {
			let hue = Math.max(0, 0.5 + 0.5 * Math.min(1, Math.atan2(
				-MouseY + (YY + radius),
				-MouseX + (X + radius)) / Math.PI));
			let sat = Math.min(1, dist/radius);

			if (force && targetFilters) {
				let hsl = rgbToHsl(
					Math.max(0, Math.min(1, targetFilters[currentLayerName].red/5 || 0)),
					Math.max(0, Math.min(1, targetFilters[currentLayerName].green/5 || 0)),
					Math.max(0, Math.min(1, targetFilters[currentLayerName].blue/5 || 0)),
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
				res.updated = true;

				if (callback_updatewheel) callback_updatewheel(r, g, b);
				else if (targetFilters) {
					if (!targetFilters[currentLayerName])
						targetFilters[currentLayerName] = Object.assign({}, KDColorSliders);
					targetFilters[currentLayerName].red = 5*r/255.0;
					targetFilters[currentLayerName].green = 5*g/255.0;
					targetFilters[currentLayerName].blue = 5*b/255.0;
					targetFilters[currentLayerName].brightness = 1;
					if (targetFilters[currentLayerName].saturation == 1 || !targetFilters[currentLayerName].saturation)
						targetFilters[currentLayerName].saturation = 0;
					let maxNorm = Math.max(1.5, Math.max(
						targetFilters[currentLayerName].red,
						targetFilters[currentLayerName].green,
						targetFilters[currentLayerName].blue,
					));
					let rr = Math.round(Math.min(1, targetFilters[currentLayerName].red/maxNorm) * 255).toString(16);
					if (rr.length == 1) rr = '0' + rr;
					let gg = Math.round(Math.min(1, targetFilters[currentLayerName].green/maxNorm) * 255).toString(16);
					if (gg.length == 1) gg = '0' + gg;
					let bb = Math.round(Math.min(1, targetFilters[currentLayerName].blue/maxNorm) * 255).toString(16);
					if (bb.length == 1) bb = '0' + bb;
					ElementValue("KDSelectedColor", `#${
						rr}${
						gg}${
						bb}`);
					ElementValue("KDCopyFilter", JSON.stringify(targetFilters[currentLayerName]));
				}

				lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
			}
		}

		YY += 300;
	} else {
		for (let key of Object.keys(KDColorSliders)) {
			DrawTextFitKD(TextGet("KDColorSlider" + key) + ": " + (Math.round(targ_filter[key]*100)/100), X + width/2, YY, width, KDBaseWhite, KDBaseBlack, 20);
			KinkyDungeonBar(X, YY - 15, width, 30, targ_filter[key]/5*100, KDColorSliderColor[key] || KDBaseWhite, KDBaseBlack);
			if ((mouseDown) && MouseIn(X, YY - 15, width, 30)) {
				MouseClicked = false;
				if (CommonTime() > lastFilterUpdate + FilterUpdateInterval) {
					lastFilterUpdate = CommonTime();
					res.updated = true;
					if (callback_updateadv) {
						callback_updateadv(key);
					} else {
						if (!targetFilters) targetFilters = {};
						if (!targetFilters[currentLayerName])
							targetFilters[currentLayerName] = Object.assign({}, KDColorSliders);
						targetFilters[currentLayerName][key] = ((MouseX - X) / width) * 5;
						let maxNorm = Math.max(1.5, Math.max(
							targetFilters[currentLayerName].red,
							targetFilters[currentLayerName].green,
							targetFilters[currentLayerName].blue,
						));
						let rr = Math.round(Math.min(1, targetFilters[currentLayerName].red /maxNorm) * 255).toString(16);
						if (rr.length == 1) rr = '0' + rr;
						let gg = Math.round(Math.min(1, targetFilters[currentLayerName].green /maxNorm) * 255).toString(16);
						if (gg.length == 1) gg = '0' + gg;
						let bb = Math.round(Math.min(1, targetFilters[currentLayerName].blue /maxNorm) * 255).toString(16);
						if (bb.length == 1) bb = '0' + bb;
						ElementValue("KDSelectedColor", `#${
							rr}${
							gg}${
							bb}`);
						ElementValue("KDCopyFilter", JSON.stringify(targetFilters[currentLayerName]));
					}
				}
				lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;

			}
			YY += 50;
		}
	}



	YY += 70;

	if (!KDToggles.PaletteColorPicker) {
		DrawTextFitKD(TextGet("KDColorHex"),X + width/2, YY - 40, 300, KDBaseWhite, KDTextGray0, undefined, "center");
		let TF = KDTextField("KDSelectedColor", X - 10, YY - 20, width, 30);
		if (TF.Created || KDSelectedModel != KDlastSelectedModel) {
			TF.Element.oninput = (_event: any) => {
				let value = ElementValue("KDSelectedColor");
				let RegExp = /^#[0-9A-Fa-f]{6}$/i;
	
				if (RegExp.test(value)) {
					let hex = KDhexToRGB(value);
					if (hex) {
						let r = 1.5 * (parseInt(hex.r, 16) / 255.0);
						let g = 1.5 * (parseInt(hex.g, 16) / 255.0);
						let b = 1.5 * (parseInt(hex.b, 16) / 255.0);
						if (callback_textfield) callback_textfield(r, g, b);
						else {
							if (!targetFilters[currentLayerName])
								targetFilters[currentLayerName] = Object.assign({}, KDColorSliders);
							if (targetFilters[currentLayerName].alpha < 0.001) targetFilters[currentLayerName].alpha = 0.001;
							if (KDToggles.SimpleColorPicker) {
								targetFilters[currentLayerName].brightness = 1;
								if (targetFilters[currentLayerName].saturation == 1 || !targetFilters[currentLayerName].saturation)
									targetFilters[currentLayerName].saturation = 0;
							}
							targetFilters[currentLayerName].red = r;
							targetFilters[currentLayerName].green = g;
							targetFilters[currentLayerName].blue = b;
						}
					}
				}
			};
		}
	} else if (!palette) {
		DrawTextFitKD(TextGet("KDPaletteColorPickerInfo"),X + width/2, YY - 10, 
		300, KDBaseWhite, KDTextGray0, 16, "center");
		
	} else {
		DrawTextFitKD(TextGet("KDPaletteColorPickerInfo2"),X + width/2, YY - 10, 
		300, KDBaseWhite, KDTextGray0, 16, "center");
		
	}
	

	res.YY = YY;

	return res;
}


function KDGetPreviewRestraints(preview: string): Record<string, NPCRestraint> {
	return KDWardrobePreviewRestraintsList[preview];
}

function KDDressWardrobeChar(C: Character, forcedress?: boolean) {
	KinkyDungeonCheckClothesLoss = true;
	if (KinkyDungeonState == "Wardrobe" && KDWardrobePreviewRestraints) {
		// show with preview restraints
		let selectedPalette = C.metadata?.palette || C.Palette || "";
		let prevR = KDGetPreviewRestraints(KDWardrobePreviewRestraints);
		KinkyDungeonDressPlayer(C, false, false, 
			prevR, undefined, 
			KDGetNPCRestraintTags(prevR, undefined, undefined, false, false),
			selectedPalette, true);
		return;
	}
	if (C != KDSpeakerNPC || !KDShowCharacterPalette) {
		//let selectedPalette = C.metadata?.palette || C.Palette;
		KinkyDungeonDressPlayer(C, undefined, undefined, undefined,
			undefined, undefined, undefined, !forcedress);
	} else if (KDNPCChar_ID.get(KDSpeakerNPC)) {
		// show with restraints
		//let selectedPalette = C.metadata?.palette || C.Palette;
		KinkyDungeonDressPlayer(KDSpeakerNPC, false, false, 
			KDGameData.NPCRestraints ? KDGameData.NPCRestraints[KDNPCChar_ID.get(KDSpeakerNPC) + ''] : undefined,
		undefined, 
		KDGameData.NPCRestraints
			? KDGetNPCRestraintTags(KDGameData.NPCRestraints[KDNPCChar_ID.get(KDSpeakerNPC) + ''], undefined, undefined, false, false)
			: undefined, undefined, !forcedress);
	}
}

let KDlastSelectedModel: Model = null;

function KinkyDungeonExportWardrobeDataToClipboardOrModal(data: string, title: string = undefined) {
	if (KDClipboardDisabled)
		KinkyDungeonWardrobePopup(data, title)
	else
		navigator.clipboard.writeText(data)
}

function KinkyDungeonWardrobePopup(data: string, title: string = "Wardrobe Data") {
	const id = "kinky-dungeon-wardrobe-export";
	if (document.querySelector(`#${id}`)) {
		return;
	}
	const backdrop = document.createElement("div");
  backdrop.id = id;
  Object.assign(backdrop.style, {
    position: "fixed",
    inset: 0,
    backgroundColor: "#000000a0",
    fontFamily: "'Arial', sans-serif",
    fontSize: "1.8vmin",
    lineHeight: 1.6,
  });

  const modal = document.createElement("div");
  Object.assign(modal.style, {
    position: "absolute",
    display: "flex",
    flexFlow: "column nowrap",
    width: "90vw",
    maxWidth: "1440px",
    maxHeight: "90vh",
    overflow: "hidden",
    backgroundColor: "#282828",
    color: "#fafafa",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    padding: "1rem",
    borderRadius: "2px",
    boxShadow: "1px 1px 40px -8px #ffffff80",
  });
  backdrop.appendChild(modal);

  const heading = document.createElement("h1");
  Object.assign(heading.style, {
    display: "flex",
    flexFlow: "row nowrap",
    alignItems: "center",
    justifyContent: "space-around",
    textAlign: "center",
  });
  heading.appendChild(KinkyDungeonErrorImage("WolfgirlPet"));
  heading.appendChild(KinkyDungeonErrorImage("Wolfgirl"));
  heading.appendChild(KinkyDungeonErrorImage("WolfgirlPet"));
  heading.appendChild(document.createTextNode(HasText(title) ? TextGet(title) : title));
  heading.appendChild(KinkyDungeonErrorImage("WolfgirlPet"));
  heading.appendChild(KinkyDungeonErrorImage("Wolfgirl"));
  heading.appendChild(KinkyDungeonErrorImage("WolfgirlPet"));
  modal.appendChild(heading);

  const hr = document.createElement("hr");
  Object.assign(hr.style, {
    border: `1px solid ${KDBorderColor}`,
    margin: "0 0 1.5em",
  });
  modal.appendChild(hr);

  modal.appendChild(KinkyDungeonErrorPreamble([
    "Your browser doesn't appear to support exporting directly to the clipboard.\n",
    "Here's the data for your outfit, for you to copy to your clipboard. Click on the text below and use Control+C to copy it.",
  ]));

  const pre = document.createElement("pre");
  Object.assign(pre.style, {
    flex: 1,
    backgroundColor: "#1a1a1a",
    border: "1px solid #ffffff40",
    fontSize: "1.1em",
    padding: "1em",
    userSelect: "all",
    overflowWrap: "anywhere",
    overflowX: "hidden",
    overflowY: "auto",
    color: KDBorderColor,
    whiteSpace: "pre-wrap"
  });
  pre.textContent = `${data}`;
  modal.appendChild(pre);

  const buttons = document.createElement("div");
  Object.assign(buttons.style, {
    display: "flex",
    flexFlow: "row wrap",
    justifyContent: "flex-end",
    gap: "1em",
  });
  modal.appendChild(buttons);

  const closeButton = KinkyDungeonErrorModalButton("Close");
  closeButton.addEventListener("click", () => {
    backdrop.remove();
  });
  buttons.appendChild(closeButton);

  document.body.appendChild(backdrop);
}
