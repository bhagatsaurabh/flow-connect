import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal";
import { Node } from "../core/node";
import { Vector2 } from "../core/vector";
import { clamp, denormalize, get, normalize } from "../utils/utils";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node";
import { Serializable } from "../common/interfaces";
import { Color } from "../core/color";
import { FlowState } from "../core/flow";
import { Constant } from "../resource/constants";

export class VSlider extends UINode implements Serializable {
  private thumbFill: number;
  private _value: number;

  get value(): number {
    if (this.propName) return this.getProp();
    return this._value;
  }
  set value(value: number) {
    value = clamp(value, this.min, this.max);

    let oldVal = this.value;
    let newVal = value;

    if (this.propName) this.setProp(newVal);
    else {
      this._value = newVal;
      this.reflow();
    }

    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, oldVal, newVal);
  }

  constructor(
    node: Node, public min: number, public max: number,
    options: VSliderOptions = DefaultVSliderOptions(node)
  ) {
    super(node, Vector2.Zero(), UIType.VSlider, {
      draggable: true,
      style: options.style ? { ...DefaultVSliderStyle(node, options.width), ...options.style } : DefaultVSliderStyle(node, options.width),
      propName: options.propName,
      input: options.input && (typeof options.input === 'boolean'
        ? new Terminal(node, TerminalType.IN, 'number', '', {})
        : Terminal.deSerialize(node, options.input)),
      output: options.output && (typeof options.output === 'boolean'
        ? new Terminal(node, TerminalType.OUT, 'number', '', {})
        : Terminal.deSerialize(node, options.output)),
      id: options.id,
      hitColor: options.hitColor
    });

    this.height = get(options.height, this.node.style.rowHeight * 5);
    this.width = get(options.width, this.node.style.rowHeight);
    this._value = this.propName ? this.getProp() : get(options.value, min);
    this._value = clamp(this._value, this.min, this.max);

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
      if (this.output) this.output.setData(this.value);
    });
  }

  paint(): void {
    let context = this.context;
    context.lineWidth = this.style.railWidth;
    context.strokeStyle = this.style.color;
    context.lineCap = 'butt';

    let start = Math.max(this.position.y, this.position.y + this.thumbFill - 3);
    if (start !== this.position.y) {
      context.beginPath();
      context.moveTo(this.position.x + this.width / 2, this.position.y);
      context.lineTo(this.position.x + this.width / 2, start);
      context.stroke();
    }
    start = Math.min(this.position.y + 2 * this.style.thumbRadius + this.thumbFill + 3, this.position.y + this.height);
    if (start !== (this.position.y + this.height)) {
      context.beginPath();
      context.moveTo(this.position.x + this.width / 2, start);
      context.lineTo(this.position.x + this.width / 2, this.position.y + this.height);
      context.stroke();
    }

    context.fillStyle = this.style.thumbColor;
    context.beginPath();
    context.arc(
      this.position.x + this.width / 2,
      this.position.y + this.style.thumbRadius + this.thumbFill, this.style.thumbRadius, 0, Constant.TAU
    );
    context.fill();
  }
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = '#000';
    context.fillStyle = this.style.color;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    this.thumbFill = denormalize(1 - normalize(this.value, this.min, this.max), 0, this.height - 2 * this.style.thumbRadius);

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
    this._value = newVal;
    this.reflow();

    this.output && this.output.setData(this.value);
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

    let x = this.position.x + this.width / 2 - this.style.railWidth / 2;
    this.thumbFill = realPosition
      .clamp(x, x, this.position.y + this.style.thumbRadius, this.position.y + this.height - this.style.thumbRadius)
      .subtractInPlace(0, this.position.y + this.style.thumbRadius)
      .y;

    this.value = denormalize(1 - normalize(this.thumbFill, 0, this.height - 2 * this.style.thumbRadius), this.min, this.max);

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
  onWheel(direction: boolean, screenPosition: Vector2, realPosition: Vector2) {
    if (this.disabled) return;

    this.call('wheel', this, direction, screenPosition, realPosition);
  }
  onContextMenu(): void {
    if (this.disabled) return;
  }

  serialize(): SerializedVSlider {
    return {
      min: this.min,
      max: this.max,
      value: this.value,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      height: this.height,
      width: this.width,
      style: this.style,
      id: this.id,
      hitColor: this.hitColor.serialize(),
      type: this.type,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedVSlider) {
    return new VSlider(node, data.min, data.max, {
      value: data.value,
      propName: data.propName,
      input: data.input,
      output: data.output,
      height: data.height,
      width: data.width,
      style: data.style,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    });
  }
}

export interface VSliderStyle extends UINodeStyle {
  railWidth?: number,
  thumbRadius?: number,
  color?: string,
  thumbColor?: string
}
let DefaultVSliderStyle = (node: Node, width: number) => {
  return {
    color: '#444',
    thumbColor: '#000',
    railWidth: 4,
    thumbRadius: typeof width !== 'undefined' ? width / 2 : (node.style.rowHeight * 1.5) / 2
  }
}

export interface SerializedVSlider extends SerializedUINode {
  min: number,
  max: number,
  value: number,
  height: number,
  width: number
}

interface VSliderOptions {
  value?: number,
  propName?: string,
  input?: boolean | SerializedTerminal,
  output?: boolean | SerializedTerminal,
  height?: number,
  width?: number,
  style?: VSliderStyle,
  id?: string,
  hitColor?: Color
}
let DefaultVSliderOptions = (node: Node): VSliderOptions => {
  return {
    height: node.style.rowHeight * 5,
    width: node.style.rowHeight
  }
};
