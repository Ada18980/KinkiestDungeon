interface KDMajorCurse {
    name: string,
    buff: KDBuff,
    level: number,
    filter: (player: entity) => boolean,
    onApply: (player: entity) => boolean,
}


/**
 * A major curse is a type buff. You can only have one at a time, previous gets overridden if so.
 * A major example is a cursed weapon, which you can only have one of due to reasons
 */
let KDMajorCurses: Record<string, KDMajorCurse> = {
    DollMirror: {
        name: "DollMirror",
        buff: {
            id: "DollMirrorCurse",
            duration: 9999,
            infinite: true,
            aura: "Null",
        },
        level: 5,
        filter: (player) => {
            return true; // no special requirements
        },
        onApply: (player) => {
            // equip doll mirror
            return true;
        },
    }
}