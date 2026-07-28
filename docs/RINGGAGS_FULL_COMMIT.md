# Full commit — open-mouth mechanisms

## Already on branch
- `Game/src/restraint/special/RingGagsDialogue.ts` — speech, drool/breath flavor, noise hooks (commit `5d77ba4`)

## Required local steps

### 1. Restore core `RingGags.ts`
```bash
git checkout 958321e682171d7586fd2d186d296297b5be700d -- Game/src/restraint/special/RingGags.ts
```

### 2. Register dialogue module in `tsconfig.json`
Immediately after the `RingGags.ts` entry, add:
```json
        "Game/src/restraint/special/RingGags.ts",
        "Game/src/restraint/special/RingGagsDialogue.ts",
```

### 3. Wire flavor into `RG_TickHandler` (in `RingGags.ts`)

**A.** Extend `RG_State`:
```js
LastNoiseCategory: null,
BreathMsgCooldown: 0,
LastBreathWasActive: false,
```

**B.** Add helper (if missing):
```js
function RG_HasCriersRing() {
	for (var rest of KinkyDungeonAllRestraintDynamic()) {
		if (rest.item && rest.item.name === "CriersRing") return true;
	}
	return false;
}
```

**C.** On drool episode start (right after `RG_SetDroolOverlay(nextStage);`):
```js
if (typeof RG_FireDroolStartMessage === "function")
	RG_FireDroolStartMessage(nextStage, isCycling, armsBound, hasDroolLock);
```

**D.** After breath overlay logic:
```js
if (RG_State.BreathMsgCooldown > 0) RG_State.BreathMsgCooldown -= 1;
if (breathActive && !RG_State.LastBreathWasActive) {
	var staminaRatio = staminaMax > 0 ? stamina / staminaMax : 1;
	var aroused = distractionMax > 0 && distraction / distractionMax >= RG_BREATH_AROUSED;
	if (typeof RG_FireBreathMessage === "function")
		RG_FireBreathMessage(staminaRatio, aroused);
}
RG_State.LastBreathWasActive = breathActive;
```
(Ensure `stamina` / `distraction` vars are in scope — expand the existing breath block if needed.)

### 4. Build & test
```bash
npm run build
npm run serve
```

### What you should see
| Situation | Effect |
|-----------|--------|
| Only open gags | Speech = `Aahh...` / `Haahhh~` (not muffled mmph) |
| Drool episode | Flavor text about pooling saliva |
| Low stamina / aroused | Breath overlay + pant/gasp lines |
| Open-mouth speech | `KinkyDungeonMakeNoise` alerts nearby enemies |
