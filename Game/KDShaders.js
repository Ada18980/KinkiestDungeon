'use strict';

let KDShaders = {
	Kawase: {
		code: `

		varying vec2 vTextureCoord;
		uniform sampler2D uSampler;

		uniform vec2 uOffset;
		uniform vec4 filterClamp;

		void main(void)
		{
			vec4 color = vec4(0.0);

			// Sample top left pixel
			color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));

			// Sample top right pixel
			color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));

			// Sample bottom right pixel
			color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));

			// Sample bottom left pixel
			color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));

			// Average
			color *= 0.25;

			gl_FragColor = color;
		}
		`
	},
	Darkness: {
		code: `
			varying vec2 vTextureCoord;
			uniform sampler2D uSampler;
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

			void main(void)
			{
				vec4 c = texture2D(uSampler, vTextureCoord);

				if (c.a > 0.0) {
					vec3 rgb = c.rgb;
					// Get max luminance around area
					float lum = 0.;
					float lumsum = 0.;

					for (float x = -FILTERSIZE; x <= FILTERSIZE; x++)
						for (float y = -FILTERSIZE; y <= FILTERSIZE; y++) {
							vec4 sample = texture2D(uSampler, vec2(vTextureCoord[0]+x*radius, vTextureCoord[1]+y*radius));
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

				gl_FragColor = c;
			}
			`
	},
	FogFilter: {
		code: `
			varying vec2 vTextureCoord;
			uniform sampler2D uSampler;
			uniform sampler2D lightmap;
			uniform float saturation;
			uniform float brightness;
			uniform float brightness_rate;
			uniform float contrast;
			uniform float contrast_rate;

			void main(void)
			{
				vec4 c = texture2D(uSampler, vTextureCoord);
				vec4 l = texture2D(lightmap, vTextureCoord);

				if (c.a > 0.0 && l.a > 0.0) {
					vec3 rgb = c.rgb;
					rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, min(1., saturation)), contrast + (1. - saturation) * contrast_rate);
					c.rgb = rgb * ((brightness) + (1. - saturation) * brightness_rate);
					c.rgb *= c.a;
				}

				gl_FragColor = c;
			}
			`
	},
	MultiplyFilter: {
		code: `
			varying vec2 vTextureCoord;
			uniform sampler2D uSampler;
			uniform sampler2D lightmap;

			void main(void)
			{
				vec4 c = texture2D(uSampler, vTextureCoord);
				vec4 l = texture2D(lightmap, vTextureCoord);

				if (c.a > 0.0 && l.a > 0.0) {
					vec3 rgb = c.rgb * l.rgb;
					c.rgb = rgb;
				}

				gl_FragColor = c;
			}
			`
	},
	GammaFilter: {
		code: `
			varying vec2 vTextureCoord;
			uniform sampler2D uSampler;
			uniform float gamma[1];

			void main(void)
			{
			vec4 c = texture2D(uSampler, vTextureCoord);

			if (c.a > 0.0) {
				vec3 rgb = pow(c.rgb, vec3(1. / (gamma[0])));;
				c.rgb = rgb;
			}

			gl_FragColor = c;
			}
			`
	},
	Solid: {
		code: `
			varying vec2 vTextureCoord;
			uniform sampler2D uSampler;

			void main(void)
			{
			vec4 c = texture2D(uSampler, vTextureCoord);

			if (c.a > 0.0) {
				c.r = 1.;
				c.g = 1.;
				c.b = 1.;
			}

			gl_FragColor = c;
			}
			`
	},
};