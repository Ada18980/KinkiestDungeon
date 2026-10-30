interface HypnoButton {
    x: number,
    y: number,
    width: number,
    height: number,
    alpha: number,
    clicked?: boolean,
    duration: number,
    startTick: number,
    buff: string,
    amount: number,
    extratrance: number,
    textKey: string,
    textData: Record<string, string>,
    alphaRate: number,
    textKey_after: string,
    callback?: string,
    callbackdata?: any,
    player?: number,
    zIndex?: number,
    renderType?: string,
}

interface KDHypnoRenderType {
    render: (button: HypnoButton, x: number, y: number, alpha: number, trance: number) => void
}

let KDHypnoRenderTypes: Record<string, KDHypnoRenderType> = {
    Default: {
        render: KDDrawHypnoButton,
    },
    Spiral: {
        render: (button: HypnoButton, x: number, y: number, alpha: number, trance: number) => {
            KDDrawHypnoButton(button, x, y, alpha);
            if (!KDToggles.HypnoSpiral) return;

            let mask = FillRectKD(kdcanvas, kdpixisprites, 
                "hypnobutton_" + button.x + "," + button.y + "," + button.textKey + "_mask", {
                Left: x - KDHypnoIntensity,
                Top: y - KDHypnoIntensity,
                Width: button.width*KinkyDungeonGridSizeDisplay + 2*KDHypnoIntensity,
                Height: button.height*KinkyDungeonGridSizeDisplay + 2*KDHypnoIntensity, 
                Color: KDBaseWhite,
                zIndex: button.zIndex + 100 + 0.01,
                alpha: 1.0
            });

            let angle = kdpixisprites.get("hypnobutton_" + button.x + "," + button.y + "," + button.textKey + "_spiral")?.rotation || 0;
            let exists = !!kdpixisprites.get("hypnobutton_" + button.x + "," + button.y + "," + button.textKey + "_spiral");
            let ang = (angle + KDDrawDelta * KDHypnoSpin * (1 + trance * KDHypnoSpinMult)) % (Math.PI * 2);

            KDDraw(kdcanvas, kdpixisprites, "hypnobutton_" + button.x + "," + button.y + "," + button.textKey + "_spiral",
                KinkyDungeonRootDirectory + "HypnoSpiral.png", 
                 x + button.width*KinkyDungeonGridSizeDisplay/2, 
                 y + button.height*KinkyDungeonGridSizeDisplay/2, 
                undefined, undefined,
                ang, {
                    zIndex: button.zIndex + 100 + 0.01,
                    mask: mask,
                    alpha: (0.1 + 0.9 * trance) * alpha * 0.4 * (0.7 + 0.3 * Math.sin((CommonTime() / 3000) % (Math.PI * 2)))
                }
            )
            if (!exists) {
                kdpixisprites.get("hypnobutton_" + button.x + "," + button.y + "," + button.textKey + "_spiral").anchor.set(0.5);
                
            }
            kdpixisprites.get("hypnobutton_" + button.x + "," + button.y + "," + button.textKey + "_spiral").scale.set(1.1* button.width*KinkyDungeonGridSizeDisplay/512);
            kdpixisprites.get("hypnobutton_" + button.x + "," + button.y + "," + button.textKey + "_spiral").rotation = ang;
            
        },
    },

}

let KDHypnoSpin = 0.0005;
let KDHypnoSpinMult = 4;

let KDDollHypnoSuggestions = 10;

let KDHypnoDefaultAlphaRate = 0.5;
let KDMaxHypnoButtons = 20;

function KDDrawHypnoOverlay(xoff: number, yoff: number, xmult: number, ymult: number, alpha: number) {
    if (alpha == 0) return;
    if (!KinkyDungeonStatsChoice.get("NoHypno")) {
        let trance = KDEntityBuffedStat(KDPlayer(), "Hypnosis")/100;
        if (!KDGameData.HypnoButtons) {
            KDGameData.HypnoButtons = [];
        }
        let newButtons = [];
        let ii = 0;
        for (let button of KDGameData.HypnoButtons) {
            if (KDGameData.HypnoButtons.length <= KDMaxHypnoButtons
                || ii++ > KDGameData.HypnoButtons.length - KDMaxHypnoButtons) {
                if (button.clicked || KinkyDungeonCurrentTick > button.startTick + button.duration) {
                    button.alpha -= 2*button.alphaRate*KinkyDungeonDrawDelta*0.001;
                } else if (button.alpha < 1) {
                    button.alpha += KinkyDungeonDrawDelta * button.alphaRate*0.001;
                    if (button.alpha > 1) button.alpha = 1;
                }
                if (button.alpha > 0) {
                    KDHypnoRenderTypes[button.renderType || "Default"].render(
                        button, xoff + button.x * xmult, yoff + button.y * ymult, alpha * button.alpha, trance);
                    newButtons.push(button);
                }
            }
            
        }
        KDGameData.HypnoButtons = newButtons;
    }
}

let KDStandardHypnoDuration = 20;
let KDMaxHypnoButtonPlacementAttempts = 64;
let KDStandardHypnoHeight = 1;
let KDStandardHypnoWidth = 2;
let KDStandardHypnoDist = 5;

