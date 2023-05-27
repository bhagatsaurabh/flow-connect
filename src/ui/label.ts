import { TerminalType } from "../core/terminal.js";
import { Node } from "../core/node.js";
import { UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { binarySearch, exists } from "../utils/utils.js";
import { FlowState } from "../core/flow.js";
import { Align } from "../common/enums.js";

export class Label extends UINode<LabelStyle> {
  style: LabelStyle;

  private displayText: string;
  private _text: string | number;
  private textWidth: number; // This may be smaller due to surrounding width constraints (this is som...)
  private orgTextWidth: number; // While this is the actual width                        (this is some text)
  private textHeight: number;

  get text(): string {
    let value;
    if (this.propName) value = this.getProp();
    else value = this._text;

    if (typeof value === "number") value = this.format(value);
    return value;
  }
  set text(text: string | number) {
    let oldVal = this._text;
    let newVal = text;

    if (this.propName) {
      this.setProp(newVal);
    } else {
      this._text = newVal;
      this.reflow();
    }

    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, newVal);
  }

  constructor(_node: Node, options: LabelOptions) {
    super();

    options = { ...DefaultLabelOptions(), ...options };
    const { style = {} } = options;

    this.style = { ...DefaultLabelStyle(), ...style };
  }

  protected created(options: LabelOptions): void {
    const { text = "Label", input, output, height } = options;

    if (input) {
      const terminal = this.createTerminal(TerminalType.IN, "any");
      terminal.on("connect", (_, connector) => {
        connector.data ?? (this.text = connector.data);
      });
      terminal.on("data", (_, data) => {
        data ?? (this.text = data);
      });
    }
    if (output) {
      const terminal = this.createTerminal(TerminalType.OUT, "string");
      terminal.on("connect", (_, connector) => (connector.data = this.text));
    }

    this._text = this.propName ? this.getProp() : text;
    this.reflow();

    this.height = height ?? this.textHeight + 5;
    if (!this.style.grow) this.width = this.orgTextWidth;

    this.node.on("process", () => this.output?.setData(this.text));
  }

  paint(): void {
    let context = this.context;

    context.fillStyle = this.style.backgroundColor;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);

    context.fillStyle = this.style.color;
    context.font = this.style.fontSize + " " + this.style.font;
    context.textBaseline = "middle";
    let y = this.position.y + this.height / 2;
    let x = this.position.x;
    if (this.style.align === Align.Center) {
      x += this.width / 2 - this.textWidth / 2;
    } else if (this.style.align === Align.Right) {
      x += this.width - this.textWidth - this.style.padding;
    } else {
      x += this.style.padding;
    }

    context.fillText(this.displayText, x, y);
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
    let context = this.context;
    context.font = this.style.fontSize + " " + this.style.font;
    this.orgTextWidth = context.measureText(this.text).width;
    this.displayText = this.getBestFitString();
    let metrics = context.measureText(this.displayText);
    context.font = null;
    this.textWidth = metrics.width;

    this.textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 5;

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
  getBestFitString(): string {
    let text = this.text;
    if (typeof (text as any) !== "string") text = text.toString();

    let width = this.context.measureText(text).width;
    const ellipsis = "…";
    const ellipsisWidth = this.context.measureText(ellipsis).width;
    if (width <= this.width || width <= ellipsisWidth) return text;

    const index = binarySearch({
      max: text.length,
      getValue: (idx: number) => this.context.measureText(text.substring(0, idx)).width,
      match: this.width - ellipsisWidth,
    });

    return text.substring(0, index) + ellipsis;
  }
  format(value: number): string {
    return exists(this.style.precision) ? value.toFixed(this.style.precision) : value.toString();
  }

  onPropChange(_oldVal: any, newVal: any) {
    this._text = newVal;
    this.reflow();

    this.output && this.output.setData(this._text);
  }
}

export interface LabelStyle extends UINodeStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  font?: string;
  align?: Align;
  precision?: number;
  padding?: number;
}
let DefaultLabelStyle = (): LabelStyle => ({
  color: "#000",
  backgroundColor: "transparent",
  fontSize: "11px",
  font: "arial",
  align: Align.Left,
  padding: 0,
});

export interface LabelOptions extends UINodeOptions<LabelStyle> {
  text: string | number;
}
let DefaultLabelOptions = (): LabelOptions => ({
  text: "Label",
});
