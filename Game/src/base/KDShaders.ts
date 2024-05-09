'use strict';

let KDShaders = {
	DefaultVertex: {
		code: `
		in vec2 aPosition;
		out vec2 vTextureCoord;

		uniform vec4 uInputSize;
		uniform vec4 uOutputFrame;
		uniform vec4 uOutputTexture;

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

		void main(void)
		{
			gl_Position = filterVertexPosition();
			vTextureCoord = filterTextureCoord();
		}
	`
	},

	Darkness: {
		code: `
			in vec2 vTextureCoord;
			out vec4 finalColor;
			uniform sampler2D uTexture;
			uniform float radius;
			uniform float mult;
			uniform float weight;
			uniform float lum_cutoff;
			uniform float lum_cutoff_rate;
			uniform float brightness;
			uniform float brightness_rate;
			uniform float contrast;
			uniform float contrast_rate;


			const float FILTERSIZE = 1.;

			void main()
			{
				vec4 c = texture2d(uTexture, vTextureCoord);

				if (c.a > 0.0) {
					vec3 rgb = c.rgb;
					// Get max luminance around area
					float lum = 0.;
					float lumsum = 0.;

					for (float x = -FILTERSIZE; x <= FILTERSIZE; x++)
						for (float y = -FILTERSIZE; y <= FILTERSIZE; y++) {
							vec4 sample = texture2d(uTexture, vec2(vTextureCoord[0]+x*radius, vTextureCoord[1]+y*radius));
							float value = dot(vec3(1.,1.,1.), sample.rgb);
							lum = max(lum,value);
							lumsum += weight * value;
						}
					lum = max(lum * mult, lumsum);

					if (lum < lum_cutoff) lum = lum_cutoff + lum_cutoff_rate * (lum - lum_cutoff);
					float saturation = min(1., lum);
					rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, min(1., saturation)), contrast + (1. - saturation) * contrast_rate);
					c.rgb = rgb * ((brightness) + (1. - saturation) * brightness_rate);
					c.rgb *= c.a;
				}

				finalColor = c;
			}
			`
	},
	FogFilter: {
		code: `
			in vec2 vTextureCoord;
			out vec4 finalColor;
			uniform sampler2D uTexture;
			uniform sampler2D lightmap;
			uniform float saturation;
			uniform float brightness;
			uniform float brightness_rate;
			uniform float contrast;
			uniform float contrast_rate;

			void main()
			{
				vec4 c = texture(uTexture, vTextureCoord);
				vec4 l = texture(lightmap, vTextureCoord);

				if (c.a > 0.0 && l.a > 0.0) {
					vec3 rgb = c.rgb;
					rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, min(1., saturation)), contrast + (1. - saturation) * contrast_rate);
					c.rgb = rgb * ((brightness) + (1. - saturation) * brightness_rate);
					c.rgb *= c.a;
				}

				finalColor = c;
			}
			`
	},
	MultiplyFilter: {
		code: `
			in vec2 vTextureCoord;
			out vec4 finalColor;
			uniform sampler2D uTexture;
			uniform sampler2D lightmap;

			void main()
			{
				vec4 c = texture(uTexture, vTextureCoord);
				vec4 l = texture(lightmap, vTextureCoord);

				if (c.a > 0.0 && l.a > 0.0) {
					vec3 rgb = c.rgb * l.rgb;
					c.rgb = rgb;
				}

				finalColor = c;
			}
			`
	},
	GammaFilter: {
		code: `
			in vec2 vTextureCoord;
			out vec4 finalColor;
			uniform sampler2D uTexture;

			uniform float gamma;

			void main()
			{
			vec4 c = texture(uTexture, vTextureCoord);

			if (c.a > 0.0) {
				vec3 rgb = pow(c.rgb, vec3(1. / (gamma)));;
				c.rgb = rgb;
			}

			finalColor = c;
			}
			`
	},
	Solid: {
		code: `
			in vec2 vTextureCoord;
			out vec4 finalColor;
			uniform sampler2D uTexture;

			void main()
			{
				vec4 c - texture(uTexture, vTextureCoord);
				if (c.a > 0.0) {
					c.r = 1.;
					c.g = 1.;
					c.b = 1.;
				}
				finalColor = c;
			}
			`
	},
};

