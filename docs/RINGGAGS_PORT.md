# RingGags → Base Game Port

**Branch:** `feature/ringgags-port`  
**Source mod:** RingGags v1.0 by **Sax**  
**Target:** KinkiestDungeon `5.5-Main` (this fork)

## Goal

Integrate RingGags systems into the base game so ring/plug gags, drool SFX,
and breath SFX work **without** the mod enabled.

## Phases

### Phase 1 — Assets ✅ (package ready)

**Binary package:** `RingGags-Phase1-Assets.zip` (from the port workspace)

Extract **at the repository root** so paths match:

```bash
# from repo root (feature/ringgags-port checked out)
unzip -o RingGags-Phase1-Assets.zip
# optional: remove the list file from root if extracted there
rm -f PHASE1_ASSET_LIST.txt
npm run pack   # rebuild texture atlases after Models/ changes
```

| Category | Repo path | Count |
|----------|-----------|-------|
| Drool/breath SFX sprites | `Models/SFX/` | 8 |
| Ring gag models | `Models/RingGags/` | 16 |
| Plug/open gag models | `Models/PlugGags/` | 24 |
| Common | `Models/Common/` | 2 |
| Audio (drip/gulp/unplug) | `Game/Audio/` | 21 |
| Buff / effect tile / icons | `Game/Buffs`, `EffectTiles`, `InventoryAction`, `Items/Restraint` | 5 |

Full path list: `docs/RINGGAGS_PHASE1_ASSETS.txt`

**Note:** Mod `TextureAtlas/` is **not** copied. Base game uses `npm run pack` over `Models/`.

### Phase 2 — Models + restraints
- Register models in `Data/` model lists
- Add restraint entries via `Game/src/restraint/special/RingGags.ts` + list hooks

### Phase 3 — Drool + breath systems
Implement in `Game/src/restraint/special/RingGags.ts`:

- **Drool:** logical stages S1→S4→cycle; **visual** random DroolS1–S4 on every equip/stage change
- **Breath:** visible when mouth open (open/ring gags only) AND any of:
  - Tired: stamina < 50% of max
  - Huffing: stamina < 25% of max
  - Aroused: distraction ≥ 40% of max

### Phase 4 — Plug/unplug + specials
- Open variants, inventory actions, CriersRing, TongueTrap, etc.

### Phase 5 — Polish
Particles, puddles, messages, build, playtest.

## Status

- [x] Branch created from `5.5-Main`
- [x] Port plan + TypeScript skeleton
- [x] Phase 1 asset package + manifest (`docs/RINGGAGS_PHASE1_ASSETS.txt`)
- [ ] Phase 1 binaries committed in-repo (apply zip locally, then `git add Models Game/...`)
- [ ] Phase 2 models/restraints
- [ ] Phase 3 drool/breath logic
- [ ] Phase 4 plug/specials
- [ ] Phase 5 polish + build

## Attribution

Original RingGags mod by **Sax**. Port adapts that design into the base game
for permanent availability on this fork.
