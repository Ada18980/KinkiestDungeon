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
	/** Only applied during this pose */
	filter_pose?: string[],
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
	offset_xFlip?: number,
	/** Priority of the offset. Only the highest will offset the character at all*/
	pri_offsetx?: number,
	pri_offsety?: number,
	/** Greedy priority: If this pose isn't the top offset in both x and y, it won't do either*/
	greedy_offset?: boolean,
	/** These are modifications to particular layers, such as the head and anything with the head as parent*/
	mods?: PoseMod[],
	/** If any of these conditions are not met the mods will not be applied */
	greedy_mod_conditions?: PosePriConditions[],
	/** Unless a model specifically lists this pose in GlobalDefaultOverride, it will look for images with this prefix instead*/
	global_default?: string,
	/** Does a model flip*/
	flip?: boolean,

}

interface Model extends Namable {
    /** Name of the model, used to identify */
    Name: string,
    /** Folder to find artwork */
    Folder: string,
    /** Layers themselves */
    Layers: Record<string, ModelLayer>,
    /** Protects from stripping, for hair and such */
    Protected?: boolean,
    /** Protects from stripping AND override, for ears, eyes, tail and such */
    SuperProtected?: boolean,
    /** This is a restraint */
    Restraint?: boolean,
    /** Optional group, for items where there can should only be one (like panties or shoes)*/
    Group?: string,
    /** Removes the model if these poses are present*/
    RemovePoses?: string[],
    /** Optional categories for a model to appear in wardrobe*/
    Categories: string[],
    /** Optional, this appears as a top level item*/
    TopLevel?: boolean,
    /** Optional, this appears under a top level item*/
    Parent?: string,
    /** Adds these as tempposes*/
    AddPose?: string[],
	/** Conditional add pose. They are only added if the specified pose is NOT present */
	AddPoseConditional?: Record<string, string[]>,
	/** Conditional add pose. They are only added if the specified pose is present */
	AddPoseIf?: Record<string, string[]>,
	/** This model hides all items on these layers. Use sparingly */
	HideLayers?: string[],
	/** This model hides all items on these layergroups. Use sparingly */
	HideLayerGroups?: string[],
    /** Default string of colors*/
    DefaultColor?: string[],
	/** Color definition */
	Filters?: Record<string, LayerFilter>,
	/** Color definition */
	Properties?: Record<string, LayerProperties>,
	/** Hardcoded Lock Type */
	LockType?: string,
	/** Hardcoded body filters */
	ImportBodyFilters?: boolean,
}

interface ModelLayer extends Namable {
    /** Name of the layer, used to identify */
    Name: string,
    /** Layer for priority sorting */
    Layer: string,
    /** Custom override for folder */
    Folder?: string,
    /** Priority offset, -499 to 500 */
    Pri?: number,
    /** Name of the sprite PNG, same as the name by default*/
    Sprite?: string,
    /** This layer only appears if the item is locked */
    LockLayer?: boolean,
	/** Changes the layer if a certain pose exists */
	SwapLayerPose?: Record<string, string>,
	/** Prepends a string to the beginning of the layer if a pose is present. Only the first happens */
	PrependLayerPrefix?: Record<string, string>,
	/** Changes the priority if a certain pose exists */
	SwapPriorityPose?: Record<string, number>,
    /** One of these layers is required*/
    Poses?: Record<string, boolean>,
	/** Only displace in these poses */
	DisplacementPoses?: string[],
	/** Adds a displacement map for rope squish and such. If the same sprite is in use it wont be duped*/
	DisplacementSprite?: string,
	/** Which layers to apply displacement to */
	DisplaceLayers?: Record<string, boolean>,
	/** MorphPoses but displacement */
	DisplacementMorph?: Record<string, string>,
	/** Amount of displacement */
	DisplaceAmount?: number,
	DisplaceZBonus?: number,
	/** Prevents displacement maps from applying to this item */
	NoDisplace?: boolean,


