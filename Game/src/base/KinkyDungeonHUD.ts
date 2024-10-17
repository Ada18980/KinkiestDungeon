
let KDUISmoothness = 6;

let KDInteracting = false;

let KinkyDungeonStruggleGroups = [];
let KinkyDungeonStruggleGroupsBase = [
	"ItemDevices",
	"ItemEars",
	"ItemHead",
	"ItemMouth",
	"ItemNeck",
	"ItemNeckRestraints",
	"ItemArms",
	"ItemHands",
	"ItemBreast",
	"ItemNipples",
	"ItemTorso",
	"ItemPelvis",
	"ItemVulvaPiercings",
	"ItemVulva",
	"ItemButt",
	"ItemLegs",
	"ItemFeet",
	"ItemBoots",
];
let KDDrawStruggleEnum = {
	MOST: 1,
	FULL: 0,
	STRUGGLE: 2,
	NONE: 3,
};
let KinkyDungeonDrawStruggle = KDDrawStruggleEnum.MOST;
let KDPlayerSetPose = false;
let KDToggleXRay = 0;
let KDBulletTransparency = false;
let KD_XRayHidden = ["Wrapping", "Tape"];
let KinkyDungeonDrawStruggleHover = false;
let KinkyDungeonDrawState = "Game";
let KinkyDungeonDrawStatesModal = ["Heart", "Orb"];
let KinkyDungeonSpellValid = false;
let KinkyDungeonCamX = 0;
let KinkyDungeonCamY = 0;
let KinkyDungeonCamXLast = 0;
let KinkyDungeonCamYLast = 0;
let KinkyDungeonCamXVis = 0;
let KinkyDungeonCamYVis = 0;
let KinkyDungeonTargetX = 0;
let KinkyDungeonTargetY = 0;
let KinkyDungeonLastDraw = 0;
let KinkyDungeonLastDraw2 = 0;
let KinkyDungeonDrawDelta = 0;

let KD_HUD_RESTRAINTINFOFONTSIZE = 24;
let KD_HUD_RESTRAINTINFOLINESIZE = 34;

const KinkyDungeonLastChatTimeout = 10000;

let KinkyDungeonStatBarHeight = 50;
let KinkyDungeonToggleAutoPass = true;
let KinkyDungeonToggleAutoSprint = false;
let KinkyDungeonInspect = false;

let KinkyDungeonFastMove = true;
let KinkyDungeonFastMovePath = [];
let KinkyDungeonFastStruggle = false;
let KinkyDungeonFastStruggleType = "";
let KinkyDungeonFastStruggleGroup = "";


let KDMinBuffX = 0;
let KDMinBuffXTarget = 1000;
let KDToggleShowAllBuffs = false;

let KDFocusControls = "";
let KDFocusControlButtons = {
	"AutoPass": {
		HelplessEnemies: false,
		HelplessAllies: true,
		Summons: true,
		Allies: true,
		Neutral: true,
		Shop: false,
		Special: false,
	},
	"AutoPath": {
		SuppressBeforeCombat: true,
		SuppressDuringCombat: true,
		StepDuringCombat: false,
	},
};
let KDFocusControlButtonsExclude = {
	AutoPathStepDuringCombat: ["AutoPathSuppressDuringCombat"],
	AutoPathSuppressDuringCombat: ["AutoPathStepDuringCombat"],
};


let KDBuffSprites = {
	"Camo": true,
	"Drenched": true,
	"StoneSkin": true,
	"Conduction": true,
	"Ignite": true,
	"Burning": true,
	"Unsteady": true,
	"Unsteady2": true,
	"Chilled": true,
	"ChillWalk": true,
	"Slimed": true,
	"LightningRod": true,
	"PoisonDagger": true,
	"Cutting": true,
	"Slippery": true,
	"ScrollVerbal": true,
	"ScrollArms": true,
	"ScrollLegs": true,
	"Empower": true,
	"SlimeMimic": true,
	"d_SlimeMimic": true,
	"DisenchantSelf": true,
	"LeatherBurst": true,

	"TabletElements": true,
	"TabletConjure": true,
	"TabletIllusion": true,
	"TabletRope": true,
	"TabletWill": true,
	"TabletMetal": true,
	"TabletLatex": true,
	"TabletLeather": true,

	"AvatarFire": true,
	"AvatarWater": true,
	"AvatarEarth": true,
	"AvatarAir": true,

	"DistractionCast": true,

	"BoundByFate": true,
	"Taunted": true,
	"GreaterInvisibility": true,
	"Invisibility": true,

	"Haunted": true,
	"Cursed": true,
	"DildoBatBuff": true,

	"Corrupted": true,
	"CursedDistract": true,
	"ForcedSubmission": true,
	"CursingCircle": true,

	//KinkyDungeonBuffShrineElements,"Arcane Power: Deals bonus damage when you hit an enemy."
	//KinkyDungeonBuffShrineConjure,"Arcane Protection: Reduces damage taken, and deals retaliation damage."
	//KinkyDungeonBuffShrineIllusion,"Arcane Cunning: You turn invisible briefly after attacking."

	//KinkyDungeonBuffSlimeForm,"Slime Form: You gain bonuses and can slip through bars!"
	//KinkyDungeonBuffShroud2,"Shroud: Visibility decreased, evasion increased."
	//KinkyDungeonBuffShadowBlade,"Darkblade: Increased damage."
	//KinkyDungeonBuffShield,"Runic Ward: Increased Spell Ward."
	//KinkyDungeonBuffInvisibility,"Invisibility: It is very difficult for enemies to see you."
	//KinkyDungeonBuffLesserInvisibility,"Lesser Invisibility: It is harder for enemies to see you."
	//KinkyDungeonBuffCutting,"FULL POWER: Cutting power increased!!!"
	//KinkyDungeonBuffSlippery,"Graceful: Struggling power increased."
	//KinkyDungeonBuffIronBlood,"Iron Blood: Reduced melee cost, increased mana costs."
	//KinkyDungeonBuffSleepy,"Sleepy: You are sluggish and have a hard time keeping your eyes open."
	//KinkyDungeonBuffEvasion,"Afterimage: Evasion greatly increased."

	//KinkyDungeonBuffStraitjacketBolt,"Locked Down: Struggling power is greatly reduced."
	//KinkyDungeonBuffLockdown,"Locked Down: Struggling power is greatly reduced."

	//KinkyDungeonBuffScrollVerbal,"Verbose: You can cast verbal spells while gagged."
	//KinkyDungeonBuffScrollArms,"Dextrous: You can cast arm spells while tied up."
	//KinkyDungeonBuffScrollLegs,"Spell Dance: You can cast leg spells while tied up."

	//KinkyDungeonBuffBondageBusterCharge,"Bondage Buster: Lazor is charging..."
	//KinkyDungeonBuffKatanaCharge,"Katana: Patience is key..."
	//KinkyDungeonBuffStormCharge,"Stormbreaker: You have the Power."
};

let KDStatsSkipLine = {
	"info": 1,
	"training": 1,
	"status": 1,
	"dmg": 1,
	"resist": 1,
};
let KDStatsSkipLineBefore = {
	"kinky": 1,
	"curse": 1,
	"perk": 1,
};

let KDStatsOrder = {
	"info": 10000,
	"status": 7000,
	"training": 4000,
	"resist": 2500,
	"dmg": 2000,
	"help": 1500, // Always good, so since they are buffs they should be high priority
	"buffs": 1000,
	"perk": -500,
	"kinky": -1000,
	"curse": -2000,
};

let KDUIColor = "#111111";
let KDUIAlpha = 0.5;
let KDUIColorHighlight = "#ffee83";
let KDUIAlphaHighlight = 0.7;



let KDModalArea_x = 600;
let KDModalArea_y = 700;
let KDModalArea_width = 800;
let KDModalArea_height = 100;
let KDModalArea = false;
let KDConfirmDeleteSave = false;


function KDHandleGame() {
	if (KinkyDungeonShowInventory && (!KinkyDungeonTargetingSpell || MouseIn(0, 0, 500, PIXIHeight))) {
		// Done, converted to input
		KinkyDungeonhandleQuickInv();
		return true;
	}
	if (KinkyDungeonMessageToggle && KinkyDungeonDrawState == "Game") {
		if (MouseIn(500, KDLogTopPad, 1250, KDLogHeight + 175)) {
			return true;
		}
	}

	if (KinkyDungeonIsPlayer() && MouseIn(canvasOffsetX, canvasOffsetY, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height))
		KinkyDungeonSetTargetLocation(!KinkyDungeonTargetingSpell && KDToggles.Helper);




	// Done, converted to input
	if (!KinkyDungeonTargetingSpell) {
		KinkyDungeonSpellPress = "";
		if (KinkyDungeonHandleSpell()) return true;
	} else {
		KinkyDungeonSpellPress = "";
	}

	if (KinkyDungeonIsPlayer() && KinkyDungeonTargetTile) {
		if (KDHandleModalArea()) return true;
	}
}



function KinkyDungeonDrawInterface(_showControls: boolean) {
	if (KDToggles.TurnCounter)
		DrawTextKD(TextGet("TurnCounter") + KinkyDungeonCurrentTick, 1995, 995, "#ffffff", "#333333", 12, "right");

	let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
	let dungeonName = altType?.Title ? altType.Title : (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint);
	DrawTextFitKD(
		TextGet("CurrentLevel").replace("FLOORNUMBER", "" + MiniGameKinkyDungeonLevel).replace("DUNGEONNAME", TextGet("DungeonName" + dungeonName))
		+ (KinkyDungeonNewGame ? TextGet("KDNGPlus").replace("XXX", "" + KinkyDungeonNewGame) : ""),
		1870, 15, 250, "#ffffff", "#333333", 18, "center");



	if (!KDPatched) DrawButtonKDEx("quitbutton", (_b) => {
		KinkyDungeonDrawState = "Restart";
		KDConfirmDeleteSave = false;
		if (KDDebugMode) {
			ElementCreateTextArea("DebugEnemy");
			ElementValue("DebugEnemy", "Maidforce");
			ElementCreateTextArea("DebugItem");
			ElementValue("DebugItem", "TrapArmbinder");
		} else {
			if (document.getElementById("DebugEnemy")) {
				ElementRemove("DebugEnemy");
			}
			if (document.getElementById("DebugItem")) {
				ElementRemove("DebugItem");
			}
		}
		return true;
	}, true, 1750, 20, 100, 50, TextGet("KinkyDungeonRestart"), "#ffffff");




	if (!KDToggles.TransparentUI) {
		/*
		let Rwidth = 270;
		let Bheight = 80;
		DrawRectKD(kdcanvas, kdpixisprites, "rightBarb", {
			Left: 2000 - Rwidth, Top: -2, Width: Rwidth + 4,
			Height: 1000 - Bheight,
			Color: KDUIColorHighlight, alpha: KDUIAlphaHighlight, zIndex: -1,
			LineWidth: 2
		});
		FillRectKD(kdcanvas, kdpixisprites, "rightBar", {
			Left: 2000 - Rwidth, Top: 0, Width: Rwidth,
			Height: 1000 - Bheight,
			Color: KDUIColor, alpha: KDUIAlpha, zIndex: -2
		});*/
		DrawRectKD(kdcanvas, kdpixisprites, "leftBarb", {
			Left: -2, Top: -2, Width: 502,
			Height: 1006,
			Color: KDUIColorHighlight, alpha: KDUIAlphaHighlight, zIndex: -1,
			LineWidth: 2
		});
		if (!KDBGColor) {
			FillRectKD(kdcanvas, kdpixisprites, "leftBar", {
				Left: 0, Top: 0, Width: 500,
				Height: 1006,
				Color: KDUIColor, alpha: StandalonePatched ? KDUIAlpha : 0.01, zIndex: -2
			});
		}
		/*DrawRectKD(kdcanvas, kdpixisprites, "botBarb", {
			Left: 504, Top: 1000-Bheight,
			Width: 2000 - 500,
			Height: Bheight + 2,
			Color: KDUIColorHighlight, alpha: KDUIAlphaHighlight, zIndex: -1,
			LineWidth: 2
		});
		FillRectKD(kdcanvas, kdpixisprites, "botBar", {
			Left: 504, Top: 1000-Bheight,
			Width: 2000 - 500,
			Height: Bheight,
			Color: KDUIColor, alpha: KDUIAlpha, zIndex: -2
		});*/
	}

	KDDrawStruggleGroups();
	KDDrawStatusBars(1790, 340, 200);
	KinkyDungeonDrawActionBar(1780, 166);
	if (KDToggles.BuffSide)
		KDProcessBuffIcons(510, 82, true);
	else
		KDProcessBuffIcons(830, 995 - 72 - 36 - 24);


	if (KinkyDungeonTargetTile) {
		if (KDObjectDraw[KinkyDungeonTargetTile.Type]) {
			KDObjectDraw[KinkyDungeonTargetTile.Type]();
		}
	}
	KDDrawSpellChoices();
	KDDrawNavBar(-1);

	if (KDToggles.ShowZoom) {
		DrawButtonKDEx("mainZoomIn", () => {
			KDChangeZoom(-1);
			return true;
		}, true, PIXIWidth - 210, PIXIHeight * 0.5 - 50, 42, 42, undefined, "#ffffff",
		KinkyDungeonRootDirectory + "UI/ZoomIn.png");
		DrawButtonKDEx("mainZoomOut", () => {
			KDChangeZoom(1);
			return true;
		}, true, PIXIWidth - 210, PIXIHeight * 0.5 - 50 + 48, 42, 42, undefined, "#ffffff",
		KinkyDungeonRootDirectory + "UI/ZoomOut.png");
	}

}

