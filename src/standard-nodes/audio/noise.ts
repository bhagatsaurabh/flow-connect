import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from '../../core/node';
import { Select } from "../../ui/select";

export class Noise extends Node {
  noiseSelect: Select
  noise: AudioWorkletNode;
  outGain: GainNode;

  static DefaultProps = { type: 'white' };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Noise',
      options.position || new Vector2(50, 50),
      options.width || 170, [],
      [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {},
        props: options.props ? { ...Noise.DefaultProps, ...options.props } : Noise.DefaultProps
      }
    )

    this.outGain = flow.flowConnect.audioContext.createGain();
    this.outputs[0].ref = this.outGain;

    this.noise = new AudioWorkletNode(flow.flowConnect.audioContext, 'noise', {
      channelCount: 1, channelCountMode: 'explicit', outputChannelCount: [1], numberOfInputs: 1, numberOfOutputs: 1
    });
    this.noise.port.postMessage(this.props.type);

    this.setupUI();

    this.watch('type', (_oldVal, newVal) => {
      if (!this.noiseSelect.values.includes(newVal)) newVal = 'white';
      this.noise.port.postMessage(this.props.type);
    });

    this.handleAudioConnections();

    this.flow.flowConnect.on('start', () => {
      this.noise.connect(this.outGain);
    });
    this.flow.flowConnect.on('stop', () => {
      this.noise.disconnect();
    });
  }

  setupUI() {
    this.noiseSelect = this.createSelect(['white', 'pink', 'brownian'], { height: 15, propName: 'type', style: { grow: .7 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Type', { style: { grow: .3 } }), this.noiseSelect], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
