import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { clamp } from "../../utils/utils.js";
import { Node } from "../../core/node.js";
import { InputType, Slider } from "../../ui/index.js";

export class DelayEffect extends Node {
  delaySlider: Slider;
  feedbackSlider: Slider;
  cutoffSlider: Slider;
  drySlider: Slider;
  wetSlider: Slider;

  inGain: GainNode;
  outGain: GainNode;
  dryGain: GainNode;
  wetGain: GainNode;
  filter: BiquadFilterNode;
  delay: DelayNode;
  feedbackNode: GainNode;

  static DefaultState = { feedback: 0.45, cutoff: 20000, wet: 0.5, dry: 1, delayTime: 100, bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Delay', options.position || new Vector(50, 50), options.width || 230,
      [{ name: 'in', dataType: 'audio' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        state: options.state ? { ...DelayEffect.DefaultState, ...options.state } : DelayEffect.DefaultState,
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.inGain = flow.flowConnect.audioContext.createGain();
    this.outGain = flow.flowConnect.audioContext.createGain();
    this.dryGain = flow.flowConnect.audioContext.createGain();
    this.wetGain = flow.flowConnect.audioContext.createGain();
    this.filter = flow.flowConnect.audioContext.createBiquadFilter();
    this.delay = flow.flowConnect.audioContext.createDelay(10);
    this.feedbackNode = flow.flowConnect.audioContext.createGain();
    this.state.filterType = 'lowpass';

    this.delay.delayTime.value = this.state.delayTime / 1000;
    this.feedbackNode.gain.value = this.state.feedback;
    this.filter.frequency.value = this.state.cutoff;
    this.wetGain.gain.value = this.state.wet;
    this.dryGain.gain.value = this.state.dry;

    this.inputs[0].ref = this.inGain;
    this.outputs[0].ref = this.outGain;

    this.delay.connect(this.filter);
    this.filter.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delay);
    this.feedbackNode.connect(this.wetGain);

    this.setBypass();

    this.setupUI();

    let delayChanged = () => this.delay.delayTime.value = this.state.delayTime / 1000;
    this.delaySlider.on('change', delayChanged);
    this.watch('delayTime', () => {
      if (this.state.delayTime < 10 || this.state.delayTime > 10000) {
        this.state.delayTime = clamp(this.state.delayTime, 10, 10000);
        delayChanged();
      }
    });
    let feedbackChanged = () => this.feedbackNode.gain.setTargetAtTime(this.state.feedback, flow.flowConnect.audioContext.currentTime, 0.01);
    this.feedbackSlider.on('change', feedbackChanged);
    this.watch('feedback', () => {
      if (this.state.feedback < 0 || this.state.feedback > 0.9) {
        this.state.feedback = clamp(this.state.feedback, 0, 0.9);
        feedbackChanged();
      }
    });
    let cutoffChanged = () => this.filter.frequency.setTargetAtTime(this.state.cutoff, flow.flowConnect.audioContext.currentTime, 0.01);
    this.cutoffSlider.on('change', cutoffChanged);
    this.watch('cutoff', () => {
      if (this.state.cutoff < 20 || this.state.cutoff > 20000) {
        this.state.cutoff = clamp(this.state.cutoff, 20, 20000);
        cutoffChanged();
      }
    });
    let wetChanged = () => this.wetGain.gain.setTargetAtTime(this.state.wet, flow.flowConnect.audioContext.currentTime, 0.01);
    this.wetSlider.on('change', wetChanged);
    this.watch('wet', () => {
      if (this.state.wet < 0 || this.state.wet > 1) {
        this.state.wet = clamp(this.state.wet, 0, 1);
        wetChanged();
      }
    });
    let dryChanged = () => this.dryGain.gain.setTargetAtTime(this.state.dry, flow.flowConnect.audioContext.currentTime, 0.01);
    this.drySlider.on('change', dryChanged);
    this.watch('dry', () => {
      if (this.state.dry < 0 || this.state.dry > 1) {
        this.state.dry = clamp(this.state.dry, 0, 1);
        dryChanged();
      }
    });
    this.watch('bypass', () => this.setBypass());

    this.handleAudioConnections();
  }

  setBypass() {
    if (!this.state.bypass) {
      this.inGain.connect(this.delay);
      this.inGain.connect(this.dryGain);
      this.wetGain.connect(this.outGain);
      this.dryGain.connect(this.outGain);
    } else {
      this.inGain.disconnect();
      this.wetGain.disconnect();
      this.dryGain.disconnect();
      this.inGain.connect(this.outGain);
    }
  }
  setupUI() {
    let bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .1 } });
    this.delaySlider = this.createSlider(0, 10000, { height: 10, propName: 'delayTime', style: { grow: .5 } });
    let delayInput = this.createInput({ propName: 'delayTime', height: 20, style: { type: InputType.Number, grow: .3, precision: 0 } });
    this.feedbackSlider = this.createSlider(0, 0.9, { height: 10, propName: 'feedback', style: { grow: .5 } });
    let feedbackInput = this.createInput({ propName: 'feedback', height: 20, style: { type: InputType.Number, grow: .3, precision: 2 } });
    this.cutoffSlider = this.createSlider(20, 20000, { height: 10, propName: 'cutoff', style: { grow: .5 } });
    let cutoffInput = this.createInput({ propName: 'cutoff', height: 20, style: { type: InputType.Number, grow: .3, precision: 0 } });
    this.wetSlider = this.createSlider(0, 1, { height: 10, propName: 'wet', style: { grow: .5 } });
    let wetInput = this.createInput({ propName: 'wet', height: 20, style: { type: InputType.Number, grow: .3, precision: 2 } });
    this.drySlider = this.createSlider(0, 1, { height: 10, propName: 'dry', style: { grow: .5 } });
    let dryInput = this.createInput({ propName: 'dry', height: 20, style: { type: InputType.Number, grow: .3, precision: 2 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Delay', { style: { grow: .3 } }), this.delaySlider, delayInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Feedback', { style: { grow: .3 } }), this.feedbackSlider, feedbackInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Cutoff', { style: { grow: .3 } }), this.cutoffSlider, cutoffInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Wet', { style: { grow: .3 } }), this.wetSlider, wetInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Dry', { style: { grow: .3 } }), this.drySlider, dryInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
