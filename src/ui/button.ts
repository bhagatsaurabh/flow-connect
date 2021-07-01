import { Node } from "../core/node";
import { Terminal } from '../core/terminal';
import { Vector2 } from "../math/vector";
import { Constant, TerminalType, UIType } from '../math/constants';
import { Label } from "./label";
import { UINode } from './ui-node';
import { ButtonStyle, Serializable, SerializedButton, SerializedTerminal } from "../core/interfaces";
import { Color } from "../core/color";

export class Button extends UINode implements Serializable {
  label: Label;

  constructor(
    node: Node,
    public text: string,
    input?: boolean | SerializedTerminal,
    output?: boolean | SerializedTerminal,
    height?: number,
    style: ButtonStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Button, false, { ...Constant.DefaultButtonStyle(), ...style }, null,
      input ?
        (typeof input === 'boolean' ?
          new Terminal(node, TerminalType.IN, 'event', '', {}, () => this.call('click', this)) :
          new Terminal(node, input.type, input.dataType, input.name, input.style, () => this.call('click', this), input.id, Color.deSerialize(input.hitColor))
        ) :
        null,
      output ?
        (typeof output === 'boolean' ?
          new Terminal(node, TerminalType.OUT, 'event', '', {}) :
          Terminal.deSerialize(node, output)
        ) :
        null,
      id, hitColor
    );
    this.height = height ? height : (this.node.style.rowHeight + 2 * this.style.padding);

    this.label = new Label(this.node, text, null, false, false, {
      fontSize: this.style.fontSize,
      font: this.style.font,
      align: 'center',
      color: this.style.color
    }, this.height);
    this.label.on('click', (_node: Node, position: Vector2) => this.call('click', this, position));

    this.children.push(this.label);
  }

  paint(): void {
    this.context.fillStyle = this.style.backgroundColor;
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
      this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
      this.input.position.y = this.position.y + this.height / 2;
    }
    if (this.output) {
      this.output.position.x = this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius;
      this.output.position.y = this.position.y + this.height / 2;
    }
  }

  onPropChange() { }

  onOver(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('over', this, screenPosition, realPosition);
  }
  onDown(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('down', this, screenPosition, realPosition);
  }
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('up', this, screenPosition, realPosition);
  }
  onClick(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('click', this, screenPosition, realPosition);
  }
  onDrag(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('drag', this, screenPosition, realPosition);
  }
  onEnter(screenPosition: Vector2, realPosition: Vector2) {
    if (this.disabled) return;

    this.call('enter', this, screenPosition, realPosition);
  }
  onExit(screenPosition: Vector2, realPosition: Vector2) {
    if (this.disabled) return;

    this.call('exit', this, screenPosition, realPosition);
  }
  onContextMenu(): void {
    if (this.disabled) return;

    this.call('rightclick', this);
  }

  serialize(): SerializedButton {
    return {
      id: this.id,
      type: this.type,
      hitColor: this.hitColor.serialize(),
      height: this.height,
      text: this.text,
      style: this.style,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedButton): Button {
    return new Button(node, data.text, data.input, data.output, data.height, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}
