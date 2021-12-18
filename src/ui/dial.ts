import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal";
import { Node } from "../core/node";
import { Vector2 } from "../core/vector";
import { clamp, denormalize, normalize } from "../utils/utils";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node";
import { Serializable } from "../common/interfaces";
import { Color } from "../core/color";
import { FlowState } from "../core/flow";
import { Constant } from "../resource/constants";

export class Dial extends UINode implements Serializable {
  private _value: number;
  private thumbStart: Vector2 = Vector2.Zero();
  private thumbEnd: Vector2 = Vector2.Zero();
  private lastAngle: number;
  private deltaValue: number;
  private temp: number;

  get value(): number {
    if (this.propName) return this.getProp();
    return this._value;
  }
  set value(value: number) {
    value = clamp(value, this.min, this.max);
    if (this.propName) this.setProp(value);
    else {
      this._value = value;
    }
    this.temp = normalize(value, this.min, this.max);

    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, this.value);
  }

  constructor(
    node: Node,
    public min: number, public max: number,
    value: number,
    height: number,
    propName?: string,
    input?: boolean | SerializedTerminal,
    output?: boolean | SerializedTerminal,
    style: DialStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Dial, true, false, true, { ...DefaultDialStyle(height), ...style }, propName,
      input ?
        (typeof input === 'boolean' ?
          new Terminal(node, TerminalType.IN, 'number', '', {}) :
          Terminal.deSerialize(node, input)
        ) :
        null,
      output ?
        (typeof output === 'boolean' ?
          new Terminal(node, TerminalType.OUT, 'number', '', {}) :
          Terminal.deSerialize(node, output)
        ) :
        null,
      id, hitColor
    );

    this.height = height;
    this._value = value;
    this.temp = normalize(this._value, this.min, this.max);

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
    let context = this.context;
    let size = Math.min(this.width, this.height);

    context.fillStyle = this.style.color;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = this.style.borderWidth;
    context.shadowColor = this.style.shadowColor;
    context.shadowBlur = this.style.shadowBlur;
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;
    context.beginPath();
    context.arc(this.position.x + this.width / 2, this.position.y + this.height / 2, size / 2, 0, 2 * Math.PI);
    context.stroke();
    context.fill();

    context.lineCap = 'round';
    context.lineWidth = 10;
    context.strokeStyle = this.style.thumbColor;
    context.shadowColor = this.style.thumbShadowColor;
    context.shadowBlur = this.style.thumbShadowBlur;
    context.beginPath();
    context.moveTo(this.thumbStart.x, this.thumbStart.y);
    context.lineTo(this.thumbEnd.x, this.thumbEnd.y);
    context.stroke();
  }
  /** @hidden */
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = '#000';
    context.fillStyle = this.style.color;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  offPaint(): void {
    let context = this.offUIContext;
    let size = Math.min(this.width, this.height);

    context.fillStyle = this.hitColor.hexValue;
    context.beginPath();
    context.arc(this.position.x + this.width / 2, this.position.y + this.height / 2, size / 2, 0, 2 * Math.PI);
    context.fill();
  }
  /** @hidden */
  reflow(): void {
    let center = this.position.add(this.width / 2, this.height / 2);
    let angle = normalize(this.value, this.min, this.max) * Constant.TAU + (Math.PI / 2);
    let size = Math.min(this.width, this.height);
    this.thumbStart.x = center.x + Math.cos(angle) * (size / 5);
    this.thumbStart.y = center.y + Math.sin(angle) * (size / 5);
    this.thumbEnd.x = center.x + Math.cos(angle) * (size / 2 - 10);
    this.thumbEnd.y = center.y + Math.sin(angle) * (size / 2 - 10);

    if (this.input) {
      this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
      this.input.position.y = this.position.y + this.height / 2;
    }
    if (this.output) {
      this.output.position.x = this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius;
      this.output.position.y = this.position.y + this.height / 2;
    }
  }

  private pointToValue(position: Vector2): number {
    let diff = position.subtract(this.position.add(this.width / 2, this.height / 2));
    let angle = Math.atan2(diff.y, diff.x);
    if (angle < 0) angle += Constant.TAU;
    return (((angle / Constant.TAU) - 0.25) + 1) % 1;
  }

  /** @hidden */
  onPropChange(_: any, newValue: any) {
    this._value = newValue;
    this.temp = normalize(newValue, this.min, this.max);
    this.reflow();

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

    this.lastAngle = undefined;
    this.deltaValue = this.pointToValue(realPosition);
    this.temp = normalize(this.value, this.min, this.max);

    this.call('down', this, screenPosition, realPosition);

    this.onDrag(screenPosition, realPosition);
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

    let currValue = this.pointToValue(realPosition);
    let diffValue = currValue - this.deltaValue;
    diffValue = (Math.abs(diffValue) > 0.5) ? 0 : diffValue;
    this.deltaValue = currValue;
    this.temp = this.temp + diffValue;
    this.temp = clamp(this.temp, 0, 1);

    let angle = this.temp * Constant.TAU;
    if (angle < 0) angle += Constant.TAU;
    if (typeof this.lastAngle !== 'undefined' && Math.abs(this.lastAngle - angle) > 2) {
      angle = this.lastAngle > 3 ? Constant.TAU : 0;
    }
    this.lastAngle = angle;
    let normalizedValue = angle / Constant.TAU;
    this.value = denormalize(clamp(normalizedValue, 0, 1), this.min, this.max);
    this.temp = normalizedValue;
    this.reflow();

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

    this.lastAngle = undefined;

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

  serialize(): SerializedDial {
    return {
      id: this.id,
      type: this.type,
      hitColor: this.hitColor.serialize(),
      style: this.style,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      min: this.min,
      max: this.max,
      value: this.value,
      size: this.height,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedDial) {
    return new Dial(node, data.min, data.max, data.value, data.size, data.propName, data.input, data.output, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}

export interface DialStyle extends UINodeStyle {
  color?: string,
  borderColor?: string,
  borderWidth?: number,
  shadowColor?: string,
  shadowBlur?: number,
  thumbColor?: string,
  thumbBorderColor?: string,
  thumbBorderWidth?: number,
  thumbShadowColor?: string,
  thumbShadowBlur?: number
}

export interface SerializedDial extends SerializedUINode {
  min: number,
  max: number,
  value: number,
  size: number
}

/** @hidden */
let DefaultDialStyle = (size: number) => {
  return {
    color: '#e3e3e3',
    borderColor: '#000',
    borderWidth: 1,
    shadowColor: 'grey',
    shadowBlur: 5,
    thumbColor: '#c9c9c9',
    thumbShadowColor: '#858585',
    thumbShadowBlur: 5,
    size,
    visible: true
  }
}
