interface Model extends Namable {
    /** Name of the model, used to identify */
    Name: string,
    /** Folder to find artwork */
    Folder: string,
    /** Layers themselves */
    Layers: Record<string, ModelLayer>,
}

interface ModelLayer extends Namable {
    /** Name of the layer, used to identify */
    Name: string,
    /** Layer for priority sorting */
    Layer: string,
    /** Priority offset */
    Pri?: number,
    /** Name of the sprite PNG, same as the name by default*/
    Sprite?: string,
    /** These layers are apended to the Sprite if the pose is met*/
    Poses?: Record<string, boolean>,
}

interface Namable {
    Name: string,
}