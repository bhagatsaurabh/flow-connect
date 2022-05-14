import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { Node } from "../../core/node.js";

export class Gain extends Node {
  gain: GainNode;

  static DefaultState = { gain: 1 };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Gain', options.position || new Vector(50, 50), options.width || 120,
      [{ name: 'in', dataType: 'audio' }, { name: 'gain', dataType: 'audioparam' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        state: options.state ? { ...Gain.DefaultState, ...options.state } : Gain.DefaultState,
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
