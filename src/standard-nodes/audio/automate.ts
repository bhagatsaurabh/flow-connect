import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui";
import { denormalize } from "../../utils";

export const Automate = (flow: Flow, options: NodeCreatorOptions = {}, envelope: Array<Vector2> = [new Vector2(.2, .5), new Vector2(.5, .8), new Vector2(.9, .2)]) => {

  let node = flow.createNode(
    options.name || 'Automate',
    options.position || new Vector2(50, 50),
    options.width || 280,
    [{ name: 'trigger', dataType: 'event' }],
    [{ name: 'out', dataType: 'audio' }],
    options.style || { rowHeight: 10, spacing: 15 },
    options.terminalStyle || {},
    options.props
      ? { min: 0, max: 1, value: 0.5, duration: 1, auto: true, loop: false, ...options.props }
      : { min: 0, max: 1, value: 0.5, duration: 1, auto: true, loop: false }
  );

  let setMinMax = () => {
    node.props.proxyParamNode.port.postMessage({ type: 'set-range', value: { min: node.props.min, max: node.props.max } });
  };

  node.props.proxyParamNode = new AudioWorkletNode(
    flow.flowConnect.audioContext,
    'proxy-param',
    { numberOfOutputs: 1, parameterData: { param: node.props.value } }
  );
  node.props.proxyParam = node.props.proxyParamNode.parameters.get('param');
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
  let autoToggle = node.createToggle({ propName: 'auto' });
  let loopToggle = node.createToggle({ propName: 'loop' });
  node.ui.append([
    envelopeInput,
    node.createHozLayout([
      node.createLabel('Min'), minInput,
      node.createLabel('Max'), maxInput
    ], { style: { spacing: 5 } }),
    node.createHozLayout([
      node.createLabel('Duration (seconds)', { style: { grow: .5 } }),
      durationInput
    ], { style: { spacing: 5 } }),
    node.createHozLayout([
      node.createHozLayout([node.createLabel('Auto Start ?', { height: 20 }), autoToggle], { style: { spacing: 5, grow: .5 } }),
      node.createHozLayout([node.createLabel('Loop ?', { height: 20 }), loopToggle], { style: { spacing: 5, grow: .5 } })
    ]),
  ]);

  let timerId: number;
  let scheduleEndTime: number;
  let finiteLoop = 2;            // how much iterations to schedule in the future
  let startAutomation = () => {
    // Stop any previously scheduled automations
    stopAutomation();

    // Convert normalized to actual values (x=time, y=param value)
    let values = envelopeInput.value;
    for (let currVal of values) {
      currVal.x = currVal.x * node.props.duration;
      currVal.y = denormalize(1 - currVal.y, node.props.min, node.props.max);
    }
    console.log(values);

    let automateDuration = values[values.length - 1].x;
    if (node.props.loop) {
      // Schedule far in the future hoping that even if main thread blocks it recovers by the time scheduled automations are finished
      schedule(values, flow.flowConnect.audioContext.currentTime, finiteLoop);
      timerId = window.setInterval(() => {
        // If web audio clock reaches final iteration of scheduled automations, then reschedule another finiteLoop iterations
        if (flow.flowConnect.audioContext.currentTime > scheduleEndTime - automateDuration) {
          schedule(values, scheduleEndTime, finiteLoop);
        }
      }, 50);
    } else {
      schedule(values, flow.flowConnect.audioContext.currentTime, 1);
    }
  };
  let stopAutomation = () => {
    node.props.proxyParam.cancelScheduledValues(flow.flowConnect.audioContext.currentTime);
    clearInterval(timerId);
  };
  let schedule = (values: Vector2[], time: number, iterations: number) => {
    for (let i = 0; i < iterations; i += 1) {
      values.forEach(value => {
        node.props.proxyParam.linearRampToValueAtTime(value.y, time + value.x)
      });
    }
    scheduleEndTime = time + values[values.length - 1].x;
  };

  minInput.on('blur', setMinMax);
  maxInput.on('blur', setMinMax);

  envelopeInput.on('change', () => startAutomation());
  durationInput.on('change', () => startAutomation());
  loopToggle.on('change', () => startAutomation());
  node.inputs[0].on('event', () => startAutomation());

  flow.flowConnect.on('start', () => node.props.auto && startAutomation());
  flow.flowConnect.on('stop', () => stopAutomation());

  // Handle actual webaudio node connection
  node.outputs[0].on('connect', (_inst, connector) => {
    if (connector.end.ref instanceof AudioParam) {
      // Need to do this else the value provided by the worklet node as param value is getting offset instead of overwrite
      let offset = Math.max(0, connector.end.ref.minValue);
      connector.end.ref.value = offset;
      if (offset !== 0) {
        node.props.proxyParamNode.port.postMessage({ type: 'set-offset', value: offset });
      }
    }
    node.outputs[0].ref.connect(connector.end.ref);
  });
  node.outputs[0].on('disconnect', (_inst, _connector, _start, end) => {
    stopAutomation();
    node.outputs[0].ref.disconnect(end.ref);
  });

  return node;
};
