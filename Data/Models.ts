let SHOWMESHPOINTS = false;
let StruggleAnimation = true;

let RenderCharacterQueue = new Map();
let RenderCharacterLock = new Map();

let KDFilterCacheToDestroy: PIXIFilter[] = [];
let KDFilterDrawn: Map<PIXIFilter, boolean> = new Map();
let KDRenderTexToDestroy: PIXITexture[] = [];
let KDMeshToDestroy: PIXIMesh[] = [];
let KDSpritesToCull: PIXISprite[] = [];

let KDCulling = true;


let KDSubmeshEditor = false;
let KDSubmeshChosen = "PantLeft";

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
/**
 * Returns a table with the priorities for each layer based on order of the array
 */
function InitLayersLookup(ModelLayers: {[_: string]: number}): Map<number, string> {
	let mappa: Map<number, string> = new Map;
	for (let layer in ModelLayers) {
		let pri = Math.floor((ModelLayers[layer] || 0)/LAYER_INCREMENT);
		mappa.set(pri, layer)
	}
	return mappa;
}



/**
 * returns a meta layer for each non meta layer
 */
function InitMetaLayers(bounds: metaLayerBound[]):
	{forward: Record<string, string[]>, reverse: Record<string, string>, order: Record<string, number>} {
	let forward: Record<string, string[]> = {};
	let reverse: Record<string, string> = {};
	let order: Record<string, number> = {};

	let currentIndex = 0;
	let layerCount = 0;
	let currentLayer = LAYERS_BASE[currentIndex];
	for (let meta of bounds) {
		let layers: string[] = [];
		// Skip ahead if needed
		while (LAYERS_BASE[currentIndex] != meta.start) {
			if (!reverse[LAYERS_BASE[currentIndex]]) {
				// Create a singleton if needed
				order[LAYERS_BASE[currentIndex]] = layerCount;
				forward[LAYERS_BASE[currentIndex]] = [LAYERS_BASE[currentIndex]];
				reverse[LAYERS_BASE[currentIndex]] = LAYERS_BASE[currentIndex];
				layerCount++;
			}
			currentIndex++;
		}
		// Do the register
		while (LAYERS_BASE[currentIndex]) {
			currentLayer = LAYERS_BASE[currentIndex];
			layers.push(currentLayer);
			reverse[currentLayer] = meta.id;
			if (currentLayer == meta.end || LAYERS_BASE[currentIndex + 1] == meta.end) {
				break;
			}
			currentIndex++;
		}
		forward[meta.id] = layers;
		order[meta.id] = layerCount;
		layerCount++;
	}
	return {forward: forward, reverse: reverse, order: order};
}

let ModelLayers = InitLayers(LAYERS_BASE);
let ModelLayersLookup: Map<number, string> = InitLayersLookup(ModelLayers);

let metaLayersData = InitMetaLayers(metaLayerBoundaries);
let metaLayerForward = metaLayersData.forward;
let metaLayerReverse = metaLayersData.reverse;
let metaLayerOrder = metaLayersData.order;


let ModelDefs: {[_: string]: Model} = {};

function AddModel(Model: Model, Strings?: Record<string, string>) {
	ModelDefs[Model.Name] = Model;
	if (Strings) {
		for (let str of Object.entries(Strings)) {
			addTextKey("m_" + str[0], str[1]);
		}
	}
}

let KDCurrentModels: Map<Character, ModelContainer> = new Map();

interface Submesh {
	mesh: PIXIMesh,
	rt: PIXIRenderTexture,
	container: PIXIContainer,
	matrix: PIXIArray,
	hash: number,
	lhash: number,
}

interface ContainerInfo {
	readonly SpriteList: Map<string, any>;
	readonly SpritesDrawn: Map<string, any>;
	readonly Container: PIXIContainer;
	readonly SpriteGroups: Map<string, PIXIContainer>;
	readonly Submeshes: Map<string, Submesh>;
	readonly Mesh: PIXIMesh;
	readonly RenderTexture: PIXIRenderTexture;
	readonly Matrix: PIXIArray;
	Zoom: number;
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
	readonly EndMods: Map<string, PoseMod[]>;


	constructor(Character: Character, Models: Map<string, Model>, Containers: Map<string, ContainerInfo>, ContainersDrawn: Map<string, ContainerInfo>, Poses: Record<string, boolean>) {
		this.Character = Character;
		this.Containers = Containers;
		this.ContainersDrawn = ContainersDrawn;
		this.Models = Models;
		this.Poses = Poses;
		this.TempPoses = {};
		this.HighestPriority = {};
		this.Mods = new Map();
		this.EndMods = new Map();
		this.Update = new Set();
		this.ForceUpdate = new Set();
		this.Refresh = new Set();
	}

	/**
	 * Adds a model to the modelcontainer
	 */
	addModel(Model: Model, Filters?: Record<string, LayerFilter>, LockType?: string, Properties?: Record<string, LayerPropertiesType>, factionFilters?: Record<string, FactionFilterDef>) {
		let mod: Model = JSON.parse(JSON.stringify(Model));
		if (Filters) {
			mod.Filters = JSON.parse(JSON.stringify(Filters)) || mod.Filters;
		}
		if (Properties) {
			mod.Properties = JSON.parse(JSON.stringify(Properties)) || mod.Properties;
		}
		if (factionFilters) {
			mod.factionFilters = JSON.parse(JSON.stringify(factionFilters)) || mod.factionFilters;
		}
		if (LockType) {
			mod.LockType = JSON.parse(JSON.stringify(LockType)) || mod.LockType;
		}
		
		this.Models.set(Model.Name, mod);
	}

