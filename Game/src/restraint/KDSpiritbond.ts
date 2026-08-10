function KDGetSpiritBondEntityLocal(player: entity, item: item): entity {
    let id = item?.data?.npc;

    if (id) {
        return KinkyDungeonFindID(id);
    }
    return null;
}
function KDGetSpiritBondEntity(player: entity, item: item): entity {
    let id = item?.data?.npc;

    if (id) {
        return KDGetGlobalEntity(id);
    }
    return null;
}
function KDGetSpiritBondID(player: entity, item: item): number {
    let id = item?.data?.npc;

    if (id) {
        return id;
    }
    return null;
}


function KDGetSpiritBondID_General(player: entity) {
    for (let item of KDAllRestraintDynamicList()) {
        if (KDRestraint(item)?.spiritbond && KDGetSpiritBondID(player, item)) return KDGetSpiritBondID(player, item); 
    }
    return 0;
}