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
}

let KDDollHypnoSuggestions = 10;

let KDHypnoDefaultAlphaRate = 0.5;
let KDMaxHypnoButtons = 20;

function KDDrawHypnoOverlay(xoff: number, yoff: number, alpha: number) {
    if (alpha == 0) return;
    if (!KinkyDungeonStatsChoice.get("NoHypno")) {
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
                    KDDrawHypnoButton(button, xoff + button.x, yoff + button.y, alpha * button.alpha);
                    newButtons.push(button);
                }
            }
            
        }
        KDGameData.HypnoButtons = newButtons;
    }
}

let KDStandardHypnoDuration = 20;
let KDMaxHypnoButtonPlacementAttempts = 64;
let KDStandardHypnoHeight = 80;
let KDStandardHypnoWidth = 160;

function KDAddHypnoButton(buff: string, amount: number, textKey: string, textData?: Record<string, string>, textKey_after?: string, callback?: {name: string, data: any}, player?: number, duration?: number, extraTrance?: number, x?: number, y?: number) {
    let width = KDStandardHypnoWidth;
    let setPoint = (button) => {
        
        let angle = KDRandom() * Math.PI * 2;
        let length = 90 + KDRandom() * 120 + KDRandom() * PIXIHeight/6; + KDRandom() * PIXIHeight/6;
        button.x = PIXIWidth/2 + Math.cos(angle) * length - button.width / 2;
        button.y = PIXIHeight/2 + Math.sin(angle) * length - button.height/2;
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
    };
    if (!x && !y) {
        setPoint(button);
    }
    // check for overlaps
    let ii = 0;
    while (ii++ < KDMaxHypnoButtonPlacementAttempts) {

    }

    if (!KDGameData.HypnoButtons) {
        KDGameData.HypnoButtons = [];
    }
    KDGameData.HypnoButtons.push(button);
    return button;
}

function KDDrawHypnoButton(button: HypnoButton, x: number, y: number, alpha: number) {

    if (DrawButtonKDEx("hypnobutton_" + x + "," + y, 
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
        x, 
        y, 
        button.width, 
        button.height, 
        TextGet(button.textKey), 
        KDBaseWhite, undefined, undefined, 
        undefined, true, 
        KDButtonColor, undefined, undefined, {
            alpha: alpha * 0.4,
            textalpha: alpha,
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