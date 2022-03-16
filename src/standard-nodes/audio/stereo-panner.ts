import { Flow } from "../../core/flow";
import { Vector } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp } from "../../utils/utils";
import { Node } from '../../core/node';
import { InputType, Input, Slider, Toggle } from "../../ui/index";

export class StereoPanner extends Node {
  panSlider: Slider;
  panInput: Input;
  bypassToggle: Toggle;
  panner: StereoPannerNode;
  inGain: GainNode;
  outGain: GainNode;

  static DefaultState = { pan: 0, bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Stereo Panner',
      options.position || new Vector(50, 50),
      options.width || 200,
      [{ name: 'in', dataType: 'audio' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {},
        state: options.state ? { ...StereoPanner.DefaultState, ...options.state } : StereoPanner.DefaultState
      }
    )

    this.inGain = flow.flowConnect.audioContext.createGain();
    this.outGain = flow.flowConnect.audioContext.createGain();
    this.panner = new StereoPannerNode(flow.flowConnect.audioContext);
    this.panner.pan.value = this.state.pan;
    this.inputs[0].ref = this.inGain;
    this.outputs[0].ref = this.outGain;

    this.setBypass();

    this.setupUI();

    this.watch('pan', (_oldVal, newVal) => {
      if (newVal < -1 || newVal > 1) this.state.pan = clamp(newVal, -1, 1);
      this.panner.pan.value = this.state.pan;
    });
    this.watch('bypass', this.setBypass.bind(this));

    this.handleAudioConnections();
  }

  setBypass() {
    if (!this.state.bypass) {
      this.inGain.disconnect();
      this.inGain.connect(this.panner);
      this.panner.connect(this.outGain);
    } else {
      this.panner.disconnect();
      this.inGain.disconnect();
      this.inGain.connect(this.outGain);
    }
  }

  setupUI() {
    this.panSlider = this.createSlider(-1, 1, { height: 10, propName: 'pan', style: { grow: .5 } });
    this.panInput = this.createInput({ propName: 'pan', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .15 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Pan', { style: { grow: .3 } }), this.panSlider, this.panInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
