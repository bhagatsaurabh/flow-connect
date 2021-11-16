import { Color } from '../../../../src/core/color';

describe('Color', () => {
  let toHex = (value) => {
    let hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  describe('Instantiation', () => {
    it('should create a Color instance with correct representations', () => {
      let rgba = [
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255)
      ];
      let color = new Color(rgba);

      expect(color).to.be.an.instanceOf(Color);
      expect(color.rgbaString).to.be.equal(`${rgba[0]}:${rgba[1]}:${rgba[2]}:${rgba[3]}`);
      expect(color.rgbaCSSString).to.be.equal(`rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${(rgba[3] / 255).toFixed(3)})`);
      expect(color.hexValue).to.be.equal(`#${toHex(rgba[0]) + toHex(rgba[1]) + toHex(rgba[2]) + toHex(rgba[3])}`);
    });
  });
  describe('Conversion', () => {
    it('should convert Hex to RGBA and vice-versa', () => {
      let rgba1 = [217, 238, 83, 255];
      let hex = Color.rgbaToHex(rgba1);
      let rgba2 = Color.hexToRGBA(hex);

      expect(rgba2).to.be.Uint8ClampedArray();
      expect(rgba1).to.be.equalTo(rgba2);

      let hex1 = "#92b3dde7";
      let rgba = Color.hexToRGBA(hex1);
      let hex2 = Color.rgbaToHex(rgba);

      expect(hex2).to.be.string;
      expect(hex1).to.be.equal(hex2);
    });
  });
  describe('Serialization and De-serialization', () => {
    it('should serialize', () => {
      let rgba = [247, 73, 137, 120];
      let color = new Color(rgba);
      let serializedColor = color.serialize();

      expect(serializedColor).to.deep.equal({
        rgba: [rgba[0], rgba[1], rgba[2], rgba[3]]
      });
    });

    it('should de-serialize', () => {
      let rgba = [247, 73, 137, 120];
      let color = new Color(rgba);
      let deSerializedColor = Color.deSerialize(color.serialize());

      expect(deSerializedColor).to.not.equal(color);
      expect(deSerializedColor.rgbaValue).to.be.equalTo(color.rgbaValue);
      expect(deSerializedColor.rgbaString).to.be.equal(color.rgbaString);
      expect(deSerializedColor.rgbaCSSString).to.be.equal(color.rgbaCSSString);
      expect(deSerializedColor.hexValue).to.be.equal(color.hexValue);
    });
  });
});
