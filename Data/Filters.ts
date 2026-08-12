// This is based on DisplacementFilter


let erasefragment = `

varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform mat2 rotation;
uniform sampler2D uSampler;
uniform sampler2D mapSampler;

uniform highp vec4 inputSize;
uniform vec4 inputClamp;

void main(void)
{
  vec4 map = texture2D(mapSampler, vFilterCoord);
  vec4 color = texture2D(uSampler, vTextureCoord);

  // If map.a == 0 then it will always be 100% alpha
  // If map.a == 1 then it will be map.r alpha
  color.rgba *= clamp(map.r + 1. - map.a, 0., 1.);

  gl_FragColor = color;
}
`;

let erasevertex = `
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
	gl_Position = filterVertexPosition();
	vTextureCoord = filterTextureCoord();
	vFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;
}
`;



let occlusionfragment = `

varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform mat2 rotation;
uniform sampler2D uSampler;
uniform sampler2D mapSampler;

uniform vec2 scale;
uniform highp vec4 inputSize;
uniform vec4 inputClamp;

void main(void)
{
  vec4 map = texture2D(mapSampler, vFilterCoord);
  vec4 mapL = texture2D(mapSampler, clamp(vec2(vFilterCoord.x - 0.01 * scale.x, vFilterCoord.y - 0.005 * scale.y),
        inputClamp.xy,
        inputClamp.zw));
  vec4 mapR = texture2D(mapSampler, clamp(vec2(vFilterCoord.x + 0.01 * scale.x, vFilterCoord.y - 0.005 * scale.y),
        inputClamp.xy,
        inputClamp.zw));
  vec4 colorL = texture2D(uSampler, clamp(vec2(vTextureCoord.x - 0.015 * scale.x, vTextureCoord.y - 0.01 * scale.y),
        inputClamp.xy,
        inputClamp.zw));
  vec4 colorR = texture2D(uSampler, clamp(vec2(vTextureCoord.x + 0.015 * scale.x, vTextureCoord.y - 0.01 * scale.y),
        inputClamp.xy,
        inputClamp.zw));


  vec4 mapU = texture2D(mapSampler, clamp(vec2(vFilterCoord.x, vFilterCoord.y - 0.01 * scale.y),
        inputClamp.xy,
        inputClamp.zw));
  vec4 mapD = texture2D(mapSampler, clamp(vec2(vFilterCoord.x, vFilterCoord.y + 0.01 * scale.y),
        inputClamp.xy,
        inputClamp.zw));
  vec4 colorU = texture2D(uSampler, clamp(vec2(vTextureCoord.x, vTextureCoord.y - 0.015 * scale.y),
        inputClamp.xy,
        inputClamp.zw));
  vec4 colorD = texture2D(uSampler, clamp(vec2(vTextureCoord.x, vTextureCoord.y + 0.015 * scale.y),
        inputClamp.xy,
        inputClamp.zw));

  vec4 color = texture2D(uSampler, vTextureCoord);
  // sorcery
  // I dont even know how this works myself
  color.rgba *= clamp(1.
    - clamp((mapL.a - mapR.a) * abs(1. - colorR.a), 0., 1.)
    - clamp((mapR.a - mapL.a) * abs(1. - colorL.a), 0., 1.)
    - 0.5*clamp((mapU.a - mapD.a) * abs(1. - colorD.a), 0., 1.)
    - 0.5*clamp((mapD.a - mapU.a) * abs(1. - colorU.a), 0., 1.)
    , 0., 1.);

  gl_FragColor = color;
}
`;

let occlusionvertex = `
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
	gl_Position = filterVertexPosition();
	vTextureCoord = filterTextureCoord();
	vFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;
}
`;



