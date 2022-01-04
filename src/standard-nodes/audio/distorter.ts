import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from '../../core/node';
import { Toggle } from "../../ui/toggle";
import { Select } from "../../ui/select";
import { Input, InputType } from "../../ui/input";
import { clamp } from "../../utils/utils";

export class Distorter extends Node {
  amountInput: Input;
  oversampleSelect: Select;
  bypassToggle: Toggle;

  distorter: WaveShaperNode;
  inGain: GainNode;
  outGain: GainNode;

  oversampleOptions = ['none', '2x', '4x'];

  static DefaultState = { oversample: 'none', amount: 50, bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Distorter',
      options.position || new Vector2(50, 50),
      options.width || 200,
      [{ name: 'in', dataType: 'audio' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {},
        state: options.state ? { ...Distorter.DefaultState, ...options.state } : Distorter.DefaultState
      }
    )

    this.inGain = flow.flowConnect.audioContext.createGain();
    this.outGain = flow.flowConnect.audioContext.createGain();
    this.distorter = flow.flowConnect.audioContext.createWaveShaper();
    this.distorter.oversample = 'none';
    this.distorter.curve = this.makeDistortionCurve(400);

    this.inputs[0].ref = this.inGain;
    this.outputs[0].ref = this.outGain;

    this.setBypass();

    this.setupUI();

    this.watch('oversample', (_oldVal, newVal) => {
      if (!this.oversampleOptions.includes(newVal)) this.state.oversample = 'none';
      this.distorter.oversample = this.state.oversample;
    });
    this.watch('amount', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 1000) this.state.amount = clamp(parseInt(newVal), 0, 1000);
      this.distorter.curve = this.makeDistortionCurve(parseInt(this.state.amount));
    });
    this.watch('bypass', this.setBypass.bind(this));

    this.handleAudioConnections();
  }

  makeDistortionCurve(amount: number) {
    let k = typeof amount === 'number' ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
    for (; i < n_samples; ++i) {
      x = i * 2 / n_samples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
  setBypass() {
    if (!this.state.bypass) {
      this.inGain.disconnect();
      this.inGain.connect(this.distorter);
      this.distorter.connect(this.outGain);
    } else {
      this.distorter.disconnect();
      this.inGain.disconnect();
      this.inGain.connect(this.outGain);
    }
  }

  setupUI() {
    this.amountInput = this.createInput({ propName: 'amount', height: 20, style: { grow: 1, type: InputType.Number, precision: 0 } });
    this.oversampleSelect = this.createSelect(this.oversampleOptions, { height: 15, propName: 'oversample', style: { grow: 1 } });
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .15 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Amount'), this.amountInput], { style: { spacing: 10 } }),
      this.createHozLayout([this.createLabel('Oversample'), this.oversampleSelect], { style: { spacing: 10 } }),
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
