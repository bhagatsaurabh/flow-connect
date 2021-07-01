import { Vector2 } from "../math/vector";
import { UINode } from "./ui-node";
import { Node } from '../core/node';
import { Label } from './label';
import { Terminal } from "../core/terminal";
import { Constant, InputType, TerminalType, UIType } from "../math/constants";
import { InputStyle, Serializable, SerializedInput, SerializedTerminal } from "../core/interfaces";
import { Color } from "../core/color";

export class Input extends UINode implements Serializable {
  label: Label;
  inputEl: HTMLInputElement;
  _value: string | number;

  get value(): string | number {
    if (this.propName) return this.node.props[this.propName];
    return this._value;
  }
  set value(value: string | number) {
    let val: string | number;
    if (this.style.type === InputType.Number && typeof value === 'string') val = parseInt(value);
    else val = value;

    if (this.propName) this.node.props[this.propName] = val;
    else {
      this._value = val;
      this.label.text = this._value.toString();
      this.inputEl.value = this._value.toString();
    }
  }

  constructor(
    node: Node,
    value: string | number,
    propName?: string,
    input?: boolean | SerializedTerminal,
    output?: boolean | SerializedTerminal,
    height?: number,
    style: InputStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Input, false, { ...Constant.DefaultInputStyle(), ...style }, propName,
      input ?
        (typeof input === 'boolean' ?
          new Terminal(node, TerminalType.IN, style.type === InputType.Text ? 'string' : 'number', '', {}) :
          Terminal.deSerialize(node, input)
        ) :
        null,
      output ?
        (typeof output === 'boolean' ?
          new Terminal(node, TerminalType.OUT, style.type === InputType.Text ? 'string' : 'number', '', {}) :
          Terminal.deSerialize(node, output)
        ) :
        null,
      id, hitColor
    );
    this.height = height ? height : this.node.style.rowHeight;

    if (this.style.type === InputType.Number && typeof value === 'string') value = parseInt(value);
    this._value = value;

    this.label = new Label(this.node, this.value.toString(), null, false, false, {
      fontSize: this.style.fontSize,
      font: this.style.font,
      align: this.style.align,
      color: this.style.color
    }, this.height);
    this.label.on('click', () => {
      if (document.activeElement !== this.inputEl) {
        this.inputEl.style.visibility = 'visible';
        this.inputEl.style.pointerEvents = 'all';

        let realPosition = this.position.transform(this.node.flow.flowConnect.transform);
        this.inputEl.style.top = (realPosition.y + this.node.flow.flowConnect.canvasDimensions.top + 1) + 'px';
        this.inputEl.style.left = (realPosition.x + this.node.flow.flowConnect.canvasDimensions.left + 1) + 'px';
        this.inputEl.style.width = (this.width - 1) * this.node.flow.flowConnect.scale + 'px';
        this.inputEl.style.height = (this.height - 1) * this.node.flow.flowConnect.scale + 'px';
        this.inputEl.style.fontFamily = this.style.font;
        this.inputEl.style.fontSize = parseInt(this.style.fontSize.replace('px', '')) * this.node.flow.flowConnect.scale + 'px';
        this.inputEl.style.color = this.style.color;
        this.inputEl.style.backgroundColor = this.style.backgroundColor;
        this.inputEl.style.textAlign = this.style.align;
        this.inputEl.focus();
      }
    });
    this.children.push(this.label);

    this.inputEl = document.createElement('input');
    this.inputEl.className = 'flow-connect-input';
    this.inputEl.spellcheck = false;
    this.inputEl.type = this.style.type;
    this.inputEl.value = this.value.toString();
    this.inputEl.onblur = () => {
      this.inputEl.style.visibility = 'hidden';
      this.inputEl.style.pointerEvents = 'none';
    };
    this.inputEl.onchange = (event: any) => {
      this.value = event.target.value;
      this.label.text = this.value.toString();
    }
    document.body.appendChild(this.inputEl);

    if (this.input) {
      this.input.on('connect', (terminal, connector) => {
        if (connector.data) this.value = connector.data;
      });
      this.input.on('data', data => {
        if (data) this.value = data;
      });
    }
    if (this.output) this.output.on('connect', (terminal, connector) => connector.data = this.value);
  }

  paint(): void {
    this.context.strokeStyle = this.style.border;
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }
  paintLOD1() {
    this.context.strokeStyle = this.style.border;
    this.context.fillStyle = this.style.backgroundColor;
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
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

  onPropChange(oldValue: any, newValue: any) {
    let val: string | number;
    if (this.style.type === InputType.Number && typeof newValue === 'string') val = parseInt(newValue);
    else val = newValue;

    this._value = val;
    this.label.text = this._value.toString();
    this.inputEl.value = this._value.toString();

    this.output && (this.output as any)['setData'](this.value);
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

  serialize(): SerializedInput {
    return {
      id: this.id,
      hitColor: this.hitColor.serialize(),
      type: this.type,
      style: this.style,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      value: this.value,
      height: this.height,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedInput): Input {
    return new Input(node, data.value, data.propName, data.input, data.output, data.height, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}
