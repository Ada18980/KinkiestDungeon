# RingGags vanilla port

Branch: feature/ringgags-port

## Code
- `Game/src/restraint/special/RingGags.ts` — restraints, drool/breath tick, silent overlays
- `Data/ModelList_RingGags.ts` — AddModel definitions (already on branch)
- Listed in `tsconfig.json` files[]

## Latest commit fixes
- **RG_State** module state (avoids KDGameDataBase TS2339 errors)
- Empty restraint text for BreathFX / DroolS*FX → no `+[NotFound]`
- Silent add/remove suppresses floaters + text messages + sfx
- Cosmetic FX: power -10, escapeChance -100

## Assets still required (not on branch yet)
`Models/RingGags/`, `Models/SFX/`, `Models/PlugGags/`, `Models/Common/`
`Game/Audio/drip*.ogg`, `gulp*.ogg`, `unplug.ogg`
`Game/Buffs/opengag_debuff.png`, `Game/EffectTiles/DroolPuddle.png`
`Game/InventoryAction/Plug.png`, `Unplug.png`

Unpack from `RingGags-Vanilla-Integrate.zip` at repo root, then:
```
npm run pack
npm run build
```
