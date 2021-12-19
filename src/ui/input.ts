import { Vector2 } from "../core/vector";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node";
import { Node } from '../core/node';
import { Label } from './label';
import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal";
import { Serializable } from "../common/interfaces";
import { Color } from "../core/color";
import { FlowState } from "../core/flow";
import { Align } from "../common/enums";

export class Input extends UINode implements Serializable {
  label: Label;
  /** @hidden */
  inputEl: HTMLInputElement;
  private _value: string | number;

  get value(): string | number {
    if (this.propName) return this.getProp();
    return this._value;
  }
  set value(value: string | number) {
    let val: string | number;
    let prevVal = this.value;
    if (this.style.type === InputType.Number && typeof value === 'string') val = parseFloat(value);
    else val = value;

    if (this.propName) this.setProp(val);
    else {
      this._value = val;
      this.label.text = this._value.toString();
      this.inputEl.value = this._value.toString();
    }
    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, value, prevVal);
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

    super(node, Vector2.Zero(), UIType.Input, false, false, true, { ...DefaultInputStyle(), ...style }, propName,
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

    if (this.style.type === InputType.Number && typeof value === 'string') value = parseFloat(value);
    this._value = value;

    this.label = new Label(this.node, this.value.toString(), null, false, false, {
      fontSize: this.style.fontSize,
      font: this.style.font,
      align: this.style.align,
      color: this.style.color,
      padding: 5
    }, this.height);
    this.label.on('click', () => {
      if (document.activeElement !== this.inputEl) {
        let realPosition = this.position.transform(this.node.flow.flowConnect.transform);
        Object.assign(this.inputEl.style, {
          'visibility': 'visible',
          'pointer-events': 'all',
          'top': (realPosition.y + this.node.flow.flowConnect.canvasDimensions.top + 1) + 'px',
          'left': (realPosition.x + this.node.flow.flowConnect.canvasDimensions.left + 1) + 'px',
          'width': (this.width - 1) * this.node.flow.flowConnect.scale + 'px',
          'height': (this.height - 1) * this.node.flow.flowConnect.scale + 'px',
          'font-family': this.style.font,
          'font-size': parseInt(this.style.fontSize.replace('px', '')) * this.node.flow.flowConnect.scale + 'px',
          'color': this.style.color,
          'background-color': this.inputEl.validity.patternMismatch ? 'red' : this.style.backgroundColor,
          'text-align': this.style.align
        });
        if (this.style.type === InputType.Number) this.inputEl.step = this.style.step;
        this.inputEl.focus();
      }
    });
    this.children.push(this.label);

    this.inputEl = document.createElement('input');
    this.inputEl.className = 'flow-connect-input';
    this.inputEl.spellcheck = false;
    this.inputEl.type = this.style.pattern ? InputType.Text : this.style.type;
    this.inputEl.value = this.value.toString();
    if (this.style.pattern) this.inputEl.pattern = this.style.pattern;
    if (this.style.type === InputType.Number && this.style.step) this.inputEl.step = this.style.step;
    if (this.style.maxLength) this.inputEl.maxLength = this.style.maxLength;
    this.inputEl.addEventListener('blur', () => {
      this.inputEl.style.visibility = 'hidden';
      this.inputEl.style.pointerEvents = 'none';
      this.value = this.inputEl.value;
      this.label.text = this.value.toString();

      this.call('blur', this);
    });
    this.inputEl.oninput = () => {
      if (this.style.pattern) {
        this.inputEl.style.backgroundColor = this.inputEl.validity.patternMismatch ? 'red' : this.style.backgroundColor;
        this.label.style.color = this.inputEl.validity.patternMismatch ? 'red' : this.style.color;
      }
      this.call('input', this);
    }
    document.body.appendChild(this.inputEl);

    if (this.input) {
      this.input.on('connect', (_, connector) => {
        if (connector.data) this.value = connector.data;
      });
      this.input.on('data', (_, data) => {
        if (data) this.value = data;
      });
    }
    if (this.output) this.output.on('connect', (_, connector) => connector.data = this.value);

    this.node.on('process', () => {
      if (this.output) (this.output as any).setData(this.value);
    });
  }

  /** @hidden */
  paint(): void {
    this.context.strokeStyle = this.style.border;
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = this.style.border;
    context.fillStyle = this.style.backgroundColor;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
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

  /** @hidden */
  onPropChange(_: any, newVal: any) {
    if (this.style.type === InputType.Number && typeof newVal === 'string') newVal = parseFloat(newVal);

    this._value = newVal;
    this.label.text = this._value.toString();
    this.inputEl.value = this._value.toString();

    this.output && this.output.setData(this.value);
  }
  /** @hidden */
  onOver(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('over', this, screenPosition, realPosition);
  }
  /** @hidden */
  onDown(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('down', this, screenPosition, realPosition);
  }
  /** @hidden */
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('up', this, screenPosition, realPosition);
  }
  /** @hidden */
  onClick(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('click', this, screenPosition, realPosition);
  }
  /** @hidden */
  onDrag(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('drag', this, screenPosition, realPosition);
  }
  /** @hidden */
  onEnter(screenPosition: Vector2, realPosition: Vector2) {
    if (this.disabled) return;

    this.call('enter', this, screenPosition, realPosition);
  }
  /** @hidden */
  onExit(screenPosition: Vector2, realPosition: Vector2) {
    if (this.disabled) return;

    this.call('exit', this, screenPosition, realPosition);
  }
  /** @hidden */
  onWheel(direction: boolean, screenPosition: Vector2, realPosition: Vector2) {
    this.call('wheel', this, direction, screenPosition, realPosition);
  }
  /** @hidden */
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

export enum InputType {
  Text = "text",
  Number = "number"
}

export interface InputStyle extends UINodeStyle {
  backgroundColor?: string,
  color?: string,
  fontSize?: string,
  font?: string,
  border?: string,
  type?: InputType,
  align?: Align,
  pattern?: string,
  step?: string,
  maxLength?: number,
}

export interface SerializedInput extends SerializedUINode {
  value: string | number,
  height: number
}

/** @hidden */
let DefaultInputStyle = () => {
  return {
    backgroundColor: '#eee',
    color: '#000',
    fontSize: '11px',
    font: 'arial',
    border: '1px solid black',
    align: Align.Left,
    type: InputType.Text,
    visible: true
  };
};
