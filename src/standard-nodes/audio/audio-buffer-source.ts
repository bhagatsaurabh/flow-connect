import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";
import { Source } from "../../ui/index";

export class AudioBufferSource extends Node {
  fileInput: Source

  static DefaultState: any = { file: null, buffer: null };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'AudioBuffer Source', options.position || new Vector2(50, 50), options.width || 170,
      [],
      [{ name: 'buffer', dataType: 'audio-buffer' }],
      {
        state: options.state ? { ...AudioBufferSource.DefaultState, ...options.state } : AudioBufferSource.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.fileInput.on('change', () => this.processFile());
    this.on('process', () => this.processFile());
  }

  async processFile() {
    let file = this.state.file;
    if (!file) return;

    let cached = this.flow.flowConnect.arrayBufferCache.get(file.name + file.type);
    if (!cached) {
      cached = await file.arrayBuffer();
      this.flow.flowConnect.arrayBufferCache.set(file.name + file.type, cached);
    }
    this.processArrayBuffer(cached);
  }
  async processArrayBuffer(arrayBuffer: ArrayBuffer) {
    let cached = this.flow.flowConnect.audioBufferCache.get(arrayBuffer);
    if (!cached) {
      cached = await this.flow.flowConnect.audioContext.decodeAudioData(arrayBuffer);
      this.flow.flowConnect.audioBufferCache.set(arrayBuffer, cached);
    }
    this.state.buffer = cached;
    this.setOutputs(0, this.state.buffer);
  }
  setupUI() {
    this.fileInput = this.createSource({ height: 20, propName: 'file', style: { grow: 1 } });
    this.ui.append(this.createHozLayout([
      this.createLabel('File'), this.fileInput
    ], { style: { spacing: 20 } }));
  }
}
