import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui";

export const Automate = (flow: Flow, options: NodeCreatorOptions = {}, envelope: Array<Vector2> = [new Vector2(.2, .5), new Vector2(.5, .8), new Vector2(.9, .2)]) => {

  let node = flow.createNode(
    options.name || 'Automate',
    options.position || new Vector2(50, 50),
    options.width || 280, [],
    [{ name: 'automate', dataType: 'audio' }],
    options.style || { rowHeight: 10, spacing: 15 },
    options.terminalStyle || {},
    options.props
      ? { min: 0, max: 1, value: 0.5, duration: 1, ...options.props }
      : { min: 0, max: 1, value: 0.5, duration: 1 }
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

  let envelopeInput = node.createEnvelope(145, envelope, { input: true, output: true });
  let minInput = node.createInput({
    propName: 'min', height: 20, style: { type: InputType.Number, grow: .5, step: 'any' }
  });
  let maxInput = node.createInput({
    propName: 'max', height: 20, style: { type: InputType.Number, grow: .5, step: 'any' }
  });
  let durationInput = node.createInput({
    propName: 'duration', height: 20, style: { type: InputType.Number, step: 'any', grow: .5 }
  });
  node.ui.append([
    envelopeInput,
    node.createHozLayout([
      node.createLabel('Min'), minInput,
      node.createLabel('Max'), maxInput
    ], { style: { spacing: 5 } }),
    node.createHozLayout([
      node.createLabel('Duration (seconds)', { style: { grow: .5 } }),
      durationInput
    ], { style: { spacing: 5 } })
  ]);

  minInput.on('blur', setMinMax);
  maxInput.on('blur', setMinMax);
  envelopeInput.on('change', () => {
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
