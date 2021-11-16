import { Color } from "../core/color";
import { DisplayStyle, Serializable, SerializedDisplay } from "../core/interfaces";
import { Node } from "../core/node";
import { Constant, UIType } from "../math/constants";
import { Vector2 } from "../math/vector";
import { UINode } from "./ui-node";

export class Display extends UINode implements Serializable {
  customRenderer: (context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number) => void;
  offCanvas: OffscreenCanvas | HTMLCanvasElement;
  offContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private _rendering: boolean = false;

  constructor(
    node: Node,
    height: number,
    renderer: (context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number) => void,
    style: DisplayStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Display, false, { ...Constant.DefaultDisplayStyle(), ...style }, null, null, null, id, hitColor);
    this.customRenderer = renderer;
    this.height = height;
    if (typeof OffscreenCanvas !== 'undefined' && typeof OffscreenCanvasRenderingContext2D !== 'undefined') {
      this.offCanvas = new OffscreenCanvas(this.node.width - 2 * this.node.style.padding, this.height);
      this.offContext = this.offCanvas.getContext('2d');
    } else {
      this.offCanvas = document.createElement('canvas');
      this.offCanvas.width = this.node.width - 2 * this.node.style.padding;
      this.offCanvas.height = this.height;
      this.offContext = this.offCanvas.getContext('2d');
    }
  }

  private customRender() {
    return new Promise<void>(resolve => {
      this.offContext.clearRect(0, 0, this.offCanvas.width, this.offCanvas.height);
      this.customRenderer(this.offContext, this.offCanvas.width, this.offCanvas.height);
      resolve();
    });
  }

  /** @hidden */
  paint(): void {
    let context = this.context;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = 1;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);

    if (!this._rendering) {
      this._rendering = true;
      this.customRender().finally(() => this._rendering = false);
    }

    context.drawImage(
      this.offCanvas, 0, 0,
      this.offCanvas.width, this.offCanvas.height,
      this.position.x, this.position.y,
      this.node.width - 2 * this.node.style.padding, this.height
    );
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
    this.offCanvas.width = this.node.width - 2 * this.node.style.padding;
    this.offCanvas.height = this.height;
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
    return new Display(node, data.height, null, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}
