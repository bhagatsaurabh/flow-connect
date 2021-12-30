import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { FlowConnectState } from "../../flow-connect";
import { Log } from "../../utils/logger";
import { Node } from '../../core/node';

export const Source = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Audio Source', options.position || new Vector2(50, 50), options.width || 200, {
    inputs: [
      { name: 'array-buffer', dataType: 'event' }, { name: 'gain', dataType: 'audioparam' },
      { name: 'detune', dataType: 'audioparam' }, { name: 'playback-rate', dataType: 'audioparam' }
    ],
    outputs: [{ name: 'out', dataType: 'audio' }, { name: 'ended', dataType: 'event' }],
    props: options.props
      ? { buffer: null, loop: true, prevChannelCount: -1, ...options.props }
      : { buffer: null, loop: true, prevChannelCount: -1 },
    style: options.style || { rowHeight: 10, spacing: 15 },
    terminalStyle: options.terminalStyle || {}
  });
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

  let fileInput = node.createSource({ input: true, output: true, height: 25, style: { grow: .7 } });
  let loopToggle = node.createToggle({ propName: 'loop', input: true, output: true, height: 10, style: { grow: .2 } });
  node.ui.append([
    node.createHozLayout([node.createLabel('File', { style: { grow: .3 } }), fileInput], { style: { spacing: 5 } }),
    node.createHozLayout([node.createLabel('Loop ?'), loopToggle], { style: { spacing: 5 } })
  ]);

  let processFile = async (file: File) => {
    let cached = flow.flowConnect.arrayBufferCache.get(file.name + file.type);
    if (!cached) {
      cached = await file.arrayBuffer();
      flow.flowConnect.arrayBufferCache.set(file.name + file.type, cached);
    }
    processArrayBuffer(cached);
  }
  let processArrayBuffer = async (arrayBuffer: ArrayBuffer) => {
    let cached = flow.flowConnect.audioBufferCache.get(arrayBuffer);
    if (!cached) {
      cached = await flow.flowConnect.audioContext.decodeAudioData(arrayBuffer);
      flow.flowConnect.audioBufferCache.set(arrayBuffer, cached);

      // If no. of channels has been changed, start an event propagation that will notify
      // every node that has a direct/indirect connection in the graph from this node
      if (node.props.prevChannelCount < 0 || node.props.prevChannelCount !== cached.numberOfChannels) {
        propagateChannelChange(cached.numberOfChannels);
      }
      node.props.prevChannelCount = cached.numberOfChannels;
    }
    node.props.buffer = cached;

    stopSource();
    playSource();
  }
  let playSource = () => {
    if (flow.flowConnect.state === FlowConnectState.Stopped || !node.props.buffer) return;

    let audioSourceNode = new AudioBufferSourceNode(flow.flowConnect.audioContext);
    audioSourceNode.buffer = node.props.buffer;
    audioSourceNode.loop = node.props.loop;
    node.props.sourceNode = audioSourceNode;

    node.props.proxyParamSourceNode.connect(audioSourceNode.detune, 0);
    node.props.proxyParamSourceNode.connect(audioSourceNode.playbackRate, 1);
    audioSourceNode.connect(node.outputs[0].ref);
    audioSourceNode.start();
  };
  let stopSource = () => {
    if (node.props.sourceNode) {
      node.props.sourceNode.stop();
      node.props.sourceNode = null;
    }
  };

  let propagateChannelChange = (newNoOfChannels: number) => {
    flow.executionGraph.propagate(node, (currNode: Node) => {
      currNode.call('channel-count-change', newNoOfChannels);
    });
  }

  loopToggle.on('change', () => {
    if (node.props.loop) {
      stopSource();
      playSource();
    } else node.props.sourceNode && (node.props.sourceNode.loop = node.props.loop);
  });
  node.inputs[0].on('event', (_, data) => {
    if (!(data instanceof ArrayBuffer)) {
      Log.error('Data received on Audio Source Node is not of type ArrayBuffer');
      return;
    }
    processArrayBuffer(data);
  });
  fileInput.on('change', (_inst, _oldVal: File, newVal: File) => processFile(newVal));
  fileInput.on('upload', (_inst, _oldVal: File, newVal: File) => processFile(newVal));

  flow.flowConnect.on('start', () => playSource());
  flow.flowConnect.on('stop', () => stopSource());

  // Handle actual webaudio node stuff
  node.outputs[0].on('connect', (_, connector) => {
    node.props.buffer && propagateChannelChange(node.props.buffer.numberOfChannels);
    node.outputs[0].ref.connect(connector.end.ref);
  });
  node.outputs[0].on('disconnect', (_inst, _connector, _start, end) => {
    node.outputs[0].ref.disconnect(end.ref);
  });

  return node;
};
