import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp, denormalize } from "../../utils/utils";
import { Node } from '../../core/node';
import { Toggle } from "../../ui/toggle";
import { Slider2D } from "../../ui/2d-slider";
import { Slider } from "../../ui/slider";
import { Input, InputType } from "../../ui/input";

export class SpatialPanner extends Node {
  panSlider2D: Slider2D;
  zSlider: Slider;
  zInput: Input;
  bypassToggle: Toggle;

  panner: PannerNode;
  inGain: GainNode;
  outGain: GainNode;

  posX: number;
  posY: number;
  posZ: number;
  orientationX: number = 0.0;
  orientationY: number = 0.0;
  orientationZ: number = -1.0;

  static DefaultState = { value: new Vector2(.5, .5), z: -1, bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || '3D Spatial Panner',
      options.position || new Vector2(50, 50),
      options.width || 200,
      [{ name: 'in', dataType: 'audio' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        state: options.state ? { ...SpatialPanner.DefaultState, ...options.state } : SpatialPanner.DefaultState,
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    )

    this.posX = this.flow.flowConnect.audioContext.listener.positionX.value;
    this.posY = this.flow.flowConnect.audioContext.listener.positionY.value;
    this.posZ = -1;

    this.inGain = flow.flowConnect.audioContext.createGain();
    this.outGain = flow.flowConnect.audioContext.createGain();
    this.panner = new PannerNode(flow.flowConnect.audioContext, {
      panningModel: 'HRTF',
      distanceModel: 'linear',
      positionX: this.posX,
      positionY: this.posY,
      positionZ: this.posZ,
      orientationX: this.orientationX,
      orientationY: this.orientationY,
      orientationZ: this.orientationZ
    });

    this.inputs[0].ref = this.inGain;
    this.outputs[0].ref = this.outGain;

    this.setBypass();

    this.setupUI();

    this.watch('value', (_oldVal, newVal) => {
      let x = denormalize(newVal.x, -1, 1);
      let y = denormalize(newVal.y, -1, 1);
      this.panner.positionX.value = x;
      this.panner.positionY.value = y;
    });
    this.watch('z', (_oldVal, newVal) => {
      if (newVal < -10000 || newVal > 10000) this.state.z = clamp(parseInt(newVal), -10000, 10000);
      this.panner.positionZ.value = this.state.z;
    });
    this.watch('bypass', this.setBypass.bind(this));

    this.handleAudioConnections();
  }

  setBypass() {
    if (!this.state.bypass) {
      this.inGain.disconnect();
      this.inGain.connect(this.panner);
      this.panner.connect(this.outGain);
    } else {
      this.panner.disconnect();
      this.inGain.disconnect();
      this.inGain.connect(this.outGain);
    }
  }

  setupUI() {
    this.panSlider2D = this.createSlider2D({ propName: 'value', height: this.width - this.style.padding * 2 });
    this.zSlider = this.createSlider(-10000, 10000, { height: 10, propName: 'z', style: { grow: .6 } });
    this.zInput = this.createInput({ propName: 'z', height: 20, style: { type: InputType.Number, grow: .3, precision: 0 } });
    this.bypassToggle = this.createToggle({ propName: 'bypass', style: { grow: .15 } });
    this.ui.append([
      this.panSlider2D,
      this.createHozLayout([this.createLabel('Z', { style: { grow: .1 } }), this.zSlider, this.zInput], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Bypass ?', { style: { grow: .3 } }), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
