import { TerminalType } from "../core/terminal.js";
import { Node } from "../core/node.js";
import { clamp, denormalize, normalize } from "../utils/utils.js";
import { UIEvent, UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";

import { FlowState } from "../core/flow.js";
import { Constant } from "../resource/constants.js";

export class VSlider extends UINode<VSliderStyle> {
  style: VSliderStyle;
  min: number;
  max: number;

  private thumbFill: number;
  private _value: number;

  get value(): number {
    if (this.propName) return this.getProp();
    return this._value;
  }
  set value(value: number) {
    value = clamp(value, this.min, this.max);

    let oldVal = this.value;
    let newVal = value;

    if (this.propName) this.setProp(newVal);
    else {
      this._value = newVal;
      this.reflow();
    }

    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, newVal);
  }

  constructor(node: Node, _options: VSliderOptions = DefaultVSliderOptions(node)) {
    super();

    this.draggable = true;
  }

  protected created(options: VSliderOptions): void {
    options = { ...DefaultVSliderOptions(this.node), ...options };
    const { height, width, style = {}, min = 0, max = 100, value = min, input, output } = options;

    this.min = min;
    this.max = max;
    this.style = { ...DefaultVSliderStyle(this.node, width), ...style };
    this.height = height ?? this.node.style.rowHeight * 5;
    this.width = width ?? this.node.style.rowHeight;
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
    context.lineWidth = this.style.railWidth;
    context.strokeStyle = this.style.color;
    context.lineCap = "butt";

    let start = Math.max(this.position.y, this.position.y + this.thumbFill - 3);
    if (start !== this.position.y) {
      context.beginPath();
      context.moveTo(this.position.x + this.width / 2, this.position.y);
      context.lineTo(this.position.x + this.width / 2, start);
      context.stroke();
    }
    start = Math.min(this.position.y + 2 * this.style.thumbRadius + this.thumbFill + 3, this.position.y + this.height);
    if (start !== this.position.y + this.height) {
      context.beginPath();
      context.moveTo(this.position.x + this.width / 2, start);
      context.lineTo(this.position.x + this.width / 2, this.position.y + this.height);
      context.stroke();
    }

    context.fillStyle = this.style.thumbColor;
    context.beginPath();
    context.arc(
      this.position.x + this.width / 2,
      this.position.y + this.style.thumbRadius + this.thumbFill,
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
    this.thumbFill = denormalize(
      1 - normalize(this.value, this.min, this.max),
      0,
      this.height - 2 * this.style.thumbRadius
    );

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
    let x = this.position.x + this.width / 2 - this.style.railWidth / 2;
    this.thumbFill = event.realPos
      .clamp(x, x, this.position.y + this.style.thumbRadius, this.position.y + this.height - this.style.thumbRadius)
      .subtractInPlace(0, this.position.y + this.style.thumbRadius).y;

    this.value = denormalize(
      1 - normalize(this.thumbFill, 0, this.height - 2 * this.style.thumbRadius),
      this.min,
      this.max
    );
  }
}

export interface VSliderStyle extends UINodeStyle {
  railWidth?: number;
  thumbRadius?: number;
  color?: string;
  thumbColor?: string;
}
const DefaultVSliderStyle = (node: Node, width: number): VSliderStyle => ({
  color: "#444",
  thumbColor: "#000",
  railWidth: 4,
  thumbRadius: typeof width !== "undefined" ? width / 2 : (node.style.rowHeight * 1.5) / 2,
});

export interface VSliderOptions extends UINodeOptions<VSliderStyle> {
  min: number;
  max: number;
  value?: number;
  width?: number;
}
const DefaultVSliderOptions = (node: Node): VSliderOptions => {
  return {
    min: 0,
    max: 100,
    value: 0,
    width: node.style.rowHeight,
    height: node.style.rowHeight * 5,
  };
};
