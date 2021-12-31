import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp, denormalize, normalize } from "../../utils/utils";
import { Node } from '../../core/node';
import { Slider } from "../../ui/slider";
import { CanvasType, Display } from "../../ui/display";
import { Label } from "../../ui/label";
import { Align } from "../../common/enums";
import { Select } from "../../ui/select";
import { Color } from "../../core/color";

export class SpectrogramAnalyser extends Node {
  colorScaleSelect: Select;
  fftSizeSlider: Slider;
  fftSizeLabel: Label;
  display: Display;

  analyser: AnalyserNode;

  static DefaultProps = { fftSize: 11, colorScale: 'Heated Metal' };

  colorScales = ['Heated Metal', 'Monochrome', 'Inverted Monochrome', 'Spectrum'];
  fftSizes = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
  timerId: number;

  colorScaleToInterp: { [scale: string]: Function } = {
    'Heated Metal': Function,
    'Monochrome': Function,
    'Inverted Monochrome': Function,
    'Spectrum': Function
  }
  currInterpolator: Function;

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Spectrogram Analyser',
      options.position || new Vector2(50, 50),
      options.width || 350,
      [{ name: 'in', dataType: 'audio' }], [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {},
        props: options.props ? { ...SpectrogramAnalyser.DefaultProps, ...options.props } : SpectrogramAnalyser.DefaultProps
      }
    )

    this.analyser = flow.flowConnect.audioContext.createAnalyser();
    this.analyser.fftSize = this.getFFTSize();
    this.inputs[0].ref = this.outputs[0].ref = this.analyser;

    this.setupUI();

    this.watch('fftSize', (_oldVal, newVal) => {
      if (newVal < 5 || newVal > 15) this.props.fftSize = clamp(Math.round(newVal), 5, 15);
      let actualFFTSize = this.getFFTSize();
      this.fftSizeLabel.text = actualFFTSize;
      this.analyser.fftSize = actualFFTSize;
    });
    this.watch('colorScale', (_oldVal, newVal) => {
      if (!this.colorScales.includes(newVal)) this.props.colorScale = this.colorScales[0];
      this.currInterpolator = this.colorScaleToInterp[this.props.colorScale];
    });

    this.handleAudioConnections();

    this.colorScaleToInterp['Heated Metal'] = Color.scale([
      [0, 0, 0, 1], [160, 32, 240, 1], [255, 0, 0, 1], [255, 165, 0, 1], [255, 255, 0, 1], [255, 255, 255, 1]
    ]);
    this.colorScaleToInterp['Monochrome'] = Color.scale([
      [0, 0, 0, 1], [255, 255, 255, 1]
    ]);
    this.colorScaleToInterp['Inverted Monochrome'] = Color.scale([
      [255, 255, 255, 1], [0, 0, 0, 1]
    ]);
    this.colorScaleToInterp['Spectrum'] = Color.scale([
      [135, 206, 235, 1], [0, 255, 0, 1], [255, 255, 0, 1], [255, 165, 0, 1], [255, 0, 0, 1]
    ]);

    this.currInterpolator = this.colorScaleToInterp['Heated Metal'];

    this.display.offCanvasConfigs[0].shouldRender = false;
    this.flow.flowConnect.on('start', () => {
      this.display.offCanvasConfigs[0].shouldRender = true;
    });
    this.flow.flowConnect.on('stop', () => {
      this.display.offCanvasConfigs[0].shouldRender = false;
    });
  }

  getFFTSize() {
    return this.fftSizes[clamp(Math.round(this.props.fftSize), 5, 15) - 5];
  }

  setupUI() {
    this.fftSizeSlider = this.createSlider(5, 15, { height: 10, propName: 'fftSize', style: { grow: .6, precision: 0 } });
    this.fftSizeLabel = this.createLabel(this.getFFTSize(), { height: 20, style: { grow: .2, align: Align.Right } });
    this.display = this.createDisplay(200, [{
      auto: true,
      canvasType: CanvasType.HTMLCanvasElement,
      renderer: (context, width, height) => this.customRenderer(context, width, height)
    }]);
    this.colorScaleSelect = this.createSelect(this.colorScales, { propName: 'colorScale', height: 15, style: { grow: .6 } });

    this.ui.append([
      this.display,
      this.createHozLayout([
        this.createLabel('FFT Size', { style: { grow: .2 } }), this.fftSizeSlider, this.fftSizeLabel
      ], { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Color Scale', { style: { grow: .2 } }), this.colorScaleSelect], { style: { spacing: 5 } })
    ]);
  }

  customRenderer(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, width: number, height: number): boolean {
    let value,
      i = 0,
      frequencyBinCount = this.analyser.frequencyBinCount,
      frequencyData = new Uint8Array(frequencyBinCount),
      barHeight = height / frequencyBinCount;

    this.analyser.getByteFrequencyData(frequencyData);

    for (; i < frequencyBinCount; i++) {
      value = frequencyData[i];
      context.fillStyle = this.currInterpolator(value / 256);
      context.fillRect(width - 1, denormalize(1 - normalize(i, 0, frequencyBinCount), 0, height), 1, barHeight);
    }

    context.globalCompositeOperation = "copy";
    context.drawImage(context.canvas, -1, 0);
    context.globalCompositeOperation = "source-over";

    return true;
  }

  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
