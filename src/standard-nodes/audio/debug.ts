import { Flow, FlowState } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";

export class Debug extends Node {
  inGain: GainNode;
  outGain: GainNode;
  debugNode: AudioWorkletNode;

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Debug', options.position || new Vector2(50, 50), options.width || 120,
      [{ name: 'in', dataType: 'audio' }],
      [{ name: 'out', dataType: 'audio' }, { name: 'debug', dataType: 'any' }],
      {
        state: options.state || {},
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.inGain = flow.flowConnect.audioContext.createGain();
    this.outGain = flow.flowConnect.audioContext.createGain();
    this.inputs[0].ref = this.inGain;
    this.outputs[0].ref = this.outGain;

    this.debugNode = new AudioWorkletNode(flow.flowConnect.audioContext, 'debug', { numberOfInputs: 1, numberOfOutputs: 1 });
    this.debugNode.port.onmessage = (e: any) => {
      if (flow.state !== FlowState.Stopped) this.setOutputs(1, e.data);
    }
    this.inputs[0].ref.connect(this.debugNode);
    this.debugNode.connect(this.outputs[0].ref);

    this.handleAudioConnections();
  }

  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
