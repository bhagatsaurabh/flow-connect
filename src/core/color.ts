import { clamp, getRandom, lerp, normalize } from "../utils/utils.js";
import { Serializable } from "../common/interfaces.js";
import { Log } from "../utils/logger.js";

export class Color implements Serializable {
  hexValue: string;
  rgbaValue: Uint8ClampedArray | number[];
  rgbaString: string;
  rgbaCSSString: string;

  constructor(rgba: Uint8ClampedArray | number[]) {
    this.rgbaValue = rgba;
    this.hexValue = Color.rgbaToHex(this.rgbaValue);
    this.rgbaString = Color.rgbaToString(this.rgbaValue);
    this.rgbaCSSString = Color.rgbaToCSSString(this.rgbaValue);
  }
  isEqual(color: Color) {
    return color.rgbaValue[0] === this.rgbaValue[0]
      && color.rgbaValue[1] === this.rgbaValue[1]
      && color.rgbaValue[2] === this.rgbaValue[2]
      && color.rgbaValue[3] === this.rgbaValue[3];
  }

  static Random(): Color {
    return new Color(new Uint8ClampedArray(
      [Math.floor(getRandom(0, 255)), Math.floor(getRandom(0, 255)), Math.floor(getRandom(0, 255)), 255]
    ));
  }
  static hexToRGBA(hex: string): Uint8ClampedArray {
    return new Uint8ClampedArray([parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), parseInt(hex.slice(7, 9), 16)]);
  }
  private static _componentToHex(c: number) {
    let hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }
  static rgbaToHex(rgba: number[] | Uint8ClampedArray): string {
    return "#" + Color._componentToHex(rgba[0]) + Color._componentToHex(rgba[1]) + Color._componentToHex(rgba[2]) + Color._componentToHex(rgba[3]);
  }
  static rgbaToString(rgba: Uint8ClampedArray | number[]): string {
    return `${rgba[0]}:${rgba[1]}:${rgba[2]}:${rgba[3]}`;
  }
  static rgbaToCSSString(rgba: Uint8ClampedArray | number[]): string {
    return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${normalize(rgba[3], 0, 255).toFixed(3)})`;
  }

  /** A linear interpolator for given array of colors */
  static scale(colors: Color[] | Uint8ClampedArray | string[] | number[][]): (t: number) => string {
    if (!Array.isArray(colors)) {
      Log.error('An array is expected to create a color scale');
      return;
    }
    if (colors.length <= 1) {
      Log.error('At least two colors are required to create a color scale');
      return;
    }

    let colorObjs: Color[] = [];
    if (colors[0] instanceof Uint8ClampedArray || (Array.isArray(colors[0]) && typeof colors[0][0] === 'number')) {
      colors.forEach(color => colorObjs.push(new Color(color as any)));
    } else if (typeof colors[0] === 'string') {
      colors.forEach(color => colorObjs.push(new Color(Color.hexToRGBA(color as any))));
    } else {
      colorObjs = colors as any;
    }

    return (t) => {
      t = clamp(t, 0, 1);

      let index = (colorObjs.length - 1) * t;
      let start = Math.floor(index);
      let end = Math.ceil(index);

      t = index - start;

      let startColor = colorObjs[start], endColor = colorObjs[end];

      let result = startColor.rgbaValue.map((component, i) => {
        component = lerp(component, endColor.rgbaValue[i], t);
        if (i < 3) component = Math.round(component);
        return component;
      });

      return 'rgba(' + result + ')';
    }
  }

  serialize(): SerializedColor {
    return {
      rgba: [this.rgbaValue[0], this.rgbaValue[1], this.rgbaValue[2], this.rgbaValue[3]]
    }
  }
  static deSerialize(data: SerializedColor) {
    return new Color(data.rgba);
  }
}

export interface SerializedColor {
  rgba: number[]
}
