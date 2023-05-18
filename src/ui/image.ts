import { Color } from "../core/color.js";
import { Serializable } from "../common/interfaces.js";
import { Node } from "../core/node.js";
import { Vector } from "../core/vector.js";
import { imageIcon } from "../resource/icons.js";
import { Log } from "../utils/logger.js";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node.js";
import { Align } from "../common/enums.js";
import { SerializedTerminal, Terminal, TerminalType } from "../core/terminal.js";
import { FlowState } from "../core/flow.js";
import { get } from "../utils/utils.js";

export class Image extends UINode implements Serializable<SerializedImage> {
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

  constructor(node: Node, sourceString: string, options: ImageOptions = DefaultImageOptions()) {
    super(node, Vector.Zero(), UIType.Image, {
      style: options.style ? { ...DefaultImageStyle(), ...options.style } : DefaultImageStyle(),
      propName: options.propName,
      input:
        options.input &&
        (typeof options.input === "boolean"
          ? new Terminal(node, TerminalType.IN, "string", "", {})
          : Terminal.deSerialize(node, options.input)),
      output:
        options.output &&
        (typeof options.output === "boolean"
          ? new Terminal(node, TerminalType.OUT, "string", "", {})
          : Terminal.deSerialize(node, options.output)),
      id: options.id,
      hitColor: options.hitColor,
    });

    this._src = get(sourceString, imageIcon);
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
      this.imageContext = this.imageCanvas.getContext("2d");
    }

    this.source.src = this._src;
  }

  paint(): void {
    if (this.imageCanvas && this.imageCanvas.width > 0 && this.imageCanvas.height > 0) {
      let x = this.position.x;
      if (this.source.width < this.node.ui.contentWidth) {
        if (this.style.align === Align.Center) x += this.node.ui.contentWidth / 2 - this.source.width / 2;
        else if (this.style.align === Align.Right) x += +(this.node.ui.contentWidth - this.source.width);
      }
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
    if (this.source.width < this.node.ui.contentWidth) {
      if (this.style.align === Align.Center) x += this.node.ui.contentWidth / 2 - this.source.width / 2;
      else if (this.style.align === Align.Right) x += +(this.node.ui.contentWidth - this.source.width);
    }
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

    if (this.input) {
      this.input.position.assign(
        this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius,
        this.position.y + this.height / 2
      );
    }
    if (this.output) {
      this.output.position.assign(
        this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius,
        this.position.y + this.height / 2
      );
    }
  }

  onPropChange(_oldVal: any, newVal: any) {
    this._src = newVal;
    this.setupImage();

    this.output && this.output.setData(newVal);
  }
  onOver(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call("over", this, screenPosition, realPosition);
  }
  onDown(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call("down", this, screenPosition, realPosition);
  }
  onUp(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call("up", this, screenPosition, realPosition);
  }
  onClick(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call("click", this, screenPosition, realPosition);
  }
  onDrag(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call("drag", this, screenPosition, realPosition);
  }
  onEnter(screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    this.call("enter", this, screenPosition, realPosition);
  }
  onExit(screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    this.call("exit", this, screenPosition, realPosition);
  }
  onWheel(direction: boolean, screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    this.call("wheel", this, direction, screenPosition, realPosition);
  }
  onContextMenu(): void {
    /**/
  }

  serialize(): SerializedImage {
    return {
      source: this._src,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      style: this.style,
      id: this.id,
      hitColor: this.hitColor.serialize(),
      type: this.type,
      childs: [],
    };
  }
  static deSerialize(node: Node, data: SerializedImage): Image {
    return new Image(node, data.source, {
      propName: data.propName,
      input: data.input,
      output: data.output,
      style: data.style,
      id: data.id,
      hitColor: Color.create(data.hitColor),
    });
  }
}

export interface ImageStyle extends UINodeStyle {
  align?: Align;
}
let DefaultImageStyle = () => {
  return {
    align: Align.Left,
    visible: true,
  };
};

export interface SerializedImage extends SerializedUINode {
  source: string;
}

interface ImageOptions {
  propName?: string;
  input?: boolean | SerializedTerminal;
  output?: boolean | SerializedTerminal;
  style?: ImageStyle;
  id?: string;
  hitColor?: Color;
}
let DefaultImageOptions = (): ImageOptions => {
  return {};
};
