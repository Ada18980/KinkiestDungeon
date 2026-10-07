interface KDMajorCurse {
    name: string,
    level: number,
    filter: (player: entity) => boolean,
    onApply: (player: entity) => boolean,
    weights: Record<string, number>;
}


/**
 * A major curse is a type buff. It's so major you cant have multiple restraints with it on, and it persists even if you dont have a restraint.
 * Removing them usually requires a scripted event
 * A major example is a cursed weapon, which you can only have one of due to reasons
 */
let KDMajorCurses: Record<string, KDMajorCurse> = {
    DollMirror: {
        name: "DollMirror",
        weights: {
            doll: 100,
            generic: 10,
        },
        level: 5,
        filter: (player) => {
            // Can stack with major curses, but not weapon curses
            return Object.values(KDGetBuffsWithTag(player, "weaponcurse")).length == 0;
        },
        onApply: (player) => {
			KDApplyBuffToEntity(player, {
                id: "DollMirrorCurse",
                duration: 9999,
                infinite: true,
                //aura: "Null", // this will get added to make the buff visible after it "awakens"
                tags: ["majorcurse", "weaponcurse"],
                events: [
                    {trigger: "tick", type: "DollMirrorCurse", time: Math.ceil(10 + KDRandom() * 30)}
                ]
            });
            return true;
        },
    }
}

function KDGetMajorCurse(player: entity, tags: string[], minlevel: number = 0, maxlevel: number = 10, culled: boolean = true): string {
    let weights = {};

    for (let curse of Object.values(KDMajorCurses)) {
        if (curse.level >= minlevel && curse.level < maxlevel) {
            if (curse.filter(player)) {
                let w = 0;
                for (let tag of tags) {
                    if (curse.weights[tag]) {
                        w += curse.weights[tag];
                    }
                }
                if (w > 0) {
                    weights[curse.name] = w;
                }
            }
        }
    }

    return culled ? KDCulledGetByWeight(weights) : KDGetByWeight(weights);
}