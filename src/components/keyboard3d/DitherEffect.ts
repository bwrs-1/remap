import { Effect } from 'postprocessing';
import { Color, Uniform } from 'three';

const fragmentShader = `
uniform vec3 colorLight;
uniform vec3 colorDark;
uniform float scale;
uniform float contrast;
uniform float brightness;

// 8x8 Bayer Matrix
const int bayer8[64] = int[64](
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayer8(vec2 coord) {
  int x = int(mod(coord.x, 8.0));
  int y = int(mod(coord.y, 8.0));
  int index = x + y * 8;
  return float(bayer8[index]) / 64.0;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Luminance calculation
  float luminance = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
  
  // Contrast & brightness tuning
  luminance = clamp((luminance - 0.5) * contrast + 0.5 + brightness, 0.0, 1.0);
  
  // Screen space pixel coordinates scaled for retro pixelated look
  vec2 pixelCoord = gl_FragCoord.xy / max(scale, 1.0);
  float threshold = getBayer8(pixelCoord);
  
  // 2-tone dithering quantization
  vec3 finalColor = luminance < threshold ? colorDark : colorLight;
  
  outputColor = vec4(finalColor, inputColor.a);
}
`;

export interface DitherEffectOptions {
  colorLight?: Color | string;
  colorDark?: Color | string;
  scale?: number;
  contrast?: number;
  brightness?: number;
}

export class DitherEffect extends Effect {
  constructor({
    colorLight = '#ff0000',
    colorDark = '#000000',
    scale = 2.0,
    contrast = 1.2,
    brightness = 0.0,
  }: DitherEffectOptions = {}) {
    super('DitherEffect', fragmentShader, {
      uniforms: new Map<string, Uniform>([
        ['colorLight', new Uniform(new Color(colorLight))],
        ['colorDark', new Uniform(new Color(colorDark))],
        ['scale', new Uniform(scale)],
        ['contrast', new Uniform(contrast)],
        ['brightness', new Uniform(brightness)],
      ]),
    });
  }

  setColorLight(color: Color | string) {
    const c = color instanceof Color ? color : new Color(color);
    (this.uniforms.get('colorLight') as Uniform).value.copy(c);
  }

  setColorDark(color: Color | string) {
    const c = color instanceof Color ? color : new Color(color);
    (this.uniforms.get('colorDark') as Uniform).value.copy(c);
  }

  setScale(scale: number) {
    (this.uniforms.get('scale') as Uniform).value = scale;
  }

  setContrast(contrast: number) {
    (this.uniforms.get('contrast') as Uniform).value = contrast;
  }

  setBrightness(brightness: number) {
    (this.uniforms.get('brightness') as Uniform).value = brightness;
  }
}
