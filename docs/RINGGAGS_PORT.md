# RingGags vanilla port

Branch: `feature/ringgags-port`

## Code
- `Game/src/restraint/special/RingGags.ts` — restraints, drool/breath tick, silent overlays
- `Data/ModelList_RingGags.ts` — AddModel definitions (already on branch)
- Listed in `tsconfig.json` files[]

## Latest commit fixes
- **RG_State** module state (avoids KDGameDataBase TS2339 errors)
- Empty restraint text for BreathFX / DroolS*FX → no `+[NotFound]`
- Silent add/remove suppresses floaters + text messages + sfx
- Cosmetic FX: power -10, escapeChance -100

## Open-mouth mechanisms (from original mod — apply into RingGags.ts)

### 1. Muffled → open-mouth speech (`TextGet` hook)
When **only** OpenGags are worn (`RG_HasOnlyOpenGags()`), replace base gag text keys:

| Key prefix | Pool | Example |
|------------|------|---------|
| `KinkyDungeonGagMumbleAroused` | open aroused | `Aaahh~`, `Haahhh~` |
| `KinkyDungeonGagMumble` | open mumble | `Aahh...`, `Haaahh...` |
| `KinkyDungeonGagStruggleQuiet` | quiet struggle | `Aah.`, `Haa...` |
| `KinkyDungeonGagStruggle` | struggle | `Aaagh!`, `Hnnaa!` |
| `KinkyDungeonGagRestraint` | restraint | `Aah!`, `Nnaah!` |

Design: lips/jaw held apart → cannot form consonants; speech collapses to guttural vowels, deep sighs, indistinct sounds.

### 2. Saliva & drooling (flavor on episode start)
Fire `KinkyDungeonSendTextMessage` when a drool episode starts:
- First episode → pooling saliva, lips cannot seal
- Recurring → more drool escapes past the ring
- Arms bound (cannot wipe) → escalating tiers (chin → neck → chest → resigned)
- Cycle S2 → false-hope lines

### 3. Breathing changes
When breath overlay **turns on** (stamina < 50% or arousal ≥ 40%):
- Tired → soft pants through the open ring
- Huffing (stamina < 25%) → heavy mouth-breathing
- Aroused → ragged gasps / sighs  
Cooldown ~40 ticks to avoid spam.

### 4. Audible noise
On open-mouth speech, `KinkyDungeonMakeNoise(radius, x, y)`:
- Mumble 4 / Aroused 8 / Struggle 6 / Quiet 2 / Restraint 4 tiles
- Crier's Ring doubles radius  
Hook when gag particles fire (`KDSendGagParticles`).

### Restore last good RingGags.ts if needed
```bash
git checkout 958321e682171d7586fd2d186d296297b5be700d -- Game/src/restraint/special/RingGags.ts
```
Then merge the open-mouth pools + hooks from the original mod `RingGags.js` (search `RG_OPEN_MUMBLE`, `TextGet`, `RG_MSG_DROOL`, `RG_NOISE_RADII`).

## Assets still required (not on branch yet)
`Models/RingGags/`, `Models/SFX/`, `Models/PlugGags/`, `Models/Common/`
`Game/Audio/drip*.ogg`, `gulp*.ogg`, `unplug.ogg`
`Game/Buffs/opengag_debuff.png`, `Game/EffectTiles/DroolPuddle.png`
`Game/InventoryAction/Plug.png`, `Unplug.png`

Unpack from `RingGags-Phase1-Assets.zip` at repo root, then:
```
npm run pack
npm run build
```
