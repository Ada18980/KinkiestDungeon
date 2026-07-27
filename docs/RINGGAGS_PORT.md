# RingGags → Base Game Port

**Branch:** `feature/ringgags-port`  
**Source mod:** RingGags v1.0 by **Sax**  
**Target:** KinkiestDungeon `5.5-Main` (this fork)

## Goal

Integrate RingGags systems into the base game so ring/plug gags, drool SFX,
and breath SFX work **without** the mod enabled.

## Phases

### Phase 1 — Assets
Copy into the repo (then run `npm run pack` for atlases):

| Mod path | Base path |
|----------|-----------|
| `Models/RingGags/**` | `Models/RingGags/**` |
| `Models/PlugGags/**` (open variants) | `Models/PlugGags/**` |
| `Models/SFX/**` | `Models/SFX/**` |
| `Models/Common/**` | `Models/Common/**` |
| `Audio/*.ogg` | `Game/Audio/` |
| `EffectTiles/DroolPuddle.png` | `Game/EffectTiles/` |
| `Buffs/opengag_debuff.png` | `Game/Buffs/` |
| `InventoryAction/Plug.png`, `Unplug.png` | `Game/InventoryAction/` |
| `Items/Restraint/RingGags.png` | `Game/Items/Restraint/` |

### Phase 2 — Models + restraints
- Register models in `Data/` model lists
- Add restraint entries in `Game/src/restraint/KinkyDungeonRestraintsList.ts`
  or keep definitions in `Game/src/restraint/special/RingGags.ts` and register from there

### Phase 3 — Drool + breath systems
Implement in `Game/src/restraint/special/RingGags.ts`:

- **Drool:** logical stages S1→S4→cycle; **visual** random DroolS1–S4 on every equip/stage change
- **Breath:** visible when mouth open (open/ring gags only) AND any of:
  - Tired: stamina < 50% of max
  - Huffing: stamina < 25% of max
  - Aroused: distraction ≥ 40% of max

Hook via core event maps (not mod-only `KDEventMapInventory` patterns that rely on mod load).

### Phase 4 — Plug/unplug + specials
- Open variants of existing plug/muzzle gags
- Inventory Plug/Unplug actions
- CriersRing, TongueTrap, IncantorsMouthpiece, cyber behaviors, NPC swap

### Phase 5 — Polish
Particles, drool puddles, messages, text keys, atlas rebuild, playtest.

## Status

- [x] Branch created from `5.5-Main`
- [x] Port plan + TypeScript skeleton committed
- [ ] Phase 1 assets
- [ ] Phase 2 models/restraints
- [ ] Phase 3 drool/breath logic
- [ ] Phase 4 plug/specials
- [ ] Phase 5 polish + build

## Attribution

Original RingGags mod by **Sax**. Port adapts that design into the base game
for permanent availability on this fork.
