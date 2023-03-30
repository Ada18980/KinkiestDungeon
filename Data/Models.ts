let KDCanvasRenderMap = new Map();
KDCanvasRenderMap.set(KinkyDungeonCanvasPlayer, "temp");

/**
 * Returns a table with the priorities for each layer based on order of the array
 */
function InitLayers(layers: string[]): {[_: string]: number} {
	let table: {[_: string]: number} = {};
	let count = 0;
	for (let l of layers) {
		table[l] = count * LAYER_INCREMENT;
		count += 1;
	}
	return table;
}
let ModelLayers = InitLayers(LAYERS_BASE);


let ModelDefs: {[_: string]: Model} = {};

function AddModel(Model: Model) {
	ModelDefs[Model.Name] = Model;
}

let KDCurrentModels: Map<Character, ModelContainer> = new Map();

class ModelContainer {

	public HighestPriority: {[_: string]: number};

	Character: Character;
	Models: Map<string, Model>;
	Containers: Map<string, {SpriteList: Map<string, any>, SpritesDrawn: Map<string, any>, Container: any}>;
	ContainersDrawn: Map<string, any>;
	Poses: Record<string, boolean>;
	Update: Map<any, any>;

	constructor(Character: Character, Models: Map<string, Model>, Containers: Map<string, {SpriteList: Map<string, any>, SpritesDrawn: Map<string, any>, Container: any}>, ContainersDrawn: Map<string, any>, Poses: Record<string, boolean>) {
		this.Character = Character;
		this.Containers = Containers;
		this.ContainersDrawn = ContainersDrawn;
		this.Models = Models;
		this.Poses = Poses;
		this.HighestPriority = {};
		this.Update = new Map();
	}

	/**
	 * Adds a model to the modelcontainer
	 */
	addModel(Model: Model) {
		this.Models.set(Model.Name, JSON.parse(JSON.stringify(Model)));
	}

	/**
	 * Deletes a model to the modelcontainer
	 */
	removeModel(Model: string) {
		this.Models.delete(Model);
	}
}

function ToLayerMap(Layers: ModelLayer[]): {[_: string]: ModelLayer} {
	return ToNamedMap(Layers);
}

function GetModelLayers(ModelName: string): ModelLayer[] {
	if (ModelDefs[ModelName]) {
		return Object.values(ModelDefs[ModelName].Layers);
	}
	return [];
}


function DisposeCharacter(C) {
	if (KDCurrentModels.get(C)) {
		for (let Container of KDCurrentModels.get(C).Containers.values()) {
			Container.Container.destroy();
			kdcanvas.removeChild(Container);
		}

	}
}

/**
 * Refreshes the character if not all images are loaded and draw the character canvas on the main game screen
 * @param C - Character to draw
 * @param X - Position of the character on the X axis
 * @param Y - Position of the character on the Y axis
 * @param Zoom - Zoom factor
 * @param IsHeightResizeAllowed - Whether or not the settings allow for the height modifier to be applied
 * @param DrawCanvas - Pixi container to draw to
 * @param Blend - The blend mode to use
 * @param StartMods - Mods applied
 */
