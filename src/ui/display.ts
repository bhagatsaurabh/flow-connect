import { Color } from "../core/color";
import { Serializable } from "../common/interfaces";
import { Node } from "../core/node";
import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal";
import { Vector2 } from "../core/vector";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node";

export class Display extends UINode implements Serializable {
  offCanvases: CustomOffCanvasConfig[] = [];
  manualOffCanvases: CustomOffCanvasConfig[] = [];
  autoOffCanvases: CustomOffCanvasConfig[] = [];

  constructor(
    node: Node,
    height: number,
    customRenderers: CustomRendererConfig[],
    style: DisplayStyle = {},
    id?: string,
    hitColor?: Color,
    clear?: SerializedTerminal
  ) {

    super(
      node, Vector2.Zero(), UIType.Display, true, true, true, { ...DefaultDisplayStyle(), ...style }, null,
      typeof clear !== 'undefined' ?
        Terminal.deSerialize(node, clear) :
        new Terminal(node, TerminalType.IN, 'event', '', {}),
      null, id, hitColor
    );
    this.height = height;
    if (typeof OffscreenCanvas !== 'undefined') {
      customRenderers.forEach(rendererConfig => {
        let offCanvas = new OffscreenCanvas(this.node.width - 2 * this.node.style.padding, this.height);
        let offContext = offCanvas.getContext('2d');
        let newOffCanvasConfig = { canvas: offCanvas, context: offContext, rendererConfig, shouldRender: true }
        if (rendererConfig.type === CustomRendererType.Manual) {
          this.manualOffCanvases.push(newOffCanvasConfig);
        } else {
          this.autoOffCanvases.push(newOffCanvasConfig);
        }
        this.offCanvases.push(newOffCanvasConfig);
      });
    } else {
      customRenderers.forEach(rendererConfig => {
        let offCanvas = document.createElement('canvas');
        offCanvas.width = this.node.width - 2 * this.node.style.padding;
        offCanvas.height = this.height;
        let offContext = offCanvas.getContext('2d');
        let newOffCanvasConfig = { canvas: offCanvas, context: offContext, rendererConfig, shouldRender: true }
        if (rendererConfig.type === CustomRendererType.Manual) {
          this.manualOffCanvases.push(newOffCanvasConfig);
        } else {
          this.autoOffCanvases.push(newOffCanvasConfig);
        }
        this.offCanvases.push(newOffCanvasConfig);
      });
    }

    this.input.on('event', () => {
      this.manualOffCanvases.forEach(offCanvas => {
        offCanvas.context.clearRect(0, 0, offCanvas.canvas.width, offCanvas.canvas.height);
      });
    });

    this.node.flow.flowConnect.on('scale', () => {
      this.reflow();
    });
  }

  private customAutoRender() {
    return Promise.all(this.autoOffCanvases.map(offCanvas => {
      return new Promise<boolean>(resolve => {
        if (offCanvas.shouldRender) {
          offCanvas.context.clearRect(0, 0, offCanvas.canvas.width, offCanvas.canvas.height);
          if (this.style.backgroundColor) {
            offCanvas.context.fillStyle = this.style.backgroundColor;
            offCanvas.context.fillRect(0, 0, offCanvas.canvas.width, offCanvas.canvas.height);
          }
          resolve(
            offCanvas.rendererConfig.renderer(offCanvas.context, offCanvas.canvas.width, offCanvas.canvas.height)
          );
        } else {
          resolve(false);
        }
      });
    }));
  }

  /** @hidden */
  paint(): void {
    let context = this.context;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = 1;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);

    this.customAutoRender().then((results: boolean[]) => {
      results.forEach((result, index) => this.autoOffCanvases[index].shouldRender = result);
    });

    this.offCanvases.forEach(offCanvas => {
      context.drawImage(
        offCanvas.canvas, 0, 0,
        offCanvas.canvas.width, offCanvas.canvas.height,
        this.position.x, this.position.y,
        this.node.width - 2 * this.node.style.padding, this.height
      );
    });
  }
  /** @hidden */
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = this.style.borderColor;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillStyle = 'lightgrey';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  reflow(): void {
    let newWidth = (this.node.width - 2 * this.node.style.padding) * this.node.flow.flowConnect.scale;
    let newHeight = this.height * this.node.flow.flowConnect.scale;

    this.offCanvases.forEach(offCanvas => {
      // Optimization: Do not trigger re-render if width/height is same
      if (Math.floor(offCanvas.canvas.width) !== Math.floor(newWidth) || Math.floor(offCanvas.canvas.height) !== Math.floor(newHeight)) {
        offCanvas.canvas.width = newWidth;
        offCanvas.canvas.height = newHeight;

        if (!offCanvas.shouldRender) {
          offCanvas.rendererConfig.renderer(offCanvas.context, offCanvas.canvas.width, offCanvas.canvas.height);
          offCanvas.shouldRender = false;
        }
      }
    });

    this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
    this.input.position.y = this.position.y + this.height / 2;
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
  onWheel(direction: boolean, screenPosition: Vector2, realPosition: Vector2) {
    this.call('wheel', this, direction, screenPosition, realPosition);
  }
  /** @hidden */
  onContextMenu(): void {
    this.call('rightclick', this);
  }

  serialize(): SerializedDisplay {
    return {
      id: this.id,
      type: this.type,
      hitColor: this.hitColor.serialize(),
      style: this.style,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      height: this.height,
      childs: []
    };
  }
  static deSerialize(node: Node, data: SerializedDisplay): Display {
    return new Display(node, data.height, null, data.style, data.id, Color.deSerialize(data.hitColor), data.input);
  }
}

export enum CustomRendererType {
  Manual,
  Auto
}

export interface CustomOffCanvasConfig {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  rendererConfig: CustomRendererConfig,
  shouldRender: boolean
}

export interface CustomRendererConfig {
  type: CustomRendererType
  renderer?: (context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number) => boolean
};

export interface DisplayStyle extends UINodeStyle {
  borderColor?: string,
  backgroundColor?: string
}

export interface SerializedDisplay extends SerializedUINode {
  height: number
}

/** @hidden */
let DefaultDisplayStyle = () => {
  return {
    borderColor: '#000',
    visible: true
  };
};
