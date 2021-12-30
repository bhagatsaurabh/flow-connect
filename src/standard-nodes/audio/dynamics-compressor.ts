import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp } from "../../utils/utils";

export const DynamicsCompressor = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Dynamics Compressor', options.position || new Vector2(50, 50), options.width || 230, {
    inputs: [{ name: 'in', dataType: 'audio' }, { name: 'threshold', dataType: 'audioparam' },
    { name: 'ratio', dataType: 'audioparam' }, { name: 'knee', dataType: 'audioparam' },
    { name: 'attack', dataType: 'audioparam' }, { name: 'release', dataType: 'audioparam' }],
    outputs: [{ name: 'out', dataType: 'audio' }],
    props: options.props ? { bypass: false, ...options.props } : { bypass: false },
    style: options.style || { rowHeight: 10, spacing: 10 },
    terminalStyle: options.terminalStyle || {}
  });
  node.props.inGain = flow.flowConnect.audioContext.createGain();
  node.props.outGain = flow.flowConnect.audioContext.createGain();
  node.props.compressor = flow.flowConnect.audioContext.createDynamicsCompressor();
  node.props.compressor.threshold.value = -20;
  node.props.compressor.ratio.value = 4;
  node.props.compressor.knee.value = 5;
  node.props.compressor.attack.value = 0.01;
  node.props.compressor.release.value = 0.12;

  node.inputs[0].ref = node.props.inGain;
  node.inputs[1].ref = node.props.compressor.threshold;
  node.inputs[2].ref = node.props.compressor.ratio;
  node.inputs[3].ref = node.props.compressor.knee;
  node.inputs[4].ref = node.props.compressor.attack;
  node.inputs[5].ref = node.props.compressor.release;
  node.outputs[0].ref = node.props.outGain;

  node.inputs[1].on('data', (_, data) => typeof data === 'number' && (node.inputs[1].ref.value = clamp(data, -100, 0)));
  node.inputs[2].on('data', (_, data) => typeof data === 'number' && (node.inputs[2].ref.value = clamp(data, 1, 20)));
  node.inputs[3].on('data', (_, data) => typeof data === 'number' && (node.inputs[3].ref.value = clamp(data, 0, 40)));
  node.inputs[4].on('data', (_, data) => typeof data === 'number' && (node.inputs[4].ref.value = clamp(data, 0, 1)));
  node.inputs[5].on('data', (_, data) => typeof data === 'number' && (node.inputs[5].ref.value = clamp(data, 0, 1)));

  if (!node.props.bypass) {
    node.inputs[0].ref.connect(node.props.compressor);
    node.props.compressor.connect(node.outputs[0].ref);
  } else {
    node.inputs[0].ref.connect(node.outputs[0].ref);
  }

  let bypassToggle = node.createToggle({ propName: 'bypass', style: { grow: .1 } });
  node.ui.append([
    node.createHozLayout([node.createLabel('Bypass ?', { style: { grow: .3 } }), bypassToggle], { style: { spacing: 5 } })
  ]);

  node.watch('bypass', () => {
    if (node.props.bypass) {
      node.props.compressor.disconnect();
      node.inputs[0].ref.disconnect();
      node.inputs[0].ref.connect(node.outputs[0].ref);
    } else {
      node.inputs[0].ref.disconnect();
      node.inputs[0].ref.connect(node.props.compressor);
      node.props.compressor.connect(node.outputs[0].ref);
    }
  });

  // Handle actual webaudio node stuff
  node.outputs[0].on('connect', (_, connector) => node.outputs[0].ref.connect(connector.end.ref));
  node.outputs[0].on('disconnect', (_inst, _connector, _start, end) => node.outputs[0].ref.disconnect(end.ref));

  return node;
};