function DrawCharacter(C: Character, X: number, Y: number, Zoom: number, IsHeightResizeAllowed: boolean = true, DrawCanvas: any = null, Blend: any = PIXI.SCALE_MODES.LINEAR, StartMods: PoseMod[] = []): void {
	/** @type {ModelContainer} */
	let MC = !KDCurrentModels.get(C) ? new ModelContainer(
		C,
		new Map(),
		new Map(),
		new Map(),
		KDGeneratePoseArray(),
	) : KDCurrentModels.get(C);

	if (MC.Models.size == 0) UpdateModels(MC);

	let containerID = `${X},${Y},${Zoom}`;
	if (!MC.Containers.get(containerID)) {
		let Container = {
			Container: new PIXI.Container(),
			SpritesDrawn: new Map(),
			SpriteList: new Map(),
		};
		MC.Containers.set(containerID, Container);
		kdcanvas.addChild(Container.Container);
		Container.Container.sortableChildren = true;
	}
	if (!MC.ContainersDrawn.get(containerID)) {
		MC.ContainersDrawn.set(containerID, MC.Containers.get(containerID));
		MC.Update.delete(containerID);
	}

	// Actual loop for drawing the models on the character

	if (!MC.Update.get(containerID)) {
		let oldBlend = PIXI.BaseTexture.defaultOptions.scaleMode;
		PIXI.BaseTexture.defaultOptions.scaleMode = Blend;
		DrawCharacterModels(MC, X + Zoom * MODEL_SCALE * MODELWIDTH/2, Y + Zoom * MODEL_SCALE * MODELHEIGHT/2, (Zoom * MODEL_SCALE) || MODEL_SCALE, StartMods,
			MC.Containers.get(containerID));
		MC.Update.set(containerID, true);

		let Container = MC.Containers.get(containerID);
		// Cull sprites that weren't drawn yet
		for (let sprite of Container.SpriteList.entries()) {
			if ((!Container.SpritesDrawn.has(sprite[0]) && sprite[1])) {
				sprite[1].parent.removeChild(sprite[1]);
				Container.SpriteList.delete(sprite[0]);
				sprite[1].destroy();
			}
		}
		Container.SpritesDrawn.clear();
		PIXI.BaseTexture.defaultOptions.scaleMode = oldBlend;
	}


	// Store it in the map so we don't have to create it again
	if (!KDCurrentModels.get(C)) {
		KDCurrentModels.set(C, MC);
	}
}
/** Future function */
let DrawModel = DrawCharacter;

/**
 * Setup sprites from the modelcontainer
 */
function DrawCharacterModels(MC: ModelContainer, X, Y, Zoom, StartMods, ContainerContainer) {
	// We create a list of models to be added
	let Models = new Map(MC.Models.entries());

	// Create the highestpriority matrix
	MC.HighestPriority = {};
	for (let m of Models.values()) {
		for (let l of Object.values(m.Layers)) {
			if (!l.NoOverride)
				MC.HighestPriority[l.Layer] = Math.max(MC.HighestPriority[l.Layer] || -500, l.Pri || -500);
		}
	}


	// TODO hide, filtering based on pose, etc etc
	let {X_Offset, Y_Offset} = ModelGetPoseOffsets(MC.Poses);
	let {rotation, X_Anchor, Y_Anchor} = ModelGetPoseRotation(MC.Poses);
	let mods = ModelGetPoseMods(MC.Poses);
	ContainerContainer.Container.angle = rotation;
	ContainerContainer.Container.pivot.x = MODELWIDTH*Zoom * X_Anchor;
	ContainerContainer.Container.pivot.y = MODELHEIGHT*Zoom * Y_Anchor;
	ContainerContainer.Container.x = X + (MODEL_XOFFSET + MODELWIDTH * X_Offset) * Zoom;
	ContainerContainer.Container.y = Y + (MODELHEIGHT * Y_Offset) * Zoom;

	for (let m of StartMods) {
		if (!mods[m.Layer]) mods[m.Layer] = [];
		mods[m.Layer].push(m);
	}

	/** @type {Record<string, boolean>} */
	let drawLayers = {};

	for (let m of Models.values()) {
		for (let l of Object.values(m.Layers)) {
			drawLayers[m.Name + "," + l.Name] = ModelDrawLayer(MC, m, l, MC.Poses);
		}
	}

	// Now that we have the final list of models we do a KDDraw
	for (let m of Models.values()) {
		for (let l of Object.values(m.Layers)) {
			if (drawLayers[m.Name + "," + l.Name] && !ModelLayerHidden(drawLayers, MC, m, l, MC.Poses)) {
				let ox = 0;
				let oy = 0;
				let ax = 0;
				let ay = 0;
				let sx = 1;
				let sy = 1;
				let rot = 0;
				let layer = l.Layer;
				while (layer) {
					/** @type {PoseMod[]} */
					let mod_selected = mods[layer] || [];
					for (let mod of mod_selected) {
						ox = mod.offset_x || ox;
						oy = mod.offset_y || oy;
						ax = mod.rotation_x_anchor || ax;
						ay = mod.rotation_y_anchor || ay;
						sx *= mod.scale_x || 1;
						sy *= mod.scale_y || 1;
						rot += mod.rotation || 0;
					}
					layer = LayerProperties[layer]?.Parent;
				}

				let fh = m.Filters ? (m.Filters[l.InheritColor || l.Name] ? FilterHash(m.Filters[l.InheritColor || l.Name]) : "") : "";
				let filter = m.Filters ? (m.Filters[l.InheritColor || l.Name] ?
					(KDAdjustmentFilterCache.get(fh) || [new __filters.AdjustmentFilter(m.Filters[l.InheritColor || l.Name])])
					: undefined) : undefined;
				if (filter && !KDAdjustmentFilterCache.get(fh)) KDAdjustmentFilterCache.set(FilterHash(m.Filters[l.InheritColor || l.Name]), filter);
				let img = ModelLayerString(m, l, MC.Poses);
				KDDraw(
					ContainerContainer.Container,
					ContainerContainer.SpriteList,
					`layer_${m.Name}_${l.Name}_${img}_${fh}`,
					img,
					ox * MODELWIDTH * Zoom, oy * MODELHEIGHT * Zoom, undefined, undefined,
					rot * Math.PI / 180, {
						zIndex: -ModelLayers[l.Layer] + (l.Pri || 0),
						anchorx: (ax - (l.OffsetX/MODELWIDTH || 0)) * (l.AnchorModX || 1),
						anchory: (ay - (l.OffsetY/MODELHEIGHT || 0)) * (l.AnchorModY || 1),
						scalex: sx != 1 ? sx : undefined,
						scaley: sy != 1 ? sy : undefined,
						filters: filter,
						cacheAsBitmap: filter != undefined,
					}, false,
					ContainerContainer.SpritesDrawn,
					Zoom
				);
			}
		}
	}
}

