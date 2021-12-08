import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal";
import { Node } from "../core/node";
import { Vector2 } from "../core/vector";
import { Label } from "./label";
import { SerializedUINode, UINode, UIType } from "./ui-node";
import { Constant } from "../resource/constants";
import { Serializable } from "../common/interfaces";
import { Color } from "../core/color";
import { FlowState } from "../core/flow";
import { Align } from "../common/enums";

export class Select extends UINode implements Serializable {
  label: Label;
  private _selected: string;

  get selected(): string {
    if (this.propName) {
      let value = this.getProp();
      value = this.options.length === 0 ? 'None' : (this.options.includes(value) ? value : this.options[0]);
      return value;
    }
    return this._selected;
  }
  set selected(selected: string) {
    let value = this.options.length === 0 ? 'None' : (this.options.includes(selected) ? selected : this.options[0]);
    if (this.propName) this.setProp(value);
    else {
      this._selected = value;
      this.label.text = this.selected;
    }
    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, this.selected);
  }

  constructor(
    node: Node,
    public options: string[] = [],
    propName?: string,
    input?: boolean | SerializedTerminal,
    output?: boolean | SerializedTerminal,
    height?: number,
    style: SelectStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Select, false, false, { ...DefaultSelectStyle(), ...style }, propName,
      input ?
        (typeof input === 'boolean' ?
          new Terminal(node, TerminalType.IN, 'string', '', {}) :
          Terminal.deSerialize(node, input)
        ) :
        null,
      output ?
        (typeof output === 'boolean' ?
          new Terminal(node, TerminalType.OUT, 'string', '', {}) :
          Terminal.deSerialize(node, output)
        ) :
        null,
      id, hitColor
    );
    this.height = height ? height : this.node.style.rowHeight;
    this._selected = this.options.length === 0 ? 'None' : this.options[0];
    this.label = new Label(this.node, this.selected, null, false, false, { align: Align.Center, ...this.style }, this.height);
    this.children.push(this.label);

    if (this.input) {
      this.input.on('connect', (_, connector) => {
        if (connector.data) this.selected = connector.data;
      });
      this.input.on('data', (_, data) => {
        if (data) this.selected = data;
      });
    }
    if (this.output) this.output.on('connect', (_, connector) => connector.data = this.selected);

    this.node.on('process', () => {
      if (this.output) (this.output as any).setData(this.selected);
    });
  }

  /** @hidden */
  paint(): void {
    let context = this.context;
    context.fillStyle = this.style.arrowColor;
    context.beginPath();
    context.moveTo(this.position.x, this.position.y + this.height / 2);
    context.lineTo(this.position.x + this.height * Constant.SIN_60, this.position.y);
    context.lineTo(this.position.x + this.height * Constant.SIN_60, this.position.y + this.height);
    context.lineTo(this.position.x, this.position.y + this.height / 2);
    context.closePath();
    context.fill();

    context.fillStyle = this.style.arrowColor;
    context.beginPath();
    context.moveTo(this.position.x + this.width, this.position.y + this.height / 2);
    context.lineTo(this.position.x + this.width - (this.height * Constant.SIN_60), this.position.y);
    context.lineTo(this.position.x + this.width - (this.height * Constant.SIN_60), this.position.y + this.height);
    context.lineTo(this.position.x + this.width, this.position.y + this.height / 2);
    context.closePath();
    context.fill();
  }
  /** @hidden */
  paintLOD1() {
    let context = this.context;
    context.fillStyle = this.style.arrowColor;
    context.strokeStyle = '#000';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  reflow(): void {
    this.label.width = this.width * .7;
    this.label.position.x = this.position.x + this.width * .15;
    this.label.position.y = this.position.y + this.height / 2 - this.label.height / 2;

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
  onPropChange(_: any, newValue: any) {
    let value = this.options.length === 0 ? 'None' : (this.options.includes(newValue) ? newValue : this.options[0]);
    this._selected = value;
    this.label.text = this.selected;

    this.output && (this.output as any)['setData'](this.selected);
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

    if (this.options.length === 0) return;
    let direction;
    if (realPosition.x < this.position.x + this.width * .15) {
      direction = -1;
    } else if (realPosition.x > this.position.x + this.width * .85) {
      direction = 1;
    } else return;
    this.selected = this.options[(((this.options.indexOf(this.selected) + direction) % this.options.length) + this.options.length) % this.options.length];
    this.label.text = this.selected;
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

  serialize(): SerializedSelect {
    return {
      id: this.id,
      type: this.type,
      hitColor: this.hitColor.serialize(),
      style: this.style,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      options: this.options,
      height: this.height,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedSelect): Select {
    return new Select(node, data.options, data.propName, data.input, data.output, data.height, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}

export interface SelectStyle {
  font?: string,
  fontSize?: string,
  color?: string,
  arrowColor?: string
}

export interface SerializedSelect extends SerializedUINode {
  options: string[],
  height: number
}

/** @hidden */
let DefaultSelectStyle = () => {
  return {
    arrowColor: '#000'
  };
};