function KDAddHypnoButton(buff: string, amount: number, textKey: string, textData?: Record<string, string>, textKey_after?: string,
        callback?: {name: string, data: any}, player?: number, duration?: number, extraTrance?: number, x?: number, y?: number, renderType?: string) {
    let width = KDStandardHypnoWidth;
    let setPoint = (button) => {
        
        let angle = KDRandom() * Math.PI * 2;
        let length = 1 + KDRandom() * KDStandardHypnoDist;
        button.x = Math.round(Math.cos(angle) * length);
        button.y = Math.round(Math.sin(angle) * length);
    }
    let button: HypnoButton = {
        x: x || 0,
        y: y || 0,
        alpha: 0,
        alphaRate: KDHypnoDefaultAlphaRate * (0.5 + KDRandom()),
        amount: amount,
        buff: buff,
        extratrance: extraTrance,
        duration: duration || Math.floor(KDStandardHypnoDuration * (0.5 + KDRandom())),
        height: KDStandardHypnoHeight,
        startTick: KinkyDungeonCurrentTick,
        textKey: textKey,
        textData: textData,
        textKey_after: textKey_after,
        width: width,
        clicked: false,
        callback: callback?.name,
        callbackdata: callback?.data,
        player: player,
        renderType: renderType,
        zIndex: KDRandom(),
    };
    if (!x && !y) {
        setPoint(button);
    }
    // check for overlaps
    let ii = 0;
    while (ii++ < KDMaxHypnoButtonPlacementAttempts) {
        for (let hb of KDGameData.HypnoButtons) {
            if (((
                (hb.x) == x
                || (hb.x+1) == x
                || (hb.x-1) == x
            ) && hb.y == y
            )) {
                setPoint(button)
            } else if (((
                (x) == 0
                || (x-1) == 0
            ) && y == 0
            )) {
                setPoint(button)
            }
        }
    }

    if (!KDGameData.HypnoButtons) {
        KDGameData.HypnoButtons = [];
    }
    KDGameData.HypnoButtons.push(button);
    return button;
}

function KDDrawHypnoButton(button: HypnoButton, x: number, y: number, alpha: number) {

    if (DrawButtonKDEx("hypnobutton_" + button.x + "," + button.y + "," + button.textKey, 
        (data) => {
            if (alpha == 1) {
                if (button.textKey_after) {
                    button.textKey = button.textKey_after;
                    delete button.textKey_after;
                } else {
                    button.clicked = true;
                    let player = KDPlayer();
                    if (button.extratrance) {
                        KDAddTrance(player, button.extratrance);
                    }
                    if (button.amount) {
                        KDAddSpecialStat(button.buff, player, button.amount, true);
                    }
                    if (button.callback && KinkyDungeonFindID(button.player)) {
                        if (KDHypnoCallbacks[button.callback]) {
                            KDHypnoCallbacks[button.callback](button.callbackdata);
                        }
                    }
                }
            }
           
            return true;
        }, 
        alpha > 0, 
        x - KDHypnoIntensity - 1, 
        y - KDHypnoIntensity - 1, 
        button.width * KinkyDungeonGridSizeDisplay + 2 * KDHypnoIntensity + 2, 
        button.height * KinkyDungeonGridSizeDisplay + 2 * KDHypnoIntensity + 2, 
        TextGet(button.textKey), 
        KDBaseWhite, undefined, undefined, 
        undefined, true, 
        KDButtonColor, undefined, undefined, {
            alpha: alpha * 0.4,
            textalpha: alpha,
            zIndex: 100 + button.zIndex || 0,
        })) {
        if (button.textKey_after) {
            button.textKey = button.textKey_after;
            delete button.textKey_after;
        }
        if (button.alpha < 1 && !(button.clicked || KinkyDungeonCurrentTick > button.startTick + button.duration)) {
            button.alpha += 3*KinkyDungeonDrawDelta * button.alphaRate*0.001;
            if (button.alpha > 1) button.alpha = 1;
        }
    }
}


let KDHypnoCallbacks : Record<string, (data: any) => void> = {
    DollAccept: (data) => {
        let player = KinkyDungeonFindID(data.player);
        if (!player) return;
        if (KinkyDungeonJailGuard()) {
            //KDStunTurns(Math.floor(2 * (0.5 + KDRandom())), true);
        } else {
            KDStunTurns(40, true);
            // freeze the player and call an NPC to make the player a doll
            KinkyDungeonSetFlag("GuardCalled", 35);
            let entity = KinkyDungeonCallGuard(player.x, player.y,
                    true, true, undefined, "Dressmaker", "dolldressmaker");
            if (entity) {
                // TODO add intent action to bring up doll dialogue
            }
        }
    },
    DollStill: (data) => {
        KDStunTurns(Math.floor(2 * (0.5 + KDRandom())), false);
    },
    DollSilent: (data) => {
        let player = KinkyDungeonFindID(data.player);
        if (!player) return;
        KDApplyGenBuffs(player, "Silenced", Math.floor(5 * (0.5 + KDRandom())));
    },
}