import { Terminal } from "../core/terminal";
import { Node } from "../core/node";
import { Vector2 } from "../math/vector";
import { fileIcon } from "../resource/icons";
import { Image } from "./image";
import { Label } from "./label";
import { UINode } from "./ui-node";
import { Align, Constant, TerminalType, UIType } from "../math/constants";
import { Serializable, SerializedSource, SerializedTerminal, SourceStyle } from "../core/interfaces";
import { Color } from "../core/color";

export class Source extends UINode implements Serializable {
  label: Label;

  private htmlInput: HTMLInputElement;
  private fileIcon: Image;
  private _file: File;

  get file(): File {
    if (this.propName) return this.node.props[this.propName];
    return this._file;
  }
  set file(file: File) {
    if (this.propName) this.node.props[this.propName] = file;
    else {
      this._file = file;
      this.label.text = this._file.name.substring(0, this._file.name.toString().lastIndexOf("."));
    }

    this.call('change', this, file);
  }

  constructor(
    node: Node,
    public accept?: string,
    propName?: string,
    input?: boolean | SerializedTerminal,
    output?: boolean | SerializedTerminal,
    height?: number,
    style: SourceStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Source, false, { ...Constant.DefaultSourceStyle(), ...style }, propName,
      input ?
        (typeof input === 'boolean' ?
          new Terminal(node, TerminalType.IN, 'file', '', {}) :
          Terminal.deSerialize(node, input)
        ) :
        null,
      output ?
        (typeof output === 'boolean' ?
          new Terminal(node, TerminalType.OUT, 'file', '', {}) :
          Terminal.deSerialize(node, output)
        ) :
        null,
      id, hitColor
    );

    this.height = height ? height : this.node.style.rowHeight;

    this.htmlInput = document.createElement('input');
    this.htmlInput.type = 'file';
    (accept) && (this.htmlInput.accept = accept);
    this.htmlInput.onchange = () => {
      if (this.htmlInput.files.length > 0) {
        this.file = this.htmlInput.files[0];
      }
    };

    this.label = new Label(this.node, 'Select', null, false, false, { align: Align.Center, ...this.style }, this.height);
    this.label.on('click', () => this.htmlInput.click());

    this.fileIcon = new Image(this.node, fileIcon);
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
      if (this.output) (this.output as any).setData(this.file);
    });
  }

  /** @hidden */
  paint(): void {
    this.context.strokeStyle = this.style.borderColor;
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = this.style.borderColor;
    context.fillStyle = this.style.color;
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
    this.label.width = this.width;
    this.label.height = this.height;
    this.label.position = this.position;

    this.fileIcon.width = this.width * .1;
    this.fileIcon.position.x = this.position.x + 5;
    this.fileIcon.position.y = this.position.y + this.height / 2 - this.fileIcon.height / 2;

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
    this._file = newValue;
    this.label.text = this._file.name.substring(0, this._file.name.toString().lastIndexOf("."));

    this.output && (this.output as any)['setData'](this._file);
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
  onContextMenu(): void {
    if (this.disabled) return;
  }

  serialize(): SerializedSource {
    return {
      id: this.id,
      type: this.type,
      hitColor: this.hitColor.serialize(),
      style: this.style,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      accept: this.accept,
      height: this.height,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedSource) {
    return new Source(node, data.accept, data.propName, data.input, data.output, data.height, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}
