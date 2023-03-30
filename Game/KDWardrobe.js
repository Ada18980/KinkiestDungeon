'use strict';


let KDConfirmType = "";
let KinkyDungeonReplaceConfirm = 0;

let KDCurrentOutfit = 0;
let KDMaxOutfits = 10;
let KDMaxOutfitsDisplay = 7;
let KDMaxOutfitsIndex = 0;
let KDOutfitInfo = [];
let KDOutfitStore = {};
let KDOutfitOriginalStore = {};


let KDModelListMax = 13;
let KDModelListViewSkip = 7;


let KDModelList_Categories_index = 0;
let KDModelList_Categories_viewindex = {index: 0};
let KDModelList_Categories = [];
let KDModelList_Toplevel_index = 0;
let KDModelList_Toplevel_viewindex = {index: 0};
let KDModelList_Toplevel = [];
let KDModelList_Sublevel_index = 0;
let KDModelList_Sublevel_viewindex = {index: 0};
let KDModelList_Sublevel = [];

let KDWardrobeCategories = [
	"Uniforms",
	"Suits",
	"Armor",
	"Underwear",
	"Socks",
	"Shoes",
	"Tops",
	"Corsets",
	"Skirts",
	"Pants",
	"Accessories",
	"Hats",
	"Hairstyles",
	"Face",
	"Eyes",
	"Mouth",
	"Body",
];

let KDSelectedModel = null;
/** @type {LayerFilter} */
let KDColorSliders = {
	gamma: 1,
	saturation: 1,
	contrast: 1,
	brightness: 1,
	red: 1,
	green: 1,
	blue: 1,
	alpha: 1,
};
let KDColorSliderColor = {
	red: "#ff5555",
	green: "#55ff55",
	blue: "#5555ff",
};
let KDCurrentLayer = "";

let KDSavedColorCount = 9;
let KDSavedColors = [

];
if (localStorage.getItem("kdcolorfilters")) KDSavedColors = JSON.parse(localStorage.getItem("kdcolorfilters"));
for (let i = 0; i < KDSavedColorCount; i++) {
	KDSavedColors.push(Object.assign({}, KDColorSliders));
}

//KDTextField("MapTileSkin", 1000 - 400 - 100, 150, 200, 60,);

let KDWardrobe_PoseArms = ["Free", "Boxtie", "Wristtie", "Yoked", "Front"];
let KDWardrobe_PoseLegs = ["Spread", "Closed", "Kneel", "Hogtie"];
let KDWardrobe_PoseEyes = EYEPOSES;
let KDWardrobe_PoseEyes2 = EYE2POSES;
let KDWardrobe_PoseBrows = BROWPOSES;
let KDWardrobe_PoseBrows2 = BROW2POSES;
let KDWardrobe_PoseMouth = MOUTHPOSES;
let KDWardrobe_PoseBlush = ["BlushNeutral", ...BLUSHPOSES];
let KDWardrobe_CurrentPoseArms = KDWardrobe_PoseArms[0];
let KDWardrobe_CurrentPoseLegs = KDWardrobe_PoseLegs[0];
let KDWardrobe_CurrentPoseEyes = KDWardrobe_PoseEyes[0];
let KDWardrobe_CurrentPoseEyes2 = KDWardrobe_PoseEyes2[0];
let KDWardrobe_CurrentPoseBrows = KDWardrobe_PoseBrows[0];
let KDWardrobe_CurrentPoseBrows2 = KDWardrobe_PoseBrows2[0];
let KDWardrobe_CurrentPoseMouth = KDWardrobe_PoseMouth[0];
let KDWardrobe_CurrentPoseBlush = KDWardrobe_PoseBlush[0];

function KDInitCurrentPose(blank) {
	KDWardrobe_CurrentPoseArms = blank ? "" : KDWardrobe_PoseArms[0];
	KDWardrobe_CurrentPoseLegs = blank ? "" : KDWardrobe_PoseLegs[0];
	KDWardrobe_CurrentPoseEyes = blank ? "" : KDWardrobe_PoseEyes[0];
	KDWardrobe_CurrentPoseEyes2 = blank ? "" : KDWardrobe_PoseEyes2[0];
	KDWardrobe_CurrentPoseBrows = blank ? "" : KDWardrobe_PoseBrows[0];
	KDWardrobe_CurrentPoseBrows2 = blank ? "" : KDWardrobe_PoseBrows2[0];
	KDWardrobe_CurrentPoseMouth = blank ? "" : KDWardrobe_PoseMouth[0];
	KDWardrobe_CurrentPoseBlush = blank ? "" : KDWardrobe_PoseBlush[0];
}


