import { Terminal } from "../core/terminal";
import { Node } from "../core/node";
import { Vector2 } from "../math/vector";
import { UINode } from "./ui-node";
import { Constant, TerminalType, UIType } from "../math/constants";
import { Serializable, SerializedTerminal, SerializedToggle, ToggleStyle } from "../core/interfaces";
import { Color } from "../core/color";

export class Toggle extends UINode implements Serializable {
  _checked: boolean = false;

  get checked(): boolean {
    if (this.propName) return this.node.props[this.propName];
    return this._checked;
  }
  set checked(checked: boolean) {
    if (this.propName) this.node.props[this.propName] = checked;
    else {
      this._checked = checked;
      this.call('change', this, this.checked);
    }
  }

  constructor(
    node: Node,
    propName?: string,
    input?: boolean | SerializedTerminal,
    output?: boolean | SerializedTerminal,
    height?: number,
    style: ToggleStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Toggle, false, { ...Constant.DefaultToggleStyle(), ...style }, propName,
      input ?
        (typeof input === 'boolean' ?
          new Terminal(node, TerminalType.IN, 'boolean', '', {}) :
          Terminal.deSerialize(node, input)
        ) :
        null,
      output ?
        (typeof output === 'boolean' ?
          new Terminal(node, TerminalType.OUT, 'boolean', '', {}) :
          Terminal.deSerialize(node, output)
        ) :
        null,
      id, hitColor
    );

    this._checked = this.propName ? this.node.props[this.propName] : false;
    this.height = height ? height : this.node.style.rowHeight;

    if (this.input) {
      this.input.on('connect', (terminal, connector) => {
        if (connector.data) this.checked = connector.data;
      });
      this.input.on('data', data => {
        if (typeof data !== 'undefined') this.checked = data;
      });
    }
    if (this.output) this.output.on('connect', (terminal, connector) => connector.data = this.checked);
  }

  paint(): void {
    this.context.strokeStyle = this.style.backgroundColor;
    this.context.lineWidth = this.height * .75;
    this.context.lineCap = 'round';
    this.context.beginPath();
    this.context.moveTo(this.position.x + this.context.lineWidth / 2, this.position.y + this.height / 2);
    this.context.lineTo(this.position.x + this.width - this.context.lineWidth / 2, this.position.y + this.height / 2);
    this.context.stroke();

    this.context.fillStyle = this.style.color;
    this.context.beginPath();
    this.context.arc(this.checked ? this.position.x + this.width - this.height / 2 : this.position.x + this.height / 2, this.position.y + this.height / 2, this.height / 2, 0, 2 * Math.PI);
    this.context.fill();
  }
  paintLOD1() {
    this.context.strokeStyle = this.style.color;
    this.context.fillStyle = this.style.backgroundColor;
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  reflow(): void {
    if (this.input) {
      this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
      this.input.position.y = this.position.y + this.height / 2;
    }
    if (this.output) {
      this.output.position.x = this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius;
      this.output.position.y = this.position.y + this.height / 2;
    }
  }

  onPropChange(oldValue: any, newValue: any) {
    this._checked = newValue;
    this.call('change', this, this.checked);

    this.output && (this.output as any)['setData'](this.checked);
  }

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

    this.checked = !this.checked;
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
  }

  serialize(): SerializedToggle {
    return {
      id: this.id,
      type: this.type,
      hitColor: this.hitColor.serialize(),
      style: this.style,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      checked: this.checked,
      height: this.height,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedToggle): Toggle {
    return new Toggle(node, data.propName, data.input, data.output, data.height, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}