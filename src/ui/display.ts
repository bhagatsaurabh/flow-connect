import { Color } from "../core/color.js";
import { Serializable } from "../common/interfaces.js";
import { Node } from "../core/node.js";
import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal.js";
import { Vector } from "../core/vector.js";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node.js";

export class Display extends UINode implements Serializable<SerializedDisplay> {
  displayConfigs: CustomOffCanvasConfig[] = [];

  constructor(
    node: Node,
    height: number,
    customRenderers: CustomRendererConfig[],
    options: DisplayOptions = DefaultDisplayOptions()
  ) {
    super(node, Vector.Zero(), UIType.Display, {
      draggable: true,
      zoomable: true,
      style: options.style ? { ...DefaultDisplayStyle(), ...options.style } : DefaultDisplayStyle(),
      input:
        options.clear && typeof options.clear !== "boolean"
          ? Terminal.deSerialize(node, options.clear)
          : new Terminal(node, TerminalType.IN, "event", "", {}),
      id: options.id,
      hitColor: options.hitColor,
    });

    this.height = height;

    if (typeof OffscreenCanvas !== "undefined") {
      customRenderers.forEach((rendererConfig) => {
        let offCanvas, offContext, newOffCanvasConfig;
        if (rendererConfig.canvasType === CanvasType.HTMLCanvasElement) {
          offCanvas = document.createElement("canvas");
          offCanvas.width = this.node.width - 2 * this.node.style.padding;
          offCanvas.height = this.height;
        } else {
          offCanvas = new OffscreenCanvas(this.node.width - 2 * this.node.style.padding, this.height);
        }
        offContext = offCanvas.getContext("2d");
        newOffCanvasConfig = { canvas: offCanvas, context: offContext, rendererConfig, shouldRender: true };
        this.displayConfigs.push(newOffCanvasConfig);
      });
    } else {
      customRenderers.forEach((rendererConfig) => {
        let offCanvas = document.createElement("canvas");
        offCanvas.width = this.node.width - 2 * this.node.style.padding;
        offCanvas.height = this.height;
        let offContext = offCanvas.getContext("2d");
        let newOffCanvasConfig = { canvas: offCanvas, context: offContext, rendererConfig, shouldRender: true };
        this.displayConfigs.push(newOffCanvasConfig);
      });
    }

    this.input.on("event", () => {
      this.displayConfigs
        .filter((config) => !config.rendererConfig.auto)
        .forEach((config) => {
          config.context.clearRect(0, 0, config.canvas.width, config.canvas.height);
        });
    });

    this.node.flow.flowConnect.on("scale", () => this.reflow());
  }

  private customRender(canvasConfigs: CustomOffCanvasConfig[]) {
    return Promise.all(
      canvasConfigs.map((config) => {
        return new Promise<boolean>((resolve) => {
          if (config.shouldRender) {
            if (config.rendererConfig.clear) config.context.clearRect(0, 0, config.canvas.width, config.canvas.height);
            if (this.style.backgroundColor) {
              config.context.fillStyle = this.style.backgroundColor;
              config.context.fillRect(0, 0, config.canvas.width, config.canvas.height);
            }
            resolve(config.rendererConfig.renderer(config.context, config.canvas.width, config.canvas.height));
          } else resolve(false);
        });
      })
    );
  }

  paint(): void {
    let context = this.context;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = 1;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);

    let autoOffCanvasConfigs = this.displayConfigs.filter((config) => config.rendererConfig.auto);
    this.customRender(autoOffCanvasConfigs).then((results: boolean[]) => {
      results.forEach((result, index) => (autoOffCanvasConfigs[index].shouldRender = result));
    });

    this.displayConfigs.forEach((offCanvas) => {
      context.drawImage(
        offCanvas.canvas,
        0,
        0,
        offCanvas.canvas.width,
        offCanvas.canvas.height,
        this.position.x,
        this.position.y,
        this.node.width - 2 * this.node.style.padding,
        this.height
      );
    });
  }
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = this.style.borderColor;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillStyle = "lightgrey";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    let newWidth = (this.node.width - 2 * this.node.style.padding) * this.node.flow.flowConnect.scale;
    let newHeight = this.height * this.node.flow.flowConnect.scale;

    this.displayConfigs.forEach((offCanvas) => {
      // Optimization: Do not trigger re-render if width/height is same
      if (
        Math.floor(offCanvas.canvas.width) !== Math.floor(newWidth) ||
        Math.floor(offCanvas.canvas.height) !== Math.floor(newHeight)
      ) {
        offCanvas.canvas.width = newWidth;
        offCanvas.canvas.height = newHeight;

        if (!offCanvas.shouldRender) {
          offCanvas.rendererConfig.renderer(offCanvas.context, offCanvas.canvas.width, offCanvas.canvas.height);
          offCanvas.shouldRender = false;
        }
      }
    });

    this.input.position.assign(
      this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius,
      this.position.y + this.height / 2
    );
  }

  onPropChange() {
    /**/
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
    if (this.disabled) return;

    this.call("rightclick", this);
  }

  async serialize(): Promise<SerializedDisplay> {
    return Promise.resolve<SerializedDisplay>({
      height: this.height,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      id: this.id,
      hitColor: this.hitColor.serialize(),
      style: this.style,
      type: this.type,
      childs: [],
    });
  }
  static async deSerialize(node: Node, data: SerializedDisplay): Promise<Display> {
    return Promise.resolve<Display>(
      new Display(node, data.height, null, {
        style: data.style,
        id: data.id,
        hitColor: Color.create(data.hitColor),
        clear: data.input,
      })
    );
  }
}

export enum CanvasType {
  OffscreenCanvas = "OffscreenCanvas",
  HTMLCanvasElement = "HTMLCanvasElement",
}

export interface CustomOffCanvasConfig {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  rendererConfig: CustomRendererConfig;
  shouldRender: boolean;
}

export interface CustomRendererConfig {
  auto?: boolean;
  clear?: boolean;
  canvasType?: CanvasType;
  renderer?: (
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number
  ) => boolean;
}

export interface DisplayStyle extends UINodeStyle {
  borderColor?: string;
  backgroundColor?: string;
}
let DefaultDisplayStyle = () => {
  return {
    borderColor: "#000",
    visible: true,
  };
};

export interface SerializedDisplay extends SerializedUINode {
  height: number;
}

interface DisplayOptions {
  style?: DisplayStyle;
  id?: string;
  hitColor?: Color;
  clear?: boolean | SerializedTerminal;
}
let DefaultDisplayOptions = () => {
  return {};
};
