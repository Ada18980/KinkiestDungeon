# RingGags → Base Game Port

**Branch:** `feature/ringgags-port`  
**Source mod:** RingGags v1.0 by **Sax**  
**Target:** KinkiestDungeon `5.5-Main` (this fork)

## Goal

Integrate RingGags into vanilla so gags + drool/breath SFX work **without** the mod.

## Phases

### Phase 1 — Assets ✅
Extract `RingGags-Phase1-Assets.zip` at repo root, then `npm run pack`.
See `docs/RINGGAGS_PHASE1_ASSETS.txt`.

### Phase 2 — Models + restraints ✅

| File | Role |
|------|------|
| `Data/ModelList_RingGags.ts` | AddModel for ring/spider/open/SFX overlays |
| `Game/src/restraint/special/RingGags.ts` | Restraint defs + `RG_Register()` |

**Wire-up:** Ensure `RG_Register()` runs after `KinkyDungeonRestraints` is populated.
If the module loads too early, call it from restraint init (e.g. end of
`KinkyDungeonRestraintsList.ts` or main game boot):

```ts
import { RG_Register } from "./special/RingGags";
// after restraints array is ready:
RG_Register();
```

`Data/ModelList_*.ts` files are loaded with the rest of Data; no extra import
if your build already includes all `Data/*.ts`.

**Registered restraints (Phase 2):**  
RingGag, HarnessRingGag, LargeRingGag, HugeRingGag, LatexRingGag,
DragonscaleRingGag, HighsecSpiderGag, MagicSpiderGag, GoodGirlGag,
CriersRing, TongueTrap, IncantorsMouthpiece + cosmetic DroolS1–4FX / BreathFX.

### Phase 3 — Drool + breath systems
Tick handlers for random drool visual + breath (tired/huff/aroused).

### Phase 4 — Plug/unplug + specials
Open variants of existing plugs, inventory actions, curses.

### Phase 5 — Polish
Particles, puddles, messages, full playtest.

## Status

- [x] Branch + plan + skeleton
- [x] Phase 1 asset package + manifest
- [x] Phase 2 models + core restraints
- [ ] Phase 1 binaries in git (local unzip + commit)
- [ ] Explicit `RG_Register()` call site if auto-init fails
- [ ] Phase 3 drool/breath logic
- [ ] Phase 4 plug/specials
- [ ] Phase 5 polish + build

## Attribution

Original RingGags mod by **Sax**.
