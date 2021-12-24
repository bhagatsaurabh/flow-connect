import { Flow, FlowState } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Terminal, TerminalType } from "../../core";

export const Debug = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'Debug',
    options.position || new Vector2(50, 50),
    options.width || 120,
    [{ name: 'in', dataType: 'audio' }],
    [{ name: 'out', dataType: 'audio' }, { name: 'debug', dataType: 'any' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props
      ? { ...options.props }
      : {}
  );
  node.props.inGain = flow.flowConnect.audioContext.createGain();
  node.props.outGain = flow.flowConnect.audioContext.createGain();
  node.inputs[0].ref = node.props.inGain;
  node.outputs[0].ref = node.props.outGain;

  node.props.debugNode = new AudioWorkletNode(flow.flowConnect.audioContext, 'debug', { numberOfInputs: 1, numberOfOutputs: 1 });
  node.props.debugNode.port.onmessage = (e: any) => {
    if (flow.state !== FlowState.Stopped) node.setOutputs(1, e.data);
  }
  node.inputs[0].ref.connect(node.props.debugNode);
  node.props.debugNode.connect(node.outputs[0].ref);

  // Handle actual webaudio node stuff
  node.outputs[0].on('connect', (_, connector) => node.outputs[0].ref.connect(connector.end.ref));
  node.outputs[0].on('disconnect', (_inst, _connector, _start, end) => node.outputs[0].ref.disconnect(end.ref));

  return node;
};