function KDDrawSpellChoices() {
	let i = 0;
	let HotbarStart = 995 - 70;
	let hotBarIndex = 0;
	let hotBarSpacing = 72;
	let hotBarX = 790 + hotBarSpacing;

	const max_choices = Math.max (KinkyDungeonSpellChoices.length, KinkyDungeonConsumableChoices.length, KinkyDungeonWeaponChoices.length, KinkyDungeonArmorChoices.length)
	if (max_choices > KinkyDungeonSpellChoiceCountPerPage) {
		DrawButtonKDEx("CycleSpellButton", () => {
			KDCycleSpellPage(false, false);
			return true;
		}, true, hotBarX + 713, HotbarStart, 72, 72, `${KDSpellPage + 1}`, "#ffffff",
		KinkyDungeonRootDirectory + "UI/Cycle.png", undefined, undefined, true, undefined, 28, undefined, {
			hotkey: KDHotkeyToText(KinkyDungeonKeySpellPage[0]),
			scaleImage: true,
			centered: true,
			centerText: true,
		});
	}
	KDCullSpellChoices();

	let KDUpcastLevel = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellEmpower");


	if (KinkyDungeonSpellChoices.length > 0) {
		let hasUpcast = KDCanUpcast();
		if (!KDToggles.TransparentUI) {
			DrawRectKD(
				kdcanvas, kdpixisprites, "hotbarborder", {
					Left: hotBarX - 5 - hotBarSpacing, Top: HotbarStart - 5, Width: 72 * 12,
					Height: 82,
					Color: KDUIColorHighlight, alpha: KDUIAlphaHighlight, zIndex: -2,
					LineWidth: 2,
				}
			);
			FillRectKD(
				kdcanvas, kdpixisprites, "hotbarbg", {
					Left: hotBarX - 5 - hotBarSpacing, Top: HotbarStart - 5, Width: 72 * 12,
					Height: 82,
					Color: KDUIColor, alpha: KDUIAlpha, zIndex: -1
				}
			);
		}

		hotBarIndex = -1;

		if (KinkyDungeonSpellChoices.some((num) => {return KinkyDungeonSpells[num] != undefined;})) {
			DrawButtonKDEx("empowerSpell",
				(_bdata) => {
					KDSendInput("upcast", {});
					return true;
				}, true,
				hotBarX + (hotBarIndex)*hotBarSpacing, HotbarStart, 72, 72, "", "",
				KinkyDungeonRootDirectory + "Spells/" + KDEmpowerSprite + (hasUpcast ? "" : "Fail") + ".png", undefined, false, true,
				undefined, undefined, undefined, {
					hotkey: KDHotkeyToText(KinkyDungeonKeyUpcast[0]),
					scaleImage: true,
				}
			);
			if (KDUpcastLevel > 0)
				DrawButtonKDEx("empowerSpellCancel",
					(_bdata) => {
						KDSendInput("upcastcancel", {});
						return true;
					}, true,
					hotBarX + (hotBarIndex)*hotBarSpacing - 82, HotbarStart - 82, 72, 72, "", "",
					KinkyDungeonRootDirectory + "Spells/" + KDEmpowerSprite + "Cancel" + ".png", undefined, false, true,
					undefined, undefined, undefined, {
						hotkey: KDHotkeyToText(KinkyDungeonKeyUpcast[1]),
						scaleImage: true,
					}
				);
			if (MouseIn(hotBarX + (hotBarIndex)*hotBarSpacing , HotbarStart, 72, 72)) {
				DrawTextFitKD(TextGet("KDSpellEmpower" + (hasUpcast ? "" : "Fail")), hotBarX + (hotBarIndex)*hotBarSpacing, HotbarStart - 140,
					1000, "#ffffff", undefined, undefined, "center");
			}
			if (KDUpcastLevel > 0 && MouseIn(hotBarX + (hotBarIndex)*hotBarSpacing, HotbarStart - 82, 72, 72)) {
				DrawTextFitKD(TextGet("KDSpellEmpowerCancel"), hotBarX + (hotBarIndex)*hotBarSpacing, HotbarStart - 140,
					1000, "#ffffff", undefined, undefined, "center");
			}
		}
	}

	hotBarIndex = 0;

	let maxSmallIcons = KDToggles.BuffSide ? 7 : 3;
	for (i = 0; i < KinkyDungeonSpellChoiceCountPerPage; i++) {
		let index = i + KDSpellPage * KinkyDungeonSpellChoiceCountPerPage;
		/*let buttonWidth = 40;
		let buttonPad = 80;
		if (KinkyDungeonSpellChoices[i] >= 0)
			DrawButtonKDEx("changespell" + i, (bdata) => {
				KinkyDungeonDrawState = "MagicSpells";
				KDSwapSpell = index;
				return true;
			}, true, 1650 + (90 - buttonWidth), 40 + i*KinkyDungeonSpellChoiceOffset, buttonWidth, buttonWidth, "", "#ffffff", KinkyDungeonRootDirectory + "ChangeSpell.png", undefined, undefined, true);*/
		//let tooltip = false;
		let buttonDim = {
			x: hotBarX + hotBarSpacing*i,
			y: HotbarStart,
			w: 72,
			h: 72,
			wsmall: 36,
			hsmall: 36,
		};


		if (KinkyDungeonSpells[KinkyDungeonSpellChoices[index]] && !KinkyDungeonSpells[KinkyDungeonSpellChoices[index]].passive) {
			let spell = KDGetUpcast(KinkyDungeonSpells[KinkyDungeonSpellChoices[index]].name, KDUpcastLevel) || KinkyDungeonSpells[KinkyDungeonSpellChoices[index]];//KinkyDungeonSpells[KinkyDungeonSpellChoices[index]];
			//let components = KinkyDungeonGetCompList(spell);
			//let comp = "";


			//if (spell.components && spell.components.length > 0) comp = components;
			// Render MP cost
			let data = {
				spell: spell,
				cost: Math.round(KinkyDungeonGetManaCost(
					spell,
					!spell.active && spell.passive,
					!spell.active && spell.type == "passive") * 10) + "mp",
				color: "#ccddFF",
			};
			if (data.cost == "0mp") {
				let c2 = Math.round(KinkyDungeonGetStaminaCost(spell) * 10) + "sp";
				if (c2 != "0sp") {
					data.cost = c2;
				}
			}
			if (data.cost == "0mp") {
				let c2 = Math.round(KinkyDungeonGetChargeCost(spell) * 10) + "c";
				if (c2 != "0c") {
					data.cost = c2;
				}
			}
			if (spell.customCost && KDCustomCost[spell.customCost]) {
				KDCustomCost[spell.customCost](data);
			}

			DrawTextFitKD(data.cost == "0mp" ? TextGet("KDFree") : data.cost, buttonDim.x + buttonDim.w/2, buttonDim.y+buttonDim.h-7, buttonDim.w,
				data.color, "#333333", 12, "center", 110);

			// Draw the main spell icon
			if (spell.type == "passive" && KinkyDungeonSpellChoicesToggle[index]) {
				FillRectKD(kdcanvas, kdpixisprites, "rectspella" + i, {
					Left: buttonDim.x-2,
					Top: buttonDim.y-2,
					Width: buttonDim.w+4,
					Height: buttonDim.h+4,
					Color: "#dbdbdb",
					zIndex: 70,
				});
				FillRectKD(kdcanvas, kdpixisprites, "rectspellb" + i, {
					Left: buttonDim.x,
					Top: buttonDim.y,
					Width: buttonDim.w,
					Height: buttonDim.h,
					Color: "#101010",
					zIndex: 70.1,
				});
			}


			DrawButtonKDEx("SpellCast" + index,
				() => {
					KinkyDungeonHandleSpell(index);
					return true;
				},
				true,
				buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, "", "rgba(0, 0, 0, 0)",
				KinkyDungeonRootDirectory + "Spells/" + spell.name + ".png", "", false, true,
				undefined, undefined, undefined, {
					hotkey: KDHotkeyToText(KinkyDungeonKeySpell[i]),
					scaleImage: true,
				});
			if (KinkyDungeoCheckComponentsPartial(spell, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true).length > 0) {
				let sp = KinkyDungeoCheckComponents(spell).failed.length > 0 ? "SpellFail" : "SpellFailPartial";
				KDDraw(kdcanvas, kdpixisprites, "spellFail" + "SpellCast" + i, KinkyDungeonRootDirectory + "Spells/" + sp + ".png",
					buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, undefined, {
						zIndex: 72,
					});
				//DrawImage(KinkyDungeonRootDirectory + "Spells/" + sp + ".png", buttonDim.x + 2, buttonDim.y + 2,);
			}
			if (KDHasUpcast(spell.name)) {
				KDDraw(kdcanvas, kdpixisprites, "spellCanUpcast" + i, KinkyDungeonRootDirectory + "Spells/" + "CanUpcast" + ".png",
					buttonDim.x, buttonDim.y, 72, 72, undefined, {
						zIndex: 71,
					});
			}

			if (MouseIn(buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h)) {
				DrawTextFitKD(TextGet("KinkyDungeonSpell"+ spell.name),
					buttonDim.x, buttonDim.y - 140, 300, "#ffffff", "#333333", undefined, "center");
				//DrawTextFitKD(comp, 1700 - 2 - buttonPad / 2, 1000 + i*KinkyDungeonSpellChoiceOffset, Math.min(10 + comp.length * 8, buttonPad), "#ffffff", KDTextGray0);
			}
			// Render number
			//DrawTextFitKD((i+1) + "", buttonDim.x + 10, buttonDim.y + 13, 25, "#ffffff", KDTextGray0, 18, undefined, 101);


			//let cost = KinkyDungeonGetManaCost(spell) + TextGet("KinkyDungeonManaCost") + comp;
		} else if (KinkyDungeonConsumableChoices[index] || KinkyDungeonWeaponChoices[index] || KinkyDungeonArmorChoices[index]) {
			let item = KinkyDungeonConsumableChoices[index] || KinkyDungeonWeaponChoices[index] || KinkyDungeonArmorChoices[index];
			let arm = KinkyDungeonArmorChoices[index];
			let consumable = KinkyDungeonConsumableChoices[index];
			let wep = KinkyDungeonWeaponChoices[index];
			// Draw the main icon
			let name = item;
			if (arm && KinkyDungeonRestraintVariants[arm]) name = KinkyDungeonRestraintVariants[arm].template;
			if (consumable && KinkyDungeonConsumableVariants[consumable]) name = KinkyDungeonConsumableVariants[consumable].template;
			if (wep && KinkyDungeonWeaponVariants[wep]) name = KinkyDungeonWeaponVariants[wep].template;
			//DrawButtonKD("UseItem" + index, true, buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, "", "rgba(0, 0, 0, 0)",
			//KDGetItemPreview({name: item, type: consumable ? Consumable : (arm ? LooseRestraint : Weapon)}).preview, "", false, true);
			if (KDGetItemPreview({name: item, type: consumable ? Consumable : (arm ? LooseRestraint : Weapon)})) {
				DrawButtonKDEx("UseItem" + index,
					() => {
						KinkyDungeonHandleSpell(index);
						return true;
					},
					true,
					buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, "", "rgba(0, 0, 0, 0)",
					KDGetItemPreview({name: item, type: consumable ? Consumable : (arm ? LooseRestraint : Weapon)}).preview, "", false, true,
					undefined, undefined, undefined, {
						hotkey: KDHotkeyToText(KinkyDungeonKeySpell[i]),
						scaleImage: true,
					});

				if (MouseIn(buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h)) {
					DrawTextFitKD(TextGet((arm ? "Restraint" : ("KinkyDungeonInventoryItem")) + name),
						buttonDim.x, buttonDim.y - 140, 300,
						"#ffffff", "#333333", undefined, "center");
				}
				// Render number
				//DrawTextFitKD((i+1) + "", buttonDim.x + 10, buttonDim.y + 13, 25, "#ffffff", KDTextGray0, 18, undefined, 101);
				if (consumable || arm) {
					let con = KinkyDungeonInventoryGetConsumable(consumable)
						|| KinkyDungeonInventoryGetLoose(arm);
					if (con) {
						DrawTextFitKD((con.quantity || 0) + 'x',
							buttonDim.x + buttonDim.w-1,
							buttonDim.y + buttonDim.h - 9,
							buttonDim.hsmall, "#ffffff", KDTextGray0, 18, "right");
					}
				}
			}
			if (!KinkyDungeonInventoryGet(item)) {
				let sp = "SpellFail";
				KDDraw(kdcanvas, kdpixisprites, "spellFail" + "SpellCast" + i, KinkyDungeonRootDirectory + "Spells/" + sp + ".png",
					buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, undefined, {
						zIndex: 72,
					});
				//DrawImage(KinkyDungeonRootDirectory + "Spells/" + sp + ".png", buttonDim.x + 2, buttonDim.y + 2,);
			}

		}
		let icon = 0;
		// Draw icons for the other pages, if applicable
		for (let page = 1; page < maxSmallIcons && page <= Math.floor((max_choices - 1) / KinkyDungeonSpellChoiceCountPerPage); page += 1) {
			let pg = KDSpellPage + page;
			if (pg > Math.floor(max_choices / KinkyDungeonSpellChoiceCountPerPage)) pg -= 1 + Math.floor((max_choices - 1) / KinkyDungeonSpellChoiceCountPerPage);

			// Now we have our page...
			let indexPaged = (i + pg * KinkyDungeonSpellChoiceCountPerPage) % (KinkyDungeonSpellChoiceCount);
			let spellPaged = KinkyDungeonSpells[KinkyDungeonSpellChoices[indexPaged]];
			let item = KinkyDungeonConsumableChoices[indexPaged] || KinkyDungeonWeaponChoices[indexPaged] || KinkyDungeonArmorChoices[indexPaged];
			let arm = KinkyDungeonArmorChoices[indexPaged];
			let consumable = KinkyDungeonConsumableChoices[indexPaged];
			//let weapon = KinkyDungeonWeaponChoices[index];
			let buttonDimSmall = {
				x: buttonDim.x-1 + (buttonDim.wsmall) * ((page - 1) % 2),
				y: buttonDim.y-1 - (buttonDim.hsmall) * (1 + Math.floor((page - 1)/2)),
			};
			if (spellPaged) {
				if (spellPaged.type == "passive" && KinkyDungeonSpellChoicesToggle[indexPaged]) {
					FillRectKD(kdcanvas, kdpixisprites, page + "pgspell" + i, {
						Left: buttonDimSmall.x - 1,
						Top: buttonDimSmall.y - 1,
						Width: buttonDim.wsmall+2,
						Height: buttonDim.hsmall+2,
						Color: "#dbdbdb",
						zIndex: 70,
					});
					FillRectKD(kdcanvas, kdpixisprites, page + "pgspell2" + i, {
						Left: buttonDimSmall.x,
						Top: buttonDimSmall.y,
						Width: buttonDim.wsmall,
						Height: buttonDim.hsmall,
						Color: "#101010",
						zIndex: 70.1,
					});
				}
				icon += 1;
				DrawButtonKD("SpellCast" + indexPaged, true, buttonDimSmall.x, buttonDimSmall.y, buttonDim.wsmall, buttonDim.hsmall, "",
					"rgba(0, 0, 0, 0)", "", "", false, true);
				KDDraw(kdcanvas, kdpixisprites, "spellIcon" + icon + "," + indexPaged, KinkyDungeonRootDirectory + "Spells/" + spellPaged.name + ".png"
					,buttonDimSmall.x, buttonDimSmall.y, buttonDim.wsmall, buttonDim.hsmall, undefined, {
						zIndex: 71,
					});
				//DrawImageEx(KinkyDungeonRootDirectory + "Spells/" + spellPaged.name + ".png", buttonDim.x - buttonDim.wsmall * page, buttonDim.y, {
				//Width: buttonDim.wsmall,
				//Height: buttonDim.hsmall,
				//});
				if ((KinkyDungeoCheckComponents(spellPaged).failed.length > 0 || (spellPaged.components.includes("Verbal") && !KinkyDungeonStatsChoice.get("Incantation") && KinkyDungeonGagTotal() > 0 && !spellPaged.noMiscast))) {
					let sp = "SpellFail";
					if (spellPaged.components.includes("Verbal") && !KinkyDungeonStatsChoice.get("Incantation") && KinkyDungeonGagTotal() < 1) {
						sp = "SpellFailPartial";
					}
					KDDraw(kdcanvas, kdpixisprites, "spellFail" + icon + "," + page + "," + indexPaged, KinkyDungeonRootDirectory + "Spells/" + sp + ".png",
						buttonDimSmall.x, buttonDimSmall.y, buttonDim.wsmall, buttonDim.hsmall, undefined, {
							zIndex: 72,
						});

					//DrawImageEx(KinkyDungeonRootDirectory + "Spells/" + sp + ".png", buttonDim.x + 2 - buttonDim.wsmall * page, buttonDim.y + 2, {
					//Width: buttonDim.wsmall,
					//Height: buttonDim.hsmall,
					//});
				}
			} else if (item) {

				icon += 1;
				let prev = KDGetItemPreview({name: item, type: consumable ? Consumable : (arm ? LooseRestraint : Weapon)});
				if (prev) {
					KDDraw(kdcanvas, kdpixisprites, "spellIcon" + icon + "," + indexPaged,  prev.preview
						,buttonDimSmall.x, buttonDimSmall.y, buttonDim.wsmall, buttonDim.hsmall, undefined, {
							zIndex: 71,
						});
					if (prev.preview2)
						KDDraw(kdcanvas, kdpixisprites, "spellIcon2" + icon + "," + indexPaged,  prev.preview2
							,buttonDimSmall.x, buttonDimSmall.y, buttonDim.wsmall, buttonDim.hsmall, undefined, {
								zIndex: 71,
							});
					DrawButtonKD("UseItem" + indexPaged, true, buttonDimSmall.x, buttonDimSmall.y, buttonDim.wsmall, buttonDim.hsmall, "",
						"rgba(0, 0, 0, 0)", "", "", false, true);

				}


				if (consumable) {
					let con = KinkyDungeonInventoryGetConsumable(consumable);
					//if (con) {
					DrawTextFitKD((con?.quantity || 0) + "x", buttonDimSmall.x + buttonDim.hsmall - 1, buttonDimSmall.y + buttonDim.hsmall - 6, 50,
						"#ffffff", KDTextGray0, 12, "right");
					//}
				}

				if (!KinkyDungeonInventoryGet(item)) {
					let sp = "SpellFail";
					KDDraw(kdcanvas, kdpixisprites, "spellFail" + icon + "," + page + "," + indexPaged, KinkyDungeonRootDirectory + "Spells/" + sp + ".png",
						buttonDimSmall.x, buttonDimSmall.y, buttonDim.wsmall, buttonDim.hsmall, undefined, {
							zIndex: 72,
						});
				}
			}
		}
	}
}

function KDCycleSpellPage(reverse: boolean = false, noWrap: boolean = false, force: boolean = false) {
	const max_choices = Math.max (KinkyDungeonSpellChoices.length, KinkyDungeonConsumableChoices.length, KinkyDungeonWeaponChoices.length, KinkyDungeonArmorChoices.length)

	if (reverse) {
		KDSpellPage -= 1;
	} else KDSpellPage += 1;

	if (KDSpellPage < 0) {
		if (!noWrap)
			KDSpellPage = Math.floor((Math.max(0, (force ? KinkyDungeonSpellChoiceCount : max_choices) - 1))/KinkyDungeonSpellChoiceCountPerPage);
		else KDSpellPage = 0;
	}
	if (KDSpellPage * KinkyDungeonSpellChoiceCountPerPage >= (force ? KinkyDungeonSpellChoiceCount : max_choices)) {
		if (!noWrap)
			KDSpellPage = 0;
		else {
			KDSpellPage = Math.floor((Math.max(0, (force ? KinkyDungeonSpellChoiceCount : max_choices) - 1))/KinkyDungeonSpellChoiceCountPerPage);
		}
	}
}
function KinkyDungeonCanSleep() {
	if (KDGameData.CurrentVibration) return false;
	else return true;
}

function KDLinspace(min: number, max: number, steps: number): number[] {
	if (steps == 0 || Number.isNaN(steps)) return [];
	let spaces: number[] = [];
	for (let i = 0; i < steps; i+= 1) {
		spaces.push(min + i * (max - min) / steps);
	}
	return spaces;
}

function KDSteps(max: number, step: number, maxStep: number = 20): number[] {
	if (step == 0 || Number.isNaN(step)) return [];
	let spaces: number[] = [];
	for (let i = 0; i < Math.ceil(Math.abs(max / step)) && i < maxStep; i+= 1) {
		spaces.push(step > 0 ? step * i : max + step * i);
	}
	return spaces;
}

/**
 * @param x
 * @param y
 * @param width
 */
function KDDrawStatusBars(x: number, y: number, width: number = 125) {
	// Draw labels
	let buttonWidth = 48;
	let heightPerBar = 24;
	let offBarHeight = 7;
	let suff = (!KinkyDungeonCanDrink()) ? "Unavailable" : "";
	if (suff == "Unavailable") {
		let allowPotions = KinkyDungeonPotionCollar();
		if (allowPotions)
			suff = "";
	}
	let distRate = KDGetDistractionRate(0);
	let attackCost = Math.min(-0.5, KDAttackCost());


	let barWidthOffset2ndSet = 0;
	let barHeightOffset2ndSet = 2.5;
	let barAmountScale = 0;
	let barBaseScale = 1.0;
	let flip = KDToggles.FlipStatusBars ? -1 : 1;

	// Draw Stamina
	KinkyDungeonBar(x - 5, y + 5 - 2.5*heightPerBar, flip * width * (barBaseScale + barAmountScale*KinkyDungeonStatStaminaMax/KDMaxStatStart), heightPerBar, 100*KinkyDungeonStatStamina/KinkyDungeonStatStaminaMax,
		"#4fd658", "#222222", KDGameData.LastSP/KinkyDungeonStatStaminaMax * 100,
		KDGameData.LastSP > KinkyDungeonStatStamina ? "#e64539" : "#ffee83",
		KDSteps(KinkyDungeonStatStamina/KinkyDungeonStatStaminaMax, attackCost/KinkyDungeonStatStaminaMax), "#283540", "#4fd658");
	DrawTextFitKD(
		TextGet("StatStamina").replace("MAX", KinkyDungeonStatStaminaMax*10 + "")
			.replace("CURRENT", Math.floor(KinkyDungeonStatStamina*10) + ""),
		x, y - 5 - 1.5*heightPerBar, 200, "#ffffff", "#000000", 16, "left", undefined, undefined, 4);

	DrawButtonKDEx("usePotionStamina", (_b) => {
		//if (KinkyDungeonCanTalk(true) || KinkyDungeonPotionCollar())
			// Done, converted to input
		KDSendInput("consumable", {item: "PotionStamina", quantity: 1});
		//else KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonPotionGagged"), "orange", 1);
		return true;
	}, KinkyDungeonItemCount("PotionStamina") && KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax,
	x - buttonWidth/1.85 , y - 5 - 2.5*heightPerBar + 10, buttonWidth, 26, "", (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax && KinkyDungeonItemCount("PotionStamina")) ? "#AAFFAA" : "#333333",
	KinkyDungeonRootDirectory + "UI/UsePotion" + ((suff == "Unavailable") ? "" : "Stamina") + suff + ".png", "", false, true);
	DrawTextFitKD(KinkyDungeonItemCount("PotionStamina") + 'x',
		x - buttonWidth, y - 5 - 2*heightPerBar + heightPerBar/2, buttonWidth, "#ffffff", "#333333", 14, "left");


	// Draw mana
	KinkyDungeonBar(x - 5, y - 1*heightPerBar, flip * width * (barBaseScale + barAmountScale*KinkyDungeonStatManaMax/KDMaxStatStart), heightPerBar, 100*KinkyDungeonStatMana/KinkyDungeonStatManaMax,
		"#4fa4b8", "#222222", KDGameData.LastMP/KinkyDungeonStatManaMax * 100,
		KDGameData.LastMP > KinkyDungeonStatMana ? "#2d5782" : "#92e8c0",
		KDLinspace(0, 1, Math.ceil(KinkyDungeonStatManaMax/5)), "#4c6885", "#4fa4b8");
	KinkyDungeonBar(x - 5, y - offBarHeight, flip * width * (barBaseScale + barAmountScale*KinkyDungeonStatManaMax/KDMaxStatStart), offBarHeight, 100*KinkyDungeonStatManaPool/KinkyDungeonStatManaPoolMax,
		"#efefff", "none", undefined, undefined, undefined, undefined, undefined, 56);
	DrawTextFitKD(
		TextGet("StatMana").replace("MAX", KinkyDungeonStatManaMax*10 + "")
			.replace("CURRENT", Math.floor(KinkyDungeonStatMana*10) + ""),
		x, y - 0.5*heightPerBar, 200, "#ffffff", "#000000", 16, "left", undefined, undefined, 4);
	DrawButtonKDEx("usePotionMana", (_b) => {
		//if (KinkyDungeonCanTalk(true) || KinkyDungeonPotionCollar())
			// Done, converted to input
		KDSendInput("consumable", {item: "PotionMana", quantity: 1});
		//else KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonPotionGagged"), "orange", 1);
		return true;
	}, KinkyDungeonItemCount("PotionMana") && (KinkyDungeonStatMana < KinkyDungeonStatManaMax || KinkyDungeonStatManaPool < KinkyDungeonStatManaPoolMax),
	x - buttonWidth/1.85, y - 1.5*heightPerBar + 10, buttonWidth, 26, "", (KinkyDungeonStatMana < KinkyDungeonStatManaMax && KinkyDungeonItemCount("PotionMana")) ? "#AAAAFF" : "#333333",
	KinkyDungeonRootDirectory + "UI/UsePotion" + ((suff == "Unavailable") ? "" : "Mana") + suff + ".png", "", false, true);

	DrawTextFitKD(KinkyDungeonItemCount("PotionMana") + 'x',
		x - buttonWidth, y - 1*heightPerBar + heightPerBar/2, buttonWidth, "#ffffff", "#333333", 14, "left");



	// Draw distraction
	KinkyDungeonBar(x - 5 + width * barWidthOffset2ndSet, y - 0.75*heightPerBar + heightPerBar * barHeightOffset2ndSet, flip * width * (barBaseScale + barAmountScale*KinkyDungeonStatDistractionMax/KDMaxStatStart), heightPerBar/2,
		100*KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax, "#ff5277",
		"#692464", KDGameData.LastAP/KinkyDungeonStatDistractionMax * 100,
		KDGameData.LastAP > KinkyDungeonStatDistraction ? "#aaaaaa" : "#ffa1b4",
		distRate < 0 ? KDSteps(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax, KDGetDistractionRate(0)/KinkyDungeonStatDistractionMax, 3) : undefined, distRate < 0 ? "#692464" : undefined, distRate < 0 ? "#692464" : undefined);
	if (KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax >= 0.05) {
		KDDraw(kdcanvas, kdpixisprites, "dist_lower", KinkyDungeonRootDirectory + "UI/Heart.png",
			x - heightPerBar*0.32 + (flip < 0 ? width * (1 - KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax) : width * KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax),
			y + heightPerBar * barHeightOffset2ndSet - heightPerBar*0.28,
			undefined, undefined, undefined, {
				zIndex: 57,
			});
		KinkyDungeonBar(x - 5 + width * barWidthOffset2ndSet, y - 0.18*heightPerBar + heightPerBar * barHeightOffset2ndSet, flip * width * (barBaseScale + barAmountScale*KinkyDungeonStatDistractionMax/KDMaxStatStart),
			offBarHeight, 100*KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax,
			"#ff5277", "none", undefined, undefined, undefined, undefined, undefined, 56);

	}
	let showRaw = MouseIn(
		x - 5 + width * barWidthOffset2ndSet,
		y - 5 - 1*heightPerBar + heightPerBar * barHeightOffset2ndSet,
		flip * width * (barBaseScale + barAmountScale*KinkyDungeonStatDistractionMax/KDMaxStatStart),
		heightPerBar
	);
	if (KDToggles.RawDP) {
		showRaw = !showRaw;
	}
	DrawTextFitKD(
		!showRaw ? TextGet("StatDistraction")
			.replace("PERCENT", "" + Math.round(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * 100))
			: TextGet("StatDistractionHover")
			.replace("MAX", KinkyDungeonStatDistractionMax*10 + "")
			.replace("CURRENT", Math.floor(KinkyDungeonStatDistraction*10) + "")
			.replace("PERCENT", "" + Math.round(KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax * 100))

			,
		x  + width * barWidthOffset2ndSet, y + heightPerBar * barHeightOffset2ndSet - 1 - 0.5*heightPerBar, 200, "#ffffff", "#000000", 16, "left", undefined, undefined, 4);

	DrawButtonKDEx("usePotionFrigid", (_b) => {
		//if (KinkyDungeonCanTalk(true) || KinkyDungeonPotionCollar())
			// Done, converted to input
		KDSendInput("consumable", {item: "PotionFrigid", quantity: 1});
		//else KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonPotionGagged"), "orange", 1);
		return true;
	}, KinkyDungeonItemCount("PotionFrigid") && KinkyDungeonStatDistraction > 0,
	x - buttonWidth/1.85 + width * barWidthOffset2ndSet, y + heightPerBar * barHeightOffset2ndSet - 1.5*heightPerBar + 10, buttonWidth, 26, "", (KinkyDungeonStatDistraction > 0 && KinkyDungeonItemCount("PotionFrigid")) ? "#333333" : "Pink",
	KinkyDungeonRootDirectory + "UI/UsePotion" + ((suff == "Unavailable") ? "" : "Frigid") + suff + ".png", "", false, true);

	DrawTextFitKD(KinkyDungeonItemCount("PotionFrigid") + 'x',
		x - buttonWidth + width * barWidthOffset2ndSet, y + heightPerBar * barHeightOffset2ndSet - 1*heightPerBar + heightPerBar/2, buttonWidth, "#ffffff", "#333333", 14, "left");



	// Draw will
	KinkyDungeonBar(x - 5 + width * barWidthOffset2ndSet, y - 5 - 2*heightPerBar + heightPerBar * barHeightOffset2ndSet, flip * width * (barBaseScale + barAmountScale*KinkyDungeonStatDistractionMax/KDMaxStatStart), heightPerBar,
		100*KinkyDungeonStatWill/KinkyDungeonStatWillMax, "#ff4444", "#222222",
		KDGameData.LastWP/KinkyDungeonStatWillMax * 100,
		KDGameData.LastAP > KinkyDungeonStatWill ? "#aa0000" : "#ffee83",
		KDLinspace(0, 1, 4), "#222222", "#ff4444");
	DrawTextFitKD(
		TextGet("StatWill")
			.replace("MAX", KinkyDungeonStatWillMax*10 + "").replace("CURRENT", Math.floor(KinkyDungeonStatWill*10) + ""),
		x + width * barWidthOffset2ndSet, y - 5 + heightPerBar * barHeightOffset2ndSet - 1.5*heightPerBar, 200, "#ffffff", "#000000", 16, "left", undefined, undefined, 4);


	DrawButtonKDEx("usePotionWill", (_b) => {
		//if (KinkyDungeonCanTalk(true) || KinkyDungeonPotionCollar())
			// Done, converted to input
		KDSendInput("consumable", {item: "PotionWill", quantity: 1});
		//else KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonPotionGagged"), "orange", 1);
		return true;
	}, KinkyDungeonItemCount("PotionWill") && KinkyDungeonStatWill < KinkyDungeonStatWillMax,
	x - buttonWidth/1.85 + width * barWidthOffset2ndSet, y + heightPerBar * barHeightOffset2ndSet - 5 - 2.5*heightPerBar + 10, buttonWidth, 26, "", (KinkyDungeonStatWill < KinkyDungeonStatWillMax && KinkyDungeonItemCount("PotionWill")) ? "#ff4444" : "#333333",
	KinkyDungeonRootDirectory + "UI/UsePotion" + ((suff == "Unavailable") ? "" : "Will") + suff + ".png", "", false, true);

	DrawTextFitKD(KinkyDungeonItemCount("PotionWill") + 'x',
		x - buttonWidth + width * barWidthOffset2ndSet, y + heightPerBar * barHeightOffset2ndSet - 5 - 2*heightPerBar +  heightPerBar/2, buttonWidth, "#ffffff", "#333333", 14, "left");




}

