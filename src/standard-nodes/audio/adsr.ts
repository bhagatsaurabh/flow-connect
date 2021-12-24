import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui";
import { clamp, denormalize } from "../../utils";

export const ADSR = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'ADSR',
    options.position || new Vector2(50, 50),
    options.width || 280,
    [{ name: 'trigger', dataType: 'event' }],
    [{ name: 'out', dataType: 'audio' }],
    options.style || { rowHeight: 10, spacing: 15 },
    options.terminalStyle || {},
    options.props
      ? { min: 0, max: 1, a: 0.4, d: 0.2, s: 0.6, r: 0.4, trigger: false, ...options.props }
      : { min: 0, max: 1, a: 0.4, d: 0.2, s: 0.6, r: 0.4, trigger: false }
  );

  let setMinMax = () => node.props.proxyParamNode.port.postMessage({
    type: 'set-range', value: { min: node.props.min, max: node.props.max }
  });

  node.props.proxyParamNode = new AudioWorkletNode(
    flow.flowConnect.audioContext,
    'proxy-param',
    { numberOfOutputs: 1, parameterData: { param: 0 } }
  );
  node.props.proxyParam = node.props.proxyParamNode.parameters.get('param');
  node.outputs[0].ref = node.props.proxyParamNode;
  setMinMax();
  node.props.s = clamp(node.props.s, 0, 1);

  let { a: atck, d: dcay, r: rlse } = node.props;
  let duration = atck + dcay + rlse;
  let envelopeInput = node.createEnvelope(145, [
    Vector2.Zero(), new Vector2(atck / duration, 1), new Vector2((atck + dcay) / duration, node.props.s), new Vector2(1, 0)
  ], { style: { pointColor: '#fcba03' } });
  envelopeInput.disabled = true;
  let minInput = node.createInput({
    propName: 'min', height: 20, style: { type: InputType.Number, grow: .5, step: 'any' }
  });
  let maxInput = node.createInput({
    propName: 'max', height: 20, style: { type: InputType.Number, grow: .5, step: 'any' }
  });
  let aInput = node.createInput({ propName: 'a', height: 20, style: { type: InputType.Number, step: 'any', grow: .5, precision: 3 } });
  let dInput = node.createInput({ propName: 'd', height: 20, style: { type: InputType.Number, step: 'any', grow: .5, precision: 3 } });
  let sInput = node.createInput({ propName: 's', height: 20, style: { type: InputType.Number, step: 'any', grow: .5, precision: 3 } });
  let rInput = node.createInput({ propName: 'r', height: 20, style: { type: InputType.Number, step: 'any', grow: .5, precision: 3 } });
  node.ui.append([
    envelopeInput,
    node.createHozLayout([
      node.createLabel('Min'), minInput,
      node.createLabel('Max'), maxInput
    ], { style: { spacing: 5 } }),
    node.createHozLayout([
      node.createLabel('A'), aInput, node.createLabel('D'), dInput
    ], { style: { spacing: 5 } }),
    node.createHozLayout([
      node.createLabel('S'), sInput, node.createLabel('R'), rInput
    ], { style: { spacing: 5 } })
  ]);

  let stopAutomation = () => {
    node.props.proxyParam.cancelScheduledValues(flow.flowConnect.audioContext.currentTime);
  };
  let adsrChanged = () => {
    node.props.s = clamp(node.props.s, 0, 1);
    let { a, d, r } = node.props;
    let totalDur = a + d + r;
    envelopeInput.value = [
      Vector2.Zero(), new Vector2(a / totalDur, 1), new Vector2((a + d) / totalDur, node.props.s), new Vector2(1, 0)
    ];
  };

  minInput.on('blur', setMinMax);
  maxInput.on('blur', setMinMax);
  aInput.on('blur', () => adsrChanged());
  dInput.on('blur', () => adsrChanged());
  sInput.on('blur', () => adsrChanged());
  rInput.on('blur', () => adsrChanged());

  node.inputs[0].on('event', () => {
    node.props.trigger = !node.props.trigger;
    let currTime = flow.flowConnect.audioContext.currentTime;
    let { a, d, s, r } = node.props;
    if (node.props.trigger) {
      // Attack
      node.props.proxyParam.cancelScheduledValues(0);
      node.props.proxyParam.setValueAtTime(node.props.min, currTime);
      node.props.proxyParam.linearRampToValueAtTime(1 * node.props.max, currTime + a);
      node.props.proxyParam.linearRampToValueAtTime(denormalize(s, node.props.min, node.props.max), currTime + a + d);
    } else {
      // Release
      node.props.proxyParam.cancelScheduledValues(0);
      node.props.proxyParam.setValueAtTime(node.props.proxyParam.value, currTime);
      node.props.proxyParam.linearRampToValueAtTime(node.props.min, currTime + r);
    }
  });

  // Handle actual webaudio node stuff
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
