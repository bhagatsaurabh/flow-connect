import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";
import { Select, Toggle } from "../../ui/index";

export class BiquadFilter extends Node {
  typeSelect: Select;
  bypassToggle: Toggle

  inGain: GainNode;
  outGain: GainNode;
  biquadFilter: BiquadFilterNode;

  static DefaultState = { filterType: 'lowpass', bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Biquad Filter', options.position || new Vector2(50, 50), options.width || 230,
      [
        { name: 'in', dataType: 'audio' }, { name: 'gain', dataType: 'audioparam' },
        { name: 'Q', dataType: 'audioparam' }, { name: 'frequency', dataType: 'audioparam' },
        { name: 'detune', dataType: 'audioparam' }
      ],
      [{ name: 'out', dataType: 'audio' }],
      {
        state: options.state ? { ...BiquadFilter.DefaultState, ...options.state } : BiquadFilter.DefaultState,
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.inGain = flow.flowConnect.audioContext.createGain();
    this.outGain = flow.flowConnect.audioContext.createGain();
    this.inputs[0].ref = this.inGain;
    this.outputs[0].ref = this.outGain;

    this.biquadFilter = flow.flowConnect.audioContext.createBiquadFilter();
    this.biquadFilter.gain.value = 0;
    this.biquadFilter.Q.value = 1;
    this.biquadFilter.frequency.value = 800;
    this.biquadFilter.detune.value = 0;
    this.biquadFilter.type = this.state.filterType;

    this.inputs[1].ref = this.biquadFilter.gain;
    this.inputs[2].ref = this.biquadFilter.Q;
    this.inputs[3].ref = this.biquadFilter.frequency;
    this.inputs[4].ref = this.biquadFilter.detune;
    this.inputs[1].on('data', (_, data) => typeof data === 'number' && (this.inputs[1].ref.value = data));
    this.inputs[2].on('data', (_, data) => typeof data === 'number' && (this.inputs[2].ref.value = data));
    this.inputs[3].on('data', (_, data) => typeof data === 'number' && (this.inputs[3].ref.value = data));
    this.inputs[4].on('data', (_, data) => typeof data === 'number' && (this.inputs[4].ref.value = data));

    this.setBypass();
    this.setupUI();

    this.typeSelect.on('change', () => {
      this.biquadFilter.type = this.state.filterType
    });
    this.watch('bypass', () => this.setBypass());

    this.handleAudioConnections();
  }

  setBypass() {
    if (!this.state.bypass) {
      this.inGain.disconnect();
      this.inGain.connect(this.biquadFilter);
      this.biquadFilter.connect(this.outGain);
    } else {
      this.biquadFilter.disconnect();
      this.inGain.disconnect();
      this.inGain.connect(this.outGain);
    }
  }
  setupUI() {
    this.typeSelect = this.createSelect(
      ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'],
      { propName: 'filterType', height: 15, style: { grow: .7 } }
    );
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .1 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Type', { style: { grow: .3 } }), this.typeSelect], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
