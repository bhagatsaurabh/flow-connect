import { TerminalType } from "../core/terminal.js";
import { Node } from "../core/node.js";
import { UIEvent, UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { FlowState } from "../core/flow.js";
import { Label, LabelOptions } from "./label.js";
import { Align } from "../common/enums.js";

export class RadioGroup extends UINode<RadioGroupStyle> {
  style: RadioGroupStyle;

  private _values: string[];
  private _selected: string;

  get selected(): string {
    if (this.propName) return this.getProp();
    return this._selected;
  }
  set selected(selected: string) {
    if (!this._values.includes(selected)) selected = this._values[0];

    let oldVal = this.selected;
    let newVal = selected;

    if (this.propName) this.setProp(newVal);
    else this._selected = newVal;

    this.setLabelStyle();

    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, newVal);
  }
  get values(): string[] {
    return [...this._values];
  }

  constructor(node: Node, _options: RadioGroupOptions = DefaultRadioGroupOptions(node)) {
    super();
  }

  protected created(options: RadioGroupOptions): void {
    options = { ...DefaultRadioGroupOptions(this.node), ...options };
    const { height, style = {}, values = ["Option1", "Option2"], selected = values[0], input, output } = options;

    this._values = values;
    const selectedValue = this.propName ? this.getProp() : selected;
    this._selected = this._values.includes(selectedValue) ? selectedValue : this._values[0];
    this.style = { ...DefaultRadioGroupStyle(), ...style };
    this.height = height ?? this.node.style.rowHeight;

    if (input) {
      const terminal = this.createTerminal(TerminalType.IN, "string");
      terminal.on("connect", (_, connector) => {
        if (connector.data) this._selected = connector.data;
      });
      terminal.on("data", (_, data) => {
        if (typeof data !== "undefined") this._selected = data;
      });
    }
    if (output) {
      const terminal = this.createTerminal(TerminalType.OUT, "string");
      terminal.on("connect", (_, connector) => (connector.data = this._selected));
    }

    this.setupLabels();

    this.node.on("process", () => {
      this.output?.setData(this._selected);
    });
  }

  setupLabels() {
    this.children.push(
      ...this._values.map((option) => {
        const label = this.node.createUI<Label, LabelOptions>("core/label", {
          text: option,
          style: { align: Align.Center, backgroundColor: this.style.backgroundColor, color: this.style.color },
        });

        label.on("click", (event: UIEvent<Label>) => {
          if (event.target.text === this.selected) return;
          this.selected = event.target.text;
        });

        return label;
      })
    );
    Object.assign(this.children[this._values.indexOf(this._selected)].style, {
      backgroundColor: this.style.selectedBackgroundColor,
      color: this.style.selectedColor,
    });
  }

  setLabelStyle() {
    this.children.forEach((label) => {
      Object.assign(label.style, {
        backgroundColor: this.style.backgroundColor,
        color: this.style.color,
      });
    });

    const selectedLabel = this.children[this._values.indexOf(this.selected)];
    Object.assign(selectedLabel.style, {
      backgroundColor: this.style.selectedBackgroundColor,
      color: this.style.selectedColor,
    });
  }

  paint(): void {
    let context = this.context;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = this.style.borderWidth;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);

    let commonWidth = this.width / this.children.length;
    let x = this.position.x + commonWidth;
    for (let i = 0; i < this.children.length - 1; i += 1) {
      context.beginPath();
      context.moveTo(x, this.position.y);
      context.lineTo(x, this.position.y + this.height);
      context.stroke();
      x += commonWidth;
    }
  }
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = this.style.borderColor;
    context.fillStyle = this.style.backgroundColor;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    let x = this.position.x;
    this.children.forEach((child) => {
      child.height = this.height;
      child.width = this.width / this.children.length;
      child.position.assign(x, this.position.y);
      x += child.width;
    });

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
    if (!this._values.includes(newVal)) newVal = this._values[0];
    this._selected = newVal;
    this.setLabelStyle();

    this.output?.setData(this._selected);
  }
}

export interface RadioGroupStyle extends UINodeStyle {
  color?: string;
  selectedColor?: string;
  backgroundColor?: string;
  selectedBackgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}
const DefaultRadioGroupStyle = (): RadioGroupStyle => ({
  color: "#000",
  selectedColor: "#fff",
  backgroundColor: "transparent",
  selectedBackgroundColor: "#555",
  borderColor: "#000",
  borderWidth: 1,
});

export interface RadioGroupOptions extends UINodeOptions<RadioGroupStyle> {
  values: string[];
  selected?: string;
}
const DefaultRadioGroupOptions = (node: Node): RadioGroupOptions => ({
  values: ["Option1", "Option2"],
  height: node.style.rowHeight * 1.5,
});