	/** Updates a model, usually after adding all the models*/
	updateModel(Name: string) {
		let Model = this.Models.get(Name);
		if (Model?.ImportBodyFilters) {
			let body = this.Models.get("Body");
			if (!body) {
				// iterate, slower but ah well
				for (let model of this.Models.values()) {
					if (model.Group == "Body") {
						body = model;
						break;
					}
				}
			}
			if (body?.Filters) {
				if (!Model.Filters) Model.Filters = {};
				let Filters = body.Filters;
				Object.assign(Model.Filters, JSON.parse(JSON.stringify(Filters)));
			}
		}

		// Hunts down the proper color
		if (Model?.Layers) {
			for (let l of Object.values(Model.Layers)) {
				if (l.ImportColorFromGroup && !(Model.Filters && Model.Filters[l.Name])) {
					let copiedFrom = [...this.Models.values()].find((model) => {
						return model.Group == l.ImportColorFromGroup[0] && model.Filters && model.Filters[l.ImportColorFromGroup[1]]
					});
					if (copiedFrom) {
						if (!Model.Filters) Model.Filters = {};
						Model.Filters[l.InheritColor || l.Name] = JSON.parse(JSON.stringify(copiedFrom.Filters[l.ImportColorFromGroup[1]]));
					}
				}
				if (l.ImportColorFromCategory && !(Model.Filters && Model.Filters[l.Name])) {
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

function GetModelLayers(ModelName: string, PrependString?: string, AppendString?: string, InheritColor?: string, PriBonus?: number, layerSwap?: string, Folder?: string, noTieToLayer: boolean = false): ModelLayer[] {
	if (ModelDefs[ModelName]) {
		let ret : ModelLayer[] = JSON.parse(JSON.stringify(Object.values(ModelDefs[ModelName].Layers)));
		for (let layer of ret) {
			layer.Name = (PrependString || "") + layer.Name + (AppendString || "");
			if (InheritColor) layer.InheritColor = InheritColor;
			if (PriBonus) {
				layer.Pri += PriBonus;
				if (!noTieToLayer && !layerSwap && (PrependString || AppendString)) {
					layer.NoOverride = true;
					layer.TieToLayer = layer.Name;
					delete layer.HideWhenOverridden;
				}
			}
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
function GetModelWithDifferentLayers(NewModel: string, BaseModel: string, Layers: ModelLayer[], Parent?: string, TopLevel?: boolean, ExtraProps?: object): Model {
	if (ModelDefs[BaseModel]) {
		let model: Model = JSON.parse(JSON.stringify(ModelDefs[BaseModel]));
		model.Name = NewModel;
		if (Parent != undefined) model.Parent = Parent;
		if (TopLevel != undefined) model.TopLevel = TopLevel;
		model.Layers = {};
		for (let l of Layers) {
			model.Layers[l.Name] = JSON.parse(JSON.stringify(l));
		}
		if (ExtraProps) Object.assign(model, ExtraProps);
		return model;
	}
	return null;
}

function GetModelRestraintVersion(BaseModel: string, Parent: boolean,
	extraAddPoses?: string[],
	removeRemovePoses?: string[]): Model {
	if (ModelDefs[BaseModel]) {
		let model: Model = JSON.parse(JSON.stringify(ModelDefs[BaseModel]));
		model.Name = model.Name + "Restraint";
		if (Parent) {
			model.Parent = model.Parent + "Restraint";
		}
		if (!model.Categories) model.Categories = [];
		model.Categories.push("Restraints");
		model.Restraint = true;
		if (extraAddPoses) {
			// This bit of javascript gives me a headache
			model.AddPose = [...(model.AddPose || []), ...extraAddPoses];
		}
		if (removeRemovePoses) {
			if (model.RemovePoses) {
				model.RemovePoses = model.RemovePoses.filter((rp) => {return !removeRemovePoses.includes(rp);})
			}
		}
		return model;
	}
	return null;
}

/**
 * 
 * @param BaseModel 
 * @param Parent Add "Fashion" to the parent model prefix
 * @param removeOptionSwap 
 * @returns 
 */
function GetModelFashionVersion(BaseModel: string, Parent: boolean, removeOptionSwap: boolean = true): Model {
	if (ModelDefs[BaseModel]) {
		let model: Model = JSON.parse(JSON.stringify(ModelDefs[BaseModel]));
		model.Name = "Fashion" + model.Name;
		if (Parent) {
			model.Parent = "Fashion" + model.Parent;
		}
		if (!model.Categories) model.Categories = [];
		model.Categories.push("FashionRestraints");
		model.Restraint = false;
		if (removeOptionSwap)
			for (let layer of Object.values(model.Layers)) {
				if (layer.PrependLayerPrefix) {
					for (let plp of Object.entries(layer.PrependLayerPrefix)) {
						if (plp[1] == "Option_") delete layer.PrependLayerPrefix[plp[0]];
						if (plp[1] == "Option2_") delete layer.PrependLayerPrefix[plp[0]];
					}
				}
			}
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


function DisposeCharacter(C: Character, resort: boolean = true, deleteSpecial: boolean = false): void {
	if (KDCurrentModels.get(C)) {
		for (let Container of KDCurrentModels.get(C).Containers.values()) {
			Container.Container.parent.removeChild(Container.Container);
			Container.Container.destroy();
		}
	}
	if (NPCTags.get(C)) {
		NPCTags.delete(C);
	}
	if (KDNPCChar_ID.get(C)) {
		let id = KDNPCChar_ID.get(C);
		KDNPCChar.delete(id);
		if (deleteSpecial || !KDPersistentNPCs[id + ""] || !KDPersistentNPCs[id + ""].special) {
			if (KDPersistentNPCs[id + ""]?.Name && KDGameData.NamesGenerated[KDPersistentNPCs[id + ""].Name] == id)
				delete KDGameData.NamesGenerated[KDPersistentNPCs[id + ""].Name]
			delete KDPersistentNPCs[id + ""];
			delete KDGameData.NPCRestraints[id + ""];
			KDDeletedIDs[id + ""] = 1;
		}
		delete KDGameData.Collection[id + ""];
		if (resort) {
			KDSortCollection();
		}
		KDNPCChar_ID.delete(C);
	}
	if (KDNPCPoses.get(C)) {
		KDNPCPoses.delete(C);
	}
	if (NPCDesiredPoses.get(C)) {
		NPCDesiredPoses.delete(C);
	}
}
function DisposeEntity(id: number, resort: boolean = true, deleteSpecial = false, deletePersistent = true): void {
	let C = KDNPCChar.get(id);
	if (C && KDCurrentModels.get(C)) {
		for (let Container of KDCurrentModels.get(C).Containers.values()) {
			if (Container.Container.parent)
				Container.Container.parent.removeChild(Container.Container);
			Container.Container.destroy();
		}
	}
	if (C && NPCTags.get(C)) {
		NPCTags.delete(C);
	}
	if (KDGameData.selectedLabel && KDGameData.selectedLabel[id]) delete KDGameData.selectedLabel[id];
	KDNPCChar.delete(id);
	if (deleteSpecial || !KDPersistentNPCs[id + ""] || !KDPersistentNPCs[id + ""].special) {
		KDPurgeParty(id);
		if (KDPersistentNPCs[id + ""]?.Name && KDGameData.NamesGenerated[KDPersistentNPCs[id + ""].Name] == id)
			delete KDGameData.NamesGenerated[KDPersistentNPCs[id + ""].Name]
		delete KDPersistentNPCs[id + ""];
		delete KDGameData.NPCRestraints[id + ""];
		KDDeletedIDs[id + ""] = 1;
	}
	delete KDGameData.Collection[id + ""];
	if (resort) {
		KDSortCollection();
	}
	if (C && KDNPCChar_ID.get(C)) {
		KDNPCChar_ID.delete(C);
	}
	if (C && KDNPCPoses.get(C)) {
		KDNPCPoses.delete(C);
	}
	if (C && NPCDesiredPoses.get(C)) {
		NPCDesiredPoses.delete(C);
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
 * @param EndMods - Mods applied at end
 * @param flip - Mods applied
 */
function DrawCharacter(C: Character, X: number, Y: number, Zoom: number,
	IsHeightResizeAllowed: boolean = true, DrawCanvas: PIXIContainer = null,
	Blend: any = PIXI.SCALE_MODES.LINEAR,
	StartMods: PoseMod[] = [], zIndex: number = 0, flip: boolean = false,
	extraPoses: string[] = undefined, containerID?: string,
	EndMods: PoseMod[] = []): PIXIMesh {
	if (!DrawCanvas) DrawCanvas = kdcanvas;

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

	if (!containerID)
		containerID = `${Math.round(X)},${Math.round(Y)},${Zoom}`;
	let refreshfilters = false;

	

	let OldSubmeshes = null;
	if (MC.Containers.get(containerID) && !MC.Update.has(containerID) && MC.Refresh.has(containerID)) {

		let data = {
			Character: Character,
			containerID: containerID,
			ContainerInfo: MC.Containers.get(containerID),
			zIndex: zIndex,
			x: X,
			y: Y,
			Blend: Blend,
			StartMods: StartMods,
			EndMods: EndMods,
		};
		KinkyDungeonSendEvent("beforeMeshDestroy", data);
		OldSubmeshes = data.ContainerInfo.Submeshes;
		for (let submesh of OldSubmeshes.values()) {
			KDMeshToDestroy.push(submesh.mesh);
		}
		MC.Update.delete(containerID);
		MC.Refresh.delete(containerID);
		//console.log("Refreshed!")
		// Refresh the container!
		DrawCanvas.removeChild(MC.Containers.get(containerID).Mesh);
		MC.Containers.get(containerID).Container.destroy();
		//MC.Containers.get(containerID).Mesh.destroy();
		KDMeshToDestroy.push(MC.Containers.get(containerID).Mesh);
		KDRenderTexToDestroy.push(MC.Containers.get(containerID).RenderTexture);
		/*for (let submesh of MC.Containers.get(containerID).Submeshes.values()) {
			KDMeshToDestroy.push(submesh.mesh);
			KDRenderTexToDestroy.push(submesh.rt);
		}*/
		MC.Containers.delete(containerID);
		MC.ContainersDrawn.delete(containerID);
		
		refreshfilters = true;
		if (KDGlobalFilterCacheRefresh) {
			KDGlobalFilterCacheRefresh = false;
			for (let fce of KDAdjustmentFilterCache.entries()) {
				let fc = fce[1];
				for (let f of fc) {
					if (!KDFilterDrawn.get(f)) {
						KDFilterCacheToDestroy.push(f);
						fc.splice(fc.indexOf(f), 1);
					}
				}
				if (fc.length == 0) KDAdjustmentFilterCache.delete(fce[0]);
			}
			KDFilterDrawn = new Map();
		}

	}
	let created = false;
	if (!MC.Containers.get(containerID)) {

		let RT = PIXI.RenderTexture.create({ width: MODELWIDTH*MODEL_SCALE * 2 * Zoom, height: MODELHEIGHT*MODEL_SCALE * 2 * Zoom, resolution: resolution});
		let Mesh = new PIXI.SimplePlane(RT, 10, 10);
		Mesh.sortableChildren = true;
		let Container: ContainerInfo = {
			Container: new PIXI.Container(),
			Mesh: Mesh,//Mesh(new PIXI.PlaneGeometry(MODELWIDTH*MODEL_SCALE,MODELHEIGHT*MODEL_SCALE, 100, 100), new PIXI.MeshMaterial(PIXI.Texture.WHITE)),
			SpritesDrawn: new Map(),
			SpriteGroups: new Map(),
			Submeshes: OldSubmeshes || new Map(),
			RenderTexture: RT,
			SpriteList: new Map(),
			Matrix: Object.assign([], Mesh.geometry.getBuffer('aVertexPosition').data),
			Zoom: Zoom,
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
		DrawCanvas.addChild(Container.Mesh);
		Container.Container.sortableChildren = true;
		//Container.Container.cacheAsBitmap = true;
		if (zIndex) Container.Mesh.zIndex = zIndex;
		let data = {
			Character: Character,
			ContainerInfo: Container,
			zIndex: zIndex,
			x: X,
			y: Y,
			Blend: Blend,
			StartMods: StartMods,
			EndMods: EndMods,
		};
		KinkyDungeonSendEvent("meshCreate", data);
		//Container.Container.filterArea = new PIXI.Rectangle(0,0,MODELWIDTH*MODEL_SCALE,MODELHEIGHT*MODEL_SCALE);
	}

	// Actual loop for drawing the models on the character


	if (!MC.Update.has(containerID)) {
		let flippedPoses = DrawModelProcessPoses(MC, extraPoses, flip);

		if (PIXI.BaseTexture.defaultOptions.scaleMode != Blend) PIXI.BaseTexture.defaultOptions.scaleMode = Blend;
		let modified = DrawCharacterModels(containerID,
			MC, X + Zoom * MODEL_SCALE * MODELHEIGHT * 0.25,
			Y + Zoom * MODEL_SCALE * MODELHEIGHT/2,
			(Zoom * MODEL_SCALE) || MODEL_SCALE, StartMods,
			MC.Containers.get(containerID), refreshfilters, flip, EndMods);
		let oldBlend = PIXI.BaseTexture.defaultOptions.scaleMode;
		MC.Mods.set(containerID, StartMods);
		MC.EndMods.set(containerID, EndMods);
		MC.Update.add(containerID);

		let Container = MC.Containers.get(containerID);
		// Cull sprites that weren't drawn yet

		modified = KDCullModelContainerContainer(MC, containerID) || modified;

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
				RenderModelContainer(MC, C, containerID);
			}
		}
		Container.SpritesDrawn.clear();

		for (let p of flippedPoses) {
			delete MC.Poses[p];
		}
	}

	if (StruggleAnimation) {
		let Container = MC.Containers.get(containerID);
		if (Container) {
			//let iii = 0;
			for (let entry of MC.Containers.get(containerID).Submeshes.entries()) {
				let submesh = entry[1];
				let mesh = submesh.mesh;
				if (!mesh.geometry) continue;
				//let rt = MC.Containers.get(containerID).RenderTexture;
				let buffer = mesh.geometry.getBuffer('aVertexPosition');
				let matrix = submesh.matrix;

				if (KDSubmeshEditor && KDSubmeshChosen == entry[0] && !SubmeshEditorBuffer) {
					//@ts-ignore
					if (!SubmeshEditorBufferOrig) SubmeshEditorBufferOrig = [...buffer.data];
				}
				if (KDSubmeshEditor && KDSubmeshChosen == entry[0] && SubmeshEditorBuffer) {
					//@ts-ignore
					buffer.data = SubmeshEditorBuffer;
				} 

				let drawDots = (x: number, width: number, y: number, height: number, i: number) => {
					if (KDSubmeshEditor && KDSubmeshChosen == entry[0] && Zoom == 1 && x >= width*.25 && x <= width*.75 && y >= height*.25 && y <= height*.75) {
						let color = y % 2 == 0 ? 0x00ff00 : 0xff0000;
						let xxx = -50 + (buffer.data[i]*2 + -( MODELWIDTH*0.25 - MODEL_XOFFSET * 0.5))*.5;
						let yyy = -50 + (buffer.data[i+1]*2 + -(MODELHEIGHT*0.25))*.5;
						
						let mx_eff = MouseX;
						let my_eff = MouseY;

						if (KDistEuclidean(mx_eff-xxx, my_eff-yyy) < 50) {

							if (i == SubmeshEditorClosest) {
								SubmeshEditorClosestDist = KDistEuclidean(mx_eff-xxx, my_eff-yyy);

								color = 0xffffff;
								if (mouseDown) {
									MouseClicked = false;
									DisableButtonsOneFrame = true;

									lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 10;
									// x
									buffer.data[i] = buffer.data[i] + (mx_eff - xxx)*MODEL_SCALE;
									// y
									buffer.data[i+1] = buffer.data[i+1] + (my_eff - yyy)*MODEL_SCALE;
									//@ts-ignore
									SubmeshEditorBuffer = buffer.data;
								}

							} else if (KDistEuclidean(mx_eff-xxx, my_eff-yyy) < SubmeshEditorClosestDist) {
								SubmeshEditorClosestDist = KDistEuclidean(mx_eff-xxx, my_eff-yyy);
								SubmeshEditorClosest = i;
							}

							

							
						}

						KDDraw(kdcanvas, kdpixisprites, "buffer" + i, KinkyDungeonRootDirectory + "ShrineAura.png",
						xxx-40, yyy-40,
						80, 80,
						undefined, {
							zIndex: 10000,
							tint: color,
						});
					}
				}

				// Assign locations
				let MaxWarp = ModelGetMaxMeshWarp(MC.Poses, entry[0], "pri_basic", "BasicMesh");
				if (!SubmeshEditorBuffer && MaxWarp && MeshWarps[MaxWarp].BasicMesh) {
					let BasicMesh = MeshWarps[MaxWarp].BasicMesh[MeshWarps[MaxWarp].LayerGroups[entry[0]]];
					let x = 0;
					let y = 0;
					let width = 30;
					let height = 30;
					let intensity = MeshWarps[MaxWarp].intensityFunction ? (MeshWarps[MaxWarp].intensityFunction(C, MC, {})) : 1;
					for (let i = 0; i + 1 < buffer.data.length; i+= 2)
					{
						// x
						buffer.data[i] = matrix[i] + (BasicMesh[i]) * intensity * Zoom;
						// y
						buffer.data[i+1] = matrix[i+1] + (BasicMesh[i+1]) * intensity * Zoom;

						drawDots(x, width, y, height, i);

						x += 1;
						if (x >= width) {
							y += 1;
							x = 0;
						}
					}
				} else if (matrix.length == 8) {
					if (KDSubmeshEditor && KDSubmeshChosen == entry[0]) {
						let x = 0;
						let y = 0;
						let width = 2;
						let height = 2;
						for (let i = 0; i + 1 < buffer.data.length; i+= 2)
						{
							drawDots(x, width, y, height, i);
							

							x += 1;
							if (x >= width) {
								y += 1;
								x = 0;
							}
						}
							
						}
				}  else if (matrix.length == 200) {
					if (KDSubmeshEditor && KDSubmeshChosen == entry[0]) {
						let x = 0;
						let y = 0;
						let width = 10;
						let height = 10;
						for (let i = 0; i + 1 < buffer.data.length; i+= 2)
						{
							drawDots(x, width, y, height, i);
							

							x += 1;
							if (x >= width) {
								y += 1;
								x = 0;
							}
						}
							
						}
				} else if (matrix.length == 1800) {
					if (KDSubmeshEditor && KDSubmeshChosen == entry[0]) {
						let x = 0;
						let y = 0;
						let width = 30;
						let height = 30;
						for (let i = 0; i + 1 < buffer.data.length; i+= 2)
						{
							drawDots(x, width, y, height, i);
							

							x += 1;
							if (x >= width) {
								y += 1;
								x = 0;
							}
						}
							
						}
				}
				/*
				let x = 0;
				let y = 0;
				let width = 10;
				let height = 10;
				let timt = 1000;
				for (let i = 0; i + 1 < buffer.data.length; i+= 2)
				{
					// x
					buffer.data[i] = matrix[i] + MODELWIDTH*0.005*Math.sin(Math.max(0,Math.PI*(0.6*height-y)/(0.6*height)))
						*(Math.sin((CommonTime() % timt)/timt * 2*Math.PI * (1 + iii * 0.1)))*Zoom;
					// y
					buffer.data[i+1] = matrix[i+1] + MODELWIDTH*0.001*Math.sin(Math.PI+Math.max(0,Math.PI*(0.6*height-y)/(0.6*height))) * Math.cos((CommonTime() % timt)/timt * 4*Math.PI)*Zoom;
					if (SHOWMESHPOINTS && Zoom == 1 && x < width*.5 && y > height*.25 && y < height*.75) {
						KDDraw(DrawCanvas, kdpixisprites, iii+"buffer" + i, KinkyDungeonRootDirectory + "ShrineAura.png",
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
					
				iii++;
					*/
				buffer.update();

			}
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

	// Move mesh
	if (MC.Containers.get(containerID)) {
		MC.Containers.get(containerID).Mesh.x = X + Zoom * MODEL_SCALE * MODELHEIGHT * 0.25;
		MC.Containers.get(containerID).Mesh.y = Y + Zoom * MODEL_SCALE * MODELHEIGHT * 0.5;
		return MC.Containers.get(containerID).Mesh;
	}
	return null;
}
/** Future function */
let DrawModel = DrawCharacter;

function LayerIsHidden(MC: ModelContainer, l: ModelLayer, m: Model, Mods: PoseMod[]) : boolean {
	if (l.LockLayer && !m.LockType && !(m.Properties && 
		 (m.Properties[KDLayerPropName(l, MC.Poses, m.Properties)]
				|| m.Properties[l.Name] || m.Properties[l.InheritColor])
			&& (m.Properties[KDLayerPropName(l, MC.Poses, m.Properties)]
				|| m.Properties[l.Name] || m.Properties[l.InheritColor]).AddPose
				&& (m.Properties[KDLayerPropName(l, MC.Poses, m.Properties)]
				|| m.Properties[l.Name] || m.Properties[l.InheritColor]).AddPose.includes("Locked")
	)) return true;
	if (MC.HiddenLayers && MC.HiddenLayers[LayerLayer(MC, l, m, Mods)]) return true;

	if (l.HidePoseConditional?.some((entry) => {
		return (
			!entry[2]
			|| !m.Properties
			|| (!m.Properties[KDLayerPropName(l, MC.Poses, m.Properties)]
				&& !(m.Properties[l.Name] || m.Properties[l.InheritColor]))
			|| ((!m.Properties[KDLayerPropName(l, MC.Poses, m.Properties)]
					|| !m.Properties[KDLayerPropName(l, MC.Poses, m.Properties)][entry[2]])
				&& (!(m.Properties[l.Name] || m.Properties[l.InheritColor])
					|| !(m.Properties[l.Name] || m.Properties[l.InheritColor])[entry[2]])
				)
				)
			&& (
				MC.Poses[entry[0]])
				&& !(MC.Poses[entry[1]]
				);
	})) return true;

	return false;
}

function LayerLayer(MC: ModelContainer, l: ModelLayer, m: Model, Mods?: PoseMod[]) : string {
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

function LayerPri(MC: ModelContainer, l: ModelLayer, m: Model, Mods?: PoseMod[]) : number {
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
	let Properties: LayerPropertiesType = m.Properties;
	let lyr = l.InheritColor || l.Name;
	if (Properties && Properties[lyr]) {
		if (Properties[lyr].LayerBonus) temp += Properties[lyr].LayerBonus;
	}
	let oldProp = lyr;
	lyr = KDLayerPropName(l, MC.Poses, m.Properties);
	if (oldProp != lyr && Properties && Properties[lyr]) {
		if (Properties[lyr].LayerBonus) temp += Properties[lyr].LayerBonus;
	}

	return temp;
}

function KDLayerPropName(l: ModelLayer, Poses: Record<string, boolean>, props: Record<string, LayerPropertiesType>): string {
	if (l.Poses || l.MorphPoses) {
		if (l.Poses)
			for (let pose of Object.keys(l.Poses)) {
				if (Poses[pose]) return (l.InheritColor && props && props[l.InheritColor + pose])
					? l.InheritColor + pose : l.Name + pose;
			}
		if (l.MorphPoses) {
			for (let pose of Object.keys(l.MorphPoses)) {
				if (Poses[pose]) return  (l.InheritColor && props && props[l.InheritColor + pose])
					? l.InheritColor + pose : l.Name + pose;
			}
			for (let pose of Object.values(l.MorphPoses)) {
				if (Poses[pose]) return  (l.InheritColor && props && props[l.InheritColor + pose])
					? l.InheritColor + pose : l.Name + pose;
			}
		}
	}
	return (l.InheritColor && props && props[l.InheritColor])
	? l.InheritColor : l.Name;
}

/**
 * Setup sprites from the modelcontainer
 */
function DrawCharacterModels(containerID: string, MC: ModelContainer, X, Y, Zoom,
	StartMods: PoseMod[],
	ContainerContainer: ContainerInfo, refreshfilters: boolean, flip: boolean, EndMods: PoseMod[]) : boolean {
	// We create a list of models to be added
	let Models = new Map(MC.Models.entries());
	let modified = false;

	for (let submesh of ContainerContainer.Submeshes.values()) {
		//submesh.lhash = submesh.hash;
		submesh.hash = 0;
	}

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


			let prop: LayerPropertiesType = null;
			if (m.Properties) {
				prop = (m.Properties[l.Name] || m.Properties[l.InheritColor]);
				if (!prop && m.Properties[KDLayerPropName(l, MC.Poses, m.Properties)]) {
					prop = m.Properties[KDLayerPropName(l, MC.Poses, m.Properties)];
				} else if (prop) {
					Object.assign(prop, m.Properties[KDLayerPropName(l, MC.Poses, m.Properties)]);
				}
			}

			let Mods = [...(StartMods || []), ...(EndMods || [])]
			let pri = LayerPri(MC, l, m, Mods);
			if (!l.DontAlwaysOverride && LayerIsHidden(MC, l, m, Mods)) continue;


			if (!l.NoOverride && !(prop?.NoOverride != undefined && prop.NoOverride == 1)) {
				let layer = LayerLayer(MC, l, m, Mods);
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
	let totalMods: {[_: string]: PoseMod[]} = {};
	let endMods: {[_: string]: PoseMod[]} = {};
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
		if (!totalMods[m.Layer]) totalMods[m.Layer] = [];
		totalMods[m.Layer].push(m);
	}


	if (EndMods)
		for (let m of EndMods) {
			if (!endMods[m.Layer]) endMods[m.Layer] = [];
			endMods[m.Layer].push(m);
			if (!totalMods[m.Layer]) totalMods[m.Layer] = [];
			totalMods[m.Layer].push(m);
		}



	let drawLayers: Record<string, boolean> = {};

	// Yes we draw these layers
	for (let m of Models.values()) {
		for (let l of Object.values(m.Layers)) {
			if (!LayerIsHidden(MC, l, m, totalMods[l.Name]))
				drawLayers[m.Name + "," + l.Name] = ModelDrawLayer(MC, m, l, MC.Poses);
		}
	}

	interface FilterDef {sprite: PIXISprite, spriteFunc: () => PIXISprite, id: string, spriteName?: string, hash: string, type?: string[], amount: number, zIndex?: number};

	// Create the layer extra filter matrix
	let ExtraFilters: Record<string, LayerFilter[]> = {};
	let DisplaceFilters: Record<string, FilterDef[]> = {};
	let DisplaceFilters_LG: Record<string, FilterDef[]> = {};
	// map of maps of lists
	let DisplaceFiltersOptIn: Record<string, Record<string, FilterDef[]>> = {};
	//let OcclusionFilters: Record<string, {sprite: any, id: string, spriteName?: string, hash: string, amount: number, zIndex?: number}[]> = {};
	let DisplaceFiltersInUse: Record<string,number> = {};
	let DisplaceFilterAmt: Record<string,number> = {};
	//let OcclusionFiltersInUse = {};
	let EraseFilters: Record<string, FilterDef[]> = {};
	let EraseFilters_LG: Record<string, FilterDef[]> = {};
	let EraseFiltersInUse: Record<string,number> = {};
	let EraseFiltersAmt: Record<string,number> = {};
	for (let m of Models.values()) {
		for (let l of Object.values(m.Layers)) {





			if (!(drawLayers[m.Name + "," + l.Name] && !ModelLayerHidden(drawLayers, MC, m, l, MC.Poses))) continue;
			// Apply filter
			if (l.ApplyFilterToLayerGroup) {
				for (let lg of Object.entries(l.ApplyFilterToLayerGroup)) {
					for (let ll of Object.entries(LayerGroups[lg[0]])) {
						if (!! m.Filters && !!m.Filters[l.ApplyFilter || l.InheritColor || l.Name]) {
							if (!ExtraFilters[ll[0]]) ExtraFilters[ll[0]] = [];
							ExtraFilters[ll[0]].push(m.Filters[l.ApplyFilter || l.InheritColor || l.Name]);
						}
						
					}
				}
			}

			let lyr = KDLayerPropName(l, MC.Poses, m.Properties);
			// Apply occlusion
			/*if (l.OccludeLayers
				&& (!l.OccludePoses
					|| l.OccludePoses.some((pose) => {return MC.Poses[pose];}))
				&& (!l.OccludePosesExclude
					|| l.OccludePosesExclude.every((pose) => {return !MC.Poses[pose];}))
				) {
				let transform = new Transform();

				let layer = LayerLayer(MC, l, m, totalMods);


				while (layer) {
					let mod_selected: PoseMod[] = mods[layer] || [];
					for (let mod of mod_selected) {
						transform = transform.recursiveTransform(
							mod.offset_x || 0,
							mod.offset_y || 0,
							mod.rotation_x_anchor ? mod.rotation_x_anchor : 0,
							mod.rotation_y_anchor ? mod.rotation_y_anchor : 0,
							mod.scale_x || 1,
							mod.scale_y || 1,
						(mod.rotation * Math.PI / 180) || 0
						);
					}
					layer = LayerProperties[layer]?.Parent;
				}

				let Properties: LayerProperties = m.Properties ? m.Properties[lyr] : undefined;
				if (Properties) {
					transform = transform.recursiveTransform(
						Properties.XOffset || 0,
						Properties.YOffset || 0,
						Properties.XPivot ||  0,
						Properties.YPivot ||  0,
						Properties.XScale ||  1,
						Properties.YScale ||  1,
						(Properties.Rotation * Math.PI / 180) || 0
					);
				}
				let oldProps = Properties;
				Properties = m.Properties ? (m.Properties[l.Name] || m.Properties[l.InheritColor]) : undefined;
				if (Properties && oldProps != Properties) {
					transform = transform.recursiveTransform(
						Properties.XOffset || 0,
						Properties.YOffset || 0,
						Properties.XPivot ||  0,
						Properties.YPivot ||  0,
						Properties.XScale ||  1,
						Properties.YScale ||  1,
						(Properties.Rotation * Math.PI / 180) || 0
					);
				}
				layer = LayerLayer(MC, l, m, totalMods);
				while (layer) {
					let mod_selected: PoseMod[] = endMods[layer] || [];
					for (let mod of mod_selected) {
						transform = transform.recursiveTransform(
							mod.offset_x || 0,
							mod.offset_y || 0,
							mod.rotation_x_anchor ? mod.rotation_x_anchor : 0,
							mod.rotation_y_anchor ? mod.rotation_y_anchor : 0,
							mod.scale_x || 1,
							mod.scale_y || 1,
						(mod.rotation * Math.PI / 180) || 0
						);
					}
					layer = LayerProperties[layer]?.Parent;
				}

				for (let ll of Object.entries(l.OccludeLayers)) {
					let id = "occ_" + ModelLayerString(m, l, MC.Poses);

					let zzz = (l.DisplaceZBonus || 0)*LAYER_INCREMENT-ModelLayers[LayerLayer(MC, l, m, totalMods)] + (LayerPri(MC, l, m, totalMods) || 0);
					if (OcclusionFiltersInUse[id] != undefined && OcclusionFiltersInUse[id] < zzz) {
						OcclusionFiltersInUse[id] = zzz;
						for (let dg of Object.keys(LayerGroups[ll[0]])) {
							if (OcclusionFilters[dg])
								for (let ft of OcclusionFilters[dg]) {
									if (ft.id == id && ft.zIndex < zzz) {
										ft.zIndex = zzz;
									}
								}
						}
						continue;
					}
					OcclusionFiltersInUse[id] = zzz;

					for (let dg of Object.keys(LayerGroups[ll[0]])) {
						if (!OcclusionFilters[dg]) OcclusionFilters[dg] = [];

						let tt = transform;
						if (KDOptimizeDisplacementMapInfo[id]) {
							tt = new Transform(
								tt.ox,
								tt.oy,
								tt.ax,
								tt.ay,
								tt.sx,
								tt.sy,
								tt.rot,
							).recursiveTransform(
								KDOptimizeDisplacementMapInfo[id].xPad || 0,
								KDOptimizeDisplacementMapInfo[id].yPad || 0,
								0,
								0,
								1,
								1,
								0
							);
						}

						let ox = tt.ox;
						let oy = tt.oy;
						let ax = tt.ax;
						let ay = tt.ay;
						let sx = tt.sx;
						let sy = tt.sy;
						let rot = tt.rot;
						let img = ModelLayerString(m, l, MC.Poses);
						OcclusionFilters[dg].push(
							{
								amount: (l.OccludeAmount || 1) * Zoom,
								hash: id + m.Name + "," + l.Name,
								zIndex: zzz,
								id: id,
								spriteName: img,
								sprite: KDDrawRT(
									ContainerContainer.Container,
									ContainerContainer.SpriteList,
									id, img,
									img,
									ox * Zoom, oy * Zoom, undefined, undefined,
									rot, {
										zIndex: zzz,
										anchorx: (ax - (l.OffsetX/MODELWIDTH || 0)) * (l.AnchorModX || 1),
										anchory: (ay - (l.OffsetY/MODELHEIGHT || 0)) * (l.AnchorModY || 1),
										scalex: sx != 1 ? sx : undefined,
										scaley: sy != 1 ? sy : undefined,
										alpha: 0.0,
										cullable: KDCulling,
									}, false,
									ContainerContainer.SpritesDrawn,
									Zoom, undefined, undefined, true, false
								),
							}
						);
					}

				}
			}*/

			let dAmount = 1;
			let eAmount = 1;

			let filter = m.Filters ? m.Filters[l.InheritColor || l.Name] :
				undefined;
			if (filter?.alpha != undefined && filter.alpha < 0.8) {
				dAmount = 0;
				eAmount = 0;
			}


			// Apply displacement
			if ((l.DisplaceLayers || l.DisplaceLayerGroups)
				&& !(l.CancelDisplacementPoses && l.CancelDisplacementPoses.some((pose) => {return !!MC.Poses[pose];}))
				
				&& (!l.DisplacementPoses
					|| l.DisplacementPoses.some((pose) => {return MC.Poses[pose];}))
				&& (!l.DisplacementPosesExclude
					|| l.DisplacementPosesExclude.every((pose) => {return !MC.Poses[pose];}))
				) {
				let transform = new Transform();

				let layer = LayerLayer(MC, l, m, totalMods[l.Name]);

				while (layer) {
					let mod_selected: PoseMod[] = mods[layer] || [];
					for (let mod of mod_selected) {
						transform = transform.recursiveTransform(
							mod.offset_x || 0,
							mod.offset_y || 0,
							mod.rotation_x_anchor ? mod.rotation_x_anchor : 0,
							mod.rotation_y_anchor ? mod.rotation_y_anchor : 0,
							mod.scale_x || 1,
							mod.scale_y || 1,
						(mod.rotation * Math.PI / 180) || 0
						);
					}
					layer = LayerProperties[layer]?.Parent;
				}

				let Properties: LayerPropertiesType = m.Properties ? m.Properties[lyr] : undefined;
				if (Properties) {
					if (Properties.DisplaceAmount != undefined) {
						if (dAmount == 0) dAmount = 1;
						dAmount *= Properties.DisplaceAmount;
					}
					if (Properties.EraseAmount != undefined) {
						if (eAmount == 0) eAmount = 1;
						eAmount *= Properties.EraseAmount;
					}
					transform = transform.recursiveTransform(
						Properties.XOffset || 0,
						Properties.YOffset || 0,
						Properties.XPivot ||  0,
						Properties.YPivot ||  0,
						Properties.XScale ||  1,
						Properties.YScale ||  1,
						(Properties.Rotation * Math.PI / 180) || 0
					);
				}
				let oldProps = Properties;
				Properties = m.Properties ? (m.Properties[l.Name] || m.Properties[l.InheritColor]) : undefined;
				if (Properties && oldProps != Properties) {
					if (Properties.DisplaceAmount != undefined) {
						if (dAmount == 0) dAmount = 1;
						dAmount *= Properties.DisplaceAmount;
					}
					if (Properties.EraseAmount != undefined) {
						if (eAmount == 0) eAmount = 1;
						eAmount *= Properties.EraseAmount;
					}
					transform = transform.recursiveTransform(
						Properties.XOffset || 0,
						Properties.YOffset || 0,
						Properties.XPivot ||  0,
						Properties.YPivot ||  0,
						Properties.XScale ||  1,
						Properties.YScale ||  1,
						(Properties.Rotation * Math.PI / 180) || 0
					);
				}
				layer = LayerLayer(MC, l, m, totalMods[l.Name]);
				while (layer) {
					let mod_selected: PoseMod[] = endMods[layer] || [];
					for (let mod of mod_selected) {
						transform = transform.recursiveTransform(
							mod.offset_x || 0,
							mod.offset_y || 0,
							mod.rotation_x_anchor ? mod.rotation_x_anchor : 0,
							mod.rotation_y_anchor ? mod.rotation_y_anchor : 0,
							mod.scale_x || 1,
							mod.scale_y || 1,
						(mod.rotation * Math.PI / 180) || 0
						);
					}
					layer = LayerProperties[layer]?.Parent;
				}

				let filterMap = l.DisplaceLayerGroups ? DisplaceFilters_LG : DisplaceFilters;

				for (let ll of Object.entries(l.DisplaceLayerGroups || l.DisplaceLayers)) {
					let sid = ModelLayerStringCustom(m, l, MC.Poses, l.DisplacementSprite,
						"DisplacementMaps", false, l.DisplacementInvariant,
						l.DisplacementMorph, l.NoAppendDisplacement);
					let id = (l.DisplaceLayerGroups ? "LG_" + ll +"_" : "") + sid;

					let zzz = (l.DisplaceZBonus || 0)*LAYER_INCREMENT-ModelLayers[LayerLayer(MC, l, m, totalMods[l.Name])] + (LayerPri(MC, l, m, totalMods[l.Name]) || 0);
					if (DisplaceFiltersInUse[id] != undefined && DisplaceFiltersInUse[id] < zzz) {
						DisplaceFiltersInUse[id] = zzz;
						for (let dg of Object.keys(l.DisplaceLayerGroups || LayerGroups[ll[0]])) {
							if (l.DisplaceSource?.some((src) => 
								{return DisplaceFiltersOptIn[src] ? DisplaceFiltersOptIn[src][dg] : undefined;}
							))
								l.DisplaceSource?.forEach((src) => {
									for (let ft of DisplaceFiltersOptIn[src][dg]) {
										if (ft.id == id && ft.zIndex < zzz && (!l.NoDispVetoOptIn && (
											!ft.type || !l.DisplacementVeto || !l.DisplacementVeto.some((veto) => {
												return ft.type.includes(veto)
											}))
										)) {
											ft.zIndex = zzz;
											DisplaceFilterAmt[id + dg] = Math.max(
												dAmount * (l.DisplaceAmount || 50) * Zoom,
												DisplaceFilterAmt[id + dg] || 0,
											)
											ft.amount = Math.max(ft.amount, dAmount * (l.DisplaceAmount || 50) * Zoom);
										}
									}
								});
								
							else 
							if (filterMap[dg])
								for (let ft of filterMap[dg]) {
									if (ft.id == id && ft.zIndex < zzz && (
										!ft.type || !l.DisplacementVeto || !l.DisplacementVeto.some((veto) => {
											return ft.type.includes(veto)
										})
									)) {
										ft.zIndex = zzz;
										DisplaceFilterAmt[id + dg] = Math.max(
											dAmount * (l.DisplaceAmount || 50) * Zoom,
											DisplaceFilterAmt[id + dg] || 0,
										)
										ft.amount = Math.max(ft.amount, dAmount * (l.DisplaceAmount || 50) * Zoom);
									}
								}
						}
						continue;
					}
					if (dAmount == 0) continue;
					DisplaceFiltersInUse[id] = zzz;

					for (let dg of Object.keys(l.DisplaceLayerGroups || LayerGroups[ll[0]])) {
						DisplaceFilterAmt[id + dg] = Math.max(
							dAmount * (l.DisplaceAmount || 50) * Zoom,
							DisplaceFilterAmt[id + dg] || 0,
						)

						let tt = transform;
						if (KDOptimizeDisplacementMapInfo[id]) {
							tt = new Transform(
								tt.ox,
								tt.oy,
								tt.ax,
								tt.ay,
								tt.sx,
								tt.sy,
								tt.rot,
							).recursiveTransform(
								KDOptimizeDisplacementMapInfo[id].xPad || 0,
								KDOptimizeDisplacementMapInfo[id].yPad || 0,
								0,
								0,
								1,
								1,
								0
							);
						}

						let ox = tt.ox;
						let oy = tt.oy;
						let ax = tt.ax;
						let ay = tt.ay;
						let sx = tt.sx;
						let sy = tt.sy;
						let rot = tt.rot;

						let obj: FilterDef = {
								amount: DisplaceFilterAmt[id + dg],
								hash: id + m.Name + "," + l.Name,
								zIndex: zzz,
								id: id,
								type: l.DisplaceSource,
								spriteName: l.DisplacementSprite,
								spriteFunc: () => {return KDDrawRT(
									ContainerContainer.Container,
									ContainerContainer.SpriteList,
									id, id,
									sid,
									ox * Zoom, oy * Zoom, undefined, undefined,
									rot, {
										zIndex: zzz,
										anchorx: l.NoOffsetDisplacement ? ax : ((ax - (l.OffsetX/MODELWIDTH || 0)) * (l.AnchorModX || 1)),
										anchory: l.NoOffsetDisplacement ? ay : ((ay - (l.OffsetY/MODELHEIGHT || 0)) * (l.AnchorModY || 1)),
										scalex: sx != 1 ? sx : undefined,
										scaley: sy != 1 ? sy : undefined,
										alpha: 0.0,
										cullable: KDCulling,
									}, false,
									ContainerContainer.SpritesDrawn,
									Zoom, undefined, undefined, true, false
								)},
								sprite: null
							};
						if (l.DisplaceOptIn) {
							let iii = 0;
							for (let src of l.DisplaceSource) {
								if (l.DisplaceOptIn[iii]) {
									if (!DisplaceFiltersOptIn[src]) DisplaceFiltersOptIn[src] = {};
									if (!DisplaceFiltersOptIn[src][dg]) DisplaceFiltersOptIn[src][dg] = [];
									DisplaceFiltersOptIn[src][dg].push(
										obj
									);
								} else {
									if (!filterMap[dg]) filterMap[dg] = [];
									filterMap[dg].push(
										obj
									);
								}
								iii++;
								
							}
						} else {
						if (!filterMap[dg]) filterMap[dg] = [];
							filterMap[dg].push(
								obj
							);
						}
						
					}

				}
			}
			// Apply erase
			if ((l.EraseLayers || l.EraseLayerGroups)
				&& !(l.CancelErasePoses && l.CancelErasePoses.some((pose) => {return !!MC.Poses[pose];}))
				&& (!l.ErasePoses
					|| l.ErasePoses.some((pose) => {return MC.Poses[pose];}))
				&& (!l.ErasePosesExclude
					|| l.ErasePosesExclude.every((pose) => {return !MC.Poses[pose];}))
			) {
				let transform = new Transform();

				let layer = LayerLayer(MC, l, m, totalMods[l.Name]);

				while (layer) {
					let mod_selected: PoseMod[] = mods[layer] || [];
					for (let mod of mod_selected) {
						transform = transform.recursiveTransform(
							mod.offset_x || 0,
							mod.offset_y || 0,
							mod.rotation_x_anchor ? mod.rotation_x_anchor : 0,
							mod.rotation_y_anchor ? mod.rotation_y_anchor : 0,
							mod.scale_x || 1,
							mod.scale_y || 1,
							(mod.rotation * Math.PI / 180) || 0
						);
					}
					layer = LayerProperties[layer]?.Parent;
				}

				let Properties: LayerPropertiesType = m.Properties ? m.Properties[lyr] : undefined;
				if (Properties) {
					if (Properties.DisplaceAmount != undefined) {
						if (dAmount == 0) dAmount = 1;
						dAmount *= Properties.DisplaceAmount;
					}
					if (Properties.EraseAmount != undefined) {
						if (eAmount == 0) eAmount = 1;
						eAmount *= Properties.EraseAmount;
					}
					transform = transform.recursiveTransform(
						Properties.XOffset || 0,
						Properties.YOffset || 0,
						Properties.XPivot ||  0,
						Properties.YPivot ||  0,
						Properties.XScale ||  1,
						Properties.YScale ||  1,
						(Properties.Rotation * Math.PI / 180) || 0
					);
				}
				let oldProps = Properties;
				Properties = m.Properties ? (m.Properties[l.Name] || m.Properties[l.InheritColor]) : undefined;
				if (Properties && oldProps != Properties) {
					if (Properties.DisplaceAmount != undefined) {
						if (dAmount == 0) dAmount = 1;
						dAmount *= Properties.DisplaceAmount;
					}
					if (Properties.EraseAmount != undefined) {
						if (eAmount == 0) eAmount = 1;
						eAmount *= Properties.EraseAmount;
					}
					transform = transform.recursiveTransform(
						Properties.XOffset || 0,
						Properties.YOffset || 0,
						Properties.XPivot ||  0,
						Properties.YPivot ||  0,
						Properties.XScale ||  1,
						Properties.YScale ||  1,
						(Properties.Rotation * Math.PI / 180) || 0
					);
				}
				layer = LayerLayer(MC, l, m, totalMods[l.Name]);
				while (layer) {
					let mod_selected: PoseMod[] = endMods[layer] || [];
					for (let mod of mod_selected) {
						transform = transform.recursiveTransform(
							mod.offset_x || 0,
							mod.offset_y || 0,
							mod.rotation_x_anchor ? mod.rotation_x_anchor : 0,
							mod.rotation_y_anchor ? mod.rotation_y_anchor : 0,
							mod.scale_x || 1,
							mod.scale_y || 1,
							(mod.rotation * Math.PI / 180) || 0
						);
					}
					layer = LayerProperties[layer]?.Parent;
				}

				let filterMap = l.EraseLayerGroups ? EraseFilters_LG : EraseFilters;

				for (let ll of Object.entries(l.EraseLayerGroups || l.EraseLayers)) {
					let sid = ModelLayerStringCustom(m, l, MC.Poses, l.EraseSprite, "DisplacementMaps", false, l.EraseInvariant, l.EraseMorph, l.NoAppendErase);
					let id = (l.EraseLayerGroups ? "LG_" + ll +"_" : "") + sid;
					let zzz = (l.EraseZBonus || 0) -ModelLayers[LayerLayer(MC, l, m, totalMods[l.Name])] + (LayerPri(MC, l, m, totalMods[l.Name]) || 0);
					if (EraseFiltersInUse[id] != undefined && EraseFiltersInUse[id] < zzz) {
						EraseFiltersInUse[id] = zzz;
						for (let dg of Object.keys(l.EraseLayerGroups || LayerGroups[ll[0]])) {
							if (filterMap[dg])
								for (let ft of filterMap[dg]) {
									if (ft.id == id && ft.zIndex < zzz) {
										ft.zIndex = zzz;
										EraseFiltersAmt[id + dg] = Math.max(
											eAmount * (l.EraseAmount || 50) * Zoom,
											EraseFiltersAmt[id + dg] || 0,
										)
										ft.amount = Math.max(ft.amount, eAmount * (l.EraseAmount || 50) * Zoom);
									}
								}
						}
						continue;
					}
					if (eAmount == 0) continue;
					EraseFiltersInUse[id] = zzz;


					for (let dg of Object.keys(l.EraseLayerGroups || LayerGroups[ll[0]])) {
						if (l.EraseLayerGroups && dg != ll[0]) continue;
						if (!filterMap[dg]) filterMap[dg] = [];
						EraseFiltersAmt[id + dg] = Math.max(
							eAmount * (l.EraseAmount || 50) * Zoom,
							EraseFiltersAmt[id + dg] || 0,
						)

						let tt = transform;
						if (KDOptimizeDisplacementMapInfo[id]) {
							tt = new Transform(
								tt.ox,
								tt.oy,
								tt.ax,
								tt.ay,
								tt.sx,
								tt.sy,
								tt.rot,
							).recursiveTransform(
								KDOptimizeDisplacementMapInfo[id].xPad || 0,
								KDOptimizeDisplacementMapInfo[id].yPad || 0,
								0,
								0,
								1,
								1,
								0
							);
						}

						let ox = tt.ox;
						let oy = tt.oy;
						let ax = tt.ax;
						let ay = tt.ay;
						let sx = tt.sx;
						let sy = tt.sy;
						let rot = tt.rot;


						filterMap[dg].push(
							{
								amount: EraseFiltersAmt[id + dg],
								hash: id + m.Name + "," + l.Name,
								id: id,
								spriteName: l.EraseSprite,
								zIndex: zzz,
								spriteFunc: () => {
									return KDDrawRT(
										ContainerContainer.Container,
										ContainerContainer.SpriteList,
										id, id,
										sid,
										ox * Zoom, oy * Zoom, undefined, undefined,
										rot, {
											zIndex: zzz,
											anchorx: l.NoOffsetErase ? ax : ((ax - (l.OffsetX/MODELWIDTH || 0)) * (l.AnchorModX || 1)),
											anchory: l.NoOffsetErase ? ay : ((ay - (l.OffsetY/MODELHEIGHT || 0)) * (l.AnchorModY || 1)),
											scalex: sx != 1 ? sx : undefined,
											scaley: sy != 1 ? sy : undefined,
											alpha: 0.0,
											cullable: KDCulling,
										}, false,
										ContainerContainer.SpritesDrawn,
										Zoom, undefined, undefined, true, false, undefined
									);
								},
								sprite: null,
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
							id: 'ef' + x,
							spriteFunc: () => {
								return KDDrawRT(
									ContainerContainer.Container,
									ContainerContainer.SpriteList,
									"xrayfilter_" + x, "xrayfilter_" + x,
									"DisplacementMaps/" + x + ".png",
									0, 0, undefined, undefined,
									0, {
										zIndex: 1000000,
										alpha: 0.0,
										cullable: KDCulling,
									}, false,
									ContainerContainer.SpritesDrawn,
									Zoom, undefined, undefined, true, false
								)
							},
							sprite: null,
						}
					);
				}
			}
		}
	}


	let f = null;

	// Now that we have the final list of models we do a KDDraw
	for (let m of Models.values()) {
		for (let l of Object.values(m.Layers)) {
			if (drawLayers[m.Name + "," + l.Name] && !ModelLayerHidden(drawLayers, MC, m, l, MC.Poses)) {

				let layer = LayerLayer(MC, l, m, totalMods[l.Name]);
				let origlayer = layer;

				let transform = new Transform();

				while (layer) {
					let mod_selected: PoseMod[] = mods[layer] || [];
					for (let mod of mod_selected) {
						transform = transform.recursiveTransform(
							mod.offset_x || 0,
							mod.offset_y || 0,
							mod.rotation_x_anchor ? mod.rotation_x_anchor : 0,
							mod.rotation_y_anchor ? mod.rotation_y_anchor : 0,
							mod.scale_x || 1,
							mod.scale_y || 1,
							(mod.rotation * Math.PI / 180) || 0
						);
					}
					layer = LayerProperties[layer]?.Parent;
				}

				let Properties: LayerPropertiesType = m.Properties ? m.Properties[KDLayerPropName(l, MC.Poses, m.Properties)] : undefined;
				if (Properties) {
					transform = transform.recursiveTransform(
						Properties.XOffset || 0,
						Properties.YOffset || 0,
						Properties.XPivot ||  0,
						Properties.YPivot ||  0,
						Properties.XScale ||  1,
						Properties.YScale ||  1,
						(Properties.Rotation * Math.PI / 180) || 0
					);
				}
				let oldProps = Properties;
				Properties = m.Properties ? (m.Properties[l.Name] || m.Properties[l.InheritColor]) : undefined;
				if (Properties && oldProps != Properties) {
					transform = transform.recursiveTransform(
						Properties.XOffset || 0,
						Properties.YOffset || 0,
						Properties.XPivot ||  0,
						Properties.YPivot ||  0,
						Properties.XScale ||  1,
						Properties.YScale ||  1,
						(Properties.Rotation * Math.PI / 180) || 0
					);
				}


				layer = LayerLayer(MC, l, m, totalMods[l.Name]);
				while (layer) {
					let mod_selected: PoseMod[] = endMods[layer] || [];
					for (let mod of mod_selected) {
						transform = transform.recursiveTransform(
							mod.offset_x || 0,
							mod.offset_y || 0,
							mod.rotation_x_anchor ? mod.rotation_x_anchor : 0,
							mod.rotation_y_anchor ? mod.rotation_y_anchor : 0,
							mod.scale_x || 1,
							mod.scale_y || 1,
							(mod.rotation * Math.PI / 180) || 0
						);
					}
					layer = LayerProperties[layer]?.Parent;
				}

				let ox = transform.ox;
				let oy = transform.oy;
				let ax = transform.ax;
				let ay = transform.ay;
				let sx = transform.sx;
				let sy = transform.sy;
				let rot = transform.rot;


				let fhash = (m.Filters ? (m.Filters[l.InheritColor || l.Name] ? FilterHash(m.Filters[l.InheritColor || l.Name]) : "") : "");
				let fh = containerID + fhash;

				let filter = m.Filters ? (m.Filters[l.InheritColor || l.Name] ?
					((KDAdjustmentFilterCache.get(fh)) || [adjustFilter(m.Filters[l.InheritColor || l.Name])])
					: undefined) : undefined;
				if (filter && !KDAdjustmentFilterCache.get(fh)) {
					KDAdjustmentFilterCache.set(containerID + FilterHash(m.Filters[l.InheritColor || l.Name]), filter);
				}

				let extrafilter: PIXIFilter[] = [];
				let zz = -ModelLayers[origlayer] + (LayerPri(MC, l, m, totalMods[l.Name]) || 0);
				// Add extrafilters
				if (ExtraFilters[origlayer]) {
					for (let ef of ExtraFilters[origlayer]) {
						let efh = containerID + FilterHash(ef)
						if (refreshfilters) {
							KDAdjustmentFilterCache.delete(containerID + FilterHash(ef));
						}
						f = new PIXI.filters.AdjustmentFilter(ef);
						f.multisample = 0;
						let efilter = (KDAdjustmentFilterCache.get(efh) || [f]);
						if (efilter && !KDAdjustmentFilterCache.get(efh)) {
							KDAdjustmentFilterCache.set(containerID + FilterHash(ef), efilter);
						}
						extrafilter.push(...efilter);
					}
				}
				// Add erase filters BEFORE displacement
				if (!l.NoErase && EraseFilters[origlayer]) {
					for (let ef of EraseFilters[origlayer]) {
						if (!ef.sprite && ef.spriteFunc) ef.sprite = ef.spriteFunc();
						if (!ef.sprite) continue;
						if (ef.spriteName != undefined && ef.spriteName == l.EraseSprite) continue;
						if (ef.zIndex != undefined && ef.zIndex - (l.EraseZBonus || 0) <= zz + 0.01) continue;
						let efh = containerID + "ers_" + ef.hash;
						let dsprite = ef.sprite;
						if (refreshfilters) {
							KDAdjustmentFilterCache.delete(efh);
						}
						//@ts-ignore
						KDTex(dsprite.path, false); // try to preload it
						if (!KDAdjustmentFilterCache.get(efh)) {
							f = new EraseFilter(
								dsprite,
							);

							KDSetFilterSprite({hash: efh, filter: f}, dsprite);
							f.multisample = 0;
						}
						let efilter = (KDAdjustmentFilterCache.get(efh) || [f]);
						if (efilter && !KDAdjustmentFilterCache.get(efh)) {
							KDAdjustmentFilterCache.set(efh, efilter);
						}
						extrafilter.push(...efilter);
					}
				}

				// Add displacement filters
				// since you have to opt in to displacefiltersoptin, nodisplace doesnt affect it
				
				if (l.DisplacementSources) {
					let alreadyAdded: Map<object, boolean> = new Map();
					for (let src of l.DisplacementSources) {
						if (DisplaceFiltersOptIn[src] && DisplaceFiltersOptIn[src][origlayer]) {
							for (let ef of DisplaceFiltersOptIn[src][origlayer]) {
								if (alreadyAdded.get(ef)) continue;
								if (!ef.sprite && ef.spriteFunc) ef.sprite = ef.spriteFunc();
								if (!ef.sprite) continue;
								if (ef.spriteName != undefined && ef.spriteName == l.DisplacementSprite) continue;
								if (ef.zIndex != undefined && ef.zIndex - (l.DisplaceZBonus || 0) <= zz + 0.01) continue;
								if (!l.NoDispVetoOptIn && (
										ef.type && l.DisplacementVeto && l.DisplacementVeto.some((veto) => {
											return ef.type.includes(veto)
										})
									)) continue;
								let efh = containerID + "disp_" + ef.hash;
								let dsprite = ef.sprite;
								if (refreshfilters) {
									KDAdjustmentFilterCache.delete(efh);
								}
								//@ts-ignore
								KDTex(dsprite.path, false); // try to preload it
								if (!KDAdjustmentFilterCache.get(efh)) {
									f = new DisplaceFilter(
										dsprite,
										ef.amount,
									);
									//Unneeded because its already in the filter cache
									KDSetFilterSprite({hash: efh, filter: f}, dsprite);
									f.multisample = 0;
								}

								let efilter = (KDAdjustmentFilterCache.get(efh) || [f]);
								if (efilter && !KDAdjustmentFilterCache.get(efh)) {
									KDAdjustmentFilterCache.set(efh, efilter);
								}
								extrafilter.push(...efilter);
								// hash map is love
								alreadyAdded.set(ef, true);
							}
						}
					}
				}
				
				if (!l.NoDisplace && DisplaceFilters[origlayer]) {
					for (let ef of DisplaceFilters[origlayer]) {
						if (!ef.sprite && ef.spriteFunc) ef.sprite = ef.spriteFunc();
						if (!ef.sprite) continue;
						if (ef.spriteName != undefined && ef.spriteName == l.DisplacementSprite) continue;
						if (ef.zIndex != undefined && ef.zIndex - (l.DisplaceZBonus || 0) <= zz + 0.01) continue;
						if ((
								ef.type && l.DisplacementVeto && l.DisplacementVeto.some((veto) => {
									return ef.type.includes(veto)
								})
							)) continue;
						let efh = containerID + "disp_" + ef.hash;
						let dsprite = ef.sprite;
						if (refreshfilters) {
							KDAdjustmentFilterCache.delete(efh);
						}
						
						//@ts-ignore
						KDTex(dsprite.path, false); // try to preload it
						if (!KDAdjustmentFilterCache.get(efh)) {
							f = new DisplaceFilter(
								dsprite,
								ef.amount,
							);
							//Unneeded because its already in the filter cache
							KDSetFilterSprite({hash: efh, filter: f}, dsprite);
							f.multisample = 0;
						}

						let efilter = (KDAdjustmentFilterCache.get(efh) || [f]);
						if (efilter && !KDAdjustmentFilterCache.get(efh)) {
							KDAdjustmentFilterCache.set(efh, efilter);
						}
						extrafilter.push(...efilter);
					}
				}
				// Add occlusion filters AFTER displacement
				/*if (!l.NoErase && OcclusionFilters[origlayer]) {
					for (let ef of OcclusionFilters[origlayer]) {
						if (!ef.sprite) continue;
						if (ef.spriteName != undefined && ef.spriteName == l.EraseSprite) continue;
						if (ef.zIndex != undefined && ef.zIndex - (l.DisplaceZBonus || 0) <= zz + 0.01) continue;
						let efh = containerID + "occ_" + ef.hash;
						let dsprite = ef.sprite;
						if (refreshfilters) {
							KDAdjustmentFilterCache.delete(efh);
						}
						KDTex(dsprite.name, false); // try to preload it
						f = new OcclusionFilter(
							dsprite,
						);
						f.multisample = 0;
						let efilter = (KDAdjustmentFilterCache.get(efh) || [f]);
						if (efilter && !KDAdjustmentFilterCache.get(efh)) {
							KDAdjustmentFilterCache.set(efh, efilter);
						}
						extrafilter.push(...efilter);
					}
				}*/

				let img = ModelLayerString(m, l, MC.Poses);
				let id = `layer_${m.Name}_${l.Name}_${img}_${fh}_${Math.round(ax*10000)}_${Math.round(ay*10000)}_${Math.round(rot*1000)}_${Math.round(sx*1000)}_${Math.round(sy*1000)}`;
				//id = LZString.compressToBase64(id);
				let filters = filter;
				//let origFilters = filter;
				if (extrafilter) filters = [...(filter || []), ...extrafilter];

				for (let filter of filters) {
					KDFilterDrawn.set(filter, true);
				}
				/*if (KDToggles.OptRender) {
					KDDrawRT(
						ContainerContainer.Container,
						ContainerContainer.SpriteList,
						id, fhash,
						img,
						ox * Zoom, oy * Zoom, undefined, undefined,
						rot, {
							zIndex: zz,
							anchorx: (ax - (l.OffsetX/MODELWIDTH || 0)) * (l.AnchorModX || 1),
							anchory: (ay - (l.OffsetY/MODELHEIGHT || 0)) * (l.AnchorModY || 1),
							normalizeAnchorX: MODELWIDTH,
							normalizeAnchorY: MODELHEIGHT,
							scalex: sx != 1 ? sx : undefined,
							scaley: sy != 1 ? sy : undefined,
							filters: extrafilter,
							cullable: KDCulling,
						}, false,
						ContainerContainer.SpritesDrawn,
						Zoom, undefined, origFilters
					);
				} else {*/
				let sg = KDGetSpriteGroup(-zz);
				let cc = ContainerContainer.Container;
				if (!modified && !ContainerContainer.SpriteList.has(id)) {modified = true;}
				let filtercount = extrafilter?.length || 0;
				
				if (sg) {
					if (!ContainerContainer.SpriteGroups.has(sg)) {
						cc = new PIXI.Container();
						cc.sortableChildren = true;


						// same as main container
						cc.angle = rotation;
						cc.pivot.x = MODELWIDTH*Zoom * X_Anchor + MODEL_XOFFSET*Zoom;
						cc.pivot.y = MODELHEIGHT*Zoom * Y_Anchor;
						cc.x = (MODELWIDTH * (1 + X_Offset)) * Zoom + MODEL_XOFFSET*Zoom;
						cc.y = (MODELHEIGHT * (1 + Y_Offset)) * Zoom;

						//cc.cacheAsBitmap = true;
						ContainerContainer.SpriteGroups.set(sg, cc);
						// note: zoom is multiplied by MODEL_SCALE so here it cancels
						let RT = ContainerContainer.Submeshes.get(sg)?.rt
							|| PIXI.RenderTexture.create({ width: MODELWIDTH * 2 * Zoom, height: MODELHEIGHT * 2 * Zoom,
								resolution: resolution});
						let Mesh = ModelGetMaxMeshWarp(MC.Poses, sg, "pri_basic", "BasicMesh") ?
							new PIXI.SimplePlane(RT, 30, 30)
							: new PIXI.SimplePlane(RT, 2, 2);
						
						
						
						Mesh.zIndex = -ModelLayers[metaLayerForward[sg][metaLayerForward[sg].length - 1]] - LAYER_INCREMENT;
						ContainerContainer.Mesh.addChild(Mesh);
						ContainerContainer.Submeshes.set(sg, {mesh: Mesh, rt: RT, container: cc,
							hash: 0, lhash: ContainerContainer.Submeshes.get(sg)?.lhash,
							matrix: Object.assign([], Mesh.geometry.getBuffer('aVertexPosition').data)});
					} else cc = ContainerContainer.SpriteGroups.get(sg);
					let sm = ContainerContainer.Submeshes.get(sg);
					sm.hash += Math.round(KDGetStringHash(id) + ox * Zoom + oy * Zoom + 
						transform.ax + transform.ay + transform.rot + transform.sx + transform.sy + transform.ox + transform.oy
					+ 10000*ContainerContainer.Container.angle
					+ 10000*ContainerContainer.Container.pivot.x
					+ 10000*ContainerContainer.Container.pivot.y
					+ ContainerContainer.Container.x
					+ ContainerContainer.Container.y
					+ filtercount
					
					);
				}
				let spr: PIXISprite = KDDraw(
					cc,
					ContainerContainer.SpriteList,
					id,
					img,
					ox * Zoom, oy * Zoom, undefined, undefined,
					rot, {
						zIndex: zz,
						anchorx: (ax - (l.OffsetX/MODELWIDTH || 0)) * (l.AnchorModX || 1),
						anchory: (ay - (l.OffsetY/MODELHEIGHT || 0)) * (l.AnchorModY || 1),
						normalizeAnchorX: MODELWIDTH,
						normalizeAnchorY: MODELHEIGHT,
						scalex: sx != 1 ? sx : undefined,
						scaley: sy != 1 ? sy : undefined,
						filters: filters,
						cullable: KDCulling,
					}, false,
					ContainerContainer.SpritesDrawn,
					Zoom, false
				);

				// add the filters to the container if not already
				for (let i = 0; i < filters.length; i++) {
					let f = filters[i];
					if (!f) break;
					let sprite: PIXISprite = (f as any).maskSprite;
					if (sprite) {
						if (spr?.getBounds().intersects(sprite.getBounds())) {
							if (!cc.getChildByName(sprite.name))
								cc.addChild(sprite);
						} else {
							filters.splice(i, 1); // remove the filter to speed rendering
							i--;
						}
					}
				}
				//}

			}
		}
	}

	for (let ent of ContainerContainer.Submeshes.entries()) {
		let name : string = ent[0];
		let submesh: Submesh = ent[1];

		
		let extrafilter: PIXIFilter[] = [];

		// Add erase filters BEFORE displacement
		if (EraseFilters_LG[name]) {
			for (let ef of EraseFilters_LG[name]) {
						if (!ef.sprite && ef.spriteFunc) ef.sprite = ef.spriteFunc();
				if (!ef.sprite) continue;
				let efh = containerID + "ers_" + ef.hash;
				let dsprite = ef.sprite;
				if (refreshfilters) {
					KDAdjustmentFilterCache.delete(efh);
				}
				//@ts-ignore
				KDTex(dsprite.path, false); // try to preload it
				if (!KDAdjustmentFilterCache.get(efh)) {
					f = new EraseFilter(
						dsprite,
					);

					KDSetFilterSprite({hash: efh, filter: f}, dsprite);
					f.multisample = 0;
				}
				let efilter = (KDAdjustmentFilterCache.get(efh) || [f]);
				if (efilter && !KDAdjustmentFilterCache.get(efh)) {
					KDAdjustmentFilterCache.set(efh, efilter);
				}
				extrafilter.push(...efilter);
			}
		}
		
		if (DisplaceFilters_LG[name]) {
			for (let ef of DisplaceFilters_LG[name]) {
				if (!ef.sprite && ef.spriteFunc) ef.sprite = ef.spriteFunc();
				if (!ef.sprite) continue;
				let efh = containerID + "disp_" + ef.hash;
				let dsprite = ef.sprite;
				if (refreshfilters) {
					KDAdjustmentFilterCache.delete(efh);
				}
				//@ts-ignore
				KDTex(dsprite.path, false); // try to preload it
				if (!KDAdjustmentFilterCache.get(efh)) {
					f = new DisplaceFilter(
						dsprite,
						ef.amount,
					);
					//Unneeded because its already in the filter cache
					KDSetFilterSprite({hash: efh, filter: f}, dsprite);
					f.multisample = 0;
				}

				let efilter = (KDAdjustmentFilterCache.get(efh) || [f]);
				if (efilter && !KDAdjustmentFilterCache.get(efh)) {
					KDAdjustmentFilterCache.set(efh, efilter);
				}
				extrafilter.push(...efilter);
			}
		}

		if (extrafilter.length > 0) {
			submesh.container.filters = extrafilter;

			// add the filters to the container if not already
			for (let i = 0; i < submesh.container.filters.length; i++) {
				let f = submesh.container.filters[i];
				if (!f) break;
				let sprite: PIXISprite = (f as any).maskSprite;
				if (sprite) {
						if (!submesh.container.getChildByName(sprite.name))
							submesh.container.addChild(sprite);
					
				}
			}

		} else submesh.container.filters = undefined;
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
	let prop: LayerPropertiesType = null;
	if (Model.Properties) {
		prop = (Model.Properties[Layer.Name] || Model.Properties[Layer.InheritColor]);
		if (!prop && Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)]) {
			prop = Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)];
		} else if (prop) {
			Object.assign(prop, Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)]);
		}
	}

	if ((Layer.HideWhenOverridden && !(prop?.HideOverridden != undefined && prop?.HideOverridden == 0))
		|| (prop?.HideOverridden == 1)) {
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
	if (Model.Properties) {
		prop = (Model.Properties[Layer.Name] || Model.Properties[Layer.InheritColor]);
		if (!prop && Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)]) {
			prop = Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)];
		} else if (prop) {
			Object.assign(prop, Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)]);
		}
		if (prop && prop.ExtraHidePoses) {
			for (let p of Object.keys(Poses)) {
				if (prop.ExtraHidePoses.includes(p)) {
					return false;
				}
			}
		}
		if (prop && prop.ExtraRequirePoses) {
			for (let p of prop.ExtraRequirePoses) {
				if (p && !Poses[p]) {
					return false;
				}
			}
		}
	}
	if (Layer.HidePrefixPose) {
		for (let p of Layer.HidePrefixPose) {
			if (Poses[p + LayerLayer(MC, Layer, Model)]) {
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
	if (Model.Properties) {
		let prop = (Model.Properties[Layer.Name] || Model.Properties[Layer.InheritColor]);
		if (!prop && Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)]) {
			prop = Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)];
		} else if (prop) {
			Object.assign(prop, Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)]);
		}
		if (prop && prop.ExtraHidePrefixPose) {
			for (let p of prop.ExtraHidePrefixPose) {
				if (Poses[p + LayerPri(MC, Layer, Model)]) {
					return false;
				}
				if (prop.ExtraHidePrefixPoseSuffix) {
					for (let suff of prop.ExtraHidePrefixPoseSuffix) {
						if (Poses[p + suff]) {
							return false;
						}
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
	// Conditional hide poses
	if (Layer.HidePoseConditional?.some((entry) => {
		return (
			!entry[2]
			|| !Model.Properties
			|| (!Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)]
				&& !(Model.Properties[Layer.Name] || Model.Properties[Layer.InheritColor]))
			|| ((!Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)]
					|| !Model.Properties[KDLayerPropName(Layer, Poses, Model.Properties)][entry[2]])
				&& (!(Model.Properties[Layer.Name] || Model.Properties[Layer.InheritColor])
					|| !(Model.Properties[Layer.Name] || Model.Properties[Layer.InheritColor])[entry[2]])
				)
				)
			&& (
				Poses[entry[0]])
				&& !(Poses[entry[1]]
				);
	})) return false;

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
	return `${Poses.Back ? "ModelsBack" : "Models"}/${Layer.Folder || Model.Folder}/${LayerSprite(Layer, Poses)}.png`;
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
			if (Poses[p[0]] != undefined && (!Layer.AppendPoseRequire ||
				Object.keys(Layer.AppendPoseRequire).some((ap) => {return !!Poses[ap];})
			)) {
				pose = pose + (p[1]);
				break;
			}
		}
	}
	if (Layer.AppendPoseMulti && !forceInvariant && !noAppend) {
		for (let p of Object.entries(Layer.AppendPoseMulti)) {
			if (Poses[p[0]] != undefined && (!Layer.AppendPoseRequire ||
				Object.keys(Layer.AppendPoseRequire).some((ap) => {return !!Poses[ap];})
			)) {
				pose = pose + (p[1]);
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
	let dontadd = {};


	for (let A of appearance) {

		if (A.Model && A.Model.Properties) {
			for (let entry of Object.values(A.Model.Properties)) {
				if (entry.DontAddPose) {
					for (let pose of entry.DontAddPose) {
						if (!dontadd[pose]) {
							dontadd[pose] = true;
						}
					}
				}
			}
		}
	}

	for (let A of appearance) {
		if (A.Model && A.Model.AddPose) {
			for (let pose of A.Model.AddPose) {
				if (!dontadd[pose])
					poses[pose] = true;
			}
		}
		if (A.Model && A.Model.Categories) {
			for (let pose of A.Model.Categories) {
				if (!dontadd[pose])
					poses[pose] = true;
			}
		}
	}
	for (let A of appearance) {
		if (A.Model && A.Model.AddPoseConditional) {
			for (let entry of Object.entries(A.Model.AddPoseConditional)) {
				if (!poses[entry[0]]) {
					for (let pose of entry[1]) {
						if (!dontadd[pose])
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
						if (!dontadd[pose])
							poses[pose] = true;
					}
				}
			}
		}

		if (A.Model && A.Model.Properties) {
			for (let entry of Object.values(A.Model.Properties)) {
				if (entry.AddPose) {
					for (let pose of entry.AddPose) {
						if (!poses[pose]) {
							poses[pose] = true;
						}
					}
				}
			}
		}
	}

	for (let A of appearance) {
		if (A.Model
			&& !A.Model.RemovePoses?.some((removePose) => {return poses[removePose];})
			) {
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


function UpdateModels(C: Character, Xray?: string[], customFaction?: string) {
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
		if (A.Model && A.Model.Categories) {
			for (let pose of A.Model.Categories) {
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
		if (A.Model && A.Model.Properties) {
			for (let entry of Object.values(A.Model.Properties)) {
				if (entry.AddPose) {
					for (let pose of entry.AddPose) {
						if (!poses[pose]) {
							poses[pose] = true;
						}
					}
				}
			}
		}


	}


	for (let A of appearance) {
		if (A.Model
			&& !A.Model.RemovePoses?.some((removePose) => {return poses[removePose];})
			) {

			let clothes = A.Model;
			let filters = A.Filters;

			if (customFaction && clothes.factionFilters && GetPalette(C, customFaction)) {
				filters = structuredClone(A.Filters) || {}; // clone to avoid poisoning original Appearance array
				for (let f of Object.entries(clothes.factionFilters)) {
					let faction = customFaction;
					if (GetPalette(C, faction)[f[1].color]) {
						if (f[1].override) {
							filters[f[0]] = GetPalette(C, faction)[f[1].color];
						} else {
							let origFilters = filters[f[0]];
							//@ts-ignore
							if (!filters[f[0]]) filters[f[0]] = {};
							filters[f[0]].saturation = 0;
							filters[f[0]].contrast = (origFilters)
								? origFilters.contrast : 1;
							filters[f[0]].gamma = (origFilters)
								? origFilters.gamma : 1;
							filters[f[0]].brightness = (origFilters)
								? origFilters.brightness : 1;
							filters[f[0]].red = GetPalette(C, faction)[f[1].color].red;
							filters[f[0]].blue = GetPalette(C, faction)[f[1].color].blue;
							filters[f[0]].green = GetPalette(C, faction)[f[1].color].green;
						}
						if (f[1].desaturate) {
							filters[f[0]].saturation = 0;
						}
					}
				}
			}


			MC.addModel(A.Model, filters, A.Property?.LockedBy, A.Properties, A.factionFilters);
		}
	}

	// Update models after adding all of them
	for (let A of appearance) {
		if (A.Model
			&& !A.Model.RemovePoses?.some((removePose) => {return poses[removePose];})
			) {
			MC.updateModel(A.Model.Name);
		}
	}


	for (let m of MC.Models.values()) {
		if (m.AddPose) {
			for (let pose of m.AddPose) {
				MC.Poses[pose] = true;
			}
		}
		if (m.Categories) {
			for (let pose of m.Categories) {
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
function KDGetColorableLayers(Model: Model, Properties: boolean): {name: string, layer: string}[] {
	let ret: {name: string, layer: string}[] = [];
	let dupe: Record<string, boolean> = {};
	for (let layer of Object.values(Model.Layers)) {
		if (layer.InheritColor && !ret.some((ee) => {return ee.name == layer.InheritColor;})) {
			if (!Properties || (Model.Properties && Model.Properties[layer.InheritColor])) {
				if (!dupe[layer.InheritColor]) {
					dupe[layer.InheritColor] = true;
					ret.push({layer: layer.Name, name: layer.InheritColor});
				}
			}

	   }

		if ((!layer.NoColorize || Properties) && (!layer.InheritColor || Properties)) {
			if (!dupe[layer.Name]) {
				dupe[layer.Name] = true;
				ret.push({layer: layer.Name, name: layer.Name});
			}
			if (Properties && (layer.Poses || layer.MorphPoses || layer.GlobalDefaultOverride)) {
				let poses: Record<string, boolean> = {};
				if (layer.Poses)
					for (let pose of Object.keys(layer.Poses)) {
						poses[pose] = true;
					}
				if (layer.MorphPoses)
					for (let pose of Object.entries(layer.MorphPoses)) {
						poses[pose[0]] = true;
						poses[pose[1]] = true;
					}
				for (let key of Object.keys(poses)) {
					if (!dupe[layer.Name + key]) {
						dupe[layer.Name + key] = true;
						ret.push({layer: layer.Name, name: layer.Name + key});
					}
				}
			}
		}
		if (layer.InheritColor && !ret.some((ee) => {return ee.name == layer.InheritColor;})) {
			if (Properties && (layer.Poses || layer.MorphPoses || layer.GlobalDefaultOverride)) {
				let poses: Record<string, boolean> = {};
				if (layer.Poses)
					for (let pose of Object.keys(layer.Poses)) {
						poses[pose] = true;
					}
				if (layer.MorphPoses)
					for (let pose of Object.entries(layer.MorphPoses)) {
						poses[pose[0]] = true;
						poses[pose[1]] = true;
					}
				for (let key of Object.keys(poses)) {
					if (Model.Properties && Model.Properties[layer.InheritColor + key]) {
						if (!dupe[layer.InheritColor + key]) {
							dupe[layer.InheritColor + key] = true;
							ret.push({layer: layer.Name, name: layer.InheritColor + key});
						}
					}

				}
			}
		}
	}

	return ret;
}

function KDGeneratePoseArray(ArmsPose: string | undefined = undefined, LegsPose: string | undefined = undefined, EyesPose: string | undefined = undefined, BrowsPose: string | undefined = undefined, BlushPose: string | undefined = undefined, MouthPose: string | undefined = undefined, Eyes2Pose: string | undefined = undefined, Brows2Pose: string | undefined = undefined, ExtraPose: string | undefined = undefined, FearPose: string | undefined = undefined): {[_: string]: boolean} {
	let poses: {[_: string]: boolean} = {};
	poses[ArmsPose || "Free"] = true;
	poses[LegsPose || "Spread"] = true;
	poses[EyesPose || "EyesNeutral"] = true;
	poses[BrowsPose || "BrowsNeutral"] = true;
	poses[BlushPose || "BlushNone"] = true;
	poses[MouthPose || "MouthNeutral"] = true;
	poses[FearPose || "NoFearPose"] = true;
	poses[(Eyes2Pose || EYE2POSES[EYEPOSES.indexOf(EyesPose)] || "Eyes2Neutral")] = true;
	poses[(Brows2Pose || BROW2POSES[BROWPOSES.indexOf(BrowsPose)] || "Brows2Neutral")] = true;
	if (ExtraPose) {
		for (let p of ExtraPose) {
			poses[p] = true;
		}
	}
	return poses;
}


let PoseCheckArray = {
	Arms: ARMPOSES,
	Legs: LEGPOSES,
	Eyes: EYEPOSES,
	Eyes2: EYE2POSES,
	Brows: BROWPOSES,
	Brows2: BROW2POSES,
	Blush: BLUSHPOSES,
	Mouth: MOUTHPOSES,
	Fear: FEARPOSES,
}

function KDGetPoseOfType(C: Character, Type: string): string {
	let checkArray = PoseCheckArray[Type] || [];
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


interface Hardpoint {
	Parent: string;
	X: number;
	Y: number;
	OffsetX?: number,
	OffsetY?: number,
	Angle: number;
};

function GetModelLoc(C: Character, X: number, Y: number, ZoomInit: number = 1, hp: Hardpoint, Flip: boolean, NoMods: boolean = false) {
	let Zoom = (ZoomInit * MODEL_SCALE) || MODEL_SCALE
	let pos = {x: hp?.X*Zoom || 0, y: hp?.Y*Zoom || 0, angle: hp.Angle};

	let MC = KDCurrentModels.get(C);
	let StartMods = MC.Mods.get(`${X},${Y},${ZoomInit}`);
	let EndMods = MC.EndMods.get(`${X},${Y},${ZoomInit}`);
	let mods = ModelGetPoseMods(MC.Poses);

	for (let m of StartMods) {
		if (!mods[m.Layer]) mods[m.Layer] = [];
		mods[m.Layer].push(m);
	}
	for (let m of EndMods) {
		if (!mods[m.Layer]) mods[m.Layer] = [];
		mods[m.Layer].push(m);
	}
	if (!mods) return pos;

	let transform = new Transform();

	if (!NoMods) {
		let layer = hp.Parent;
		while (layer) {
			let mod_selected: PoseMod[] = mods[layer] || [];
			for (let mod of mod_selected) {
				transform = transform.recursiveTransform(
					mod.offset_x || 0,
				mod.offset_y || 0,
				mod.rotation_x_anchor ? mod.rotation_x_anchor : 0,
				mod.rotation_y_anchor ? mod.rotation_y_anchor : 0,
				mod.scale_x || 1,
				mod.scale_y || 1,
				(mod.rotation * Math.PI / 180) || 0
				);
			}
			layer = LayerProperties[layer]?.Parent;
		}
	}


	// Move the hardpoint
	transform = transform.recursiveTransform(
		hp.X,
		hp.Y,
		0,
		0,
		1,
		1,
		0,
	);

	let ox = transform.ox;
	let oy = transform.oy;
	let ax = transform.ax;
	let ay = transform.ay;
	//let sx = transform.sx;
	//let sy = transform.sy;
	let rot = transform.rot;


	pos.x = ox * Zoom;
	pos.y = oy * Zoom;
	pos.angle += rot;
    pos.x -= (ax - (hp.OffsetX / MODELWIDTH || 0)) * Math.cos(rot) * Zoom;
    pos.y += (ax - (hp.OffsetX / MODELWIDTH || 0)) * Math.sin(rot) * Zoom;
    pos.x -= (ay - (hp.OffsetY / MODELHEIGHT || 0)) * Math.sin(rot) * Zoom;
    pos.y -= (ay - (hp.OffsetY / MODELHEIGHT || 0)) * Math.cos(rot) * Zoom;
    let { X_Offset, Y_Offset } = ModelGetPoseOffsets(MC.Poses, Flip);
    let { rotation, X_Anchor, Y_Anchor } = ModelGetPoseRotation(MC.Poses);
    let pivotx = MODELHEIGHT*0.5 * Zoom * X_Anchor;
    let pivoty = MODELHEIGHT * Zoom * Y_Anchor;
    let lx = pos.x - pivotx;
    let ly = pos.y - pivoty;
    let angle = rotation * Math.PI / 180;
    pos.x = pivotx + (lx) * Math.cos(angle) - (ly) * Math.sin(angle);
    pos.y = pivoty + (ly) * Math.cos(angle) + (lx) * Math.sin(angle);

	pos.angle += angle;

    let xx = (MODELWIDTH * X_Offset) * Zoom + MODEL_XOFFSET*Zoom;
    let yy = (MODELHEIGHT * Y_Offset) * Zoom;

	pos.x += xx;
	pos.y += yy;

	if (Flip) {
		pos.x = (0.5 * MODELHEIGHT) * Zoom - pos.x;
		pos.angle = Math.PI - pos.angle;
	}
	
	pos.x += X;
	pos.y += Y;
	return pos;
}

/** Gets the location of hp (in screen space) on the player model */
function GetModelLocInverse(C: Character, X: number, Y: number, ZoomInit: number = 1,
	hp: Hardpoint, Flip: boolean) {
	let Zoom = 1/((ZoomInit * MODEL_SCALE) || MODEL_SCALE)
	let pos = {x: hp?.X*Zoom || 0, y: hp?.Y*Zoom || 0, angle: hp.Angle};

	if (Flip) {
		pos.x = Zoom*((0.5 * MODELHEIGHT) * MODEL_SCALE - hp?.X);
		pos.angle = Math.PI - pos.angle;
	}

	let MC = KDCurrentModels.get(C);
	let StartMods = MC.Mods.get(`${X},${Y},${ZoomInit}`);
	let EndMods = MC.EndMods.get(`${X},${Y},${ZoomInit}`);
	let mods = ModelGetPoseMods(MC.Poses);

	for (let m of StartMods) {
		if (!mods[m.Layer]) mods[m.Layer] = [];
		mods[m.Layer].push(m);
	}
	for (let m of EndMods) {
		if (!mods[m.Layer]) mods[m.Layer] = [];
		mods[m.Layer].push(m);
	}
	if (!mods) return pos;



    let { X_Offset, Y_Offset } = ModelGetPoseOffsets(MC.Poses, Flip);


    let xx = (MODELWIDTH * X_Offset) + (MODEL_XOFFSET);
    let yy = (MODELHEIGHT * Y_Offset);


	let transform = new Transform(-xx, -yy);

	let callbacks = [];

	let layer = hp.Parent;
	while (layer) {
		let mod_selected: PoseMod[] = mods[layer] || [];
		callbacks.push(() => {
			for (let i = mod_selected.length - 1; i >= 0; i--) {
				let mod = mod_selected[i];
				transform = transform.recursiveTransform(
					mod.offset_x || 0,
				mod.offset_y || 0,
				mod.rotation_x_anchor ? mod.rotation_x_anchor : 0,
				mod.rotation_y_anchor ? mod.rotation_y_anchor : 0,
				mod.scale_x || 1,
				mod.scale_y || 1,
				-(mod.rotation * Math.PI / 180) || 0
				);
			}
		})
		layer = LayerProperties[layer]?.Parent;
	}

	for (let cb of callbacks) {
		cb();
	}

	// Move the hardpoint
	transform = transform.recursiveTransform(
		(Flip ? (0.5 * MODELHEIGHT) * MODEL_SCALE - hp?.X : hp.X) * Zoom,
		hp.Y * Zoom,
		0,
		0,
		1,
		1,
		0,
	);

	let ox = transform.ox;
	let oy = transform.oy;
	let rot = transform.rot;


	pos.x = ox;
	pos.y = oy;
	pos.angle += rot;
    let { rotation, X_Anchor, Y_Anchor } = ModelGetPoseRotation(MC.Poses);
    let pivotx = MODELHEIGHT*0.5 / ZoomInit * X_Anchor;
    let pivoty = MODELHEIGHT / ZoomInit * Y_Anchor;
    let lx = pos.x - pivotx;
    let ly = pos.y - pivoty;
    let angle = -rotation * Math.PI / 180;
    pos.x = pivotx + (lx) * Math.cos(angle) - (ly) * Math.sin(angle);
    pos.y = pivoty + (ly) * Math.cos(angle) + (lx) * Math.sin(angle);

	pos.angle += angle;


	// I give up. Im gonna do it the stupid way.
	let resultingPosition = GetModelLoc(C, X, Y, ZoomInit, {
		X: pos.x,
		Y: pos.y,
		Angle: 0,
		Parent: hp.Parent
	}, Flip);


	/*if (Flip) {
		resultingPosition.x = (0.5 * MODELHEIGHT) * Zoom - resultingPosition.x;
		resultingPosition.angle = Math.PI - resultingPosition.angle;
	}*/
	//let resultingPosition2 = GetModelLoc(C, X, Y, ZoomInit, hp, Flip, true);
	let differencex = (resultingPosition.x - hp.X)*Zoom;
	let differencey = (resultingPosition.y - hp.Y)*Zoom;
	let differencea = Math.PI + resultingPosition.angle; // No idea why this works
	if (Flip) {
		differencex = -differencex;
		differencea = - resultingPosition.angle
	}
	// I have absolutely no idea why this is working. It seems to work in the usercases that I tested
	// If you are doing high-level rendering stuff, you may run into issues stemming from the fact
	// that I have no idea what I am doing
	// cheers
	pos.x += differencex*Math.cos(differencea) + differencey*Math.sin(differencea);
	pos.y += differencey*Math.cos(differencea) - differencex*Math.sin(differencea);
	pos.angle += differencea;


	return pos;
}


function GetHardpointLoc(C: Character, X: number, Y: number, ZoomInit: number = 1, Hardpoint: string, Flip: boolean) {
	return GetModelLoc(C, X, Y, ZoomInit, Hardpoints[Hardpoint], Flip);
}


function DrawModelProcessPoses(MC: ModelContainer, extraPoses: string[], flip: boolean) {
	let flippedPoses = [];
	if (extraPoses) {
		for (let p of extraPoses) {
			if (!MC.Poses[p]) {
				flippedPoses.push(p);
				MC.Poses[p] = true;
			}
		}
	}
	if (flip) {
		flippedPoses.push("Flip");
		MC.Poses["Flip"] = true;
	}
	for (let m of MC.Models.values()) {
		if (m.AddPose) {
			for (let pose of m.AddPose) {
				MC.Poses[pose] = true;
			}
		}
		if (m.Categories) {
			for (let pose of m.Categories) {
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

		if (m.Properties) {
			for (let entry of Object.values(m.Properties)) {
				if (entry.AddPose) {
					for (let pose of entry.AddPose) {
						if (!MC.Poses[pose]) {
							MC.Poses[pose] = true;
						}
					}
				}
			}
		}
	}
	return flippedPoses;
}

function RenderModelContainer(MC: ModelContainer, C: Character, containerID: string) {
	// Rendering is never actually async
	/*if (KDToggles.AsyncRendering && KinkyDungeonDrawState == "Game" && KinkyDungeonState == "Game") {
		if (!RenderCharacterQueue.get(C)) RenderCharacterQueue.set(C, []);
		RenderCharacterQueue.get(C).push(async function() {
			RenderCharacterLock.set(C, true);
			PIXIapp.renderer.render(MC.Containers.get(containerID).Container, {
				clear: true,
				renderTexture: MC.Containers.get(containerID).RenderTexture,
				blit: true,
			});
			RenderCharacterLock.delete(C);
			MC.ForceUpdate.add(containerID);
		});
	} else {*/
	RenderMCSubmeshes(MC, C, containerID);
	PIXIapp.renderer.render(MC.Containers.get(containerID).Container, {
		//blit: true,
		clear: true,
		renderTexture: MC.Containers.get(containerID).RenderTexture,
		blit: true,
	});
	MC.ForceUpdate.add(containerID);
	//}
}


function RenderMCSubmeshes(MC: ModelContainer, C: Character, containerID: string) {
	for (let sm of MC.Containers.get(containerID).Submeshes.entries()) {
		let submesh = sm[1];
		if (submesh.lhash != submesh.hash) {
			PIXIapp.renderer.render(submesh.container, {
				//blit: true,
				clear: true,
				renderTexture: submesh.rt,
				blit: true,
			});
			submesh.lhash = submesh.hash;
		}
		
	}
}



function KDCullModelContainerContainer(MC: ModelContainer, containerID: string) {
	let modified = false;
	let Container = MC.Containers.get(containerID);
	// Cull sprites that weren't drawn yet

	if (!KDlastCull.get(containerID)) KDlastCull.set(containerID, 0);
	let cull = CommonTime() > (KDlastCull.get(containerID) || 0) + KDCULLTIME*100;

	for (let sprite of Container.SpriteList.entries()) {
		if ((!Container.SpritesDrawn.has(sprite[0]) && sprite[1])) {
			if (cull) {
				sprite[1].parent.removeChild(sprite[1]);
				Container.SpriteList.delete(sprite[0]);
				KDSpritesToCull.push(sprite[1]);
			} else sprite[1].visible = false;
			modified = true;
		}// else sprite[1].visible = true;
	}
	if (cull) KDlastCull.set(containerID, CommonTime());
	return modified;
}

function adjustFilter(filter) {
	let f = new PIXI.filters.AdjustmentFilter(filter);

	return f;
}


class Transform {
	ox: number = 0;
	oy: number = 0;
	ax: number = 0;
	ay: number = 0;
	sx: number = 1;
	sy: number = 1;
	rot: number = 0;

	constructor(ox?: number, oy?: number, ax?: number, ay?: number, sx?: number, sy?: number, rot?: number) {
		if (ox) this.ox = ox;
		if (oy) this.oy = oy;
		if (ax) this.ax = ax;
		if (ay) this.ay = ay;
		if (sx) this.sx = sx;
		if (sy) this.sy = sy;
		if (rot) this.rot = rot;
	}

    get() {
		let _ox = -(this.sx*this.ax*Math.cos(this.rot)
			- this.sy*this.ay*Math.sin(this.rot));
		let _oy = -(this.sx*this.ax*Math.sin(this.rot)
			+ this.sy*this.ay*Math.cos(this.rot));

		return {
			x: this.ox + _ox,
			y: this.oy + _oy,
			sx: this.sx,
			sy: this.sy,
			rot: this.rot,
		}
    }

	/** Applies a transformation to the transformation, returning the output*/
	recursiveTransform(ox: number, oy: number, ax: number, ay: number, sx: number, sy: number, rot: number) {
        let _sx = this.sx * sx;
        let _sy = this.sy * sy;

        let _ox = -(_sx*ax*Math.cos(rot)
            - _sy*ay*Math.sin(rot));
        let _oy = -(_sx*ax*Math.sin(rot)
            + _sy*ay*Math.cos(rot));

        // Transform to parent coordinates
        let __ox2 = this.sx*(ox) + _ox;
        let __oy2 = this.sy*(oy) + _oy;


		return new Transform(
			this.ox + (__ox2*Math.cos(this.rot) - __oy2*Math.sin(this.rot)),
			this.oy + (__ox2*Math.sin(this.rot)	+ __oy2*Math.cos(this.rot)),
			0,
			0,
			_sx,
			_sy,
			this.rot + rot,
		);
	}
	/** Applies a transformation to the transformation */
	apply(transform) {
		return this.recursiveTransform(
			transform.ox,
			transform.oy,
			transform.ax,
			transform.ay,
			transform.sx,
			transform.sy,
			transform.rot, )
	}
}

function KDModelIsProtected(m: Model): boolean {
	if (m) {
		// Check if at least one layer is
		if (m.Properties) {
			if (Object.values(m.Properties).some(
				(l) => {
					return l.Protected > 0;
				}
			)) return true;
		}
		// Check base model property
		if (m.Protected) {
			if (m.Properties) {
				if (Object.values(m.Properties).some(
					(l) => {
						return l.Protected < 0;
					}
				)) return false;
			}

			return true;
		}
	}

	return false;
}

function KDContainerClear(Container: ContainerInfo) {
	Container.Mesh.destroy({
		texture: true,
		baseTexture: true,
	});
	Container.Container.destroy();
	Container.RenderTexture.destroy(true);

	for (let submesh of Container.Submeshes.values()) {
		if (!submesh.mesh.destroyed)
			submesh.mesh.destroy({
				texture: true,
				baseTexture: true,
			});
		if (!submesh.container.destroyed)
			submesh.container.destroy();
		
		if (!submesh.rt.destroyed)
			submesh.rt.destroy(true);

	}
	Container.Submeshes.clear();

}

function KDSetFilterSprite(info: {hash: string, filter: PIXIFilter}, sprite: PIXISprite) {
	if (!kdFilterSprites.get(sprite)) {
		kdFilterSprites.set(sprite, []);
		kdFilterSprites.get(sprite).push(info);
	}
	if (sprite.texture) {
		if (!kdFilterSprites.get(sprite.texture)) {
			kdFilterSprites.set(sprite.texture, []);
		}
		kdFilterSprites.get(sprite.texture).push(info);
	}
}

function KDGetLayerFromPri(pri: number): string {
	pri = Math.floor((pri + LAYER_INCREMENT/2)/LAYER_INCREMENT);
	if (ModelLayersLookup.has(pri)) return ModelLayersLookup.get(pri);
	else if (pri < 0) return LAYERS_BASE[LAYERS_BASE.length - 1];
	else return LAYERS_BASE[0];
}
/** can be null */
function KDGetSpriteGroup(pri: number): string {
	let layer = KDGetLayerFromPri(pri);
	return metaLayerReverse[layer];
}

function KDGetStringHash(str: string): number {
	let sum = 0;
	for (let c of str) {
		sum += c.charCodeAt(0);
	}
	return sum;
}

let SubmeshEditorClosest = -1;
let SubmeshEditorClosestDist = 10000;
let SubmeshEditorBuffer: number[] = null;
let SubmeshEditorBufferOrig: number[] = null;