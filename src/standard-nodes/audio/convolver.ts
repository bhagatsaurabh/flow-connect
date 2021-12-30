import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";

export const Convolver = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Convolver', options.position || new Vector2(50, 50), options.width || 160, {
    inputs: [{ name: 'in', dataType: 'audio' }, { name: 'impulse', dataType: 'audio-buffer' }],
    outputs: [{ name: 'out', dataType: 'audio' }],
    props: options.props
      ? { bypass: false, ...options.props }
      : { bypass: false },
    style: options.style || { rowHeight: 10, spacing: 10 },
    terminalStyle: options.terminalStyle || {}
  });
  node.props.inGain = flow.flowConnect.audioContext.createGain();
  node.props.outGain = flow.flowConnect.audioContext.createGain();
  node.props.convolver = flow.flowConnect.audioContext.createConvolver();

  node.inputs[0].ref = node.props.inGain;
  node.outputs[0].ref = node.props.outGain;

  let setBypass = () => {
    if (!node.props.bypass) {
      node.inputs[0].ref.disconnect();
      node.inputs[0].ref.connect(node.props.convolver);
      node.props.convolver.connect(node.outputs[0].ref);
    } else {
      node.inputs[0].ref.disconnect();
      node.props.convolver.disconnect();
      node.inputs[0].ref.connect(node.outputs[0].ref);
    }
  }
  setBypass();

  let bypassToggle = node.createToggle({ propName: 'bypass', style: { grow: .25 } });
  node.ui.append([
    node.createHozLayout([node.createLabel('Bypass ?'), bypassToggle], { style: { spacing: 5 } })
  ]);

  node.watch('bypass', setBypass);
  node.inputs[1].on('data', (_inst, data) => {
    node.props.convolver.buffer = data;
  });

  // Handle actual webaudio node stuff
  node.outputs[0].on('connect', (_, connector) => node.outputs[0].ref.connect(connector.end.ref));
  node.outputs[0].on('disconnect', (_inst, _connector, _start, end) => node.outputs[0].ref.disconnect(end.ref));

  return node;
};
