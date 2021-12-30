import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui/input";
import { clamp } from "../../utils/utils";

export const MoogEffect = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Moog Effect', options.position || new Vector2(50, 50), options.width || 230, {
    inputs: [{ name: 'in', dataType: 'audio' }],
    outputs: [{ name: 'out', dataType: 'audio' }],
    props: options.props
      ? { cutoff: 0.065, resonance: 3.5, bypass: false, ...options.props }
      : { cutoff: 0.065, resonance: 3.5, bypass: false },
    style: options.style || { rowHeight: 10, spacing: 10 },
    terminalStyle: options.terminalStyle || {}
  });
  node.props.inGain = flow.flowConnect.audioContext.createGain();
  node.props.outGain = flow.flowConnect.audioContext.createGain();
  node.inputs[0].ref = node.props.inGain;
  node.outputs[0].ref = node.props.outGain;

  node.props.effectNode = new AudioWorkletNode(flow.flowConnect.audioContext, 'moog-effect', {
    numberOfInputs: 1, numberOfOutputs: 1, processorOptions: { bufferSize: 4096 }
  });
  if (!node.props.bypass) {
    node.inputs[0].ref.connect(node.props.effectNode);
    node.props.effectNode.connect(node.outputs[0].ref);
  } else {
    node.inputs[0].ref.connect(node.outputs[0].ref);
  }

  let cutoffSlider = node.createSlider(0.0001, 1.0, { height: 10, propName: 'cutoff', style: { grow: .5 } });
  let resonanceSlider = node.createSlider(0, 4.0, { height: 10, propName: 'resonance', style: { grow: .5 } });
  let cutoffInput = node.createInput({ propName: 'cutoff', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
  let resonanceInput = node.createInput({ propName: 'resonance', height: 20, style: { type: InputType.Number, grow: .4, precision: 2 } });
  let bypassToggle = node.createToggle({ propName: 'bypass', style: { grow: .1 } });
  node.ui.append([
    node.createHozLayout([node.createLabel('Cutoff', { style: { grow: .3 } }), cutoffSlider, cutoffInput], { style: { spacing: 5 } }),
    node.createHozLayout([node.createLabel('Resonance', { style: { grow: .3 } }), resonanceSlider, resonanceInput], { style: { spacing: 5 } }),
    node.createHozLayout([node.createLabel('Bypass ?', { style: { grow: .3 } }), bypassToggle], { style: { spacing: 5 } })
  ]);

  let paramsChanged = () => {
    node.props.effectNode.port.postMessage({ cutoff: node.props.cutoff, resonance: node.props.resonance });
  }

  cutoffSlider.on('change', paramsChanged);
  resonanceSlider.on('change', paramsChanged);
  cutoffInput.on('change', paramsChanged);
  resonanceInput.on('change', paramsChanged);
  node.watch('bypass', () => {
    if (node.props.bypass) {
      node.props.effectNode.disconnect();
      node.inputs[0].ref.disconnect();
      node.inputs[0].ref.connect(node.outputs[0].ref);
    } else {
      node.inputs[0].ref.disconnect();
      node.inputs[0].ref.connect(node.props.effectNode);
      node.props.effectNode.connect(node.outputs[0].ref);
    }
  });
  node.watch('cutoff', () => {
    if (node.props.cutoff < 0.0001 || node.props.cutoff > 1.0) node.props.cutoff = clamp(node.props.cutoff, 0.0001, 1.0);
  });
  node.watch('resonance', () => {
    if (node.props.resonance < 0 || node.props.resonance > 4.0) node.props.resonance = clamp(node.props.resonance, 0, 4.0);
  });

  flow.flowConnect.on('start', paramsChanged);
  // Handle actual webaudio node stuff
  node.outputs[0].on('connect', (_, connector) => node.outputs[0].ref.connect(connector.end.ref));
  node.outputs[0].on('disconnect', (_inst, _connector, _start, end) => node.outputs[0].ref.disconnect(end.ref));

  return node;
};