function KDDrawWeaponSwap(x: number, y: number): boolean {
	let heightPerBar = 24;
	let buttonWidth = 48;
	let chargeX = 1775;

	//let stats = KDGetStatsWeaponCast();

	// Draw ancient
	if (KDGameData.AncientEnergyLevel > 0 || KinkyDungeonInventoryGet("AncientPowerSource")) {
		KinkyDungeonBar(chargeX + 5, 830 + 0.25*heightPerBar - 72, 200, heightPerBar*0.5, 100*KDGameData.AncientEnergyLevel, "#ffee83", "#3b2027", 100*KDGameData.OrigEnergyLevel, "#ffffff");

		DrawTextFitKD(TextGet("StatAncient").replace("PERCENT", Math.round(KDGameData.AncientEnergyLevel*1000) + ""),
			chargeX + 100, 830 - 72, 200 , (KDGameData.AncientEnergyLevel > 0.01) ? "#ffffff" : "pink", "#333333", 16, "center");
		DrawButtonKDEx("potionAncient",
			(_bdata) => {
				KDSendInput("consumable", {item: "AncientPowerSource", quantity: 1});
				return true;
			}, KDGameData.AncientEnergyLevel < 1.0 && KinkyDungeonItemCount("AncientPowerSource") != 0,
			chargeX-buttonWidth, 830 - 0.5*heightPerBar + 10 - 72, buttonWidth, 26, "",
			(KDGameData.AncientEnergyLevel < 1.0 && KinkyDungeonItemCount("AncientPowerSource")) ? "#ffee83" : "#333333",
			KinkyDungeonRootDirectory + "UI/UsePotionAncient.png", "", false, true);

		DrawTextFitKD("x" + KinkyDungeonItemCount("AncientPowerSource"), chargeX, 830 + heightPerBar/2 - 72, buttonWidth, "#ffffff", "#333333", 18, "right");
	}


	let width = 144;
	/*let XX = x - 48;
	let YY = y;
	let spriteSize = 48;
	let tooltip = false;

	for (let s of Object.entries(stats)) {
		let stat = s[1];
		if (stat.count)
			DrawTextFitKD(stat.count, XX + spriteSize/2, YY + spriteSize/2 - 10, spriteSize, stat.countcolor || "#ffffff", "#000000",
				16, undefined, 114, 0.8, 5);

		if (!tooltip && MouseIn(XX, YY - Math.ceil(spriteSize/2), spriteSize, spriteSize)) {
			DrawTextFitKD(stat.text, x - 400, y - 48, 600, stat.color, "#000000", 22, "left", 160, 1.0, 8);
			tooltip = true;
			if (stat.click) {
				DrawButtonKDEx("statHighlight" + stat[0], (bdata) => {
					KDSendInput("buffclick", {
						click: stat.click,
						buff: stat.buffid,
					});
					return true;
				}, true,
				XX, YY - Math.ceil(spriteSize/2), spriteSize, spriteSize, undefined, "#ffffff",
				undefined, undefined, false, true, undefined, undefined, undefined,
				{
					zIndex: 10,
				});
			}
		}

		KDDraw(kdstatusboard, kdpixisprites, "wstat" + YY + stat[0], KinkyDungeonRootDirectory + "Buffs/" + (stat.icon || "buff/buff") + ".png",
			XX, YY - Math.ceil(spriteSize/2) , spriteSize, spriteSize, undefined, {
				zIndex: 151,
			});

		YY += spriteSize;
	}*/

	let hover = false;

	if (KDGameData.PreviousWeapon?.length > 0) {
		let ii = 0;
		for (let wep of KDGameData.PreviousWeapon) {
			if (ii >= KDMaxPreviousWeapon) break;
			let Index = ii;
			if (wep && KDWeapon({name: wep}) && DrawButtonKDEx("previousweapon" + wep + "," + ii,(_bdata) => {
				if (!KinkyDungeonControlsEnabled()) return false;
				if (KinkyDungeonInventoryGet(wep))
					KDSwitchWeapon(wep, Index);
				else
					KDSwitchWeapon("Unarmed", Index);
				return true;
			}, KDGameData.PreviousWeapon != undefined, x + 10 + 0.45*width + (ii*0.35*width), y-0.35*width, 0.35*width, 0.35*width, "", "#ffffff",
			KinkyDungeonRootDirectory + "Items/" + KDWeapon({name: wep})?.name + ".png",
			undefined, undefined, KDWeaponSwitchPref != ii, !KinkyDungeonInventoryGet(wep) ? "#ff5555" : undefined, undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySwitchWeapon[ii]),
				scaleImage: true,
			})) {
				if (KDWeapon(KinkyDungeonInventoryGetWeapon(wep))) {
					let inv = KinkyDungeonInventoryGetWeapon(wep);
					if (inv) KinkyDungeonDrawInventorySelected(KDGetItemPreview(inv), false, true, 0);
				}
				hover = true;
			}
			ii += 1;
		}
	}
	if (KinkyDungeonPlayerWeapon && KinkyDungeonInventoryGetWeapon(KinkyDungeonPlayerWeapon)) {
		DrawTextFitKD(TextGet("StatWeapon") + KDGetItemName({name: KinkyDungeonPlayerWeapon, type: Weapon, id: -1}),
			x + 0.45/2*width, y - 16, width, "#ffffff", "#333333", 16);
	}
	if (DrawButtonKDEx("switchWeapon", (_bdata) => {
		if (!KinkyDungeonControlsEnabled()) return false;
		KDSwitchWeapon();
		return true;
	}, KDGameData.PreviousWeapon != undefined, x, y - 0.45*width, 0.45*width, 0.45*width, "", "#ffffff",
	KinkyDungeonPlayerWeapon && KinkyDungeonInventoryGetWeapon(KinkyDungeonPlayerWeapon) ?
		KinkyDungeonRootDirectory + "Items/" + KDWeapon({name: KinkyDungeonPlayerWeapon})?.name + ".png"
		: KinkyDungeonRootDirectory + "Items/Unarmed.png",
	undefined, undefined, true, undefined, undefined, undefined, {
		//hotkey: KDHotkeyToText(KinkyDungeonKeySwitchWeapon[0]),
		scaleImage: true,
	})) {
		if (KDWeapon(KinkyDungeonInventoryGetWeapon(KinkyDungeonPlayerWeapon))) {
			let inv = KinkyDungeonInventoryGetWeapon(KinkyDungeonPlayerWeapon);
			if (inv) KinkyDungeonDrawInventorySelected(KDGetItemPreview(inv), false, true, 0);
		}
	}
	return hover;
}

