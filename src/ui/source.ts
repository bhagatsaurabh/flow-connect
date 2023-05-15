import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal.js";
import { Node } from "../core/node.js";
import { Vector } from "../core/vector.js";
import { fileIcon } from "../resource/icons.js";
import { Image } from "./image.js";
import { Label } from "./label.js";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node.js";
import { DataFetchProvider, DataPersistenceProvider, Serializable } from "../common/interfaces.js";
import { Color } from "../core/color.js";
import { FlowState } from "../core/flow.js";
import { Align } from "../common/enums.js";
import { get, getNewUUID } from "../utils/utils.js";

export class Source extends UINode implements Serializable<SerializedSource> {
  private htmlInput: HTMLInputElement;
  private fileIcon: Image;
  private _file: File;

  label: Label;
  accept: string;

  get file(): File {
    if (this.propName) return this.getProp();
    return this._file;
  }
  set file(file: File) {
    let oldVal = this.file;
    let newVal = file;

    if (this.propName) this.setProp(newVal);
    else {
      this._file = newVal;
      this.label.text = newVal.name.substring(0, this._file.name.toString().lastIndexOf('.'));
    }

    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, oldVal, newVal);
  }

  constructor(
    node: Node,
    options: SourceOptions = DefaultSourceOptions(node)
  ) {

    super(node, Vector.Zero(), UIType.Source, {
      style: options.style ? { ...DefaultSourceStyle(), ...options.style } : DefaultSourceStyle(),
      propName: options.propName,
      input: options.input && (typeof options.input === 'boolean'
        ? new Terminal(node, TerminalType.IN, 'file', '', {})
        : Terminal.deSerialize(node, options.input)),
      output: options.output && (typeof options.output === 'boolean'
        ? new Terminal(node, TerminalType.OUT, 'file', '', {})
        : Terminal.deSerialize(node, options.output)),
      id: options.id,
      hitColor: options.hitColor
    });

    this.accept = options.accept;
    this.height = get(options.height, this.node.style.rowHeight);

    this.setupInputElement(options);

    this.label = new Label(this.node, 'Select', { style: { align: Align.Center, ...this.style }, height: this.height });
    this.fileIcon = new Image(this.node, fileIcon);
    this.label.on('click', () => this.htmlInput.click());
    this.children.push(this.label, this.fileIcon);

    if (this.input) {
      this.input.on('connect', (_, connector) => {
        if (connector.data) this.file = connector.data;
      });
      this.input.on('data', (_, data) => {
        if (data) this.file = data;
      });
    }
    if (this.output) this.output.on('connect', (_, connector) => connector.data = this.file);

    this.node.on('process', () => {
      if (this.output) this.output.setData(this.file);
    });

    if (options.file) this.file = options.file
  }

  setupInputElement(options: SourceOptions) {
    this.htmlInput = document.createElement('input');
    this.htmlInput.type = 'file';
    if (options.accept) this.htmlInput.accept = options.accept;
    this.htmlInput.onchange = () => {
      if (this.htmlInput.files.length > 0) {
        let oldVal = this.file;
        this.file = this.htmlInput.files[0];
        if (this.node.flow.state === FlowState.Stopped) this.call('upload', this, oldVal, this.file);
      }
    };
  }

  paint(): void {
    this.context.strokeStyle = this.style.borderColor;
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = this.style.borderColor;
    context.fillStyle = this.style.color;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    this.label.width = this.width;
    this.label.height = this.height;
    this.label.position = this.position;

    this.fileIcon.width = this.width * .1;
    this.fileIcon.position.assign(this.position.x + 5, this.position.y + this.height / 2 - this.fileIcon.height / 2);

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
    this._file = newVal;
    this.label.text = this._file.name.substring(0, this._file.name.toString().lastIndexOf('.'));

    this.output && this.output.setData(this._file);
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

  async serialize(persist?: DataPersistenceProvider): Promise<SerializedSource> {
    let file = null;
    if (persist && this.file) {
      file = { id: getNewUUID(), name: this.file.name };
      await persist(file.id, this.file);
    }

    return Promise.resolve<SerializedSource>({
      accept: this.accept,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      height: this.height,
      style: this.style,
      id: this.id,
      hitColor: this.hitColor.serialize(),
      type: this.type,
      childs: [],
      file
    });
  }
  static async deSerialize(node: Node, data: SerializedSource, receive?: DataFetchProvider): Promise<Source> {
    let file = null;
    if (data.file) {
      const blob = await receive(data.file.id);
      file = new File([blob], data.file.name);
    }

    return Promise.resolve(new Source(node, {
      accept: data.accept,
      propName: data.propName,
      input: data.input,
      output: data.output,
      height: data.height,
      style: data.style,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor),
      file
    }));
  }
}

export interface SourceStyle extends UINodeStyle {
  borderColor?: string,
  font?: string,
  fontSize?: string,
  color?: string
}
let DefaultSourceStyle = () => {
  return {
    borderColor: '#000',
    visible: true
  };
};

export interface SerializedSource extends SerializedUINode {
  accept: string,
  height: number,
  file: {
    id: string,
    name: string
  }
}

interface SourceOptions {
  accept?: string,
  propName?: string,
  input?: boolean | SerializedTerminal,
  output?: boolean | SerializedTerminal,
  height?: number,
  style?: SourceStyle,
  id?: string,
  hitColor?: Color,
  file?: File
}
let DefaultSourceOptions = (node: Node): SourceOptions => {
  return {
    height: node.style.rowHeight * 1.5
  }
};
