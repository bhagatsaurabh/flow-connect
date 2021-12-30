import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { FlowConnectState } from "../../flow-connect";
import { Constant } from "../../resource/constants";
import { clamp } from "../../utils/utils";
import { InputType } from "../../ui/input";

export const Metronome = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Metronome', options.position || new Vector2(50, 50), options.width || 200, {
    inputs: [
      { name: 'trigger', dataType: 'event' }, { name: 'gain', dataType: 'audioparam' },
      { name: 'detune', dataType: 'audioparam' }, { name: 'playback-rate', dataType: 'audioparam' }
    ],
    outputs: [{ name: 'out', dataType: 'audio' }],
    props: options.props
      ? { frequency: 330, buffer: null, bpm: 130, loop: true, auto: true, ...options.props }
      : { frequency: 330, buffer: null, bpm: 130, loop: true, auto: true, },
    style: options.style || { rowHeight: 10, spacing: 15 },
    terminalStyle: options.terminalStyle || {}
  });

  let fillBuffer = () => {
    let ctx = flow.flowConnect.audioContext;

    let buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    let channel = buffer.getChannelData(0);

    let phase = 0;
    let amp = 1;
    let durationFrames = ctx.sampleRate / 50;

    const f = node.props.frequency;
    for (let i = 0; i < durationFrames; i++) {
      channel[i] = Math.sin(phase) * amp;
      phase += Constant.TAU * f / ctx.sampleRate;
      if (phase > Constant.TAU) {
        phase -= Constant.TAU;
      }
      amp -= 1 / durationFrames;
    }
    node.props.buffer = buffer;
  };

  node.props.volumeGainNode = flow.flowConnect.audioContext.createGain();
  node.props.proxyParamSourceNode = new AudioWorkletNode(
    flow.flowConnect.audioContext,
    'proxy-param-for-source',
    { numberOfOutputs: 2, parameterData: { detune: 0, playbackRate: 1 } }
  );
  node.inputs[1].ref = node.props.volumeGainNode.gain;
  node.inputs[2].ref = node.props.proxyParamSourceNode.parameters.get('detune');
  node.inputs[3].ref = node.props.proxyParamSourceNode.parameters.get('playbackRate');
  node.inputs[1].on('data', (_, data) => typeof data === 'number' && (node.inputs[1].ref.value = data));
  node.inputs[2].on('data', (_, data) => typeof data === 'number' && (node.inputs[2].ref.value = data));
  node.inputs[3].on('data', (_, data) => typeof data === 'number' && (node.inputs[3].ref.value = data));
  node.outputs[0].ref = node.props.volumeGainNode;
  fillBuffer();

  let autoToggle = node.createToggle({ propName: 'auto', height: 10, style: { grow: 0.2 } });
  let freqInput = node.createInput({ propName: 'frequency', height: 20, style: { type: InputType.Number, grow: 0.5 } });
  let bpmInput = node.createInput({ propName: 'bpm', height: 20, style: { type: InputType.Number, grow: 0.5 } });
  node.ui.append([
    node.createHozLayout([node.createLabel('Auto ?'), autoToggle], { style: { spacing: 5 } }),
    node.createHozLayout([
      node.createLabel('Frequency'), freqInput, node.createLabel('BPM'), bpmInput
    ], { style: { spacing: 5 } })
  ]);

  let playSource = () => {
    if (flow.flowConnect.state === FlowConnectState.Stopped || !node.props.buffer) return;

    let audioSourceNode = new AudioBufferSourceNode(flow.flowConnect.audioContext);
    audioSourceNode.buffer = node.props.buffer;
    audioSourceNode.loop = true;
    node.props.sourceNode = audioSourceNode;

    audioSourceNode.loopEnd = 1 / (clamp(node.props.bpm, 30, 300) / 60);
    node.props.proxyParamSourceNode.connect(audioSourceNode.detune, 0);
    node.props.proxyParamSourceNode.connect(audioSourceNode.playbackRate, 1);
    audioSourceNode.connect(node.outputs[0].ref);
    audioSourceNode.start(0);
  };
  let stopSource = () => {
    if (node.props.sourceNode) {
      node.props.sourceNode.stop();
      node.props.sourceNode = null;
    }
  };

  bpmInput.on('change', () => {
    if (node.props.sourceNode) {
      node.props.sourceNode.loopEnd = 1 / (clamp(node.props.bpm, 30, 300) / 60);
    }
  });
  freqInput.on('change', () => {
    if (node.props.sourceNode) {
      stopSource();
      fillBuffer();
      playSource();
    } else fillBuffer();
  });
  node.inputs[0].on('event', () => playSource());

  flow.flowConnect.on('start', () => node.props.auto && playSource());
  flow.flowConnect.on('stop', () => stopSource());

  // Handle actual webaudio node stuff
  node.outputs[0].on('connect', (_, connector) => node.outputs[0].ref.connect(connector.end.ref));
  node.outputs[0].on('disconnect', (_inst, _connector, _start, end) => node.outputs[0].ref.disconnect(end.ref));

  return node;
};