function FilterHash(filter) {
	let str = "";
	for (let f of Object.values(filter)) str = str + "_" + Math.round((f as number) * 1000);
	return str;
}

let KDAdjustmentFilterCache = new Map();

/**
 * Determines if we should draw this layer or not
 * @param {ModelContainer} MC
 * @param {Model} Model
 * @param {ModelLayer} Layer
 * @param {Record<string, boolean>} Poses
 * @returns {boolean}
 */
function ModelDrawLayer(MC, Model, Layer, Poses) {
	// Hide if not highest
	if (Layer.HideWhenOverridden) {
		if (Layer.HideOverrideLayerMulti) {
			for (let LL of Layer.HideOverrideLayerMulti) {
				let priTest = MC.HighestPriority[LL];
				if (priTest > Layer.Pri) return false;
			}
		} else {
			let priTest = MC.HighestPriority[Layer.HideOverrideLayer || Layer.Layer];
			if (priTest > Layer.Pri) return false;
		}
	}

	// Hide poses
	if (Layer.HidePoses) {
		for (let p of Object.keys(Poses)) {
			if (Layer.HidePoses[p]) {
				return false;
			}
		}
	}
	// Filter poses
	if (Layer.Poses) {
		let found = false;
		for (let p of Object.keys(Poses)) {
			if (Layer.Poses[p]) {
				found = true;
				break;
			}
		}
		if (!found) return false;
	}
	// TODO filter hide
	return true;
}

/**
 * Determines if we should draw this layer or not
 */
function ModelLayerHidden(drawLayers: {[_: string]: boolean}, MC: ModelContainer, Model: Model, Layer: ModelLayer, Poses: {[_: string]: boolean}): boolean {
	// Hide if not highest
	if (Layer.TieToLayer) {
		if (!drawLayers[Model.Name + "," + Layer.Name]) return true;
	}
	return false;
}

function ModelLayerString(Model: Model, Layer: ModelLayer, Poses: {[_: string]: boolean}): string {
	return `Models/${Model.Folder}/${LayerSprite(Layer, Poses)}.png`;
}

/**
 * Gets the sprite name for a layer for a given pose
 */
