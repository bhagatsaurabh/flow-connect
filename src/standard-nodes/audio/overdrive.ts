import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType, Input } from "../../ui/input";
import { clamp } from "../../utils/utils";
import { Node } from '../../core/node';
import { Slider } from "../../ui/slider";
import { Toggle } from "../../ui/toggle";
import { Select } from "../../ui/select";
let Tuna = require('../../lib/tuna.js');

export class OverdriveEffect extends Node {
  driveSlider: Slider;
  driveInput: Input;
  outGainSlider: Slider;
  outGainInput: Input;
  curveAmountSlider: Slider;
  curveAmountInput: Input;
  algorithmSelect: Select;
  bypassToggle: Toggle;
  overdrive: any;

  static DefaultProps = { drive: 0.197, outGain: -9.154, curveAmount: 0.979, algorithm: 1, bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Overdrive Effect',
      options.position || new Vector2(50, 50),
      options.width || 230,
      [{ name: 'in', dataType: 'audio' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {},
        props: options.props ? { ...OverdriveEffect.DefaultProps, ...options.props } : OverdriveEffect.DefaultProps
      }
    )

    if (!(window as any).__tuna__) (window as any).__tuna__ = new Tuna(flow.flowConnect.audioContext);

    this.overdrive = new (window as any).__tuna__.Overdrive();
    this.inputs[0].ref = this.outputs[0].ref = this.overdrive;
    this.setupUI();
    Object.assign(this.overdrive, {
      drive: this.props.drive,
      outputGain: this.props.outGain,
      curveAmount: this.props.curveAmount,
      algorithmIndex: parseInt(this.props.algorithm) - 1
    });

    this.watch('drive', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 1) this.props.drive = clamp(newVal, 0, 1);
      this.overdrive.drive = this.props.drive;
    });
    this.watch('outGain', (_oldVal, newVal) => {
      if (newVal < -46 || newVal > 0) this.props.outGain = clamp(newVal, -46, 0);
      this.overdrive.outputGain = this.props.outGain;
    });
    this.watch('curveAmount', (_oldVal, newVal) => {
      if (newVal < 0 || newVal > 1) this.props.curveAmount = clamp(newVal, 0, 1);
      this.overdrive.curveAmount = this.props.curveAmount;
    });
    this.watch('algorithm', (_oldVal, newVal) => {
      newVal = parseInt(newVal);
      if (!newVal) newVal = 1;
      if (newVal < 1 || newVal > 6) newVal = clamp(newVal, 1, 6);
      this.overdrive.algorithmIndex = newVal - 1;
    });
    this.watch('bypass', (_oldVal, newVal) => this.overdrive.bypass = newVal);

    this.handleAudioConnections();
  }

  setupUI() {
    this.driveSlider = this.createSlider(0, 1, { height: 10, propName: 'drive', style: { grow: .5 } });
    this.driveInput = this.createInput({ propName: 'drive', height: 20, style: { type: InputType.Number, grow: .2, precision: 4 } });
    this.outGainSlider = this.createSlider(-46, 0, { height: 10, propName: 'outGain', style: { grow: .5 } });
    this.outGainInput = this.createInput({ propName: 'outGain', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    this.curveAmountSlider = this.createSlider(0, 0.95, { height: 10, propName: 'curveAmount', style: { grow: .5 } });
    this.curveAmountInput = this.createInput({ propName: 'curveAmount', height: 20, style: { type: InputType.Number, grow: .2, precision: 2 } });
    this.algorithmSelect = this.createSelect(['1', '2', '3', '4', '5', '6'], { propName: 'algorithm', height: 20, style: { grow: .7 } })
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .1 } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Drive', { style: { grow: .3 } }), this.driveSlider, this.driveInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Output Gain', { style: { grow: .3 } }), this.outGainSlider, this.outGainInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Curve Amount', { style: { grow: .3 } }), this.curveAmountSlider, this.curveAmountInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Algorithm', { style: { grow: .3 } }), this.algorithmSelect], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
