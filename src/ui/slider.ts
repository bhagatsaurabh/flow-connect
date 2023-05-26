import { TerminalType } from "../core/terminal.js";
import { Node } from "../core/node.js";
import { clamp, denormalize, exists, normalize } from "../utils/utils.js";
import { UIEvent, UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { FlowState } from "../core/flow.js";
import { Constant } from "../resource/constants.js";

export class Slider extends UINode<SliderStyle> {
  style: SliderStyle;

  private thumbFill: number;
  private _value: number;
  min: number;
  max: number;

  get value(): number {
    if (this.propName) return this.getProp();
    return this._value;
  }
  set value(value: number) {
    value = clamp(value, this.min, this.max);

    let oldVal = this.value;
    let newVal = value;
    newVal = exists(this.style.precision) ? parseFloat(newVal.toFixed(this.style.precision)) : newVal;

    if (this.propName) this.setProp(newVal);
    else {
      this._value = newVal;
      this.reflow();
    }

    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, newVal);
  }

  constructor(node: Node, _options: SliderOptions = DefaultSliderOptions(node)) {
    super();

    this.draggable = true;
  }

  protected created(options: SliderOptions): void {
    options = { ...DefaultSliderOptions(this.node), ...options };
    const { style = {}, height, min = 0, max = 100, value = min, input, output } = options;

    this.min = min;
    this.max = max;
    this.height = height ?? this.node.style.rowHeight;
    this.style = { ...DefaultSliderStyle(this.node, height), ...style };
    this._value = this.propName ? this.getProp() : value;
    this._value = clamp(this._value, this.min, this.max);

    if (input) {
      const terminal = this.createTerminal(TerminalType.IN, "number");
      terminal.on("connect", (_, connector) => {
        if (connector.data) this.value = connector.data;
      });
      terminal.on("data", (_, data) => {
        if (data) this.value = data;
      });
    }
    if (output) {
      const terminal = this.createTerminal(TerminalType.IN, "number");
      terminal.on("connect", (_, connector) => (connector.data = this.value));
    }

    this.node.on("process", () => {
      this.output?.setData(this.value);
    });
  }

  paint(): void {
    let context = this.context;
    context.lineWidth = this.style.railHeight;
    context.strokeStyle = this.style.color;
    context.lineCap = "butt";

    let start = Math.max(this.position.x, this.position.x + this.thumbFill - 3);
    if (start !== this.position.x) {
      context.beginPath();
      context.moveTo(this.position.x, this.position.y + this.height / 2);
      context.lineTo(start, this.position.y + this.height / 2);
      context.stroke();
    }
    start = Math.min(this.position.x + 2 * this.style.thumbRadius + this.thumbFill + 3, this.position.x + this.width);
    if (start !== this.position.x + this.width) {
      context.beginPath();
      context.moveTo(start, this.position.y + this.height / 2);
      context.lineTo(this.position.x + this.width, this.position.y + this.height / 2);
      context.stroke();
    }

    context.fillStyle = this.style.thumbColor;
    context.beginPath();
    context.arc(
      this.position.x + this.style.thumbRadius + this.thumbFill,
      this.position.y + this.height / 2,
      this.style.thumbRadius,
      0,
      Constant.TAU
    );
    context.fill();
  }
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = "#000";
    context.fillStyle = this.style.color;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    this.thumbFill = denormalize(normalize(this.value, this.min, this.max), 0, this.width - 2 * this.style.thumbRadius);

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
    this._value = newVal;
    this.reflow();

    this.output?.setData(this.value);
  }

  onDrag(event: UIEvent): void {
    let y = this.position.y + this.height / 2 - this.style.railHeight / 2;
    this.thumbFill = event.realPos
      .clamp(this.position.x + this.style.thumbRadius, this.position.x + this.width - this.style.thumbRadius, y, y)
      .subtractInPlace(this.position.x + this.style.thumbRadius, 0).x;

    this.value = denormalize(normalize(this.thumbFill, 0, this.width - 2 * this.style.thumbRadius), this.min, this.max);
  }
}

export interface SliderStyle extends UINodeStyle {
  railHeight?: number;
  thumbRadius?: number;
  color?: string;
  thumbColor?: string;
  precision?: number;
}
const DefaultSliderStyle = (node: Node, height: number): SliderStyle => ({
  color: "#444",
  thumbColor: "#000",
  railHeight: 3,
  thumbRadius: exists(height) ? height / 2 : (node.style.rowHeight * 1.5) / 2,
});

export interface SliderOptions extends UINodeOptions<SliderStyle> {
  min: number;
  max: number;
  value?: number;
}
const DefaultSliderOptions = (node: Node): SliderOptions => ({
  min: 0,
  max: 100,
  height: node.style.rowHeight * 1.5,
});