function KinkyDungeonDrawActionBar(_x: number, _y: number) {
	let str = "";
	let BalanceOffset = KDToggles.BuffSide ? 850 : 800;
	if (KDGameData.Balance < 1 && !KinkyDungeonStatsChoice.get("TrustFall")) {
		DrawTextFitKDTo(kdstatusboard, TextGet(KDBalanceSprint() ? "KDBalance" : "KDBalanceNoSprint").replace("AMNT", "" + Math.round(KDGameData.Balance * 100)), 1000, BalanceOffset, 300, "#ffffff", KDTextGray2,
			24, "left", 110, 0.9);
		KinkyDungeonBarTo(kdstatusboard, 1000, BalanceOffset + 8, 500, 12, 100*KDGameData.Balance,
			"#4fd658", "#283540", KDGameData.Balance * 100, "#ffee83",
			KDSteps(KDGameData.Balance, -KDGetBalanceCost()*1.5), "#283540", "#4fd658");

		if (!KDGameData.Training) KDGameData.Training = {};
		DrawTextFitKDTo(kdstatusboard, TextGet("KDBalanceTraining")
		.replace("AMNT", "" + (KDGameData.Training.Heels?.training_stage || 0)),
			1500, BalanceOffset, 200, "#ffffff", KDTextGray2,
			10, "right", 111, 0.9);

	}

	if (DrawButtonKDEx("RestHide", (_bdata) => {
		KinkyDungeonDrawStruggle += 1;
		if (KinkyDungeonDrawStruggle > 3) KinkyDungeonDrawStruggle = 0;
		return true;
	}, true, 510, 925, 60, 60, "", KinkyDungeonStruggleGroups.length > 0 ? "#ffffff" : "#333333", KinkyDungeonRootDirectory + "Hide" + (
		KinkyDungeonDrawStruggle == KDDrawStruggleEnum.FULL ? "Full" :
		(KinkyDungeonDrawStruggle == KDDrawStruggleEnum.MOST ? "Most" :
		(KinkyDungeonDrawStruggle == KDDrawStruggleEnum.STRUGGLE ? "Struggle" :
		(KinkyDungeonDrawStruggle == KDDrawStruggleEnum.NONE ? "True" :
		"False")))) + ".png", "")) str = "KDHideRest";
	if (MouseIn(0, 0, 500, 1000) || MouseIn(500, 900, 320, 200) || KDPlayerSetPose || KDToggleXRay) {
		if (StandalonePatched) {
			if (DrawButtonKDEx("SetPose", (_bdata) => {
				KDPlayerSetPose = !KDPlayerSetPose;
				return true;
			}, true, 650, 925, 60, 60, "", "#ffffff", KinkyDungeonRootDirectory + "Poses/SetPose.png", "", false, false,
			KDPlayerSetPose ? KDTextGray3 : KDButtonColor)) str = "KDSetPose";
		}
		if (DrawButtonKDEx("ToggleXray", (_bdata) => {
			KDToggleXRay += 1;
			if (KDToggleXRay > (StandalonePatched ? 2 : 1)) KDToggleXRay = 0;

			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer(KinkyDungeonPlayer, false, true);
			return true;
		}, true, 580, 925, 60, 60, "", "#ffffff", KinkyDungeonRootDirectory + "UI/XRay" + KDToggleXRay + ".png", "", false, false,
			KDToggleXRay ? KDTextGray3 : KDButtonColor)) str = "KDXRay";
	}
	if (MouseIn(0, 0, 500, 1000) || MouseIn(500, 900, 320, 200) || KDBulletTransparency || KDMapData.Bullets?.length > 0) {
		if (DrawButtonKDEx("SetTransparentBullets", (_bdata) => {
			KDBulletTransparency = !KDBulletTransparency;
			return true;
		}, true, 720, 925, 60, 60, "", "#ffffff", KinkyDungeonRootDirectory + "UI/BulletTransparency.png", "", false, false,
		KDBulletTransparency ? KDTextGray3 : KDButtonColor, undefined, undefined)) str = "KDBulletTransparency";
	}
	if (KDPlayerSetPose) {
		KDPlayerDrawPoseButtons(KinkyDungeonPlayer);
	}


	let actionBarWidth = 64;
	let actionbarHeight = 60;
	let actionBarSpacing = actionBarWidth + 5;
	//let actionBarSpacingV = actionbarHeight + 5;
	//let actionBarVertStart = 560;
	let actionBarII = 0;
	let actionBarXX = 2000 - 5 * actionBarSpacing;
	let actionBarYY = 925;


	let resourcesX = 505;
	let resourceSpacing = 50;
	let resourcesIndex = 0;
	let resourcesY = 825 - 10 - 1 * resourceSpacing;


	KDDraw(kdcanvas, kdpixisprites, "gold", KinkyDungeonRootDirectory + "Items/Gold.png", resourcesX - 8, resourcesY - 10 + resourcesIndex*resourceSpacing, 80, 80, undefined, {
		zIndex: 90
	});
	DrawTextFitKD("" + KinkyDungeonGold, resourcesX + 32, resourcesY + 40 + resourcesIndex*resourceSpacing, 80, "#ffffff", "#333333", 18, undefined, 90);
	if (MouseIn(resourcesX - 10, resourcesY + resourcesIndex*resourceSpacing, 80, 80))
		DrawTextKD(TextGet("KinkyDungeonInventoryItemGold"),
			resourcesX + 60, MouseY, "#ffffff", "#333333", 24, "left");
	resourcesIndex--;

	if (KDShowQuickInv() || (KinkyDungeonDrawStruggle == KDDrawStruggleEnum.FULL || KinkyDungeonDrawStruggle == KDDrawStruggleEnum.STRUGGLE || MouseIn(0, 0, 500, 1000))) {
		KDDraw(kdcanvas, kdpixisprites, "pick", KinkyDungeonRootDirectory + "Items/Pick.png", resourcesX, resourcesY + resourcesIndex*resourceSpacing, 50, 50, undefined, {
			zIndex: 90
		});
		DrawTextFitKD("" + KinkyDungeonItemCount("Pick"), resourcesX + 25, resourcesY + 40 + resourcesIndex*resourceSpacing, 50, "#ffffff", "#333333", 18, undefined, 90);
		if (MouseIn(resourcesX, resourcesY + resourcesIndex*resourceSpacing, 50, 50))
			DrawTextKD(TextGet("KinkyDungeonInventoryItemLockpick"),
				resourcesX + 60, MouseY, "#ffffff", "#333333", 24, "left");


		resourcesIndex--;
		KDDraw(kdcanvas, kdpixisprites, "redkey", KinkyDungeonRootDirectory + "Items/RedKey.png", resourcesX, resourcesY + resourcesIndex*resourceSpacing, 50, 50, undefined, {
			zIndex: 90
		});
		DrawTextFitKD("" + KinkyDungeonItemCount("RedKey"), resourcesX + 25, resourcesY + 40 + resourcesIndex*resourceSpacing, 50, "#ffffff", "#333333", 18, undefined, 90);
		if (MouseIn(resourcesX, resourcesY + resourcesIndex*resourceSpacing, 50, 50))
			DrawTextKD(TextGet("KinkyDungeonInventoryItemRedKey"),
				resourcesX + 60, MouseY, "#ffffff", "#333333", 24, "left");

		resourcesIndex--;


		if (KinkyDungeonItemCount("BlueKey") > 0) {
			KDDraw(kdcanvas, kdpixisprites, "bluekey", KinkyDungeonRootDirectory + "Items/BlueKey.png", resourcesX, resourcesY + resourcesIndex*resourceSpacing, 50, 50, undefined, {
				zIndex: 90
			});
			DrawTextFitKD("" + KinkyDungeonItemCount("BlueKey"), resourcesX + 25, resourcesY + 40 + resourcesIndex*resourceSpacing, 50, "#ffffff", "#333333", 18, undefined, 90);
			if (MouseIn(resourcesX, resourcesY + resourcesIndex*resourceSpacing, 50, 50))
				DrawTextKD(TextGet("KinkyDungeonInventoryItemMagicKey"),
					resourcesX + 60, MouseY, "#ffffff", "#333333", 24, "left");
		}
	}


	if (DrawButtonKDEx("openQuickInv", (_b) => {
		KinkyDungeonShowInventory = !KinkyDungeonShowInventory;
		return true;
	}, true, 510, 825, 60, 90, "", "#ffffff", KinkyDungeonRootDirectory + (KinkyDungeonShowInventory ? "BackpackOpen.png" : "Backpack.png"), "",
	undefined, undefined, undefined, undefined, undefined,
	{
		hotkey: KDHotkeyToText(KinkyDungeonKeyMenu[0]),
	})) str = "KDQuickInv";


	// Weapon Switch
	if (KDDrawWeaponSwap(actionBarXX-5 + 72, actionBarYY - 5 - 80)) {
		// Draw the tooltip and show the weapon info
		str = "KDSwitchWeapon";

	}
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.special) {
		if (MouseIn(580, 825, 50, 90)) DrawTextFitKD(TextGet("KinkyDungeonSpecial" + KinkyDungeonPlayerDamage.name), MouseX, MouseY - 150, 750, "#ffffff", "#333333");
		DrawButtonKDEx("rangedattackButton", (_b) => {
			return KinkyDungeonRangedAttack();
		}, true, 580, 825, 50, 90, "", "#ffffff", KinkyDungeonRootDirectory + "Ranged.png", "",
		undefined, undefined, undefined, undefined, undefined,
		{
			hotkey: KDHotkeyToText(KinkyDungeonKeyWeapon[0]),
		});
	}



	// Vertical
	/*
	actionBarII = 0;
	if (!KDToggles.TransparentUI) {
		DrawRectKD(
			kdcanvas, kdpixisprites, "actionvborder", {
				Left: 1990 - actionBarWidth - 5, Top: actionBarVertStart - 5, Width: actionBarWidth + 10,
				Height: (5+actionbarHeight)*4 + 10,
				Color: KDUIColorHighlight, alpha: KDUIAlphaHighlight, zIndex: -2,
				LineWidth: 2,
			}
		);
		FillRectKD(
			kdcanvas, kdpixisprites, "actionvbg", {
				Left: 1990 - actionBarWidth - 5, Top: actionBarVertStart - 5, Width: actionBarWidth + 10,
				Height: (5+actionbarHeight)*4 + 10,
				Color: KDUIColor, alpha: KDUIAlpha, zIndex: -1
			}
		);
	}
	if (DrawButtonKDEx("toggleInspect", (bdata) => {
		KinkyDungeonInspect = !KinkyDungeonInspect;
		return true;
	}, true, 1990 - actionBarWidth, actionBarVertStart + actionBarSpacingV*actionBarII++, actionBarWidth, actionbarHeight,
	"", "", KinkyDungeonRootDirectory + (KinkyDungeonInspect ? "UI/Inspect" : "UI/Inspect") + ".png",
	undefined, undefined, !KinkyDungeonInspect, KDTextGray05, undefined, false, {alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[5]),
	})) str = "KDInspect";

	// Auto Struggle Button
	if (DrawButtonKDEx("AutoStruggle", (bdata) => {
		if (!KinkyDungeonControlsEnabled()) return false;
		KDAutoStruggleClick();
		return true;
	}, true, 1990 - actionBarWidth, actionBarVertStart + actionBarSpacingV*actionBarII++, actionBarWidth, actionbarHeight, "", "",
	KinkyDungeonRootDirectory + ("UI/AutoStruggle.png"), undefined, undefined, !KinkyDungeonAutoWaitStruggle, KDTextGray05, undefined, false,
	{
		alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[3]),
	})) str = "KDAutoStruggle";

	// Pass button
	if (DrawButtonKDEx("togglePass", (bdata) => {
		KinkyDungeonToggleAutoPass = !KinkyDungeonToggleAutoPass;
		if (KinkyDungeonToggleAutoPass) {
			KDSetFocusControl("AutoPass");
		} else {
			KDSetFocusControl("");
		}
		return true;
	}, true, 1990 - actionBarWidth, actionBarVertStart + actionBarSpacingV*actionBarII++, actionBarWidth, actionbarHeight, "", "",
	KinkyDungeonRootDirectory + (KinkyDungeonToggleAutoPass ? "UI/Pass.png" : "UI/NoPass.png"),
	undefined, undefined, !KinkyDungeonToggleAutoPass, KDTextGray05, undefined, false, {alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[1]),
	})) str = "KDPass";

	if (DrawButtonKDEx("toggleFastMove", (bdata) => {
		if (!KinkyDungeonFastMoveSuppress)
			KinkyDungeonFastMove = !KinkyDungeonFastMove;
		KinkyDungeonFastMoveSuppress = false;
		KinkyDungeonFastMovePath = [];
		KDSetFocusControl("AutoPath");
		return true;
	}, true, 1990 - actionBarWidth, actionBarVertStart + actionBarSpacingV*actionBarII++, actionBarWidth, actionbarHeight,
	"", "", KinkyDungeonRootDirectory + (KinkyDungeonFastMove ? "FastMove" : "FastMoveOff") + ".png",
	undefined, undefined, !KinkyDungeonFastMove, KDTextGray05, undefined, false, {alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[4]),
	})) str = "KDAutoPath";*/

	// Horizontal second layer
	actionBarII = 0;
	/*if (!KDToggles.TransparentUI) {
		DrawRectKD(
			kdcanvas, kdpixisprites, "actionvborder", {
				Left: actionBarXX + actionBarSpacing*actionBarII - 5, Top: actionBarYY - 80 - 5, Width: actionBarSpacing*4 + 5,
				Height: 80,
				Color: KDUIColorHighlight, alpha: KDUIAlphaHighlight, zIndex: -2,
				LineWidth: 2,
			}
		);
		FillRectKD(
			kdcanvas, kdpixisprites, "actionvbg", {
				Left: actionBarXX + actionBarSpacing*actionBarII - 5, Top: actionBarYY - 80 - 5, Width: actionBarSpacing*4 + 10,
				Height: 80,
				Color: KDUIColor, alpha: KDUIAlpha, zIndex: -1
			}
		);
	}*/


	// Crouch button
	if (DrawButtonKDEx("toggleCrouch", (_bdata) => {
		KDSendInput("crouch", {});

		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY - 80, actionBarWidth, actionbarHeight, "", "",
	KinkyDungeonRootDirectory + (KDGameData.Crouch ? "UI/CrouchOn.png" : "UI/CrouchOff.png"),
	undefined, undefined, !KDGameData.Crouch, KDTextGray05, undefined, false, {alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[9]),
		hotkeyPress: KinkyDungeonKeyToggle[9],
	})) str = "KDCrouch";

	// Pass button
	if (DrawButtonKDEx("togglePass", (_bdata) => {
		KinkyDungeonToggleAutoPass = !KinkyDungeonToggleAutoPass;
		if (KinkyDungeonToggleAutoPass) {
			KDSetFocusControl("AutoPass");
		} else {
			KDSetFocusControl("");
		}
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY - 80, actionBarWidth, actionbarHeight, "", "",
	KinkyDungeonRootDirectory + (KinkyDungeonToggleAutoPass ? "UI/Pass.png" : "UI/NoPass.png"),
	undefined, undefined, !KinkyDungeonToggleAutoPass, KDTextGray05, undefined, false, {alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[1]),
	})) str = "KDPass";

	if (DrawButtonKDEx("toggleFastMove", (_bdata) => {
		if (!KinkyDungeonFastMoveSuppress)
			KinkyDungeonFastMove = !KinkyDungeonFastMove;
		KinkyDungeonFastMoveSuppress = false;
		KinkyDungeonFastMovePath = [];
		KDSetFocusControl("AutoPath");
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY - 80, actionBarWidth, actionbarHeight,
	"", "", KinkyDungeonRootDirectory + (KinkyDungeonFastMove ? "FastMove" : "FastMoveOff") + ".png",
	undefined, undefined, !KinkyDungeonFastMove, KDTextGray05, undefined, false, {alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[4]),
	})) str = "KDAutoPath";

	// Auto Struggle Button
	if (DrawButtonKDEx("AutoStruggle", (_bdata) => {
		if (!KinkyDungeonControlsEnabled()) return false;
		KDAutoStruggleClick();
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY - 80, actionBarWidth, actionbarHeight, "", "",
	KinkyDungeonRootDirectory + ("UI/AutoStruggle.png"), undefined, undefined, !KinkyDungeonAutoWaitStruggle, KDTextGray05, undefined, false,
	{
		alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[3]),
	})) str = "KDAutoStruggle";

	if (DrawButtonKDEx("toggleInspect", (_bdata) => {
		KDInteracting = false;
		KinkyDungeonInspect = !KinkyDungeonInspect;
		KinkyDungeonUpdateLightGrid = true; // Rerender since cam moved
		KDLastForceRefresh = CommonTime() - KDLastForceRefreshInterval - 10;
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY - 80, actionBarWidth, actionbarHeight,
	"", "", KinkyDungeonRootDirectory + (KinkyDungeonInspect ? "UI/Inspect" : "UI/Inspect") + ".png",
	undefined, undefined, !KinkyDungeonInspect, KDTextGray05, undefined, false, {alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[5]),
	})) str = "KDInspect";

	// Horizontal
	actionBarII = 0;

	if (!KDToggles.TransparentUI) {
		DrawRectKD(
			kdcanvas, kdpixisprites, "actionborder", {
				Left: actionBarXX-5, Top: actionBarYY - 5 - 80, Width: actionBarSpacing*5 + 5,
				Height: actionbarHeight + 25 +80,
				Color: KDUIColorHighlight, alpha: KDUIAlphaHighlight, zIndex: -2,
				LineWidth: 2,
			}
		);
		FillRectKD(
			kdcanvas, kdpixisprites, "actionbg", {
				Left: actionBarXX-5, Top: actionBarYY - 5 -80, Width: actionBarSpacing*5 + 5,
				Height: actionbarHeight + 25 +80,
				Color: KDUIColor, alpha: KDUIAlpha, zIndex: -1
			}
		);
	}

	// Sprint button
	if (DrawButtonKDEx("toggleSprint", () => {
		KinkyDungeonToggleAutoSprint = !KinkyDungeonToggleAutoSprint; return true;
	},true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, actionbarHeight,
	"", "", KinkyDungeonRootDirectory + (KinkyDungeonToggleAutoSprint ? "UI/Sprint.png" : "UI/NoSprint.png"),
	undefined, undefined, !KinkyDungeonToggleAutoSprint, KDTextGray05, undefined, false, {alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeySprint[0]),
	})) str = "KDSprint";

	// Door button
	if (DrawButtonKDEx("interact", (_bdata) => {
		KDInteracting = !KDInteracting;
		KinkyDungeonInspect = false;
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, actionbarHeight,
	"", "", KinkyDungeonRootDirectory + ("UI/Interact.png"),
	undefined, undefined, !KDInteracting, KDTextGray05, undefined, false, {alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[2]),
	})) str = "KDDoor";

	// Play Button
	let playColor = "#283540";
	if (KinkyDungeonCanTryOrgasm()) {
		playColor = "#ff5277";
	} else if (KinkyDungeonCanPlayWithSelf()) {
		if (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax * KinkyDungeonDistractionSleepDeprivationThreshold) playColor = "#4b1d52";
		else if (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax * 0.5) playColor = "#692464";
		else if (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax * 0.75) playColor = "#9c2a70";
		else playColor = "#cc2f7b";
	} else playColor = "#283540";
	if (DrawButtonKDEx("PlayButton", (_bdata) => {
		if (!KinkyDungeonControlsEnabled()) return false;
		if (KinkyDungeonCanTryOrgasm()) {
			// Done, converted to input
			KDSendInput("tryOrgasm", {});
		} else if (KinkyDungeonCanPlayWithSelf()) {
			// Done, converted to input
			KDSendInput("tryPlay", {});
		} else {
			KinkyDungeonSendActionMessage(10, TextGet("KDNotFeeling"), "#ff5277", 1, false, true);
		}
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, actionbarHeight, "", playColor,
	KinkyDungeonRootDirectory + (KinkyDungeonCanTryOrgasm() ? "UI/LetGo.png" : (KDGameData.OrgasmTurns > KinkyDungeonOrgasmTurnsCrave ? "UI/Edged.png" : "UI/Play.png")),
	undefined, undefined, !KinkyDungeonCanTryOrgasm(), KDTextGray05, undefined, false, {
		alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[8]),
		hotkeyPress: KinkyDungeonKeyToggle[8],
	})) str = KinkyDungeonCanTryOrgasm() ? "KDLetGo" : "KDPlay";

	// Wait Button
	if (DrawButtonKDEx("WaitButton", (_bdata) => {
		if (!KinkyDungeonControlsEnabled()) return false;
		if (KinkyDungeonAutoWait) {
			KinkyDungeonAutoWait = false;
			KinkyDungeonTempWait = false;
			KinkyDungeonAutoWaitSuppress = false;
		} else {
			KinkyDungeonAutoWait = true;
			KinkyDungeonTempWait = true;
			KinkyDungeonAutoWaitSuppress = true;
			KinkyDungeonSleepTime = CommonTime() + 100;
		}
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, actionbarHeight, "", "",
	KinkyDungeonRootDirectory + (KDGameData.KinkyDungeonLeashedPlayer ? "UI/WaitJail.png" : "UI/Wait.png"), undefined, undefined, !KinkyDungeonAutoWait, KDTextGray05,
	undefined, false, {
		alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[6]),
		hotkeyPress: KinkyDungeonKeyToggle[6],
	})) str = "KDWait";

	// Make Noise button
	if (DrawButtonKDEx("HelpButton", (_bdata) => {
		if (!KinkyDungeonControlsEnabled()) return false;
		KDSendInput("noise", {});
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, actionbarHeight, "", "#aaaaaa",
	KinkyDungeonRootDirectory + ("UI/Help.png"), undefined, undefined, true, KDTextGray05, undefined, false, {
		alpha: 1.0,
		hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[7]),
		hotkeyPress: KinkyDungeonKeyToggle[7],
	})) str = "KDHelp";



	let focusTooltip = "";

	if (KDFocusControls && KDFocusControlButtons[KDFocusControls] && !KDModalArea) {
		let list = Object.entries(KDFocusControlButtons[KDFocusControls]);
		let bWidth = 60;
		let bHeight = 60;
		let spacing = bWidth + 10;
		let xx = 1710 - spacing * list.length;
		let yy = 600;

		let setTo = KDFocusControls;

		for (let button of list) {
			DrawButtonKDEx("focus" + KDFocusControls + button[0], (_bdata) => {
				KDSetFocusControlToggle(setTo + button[0], !(KDGameData.FocusControlToggle && KDGameData.FocusControlToggle[setTo +  button[0]]));
				KDFocusControls = setTo; // This is to refresh after KDProcessButtons
				return true;
			}, true, xx, yy - bHeight + 15, bWidth, bHeight,
			"", "", KinkyDungeonRootDirectory + `UI/${KDFocusControls}/${ button[0]}.png`,
			undefined, undefined, !KDGameData.FocusControlToggle || !KDGameData.FocusControlToggle[KDFocusControls +  button[0]], KDTextGray1, undefined, false, {
				alpha: 0.7,
				zIndex: 110,
				//hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[2]),
			});
			if (MouseIn(xx, yy - bHeight + 15, bWidth, bHeight)) focusTooltip = "KDFocusControls" + setTo + button[0];
			xx += spacing;
		}
		if (focusTooltip) {
			DrawTextFitKD(TextGet(focusTooltip), Math.min(1700, MouseX), yy - 80, 250, "#ffffff", undefined, 18);
		}
	}

	actionBarII = 0;
	if (str) {
		DrawTextFitKD(TextGet(str), Math.min(1700, Math.max(700, MouseX)), 750, 250, "#ffffff", undefined, 18);
	}

	//}
}

function KDAutoStruggleClick() {
	if (KinkyDungeonAutoWaitStruggle) {
		KDDisableAutoWait();
		KinkyDungeonTempWait = false;
		KinkyDungeonAutoWaitSuppress = false;
	} else {
		KinkyDungeonAutoWaitStruggle = true;
		KinkyDungeonSleepTime = CommonTime() + 100;
	}
}

function KinkyDungeonActivateWeaponSpell(instant = false) {
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.special) {

		let energyCost = KinkyDungeonPlayerDamage.special.energyCost;
		if (KDGameData.AncientEnergyLevel < energyCost) {
			KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonInsufficientEnergy"), "#ff5277", 1);
			return true;
		}
		if (KinkyDungeonPlayerDamage.special.prereq && KDPrereqs[KinkyDungeonPlayerDamage.special.prereq] && !KDPrereqs[KinkyDungeonPlayerDamage.special.prereq](KinkyDungeonPlayerEntity, undefined, {})) {
			KinkyDungeonSendActionMessage(8, TextGet("KDPrereqFail" + KinkyDungeonPlayerDamage.special.prereq), "#ff5555", 1);
			return true;
		}
		if (KinkyDungeonPlayerDamage.special.selfCast) {
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			KDStartSpellcast(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonFindSpell(KinkyDungeonPlayerDamage.special.spell, true), undefined, KinkyDungeonPlayerEntity, undefined, {
				targetingSpellWeapon: KinkyDungeonTargetingSpellWeapon,
			});
			KinkyDungeonTargetingSpellWeapon = null;
			//KinkyDungeonCastSpell(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, , undefined, undefined, undefined);
		} else if (!instant) {
			KinkyDungeonTargetingSpell = KinkyDungeonFindSpell(KinkyDungeonPlayerDamage.special.spell, true);
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			KinkyDungeonTargetingSpellItem = null;
			KDModalArea = false;
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = null;
		} else {
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			KDStartSpellcast(KinkyDungeonTargetX, KinkyDungeonTargetY, KinkyDungeonFindSpell(KinkyDungeonPlayerDamage.special.spell, true), undefined, KinkyDungeonPlayerEntity, undefined, {
				targetingSpellWeapon: KinkyDungeonTargetingSpellWeapon,
			});
			//KinkyDungeonCastSpell(KinkyDungeonTargetX, KinkyDungeonTargetY, KinkyDungeonFindSpell(KinkyDungeonPlayerDamage.special.spell, true), undefined, KinkyDungeonPlayerEntity, undefined);
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
		}
		return true;
	}
	return false;
}

function KinkyDungeonRangedAttack() {
	if (!KinkyDungeonPlayerDamage.special) return;
	if (KinkyDungeonPlayerDamage.special.type) {
		if (KinkyDungeonPlayerDamage.special.type == "hitorspell") {
			KinkyDungeonTargetingSpell = {name: "WeaponAttack", components: [], level:1, type:"special", special: "weaponAttackOrSpell", noMiscast: true, manacost: 0,
				onhit:"", time:25, power: 0, range: KinkyDungeonPlayerDamage.special.range ? KinkyDungeonPlayerDamage.special.range : 1.5, size: 1, damage: ""};
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			KinkyDungeonTargetingSpellItem = null;
			KDModalArea = false;
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = null;
			return true;
		} else if (KinkyDungeonPlayerDamage.special.type == "attack") {
			KinkyDungeonTargetingSpell = {name: "WeaponAttack", components: [], level:1, type:"special", special: "weaponAttack", noMiscast: true, manacost: 0,
				onhit:"", time:25, power: 0, range: KinkyDungeonPlayerDamage.special.range ? KinkyDungeonPlayerDamage.special.range : 1.5, size: 1, damage: ""};

			KinkyDungeonTargetingSpellItem = null;
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			KDModalArea = false;
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = null;
			return true;
		} else if (KinkyDungeonPlayerDamage.special.type == "ignite") {
			KDCreateEffectTile(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, {
				name: "Ignition",
				duration: 1,
			}, 0);
			return true;
		} /*else if (KinkyDungeonPlayerDamage.special.type == "attack") {
			KinkyDungeonTargetingSpell = {name: "WeaponAttack", components: [], level:1, type:"special", special: "weaponAttack", noMiscast: true,
				onhit:"", time:25, power: 0, range: KinkyDungeonPlayerDamage.special.range ? KinkyDungeonPlayerDamage.special.range : 1.5, size: 1, damage: ""};
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			return true;
		}*/ else {
			return KinkyDungeonActivateWeaponSpell();
		}

	}
	return false;
}

