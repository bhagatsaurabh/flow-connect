import { TerminalType } from "../core/terminal.js";
import { Node } from "../core/node.js";
import { fileIcon } from "../resource/icons.js";
import { Image, ImageOptions } from "./image.js";
import { Label, LabelOptions } from "./label.js";
import { UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { FlowState } from "../core/flow.js";
import { Align } from "../common/enums.js";

export class Source extends UINode<SourceStyle> {
  style: SourceStyle;

  private htmlInput: HTMLInputElement;
  private fileIcon: Image;
  private _file: File;

  label: Label;
  accept: string;
  actionOverride = false;

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
      this.label.text = newVal.name.substring(0, this._file.name.toString().lastIndexOf("."));
    }

    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, newVal);
  }

  constructor(node: Node, _options: SourceOptions = DefaultSourceOptions(node)) {
    super();
  }

  protected created(options: SourceOptions): void {
    options = { ...DefaultSourceOptions(this.node), ...options };
    const { style = {}, height, accept, input, output, file, actionOverride } = options;

    this.style = { ...DefaultSourceStyle(), ...style };
    this.accept = accept;
    this.actionOverride = actionOverride;
    this.height = height ?? this.node.style.rowHeight;

    this.setupInputElement(options);

    this.label = this.node.createUI<Label, LabelOptions>("core/label", {
      text: "Select",
      style: { align: Align.Center, ...this.style },
      height: this.height,
    });
    this.fileIcon = this.node.createUI<Image, ImageOptions>("core/image", {
      src: fileIcon,
    });
    this.label.on("click", () => !this.actionOverride && this.htmlInput.click());
    this.children.push(this.label, this.fileIcon);

    if (input) {
      const terminal = this.createTerminal(TerminalType.IN, "file");
      terminal.on("connect", (_, connector) => {
        if (connector.data) this.file = connector.data;
      });
      terminal.on("data", (_, data) => {
        if (data) this.file = data;
      });
    }
    if (output) {
      const terminal = this.createTerminal(TerminalType.OUT, "file");
      terminal.on("connect", (_, connector) => (connector.data = this.file));
    }

    this.node.on("process", () => {
      this.output?.setData(this.file);
    });

    if (file) this.file = options.file;
  }

  setupInputElement(options: SourceOptions) {
    this.htmlInput = document.createElement("input");
    this.htmlInput.type = "file";
    if (options.accept) this.htmlInput.accept = options.accept;
    this.htmlInput.onchange = () => {
      if (this.htmlInput.files.length > 0) {
        let oldVal = this.file;
        this.file = this.htmlInput.files[0];
        if (this.node.flow.state === FlowState.Stopped) this.call("upload", this, oldVal, this.file);
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

    this.fileIcon.width = this.width * 0.1;
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
    this.label.text = this._file ? this._file.name.substring(0, this._file.name.toString().lastIndexOf(".")) : "Select";

    this.output?.setData(this._file);
  }
}

export interface SourceStyle extends UINodeStyle {
  borderColor?: string;
  font?: string;
  fontSize?: string;
  color?: string;
}
const DefaultSourceStyle = (): SourceStyle => ({
  borderColor: "#000",
});

export interface SourceOptions extends UINodeOptions<SourceStyle> {
  accept?: string;
  file?: File;
  actionOverride?: boolean;
}
const DefaultSourceOptions = (node: Node): SourceOptions => ({
  height: node.style.rowHeight * 1.5,
});
