import { Terminal, TerminalType } from "../core/terminal.js";
import { Node } from "../core/node.js";
import { Vector } from "../core/vector.js";
import { UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { FlowState } from "../core/flow.js";
import { Constant } from "../resource/constants.js";

export class Toggle extends UINode<ToggleStyle> {
  style: ToggleStyle;

  private _checked: boolean = false;

  get checked(): boolean {
    if (this.propName) return this.getProp();
    return this._checked;
  }
  set checked(checked: boolean) {
    let oldVal = this.checked;
    let newVal = checked;

    if (this.propName) this.setProp(newVal);
    else this._checked = newVal;

    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, newVal);
  }

  constructor(node: Node, _options: ToggleOptions = DefaultToggleOptions(node)) {
    super();
  }

  protected created(options: ToggleOptions): void {
    options = { ...DefaultToggleOptions(this.node), ...options };
    const { style = {}, height, value, input, output } = options;

    this.style = { ...DefaultToggleStyle(), ...style };
    this._checked = this.propName ? this.getProp() : value;
    this.height = height ?? this.node.style.rowHeight;
    if (!this.style.grow) this.width = this.height * 2.5;

    if (input) {
      const terminal = this.createTerminal(TerminalType.IN, "boolean");
      terminal.on("connect", (_, connector) => {
        if (connector.data) this.checked = connector.data;
      });
      terminal.on("data", (_, data) => {
        if (typeof data !== "undefined") this.checked = data;
      });
    }
    if (output) {
      const terminal = this.createTerminal(TerminalType.IN, "boolean");
      terminal.on("connect", (_, connector) => (connector.data = this.checked));
    }

    this.node.on("process", () => {
      this.output?.setData(this.checked);
    });
  }

  paint(): void {
    let context = this.context;
    context.strokeStyle = this.style.backgroundColor;
    context.lineWidth = this.height * 0.75;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(this.position.x + this.context.lineWidth / 2, this.position.y + this.height / 2);
    context.lineTo(this.position.x + this.width - this.context.lineWidth / 2, this.position.y + this.height / 2);
    context.stroke();

    context.fillStyle = this.style.color;
    context.beginPath();
    context.arc(
      this.checked ? this.position.x + this.width - this.height / 2 : this.position.x + this.height / 2,
      this.position.y + this.height / 2,
      this.height / 2,
      0,
      Constant.TAU
    );
    context.fill();
  }
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = this.style.color;
    context.fillStyle = this.style.backgroundColor;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
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
    this._checked = newVal;

    this.output?.setData(this.checked);
  }

  onClick(): void {
    this.checked = !this.checked;
  }
}

export interface ToggleOptions extends UINodeOptions<ToggleStyle> {
  value?: boolean;
}
const DefaultToggleOptions = (node: Node): ToggleOptions => ({
  value: false,
  height: node.style.rowHeight * 1.5,
});

export interface ToggleStyle extends UINodeStyle {
  backgroundColor?: string;
  color?: string;
}
const DefaultToggleStyle = (): ToggleStyle => ({
  backgroundColor: "#999",
  color: "#000",
});
