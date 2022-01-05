import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp } from "../../utils/utils";
import { Node } from '../../core/node';
import { InputType, Input, Slider, Toggle } from "../../ui/index";
let Tuna = require('../../lib/tuna.js');

export class ChorusEffect extends Node {
  delaySlider: Slider;
  delayInput: Input;
  feedbackSlider: Slider;
  feedbackInput: Input;
  rateSlider: Slider;
  rateInput: Input;
  bypassToggle: Toggle;
  depthSlider: Slider;
  depthInput: Input;
  chorus: any;

  static DefaultState = { feedback: 0.4, delay: 0.0045, depth: 0.7, rate: 0.01, bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Chorus Effect',
      options.position || new Vector2(50, 50),
      options.width || 230,
      [{ name: 'in', dataType: 'audio' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {},
        state: options.state ? { ...ChorusEffect.DefaultState, ...options.state } : ChorusEffect.DefaultState
      }
    )

    if (!(window as any).__tuna__) (window as any).__tuna__ = new Tuna(flow.flowConnect.audioContext);

    this.chorus = new (window as any).__tuna__.Chorus();
    this.inputs[0].ref = this.outputs[0].ref = this.chorus;
    this.setupUI();
    Object.assign(this.chorus, {
      delay: this.state.delay,
      depth: this.state.depth,
      feedback: this.state.feedback,
      rate: this.state.rate
    });

    this.watch('delay', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 1) this.state.delay = clamp(newVal, 0, 1);
      this.chorus.delay = this.state.delay;
    });
    this.watch('depth', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 1) this.state.depth = clamp(newVal, 0, 1);
      this.chorus.depth = this.state.depth;
    });
    this.watch('feedback', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 0.95) this.state.feedback = clamp(newVal, 0, 0.95);
      this.chorus.feedback = this.state.feedback;
    });
    this.watch('rate', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 0.1) this.state.rate = clamp(newVal, 0, 0.1);
      this.chorus.rate = this.state.rate;
    });
    this.watch('bypass', (_oldVal, newVal) => this.chorus.bypass = newVal);

    this.handleAudioConnections();
  }

  setupUI() {
    this.delaySlider = this.createSlider(0, 1, { height: 10, propName: 'delay', style: { grow: .5 } });
    this.delayInput = this.createInput({ propName: 'delay', height: 20, style: { type: InputType.Number, grow: .2, precision: 4 } });
    this.depthSlider = this.createSlider(0, 1, { height: 10, propName: 'depth', style: { grow: .5 } });
    this.depthInput = this.createInput({ propName: 'depth', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    this.feedbackSlider = this.createSlider(0, 0.95, { height: 10, propName: 'feedback', style: { grow: .5 } });
    this.feedbackInput = this.createInput({ propName: 'feedback', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    this.rateSlider = this.createSlider(0, 0.1, { height: 10, propName: 'rate', style: { grow: .5 } });
    this.rateInput = this.createInput({ propName: 'rate', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .1 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Delay', { style: { grow: .3 } }), this.delaySlider, this.delayInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Depth', { style: { grow: .3 } }), this.depthSlider, this.depthInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Feedback', { style: { grow: .3 } }), this.feedbackSlider, this.feedbackInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Rate', { style: { grow: .3 } }), this.rateSlider, this.rateInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
