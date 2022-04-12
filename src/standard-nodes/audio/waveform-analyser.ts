import { Flow } from "../../core/flow";
import { Vector } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp } from "../../utils/utils";
import { Node } from '../../core/node';
import { Align } from "../../common/enums";
import { Slider, Display, Label } from "../../ui/index";

export class WaveformAnalyser extends Node {
  fftSizeSlider: Slider;
  fftSizeLabel: Label;
  display: Display;

  analyser: AnalyserNode;

  static DefaultState = { fftSize: 11 };

  fftSizes = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Waveform Analyser',
      options.position || new Vector(50, 50),
      options.width || 350,
      [{ name: 'in', dataType: 'audio' }], [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {},
        state: options.state ? { ...WaveformAnalyser.DefaultState, ...options.state } : WaveformAnalyser.DefaultState
      }
    )

    this.analyser = flow.flowConnect.audioContext.createAnalyser();
    this.analyser.fftSize = this.getFFTSize();
    this.inputs[0].ref = this.outputs[0].ref = this.analyser;

    this.setupUI();

    this.watch('fftSize', (_oldVal, newVal) => {
      if (newVal < 5 || newVal > 15) this.state.fftSize = clamp(Math.round(newVal), 5, 15);
      let actualFFTSize = this.getFFTSize();
      this.fftSizeLabel.text = actualFFTSize;
      this.analyser.fftSize = actualFFTSize;
    });

    this.handleAudioConnections();
  }

  getFFTSize() {
    return this.fftSizes[clamp(Math.round(this.state.fftSize), 5, 15) - 5];
  }

  setupUI() {
    this.fftSizeSlider = this.createSlider(5, 15, { height: 10, propName: 'fftSize', style: { grow: .6, precision: 0 } });
    this.fftSizeLabel = this.createLabel(this.getFFTSize(), { height: 20, style: { grow: .2, align: Align.Right } });
    this.display = this.createDisplay(200, [{
      auto: true,
      clear: true,
      renderer: (...args) => this.customRenderer(args[0], args[1], args[2])
    }]);

    this.ui.append([
      this.display,
      this.createHozLayout([
        this.createLabel('FFT Size', { style: { grow: .2 } }), this.fftSizeSlider, this.fftSizeLabel
      ], { style: { spacing: 5 } })
    ]);
  }

  customRenderer(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, width: number, height: number): boolean {
    let value, percent, offset, barWidth,
      frequencyBinCount = this.analyser.frequencyBinCount,
      waveformData = new Uint8Array(frequencyBinCount),
      orgHeight = height,
      i = 1;

    this.analyser.getByteTimeDomainData(waveformData);

    value = waveformData[0];
    percent = value / 256;
    height = orgHeight * percent;
    offset = orgHeight - height - 1;
    barWidth = width / frequencyBinCount;

    context.strokeStyle = "#000";
    context.beginPath();
    context.moveTo(0, offset);
    for (; i < frequencyBinCount; i++) {
      value = waveformData[i];
      percent = value / 256;
      height = orgHeight * percent;
      offset = orgHeight - height - 1;
      barWidth = width / frequencyBinCount;
      context.lineTo(i * barWidth, offset);
    }
    context.stroke();

    return true;
  }

  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