function KinkyDungeonHandleHUD() {
	if (KinkyDungeonDrawState == "Game") {
		if (KDHandleGame()) return true;
	} else if (KinkyDungeonDrawState == "Orb") {
		// Done, converted to input
		return KinkyDungeonHandleOrb();
	} else if (KinkyDungeonDrawState == "Heart") {
		// Done, converted to input
		return KinkyDungeonHandleHeart();
	} else if (KinkyDungeonDrawState == "Magic") {
		// Done, converted to input
		return KinkyDungeonHandleMagic();
	} else if (KinkyDungeonDrawState == "MagicSpells") {
		// Nothing to convert
		return KinkyDungeonHandleMagicSpells();
	} else if (KinkyDungeonDrawState == "Inventory") {
		// Done, converted to input
		return KinkyDungeonHandleInventory();
	} else if (KinkyDungeonDrawState == "Logbook") {
		// Done, converted to input
		return KinkyDungeonHandleLore();
	} else if (KinkyDungeonDrawState == "Reputation") {
		// Done, converted to input
		return KinkyDungeonHandleReputation();
	} else if (KinkyDungeonDrawState == "Lore") {
		// Done, converted to input
		return KinkyDungeonHandleLore();
	} else if (KinkyDungeonDrawState == "Perks2") {
		if (MouseIn(1650, 920, 300, 64)) {
			KinkyDungeonDrawState = "Restart";
			KDConfirmDeleteSave = false;
			if (KDDebugMode) {
				ElementCreateTextArea("DebugEnemy");
				ElementValue("DebugEnemy", "Maidforce");
				ElementCreateTextArea("DebugItem");
				ElementValue("DebugItem", "TrapArmbinder");
			} else {
				if (document.getElementById("DebugEnemy")) {
					ElementRemove("DebugEnemy");
				}
				if (document.getElementById("DebugItem")) {
					ElementRemove("DebugItem");
				}
			}
			return true;
		}
	} else if (KinkyDungeonDrawState == "Restart") {
		if (MouseIn(600, 20, 64, 64)) {
			if (TestMode) {
				KDDebugMode = !KDDebugMode;
				ElementCreateTextArea("DebugEnemy");
				ElementValue("DebugEnemy", "Maidforce");
				ElementCreateTextArea("DebugItem");
				ElementValue("DebugItem", "TrapArmbinder");
				return true;
			} else {
				if (document.getElementById("DebugEnemy")) {
					ElementRemove("DebugEnemy");
				}
				if (document.getElementById("DebugItem")) {
					ElementRemove("DebugItem");
				}
			}
		}
		if (KDDebugMode) {
			if (MouseIn(1100, 20, 64, 64)) {
				KDDebug = !KDDebug;
				return true;
			} else
			if (MouseIn(1100, 90, 64, 64)) {
				KDDebugPerks = !KDDebugPerks;
				return true;
			} else
			if (MouseIn(1100, 160, 64, 64)) {
				if (KDDebugGold) {
					KDDebugGold = false;
					KinkyDungeonGold = 0;
				} else {
					KDDebugGold = true;
					KinkyDungeonGold = 100000;
				}
				return true;
			} else
			if (MouseIn(1100, 230, 64, 64)) {
				KDDebugLink = !KDDebugLink;
				return true;
			} else
			if (MouseIn(1500, 100, 100, 64)) {
				let enemy = KinkyDungeonEnemies.find((element) => {return element.name.toLowerCase() == ElementValue("DebugEnemy").toLowerCase();});
				if (enemy) {
					let en = KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, enemy.name, 1, 1.5);
					if (en[0]) {
						KDProcessCustomPatron(en[0].Enemy, en[0], 0.2);
					}
				}
				return true;
			}else
			if (MouseIn(1600, 100, 100, 64)) {
				let enemy = KinkyDungeonEnemies.find((element) => {return element.name.toLowerCase() == ElementValue("DebugEnemy").toLowerCase();});
				if (enemy) {
					let e = DialogueCreateEnemy(KinkyDungeonPlayerEntity.x -1, KinkyDungeonPlayerEntity.y, enemy.name);
					e.allied = 9999;
				}
				return true;
			}else
			if (MouseIn(1700, 100, 100, 64)) {
				let enemy = KinkyDungeonEnemies.find((element) => {return element.name.toLowerCase() == ElementValue("DebugEnemy").toLowerCase();});
				if (enemy) {
					let e = DialogueCreateEnemy(KinkyDungeonPlayerEntity.x -1, KinkyDungeonPlayerEntity.y, enemy.name);
					e.ceasefire = 1000;
					let shop = KinkyDungeonGetShopForEnemy(e, true);
					if (shop) {
						KinkyDungeonSetEnemyFlag(e, "Shop", -1);
						KinkyDungeonSetEnemyFlag(e, shop, -1);
						KDSetShopMoney(e);
					}
				}
				return true;
			} else
			if (MouseIn(1500, 260, 300, 64)) {
				let item = null;
				if (KinkyDungeonConsumables[ElementValue("DebugItem")]) KinkyDungeonChangeConsumable(KinkyDungeonConsumables[ElementValue("DebugItem")], 10);
				else if (KinkyDungeonWeapons[ElementValue("DebugItem")]) KinkyDungeonInventoryAddWeapon(ElementValue("DebugItem"));
				else if (KinkyDungeonGetRestraintByName(ElementValue("DebugItem"))) {
					let restraint = KinkyDungeonGetRestraintByName(ElementValue("DebugItem"));
					KinkyDungeonInventoryAdd({name: ElementValue("DebugItem"), type: LooseRestraint, events: restraint.events, quantity: 10, id: KinkyDungeonGetItemID()});
				} else if (KinkyDungeonOutfitsBase.filter((outfit) => {return outfit.name == ElementValue("DebugItem");}).length > 0) {
					KinkyDungeonInventoryAdd({name: KinkyDungeonOutfitsBase.filter((outfit) => {return outfit.name == ElementValue("DebugItem");})[0].name, type: Outfit, id: KinkyDungeonGetItemID()});
				}

				if (item)
					KinkyDungeonInventoryAdd(item);
				return true;
			}
			if (MouseIn(1500, 320, 300, 64)) {
				let saveData = LZString.compressToBase64(JSON.stringify(KinkyDungeonSaveGame(true)));
				KinkyDungeonState = "Save";
				ElementCreateTextArea("saveDataField");
				ElementValue("saveDataField", saveData);


				return true;
			}
			if (MouseIn(1100, 300, 300, 64)) {

				KDMovePlayer(KDMapData.EndPosition.x, KDMapData.EndPosition.y, false);
				KDMapData.KeyQuota=0;
				KDMapData.ChestQuota=0;
				for (let enemy of KDMapData.Entities) {
					if (KDEnemyHasFlag(enemy, "killtarget")) {
						KinkyDungeonSetEnemyFlag(enemy, "killtarget", 0);
					}
				}
				KDMapData.TrapQuota=0;
				KDMapData.QuestQuota=0;
				KinkyDungeonSetFlag("BossUnlocked", -1);
				KinkyDungeonUpdateLightGrid = true;
				return true;
			} else
			if (MouseIn(1100, 370, 300, 64)) {
				KDGameData.PrisonerState = 'parole';
				return true;
			}
		}

		if (MouseIn(1650, 900, 300, 64)) {
			KinkyDungeonDrawState = "Perks2";
			return true;
		}

		//if (MouseIn(600, 650, 64, 64)) {
		//KinkyDungeonFastWait = !KinkyDungeonFastWait;
		//return true;
		//}
		// Done, converted to input
		if (KinkyDungeonIsPlayer() && MouseIn(975, 800, 550, 64) && KDGameData.PrisonerState != 'jail' && KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y)) {

			if (KDConfirmDeleteSave) {
				KDSendInput("defeat", {});
				KinkyDungeonDrawState = "Game";


				KDRefreshCharacter.set(KinkyDungeonPlayer, true);
				KinkyDungeonDressPlayer();
			} else {
				KDConfirmDeleteSave = true;
			}
			return true;
		}
		if (MouseIn(975, 550, 550, 64)) {
			KinkyDungeonDrawState = "Game";

			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
			return true;
		} else if (KinkyDungeonIsPlayer() && MouseIn(975, 650, 550, 64)) {
			KinkyDungeonSaveGame();
			KinkyDungeonState = "Menu";
			//KinkyDungeonAutoWait = true;
			//KinkyDungeonTempWait = false;
			//KinkyDungeonAutoWaitSuppress = true;
			//KinkyDungeonSleepTime = CommonTime() + 500;
			return true;
		}
		KDConfirmDeleteSave = false;
		return true;
	}

	if (KDModalArea && MouseIn(KDModalArea_x, KDModalArea_y, KDModalArea_width, KDModalArea_height)) return true;
	if (MouseIn(0, 0, 500, 1000)) return true;
	if (MouseIn(1950, 0, 60, 1000)) return true;
	if (MouseIn(0, 950, 2000, 60)) return true;
	KDModalArea = false;
	return false;
}

let KDStruggleGroupLinkIndex = {};

function KinkyDungeonUpdateStruggleGroups() {
	let struggleGroups = KinkyDungeonStruggleGroupsBase;
	KinkyDungeonStruggleGroups = [];

	KDRefreshCharacter.set(KinkyDungeonPlayer, true);

	for (let S = 0; S < struggleGroups.length; S++) {
		let sg = struggleGroups[S];
		let Group = sg;

		let restraint = KinkyDungeonGetRestraintItem(Group);

		if (restraint) {
			KinkyDungeonStruggleGroups.push(
				{
					group:Group,
					left: true, // S % 2 == 0, // Old behavior
					y: S,
					icon:sg,
					name:(KDRestraint(restraint)) ? KDRestraint(restraint).name : "",
					lock:restraint.lock,
					magic: KDRestraint(restraint) ? KDRestraint(restraint).magic : undefined,
					noCut:KDRestraint(restraint) && KDRestraint(restraint).escapeChance && KDRestraint(restraint).escapeChance.Cut == undefined,
					curse:KDRestraint(restraint)? (restraint.curse || KDRestraint(restraint).curse) : undefined,
					blocked: !KDRestraint(restraint).alwaysStruggleable && KDGroupBlocked(Group)});
		}
	}
}

/**
 * @param item
 */
function KDCanStruggle(item: item): boolean {
	if (KDGetCurse(item)) return false;
	//let r = KDRestraint(item);
	//let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
	//if (sg.blocked) return false;
	return true;
}
/**
 * @param item
 */
function KDCanRemove(item: item): boolean {
	if (KDGetCurse(item)) return false;
	let r = KDRestraint(item);
	let sg = KinkyDungeonStruggleGroups.find((group) => {return r.Group == group.group;});
	if (sg.blocked) return false;
	return true;
}

/**
 * @param inv
 * @param [allowInaccessible]
 */
function KDGetItemLinkIndex(inv: item, _allowInaccessible?: boolean): number {
	let item = KinkyDungeonGetRestraintItem(KDRestraint(inv).Group);
	let surfaceItems = KDDynamicLinkListSurface(item);
	return surfaceItems.indexOf(inv);
}

/**
 * @param skip - Skips the button being drawn in this instance
 */
function KDDrawNavBar(skip: number, _quit: boolean = false) {
	let by = 440;
	let bwidth = 140;
	let bx = 2000 - 10 - bwidth;
	let bspacing = 5;
	let bindex = 0;
	let bheight = 60;

	let bInc = () => {
		by += bheight + bspacing;
	};




	DrawButtonKDEx((skip == bindex) ? "goGame" : "goQuit", (_bdata) => {
		if (skip == 0) {
			KinkyDungeonDrawState = "Game";
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();

		} else {KinkyDungeonDrawState = "Restart";
			KDConfirmDeleteSave = false;
			if (KDDebugMode) {
				ElementCreateTextArea("DebugEnemy");
				ElementValue("DebugEnemy", "Maidforce");
				ElementCreateTextArea("DebugItem");
				ElementValue("DebugItem", "TrapArmbinder");} else {
					if (document.getElementById("DebugEnemy")) {
						ElementRemove("DebugEnemy");
					}
					if (document.getElementById("DebugItem")) {
						ElementRemove("DebugItem");
					}
				}
			}

		KDRefreshCharacter.set(KinkyDungeonPlayer, true);
		KinkyDungeonDressPlayer();
		return true;
	}, true, bx, by, bwidth, bheight, TextGet((skip == bindex) ? "KDNavGame" : "KDNavQuit"), "#ffffff",
	KinkyDungeonRootDirectory + ((skip == bindex) ? "UI/button_game.png" : "UI/button_menu.png"), undefined, undefined, false, "", 24, true,
	{
		hotkey: KDHotkeyToText(KinkyDungeonKeyMenu[8]),
	}); bindex++; bInc();
	DrawButtonKDEx((skip == bindex) ? "goGame" : "goInv", (_bdata) => {
		if (skip == 1)
			KinkyDungeonDrawState = "Game";
		else
			KinkyDungeonDrawState = "Inventory";
		KDRefreshCharacter.set(KinkyDungeonPlayer, true);
		KinkyDungeonDressPlayer();
		return true;
	}, true, bx, by, bwidth, bheight, TextGet((skip == bindex) ? "KDNavGame" : "KinkyDungeonInventory"), "#ffffff",
	KinkyDungeonRootDirectory + ((skip == bindex) ? "UI/button_game.png" : "UI/button_inventory.png"), undefined, undefined, false, "", 24, true,
	{
		hotkey: KDHotkeyToText(KinkyDungeonKeyMenu[1]),
	}); bindex++; bInc();
	/*DrawButtonKDEx("goRep", (bdata) => {
		if (skip == bindex)
			KinkyDungeonDrawState = "Game";
		else
			KinkyDungeonDrawState = "Reputation";
		return true;
	}, true, bx, by, bwidth, bheight, TextGet((skip == bindex) ? "KDNavGame" : "KinkyDungeonReputation"), "#ffffff",
	KinkyDungeonRootDirectory + (skip == bindex) ? "UI/button_game.png" : "UI/button_reputation.png", undefined, undefined, false, "", 24, true,
	{
		hotkey: KDHotkeyToText(KinkyDungeonKeyMenu[2]),
	}); bindex++; bInc();*/
	DrawButtonKDEx((skip == bindex) ? "goGame" : "goSpells", (_bdata) => {
		if (skip == 2)
			KinkyDungeonDrawState = "Game";
		else
			KinkyDungeonDrawState = "MagicSpells";

		KDRefreshCharacter.set(KinkyDungeonPlayer, true);
		KinkyDungeonDressPlayer();
		return true;
	}, true, bx, by, bwidth, bheight, TextGet((skip == bindex) ? "KDNavGame" : "KinkyDungeonMagic"), "#ffffff",
	KinkyDungeonRootDirectory + ((skip == bindex) ? "UI/button_game.png" : "UI/button_spells.png"), undefined, undefined, false, "", 24, true,
	{
		hotkey: KDHotkeyToText(KinkyDungeonKeyMenu[3]),
	}); bindex++; bInc();

	let logtxt = KinkyDungeonNewLoreList.length > 0 ? TextGet("KinkyDungeonLogbookN").replace("N", "" + KinkyDungeonNewLoreList.length): TextGet("KinkyDungeonLogbook");
	if (skip == bindex) logtxt = TextGet("KDNavGame");
	DrawButtonKDEx((skip == bindex) ? "goGame" : "goLog", (_bdata) => {
		if (skip == 3)
			KinkyDungeonDrawState = "Game";
		else {
			KinkyDungeonDrawState = "Quest";
			KinkyDungeonUpdateLore(localStorage.getItem("kdexpLore") ? JSON.parse(localStorage.getItem("kdexpLore")) : {Cover: 1});
		}
		KDRefreshCharacter.set(KinkyDungeonPlayer, true);
		KinkyDungeonDressPlayer();
		return true;
	}, true, bx, by, bwidth, bheight, logtxt, "#ffffff",
	KinkyDungeonRootDirectory + ((skip == bindex) ? "UI/button_game.png" : "UI/button_logbook.png"), undefined, undefined, false, "", 24, true, {
		hotkey: KDHotkeyToText(KinkyDungeonKeyMenu[4]),
	}); bindex++; bInc();
}

function KDCullSpellChoices() {
	for (let ii = KinkyDungeonSpellChoiceCount - 1; ii > 0; ii--) {
		if (!(KinkyDungeonSpellChoices[ii] >= 0
			|| KinkyDungeonWeaponChoices[ii]
			|| KinkyDungeonArmorChoices[ii]
			|| KinkyDungeonConsumableChoices[ii]
		)) {
			KinkyDungeonSpellChoices = KinkyDungeonSpellChoices.slice(0, ii);
			KinkyDungeonWeaponChoices = KinkyDungeonWeaponChoices.slice(0, ii);
			KinkyDungeonArmorChoices = KinkyDungeonArmorChoices.slice(0, ii);
			KinkyDungeonConsumableChoices = KinkyDungeonConsumableChoices.slice(0, ii);
		}
		else break;
	}
}

let currentDrawnSG = null;
let currentDrawnSGLength = 0;

/**
 * Sets the focus control and also initializes default settings
 * @param control
 */
function KDSetFocusControl(control: string) {
	KDFocusControls = control;

	if (control)
		KDInitFocusControl(control);
}
/**
 * Sets the focus control and also initializes default settings
 * @param control
 */
function KDInitFocusControl(control: string) {

	if (localStorage.getItem("focusControl")) {
		KDGameData.FocusControlToggle = JSON.parse(localStorage.getItem("focusControl"));
	}

	KDSetFocusControlToggle("", "");
	if (KDFocusControlButtons[control]) {
		for (let button of Object.entries(KDFocusControlButtons[control])) {
			if (KDGameData.FocusControlToggle[control + button[0]] == undefined) {
				//KDGameData.FocusControlToggle[control + button[0]] = button[1];
				KDSetFocusControlToggle(control + button[0], button[1]);
			}
		}
	}
}

function KDSetFocusControlToggle(key: any, value: any) {
	KDSendInput("focusControlToggle", {key: key, value: value});
}

function KDInputFocusControlToggle(key: string, value: boolean) {
	if (!KDGameData.FocusControlToggle) KDGameData.FocusControlToggle = {};
	if (key)
		KDGameData.FocusControlToggle[key] = value;

	if (value && KDFocusControlButtonsExclude[key]) {
		if (KDFocusControlButtonsExclude[key]) {
			for (let b of KDFocusControlButtonsExclude[key]) {
				KDGameData.FocusControlToggle[b] = false;
			}
		}
	}

	localStorage.setItem("focusControl", JSON.stringify(KDGameData.FocusControlToggle));
}



function KDDrawMinimap(MinimapX: number, MinimapY: number) {
	if (kdminimap.visible) {
		let zIndex = (KDExpandMinimap || MouseIn(MinimapX, MinimapY, KDMinimapWidth()+21, KDMinimapHeight()+21)) ? 150 : 90;
		if (KDExpandMinimap) {
			let spacing = 40;
			let starty = MinimapY;
			let ii = 0;
			DrawButtonKDEx("minimapzoomin", (_bdata) => {
				KDMinimapExpandedSize = Math.max(KDMinimapW, KDMinimapExpandedSize - KDMinimapExpandedSizeTick);
				KDRedrawMM = 2;
				KDUpdateMinimapTarget(true);
				return true;
			}, true, MinimapX, starty + ii*spacing, 46, 46, "", KDButtonColor, KinkyDungeonRootDirectory + "UI/ZoomIn.png", undefined, false, true,
			"#000000", undefined, undefined, {zIndex: zIndex, alpha: 0}); ii++;
			DrawButtonKDEx("minimapzoomout", (_bdata) => {
				KDMinimapExpandedSize = Math.min(KDMinimapWBig, KDMinimapExpandedSize + KDMinimapExpandedSizeTick);
				KDRedrawMM = 2;
				KDUpdateMinimapTarget(true);
				return true;
			}, true, MinimapX, starty + ii*spacing, 46, 46, "", KDButtonColor, KinkyDungeonRootDirectory + "UI/ZoomOut.png", undefined, false, true,
			"#000000", undefined, undefined, {zIndex: zIndex, alpha: 0}); ii++;
			DrawButtonKDEx("minimapexpand", (_bdata) => {
				KDMinimapExpandedZoom = Math.min(KDMinimapScaleBig, KDMinimapExpandedZoom + KDMinimapExpandedZoomTick);
				KDRedrawMM = 2;
				KDUpdateMinimapTarget(true);
				return true;
			}, true, MinimapX, starty + ii*spacing, 46, 46, "", KDButtonColor, KinkyDungeonRootDirectory + "UI/Expand.png", undefined, false, true,
			"#000000", undefined, undefined, {zIndex: zIndex, alpha: 0}); ii++;
			DrawButtonKDEx("minimapshrink", (_bdata) => {
				KDMinimapExpandedZoom = Math.max(KDMinimapExpandedZoomTick, KDMinimapExpandedZoom - KDMinimapExpandedZoomTick);
				KDRedrawMM = 2;
				KDUpdateMinimapTarget(true);
				return true;
			}, true, MinimapX, starty + ii*spacing, 46, 46, "", KDButtonColor, KinkyDungeonRootDirectory + "UI/Shrink.png", undefined, false, true,
			"#000000", undefined, undefined, {zIndex: zIndex, alpha: 0}); ii++;
		}
		kdminimap.zIndex = zIndex - 1;

		// Dummy button to prevent clicks from moving the player inadvertently
		DrawButtonKDEx("minimapdummy", (_bdata) => {
			KDExpandMinimap = !KDExpandMinimap;
			return true;
		}, true, MinimapX-10, MinimapY-10, KDMinimapWidth()+21, KDMinimapHeight()+21, "", KDButtonColor, undefined, undefined, false, true,
		"#000000", undefined, undefined, {zIndex: zIndex-2, alpha: 0., hotkey: KDHotkeyToText(KinkyDungeonKeyMap[0]), hotkeyPress: KinkyDungeonKeyMap[0]});

		if (KDMinimapWCurrent != KDMinimapWTarget || KDMinimapHCurrent != KDMinimapHTarget) {
			KDRedrawMM = 2;
		}
		KDMinimapWCurrent = (KDMinimapWTarget + KDUISmoothness * KDMinimapWCurrent)/(1 + KDUISmoothness);
		KDMinimapHCurrent = (KDMinimapHTarget + KDUISmoothness * KDMinimapHCurrent)/(1 + KDUISmoothness);

		// Snap when close or skipping smooth transition
		if (Math.abs(KDMinimapWCurrent - KDMinimapWTarget) < 5) KDMinimapWCurrent = KDMinimapWTarget;
		if (Math.abs(KDMinimapHCurrent - KDMinimapHTarget) < 5) KDMinimapHCurrent = KDMinimapHTarget;



		let escapeMethod = KDGetEscapeMethod(MiniGameKinkyDungeonLevel);
		let escape = KDCanEscape(escapeMethod);
		let escapeText = KDGetEscapeMinimapText(escapeMethod)?.split('|');
		if (escapeText) {
			let spacing = 17;
			let II = -(escapeText.length - 1);
			for (let s of escapeText) {
				DrawTextFitKD(s, kdminimap.x + KDMinimapWCurrent/2, kdminimap.y + KDMinimapHCurrent - 12 + II++ * spacing, 0.75 * KDMinimapWCurrent,
				escape ? "#88ff88" : "#ff5555", KDTextGray0, 16, "center", zIndex + 1);
			}
		}

	}
	kdminimap.x = MinimapX;
	kdminimap.y = MinimapY;
}
/**
 * Draws the party member display
 * @param {number} PartyX
 * @param {number} PartyY
 * @param {object[]} tooltips
 */