function LayerSprite(Layer: ModelLayer, Poses: {[_: string]: boolean}): string {
	let pose = "";

	let foundPose = false;

	// change the pose if its a morph pose, this helps to avoid duplication
	let cancel = false;
	if (Layer.MorphPoses) {
		for (let dp of Object.entries(Layer.MorphPoses)) {
			if (Poses[dp[0]] != undefined) {
				pose = dp[1];
				cancel = true;
				foundPose = true;
				break;
			}
		}
	}

	if (!Layer.Invariant) {
		// Handle the actual poses
		if (Layer.Poses && !cancel) {
			// Otherwise we append pose name to layer name
			for (let p of Object.keys(Layer.Poses)) {
				if (Poses[p] != undefined) {
					pose =
						(
							(
								!(Layer.GlobalDefaultOverride && Layer.GlobalDefaultOverride[p])
								&& PoseProperties[p])
									? PoseProperties[p].global_default
									: p)
						|| p;
					foundPose = true;
					break;
				}
			}
		}

		// For simplicity, we can have a global default override and it will add it as a pose to the list
		// This helps simplify definitions, like for hogtie
		if (!foundPose && !cancel && Layer.GlobalDefaultOverride) {
			for (let p of Object.keys(Layer.GlobalDefaultOverride)) {
				if (Poses[p] != undefined) {
					pose = p;
					break;
				}
			}
		}

	}

	if (Layer.AppendPose) {
		for (let p of Object.keys(Layer.AppendPose)) {
			if (Poses[p] != undefined && (!Layer.AppendPoseRequire || Layer.AppendPoseRequire[p])) {
				pose = pose + p;
				break;
			}
		}
	}

	return (Layer.Sprite != undefined ? Layer.Sprite : Layer.Name) + pose;
}

/**
 * Updates models on a character
 * @param {ModelContainer} MC
 */
function UpdateModels(MC) {
	MC.Models = new Map();
	MC.Update.clear();

	// Start with base body
	if (!MC.Models.get("Body"))
		MC.addModel(ModelDefs.Body);

	let appearance = MC.Character.Appearance;
	for (let A of appearance) {
		if (A.Model) {
			MC.addModel(A.Model);
		}
	}

	/*
	MC.addModel(ModelDefs.Catsuit);
	//MC.addModel(ModelDefs.Labcoat);
	//MC.addModel(ModelDefs.Pauldrons);
	//MC.addModel(ModelDefs.Breastplate);
	MC.addModel(ModelDefs.Bandit);
	*/
}

/**
 * Returns a list of colorable layer names
 */
function KDGetColorableLayers(Model: Model): string[] {
	let ret = [];
	for (let layer of Object.values(Model.Layers)) {
		if (!layer.NoColorize && !layer.InheritColor) {
			ret.push(layer.Name);
		}
	}
	return ret;
}

function KDGeneratePoseArray(ArmsPose: string | undefined = undefined, LegsPose: string | undefined = undefined, EyesPose: string | undefined = undefined, BrowsPose: string | undefined = undefined, BlushPose: string | undefined = undefined, MouthPose: string | undefined = undefined, Eyes2Pose: string | undefined = undefined, Brows2Pose: string | undefined = undefined, ExtraPose: string | undefined = undefined): {[_: string]: boolean} {
	let poses: {[_: string]: boolean} = {};
	poses[ArmsPose || "Free"] = true;
	poses[LegsPose || "Spread"] = true;
	poses[EyesPose || "EyesNeutral"] = true;
	poses[BrowsPose || "BrowsNeutral"] = true;
	poses[BlushPose || "BlushNone"] = true;
	poses[MouthPose || "MouthNeutral"] = true;
	poses[(Eyes2Pose || EYE2POSES[EYEPOSES.indexOf(EyesPose)] || "Eyes2Neutral")] = true;
	poses[(Brows2Pose || BROW2POSES[BROWPOSES.indexOf(BrowsPose)] || "Brows2Neutral")] = true;
	if (ExtraPose) {
		for (let p of ExtraPose) {
			poses[p] = true;
		}
	}
	return poses;
}


function KDGetPoseOfType(C: Character, Type: string): string {
	let checkArray = [];
	switch (Type) {
		case "Arms": checkArray = ARMPOSES; break;
		case "Legs": checkArray = LEGPOSES; break;
		case "Eyes": checkArray = EYEPOSES; break;
		case "Eyes2": checkArray = EYE2POSES; break;
		case "Brows": checkArray = BROWPOSES; break;
		case "Brows2": checkArray = BROW2POSES; break;
		case "Blush": checkArray = BLUSHPOSES; break;
		case "Mouth": checkArray = MOUTHPOSES; break;
	}
	if (KDCurrentModels.get(C)?.Poses)
		for (let p of checkArray) {
			if (KDCurrentModels.get(C).Poses[p]) {
				return p;
			}
		}
	return "";
}