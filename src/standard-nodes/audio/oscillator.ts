import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp } from "../../utils/utils";
import { Node } from '../../core/node';
import { InputType, Input, RadioGroup, Slider, HorizontalLayout } from "../../ui/index";

export class Oscillator extends Node {
  freqSlider: Slider;
  freqInput: Input;
  freqHozLayout: HorizontalLayout;
  detuneSlider: Slider;
  detuneInput: Input;
  detuneHozLayout: HorizontalLayout;
  typeGroup: RadioGroup;

  oscillator: OscillatorNode;
  freqProxy: AudioWorkletNode;
  detuneProxy: AudioWorkletNode;
  outGain: GainNode;

  types = ['sine', 'square', 'sawtooth', 'triangle'];

  static DefaultState = { frequency: 440, detune: 0, type: 'sine' };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Oscillator',
      options.position || new Vector2(50, 50),
      options.width || 250, [],
      [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {},
        state: options.state ? { ...Oscillator.DefaultState, ...options.state } : Oscillator.DefaultState
      }
    )

    this.freqProxy = new AudioWorkletNode(flow.flowConnect.audioContext, 'proxy');
    this.detuneProxy = new AudioWorkletNode(flow.flowConnect.audioContext, 'proxy');
    this.outGain = flow.flowConnect.audioContext.createGain();

    this.setupUI();

    this.inputsUI[0].ref = this.freqProxy;
    this.inputsUI[1].ref = this.detuneProxy;
    this.inputsUI[0].dataType = 'audioparam';
    this.inputsUI[1].dataType = 'audioparam';
    this.outputs[0].ref = this.outGain;

    this.inputsUI[0].on('data', (_inst, data) => typeof data === 'number' && (this.state.frequency = data));
    this.inputsUI[1].on('data', (_inst, data) => typeof data === 'number' && (this.state.detune = data));

    this.watch('frequency', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 20000) newVal = clamp(newVal, 0, 20000);
      if (!this.freqHozLayout.disabled) this.oscillator && (this.oscillator.frequency.value = newVal);
    });
    this.watch('detune', (_oldVal, newVal) => {
      if (!this.detuneHozLayout.disabled) this.oscillator && (this.oscillator.detune.value = newVal);
    });
    this.watch('type', (_oldVal, newVal) => {
      if (this.types.includes(newVal)) this.oscillator && (this.oscillator.type = newVal);
    });

    this.flow.flowConnect.on('start', () => this.startOscillator());
    this.flow.flowConnect.on('stop', () => this.stopOscillator());

    this.handleAudioConnections();
  }

  startOscillator() {
    this.stopOscillator();
    this.oscillator = this.flow.flowConnect.audioContext.createOscillator();
    if (!this.inputsUI[0].isConnected()) this.oscillator.frequency.value = this.state.frequency;
    else {
      this.freqProxy.connect(this.oscillator.frequency);
      this.oscillator.frequency.value = 0;
    }
    if (!this.inputsUI[1].isConnected()) this.oscillator.detune.value = this.state.detune;
    else {
      this.detuneProxy.connect(this.oscillator.detune);
      this.oscillator.detune.value = 0;
    }

    this.oscillator.type = this.state.type;
    this.oscillator.connect(this.outGain);
    this.oscillator.start();
  }
  stopOscillator() {
    if (this.oscillator) {
      this.freqProxy.disconnect();
      this.detuneProxy.disconnect();
      this.oscillator.disconnect();
      this.oscillator.stop();
      this.oscillator = null;
    }
  }
  setupUI() {
    this.freqSlider = this.createSlider(0, 20000, { height: 10, propName: 'frequency', style: { grow: .5 } });
    this.freqInput = this.createInput({ propName: 'frequency', height: 20, style: { type: InputType.Number, grow: .3, precision: 0 } });
    this.freqHozLayout = this.createHozLayout([
      this.createLabel('Freq.', { style: { grow: .2 } }), this.freqSlider, this.freqInput
    ], { input: true, style: { spacing: 5 } });
    this.detuneSlider = this.createSlider(-2400, 2400, { height: 10, propName: 'detune', style: { grow: .5 } });
    this.detuneInput = this.createInput({ propName: 'detune', height: 20, style: { type: InputType.Number, grow: .3, precision: 0 } });
    this.detuneHozLayout = this.createHozLayout([
      this.createLabel('Detune', { style: { grow: .2 } }), this.detuneSlider, this.detuneInput
    ], { input: true, style: { spacing: 5 } });
    this.typeGroup = this.createRadioGroup(this.types, this.state.type, { propName: 'type', height: 20 });

    this.ui.append([this.freqHozLayout, this.detuneHozLayout, this.typeGroup]);
  }
  handleAudioConnections() {
    this.inputsUI[0].on('connect', () => {
      if (this.oscillator) {
        this.freqProxy.connect(this.oscillator.frequency);
        this.oscillator.frequency.value = 0;
      }
    });
    this.inputsUI[0].on('disconnect', () => {
      if (this.oscillator) {
        this.freqProxy.disconnect();
        this.oscillator.frequency.value = this.state.frequency;
      }
    });
    this.inputsUI[1].on('connect', () => {
      if (this.oscillator) {
        this.detuneProxy.connect(this.oscillator.detune);
        this.oscillator.detune.value = 0;
      }
    });
    this.inputsUI[1].on('disconnect', () => {
      if (this.oscillator) {
        this.detuneProxy.disconnect();
        this.oscillator.detune.value = this.state.detune;
      }
    });
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
