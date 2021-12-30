import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";

export const Gain = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Gain', options.position || new Vector2(50, 50), options.width || 120, {
    inputs: [{ name: 'in', dataType: 'audio' }, { name: 'gain', dataType: 'audioparam' }],
    outputs: [{ name: 'out', dataType: 'audio' }],
    props: options.props ? { gain: 1, ...options.props } : { gain: 1 },
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  node.props.gainNode = flow.flowConnect.audioContext.createGain();
  node.inputs[0].ref = node.props.gainNode;
  node.outputs[0].ref = node.props.gainNode;
  node.inputs[1].ref = node.inputs[0].ref.gain;
  node.inputs[1].on('data', (_, data) => typeof data === 'number' && (node.inputs[1].ref.value = data));

  // Handle actual webaudio node stuff
  node.outputs[0].on('connect', (_, connector) => node.outputs[0].ref.connect(connector.end.ref));
  node.outputs[0].on('disconnect', (_inst, _connector, _start, end) => node.outputs[0].ref.disconnect(end.ref));

  return node;
};
