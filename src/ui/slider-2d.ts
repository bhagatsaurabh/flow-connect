import { TerminalType } from "../core/terminal.js";
import { Node } from "../core/node.js";
import { Vector } from "../core/vector.js";
import { UIEvent, UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { Color } from "../core/color.js";
import { FlowState } from "../core/flow.js";
import { Constant } from "../resource/constants.js";
import { clampMin } from "../flow-connect.js";

export class Slider2D extends UINode<Slider2DStyle> {
  style: Slider2DStyle;

  private _value: Vector;
  private thumbHitColor: string;
  offThumbCanvas: OffscreenCanvas | HTMLCanvasElement;
  private offThumbContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

  get value(): Vector {
    if (this.propName) return this.getProp();
    return this._value;
  }
  set value(value: Vector) {
    value = value.clamp(0, 1);

    let oldVal = this.value;
    let newVal = value;

    if (this.propName) this.setProp(newVal);
    else {
      this._value = newVal;
    }
    this.renderOffThumb();

    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, newVal);
  }

  constructor(node: Node, _options: Slider2DOptions = DefaultSlider2DOptions(node)) {
    super();

    this.draggable = true;
  }

  protected created(options: Slider2DOptions): void {
    options = { ...DefaultSlider2DOptions(this.node), ...options };
    const { height, style = {}, value = Vector.create(0.5, 0.5), input, output } = options;

    this.style = { ...DefaultSlider2DStyle(), ...style };
    this.style.pointDiameter = clampMin(this.style.pointDiameter, 5);
    this.height = height ?? this.node.style.rowHeight * 4;
    this._value = this.propName ? this.getProp() : value;
    this._value.clampInPlace(0, 1);

    if (input) {
      const terminal = this.createTerminal(TerminalType.IN, "vector");
      terminal.on("connect", (_, connector) => {
        if (connector.data) this.value = connector.data;
      });
      terminal.on("data", (_, data) => {
        if (data) this.value = data;
      });
    }
    if (output) {
      const terminal = this.createTerminal(TerminalType.OUT, "vector");
      terminal.on("connect", (_, connector) => (connector.data = this.value));
    }

    this.node.on("process", () => {
      this.output?.setData(this.value);
    });

    this.thumbHitColor = Color.Random().hexValue;
    if (typeof OffscreenCanvas !== "undefined") {
      this.offThumbCanvas = new OffscreenCanvas(this.width, this.height);
    } else {
      this.offThumbCanvas = document.createElement("canvas");
      this.offThumbCanvas.width = this.width;
      this.offThumbCanvas.height = this.height;
    }
    this.offThumbContext = this.offThumbCanvas.getContext("2d");
    this.renderOffThumb();
  }

  renderOffThumb() {
    let [width, height] = [this.width - this.style.pointDiameter, this.height - this.style.pointDiameter];
    this.offThumbContext.clearRect(0, 0, width, height);

    let coord = new Vector(this.value.x, 1 - this.value.y).multiply(width, height).add(this.style.pointDiameter / 2);
    this.offThumbContext.fillStyle = this.thumbHitColor;
    this.offThumbContext.beginPath();
    this.offThumbContext.arc(coord.x, coord.y, this.style.pointDiameter / 2, 0, Constant.TAU);
    this.offThumbContext.fill();
  }

  paint(): void {
    let context = this.node.context;

    context.fillStyle = this.style.backgroundColor;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = this.style.borderWidth;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);

    let [width, height] = [this.width - this.style.pointDiameter, this.height - this.style.pointDiameter];
    let point = new Vector(this.value.x, 1 - this.value.y)
      .multiplyInPlace(width, height)
      .addInPlace(this.position)
      .addInPlace(this.style.pointDiameter / 2);

    context.fillStyle = this.style.thumbColor;
    context.beginPath();
    context.arc(point.x, point.y, this.style.pointDiameter / 2, 0, Constant.TAU);
    context.fill();
  }
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = "#000";
    context.fillStyle = this.style.backgroundColor;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    let [newWidth, newHeight] = [this.width, this.height];

    if (
      Math.floor(this.offThumbCanvas.width) !== Math.floor(newWidth) ||
      Math.floor(this.offThumbCanvas.height) !== Math.floor(newHeight)
    ) {
      this.offThumbCanvas.width = newWidth;
      this.offThumbCanvas.height = newHeight;
      this.renderOffThumb();
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
  getHitPoint(realPosition: Vector): boolean {
    let coord = realPosition.subtract(this.position);
    let hitColor = Color.rgbaToHex(this.offThumbContext.getImageData(coord.x, coord.y, 1, 1).data);
    return this.thumbHitColor === hitColor;
  }
  movePoint(realPosition: Vector) {
    let [width, height] = [this.width - this.style.pointDiameter, this.height - this.style.pointDiameter];

    this._value = realPosition
      .clamp(
        this.position.x + this.style.pointDiameter / 2,
        this.position.x + this.width - this.style.pointDiameter / 2,
        this.position.y + this.style.pointDiameter / 2,
        this.position.y + this.height - this.style.pointDiameter / 2
      )
      .subtractInPlace(this.position.add(this.style.pointDiameter / 2))
      .clampInPlace(0, width, 0, height)
      .normalizeInPlace(0, width, 0, height);

    this.value = new Vector(this._value.x, 1 - this._value.y);
  }

  onPropChange(_oldVal: any, newVal: any) {
    this._value = newVal;
    this.renderOffThumb();

    this.output?.setData(this.value);
  }

  private isHit: boolean;
  onUp(): void {
    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, null, this._value);
    this.isHit = false;
  }
  onDrag(event: UIEvent): void {
    this.movePoint(event.realPos);
  }
  onExit(event: UIEvent) {
    if (this.isHit) {
      this.movePoint(event.realPos);
      if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, null, this._value);
    }
    this.isHit = false;
  }
}

export interface Slider2DStyle extends UINodeStyle {
  pointDiameter?: number;
  backgroundColor?: string;
  thumbColor?: string;
  borderColor?: string;
  borderWidth?: number;
}
const DefaultSlider2DStyle = (): Slider2DStyle => ({
  pointDiameter: 20,
  backgroundColor: "#666",
  thumbColor: "#fff",
  borderColor: "#000",
  borderWidth: 1,
});

export interface Slider2DOptions extends UINodeOptions<Slider2DStyle> {
  value?: Vector;
}
const DefaultSlider2DOptions = (node: Node): Slider2DOptions => ({
  value: Vector.create({ x: 0.5, y: 0.5 }),
  height: node.style.rowHeight * 4,
});
