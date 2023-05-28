import { Node } from "../core/node.js";
import { TerminalType, SerializedTerminal } from "../core/terminal.js";
import { UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";

export class Display extends UINode<DisplayStyle> {
  style: DisplayStyle;
  displayConfigs: CustomOffCanvasConfig[] = [];

  constructor(_node: Node, options: DisplayOptions = DefaultDisplayOptions()) {
    super();

    options = { ...DefaultDisplayOptions(), ...options };
    const { height, style = {} } = options;

    this.height = height;
    this.draggable = true;
    this.zoomable = true;
    this.style = { ...DefaultDisplayStyle(), ...style };
  }

  protected created(options: DisplayOptions): void {
    options = { ...DefaultDisplayOptions(), ...options };
    const { clear, customRenderers } = options;

    if (clear) {
      const terminal = this.createTerminal(TerminalType.IN, "event");
      terminal.on("event", () => {
        this.displayConfigs
          .filter((config) => !config.rendererConfig.auto)
          .forEach((config) => {
            config.context.clearRect(0, 0, config.canvas.width, config.canvas.height);
          });
      });
    }

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
        const offCanvas = document.createElement("canvas");
        offCanvas.width = this.node.width - 2 * this.node.style.padding;
        offCanvas.height = this.height;

        const offContext = offCanvas.getContext("2d");
        const newOffCanvasConfig = { canvas: offCanvas, context: offContext, rendererConfig, shouldRender: true };
        this.displayConfigs.push(newOffCanvasConfig);
      });
    }

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

    this.input?.position.assign(
      this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius,
      this.position.y + this.height / 2
    );
  }

  onPropChange() {}
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
export type CustomRenderer = (
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number
) => boolean;
export interface CustomRendererConfig {
  auto?: boolean;
  clear?: boolean;
  canvasType?: CanvasType;
  renderer?: CustomRenderer;
}

export interface DisplayStyle extends UINodeStyle {
  borderColor?: string;
  backgroundColor?: string;
}
const DefaultDisplayStyle = (): DisplayStyle => ({
  borderColor: "#000",
});

export interface DisplayOptions extends UINodeOptions<DisplayStyle> {
  height: number;
  customRenderers: CustomRendererConfig[];
  clear?: boolean | SerializedTerminal;
}
const DefaultDisplayOptions = (): DisplayOptions => ({ height: 70, customRenderers: [] });
