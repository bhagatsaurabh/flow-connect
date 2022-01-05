import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";
import { Source } from "../../ui/index";

export class FileSource extends Node {
  fileInput: Source

  static DefaultState: any = { file: null };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'File Source', options.position || new Vector2(50, 50), options.width || 130, [],
      [{ name: 'file', dataType: 'file' }],
      {
        state: options.state ? { ...FileSource.DefaultState, ...options.state } : FileSource.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.fileInput.on('change', () => this.process());
    this.on('process', () => this.process());
  }

  process() { this.setOutputs(0, this.state.file); }
  setupUI() {
    this.fileInput = this.createSource({ propName: 'file', input: true, output: true, height: 20 });
    this.ui.append(this.fileInput);
  }
}
