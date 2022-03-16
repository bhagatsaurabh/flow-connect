import { Flow } from "../../core/flow";
import { Vector } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp } from "../../utils/utils";
import { Node } from '../../core/node';
import { InputType, Input, Slider, Toggle } from "../../ui/index";
let Tuna = require('../../lib/tuna.js');

export class PingPongEffect extends Node {
  delayLeftSlider: Slider;
  delayLeftInput: Input;
  delayRightSlider: Slider;
  delayRightInput: Input;
  feedbackSlider: Slider;
  feedbackInput: Input;
  wetSlider: Slider;
  wetInput: Input;
  bypassToggle: Toggle;
  pingPong: any;

  static DefaultState = { delayLeft: 200, delayRight: 400, feedback: 0.3, wet: 0.5, bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'PingPong Effect',
      options.position || new Vector(50, 50),
      options.width || 230,
      [{ name: 'in', dataType: 'audio' }], [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {},
        state: options.state ? { ...PingPongEffect.DefaultState, ...options.state } : PingPongEffect.DefaultState
      }
    )

    if (!(window as any).__tuna__) (window as any).__tuna__ = new Tuna(flow.flowConnect.audioContext);

    this.pingPong = new (window as any).__tuna__.PingPongDelay();
    this.inputs[0].ref = this.outputs[0].ref = this.pingPong;

    Object.assign(this.pingPong, {
      delayTimeLeft: this.state.delayLeft,
      delayTimeRight: this.state.delayRight,
      feedback: this.state.feedback,
      wetLevel: this.state.wet
    });

    this.setupUI();

    this.watch('delayLeft', (_oldVal, newVal) => {
      if (newVal < 1 || newVal > 10000) this.state.delayLeft = clamp(newVal, 1, 10000);
      this.pingPong.delayTimeLeft = this.state.delayLeft;
    });
    this.watch('delayRight', (_oldVal, newVal) => {
      if (newVal < 1 || newVal > 10000) this.state.delayRight = clamp(newVal, 1, 10000);
      this.pingPong.delayTimeRight = this.state.delayRight;
    });
    this.watch('feedback', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 1) this.state.feedback = clamp(newVal, 0, 1);
      this.pingPong.feedback = this.state.feedback;
    });
    this.watch('wet', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 1) this.state.wet = clamp(newVal, 0, 1);
      this.pingPong.wetLevel = this.state.wet;
    });
    this.watch('bypass', (_oldVal, newVal) => this.pingPong.bypass = newVal);

    this.handleAudioConnections();
  }

  setupUI() {
    this.delayLeftSlider = this.createSlider(1, 10000, { height: 10, propName: 'delayLeft', style: { grow: .5 } });
    this.delayLeftInput = this.createInput({ propName: 'delayLeft', height: 20, style: { type: InputType.Number, grow: .2, precision: 4 } });
    this.delayRightSlider = this.createSlider(1, 10000, { height: 10, propName: 'delayRight', style: { grow: .5 } });
    this.delayRightInput = this.createInput({ propName: 'delayRight', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    this.feedbackSlider = this.createSlider(0, 1, { height: 10, propName: 'feedback', style: { grow: .5 } });
    this.feedbackInput = this.createInput({ propName: 'feedback', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    this.wetSlider = this.createSlider(0, 1, { height: 10, propName: 'wet', style: { grow: .5 } });
    this.wetInput = this.createInput({ propName: 'wet', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .1 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Delay L', { style: { grow: .3 } }), this.delayLeftSlider, this.delayLeftInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Delay R', { style: { grow: .3 } }), this.delayRightSlider, this.delayRightInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Feedback', { style: { grow: .3 } }), this.feedbackSlider, this.feedbackInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Wet', { style: { grow: .3 } }), this.wetSlider, this.wetInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