let displacefragment = `
varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform vec2 scale;
uniform mat2 rotation;
uniform sampler2D uSampler;
uniform sampler2D mapSampler;

uniform highp vec4 inputSize;
uniform vec4 inputClamp;

void main(void)
{
  vec4 map =  texture2D(mapSampler, vFilterCoord);

map.xy -= 0.5*map.a;
map.xy = scale * inputSize.zw * (rotation * map.xy);

  gl_FragColor = texture2D(uSampler,
    clamp(vec2(vTextureCoord.x + (map.x), vTextureCoord.y + (map.y)),
        inputClamp.xy,
        inputClamp.zw));
}
`;

let displacevertex = `
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
	gl_Position = filterVertexPosition();
	vTextureCoord = filterTextureCoord();
	vFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;
}
`;



let hslfragment = `
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uHue;
uniform float uAlpha;
uniform bool uColorize;
uniform float uSaturation;
uniform float uLightness;
uniform float contrast;

// https://en.wikipedia.org/wiki/Luma_(video)
const vec3 weight = vec3(0.299, 0.587, 0.114);

float getWeightedAverage(vec3 rgb) {
    return rgb.r * weight.r + rgb.g * weight.g + rgb.b * weight.b;
}

// https://gist.github.com/mairod/a75e7b44f68110e1576d77419d608786?permalink_comment_id=3195243#gistcomment-3195243
const vec3 k = vec3(0.57735, 0.57735, 0.57735);

vec3 hueShift(vec3 color, float angle) {
    float cosAngle = cos(angle);
    return vec3(
    color * cosAngle +
    cross(k, color) * sin(angle) +
    k * dot(k, color) * (1.0 - cosAngle)
    );
}

void main()
{
    vec4 color = texture2D(uSampler, vTextureCoord);
    vec4 result = color;

    // colorize
    if (result.a > 0.0) {


        if (uColorize) {
            result.rgb = vec3(getWeightedAverage(result.rgb), 0., 0.);
        }

        // hue
        result.rgb = hueShift(result.rgb, uHue);

        // saturation
        // https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/huesaturation.js
        float average = (result.r + result.g + result.b) / 3.0;

        if (uSaturation > 0.) {
            result.rgb += (average - result.rgb) * (1. - 1. / (1.001 - uSaturation));
        } else {
            result.rgb -= (average - result.rgb) * uSaturation;
        }

        // lightness
        result.rgb /= result.a;
        result.rgb = mix(vec3(.5), result.rgb, contrast);
        result.rgb *= uLightness; //mix(result.rgb, vec3(ceil(uLightness)) * color.a, abs(uLightness));
        result.rgb *= result.a;
    }
    

    // alpha
    gl_FragColor = result * uAlpha;
    
}
`;