function KDDrawSavedColors(X, Y, max, C) {
	let spacing = 100;
	let filters = (KDSelectedModel?.Filters ? KDSelectedModel.Filters[KDCurrentLayer] : undefined) || KDColorSliders;

	for (let i = 0; i < max && i < KDSavedColors.length; i++) {
		KDDraw(kdcanvas, kdpixisprites, "SavedColor" + i, KinkyDungeonRootDirectory + "UI/greyColor.png", X + spacing * i, Y, 64, 64, undefined, {
			filters: [
				new __filters.AdjustmentFilter(KDSavedColors[i]),
			]
		});
		DrawButtonKDEx("SavedColorCopy" + i, (bdata) => {
			if (filters && KDSelectedModel) {
				KDSavedColors[i] = Object.assign({}, filters);
				localStorage.setItem("kdcolorfilters", JSON.stringify(KDSavedColors));
			}
			return true;
		}, true, X + spacing * i + 32 - 48, Y + 64, 48, 48, "", "#ffffff", KinkyDungeonRootDirectory + "UI/savedColor_copy.png", undefined, false, true);
		DrawButtonKDEx("SavedColorPaste" + i, (bdata) => {
			if (filters && KDSelectedModel) {
				Object.assign(filters, KDSavedColors[i]);
				KDChangeWardrobe(C);
				if (!KDSelectedModel.Filters) KDSelectedModel.Filters = {};
				KDSelectedModel.Filters[KDCurrentLayer] = Object.assign({}, filters);
				KDCurrentModels.get(C).Models.set(KDSelectedModel.Name, JSON.parse(JSON.stringify(KDSelectedModel)));
			}
			return true;
		}, true, X + spacing * i + 32 + 0, Y + 64, 48, 48, "", "#ffffff", KinkyDungeonRootDirectory + "UI/savedColor_paste.png", undefined, false, true);
	}
}

/**
 *
 * @param {number} X
 * @param {number} Y
 * @param {Character} C
 * @param {Model} Model
 */
function KDDrawColorSliders(X, Y, C, Model) {
	let YY = Y;
	let width = 300;
	let layers = KDGetColorableLayers(Model);
	if (!KDCurrentLayer) KDCurrentLayer = layers[0] || "";

	let filters = (Model.Filters ? Model.Filters[KDCurrentLayer] : undefined) || KDColorSliders;

	DrawButtonKDEx("ResetCurrentLayer", (bdata) => {
		if (Model.Filters && Model.Filters[KDCurrentLayer]) {
			KDChangeWardrobe(C);
			Model.Filters[KDCurrentLayer] = Object.assign({}, KDColorSliders);
			KDCurrentModels.get(C).Models.set(Model.Name, Model);
		}
		return true;
	}, true, X + width/2 + 10, YY, width/2 - 10, 30, TextGet("KDResetLayer"), "#ffffff");

	DrawButtonKDEx("KDCopyLayer", (bdata) => {
		navigator.clipboard.writeText(JSON.stringify(filters));
		return true;
	}, true, X, YY, width/2 - 10, 30, TextGet("KDCopyLayer"), "#ffffff");
	DrawButtonKDEx("KDPasteLayer", (bdata) => {
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


	YY += 60;

	for (let key of Object.keys(KDColorSliders)) {
		DrawTextFitKD(TextGet("KDColorSlider" + key) + ": " + (Math.round(filters[key]*10)/10), X + width/2, YY, width, "#ffffff", "#000000", 20);
		KinkyDungeonBar(X, YY - 15, width, 30, filters[key]/5*100, KDColorSliderColor[key] || "#ffffff", "#000000");
		if ((mouseDown || MouseClicked) && MouseIn(X, YY - 15, width, 30)) {
			KDChangeWardrobe(C);
			if (!Model.Filters) Model.Filters = {};
			if (!Model.Filters[KDCurrentLayer])
				Model.Filters[KDCurrentLayer] = Object.assign({}, KDColorSliders);
			Model.Filters[KDCurrentLayer][key] = (MouseX - X) / width * 5;
			KDCurrentModels.get(C).Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
			ElementValue("KDSelectedColor", `#${
				Math.round(Model.Filters[KDCurrentLayer].red /5 * 255).toString(16)}${
				Math.round(Model.Filters[KDCurrentLayer].green /5 * 255).toString(16)}${
				Math.round(Model.Filters[KDCurrentLayer].blue /5 * 255).toString(16)}`);
		}
		YY += 50;
	}

	let TF = KDTextField("KDSelectedColor", X, YY, width, 30);
	if (TF.Created) {
		TF.Element.oninput = (event) => {
			let value = ElementValue("KDSelectedColor");
			let RegExp = /^#[0-9A-F]{6}$/i;

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
					Model.Filters[KDCurrentLayer].red = r;
					Model.Filters[KDCurrentLayer].green = g;
					Model.Filters[KDCurrentLayer].blue = b;
					KDCurrentModels.get(C).Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
				}
			}
		};
	}
	YY += 60;
	YY = Y;

	for (let l of layers) {
		DrawButtonKDEx("SelectLayer" + l, (bdata) => {
			KDCurrentLayer = l;
			return true;
		}, true, X - 220, YY, 200, 30, TextGet(`l_${Model.Name}_${l}`),
		"#ffffff", undefined, undefined, undefined, KDCurrentLayer != l, KDButtonColor);
		YY += 35;
	}
}

