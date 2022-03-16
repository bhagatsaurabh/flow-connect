import { Flow } from "../../core/flow";
import { Vector } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp } from "../../utils/utils";
import { Node } from "../../core/node";
import { InputType, Input, Slider, Toggle } from "../../ui/index";

export class BitcrusherEffect extends Node {
  bitsSlider: Slider;
  bitsInput: Input;
  normFreqSlider: Slider;
  normFreqInput: Input;
  bypassToggle: Toggle;

  inGain: GainNode;
  outGain: GainNode;
  bitcrusher: AudioWorkletNode;

  static DefaultState = { bits: 4, normFreq: 0.1, bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Bitcrusher Effect', options.position || new Vector(50, 50), options.width || 230,
      [{ name: 'in', dataType: 'audio' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        state: options.state ? { ...BitcrusherEffect.DefaultState, ...options.state } : BitcrusherEffect.DefaultState,
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.inGain = flow.flowConnect.audioContext.createGain();
    this.outGain = flow.flowConnect.audioContext.createGain();
    this.inputs[0].ref = this.inGain;
    this.outputs[0].ref = this.outGain;

    this.bitcrusher = new AudioWorkletNode(flow.flowConnect.audioContext, 'bitcrusher-effect', {
      numberOfInputs: 1, numberOfOutputs: 1, processorOptions: { bufferSize: 4096 }
    });

    this.setBypass();
    this.setupUI();

    this.bitsSlider.on('change', () => this.paramsChanged());
    this.normFreqSlider.on('change', () => this.paramsChanged());
    this.bitsInput.on('change', () => this.paramsChanged());
    this.normFreqInput.on('change', () => this.paramsChanged());
    this.watch('bypass', () => this.setBypass());
    this.watch('bits', () => {
      if (this.state.bits < 1 || this.state.bits > 16 || !Number.isInteger(this.state.bits)) {
        this.state.bits = clamp(Math.floor(this.state.bits), 1, 16);
      }
    });
    this.watch('normFreq', () => {
      if (this.state.normFreq < 0 || this.state.normFreq > 1) this.state.normFreq = clamp(this.state.normFreq, 0, 1);
    });

    flow.flowConnect.on('start', () => this.paramsChanged());

    this.handleAudioConnections();
  }

  setBypass() {
    if (!this.state.bypass) {
      this.inGain.disconnect();
      this.inGain.connect(this.bitcrusher);
      this.bitcrusher.connect(this.outGain);
    } else {
      this.bitcrusher.disconnect();
      this.inGain.disconnect();
      this.inGain.connect(this.outGain);
    }
  }
  paramsChanged() {
    this.bitcrusher.port.postMessage({ bits: this.state.bits, normFreq: this.state.normFreq });
  }
  setupUI() {
    this.bitsSlider = this.createSlider(1, 16, { height: 10, propName: 'bits', style: { grow: .5 } });
    this.normFreqSlider = this.createSlider(0, 1, { height: 10, propName: 'normFreq', style: { grow: .5 } });
    this.bitsInput = this.createInput({ propName: 'bits', height: 20, style: { type: InputType.Number, grow: .2 } });
    this.normFreqInput = this.createInput({ propName: 'normFreq', height: 20, style: { type: InputType.Number, grow: .4, precision: 2 } });
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .1 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Bits', { style: { grow: .3 } }), this.bitsSlider, this.bitsInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Norm Freq.', { style: { grow: .3 } }), this.normFreqSlider, this.normFreqInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
