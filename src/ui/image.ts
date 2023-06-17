import { Node } from "../core/node.js";
import { imageIcon } from "../resource/icons.js";
import { Log } from "../utils/logger.js";
import { UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { Align } from "../common/enums.js";
import { FlowState } from "../core/flow.js";

export class Image extends UINode<ImageStyle> {
  style: ImageStyle;

  private imageCanvas: OffscreenCanvas | HTMLCanvasElement;
  private imageContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private source: HTMLImageElement;
  private ratio: number;
  private _src: string;

  get src(): string {
    if (this.propName) return this.getProp();
    return this._src;
  }
  set src(src: string) {
    let oldVal = this._src;
    let newVal = src;

    if (this.propName) this.setProp(newVal);
    else this._src = newVal;
    this.setupImage();

    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, newVal);
  }

  constructor(_node: Node, _options: ImageOptions = DefaultImageOptions()) {
    super();
  }

  protected created(options: ImageOptions): void {
    options = { ...DefaultImageOptions(), ...options };
    const { style, src } = options;

    this.style = { ...DefaultImageStyle(), ...style };

    this._src = src ?? imageIcon;
    this.setupImage();
  }

  setupImage() {
    if (!this.source) {
      this.source = document.createElement("img");
      this.source.onerror = (error) => Log.error(error);
      this.source.onload = () => {
        this.imageCanvas.width = this.source.width;
        this.imageCanvas.height = this.source.height;

        this.imageContext.drawImage(this.source, 0, 0);
        this.ratio = this.source.width / this.source.height;
        this.reflow();
        this.node.ui.update();
      };
    }
    if (!this.imageCanvas) {
      if (typeof OffscreenCanvas !== "undefined") this.imageCanvas = new OffscreenCanvas(0, 0);
      else {
        this.imageCanvas = document.createElement("canvas");
        this.imageCanvas.width = 0;
        this.imageCanvas.height = 0;
      }
      this.imageContext = this.imageCanvas.getContext("2d") as any;
    }

    this.source.src = this._src;
  }

  paint(): void {
    if (this.imageCanvas && this.imageCanvas.width > 0 && this.imageCanvas.height > 0) {
      let x = this.position.x;
      /* if (this.source.width < this.node.ui.contentWidth) {
        if (this.style.align === Align.Center) x += this.node.ui.contentWidth / 2 - this.source.width / 2;
        else if (this.style.align === Align.Right) x += this.node.ui.contentWidth - this.source.width;
      } */
      this.context.drawImage(
        this.imageCanvas,
        0,
        0,
        this.source.width,
        this.source.height,
        x,
        this.position.y,
        this.source.width < this.width ? this.source.width : this.width,
        this.height
      );
    }
  }
  paintLOD1() {
    if (this.imageCanvas) {
      let x = this.position.x;
      if (this.source.width < this.node.ui.contentWidth) {
        if (this.style.align === Align.Center) x += this.node.ui.contentWidth / 2 - this.source.width / 2;
        else if (this.style.align === Align.Right) x += +(this.node.ui.contentWidth - this.source.width);
      }
      let context = this.context;
      context.fillStyle = "lightgrey";
      context.strokeStyle = "#000";
      context.fillRect(
        x,
        this.position.y,
        this.source.width < this.width ? this.source.width : this.width,
        this.height
      );
      context.strokeRect(
        x,
        this.position.y,
        this.source.width < this.width ? this.source.width : this.width,
        this.height
      );
    }
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;

    let x = this.position.x;
    /* if (this.source.width < this.node.ui.contentWidth) {
      if (this.style.align === Align.Center) x += this.node.ui.contentWidth / 2 - this.source.width / 2;
      else if (this.style.align === Align.Right) x += +(this.node.ui.contentWidth - this.source.width);
    } */
    this.offUIContext.fillRect(
      x,
      this.position.y,
      this.source.width < this.width ? this.source.width : this.width,
      this.height
    );
  }

  reflow(): void {
    if (!this.source.width || !this.source.height) return;

    if (this.source.width > this.width) {
      this.height = this.width / this.ratio;
    } else {
      this.width = this.source.width;
      this.height = this.source.height;
    }
  }

  onPropChange() {}
}

export interface ImageStyle extends UINodeStyle {
  align?: Align;
}
const DefaultImageStyle = (): ImageStyle => ({
  align: Align.Left,
});

export interface ImageOptions extends UINodeOptions<ImageStyle> {
  src?: string;
}
const DefaultImageOptions = (): ImageOptions => ({});
