//#region Common

interface String {
	replaceAt(index: number, character: string): string;
}

declare function parseInt(s: string | number, radix?: number): number;

type MemoizedFunction<T extends Function> = T & {
	/** Clears the cache of the memoized function */
	clearCache(): void;
};

// GL shim
interface WebGL2RenderingContext {
	program?: WebGLProgram;
	programFull?: WebGLProgram;
	programHalf?: WebGLProgram;
	textureCache?: Map<string, any>;
	maskCache?: Map<string, any>;
}

interface WebGLProgram {
	u_alpha?: WebGLUniformLocation;
	u_color?: WebGLUniformLocation;
	a_position?: number;
	a_texcoord?: number;
	u_matrix?: WebGLUniformLocation;
	u_texture?: WebGLUniformLocation;
	u_alpha_texture?: WebGLUniformLocation;
	position_buffer?: WebGLBuffer;
	texcoord_buffer?: WebGLBuffer;
}

interface HTMLCanvasElement {
	GL?: WebGL2RenderingContext;
}

interface HTMLImageElement {
	errorcount?: number;
}

interface HTMLElement {
	setAttribute(qualifiedName: string, value: string | number): void;
}

interface RGBColor {
	r: number;
	g: number;
	b: number;
}

interface RGBAColor extends RGBColor {
	a: number;
}
//#endregion




/** An ItemBundle is a minified version of the normal Item */
interface ItemBundle {
	Group: string;
	Name: string;
	Difficulty?: number;
	Color?: ItemColor;
	Property?: any;
	Craft?: any;
}

/** An AppearanceBundle is whole minified appearance of a character */
type AppearanceBundle = ItemBundle[];

type ItemColor = string | string[];

/** An item is a pair of asset and its dynamic properties that define a worn asset. */
interface Item {
	Asset?: any;
	Model?: Model;
	Color?: ItemColor;
	Filters?: Record<string, LayerFilter>;
	Properties?: Record<string, LayerProperties>;
	Difficulty?: number;
	Property?: any;
}

//#region Characters

interface Character {
	ID: number;
	Name: string;
	Appearance: Item[];
	Pose: string[];
	Palette: string;
	HeightRatio?: number;
	HeightModifier: number;
	MemberNumber?: number;
}

interface PlayerCharacter extends Character {
}

//#endregion

//#region Extended items

interface AssetOverrideHeight {
	Height: number;
	Priority: number;
	HeightRatioProportion?: number;
}


type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface ICommand {
	Tag: string;
	Description?: string;
	Reference?: string;
	Action?: (this: Optional<ICommand, 'Tag'>, args: string, msg: string, parsed: string[]) => void
	Prerequisite?: (this: Optional<ICommand, 'Tag'>) => boolean;
	AutoComplete?: (this: Optional<ICommand, 'Tag'>, parsed: string[], low: string, msg: string) => void;
	Clear?: false;
}


// #region Audio

type AudioSoundEffect = [string, number];

interface AudioEffect {
	/** The sound effect name */
	Name: string;

	/** The sound file, or files to choose from randomly */
	File: string | string[];
}


// External globals, added by other libraries
interface Window {
	WebFontConfig: object;
}
