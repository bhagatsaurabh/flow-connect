import { Node } from "../core/node.js";
import { TerminalType } from "../core/terminal.js";
import { Vector } from "../core/vector.js";
import { Label, LabelOptions } from "./label.js";
import { UINode, UINodeStyle, UINodeOptions, UIEvent } from "./ui-node.js";
import { Align } from "../common/enums.js";

export class Button extends UINode<ButtonStyle> {
  style: ButtonStyle;
  label: Label;
  text: string;

  constructor(node: Node, options: ButtonOptions) {
    super();

    options = { ...DefaultButtonOptions(), ...options };
    const { height, style = {} } = options;

    this.style = { ...DefaultButtonStyle(), ...style };
    this.height = height ?? node.style.rowHeight + 2 * style.padding;
  }

  protected created(options: ButtonOptions): void {
    const { input, output } = options;

    if (input) {
      const terminal = this.createTerminal(TerminalType.IN, "event");
      terminal.on("event", () => this.call("click", this));
    }
    if (output) this.createTerminal(TerminalType.OUT, "event");

    this.label = this.node.createUI<Label, LabelOptions>("core/label", {
      text: options.text,
      style: {
        fontSize: this.style.fontSize,
        font: this.style.font,
        align: Align.Center,
        color: this.style.color,
      },
      height: this.height,
    });

    this.label.on("click", (_: Node, position: Vector) => this.call("click", this, position));
    this.children.push(this.label);
  }

  paint(): void {
    Object.assign(this.context, {
      fillStyle: this.style.backgroundColor,
      shadowColor: this.style.shadowColor,
      shadowBlur: this.style.shadowBlur,
      shadowOffsetX: this.style.shadowOffset.x,
      shadowOffsetY: this.style.shadowOffset.y,
    });
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  paintLOD1() {
    this.context.strokeStyle = "#000";
    this.paint();
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
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

  onPropChange() {
    /**/
  }
}

export interface ButtonStyle extends UINodeStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  font?: string;
  padding?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: Vector;
}
let DefaultButtonStyle = (): ButtonStyle => ({
  backgroundColor: "#666",
  padding: 5,
  color: "#fff",
  font: "arial",
  fontSize: "11px",
  shadowColor: "#555",
  shadowBlur: 3,
  shadowOffset: new Vector(3, 3),
});

interface ButtonOptions extends UINodeOptions<ButtonStyle> {
  text: number | string;
}
let DefaultButtonOptions = (): ButtonOptions => ({
  text: "Button",
});
