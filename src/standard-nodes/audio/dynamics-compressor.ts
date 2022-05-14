import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { clamp } from "../../utils/utils.js";
import { Node } from "../../core/node.js";
import { Toggle } from "../../ui/index.js";

export class DynamicsCompressor extends Node {
  bypassToggle: Toggle;

  inGain: GainNode;
  outGain: GainNode;
  compressor: DynamicsCompressorNode;

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Dynamics Compressor', options.position || new Vector(50, 50), options.width || 230,
      [
        { name: 'in', dataType: 'audio' }, { name: 'threshold', dataType: 'audioparam' },
        { name: 'ratio', dataType: 'audioparam' }, { name: 'knee', dataType: 'audioparam' },
        { name: 'attack', dataType: 'audioparam' }, { name: 'release', dataType: 'audioparam' }
      ],
      [{ name: 'out', dataType: 'audio' }],
      {
        state: options.state ? { bypass: false, ...options.state } : { bypass: false },
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.inGain = flow.flowConnect.audioContext.createGain();
    this.outGain = flow.flowConnect.audioContext.createGain();
    this.compressor = flow.flowConnect.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -20;
    this.compressor.ratio.value = 4;
    this.compressor.knee.value = 5;
    this.compressor.attack.value = 0.01;
    this.compressor.release.value = 0.12;

    this.inputs[0].ref = this.inGain;
    this.inputs[1].ref = this.compressor.threshold;
    this.inputs[2].ref = this.compressor.ratio;
    this.inputs[3].ref = this.compressor.knee;
    this.inputs[4].ref = this.compressor.attack;
    this.inputs[5].ref = this.compressor.release;
    this.outputs[0].ref = this.outGain;

    this.inputs[1].on('data', (_, data) => typeof data === 'number' && (this.inputs[1].ref.value = clamp(data, -100, 0)));
    this.inputs[2].on('data', (_, data) => typeof data === 'number' && (this.inputs[2].ref.value = clamp(data, 1, 20)));
    this.inputs[3].on('data', (_, data) => typeof data === 'number' && (this.inputs[3].ref.value = clamp(data, 0, 40)));
    this.inputs[4].on('data', (_, data) => typeof data === 'number' && (this.inputs[4].ref.value = clamp(data, 0, 1)));
    this.inputs[5].on('data', (_, data) => typeof data === 'number' && (this.inputs[5].ref.value = clamp(data, 0, 1)));

    this.setBypass();

    this.setupUI();

    this.watch('bypass', () => this.setBypass());

    this.handleAudioConnections();
  }

  setBypass() {
    if (this.state.bypass) {
      this.compressor.disconnect();
      this.inGain.disconnect();
      this.inGain.connect(this.outGain);
    } else {
      this.inGain.disconnect();
      this.inGain.connect(this.compressor);
      this.compressor.connect(this.outGain);
    }
  }
  setupUI() {
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .1 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
