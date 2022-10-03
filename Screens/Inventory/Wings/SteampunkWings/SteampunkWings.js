'use strict';

/** @type {DynamicBeforeDrawCallback} */
function AssetsWingsSteampunkWingsBeforeDraw({ PersistentData, L, LayerType: lt }) {
	const MaxFrame = 8;
	const MaxFrameGears = 2;
	const Data = PersistentData();
	if (typeof Data.State !== "number") Data.State = 0;
	if (typeof Data.StateGears !== "number") Data.StateGears = 0;
	if (typeof Data.Modifier !== "number") Data.Modifier = 1;
	if (typeof Data.ModifierGears !== "number") Data.ModifierGears = 1;

	// Gears
	if (L.includes("Gears")) {
		return { LayerType: Data.StateGears === 0 ? '' : Data.StateGears};
	}

	// Others
	if (!L.includes("Wing")) return;

	// Wings

	if (Data.DrawRequested) {
		if (Data.FrameTime > 250) {
			Data.State = Math.floor(Math.random() * MaxFrame);
			Data.StateGears = Math.floor(Math.random() * MaxFrameGears);
		} else {
			if (Data.State == MaxFrame) Data.Modifier = -1;
			if (Data.State == 0) Data.Modifier = 1;
			if (Data.StateGears == MaxFrameGears) Data.ModifierGears = -1;
			if (Data.StateGears == 0) Data.ModifierGears = 1;
			Data.State += Data.Modifier;
			Data.StateGears += Data.ModifierGears;
		}
	}

	Data.DrawRequested = false;
	const LayerType = Data.State === 0 ? '' : Data.State;
	return { LayerType };
}

/** @type {DynamicScriptDrawCallback} */
function AssetsWingsSteampunkWingsScriptDraw({ C, Item, PersistentData }) {
	const Type = (Item.Property || {}).Type;
	if (Type !== "On") return;

	const Data = PersistentData();

	if (typeof Data.FrameTime !== "number")
		Data.FrameTime = Player.GraphicsSettings ? Math.max(250, (Player.GraphicsSettings.AnimationQuality * 0.5)) : 250;
	if (typeof Data.ChangeTime !== "number") Data.ChangeTime = CommonTime() + Data.FrameTime;

	if (Data.ChangeTime < CommonTime()) {
		Data.FrameTime = Player.GraphicsSettings ? Math.max(250, (Player.GraphicsSettings.AnimationQuality * 0.5)) : 250;
		Data.ChangeTime = CommonTime() + Data.FrameTime;
		Data.DrawRequested = true;
		AnimationRequestRefreshRate(C, Data.FrameTime);
		AnimationRequestDraw(C);
	}
}
