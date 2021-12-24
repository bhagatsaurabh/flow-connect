import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Terminal, TerminalType } from "../../core";

export const ChannelMerger = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'Channel Merger',
    options.position || new Vector2(50, 50),
    options.width || 160,
    [{ name: 'Channel 1', dataType: 'audio' }, { name: 'Channel 2', dataType: 'audio' }],
    [{ name: 'out', dataType: 'audio' }],
    options.style || { rowHeight: 10, spacing: 15 },
    options.terminalStyle || {},
    options.props
      ? { ...options.props }
      : {}
  );
  node.inputs[0].ref = flow.flowConnect.audioContext.createGain();
  node.inputs[1].ref = flow.flowConnect.audioContext.createGain();
  node.outputs[0].ref = flow.flowConnect.audioContext.createGain();
  node.props.merger = flow.flowConnect.audioContext.createChannelMerger(2);
  node.inputs[0].ref.connect(node.props.merger, 0, 0);
  node.inputs[1].ref.connect(node.props.merger, 0, 1);
  node.props.merger.connect(node.outputs[0].ref);

  let addChannelButton = node.createButton('Add In Channel', { height: 20 });
  node.ui.append(addChannelButton);

  addChannelButton.on('click', () => {
    node.props.merger.disconnect();
    node.inputs.forEach(input => input.ref.disconnect());
    node.props.merger = flow.flowConnect.audioContext.createChannelMerger(node.inputs.length + 1);

    let newTerm = new Terminal(node, TerminalType.IN, 'audio', 'Channel ' + (node.inputs.length + 1));
    newTerm.ref = flow.flowConnect.audioContext.createGain();
    node.addTerminal(newTerm);

    node.inputs.forEach((input, index) => input.ref.connect(node.props.merger, 0, index));
    node.props.merger.connect(node.outputs[0].ref);
  });

  // Handle actual webaudio node stuff
  node.outputs[0].on('connect', (_, connector) => node.outputs[0].ref.connect(connector.end.ref));
  node.outputs[0].on('disconnect', (_inst, _connector, _start, end) => node.outputs[0].ref.disconnect(end.ref));

  return node;
};
