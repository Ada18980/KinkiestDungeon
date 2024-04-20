let SHOWMESHPOINTS = false;
let StruggleAnimation = false;

let RenderCharacterQueue = new Map();
let RenderCharacterLock = new Map();

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

function AddModel(Model: Model, Strings?: Record<string, string>) {
	ModelDefs[Model.Name] = Model;
	if (Strings) {
		for (let str of Object.entries(Strings)) {
			addTextKey("m" + str[0], str[1]);
		}
	}
}

let KDCurrentModels: Map<Character, ModelContainer> = new Map();

interface ContainerInfo {
	readonly SpriteList: Map<string, any>;
	readonly SpritesDrawn: Map<string, any>;
	readonly Container: PIXIContainer;
	readonly Mesh: PIXIMesh;
	readonly RenderTexture: PIXIRenderTexture;
	readonly Matrix: PIXIArray;
}

class ModelContainer {

	public HighestPriority: {[_: string]: number};
	public HiddenLayers: {[_: string]: number};
	public XRayFilters: string[];

	Character: Character;
	Models: Map<string, Model>;
	Containers: Map<string, ContainerInfo>;
	ContainersDrawn: Map<string, ContainerInfo>;
	Poses: Record<string, boolean>;
	TempPoses: Record<string, boolean>;
	readonly Update: Set<string>;
	readonly ForceUpdate: Set<string>;
	readonly Refresh: Set<string>;
	readonly Mods: Map<string, PoseMod[]>;

	constructor(Character: Character, Models: Map<string, Model>, Containers: Map<string, ContainerInfo>, ContainersDrawn: Map<string, ContainerInfo>, Poses: Record<string, boolean>) {
		this.Character = Character;
		this.Containers = Containers;
		this.ContainersDrawn = ContainersDrawn;
		this.Models = Models;
		this.Poses = Poses;
		this.TempPoses = {};
		this.HighestPriority = {};
		this.Mods = new Map();
		this.Update = new Set();
		this.ForceUpdate = new Set();
		this.Refresh = new Set();
	}

	/**
	 * Adds a model to the modelcontainer
	 */
	addModel(Model: Model, Filters?: Record<string, LayerFilter>, LockType?: string) {
		let mod: Model = JSON.parse(JSON.stringify(Model));
		if (Filters) {
			mod.Filters = JSON.parse(JSON.stringify(Filters)) || mod.Filters;
		}
		if (LockType) {
			mod.LockType = JSON.parse(JSON.stringify(LockType)) || mod.LockType;
		}
		this.Models.set(Model.Name, mod);
	}

