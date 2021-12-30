import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType, Input } from "../../ui/input";
import { clamp, denormalize } from "../../utils/utils";
import { Node } from "../../core/node";
import { Envelope } from "../../ui/envelope";

export class ADSR extends Node {
  envelopeInput: Envelope;
  minInput: Input;
  maxInput: Input;
  aInput: Input;
  dInput: Input;
  sInput: Input;
  rInput: Input;

  proxyParamNode: AudioWorkletNode;
  proxyParam: AudioParam;

  static DefaultProps = { min: 0, max: 1, a: 0.4, d: 0.2, s: 0.6, r: 0.4, trigger: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'ADSR', options.position || new Vector2(50, 50), options.width || 280,
      [{ name: 'trigger', dataType: 'event' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        props: options.props ? { ...ADSR.DefaultProps, ...options.props } : ADSR.DefaultProps,
        style: options.style || { rowHeight: 10, spacing: 15 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.proxyParamNode = new AudioWorkletNode(
      flow.flowConnect.audioContext,
      'proxy-param',
      { numberOfOutputs: 1, parameterData: { param: 0 } }
    );
    this.proxyParam = (this.proxyParamNode.parameters as Map<string, AudioParam>).get('param');
    this.outputs[0].ref = this.proxyParamNode;
    this.setMinMax();
    this.props.s = clamp(this.props.s, 0, 1);

    this.setupUI();

    this.minInput.on('blur', this.setMinMax);
    this.maxInput.on('blur', this.setMinMax);
    this.aInput.on('blur', () => this.adsrChanged());
    this.dInput.on('blur', () => this.adsrChanged());
    this.sInput.on('blur', () => this.adsrChanged());
    this.rInput.on('blur', () => this.adsrChanged());

    this.inputs[0].on('event', () => {
      this.props.trigger = !this.props.trigger;
      let currTime = flow.flowConnect.audioContext.currentTime;
      let { a, d, s, r } = this.props;
      if (this.props.trigger) {
        // Attack
        this.proxyParam.cancelScheduledValues(0);
        this.proxyParam.setValueAtTime(this.props.min, currTime);
        this.proxyParam.linearRampToValueAtTime(1 * this.props.max, currTime + a);
        this.proxyParam.linearRampToValueAtTime(denormalize(s, this.props.min, this.props.max), currTime + a + d);
      } else {
        // Release
        this.proxyParam.cancelScheduledValues(0);
        this.proxyParam.setValueAtTime(this.proxyParam.value, currTime);
        this.proxyParam.linearRampToValueAtTime(this.props.min, currTime + r);
      }
    });

    this.handleAudioConnections();
  }
  adsrChanged() {
    this.props.s = clamp(this.props.s, 0, 1);
    let { a, d, r } = this.props;
    let totalDur = a + d + r;
    this.envelopeInput.value = [
      Vector2.Zero(), new Vector2(a / totalDur, 1), new Vector2((a + d) / totalDur, this.props.s), new Vector2(1, 0)
    ];
  }
  stopAutomation() {
    this.proxyParam.cancelScheduledValues(this.flow.flowConnect.audioContext.currentTime);
  }
  setMinMax() {
    this.props.proxyParamNode.port.postMessage({
      type: 'set-range',
      value: { min: this.props.min, max: this.props.max }
    });
  }
  setupUI() {
    let { a: atck, d: dcay, r: rlse } = this.props;
    let duration = atck + dcay + rlse;

    this.envelopeInput = this.createEnvelope(145, [
      Vector2.Zero(), new Vector2(atck / duration, 1), new Vector2((atck + dcay) / duration, this.props.s), new Vector2(1, 0)
    ], { style: { pointColor: '#fcba03' } });
    this.envelopeInput.disabled = true;

    this.minInput = this.createInput({
      propName: 'min', height: 20, style: { type: InputType.Number, grow: .5, step: 'any' }
    });
    this.maxInput = this.createInput({
      propName: 'max', height: 20, style: { type: InputType.Number, grow: .5, step: 'any' }
    });
    this.aInput = this.createInput({ propName: 'a', height: 20, style: { type: InputType.Number, step: 'any', grow: .5, precision: 3 } });
    this.dInput = this.createInput({ propName: 'd', height: 20, style: { type: InputType.Number, step: 'any', grow: .5, precision: 3 } });
    this.sInput = this.createInput({ propName: 's', height: 20, style: { type: InputType.Number, step: 'any', grow: .5, precision: 3 } });
    this.rInput = this.createInput({ propName: 'r', height: 20, style: { type: InputType.Number, step: 'any', grow: .5, precision: 3 } });

    this.ui.append([
      this.envelopeInput,
      this.createHozLayout([
        this.createLabel('Min'), this.minInput,
        this.createLabel('Max'), this.maxInput
      ], { style: { spacing: 5 } }),
      this.createHozLayout([
        this.createLabel('A'), this.aInput, this.createLabel('D'), this.dInput
      ], { style: { spacing: 5 } }),
      this.createHozLayout([
        this.createLabel('S'), this.sInput, this.createLabel('R'), this.rInput
      ], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_inst, connector) => {
      if (connector.end.ref instanceof AudioParam) {
        // Need to do this else the value provided by the worklet node as param value is getting offset instead of overwrite
        let offset = Math.max(0, connector.end.ref.minValue);
        connector.end.ref.value = offset;
        if (offset !== 0) {
          this.proxyParamNode.port.postMessage({ type: 'set-offset', value: offset });
        }
      }
      this.outputs[0].ref.connect(connector.end.ref);
    });
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => {
      this.stopAutomation();
      this.outputs[0].ref.disconnect(end.ref);
    });
  }
}
