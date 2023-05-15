import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal.js";
import { Node } from "../core/node.js";
import { Vector } from "../core/vector.js";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node.js";
import { Serializable } from "../common/interfaces.js";
import { Color } from "../core/color.js";
import { FlowState } from "../core/flow.js";
import { Label } from "./label.js";
import { Align } from "../common/enums.js";
import { get } from "../utils/utils.js";

export class RadioGroup extends UINode implements Serializable<SerializedRadioGroup> {
  private _values: string[];
  private _selected: string;

  get selected(): string {
    if (this.propName) return this.getProp();
    return this._selected;
  }
  set selected(selected: string) {
    if (!this._values.includes(selected)) selected = this._values[0];

    let oldVal = this.selected;
    let newVal = selected;

    if (this.propName) this.setProp(newVal);
    else this._selected = newVal;

    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, oldVal, newVal);
  }

  constructor(
    node: Node,
    values: string[] = ['default'],
    selected: string = 'default',
    options: RadioGroupOptions = DefaultRadioGroupOptions(node)
  ) {
    super(node, Vector.Zero(), UIType.RadioGroup, {
      style: options.style ? { ...DefaultRadioGroupStyle(), ...options.style } : DefaultRadioGroupStyle(),
      propName: options.propName,
      input: options.input && (typeof options.input === 'boolean'
        ? new Terminal(node, TerminalType.IN, 'boolean', '', {})
        : Terminal.deSerialize(node, options.input)),
      output: options.output && (typeof options.output === 'boolean'
        ? new Terminal(node, TerminalType.OUT, 'boolean', '', {})
        : Terminal.deSerialize(node, options.output)),
      id: options.id,
      hitColor: options.hitColor
    });

    if (values.length === 0) values = ['default'];
    this._values = values;
    let selectedValue = this.propName ? this.getProp() : selected;
    this._selected = this._values.includes(selectedValue) ? selectedValue : this._values[0];
    this.height = get(options.height, this.node.style.rowHeight);

    if (this.input) {
      this.input.on('connect', (_, connector) => {
        if (connector.data) this._selected = connector.data;
      });
      this.input.on('data', (_, data) => {
        if (typeof data !== 'undefined') this._selected = data;
      });
    }
    if (this.output) this.output.on('connect', (_, connector) => connector.data = this._selected);

    this.setupLabels();

    this.node.on('process', () => {
      if (this.output) this.output.setData(this._selected);
    });
  }

  setupLabels() {
    this.children.push(...this._values.map(option => {
      let label = new Label(this.node, option, {
        style: { align: Align.Center, backgroundColor: this.style.backgroundColor, color: this.style.color }
      });

      label.on('click', (selectedLabel: Label) => {
        if (selectedLabel.text === this.selected) return;
        let lastSelectedLabel = this.children[this._values.indexOf(this.selected)];
        Object.assign(lastSelectedLabel.style, {
          backgroundColor: this.style.backgroundColor,
          color: this.style.color
        });
        Object.assign(selectedLabel.style, {
          backgroundColor: this.style.selectedBackgroundColor,
          color: this.style.selectedColor
        });
        this.selected = selectedLabel.text;
      });

      return label;
    }));
    Object.assign(this.children[this._values.indexOf(this._selected)].style, {
      backgroundColor: this.style.selectedBackgroundColor,
      color: this.style.selectedColor
    });
  }

  paint(): void {
    let context = this.context;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = this.style.borderWidth
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);

    let commonWidth = this.width / this.children.length;
    let x = this.position.x + commonWidth;
    for (let i = 0; i < this.children.length - 1; i += 1) {
      context.beginPath();
      context.moveTo(x, this.position.y);
      context.lineTo(x, this.position.y + this.height);
      context.stroke();
      x += commonWidth;
    }
  }
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = this.style.borderColor;
    context.fillStyle = this.style.backgroundColor;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    let x = this.position.x;
    this.children.forEach(child => {
      child.height = this.height;
      child.width = this.width / this.children.length;
      child.position.assign(x, this.position.y);
      x += child.width;
    });

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
    if (!this._values.includes(newVal)) newVal = this._values[0];
    this._selected = newVal;

    this.output && this.output.setData(this._selected);
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

  serialize(): SerializedRadioGroup {
    return {
      values: this._values,
      selected: this.selected,
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
  static deSerialize(node: Node, data: SerializedRadioGroup): RadioGroup {
    return new RadioGroup(node, data.values, data.selected, {
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

export interface RadioGroupStyle extends UINodeStyle {
  color?: string,
  selectedColor?: string,
  backgroundColor?: string,
  selectedBackgroundColor?: string,
  borderColor?: string,
  borderWidth?: number,
}
let DefaultRadioGroupStyle = () => {
  return {
    color: '#000',
    selectedColor: '#fff',
    backgroundColor: 'transparent',
    selectedBackgroundColor: '#555',
    borderColor: '#000',
    borderWidth: 1,
    visible: true
  };
};

export interface SerializedRadioGroup extends SerializedUINode {
  values: string[],
  selected: string,
  height: number
}

interface RadioGroupOptions {
  propName?: string,
  input?: boolean | SerializedTerminal,
  output?: boolean | SerializedTerminal,
  height?: number,
  style?: RadioGroupStyle,
  id?: string,
  hitColor?: Color
}
let DefaultRadioGroupOptions = (node: Node): RadioGroupOptions => {
  return {
    height: node.style.rowHeight * 1.5
  }
};