function KDDrawPartyMembers(PartyX: number, PartyY: number, tooltips: object[]) {
	if (KDGameData.Party && KinkyDungeonDrawState == "Game") {
		let PartyDy = 72;
		let PartyPad = 8;
		let zIndex = KDToggleShowAllBuffs ? 149 : 152;

		for (let i = 0; i < KDGameData.Party.length; i++) {
			let PM = KinkyDungeonFindID(KDGameData.Party[i].id);
			if (PM) {
				KDDrawEnemySprite(kdstatusboard, PM, PartyX/KinkyDungeonGridSizeDisplay, PartyY/KinkyDungeonGridSizeDisplay, 0, 0, true, zIndex, "PM");
				KinkyDungeonBarTo(kdstatusboard, PartyX, PartyY,
					PartyDy, 10, PM.visual_hp / PM.Enemy.maxhp * 100, "#88ff88", "#ff5555", undefined, undefined, undefined, undefined, undefined, zIndex + 0.05);

				let selected = (PM.buffs?.AllySelect?.duration > 0);

				DrawButtonKDExTo(kdstatusboard, "PM" + i + "click", (_bdata) => {
					KDSendInput("select", {enemy: PM});
					return true;
				}, true, PartyX, PartyY, PartyDy, PartyDy, "", KDButtonColor, undefined, undefined, false, !selected,
				"#000000", undefined, undefined, {zIndex: zIndex - 0.1,});

				if (selected) {
					DrawButtonKDExTo(kdstatusboard, "PM" + i + "remove", (_bdata) => {
						KDSendInput("cancelParty", {enemy: PM});
						return true;
					}, true, PartyX + 170, PartyY, 38, 38, "", KDButtonColor, KinkyDungeonRootDirectory + "UI/X.png", undefined, false, false,
					"#000000", undefined, undefined, {zIndex: zIndex,});
					DrawButtonKDExTo(kdstatusboard, "PM" + i + "come", (_bdata) => {
						KDSendInput("onMe", {enemy: PM, player: KinkyDungeonPlayerEntity});
						return true;
					}, true, PartyX + 90, PartyY, 38, 38, "", KDButtonColor, KinkyDungeonRootDirectory + ((!KDEnemyHasFlag(PM, "NoFollow")) ? "UI/Recall.png" : "UI/Disperse.png"), undefined, false, false,
					"#000000", undefined, undefined, {zIndex: zIndex,});

					DrawButtonKDExTo(kdstatusboard, "PM" + i + "choose", (_bdata) => {
						KDSendInput("selectOnly", {enemy: PM});
						return true;
					}, true, PartyX + 130, PartyY, 38, 38, "", KDButtonColor, KinkyDungeonRootDirectory + "UI/Select.png", undefined, false, false,
					"#000000", undefined, undefined, {zIndex: zIndex,});
				}

				if (MouseIn(PartyX, PartyY, PartyDy, PartyDy)) {
					tooltips.push((offset: number) => KDDrawEnemyTooltip(PM, offset));
				}

			} else {
				PM = KDGameData.Party[i];
				if (PM) {
					KDDrawEnemySprite(kdstatusboard, PM, PartyX/KinkyDungeonGridSizeDisplay, PartyY/KinkyDungeonGridSizeDisplay, 0, 0, true, zIndex, "PM");
					KDDraw(kdstatusboard, kdpixisprites, "pmFailFind" + PM.id, KinkyDungeonRootDirectory + "Spells/SpellFail.png",
						PartyX, PartyY, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
							zIndex: zIndex + 0.1,
							alpha: 0.5,
						},
					);
					KinkyDungeonBarTo(kdstatusboard, PartyX, PartyY,
						PartyDy, 10, PM.visual_hp / PM.Enemy.maxhp * 100, "#88ff88", "#ff5555", undefined, undefined, undefined, undefined, undefined, zIndex + 0.05);

					let selected = (PM.buffs?.AllySelect?.duration > 0);

					DrawButtonKDExTo(kdstatusboard, "PM" + i + "click", (_bdata) => {
						KDSendInput("select", {enemy: PM});
						return true;
					}, true, PartyX, PartyY, PartyDy, PartyDy, "", KDButtonColor, undefined, undefined, false, !selected,
					"#000000", undefined, undefined, {zIndex: zIndex - 0.1,});

					if (selected) {
						DrawButtonKDExTo(kdstatusboard, "PM" + i + "remove", (_bdata) => {
							KDSendInput("cancelParty", {enemy: PM});
							return true;
						}, true, PartyX + 170, PartyY, 38, 38, "", KDButtonColor, KinkyDungeonRootDirectory + "UI/X.png", undefined, false, false,
						"#000000", undefined, undefined, {zIndex: zIndex,});

					}

					if (MouseIn(PartyX, PartyY, PartyDy, PartyDy)) {
						tooltips.push((offset: number) => KDDrawEnemyTooltip(PM, offset));
					}
				}

			}
			if (PM) {
				FillRectKD(
					kdstatusboard,
					kdpixisprites,
					"bgPM" + PM.id,
					{
						Left: PartyX,
						Top: PartyY,
						Width: KinkyDungeonGridSizeDisplay,
						Height: KinkyDungeonGridSizeDisplay,
						Color: "#000000",
						alpha: 0.9,
						zIndex: zIndex - 0.1,
					}
				);
			}
			PartyY += PartyDy + PartyPad;
		}
	}
}

interface statInfo {text: string, icon?: string, count?: string, category: string, priority?: number, color: string, bgcolor: string, countcolor?: string, click?: string, buffid?: string};

function KDGetStatsWeaponCast() {
	let statsDraw: Record<string, statInfo> = {};


	if (KinkyDungeonPlayerDamage) {
		let accuracy = KinkyDungeonGetEvasion();
		let crit = KinkyDungeonGetCrit(accuracy, KinkyDungeonPlayerDamage);
		let bindcrit = KinkyDungeonGetBindCrit(accuracy, KinkyDungeonPlayerDamage);
		//if (accuracy != 1.0) {
		let weapon = KinkyDungeonWeapons[KinkyDungeonPlayerWeapon] || KinkyDungeonPlayerDamage;
		statsDraw.accuracy = {
			text: TextGet("KinkyDungeonAccuracy") + Math.round(accuracy * 100) + "%, " + TextGet("KinkyDungeonCrit") + Math.round(crit * 100) + "%, " + TextGet("KinkyDungeonBindCrit") + Math.round(bindcrit * 100) + "%",
			count: Math.round(accuracy * 100) + "%",
			icon: "infoAccuracy",//accuracy > weapon.chance * 1.01 ? "infoAccuracyBuff" : (accuracy < weapon.chance * 0.99 ? "infoAccuracyDebuff" : "infoAccuracy"),
			countcolor: accuracy > weapon.chance * 1.01 ? "#c4efaa" : (accuracy < weapon.chance * 0.99 ? "#ff5555" : "#ffffff"),
			category: "info", color: "#ffffff", bgcolor: "#000000", priority: 10
		};
		//}
	}
	//if (KinkyDungeonMiscastChance > 0) {
	statsDraw.miscast = {
		text: TextGet("StatMiscastChance") + Math.round(KinkyDungeonMiscastChance * 100) + "%",
		count: Math.round(KinkyDungeonMiscastChance * 100) + "%",
		icon: "infoMiscast",
		countcolor: KinkyDungeonMiscastChance > 0 ? "#ff5555" : "#ffffff",
		category: "info", color: "#ffffff", bgcolor: "#000000", priority: 9
	};
	return statsDraw;
}

