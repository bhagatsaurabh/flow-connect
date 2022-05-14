import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { Node } from "../../core/node.js";
import { Toggle } from "../../ui/index.js";

export class Convolver extends Node {
  bypassToggle: Toggle

  inGain: GainNode;
  outGain: GainNode;
  convolver: ConvolverNode;

  static DefaultState = { bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Convolver', options.position || new Vector(50, 50), options.width || 160,
      [{ name: 'in', dataType: 'audio' }, { name: 'impulse', dataType: 'audio-buffer' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        state: options.state ? { ...Convolver.DefaultState, ...options.state } : Convolver.DefaultState,
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.inGain = flow.flowConnect.audioContext.createGain();
    this.outGain = flow.flowConnect.audioContext.createGain();
    this.convolver = flow.flowConnect.audioContext.createConvolver();

    this.inputs[0].ref = this.inGain;
    this.outputs[0].ref = this.outGain;

    this.setBypass();

    this.setupUI();

    this.watch('bypass', () => this.setBypass());
    this.inputs[1].on('data', (_inst, data) => {
      this.convolver.buffer = data;
    });

    this.handleAudioConnections();
  }
  setBypass() {
    if (!this.state.bypass) {
      this.inGain.disconnect();
      this.inGain.connect(this.convolver);
      this.convolver.connect(this.outGain);
    } else {
      this.inGain.disconnect();
      this.convolver.disconnect();
      this.inGain.connect(this.outGain);
    }
  }
  setupUI() {
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .25 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Bypass ?'), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
