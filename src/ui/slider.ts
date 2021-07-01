import { Terminal } from "../core/terminal";
import { Node } from "../core/node";
import { Vector2 } from "../math/vector";
import { clamp, denormalize, normalize } from "../utils/utils";
import { UINode } from "./ui-node";
import { Constant, TerminalType, UIType } from "../math/constants";
import { Serializable, SerializedSlider, SerializedTerminal, SliderStyle } from "../core/interfaces";
import { Color } from "../core/color";

export class Slider extends UINode implements Serializable {
  thumbFill: number;
  _value: number;

  get value(): number {
    if (this.propName) return this.node.props[this.propName];
    return this._value;
  }
  set value(value: number) {
    value = clamp(value, this.min, this.max);
    if (this.propName) this.node.props[this.propName] = value;
    else {
      this._value = value;
      this.call('change', this, this.value);
      this.reflow();
    }
  }

  constructor(
    node: Node,
    public min: number, public max: number,
    value: number,
    public precision: number = 0,
    propName?: string,
    input?: boolean | SerializedTerminal,
    output?: boolean | SerializedTerminal,
    height?: number,
    style: SliderStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Slider, true, { ...Constant.DefaultSliderStyle(height), ...style }, propName,
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

    this.height = height ? height : this.node.style.rowHeight;
    this.value = parseFloat(value.toFixed(this.precision));

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
    this.context.lineWidth = this.style.railHeight;
    this.context.strokeStyle = this.style.color;
    this.context.lineCap = 'butt';

    let start = Math.max(this.position.x, this.position.x + this.thumbFill - 3);
    if (start !== this.position.x) {
      this.context.beginPath();
      this.context.moveTo(this.position.x, this.position.y + this.height / 2);
      this.context.lineTo(start, this.position.y + this.height / 2);
      this.context.stroke();
    }
    start = Math.min(this.position.x + 2 * this.style.thumbRadius + this.thumbFill + 3, this.position.x + this.width);
    if (start !== (this.position.x + this.width)) {
      this.context.beginPath();
      this.context.moveTo(start, this.position.y + this.height / 2);
      this.context.lineTo(this.position.x + this.width, this.position.y + this.height / 2);
      this.context.stroke();
    }

    this.context.fillStyle = this.style.thumbColor;
    this.context.beginPath();
    this.context.arc(this.position.x + this.style.thumbRadius + this.thumbFill, this.position.y + this.height / 2, this.style.thumbRadius, 0, 2 * Math.PI);
    this.context.fill();
  }
  paintLOD1() {
    this.context.strokeStyle = '#000';
    this.context.fillStyle = this.style.color;
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  reflow(): void {
    this.thumbFill = denormalize(normalize(this.value, this.min, this.max), 0, this.width - 2 * this.style.thumbRadius);

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
    this._value = newValue;
    this.reflow();
    this.call('change', this, this.value);

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

    let y = this.position.y + this.height / 2 - this.style.railHeight / 2;
    this.thumbFill = realPosition.clamp(this.position.x + this.style.thumbRadius, this.position.x + this.width - this.style.thumbRadius, y, y).subtract(this.position.x + this.style.thumbRadius, 0).x;
    this.value = parseFloat(denormalize(normalize(this.thumbFill, 0, this.width - 2 * this.style.thumbRadius), this.min, this.max).toFixed(this.precision));
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

  serialize(): SerializedSlider {
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
      precision: this.precision,
      height: this.height,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedSlider) {
    return new Slider(node, data.min, data.max, data.value, data.precision, data.propName, data.input, data.output, data.height, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}