function KDDrawPoseButtons(C, X = 1000, Y = 750, allowRemove = false) {
	let buttonClick = (arms, legs, eyes, eyes2, brows, brows2, blush, mouth, update = true) => {
		return (bdata) => {
			KDWardrobe_CurrentPoseArms = arms || KDWardrobe_CurrentPoseArms;
			KDWardrobe_CurrentPoseLegs = legs || KDWardrobe_CurrentPoseLegs;
			if (allowRemove && eyes == KDWardrobe_CurrentPoseEyes) KDWardrobe_CurrentPoseEyes = "";
			else KDWardrobe_CurrentPoseEyes = eyes || KDWardrobe_CurrentPoseEyes;
			if (allowRemove && eyes2 == KDWardrobe_CurrentPoseEyes2) KDWardrobe_CurrentPoseEyes2 = "";
			else KDWardrobe_CurrentPoseEyes2 = eyes2 || KDWardrobe_CurrentPoseEyes2;
			if (allowRemove && brows == KDWardrobe_CurrentPoseBrows) KDWardrobe_CurrentPoseBrows = "";
			else KDWardrobe_CurrentPoseBrows = brows || KDWardrobe_CurrentPoseBrows;
			if (allowRemove && brows2 == KDWardrobe_CurrentPoseBrows2) KDWardrobe_CurrentPoseBrows2 = "";
			else KDWardrobe_CurrentPoseBrows2 = brows2 || KDWardrobe_CurrentPoseBrows2;
			if (allowRemove && blush == KDWardrobe_CurrentPoseBlush) KDWardrobe_CurrentPoseBlush = "";
			else KDWardrobe_CurrentPoseBlush = blush || KDWardrobe_CurrentPoseBlush;
			if (allowRemove && mouth == KDWardrobe_CurrentPoseMouth) KDWardrobe_CurrentPoseMouth = "";
			else KDWardrobe_CurrentPoseMouth = mouth || KDWardrobe_CurrentPoseMouth;

			if (update) {
				KDCurrentModels.get(C).Poses = KDGeneratePoseArray(
					KDWardrobe_CurrentPoseArms,
					KDWardrobe_CurrentPoseLegs,
					KDWardrobe_CurrentPoseEyes,
					KDWardrobe_CurrentPoseBrows,
					KDWardrobe_CurrentPoseBlush,
					KDWardrobe_CurrentPoseMouth,
					KDWardrobe_CurrentPoseEyes2,
					KDWardrobe_CurrentPoseBrows2,
					//KDGetPoseOfType(C, "Eyes"),
					//KDGetPoseOfType(C, "Brows"),
					//KDGetPoseOfType(C, "Blush"),
					//KDGetPoseOfType(C, "Mouth"),
				);
				UpdateModels(KDCurrentModels.get(C));
			}

			return true;
		};
	};

	let AvailableArms = KDGetAvailablePosesArms(C);
	let AvailableLegs = KDGetAvailablePosesLegs(C);

	let buttonWidth = 52;
	let buttonSpacing = 60;
	let xoff = KDWardrobe_PoseLegs.length % 2 != KDWardrobe_PoseArms.length % 2 ? buttonWidth/2 : 0;
	for (let i = 0; i < KDWardrobe_PoseArms.length; i++) {
		DrawButtonKDEx("PoseArms" + i,
			buttonClick(KDWardrobe_PoseArms[i], KDWardrobe_CurrentPoseLegs, "", "", "", "", "", "", AvailableArms.includes(KDWardrobe_PoseArms[i])),
			true,
			X + i*buttonSpacing, Y + 120, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseArms[i] + ".png",
			undefined, false, KDWardrobe_CurrentPoseArms != KDWardrobe_PoseArms[i], !AvailableArms.includes(KDWardrobe_PoseArms[i]) ? "#ff5555" : KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseLegs.length; i++) {
		DrawButtonKDEx("PoseLegs" + i,
			buttonClick(KDWardrobe_CurrentPoseArms, KDWardrobe_PoseLegs[i], "", "", "", "", "", "", AvailableLegs.includes(KDWardrobe_PoseLegs[i])),
			true,
			X + xoff + i*buttonSpacing, Y + 180, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseLegs[i] + ".png",
			undefined, false, KDWardrobe_CurrentPoseLegs != KDWardrobe_PoseLegs[i], !AvailableLegs.includes(KDWardrobe_PoseLegs[i]) ? "#ff5555" : KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseEyes.length; i++) {
		DrawButtonKDEx("PoseEyes" + i, buttonClick("", "", KDWardrobe_PoseEyes[i]), true, X + i*buttonSpacing, Y, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseEyes[i] + ".png",
			undefined, undefined, KDWardrobe_CurrentPoseEyes != KDWardrobe_PoseEyes[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseEyes.length; i++) {
		DrawButtonKDEx("PoseEyes2" + i, buttonClick("", "", "", KDWardrobe_PoseEyes2[i]), true, X + i*buttonSpacing, Y + 60, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseEyes2[i] + ".png",
			undefined, undefined, KDWardrobe_CurrentPoseEyes2 != KDWardrobe_PoseEyes2[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseBrows.length; i++) {
		DrawButtonKDEx("PoseBrows" + i, buttonClick("", "", "", "", KDWardrobe_PoseBrows[i]), true, X + 400 + i*buttonSpacing, Y, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseBrows[i] + ".png",
			undefined, undefined, KDWardrobe_CurrentPoseBrows != KDWardrobe_PoseBrows[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseBrows2.length; i++) {
		DrawButtonKDEx("PoseBrows2" + i, buttonClick("", "", "", "", "", KDWardrobe_PoseBrows2[i]), true, X + 400 + i*buttonSpacing, Y + 60, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseBrows2[i] + ".png",
			undefined, undefined, KDWardrobe_CurrentPoseBrows2 != KDWardrobe_PoseBrows2[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseBlush.length; i++) {
		DrawButtonKDEx("PoseBlush" + i, buttonClick("", "", "", "", "", "", KDWardrobe_PoseBlush[i]), true, X + 400 + i*buttonSpacing, Y + 120, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseBlush[i] + ".png",
			undefined, undefined, KDWardrobe_CurrentPoseBlush != KDWardrobe_PoseBlush[i], KDButtonColor);
	}
	for (let i = 0; i < KDWardrobe_PoseMouth.length; i++) {
		DrawButtonKDEx("PoseMouth" + i, buttonClick("", "", "", "", "", "", "", KDWardrobe_PoseMouth[i]), true, X + 400 + i*buttonSpacing, Y + 180, buttonWidth, buttonWidth,
			"",
			"#ffffff", KinkyDungeonRootDirectory + "Poses/"+KDWardrobe_PoseMouth[i] + ".png",
			undefined, undefined, KDWardrobe_CurrentPoseMouth != KDWardrobe_PoseMouth[i], KDButtonColor);
	}
}

/**
 * Updates the mopel list, only altering a level if the specified altered level is that low
 * @param {*} level
 */
function KDUpdateModelList(level = 0) {
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
			if (model[1].TopLevel && model[1].Categories?.includes(category)) {
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
				if (model[1].Parent != toplevel && model[0] == toplevel) {
					KDModelList_Sublevel.push(model[0]);
				}
			}
			for (let model of Object.entries(ModelDefs)) {
				if (model[1].Parent == toplevel) {
					KDModelList_Sublevel.push(model[0]);
				}
			}
		}


	}
}

/** Call BEFORE making any changes */
function KDChangeWardrobe(C) {
	try {
		if (!KDOriginalValue)
			KDOriginalValue = LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer));
	} catch (e) {
		// Fail
	}
	UpdateModels(KDCurrentModels.get(C));
}

/**
 *
 * @param {Character} C
 */
function KDDrawModelList(X, C) {
	let clickCategory = (index) => {
		return (bdata) => {
			KDModelList_Categories_index = index;
			KDUpdateModelList(1);
			return true;
		};
	};
	let clickToplevel = (index) => {
		return (bdata) => {
			KDModelList_Toplevel_index = index;
			KDUpdateModelList(2);
			return true;
		};
	};
	let clickSublevel = (index, name) => {
		return (bdata) => {


			let removed = false;
			for (let appIndex = 0; appIndex < C.Appearance.length; appIndex++) {
				if (C.Appearance[appIndex]?.Model?.Name == name) {
					if (KDModelList_Sublevel_index == index) {
						KDChangeWardrobe(C);
						C.Appearance.splice(appIndex, 1);
						UpdateModels(KDCurrentModels.get(C));
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
					UpdateModels(KDCurrentModels.get(C));
				}


			}


			KDModelList_Sublevel_index = index;
			KDUpdateModelList(3);
			return true;
		};
	};

	let buttonHeight = 40;
	let buttonSpacing = 45;

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
		if (category)
			DrawButtonKDEx("ClickCategory" + i, clickCategory(index_cat), true, X+0, 100 + buttonSpacing * i, 190, buttonHeight,
				category,
				hasCategories[category] ? "#ffffff" : faded, "",
				undefined, undefined, index_cat != KDModelList_Categories_index, KDButtonColor);


		let index_top = i + KDModelList_Toplevel_viewindex.index;
		let toplevel = KDModelList_Toplevel[index_top];
		if (toplevel)
			DrawButtonKDEx("ClickToplevel" + i, clickToplevel(index_top), true, X+220, 100 + buttonSpacing * i, 190, buttonHeight,
				toplevel,
				(KDCurrentModels.get(C).Models.has(toplevel) || hasTopLevel[toplevel]) ? "#ffffff" : faded, "",
				undefined, undefined, index_top != KDModelList_Toplevel_index, KDButtonColor);



		let index_sub = i + KDModelList_Sublevel_viewindex.index;
		let sublevel = KDModelList_Sublevel[index_sub];
		if (sublevel) {
			DrawButtonKDEx("ClickSublevel" + i, clickSublevel(index_sub, sublevel), true, X+440, 100 + buttonSpacing * i, 190, buttonHeight,
				sublevel,
				KDCurrentModels.get(C).Models.has(sublevel) ? "#ffffff" : faded, "",
				undefined, undefined, index_sub != KDModelList_Sublevel_index, KDButtonColor);
			if (index_sub == KDModelList_Sublevel_index && KDCurrentModels.get(C).Models.has(sublevel)) {
				KDSelectedModel = C.Appearance.find((value) => {
					return value.Model.Name == sublevel;
				})?.Model;
			}
		}

		// KDCurrentModels.get(KinkyDungeonPlayer).Models.has(model) ? "#ffffff" : "#888888", "");
	}

	let cullIndex = () => {
		KDModelList_Toplevel_viewindex.index = Math.max(0, Math.min(KDModelList_Toplevel.length - 5, KDModelList_Toplevel_viewindex.index));
		KDModelList_Sublevel_viewindex.index = Math.max(0, Math.min(KDModelList_Sublevel.length - 5, KDModelList_Sublevel_viewindex.index));
		KDModelList_Categories_viewindex.index = Math.max(0, Math.min(KDModelList_Categories.length - 5, KDModelList_Categories_viewindex.index));
	};

	DrawButtonKDEx("KDModelList_Toplevel_V", (bdata) => {
		KDModelList_Toplevel_viewindex.index += 5;
		cullIndex();
		return true;
	}, true, X+220 + 20, 100 + buttonSpacing * KDModelListMax, 150, buttonHeight,
	"v",
	KDModelList_Toplevel_viewindex.index + KDModelListMax < KDModelList_Toplevel_viewindex.index ? "#ffffff" : "#888888", "");

	DrawButtonKDEx("KDModelList_Toplevel_^", (bdata) => {
		KDModelList_Toplevel_viewindex.index -= 5;
		cullIndex();
		return true;
	}, true, X+220 + 20, 100 + buttonSpacing * -1, 150, buttonHeight,
	"^",
	KDModelList_Toplevel_viewindex.index > 0 ? "#ffffff" : "#888888", "");

	DrawButtonKDEx("KDModelList_Sublevel_V", (bdata) => {
		KDModelList_Sublevel_viewindex.index += 5;
		cullIndex();
		return true;
	}, true, X+440 + 20, 100 + buttonSpacing * KDModelListMax, 150, buttonHeight,
	"v",
	KDModelList_Sublevel_viewindex.index + KDModelListMax < KDModelList_Sublevel_viewindex.index ? "#ffffff" : "#888888", "");
	DrawButtonKDEx("KDModelList_Sublevel_^", (bdata) => {
		KDModelList_Sublevel_viewindex.index -= 5;
		cullIndex();
		return true;
	}, true, X+440 + 20, 100 + buttonSpacing * -1, 150, buttonHeight,
	"^",
	KDModelList_Sublevel_viewindex.index > 0 ? "#ffffff" : "#888888", "");



	DrawButtonKDEx("KDModelList_Categories_V", (bdata) => {
		KDModelList_Categories_viewindex.index += 5;
		cullIndex();
		return true;
	}, true, X+0 + 20, 100 + buttonSpacing * KDModelListMax, 150, buttonHeight,
	"v",
	(KDModelList_Categories_viewindex.index + KDModelListMax < KDModelList_Categories_viewindex.index) ? "#ffffff" : "#888888", "");
	DrawButtonKDEx("KDModelList_Categories_^", (bdata) => {
		KDModelList_Categories_viewindex.index -= 5;
		cullIndex();
		return true;
	}, true, X+0 + 20, 100 + buttonSpacing * -1, 150, buttonHeight,
	"^",
	KDModelList_Categories_viewindex.index > 0 ? "#ffffff" : "#888888", "");


	cullIndex();

}

function KDDrawWardrobe(screen, Character) {
	if (KDOutfitInfo.length == 0) KDRefreshOutfitInfo();

	let C = Character || KinkyDungeonPlayer;
	KDTextField("KDOutfitName", 25, 5, 450, 30);
	if (!ElementValue("KDOutfitName")) {
		ElementValue("KDOutfitName", KDOutfitInfo[KDCurrentOutfit]);
	}
	KDDrawModelList(720, C);
	if (KDPlayerSetPose)
		KDDrawPoseButtons(C);
	else {
		KDDrawSavedColors(1060, 870, KDSavedColorCount, C);
	}
	DrawButtonKDEx("SetPose", (bdata) => {
		KDPlayerSetPose = !KDPlayerSetPose;

		return true;
	}, true, 884, 790, 60, 60, "", "#ffffff", KinkyDungeonRootDirectory + "Poses/SetPose.png", "", false, false, KDPlayerSetPose ? KDTextGray3 : KDButtonColor);


	if (KDSelectedModel) {
		KDDrawColorSliders(1600, 100, C, KDSelectedModel);
	} else {
		KDCurrentLayer = "";
	}
	// Return anon function anonymously
	let clickButton = (index) => {
		return (bdata) => {
			KDOutfitStore[KDCurrentOutfit] = LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer));
			KDOutfitOriginalStore[KDCurrentOutfit] = KDOriginalValue;
			KDCurrentOutfit = index;
			ElementValue("KDOutfitName", "");
			localStorage.setItem("kdcurrentoutfit", KDCurrentOutfit + "");
			let NewOutfit = KDOutfitStore[KDCurrentOutfit] || localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit);

			if (NewOutfit) {
				KDOriginalValue = KDOutfitOriginalStore[KDCurrentOutfit] || "";
				CharacterAppearanceRestore(KinkyDungeonPlayer, LZString.decompressFromBase64(NewOutfit));
				CharacterRefresh(KinkyDungeonPlayer);
				KDInitProtectedGroups();
				KinkyDungeonDressPlayer();
			} else {
				KDGetDressList().Default = KinkyDungeonDefaultDefaultDress;
				CharacterAppearanceRestore(KinkyDungeonPlayer, CharacterAppearanceStringify(KinkyDungeonPlayerCharacter ? KinkyDungeonPlayerCharacter : Player));
				CharacterReleaseTotal(KinkyDungeonPlayer);
				KinkyDungeonSetDress("Default", "Default");
				KinkyDungeonDressPlayer();
				KDInitProtectedGroups();
			}
			return true;
		};
	};

	for (let i = 0; i < KDOutfitInfo.length && i < KDMaxOutfitsDisplay; i++) {
		let index = i + KDMaxOutfitsIndex;

		DrawButtonKDEx("ClickOutfit" + i, clickButton(index), true, 475, 100 + 50 * i, 200, 45,
			KDOutfitInfo[index] + (((index == KDCurrentOutfit && KDOriginalValue) || KDOutfitOriginalStore[index]) ? "(*)" : ""),
			index == KDCurrentOutfit ? "#ffffff" : "#888888", "");

	}


	DrawButtonKDEx("ResetOutfit", (bdata) => {
		if (KDConfirmType == "reset" && KinkyDungeonReplaceConfirm > 0) {
			KDChangeWardrobe(C);
			KDGetDressList().Default = KinkyDungeonDefaultDefaultDress;
			CharacterAppearanceRestore(KinkyDungeonPlayer, CharacterAppearanceStringify(KinkyDungeonPlayerCharacter ? KinkyDungeonPlayerCharacter : Player));
			CharacterReleaseTotal(KinkyDungeonPlayer);
			KinkyDungeonSetDress("Default", "Default");
			KinkyDungeonDressPlayer();
			KDInitProtectedGroups();
			UpdateModels(KDCurrentModels.get(KinkyDungeonPlayer));
			KinkyDungeonConfigAppearance = true;
			KinkyDungeonReplaceConfirm = 0;
			return true;
		} else {
			KDConfirmType = "reset";
			KinkyDungeonReplaceConfirm = 2;
			return true;
		}
	}, true, 475, 860, 220, 60,
	TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'reset') ?
			"KinkyDungeonConfirm" :
			"KinkyDungeonDressPlayerReset"),
	"#ffffff", "");
	DrawButtonKDEx("StripOutfit", (bdata) => {
		if (KDConfirmType == "strip" && KinkyDungeonReplaceConfirm > 0) {
			KDChangeWardrobe(C);
			CharacterAppearanceRestore(KinkyDungeonPlayer, CharacterAppearanceStringify(KinkyDungeonPlayerCharacter ? KinkyDungeonPlayerCharacter : Player));
			CharacterReleaseTotal(KinkyDungeonPlayer);
			KinkyDungeonSetDress("Bikini", "Bikini");
			KinkyDungeonDressPlayer();
			KDInitProtectedGroups();
			KinkyDungeonConfigAppearance = true;
			KinkyDungeonReplaceConfirm = 0;
			return true;
		} else {
			KDConfirmType = "strip";
			KinkyDungeonReplaceConfirm = 2;
			return true;
		}
	}, true, 475, 790, 220, 60,
	TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'strip') ?
			"KDConfirmStrip" :
			"KDDressStrip"),
	"#ffffff", "");
	DrawButtonKDEx("LoadFromCode", (bdata) => {
		KinkyDungeonState = "LoadOutfit";

		LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer));
		CharacterReleaseTotal(KinkyDungeonPlayer);
		ElementCreateTextArea("saveInputField");
		ElementValue("saveInputField", LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer)));
		return true;
	}, true,475, 930, 220, 60, TextGet("KinkyDungeonDressPlayerImport"),
	"#ffffff", "");


	DrawButtonKDEx("KDWardrobeCancel", (bdata) => {
		if (KDConfirmType == "revert" && KinkyDungeonReplaceConfirm > 0) {
			KinkyDungeonReplaceConfirm = 0;
			KDRestoreOutfit();
			KDOriginalValue = "";
			return true;
		} else {
			KDConfirmType = "revert";
			KinkyDungeonReplaceConfirm = 2;
			return true;
		}
	}, true, 725, 860, 220, 60,
	TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'revert') ?
		"KDWardrobeCancelConfirm" :
		"KDWardrobeCancel"), KDOriginalValue ? "#ffffff" : "#888888", "");
	DrawButtonKDEx("KDWardrobeSaveOutfit", (bdata) => {
		if (KDConfirmType == "save" && KinkyDungeonReplaceConfirm > 0) {
			if (ElementValue("KDOutfitName")) {
				KDOutfitInfo[KDCurrentOutfit] = ElementValue("KDOutfitName");
				KDSaveOutfitInfo();
			}
			KinkyDungeonReplaceConfirm = 0;
			localStorage.setItem("kinkydungeonappearance" + KDCurrentOutfit, LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer)));
			KinkyDungeonDressSet();
			KDOriginalValue = "";
			KDRefreshOutfitInfo();
			return true;
		} else {
			KDConfirmType = "save";
			KinkyDungeonReplaceConfirm = 2;
			return true;
		}
	}, true, 725, 930, 220, 60,
	TextGet((KinkyDungeonReplaceConfirm > 0 && KDConfirmType == 'save') ?
		"KDWardrobeSaveOutfitConfirm" :
		"KDWardrobeSaveOutfit"), KDOriginalValue ? "#ffffff" : "#888888", "");

	DrawButtonKDEx("KDWardrobeSave", (bdata) => {
		KinkyDungeonState = "Menu";
		KinkyDungeonDressSet();
		return true;
	}, true, 30, 942, 440, 50, TextGet("KDWardrobeSave"), "#ffffff", "");
}