let defaultvert = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`

interface HslAdjustmentFilterOptions
{
    hue: number;
    saturation: number;
    lightness: number;
    contrast: number;
    colorize: boolean;
    auto: boolean;
    alpha: number;
}

/**
 * https://github.com/pixijs/filters/blob/v5.x/filters/hsl-adjustment/src/HslAdjustmentFilter.ts
 */
class HSLFilter extends PIXI.Filter
{
    private _hue = 0;

    /** Default values for options. */
    static readonly defaults: HslAdjustmentFilterOptions = {
        /** Hue */
        hue: 0,
        /** Saturation */
        saturation: 0,
        /** Lightness */
        lightness: 0,
        /** Lightness */
        contrast: 1,
        /** Colorize */
        colorize: false,
        /** Auto-hueshift */
        auto: false,
        /** Alpha */
        alpha: 1,
    };

    /**
     * @param options - The optional parameters of the filter.
     * @param {number} [options.hue=0] - The amount of hue in degrees (-180 to 180)
     * @param {number} [options.saturation=0] - The amount of color saturation (-1 to 1)
     * @param {number} [options.lightness=0] - The amount of lightness (-1 to 1)
     * @param {number} [options.contrast=0]
     * @param {boolean} [options.colorize=false] - Whether to colorize the image
     * @param {number} [options.alpha=1] - The amount of alpha (0 to 1)
     */
    constructor(options?: Partial<HslAdjustmentFilterOptions>)
    {
        super(defaultvert, hslfragment);
        const options_: HslAdjustmentFilterOptions = Object.assign({}, HSLFilter.defaults, options);

        Object.assign(this, options_);
    }

    /**
     * Hue (-180 to 180)
     * @default 0
     */
    get hue(): number
    {
        return this._hue;
    }

    set hue(value: number)
    {
        this._hue = value;
        if (this.originalHue == -999) this.originalHue = value;
        this.uniforms.uHue = this._hue * (Math.PI / 180); // convert degrees to radians
    }

    private lastCalcedHue = 0;
    private originalHue = -999;

    /**
     * Applies the filter.
     * @param filterManager - The manager.
     * @param input - The input target.
     * @param output - The output target.
     * @param clearMode - clearMode.
     * @override
     */
    public apply(
        filterManager: PIXIFilterSystem,
        input: PIXIRenderTexture,
        output: PIXIRenderTexture,
        clearMode: PIXICLEAR_MODES,
        state: any
    ): void
    {
        if (!this.uniformGroup?.uniforms || !this.uniforms) {
            KDFilterCacheToDestroy.push(this);
            return;
        }

        //@ts-ignore
        if (this.auto) {
            let ids = state.target?.texture?.textureCacheIds;
            let index = ids ? ids[0] : state.target?.texture;
            let calculated = KDGetDominantColor(state.target?.texture, index);

            if (this.lastCalcedHue != calculated) {
                this.hue = this.originalHue - calculated;
                this.lastCalcedHue = calculated;
            }
        }

        // draw the filter...
        filterManager.applyFilter(this, input, output, clearMode);
    }

    /**
     * Alpha (0-1)
     * @default 1
     */
    get alpha(): number
    {
        return this.uniforms.uAlpha;
    }

    set alpha(value: number)
    {
        this.uniforms.uAlpha = value;
    }
    /**
     * Alpha (0-1)
     * @default 1
     */
    get contrast(): number
    {
        return this.uniforms.contrast;
    }

    set contrast(value: number)
    {
        this.uniforms.contrast = value;
    }

    /**
     * Colorize (render as a single color)
     * @default false
     */
    get colorize(): boolean
    {
        return this.uniforms.uColorize;
    }

    set colorize(value: boolean)
    {
        this.uniforms.uColorize = value;
    }

    /**
     * Lightness (-1 to 1)
     * @default 0
     */
    get lightness(): number
    {
        return this.uniforms.uLightness;
    }

    set lightness(value: number)
    {
        this.uniforms.uLightness = value;
    }

    /**
     * Saturation (-1 to 1)
     * @default 0
     */
    get saturation(): number
    {
        return this.uniforms.uSaturation;
    }

    set saturation(value: number)
    {
        this.uniforms.uSaturation = value;
    }
    
    
}


class EraseFilter extends PIXI.Filter
{
    public maskSprite: ISpriteMaskTarget;
    public maskMatrix: PIXIMatrix;

    /**
     * @param {PIXI.Sprite} sprite - The sprite used for the displacement map. (make sure its added to the scene!)
     * @param scale - The scale of the displacement
     */
    constructor(sprite: ISpriteMaskTarget)
    {
        const maskMatrix = new PIXI.Matrix();

        sprite.renderable = false;

        super(erasevertex, erasefragment, {
            mapSampler: sprite._texture,
            filterMatrix: maskMatrix,
            scale: { x: 1, y: 1 },
            rotation: new Float32Array([1, 0, 0, 1]),
        });

        this.maskSprite = sprite;
        this.maskMatrix = maskMatrix;
    }

    /**
     * Applies the filter.
     * @param filterManager - The manager.
     * @param input - The input target.
     * @param output - The output target.
     * @param clearMode - clearMode.
     */
    public apply(
        filterManager: PIXIFilterSystem,
        input: PIXIRenderTexture,
        output: PIXIRenderTexture,
        clearMode: PIXICLEAR_MODES
    ): void
    {
        if (!this.uniformGroup?.uniforms || !this.uniforms) {
            KDFilterCacheToDestroy.push(this);
            return;
        }
        // fill maskMatrix with _normalized sprite texture coords_
        this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);

        // Extract rotation from world transform
        const wt = this.maskSprite.worldTransform;
        const lenX = Math.sqrt((wt.a * wt.a) + (wt.b * wt.b));
        const lenY = Math.sqrt((wt.c * wt.c) + (wt.d * wt.d));

        if (lenX !== 0 && lenY !== 0)
        {
            this.uniforms.rotation[0] = wt.a / lenX;
            this.uniforms.rotation[1] = wt.b / lenX;
            this.uniforms.rotation[2] = wt.c / lenY;
            this.uniforms.rotation[3] = wt.d / lenY;
        }

        // draw the filter...
        filterManager.applyFilter(this, input, output, clearMode);
    }

    /** The texture used for the displacement map. Must be power of 2 sized texture. */
    get map(): PIXITexture
    {
        return this.uniforms.mapSampler;
    }

    set map(value: PIXITexture)
    {
        this.uniforms.mapSampler = value;
    }
}


class DisplaceFilter extends PIXI.Filter
{
    public maskSprite: ISpriteMaskTarget;
    public maskMatrix: PIXIMatrix;
    public scale: PIXIPoint;

    /**
     * @param {PIXI.Sprite} sprite - The sprite used for the displacement map. (make sure its added to the scene!)
     * @param scale - The scale of the displacement
     */
    constructor(sprite: ISpriteMaskTarget, scale?: number)
    {
        const maskMatrix = new PIXI.Matrix();

        sprite.renderable = false;

        super(displacevertex, displacefragment, {
            mapSampler: sprite._texture,
            filterMatrix: maskMatrix,
            scale: { x: 1, y: 1 },
            rotation: new Float32Array([1, 0, 0, 1]),
        });

        this.maskSprite = sprite;
        this.maskMatrix = maskMatrix;

        if (scale === null || scale === undefined)
        {
            scale = 20;
        }

        /**
         * scaleX, scaleY for displacements
         * @member {PIXI.Point}
         */
        this.scale = new PIXI.Point(scale, scale);
    }

    /**
     * Applies the filter.
     * @param filterManager - The manager.
     * @param input - The input target.
     * @param output - The output target.
     * @param clearMode - clearMode.
     */
    public apply(
        filterManager: PIXIFilterSystem,
        input: PIXIRenderTexture,
        output: PIXIRenderTexture,
        clearMode: PIXICLEAR_MODES
    ): void
    {
        if (!this.uniformGroup?.uniforms || !this.uniforms) {
            KDFilterCacheToDestroy.push(this);
            return;
        }
        // fill maskMatrix with _normalized sprite texture coords_
        this.uniforms.filterMatrix =
            filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);
        this.uniforms.scale.x = this.scale.x;
        this.uniforms.scale.y = this.scale.y;

        // Extract rotation from world transform
        const wt = this.maskSprite.worldTransform;
        const lenX = Math.sqrt((wt.a * wt.a) + (wt.b * wt.b));
        const lenY = Math.sqrt((wt.c * wt.c) + (wt.d * wt.d));

        if (lenX !== 0 && lenY !== 0)
        {
            this.uniforms.rotation[0] = wt.a / lenX;
            this.uniforms.rotation[1] = wt.b / lenX;
            this.uniforms.rotation[2] = wt.c / lenY;
            this.uniforms.rotation[3] = wt.d / lenY;
        }

        // draw the filter...
        filterManager.applyFilter(this, input, output, clearMode);
    }

    /** The texture used for the displacement map. Must be power of 2 sized texture. */
    get map(): PIXITexture
    {
        return this.uniforms.mapSampler;
    }

    set map(value: PIXITexture)
    {
        this.uniforms.mapSampler = value;
    }
}



class OcclusionFilter extends PIXI.Filter
{
    public maskSprite: ISpriteMaskTarget;
    public maskMatrix: PIXIMatrix;
    public scale: PIXIPoint;

    /**
     * @param {PIXI.Sprite} sprite - The sprite used for the displacement map. (make sure its added to the scene!)
     * @param scale - The scale of the displacement
     */
    constructor(sprite: ISpriteMaskTarget, scale?: number)
    {
        const maskMatrix = new PIXI.Matrix();

        sprite.renderable = false;

        super(occlusionvertex, occlusionfragment, {
            mapSampler: sprite._texture,
            filterMatrix: maskMatrix,
            scale: { x: 1, y: 1 },
            rotation: new Float32Array([1, 0, 0, 1]),
        });
        if (scale === null || scale === undefined)
        {
            scale = 20;
        }
        /**
         * scaleX, scaleY for displacements
         * @member {PIXI.Point}
         */
        this.scale = new PIXI.Point(scale, scale);

        this.maskSprite = sprite;
        this.maskMatrix = maskMatrix;
    }

    /**
     * Applies the filter.
     * @param filterManager - The manager.
     * @param input - The input target.
     * @param output - The output target.
     * @param clearMode - clearMode.
     */
    public apply(
        filterManager: PIXIFilterSystem,
        input: PIXIRenderTexture,
        output: PIXIRenderTexture,
        clearMode: PIXICLEAR_MODES
    ): void
    {
        // fill maskMatrix with _normalized sprite texture coords_
        this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);

        // Extract rotation from world transform
        const wt = this.maskSprite.worldTransform;
        const lenX = Math.sqrt((wt.a * wt.a) + (wt.b * wt.b));
        const lenY = Math.sqrt((wt.c * wt.c) + (wt.d * wt.d));

        if (lenX !== 0 && lenY !== 0)
        {
            this.uniforms.rotation[0] = wt.a / lenX;
            this.uniforms.rotation[1] = wt.b / lenX;
            this.uniforms.rotation[2] = wt.c / lenY;
            this.uniforms.rotation[3] = wt.d / lenY;
        }

        // draw the filter...
        filterManager.applyFilter(this, input, output, clearMode);
    }

    /** The texture used for the displacement map. Must be power of 2 sized texture. */
    get map(): PIXITexture
    {
        return this.uniforms.mapSampler;
    }

    set map(value: PIXITexture)
    {
        this.uniforms.mapSampler = value;
    }
}

function KDGetDominantColor(input: PIXIRenderTexture, index: any): number {
    if (!index || index.destroyed) return 0;
    if (KDDominantColorCache.get(index)) {
        KDDominantColorCache.get(index).updated = CommonTime();
        return KDDominantColorCache.get(index).hue;
    }
    let hue = 0;
    let total = 0;

    //@ts-ignore
    if (!input.destroyed && input.baseTexture) {
        //@ts-ignore
        let extracted = PIXIapp.renderer.extract.pixels(input.texture);
        if (extracted) {
            for (let x = input.frame.left; x < input.frame.right; x++) {
                for (let y = input.frame.top; y < input.frame.bottom; y++) {
                    let r = extracted[x + y * input.frame.width];
                    let g = extracted[x + y * input.frame.width] + 1;
                    let b = extracted[x + y * input.frame.width] + 2;
                    let a = extracted[x + y * input.frame.width] + 3;
                    if (a > 0) {
                        let hsl = rgbToHsl(r/255, g/255, b/255);
                        hue += 360 * hsl[2] * Math.max(Math.min(hsl[1], 1), 0);
                        total += a * Math.max(Math.min(hsl[1], 1), 0);
                    }
                    
                }
            }
            if (total > 0)
                hue /= total;
        }
        
    }

    KDDominantColorCache.set(index, {
        hue: hue,
        updated: CommonTime(),
    })
    return KDDominantColorCache.get(index).hue;
}

let KDDominantColorCache: Map<any, {updated: number, hue: number}> = new Map();
let KDDominantColorCacheTime = 10000 * 60;

function KDCullDominantColors() {
    for (let entry of KDDominantColorCache.entries()) {
        if (CommonTime() > KDDominantColorCacheTime + entry[1].updated) {
            KDDominantColorCache.delete(entry[0]);
        }
    }
}