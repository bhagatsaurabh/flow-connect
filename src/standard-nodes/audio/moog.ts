import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui/input";
import { clamp } from "../../utils/utils";
import { Node } from "../../core/node";
import { Slider } from "../../ui/slider";
import { Toggle } from "../../ui/toggle";

export class MoogEffect extends Node {
  cutoffSlider: Slider;
  resonanceSlider: Slider;
  bypassToggle: Toggle;

  inGain: GainNode;
  outGain: GainNode;
  moog: AudioWorkletNode;

  static DefaultProps = { cutoff: 0.065, resonance: 3.5, bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Moog Effect', options.position || new Vector2(50, 50), options.width || 230,
      [{ name: 'in', dataType: 'audio' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        props: options.props ? { ...MoogEffect.DefaultProps, ...options.props } : MoogEffect.DefaultProps,
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.inGain = flow.flowConnect.audioContext.createGain();
    this.outGain = flow.flowConnect.audioContext.createGain();
    this.inputs[0].ref = this.inGain;
    this.outputs[0].ref = this.outGain;

    this.moog = new AudioWorkletNode(flow.flowConnect.audioContext, 'moog-effect', {
      numberOfInputs: 1, numberOfOutputs: 1, processorOptions: { bufferSize: 4096 }
    });
    this.setBypass();

    this.setupUI();

    this.watch('bypass', () => this.setBypass());
    this.watch('cutoff', () => {
      if (this.props.cutoff < 0.0001 || this.props.cutoff > 1.0) this.props.cutoff = clamp(this.props.cutoff, 0.0001, 1.0);
      this.paramsChanged();
    });
    this.watch('resonance', () => {
      if (this.props.resonance < 0 || this.props.resonance > 4.0) this.props.resonance = clamp(this.props.resonance, 0, 4.0);
      this.paramsChanged();
    });

    flow.flowConnect.on('start', () => this.paramsChanged());

    this.handleAudioConnections();
  }

  paramsChanged() {
    this.moog.port.postMessage({ cutoff: this.props.cutoff, resonance: this.props.resonance });
  }
  setBypass() {
    if (this.props.bypass) {
      this.moog.disconnect();
      this.inGain.disconnect();
      this.inGain.connect(this.outGain);
    } else {
      this.inGain.disconnect();
      this.inGain.connect(this.moog);
      this.moog.connect(this.outGain);
    }
  }
  setupUI() {
    this.cutoffSlider = this.createSlider(0.0001, 1.0, { height: 10, propName: 'cutoff', style: { grow: .5 } });
    this.resonanceSlider = this.createSlider(0, 4.0, { height: 10, propName: 'resonance', style: { grow: .5 } });
    let cutoffInput = this.createInput({ propName: 'cutoff', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    let resonanceInput = this.createInput({ propName: 'resonance', height: 20, style: { type: InputType.Number, grow: .4, precision: 2 } });
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .1 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Cutoff', { style: { grow: .3 } }), this.cutoffSlider, cutoffInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Resonance', { style: { grow: .3 } }), this.resonanceSlider, resonanceInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