function KDProcessBuffIcons(minXX: number, minYY: number, side: boolean = false) {
	let statsDraw: Record<string, statInfo> = {};

	let accuracy = KinkyDungeonGetEvasion();
	if (KDToggleShowAllBuffs || accuracy < 0.89) {
		if (KinkyDungeonPlayerDamage) {
			let crit = KinkyDungeonGetCrit(accuracy, KinkyDungeonPlayerDamage);
			let bindcrit = KinkyDungeonGetBindCrit(accuracy, KinkyDungeonPlayerDamage);
			//if (accuracy != 1.0) {
			let weapon = KinkyDungeonWeapons[KinkyDungeonPlayerWeapon] || KinkyDungeonPlayerDamage;
			statsDraw.accuracy = {
				text: TextGet("KinkyDungeonAccuracy") + Math.round(accuracy * 100) + "%, " + TextGet("KinkyDungeonCrit") + Math.round(crit * 100) + "%, " + TextGet("KinkyDungeonBindCrit") + Math.round(bindcrit * 100) + "%",
				count: Math.round(accuracy * 100) + "%",
				icon: "infoAccuracy",//accuracy > weapon.chance * 1.01 ? "infoAccuracyBuff" : (accuracy < weapon.chance * 0.99 ? "infoAccuracyDebuff" : "infoAccuracy"),
				countcolor: accuracy > weapon.chance * 1.01 ? "#c4efaa" : (accuracy < weapon.chance * 0.99 ? "#ff5555" : "#ffffff"),
				category: "info", color: "#ffffff", bgcolor: "#000000", priority: 10
			};
			//}
		}
	}
	//if (KinkyDungeonMiscastChance > 0) {
	if (KDToggleShowAllBuffs || KinkyDungeonMiscastChance > 0) {
		statsDraw.miscast = {
			text: TextGet("StatMiscastChance") + Math.round(KinkyDungeonMiscastChance * 100) + "%",
			count: Math.round(KinkyDungeonMiscastChance * 100) + "%",
			icon: "infoMiscast",
			countcolor: KinkyDungeonMiscastChance > 0 ? "#ff5555" : "#ffffff",
			category: "info", color: "#ffffff", bgcolor: "#000000", priority: 9
		};
	}

	if (KDToggleShowAllBuffs) {



		//}
		let evasion = KinkyDungeonPlayerEvasion();
		let block = KinkyDungeonPlayerBlock();
		//if (evasion != 1.0) {
		statsDraw.evasion = {
			text: TextGet("StatEvasion")
				.replace("Percent", ("") + Math.round((1 - evasion) * 100))
				.replace("EVASIONSUM", ("") + Math.round((KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Evasion")) * 100))
				.replace("EVASIONPENALTY", ("") + Math.round(KDPlayerEvasionPenalty() * -100)),
			count: ("") + Math.round((1 - evasion) * 100) + "%",
			icon: "infoEvasion",
			countcolor: evasion < 1 ? "#65d45d" : (evasion == 1 ? "#ffffff" : "#ff5555"),
			category: "info", color: "#ffffff", bgcolor: "#000000", priority: 8
		};
		statsDraw.block = {
			text: TextGet("StatBlock")
				.replace("Percent", ("") + Math.round((1 - block) * 100))
				.replace("BLOCKSUM", ("") + Math.round((KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Block")) * 100))
				.replace("BLOCKPENALTY", ("") + Math.round(KDPlayerBlockPenalty() * -100)),
			count: ("") + Math.round((1 - block) * 100) + "%",
			icon: "infoBlock",
			countcolor: block < 1 ? "#65d45d" : (block == 1 ? "#ffffff" : "#ff5555"),
			category: "info", color: "#ffffff", bgcolor: "#000000", priority: 8
		};
		//}
	}





	let jailstatus = "KinkyDungeonPlayerNotJailed";
	if (KDGameData.PrisonerState == 'jail') {
		jailstatus = "KinkyDungeonPlayerJail";
	} else if (KDGameData.PrisonerState == 'parole') {
		jailstatus = "KinkyDungeonPlayerParole";
	} else if (KDGameData.PrisonerState == 'chase') {
		jailstatus = "KinkyDungeonPlayerChase";
	}
	if (jailstatus == "KinkyDungeonPlayerJail") {
		statsDraw.jail = {
			text: TextGet(jailstatus),
			icon: "infoJailPrisoner",
			category: "help", color: "#ffffff", bgcolor: "#000000", priority: 12
		};
	} else if (jailstatus == "KinkyDungeonPlayerParole") {
		statsDraw.jail = {
			text: TextGet(jailstatus),
			icon: "infoJailSubmissive",
			category: "help", color: "#ffffff", bgcolor: "#000000", priority: 12
		};
	} else if (jailstatus == "KinkyDungeonPlayerChase") {
		statsDraw.jail = {
			text: TextGet(jailstatus),
			icon: "infoJailPrisoner",
			category: "help", color: "#ffffff", bgcolor: "#000000", priority: 12
		};
	}

	/*if (KDToggleShowAllBuffs) {
		let escape = KDCanEscape(KDGetEscapeMethod(MiniGameKinkyDungeonLevel));
		statsDraw.key = {
			text: TextGet(escape ? "StatKeyEscapeKey" : "StatKeyEscapeNoKey"),
			icon: escape ? "infoKey" : "infoNoKey",
			category: "help", color: "#ffffff", bgcolor: "#000000", priority: 5
		};
	}*/




	if (KinkyDungeonIsHandsBound(false, true)) {
		statsDraw.b_hands = {text: TextGet("KDStatHands"), category: "status", icon: "boundHands", color: "#ff5555", bgcolor: "#333333", priority: 10};
	} else {
		if (KDHandBondageTotal() > 0)
			statsDraw.b_hands = {text: TextGet("KDStatHandsPartial"), category: "status", icon: "boundHandsPartial", color: "#ff5555", bgcolor: "#333333", priority: 10};
		else if (KDToggleShowAllBuffs)
			statsDraw.b_hands = {text: TextGet("KDStatFreeHands"), category: "status", icon: "status/freeHands", color: "#55ff55", bgcolor: "#333333", priority: 10};
	}
	if (KinkyDungeonIsArmsBound(false, false)) {
		statsDraw.b_arms = {text: TextGet("KDStatArms"), category: "status", icon: "boundArms", color: "#ff5555", bgcolor: "#333333", priority: 11};
	} else if (KDToggleShowAllBuffs) {
		statsDraw.b_arms = {text: TextGet("KDStatFreeArms"), category: "status", icon: "status/freeArms", color: "#55ff55", bgcolor: "#333333", priority: 11};
	}
	let gag = KinkyDungeonGagTotal(false);
	if (gag >= 0.99) {
		statsDraw.b_gag = {text: TextGet("KDStatGagFull"), category: "status", icon: "boundGagFull", color: "#ff5555", bgcolor: "#333333", priority: 7};
	} else if (gag > 0) {
		statsDraw.b_gag = {text: TextGet("KDStatGag"), category: "status", icon: "boundGag", color: "#ff5555", bgcolor: "#333333", priority: 7};
	} else if (KDToggleShowAllBuffs) {
		statsDraw.b_gag = {text: TextGet("KDStatFreeMouth"), category: "status", icon: "status/freeMouth", color: "#55ff55", bgcolor: "#333333", priority: 7};
	}
	if (KinkyDungeonBlindLevel > 0 || KinkyDungeonStatBlind > 0) {
		statsDraw.b_blind = {text: TextGet("KDStatBlind"), category: "status", icon: "boundBlind", color: "#ff5555", bgcolor: "#333333", priority: 8};
	} else if (KDToggleShowAllBuffs) {
		statsDraw.b_blind = {text: TextGet("KDStatFreeEyes"), category: "status", icon: "status/freeEyes", color: "#55ff55", bgcolor: "#333333", priority: 8};
	}
	if (KDGameData.MovePoints < 0) {
		statsDraw.b_speed = {text: TextGet("KDStatStun"), category: "status", icon: "boundStun", color: "#ff5555", bgcolor: "#333333", priority: 9};
	} else if (KinkyDungeonSlowLevel > 9) {
		statsDraw.b_speed = {text: TextGet("KDStatSpeedImmobile"), category: "status", icon: "boundImmobile", color: "#ff5555", bgcolor: "#333333", priority: 9};
	} else if (KinkyDungeonSlowLevel > 3) {
		statsDraw.b_speed = {text: TextGet("KDStatSpeedNoSprint"), category: "status", icon: "boundSlow4", color: "#ff5555", bgcolor: "#333333", priority: 9};
	}  else if (KinkyDungeonSlowLevel > 2) {
		statsDraw.b_speed = {text: TextGet("KDStatSpeedVerySlow"), category: "status", icon: "boundSlow3", color: "#ff5555", bgcolor: "#333333", priority: 9};
	} else if (KinkyDungeonSlowLevel == 2) {
		statsDraw.b_speed = {text: TextGet("KDStatSpeedSlow"), category: "status", icon: "boundSlow2", color: "#ff5555", bgcolor: "#333333", priority: 9};
	} else if (KinkyDungeonSlowLevel > 0) {
		statsDraw.b_speed = {text: TextGet("KDStatSpeedSlightlySlow"), category: "status", icon: "boundSlow1", color: "#e7cf1a", bgcolor: "#333333", priority: 9};
	} else if (KDToggleShowAllBuffs) {
		statsDraw.b_speed = {text: TextGet("KDStatFreeLegs"), category: "status", icon: "status/freeLegs", color: "#55ff55", bgcolor: "#333333", priority: 9};
	}

	if (KDGameData.Restriction) {
		statsDraw.b_restriction = {text: TextGet("KDStatRestriction"), category: "status", icon: "restriction", color: "#ff5555", bgcolor: "#333333", priority: 9,
			count: Math.round(KDGameData.Restriction) + "",
			countcolor: "#ff5555",
		};
	}

	if (KDToggleShowAllBuffs) {
		for (let training of KDTrainingTypes) {
			let XPNext = 0;
			if (KDGameData.Training) {
				if (KDGameData.Training[training]?.turns_total == 0) {
					XPNext = 0;
				} else {
					let trainingPercentage = Math.min(1,
						KDGameData.Training[training]?.turns_total/KDTrainingSoftScale)
						* (Math.max(0, KDGameData.Training[training]?.turns_trained * 1.11
							- KDGameData.Training[training]?.turns_skipped)/KDGameData.Training[training]?.turns_total);
					if (KinkyDungeonStatsChoice.get("Mastery" + training)) trainingPercentage *= 0.4;
					XPNext = trainingPercentage;
				}
			}

			statsDraw["training" + training] = {text: TextGet("KDTrainingLevel" + training)
				.replace("AMNT",
				"" + Math.floor((KDGameData.Training ? (KDGameData.Training[training]?.training_points || 0) : 0)*100))
				.replace("NXT",
				"" + Math.floor((XPNext*100)))
				.replace("LMT",
					"" + Math.floor((
						KDGameData.Training ? (KDGameData.Training[training]?.training_stage || 0) + 1 : 1)*100))
			,
				category: "training", icon: "training/" + training, color: "#2fc6ce", bgcolor: "#333333", priority: 14,
				count: Math.floor(KDGameData.Training ? (KDGameData.Training[training]?.training_stage || 0) : 0) + "",
				countcolor: "#2fc6ce",
			};
		}

	}




	if (KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) < KDShadowThreshold) {
		statsDraw.shadow = {text: TextGet("KinkyDungeonPlayerShadow"), icon: "shadow", category: "status", color: "#a3a7c2", bgcolor: "#5e52ff", priority: 1};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerShadow"), X1, 900 - i * 35, 200, KDTextGray0, "#5e52ff", ); i++;
	}
	let sneak = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak", true);
	if (sneak > 2.5) {
		statsDraw.sneak = {text: TextGet("KinkyDungeonPlayerSneak"), category: "status", icon: "invisible", color: "#ceaaed", bgcolor: "#333333", priority: 2};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerSneak"), X1, 900 - i * 35, 200, KDTextGray0,"#ceaaed"); i++;
	} else {
		let visibility = KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowDetection"));
		if (visibility != 1.0) {
			statsDraw.visibility = {
				text: TextGet("KinkyDungeonPlayerVisibility") + Math.round(visibility * 100) + "%",
				count: Math.round(visibility * 100) + "%",
				icon: "visibility",
				countcolor: visibility < 1 ? "#c4efaa" : "#ff5555",
				category: "info", color: "#ceaaed", bgcolor: KDTextGray0, priority: 2
			};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerVisibility") + Math.round(visibility * 100) + "%", X1, 900 - i * 35, 200, KDTextGray0, "#ceaaed"); i++;
		}
	}

	if (KDGameData.Shield > 0) {
		statsDraw.shield = {text: TextGet("KDStatShield"), category: "info", icon: "shield", color: "#88aaff", bgcolor: "#333333", priority: -100,

			count: "" + Math.round(KDGameData.Shield * 10),
			countcolor: "#ffffff",
		};
	}
	let help = KinkyDungeonHasAllyHelp() || KinkyDungeonHasGhostHelp();
	if (help) {
		statsDraw.hashelp = {text: TextGet("KinkyDungeonPlayerHelp"), icon: "Help", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerHelp"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
	} else {
		if (KinkyDungeonGetAffinity(false, "Hook")) {
			statsDraw.helphook = {text: TextGet("KinkyDungeonPlayerHook"), icon: "HelpHook", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerHook"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
		}
		if (KinkyDungeonGetAffinity(false, "Sharp") && !KinkyDungeonWeaponCanCut(false)) {
			statsDraw.helpsharp = {text: TextGet("KinkyDungeonPlayerSharp"), icon: "HelpSharp", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerSharp"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
		}
		if (KinkyDungeonGetAffinity(false, "Edge")) {
			statsDraw.helpedge = {text: TextGet("KinkyDungeonPlayerEdge"), icon: "HelpCorner", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerEdge"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
		}
		if (KinkyDungeonGetAffinity(false, "Sticky")) {
			statsDraw.helpsticky = {text: TextGet("KinkyDungeonPlayerSticky"), icon: "HelpSticky", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerSticky"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
		}
		if (KinkyDungeonWallCrackAndKnife(false)) {
			statsDraw.helpcrack = {text: TextGet("KinkyDungeonPlayerCrack"), icon: "HelpCrack", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerSticky"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
		}
	}

	if (KinkyDungeonFlags.has("Quickness") || KDEntityBuffedStat(KDPlayer(), "Quickness")) {
		statsDraw.quickness = {text: TextGet("KinkyDungeonPlayerQuickness"), icon: "quickness", category: "buffs", color: "#e7cf1a", bgcolor: "#333333", priority: 100};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerQuickness"), X1, 900 - i * 35, 200, "#e7cf1a", "#333333"); i++;
	}
	if (KDToggleShowAllBuffs) {
		let armor = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Armor");
		if (armor != 0) {
			statsDraw.armor = {text: TextGet("KinkyDungeonPlayerArmor") + Math.round(armor*10), count: (armor > 0 ? "+" : "") + Math.round(armor*10), category: "buffs", icon: "armor", color: "#fca570", bgcolor: "#333333", priority: armor};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerArmor") + Math.round(armor*10), X2, 900 - i * 25, 200, "#fca570", "#333333"); i++; i++;
		}
		let spellarmor = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellResist");
		if (spellarmor != 0) {
			statsDraw.spellarmor = {text: TextGet("KinkyDungeonPlayerSpellResist") + Math.round(spellarmor*10), count: (spellarmor > 0 ? "+" : "") + Math.round(spellarmor*10), category: "buffs", icon: "spellarmor", color: "#73efe8", bgcolor: "#333333", priority: spellarmor + 1};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerSpellResist") + Math.round(spellarmor*10), X2, 900 - i * 25, 200, "#73efe8", "#333333"); i++; i++;
		}
		let restraintblock = KDRestraintBlockPower(KDCalcRestraintBlock(), 10);
		if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "RestraintBlock"))
			statsDraw.restraintblock = {
				text: TextGet("StatRestraintBlock")
					.replace("AMNT1", ("") + Math.round((1 - restraintblock) * 100))
					.replace("AMNT2", ("") + Math.round(10 * KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "RestraintBlock")))
					.replace("RESBLKPENALTY", Math.round((1 - KinkyDungeonMultiplicativeStat(KDRestraintBlockPenalty())) * -100) + ("%")),
				count: ("") + Math.round((1 - restraintblock) * 100) + "%",
				icon: "restraintblock",
				countcolor: "#65d45d",
				category: "info", color: "#ffffff", bgcolor: "#000000", priority: 8
			};
		let damageReduction = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "DamageReduction");
		if (damageReduction > 0) {
			statsDraw.damageReduction = {
				text: TextGet("KinkyDungeonPlayerReduction") + Math.round(damageReduction*10),
				count: "-" + Math.round(damageReduction*10),
				category: "buffs", color: "#73efe8", bgcolor: "#333333", icon: "damageresist", priority: damageReduction * 3
			};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerReduction") + Math.round(damageReduction*10), X2, 900 - i * 25, 150, "#73efe8", "#333333"); i++; i++;
		}
		if (KinkyDungeonPlayerDamage) {
			let flags = {
				KDDamageHands: true.valueOf,
				KDDamageArms: true.valueOf,
			};
			let data = {
				flags: flags,
				buffdmg: 0,
				Damage: KinkyDungeonPlayerDamage,
			};
			KinkyDungeonSendEvent("calcDisplayDamage", data);
			let meleeDamage = (KinkyDungeonPlayerDamage.damage) + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackDmg") + data.buffdmg;
			statsDraw.meleeDamage = {
				text: TextGet("KinkyDungeonPlayerDamage")
					.replace("DAMAGEDEALT", "" + Math.round(meleeDamage*10))
					.replace("STMNA", Math.round(-10 * KDAttackCost()) + "")
					.replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + KinkyDungeonPlayerDamage.type)),
				count: "" + Math.round(meleeDamage*10),
				category: "info", color: "#ffffff", bgcolor: "#333333", icon: "infoDamageMelee", priority: 10.1
			};
		}

		let bindAmp = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BindAmp");
		if (bindAmp > 0) {
			statsDraw.bindAmp = {
				text: TextGet("KinkyDungeonPlayerBindBuff").replace("PERCENT", Math.round(bindAmp * 100) + "%"),
				count: "+" + Math.round(bindAmp * 100) + "%",
				countcolor: "#ffffff",
				icon: "dmgPlus/dmgbind",
				category: "dmg", color: "#ffae70", bgcolor: "#333333", priority: 5 + bindAmp * 20
			};
		}
		let magicResist = KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "magicDamageResist"));
		let meleeResist = KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "meleeDamageResist"));
		for (let dt of Object.values(KinkyDungeonDamageTypes)) {
			let color = dt.color;
			let type = dt.name;
			let DR = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, type + "DamageResist");
			let resist = KinkyDungeonMultiplicativeStat(DR);
			let boost = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, type + "DamageBuff");
			let melee = KinkyDungeonMeleeDamageTypes.includes(type);
			switch (type) {
				case "melee": boost = KDDamageAmpPerks + KDDamageAmpPerksMelee; break;
				case "magic": boost = KDDamageAmpPerks + KDDamageAmpPerksMagic; break;
				case "spell": boost = KDDamageAmpPerksSpell; break;
			}
			if (resist != 1.0) {
				statsDraw[type + "_resist"] = {
					text: TextGet("KinkyDungeonPlayerDamageResist")
						.replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + type).toLocaleLowerCase())
						.replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + type).toLocaleLowerCase())
						.replace("DAMAGECATEGORY", TextGet(melee ? "KinkyDungeonDamageTypemelee" : "KinkyDungeonDamageTypemagic").toLocaleLowerCase())
						.replace("PERCENT1", Math.round(resist * (melee ? meleeResist : magicResist) * 100) + "%")
						.replace("PERCENT2", Math.round(DR * 100) + "")
						.replace("PERCENT3", Math.round((melee ? meleeResist : magicResist) * 100) + "%")
						.replace("COUNTPERCENT", (resist > 1 ? '+' : "") + Math.round(resist * 100 - 100) + "%"),
					count: (resist > 1 ? '+' : "") + Math.round(resist * 100 - 100) + "%",
					countcolor: resist < 1 ? "#c4efaa" : "#ff5555",
					icon: "dmg" + type,
					category: "resist", color: color, bgcolor: "#333333", priority: resist * 10
				};
				//DrawTextFitKD(TextGet("KinkyDungeonPlayerDamageResist").replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + type)) + Math.round(resist * 100) + "%", X2, 900 - i * 25, 150, color, "#333333"); i++;
			}

			if (boost != 0) {
				statsDraw[type + "_buff"] = {
					text: TextGet("KinkyDungeonPlayerDamageBuff").replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + type)).replace("PERCENT", Math.round(boost * 100) + "%"),
					count: "+" + Math.round(boost * 100) + "%",
					countcolor: "#ffffff",
					icon: "dmgPlus/dmg" + type,
					category: "dmg", color: color, bgcolor: "#333333", priority: 5 + boost * 10
				};
				//DrawTextFitKD(TextGet("KinkyDungeonPlayerDamageResist").replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + type)) + Math.round(resist * 100) + "%", X2, 900 - i * 25, 150, color, "#333333"); i++;
			}
		}
	}


	if (KinkyDungeonPlugCount > 0) {
		statsDraw.plugs = {
			text: TextGet("KinkyDungeonPlayerPlugged"),
			icon: "Plugged",
			category: "kinky", color: "#ff8888", bgcolor: "#333333", priority: 1,
		};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerPlugged"), X3, 900 - i * 35, 260, "#ff8888", "#333333"); i++;
		if (KinkyDungeonPlugCount > 1) {
			statsDraw.plugs = {
				text: TextGet("KinkyDungeonPlayerPluggedExtreme"),
				icon: "PluggedFull",
				category: "kinky", color: "#ff8888", bgcolor: "#333333", priority: 2,
			};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerPluggedExtreme"), X3, 900 - i * 35, 260, "#ff8888", "#333333"); i++;
		}
	}
	if (KinkyDungeonVibeLevel > 0) {
		let locations = KDSumVibeLocations();
		let suff = "";
		if (locations.length == 1 && locations[0] == "ItemVulva") {
			suff = "";
		} else {
			let sum = "";
			if (locations.length > 3)
				sum = TextGet("KinkyDungeonPlayerVibratedLocationMultiple");
			else for (let l of locations) {
				if (sum) sum = sum + ", ";
				sum = sum + TextGet("KinkyDungeonPlayerVibratedLocation" + l);
			}
			suff = ` (${sum})`;
		}
		statsDraw.vibe = {
			text: TextGet("KinkyDungeonPlayerVibrated" + Math.max(0, Math.min(Math.floor(KinkyDungeonVibeLevel), 5))) + suff,
			category: "kinky", color: "#ff8888", bgcolor: "#333333", priority: 11,
			icon: "Vibe" + Math.max(0, Math.min(Math.floor(KinkyDungeonVibeLevel), 5)),
		};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerVibrated" + Math.max(0, Math.min(Math.floor(KinkyDungeonVibeLevel), 5))) + suff, X3, 900 - i * 35, 260, "#ff8888", "#333333"); i++;
	}
	if (KDGameData.OrgasmStamina > 0) {
		statsDraw.sex = {
			text: TextGet("KinkyDungeonPlayerStatisfied"),
			icon: "Satisfied",
			category: "kinky", color: "#ff88aa", bgcolor: "#333333", priority: 7,
		};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerStatisfied"), X3, 900 - i * 35, 260, "#ff8888", "#333333"); i++;
	} else if (KDGameData.OrgasmTurns > KinkyDungeonOrgasmTurnsCrave) {
		statsDraw.sex = {
			text: TextGet("KinkyDungeonPlayerEdged"),
			icon: "Edged",
			category: "kinky", color: "#ff5277", bgcolor: "#333333", priority: 7,
		};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerEdged"), X3, 900 - i * 35, 260, "#ff5277", "#333333"); i++;
	}
	if (KDGameData.CurrentVibration  && KDGameData.CurrentVibration.denyTimeLeft > 0) {
		statsDraw.deny = {
			text: TextGet("KinkyDungeonPlayerDenied"),
			icon: "Denied",
			category: "kinky", color: "#ff5277", bgcolor: "#333333", priority: 12,
		};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerDenied"), X3, 900 - i * 35, 260, "#ff8888", "#333333"); i++;
	}

	for (let b of Object.values(KinkyDungeonPlayerBuffs)) {
		if ((b.aura || b.labelcolor) && b.duration > 0 && !b.hide) {
			let count = b.maxCount > 1 ? b.maxCount - (b.currentCount ? b.currentCount : 0) : 0;
			let pri = 0;
			if (b.duration) pri += Math.min(90, b.duration);
			if (count) pri += Math.min(10, count);
			let t = TextGet("KinkyDungeonBuff" + (b.desc || b.id)) + (count ? ` ${count}/${b.maxCount}` : "") + ((b.duration > 1 && b.duration < 1000) ? ` (${b.duration})` : "");
			if (b.buffTextReplace) {
				for (let replace of Object.entries(b.buffTextReplace)) {
					t = t.replace(replace[0], (replace as [string , string])[1]);
				}
			}
			statsDraw[b.id] = {
				text: t,
				count: b.text ? b.text :
					b.type == "Shield" ? (`${Math.round(b.power*10)} (${b.duration})`) :
					(((count ? `${count}/${b.maxCount}` : "") + ((b.duration > 1 && b.duration < 1000) ? ((count ? " " : "") + `${b.duration}`) : ""))),
				icon: (KDBuffSprites[b.id] || b.buffSprite) ? "buff/buff" + (b.buffSpriteSpecific || b.id) : undefined,
				//countcolor: b.aura ? b.aura : b.labelcolor,
				category: "buffs", color: b.aura ? b.aura : b.labelcolor, bgcolor: "#333333", priority: pri,
				buffid: b.id,
				click: b.click,
			};
			//DrawTextFitKD(TextGet("KinkyDungeonBuff" + b.id) + (count ? ` ${count}/${b.maxCount}` : "") + ((b.duration > 1 && b.duration < 1000) ? ` (${b.duration})` : ""), 790, 900 - i * 35, 275, b.aura ? b.aura : b.labelcolor, "#333333"); i++;
		}

	}

	if (KDToggleShowAllBuffs)
		for (let perk of KinkyDungeonStatsChoice.keys()) {
			if (KDPerkIcons[perk] && KDPerkIcons[perk]()) {
				statsDraw["p" + perk] = {
					text: TextGet("KinkyDungeonStatDesc" + KinkyDungeonStatsPresets[perk].id),
					count: KDPerkCount[perk] ? KDPerkCount[perk]() : undefined,
					icon: "perk/perk" + perk,
					//countcolor: b.aura ? b.aura : b.labelcolor,
					category: "perk", color: "#ffffff", bgcolor: "#333333", priority: 0,
				};
			}
		}

	KinkyDungeonSendEvent("drawBuffIcons", {stats: statsDraw});

	KDDrawBuffIcons(minXX, minYY, statsDraw, side);
}

function KDDrawBuffIcons(minXX: number, minYY: number, statsDraw: Record<string, statInfo>, side: boolean) {
	// Draw the buff icons
	let II = 0;
	let spriteSize = 46;
	let sorted = Object.values(statsDraw).sort((a, b) => {
		return (b.priority + KDStatsOrder[b.category]) - (a.priority + KDStatsOrder[a.category]);
	});
	let maxXX = minXX + 800;
	let maxYY = minYY + 500;
	let YY = minYY;
	let textWidth = 44;
	let XX = minXX;
	let XXspacing = spriteSize + 3;
	let YYspacing = spriteSize + 3;
	let currCategory = "";
	let tooltip = false;
	let tooltipY = 700;

	//if (Object.values(statsDraw).length > 0 || KDToggleShowAllBuffs)
	if (DrawButtonKDEx("toggleShowAllBuffs", (_bdata) => {
		KDToggleShowAllBuffs = !KDToggleShowAllBuffs;
		return true;
	}, true,
	side ? (minXX - 5) : (minXX - 5 - spriteSize), side ? (minYY - 80) : (minYY - 26), side ? (spriteSize + 15) : (spriteSize + 5), side ? (spriteSize + 15) : (spriteSize + 10), undefined, "#ffffff", //  + 0.8*spriteSize
	KinkyDungeonRootDirectory + (side ? "Buffs/BuffDotsSide.png" : "Buffs/BuffDots.png"), undefined, false, true, undefined, undefined, true,
	{
		zIndex: 10,
	})) {
		DrawTextFitKD(TextGet("KDExpandBuffs"), minXX, tooltipY, 1000, "#ffffff", "#000000", 22, "left", 160, 1.0, 8);
		tooltip = true;
	}

	let resetX = () => {
		XX = minXX;
	};
	let resetY = () => {
		YY = minYY;
	};
	resetX();
	resetY();

	for (let stat of sorted) {
		if (side) {
			if ((YY > minYY) && (KDStatsSkipLine[currCategory] || KDStatsSkipLineBefore[stat.category]) && currCategory != stat.category) {

				if (KDToggleShowAllBuffs) {
					resetY();
					XX += XXspacing;
				}
			}
		} else {
			if (((!KDMinBuffX && XX > minXX) || (KDMinBuffX && XX > KDMinBuffX)) && (KDStatsSkipLine[currCategory] || KDStatsSkipLineBefore[stat.category]) && currCategory != stat.category) {

				if (KDToggleShowAllBuffs) {
					resetX();
					YY -= YYspacing;
				}
			}
		}


		currCategory = stat.category;

		if (stat.count)
			DrawTextFitKDTo(kdstatusboard, stat.count, XX + spriteSize/2, YY + spriteSize/2 - 10, textWidth, stat.countcolor || "#ffffff", "#000000",
				16, undefined, 151.1, undefined, 5);

		if (!tooltip && MouseIn(XX, YY - Math.ceil(spriteSize/2), spriteSize, spriteSize)) {
			DrawTextFitKD(stat.text, side ? XX + 100 : minXX, side ? YY : tooltipY, 1000, stat.color, "#000000", 22, "left", 160, 1.0, 8);
			tooltip = true;
			if (stat.click) {
				DrawButtonKDEx("statHighlight" + II, (_bdata) => {
					KDSendInput("buffclick", {
						click: stat.click,
						buff: stat.buffid,
					});
					return true;
				}, true,
				XX, YY - Math.ceil(spriteSize/2), spriteSize, spriteSize, undefined, "#ffffff",
				undefined, undefined, false, true, undefined, undefined, undefined,
				{
					zIndex: 10,
				});
			}
		}

		KDDraw(kdstatusboard, kdpixisprites, "stat" + II, KinkyDungeonRootDirectory + "Buffs/" + (stat.icon || "buff/buff") + ".png",
			XX, YY - Math.ceil(spriteSize/2), spriteSize, spriteSize, undefined, {
				zIndex: 151,
			});

		if (side) {
			YY += XXspacing;
			if (YY > maxYY) {
				if (KDToggleShowAllBuffs) {
					resetY();
					XX += XXspacing;
				} else {
					break;
				}
			}
		} else {
			XX += XXspacing;
			if (XX > maxXX) {
				if (KDToggleShowAllBuffs) {
					resetX();
					YY -= YYspacing;
				} else {
					break;
				}
			}
		}

		II++;
	}
}

