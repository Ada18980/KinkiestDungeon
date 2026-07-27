# RingGags → Base Game Port

**Branch:** `feature/ringgags-port`  
**Source mod:** RingGags v1.0 by **Sax**  
**Target:** KinkiestDungeon `5.5-Main` (this fork)

## Goal

Integrate RingGags into vanilla so gags + drool/breath SFX work **without** the mod.

## Phases

### Phase 1 — Assets ✅
Extract `RingGags-Phase1-Assets.zip` at repo root → `npm run pack`.

### Phase 2 — Models + restraints ✅
`Data/ModelList_RingGags.ts` + restraint defs in `RingGags.ts` via `RG_Register()`.

### Phase 3 — Drool + breath ✅

Implemented in `Game/src/restraint/special/RingGags.ts`:

| System | Behavior |
|--------|----------|
| **Drool logical** | Cooldown → episode S1→S2 (→S4 + cycle if DroolLock) |
| **Drool visual** | Random DroolS1–S4 every `RG_SetDroolOverlay` |
| **Breath** | Open mouth only + (stamina &lt;50% / &lt;25% or distraction ≥40%) |
| **Stuffed** | Non-open gag over open → dry down stages |
| **Puddles** | Chance on tile left when stage &gt; 0 |
| **Cleanup** | `postRemoval` clears overlays when no OpenGag left |

Event types on restraints: `tick` → `ringGagEffects`, `postRemoval` → `ringGagCleanup`.

### Phase 4 — Plug/unplug + specials
Open variants of plugs, inventory Plug/Unplug, DroolLock curse registration, CriersRing curse roll, NPC swap.

### Phase 5 — Polish
Particles/strands, messages, effect-tile trip, full playtest.

## Status

- [x] Branch + plan
- [x] Phase 1 asset package
- [x] Phase 2 models + restraints
- [x] Phase 3 drool + breath tick/overlay
- [ ] Phase 1 binaries committed locally
- [ ] Explicit `RG_Register()` if auto-init fails
- [ ] Phase 4 plug/specials
- [ ] Phase 5 polish + build

## Attribution

Original RingGags mod by **Sax**.
