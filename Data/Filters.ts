// This is based on DisplacementFilter
let erasefragment = `
in vec2 vTextureCoord;
in vec2 vFilterUv;

out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uMapTexture;

uniform vec4 uInputClamp;
uniform highp vec4 uInputSize;
uniform mat2 uRotation;
uniform vec2 uScale;

void main()
{
    vec4 map = texture(uMapTexture, vFilterUv);
    vec4 color = texture(uTexture, vTextureCoord);
    color.rgba *= clamp(map.r, 0., 1.);
    finalColor = color;

}

`;

let erasevertex = `
in vec2 aPosition;
out vec2 vTextureCoord;
out vec2 vFilterUv;


uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

uniform mat3 uFilterMatrix;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;

    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

vec2 getFilterCoord( void )
{
  return ( uFilterMatrix * vec3( filterTextureCoord(), 1.0)  ).xy;
}


void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vFilterUv = getFilterCoord();
}
`;


let erasewgsl = `

struct GlobalFilterUniforms {
    uInputSize:vec4<f32>,
    uInputPixel:vec4<f32>,
    uInputClamp:vec4<f32>,
    uOutputFrame:vec4<f32>,
    uGlobalFrame:vec4<f32>,
    uOutputTexture:vec4<f32>,
  };

  struct DisplacementUniforms {
    uFilterMatrix:mat3x3<f32>,
    uScale:vec2<f32>,
    uRotation:mat2x2<f32>
  };



  @group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
  @group(0) @binding(1) var uTexture: texture_2d<f32>;
  @group(0) @binding(2) var uSampler : sampler;

  @group(1) @binding(0) var<uniform> filterUniforms : DisplacementUniforms;
  @group(1) @binding(1) var uMapTexture: texture_2d<f32>;
  @group(1) @binding(2) var uMapSampler : sampler;

  struct VSOutput {
      @builtin(position) position: vec4<f32>,
      @location(0) uv : vec2<f32>,
      @location(1) filterUv : vec2<f32>,
    };

  fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
  {
      var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

      position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
      position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

      return vec4(position, 0.0, 1.0);
  }

  fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
  {
      return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
  }

  fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
  {
    return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);
  }

  fn getFilterCoord(aPosition:vec2<f32> ) -> vec2<f32>
  {
    return ( filterUniforms.uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
  }

  fn getSize() -> vec2<f32>
  {


    return gfu.uGlobalFrame.zw;
  }

  @vertex
  fn mainVertex(
    @location(0) aPosition : vec2<f32>,
  ) -> VSOutput {
    return VSOutput(
     filterVertexPosition(aPosition),
     filterTextureCoord(aPosition),
     getFilterCoord(aPosition)
    );
  }

  @fragment
  fn mainFragment(
    @location(0) uv: vec2<f32>,
    @location(1) filterUv: vec2<f32>,
    @builtin(position) position: vec4<f32>
  ) -> @location(0) vec4<f32> {

      var map = textureSample(uMapTexture, uMapSampler, filterUv);

      var offset =  gfu.uInputSize.zw * (filterUniforms.uRotation * (map.xy - 0.5)) * filterUniforms.uScale;

      return textureSample(uTexture, uSampler, clamp(uv + offset, gfu.uInputClamp.xy, gfu.uInputClamp.zw));
  }
  `;

/**
 * Options for EraseFilterFilter
 * @memberof filters
 */
interface EraseFilterFilterOptions extends FilterOptions
{
    /** The texture used for the displacement map. */
    sprite: PIXISprite,
    /** The scale of the displacement. */
    scale?: number | PointData,
}

class EraseFilter extends PIXI.Filter
{
    private readonly _sprite: PIXISprite;


    constructor(options: EraseFilterFilterOptions)
    {
        const { sprite, scale: scaleOption, ...rest } = options;
        let scale = scaleOption ?? 100;
        // check if is a number or a point
        if (typeof scale === 'number')
        {
            scale = new PIXI.Point(scale, scale);
        }
        const filterUniforms = new PIXI.UniformGroup({
            uFilterMatrix: { value: new PIXI.Matrix(), type: 'mat3x3<f32>' },
            uScale: { value: scale, type: 'vec2<f32>' },
            uRotation: { value: new Float32Array([0, 0, 0, 0]), type: 'mat2x2<f32>' },
        });
        const glProgram = PIXI.GlProgram.from({
            vertex: erasevertex,
            fragment: erasefragment,
            name: 'erase-filter'
        });


        const gpuProgram = PIXI.GpuProgram.from({
            vertex: {
                source: erasewgsl,
                entryPoint: 'mainVertex',
            },
            fragment: {
                source: erasewgsl,
                entryPoint: 'mainFragment',
            },
        });

        const textureSource = sprite.texture.source;
        super({
            ...rest,
            glProgram,
            resources: {
                filterUniforms,
                uMapTexture: textureSource,
                uMapSampler: textureSource.style,
            },
        });
        this._sprite = options.sprite;
        this._sprite.renderable = false;
    }

    /**
     * Applies the filter.
     * @param filterManager - The manager.
     * @param input - The input target.
     * @param output - The output target.
     * @param clearMode - clearMode.
     */
    public apply(
        filterManager: FilterSystem,
        input: PIXITexture,
        output: PIXITexture,
        clearMode: boolean
    ): void
    {
        const uniforms = this.resources.filterUniforms.uniforms;
        filterManager.calculateSpriteMatrix(
            uniforms.uFilterMatrix,
            this._sprite
        );
        // Extract rotation from world transform
        const wt = this._sprite.worldTransform;
        const lenX = Math.sqrt((wt.a * wt.a) + (wt.b * wt.b));
        const lenY = Math.sqrt((wt.c * wt.c) + (wt.d * wt.d));
        if (lenX !== 0 && lenY !== 0)
        {
            uniforms.uRotation[0] = wt.a / lenX;
            uniforms.uRotation[1] = wt.b / lenX;
            uniforms.uRotation[2] = wt.c / lenY;
            uniforms.uRotation[3] = wt.d / lenY;
        }
        this.resources.uMapTexture = this._sprite.texture.source;
        filterManager.applyFilter(this, input, output, clearMode);
    }
    /** scaleX, scaleY for displacements */
    get scale(): typeof PIXI.Point
    {
        return this.resources.filterUniforms.uniforms.uScale as typeof PIXI.Point;
    }
}