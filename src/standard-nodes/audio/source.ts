import { Flow } from "../../core/flow";
import { Vector } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { FlowConnectState } from "../../flow-connect";
import { Log } from "../../utils/logger";
import { Node } from '../../core/node';
import * as sourceui from '../../ui/source';
import { Toggle } from "../../ui/index";

export class Source extends Node {
  fileInput: sourceui.Source;
  loopToggle: Toggle;
  source: AudioBufferSourceNode;

  volumeGainNode: GainNode;
  proxyParamSourceNode: AudioWorkletNode;

  static DefaultState: any = { buffer: null, loop: true, prevChannelCount: -1 };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Audio Source', options.position || new Vector(50, 50), options.width || 200,
      [
        { name: 'array-buffer', dataType: 'event' }, { name: 'gain', dataType: 'audioparam' },
        { name: 'detune', dataType: 'audioparam' }, { name: 'playback-rate', dataType: 'audioparam' }
      ],
      [{ name: 'out', dataType: 'audio' }, { name: 'ended', dataType: 'event' }],
      {
        state: options.state ? { ...Source.DefaultState, ...options.state } : Source.DefaultState,
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

    this.setupUI();

    this.loopToggle.on('change', () => {
      if (this.state.loop) {
        this.stopSource();
        this.playSource();
      } else this.source && (this.source.loop = this.state.loop);
    });
    this.inputs[0].on('event', (_, data) => {
      if (!(data instanceof ArrayBuffer)) {
        Log.error('Data received on Audio Source Node is not of type ArrayBuffer');
        return;
      }
      this.processArrayBuffer(data);
    });
    this.fileInput.on('change', (_inst, _oldVal: File, newVal: File) => this.processFile(newVal));
    this.fileInput.on('upload', (_inst, _oldVal: File, newVal: File) => this.processFile(newVal));

    flow.flowConnect.on('start', () => this.playSource());
    flow.flowConnect.on('stop', () => this.stopSource());

    this.handleAudioConnections();
  }

  propagateChannelChange(newNoOfChannels: number) {
    this.flow.executionGraph.propagate(this, (currNode: Node) => {
      currNode.call('channel-count-change', newNoOfChannels);
    });
  }
  async processFile(file: File) {
    let cached = this.flow.flowConnect.arrayBufferCache.get(file.name + file.type);
    if (!cached) {
      cached = await file.arrayBuffer();
      this.flow.flowConnect.arrayBufferCache.set(file.name + file.type, cached);
    }
    this.processArrayBuffer(cached);
  }
  async processArrayBuffer(arrayBuffer: ArrayBuffer) {
    let cached = this.flow.flowConnect.audioBufferCache.get(arrayBuffer);
    if (!cached) {
      cached = await this.flow.flowConnect.audioContext.decodeAudioData(arrayBuffer);
      this.flow.flowConnect.audioBufferCache.set(arrayBuffer, cached);

      // If no. of channels has been changed, start an event propagation that will notify
      // every node that has a direct/indirect connection in the graph from this node
      if (this.state.prevChannelCount < 0 || this.state.prevChannelCount !== cached.numberOfChannels) {
        this.propagateChannelChange(cached.numberOfChannels);
      }
      this.state.prevChannelCount = cached.numberOfChannels;
    }
    this.state.buffer = cached;

    this.stopSource();
    this.playSource();
  }
  playSource() {
    if (this.flow.flowConnect.state === FlowConnectState.Stopped || !this.state.buffer) return;

    let audioSource = new AudioBufferSourceNode(this.flow.flowConnect.audioContext);
    audioSource.buffer = this.state.buffer;
    audioSource.loop = this.state.loop;
    this.source = audioSource;

    this.proxyParamSourceNode.connect(audioSource.detune, 0);
    this.proxyParamSourceNode.connect(audioSource.playbackRate, 1);
    audioSource.connect(this.outputs[0].ref);
    audioSource.start();
  }
  stopSource() {
    if (this.source) {
      this.source.stop();
      this.source = null;
    }
  }
  setupUI() {
    this.fileInput = this.createSource({ input: true, output: true, height: 25, style: { grow: .7 } });
    this.loopToggle = this.createToggle({ propName: 'loop', input: true, output: true, height: 10, style: { grow: .2 } });

    this.ui.append([
      this.createHozLayout([this.createLabel('File', { style: { grow: .3 } }), this.fileInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Loop ?'), this.loopToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_, connector) => {
      this.state.buffer && this.propagateChannelChange(this.state.buffer.numberOfChannels);
      this.outputs[0].ref.connect(connector.end.ref);
    });
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => {
      this.outputs[0].ref.disconnect(end.ref);
    });
  }
}
