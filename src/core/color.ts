import { getRandom, normalize } from "../utils/utils";
import { Serializable, SerializedColor } from "./interfaces";

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

  serialize(): SerializedColor {
    return {
      rgba: [this.rgbaValue[0], this.rgbaValue[1], this.rgbaValue[2], this.rgbaValue[3]]
    }
  }
  static deSerialize(data: SerializedColor) {
    return new Color(data.rgba);
  }
}
