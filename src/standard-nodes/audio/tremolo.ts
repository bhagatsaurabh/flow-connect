import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType, Input } from "../../ui/input";
import { clamp } from "../../utils/utils";
import { Node } from '../../core/node';
import { Slider } from "../../ui/slider";
import { Toggle } from "../../ui/toggle";
let Tuna = require('../../lib/tuna.js');

export class TremoloEffect extends Node {
  intensitySlider: Slider;
  intensityInput: Input;
  stereoPhaseSlider: Slider;
  stereoPhaseInput: Input;
  rateSlider: Slider;
  rateInput: Input;
  bypassToggle: Toggle;
  tremolo: any;

  static DefaultState = { intensity: 0.3, stereoPhase: 0, rate: 5, bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Tremolo Effect',
      options.position || new Vector2(50, 50),
      options.width || 230,
      [{ name: 'in', dataType: 'audio' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {},
        state: options.state ? { ...TremoloEffect.DefaultState, ...options.state } : TremoloEffect.DefaultState
      }
    )

    if (!(window as any).__tuna__) (window as any).__tuna__ = new Tuna(flow.flowConnect.audioContext);

    this.tremolo = new (window as any).__tuna__.Tremolo();
    this.inputs[0].ref = this.outputs[0].ref = this.tremolo;

    Object.assign(this.tremolo, {
      intensity: this.state.intensity,
      stereoPhase: this.state.stereoPhase,
      rate: this.state.rate,
    });

    this.setupUI();

    this.watch('intensity', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 1) this.state.intensity = clamp(newVal, 0, 1);
      this.tremolo.intensity = this.state.intensity;
    });
    this.watch('stereoPhase', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 180) this.state.stereoPhase = clamp(newVal, 0, 180);
      this.tremolo.stereoPhase = this.state.stereoPhase;
    });
    this.watch('rate', (_oldVal, newVal) => {
      if (newVal < 0.1 || newVal > 11) this.state.rate = clamp(newVal, 0.1, 11);
      this.tremolo.rate = this.state.rate;
    });
    this.watch('bypass', (_oldVal, newVal) => this.tremolo.bypass = newVal);

    this.handleAudioConnections();
  }

  setupUI() {
    this.intensitySlider = this.createSlider(0, 1, { height: 10, propName: 'intensity', style: { grow: .5 } });
    this.intensityInput = this.createInput({ propName: 'intensity', height: 20, style: { type: InputType.Number, grow: .2, precision: 4 } });
    this.stereoPhaseSlider = this.createSlider(0, 180, { height: 10, propName: 'stereoPhase', style: { grow: .5 } });
    this.stereoPhaseInput = this.createInput({ propName: 'stereoPhase', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    this.rateSlider = this.createSlider(0.1, 11, { height: 10, propName: 'rate', style: { grow: .5 } });
    this.rateInput = this.createInput({ propName: 'rate', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .1 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Intensity', { style: { grow: .3 } }), this.intensitySlider, this.intensityInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Stereo Phase', { style: { grow: .3 } }), this.stereoPhaseSlider, this.stereoPhaseInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Rate', { style: { grow: .3 } }), this.rateSlider, this.rateInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
