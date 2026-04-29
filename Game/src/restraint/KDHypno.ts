interface HypnoButton {
    x: number,
    y: number,
    width: number,
    height: number,
    alpha: number,
    duration: number,
    startTick: number,
    buff: string,
    amount: number,
    textKey: string,
    textData: Record<string, string>,
    clicked: boolean,
    textKey_after: string,
}



function KDDrawHypnoOverlay(xoff: number, yoff: number, alpha: number) {
    if (!KinkyDungeonStatsChoice.get("NoHypno")) {
        if (!KDGameData.HypnoButtons) {
            KDGameData.HypnoButtons = [];
        }
        for (let button of KDGameData.HypnoButtons) {
            KDDrawHypnoButton(button, button.x, button.y, alpha);
        }
    }
}

function KDDrawHypnoButton(button: HypnoButton, xoff: number, yoff: number, alpha: number) {

}