	/** Updates a model, usually after adding all the models*/
	updateModel(Name: string) {
		let Model = this.Models.get(Name);
		if (Model?.ImportBodyFilters && this.Models.get("Body")?.Filters) {
			if (!Model.Filters) Model.Filters = {};
			Object.assign(Model.Filters, JSON.parse(JSON.stringify(this.Models.get("Body").Filters)));
		}

		// Hunts down the proper color
		if (Model?.Layers) {
			for (let l of Object.values(Model.Layers)) {
				if (l.ImportColorFromGroup) {
					let copiedFrom = [...this.Models.values()].find((model) => {
						return model.Group == l.ImportColorFromGroup[0] && model.Filters && model.Filters[l.ImportColorFromGroup[1]]
					});
					if (copiedFrom) {
						if (!Model.Filters) Model.Filters = {};
						Model.Filters[l.InheritColor || l.Name] = JSON.parse(JSON.stringify(copiedFrom.Filters[l.ImportColorFromGroup[1]]));
					}
				}
				if (l.ImportColorFromCategory) {
					let copiedFrom = [...this.Models.values()].find((model) => {
						return model.Categories.includes(l.ImportColorFromCategory[0]) && model.Filters && model.Filters[l.ImportColorFromCategory[1]]
					});
					if (copiedFrom) {
						if (!Model.Filters) Model.Filters = {};
						Model.Filters[l.InheritColor || l.Name] = JSON.parse(JSON.stringify(copiedFrom.Filters[l.ImportColorFromCategory[1]]));
					}
				}
			}
		}
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

function GetModelLayers(ModelName: string, PrependString?: string, AppendString?: string, InheritColor?: string, PriBonus?: number, layerSwap?: string, Folder?: string): ModelLayer[] {
	if (ModelDefs[ModelName]) {
		let ret : ModelLayer[] = JSON.parse(JSON.stringify(Object.values(ModelDefs[ModelName].Layers)));
		for (let layer of ret) {
			layer.Name = (PrependString || "") + layer.Name + (AppendString || "");
			if (InheritColor) layer.InheritColor = InheritColor;
			if (PriBonus) layer.Pri += PriBonus;
			if (layerSwap) layer.Layer = layerSwap;
			if (Folder) layer.Folder = Folder;
		}
		return ret;
	}
	return [];
}
function GetModelLayersNoOverride(ModelName: string, PrependString?: string, AppendString?: string, InheritColor?: string, PriBonus?: number, layerSwap?: string, Folder?: string): ModelLayer[] {
	if (ModelDefs[ModelName]) {
		let ret : ModelLayer[] = JSON.parse(JSON.stringify(Object.values(ModelDefs[ModelName].Layers)));
		for (let layer of ret) {
			layer.Name = (PrependString || "") + layer.Name + (AppendString || "");
			if (InheritColor) layer.InheritColor = InheritColor;
			if (PriBonus) layer.Pri += PriBonus;
			if (layerSwap) layer.Layer = layerSwap;
			if (Folder) layer.Folder = Folder;
			layer.NoOverride = true;
		}
		return ret;
	}
	return [];
}
function GetModelWithExtraLayers(NewModel: string, BaseModel: string, Layers: ModelLayer[], Parent?: string, TopLevel?: boolean, ExtraProps?: object): Model {
	if (ModelDefs[BaseModel]) {
		let model: Model = JSON.parse(JSON.stringify(ModelDefs[BaseModel]));
		model.Name = NewModel;
		if (Parent != undefined) model.Parent = Parent;
		if (TopLevel != undefined) model.TopLevel = TopLevel;
		for (let l of Layers) {
			model.Layers[l.Name] = JSON.parse(JSON.stringify(l));
		}
		if (ExtraProps) Object.assign(model, ExtraProps);
		return model;
	}
	return null;
}

function GetModelRestraintVersion(BaseModel: string, Parent: boolean): Model {
	if (ModelDefs[BaseModel]) {
		let model: Model = JSON.parse(JSON.stringify(ModelDefs[BaseModel]));
		model.Name = model.Name + "Restraint";
		if (Parent) {
			model.Parent = model.Parent + "Restraint";
		}
		if (!model.Categories) model.Categories = [];
		model.Categories.push("Restraints");
		model.Restraint = true;
		return model;
	}
	return null;
}

function GetModelFashionVersion(BaseModel: string, Parent: boolean): Model {
	if (ModelDefs[BaseModel]) {
		let model: Model = JSON.parse(JSON.stringify(ModelDefs[BaseModel]));
		model.Name = "Fashion" + model.Name;
		if (Parent) {
			model.Parent = "Fashion" + model.Parent;
		}
		if (!model.Categories) model.Categories = [];
		model.Categories.push("FashionRestraints");
		model.Restraint = false;
		delete model.Group;
		return model;
	}
	return null;
}
function GetOverCorset(BaseModel: string): Model {
	if (ModelDefs[BaseModel]) {
		let model: Model = JSON.parse(JSON.stringify(ModelDefs[BaseModel]));
		model.Name = model.Name + "Over";
		for (let l of Object.values(model.Layers)) {
			if (l.Layer == "Corset") l.Layer = "Cincher";
		}
		return model;
	}
	return null;
}


function DisposeCharacter(C: Character): void {
	if (KDCurrentModels.get(C)) {
		for (let Container of KDCurrentModels.get(C).Containers.values()) {
			kdcanvas.removeChild(Container.Container);
			Container.Container.destroy();
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
 * @param flip - Mods applied
 */
function DrawCharacter(C: Character, X: number, Y: number, Zoom: number, IsHeightResizeAllowed: boolean = true, DrawCanvas: any = null, Blend: any = PIXI.SCALE_MODES.LINEAR, StartMods: PoseMod[] = [], zIndex: number = 0, flip: boolean = false, extraPoses: string[] = undefined): void {
	// Update the RenderCharacterQueue
	let renderqueue = RenderCharacterQueue.get(C);
	if (renderqueue && !RenderCharacterLock.get(C)) {
		if (renderqueue.length > 0) {
			let renderf = renderqueue.splice(0, 1)[0];
			if (renderf)
				renderf();
		} else {
			RenderCharacterQueue.delete(C);
		}
	}



	let MC: ModelContainer = !KDCurrentModels.get(C) ? new ModelContainer(
		C,
		new Map(),
		new Map(),
		new Map(),
		KDGeneratePoseArray(),
	) : KDCurrentModels.get(C);

	if (MC.Models.size == 0) {
		UpdateModels(C);
	}

	let containerID = `${X},${Y},${Zoom}`;
	let refreshfilters = false;

	if (StruggleAnimation) // PROTOTYPE struggle animation
		if (MC.Containers.get(containerID)) {
			let mesh = MC.Containers.get(containerID).Mesh;
			let rt = MC.Containers.get(containerID).RenderTexture;
			let buffer = mesh.geometry.getBuffer('aVertexPosition');
			let matrix = MC.Containers.get(containerID).Matrix;

			// Assign locations
			let x = 0;
			let y = 0;
			let width = 100;
			let height = 100;
			let timt = 1000;
			for (let i = 0; i + 1 < buffer.data.length; i+= 2)
			{
				// x
				buffer.data[i] = matrix[i] + MODELWIDTH*0.005*Math.sin(Math.max(0,Math.PI*(0.6*height-y)/(0.6*height)))*(Math.sin((CommonTime() % timt)/timt * 2*Math.PI))*Zoom;
				// y
				buffer.data[i+1] = matrix[i+1] + MODELWIDTH*0.001*Math.sin(Math.PI+Math.max(0,Math.PI*(0.6*height-y)/(0.6*height))) * Math.cos((CommonTime() % timt)/timt * 4*Math.PI)*Zoom;
				if (SHOWMESHPOINTS && Zoom == 1 && x < width*.5 && y > height*.25 && y < height*.75) {
					KDDraw(kdcanvas, kdpixisprites, "buffer" + i, KinkyDungeonRootDirectory + "ShrineAura.png",
					-4+(buffer.data[i])-MODELWIDTH*MODEL_SCALE*0.25, -4+(buffer.data[i+1])-MODELHEIGHT*MODEL_SCALE*(0.25)-MODELWIDTH/10, 8, 8,
					undefined, {
						zIndex: 100,
						tint: 0x00ff00,
					});
				}

				x += 1;
				if (x >= width) {
					y += 1;
					x = 0;
				}
			}
			buffer.update();
		}

	if (MC.Containers.get(containerID) && !MC.Update.has(containerID) && MC.Refresh.has(containerID)) {
		MC.Update.delete(containerID);
		MC.Refresh.delete(containerID);
		//console.log("Refreshed!")
		// Refresh the container!
		//kdcanvas.removeChild(MC.Containers.get(containerID).Container);
		kdcanvas.removeChild(MC.Containers.get(containerID).Mesh);
		MC.Containers.get(containerID).Container.destroy();
		MC.Containers.get(containerID).Mesh.destroy();
		MC.Containers.get(containerID).RenderTexture.destroy(true);
		MC.Containers.delete(containerID);
		MC.ContainersDrawn.delete(containerID);
		refreshfilters = true;
		if (KDGlobalFilterCacheRefresh) {
			KDGlobalFilterCacheRefresh = false;
			for (let fc of KDAdjustmentFilterCache.values()) {
				for (let f of fc) {
					f.destroy();
				}
			}
			KDAdjustmentFilterCache.clear();
		}
	}
	let created = false;
	if (!MC.Containers.get(containerID)) {

		let RT = PIXI.RenderTexture.create({ width: MODELWIDTH*MODEL_SCALE * 2 * Zoom, height: MODELHEIGHT*MODEL_SCALE * 2 * Zoom, resolution: resolution*(KDToggles.HiResModel ? 2 : 1)});
		let Mesh = new PIXI.SimplePlane(RT, 100, 100);
		let Container = {
			Container: new PIXI.Container(),
			Mesh: Mesh,//Mesh(new PIXI.PlaneGeometry(MODELWIDTH*MODEL_SCALE,MODELHEIGHT*MODEL_SCALE, 100, 100), new PIXI.MeshMaterial(PIXI.Texture.WHITE)),
			SpritesDrawn: new Map(),
			RenderTexture: RT,
			SpriteList: new Map(),
			Matrix: Object.assign([], Mesh.geometry.getBuffer('aVertexPosition').data),
		};

		//Container.Container.scale.x = 1;
		//Container.Container.scale.y = 1;
		Container.Mesh.scale.x = 1;
		Container.Mesh.scale.y = 1;
		//console.log("Matrix: " + Container.Matrix);
		Container.Mesh.zIndex = 1;
		Container.Mesh.pivot.set(MODELWIDTH*MODEL_SCALE * 1 * Zoom, MODELHEIGHT*MODEL_SCALE * 1 * Zoom);
		created = true;
		MC.Containers.set(containerID, Container);
		//kdcanvas.addChild(Container.Container);
		kdcanvas.addChild(Container.Mesh);
		Container.Container.sortableChildren = true;
		//Container.Container.cacheAsBitmap = true;
		if (zIndex) Container.Container.zIndex = zIndex;
		Container.Container.filterArea = new PIXI.Rectangle(0,0,MODELWIDTH*MODEL_SCALE,MODELHEIGHT*MODEL_SCALE);
	}

	// Actual loop for drawing the models on the character

	if (!MC.Update.has(containerID)) {
		let flippedPoses = [];
		if (extraPoses) {
			for (let p of extraPoses) {
				if (!MC.Poses[p]) {
					flippedPoses.push(p);
					MC.Poses[p] = true;
				}
			}
		}
		for (let m of MC.Models.values()) {
			if (m.AddPose) {
				for (let pose of m.AddPose) {
					MC.Poses[pose] = true;
				}
			}
		}

		if (MC.XRayFilters) {
			for (let x of MC.XRayFilters) {
				MC.Poses[x] = true;
			}
		}

		for (let m of MC.Models.values()) {
			if (m.AddPoseConditional) {
				for (let entry of Object.entries(m.AddPoseConditional)) {
					if (!MC.Poses[entry[0]] && !MC.TempPoses[entry[0]]) {
						for (let pose of entry[1]) {
							MC.Poses[pose] = true;
						}
					}
				}
			}
		}
		for (let m of MC.Models.values()) {
			if (m.AddPoseIf) {
				for (let entry of Object.entries(m.AddPoseIf)) {
					if (MC.Poses[entry[0]] || MC.TempPoses[entry[0]]) {
						for (let pose of entry[1]) {
							MC.Poses[pose] = true;
						}
					}
				}
			}
		}

		if (PIXI.BaseTexture.defaultOptions.scaleMode != Blend) PIXI.BaseTexture.defaultOptions.scaleMode = Blend;
		let modified = DrawCharacterModels(MC, X + Zoom * MODEL_SCALE * MODELHEIGHT * 0.25, Y + Zoom * MODEL_SCALE * MODELHEIGHT/2, (Zoom * MODEL_SCALE) || MODEL_SCALE, StartMods,
			MC.Containers.get(containerID), refreshfilters, flip);
		let oldBlend = PIXI.BaseTexture.defaultOptions.scaleMode;
		MC.Mods.set(containerID, StartMods);
		MC.Update.add(containerID);

		let Container = MC.Containers.get(containerID);
		// Cull sprites that weren't drawn yet
		for (let sprite of Container.SpriteList.entries()) {
			if ((!Container.SpritesDrawn.has(sprite[0]) && sprite[1])) {
				sprite[1].parent.removeChild(sprite[1]);
				Container.SpriteList.delete(sprite[0]);
				modified = true;
				sprite[1].destroy();
			}
		}

		// We only refresh if it actually needs to be updated
		if (!MC.ForceUpdate.has(containerID)) modified = true; // Force refresh if we are forced to

		for (let pose of [...Object.keys(MC.Poses), ...Object.keys(MC.TempPoses)]) {
			if (PoseProperties[pose]?.flip) {
				flip = !flip;
				break;
			}
		}


		if (flip && Container.Mesh?.scale.x > 0) {
			Container.Mesh.scale.x *= -1;
			modified = true;
		}
		else if (!flip && Container.Mesh?.scale.x < 0) {
			Container.Mesh.scale.x *= -1;
			modified = true;
		}

		if (modified && !created) {
			MC.Refresh.add(containerID);
			MC.Update.delete(containerID);
		} else if (modified) {
			if (PIXI.BaseTexture.defaultOptions.scaleMode != oldBlend)
				PIXI.BaseTexture.defaultOptions.scaleMode = oldBlend;





			//Container.Container.pivot.set(-MODELWIDTH*MODEL_SCALE * Container.Container.scale.x * 0.25 * Zoom, -MODELHEIGHT*MODEL_SCALE * Container.Container.scale.y * 0.25 * Zoom);
			//Container.Mesh.x += Container.Container.pivot.x;
			//Container.Mesh.y += Container.Container.pivot.y;
			//if (MC.Containers.get(containerID).RenderTexture)
            if (MC.Containers.get(containerID).RenderTexture) {
				if (KDToggles.AsyncRendering && KinkyDungeonDrawState == "Game" && KinkyDungeonState == "Game") {
					if (!RenderCharacterQueue.get(C)) RenderCharacterQueue.set(C, []);
					RenderCharacterQueue.get(C).push(async function() {
						RenderCharacterLock.set(C, true);
						PIXIapp.renderer.render(MC.Containers.get(containerID).Container, {
							clear: true,
							renderTexture: MC.Containers.get(containerID).RenderTexture,
						});
						RenderCharacterLock.delete(C);
						MC.ForceUpdate.add(containerID);
					});
				} else {
					PIXIapp.renderer.render(MC.Containers.get(containerID).Container, {
						clear: true,
						renderTexture: MC.Containers.get(containerID).RenderTexture,
					});
					MC.ForceUpdate.add(containerID);
				}
			}
		}
		Container.SpritesDrawn.clear();

		for (let p of flippedPoses) {
			delete MC.Poses[p];
		}
	}

	// Update the updated array
	if (!MC.ContainersDrawn.get(containerID)) {
		MC.ContainersDrawn.set(containerID, MC.Containers.get(containerID));
		if (!MC.Refresh.has(containerID))
			// We only update if we are not planning to refresh next turn
			MC.Update.add(containerID);
	}

	// Store it in the map so we don't have to create it again
	if (!KDCurrentModels.get(C)) {
		KDCurrentModels.set(C, MC);
	}
}
/** Future function */
let DrawModel = DrawCharacter;

function LayerIsHidden(MC: ModelContainer, l: ModelLayer, m: Model, Mods) : boolean {
	if (l.LockLayer && !m.LockType) return true;
	if (MC.HiddenLayers && MC.HiddenLayers[LayerLayer(MC, l, m, Mods)]) return true;
	return false;
}

function LayerLayer(MC: ModelContainer, l: ModelLayer, m: Model, Mods?) : string {
	let layer = l.Layer;
	if (l.SwapLayerPose) {
		for (let p of Object.entries(l.SwapLayerPose)) {
			if (MC.Poses[p[0]]) {
				layer = p[1];
				break;
			}
		}
	}
	if (l.PrependLayerPrefix) {
		for (let p of Object.entries(l.PrependLayerPrefix)) {
			if (MC.Poses[p[0]]) return p[1] + layer;
		}
	}
	return layer;
}

function LayerPri(MC: ModelContainer, l: ModelLayer, m: Model, Mods?) : number {
	if (l.SwapPriorityPose) {
		for (let p of Object.entries(l.SwapPriorityPose)) {
			if (MC.Poses[p[0]] || MC.TempPoses[p[0]]) return p[1];
		}
	}
	let temp = l.Pri;
	if (l.AddPriWithPose) {
		for (let p of Object.entries(l.AddPriWithPose)) {
			if (MC.Poses[p[0]] || MC.TempPoses[p[0]]) temp += p[1];
		}
	}
	return temp;
}

/**
 * Setup sprites from the modelcontainer
 */
function DrawCharacterModels(MC: ModelContainer, X, Y, Zoom, StartMods, ContainerContainer, refreshfilters: boolean, flip: boolean) : boolean {
	// We create a list of models to be added
	let Models = new Map(MC.Models.entries());
	let modified = false;

	// Create the highestpriority matrix
	MC.HighestPriority = {};
	MC.HiddenLayers = {};
	for (let m of Models.values()) {
		if (m.HideLayers) {
			for (let layer of m.HideLayers) {
				MC.HiddenLayers[layer] = 1;
			}
		}
		if (m.HideLayerGroups) {
			for (let layergroup of m.HideLayerGroups) {
				if (LayerGroups[layergroup]) {
					for (let layer of Object.keys(LayerGroups[layergroup]))
						MC.HiddenLayers[layer] = 1;
				}

			}
		}
	}
	for (let m of Models.values()) {
		for (let l of Object.values(m.Layers)) {
			let pri = LayerPri(MC, l, m, StartMods);
			if (!l.DontAlwaysOverride && LayerIsHidden(MC, l, m, StartMods)) continue;
			if (!l.NoOverride) {
				let layer = LayerLayer(MC, l, m, StartMods);
				MC.HighestPriority[layer] = Math.max(MC.HighestPriority[layer] || -500, pri || -500);
			}
			if (l.CrossHideOverride) {
				if (l.HideOverrideLayerMulti) {
					for (let hideGroup of l.HideOverrideLayerMulti) {
						for (let hideLayer of Object.keys(LayerGroups[hideGroup])) {
							MC.HighestPriority[hideLayer] = Math.max(MC.HighestPriority[hideLayer] || -500, pri || -500);
						}
					}
				}
				if (l.HideOverrideLayer)
					MC.HighestPriority[l.HideOverrideLayer] = Math.max(MC.HighestPriority[l.HideOverrideLayer] || -500, pri || -500);
			}
		}
	}





	// TODO hide, filtering based on pose, etc etc
	let {X_Offset, Y_Offset} = ModelGetPoseOffsets(MC.Poses, flip);
	let {rotation, X_Anchor, Y_Anchor} = ModelGetPoseRotation(MC.Poses);
	let mods = ModelGetPoseMods(MC.Poses);
	ContainerContainer.Container.angle = rotation;
	ContainerContainer.Container.pivot.x = MODELWIDTH*Zoom * X_Anchor + MODEL_XOFFSET*Zoom;
	ContainerContainer.Container.pivot.y = MODELHEIGHT*Zoom * Y_Anchor;
	ContainerContainer.Container.x = (MODELWIDTH * (1 + X_Offset)) * Zoom + MODEL_XOFFSET*Zoom;
	ContainerContainer.Container.y = (MODELHEIGHT * (1 + Y_Offset)) * Zoom;
	ContainerContainer.Mesh.x = X;
	ContainerContainer.Mesh.y = Y;

	for (let m of StartMods) {
		if (!mods[m.Layer]) mods[m.Layer] = [];
		mods[m.Layer].push(m);
	}

	let drawLayers: Record<string, boolean> = {};

	// Yes we draw these layers
	for (let m of Models.values()) {
		for (let l of Object.values(m.Layers)) {
			if (!LayerIsHidden(MC, l, m, mods))
				drawLayers[m.Name + "," + l.Name] = ModelDrawLayer(MC, m, l, MC.Poses);
		}
	}


	// Create the layer extra filter matrix
	let ExtraFilters: Record<string, LayerFilter[]> = {};
	let DisplaceFilters: Record<string, {sprite: any, hash: string, amount: number}[]> = {};
	let DisplaceFiltersInUse = {};
	let EraseFilters: Record<string, {sprite: any, hash: string, amount: number}[]> = {};
	let EraseFiltersInUse = {};
	for (let m of Models.values()) {
		for (let l of Object.values(m.Layers)) {
			if (!(drawLayers[m.Name + "," + l.Name] && !ModelLayerHidden(drawLayers, MC, m, l, MC.Poses))) continue;
			// Apply filter
			if (l.ApplyFilterToLayerGroup) {
				for (let lg of Object.entries(l.ApplyFilterToLayerGroup)) {
					for (let ll of Object.entries(LayerGroups[lg[0]])) {
						if (!ExtraFilters[ll[0]]) ExtraFilters[ll[0]] = [];
						ExtraFilters[ll[0]].push(m.Filters[l.ApplyFilter || l.InheritColor || l.Name]);
					}
				}
			}
			// Apply displacement
			if (l.DisplaceLayers) {
				for (let ll of Object.entries(l.DisplaceLayers)) {
					let id = ModelLayerStringCustom(m, l, MC.Poses, l.DisplacementSprite, "DisplacementMaps", false, l.DisplacementInvariant, l.DisplacementMorph, l.NoAppendDisplacement);
					if (DisplaceFiltersInUse[id]) continue;
					DisplaceFiltersInUse[id] = true;
					// Generic location code
					let ox = 0;
					let oy = 0;
					let ax = 0;
					let ay = 0;
					let sx = 1;
					let sy = 1;
					let rot = 0;
					let layer = LayerLayer(MC, l, m, mods);
					while (layer) {
						let mod_selected: PoseMod[] = mods[layer] || [];
						for (let mod of mod_selected) {
							ox = mod.offset_x ? mod.offset_x : ox;
							oy = mod.offset_y ? mod.offset_y : ox;
							ax = mod.rotation_x_anchor ? mod.rotation_x_anchor : ax;
							ay = mod.rotation_y_anchor ? mod.rotation_y_anchor : ay;
							sx *= mod.scale_x || 1;
							sy *= mod.scale_y || 1;
							rot += mod.rotation || 0;
						}
						layer = LayerProperties[layer]?.Parent;
					}

					for (let dg of Object.keys(LayerGroups[ll[0]])) {
						if (!DisplaceFilters[dg]) DisplaceFilters[dg] = [];
						DisplaceFilters[dg].push(
							{
								amount: (l.DisplaceAmount || 50) * Zoom,
								hash: id + m.Name + "," + l.Name,
								sprite: KDDraw(
									ContainerContainer.Container,
									ContainerContainer.SpriteList,
									id,
									id,
									ox * MODELWIDTH * Zoom, oy * MODELHEIGHT * Zoom, undefined, undefined,
									rot * Math.PI / 180, {
										zIndex: -ModelLayers[LayerLayer(MC, l, m, mods)] + (LayerPri(MC, l, m, mods) || 0),
										anchorx: (ax - (l.OffsetX/MODELWIDTH || 0)) * (l.AnchorModX || 1),
										anchory: (ay - (l.OffsetY/MODELHEIGHT || 0)) * (l.AnchorModY || 1),
										scalex: sx != 1 ? sx : undefined,
										scaley: sy != 1 ? sy : undefined,
										alpha: 0.0,
									}, false,
									ContainerContainer.SpritesDrawn,
									Zoom
								),
							}
						);
					}

				}
			}
			// Apply erase
			if (l.EraseLayers) {
				for (let ll of Object.entries(l.EraseLayers)) {
					let id = ModelLayerStringCustom(m, l, MC.Poses, l.EraseSprite, "DisplacementMaps", false, l.EraseInvariant, l.EraseMorph, l.NoAppendErase);
					if (EraseFiltersInUse[id]) continue;
					EraseFiltersInUse[id] = true;
					// Generic location code
					let ox = 0;
					let oy = 0;
					let ax = 0;
					let ay = 0;
					let sx = 1;
					let sy = 1;
					let rot = 0;
					let layer = LayerLayer(MC, l, m, mods);
					while (layer) {
						let mod_selected: PoseMod[] = mods[layer] || [];
						for (let mod of mod_selected) {
							ox = mod.offset_x ? mod.offset_x : ox;
							oy = mod.offset_y ? mod.offset_y : ox;
							ax = mod.rotation_x_anchor ? mod.rotation_x_anchor : ax;
							ay = mod.rotation_y_anchor ? mod.rotation_y_anchor : ay;
							sx *= mod.scale_x || 1;
							sy *= mod.scale_y || 1;
							rot += mod.rotation || 0;
						}
						layer = LayerProperties[layer]?.Parent;
					}

					for (let dg of Object.keys(LayerGroups[ll[0]])) {
						if (!EraseFilters[dg]) EraseFilters[dg] = [];
						EraseFilters[dg].push(
							{
								amount: (l.EraseAmount || 50) * Zoom,
								hash: id + m.Name + "," + l.Name,
								sprite: KDDraw(
									ContainerContainer.Container,
									ContainerContainer.SpriteList,
									id,
									id,
									ox * MODELWIDTH * Zoom, oy * MODELHEIGHT * Zoom, undefined, undefined,
									rot * Math.PI / 180, {
										zIndex: -ModelLayers[LayerLayer(MC, l, m, mods)] + (LayerPri(MC, l, m, mods) || 0),
										anchorx: (ax - (l.OffsetX/MODELWIDTH || 0)) * (l.AnchorModX || 1),
										anchory: (ay - (l.OffsetY/MODELHEIGHT || 0)) * (l.AnchorModY || 1),
										scalex: sx != 1 ? sx : undefined,
										scaley: sy != 1 ? sy : undefined,
										alpha: 0.0,
									}, false,
									ContainerContainer.SpritesDrawn,
									Zoom
								),
							}
						);
					}

				}
			}
		}
	}

	// Add Xray filters now
	if (MC.XRayFilters) {
		let EraseAmount = 50;
		for (let x of MC.XRayFilters) {
			if (LayerGroups[x]) {
				for (let dg of Object.keys(LayerGroups[x])) {
					if (!EraseFilters[dg]) EraseFilters[dg] = [];
					EraseFilters[dg].push(
						{
							amount: EraseAmount,
							hash: x,
							sprite: KDDraw(
								ContainerContainer.Container,
								ContainerContainer.SpriteList,
								"xrayfilter_" + x,
								"DisplacementMaps/" + x + ".png",
								0, 0, undefined, undefined,
								0, {
									zIndex: 1000000,
									alpha: 0.0,
								}, false,
								ContainerContainer.SpritesDrawn,
								Zoom
							),
						}
					);
				}
			}
		}
	}



	// Now that we have the final list of models we do a KDDraw
	for (let m of Models.values()) {
		for (let l of Object.values(m.Layers)) {
			if (drawLayers[m.Name + "," + l.Name] && !ModelLayerHidden(drawLayers, MC, m, l, MC.Poses)) {

				// Generic location code TODO wrap into a function
				let ox = 0;
				let oy = 0;
				let ax = 0;
				let ay = 0;
				let sx = 1;
				let sy = 1;
				let rot = 0;
				let layer = LayerLayer(MC, l, m, mods);
				let origlayer = layer;
				while (layer) {
					let mod_selected: PoseMod[] = mods[layer] || [];
					for (let mod of mod_selected) {
						ox = mod.offset_x ? mod.offset_x : ox;
						oy = mod.offset_y ? mod.offset_y : ox;
						ax = mod.rotation_x_anchor ? mod.rotation_x_anchor : ax;
						ay = mod.rotation_y_anchor ? mod.rotation_y_anchor : ay;
						sx *= mod.scale_x || 1;
						sy *= mod.scale_y || 1;
						rot += mod.rotation || 0;
					}
					layer = LayerProperties[layer]?.Parent;
				}

				let fh = m.Filters ? (m.Filters[l.InheritColor || l.Name] ? FilterHash(m.Filters[l.InheritColor || l.Name]) : "") : "";
				/*if (refreshfilters) {
					if (KDAdjustmentFilterCache.get(fh)) {
						for (let f of KDAdjustmentFilterCache.get(fh)) {
							f.destroy();
						}
					}
					KDAdjustmentFilterCache.delete(fh);
				}*/
				let filter = m.Filters ? (m.Filters[l.InheritColor || l.Name] ?
					(KDAdjustmentFilterCache.get(fh) || [new PIXI.filters.AdjustmentFilter(m.Filters[l.InheritColor || l.Name])])
					: undefined) : undefined;
				if (filter && !KDAdjustmentFilterCache.get(fh)) {
					KDAdjustmentFilterCache.set(FilterHash(m.Filters[l.InheritColor || l.Name]), filter);
				}

				let extrafilter: PIXIFilter[] = [];
				// Add extrafilters
				if (ExtraFilters[origlayer]) {
					for (let ef of ExtraFilters[origlayer]) {
						let efh = FilterHash(ef)
						if (refreshfilters) {
							KDAdjustmentFilterCache.delete(FilterHash(ef));
						}
						let efilter = (KDAdjustmentFilterCache.get(efh) || [new PIXI.filters.AdjustmentFilter(ef)]);
						if (efilter && !KDAdjustmentFilterCache.get(efh)) {
							KDAdjustmentFilterCache.set(FilterHash(ef), efilter);
						}
						extrafilter.push(...efilter);
					}
				}
				// Add erase filters BEFORE displacement
				if (!l.NoErase && EraseFilters[origlayer]) {
					for (let ef of EraseFilters[origlayer]) {
						let efh = "disp_" + ef.hash;
						let dsprite = ef.sprite;
						if (refreshfilters) {
							KDAdjustmentFilterCache.delete(efh);
						}
						KDTex(dsprite.name, false); // try to preload it
						let efilter = (KDAdjustmentFilterCache.get(efh) || [new EraseFilter(
							dsprite,
						)]);
						if (efilter && !KDAdjustmentFilterCache.get(efh)) {
							KDAdjustmentFilterCache.set(efh, efilter);
						}
						extrafilter.push(...efilter);
					}
				}
				// Add displacement filters
				if (!l.NoDisplace && DisplaceFilters[origlayer]) {
					for (let ef of DisplaceFilters[origlayer]) {
						let efh = "disp_" + ef.hash;
						let dsprite = ef.sprite;
						if (refreshfilters) {
							KDAdjustmentFilterCache.delete(efh);
						}
						KDTex(dsprite.name, false); // try to preload it
						let efilter = (KDAdjustmentFilterCache.get(efh) || [new PIXI.DisplacementFilter(
							dsprite,
							ef.amount,
						)]);
						if (efilter && !KDAdjustmentFilterCache.get(efh)) {
							KDAdjustmentFilterCache.set(efh, efilter);
						}
						extrafilter.push(...efilter);
					}
				}

				let img = ModelLayerString(m, l, MC.Poses);
				let id = `layer_${m.Name}_${l.Name}_${img}_${fh}_${Math.round(ax*10000)}_${Math.round(ay*10000)}_${Math.round(rot*1000)}_${Math.round(sx*1000)}_${Math.round(sy*1000)}`;
				if (!modified && !ContainerContainer.SpriteList.has(id)) modified = true;
				let filters = filter;
				if (extrafilter) filters = [...(filter || []), ...extrafilter];
				KDDraw(
					ContainerContainer.Container,
					ContainerContainer.SpriteList,
					id,
					img,
					ox * MODELWIDTH * Zoom, oy * MODELHEIGHT * Zoom, undefined, undefined,
					rot * Math.PI / 180, {
						zIndex: -ModelLayers[origlayer] + (LayerPri(MC, l, m, mods) || 0),
						anchorx: (ax - (l.OffsetX/MODELWIDTH || 0)) * (l.AnchorModX || 1),
						anchory: (ay - (l.OffsetY/MODELHEIGHT || 0)) * (l.AnchorModY || 1),
						normalizeAnchorX: MODELWIDTH,
						normalizeAnchorY: MODELHEIGHT,
						scalex: sx != 1 ? sx : undefined,
						scaley: sy != 1 ? sy : undefined,
						filters: filters,
					}, false,
					ContainerContainer.SpritesDrawn,
					Zoom
				);
			}
		}
	}
	return modified;
}

function FilterHash(filter) {
	if (!filter) return "";
	let str = "";
	for (let f of Object.values(filter)) str = str + "_" + Math.round((f as number) * 1000);
	return str;
}

const KDAdjustmentFilterCache: Map<string, PIXIFilter[]> = new Map();

/**
 * Determines if we should draw this layer or not
 * @param {ModelContainer} MC
 * @param {Model} Model
 * @param {ModelLayer} Layer
 * @param {Record<string, boolean>} Poses
 * @returns {boolean}
 */
function ModelDrawLayer(MC: ModelContainer, Model: Model, Layer: ModelLayer, Poses: Record<string, boolean>): boolean {
	// Hide if not highest
	if (Layer.HideWhenOverridden) {
		if (Layer.HideOverrideLayerMulti && !Layer.ForceSingleOverride) {
			for (let hideGroup of Layer.HideOverrideLayerMulti) {
				for (let LL of Object.keys(LayerGroups[hideGroup])) {
					let priTest = MC.HighestPriority[LL];
					if (priTest > LayerPri(MC, Layer, Model)) return false;
				}
			}
		} else {
			let priTest = MC.HighestPriority[Layer.HideOverrideLayer || LayerLayer(MC, Layer, Model)];
			if (priTest > LayerPri(MC, Layer, Model)) return false;
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
	if (Layer.HidePrefixPose) {
		for (let p of Layer.HidePrefixPose) {
			if (Poses[p + LayerPri(MC, Layer, Model)]) {
				return false;
			}
			if (Layer.HidePrefixPoseSuffix) {
				for (let suff of Layer.HidePrefixPoseSuffix) {
					if (Poses[p + suff]) {
						return false;
					}
				}
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
	// Required poses
	if (Layer.RequirePoses) {
		for (let p of Object.keys(Layer.RequirePoses)) {
			if (!Poses[p]) {
				return false;
			}
		}
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
		if (!drawLayers[Model.Name + "," + Layer.TieToLayer]) return true;
	}
	return false;
}

function ModelLayerString(Model: Model, Layer: ModelLayer, Poses: {[_: string]: boolean}): string {
	return `Models/${Layer.Folder || Model.Folder}/${LayerSprite(Layer, Poses)}.png`;
}
function ModelLayerStringCustom(Model: Model, Layer: ModelLayer, Poses: {[_: string]: boolean}, Sprite: string, Path: string = "Models", useModelFolder: boolean = true, forceInvariant: boolean = false, forceMorph?: Record<string, string>, noAppend: boolean = false): string {
	if (useModelFolder)
		return `${Path}/${Layer.Folder || Model.Folder}/${LayerSpriteCustom(Layer, Poses, Sprite, forceInvariant, forceMorph, noAppend)}.png`;
	else
		return `${Path}/${LayerSpriteCustom(Layer, Poses, Sprite, forceInvariant, forceMorph, noAppend)}.png`;
}



/**
 * Gets the sprite name for a layer for a given pose
 */
function LayerSprite(Layer: ModelLayer, Poses: {[_: string]: boolean}): string {
	return LayerSpriteCustom(Layer, Poses, (Layer.Sprite != undefined ? Layer.Sprite : Layer.Name));
}

/**
* Gets a sprite formatted for the restraint or object
*/
function LayerSpriteCustom(Layer: ModelLayer, Poses: {[_: string]: boolean}, Sprite: string, forceInvariant: boolean = false, forceMorph?: Record<string, string>, noAppend: boolean = false): string {
	let pose = "";

	let foundPose = false;
	let MorphPoses = forceMorph || Layer.MorphPoses;
	if (forceInvariant && !forceMorph) MorphPoses = undefined;

	// change the pose if its a morph pose, this helps to avoid duplication
	let cancel = false;
	if (MorphPoses) {
		for (let dp of Object.entries(MorphPoses)) {
			if (Poses[dp[0]] != undefined) {
				pose = dp[1];
				cancel = true;
				foundPose = true;
				break;
			}
		}
	}

	if (!Layer.Invariant && !forceInvariant) {
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

	if (Layer.AppendPose && !forceInvariant && !noAppend) {
		for (let p of Object.entries(Layer.AppendPose)) {
			if (Poses[p[0]] != undefined && (!Layer.AppendPoseRequire || Layer.AppendPoseRequire[p[0]])) {
				pose = pose + (p[1]);
				break;
			}
		}
	}

	return Sprite + pose;
}

function GetTrimmedAppearance(C: Character) {
	let MC: ModelContainer = KDCurrentModels.get(C);
	if (!MC) return;
	let appearance: Item[] = MC.Character.Appearance;
	let appearance_new: Item[] = MC.Character.Appearance;
	let poses = {};
	for (let A of appearance) {
		if (A.Model && A.Model.AddPose) {
			for (let pose of A.Model.AddPose) {
				poses[pose] = true;
			}
		}
	}
	for (let A of appearance) {
		if (A.Model && A.Model.AddPoseConditional) {
			for (let entry of Object.entries(A.Model.AddPoseConditional)) {
				if (!poses[entry[0]]) {
					for (let pose of entry[1]) {
						poses[pose] = true;
					}
				}
			}
		}
	}
	for (let A of appearance) {
		if (A.Model && A.Model.AddPoseIf) {
			for (let entry of Object.entries(A.Model.AddPoseIf)) {
				if (poses[entry[0]]) {
					for (let pose of entry[1]) {
						poses[pose] = true;
					}
				}
			}
		}
	}


	for (let A of appearance) {
		if (A.Model && !A.Model.RemovePoses?.some((removePose) => {return poses[removePose];})) {
			appearance_new.push(A);
		} else {
			console.log("lost " + A.Model.Name);
		}
	}
	return appearance_new;
}


function IsModelLost(C: Character, Name: string) : boolean {
	let MC: ModelContainer = KDCurrentModels.get(C);
	if (!MC) return false;

	let poses = MC.Poses;
	let Model = MC.Models.get(Name);
	if (Model) {
		return Model.RemovePoses && Model.RemovePoses.some((removePose) => {return poses[removePose]});
	}
	return false;
}


function UpdateModels(C: Character, Xray?: string[]) {
	let MC: ModelContainer = KDCurrentModels.get(C);
	if (!MC) return;
	MC.Models = new Map();
	MC.Update.clear();
	let poses = {};
	if (Xray) {
		for (let p of Object.keys(MC.Poses)) {
			if (p.indexOf("Xray") > -1) {
				delete MC.Poses[p];
			}
		}
		MC.XRayFilters = Xray;
		for (let x of Xray) {
			poses[x] = true;
		}
	}

	let appearance: Item[] = MC.Character.Appearance;
	for (let A of appearance) {
		if (A.Model && A.Model.AddPose) {
			for (let pose of A.Model.AddPose) {
				poses[pose] = true;
			}
		}
	}
	for (let A of appearance) {
		if (A.Model && A.Model.AddPoseConditional) {
			for (let entry of Object.entries(A.Model.AddPoseConditional)) {
				if (!poses[entry[0]]) {
					for (let pose of entry[1]) {
						poses[pose] = true;
					}
				}
			}
		}
	}

	for (let A of appearance) {
		if (A.Model && A.Model.AddPoseIf) {
			for (let entry of Object.entries(A.Model.AddPoseIf)) {
				if (poses[entry[0]]) {
					for (let pose of entry[1]) {
						poses[pose] = true;
					}
				}
			}
		}
	}
	for (let A of appearance) {
		if (A.Model && !A.Model.RemovePoses?.some((removePose) => {return poses[removePose];})) {
			MC.addModel(A.Model, A.Filters, A.Property?.LockedBy);
		}
	}

	// Update models after adding all of them
	for (let A of appearance) {
		if (A.Model && !A.Model.RemovePoses?.some((removePose) => {return poses[removePose];})) {
			MC.updateModel(A.Model.Name);
		}
	}


	for (let m of MC.Models.values()) {
		if (m.AddPose) {
			for (let pose of m.AddPose) {
				MC.Poses[pose] = true;
			}
		}
	}

	KDRefreshPoseOptionsMC(MC);
}


function ForceRefreshModels(C: Character) {
	let MC: ModelContainer = KDCurrentModels.get(C);
	if (!MC) return;
	MC.Update.clear();
	MC.ForceUpdate.clear();
}
async function ForceRefreshModelsAsync(C: Character, ms = 100) {
	await sleep(ms);
	let MC: ModelContainer = KDCurrentModels.get(C);
	if (!MC) return;
	MC.Update.clear();
	MC.ForceUpdate.clear();
}

/**
 * Returns a list of colorable layer names
 */
function KDGetColorableLayers(Model: Model): string[] {
	let ret = [];
	for (let layer of Object.values(Model.Layers)) {
		if (!layer.NoColorize && !layer.InheritColor) {
			ret.push(layer.Name);
		} else if (layer.InheritColor && !ret.includes(layer.InheritColor)) {
			ret.push(layer.InheritColor);
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

function GetUnnamedModels() {
	let keys: Record<string, string> = {};
	for (let m of Object.values(ModelDefs)) {
		keys[`m_${m.Name}`] = m.Name;
		for (let l of Object.values(m.Layers)) {
			if (!l.InheritColor && !l.NoColorize)
				keys[`l_${m.Name}_${l.Name}`] = l.Name;
		}
	}
	let st = "";
	for (let s of Object.keys(keys)) {
		if (TextGet(s) != s) // Failure condition
		{ delete keys[s]; }
		else st = st + "\n" + s + ",\"" + keys[s] + "\"";
	}
	console.log(st);
	console.log(keys);
}

function GetHardpointLoc(C: Character, X: number, Y: number, ZoomInit: number = 1, Hardpoint: string, Flip: boolean) {
	let Zoom = (ZoomInit * MODEL_SCALE) || MODEL_SCALE
	let hp = Hardpoints[Hardpoint];
	let pos = {x: hp?.X*Zoom || 0, y: hp?.Y*Zoom || 0, angle: hp.Angle};

	let MC = KDCurrentModels.get(C);
	let StartMods = MC.Mods.get(`${X},${Y},${ZoomInit}`);
	let mods = ModelGetPoseMods(MC.Poses);

	for (let m of StartMods) {
		if (!mods[m.Layer]) mods[m.Layer] = [];
		mods[m.Layer].push(m);
	}
	if (!mods) return pos;

	let ox = 0;
	let oy = 0;
	let ax = 0;
	let ay = 0;
	let sx = 1;
	let sy = 1;
	let rot = 0;
	let layer = hp.Parent;
	while (layer) {
		let mod_selected: PoseMod[] = mods[layer] || [];
		for (let mod of mod_selected) {
			ox = mod.offset_x ? mod.offset_x : ox;
			oy = mod.offset_y ? mod.offset_y : ox;
			ax = mod.rotation_x_anchor ? mod.rotation_x_anchor : ax;
			ay = mod.rotation_y_anchor ? mod.rotation_y_anchor : ay;
			sx *= mod.scale_x || 1;
			sy *= mod.scale_y || 1;
			rot += mod.rotation || 0;
		}
		layer = LayerProperties[layer]?.Parent;
	}

	pos.x += ox * MODELWIDTH * Zoom;
	pos.y += oy * MODELHEIGHT * Zoom;
	pos.angle += rot * Math.PI / 180;
    pos.x -= (ax - (hp.OffsetX / MODELWIDTH || 0)) * Math.cos(rot * Math.PI / 180);
    pos.y += (ax - (hp.OffsetX / MODELWIDTH || 0)) * Math.sin(rot * Math.PI / 180);
    pos.x -= (ay - (hp.OffsetY / MODELHEIGHT || 0)) * Math.sin(rot * Math.PI / 180);
    pos.y -= (ay - (hp.OffsetY / MODELHEIGHT || 0)) * Math.cos(rot * Math.PI / 180);
    let { X_Offset, Y_Offset } = ModelGetPoseOffsets(MC.Poses, Flip);
    let { rotation, X_Anchor, Y_Anchor } = ModelGetPoseRotation(MC.Poses);
    let pivotx = MODELHEIGHT*0.5 * Zoom * X_Anchor;
    let pivoty = MODELHEIGHT * Zoom * Y_Anchor;
    let lx = pos.x - pivotx;
    let ly = pos.y - pivoty;
    let angle = rotation * Math.PI / 180;
    pos.x = pivotx + (lx) * Math.cos(angle) - (ly) * Math.sin(angle);
    pos.y = pivoty + (ly) * Math.cos(angle) + (lx) * Math.sin(angle);

    let xx = (MODELWIDTH * X_Offset) * Zoom + MODEL_XOFFSET*Zoom;
    let yy = (MODELHEIGHT * Y_Offset) * Zoom;

	pos.x += xx;
	pos.y += yy;

	if (Flip) pos.x = (0.5 * MODELHEIGHT) * Zoom - pos.x;
	return pos;
}