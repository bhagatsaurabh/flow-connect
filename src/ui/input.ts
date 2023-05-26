import { UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { Node } from "../core/node.js";
import { Label, LabelOptions } from "./label.js";
import { TerminalType } from "../core/terminal.js";
import { FlowState } from "../core/flow.js";
import { Align } from "../common/enums.js";
import { exists } from "../utils/utils.js";

export class Input extends UINode<InputStyle> {
  style: InputStyle;

  label: Label;
  inputEl: HTMLInputElement;
  private _value: string | number;

  get value(): string | number {
    if (this.propName) return this.getProp();
    return this._value;
  }
  set value(value: string | number) {
    let val: string | number;
    if (this.style.type === InputType.Number && typeof value === "string") val = parseFloat(value);
    else val = value;

    let oldVal = this.value;
    let newVal = val;

    if (this.propName) this.setProp(newVal);
    else {
      this._value = newVal;
      this.setLabelText(this._value);
      this.inputEl.value = this._value.toString();
    }
    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, newVal, oldVal);
  }

  constructor(node: Node, _options: InputOptions = DefaultInputOptions(node)) {
    super();
  }

  protected created(options: InputOptions): void {
    options = { ...DefaultInputOptions(this.node), ...options };
    const { style = {}, height, input, output } = options;

    this.height = height ?? this.node.style.rowHeight;
    this.style = { ...DefaultInputStyle(), ...style };

    if (this.style.type === InputType.Number && typeof options.value === "string") {
      options.value = parseFloat(options.value);
    }
    this._value = options.value;

    this.setupLabel();
    this.setupInputElement();

    if (input) {
      const terminal = this.createTerminal(TerminalType.IN, options.style.type);
      terminal.on("connect", (_, connector) => {
        if (connector.data) this.value = connector.data;
      });
      terminal.on("data", (_, data) => {
        if (data) this.value = data;
      });
    }
    if (output) {
      const terminal = this.createTerminal(TerminalType.OUT, options.style.type);
      terminal.on("connect", (_, connector) => (connector.data = this.value));
    }

    this.node.on("process", () => {
      this.output?.setData(this.value);
    });

    this.on("blur", () => document.body.removeChild(this.inputEl));
  }

  setupLabel() {
    this.label = this.node.createUI<Label, LabelOptions>("core/label", {
      text: this.value.toString(),
      style: {
        fontSize: this.style.fontSize,
        font: this.style.font,
        align: this.style.align,
        color: this.style.color,
        padding: 5,
        precision: this.style.precision ?? null,
      },
      height: this.height,
    });

    this.label.on("click", () => {
      if (document.activeElement !== this.inputEl) {
        const realPosition = this.position.transform(this.node.flow.flowConnect.transform);
        Object.assign(this.inputEl.style, {
          visibility: "visible",
          "pointer-events": "all",
          top: realPosition.y + this.node.flow.flowConnect.canvasDimensions.top + 1 + "px",
          left: realPosition.x + this.node.flow.flowConnect.canvasDimensions.left + 1 + "px",
          width: (this.width - 1) * this.node.flow.flowConnect.scale + "px",
          height: (this.height - 1) * this.node.flow.flowConnect.scale + "px",
          "font-family": this.style.font,
          "font-size": parseInt(this.style.fontSize.replace("px", "")) * this.node.flow.flowConnect.scale + "px",
          color: this.style.color,
          "background-color": this.inputEl.validity.patternMismatch ? "red" : this.style.backgroundColor,
          "text-align": this.style.align,
        });
        if (this.style.type === InputType.Number) this.inputEl.step = this.style.step;
        this.inputEl.focus();
      }
    });

    this.children.push(this.label);
  }
  setupInputElement() {
    this.inputEl = document.createElement("input");
    this.inputEl.className = "flow-connect-input";
    this.inputEl.spellcheck = false;
    const inputType = this.style.type === "string" ? "text" : this.style.type;
    this.inputEl.type = this.style.pattern ? "text" : inputType;
    this.inputEl.value = this.value.toString();

    this.style.pattern ?? (this.inputEl.pattern = this.style.pattern);
    if (this.style.type === InputType.Number && this.style.step) this.inputEl.step = this.style.step;
    this.style.maxLength ?? (this.inputEl.maxLength = this.style.maxLength);

    this.inputEl.addEventListener("blur", () => {
      this.inputEl.style.visibility = "hidden";
      this.inputEl.style.pointerEvents = "none";
      this.value = this.inputEl.value;

      this.setLabelText(this.style.type === InputType.Number ? parseFloat(this.value) : this.value.toString());

      this.call("blur", this);
    });
    this.inputEl.oninput = () => {
      if (this.style.pattern) {
        this.inputEl.style.backgroundColor = this.inputEl.validity.patternMismatch
          ? "orange"
          : this.style.backgroundColor;
        this.label.style.color = this.inputEl.validity.patternMismatch ? "orange" : this.style.color;
      }
      this.call("input", this);
    };
    document.body.appendChild(this.inputEl);
  }
  setLabelText(value: any) {
    this.label.text =
      typeof value === "number" && exists(this.style.precision) ? value.toFixed(this.style.precision) : value;
  }

  paint(): void {
    this.context.strokeStyle = this.style.border;
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = this.style.border;
    context.fillStyle = this.style.backgroundColor;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    this.label.position = this.position;
    this.label.height = this.height;
    this.label.width = this.width;

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
    if (this.style.type === InputType.Number && typeof newVal === "string") newVal = parseFloat(newVal);

    this._value = newVal;
    this.setLabelText(this._value);
    this.inputEl.value = this._value.toString();

    this.output?.setData(this._value);
  }
}

export enum InputType {
  Text = "string",
  Number = "number",
}

export interface InputStyle extends UINodeStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  font?: string;
  border?: string;
  type?: InputType;
  precision?: number;
  pattern?: string;
  step?: string;
  maxLength?: number;
}
const DefaultInputStyle = (): InputStyle => ({
  backgroundColor: "#eee",
  color: "#000",
  fontSize: "11px",
  font: "arial",
  border: "1px solid black",
  align: Align.Left,
  type: InputType.Text,
});

export interface InputOptions extends UINodeOptions<InputStyle> {
  value?: string | number;
}
const DefaultInputOptions = (node: Node): InputOptions => ({
  height: node.style.rowHeight * 1.5,
});
