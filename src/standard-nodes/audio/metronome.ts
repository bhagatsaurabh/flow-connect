import { Flow } from "../../core/flow";
import { Vector } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp } from "../../utils/utils";
import { Node } from "../../core/node";
import { FlowConnectState } from "../../flow-connect";
import { Constant } from "../../resource/constants";
import { InputType, Input, Toggle } from "../../ui/index";

export class Metronome extends Node {
  autoToggle: Toggle;
  freqInput: Input;
  bpmInput: Input;
  source: AudioBufferSourceNode;

  volumeGainNode: GainNode;
  proxyParamSourceNode: AudioWorkletNode;

  static DefaultState: any = { frequency: 330, buffer: null, bpm: 130, loop: true, auto: true };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Metronome', options.position || new Vector(50, 50), options.width || 200,
      [
        { name: 'trigger', dataType: 'event' }, { name: 'gain', dataType: 'audioparam' },
        { name: 'detune', dataType: 'audioparam' }, { name: 'playback-rate', dataType: 'audioparam' }
      ],
      [{ name: 'out', dataType: 'audio' }],
      {
        state: options.state ? { ...Metronome.DefaultState, ...options.state } : Metronome.DefaultState,
        style: options.style || { rowHeight: 10, spacing: 15 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.volumeGainNode = flow.flowConnect.audioContext.createGain();
    this.proxyParamSourceNode = new AudioWorkletNode(
      flow.flowConnect.audioContext,
      'proxy-param-for-source',
      { numberOfOutputs: 2, parameterData: { detune: 0, playbackRate: 1 } }
    );
    this.inputs[1].ref = this.volumeGainNode.gain;
    this.inputs[2].ref = (this.proxyParamSourceNode.parameters as Map<string, AudioParam>).get('detune');
    this.inputs[3].ref = (this.proxyParamSourceNode.parameters as Map<string, AudioParam>).get('playbackRate');
    this.inputs[1].on('data', (_, data) => typeof data === 'number' && (this.inputs[1].ref.value = data));
    this.inputs[2].on('data', (_, data) => typeof data === 'number' && (this.inputs[2].ref.value = data));
    this.inputs[3].on('data', (_, data) => typeof data === 'number' && (this.inputs[3].ref.value = data));
    this.outputs[0].ref = this.volumeGainNode;
    this.fillBuffer();

    this.setupUI();

    this.bpmInput.on('change', () => {
      if (this.source) {
        this.source.loopEnd = 1 / (clamp(this.state.bpm, 30, 300) / 60);
      }
    });
    this.freqInput.on('change', () => {
      if (this.source) {
        this.stopSource();
        this.fillBuffer();
        this.playSource();
      } else this.fillBuffer();
    });
    this.inputs[0].on('event', () => this.playSource());

    flow.flowConnect.on('start', () => this.state.auto && this.playSource());
    flow.flowConnect.on('stop', () => this.stopSource());

    this.handleAudioConnections();
  }
  fillBuffer() {
    let ctx = this.flow.flowConnect.audioContext;

    let buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    let channel = buffer.getChannelData(0);

    let phase = 0;
    let amp = 1;
    let durationFrames = ctx.sampleRate / 50;

    const f = this.state.frequency;
    for (let i = 0; i < durationFrames; i++) {
      channel[i] = Math.sin(phase) * amp;
      phase += Constant.TAU * f / ctx.sampleRate;
      if (phase > Constant.TAU) {
        phase -= Constant.TAU;
      }
      amp -= 1 / durationFrames;
    }
    this.state.buffer = buffer;
  }
  setupUI() {
    this.autoToggle = this.createToggle({ propName: 'auto', height: 10, style: { grow: 0.2 } });
    this.freqInput = this.createInput({ propName: 'frequency', height: 20, style: { type: InputType.Number, grow: 0.5 } });
    this.bpmInput = this.createInput({ propName: 'bpm', height: 20, style: { type: InputType.Number, grow: 0.5 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Auto ?'), this.autoToggle], { style: { spacing: 5 } }),
      this.createHozLayout([
        this.createLabel('Frequency'), this.freqInput, this.createLabel('BPM'), this.bpmInput
      ], { style: { spacing: 5 } })
    ]);
  }
  playSource() {
    if (this.flow.flowConnect.state === FlowConnectState.Stopped || !this.state.buffer) return;

    let audioSource = new AudioBufferSourceNode(this.flow.flowConnect.audioContext);
    audioSource.buffer = this.state.buffer;
    audioSource.loop = true;
    this.source = audioSource;

    audioSource.loopEnd = 1 / (clamp(this.state.bpm, 30, 300) / 60);
    this.proxyParamSourceNode.connect(audioSource.detune, 0);
    this.proxyParamSourceNode.connect(audioSource.playbackRate, 1);
    audioSource.connect(this.outputs[0].ref);
    audioSource.start(0);
  }
  stopSource() {
    if (this.source) {
      this.source.stop();
      this.source = null;
    }
  }
  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
