import { Node } from "../core/node.js";
import { Label, LabelOptions } from "./label.js";
import { UIEvent, UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { Constant } from "../resource/constants.js";
import { FlowState } from "../core/flow.js";
import { Align } from "../common/enums.js";
import { TerminalType } from "../flow-connect.js";

export class Select extends UINode<SelectStyle> {
  style: SelectStyle;

  values: string[];
  label: Label;
  private _selected: string;

  get selected(): string {
    if (this.propName) {
      let value = this.getProp();
      let slctdVal = this.values.includes(value) ? value : this.values[0];
      value = this.values.length === 0 ? "None" : slctdVal;
      return value;
    }
    return this._selected;
  }
  set selected(selected: string) {
    let slctdVal = this.values.includes(selected) ? selected : this.values[0];

    let oldVal = this.selected;
    let newVal = this.values.length === 0 ? "None" : slctdVal;

    if (this.propName) this.setProp(newVal);
    else {
      this._selected = newVal;
      this.label.text = newVal;
    }
    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, newVal);
  }

  constructor(node: Node, _options: SelectOptions = DefaultSelectOptions(node)) {
    super();
  }

  protected created(options: SelectOptions): void {
    options = { ...DefaultSelectOptions(this.node), ...options };
    const { height, style = {}, values = ["Option1", "Option2"], selected = values[0], input, output } = options;

    this.values = values;
    this.style = { ...DefaultSelectStyle(), ...style };
    this.height = height ?? this.node.style.rowHeight;
    this._selected = selected ?? this.values[0];

    this.label = this.node.createUI<Label, LabelOptions>("core/label", {
      text: this.selected,
      style: { align: Align.Center, ...this.style },
      height: this.height,
    });
    this.children.push(this.label);

    if (input) {
      const terminal = this.createTerminal(TerminalType.IN, "any");
      terminal.on("connect", (_, connector) => {
        if (typeof connector.data === "number") this.selected = this.values[connector.data];
        else if (typeof connector.data === "string") this.selected = connector.data;
      });
      terminal.on("data", (_, data) => {
        if (typeof data === "number") this.selected = this.values[data];
        else if (typeof data === "string") this.selected = data;
      });
    }
    if (output) {
      const terminal = this.createTerminal(TerminalType.OUT, "string");
      terminal.on("connect", (_, connector) => (connector.data = this.selected));
    }

    this.node.on("process", () => {
      this.output?.setData(this.selected);
    });
  }

  paint(): void {
    let context = this.context;
    context.fillStyle = this.style.arrowColor;
    context.beginPath();
    context.moveTo(this.position.x, this.position.y + this.height / 2);
    context.lineTo(this.position.x + this.height * Constant.SIN_60, this.position.y);
    context.lineTo(this.position.x + this.height * Constant.SIN_60, this.position.y + this.height);
    context.lineTo(this.position.x, this.position.y + this.height / 2);
    context.closePath();
    context.fill();

    context.fillStyle = this.style.arrowColor;
    context.beginPath();
    context.moveTo(this.position.x + this.width, this.position.y + this.height / 2);
    context.lineTo(this.position.x + this.width - this.height * Constant.SIN_60, this.position.y);
    context.lineTo(this.position.x + this.width - this.height * Constant.SIN_60, this.position.y + this.height);
    context.lineTo(this.position.x + this.width, this.position.y + this.height / 2);
    context.closePath();
    context.fill();
  }
  paintLOD1() {
    let context = this.context;
    context.fillStyle = this.style.arrowColor;
    context.strokeStyle = "#000";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    this.label.width = this.width * 0.7;
    this.label.position.assign(
      this.position.x + this.width * 0.15,
      this.position.y + this.height / 2 - this.label.height / 2
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

  onPropChange(_oldVal: any, newValue: any) {
    let slctdVal = this.values.includes(newValue) ? newValue : this.values[0];
    let value = this.values.length === 0 ? "None" : slctdVal;
    this._selected = value;
    this.label.text = this._selected;

    this.output?.setData(this.selected);
  }

  onClick(event: UIEvent): void {
    if (this.values.length === 0) return;
    let direction;
    if (event.realPos.x < this.position.x + this.width * 0.15) {
      direction = -1;
    } else if (event.realPos.x > this.position.x + this.width * 0.85) {
      direction = 1;
    } else return;

    let length = this.values.length;
    this.selected = this.values[(((this.values.indexOf(this.selected) + direction) % length) + length) % length];
    this.label.text = this.selected;
  }
}

export interface SelectStyle extends UINodeStyle {
  font?: string;
  fontSize?: string;
  color?: string;
  arrowColor?: string;
}
const DefaultSelectStyle = (): SelectStyle => ({
  arrowColor: "#000",
});

export interface SelectOptions extends UINodeOptions<SelectStyle> {
  values: string[];
  selected?: string;
}
const DefaultSelectOptions = (node: Node): SelectOptions => ({
  values: ["Option1", "Option2"],
  height: node.style.rowHeight * 1.5,
});
