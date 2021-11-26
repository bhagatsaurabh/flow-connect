import { Color } from "../core/color";
import { ImageStyle, Serializable, SerializedImage } from "../core/interfaces";
import { Node } from "../core/node";
import { Align, Constant, UIType } from "../math/constants";
import { Vector2 } from "../math/vector";
import { imageIcon } from "../resource/icons";
import { Log } from "../utils/logger";
import { UINode } from "./ui-node";

export class Image extends UINode implements Serializable {
  private imageCanvas: OffscreenCanvas | HTMLCanvasElement;
  private source: HTMLImageElement;
  private ratio: number;

  constructor(
    node: Node,
    public sourceString: string,
    propName?: string,
    style: ImageStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Image, false, { ...Constant.DefaultImageStyle(), ...style }, propName, null, null, id, hitColor);
    this.source = document.createElement('img');

    this.source.onload = () => {
      if (typeof OffscreenCanvas !== 'undefined') this.imageCanvas = new OffscreenCanvas(this.source.width, this.source.height);
      else {
        this.imageCanvas = document.createElement('canvas');
        this.imageCanvas.width = this.source.width;
        this.imageCanvas.height = this.source.height;
      }

      let imageContext = this.imageCanvas.getContext('2d');
      imageContext.drawImage(this.source, 0, 0);

      this.ratio = this.source.width / this.source.height;
      this.reflow();
      this.node.ui.update();
    };
    this.source.onerror = (error) => Log.error(error);
    this.source.src = sourceString || imageIcon;
  }

  /** @hidden */
  paint(): void {
    if (this.imageCanvas) {
      let x = this.position.x;
      if (this.source.width < this.node.ui.contentWidth) {
        if (this.style.align === Align.Center) x += this.node.ui.contentWidth / 2 - this.source.width / 2;
        else if (this.style.align === Align.Right) x += + (this.node.ui.contentWidth - this.source.width);
      }
      this.context.drawImage(
        this.imageCanvas, 0, 0, this.source.width, this.source.height,
        x, this.position.y, this.width, this.height
      );
    }
  }
  /** @hidden */
  paintLOD1() {
    if (this.imageCanvas) {
      let x = this.position.x;
      if (this.source.width < this.node.ui.contentWidth) {
        if (this.style.align === Align.Center) x += this.node.ui.contentWidth / 2 - this.source.width / 2;
        else if (this.style.align === Align.Right) x += + (this.node.ui.contentWidth - this.source.width);
      }
      let context = this.context;
      context.fillStyle = 'lightgrey';
      context.strokeStyle = '#000';
      context.fillRect(x, this.position.y, this.width, this.height);
      context.strokeRect(x, this.position.y, this.width, this.height)
    }
  }
  /** @hidden */
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;

    let x = this.position.x;
    if (this.source.width < this.node.ui.contentWidth) {
      if (this.style.align === Align.Center) x += this.node.ui.contentWidth / 2 - this.source.width / 2;
      else if (this.style.align === Align.Right) x += + (this.node.ui.contentWidth - this.source.width);
    }
    this.offUIContext.fillRect(x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  reflow(): void {
    if (!this.source.width || !this.source.height) return;

    if (this.source.width > this.width) {
      this.height = this.width / this.ratio;
    } else {
      this.width = this.source.width;
      this.height = this.source.height;
    }
  }

  /** @hidden */
  onPropChange() { }

  /** @hidden */
  onOver(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('over', this, screenPosition, realPosition);
  }
  /** @hidden */
  onDown(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('down', this, screenPosition, realPosition);
  }
  /** @hidden */
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('up', this, screenPosition, realPosition);
  }
  /** @hidden */
  onClick(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('click', this, screenPosition, realPosition);
  }
  /** @hidden */
  onDrag(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('drag', this, screenPosition, realPosition);
  }
  /** @hidden */
  onEnter(screenPosition: Vector2, realPosition: Vector2) {
    this.call('enter', this, screenPosition, realPosition);
  }
  /** @hidden */
  onExit(screenPosition: Vector2, realPosition: Vector2) {
    this.call('exit', this, screenPosition, realPosition);
  }
  /** @hidden */
  onContextMenu(): void { }

  serialize(): SerializedImage {
    return {
      id: this.id,
      type: this.type,
      hitColor: this.hitColor.serialize(),
      style: this.style,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      source: this.sourceString,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedImage): Image {
    return new Image(node, data.source, data.propName, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}