	/** [Group, Color] */
	ImportColorFromGroup?: string[],
	/** [Category, Color] */
	ImportColorFromCategory?: string[],

	/** Adds a Erase map for heel deletion and such. If the same sprite is in use it wont be duped*/
	EraseSprite?: string,
	/** Only erase in these poses */
	ErasePoses?: string[],
	/** Which layers to apply Erase to */
	EraseLayers?: Record<string, boolean>,
	/** MorphPoses but Erase */
	EraseMorph?: Record<string, string>,
	/** Amount of Erase */
	EraseAmount?: number,
	EraseZBonus?: number,
	/** Prevents Erase maps from applying to this item */
	NoErase?: boolean,
	/** Invariant displacement */
	EraseInvariant?: boolean,

	/** Hide this item if the specified pose isnt present
	 * 0 - Condition
	 * 1 - Pose to filter off of
	 * 2 - Cancel property
	*/
	HidePoseConditional?: string[][],
    /** These layers are ALL REQUIRED to make it appear*/
    RequirePoses?: Record<string, boolean>,
    /** This layer is hidden in this pose*/
    HidePoses?: Record<string, boolean>,
	/** If one of these poses is present then the layer will default to the relevant pose*/
	MorphPoses?: Record<string, string>,
	/** Overrides globaL_default of the listed poses */
	GlobalDefaultOverride?: Record<string, boolean>,
	/** AppendPose does not apply to the displacement map */
	NoAppendDisplacement?: boolean,
	/** AppendPose does not apply to the erase map */
	NoAppendErase?: boolean,
	/** When this pose is present it appends it to the name. Only one can be appended this way */
	AppendPose?: Record<string, string>,
	/** Lists the poses that can be affected by AppendPose*/
	AppendPoseRequire?: Record<string, boolean>,
	/** Hides when this pose plus the layer name is present. E.g. HidePrefixPose: ["Encase"] will hide EncaseShoeLeft if the layer is on ShoeLeft */
	HidePrefixPose?: string[],
	/** Additional suffixes for HidePrefixPose */
	HidePrefixPoseSuffix?: string[],
	/** This layer gets hidden if something else is higher on the priority list */
	HideWhenOverridden?: boolean,
	/** This is the layer used for HideWhenOverridden rather than the default layer */
	HideOverrideLayer?: string,
	/** This is the layer(s) used for HideWhenOverridden rather than the default layer. Uses layer groups*/
	HideOverrideLayerMulti?: string[],
	/** Only the main override layer is used for hiding THIS item */
	ForceSingleOverride?: boolean,
	/** This makes it so HideOverrideLayer is the layer for overriding purposes. Pair with NoOverride to complete the effect */
	CrossHideOverride?: boolean,
	/** Only overrides if the layer is not hidden.*/
	DontAlwaysOverride?: boolean,
	/** This layer does not affect the max priority level */
	NoOverride?: boolean,
	/** Hide this layer if the other layer does not show */
	TieToLayer?: string,
	/** The name is as is */
	Invariant?: boolean,
	/** Displacement maps are treated as Invariant */
	DisplacementInvariant?: boolean,
	/** Applies this layer's filter to a layer when the filter isn't hidden */
	ApplyFilterToLayerGroup?: Record<string, boolean>,
	/** Which filter to apply */
	ApplyFilter?: string,
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
	/** Increases layer priority but only if the pose is present */
	AddPriWithPose?: Record<string, number>,
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

type LayerProperties = {
    LayerBonus?: number,
    XOffset?: number,
    YOffset?: number,
    XPivot?: number,
    YPivot?: number,
    Rotation?: number,
    XScale?: number,
    YScale?: number,
    SuppressDynamic?: number,
    ExtraHidePoses?: string[],
    ExtraRequirePoses?: string[],
    ExtraHidePrefixPose?: string[],
    ExtraHidePrefixPoseSuffix?: string[],
}

interface Namable {
    Name: string,
}

