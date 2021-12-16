import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";

export const Destination = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'Audio Destination',
    options.position || new Vector2(50, 50),
    options.width || 160,
    [{ name: 'out', dataType: 'audio' }, { name: 'gain', dataType: 'audioparam' }], [],
    options.style || { rowHeight: 10, spacing: 15 },
    options.terminalStyle || {},
    options.props
      ? { ...options.props }
      : {}
  );
  node.props.masterVolumeGainNode = flow.flowConnect.audioContext.createGain();
  node.inputs[0].ref = node.props.masterVolumeGainNode;
  node.inputs[0].ref.connect(flow.flowConnect.audioContext.destination);
  node.inputs[1].ref = node.inputs[0].ref.gain;

  return node;
};
