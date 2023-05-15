import { Node } from "../core/node.js";
import { Terminal, TerminalType, SerializedTerminal } from '../core/terminal.js';
import { Vector } from "../core/vector.js";
import { Label } from "./label.js";
import { SerializedUINode, UINode, UIType, UINodeStyle } from './ui-node.js';
import { Serializable } from "../common/interfaces.js";
import { Color } from "../core/color.js";
import { Align } from "../common/enums.js";
import { get } from "../utils/utils.js";

export class Button extends UINode implements Serializable<SerializedButton> {
  label: Label;

  constructor(
    node: Node,
    public text: string,
    options: ButtonOptions = DefaultButtonOptions(node)
  ) {
    super(node, Vector.Zero(), UIType.Button, {
      style: options.style ? { ...DefaultButtonStyle(), ...options.style } : DefaultButtonStyle(),
      input: options.input && (typeof options.input === 'boolean'
        ? new Terminal(node, TerminalType.IN, 'event', '', {})
        : new Terminal(node, options.input.type, options.input.dataType, options.input.name, {
          style: options.input.style, id: options.input.id, hitColor: Color.deSerialize(options.input.hitColor)
        })),
      output: options.output && (typeof options.output === 'boolean'
        ? new Terminal(node, TerminalType.OUT, 'event', '', {})
        : Terminal.deSerialize(node, options.output)),
      id: options.id,
      hitColor: options.hitColor
    });

    if (this.input) this.input.on('event', () => this.call('click', this));
    this.height = get(options.height, this.node.style.rowHeight + 2 * this.style.padding);

    this.label = new Label(this.node, text, {
      style: {
        fontSize: this.style.fontSize,
        font: this.style.font,
        align: Align.Center,
        color: this.style.color
      },
      height: this.height
    });
    this.label.on('click', (_node: Node, position: Vector) => this.call('click', this, position));
    /* this.label.on('enter', () => this.node.flow.flowConnect.cursor = 'pointer');
    this.label.on('exit', () => this.node.flow.flowConnect.cursor = 'unset'); */
    this.children.push(this.label);
  }

  paint(): void {
    Object.assign(this.context, {
      fillStyle: this.style.backgroundColor,
      shadowColor: this.style.shadowColor,
      shadowBlur: this.style.shadowBlur,
      shadowOffsetX: this.style.shadowOffset.x,
      shadowOffsetY: this.style.shadowOffset.y
    })
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  paintLOD1() {
    this.context.strokeStyle = '#000';
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

  onPropChange() { /**/ }
  onOver(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('over', this, screenPosition, realPosition);
  }
  onDown(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('down', this, screenPosition, realPosition);
  }
  onUp(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('up', this, screenPosition, realPosition);
  }
  onClick(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('click', this, screenPosition, realPosition);
  }
  onDrag(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('drag', this, screenPosition, realPosition);
  }
  onEnter(screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    this.call('enter', this, screenPosition, realPosition);
  }
  onExit(screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    this.call('exit', this, screenPosition, realPosition);
  }
  onWheel(direction: boolean, screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    this.call('wheel', this, direction, screenPosition, realPosition);
  }
  onContextMenu(): void {
    if (this.disabled) return;

    this.call('rightclick', this);
  }

  serialize(): SerializedButton {
    return {
      text: this.text,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      height: this.height,
      id: this.id,
      style: this.style,
      hitColor: this.hitColor.serialize(),
      type: this.type,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedButton): Button {
    return new Button(node, data.text, {
      input: data.input,
      output: data.output,
      height: data.height,
      style: data.style,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    });
  }
}

export interface ButtonStyle extends UINodeStyle {
  backgroundColor?: string,
  color?: string,
  fontSize?: string,
  font?: string,
  padding?: number,
  shadowColor?: string,
  shadowBlur?: number,
  shadowOffset?: Vector
}
let DefaultButtonStyle = () => {
  return {
    backgroundColor: '#666',
    padding: 5,
    color: '#fff',
    font: 'arial',
    fontSize: '11px',
    shadowColor: '#555',
    shadowBlur: 3,
    shadowOffset: new Vector(3, 3)
  };
};

export interface SerializedButton extends SerializedUINode {
  text: string,
  height: number
}

interface ButtonOptions {
  input?: boolean | SerializedTerminal,
  output?: boolean | SerializedTerminal,
  height?: number,
  style?: ButtonStyle,
  id?: string,
  hitColor?: Color
}
let DefaultButtonOptions = (node: Node): ButtonOptions => {
  return {
    height: node.style.rowHeight * 1.5
  };
};