function KDDrawStruggleGroups() {
	let i = 0;
	// Draw the struggle buttons if applicable
	KinkyDungeonDrawStruggleHover = false;
	if (!KDShowQuickInv() && ((KinkyDungeonDrawStruggle > 0 || MouseIn(0, 0, 500, 1000)) && KinkyDungeonStruggleGroups))
		for (let sg of KinkyDungeonStruggleGroups) {
			let ButtonWidth = 48;
			let x = 5 + ((!sg.left) ? (490 - ButtonWidth) : 0);
			let y = 10 + sg.y * (ButtonWidth + 4); // Originally 46

			let item = KinkyDungeonGetRestraintItem(sg.group);
			let drawLayers = 0;

			let MY = 200;
			let surfaceItems = [];
			let dynamicList = [];
			let noRefreshlists = false;


			i = 0;

			let StruggleType = "";

			let renderedButtons = false;
			let renderButtons = () => {
				if (item && (MouseIn(((!sg.left) ? (260) : 0), y, 500, (ButtonWidth))
					|| KinkyDungeonDrawStruggle == KDDrawStruggleEnum.NONE
					|| KinkyDungeonDrawStruggle == KDDrawStruggleEnum.STRUGGLE)) {

					renderedButtons = true;
					//let r = KDRestraint(item);

					if (!KinkyDungeonDrawStruggleHover) {
						KinkyDungeonDrawStruggleHover = true;
					}


					let buttons = ["Struggle", "CurseInfo", "CurseUnlock", "Cut", "Remove", "Pick"];

					if (KinkyDungeonControlsEnabled())
						for (let button_index = 0; button_index < buttons.length; button_index++) {
							let btn = buttons[sg.left ? button_index : (buttons.length - 1 - button_index)];

							if (btn == "Struggle") {
								if (DrawButtonKDEx("sgStruggle" + button_index + sg.group, (_b) => {
									if ((KDGetCurse(item))) KDSendInput("struggleCurse", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], curse: (KDGetCurse(item))});
									else {
										if (KinkyDungeonFastStruggle) {
											KinkyDungeonFastStruggleGroup = sg.group;
											KinkyDungeonFastStruggleType = "Struggle";
										} else
											KDSendInput("struggle", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], type: "Struggle"});
											//KinkyDungeonStruggle(sg, "Struggle");
									}
									return true;
								}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth,
								"", "#ffffff", KinkyDungeonRootDirectory + "Struggle.png", "", undefined, true, KDButtonColorIntense, undefined, undefined, {scaleImage: true}))
									StruggleType = btn;
								i++;
							} else if ((KDGetCurse(item)) && btn == "CurseInfo") {
								DrawButtonKDEx("sgCurseInfo" + button_index + sg.group, (_b) => {
									KinkyDungeonCurseInfo(item, (KDGetCurse(item)));
									return true;
								}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", "#ffffff", KinkyDungeonRootDirectory + ((KDGetCurse(item) && KDCurses[KDGetCurse(item)].customIcon_RemoveFailure) ? KDCurses[KDGetCurse(item)].customIcon_RemoveFailure : "CurseInfo") + ".png", "", undefined, true, KDButtonColorIntense, undefined, undefined, {scaleImage: true}); i++;
							} else if ((KDGetCurse(item)) && btn == "CurseUnlock" && KinkyDungeonCurseAvailable(item, (KDGetCurse(item)))) {
								DrawButtonKDEx("sgCurseUnlock" + button_index + sg.group, (_b) => {
									KDSendInput("curseUnlock", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], curse: (KDGetCurse(item))});
									return true;
								}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", "#ffffff", KinkyDungeonRootDirectory + ((KDGetCurse(item) && KDCurses[KDGetCurse(item)].customIcon_RemoveSuccess) ? KDCurses[KDGetCurse(item)].customIcon_RemoveSuccess : "CurseUnlock") + ".png", "", undefined, true, KDButtonColorIntense, undefined, undefined, {scaleImage: true}); i++;
							} else if (!(KDGetCurse(item)) && !sg.blocked && btn == "Remove") {

								let toolSprite = (item.lock) ? KDGetLockVisual(item) : "Buckle.png";
								if (DrawButtonKDEx("sgRemove" + button_index + sg.group, (_b) => {
									if (KinkyDungeonFastStruggle) {
										KinkyDungeonFastStruggleGroup = sg.group;
										KinkyDungeonFastStruggleType = (item.lock) ? "Unlock" : "Remove";
									} else
										KDSendInput("struggle", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], type: (item.lock) ? "Unlock" : "Remove"});
									return true;
								}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", "#ffffff", KinkyDungeonRootDirectory + toolSprite, "", undefined, true, KDButtonColorIntense, undefined, undefined, {scaleImage: true}))
									StruggleType = (item.lock) ? "Unlock" : "Remove";
								i++;
							} else if (!(KDGetCurse(item)) && !sg.blocked && btn == "Cut"
								&& (KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;}) || KinkyDungeonGetAffinity(false, "Sharp"))
								&& !sg.noCut) {
								let name = ((KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name && !KinkyDungeonPlayerDamage.unarmed) ? "Items/" + KinkyDungeonPlayerDamage.name + ".png" : "Cut.png");
								if (
									DrawButtonKDEx("sgCut" + button_index + sg.group, (_b) => {
										if (KinkyDungeonFastStruggle) {
											KinkyDungeonFastStruggleGroup = sg.group;
											KinkyDungeonFastStruggleType = "Cut";
										} else
											KDSendInput("struggle", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], type: "Cut"});
											//KinkyDungeonStruggle(sg, "Cut");
										return true;
									}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "",
											(sg.magic) ? "#8394ff" : "#ffffff", KinkyDungeonRootDirectory + name, "", undefined, true, (sg.magic) ? "#8394ff" : KDButtonColorIntense, undefined, undefined, {scaleImage: true}))
									StruggleType = btn;
								i++;
							} else if (!(KDGetCurse(item)) && !sg.blocked && btn == "Pick" && KinkyDungeonItemCount("Pick") > 0 && item.lock) {
								if (
									DrawButtonKDEx("sgPick" + button_index + sg.group, (_b) => {
										if (KinkyDungeonFastStruggle) {
											KinkyDungeonFastStruggleGroup = sg.group;
											KinkyDungeonFastStruggleType = "Pick";
										} else
											KDSendInput("struggle", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], type: "Pick"});
											//KinkyDungeonStruggle(sg, "Pick");
										return true;
									}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", "#ffffff", KinkyDungeonRootDirectory + "UseTool.png", "", undefined, true, KDButtonColorIntense, undefined, undefined, {scaleImage: true}))
									StruggleType = btn;
								i++;
							}
						}
				}
			};

			if (KDStruggleGroupLinkIndex[sg.group] && item && item.dynamicLink) {
				surfaceItems = KDDynamicLinkListSurface(item);
				dynamicList = KDDynamicLinkList(item, true);
				noRefreshlists = true;
				if (!KDStruggleGroupLinkIndex[sg.group] || KDStruggleGroupLinkIndex[sg.group] >= surfaceItems.length) {
					KDStruggleGroupLinkIndex[sg.group] = 0;
				}
				item = surfaceItems[KDStruggleGroupLinkIndex[sg.group]];
			} else if (KDStruggleGroupLinkIndex[sg.group] > 0) delete KDStruggleGroupLinkIndex[sg.group];
			if (MouseIn(((!sg.left) ? (260) : 0), y, 500, (ButtonWidth+3)) && sg) {



				//if (MouseY < y) {
				if (KDToggles.ShowRestraintOnHover || MouseIn(0, 0, 250, 1000))
					KinkyDungeonDrawInventorySelected(KDGetItemPreview(item), false, true, 700);
				//}

				let data = {
					struggleGroup: sg,
					struggleIndex: KDStruggleGroupLinkIndex ? KDStruggleGroupLinkIndex[sg.group] : 0,
					surfaceItems: surfaceItems,
					dynamicList: dynamicList,
					item: item,
					group: sg.group,
					extraLines: [],
					extraLineColor: [],
				};
				KinkyDungeonSendEvent("drawSGTooltip", data);
				let lastO = 0;

				let fontSize = KD_HUD_RESTRAINTINFOFONTSIZE;
				let lineSize = KD_HUD_RESTRAINTINFOLINESIZE;

				let OInit = lastO;

				// 0 = no draw
				// 1 = grey
				// 2 = white
				if (dynamicList.length > 0 || (item && item.dynamicLink)) {
					if (!noRefreshlists) {
						surfaceItems = KDDynamicLinkListSurface(item);
						dynamicList = KDDynamicLinkList(item, true);
					}
					if (surfaceItems.length <= 1) {
						// Delete if there are no additional surface items
						delete KDStruggleGroupLinkIndex[sg.group];
						drawLayers = 1;
					} else {
						if (!KDStruggleGroupLinkIndex[sg.group] || KDStruggleGroupLinkIndex[sg.group] >= surfaceItems.length) {
							KDStruggleGroupLinkIndex[sg.group] = 0;
						}
						item = surfaceItems[KDStruggleGroupLinkIndex[sg.group]];

						drawLayers = 2;
					}

					let O = OInit + 1;
					let drawn = false;
					for (let d of dynamicList) {
						//if (d != item)//KDRestraint(item) && (!KDRestraint(item).UnLink || d.name != KDRestraint(item).UnLink))
						//{
						drawn = true;
						let msg = KDGetItemName(d);//TextGet("Restraint" + d.name);
						let ic = d.lock;
						if (KDGetCurse(d)) ic = KDCurses[KDGetCurse(d)]?.customIcon_hud || "Curse";

						if (ic) {
							KDDraw(kdcanvas, kdpixisprites, "dynlist" + d.name + ic + O, KinkyDungeonRootDirectory + `Locks/${ic}.png`,
								530 + 1, MY - lineSize/2 + O * lineSize + 1, lineSize - 2, lineSize - 2, undefined, {zIndex: 150});
						}
						DrawTextKD(msg, 530 + lineSize, MY + O * lineSize, d == item ? "#ffffff" : (surfaceItems.includes(d) ? "#999999" : "#aa5555"), "#333333", fontSize, "left", 150);

						if ((d.struggleProgress > 0 || d.cutProgress > 0)) {
							if (d.struggleProgress > 0)
								FillRectKD(kdcanvas, kdpixisprites, "Hovprogress"+d.id, {
									Left: 530 + lineSize + (d.cutProgress ? 5 : 1) + 250*(d.cutProgress || 0),
									Top: MY - lineSize/2 + O * lineSize + 1 + lineSize - 5,
									Width: Math.max(1, 250 * (d.struggleProgress) - (d.cutProgress ? 4 : 0)),
									Height: 4,
									Color: "#aaaaaa",
									zIndex: 161,
									alpha: 0.7,
								});
							if (d.cutProgress > 0)
								FillRectKD(kdcanvas, kdpixisprites, "Hovprogresscut"+d.id, {
									Left: 530 + lineSize + 1,
									Top: MY - lineSize/2 + O * lineSize + 1 + lineSize - 5,
									Width: 250 * d.cutProgress,
									Height: 4,
									Color: "#ff5555",
									zIndex: 162,
									alpha: 0.7,
								});
						}
						O++;
						//}
					}
					lastO = O;
					O = OInit;
					if (drawn) {
						DrawTextKD(TextGet("KinkyDungeonItemsUnderneathTotal"), 530, MY + O * lineSize, "#ffffff", "#333333", fontSize, "left", 150);
					}
					O = lastO + 1;
				}

				if (!currentDrawnSG) {
					currentDrawnSG = sg;
					currentDrawnSGLength = surfaceItems.length;
				}

				if (data.extraLines.length > 0) {
					for (let lineIndex = 0; lineIndex < data.extraLines.length; lineIndex++) {
						DrawTextFitKD(data.extraLines[lineIndex], 530, MY + lastO * lineSize, 700,data.extraLineColor[lineIndex] || "#ffffff", "#000000", fontSize, "left", 150);
						lastO += 1;
					}
				}

				if (lastO) lastO += 1;
				if (item && KDRestraint(item) && KinkyDungeonStrictness(false, KDRestraint(item).Group, item)) {
					let strictItems = KinkyDungeonGetStrictnessItems(KDRestraint(item).Group, item);
					let O = lastO + 1;
					let drawn = false;
					for (let s of strictItems) {
						drawn = true;
						let msg = KDGetItemNameString(s);//TextGet("Restraint" + s);
						DrawTextKD(msg, 530, MY + O * lineSize, "#ffffff", "#333333", fontSize, "left");
						O++;
					}
					let lastlastO = O;
					O = lastO;
					if (drawn) {
						DrawTextKD(TextGet("KinkyDungeonItemsStrictness"), 530, MY + O * lineSize, "#ffffff", "#333333", fontSize, "left", 150); O++;
					}

					O = lastlastO + 1;
					lastO = O;

				}
				if (item.tightness > 0 && !KDGetCurse(item) && (KDRestraint(item).escapeChance?.Struggle < 1 || KDRestraint(item).escapeChance?.Remove < 1)) {
					if (!sg.blocked) {
						let O = lastO;
						DrawTextKD(TextGet("KDItemsTightness").replace("TTT",
							TextGet("KDTightness" + (KDRestraint(item)?.tightType || "") + KDTightnessRank(item.tightness))
						), 530, MY + O * lineSize, "#ffffff", "#333333", fontSize, "left", 150); O++;
					}

				}

				if (!renderedButtons) {
					renderButtons();
				}

				if (StruggleType && !sg.blocked) {
					// @ts-ignore
					let struggleData: KDStruggleData = {};
					KinkyDungeonStruggle(KDRestraint(item).Group, StruggleType, data.struggleIndex, true, struggleData);

					if (struggleData.lockType && (StruggleType == "Unlock" && !struggleData.lockType.canUnlock(struggleData))
						|| (StruggleType == "Pick" && struggleData.lockType && !struggleData.lockType.canPick(struggleData))) {
						// Nope
					} else {
						let O = lastO + 1;
						DrawTextKD(TextGet("KDItemDifficulty").replace("AMNT",
							Math.max(0,
								Math.round(100 *
									(0.01 * (item.tightness || 0)
									+ 1
									- struggleData.origEscapeChance + struggleData.escapePenalty
									+ Math.max(0, struggleData.extraLim, struggleData.limitChance))))
								+ "" +
									((struggleData.escapePenalty) ? ` (${struggleData.escapePenalty > 0 ?
										Math.round(-100 * struggleData.escapePenalty)
										: "+" + Math.round(-100 * struggleData.escapePenalty)
									}${struggleData.escapePenalty > 0 ? TextGet("KDPenalty") : TextGet("KDBonus")})` : "")
						).replace("ESCP", TextGet("KDEscape" + StruggleType)),
						530, MY + O * lineSize, "#ffffff", "#333333", fontSize, "left", 150); O++;
						let a = Math.min(10, Math.max(-10, struggleData.escapeChance
							- Math.max(0, struggleData.extraLim, struggleData.limitChance)));
						let b = Math.min(10, Math.max(-10, struggleData.escapeChance));

						if (StruggleType == "Cut") {
							let maxPossible: number;
							let threshold = 0.75;
							if (struggleData.limitChance > struggleData.escapeChance && struggleData.limitChance > 0) {
								threshold = Math.min(threshold, 0.9*(struggleData.escapeChance / struggleData.limitChance));
							} else if (struggleData.limitChance == struggleData.escapeChance || struggleData.limitChance == 0) {
								threshold = 0;
							}

							if (struggleData.limitChance > 0) {
								threshold = KDMaxCutDepth(threshold, struggleData.cutBonus, struggleData.origEscapeChance, struggleData.origLimitChance);
								// Find the intercept
								maxPossible = Math.max(0, threshold);
							} else maxPossible = struggleData.escapeChance > 0 ? 1 : 0;
							a = maxPossible;
							b = maxPossible;
						}

						let amnt = (StruggleType != "Struggle") ?
							Math.round(100 * a)
							+ " -> "
							+ Math.round(100 * b)
							:
							Math.round(100 * b)
							+ " -> "
							+ Math.round(100 * a);
						if (a < 0 && b < 0)
							amnt = Math.round(100 * Math.max(a, b)) + "";
						else if (a == b)
							amnt = Math.round(100 * a) + "";
						else if (a < 0 && b > 0) {
							a = Math.max(0, a);
							if (a == b) {
								amnt = Math.round(100 * a) + "";
							} else {
								amnt = Math.round(100 * b)
									+ " -> "
									+ Math.round(100 * a);
							}

						} else if (a < 0 && b == 0) {
							amnt = Math.round(100 * a) + "";
						}
						DrawTextKD(TextGet("KDItemStruggle" + (StruggleType)).replace("AMNT",
							amnt
						).replace("ESCP", TextGet("KDEscape" + StruggleType)),
						530, MY + O * lineSize, "#ffffff", "#333333", fontSize, "left", 150); O++;


						lastO = O - 1;
					}
				}



				FillRectKD(kdcanvas, kdpixisprites, "selectedBG", {
					Left: 510, Top: MY - 20, Width: 740,
					Height: lastO * lineSize + 40,
					Color: "#000000", alpha: 0.7, zIndex: 110
				});
			}

			let mini = (KinkyDungeonDrawStruggle == KDDrawStruggleEnum.MOST && !MouseIn(0, 0, 500, 1000))
				|| (KinkyDungeonDrawStruggle == KDDrawStruggleEnum.STRUGGLE && !(MouseIn(((!sg.left) ? (260) : 0), y, 500, (ButtonWidth)) || KinkyDungeonDrawStruggle > 2));

			let color = "#ffffff";
			//if (item && (item.lock || KDGetCurse(item)) {color = "#ffaadd";}
			let icon = item.lock;
			if (KDGetCurse(item)) icon = KDCurses[KDGetCurse(item)]?.customIcon_hud || "Curse";
			if (!icon && sg.blocked) icon = "Blocked";

			if (icon) {
				KDDraw(kdcanvas, kdpixisprites, "icon" + sg.name + icon, KinkyDungeonRootDirectory + `Locks/${icon}.png`,
					x + 3, y + 5 + (mini ? ButtonWidth/2 : 0), (mini ? ButtonWidth/2 : ButtonWidth) - 10, (mini ? ButtonWidth/2 : ButtonWidth) - 10, undefined, {zIndex: 70});
			}

			let GroupText = (sg.name && item) ? (KDGetItemName(item)) : ( TextGet("KinkyDungeonGroup"+ sg.group)); // The name of the group to draw.

			if (!mini)
				DrawTextFitKD(GroupText, x + (icon? ButtonWidth : 0) + ((!sg.left) ? ButtonWidth - (drawLayers ? ButtonWidth : 0) : 0), y + ButtonWidth/2, 250 - (icon ? ButtonWidth : 0), color, "#333333", 24, sg.left ? "left" : "right");
			else {
				KDDraw(kdcanvas, kdpixisprites, "iconrest" + sg.name + GroupText, KDGetItemPreview(item).preview,
					x + 3, y + 5, ButtonWidth, ButtonWidth, undefined, {zIndex: 69});
				//KDDraw(kdcanvas, kdpixisprites, "iconrest2" + sg.name + GroupText, KDGetItemPreview(item).preview2,
				//x + 3, y + 5, ButtonWidth, ButtonWidth, undefined, {zIndex: 69.1});
			}

			if (drawLayers) {
				KDDraw(kdcanvas, kdpixisprites, "layers" + sg.name, KinkyDungeonRootDirectory + "Layers.png",
					x + (sg.left ? 250 : 12), y, 48, 48, undefined, {zIndex: 70});

			}
			DrawButtonKDEx("surfaceItems"+sg.group, (_bdata) => {
				if (drawLayers && surfaceItems.length > 1 && MouseInKD("surfaceItems"+sg.group)) {
					if (!KDStruggleGroupLinkIndex[sg.group]) KDStruggleGroupLinkIndex[sg.group] = 1;
					else KDStruggleGroupLinkIndex[sg.group] = KDStruggleGroupLinkIndex[sg.group] + 1;
				}
				return true;
			}, drawLayers == 2, x + (sg.left ? 0 : 12), y, mini ? 48 : 250, 48, "", drawLayers == 2 ? "#ffffff" : "#888888", "", "", undefined, !(drawLayers == 2), KDTextGray05, 24, undefined, {
				zIndex: 40,
				alpha: 0.1,
			});
			if (KDToggles.StruggleBars && !mini && (item.struggleProgress > 0 || item.cutProgress > 0)) {
				if (item.struggleProgress > 0)
					FillRectKD(kdcanvas, kdpixisprites, "progress"+sg.group, {
						Left: x + (sg.left ? (item.cutProgress ? 5 : 1) : 12) + 250*(item.cutProgress || 0),
						Top: y + 37,
						Width: Math.max(1, 250 * (item.struggleProgress) - (item.cutProgress ? 4 : 0)),
						Height: 9,
						Color: "#aaaaaa",
						zIndex: 41,
						alpha: 0.7,
					});
				if (item.cutProgress > 0)
					FillRectKD(kdcanvas, kdpixisprites, "progresscut"+sg.group, {
						Left: x + (sg.left ? 1 : 12),
						Top: y + 37,
						Width: 250 * item.cutProgress,
						Height: 9,
						Color: "#ff5555",
						zIndex: 42,
						alpha: 0.7,
					});
			}





			if (!renderedButtons) {
				renderButtons();
			}
		}

}

/**
 * @param tightness
 */
function KDTightnessRank(tightness: number): string {
	let factor = Math.min(10, Math.max(0, Math.floor(tightness/2) * 2));
	return factor + "";
}
