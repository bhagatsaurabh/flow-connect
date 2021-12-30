import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType, Input } from "../../ui/input";
import { denormalize } from "../../utils/utils";
import { Node } from "../../core/node";
import { Envelope } from "../../ui/envelope";
import { Toggle } from "../../ui/toggle";

export class Automate extends Node {
  envelopeInput: Envelope;
  minInput: Input;
  maxInput: Input;
  durationInput: Input;
  autoToggle: Toggle;
  loopToggle: Toggle;

  proxyParamNode: AudioWorkletNode;
  proxyParam: AudioParam;

  static DefaultProps = { min: 0, max: 1, value: 0.5, duration: 1, auto: true, loop: false };

  timerId: number;
  scheduleEndTime: number;
  finiteLoop = 2;            // how much iterations to schedule in the future

  constructor(flow: Flow, options: NodeCreatorOptions = {}, envelope: Array<Vector2> = [new Vector2(.2, .5), new Vector2(.5, .8), new Vector2(.9, .2)]) {
    super(flow, options.name || 'Automate', options.position || new Vector2(50, 50), options.width || 280,
      [{ name: 'trigger', dataType: 'event' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        props: options.props ? { ...Automate.DefaultProps, ...options.props } : Automate.DefaultProps,
        style: options.style || { rowHeight: 10, spacing: 15 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.proxyParamNode = new AudioWorkletNode(
      flow.flowConnect.audioContext,
      'proxy-param',
      { numberOfOutputs: 1, parameterData: { param: this.props.value } }
    );
    this.proxyParam = (this.proxyParamNode.parameters as Map<string, AudioParam>).get('param');
    this.setMinMax();
    this.outputs[0].ref = this.proxyParamNode;

    this.setupUI(envelope);

    this.minInput.on('blur', () => {
      this.setMinMax();
      this.startAutomation();
    });
    this.maxInput.on('blur', () => {
      this.setMinMax();
      this.startAutomation();
    });

    this.envelopeInput.on('change', () => this.startAutomation());
    this.durationInput.on('change', () => this.startAutomation());
    this.loopToggle.on('change', () => this.startAutomation());
    this.inputs[0].on('event', () => this.startAutomation());

    flow.flowConnect.on('start', () => this.props.auto && this.startAutomation());
    flow.flowConnect.on('stop', () => this.stopAutomation());

    this.handleAudioConnections();
  }

  startAutomation() {
    // Stop any previously scheduled automations
    this.stopAutomation();

    // Convert normalized to actual values (x=time, y=param value)
    let values = this.envelopeInput.value;
    for (let currVal of values) {
      currVal.x = currVal.x * this.props.duration;
      currVal.y = denormalize(currVal.y, this.props.min, this.props.max);
    }

    let automateDuration = values[values.length - 1].x;
    if (this.props.loop) {
      // Schedule far in the future hoping that even if main thread blocks it recovers by the time scheduled automations are finished
      this.schedule(values, this.flow.flowConnect.audioContext.currentTime, this.finiteLoop);
      this.timerId = window.setInterval(() => {
        // If web audio clock reaches final iteration of scheduled automations, then reschedule another finiteLoop iterations
        if (this.flow.flowConnect.audioContext.currentTime > this.scheduleEndTime - automateDuration) {
          this.schedule(values, this.scheduleEndTime, this.finiteLoop);
        }
      }, 50);
    } else {
      this.schedule(values, this.flow.flowConnect.audioContext.currentTime, 1);
    }
  }
  stopAutomation() {
    this.proxyParam.cancelScheduledValues(this.flow.flowConnect.audioContext.currentTime);
    clearInterval(this.timerId);
  }
  schedule(values: Vector2[], time: number, iterations: number) {
    for (let i = 0; i < iterations; i += 1) {
      values.forEach(value => {
        this.proxyParam.linearRampToValueAtTime(value.y, time + value.x)
      });
    }
    this.scheduleEndTime = time + values[values.length - 1].x;
  }
  setMinMax() {
    this.proxyParamNode.port.postMessage({ type: 'set-range', value: { min: this.props.min, max: this.props.max } });
  }
  setupUI(envelope: Vector2[]) {
    this.envelopeInput = this.createEnvelope(145, envelope, { input: true, output: true });
    this.minInput = this.createInput({
      propName: 'min', height: 20, style: { type: InputType.Number, grow: .5, step: 'any' }
    });
    this.maxInput = this.createInput({
      propName: 'max', height: 20, style: { type: InputType.Number, grow: .5, step: 'any' }
    });
    this.durationInput = this.createInput({
      propName: 'duration', height: 20, style: { type: InputType.Number, step: 'any', grow: .5 }
    });
    this.autoToggle = this.createToggle({ propName: 'auto' });
    this.loopToggle = this.createToggle({ propName: 'loop' });

    this.ui.append([
      this.envelopeInput,
      this.createHozLayout([
        this.createLabel('Min'), this.minInput,
        this.createLabel('Max'), this.maxInput
      ], { style: { spacing: 5 } }),
      this.createHozLayout([
        this.createLabel('Duration (seconds)', { style: { grow: .5 } }),
        this.durationInput
      ], { style: { spacing: 5 } }),
      this.createHozLayout([
        this.createHozLayout([this.createLabel('Auto Start ?', { height: 20 }), this.autoToggle], { style: { spacing: 5, grow: .5 } }),
        this.createHozLayout([this.createLabel('Loop ?', { height: 20 }), this.loopToggle], { style: { spacing: 5, grow: .5 } })
      ]),
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
      this.startAutomation();
    });
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => {
      this.stopAutomation();
      this.outputs[0].ref.disconnect(end.ref);
    });
  }
}