function KDSaveCodeOutfit() {
	// Save outfit
	KDChangeWardrobe(KinkyDungeonPlayer);
	let decompressed = LZString.decompressFromBase64(ElementValue("saveInputField"));
	let stringified = "";
	if (decompressed) {
		let origAppearance = KinkyDungeonPlayer.Appearance;
		try {
			CharacterAppearanceRestore(KinkyDungeonPlayer, decompressed);
			CharacterRefresh(KinkyDungeonPlayer);
			KDInitProtectedGroups();
			stringified = CharacterAppearanceStringify(KinkyDungeonPlayer);
		} catch (e) {
			// If we fail, it might be a BCX code. try it!
			KinkyDungeonPlayer.Appearance = origAppearance;
			try {
				let parsed = JSON.parse(decompressed);
				if (parsed.length > 0) {
					if (!StandalonePatched) {
						for (let g of parsed) {
							InventoryWear(KinkyDungeonPlayer, g.Name, g.Group, g.Color);
						}
						CharacterRefresh(KinkyDungeonPlayer);
					}
					KDInitProtectedGroups();
					stringified = CharacterAppearanceStringify(KinkyDungeonPlayer);
				} else {
					console.log("Invalid code. Maybe its corrupt?");
				}
			} catch (error) {
				console.log("Invalid code.");
			}
		}
	}

	KinkyDungeonDressPlayer();
	if (stringified) {
		localStorage.setItem("kinkydungeonappearance" + KDCurrentOutfit, stringified);
		KDSaveOutfitInfo();
		KDRefreshOutfitInfo();
	}

	KinkyDungeonNewDress = true;
}

function KDRestoreOutfit() {
	// Restore the original outfit
	if (KDOriginalValue) {
		CharacterAppearanceRestore(KinkyDungeonPlayer, LZString.decompressFromBase64(KDOriginalValue));
		CharacterRefresh(KinkyDungeonPlayer);
		KDInitProtectedGroups();
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