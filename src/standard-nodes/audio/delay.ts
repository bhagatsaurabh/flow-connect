import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui/input";
import { clamp } from "../../utils/utils";

export const DelayEffect = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Delay', options.position || new Vector2(50, 50), options.width || 230, {
    inputs: [{ name: 'in', dataType: 'audio' }],
    outputs: [{ name: 'out', dataType: 'audio' }],
    props: options.props
      ? { feedback: 0.45, cutoff: 20000, wet: 0.5, dry: 1, delayTime: 100, bypass: false, ...options.props }
      : { feedback: 0.45, cutoff: 20000, wet: 0.5, dry: 1, delayTime: 100, bypass: false },
    style: options.style || { rowHeight: 10, spacing: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  node.props.inGain = flow.flowConnect.audioContext.createGain();
  node.props.outGain = flow.flowConnect.audioContext.createGain();
  node.props.dryGain = flow.flowConnect.audioContext.createGain();
  node.props.wetGain = flow.flowConnect.audioContext.createGain();
  node.props.filter = flow.flowConnect.audioContext.createBiquadFilter();
  node.props.filterType = 'lowpass';
  node.props.delay = flow.flowConnect.audioContext.createDelay(10);
  node.props.feedbackNode = flow.flowConnect.audioContext.createGain();

  node.props.delay.delayTime.value = node.props.delayTime / 1000;
  node.props.feedbackNode.gain.value = node.props.feedback;
  node.props.filter.frequency.value = node.props.cutoff;
  node.props.wetGain.gain.value = node.props.wet;
  node.props.dryGain.gain.value = node.props.dry;

  node.inputs[0].ref = node.props.inGain;
  node.outputs[0].ref = node.props.outGain;

  node.props.delay.connect(node.props.filter);
  node.props.filter.connect(node.props.feedbackNode);
  node.props.feedbackNode.connect(node.props.delay);
  node.props.feedbackNode.connect(node.props.wetGain);

  let bypassChanged = () => {
    if (!node.props.bypass) {
      node.props.inGain.connect(node.props.delay);
      node.props.inGain.connect(node.props.dryGain);
      node.props.wetGain.connect(node.props.outGain);
      node.props.dryGain.connect(node.props.outGain);
    } else {
      node.props.inGain.disconnect();
      node.props.wetGain.disconnect();
      node.props.dryGain.disconnect();
      node.props.inGain.connect(node.props.outGain);
    }
  }
  bypassChanged();

  let bypassToggle = node.createToggle({ propName: 'bypass', style: { grow: .1 } });
  let delaySlider = node.createSlider(0, 10000, { height: 10, propName: 'delayTime', style: { grow: .5 } });
  let delayInput = node.createInput({ propName: 'delayTime', height: 20, style: { type: InputType.Number, grow: .3, precision: 0 } });
  let feedbackSlider = node.createSlider(0, 0.9, { height: 10, propName: 'feedback', style: { grow: .5 } });
  let feedbackInput = node.createInput({ propName: 'feedback', height: 20, style: { type: InputType.Number, grow: .3, precision: 2 } });
  let cutoffSlider = node.createSlider(20, 20000, { height: 10, propName: 'cutoff', style: { grow: .5 } });
  let cutoffInput = node.createInput({ propName: 'cutoff', height: 20, style: { type: InputType.Number, grow: .3, precision: 0 } });
  let wetSlider = node.createSlider(0, 1, { height: 10, propName: 'wet', style: { grow: .5 } });
  let wetInput = node.createInput({ propName: 'wet', height: 20, style: { type: InputType.Number, grow: .3, precision: 2 } });
  let drySlider = node.createSlider(0, 1, { height: 10, propName: 'dry', style: { grow: .5 } });
  let dryInput = node.createInput({ propName: 'dry', height: 20, style: { type: InputType.Number, grow: .3, precision: 2 } });
  node.ui.append([
    node.createHozLayout([node.createLabel('Delay', { style: { grow: .3 } }), delaySlider, delayInput], { style: { spacing: 5 } }),
    node.createHozLayout([node.createLabel('Feedback', { style: { grow: .3 } }), feedbackSlider, feedbackInput], { style: { spacing: 5 } }),
    node.createHozLayout([node.createLabel('Cutoff', { style: { grow: .3 } }), cutoffSlider, cutoffInput], { style: { spacing: 5 } }),
    node.createHozLayout([node.createLabel('Wet', { style: { grow: .3 } }), wetSlider, wetInput], { style: { spacing: 5 } }),
    node.createHozLayout([node.createLabel('Dry', { style: { grow: .3 } }), drySlider, dryInput], { style: { spacing: 5 } }),
    node.createHozLayout([node.createLabel('Bypass ?', { style: { grow: .3 } }), bypassToggle], { style: { spacing: 5 } })
  ]);

  let delayChanged = () => node.props.delay.delayTime.value = node.props.delayTime / 1000;
  delaySlider.on('change', delayChanged);
  node.watch('delayTime', () => {
    if (node.props.delayTime < 10 || node.props.delayTime > 10000) {
      node.props.delayTime = clamp(node.props.delayTime, 10, 10000);
      delayChanged();
    }
  });
  let feedbackChanged = () => node.props.feedbackNode.gain.setTargetAtTime(node.props.feedback, flow.flowConnect.audioContext.currentTime, 0.01);
  feedbackSlider.on('change', feedbackChanged);
  node.watch('feedback', () => {
    if (node.props.feedback < 0 || node.props.feedback > 0.9) {
      node.props.feedback = clamp(node.props.feedback, 0, 0.9);
      feedbackChanged();
    }
  });
  let cutoffChanged = () => node.props.filter.frequency.setTargetAtTime(node.props.cutoff, flow.flowConnect.audioContext.currentTime, 0.01);
  cutoffSlider.on('change', cutoffChanged);
  node.watch('cutoff', () => {
    if (node.props.cutoff < 20 || node.props.cutoff > 20000) {
      node.props.cutoff = clamp(node.props.cutoff, 20, 20000);
      cutoffChanged();
    }
  });
  let wetChanged = () => node.props.wetGain.gain.setTargetAtTime(node.props.wet, flow.flowConnect.audioContext.currentTime, 0.01);
  wetSlider.on('change', wetChanged);
  node.watch('wet', () => {
    if (node.props.wet < 0 || node.props.wet > 1) {
      node.props.wet = clamp(node.props.wet, 0, 1);
      wetChanged();
    }
  });
  let dryChanged = () => node.props.dryGain.gain.setTargetAtTime(node.props.dry, flow.flowConnect.audioContext.currentTime, 0.01);
  drySlider.on('change', dryChanged);
  node.watch('dry', () => {
    if (node.props.dry < 0 || node.props.dry > 1) {
      node.props.dry = clamp(node.props.dry, 0, 1);
      dryChanged();
    }
  });
  node.watch('bypass', () => {
    bypassChanged();
  });

  // Handle actual webaudio node stuff
  node.outputs[0].on('connect', (_, connector) => node.outputs[0].ref.connect(connector.end.ref));
  node.outputs[0].on('disconnect', (_inst, _connector, _start, end) => node.outputs[0].ref.disconnect(end.ref));

  return node;
};
