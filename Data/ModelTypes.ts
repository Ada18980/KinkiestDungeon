enum PosePriConditions {
	rotation,
	offset_x,
	offset_y,
	offset_either,
};

type PoseMod = {
	Layer: string,
	offset_x?: number,
	offset_y?: number,
	scale_x?: number,
	scale_y?: number,
	rotation_x_anchor?: number,
	rotation_y_anchor?: number,
	rotation?: number,
};

/** A set of properties for poses */
type PoseProperty = {
	/** How much this pose rotates the player, in degrees */
	rotation?: number,
	rotation_x_anchor?: number,
	rotation_y_anchor?: number,
	/** Priority of the rotation. Only the highest will rotate the character */
	pri_rotation?: number,
	/** The height offset of the pose*/
	offset_y?: number,
	/** The side-to-side offset of the pose*/
	offset_x?: number,
	/** Priority of the offset. Only the highest will offset the character at all*/
	pri_offset?: number,
	/** Greedy priority: If this pose isn't the top offset in both x and y, it won't do either*/
	greedy_offset?: boolean,
	/** These are modifications to particular layers, such as the head and anything with the head as parent*/
	mods?: PoseMod[],
	/** If any of these conditions are not met the mods will not be applied */
	greedy_mod_conditions?: PosePriConditions[],
	/** Unless a model specifically lists this pose in GlobalDefaultOverride, it will look for images with this prefix instead*/
	global_default?: string,
}

interface Model extends Namable {
    /** Name of the model, used to identify */
    Name: string,
    /** Folder to find artwork */
    Folder: string,
    /** Layers themselves */
    Layers: Record<string, ModelLayer>,
    /** Protects from stripping, for ears and tail and such */
    Protected?: boolean,
    /** This is a restraint */
    Restraint?: boolean,
    /** Optional group, for items where there can should only be one (like panties or shoes)*/
    Group?: string,
    /** Optional categories for a model to appear in wardrobe*/
    Categories?: string[],
    /** Optional, this appears as a top level item*/
    TopLevel?: boolean,
    /** Optional, this appears under a top level item*/
    Parent?: string,
    /** Default string of colors*/
    DefaultColor?: string[],
	/** Color definition */
	Filters?: Record<string, LayerFilter>,
}

interface ModelLayer extends Namable {
    /** Name of the layer, used to identify */
    Name: string,
    /** Layer for priority sorting */
    Layer: string,
    /** Priority offset, -499 to 500 */
    Pri?: number,
    /** Name of the sprite PNG, same as the name by default*/
    Sprite?: string,
    /** These layers are apended to the Sprite if the pose is met*/
    Poses?: Record<string, boolean>,
    /** This layer is hidden in this pose*/
    HidePoses?: Record<string, boolean>,
	/** If one of these poses is present then the layer will default to the relevant pose*/
	MorphPoses?: Record<string, string>,
	/** Overrides globaL_default of the listed poses */
	GlobalDefaultOverride?: Record<string, boolean>,
	/** When this pose is present it appends it to the name. Only one can be appended this way */
	AppendPose?: Record<string, boolean>,
	/** Lists the poses that can be affected by AppendPose*/
	AppendPoseRequire?: Record<string, boolean>,
	/** This layer gets hidden if something else is higher on the priority list */
	HideWhenOverridden?: boolean,
	/** This is the layer used for HideWhenOverridden rather than the default layer */
	HideOverrideLayer?: string,
	/** This is the layer(s) used for HideWhenOverridden rather than the default layer */
	HideOverrideLayerMulti?: string[],
	/** This layer does not affect the max priority level */
	NoOverride?: boolean,
	/** Hide this layer if the other layer does not show */
	TieToLayer?: string,
	/** The name is as is */
	Invariant?: boolean,
	/** Disables color filters */
	NoColorize?: boolean,
	/** Inherits colorization from another layer */
	InheritColor?: string,
	/** Offset X */
	OffsetX?: number,
	/** Offset Y */
	OffsetY?: number,
	/** Offset X scale */
	AnchorModX?: number,
	/** Offset Y scale */
	AnchorModY?: number,
}

type LayerFilter = {
    gamma: number;
    saturation: number;
    contrast: number;
    brightness: number;
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

interface Namable {
    Name: string,
}