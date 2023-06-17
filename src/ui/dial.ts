import { TerminalType } from "../core/terminal.js";
import { Node } from "../core/node.js";
import { Vector } from "../core/vector.js";
import { clamp, denormalize, normalize } from "../utils/utils.js";
import { UIEvent, UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { FlowState } from "../core/flow.js";
import { Constant } from "../resource/constants.js";

export class Dial extends UINode<DialStyle> {
  style: DialStyle;
  min: number;
  max: number;

  private _value: number;
  private thumbStart: Vector = Vector.Zero();
  private thumbEnd: Vector = Vector.Zero();
  private lastAngle: number;
  private deltaValue: number;
  private temp: number;

  get value(): number {
    if (this.propName) return this.getProp();
    return this._value;
  }
  set value(value: number) {
    let oldVal = this.value;
    let newVal = clamp(value, this.min, this.max);

    if (this.propName) this.setProp(newVal);
    else this._value = newVal;

    this.temp = normalize(newVal, this.min, this.max);

    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, newVal);
  }

  constructor(node: Node, options: DialOptions) {
    super();

    options = { ...DefaultDialOptions(node), ...options };
    const { min = 0, max = 100, height = 50 + node.style.padding * 2, style = {}, value = min } = options;

    this.draggable = true;
    this.height = height;
    this.min = min;
    this.max = max;
    this._value = value;
    this.temp = normalize(this._value, min, max);
    this.style = { ...DefaultDialStyle(), ...style };
  }

  protected created(options: DialOptions): void {
    if (options.input) {
      const terminal = this.createTerminal(TerminalType.IN, "number");
      terminal.on("connect", (_, connector) => {
        if (connector.data) this.value = connector.data;
      });
      terminal.on("data", (_, data) => {
        if (data) this.value = data;
      });
    }
    if (options.output) {
      const terminal = this.createTerminal(TerminalType.OUT, "number");
      terminal.on("connect", (_, connector) => (connector.data = this.value));
    }

    this.node.on("process", () => {
      if (this.output) this.output.setData(this.value);
    });
  }

  paint(): void {
    let context = this.context;
    let size = Math.min(this.width, this.height);

    context.fillStyle = this.style.color;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = this.style.borderWidth;
    context.shadowColor = this.style.shadowColor;
    context.shadowBlur = this.style.shadowBlur;
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;
    context.beginPath();
    context.arc(this.position.x + this.width / 2, this.position.y + this.height / 2, size / 2, 0, Constant.TAU);
    context.stroke();
    context.fill();

    context.lineCap = "round";
    context.lineWidth = 10;
    context.strokeStyle = this.style.thumbColor;
    context.shadowColor = this.style.thumbShadowColor;
    context.shadowBlur = this.style.thumbShadowBlur;
    context.beginPath();
    context.moveTo(this.thumbStart.x, this.thumbStart.y);
    context.lineTo(this.thumbEnd.x, this.thumbEnd.y);
    context.stroke();
  }
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = "#000";
    context.fillStyle = this.style.color;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    let context = this.offUIContext;
    let size = Math.min(this.width, this.height);

    context.fillStyle = this.hitColor.hexValue;
    context.beginPath();
    context.arc(this.position.x + this.width / 2, this.position.y + this.height / 2, size / 2, 0, Constant.TAU);
    context.fill();
  }

  reflow(): void {
    let center = this.position.add(this.width / 2, this.height / 2);
    let angle = normalize(this.value, this.min, this.max) * Constant.TAU + Math.PI / 2;
    let size = Math.min(this.width, this.height);
    this.thumbStart.assign(center.x + Math.cos(angle) * (size / 5), center.y + Math.sin(angle) * (size / 5));
    this.thumbEnd.assign(center.x + Math.cos(angle) * (size / 2 - 10), center.y + Math.sin(angle) * (size / 2 - 10));

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
  private pointToValue(position: Vector): number {
    let diff = position.subtract(this.position.add(this.width / 2, this.height / 2));
    let angle = Math.atan2(diff.y, diff.x);
    if (angle < 0) angle += Constant.TAU;
    return (angle / Constant.TAU - 0.25 + 1) % 1;
  }

  onPropChange(_oldVal: any, newVal: any) {
    this._value = newVal;
    this.temp = normalize(newVal, this.min, this.max);
    this.reflow();

    this.output && this.output.setData(this._value);
  }

  onDown(event: UIEvent): void {
    this.lastAngle = undefined;
    this.deltaValue = this.pointToValue(event.realPos);
    this.temp = normalize(this.value, this.min, this.max);
    this.onDrag(event);
  }
  onDrag(event: UIEvent): void {
    let currValue = this.pointToValue(event.realPos);
    let diffValue = currValue - this.deltaValue;
    diffValue = Math.abs(diffValue) > 0.5 ? 0 : diffValue;
    this.deltaValue = currValue;
    this.temp = this.temp + diffValue;
    this.temp = clamp(this.temp, 0, 1);

    let angle = this.temp * Constant.TAU;
    if (angle < 0) angle += Constant.TAU;
    if (typeof this.lastAngle !== "undefined" && Math.abs(this.lastAngle - angle) > 2) {
      angle = this.lastAngle > 3 ? Constant.TAU : 0;
    }
    this.lastAngle = angle;
    let normalizedValue = angle / Constant.TAU;
    this.value = denormalize(clamp(normalizedValue, 0, 1), this.min, this.max);
    this.temp = normalizedValue;
    this.reflow();
  }
  onExit() {
    this.lastAngle = undefined;
  }
}

export interface DialStyle extends UINodeStyle {
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  thumbColor?: string;
  thumbBorderColor?: string;
  thumbBorderWidth?: number;
  thumbShadowColor?: string;
  thumbShadowBlur?: number;
}
const DefaultDialStyle = (): DialStyle => ({
  color: "#e3e3e3",
  borderColor: "#000",
  borderWidth: 1,
  shadowColor: "grey",
  shadowBlur: 5,
  thumbColor: "#c9c9c9",
  thumbShadowColor: "#858585",
  thumbShadowBlur: 5,
});

export interface DialOptions extends UINodeOptions<DialStyle> {
  height: number;
  min: number;
  max: number;
  value?: number;
}
const DefaultDialOptions = (node: Node): DialOptions => ({
  height: 50 + node.style.padding * 2,
  min: 0,
  max: 100,
});
