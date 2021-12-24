import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Terminal, TerminalType } from "../../core";

export const ChannelSplitter = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'Channel Splitter',
    options.position || new Vector2(50, 50),
    options.width || 160,
    [{ name: 'in', dataType: 'audio' }],
    [{ name: 'Channel 1', dataType: 'audio' }],
    options.style || { rowHeight: 10, spacing: 15 },
    options.terminalStyle || {},
    options.props
      ? { ...options.props }
      : {}
  );
  node.inputs[0].ref = flow.flowConnect.audioContext.createGain();
  node.outputs[0].ref = flow.flowConnect.audioContext.createGain();

  let oldNoOfChannels = 1;
  let checkChannels = (newNoOfChannels: number) => {
    if (oldNoOfChannels === newNoOfChannels) return;

    node.props.splitter && node.props.splitter.disconnect();
    node.inputs[0].ref.disconnect();

    let splitter = flow.flowConnect.audioContext.createChannelSplitter(newNoOfChannels);
    node.inputs[0].ref.connect(splitter);

    let terminalsToRemove = [];
    for (let i = 0; i < Math.max(newNoOfChannels, oldNoOfChannels); i += 1) {
      if (i < newNoOfChannels) {
        if (i < oldNoOfChannels) {
          splitter.connect(node.outputs[i].ref, i);
        } else {
          let newTerminal = new Terminal(node, TerminalType.OUT, 'audio', 'Channel ' + (i + 1));
          newTerminal.ref = flow.flowConnect.audioContext.createGain();
          node.addTerminal(newTerminal);
          node.outputs[i].on('connect', (_inst, cntr) => node.outputs[i].ref.connect(cntr.end.ref));
          node.outputs[i].on('disconnect', (_inst, _cntr, _start, end) => node.outputs[i].ref.disconnect(end.ref));
          splitter.connect(node.outputs[i].ref, i);
        }
      } else {
        terminalsToRemove.push(node.outputs[i]);
      }
    }
    terminalsToRemove.forEach(term => {
      term.ref.disconnect();
      node.removeTerminal(term);
    });

    oldNoOfChannels = newNoOfChannels;
    node.props.splitter = splitter;
  }

  // Handle actual webaudio node stuff
  // node.inputs[0].on('connect', (_inst, connector) => checkChannels(connector.start.ref.channelCount));
  node.on('channel-count-change', (newNoOfChannels) => checkChannels(newNoOfChannels));

  node.outputs[0].on('connect', (_inst, cntr) => node.outputs[0].ref.connect(cntr.end.ref));
  node.outputs[0].on('disconnect', (_inst, _cntr, _start, end) => node.outputs[0].ref.disconnect(end.ref));

  return node;
};
