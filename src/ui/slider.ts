import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal.js";
import { Node } from "../core/node.js";
import { Vector } from "../core/vector.js";
import { clamp, denormalize, exists, get, normalize } from "../utils/utils.js";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node.js";
import { Serializable } from "../common/interfaces.js";
import { Color } from "../core/color.js";
import { FlowState } from "../core/flow.js";
import { Constant } from "../resource/constants.js";

export class Slider extends UINode implements Serializable<SerializedSlider> {
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
    newVal = exists(this.style.precision) ? parseFloat(newVal.toFixed(this.style.precision)) : newVal;

    if (this.propName) this.setProp(newVal);
    else {
      this._value = newVal;
      this.reflow();
    }

    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, oldVal, newVal);
  }

  constructor(
    node: Node, public min: number, public max: number,
    options: SliderOptions = DefaultSliderOptions(node)
  ) {
    super(node, Vector.Zero(), UIType.Slider, {
      draggable: true,
      style: options.style ? { ...DefaultSliderStyle(node, options.height), ...options.style } : DefaultSliderStyle(node, options.height),
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

    this.height = get(options.height, this.node.style.rowHeight);
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
    context.lineWidth = this.style.railHeight;
    context.strokeStyle = this.style.color;
    context.lineCap = 'butt';

    let start = Math.max(this.position.x, this.position.x + this.thumbFill - 3);
    if (start !== this.position.x) {
      context.beginPath();
      context.moveTo(this.position.x, this.position.y + this.height / 2);
      context.lineTo(start, this.position.y + this.height / 2);
      context.stroke();
    }
    start = Math.min(this.position.x + 2 * this.style.thumbRadius + this.thumbFill + 3, this.position.x + this.width);
    if (start !== (this.position.x + this.width)) {
      context.beginPath();
      context.moveTo(start, this.position.y + this.height / 2);
      context.lineTo(this.position.x + this.width, this.position.y + this.height / 2);
      context.stroke();
    }

    context.fillStyle = this.style.thumbColor;
    context.beginPath();
    context.arc(
      this.position.x + this.style.thumbRadius + this.thumbFill,
      this.position.y + this.height / 2, this.style.thumbRadius, 0, Constant.TAU
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
    this.thumbFill = denormalize(normalize(this.value, this.min, this.max), 0, this.width - 2 * this.style.thumbRadius);

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

    let y = this.position.y + this.height / 2 - this.style.railHeight / 2;
    this.thumbFill = realPosition
      .clamp(this.position.x + this.style.thumbRadius, this.position.x + this.width - this.style.thumbRadius, y, y)
      .subtractInPlace(this.position.x + this.style.thumbRadius, 0)
      .x;

    this.value = denormalize(normalize(this.thumbFill, 0, this.width - 2 * this.style.thumbRadius), this.min, this.max);

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
  }

  serialize(): SerializedSlider {
    return {
      min: this.min,
      max: this.max,
      value: this.value,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      height: this.height,
      style: this.style,
      id: this.id,
      hitColor: this.hitColor.serialize(),
      type: this.type,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedSlider) {
    return new Slider(node, data.min, data.max, {
      value: data.value,
      propName: data.propName,
      input: data.input,
      output: data.output,
      height: data.height,
      style: data.style,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    });
  }
}

export interface SliderStyle extends UINodeStyle {
  railHeight?: number,
  thumbRadius?: number,
  color?: string,
  thumbColor?: string,
  precision?: number
}
let DefaultSliderStyle = (node: Node, height: number) => {
  return {
    color: '#444',
    thumbColor: '#000',
    railHeight: 3,
    thumbRadius: typeof height !== 'undefined' ? height / 2 : (node.style.rowHeight * 1.5) / 2
  }
}

export interface SerializedSlider extends SerializedUINode {
  min: number,
  max: number,
  value: number,
  height: number
}

interface SliderOptions {
  value?: number,
  propName?: string,
  input?: boolean | SerializedTerminal,
  output?: boolean | SerializedTerminal,
  height?: number,
  style?: SliderStyle,
  id?: string,
  hitColor?: Color
}
let DefaultSliderOptions = (node: Node): SliderOptions => {
  return {
    height: node.style.rowHeight * 1.5
  }
};
