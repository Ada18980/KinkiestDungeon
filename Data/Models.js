"use strict";

const LAYERS_BASE = [
	"Eyes",
	"Head",
	"Arms",
	"LegLeft",
	"Butt",
	"Torso",
	"LegRight",
	"FootRight",
];

// Constants
/** Internal value for layering */
const LAYER_INCREMENT = 1000;
/** Model scale to UI scalee */
const MODEL_SCALE = 1000/3500;
const MODEL_XOFFSET = Math.floor((500 - 2000 * MODEL_SCALE)/2);

let KDCanvasRenderMap = new Map();
KDCanvasRenderMap.set(KinkyDungeonCanvasPlayer, "temp");

/**
 * Returns a table with the priorities for each layer based on order of the array
 * @param {string[]} layers
 * @returns {Record<string, number>}
 */
function InitLayers(layers) {
	/** @type {Record<string, number>} */
	let table = {};
	let count = 0;
	for (let l of layers) {
		table[l] = count * LAYER_INCREMENT;
		count += 1;
	}
	return table;
}
let ModelLayers = InitLayers(LAYERS_BASE);


/** @type {Record<string, Model>} */
let ModelDefs = {};
/**
 * @param {Model} Model
 */
function AddModel(Model) {
	ModelDefs[Model.Name] = Model;
}

/** @type {Map<Character, ModelContainer>} */
let KDCurrentModels = new Map();

class ModelContainer {
	/**
	 * @param {Character} Character
	 * @param {Map<string, Model>} Models
	 * @param {any} Container
	 * @param {Map<string, any>} SpriteList
	 * @param {Map<string, any>} SpritesDrawn
	 * @param {Record<string, boolean>} Poses
	 */
	constructor(Character, Models, Container, SpriteList, SpritesDrawn, Poses) {
		this.Character = Character;
		this.Container = Container;
		this.SpriteList = SpriteList;
		this.SpritesDrawn = SpritesDrawn;
		this.Models = Models;
		this.Poses = Poses;
	}

	/**
	 * Adds a model to the modelcontainer
	 * @param {Model} Model
	 */
	addModel(Model) {
		this.Models.set(Model.Name, Model);
	}
	/**
	 * Deletes a model to the modelcontainer
	 * @param {string} Model
	 */
	removeModel(Model) {
		this.Models.delete(Model);
	}
}

/**
 * @param {ModelLayer[]} Layers
 * @returns {Record<string, ModelLayer>}
 */
function ToLayerMap(Layers) {
	return ToNamedMap(Layers);
}


/**
 * Refreshes the character if not all images are loaded and draw the character canvas on the main game screen
 * @param {Character} C - Character to draw
 * @param {number} X - Position of the character on the X axis
 * @param {number} Y - Position of the character on the Y axis
 * @param {number} Zoom - Zoom factor
 * @param {boolean} [IsHeightResizeAllowed=true] - Whether or not the settings allow for the height modifier to be applied
 * @param {CanvasRenderingContext2D} [DrawCanvas] - The canvas to draw to; If undefined `MainCanvas` is used
 * @returns {void} - Nothing
 */
function DrawCharacter(C, X, Y, Zoom, IsHeightResizeAllowed, DrawCanvas) {
	/** @type {ModelContainer} */
	let MC = !KDCurrentModels.get(C) ? new ModelContainer(
		C,
		new Map(),
		new PIXI.Container(),
		new Map(),
		new Map(),
		{
			Free: true,
			Spread: true,
		},
	) : KDCurrentModels.get(C);

	// TODO remove test code
	MC.addModel(ModelDefs.Body);

	// Actual loop for drawing the models on the character
	DrawCharacterModels(MC, X, Y, (Zoom * MODEL_SCALE) || MODEL_SCALE);

	// Cull sprites that weren't drawn yet
	for (let sprite of MC.SpriteList.entries()) {
		if (!MC.SpritesDrawn.has(sprite[0]) && sprite[1] && sprite[1].parent == MC.Container) {
			sprite[1].parent.removeChild(sprite[1]);
			MC.SpriteList.delete(sprite[0]);
			sprite[1].destroy();
		}
	}

	// Render the container, committing its image to the screen
	let renderer = DrawCanvas ? (KDCanvasRenderMap.get(DrawCanvas.canvas) || pixirenderer) : pixirenderer;

	if (renderer == "temp") {
		let view = DrawCanvas.canvas;
		renderer = new PIXI.CanvasRenderer({
			// @ts-ignore
			width: view.width,
			// @ts-ignore
			height: view.height,
			view: view,
			antialias: true,
		});
		KDCanvasRenderMap.set(DrawCanvas.canvas, renderer);
	}

	if (renderer) {
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		renderer.render(MC.Container, {
			clear: false,
		});
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
	}

	// Store it in the map so we don't have to create it again
	if (!KDCurrentModels.get(C)) {
		MC.Container.sortableChildren = true;
		KDCurrentModels.set(C, MC);
	}
}
/** Future function */
let DrawModel = DrawCharacter;

/**
 * Setup sprites from the modelcontainer
 * @param {ModelContainer} MC
 */
function DrawCharacterModels(MC, X, Y, Zoom) {
	// We create a list of models to be added
	let Models = new Map(MC.Models.entries());

	// TODO hide, filtering based on pose, etc etc

	// Now that we have the final list of models we do a KDDraw
	for (let m of Models.values()) {
		for (let l of Object.values(m.Layers)) {
			KDDraw(
				MC.Container,
				MC.SpriteList,
				`layer_${m.Name}_${l.Name}`,
				ModelLayerString(m, l, MC.Poses),
				X + MODEL_XOFFSET * Zoom, Y, undefined, undefined,
				undefined, {
					zIndex: -ModelLayers[l.Layer] + (l.Pri || 0),
				}, false,
				MC.SpritesDrawn,
				Zoom
			);
		}
	}
}

/**
 *
 * @param {Model} Model
 * @param {ModelLayer} Layer
 * @param {Record<string, boolean>} Poses
 * @returns {string}
 */
function ModelLayerString(Model, Layer, Poses) {
	return `Data/Models/${Model.Folder}/${LayerSprite(Layer, Poses)}.png`;
}

/**
 * Gets the sprite name for a layer for a given pose
 * @param {ModelLayer} Layer
 * @param {Record<string, boolean>} Poses
 * @returns {string}
 */
function LayerSprite(Layer, Poses) {
	let pose = "";
	if (Layer.Poses) {
		// "" if its a defaultpose
		let cancel = false;
		if (Layer.DefaultPoses) {
			for (let dp of Object.keys(Layer.DefaultPoses)) {
				if (Poses[dp]) {
					cancel = true;
					break;
				}
			}
		}
		// Otherwise we append pose name to layer name
		if (!cancel)
			for (let p of Object.keys(Poses)) {
				if (Layer.Poses[p]) {
					pose = p;
					break;
				}
			}
	}

	return (Layer.Sprite ? Layer.Sprite : Layer.Name) + pose;
}