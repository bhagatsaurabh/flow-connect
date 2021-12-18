import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui";

export const Automate = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'Automate',
    options.position || new Vector2(50, 50),
    options.width || 280, [],
    [{ name: 'automate', dataType: 'audio' }],
    options.style || { rowHeight: 10, spacing: 15 },
    options.terminalStyle || {},
    options.props
      ? { min: 0, max: 1, value: 0.5, duration: 1, envelope: [new Vector2(.2, .5), new Vector2(.5, .8), new Vector2(.9, .2)], ...options.props }
      : { min: 0, max: 1, value: 0.5, duration: 1, envelope: [new Vector2(.2, .5), new Vector2(.5, .8), new Vector2(.9, .2)] }
  );

  let setMinMax = () => {
    node.props.proxyParamNode.port.postMessage({ min: node.props.min, max: node.props.max });
  };

  node.props.proxyParamNode = new AudioWorkletNode(
    flow.flowConnect.audioContext,
    'proxy-param',
    { numberOfOutputs: 1, parameterData: { param: node.props.value } }
  );
  setMinMax();
  node.outputs[0].ref = node.props.proxyParamNode;

  let envelope = node.createEnvelope(145, node.props.envelope, 'envelope', true, true);
  let minInput = node.createInput(node.props.min, 'min', false, false, 20, { type: InputType.Number, grow: .4, step: 'any' } as any);
  let maxInput = node.createInput(node.props.max, 'max', false, false, 20, { type: InputType.Number, grow: .4, step: 'any' } as any);
  let durationInput = node.createInput(node.props.duration, 'duration', false, false, 20, { type: InputType.Number, step: 'any', grow: .5 } as any);
  node.ui.append([
    envelope,
    node.createHozLayout([
      node.createLabel('Min', null, false, false, { grow: .1 } as any), minInput,
      node.createLabel('Max', null, false, false, { grow: .1 } as any), maxInput
    ], { spacing: 5 }),
    node.createHozLayout([
      node.createLabel('Duration (seconds)', null, false, false, { grow: .5 } as any),
      durationInput
    ], { spacing: 5 })
  ]);

  minInput.on('blur', setMinMax);
  maxInput.on('blur', setMinMax);
  envelope.on('change', () => {
    // Schedule/Reschedule automation of connected param
  });
  durationInput.on('change', () => {
    // Schedule/Reschedule automation of connected param
  });

  // Handle actual webaudio node connection
  node.outputs[0].on('connect', (_, connector) => {
    node.outputs[0].ref.connect(connector.end.ref);
  });
  node.outputs[0].on('disconnect', (_, connector) => {
    node.outputs[0].ref.disconnect(connector.end.ref);
  });

  return node;
};
