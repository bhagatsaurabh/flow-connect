import { Color } from "../../src/core/color";

describe("Color", () => {
  let toHex = (value: number) => {
    let hex = value.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  describe("Instantiation", () => {
    it("should create a Color instance with correct representations", () => {
      let rgba = [
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
      ];
      let color = Color.create(rgba);

      expect(color).toBeInstanceOf(Color);
      expect(color.rgbaString).toStrictEqual(`${rgba[0]}:${rgba[1]}:${rgba[2]}:${rgba[3]}`);
      expect(color.rgbaCSSString).toStrictEqual(
        `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${(rgba[3] / 255).toFixed(3)})`
      );
      expect(color.hexValue).toStrictEqual(`#${toHex(rgba[0]) + toHex(rgba[1]) + toHex(rgba[2]) + toHex(rgba[3])}`);
    });
  });
  describe("Conversion", () => {
    it("should convert Hex to RGBA and vice-versa", () => {
      let rgba1 = [217, 238, 83, 255];
      let hex = Color.rgbaToHex(rgba1);
      let rgba2 = Color.hexToRGBA(hex);

      expect(rgba2).toBeInstanceOf(Uint8ClampedArray);
      expect(rgba1[0]).toStrictEqual(rgba2[0]);
      expect(rgba1[1]).toStrictEqual(rgba2[1]);
      expect(rgba1[2]).toStrictEqual(rgba2[2]);
      expect(rgba1[3]).toStrictEqual(rgba2[3]);

      let hex1 = "#92b3dde7";
      let rgba = Color.hexToRGBA(hex1);
      let hex2 = Color.rgbaToHex(rgba);

      expect(hex2).toStrictEqual("#92b3dde7");
      expect(hex1).toStrictEqual(hex2);
    });
  });
  describe("Serialization and De-serialization", () => {
    it("should serialize", () => {
      let rgba = [247, 73, 137, 120];
      let color = Color.create(rgba);
      let serializedColor = color.serialize();

      expect(serializedColor).toStrictEqual([rgba[0], rgba[1], rgba[2], rgba[3]]);
    });

    it("should de-serialize", () => {
      let rgba = [247, 73, 137, 120];
      let color = Color.create(rgba);
      let deSerializedColor = Color.create(color.serialize());

      expect(deSerializedColor).not.toBe(color);
      expect(deSerializedColor.rgbaValue).toEqual(color.rgbaValue);
      expect(deSerializedColor.rgbaString).toStrictEqual(color.rgbaString);
      expect(deSerializedColor.rgbaCSSString).toStrictEqual(color.rgbaCSSString);
      expect(deSerializedColor.hexValue).toStrictEqual(color.hexValue);
    });
  });
});
