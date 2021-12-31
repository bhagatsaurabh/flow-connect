import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";

export class Gain extends Node {
  gain: GainNode;

  static DefaultProps = { gain: 1 };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Gain', options.position || new Vector2(50, 50), options.width || 120,
      [{ name: 'in', dataType: 'audio' }, { name: 'gain', dataType: 'audioparam' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        props: options.props ? { ...Gain.DefaultProps, ...options.props } : Gain.DefaultProps,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.gain = flow.flowConnect.audioContext.createGain();
    this.inputs[0].ref = this.gain;
    this.outputs[0].ref = this.gain;
    this.inputs[1].ref = this.inputs[0].ref.gain;
    this.inputs[1].on('data', (_, data) => typeof data === 'number' && (this.inputs[1].ref.value = data));

    this.handleAudioConnections();
  }

  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
