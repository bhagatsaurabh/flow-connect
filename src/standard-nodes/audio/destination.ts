import { Flow } from "../../core/flow";
import { Vector } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";

export class Destination extends Node {
  masterVolumeGainNode: GainNode;

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Audio Destination', options.position || new Vector(50, 50), options.width || 160,
      [{ name: 'out', dataType: 'audio' }, { name: 'gain', dataType: 'audioparam' }], [],
      {
        state: options.state || {},
        style: options.style || { rowHeight: 10, spacing: 15 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.masterVolumeGainNode = flow.flowConnect.audioContext.createGain();
    this.inputs[0].ref = this.masterVolumeGainNode;
    this.inputs[0].ref.connect(flow.flowConnect.audioContext.destination);
    this.inputs[1].ref = this.inputs[0].ref.gain;
    this.inputs[1].on('data', (_, data) => typeof data === 'number' && (this.inputs[1].ref.value = data));
  }

}
